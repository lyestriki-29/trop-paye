import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/home/Reveal";
import { CountUpInt } from "@/components/home/nb/CountUpInt";
import {
  BAISSE_MOY_CENTS,
  DOSSIERS_AIDES,
  RECUPERE_CENTS,
} from "@/lib/content/resultats-publics";

/**
 * Section « Résultats » de la LP (ancre #resultats, ciblée par la nav) — ce
 * qu'on a DÉJÀ fait, placée tôt pour la preuve chiffrée immédiate. Chiffres
 * réels fournis par Lyes (2026-06-13) ; à brancher sur les stats publiques.
 */

const ITEMS = [
  { kind: "int" as const, value: DOSSIERS_AIDES, suffix: "locataires aidés" },
  { kind: "eur" as const, cents: RECUPERE_CENTS, suffix: "récupérés pour nos locataires" },
  {
    kind: "eur" as const,
    cents: BAISSE_MOY_CENTS,
    perMonth: true,
    suffix: "de loyer en moins, en moyenne",
  },
];

/* Réassurance : pourquoi ces chiffres sont fiables. */
const GARANTIES = ["Chaque euro tracé sur un compte dédié", "Données en France"];

export function ResultatsNb() {
  return (
    <section id="resultats" className="scroll-mt-24 border-b-3 border-nb-ink bg-menthe py-14 sm:py-16">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <div className="grid gap-x-12 gap-y-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
                Pièce n°01 · Nos résultats
              </p>
              <h2 className="mt-3 text-[clamp(28px,4.5vw,52px)]">
                Déjà <span className="nb-mark">récupéré</span>, déjà reversé.
              </h2>
            </div>
            <p className="max-w-xl font-nb-body text-xl font-medium leading-relaxed text-nb-ink/90 lg:pb-1">
              Pas de promesse en l&apos;air : voici ce que nous avons déjà obtenu pour de vrais
              locataires. Que des chiffres réels, jamais d&apos;exemple inventé.
            </p>
          </div>
        </Reveal>

        <dl className="mt-10 grid gap-8 sm:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.suffix} delay={0.08 + i * 0.1}>
              <div className="nb-tilt nb-card flex h-full flex-col justify-center p-7">
                <dd className="tabular font-mono text-[clamp(40px,6vw,68px)] font-medium leading-none text-refund">
                  {item.kind === "int" ? (
                    <CountUpInt value={item.value} />
                  ) : (
                    <>
                      <CountUp cents={item.cents} />
                      {item.perMonth ? (
                        <span className="whitespace-nowrap text-[0.3em] font-nb-body font-medium text-nb-ink/55">
                          {" "}
                          /mois
                        </span>
                      ) : null}
                    </>
                  )}
                </dd>
                <dt className="mt-4 font-nb-body text-base font-medium leading-relaxed text-nb-ink/80">
                  {item.suffix}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>

        {/* Bande de réassurance + lien vers le témoignage détaillé. */}
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-3 border-nb-ink pt-6">
            {GARANTIES.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-2 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/65"
              >
                <span aria-hidden className="text-refund">▪</span>
                {g}
              </span>
            ))}
            <Link
              href="#preuve"
              className="ml-auto nb-mono text-[11px] font-semibold uppercase tracking-wider text-nb-ink underline underline-offset-4"
            >
              Voir un dossier réel
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
