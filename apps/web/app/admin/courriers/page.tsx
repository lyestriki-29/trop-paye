import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PostForm } from "./PostForm";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  LETTER_J0: "Courrier initial (J0)",
  REMINDER_J21: "Relance (J+21)",
  PROPOSAL_J35: "Proposition amiable (J+35)",
  FINAL_NOTICE_J50: "Dernier avis (J+50)",
};

interface LetterPayload {
  letterBody?: string;
  landlordName?: string | null;
  landlordAddress?: string | null;
}

/**
 * File « courriers à poster » (circuit papier du pilote) : le cron a rendu le
 * courrier ; l'opérateur imprime, poste en recommandé, puis saisit ICI le n°
 * de suivi — c'est cette saisie qui horodate l'envoi et notifie le client.
 */
export default async function CourriersPage() {
  const admin = getSupabaseAdmin();
  const { data: toPost } = await admin
    .from("actions")
    .select("id, dossier_id, type, executed_at, payload")
    .eq("post_status", "TO_POST")
    .order("executed_at", { ascending: true });

  const items = (toPost ?? []).map((a) => {
    const payload = (a.payload ?? {}) as LetterPayload;
    return {
      id: a.id,
      dossierId: a.dossier_id,
      type: a.type,
      renderedAt: a.executed_at,
      letterBody: payload.letterBody ?? "(courrier non rendu)",
      landlordName: payload.landlordName ?? "—",
      landlordAddress: payload.landlordAddress ?? "—",
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">
          Courriers à poster
        </h1>
        <Link href="/admin" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          ← File de revue
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Imprimer, poster en recommandé avec AR, puis saisir le n° de suivi : la saisie
        horodate l&apos;envoi et notifie le client. Rien ne part tout seul.
      </p>

      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-card border border-line bg-paper p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold">
                  {TYPE_LABEL[item.type] ?? item.type}
                </p>
                <p className="mt-1 font-mono text-xs text-ink/55">
                  {item.landlordName} · {item.landlordAddress}
                </p>
              </div>
              <Link
                href={`/admin/dossiers/${item.dossierId}`}
                className="font-mono text-xs text-ink/55 underline underline-offset-2 hover:text-ink"
              >
                Dossier {item.dossierId.slice(0, 8)}
              </Link>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-ink/70">
                Voir le courrier (à imprimer)
              </summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-field border border-line bg-paper-2 p-4 font-mono text-xs leading-relaxed text-ink/80">
                {item.letterBody}
              </pre>
            </details>
            <div className="mt-4 border-t border-line pt-4">
              <PostForm actionId={item.id} />
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-card border border-line bg-paper-2 p-6 text-sm text-ink/55">
            Aucun courrier en attente. Les courriers rendus par la séquence J0/J21/J35/J50
            apparaissent ici.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
