"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { Confidence } from "@troppaye/rules-engine";
import { formatEUR, motionTokens } from "@troppaye/shared";
import { Stamp } from "@/components/brand/Stamp";
import { Button } from "@/components/ui/Button";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { IconArrowRight } from "@/components/home/icons";
import type { PrescriptionInfo } from "@/lib/diagnostic/prescription";
import { ConfidenceNote, PrescriptionNote } from "./SequenceNotes";

export interface SequenceLine {
  label: string;
  detail?: string;
  cents: number;
}

/** Délais cumulés (s) — adaptés au nombre réel de lignes (charte §4, ordre EXACT). */
function timeline(lineCount: number) {
  const lines = 1.0;
  const sweep = lines + lineCount * 0.08 + 0.4;
  const count = sweep + 0.2;
  const cta = count + 1 + 0.2;
  return { phrase: 0.3, title: 0.7, lines, lineStep: 0.08, sweep, count, cta, stamp: cta + 0.3 };
}

/** Glyphe Lucide « sparkle » inliné (lucide-react absent du workspace). */
function IconSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
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

export function VerdictSequenceLive({
  reference,
  addressLabel,
  lines,
  totalRecoverableCents,
  futureMonthlySavingCents,
  confidence,
  dpeNumber,
  prescription,
  mandateHref,
}: {
  reference: string;
  addressLabel: string;
  lines: ReadonlyArray<SequenceLine>;
  totalRecoverableCents: number;
  futureMonthlySavingCents: number;
  confidence: Confidence;
  dpeNumber: string | null;
  prescription: PrescriptionInfo | null;
  mandateHref: string;
}) {
  const reduced = useReducedMotion();
  const t = timeline(lines.length);
  const [cents, setCents] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, totalRecoverableCents, {
      delay: t.count,
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setCents(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reduced, totalRecoverableCents, t.count]);

  const shownCents = reduced ? totalRecoverableCents : cents;

  return (
    <motion.div
      className="relative"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
    >
      {/* LE tampon — UNIQUEMENT ici (verdict gagné, charte §1) : claque après le
          count-up, scale 1.4→1, −6° (porté par le SVG), spring raide ; posé si reduced. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-7 z-10 sm:-right-6"
        initial={reduced ? false : { opacity: 0, scale: 1.4, rotate: -8 }}
        animate={{ opacity: 0.92, scale: 1, rotate: 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", ...motionTokens.stampSpring, delay: t.stamp }}
      >
        <Stamp size={116} />
      </motion.div>

      {/* TODO_COPY — libellés d'en-tête de document (hors copy deck). */}
      <QuittanceCard reference={`Réf. dossier ${reference}`} kind="Verdict" meta={addressLabel} spotlight className="shadow-xl">
        <Reveal delay={t.phrase} className="mt-5">
          {/* TODO_COPY : accroche héritée du témoin design-lab, à valider. */}
          <p className="inline-flex items-center gap-2 rounded-badge bg-refund/10 px-4 py-2 text-sm font-semibold text-refund-text">
            <IconSparkle className="h-4 w-4" />
            Bonne nouvelle : la loi est de votre côté.
          </p>
        </Reveal>

        <Reveal delay={t.title} className="mt-5">
          <h1 className="font-display text-2xl font-extrabold tracking-display sm:text-[44px] sm:leading-[1.08]">
            Vous avez trop payé.
          </h1>
        </Reveal>

        {/* Les lignes du calcul réel s'impriment une à une (stagger 80 ms, mono). */}
        <dl className="mt-8">
          {lines.map((line, i) => (
            <Reveal
              key={`${line.label}-${i}`}
              delay={t.lines + i * t.lineStep}
              className="flex items-baseline justify-between gap-6 border-b border-dashed border-line py-2.5"
            >
              <dt className="text-sm text-ink/70">
                {line.label}
                {line.detail ? <span className="text-ink/45"> — {line.detail}</span> : null}
              </dt>
              <dd className="tabular whitespace-nowrap font-mono text-sm text-ink">
                {formatEUR(line.cents, { decimals: true })}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={t.sweep - 0.15} className="mt-9 border-t-2 border-ink pt-6">
          {/* TODO_COPY : libellé document (le deck dit « {X} € récupérables » ci-dessous). */}
          <p className="text-sm font-medium text-ink/60">Trop-perçu sur la période</p>
          <p className="mt-2">
            <span className="relative inline-block">
              <motion.span
                aria-hidden
                className="absolute bottom-1 left-0 h-6 rounded-field bg-accent sm:bottom-2 sm:h-9"
                initial={reduced ? false : { width: "0%" }}
                animate={{ width: "100%" }}
                transition={reduced ? { duration: 0 } : { duration: 0.4, delay: t.sweep, ease: "easeOut" }}
              />
              {/* Gabarit invisible : fige la largeur → le surligneur balaie proprement. */}
              <span aria-hidden className="invisible font-mono text-[40px] font-medium tabular sm:text-hero">
                {formatEUR(totalRecoverableCents, { decimals: true })}
              </span>
              <span aria-hidden className="absolute inset-0 font-mono text-[40px] font-medium text-refund-text tabular sm:text-hero">
                {formatEUR(shownCents, { decimals: true })}
              </span>
              <span className="sr-only">{formatEUR(totalRecoverableCents, { decimals: true })}</span>
            </span>
          </p>
          <p className="mt-3 text-base text-ink/70">
            récupérables
            {futureMonthlySavingCents > 0 ? (
              <>
                {" · "}
                <span className="font-mono tabular">+ {formatEUR(futureMonthlySavingCents, { decimals: true })}</span>
                /mois d&apos;économie à venir
              </>
            ) : null}
          </p>
        </Reveal>

        <Reveal delay={t.cta - 0.4} className="mt-8">
          <ConfidenceNote confidence={confidence} dpeNumber={dpeNumber} />
        </Reveal>

        {prescription ? (
          <Reveal delay={t.cta - 0.25} className="mt-4">
            <PrescriptionNote prescription={prescription} />
          </Reveal>
        ) : null}

        <Reveal delay={t.cta} className="mt-9">
          <Button href={mandateHref} size="lg" className="group w-full">
            <span>
              Récupérer mes <span className="font-mono tabular">{formatEUR(totalRecoverableCents)}</span>
            </span>
            <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Reveal>
      </QuittanceCard>
    </motion.div>
  );
}
