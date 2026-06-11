"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  evaluateAll,
  formatEur,
  shiftISO,
  type DossierSnapshot,
  type Referentials,
} from "@troppaye/rules-engine";
import {
  answersFromSnapshot,
  mergeBoosterAnswers,
  type BoosterAnswers,
  type BoosterChecklistItem,
  CHARGES_REVIEW_ITEMS,
  FORBIDDEN_FEES_ITEMS,
} from "@/lib/diagnostic/boosters";
import { ChoiceField, MoneyField } from "@/app/diagnostic/questionnaire/fields";
import { Button } from "@/components/ui/Button";
import { submitBoosters } from "./booster-actions";

function Checklist({
  items,
  checked,
  onToggle,
}: {
  items: BoosterChecklistItem[];
  checked: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={item.id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-4 py-3 text-sm hover:border-ink/30"
        >
          <input
            type="checkbox"
            checked={checked.includes(item.id)}
            onChange={() => onToggle(item.id)}
            className="mt-0.5 h-4 w-4 accent-ink"
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
}

/**
 * « Vérifications complémentaires » (LOT 2) : 4 cartes optionnelles sous le
 * verdict. L'aperçu du nouveau total est calculé EN LIVE côté client (moteur pur,
 * même merge que le serveur) ; la persistance reste AUTORITAIRE côté serveur
 * (submitBoosters → nouveau verdict). Ignorer les cartes = aucun impact.
 * TODO_COPY — libellés brouillon.
 */
export function BoostersModule({
  verdictId,
  dossierId,
  snapshot,
  referentials,
}: {
  verdictId: string;
  dossierId: string;
  snapshot: DossierSnapshot;
  referentials: Referentials;
}) {
  const router = useRouter();
  const storageKey = `tp_boosters_${dossierId}`;
  const [answers, setAnswers] = useState<BoosterAnswers>(() => answersFromSnapshot(snapshot));
  const [asOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reprise : brouillon local prioritaire sur les réponses déjà persistées.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers((a) => ({ ...a, ...(JSON.parse(raw) as BoosterAnswers) }));
    } catch {
      /* brouillon illisible : on garde le snapshot */
    }
  }, [storageKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(answers));
      } catch {
        /* non bloquant */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [answers, storageKey]);

  const set = <K extends keyof BoosterAnswers>(key: K, value: BoosterAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  const toggle = (key: "forbiddenFees" | "chargesReviewItems") => (id: string) =>
    setAnswers((a) => {
      const cur = new Set(a[key] ?? []);
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
      return { ...a, [key]: [...cur] };
    });

  // Aperçu live : delta entre le total recalculé avec/sans boosters, même asOf.
  const delta = useMemo(() => {
    const base = evaluateAll({ dossier: snapshot, referentials, asOf });
    const next = evaluateAll({ dossier: mergeBoosterAnswers(snapshot, answers), referentials, asOf });
    return next.totalRecoverableCents - base.totalRecoverableCents;
  }, [snapshot, referentials, answers, asOf]);

  // Carte honoraires : pas proposée si le bail est manifestement prescrit (> 3 ans).
  const prescribed =
    snapshot.leaseSignedAt !== undefined && shiftISO(snapshot.leaseSignedAt, { years: 3 }) < asOf;

  const hasInput =
    answers.agencyUsed !== undefined ||
    (answers.forbiddenFees?.length ?? 0) > 0 ||
    (answers.chargesReviewItems?.length ?? 0) > 0;

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await submitBoosters({ verdictId, ...answers });
    if ("error" in res) {
      setError(res.error);
      setSaving(false);
      return;
    }
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* non bloquant */
    }
    router.push(`/diagnostic/${res.verdictId}`);
  };

  return (
    <section className="mt-10 rounded-card border border-line bg-paper p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold">Vérifications complémentaires</h2>
      <p className="mt-1 text-sm text-ink/60">
        Facultatif — 30 secondes pour vérifier d&apos;autres abus courants. Votre verdict est
        recalculé si quelque chose est trouvé.
      </p>

      <div className="mt-6 space-y-6">
        {!prescribed ? (
          <div className="space-y-4">
            <ChoiceField
              label="Votre location est-elle passée par une agence ?"
              choices={[
                { value: "yes", label: "Oui" },
                { value: "no", label: "Non" },
              ]}
              value={answers.agencyUsed === undefined ? undefined : answers.agencyUsed ? "yes" : "no"}
              onChange={(v) => set("agencyUsed", v === "yes")}
            />
            {answers.agencyUsed === true ? (
              <>
                <MoneyField
                  label="Honoraires payés à l'entrée (votre part)"
                  hint="Visite, dossier, rédaction du bail — la ligne « honoraires » de votre facture."
                  cents={answers.agencyFeesPaidCents}
                  onChange={(c) => set("agencyFeesPaidCents", c)}
                />
                <MoneyField
                  label="État des lieux facturé séparément (si oui)"
                  hint="Facultatif."
                  cents={answers.edlFeesPaidCents}
                  onChange={(c) => set("edlFeesPaidCents", c)}
                />
              </>
            ) : answers.agencyUsed === false ? (
              <MoneyField
                label="Frais payés au propriétaire (dossier, rédaction du bail…)"
                hint="Un particulier ne peut pas facturer ces frais : ils sont intégralement récupérables."
                cents={answers.privateLandlordFeesPaidCents}
                onChange={(c) => set("privateLandlordFeesPaidCents", c)}
              />
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="text-sm font-medium text-ink/80">Frais interdits au quotidien</p>
          <div className="mt-2">
            <Checklist
              items={FORBIDDEN_FEES_ITEMS}
              checked={answers.forbiddenFees ?? []}
              onToggle={toggle("forbiddenFees")}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink/80">Vos charges</p>
          <div className="mt-2">
            <Checklist
              items={CHARGES_REVIEW_ITEMS}
              checked={answers.chargesReviewItems ?? []}
              onToggle={toggle("chargesReviewItems")}
            />
          </div>
        </div>
      </div>

      {hasInput ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-paper-2 p-4">
          <p className="text-sm text-ink/70">
            {delta > 0 ? (
              <>
                À ajouter à votre dossier :{" "}
                <span className="tabular font-mono font-semibold text-refund-text">
                  +{formatEur(delta)}
                </span>
              </>
            ) : (
              "Vos réponses seront jointes au dossier pour la revue."
            )}
          </p>
          <Button onClick={save} disabled={saving}>
            {saving ? "Mise à jour…" : "Mettre à jour mon dossier"}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-stamp">
          {error}
        </p>
      ) : null}
    </section>
  );
}
