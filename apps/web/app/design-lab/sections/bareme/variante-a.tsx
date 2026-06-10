"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { brand, formatEUR } from "@troppaye/shared";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Marker } from "@/app/design-lab/directions/v2/home/sections-hero";

/** Bornes du simulateur (euros) — plan P2 Task 1 : 500 € → 5 000 €, pas de 50 €. */
const MIN_EUROS = 500;
const MAX_EUROS = 5_000;
const STEP_EUROS = 50;
const DEFAULT_EUROS = 1_500;

/** Pourcentages dérivés de `brand.commissionRateBps` (2500 bps = 25 %). */
const PCT_COMMISSION = brand.commissionRateBps / 100;
const PCT_PART = 100 - PCT_COMMISSION;

/** Répartition au centime près : commission arrondie, la part = le reste exact. */
function splitCents(totalCents: number): { partCents: number; commissionCents: number } {
  const commissionCents = Math.round((totalCents * brand.commissionRateBps) / 10_000);
  return { partCents: totalCents - commissionCents, commissionCents };
}

/** input[type=range] stylé tokens : piste `line`, pouce `accent` cerclé `ink`. */
const RANGE_CLS =
  "mt-6 h-2 w-full cursor-pointer appearance-none rounded-badge bg-line " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 " +
  "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-badge [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink " +
  "[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md " +
  "[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-badge " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-accent";

/** Reveal au scroll charte §4 (fade + 16 px, once) ; reduced-motion → statique. */
function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Variante A — carte-quittance : le barème comme une pièce comptable.
 * Phrase du slider = copy deck §3 mot pour mot, elle sert de label au range.
 */
export function BaremeVarianteA() {
  const id = useId();
  const [euros, setEuros] = useState(DEFAULT_EUROS);
  const totalCents = euros * 100;
  const { partCents, commissionCents } = splitCents(totalCents);

  return (
    <section className="bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          {/* Copy deck §3, titre mot pour mot. */}
          <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Notre rémunération, en toute <Marker>transparence</Marker>
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[7fr_5fr]">
          <Reveal delay={0.1}>
            {/* Copy deck §3, phrase slider mot pour mot — montants mono `tabular`. */}
            <label htmlFor={id} className="block max-w-2xl text-lg leading-relaxed text-ink">
              Si nous récupérons{" "}
              <span className="tabular whitespace-nowrap font-mono font-medium">
                {formatEUR(totalCents)}
              </span>{" "}
              → vous recevez{" "}
              <span className="tabular whitespace-nowrap font-mono font-medium text-refund-text">
                {formatEUR(partCents, { decimals: true })}
              </span>
              , notre commission est de{" "}
              <span className="tabular whitespace-nowrap font-mono font-medium">
                {formatEUR(commissionCents, { decimals: true })}
              </span>
              .
            </label>
            <input
              id={id}
              type="range"
              min={MIN_EUROS}
              max={MAX_EUROS}
              step={STEP_EUROS}
              value={euros}
              onChange={(e) => setEuros(Number(e.target.value))}
              aria-valuetext={formatEUR(totalCents)}
              className={RANGE_CLS}
            />
            <div className="mt-2 flex justify-between font-mono text-xs tabular text-ink/50">
              <span>{formatEUR(MIN_EUROS * 100)}</span>
              <span>{formatEUR(MAX_EUROS * 100)}</span>
            </div>
            {/* Copy deck §3, rappel mot pour mot — [AVOCAT] : formulation exacte
                des conditions d'arrêt à valider avant prod. */}
            <p className="mt-8 max-w-xl border-l-4 border-accent pl-4 text-sm font-medium leading-relaxed text-ink/80">
              Rien récupéré ? Rien payé. Vous pouvez arrêter à tout moment.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            {/* TODO_COPY — libellés des lignes du barème (hors copy deck §3) ;
                « vous recevez » repris de la phrase du deck. */}
            <QuittanceCard
              reference="Barème TropPayé"
              kind="Simulation"
              className="shadow-xl"
              rows={[
                { label: "Sommes récupérées", cents: totalCents },
                { label: `Votre part — ${PCT_PART} %`, cents: partCents, highlight: true },
                { label: `Notre commission — ${PCT_COMMISSION} %`, cents: commissionCents },
              ]}
              total={{ label: "Vous recevez", cents: partCents }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
