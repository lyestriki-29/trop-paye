import { brand, formatEUR } from "@troppaye/shared";
import { LogoA } from "@/app/design-lab/directions/d1/identite/logos";

/** Lignes de la quittance spécimen — fiction cohérente avec le verdict témoin. */
const SPECIMEN_ROWS = [
  // TODO_COPY — libellé « Loyer hors charges » (hors copy deck ; les deux lignes
  // suivantes sont dictées par le plan P0 écran 2)
  { label: "Loyer hors charges", cents: 102_185, refund: false },
  { label: "Plafond légal (gel DPE F/G)", cents: 95_000, refund: false },
  { label: "Différence mensuelle", cents: 7_185, refund: true },
] as const;

export function D1Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-container items-center justify-between gap-6 px-6 py-5">
        <div className="flex items-center gap-4">
          <a href="#" aria-label={`${brand.name} — accueil`} className="text-ink">
            <LogoA className="h-7 w-auto" />
          </a>
          <span className="hidden border-l border-line pl-4 text-sm text-ink/60 lg:inline">
            {brand.baseline}
          </span>
        </div>
        {/* Lien factice — écran témoin. */}
        <a
          href="#"
          className="rounded-field border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Se connecter
        </a>
      </div>
    </header>
  );
}

/** Champ adresse VISUEL (non câblé) — placeholder mot pour mot du copy deck. */
export function AddressField({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <label htmlFor={id} className="sr-only">
          Où habitez-vous ?
        </label>
        <input
          id={id}
          type="text"
          placeholder="12 rue de la République, Lyon"
          className="w-full rounded-field border border-line bg-paper px-4 py-3.5 font-mono text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </div>
      <button
        type="button"
        className="rounded-field bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
      >
        {brand.hero.cta}
      </button>
    </div>
  );
}

/** Carte-quittance spécimen annotée (colonne droite du hero). */
function SpecimenCard() {
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Feuille du dessous : pile de documents — profondeur sans ombre (charte §2). */}
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-card border border-line bg-paper-2" />
      <div className="relative rotate-1 overflow-hidden rounded-card border border-line bg-paper">
        <p className="pointer-events-none absolute inset-0 flex -rotate-12 select-none items-center justify-center font-display text-[56px] font-extrabold uppercase tracking-display text-ink/5">
          Spécimen
        </p>
        <div className="flex items-center justify-between gap-4 border-b border-line bg-paper-2 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-ink/55">
          {/* TODO_COPY — libellés spécimen (vocabulaire document, hors copy deck) */}
          <span>Réf. dossier TP-2026-0117</span>
          <span>Quittance de loyer</span>
        </div>
        <div className="px-5 py-5">
          <p className="font-mono text-xs text-ink/55">12 rue des Lilas, 75011 Paris</p>
          <dl className="mt-4">
            {SPECIMEN_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-6 border-b border-dashed border-line py-2.5"
              >
                <dt className="text-sm text-ink/70">{row.label}</dt>
                <dd
                  className={`tabular whitespace-nowrap font-mono text-sm ${
                    row.refund ? "font-medium text-refund-text" : "text-ink"
                  }`}
                >
                  {row.refund ? "+ " : ""}
                  {formatEUR(row.cents, { decimals: true })}
                </dd>
              </div>
            ))}
          </dl>
          {/* TODO_COPY — annotation spécimen */}
          <p className="mt-3 inline-flex -rotate-2 rounded-field border border-stamp/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-stamp">
            Trop-perçu détecté
          </p>
          <div className="mt-4 flex items-end justify-between gap-6 border-t-2 border-ink pt-4">
            {/* TODO_COPY — libellé du total spécimen (hors copy deck) */}
            <p className="text-sm font-medium text-ink/80">Trop-perçu sur la période</p>
            <p className="tabular font-mono text-xl font-medium text-refund-text">
              {formatEUR(143_700, { decimals: true })}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function D1Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-container gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-display sm:text-[52px] sm:leading-[1.05] xl:text-hero">
            {brand.hero.title}
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg text-ink/70">{brand.hero.subtitle}</p>
          <div className="mt-8 max-w-xl">
            <AddressField id="hero-adresse" />
          </div>
          <p className="mt-4 font-mono text-xs text-ink/55">
            {brand.hero.reassurance.join(" · ")}
          </p>
          <p className="mt-10 max-w-[52ch] border-l-2 border-stamp pl-4 text-sm leading-relaxed text-ink/80">
            1 logement loué sur 6 en France a un loyer illégal. Le vôtre ?{" "}
            <a href="#" className="text-ink/50 underline underline-offset-2 transition-colors hover:text-ink">
              (lien source)
            </a>
          </p>
        </div>
        <SpecimenCard />
      </div>
    </section>
  );
}
