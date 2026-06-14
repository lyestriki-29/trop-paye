import type { Metadata } from "next";
import { CasZeroNb, ClosingNb } from "@/components/home/nb/sections-closing-nb";
import { EtapesNb } from "@/components/home/nb/sections-etapes-nb";
import { HeroNb, TickerNb } from "@/components/home/nb/sections-hero-nb";
import { MoteurNb } from "@/components/home/nb/sections-moteur-nb";
import { ConfianceNb, TemoignageNb } from "@/components/home/nb/sections-preuves-nb";
import { RegimesNb } from "@/components/home/nb/sections-regimes-nb";
import { ResultatsNb } from "@/components/home/nb/sections-resultats-nb";
import { FAQ_COMPLETE } from "@/components/public/FaqComplete";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** ISR : home statique, rafraîchie toutes les 5 min. */
export const revalidate = 300;

/** Les 2 extraits FAQ pour le JSON-LD FAQPage (socle SEO, copy deck §1). */
const HOME_FAQ_QUESTIONS = ["Combien ça coûte ?", "Combien de temps ça prend ?"];
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_COMPLETE.filter((e) => HOME_FAQ_QUESTIONS.includes(e.q)).map(
    ({ q, plain }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: plain },
    }),
  ),
};

/**
 * Home — DA néubrutaliste pastel « Vivante » (arbitrage Lyes 2026-06-13),
 * promue depuis /design-lab. Preuve chiffrée tôt (résultats), notre histoire
 * (fondateur), méthode + témoignage Kilian, règles, moteur, confiance, FAQ + CTA.
 */
export default function Home() {
  return (
    <PublicShell>
      <TickerNb />
      <HeroNb />
      <ResultatsNb />
      <CasZeroNb />
      <EtapesNb />
      <TemoignageNb />
      <RegimesNb />
      <MoteurNb />
      <ConfianceNb stats={null} />
      <ClosingNb />
      <script
        type="application/ld+json"
        // Constantes statiques du repo ; échappe `<` contre tout breakout </script>.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </PublicShell>
  );
}
