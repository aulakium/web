"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { Avatar } from "./Avatar";
import { useLocale } from "./locale-context";
import {
  NAV_ITEMS,
  DEMO_USER,
  DEMO_SCHOOL,
  ROLE_LABELS,
} from "@/lib/domain";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-[260px] shrink-0 flex-col rounded-[2rem] bg-gradient-to-b from-navy to-navy-deep px-4 py-5 text-white shadow-card lg:flex">
      {/* Marca del colegio (NO la marca del producto, una vez logueado) */}
      <Link href="/muro" className="mb-7 flex items-center gap-3 px-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-soft shadow-soft">
          <Icon name="Sparkles" className="h-5 w-5 text-white" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-lg font-800 tracking-tight">
            {DEMO_SCHOOL.shortName}
          </span>
          <span className="block text-xs font-600 text-white/55">
            Comunidad escolar
          </span>
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-700 transition-colors duration-200 ${
                active
                  ? "bg-white text-ink shadow-soft"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                name={item.icon}
                className={`h-5 w-5 ${active ? "text-brand" : ""}`}
              />
              <span className="flex-1">{t(item.key)}</span>
              {item.badge ? (
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-800 ${
                    active ? "bg-cta text-white" : "bg-cta text-white"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Perfil — abajo a la izquierda (como pediste) */}
      <div className="mt-4 rounded-3xl bg-white/10 p-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Avatar name={DEMO_USER.name} color="brand" ring />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-800">{DEMO_USER.name}</p>
            <p className="truncate text-xs font-600 text-white/55">
              {DEMO_USER.roleScope || ROLE_LABELS[DEMO_USER.role]}
            </p>
          </div>
          <button
            type="button"
            aria-label="Ajustes de perfil"
            className="grid h-8 w-8 place-items-center rounded-xl text-white/60 transition-colors hover:bg-white/15 hover:text-white"
          >
            <Icon name="Settings" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
