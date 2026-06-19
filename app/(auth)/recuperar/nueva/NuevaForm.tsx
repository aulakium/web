"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { setNewPassword, type NewPasswordState } from "./actions";

export function NuevaForm() {
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState<NewPasswordState, FormData>(
    setNewPassword,
    null,
  );

  return (
    <form action={formAction} className="mt-7 flex flex-col gap-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-700 text-ink">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-full border border-ink/10 bg-white px-4 py-3 pr-11 text-sm font-500 text-ink outline-none placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar" : "Mostrar"}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/40 hover:bg-mist hover:text-ink"
          >
            <Icon name={show ? "Check" : "Search"} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm font-600 text-rose">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar y entrar"}
        {!pending ? <Icon name="ArrowRight" className="h-4 w-4" /> : null}
      </button>
    </form>
  );
}
