/**
 * Seed des 4 états de la page verdict (P2 Task 6) + variante confiance moyenne.
 * Les dossiers portent un `session_token` FIXE : pour voir les pages, poser le
 * cookie `tp_session=<VERDICT_SESSION_TOKEN>` dans le navigateur (DevTools →
 * Application → Cookies). Démo locale uniquement.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const VERDICT_SESSION_TOKEN = "tp-demo-verdict-session";

/** RuleResult de démo (forme du moteur, JSON brut). */
function rule(
  ruleId: string,
  outcome: string,
  legalBasis: string,
  patch: Record<string, unknown> = {},
) {
  return {
    ruleId,
    ruleVersion: "demo",
    outcome,
    confidence: "HIGH",
    recoverableCents: 0,
    futureMonthlySavingCents: 0,
    legalBasis,
    computation: { ruleId, ruleVersion: "demo", steps: [] },
    ...patch, // un `computation` fourni remplace le défaut vide
  };
}

const DPE_BASIS =
  "Gel des loyers F/G — loi Climat et résilience art. 159 ; loi du 06/07/1989 art. 17-1-I (interdiction d'augmentation depuis le 24/08/2022).";
const IRL_BASIS = "Révision IRL — loi du 06/07/1989 art. 17-1 (IRL plafond).";
const DEPOSIT_BASIS = "Dépôt de garantie — loi du 06/07/1989 art. 22.";
const SIGNAL_G =
  "Logement classé G : interdiction de mise en location depuis le 01/01/2025 (décence énergétique). Orientation possible vers une action judiciaire — non chiffrée automatiquement. [AVOCAT]";

interface VerdictStateSpec {
  label: string;
  address: string;
  dpeNumber?: string;
  outcome: string;
  confidence: string;
  total: number;
  future: number;
  results: ReturnType<typeof rule>[];
  signals: string[];
}

const STATES: VerdictStateSpec[] = [
  {
    label: "1. IRREGULAR (séquence complète, confiance élevée, prescription ≤ 1 an)",
    address: "12 rue des Lilas, 75011 Paris",
    dpeNumber: "2275E1234567A",
    outcome: "IRREGULAR",
    confidence: "HIGH",
    total: 143700,
    future: 7185,
    results: [
      rule("DPE_FREEZE", "IRREGULAR", DPE_BASIS, {
        recoverableCents: 143700,
        futureMonthlySavingCents: 7185,
        actionDeadline: "2026-11-01",
        computation: {
          ruleId: "DPE_FREEZE",
          ruleVersion: "demo",
          steps: [
            { label: "Loyer légal gelé (avant 1re hausse)", cents: 95000 },
            { label: "Trop-perçu récupérable (fenêtre 3 ans)", cents: 143700 },
            { label: "Économie mensuelle à venir", cents: 7185 },
          ],
        },
      }),
      rule("IRL_OVERCHARGE", "COMPLIANT", IRL_BASIS),
      rule("DEPOSIT_LATE", "COMPLIANT", DEPOSIT_BASIS),
    ],
    signals: [],
  },
  {
    label: "1bis. IRREGULAR (confiance moyenne, prescription > 1 an, sans économie future)",
    address: "4 rue de la Nuance, 69001 Lyon",
    outcome: "IRREGULAR",
    confidence: "MEDIUM",
    total: 48000,
    future: 0,
    results: [
      rule("IRL_OVERCHARGE", "IRREGULAR", IRL_BASIS, {
        confidence: "MEDIUM",
        recoverableCents: 48000,
        actionDeadline: "2028-03-01",
        computation: {
          ruleId: "IRL_OVERCHARGE",
          ruleVersion: "demo",
          steps: [
            { label: "Loyer légal à ce jour", cents: 82000 },
            { label: "Trop-perçu récupérable (fenêtre 3 ans)", cents: 48000 },
          ],
        },
      }),
      rule("DPE_FREEZE", "COMPLIANT", DPE_BASIS),
      rule("DEPOSIT_LATE", "COMPLIANT", DEPOSIT_BASIS),
    ],
    signals: [],
  },
  {
    label: "2. COMPLIANT + signaux (orientation, JAMAIS chiffrée)",
    address: "7 rue du Signal, 33000 Bordeaux",
    outcome: "COMPLIANT",
    confidence: "HIGH",
    total: 0,
    future: 0,
    results: [
      rule("DPE_FREEZE", "COMPLIANT", DPE_BASIS),
      rule("IRL_OVERCHARGE", "COMPLIANT", IRL_BASIS),
      rule("DEPOSIT_LATE", "COMPLIANT", DEPOSIT_BASIS),
    ],
    signals: [SIGNAL_G],
  },
  {
    label: "3. COMPLIANT sans signal (rien à signaler)",
    address: "15 rue Tranquille, 44000 Nantes",
    outcome: "COMPLIANT",
    confidence: "HIGH",
    total: 0,
    future: 0,
    results: [
      rule("DPE_FREEZE", "COMPLIANT", DPE_BASIS),
      rule("IRL_OVERCHARGE", "COMPLIANT", IRL_BASIS),
      rule("DEPOSIT_LATE", "COMPLIANT", DEPOSIT_BASIS),
    ],
    signals: [],
  },
  {
    label: "4. INSUFFICIENT_DATA (pièces manquantes)",
    address: "2 impasse du Manque, 59000 Lille",
    outcome: "INSUFFICIENT_DATA",
    confidence: "LOW",
    total: 0,
    future: 0,
    results: [
      rule("DPE_FREEZE", "INSUFFICIENT_DATA", DPE_BASIS, {
        confidence: "LOW",
        missingData: ["dpe"],
      }),
      rule("IRL_OVERCHARGE", "INSUFFICIENT_DATA", IRL_BASIS, {
        confidence: "LOW",
        missingData: ["revisionQuarter"],
      }),
      rule("DEPOSIT_LATE", "COMPLIANT", DEPOSIT_BASIS),
    ],
    signals: [],
  },
];

/** Crée les dossiers+verdicts ; retourne les lignes à afficher (label → URL). */
export async function seedVerdictStates(
  admin: SupabaseClient,
  clientUserId: string,
  asOf: string,
): Promise<string[]> {
  const lines: string[] = [];
  for (const s of STATES) {
    const { data: dossier } = await admin
      .from("dossiers")
      .insert({
        user_id: clientUserId, // purgé/recréé avec les autres dossiers de démo
        session_token: VERDICT_SESSION_TOKEN,
        status: "DIAGNOSED",
        address_label: s.address,
        initial_rent_cents: 90000,
        current_rent_cents: 102185,
        dpe_number: s.dpeNumber ?? null,
      })
      .select("id")
      .single();
    if (!dossier) continue;

    const { data: verdict } = await admin
      .from("verdicts")
      .insert({
        dossier_id: dossier.id,
        outcome: s.outcome,
        confidence: s.confidence,
        total_recoverable_cents: s.total,
        total_future_monthly_saving_cents: s.future,
        results: s.results,
        signals: s.signals,
        as_of: asOf,
      })
      .select("id")
      .single();
    if (verdict) lines.push(`${s.label}\n   http://localhost:3000/diagnostic/${verdict.id}`);
  }
  return lines;
}
