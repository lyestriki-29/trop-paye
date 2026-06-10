/**
 * Port paiements / compte dédié (R124). V1 = MOCK : aucun euro réel, références
 * simulées. La répartition (locataire / commission) et l'écriture des `fund_movements`
 * restent dans la couche action ; le port ne fait que produire une référence.
 */

export interface PaymentReceipt {
  reference: string;
}

export interface PaymentProvider {
  /** Encaissement entrant simulé (le bailleur a payé). */
  recordIncoming(dossierId: string, amountCents: number): Promise<PaymentReceipt>;
  /** Reversement simulé vers le locataire. */
  payout(dossierId: string, amountCents: number): Promise<PaymentReceipt>;
}

class MockPaymentProvider implements PaymentProvider {
  async recordIncoming(dossierId: string, amountCents: number): Promise<PaymentReceipt> {
    return { reference: `MOCK-IN-${dossierId.slice(0, 8)}-${amountCents}` };
  }
  async payout(dossierId: string, amountCents: number): Promise<PaymentReceipt> {
    return { reference: `MOCK-OUT-${dossierId.slice(0, 8)}-${amountCents}` };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
