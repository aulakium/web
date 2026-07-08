import { createClient } from "@/lib/supabase/server";
import { rethrowNextControl } from "@/lib/supabase/safe";
import { getIdentity } from "@/lib/identity";

export interface DocItem {
  id: string;
  title: string;
  dateLabel: string;
  url: string | null;
  isPrivate: boolean;
}
export interface DocFolder {
  name: string;
  docs: DocItem[];
}

function dateLabel(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Carpetas + documentos visibles para el usuario (RLS decide qué ve). Marca
 *  cuáles son privados (dirigidos a una familia/alumno) para el candado en la UI. */
export async function getDocuments(): Promise<DocFolder[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createClient();

    const [{ data: folders }, { data: docs }] = await Promise.all([
      supabase.from("document_folders").select("id, name").order("name"),
      supabase
        .from("documents")
        .select("id, title, file_url, created_at, folder_id")
        .order("created_at", { ascending: false }),
    ]);
    if (!folders || !docs) return [];

    // Qué documentos son "dirigidos" (privados): tienen audiencia y ninguna es
    // 'community'. RLS ya limitó `docs` a lo que el usuario puede ver.
    const ids = docs.map((d) => d.id as string);
    const priv = new Set<string>();
    if (ids.length) {
      const { data: auds } = await supabase
        .from("audiences")
        .select("content_id, target_type")
        .eq("content_type", "document")
        .in("content_id", ids);
      const byDoc = new Map<string, string[]>();
      for (const a of auds ?? []) {
        const k = a.content_id as string;
        byDoc.set(k, [...(byDoc.get(k) ?? []), a.target_type as string]);
      }
      for (const [id, types] of byDoc) {
        if (types.length && !types.includes("community")) priv.add(id);
      }
    }

    return folders
      .map((f) => ({
        name: f.name as string,
        docs: docs
          .filter((d) => d.folder_id === f.id)
          .map((d) => ({
            id: d.id as string,
            title: (d.title as string) ?? "Documento",
            dateLabel: dateLabel(d.created_at as string),
            url: d.file_url ? `/documents/file/${d.id as string}` : null,
            isPrivate: priv.has(d.id as string),
          })),
      }))
      .filter((f) => f.docs.length > 0);
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getDocuments] error, devuelvo []:", e);
    return [];
  }
}

export interface RosterStudent {
  studentId: string;
  fullName: string;
  groupName: string;
}
export interface UploadInfo {
  canUpload: boolean;
  folders: string[];
  roster: RosterStudent[];
}

/** Contexto para el panel de subida (solo staff): carpetas existentes + el
 *  padrón de alumnos que el docente puede targetear (los de sus grupos). */
export async function getUploadInfo(): Promise<UploadInfo> {
  const empty: UploadInfo = { canUpload: false, folders: [], roster: [] };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return empty;
  }
  try {
    const me = await getIdentity();
    const canUpload = !!me?.roleKey && me.roleKey !== "guardian" && me.roleKey !== "student";
    if (!canUpload) return empty;
    const supabase = await createClient();
    const [{ data: folders }, { data: roster }] = await Promise.all([
      supabase.from("document_folders").select("name").order("name"),
      supabase.rpc("my_document_roster"),
    ]);
    return {
      canUpload: true,
      folders: (folders ?? []).map((f) => f.name as string),
      roster: (
        (roster as { student_id: string; full_name: string; group_name: string }[]) ?? []
      ).map((r) => ({ studentId: r.student_id, fullName: r.full_name, groupName: r.group_name })),
    };
  } catch (e) {
    rethrowNextControl(e);
    console.error("[getUploadInfo] error:", e);
    return empty;
  }
}
