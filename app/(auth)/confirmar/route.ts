import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Punto de llegada del link de invitación/recuperación. Valida el token
 * (verifyOtp), lo que establece la sesión por cookies, y manda a /aceptar.
 */
export async function GET(request: Request) {
  // Redirigir SIEMPRE al mismo origen del request (no a NEXT_PUBLIC_SITE_URL,
  // que es producción) para no cruzar dominios y perder la cookie de sesión.
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Destino tras validar (solo rutas internas, default /aceptar).
  const nextParam = searchParams.get("next") || "/aceptar";
  const next = nextParam.startsWith("/") ? nextParam : "/aceptar";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[confirmar] verifyOtp falló:", error.message);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
