"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { createStudent, deleteStudent, type StudentState } from "@/app/(app)/settings/families/actions";

interface Opt {
  value: string;
  label: string;
}

const FIELD =
  "rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30";

export function StudentForm({ groups }: { groups: Opt[] }) {
  const [state, action, pending] = useActionState<StudentState, FormData>(createStudent, null);

  return (
    <form action={action} className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
      <h2 className="mb-3 font-display text-base font-700 text-ink">Agregar alumno</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nombre y apellido del alumno" className={FIELD} />
        <select name="groupId" className={FIELD}>
          <option value="">Salón…</option>
          {groups.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-1.5 mt-3 text-xs font-700 text-ink/60">
        Tutor (opcional) — le llega la invitación por correo
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="tutorName" placeholder="Nombre del tutor" className={FIELD} />
        <input name="tutorEmail" type="email" placeholder="Correo del tutor" className={FIELD} />
        <input name="tutorRel" placeholder="Relación (madre, padre…)" className={FIELD} />
      </div>

      {state?.error ? (
        <p role="alert" className="mt-3 text-sm font-700 text-rose">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="mt-3 text-sm font-600 text-leaf">
          ✓ Alumno agregado{state.emailed ? " e invitación enviada al tutor" : ""}.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-60"
      >
        <Icon name="Plus" className="h-4 w-4" />
        {pending ? "Guardando…" : "Agregar alumno"}
      </button>
    </form>
  );
}

/** Botón de baja de alumno, con confirmación. */
export function DeleteStudentButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteStudent}
      onSubmit={(e) => {
        if (!confirm(`¿Dar de baja a "${name}"? Se quitan su inscripción y sus vínculos.`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Dar de baja"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink/35 transition-colors hover:bg-rose/10 hover:text-rose"
      >
        <Icon name="Trash2" className="h-4 w-4" />
      </button>
    </form>
  );
}
