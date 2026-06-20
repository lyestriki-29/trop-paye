"use client";

import { useActionState } from "react";
import { sendLoginCode, verifyLoginCode, type LoginState } from "./actions";

// DA « quittance » (nb) : champ à bord dur + ombre, CTA encre, labels mono.
const fieldClass =
  "nb-field mt-2 block w-full px-4 py-3 text-[15px] outline-none placeholder:text-nb-ink/40";
const submitClass =
  "nb-pill nb-pill--ink mt-1 w-full py-3 text-sm font-black uppercase tracking-wide disabled:opacity-60";
const labelClass = "nb-mono text-xs uppercase tracking-widest text-nb-ink/60";

export function LoginForm({ next }: { next: string }) {
  const [sendState, sendAction, sending] = useActionState<LoginState, FormData>(sendLoginCode, {});
  const [verifyState, verifyAction, verifying] = useActionState<LoginState, FormData>(
    verifyLoginCode,
    {},
  );

  // L'email confirmé à l'étape 1 (ou reporté par une erreur de vérif) gouverne
  // le passage à l'étape « saisie du code ».
  const email = verifyState.email ?? sendState.email;
  const onCodeStep = (sendState.sent || verifyState.sent) && Boolean(email);

  if (onCodeStep && email) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-nb-ink bg-paper-2 p-4">
          <p className="text-sm text-nb-ink/75">
            Code envoyé à <span className="font-bold text-nb-ink">{email}</span>. Saisissez-le
            ci-dessous pour vous connecter.
          </p>
        </div>
        {/* Étape 2 : vérification du code — cadré comme la ligne « montant » d'un reçu. */}
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={email} />
          <label className="block">
            <span className={labelClass}>Code à 6 chiffres</span>
            <input
              type="text"
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              autoFocus
              className={`tabular text-center text-2xl tracking-[0.4em] ${fieldClass}`}
            />
          </label>
          {verifyState.error ? <p className="text-sm font-medium text-stamp">{verifyState.error}</p> : null}
          <button type="submit" disabled={verifying} className={submitClass}>
            {verifying ? "Vérification…" : "Me connecter"}
          </button>
        </form>
        {/* Renvoyer un code : formulaire frère (pas de <form> imbriqué). */}
        <form action={sendAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            disabled={sending}
            className="nb-mono text-xs uppercase tracking-wide text-nb-ink/60 underline underline-offset-2 transition hover:text-nb-ink disabled:opacity-60"
          >
            {sending ? "Envoi…" : "Renvoyer un code"}
          </button>
        </form>
      </div>
    );
  }

  // Étape 1 : saisie de l'email.
  return (
    <form action={sendAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className={labelClass}>Locataire</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="vous@email.fr"
          className={fieldClass}
        />
      </label>
      {sendState.error ? <p className="text-sm font-medium text-stamp">{sendState.error}</p> : null}
      <button type="submit" disabled={sending} className={submitClass}>
        {sending ? "Envoi…" : "► Recevoir mon code"}
      </button>
      <p className="nb-mono text-[11px] text-nb-ink/50">
        Pas de mot de passe · code à 6 chiffres · 30 min
      </p>
    </form>
  );
}
