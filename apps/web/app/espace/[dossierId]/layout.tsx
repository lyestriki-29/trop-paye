import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { requireAuthPage } from "@/lib/auth/guards";
import { buildStudyChecklist } from "@/lib/espace/study-checklist";
import { buildActivityFeed } from "@/lib/espace/activity";
import { EspaceHeader } from "@/components/espace/EspaceHeader";
import { NotificationsPanel } from "@/components/espace/NotificationsPanel";
import { ContactDialog } from "@/components/espace/ContactDialog";
import { WorkspaceTabs, type TabDef } from "@/components/espace/WorkspaceTabs";

export const dynamic = "force-dynamic";

export default async function DossierLayout({
  params,
  children,
}: {
  params: Promise<{ dossierId: string }>;
  children: React.ReactNode;
}) {
  const { user, supabase } = await requireAuthPage();
  const { dossierId } = await params;
  const detail = await loadOwnedDossier(dossierId);
  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle();

  const checklist = buildStudyChecklist(detail.pieces.map((p) => ({ kind: p.kind, status: p.status })));
  const needsPieces = detail.dossier.status === "MANDATE_PENDING" && !checklist.launchable;
  const needsMandate = detail.dossier.status === "DIAGNOSED";

  const feed = buildActivityFeed({
    actions: detail.actions.map((a) => ({ type: a.type, scheduled_at: a.scheduled_at, executed_at: a.executed_at })),
    messages: detail.messages.map((m) => ({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at })),
  });

  const tabs: TabDef[] = [
    { key: "apercu", label: "Aperçu", segment: "" },
    { key: "pieces", label: "Pièces", segment: "pieces", flag: needsPieces },
    { key: "mandat", label: "Mandat", segment: "mandat", flag: needsMandate },
    { key: "messages", label: "Messages", segment: "messages", flag: detail.messages.some((m) => m.sender !== "client") },
  ];

  // Fond crème hérité du scope `.nb` (layout racine espace) — pas de `bg-paper`
  // ici, sinon il masquerait la grille de points.
  return (
    <div>
      <EspaceHeader email={user.email ?? null} activityCount={feed.length} notifications={<NotificationsPanel events={feed} />} contact={<ContactDialog dossierId={dossierId} initialPhone={profile?.phone ?? ""} />} />
      <div className="mx-auto max-w-container px-4">
        <WorkspaceTabs dossierId={dossierId} tabs={tabs} />
        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
