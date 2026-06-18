"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { NAV_ITEMS, DEMO_USER } from "@/lib/domain";
import { logout } from "@/app/(auth)/login/actions";

/** Rail slim de íconos (estilo Alliance). Desktop. */
export function RailSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const me = useIdentity();
  const userName = me?.name ?? DEMO_USER.name;

  return (
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col items-center border-r border-ink/8 bg-white py-5 lg:flex">
      <Link href="/inicio" className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-sky text-white shadow-soft">
        <Icon name="Sparkles" className="h-5 w-5" />
      </Link>

      <nav className="mt-7 flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              title={t(it.key)}
              className={`group relative grid h-12 w-12 place-items-center rounded-2xl transition-colors ${
                active ? "bg-brand text-white shadow-soft" : "text-ink/40 hover:bg-mist hover:text-ink"
              }`}
            >
              <Icon name={it.icon} className="h-[22px] w-[22px]" />
              {it.badge ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-cta" />
              ) : null}
              <span className="pointer-events-none absolute left-14 z-30 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-600 text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100">
                {t(it.key)}
              </span>
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="mt-3">
        <button
          type="submit"
          title="Cerrar sesión"
          className="group relative grid h-12 w-12 place-items-center rounded-2xl text-ink/40 transition-colors hover:bg-rose/10 hover:text-rose"
        >
          <Icon name="LogOut" className="h-[22px] w-[22px]" />
          <span className="pointer-events-none absolute left-14 z-30 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-600 text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100">
            Cerrar sesión
          </span>
        </button>
      </form>

      <Link href="/perfil" className="mt-1" title={userName}>
        <Avatar name={userName} color="navy" size="lg" />
      </Link>
    </aside>
  );
}
