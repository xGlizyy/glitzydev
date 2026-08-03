"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import ResultPanel from "@/app/components/ResultPanel";
import type { LookupResponse } from "@/lib/dictionary/types";

type Status = "idle" | "loading" | "error" | "empty" | "done";

function logHistory(word: string, language: "es" | "en") {
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
  const [activeTab, setActiveTab] = useState<"es" | "en">("es");
  const [lastQuery, setLastQuery] = useState(initialQuery ?? "");

  const search = useCallback(
    async (word: string) => {
      setStatus("loading");
      setLastQuery(word);
      try {
        const res = await fetch(`/api/lookup?q=${encodeURIComponent(word)}`);
        const data = (await res.json()) as LookupResponse;
        setResult(data);
        if (!data.es && !data.en) {
          setStatus("empty");
        } else {
          setActiveTab(data.es ? "es" : "en");
          setStatus("done");
          if (isAuthenticated) {
            if (data.es) logHistory(data.es.word, "es");
            if (data.en) logHistory(data.en.word, "en");
          }
        }
      } catch {
        setStatus("error");
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial search from a URL query param
    if (initialQuery) search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 pb-24 pt-36">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Buscar una palabra</h1>
        <p className="mt-3 text-sm text-zinc-500">
          Español e inglés · definiciones, sinónimos y antónimos en un mismo lugar.
        </p>
      </div>

      <SearchBar onSearch={search} loading={status === "loading"} initialValue={lastQuery} />

      {status === "error" && (
        <p className="text-sm text-red-400">
          Hubo un problema al buscar «{lastQuery}». Intenta de nuevo.
        </p>
      )}

      {status === "empty" && (
        <p className="text-sm text-zinc-500">
          No encontramos «{lastQuery}» en español ni en inglés. Revisa la ortografía o prueba otra
          palabra.
        </p>
      )}

      {status === "done" && result && (result.es || result.en) && (
        <div className="w-full space-y-4">
          {result.es && result.en && (
            <div className="flex justify-center gap-2">
              {(["es", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTab(lang)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    activeTab === lang
                      ? "border-orange-400/50 bg-orange-400/10 text-orange-300"
                      : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lang === "es" ? "Español" : "English"}
                </button>
              ))}
            </div>
          )}
          {activeTab === "es" && result.es && (
            <ResultPanel
              key={`es-${result.es.word}`}
              entry={result.es}
              onSelectWord={search}
              isAuthenticated={isAuthenticated}
            />
          )}
          {activeTab === "en" && result.en && (
            <ResultPanel
              key={`en-${result.en.word}`}
              entry={result.en}
              onSelectWord={search}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
      )}
    </div>
  );
}
