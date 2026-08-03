"use client";

import { useState } from "react";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";

export default function SearchBar({
  onSearch,
  loading,
  initialValue = "",
}: {
  onSearch: (word: string) => void;
  loading: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const glow = useGlowSuppression();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const word = value.trim();
        if (word) onSearch(word);
      }}
      onPointerEnter={glow.onPointerEnter}
      onPointerLeave={glow.onPointerLeave}
      className="glass flex w-full max-w-xl items-center gap-2 rounded-full p-2 transition-colors focus-within:border-orange-400/50"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe una palabra en español o inglés…"
        className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-white focus:outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
      >
        {loading ? "Buscando…" : "Buscar"}
      </button>
    </form>
  );
}
