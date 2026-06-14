"use client";

import { estimateMonthlyChargesCents, formatEur } from "@troppaye/rules-engine";
import type { DiagnosticDraft, StepProps } from "../use-diagnostic-form";
import { ChoiceField, MoneyField } from "../fields";
import { COMPLEMENT_3DS_CRITERIA } from "@/lib/diagnostic/complement-3ds";

// Dérivations partagées (identiques à `RentStep`).
const isCc = (d: DiagnosticDraft) => (d.rentInputMode ?? "HC") === "CC";
const isShare = (d: DiagnosticDraft) =>
  d.isShared === true && (d.rentBasis ?? "TOTAL") === "SHARE";
const suffixOf = (d: DiagnosticDraft) => (isCc(d) ? "charges comprises" : "hors charges");

type DepositChoice = "1" | "2" | "3" | "other";
const DEPOSIT_MONTHS: Record<Exclude<DepositChoice, "other">, 1 | 2 | 3> = { "1": 1, "2": 2, "3": 3 };
const DEPOSIT_CHOICES: { value: DepositChoice; label: string }[] = [
  { value: "1", label: "1 mois" },
  { value: "2", label: "2 mois" },
  { value: "3", label: "3 mois" },
  { value: "other", label: "Autre montant" },
];

/**
 * Base de saisie (coloc : total / ma part — réservé à `isShared`) + mode HC/CC.
 * Extrait de `RentStep`, mêmes `onChange` (dont le pré-remplissage des charges
 * au barème une seule fois en CC).
 */
export function RentModeQ({ draft, setField }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Coloc : total du logement, ou part personnelle (reconstituée × n). TODO_COPY. */}
      {draft.isShared ? (
        <ChoiceField
          label="Les montants que vous saisissez :"
          hint="Vous ne connaissez que votre part ? On reconstitue le loyer total du logement."
          choices={[
            { value: "TOTAL", label: "Le loyer total du logement" },
            { value: "SHARE", label: "Ma part" },
          ]}
          value={draft.rentBasis ?? "TOTAL"}
          onChange={(v) => setField("rentBasis", v)}
        />
      ) : null}

      <ChoiceField
        label="Mes montants sont :"
        /* Phrase actée par Lyes (2026-06-11) : guider vers le CC si le HC est inconnu. */
        hint="Vous n'avez pas le montant hors charges ? Donnez-nous le total charges comprises."
        choices={[
          { value: "HC", label: "Hors charges" },
          { value: "CC", label: "Charges comprises" },
        ]}
        value={draft.rentInputMode ?? "HC"}
        onChange={(m) => {
          setField("rentInputMode", m);
          // Pré-remplissage au barème, une seule fois (spec §2) — modifiable ensuite.
          if (m === "CC" && draft.chargesCents === undefined && draft.surfaceM2) {
            setField("chargesCents", estimateMonthlyChargesCents(draft.surfaceM2));
            setField("chargesEstimated", true);
          }
        }}
      />
    </div>
  );
}

/**
 * Base de saisie coloc seule (total / ma part), pour gater sur `isShared` au
 * niveau du graphe. À utiliser à la place du bloc coloc de `RentModeQ` si le
 * graphe sépare cette question (non utilisée par défaut).
 */
export function RentBasisQ({ draft, setField }: StepProps) {
  return (
    <ChoiceField
      label="Les montants que vous saisissez :"
      hint="Vous ne connaissez que votre part ? On reconstitue le loyer total du logement."
      choices={[
        { value: "TOTAL", label: "Le loyer total du logement" },
        { value: "SHARE", label: "Ma part" },
      ]}
      value={draft.rentBasis ?? "TOTAL"}
      onChange={(v) => setField("rentBasis", v)}
    />
  );
}

