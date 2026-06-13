"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compteur d'entiers générique (variante néubrutaliste) : compte à l'entrée
 * dans le viewport, UNE fois, easeOut. SSR + reduced-motion affichent la valeur
 * finale. Vanilla IO + rAF — aucune lib. Pendant non-euro de `CountUp`.
 */
export function CountUpInt({
  value,
  className,
  durationMs = 1100,
}: {
  value: number;
  className?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          setProgress(t < 1 ? 1 - (1 - t) ** 3 : null);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-40px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [durationMs]);

  const shown = Math.round(value * (progress ?? 1));
  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {shown.toLocaleString("fr-FR")}
    </span>
  );
}
