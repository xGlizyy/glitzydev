export const profile = {
  name: "Samuel Martinez",
  alias: "Aleeas Glitzy",
  tagline: "Desarrollador Full Stack",
  about:
    "Desarrollador Full Stack apasionado por construir productos con React y Node.js. Me gusta trabajar en todo el ciclo de una aplicación, desde la interfaz hasta la API y la base de datos, cuidando el rendimiento y la experiencia de usuario.",
};

export const focus = ["JavaScript", "TypeScript", "React", "Node.js"];

// Lista amplia de lenguajes de programación (a modo de referencia general).
// Edita esta lista para dejar solo los que realmente dominas.
export const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "SQL",
  "HTML",
  "CSS",
  "Bash / Shell",
  "R",
  "MATLAB",
  "Scala",
  "Perl",
  "Lua",
  "Haskell",
  "Elixir",
  "Objective-C",
  "F#",
  "Julia",
  "Groovy",
  "VBA",
];

export type Project = {
  title: string;
  description: string;
  tech: string[];
  link: string;
  repo: string;
};

// Placeholders: sustituye por tus proyectos reales.
export const projects: Project[] = [
  {
    title: "Añade tu proyecto aquí",
    description:
      "Breve descripción del proyecto: qué problema resuelve y cuál fue tu rol.",
    tech: ["React", "Node.js"],
    link: "#",
    repo: "#",
  },
  {
    title: "Añade tu proyecto aquí",
    description:
      "Breve descripción del proyecto: qué problema resuelve y cuál fue tu rol.",
    tech: ["TypeScript", "Next.js"],
    link: "#",
    repo: "#",
  },
  {
    title: "Añade tu proyecto aquí",
    description:
      "Breve descripción del proyecto: qué problema resuelve y cuál fue tu rol.",
    tech: ["Node.js", "PostgreSQL"],
    link: "#",
    repo: "#",
  },
];

// Placeholders: sustituye por tus datos reales de contacto.
export const contact = {
  email: "tu@email.com",
  github: "https://github.com/tu-usuario",
  linkedin: "https://linkedin.com/in/tu-usuario",
};
