"use client";

import { useEffect } from "react";

/**
 * Oculta el splash nativo (Capacitor) recién cuando la primera pantalla de la web
 * ya se montó y pintó. Como la app carga el sitio en vivo por red, sin esto el
 * WebView mostraba una pantalla BLANCA unos segundos; ahora el splash de marca
 * (ícono sobre navy + spinner) cubre toda esa carga y desaparece sin parpadeo.
 *
 * En el navegador web no hace NADA (isNativePlatform === false), así que es seguro
 * montarlo en el layout raíz: para los usuarios web es inerte.
 */
export function NativeSplash() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (cancelled || !Capacitor.isNativePlatform()) return;
      const { SplashScreen } = await import("@capacitor/splash-screen");
      // Doble requestAnimationFrame: espera a que el primer frame ya esté pintado
      // antes de esconder el splash, para que no se cuele un flash en blanco.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          SplashScreen.hide().catch(() => {});
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
