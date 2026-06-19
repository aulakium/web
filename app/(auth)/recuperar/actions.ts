"use server";

import { sendPasswordReset } from "@/lib/invites";

export type ResetState = { sent: boolean };

export async function requestReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  // No revelamos si el correo existe o no: siempre confirmamos.
  if (email) await sendPasswordReset(email);
  return { sent: true };
}
