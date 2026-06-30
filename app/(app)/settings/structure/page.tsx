import { getStructure } from "@/lib/structure";
import { SCHOOL_PRESETS } from "@/lib/school-presets";
import { StructureManager } from "@/components/settings/StructureManager";
import { getIdentity } from "@/lib/identity";
import { createClient } from "@/lib/supabase/server";

export default async function EstructuraPage() {
  const me = await getIdentity();
  const structure = await getStructure();
  const canManageLevels = me?.isAdmin ?? false;

  // La coordinación ve y gestiona SOLO la estructura de su(s) nivel(es).
  let levels = structure.levels;
  if (!canManageLevels) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("my_struct_level_ids");
    const ids = new Set(
      ((data as unknown[]) ?? []).map((x) =>
        typeof x === "string" ? x : (Object.values(x as object)[0] as string),
      ),
    );
    levels = levels.filter((l) => ids.has(l.id));
  }

  return (
    <StructureManager
      structure={{ ...structure, levels }}
      presets={SCHOOL_PRESETS}
      canManageLevels={canManageLevels}
    />
  );
}
