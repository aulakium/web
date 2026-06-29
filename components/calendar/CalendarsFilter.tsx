"use client";

import { Icon } from "../icons";
import type { MyCourse } from "@/lib/domain";

/**
 * Filtro del calendario por curso de cada hijo (familias) o salón asignado
 * (docentes). Los eventos de toda la escuela se muestran siempre; este filtro
 * solo oculta/muestra los de un curso puntual.
 */
export function CalendarsFilter({
  courses,
  hidden,
  onToggle,
}: {
  courses: MyCourse[];
  hidden: Set<string>; // groupId ocultos
  onToggle: (groupId: string) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
      <h2 className="mb-1 font-display text-base font-700 text-ink">Filtrar por curso</h2>
      <p className="mb-3 text-xs font-500 text-ink/45">
        Los eventos de toda la escuela se muestran siempre.
      </p>
      <ul className="flex flex-col gap-1">
        {courses.map((c) => {
          const isOn = !hidden.has(c.groupId);
          return (
            <li key={c.groupId}>
              <button
                type="button"
                onClick={() => onToggle(c.groupId)}
                aria-pressed={isOn}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-mist"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-700 transition-opacity ${
                    isOn ? "bg-brand/10 text-brand" : "bg-mist text-ink/30"
                  }`}
                >
                  {c.groupName.replace(/\s*Sec$/, "").slice(0, 3)}
                </span>
                <span className={`min-w-0 flex-1 ${isOn ? "" : "opacity-40"}`}>
                  <span className="block truncate text-sm font-700 text-ink">{c.groupName}</span>
                  {c.personName ? (
                    <span className="block truncate text-xs font-600 text-ink/50">
                      {c.personName}
                    </span>
                  ) : null}
                </span>
                <Icon
                  name={isOn ? "Check" : "Plus"}
                  className={`h-4 w-4 shrink-0 ${isOn ? "text-brand" : "text-ink/25"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
