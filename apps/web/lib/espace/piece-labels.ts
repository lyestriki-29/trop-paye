/**
 * Libellés FR des pièces justificatives — partagés entre l'espace client
 * (`PieceRow`) et le back-office (fiche dossier admin). Module pur (aucun I/O,
 * aucun composant) : importable côté serveur comme client. DRY : une seule
 * source de vérité pour le type et le statut d'une pièce.
 */

export const PIECE_KIND_LABEL: Record<string, string> = {
  bail: "Bail",
  quittance: "Quittance",
  dpe: "DPE",
  edl: "État des lieux",
  rib: "RIB",
  autre: "Autre document",
};

export const PIECE_STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  RECEIVED: { text: "Reçue", tone: "text-ink/45" },
  VALIDATED: { text: "Validée", tone: "text-refund-text" },
  ILLEGIBLE: { text: "Illisible, à renvoyer", tone: "text-stamp" },
};

/** Libellé FR d'un type de pièce (fallback : la valeur brute). */
export function pieceKindLabel(kind: string): string {
  return PIECE_KIND_LABEL[kind] ?? kind;
}

const FALLBACK_STATUS = { text: "Reçue", tone: "text-ink/45" } as const;

/** Libellé + ton FR d'un statut de pièce (fallback : « Reçue »). */
export function pieceStatusLabel(status: string): { text: string; tone: string } {
  return PIECE_STATUS_LABEL[status] ?? FALLBACK_STATUS;
}
