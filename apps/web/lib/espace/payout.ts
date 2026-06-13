export type PayoutStage = "pending" | "recovered" | "paid";

/** Net reversé au locataire = récupéré − commission (bps). Tout en centimes. */
export function netAfterFee(recoverableCents: number, feeRateBps: number): number {
  const fee = Math.round((recoverableCents * feeRateBps) / 10_000);
  return recoverableCents - fee;
}

/** Affichage masqué : « FR76 •••• 0189 » (jamais l'IBAN complet côté client). */
export function maskIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  const country = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  return `${country} •••• ${last4}`;
}

export function payoutStage(input: {
  status: string;
  movements: { direction: string }[];
}): PayoutStage {
  if (input.movements.some((m) => m.direction === "OUT_TENANT")) return "paid";
  if (input.movements.some((m) => m.direction === "IN")) return "recovered";
  return "pending";
}
