"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/identity";

/** Asigna un salón a un docente (idempotente). Solo admin (gate + RLS). */
export async function assignGroup(formData: FormData) {
  const membershipId = String(formData.get("membershipId") || "");
  const groupId = String(formData.get("groupId") || "");
  if (!membershipId || !groupId) return;
  await requireAdmin();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("staff_group_assignments")
    .select("membership_id")
    .eq("membership_id", membershipId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("staff_group_assignments")
      .insert({ membership_id: membershipId, group_id: groupId, role: "tutor" });
    if (error) console.error("[assignGroup] insert error:", error.message);
  }
  revalidatePath("/configuracion/docentes");
}

/** Quita un salón asignado a un docente. Solo admin (gate + RLS). */
export async function unassignGroup(formData: FormData) {
  const membershipId = String(formData.get("membershipId") || "");
  const groupId = String(formData.get("groupId") || "");
  if (!membershipId || !groupId) return;
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_group_assignments")
    .delete()
    .eq("membership_id", membershipId)
    .eq("group_id", groupId);
  if (error) console.error("[unassignGroup] delete error:", error.message);
  revalidatePath("/configuracion/docentes");
}
