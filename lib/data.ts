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

export type SkillCategory = "Frontend" | "Backend" | "Herramientas";

export type Skill = {
  name: string;
  icon: IconType;
  color: string;
  category: SkillCategory;
};

// Stack principal: edita para reflejar lo que realmente dominas.
export const skills: Skill[] = [
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E", category: "Frontend" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", category: "Frontend" },
  { name: "React", icon: SiReact, color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", icon: SiNextdotjs, color: "#FFFFFF", category: "Frontend" },
  { name: "HTML5", icon: FaHtml5, color: "#E34F26", category: "Frontend" },
  { name: "CSS3", icon: FaCss3Alt, color: "#1572B6", category: "Frontend" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8", category: "Frontend" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E", category: "Backend" },
  { name: "Express", icon: SiExpress, color: "#FFFFFF", category: "Backend" },
  { name: "Python", icon: SiPython, color: "#3776AB", category: "Backend" },
  { name: "Java", icon: SiOpenjdk, color: "#E76F00", category: "Backend" },
  { name: "C++", icon: SiCplusplus, color: "#00599C", category: "Backend" },
  { name: "Go", icon: SiGo, color: "#00ADD8", category: "Backend" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1", category: "Backend" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248", category: "Backend" },
  { name: "GraphQL", icon: SiGraphql, color: "#E10098", category: "Backend" },
  { name: "Docker", icon: SiDocker, color: "#2496ED", category: "Herramientas" },
  { name: "Git", icon: SiGit, color: "#F05032", category: "Herramientas" },
  { name: "GitHub", icon: SiGithub, color: "#FFFFFF", category: "Herramientas" },
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
