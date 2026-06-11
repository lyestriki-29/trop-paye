"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { brand } from "@troppaye/shared";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Marker } from "@/components/ui/Marker";
import { submitLead } from "./capture-actions";

/**
 * Porte de capture AVANT le verdict (spec P2 : montant masqué + email requis,
 * téléphone optionnel avec consentement séparé). Le montant réel n'est JAMAIS
 * dans le DOM : on affiche un gabarit de même longueur, flouté.
 * TODO_COPY [AVOCAT] : textes de consentement = brouillons à valider.
 */
export function CaptureView({
  verdictId,
  shortRef,
  maskedAmount,
  irregular,
}: {
  verdictId: string;
  shortRef: string;
  /** Montant remplacé chiffre par chiffre côté serveur (jamais le vrai). */
  maskedAmount: string | null;
  irregular: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneConsent, setPhoneConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setPending(true);
    setError(null);
    const res = await submitLead({
      verdictId,
      email: email.trim(),
      phone: phone.trim() || undefined,
      phoneConsent,
    });
    if ("error" in res) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  const canSubmit =
    email.trim().length >= 5 && (phone.trim().length === 0 || phoneConsent) && !pending;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/70 bg-paper">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-4">
          <Link href="/" aria-label={`${brand.name} — accueil`}>
            <Logo className="text-xl" />
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/55">
            Réf. dossier {shortRef}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-12 sm:py-16">
        {/* TODO_COPY — titres brouillon, hors copy deck. */}
        <h1 className="font-display text-2xl font-extrabold tracking-display sm:text-[40px] sm:leading-tight">
          Votre estimation est <Marker>prête</Marker>
        </h1>

        {irregular && maskedAmount ? (
          <div className="mt-8 rounded-card border border-line bg-paper-2 px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
              Trop-perçu estimé sur votre loyer
            </p>
            <p
              aria-hidden
              className="tabular mt-2 select-none font-mono text-4xl font-medium text-refund-text blur-md"
            >
              {maskedAmount}
            </p>
          </div>
        ) : null}

        <p className="mt-6 max-w-prose leading-relaxed text-ink/70">
          Indiquez où vous envoyer le résultat détaillé : le calcul complet, la règle de
          droit appliquée et la marche à suivre. C&apos;est gratuit et sans engagement.
        </p>

        <div className="mt-8 space-y-5">
          <Field
            id="capture-email"
            label="Votre email (obligatoire, pour recevoir le résultat)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
          />
          <Field
            id="capture-phone"
            label="Votre téléphone (facultatif)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
          />
          {phone.trim().length > 0 ? (
            /* Consentement SÉPARÉ téléphone — brouillon [AVOCAT], version
               tracée dans leads.consent_text_version. */
            <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/75">
              <input
                type="checkbox"
                checked={phoneConsent}
                onChange={(e) => setPhoneConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-ink"
              />
              <span>
                J&apos;accepte que TropPayé me rappelle au sujet de mon dossier. Pas de
                démarchage pour autre chose, et je peux retirer ce consentement à tout
                moment. [AVOCAT, brouillon]
              </span>
            </label>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-stamp">{error}</p> : null}

        <Button onClick={onSubmit} disabled={!canSubmit} className="mt-7 w-full">
          {pending ? "Un instant…" : "Voir mon résultat"}
        </Button>

        {/* TODO_COPY [AVOCAT] — mention de collecte (brouillon). */}
        <p className="mt-5 text-xs leading-relaxed text-ink/50">
          Vos coordonnées servent uniquement à vous transmettre ce résultat et à suivre
          votre dossier. Données hébergées en France, jamais revendues, supprimables sur
          simple demande.
        </p>
      </main>
    </div>
  );
}
