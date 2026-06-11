import Link from "next/link";
import { HistoireVarianteA } from "./variante-a";
import { HistoireVarianteB } from "./variante-b";

/**
 * Design-lab — section 1 de /notre-histoire en 2 variantes (phase 4 du plan).
 * Arbitrage Lyes : la retenue remplace le hero actuel de la page, l'autre part
 * en /design-lab/archive. Copy = deck §7 (placeholders TODO_COPY visibles tant
 * que le deck n'est pas rempli — c'est voulu).
 */

const VARIANTES = [
  {
    id: "A",
    partiPris:
      "« Pièce à conviction » : la quittance plein écran ouvre la page, le tampon claque au scroll, le récit ne commence qu'en dessous. Choc documentaire, mobile-first.",
    Section: HistoireVarianteA,
  },
  {
    id: "B",
    partiPris:
      "« Salle d'instruction » : split-screen, quittance figée à gauche, récit qui défile à droite. Lecture longue desktop, la preuve reste sous les yeux.",
    Section: HistoireVarianteB,
  },
] as const;

export default function NotreHistoireLab() {
  return (
    <main className="pb-20">
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · notre-histoire</span>
        <span className="ml-3">Surface de travail interne. Copy deck §7 à remplir.</span>
        <Link href="/notre-histoire" className="ml-3 font-medium underline-offset-2 hover:underline">
          Page en l&apos;état →
        </Link>
      </nav>

      <header className="mx-auto max-w-container px-6 pt-12">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          Section « cas zéro » — 2 variantes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Arbitrage : la variante retenue devient le hero de /notre-histoire,
          l&apos;autre est archivée.
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
