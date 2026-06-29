"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendExpoPush } from "@/lib/push";
import { translateNotice, type Translated } from "@/lib/translate";
import { getFeed, FEED_PAGE_SIZE } from "@/lib/posts";
import { getActiveChildGroup } from "@/lib/child-filter";
import type { Post } from "@/lib/domain";

type Supa = Awaited<ReturnType<typeof createClient>>;

/** Trae la siguiente página del muro (para "Ver más novedades"). Respeta el filtro por hijo. */
export async function getMorePosts(offset: number): Promise<Post[]> {
  const child = await getActiveChildGroup();
  return getFeed(FEED_PAGE_SIZE, offset, child);
}

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
 * 1ª vez: llama al traductor y guarda en `translations`. Luego: lee de la base.
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
  const result = await translateNotice(post.title ?? "", post.body ?? "", targetLang);
  if (!result) {
    // Fallback demo: si la API falla, usar las
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
        provider: "mymemory",
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

  revalidatePath("/feed");
  revalidatePath("/home");
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

  // Tipo de novedad: comunicado (announcement) | invitación (event) | tarea (task).
  // La encuesta tiene prioridad sobre el tipo (es un comunicado con votación).
  const postType = String(formData.get("postType") || "comunicado");
  let dbType = "announcement";
  let eventLocation: string | null = null;
  let eventAt: string | null = null;
  let eventAllDay = false;
  let taskAction: string | null = null;
  let taskDue: string | null = null;

  if (isPoll) {
    dbType = "poll";
  } else if (postType === "invitacion") {
    dbType = "event";
    eventLocation = String(formData.get("eventLocation") || "").trim() || null;
    // La hora es OPCIONAL: con fecha sola, el evento es "todo el día".
    const date = String(formData.get("eventDate") || "").trim();
    const time = String(formData.get("eventTime") || "").trim();
    if (!date) return { error: "Una invitación necesita una fecha." };
    // Guardamos la hora "de pared" como UTC para que coincida con el calendario.
    if (time) {
      eventAt = `${date}T${time}:00.000Z`;
      eventAllDay = false;
    } else {
      eventAt = `${date}T00:00:00.000Z`;
      eventAllDay = true;
    }
  } else if (postType === "tarea") {
    dbType = "task";
    const action = String(formData.get("taskAction") || "complete");
    taskAction = ["sign", "submit", "complete"].includes(action) ? action : "complete";
    const due = String(formData.get("taskDue") || "").trim();
    taskDue = due ? new Date(due).toISOString() : null;
  }

  // Filtro de rol: docentes / padres / ambos (null = todos los de la audiencia).
  const roleChoice = String(formData.get("audienceRole") || "all");
  const audienceRoles =
    roleChoice === "teacher"
      ? ["teacher"]
      : roleChoice === "guardian"
        ? ["guardian"]
        : roleChoice === "both"
          ? ["teacher", "guardian"]
          : null;

  // Cuándo publicar: "ahora" por defecto, o programado a futuro. Lo programado
  // queda oculto para los destinatarios hasta su fecha (lo filtra feed()).
  let publishedAt = new Date().toISOString();
  if (String(formData.get("publishMode") || "now") === "schedule") {
    const raw = String(formData.get("publishAt") || "").trim();
    const when = raw ? new Date(`${raw}:00.000Z`) : null;
    if (when && !isNaN(when.getTime()) && when.getTime() > Date.now()) {
      publishedAt = when.toISOString();
    }
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      community_id: m.community_id,
      author_membership_id: m.id,
      title: title || null,
      body,
      type: dbType,
      event_location: eventLocation,
      event_at: eventAt,
      event_all_day: eventAllDay,
      task_action: taskAction,
      task_due: taskDue,
      comments_enabled: commentsEnabled,
      audience_roles: audienceRoles,
      published_at: publishedAt,
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

  // Audiencias elegidas ("type:id", pueden ser varias); por defecto, comunidad.
  const allowed = ["community", "level", "grade", "group", "role"];
  const raws = formData.getAll("audience").map(String).filter(Boolean);
  const seen = new Set<string>();
  const rows = (raws.length ? raws : [`community:${m.community_id}`])
    .map((r) => {
      const [t, id] = r.includes(":") ? r.split(":") : ["community", m.community_id];
      const type = allowed.includes(t) ? t : "community";
      return { type, id: type === "community" ? m.community_id : id };
    })
    .filter((x) => {
      const k = `${x.type}:${x.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  const { error: audErr } = await supabase.from("audiences").insert(
    rows.map((x) => ({
      community_id: m.community_id,
      content_type: "post",
      content_id: post.id,
      target_type: x.type,
      target_id: x.id,
    })),
  );
  // El docente solo publica a sus grupos: si el destino quedó fuera de su
  // alcance, RLS rechaza la audiencia. Evitamos un aviso huérfano (sin público).
  if (audErr) {
    await supabase.from("posts").delete().eq("id", post.id);
    return { error: "Solo puedes publicar a los grados o salones que tienes asignados." };
  }

  // Adjuntos (PDFs / imágenes / documentos): subir al bucket privado y registrar.
  const files = formData
    .getAll("attachment")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length) {
    const admin = createAdminClient();
    if (admin) {
      const MAX = 10 * 1024 * 1024; // 10 MB por archivo
      let idx = 0;
      for (const file of files.slice(0, 6)) {
        if (file.size > MAX) {
          idx++;
          continue;
        }
        const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(-80) || `archivo-${idx}`;
        const path = `${m.community_id}/${post.id}/${idx}-${safe}`;
        const buf = Buffer.from(await file.arrayBuffer());
        const up = await admin.storage
          .from("attachments")
          .upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: false });
        if (!up.error) {
          await admin.from("post_attachments").insert({
            post_id: post.id,
            community_id: m.community_id,
            name: file.name,
            path,
            mime: file.type || null,
            size: file.size,
          });
        }
        idx++;
      }
    }
  }

  // Push notifications: solo si se publica ahora. Si está programado, la
  // notificación debería salir recién en su fecha (lo dejamos para el scheduler).
  if (new Date(publishedAt).getTime() <= Date.now()) {
    const { data: tokens } = await supabase.rpc("recipient_tokens", { p_post: post.id });
    await sendExpoPush(
      ((tokens as { token: string }[]) ?? []).map((t) => t.token),
      title || "Nuevo aviso",
      body.slice(0, 140),
    );
  }

  revalidatePath("/feed");
  revalidatePath("/home");
  revalidatePath("/calendar");
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
  revalidatePath("/feed");
}

/** Marca un aviso como leído. */
export async function markRead(postId: string) {
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return;
  await supabase
    .from("post_reads")
    .upsert({ post_id: postId, membership_id: m.id }, { onConflict: "post_id,membership_id", ignoreDuplicates: true });
  revalidatePath("/feed");
  revalidatePath("/home");
}

/** Responde a una invitación (RSVP): "yes" | "no" | "maybe" | "none" (quita). */
export async function setRsvp(postId: string, response: "yes" | "no" | "maybe" | "none") {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_rsvp", { p_post: postId, p_response: response });
  if (error) console.error("[setRsvp] rpc error:", error.message);
  revalidatePath("/feed");
}

/** Marca/desmarca una tarea como hecha. Al marcarla, sale de "mis pendientes". */
export async function toggleTask(postId: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_task_done", { p_post: postId, p_done: done });
  if (error) console.error("[toggleTask] rpc error:", error.message);
  revalidatePath("/feed");
  revalidatePath("/home");
}

export interface PostComment {
  id: string;
  authorName: string;
  authorRole: string | null;
  body: string;
  at: string;
  parentId: string | null;
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
    parent_id: string | null;
  }[]).map((c) => ({
    id: c.id,
    authorName: c.author_name ?? "—",
    authorRole: c.author_role,
    body: c.body,
    parentId: c.parent_id,
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
  revalidatePath("/feed");
}

export type CommentState = { error?: string; ok?: boolean } | null;

/** Agrega un comentario a un post. */
export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  const rawParent = String(formData.get("parentId") || "").trim() || null;
  if (!postId || !body) return { error: "Escribe un comentario." };
  const supabase = await createClient();
  const m = await myMembership(supabase);
  if (!m) return { error: "No pudimos identificar tu cuenta." };

  // Un solo nivel: si respondo a una respuesta, la cuelgo del comentario raíz.
  let parentId = rawParent;
  if (parentId) {
    const { data: parent } = await supabase
      .from("post_comments")
      .select("id, parent_id")
      .eq("id", parentId)
      .maybeSingle();
    parentId = parent ? (parent.parent_id ?? parent.id) : null;
  }

  const { error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, membership_id: m.id, body, parent_id: parentId });
  if (error) return { error: "No se pudo comentar." };
  revalidatePath("/feed");
  revalidatePath("/home");
  return { ok: true };
}
