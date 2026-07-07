import type { Metadata } from "next";
import { profile } from "@/lib/data";
import Projects from "@/app/components/Projects";

export const metadata: Metadata = {
  title: `Proyectos — ${profile.name}`,
};

export default function ProyectosPage() {
  return <Projects />;
}
