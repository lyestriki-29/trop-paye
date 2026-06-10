import Link from "next/link";
import { CommentCaMarcheVarianteA } from "./variante-a";
import { CommentCaMarcheVarianteB } from "./variante-b";

/**
 * Design-lab P2 — section « Comment ça marche » en 2 variantes comparables
 * (process charte §8). Arbitrage Lyes requis AVANT la Task 3 (promotion vers
 * la home) ; la variante écartée partira dans /design-lab/archive.
 * Copy deck §1 mot pour mot dans les deux variantes. Données fictives.
 */

const VARIANTES = [
  {
    id: "A",
    partiPris:
      "3 cartes arrondies + icônes (l'existant v2 enrichi densité §5) — chaque carte porte son artefact documentaire : mini-quittance, trait de signature, liasse stylisée.",
    Section: CommentCaMarcheVarianteA,
  },
  {
    id: "B",
    partiPris:
      "Frise horizontale numérotée 01/02/03 (kickers mono) avec filets documentaires, et un spécimen central : le courrier recommandé part sous vos yeux.",
    Section: CommentCaMarcheVarianteB,
  },
] as const;

export default function CommentCaMarcheLab() {
  return (
    <main className="pb-20">
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · sections P2</span>
        <span className="ml-3">Surface de travail interne. Données fictives.</span>
        <Link
          href="/design-lab/sections/bareme"
          className="ml-3 font-medium underline-offset-2 hover:underline"
        >
          Barème / slider →
        </Link>
      </nav>

      <header className="mx-auto max-w-container px-6 pt-12">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          « Comment ça marche » — 2 variantes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Arbitrage : 1 variante promue vers la home (Task 3), l&apos;autre archivée
          dans /design-lab/archive. Copy deck §1 verbatim dans les deux.
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
