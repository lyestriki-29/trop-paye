"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPiece } from "./actions";

interface PieceLite {
  id: string;
  kind: string;
  status: string;
}

const REQUIRED = [
  { kind: "bail", label: "Bail / contrat de location" },
  { kind: "quittance", label: "Quittances de loyer" },
];
const OPTIONAL = [
  { kind: "dpe", label: "DPE" },
  { kind: "edl", label: "État des lieux" },
  { kind: "rib", label: "RIB (pour le reversement)" },
  { kind: "autre", label: "Autre document" },
];

function UploadRow({
  dossierId,
  kind,
  label,
  count,
  required,
  onDone,
}: {
  dossierId: string;
  kind: string;
  label: string;
  count: number;
  required: boolean;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex items-center justify-between gap-3 rounded-field border border-line bg-paper px-4 py-3">
      <div>
        <p className="text-sm font-medium">
          {label} {required ? <span className="text-stamp">*</span> : null}
        </p>
        {count > 0 ? (
          <p className="text-xs text-refund-text">✓ {count} fichier(s) reçu(s)</p>
        ) : error ? (
          <p className="text-xs text-stamp">{error}</p>
        ) : null}
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
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded-field border border-ink px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
      >
        {busy ? "Envoi…" : "Ajouter"}
      </button>
    </div>
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
  const countOf = (kind: string) => pieces.filter((p) => p.kind === kind).length;
  const onDone = () => router.refresh();

  return (
    <div className="mt-8">
      <h1 className="font-display text-2xl font-extrabold tracking-display">
        Vos pièces justificatives
      </h1>
      <p className="mt-2 text-ink/60">
        Mandat signé ✓. Ajoutez au minimum votre bail et une quittance pour lancer l'étude.
        Vos fichiers sont chiffrés avant stockage.
      </p>

      {missingData.length > 0 ? (
        <p className="mt-4 rounded-field bg-stamp/8 px-4 py-3 text-sm text-ink/75">
          Pour affiner le calcul, pensez à joindre les éléments manquants signalés dans votre
          verdict.
        </p>
      ) : null}

      <div className="mt-6 space-y-2">
        {REQUIRED.map((r) => (
          <UploadRow
            key={r.kind}
            dossierId={dossierId}
            kind={r.kind}
            label={r.label}
            count={countOf(r.kind)}
            required
            onDone={onDone}
          />
        ))}
        {OPTIONAL.map((o) => (
          <UploadRow
            key={o.kind}
            dossierId={dossierId}
            kind={o.kind}
            label={o.label}
            count={countOf(o.kind)}
            required={false}
            onDone={onDone}
          />
        ))}
      </div>

      <p className="mt-6 text-xs text-ink/50">
        Dès que le bail et une quittance sont reçus, votre dossier passe en étude
        automatiquement.
      </p>
    </div>
  );
}
