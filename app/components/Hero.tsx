"use client";

import type { PointerEvent } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";

const floatingChips = [
  { label: "Sinónimo", corner: "tl", delay: 0 },
  { label: "Antónimo", corner: "bl", delay: 0.6 },
  { label: "ES ⇄ EN", corner: "tr", delay: 0.3 },
  { label: "Definición", corner: "br", delay: 0.9 },
] as const;

const cornerClasses: Record<(typeof floatingChips)[number]["corner"], string> = {
  tl: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  bl: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  tr: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  br: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
};

export default function Hero() {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 20 });
  const glareX = useTransform(springY, [-10, 10], ["0%", "100%"]);
  const glareY = useTransform(springX, [10, -10], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(251,146,60,0.18), transparent 55%)`;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 16);
    rotateX.set(-py * 16);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pb-24 pt-40 text-center">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-orange-300"
      >
        Español · Inglés · en un solo buscador
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl"
      >
        Encuentra la palabra exacta,{" "}
        <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
          al instante
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-xl text-base text-zinc-400"
      >
        Definiciones, sinónimos y antónimos en español e inglés. Crea una cuenta gratis para
        guardar tus palabras favoritas y volver a ellas cuando quieras.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/registro"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40"
          >
            Crear cuenta gratis
            <FiArrowUpRight />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/buscar"
            className="glass glass-hover flex items-center rounded-full px-6 py-2.5 text-sm font-medium text-zinc-200"
          >
            Probar el buscador
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative mt-16 w-full max-w-lg p-9 [perspective:1200px]"
      >
        {floatingChips.map((chip) => (
          <div
            key={chip.label}
            className={`absolute z-20 hidden sm:block ${cornerClasses[chip.corner]}`}
          >
            <motion.span
              className="block whitespace-nowrap rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-xs text-orange-200 backdrop-blur-md"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: chip.delay, ease: "easeInOut" }}
            >
              {chip.label}
            </motion.span>
          </div>
        ))}

        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
          className="glass relative overflow-hidden rounded-3xl p-6 text-left"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ background: glareBackground }}
          />

          <div className="relative flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-zinc-500">buscador.diccionario</span>
          </div>
          <div className="relative mt-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-50">grande</span>
              <span className="text-xs text-zinc-500">adjetivo</span>
            </div>
            <p className="text-sm text-zinc-400">
              Superior en tamaño a un determinado patrón tomado como medida.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["amplio", "enorme", "voluminoso"].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs text-orange-300"
                >
                  {word}
                </span>
              ))}
              {["chico", "pequeño"].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
