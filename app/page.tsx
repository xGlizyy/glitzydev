import Hero from "@/app/components/Hero";

const features = [
  {
    title: "Bilingüe",
    description: "Busca en español o inglés a la vez y compara resultados en pestañas.",
  },
  {
    title: "Sinónimos y antónimos",
    description: "Cada definición viene con palabras relacionadas, un clic para saltar entre ellas.",
  },
  {
    title: "Guarda tus palabras",
    description: "Crea una cuenta gratis para marcar favoritos y revisar tu historial de búsquedas.",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <h3 className="text-sm font-semibold text-orange-300">{feature.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
