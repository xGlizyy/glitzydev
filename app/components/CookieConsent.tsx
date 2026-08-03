"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FiInfo, FiSettings, FiX } from "react-icons/fi";
import { setCookieConsent } from "@/lib/cookies/actions";
import type { CookieChoices, CookieConsentValue } from "@/lib/cookies/types";

const OPEN_PREFERENCES_EVENT = "cookies:open-preferences";

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

const ACCEPT_ALL: CookieChoices = { analytics: true, preferences: true };
const REJECT_ALL: CookieChoices = { analytics: false, preferences: false };

export default function CookieConsent({
  initialConsent,
}: {
  initialConsent: CookieConsentValue | null;
}) {
  const [consent, setConsent] = useState(initialConsent);
  const [visible, setVisible] = useState(initialConsent === null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState<CookieChoices>({
    analytics: initialConsent?.analytics ?? false,
    preferences: initialConsent?.preferences ?? false,
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleOpen() {
      setDraft({
        analytics: consent?.analytics ?? false,
        preferences: consent?.preferences ?? false,
      });
      setPanelOpen(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, handleOpen);
  }, [consent]);

  function persist(choices: CookieChoices) {
    startTransition(async () => {
      await setCookieConsent(choices);
      setConsent({ necessary: true, ...choices });
      setVisible(false);
      setPanelOpen(false);
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:justify-end sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass w-full max-w-sm rounded-2xl p-5 sm:max-w-lg"
          >
            {!panelOpen ? (
              <>
                <div className="flex items-start gap-3">
                  <FiInfo className="mt-0.5 shrink-0 text-lg text-orange-300" />
                  <p className="text-sm text-zinc-300">
                    Usamos cookies necesarias para que la web funcione (como mantener tu
                    sesión iniciada) y, si lo permites, cookies de preferencias y
                    analítica para mejorar tu experiencia.{" "}
                    <Link
                      href="/politica-de-cookies"
                      className="text-orange-300 underline underline-offset-2 hover:text-orange-200"
                    >
                      Más información
                    </Link>
                    .
                  </p>
                </div>
                <div className="mt-4 -mx-1 flex flex-nowrap justify-end gap-1.5 overflow-x-auto px-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-orange-400/40 hover:text-orange-300 sm:text-sm"
                  >
                    Personalizar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => persist(REJECT_ALL)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-orange-400/40 hover:text-orange-300 disabled:opacity-50 sm:text-sm"
                  >
                    Rechazar no esenciales
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => persist(ACCEPT_ALL)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-xs font-medium text-orange-300 transition hover:bg-orange-400/20 disabled:opacity-50 sm:text-sm"
                  >
                    Aceptar todas
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                    <FiSettings className="text-orange-300" /> Preferencias de cookies
                  </p>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    aria-label="Cerrar"
                    className="text-zinc-500 transition hover:text-zinc-200"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-3 py-2.5 opacity-70">
                    <span>
                      <span className="block text-sm text-zinc-200">Necesarias</span>
                      <span className="block text-xs text-zinc-500">
                        Imprescindibles para iniciar sesión y navegar. Siempre activas.
                      </span>
                    </span>
                    <input type="checkbox" checked disabled className="h-4 w-4 accent-orange-400" />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-3 py-2.5">
                    <span>
                      <span className="block text-sm text-zinc-200">Preferencias</span>
                      <span className="block text-xs text-zinc-500">
                        Recuerdan ajustes como tu configuración de la interfaz.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={draft.preferences}
                      onChange={(e) => setDraft((d) => ({ ...d, preferences: e.target.checked }))}
                      className="h-4 w-4 accent-orange-400"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-3 py-2.5">
                    <span>
                      <span className="block text-sm text-zinc-200">Analítica</span>
                      <span className="block text-xs text-zinc-500">
                        Nos ayudan a entender el uso de la web para mejorarla.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={draft.analytics}
                      onChange={(e) => setDraft((d) => ({ ...d, analytics: e.target.checked }))}
                      className="h-4 w-4 accent-orange-400"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => persist(REJECT_ALL)}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition hover:border-orange-400/40 hover:text-orange-300 disabled:opacity-50"
                  >
                    Rechazar no esenciales
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => persist(draft)}
                    className="rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-sm font-medium text-orange-300 transition hover:bg-orange-400/20 disabled:opacity-50"
                  >
                    Guardar preferencias
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
