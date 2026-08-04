import { normalize } from "@/lib/dictionary/text";
import { seededShuffle } from "@/lib/random";
import type { ChallengeQuestion } from "@/lib/challenge/types";
import type { GameCandidate } from "./types";

const OPTIONS_PER_QUESTION = 4;
const RELATED_GROUP_SIZE = 3; // base word + 2 synonyms, plus 1 intruder = 4 options

type SynAntCandidate = Pick<GameCandidate, "word" | "synonyms" | "antonyms">;

export type DefinitionQuestion = {
  word: string;
  definition: string;
  example?: string;
  options: string[];
  correctIndex: number;
};

export type IntrusoQuestion = {
  words: string[];
  intruderIndex: number;
  relatedWord: string;
};

/**
 * Picks up to `count` distractor words for `correctWord`, trying each pool in
 * priority order (e.g. real synonym/antonym terms before a generic fallback
 * bank) before moving to the next, so higher-quality distractors win when
 * available.
 */
function pickDistractorWords(
  pools: string[][],
  correctWord: string,
  exclude: Set<string>,
  count: number,
  random: () => number,
): string[] {
  const correctKey = normalize(correctWord);
  const chosen: string[] = [];
  const chosenKeys = new Set<string>();

  for (const pool of pools) {
    if (chosen.length >= count) break;
    for (const word of seededShuffle(pool, random)) {
      if (chosen.length >= count) break;
      const key = normalize(word);
      if (key === correctKey || exclude.has(key) || chosenKeys.has(key)) continue;
      chosen.push(word);
      chosenKeys.add(key);
    }
  }

  return chosen;
}

/** Shared by Reto diario and Contrarreloj: "¿cuál es un sinónimo/antónimo de X?" */
export function buildSynAntQuestion(
  candidate: SynAntCandidate,
  distractorPool: Set<string>,
  random: () => number,
  fallbackBank: string[],
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

  const distractors = pickDistractorWords(
    [Array.from(distractorPool), fallbackBank],
    correctAnswer,
    exclude,
    OPTIONS_PER_QUESTION - 1,
    random,
  );

  const options = seededShuffle([correctAnswer, ...distractors], random);
  const correctIndex = options.findIndex((option) => normalize(option) === normalize(correctAnswer));

  return { word: candidate.word, type, options, correctIndex };
}

/** "¿Qué palabra define...?" — real Wiktionary definition, 4 word options. */
export function buildDefinitionQuestion(
  candidate: GameCandidate,
  pool: GameCandidate[],
  random: () => number,
): DefinitionQuestion {
  const exclude = new Set([
    normalize(candidate.word),
    ...candidate.synonyms.map(normalize),
    ...candidate.antonyms.map(normalize),
  ]);

  const otherWords = pool.filter((c) => c.word !== candidate.word).map((c) => c.word);
  const distractors = pickDistractorWords(
    [otherWords],
    candidate.word,
    exclude,
    OPTIONS_PER_QUESTION - 1,
    random,
  );

  const options = seededShuffle([candidate.word, ...distractors], random);
  const correctIndex = options.findIndex((option) => normalize(option) === normalize(candidate.word));

  return {
    word: candidate.word,
    definition: candidate.definition,
    example: candidate.example,
    options,
    correctIndex,
  };
}

/** "¿Cuál es el intruso?" — a synonym cluster plus one unrelated word. */
export function buildIntrusoQuestion(pool: GameCandidate[], random: () => number): IntrusoQuestion | null {
  const eligible = pool.filter((c) => c.synonyms.length >= RELATED_GROUP_SIZE - 1);
  if (!eligible.length) return null;

  const base = eligible[Math.floor(random() * eligible.length)];
  const relatedSynonyms = seededShuffle(base.synonyms, random).slice(0, RELATED_GROUP_SIZE - 1);
  const related = [base.word, ...relatedSynonyms];

  const exclude = new Set([...related.map(normalize), ...base.antonyms.map(normalize)]);
  const otherCandidates = pool.filter((c) => c.word !== base.word);
  const intruderPool = [
    ...otherCandidates.map((c) => c.word),
    ...otherCandidates.flatMap((c) => c.antonyms),
  ];

  const [intruder] = pickDistractorWords([intruderPool], base.word, exclude, 1, random);
  if (!intruder) return null;

  const intruderIndex = Math.floor(random() * (related.length + 1));
  const words = [...related.slice(0, intruderIndex), intruder, ...related.slice(intruderIndex)];

  return { words, intruderIndex, relatedWord: base.word };
}

const ROUND_SIZE = 8;
const SPEED_ROUND_SIZE = 40;

/** A fresh round of Definición questions, one per (distinct) candidate. */
export function buildDefinitionRound(
  pool: GameCandidate[],
  random: () => number,
  count = ROUND_SIZE,
): DefinitionQuestion[] {
  const chosen = seededShuffle(pool, random).slice(0, Math.min(count, pool.length));
  return chosen.map((candidate) => buildDefinitionQuestion(candidate, pool, random));
}

/** A fresh round of Intruso questions, avoiding repeating the same base word twice. */
export function buildIntrusoRound(
  pool: GameCandidate[],
  random: () => number,
  count = ROUND_SIZE,
): IntrusoQuestion[] {
  const questions: IntrusoQuestion[] = [];
  const usedBaseWords = new Set<string>();
  let guard = 0;

  while (questions.length < count && guard < pool.length * 3) {
    guard++;
    const question = buildIntrusoQuestion(pool, random);
    if (!question) break;
    const key = normalize(question.relatedWord);
    if (usedBaseWords.has(key)) continue;
    usedBaseWords.add(key);
    questions.push(question);
  }

  return questions;
}

/**
 * A large buffer of syn/ant questions for Contrarreloj — cycles through the
 * pool (each pass can yield a different type/answer thanks to `random`) so a
 * 60s round never runs out before the clock does.
 */
export function buildSynAntRound(
  pool: GameCandidate[],
  fallbackBank: string[],
  random: () => number,
  count = SPEED_ROUND_SIZE,
): ChallengeQuestion[] {
  if (!pool.length) return [];

  const distractorPool = new Set(pool.flatMap((c) => [...c.synonyms, ...c.antonyms]));
  const shuffled = seededShuffle(pool, random);
  const questions: ChallengeQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const candidate = shuffled[i % shuffled.length];
    questions.push(buildSynAntQuestion(candidate, distractorPool, random, fallbackBank));
  }

  return questions;
}
