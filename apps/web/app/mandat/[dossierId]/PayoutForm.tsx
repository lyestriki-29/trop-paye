"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { savePayoutDetails } from "./actions";

/**
 * Coordonnées de reversement (virement manuel V1) — IBAN chiffré côté serveur,
 * jamais réaffiché en clair (on ne montre que l'état « enregistré »).
 * TODO_COPY — libellés brouillon, hors copy deck.
 */
export function PayoutForm({
  dossierId,
  alreadySaved,
}: {
  dossierId: string;
  alreadySaved: boolean;
}) {
  const router = useRouter();
  const [holderName, setHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!alreadySaved);

  async function onSave() {
    setPending(true);
    setError(null);
    const res = await savePayoutDetails({ dossierId, holderName: holderName.trim(), iban });
    if ("error" in res) {
      setError(res.error);
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="mt-8 rounded-card border border-line bg-paper-2 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold">Coordonnées de reversement</h2>
            <p className="mt-1 text-sm text-refund-text">
              ✓ IBAN enregistré (conservé chiffré)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-ink/60 underline underline-offset-2 hover:text-ink"
          >
            Corriger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-card border border-line bg-paper p-5">
      <h2 className="font-display text-base font-bold">Coordonnées de reversement</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        C&apos;est sur ce compte que nous reversons les sommes récupérées (votre part : 75 %).
        Conservé chiffré, en France, jamais réaffiché en clair.
      </p>
      <div className="mt-5 space-y-5">
        <Field
          id="payout-holder"
          label="Titulaire du compte (tel qu'écrit sur le RIB)"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          autoComplete="name"
        />
        <Field
          id="payout-iban"
          label="IBAN (France) — commence par FR76…"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          autoComplete="off"
        />
      </div>
      {error ? <p className="mt-4 text-sm text-stamp">{error}</p> : null}
      <Button
        onClick={onSave}
        disabled={holderName.trim().length < 2 || iban.replace(/\s+/g, "").length < 27 || pending}
        className="mt-5"
      >
        {pending ? "Enregistrement…" : "Enregistrer mes coordonnées"}
      </Button>
    </div>
  );
}
