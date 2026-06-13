"use client";

import { useActionState } from "react";
import { sendLoginCode, verifyLoginCode, type LoginState } from "./actions";

const fieldClass =
  "mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";
const submitClass =
  "w-full rounded-field bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60";

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
        <div className="rounded-card border border-line bg-paper-2 p-4">
          <p className="text-sm text-ink/70">
            Code envoyé à <span className="font-medium text-ink">{email}</span>. Saisissez-le
            ci-dessous pour vous connecter.
          </p>
        </div>
        {/* Étape 2 : vérification du code. */}
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={email} />
          <label className="block">
            <span className="text-sm font-medium text-ink/80">Code à 6 chiffres</span>
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
          {verifyState.error ? <p className="text-sm text-stamp">{verifyState.error}</p> : null}
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
            className="text-xs text-ink/60 underline underline-offset-2 transition hover:text-ink disabled:opacity-60"
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
        <span className="text-sm font-medium text-ink/80">Votre email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="vous@email.fr"
          className={fieldClass}
        />
      </label>
      {sendState.error ? <p className="text-sm text-stamp">{sendState.error}</p> : null}
      <button type="submit" disabled={sending} className={submitClass}>
        {sending ? "Envoi…" : "Recevoir mon code"}
      </button>
      <p className="text-xs text-ink/50">
        Pas de mot de passe. Un code à 6 chiffres, valable 30 minutes.
      </p>
    </form>
  );
}
