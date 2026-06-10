"use client";

import type { DpeResult } from "@/lib/providers/dpe";
import { dpeDescriptorParts } from "@/lib/diagnostic/dpe-label";
import { frenchDate } from "@/lib/format-date";

/**
 * États de la recherche DPE (plan P2 Task 4) : confirmation des candidats
 * (copy deck §2), échec fournisseur (DISTINCT du deck) ou DPE introuvable (deck).
 */
export function DpeSearchResults({
  results,
  providerDown,
  searched,
  loading,
  onPick,
  onDismiss,
}: {
  results: DpeResult[];
  providerDown: boolean;
  searched: boolean;
  loading: boolean;
  onPick: (d: DpeResult) => void;
  onDismiss: () => void;
}) {
  if (results.length > 0) {
    return (
      <div className="space-y-3">
        {/* Copy deck §2 — confirmation DPE (titre, carte, boutons mot pour mot). */}
        <h2 className="font-display text-lg font-bold tracking-display">
          Est-ce bien votre logement ?
        </h2>
        <ul className="space-y-2">
          {results.map((d, i) => (
            <li key={d.numero || `dpe-${i}-${d.date}-${d.class}`}>
              <button
                type="button"
                onClick={() => onPick(d)}
                className="flex w-full items-center justify-between gap-4 rounded-card border border-line bg-paper px-4 py-3.5 text-left text-sm transition hover:border-ink/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                {/* Libellé descriptif (spec questionnaire §1) : distinguer les logements
                    d'une même adresse — champs absents omis. */}
                <span>
                  Classe <strong>{d.class}</strong>
                  {dpeDescriptorParts(d).map((p) => (
                    <span key={p}> · {p}</span>
                  ))}{" "}
                  · établi le {frenchDate(d.date)}
                </span>
                <span className="shrink-0 font-medium text-refund-text">C&apos;est bien lui</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-ink/55 underline-offset-2 hover:underline"
        >
          Ce n&apos;est pas lui
        </button>
      </div>
    );
  }

  if (providerDown) {
    return (
      /* TODO_COPY — échec fournisseur ADEME, message DISTINCT du « DPE introuvable » du deck. */
      <div role="status" className="rounded-card border-l-4 border-accent bg-paper-2 px-4 py-3">
        <p className="text-sm font-medium text-ink">
          La recherche de DPE est momentanément indisponible.
        </p>
        <p className="mt-0.5 text-sm text-ink/60">
          Continuez sans DPE ou saisissez la classe ci-dessous — le diagnostic reste possible.
        </p>
      </div>
    );
  }

  if (searched && !loading) {
    return (
      <div className="rounded-card border border-line bg-paper-2 px-4 py-4">
        {/* Copy deck §2 — DPE introuvable (titre + texte mot pour mot). */}
        <p className="font-medium text-ink">Nous n&apos;avons pas trouvé votre DPE</p>
        <p className="mt-1 text-sm text-ink/60">
          Son numéro à 13 caractères figure sur votre bail ou sur l&apos;annonce de location.
        </p>
      </div>
    );
  }

  return null;
}
