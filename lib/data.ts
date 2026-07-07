import type { IconType } from "react-icons";
import {
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiGit,
  SiGithub,
  SiGo,
  SiGraphql,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { FaCss3Alt, FaHtml5 } from "react-icons/fa6";

export const profile = {
  name: "Samuel Martinez",
  alias: "Aleeas Glitzy",
  tagline: "Desarrollador Full Stack",
  about:
    "Construyo productos web de punta a punta: interfaz, API y base de datos, cuidando rendimiento y experiencia de usuario.",
};

export type Skill = {
  name: string;
  icon: IconType;
  color: string;
};

// Stack principal: edita para reflejar lo que realmente dominas.
export const skills: Skill[] = [
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  { name: "Express", icon: SiExpress, color: "#FFFFFF" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Java", icon: SiOpenjdk, color: "#E76F00" },
  { name: "C++", icon: SiCplusplus, color: "#00599C" },
  { name: "Go", icon: SiGo, color: "#00ADD8" },
  { name: "HTML5", icon: FaHtml5, color: "#E34F26" },
  { name: "CSS3", icon: FaCss3Alt, color: "#1572B6" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "GraphQL", icon: SiGraphql, color: "#E10098" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "Git", icon: SiGit, color: "#F05032" },
  { name: "GitHub", icon: SiGithub, color: "#FFFFFF" },
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
