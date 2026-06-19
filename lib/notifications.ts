"use server";

import { createClient } from "@/lib/supabase/server";

export interface NotificationItem {
  id: string;
  kind: "post" | "event";
  title: string;
  subtitle: string;
  href: string;
}
export interface NotificationsResult {
  items: NotificationItem[];
  unread: number;
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Notificaciones del usuario: avisos sin leer + próximos eventos. */
export async function getNotifications(): Promise<NotificationsResult> {
  const empty = { items: [], unread: 0 };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return empty;
  }
  try {
    const supabase = await createClient();
    const [{ data: feed }, { data: cal }] = await Promise.all([
      supabase.rpc("feed"),
      supabase.rpc("calendar_feed"),
    ]);

    const unreadPosts = (feed ?? []).filter((p: { unread: boolean }) => p.unread);
    const postItems: NotificationItem[] = unreadPosts.slice(0, 8).map((p: {
      id: string; title: string | null; author_name: string | null; audience_label: string | null;
    }) => ({
      id: `post:${p.id}`,
      kind: "post",
      title: p.title || "Nuevo aviso",
      subtitle: `${p.author_name ?? "Colegio"} · ${p.audience_label ?? ""}`.trim(),
      href: "/muro",
    }));

    // Próximos eventos del mes demo (junio 2026): día >= 19.
    const events = (cal ?? [])
      .filter((e: { kind: string; day: number }) => e.kind === "event" && e.day >= 19)
      .sort((a: { day: number }, b: { day: number }) => a.day - b.day)
      .slice(0, 4);
    const eventItems: NotificationItem[] = events.map((e: {
      id: string; day: number; title: string; audience_label: string | null;
    }) => ({
      id: `event:${e.id}`,
      kind: "event",
      title: e.title,
      subtitle: `${e.day} ${MONTHS[5]} · ${e.audience_label ?? ""}`.trim(),
      href: "/calendario",
    }));

    return { items: [...postItems, ...eventItems], unread: unreadPosts.length };
  } catch (e) {
    console.error("[getNotifications] error:", e);
    return empty;
  }
}

/** Marca todos los avisos visibles como leídos. */
export async function markAllRead() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (!m) return;
    const { data: feed } = await supabase.rpc("feed");
    const unread = (feed ?? []).filter((p: { unread: boolean }) => p.unread);
    if (unread.length === 0) return;
    await supabase
      .from("post_reads")
      .upsert(
        unread.map((p: { id: string }) => ({ post_id: p.id, membership_id: m.id })),
        { onConflict: "post_id,membership_id", ignoreDuplicates: true },
      );
  } catch (e) {
    console.error("[markAllRead] error:", e);
  }
}
