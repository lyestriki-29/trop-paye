import type { DossierStatus } from "@troppaye/shared";

export interface TimelineEvent {
  label: string;
  date?: string;
}

export interface Milestone {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
  events?: TimelineEvent[];
}

/** Rang ordinal pour comparer la progression (ESCALATED parallèle à RECOVERY). */
const RANK: Record<DossierStatus, number> = {
  DRAFT: 0,
  DIAGNOSED: 1,
  MANDATE_PENDING: 2,
  IN_REVIEW: 3,
  RECOVERY: 4,
  ESCALATED: 4,
  WON: 5,
  LOST: 5,
  CLOSED: 6,
};

const ACTION_LABEL: Record<string, string> = {
  LETTER_J0: "Mise en demeure amiable envoyée",
  REMINDER_J21: "Relance envoyée",
  PROPOSAL_J35: "Proposition de règlement envoyée",
  FINAL_NOTICE_J50: "Dernier avis envoyé",
  LANDLORD_REPLY: "Réponse du bailleur reçue",
  ESCALATION: "Dossier transmis pour escalade",
  PAYMENT_RECEIVED: "Paiement reçu",
  PAYOUT_SENT: "Reversement effectué",
};

export interface ActionLite {
  type: string;
  scheduled_at: string | null;
  executed_at: string | null;
}

/** Construit la frise « suivi de colis » d'un dossier (pur, déterministe). */
export function buildTimeline(status: DossierStatus, actions: ActionLite[]): Milestone[] {
  const rc = RANK[status];
  const stateFor = (r: number): Milestone["state"] =>
    rc > r ? "done" : rc === r ? "current" : "upcoming";

  const issueLabel =
    status === "WON"
      ? "Récupération réussie"
      : status === "LOST"
        ? "Clôturé sans suite"
        : "Issue du dossier";

  const events: TimelineEvent[] = actions
    .filter((a) => a.executed_at)
    .map((a) => ({
      label: ACTION_LABEL[a.type] ?? a.type,
      date: (a.executed_at ?? a.scheduled_at ?? undefined)?.slice(0, 10),
    }));

  return [
    { key: "diagnostic", label: "Diagnostic réalisé", state: stateFor(1) },
    { key: "mandat", label: "Mandat signé", state: stateFor(2) },
    { key: "etude", label: "Étude du dossier", state: stateFor(3) },
    { key: "demarche", label: "Démarche amiable engagée", state: stateFor(4), events },
    { key: "issue", label: issueLabel, state: stateFor(5) },
  ];
}
