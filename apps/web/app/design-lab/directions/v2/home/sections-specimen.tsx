import { formatEUR } from "@troppaye/shared";

/** Lignes de la quittance spécimen — fiction cohérente avec le verdict témoin. */
const SPECIMEN_ROWS = [
  // TODO_COPY — libellé « Loyer hors charges » (hors copy deck ; les deux lignes
  // suivantes sont dictées par le plan P0 écran 2)
  { label: "Loyer hors charges", cents: 102_185, refund: false },
  { label: "Plafond légal (gel DPE F/G)", cents: 95_000, refund: false },
  { label: "Différence mensuelle", cents: 7_185, refund: true },
] as const;

const SPECIMEN_TOTAL_CENTS = 143_700;

/**
 * Carte-quittance spécimen (langage documentaire D1) rethémée D3 :
 * fond `paper`, filets `line`, références mono petites capitales — et la
 * ligne « Différence mensuelle » surlignée `accent`, signature de la maison.
 * La pile de feuilles + l'ombre D3 : un dossier posé sur la table.
 */
export function SpecimenCard() {
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Feuille du dessous : la pile de documents du dossier. */}
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-card border border-line bg-paper-2" />
      <div className="relative rotate-1 overflow-hidden rounded-card border border-line bg-paper shadow-xl transition duration-300 hover:rotate-0">
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
                className={
                  row.refund
                    ? "-mx-2 flex items-baseline justify-between gap-6 rounded-field bg-accent px-2 py-2.5"
                    : "flex items-baseline justify-between gap-6 border-b border-dashed border-line py-2.5"
                }
              >
                <dt className={`text-sm ${row.refund ? "font-medium text-ink" : "text-ink/70"}`}>
                  {row.label}
                </dt>
                <dd
                  className={`tabular whitespace-nowrap font-mono text-sm ${
                    row.refund ? "font-medium text-ink" : "text-ink"
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
            <p className="tabular whitespace-nowrap font-mono text-xl font-medium text-refund-text">
              {formatEUR(SPECIMEN_TOTAL_CENTS, { decimals: true })}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
