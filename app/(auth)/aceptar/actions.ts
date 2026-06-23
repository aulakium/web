"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AceptarState = { error?: string } | null;

export async function setPassword(
  _prev: AceptarState,
  formData: FormData,
): Promise<AceptarState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "El enlace expiró o ya se usó. Pedile al colegio una nueva invitación." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos guardar la contraseña. Inténtalo de nuevo." };

  // Materializa membresía + rol + vínculos de las invitaciones pendientes.
  await supabase.rpc("claim_invitations");

  redirect("/inicio");
}
