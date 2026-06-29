"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPeople, personSubtitle } from "@/lib/people";
import { ROLE_COLOR } from "@/lib/posts";
import type { RoleKey } from "@/lib/domain";

type Supa = Awaited<ReturnType<typeof createClient>>;

async function myMembership(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return data as { id: string } | null;
}

export interface Recipient {
  id: string;
  name: string;
  subtitle: string;
  color: string;
}
export interface RecipientGroup {
  title: string;
  people: Recipient[];
}

/** Categorías del selector "¿a quién le escribo?", en orden de jerarquía. */
const GROUPS: { title: string; roles: RoleKey[] }[] = [
  { title: "Dirección y coordinación", roles: ["board", "manager", "principal", "department_head", "coordinator"] },
  { title: "Docentes", roles: ["teacher"] },
  { title: "Administración y servicios", roles: ["support_staff", "service_inbox"] },
  { title: "Familias", roles: ["guardian"] },
  { title: "Transporte", roles: ["driver"] },
];

/** Personas a las que puedo escribir, agrupadas por categoría (con subtítulo). */
export async function getRecipients(): Promise<RecipientGroup[]> {
  const people = (await getPeople()).filter((p) => p.membershipId);
  return GROUPS.map((g) => ({
    title: g.title,
    people: people
      .filter((p) => p.roleKey && g.roles.includes(p.roleKey))
      .map((p) => ({
        id: p.membershipId as string,
        name: p.name,
        subtitle: personSubtitle(p),
        color: (p.roleKey ? ROLE_COLOR[p.roleKey] ?? "brand" : "brand") as string,
      })),
  })).filter((g) => g.people.length > 0);
}

export type StartState = { error?: string; conversationId?: string } | null;

/** Inicia una conversación con un destinatario (vía RPC, valida comunidad). */
export async function startConversation(
  _prev: StartState,
  formData: FormData,
): Promise<StartState> {
  const targetId = String(formData.get("targetId") || "");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const label = String(formData.get("label") || "").trim();
  if (!targetId) return { error: "Elige a quién quieres escribir." };
  if (!body) return { error: "Escribe tu mensaje." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_conversation", {
    p_targets: [targetId],
    p_subject: subject || null,
    p_label: label || null,
    p_body: body,
  });
  if (error) return { error: "No se pudo iniciar la conversación." };

  revalidatePath("/messages");
  return { conversationId: data as string };
}

/** Archiva o reactiva una conversación (la mueve a/desde "Archivados"). */
export async function archiveConversation(conversationId: string, archived: boolean) {
  if (!conversationId) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_conversation_status", {
    p_conv: conversationId,
    p_status: archived ? "closed" : "open",
  });
  if (error) console.error("[archiveConversation] rpc error:", error.message);
  revalidatePath("/messages");
}

/** Responde en una conversación existente. */
export async function sendMessage(conversationId: string, body: string) {
  const text = body.trim();
  if (!conversationId || !text) return;
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) {
    console.error("[sendMessage] sin membresía");
    return;
  }
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_membership_id: m.id, body: text });
  if (error) console.error("[sendMessage] insert error:", error.message);
  revalidatePath("/messages");
}

/** Marca como leídos los mensajes de una conversación (limpia el puntito de la nav). */
export async function markConversationRead(conversationId: string) {
  if (!conversationId) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation: conversationId,
  });
  if (error) console.error("[markConversationRead] rpc error:", error.message);
  // Revalida el layout para refrescar el contador del shell (rail + bottom-nav).
  revalidatePath("/", "layout");
}
