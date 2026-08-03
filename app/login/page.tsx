import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/app/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registrado?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/cuenta");

  const { registrado } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 pb-16 pt-32">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-50">Inicia sesión</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Accede para guardar tus favoritos y tu historial de búsquedas.
        </p>
      </div>

      <AuthForm
        action={signIn}
        submitLabel="Iniciar sesión"
        pendingLabel="Entrando…"
        notice={
          registrado
            ? "Cuenta creada. Revisa tu email para confirmarla y después inicia sesión."
            : undefined
        }
      />

      <p className="text-sm text-zinc-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-orange-300 hover:text-orange-200">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
