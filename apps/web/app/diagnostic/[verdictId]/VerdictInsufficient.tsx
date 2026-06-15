import type { RuleResult } from "@troppaye/rules-engine";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/home/icons";
import { MISSING_LABEL } from "./RuleCard";

/**
 * État données insuffisantes : pas de chiffrage possible — on liste les
 * pièces manquantes (`missingData` agrégés des résultats) et on renvoie
 * vers le diagnostic (le brouillon est conservé en localStorage).
 * Fondu simple (CSS .reveal-*), aucun montant.
 */
export function VerdictInsufficient({
  results,
  addressLabel,
}: {
  results: ReadonlyArray<RuleResult>;
  addressLabel: string;
}) {
  const missing = [...new Set(results.flatMap((r) => r.missingData ?? []))]
    .map((key) => MISSING_LABEL[key])
    .filter((label): label is string => Boolean(label));

  return (
    <section className="nb-card reveal-1 rounded-none p-7 sm:p-10">
      {/* TODO_COPY — titre, chapeau et libellés de cet état (hors copy deck). */}
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
        Diagnostic à compléter
      </p>
      {addressLabel ? <p className="mt-2 font-mono text-sm text-ink/55">{addressLabel}</p> : null}
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display sm:text-[40px] sm:leading-[1.1]">
        Il nous manque une information pour conclure.
      </h1>
      <p className="mt-4 leading-relaxed text-ink/70">
        Votre situation n&apos;est ni validée ni écartée : sans les éléments ci-dessous, le calcul
        ne peut pas aboutir. Complétez-les pour obtenir votre verdict — vos réponses sont
        conservées.
      </p>

      {missing.length > 0 ? (
        <ul className="reveal-2 mt-7 space-y-2">
          {missing.map((label) => (
            <li
              key={label}
              className="flex items-baseline gap-3 border-2 border-ink bg-paper px-4 py-3 text-sm text-ink/80"
            >
              <span aria-hidden className="font-mono text-ink/45">
                →
              </span>
              <span>
                Il manque <span className="font-medium text-ink">{label}</span>.
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="reveal-3 mt-8">
        <Button href="/diagnostic" className="group">
          Reprendre le diagnostic
          <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
}
