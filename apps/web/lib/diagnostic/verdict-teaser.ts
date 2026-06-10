import { cache } from "react";
import type { Outcome, RuleResult } from "@troppaye/rules-engine";
import { RULE_LABEL } from "@troppaye/rules-engine";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { UUID_RE } from "./verdict-read";

/**
 * Teaser PUBLIC d'un verdict (plan P2 Task 7 Step 2) — surface lue SANS session,
 * pour l'image OG et la page vue par un tiers. Strictement anonymisé (RGPD) :
 * montant + type d'irrégularité + ville. JAMAIS `address_label` brut, jamais le
 * détail du calcul, jamais l'email. Verdict non chiffré → tout à null.
 */
export interface VerdictTeaser {
  outcome: Outcome;
  /** Trop-perçu total — null si verdict non chiffré (conforme, insuffisant, orientation). */
  amountCents: number | null;
  /** Libellé court du fondement principal (`RULE_LABEL`), jamais le calcul. */
  kindLabel: string | null;
  /** Ville seule, extraite du libellé d'adresse — jamais le numéro ni la rue. */
  city: string | null;
}

/**
 * « 12 Rue de la République 69002 Lyon » → « Lyon » — ville = ce qui suit le
 * DERNIER code postal (`.*` gourmand : une voie contenant 5 chiffres, ex.
 * « rue du 11000 Novembre », ne doit jamais faire fuiter un bout d'adresse).
 */
export function extractCity(addressLabel: string | null): string | null {
  if (!addressLabel) return null;
  const city = /^.*\b\d{5}\s+(.+)$/.exec(addressLabel)?.[1]?.trim();
  return city ? city : null;
}

/**
 * Lit le teaser via service_role SANS exiger le cookie de session : l'UUID
 * (non séquentiel, non listable) sert de capacité de partage. `cache()` React
 * dédoublonne la lecture entre `generateMetadata` et le rendu de la page.
 */
export const getVerdictTeaser = cache(
  async (verdictId: string): Promise<VerdictTeaser | null> => {
    if (!UUID_RE.test(verdictId)) return null;

    const admin = getSupabaseAdmin();
    const { data: v, error } = await admin
      .from("verdicts")
      .select("dossier_id, outcome, total_recoverable_cents, results")
      .eq("id", verdictId)
      .single();
    if (error || !v) return null;

    const outcome = v.outcome as Outcome;
    if (outcome !== "IRREGULAR") {
      return { outcome, amountCents: null, kindLabel: null, city: null };
    }

    // Fondement principal = premier résultat IRREGULAR non subsidiaire (même
    // logique que VerdictView) ; on n'expose que son libellé court.
    const results = (v.results as RuleResult[] | null) ?? [];
    const primary = results.find((r) => r.outcome === "IRREGULAR" && !r.subsidiaryOf);

    // L'adresse n'est lue QUE pour en extraire la ville, et uniquement si chiffré.
    const { data: dossier } = await admin
      .from("dossiers")
      .select("address_label")
      .eq("id", v.dossier_id)
      .single();

    return {
      outcome,
      amountCents: v.total_recoverable_cents,
      kindLabel: primary ? RULE_LABEL[primary.ruleId] : null,
      city: extractCity(dossier?.address_label ?? null),
    };
  },
);
