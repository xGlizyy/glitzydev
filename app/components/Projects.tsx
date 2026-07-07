import { projects } from "@/lib/data";
import Typewriter from "@/app/components/Typewriter";

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <article
              key={i}
              className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/10 hover:shadow-[0_0_30px_-12px] hover:shadow-orange-400/50"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
