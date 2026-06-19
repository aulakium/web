import Image from "next/image";
import { Icon } from "./icons";

/**
 * Ícono de marca: manzana blanca sobre un badge naranja. Reutilizable como
 * lockup junto al wordmark y como marca suelta (rail, topbar, app icon).
 */
export function BrandIcon({
  className = "h-10 w-10",
  iconClassName = "h-5 w-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffa424] to-[#f57c00] text-white shadow-soft ${className}`}
    >
      <Icon name="Apple" className={iconClassName} strokeWidth={2.6} />
    </span>
  );
}

/** Lockup de marca Colequium: manzana naranja + wordmark cursivo. */
export function Wordmark({
  theme = "light",
  className = "",
}: {
  theme?: "light" | "dark";
  className?: string;
}) {
  const src = theme === "dark" ? "/logo-colequium-white.webp" : "/logo-colequium.webp";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandIcon />
      <Image
        src={src}
        alt="Colequium"
        width={2554}
        height={638}
        priority
        className="h-9 w-auto"
      />
    </span>
  );
}
