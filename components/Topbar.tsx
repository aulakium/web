"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { Avatar } from "./Avatar";
import { useLocale } from "./locale-context";
import { LOCALES } from "@/lib/i18n";
import { DEMO_USER, DEMO_SCHOOL } from "@/lib/domain";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <header className="sticky top-0 z-30 bg-canvas/70 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-2">
        {/* Marca compacta en móvil (el sidebar está oculto) */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-navy to-navy-deep text-white shadow-card">
            <Icon name="Sparkles" className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-800 text-ink">
            {DEMO_SCHOOL.shortName}
          </span>
        </div>

        {/* Título de la página (oculto en móvil para dar lugar) */}
        <div className="hidden min-w-0 lg:block">
          <h1 className="font-display text-2xl font-800 leading-none text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm font-600 text-ink/55">{subtitle}</p>
          ) : null}
        </div>

        {/* Buscador */}
        <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <Icon
            name="Search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          />
          <input
            type="search"
            placeholder="Buscar en la comunidad…"
            className="w-full rounded-2xl border border-ink/10 bg-white py-2.5 pl-10 pr-3 text-sm font-600 text-ink shadow-sm outline-none placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Selector de idioma (demuestra i18n / terminología regional) */}
        <div className="relative ml-auto md:ml-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-700 text-ink shadow-sm transition-colors hover:border-brand/40"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="text-base leading-none">{current?.flag}</span>
            <span className="hidden sm:inline">{locale.toUpperCase()}</span>
            <Icon name="ChevronDown" className="h-4 w-4 text-ink/50" />
          </button>
          {open ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <ul
                role="listbox"
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-pop"
              >
                {LOCALES.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocale(l.code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-700 transition-colors ${
                        l.code === locale
                          ? "bg-brand-wash text-ink"
                          : "text-ink/70 hover:bg-mist"
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="flex-1">{l.label}</span>
                      {l.code === locale ? (
                        <Icon name="Check" className="h-4 w-4 text-brand" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {/* Notificaciones */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-ink/10 bg-white text-ink shadow-sm transition-colors hover:border-brand/40"
        >
          <Icon name="Bell" className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-cta" />
        </button>

        {/* Avatar (en móvil reemplaza al perfil del sidebar) */}
        <span className="lg:hidden">
          <Avatar name={DEMO_USER.name} color="brand" />
        </span>
      </div>
    </header>
  );
}
