import type { Metadata } from "next";
import { CtaFinal } from "@/components/home/CtaFinal";
import { RevealInit } from "@/components/home/RevealInit";
import { Steps } from "@/components/home/Steps";
import { Bareme } from "@/components/public/Bareme";
import { FAQ_COMPLETE, FaqComplete } from "@/components/public/FaqComplete";
import { PageHero } from "@/components/public/PageHero";
import { Marker } from "@/components/ui/Marker";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Stamp } from "@/components/ui/Stamp";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "Comment ça marche — TropPayé",
  description:
    "Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien.",
  alternates: { canonical: "/comment-ca-marche" },
};

/** Page statique : parcours + barème + FAQ (spec P3) — contenus copy deck §1 et §3. */
export default function CommentCaMarchePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_COMPLETE.map(({ q, plain }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: plain },
    })),
  };

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          kicker="TropPayé · Le parcours"
          /* TODO_COPY — intitulé de page (hors copy deck). */
          title={
            <>
              Comment ça <Marker>marche</Marker>
            </>
          }
          /* Copy deck §1, sous-titre hero mot pour mot. */
          lede="Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien."
        >
          <div className="mt-6">
            <Stamp rotate={-3}>0 € d&apos;avance</Stamp>
          </div>
        </PageHero>
        <Steps />
        <div id="bareme" className="scroll-mt-6">
          <Bareme />
        </div>
        <FaqComplete />
        <CtaFinal />
      </main>
      <RevealInit />
      <SiteFooter />
      <script
        type="application/ld+json"
        // Échappe `<` pour empêcher tout breakout </script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
