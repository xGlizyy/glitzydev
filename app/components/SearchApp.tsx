"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import SearchBar from "@/app/components/SearchBar";
import ResultPanel from "@/app/components/ResultPanel";
import type { LookupResponse } from "@/lib/dictionary/types";

type Status = "idle" | "loading" | "error" | "empty" | "done";
type Language = "es" | "en";

function logHistory(word: string, language: Language) {
  fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, language }),
  }).catch(() => {});
}

export default function SearchApp({
  isAuthenticated,
  initialQuery,
}: {
  isAuthenticated: boolean;
  initialQuery?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [language, setLanguage] = useState<Language>("es");
  const [lastQuery, setLastQuery] = useState(initialQuery ?? "");

  const search = useCallback(
    async (word: string, lang: Language) => {
      setStatus("loading");
      setLastQuery(word);
      try {
        const res = await fetch(`/api/lookup?q=${encodeURIComponent(word)}&lang=${lang}`);
        const data = (await res.json()) as LookupResponse;
        setResult(data);
        const entry = lang === "es" ? data.es : data.en;
        if (!entry) {
          setStatus("empty");
        } else {
          setStatus("done");
          if (isAuthenticated) logHistory(entry.word, lang);
        }
      } catch {
        setStatus("error");
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial search from a URL query param
    if (initialQuery) search(initialQuery, "es");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    if (lastQuery.trim()) search(lastQuery, lang);
  }

  const hasResult = status !== "idle";
  const entry = result ? (language === "es" ? result.es : result.en) : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 pb-24 pt-14">
      <motion.div
        animate={{ marginTop: hasResult ? 0 : "8vh" }}
        transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.7 }}
        className="flex w-full flex-col items-center gap-10"
      >
        <h1 className="text-center text-2xl font-semibold text-zinc-50 sm:text-3xl">
          Buscar una palabra
        </h1>
        <SearchBar
          onSearch={(word) => search(word, language)}
          loading={status === "loading"}
          initialValue={lastQuery}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      </motion.div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Hubo un problema al buscar «{lastQuery}». Intenta de nuevo.
        </p>
      )}

      {status === "empty" && (
        <p className="text-sm text-zinc-500">
          No encontramos «{lastQuery}» en {language === "es" ? "español" : "inglés"}. Revisa la
          ortografía, prueba otra palabra o cambia de idioma con la bandera.
        </p>
      )}

      {status === "done" && entry && (
        <div className="mx-auto w-full max-w-xl space-y-4">
          <ResultPanel
            key={`${language}-${entry.word}`}
            entry={entry}
            onSelectWord={(word) => search(word, language)}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
    </div>
  );
}
