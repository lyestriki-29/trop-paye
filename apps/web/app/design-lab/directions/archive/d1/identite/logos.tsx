/**
 * D1 « Document officiel » — actifs d'identité (SVG inline, design-lab).
 * Couleurs : exclusivement `currentColor` + classes de tokens (le parent
 * fixe la teinte : `text-ink` sur paper, `text-paper` sur ink, `text-stamp`
 * pour le tampon). Aucune couleur littérale, aucune police littérale.
 */

const DISPLAY_FONT = "var(--font-display), system-ui, sans-serif";

/** Logotype A — une ligne, Bricolage 800, l'accent du « é » en refund (charte §3). */
export function LogoA({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 222 56"
      role="img"
      aria-label="TropPayé"
      className={`overflow-visible ${className ?? ""}`}
    >
      <text
        x="0"
        y="45"
        fontFamily={DISPLAY_FONT}
        fontWeight={800}
        fontSize="48"
        letterSpacing="-0.96"
        fill="currentColor"
      >
        TropPay
        <tspan className="text-refund" fill="currentColor">
          é
        </tspan>
      </text>
    </svg>
  );
}

/** Logotype B — déclinaison empilée + soulignement filet (registre courrier). */
export function LogoB({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 132 122"
      role="img"
      aria-label="TropPayé"
      className={`overflow-visible ${className ?? ""}`}
    >
      <text
        x="0"
        y="44"
        fontFamily={DISPLAY_FONT}
        fontWeight={800}
        fontSize="48"
        letterSpacing="-0.96"
        fill="currentColor"
      >
        Trop
      </text>
      <text
        x="0"
        y="96"
        fontFamily={DISPLAY_FONT}
        fontWeight={800}
        fontSize="48"
        letterSpacing="-0.96"
        fill="currentColor"
      >
        Pay
        <tspan className="text-refund" fill="currentColor">
          é
        </tspan>
      </text>
      {/* Soulignement filet : le segment refund final répond à l'accent du « é ». */}
      <line x1="0" y1="112" x2="100" y2="112" stroke="currentColor" strokeWidth="3" />
      <line
        className="text-refund"
        x1="106"
        y1="112"
        x2="122"
        y2="112"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

/**
 * Marque secondaire — tampon « TROP PAYÉ » double filet, bords d'encrage
 * imparfaits (charte §1). Droit par construction : l'inclinaison −6° est
 * appliquée par le consommateur (classe `-rotate-6` ou animation motion).
 */
export function StampMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 124"
      role="img"
      aria-label="Tampon TROP PAYÉ"
      className={`overflow-visible ${className ?? ""}`}
    >
      <defs>
        <filter id="d1-stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
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
      <g filter="url(#d1-stamp-ink)" opacity="0.92">
        <rect x="4" y="4" width="192" height="116" rx="14" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="13" y="13" width="174" height="98" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text
          x="100"
          y="56"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontWeight={800}
          fontSize="30"
          letterSpacing="3"
          fill="currentColor"
        >
          TROP
        </text>
        <text
          x="100"
          y="92"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontWeight={800}
          fontSize="30"
          letterSpacing="3"
          fill="currentColor"
        >
          PAYÉ
        </text>
      </g>
    </svg>
  );
}

/** Favicon — tampon « TP » condensé, lisible à 32 px (inclinaison intégrée). */
export function FaviconMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Favicon TropPayé" className={className}>
      <g transform="rotate(-6 16 16)">
        <rect x="2.5" y="5" width="27" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="6" y="8.5" width="20" height="15" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <text
          x="16"
          y="20.5"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontWeight={800}
          fontSize="11"
          letterSpacing="0.5"
          fill="currentColor"
        >
          TP
        </text>
      </g>
    </svg>
  );
}
