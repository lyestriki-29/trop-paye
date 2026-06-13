import Link from "next/link";
import { redirect } from "next/navigation";
import { listDossiersForUser } from "@/lib/dossier/read";
import { Amount } from "@/components/Amount";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function EspaceHome() {
  const items = await listDossiersForUser();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Aucun dossier pour l&apos;instant</h1>
        <p className="mt-3 text-ink/60">Lancez un diagnostic gratuit pour savoir si votre loyer est trop élevé.</p>
        <div className="mt-6"><Button href="/diagnostic">Faire mon diagnostic</Button></div>
      </div>
    );
  }

  const only = items[0];
  if (items.length === 1 && only) {
    redirect(`/espace/${only.dossier.id}`);
  }

  const totalRecoverable = items.reduce((s, i) => s + (i.verdict?.totalRecoverableCents ?? 0), 0);

  return (
    <div className="mx-auto max-w-container space-y-8 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-display">Mes dossiers</h1>
        <p className="mt-2 text-ink/60">
          Trop-perçu visé au total : <Amount cents={totalRecoverable} favorable className="font-medium" />
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ dossier, verdict }) => (
          <li key={dossier.id}>
            <Link
              href={`/espace/${dossier.id}`}
              className="block rounded-card border border-line bg-paper p-5 hover:border-ink/40"
            >
              <p className="font-medium">{dossier.address_label ?? "Dossier"}</p>
              <p className="mt-1 text-sm text-ink/55">{dossier.status}</p>
              {verdict && verdict.totalRecoverableCents > 0 ? (
                <Amount cents={verdict.totalRecoverableCents} favorable className="mt-2 block text-lg font-medium" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
