import { NextRequest, NextResponse } from "next/server";
import { fetchSpanishEntry } from "@/lib/dictionary/es";
import { fetchEnglishEntry } from "@/lib/dictionary/en";
import type { LookupResponse } from "@/lib/dictionary/types";

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get("q")?.trim();
  if (!word) {
    return NextResponse.json({ error: "Falta el parámetro q" }, { status: 400 });
  }

  // `lang` scopes the lookup to a single dictionary (used by the language
  // picker in the search bar); omitted/invalid falls back to both, as before.
  const langParam = request.nextUrl.searchParams.get("lang");
  const lang = langParam === "es" || langParam === "en" ? langParam : null;

  const [es, en] = await Promise.all([
    lang && lang !== "es" ? Promise.resolve(null) : fetchSpanishEntry(word).catch(() => null),
    lang && lang !== "en" ? Promise.resolve(null) : fetchEnglishEntry(word).catch(() => null),
  ]);

  const body: LookupResponse = { query: word, es, en };
  return NextResponse.json(body);
}
