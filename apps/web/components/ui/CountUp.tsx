"use client";

import { useEffect, useRef, useState } from "react";
import { formatEUR } from "@troppaye/shared";

/**
 * Count-up générique (premium v2.1, charte §4) : compte à l'entrée dans le
 * viewport, UNE fois, easeOut. SSR et reduced-motion affichent la valeur
 * finale. Vanilla IO + rAF — aucune lib (budget perf).
 */
export function CountUp({
  cents,
  className,
  durationMs = 1000,
}: {
  cents: number;
  className?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // null = valeur finale (SSR, reduced-motion, fin d'animation).
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

  const shown = Math.round((cents * (progress ?? 1)) / 100) * 100;
  return (
    <span ref={ref} className={`tabular font-mono ${className ?? ""}`}>
      {formatEUR(shown)}
    </span>
  );
}
