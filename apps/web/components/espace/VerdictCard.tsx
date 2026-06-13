import { Amount } from "@/components/Amount";
import { Stamp } from "@/components/ui/Stamp";

export interface VerdictCardProps {
  totalRecoverableCents: number;
  totalFutureMonthlySavingCents: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  breakdown: { label: string; cents: number }[];
}

const CONFIDENCE_STAMP: Record<VerdictCardProps["confidence"], string> = {
  HIGH: "Confiance élevée",
  MEDIUM: "Confiance moyenne",
  LOW: "Confiance faible",
};

/**
 * Carte synthèse du verdict — DA papier, montants tabulaires, tampon confiance.
 * Server Component (pas d'interactivité client).
 */
export function VerdictCard({
  totalRecoverableCents,
  totalFutureMonthlySavingCents,
  confidence,
  breakdown,
}: VerdictCardProps) {
  return (
    <div className="rounded-card border border-line bg-paper-2 p-6">
      {/* Montant principal */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/60">Trop-perçu estimé</p>
        <Amount
          cents={totalRecoverableCents}
          favorable
          className="mt-1 text-3xl font-medium"
        />
      </div>

      {/* Économie mensuelle */}
      {totalFutureMonthlySavingCents > 0 && (
        <p className="mt-2 text-sm text-ink/60">
          +{" "}
          <Amount
            cents={totalFutureMonthlySavingCents}
            favorable
            className="font-medium"
          />
          <span className="ml-1 font-mono text-xs">/mois à venir</span>
        </p>
      )}

      {/* Tampon confiance */}
      <div className="mt-4">
        <Stamp
          tone={confidence === "HIGH" ? "refund" : "stamp"}
          rotate={-4}
        >
          {CONFIDENCE_STAMP[confidence]}
        </Stamp>
      </div>

      {/* Détail par règle */}
      {breakdown.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          {breakdown.map((item) => (
            <li key={item.label} className="flex justify-between gap-4 text-sm">
              <span className="text-ink/70">{item.label}</span>
              <Amount cents={item.cents} favorable className="font-mono text-xs tabular-nums" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
