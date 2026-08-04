export type Difficulty = "facil" | "normal" | "dificil";

export const DIFFICULTY_KEY = "juegos:dificultad";

export const DEFAULT_DIFFICULTY: Difficulty = "normal";

export const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: "facil", label: "Fácil", description: "Menos opciones por pregunta, ideal para calentar." },
  { value: "normal", label: "Normal", description: "El equilibrio de siempre." },
  { value: "dificil", label: "Difícil", description: "Más opciones y menos margen de tiempo." },
];

type DifficultyConfig = {
  /** Opciones por pregunta en Definición e Intruso; también el número de palabras mostradas en Intruso. */
  options: number;
  /** Pares a memorizar en Parejas. */
  pairs: number;
  /** Duración de la ronda de Contrarreloj, en segundos. */
  seconds: number;
};

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  facil: { options: 3, pairs: 6, seconds: 75 },
  normal: { options: 4, pairs: 8, seconds: 60 },
  dificil: { options: 5, pairs: 12, seconds: 45 },
};

function isDifficulty(value: string | null): value is Difficulty {
  return value === "facil" || value === "normal" || value === "dificil";
}

export function readDifficulty(): Difficulty {
  try {
    const raw = window.localStorage.getItem(DIFFICULTY_KEY);
    return isDifficulty(raw) ? raw : DEFAULT_DIFFICULTY;
  } catch {
    return DEFAULT_DIFFICULTY;
  }
}

export function writeDifficulty(value: Difficulty) {
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, value);
  } catch {
    // localStorage puede fallar en modo privado; la dificultad sigue aplicando en esta pestaña.
  }
}
