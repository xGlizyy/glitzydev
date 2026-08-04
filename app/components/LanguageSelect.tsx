"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiChevronDown } from "react-icons/fi";

type Language = "es" | "en";

// Emoji flags (🇪🇸/🇺🇸) render as plain "ES"/"US" letters on Windows in most
// browsers, so the flags are drawn as inline SVGs instead — cropped to a
// circle by the wrapping span, not dependent on the OS having flag glyphs.
function SpainFlag() {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

function UsaFlag() {
  const stripeHeight = 40 / 13;
  const whiteStripeIndexes = [1, 3, 5, 7, 9, 11];
  const dotCols = 5;
  const dotRows = 4;

  return (
    <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="60" height="40" fill="#B22234" />
      {whiteStripeIndexes.map((i) => (
        <rect key={i} y={i * stripeHeight} width="60" height={stripeHeight} fill="#fff" />
      ))}
      <rect width="26" height={7 * stripeHeight} fill="#3C3B6E" />
      {Array.from({ length: dotRows }).map((_, row) =>
        Array.from({ length: dotCols }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={2.6 + col * 5.2}
            cy={2.6 + row * 5.2}
            r="0.9"
            fill="#fff"
          />
        )),
      )}
    </svg>
  );
}

const LANGUAGES: { code: Language; Flag: ComponentType; label: string }[] = [
  { code: "es", Flag: SpainFlag, label: "Español" },
  { code: "en", Flag: UsaFlag, label: "English" },
];

export default function LanguageSelect({
  value,
  onChange,
}: {
  value: Language;
  onChange: (lang: Language) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

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
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Idioma de búsqueda: ${current.label}`}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2 transition hover:border-orange-400/40"
      >
        <span className="block h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
          <current.Flag />
        </span>
        <FiChevronDown className="text-xs text-zinc-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass absolute left-0 top-full z-20 mt-4 flex gap-3 rounded-full p-2"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
                aria-label={lang.label}
                title={lang.label}
                className={`block h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 transition ${
                  value === lang.code
                    ? "ring-orange-400/70"
                    : "ring-transparent hover:ring-white/25"
                }`}
              >
                <lang.Flag />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
