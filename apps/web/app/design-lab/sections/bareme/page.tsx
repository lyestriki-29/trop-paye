import Link from "next/link";
import { BaremeVarianteA } from "./variante-a";
import { BaremeVarianteB } from "./variante-b";

/**
 * Design-lab P2 — barème/slider en 2 variantes comparables (process charte §8).
 * Arbitrage Lyes requis AVANT la Task 8 (intégration au tunnel mandat) ; la
 * variante écartée partira dans /design-lab/archive.
 * Copy deck §3 mot pour mot ; commission calculée depuis brand.commissionRateBps.
 */

const VARIANTES = [
  {
    id: "A",
    partiPris:
      "La carte-quittance : le barème rendu comme une pièce comptable — ligne « votre part » surlignée accent, total « vous recevez » en refund.",
    Section: BaremeVarianteA,
  },
  {
    id: "B",
    partiPris:
      "Double barre proportionnelle 75/25 + gros chiffres mono — la répartition se lit d'un coup d'œil, sans métaphore document.",
    Section: BaremeVarianteB,
  },
] as const;

export default function BaremeLab() {
  return (
    <main className="pb-20">
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · sections P2</span>
        <span className="ml-3">Surface de travail interne. Données fictives.</span>
        <Link
          href="/design-lab/sections/comment-ca-marche"
          className="ml-3 font-medium underline-offset-2 hover:underline"
        >
          Comment ça marche →
        </Link>
      </nav>

      <header className="mx-auto max-w-container px-6 pt-12">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          Barème / slider — 2 variantes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Arbitrage : 1 variante intégrée au tunnel mandat (Task 8), l&apos;autre
          archivée dans /design-lab/archive. Copy deck §3 verbatim, slider
          500 € → 5 000 € (pas de 50 €).
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
