"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiCheck, FiX, FiRefreshCw, FiAward, FiClock, FiPlay } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import { readJSON, writeJSON } from "@/lib/storage/localJson";
import { mulberry32 } from "@/lib/random";
import { buildSynAntRound } from "@/lib/games/build";
import { DEFAULT_DIFFICULTY, DIFFICULTY_CONFIG, readDifficulty, type Difficulty } from "@/lib/games/difficulty";
import { WORD_BANK } from "@/lib/challenge/wordBank";
import type { ChallengeQuestion } from "@/lib/challenge/types";
import type { GameCandidate } from "@/lib/games/types";

const BEST_KEY = "juego:contrarreloj:best";
const ROUND_SECONDS = 60;
const BUFFER_SIZE = 150; // generous margin over what 60s of rapid-fire answers could consume
const FEEDBACK_MS = 350;

type Phase = "ready" | "playing" | "done";

export default function ContrarrelojApp({ pool }: { pool: GameCandidate[] }) {
  const glow = useGlowSuppression();
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  // Seeded for the first render so server and client markup match; restarts
  // below are client-only interactions and use real randomness. The buffer
  // and timer are invisible during "ready", so they're safe to fully rebuild
  // once the real difficulty is known — no need to wait for that here too.
  const [buffer, setBuffer] = useState<ChallengeQuestion[]>(() =>
    buildSynAntRound(pool, WORD_BANK, mulberry32(1), BUFFER_SIZE),
  );
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR */
    setBest(readJSON<number>(BEST_KEY));
    setDifficulty(readDifficulty());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : t));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    /* eslint-disable react-hooks/set-state-in-effect -- clock ran out mid-round: this is the one moment
       that has to flip phase to "done" and persist a new best score, there's no render-time equivalent */
    setPhase("done");
    const stored = readJSON<number>(BEST_KEY);
    if (stored === null || score > stored) {
      setBest(score);
      writeJSON(BEST_KEY, score);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [phase, timeLeft, score]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const question = buffer[index % buffer.length];

  function start() {
    const config = DIFFICULTY_CONFIG[difficulty];
    setBuffer(buildSynAntRound(pool, WORD_BANK, Math.random, BUFFER_SIZE, config.options));
    setPhase("playing");
    setTimeLeft(config.seconds);
    setIndex(0);
    setScore(0);
    setSelected(null);
  }

  function selectOption(optionIndex: number) {
    if (selected !== null || phase !== "playing" || !question) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) setScore((s) => s + 1);

    advanceTimer.current = setTimeout(() => {
      setSelected(null);
      setIndex((i) => i + 1);
    }, FEEDBACK_MS);
  }

  function playAgain() {
    const config = DIFFICULTY_CONFIG[difficulty];
    setBuffer(buildSynAntRound(pool, WORD_BANK, Math.random, BUFFER_SIZE, config.options));
    setPhase("ready");
    setTimeLeft(config.seconds);
    setIndex(0);
    setScore(0);
    setSelected(null);
  }

  if (buffer.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 pb-16 pt-10 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Contrarreloj</h1>
        <p className="text-sm text-zinc-400">
          No hemos podido preparar preguntas ahora mismo. Inténtalo de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center gap-8 px-6 pb-16 pt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Contrarreloj</h1>
        <p className="text-sm text-zinc-400">
          Sinónimos y antónimos a toda velocidad. Responde tantos como puedas en{" "}
          {DIFFICULTY_CONFIG[difficulty].seconds} segundos.
        </p>
        {best !== null && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
            <FiAward /> Mejor puntuación: {best}
          </p>
        )}
      </div>

      {phase === "ready" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={start}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          <FiPlay /> Empezar
        </motion.button>
      )}

      {phase === "playing" && question && (
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <FiClock className="text-orange-300" /> {timeLeft}s
            </span>
            <span className="text-xs text-zinc-500">Puntos: {score}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="glass w-full rounded-3xl p-6 sm:p-8"
            >
              <p className="text-center text-sm text-zinc-400">
                ¿Cuál de estas palabras es{" "}
                {question.type === "sinonimo" ? "un sinónimo" : "un antónimo"} de…
              </p>
              <p className="mt-2 text-center text-3xl font-semibold text-zinc-50">{question.word}</p>

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
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass w-full rounded-3xl p-6 text-center sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
            Se acabó el tiempo
          </p>
          <p className="mt-2 text-4xl font-semibold text-zinc-50">{score} puntos</p>
          {best !== null && (
            <p className="mt-2 text-sm text-zinc-400">
              {score >= best ? "¡Nueva mejor puntuación!" : `Tu mejor puntuación sigue siendo ${best}.`}
            </p>
          )}

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
