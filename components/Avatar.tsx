import { AVATAR_BG, type AccentColor } from "./colors";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  color = "brand",
  size = "md",
  ring = false,
}: {
  name: string;
  color?: AccentColor;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl font-display font-700 text-white ${AVATAR_BG[color]} ${sizes[size]} ${
        ring ? "ring-2 ring-white/70 shadow-sm" : ""
      }`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
