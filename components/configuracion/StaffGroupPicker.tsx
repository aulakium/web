"use client";

import { useRef } from "react";
import { Icon } from "@/components/icons";
import { assignGroup } from "@/app/(app)/configuracion/docentes/actions";

interface Option {
  value: string;
  label: string;
}

/** Selector "+ salón" que envía al elegir una opción. */
export function StaffGroupPicker({
  membershipId,
  groups,
}: {
  membershipId: string;
  groups: Option[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (groups.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink/15 px-3 py-1 text-xs font-600 text-ink/35">
        Todos los salones asignados
      </span>
    );
  }

  return (
    <form ref={formRef} action={assignGroup} className="relative inline-flex">
      <input type="hidden" name="membershipId" value={membershipId} />
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/50">
        <Icon name="Plus" className="h-3.5 w-3.5" />
      </span>
      <select
        name="groupId"
        defaultValue=""
        onChange={() => formRef.current?.requestSubmit()}
        className="cursor-pointer rounded-full border border-ink/15 bg-white py-1 pl-7 pr-3 text-xs font-700 text-ink/70 outline-none transition-colors hover:border-brand/40 focus:ring-2 focus:ring-brand/30"
        aria-label="Agregar salón"
      >
        <option value="" disabled>
          Agregar salón
        </option>
        {groups.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </form>
  );
}
