"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FiPlay } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";

type GameCardProps = {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
};

export default function GameCard({ href, label, description, icon }: GameCardProps) {
  const glow = useGlowSuppression();

  return (
    <div
      onPointerEnter={glow.onPointerEnter}
      onPointerLeave={glow.onPointerLeave}
      className="glass glass-hover relative flex flex-col items-start gap-3 rounded-2xl p-6 transition"
    >
      <Link
        href={href}
        aria-label={`Jugar a ${label}`}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-black shadow-lg shadow-orange-500/20 transition hover:brightness-110"
      >
        <FiPlay className="text-sm" />
      </Link>

      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
        {icon}
      </span>
      <span className="pr-8">
        <span className="block text-sm font-semibold text-zinc-100">{label}</span>
        <span className="mt-1 block text-sm text-zinc-400">{description}</span>
      </span>
    </div>
  );
}
