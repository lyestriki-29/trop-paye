"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@troppaye/shared";
import { LogoNb } from "@/components/ui/LogoNb";
import { useDiagnosticForm } from "./use-diagnostic-form";
import { CHAPTERS, QUESTIONS, canSubmit } from "./question-graph";
import {
  applicableQuestions,
  initialActiveId,
  nextQuestionId,
  resolveActiveId,
  revealOrder,
} from "./reveal-state";
import { ActiveQuestion } from "./ui/ActiveQuestion";
import { ChapterRail } from "./ui/ChapterRail";
import { AnticipationBar } from "./ui/AnticipationBar";
import { DossierPanel } from "./ui/DossierPanel";

const STORAGE = "tp_diagnostic_active_v1";

/** Libellés courts par champ pour le panneau dossier (fallback : titre de chapitre). */
const FIELD_LABEL: Record<string, string> = {
  address: "Adresse",
  dpe: "DPE",
  surface: "Surface",
  construction: "Époque",
  furnished: "Meublé",
  rooms: "Pièces",
  shared: "Colocation",
  tenantCount: "Colocataires",
  rentBasis: "Base loyer",
  rentMode: "Mode loyer",
  currentRent: "Loyer actuel",
  initialRent: "Loyer de départ",
  charges: "Charges",
  deposit: "Dépôt",
  supplement: "Complément",
  leaseDate: "Signature du bail",
  revisionClause: "Clause de révision",
  revisionHistory: "Hausses",
};

/** Chrome nb du tunnel : logo tampon + badge violet « Étape X sur Y ». */
function TunnelHeaderNb({ step, total }: { step: number; total: number }) {
  return (
    <header className="shrink-0 border-b-[3px] border-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label={`${brand.name} — accueil`} className="flex items-center">
          <LogoNb size={44} />
        </Link>
        <p className="border-2 border-ink bg-violet px-3 py-1 font-mono text-xs font-black uppercase tracking-widest text-ink">
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
    // `recap` n'est restauré que si le dossier est SOUMETTABLE : un "recap"
    // périmé (session précédente) ne doit pas enfermer un nouveau visiteur au
    // récap. Sinon : id de question restauré s'il est applicable, à défaut la
    // 1re non répondue (cf. initialActiveId).
    setActiveId(initialActiveId(QUESTIONS, draft, saved, canSubmit(draft)));
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
      <div className="flex min-h-screen flex-col">
        <TunnelHeaderNb step={1} total={CHAPTERS.length} />
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
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
  const submittable = canSubmit(draft);

  // Dossier = toutes les questions applicables RÉPONDUES, hors la question active
  // (éditée à gauche) et hors recap. Chaque ligne rouvre sa question à gauche.
  const dossierRows = applicableQuestions(QUESTIONS, draft)
    .filter((q) => q.id !== "recap" && q.id !== activeId && q.isAnswered(draft))
    .map((q) => ({
      id: q.id,
      label: FIELD_LABEL[q.id] ?? chapterLabel(q.chapter),
      value: q.summary(draft),
      prefilled: q.prefilled?.(draft),
      onEdit: () => {
        editingRef.current = q.id;
        setActiveId(q.id);
      },
    }));

  const dossierFooter = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={submit}
        disabled={submitting || !submittable}
        className="nb-pill nb-pill--ink w-full px-4 py-3 text-sm font-black disabled:opacity-50"
      >
        {submitting ? "Analyse…" : "Voir mon résultat"}
      </button>
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
  );

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <TunnelHeaderNb step={Math.max(1, stepNo)} total={CHAPTERS.length} />

      <div
        className={`mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 py-4 lg:min-h-0 lg:gap-6 lg:py-6${
          isRecap ? "" : " lg:grid-cols-[1fr_22rem]"
        }`}
      >
        {/* Colonne gauche : progression + question active (ou récap pleine largeur). */}
        <main className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <ChapterRail activeId={activeId} draft={draft} />
          <AnticipationBar draft={draft} />

          {isRecap ? (
            // Récap final : la synthèse du dossier ET le CTA passent au centre,
            // pleine largeur (le rail de droite est masqué pour éviter le doublon).
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <p className="text-sm text-ink/70">
                Vérifiez vos réponses puis lancez le diagnostic.
              </p>
              <div className="min-h-0 flex-1">
                <DossierPanel rows={dossierRows} footer={dossierFooter} />
              </div>
            </div>
          ) : active ? (
            <ActiveQuestion
              key={active.id}
              question={active}
              draft={draft}
              setField={setField}
              advance={advance}
            />
          ) : null}
        </main>

        {/* Colonne droite : panneau dossier éditable + CTA (masqué sur le récap). */}
        {isRecap ? null : <DossierPanel rows={dossierRows} footer={dossierFooter} />}
      </div>
    </div>
  );
}
