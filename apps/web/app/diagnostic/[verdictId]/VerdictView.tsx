import Link from "next/link";
import { VERDICT_DISCLAIMER, type VerdictGlobal } from "@troppaye/rules-engine";
import { Logo } from "@/components/brand/Logo";
import { RuleCard } from "./RuleCard";
import { VerdictHero } from "./VerdictHero";

export function VerdictView({
  verdict,
  addressLabel,
  dossierId,
}: {
  verdict: VerdictGlobal;
  addressLabel: string;
  dossierId: string;
}) {
  const irregular = verdict.outcome === "IRREGULAR";

  return (
    <main className="mx-auto max-w-container px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo className="text-xl" />
      </Link>

      <VerdictHero
        outcome={verdict.outcome}
        addressLabel={addressLabel}
        totalRecoverableCents={verdict.totalRecoverableCents}
        totalFutureMonthlySavingCents={verdict.totalFutureMonthlySavingCents}
        confidence={verdict.confidence}
        asOf={verdict.asOf}
      />

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
          <Link
            href={`/mandat/${dossierId}`}
            className="mt-4 inline-block rounded-field bg-paper px-6 py-3 font-medium text-ink hover:bg-paper-2"
          >
            Lancer la récupération
          </Link>
        </section>
      ) : null}

      <p className="mt-10 text-xs leading-relaxed text-ink/45">{VERDICT_DISCLAIMER}</p>
    </main>
  );
}
