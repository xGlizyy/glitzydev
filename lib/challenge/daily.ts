import { fetchSpanishEntry } from "@/lib/dictionary/es";
import { normalize, isCleanTerm } from "@/lib/dictionary/text";
import { mulberry32, hashString, seededShuffle } from "@/lib/random";
import { buildSynAntQuestion } from "@/lib/games/build";
import { WORD_BANK } from "./wordBank";
import type { DailyChallenge } from "./types";

const QUESTIONS_PER_DAY = 5;

function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type Candidate = {
  word: string;
  synonyms: string[];
  antonyms: string[];
};

/**
 * Picks the day's words deterministically from WORD_BANK (same for every
 * visitor), then fetches real synonym/antonym data from Wiktionary so the
 * challenge always reflects the live dictionary instead of a stale list.
 */
const FETCH_BATCH_SIZE = 8;

async function collectCandidates(shuffledBank: string[]): Promise<{
  candidates: Candidate[];
  distractorPool: Set<string>;
}> {
  const candidates: Candidate[] = [];
  const distractorPool = new Set<string>();

  // Fetched in small parallel batches (not all at once, not one by one):
  // a cold cache on the first visit of the day would otherwise mean ~100
  // sequential Wiktionary round-trips, risking a serverless timeout.
  for (let start = 0; start < shuffledBank.length; start += FETCH_BATCH_SIZE) {
    if (candidates.length >= QUESTIONS_PER_DAY * 2) break;

    const batch = shuffledBank.slice(start, start + FETCH_BATCH_SIZE);
    const entries = await Promise.all(
      batch.map((word) => fetchSpanishEntry(word).catch(() => null)),
    );

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const word = batch[i];
      if (!entry) continue;

      const synonyms = entry.synonyms.filter((s) => isCleanTerm(s) && normalize(s) !== normalize(word));
      const antonyms = entry.antonyms.filter((s) => isCleanTerm(s) && normalize(s) !== normalize(word));
      if (!synonyms.length && !antonyms.length) continue;

      candidates.push({ word: entry.word, synonyms, antonyms });
      for (const term of [...synonyms, ...antonyms]) distractorPool.add(term);
    }
  }

  return { candidates, distractorPool };
}

export async function getDailyChallenge(date: Date = new Date()): Promise<DailyChallenge> {
  const dateKey = dateKeyOf(date);
  const random = mulberry32(hashString(dateKey));
  const shuffledBank = seededShuffle(WORD_BANK, random);

  const { candidates, distractorPool } = await collectCandidates(shuffledBank);
  const selected = seededShuffle(candidates, random).slice(0, QUESTIONS_PER_DAY);
  const questions = selected.map((candidate) =>
    buildSynAntQuestion(candidate, distractorPool, random, WORD_BANK),
  );

  return { date: dateKey, questions };
}
