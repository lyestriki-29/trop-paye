import { CONFIDENCE_LABEL, RULE_LABEL, type RuleResult } from "@troppaye/rules-engine";
import { Amount } from "@/components/Amount";
import { frenchDate } from "@/lib/format-date";

/** Champs manquants (clés moteur) → relance en clair. Exhaustif : aucune clé technique brute. */
const MISSING_LABEL: Record<string, string> = {
  revisionQuarter: "le trimestre de référence de la révision",
  irl: "l'indice IRL applicable au logement",
  dpe: "le DPE du logement",
  dpe_surface: "la surface du logement (pour recouper le DPE)",
  previousTenantRent: "le loyer payé par le locataire précédent",
  leaveDate: "la date de remise des clés",
};

const OUTCOME_CHIP: Record<RuleResult["outcome"], { label: string; className: string }> = {
  IRREGULAR: { label: "Irrégulier", className: "bg-refund/12 text-refund-text" },
  COMPLIANT: { label: "Conforme", className: "bg-paper-2 text-ink/70" },
  INSUFFICIENT_DATA: { label: "À compléter", className: "bg-paper-2 text-ink/60" },
};

export function RuleCard({ rule }: { rule: RuleResult }) {
  const chip = OUTCOME_CHIP[rule.outcome];
  const missing = (rule.missingData ?? []).map((k) => MISSING_LABEL[k]).filter(Boolean);

  // Règle reléguée (anti double-comptage) : on montre, on ne chiffre jamais en cumul.
  if (rule.subsidiaryOf) {
    return (
      <div className="rounded-card border border-line bg-paper-2/50 p-5 text-ink/55">
        <p className="font-display font-semibold">{RULE_LABEL[rule.ruleId]}</p>
        <p className="mt-1 text-sm">
          Déjà pris en compte via « {RULE_LABEL[rule.subsidiaryOf]} » — non cumulé pour éviter
          un double comptage.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold">{RULE_LABEL[rule.ruleId]}</p>
        <span className={`rounded-badge px-3 py-1 text-xs font-medium ${chip.className}`}>
          {chip.label} · {CONFIDENCE_LABEL[rule.confidence]}
        </span>
      </div>

      {rule.outcome === "IRREGULAR" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-field bg-paper-2 px-4 py-3">
            <p className="text-xs text-ink/60">Récupérable</p>
            <Amount cents={rule.recoverableCents} favorable className="text-xl font-medium" />
          </div>
          <div className="rounded-field bg-paper-2 px-4 py-3">
            <p className="text-xs text-ink/60">Économie à venir</p>
            <span className="text-xl">
              <Amount cents={rule.futureMonthlySavingCents} favorable className="font-medium" />
              <span className="font-mono text-sm text-ink/60">/mois</span>
            </span>
          </div>
        </div>
      ) : null}

      {missing.length ? (
        <p className="mt-3 rounded-field bg-stamp/8 px-4 py-3 text-sm text-ink/75">
          Ajoutez {missing.join(", ")} pour chiffrer ce point.
        </p>
      ) : null}

      {/* Audit trail : traçabilité du calcul (charte — langage « document officiel »). */}
      {rule.computation.steps.length ? (
        <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
          {rule.computation.steps.map((step, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <dt className="text-ink/70">
                {step.label}
                {step.detail ? <span className="text-ink/45"> — {step.detail}</span> : null}
              </dt>
              {step.cents !== undefined ? (
                <dd>
                  <Amount cents={step.cents} className="text-ink/80" />
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}

      {rule.actionDeadline ? (
        <p className="mt-3 text-sm text-stamp">
          Date limite d'action : {frenchDate(rule.actionDeadline)}
        </p>
      ) : null}

      {rule.computation.todoVerifier?.length ? (
        <p className="mt-3 text-xs text-ink/45">
          Valeurs à vérifier : {rule.computation.todoVerifier.join(" · ")}
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-ink/45">{rule.legalBasis}</p>
    </div>
  );
}
