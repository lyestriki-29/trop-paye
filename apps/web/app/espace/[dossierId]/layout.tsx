import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { requireAuthPage } from "@/lib/auth/guards";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { EspaceHeader } from "@/components/espace/EspaceHeader";
import { WorkspaceTabs, type TabDef } from "@/components/espace/WorkspaceTabs";

export const dynamic = "force-dynamic";

export default async function DossierLayout({
  params,
  children,
}: {
  params: Promise<{ dossierId: string }>;
  children: React.ReactNode;
}) {
  const { user } = await requireAuthPage();
  const { dossierId } = await params;
  const detail = await loadOwnedDossier(dossierId);

  const checklist = buildStudyChecklist(detail.pieces.map((p) => ({ kind: p.kind, status: p.status })));
  const needsPieces = detail.dossier.status === "MANDATE_PENDING" && !checklist.launchable;
  const needsMandate = detail.dossier.status === "DIAGNOSED";

  const tabs: TabDef[] = [
    { key: "apercu", label: "Aperçu", segment: "" },
    { key: "pieces", label: "Pièces", segment: "pieces", flag: needsPieces },
    { key: "mandat", label: "Mandat", segment: "mandat", flag: needsMandate },
    { key: "messages", label: "Messages", segment: "messages" },
    { key: "versement", label: "Versement", segment: "versement" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <EspaceHeader email={user.email ?? null} activityCount={0} />
      <div className="mx-auto max-w-container px-4">
        <WorkspaceTabs dossierId={dossierId} tabs={tabs} />
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
