import Link from "next/link";
import { listDossiersForUser } from "@/lib/dossier/read";
import { Amount } from "@/components/Amount";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  DIAGNOSED: "Diagnostic réalisé",
  MANDATE_PENDING: "Pièces à fournir",
  IN_REVIEW: "En cours d'étude",
  RECOVERY: "Démarche engagée",
  ESCALATED: "Escalade",
  WON: "Récupéré",
  LOST: "Clôturé sans suite",
  CLOSED: "Clôturé",
};

export default async function EspacePage() {
  const items = await listDossiersForUser();

  if (items.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-display">Votre espace</h1>
        <p className="mt-3 text-ink/70">Vous n'avez pas encore de dossier.</p>
        <Link
          href="/diagnostic"
          className="mt-6 inline-block rounded-field bg-ink px-6 py-3 font-medium text-paper hover:bg-ink/90"
        >
          Lancer un diagnostic
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-display">Vos dossiers</h1>
      <ul className="mt-6 space-y-3">
        {items.map(({ dossier, verdict }) => (
          <li key={dossier.id}>
            <Link
              href={`/espace/${dossier.id}`}
              className="flex items-center justify-between gap-4 rounded-card border border-line bg-paper p-5 hover:border-ink/40"
            >
              <div>
                <p className="font-medium">{dossier.address_label ?? "Dossier"}</p>
                <p className="mt-1 text-sm text-ink/55">
                  {STATUS_LABEL[dossier.status] ?? dossier.status}
                </p>
              </div>
              {verdict && verdict.totalRecoverableCents > 0 ? (
                <Amount cents={verdict.totalRecoverableCents} favorable className="font-medium" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
