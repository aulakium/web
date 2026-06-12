import { DEMO_CALENDARS, type CalEvent } from "@/lib/domain";
import { type AccentColor } from "../colors";

/** Color (token) de un sub-calendario por su id. */
export function calendarColor(calendarId: string): AccentColor {
  const c = DEMO_CALENDARS.find((x) => x.id === calendarId);
  return (c?.color as AccentColor) ?? "brand";
}

/** Nombre de un sub-calendario por su id. */
export function calendarName(calendarId: string): string {
  return DEMO_CALENDARS.find((x) => x.id === calendarId)?.name ?? "";
}

/** Índice del primer día del mes con semana que arranca en lunes (lun=0 … dom=6). */
export function mondayFirstOffset(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Encabezados de día (Lun…Dom) localizados con Intl según el locale activo. */
export function weekdayHeaders(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2024-01-01 fue lunes; generamos lun→dom.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2024, 0, 1 + i)),
  );
}

/** Ordena eventos de un día: todo-el-día primero, luego por hora. */
export function sortDayEvents(events: CalEvent[]): CalEvent[] {
  return [...events].sort((a, b) => {
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}
