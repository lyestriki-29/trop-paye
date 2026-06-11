import { formatEUR } from "@troppaye/shared";
import { TEMOIGNAGES } from "@/lib/content/temoignages";
import { CountUp } from "@/components/ui/CountUp";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Stamp } from "@/components/ui/Stamp";
import { Reveal } from "./Reveal";

/**
 * Témoignages (décision Lyes 2026-06-11 : home + /resultats) — RÉELS uniquement,
 * jamais d'exemple inventé. Composition premium v2.1 : citation éditoriale XXL
 * à gauche, reçu de reversement perforé à droite (la preuve est la décoration).
 * [AVOCAT] avant diffusion publique : accord écrit du témoin.
 */
export function Temoignages({ numero = "04" }: { numero?: string }) {
  const t = TEMOIGNAGES[0];
  if (!t) return null;

  return (
    <section className="mx-auto max-w-container px-6 py-16 sm:py-20">
      <Reveal>
        <p aria-hidden className="font-mono text-xs font-medium tracking-widest text-ink/45">
          {numero}
        </p>
        {/* TODO_COPY — intitulé de section (hors copy deck). */}
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Ils ont <Marker>récupéré</Marker>
        </h2>
      </Reveal>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
        <Reveal delay={0.08}>
          <figure className="relative">
            <span
              aria-hidden
              className="absolute -left-3 -top-10 select-none font-display text-giga font-extrabold leading-none text-accent"
            >
              “
            </span>
            <blockquote className="relative font-display text-xl font-bold leading-snug tracking-display text-ink sm:text-2xl">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-mono text-sm uppercase tracking-widest text-ink/55">
                {t.prenom} · {t.contexte}
              </span>
              <Stamp tone="refund" rotate={-4}>
                Dossier clos
              </Stamp>
            </figcaption>
            {/* Mention de contexte VRAIE (décision Lyes 2026-06-11) : le dossier a été
                mené avant le lancement — désamorce toute lecture « résultat TropPayé »
                (L121-2) tant qu'aucun dossier n'a été traité par la plateforme.
                [AVOCAT] accord écrit du témoin toujours requis avant diffusion large. */}
            <p className="mt-4 font-mono text-xs text-ink/45">
              Dossier mené en amont du lancement de TropPayé.
            </p>
          </figure>
        </Reveal>

        <Reveal delay={0.18}>
          <QuittanceCard
            perforated
            className="shadow-deep"
            /* TODO_COPY — libellés du reçu (vocabulaire document, hors copy deck). */
            reference={`Dossier ${t.prenom} — ${t.contexte.split("— ")[1] ?? ""}`}
            kind="Reçu de reversement"
            rows={[
              { label: "Loyer payé", text: `${formatEUR(t.loyerCents)} / mois` },
              ...t.lignes.map((l) => ({ label: l.label, text: l.text })),
            ]}
          >
            <div className="mt-4 flex items-end justify-between gap-6 border-t-2 border-ink pt-4">
              <p className="text-sm font-medium text-ink/80">Reversé au locataire</p>
              <p className="text-xl font-medium text-refund-text">
                <CountUp cents={t.recupereCents} />
              </p>
            </div>
          </QuittanceCard>
        </Reveal>
      </div>
    </section>
  );
}
