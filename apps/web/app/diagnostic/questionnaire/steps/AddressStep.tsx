"use client";

import { useCallback, useState } from "react";
import type { StepProps } from "../use-diagnostic-form";
import { AddressAutocomplete } from "../AddressAutocomplete";
import { TextField } from "../fields";

export function AddressStep({ draft, setField }: StepProps) {
  // État dégradé Géoplateforme IGN (plan P2 Task 4) : échec fournisseur → saisie manuelle.
  const [manual, setManual] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const activateManual = useCallback(() => setManual(true), []);

  // Adresse manuelle : libellé seul, sans banId/inseeCode (acceptés optionnels par le schéma).
  function syncManual(s: string, c: string) {
    const label = [s.trim(), c.trim()].filter(Boolean).join(", ");
    setField("address", label.length >= 3 ? { label, banId: "", inseeCode: "" } : undefined);
  }

  if (!manual) {
    return (
      <AddressAutocomplete
        value={draft.address}
        onSelect={(a) => setField("address", a)}
        onProviderError={activateManual}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* TODO_COPY — bandeau d'échec Géoplateforme IGN (hors copy deck §2). */}
      <div role="status" className="rounded-card border-l-4 border-accent bg-paper-2 px-4 py-3">
        <p className="text-sm font-medium text-ink">
          La recherche d&apos;adresse est momentanément indisponible.
        </p>
        <p className="mt-0.5 text-sm text-ink/60">
          Saisissez votre adresse manuellement — le diagnostic reste possible.
        </p>
      </div>
      {/* TODO_COPY — libellés des champs de saisie manuelle (hors copy deck §2). */}
      <TextField
        label="Adresse"
        hint="Numéro et rue, ex. 12 rue de la République"
        value={street}
        onChange={(v) => {
          setStreet(v);
          syncManual(v, city);
        }}
      />
      <TextField
        label="Ville"
        value={city}
        onChange={(v) => {
          setCity(v);
          syncManual(street, v);
        }}
      />
      {draft.address && street.length === 0 && city.length === 0 ? (
        <p className="text-xs text-refund-text">✓ Adresse sélectionnée : {draft.address.label}</p>
      ) : null}
    </div>
  );
}

export const addressValid = (d: StepProps["draft"]): boolean =>
  (d.address?.label?.length ?? 0) >= 3;
