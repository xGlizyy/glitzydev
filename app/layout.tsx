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
      <body className="h-full overflow-hidden bg-black text-zinc-50">
        <Background />
        <Nav userEmail={user?.email ?? null} />
        <div className="fixed inset-x-0 top-[5.5rem] bottom-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="flex min-h-full flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
        <CookieConsent initialConsent={cookieConsent} />
      </body>
    </html>
  );
}
