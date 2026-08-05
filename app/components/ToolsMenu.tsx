"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";

const TOOLS = [
  { href: "/buscar", label: "Buscar" },
  { href: "/reto", label: "Reto diario" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/resumen", label: "Resúmenes" },
  { href: "/juegos", label: "Juegos" },
];

export default function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function openOnHover() {
    clearCloseTimeout();
    setOpen(true);
  }

  // Small delay (not an instant close) so crossing the gap between the
  // button and the dropdown below it doesn't count as "leaving".
  function closeOnHover() {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

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

  useEffect(() => clearCloseTimeout, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnHover}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-zinc-400 transition-colors hover:text-orange-300 sm:px-4"
      >
        Herramientas
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="text-xs" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-full z-20 mt-4 flex w-56 max-w-[calc(100vw-2.5rem)] flex-col gap-1 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 font-industrial text-sm tracking-wide text-zinc-100 transition hover:bg-orange-400/10"
              >
                {tool.label}
                <FiExternalLink className="shrink-0 text-orange-300" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
