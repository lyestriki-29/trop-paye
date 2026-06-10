import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import {
  SectionHeader,
  SectionHero,
} from "@/app/design-lab/directions/archive/d2/home/sections-hero";
import {
  SectionSteps,
  SectionTrust,
} from "@/app/design-lab/directions/archive/d2/home/sections-steps";
import {
  SectionDpe,
  SectionFaq,
  SectionFinalCta,
} from "@/app/design-lab/directions/archive/d2/home/sections-more";

/**
 * D2 « Relevé de compte » — home témoin (statique).
 * Data-fintech froide et précise : la preuve par les chiffres, zéro métaphore
 * papier. Fonds paper purs + paper-2 en zébrures, montants mono en vedette.
 */
export default function D2HomePage() {
  return (
    <DirectionTheme dir="d2">
      <SectionHeader />
      <main>
        <SectionHero />
        <SectionSteps />
        <SectionTrust />
        <SectionDpe />
        <SectionFaq />
        <SectionFinalCta />
      </main>
    </DirectionTheme>
  );
}
