"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { signOut } from "@/lib/auth/actions";

export default function Nav({ userEmail }: { userEmail: string | null }) {
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

        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/buscar"
            className="rounded-full px-4 py-1.5 text-zinc-400 transition hover:text-orange-300"
          >
            Buscar
          </Link>
          {userEmail ? (
            <>
              <Link
                href="/cuenta"
                className="rounded-full px-4 py-1.5 text-zinc-400 transition hover:text-orange-300"
              >
                Mi cuenta
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-4 py-1.5 text-zinc-400 transition hover:border-orange-400/40 hover:text-orange-300"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-zinc-400 transition hover:text-orange-300"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-orange-300 transition hover:bg-orange-400/20"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
