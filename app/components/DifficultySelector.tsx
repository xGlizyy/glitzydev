"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  readDifficulty,
  writeDifficulty,
  type Difficulty,
} from "@/lib/games/difficulty";

export default function DifficultySelector() {
  // Seeded to "normal" for the first render so server and client markup
  // match; the real (stored) value is only readable after hydration.
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR */
    setDifficulty(readDifficulty());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function choose(next: Difficulty) {
    writeDifficulty(next);
    setDifficulty(next);
  }

  const active = DIFFICULTIES.find((option) => option.value === difficulty);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Dificultad</span>
      <div className="glass flex gap-1 rounded-full p-1">
        {DIFFICULTIES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => choose(option.value)}
            className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5"
          >
            {difficulty === option.value && (
              <motion.span
                layoutId="difficulty-highlight"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 ${
                difficulty === option.value ? "text-black" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
      {active && <p className="max-w-xs text-center text-xs text-white">{active.description}</p>}
    </div>
  );
}
