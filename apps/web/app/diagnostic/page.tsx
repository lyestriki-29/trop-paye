import { trackEvent } from "@/lib/track";
import { Questionnaire } from "./questionnaire/Questionnaire";

export const dynamic = "force-dynamic";

/** Tunnel diagnostic — le chrome allégé (logo + étape) est rendu par le client. */
export default async function DiagnosticPage() {
  // Jalon funnel PRD §5 (entrées tunnel ; les rechargements comptent — les
  // jalons aval se dédupliquent par dossier_id, celui-ci reste un volume brut).
  await trackEvent("diagnostic_demarre");
  return <Questionnaire />;
}
