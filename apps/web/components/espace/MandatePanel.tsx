import { Button } from "@/components/ui/Button";
import { frenchDate } from "@/lib/format-date";

export interface MandatePanelProps {
  signedAt: string | null;
  feeRateBps: number | null;
  pdfHref: string | null;
  signHref: string;
  canSign: boolean;
}

export function MandatePanel({
  signedAt,
  feeRateBps,
  pdfHref,
  signHref,
  canSign,
}: MandatePanelProps) {
  if (signedAt) {
    return (
      <div className="rounded-card border border-line bg-paper p-5 space-y-2">
        <p className="text-sm font-medium">
          Mandat signé le {frenchDate(signedAt)}
        </p>
        <p className="text-sm text-ink/60">
          Barème : {((feeRateBps ?? 2500) / 100).toFixed(0)} % au succès
        </p>
        {pdfHref ? (
          <a
            href={pdfHref}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-refund-text underline underline-offset-2"
          >
            Voir le PDF
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-paper p-5 space-y-3">
      <p className="text-sm text-ink/70">
        Le mandat nous autorise à agir en votre nom pour récupérer le
        trop-perçu. Vous ne payez rien si nous n'obtenons rien.
      </p>
      {canSign ? <Button href={signHref}>Signer mon mandat</Button> : null}
    </div>
  );
}
