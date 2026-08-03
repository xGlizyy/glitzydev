import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FavoriteRow = { id: string; word: string; language: "es" | "en"; created_at: string };
type HistoryRow = { id: string; word: string; language: "es" | "en"; searched_at: string };

async function removeFavorite(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("favorites").delete().eq("id", id).eq("user_id", user.id);
}

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: favorites }, { data: history }] = await Promise.all([
    supabase
      .from("favorites")
      .select("id, word, language, created_at")
      .order("created_at", { ascending: false })
      .returns<FavoriteRow[]>(),
    supabase
      .from("search_history")
      .select("id, word, language, searched_at")
      .order("searched_at", { ascending: false })
      .limit(20)
      .returns<HistoryRow[]>(),
  ]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 pb-24 pt-32">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Mi cuenta</h1>
        <p className="mt-2 text-sm text-zinc-500">{user.email}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-300">
          Favoritos
        </h2>
        {!favorites?.length ? (
          <p className="text-sm text-zinc-500">
            Aún no tienes palabras guardadas. Búscalas y pulsa la estrella para guardarlas.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {favorites.map((fav) => (
              <li
                key={fav.id}
                className="glass glass-hover flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <Link
                  href={`/buscar?q=${encodeURIComponent(fav.word)}`}
                  className="text-sm text-zinc-200 hover:text-orange-300"
                >
                  {fav.word}{" "}
                  <span className="text-xs text-zinc-500">
                    ({fav.language === "es" ? "ES" : "EN"})
                  </span>
                </Link>
                <form action={removeFavorite}>
                  <input type="hidden" name="id" value={fav.id} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-500 hover:text-red-400"
                    aria-label={`Quitar ${fav.word} de favoritos`}
                  >
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-300">
          Historial reciente
        </h2>
        {!history?.length ? (
          <p className="text-sm text-zinc-500">Todavía no has buscado ninguna palabra.</p>
        ) : (
          <ul className="space-y-1.5">
            {history.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/buscar?q=${encodeURIComponent(item.word)}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-orange-300"
                >
                  <span>
                    {item.word}{" "}
                    <span className="text-xs text-zinc-500">
                      ({item.language === "es" ? "ES" : "EN"})
                    </span>
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(item.searched_at).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
