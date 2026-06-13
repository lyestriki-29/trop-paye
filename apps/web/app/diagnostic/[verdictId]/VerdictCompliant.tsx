import { Button } from "@/components/ui/Button";
import { IconHandCoins, IconSearch } from "@/components/home/icons";

/**
 * État conforme sans signal — copy deck §2 « Page verdict conforme »,
 * mot pour mot (titre, texte, veille, rebond dépôt de garantie).
 * Fondu simple (CSS .reveal-*, reduced-motion ok), aucun montant.
 */
export function VerdictCompliant({ addressLabel }: { addressLabel: string }) {
  return (
    <section className="reveal-1 rounded-card border border-line bg-paper p-7 shadow-xl sm:p-10">
      <p className="font-mono text-[11px] uppercase tracking-widest text-ink/55">
        {/* TODO_COPY — kicker hors deck. */}
        Diagnostic terminé
      </p>
      {addressLabel ? <p className="mt-2 font-mono text-sm text-ink/55">{addressLabel}</p> : null}
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-display sm:text-[40px] sm:leading-[1.1]">
        Bonne nouvelle : rien à signaler.
      </h1>
      <p className="mt-4 leading-relaxed text-ink/70">
        D&apos;après vos réponses et les données publiques, votre loyer respecte les règles que
        nous vérifions.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="reveal-2 rounded-card bg-paper-2 p-5">
          <IconSearch aria-hidden className="h-5 w-5 text-ink/60" />
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            Activez l&apos;alerte gratuite : si votre loyer augmente un jour, nous vérifierons
            automatiquement.
          </p>
        </div>
        <div className="reveal-3 rounded-card bg-paper-2 p-5">
          <IconHandCoins aria-hidden className="h-5 w-5 text-ink/60" />
          <Button
            href="#depot-garantie"
            variant="ghost"
            className="mt-4 w-full justify-start text-left"
          >
            Vous quittez bientôt votre logement ? Vérifiez aussi votre dépôt de garantie.
          </Button>
        </div>
      </div>

      <div className="reveal-3 mt-8">
        <Button href="/" variant="ghost">
          {/* TODO_COPY — libellé de repli hors deck. */}
          Retour à l&apos;accueil
        </Button>
      </div>
    </section>
  );
}
