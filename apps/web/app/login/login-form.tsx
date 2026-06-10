"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.sent) {
    return (
      <div className="rounded-card border border-line bg-paper-2 p-6">
        <p className="font-display text-lg font-bold">Vérifiez votre boîte mail</p>
        <p className="mt-2 text-ink/70">
          Nous vous avons envoyé un lien de connexion. Cliquez dessus pour accéder à votre espace.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-medium text-ink/80">Votre email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="vous@email.fr"
          className="mt-1 w-full rounded-field border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
      </label>
      {state.error ? <p className="text-sm text-stamp">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-field bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Recevoir mon lien de connexion"}
      </button>
      <p className="text-xs text-ink/50">Pas de mot de passe. Un lien sécurisé, valable 30 minutes.</p>
    </form>
  );
}
