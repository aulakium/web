"use client";

import { Topbar } from "@/components/Topbar";
import { ConversationsView } from "@/components/conversaciones/ConversationsView";
import { useLocale } from "@/components/locale-context";

export default function ConversacionesPage() {
  const { t } = useLocale();

  return (
    <>
      <Topbar title={t("conv.title")} subtitle={t("conv.subtitle")} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 lg:hidden">
          <h1 className="font-display text-2xl font-800 text-ink">
            {t("conv.title")}
          </h1>
          <p className="text-sm font-600 text-ink/55">{t("conv.subtitle")}</p>
        </div>

        <ConversationsView />
      </main>
    </>
  );
}
