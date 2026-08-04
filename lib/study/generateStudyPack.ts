import {
  LANGUAGE_HINTS_EN,
  LANGUAGE_HINTS_ES,
  STOPWORDS_EN,
  STOPWORDS_ES,
} from "@/lib/study/stopwords";
import type { StudyPack, ExamQuestion } from "@/lib/study/types";

const MAX_INPUT_LENGTH = 200_000;
const MIN_WORD_LENGTH = 3;
const MIN_ANSWER_WORD_LENGTH = 4;
const MIN_SENTENCE_WORDS = 6;
const REDUNDANCY_PENALTY = 0.5;

type Token = { word: string; start: number; end: number };
type ScoredSentence = { text: string; index: number; score: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cleanText(raw: string): string {
  return raw
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Guesses whether the document is mostly Spanish or English by counting a
 * small set of highly language-specific function words, so the right
 * stopword list gets used instead of one blended set that dilutes both
 * languages (a mixed list under-filters "is/the/of" in English text and
 * "de/que/el" in Spanish text alike).
 */
function detectLanguage(text: string): "es" | "en" {
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  let esHits = 0;
  let enHits = 0;
  for (const w of words) {
    if (LANGUAGE_HINTS_ES.has(w)) esHits++;
    if (LANGUAGE_HINTS_EN.has(w)) enHits++;
  }
  return enHits > esHits ? "en" : "es";
}

// Common abbreviations that end in a period without ending a sentence —
// without this, "Dr. García" or "EE. UU." get cut mid-thought because the
// splitter only looks for [.!?] followed by whitespace + a capital letter.
const SENTENCE_SPLIT_RE =
  /(?<!\b(?:Sr|Sra|Srta|Dr|Dra|Ud|Uds|vs|etc|EE|UU|Mr|Mrs|Ms|Jr)\.)(?<!p\.ej\.)(?<!a\.m\.)(?<!p\.m\.)(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡0-9])/g;

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokenizeWithPositions(sentence: string): Token[] {
  const tokens: Token[] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;
  while ((match = re.exec(sentence))) {
    tokens.push({ word: match[0].toLowerCase(), start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

function contentWords(tokens: Token[], stopwords: Set<string>, minLength = MIN_WORD_LENGTH): string[] {
  return tokens
    .map((t) => t.word)
    .filter((w) => w.length >= minLength && !stopwords.has(w) && !/^\d+$/.test(w));
}

function computeWordFreq(sentenceTokens: Token[][], stopwords: Set<string>): Map<string, number> {
  const freq = new Map<string, number>();
  for (const tokens of sentenceTokens) {
    for (const w of contentWords(tokens, stopwords)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}

function scoreSentence(tokens: Token[], freq: Map<string, number>, stopwords: Set<string>): number {
  const words = contentWords(tokens, stopwords);
  if (words.length === 0) return 0;
  const sum = words.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0);
  return sum / Math.sqrt(words.length);
}

function jaccardOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Picks summary sentences greedily (Maximal-Marginal-Relevance style):
 * each step favors a high-scoring sentence, but discounts candidates that
 * mostly repeat the content words of an already-picked sentence, so two
 * near-duplicate sentences don't both make the cut.
 */
function buildSummary(
  scored: ScoredSentence[],
  sentenceTokens: Token[][],
  stopwords: Set<string>,
): string {
  const count = clamp(Math.round(scored.length * 0.25), 4, 10);
  const target = Math.min(count, scored.length);

  const wordSetCache = new Map<number, Set<string>>();
  const wordsOf = (index: number) => {
    let set = wordSetCache.get(index);
    if (!set) {
      set = new Set(contentWords(sentenceTokens[index], stopwords));
      wordSetCache.set(index, set);
    }
    return set;
  };

  const remaining = [...scored];
  const selected: ScoredSentence[] = [];

  while (selected.length < target && remaining.length > 0) {
    let bestPos = 0;
    let bestValue = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const redundancy = selected.length
        ? Math.max(...selected.map((s) => jaccardOverlap(wordsOf(candidate.index), wordsOf(s.index))))
        : 0;
      const value = candidate.score * (1 - REDUNDANCY_PENALTY * redundancy);
      if (value > bestValue) {
        bestValue = value;
        bestPos = i;
      }
    }

    selected.push(remaining[bestPos]);
    remaining.splice(bestPos, 1);
  }

  selected.sort((a, b) => a.index - b.index);
  return selected.map((s) => s.text).join(" ");
}

function buildQuestions(
  sentences: string[],
  sentenceTokens: Token[][],
  scored: ScoredSentence[],
  freq: Map<string, number>,
  stopwords: Set<string>,
): ExamQuestion[] {
  const targetCount = clamp(Math.round(scored.length * 0.4), 5, 40);
  const candidates = [...scored].sort((a, b) => b.score - a.score);

  const questions: ExamQuestion[] = [];
  const usedAnswers = new Set<string>();

  for (const candidate of candidates) {
    if (questions.length >= targetCount) break;

    const tokens = sentenceTokens[candidate.index];
    const uniqueWords = [...new Set(contentWords(tokens, stopwords, MIN_ANSWER_WORD_LENGTH))];
    const rankedWords = uniqueWords.sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0));
    const chosen = rankedWords.find((w) => !usedAnswers.has(w));
    if (!chosen) continue;

    // Blank out every occurrence of the chosen word in the sentence — a
    // single blank would otherwise leave the answer sitting in plain sight
    // if the word appears more than once (e.g. "El gato persigue al gato").
    const matchingTokens = tokens.filter((t) => t.word === chosen);
    if (!matchingTokens.length) continue;

    const sentence = sentences[candidate.index];
    const original = sentence.slice(matchingTokens[0].start, matchingTokens[0].end);

    let question = sentence;
    for (let i = matchingTokens.length - 1; i >= 0; i--) {
      const token = matchingTokens[i];
      question = `${question.slice(0, token.start)}_____${question.slice(token.end)}`;
    }

    questions.push({ question, answer: original });
    usedAnswers.add(chosen);
  }

  return questions;
}

export function generateStudyPack(documentText: string): StudyPack {
  const cleaned = cleanText(documentText.slice(0, MAX_INPUT_LENGTH));
  const stopwords = detectLanguage(cleaned) === "en" ? STOPWORDS_EN : STOPWORDS_ES;

  const sentences = splitSentences(cleaned);
  const sentenceTokens = sentences.map(tokenizeWithPositions);

  const usable = sentences
    .map((text, index) => ({ text, index }))
    .filter(
      ({ index }) =>
        contentWords(sentenceTokens[index], stopwords).length >= MIN_SENTENCE_WORDS - 3 &&
        sentenceTokens[index].length >= MIN_SENTENCE_WORDS,
    );

  if (usable.length === 0) {
    return { summary: "", questions: [] };
  }

  const freq = computeWordFreq(
    usable.map(({ index }) => sentenceTokens[index]),
    stopwords,
  );
  const scored: ScoredSentence[] = usable.map(({ text, index }) => ({
    text,
    index,
    score: scoreSentence(sentenceTokens[index], freq, stopwords),
  }));

  const summary = buildSummary(scored, sentenceTokens, stopwords);
  const questions = buildQuestions(sentences, sentenceTokens, scored, freq, stopwords);

  return { summary, questions };
}
