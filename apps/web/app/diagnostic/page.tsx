import { after } from "next/server";
import { trackEvent } from "@/lib/track";
import { Questionnaire } from "./questionnaire/Questionnaire";

export const dynamic = "force-dynamic";

/**
 * Tunnel diagnostic — le chrome allégé (logo + étape) est rendu par le client.
 * `?vue=page` (retour Lyes 2026-06-12) affiche la variante « tout sur une page »
 * pour comparaison ; sans le paramètre, le stepper 5 écrans reste le défaut.
 */
export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;
  // Jalon funnel PRD §5 (entrées tunnel ; rechargements comptés, volume brut).
  // after() : la mesure part APRÈS la réponse — un PostgREST lent ne retarde
  // jamais l'entrée du funnel (revue 2026-06-11).
  after(() => trackEvent("diagnostic_demarre"));
  return <Questionnaire onePage={vue === "page"} />;
}
