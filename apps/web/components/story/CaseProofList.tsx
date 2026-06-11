import { formatEUR } from "@troppaye/shared";
import { notreHistoireCopy } from "@/lib/content/notre-histoire";
import entries from "@/lib/content/case-proof.json";

/**
 * Preuve sociale du récit (§5) : dossiers anonymisés, alimentés pour l'instant
 * par un JSON local versionné (lib/content/case-proof.json) — passera sur les
 * vrais dossiers (anonymisés) quand les premiers encaissements existeront.
 */
export interface CaseProofEntry {
  ville: string;
  type: string;
  dpeClass: string;
  montantCents: number;
}

const CASES = entries as CaseProofEntry[];

export function CaseProofList() {
  if (CASES.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line bg-paper-2 px-5 py-4 font-mono text-sm text-ink/60">
        {notreHistoireCopy.preuve.emptyState}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-paper">
      {CASES.map((c, i) => (
        <li key={i} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5">
          <span className="text-sm text-ink/80">
            {c.ville} · {c.type} · DPE {c.dpeClass}
          </span>
          <span className="tabular whitespace-nowrap font-mono text-sm font-medium text-refund-text">
            {formatEUR(c.montantCents, { decimals: true })}
          </span>
        </li>
      ))}
    </ul>
  );
}
