"use client";

import { useState } from "react";

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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const word = value.trim();
        if (word) onSearch(word);
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-xl transition focus-within:border-orange-400/50"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe una palabra en español o inglés…"
        className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-40"
      >
        {loading ? "Buscando…" : "Buscar"}
      </button>
    </form>
  );
}
