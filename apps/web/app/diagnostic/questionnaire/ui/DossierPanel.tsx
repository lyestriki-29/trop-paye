"use client";

import type { ReactNode } from "react";

export interface DossierRow {
  id: string;
  /** Libellé court du champ (ex. « Pièces »). */
  label: string;
  /** Valeur résumée (ex. « 2 pièce(s) »). */
  value: string;
  /** Valeur pré-remplie (cascade DPE / barème) → marquée « à vérifier ». */
  prefilled?: boolean;
  /** Si fourni : la ligne est cliquable (rouvre la question à gauche). */
  onEdit?: () => void;
}

/**
 * Panneau « Votre dossier » : liste compacte des réponses, défilable en interne.
 * PRÉSENTATIONNEL (découplé du draft) pour être réutilisé tel quel côté verdict
 * (rows construites depuis un `DossierSnapshot`, en lecture seule). Style nb.
 */
export function DossierPanel({
  title = "Votre dossier",
  rows,
  empty = "Vos réponses s'afficheront ici au fur et à mesure.",
  footer,
}: {
  title?: string;
  rows: DossierRow[];
  empty?: string;
  footer?: ReactNode;
}): ReactNode {
  return (
    <aside className="nb-card flex h-full min-h-0 flex-col rounded-none">
      <h2 className="shrink-0 border-b-[3px] border-ink px-4 py-3 font-nb-display text-sm font-black uppercase tracking-wide text-ink">
        {title}
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {rows.length === 0 ? (
          <p className="px-1 py-2 text-sm text-ink/45">{empty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.id}>
                <DossierRowItem row={row} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {footer ? <div className="shrink-0 border-t-[3px] border-ink px-4 py-3">{footer}</div> : null}
    </aside>
  );
}

function DossierRowItem({ row }: { row: DossierRow }): ReactNode {
  const inner = (
    <>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-black uppercase tracking-wide text-ink/55">
          {row.label}
        </span>
        <span className="truncate text-sm font-medium text-ink/85">{row.value}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        {row.prefilled ? (
          <span className="border border-[#1a7a4a] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#1a7a4a]">
            à vérifier
          </span>
        ) : null}
        {row.onEdit ? (
          <span aria-hidden className="text-xs text-ink/45">
            ✏️
          </span>
        ) : null}
      </span>
    </>
  );

  const base = `nb-confirmed flex w-full items-center justify-between gap-3 rounded-none px-3 py-2 text-left${row.prefilled ? " nb-confirmed--prefill" : ""}`;

  if (!row.onEdit) {
    return <div className={base}>{inner}</div>;
  }
  return (
    <button
      type="button"
      onClick={row.onEdit}
      aria-label={`Modifier : ${row.label}`}
      className={`${base} nb-card-hover`}
    >
      {inner}
    </button>
  );
}
