import Link from "next/link";
import { profile } from "@/lib/data";
import Typewriter from "@/app/components/Typewriter";

const links = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-400">
        {profile.alias}
      </p>
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
        {profile.name}
      </h1>
      <Typewriter
        text={profile.tagline}
        className="min-h-[2rem] text-xl text-zinc-400 sm:text-2xl"
      />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-orange-400/30 bg-orange-400/10 px-5 py-2 text-sm font-medium text-orange-300 transition-all hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-400/20"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
