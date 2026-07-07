import { skills } from "@/lib/data";

export default function Skills() {
  return (
    <section id="habilidades" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Stack
        </h2>
        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {skills.map(({ name, icon: Icon, color }) => (
            <div
              key={name}
              className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <Icon
                size={36}
                color={color}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
