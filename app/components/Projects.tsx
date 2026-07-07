"use client";

import { motion } from "motion/react";
import { projects } from "@/lib/data";
import Typewriter from "@/app/components/Typewriter";
import TiltCard from "@/app/components/TiltCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Projects() {
  return (
    <section className="flex min-h-screen flex-col justify-center px-6 py-28">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-center text-sm font-semibold uppercase tracking-widest text-orange-400">
          Proyectos
        </h1>
        <Typewriter
          as="p"
          text="Una selección de lo que he construido."
          className="mx-auto mt-3 min-h-[1.5rem] text-center text-zinc-400"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, i) => (
            <motion.div key={i} variants={item} className="group">
              <TiltCard className="relative h-full rounded-xl">
                <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-orange-400/40 via-transparent to-orange-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <article className="relative flex h-full flex-col justify-between rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-50">{project.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-orange-400/10 px-2 py-0.5 text-xs font-medium text-orange-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4 text-sm font-medium">
                    <a
                      href={project.link}
                      className="text-zinc-300 transition-colors hover:text-orange-400"
                    >
                      Demo →
                    </a>
                    <a
                      href={project.repo}
                      className="text-zinc-300 transition-colors hover:text-orange-400"
                    >
                      Código →
                    </a>
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
