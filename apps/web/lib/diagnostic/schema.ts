import { z } from "zod";
import { mostRecentAnniversaryISO, type DossierSnapshot, type RentEvent } from "@troppaye/rules-engine";

export const dpeClassSchema = z.enum(["A", "B", "C", "D", "E", "F", "G"]);

export const diagnosticSchema = z.object({
  addressLabel: z.string().min(3),
  banId: z.string().optional(),
  inseeCode: z.string().optional(),
  surfaceM2: z.number().positive().optional(),
  furnished: z.boolean().optional(),
  dpe: z
    .object({
      class: dpeClassSchema,
      date: z.string(),
      numero: z.string().optional(),
      surfaceM2: z.number().optional(),
      source: z.enum(["ADEME_API", "USER_INPUT"]),
    })
    .nullable()
    .optional(),
  leaseSignedAt: z.string().optional(),
  initialRentCents: z.number().int().nonnegative(),
  currentRentCents: z.number().int().nonnegative(),
  revisions: z
    .array(z.object({ date: z.string(), rentCents: z.number().int().nonnegative() }))
    .default([]),
  revisionClause: z.boolean().optional(),
  revisionQuarter: z.string().optional(),
});

export type DiagnosticInput = z.infer<typeof diagnosticSchema>;

const INITIAL_FALLBACK_DATE = "2020-01-01";

/**
 * Mappe les réponses du questionnaire vers l'entrée pure du moteur.
 *
 * `asOf` (date d'évaluation, ISO) sert à dater le loyer courant : le moteur ne calcule
 * un trop-perçu IRL que s'il voit une révision (`irl-overcharge.ts`). On garantit donc
 * que `currentRentCents` apparaît comme dernier événement — sinon une hausse réelle non
 * saisie sous forme de révision datée resterait invisible (verdict « rien à signaler »
 * à tort). L'événement synthétique est daté à l'anniversaire de bail le plus récent.
 */
export function toSnapshot(input: DiagnosticInput, asOf: string): DossierSnapshot {
  const rentHistory: RentEvent[] = [
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

  // Injecte le loyer courant comme révision si distinct du dernier loyer connu.
  const lastKnownRent = rentHistory[rentHistory.length - 1]!.rentCents;
  if (input.currentRentCents !== lastKnownRent) {
    const anchor = input.leaseSignedAt ?? asOf;
    rentHistory.push({
      type: "REVISION",
      date: mostRecentAnniversaryISO(anchor, asOf),
      rentCents: input.currentRentCents,
      source: "déclaratif",
    });
  }

  return {
    leaseSignedAt: input.leaseSignedAt,
    furnished: input.furnished,
    surfaceM2: input.surfaceM2,
    inseeCode: input.inseeCode,
    dpeHistory: input.dpe
      ? [
          {
            class: input.dpe.class,
            date: input.dpe.date,
            surfaceM2: input.dpe.surfaceM2,
            numero: input.dpe.numero,
            source: input.dpe.source,
          },
        ]
      : [],
    rentHistory,
    revisionClause: input.revisionClause,
    revisionQuarter: input.revisionQuarter,
  };
}
