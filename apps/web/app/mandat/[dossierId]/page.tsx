import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthPage } from "@/lib/auth/guards";
import { claimDossierForUser } from "@/lib/dossier/claim";
import { getDossierDetail } from "@/lib/dossier/read";
import { Logo } from "@/components/brand/Logo";
import { MandateForm } from "./MandateForm";
import { PiecesUpload } from "./PiecesUpload";

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

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo className="text-xl" />
      </Link>

      {dossier.status === "DIAGNOSED" ? (
        <MandateForm
          dossierId={dossierId}
          addressLabel={dossier.address_label ?? ""}
          recoverableCents={verdict?.totalRecoverableCents ?? 0}
        />
      ) : dossier.status === "MANDATE_PENDING" ? (
        <PiecesUpload
          dossierId={dossierId}
          pieces={pieces.map((p) => ({ id: p.id, kind: p.kind, status: p.status }))}
          missingData={missing}
        />
      ) : (
        <section className="mt-10">
          <h1 className="font-display text-2xl font-extrabold tracking-display">
            Dossier transmis
          </h1>
          <p className="mt-3 text-ink/70">
            Votre dossier est en cours d'étude. Suivez son avancement dans votre espace.
          </p>
          <Link
            href={`/espace/${dossierId}`}
            className="mt-6 inline-block rounded-field bg-ink px-6 py-3 font-medium text-paper hover:bg-ink/90"
          >
            Voir mon dossier
          </Link>
        </section>
      )}
    </main>
  );
}
