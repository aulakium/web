"use client";

import { useState } from "react";
import { Composer } from "@/components/muro/Composer";
import { Filters, type WallFilter } from "@/components/muro/Filters";
import { PostCard } from "@/components/muro/PostCard";
import { RightRail, type RailEvent, type RailTask } from "@/components/muro/RightRail";
import { Icon } from "@/components/icons";
import { useLocale } from "@/components/locale-context";
import type { Post } from "@/lib/domain";
import type { AudienceOptions } from "@/lib/audiences";

export function MuroView({
  posts,
  canPublish = false,
  audiences,
}: {
  posts: Post[];
  canPublish?: boolean;
  audiences?: AudienceOptions;
}) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<WallFilter>("all");

  const shown = posts.filter((p) =>
    filter === "unread" ? p.unread : filter === "saved" ? p.bookmarked : true,
  );

  // Rail: próximos eventos (invitaciones) y mis tareas pendientes (sin completar).
  const railEvents: RailEvent[] = posts
    .filter((p) => p.kind === "event" && p.eventAt)
    .sort((a, b) => (a.eventAt! < b.eventAt! ? -1 : 1))
    .slice(0, 4)
    .map((p) => {
      const d = new Date(p.eventAt!);
      return {
        id: p.id,
        day: String(d.getDate()),
        month: d.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase(),
        title: p.title || p.body,
        time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        accent: "brand",
      };
    });
  const railTasks: RailTask[] = posts
    .filter((p) => p.kind === "task" && !p.taskDone)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title || p.body,
      due: p.taskDue
        ? new Date(p.taskDue).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          })
        : "Sin fecha",
      group: p.audience.label,
      done: false,
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
            shown.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
                <Icon name="Megaphone" className="h-6 w-6" />
              </span>
              <p className="font-display text-base font-700 text-ink">
                Todavía no hay avisos para ti
              </p>
              <p className="mt-1 text-sm font-500 text-ink/55">
                Cuando el colegio publique algo para tu comunidad o tus grupos, aparece aquí.
              </p>
            </div>
          )}
        </div>

        {/* Rail derecho (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <RightRail events={railEvents} tasks={railTasks} />
          </div>
        </aside>
      </div>
    </main>
  );
}
