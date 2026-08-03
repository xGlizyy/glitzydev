import { STOPWORDS } from "@/lib/study/stopwords";
import type { StudyPack, ExamQuestion } from "@/lib/study/types";

const MAX_INPUT_LENGTH = 200_000;
const MIN_WORD_LENGTH = 3;
const MIN_ANSWER_WORD_LENGTH = 4;
const MIN_SENTENCE_WORDS = 6;

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

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡0-9])/)
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

function contentWords(tokens: Token[], minLength = MIN_WORD_LENGTH): string[] {
  return tokens
    .map((t) => t.word)
    .filter((w) => w.length >= minLength && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

function computeWordFreq(sentenceTokens: Token[][]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const tokens of sentenceTokens) {
    for (const w of contentWords(tokens)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}

function scoreSentence(tokens: Token[], freq: Map<string, number>): number {
  const words = contentWords(tokens);
  if (words.length === 0) return 0;
  const sum = words.reduce((acc, w) => acc + (freq.get(w) ?? 0), 0);
  return sum / Math.sqrt(words.length);
}

function buildSummary(scored: ScoredSentence[]): string {
  const count = clamp(Math.round(scored.length * 0.25), 4, 10);
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, Math.min(count, scored.length));
  top.sort((a, b) => a.index - b.index);
  return top.map((s) => s.text).join(" ");
}

function buildQuestions(
  sentences: string[],
  sentenceTokens: Token[][],
  scored: ScoredSentence[],
  freq: Map<string, number>,
): ExamQuestion[] {
  const targetCount = clamp(Math.round(sentences.length * 0.3), 5, 10);
  const candidates = [...scored].sort((a, b) => b.score - a.score);

  const questions: ExamQuestion[] = [];
  const usedAnswers = new Set<string>();

  for (const candidate of candidates) {
    if (questions.length >= targetCount) break;

    const tokens = sentenceTokens[candidate.index];
    const uniqueWords = [...new Set(contentWords(tokens, MIN_ANSWER_WORD_LENGTH))];
    const rankedWords = uniqueWords.sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0));
    const chosen = rankedWords.find((w) => !usedAnswers.has(w));
    if (!chosen) continue;

    const token = tokens.find((t) => t.word === chosen);
    if (!token) continue;

    const sentence = sentences[candidate.index];
    const original = sentence.slice(token.start, token.end);
    const question = `${sentence.slice(0, token.start)}_____${sentence.slice(token.end)}`;

    questions.push({ question, answer: original });
    usedAnswers.add(chosen);
  }

  return questions;
}

export function generateStudyPack(documentText: string): StudyPack {
  const cleaned = cleanText(documentText.slice(0, MAX_INPUT_LENGTH));
  const sentences = splitSentences(cleaned);
  const sentenceTokens = sentences.map(tokenizeWithPositions);

  const usable = sentences
    .map((text, index) => ({ text, index }))
    .filter(({ index }) => contentWords(sentenceTokens[index]).length >= MIN_SENTENCE_WORDS - 3 && sentenceTokens[index].length >= MIN_SENTENCE_WORDS);

  if (usable.length === 0) {
    return { summary: "", questions: [] };
  }

  const freq = computeWordFreq(usable.map(({ index }) => sentenceTokens[index]));
  const scored: ScoredSentence[] = usable.map(({ text, index }) => ({
    text,
    index,
    score: scoreSentence(sentenceTokens[index], freq),
  }));

  const summary = buildSummary(scored);
  const questions = buildQuestions(sentences, sentenceTokens, scored, freq);

  return { summary, questions };
}
