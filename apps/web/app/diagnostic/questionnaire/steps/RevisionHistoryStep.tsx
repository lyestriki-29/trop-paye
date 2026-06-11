"use client";

import { Button } from "@/components/ui/Button";
import type { StepProps } from "../use-diagnostic-form";
import { revisionsEditorMode } from "../use-diagnostic-form";
import { DateField, MoneyField } from "../fields";
import { AnniversaryRows } from "./AnniversaryRows";

/** Éditeur libre historique (repli sans date de bail, ou cas atypique — spec §4). */
function FreeRows({ draft, setField }: StepProps) {
  const rows = draft.revisions;

  function update(i: number, patch: Partial<{ date: string; rentCents: number }>) {
    setField(
      "revisions",
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }

  return (
    <div className="space-y-5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            <DateField
              label="Date de la hausse"
              value={r.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(v) => update(i, { date: v })}
            />
          </div>
          <div className="flex-1">
            <MoneyField
              label="Nouveau loyer"
              cents={r.rentCents || undefined}
              onChange={(c) => update(i, { rentCents: c ?? 0 })}
            />
          </div>
          <button
            type="button"
            onClick={() => setField("revisions", rows.filter((_, idx) => idx !== i))}
            aria-label="Retirer cette ligne"
            className="mt-2 rounded-badge border border-line p-2.5 text-ink/50 transition hover:border-stamp hover:text-stamp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Copy deck §2 — bouton de l'étape augmentations, mot pour mot. */}
      <Button
        variant="ghost"
        onClick={() => setField("revisions", [...rows, { date: "", rentCents: 0 }])}
      >
        + Ajouter une augmentation
      </Button>
    </div>
  );
}

export function RevisionHistoryStep({ draft, setField, goNext }: StepProps) {
  const mode = revisionsEditorMode(draft);
  // Bail < 1 an : mode FREE forcé par revisionsEditorMode — message dédié,
  // éditeur libre directement utilisable (retour Lyes 2026-06-11).
  const bailTropRecent = mode === "FREE" && Boolean(draft.leaseSignedAt) && !draft.revisionsMode;

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/60">
        Facultatif. Si vous connaissez les hausses de votre loyer, ajoutez-les : le calcul
        sera plus précis. Sinon, passez : nous estimerons à partir des loyers de départ et
        actuel.
      </p>

      {/* Friction réduite (retour Lyes 2026-06-11) : sortie en un clic, l'estimation
          se fait sur les loyers de départ/actuel (confiance ajustée par le moteur). */}
      <Button
        variant="ghost"
        onClick={() => {
          setField("revisions", []);
          goNext?.();
        }}
      >
        Je ne sais pas, passer cette étape →
      </Button>
      {draft.rentInputMode === "CC" ? (
        /* TODO_COPY — rappel du mode CC sur les hausses (hors copy deck §2). */
        <p className="text-xs text-ink/55">
          Indiquez des montants charges comprises, comme vos loyers.
        </p>
      ) : null}
      {bailTropRecent ? (
        /* TODO_COPY — bail de moins d'un an (hors copy deck §2). */
        <p className="rounded-card border-l-4 border-accent bg-paper-2 px-4 py-3 text-sm text-ink/70">
          Votre bail a moins d&apos;un an : aucune révision annuelle n&apos;a normalement pu
          avoir lieu. Si votre loyer a quand même augmenté, ajoutez la hausse ci-dessous.
        </p>
      ) : null}

      {mode === "ANNIVERSARY" && draft.leaseSignedAt ? (
        <>
          <AnniversaryRows leaseSignedAt={draft.leaseSignedAt} draft={draft} setField={setField} />
          {/* Cas atypique (renouvellement, avenant…) → mode libre (spec §4). */}
          <button
            type="button"
            onClick={() => setField("revisionsMode", "FREE")}
            className="text-sm text-ink/55 underline-offset-2 hover:underline"
          >
            Mes hausses ne suivent pas les anniversaires — saisir librement
          </button>
        </>
      ) : (
        <>
          <FreeRows draft={draft} setField={setField} />
          {draft.revisionsMode === "FREE" && !bailTropRecent ? (
            <button
              type="button"
              onClick={() => setField("revisionsMode", "ANNIVERSARY")}
              className="block text-sm text-ink/55 underline-offset-2 hover:underline"
            >
              Revenir aux années anniversaire de mon bail
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Mode anniversaire : toujours valide (une ligne est renseignée, marquée « pas de
 * hausse », ou laissée vide). Mode libre : bloque uniquement les lignes
 * partiellement remplies (date sans montant, ou l'inverse).
 */
export const revisionHistoryValid = (d: StepProps["draft"]): boolean => {
  if (revisionsEditorMode(d) === "ANNIVERSARY") return true;
  return d.revisions.every((r) => {
    const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(r.date);
    const hasRent = r.rentCents > 0;
    return (hasDate && hasRent) || (!hasDate && !hasRent);
  });
};
