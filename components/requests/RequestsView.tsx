"use client";

import { useState } from "react";
import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import {
  REQUEST_TYPES,
  DEMO_REQUESTS,
  type RequestStatus,
  type RequestItem,
} from "@/lib/domain";
import {
  ACCENT_ON,
  ACCENT_SOFT_BG,
  ACCENT_TEXT,
  type AccentColor,
} from "../colors";

const STATUS_META: Record<
  RequestStatus,
  { key: string; color: AccentColor; icon: string }
> = {
  submitted: { key: "req.status.submitted", color: "sky", icon: "Clock" },
  approved: { key: "req.status.approved", color: "brand", icon: "CircleCheck" },
  rejected: { key: "req.status.rejected", color: "requests", icon: "X" },
  resolved: { key: "req.status.resolved", color: "navy", icon: "CheckCheck" },
};

const FILTERS = [
  { id: "all", key: "req.filter.all" },
  { id: "pending", key: "req.filter.pending" },
  { id: "resolved", key: "req.filter.resolved" },
] as const;

export function RequestsView({ items, canCreate = true }: { items?: RequestItem[]; canCreate?: boolean }) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const data = items ?? DEMO_REQUESTS;

  const requests = data.filter((r) => {
    if (filter === "pending") return r.status === "submitted";
    if (filter === "resolved") return r.status !== "submitted";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Crear nuevo trámite (no aplica para gestión/dirección) */}
      {canCreate ? (
      <section>
        <h2 className="mb-3 font-display text-base font-700 text-ink">
          {t("req.new")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {REQUEST_TYPES.filter((rt) => rt.type !== "payment").map((rt) => (
            <button
              key={rt.type}
              type="button"
              className="group flex items-center gap-3 rounded-[1.5rem] border border-ink/5 bg-white p-4 text-left shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${ACCENT_ON[rt.color as AccentColor]}`}
              >
                <Icon name={rt.icon} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-700 text-ink">
                  {t(rt.titleKey)}
                </span>
                <span className="block text-xs font-600 text-ink/50">
                  {t(rt.descKey)}
                </span>
              </span>
              <Icon
                name="ArrowRight"
                className="h-4 w-4 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-brand"
              />
            </button>
          ))}
        </div>
      </section>
      ) : null}

      {/* Listado de trámites */}
      <section>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-700 transition-colors ${
                filter === f.id
                  ? "bg-ink text-white shadow-card"
                  : "bg-white text-ink/60 hover:text-ink"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-2.5">
          {requests.map((r) => {
            const typeMeta = REQUEST_TYPES.find((x) => x.type === r.type)!;
            const status = STATUS_META[r.status];
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-[1.5rem] border border-ink/5 bg-white p-4 shadow-card"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${ACCENT_ON[typeMeta.color as AccentColor]}`}
                >
                  <Icon name={typeMeta.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-700 text-ink">
                    {t(typeMeta.titleKey)} · {r.studentName}
                  </p>
                  <p className="truncate text-xs font-600 text-ink/55">
                    {r.summary}
                  </p>
                  <p className="mt-0.5 text-[11px] font-700 text-ink/40">
                    {r.group} · {r.createdAt}
                    {r.handledBy ? ` · ${t("req.handledBy")} ${r.handledBy}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-700 ${ACCENT_SOFT_BG[status.color]} ${ACCENT_TEXT[status.color]}`}
                >
                  <Icon name={status.icon} className="h-3.5 w-3.5" />
                  {t(status.key)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
