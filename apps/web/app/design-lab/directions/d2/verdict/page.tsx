import { DirectionTheme } from "@/app/design-lab/directions/DirectionTheme";
import { VerdictSequence } from "@/app/design-lab/directions/d2/verdict/VerdictSequence";

/**
 * D2 « Relevé de compte » — verdict témoin.
 * Scénario fixe : 12 rue des Lilas, 75011 Paris · trop-perçu 1 437,00 € ·
 * + 72 €/mois · confiance élevée. Les lignes s'impriment, le solde flashe,
 * le montant compte en vert refund. Pas de tampon.
 */
export default function D2VerdictPage() {
  return (
    <DirectionTheme dir="d2">
      <main className="flex min-h-screen flex-col items-center bg-paper-2 px-6 py-16">
        <p className="mb-8 font-mono text-xs text-ink/50">D2 · Relevé de compte</p>
        <VerdictSequence />
      </main>
    </DirectionTheme>
  );
}
