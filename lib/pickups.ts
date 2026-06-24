import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";

export type PickupKind = "permanent" | "temporary";
export interface Pickup {
  name: string;
  relationship: string; // etiqueta lista para mostrar (Mamá, Abuelo…)
  kind: PickupKind;
}
export interface SalidaStudent {
  name: string;
  group: string;
  absentToday: boolean;
  pickups: Pickup[];
}

const REL_LABEL: Record<string, string> = {
  madre: "Mamá",
  padre: "Papá",
  tutor: "Tutor/a",
  abuela: "Abuela",
  abuelo: "Abuelo",
  tia: "Tía",
  tio: "Tío",
};
function relLabel(r: string | null): string {
  if (!r) return "Adulto responsable";
  return REL_LABEL[r.toLowerCase()] ?? r;
}

// Overlay DEMO (hasta tener modelo de asistencia + autorización temporal):
// una autorización temporal y una inasistencia, sobre alumnos reales.
const DEMO_TEMPORARY: Record<string, Pickup[]> = {
  "Tomás Méndez": [{ name: "Jorge Méndez", relationship: "Abuelo", kind: "temporary" }],
};
const DEMO_ABSENT = new Set<string>(["Lucía Fernández"]);

/** Alumnos en el alcance del usuario con sus autorizados para retirar. */
export async function getSalidas(): Promise<SalidaStudent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("salidas_feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getSalidas] error, devuelvo []:", e);
    return [];
  }

  return (data as {
    student_name: string;
    group_name: string;
    pickups: { name: string | null; relationship: string | null }[] | null;
  }[]).map((s) => {
    const permanent: Pickup[] = (s.pickups ?? []).map((p) => ({
      name: p.name ?? "—",
      relationship: relLabel(p.relationship),
      kind: "permanent" as const,
    }));
    const temporary = DEMO_TEMPORARY[s.student_name] ?? [];
    return {
      name: s.student_name,
      group: s.group_name,
      absentToday: DEMO_ABSENT.has(s.student_name),
      pickups: [...permanent, ...temporary],
    } satisfies SalidaStudent;
  });
}
