"use client";

import { useState } from "react";
import { Icon, COVER_ICONS } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { ROLE_LABELS, type Post } from "@/lib/domain";
import { type AccentColor } from "../colors";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { t } = useLocale();
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.bookmarked);
  const [expanded, setExpanded] = useState(false);
  const likes = post.likes + (liked && !post.liked ? 1 : 0) - (!liked && post.liked ? 1 : 0);
  const CoverIcon = COVER_ICONS[post.coverIcon] ?? COVER_ICONS.megaphone;

  return (
    <article
      className={`animate-rise overflow-hidden rounded-[1.75rem] border border-ink/5 shadow-card ${
        index % 2 === 1 ? "bg-cream" : "bg-white"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Portada: foto real subida por quien publica; si no hay, degradé de marca */}
      <div className="relative h-40 overflow-hidden">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${post.cover}`}>
            <CoverIcon
              className="absolute -bottom-4 right-4 h-28 w-28 text-white/25"
              aria-hidden
            />
          </div>
        )}
        {/* Velo para legibilidad de los chips */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-ink/15" />

        {/* Audiencia (a quién va dirigido) */}
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-800 text-ink shadow-sm backdrop-blur">
          <Icon name="Users" className="h-3.5 w-3.5 text-brand" />
          {post.audience.label}
        </span>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {post.pinned ? (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-cta shadow-sm">
              <Icon name="Pin" className="h-4 w-4" />
            </span>
          ) : null}
          {post.unread ? (
            <span className="rounded-full bg-cta px-2.5 py-1 text-[11px] font-800 uppercase tracking-wide text-white shadow-sm">
              {t("wall.unread")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        {/* Autor + rol + tiempo */}
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} color={post.author.color as AccentColor} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-800 text-ink">
              {post.author.name}
            </p>
            <p className="truncate text-xs font-600 text-ink/50">
              {ROLE_LABELS[post.author.role]} · {post.publishedAt}
            </p>
          </div>
          <button
            type="button"
            aria-label="Más opciones"
            className="grid h-9 w-9 place-items-center rounded-xl text-ink/40 transition-colors hover:bg-mist hover:text-ink"
          >
            <Icon name="MoreHorizontal" className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <h3 className="mt-4 font-display text-lg font-800 leading-snug text-ink">
          {post.title}
        </h3>
        <p
          className={`mt-1.5 text-[15px] leading-relaxed text-ink/70 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {post.body}
        </p>
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-1 text-sm font-800 text-brand transition-colors hover:text-ink"
          >
            {t("wall.seeMore")}
          </button>
        ) : null}

        {/* Acciones */}
        <div className="mt-4 flex items-center gap-1.5 border-t border-ink/5 pt-3">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-800 transition-colors ${
              liked
                ? "bg-cta/10 text-cta"
                : "text-ink/55 hover:bg-mist hover:text-ink"
            }`}
            aria-pressed={liked}
          >
            <Icon
              name="Heart"
              className={`h-[18px] w-[18px] ${liked ? "fill-cta" : ""}`}
            />
            {likes}
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-800 text-ink/55 transition-colors hover:bg-mist hover:text-ink"
          >
            <Icon name="MessageCircle" className="h-[18px] w-[18px]" />
            {post.comments}
          </button>

          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className={`ml-auto grid h-10 w-10 place-items-center rounded-xl transition-colors ${
              saved ? "bg-cta/10 text-cta" : "text-ink/45 hover:bg-mist hover:text-ink"
            }`}
            aria-pressed={saved}
            aria-label="Guardar"
          >
            <Icon
              name="Bookmark"
              className={`h-[18px] w-[18px] ${saved ? "fill-cta" : ""}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
