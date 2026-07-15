import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

/**
 * Sirve un documento del colegio a través del dominio de Aulakium.
 * En vez de enviar al usuario a la URL firmada de Supabase (que mostraría el
 * dominio de almacenamiento), descargamos el archivo en el server —con la
 * sesión del usuario, así RLS decide si puede verlo— y lo transmitimos. La
 * dirección que ve el usuario queda en `/documents/file/[id]`.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS decide si el usuario puede ver este documento.
  const { data: doc, error } = await supabase
    .from("documents")
    .select("file_url, title")
    .eq("id", id)
    .maybeSingle();
  if (error || !doc?.file_url) {
    return new Response("Documento no disponible", { status: 404 });
  }

  const { data: signed } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_url as string, 60);
  if (!signed?.signedUrl) {
    return new Response("Documento no disponible", { status: 404 });
  }

  const upstream = await fetch(signed.signedUrl);
  if (!upstream.ok || !upstream.body) {
    return new Response("Documento no disponible", { status: 502 });
  }

  const headers = new Headers();
  headers.set("content-type", upstream.headers.get("content-type") ?? "application/octet-stream");
  // Abrir en el navegador (inline) cuando se pueda; el nombre es el título.
  const safeName = String(doc.title ?? "documento").replace(/[\r\n"]/g, "");
  headers.set("content-disposition", `inline; filename="${safeName}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("content-length", len);
  headers.set("cache-control", "private, no-store");

  return new Response(upstream.body, { status: 200, headers });
}
