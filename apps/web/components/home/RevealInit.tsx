"use client";

import { useEffect } from "react";

/**
 * Observer unique des [data-reveal] de la page (composants Reveal serveur) :
 * passe data-reveal à "in" à l'entrée dans le viewport, UNE fois (parité avec
 * l'ancien useInView motion : marge -60px, once). Rend null — aucun DOM.
 */
export function RevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "-60px" },
    );
    for (const el of document.querySelectorAll("[data-reveal]")) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return null;
}
