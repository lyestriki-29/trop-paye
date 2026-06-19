import type { Metadata } from "next";
import {
  Archivo_Black,
  Figtree,
  IBM_Plex_Mono,
  Outfit,
  Space_Grotesk,
  Spline_Sans_Mono,
} from "next/font/google";
import { brand } from "@troppaye/shared";
import { Analytics } from "@/components/Analytics";
import { env } from "@/lib/env";
import "./globals.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Polices néubrutalistes — site PUBLIC uniquement (réf. LP3).
 * Chargées globalement mais appliquées seulement sous le scope `.nb`
 * (cf. globals.css) : l'espace/admin gardent Outfit/Figtree/Spline.
 */
const nbDisplay = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-nb-display",
  weight: ["400"],
  display: "swap",
});

const nbBody = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-nb-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nbMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-nb-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  // Base des URLs relatives des metadata (image OG /api/og/[verdictId], etc.).
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: `${brand.name} — ${brand.baseline}`,
  description: brand.hero.subtitle,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} ${mono.variable} ${nbDisplay.variable} ${nbBody.variable} ${nbMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
