"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { BrandIcon } from "../Wordmark";
import { NAV_ITEMS, STUDENT_HIDDEN, DEMO_USER, DEMO_SCHOOL, requestsNavKey } from "@/lib/domain";
import { logout } from "@/app/(auth)/login/actions";

const ROW = "flex h-12 items-center gap-3 rounded-2xl px-[11px] transition-colors";
const ICONBOX = "grid h-9 w-9 shrink-0 place-items-center";
const LABEL =
  "whitespace-nowrap text-sm font-700 opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100";

/**
 * Rail de íconos (desktop) que se despliega a la derecha al pasar el cursor.
 * El <aside> reserva 84px fijos; el panel interno crece por encima del
 * contenido (no lo corre) mostrando las etiquetas.
 */
export function RailSidebar({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const me = useIdentity();
  const label = (it: { key: string }) =>
    t(it.key === "nav.requests" ? requestsNavKey(me?.roleKey ?? null) : it.key);
  const userName = me?.name ?? DEMO_USER.name;
  const schoolShort = me?.schoolShort ?? DEMO_SCHOOL.shortName;

  return (
    <aside className="sticky top-0 z-40 hidden h-dvh w-[84px] shrink-0 lg:block">
      <div className="group/rail flex h-full w-[84px] flex-col gap-1.5 overflow-hidden border-r border-ink/8 bg-white px-3 py-5 transition-[width] duration-200 ease-out hover:w-[248px] hover:shadow-pop">
        {/* Marca */}
        <Link href="/home" className={`${ROW} mb-2`} title={schoolShort}>
          <span className={ICONBOX}>
            <BrandIcon className="h-9 w-9" />
          </span>
          <span className={`${LABEL} font-display text-base text-ink`}>{schoolShort}</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV_ITEMS.filter(
            (it) =>
              !(me?.isStudent && STUDENT_HIDDEN.includes(it.href)) &&
              !(it.staffOnly && !(me?.isAdmin || me?.roleKey === "teacher")),
          ).map((it) => {
            if (it.disabled) {
              return (
                <div key={it.href} aria-disabled="true" className={`${ROW} cursor-not-allowed text-ink/25`}>
                  <span className={ICONBOX}>
                    <Icon name={it.icon} className="h-[22px] w-[22px]" />
                  </span>
                  <span className={`${LABEL} text-ink/35`}>{label(it)} · pronto</span>
                </div>
              );
            }
            const active = pathname.startsWith(it.href);
            const showDot = it.key === "nav.conversations" && unreadMessages > 0;
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                title={label(it)}
                className={`${ROW} ${
                  active ? "bg-brand text-white shadow-soft" : "text-ink/45 hover:bg-mist hover:text-ink"
                }`}
              >
                <span className={`${ICONBOX} relative`}>
                  <Icon name={it.icon} className="h-[22px] w-[22px]" />
                  {showDot ? (
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-cta" />
                  ) : null}
                </span>
                <span className={`${LABEL} flex-1`}>{label(it)}</span>
                {showDot ? (
                  <span className={`${LABEL} mr-1 rounded-full bg-cta px-1.5 text-[11px] font-700 text-white`}>
                    {unreadMessages}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {me?.isAdmin ? (
          <Link
            href="/settings"
            title="Configuración"
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
            className={`${ROW} ${
              pathname.startsWith("/settings")
                ? "bg-brand text-white shadow-soft"
                : "text-ink/45 hover:bg-mist hover:text-ink"
            }`}
          >
            <span className={ICONBOX}>
              <Icon name="ShieldCheck" className="h-[22px] w-[22px]" />
            </span>
            <span className={LABEL}>Configuración</span>
          </Link>
        ) : null}

        <form action={logout}>
          <button type="submit" title="Cerrar sesión" className={`${ROW} w-full text-ink/45 hover:bg-rose/10 hover:text-rose`}>
            <span className={ICONBOX}>
              <Icon name="LogOut" className="h-[22px] w-[22px]" />
            </span>
            <span className={LABEL}>Cerrar sesión</span>
          </button>
        </form>

        <Link href="/profile" className={`${ROW} hover:bg-mist`} title={userName}>
          <span className={ICONBOX}>
            <Avatar name={userName} color="navy" size="sm" />
          </span>
          <span className={`${LABEL} text-ink`}>{userName}</span>
        </Link>
      </div>
    </aside>
  );
}
