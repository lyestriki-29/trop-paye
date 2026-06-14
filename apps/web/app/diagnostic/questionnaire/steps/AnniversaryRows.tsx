"use client";

import { useEffect, useState } from "react";
import { anniversariesBetween, formatEur } from "@troppaye/rules-engine";
import { frenchDate } from "@/lib/format-date";
import type { DiagnosticDraft, SetField } from "../use-diagnostic-form";
import { MoneyField } from "../fields";
import { getIrlSuggestionAction } from "@/app/diagnostic/actions";

/**
 * Historique des hausses par année anniversaire (spec questionnaire §4) :
 * une ligne par anniversaire du bail (N+1 → aujourd'hui), montant OU
 * « Pas de hausse cette année ». Les montants vivent dans `anniversaryRents`
 * (clé = date ISO) : un changement de date de bail élague d'office les
 * lignes obsolètes (recalcul des anniversaires à chaque rendu/soumission).
 */
export function AnniversaryRows({
  leaseSignedAt,
  draft,
  setField,
}: {
  leaseSignedAt: string;
  draft: DiagnosticDraft;
  setField: SetField;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const dates = anniversariesBetween(leaseSignedAt, today);
  const rents = draft.anniversaryRents ?? {};
  const noIncrease = new Set(draft.noIncreaseDates ?? []);

  // Suggestions IRL par date d'anniversaire (null = indisponible, undefined = en cours)
  const [irlSuggestions, setIrlSuggestions] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const base = draft.initialRentCents;
    const q = draft.revisionQuarter;
    if (!base || !q || dates.length === 0) return;

    let cancelled = false;
    void (async () => {
      const results: Record<string, number | null> = {};
      await Promise.all(
        dates.map(async (date) => {
          const year = Number(date.slice(0, 4));
          const res = await getIrlSuggestionAction({ baseCents: base, revisionQuarter: q, anniversaryYear: year });
          results[date] = res?.cents ?? null;
        }),
      );
      if (!cancelled) setIrlSuggestions(results);
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.initialRentCents, draft.revisionQuarter, leaseSignedAt]);

  function setAmount(date: string, cents: number | undefined) {
    const next: Record<string, number> = { ...rents };
    if (cents === undefined) delete next[date];
    else next[date] = cents;
    setField("anniversaryRents", next);
    if (noIncrease.has(date)) {
      setField("noIncreaseDates", [...noIncrease].filter((d) => d !== date));
    }
  }

  function toggleNoIncrease(date: string) {
    if (noIncrease.has(date)) {
      setField("noIncreaseDates", [...noIncrease].filter((d) => d !== date));
      return;
    }
    setField("noIncreaseDates", [...noIncrease, date]);
    const next: Record<string, number> = { ...rents };
    delete next[date];
    setField("anniversaryRents", next);
  }

  if (dates.length === 0) {
    return (
      /* TODO_COPY — bail de moins d'un an (hors copy deck §2). */
      <p className="text-sm text-ink/60">
        Votre bail a moins d&apos;un an : aucune révision annuelle n&apos;a encore pu avoir
        lieu. Passez à l&apos;étape suivante.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {dates.map((date) => {
        const none = noIncrease.has(date);
        return (
          <div key={date} className="rounded-card border border-line bg-paper p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/55">
              Anniversaire {date.slice(0, 4)} · {frenchDate(date)}
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-3">
              <div className="min-w-[180px] flex-1">
                <MoneyField
                  label="Nouveau loyer après la hausse"
                  cents={none ? undefined : rents[date]}
                  onChange={(c) => setAmount(date, c)}
                />
              </div>
              {/* TODO_COPY — libellé « Pas de hausse cette année » (spec §4, hors copy deck). */}
              <button
                type="button"
                aria-pressed={none}
                onClick={() => toggleNoIncrease(date)}
                className={`mt-1 rounded-badge border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  none
                    ? "border-ink bg-ink text-paper shadow-sm"
                    : "border-line bg-paper text-ink/70 hover:border-ink/40"
                }`}
              >
                Pas de hausse cette année
              </button>
              {/* Chip IRL (dégradable) : absent si indices manquants ou paramètres incomplets. */}
              {(() => {
                const suggestion = irlSuggestions[date];
                if (suggestion == null) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setAmount(date, suggestion)}
                    className="nb-pill mt-1 rounded-badge border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    Augmentation légale (≈&nbsp;{formatEur(suggestion)})
                  </button>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
