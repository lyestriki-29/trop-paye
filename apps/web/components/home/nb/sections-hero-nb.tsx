import { PRESCRIPTION_YEARS, brand, formatEUR } from "@troppaye/shared";
import { CountUp } from "@/components/ui/CountUp";
import { HeroAddress } from "@/components/home/HeroAddress";
import { LogoNb } from "@/components/ui/LogoNb";
import { BAISSE_MOY_CENTS, DOSSIERS_AIDES } from "@/lib/content/resultats-publics";

/**
 * Hero néubrutaliste — variante « Mix 2 v2 » validée 2026-06-14 (compagnon visuel,
 * spec docs/superpowers/specs/2026-06-14-hero-da-design.md). Objectif unique :
 * pousser au diagnostic. Compteur géant (choc) à gauche + quittance-preuve à droite.
 * Copy deck §1 verbatim. Compteur social = nb RÉEL de locataires aidés (source unique
 * `resultats-publics`, partagée avec la section Résultats → s'incrémentent ensemble).
 */

/** Style du compteur géant : ombre dure nb crisp (sans text-stroke = plus net). */
const METER_STYLE = {
  textShadow: "4px 4px 0 rgb(var(--color-nb-ink))",
} as const;

/** Quittance spécimen nettoyée — chiffres témoin P0 (fictifs), aria-hidden. */
function VerdictCardNb() {
  const rows: ReadonlyArray<{ label: string; cents: number; accent?: boolean }> = [
    { label: "Loyer hors charges appelé", cents: 102_185 },
    { label: "Plafond légal (gel DPE F/G)", cents: 95_000 },
    { label: "Hausse illégale / mois", cents: 7_185, accent: true },
  ];
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-lg px-2 pb-8 lg:mx-0 lg:h-full">
      <span className="nb-sticker -left-2 -top-4 z-20 text-sm">0 € d&apos;avance</span>
      <span className="nb-sticker nb-sticker--right -right-2 -top-3 z-20 bg-pink text-nb-ink text-sm">
        25 % au succès
      </span>
      <div className="nb-tilt nb-card flex h-full flex-col p-8 sm:p-10">
        <div className="flex items-center justify-between nb-mono text-xs uppercase tracking-widest text-nb-ink/55">
          <span>Réf. TP-2026-0117</span>
          <span>Quittance de loyer</span>
        </div>
        <p className="mt-3 nb-mono text-base text-nb-ink/70">12 rue des Lilas, 75011 Paris</p>
        <dl className="mt-8 flex-1 space-y-5">
          {rows.map(({ label, cents, accent }) => (
            <div
              key={label}
              className={
                accent
                  ? "-mx-4 flex items-baseline justify-between gap-4 border-3 border-nb-ink bg-acid px-4 py-3 shadow-nb-sm"
                  : "flex items-baseline justify-between gap-4 border-b border-nb-ink/15 pb-3.5"
              }
            >
              <dt className="font-nb-body text-base text-nb-ink/80">{label}</dt>
              <dd className="tabular nb-mono text-lg font-medium text-nb-ink">
                {accent ? "+" : ""}
                {formatEUR(cents, { decimals: true })}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-7 flex items-end justify-between border-t-3 border-nb-ink pt-6">
          <span className="font-nb-display text-base uppercase leading-none">
            Trop-perçu
            <br />
            récupéré
          </span>
          <span className="tabular nb-mono text-4xl font-semibold text-refund sm:text-5xl">
            {formatEUR(143_700, { decimals: true })}
          </span>
        </div>
      </div>
      {/* Logo tampon « stampé » sur la quittance (remplace l'ancien tampon texte). */}
      <LogoNb size={110} className="absolute -bottom-[14px] right-4 z-20" />
    </aside>
  );
}

/**
 * Strip — faits chocs sur le marché locatif (réveil « ça peut être moi »). Les
 * points conversion (0 €, 2 min, −194 €) sont déjà dits ailleurs (hero, barème).
 * ⚠️ TODO_VERIFIER : sourcer/figer « 1 sur 3 » (encadrement Paris) et « ~5 M »
 * (passoires F/G) avant prod. « 1 sur 6 » = SDES ; prescription = constante.
 */
const STRIP: ReadonlyArray<{ value: string; label: string }> = [
  { value: "1 sur 6", label: "logement loué à un loyer illégal (source : SDES)" },
  { value: "1 sur 3", label: "annonce au-dessus du loyer encadré à Paris" },
  { value: "~5 M", label: "de passoires thermiques F/G, où le loyer est gelé" },
  { value: `${PRESCRIPTION_YEARS} ans`, label: "de trop-perçu récupérable (prescription)" },
];

/** Strip de chiffres — pleine largeur de page (bord à bord). */
function StripNb() {
  return (
    <div className="border-t-3 border-nb-ink bg-nb-ink">
      <dl className="grid w-full grid-cols-2 gap-px bg-nb-ink sm:grid-cols-4">
        {STRIP.map(({ value, label }) => (
          <div key={value} className="bg-cream px-6 py-6 text-center">
            <dd className="tabular font-nb-display text-2xl sm:text-3xl">{value}</dd>
            <dt className="mx-auto mt-2 max-w-[28ch] nb-mono text-[11px] uppercase leading-relaxed tracking-wider text-nb-ink/60">
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
    <section className="relative flex min-h-[calc(100svh_-_var(--chrome-h))] flex-col overflow-hidden border-b-3 border-nb-ink bg-cream">
      <div className="relative mx-auto flex w-full max-w-container flex-1 items-center px-6 py-8 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch lg:gap-12">
          <div>
            <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/65">
              Loyer encadré · gel F/G · bouclier 3,5 %
            </p>
            {/* Compteur géant : −194 €/mois, count-up en vue (reduced-motion = valeur finale). */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <span
                style={METER_STYLE}
                className="shrink-0 tabular nb-mono text-[clamp(56px,8vw,104px)] font-semibold leading-[0.8] text-refund"
              >
                −<CountUp cents={BAISSE_MOY_CENTS} durationMs={1400} />
              </span>
              <span className="max-w-[26ch] border-l-3 border-nb-ink pl-4 nb-mono text-[12px] uppercase leading-snug tracking-wide text-nb-ink/80">
                <span className="block font-nb-display text-sm normal-case tracking-normal">
                  par mois en moyenne
                </span>
                de loyer économisé une fois la hausse illégale supprimée
              </span>
            </div>
            {/* brand.hero.title verbatim (composition 2 lignes). */}
            <h1 className="mt-5 text-[clamp(34px,4.6vw,58px)]">
              Marre de <span className="nb-mark">trop payer</span>&nbsp;?
            </h1>
            <p className="mt-4 max-w-xl font-nb-body text-base leading-relaxed text-nb-ink/80">
              {brand.hero.subtitle}
            </p>
            <div className="mt-5">
              <HeroAddress />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2.5 border-2 border-nb-ink bg-cream px-3.5 py-2 nb-mono text-[12px] font-medium text-nb-ink shadow-nb-sm">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-refund" />
                Déjà {DOSSIERS_AIDES} locataires aidés
              </span>
              <span className="nb-mono text-xs uppercase tracking-wider text-nb-ink/60">
                {brand.hero.reassurance.join(" · ")}
              </span>
            </div>
          </div>
          <div className="relative lg:flex">
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
      data-chrome-ticker
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
