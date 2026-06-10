import Link from "next/link";
import { notFound } from "next/navigation";
import type { DossierStatus } from "@troppaye/shared";
import { getDossierDetail } from "@/lib/dossier/read";
import { Amount } from "@/components/Amount";
import { frenchDate } from "@/lib/format-date";
import { Timeline } from "./Timeline";
import { Messages } from "./Messages";

export const dynamic = "force-dynamic";

const PIECE_LABEL: Record<string, string> = {
  bail: "Bail",
  quittance: "Quittance",
  dpe: "DPE",
  edl: "État des lieux",
  rib: "RIB",
  autre: "Autre document",
};

function nextStep(status: DossierStatus, id: string): { text: string; href?: string; cta?: string } {
  switch (status) {
    case "DIAGNOSED":
      return { text: "Signez votre mandat pour lancer la démarche.", href: `/mandat/${id}`, cta: "Signer le mandat" };
    case "MANDATE_PENDING":
      return { text: "Ajoutez vos pièces (bail + quittance) pour lancer l'étude.", href: `/mandat/${id}`, cta: "Ajouter mes pièces" };
    case "IN_REVIEW":
      return { text: "Votre dossier est en cours d'étude par nos équipes." };
    case "RECOVERY":
      return { text: "La démarche amiable est engagée auprès du bailleur." };
    case "ESCALATED":
      return { text: "Votre dossier suit une voie d'escalade." };
    case "WON":
      return { text: "Trop-perçu récupéré — bravo !" };
    case "LOST":
    case "CLOSED":
      return { text: "Ce dossier est clôturé." };
    default:
      return { text: "Diagnostic en cours." };
  }
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  const detail = await getDossierDetail(dossierId);
  if (!detail) notFound();

  const { dossier, verdict, mandate, pieces, actions, messages } = detail;
  const step = nextStep(dossier.status, dossierId);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <Link href="/espace" className="text-sm text-ink/55 hover:text-ink">
          ← Tous mes dossiers
        </Link>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display">
          {dossier.address_label ?? "Votre dossier"}
        </h1>

        {verdict && verdict.totalRecoverableCents > 0 ? (
          <div className="mt-5 inline-flex flex-wrap gap-x-10 gap-y-2 rounded-card border border-line bg-paper-2 px-5 py-4">
            <div>
              <p className="text-xs text-ink/60">Trop-perçu visé</p>
              <Amount cents={verdict.totalRecoverableCents} favorable className="text-xl font-medium" />
            </div>
            {verdict.totalFutureMonthlySavingCents > 0 ? (
              <div>
                <p className="text-xs text-ink/60">Économie à venir</p>
                <span className="text-xl">
                  <Amount cents={verdict.totalFutureMonthlySavingCents} favorable className="font-medium" />
                  <span className="font-mono text-sm text-ink/60">/mois</span>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Suivi de votre dossier</h2>
          <div className="mt-4">
            <Timeline
              status={dossier.status}
              actions={actions.map((a) => ({
                type: a.type,
                scheduled_at: a.scheduled_at,
                executed_at: a.executed_at,
              }))}
            />
          </div>
        </section>

        {pieces.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-lg font-bold">Vos pièces</h2>
            <ul className="mt-3 space-y-2">
              {pieces.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/api/pieces/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between rounded-field border border-line bg-paper px-4 py-2.5 text-sm hover:border-ink/40"
                  >
                    <span>{PIECE_LABEL[p.kind] ?? p.kind}</span>
                    <span className="text-ink/45">{p.status === "VALIDATED" ? "Validée" : "Reçue"}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Messages</h2>
          <div className="mt-3">
            <Messages
              dossierId={dossierId}
              messages={messages.map((m) => ({
                id: m.id,
                sender: m.sender,
                body: m.body,
                created_at: m.created_at,
              }))}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-card border border-ink bg-ink p-5 text-paper">
          <p className="text-xs uppercase tracking-wide text-paper/60">Prochaine étape</p>
          <p className="mt-2 text-sm">{step.text}</p>
          {step.href && step.cta ? (
            <Link
              href={step.href}
              className="mt-4 inline-block rounded-field bg-paper px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-2"
            >
              {step.cta}
            </Link>
          ) : null}
        </div>

        {mandate?.signed_at ? (
          <div className="rounded-card border border-line bg-paper p-5 text-sm">
            <p className="font-medium">Mandat signé</p>
            <p className="mt-1 text-ink/55">le {frenchDate(mandate.signed_at)}</p>
            <a
              href={`/api/mandate/${dossierId}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-refund-text underline underline-offset-2"
            >
              Voir le PDF
            </a>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
