import { brand } from "@troppaye/shared";

/**
 * Logo TropPayé néubrutaliste — tampon rond « TROP PAYÉ » (variante retenue par
 * Lyes 2026-06-14) + mot-marque. Le tampon est décoratif (aria-hidden) ; le
 * mot-marque porte le nom accessible. Couleur = accent (orange, couleur principale).
 */
export function LogoNb({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span
        aria-hidden="true"
        className="grid h-10 w-10 shrink-0 -rotate-[8deg] place-items-center rounded-full border-[3px] border-double border-accent text-center font-nb-display text-[8px] uppercase leading-[1.04] tracking-tight text-accent"
      >
        Trop
        <br />
        payé
      </span>
      <span className="font-nb-display text-xl uppercase tracking-tight text-nb-ink">
        {brand.name}
      </span>
    </span>
  );
}
