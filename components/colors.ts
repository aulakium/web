/**
 * Mapas de color → clases Tailwind LITERALES.
 * Tailwind v4 escanea el código por tokens de clase; por eso NO podemos construir
 * clases dinámicas (`bg-${x}`). Estos mapas garantizan que cada clase exista en el bundle.
 *
 * SISTEMA: navy + blanco = estructura. 6 categorías = ícono fijo + UNA tonalidad
 * (misma en todos lados). El ícono identifica; el color refuerza.
 *   Novedades=news · Trámites=requests · Documentos=docs ·
 *   Calendario=brand · Mensajes=sky · Transporte=transport
 */

export type AccentColor =
  | "navy"
  | "ink"
  | "brand" // Calendario / acento primario
  | "sky" // Mensajes
  | "news" // Novedades
  | "requests" // Trámites
  | "docs" // Documentos
  | "transport"; // Transporte (celeste claro)

export const AVATAR_BG: Record<AccentColor, string> = {
  navy: "bg-navy",
  ink: "bg-ink",
  brand: "bg-brand",
  sky: "bg-sky",
  news: "bg-news",
  requests: "bg-requests",
  docs: "bg-docs",
  transport: "bg-transport",
};

export const ACCENT_TEXT: Record<AccentColor, string> = {
  navy: "text-navy",
  ink: "text-ink",
  brand: "text-brand",
  sky: "text-sky",
  news: "text-news",
  requests: "text-requests",
  docs: "text-requests", // docs es muy claro como texto → usa el naranja oscuro
  transport: "text-ink", // celeste claro ilegible como texto → navy
};

export const ACCENT_SOFT_BG: Record<AccentColor, string> = {
  navy: "bg-navy/10",
  ink: "bg-ink/10",
  brand: "bg-brand/15",
  sky: "bg-sky/25",
  news: "bg-news/15",
  requests: "bg-requests/15",
  docs: "bg-docs/20",
  transport: "bg-transport/50",
};

/** Tile sólido + ícono legible (claros llevan ícono navy). */
export const ACCENT_ON: Record<AccentColor, string> = {
  navy: "bg-navy text-white",
  ink: "bg-ink text-white",
  brand: "bg-brand text-white",
  sky: "bg-sky text-white",
  news: "bg-news text-white",
  requests: "bg-requests text-white",
  docs: "bg-docs text-white",
  transport: "bg-transport text-ink",
};

/** Punto sólido (dots del calendario, swatch del sub-calendario). */
export const ACCENT_DOT: Record<AccentColor, string> = {
  navy: "bg-navy",
  ink: "bg-ink",
  brand: "bg-brand",
  sky: "bg-sky",
  news: "bg-news",
  requests: "bg-requests",
  docs: "bg-docs",
  transport: "bg-transport",
};

/** Borde izquierdo de color (píldoras de evento en la agenda). */
export const ACCENT_BORDER_L: Record<AccentColor, string> = {
  navy: "border-l-navy",
  ink: "border-l-ink",
  brand: "border-l-brand",
  sky: "border-l-sky",
  news: "border-l-news",
  requests: "border-l-requests",
  docs: "border-l-docs",
  transport: "border-l-transport",
};
