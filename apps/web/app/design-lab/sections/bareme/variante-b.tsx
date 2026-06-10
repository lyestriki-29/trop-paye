"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { brand, formatEUR } from "@troppaye/shared";
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

/**
 * Variante B — double barre proportionnelle 75/25 + gros chiffres mono.
 * Phrase du slider = copy deck §3 mot pour mot, elle sert de label au range.
 */
export function BaremeVarianteB() {
  const id = useId();
  const reduced = useReducedMotion();
  const [euros, setEuros] = useState(DEFAULT_EUROS);
  const totalCents = euros * 100;
  const { partCents, commissionCents } = splitCents(totalCents);

  return (
    <section className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        {/* Copy deck §3, titre mot pour mot. */}
        <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Notre rémunération, en toute <Marker>transparence</Marker>
        </h2>

        <div className="mt-10 max-w-2xl">
          {/* Copy deck §3, phrase slider mot pour mot — montants mono `tabular`. */}
          <label htmlFor={id} className="block text-lg leading-relaxed text-ink">
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
        </div>

        {/* Gros chiffres — libellés repris de la phrase du deck (« vous recevez » /
            « notre commission »). */}
        <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/55">Vous recevez</p>
            <p className="mt-3 tabular whitespace-nowrap font-mono text-2xl font-medium text-refund-text sm:text-[56px] sm:leading-none">
              {formatEUR(partCents, { decimals: true })}
            </p>
            <p className="mt-2 font-mono text-xs tabular text-ink/50">{PCT_PART} %</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink/55">
              Notre commission
            </p>
            <p className="mt-3 tabular whitespace-nowrap font-mono text-2xl font-medium text-ink sm:text-[56px] sm:leading-none">
              {formatEUR(commissionCents, { decimals: true })}
            </p>
            <p className="mt-2 font-mono text-xs tabular text-ink/50">{PCT_COMMISSION} %</p>
          </div>
        </div>

        {/* Double barre proportionnelle (constante 75/25) — duplique les chiffres
            ci-dessus, donc décorative (aria-hidden). Elle se dessine une fois.
            Le whileInView vit sur le CONTENEUR (taille pleine, observer fiable) ;
            les segments, à largeur nulle au départ, suivent via variants. */}
        <div aria-hidden="true" className="mt-10">
          <motion.div
            className="flex h-12 overflow-hidden rounded-card border border-line bg-paper-2"
            initial={reduced ? "shown" : "hidden"}
            whileInView="shown"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.span
              className="block w-3/4 origin-left bg-refund"
              variants={{
                hidden: { scaleX: 0 },
                shown: { scaleX: 1, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            />
            <motion.span
              className="block w-1/4 origin-left bg-ink"
              variants={{
                hidden: { scaleX: 0 },
                shown: { scaleX: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
              }}
            />
          </motion.div>
          <div className="mt-2 flex font-mono text-xs tabular text-ink/55">
            <span className="w-3/4">
              {PCT_PART} % — {formatEUR(partCents, { decimals: true })}
            </span>
            <span className="w-1/4 text-right">{PCT_COMMISSION} %</span>
          </div>
        </div>

        {/* Copy deck §3, rappel mot pour mot — [AVOCAT] : formulation exacte
            des conditions d'arrêt à valider avant prod. */}
        <p className="mt-10 max-w-xl border-l-4 border-accent pl-4 text-sm font-medium leading-relaxed text-ink/80">
          Rien récupéré ? Rien payé. Vous pouvez arrêter à tout moment.
        </p>
      </div>
    </section>
  );
}
