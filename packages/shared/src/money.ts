/** Montants : toujours en centimes (entiers) pour éviter les flottants. */
export type Cents = number;

export function eurosToCents(euros: number): Cents {
  return Math.round(euros * 100);
}

export function centsToEuros(cents: Cents): number {
  return cents / 100;
}

const eurWithDecimals = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurWhole = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Formate un montant (centimes) en euros fr-FR.
 * Par défaut : décimales seulement si le montant n'est pas un nombre rond.
 */
export function formatEUR(cents: Cents, opts: { decimals?: boolean } = {}): string {
  const euros = centsToEuros(cents);
  const withDecimals = opts.decimals ?? !Number.isInteger(euros);
  return withDecimals ? eurWithDecimals.format(euros) : eurWhole.format(euros);
}
