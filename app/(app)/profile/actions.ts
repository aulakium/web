"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvite } from "@/lib/invites";

export type ProfileState = { ok?: boolean; error?: string } | null;

/** Edita el nombre completo del usuario. */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length < 2) return { error: "Ingresa tu nombre." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };
  const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar." };
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}

export type CoTutorState =
  | { ok?: boolean; emailed?: boolean; link?: string; count?: number; error?: string }
  | null;

/**
 * Un tutor invita a otra persona como tutor/a de uno o varios de SUS hijos.
 * La persona invitada hereda los permisos del que invita sobre cada hijo
 * (la validación de "solo mis hijos" la hace el RPC invite_cotutor).
 */
export async function inviteCoTutor(
  _prev: CoTutorState,
  formData: FormData,
): Promise<CoTutorState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const relationship = String(formData.get("relationship") || "").trim();
  const studentIds = formData.getAll("studentIds").map(String).filter(Boolean);

  if (!email) return { error: "Ingresa el correo de la persona." };
  if (studentIds.length === 0) return { error: "Elige al menos un hijo/a." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };

  const { data: count, error } = await supabase.rpc("invite_cotutor", {
    p_email: email,
    p_full_name: fullName || null,
    p_student_ids: studentIds,
    p_relationship: relationship || null,
  });
  if (error) return { error: "No se pudo crear la invitación." };
  if (!count || (count as number) === 0) {
    return { error: "Ya existe una invitación pendiente para ese correo." };
  }

  // Nombre del colegio para el correo.
  const { data: m } = await supabase
    .from("memberships")
    .select("communities(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const comm = m?.communities as { name: string } | { name: string }[] | null;
  const communityName =
    (Array.isArray(comm) ? comm[0]?.name : comm?.name) ?? "tu colegio";

  const res = await sendInvite({ email, fullName, communityName });
  revalidatePath("/profile");
  if (!res.ok) return { error: res.error ?? "No se pudo enviar la invitación." };
  return { ok: true, emailed: res.emailed, link: res.link, count: count as number };
}

/** Guarda el idioma preferido del usuario. */
export async function setUiLocale(formData: FormData) {
  const locale = String(formData.get("locale") || "");
  if (!locale) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("users").update({ ui_locale: locale }).eq("id", user.id);
  revalidatePath("/", "layout");
}
