"use client";

import { Topbar } from "@/components/Topbar";
import { RequestsView } from "@/components/tramites/RequestsView";
import { useLocale } from "@/components/locale-context";

export default function TramitesPage() {
  const { t } = useLocale();

  return (
    <>
      <Topbar title={t("req.title")} subtitle={t("req.subtitle")} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 lg:hidden">
          <h1 className="font-display text-2xl font-800 text-ink">
            {t("req.title")}
          </h1>
          <p className="text-sm font-600 text-ink/55">{t("req.subtitle")}</p>
        </div>

        <RequestsView />
      </main>
    </>
  );
}
