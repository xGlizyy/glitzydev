import Link from "next/link";
import { redirect } from "next/navigation";
import { FiClock, FiStar, FiX } from "react-icons/fi";
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

  const favoriteCount = favorites?.length ?? 0;
  const historyCount = history?.length ?? 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-24 pt-32">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-2xl font-semibold text-black shadow-lg shadow-orange-500/20">
            {user.email?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-zinc-50">Mi cuenta</h1>
            <p className="mt-1 truncate text-sm text-zinc-400">{user.email}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
              <FiStar className="text-orange-300" /> {favoriteCount} favoritos
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
              <FiClock className="text-orange-300" /> {historyCount} búsquedas
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
            <FiStar />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Favoritos</h2>
            <p className="text-xs text-zinc-500">Palabras que has guardado</p>
          </div>
        </div>

        {!favorites?.length ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-600">
              <FiStar />
            </span>
            <p className="max-w-xs text-sm text-zinc-500">
              Aún no tienes palabras guardadas. Búscalas y pulsa la estrella para guardarlas.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {favorites.map((fav) => (
              <li
                key={fav.id}
                className="glass glass-hover flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
              >
                <Link
                  href={`/buscar?q=${encodeURIComponent(fav.word)}`}
                  className="flex min-w-0 items-center gap-2 text-sm text-zinc-200 hover:text-orange-300"
                >
                  <span className="truncate">{fav.word}</span>
                  <span className="shrink-0 rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    {fav.language === "es" ? "ES" : "EN"}
                  </span>
                </Link>
                <form action={removeFavorite}>
                  <input type="hidden" name="id" value={fav.id} />
                  <button
                    type="submit"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-red-400/10 hover:text-red-400"
                    aria-label={`Quitar ${fav.word} de favoritos`}
                  >
                    <FiX className="text-sm" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-400/10 text-orange-300">
            <FiClock />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Historial reciente</h2>
            <p className="text-xs text-zinc-500">Tus últimas búsquedas</p>
          </div>
        </div>

        {!history?.length ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-600">
              <FiClock />
            </span>
            <p className="max-w-xs text-sm text-zinc-500">Todavía no has buscado ninguna palabra.</p>
          </div>
        ) : (
          <div className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/buscar?q=${encodeURIComponent(item.word)}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-orange-300"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400/60" />
                  <span className="truncate">{item.word}</span>
                  <span className="shrink-0 rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    {item.language === "es" ? "ES" : "EN"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-zinc-600">
                  {new Date(item.searched_at).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
