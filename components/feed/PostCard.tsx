"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { SubmitButton } from "../SubmitButton";
import { useLocale } from "../locale-context";
import { useIdentity } from "../identity-context";
import { type Post } from "@/lib/domain";
import { type AccentColor } from "../colors";
import {
  toggleLike,
  toggleBookmark,
  markRead,
  getComments,
  addComment,
  translatePost,
  toggleTask,
  setRsvp,
  type PostComment,
  type CommentState,
} from "@/app/(app)/feed/actions";
import { PollView } from "./PollView";

/** Tiempo relativo localizado ("hace 2 h" / "2 h ago" / "há 2 h") desde el timestamp crudo. */
function relativeTime(iso: string | undefined, locale: string, fallback: string): string {
  if (!iso) return fallback;
  const ms = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const min = Math.round(ms / 60000);
  if (Math.abs(min) < 60) return rtf.format(-min, "minute");
  const h = Math.round(min / 60);
  if (Math.abs(h) < 24) return rtf.format(-h, "hour");
  const d = Math.round(h / 24);
  if (Math.abs(d) < 7) return rtf.format(-d, "day");
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

export function PostCard({
  post,
  index = 0,
  onBookmarkChange,
}: {
  post: Post;
  index?: number;
  /** Avisa al feed cuando cambia "guardado", para que el filtro Guardados use el estado real. */
  onBookmarkChange?: (postId: string, saved: boolean) => void;
}) {
  const { t, locale } = useLocale();
  const me = useIdentity();
  // Traduce un rol; si la clave no existe, muestra el valor crudo.
  const roleName = (rk?: string | null) => {
    if (!rk) return "";
    const label = t(`role.${rk}`);
    return label === `role.${rk}` ? rk : label;
  };
  // Programado: published_at en el futuro (solo lo ve el autor hasta su fecha).
  const isScheduled = !!post.publishedAtISO && new Date(post.publishedAtISO).getTime() > Date.now();
  const scheduledLabel = post.publishedAtISO
    ? new Date(post.publishedAtISO).toLocaleString(locale, {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
      })
    : "";
  const [liked, setLiked] = useState(post.liked);
  const [, startLike] = useTransition();
  const [saved, setSaved] = useState(post.bookmarked);
  const [, startSave] = useTransition();
  const [expanded, setExpanded] = useState(false);
  // Imágenes del aviso (portada + adjuntos imagen) → miniatura a la derecha y
  // lightbox propio (sin abrir la URL de Supabase en otra pestaña).
  const images: string[] = [
    ...(post.image ? [post.image] : []),
    ...((post.attachments ?? []).filter((a) => a.isImage).map((a) => a.url)),
  ];
  const fileAttachments = (post.attachments ?? []).filter((a) => !a.isImage);
  const [lightbox, setLightbox] = useState<number | null>(null);
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

  // Invitación: RSVP (Voy / Tal vez / No voy) con conteo de confirmados.
  const [rsvp, setRsvpState] = useState<Post["myRsvp"]>(post.myRsvp ?? null);
  const [yesCount, setYesCount] = useState(post.rsvpYes ?? 0);
  const [, startRsvp] = useTransition();
  function onRsvp(next: "yes" | "no" | "maybe") {
    const value = rsvp === next ? "none" : next;
    // Ajuste optimista del contador de "Voy".
    setYesCount((c) => c + (next === "yes" && value !== "none" ? 1 : 0) - (rsvp === "yes" ? 1 : 0));
    setRsvpState(value === "none" ? null : next);
    startRsvp(() => setRsvp(post.id, value));
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
      className={`animate-rise overflow-hidden rounded-[1.75rem] border shadow-card ${
        post.unread && !readDone ? "border-cta/20 bg-cream" : "border-ink/5 bg-white"
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
              {t(`role.${post.author.role}`)} ·{" "}
              {isScheduled ? (
                <span className="font-700 text-cta">
                  {t("post.scheduledFor")} {scheduledLabel}
                </span>
              ) : (
                relativeTime(post.publishedAtISO, locale, post.publishedAt)
              )}
            </p>
          </div>
          {post.pinned ? (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cta/10 text-cta">
              <Icon name="Pin" className="h-4 w-4" />
            </span>
          ) : null}
          {post.unread && !readDone ? (
            <button
              type="button"
              onClick={read}
              title="Marcar como leído"
              className="shrink-0 rounded-full bg-cta px-2.5 py-1 text-[11px] font-700 uppercase tracking-wide text-white transition-colors hover:bg-cta-deep"
            >
              {t("wall.unread")}
            </button>
          ) : null}
        </div>

        {/* Audiencia */}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-700 text-brand">
          <Icon name="Users" className="h-3.5 w-3.5" />
          {post.audience.label}
        </span>

        {/* Contenido: texto a la izquierda + imagen (opcional) al margen derecho */}
        <div className={`mt-3 ${images.length ? "flex gap-4" : ""}`}>
          <div
            className={`min-w-0 flex-1 ${expanded ? "" : "cursor-pointer"}`}
            onClick={() => {
              if (!expanded) {
                setExpanded(true);
                read();
              }
            }}
          >
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

          {/* Imagen al margen derecho → abre el lightbox propio */}
          {images.length ? (
            <button
              type="button"
              onClick={() => setLightbox(0)}
              className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32"
              aria-label="Ver imagen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt=""
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {images.length > 1 ? (
                <span className="absolute bottom-1.5 right-1.5 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-700 text-white">
                  +{images.length - 1}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>

        {/* Invitación: lugar + fecha del evento */}
        {post.kind === "event" && (post.eventAt || post.eventLocation) ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl bg-brand/5 px-4 py-3">
            {post.eventAt ? (
              <span className="inline-flex items-center gap-2 text-sm font-700 text-ink">
                <Icon name="CalendarDays" className="h-4 w-4 text-brand" />
                {formatEventDate(post.eventAt, locale, post.eventAllDay)}{" "}
                {post.eventAllDay ? (
                  <span className="font-600 text-ink/50">· {t("post.allDay")}</span>
                ) : null}
              </span>
            ) : null}
            {post.eventLocation ? (
              <span className="inline-flex items-center gap-2 text-sm font-600 text-ink/70">
                <Icon name="MapPin" className="h-4 w-4 text-brand" />
                {post.eventLocation}
              </span>
            ) : null}

            {/* RSVP: confirmación de asistencia */}
            <div className="mt-1 flex w-full flex-wrap items-center gap-1.5 border-t border-brand/10 pt-2.5">
              {([
                { v: "yes", l: t("post.rsvp.yes"), icon: "Check" },
                { v: "maybe", l: t("post.rsvp.maybe"), icon: "CircleCheck" },
                { v: "no", l: t("post.rsvp.no"), icon: "X" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => onRsvp(o.v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-700 transition-colors ${
                    rsvp === o.v
                      ? o.v === "no"
                        ? "bg-rose text-white"
                        : "bg-brand text-white"
                      : "bg-white text-ink/55 ring-1 ring-ink/10 hover:text-ink"
                  }`}
                >
                  <Icon name={o.icon} className="h-3.5 w-3.5" />
                  {o.l}
                </button>
              ))}
              {yesCount > 0 ? (
                <span className="ml-auto text-xs font-700 text-ink/45">
                  {yesCount} {yesCount === 1 ? t("post.rsvp.confirmedOne") : t("post.rsvp.confirmedMany")}
                </span>
              ) : null}
            </div>
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
                {taskDone ? t("post.completed") : t("post.actionRequired")}
              </span>
              <span className="block text-sm font-700 text-ink">
                {t(`post.task.${post.taskAction ?? "complete"}.prompt`)}
                {post.taskDue ? (
                  <span className="font-600 text-ink/50"> · {t("post.before")} {formatDueDate(post.taskDue)}</span>
                ) : null}
              </span>
              {/* El colegio ve cuántos ya cumplieron/leyeron. */}
              {(post.taskCompletions ?? 0) > 0 ? (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-700 text-leaf">
                  <Icon name="CircleCheck" className="h-3.5 w-3.5" />
                  {post.taskCompletions}{" "}
                  {post.taskAction === "read"
                    ? post.taskCompletions === 1 ? t("post.task.readOne") : t("post.task.readMany")
                    : post.taskCompletions === 1 ? t("post.task.doneOne") : t("post.task.doneMany")}
                </span>
              ) : null}
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
              {taskDone ? t("post.done") : t(`post.task.${post.taskAction ?? "complete"}.cta`)}
            </button>
          </div>
        ) : null}

        {/* Adjuntos no-imagen: archivos descargables. Las imágenes se muestran
            arriba a la derecha y se abren en el lightbox propio. */}
        {fileAttachments.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {fileAttachments.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-ink/8 bg-mist/50 px-3 py-2 transition-colors hover:bg-mist"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand">
                  <Icon name="FileText" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-700 text-ink">{a.name}</span>
                <Icon name="ArrowRight" className="h-4 w-4 shrink-0 text-ink/30" />
              </a>
            ))}
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

          <span
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-700 text-ink/45"
            title={`${post.views ?? 0} ${(post.views ?? 0) === 1 ? t("post.viewedOne") : t("post.viewedMany")}`}
          >
            <Icon name="Eye" className="h-[18px] w-[18px]" />
            {post.views ?? 0}
          </span>

          <button
            type="button"
            onClick={() => {
              const next = !saved;
              setSaved(next);
              onBookmarkChange?.(post.id, next);
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
                                {" "}· {roleName(c.authorRole)}
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
                          {t("post.reply")}
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
                                {" "}· {roleName(r.authorRole)}
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
                          placeholder={`${t("post.replyTo")} ${c.authorName}…`}
                          className="min-w-0 flex-1 rounded-full bg-mist px-4 py-2 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                        />
                        <SubmitButton
                          spinnerOnly
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy-deep"
                          aria-label={t("post.reply")}
                        >
                          <Icon name="Send" className="h-4 w-4" />
                        </SubmitButton>
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
                placeholder={t("post.commentPh")}
                className="min-w-0 flex-1 rounded-full bg-mist px-4 py-2 text-sm font-500 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
              <SubmitButton
                spinnerOnly
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-navy-deep"
                aria-label="Comentar"
              >
                <Icon name="Send" className="h-4 w-4" />
              </SubmitButton>
            </form>
            {cState?.error ? (
              <p className="mt-1 pl-10 text-xs font-700 text-rose">{cState.error}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Lightbox propio: muestra la imagen dentro de Colequium (sin abrir Supabase).
          Se monta en <body> (portal) para no quedar atrapado por el transform de la tarjeta. */}
      {lightbox !== null && images[lightbox] && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
          {images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => ((i ?? 0) - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Icon name="ChevronLeft" className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => ((i ?? 0) + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Icon name="ChevronRight" className="h-6 w-6" />
              </button>
            </>
          ) : null}
        </div>,
            document.body,
          )
        : null}
    </article>
  );
}

/** Fecha del evento: "mié 9 jul · 18:30" (o solo la fecha si es todo el día).
 *  UTC para coincidir con el calendario (hora "de pared") y no correr el día. */
function formatEventDate(iso: string, locale: string, allDay?: boolean): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  if (allDay) return day;
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
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
