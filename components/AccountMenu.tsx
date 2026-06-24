"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";
import { Avatar } from "./Avatar";
import { useLocale } from "./locale-context";
import { useIdentity } from "./identity-context";
import { logout } from "@/app/(auth)/login/actions";
import {
  NAV_ITEMS,
  STUDENT_HIDDEN,
  DEMO_USER,
  requestsNavKey,
} from "@/lib/domain";

/** Secciones que ya están en la barra inferior móvil (no las repetimos aquí). */
const BOTTOM_NAV = ["nav.home", "nav.wall", "nav.calendar", "nav.conversations", "nav.requests"];

/** Menú de cuenta (avatar arriba a la derecha): perfil, config, secciones extra y salir. */
export function AccountMenu() {
  const { t } = useLocale();
  const me = useIdentity();
  const [open, setOpen] = useState(false);

  const isStaff = !!me && (me.isAdmin || me.roleKey === "teacher");
  // Las secciones que no entran en la barra inferior móvil.
  const extra = NAV_ITEMS.filter((i) => !BOTTOM_NAV.includes(i.key))
    .filter((i) => !(i.staffOnly && !isStaff))
    .filter((i) => !(me?.isStudent && STUDENT_HIDDEN.includes(i.href)));

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cuenta"
        className="flex items-center gap-2.5 rounded-full outline-none transition-colors hover:opacity-90 focus:ring-2 focus:ring-brand/40"
      >
        <Avatar name={me?.name ?? DEMO_USER.name} color="navy" />
        <span className="hidden leading-tight lg:block">
          <span className="block text-sm font-700 text-ink">{me?.name ?? DEMO_USER.name}</span>
          <span className="block text-xs font-500 text-ink/50">{me?.roleLabel ?? "Miembro"}</span>
        </span>
        <Icon name="ChevronDown" className="hidden h-4 w-4 text-ink/40 lg:block" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-pop"
          >
            {/* Cabecera con el usuario */}
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={me?.name ?? DEMO_USER.name} color="brand" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-700 text-ink">{me?.name ?? DEMO_USER.name}</p>
                <p className="truncate text-xs font-600 text-ink/50">
                  {me?.roleLabel ?? "Miembro"}
                </p>
              </div>
            </div>

            <div className="my-1 border-t border-ink/5" />

            <MenuLink href="/perfil" icon="Settings" label="Mi perfil" onClick={() => setOpen(false)} />
            {me?.isAdmin ? (
              <MenuLink
                href="/configuracion"
                icon="ShieldCheck"
                label="Configuración del colegio"
                onClick={() => setOpen(false)}
              />
            ) : null}

            {extra.length > 0 ? (
              <>
                <div className="my-1 border-t border-ink/5" />
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-700 uppercase tracking-wide text-ink/35">
                  Más secciones
                </p>
                {extra.map((i) => (
                  <MenuLink
                    key={i.href}
                    href={i.href}
                    icon={i.icon}
                    label={t(i.key === "nav.requests" ? requestsNavKey(me?.roleKey ?? null) : i.key)}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </>
            ) : null}

            <div className="my-1 border-t border-ink/5" />
            <form action={logout}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-700 text-rose transition-colors hover:bg-rose/10"
              >
                <Icon name="LogOut" className="h-[18px] w-[18px]" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-700 text-ink/70 transition-colors hover:bg-mist hover:text-ink"
    >
      <Icon name={icon} className="h-[18px] w-[18px] text-ink/50" />
      {label}
    </Link>
  );
}
