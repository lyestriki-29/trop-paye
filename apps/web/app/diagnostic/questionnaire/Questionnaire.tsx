"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useDiagnosticForm } from "./use-diagnostic-form";
import { STEPS } from "./tunnel-steps";
import { QuestionnaireOnePage } from "./QuestionnaireOnePage";

/** Chrome allégé du tunnel (plan P2 Task 4) : logo + « Étape X sur Y », rien d'autre. */
function TunnelHeader({ step, total }: { step: number; total: number }) {
  return (
    <header className="border-b border-line/70 bg-paper">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label={`${brand.name} — accueil`}>
          <Logo className="text-xl" />
        </Link>
        <p className="tabular font-mono text-xs uppercase tracking-widest text-ink/55">
          Étape {step} sur {total}
        </p>
      </div>
    </header>
  );
}

export function Questionnaire({ onePage = false }: { onePage?: boolean }) {
  const { draft, setField, stepIndex, setStepIndex, hydrated, submit, submitting, error } =
    useDiagnosticForm();
  const reduced = useReducedMotion();

  const i = Math.min(Math.max(stepIndex, 0), STEPS.length - 1);

  // Au changement d'étape, remonter en haut de page (sinon on reste au niveau
  // du bouton « Continuer », en bas). On saute le tout premier rendu pour ne
  // pas voler le scroll de l'utilisateur qui reprend un brouillon.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [i, reduced]);

  // Variante une-page (retour Lyes 2026-06-12) : même état de formulaire, rendu
  // différent. L'early return est APRÈS tous les hooks (ordre stable).
  if (onePage) {
    return (
      <QuestionnaireOnePage
        draft={draft}
        setField={setField}
        hydrated={hydrated}
        submit={submit}
        submitting={submitting}
        error={error}
      />
    );
  }

  const step = STEPS[i]!;
  const isLast = i === STEPS.length - 1;
  const canNext = step.valid(draft);
  const remaining = STEPS.length - i;

  return (
    <div className="min-h-screen bg-paper">
      <TunnelHeader step={i + 1} total={STEPS.length} />
      <main className="mx-auto max-w-xl px-6 py-10">
        {!hydrated ? (
          <p className="text-ink/50">Chargement…</p>
        ) : (
          <>
            {/* Barre de progression animée (charte §4 — micro-interactions). */}
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-valuenow={i + 1}
              aria-valuetext={`Étape ${i + 1} sur ${STEPS.length}`}
              className="h-1 overflow-hidden rounded-badge bg-line"
            >
              <motion.div
                className="h-full rounded-badge bg-ink"
                initial={false}
                animate={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
                transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              />
            </div>
            {/* TODO_COPY — ligne bénéfice (« plus que N questions avant votre estimation »
                absente du copy deck §2) : gabarit posé, texte à valider. */}
            <p className="mt-3 text-xs text-ink/50">
              Plus que {remaining} question{remaining > 1 ? "s" : ""} avant votre estimation.
            </p>

            {/* Transition d'étape slide + fade ; reduced-motion → fondu simple. */}
            <motion.div
              key={i}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.28, ease: "easeOut" }}
            >
              <h1 className="mt-6 font-display text-2xl font-extrabold tracking-display">
                {step.title}
              </h1>
              {step.subtitle ? <p className="mt-2 text-ink/60">{step.subtitle}</p> : null}
              <div className="mt-8">
                <step.Component
                  draft={draft}
                  setField={setField}
                  goNext={() => setStepIndex(Math.min(STEPS.length - 1, i + 1))}
                />
              </div>
            </motion.div>

            {error ? (
              <p role="alert" className="mt-4 text-sm text-stamp">
                {error}
              </p>
            ) : null}

            <div className="mt-10 flex items-center justify-between gap-4">
              {i > 0 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStepIndex(Math.max(0, i - 1))}
                  disabled={submitting}
                >
                  ← Retour
                </Button>
              ) : (
                <span aria-hidden />
              )}
              {isLast ? (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Analyse…" : "Voir mon résultat"}
                </Button>
              ) : (
                <Button
                  onClick={() => setStepIndex(Math.min(STEPS.length - 1, i + 1))}
                  disabled={!canNext}
                >
                  Continuer
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
