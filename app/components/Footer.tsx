import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} {profile.name}. Todos los derechos reservados.
    </footer>
  );
}
