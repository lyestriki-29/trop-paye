"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { submitLead } from "./capture-actions";

/**
 * Capture email APRÈS le verdict (inversion 2026-06-12, décision Lyes) : le
 * locataire voit d'abord son résultat complet, puis peut laisser son email pour
 * être recontacté et « avancer ensemble ». Plus de porte ni de montant masqué :
 * c'est une conversion douce, pas un péage. Mode waitlist (2026-06-26) : on NE
 * promet PAS d'email auto (Brevo non branché) — recontact manuel via /admin/funnel.
 * Réutilise `submitLead` (capture-actions) ; le lead reste unique par dossier.
 * Copy de consentement RGPD bordée maison ; détails sur /confidentialite.
 */
export function RecapCaptureModule({ verdictId }: { verdictId: string }) {
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
    // Lead posé → la page se rafraîchit, le module disparaît (hasLead côté serveur).
    router.refresh();
  }

  const canSubmit =
    email.trim().length >= 5 && (phone.trim().length === 0 || phoneConsent) && !pending;

  return (
    <section className="nb-card mt-10 rounded-none p-6 sm:p-8">
      {/* TODO_COPY — titres brouillon, hors copy deck. */}
      <h2 className="font-nb-display text-lg font-black uppercase tracking-wide">
        Avançons ensemble sur votre dossier
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink/70">
        Laissez-nous votre email : on revient vers vous avec la marche à suivre et
        on voit ensemble comment avancer sur votre dossier. C&apos;est gratuit et
        sans engagement.
      </p>

      <div className="mt-6 space-y-5">
        <Field
          id="recap-email"
          label="Votre email (pour qu'on vous recontacte)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          inputClassName="nb-field"
        />
        <Field
          id="recap-phone"
          label="Votre téléphone (facultatif)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="tel"
          inputClassName="nb-field"
        />
        {phone.trim().length > 0 ? (
          /* Consentement SÉPARÉ téléphone — version tracée dans
             leads.consent_text_version. */
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
              moment.
            </span>
          </label>
        ) : null}
      </div>

      {error ? <p role="alert" className="mt-4 text-sm text-stamp">{error}</p> : null}

      <Button onClick={onSubmit} disabled={!canSubmit} className="mt-7 w-full sm:w-auto">
        {pending ? "Un instant…" : "Être recontacté"}
      </Button>

      <p className="mt-5 text-xs leading-relaxed text-ink/50">
        Vos coordonnées servent uniquement à vous recontacter au sujet de votre dossier.
        Données hébergées en France, jamais revendues, supprimables sur simple demande —{" "}
        <a href="/confidentialite" className="underline underline-offset-2 hover:text-ink">
          en savoir plus
        </a>
        .
      </p>
    </section>
  );
}
