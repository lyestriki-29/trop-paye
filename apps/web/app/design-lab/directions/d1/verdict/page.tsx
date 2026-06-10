import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { LogoA } from "@/app/design-lab/directions/d1/identite/logos";
import { VerdictSequence } from "@/app/design-lab/directions/d1/verdict/VerdictSequence";

export const metadata: Metadata = {
  title: "D1 « Document officiel » — Verdict témoin",
};

/**
 * Écran 2 du duel P0 — la séquence signature du verdict (charte §4) :
 * carte-quittance → lignes de calcul → tampon TROP PAYÉ → count-up → CTA.
 */
export default function D1VerdictPage() {
  return (
    <DirectionTheme dir="d1">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-4">
          <a href="#" aria-label={`${brand.name} — accueil`} className="text-ink">
            <LogoA className="h-6 w-auto" />
          </a>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50">
            D1 · Verdict · Spécimen
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-container px-6 pb-16 pt-14 sm:pt-20">
        <VerdictSequence />
        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-ink/50">
          {brand.disclaimer}
        </p>
      </main>
    </DirectionTheme>
  );
}
