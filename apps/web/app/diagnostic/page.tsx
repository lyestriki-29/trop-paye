import { after } from "next/server";
import { trackEvent } from "@/lib/track";
import { Questionnaire } from "./questionnaire/Questionnaire";

export const dynamic = "force-dynamic";

/** Tunnel diagnostic — le chrome allégé (logo + étape) est rendu par le client. */
export default function DiagnosticPage() {
  // Jalon funnel PRD §5 (entrées tunnel ; rechargements comptés, volume brut).
  // after() : la mesure part APRÈS la réponse — un PostgREST lent ne retarde
  // jamais l'entrée du funnel (revue 2026-06-11).
  after(() => trackEvent("diagnostic_demarre"));
  return <Questionnaire />;
}
