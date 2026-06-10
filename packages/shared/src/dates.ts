/**
 * Utilitaires de dates pour le pipeline de recouvrement.
 * Convention figée : jours CALENDAIRES, fuseau Europe/Paris, J0 = date
 * d'envoi effective du courrier. (Caractère calendaire vs ouvré : [AVOCAT].)
 */

export function addCalendarDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Date au format ISO court (YYYY-MM-DD). */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface PipelineSchedule {
  j0: string;
  j21: string;
  j35: string;
  j50: string;
}

/** Jalons J0 → J+21 → J+35 → J+50 à partir de la date d'envoi du courrier J0. */
export function computeSchedule(j0: Date | string): PipelineSchedule {
  const base = typeof j0 === "string" ? new Date(j0) : j0;
  return {
    j0: toISODate(base),
    j21: toISODate(addCalendarDays(base, 21)),
    j35: toISODate(addCalendarDays(base, 35)),
    j50: toISODate(addCalendarDays(base, 50)),
  };
}

const dateFmtFr = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Paris",
});

export function formatDateFr(date: Date | string): string {
  return dateFmtFr.format(typeof date === "string" ? new Date(date) : date);
}
