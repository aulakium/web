import "server-only";
import { cookies } from "next/headers";
import { getMyCourses } from "@/lib/calendar";
import type { MyCourse } from "@/lib/domain";

export const CHILD_COOKIE = "cq_child";

/** group_id del hijo activo en el filtro global (o null = ver todo). */
export async function getActiveChildGroup(): Promise<string | null> {
  const c = await cookies();
  return c.get(CHILD_COOKIE)?.value || null;
}

/** Cursos del usuario + cuál está filtrado. Útil para familias con 2+ hijos. */
export async function getChildFilter(): Promise<{
  courses: MyCourse[];
  active: MyCourse | null;
}> {
  const [courses, activeId] = await Promise.all([getMyCourses(), getActiveChildGroup()]);
  const active = activeId ? courses.find((c) => c.groupId === activeId) ?? null : null;
  return { courses, active };
}
