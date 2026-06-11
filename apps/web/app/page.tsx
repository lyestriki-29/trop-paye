import type { Metadata } from "next";
import { RevealInit } from "@/components/home/RevealInit";
import { ClosingV3 } from "@/components/home/v3/sections-closing";
import { EtapesV3 } from "@/components/home/v3/sections-etapes";
import { HeroV3, TickerLegal } from "@/components/home/v3/sections-hero";
import { MoteurV3 } from "@/components/home/v3/sections-moteur";
import { ConfianceV3, TemoignageV3 } from "@/components/home/v3/sections-preuves";
import { RegimesV3 } from "@/components/home/v3/sections-regimes";
import { StoryTeaser } from "@/components/story/injections";
import { FAQ_COMPLETE } from "@/components/public/FaqComplete";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getPublicStats } from "@/lib/public-stats";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** ISR : home statique, rafraîchie toutes les 5 min (compteur public inclus). */
export const revalidate = 300;

/** Les 2 extraits FAQ affichés sur la home (copy deck §1) — JSON-LD FAQPage (socle SEO P3). */
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
 * Home v3 « dossier d'instruction » — arbitrage Lyes 2026-06-11 (« je valide la
 * home v3 »). Composition dense : hero papier ligné + strip de chiffres, ticker
 * des bases légales, pipeline instruction, bento des 3 régimes, étapes
 * éditoriales, confiance, témoignage, FAQ + CTA pleine largeur.
 */
export default async function Home() {
  const stats = await getPublicStats();
  return (
    <>
      <SiteHeader />
      <main>
        <HeroV3 />
        <TickerLegal />
        <MoteurV3 />
        <RegimesV3 />
        <EtapesV3 />
        <ConfianceV3 stats={stats} />
        {/* Récit fondateur (phase 3 notre-histoire) : teaser entre confiance et témoignage. */}
        <StoryTeaser />
        <TemoignageV3 />
        <ClosingV3 />
      </main>
      <RevealInit />
      <SiteFooter />
      <script
        type="application/ld+json"
        // Constantes statiques du repo ; échappe `<` contre tout breakout </script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
