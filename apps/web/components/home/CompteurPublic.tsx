"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { centsToEuros, formatEUR } from "@troppaye/shared";

/**
 * Compteur public (charte §4) : count-up au scroll-into-view, UNE fois.
 * SSR et `prefers-reduced-motion` affichent directement les valeurs finales
 * (le count-up ne démarre qu'à l'apparition, en euros entiers — pas de
 * décimales qui sautillent). Copy deck §1, mot pour mot.
 */
export function CompteurPublic({
  recoveredCents,
  inProgressCount,
}: {
  recoveredCents: number;
  inProgressCount: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const played = useRef(false);
  // null = valeurs finales (état SSR, reduced-motion et fin d'animation).
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || played.current) return;
    played.current = true;
    if (reduced) return; // valeurs finales déjà affichées
    const controls = animate(0, 1, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (p) => setProgress(p),
      onComplete: () => setProgress(null),
    });
    return () => controls.stop();
  }, [inView, reduced]);

  const euros = Math.round(centsToEuros(recoveredCents) * (progress ?? 1));
  const count = Math.round(inProgressCount * (progress ?? 1));

  return (
    <p ref={ref} className="tabular font-mono text-lg font-medium sm:text-xl">
      {formatEUR(euros * 100)} récupérés pour les locataires · {count} dossiers en cours
    </p>
  );
}
