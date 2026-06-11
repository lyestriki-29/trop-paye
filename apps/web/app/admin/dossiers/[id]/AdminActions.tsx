"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateDossier,
  refuseDossier,
  requestPiece,
  tagLandlordReply,
  resumeRecovery,
  tagContestation,
  recordPayment,
  advanceTime,
  type AdminResult,
  type LandlordReplyTag,
} from "@/app/admin/actions";

const BTN = "rounded-field px-4 py-2 text-sm font-medium disabled:opacity-40";
const PRIMARY = `${BTN} bg-ink text-paper hover:bg-ink/90`;
const NEUTRAL = `${BTN} border border-line text-ink hover:bg-paper-2`;

export function AdminActions({
  dossierId,
  status,
  recoveryState,
  confidenceLow,
  recoverableCents,
}: {
  dossierId: string;
  status: string;
  recoveryState: string;
  confidenceLow: boolean;
  recoverableCents: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(String(Math.round(recoverableCents / 100)));
  const [agreed, setAgreed] = useState("");
  const [replyTag, setReplyTag] = useState<LandlordReplyTag>("PAIEMENT");
  const [delayDays, setDelayDays] = useState("15");

  async function run(key: string, fn: () => Promise<AdminResult>) {
    setPending(key);
    setError(null);
    const res = await fn();
    setPending(null);
    if ("error" in res) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="space-y-4 rounded-card border border-line bg-paper p-5">
      <h2 className="font-display font-bold">Actions</h2>
      {error ? <p className="text-sm text-stamp">{error}</p> : null}

      {status === "IN_REVIEW" ? (
        <div className="space-y-4">
          <div>
            <button
              type="button"
              disabled={pending !== null || confidenceLow}
              onClick={() => run("validate", () => validateDossier(dossierId))}
              className={PRIMARY}
            >
              {pending === "validate" ? "…" : "Valider → lancer la séquence"}
            </button>
            {confidenceLow ? (
              <p className="mt-1 text-xs text-stamp">Confiance LOW : validation bloquée.</p>
            ) : null}
          </div>

          <div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Pièce à demander au client…"
              className="w-full rounded-field border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button
              type="button"
              disabled={pending !== null || !note.trim()}
              onClick={() => run("piece", () => requestPiece(dossierId, note))}
              className={`mt-2 ${NEUTRAL}`}
            >
              Demander une pièce
            </button>
          </div>

          <div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Motif du refus (visible par le client)…"
              className="w-full rounded-field border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => run("refuse", () => refuseDossier(dossierId, reason))}
              className={`mt-2 ${BTN} border border-stamp text-stamp hover:bg-stamp/5`}
            >
              Refuser le dossier
            </button>
          </div>
        </div>
      ) : null}

      {status === "RECOVERY" || status === "ESCALATED" ? (
        <div className="space-y-3">
          {status === "RECOVERY" && recoveryState === "SCHEDULED" ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => run("advance", () => advanceTime(dossierId))}
                className={NEUTRAL}
              >
                Avancer le temps (1 action)
              </button>
              {/* Les 4 réponses bailleur typées (PRD D2) — chacune son effet scripté. */}
              <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
                <label className="text-xs text-ink/60">
                  Réponse du bailleur
                  <select
                    value={replyTag}
                    onChange={(e) => setReplyTag(e.target.value as LandlordReplyTag)}
                    className="mt-1 block rounded-field border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                  >
                    <option value="PAIEMENT">Annonce un paiement → pause</option>
                    <option value="CONTESTATION_FORME">Conteste la forme → pause</option>
                    <option value="DEMANDE_DELAI">Demande un délai → décale les relances</option>
                    <option value="CONTESTATION_FOND">Conteste le fond → escalade (verrou)</option>
                  </select>
                </label>
                {replyTag === "DEMANDE_DELAI" ? (
                  <label className="text-xs text-ink/60">
                    Délai (jours)
                    <input
                      type="text"
                      inputMode="numeric"
                      value={delayDays}
                      onChange={(e) => setDelayDays(e.target.value.replace(/[^0-9]/g, ""))}
                      className="mt-1 w-20 rounded-field border border-line bg-paper px-3 py-2 font-mono tabular text-sm outline-none focus:border-ink"
                    />
                  </label>
                ) : null}
                <button
                  type="button"
                  disabled={pending !== null || (replyTag === "DEMANDE_DELAI" && !delayDays)}
                  onClick={() =>
                    run("reply", () => tagLandlordReply(dossierId, replyTag, Number(delayDays) || 15))
                  }
                  className={NEUTRAL}
                >
                  {pending === "reply" ? "…" : "Taguer la réponse"}
                </button>
              </div>
            </div>
          ) : null}

          {status === "RECOVERY" && recoveryState === "PAUSED" ? (
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => run("resume", () => resumeRecovery(dossierId))}
              className={NEUTRAL}
            >
              Reprendre la séquence
            </button>
          ) : null}

          {status === "RECOVERY" ? (
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => run("contest", () => tagContestation(dossierId))}
              className={`${BTN} border border-stamp text-stamp hover:bg-stamp/5`}
            >
              Contestation de fond → escalade (verrou)
            </button>
          ) : null}

          <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <label className="text-xs text-ink/60">
              Versement encaissé (€)
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-28 rounded-field border border-line bg-paper px-3 py-2 font-mono tabular text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="text-xs text-ink/60">
              Convenu au total (€, si échéancier)
              <input
                type="text"
                inputMode="numeric"
                value={agreed}
                onChange={(e) => setAgreed(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="vide = solde"
                className="mt-1 w-32 rounded-field border border-line bg-paper px-3 py-2 font-mono tabular text-sm outline-none focus:border-ink"
              />
            </label>
            <button
              type="button"
              disabled={pending !== null || !amount}
              onClick={() =>
                run("pay", () =>
                  recordPayment(
                    dossierId,
                    Number(amount) * 100,
                    agreed ? Number(agreed) * 100 : undefined,
                  ),
                )
              }
              className={`${BTN} bg-refund text-paper hover:bg-refund-text`}
            >
              {pending === "pay" ? "…" : "Enregistrer le versement"}
            </button>
          </div>
        </div>
      ) : null}

      {!["IN_REVIEW", "RECOVERY", "ESCALATED"].includes(status) ? (
        <p className="text-sm text-ink/55">Dossier clôturé — aucune action.</p>
      ) : null}
    </div>
  );
}
