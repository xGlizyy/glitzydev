import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-zinc-600">
      © {new Date().getFullYear()} {profile.name}
    </footer>
  );
}
