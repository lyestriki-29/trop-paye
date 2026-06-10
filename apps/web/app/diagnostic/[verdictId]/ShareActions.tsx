"use client";

import { useState } from "react";
import { brand, formatEUR } from "@troppaye/shared";
import { Button } from "@/components/ui/Button";

/** Glyphe Lucide « share-2 » inliné (lucide-react absent du workspace). */
function IconShare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.83 3.98" />
    </svg>
  );
}

/**
 * Partage du verdict gagné (plan P2 Task 7 Step 5) : Web Share API si disponible,
 * sinon copie du lien dans le presse-papiers. Le lien ouvert par un tiers n'expose
 * que le teaser anonymisé (+ image OG) — jamais les données du dossier.
 */
export function ShareActions({ amountCents }: { amountCents: number }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    // TODO_COPY — texte de partage (phrase du gabarit OG validé, à confirmer).
    const text = `J'ai vérifié mon loyer : ${formatEUR(amountCents)} à récupérer`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: brand.name, text, url });
        return;
      } catch (err) {
        // Fermeture volontaire de la feuille de partage : ne rien faire de plus.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Autre échec → repli copie ci-dessous.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Presse-papiers refusé (permissions) : pas d'autre repli possible.
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {/* TODO_COPY — libellé du bouton de partage (hors copy deck). */}
      <Button variant="ghost" onClick={share} className="w-full">
        <IconShare className="h-4 w-4" />
        Partager mon résultat
      </Button>
      <p aria-live="polite" className="min-h-4 text-xs text-ink/55">
        {/* TODO_COPY — confirmation de copie (hors copy deck). */}
        {copied ? "Lien copié dans le presse-papiers." : ""}
      </p>
    </div>
  );
}
