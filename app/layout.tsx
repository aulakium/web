import type { Metadata } from "next";
import { Outfit, Caveat } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NativeBack } from "@/components/NativeBack";
import "./globals.css";

// ID de Google Analytics (configurable por env; default al de Colequium).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-HR68KHV4PH";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://colequium.com"),
  title: {
    default: "Colequium — La comunidad escolar, conectada",
    template: "%s · Colequium",
  },
  description: DESCRIPTION,
  applicationName: "Colequium",
  openGraph: {
    type: "website",
    siteName: "Colequium",
    title: "Colequium — La comunidad escolar, conectada",
    description: DESCRIPTION,
    url: "/",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Colequium — La comunidad escolar, conectada",
    description: DESCRIPTION,
  },
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
        {children}
      </body>
      {process.env.NODE_ENV === "production" ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
