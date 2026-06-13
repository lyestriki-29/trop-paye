import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { getPayoutView } from "@/lib/espace/payout-read";
import { netAfterFee, payoutStage } from "@/lib/espace/payout";
import { PayoutForm } from "@/components/espace/PayoutForm";
import { PayoutTracker } from "@/components/espace/PayoutTracker";
import type { PayoutView } from "@/lib/espace/payout-read";

export const dynamic = "force-dynamic";

const EMPTY_PAYOUT: PayoutView = { holderName: null, ibanMasked: null, movements: [] };

export default async function VersementPage({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  const { dossier, verdict, mandate } = await loadOwnedDossier(dossierId);

  let payout: PayoutView;
  try {
    payout = await getPayoutView(dossierId);
  } catch {
    payout = EMPTY_PAYOUT;
  }

  const recoverable = verdict?.totalRecoverableCents ?? 0;
  const net = netAfterFee(recoverable, mandate?.fee_rate_bps ?? 2500);
  const stage = payoutStage({ status: dossier.status, movements: payout.movements });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Versement</h1>
        <PayoutForm dossierId={dossierId} currentMasked={payout.ibanMasked} />
      </div>
      <PayoutTracker stage={stage} recoverableCents={recoverable} netCents={net} />
    </div>
  );
}
