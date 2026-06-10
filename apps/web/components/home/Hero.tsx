import { brand } from "@troppaye/shared";
import { Marker } from "@/components/ui/Marker";
import { QuittanceCard } from "@/components/ui/QuittanceCard";
import { HeroAddress } from "./HeroAddress";

/**
 * Carte-quittance spécimen (charte §5 : la preuve est la décoration) :
 * pile de feuilles + rotation + tampon filigrane « Spécimen ».
 * Données fictives — libellés hérités du témoin v2 (TODO_COPY, hors copy deck).
 */
function SpecimenQuittance() {
  return (
    <aside aria-hidden="true" className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Feuille du dessous : la pile de documents du dossier. */}
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-card border border-line bg-paper-2" />
      <div className="relative rotate-1 transition duration-300 hover:rotate-0">
        <QuittanceCard
          className="shadow-xl"
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
          {/* TODO_COPY — annotation spécimen (vocabulaire document, hors copy deck). */}
          <p className="mt-3 inline-flex -rotate-2 rounded-field border border-stamp/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-stamp">
            Trop-perçu détecté
          </p>
        </QuittanceCard>
        {/* Tampon filigrane « Spécimen » — par-dessus toute la carte, non interactif. */}
        <p className="pointer-events-none absolute inset-0 flex -rotate-12 select-none items-center justify-center font-display text-[56px] font-extrabold uppercase tracking-display text-ink/5">
          Spécimen
        </p>
      </div>
    </aside>
  );
}

/** Hero v2 promu : surligneur, pilule XL câblée, réassurance, stat d'appui sourcée. */
export function Hero() {
  return (
    <section className="mx-auto grid max-w-container items-center gap-14 px-6 pb-24 pt-14 sm:pt-20 lg:grid-cols-[7fr_5fr]">
      <div>
        <h1 className="reveal-1 font-display text-2xl font-extrabold leading-[1.05] tracking-display sm:text-hero">
          {/* brand.hero.title, mot pour mot — surligneur sur « trop payer ». */}
          Marre de{" "}
          <span className="whitespace-nowrap">
            <Marker>trop payer</Marker> ?
          </span>
        </h1>
        <div className="reveal-2">
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
            {brand.hero.subtitle}
          </p>
          <div className="mt-9">
            <HeroAddress />
          </div>
          <p className="mt-4 text-sm font-medium text-ink/55">
            {brand.hero.reassurance.join(" · ")}
          </p>
          {/* Copy deck §1 — stat d'appui ; TODO_COPY : URL de la source à fournir (deck : « (lien source) »). */}
          <p className="mt-10 max-w-xl border-l-4 border-accent pl-4 text-sm font-medium leading-relaxed text-ink/80">
            1 logement loué sur 6 en France a un loyer illégal. Le vôtre ?{" "}
            <span className="text-ink/45 underline underline-offset-2">(lien source)</span>
          </p>
        </div>
      </div>

      <div className="reveal-3 mx-auto w-full max-w-md lg:mx-0">
        <SpecimenQuittance />
        {/* TODO_COPY : légende du spécimen, hors copy deck. */}
        <p className="mt-4 text-center text-xs text-ink/45">
          Quittance spécimen — données fictives
        </p>
      </div>
    </section>
  );
}
