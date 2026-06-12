"use client";

import type { StepProps } from "../use-diagnostic-form";
import { ChoiceField, TextField } from "../fields";

export function HousingStep({ draft, setField }: StepProps) {
  return (
    <div className="space-y-6">
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

      <ChoiceField
        label="Le logement est-il meublé ?"
        choices={[
          { value: "yes", label: "Meublé" },
          { value: "no", label: "Non meublé" },
        ]}
        value={draft.furnished === undefined ? undefined : draft.furnished ? "yes" : "no"}
        onChange={(v) => setField("furnished", v === "yes")}
      />

      {/* Pièces + époque (encadrement des loyers) : clés du barème. « Je ne sais
          pas » accepté — le barème ne se résout alors pas, sans bloquer le tunnel.
          TODO_COPY — libellés brouillon. */}
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
        value={
          draft.constructionPeriodUnknown ? "nsp" : (draft.constructionPeriod ?? undefined)
        }
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

      {/* Colocation (LOT 1.3) : le verdict porte toujours sur le loyer TOTAL du
          logement ; si l'utilisateur ne connaît que sa part, on reconstitue
          total = part × nombre de colocataires. TODO_COPY — libellés brouillon. */}
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
      {draft.isShared ? (
        <TextField
          label="Combien de colocataires en tout ?"
          hint="Vous compris. Sert à reconstituer le loyer total si vous saisissez votre part."
          inputMode="numeric"
          mono
          value={draft.tenantCount === undefined ? "" : String(draft.tenantCount)}
          onChange={(v) => {
            const raw = v.replace(/[^0-9]/g, "");
            const n = raw === "" ? undefined : Number.parseInt(raw, 10);
            const valid = n !== undefined && Number.isInteger(n) && n >= 2 && n <= 20;
            setField("tenantCount", valid ? n : undefined);
          }}
        />
      ) : null}
    </div>
  );
}

/** Étape facultative, SAUF la coloc : si déclarée, le nombre de colocataires (≥ 2) est requis. */
export const housingValid = (d: StepProps["draft"]): boolean =>
  !d.isShared || (d.tenantCount !== undefined && d.tenantCount >= 2);
