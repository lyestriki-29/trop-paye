import Link from "next/link";
import { notFound } from "next/navigation";
import { getDossierAdmin } from "@/lib/admin/read";
import { Amount } from "@/components/Amount";
import { RuleCard } from "@/app/diagnostic/[verdictId]/RuleCard";
import { frenchDate } from "@/lib/format-date";
import { AdminActions } from "./AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getDossierAdmin(id);
  if (!detail) notFound();
  const { dossier, verdict, mandate, proof, pieces, actions, messages, funds } = detail;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <Link href="/admin" className="text-sm text-ink/55 hover:text-ink">
          ← File de revue
        </Link>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display">
          {dossier.address_label ?? "Dossier"}
        </h1>
        <p className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-badge bg-paper-2 px-2 py-0.5">{dossier.status}</span>
          {dossier.recovery_state !== "SCHEDULED" ? (
            <span className="rounded-badge bg-stamp/10 px-2 py-0.5 text-stamp">{dossier.recovery_state}</span>
          ) : null}
        </p>

        {verdict ? (
          <section className="mt-6">
            <div className="flex flex-wrap gap-x-10 gap-y-2">
              <div>
                <p className="text-xs text-ink/60">Récupérable</p>
                <Amount cents={verdict.totalRecoverableCents} favorable className="text-xl font-medium" />
              </div>
              <div>
                <p className="text-xs text-ink/60">Confiance</p>
                <p className={`font-medium ${verdict.confidence === "LOW" ? "text-stamp" : ""}`}>
                  {verdict.confidence}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {verdict.results.map((r) => (
                <RuleCard key={r.ruleId} rule={r} />
              ))}
            </div>
          </section>
        ) : null}

        {proof ? (
          <section className="mt-6 rounded-card border border-line bg-paper p-4 text-sm">
            <h2 className="font-bold">Preuve de signature</h2>
            <dl className="mt-2 space-y-1 text-ink/70">
              <div className="flex justify-between gap-4">
                <dt>Signataire</dt>
                <dd className="font-medium">{proof.signer_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Consenti le</dt>
                <dd>{frenchDate(proof.consented_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Empreinte doc.</dt>
                <dd className="truncate font-mono text-xs">{proof.document_hash.slice(0, 24)}…</dd>
              </div>
            </dl>
            {mandate?.pdf_url ? (
              <a
                href={`/api/mandate/${id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-refund-text underline underline-offset-2"
              >
                Voir le mandat
              </a>
            ) : null}
          </section>
        ) : null}

        {pieces.length > 0 ? (
          <section className="mt-6">
            <h2 className="font-display font-bold">Pièces ({pieces.length})</h2>
            <ul className="mt-2 space-y-1.5">
              {pieces.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/api/pieces/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between rounded-field border border-line bg-paper px-3 py-2 text-sm hover:border-ink/40"
                  >
                    <span>{p.kind}</span>
                    <span className="text-ink/45">{p.status}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {actions.length > 0 ? (
          <section className="mt-6 text-sm">
            <h2 className="font-display font-bold">Séquence</h2>
            <ul className="mt-2 space-y-1">
              {actions.map((a) => (
                <li key={a.id} className="flex justify-between gap-4 border-b border-line py-1.5">
                  <span>{a.type}</span>
                  <span className="font-mono tabular text-xs text-ink/50">
                    {a.executed_at
                      ? `exécuté ${frenchDate(a.executed_at)}`
                      : a.scheduled_at
                        ? `prévu ${frenchDate(a.scheduled_at)}`
                        : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {funds.length > 0 ? (
          <section className="mt-6 text-sm">
            <h2 className="font-display font-bold">Mouvements de fonds</h2>
            <ul className="mt-2 space-y-1">
              {funds.map((f) => (
                <li key={f.id} className="flex justify-between gap-4 border-b border-line py-1.5">
                  <span>{f.direction}</span>
                  <Amount cents={f.amount_cents} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {messages.length > 0 ? (
          <section className="mt-6 text-sm">
            <h2 className="font-display font-bold">Messages</h2>
            <ul className="mt-2 space-y-2">
              {messages.map((m) => (
                <li key={m.id} className="rounded-field border border-line bg-paper px-3 py-2">
                  <p className="text-xs text-ink/45">{m.sender}</p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside>
        <AdminActions
          dossierId={id}
          status={dossier.status}
          recoveryState={dossier.recovery_state}
          confidenceLow={verdict?.confidence === "LOW"}
          recoverableCents={verdict?.totalRecoverableCents ?? 0}
        />
      </aside>
    </div>
  );
}
