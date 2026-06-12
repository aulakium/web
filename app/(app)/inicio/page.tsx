"use client";

import { Topbar } from "@/components/Topbar";
import { HomeView } from "@/components/inicio/HomeView";
import { useLocale } from "@/components/locale-context";

export default function InicioPage() {
  const { t } = useLocale();

  return (
    <>
      <Topbar title={t("home.title")} subtitle={t("home.subtitle")} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <HomeView />
      </main>
    </>
  );
}
