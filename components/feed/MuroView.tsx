"use client";

import { useState, useTransition } from "react";
import { Composer } from "@/components/feed/Composer";
import { Filters, type WallFilter } from "@/components/feed/Filters";
import { PostCard } from "@/components/feed/PostCard";
import { RightRail, type RailEvent, type RailTask } from "@/components/feed/RightRail";
import { Icon } from "@/components/icons";
import { useLocale } from "@/components/locale-context";
import type { Post } from "@/lib/domain";
import type { AudienceOptions } from "@/lib/audiences";
import { getMorePosts } from "@/app/(app)/feed/actions";

const PAGE_SIZE = 8;

export function MuroView({
  posts: initialPosts,
  canPublish = false,
  audiences,
}: {
  posts: Post[];
  canPublish?: boolean;
  audiences?: AudienceOptions;
}) {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<WallFilter>("all");
  // Paginación: arrancamos con la primera página y vamos sumando con "Ver más".
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [done, setDone] = useState(initialPosts.length < PAGE_SIZE);
  const [loadingMore, startMore] = useTransition();

  function loadMore() {
    startMore(async () => {
      const next = await getMorePosts(posts.length);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      if (next.length < PAGE_SIZE) setDone(true);
    });
  }

  const shown = posts.filter((p) =>
    filter === "unread" ? p.unread : filter === "saved" ? p.bookmarked : true,
  );

  // Mantiene "bookmarked" en sincronía con la acción optimista de cada tarjeta,
  // para que el filtro "Guardados" muestre lo recién guardado sin recargar.
  function handleBookmarkChange(postId: string, saved: boolean) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, bookmarked: saved } : p)));
  }

  // Rail: próximos eventos (invitaciones) y mis tareas pendientes (sin completar).
  const railEvents: RailEvent[] = posts
    .filter((p) => p.kind === "event" && p.eventAt)
    .sort((a, b) => (a.eventAt! < b.eventAt! ? -1 : 1))
    .slice(0, 4)
    .map((p) => {
      const d = new Date(p.eventAt!);
      return {
        id: p.id,
        day: d.toLocaleDateString(locale, { day: "numeric", timeZone: "UTC" }),
        month: d.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).replace(".", "").toUpperCase(),
        title: p.title || p.body,
        time: d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
        accent: "brand",
        isPost: true,
      };
    });
  const railTasks: RailTask[] = posts
    .filter((p) => p.kind === "task" && !p.taskDone)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title || p.body,
      due: p.taskDue
        ? new Date(p.taskDue).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          })
        : t("rail.noDate"),
      group: p.audience.label,
      done: false,
      isPost: true,
    }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-700 text-ink">{t("wall.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("wall.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Columna principal: feed */}
        <div className="flex flex-col gap-5">
          <Composer canPublish={canPublish} audiences={audiences} />
          <Filters active={filter} onChange={setFilter} />
          {shown.length > 0 ? (
            shown.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} onBookmarkChange={handleBookmarkChange} />
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
                <Icon name="Megaphone" className="h-6 w-6" />
              </span>
              <p className="font-display text-base font-700 text-ink">
                {t("wall.empty.title")}
              </p>
              <p className="mt-1 text-sm font-500 text-ink/55">
                {t("wall.empty.body")}
              </p>
            </div>
          )}

          {!done && posts.length > 0 ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-700 text-ink/70 shadow-card transition-colors hover:text-ink disabled:opacity-60"
            >
              {loadingMore ? (
                t("common.loading")
              ) : (
                <>
                  <Icon name="ChevronDown" className="h-4 w-4" />
                  {t("wall.loadMore")}
                </>
              )}
            </button>
          ) : null}
        </div>

        {/* Rail derecho (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pb-4 [scrollbar-width:thin]">
            <RightRail events={railEvents} tasks={railTasks} />
          </div>
        </aside>
      </div>
    </main>
  );
}
