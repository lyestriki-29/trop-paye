"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { BaremeMandat } from "./BaremeMandat";
import { signMandate } from "./actions";

/**
 * Écran mandat (dossier DIAGNOSED) : barème variante A arbitrée + signature
 * maison (mock) — restyle charte v2, flux `signMandate` inchangé.
 */
export function MandateForm({
  dossierId,
  dossierRef,
  addressLabel,
  recoverableCents,
}: {
  dossierId: string;
  dossierRef: string;
  addressLabel: string;
  recoverableCents: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSign() {
    setPending(true);
    setError(null);
    const res = await signMandate({ dossierId, signerName: name.trim(), consent: true });
    if ("error" in res) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.refresh();
  }

  const canSign = name.trim().length >= 2 && consent && !pending;

  return (
    <div className="mt-10">
      {/* Copy deck §3 — Signature : titre + texte mot pour mot. [AVOCAT] */}
      <h1 className="font-display text-2xl font-extrabold tracking-display">
        Dernière étape : votre mandat
      </h1>
      <p className="mt-3 max-w-prose leading-relaxed text-ink/70">
        Ce mandat nous autorise à réclamer et encaisser les sommes pour votre compte, sur un
        compte dédié et contrôlé. Vous restez maître de votre dossier à tout moment.
      </p>

      <BaremeMandat
        dossierRef={dossierRef}
        addressLabel={addressLabel}
        recoverableCents={recoverableCents}
      />

      {/* Signature maison (mock) — avertissement existant conservé. [AVOCAT] */}
      <p className="mt-10 rounded-field bg-stamp/8 px-4 py-3 text-xs leading-relaxed text-ink/70">
        [AVOCAT] Document généré à partir d'un brouillon non validé — à ne pas utiliser en
        production. Un PDF est figé puis scellé (empreinte + preuve) au moment de la signature.
      </p>

      <div className="mt-6 border-t border-line pt-8">
        {/* TODO_COPY — libellé du champ hors deck (existant conservé). */}
        <Field
          id="signer-name"
          label="Vos nom et prénom (signature)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-ink/75">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-ink"
          />
          <span>
            Je consens expressément à signer ce mandat par signature électronique simple et à
            confier à TropPayé la démarche amiable décrite ci-dessus. [AVOCAT — texte de
            consentement à valider.]
          </span>
        </label>

        {error ? <p className="mt-4 text-sm text-stamp">{error}</p> : null}

        {/* TODO_COPY — libellés du bouton hors deck (existants conservés). */}
        <Button onClick={onSign} disabled={!canSign} className="mt-6 w-full">
          {pending ? "Signature…" : "Signer mon mandat"}
        </Button>
      </div>
    </div>
  );
}
