"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { markPosted } from "@/app/admin/actions";

/** Saisie du n° de recommandé : c'est elle qui horodate l'envoi et notifie le client. */
export function PostForm({ actionId }: { actionId: string }) {
  const router = useRouter();
  const [tracking, setTracking] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setPending(true);
    setError(null);
    const res = await markPosted(actionId, tracking);
    if ("error" in res) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex-1">
        <span className="block text-xs font-medium text-ink/60">
          N° de suivi du recommandé (La Poste)
        </span>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="ex. 1A 234 567 8901 2"
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        />
      </label>
      <Button onClick={onSubmit} disabled={tracking.trim().length < 4 || pending}>
        {pending ? "Pointage…" : "Posté ✓"}
      </Button>
      {error ? <p className="w-full text-sm text-stamp">{error}</p> : null}
    </div>
  );
}
