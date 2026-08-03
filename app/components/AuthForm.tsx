"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/auth/actions";

export default function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  notice,
}: {
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  pendingLabel: string;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      {notice && (
        <p className="rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-sm text-orange-200">
          {notice}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-orange-400/50"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-orange-400/50"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-40"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
