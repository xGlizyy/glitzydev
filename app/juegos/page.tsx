import Link from "next/link";
import { FiZap, FiBookOpen, FiEye, FiClock } from "react-icons/fi";

const GAMES = [
  {
    href: "/reto",
    label: "Reto diario",
    description: "5 preguntas nuevas cada día. Mantén la racha.",
    Icon: FiZap,
  },
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
    description: "Sinónimos y antónimos contra el reloj. 60 segundos.",
    Icon: FiClock,
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

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="glass glass-hover flex flex-col items-start gap-3 rounded-2xl p-6 transition"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
              <game.Icon className="text-lg" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-100">{game.label}</span>
              <span className="mt-1 block text-sm text-zinc-400">{game.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
