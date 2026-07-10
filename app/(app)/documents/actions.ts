"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIdentity } from "@/lib/identity";

const MAX = 10 * 1024 * 1024; // 10 MB por archivo

function safeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(-80) || "archivo";
}

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

async function putFile(admin: Admin, communityId: string, file: File): Promise<string | null> {
  if (file.size > MAX) return null;
  const path = `${communityId}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await admin.storage
    .from("documents")
    .upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: false });
  return up.error ? null : path;
}

async function guardStaff() {
  const me = await getIdentity();
  if (!me?.communityId || me.roleKey === "guardian" || me.roleKey === "student") return null;
  return me;
}

/** Sube un documento GENERAL (por defecto, visible para toda la comunidad). */
export async function uploadGeneralDocument(formData: FormData) {
  const me = await guardStaff();
  if (!me?.communityId) return { error: "Sin permiso para subir documentos." };
  const admin = createAdminClient();
  if (!admin) return { error: "Almacenamiento no disponible." };

  const folderName = (String(formData.get("folder") ?? "").trim()) || "General";
  const scopeType = String(formData.get("scopeType") ?? "community");
  const scopeId = (formData.get("scopeId") as string) || null;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Elige un archivo." };
  const title = (String(formData.get("title") ?? "").trim()) || file.name.replace(/\.[^.]+$/, "");

  const supabase = await createClient();
  const { data: folderId, error: fErr } = await supabase.rpc("get_or_create_document_folder", {
    p_name: folderName,
  });
  if (fErr || !folderId) return { error: "No se pudo crear la carpeta." };

  const path = await putFile(admin, me.communityId, file);
  if (!path) return { error: "No se pudo subir el archivo (máx 10 MB)." };

  const { error } = await supabase.rpc("publish_document", {
    p_folder_id: folderId,
    p_title: title,
    p_file_url: path,
    p_scope_type: scopeType,
    p_scope_id: scopeId,
  });
  if (error) {
    await admin.storage.from("documents").remove([path]);
    return { error: error.message };
  }
  revalidatePath("/documents");
  return { ok: true };
}

/** Sube un LOTE de boletas: cada archivo va como documento PRIVADO del alumno
 *  asignado (visible solo para su familia). Los pares vienen como file_i/student_i. */
export async function uploadBoletines(formData: FormData) {
  const me = await guardStaff();
  if (!me?.communityId) return { error: "Sin permiso para subir documentos." };
  const admin = createAdminClient();
  if (!admin) return { error: "Almacenamiento no disponible." };

  const folderName = (String(formData.get("folder") ?? "").trim()) || "Boletas";
  const supabase = await createClient();
  const { data: folderId, error: fErr } = await supabase.rpc("get_or_create_document_folder", {
    p_name: folderName,
  });
  if (fErr || !folderId) return { error: "No se pudo crear la carpeta." };

  const items: { file: File; studentId: string }[] = [];
  let i = 0;
  while (formData.has(`file_${i}`)) {
    const file = formData.get(`file_${i}`);
    const studentId = String(formData.get(`student_${i}`) ?? "");
    if (file instanceof File && file.size > 0 && studentId) items.push({ file, studentId });
    i++;
  }
  if (!items.length) return { error: "No hay archivos asignados a un alumno." };

  let count = 0;
  const errors: string[] = [];
  for (const { file, studentId } of items) {
    const path = await putFile(admin, me.communityId, file);
    if (!path) {
      errors.push(`${file.name}: no se pudo subir (¿supera 10 MB?)`);
      continue;
    }
    const title = file.name.replace(/\.[^.]+$/, "");
    const { error } = await supabase.rpc("publish_document", {
      p_folder_id: folderId,
      p_title: title,
      p_file_url: path,
      p_scope_type: "student",
      p_scope_id: studentId,
    });
    if (error) {
      await admin.storage.from("documents").remove([path]);
      errors.push(`${file.name}: ${error.message}`);
    } else {
      count++;
    }
  }
  revalidatePath("/documents");
  return { ok: true, count, errors };
}
