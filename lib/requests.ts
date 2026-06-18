import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("requests_feed");
  if (error || !data) return [];

  return (data as RequestRow[]).map((r) => ({
    id: r.id,
    type: r.type as RequestType,
    studentName: r.student_name ?? "—",
    group: r.group_name ?? "",
    summary: r.summary ?? "",
    createdAt: relative(r.created_at),
    status: r.status as RequestStatus,
    handledBy: r.handled_by ?? undefined,
  }));
}
