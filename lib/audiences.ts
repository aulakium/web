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

/**
 * Opciones de "a quién va dirigido" un aviso, para el publicador.
 * El docente queda acotado a SUS salones asignados: no puede dirigirse al grado
 * o nivel completo, ni a "toda la comunidad", ni a roles globales.
 */
export async function getAudienceOptions(roleKey: RoleKey | null = null): Promise<AudienceOptions> {
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
        supabase.from("grades").select("id, name, position, level_id").order("position"),
        supabase.from("groups").select("id, name, position, grade_id").order("position"),
        supabase.from("roles").select("id, key"),
      ]);

    let lvl = (levels ?? []) as { id: string; name: string; level_id?: string }[];
    let grd = (grades ?? []) as { id: string; name: string; level_id: string | null }[];
    let grp = (groups ?? []) as { id: string; name: string; grade_id: string | null }[];
    const roleById = new Map((roles ?? []).map((r) => [r.key as string, r.id as string]));
    let community: AudienceOption | null = { value: `community:${cid}`, label: `Toda la comunidad (${short})` };
    let roleOpts: AudienceOption[] = AUDIENCE_ROLES.filter((k) => roleById.has(k)).map((k) => ({
      value: `role:${roleById.get(k)}`,
      label: ROLE_LABELS[k],
    }));

    // Docente: SOLO sus salones asignados. Sin grado/nivel (no puede dirigirse
    // a todo 6° ni a toda Primaria), sin comunidad ni roles globales.
    if (roleKey === "teacher") {
      const { data: gidsRaw } = await supabase.rpc("my_group_ids");
      const gids = new Set(
        ((gidsRaw as unknown[]) ?? []).map((x) =>
          typeof x === "string" ? x : (Object.values(x as object)[0] as string),
        ),
      );
      grp = grp.filter((g) => gids.has(g.id));
      grd = [];
      lvl = [];
      community = null;
      roleOpts = [];
    } else if (roleKey === "coordinator") {
      // Coordinación: su sección. Salones de su alcance + los grados y niveles
      // que los contienen. Sin "toda la comunidad" (no es admin total).
      const { data: gidsRaw } = await supabase.rpc("my_admin_group_ids");
      const gids = new Set(((gidsRaw as string[]) ?? []).map(String));
      grp = grp.filter((g) => gids.has(g.id));
      const gradeIds = new Set(grp.map((g) => g.grade_id).filter(Boolean) as string[]);
      grd = grd.filter((g) => gradeIds.has(g.id));
      const levelIds = new Set(grd.map((g) => g.level_id).filter(Boolean) as string[]);
      lvl = lvl.filter((l) => levelIds.has(l.id));
      community = null;
      roleOpts = []; // los destinos por rol son de todo el colegio → no para coordinación
    }

    return {
      community,
      levels: lvl.map((l) => ({ value: `level:${l.id}`, label: l.name })),
      grades: grd.map((g) => ({ value: `grade:${g.id}`, label: g.name })),
      groups: grp.map((g) => ({ value: `group:${g.id}`, label: g.name })),
      roles: roleOpts,
    };
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getAudienceOptions] error:", e);
    return empty;
  }
}
