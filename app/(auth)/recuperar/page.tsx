"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { requestReset, type ResetState } from "./actions";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    requestReset,
    { sent: false },
  );
  const sent = state.sent;

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <Wordmark href="/" />
      </div>

      {sent ? (
        <div className="text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-brand">
            <Icon name="Check" className="h-7 w-7" />
          </span>
          <h1 className="font-display text-2xl font-700 text-ink">
            Revisa tu correo
          </h1>
          <p className="mt-2 text-sm font-500 text-ink/60">
            Si ese correo tiene una cuenta, te enviamos un enlace para crear una
            contraseña nueva. Puede tardar unos minutos.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" />
            Volver a entrar
          </Link>
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="mb-5 inline-flex items-center gap-1 text-sm font-700 text-ink/55 transition-colors hover:text-ink"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" />
            Volver
          </Link>

          <h1 className="font-display text-2xl font-700 text-ink">
            Recupera tu contraseña
          </h1>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Te enviamos un enlace por correo para crear una nueva.
          </p>

          <form action={formAction} className="mt-7 flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-700 text-ink"
              >
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full rounded-full border border-ink/10 bg-white px-4 py-3 text-sm font-500 text-ink outline-none placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Enviarme el enlace"}
              {!pending ? <Icon name="Send" className="h-4 w-4" /> : null}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
