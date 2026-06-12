import Link from "next/link";
import {
  formatEur,
  stripInternalMarkers,
  type DossierSnapshot,
  type Referentials,
  type VerdictGlobal,
  type VerdictRange,
} from "@troppaye/rules-engine";
import { BoostersModule } from "./BoostersModule";
import { DepositModule } from "./DepositModule";
import { VerdictStoryLine } from "@/components/story/injections";
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
  range,
  boosters,
}: {
  verdict: VerdictGlobal;
  addressLabel: string;
  dossierId: string;
  dpeNumber: string | null;
  /** Fourchette basse/haute (hypothèse complément) — null si non calculable. */
  range?: VerdictRange | null;
  /** Données des modules post-verdict — propriétaire seul. */
  boosters?: { verdictId: string; snapshot: DossierSnapshot; referentials: Referentials };
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
            {/* Fourchette (hypothèse complément) : mention prudente, non chiffrée
                en dur dans le compteur. Vérification du bail en back-office. TODO_COPY. */}
            {range?.isRange ? (
              <p className="mt-4 rounded-card bg-paper-2 px-4 py-3 text-sm text-ink/70">
                Estimation prudente. Après vérification de votre bail (notamment un
                éventuel complément de loyer), le montant récupérable pourrait atteindre{" "}
                <strong className="font-mono tabular-nums text-refund">
                  {formatEur(range.totalRecoverableHighCents)}
                </strong>
                .
              </p>
            ) : null}
            {/* Partage (Task 7) : un tiers n'ouvrira que le teaser anonymisé + OG. */}
            <ShareActions amountCents={verdict.totalRecoverableCents} />
            {/* Récit fondateur : une ligne, verdict POSITIF uniquement (phase 3). */}
            <VerdictStoryLine />
          </>
        ) : unquantified ? (
          <VerdictUnquantified signals={verdict.signals} addressLabel={addressLabel} />
        ) : verdict.outcome === "COMPLIANT" ? (
          <VerdictCompliant addressLabel={addressLabel} />
        ) : (
          <VerdictInsufficient results={verdict.results} addressLabel={addressLabel} />
        )}

        {/* Mini-tunnel dépôt (LOT 3) : même garde que les boosters post-verdict.
            Pas proposé sur INSUFFICIENT_DATA (compléter le diagnostic d'abord). */}
        {boosters &&
        verdict.outcome !== "INSUFFICIENT_DATA" &&
        !boosters.snapshot.rentReconstructedFromShare ? (
          <DepositModule
            verdictId={boosters.verdictId}
            dossierId={dossierId}
            snapshot={boosters.snapshot}
            referentials={boosters.referentials}
          />
        ) : null}

        {/* Boosters (LOT 2) : cartes optionnelles, aperçu live, persistance serveur.
            Pas proposé sur INSUFFICIENT_DATA (compléter le diagnostic d'abord). */}
        {boosters && verdict.outcome !== "INSUFFICIENT_DATA" ? (
          <BoostersModule
            verdictId={boosters.verdictId}
            dossierId={dossierId}
            snapshot={boosters.snapshot}
            referentials={boosters.referentials}
          />
        ) : null}

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
                  <span>{stripInternalMarkers(signal)}</span>
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
