import { FiBookOpen, FiEye, FiClock, FiGrid } from "react-icons/fi";
import DifficultySelector from "@/app/components/DifficultySelector";
import GameCard from "@/app/components/games/GameCard";

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
      <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-5 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Juegos de vocabulario</h1>
        <p className="max-w-md text-sm text-zinc-400">
          Sin límite de partidas ni de horario: juega cuando quieras, las veces que quieras.
        </p>
      </div>

      <DifficultySelector />

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {GAMES.map(({ Icon, ...game }) => (
          <GameCard key={game.href} {...game} icon={<Icon className="text-lg" />} />
        ))}
      </div>
    </div>
  );
}
