"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SHOW_PRICING } from "@/lib/site-flags";

// "Planes" se oculta hasta definir el pricing (SHOW_PRICING).
// Anclas absolutas (/#...) para que funcionen también fuera de la landing.
const ITEMS = [
  { href: "/por-que-aulakium", label: "¿Por qué?" },
  { href: "/ventajas", label: "Ventajas" },
  { href: "/#planes", label: "Planes" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/#contacto", label: "Contacto" },
].filter((it) => SHOW_PRICING || it.href !== "/#planes");

/** Menú hamburguesa para la landing en móvil. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="grid h-11 w-11 place-items-center rounded-xl text-ink transition-colors hover:bg-mist"
      >
        <Icon name={open ? "X" : "Menu"} className="h-6 w-6" />
      </button>

      {open ? (
        <>
          {/* Fondo para cerrar al tocar afuera */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-[60px] z-40 cursor-default bg-ink/25"
          />
          {/* Panel desplegable */}
          <div className="absolute inset-x-0 top-full z-50 border-b border-ink/8 bg-white shadow-pop">
            <div className="mx-auto flex max-w-6xl flex-col px-5 py-4">
              {ITEMS.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  onClick={close}
                  className="rounded-xl px-3 py-3 text-base font-700 text-ink transition-colors hover:bg-mist"
                >
                  {it.label}
                </a>
              ))}

              <div className="mt-2 flex flex-col gap-2 border-t border-ink/8 pt-3">
                <Link
                  href="/login"
                  onClick={close}
                  className="rounded-xl px-3 py-3 text-base font-700 text-ink transition-colors hover:bg-mist"
                >
                  Ingresar
                </Link>
                <a
                  href="#contacto"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-full bg-cta px-5 py-3.5 text-base font-700 text-white shadow-soft transition-colors hover:bg-cta-deep"
                >
                  Solicitar demo
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
