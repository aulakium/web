"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvite } from "@/lib/invites";

type Supa = Awaited<ReturnType<typeof createClient>>;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type StudentState = { ok?: boolean; emailed?: boolean; error?: string } | null;

async function ctx(supabase: Supa) {
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
  const communities = data.communities as { name: string } | { name: string }[] | null;
  return {
    membershipId: data.id as string,
    communityId: data.community_id as string,
    communityName: (Array.isArray(communities) ? communities[0]?.name : communities?.name) ?? "tu colegio",
  };
}

/** Alta manual de un alumno (+ inscripción a un salón + opcional: invitar tutor). */
export async function createStudent(_prev: StudentState, formData: FormData): Promise<StudentState> {
  const name = String(formData.get("name") || "").trim();
  const groupId = String(formData.get("groupId") || "") || null;
  const tutorName = String(formData.get("tutorName") || "").trim();
  const tutorEmail = String(formData.get("tutorEmail") || "").trim().toLowerCase();
  const tutorRel = String(formData.get("tutorRel") || "").trim() || null;
  if (!name) return { error: "Falta el nombre del alumno." };
  if (tutorEmail && !EMAIL_RE.test(tutorEmail)) return { error: "El correo del tutor no es válido." };

  const supabase = await createClient();
  const c = await ctx(supabase);
  if (!c) return { error: "No pudimos identificar tu colegio." };

  // Año académico actual (crear si falta).
  let { data: year } = await supabase
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  if (!year) {
    const ins = await supabase
      .from("academic_years")
      .insert({ community_id: c.communityId, label: `Ciclo ${new Date().getFullYear()}`, is_current: true })
      .select("id")
      .single();
    year = ins.data;
  }
  const yearId = year?.id as string | undefined;

  // Alumno (dedup por nombre dentro de la comunidad).
  let studentId: string | undefined;
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("community_id", c.communityId)
    .eq("full_name", name)
    .maybeSingle();
  if (existing) studentId = existing.id as string;
  else {
    const ins = await supabase
      .from("students")
      .insert({ community_id: c.communityId, full_name: name })
      .select("id")
      .single();
    studentId = ins.data?.id as string | undefined;
  }
  if (!studentId) return { error: "No se pudo crear el alumno (¿permisos?)." };

  // Inscripción al salón.
  if (yearId && groupId) {
    await supabase
      .from("student_enrollments")
      .upsert(
        { student_id: studentId, group_id: groupId, academic_year_id: yearId },
        { onConflict: "student_id,academic_year_id", ignoreDuplicates: true },
      );
  }

  // Invitación al tutor (opcional).
  let emailed = false;
  if (tutorEmail) {
    const { data: dup } = await supabase
      .from("invitations")
      .select("id")
      .eq("community_id", c.communityId)
      .eq("email", tutorEmail)
      .eq("student_id", studentId)
      .eq("status", "pending")
      .maybeSingle();
    if (!dup) {
      await supabase.from("invitations").insert({
        community_id: c.communityId,
        email: tutorEmail,
        full_name: tutorName || null,
        role_key: "guardian",
        student_id: studentId,
        relationship: tutorRel,
        can_pickup: true,
        can_report_absence: true,
        invited_by: c.membershipId,
      });
      const res = await sendInvite({ email: tutorEmail, fullName: tutorName, communityName: c.communityName });
      emailed = res.ok && !!res.emailed;
    }
  }

  revalidatePath("/settings/families");
  return { ok: true, emailed };
}

/** Baja de un alumno (con sus inscripciones y vínculos). */
export async function deleteStudent(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("student_enrollments").delete().eq("student_id", id);
  await supabase.from("guardianships").delete().eq("student_id", id);
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/settings/families");
}
