import { z } from "zod";

/** Version du texte de consentement affiché — à figer avec le copy deck [AVOCAT]. */
export const LEAD_CONSENT_VERSION = "TODO_COPY-capture-v1";

/** Finalité déclarée du traitement (colonne `leads.purpose`, traçabilité RGPD). */
export const LEAD_PURPOSE = "envoi_resultat";

/**
 * Téléphone FR canonique APRÈS normalisation : `+33` ou `0`, puis 9 chiffres.
 * L'ancrage `^…$` borne aussi la longueur (10 ou 12 caractères).
 */
const PHONE_FR_RE = /^(?:\+33|0)[1-9]\d{8}$/;

/**
 * Saisie permissive (« 06 12 34 56 78 », « 06.12.34-56.78 », « +33 6 12 … ») :
 * on retire espaces/points/tirets PUIS on valide — et c'est la forme normalisée
 * qui est conservée (stockage homogène). Chaîne vide → undefined (champ optionnel).
 */
const leadPhoneSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/[\s.-]/g, "") : v),
  z
    .string()
    .regex(PHONE_FR_RE)
    .optional()
    .or(z.literal("").transform(() => undefined)),
);

export const leadSchema = z.object({
  verdictId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: leadPhoneSchema,
  /** Consentement SÉPARÉ pour le téléphone : `phone` fourni ⇒ doit être `true` (vérifié dans l'action). */
  phoneConsent: z.boolean(),
});

export type LeadInput = z.infer<typeof leadSchema>;
