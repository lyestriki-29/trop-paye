import { Button } from "@/components/ui/Button";
import type { StudyChecklist as StudyChecklistData } from "@/lib/espace/study-checklist";

export interface StudyChecklistProps {
  data: StudyChecklistData;
  piecesHref: string;
}

const STATE_DOT: Record<"missing" | "received" | "validated", string> = {
  missing: "border-2 border-line bg-paper",
  received: "bg-accent border-accent",
  validated: "bg-refund border-refund",
};

const STATE_LABEL: Record<"missing" | "received" | "validated", string> = {
  missing: "Manquante",
  received: "Reçue",
  validated: "Validée",
};

/**
 * Checklist des pièces pour lancer l'étude — icônes d'état par pièce.
 * Server Component.
 */
export function StudyChecklist({ data, piecesHref }: StudyChecklistProps) {
  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-display text-ink/70">
        Pièces justificatives
      </h3>

      <ul className="mt-4 space-y-3">
        {data.items.map((item) => (
          <li key={item.kind} className="flex items-center gap-3 text-sm">
            {/* Indicateur d'état */}
            <span
              className={`relative h-5 w-5 shrink-0 rounded-full border ${STATE_DOT[item.state]}`}
              aria-label={STATE_LABEL[item.state]}
            >
              {item.state === "validated" && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-paper"
                  aria-hidden
                >
                  ✓
                </span>
              )}
            </span>

            <span className={item.state === "missing" ? "text-ink/50" : "text-ink"}>
              {item.label}
              {item.required && item.state === "missing" && (
                <span className="ml-1 text-stamp text-xs">(obligatoire)</span>
              )}
            </span>

            <span className="ml-auto text-xs text-ink/45">{STATE_LABEL[item.state]}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        {data.launchable ? (
          <p className="text-sm font-medium text-refund-text">
            ✓ Étude lançable : toutes les pièces sont présentes.
          </p>
        ) : (
          <Button href={piecesHref} variant="ghost" size="md">
            Compléter mes pièces
          </Button>
        )}
      </div>
    </div>
  );
}
