import { z } from "zod";
import {
  buildRentHistory,
  ccToHcCents,
  quarterFromMonthISO,
  type DossierSnapshot,
} from "@troppaye/rules-engine";
import { COMPLEMENT_3DS_CRITERIA } from "@/lib/diagnostic/complement-3ds";

/** Ids de critères 3DS connus : tout id reçu hors de cet ensemble est ignoré. */
const KNOWN_3DS_IDS = new Set(COMPLEMENT_3DS_CRITERIA.map((c) => c.id));

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
    /** Colocation (LOT 1.3) : toggle étape 2. */
    isShared: z.boolean().optional(),
    /** Nombre total de colocataires (n) ; requis si saisie « ma part ». */
    tenantCount: z.number().int().min(2).max(20).optional(),
    /** Base de saisie des loyers (étape 5) : total du logement, ou part personnelle. */
    rentBasis: z.enum(["TOTAL", "SHARE"]).optional(),
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
    /** Dépôt de garantie versé (LOT 1, règle DEPOSIT_CAP) : optionnel ; absent =
        « je ne sais pas / pas de dépôt », la règle n'est pas évaluée. */
    depositPaidCents: z.number().int().positive().optional(),
    /** Complément de loyer au bail (retour Lyes 2026-06-11) : OUI alimente un
        signal d'orientation du moteur, jamais un chiffrage. */
    rentSupplement: z.enum(["OUI", "NON", "NSP"]).optional(),
    rentSupplementCents: z.number().int().positive().optional(),
    /** Critères 3DS cochés (LOT 1.2) : ids de COMPLEMENT_3DS_CRITERIA. */
    complementCriteria: z.array(z.string().max(64)).max(20).optional(),
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
    // Saisie « ma part » : le nombre de colocataires est requis pour reconstituer le total.
    if (val.rentBasis === "SHARE" && (val.tenantCount === undefined || val.tenantCount < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tenantCount"],
        message: "Indiquez le nombre de colocataires (au moins 2) pour reconstituer le loyer total.",
      });
    }
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
  // Colocation (LOT 1.3) : en saisie « ma part », on reconstitue le total household
  // = part × n AVANT toute conversion, pour que le moteur ne voie QUE le total.
  // En saisie « total » (ou hors coloc), n = 1 → snapshot identique au tunnel actuel.
  const n = input.rentBasis === "SHARE" && input.tenantCount ? input.tenantCount : 1;
  // Charges aussi à l'échelle du logement (part × n) pour rester cohérent en mode CC.
  const charges =
    input.rentInputMode === "CC" && input.chargesCents !== undefined
      ? input.chargesCents * n
      : undefined;
  // Le zod ci-dessus garantit charges < montant ; repli défensif sur le montant brut.
  const hc = (cents: number): number => {
    const total = cents * n;
    return charges === undefined ? total : (ccToHcCents(total, charges) ?? total);
  };
  const rentEstimated =
    input.rentInputMode === "CC" && input.chargesEstimated === true ? true : undefined;
  const rentReconstructedFromShare =
    input.rentBasis === "SHARE" && input.tenantCount ? true : undefined;

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
    // Dépôt NON multiplié par n : un bail = un dépôt UNIQUE pour le logement, et le
    // champ UI demande le dépôt versé (total), pas une quote-part. Le plafond
    // DEPOSIT_CAP se compare bien au loyer total reconstitué (cf. revue 2026-06-11).
    depositPaidCents: input.depositPaidCents,
    rentSupplementDeclared: input.rentSupplement === "OUI" ? true : undefined,
    rentSupplementCents: input.rentSupplement === "OUI" ? input.rentSupplementCents : undefined,
    // Filtrage anti-payload-forgé : seuls les ids connus du référentiel sont transmis.
    complementCriteria:
      input.rentSupplement === "OUI"
        ? input.complementCriteria?.filter((id) => KNOWN_3DS_IDS.has(id))
        : undefined,
    revisionQuarter,
    revisionQuarterSource,
    rentEstimated,
    rentReconstructedFromShare,
  };
}
