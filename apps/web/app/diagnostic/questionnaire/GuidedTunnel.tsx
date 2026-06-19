"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useDiagnosticForm } from "./use-diagnostic-form";
import { CHAPTERS, QUESTIONS, canSubmit } from "./question-graph";
import {
  applicableQuestions,
  firstUnansweredId,
  nextQuestionId,
  resolveActiveId,
  revealOrder,
} from "./reveal-state";
import { ConfirmedBlock } from "./ui/ConfirmedBlock";
import { ActiveQuestion } from "./ui/ActiveQuestion";
import { ChapterRail } from "./ui/ChapterRail";
import { AnticipationBar } from "./ui/AnticipationBar";
import { RecapQ } from "./questions/recap";

const STORAGE = "tp_diagnostic_active_v1";

/** Chrome allégé du tunnel : logo + « Étape X sur Y » (repris de Questionnaire). */
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

/** Libellé court du bloc confirmé : titre du chapitre de la question. */
function chapterLabel(chapter: string): string {
  return CHAPTERS.find((c) => c.id === chapter)?.title ?? "";
}

export function GuidedTunnel() {
  const { draft, setField, hydrated, submit, submitting, error } = useDiagnosticForm();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Marque la question rouverte via « modifier » : on saute exactement le
  // premier passage de l'effet de résolution pour ne pas la faire rebondir.
  const editingRef = useRef<string | null>(null);

  // Restaure la question active après hydratation (ou première non répondue / recap).
  useEffect(() => {
    if (!hydrated || ready) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE);
    } catch {
      /* private mode : on repart du calcul */
    }
    // L'id restauré doit être APPLICABLE au draft courant (pas seulement exister
    // dans QUESTIONS) : sinon "recap" reste valide, sinon on recalcule.
    const valid =
      saved &&
      (saved === "recap" || applicableQuestions(QUESTIONS, draft).some((q) => q.id === saved))
        ? saved
        : null;
    setActiveId(valid ?? firstUnansweredId(QUESTIONS, draft) ?? "recap");
    setReady(true);
  }, [hydrated, ready, draft]);

  // Persiste la question active.
  useEffect(() => {
    if (!ready || activeId === null) return;
    try {
      localStorage.setItem(STORAGE, activeId);
    } catch {
      /* non bloquant */
    }
  }, [activeId, ready]);

  // Avance : prochaine question applicable, ou recap si c'était la dernière.
  // Utilisé par le bouton « Continuer » et les pilules (`goNext`).
  const advance = useCallback(() => {
    setActiveId((cur) => {
      const next = cur ? nextQuestionId(QUESTIONS, draft, cur) : null;
      return next ?? "recap";
    });
  }, [draft]);

  // Effet unique de résolution de l'`activeId` : auto-avance des pilules ET
  // garde anti-saut (id non applicable → première non répondue / recap).
  // `resolveActiveId` est pur et renvoie l'id INCHANGÉ quand rien ne bouge ; on
  // ne `setState` que sur changement effectif → aucune boucle. L'`editingRef`
  // neutralise l'auto-avance pour le seul passage suivant un clic « modifier »
  // (BUG 1), puis se vide : l'utilisateur peut re-choisir et l'avance reprend.
  useEffect(() => {
    if (!ready || activeId === null) return;
    const isEditing = editingRef.current === activeId;
    editingRef.current = null;
    const next = resolveActiveId(QUESTIONS, draft, activeId, isEditing);
    if (next !== activeId) setActiveId(next);
  }, [draft, activeId, ready]);

  if (!hydrated || !ready) {
    return (
      <div className="min-h-screen bg-paper">
        <TunnelHeader step={1} total={CHAPTERS.length} />
        <main className="mx-auto max-w-xl px-6 py-10">
          <p className="text-ink/50">Chargement…</p>
        </main>
      </div>
    );
  }

  const reveal = revealOrder(QUESTIONS, draft, activeId);
  const active = reveal[reveal.length - 1];
  const activeChapter = active?.chapter ?? "address";
  const stepNo = CHAPTERS.findIndex((c) => c.id === activeChapter) + 1;
  const isRecap = activeId === "recap";
  const peekId = activeId ? nextQuestionId(QUESTIONS, draft, activeId) : null;
  const submittable = canSubmit(draft);

  return (
    <div className="min-h-screen bg-paper">
      <TunnelHeader step={Math.max(1, stepNo)} total={CHAPTERS.length} />
      <main className="mx-auto max-w-xl px-6 py-10">
        <ChapterRail activeId={activeId} draft={draft} />
        <div className="mt-6">
          <AnticipationBar draft={draft} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {reveal.map((q, idx) => {
            const last = idx === reveal.length - 1;
            if (!last) {
              return (
                <ConfirmedBlock
                  key={q.id}
                  label={chapterLabel(q.chapter)}
                  value={q.summary(draft)}
                  prefilled={q.prefilled?.(draft)}
                  onEdit={() => {
                    editingRef.current = q.id;
                    setActiveId(q.id);
                  }}
                />
              );
            }
            if (isRecap) return null; // recap rendu ci-dessous (avec submit)
            return (
              <ActiveQuestion
                key={q.id}
                question={q}
                draft={draft}
                setField={setField}
                advance={advance}
              />
            );
          })}
        </div>

        {/* Aperçu discret de la question suivante (hors recap). */}
        {!isRecap && peekId && (
          <p className="nb-ghost mt-3 px-4 py-2 text-xs text-ink/45">
            ↓ question suivante
          </p>
        )}

        {isRecap && (
          <div className="mt-6 flex flex-col gap-4">
            <RecapQ draft={draft} setField={setField} />
            <Button onClick={submit} disabled={submitting || !submittable}>
              {submitting ? "Analyse…" : "Voir mon résultat"}
            </Button>
            {error ? (
              <p role="alert" className="text-sm text-stamp">
                {error}
              </p>
            ) : null}
            {!submittable ? (
              // TODO_COPY — hint « complétez … » repris de l'ancien tunnel.
              <p className="text-xs text-ink/50">
                Complétez les informations manquantes pour lancer le diagnostic.
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
