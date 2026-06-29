"use client";

import { useState, useTransition } from "react";
import { Icon } from "../icons";
import { setChildFilter } from "@/app/(app)/child-filter-actions";
import type { MyCourse } from "@/lib/domain";

/**
 * Filtro global "ver por hijo". Para familias con 2+ hijos: un selector arriba
 * que filtra toda la app, con un cartel cuando hay un hijo activo.
 */
export function ChildFilterBar({
  courses,
  active,
}: {
  courses: MyCourse[];
  active: MyCourse | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  // Solo tiene sentido si hay más de un hijo/curso.
  if (courses.length < 2) return null;

  function choose(groupId: string | null) {
    setOpen(false);
    start(() => setChildFilter(groupId));
  }

  const childLabel = (c: MyCourse) => c.personName ?? c.groupName;

  return (
    <div
      className={`flex items-center gap-3 border-b px-4 py-2 sm:px-5 ${
        active ? "border-brand/20 bg-brand/[0.06]" : "border-ink/8 bg-white"
      }`}
    >
      {active ? (
        <>
          <span className="inline-flex items-center gap-1.5 text-sm font-700 text-ink">
            <Icon name="Users" className="h-4 w-4 text-brand" />
            Viendo solo a {active.personName ?? active.groupName}
            <span className="font-600 text-ink/45">· {active.groupName}</span>
          </span>
          <button
            type="button"
            onClick={() => choose(null)}
            disabled={pending}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-700 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
          >
            <Icon name="X" className="h-3.5 w-3.5" />
            Quitar filtro
          </button>
        </>
      ) : (
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={pending}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-700 text-ink/70 transition-colors hover:border-brand/40 hover:text-ink disabled:opacity-50"
          >
            <Icon name="Users" className="h-3.5 w-3.5 text-ink/50" />
            Ver por hijo
            <Icon name="ChevronDown" className="h-3.5 w-3.5 text-ink/40" />
          </button>
          {open ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
              <ul
                role="listbox"
                className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-pop"
              >
                {courses.map((c) => (
                  <li key={c.groupId}>
                    <button
                      type="button"
                      onClick={() => choose(c.groupId)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-mist"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-[11px] font-700 text-brand">
                        {c.groupName.replace(/\s*Sec$/, "").slice(0, 3)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-700 text-ink">{childLabel(c)}</span>
                        <span className="block truncate text-xs font-600 text-ink/50">{c.groupName}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
