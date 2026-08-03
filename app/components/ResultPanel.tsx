import type { DictionaryEntry } from "@/lib/dictionary/types";
import WordChips from "@/app/components/WordChips";

export default function ResultPanel({
  entry,
  onSelectWord,
}: {
  entry: DictionaryEntry;
  onSelectWord: (word: string) => void;
}) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-semibold text-zinc-50">{entry.word}</h2>
          {entry.phonetic && <span className="text-sm text-zinc-500">{entry.phonetic}</span>}
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
            {entry.language === "es" ? "Español" : "Inglés"}
          </span>
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
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        {sense.synonyms?.length ? (
                          <span>Sin.: {sense.synonyms.join(", ")}</span>
                        ) : null}
                        {sense.antonyms?.length ? (
                          <span>Ant.: {sense.antonyms.join(", ")}</span>
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
