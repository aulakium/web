"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  // Controlados para que un error del servidor no borre lo escrito.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <div>
      <Wordmark href="/" className="mb-8 lg:hidden" />

      <h1 className="font-display text-2xl font-700 text-ink">
        Entra a tu cuenta
      </h1>
      <p className="mt-1 text-sm font-500 text-ink/55">
        Usa el correo con el que te invitó tu colegio.
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
              name="password"
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-full border border-ink/10 bg-white px-4 py-3 pr-11 text-sm font-500 text-ink outline-none placeholder:text-ink/35 focus:border-brand focus:ring-2 focus:ring-brand/30"
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

        {state?.error ? (
          <p
            role="alert"
            className="rounded-xl bg-rose/10 px-4 py-2.5 text-sm font-600 text-rose"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-700 text-white shadow-card transition-colors hover:bg-navy-deep disabled:opacity-60"
        >
          {pending ? "Ingresando…" : "Ingresar"}
          {!pending ? <Icon name="ArrowRight" className="h-4 w-4" /> : null}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-500 text-ink/50">
        ¿Tu colegio todavía no usa Aulakium?{" "}
        <a
          href="mailto:hola@aulakium.com?subject=Quiero%20Aulakium%20en%20mi%20colegio"
          className="font-700 text-brand hover:text-ink"
        >
          Escríbenos
        </a>
      </p>
    </div>
  );
}
