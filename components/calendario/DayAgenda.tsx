"use client";

import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { type CalEvent } from "@/lib/domain";
import { ACCENT_BORDER_L, ACCENT_SOFT_BG, ACCENT_TEXT } from "../colors";
import { calendarColor, calendarName } from "./utils";

export function DayAgenda({
  year,
  month,
  day,
  events,
  doneTasks,
  onToggleTask,
}: {
  year: number;
  month: number;
  day: number;
  events: CalEvent[];
  doneTasks: Set<string>;
  onToggleTask: (id: string) => void;
}) {
  const { t, locale } = useLocale();
  const dateLabel = new Date(year, month, day).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-base font-800 text-ink">
            {t("cal.agenda")}
          </h2>
          <p className="truncate text-sm font-600 text-ink/55 first-letter:uppercase">
            {dateLabel}
          </p>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cta text-white shadow-soft transition-colors hover:bg-cta-deep"
          aria-label={t("cal.newEvent")}
        >
          <Icon name="Plus" className="h-5 w-5" />
        </button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/30">
            <Icon name="CalendarDays" className="h-6 w-6" />
          </span>
          <p className="text-sm font-600 text-ink/45">{t("cal.noEvents")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {events.map((e) => {
            const color = calendarColor(e.calendarId);
            const isTask = e.kind === "task";
            const done = doneTasks.has(e.id);
            return (
              <li
                key={e.id}
                className={`flex items-start gap-3 rounded-2xl border border-l-4 border-ink/5 bg-white p-3 ${ACCENT_BORDER_L[color]}`}
              >
                {/* Columna izquierda: hora, "todo el día" o checkbox de tarea */}
                {isTask ? (
                  <button
                    type="button"
                    onClick={() => onToggleTask(e.id)}
                    aria-pressed={done}
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                      done
                        ? "border-brand bg-brand text-white"
                        : "border-ink/20 text-transparent hover:border-brand"
                    }`}
                  >
                    <Icon name="Check" className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="w-14 shrink-0 text-right">
                    {e.allDay ? (
                      <span className="text-[11px] font-800 uppercase leading-tight text-ink/45">
                        {t("cal.allDay")}
                      </span>
                    ) : (
                      <>
                        <span className="block text-sm font-800 text-ink">
                          {e.time}
                        </span>
                        {e.endTime ? (
                          <span className="block text-xs font-600 text-ink/45">
                            {e.endTime}
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>
                )}

                {/* Contenido */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`text-sm font-800 ${
                        isTask && done ? "text-ink/40 line-through" : "text-ink"
                      }`}
                    >
                      {e.title}
                    </p>
                    {e.unread ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-cta" />
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-800 ${ACCENT_SOFT_BG[color]} ${ACCENT_TEXT[color]}`}
                    >
                      {calendarName(e.calendarId)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-700 text-ink/45">
                      <Icon name="Users" className="h-3 w-3" />
                      {e.audienceLabel}
                    </span>
                    {isTask ? (
                      <span className="text-[11px] font-800 uppercase text-ink/35">
                        · {t("cal.task")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
