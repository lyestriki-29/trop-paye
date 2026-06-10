"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { brand, formatEUR } from "@troppaye/shared";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";

/**
 * Barème du tunnel mandat — copie adaptée de la Variante A (carte-quittance)
 * arbitrée en P2 Task 1 (design-lab/sections/bareme/variante-a.tsx, intact).
 * Slider initialisé sur le trop-perçu RÉEL du dossier ; recalcul au centime.
 */

/** Bornes du simulateur (variante arbitrée) : 500 € → 5 000 €, pas de 50 €. */
const MIN_EUROS = 500;
const MAX_EUROS = 5_000;
const STEP_EUROS = 50;
/** Dossier sans verdict chiffré (cas limite) : valeur témoin de la variante. */
const FALLBACK_CENTS = 150_000;

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
  "mt-5 h-2 w-full cursor-pointer appearance-none rounded-badge bg-line " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 " +
  "[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-badge [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink " +
  "[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md " +
  "[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-badge " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-accent";

/** Apparition douce au montage (charte §4) ; reduced-motion → statique. */
function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function BaremeMandat({
  dossierRef,
  addressLabel,
  recoverableCents,
}: {
  dossierRef: string;
  addressLabel: string;
  recoverableCents: number;
}) {
  const id = useId();
  const initialCents = recoverableCents > 0 ? recoverableCents : FALLBACK_CENTS;
  const [totalCents, setTotalCents] = useState(initialCents);
  /** Bornes étendues une fois pour contenir le montant réel du dossier. */
  const [bounds] = useState(() => ({
    min: Math.min(MIN_EUROS, Math.floor(initialCents / 100 / STEP_EUROS) * STEP_EUROS),
    max: Math.max(MAX_EUROS, Math.ceil(initialCents / 100 / STEP_EUROS) * STEP_EUROS),
  }));
  const { partCents, commissionCents } = splitCents(totalCents);

  return (
    <section className="mt-10" aria-labelledby={`${id}-titre`}>
      <Reveal>
        {/* Copy deck §3 — Barème, titre mot pour mot. */}
        <h2 id={`${id}-titre`} className="font-display text-xl font-extrabold tracking-display">
          Notre rémunération, en toute <Marker>transparence</Marker>
        </h2>
      </Reveal>

      <Reveal delay={0.08}>
        {/* Copy deck §3, phrase slider mot pour mot — montants mono `tabular`. */}
        <label htmlFor={id} className="mt-5 block leading-relaxed text-ink">
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
          min={bounds.min}
          max={bounds.max}
          step={STEP_EUROS}
          value={Math.round(totalCents / 100)}
          onChange={(e) => setTotalCents(Number(e.target.value) * 100)}
          aria-valuetext={formatEUR(totalCents)}
          className={RANGE_CLS}
        />
        <div className="mt-2 flex justify-between font-mono text-xs tabular text-ink/50">
          <span>{formatEUR(bounds.min * 100)}</span>
          <span>{formatEUR(bounds.max * 100)}</span>
        </div>
      </Reveal>

      <Reveal delay={0.16} className="mt-8">
        {/* TODO_COPY — libellés des lignes du barème (hors copy deck §3) ;
            « vous recevez » repris de la phrase du deck. Réf. réelle du dossier. */}
        <QuittanceCard
          reference={`Réf. dossier ${dossierRef}`}
          kind="Simulation"
          meta={addressLabel || undefined}
          className="shadow-md"
          rows={[
            { label: "Sommes récupérées", cents: totalCents },
            { label: `Votre part — ${PCT_PART} %`, cents: partCents, highlight: true },
            { label: `Notre commission — ${PCT_COMMISSION} %`, cents: commissionCents },
          ]}
          total={{ label: "Vous recevez", cents: partCents }}
        />
      </Reveal>

      <Reveal delay={0.24}>
        {/* Copy deck §3, rappel mot pour mot — [AVOCAT] : formulation exacte
            des conditions d'arrêt à valider avant prod. */}
        <p className="mt-8 border-l-4 border-accent pl-4 text-sm font-medium leading-relaxed text-ink/80">
          Rien récupéré ? Rien payé. Vous pouvez arrêter à tout moment.
        </p>
      </Reveal>
    </section>
  );
}
