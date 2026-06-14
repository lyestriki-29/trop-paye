import { PRESCRIPTION_YEARS, brand, formatEUR } from "@troppaye/shared";
import { CountUp } from "@/components/ui/CountUp";
import { HeroAddress } from "@/components/home/HeroAddress";

/**
 * Hero néubrutaliste — variante « Mix 2 v2 » validée 2026-06-14 (compagnon visuel,
 * spec docs/superpowers/specs/2026-06-14-hero-da-design.md). Objectif unique :
 * pousser au diagnostic. Compteur géant (choc) à gauche + quittance-preuve à droite,
 * bande lavande. Copy deck §1 verbatim ; « 37 diagnostics » = TODO_COPY/TODO_VERIFIER.
 */

/** −194 € : baisse de loyer moyenne (réel, Lyes 2026-06-13). Montant en centimes. */
const AVG_MONTHLY_SAVING_CENTS = 19_400;

/** Style du compteur géant : stroke + ombre dure nb (pas une classe utilitaire). */
const METER_STYLE = {
  WebkitTextStroke: "2px rgb(var(--color-nb-ink))",
  textShadow: "6px 6px 0 rgb(var(--color-nb-ink))",
} as const;

/** Quittance spécimen nettoyée — chiffres témoin P0 (fictifs), aria-hidden. */
function VerdictCardNb() {
  const rows: ReadonlyArray<{ label: string; cents: number; accent?: boolean }> = [
    { label: "Loyer hors charges appelé", cents: 102_185 },
    { label: "Plafond légal (gel DPE F/G)", cents: 95_000 },
    { label: "Hausse illégale / mois", cents: 7_185, accent: true },
  ];
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-md px-2 pb-6 lg:mx-0">
      <span className="nb-sticker -left-2 -top-4 z-20 text-sm">0 € d&apos;avance</span>
      <span className="nb-sticker nb-sticker--right -right-2 -top-3 z-20 bg-pink text-nb-ink text-sm">
        25 % au succès
      </span>
      <div className="nb-tilt nb-card p-7 sm:p-8">
        <div className="flex items-center justify-between nb-mono text-[11px] uppercase tracking-widest text-nb-ink/55">
          <span>Réf. TP-2026-0117</span>
          <span>Quittance de loyer</span>
        </div>
        <p className="mt-2 nb-mono text-sm text-nb-ink/70">12 rue des Lilas, 75011 Paris</p>
        <dl className="mt-6 space-y-3.5">
          {rows.map(({ label, cents, accent }) => (
            <div
              key={label}
              className={
                accent
                  ? "-mx-3 flex items-baseline justify-between gap-4 border-3 border-nb-ink bg-acid px-3 py-2.5 shadow-nb-sm"
                  : "flex items-baseline justify-between gap-4 border-b border-nb-ink/15 pb-3"
              }
            >
              <dt className="font-nb-body text-[15px] text-nb-ink/80">{label}</dt>
              <dd
                className={`tabular nb-mono text-base font-medium ${
                  accent ? "text-refund" : "text-nb-ink"
                }`}
              >
                {accent ? "+" : ""}
                {formatEUR(cents, { decimals: true })}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-end justify-between border-t-3 border-nb-ink pt-4">
          <span className="font-nb-display text-sm uppercase leading-none">
            Trop-perçu
            <br />
            récupéré
          </span>
          <span className="tabular nb-mono text-3xl font-semibold text-refund">
            {formatEUR(143_700, { decimals: true })}
          </span>
        </div>
      </div>
      {/* Tampon imprimé — descendu à droite, sous le total (demande Lyes).
          Élément autonome : `.nb-stamp` global est masqué hors variante Maximal. */}
      <span
        aria-hidden="true"
        className="absolute -bottom-3 right-5 z-20 -rotate-[8deg] border-3 border-pink bg-paper/60 px-3 py-1.5 font-nb-display text-base uppercase tracking-wide text-pink"
      >
        Trop payé
      </span>
    </aside>
  );
}

/** Chiffres d'appui (factuels) — strip pleine largeur de page. */
const STRIP: ReadonlyArray<{ value: string; label: string }> = [
  { value: "1 sur 6", label: "logement loué a un loyer illégal (source : SDES)" },
  { value: "24/08/2022", label: "loyers des passoires F/G gelés depuis cette date" },
  { value: `${PRESCRIPTION_YEARS} ans`, label: "de trop-perçu récupérable (prescription)" },
  { value: "25 %", label: "de commission, au succès. Rien récupéré ? Rien payé." },
];

/** Strip de chiffres — pleine largeur de page (bord à bord). */
function StripNb() {
  return (
    <div className="border-t-3 border-nb-ink bg-nb-ink">
      <dl className="grid w-full grid-cols-2 gap-px bg-nb-ink sm:grid-cols-4">
        {STRIP.map(({ value, label }) => (
          <div key={value} className="bg-paper px-6 py-6">
            <dd className="tabular font-nb-display text-2xl sm:text-3xl">{value}</dd>
            <dt className="mt-2 max-w-[28ch] nb-mono text-[11px] uppercase leading-relaxed tracking-wider text-nb-ink/60">
              {label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function HeroNb() {
  return (
    <section className="relative overflow-hidden border-b-3 border-nb-ink bg-violet">
      <div className="relative mx-auto max-w-container px-6 py-14 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/65">
              Loyer encadré · gel F/G · bouclier 3,5 %
            </p>
            {/* Compteur géant : −194 €/mois, count-up en vue (reduced-motion = valeur finale). */}
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <span
                style={METER_STYLE}
                className="tabular nb-mono text-[clamp(64px,11vw,128px)] font-semibold leading-[0.8] text-refund"
              >
                −<CountUp cents={AVG_MONTHLY_SAVING_CENTS} durationMs={1400} />
              </span>
              <span className="border-l-3 border-nb-ink pl-4 nb-mono text-[13px] uppercase leading-relaxed tracking-wide text-nb-ink/80 sm:max-w-[22ch]">
                <span className="block font-nb-display text-sm normal-case tracking-normal">
                  par mois en moyenne
                </span>
                de loyer économisé une fois la hausse illégale supprimée
              </span>
            </div>
            {/* brand.hero.title verbatim (composition 2 lignes). */}
            <h1 className="mt-7 text-[clamp(40px,6vw,72px)]">
              Marre de <span className="nb-mark">trop payer</span>&nbsp;?
            </h1>
            <p className="mt-5 max-w-xl font-nb-body text-lg leading-relaxed text-nb-ink/80">
              {brand.hero.subtitle}
            </p>
            <div className="mt-7">
              <HeroAddress />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2.5 border-2 border-nb-ink bg-paper px-3.5 py-2 nb-mono text-[12px] font-medium text-nb-ink shadow-nb-sm">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-refund" />
                37 diagnostics lancés cette semaine
              </span>
              <span className="nb-mono text-xs uppercase tracking-wider text-nb-ink/60">
                {brand.hero.reassurance.join(" · ")}
              </span>
            </div>
          </div>
          <div className="relative">
            <VerdictCardNb />
          </div>
        </div>
      </div>
      <StripNb />
    </section>
  );
}

/** Items factuels (moteur + CLAUDE.md) — dupliqués ×2 pour la boucle. */
const TICKER: ReadonlyArray<string> = [
  "Gel des loyers F/G — loi Climat, art. 159",
  "Bouclier d'indexation +3,5 % max — T3 2022 → T1 2024",
  "IRL — série INSEE 001515333",
  `Jusqu'à ${PRESCRIPTION_YEARS} ans de trop-perçu récupérable`,
  "0 € d'avance — 25 % au succès",
  "Données hébergées en France",
];

/** Bandeau défilant des bases légales — réutilise la mécanique `v3-marquee`. */
export function TickerNb() {
  return (
    <div
      aria-hidden="true"
      className="v3-marquee border-b-3 border-nb-ink bg-nb-ink py-3 text-cream"
    >
      <div className="v3-marquee-track">
        {[...TICKER, ...TICKER].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-3 pr-8 nb-mono text-[12px] font-medium uppercase tracking-widest text-cream/85"
          >
            <span className="text-acid">●</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
