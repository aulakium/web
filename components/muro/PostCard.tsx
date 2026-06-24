"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { ROLE_LABELS, type Post, type RoleKey } from "@/lib/domain";
import { type AccentColor } from "../colors";
import {
  toggleLike,
  toggleBookmark,
  markRead,
  getComments,
  addComment,
  translatePost,
  toggleTask,
  type PostComment,
  type CommentState,
} from "@/app/(app)/muro/actions";
import { PollView } from "./PollView";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { t, locale } = useLocale();
  const me = useIdentity();
  const [liked, setLiked] = useState(post.liked);
  const [, startLike] = useTransition();
  const [saved, setSaved] = useState(post.bookmarked);
  const [, startSave] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [readDone, setReadDone] = useState(false);
  // "Ver traducción": solo cuando el idioma de la interfaz no es español.
  const canTranslate = !locale.startsWith("es");
  const isPt = locale.startsWith("pt");
  const [showTranslation, setShowTranslation] = useState(false);
  const [translated, setTranslated] = useState<{ title: string; body: string } | null>(null);
  const [translating, setTranslating] = useState(false);
  const shownTitle = showTranslation && translated ? translated.title : post.title;
  const shownBody = showTranslation && translated ? translated.body : post.body;

  async function onTranslate() {
    if (translated) {
      setShowTranslation((v) => !v);
      return;
    }
    setTranslating(true);
    const r = await translatePost(post.id, locale);
    setTranslating(false);
    if (r) {
      setTranslated(r);
      setShowTranslation(true);
    }
  }

  const [showComments, setShowComments] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [, startComments] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [cState, commentAction] = useActionState<CommentState, FormData>(addComment, null);

  // Tarea: marcar como hecha (sale de "mis pendientes").
  const [taskDone, setTaskDone] = useState(!!post.taskDone);
  const [, startTask] = useTransition();
  function onToggleTask() {
    const next = !taskDone;
    setTaskDone(next);
    startTask(() => toggleTask(post.id, next));
  }

  const likes = post.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0);

  function loadComments() {
    startComments(() => {
      getComments(post.id).then(setComments);
    });
  }

  function read() {
    if (!post.unread || readDone) return;
    setReadDone(true);
    startComments(() => markRead(post.id));
  }

  // Tras comentar con éxito: recargar comentarios y limpiar el form.
  useEffect(() => {
    if (cState?.ok) {
      formRef.current?.reset();
      setReplyTo(null);
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cState]);

  return (
    <article
      className={`animate-rise overflow-hidden rounded-[1.75rem] border border-ink/5 shadow-card ${
        index % 2 === 1 ? "bg-cream" : "bg-white"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-5">
        {/* Autor + estado */}
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} color={post.author.color as AccentColor} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-700 text-ink">{post.author.name}</p>
            <p className="truncate text-xs font-600 text-ink/50">
              {ROLE_LABELS[post.author.role]} · {post.publishedAt}
            </p>
          </div>
          {post.pinned ? (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cta/10 text-cta">
              <Icon name="Pin" className="h-4 w-4" />
            </span>
          ) : null}
          {post.unread && !readDone ? (
            <span className="shrink-0 rounded-full bg-cta px-2.5 py-1 text-[11px] font-700 uppercase tracking-wide text-white">
              {t("wall.unread")}
            </span>
          ) : null}
        </div>

        {/* Audiencia */}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-700 text-brand">
          <Icon name="Users" className="h-3.5 w-3.5" />
          {post.audience.label}
        </span>

        {/* Contenido: imagen cuadrada (opcional) al costado del texto */}
        <div className={`mt-3 ${post.image ? "flex gap-4" : ""}`}>
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt=""
              className="h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-32"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-700 leading-snug text-ink">{shownTitle}</h3>
            <p className={`mt-1.5 text-[15px] leading-relaxed text-ink/70 ${expanded ? "" : "line-clamp-2"}`}>
              {shownBody}
            </p>
            {!expanded ? (
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  read();
                }}
                className="mt-1 text-sm font-700 text-brand transition-colors hover:text-ink"
              >
                {t("wall.seeMore")}
              </button>
            ) : null}

            {canTranslate ? (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTranslate}
                  disabled={translating}
                  className="inline-flex items-center gap-1.5 text-xs font-700 text-brand transition-colors hover:text-ink disabled:opacity-50"
                >
                  <Icon name="Languages" className="h-3.5 w-3.5" />
                  {translating
                    ? isPt ? "Traduzindo…" : "Translating…"
                    : showTranslation
                      ? isPt ? "Ver original" : "See original"
                      : isPt ? "Ver tradução" : "See translation"}
                </button>
                {showTranslation ? (
                  <span className="text-[11px] font-600 text-ink/35">
                    {isPt ? "traduzido automaticamente" : "translated automatically"}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Invitación: lugar + fecha del evento */}
        {post.kind === "event" && (post.eventAt || post.eventLocation) ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-brand/5 px-4 py-3">
            {post.eventAt ? (
              <span className="inline-flex items-center gap-2 text-sm font-700 text-ink">
                <Icon name="CalendarDays" className="h-4 w-4 text-brand" />
                {formatEventDate(post.eventAt)}
              </span>
            ) : null}
            {post.eventLocation ? (
              <span className="inline-flex items-center gap-2 text-sm font-600 text-ink/70">
                <Icon name="MapPin" className="h-4 w-4 text-brand" />
                {post.eventLocation}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Tarea: acción requerida + marcar como hecha */}
        {post.kind === "task" ? (
          <div
            className={`mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
              taskDone ? "bg-leaf/10" : "bg-cta/5"
            }`}
          >
            <span className="min-w-0">
              <span className="block text-xs font-700 uppercase tracking-wide text-ink/40">
                {taskDone ? "Completada" : "Acción requerida"}
              </span>
              <span className="block text-sm font-700 text-ink">
                {TASK_LABELS[post.taskAction ?? "complete"].prompt}
                {post.taskDue ? (
                  <span className="font-600 text-ink/50"> · antes del {formatDueDate(post.taskDue)}</span>
                ) : null}
              </span>
            </span>
            <button
              type="button"
              onClick={onToggleTask}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-700 transition-colors ${
                taskDone
                  ? "bg-leaf/15 text-leaf hover:bg-leaf/25"
                  : "bg-cta text-white hover:bg-cta-deep"
              }`}
            >
              <Icon name={taskDone ? "CircleCheck" : "Check"} className="h-4 w-4" />
              {taskDone ? "Hecho" : TASK_LABELS[post.taskAction ?? "complete"].cta}
            </button>
          </div>
        ) : null}

        {post.kind === "poll" ? <PollView postId={post.id} /> : null}

        {/* Acciones */}
        <div className="mt-4 flex items-center gap-1.5 border-t border-ink/5 pt-3">
          <button
            type="button"
            onClick={() => {
              setLiked((v) => !v);
              startLike(() => toggleLike(post.id));
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-700 transition-colors ${
              liked ? "bg-cta/10 text-cta" : "text-ink/55 hover:bg-mist hover:text-ink"
            }`}
            aria-pressed={liked}
          >
            <Icon name="Heart" className={`h-[18px] w-[18px] ${liked ? "fill-cta" : ""}`} />
            {likes}
          </button>

          {post.commentsEnabled === false ? (
            <span
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-700 text-ink/35"
              title="El colegio desactivó los comentarios en este aviso"
            >
              <Icon name="MessageCircleOff" className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline text-xs">Comentarios desactivados</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const next = !showComments;
                setShowComments(next);
                if (next && comments === null) loadComments();
                if (next) read();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-700 transition-colors ${
                showComments ? "bg-brand/10 text-brand" : "text-ink/55 hover:bg-mist hover:text-ink"
              }`}
              aria-expanded={showComments}
            >
              <Icon name="MessageCircle" className="h-[18px] w-[18px]" />
              {post.comments}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSaved((v) => !v);
              startSave(() => toggleBookmark(post.id));
            }}
            className={`ml-auto grid h-10 w-10 place-items-center rounded-xl transition-colors ${
              saved ? "bg-cta/10 text-cta" : "text-ink/45 hover:bg-mist hover:text-ink"
            }`}
            aria-pressed={saved}
            aria-label="Guardar"
          >
            <Icon name="Bookmark" className={`h-[18px] w-[18px] ${saved ? "fill-cta" : ""}`} />
          </button>
        </div>

        {/* Comentarios */}
        {showComments ? (
          <div className="mt-3 border-t border-ink/5 pt-3">
            {comments === null ? (
              <p className="text-xs font-600 text-ink/40">Cargando comentarios…</p>
            ) : comments.length === 0 ? (
              <p className="text-xs font-600 text-ink/40">Sé el primero en comentar.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {comments.filter((c) => !c.parentId).map((c) => (
                  <li key={c.id} className="flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={c.authorName} color="sky" size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl bg-mist px-3 py-2">
                          <p className="text-xs font-700 text-ink">
                            {c.authorName}
                            {c.authorRole ? (
                              <span className="font-500 text-ink/45">
                                {" "}· {ROLE_LABELS[c.authorRole as RoleKey] ?? c.authorRole}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-sm font-500 text-ink/80">{c.body}</p>
                          <p className="mt-0.5 text-[11px] font-500 text-ink/35">{c.at}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyTo((v) => (v === c.id ? null : c.id))}
                          className="mt-1 pl-3 text-[11px] font-700 text-brand transition-colors hover:text-ink"
                        >
                          Responder
                        </button>
                      </div>
                    </div>

                    {/* Respuestas (un nivel) */}
                    {comments.filter((r) => r.parentId === c.id).map((r) => (
                      <div key={r.id} className="ml-9 flex items-start gap-2.5">
                        <Avatar name={r.authorName} color="news" size="sm" />
                        <div className="min-w-0 flex-1 rounded-2xl bg-mist/70 px-3 py-2">
                          <p className="text-xs font-700 text-ink">
                            {r.authorName}
                            {r.authorRole ? (
                              <span className="font-500 text-ink/45">
                                {" "}· {ROLE_LABELS[r.authorRole as RoleKey] ?? r.authorRole}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-sm font-500 text-ink/80">{r.body}</p>
                          <p className="mt-0.5 text-[11px] font-500 text-ink/35">{r.at}</p>
                        </div>
                      </div>
                    ))}

                    {/* Caja de respuesta */}
                    {replyTo === c.id ? (
                      <form action={commentAction} className="ml-9 flex items-center gap-2">
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="parentId" value={c.id} />
                        <input
                          name="body"
                          required
                          autoFocus
                          placeholder={`Responde a ${c.authorName}…`}
                          className="min-w-0 flex-1 rounded-full bg-mist px-4 py-2 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                        />
                        <button
                          type="submit"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy-deep"
                          aria-label="Responder"
                        >
                          <Icon name="Send" className="h-4 w-4" />
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            <form ref={formRef} action={commentAction} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <Avatar name={me?.name ?? "Yo"} color="navy" size="sm" />
              <input
                name="body"
                required
                placeholder="Escribe un comentario…"
                className="min-w-0 flex-1 rounded-full bg-mist px-4 py-2 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="submit"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy-deep"
                aria-label="Comentar"
              >
                <Icon name="Send" className="h-4 w-4" />
              </button>
            </form>
            {cState?.error ? (
              <p className="mt-1 pl-10 text-xs font-700 text-rose">{cState.error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Texto del bloque de tarea según la acción pedida. */
const TASK_LABELS: Record<string, { prompt: string; cta: string }> = {
  sign: { prompt: "Hay que firmar este aviso", cta: "Firmar" },
  submit: { prompt: "Hay que entregar algo", cta: "Marcar entregado" },
  complete: { prompt: "Hay una tarea por completar", cta: "Marcar completada" },
};

/** Fecha del evento: "mié 9 jul · 18:30". */
function formatEventDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

/** Fecha límite de tarea (fecha sola, sin hora): "10 jul". UTC para no correr el día. */
function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