/** Loyer mensuel de départ + raccourci « jamais augmenté » (levier 3). */
export function InitialRentQ({ draft, setField }: StepProps) {
  const share = isShare(draft);
  const suffix = suffixOf(draft);
  return (
    <div className="space-y-3">
      <MoneyField
        label={`${share ? "Votre part — loyer de départ" : "Loyer mensuel de départ"} (${suffix})`}
        hint="Le loyer inscrit au bail, à la signature."
        cents={draft.initialRentCents}
        onChange={(c) => setField("initialRentCents", c)}
      />
      {/* Levier 3 : recopie le loyer actuel (logement jamais réévalué). TODO_COPY. */}
      <button
        type="button"
        className="nb-pill nb-pill--dashed"
        aria-pressed={
          draft.initialRentCents !== undefined && draft.initialRentCents === draft.currentRentCents
        }
        onClick={() => setField("initialRentCents", draft.currentRentCents)}
      >
        Identique — jamais augmenté
      </button>
    </div>
  );
}

/** Loyer mensuel actuel (extrait de `RentStep`). */
export function CurrentRentQ({ draft, setField }: StepProps) {
  const share = isShare(draft);
  const cc = isCc(draft);
  const suffix = suffixOf(draft);
  return (
    <MoneyField
      label={`${share ? "Votre part — loyer actuel" : "Loyer mensuel actuel"} (${suffix})`}
      hint={
        cc
          ? "Ce que vous payez aujourd'hui, charges comprises."
          : "Ce que vous payez aujourd'hui, hors charges."
      }
      cents={draft.currentRentCents}
      onChange={(c) => setField("currentRentCents", c)}
    />
  );
}

/** Charges mensuelles (mode CC) — pré-rempli au barème, éditable (extrait de `RentStep`). */
export function ChargesQ({ draft, setField }: StepProps) {
  const chargesTooHigh =
    isCc(draft) &&
    draft.chargesCents !== undefined &&
    ((draft.initialRentCents !== undefined && draft.chargesCents >= draft.initialRentCents) ||
      (draft.currentRentCents !== undefined && draft.chargesCents >= draft.currentRentCents));

  return (
    <div>
      <MoneyField
        label="Charges mensuelles"
        /* Mention spec §2, mot pour mot. */
        hint="Estimation — ajustez si vous connaissez le montant exact (quittance)."
        cents={draft.chargesCents}
        onChange={(c) => {
          setField("chargesCents", c);
          // L'utilisateur a touché la valeur : elle n'est plus « estimée » (spec §2).
          setField("chargesEstimated", false);
        }}
      />
      {chargesTooHigh ? (
        <p role="alert" className="mt-2 text-sm text-stamp">
          Les charges doivent être inférieures au loyer charges comprises.
        </p>
      ) : null}
    </div>
  );
}

