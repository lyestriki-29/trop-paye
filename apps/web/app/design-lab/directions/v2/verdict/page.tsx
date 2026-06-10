import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@troppaye/shared";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { LogoA } from "@/app/design-lab/directions/v2/identite/logos";
import { VerdictSequence } from "./VerdictSequence";

export const metadata: Metadata = {
  title: "V2 « Synthèse » — Verdict témoin",
};

/**
 * V2 « Synthèse » — verdict témoin animé (arbitrage du 2026-06-10).
 * Carte chaleureuse D3, contenu quittance D1 : en-tête référencé, lignes de
 * calcul qui s'impriment, puis le surligneur balaie le total et le count-up
 * démarre. Gros CTA pilule. Pas de tampon dans la séquence (le tampon vit
 * dans l'identité + réseaux). Données fictives.
 */
export default function VerdictV2Page() {
  return (
    <DirectionTheme dir="d3">
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/design-lab/directions/v2/home" aria-label={`${brand.name} — accueil`}>
            <LogoA className="h-6 w-auto" />
          </Link>
          <span className="rounded-badge bg-paper-2 px-3 py-1 text-xs font-medium text-ink/55">
            Verdict témoin — données fictives
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
        <VerdictSequence />
        <p className="mt-10 text-center text-xs leading-relaxed text-ink/45">
          {brand.disclaimer}
        </p>
      </main>
    </DirectionTheme>
  );
}
