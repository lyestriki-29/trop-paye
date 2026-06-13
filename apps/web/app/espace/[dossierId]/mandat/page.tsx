import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { MandatePanel } from "@/components/espace/MandatePanel";

export const dynamic = "force-dynamic";

export default async function MandatTabPage({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  const { dossier, mandate } = await loadOwnedDossier(dossierId);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Votre mandat</h1>
      <MandatePanel
        signedAt={mandate?.signed_at ?? null}
        feeRateBps={mandate?.fee_rate_bps ?? null}
        pdfHref={mandate?.signed_at ? `/api/mandate/${dossierId}` : null}
        signHref={`/mandat/${dossierId}`}
        canSign={dossier.status === "DIAGNOSED"}
      />
    </div>
  );
}
