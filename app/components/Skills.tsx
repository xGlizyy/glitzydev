import { languages } from "@/lib/data";

export default function Skills() {
  return (
    <section id="habilidades" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Lenguajes
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Lenguajes de programación con los que he trabajado o tengo experiencia,
          con especial foco en JavaScript, TypeScript, React y Node.js.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
