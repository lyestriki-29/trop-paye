import { z } from "zod";
import {
  buildRentHistory,
  ccToHcCents,
  quarterFromMonthISO,
  type DossierSnapshot,
} from "@troppaye/rules-engine";

export const dpeClassSchema = z.enum(["A", "B", "C", "D", "E", "F", "G"]);

/** Date ISO stricte "YYYY-MM-DD" (refuse une saisie vide ou mal formée). */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ attendu).");

export const diagnosticSchema = z
  .object({
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
    /** « Je ne sais pas » (spec §3) : trimestre à déduire du mois de signature. */
    revisionQuarterUnknown: z.boolean().optional(),
    /** Mode de saisie des loyers (spec §2) : HC par défaut, CC = conversion. */
    rentInputMode: z.enum(["HC", "CC"]).optional(),
    chargesCents: z.number().int().min(0).optional(),
    /** true = la valeur pré-remplie au barème n'a pas été modifiée (spec §2). */
    chargesEstimated: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.rentInputMode !== "CC") return;
    const charges = val.chargesCents;
    if (charges === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["chargesCents"],
        message: "Charges mensuelles requises en mode charges comprises.",
      });
      return;
    }
    // Refus charges ≥ CC (spec §2) — sur les deux montants et chaque hausse saisie.
    const tooHigh = "Les charges doivent être inférieures au loyer charges comprises.";
    if (ccToHcCents(val.initialRentCents, charges) === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["initialRentCents"], message: tooHigh });
    }
    if (ccToHcCents(val.currentRentCents, charges) === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentRentCents"], message: tooHigh });
    }
    val.revisions.forEach((r, i) => {
      if (ccToHcCents(r.rentCents, charges) === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["revisions", i, "rentCents"],
          message: tooHigh,
        });
      }
    });
  });

export type DiagnosticInput = z.infer<typeof diagnosticSchema>;

/**
 * Mappe les réponses du questionnaire vers l'entrée pure du moteur. La construction de
 * l'historique des loyers (et l'injection du loyer courant) est déléguée au helper PUR et
 * testé `buildRentHistory` (cf. rules-engine). `asOf` = date d'évaluation (ISO).
 * Mode CC (spec §2) : conversion HC = CC − charges ici même — le moteur ne voit que des HC ;
 * si les charges sont estimées (barème), `rentEstimated` plafonne la confiance à MEDIUM.
 */
export function toSnapshot(input: DiagnosticInput, asOf: string): DossierSnapshot {
  const charges = input.rentInputMode === "CC" ? input.chargesCents : undefined;
  // Le zod ci-dessus garantit charges < montant ; repli défensif sur le montant brut.
  const hc = (cents: number): number =>
    charges === undefined ? cents : (ccToHcCents(cents, charges) ?? cents);
  const rentEstimated =
    input.rentInputMode === "CC" && input.chargesEstimated === true ? true : undefined;

  // Trimestre IRL : saisi dans le bail, ou déduit du mois de signature (spec §3).
  // Sans date de bail, il reste vide (comportement actuel de la règle).
  let revisionQuarter = input.revisionQuarter;
  let revisionQuarterSource: DossierSnapshot["revisionQuarterSource"] = revisionQuarter
    ? "BAIL"
    : undefined;
  if (!revisionQuarter && input.revisionQuarterUnknown && input.leaseSignedAt) {
    revisionQuarter = quarterFromMonthISO(input.leaseSignedAt);
    revisionQuarterSource = "DEDUCED";
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
    rentHistory: buildRentHistory({
      leaseSignedAt: input.leaseSignedAt,
      initialRentCents: hc(input.initialRentCents),
      currentRentCents: hc(input.currentRentCents),
      revisions: input.revisions.map((r) => ({ date: r.date, rentCents: hc(r.rentCents) })),
      asOf,
    }),
    revisionClause: input.revisionClause,
    revisionQuarter,
    revisionQuarterSource,
    rentEstimated,
  };
}
