import { NextRequest, NextResponse } from "next/server";
import { fetchSpanishEntry } from "@/lib/dictionary/es";
import { fetchEnglishEntry } from "@/lib/dictionary/en";
import type { LookupResponse } from "@/lib/dictionary/types";

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get("q")?.trim();
  if (!word) {
    return NextResponse.json({ error: "Falta el parámetro q" }, { status: 400 });
  }

  const [es, en] = await Promise.all([
    fetchSpanishEntry(word).catch(() => null),
    fetchEnglishEntry(word).catch(() => null),
  ]);

  const body: LookupResponse = { query: word, es, en };
  return NextResponse.json(body);
}
