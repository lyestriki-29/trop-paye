import Link from "next/link";
import {
  stripInternalMarkers,
  type ConstructionPeriod,
  type DossierSnapshot,
  type Referentials,
  type VerdictGlobal,
  type VerdictRange,
} from "@troppaye/rules-engine";
import { brand, formatEUR } from "@troppaye/shared";
import { BoostersModule } from "./BoostersModule";
import { DepositModule } from "./DepositModule";
import { RecapCaptureModule } from "./RecapCaptureModule";
import { VerdictStoryLine } from "@/components/story/injections";
import { LogoNb } from "@/components/ui/LogoNb";
import { DossierPanel, type DossierRow } from "@/app/diagnostic/questionnaire/ui/DossierPanel";
import { frenchDate } from "@/lib/format-date";
import { prescriptionInfo } from "@/lib/diagnostic/prescription";
import { RuleCard } from "./RuleCard";
import { ShareActions } from "./ShareActions";
import { VerdictSequenceLive, type SequenceLine } from "./VerdictSequenceLive";
import { VerdictUnquantified } from "./VerdictUnquantified";
import { VerdictCompliant } from "./VerdictCompliant";
import { VerdictInsufficient } from "./VerdictInsufficient";

const PERIOD_LABEL: Record<ConstructionPeriod, string> = {
  BEFORE_1946: "Avant 1946",
  "1946_1970": "1946 à 1970",
  "1971_1990": "1971 à 1990",
  AFTER_1990: "Après 1990",
};

/** Lignes du panneau « Votre dossier » (lecture seule) depuis le snapshot moteur. */
function dossierRowsFromSnapshot(
  addressLabel: string,
  snapshot: DossierSnapshot | undefined,
): DossierRow[] {
  const rows: DossierRow[] = [];
  if (addressLabel) rows.push({ id: "address", label: "Adresse", value: addressLabel });
  if (!snapshot) return rows;
  if (snapshot.surfaceM2 !== undefined)
    rows.push({ id: "surface", label: "Surface", value: `${snapshot.surfaceM2} m²` });
  if (snapshot.roomCount !== undefined)
    rows.push({ id: "rooms", label: "Pièces", value: `${snapshot.roomCount} pièce(s)` });
  if (snapshot.furnished !== undefined)
    rows.push({ id: "furnished", label: "Meublé", value: snapshot.furnished ? "Oui" : "Non" });
  if (snapshot.constructionPeriod)
    rows.push({ id: "period", label: "Époque", value: PERIOD_LABEL[snapshot.constructionPeriod] });
  if (snapshot.leaseSignedAt)
    rows.push({ id: "lease", label: "Signature du bail", value: frenchDate(snapshot.leaseSignedAt) });
  if (snapshot.depositPaidCents !== undefined)
    rows.push({ id: "deposit", label: "Dépôt versé", value: formatEUR(snapshot.depositPaidCents) });
  return rows;
}

