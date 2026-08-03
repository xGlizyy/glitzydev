"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FiChevronDown, FiLogOut, FiStar, FiUser } from "react-icons/fi";
import { signOut } from "@/lib/auth/actions";

export default function AccountMenu({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    // No "relative" here on purpose: the dropdown below anchors to the
    // nearest positioned ancestor, which is the <nav> itself (see Nav.tsx).
    // That makes `top-full` land exactly at the header's bottom border
    // instead of just under this button.
    <div ref={containerRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.96 }}
        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
          userEmail
            ? "border-white/10 text-zinc-300 hover:border-orange-400/40 hover:text-orange-300"
            : "border-orange-400/30 bg-orange-400/10 text-orange-300 hover:bg-orange-400/20"
        }`}
      >
        {userEmail ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400/20 text-[10px] font-semibold text-orange-200">
            {userEmail[0]?.toUpperCase()}
          </span>
        ) : (
          <FiUser className="text-base" />
        )}
        <span>{userEmail ? "Mi cuenta" : "Acceder"}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="text-sm" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass absolute right-6 top-full mt-3 w-52 overflow-hidden rounded-2xl p-1.5"
          >
            {userEmail ? (
              <>
                <p className="truncate px-3 pb-1.5 pt-1 text-xs text-zinc-500">{userEmail}</p>
                <Link
                  href="/cuenta"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-200 transition hover:bg-orange-400/10 hover:text-orange-300"
                >
                  <FiStar className="text-sm" /> Favoritos e historial
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/5 hover:text-red-300"
                  >
                    <FiLogOut className="text-sm" /> Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-zinc-200 transition hover:bg-orange-400/10 hover:text-orange-300"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm text-zinc-200 transition hover:bg-orange-400/10 hover:text-orange-300"
                >
                  Registrarse
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
