"use client";

import { useEffect } from "react";

/**
 * Manejador del botón "atrás" nativo de Android dentro del shell Capacitor.
 * Las navegaciones de Next usan history.pushState, que el WebView nativo NO
 * cuenta en su historial — por eso el "atrás" por defecto cree estar en la raíz
 * y cierra la app. Acá usamos el historial de JS: si hay a dónde volver, volvemos;
 * si no, salimos. En la web (no nativo) es inerte. Va en el layout RAÍZ para
 * cubrir todas las páginas, incluidas login y recuperar.
 */
export function NativeBack() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;
      const { App } = await import("@capacitor/app");
      const sub = await App.addListener("backButton", () => {
        if (window.history.length > 1) window.history.back();
        else void App.exitApp();
      });
      cleanup = () => void sub.remove();
    })();
    return () => cleanup?.();
  }, []);

  return null;
}
