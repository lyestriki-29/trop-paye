import type { Metadata } from "next";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { CtaFinalV2, FaqV2, FooterV2, PassoiresV2 } from "./sections-closing";
import { HeaderV2, HeroV2 } from "./sections-hero";
import { ConfianceV2, StepsV2 } from "./sections-steps";

export const metadata: Metadata = {
  title: "V2 « Synthèse » — Home témoin",
};

/**
 * V2 « Synthèse » (arbitrage du 2026-06-10) — home témoin (statique).
 * L'allié chaleureux qui montre la preuve comptable : structure et chaleur D3
 * (surligneur, pilules, Outfit/Figtree — thème d3 de directions.css) ; la
 * preuve chiffrée parle le langage documentaire D1 : carte-quittance à
 * filets dans le hero, références mono petites capitales.
 * Le tampon n'apparaît PAS ici (réservé verdict gagné + réseaux).
 */
export default function HomeV2Page() {
  return (
    <DirectionTheme dir="d3">
      <HeaderV2 />
      <main>
        <HeroV2 />
        <StepsV2 />
        <ConfianceV2 />
        <PassoiresV2 />
        <FaqV2 />
        <CtaFinalV2 />
      </main>
      <FooterV2 />
    </DirectionTheme>
  );
}
