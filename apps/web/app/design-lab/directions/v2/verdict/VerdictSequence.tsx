"use client";

import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { formatEUR } from "@troppaye/shared";
import { IconArrowRight } from "@/app/design-lab/directions/v2/home/sections-steps";

/**
 * Séquence verdict V2 — mécanique D3 (fade → surligneur → count-up → CTA
 * pilule), contenu D1 (quittance détaillée : les lignes s'impriment une à
 * une avant le balayage). Pas de tampon ici (réservé identité + réseaux).
 * Scénario témoin fixe (plan P0, écran 2) — données fictives, cohérentes
 * ligne à ligne : 71,85 € × 20 mois = 1 437,00 €.
 */
const SCENARIO = {
  reference: "TP-2026-0117",
  address: "12 rue des Lilas, 75011 Paris",
  totalCents: 143_700,
  /** = la différence mensuelle (le spécimen reste cohérent au centime). */
  monthlyCents: 7_185,
  lines: [
    { label: "Loyer payé depuis le 01/09/2023", cents: 102_185, refund: false },
    { label: "Plafond légal (gel DPE F/G)", cents: 95_000, refund: false },
    { label: "Différence mensuelle", cents: 7_185, refund: true },
  ],
} as const;

/** Timeline (délais cumulés, en secondes) — les lignes s'impriment AVANT le surligneur. */
const T = {
  phrase: 0.3,
  title: 0.7,
  lines: 1.0,
  lineStep: 0.08,
  sweep: 1.7,
  count: 1.9,
  countDuration: 1,
  cta: 3.1,
} as const;

/** Glyphe Lucide inliné (sparkle) — lucide-react absent du workspace. */
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

function Sequence() {
  const reduced = useReducedMotion();
  const [cents, setCents] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, SCENARIO.totalCents, {
      delay: T.count,
      duration: T.countDuration,
      ease: "easeOut",
      onUpdate: (latest) => setCents(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reduced]);

  const shownCents = reduced ? SCENARIO.totalCents : cents;

  return (
    <motion.section
      className="overflow-hidden rounded-card border border-line bg-paper shadow-xl"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
    >
      {/* En-tête document (D1) : référence + nature de la pièce, mono petites capitales. */}
      <div className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-7 py-3 font-mono text-[11px] uppercase tracking-widest text-ink/55 sm:px-12">
        {/* TODO_COPY — libellés d'en-tête de document (hors copy deck) */}
        <span>Réf. dossier {SCENARIO.reference}</span>
        <span>Verdict</span>
      </div>

      <div className="p-7 sm:p-12">
        <Reveal delay={0}>
          <p className="font-mono text-sm text-ink/55">{SCENARIO.address}</p>
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

        {/* Les lignes de la quittance s'impriment une à une (stagger 80 ms, mono). */}
        <dl className="mt-8">
          {SCENARIO.lines.map((line, i) => (
            <Reveal
              key={line.label}
              delay={T.lines + i * T.lineStep}
              className="flex items-baseline justify-between gap-6 border-b border-dashed border-line py-3"
            >
              <dt className="text-sm text-ink/65">{line.label}</dt>
              <dd
                className={`tabular whitespace-nowrap font-mono text-sm ${
                  line.refund ? "font-medium text-refund-text" : "text-ink"
                }`}
              >
                {line.refund ? "+ " : ""}
                {formatEUR(line.cents, { decimals: true })}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={T.sweep - 0.15} className="mt-9 border-t-2 border-ink pt-6">
          {/* TODO_COPY : libellé hors copy deck (le verdict y dit « {X} € récupérables »). */}
          <p className="text-sm font-medium text-ink/60">Trop-perçu sur la période</p>
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
                {formatEUR(SCENARIO.totalCents, { decimals: true })}
              </span>
              <span className="absolute inset-0 font-mono text-[40px] font-medium text-refund-text tabular sm:text-hero">
                {formatEUR(shownCents, { decimals: true })}
              </span>
            </span>
          </p>
          <p className="mt-3 text-base text-ink/70">
            récupérables ·{" "}
            <span className="font-mono tabular">
              + {formatEUR(SCENARIO.monthlyCents, { decimals: true })}
            </span>
            /mois d&apos;économie à venir
          </p>
        </Reveal>

        <Reveal delay={T.cta - 0.4} className="mt-8 rounded-card bg-paper-2 p-5">
          <p className="text-sm font-semibold text-refund-text">Confiance élevée</p>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">
            {/* Le n° de DPE est fictif (spécimen). */}
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
              Récupérer mes{" "}
              <span className="font-mono tabular">{formatEUR(SCENARIO.totalCents)}</span>
            </span>
            <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>
    </motion.section>
  );
}

/** Séquence + commande de rejeu (chrome design-lab, hors copy produit). */
export function VerdictSequence() {
  const [run, setRun] = useState(0);
  return (
    <div>
      <Sequence key={run} />
      <p className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="rounded-badge border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink/60 transition hover:border-ink/40 hover:text-ink"
        >
          Rejouer la séquence
        </button>
      </p>
    </div>
  );
}
