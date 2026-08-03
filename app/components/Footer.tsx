export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-600">
      © {new Date().getFullYear()} · Datos de Wikcionario, Free Dictionary API y Datamuse
    </footer>
  );
}
