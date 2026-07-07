import type { Metadata } from "next";
import { profile } from "@/lib/data";
import Contact from "@/app/components/Contact";

export const metadata: Metadata = {
  title: `Contacto — ${profile.name}`,
};

export default function ContactoPage() {
  return <Contact />;
}
