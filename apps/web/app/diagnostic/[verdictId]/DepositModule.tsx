"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateAll, type DossierSnapshot, type Referentials } from "@troppaye/rules-engine";
import { ChoiceField, DateField, MoneyField } from "@/app/diagnostic/questionnaire/fields";
import { Amount } from "@/components/Amount";
import { Button } from "@/components/ui/Button";
import {
  answersFromSnapshot,
  canUseDepositMonthPresets,
  depositAnswersDraftSchema,
  depositAnswersSchema,
  depositMonthsToCents,
  getDepositMergeIssue,
  mergeDepositAnswers,
  type DepositAnswers,
  type DepositAnswersDraft,
  type DepositMonthPreset,
} from "@/lib/diagnostic/deposit-tunnel";
import { submitDeposit } from "@/app/diagnostic/[verdictId]/deposit-actions";

type DepositChoice = "1" | "2" | "3" | "other";
type RefundChoice = "NO" | "PARTIAL" | "FULL";
const MONTH_BY_CHOICE: Record<Exclude<DepositChoice, "other">, DepositMonthPreset> = {
  "1": 1,
  "2": 2,
  "3": 3,
};
const DEPOSIT_CHOICES: { value: DepositChoice; label: string }[] = [
  { value: "1", label: "1 mois" },
  { value: "2", label: "2 mois" },
  { value: "3", label: "3 mois" },
  { value: "other", label: "Autre" },
];
const EDL_CHOICES: { value: "yes" | "no"; label: string }[] = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
];
const REFUND_CHOICES: { value: RefundChoice; label: string }[] = [
  { value: "NO", label: "Non" },
  { value: "PARTIAL", label: "Partiellement" },
  { value: "FULL", label: "Totalement" },
];

function choiceFromMonths(months?: DepositMonthPreset): DepositChoice | undefined {
  if (months === 1) return "1";
  if (months === 2) return "2";
  if (months === 3) return "3";
  return undefined;
}

