import type { DictionaryEntry, DictSense, PartOfSpeechBlock } from "./types";
import { fetchWithTimeout } from "./http";
import { normalize as stripAccents } from "./text";

const USER_AGENT =
  "SobreMiDiccionario/1.0 (https://github.com/; contacto: samueq3fh5gt@gmail.com)";

const POS_ALLOW =
  /^(Sustantivo|Adjetivo|Verbo|Adverbio|Pronombre|Preposici[oó]n|Conjunci[oó]n|Interjecci[oó]n|Art[ií]culo|Numeral|Forma)/i;

const TRANSIENT_STATUS = new Set([429, 502, 503, 504]);

/**
 * The games pool hits Wiktionary far more often than the once-a-day
 * challenge did, so a single transient 502/503 now costs more (a missing
 * candidate the pool has to fill some other way). One short retry recovers
 * most of those, mirroring the same pattern already used for the English
 * dictionary in en.ts.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init);
      if (res.ok || !TRANSIENT_STATUS.has(res.status)) return res;
    } catch {
      // falls through to retry/return null below
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Slices the text between a level-2 `== Title ==` heading and the next one. */
function extractLevel2Section(text: string, title: string): string | null {
  const headerRe = /^==\s*([^=].*?)\s*==$/gm;
  const positions: { title: string; index: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headerRe.exec(text))) {
    positions.push({ title: match[1].trim(), index: match.index, end: match.index + match[0].length });
  }
  const found = positions.findIndex((p) => p.title.toLowerCase() === title.toLowerCase());
  if (found === -1) return null;
  const start = positions[found].end;
  const end = found + 1 < positions.length ? positions[found + 1].index : text.length;
  return text.slice(start, end);
}

/** Finds level-3 (===) and level-4 (====) headers within a section and their content ranges. */
function splitHeaders(
  section: string,
): { level: number; title: string; start: number; end: number }[] {
  const headerRe = /^(={3,4})\s*([^=].*?)\s*\1$/gm;
  const headers: { level: number; title: string; index: number; headerEnd: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headerRe.exec(section))) {
    headers.push({
      level: match[1].length,
      title: match[2].trim(),
      index: match.index,
      headerEnd: match.index + match[0].length,
    });
  }
  return headers.map((h, i) => ({
    level: h.level,
    title: h.title,
    start: h.headerEnd,
    end: i + 1 < headers.length ? headers[i + 1].index : section.length,
  }));
}

function parseSenses(block: string): DictSense[] {
  const lines = block.split("\n").map((l) => l.trim());
  const senses: DictSense[] = [];
  let current: DictSense | null = null;
  let collecting = false;

  // Instead of a real comma-separated list, Wiktionary often leaves a
  // "véase X en nuestro tesauro" (or similar) placeholder when no synonyms
  // are documented yet. That text isn't a word, so it must never end up as
  // a clickable chip.
  const PLACEHOLDER_NOTE = /v[eé]ase|tesauro|no (?:se )?(?:han?|hay) encontrad/i;

  // Some entries tack on a regional note, e.g. "piche (Venezuela)" — real
  // synonym, but the parenthetical breaks it as a clickable chip / search
  // term, so it's stripped rather than dropping the whole word.
  const REGIONAL_NOTE = /\s*\([^)]*\)\s*$/;

  const splitList = (raw: string) => {
    const cleaned = raw.replace(/\.$/, "").trim();
    if (!cleaned || PLACEHOLDER_NOTE.test(cleaned)) return [];
    return cleaned
      .split(",")
      .map((s) => s.replace(REGIONAL_NOTE, "").trim())
      .filter(Boolean)
      .filter((s) => !PLACEHOLDER_NOTE.test(s));
  };

  for (const line of lines) {
    if (!line) continue;
    const numberMatch = /^(\d{1,2})\b\s*(.*)$/.exec(line);
    if (numberMatch && Number(numberMatch[1]) <= 60) {
      if (current && current.definition) senses.push(current);
      current = { definition: "" };
      collecting = true;
      const rest = numberMatch[2].trim();
      if (rest) current.definition = rest;
      continue;
    }
    if (!current) continue;

    const synMatch = /^Sin[oó]nimos?:\s*(.+)$/i.exec(line);
    const antMatch = /^Ant[oó]nimos?:\s*(.+)$/i.exec(line);
    const exampleMatch = /^Ejemplo:\s*(.+)$/i.exec(line);

    if (synMatch) {
      current.synonyms = splitList(synMatch[1]);
      collecting = false;
    } else if (antMatch) {
      current.antonyms = splitList(antMatch[1]);
      collecting = false;
    } else if (exampleMatch) {
      current.example = exampleMatch[1].trim();
      collecting = false;
    } else if (/^(Uso|V[eé]ase|Nota|Cultismo|Etimolog[ií]a|Relacionado)\s*:/i.test(line)) {
      collecting = false;
    } else if (collecting) {
      current.definition = current.definition ? `${current.definition} ${line}` : line;
    }
  }
  if (current && current.definition) senses.push(current);
  return senses;
}

