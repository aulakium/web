# Apps nativas (iOS / Android) con Capacitor + push FCM

La app móvil de Colequium es un **shell**: una app nativa que carga la web en vivo
(`server.url` → `https://colequium.com`) y le suma **push notifications nativas**
(FCM en Android, APNs→FCM en iOS). **No se reescribe la UI**: cada cambio en la web
aparece en las apps automáticamente.

Mismo enfoque que `livinzy` y `save2app`. Bundle id: **`com.colequium.app`**.

> Las carpetas `ios/` y `android/` se generan con Capacitor y van en `.gitignore`
> (regenerables). La fuente de verdad de la config nativa es `capacitor.config.ts`.

---

## 1) Instalar Capacitor (una vez)

```bash
cd Colequium
npm install @capacitor/core@^8.4.0 @capacitor/cli@^8.4.0 \
  @capacitor/ios@^8.4.0 @capacitor/android@^8.4.0 \
  @capacitor/push-notifications@^8.1.1 google-auth-library@^10.6.2
```

## 2) `capacitor.config.ts` (raíz del repo)

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.colequium.app",
  appName: "Colequium",
  // Stub: con server.url el contenido local no se usa, pero Capacitor exige webDir.
  webDir: "mobile/www",
  server: {
    // Arranca en /home: el middleware manda al login si no hay sesión.
    url: "https://colequium.com/home",
    androidScheme: "https",
    // Mantiene TODO el dominio dentro del WebView (si no, una redirección
    // login→muro se abre en Safari y queda en blanco).
    allowNavigation: ["colequium.com", "*.colequium.com"],
  },
};

export default config;
```
Crear el stub: `mkdir -p mobile/www && echo "<!doctype html><title>Colequium</title>" > mobile/www/index.html`

## 3) Registro del token (en la web)

`components/NativePush.tsx` (cliente). Solo actúa dentro del shell nativo; en el
navegador es no-op.

```tsx
"use client";
import { useEffect } from "react";
import { registerDevice } from "@/app/(app)/push-actions";

export function NativePush() {
  useEffect(() => {
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;
      const { PushNotifications } = await import("@capacitor/push-notifications");

      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted") return;

      await PushNotifications.removeAllListeners();
      await PushNotifications.addListener("registration", (t) =>
        void registerDevice(t.value, Capacitor.getPlatform()),
      );
      await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
        const url = (a.notification?.data ?? {})?.url;
        if (typeof url === "string" && url) window.location.href = url;
      });
      await PushNotifications.register();
    })().catch((e) => console.error("[push] init", e));
  }, []);
  return null;
}
```
Montarlo una vez en el shell logueado: en `app/(app)/layout.tsx`, agregar `<NativePush />`.

Server action `app/(app)/push-actions.ts` (usa la tabla existente `device_tokens`):

```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function registerDevice(token: string, platform: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = (token ?? "").trim();
  if (!user || !t) return { ok: false };
  const p = ["android", "ios", "web"].includes(platform) ? platform : null;
  const { error } = await supabase
    .from("device_tokens")
    .upsert({ user_id: user.id, token: t, platform: p }, { onConflict: "token" });
  return { ok: !error };
}
```
(RLS `device_tokens_self` ya permite al usuario insertar su propio token.)

## 4) Envío desde el servidor (FCM HTTP v1)

`lib/push/send.ts` con `google-auth-library`, leyendo `FCM_SERVICE_ACCOUNT_JSON`
(env secreta; **nunca** al repo). Patrón idéntico al de livinzy:
`getClient()` arma el JWT del service account → `sendPushToUser(userId, {title, body, data})`
lee los `device_tokens` del usuario y postea a `https://fcm.googleapis.com/v1/projects/<id>/messages:send`.
Si falta la credencial, es no-op (no rompe el flujo).

Disparador: al publicarse un aviso, resolver la audiencia → usuarios → enviar push.
(Se engancha en el server action de crear post; es el paso de producto a definir.)

## 5) Android (FCM)
1. Firebase Console → app Android **`com.colequium.app`** → bajar `google-services.json`.
2. `npx cap add android`
3. Copiar `google-services.json` a `android/app/google-services.json`.
4. `npx cap sync android && npx cap open android` → correr en Android Studio.
5. Backend: cargar `FCM_SERVICE_ACCOUNT_JSON` (service account del proyecto) en Vercel.

## 6) iOS (APNs→FCM)
1. Apple Developer → App ID `com.colequium.app` con **Push Notifications**; crear
   **APNs Auth Key (.p8)** (Key ID + Team ID) y subirla a Firebase (Cloud Messaging).
2. `npx cap add ios && npx cap sync ios && npx cap open ios`
3. En Xcode: cuenta Apple + Team (firma automática); Signing & Capabilities → **+ Push
   Notifications**. En `Info.plist`: `UIBackgroundModes → remote-notification`,
   `ITSAppUsesNonExemptEncryption = false`. Capacitor 8 usa Swift Package Manager.
4. Correr en un iPhone físico.

## 7) Subir a tiendas
- iOS: Xcode → Archive → App Store Connect (TestFlight).
- Android: Android Studio → Generate Signed Bundle (`.aab`) → Play Console (Internal testing).

## Credenciales que traés vos
- `google-services.json` (Firebase) — Android.
- APNs Auth Key `.p8` (Key ID + Team ID) subida a Firebase — iOS.
- `FCM_SERVICE_ACCOUNT_JSON` en Vercel — para que el backend envíe.
