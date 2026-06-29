"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CHILD_COOKIE } from "@/lib/child-filter";

/** Fija o limpia el filtro global "ver por hijo" (group_id del salón). */
export async function setChildFilter(groupId: string | null) {
  const c = await cookies();
  if (groupId) {
    c.set(CHILD_COOKIE, groupId, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  } else {
    c.delete(CHILD_COOKIE);
  }
  // Refresca toda la app (el filtro afecta Avisos, Calendario, Home, etc.).
  revalidatePath("/", "layout");
}
