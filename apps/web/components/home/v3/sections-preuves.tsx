import { formatEUR } from "@troppaye/shared";
import { CompteurPublic } from "@/components/home/CompteurPublic";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Stamp } from "@/components/ui/Stamp";
import { TEMOIGNAGES } from "@/lib/content/temoignages";
import type { PublicStats } from "@/lib/public-stats";

/**
 * Pièces n°05 et n°06 — la confiance (copy deck §1 mot pour mot, compteur
 * public RÉEL ou rien) et le témoignage Kilian (réel, [AVOCAT] accord écrit
 * avant diffusion). Compositions densifiées v3 : bande ink pleine largeur,
 * pièce à conviction à onglet.
 */

export function ConfianceV3({ stats }: { stats: PublicStats | null }) {
  return (
    <section id="resultats" className="scroll-mt-6 border-b border-line bg-ink py-16 text-paper sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-paper/40">
            Pièce n°05 · La confiance
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Nous faisons appliquer la loi. Rien de plus.
          </h2>
          <p className="mt-6 max-w-3xl leading-relaxed text-paper/75">
            Le gel des loyers des passoires thermiques, l&apos;indice de référence des loyers, les
            délais de restitution du dépôt de garantie : ce sont vos droits, écrits dans la loi.
            TropPayé les fait simplement respecter. Chaque calcul cite sa source. Chaque euro est
            tracé sur un compte dédié. Vos données restent en France.
          </p>
        </Reveal>
        {stats ? (
          <Reveal delay={0.16}>
            <div className="mt-10 border-t border-paper/15 pt-8">
              <CompteurPublic
                recoveredCents={stats.recoveredCents}
                inProgressCount={stats.inProgressCount}
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export function TemoignageV3() {
  const t = TEMOIGNAGES[0];
  if (!t) return null;

  return (
    <section className="border-b border-line bg-paper-2 py-16 sm:py-20">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="font-mono text-xs font-medium uppercase tracking-widest text-ink/45">
            Pièce n°06 · La preuve
          </p>
          {/* TODO_COPY — intitulé de section (hors copy deck, identique prod). */}
          <h2 className="mt-2 font-display text-xl font-extrabold tracking-display sm:text-2xl">
            Ils ont <Marker>récupéré</Marker>
          </h2>
        </Reveal>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
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
            </figure>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="relative -rotate-1 transition duration-300 hover:rotate-0">
              {/* Onglet de classeur — TODO_COPY (vocabulaire document). */}
              <span className="v3-tab absolute -top-6 left-6 z-10 bg-ink px-5 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-widest text-paper">
                Pièce à conviction
              </span>
              <QuittanceCard
                perforated
                className="shadow-pile"
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