/** Mini-tunnel dépôt (LOT 3) — TODO_COPY, libellés brouillon. */
export function DepositModule({
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
  const storageKey = `tp_deposit_${dossierId}`;
  const allowMonthPresets = canUseDepositMonthPresets(snapshot);
  const [answers, setAnswers] = useState<DepositAnswersDraft>(() => answersFromSnapshot(snapshot));
  const [asOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // « Autre montant » est un choix explicite : sans ce flag, cliquer « Autre »
  // (qui vide depositMonths) ferait disparaître le champ de saisie du montant exact.
  const [otherMode, setOtherMode] = useState(
    () => answers.depositMonths === undefined && answers.depositCents !== undefined,
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = depositAnswersDraftSchema.safeParse(JSON.parse(raw));
      if (parsed.success) setAnswers((a) => ({ ...a, ...parsed.data }));
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

  const validAnswers = useMemo<DepositAnswers | null>(() => {
    const parsed = depositAnswersSchema.safeParse(answers);
    if (!parsed.success) return null;
    return getDepositMergeIssue(snapshot, parsed.data) ? null : parsed.data;
  }, [answers, snapshot]);

  const previewDelta = useMemo(() => {
    if (!validAnswers) return null;
    try {
      const base = evaluateAll({ dossier: snapshot, referentials, asOf });
      const next = evaluateAll({ dossier: mergeDepositAnswers(snapshot, validAnswers), referentials, asOf });
      return next.totalRecoverableCents - base.totalRecoverableCents;
    } catch {
      return null;
    }
  }, [validAnswers, snapshot, referentials, asOf]);

  const amountChoice: DepositChoice | undefined = otherMode
    ? "other"
    : choiceFromMonths(answers.depositMonths);
  const equivalentCents = useMemo(() => {
    if (!answers.depositMonths) return null;
    try {
      return depositMonthsToCents(snapshot, answers.depositMonths);
    } catch {
      return null;
    }
  }, [answers.depositMonths, snapshot]);

  const set = <K extends keyof DepositAnswersDraft>(key: K, value: DepositAnswersDraft[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  const setAmountChoice = (choice: DepositChoice) => {
    if (choice === "other") {
      setOtherMode(true);
      setAnswers((a) => ({ ...a, depositMonths: undefined }));
      return;
    }
    setOtherMode(false);
    setAnswers((a) => ({ ...a, depositMonths: MONTH_BY_CHOICE[choice], depositCents: undefined }));
  };
  const setRefunded = (refunded: RefundChoice) =>
    setAnswers((a) => ({
      ...a,
      refunded,
      ...(refunded === "NO" ? { refundCents: undefined, refundDate: undefined } : {}),
    }));

  const save = async () => {
    if (!validAnswers) return setError("Complétez les champs du dépôt pour continuer.");
    setSaving(true);
    setError(null);
    const res = await submitDeposit({ verdictId, ...validAnswers });
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
    <section id="depot-garantie" className="nb-card mt-10 rounded-none p-6 sm:p-8">
      <h2 className="font-nb-display text-lg font-black uppercase tracking-wide">
        Dépôt de garantie
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        Mini-vérification facultative — brouillon, à valider.
      </p>
      <div className="mt-6 space-y-6">
        <DateField label="Date de remise des clés" value={answers.leaveDate ?? ""} max={asOf} onChange={(v) => set("leaveDate", v || undefined)} />
        <ChoiceField
          label="L'état des lieux de sortie est-il conforme ?"
          choices={EDL_CHOICES}
          value={answers.edlConforme === undefined ? undefined : answers.edlConforme ? "yes" : "no"}
          onChange={(v) => set("edlConforme", v === "yes")}
        />
        <ChoiceField
          label="Avez-vous communiqué votre nouvelle adresse au bailleur ?"
          choices={EDL_CHOICES}
          value={
            answers.addressTransmitted === undefined
              ? undefined
              : answers.addressTransmitted
                ? "yes"
                : "no"
          }
          onChange={(v) => set("addressTransmitted", v === "yes")}
        />
        {allowMonthPresets ? (
          <div>
            <ChoiceField label="Montant du dépôt versé à l'entrée" choices={DEPOSIT_CHOICES} value={amountChoice} onChange={setAmountChoice} />
            {equivalentCents !== null ? (
              <p className="mt-2 text-xs text-ink/55">
                Équivalent : <Amount cents={equivalentCents} />
              </p>
            ) : null}
          </div>
        ) : null}
        {amountChoice === "other" || !allowMonthPresets ? (
          <MoneyField
            label="Montant exact du dépôt"
            cents={answers.depositCents}
            onChange={(c) => setAnswers((a) => ({ ...a, depositCents: c, depositMonths: undefined }))}
          />
        ) : null}
        <ChoiceField<RefundChoice> label="Le dépôt a-t-il été remboursé ?" choices={REFUND_CHOICES} value={answers.refunded} onChange={setRefunded} />
        {answers.refunded === "PARTIAL" || answers.refunded === "FULL" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField label="Montant remboursé" cents={answers.refundCents} onChange={(c) => set("refundCents", c)} />
            <DateField label="Date du remboursement" value={answers.refundDate ?? ""} max={asOf} onChange={(v) => set("refundDate", v || undefined)} />
          </div>
        ) : null}
        <MoneyField label="Montant retenu avec justificatif (facultatif)" cents={answers.justifiedRetentionCents} onChange={(c) => set("justifiedRetentionCents", c)} />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-paper p-4">
        <p className="text-sm text-ink/70">
          {previewDelta !== null && previewDelta > 0 ? (
            <>
              À ajouter à votre dossier : +<Amount cents={previewDelta} favorable />
            </>
          ) : (
            "Complétez les 4 questions pour recalculer votre dossier."
          )}
        </p>
        <Button onClick={save} disabled={saving || !validAnswers}>
          {saving ? "Mise à jour…" : "Mettre à jour mon dossier"}
        </Button>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-stamp">{error}</p> : null}
    </section>
  );
}
