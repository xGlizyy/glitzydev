import type { DictionaryEntry, DictSense, PartOfSpeechBlock } from "./types";
import { fetchWithTimeout } from "./http";

const TRANSIENT_STATUS = new Set([429, 502, 503, 504]);

/**
 * dictionaryapi.dev intermittently answers even well-known words with a
 * transient 502/503 (verified by re-requesting "better"/"geese" repeatedly —
 * a real word retried in isolation eventually succeeds). One short retry
 * recovers most of those without the risk a stemming-based fallback would
 * add (most inflected forms, e.g. "running"/"studies"/"children", already
 * resolve directly and don't need one).
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

type RawDefinition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

type RawMeaning = {
  partOfSpeech: string;
  definitions: RawDefinition[];
};

type RawEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings: RawMeaning[];
};

async function fetchDatamuse(word: string, rel: "syn" | "ant"): Promise<string[]> {
  try {
    const res = await fetchWithRetry(
      `https://api.datamuse.com/words?rel_${rel}=${encodeURIComponent(word)}&max=12`,
      { next: { revalidate: 3600 } },
    );
    if (!res || !res.ok) return [];
    const data = (await res.json()) as { word: string }[];
    return data.map((d) => d.word);
  } catch {
    return [];
  }
}

export async function fetchEnglishEntry(word: string): Promise<DictionaryEntry | null> {
  const [dictRes, synonyms, antonyms] = await Promise.all([
    fetchWithRetry(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      next: { revalidate: 3600 },
    }).catch(() => null),
    fetchDatamuse(word, "syn"),
    fetchDatamuse(word, "ant"),
  ]);

  let entries: RawEntry[] = [];
  if (dictRes && dictRes.ok) {
    entries = (await dictRes.json()) as RawEntry[];
  }

  if (!entries.length && !synonyms.length && !antonyms.length) return null;

  const blocks: PartOfSpeechBlock[] = entries.flatMap((entry) =>
    entry.meanings.map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech,
      senses: meaning.definitions.map<DictSense>((def) => ({
        definition: def.definition,
        example: def.example,
        synonyms: def.synonyms?.length ? def.synonyms : undefined,
        antonyms: def.antonyms?.length ? def.antonyms : undefined,
      })),
    })),
  );

  if (!blocks.length && !synonyms.length && !antonyms.length) return null;

  const phonetic = entries[0]?.phonetic ?? entries[0]?.phonetics?.find((p) => p.text)?.text;
  const definitionSynonyms = blocks.flatMap((b) => b.senses.flatMap((s) => s.synonyms ?? []));
  const definitionAntonyms = blocks.flatMap((b) => b.senses.flatMap((s) => s.antonyms ?? []));

  return {
    word: entries[0]?.word ?? word,
    language: "en",
    phonetic,
    blocks,
    synonyms: Array.from(new Set([...synonyms, ...definitionSynonyms])).slice(0, 20),
    antonyms: Array.from(new Set([...antonyms, ...definitionAntonyms])).slice(0, 20),
    sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
    sourceLabel: "Free Dictionary API + Datamuse",
  };
}
