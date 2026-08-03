"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/40 bg-orange-400/10 text-sm font-semibold text-orange-300"
          >
            Dx
          </motion.span>
          <span className="text-sm font-medium text-zinc-300">Diccionario</span>
        </Link>
      </nav>
    </header>
  );
}
