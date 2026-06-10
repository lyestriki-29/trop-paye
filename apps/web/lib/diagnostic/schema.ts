import { z } from "zod";
import { buildRentHistory, type DossierSnapshot } from "@troppaye/rules-engine";

export const dpeClassSchema = z.enum(["A", "B", "C", "D", "E", "F", "G"]);

/** Date ISO stricte "YYYY-MM-DD" (refuse une saisie vide ou mal formée). */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ attendu).");

export const diagnosticSchema = z.object({
  addressLabel: z.string().min(3),
  banId: z.string().optional(),
  inseeCode: z.string().optional(),
  surfaceM2: z.number().positive().max(10000).optional(),
  furnished: z.boolean().optional(),
  dpe: z
    .object({
      class: dpeClassSchema,
      date: isoDate,
      numero: z.string().optional(),
      surfaceM2: z.number().positive().max(10000).optional(),
      source: z.enum(["ADEME_API", "USER_INPUT"]),
    })
    .nullable()
    .optional(),
  leaseSignedAt: isoDate.optional(),
  initialRentCents: z.number().int().positive(),
  currentRentCents: z.number().int().positive(),
  // Chaque hausse saisie doit être datée et strictement positive (0 = ligne incomplète).
  revisions: z
    .array(z.object({ date: isoDate, rentCents: z.number().int().positive() }))
    .default([]),
  revisionClause: z.boolean().optional(),
  revisionQuarter: z.string().optional(),
});

export type DiagnosticInput = z.infer<typeof diagnosticSchema>;

/**
 * Mappe les réponses du questionnaire vers l'entrée pure du moteur. La construction de
 * l'historique des loyers (et l'injection du loyer courant) est déléguée au helper PUR et
 * testé `buildRentHistory` (cf. rules-engine). `asOf` = date d'évaluation (ISO).
 */
export function toSnapshot(input: DiagnosticInput, asOf: string): DossierSnapshot {
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
    rentHistory: buildRentHistory({
      leaseSignedAt: input.leaseSignedAt,
      initialRentCents: input.initialRentCents,
      currentRentCents: input.currentRentCents,
      revisions: input.revisions,
      asOf,
    }),
    revisionClause: input.revisionClause,
    revisionQuarter: input.revisionQuarter,
  };
}
