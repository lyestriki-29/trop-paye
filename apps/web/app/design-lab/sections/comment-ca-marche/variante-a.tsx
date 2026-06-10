"use client";

import type { ComponentType, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatEUR } from "@troppaye/shared";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Marker } from "@/app/design-lab/directions/v2/home/sections-hero";
import {
  IconHandCoins,
  IconPenLine,
  IconSearch,
} from "@/app/design-lab/directions/v2/home/sections-steps";

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

/** Artefact 01 — mini-quittance : « la preuve est la décoration » (charte §5). */
function ArtefactQuittance() {
  return (
    <div aria-hidden="true">
      {/* TODO_COPY — libellés spécimen (vocabulaire document, hors copy deck) ;
          chiffres = témoin P0 (71,85 €/mois), données fictives. */}
      <QuittanceCard
        reference="Réf. TP-2026-0117"
        kind="Quittance"
        rows={[
          { label: "Loyer payé", cents: 102_185 },
          { label: "Plafond légal", cents: 95_000 },
          { label: "Différence", cents: 7_185, highlight: true },
        ]}
      />
    </div>
  );
}

/** Artefact 02 — trait de signature (aplats ink/line, charte §2 illustration). */
function ArtefactSignature() {
  return (
    <div aria-hidden="true" className="rounded-card border border-line bg-paper px-5 pb-4 pt-6">
      <svg viewBox="0 0 180 44" fill="none" aria-hidden="true" className="h-11 w-full text-ink">
        <path
          d="M10 32 C 26 6, 38 8, 42 24 C 45 34, 56 32, 62 18 C 68 7, 76 12, 78 24 C 80 33, 92 30, 102 21 C 116 9, 134 14, 144 19 C 152 23, 160 21, 168 16"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </svg>
      {/* TODO_COPY — mentions du cartouche signature (hors copy deck). */}
      <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[10px] uppercase tracking-widest text-ink/50">
        <span>Signé en ligne</span>
        <span className="tabular">10/06/2026</span>
      </div>
    </div>
  );
}

/** Artefact 03 — liasse de billets stylisée (aplats ink/line) + reversement mono. */
function ArtefactLiasse() {
  return (
    <div aria-hidden="true" className="rounded-card border border-line bg-paper px-5 pb-4 pt-5">
      <div className="relative h-[72px]">
        <span className="absolute inset-x-4 bottom-0 h-9 rounded-field border border-line bg-paper-2" />
        <span className="absolute inset-x-2 bottom-3 h-9 rounded-field border border-line bg-paper-2" />
        <span className="absolute inset-x-0 bottom-6 h-9 overflow-hidden rounded-field border border-ink/25 bg-paper shadow-sm">
          {/* La bande qui ceinture la liasse : le surligneur `accent`, marquage ponctuel. */}
          <span className="absolute inset-y-0 left-1/2 w-9 -translate-x-1/2 bg-accent" />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/55">€</span>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink/55">€</span>
        </span>
      </div>
      {/* TODO_COPY — libellé du reversement (hors copy deck) ; 75 % du témoin 1 437,00 €. */}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-2.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Reversé au locataire
        </span>
        <span className="tabular whitespace-nowrap font-mono text-sm font-medium text-refund-text">
          + {formatEUR(107_775, { decimals: true })}
        </span>
      </div>
    </div>
  );
}

/** Copy deck §1 « Comment ça marche », mot pour mot. */
const STEPS: ReadonlyArray<{
  Icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  Artefact: ComponentType;
}> = [
  {
    Icon: IconSearch,
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
    Artefact: ArtefactQuittance,
  },
  {
    Icon: IconPenLine,
    title: "Mandatez-nous",
    text: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
    Artefact: ArtefactSignature,
  },
  {
    Icon: IconHandCoins,
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
    Artefact: ArtefactLiasse,
  },
];

/** Variante A — 3 cartes arrondies + icônes, un artefact documentaire par carte. */
export function CommentCaMarcheVarianteA() {
  return (
    <section className="bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <h2 className="font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Comment <Marker>ça marche</Marker>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ Icon, title, text, Artefact }, i) => (
            <Reveal key={title} delay={0.1 + i * 0.08} className="h-full">
              <article className="flex h-full flex-col rounded-card border border-line bg-paper p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-badge bg-accent text-ink">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-xs font-medium tabular text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>
                <p className="mt-3 leading-relaxed text-ink/70">{text}</p>
                <div className="mt-auto pt-7">
                  <Artefact />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
