import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Background from "@/app/components/Background";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import CookieConsent from "@/app/components/CookieConsent";
import { createClient } from "@/lib/supabase/server";
import { getCookieConsent } from "@/lib/cookies/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wordexa ・ Estudiantes",
  description: "Busca definiciones, sinónimos y antónimos en español e inglés.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cookieConsent = await getCookieConsent();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-black text-zinc-50">
        <Background />
        <Nav userEmail={user?.email ?? null} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent initialConsent={cookieConsent} />
      </body>
    </html>
  );
}
