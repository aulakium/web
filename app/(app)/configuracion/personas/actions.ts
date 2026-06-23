"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvite } from "@/lib/invites";

type Supa = Awaited<ReturnType<typeof createClient>>;

const STAFF_ROLES = [
  "principal", "manager", "board", "department_head",
  "coordinator", "support_staff", "teacher", "service_inbox", "driver",
];

export type InviteState =
  | { ok?: boolean; emailed?: boolean; link?: string; error?: string }
  | null;

function pickOne<T>(rel: T | T[] | null | undefined): T | undefined {
  return Array.isArray(rel) ? rel[0] : (rel ?? undefined);
}

async function adminCtx(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("id, community_id, communities(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    membershipId: data.id as string,
    communityId: data.community_id as string,
    communityName:
      (pickOne(data.communities as { name: string } | { name: string }[])?.name) ?? "tu colegio",
  };
}

export async function inviteMember(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const roleKey = String(formData.get("roleKey") || "").trim();
  const groupId = String(formData.get("groupId") || "") || null;
  const studentId = String(formData.get("studentId") || "") || null;
  const relationship = String(formData.get("relationship") || "").trim() || null;
  if (!email || !roleKey) return { error: "Completa el correo y el rol." };

  const supabase = await createClient();
  const ctx = await adminCtx(supabase);
  if (!ctx) return { error: "No pudimos identificar tu colegio." };

  const isStaff = STAFF_ROLES.includes(roleKey);
  const { error } = await supabase.from("invitations").insert({
    community_id: ctx.communityId,
    email,
    full_name: fullName || null,
    role_key: roleKey,
    scope_type: groupId ? "group" : null,
    scope_id: groupId,
    student_id: roleKey === "guardian" ? studentId : null,
    relationship: roleKey === "guardian" ? relationship : null,
    staff_group_id: isStaff ? groupId : null,
    staff_assignment_role: isStaff && groupId ? "subject_teacher" : null,
    invited_by: ctx.membershipId,
  });
  if (error) return { error: "No se pudo crear la invitación (¿permisos?)." };

  const res = await sendInvite({ email, fullName, communityName: ctx.communityName });
  revalidatePath("/configuracion/personas");
  if (!res.ok) return { error: res.error ?? "No se pudo enviar la invitación." };
  return { ok: true, emailed: res.emailed, link: res.link };
}

export async function revokeInvitation(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("invitations").update({ status: "revoked" }).eq("id", id);
  revalidatePath("/configuracion/personas");
}

export async function resendInvitation(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const ctx = await adminCtx(supabase);
  const { data: inv } = await supabase
    .from("invitations")
    .select("email, full_name")
    .eq("id", id)
    .maybeSingle();
  if (inv && ctx) {
    await sendInvite({
      email: inv.email as string,
      fullName: (inv.full_name as string) ?? "",
      communityName: ctx.communityName,
    });
  }
  revalidatePath("/configuracion/personas");
}
