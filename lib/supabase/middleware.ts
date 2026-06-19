import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas internas que requieren sesión. */
const PROTECTED = [
  "/inicio", "/muro", "/calendario", "/conversaciones", "/tramites",
  "/documentos", "/transporte", "/comunidad", "/perfil", "/configuracion",
];

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas internas.
 * Si no hay usuario y la ruta es protegida → redirige a /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Sin credenciales (ej. Vercel sin env vars) NO rompemos el sitio: dejamos
  // pasar todo en modo demo, sin sesión. Así la landing y la app igual cargan.
  if (!url || !key) return response;

  // BLINDAJE: cualquier error (valor de env malformado, problema de red/Edge,
  // etc.) NUNCA debe tirar 500 en todo el sitio. Si algo falla, seguimos sin
  // sesión (la ruta protegida la cubre igual el server component al leer null).
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (e) {
    console.error("[proxy] updateSession falló, sigo sin sesión:", e);
  }

  return response;
}
