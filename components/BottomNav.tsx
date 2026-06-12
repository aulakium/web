"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { useLocale } from "./locale-context";
import { NAV_ITEMS } from "@/lib/domain";

/** Navegación inferior en móvil (el sidebar se oculta < lg). */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  // Mostramos las 5 secciones principales en móvil.
  const items = NAV_ITEMS.filter((i) =>
    ["nav.home", "nav.wall", "nav.calendar", "nav.conversations", "nav.requests"].includes(i.key),
  );

  return (
    <nav className="sticky bottom-0 z-30 border-t border-ink/10 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 backdrop-blur lg:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5"
              >
                <span
                  className={`relative grid h-9 w-12 place-items-center rounded-2xl transition-colors ${
                    active ? "bg-brand-wash text-brand" : "text-ink/50"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.badge ? (
                    <span className="absolute right-2 top-1 h-2 w-2 rounded-full border border-white bg-cta" />
                  ) : null}
                </span>
                <span
                  className={`text-[10px] font-800 ${
                    active ? "text-ink" : "text-ink/50"
                  }`}
                >
                  {t(item.key)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
