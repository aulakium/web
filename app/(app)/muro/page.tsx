"use client";

import { Topbar } from "@/components/Topbar";
import { Composer } from "@/components/muro/Composer";
import { Filters } from "@/components/muro/Filters";
import { PostCard } from "@/components/muro/PostCard";
import { RightRail } from "@/components/muro/RightRail";
import { useLocale } from "@/components/locale-context";
import { DEMO_POSTS } from "@/lib/domain";

export default function MuroPage() {
  const { t } = useLocale();

  return (
    <>
      <Topbar title={t("wall.title")} subtitle={t("wall.subtitle")} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Título visible en móvil (en desktop lo muestra el Topbar) */}
        <div className="mb-4 lg:hidden">
          <h1 className="font-display text-2xl font-800 text-ink">
            {t("wall.title")}
          </h1>
          <p className="text-sm font-600 text-ink/55">{t("wall.subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Columna principal: feed */}
          <div className="flex flex-col gap-5">
            <Composer />
            <Filters />
            {DEMO_POSTS.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {/* Rail derecho (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <RightRail />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
