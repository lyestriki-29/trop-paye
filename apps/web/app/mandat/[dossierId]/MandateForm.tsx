"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Amount } from "@/components/Amount";
import { signMandate } from "./actions";

export function MandateForm({
  dossierId,
  addressLabel,
  recoverableCents,
}: {
  dossierId: string;
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
    <div className="mt-8">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Votre mandat</h1>
      <p className="mt-2 text-ink/60">
        Nous engageons la démarche amiable en votre nom. Commission au succès uniquement.
      </p>

      <div className="mt-6 rounded-card border border-line bg-paper-2 p-5 text-sm">
        <div className="flex justify-between border-b border-line py-2">
          <span className="text-ink/60">Logement</span>
          <span className="text-right font-medium">{addressLabel || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-line py-2">
          <span className="text-ink/60">Trop-perçu estimé</span>
          <Amount cents={recoverableCents} favorable className="font-medium" />
        </div>
        <div className="flex justify-between py-2">
          <span className="text-ink/60">Commission (succès)</span>
          <span className="font-mono tabular font-medium">25 %</span>
        </div>
      </div>

      <p className="mt-4 rounded-field bg-stamp/8 px-4 py-3 text-xs text-ink/70">
        [AVOCAT] Document généré à partir d'un brouillon non validé — à ne pas utiliser en
        production. Un PDF est figé puis scellé (empreinte + preuve) au moment de la signature.
      </p>

      <label className="mt-6 block">
        <span className="text-sm font-medium text-ink/80">Vos nom et prénom (signature)</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Camille Martin"
          className="mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
      </label>

      <label className="mt-4 flex items-start gap-3 text-sm text-ink/75">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>
          Je consens expressément à signer ce mandat par signature électronique simple et à
          confier à TropPayé la démarche amiable décrite ci-dessus. [AVOCAT — texte de
          consentement à valider.]
        </span>
      </label>

      {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}

      <button
        type="button"
        onClick={onSign}
        disabled={!canSign}
        className="mt-6 w-full rounded-field bg-refund px-6 py-3 font-medium text-paper transition-colors hover:bg-refund-text disabled:opacity-40"
      >
        {pending ? "Signature…" : "Signer mon mandat"}
      </button>
    </div>
  );
}
