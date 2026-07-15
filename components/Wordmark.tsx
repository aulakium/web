import Image from "next/image";
import Link from "next/link";

/**
 * Ícono de marca: la manzana de Aulakium (mismo asset que el ícono de la app).
 * Reutilizable como lockup junto al wordmark y como marca suelta (rail, topbar).
 * `iconClassName` se mantiene por compatibilidad con llamadas previas (ignorado).
 */
export function BrandIcon({
  className = "h-10 w-10",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <Image
      src="/brand-mark.png"
      alt=""
      width={96}
      height={96}
      priority
      className={`shrink-0 rounded-2xl shadow-soft ${className}`}
    />
  );
}

/** Lockup de marca Aulakium: manzana naranja + wordmark cursivo. Si se pasa
 *  `href`, todo el lockup es un link (ej. volver al inicio desde el login). */
export function Wordmark({
  theme = "light",
  className = "",
  href,
}: {
  theme?: "light" | "dark";
  className?: string;
  href?: string;
}) {
  const src = theme === "dark" ? "/logo-aulakium-white.webp" : "/logo-aulakium.webp";
  const content = (
    <>
      <BrandIcon />
      <Image
        src={src}
        alt="Aulakium"
        width={2554}
        height={638}
        priority
        className="h-9 w-auto"
      />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Aulakium — ir al inicio"
        className={`inline-flex items-center gap-2.5 ${className}`}
      >
        {content}
      </Link>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>{content}</span>
  );
}
