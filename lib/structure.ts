import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";

export interface StructureGroup {
  id: string;
  name: string;
  enrolled: number;
}
export interface StructureGrade {
  id: string;
  name: string;
  groups: StructureGroup[];
}
export interface StructureLevel {
  id: string;
  name: string;
  grades: StructureGrade[];
}
export interface Structure {
  levels: StructureLevel[];
  academicYear: string | null;
  totalGroups: number;
}

/** Primer número dentro del nombre ("1°"→1, "10°"→10, "1° Sec"→1). Los grados sin
 *  número van al final. Sirve para ordenar por número y no por orden de creación. */
function gradeNum(name: string): number {
  const m = name.match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.POSITIVE_INFINITY;
}

/** Árbol de estructura académica (niveles → grados → salones) de la comunidad. */
export async function getStructure(): Promise<Structure> {
  const empty: Structure = { levels: [], academicYear: null, totalGroups: 0 };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return empty;
  }
  try {
    const supabase = await createClient();
    const [{ data: levels }, { data: grades }, { data: groups }, { data: year }, { data: enroll }] =
      await Promise.all([
        supabase.from("levels").select("id, name, position").order("position"),
        supabase.from("grades").select("id, name, level_id, position").order("position"),
        supabase.from("groups").select("id, name, grade_id, position").order("position"),
        supabase
          .from("academic_years")
          .select("label")
          .eq("is_current", true)
          .limit(1)
          .maybeSingle(),
        supabase.from("student_enrollments").select("group_id"),
      ]);
    if (!levels || !grades || !groups) return empty;

    const enrolledByGroup = new Map<string, number>();
    for (const e of enroll ?? []) {
      const gid = e.group_id as string;
      enrolledByGroup.set(gid, (enrolledByGroup.get(gid) ?? 0) + 1);
    }

    const builtLevels = levels.map((lv) => ({
      id: lv.id as string,
      name: lv.name as string,
      grades: grades
        .filter((g) => g.level_id === lv.id)
        // Siempre por número (1°, 2°… 10°, 11°), no por orden de creación.
        .sort(
          (a, b) =>
            gradeNum(a.name as string) - gradeNum(b.name as string) ||
            (a.name as string).localeCompare(b.name as string, "es", { numeric: true }),
        )
        .map((g) => ({
          id: g.id as string,
          name: g.name as string,
          groups: groups
            .filter((gr) => gr.grade_id === g.id)
            // Salones por nombre natural (1°A, 1°B…).
            .sort((a, b) =>
              (a.name as string).localeCompare(b.name as string, "es", { numeric: true }),
            )
            .map((gr) => ({
              id: gr.id as string,
              name: gr.name as string,
              enrolled: enrolledByGroup.get(gr.id as string) ?? 0,
            })),
        })),
    }));

    return {
      levels: builtLevels,
      academicYear: (year?.label as string) ?? null,
      totalGroups: groups.length,
    };
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getStructure] error:", e);
    return empty;
  }
}
