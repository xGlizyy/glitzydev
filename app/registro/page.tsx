import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/app/components/AuthForm";

export default async function RegistroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/cuenta");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 pb-16 pt-32">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Gratis. Guarda palabras favoritas y consulta tu historial cuando quieras.
        </p>
      </div>

      <AuthForm action={signUp} submitLabel="Crear cuenta" pendingLabel="Creando…" />

      <p className="text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-orange-300 hover:text-orange-200">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
