import { z } from "zod";
import type { DossierSnapshot } from "@troppaye/rules-engine";

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

/** Mappe les réponses du questionnaire vers l'entrée pure du moteur. */
export function toSnapshot(input: DiagnosticInput): DossierSnapshot {
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
    rentHistory: [
      {
        type: "INITIAL",
        date: input.leaseSignedAt ?? "2020-01-01",
        rentCents: input.initialRentCents,
        source: "déclaratif",
      },
      ...input.revisions.map((r) => ({
        type: "REVISION" as const,
        date: r.date,
        rentCents: r.rentCents,
        source: "déclaratif" as const,
      })),
    ],
    revisionClause: input.revisionClause,
    revisionQuarter: input.revisionQuarter,
  };
}
