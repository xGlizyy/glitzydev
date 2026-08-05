"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import AccountMenu from "@/app/components/AccountMenu";
import ToolsMenu from "@/app/components/ToolsMenu";

export default function Nav({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <nav className="nav-shell relative flex w-full max-w-3xl items-center justify-between gap-2 rounded-full px-3 py-2 sm:gap-4 sm:px-5 sm:py-2.5">
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
          <span className="hidden font-industrial text-sm tracking-wide text-zinc-300 sm:inline">
            Wordexa
          </span>
        </Link>

        <div className="flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
          <ToolsMenu />
          <div className="ml-1">
            <AccountMenu userEmail={userEmail} />
          </div>
        </div>
      </nav>
    </header>
  );
}
