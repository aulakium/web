"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

/** Membresía activa del usuario actual (id + comunidad). */
async function myMembership(supabase: Supa) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("id, community_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return data as { id: string; community_id: string } | null;
}

/** Da o quita el like del usuario actual sobre un post. */
export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return;

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("membership_id", m.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("membership_id", m.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, membership_id: m.id });
  }

  revalidatePath("/muro");
  revalidatePath("/inicio");
}

export type CreatePostState = { error?: string; ok?: boolean } | null;

/** Publica un aviso a toda la comunidad (solo roles de gestión, por RLS). */
export async function createPost(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Escribí el contenido del aviso." };

  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return { error: "No pudimos identificar tu cuenta." };

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      community_id: m.community_id,
      author_membership_id: m.id,
      title: title || null,
      body,
      type: "announcement",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // RLS bloquea a quien no tiene rol de gestión.
  if (error || !post) return { error: "No tenés permiso para publicar avisos." };

  // Audiencia elegida ("type:id"); por defecto, toda la comunidad.
  const raw = String(formData.get("audience") || "");
  const [aType, aId] = raw.includes(":") ? raw.split(":") : ["community", m.community_id];
  const allowed = ["community", "level", "grade", "group", "role"];
  const targetType = allowed.includes(aType) ? aType : "community";
  const targetId = targetType === "community" ? m.community_id : aId;

  await supabase.from("audiences").insert({
    community_id: m.community_id,
    content_type: "post",
    content_id: post.id,
    target_type: targetType,
    target_id: targetId,
  });

  revalidatePath("/muro");
  revalidatePath("/inicio");
  return { ok: true };
}

/** Guarda o quita un post de "Guardados". */
export async function toggleBookmark(postId: string) {
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return;
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("membership_id", m.id)
    .eq("content_type", "post")
    .eq("content_id", postId)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("membership_id", m.id)
      .eq("content_type", "post")
      .eq("content_id", postId);
  } else {
    await supabase
      .from("bookmarks")
      .insert({ membership_id: m.id, content_type: "post", content_id: postId });
  }
  revalidatePath("/muro");
}

/** Marca un aviso como leído. */
export async function markRead(postId: string) {
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return;
  await supabase
    .from("post_reads")
    .upsert({ post_id: postId, membership_id: m.id }, { onConflict: "post_id,membership_id", ignoreDuplicates: true });
  revalidatePath("/muro");
  revalidatePath("/inicio");
}

export interface PostComment {
  id: string;
  authorName: string;
  authorRole: string | null;
  body: string;
  at: string;
}

/** Lista los comentarios de un post (para cuando se expanden). */
export async function getComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("post_comments_feed", { p_post: postId });
  if (error || !data) return [];
  return (data as {
    id: string;
    author_name: string | null;
    author_role: string | null;
    body: string;
    created_at: string;
  }[]).map((c) => ({
    id: c.id,
    authorName: c.author_name ?? "—",
    authorRole: c.author_role,
    body: c.body,
    at: new Date(c.created_at).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

export type CommentState = { error?: string; ok?: boolean } | null;

/** Agrega un comentario a un post. */
export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!postId || !body) return { error: "Escribí un comentario." };
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return { error: "No pudimos identificar tu cuenta." };
  const { error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, membership_id: m.id, body });
  if (error) return { error: "No se pudo comentar." };
  revalidatePath("/muro");
  revalidatePath("/inicio");
  return { ok: true };
}
