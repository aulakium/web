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
  type PostComment,
  type CommentState,
} from "@/app/(app)/muro/actions";
import { PollView } from "./PollView";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { t } = useLocale();
  const me = useIdentity();
  const [liked, setLiked] = useState(post.liked);
  const [, startLike] = useTransition();
  const [saved, setSaved] = useState(post.bookmarked);
  const [, startSave] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [readDone, setReadDone] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [, startComments] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [cState, commentAction] = useActionState<CommentState, FormData>(addComment, null);

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
            <h3 className="font-display text-lg font-700 leading-snug text-ink">{post.title}</h3>
            <p className={`mt-1.5 text-[15px] leading-relaxed text-ink/70 ${expanded ? "" : "line-clamp-2"}`}>
              {post.body}
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
          </div>
        </div>

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
                {comments.map((c) => (
                  <li key={c.id} className="flex items-start gap-2.5">
                    <Avatar name={c.authorName} color="sky" size="sm" />
                    <div className="min-w-0 flex-1 rounded-2xl bg-mist px-3 py-2">
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
