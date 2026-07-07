import { Icon } from "@/components/icons";

/** Botón pill con círculo de flecha (estilo Autoguru). Compartido por la landing
 *  y las páginas de marketing. */
export function PillCTA({
  href,
  children,
  tone = "cta",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "cta" | "light" | "ink";
}) {
  const map = {
    cta: "bg-cta text-white hover:bg-cta-deep",
    light: "bg-white text-ink hover:bg-mist",
    ink: "bg-ink text-white hover:bg-navy-deep",
  } as const;
  const circle = { cta: "bg-white/20", light: "bg-ink text-white", ink: "bg-white/20" } as const;
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full py-2 pl-6 pr-2 text-sm font-700 shadow-soft transition-colors ${map[tone]}`}
    >
      {children}
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ${circle[tone]} transition-transform group-hover:translate-x-0.5`}
      >
        <Icon name="ArrowRight" className="h-4 w-4" />
      </span>
    </a>
  );
}
