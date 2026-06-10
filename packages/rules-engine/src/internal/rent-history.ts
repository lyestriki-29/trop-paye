import type { RentEvent } from "../types";
import { mostRecentAnniversaryISO } from "./dates";

export interface RentHistoryInput {
  leaseSignedAt?: string;
  initialRentCents: number;
  currentRentCents: number;
  revisions: { date: string; rentCents: number }[];
  asOf: string; // ISO — date d'évaluation
}

/** Bail sans date connue : ancre par défaut (l'historique perd en précision, pas en justesse). */
export const INITIAL_FALLBACK_DATE = "2020-01-01";

/**
 * Construit l'historique des loyers injecté dans le moteur PUR, à partir des saisies du
 * questionnaire. Garantit que le loyer COURANT figure comme dernier événement : sans cela,
 * la règle IRL ne voit aucune révision et conclut « rien à signaler » à tort
 * (cf. `irl-overcharge.ts`). Le loyer courant est daté à l'anniversaire de bail le plus
 * récent (proxy de la date de révision réelle, inconnue) → la règle en déduit MEDIUM.
 *
 * NOTE [AVOCAT] : l'effet d'une BAISSE de loyer sur le plafond légal IRL relève d'une
 * décision juridique (voir `irl-overcharge.ts`, `prevLegal`). Ici on se contente d'injecter
 * le loyer courant tel quel pour que `paidAt` reflète la réalité ; le calcul du plafond
 * reste la responsabilité de la règle.
 */
export function buildRentHistory(input: RentHistoryInput): RentEvent[] {
  const history: RentEvent[] = [
    {
      type: "INITIAL",
      date: input.leaseSignedAt ?? INITIAL_FALLBACK_DATE,
      rentCents: input.initialRentCents,
      source: "déclaratif",
    },
    ...input.revisions.map(
      (r): RentEvent => ({
        type: "REVISION",
        date: r.date,
        rentCents: r.rentCents,
        source: "déclaratif",
      }),
    ),
  ];

  const last = history[history.length - 1]!;
  if (input.currentRentCents !== last.rentCents) {
    const date = mostRecentAnniversaryISO(input.leaseSignedAt ?? input.asOf, input.asOf);
    // Anti-collision : si une révision saisie tombe le même jour, on réécrit son montant
    // au lieu d'empiler deux événements datés à l'identique (ordre non déterministe).
    const sameDay = history.find((e) => e.type === "REVISION" && e.date === date);
    if (sameDay) sameDay.rentCents = input.currentRentCents;
    else
      history.push({
        type: "REVISION",
        date,
        rentCents: input.currentRentCents,
        source: "déclaratif",
      });
  }

  return history;
}
