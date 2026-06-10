import type { Metadata } from "next";
import { Figtree, Outfit, Spline_Sans_Mono } from "next/font/google";
import { brand } from "@troppaye/shared";
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
