import { Icon } from "./icons";

/** Lockup de marca Colequium (la marca del producto, para superficies sin sesión). */
export function Wordmark({
  theme = "light",
  className = "",
}: {
  theme?: "light" | "dark";
  className?: string;
}) {
  const text = theme === "dark" ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-sky text-white shadow-soft">
        <Icon name="Sparkles" className="h-5 w-5" />
      </span>
      <span className={`font-display text-xl font-800 tracking-tight ${text}`}>
        Colequium
      </span>
    </span>
  );
}
