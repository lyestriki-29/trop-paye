"use client";

import type { DossierStatus } from "@troppaye/shared";
import { buildTimeline, type ActionLite } from "@/lib/dossier/timeline";
import { frenchDate } from "@/lib/format-date";
import { Stamp } from "@/components/ui/Stamp";

export interface DossierTimelineProps {
  status: DossierStatus;
  actions: ActionLite[];
}

const DOT: Record<"done" | "current" | "upcoming", string> = {
  done: "bg-refund border-refund",
  current: "bg-accent border-accent",
  upcoming: "bg-paper border-line",
};

/**
 * Frise chronologique premium — DA papier.
 * Réutilise `buildTimeline` (même logique que l'ancienne Timeline).
 * Les étapes exécutées portent un tampon "POSTÉ" + date.
 */
export function DossierTimeline({ status, actions }: DossierTimelineProps) {
  const milestones = buildTimeline(status, actions);

  return (
    <ol className="relative ml-3 border-l border-line">
      {milestones.map((m) => (
        <li key={m.key} className="mb-8 ml-6">
          {/* Point de la frise */}
          <span
            className={`absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 ${DOT[m.state]}`}
            aria-hidden
          />

          <div className="flex flex-wrap items-start gap-3">
            <p
              className={`font-medium leading-tight ${
                m.state === "upcoming" ? "text-ink/40" : "text-ink"
              }`}
            >
              {m.label}
              {m.state === "current" && (
                <span className="ml-2 rounded-badge bg-accent/15 px-2 py-0.5 text-xs font-normal text-ink/70">
                  en cours
                </span>
              )}
            </p>

            {/* Tampon "POSTÉ" pour les jalons accomplis */}
            {m.state === "done" && (
              <Stamp tone="refund" rotate={-3} className="text-[10px]">
                Fait
              </Stamp>
            )}
          </div>

          {/* Événements sous le jalon */}
          {m.events && m.events.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-ink/60">
              {m.events.map((e, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{e.label}</span>
                  {e.date && (
                    <span className="font-mono tabular-nums text-xs text-ink/45">
                      {frenchDate(e.date)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
