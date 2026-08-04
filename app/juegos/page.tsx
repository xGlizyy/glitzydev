import Link from "next/link";
import { FiBookOpen, FiEye, FiClock, FiGrid, FiPlay } from "react-icons/fi";
import DifficultySelector from "@/app/components/DifficultySelector";

const GAMES = [
  {
    href: "/juegos/definicion",
    label: "Definición",
    description: "Te damos la definición real; adivina la palabra.",
    Icon: FiBookOpen,
  },
  {
    href: "/juegos/intruso",
    label: "Intruso",
    description: "Entre varias palabras, encuentra la que no encaja.",
    Icon: FiEye,
  },
  {
    href: "/juegos/contrarreloj",
    label: "Contrarreloj",
    description: "Sinónimos y antónimos contra el reloj.",
    Icon: FiClock,
  },
  {
    href: "/juegos/parejas",
    label: "Parejas",
    description: "Memoriza las cartas y empareja cada palabra con su sinónimo.",
    Icon: FiGrid,
  },
];

export default function JuegosPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 pb-16 pt-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Juegos de vocabulario</h1>
        <p className="max-w-md text-sm text-zinc-400">
          Sin límite de partidas ni de horario: juega cuando quieras, las veces que quieras.
        </p>
      </div>

      <DifficultySelector />

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {GAMES.map((game) => (
          <div
            key={game.href}
            className="glass glass-hover relative flex flex-col items-start gap-3 rounded-2xl p-6 transition"
          >
            <Link
              href={game.href}
              aria-label={`Jugar a ${game.label}`}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-black shadow-lg shadow-orange-500/20 transition hover:brightness-110"
            >
              <FiPlay className="text-sm" />
            </Link>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
              <game.Icon className="text-lg" />
            </span>
            <span className="pr-8">
              <span className="block text-sm font-semibold text-zinc-100">{game.label}</span>
              <span className="mt-1 block text-sm text-zinc-400">{game.description}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
