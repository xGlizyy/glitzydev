export type DictSense = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

export type PartOfSpeechBlock = {
  partOfSpeech: string;
  senses: DictSense[];
};

export type DictionaryEntry = {
  word: string;
  language: "es" | "en";
  phonetic?: string;
  etymology?: string;
  blocks: PartOfSpeechBlock[];
  synonyms: string[];
  antonyms: string[];
  sourceUrl: string;
  sourceLabel: string;
};

export type LookupResponse = {
  query: string;
  es: DictionaryEntry | null;
  en: DictionaryEntry | null;
};
