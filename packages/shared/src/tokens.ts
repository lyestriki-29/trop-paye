/**
 * Design tokens — source de vérité visuelle (charte graphique §2).
 * Consommés par le site ET les vidéos Remotion (cohérence totale).
 */

export const colors = {
  ink: "#11192B", // texte principal, fonds inversés — encre bleu nuit
  paper: "#FBFBF8", // fond principal — blanc papier (PAS crème)
  paper2: "#F1F1EC", // fonds de cartes, zones de formulaire
  refund: "#0B9E6B", // vert de l'argent récupéré : montants, succès
  refundText: "#087A52", // variante foncée pour le texte courant (contraste AA)
  stamp: "#C8322B", // rouge tampon — alertes prescription, erreurs
  line: "#D9D9D1", // filets, bordures 1px
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

/** Émet les CSS custom properties à injecter dans :root (globals.css). */
export function cssVariables(): string {
  return [
    `--color-ink: ${colors.ink};`,
    `--color-paper: ${colors.paper};`,
    `--color-paper-2: ${colors.paper2};`,
    `--color-refund: ${colors.refund};`,
    `--color-refund-text: ${colors.refundText};`,
    `--color-stamp: ${colors.stamp};`,
    `--color-line: ${colors.line};`,
  ].join("\n");
}
