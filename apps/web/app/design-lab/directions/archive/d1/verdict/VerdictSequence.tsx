"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { formatEUR } from "@troppaye/shared";
import { StampMark } from "@/app/design-lab/directions/archive/d1/identite/logos";

/** Scénario témoin fixe (plan P0, écran 2) — données fictives. */
const SCENARIO = {
  reference: "TP-2026-0117",
  address: "12 rue des Lilas, 75011 Paris",
  recoverableCents: 143_700,
  futureSavingCents: 7_200,
  lines: [
    { label: "Loyer payé depuis le 01/09/2023", cents: 102_185, refund: false },
    { label: "Plafond légal (gel DPE F/G)", cents: 95_000, refund: false },
    { label: "Différence mensuelle", cents: 7_185, refund: true },
  ],
} as const;

/** Chronologie de la séquence (charte §4) — délais cumulés en secondes. */
const T = { card: 0, lines: 0.35, step: 0.08, stamp: 0.75, count: 1.0, cta: 1.75 } as const;

/** Count-up 0 → cents (1 s, ease-out). Reduced motion : montant affiché directement. */
function CountUp({ cents, delay, className }: { cents: number; delay: number; className?: string }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => formatEUR(Math.round(v), { decimals: true }));
  useEffect(() => {
    if (reduce) return;
    const controls = animate(value, cents, { duration: 1, ease: "easeOut", delay });
    return () => controls.stop();
  }, [value, cents, delay, reduce]);
  if (reduce) return <span className={className}>{formatEUR(cents, { decimals: true })}</span>;
  return <motion.span className={className}>{text}</motion.span>;
}

function Sequence() {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="relative mx-auto max-w-xl"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.3 } : { duration: 0.4, ease: "easeOut", delay: T.card }}
    >
      {/* Secousse 1 px de la carte au claquement du tampon (charte §4). */}
      <motion.div
        className="overflow-visible rounded-card border border-line bg-paper"
        animate={reduce ? undefined : { x: [0, -1, 1, 0] }}
        transition={reduce ? undefined : { delay: T.stamp + 0.08, duration: 0.12 }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-ink/55">
          {/* TODO_COPY — libellés d'en-tête de document (hors copy deck) */}
          <span>Réf. dossier {SCENARIO.reference}</span>
          <span>Verdict</span>
        </div>

        <div className="relative px-6 py-6 sm:px-8 sm:py-8">
          <motion.div
            className="pointer-events-none absolute -right-4 -top-9 text-stamp sm:-right-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.4, rotate: -6 }}
            animate={{ opacity: 0.95, scale: 1, rotate: -6 }}
            transition={
              reduce
                ? { duration: 0.3 }
                : { type: "spring", stiffness: 600, damping: 32, delay: T.stamp }
            }
          >
            <StampMark className="h-20 w-auto sm:h-24" />
          </motion.div>

          <p className="font-mono text-xs text-ink/55">{SCENARIO.address}</p>
          <h1 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Vous avez trop payé.
          </h1>

          <dl className="mt-6">
            {SCENARIO.lines.map((line, i) => (
              <motion.div
                key={line.label}
                className="flex items-baseline justify-between gap-6 border-b border-dashed border-line py-3"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.3, ease: "easeOut", delay: T.lines + i * T.step }
                }
              >
                <dt className="text-sm text-ink/70">{line.label}</dt>
                <dd
                  className={`tabular whitespace-nowrap font-mono text-sm ${
                    line.refund ? "font-medium text-refund-text" : "text-ink"
                  }`}
                >
                  {line.refund ? "+ " : ""}
                  {formatEUR(line.cents, { decimals: true })}
                </dd>
              </motion.div>
            ))}
          </dl>

          <div className="mt-7 border-t-2 border-ink pt-6">
            <CountUp
              cents={SCENARIO.recoverableCents}
              delay={T.count}
              className="tabular block font-mono text-[44px] font-medium leading-none text-refund sm:text-hero"
            />
            <p className="mt-2 text-sm text-ink/70">
              récupérables · +{" "}
              <span className="tabular font-mono">{formatEUR(SCENARIO.futureSavingCents)}</span>
              /mois d'économie à venir
            </p>
          </div>

          <p className="mt-5 text-sm text-ink/60">
            {/* Le n° de DPE est fictif (spécimen). */}
            Confiance élevée : Notre estimation s'appuie sur des données officielles (DPE
            n° 2375E1234567, indice INSEE).
          </p>

          <motion.div
            className="mt-7"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut", delay: T.cta }}
          >
            <button
              type="button"
              className="w-full rounded-field bg-refund-text px-6 py-4 text-base font-semibold text-paper transition-colors hover:bg-ink sm:w-auto sm:px-10"
            >
              Récupérer mes{" "}
              <span className="tabular font-mono">{formatEUR(SCENARIO.recoverableCents)}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}

/** Séquence du verdict D1 + commande de rejeu (chrome design-lab, hors copy produit). */
export function VerdictSequence() {
  const [run, setRun] = useState(0);
  return (
    <div>
      <Sequence key={run} />
      <p className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="rounded-field border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
        >
          Rejouer la séquence
        </button>
      </p>
    </div>
  );
}
