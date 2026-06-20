import { z } from "zod";

/** Créneaux de rappel — valeurs stockées + libellés FR (source unique). */
export const CALLBACK_SLOTS = [
  { value: "ASAP", label: "Dès que possible" },
  { value: "MORNING", label: "Matin" },
  { value: "AFTERNOON", label: "Après-midi" },
  { value: "EVENING", label: "Soir" },
] as const;

export type CallbackSlot = (typeof CALLBACK_SLOTS)[number]["value"];

const SLOT_LABEL: Record<string, string> = Object.fromEntries(
  CALLBACK_SLOTS.map((s) => [s.value, s.label]),
);

/** Libellé FR d'un créneau (fallback : la valeur brute). */
export function slotLabel(slot: string): string {
  return SLOT_LABEL[slot] ?? slot;
}

/** Payload d'une demande de rappel — validé côté Server Action. */
export const callbackSchema = z.object({
  dossierId: z.string().min(1),
  subject: z.string().trim().min(1).max(200),
  preferredSlot: z.enum(["ASAP", "MORNING", "AFTERNOON", "EVENING"]),
  phone: z.string().trim().min(4).max(30),
});

export type CallbackInput = z.infer<typeof callbackSchema>;
