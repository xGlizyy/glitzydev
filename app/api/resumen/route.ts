import { NextRequest, NextResponse } from "next/server";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { generateStudyPack } from "@/lib/study/generateStudyPack";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_TEXT_LENGTH = 200_000;
const MIN_TEXT_LENGTH = 40;

async function extractFromFile(file: Blob): Promise<
  { text: string } | { error: string; status: number }
> {
  if (file.size === 0) {
    return { error: "Sube un archivo PDF.", status: 400 };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "El PDF pesa demasiado (máximo 15 MB).", status: 400 };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = result.text.trim();
    if (!text) {
      return {
        error: "No se encontró texto en el PDF (¿es un escaneo de imágenes?).",
        status: 422,
      };
    }
    return { text };
  } catch (err) {
    console.error("pdf-parse error", err);
    return {
      error: "No se pudo leer el PDF. ¿Está dañado o protegido con contraseña?",
      status: 422,
    };
  } finally {
    await parser.destroy();
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  const rawText = formData.get("text");

  let text: string;

  if (file instanceof Blob && file.size > 0) {
    const result = await extractFromFile(file);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    text = result.text;
  } else if (typeof rawText === "string" && rawText.trim()) {
    text = rawText.trim().slice(0, MAX_TEXT_LENGTH);
    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Escribe un poco más de texto para poder generar un resumen." },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "Sube un PDF o escribe un texto." },
      { status: 400 },
    );
  }

  const studyPack = generateStudyPack(text);
  if (!studyPack.summary) {
    return NextResponse.json(
      { error: "No hay texto suficiente para generar un resumen." },
      { status: 422 },
    );
  }

  return NextResponse.json(studyPack);
}
