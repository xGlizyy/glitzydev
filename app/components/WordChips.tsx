"use client";

export default function WordChips({
  words,
  onSelect,
  tone = "default",
}: {
  words: string[];
  onSelect: (word: string) => void;
  tone?: "default" | "muted";
}) {
  if (!words.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word) => (
        <button
          key={word}
          type="button"
          onClick={() => onSelect(word)}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            tone === "muted"
              ? "border-white/10 text-zinc-400 hover:border-orange-400/40 hover:text-orange-300"
              : "border-orange-400/30 bg-orange-400/10 text-orange-300 hover:bg-orange-400/20"
          }`}
        >
          {word}
        </button>
      ))}
    </div>
  );
}
