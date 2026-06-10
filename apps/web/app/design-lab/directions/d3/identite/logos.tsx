import { brand, formatEUR } from "@troppaye/shared";

/**
 * Identité D3 « De votre côté » — logotypes SVG inline.
 * Wordmark Outfit 800 (le thème d3 mappe `font-display` → Outfit) ; le
 * surligneur jaune (`accent`) est la signature de la direction.
 * Couleurs : tokens uniquement (`fill-current`, `fill-accent`, `fill-ink`) —
 * le parent choisit l'encre via `text-ink` / `text-paper`.
 * `textLength` fige la largeur des mots → le surligneur reste aligné
 * quelle que soit la métrique réelle de la police chargée.
 */

type SvgProps = { className?: string };

/** Proposition n°1 — wordmark sur une ligne, surligneur sous « Payé ». */
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

/** Proposition n°2 — wordmark empilé, « Payé » posé sur la pastille pleine. */
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

/** Marque secondaire — pastille « TP » arrondie : avatar, favicon, app. */
export function PastilleTP({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${brand.name} — marque secondaire`}
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

/** Montant du gabarit OG — scénario témoin du plan P0 (données fictives). */
const OG_TOTAL_CENTS = 143700;

/** Gabarit OG 1200×630 — aperçu HTML/CSS réduit (le vrai `next/og` arrive en P2). */
export function OgPreview({ tone }: { tone: "paper" | "ink" }) {
  const ink = tone === "ink";
  return (
    <div
      className={`flex aspect-[1200/630] w-full flex-col justify-between rounded-card border p-8 sm:p-10 ${
        ink ? "border-paper/20 bg-ink text-paper" : "border-line bg-paper text-ink"
      }`}
    >
      <LogoA className="h-8 w-auto sm:h-9" />
      <p className="max-w-[18ch] font-display text-xl font-extrabold leading-snug tracking-display sm:text-2xl">
        J&apos;ai vérifié mon loyer :{" "}
        <span className="whitespace-nowrap rounded-field bg-accent px-2 text-ink">
          <span className="tabular">{formatEUR(OG_TOTAL_CENTS)}</span>
        </span>{" "}
        à récupérer
      </p>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${ink ? "text-paper/60" : "text-ink/55"}`}>
          {brand.domain}
        </span>
        <PastilleTP className="h-9 w-9 sm:h-10 sm:w-10" />
      </div>
    </div>
  );
}
