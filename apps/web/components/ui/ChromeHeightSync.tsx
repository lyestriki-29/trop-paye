"use client";

import { useEffect } from "react";

/**
 * Mesure la hauteur du chrome au-dessus de la hero (header sticky + bandeau ticker)
 * et l'expose en variable CSS `--chrome-h`. La hero fait alors PILE l'écran restant
 * via `min-h-[calc(100svh - var(--chrome-h))]`, sans chiffre magique : s'adapte au
 * responsive (ResizeObserver). Fallback SSR : valeur par défaut dans globals.css (:root).
 */
export function ChromeHeightSync() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-chrome-header]");
    const ticker = document.querySelector<HTMLElement>("[data-chrome-ticker]");
    const update = () => {
      const h = (header?.offsetHeight ?? 0) + (ticker?.offsetHeight ?? 0);
      if (h > 0) document.documentElement.style.setProperty("--chrome-h", `${h}px`);
    };
    update();
    // Re-mesure une fois les web-fonts chargées (la hauteur du header peut bouger).
    document.fonts?.ready.then(update);
    const ro = new ResizeObserver(update);
    if (header) ro.observe(header);
    if (ticker) ro.observe(ticker);
    return () => ro.disconnect();
  }, []);
  return null;
}
