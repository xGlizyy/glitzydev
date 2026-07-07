import type { Metadata } from "next";
import { profile } from "@/lib/data";
import Typewriter from "@/app/components/Typewriter";
import Skills from "@/app/components/Skills";

export const metadata: Metadata = {
  title: `Sobre mí — ${profile.name}`,
};

export default function SobreMiPage() {
  return (
    <section className="flex min-h-screen flex-col justify-center px-6 py-28">
      <div className="mx-auto w-full max-w-3xl text-center">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-orange-400">
          Sobre mí
        </h1>
        <Typewriter
          as="p"
          text={profile.about}
          className="mx-auto mt-6 min-h-[6rem] max-w-xl text-lg leading-relaxed text-zinc-300 sm:min-h-[4.5rem]"
        />
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <Skills />
      </div>
    </section>
  );
}
