"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useIdentity } from "../identity-context";
import { useLocale } from "../locale-context";
import { DEMO_USER } from "@/lib/domain";
import { createPost, type CreatePostState } from "@/app/(app)/feed/actions";
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
  const { t } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [pollMode, setPollMode] = useState(false);
  const [postType, setPostType] = useState<"comunicado" | "invitacion" | "tarea">("comunicado");
  const [optionCount, setOptionCount] = useState(2);
  const [commentsOff, setCommentsOff] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [audOpen, setAudOpen] = useState(false);
  const [audCount, setAudCount] = useState(0);
  const [audError, setAudError] = useState("");
  // El docente no puede dirigir a toda la comunidad: solo a sus grupos.
  const canCommunity = !!audiences?.community;
  // Controlados: un error (p. ej. sin permiso) no borra lo escrito.
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // Cuándo publicar: ahora (default) o programado. El default al programar es
  // mañana 8:00 (se calcula en el cliente para no chocar con la hidratación).
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [publishAt, setPublishAt] = useState("");
  function tomorrowAt8() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T08:00`;
  }
  function chooseSchedule() {
    setPublishMode("schedule");
    setPublishAt((v) => v || tomorrowAt8());
  }

  function refreshAud(form: HTMLFormElement | null) {
    if (form) {
      const n = form.querySelectorAll('input[name="audience"]:checked').length;
      setAudCount(n);
      if (n > 0) setAudError("");
    }
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
      setPublishMode("now");
      setPublishAt("");
      setPollMode(false);
      setPostType("comunicado");
      setOptionCount(2);
      setCommentsOff(false);
      setFileNames([]);
      if (fileRef.current) fileRef.current.value = "";
      setAudOpen(false);
      setAudCount(0);
    }
  }, [state]);

  if (!canPublish) return null;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (!canCommunity && audCount === 0) {
          e.preventDefault();
          setAudError(t("comp.audError"));
          setAudOpen(true);
        }
      }}
      className="rounded-[1.75rem] border border-ink/5 bg-white p-4 shadow-card"
    >
      <input type="hidden" name="postType" value={pollMode ? "comunicado" : postType} />

      <div className="flex items-start gap-3">
        <Avatar name={me?.name ?? DEMO_USER.name} color="brand" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {[
              { v: "comunicado", l: t("comp.type.comunicado"), icon: "Megaphone" },
              { v: "invitacion", l: t("comp.type.invitacion"), icon: "CalendarDays" },
              { v: "tarea", l: t("comp.type.tarea"), icon: "ClipboardList" },
              { v: "encuesta", l: t("comp.type.encuesta"), icon: "BarChart3" },
            ].map((o) => {
              const active = o.v === "encuesta" ? pollMode : !pollMode && postType === o.v;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => {
                    if (o.v === "encuesta") {
                      setPollMode(true);
                    } else {
                      setPollMode(false);
                      setPostType(o.v as typeof postType);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
                    active
                      ? "bg-ink text-white ring-ink"
                      : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
                  }`}
                >
                  <Icon name={o.icon} className="h-3.5 w-3.5" />
                  {o.l}
                </button>
              );
            })}
          </div>

          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              postType === "invitacion"
                ? t("comp.titlePh.invitacion")
                : postType === "tarea"
                  ? t("comp.titlePh.tarea")
                  : t("comp.titlePh.comunicado")
            }
            className="w-full rounded-xl bg-mist px-4 py-2.5 text-sm font-700 text-ink outline-none placeholder:font-600 placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />
          <textarea
            name="body"
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={pollMode ? t("comp.bodyPh.poll") : t("comp.bodyPh.default")}
            className="mt-2 w-full resize-none rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
          />

          {pollMode ? (
            <div className="mt-2 flex flex-col gap-2">
              {Array.from({ length: optionCount }).map((_, i) => (
                <input
                  key={i}
                  name="option"
                  placeholder={`${t("comp.option")} ${i + 1}`}
                  className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                />
              ))}
              {optionCount < 6 ? (
                <button
                  type="button"
                  onClick={() => setOptionCount((c) => c + 1)}
                  className="self-start text-xs font-700 text-brand hover:text-ink"
                >
                  {t("comp.addOption")}
                </button>
              ) : null}
            </div>
          ) : null}

          {!pollMode && postType === "invitacion" ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="relative">
                <Icon name="MapPin" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                <input
                  name="eventLocation"
                  placeholder={t("comp.eventLocationPh")}
                  className="w-full rounded-xl bg-mist py-2.5 pl-9 pr-3 text-sm font-600 text-ink outline-none placeholder:text-ink/45 focus:ring-2 focus:ring-brand/30"
                />
              </div>
              {/* Fecha obligatoria, hora opcional (sin hora = todo el día). */}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="relative">
                  <Icon name="CalendarDays" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                  <input
                    name="eventDate"
                    type="date"
                    title={t("comp.eventDate")}
                    className="w-full rounded-xl bg-mist py-2.5 pl-9 pr-3 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div className="relative">
                  <Icon name="Clock" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                  <input
                    name="eventTime"
                    type="time"
                    title={t("comp.eventTime")}
                    className="w-full rounded-xl bg-mist py-2.5 pl-9 pr-3 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>
              <p className="px-1 text-[11px] font-600 text-ink/40">{t("comp.allDayHint")}</p>
            </div>
          ) : null}

          {!pollMode && postType === "tarea" ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select
                name="taskAction"
                defaultValue="complete"
                className="rounded-xl bg-mist px-3 py-2.5 text-sm font-700 text-ink outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="sign">{t("comp.task.sign")}</option>
                <option value="submit">{t("comp.task.submit")}</option>
                <option value="complete">{t("comp.task.complete")}</option>
                <option value="read">{t("comp.task.read")}</option>
              </select>
              <div className="relative">
                <Icon name="Clock" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                <input
                  name="taskDue"
                  type="date"
                  title={t("comp.taskDueTitle")}
                  className="w-full rounded-xl bg-mist py-2.5 pl-9 pr-3 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
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
          <p className="mb-1.5 text-[11px] font-700 uppercase tracking-wide text-ink/40">{t("comp.sendTo")}</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "all", l: t("comp.aud.all") },
              { v: "teacher", l: t("comp.aud.teacher") },
              { v: "guardian", l: t("comp.aud.guardian") },
              { v: "both", l: t("comp.aud.both") },
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
            {t("comp.destinations")}{" "}
            <span className="font-500 normal-case text-ink/35">
              · {canCommunity ? t("comp.destEmpty") : t("comp.destPick")}
            </span>
          </p>
          {audError ? (
            <p role="alert" className="mb-1.5 text-xs font-700 text-rose">
              {audError}
            </p>
          ) : null}
          <div className="flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
            {audiences?.community ? (
              <label className="flex items-center gap-2 text-xs font-700 text-ink/75">
                <input type="checkbox" name="audience" value={audiences.community.value} className="h-4 w-4 accent-brand" />
                {audiences.community.label}
              </label>
            ) : null}
            {[
              { title: t("comp.levels"), opts: audiences?.levels ?? [] },
              { title: t("comp.grades"), opts: audiences?.grades ?? [] },
              { title: t("comp.groups"), opts: audiences?.groups ?? [] },
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

      {/* Input de archivos (oculto) + chips de seleccionados */}
      <input
        ref={fileRef}
        type="file"
        name="attachment"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        className="hidden"
        onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
      {fileNames.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {fileNames.map((n, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs font-600 text-ink/70"
            >
              <Icon name="Paperclip" className="h-3.5 w-3.5 text-ink/40" />
              <span className="max-w-[160px] truncate">{n}</span>
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              setFileNames([]);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="text-xs font-700 text-ink/40 hover:text-rose"
          >
            {t("comp.remove")}
          </button>
        </div>
      ) : null}

      {/* Cuándo publicar: ahora (default) o programar a futuro */}
      <input type="hidden" name="publishMode" value={publishMode} />
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/5 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] font-700 uppercase tracking-wide text-ink/40">
          <Icon name="Clock" className="h-3.5 w-3.5" />
          {t("comp.publishWhen")}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPublishMode("now")}
            className={`rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
              publishMode === "now" ? "bg-ink text-white ring-ink" : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
            }`}
          >
            {t("comp.publishNow")}
          </button>
          <button
            type="button"
            onClick={chooseSchedule}
            className={`rounded-full px-3 py-1.5 text-xs font-700 ring-1 transition-colors ${
              publishMode === "schedule" ? "bg-ink text-white ring-ink" : "bg-white text-ink/55 ring-ink/10 hover:text-ink"
            }`}
          >
            {t("comp.publishSchedule")}
          </button>
        </div>
        {publishMode === "schedule" ? (
          <input
            name="publishAt"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="rounded-xl bg-mist px-3 py-2 text-xs font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-ink/5 pt-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-pressed={fileNames.length > 0}
          title={t("comp.attachTitle")}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-700 transition-colors ${
            fileNames.length > 0 ? "bg-brand/10 text-brand" : "text-ink/45 hover:bg-mist hover:text-ink"
          }`}
        >
          <Icon name="Paperclip" className="h-[16px] w-[16px]" />
          <span className="hidden sm:inline">{t("comp.attach")}</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOff((v) => !v)}
          aria-pressed={commentsOff}
          title={commentsOff ? t("comp.commentsOffTitle") : t("comp.commentsOnTitle")}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-700 transition-colors ${
            commentsOff ? "bg-rose/10 text-rose" : "text-ink/45 hover:bg-mist hover:text-ink"
          }`}
        >
          <Icon name={commentsOff ? "MessageCircleOff" : "MessageCircle"} className="h-[16px] w-[16px]" />
          <span className="hidden sm:inline">{commentsOff ? t("comp.noComments") : t("comp.comments")}</span>
        </button>
        <button
          type="button"
          onClick={() => setAudOpen((v) => !v)}
          aria-expanded={audOpen}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-mist px-3 py-2 text-xs font-700 text-ink outline-none focus:ring-2 focus:ring-brand/30 sm:max-w-xs"
        >
          <Icon name="Users" className="h-[15px] w-[15px] text-ink/50" />
          <span className="truncate">{audCount > 0 ? `${audCount} ${audCount > 1 ? t("comp.destMany") : t("comp.destOne")}` : canCommunity ? t("comp.allCommunity") : t("comp.pickDest")}</span>
          <Icon name="ChevronDown" className="ml-auto h-4 w-4 text-ink/40" />
        </button>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto flex items-center gap-1.5 rounded-2xl bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-60"
        >
          <Icon name="Send" className="h-4 w-4" />
          {pending ? t("comp.publishing") : t("comp.publish")}
        </button>
      </div>
    </form>
  );
}
