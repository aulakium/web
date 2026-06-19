import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";

/** Roles que pueden administrar el colegio (estructura + invitaciones). */
export const ADMIN_ROLES: RoleKey[] = ["principal", "manager", "board"];

/** Identidad del usuario logueado, resuelta desde Supabase (perfil + rol + colegio). */
export interface Identity {
  name: string;
  firstName: string;
  email: string;
  roleKey: RoleKey | null;
  roleLabel: string;
  schoolName: string;
  schoolShort: string;
  isAdmin: boolean;
  isStudent: boolean;
  uiLocale: string | null;
}

/** PostgREST a veces embebe la relación como objeto y a veces como array. */
function one<T>(rel: T | T[] | null | undefined): T | undefined {
  return Array.isArray(rel) ? rel[0] : (rel ?? undefined);
}

/** Resuelve la identidad del usuario actual. `null` si no hay sesión. */
export async function getIdentity(): Promise<Identity | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null; // sin env → modo demo (fallback al mock)
  }
  try {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, ui_locale")
    .eq("id", user.id)
    .maybeSingle();

  let { data: membership } = await supabase
    .from("memberships")
    .select("id, communities(name, short_name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  // Sin comunidad pero con sesión: puede haber invitaciones pendientes sin reclamar.
  if (!membership) {
    await supabase.rpc("claim_invitations");
    const reload = await supabase
      .from("memberships")
      .select("id, communities(name, short_name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    membership = reload.data;
  }

  let roleKey: RoleKey | null = null;
  if (membership?.id) {
    const { data: mr } = await supabase
      .from("membership_roles")
      .select("roles(key)")
      .eq("membership_id", membership.id)
      .limit(1)
      .maybeSingle();
    const role = one(mr?.roles as { key: string } | { key: string }[] | null);
    roleKey = (role?.key ?? null) as RoleKey | null;
  }

  const name = profile?.full_name ?? user.email!.split("@")[0];
  const community = one(
    membership?.communities as
      | { name: string; short_name: string }
      | { name: string; short_name: string }[]
      | null,
  );

  return {
    name,
    firstName: name.split(" ")[0],
    email: profile?.email ?? user.email!,
    roleKey,
    roleLabel: roleKey ? ROLE_LABELS[roleKey] : "",
    schoolName: community?.name ?? "Colegio",
    schoolShort: community?.short_name ?? "Colegio",
    isAdmin: !!roleKey && ADMIN_ROLES.includes(roleKey),
    isStudent: roleKey === "student",
    uiLocale: (profile?.ui_locale as string) ?? null,
  };
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getIdentity] error, devuelvo null (modo demo):", e);
    return null;
  }
}

/** Exige rol de administrador del colegio; si no, redirige. Para layouts/páginas server. */
export async function requireAdmin(): Promise<Identity> {
  const me = await getIdentity();
  if (!me) redirect("/login");
  if (!me.isAdmin) redirect("/inicio");
  return me;
}

/** Bloquea a los alumnos de las secciones que no les corresponden. */
export async function blockStudents() {
  const me = await getIdentity();
  if (me?.isStudent) redirect("/inicio");
}
