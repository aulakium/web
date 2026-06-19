"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { ok?: boolean; error?: string } | null;

/** Edita el nombre completo del usuario. */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length < 2) return { error: "Ingresá tu nombre." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No pudimos identificar tu cuenta." };
  const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar." };
  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
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
