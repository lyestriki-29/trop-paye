import { pieceKindLabel, pieceStatusLabel } from "@/lib/espace/piece-labels";

export function PieceRow({
  piece,
}: {
  piece: { id: string; kind: string; status: string; reason: string | null };
}) {
  const s = pieceStatusLabel(piece.status);
  return (
    <a
      href={`/api/pieces/${piece.id}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-field border border-line bg-paper px-4 py-3 text-sm hover:border-ink/40"
    >
      <span>{pieceKindLabel(piece.kind)}</span>
      <span className={s.tone}>
        {s.text}
        {piece.status === "ILLEGIBLE" && piece.reason ? ` (${piece.reason})` : ""}
      </span>
    </a>
  );
}
