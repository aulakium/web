import type { CapacitorConfig } from "@capacitor/cli";

// La app nativa es un "shell": carga la web en vivo (server.url) y suma la capa
// nativa de push. No reescribimos la UI; todo corre desde Vercel (aulakium.com).
const config: CapacitorConfig = {
  appId: "com.aulakium.app",
  appName: "Aulakium",
  // Stub: con server.url el contenido local no se usa en runtime, pero Capacitor
  // exige un webDir para el sync.
  webDir: "mobile/www",
  server: {
    // Arranca en /home: el middleware manda al login si no hay sesión, y entra
    // directo si ya está logueado. No usamos "/" porque ahí vive la landing pública.
    url: "https://aulakium.com/home",
    androidScheme: "https",
    // Mantiene TODO el dominio dentro del WebView. Sin esto, una redirección
    // interna (p. ej. home → login) se abre en el navegador y el WebView queda en blanco.
    allowNavigation: ["aulakium.com", "*.aulakium.com"],
  },
  ios: {
    // Marca el User-Agent SOLO en iOS. El server detecta este sufijo y, dentro de
    // la app de Apple, esconde la landing pública con planes/precios mandándola al
    // login (App Store guideline 3.1.1: nada de CTAs de compra/alta dentro de la app).
    appendUserAgent: "AulakiumiOSApp",
  },
  plugins: {
    SplashScreen: {
      // La app carga la web en vivo (server.url); antes quedaba una pantalla
      // BLANCA unos segundos mientras el WebView bajaba el sitio. Con esto se ve
      // el splash de marca (ícono sobre navy + spinner) durante toda esa carga.
      // No se auto-oculta: lo escondemos desde la web (NativeSplash) recién cuando
      // la primera pantalla ya pintó → sin parpadeo blanco.
      launchAutoHide: false,
      backgroundColor: "#0b3a59", // navy de marca (--color-navy)
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
