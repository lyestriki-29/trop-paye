import Link from "next/link";
import {
  CONFIDENCE_LABEL,
  OUTCOME_TITLE,
  VERDICT_DISCLAIMER,
  type VerdictGlobal,
} from "@troppaye/rules-engine";
import { Logo } from "@/components/brand/Logo";
import { Amount } from "@/components/Amount";
import { RuleCard } from "./RuleCard";

function frenchDate(iso: string): string {
  return new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function VerdictView({
  verdict,
  addressLabel,
}: {
  verdict: VerdictGlobal;
  addressLabel: string;
}) {
  const irregular = verdict.outcome === "IRREGULAR";

  return (
    <main className="mx-auto max-w-container px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo className="text-xl" />
      </Link>

      {/* Hero — synthèse du verdict */}
      <section className="mt-10 border-b border-line pb-10">
        {addressLabel ? (
          <p className="font-mono text-sm text-ink/55">{addressLabel}</p>
        ) : null}
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-display sm:text-[40px]">
          {OUTCOME_TITLE[verdict.outcome]}
        </h1>

        {irregular ? (
          <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-4">
            <div>
              <p className="text-sm text-ink/60">Trop-perçu récupérable</p>
              <Amount
                cents={verdict.totalRecoverableCents}
                favorable
                className="text-[40px] font-medium sm:text-hero"
              />
            </div>
            {verdict.totalFutureMonthlySavingCents > 0 ? (
              <div>
                <p className="text-sm text-ink/60">Économie à venir</p>
                <span className="text-2xl">
                  <Amount cents={verdict.totalFutureMonthlySavingCents} favorable className="font-medium" />
                  <span className="font-mono text-base text-ink/60">/mois</span>
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 max-w-2xl text-ink/70">
            {verdict.outcome === "COMPLIANT"
              ? "D'après les éléments fournis, aucun trop-perçu chiffrable n'a été détecté."
              : "Il manque des informations pour chiffrer votre situation — complétez les points signalés ci-dessous."}
          </p>
        )}

        <p className="mt-5 text-sm text-ink/50">
          {CONFIDENCE_LABEL[verdict.confidence]} · évalué le {frenchDate(verdict.asOf)}
        </p>
      </section>

      {/* Détail par fondement */}
      <section className="mt-8 space-y-4">
        <h2 className="font-display text-lg font-bold">Détail par fondement</h2>
        {verdict.results.map((rule) => (
          <RuleCard key={rule.ruleId} rule={rule} />
        ))}
      </section>

      {/* Signaux d'orientation — NON chiffrés, séparés des montants (3 régimes distincts) */}
      {verdict.signals.length > 0 ? (
        <section className="mt-8 rounded-card border border-line bg-paper-2 p-5">
          <h2 className="font-display font-bold">Pistes complémentaires</h2>
          <p className="mt-1 text-xs text-ink/55">
            Orientation, non chiffré — relève d'une démarche distincte de la répétition du
            trop-perçu.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink/75">
            {verdict.signals.map((signal, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-stamp">⚑</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {irregular ? (
        <section className="mt-10 rounded-card border border-ink bg-ink p-6 text-paper">
          <p className="font-display text-lg font-bold">Récupérer ce montant</p>
          <p className="mt-1 text-sm text-paper/75">
            Nous préparons le courrier et suivons la démarche pour vous, commission au succès.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 rounded-field bg-paper px-6 py-3 font-medium text-ink disabled:opacity-60"
          >
            Bientôt disponible
          </button>
        </section>
      ) : null}

      <p className="mt-10 text-xs leading-relaxed text-ink/45">{VERDICT_DISCLAIMER}</p>
    </main>
  );
}
