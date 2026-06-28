import Link from "next/link";
import {
  listDossiersForReview,
  listPendingCallbacks,
  listUnansweredThreads,
} from "@/lib/admin/read";
import { getLeadsQueue } from "@/lib/admin/leads-queue";
import { Amount } from "@/components/Amount";
import { frenchDate } from "@/lib/format-date";
import { CONFIDENCE_LABEL } from "@troppaye/rules-engine";

export const dynamic = "force-dynamic";

/**
 * Tableau de bord d'accueil du back-office : centralise en un coup d'œil les
 * contacts entrants (leads + demandes de rappel), les messages en attente de
 * réponse et la file de revue. Remplace l'ancienne page « File de revue » seule,
 * qui masquait tout dossier pas encore en étude (retour Lyes 2026-06-28).
 */
export default async function AdminHome() {
  const [leads, callbacks, review, threads] = await Promise.all([
    getLeadsQueue(),
    listPendingCallbacks(),
    listDossiersForReview(),
    listUnansweredThreads(),
  ]);

  // Flux unifié des contacts entrants, du plus récent au plus ancien.
  const contacts = [
    ...leads.map((l) => ({
      key: `lead-${l.id}`,
      kind: "Lead",
      dossierId: l.id,
      title: l.address,
      detail: l.email,
      at: l.since,
    })),
    ...callbacks.map((c) => ({
      key: `rappel-${c.id}`,
      kind: "Rappel",
      dossierId: c.dossier_id,
      title: c.subject,
      detail: c.phone,
      at: c.created_at,
    })),
  ]
    .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""))
    .slice(0, 8);

  const kpis = [
    { label: "Leads à recontacter", value: leads.length, href: "/admin/funnel" },
    { label: "Rappels en attente", value: callbacks.length, href: "/admin/rappels" },
    { label: "Messages en attente", value: threads.length, href: null },
    { label: "Dossiers à étudier", value: review.length, href: "/admin/pipeline" },
  ];

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Tableau de bord</h1>

      <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-paper px-5 py-4">
            <dd className="tabular font-display text-3xl font-extrabold">{k.value}</dd>
            <dt className="mt-1 text-xs text-ink/55">
              {k.href ? (
                <Link href={k.href} className="underline-offset-2 hover:underline">
                  {k.label} →
                </Link>
              ) : (
                k.label
              )}
            </dt>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="font-display text-lg font-bold">Derniers contacts</h2>
        <p className="mt-1 text-sm text-ink/55">
          Emails capturés et demandes de rappel, du plus récent au plus ancien.
        </p>
        <ul className="mt-3 space-y-2">
          {contacts.map((c) => (
            <li
              key={c.key}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card border border-line bg-paper px-4 py-3 text-sm"
            >
              <span className="rounded-badge bg-accent/40 px-2 py-0.5 font-mono text-xs">{c.kind}</span>
              <span className="tabular font-mono text-xs text-ink/45">{c.at ? frenchDate(c.at) : "?"}</span>
              <Link
                href={`/admin/dossiers/${c.dossierId}`}
                className="font-medium underline-offset-2 hover:underline"
              >
                {c.title}
              </Link>
              {c.detail ? <span className="font-mono text-xs text-refund-text">{c.detail}</span> : null}
            </li>
          ))}
          {contacts.length === 0 ? (
            <li className="text-sm text-ink/50">Aucun contact pour l&apos;instant.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold">Messages en attente de réponse</h2>
        <p className="mt-1 text-sm text-ink/55">Dossiers où le client a écrit en dernier.</p>
        <ul className="mt-3 space-y-2">
          {threads.map((t) => (
            <li key={t.dossierId} className="rounded-card border border-line bg-paper px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link
                  href={`/admin/dossiers/${t.dossierId}`}
                  className="font-medium underline-offset-2 hover:underline"
                >
                  {t.address}
                </Link>
                <span className="tabular font-mono text-xs text-ink/45">{frenchDate(t.lastAt)}</span>
              </div>
              <p className="mt-1 truncate text-ink/70">{t.lastBody}</p>
            </li>
          ))}
          {threads.length === 0 ? (
            <li className="text-sm text-ink/50">Aucun message en attente.</li>
          ) : null}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">File de revue</h2>
          <Link
            href="/admin/pipeline"
            className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink"
          >
            Voir le pipeline →
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink/55">
          Dossiers en attente d&apos;étude, du plus récent au plus ancien.
        </p>
        <ul className="mt-3 space-y-3">
          {review.slice(0, 6).map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/dossiers/${d.id}`}
                className="flex items-center justify-between gap-4 rounded-card border border-line bg-paper p-5 hover:border-ink/40"
              >
                <div>
                  <p className="font-medium">{d.address_label ?? "Dossier"}</p>
                  <p className="mt-1 text-sm text-ink/55">
                    {d.verdict ? `${d.verdict.outcome} · ${CONFIDENCE_LABEL[d.verdict.confidence]}` : "—"}
                  </p>
                </div>
                {d.verdict ? (
                  <Amount cents={d.verdict.totalRecoverableCents} favorable className="font-medium" />
                ) : null}
              </Link>
            </li>
          ))}
          {review.length === 0 ? (
            <li className="text-ink/55">Aucun dossier en attente d&apos;étude.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
