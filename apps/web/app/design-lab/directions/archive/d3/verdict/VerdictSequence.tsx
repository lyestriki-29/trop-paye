"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { formatEUR } from "@troppaye/shared";

/** Scénario fixe du témoin (plan P0) — données fictives, cohérentes entre elles. */
const ADDRESS = "12 rue des Lilas, 75011 Paris";
const TOTAL_CENTS = 143700;
const MONTHLY_CENTS = 7200;
const CALC_LINES = [
  { label: "Loyer payé depuis le 01/09/2023", cents: 86200 },
  { label: "Plafond légal (gel DPE F/G)", cents: 79000 },
  { label: "Différence mensuelle", cents: 7200 },
] as const;

/** Timeline (délais cumulés, en secondes). */
const T = {
  phrase: 0.3,
  title: 0.7,
  lines: 1.0,
  lineStep: 0.08,
  sweep: 1.6,
  count: 1.8,
  countDuration: 1,
  cta: 3.0,
} as const;

/** Glyphes Lucide inlinés (sparkle, arrow-right) — lucide-react absent du workspace. */
function IconSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Apparition douce ; `prefers-reduced-motion` → rendu statique immédiat. */
function Reveal({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function VerdictSequence() {
  const reduced = useReducedMotion();
  const [cents, setCents] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, TOTAL_CENTS, {
      delay: T.count,
      duration: T.countDuration,
      ease: "easeOut",
      onUpdate: (latest) => setCents(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reduced]);

  const shownCents = reduced ? TOTAL_CENTS : cents;

  return (
    <motion.section
      className="rounded-card border border-line bg-paper p-7 shadow-xl sm:p-12"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
    >
      <Reveal delay={0}>
        <p className="font-mono text-sm text-ink/55">{ADDRESS}</p>
      </Reveal>

      <Reveal delay={T.phrase} className="mt-6">
        {/* TODO_COPY : libellé design-lab, à valider pour la prod. */}
        <p className="inline-flex items-center gap-2 rounded-badge bg-refund/10 px-4 py-2 text-sm font-semibold text-refund-text">
          <IconSparkle className="h-4 w-4" />
          Bonne nouvelle : la loi est de votre côté.
        </p>
      </Reveal>

      <Reveal delay={T.title} className="mt-5">
        <h1 className="font-display text-2xl font-extrabold tracking-display sm:text-[44px] sm:leading-[1.08]">
          Vous avez trop payé.
        </h1>
      </Reveal>

      <div className="mt-8">
        {CALC_LINES.map((line, i) => (
          <Reveal
            key={line.label}
            delay={T.lines + i * T.lineStep}
            className="flex items-baseline justify-between gap-4 border-b border-line py-3"
          >
            <span className="text-sm text-ink/65">{line.label}</span>
            <span className="font-mono text-sm font-medium tabular">
              {formatEUR(line.cents, { decimals: true })}
            </span>
          </Reveal>
        ))}
      </div>

      <Reveal delay={T.sweep - 0.15} className="mt-10">
        {/* TODO_COPY : libellé absent du copy deck (le verdict dit « {X} € récupérables »), à valider. */}
        <p className="text-sm font-medium text-ink/60">Trop-perçu récupérable</p>
        <p className="mt-2">
          <span className="relative inline-block">
            <motion.span
              aria-hidden
              className="absolute bottom-1 left-0 h-6 rounded-field bg-accent sm:bottom-2 sm:h-9"
              initial={reduced ? false : { width: "0%" }}
              animate={{ width: "100%" }}
              transition={reduced ? { duration: 0 } : { duration: 0.4, delay: T.sweep, ease: "easeOut" }}
            />
            {/* Gabarit invisible : fige la largeur → le surligneur balaie proprement. */}
            <span className="invisible font-mono text-[40px] font-medium tabular sm:text-hero">
              {formatEUR(TOTAL_CENTS, { decimals: true })}
            </span>
            <span className="absolute inset-0 font-mono text-[40px] font-medium text-refund-text tabular sm:text-hero">
              {formatEUR(shownCents, { decimals: true })}
            </span>
          </span>
        </p>
        <p className="mt-3 text-base text-ink/70">
          récupérables ·{" "}
          <span className="font-mono tabular">+ {formatEUR(MONTHLY_CENTS)}</span>/mois
          d&apos;économie à venir
        </p>
      </Reveal>

      <Reveal delay={T.cta - 0.4} className="mt-8 rounded-card bg-paper-2 p-5">
        <p className="text-sm font-semibold text-refund-text">Confiance élevée</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/70">
          Notre estimation s&apos;appuie sur des données officielles (DPE n° 2275E1234567A,
          indice INSEE).
        </p>
      </Reveal>

      <Reveal delay={T.cta} className="mt-9">
        <button
          type="button"
          className="group flex w-full items-center justify-center gap-3 rounded-badge bg-ink px-8 py-5 font-display text-lg font-bold text-paper shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <span>
            Récupérer mes <span className="font-mono tabular">{formatEUR(TOTAL_CENTS)}</span>
          </span>
          <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </Reveal>
    </motion.section>
  );
}
