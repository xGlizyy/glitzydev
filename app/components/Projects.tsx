import { projects } from "@/lib/data";

export default function Projects() {
  return (
    <section id="proyectos" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Proyectos
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <article
              key={i}
              className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/10 hover:shadow-[0_0_30px_-12px] hover:shadow-emerald-400/50"
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
                      className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-4 text-sm font-medium">
                <a
                  href={project.link}
                  className="text-zinc-300 transition-colors hover:text-emerald-400"
                >
                  Demo →
                </a>
                <a
                  href={project.repo}
                  className="text-zinc-300 transition-colors hover:text-emerald-400"
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
