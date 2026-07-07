"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { profile } from "@/lib/data";
import Typewriter from "@/app/components/Typewriter";

const links = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <motion.div variants={item} className="flex flex-col items-center gap-4">
        <h1 className="animate-shine bg-gradient-to-r from-orange-200 via-white to-orange-200 bg-[length:200%_auto] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          {profile.name}
        </h1>
        <motion.span
          initial={{ opacity: 0, y: -6, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 16 }}
          className="inline-block rounded-full border border-orange-400/25 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400"
        >
          también conocido como <span className="text-orange-300">{profile.alias}</span>
        </motion.span>
      </motion.div>

      <motion.div variants={item}>
        <Typewriter
          text={profile.tagline}
          className="min-h-[2rem] text-xl text-zinc-400 sm:text-2xl"
        />
      </motion.div>

      <motion.div variants={item} className="mt-6 flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <motion.div
            key={link.href}
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href={link.href}
              className="block rounded-full border border-orange-400/30 bg-orange-400/10 px-5 py-2 text-sm font-medium text-orange-300 transition-colors hover:border-orange-400/60 hover:bg-orange-400/20"
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
