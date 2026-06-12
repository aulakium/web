"use client";

import { type CalEvent } from "@/lib/domain";
import { ACCENT_DOT } from "../colors";
import {
  calendarColor,
  daysInMonth,
  mondayFirstOffset,
  weekdayHeaders,
} from "./utils";

export function MonthGrid({
  year,
  month,
  locale,
  today,
  selected,
  onSelect,
  eventsByDay,
}: {
  year: number;
  month: number;
  locale: string;
  today: { year: number; month: number; day: number };
  selected: number | null;
  onSelect: (day: number) => void;
  eventsByDay: (day: number) => CalEvent[];
}) {
  const offset = mondayFirstOffset(year, month);
  const total = daysInMonth(year, month);
  const headers = weekdayHeaders(locale);

  // Celdas: blancos iniciales + días del mes, completadas a múltiplos de 7.
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Encabezados de día */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {headers.map((h, i) => (
          <div
            key={i}
            className="py-1 text-center text-[11px] font-800 uppercase tracking-wide text-ink/40"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Días */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-16 sm:min-h-22" />;

          const isToday =
            day === today.day && month === today.month && year === today.year;
          const isSelected = day === selected;
          const dayEvents = eventsByDay(day);
          const dots = dayEvents.slice(0, 4);

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              className={`flex min-h-16 flex-col items-center gap-1 rounded-2xl border p-1.5 text-left transition-colors sm:min-h-22 sm:items-start sm:p-2 ${
                isSelected
                  ? "border-brand bg-brand-wash"
                  : "border-transparent hover:bg-mist"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-sm font-800 ${
                  isToday
                    ? "bg-cta text-white shadow-soft"
                    : isSelected
                      ? "text-ink"
                      : "text-ink/70"
                }`}
              >
                {day}
              </span>

              {/* Puntos por evento (color del sub-calendario) */}
              {dots.length > 0 ? (
                <span className="flex flex-wrap gap-1 px-1 sm:mt-0.5">
                  {dots.map((e) => (
                    <span
                      key={e.id}
                      className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[calendarColor(e.calendarId)]}`}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
