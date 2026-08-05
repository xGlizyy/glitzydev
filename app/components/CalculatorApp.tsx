"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { FiDelete } from "react-icons/fi";
import { useGlowSuppression } from "@/lib/hooks/useGlowSuppression";
import { evaluateExpression, formatResult, type AngleMode } from "@/lib/calculator/evaluate";

const MAX_LENGTH = 100;

type ButtonSpec = { label: string; insert: string; variant?: "op" | "muted" };

const SCIENTIFIC_BUTTONS: ButtonSpec[] = [
  { label: "sin", insert: "sin(", variant: "muted" },
  { label: "cos", insert: "cos(", variant: "muted" },
  { label: "tan", insert: "tan(", variant: "muted" },
  { label: "xʸ", insert: "^", variant: "op" },
  { label: "log", insert: "log(", variant: "muted" },
  { label: "ln", insert: "ln(", variant: "muted" },
  { label: "√", insert: "sqrt(", variant: "muted" },
  { label: "%", insert: "%", variant: "op" },
  { label: "π", insert: "π", variant: "muted" },
  { label: "e", insert: "e", variant: "muted" },
  { label: "!", insert: "!", variant: "op" },
  { label: "±", insert: "±", variant: "op" },
];

const PAD_BUTTONS: ButtonSpec[] = [
  { label: "AC", insert: "AC", variant: "muted" },
  { label: "(", insert: "(", variant: "muted" },
  { label: ")", insert: ")", variant: "muted" },
  { label: "÷", insert: "÷", variant: "op" },
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "×", insert: "×", variant: "op" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "−", insert: "−", variant: "op" },
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "+", insert: "+", variant: "op" },
  { label: "0", insert: "0" },
  { label: ".", insert: "." },
  { label: "DEL", insert: "DEL", variant: "muted" },
];

export default function CalculatorApp() {
  const glow = useGlowSuppression();
  const [expression, setExpression] = useState("");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");

  const preview = useMemo(() => {
    if (!expression.trim()) return null;
    try {
      return formatResult(evaluateExpression(expression, angleMode));
    } catch {
      return null;
    }
  }, [expression, angleMode]);

  function applyToggleSign(current: string): string {
    // Wraps the trailing number in a unary minus instead of trying to
    // mutate it in place, since the expression is plain text and the
    // "current number" has no fixed boundary otherwise. No-ops when there's
    // no trailing number rather than inserting a dangling "(-" the user
    // would have to close themselves.
    const trailingNumber = current.match(/(\d+(\.\d+)?)$/);
    if (!trailingNumber) return current;
    const start = current.length - trailingNumber[0].length;
    return `${current.slice(0, start)}(-${trailingNumber[0]})`;
  }

  function press(button: ButtonSpec) {
    // A prior "=" may have left the display showing "Error" — the next
    // keypress should start a fresh expression, not append to that text.
    const base = expression === "Error" ? "" : expression;

    if (button.insert === "AC") {
      setExpression("");
      return;
    }
    if (button.insert === "DEL") {
      setExpression(base.slice(0, -1));
      return;
    }
    if (button.insert === "±") {
      setExpression(applyToggleSign(base));
      return;
    }
    setExpression(base.length >= MAX_LENGTH ? base : base + button.insert);
  }

  function pressEquals() {
    try {
      const result = formatResult(evaluateExpression(expression, angleMode));
      setExpression(result);
    } catch {
      setExpression("Error");
    }
  }

  function buttonClasses(variant: ButtonSpec["variant"]) {
    if (variant === "op") return "text-orange-300 hover:bg-orange-400/10";
    if (variant === "muted") return "text-zinc-400 hover:bg-white/10";
    return "text-zinc-100 hover:bg-white/10";
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-5.5rem)] w-full max-w-xs flex-col items-center justify-center gap-2.5 px-4 py-2 pb-24">
      <h1 className="text-lg font-semibold text-zinc-50">Calculadora</h1>

      <div className="glass flex gap-1 rounded-full p-1 text-xs">
        {(["deg", "rad"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAngleMode(mode)}
            className="relative rounded-full px-3 py-1 font-medium transition-colors"
          >
            {angleMode === mode && (
              <motion.span
                layoutId="angle-mode-highlight"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 ${angleMode === mode ? "text-black" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              {mode === "deg" ? "Grados" : "Radianes"}
            </span>
          </button>
        ))}
      </div>

      <div className="glass w-full rounded-2xl p-3">
        <div className="min-h-4 overflow-x-auto whitespace-nowrap text-right text-xs text-zinc-500">
          {expression || " "}
        </div>
        <div className="mt-0.5 overflow-x-auto whitespace-nowrap text-right text-2xl font-semibold text-zinc-50">
          {expression === "Error" ? "Error" : (preview ?? expression) || "0"}
        </div>
      </div>

      <div className="grid w-full grid-cols-4 gap-1.5">
        {SCIENTIFIC_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => press(button)}
            onPointerEnter={glow.onPointerEnter}
            onPointerLeave={glow.onPointerLeave}
            className={`rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium transition-colors ${buttonClasses(button.variant)}`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="grid w-full grid-cols-4 gap-1.5">
        {PAD_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => press(button)}
            onPointerEnter={glow.onPointerEnter}
            onPointerLeave={glow.onPointerLeave}
            className={`flex items-center justify-center rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium transition-colors ${buttonClasses(button.variant)}`}
          >
            {button.label === "DEL" ? <FiDelete /> : button.label}
          </button>
        ))}
        <button
          type="button"
          onClick={pressEquals}
          onPointerEnter={glow.onPointerEnter}
          onPointerLeave={glow.onPointerLeave}
          className="col-span-4 mt-0.5 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 py-2 text-sm font-semibold text-black transition hover:brightness-110"
        >
          =
        </button>
      </div>
    </div>
  );
}
