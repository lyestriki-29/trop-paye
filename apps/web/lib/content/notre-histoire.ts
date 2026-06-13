/**
 * Copy de la page /notre-histoire + injections du récit fondateur.
 * Source de vérité : docs/copy-deck-troppaye.md §7. Textes validés par Lyes
 * (2026-06-13). AUCUN texte ne doit être improvisé ici : éditer LE DECK puis aligner.
 *
 * `scripts/check-copy.mjs` fait ÉCHOUER le build de prod si une valeur contient encore
 * le marqueur `TODO_COPY` (placeholder). Tout est désormais rempli.
 *
 * Garde-fous : Nicolas = « Expert de la location » UNIQUEMENT (rôle figé, cf. spec) ;
 * `legalReviewLine` n'est rendue que si `siteFlags.legalReviewDone` est levé : la
 * formulation reste un brouillon tant qu'un avocat n'a pas réellement validé.
 *
 * Chiffres du « cas zéro » : cas réel (complément de loyer 120,00 €/mois, logement
 * classé F, loyer 900,00 € HC — mêmes valeurs que les tests du moteur).
 */

/** Conservé pour les garde-fous (check-copy / tests) qui référencent le marqueur. */
export const TODO_COPY_MARKER = "TODO_COPY";

/** GARDE-FOU : seul qualificatif autorisé pour Nicolas (cf. spec, rien d'autre). */
export const NICOLAS_ROLE = "Expert de la location";

export const casZero = {
  /** Référence stylisée de la quittance du cas zéro (non-PII). */
  reference: "Cas n° 0",
  kind: "Quittance de loyer",
  meta: "Quittance reconstituée : logement classé F, complément de loyer contesté.",
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
    title: "TropPayé : votre loyer est peut-être trop élevé",
    description:
      "Découvrez si votre loyer dépasse ce que la loi autorise. Diagnostic gratuit, trop-perçu récupérable à l'amiable. Rémunération au succès uniquement.",
  },
  hero: {
    kicker: "Notre histoire",
    title: "Tout a commencé par notre propre quittance.",
    intro:
      "TropPayé n'est pas né d'une étude de marché. Il est né d'un loyer que l'un de nous payait, et qui dépassait ce que la loi autorise. Nous avons construit l'outil que nous aurions voulu avoir.",
  },
  duo: {
    title: "Deux regards sur le même problème",
    founder: {
      name: "Lyes",
      role: "Fondateur",
      photoAlt: "Portrait de Lyes, fondateur de TropPayé",
      paragraphs: [
        "Je payais 1 020 € par mois pour un logement classé F. Sur le papier, tout semblait normal. En regardant de près, j'ai compris qu'un complément de loyer de 120 € s'ajoutait chaque mois sans base solide, et que la loi interdisait d'augmenter le loyer d'une passoire thermique.",
        "J'ai voulu comprendre, puis récupérer ce qui pouvait l'être. Le calcul existait, la base légale aussi. Ce qui manquait, c'était un moyen simple de le faire valoir sans y passer des semaines. TropPayé est cette réponse.",
      ],
    },
    nicolas: {
      name: "Nicolas",
      role: NICOLAS_ROLE,
      photoAlt: "Portrait de Nicolas, cofondateur de TropPayé",
      paragraphs: [
        "Cela fait des années que je connais le marché locatif de l'intérieur. Les loyers irréguliers, je les vois souvent, et je vois aussi combien il est rare qu'un locataire ose ou sache les contester.",
        "Quand Lyes m'a montré son dossier, l'idée était évidente : si lui pouvait récupérer son trop-perçu, des milliers d'autres le pouvaient aussi. Mon rôle, c'est de rendre ce chemin clair et accessible.",
      ],
    },
  },
  bascule: {
    title: "Le déclic",
    paragraphs: [
      "Récupérer son propre trop-perçu, c'est satisfaisant. Comprendre que des centaines de milliers de locataires sont dans la même situation, sans le savoir, c'est ce qui change tout.",
      "Nous avons décidé d'industrialiser ce que Lyes avait fait à la main : détecter l'irrégularité, estimer le montant récupérable, et engager le recouvrement amiable pour le compte du locataire.",
    ],
  },
  methode: {
    title: "Notre méthode",
    intro: "Pas de promesse, pas de jargon. Une mécanique claire, adossée à des textes précis.",
    /** Présentation « mentions de document officiel » : libellé → valeur. */
    mentions: [
      {
        label: "Base légale",
        value: "Gel des loyers des passoires thermiques (F et G) depuis le 24/08/2022.",
      },
      {
        label: "Plafonnement",
        value: "Bouclier loyer, révisions encadrées (+3,5 % max) sur la période T3-2022 à T1-2024.",
      },
      {
        label: "Cadre d'activité",
        value: "Recouvrement amiable de créances pour le compte d'autrui (art. R124-1 et s. CPCE).",
      },
      {
        label: "Rémunération",
        value: "25 % du trop-perçu effectivement récupéré. Aucun frais sans récupération.",
      },
    ],
  },
  preuve: {
    title: "Nos résultats",
    /** État vide : phrase imposée par la spec (mot pour mot). */
    emptyState: "Premier dossier en cours : le nôtre.",
  },
  cta: {
    title: "Découvrez si votre loyer est récupérable.",
  },
  /**
   * Phrase « validé par avocat » — rendue UNIQUEMENT si siteFlags.legalReviewDone.
   * Brouillon gardé masqué tant qu'une revue avocat réelle n'a pas eu lieu ;
   * l'avocat finalise la formulation ET lève le flag en même temps.
   */
  legalReviewLine: "Parcours validé par un avocat.",
  jsonLd: {
    founderName: "Lyes Triki",
    founderJobTitle: "Fondateur",
    nicolasName: "Nicolas",
    nicolasJobTitle: "Expert de la location",
  },
  injections: {
    storyTeaser: {
      lines: [
        "Notre premier dossier, c'était le nôtre.",
        "Un loyer trop élevé, une base légale, un trop-perçu récupérable.",
        "Voilà comment TropPayé est né.",
      ],
      linkLabel: "Lire notre histoire",
    },
    reviewer: {
      phrase: "Chaque dossier repose sur une base légale identifiée et un montant estimé récupérable.",
      photoAlt: "Portrait du référent qui suit votre dossier",
    },
    verdictStoryLine:
      "D'après vos informations, votre situation présente un trop-perçu potentiellement récupérable.",
    footerSignature: "TropPayé : recouvrement amiable du trop-perçu locatif.",
  },
} as const;
