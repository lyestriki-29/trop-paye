import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import { RevealInit } from "@/components/home/RevealInit";
import {
  BasculeSection,
  CtaSection,
  DuoSection,
  HeroCasZero,
  MethodeSection,
  PreuveSection,
} from "@/components/story/sections-histoire";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { notreHistoireCopy as copy } from "@/lib/content/notre-histoire";

/** Statique : aucune donnée dynamique (CaseProofList lit un JSON versionné). */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: copy.seo.title,
  description: copy.seo.description,
  alternates: { canonical: "/notre-histoire" },
};

/**
 * JSON-LD : AboutPage → Organization + 2 Person. jobTitle = clés du copy deck §7
 * (jamais inventés) ; le qualificatif de Nicolas est verrouillé par NICOLAS_ROLE.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: copy.seo.title,
  mainEntity: {
    "@type": "Organization",
    name: brand.name,
    founder: {
      "@type": "Person",
      name: copy.jsonLd.founderName,
      jobTitle: copy.jsonLd.founderJobTitle,
    },
    member: {
      "@type": "Person",
      name: copy.jsonLd.nicolasName,
      jobTitle: copy.jsonLd.nicolasJobTitle,
    },
  },
};

/**
 * Page récit « notre histoire » (plan 2026-06-11) — 6 sections, ordre fixe :
 * hero cas zéro (quittance tamponnée), duo, bascule, méthode, preuve, CTA.
 * Copy intégralement depuis lib/content/notre-histoire.ts (deck §7).
 */
export default function NotreHistoirePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroCasZero />
        <DuoSection />
        <BasculeSection />
        <MethodeSection />
        <PreuveSection />
        <CtaSection ctaLabel={brand.hero.cta} />
      </main>
      <RevealInit />
      <SiteFooter />
      <script
        type="application/ld+json"
        // Constantes du repo ; échappe `<` contre tout breakout </script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
