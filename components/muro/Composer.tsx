"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useIdentity } from "../identity-context";
import { DEMO_USER } from "@/lib/domain";
import { createPost, type CreatePostState } from "@/app/(app)/muro/actions";

/**
 * Compositor del Muro. Solo lo ve quien puede publicar (roles de gestión).
 * v1: publica a TODA la comunidad. El reparto fino por audiencia llega después.
 */
export function Composer({ canPublish = false }: { canPublish?: boolean }) {
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

      <div className="mt-3 flex items-center gap-1 border-t border-ink/5 pt-3">
        <span className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-600 text-ink/35">
          <Icon name="Users" className="h-[16px] w-[16px]" />
          Toda la comunidad
        </span>
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
