import { sha256Hex, signatureHmac } from "@/lib/crypto";

/**
 * Port de signature. V1 = implémentation MAISON (eIDAS « simple » / SES) :
 * consentement explicite + figeage du PDF (SHA-256) + preuve HMAC scellée.
 * Opposabilité = [AVOCAT]. Swap futur (Yousign…) = nouvelle impl du même port.
 */

export interface SignatureConsent {
  signerName: string;
  ip?: string;
  userAgent?: string;
  consentedAt: string; // ISO
}

export interface SignatureProof {
  signerName: string;
  documentHash: string; // sha256 du PDF figé
  proofHmac: string; // HMAC(SIGNATURE_SECRET, payload canonique)
  ip?: string;
  userAgent?: string;
  consentedAt: string;
}

export interface SignatureProvider {
  sign(pdf: Buffer, consent: SignatureConsent): SignatureProof;
}

class HouseSignatureProvider implements SignatureProvider {
  sign(pdf: Buffer, consent: SignatureConsent): SignatureProof {
    const documentHash = sha256Hex(pdf);
    // Payload canonique scellé : tout changement (doc, signataire, instant) invalide la preuve.
    const payload = JSON.stringify({
      documentHash,
      signerName: consent.signerName,
      consentedAt: consent.consentedAt,
    });
    return {
      signerName: consent.signerName,
      documentHash,
      proofHmac: signatureHmac(payload),
      ip: consent.ip,
      userAgent: consent.userAgent,
      consentedAt: consent.consentedAt,
    };
  }
}

export function getSignatureProvider(): SignatureProvider {
  return new HouseSignatureProvider();
}
