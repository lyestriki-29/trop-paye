import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@troppaye/shared";
import { RevealInit } from "@/components/home/RevealInit";
import { ClosingNb } from "@/components/home/nb/sections-closing-nb";
import { EtapesNb } from "@/components/home/nb/sections-etapes-nb";
import { HeroNb, TickerNb } from "@/components/home/nb/sections-hero-nb";
import { MoteurNb } from "@/components/home/nb/sections-moteur-nb";
import { ConfianceNb, TemoignageNb } from "@/components/home/nb/sections-preuves-nb";
import { RegimesNb } from "@/components/home/nb/sections-regimes-nb";
import { VariantSwitcher } from "@/components/home/nb/VariantSwitcher";
import { getPublicStats } from "@/lib/public-stats";

export const metadata: Metadata = {
  title: "Design-lab — Home néubrutaliste",
  robots: { index: false, follow: false },
};

/** Variante DA à arbitrer : ne pas mettre en cache agressif. */
export const revalidate = 0;

/** En-tête néubrutaliste de prévisualisation (le vrai SiteHeader vient en Phase 2). */
function PreviewHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-3 border-nb-ink bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="font-nb-display text-xl uppercase tracking-tight">
          {brand.name}
        </Link>
        <nav className="hidden items-center gap-6 nb-mono text-xs font-semibold uppercase tracking-wider lg:flex">
          <Link href="/comment-ca-marche" className="hover:text-violet">Comment ça marche</Link>
          <Link href="/guides" className="hover:text-violet">Guides</Link>
          <Link href="/resultats" className="hover:text-violet">Résultats</Link>
          <Link href="/notre-histoire" className="hover:text-violet">Notre histoire</Link>
        </nav>
        <Link
          href="/diagnostic"
          className="nb-card-hover border-3 border-nb-ink bg-accent px-4 py-2 font-nb-display text-sm uppercase shadow-nb-sm"
        >
          {brand.hero.cta}
        </Link>
      </div>
    </header>
  );
}

/**
 * Showcase de la home en DA néubrutaliste (réf. LP3), scopée `.nb` — sert à
 * arbitrer le look AVANT de propager au site public (convention design-lab :
 * « je tranche, j'archive »). N'altère rien hors de son sous-arbre.
 */
export default async function NeubrutalistPreview() {
  const stats = await getPublicStats();
  return (
    <VariantSwitcher>
      <Link
        href="/design-lab"
        className="block bg-nb-ink px-6 py-2 text-center nb-mono text-xs uppercase tracking-widest text-cream"
      >
        Design-lab · home néubrutaliste pastel (à arbitrer) — retour au lab
      </Link>
      <PreviewHeader />
      <main>
        <TickerNb />
        <HeroNb />
        <MoteurNb />
        <RegimesNb />
        <EtapesNb />
        <ConfianceNb stats={stats} />
        <TemoignageNb />
        <ClosingNb />
      </main>
      <RevealInit />
    </VariantSwitcher>
  );
}
