import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { ROLE_COLOR } from "@/lib/posts";
import type { Conversation, Author, ChatMessage, RoleKey } from "@/lib/domain";

interface ConvRow {
  id: string;
  subject: string | null;
  status: string;
  scope_label: string | null;
  participants: { name: string; role: string; is_me?: boolean }[] | null;
  labels: string[] | null;
  messages: {
    id: string;
    body: string;
    at: string;
    sender: string | null;
    senderRole: string | null;
    mine: boolean;
  }[] | null;
  unread: number;
}

function author(name: string | null, role: string | null): Author {
  const key = (role ?? "support_staff") as RoleKey;
  return { name: name ?? "—", role: key, color: ROLE_COLOR[key] ?? "brand" };
}

/** Conversaciones del usuario (sólo aquellas en las que participa). */
export async function getConversations(): Promise<Conversation[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("conversations_feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getConversations] error, devuelvo []:", e);
    return [];
  }

  return (data as ConvRow[]).map((c) => {
    const messages: ChatMessage[] = (c.messages ?? []).map((m) => ({
      id: m.id,
      sender: author(m.sender, m.senderRole),
      body: m.body,
      at: m.at,
      mine: m.mine,
    }));
    const last = messages[messages.length - 1];
    const scope = c.scope_label ?? "General";
    return {
      id: c.id,
      subject: c.subject ?? "(sin asunto)",
      scopeLabel: scope,
      participants: (c.participants ?? []).map((p) => ({
        ...author(p.name, p.role),
        isMe: p.is_me ?? false,
      })),
      labels: (c.labels ?? []).filter((l) => l !== scope),
      status: (c.status === "closed" ? "closed" : "open") as Conversation["status"],
      preview: last?.body ?? "",
      lastAt: last?.at?.split(" ")[1] ?? last?.at ?? "",
      unread: c.unread,
      messages,
    } satisfies Conversation;
  });
}

/** Total de mensajes sin leer (para el puntito en la navegación de Mensajes). */
export async function getUnreadMessageCount(): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return 0;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("unread_messages_count");
    if (error || data == null) return 0;
    return Number(data) || 0;
  } catch (e) {
    rethrowNextControl(e);
    return 0;
  }
}
