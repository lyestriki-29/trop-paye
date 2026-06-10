"use client";

import { Button } from "@/components/ui/Button";

/**
 * Erreur runtime globale (spec P3) — client component imposé par Next.
 * Registre charte : on explique, on oriente, sans s'excuser ni culpabiliser ;
 * aucune donnée n'est perdue (brouillon en localStorage, dossier en base).
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-container flex-col items-start px-6 py-24 sm:py-32">
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
        Erreur technique
      </p>
      {/* TODO_COPY — page d'erreur (hors copy deck). */}
      <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-display sm:text-hero">
        Un problème technique est survenu.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">
        Vos données sont conservées. Réessayez — si le problème persiste, revenez dans
        quelques minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <a
          href="/"
          className="inline-flex items-center px-2 py-2.5 text-sm font-semibold text-ink/70 underline-offset-2 transition hover:text-ink hover:underline"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
