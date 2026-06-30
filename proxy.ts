import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renombró la convención `middleware` → `proxy`.
export async function proxy(request: NextRequest) {
  // Dentro de la app iOS (Capacitor marca el User-Agent con "ColequiumiOSApp"),
  // no mostramos la landing pública con planes/precios: la mandamos al login.
  // App Store guideline 3.1.1: la app no debe ofrecer CTAs de compra/alta del
  // servicio B2B. La web y Android quedan igual (no llevan ese marcador).
  const ua = request.headers.get("user-agent") ?? "";
  if (ua.includes("ColequiumiOSApp") && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Todo menos assets estáticos.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
