"use client";

import { useCallback, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import ResultPanel from "@/app/components/ResultPanel";
import Typewriter from "@/app/components/Typewriter";
import type { LookupResponse } from "@/lib/dictionary/types";

type Status = "idle" | "loading" | "error" | "empty" | "done";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"es" | "en">("es");
  const [lastQuery, setLastQuery] = useState("");

  const search = useCallback(async (word: string) => {
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
      }
    } catch {
      setStatus("error");
    }
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 pb-24 pt-36">
      <div className="text-center">
        <Typewriter
          as="h1"
          text="Diccionario, sinónimos y antónimos"
          className="text-2xl font-semibold text-zinc-50 sm:text-3xl"
        />
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
            <ResultPanel entry={result.es} onSelectWord={search} />
          )}
          {activeTab === "en" && result.en && (
            <ResultPanel entry={result.en} onSelectWord={search} />
          )}
        </div>
      )}
    </div>
  );
}
