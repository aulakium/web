"use client";

import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { ACCENT_ON, ACCENT_TEXT, type AccentColor } from "../colors";
import { DEMO_EVENTS, DEMO_TASKS } from "@/lib/domain";

export function RightRail() {
  const { t } = useLocale();

  const momentos = [
    { label: "Feria de ciencias", image: "https://loremflickr.com/320/240/science,school?lock=21" },
    { label: "Día del deporte", image: "https://loremflickr.com/320/240/children,sport?lock=22" },
    { label: "Muestra de arte", image: "https://loremflickr.com/320/240/art,painting?lock=23" },
    { label: "Acto escolar", image: "https://loremflickr.com/320/240/school,children?lock=24" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Momentos (galería de imágenes de la comunidad) */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-800 text-ink">Momentos</h2>
          <button
            type="button"
            className="text-xs font-700 text-brand transition-colors hover:text-ink"
          >
            {t("home.seeAll")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {momentos.map((m) => (
            <button
              key={m.label}
              type="button"
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 truncate text-[11px] font-700 text-white">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-800 text-ink">
            {t("rail.events")}
          </h2>
          <Icon name="CalendarDays" className="h-5 w-5 text-brand" />
        </div>
        <ul className="flex flex-col gap-1">
          {DEMO_EVENTS.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-mist"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl leading-none ${
                    ACCENT_ON[e.accent as AccentColor]
                  }`}
                >
                  <span className="font-display text-lg font-800">{e.day}</span>
                  <span className="text-[9px] font-800 opacity-80">
                    {e.month}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-800 text-ink">
                    {e.title}
                  </span>
                  <span className="block text-xs font-600 text-ink/50">
                    {e.time}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand-wash py-2.5 text-sm font-800 text-brand transition-colors hover:bg-cloud"
        >
          {t("rail.seeCalendar")}
          <Icon name="ChevronRight" className="h-4 w-4" />
        </button>
      </section>

      {/* Tareas pendientes */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-800 text-ink">
            {t("rail.tasks")}
          </h2>
          <Icon name="ClipboardList" className="h-5 w-5 text-cta" />
        </div>
        <ul className="flex flex-col gap-2">
          {DEMO_TASKS.map((task) => (
            <li key={task.id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${
                  task.done
                    ? "border-brand bg-brand text-white"
                    : "border-ink/20 text-transparent"
                }`}
              >
                <Icon name="Check" className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span
                  className={`block text-sm font-700 ${
                    task.done ? "text-ink/40 line-through" : "text-ink"
                  }`}
                >
                  {task.title}
                </span>
                <span className={`text-xs font-600 ${ACCENT_TEXT.requests}`}>
                  {task.due} · {task.group}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
