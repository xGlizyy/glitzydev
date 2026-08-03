import type { DictionaryEntry, DictSense, PartOfSpeechBlock } from "./types";

const USER_AGENT =
  "SobreMiDiccionario/1.0 (https://github.com/; contacto: samueq3fh5gt@gmail.com)";

const POS_ALLOW =
  /^(Sustantivo|Adjetivo|Verbo|Adverbio|Pronombre|Preposici[oó]n|Conjunci[oó]n|Interjecci[oó]n|Art[ií]culo|Numeral|Forma)/i;

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

  const splitList = (raw: string) =>
    raw
      .replace(/\.$/, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

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
    } else if (/^(Uso|V[eé]ase|Nota|Cultismo|Etimolog[ií]a)\s*:/i.test(line)) {
      collecting = false;
    } else if (collecting) {
      current.definition = current.definition ? `${current.definition} ${line}` : line;
    }
  }
  if (current && current.definition) senses.push(current);
  return senses;
}

export async function fetchSpanishEntry(word: string): Promise<DictionaryEntry | null> {
  const url = `https://es.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
    word,
  )}&prop=extracts&explaintext=1&redirects=1&format=json&formatversion=2`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const page = data?.query?.pages?.[0];
  if (!page || page.missing || !page.extract) return null;

  const text = decodeEntities(page.extract as string);
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
    word: page.title ?? word,
    language: "es",
    etymology,
    blocks,
    synonyms,
    antonyms,
    sourceUrl: `https://es.wiktionary.org/wiki/${encodeURIComponent(word)}`,
    sourceLabel: "Wikcionario en español",
  };
}
