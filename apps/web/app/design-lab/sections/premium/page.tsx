import Link from "next/link";
import { formatEUR } from "@troppaye/shared";
import { Temoignages } from "@/components/home/Temoignages";
import { RevealInit } from "@/components/home/RevealInit";
import { CountUp } from "@/components/ui/CountUp";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Stamp } from "@/components/ui/Stamp";
import { TEMOIGNAGES } from "@/lib/content/temoignages";

/**
 * Design-lab premium v2.1 — variantes des points contestables (demande Lyes
 * 2026-06-11 : « un mini-lab quand tu as plusieurs idées sur le même point »).
 * Point 1 : composition du témoignage. La variante A (citation XXL + reçu
 * perforé) est LIVE sur home/resultats ; B est l'alternative « polaroid ».
 */

/** Variante B — « pièce à conviction » : tout tient dans UN ticket penché. */
function TemoignageVarianteB() {
  const t = TEMOIGNAGES[0];
  if (!t) return null;
  return (
    <section className="mx-auto max-w-container px-6 py-16">
      <div className="mx-auto max-w-xl -rotate-1 transition duration-300 hover:rotate-0">
        <QuittanceCard
          perforated
          className="shadow-pile"
          reference={`Dossier ${t.prenom}`}
          kind="Pièce à conviction"
        >
          <blockquote className="font-display text-lg font-bold leading-snug tracking-display text-ink">
            « {t.quote} »
          </blockquote>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/55">
            {t.prenom} · {t.contexte}
          </p>
          <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-ink pt-4">
            <Stamp tone="refund" rotate={-5}>
              Dossier clos
            </Stamp>
            <p className="text-xl font-medium text-refund-text">
              <CountUp cents={t.recupereCents} />
            </p>
          </div>
        </QuittanceCard>
        <p className="mt-3 text-center font-mono text-xs text-ink/45">
          Loyer payé : {formatEUR(t.loyerCents)} / mois
        </p>
      </div>
    </section>
  );
}

export default function PremiumLab() {
  return (
    <main className="pb-20">
      <nav className="border-b border-line bg-paper-2 px-6 py-2 text-xs text-ink/60">
        <span className="font-medium">Design-lab · premium v2.1</span>
        <span className="ml-3">Variantes à arbitrer — A est LIVE, B est l&apos;alternative.</span>
        <Link
          href="/design-lab/sections/gabarit-guide"
          className="ml-3 font-medium underline-offset-2 hover:underline"
        >
          Gabarit guide →
        </Link>
      </nav>

      <header className="mx-auto max-w-container px-6 pt-12">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          Témoignage — 2 compositions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          A « citation + reçu » (en prod sur home/résultats) : éditorial, deux colonnes.
          B « pièce à conviction » : tout-en-un ticket penché, plus compact, plus réseaux.
        </p>
      </header>

      <section className="mt-10 border-t border-line">
        <p className="mx-auto max-w-container px-6 pt-8 font-mono text-xs uppercase tracking-widest text-ink/50">
          Variante A — LIVE
        </p>
        <Temoignages numero="—" />
      </section>

      <section className="mt-10 border-t border-line">
        <p className="mx-auto max-w-container px-6 pt-8 font-mono text-xs uppercase tracking-widest text-ink/50">
          Variante B — alternative
        </p>
        <TemoignageVarianteB />
      </section>

      <RevealInit />
    </main>
  );
}
