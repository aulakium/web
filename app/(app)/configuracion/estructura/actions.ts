"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPreset } from "@/lib/school-presets";

type Supa = Awaited<ReturnType<typeof createClient>>;

async function myCommunity(supabase: Supa): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return (data?.community_id as string) ?? null;
}

function revalidate() {
  revalidatePath("/configuracion/estructura");
  revalidatePath("/configuracion");
}

/** Aplica una plantilla por país: crea niveles + grados (idempotente por nombre). */
export async function applyPreset(presetId: string) {
  const preset = getPreset(presetId);
  if (!preset) return;
  const supabase = await createClient();
  const community = await myCommunity(supabase);
  if (!community) return;

  // Año académico actual si no hay ninguno.
  const { data: year } = await supabase
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .limit(1)
    .maybeSingle();
  if (!year) {
    const y = new Date().getFullYear();
    await supabase.from("academic_years").insert({
      community_id: community,
      label: `Ciclo ${y}`,
      is_current: true,
    });
  }

  for (let i = 0; i < preset.levels.length; i++) {
    const lv = preset.levels[i];
    let levelId: string | undefined;
    const { data: existingLevel } = await supabase
      .from("levels")
      .select("id")
      .eq("community_id", community)
      .eq("name", lv.name)
      .maybeSingle();
    if (existingLevel) {
      levelId = existingLevel.id as string;
    } else {
      const { data: ins } = await supabase
        .from("levels")
        .insert({ community_id: community, name: lv.name, position: i })
        .select("id")
        .single();
      levelId = ins?.id as string | undefined;
    }
    if (!levelId) continue;

    for (let j = 0; j < lv.grades.length; j++) {
      const gname = lv.grades[j];
      const { data: existingGrade } = await supabase
        .from("grades")
        .select("id")
        .eq("community_id", community)
        .eq("level_id", levelId)
        .eq("name", gname)
        .maybeSingle();
      if (!existingGrade) {
        await supabase
          .from("grades")
          .insert({ community_id: community, level_id: levelId, name: gname, position: j });
      }
    }
  }
  revalidate();
}

export async function createLevel(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const supabase = await createClient();
  const community = await myCommunity(supabase);
  if (!community) return;
  const { count } = await supabase
    .from("levels")
    .select("id", { count: "exact", head: true })
    .eq("community_id", community);
  await supabase
    .from("levels")
    .insert({ community_id: community, name, position: count ?? 0 });
  revalidate();
}

export async function createGrade(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const levelId = String(formData.get("levelId") || "");
  if (!name || !levelId) return;
  const supabase = await createClient();
  const community = await myCommunity(supabase);
  if (!community) return;
  const { count } = await supabase
    .from("grades")
    .select("id", { count: "exact", head: true })
    .eq("level_id", levelId);
  await supabase
    .from("grades")
    .insert({ community_id: community, level_id: levelId, name, position: count ?? 0 });
  revalidate();
}

/** Crea un salón. Si no se da nombre, autonombra: <grado> + próxima letra (A, B, C…). */
export async function createGroup(formData: FormData) {
  const gradeId = String(formData.get("gradeId") || "");
  if (!gradeId) return;
  const supabase = await createClient();
  const community = await myCommunity(supabase);
  if (!community) return;

  const { data: grade } = await supabase.from("grades").select("name").eq("id", gradeId).maybeSingle();
  const { data: existing } = await supabase.from("groups").select("name").eq("grade_id", gradeId);
  const count = existing?.length ?? 0;
  let name = String(formData.get("name") || "").trim();
  if (!name) {
    // Primera letra libre (A, B, C…), evitando colisiones con salones ya creados.
    const used = new Set((existing ?? []).map((g) => String(g.name).slice(-1).toUpperCase()));
    let letter = "A";
    for (let i = 0; i < 26; i++) {
      const L = String.fromCharCode(65 + i);
      if (!used.has(L)) {
        letter = L;
        break;
      }
    }
    name = `${grade?.name ?? ""}${letter}`;
  }
  await supabase
    .from("groups")
    .insert({ community_id: community, grade_id: gradeId, name, type: "class", position: count });
  revalidate();
}

// ===== Borrados (bottom-up: bloquean si hay datos abajo) =====
export async function deleteGroup(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("student_enrollments")
    .select("student_id", { count: "exact", head: true })
    .eq("group_id", id);
  if ((count ?? 0) > 0) return; // hay alumnos inscriptos → no borrar
  await supabase.from("groups").delete().eq("id", id);
  revalidate();
}

export async function deleteGrade(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("groups")
    .select("id", { count: "exact", head: true })
    .eq("grade_id", id);
  if ((count ?? 0) > 0) return; // tiene salones → borrarlos primero
  await supabase.from("grades").delete().eq("id", id);
  revalidate();
}

export async function deleteLevel(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("grades")
    .select("id", { count: "exact", head: true })
    .eq("level_id", id);
  if ((count ?? 0) > 0) return; // tiene grados → borrarlos primero
  await supabase.from("levels").delete().eq("id", id);
  revalidate();
}
