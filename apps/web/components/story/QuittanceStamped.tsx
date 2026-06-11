"use client";

import { useEffect, useRef } from "react";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Stamp } from "@/components/ui/Stamp";
import { casZero } from "@/lib/content/notre-histoire";

/**
 * Quittance du « cas zéro » + tampon TROP PAYÉ qui claque au scroll
 * (IntersectionObserver → `data-reveal="in"`, animation `tp-stamp` du CSS).
 * SEULE animation forte de la page récit (spec notre-histoire).
 *
 * prefers-reduced-motion : AUCUN observer monté — l'attribut est posé d'emblée
 * et le bloc CSS animé étant sous media query, le tampon s'affiche statique.
 */
export function QuittanceStamped({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Lecture directe (pas de useReducedMotion : son singleton fige la 1re
    // valeur lue, ce qui fausse tests et changements de préférence à chaud).
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced || typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal", "in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.setAttribute("data-reveal", "in");
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={`relative ${className ?? ""}`}>
      <QuittanceCard
        reference={casZero.reference}
        kind={casZero.kind}
        meta={casZero.meta}
        rows={[
          { label: casZero.rentLabel, cents: casZero.rentHcCents },
          { label: casZero.supplementLabel, cents: casZero.supplementCents, highlight: true },
        ]}
        total={{ label: casZero.totalLabel, cents: casZero.totalCents }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-1/2 origin-center scale-[1.4] sm:right-12 sm:scale-[1.8]"
      >
        <Stamp rotate={-12}>{casZero.stamp}</Stamp>
      </div>
    </div>
  );
}
