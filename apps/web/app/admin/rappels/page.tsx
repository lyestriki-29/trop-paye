import Link from "next/link";
import { listPendingCallbacks } from "@/lib/admin/read";
import { slotLabel } from "@/lib/espace/callback";
import { frenchDate } from "@/lib/format-date";
import { MarkDoneButton } from "./MarkDoneButton";

export const dynamic = "force-dynamic";

export default async function RappelsPage() {
  const items = await listPendingCallbacks();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Rappels à passer</h1>
        <Link href="/admin" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          ← File de revue
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Demandes de rappel des clients. Appeler au numéro indiqué, puis marquer comme traité.
      </p>

      <ul className="mt-6 space-y-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-card border border-line bg-paper p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold">{c.subject}</p>
                <p className="mt-1 text-sm text-ink/70">
                  <a href={`tel:${c.phone}`} className="font-mono text-refund-text underline underline-offset-2">
                    {c.phone}
                  </a>
                  {" · "}
                  {slotLabel(c.preferred_slot)} · {frenchDate(c.created_at)}
                </p>
              </div>
              <Link
                href={`/admin/dossiers/${c.dossier_id}`}
                className="font-mono text-xs text-ink/55 underline underline-offset-2 hover:text-ink"
              >
                Dossier {c.dossier_id.slice(0, 8)}
              </Link>
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <MarkDoneButton id={c.id} />
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-card border border-line bg-paper-2 p-6 text-sm text-ink/55">
            Aucun rappel en attente.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
