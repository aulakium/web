"use client";

import { useMemo, useState } from "react";
import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { DEMO_CAL_EVENTS, DEMO_TODAY } from "@/lib/domain";
import { MonthGrid } from "./MonthGrid";
import { DayAgenda } from "./DayAgenda";
import { CalendarsFilter } from "./CalendarsFilter";
import { sortDayEvents } from "./utils";

export function CalendarView() {
  const { t, locale } = useLocale();
  const [viewYear, setViewYear] = useState(DEMO_TODAY.year);
  const [viewMonth, setViewMonth] = useState(DEMO_TODAY.month); // 0-based
  const [selectedDay, setSelectedDay] = useState<number>(DEMO_TODAY.day);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  // Los eventos demo viven en junio 2026; otros meses quedan vacíos.
  const inDemoMonth = viewYear === DEMO_TODAY.year && viewMonth === DEMO_TODAY.month;

  const eventsByDay = useMemo(
    () => (day: number) =>
      inDemoMonth
        ? DEMO_CAL_EVENTS.filter(
            (e) => e.day === day && !hidden.has(e.calendarId),
          )
        : [],
    [inDemoMonth, hidden],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    locale,
    { month: "long", year: "numeric" },
  );

  const agendaEvents = sortDayEvents(eventsByDay(selectedDay));

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function goToday() {
    setViewYear(DEMO_TODAY.year);
    setViewMonth(DEMO_TODAY.month);
    setSelectedDay(DEMO_TODAY.day);
  }

  function toggleCalendar(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTask(id: string) {
    setDoneTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Calendario mes */}
      <div className="rounded-[1.75rem] border border-ink/5 bg-white p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-800 text-ink first-letter:uppercase">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl bg-mist px-3 py-2 text-sm font-800 text-ink transition-colors hover:bg-cloud"
            >
              {t("cal.today")}
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Mes anterior"
              className="grid h-9 w-9 place-items-center rounded-xl border border-ink/10 text-ink/60 transition-colors hover:border-brand/40 hover:text-ink"
            >
              <Icon name="ChevronRight" className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Mes siguiente"
              className="grid h-9 w-9 place-items-center rounded-xl border border-ink/10 text-ink/60 transition-colors hover:border-brand/40 hover:text-ink"
            >
              <Icon name="ChevronRight" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <MonthGrid
          year={viewYear}
          month={viewMonth}
          locale={locale}
          today={DEMO_TODAY}
          selected={selectedDay}
          onSelect={setSelectedDay}
          eventsByDay={eventsByDay}
        />
      </div>

      {/* Panel derecho: filtros + agenda del día */}
      <div className="flex flex-col gap-5">
        <CalendarsFilter hidden={hidden} onToggle={toggleCalendar} />
        <DayAgenda
          year={viewYear}
          month={viewMonth}
          day={selectedDay}
          events={agendaEvents}
          doneTasks={doneTasks}
          onToggleTask={toggleTask}
        />
      </div>
    </div>
  );
}
