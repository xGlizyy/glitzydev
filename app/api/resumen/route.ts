import { NextRequest, NextResponse } from "next/server";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { generateStudyPack } from "@/lib/study/generateStudyPack";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Sube un archivo PDF." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El PDF pesa demasiado (máximo 15 MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });
  let text: string;
  try {
    const result = await parser.getText();
    text = result.text.trim();
  } catch (err) {
    console.error("pdf-parse error", err);
    return NextResponse.json(
      { error: "No se pudo leer el PDF. ¿Está dañado o protegido con contraseña?" },
      { status: 422 },
    );
  } finally {
    await parser.destroy();
  }

  if (!text) {
    return NextResponse.json(
      { error: "No se encontró texto en el PDF (¿es un escaneo de imágenes?)." },
      { status: 422 },
    );
  }

  const studyPack = generateStudyPack(text);
  if (!studyPack.summary) {
    return NextResponse.json(
      { error: "El PDF no tiene suficiente texto para generar un resumen." },
      { status: 422 },
    );
  }

  return NextResponse.json(studyPack);
}
