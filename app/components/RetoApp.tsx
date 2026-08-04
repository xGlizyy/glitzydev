"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCalendar, FiCheck, FiX, FiZap } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import type { DailyChallenge } from "@/lib/challenge/types";

const PROGRESS_KEY = "reto:progress:v1";
const STREAK_KEY = "reto:streak:v1";

type Progress = { date: string; answers: (number | null)[] };
type Streak = { count: number; lastDate: string };

function addDays(dateKey: string, delta: number): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage puede fallar en modo privado; el reto sigue jugándose igual.
  }
}

export default function RetoApp({ challenge }: { challenge: DailyChallenge }) {
  const glow = useGlowSuppression();
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    challenge.questions.map(() => null),
  );
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState<Streak>({ count: 0, lastDate: "" });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR */
    const storedStreak = readJSON<Streak>(STREAK_KEY);
    if (storedStreak) setStreak(storedStreak);

    const storedProgress = readJSON<Progress>(PROGRESS_KEY);
    if (storedProgress?.date === challenge.date) {
      setAnswers(storedProgress.answers);
      if (storedProgress.answers.every((a) => a !== null)) {
        setFinished(true);
        setIndex(challenge.questions.length - 1);
      } else {
        setIndex(storedProgress.answers.findIndex((a) => a === null));
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.date]);

  const total = challenge.questions.length;
  const question = challenge.questions[index];
  const selected = answers[index];
  const score = answers.filter((a, i) => a === challenge.questions[i].correctIndex).length;

  function selectOption(optionIndex: number) {
    if (selected !== null || !question) return;
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
    writeJSON(PROGRESS_KEY, { date: challenge.date, answers: next });
  }

  function goNext() {
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }

    setFinished(true);
    const yesterday = addDays(challenge.date, -1);
    const stored = readJSON<Streak>(STREAK_KEY);
    let nextStreak: Streak;
    if (stored?.lastDate === challenge.date) {
      nextStreak = stored;
    } else if (stored?.lastDate === yesterday) {
      nextStreak = { count: stored.count + 1, lastDate: challenge.date };
    } else {
      nextStreak = { count: 1, lastDate: challenge.date };
    }
    setStreak(nextStreak);
    writeJSON(STREAK_KEY, nextStreak);
  }

  if (total === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 pb-16 pt-10 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Reto diario</h1>
        <p className="text-sm text-zinc-400">
          No hemos podido preparar el reto de hoy. Inténtalo de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-8 px-6 pb-16 pt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
          Reto diario de sinónimos y antónimos
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-zinc-400">
          <FiCalendar className="text-orange-300" /> {formatDate(challenge.date)}
        </p>
        {streak.count > 0 && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
            <FiZap /> Racha de {streak.count} {streak.count === 1 ? "día" : "días"}
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
              <p className="text-center text-sm text-zinc-400">
                ¿Cuál de estas palabras es{" "}
                {question.type === "sinonimo" ? "un sinónimo" : "un antónimo"} de…
              </p>
              <p className="mt-2 text-center text-3xl font-semibold text-zinc-50">
                {question.word}
              </p>

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
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
            Resultado de hoy
          </p>
          <p className="mt-2 text-4xl font-semibold text-zinc-50">
            {score} / {total}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {score === total
              ? "¡Reto perfecto! Vuelve mañana a por otro."
              : "Vuelve mañana para un nuevo reto y seguir la racha."}
          </p>

          <ol className="mt-6 space-y-2 text-left text-sm">
            {challenge.questions.map((q, i) => {
              const correct = answers[i] === q.correctIndex;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="text-zinc-300">
                    {q.word}{" "}
                    <span className="text-zinc-500">
                      ({q.type === "sinonimo" ? "sinónimo" : "antónimo"})
                    </span>
                  </span>
                  {correct ? (
                    <FiCheck className="shrink-0 text-green-300" />
                  ) : (
                    <FiX className="shrink-0 text-red-300" />
                  )}
                </li>
              );
            })}
          </ol>
        </motion.div>
      )}
    </div>
  );
}
