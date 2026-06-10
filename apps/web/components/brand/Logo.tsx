import { brand } from "@troppaye/shared";

/**
 * Logotype principal v2 (charte §3, arbitrage 2026-06-10) : wordmark
 * « TropPayé » en Outfit 800 (via `font-display`), surligneur `accent`
 * sous « Payé » — copie du `LogoA` du design-lab v2/identite.
 * Dimensionné en `em` : `className="text-xl"` pilote la taille comme avant.
 * `textLength` fige la largeur des mots → le surligneur reste aligné.
 * Marque secondaire (Stamp) : verdict gagné + réseaux + OG UNIQUEMENT —
 * jamais home, tunnel, dashboard ni courriers.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 188 52"
      role="img"
      aria-label={brand.name}
      className={`h-[1.3em] w-auto text-ink ${className ?? ""}`}
    >
      <rect x="85" y="41" width="102" height="9" rx="4.5" className="fill-accent" />
      <text
        x="2"
        y="38"
        fontSize="40"
        fontWeight="800"
        textLength="82"
        lengthAdjust="spacingAndGlyphs"
        className="fill-current font-display"
      >
        Trop
      </text>
      <text
        x="88"
        y="38"
        fontSize="40"
        fontWeight="800"
        textLength="96"
        lengthAdjust="spacingAndGlyphs"
        className="fill-current font-display"
      >
        Payé
      </text>
    </svg>
  );
}
