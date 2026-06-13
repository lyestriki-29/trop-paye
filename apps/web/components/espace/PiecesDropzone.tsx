"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPiece } from "@/app/mandat/[dossierId]/actions";

const KINDS = [
  { value: "bail", label: "Bail" },
  { value: "quittance", label: "Quittance" },
  { value: "dpe", label: "DPE" },
  { value: "edl", label: "État des lieux" },
  { value: "rib", label: "RIB" },
  { value: "autre", label: "Autre" },
] as const;

export function PiecesDropzone({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("bail");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send(file: File) {
    setError(null);
    const fd = new FormData();
    fd.set("dossierId", dossierId);
    fd.set("kind", kind);
    fd.set("file", file);
    start(async () => {
      const res = await uploadPiece(fd);
      if ("error" in res) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        Type de pièce
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="ml-2 rounded-field border border-line bg-paper px-2 py-1"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) send(f);
        }}
        className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-line bg-paper-2 px-6 py-10 text-center text-sm text-ink/60"
      >
        <p>Glissez un fichier ici (PDF/image, max 10 Mo)</p>
        <label className="cursor-pointer">
          <input
            type="file"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) send(f);
            }}
          />
          <span className="inline-block rounded-field bg-ink px-4 py-2 text-paper">
            {pending ? "Envoi…" : "Choisir un fichier"}
          </span>
        </label>
      </div>

      {error ? <p className="text-sm text-stamp" role="alert">{error}</p> : null}
    </div>
  );
}
