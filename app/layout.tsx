import type { Metadata, Viewport } from "next";
import { Outfit, Caveat } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NativeBack } from "@/components/NativeBack";
import { NativeSplash } from "@/components/NativeSplash";
import "./globals.css";

// ID de Google Analytics (configurable por env; default a la propiedad de Aulakium
// aulakium.com — G-YG4Y9W8TJC. El ID no es secreto: viaja en el HTML de la página).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YG4Y9W8TJC";

// Fuente global: Outfit (limpia, geométrica). Una sola familia para títulos y texto.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Fuente manuscrita para palabras destacadas (en el espíritu del logo).
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DESCRIPTION =
  "La comunidad escolar, conectada en un solo lugar. Avisos, calendario, mensajes y solicitudes entre el colegio, las familias y los docentes. Para LatAm y Brasil.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aulakium.com"),
  title: {
    default: "Aulakium — La comunidad escolar, conectada",
    template: "%s · Aulakium",
  },
  description: DESCRIPTION,
  applicationName: "Aulakium",
  openGraph: {
    type: "website",
    siteName: "Aulakium",
    title: "Aulakium — La comunidad escolar, conectada",
    description: DESCRIPTION,
    url: "/",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aulakium — La comunidad escolar, conectada",
    description: DESCRIPTION,
  },
};

// viewport-fit=cover habilita las variables CSS env(safe-area-inset-*), necesarias
// para que en la app iOS (Capacitor) el contenido no se meta bajo la isla/notch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full">
        <NativeBack />
        <NativeSplash />
        {children}
      </body>
      {process.env.NODE_ENV === "production" ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
