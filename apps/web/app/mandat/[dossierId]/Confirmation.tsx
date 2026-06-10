"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { DossierStatus } from "@troppaye/shared";
import { Button } from "@/components/ui/Button";
import { Frise, type FriseStep } from "@/components/ui/Frise";

/* TODO_COPY — libellés de frise hors deck, alignés sur les états de
   dossier-state-machine (IN_REVIEW → RECOVERY/ESCALATED → WON|LOST → CLOSED) ;
   « Issue du dossier » volontairement neutre (jamais de promesse de résultat). */
const STEP_LABELS = [
  "Dossier transmis",
  "Vérification en cours",
  "Démarche amiable engagée",
  "Issue du dossier",
] as const;

/** Étape courante selon l'état réel — l'écran reste juste si on y revient plus tard. */
const CURRENT_STEP: Partial<Record<DossierStatus, number>> = {
  IN_REVIEW: 1,
  RECOVERY: 2,
  ESCALATED: 2,
  WON: 3,
  LOST: 3,
  CLOSED: 3,
};

function buildSteps(status: DossierStatus): FriseStep[] {
  const current = CURRENT_STEP[status] ?? 1;
  return STEP_LABELS.map((label, i) => ({
    label,
    state: i < current ? "done" : i === current ? "current" : "todo",
  }));
}

/** Apparition douce au montage (« effet c'est parti ») ; reduced-motion → statique. */
function Reveal({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
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

/** Écran de confirmation du tunnel mandat (dossier transmis, IN_REVIEW et au-delà). */
export function Confirmation({
  dossierId,
  dossierRef,
  status,
}: {
  dossierId: string;
  dossierRef: string;
  status: DossierStatus;
}) {
  return (
    <div className="mt-10">
      <Reveal delay={0}>
        {/* Copy deck §3 — Confirmation : titre mot pour mot. */}
        <h1 className="font-display text-2xl font-extrabold tracking-display">C'est parti.</h1>
      </Reveal>

      <Reveal delay={0.15}>
        {/* Copy deck §3 — Confirmation : texte mot pour mot, {référence} = réf. réelle. */}
        <p className="mt-4 max-w-prose leading-relaxed text-ink/70">
          Votre dossier <span className="tabular font-mono text-ink">{dossierRef}</span> est en
          cours de vérification par notre équipe (sous 48 h ouvrées). Vous serez informé(e) de
          chaque étape par email — vous n'avez plus rien à faire.
        </p>
      </Reveal>

      <Reveal delay={0.3}>
        {/* Fond `paper` : les pastilles `todo` du StepBadge sont en `paper-2`. */}
        <div className="mt-8 rounded-card border border-line bg-paper p-6">
          <Frise steps={buildSteps(status)} />
        </div>
      </Reveal>

      <Reveal delay={0.45}>
        {/* TODO_COPY — libellé CTA hors deck (existant conservé). */}
        <Button href={`/espace/${dossierId}`} className="mt-8">
          Voir mon dossier
        </Button>
      </Reveal>
    </div>
  );
}
