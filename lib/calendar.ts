import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import type { CalEvent } from "@/lib/domain";

interface CalRow {
  id: string;
  calendar_key: string;
  day: number;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  title: string;
  audience_label: string | null;
  kind: string;
  group_id: string | null;
  done: boolean;
}

/** Eventos + tareas del calendario visibles para el usuario (filtrados por rol). */
export async function getCalendar(): Promise<CalEvent[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("calendar_feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getCalendar] error, devuelvo []:", e);
    return [];
  }

  return (data as CalRow[]).map((r) => ({
    id: r.id,
    calendarId: r.calendar_key,
    day: r.day,
    allDay: r.all_day,
    time: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    title: r.title,
    audienceLabel: r.audience_label ?? "",
    kind: r.kind === "task" ? "task" : "event",
    groupId: r.group_id ?? undefined,
    done: r.done,
  }));
}

/** Cursos del usuario (hijos+salón para familias; salones asignados para docentes). */
export async function getMyCourses(): Promise<import("@/lib/domain").MyCourse[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("my_courses");
    if (error || !data) return [];
    return (data as { group_id: string; group_name: string; person_name: string | null }[])
      .map((r) => ({ groupId: r.group_id, groupName: r.group_name, personName: r.person_name }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName, "es"));
  } catch (e) {
    rethrowNextControl(e);
    return [];
  }
}
