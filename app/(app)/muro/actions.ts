"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendExpoPush } from "@/lib/push";
import { geminiTranslate, type Translated } from "@/lib/translate";

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

/**
 * Traduce un aviso al idioma destino (read-through cache).
 * 1ª vez: llama a Gemini y guarda en `translations`. Luego: lee de la base.
 */
export async function translatePost(
  postId: string,
  targetLang: string,
): Promise<Translated | null> {
  if (!targetLang || targetLang.startsWith("es")) return null;
  const supabase = await createClient();
  const admin = createAdminClient();

  // 1) Caché (vía service-role; la tabla no es accesible por clientes).
  if (admin) {
    const { data: cached } = await admin
      .from("translations")
      .select("title, body")
      .eq("content_type", "post")
      .eq("content_id", postId)
      .eq("target_lang", targetLang)
      .maybeSingle();
    if (cached) return { title: cached.title ?? "", body: cached.body ?? "" };
  }

  // 2) Traer el post (RLS valida que el usuario pueda verlo).
  const { data: post } = await supabase
    .from("posts")
    .select("title, body")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return null;

  // 3) Traducir y cachear.
  const result = await geminiTranslate(post.title ?? "", post.body ?? "", targetLang);
  if (!result) {
    // Fallback demo: si la API falla (p. ej. quota de la key), usar las
    // traducciones hechas a mano de los avisos sembrados (no se cachean).
    const { getTranslation } = await import("@/lib/translations");
    return getTranslation(postId, targetLang);
  }
  if (admin) {
    await admin.from("translations").upsert(
      {
        content_type: "post",
        content_id: postId,
        target_lang: targetLang,
        source_lang: "es",
        title: result.title,
        body: result.body,
        provider: "gemini",
      },
      { onConflict: "content_type,content_id,target_lang" },
    );
  }
  return result;
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
  if (!body) return { error: "Escribe el contenido del aviso." };

  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return { error: "No pudimos identificar tu cuenta." };

  // ¿Es encuesta? (opciones no vacías)
  const options = formData
    .getAll("option")
    .map((o) => String(o).trim())
    .filter(Boolean);
  const isPoll = String(formData.get("isPoll") || "") === "1" && options.length >= 2;
  // Por defecto los comentarios están habilitados; el autor puede apagarlos.
  const commentsEnabled = String(formData.get("commentsEnabled") || "1") !== "0";

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      community_id: m.community_id,
      author_membership_id: m.id,
      title: title || null,
      body,
      type: isPoll ? "poll" : "announcement",
      comments_enabled: commentsEnabled,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // RLS bloquea a quien no tiene rol de gestión.
  if (error || !post) return { error: "No tienes permiso para publicar avisos." };

  if (isPoll) {
    await supabase.from("poll_options").insert(
      options.map((label, i) => ({ post_id: post.id, label, position: i })),
    );
  }

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

  // Push notifications a los dispositivos de la comunidad (si hay tokens).
  const { data: tokens } = await supabase.rpc("recipient_tokens", { p_post: post.id });
  await sendExpoPush(
    ((tokens as { token: string }[]) ?? []).map((t) => t.token),
    title || "Nuevo aviso",
    body.slice(0, 140),
  );

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

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  mine: boolean;
}

/** Opciones de una encuesta con conteos y si voté. */
export async function getPollData(postId: string): Promise<PollOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("poll_data", { p_post: postId });
  if (error || !data) return [];
  return (data as { option_id: string; label: string; votes: number; mine: boolean }[]).map(
    (o) => ({ id: o.option_id, label: o.label, votes: o.votes, mine: o.mine }),
  );
}

/** Vota una opción (1 voto por encuesta; reemplaza el anterior). */
export async function votePoll(postId: string, optionId: string) {
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return;
  // Quitar voto previo en cualquier opción de esta encuesta.
  const { data: opts } = await supabase.from("poll_options").select("id").eq("post_id", postId);
  const ids = (opts ?? []).map((o) => o.id as string);
  if (ids.length) {
    await supabase.from("poll_votes").delete().eq("membership_id", m.id).in("option_id", ids);
  }
  await supabase.from("poll_votes").insert({ option_id: optionId, membership_id: m.id });
  revalidatePath("/muro");
}

export type CommentState = { error?: string; ok?: boolean } | null;

/** Agrega un comentario a un post. */
export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!postId || !body) return { error: "Escribe un comentario." };
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
