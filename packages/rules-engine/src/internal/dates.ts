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

export function maxISO(a: string, b: string): string {
  return a.slice(0, 10) > b.slice(0, 10) ? a.slice(0, 10) : b.slice(0, 10);
}

export function minISO(a: string, b: string): string {
  return a.slice(0, 10) < b.slice(0, 10) ? a.slice(0, 10) : b.slice(0, 10);
}
