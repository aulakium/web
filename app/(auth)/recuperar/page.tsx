"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";

export default function RecuperarPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Supabase Auth resetPasswordForEmail. Demo: muestra confirmación.
    setSent(true);
  }

  return (
    <div>
      <Wordmark className="mb-8 lg:hidden" />

      {sent ? (
        <div className="text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Icon name="Check" className="h-7 w-7" />
          </span>
          <h1 className="font-display text-2xl font-800 text-ink">
            Revisá tu email
          </h1>
          <p className="mt-2 text-sm font-500 text-ink/60">
            Si ese email tiene una cuenta, te enviamos un enlace para crear una
            contraseña nueva. Puede tardar unos minutos.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-800 text-white shadow-card transition-colors hover:bg-navy-deep"
          >
            <Icon name="ChevronLeft" className="h-4 w-4" />
            Volver a ingresar
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

          <h1 className="font-display text-2xl font-800 text-ink">
            Recuperá tu contraseña
          </h1>
          <p className="mt-1 text-sm font-500 text-ink/55">
            Te enviamos un enlace por email para crear una nueva.
          </p>

          <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-700 text-ink"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-500 text-ink outline-none placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-800 text-white shadow-card transition-colors hover:bg-navy-deep"
            >
              Enviarme el enlace
              <Icon name="Send" className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
