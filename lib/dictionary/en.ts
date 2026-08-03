import type { DictionaryEntry, DictSense, PartOfSpeechBlock } from "./types";

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
    const res = await fetch(
      `https://api.datamuse.com/words?rel_${rel}=${encodeURIComponent(word)}&max=12`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { word: string }[];
    return data.map((d) => d.word);
  } catch {
    return [];
  }
}

export async function fetchEnglishEntry(word: string): Promise<DictionaryEntry | null> {
  const [dictRes, synonyms, antonyms] = await Promise.all([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
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
