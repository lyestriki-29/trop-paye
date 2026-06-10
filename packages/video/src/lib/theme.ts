import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadSplineSansMono } from "@remotion/google-fonts/SplineSansMono";
import { colors, motionTokens, radius } from "@troppaye/shared";

/**
 * Thème vidéo (P4) : tokens importés de @troppaye/shared (cohérence totale
 * site ↔ vidéos), polices via @remotion/google-fonts (mêmes graisses que le
 * site). NB : les styles inline sont l'idiome Remotion (valeurs animées par
 * frame) — la règle « pas de styles inline » du web ne s'applique pas ici.
 */

const outfit = loadOutfit("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const figtree = loadFigtree("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const spline = loadSplineSansMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const theme = {
  colors,
  radius,
  motion: motionTokens,
  fontDisplay: outfit.fontFamily,
  fontBody: figtree.fontFamily,
  fontMono: spline.fontFamily,
} as const;

/** Montants vidéo : euros entiers, séparateur fin — mono `tabular` (charte §2). */
export function formatEurosVideo(cents: number): string {
  const euros = Math.round(cents / 100);
  return `${new Intl.NumberFormat("fr-FR").format(euros)} €`;
}