/** Dépôt de garantie (pilules mois ou montant exact en coloc-part) — extrait de `RentStep`. */
export function DepositQ({ draft, setField }: StepProps) {
  const cc = isCc(draft);
  const share = isShare(draft);

  const depositChoice: DepositChoice | undefined =
    draft.depositPaidMonths === 1
      ? "1"
      : draft.depositPaidMonths === 2
        ? "2"
        : draft.depositPaidMonths === 3
          ? "3"
          : draft.depositPaidCents !== undefined
            ? "other"
            : undefined;
  const setDepositChoice = (c: DepositChoice) => {
    if (c === "other") {
      setField("depositPaidMonths", undefined);
      return;
    }
    setField("depositPaidMonths", DEPOSIT_MONTHS[c]);
    setField("depositPaidCents", undefined);
  };
  // Aperçu € : seulement en HC (en CC, la conversion a lieu côté serveur).
  const depositEquivalentCents =
    !cc && draft.depositPaidMonths !== undefined && draft.initialRentCents !== undefined
      ? draft.depositPaidMonths * draft.initialRentCents
      : null;

  if (share) {
    return (
      <MoneyField
        label="Montant du dépôt de garantie versé"
        hint="Facultatif. Laissez vide si vous ne savez pas. La loi le plafonne à 1 mois de loyer hors charges (2 mois si meublé)."
        cents={draft.depositPaidCents}
        onChange={(c) => setField("depositPaidCents", c)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ChoiceField
        label="Dépôt de garantie versé"
        hint="Facultatif. La plupart des baux demandent 1 mois (2 mois si meublé). Ne répondez pas si vous ne savez pas."
        choices={DEPOSIT_CHOICES}
        value={depositChoice}
        onChange={setDepositChoice}
      />
      {depositChoice === "other" ? (
        <MoneyField
          label="Montant exact du dépôt"
          cents={draft.depositPaidCents}
          onChange={(c) => setField("depositPaidCents", c)}
        />
      ) : null}
      {depositEquivalentCents !== null ? (
        <p className="text-xs text-ink/55">Soit environ {formatEur(depositEquivalentCents)}.</p>
      ) : null}
    </div>
  );
}

/**
 * Complément de loyer (oui/non/nsp) + sous-bloc (montant, caractéristique
 * exceptionnelle, checklist 3DS) affiché seulement si `rentSupplement === "OUI"`.
 * Extrait de `RentStep`, comportement préservé (F/G coché d'office depuis le DPE).
 */
export function SupplementQ({ draft, setField }: StepProps) {
  const dpeFG = draft.dpe?.class === "F" || draft.dpe?.class === "G";
  const criteria = draft.complementCriteria ?? [];
  const toggleCriterion = (id: string) => {
    const set = new Set(criteria);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setField("complementCriteria", [...set]);
  };

  return (
    <div className="space-y-6">
      <ChoiceField
        label="Votre bail mentionne-t-il un « complément de loyer » ?"
        hint="C'est une ligne à part du loyer de base, parfois ajoutée en zone d'encadrement. Souvent contestable."
        choices={[
          { value: "OUI", label: "Oui" },
          { value: "NON", label: "Non" },
          { value: "NSP", label: "Je ne sais pas" },
        ]}
        value={draft.rentSupplement}
        onChange={(v) => setField("rentSupplement", v)}
      />
      {draft.rentSupplement === "OUI" ? (
        <>
          <MoneyField
            label="Montant du complément (par mois, si indiqué)"
            hint="Facultatif. Il est sur la même page du bail que le loyer de base."
            cents={draft.rentSupplementCents}
            onChange={(c) => setField("rentSupplementCents", c)}
          />

          {/* Caractéristiques exceptionnelles (recherche complément 2026-06-12) :
              un complément n'est licite que si le logement a un atout RARE et
              déterminant ; la preuve incombe au bailleur. Sans atout → probablement
              injustifié. TODO_COPY — libellés brouillon, [AVOCAT]. */}
          <ChoiceField
            label="Votre logement a-t-il une caractéristique vraiment exceptionnelle ?"
            hint="Par exemple : vue exceptionnelle (monument, panorama), terrasse ou très grand balcon, jardin privatif, hauteur sous plafond exceptionnelle, prestations haut de gamme rares, exposition ou luminosité exceptionnelle. Une rénovation récente ne compte pas."
            choices={[
              { value: "OUI", label: "Oui" },
              { value: "NON", label: "Non" },
              { value: "NSP", label: "Je ne sais pas" },
            ]}
            value={draft.rentSupplementExceptional}
            onChange={(v) => setField("rentSupplementExceptional", v)}
          />

          {/* Checklist 3DS (LOT 1.2) : ≥ 1 critère + bail depuis le 18/08/2022 →
              complément très probablement interdit. Référentiel TODO_VERIFIER. */}
          <fieldset className="space-y-2.5">
            <legend className="text-sm font-medium text-ink/80">
              Le logement présente-t-il l'une de ces caractéristiques ?
            </legend>
            <p className="text-xs text-ink/50">
              Cochez ce qui s'applique. Une seule suffit souvent à rendre le complément contestable.
            </p>
            {COMPLEMENT_3DS_CRITERIA.map((c) => {
              const auto = c.autoFromDpeFG === true;
              const checked = auto ? dpeFG : criteria.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                    checked ? "border-ink/40 bg-ink/[0.03]" : "border-line"
                  } ${auto ? "opacity-90" : "cursor-pointer hover:border-ink/30"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={auto}
                    onChange={auto ? undefined : () => toggleCriterion(c.id)}
                    className="mt-0.5 h-4 w-4 accent-ink"
                  />
                  <span>
                    {c.label}
                    {auto ? (
                      <span className="mt-0.5 block text-xs text-ink/45">
                        Détecté automatiquement depuis votre DPE.
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </fieldset>
        </>
      ) : null}
    </div>
  );
}
