import type { Metadata } from "next";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { Steps } from "@/components/home/Steps";
import { Bareme } from "@/components/public/Bareme";
import { FAQ_COMPLETE, FaqComplete } from "@/components/public/FaqComplete";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

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
        <header className="mx-auto max-w-container px-6 pb-4 pt-14 sm:pt-20">
          <Reveal>
            {/* TODO_COPY — intitulé de page (hors copy deck). */}
            <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-hero">
              Comment ça marche
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">
              {/* Copy deck §1, sous-titre hero mot pour mot. */}
              Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien.
            </p>
          </Reveal>
        </header>
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
