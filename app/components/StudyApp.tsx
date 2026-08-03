"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import type { StudyPack } from "@/lib/study/types";

type Status = "idle" | "loading" | "error" | "done";
type Mode = "pdf" | "text";

const MIN_TEXT_LENGTH = 40;

export default function StudyApp() {
  const [mode, setMode] = useState<Mode>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<StudyPack | null>(null);
  const [openAnswers, setOpenAnswers] = useState<Set<number>>(new Set());
  const glow = useGlowSuppression();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setError("");
    setResult(null);
  }

  function toggleAnswer(index: number) {
    setOpenAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const canSubmit = mode === "pdf" ? !!file : text.trim().length >= MIN_TEXT_LENGTH;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError("");
    setResult(null);
    setOpenAnswers(new Set());

    try {
      const formData = new FormData();
      if (mode === "pdf" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", text.trim());
      }

      const res = await fetch("/api/resumen", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Hubo un problema generando el resumen.");
        setStatus("error");
        return;
      }

      setResult(data as StudyPack);
      setStatus("done");
    } catch {
      setError("Hubo un problema generando el resumen. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 pb-24 pt-36">
      <div className="flex w-full flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
          Resúmenes y preguntas de examen
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          Sube un PDF o pega un texto con tus apuntes y genera un resumen junto a preguntas tipo
          examen para repasar.
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col items-center gap-4">
        <div className="flex gap-2 rounded-full border border-white/10 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMode("pdf")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              mode === "pdf"
                ? "bg-orange-400/10 text-orange-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Subir PDF
          </button>
          <button
            type="button"
            onClick={() => switchMode("text")}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              mode === "text"
                ? "bg-orange-400/10 text-orange-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Escribir texto
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          onPointerEnter={glow.onPointerEnter}
          onPointerLeave={glow.onPointerLeave}
          className="glass flex w-full flex-col items-center gap-4 rounded-3xl p-6"
        >
          {mode === "pdf" ? (
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full cursor-pointer text-sm text-zinc-300 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-orange-400/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-orange-300 hover:file:bg-orange-400/20"
            />
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega o escribe aquí tus apuntes…"
              rows={8}
              className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-orange-400/50 focus:outline-none"
            />
          )}
          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="w-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
          >
            {status === "loading" ? "Generando…" : "Generar resumen"}
          </button>
        </form>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}

      {status === "done" && result && (
        <div className="w-full space-y-4">
          <div className="glass space-y-3 rounded-3xl p-6 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-300">
              Resumen
            </h2>
            <p className="whitespace-pre-line text-sm text-zinc-300">{result.summary}</p>
          </div>

          {result.questions.length > 0 && (
            <div className="glass space-y-4 rounded-3xl p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-300">
                Preguntas de examen
              </h2>
              <ol className="space-y-4 text-sm text-zinc-300">
                {result.questions.map((q, i) => (
                  <li key={i} className="space-y-2">
                    <p>
                      <span className="text-zinc-600">{i + 1}.</span> {q.question}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleAnswer(i)}
                      className="text-xs font-medium text-orange-300 hover:text-orange-200"
                    >
                      {openAnswers.has(i) ? "Ocultar respuesta" : "Ver respuesta"}
                    </button>
                    {openAnswers.has(i) && (
                      <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                        {q.answer}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
