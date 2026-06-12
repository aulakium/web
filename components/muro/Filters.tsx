"use client";

import { useState } from "react";
import { useLocale } from "../locale-context";

const FILTERS = [
  { key: "wall.filter.all", id: "all" },
  { key: "wall.filter.unread", id: "unread" },
  { key: "wall.filter.saved", id: "saved" },
];

export function Filters() {
  const { t } = useLocale();
  const [active, setActive] = useState("all");

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => setActive(f.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-800 transition-colors ${
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
