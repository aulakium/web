"use client";

import { Icon } from "../icons";
import { useLocale } from "../locale-context";
import { DEMO_CALENDARS } from "@/lib/domain";
import { ACCENT_DOT, type AccentColor } from "../colors";

export function CalendarsFilter({
  hidden,
  onToggle,
}: {
  hidden: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { t } = useLocale();

  return (
    <section className="rounded-[1.75rem] border border-ink/5 bg-white p-5 shadow-card">
      <h2 className="mb-3 font-display text-base font-800 text-ink">
        {t("cal.calendars")}
      </h2>
      <ul className="flex flex-col gap-1">
        {DEMO_CALENDARS.map((c) => {
          const isOn = !hidden.has(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onToggle(c.id)}
                aria-pressed={isOn}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-mist"
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-md transition-opacity ${
                    ACCENT_DOT[c.color as AccentColor]
                  } ${isOn ? "" : "opacity-25"}`}
                />
                <span
                  className={`flex-1 text-sm font-700 ${
                    isOn ? "text-ink" : "text-ink/40"
                  }`}
                >
                  {c.name}
                </span>
                <Icon
                  name={isOn ? "Check" : "Plus"}
                  className={`h-4 w-4 ${isOn ? "text-brand" : "text-ink/25"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
