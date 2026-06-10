"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { CONFIDENCE_LABEL, OUTCOME_TITLE, formatEur, type Confidence, type Outcome } from "@troppaye/rules-engine";
import { motionTokens } from "@troppaye/shared";
import { Stamp } from "@/components/brand/Stamp";
import { frenchDate } from "@/lib/format-date";

/** Montant qui s'incrémente (0 → cents), figé si `prefers-reduced-motion`. */
function CountUp({ cents, className }: { cents: number; className?: string }) {
  const reduce = useReducedMotion();
  const value = useSpring(0, { stiffness: 55, damping: 18, mass: 1 });
  const text = useTransform(value, (v) => formatEur(Math.round(v)));

  useEffect(() => {
    if (reduce) value.jump(cents);
    else value.set(cents);
    // `value` est une MotionValue stable (identité conservée) : hors deps volontairement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cents, reduce]);

  return <motion.span className={className}>{text}</motion.span>;
}

export function VerdictHero({
  outcome,
  addressLabel,
  totalRecoverableCents,
  totalFutureMonthlySavingCents,
  confidence,
  asOf,
}: {
  outcome: Outcome;
  addressLabel: string;
  totalRecoverableCents: number;
  totalFutureMonthlySavingCents: number;
  confidence: Confidence;
  asOf: string;
}) {
  const reduce = useReducedMotion();
  const irregular = outcome === "IRREGULAR";

  return (
    <section className="relative mt-10 border-b border-line pb-10">
      {irregular ? (
        <motion.div
          className="pointer-events-none absolute right-0 top-0 hidden sm:block"
          initial={reduce ? false : { opacity: 0, y: -56, scale: 1.7, rotate: -14 }}
          animate={{ opacity: 0.92, y: 0, scale: 1, rotate: 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", ...motionTokens.stampSpring, delay: 0.15 }}
        >
          <Stamp size={132} />
        </motion.div>
      ) : null}

      {addressLabel ? <p className="font-mono text-sm text-ink/55">{addressLabel}</p> : null}
      <h1 className="mt-2 max-w-[14ch] font-display text-2xl font-extrabold tracking-display sm:text-[40px]">
        {OUTCOME_TITLE[outcome]}
      </h1>

      {irregular ? (
        <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-4">
          <div>
            <p className="text-sm text-ink/60">Trop-perçu récupérable</p>
            <CountUp
              cents={totalRecoverableCents}
              className="font-mono tabular text-[40px] font-medium text-refund-text sm:text-hero"
            />
          </div>
          {totalFutureMonthlySavingCents > 0 ? (
            <div>
              <p className="text-sm text-ink/60">Économie à venir</p>
              <span className="font-mono tabular text-2xl font-medium text-refund-text">
                {formatEur(totalFutureMonthlySavingCents)}
                <span className="text-base text-ink/60">/mois</span>
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 max-w-2xl text-ink/70">
          {outcome === "COMPLIANT"
            ? "D'après les éléments fournis, aucun trop-perçu chiffrable n'a été détecté."
            : "Il manque des informations pour chiffrer votre situation — complétez les points signalés ci-dessous."}
        </p>
      )}

      <p className="mt-5 text-sm text-ink/50">
        {CONFIDENCE_LABEL[confidence]} · évalué le {frenchDate(asOf)}
      </p>
    </section>
  );
}
