import { PRESCRIPTION_YEARS, brand } from "@troppaye/shared";
import { HeroAddress } from "@/components/home/HeroAddress";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { Stamp } from "@/components/ui/Stamp";

/**
 * Hero v3 « dossier d'instruction » — densité éditoriale : papier ligné,
 * cartouche de dossier, typo giga, collage de pièces, strip de chiffres
 * d'appui sourcés. Copy deck §1 mot pour mot (titre, sous-titre, réassurance) ;
 * le reste = TODO_COPY (vocabulaire document, hors copy deck).
 */

/** Collage de pièces : pile + quittance spécimen (chiffres témoin P0, fictifs). */
function CollagePieces() {
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Feuilles du dessous : l'épaisseur du dossier. */}
      <div className="absolute inset-0 -rotate-2 rounded-card border border-line bg-paper-2" />
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-card border border-line bg-paper-2" />
      <div className="relative rotate-1 transition duration-300 hover:rotate-0">
        {/* Onglet de classeur — TODO_COPY (vocabulaire document). */}
        <span className="v3-tab absolute -top-6 left-6 bg-ink px-5 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-widest text-paper">
          Pièce n°01
        </span>
        <QuittanceCard
          className="shadow-deep"
          reference="Réf. dossier TP-2026-0117"
          kind="Quittance de loyer"
          meta="12 rue des Lilas, 75011 Paris"
          rows={[
            { label: "Loyer hors charges", cents: 102_185 },
            { label: "Plafond légal (gel DPE F/G)", cents: 95_000 },
            { label: "Différence mensuelle", cents: 7_185, highlight: true },
          ]}
          total={{ label: "Trop-perçu sur la période", cents: 143_700 }}
        >
          <div className="mt-4 flex items-center justify-between gap-4">
            <Stamp rotate={-6}>Trop-perçu détecté</Stamp>
            <span className="v3-barcode h-5 w-20" />
          </div>
        </QuittanceCard>
        {/* Filigrane « Spécimen » par-dessus la carte, non interactif. */}
        <p className="pointer-events-none absolute inset-0 flex -rotate-12 select-none items-center justify-center font-display text-[56px] font-extrabold uppercase tracking-display text-ink/5">
          Spécimen
        </p>
      </div>
      <p className="mt-5 text-center font-mono text-xs text-ink/45">
        Quittance spécimen — données fictives
      </p>
    </aside>
  );
}

/** Chiffres d'appui (factuels : SDES, loi Climat, prescription, barème). */
const STRIP: ReadonlyArray<{ value: string; label: string }> = [
  // TODO_VERIFIER (comme la prod) : stat SDES parc locatif privé F/G ≈ 18,5 % au 01/01/2023.
  { value: "1 sur 6", label: "logement loué en France a un loyer illégal (source : SDES)" },
  { value: "24/08/2022", label: "loyers des passoires F/G gelés depuis cette date" },
  { value: `${PRESCRIPTION_YEARS} ans`, label: "de trop-perçu récupérable, plafond de la prescription" },
  // brand.commissionRateBps = 2500 — copy « Rien récupéré ? Rien payé. » : deck §1.
  { value: "25 %", label: "de commission, au succès. Rien récupéré ? Rien payé." },
];

export function HeroV3() {
  return (
    <section className="v3-ruled relative border-b border-line">
      <div className="mx-auto max-w-container px-6 pb-16 pt-10 sm:pt-14">
        {/* Cartouche dossier — TODO_COPY (vocabulaire document, hors copy deck). */}
        <div className="reveal-1 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-ink/55">
          <span>Dossier TP-2026 · instruction en cours</span>
          <span aria-hidden className="v3-barcode h-4 w-24" />
          <span aria-hidden className="hidden sm:inline">Europe/Paris</span>
        </div>

        <div className="mt-10 grid items-end gap-14 lg:grid-cols-[7fr_5fr]">
          <div>
            {/* brand.hero.title mot pour mot — composition éditoriale 2 lignes. */}
            <h1 className="reveal-1 font-display font-extrabold tracking-display">
              <span className="block text-xl text-ink/85 sm:text-2xl">Marre de</span>
              <span className="mt-1 block text-giga leading-[0.95]">
                <Marker>trop payer</Marker>&nbsp;?
              </span>
            </h1>
            <div className="reveal-2">
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/70">
                {brand.hero.subtitle}
              </p>
              {/* Double bénéfice (demande Lyes 2026-06-12) : récupérer le passé
                  ET faire baisser le loyer pour la suite. TODO_COPY — brouillon
                  hors deck, ton sans promesse de résultat (règles §6 du deck). */}
              <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/70">
                Et souvent, votre loyer <Marker>baisse pour de bon</Marker> :
                hausse illégale supprimée, complément de loyer contesté.
              </p>
              <div className="mt-9">
                <HeroAddress />
              </div>
              <p className="mt-4 text-sm font-medium text-ink/55">
                {brand.hero.reassurance.join(" · ")}
              </p>
            </div>
          </div>
          <div className="reveal-3">
            <CollagePieces />
          </div>
        </div>
      </div>

      {/* Strip de chiffres — la densité remplace le blanc sous le hero. */}
      <div className="border-t border-line bg-paper">
        <dl className="mx-auto grid max-w-container grid-cols-2 gap-px bg-line px-0 lg:grid-cols-4">
          {STRIP.map(({ value, label }) => (
            <div key={value} className="bg-paper px-6 py-6">
              <dd className="tabular font-display text-2xl font-extrabold tracking-display">
                {value}
              </dd>
              <dt className="mt-2 max-w-[26ch] font-mono text-[11px] uppercase leading-relaxed tracking-wider text-ink/55">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Items factuels (moteur + CLAUDE.md) — répétés ×2 pour la boucle sans couture. */
const TICKER: ReadonlyArray<string> = [
  "Gel des loyers F/G — loi Climat, art. 159",
  "Bouclier d'indexation +3,5 % max — T3 2022 → T1 2024",
  "IRL — série INSEE 001515333",
  `Jusqu'à ${PRESCRIPTION_YEARS} ans de trop-perçu récupérable`,
  "0 € d'avance — 25 % au succès",
  "Données hébergées en France",
];

/** Bandeau défilant des bases légales — décoratif (le contenu vit en §03). */
export function TickerLegal() {
  return (
    <div aria-hidden="true" className="v3-marquee border-b border-line bg-ink py-2.5 text-paper">
      <div className="v3-marquee-track">
        {[...TICKER, ...TICKER].map((item, i) => (
          <span
            // Liste statique dupliquée ×2 : l'index distingue les deux copies.
            key={`${item}-${i}`}
            className="inline-flex items-center gap-3 pr-8 font-mono text-[11px] uppercase tracking-widest text-paper/80"
          >
            <span className="text-accent">●</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
