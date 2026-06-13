const PIECE_LABEL: Record<string, string> = {
  bail: "Bail",
  quittance: "Quittance",
  dpe: "DPE",
  edl: "État des lieux",
  rib: "RIB",
  autre: "Autre document",
};

const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  RECEIVED: { text: "Reçue", tone: "text-ink/45" },
  VALIDATED: { text: "Validée", tone: "text-refund-text" },
  ILLEGIBLE: { text: "Illisible, à renvoyer", tone: "text-stamp" },
};

export function PieceRow({
  piece,
}: {
  piece: { id: string; kind: string; status: string; reason: string | null };
}) {
  const fallback = STATUS_LABEL["RECEIVED"] as { text: string; tone: string };
  const s: { text: string; tone: string } = STATUS_LABEL[piece.status] ?? fallback;
  return (
    <a
      href={`/api/pieces/${piece.id}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-field border border-line bg-paper px-4 py-3 text-sm hover:border-ink/40"
    >
      <span>{PIECE_LABEL[piece.kind] ?? piece.kind}</span>
      <span className={s.tone}>
        {s.text}
        {piece.status === "ILLEGIBLE" && piece.reason ? ` (${piece.reason})` : ""}
      </span>
    </a>
  );
}
