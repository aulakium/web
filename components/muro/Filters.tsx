"use client";

import { useLocale } from "../locale-context";

export type WallFilter = "all" | "unread" | "saved";

const FILTERS: { key: string; id: WallFilter }[] = [
  { key: "wall.filter.all", id: "all" },
  { key: "wall.filter.unread", id: "unread" },
  { key: "wall.filter.saved", id: "saved" },
];

export function Filters({
  active,
  onChange,
}: {
  active: WallFilter;
  onChange: (f: WallFilter) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-700 transition-colors ${
            active === f.id
              ? "bg-ink text-white shadow-card"
              : "bg-white text-ink/60 hover:text-ink"
          }`}
        >
          {t(f.key)}
        </button>
      ))}
    </div>
  );
}
