/**
 * Logo TropPayé néubrutaliste — tampon rond « TROP PAYÉ » seul (variante retenue
 * par Lyes 2026-06-14). Décoratif (aria-hidden) : le nom accessible est porté par
 * le `aria-label` du lien parent. Couleur = accent (orange, couleur principale).
 * `size` en px ; la bordure et la typo s'adaptent.
 */
export function LogoNb({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 -rotate-[8deg] place-items-center rounded-full border-double border-accent text-center font-nb-display uppercase leading-[1.02] tracking-tight text-accent ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(3, Math.round(size / 13)),
        fontSize: Math.round(size / 4.8),
      }}
    >
      Trop
      <br />
      payé
    </span>
  );
}
