import { formatEur } from "@troppaye/rules-engine";

/**
 * Montant en euros — Spline Sans Mono + chiffres tabulaires (charte §2).
 * `favorable` : vert `refund` quand la somme est en faveur du locataire.
 * Composant pur (utilisable en Server Component).
 */
export function Amount({
  cents,
  favorable = false,
  className = "",
}: {
  cents: number;
  favorable?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`font-mono tabular ${favorable ? "text-refund-text" : ""} ${className}`.trim()}
    >
      {formatEur(cents)}
    </span>
  );
}
