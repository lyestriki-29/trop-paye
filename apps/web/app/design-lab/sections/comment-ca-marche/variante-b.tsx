"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatEUR } from "@troppaye/shared";
import { StepBadge } from "@/components/ui/StepBadge";
import { Marker } from "@/app/design-lab/directions/v2/home/sections-hero";

/** Reveal au scroll charte §4 (fade + 16 px, once) ; reduced-motion → statique. */
function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
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

/** Copy deck §1 « Comment ça marche », mot pour mot. */
const STEPS = [
  {
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
  },
  {
    title: "Mandatez-nous",
    text: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
  },
  {
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
  },
] as const;

/** Spécimen central — courrier recommandé AR stylisé (aplats ink/line, charte §2). */
function CourrierSpecimen() {
  return (
    <figure aria-hidden="true" className="relative mx-auto w-full max-w-md">
      {/* Feuille du dessous : la pile de documents du dossier. */}
      <span className="absolute inset-0 translate-x-2 translate-y-2 rounded-card border border-line bg-paper-2" />
      <div className="relative -rotate-1 overflow-hidden rounded-card border border-line bg-paper shadow-xl transition duration-300 hover:rotate-0">
        {/* TODO_COPY — libellés du spécimen courrier (hors copy deck) ; n° fictif. */}
        <div className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-ink/55">
          <span>Lettre recommandée AR</span>
          <span className="tabular">N° 1A 234 567 8901 2</span>
        </div>
        <div className="px-5 py-5">
          <p className="font-mono text-xs text-ink/55">Réf. dossier TP-2026-0117</p>
          {/* Corps du courrier stylisé : lignes de texte en aplats `line`. */}
          <div className="mt-4 space-y-2.5">
            <span className="block h-2 w-3/4 rounded-badge bg-line" />
            <span className="block h-2 w-full rounded-badge bg-line" />
            <span className="block h-2 w-5/6 rounded-badge bg-line" />
            <span className="block h-2 w-1/2 rounded-badge bg-line/70" />
          </div>
          {/* « Montant réclamé » : libellé repris du copy deck §4 (email n° 2). */}
          <div className="mt-5 flex items-end justify-between gap-6 border-t-2 border-ink pt-4">
            <span className="text-sm font-medium text-ink/80">Montant réclamé</span>
            <span className="tabular whitespace-nowrap font-mono text-xl font-medium text-refund-text">
              {formatEUR(143_700, { decimals: true })}
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-xs text-ink/45">
        {/* TODO_COPY — légende interne du témoin, hors copy deck. */}
        Courrier spécimen — données fictives
      </figcaption>
    </figure>
  );
}

/** Variante B — frise horizontale numérotée 01/02/03, filets documentaires, spécimen central. */
export function CommentCaMarcheVarianteB() {
  return (
    <section className="bg-paper py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Comment <Marker>ça marche</Marker>
          </h2>
        </Reveal>

        <div className="relative mt-12">
          {/* Filets documentaires : vertical (mobile) / horizontal (desktop), traversant les pastilles. */}
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-4 top-4 w-px -translate-x-1/2 bg-line md:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-4 hidden h-px bg-line md:block"
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={0.1 + i * 0.08} className="relative flex gap-4 md:block">
                  <StepBadge
                    state={i === 0 ? "current" : "todo"}
                    className="relative ring-4 ring-paper"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </StepBadge>
                  <div className="md:mt-5">
                    <h3 className="font-display text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 max-w-sm leading-relaxed text-ink/70">{step.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Reveal delay={0.3} className="mt-4">
          <span
            aria-hidden="true"
            className="mx-auto block h-12 w-px border-l border-dashed border-line"
          />
          <CourrierSpecimen />
        </Reveal>
      </div>
    </section>
  );
}
