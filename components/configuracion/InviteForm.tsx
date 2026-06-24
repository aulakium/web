"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { inviteMember, type InviteState } from "@/app/(app)/configuracion/personas/actions";

interface Option {
  value: string;
  label: string;
}

export function InviteForm({
  roles,
  groups,
  students,
}: {
  roles: Option[];
  groups: Option[];
  students: Option[];
}) {
  const [role, setRole] = useState("");
  const [state, formAction, pending] = useActionState<InviteState, FormData>(
    inviteMember,
    null,
  );
  const isGuardian = role === "guardian";

  return (
    <form
      action={formAction}
      className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card"
    >
      <h2 className="mb-3 font-display text-base font-700 text-ink">Invitar a alguien</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="email"
          type="email"
          required
          placeholder="Correo"
          className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />
        <input
          name="fullName"
          placeholder="Nombre y apellido"
          className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />
        <select
          name="roleKey"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">Rol…</option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          name="groupId"
          className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">Salón (opcional)…</option>
          {groups.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        {isGuardian ? (
          <>
            <select
              name="studentId"
              className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">Alumno/a vinculado…</option>
              {students.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              name="relationship"
              placeholder="Relación (madre, padre, tutor…)"
              className="rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
            />
          </>
        ) : null}
      </div>

      {state?.error ? (
        <p role="alert" className="mt-3 text-sm font-700 text-rose">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <div className="mt-3 rounded-xl bg-leaf/10 px-4 py-2.5 text-sm font-600 text-ink/75">
          {state.emailed ? (
            <span className="font-700 text-leaf">✓ Invitación enviada por correo.</span>
          ) : (
            <>
              <span className="font-700 text-ink">Invitación creada.</span> No se envió el correo
              (revisa Resend). Enlace para compartir:
              <br />
              <a href={state.link} className="break-all text-xs text-brand underline">
                {state.link}
              </a>
            </>
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-60"
      >
        <Icon name="Send" className="h-4 w-4" />
        {pending ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
