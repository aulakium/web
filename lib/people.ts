import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { ROLE_LABELS, type RoleKey } from "@/lib/domain";

export interface Person {
  name: string;
  roleKey: RoleKey | null;
  roleLabel: string;
}

interface PersonRow {
  name: string;
  role_key: string | null;
  role_kind: string | null;
}

/** Personas de la comunidad visibles para el usuario (según su rol). */
export async function getPeople(): Promise<Person[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("community_people");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getPeople] error, devuelvo []:", e);
    return [];
  }

  return (data as PersonRow[]).map((r) => {
    const key = (r.role_key ?? null) as RoleKey | null;
    return {
      name: r.name,
      roleKey: key,
      roleLabel: key ? ROLE_LABELS[key] : "Miembro",
    };
  });
}
