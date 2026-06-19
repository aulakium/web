"use client";

import Link from "next/link";
import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import {
  ACCENT_ON,
  ACCENT_SOFT_BG,
  ACCENT_TEXT,
  ACCENT_BORDER_L,
  type AccentColor,
} from "../colors";
import {
  DEMO_USER,
  DEMO_POSTS,
  DEMO_CAL_EVENTS,
  DEMO_REQUESTS,
  DEMO_CONVERSATIONS,
  DEMO_TODAY,
} from "@/lib/domain";
import { calendarColor, sortDayEvents } from "../calendario/utils";

// Un color e ícono FIJOS por sección (mismos en todos lados; el ícono identifica).
const QUICK = [
  { key: "nav.wall", href: "/muro", icon: "Megaphone", color: "news" },
  { key: "nav.calendar", href: "/calendario", icon: "CalendarDays", color: "brand" },
  { key: "nav.conversations", href: "/conversaciones", icon: "MessagesSquare", color: "sky" },
  { key: "nav.requests", href: "/tramites", icon: "ClipboardList", color: "requests" },
  { key: "nav.documents", href: "/documentos", icon: "FolderClosed", color: "docs" },
  { key: "nav.transport", href: "/transporte", icon: "Bus", color: "transport", disabled: true },
] as const;

export function HomeView({
  unreadPosts: unreadPostsReal,
  events: eventsReal,
  unreadMessages: unreadMessagesReal,
  pendingRequests: pendingRequestsReal,
}: {
  unreadPosts?: number;
  events?: import("@/lib/domain").CalEvent[];
  unreadMessages?: number;
  pendingRequests?: number;
}) {
  const { t, locale } = useLocale();
  const me = useIdentity();
  const firstName = me?.firstName ?? DEMO_USER.name.split(" ")[0];

  const dateLabel = new Date(
    DEMO_TODAY.year,
    DEMO_TODAY.month,
    DEMO_TODAY.day,
  ).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  const calEvents = eventsReal ?? DEMO_CAL_EVENTS;
  const unreadPosts = unreadPostsReal ?? DEMO_POSTS.filter((p) => p.unread).length;
  const eventsThisWeek = calEvents.filter(
    (e) => e.kind === "event" && e.day >= 8 && e.day <= 14,
  ).length;
  const pendingRequests =
    pendingRequestsReal ?? DEMO_REQUESTS.filter((r) => r.status === "submitted").length;
  const unreadMessages =
    unreadMessagesReal ?? DEMO_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  const summary = [
    { label: t("home.summary.unread"), value: unreadPosts, icon: "Megaphone", color: "news" as AccentColor, href: "/muro" },
    { label: t("home.summary.events"), value: eventsThisWeek, icon: "CalendarDays", color: "brand" as AccentColor, href: "/calendario" },
    { label: t("home.summary.requests"), value: pendingRequests, icon: "ClipboardList", color: "requests" as AccentColor, href: "/tramites" },
    { label: t("home.summary.messages"), value: unreadMessages, icon: "MessagesSquare", color: "sky" as AccentColor, href: "/conversaciones" },
  ];

  const todayEvents = sortDayEvents(
    calEvents.filter((e) => e.day === DEMO_TODAY.day),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Banner de saludo */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-navy to-navy-deep p-6 text-white shadow-card sm:p-7">
        <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-700 text-white/60 first-letter:uppercase">
            {dateLabel}
          </p>
          <h2 className="mt-1 font-display text-2xl font-700 sm:text-3xl">
            {t("home.greeting")}, {firstName} 👋
          </h2>
          <p className="mt-1 max-w-md text-sm font-600 text-white/70">
            {t("home.subtitle")}
          </p>
        </div>
      </section>

      {/* Tarjetas resumen */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-3 rounded-[1.5rem] border border-ink/5 bg-white p-4 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${ACCENT_SOFT_BG[s.color]} ${ACCENT_TEXT[s.color]}`}
            >
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-2xl font-700 leading-none text-ink">
                {s.value}
              </span>
              <span className="mt-1 block text-xs font-700 text-ink/55">
                {s.label}
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* Accesos rápidos */}
      <section>
        <h2 className="mb-3 font-display text-base font-700 text-ink">
          {t("home.quick")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) =>
            "disabled" in q && q.disabled ? (
              <div
                key={q.href}
                aria-disabled="true"
                title={`${t(q.key)} — próximamente`}
                className="flex cursor-not-allowed flex-col items-center gap-2 rounded-[1.5rem] border border-ink/5 bg-white/60 p-4 text-center opacity-50"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/35">
                  <Icon name={q.icon} className="h-6 w-6" />
                </span>
                <span className="text-sm font-700 text-ink/40">{t(q.key)}</span>
              </div>
            ) : (
              <Link
                key={q.href}
                href={q.href}
                className="flex flex-col items-center gap-2 rounded-[1.5rem] border border-ink/5 bg-white p-4 text-center shadow-card transition-transform hover:-translate-y-0.5"
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${ACCENT_ON[q.color as AccentColor]}`}
                >
                  <Icon name={q.icon} className="h-6 w-6" />
                </span>
                <span className="text-sm font-700 text-ink">{t(q.key)}</span>
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Agenda de hoy */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-700 text-ink">
            {t("home.todayAgenda")}
          </h2>
          <Link
            href="/calendario"
            className="flex items-center gap-1 text-sm font-700 text-brand transition-colors hover:text-ink"
          >
            {t("home.seeAll")}
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="flex flex-col gap-2.5">
          {todayEvents.map((e) => {
            const color = calendarColor(e.calendarId);
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl border border-l-4 border-ink/5 bg-white p-3 ${ACCENT_BORDER_L[color]}`}
              >
                <span className="w-14 shrink-0 text-right text-sm font-700 text-ink">
                  {e.allDay ? (
                    <span className="text-[11px] uppercase text-ink/45">
                      {t("cal.allDay")}
                    </span>
                  ) : (
                    e.time
                  )}
                </span>
                <span className="min-w-0 flex-1 text-sm font-700 text-ink">
                  {e.title}
                </span>
                <span
                  className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-700 sm:inline-flex ${ACCENT_SOFT_BG[color]} ${ACCENT_TEXT[color]}`}
                >
                  {e.audienceLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
