import { stripInternalMarkers } from "@troppaye/rules-engine";
import { Button } from "@/components/ui/Button";

/**
 * État « orientation » : loyer conforme MAIS signaux décence / interdiction
 * de louer. Règle des 3 régimes distincts (CLAUDE.md) : JAMAIS de montant,
 * JAMAIS de count-up — l'action relève d'une démarche judiciaire distincte.
 * Séquence dégradée : simple fondu de carte (CSS .reveal-*, reduced-motion ok).
 */
export function VerdictUnquantified({
  signals,
  addressLabel,
}: {
  signals: ReadonlyArray<string>;
  addressLabel: string;
}) {
  return (
    <section className="reveal-1 rounded-card border border-line bg-paper p-7 shadow-xl sm:p-10">
      {/* TODO_COPY [AVOCAT] — titre et chapeau hors copy deck. */}
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
        Diagnostic terminé
      </p>
      {addressLabel ? <p className="mt-2 font-mono text-sm text-ink/55">{addressLabel}</p> : null}
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display sm:text-[40px] sm:leading-[1.1]">
        Votre loyer est conforme, mais votre logement appelle une vérification.
      </h1>
      <p className="mt-4 leading-relaxed text-ink/70">
        Les règles chiffrées que nous vérifions (gel des loyers, révision IRL, dépôt de garantie)
        sont respectées. En revanche, un point relevé ci-dessous relève d&apos;une démarche
        juridique distincte — il ne se traduit pas par un montant automatique.
      </p>

      <ul className="reveal-2 mt-7 space-y-3">
        {signals.map((signal, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-card border border-line bg-paper-2 p-4 text-sm leading-relaxed text-ink/80"
          >
            <span aria-hidden className="text-stamp">
              ⚑
            </span>
            <span>{stripInternalMarkers(signal)}</span>
          </li>
        ))}
      </ul>

      <div className="reveal-3 mt-7 rounded-card bg-paper-2 p-5">
        {/* TODO_COPY — intitulé du bloc ; la phrase partenaire vient du copy deck §1 (FAQ). */}
        <p className="font-display font-bold">Et maintenant ?</p>
        <p className="mt-1 text-sm leading-relaxed text-ink/70">
          S&apos;il faut aller plus loin, nous vous proposons un avocat partenaire — toujours sans
          frais d&apos;avance.
        </p>
        <Button href="/" variant="ghost" className="mt-4">
          {/* TODO_COPY — libellé de repli hors deck. */}
          Retour à l&apos;accueil
        </Button>
      </div>
    </section>
  );
}
