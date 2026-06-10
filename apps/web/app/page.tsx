import type { Metadata } from "next";
import { Confiance } from "@/components/home/Confiance";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Passoires } from "@/components/home/Passoires";
import { RevealInit } from "@/components/home/RevealInit";
import { Steps } from "@/components/home/Steps";
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

/** Home réelle v2 — ordre spec P2 : hero → comment ça marche → confiance → passoires → FAQ → CTA. */
export default async function Home() {
  const stats = await getPublicStats();
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Steps />
        <Confiance stats={stats} />
        <Passoires />
        <Faq />
        <CtaFinal />
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
