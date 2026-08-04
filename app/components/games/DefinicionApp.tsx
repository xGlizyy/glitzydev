"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiX, FiRefreshCw, FiAward } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import { readJSON, writeJSON } from "@/lib/storage/localJson";
import { mulberry32 } from "@/lib/random";
import { buildDefinitionRound, type DefinitionQuestion } from "@/lib/games/build";
import { DEFAULT_DIFFICULTY, DIFFICULTY_CONFIG, readDifficulty, type Difficulty } from "@/lib/games/difficulty";
import type { GameCandidate } from "@/lib/games/types";

const BEST_KEY = "juego:definicion:best";

type Best = { score: number; total: number };

export default function DefinicionApp({ pool }: { pool: GameCandidate[] }) {
  const glow = useGlowSuppression();
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  // Seeded (not Math.random) so the first render matches between server and
  // client hydration; "Jugar otra vez" below is client-only and free to use
  // real randomness.
  const [round, setRound] = useState<DefinitionQuestion[]>(() => buildDefinitionRound(pool, mulberry32(1)));
  const [answers, setAnswers] = useState<(number | null)[]>(() => round.map(() => null));
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<Best | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR */
    setBest(readJSON<Best>(BEST_KEY));
    const stored = readDifficulty();
    if (stored !== DEFAULT_DIFFICULTY) {
      setDifficulty(stored);
      const nextRound = buildDefinitionRound(pool, Math.random, undefined, DIFFICULTY_CONFIG[stored].options);
      setRound(nextRound);
      setAnswers(nextRound.map(() => null));
      setIndex(0);
      setFinished(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pool]);

  const total = round.length;
  const question = round[index];
  const selected = answers[index];
  const score = answers.filter((a, i) => a === round[i].correctIndex).length;

  function selectOption(optionIndex: number) {
    if (selected !== null || !question) return;
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
  }

  function goNext() {
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }

    setFinished(true);
    const stored = readJSON<Best>(BEST_KEY);
    if (!stored || score / total > stored.score / stored.total) {
      const nextBest = { score, total };
      setBest(nextBest);
      writeJSON(BEST_KEY, nextBest);
    }
  }

  function playAgain() {
    const nextRound = buildDefinitionRound(pool, Math.random, undefined, DIFFICULTY_CONFIG[difficulty].options);
    setRound(nextRound);
    setAnswers(nextRound.map(() => null));
    setIndex(0);
    setFinished(false);
  }

  if (total === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 pb-16 pt-10 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Definición</h1>
        <p className="text-sm text-zinc-400">
          No hemos podido preparar preguntas ahora mismo. Inténtalo de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-8 px-6 pb-16 pt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Definición</h1>
        <p className="text-sm text-zinc-400">Adivina qué palabra define cada frase.</p>
        {best && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
            <FiAward /> Mejor puntuación: {best.score} / {best.total}
          </p>
        )}
      </div>

      {!finished ? (
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                animate={{ width: `${((index + (selected !== null ? 1 : 0)) / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              />
            </div>
            <span className="shrink-0 text-xs text-zinc-500">
              {index + 1} / {total}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="glass w-full rounded-3xl p-6 sm:p-8"
            >
              <p className="text-center text-sm text-zinc-400">¿Qué palabra significa esto?</p>
              <p className="mt-2 text-center text-lg font-medium text-zinc-50">
                &ldquo;{question.definition}&rdquo;
              </p>
              {question.example && (
                <p className="mt-3 text-center text-sm italic text-zinc-500">{question.example}</p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {question.options.map((option, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === question.correctIndex;
                  const showFeedback = selected !== null;

                  let stateClasses = "border-white/10 bg-white/5 hover:border-orange-400/40";
                  if (showFeedback && isCorrect) {
                    stateClasses = "border-green-400/50 bg-green-400/10 text-green-300";
                  } else if (showFeedback && isSelected && !isCorrect) {
                    stateClasses = "border-red-400/50 bg-red-400/10 text-red-300";
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={showFeedback}
                      onClick={() => selectOption(i)}
                      onPointerEnter={glow.onPointerEnter}
                      onPointerLeave={glow.onPointerLeave}
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium text-zinc-200 transition-colors disabled:cursor-default ${stateClasses}`}
                    >
                      {option}
                      {showFeedback && isCorrect && <FiCheck className="shrink-0 text-green-300" />}
                      {showFeedback && isSelected && !isCorrect && (
                        <FiX className="shrink-0 text-red-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={goNext}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  {index + 1 < total ? "Siguiente" : "Ver resultado"}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass w-full rounded-3xl p-6 text-center sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">Resultado</p>
          <p className="mt-2 text-4xl font-semibold text-zinc-50">
            {score} / {total}
          </p>

          <ol className="mt-6 space-y-2 text-left text-sm">
            {round.map((q, i) => {
              const correct = answers[i] === q.correctIndex;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="text-zinc-300">{q.word}</span>
                  {correct ? (
                    <FiCheck className="shrink-0 text-green-300" />
                  ) : (
                    <FiX className="shrink-0 text-red-300" />
                  )}
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={playAgain}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <FiRefreshCw /> Jugar otra vez
          </button>
        </motion.div>
      )}
    </div>
  );
}
