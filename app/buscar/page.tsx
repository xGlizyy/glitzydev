import { createClient } from "@/lib/supabase/server";
import SearchApp from "@/app/components/SearchApp";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { q } = await searchParams;

  return <SearchApp isAuthenticated={!!user} initialQuery={q} />;
}
