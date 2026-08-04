import { fetchSpanishEntry } from "@/lib/dictionary/es";
import { WORD_BANK } from "./wordBank";
import type { ChallengeQuestion, DailyChallenge } from "./types";

const QUESTIONS_PER_DAY = 5;
const OPTIONS_PER_QUESTION = 4;

function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Mulberry32: tiny seeded PRNG so every visitor gets the same shuffle for a given date. */
function mulberry32(seed: number) {
  let state = seed | 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0;
  }
  return hash;
}

function seededShuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalize(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Wiktionary synonym/antonym lists sometimes carry regional notes like
// "fallo (Venezuela —Oriente—)" or multi-word glosses — fine as reference
// text on the dictionary page, but confusing as a standalone quiz option.
const CLEAN_TERM = /^[a-záéíóúüñ]+(?:[ -][a-záéíóúüñ]+){0,2}$/i;

function isCleanTerm(term: string): boolean {
  return CLEAN_TERM.test(term.trim());
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

function buildQuestion(
  candidate: Candidate,
  distractorPool: Set<string>,
  random: () => number,
): ChallengeQuestion {
  const canAskSynonym = candidate.synonyms.length > 0;
  const canAskAntonym = candidate.antonyms.length > 0;
  const type =
    canAskSynonym && canAskAntonym
      ? random() < 0.5
        ? "sinonimo"
        : "antonimo"
      : canAskSynonym
        ? "sinonimo"
        : "antonimo";

  const correctPool = type === "sinonimo" ? candidate.synonyms : candidate.antonyms;
  const correctAnswer = correctPool[Math.floor(random() * correctPool.length)];

  const exclude = new Set([
    normalize(candidate.word),
    normalize(correctAnswer),
    ...candidate.synonyms.map(normalize),
    ...candidate.antonyms.map(normalize),
  ]);

  const distractorCandidates = seededShuffle(Array.from(distractorPool), random).filter(
    (term) => !exclude.has(normalize(term)),
  );
  const distractors = distractorCandidates.slice(0, OPTIONS_PER_QUESTION - 1);

  let guard = 0;
  while (distractors.length < OPTIONS_PER_QUESTION - 1 && guard < WORD_BANK.length) {
    const fallback = WORD_BANK[Math.floor(random() * WORD_BANK.length)];
    guard++;
    if (exclude.has(normalize(fallback))) continue;
    if (distractors.some((d) => normalize(d) === normalize(fallback))) continue;
    distractors.push(fallback);
  }

  const options = seededShuffle([correctAnswer, ...distractors], random);
  const correctIndex = options.findIndex((option) => normalize(option) === normalize(correctAnswer));

  return { word: candidate.word, type, options, correctIndex };
}

export async function getDailyChallenge(date: Date = new Date()): Promise<DailyChallenge> {
  const dateKey = dateKeyOf(date);
  const random = mulberry32(hashString(dateKey));
  const shuffledBank = seededShuffle(WORD_BANK, random);

  const { candidates, distractorPool } = await collectCandidates(shuffledBank);
  const selected = seededShuffle(candidates, random).slice(0, QUESTIONS_PER_DAY);
  const questions = selected.map((candidate) => buildQuestion(candidate, distractorPool, random));

  return { date: dateKey, questions };
}
