import type { DossierStatus } from "@troppaye/shared";
import { buildTimeline, type ActionLite } from "@/lib/dossier/timeline";
import { frenchDate } from "@/lib/format-date";

const DOT: Record<"done" | "current" | "upcoming", string> = {
  done: "bg-refund border-refund",
  current: "bg-ink border-ink",
  upcoming: "bg-paper border-line",
};

export function Timeline({ status, actions }: { status: DossierStatus; actions: ActionLite[] }) {
  const milestones = buildTimeline(status, actions);

  return (
    <ol className="relative ml-3 border-l border-line">
      {milestones.map((m) => (
        <li key={m.key} className="mb-6 ml-6">
          <span
            className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 ${DOT[m.state]}`}
            aria-hidden
          />
          <p
            className={`font-medium ${
              m.state === "upcoming" ? "text-ink/45" : "text-ink"
            }`}
          >
            {m.label}
            {m.state === "current" ? (
              <span className="ml-2 rounded-badge bg-paper-2 px-2 py-0.5 text-xs text-ink/60">
                en cours
              </span>
            ) : null}
          </p>
          {m.events && m.events.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-ink/60">
              {m.events.map((e, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{e.label}</span>
                  {e.date ? <span className="font-mono tabular text-ink/45">{frenchDate(e.date)}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
