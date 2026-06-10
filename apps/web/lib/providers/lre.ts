/**
 * Port LRE (lettre recommandée électronique). V1 = MOCK : aucun courrier réel,
 * référence simulée, statut « livré » immédiat. Boutons admin « simuler » pilotent
 * le reste du cycle. Swap réel (AR24, Maileva…) = nouvelle impl du même port.
 */

export type LreStatus = "SENT" | "DELIVERED" | "FAILED";

export interface LreLetter {
  dossierId: string;
  kind: string; // action_type (LETTER_J0…)
  recipient: string; // bailleur (placeholder en mock)
}

export interface LreReceipt {
  ref: string;
  status: LreStatus;
}

export interface LreProvider {
  send(letter: LreLetter): Promise<LreReceipt>;
  getStatus(ref: string): Promise<LreStatus>;
}

class MockLreProvider implements LreProvider {
  async send(letter: LreLetter): Promise<LreReceipt> {
    return { ref: `MOCK-LRE-${letter.dossierId.slice(0, 8)}-${letter.kind}`, status: "SENT" };
  }
  async getStatus(): Promise<LreStatus> {
    return "DELIVERED";
  }
}

export function getLreProvider(): LreProvider {
  return new MockLreProvider();
}
