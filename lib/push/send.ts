import "server-only";

import { JWT } from "google-auth-library";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPushEnabled, type NotifCategory } from "@/lib/notifications/prefs";

// Envío de push vía FCM HTTP v1 (Android nativo + iOS por el puente APNs→FCM).
// La credencial (service account de Firebase) vive en FCM_SERVICE_ACCOUNT_JSON
// (env secreta, NUNCA en el repo). Sin ella, todo es no-op (no rompe el flujo).

export type PushPayload = {
  title: string;
  body: string;
  /** Datos para deep-link al tocar la notificación (p. ej. { url: "/aviso/123" }). */
  data?: Record<string, string>;
};

let jwtClient: JWT | null = null;
let projectId: string | null = null;

function getClient(): JWT | null {
  if (jwtClient) return jwtClient;
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw);
    projectId = sa.project_id;
    jwtClient = new JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    return jwtClient;
  } catch (e) {
    console.error("[push] FCM_SERVICE_ACCOUNT_JSON inválido:", e);
    return null;
  }
}

/**
 * Envía una notificación a TODOS los dispositivos de un usuario. Best-effort:
 * nunca lanza (un fallo de push no debe tumbar la acción que lo dispara).
 * Limpia tokens muertos (UNREGISTERED) de device_tokens.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  category?: NotifCategory,
  platforms?: string[],
): Promise<void> {
  try {
    const client = getClient();
    if (!client || !projectId) return; // sin credenciales → no-op

    const admin = createAdminClient();
    if (!admin) return;

    // Respeta la preferencia del usuario: si tiene el push de esta categoría
    // apagado, no enviamos. Sin categoría → se envía siempre (transaccional).
    if (category) {
      const { data: u } = await admin
        .from("users")
        .select("notification_prefs")
        .eq("id", userId)
        .maybeSingle();
      if (!isPushEnabled(u?.notification_prefs, category)) return;
    }

    let q = admin.from("device_tokens").select("token, platform").eq("user_id", userId);
    if (platforms?.length) q = q.in("platform", platforms);
    const { data: rows } = await q;
    if (!rows?.length) return;

    const { token: bearer } = await client.getAccessToken();
    if (!bearer) return;

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    await Promise.all(
      rows.map(async (r) => {
        const token = (r as { token: string }).token;
        const message = {
          message: {
            token,
            notification: { title: payload.title, body: payload.body },
            data: payload.data ?? {},
          },
        };
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });
        if (!res.ok) {
          const txt = await res.text();
          // Token muerto → limpiar para no reintentar siempre.
          if (res.status === 404 || res.status === 410 || /UNREGISTERED|NOT_FOUND/.test(txt)) {
            await admin.from("device_tokens").delete().eq("token", token);
          } else {
            console.error("[push] FCM", res.status, txt);
          }
        }
      }),
    );
  } catch (e) {
    console.error("[push] sendPushToUser", e);
  }
}

/** Envía la misma notificación a varios usuarios (deduplicados). */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
  category?: NotifCategory,
): Promise<void> {
  await Promise.all([...new Set(userIds)].map((id) => sendPushToUser(id, payload, category)));
}
