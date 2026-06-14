import { after } from "next/server";
import { trackEvent } from "@/lib/track";
import { GuidedTunnel } from "./questionnaire/GuidedTunnel";

export const dynamic = "force-dynamic";

/**
 * Tunnel diagnostic — bascule sur GuidedTunnel (graphe de questions).
 * Jalon funnel PRD §5 (entrées tunnel ; rechargements comptés, volume brut).
 * after() : la mesure part APRÈS la réponse — un PostgREST lent ne retarde
 * jamais l'entrée du funnel (revue 2026-06-11).
 */
export default function DiagnosticPage() {
  after(() => trackEvent("diagnostic_demarre"));
  return (
    <div className="nb">
      <GuidedTunnel />
    </div>
  );
}
