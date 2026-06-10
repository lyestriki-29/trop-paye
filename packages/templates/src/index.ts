import { MANDATE_TEMPLATE } from "./mandate";
import { LETTER_J0, LETTER_J21, LETTER_J35, LETTER_J50 } from "./letters";

/**
 * Templates juridiques [AVOCAT]. Contenu = brouillons placeholder, jamais de texte
 * juridique improvisé en production. `renderTemplate` remplace les `{{variables}}`.
 */

export const TEMPLATES = {
  mandate: MANDATE_TEMPLATE,
  letter_j0: LETTER_J0,
  letter_j21: LETTER_J21,
  letter_j35: LETTER_J35,
  letter_j50: LETTER_J50,
} as const;

export type TemplateName = keyof typeof TEMPLATES;

/** Map action_type → template courrier. */
export const ACTION_TEMPLATE: Record<string, TemplateName> = {
  LETTER_J0: "letter_j0",
  REMINDER_J21: "letter_j21",
  PROPOSAL_J35: "letter_j35",
  FINAL_NOTICE_J50: "letter_j50",
};

/** Tous les templates sont des brouillons à valider : bandeau affiché en UI. */
export const TEMPLATES_ARE_DRAFTS = true;

export function renderTemplate(name: TemplateName, vars: Record<string, string>): string {
  return TEMPLATES[name].replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    key in vars ? vars[key]! : `{{${key}}}`,
  );
}
