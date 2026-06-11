import { Stamp } from "@/components/ui/Stamp";

/**
 * Palier 2 fermé (décision Lyes 2026-06-11) : tant que la société et les
 * formalités du recouvrement (statut R124) n'existent pas, pas de signature de
 * mandat — le verdict et le lead sont conservés, on recontacte à l'ouverture.
 * TODO_COPY — textes brouillon, hors copy deck.
 */
export function Waitlist({ dossierRef }: { dossierRef: string }) {
  return (
    <div className="mt-10">
      <Stamp tone="refund" rotate={-4}>
        Pilote
      </Stamp>
      <h1 className="mt-5 font-display text-2xl font-extrabold tracking-display">
        Votre dossier est prêt — vous êtes sur la liste du pilote
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-ink/70">
        Nous ouvrons les premiers dossiers par petits groupes pour garantir un suivi
        irréprochable. Votre verdict et votre dossier{" "}
        <span className="whitespace-nowrap font-mono text-sm">{dossierRef}</span> sont
        conservés : nous vous recontactons dès qu&apos;une place s&apos;ouvre — sous 7 jours
        pour les premiers inscrits.
      </p>
      <p className="mt-6 max-w-prose rounded-field border border-line bg-paper-2 px-4 py-3 text-sm leading-relaxed text-ink/70">
        Rappel : rien à payer d&apos;avance, jamais. Et vos justificatifs (quittances, bail,
        DPE) restent valables — gardez-les précieusement d&apos;ici notre retour.
      </p>
    </div>
  );
}
