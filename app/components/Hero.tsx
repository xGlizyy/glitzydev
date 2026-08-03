"use client";

import Link from "next/link";
import { motion } from "motion/react";

const floatingChips = [
  { label: "Sinónimo", top: "8%", left: "-6%", delay: 0 },
  { label: "Antónimo", top: "72%", left: "-10%", delay: 0.6 },
  { label: "ES ⇄ EN", top: "4%", left: "78%", delay: 0.3 },
  { label: "Definición", top: "80%", left: "70%", delay: 0.9 },
];

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pb-20 pt-40 text-center">
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
        className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl"
      >
        Encuentra la palabra exacta,{" "}
        <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
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
        <Link
          href="/registro"
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-black transition hover:bg-orange-400"
        >
          Crear cuenta gratis
        </Link>
        <Link
          href="/buscar"
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-orange-400/40 hover:text-orange-300"
        >
          Probar el buscador
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative mt-14 w-full max-w-lg"
      >
        {floatingChips.map((chip) => (
          <motion.span
            key={chip.label}
            className="absolute hidden rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-xs text-orange-200 backdrop-blur-md sm:block"
            style={{ top: chip.top, left: chip.left }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: chip.delay, ease: "easeInOut" }}
          >
            {chip.label}
          </motion.span>
        ))}

        <motion.div
          whileHover={{ rotateX: -2, rotateY: 3, scale: 1.01 }}
          style={{ transformStyle: "preserve-3d" }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-zinc-500">buscador.diccionario</span>
          </div>
          <div className="mt-4 space-y-3">
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
