"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Database } from "@/lib/supabase/database.types";
import { uploadPiece } from "./actions";

type PieceStatus = Database["public"]["Enums"]["piece_status"];

export interface PieceLite { id: string; kind: string; status: PieceStatus; reason: string | null }

/* Copy deck §3 — items mot pour mot (« (obligatoire) » rendu en suffixe atténué). */
const REQUIRED = [
  { kind: "bail", label: "Votre bail" },
  { kind: "quittance", label: "Vos 2 dernières quittances" },
] as const;
/* TODO_COPY — « {pièces conditionnelles} » non détaillées au deck : libellés existants. */
const OPTIONAL = [
  { kind: "dpe", label: "DPE" },
  { kind: "edl", label: "État des lieux" },
  { kind: "rib", label: "RIB (pour le reversement)" },
  { kind: "autre", label: "Autre document" },
] as const;

/* TODO_COPY — libellés d'état hors deck ; enums réels `piece_status` (0001_init.sql).
   Plan P2 : badge `refund` reçu · `ink/60` attendu · `stamp` refusé. */
const STATUS_BADGE: Record<PieceStatus, { label: string; cls: string }> = {
  RECEIVED: { label: "Reçue", cls: "bg-refund/10 text-refund-text" },
  VALIDATED: { label: "Validée", cls: "bg-refund text-paper" },
  ILLEGIBLE: { label: "Illisible", cls: "bg-stamp/10 text-stamp" },
};

/** Glyphe Lucide inliné (feuille) — `lucide-react` absent du workspace. */
function IconSheet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

/** Micro-interaction charte §4 : la pièce reçue se « classe » dans le dossier. */
function PieceChip({ piece, animated }: { piece: PieceLite; animated: boolean }) {
  const badge = STATUS_BADGE[piece.status];
  return (
    <motion.li
      layout={animated}
      initial={animated ? { opacity: 0, y: -14, rotate: -4 } : false}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 480, damping: 32 }}
      className={`inline-flex items-center gap-1.5 rounded-badge px-2.5 py-1 font-mono text-xs ${badge.cls}`}
    >
      <IconSheet className="h-3.5 w-3.5" />
      {badge.label}
    </motion.li>
  );
}

function UploadRow({
  dossierId,
  kind,
  label,
  required,
  pieces,
  onDone,
}: {
  dossierId: string;
  kind: string;
  label: string;
  required: boolean;
  pieces: PieceLite[];
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduced = useReducedMotion();

  async function onFile(file: File) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("dossierId", dossierId);
    fd.set("kind", kind);
    fd.set("file", file);
    const res = await uploadPiece(fd);
    setBusy(false);
    if ("error" in res) setError(res.error);
    else onDone();
  }

  return (
    <li className="rounded-card border border-line bg-paper p-4 transition-colors hover:border-ink/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {label}
            {required ? <span className="font-normal text-ink/50"> (obligatoire)</span> : null}
          </p>
          <ul className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {pieces.length === 0 ? (
              /* TODO_COPY — état « attendue » hors deck (badge ink/60 du plan). */
              <li className="inline-flex items-center rounded-badge bg-paper-2 px-2.5 py-1 font-mono text-xs text-ink/60">
                {required ? "Attendue" : "Optionnelle"}
              </li>
            ) : null}
            <AnimatePresence initial={false}>
              {pieces.map((p) => (
                <PieceChip key={p.id} piece={p} animated={!reduced} />
              ))}
            </AnimatePresence>
          </ul>
          {/* Motif d'illisibilité saisi par l'équipe (donnée réelle, pas de copy). */}
          {pieces
            .filter((p) => p.status === "ILLEGIBLE" && p.reason)
            .map((p) => (
              <p key={p.id} className="mt-2 text-xs leading-relaxed text-stamp">
                {p.reason}
              </p>
            ))}
          {error ? <p className="mt-2 text-xs text-stamp">{error}</p> : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        {/* TODO_COPY — libellés du bouton hors deck (existants conservés). */}
        <button
          type="button"
          disabled={busy}
          aria-label={`Ajouter — ${label}`}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-badge border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
        >
          {busy ? "Envoi…" : "Ajouter"}
        </button>
      </div>
    </li>
  );
}

export function PiecesUpload({
  dossierId,
  pieces,
  missingData,
}: {
  dossierId: string;
  pieces: PieceLite[];
  missingData: string[];
}) {
  const router = useRouter();
  const piecesOf = (kind: string) => pieces.filter((p) => p.kind === kind);
  const onDone = () => router.refresh();

  return (
    <div className="mt-10">
      {/* Copy deck §3 — Pièces : titre + sous-titre mot pour mot. */}
      <h1 className="font-display text-2xl font-extrabold tracking-display">Vos documents</h1>
      <p className="mt-2 text-lg text-ink/70">Une photo lisible suffit.</p>

      {/* TODO_COPY — réassurance opérationnelle hors deck (texte existant conservé). */}
      <p className="mt-4 text-sm leading-relaxed text-ink/60">
        <span className="font-semibold text-refund-text">Mandat signé ✓.</span> Ajoutez au
        minimum votre bail et une quittance pour lancer l'étude. Vos fichiers sont chiffrés
        avant stockage.
      </p>

      {missingData.length > 0 ? (
        /* TODO_COPY — rappel des éléments manquants hors deck (texte existant conservé). */
        <p className="mt-4 rounded-field bg-stamp/8 px-4 py-3 text-sm leading-relaxed text-ink/75">
          Pour affiner le calcul, pensez à joindre les éléments manquants signalés dans votre
          verdict.
        </p>
      ) : null}

      <ul className="mt-7 space-y-2.5">
        {REQUIRED.map((r) => (
          <UploadRow key={r.kind} dossierId={dossierId} kind={r.kind} label={r.label} required pieces={piecesOf(r.kind)} onDone={onDone} />
        ))}
        {OPTIONAL.map((o) => (
          <UploadRow key={o.kind} dossierId={dossierId} kind={o.kind} label={o.label} required={false} pieces={piecesOf(o.kind)} onDone={onDone} />
        ))}
      </ul>

      {/* TODO_COPY — note de passage automatique en étude hors deck (texte existant). */}
      <p className="mt-6 text-xs leading-relaxed text-ink/50">
        Dès que le bail et une quittance sont reçus, votre dossier passe en étude
        automatiquement.
      </p>
    </div>
  );
}
