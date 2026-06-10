"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { brand, formatEUR } from "@troppaye/shared";

/**
 * D2 « Relevé de compte » — séquence verdict : les lignes s'impriment
 * (stagger 70 ms, mono) → la ligne solde « TROP-PERÇU » flashe en refund/10
 * → count-up du solde en refund → badge pill mono → CTA. Pas de tampon.
 * `useReducedMotion` → variante statique en fondu simple, montant direct.
 */

/* Scénario fixe du témoin (données fictives du plan P0). */
const OVERPAID_CENTS = 143700;
const MONTHLY_CENTS = 7200;
const CALC_ROWS = [
  { label: "Loyer payé depuis le 01/09/2023", cents: 81200, credit: false },
  { label: "Plafond légal (gel DPE F/G)", cents: 74000, credit: false },
  { label: "Différence mensuelle", cents: MONTHLY_CENTS, credit: true },
] as const;

/* Chronologie (s) : impression → flash du solde → count-up (1 s) → badge → CTA. */
const T = {
  row: (i: number) => 0.2 + i * 0.07,
  solde: 0.62,
  flash: 0.78,
  count: 0.9,
  badge: 2.05,
  outro: 2.35,
} as const;

function CountUp({ reduce }: { reduce: boolean }) {
  const [text, setText] = useState(() => formatEUR(0, { decimals: true }));
  useEffect(() => {
    if (reduce) {
      setText(formatEUR(OVERPAID_CENTS, { decimals: true }));
      return;
    }
    const controls = animate(0, OVERPAID_CENTS, {
      delay: T.count,
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setText(formatEUR(Math.round(v), { decimals: true })),
    });
    return () => controls.stop();
  }, [reduce]);
  return <span className="tabular">{text}</span>;
}

function Statement({ reduce }: { reduce: boolean }) {
  const enter = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: reduce
      ? { duration: 0.4 }
      : { delay, duration: 0.35, ease: "easeOut" as const },
  });

  return (
    <div className="w-full max-w-xl">
      <motion.div
        {...enter(0)}
        className="overflow-hidden rounded-card border border-line bg-paper shadow-sm"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-4 font-mono text-xs text-ink/60">
          {/* TODO_COPY : intitulé du document à valider (libellé court). */}
          <span>Relevé de vérification</span>
          <span className="tabular">10/06/2026</span>
        </div>
        <div className="px-6 pt-6">
          <p className="font-mono text-sm text-ink/60">12 rue des Lilas, 75011 Paris</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-display">
            Vous avez trop payé.
          </h1>
        </div>

        <div className="mt-6 font-mono text-sm">
          {CALC_ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              {...enter(T.row(i))}
              className="flex items-baseline justify-between gap-4 border-t border-line px-6 py-3.5"
            >
              <span className="text-ink/70">{row.label}</span>
              <span
                className={`font-medium tabular ${
                  row.credit ? "text-refund-text" : "text-ink"
                }`}
              >
                {row.credit ? "+" : ""}
                {formatEUR(row.cents, { decimals: true })}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Ligne solde — flash en fond refund/10, puis count-up du montant. */}
        <motion.div {...enter(T.solde)} className="relative border-t border-line">
          <motion.span
            aria-hidden
            className="absolute inset-0 bg-refund/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduce ? 1 : [0, 1, 0.25, 1] }}
            transition={
              reduce
                ? { duration: 0.4 }
                : { delay: T.flash, duration: 0.7, times: [0, 0.35, 0.65, 1] }
            }
          />
          <div className="relative px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs font-medium tracking-wide text-ink/60">
                TROP-PERÇU
              </span>
              <motion.span
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reduce
                    ? { duration: 0.4 }
                    : { delay: T.badge, type: "spring", stiffness: 420, damping: 26 }
                }
                className="rounded-badge border border-refund/30 bg-refund/10 px-3 py-1 font-mono text-sm font-medium text-refund-text tabular"
              >
                +{formatEUR(OVERPAID_CENTS, { decimals: true })}
              </motion.span>
            </div>
            <p className="mt-3 font-mono text-2xl font-medium text-refund md:text-hero">
              <CountUp reduce={reduce} />
            </p>
            <motion.p {...enter(reduce ? 0 : T.outro)} className="mt-4 text-sm text-ink/70">
              <span className="font-mono tabular">{formatEUR(OVERPAID_CENTS)}</span>{" "}
              récupérables ·{" "}
              <span className="font-mono tabular">+ {formatEUR(MONTHLY_CENTS)}</span>
              /mois d'économie à venir
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div {...enter(reduce ? 0 : T.outro)} className="mt-8">
        <p className="flex flex-wrap items-baseline gap-3 text-sm text-ink/70">
          <span className="rounded-badge border border-line bg-paper px-3 py-0.5 font-mono text-xs text-refund-text">
            Confiance élevée
          </span>
          <span>
            Notre estimation s'appuie sur des données officielles (DPE
            n° 2375E0962748B, indice INSEE).
          </span>
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-field bg-refund-text px-6 py-4 text-base font-semibold text-paper transition-colors hover:bg-refund-text/90"
        >
          Récupérer mes{" "}
          <span className="font-mono tabular">{formatEUR(OVERPAID_CENTS)}</span>
        </button>
        <p className="mt-4 text-xs leading-relaxed text-ink/50">{brand.disclaimer}</p>
      </motion.div>
    </div>
  );
}

export function VerdictSequence() {
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState(0);
  return (
    <div className="flex w-full flex-col items-center">
      <Statement key={run} reduce={reduce} />
      {/* Contrôle design-lab uniquement (hors copy deck). */}
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="mt-10 rounded-field border border-line px-4 py-2 font-mono text-xs text-ink/60 transition-colors hover:border-ink/30 hover:text-ink"
      >
        Rejouer la séquence
      </button>
    </div>
  );
}