async function fetchExtract(title: string): Promise<{ pageTitle: string; text: string } | null> {
  const url = `https://es.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
    title,
  )}&prop=extracts&explaintext=1&redirects=1&format=json&formatversion=2`;

  try {
    const res = await fetchWithRetry(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res || !res.ok) return null;

    const data = await res.json();
    const page = data?.query?.pages?.[0];
    if (!page || page.missing || !page.extract) return null;

    return { pageTitle: page.title ?? title, text: decodeEntities(page.extract as string) };
  } catch {
    return null;
  }
}

/** "did you mean" style suggestions; good at typos, weak at accent-folding. */
async function fetchOpenSearchTitles(word: string): Promise<string[]> {
  const url = `https://es.wiktionary.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    word,
  )}&limit=5&namespace=0&format=json`;

  try {
    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[]];
    return data[1] ?? [];
  } catch {
    return [];
  }
}

/** Full-text title search; good at accent-folding (e.g. "telefono" -> "teléfono"). */
async function fetchFullTextTitles(word: string): Promise<string[]> {
  const url = `https://es.wiktionary.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    `intitle:${word}`,
  )}&srnamespace=0&srlimit=6&format=json&formatversion=2`;

  try {
    const res = await fetchWithTimeout(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = (data?.query?.search ?? []) as { title: string }[];
    return results.map((r) => r.title);
  } catch {
    return [];
  }
}

/**
 * Used as a fallback when an exact title lookup misses: combines both
 * search strategies since they cover different failure modes (typos vs.
 * missing accents) and neither alone is reliable enough.
 */
async function findCandidateTitles(word: string): Promise<string[]> {
  const [opensearchTitles, fullTextTitles] = await Promise.all([
    fetchOpenSearchTitles(word),
    fetchFullTextTitles(word),
  ]);
  return Array.from(new Set([...opensearchTitles, ...fullTextTitles]));
}

function parseEntry(pageTitle: string, text: string): DictionaryEntry | null {
  const spanishSection = extractLevel2Section(text, "Español");
  if (!spanishSection) return null;

  const headers = splitHeaders(spanishSection);
  const blocks: PartOfSpeechBlock[] = [];
  let etymology: string | undefined;

  for (const header of headers) {
    if (header.level === 3 && /^Etimolog[ií]a/i.test(header.title) && !etymology) {
      const content = spanishSection.slice(header.start, header.end).trim();
      const firstLine = content
        .split("\n")
        .map((l) => l.trim())
        .find(Boolean);
      if (firstLine && !/^(Si puedes|V[eé]ase)/i.test(firstLine)) etymology = firstLine;
    }
    if ((header.level === 3 || header.level === 4) && POS_ALLOW.test(header.title)) {
      const content = spanishSection.slice(header.start, header.end);
      const senses = parseSenses(content);
      if (senses.length) blocks.push({ partOfSpeech: header.title, senses });
    }
  }

  if (!blocks.length) return null;

  const synonyms = Array.from(
    new Set(blocks.flatMap((b) => b.senses.flatMap((s) => s.synonyms ?? []))),
  );
  const antonyms = Array.from(
    new Set(blocks.flatMap((b) => b.senses.flatMap((s) => s.antonyms ?? []))),
  );

  return {
    word: pageTitle,
    language: "es",
    etymology,
    blocks,
    synonyms,
    antonyms,
    sourceUrl: `https://es.wiktionary.org/wiki/${encodeURIComponent(pageTitle)}`,
    sourceLabel: "Wikcionario en español",
  };
}

export async function fetchSpanishEntry(word: string): Promise<DictionaryEntry | null> {
  const direct = await fetchExtract(word);
  if (direct) {
    const entry = parseEntry(direct.pageTitle, direct.text);
    if (entry) return entry;
  }

  const candidates = await findCandidateTitles(word);
  const normalizedWord = stripAccents(word);
  // An accent-insensitive exact match (e.g. "telefono" -> "teléfono") is far
  // more likely to be what the user meant than a same-prefix superstring
  // match (e.g. "telefonofobia"), so try those first.
  const ranked = [...candidates].sort(
    (a, b) => Number(stripAccents(a) !== normalizedWord) - Number(stripAccents(b) !== normalizedWord),
  );

  for (const title of ranked) {
    if (title.toLowerCase() === word.toLowerCase()) continue;
    const alt = await fetchExtract(title);
    if (!alt) continue;
    const entry = parseEntry(alt.pageTitle, alt.text);
    if (entry) return entry;
  }

  return null;
}
