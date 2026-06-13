import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { buildStudyChecklist, type PieceStatus } from "@/lib/espace/study-checklist";
import { PiecesDropzone } from "@/components/espace/PiecesDropzone";
import { PieceRow } from "@/components/espace/PieceRow";
import { StudyChecklist } from "@/components/espace/StudyChecklist";

export const dynamic = "force-dynamic";

export default async function PiecesPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { pieces } = await loadOwnedDossier(dossierId);
  const checklist = buildStudyChecklist(
    pieces.map((p) => ({ kind: p.kind, status: p.status as PieceStatus })),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Vos pièces</h1>
        <PiecesDropzone dossierId={dossierId} />
        {pieces.length > 0 ? (
          <ul className="space-y-2">
            {pieces.map((p) => (
              <li key={p.id}>
                <PieceRow piece={{ id: p.id, kind: p.kind, status: p.status, reason: p.reason }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/55">Aucune pièce déposée pour l'instant.</p>
        )}
      </div>
      <aside>
        <StudyChecklist data={checklist} piecesHref={`/espace/${dossierId}/pieces`} />
      </aside>
    </div>
  );
}
