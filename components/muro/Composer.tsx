"use client";

import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { DEMO_USER } from "@/lib/domain";

/**
 * Compositor del Muro. Sólo lo ve el staff con permiso de publicar a alguna
 * audiencia dentro de su scope (ver §3.3). Para la demo se muestra siempre.
 */
export function Composer() {
  const { t } = useLocale();
  const actions = [
    { icon: "ImageIcon", label: "Foto", color: "text-brand" },
    { icon: "Paperclip", label: "Adjunto", color: "text-requests" },
    { icon: "CalendarDays", label: "Evento", color: "text-sky" },
  ];

  return (
    <div className="rounded-[1.75rem] border border-ink/5 bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar name={DEMO_USER.name} color="brand" />
        <button
          type="button"
          className="flex-1 rounded-2xl bg-mist px-4 py-3 text-left text-sm font-600 text-ink/45 transition-colors hover:bg-cloud"
        >
          {t("wall.composer")}
        </button>
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-2xl bg-cta px-4 py-3 text-sm font-800 text-white shadow-soft transition-colors hover:bg-cta-deep sm:flex"
        >
          <Icon name="Send" className="h-4 w-4" />
          Publicar
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1 border-t border-ink/5 pt-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-700 text-ink/60 transition-colors hover:bg-mist"
          >
            <Icon name={a.icon} className={`h-[18px] w-[18px] ${a.color}`} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
