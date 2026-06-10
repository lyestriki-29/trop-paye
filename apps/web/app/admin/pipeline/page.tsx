import Link from "next/link";
import { listPipeline } from "@/lib/admin/read";

export const dynamic = "force-dynamic";

const COLUMNS: { status: string; label: string }[] = [
  { status: "IN_REVIEW", label: "En étude" },
  { status: "RECOVERY", label: "Recouvrement" },
  { status: "ESCALATED", label: "Escalade" },
  { status: "WON", label: "Gagné" },
  { status: "LOST", label: "Perdu" },
  { status: "CLOSED", label: "Clôturé" },
];

export default async function PipelinePage() {
  const all = await listPipeline();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Pipeline</h1>
        <Link href="/admin" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          ← File de revue
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = all.filter((d) => d.status === col.status);
          return (
            <section key={col.status} className="rounded-card border border-line bg-paper p-4">
              <h2 className="flex items-center justify-between text-sm font-bold">
                {col.label}
                <span className="font-mono tabular text-ink/40">{items.length}</span>
              </h2>
              <ul className="mt-3 space-y-2">
                {items.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/admin/dossiers/${d.id}`}
                      className="block rounded-field border border-line bg-paper-2 px-3 py-2 text-sm hover:border-ink/40"
                    >
                      <span className="line-clamp-1">{d.address_label ?? "Dossier"}</span>
                      {d.recovery_state !== "SCHEDULED" ? (
                        <span className="mt-1 block text-xs text-stamp">
                          {d.recovery_state === "PAUSED" ? "en pause" : "verrouillé"}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? <li className="text-xs text-ink/40">—</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
