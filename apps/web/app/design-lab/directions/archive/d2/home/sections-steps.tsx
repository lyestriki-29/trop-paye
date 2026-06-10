/**
 * D2 home — « Comment ça marche » en 3 lignes de relevé numérotées (01/02/03)
 * + section confiance avec compteur stylé ticker (placeholder, branché en P2).
 * Copy mot pour mot depuis docs/copy-deck-troppaye.md §1.
 */

interface Step {
  num: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Vérifiez",
    body: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
  },
  {
    num: "02",
    title: "Mandatez-nous",
    body: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
  },
  {
    num: "03",
    title: "Récupérez",
    body: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
  },
];

export function SectionSteps() {
  return (
    <section className="bg-paper-2 py-20">
      <div className="mx-auto max-w-container px-6">
        <h2 className="font-display text-xl font-extrabold tracking-display md:text-2xl">
          Comment ça marche
        </h2>
        <div className="mt-10 overflow-hidden rounded-card border border-line bg-paper shadow-sm">
          {STEPS.map((step, i) => (
            <article
              key={step.num}
              className={`grid items-baseline gap-x-10 gap-y-2 px-6 py-8 transition-colors hover:bg-paper-2/60 md:grid-cols-[3rem_14rem_1fr] md:px-10 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className="font-mono text-sm font-medium text-refund-text tabular">
                {step.num}
              </span>
              <h3 className="font-display text-lg font-bold tracking-display">
                {step.title}
              </h3>
              <p className="leading-relaxed text-ink/70">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionTrust() {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-container px-6">
        <h2 className="max-w-2xl font-display text-xl font-extrabold tracking-display md:text-2xl">
          Nous faisons appliquer la loi. Rien de plus.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/70">
          Le gel des loyers des passoires thermiques, l'indice de référence des
          loyers, les délais de restitution du dépôt de garantie : ce sont vos
          droits, écrits dans la loi. TropPayé les fait simplement respecter.
          Chaque calcul cite sa source. Chaque euro est tracé sur un compte
          dédié. Vos données restent en France.
        </p>

        {/* Compteur public — placeholder stylé ticker (compteur réel branché en P2). */}
        <div className="mt-12 flex flex-wrap items-baseline gap-x-3 gap-y-2 rounded-card bg-ink px-6 py-5 font-mono md:px-8">
          <span
            className="h-2 w-2 shrink-0 self-center rounded-badge bg-refund motion-safe:animate-pulse"
            aria-hidden
          />
          <span className="text-lg font-medium text-refund tabular">— €</span>
          <span className="text-sm text-paper/80">récupérés pour les locataires</span>
          <span className="text-paper/40">·</span>
          <span className="text-lg font-medium text-refund tabular">—</span>
          <span className="text-sm text-paper/80">dossiers en cours</span>
          <span className="ml-auto text-xs text-paper/40">
            (compteur réel branché en P2)
          </span>
        </div>
      </div>
    </section>
  );
}
