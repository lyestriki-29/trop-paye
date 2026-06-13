export type PieceStatus = "RECEIVED" | "ILLEGIBLE" | "VALIDATED";

const VALID_PIECE_STATUSES = new Set<string>(["RECEIVED", "ILLEGIBLE", "VALIDATED"]);
export function narrowPieceStatus(s: string): PieceStatus {
  return VALID_PIECE_STATUSES.has(s) ? (s as PieceStatus) : "RECEIVED";
}
export type ChecklistKind = "bail" | "quittance";
export type ChecklistState = "missing" | "received" | "validated";

export interface ChecklistItem {
  kind: ChecklistKind;
  label: string;
  required: boolean;
  state: ChecklistState;
}

export interface StudyChecklist {
  items: ChecklistItem[];
  /** bail + quittance présents (RECEIVED ou VALIDATED) → étude lançable. */
  launchable: boolean;
}

const REQUIRED: { kind: ChecklistKind; label: string }[] = [
  { kind: "bail", label: "Bail signé" },
  { kind: "quittance", label: "Dernière quittance de loyer" },
];

function stateFor(
  pieces: { kind: string; status: PieceStatus }[],
  kind: ChecklistKind,
): ChecklistState {
  const mine = pieces.filter((p) => p.kind === kind);
  if (mine.some((p) => p.status === "VALIDATED")) return "validated";
  if (mine.some((p) => p.status === "RECEIVED")) return "received";
  return "missing";
}

export function buildStudyChecklist(
  pieces: { kind: string; status: PieceStatus }[],
): StudyChecklist {
  const items: ChecklistItem[] = REQUIRED.map(({ kind, label }) => ({
    kind,
    label,
    required: true,
    state: stateFor(pieces, kind),
  }));
  const launchable = items.every((i) => i.state !== "missing");
  return { items, launchable };
}
