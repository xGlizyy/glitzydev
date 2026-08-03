import Link from "next/link";
import ManageCookiesLink from "@/app/components/ManageCookiesLink";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-600">
      <p>© {new Date().getFullYear()} · Bletz Development Program - Estudiantes</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link
          href="/politica-de-cookies"
          className="underline-offset-2 hover:text-orange-300 hover:underline"
        >
          Política de cookies
        </Link>
        <ManageCookiesLink />
      </p>
    </footer>
  );
}
