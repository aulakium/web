"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: reemplazar por Supabase Auth (signInWithPassword). Demo: entra directo.
    setLoading(true);
    setTimeout(() => router.push("/inicio"), 500);
  }

  return (
    <div>
      <Wordmark className="mb-8 lg:hidden" />

      <h1 className="font-display text-2xl font-800 text-ink">
        Ingresá a tu cuenta
      </h1>
      <p className="mt-1 text-sm font-500 text-ink/55">
        Usá el email con el que te invitó tu colegio.
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-700 text-ink">
              Contraseña
            </label>
            <Link
              href="/recuperar"
              className="text-xs font-700 text-brand transition-colors hover:text-ink"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 pr-11 text-sm font-500 text-ink outline-none placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-mist hover:text-ink"
            >
              <Icon name={showPass ? "Check" : "Search"} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-800 text-white shadow-card transition-colors hover:bg-navy-deep disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
          {!loading ? <Icon name="ArrowRight" className="h-4 w-4" /> : null}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-500 text-ink/50">
        ¿Tu colegio todavía no usa Colequium?{" "}
        <a href="#" className="font-700 text-brand hover:text-ink">
          Escribinos
        </a>
      </p>
    </div>
  );
}
