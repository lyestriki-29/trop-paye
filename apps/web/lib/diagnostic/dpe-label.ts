/** Champs descriptifs communs DpeResult (provider) / DpeDraft (brouillon). */
export interface DpeDescriptor {
  surfaceM2?: number;
  etage?: number;
  complementLogement?: string;
  batiment?: string;
  residence?: string;
  typeBatiment?: string;
}

/** « Rez-de-chaussée », « 1ᵉʳ étage », « 3ᵉ étage ». */
export function floorLabel(etage: number): string {
  if (etage === 0) return "Rez-de-chaussée";
  return etage === 1 ? "1ᵉʳ étage" : `${etage}ᵉ étage`;
}

/**
 * Fragments descriptifs d'un DPE (spec questionnaire §1) — rendent les candidats
 * d'une même adresse distinguables ; champs absents omis. La classe et la date
 * d'établissement restent mises en forme par les composants appelants.
 * Ex : « Appartement · 3ᵉ étage · Bât. A · 45 m² · Résidence Les Tilleuls ».
 */
export function dpeDescriptorParts(d: DpeDescriptor): string[] {
  const parts: string[] = [];
  if (d.typeBatiment) {
    parts.push(d.typeBatiment.charAt(0).toUpperCase() + d.typeBatiment.slice(1).toLowerCase());
  }
  if (d.etage !== undefined) parts.push(floorLabel(d.etage));
  if (d.complementLogement) parts.push(d.complementLogement);
  if (d.batiment) parts.push(d.batiment);
  if (d.surfaceM2 !== undefined) parts.push(`${d.surfaceM2} m²`);
  if (d.residence) parts.push(d.residence);
  return parts;
}
