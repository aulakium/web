"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  const [pollMode, setPollMode] = useState(false);
  const [optionCount, setOptionCount] = useState(2);
  const [commentsOff, setCommentsOff] = useState(false);
  const [state, formAction, pending] = useActionState<CreatePostState, FormData>(
    createPost,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setPollMode(false);
      setOptionCount(2);
      setCommentsOff(false);
    }
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
            placeholder={pollMode ? "Escribe la pregunta de la encuesta…" : "Comparte un aviso con la comunidad…"}
            className="mt-2 w-full resize-none rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />

          {pollMode ? (
            <div className="mt-2 flex flex-col gap-2">
              {Array.from({ length: optionCount }).map((_, i) => (
                <input
                  key={i}
                  name="option"
                  placeholder={`Opción ${i + 1}`}
                  className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                />
              ))}
              {optionCount < 6 ? (
                <button
                  type="button"
                  onClick={() => setOptionCount((c) => c + 1)}
                  className="self-start text-xs font-700 text-brand hover:text-ink"
                >
                  + Agregar opción
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="isPoll" value={pollMode ? "1" : "0"} />
      <input type="hidden" name="commentsEnabled" value={commentsOff ? "0" : "1"} />

      {state?.error ? (
        <p role="alert" className="mt-2 pl-[52px] text-xs font-700 text-rose">
          {state.error}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2 border-t border-ink/5 pt-3">
        <button
          type="button"
          onClick={() => setPollMode((v) => !v)}
          aria-pressed={pollMode}
          title="Encuesta"
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-700 transition-colors ${
            pollMode ? "bg-brand/10 text-brand" : "text-ink/45 hover:bg-mist hover:text-ink"
          }`}
        >
          <Icon name="ClipboardList" className="h-[16px] w-[16px]" />
          <span className="hidden sm:inline">Encuesta</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOff((v) => !v)}
          aria-pressed={commentsOff}
          title={commentsOff ? "Comentarios desactivados" : "Comentarios activados"}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-700 transition-colors ${
            commentsOff ? "bg-rose/10 text-rose" : "text-ink/45 hover:bg-mist hover:text-ink"
          }`}
        >
          <Icon name={commentsOff ? "MessageCircleOff" : "MessageCircle"} className="h-[16px] w-[16px]" />
          <span className="hidden sm:inline">{commentsOff ? "Sin comentarios" : "Comentarios"}</span>
        </button>
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
