import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";

export interface AudienceOption {
  value: string; // "type:id"
  label: string;
}
export interface AudienceOptions {
  community: AudienceOption | null;
  levels: AudienceOption[];
  grades: AudienceOption[];
  groups: AudienceOption[];
  roles: AudienceOption[];
}

/** Roles que tiene sentido elegir como audiencia de un aviso. */
const AUDIENCE_ROLES: RoleKey[] = ["guardian", "teacher", "student", "driver"];

/** Opciones de "a quién va dirigido" un aviso, para el publicador. */
export async function getAudienceOptions(): Promise<AudienceOptions> {
  const empty: AudienceOptions = { community: null, levels: [], grades: [], groups: [], roles: [] };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return empty;
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;
    const { data: m } = await supabase
      .from("memberships")
      .select("community_id, communities(short_name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (!m) return empty;
    const cid = m.community_id as string;
    const communities = m.communities as { short_name: string } | { short_name: string }[] | null;
    const short = (Array.isArray(communities) ? communities[0]?.short_name : communities?.short_name) ?? "el colegio";

    const [{ data: levels }, { data: grades }, { data: groups }, { data: roles }] =
      await Promise.all([
        supabase.from("levels").select("id, name, position").order("position"),
        supabase.from("grades").select("id, name, position").order("position"),
        supabase.from("groups").select("id, name, position").order("position"),
        supabase.from("roles").select("id, key"),
      ]);

    const roleById = new Map((roles ?? []).map((r) => [r.key as string, r.id as string]));

    return {
      community: { value: `community:${cid}`, label: `Toda la comunidad (${short})` },
      levels: (levels ?? []).map((l) => ({ value: `level:${l.id}`, label: l.name as string })),
      grades: (grades ?? []).map((g) => ({ value: `grade:${g.id}`, label: g.name as string })),
      groups: (groups ?? []).map((g) => ({ value: `group:${g.id}`, label: g.name as string })),
      roles: AUDIENCE_ROLES.filter((k) => roleById.has(k)).map((k) => ({
        value: `role:${roleById.get(k)}`,
        label: ROLE_LABELS[k],
      })),
    };
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getAudienceOptions] error:", e);
    return empty;
  }
}
