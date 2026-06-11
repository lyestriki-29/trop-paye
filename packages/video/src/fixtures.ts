import { brand } from "@troppaye/shared";

/**
 * Fixtures DEMO (spec P4) : données PLAUSIBLES, MARQUÉES, JAMAIS PUBLIÉES.
 * La règle « données réelles anonymisées » s'applique à la diffusion : tout
 * rendu de test porte le filigrane DEMO. Chiffres alignés sur le témoin v2
 * (71,85 €/mois → 1 437,00 € sur 20 mois).
 */

export const DEMO_TAG = "SPÉCIMEN — DONNÉES FICTIVES";

export const demoVerdict = {
  reference: "TP-2026-0117",
  city: "Paris 11ᵉ",
  dpeClass: "G",
  monthlyOverchargeCents: 7_185,
  recoverableCents: 143_700,
  hikeDate: "01/10/2024",
} as const;

/**
 * Stat d'appui (copy deck §1, mot pour mot). Source la plus proche (recherche
 * 2026-06-11) : SDES, parc locatif privé F/G. TODO_VERIFIER : formulation deck.
 */
export const demoStat = {
  text: "1 logement loué sur 6 en France a un loyer illégal.",
  punch: "Le vôtre ?",
  source: "Source : SDES — parc locatif privé classé F/G, 01/01/2023",
} as const;

/** Témoignage FICTIF (post-pilote : remplacer par un dossier gagné réel consenti). */
export const demoTemoignage = {
  quote: "J'ai tapé mon adresse un dimanche soir. Trois mois plus tard, 1 437 € sont revenus sur mon compte.",
  author: "Léa, 24 ans — locataire à Paris 11ᵉ",
  amountCents: 143_700,
} as const;

/** Hooks réseaux (brand.ts — curation banque étudiants Paris en attente de Lyes). */
export const demoHooks = brand.hooks.directs.slice(0, 3);

/** Étapes Explainer (copy deck §1 « Comment ça marche », mot pour mot). */
export const explainerSteps = [
  {
    title: "Vérifiez",
    text: "Tapez votre adresse. On croise votre loyer avec les données publiques : DPE, indice des loyers, règles de votre ville.",
  },
  {
    title: "Mandatez-nous",
    text: "Une signature en ligne, vos quittances, et c'est tout. Vous ne parlerez jamais loyer avec votre propriétaire — nous, si.",
  },
  {
    title: "Récupérez",
    text: "On réclame, on relance, on encaisse, on vous reverse. Notre commission : 25 % de ce qu'on récupère. Rien récupéré ? Rien payé.",
  },
] as const;

/** Date de lancement du teaser — TODO_COPY : à figer par Lyes. */
export const demoLaunch = { date: "Bientôt", handle: "@troppaye" } as const;
