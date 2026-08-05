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
// The summary targets 25%-40% of the original word count (per the study-pack
// rules), sliding within that range based on how lexically dense the source
// is — repetitive text can be compressed harder than concept-dense text.
const MIN_SUMMARY_RATIO = 0.25;
const MAX_SUMMARY_RATIO = 0.4;
const PARAGRAPH_COVERAGE_BONUS = 1.2;

type Token = { word: string; start: number; end: number };
type ScoredSentence = { text: string; index: number; score: number };
type SentenceInfo = { text: string; paragraph: number; tokens: Token[] };

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
 * Splits the document into paragraphs on blank lines, preserving the
 * source's logical grouping so the summary doesn't flatten every sentence
 * into one undifferentiated block. Falls back to a single paragraph when no
 * blank lines exist (e.g. hard-wrapped PDF text), which reproduces the
 * previous flat behavior instead of fragmenting mid-sentence on line wraps.
 */
function splitParagraphs(raw: string): string[] {
  const normalized = raw.replace(/\r\n?/g, "\n");
  const blocks = normalized
    .split(/\n[ \t]*\n+/)
    .map((p) => cleanText(p))
    .filter(Boolean);
  return blocks.length > 0 ? blocks : [cleanText(normalized)];
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

// Single-word and multi-word markers that typically introduce the
// structural content the study-pack rules call out explicitly (processes,
// phases, causes, consequences, advantages, disadvantages, requirements,
// classifications). Sentences carrying these are boosted so that content
// doesn't get dropped just because its vocabulary is less frequent overall.
const SIGNAL_WORDS_ES = new Set([
  "ventaja", "ventajas", "desventaja", "desventajas", "causa", "causas",
  "consecuencia", "consecuencias", "fase", "fases", "etapa", "etapas", "paso",
  "pasos", "tipo", "tipos", "clasificación", "clasificaciones", "requisito",
  "requisitos", "característica", "características", "función", "funciones",
  "objetivo", "objetivos", "proceso", "procesos", "resultado", "resultados",
  "fundamental", "principal", "principales", "necesario", "necesarios",
  "necesaria", "necesarias", "permite", "provoca", "genera", "produce",
  "primero", "segundo", "tercero", "finalmente", "elemento", "elementos",
]);
const SIGNAL_PHRASES_ES = [
  "por lo tanto", "en conclusión", "como resultado", "debido a",
  "se compone de", "consiste en", "se define como", "da lugar a",
  "en primer lugar", "en segundo lugar", "por otro lado", "como consecuencia",
];
const EXAMPLE_PHRASES_ES = [
  "por ejemplo", "p. ej.", "p.ej.", "tal como", "a modo de ejemplo", "como por ejemplo",
];

const SIGNAL_WORDS_EN = new Set([
  "advantage", "advantages", "disadvantage", "disadvantages", "cause", "causes",
  "consequence", "consequences", "phase", "phases", "stage", "stages", "step",
  "steps", "type", "types", "classification", "classifications", "requirement",
  "requirements", "characteristic", "characteristics", "function", "functions",
  "objective", "objectives", "process", "processes", "result", "results",
  "fundamental", "main", "principal", "necessary", "allows", "generates",
  "produces", "first", "second", "third", "finally", "element", "elements",
]);
const SIGNAL_PHRASES_EN = [
  "therefore", "in conclusion", "as a result", "due to", "consists of",
  "is defined as", "leads to", "on the other hand", "as a consequence",
];
const EXAMPLE_PHRASES_EN = ["for example", "e.g.", "such as", "for instance"];

/**
 * Multiplies a sentence's base score to favor structural content (steps,
 * causes, advantages, requirements...) and to push down example sentences,
 * which the rules treat as secondary detail to trim.
 */
function structuralAdjustment(sentenceText: string, tokens: Token[], lang: "es" | "en"): number {
  const words = new Set(tokens.map((t) => t.word));
  const signalWords = lang === "en" ? SIGNAL_WORDS_EN : SIGNAL_WORDS_ES;
  const signalPhrases = lang === "en" ? SIGNAL_PHRASES_EN : SIGNAL_PHRASES_ES;
  const examplePhrases = lang === "en" ? EXAMPLE_PHRASES_EN : EXAMPLE_PHRASES_ES;
  const lower = sentenceText.toLowerCase();

  let signalHits = 0;
  for (const w of words) if (signalWords.has(w)) signalHits++;
  for (const p of signalPhrases) if (lower.includes(p)) signalHits++;

  let factor = 1 + Math.min(signalHits, 3) * 0.12;
  if (examplePhrases.some((p) => lower.includes(p))) factor *= 0.55;
  return factor;
}

function jaccardOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Ranks the words actually used in the selected summary and returns the
 * most frequent ones (doc-wide) as the terms to bold for quick review. */
function pickKeyTerms(
  freq: Map<string, number>,
  selected: ScoredSentence[],
  sentenceInfos: SentenceInfo[],
  stopwords: Set<string>,
): string[] {
  const present = new Set<string>();
  for (const s of selected) {
    for (const w of contentWords(sentenceInfos[s.index].tokens, stopwords, MIN_ANSWER_WORD_LENGTH)) {
      present.add(w);
    }
  }
  const ranked = [...present]
    .map((w) => ({ w, count: freq.get(w) ?? 0 }))
    .filter((e) => e.count >= 2)
    .sort((a, b) => b.count - a.count);

  const take = clamp(Math.round(ranked.length * 0.25), Math.min(3, ranked.length), 15);
  return ranked.slice(0, take).map((e) => e.w);
}

function applyBold(text: string, terms: string[]): string {
  let result = text;
  for (const term of terms) {
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegExp(term)})(?![\\p{L}\\p{N}])`, "giu");
    result = result.replace(pattern, (_match, before: string, word: string) => `${before}**${word}**`);
  }
  return result;
}

/**
 * Picks summary sentences greedily (Maximal-Marginal-Relevance style) up to
 * a word budget of 25%-40% of the source length: each step favors a
 * high-scoring sentence, discounts candidates that mostly repeat the content
 * words of an already-picked sentence (so near-duplicates don't both make
 * the cut), and gives a one-time bonus to the first sentence picked from
 * each paragraph so every section of the source stays represented instead
 * of the summary clustering around whichever topic scored highest overall.
 */
function buildSummary(
  scored: ScoredSentence[],
  sentenceInfos: SentenceInfo[],
  stopwords: Set<string>,
  freq: Map<string, number>,
  totalWordCount: number,
): string {
  if (scored.length === 0) return "";

  const totalContentOccurrences = [...freq.values()].reduce((a, b) => a + b, 0);
  const diversity = totalContentOccurrences > 0 ? freq.size / totalContentOccurrences : 0.3;
  const ratio = clamp(
    MIN_SUMMARY_RATIO + ((diversity - 0.2) / 0.4) * (MAX_SUMMARY_RATIO - MIN_SUMMARY_RATIO),
    MIN_SUMMARY_RATIO,
    MAX_SUMMARY_RATIO,
  );
  const wordBudget = Math.max(totalWordCount * ratio, 1);
  const minSentences = Math.min(4, scored.length);

  const wordSetCache = new Map<number, Set<string>>();
  const wordsOf = (index: number) => {
    let set = wordSetCache.get(index);
    if (!set) {
      set = new Set(contentWords(sentenceInfos[index].tokens, stopwords));
      wordSetCache.set(index, set);
    }
    return set;
  };

  const remaining = [...scored];
  const selected: ScoredSentence[] = [];
  const representedParagraphs = new Set<number>();
  let selectedWordCount = 0;

  while (remaining.length > 0 && (selectedWordCount < wordBudget || selected.length < minSentences)) {
    let bestPos = 0;
    let bestValue = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const redundancy = selected.length
        ? Math.max(...selected.map((s) => jaccardOverlap(wordsOf(candidate.index), wordsOf(s.index))))
        : 0;
      const coverageBonus = representedParagraphs.has(sentenceInfos[candidate.index].paragraph)
        ? 1
        : PARAGRAPH_COVERAGE_BONUS;
      const value = candidate.score * coverageBonus * (1 - REDUNDANCY_PENALTY * redundancy);
      if (value > bestValue) {
        bestValue = value;
        bestPos = i;
      }
    }

    const chosen = remaining[bestPos];
    selected.push(chosen);
    representedParagraphs.add(sentenceInfos[chosen.index].paragraph);
    selectedWordCount += sentenceInfos[chosen.index].tokens.length;
    remaining.splice(bestPos, 1);
  }

  selected.sort((a, b) => a.index - b.index);

  const byParagraph = new Map<number, ScoredSentence[]>();
  for (const s of selected) {
    const p = sentenceInfos[s.index].paragraph;
    if (!byParagraph.has(p)) byParagraph.set(p, []);
    byParagraph.get(p)!.push(s);
  }
  const paragraphText = [...byParagraph.keys()]
    .sort((a, b) => a - b)
    .map((p) => byParagraph.get(p)!.map((s) => s.text).join(" "))
    .join("\n\n");

  const keyTerms = pickKeyTerms(freq, selected, sentenceInfos, stopwords);
  return applyBold(paragraphText, keyTerms);
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
  const paragraphs = splitParagraphs(documentText.slice(0, MAX_INPUT_LENGTH));
  const lang = detectLanguage(paragraphs.join(" "));
  const stopwords = lang === "en" ? STOPWORDS_EN : STOPWORDS_ES;

  const sentenceInfos: SentenceInfo[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    for (const text of splitSentences(paragraph)) {
      sentenceInfos.push({ text, paragraph: paragraphIndex, tokens: tokenizeWithPositions(text) });
    }
  });

  if (sentenceInfos.length === 0) {
    return { summary: "", questions: [] };
  }

  const usable = sentenceInfos
    .map((info, index) => ({ ...info, index }))
    .filter(
      (info) =>
        contentWords(info.tokens, stopwords).length >= MIN_SENTENCE_WORDS - 3 &&
        info.tokens.length >= MIN_SENTENCE_WORDS,
    );

  if (usable.length === 0) {
    return { summary: "", questions: [] };
  }

  const freq = computeWordFreq(
    usable.map((info) => info.tokens),
    stopwords,
  );
  const scored: ScoredSentence[] = usable.map((info) => ({
    text: info.text,
    index: info.index,
    score: scoreSentence(info.tokens, freq, stopwords) * structuralAdjustment(info.text, info.tokens, lang),
  }));

  const totalWordCount = sentenceInfos.reduce((acc, s) => acc + s.tokens.length, 0);

  const summary = buildSummary(scored, sentenceInfos, stopwords, freq, totalWordCount);
  const questions = buildQuestions(
    sentenceInfos.map((s) => s.text),
    sentenceInfos.map((s) => s.tokens),
    scored,
    freq,
    stopwords,
  );

  return { summary, questions };
}
