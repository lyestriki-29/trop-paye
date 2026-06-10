/** Helpers de dates purs (granularité jour/mois) — ISO "YYYY-MM-DD". */

export function shiftISO(
  iso: string,
  opts: { years?: number; months?: number; days?: number },
): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  const monthDelta = (opts.months ?? 0) + (opts.years ?? 0) * 12;
  if (monthDelta !== 0) {
    // Décalage de mois SANS débordement : 31 janv. + 1 mois = 28/29 févr. (pas 2/3 mars).
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + monthDelta);
    const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, lastDay));
  }
  if (opts.days) d.setUTCDate(d.getUTCDate() + opts.days);
  return d.toISOString().slice(0, 10);
}

export function firstOfMonth(iso: string): string {
  return iso.slice(0, 7) + "-01";
}

/** Liste des 1ers de mois dans [start, end) (end exclusif). */
export function eachMonth(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const end = endISO.slice(0, 10);
  let cur = firstOfMonth(startISO);
  while (cur < end) {
    out.push(cur);
    cur = shiftISO(cur, { months: 1 });
  }
  return out;
}

/** Construit "YYYY-MM-DD" en bornant le jour au dernier jour du mois (29 févr. → 28). */
function clampYmd(year: number, month1: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month1, 0)).getUTCDate();
  const d = Math.min(day, lastDay);
  const mm = String(month1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Dernier anniversaire (même jour/mois que `anchor`) antérieur ou égal à `asOf`.
 * Sert à dater un événement de loyer courant non daté (proxy de la date de révision
 * réelle, inconnue). Si `anchor` ≥ `asOf` (bail signé aujourd'hui/futur), renvoie `asOf`.
 */
export function mostRecentAnniversaryISO(anchorISO: string, asOfISO: string): string {
  const anchor = anchorISO.slice(0, 10);
  const asOf = asOfISO.slice(0, 10);
  if (anchor >= asOf) return asOf;

  const month1 = Number(anchor.slice(5, 7));
  const dayOfMonth = Number(anchor.slice(8, 10));
  const asOfYear = Number(asOf.slice(0, 4));

  let candidate = clampYmd(asOfYear, month1, dayOfMonth);
  if (candidate > asOf) candidate = clampYmd(asOfYear - 1, month1, dayOfMonth);
  return candidate;
}

export function maxISO(a: string, b: string): string {
  return a.slice(0, 10) > b.slice(0, 10) ? a.slice(0, 10) : b.slice(0, 10);
}

export function minISO(a: string, b: string): string {
  return a.slice(0, 10) < b.slice(0, 10) ? a.slice(0, 10) : b.slice(0, 10);
}
