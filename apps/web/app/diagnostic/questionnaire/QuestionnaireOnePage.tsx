"use client";

import Link from "next/link";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import type { DiagnosticDraft, SetField } from "./use-diagnostic-form";
import { STEPS } from "./tunnel-steps";

/**
 * Variante « tout sur une page » du tunnel (retour Lyes 2026-06-12, à comparer
 * au stepper via `?vue=page`). Réutilise À L'IDENTIQUE les composants d'étape et
 * leurs `valid()` ; pas de `goNext` (pas d'étape suivante), pas de barre de
 * progression. Le bouton final est gaté par la validité de TOUTES les sections.
 */
export function QuestionnaireOnePage({
  draft,
  setField,
  hydrated,
  submit,
  submitting,
  error,
}: {
  draft: DiagnosticDraft;
  setField: SetField;
  hydrated: boolean;
  submit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const allValid = STEPS.every((s) => s.valid(draft));

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label={`${brand.name} — accueil`}>
            <Logo className="text-xl" />
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/55">Diagnostic</p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10">
        {!hydrated ? (
          <p className="text-ink/50">Chargement…</p>
        ) : (
          <>
            <h1 className="font-display text-2xl font-extrabold tracking-display">
              Votre diagnostic en une page
            </h1>
            {/* TODO_COPY — accroche de la variante une-page, hors copy deck. */}
            <p className="mt-2 text-ink/60">
              Remplissez ce que vous savez. Tout ce qui est facultatif peut rester vide.
            </p>

            {STEPS.map((step) => (
              <section
                key={step.title}
                className="mt-10 border-t border-line/60 pt-8 first:mt-8 first:border-t-0 first:pt-0"
              >
                <h2 className="font-display text-xl font-bold tracking-display">{step.title}</h2>
                {step.subtitle ? <p className="mt-1 text-sm text-ink/60">{step.subtitle}</p> : null}
                <div className="mt-6">
                  <step.Component draft={draft} setField={setField} />
                </div>
              </section>
            ))}

            {error ? (
              <p role="alert" className="mt-6 text-sm text-stamp">
                {error}
              </p>
            ) : null}

            <div className="mt-10">
              <Button onClick={submit} disabled={submitting || !allValid} className="w-full">
                {submitting ? "Analyse…" : "Voir mon résultat"}
              </Button>
              {!allValid ? (
                <p className="mt-3 text-center text-xs text-ink/50">
                  Complétez l&apos;adresse, le logement et le loyer pour lancer le diagnostic.
                </p>
              ) : null}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
