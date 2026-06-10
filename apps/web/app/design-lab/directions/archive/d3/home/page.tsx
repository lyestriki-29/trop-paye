import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { CtaFinalD3, FaqD3, FooterD3, PassoiresD3 } from "./sections-closing";
import { HeaderD3, HeroD3 } from "./sections-hero";
import { ConfianceD3, StepsD3 } from "./sections-steps";

/**
 * D3 « De votre côté » — home témoin (statique).
 * Parti pris : l'allié humain et chaleureux — empathie d'abord, preuve
 * ensuite. Surligneur jaune en signature, gros boutons pilule, cartes
 * arrondies, interlignes généreux.
 */
export default function HomeD3Page() {
  return (
    <DirectionTheme dir="d3">
      <HeaderD3 />
      <main>
        <HeroD3 />
        <StepsD3 />
        <ConfianceD3 />
        <PassoiresD3 />
        <FaqD3 />
        <CtaFinalD3 />
      </main>
      <FooterD3 />
    </DirectionTheme>
  );
}
