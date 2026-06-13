import { PRESCRIPTION_YEARS, brand, formatEUR } from "@troppaye/shared";
import { HeroAddress } from "@/components/home/HeroAddress";

/**
 * Hero néubrutaliste (réf. LP3) — variante DA du site public, scopée `.nb`.
 * Copy deck §1 mot pour mot (titre, sous-titre, réassurance) ; vocabulaire
 * « dossier » et chiffres témoin (fictifs, déjà en prod) en TODO_COPY.
 */

/** Chiffres d'appui (factuels) — repris du hero v3 pour cohérence. */
const STRIP: ReadonlyArray<{ value: string; label: string }> = [
  { value: "1 sur 6", label: "logement loué a un loyer illégal (source : SDES)" },
  { value: "24/08/2022", label: "loyers des passoires F/G gelés depuis cette date" },
  { value: `${PRESCRIPTION_YEARS} ans`, label: "de trop-perçu récupérable (prescription)" },
  { value: "25 %", label: "de commission, au succès. Rien récupéré ? Rien payé." },
];

/** Carte verdict spécimen — agrandie ; chiffres témoin P0 (fictifs), aria-hidden. */
function VerdictCardNb() {
  const rows: ReadonlyArray<{ label: string; cents: number; accent?: boolean }> = [
    { label: "Loyer hors charges appelé", cents: 102_185 },
    { label: "Plafond légal (gel DPE F/G)", cents: 95_000 },
    { label: "Hausse illégale / mois", cents: 7_185, accent: true },
  ];
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-xl lg:mx-0">
      <span className="nb-sticker -left-4 -top-6 z-10 text-sm">0 € d&apos;avance</span>
      <span className="nb-sticker nb-sticker--right -right-4 top-12 z-10 bg-pink text-nb-ink text-sm">
        25 % au succès
      </span>
      <div className="nb-tilt nb-card p-7 sm:p-9">
        <div className="flex items-center justify-between nb-mono text-xs uppercase tracking-widest text-nb-ink/55">
          <span>Réf. TP-2026-0117</span>
          <span>Quittance de loyer</span>
        </div>
        <p className="mt-3 nb-mono text-base text-nb-ink/70">12 rue des Lilas, 75011 Paris</p>
        <dl className="mt-7 space-y-4">
          {rows.map(({ label, cents, accent }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b border-nb-ink/15 pb-3"
            >
              <dt className="font-nb-body text-base text-nb-ink/75">{label}</dt>
              <dd
                className={`tabular nb-mono text-lg font-medium ${
                  accent ? "text-refund" : "text-nb-ink"
                }`}
              >
                {formatEUR(cents, { decimals: true })}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex items-end justify-between border-t-3 border-nb-ink pt-5">
          <span className="font-nb-display text-base uppercase leading-none">
            Trop-perçu
            <br />
            récupéré
          </span>
          <span className="tabular nb-mono text-4xl font-semibold text-refund">
            {formatEUR(143_700, { decimals: true })}
          </span>
        </div>
      </div>
      {/* Tampon imprimé — visible seulement en variante Maximal. */}
      <span
        aria-hidden="true"
        className="nb-stamp absolute right-6 top-1/2 z-20 -translate-y-1/2 text-xl"
      >
        Trop payé
      </span>
      <p className="mt-4 text-center nb-mono text-xs text-nb-ink/45">
        Exemple de dossier — données d&apos;illustration
      </p>
    </aside>
  );
}

/** Strip de chiffres — pleine largeur de page (bord à bord), demande Lyes. */
function StripNb() {
  return (
    <div className="border-t-3 border-nb-ink bg-nb-ink">
      <dl className="grid w-full grid-cols-2 gap-px bg-nb-ink sm:grid-cols-4">
        {STRIP.map(({ value, label }) => (
          <div key={value} className="bg-cream px-6 py-6">
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
    <section className="relative overflow-hidden border-b-3 border-nb-ink">
      <div className="relative mx-auto max-w-container px-6 py-14 sm:py-20">
        <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/65">
          Dossier TP-2026 · instruction en cours
        </p>
        <div className="mt-7 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            {/* brand.hero.title mot pour mot (composition 2 lignes). */}
            <h1 className="text-[clamp(44px,8vw,96px)]">
              Marre de <span className="nb-mark">trop payer</span>&nbsp;?
            </h1>
            <p className="mt-6 max-w-xl font-nb-body text-lg leading-relaxed text-nb-ink/80">
              {brand.hero.subtitle}
            </p>
            {/* Double bénéfice (demande Lyes) — TODO_COPY, ton sans promesse. */}
            <p className="mt-3 max-w-xl font-nb-body text-base leading-relaxed text-nb-ink/80">
              Et souvent, votre loyer{" "}
              <span className="nb-mark nb-mark--refund">baisse pour de bon</span> : hausse
              illégale supprimée, complément de loyer contesté.
            </p>
            {/* Métrique phare (réel, Lyes 2026-06-13) : baisse de loyer moyenne. */}
            <div className="mt-7 inline-flex items-center gap-4 border-3 border-nb-ink bg-paper px-5 py-3 shadow-nb-sm">
              <span className="tabular font-nb-display text-3xl leading-none text-refund">
                −194 €
              </span>
              <span className="nb-mono text-[11px] uppercase leading-snug tracking-wider text-nb-ink/65">
                de loyer / mois
                <br />
                en moyenne
              </span>
            </div>
            <div className="mt-8">
              <HeroAddress />
            </div>
            <p className="mt-4 nb-mono text-xs uppercase tracking-wider text-nb-ink/60">
              {brand.hero.reassurance.join(" · ")}
            </p>
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
