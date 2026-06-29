import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import type { RequestItem, RequestType, RequestStatus } from "@/lib/domain";

interface RequestRow {
  id: string;
  type: string;
  student_name: string | null;
  group_name: string | null;
  summary: string | null;
  status: string;
  created_at: string | null;
  handled_by: string | null;
  event_date: string | null;
}

function relative(iso: string | null): string {
  if (!iso) return "";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return "Hoy";
  const h = Math.round(min / 60);
  if (h < 24) return `Hoy ${String(new Date(iso).getHours()).padStart(2, "0")}:${String(new Date(iso).getMinutes()).padStart(2, "0")}`;
  const d = Math.round(h / 24);
  if (d === 1) return "Ayer";
  if (d < 7) return `Hace ${d} días`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

/** Trámites visibles para el usuario (los que abrió, gestiona o le competen por grupo). */
export async function getRequests(): Promise<RequestItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  let data: unknown;
  try {
    const supabase = await createClient();
    const res = await supabase.rpc("requests_feed");
    if (res.error || !res.data) return [];
    data = res.data;
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getRequests] error, devuelvo []:", e);
    return [];
  }

  return (data as RequestRow[]).map((r) => ({
    id: r.id,
    type: r.type as RequestType,
    studentName: r.student_name ?? "—",
    group: r.group_name ?? "",
    summary: r.summary ?? "",
    createdAt: relative(r.created_at),
    status: r.status as RequestStatus,
    handledBy: r.handled_by ?? undefined,
    eventDate: r.event_date ?? undefined,
  }));
}

export interface MyChild {
  studentId: string;
  fullName: string;
  groupName: string | null;
}

/** Hijos del usuario (para elegir al crear una solicitud). */
export async function getMyChildren(): Promise<MyChild[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("my_children");
    if (error || !data) return [];
    return (data as { student_id: string; full_name: string; group_name: string | null }[]).map(
      (r) => ({ studentId: r.student_id, fullName: r.full_name, groupName: r.group_name }),
    );
  } catch (e) {
    rethrowNextControl(e);
    return [];
  }
}
