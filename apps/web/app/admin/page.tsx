import Link from "next/link";
import { listDossiersForReview } from "@/lib/admin/read";
import { Amount } from "@/components/Amount";
import { CONFIDENCE_LABEL } from "@troppaye/rules-engine";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const items = await listDossiersForReview();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">File de revue</h1>
        <Link href="/admin/pipeline" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          Voir le pipeline →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-ink/55">Aucun dossier en attente d'étude.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/dossiers/${d.id}`}
                className="flex items-center justify-between gap-4 rounded-card border border-line bg-paper p-5 hover:border-ink/40"
              >
                <div>
                  <p className="font-medium">{d.address_label ?? "Dossier"}</p>
                  <p className="mt-1 text-sm text-ink/55">
                    {d.verdict ? `${d.verdict.outcome} · ${CONFIDENCE_LABEL[d.verdict.confidence]}` : "—"}
                    {d.verdict?.confidence === "LOW" ? (
                      <span className="ml-2 rounded-badge bg-stamp/10 px-2 py-0.5 text-xs text-stamp">
                        validation bloquée
                      </span>
                    ) : null}
                  </p>
                </div>
                {d.verdict ? (
                  <Amount cents={d.verdict.totalRecoverableCents} favorable className="font-medium" />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
