import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SendInviteResult {
  ok: boolean;
  link?: string; // link de aceptación (fallback "copiar" si no hubo correo)
  emailed: boolean;
  error?: string;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";
}

/** Genera el link de aceptación y, si hay Resend configurado, envía el correo. */
export async function sendInvite(opts: {
  email: string;
  fullName?: string;
  communityName: string;
}): Promise<SendInviteResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, emailed: false, error: "Falta configurar el servidor." };

  const redirectTo = `${siteUrl()}/confirmar`;

  // generateLink crea el usuario (si no existe) y devuelve el hashed_token.
  let res = await admin.auth.admin.generateLink({
    type: "invite",
    email: opts.email,
    options: { redirectTo, data: { full_name: opts.fullName } },
  });
  // Si el email ya tenía cuenta, usar magiclink (igual reclama invitaciones).
  if (res.error && /registered|already/i.test(res.error.message)) {
    res = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: opts.email,
      options: { redirectTo },
    });
  }
  if (res.error || !res.data?.properties?.hashed_token) {
    return { ok: false, emailed: false, error: res.error?.message ?? "No se pudo generar la invitación." };
  }

  const tokenHash = res.data.properties.hashed_token;
  const type = res.data.properties.verification_type || "invite";
  const link = `${siteUrl()}/confirmar?token_hash=${tokenHash}&type=${type}`;

  const emailed = await sendEmail(
    opts.email,
    `Te invitaron a ${opts.communityName} en Aulakium`,
    emailShell({
      heading: `Te damos la bienvenida a ${opts.communityName}`,
      lead: "Tu colegio usa <b>Aulakium</b> para comunicarse. Para activar tu cuenta y crear tu contraseña, haz clic en el botón:",
      button: "Activar mi cuenta",
      link,
    }),
  );
  return { ok: true, link, emailed };
}

/** Envía el correo de recuperación de contraseña (vía Resend). */
export async function sendPasswordReset(email: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const res = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl()}/recuperar/nueva` },
  });
  // Si el email no existe, generateLink falla: no revelamos nada, devolvemos true.
  if (res.error || !res.data?.properties?.hashed_token) return true;

  const tokenHash = res.data.properties.hashed_token;
  const next = encodeURIComponent("/recuperar/nueva");
  const link = `${siteUrl()}/confirmar?token_hash=${tokenHash}&type=recovery&next=${next}`;

  return await sendEmail(
    email,
    "Recupera tu contraseña de Aulakium",
    emailShell({
      heading: "Recupera tu contraseña",
      lead: "Recibimos una solicitud para restablecer tu contraseña en <b>Aulakium</b>. Haz clic para crear una nueva. Si no fuiste tú, puedes ignorar este correo.",
      button: "Crear nueva contraseña",
      link,
    }),
  );
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!r.ok) console.error("[invites] Resend respondió", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("[invites] error enviando correo:", e);
    return false;
  }
}

function emailShell({
  heading,
  lead,
  button,
  link,
}: {
  heading: string;
  lead: string;
  button: string;
  link: string;
}) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2a44">
    <h1 style="font-size:20px;margin:0 0 8px">${heading}</h1>
    <p style="font-size:15px;line-height:1.5;color:#4a5568">${lead}</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#1f2a44;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;display:inline-block">
        ${button}
      </a>
    </p>
    <p style="font-size:13px;color:#94a3b8">
      Si el botón no funciona, copia y pega este enlace:<br>
      <a href="${link}" style="color:#688db9">${link}</a>
    </p>
  </div>`;
}
