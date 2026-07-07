"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/lib/data";

const links = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

const initials = profile.name
  .split(" ")
  .map((word) => word[0])
  .join("");

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/40 bg-orange-400/10 text-sm font-semibold text-orange-300 transition-colors hover:bg-orange-400/20"
        >
          {initials}
        </Link>
        <ul className="flex gap-6 text-sm text-zinc-400">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors hover:text-orange-400 ${
                    active ? "text-orange-400" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
