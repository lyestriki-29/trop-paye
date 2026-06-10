import { useId } from "react";
import { brand } from "@troppaye/shared";

/**
 * Identité V2 « Synthèse » (arbitrage du 2026-06-10) — actifs SVG inline.
 * Logotypes D3 : wordmark Outfit 800 (le thème d3 mappe `font-display` →
 * Outfit), surligneur `accent` en signature. Tampon D1 : double filet,
 * encrage imparfait — recoloré par token (`text-stamp` posé par le parent,
 * soit le rouge chaud du thème d3).
 * Couleurs : tokens uniquement (`fill-current`, `fill-accent`, `fill-ink`).
 * `textLength` fige la largeur des mots → le surligneur reste aligné
 * quelle que soit la métrique réelle de la police chargée.
 * Fichier autonome : aucune dépendance vers d1/d3 (archivées pour référence).
 */

type SvgProps = { className?: string };

/** Logotype A (retenu) — wordmark une ligne, surligneur sous « Payé ». */
export function LogoA({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 188 52" role="img" aria-label={brand.name} className={className}>
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

/** Logotype B — wordmark empilé, « Payé » posé sur la pastille pleine. */
export function LogoB({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 116 104" role="img" aria-label={brand.name} className={className}>
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
      <rect x="0" y="50" width="116" height="50" rx="14" className="fill-accent" />
      <text
        x="10"
        y="88"
        fontSize="40"
        fontWeight="800"
        textLength="96"
        lengthAdjust="spacingAndGlyphs"
        className="fill-ink font-display"
      >
        Payé
      </text>
    </svg>
  );
}

/** Pastille « TP » — avatars, signatures d'email, favicon. */
export function PastilleTP({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${brand.name} — pastille`}
      className={className}
    >
      <rect width="64" height="64" rx="18" className="fill-accent" />
      <text
        x="32"
        y="43"
        fontSize="30"
        fontWeight="800"
        textAnchor="middle"
        className="fill-ink font-display"
      >
        TP
      </text>
    </svg>
  );
}

/**
 * Tampon « TROP PAYÉ » (hérité de D1) — double filet, bords d'encrage
 * imparfaits. Marque secondaire réservée au verdict gagné + réseaux sociaux ;
 * jamais sur la home ni dans la séquence verdict. Droit par construction :
 * l'inclinaison −6° (`-rotate-6`) et la couleur (`text-stamp`) sont posées
 * par le consommateur.
 */
export function StampMark({ className }: SvgProps) {
  // Id unique par instance : la page rend le tampon plusieurs fois (duo + OG).
  const filterId = useId();
  return (
    <svg
      viewBox="0 0 200 124"
      role="img"
      aria-label="Tampon TROP PAYÉ"
      className={`overflow-visible ${className ?? ""}`}
    >
      <defs>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} opacity="0.92">
        <rect x="4" y="4" width="192" height="116" rx="14" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="13" width="174" height="98" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text
          x="100"
          y="56"
          textAnchor="middle"
          fontWeight="800"
          fontSize="30"
          letterSpacing="3"
          fill="currentColor"
          className="font-display"
        >
          TROP
        </text>
        <text
          x="100"
          y="92"
          textAnchor="middle"
          fontWeight="800"
          fontSize="30"
          letterSpacing="3"
          fill="currentColor"
          className="font-display"
        >
          PAYÉ
        </text>
      </g>
    </svg>
  );
}
