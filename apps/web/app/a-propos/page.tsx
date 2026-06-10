import type { Metadata } from "next";
import { CtaFinal } from "@/components/home/CtaFinal";
import { Reveal } from "@/components/home/Reveal";
import { RevealInit } from "@/components/home/RevealInit";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider (socle P3). */
  title: "À propos — TropPayé",
  description: "Nous faisons appliquer la loi. Rien de plus.",
  alternates: { canonical: "/a-propos" },
};

/**
 * Page à propos (spec P3) — squelette : structure finale, contenus TODO_COPY.
 * Seul le bloc « Nous faisons appliquer la loi » vient du copy deck §1
 * (mot pour mot) ; le reste attend la copy de Lyes.
 */
export default function AProposPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <header className="mx-auto max-w-container px-6 pb-10 pt-14 sm:pt-20">
          <Reveal>
            {/* TODO_COPY — intitulé de page (hors copy deck). */}
            <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-hero">
              À propos
            </h1>
          </Reveal>
        </header>

        <section className="mx-auto max-w-container px-6">
          <Reveal>
            <div className="rounded-card bg-ink px-8 py-12 text-paper sm:px-14 sm:py-16">
              {/* Copy deck §1 — section confiance, mot pour mot. */}
              <h2 className="max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
                Nous faisons appliquer la loi. Rien de plus.
              </h2>
              <p className="mt-6 max-w-3xl leading-relaxed text-paper/75">
                Le gel des loyers des passoires thermiques, l&apos;indice de référence des
                loyers, les délais de restitution du dépôt de garantie : ce sont vos droits,
                écrits dans la loi. TropPayé les fait simplement respecter. Chaque calcul
                cite sa source. Chaque euro est tracé sur un compte dédié. Vos données
                restent en France.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-container px-6 py-16">
          <Reveal>
            {/* TODO_COPY — histoire, équipe, engagements : contenus à fournir par Lyes. */}
            <div className="rounded-card border border-dashed border-line bg-paper-2 p-8">
              <h2 className="font-display text-lg font-bold tracking-display">
                L&apos;équipe et l&apos;histoire
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                Contenu en préparation (TODO_COPY) : qui nous sommes, pourquoi TropPayé,
                nos engagements de transparence.
              </p>
            </div>
          </Reveal>
        </section>

        <CtaFinal />
      </main>
      <RevealInit />
      <SiteFooter />
    </>
  );
}
