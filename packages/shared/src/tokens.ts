/**
 * Design tokens — source de vérité visuelle (charte graphique §2).
 * Consommés par le site ET les vidéos Remotion (cohérence totale).
 */

export const colors = {
  ink: "#2A2118", // texte principal, fonds inversés — brun-noir chaud
  paper: "#FFFEFB", // fond principal — blanc à peine chaud (PAS crème)
  paper2: "#FAF4EC", // fonds de cartes, zones de formulaire
  refund: "#0C8F63", // LE vert de l'argent récupéré (gros montants, fonds sombres)
  refundText: "#0A7351", // variante AA du vert pour le texte courant sur fond clair
  stamp: "#D64545", // rouge tampon chaud — tampon, alertes prescription, erreurs
  line: "#EAE1D6", // filets, bordures 1 px
  accent: "#FFD84D", // le surligneur jaune — texte ink obligatoire par-dessus
} as const;

export type ColorToken = keyof typeof colors;

export const fonts = {
  display: "Bricolage Grotesque", // titres, hero, montants géants (600-800)
  body: "Public Sans", // texte courant (400/500/600)
  mono: "Spline Sans Mono", // montants, dates, références, audit trail (400/500)
} as const;

/** Échelle typographique en px (charte §2). */
export const typeScale = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
  "2xl": 40,
  hero: 64,
} as const;

export const radius = { card: 8, field: 4, badge: 999 } as const;
export const layout = { containerMax: 1120, spacingBase: 4 } as const;
export const motionTokens = {
  /** Séquence du verdict (charte §4). */
  verdictSequenceMs: 1800,
  stampSpring: { stiffness: 600, damping: 34, mass: 0.7 } as const,
  microMs: { min: 150, max: 250 } as const,
} as const;

/** « #2A2118 » → « 42 33 24 » (canaux RGB du format rgb(var() / <alpha-value>)). */
function hexToChannels(hex: string): string {
  const int = Number.parseInt(hex.slice(1), 16);
  return `${(int >> 16) & 0xff} ${(int >> 8) & 0xff} ${int & 0xff}`;
}

/** Émet les CSS custom properties à injecter dans :root (mêmes canaux que globals.css). */
export function cssVariables(): string {
  return [
    `--color-ink: ${hexToChannels(colors.ink)};`,
    `--color-paper: ${hexToChannels(colors.paper)};`,
    `--color-paper-2: ${hexToChannels(colors.paper2)};`,
    `--color-refund: ${hexToChannels(colors.refund)};`,
    `--color-refund-text: ${hexToChannels(colors.refundText)};`,
    `--color-stamp: ${hexToChannels(colors.stamp)};`,
    `--color-line: ${hexToChannels(colors.line)};`,
    `--color-accent: ${hexToChannels(colors.accent)};`,
  ].join("\n");
}
