"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useLocale } from "@/components/locale-context";
import { toggleTask } from "@/app/(app)/feed/actions";
import type { Post } from "@/lib/domain";

/** Lista de tareas tipo novedad. Las familias las cumplen (checkbox); el equipo
 *  (docente/dirección) solo las ve y abre su detalle. */
export function TasksView({ tasks, staff = false }: { tasks: Post[]; staff?: boolean }) {
  const { t, locale } = useLocale();
  const [done, setDone] = useState<Set<string>>(
    () => new Set(tasks.filter((p) => p.taskDone).map((p) => p.id)),
  );
  const [, start] = useTransition();

  function toggle(id: string) {
    const next = !done.has(id);
    setDone((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
    start(() => toggleTask(id, next));
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
          <Icon name="CircleCheck" className="h-6 w-6" />
        </span>
        <p className="text-sm font-500 text-ink/55">{t("tasks.empty")}</p>
      </div>
    );
  }

  const pending = tasks.filter((p) => !done.has(p.id));
  const completed = tasks.filter((p) => done.has(p.id));

  const dueLabel = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" })
      : null;

  function Card({ p }: { p: Post }) {
    const isDone = done.has(p.id);
    return (
      <div className="flex items-center gap-3 rounded-[1.25rem] border border-ink/5 bg-white p-3 shadow-card">
        {staff ? (
          // El equipo no "cumple" la tarea: solo un ícono, sin checkbox.
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cta/10 text-cta">
            <Icon name="ClipboardList" className="h-4 w-4" />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => toggle(p.id)}
            aria-pressed={isDone}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
              isDone ? "border-brand bg-brand text-white" : "border-ink/20 text-transparent hover:border-brand"
            }`}
          >
            <Icon name="Check" className="h-4 w-4" />
          </button>
        )}
        <Link href={`/aviso/${p.id}`} className="min-w-0 flex-1">
          <p className={`truncate text-sm font-700 ${!staff && isDone ? "text-ink/40 line-through" : "text-ink"}`}>
            {p.title || p.body}
          </p>
          <p className="truncate text-xs font-600 text-ink/50">
            {p.audience.label}
            {p.taskDue ? ` · ${t("post.before")} ${dueLabel(p.taskDue)}` : ""}
          </p>
        </Link>
        <Icon name="ChevronRight" className="h-4 w-4 shrink-0 text-ink/30" />
      </div>
    );
  }

  // El equipo ve todas las tareas en una sola lista (no las cumple).
  if (staff) {
    return (
      <div className="flex flex-col gap-2.5">
        {tasks.map((p) => (
          <Card key={p.id} p={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-base font-700 text-ink">
            {t("tasks.pending")}{" "}
            <span className="rounded-full bg-cta/10 px-2 py-0.5 text-xs font-700 text-cta">{pending.length}</span>
          </h2>
          <div className="flex flex-col gap-2.5">
            {pending.map((p) => (
              <Card key={p.id} p={p} />
            ))}
          </div>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-base font-700 text-ink/55">{t("tasks.done")}</h2>
          <div className="flex flex-col gap-2.5">
            {completed.map((p) => (
              <Card key={p.id} p={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
