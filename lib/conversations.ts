import { createClient } from "@/lib/supabase/server";
import { ROLE_COLOR } from "@/lib/posts";
import type { Conversation, Author, ChatMessage, RoleKey } from "@/lib/domain";

interface ConvRow {
  id: string;
  subject: string | null;
  status: string;
  scope_label: string | null;
  participants: { name: string; role: string }[] | null;
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("conversations_feed");
  if (error || !data) return [];

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
      participants: (c.participants ?? []).map((p) => author(p.name, p.role)),
      labels: (c.labels ?? []).filter((l) => l !== scope),
      status: (c.status === "closed" ? "closed" : "open") as Conversation["status"],
      preview: last?.body ?? "",
      lastAt: last?.at?.split(" ")[1] ?? last?.at ?? "",
      unread: c.unread,
      messages,
    } satisfies Conversation;
  });
}
