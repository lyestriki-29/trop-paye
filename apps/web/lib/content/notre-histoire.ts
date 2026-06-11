/**
 * Copy de la page /notre-histoire + injections du récit fondateur.
 * Source de vérité : docs/copy-deck-troppaye.md §7 — Lyes édite LE DECK, puis ce
 * module est aligné mot pour mot. AUCUN texte ne doit être improvisé ici.
 *
 * Toute valeur `TODO_COPY — …` est un placeholder visible en dev ;
 * `scripts/check-copy.mjs` fait ÉCHOUER le build de prod tant qu'il en reste.
 *
 * Chiffres du « cas zéro » : le cas réel (arbitrage Lyes 2026-06-11, « chiffres
 * réels + récit TODO_COPY ») — complément de loyer 120,00 €/mois sur un logement
 * classé F, loyer 900,00 € HC (mêmes valeurs que les tests du moteur).
 */

export const TODO_COPY_MARKER = "TODO_COPY";
const todo = (key: string): string => `${TODO_COPY_MARKER} — notre-histoire.${key}`;

/** GARDE-FOU : seul qualificatif autorisé pour Nicolas (cf. spec, rien d'autre). */
export const NICOLAS_ROLE = "Expert de la location";

export const casZero = {
  /** Référence stylisée de la quittance du cas zéro (non-PII). */
  reference: "Cas n° 0",
  kind: "Quittance de loyer",
  meta: todo("casZero.meta"),
  rentHcCents: 90000,
  supplementCents: 12000,
  totalCents: 102000,
  rentLabel: "Loyer hors charges",
  supplementLabel: "Complément de loyer",
  totalLabel: "Total appelé",
  stamp: "TROP PAYÉ",
  dpeClass: "F" as const,
} as const;

export const notreHistoireCopy = {
  seo: {
    title: todo("seo.title"),
    description: todo("seo.description"),
  },
  hero: {
    kicker: todo("hero.kicker"),
    title: todo("hero.title"),
    intro: todo("hero.intro"),
  },
  duo: {
    title: todo("duo.title"),
    founder: {
      name: "Lyes",
      role: todo("duo.founder.role"),
      photoAlt: todo("duo.founder.photoAlt"),
      paragraphs: [todo("duo.founder.p1"), todo("duo.founder.p2")],
    },
    nicolas: {
      name: "Nicolas",
      role: NICOLAS_ROLE,
      photoAlt: todo("duo.nicolas.photoAlt"),
      paragraphs: [todo("duo.nicolas.p1"), todo("duo.nicolas.p2")],
    },
  },
  bascule: {
    title: todo("bascule.title"),
    paragraphs: [todo("bascule.p1"), todo("bascule.p2")],
  },
  methode: {
    title: todo("methode.title"),
    intro: todo("methode.intro"),
    /** Présentation « mentions de document officiel » : libellé → valeur. */
    mentions: [
      { label: todo("methode.m1.label"), value: todo("methode.m1.value") },
      { label: todo("methode.m2.label"), value: todo("methode.m2.value") },
      { label: todo("methode.m3.label"), value: todo("methode.m3.value") },
      { label: todo("methode.m4.label"), value: todo("methode.m4.value") },
    ],
  },
  preuve: {
    title: todo("preuve.title"),
    /** État vide : phrase imposée par la spec (mot pour mot). */
    emptyState: "Premier dossier en cours : le nôtre.",
  },
  cta: {
    title: todo("cta.title"),
  },
  /** Phrase « validé par avocat » — rendue UNIQUEMENT si siteFlags.legalReviewDone. */
  legalReviewLine: todo("legalReviewLine"),
  jsonLd: {
    founderName: "Lyes Triki",
    founderJobTitle: todo("jsonLd.founderJobTitle"),
    nicolasName: todo("jsonLd.nicolasName"),
    nicolasJobTitle: todo("jsonLd.nicolasJobTitle"),
  },
  injections: {
    storyTeaser: {
      lines: [todo("storyTeaser.l1"), todo("storyTeaser.l2"), todo("storyTeaser.l3")],
      linkLabel: todo("storyTeaser.linkLabel"),
    },
    reviewer: {
      phrase: todo("reviewer.phrase"),
      photoAlt: todo("reviewer.photoAlt"),
    },
    verdictStoryLine: todo("verdictStoryLine"),
    footerSignature: todo("footerSignature"),
  },
} as const;
