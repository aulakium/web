"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useIdentity } from "../identity-context";
import { DEMO_USER } from "@/lib/domain";
import { createPost, type CreatePostState } from "@/app/(app)/muro/actions";
import type { AudienceOptions } from "@/lib/audiences";

/**
 * Compositor del Muro. Solo lo ve quien puede publicar (roles de gestión).
 * Permite elegir la audiencia: comunidad / nivel / grado / salón / rol.
 */
export function Composer({
  canPublish = false,
  audiences,
}: {
  canPublish?: boolean;
  audiences?: AudienceOptions;
}) {
  const me = useIdentity();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<CreatePostState, FormData>(
    createPost,
    null,
  );

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (!canPublish) return null;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[1.75rem] border border-ink/5 bg-white p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <Avatar name={me?.name ?? DEMO_USER.name} color="brand" />
        <div className="min-w-0 flex-1">
          <input
            name="title"
            placeholder="Título del aviso (opcional)"
            className="w-full rounded-xl bg-mist px-4 py-2.5 text-sm font-700 text-ink outline-none placeholder:font-600 placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />
          <textarea
            name="body"
            rows={2}
            placeholder="Compartí un aviso con la comunidad…"
            className="mt-2 w-full resize-none rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="mt-2 pl-[52px] text-xs font-700 text-rose">
          {state.error}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2 border-t border-ink/5 pt-3">
        <span className="hidden text-ink/40 sm:block">
          <Icon name="Users" className="h-[18px] w-[18px]" />
        </span>
        <select
          name="audience"
          defaultValue={audiences?.community?.value}
          aria-label="¿A quién va dirigido?"
          className="min-w-0 flex-1 rounded-xl bg-mist px-3 py-2 text-xs font-700 text-ink outline-none focus:ring-2 focus:ring-brand/30 sm:max-w-xs"
        >
          {audiences?.community ? (
            <option value={audiences.community.value}>{audiences.community.label}</option>
          ) : null}
          {audiences?.levels.length ? (
            <optgroup label="Niveles">
              {audiences.levels.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ) : null}
          {audiences?.grades.length ? (
            <optgroup label="Grados">
              {audiences.grades.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ) : null}
          {audiences?.groups.length ? (
            <optgroup label="Salones">
              {audiences.groups.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ) : null}
          {audiences?.roles.length ? (
            <optgroup label="Roles">
              {audiences.roles.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ) : null}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto flex items-center gap-1.5 rounded-2xl bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-60"
        >
          <Icon name="Send" className="h-4 w-4" />
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
