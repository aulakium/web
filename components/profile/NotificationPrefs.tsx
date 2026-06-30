"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/components/locale-context";
import { NOTIF_CATEGORIES, type NotifCategory } from "@/lib/notifications/prefs";
import { setNotificationPush } from "@/app/(app)/profile/actions";

export function NotificationPrefs({
  push,
}: {
  /** Estado resuelto (con defaults aplicados) por categoría. */
  push: Record<NotifCategory, boolean>;
}) {
  const { t } = useLocale();
  const [state, setState] = useState(push);
  const [, startTransition] = useTransition();

  function toggle(cat: NotifCategory) {
    const next = !state[cat];
    setState((s) => ({ ...s, [cat]: next })); // optimista
    startTransition(() => setNotificationPush(cat, next));
  }

  return (
    <section className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
      <h2 className="mb-1 font-display text-base font-700 text-ink">{t("notif.title")}</h2>
      <p className="mb-4 text-xs font-500 text-ink/50">{t("notif.note")}</p>

      <div className="flex flex-col divide-y divide-ink/8">
        {NOTIF_CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-700 text-ink">{t(`notif.cat.${cat}`)}</p>
              <p className="text-xs font-500 text-ink/45">{t(`notif.catNote.${cat}`)}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state[cat]}
              aria-label={t(`notif.cat.${cat}`)}
              onClick={() => toggle(cat)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                state[cat] ? "bg-brand" : "bg-ink/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  state[cat] ? "left-[1.375rem]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-500 text-ink/40">{t("notif.emailSoon")}</p>
    </section>
  );
}
