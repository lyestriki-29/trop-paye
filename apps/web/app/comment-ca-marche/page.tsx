import type { Metadata } from "next";
import { Reveal } from "@/components/home/Reveal";
import { CtaFinalNb } from "@/components/home/nb/CtaFinalNb";
import { FAQ_COMPLETE } from "@/components/public/FaqComplete";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { ParcoursNb } from "@/components/public/ParcoursNb";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Comment ça marche — TropPayé",
  description:
    "Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien.",
  alternates: { canonical: "/comment-ca-marche" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_COMPLETE.map(({ q, plain }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: plain },
  })),
};

/** Barème néubrutaliste (#bareme) — copy deck §1 : 0 € d'avance, 25 % au succès. */
function BaremeNb() {
  return (
    <section id="bareme" className="scroll-mt-24 border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Le barème
          </p>
          <h2 className="mt-3 text-[clamp(26px,4vw,44px)]">
            Rien d&apos;avance. <span className="nb-mark">25 %</span> au succès.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="nb-tilt nb-card h-full p-8">
              <p className="tabular font-nb-display text-4xl text-refund">25 %</p>
              <h3 className="mt-3 text-xl">Si on récupère</h3>
              <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/75">
                Notre commission est de 25 % des sommes effectivement récupérées. Le reste vous
                revient, reversé sur votre compte.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="nb-tilt nb-card h-full p-8">
              <p className="tabular font-nb-display text-4xl">0 €</p>
              <h3 className="mt-3 text-xl">Si on ne récupère rien</h3>
              <p className="mt-3 font-nb-body leading-relaxed text-nb-ink/75">
                Vous ne payez rien, jamais d&apos;avance. Pas de récupération, pas de frais : le
                risque est pour nous, pas pour vous.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** FAQ complète néubrutaliste (copy deck §1, mot pour mot). */
function FaqNb() {
  return (
    <section className="border-b-3 border-nb-ink py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <h2 className="text-[clamp(26px,4vw,44px)]">Questions fréquentes</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {FAQ_COMPLETE.map(({ q, a }, i) => (
            <Reveal key={q} delay={0.08 + i * 0.06} className="h-full">
              <details className="nb-card group h-full p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-nb-display text-lg uppercase [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="font-nb-display text-2xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t-3 border-nb-ink p-6 font-nb-body leading-relaxed text-nb-ink/80">
                  {a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CommentCaMarchePage() {
  return (
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Le parcours"
        title={
          <>
            Comment ça <span className="nb-mark">marche</span>
          </>
        }
        lede="Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien."
      />
      <ParcoursNb />
      <BaremeNb />
      <FaqNb />
      <CtaFinalNb />
      <script
        type="application/ld+json"
        // Échappe `<` pour empêcher tout breakout </script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
    </PublicShell>
  );
}
