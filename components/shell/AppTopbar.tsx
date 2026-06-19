"use client";

import { useState } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { BrandIcon } from "../Wordmark";
import { NotificationsBell } from "./NotificationsBell";
import { LOCALES } from "@/lib/i18n";
import { DEMO_USER, DEMO_SCHOOL, ROLE_LABELS } from "@/lib/domain";

/** Topbar del shell interno (estilo Alliance): marca móvil + buscador + idioma + notif + perfil. */
export function AppTopbar() {
  const { locale, setLocale } = useLocale();
  const me = useIdentity();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale);

  const userName = me?.name ?? DEMO_USER.name;
  const schoolShort = me?.schoolShort ?? DEMO_SCHOOL.shortName;
  const roleText = me?.roleLabel || DEMO_USER.roleScope || ROLE_LABELS[DEMO_USER.role];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/8 bg-white px-4 py-3 sm:px-5">
      {/* Marca compacta en móvil (el rail está oculto) */}
      <div className="flex items-center gap-2 lg:hidden">
        <BrandIcon className="h-9 w-9" iconClassName="h-4 w-4" />
        <span className="text-base font-700 text-ink">{schoolShort}</span>
      </div>

      {/* Buscador (alineado a la izquierda) */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Icon name="Search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <input
          type="search"
          placeholder="Buscar en la comunidad…"
          className="w-full rounded-full bg-[#f1f5fa] py-2.5 pl-11 pr-4 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {/* Grupo derecho: idioma + notificaciones + perfil (pegado a la derecha) */}
      <div className="ml-auto flex items-center gap-3">

      {/* Idioma */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-2 text-sm font-700 text-ink transition-colors hover:border-brand/40"
        >
          <span className="text-base leading-none">{current?.flag}</span>
          <span className="hidden sm:inline">{locale.toUpperCase()}</span>
          <Icon name="ChevronDown" className="h-4 w-4 text-ink/50" />
        </button>
        {open ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <ul role="listbox" className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-pop">
              {LOCALES.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => { setLocale(l.code); setOpen(false); }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-700 transition-colors ${
                      l.code === locale ? "bg-brand/10 text-ink" : "text-ink/70 hover:bg-mist"
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span className="flex-1">{l.label}</span>
                    {l.code === locale ? <Icon name="Check" className="h-4 w-4 text-brand" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {/* Notificaciones */}
      <NotificationsBell />

      {/* Perfil */}
      <div className="flex shrink-0 items-center gap-2.5">
        <Avatar name={userName} color="navy" />
        <div className="hidden leading-tight lg:block">
          <p className="text-sm font-700 text-ink">{userName}</p>
          <p className="text-xs font-500 text-ink/50">{roleText}</p>
        </div>
      </div>

      </div>
    </header>
  );
}
