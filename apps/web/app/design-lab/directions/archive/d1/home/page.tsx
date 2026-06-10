import type { Metadata } from "next";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import {
  D1Footer,
  Faq,
  FinalCta,
  Passoires,
} from "@/app/design-lab/directions/archive/d1/home/sections-bottom";
import { D1Header, D1Hero } from "@/app/design-lab/directions/archive/d1/home/sections-hero";
import { Confiance, HowItWorks } from "@/app/design-lab/directions/archive/d1/home/sections-process";

export const metadata: Metadata = {
  title: "D1 « Document officiel » — Home témoin",
};

/**
 * Écran 1 du duel P0 — home statique D1 : grille « document », filets 1px,
 * en-têtes mono petites capitales, hero 2 colonnes texte / quittance spécimen.
 * Le tampon n'apparaît PAS ici (règle charte : verdict + réseaux uniquement).
 */
export default function D1HomePage() {
  return (
    <DirectionTheme dir="d1">
      <D1Header />
      <main>
        <D1Hero />
        <HowItWorks />
        <Confiance />
        <Passoires />
        <Faq />
        <FinalCta />
      </main>
      <D1Footer />
    </DirectionTheme>
  );
}
