/**
 * Référentiel des caractéristiques qui INTERDISENT un complément de loyer
 * (loi « 3DS » n° 2022-217 du 21/02/2022), pour les baux conclus depuis le
 * 18/08/2022 en zone d'encadrement des loyers.
 *
 * Source : service-public.gouv.fr (fiche F34401), loi 89-462 art. 17,
 * loi ELAN art. 140, décret du 13/05/2019.
 *
 * TODO_VERIFIER [AVOCAT] : périmètre exact (zones concernées), date pivot et
 * formulation juridique de chaque item à valider sur le texte officiel avant
 * toute mise en production. TODO_COPY : libellés grand public à affiner.
 */

/** Date pivot : interdiction applicable aux baux conclus à partir de cette date. */
export const COMPLEMENT_3DS_PIVOT_DATE = "2022-08-18";

export interface Complement3dsCriterion {
  id: string;
  label: string;
  /** Déduit automatiquement de l'étape DPE (coché et non décochable si F/G). */
  autoFromDpeFG?: boolean;
}

/** Au moins UN critère présent ⇒ complément interdit (bail dans le périmètre). */
export const COMPLEMENT_3DS_CRITERIA: Complement3dsCriterion[] = [
  { id: "sanitaires_palier", label: "Toilettes ou sanitaires situés sur le palier (hors du logement)" },
  { id: "humidite_murs", label: "Signes d'humidité visibles sur certains murs" },
  { id: "dpe_fg", label: "Logement classé F ou G au diagnostic énergétique (DPE)", autoFromDpeFG: true },
  { id: "fenetres_air", label: "Fenêtres laissant anormalement passer l'air (hors grille de ventilation)" },
  { id: "vis_a_vis", label: "Vis-à-vis à moins de 10 mètres" },
  { id: "infiltrations", label: "Infiltrations ou inondations provenant de l'extérieur" },
  { id: "evacuation_eau", label: "Problèmes d'évacuation d'eau survenus dans les 3 derniers mois" },
  { id: "electricite", label: "Installation électrique dégradée" },
  { id: "exposition", label: "Mauvaise exposition de la pièce principale" },
];
