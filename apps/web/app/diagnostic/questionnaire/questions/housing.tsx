"use client";

import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, TextField } from "../fields";

/**
 * Surface habitable (extraite de `HousingStep`). Pré-remplissable par la cascade
 * DPE (levier 1) et reste éditable — même `onChange`/validation qu'à l'origine.
 */
export function SurfaceConfirmQ({ draft, setField }: StepProps) {
  return (
    <TextField
      label="Surface habitable (m²)"
      hint="Facultatif, utile pour recouper le DPE."
      inputMode="decimal"
      mono
      value={draft.surfaceM2 === undefined ? "" : String(draft.surfaceM2)}
      onChange={(v) => {
        const raw = v.replace(",", ".").replace(/[^0-9.]/g, "");
        const n = raw === "" ? undefined : Number.parseFloat(raw);
        const valid = n !== undefined && Number.isFinite(n) && n > 0 && n <= 10000;
        setField("surfaceM2", valid ? n : undefined);
      }}
    />
  );
}

/** Meublé / non meublé (pilule, extraite de `HousingStep`). */
export function FurnishedQ({ draft, setField }: StepProps) {
  return (
    <ChoiceField
      label="Le logement est-il meublé ?"
      choices={[
        { value: "yes", label: "Meublé" },
        { value: "no", label: "Non meublé" },
      ]}
      value={draft.furnished === undefined ? undefined : draft.furnished ? "yes" : "no"}
      onChange={(v) => setField("furnished", v === "yes")}
    />
  );
}

/** Nombre de pièces principales (pilule + « je ne sais pas », extraite de `HousingStep`). */
export function RoomsQ({ draft, setField }: StepProps) {
  return (
    <ChoiceField
      label="Combien de pièces principales ?"
      hint="Séjour et chambres ; cuisine et salle de bain ne comptent pas."
      choices={[
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4 et +" },
        { value: "nsp", label: "Je ne sais pas" },
      ]}
      value={
        draft.roomCountUnknown
          ? "nsp"
          : draft.roomCount === undefined
            ? undefined
            : (String(draft.roomCount) as "1" | "2" | "3" | "4")
      }
      onChange={(v) => {
        if (v === "nsp") {
          setField("roomCountUnknown", true);
          setField("roomCount", undefined);
        } else {
          setField("roomCount", Number(v));
          setField("roomCountUnknown", false);
        }
      }}
    />
  );
}

/**
 * Époque de construction (pilule + « je ne sais pas », extraite de `HousingStep`).
 * Pré-remplissable par la cascade DPE (levier 1), reste éditable.
 */
export function ConstructionConfirmQ({ draft, setField }: StepProps) {
  return (
    <ChoiceField
      label="Époque de construction de l'immeuble ?"
      hint="Une fourchette suffit."
      choices={[
        { value: "BEFORE_1946", label: "Avant 1946" },
        { value: "1946_1970", label: "1946 à 1970" },
        { value: "1971_1990", label: "1971 à 1990" },
        { value: "AFTER_1990", label: "Après 1990" },
        { value: "nsp", label: "Je ne sais pas" },
      ]}
      value={draft.constructionPeriodUnknown ? "nsp" : (draft.constructionPeriod ?? undefined)}
      onChange={(v) => {
        if (v === "nsp") {
          setField("constructionPeriodUnknown", true);
          setField("constructionPeriod", undefined);
        } else {
          setField("constructionPeriod", v);
          setField("constructionPeriodUnknown", false);
        }
      }}
    />
  );
}

/** Colocation oui / non (pilule, extraite de `HousingStep`). */
export function ColocQ({ draft, setField }: StepProps) {
  return (
    <ChoiceField
      label="Est-ce une colocation ?"
      hint="Plusieurs locataires sur un même bail, ou des baux distincts pour le même logement."
      choices={[
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ]}
      value={draft.isShared === undefined ? undefined : draft.isShared ? "yes" : "no"}
      onChange={(v) => setField("isShared", v === "yes")}
    />
  );
}

const TENANTS = [2, 3, 4, 5, 6] as const; // 6 = « 6 et + »

/**
 * Nombre de colocataires (levier 2 : frappe → tap). Remplace le `TextField`
 * numérique de `HousingStep` par un pas-à-pas de pilules. `6` encode « 6 et + ».
 */
export function TenantCountQ({ draft, setField }: StepProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Nombre de colocataires">
      {TENANTS.map((n) => (
        <button
          key={n}
          type="button"
          className="nb-pill"
          aria-pressed={draft.tenantCount === n}
          onClick={() => setField("tenantCount", n)}
        >
          {n === 6 ? "6 et +" : n}
        </button>
      ))}
    </div>
  );
}
