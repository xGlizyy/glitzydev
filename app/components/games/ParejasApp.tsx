"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiRefreshCw, FiAward, FiHelpCircle } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import { readJSON, writeJSON } from "@/lib/storage/localJson";
import { mulberry32 } from "@/lib/random";
import { buildParejasRound, type ParejasCard } from "@/lib/games/build";
import { DEFAULT_DIFFICULTY, DIFFICULTY_CONFIG, readDifficulty } from "@/lib/games/difficulty";
import type { GameCandidate } from "@/lib/games/types";

const MISMATCH_MS = 700;
const DEFAULT_PAIRS = DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].pairs;

function bestKey(pairs: number) {
  return `juego:parejas:best:${pairs}`;
}

export default function ParejasApp({ pool }: { pool: GameCandidate[] }) {
  const glow = useGlowSuppression();
  const [pairsCount, setPairsCount] = useState(DEFAULT_PAIRS);
  // Seeded (not Math.random) so the first render matches between server and
  // client hydration; the mount effect below swaps in the real difficulty
  // (and real randomness) once localStorage is readable, same as "Jugar
  // otra vez" further down.
  const [cards, setCards] = useState<ParejasCard[]>(() => buildParejasRound(pool, mulberry32(1), DEFAULT_PAIRS));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR */
    const pairs = DIFFICULTY_CONFIG[readDifficulty()].pairs;
    if (pairs !== DEFAULT_PAIRS) {
      setPairsCount(pairs);
      setCards(buildParejasRound(pool, Math.random, pairs));
      setFlipped([]);
      setMatched(new Set());
      setMoves(0);
    }
    setBest(readJSON<number>(bestKey(pairs)));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pool]);

  const total = cards.length / 2;
  const finished = total > 0 && matched.size === total;

  function flipCard(index: number) {
    if (locked || finished) return;
    if (flipped.includes(index) || matched.has(cards[index].pairId)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    const [a, b] = next;
    const movesSoFar = moves + 1;
    setMoves(movesSoFar);

    if (cards[a].pairId === cards[b].pairId) {
      const nextMatched = new Set(matched).add(cards[a].pairId);
      setMatched(nextMatched);
      setFlipped([]);

      if (nextMatched.size === total) {
        const stored = readJSON<number>(bestKey(pairsCount));
        if (!stored || movesSoFar < stored) {
          setBest(movesSoFar);
          writeJSON(bestKey(pairsCount), movesSoFar);
        }
      }
    } else {
      setLocked(true);
      setTimeout(() => {
        setFlipped([]);
        setLocked(false);
      }, MISMATCH_MS);
    }
  }

  function playAgain() {
    setCards(buildParejasRound(pool, Math.random, pairsCount));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 pb-16 pt-10 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Parejas</h1>
        <p className="text-sm text-zinc-400">
          No hemos podido preparar el tablero ahora mismo. Inténtalo de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 px-6 pb-16 pt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Parejas</h1>
        <p className="text-sm text-zinc-400">Encuentra cada palabra con su sinónimo.</p>
        {best !== null && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
            <FiAward /> Menos movimientos: {best}
          </p>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">
          Parejas encontradas: {matched.size} / {total}
        </span>
        <span className="text-xs text-zinc-500">Movimientos: {moves}</span>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.has(card.pairId);
          const isMatched = matched.has(card.pairId);
          return (
            <button
              key={card.id}
              type="button"
              disabled={isMatched}
              onClick={() => flipCard(i)}
              onPointerEnter={glow.onPointerEnter}
              onPointerLeave={glow.onPointerLeave}
              className="aspect-[3/4] [perspective:800px] disabled:cursor-default"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                className="relative h-full w-full [transform-style:preserve-3d]"
              >
                <div className="glass absolute inset-0 flex items-center justify-center rounded-xl [backface-visibility:hidden]">
                  <FiHelpCircle className="text-lg text-zinc-500" />
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border p-1.5 text-center text-xs font-medium [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-sm ${
                    isMatched
                      ? "border-green-400/50 bg-green-400/10 text-green-300"
                      : "border-orange-400/40 bg-orange-400/10 text-zinc-100"
                  }`}
                >
                  {card.label}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass w-full rounded-3xl p-6 text-center sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">¡Completado!</p>
            <p className="mt-2 text-4xl font-semibold text-zinc-50">{moves} movimientos</p>
            {best !== null && (
              <p className="mt-2 text-sm text-zinc-400">
                {moves <= best ? "¡Nueva mejor puntuación!" : `Tu mejor marca sigue siendo ${best}.`}
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
      </AnimatePresence>
    </div>
  );
}
