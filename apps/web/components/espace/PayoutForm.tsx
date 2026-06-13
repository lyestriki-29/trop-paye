"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePayoutDetails } from "@/app/mandat/[dossierId]/actions";
import { Button } from "@/components/ui/Button";

export function PayoutForm({
  dossierId,
  currentMasked,
}: {
  dossierId: string;
  currentMasked: string | null;
}) {
  const router = useRouter();
  const [holderName, setHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const res = await savePayoutDetails({ dossierId, holderName, iban });
      if ("error" in res) setError(res.error);
      else {
        setIban("");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-3 rounded-card border border-line bg-paper p-5"
    >
      {currentMasked ? (
        <p className="text-sm text-ink/60">
          RIB enregistré : <span className="font-mono">{currentMasked}</span>
        </p>
      ) : null}
      <label className="block text-sm">
        Titulaire du compte
        <input
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm">
        IBAN (France)
        <input
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="FR76 ..."
          className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 font-mono"
          required
        />
      </label>
      {error ? (
        <p className="text-sm text-stamp" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer mon RIB"}
      </Button>
    </form>
  );
}
