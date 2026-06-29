"use client";

import Link from "next/link";
import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { ACCENT_ON, ACCENT_TEXT, type AccentColor } from "../colors";
import { DEMO_EVENTS, DEMO_TASKS } from "@/lib/domain";

export interface RailEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  accent: AccentColor;
  /** true si viene de un aviso publicado → tiene detalle en /aviso/[id]. */
  isPost?: boolean;
}
export interface RailTask {
  id: string;
  title: string;
  due: string;
  group: string;
  done: boolean;
  isPost?: boolean;
}

export function RightRail({
  events,
  tasks,
}: {
  events?: RailEvent[];
  tasks?: RailTask[];
} = {}) {
  const { t } = useLocale();
  // Datos reales si los hay; si no, los de demostración.
  const railEvents = events && events.length > 0 ? events : DEMO_EVENTS;
  const railTasks = tasks && tasks.length > 0 ? tasks : DEMO_TASKS;

  // Un evento/tarea individual lleva a su detalle (/aviso/[id]) si es un aviso
  // publicado; si no (datos demo), al menos lleva a la sección.
  const eventHref = (e: { id: string; isPost?: boolean }) =>
    e.isPost ? `/aviso/${e.id}` : "/calendar";
  const taskHref = (tk: { id: string; isPost?: boolean }) =>
    tk.isPost ? `/aviso/${tk.id}` : "/tasks";

  return (
    <div className="flex flex-col gap-5">
      {/* Próximos eventos */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        {/* El encabezado lleva a la página de calendario. */}
        <Link
          href="/calendar"
          className="mb-3 flex items-center justify-between rounded-xl -mx-1 px-1 py-0.5 transition-colors hover:bg-mist"
        >
          <h2 className="font-display text-base font-700 text-ink">
            {t("rail.events")}
          </h2>
          <Icon name="CalendarDays" className="h-5 w-5 text-brand" />
        </Link>
        <ul className="flex flex-col gap-1">
          {railEvents.map((e) => (
            <li key={e.id}>
              <Link
                href={eventHref(e)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-mist"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl leading-none ${
                    ACCENT_ON[e.accent as AccentColor]
                  }`}
                >
                  <span className="font-display text-lg font-700">{e.day}</span>
                  <span className="text-[9px] font-700 opacity-80">
                    {e.month}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-700 text-ink">
                    {e.title}
                  </span>
                  <span className="block text-xs font-600 text-ink/50">
                    {e.time}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/calendar"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand-wash py-2.5 text-sm font-700 text-brand transition-colors hover:bg-cloud"
        >
          {t("rail.seeCalendar")}
          <Icon name="ChevronRight" className="h-4 w-4" />
        </Link>
      </section>

      {/* Tareas pendientes */}
      <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
        {/* El encabezado lleva a la página de tareas. */}
        <Link
          href="/tasks"
          className="mb-3 flex items-center justify-between rounded-xl -mx-1 px-1 py-0.5 transition-colors hover:bg-mist"
        >
          <h2 className="font-display text-base font-700 text-ink">
            {t("rail.tasks")}
          </h2>
          <Icon name="ClipboardList" className="h-5 w-5 text-cta" />
        </Link>
        <ul className="flex flex-col gap-2">
          {railTasks.map((task) => (
            <li key={task.id}>
              <Link href={taskHref(task)} className="flex items-start gap-3 rounded-2xl p-1.5 transition-colors hover:bg-mist">
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
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
