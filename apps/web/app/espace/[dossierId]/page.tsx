import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { nextStep } from "@/lib/espace/next-step";
import { formatEur, RULE_LABEL } from "@troppaye/rules-engine";
import { VerdictCard } from "@/components/espace/VerdictCard";
import { KpiStrip } from "@/components/espace/KpiStrip";
import { DossierTimeline } from "@/components/espace/DossierTimeline";
import { NextStepRail } from "@/components/espace/NextStepRail";
import { StudyChecklist } from "@/components/espace/StudyChecklist";
import type { PieceStatus } from "@/lib/espace/study-checklist";

export const dynamic = "force-dynamic";

export default async function ApercuPage({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  const { dossier, verdict, actions, pieces } = await loadOwnedDossier(dossierId);
  const checklist = buildStudyChecklist(
    pieces.map((p) => ({ kind: p.kind, status: p.status as PieceStatus })),
  );
  const step = nextStep(dossier.status, dossierId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-display">
            {dossier.address_label ?? "Votre dossier"}
          </h1>
        </div>

        {verdict && verdict.totalRecoverableCents > 0 ? (
          <VerdictCard
            totalRecoverableCents={verdict.totalRecoverableCents}
            totalFutureMonthlySavingCents={verdict.totalFutureMonthlySavingCents}
            confidence={verdict.confidence}
            breakdown={verdict.results.map((r) => ({
              label: RULE_LABEL[r.ruleId] ?? r.ruleId,
              cents: r.recoverableCents,
            }))}
          />
        ) : null}

        <KpiStrip
          items={[
            {
              label: "Trop-perçu visé",
              value: formatEur(verdict?.totalRecoverableCents ?? 0),
              tone: "refund",
            },
            { label: "Confiance", value: verdict?.confidence ?? "—" },
            { label: "Statut", value: dossier.status },
          ]}
        />

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">Suivi de votre dossier</h2>
          <DossierTimeline
            status={dossier.status}
            actions={actions.map((a) => ({
              type: a.type,
              scheduled_at: a.scheduled_at,
              executed_at: a.executed_at,
            }))}
          />
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold">{"Checklist d'étude"}</h2>
          <StudyChecklist data={checklist} piecesHref={`/espace/${dossierId}/pieces`} />
        </section>
      </div>

      <aside>
        <NextStepRail text={step.text} href={step.href} cta={step.cta} />
      </aside>
    </div>
  );
}
