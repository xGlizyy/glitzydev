import { profile, focus } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-screen flex-col justify-center gap-8 px-6 pt-24"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          {profile.alias}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
          {profile.name}
        </h1>
        <p className="mt-4 text-xl text-zinc-400 sm:text-2xl">{profile.tagline}</p>

        <div id="sobre-mi" className="mt-10 max-w-2xl scroll-mt-24">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Sobre mí
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-zinc-300">{profile.about}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {focus.map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
