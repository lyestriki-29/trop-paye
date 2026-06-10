/** Logotype principal : "TropPayé" en Bricolage 800, l'accent du é en refund. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold tracking-display text-ink ${className ?? ""}`}
    >
      TropPay<span style={{ color: "var(--color-refund)" }}>é</span>
    </span>
  );
}
