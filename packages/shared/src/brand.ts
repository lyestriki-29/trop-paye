/**
 * Constantes de marque (nom, baseline, hooks, barème) — consommées par
 * le site ET les vidéos. Textes issus du copy-deck / étude concurrence
 * (mot pour mot ; ne pas reformuler librement).
 */

export const brand = {
  name: "TropPayé",
  domain: "troppaye.fr",
  /** Raison sociale de la SAS qui signe les courriers bailleurs (à figer). */
  legalName: "TODO_COPY — raison sociale SAS",

  baseline: "Récupérez ce que votre loyer vous doit.",
  baselineVariants: [
    "Vérifiez. Récupérez. Ne payez que si ça marche.",
    "Le loyer légal, rien de plus.",
  ],

  hero: {
    title: "Marre de trop payer ?",
    subtitle:
      "Vérifiez votre loyer en 2 minutes. Si on ne récupère rien, vous ne payez rien.",
    cta: "Vérifier mon loyer",
    reassurance: ["Gratuit", "Sans engagement", "2 minutes"],
  },

  /** Commission au succès : 25,00 % en basis points. */
  commissionRateBps: 2500,

  /** Hooks réseaux (acquisition sociale UNIQUEMENT — registre offensif). */
  hooks: {
    directs: [
      "Marre de trop payer ? TropPayé.",
      "Trop payé ? Récupérez.",
      "Vérifié, réclamé, remboursé. TropPayé.",
      "Vous avez trop payé. Lui, il le sait.",
      "2 minutes pour vérifier. 3 ans pour récupérer. 0 € si on échoue.",
    ],
    courts: [
      "POV : tu découvres que t'as trop payé ton loyer depuis 2 ans",
      "Ton proprio espère que tu ne feras jamais ce test",
      "J'ai tapé mon adresse, j'ai trouvé 1 400 €",
      "Logement mal isolé + loyer augmenté = doublement illégal",
    ],
    gimmick: "Trop payé ? Tape l'adresse !",
  },

  /** Mention de conformité affichée sur tout verdict (registre sobre). */
  disclaimer:
    "Estimation informative établie à partir de données publiques et de vos déclarations. Ceci n'est pas un conseil juridique.",
} as const;

export const PRESCRIPTION_YEARS = 3;
/** Gel des loyers F/G : interdiction d'augmenter depuis cette date (loi Climat). */
export const DPE_FREEZE_FROM = "2022-08-24";
