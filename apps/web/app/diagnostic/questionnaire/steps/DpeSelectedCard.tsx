"use client";

import { Button } from "@/components/ui/Button";
import { QuittanceCard, type QuittanceRow } from "@/components/ui/QuittanceCard";
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
  if (dpe.surfaceM2 !== undefined) {
    rows.push({ label: "Surface habitable", text: `${dpe.surfaceM2} m²` });
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
