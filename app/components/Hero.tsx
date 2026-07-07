import { profile, focus } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-screen flex-col justify-center gap-8 px-6 pt-24"
    >
      <div className="animate-fade-up mx-auto w-full max-w-4xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
          {profile.alias}
        </p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 sm:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-4 text-xl text-zinc-400 sm:text-2xl">{profile.tagline}</p>

        <p
          id="sobre-mi"
          className="mx-auto mt-6 max-w-xl scroll-mt-24 text-base leading-relaxed text-zinc-400"
        >
          {profile.about}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {focus.map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300 shadow-[0_0_20px_-8px] shadow-emerald-400/60"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#habilidades"
            className="flex flex-col items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <span className="text-xs uppercase tracking-widest">Explorar</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-bounce"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
