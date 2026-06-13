import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/home/Reveal";
import { CountUpInt } from "@/components/home/nb/CountUpInt";

/**
 * Bande « Résultats » — ce qu'on a DÉJÀ fait, placée tôt (juste après le hero)
 * pour la preuve chiffrée immédiate. Chiffres réels fournis par Lyes
 * (2026-06-13) ; à brancher sur les stats publiques en Phase 2.
 */

const DOSSIERS = 22;
const RECUPERE_CENTS = 3_743_800; // 37 438 €
const BAISSE_MOY_CENTS = 19_400; // 194 € / mois

const ITEMS = [
  { kind: "int" as const, value: DOSSIERS, suffix: "dossiers résolus" },
  { kind: "eur" as const, cents: RECUPERE_CENTS, suffix: "récupérés pour nos locataires" },
  { kind: "eur" as const, cents: BAISSE_MOY_CENTS, perMonth: true, suffix: "de loyer en moins, en moyenne" },
];

export function ResultatsNb() {
  return (
    <section className="border-b-3 border-nb-ink py-14 sm:py-16">
      <div className="mx-auto max-w-container px-6">
        <Reveal>
          <p aria-hidden className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
            Pièce n°00 · Nos résultats
          </p>
          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4.5vw,52px)]">
            Déjà <span className="nb-mark">récupéré</span>, déjà reversé.
          </h2>
        </Reveal>

        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.suffix} delay={0.08 + i * 0.1}>
              <div className="nb-tilt nb-card h-full p-7">
                <dd className="tabular font-nb-display text-[clamp(40px,6vw,68px)] leading-none text-refund">
                  {item.kind === "int" ? (
                    <CountUpInt value={item.value} />
                  ) : (
                    <>
                      <CountUp cents={item.cents} />
                      {item.perMonth ? (
                        <span className="text-[0.45em] text-nb-ink/60"> / mois</span>
                      ) : null}
                    </>
                  )}
                </dd>
                <dt className="mt-4 font-nb-body text-sm leading-relaxed text-nb-ink/75">
                  {item.suffix}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
