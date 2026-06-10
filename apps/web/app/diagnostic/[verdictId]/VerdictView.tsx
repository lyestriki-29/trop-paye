import Link from "next/link";
import type { VerdictGlobal } from "@troppaye/rules-engine";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { prescriptionInfo } from "@/lib/diagnostic/prescription";
import { RuleCard } from "./RuleCard";
import { ShareActions } from "./ShareActions";
import { VerdictSequenceLive, type SequenceLine } from "./VerdictSequenceLive";
import { VerdictUnquantified } from "./VerdictUnquantified";
import { VerdictCompliant } from "./VerdictCompliant";
import { VerdictInsufficient } from "./VerdictInsufficient";

/**
 * Page verdict — 4 états (plan P2 Task 6) :
 * 1. IRREGULAR → séquence signature chiffrée (quittance, surligneur, count-up, tampon) ;
 * 2. COMPLIANT + signaux → orientation NON chiffrée (3 régimes distincts) ;
 * 3. COMPLIANT seul → conforme (copy deck) ;
 * 4. INSUFFICIENT_DATA → pièces manquantes + reprise du diagnostic.
 */
export function VerdictView({
  verdict,
  addressLabel,
  dossierId,
  dpeNumber,
}: {
  verdict: VerdictGlobal;
  addressLabel: string;
  dossierId: string;
  dpeNumber: string | null;
}) {
  const shortRef = `TP-${dossierId.slice(0, 8).toUpperCase()}`;
  const irregular = verdict.outcome === "IRREGULAR";
  const unquantified = verdict.outcome === "COMPLIANT" && verdict.signals.length > 0;

  // Règle principale = premier résultat IRREGULAR non subsidiaire ;
  // ses étapes chiffrées deviennent les lignes de la quittance.
  const primary = verdict.results.find((r) => r.outcome === "IRREGULAR" && !r.subsidiaryOf);
  const lines: SequenceLine[] = (primary?.computation.steps ?? []).flatMap((s) =>
    s.cents !== undefined ? [{ label: s.label, detail: s.detail, cents: s.cents }] : [],
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label={`${brand.name} — accueil`}>
            <Logo className="text-xl" />
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/55">
            Réf. dossier {shortRef}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        {irregular ? (
          <>
            <VerdictSequenceLive
              reference={shortRef}
              addressLabel={addressLabel}
              lines={lines}
              totalRecoverableCents={verdict.totalRecoverableCents}
              futureMonthlySavingCents={verdict.totalFutureMonthlySavingCents}
              confidence={verdict.confidence}
              dpeNumber={dpeNumber}
              prescription={prescriptionInfo(verdict.results, verdict.asOf)}
              mandateHref={`/mandat/${dossierId}`}
            />
            {/* Partage (Task 7) : un tiers n'ouvrira que le teaser anonymisé + OG. */}
            <ShareActions amountCents={verdict.totalRecoverableCents} />
          </>
        ) : unquantified ? (
          <VerdictUnquantified signals={verdict.signals} addressLabel={addressLabel} />
        ) : verdict.outcome === "COMPLIANT" ? (
          <VerdictCompliant addressLabel={addressLabel} />
        ) : (
          <VerdictInsufficient results={verdict.results} addressLabel={addressLabel} />
        )}

        {/* Signaux d'orientation — NON chiffrés, à part des montants (3 régimes distincts).
            Déjà au premier plan dans l'état « orientation ». */}
        {verdict.signals.length > 0 && !unquantified ? (
          <section className="mt-8 rounded-card border border-line bg-paper-2 p-5">
            <h2 className="font-display font-bold">Pistes complémentaires</h2>
            <p className="mt-1 text-xs text-ink/55">
              Orientation, non chiffré — relève d&apos;une démarche distincte de la répétition du
              trop-perçu.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ink/75">
              {verdict.signals.map((signal, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-stamp">
                    ⚑
                  </span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Détail par fondement : l'audit trail complet reste consultable sous la séquence. */}
        <section className="mt-10 space-y-4">
          <h2 className="font-display text-lg font-bold">Détail par fondement</h2>
          {verdict.results.map((rule) => (
            <RuleCard key={rule.ruleId} rule={rule} />
          ))}
        </section>

        {/* Mention copy deck §2 (= brand.disclaimer). [AVOCAT] */}
        <p className="mt-10 text-xs leading-relaxed text-ink/45">{brand.disclaimer}</p>
      </main>
    </div>
  );
}
