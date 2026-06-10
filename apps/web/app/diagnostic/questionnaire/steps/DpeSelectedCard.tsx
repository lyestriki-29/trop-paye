"use client";

import { Button } from "@/components/ui/Button";
import { QuittanceCard, type QuittanceRow } from "@/components/ui/QuittanceCard";
import { dpeDescriptorParts } from "@/lib/diagnostic/dpe-label";
import { frenchDate } from "@/lib/format-date";
import type { DpeDraft } from "../use-diagnostic-form";

/**
 * Carte de confirmation après le choix d'un DPE ADEME (spec questionnaire §1) :
 * remplace la liste et le bouton de recherche, « Changer » efface la sélection
 * et rouvre la recherche. Grammaire carte-quittance v2 (la preuve = le document).
 */
export function DpeSelectedCard({ dpe, onClear }: { dpe: DpeDraft; onClear: () => void }) {
  const rows: QuittanceRow[] = [
    // La classe est LA donnée du gel → ligne surlignée `accent` (signature charte §1).
    { label: "Classe énergie", text: dpe.class, highlight: true },
    { label: "Établi le", text: frenchDate(dpe.date) },
  ];
  // Libellé fin (spec questionnaire §1) : type/étage/bât./surface/résidence, absents omis.
  const descriptor = dpeDescriptorParts(dpe).join(" · ");
  if (descriptor) rows.push({ label: "Logement", text: descriptor });
  if (dpe.anneeConstruction !== undefined) {
    rows.push({ label: "Construit en", text: String(dpe.anneeConstruction) });
  }

  return (
    <QuittanceCard
      /* TODO_COPY — libellés de la carte « DPE sélectionné » (hors copy deck §2). */
      reference={dpe.numero ? `DPE n° ${dpe.numero}` : "DPE"}
      kind="DPE sélectionné"
      rows={rows}
      className="shadow-md"
    >
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-ink/55">Source : Observatoire DPE de l&apos;ADEME.</p>
        {/* TODO_COPY — « Changer » hors copy deck §2. */}
        <Button variant="ghost" onClick={onClear}>
          Changer
        </Button>
      </div>
    </QuittanceCard>
  );
}
