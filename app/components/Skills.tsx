"use client";

import { motion } from "motion/react";
import { skills, type SkillCategory } from "@/lib/data";

const categories: SkillCategory[] = ["Frontend", "Backend", "Herramientas"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Skills() {
  return (
    <div className="mt-14 w-full space-y-10">
      {categories.map((category) => {
        const items = skills.filter((skill) => skill.category === category);
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
              {category}
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
            >
              {items.map(({ name, icon: Icon, color }) => (
                <motion.div
                  key={name}
                  variants={item}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center transition-colors hover:border-orange-400/30 hover:bg-white/10"
                >
                  <Icon
                    size={32}
                    color={color}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                    {name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
