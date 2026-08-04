"use client";

import { useState } from "react";
import type { DictionaryEntry } from "@/lib/dictionary/types";
import WordChips from "@/app/components/WordChips";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";

export default function ResultPanel({
  entry,
  onSelectWord,
  isAuthenticated = false,
}: {
  entry: DictionaryEntry;
  onSelectWord: (word: string) => void;
  isAuthenticated?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const glow = useGlowSuppression();

  async function toggleFavorite() {
    setSaving(true);
    try {
      const res = await fetch("/api/favorites", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: entry.word, language: entry.language }),
      });
      if (res.ok) setSaved(!saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onPointerEnter={glow.onPointerEnter}
      onPointerLeave={glow.onPointerLeave}
      className="glass space-y-6 rounded-3xl p-6 sm:p-8"
    >
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-semibold text-zinc-50">{entry.word}</h2>
          {entry.phonetic && <span className="text-sm text-zinc-500">{entry.phonetic}</span>}
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
            {entry.language === "es" ? "Español" : "Inglés"}
          </span>
          {isAuthenticated && (
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={saving}
              className={`ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition disabled:opacity-40 ${
                saved
                  ? "border-orange-400/50 bg-orange-400/10 text-orange-300"
                  : "border-white/10 text-zinc-400 hover:border-orange-400/40 hover:text-orange-300"
              }`}
            >
              <span>{saved ? "★" : "☆"}</span>
              {saved ? "Guardado" : "Guardar"}
            </button>
          )}
        </div>
        {entry.etymology && <p className="mt-2 text-xs italic text-zinc-500">{entry.etymology}</p>}
      </div>

      {(entry.synonyms.length > 0 || entry.antonyms.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {entry.synonyms.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Sinónimos
              </p>
              <WordChips words={entry.synonyms} onSelect={onSelectWord} />
            </div>
          )}
          {entry.antonyms.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Antónimos
              </p>
              <WordChips words={entry.antonyms} onSelect={onSelectWord} tone="muted" />
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {entry.blocks.map((block, i) => (
          <div key={`${block.partOfSpeech}-${i}`}>
            <h3 className="mb-2 text-sm font-semibold text-orange-300">{block.partOfSpeech}</h3>
            <ol className="space-y-3 text-sm text-zinc-300">
              {block.senses.map((sense, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-zinc-600">{j + 1}.</span>
                  <div className="space-y-1">
                    <p>{sense.definition}</p>
                    {sense.example && (
                      <p className="text-xs italic text-zinc-500">“{sense.example}”</p>
                    )}
                    {(sense.synonyms?.length || sense.antonyms?.length) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {sense.synonyms?.length ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-zinc-500">Sin.:</span>
                            <WordChips words={sense.synonyms} onSelect={onSelectWord} />
                          </div>
                        ) : null}
                        {sense.antonyms?.length ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-zinc-500">Ant.:</span>
                            <WordChips words={sense.antonyms} onSelect={onSelectWord} tone="muted" />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <a
        href={entry.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-xs text-zinc-600 underline decoration-dotted hover:text-orange-300"
      >
        Fuente: {entry.sourceLabel}
      </a>
    </div>
  );
}
