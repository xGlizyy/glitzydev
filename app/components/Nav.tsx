"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import AccountMenu from "@/app/components/AccountMenu";

const links = [
  { href: "/buscar", label: "Buscar" },
  { href: "/resumen", label: "Resúmenes" },
];

export default function Nav({ userEmail }: { userEmail: string | null }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <nav className="nav-shell relative flex w-full max-w-3xl items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-5">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-orange-400/40 bg-orange-400/10"
          >
            <Image
              src="/logo-pagina.png"
              alt="Wordexa"
              fill
              sizes="36px"
              className="scale-90 object-contain"
            />
          </motion.span>
          <span className="hidden text-sm font-medium text-zinc-300 sm:inline">Wordexa</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHovered(link.href)}
              onMouseLeave={() => setHovered(null)}
              className="relative rounded-full px-4 py-1.5 text-zinc-400 transition-colors hover:text-orange-300"
            >
              {hovered === link.href && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full border border-orange-400/30 bg-orange-400/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
          <div className="ml-1">
            <AccountMenu userEmail={userEmail} />
          </div>
        </div>
      </nav>
    </header>
  );
}