/**
 * Page verdict — 4 états (plan P2 Task 6), DA néubrutaliste :
 * 1. IRREGULAR → séquence signature chiffrée (héros split : quittance + dossier) ;
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
  verdictId,
  hasLead,
  boosters,
}: {
  verdict: VerdictGlobal;
  addressLabel: string;
  dossierId: string;
  dpeNumber: string | null;
  /** Fourchette basse/haute (hypothèse complément) — null si non calculable. */
  range?: VerdictRange | null;
  verdictId: string;
  /** Email déjà capturé pour ce dossier → on masque le module récap. */
  hasLead: boolean;
  /** Données des modules post-verdict — propriétaire seul. */
  boosters?: { verdictId: string; snapshot: DossierSnapshot; referentials: Referentials };
}) {
  const shortRef = `TP-${dossierId.slice(0, 8).toUpperCase()}`;
  const irregular = verdict.outcome === "IRREGULAR";
  const unquantified = verdict.outcome === "COMPLIANT" && verdict.signals.length > 0;
  const mandateHref = `/mandat/${dossierId}`;

  // Règle principale = premier résultat IRREGULAR non subsidiaire ;
  // ses étapes chiffrées deviennent les lignes de la quittance.
  const primary = verdict.results.find((r) => r.outcome === "IRREGULAR" && !r.subsidiaryOf);
  const lines: SequenceLine[] = (primary?.computation.steps ?? []).flatMap((s) =>
    s.cents !== undefined ? [{ label: s.label, detail: s.detail, cents: s.cents }] : [],
  );

  const dossierRows = dossierRowsFromSnapshot(addressLabel, boosters?.snapshot);

  return (
    <div className="nb min-h-screen">
      <header className="border-b-[3px] border-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label={`${brand.name} — accueil`} className="flex items-center">
            <LogoNb size={44} />
          </Link>
          <p className="border-2 border-ink bg-violet px-3 py-1 font-mono text-xs font-black uppercase tracking-widest text-ink">
            Réf. dossier {shortRef}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        {irregular ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Gauche : héros animé (quittance + count-up + fourchette + confiance + mandat). */}
            <div className="flex min-w-0 flex-col gap-6">
              <VerdictSequenceLive
                reference={shortRef}
                addressLabel={addressLabel}
                lines={lines}
                totalRecoverableCents={verdict.totalRecoverableCents}
                futureMonthlySavingCents={verdict.totalFutureMonthlySavingCents}
                confidence={verdict.confidence}
                dpeNumber={dpeNumber}
                prescription={prescriptionInfo(verdict.results, verdict.asOf)}
                mandateHref={mandateHref}
                range={
                  range?.isRange
                    ? {
                        lowCents: range.totalRecoverableLowCents,
                        highCents: range.totalRecoverableHighCents,
                      }
                    : null
                }
              />
              {/* Récit fondateur : une ligne, verdict POSITIF uniquement (phase 3). */}
              <VerdictStoryLine />
            </div>

            {/* Droite : panneau dossier (continuité tunnel) + mandat + partage. */}
            <div className="flex flex-col gap-4">
              <DossierPanel rows={dossierRows} />
              <Link
                href={mandateHref}
                className="nb-band-final block border-[3px] border-ink px-5 py-4 text-center font-nb-display text-sm font-black uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
              >
                Signer mon mandat →
              </Link>
              {/* Partage (Task 7) : un tiers n'ouvrira que le teaser anonymisé + OG. */}
              <ShareActions amountCents={verdict.totalRecoverableCents} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {unquantified ? (
              <VerdictUnquantified signals={verdict.signals} addressLabel={addressLabel} />
            ) : verdict.outcome === "COMPLIANT" ? (
              <VerdictCompliant addressLabel={addressLabel} />
            ) : (
              <VerdictInsufficient results={verdict.results} addressLabel={addressLabel} />
            )}
          </div>
        )}

        {/* Modules post-verdict + détail : colonne lisible sous le héros. */}
        <div className="mx-auto mt-10 max-w-2xl">
          {/* Capture email APRÈS le verdict (inversion 2026-06-12). Masqué une fois
              l'email posé, inutile tant que le diagnostic est incomplet. */}
          {!hasLead && verdict.outcome !== "INSUFFICIENT_DATA" ? (
            <RecapCaptureModule verdictId={verdictId} />
          ) : null}

          {/* Mini-tunnel dépôt (LOT 3) : même garde que les boosters post-verdict. */}
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

          {/* Boosters (LOT 2) : cartes optionnelles, aperçu live, persistance serveur. */}
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
            <section className="nb-card mt-8 rounded-none p-5">
              <h2 className="font-nb-display text-base font-black uppercase tracking-wide">
                Pistes complémentaires
              </h2>
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
            <h2 className="font-nb-display text-lg font-black uppercase tracking-wide">
              Détail par fondement
            </h2>
            {verdict.results.map((rule) => (
              <RuleCard key={rule.ruleId} rule={rule} />
            ))}
          </section>

          {/* Mention copy deck §2 (= brand.disclaimer). [AVOCAT] */}
          <p className="mt-10 text-xs leading-relaxed text-ink/45">{brand.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}
