import Link from "next/link";
import { GabaritGuideVarianteA } from "./variante-a";
import { GabaritGuideVarianteB } from "./variante-b";

/**
 * Design-lab P3 — gabarit guide SEO en 2 variantes comparables (process charte §8).
 * Arbitrage Lyes requis ; la variante écartée partira dans /design-lab/archive.
 * Contenus FICTIFS (compositions seulement) ; le gabarit réel = /guides/[slug].
 */

const VARIANTES = [
  {
    id: "A",
    partiPris:
      "Éditorial sobre : une colonne, sommaire ancré, un seul encart CTA accent en milieu d'article — le guide se lit comme une référence.",
    Section: GabaritGuideVarianteA,
  },
  {
    id: "B",
    partiPris:
      "Dossier preuve : colonne sticky « l'essentiel » en carte-quittance + CTA permanent — la conversion reste visible sans couper la lecture.",
    Section: GabaritGuideVarianteB,
  },
] as const;

export default function GabaritGuideLab() {
  return (
    <main className="pb-20">
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · sections P3</span>
        <span className="ml-3">Surface de travail interne. Données fictives.</span>
        <Link
          href="/design-lab/sections/bareme"
          className="ml-3 font-medium underline-offset-2 hover:underline"
        >
          Barème →
        </Link>
      </nav>

      <header className="mx-auto max-w-container px-6 pt-12">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          Gabarit guide SEO — 2 variantes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Arbitrage : 1 composition appliquée à /guides/[slug], l&apos;autre archivée.
          Quasi zéro JS, JSON-LD Article/FAQ, CTA vers /diagnostic (pas de simulateur).
        </p>
      </header>

      {VARIANTES.map(({ id, partiPris, Section }) => (
        <section key={id} className="mt-12 border-t border-line">
          <div className="mx-auto max-w-container px-6 pt-8">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
              Variante {id}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">{partiPris}</p>
          </div>
          <div className="mt-6">
            <Section />
          </div>
        </section>
      ))}
    </main>
  );
}
