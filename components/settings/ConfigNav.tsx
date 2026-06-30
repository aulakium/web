"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings/structure", label: "Estructura", enabled: true, adminOnly: false },
  { href: "/settings/people", label: "Personas", enabled: true, adminOnly: true },
  { href: "/settings/teachers", label: "Docentes", enabled: true, adminOnly: true },
  { href: "/settings/import", label: "Importar", enabled: true, adminOnly: true },
];

export function ConfigNav({ isAdmin = true }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => isAdmin || !t.adminOnly);
  return (
    <nav className="flex items-center gap-1.5 border-b border-ink/8">
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        if (!t.enabled) {
          return (
            <span
              key={t.href}
              title="Próximamente"
              className="cursor-not-allowed px-3 py-2.5 text-sm font-700 text-ink/25"
            >
              {t.label}
            </span>
          );
        }
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative px-3 py-2.5 text-sm font-700 transition-colors ${
              active ? "text-ink" : "text-ink/45 hover:text-ink"
            }`}
          >
            {t.label}
            {active ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
