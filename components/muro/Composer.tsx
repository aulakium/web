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
  const [audOpen, setAudOpen] = useState(false);
  const [audCount, setAudCount] = useState(0);
  // Controlados: un error (p. ej. sin permiso) no borra lo escrito.
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function refreshAud(form: HTMLFormElement | null) {
    if (form) setAudCount(form.querySelectorAll('input[name="audience"]:checked').length);
  }
  const [state, formAction, pending] = useActionState<CreatePostState, FormData>(
    createPost,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setTitle("");
      setBody("");
      setPollMode(false);
      setOptionCount(2);
      setCommentsOff(false);
      setAudOpen(false);
      setAudCount(0);
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del aviso (opcional)"
            className="w-full rounded-xl bg-mist px-4 py-2.5 text-sm font-700 text-ink outline-none placeholder:font-600 placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />
          <textarea
            name="body"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
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

      {audOpen ? (
        <div className="mt-3 rounded-2xl border border-ink/10 bg-mist/40 p-3" onChange={() => refreshAud(formRef.current)}>
          <p className="mb-1.5 text-[11px] font-700 uppercase tracking-wide text-ink/40">Enviar a</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "all", l: "Todos" },
              { v: "teacher", l: "Docentes" },
              { v: "guardian", l: "Padres" },
              { v: "both", l: "Docentes y padres" },
            ].map((o) => (
              <label key={o.v} className="cursor-pointer">
                <input type="radio" name="audienceRole" value={o.v} defaultChecked={o.v === "all"} className="peer sr-only" />
                <span className="block rounded-full bg-white px-3 py-1.5 text-xs font-700 text-ink/55 ring-1 ring-ink/10 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink">
                  {o.l}
                </span>
              </label>
            ))}
          </div>

          <p className="mb-1.5 mt-3 text-[11px] font-700 uppercase tracking-wide text-ink/40">
            Destinos <span className="font-500 normal-case text-ink/35">· vacío = toda la comunidad</span>
          </p>
          <div className="flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
            {audiences?.community ? (
              <label className="flex items-center gap-2 text-xs font-700 text-ink/75">
                <input type="checkbox" name="audience" value={audiences.community.value} className="h-4 w-4 accent-brand" />
                {audiences.community.label}
              </label>
            ) : null}
            {[
              { title: "Niveles", opts: audiences?.levels ?? [] },
              { title: "Grados", opts: audiences?.grades ?? [] },
              { title: "Salones", opts: audiences?.groups ?? [] },
            ]
              .filter((s) => s.opts.length)
              .map((s) => (
                <div key={s.title}>
                  <p className="mb-1 text-[10px] font-700 uppercase tracking-wide text-ink/35">{s.title}</p>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                    {s.opts.map((o) => (
                      <label key={o.value} className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-xs font-600 text-ink/70 ring-1 ring-ink/5">
                        <input type="checkbox" name="audience" value={o.value} className="h-3.5 w-3.5 accent-brand" />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
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
        <button
          type="button"
          onClick={() => setAudOpen((v) => !v)}
          aria-expanded={audOpen}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-mist px-3 py-2 text-xs font-700 text-ink outline-none focus:ring-2 focus:ring-brand/30 sm:max-w-xs"
        >
          <Icon name="Users" className="h-[15px] w-[15px] text-ink/50" />
          <span className="truncate">{audCount > 0 ? `${audCount} destino${audCount > 1 ? "s" : ""}` : "Toda la comunidad"}</span>
          <Icon name="ChevronDown" className="ml-auto h-4 w-4 text-ink/40" />
        </button>
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
