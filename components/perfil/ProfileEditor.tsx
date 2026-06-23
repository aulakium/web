"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { LOCALES } from "@/lib/i18n";
import { updateProfile, setUiLocale, type ProfileState } from "@/app/(app)/perfil/actions";

export function ProfileEditor({
  fullName,
  uiLocale,
}: {
  fullName: string;
  uiLocale: string | null;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Nombre */}
      <form action={formAction} className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
        <h2 className="mb-3 font-display text-base font-700 text-ink">Tus datos</h2>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-700 text-ink">
          Nombre y apellido
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            required
            className="min-w-0 flex-1 rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </div>
        {state?.ok ? (
          <p className="mt-2 text-xs font-700 text-leaf">✓ Guardado.</p>
        ) : state?.error ? (
          <p className="mt-2 text-xs font-700 text-rose">{state.error}</p>
        ) : null}
      </form>

      {/* Idioma preferido */}
      <form action={setUiLocale} className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
        <h2 className="mb-1 font-display text-base font-700 text-ink">Idioma</h2>
        <p className="mb-3 text-xs font-500 text-ink/50">
          El idioma con el que abres Colequium. Lo puedes cambiar cuando quieras.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            name="locale"
            defaultValue={uiLocale ?? "es-MX"}
            className="rounded-xl bg-mist px-3 py-2.5 text-sm font-700 text-ink outline-none focus:ring-2 focus:ring-brand/30"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep"
          >
            <Icon name="Check" className="h-4 w-4" /> Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
