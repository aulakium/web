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
  STUDENT_HIDDEN,
  DEMO_POSTS,
  DEMO_CAL_EVENTS,
  DEMO_REQUESTS,
  DEMO_CONVERSATIONS,
  DEMO_TODAY,
  requestsNavKey,
} from "@/lib/domain";
import { calendarColor } from "../calendar/utils";

// Un color e ícono FIJOS por sección (mismos en todos lados; el ícono identifica).
const QUICK = [
  { key: "nav.wall", href: "/feed", icon: "Megaphone", color: "news" },
  { key: "nav.calendar", href: "/calendar", icon: "CalendarDays", color: "brand" },
  { key: "nav.conversations", href: "/messages", icon: "MessagesSquare", color: "sky" },
  { key: "nav.requests", href: "/requests", icon: "ClipboardList", color: "requests" },
  { key: "nav.documents", href: "/documents", icon: "FolderClosed", color: "docs" },
  { key: "nav.transport", href: "/transport", icon: "Bus", color: "transport", disabled: true },
] as const;

export function HomeView({
  unreadPosts: unreadPostsReal,
  events: eventsReal,
  unreadMessages: unreadMessagesReal,
  pendingRequests: pendingRequestsReal,
  pendingTasks: pendingTasksReal,
}: {
  unreadPosts?: number;
  events?: import("@/lib/domain").CalEvent[];
  unreadMessages?: number;
  pendingRequests?: number;
  pendingTasks?: number;
}) {
  const { t, locale } = useLocale();
  const me = useIdentity();
  const firstName = me?.firstName ?? DEMO_USER.name.split(" ")[0];
  // Renombrado por rol de "Trámites" (Tareas / Pendientes) en los accesos.
  const reqLabel = t(requestsNavKey(me?.roleKey ?? null));
  const qlabel = (q: { key: string }) => (q.key === "nav.requests" ? reqLabel : t(q.key));

  const dateLabel = new Date(
    DEMO_TODAY.year,
    DEMO_TODAY.month,
    DEMO_TODAY.day,
  ).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  const calEvents = eventsReal ?? DEMO_CAL_EVENTS;
  const unreadPosts = unreadPostsReal ?? DEMO_POSTS.filter((p) => p.unread).length;
  // Fecha real de cada evento (year/month/day) para comparar contra hoy.
  const todayMid = new Date(DEMO_TODAY.year, DEMO_TODAY.month, DEMO_TODAY.day).getTime();
  const eventDate = (e: { year: number; month: number; day: number }) =>
    new Date(e.year, e.month, e.day).getTime();
  const eventsThisWeek = calEvents.filter((e) => {
    if (e.kind !== "event") return false;
    const diff = (eventDate(e) - todayMid) / 86400000;
    return diff >= 0 && diff < 7;
  }).length;
  const unreadMessages =
    unreadMessagesReal ?? DEMO_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);
  const pendingTasks = pendingTasksReal ?? 0;

  const summary = [
    { label: t("home.summary.unread"), value: unreadPosts, icon: "Megaphone", color: "news" as AccentColor, href: "/feed" },
    { label: t("home.summary.events"), value: eventsThisWeek, icon: "CalendarDays", color: "brand" as AccentColor, href: "/calendar" },
    { label: t("home.summary.tasks"), value: pendingTasks, icon: "CircleCheck" as const, color: "requests" as AccentColor, href: "/tasks" },
    { label: t("home.summary.messages"), value: unreadMessages, icon: "MessagesSquare", color: "sky" as AccentColor, href: "/messages" },
  ].filter((s) => !(me?.isStudent && STUDENT_HIDDEN.includes(s.href)));

  // Próximos eventos: de hoy en adelante (por fecha real), ordenados, hasta 5.
  const upcomingEvents = calEvents
    .filter((e) => e.kind === "event" && eventDate(e) >= todayMid)
    .sort(
      (a, b) =>
        eventDate(a) - eventDate(b) ||
        (a.allDay ? 0 : 1) - (b.allDay ? 0 : 1) ||
        (a.time ?? "").localeCompare(b.time ?? ""),
    )
    .slice(0, 5);
  const monthAbbr = (e: { year: number; month: number; day: number }) =>
    new Date(e.year, e.month, e.day)
      .toLocaleDateString(locale, { month: "short" })
      .replace(".", "");
  const weekdayAbbr = (e: { year: number; month: number; day: number }) =>
    new Date(e.year, e.month, e.day)
      .toLocaleDateString(locale, { weekday: "short" })
      .replace(".", "")
      .slice(0, 3)
      .toUpperCase();

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

      {/* Próximos eventos */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-700 text-ink">
            {t("home.todayAgenda")}
          </h2>
          <Link
            href="/calendar"
            className="flex items-center gap-1 text-sm font-700 text-brand transition-colors hover:text-ink"
          >
            {t("home.seeAll")}
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="py-4 text-center text-sm font-500 text-ink/45">
            {t("home.noUpcoming")}.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {upcomingEvents.map((e) => {
              const color = calendarColor(e.calendarId);
              const cls = `flex items-center gap-3 rounded-2xl border border-l-4 border-ink/5 bg-white p-3 ${ACCENT_BORDER_L[color]}`;
              const inner = (
                <>
                  <span className="flex w-11 shrink-0 flex-col items-center justify-center leading-none">
                    <span className="text-[10px] font-700 uppercase text-ink/45">{weekdayAbbr(e)}</span>
                    <span className="my-0.5 font-display text-lg font-700 text-ink">{e.day}</span>
                    <span className="text-[10px] font-700 uppercase text-ink/45">{monthAbbr(e)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-700 text-ink">{e.title}</span>
                    <span className="block truncate text-xs font-600 text-ink/50">
                      {e.allDay ? t("cal.allDay") : e.time} · {e.audienceLabel}
                    </span>
                  </span>
                  {e.isPost ? (
                    <Icon name="ChevronRight" className="h-4 w-4 shrink-0 text-ink/30" />
                  ) : null}
                </>
              );
              return (
                <li key={e.id}>
                  {e.isPost ? (
                    <Link href={`/aviso/${e.id}`} className={`${cls} transition-colors hover:bg-mist`}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Accesos rápidos (compacto; ya están en el menú lateral) */}
      <section>
        <h2 className="mb-2 text-xs font-700 uppercase tracking-wide text-ink/40">
          {t("home.quick")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK.filter((q) => !(me?.isStudent && STUDENT_HIDDEN.includes(q.href))).map((q) =>
            "disabled" in q && q.disabled ? (
              <span
                key={q.href}
                aria-disabled="true"
                title={`${qlabel(q)} — próximamente`}
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-ink/8 bg-white/60 px-3 py-1.5 text-xs font-700 text-ink/35"
              >
                <Icon name={q.icon} className="h-4 w-4" />
                {qlabel(q)}
              </span>
            ) : (
              <Link
                key={q.href}
                href={q.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-white px-3 py-1.5 text-xs font-700 text-ink/70 shadow-sm transition-colors hover:border-brand/30 hover:text-ink"
              >
                <Icon name={q.icon} className="h-4 w-4 text-ink/45" />
                {qlabel(q)}
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
