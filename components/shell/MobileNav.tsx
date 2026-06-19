"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { NAV_ITEMS, STUDENT_HIDDEN } from "@/lib/domain";

/** Bottom-nav para móvil (el rail slim se oculta < lg). */
export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const me = useIdentity();
  const items = NAV_ITEMS.filter(
    (i) =>
      ["nav.home", "nav.wall", "nav.calendar", "nav.conversations", "nav.requests"].includes(i.key) &&
      !(me?.isStudent && STUDENT_HIDDEN.includes(i.href)),
  );

  return (
    <nav className="sticky bottom-0 z-30 border-t border-ink/8 bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 lg:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link href={it.href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5">
                <span className={`relative grid h-9 w-12 place-items-center rounded-2xl transition-colors ${active ? "bg-brand text-white" : "text-ink/45"}`}>
                  <Icon name={it.icon} className="h-5 w-5" />
                  {it.badge ? <span className="absolute right-2 top-1 h-2 w-2 rounded-full border border-white bg-cta" /> : null}
                </span>
                <span className={`text-[10px] font-700 ${active ? "text-ink" : "text-ink/45"}`}>{t(it.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
