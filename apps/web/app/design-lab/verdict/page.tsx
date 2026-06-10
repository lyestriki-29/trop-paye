import type { Confidence, Outcome } from "@troppaye/rules-engine";
import { VerdictHero } from "@/app/diagnostic/[verdictId]/VerdictHero";

/**
 * Design-lab — hero du verdict dans ses 3 états (données fictives).
 * Sert à arbitrer le traitement visuel (tampon, count-up, hiérarchie des montants).
 * Surface de travail, hors parcours réel — à archiver une fois la variante tranchée.
 */

interface Scenario {
  name: string;
  outcome: Outcome;
  total: number;
  future: number;
  confidence: Confidence;
}

const SCENARIOS: Scenario[] = [
  { name: "Irrégulier — gros montant", outcome: "IRREGULAR", total: 184200, future: 6200, confidence: "HIGH" },
  { name: "Irrégulier — confiance moyenne", outcome: "IRREGULAR", total: 48000, future: 4000, confidence: "MEDIUM" },
  { name: "Conforme", outcome: "COMPLIANT", total: 0, future: 0, confidence: "HIGH" },
  { name: "Données insuffisantes", outcome: "INSUFFICIENT_DATA", total: 0, future: 0, confidence: "LOW" },
];

export default function DesignLabVerdict() {
  return (
    <main className="mx-auto max-w-container px-6 py-12">
      <h1 className="font-display text-2xl font-extrabold tracking-display">
        Design-lab · Hero verdict
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        Données fictives. Active « réduire les animations » dans ton OS pour vérifier le
        court-circuit du tampon et du count-up.
      </p>

      <div className="mt-8 space-y-12">
        {SCENARIOS.map((s) => (
          <div key={s.name}>
            <p className="font-mono text-xs uppercase tracking-wide text-ink/40">{s.name}</p>
            <VerdictHero
              outcome={s.outcome}
              addressLabel="12 rue des Lilas, 75011 Paris"
              totalRecoverableCents={s.total}
              totalFutureMonthlySavingCents={s.future}
              confidence={s.confidence}
              asOf="2026-06-10"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
