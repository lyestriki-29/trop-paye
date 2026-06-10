"use client";

import { useEffect, useRef, useState } from "react";
import { centsToEuros, formatEUR } from "@troppaye/shared";

/**
 * Compteur public (charte §4) : count-up au scroll-into-view, UNE fois.
 * SSR et `prefers-reduced-motion` affichent directement les valeurs finales
 * (le count-up ne démarre qu'à l'apparition, en euros entiers — pas de
 * décimales qui sautillent). Copy deck §1, mot pour mot.
 * Vanilla IntersectionObserver + rAF — pas de lib d'animation (TBT home).
 */
export function CompteurPublic({
  recoveredCents,
  inProgressCount,
}: {
  recoveredCents: number;
  inProgressCount: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  // null = valeurs finales (état SSR, reduced-motion et fin d'animation).
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect(); // une seule lecture du compteur
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 1000, 1);
          // easeOut cubique, parité visuelle avec l'ancien animate() motion.
          setProgress(t < 1 ? 1 - (1 - t) ** 3 : null);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-60px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const euros = Math.round(centsToEuros(recoveredCents) * (progress ?? 1));
  const count = Math.round(inProgressCount * (progress ?? 1));

  return (
    <p ref={ref} className="tabular font-mono text-lg font-medium sm:text-xl">
      {formatEUR(euros * 100)} récupérés pour les locataires · {count} dossiers en cours
    </p>
  );
}
