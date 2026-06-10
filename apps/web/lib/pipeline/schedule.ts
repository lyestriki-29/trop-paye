import { computeSchedule } from "@troppaye/shared";

export interface ScheduledAction {
  type: "LETTER_J0" | "REMINDER_J21" | "PROPOSAL_J35" | "FINAL_NOTICE_J50";
  scheduled_at: string; // ISO date
}

/** Séquence de relance J0/J21/J35/J50 (jours calendaires Europe/Paris) à partir de J0. */
export function actionScheduleFor(j0ISO: string): ScheduledAction[] {
  const s = computeSchedule(j0ISO);
  return [
    { type: "LETTER_J0", scheduled_at: s.j0 },
    { type: "REMINDER_J21", scheduled_at: s.j21 },
    { type: "PROPOSAL_J35", scheduled_at: s.j35 },
    { type: "FINAL_NOTICE_J50", scheduled_at: s.j50 },
  ];
}
