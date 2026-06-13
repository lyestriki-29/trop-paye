export interface ActivityEvent {
  id: string;
  at: string; // ISO
  kind: "action" | "message";
  label: string;
}

const ACTION_LABEL: Record<string, string> = {
  LETTER_J0: "Courrier de mise en demeure envoyé",
  REMINDER_J21: "Relance envoyée",
  PROPOSAL_J35: "Proposition transmise",
  FINAL_NOTICE_J50: "Dernière relance envoyée",
  LANDLORD_REPLY: "Réponse du bailleur reçue",
  ESCALATION: "Dossier escaladé",
  PAYMENT_RECEIVED: "Paiement reçu",
  PAYOUT_SENT: "Versement effectué",
};

export function buildActivityFeed(input: {
  actions: { type: string; scheduled_at: string | null; executed_at: string | null }[];
  messages: { id: string; sender: string; body: string; created_at: string }[];
}): ActivityEvent[] {
  const fromActions: ActivityEvent[] = input.actions
    .filter((a) => a.executed_at)
    .map((a) => ({
      id: `a-${a.type}-${a.executed_at}`,
      at: a.executed_at!,
      kind: "action" as const,
      label: ACTION_LABEL[a.type] ?? a.type,
    }));

  const fromMessages: ActivityEvent[] = input.messages
    .filter((m) => m.sender !== "client")
    .map((m) => ({
      id: `m-${m.id}`,
      at: m.created_at,
      kind: "message" as const,
      label: m.sender === "system" ? "Mise à jour automatique" : "Nouveau message de l'équipe",
    }));

  return [...fromActions, ...fromMessages].sort((x, y) => (x.at < y.at ? 1 : -1));
}
