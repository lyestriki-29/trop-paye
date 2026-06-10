import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bricolage_Grotesque,
  Figtree,
  IBM_Plex_Mono,
  Inter,
  Inter_Tight,
  Outfit,
  Public_Sans,
} from "next/font/google";
import "./directions.css";

const d1Display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-d1-display",
  weight: ["600", "700", "800"],
  display: "swap",
});
const d1Body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-d1-body",
  weight: ["400", "500", "600"],
  display: "swap",
});
const d2Display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-d2-display",
  weight: ["600", "700", "800"],
  display: "swap",
});
const d2Body = Inter({
  subsets: ["latin"],
  variable: "--font-d2-body",
  weight: ["400", "500", "600"],
  display: "swap",
});
const d2Mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-d2-mono",
  weight: ["400", "500"],
  display: "swap",
});
const d3Display = Outfit({
  subsets: ["latin"],
  variable: "--font-d3-display",
  weight: ["600", "700", "800"],
  display: "swap",
});
const d3Body = Figtree({
  subsets: ["latin"],
  variable: "--font-d3-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function DirectionsLayout({ children }: { children: ReactNode }) {
  const fontVars = `${d1Display.variable} ${d1Body.variable} ${d2Display.variable} ${d2Body.variable} ${d2Mono.variable} ${d3Display.variable} ${d3Body.variable}`;
  return (
    <div className={fontVars}>
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <Link href="/design-lab/directions" className="font-medium hover:underline">
          ← Duel P0 — index des directions
        </Link>
        <span className="ml-3">Surface de travail interne. Données fictives.</span>
      </nav>
      {children}
    </div>
  );
}
