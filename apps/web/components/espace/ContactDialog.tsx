"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CALLBACK_SLOTS, type CallbackSlot } from "@/lib/espace/callback";
import { requestCallback } from "@/app/espace/[dossierId]/actions";

export function ContactDialog({ dossierId, initialPhone }: { dossierId: string; initialPhone: string }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const [subject, setSubject] = useState("");
  const [slot, setSlot] = useState<CallbackSlot>("ASAP");
  const [phone, setPhone] = useState(initialPhone);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    const res = await requestCallback({ dossierId, subject, preferredSlot: slot, phone });
    setPending(false);
    if ("error" in res) setError(res.error);
    else setDone(true);
  }

  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-lift">
      <p className="mb-3 font-display text-sm font-bold">Être rappelé</p>

      {done ? (
        <p className="text-sm text-refund-text">Demande reçue. Nous vous rappelons au {phone}.</p>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs text-ink/60">
            Sujet
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Ex. question sur mon dossier"
              className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <fieldset>
            <legend className="text-xs text-ink/60">Créneau préféré</legend>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CALLBACK_SLOTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={slot === s.value}
                  onClick={() => setSlot(s.value)}
                  className={`rounded-field border px-2.5 py-1 text-xs ${
                    slot === s.value ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs text-ink/60">
            Téléphone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              maxLength={30}
              placeholder="0612345678"
              className="mt-1 w-full rounded-field border border-line bg-paper px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          {error ? <p className="text-xs text-stamp">{error}</p> : null}

          <button
            type="button"
            disabled={pending || !subject.trim() || phone.trim().length < 4}
            onClick={submit}
            className="w-full rounded-field bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-40"
          >
            {pending ? "Envoi…" : "Demander à être rappelé"}
          </button>

          {whatsapp ? (
            <Button href={`https://wa.me/${whatsapp}`} variant="accent">
              Discuter sur WhatsApp
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
