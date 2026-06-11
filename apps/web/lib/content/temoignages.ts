/**
 * Témoignages RÉELS — jamais d'exemple inventé (règle compteur/preuves).
 * Kilian : fourni par Lyes le 2026-06-11. [AVOCAT] avant diffusion publique :
 * accord écrit + formulation « sans préavis » à vérifier.
 */
export interface Temoignage {
  id: string;
  prenom: string;
  contexte: string;
  quote: string;
  /** Faits comptables affichés en carte-preuve. */
  loyerCents: number;
  recupereCents: number;
  lignes: ReadonlyArray<{ label: string; text: string }>;
}

export const TEMOIGNAGES: ReadonlyArray<Temoignage> = [
  {
    id: "kilian-paris-9",
    prenom: "Kilian",
    contexte: "3 ans locataire — Paris 9ᵉ",
    quote:
      "Je pensais que 750 € pour Paris, c'était une affaire. Septième étage sans ascenseur, passoire thermique : j'ai récupéré 4 500 € et j'ai pu partir sans préavis.",
    loyerCents: 75_000,
    recupereCents: 450_000,
    lignes: [
      { label: "Logement", text: "7ᵉ étage sans ascenseur" },
      { label: "Diagnostic", text: "Passoire thermique" },
      { label: "Départ", text: "Sans préavis" },
    ],
  },
];
