/**
 * Tampon encreur "TROP PAYÉ" — signature de marque (charte §1).
 * Double filet rouge arrondi, incliné -6°, bords d'encrage imparfaits
 * (feTurbulence + feDisplacementMap). Composant statique (pas d'interactivité).
 */
export function Stamp({
  size = 160,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Tampon Trop Payé"
      className={className}
    >
      <defs>
        <filter id="tp-ink-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </defs>
      <g
        transform="rotate(-6 100 100)"
        fill="none"
        stroke="#c8322b"
        filter="url(#tp-ink-rough)"
        opacity="0.92"
      >
        <rect x="22" y="48" width="156" height="104" rx="16" strokeWidth="5" />
        <rect x="30" y="56" width="140" height="88" rx="12" strokeWidth="2" />
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fontFamily="var(--font-display), sans-serif"
          fontWeight="800"
          fontSize="33"
          letterSpacing="2"
          fill="#c8322b"
          stroke="none"
        >
          TROP
        </text>
        <text
          x="100"
          y="132"
          textAnchor="middle"
          fontFamily="var(--font-display), sans-serif"
          fontWeight="800"
          fontSize="33"
          letterSpacing="2"
          fill="#c8322b"
          stroke="none"
        >
          PAYÉ
        </text>
      </g>
    </svg>
  );
}
