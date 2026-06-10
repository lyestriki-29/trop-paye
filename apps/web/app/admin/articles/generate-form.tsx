"use client";

import { useActionState } from "react";
import { generateArticleDraft, type GenerateState } from "./actions";

const TOPICS = [
  { value: "dpe", label: "Gel DPE F/G" },
  { value: "irl", label: "Révision IRL" },
  { value: "depot", label: "Dépôt de garantie" },
  { value: "encadrement", label: "Encadrement" },
  { value: "default", label: "Général" },
];

export function GenerateForm() {
  const [state, action, pending] = useActionState<GenerateState, FormData>(
    generateArticleDraft,
    {},
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-paper p-4">
      <label className="flex-1 min-w-[220px]">
        <span className="text-sm font-medium text-ink/80">Mot-clé cible</span>
        <input
          name="keyword"
          required
          placeholder="augmentation loyer dpe g interdite"
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-ink/80">Thème</span>
        <select
          name="topic"
          className="mt-1 block rounded-field border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-field bg-ink px-5 py-2 font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Génération…" : "Générer un brouillon"}
      </button>
      {state.ok ? (
        <p className="w-full text-sm text-refund-text">
          Brouillon créé ({state.mode === "mock" ? "mode mock" : "Anthropic"}) : {state.slug}
        </p>
      ) : null}
      {state.error ? <p className="w-full text-sm text-stamp">{state.error}</p> : null}
    </form>
  );
}
