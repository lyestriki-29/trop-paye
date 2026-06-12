"use client";

import { estimateMonthlyChargesCents, formatEur } from "@troppaye/rules-engine";
import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, MoneyField } from "../fields";
import { COMPLEMENT_3DS_CRITERIA } from "@/lib/diagnostic/complement-3ds";

type DepositChoice = "1" | "2" | "3" | "other";
const DEPOSIT_MONTHS: Record<Exclude<DepositChoice, "other">, 1 | 2 | 3> = { "1": 1, "2": 2, "3": 3 };
const DEPOSIT_CHOICES: { value: DepositChoice; label: string }[] = [
  { value: "1", label: "1 mois" },
  { value: "2", label: "2 mois" },
  { value: "3", label: "3 mois" },
  { value: "other", label: "Autre montant" },
];

/**
 * Étape loyer (spec questionnaire §2) : les deux montants partagent le même mode
 * HC / charges comprises ; en CC, les charges sont pré-remplies au barème
 * (2,50 €/m²/mois, TODO_VERIFIER) et la conversion HC a lieu côté serveur.
 * NB : le titre d'étape du copy deck reste « Quel est votre loyer hors charges ? »
 * — TODO_COPY : variante CC à valider (cf. questions pour Lyes).
 */
export function RentStep({ draft, setField }: StepProps) {
  const mode = draft.rentInputMode ?? "HC";
  const cc = mode === "CC";
  const suffix = cc ? "charges comprises" : "hors charges";
  // Coloc (LOT 1.3) : en mode « ma part », les montants saisis sont reconstitués
  // en total (× nombre de colocataires) côté serveur. Le verdict reste sur le total.
  const share = draft.isShared === true && (draft.rentBasis ?? "TOTAL") === "SHARE";
  // Critères 3DS (LOT 1.2) : DPE F/G coché d'office depuis l'étape 3, non décochable.
  const dpeFG = draft.dpe?.class === "F" || draft.dpe?.class === "G";
  const criteria = draft.complementCriteria ?? [];
  const toggleCriterion = (id: string) => {
    const set = new Set(criteria);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setField("complementCriteria", [...set]);
  };

  const chargesTooHigh =
    cc &&
    draft.chargesCents !== undefined &&
    ((draft.initialRentCents !== undefined && draft.chargesCents >= draft.initialRentCents) ||
      (draft.currentRentCents !== undefined && draft.chargesCents >= draft.currentRentCents));

  // Dépôt en mois (boutons) : dérivé du draft. En coloc à la part, on garde le
  // montant exact (le loyer reconstitué est un total, l'équivalent en mois trompe).
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
        value={mode}
        onChange={(m) => {
          setField("rentInputMode", m);
          // Pré-remplissage au barème, une seule fois (spec §2) — modifiable ensuite.
          if (m === "CC" && draft.chargesCents === undefined && draft.surfaceM2) {
            setField("chargesCents", estimateMonthlyChargesCents(draft.surfaceM2));
            setField("chargesEstimated", true);
          }
        }}
      />

      <MoneyField
        label={`${share ? "Votre part — loyer de départ" : "Loyer mensuel de départ"} (${suffix})`}
        hint="Le loyer inscrit au bail, à la signature."
        cents={draft.initialRentCents}
        onChange={(c) => setField("initialRentCents", c)}
      />
      <MoneyField
        label={`${share ? "Votre part — loyer actuel" : "Loyer mensuel actuel"} (${suffix})`}
        hint={cc ? "Ce que vous payez aujourd'hui, charges comprises." : "Ce que vous payez aujourd'hui, hors charges."}
        cents={draft.currentRentCents}
        onChange={(c) => setField("currentRentCents", c)}
      />

      {cc ? (
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
      ) : null}

      {/* Dépôt de garantie versé (LOT 1, règle DEPOSIT_CAP) : en mois (boutons) hors
          coloc à la part, sinon montant exact. Facultatif — rien = « je ne sais pas ».
          TODO_COPY — libellés brouillon, hors copy deck. */}
      {share ? (
        <MoneyField
          label="Montant du dépôt de garantie versé"
          hint="Facultatif. Laissez vide si vous ne savez pas. La loi le plafonne à 1 mois de loyer hors charges (2 mois si meublé)."
          cents={draft.depositPaidCents}
          onChange={(c) => setField("depositPaidCents", c)}
        />
      ) : (
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
      )}

      {/* Complément de loyer (retour Lyes 2026-06-11) : déclaratif, alimente un
          signal d'orientation du moteur (jamais un chiffrage automatique).
          TODO_COPY — libellés brouillon, hors copy deck. */}
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

export const rentValid = (d: StepProps["draft"]): boolean => {
  if (
    d.initialRentCents === undefined ||
    d.initialRentCents <= 0 ||
    d.currentRentCents === undefined ||
    d.currentRentCents <= 0
  ) {
    return false;
  }
  if ((d.rentInputMode ?? "HC") !== "CC") return true;
  // Mode CC : charges requises et strictement inférieures aux deux montants (spec §2).
  return (
    d.chargesCents !== undefined &&
    d.chargesCents >= 0 &&
    d.chargesCents < d.initialRentCents &&
    d.chargesCents < d.currentRentCents
  );
};
