import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { brand } from "@troppaye/shared";
import { requireAuthPage } from "@/lib/auth/guards";
import { claimDossierForUser } from "@/lib/dossier/claim";
import { getDossierDetail } from "@/lib/dossier/read";
import { env } from "@/lib/env";
import { trackEvent } from "@/lib/track";
import { Logo } from "@/components/brand/Logo";
import { Confirmation } from "./Confirmation";
import { MandateForm } from "./MandateForm";
import { PiecesUpload } from "./PiecesUpload";
import { Waitlist } from "./Waitlist";

export const dynamic = "force-dynamic";

export default async function MandatePage({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  const { user } = await requireAuthPage(`/mandat/${dossierId}`);

  // Rattache le dossier anonyme au compte (idempotent ; refus si possédé par un autre).
  if ((await claimDossierForUser(dossierId, user.id)) === "forbidden") notFound();

  const detail = await getDossierDetail(dossierId);
  if (!detail) notFound();

  const { dossier, verdict, pieces } = detail;
  const missing = [...new Set((verdict?.results ?? []).flatMap((r) => r.missingData ?? []))];

  // Mesure pilote : un passage sur l'écran liste d'attente = un lead chaud à
  // recontacter. after() : ne retarde pas le rendu.
  if (dossier.status === "DIAGNOSED" && !env.MANDATE_ENABLED) {
    after(() => trackEvent("waitlist_rejointe", { dossierId }));
  }
  /** Référence courte : 8 premiers caractères (comme le PDF de mandat, actions.ts),
      préfixe « TP- » de la grammaire documentaire (charte §1, QuittanceCard). */
  const dossierRef = `TP-${dossierId.slice(0, 8).toUpperCase()}`;

  return (
    <>
      {/* Chrome tunnel allégé : logotype + référence en mono (grammaire documentaire §1). */}
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label={`${brand.name} — accueil`}>
            <Logo className="text-xl" />
          </Link>
          {/* TODO_COPY — libellé de référence hors deck (en-tête type quittance). */}
          <span className="tabular font-mono text-[11px] uppercase tracking-widest text-ink/55">
            Réf. dossier {dossierRef}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 pb-16 sm:pb-20">
        {dossier.status === "DIAGNOSED" ? (
          env.MANDATE_ENABLED ? (
            <MandateForm
              dossierId={dossierId}
              dossierRef={dossierRef}
              addressLabel={dossier.address_label ?? ""}
              recoverableCents={verdict?.totalRecoverableCents ?? 0}
            />
          ) : (
            // Palier 2 fermé : liste d'attente pilote (cf. Waitlist.tsx).
            <Waitlist dossierRef={dossierRef} />
          )
        ) : dossier.status === "MANDATE_PENDING" ? (
          <>
            <PiecesUpload
              dossierId={dossierId}
              pieces={pieces.map((p) => ({
                id: p.id,
                kind: p.kind,
                status: p.status,
                reason: p.reason,
              }))}
              missingData={missing}
            />
          </>
        ) : (
          <>
            <Confirmation dossierId={dossierId} dossierRef={dossierRef} status={dossier.status} />
          </>
        )}
      </main>
    </>
  );
}
