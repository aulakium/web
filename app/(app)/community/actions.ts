"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MemberDetail {
  roleKey: string | null;
  groupIds: string[];
  subject: string | null;
}

/** Rol + salones + materia actuales de una persona (para precargar el editor). */
export async function getMemberDetail(membershipId: string): Promise<MemberDetail> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_member_detail", { p_membership: membershipId });
  const row = (data as { role_key: string | null; group_ids: string[] | null; subject: string | null }[])?.[0];
  return {
    roleKey: row?.role_key ?? null,
    groupIds: row?.group_ids ?? [],
    subject: row?.subject ?? null,
  };
}

/** Cambia el rol y (para docentes) los salones + materia. Gateado por admin en la base. */
export async function updateMember(
  membershipId: string,
  roleKey: string,
  groupIds: string[] | null,
  subject: string | null,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_member", {
    p_membership: membershipId,
    p_role_key: roleKey,
    p_group_ids: groupIds,
    p_subject: subject,
  });
  if (error) console.error("[updateMember] error:", error.message);
  revalidatePath("/community");
}

/** Baja lógica de una persona (no a sí mismo). Gateado por admin en la base. */
export async function removeMember(membershipId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_remove_member", { p_membership: membershipId });
  if (error) console.error("[removeMember] error:", error.message);
  revalidatePath("/community");
}
