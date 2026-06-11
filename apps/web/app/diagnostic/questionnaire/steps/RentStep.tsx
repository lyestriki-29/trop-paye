"use client";

import { estimateMonthlyChargesCents } from "@troppaye/rules-engine";
import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, MoneyField } from "../fields";

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

  const chargesTooHigh =
    cc &&
    draft.chargesCents !== undefined &&
    ((draft.initialRentCents !== undefined && draft.chargesCents >= draft.initialRentCents) ||
      (draft.currentRentCents !== undefined && draft.chargesCents >= draft.currentRentCents));

  return (
    <div className="space-y-6">
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
        label={`Loyer mensuel de départ (${suffix})`}
        hint="Le loyer inscrit au bail, à la signature."
        cents={draft.initialRentCents}
        onChange={(c) => setField("initialRentCents", c)}
      />
      <MoneyField
        label={`Loyer mensuel actuel (${suffix})`}
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
