import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import {
  ROLE_LABELS,
  type Post,
  type RoleKey,
  type AudienceTarget,
} from "@/lib/domain";
import type { AccentColor } from "@/components/colors";

interface FeedRow {
  id: string;
  title: string | null;
  body: string | null;
  type: string;
  published_at: string | null;
  author_name: string | null;
  author_role: string | null;
  audience_target: string | null;
  audience_label: string | null;
  likes: number;
  comments: number;
  liked: boolean;
  unread: boolean;
  bookmarked: boolean;
}

export const ROLE_COLOR: Record<string, AccentColor> = {
  board: "navy",
  manager: "navy",
  principal: "navy",
  department_head: "sky",
  coordinator: "sky",
  support_staff: "requests",
  teacher: "brand",
  service_inbox: "requests",
  guardian: "news",
  student: "sky",
  driver: "transport",
};

const COVER: Record<string, { cover: string; icon: Post["coverIcon"] }> = {
  community: { cover: "from-brand to-brand-soft", icon: "megaphone" },
  level: { cover: "from-brand to-sky", icon: "trophy" },
  grade: { cover: "from-brand to-sky", icon: "trophy" },
  group: { cover: "from-brand to-sky", icon: "image" },
  role: { cover: "from-sky to-brand", icon: "bus" },
  user: { cover: "from-brand to-sky", icon: "megaphone" },
};

/** Etiqueta relativa simple en español (Hace X / Ayer / fecha). */
function relativeLabel(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "Recién";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "Ayer";
  if (d < 7) return `Hace ${d} días`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function audienceLabel(target: string | null, raw: string | null): string {
  if (target === "role" && raw && raw in ROLE_LABELS) {
    return ROLE_LABELS[raw as RoleKey];
  }
  return raw ?? "";
}

/** Muro del usuario logueado (ya filtrado por audiencia/rol en la DB). */
export async function getFeed(): Promise<Post[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []; // sin env → muro vacío en vez de romper
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getFeed] error, devuelvo []:", e);
    return [];
  }

  return (data as FeedRow[]).map((r) => {
    const target = (r.audience_target ?? "community") as AudienceTarget;
    const look = COVER[target] ?? COVER.community;
    return {
      id: r.id,
      author: {
        name: r.author_name ?? "Colegio",
        role: (r.author_role ?? "support_staff") as RoleKey,
        color: ROLE_COLOR[r.author_role ?? "support_staff"] ?? "brand",
      },
      audience: { target, label: audienceLabel(r.audience_target, r.audience_label) },
      publishedAt: relativeLabel(r.published_at),
      title: r.title ?? "",
      body: r.body ?? "",
      cover: look.cover,
      coverIcon: look.icon,
      kind: r.type === "poll" ? "poll" : "announcement",
      likes: r.likes,
      comments: r.comments,
      liked: r.liked,
      bookmarked: r.bookmarked,
      unread: r.unread,
    } satisfies Post;
  });
}
