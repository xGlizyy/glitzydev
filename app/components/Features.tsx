"use client";

import { motion } from "motion/react";
import { FiBookOpen, FiGlobe, FiStar } from "react-icons/fi";

const features = [
  {
    icon: FiGlobe,
    title: "Bilingüe",
    description: "Busca en español o inglés a la vez y compara resultados en pestañas.",
  },
  {
    icon: FiBookOpen,
    title: "Sinónimos y antónimos",
    description:
      "Cada definición viene con palabras relacionadas, un clic para saltar entre ellas.",
  },
  {
    icon: FiStar,
    title: "Guarda tus palabras",
    description: "Crea una cuenta gratis para marcar favoritos y revisar tu historial de búsquedas.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
      {features.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="glass glass-hover rounded-2xl p-6"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
            <feature.icon className="text-lg" />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-zinc-100">{feature.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
        </motion.div>
      ))}
    </section>
  );
}
