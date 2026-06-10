/** Étapes — copy deck §1 « Comment ça marche », mot pour mot. */
const STEPS = [
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
] as const;

/** En-tête de section façon document : repère « § n » mono + filet (décoratif). */
export function SectionKicker({ index, tone = "paper" }: { index: string; tone?: "paper" | "ink" }) {
  const text = tone === "paper" ? "text-ink/50" : "text-paper/50";
  const rule = tone === "paper" ? "bg-line" : "bg-paper/20";
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className={`font-mono text-xs uppercase tracking-widest ${text}`}>§ {index}</span>
      <span className={`h-px flex-1 ${rule}`} />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <SectionKicker index="01" />
        <h2 className="mt-4 font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Comment ça marche
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.num}
              className="flex flex-col rounded-card border border-line bg-paper transition-colors hover:border-ink"
            >
              <div className="flex items-center justify-between border-b border-line bg-paper-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink/55">
                {/* TODO_COPY — libellé d'en-tête de carte (vocabulaire document) */}
                <span>Étape {step.num}</span>
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-1 w-1 rounded-badge bg-line" />
                  <span className="h-1 w-1 rounded-badge bg-line" />
                  <span className="h-1 w-1 rounded-badge bg-line" />
                </span>
              </div>
              <div className="px-5 py-5">
                <h3 className="font-display text-lg font-bold tracking-display">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Confiance() {
  return (
    <section className="border-b border-line bg-ink text-paper">
      <div className="mx-auto max-w-container px-6 py-16 md:py-20">
        <SectionKicker index="02" tone="ink" />
        <h2 className="mt-4 max-w-[24ch] font-display text-xl font-extrabold tracking-display sm:text-2xl">
          Nous faisons appliquer la loi. Rien de plus.
        </h2>
        <p className="mt-5 max-w-[64ch] leading-relaxed text-paper/70">
          Le gel des loyers des passoires thermiques, l'indice de référence des loyers, les
          délais de restitution du dépôt de garantie : ce sont vos droits, écrits dans la loi.
          TropPayé les fait simplement respecter. Chaque calcul cite sa source. Chaque euro est
          tracé sur un compte dédié. Vos données restent en France.
        </p>
        {/* Compteur en placeholder — le compteur réel sera branché en P2. */}
        <div className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-paper/15 pt-6">
          <span className="tabular font-mono text-2xl font-medium text-refund">— €</span>
          <span className="text-sm text-paper/70">récupérés pour les locataires</span>
          <span className="text-paper/30" aria-hidden="true">
            ·
          </span>
          <span className="tabular font-mono text-2xl font-medium text-refund">—</span>
          <span className="text-sm text-paper/70">dossiers en cours</span>
        </div>
        <p className="mt-3 font-mono text-xs text-paper/40">(compteur réel branché en P2)</p>
      </div>
    </section>
  );
}
