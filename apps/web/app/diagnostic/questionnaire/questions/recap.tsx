"use client";

import type { StepProps } from "../use-diagnostic-form";

/**
 * Stub `render` de la question « recap » du graphe. Le vrai écran de récap (la
 * synthèse du dossier pleine largeur + le CTA de soumission) est construit par
 * l'orchestrateur `GuidedTunnel` dès que `activeId === "recap"` : ce composant
 * n'est donc jamais monté, il satisfait seulement le type `Question.render`.
 */
export function RecapQ(_p: StepProps) {
  return (
    <p className="text-sm text-ink/70">
      Vérifiez vos réponses puis lancez le diagnostic.
    </p>
  );
}
