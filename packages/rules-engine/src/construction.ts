import type { ConstructionPeriod } from "./index";

/** Mappe une année de construction (ex. DPE ADEME) vers la fourchette d'encadrement.
 *  Retourne undefined si l'année est absente ou hors plage plausible (1700–2100). */
export function constructionPeriodFromYear(year: number | undefined): ConstructionPeriod | undefined {
  if (year === undefined || !Number.isInteger(year) || year < 1700 || year > 2100) return undefined;
  if (year < 1946) return "BEFORE_1946";
  if (year <= 1970) return "1946_1970";
  if (year <= 1990) return "1971_1990";
  return "AFTER_1990";
}
