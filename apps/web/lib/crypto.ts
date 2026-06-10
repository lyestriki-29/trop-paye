import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Crypto applicative — SERVEUR uniquement (utilise des secrets d'env).
 * Chiffrement des pièces sensibles (AES-256-GCM) + empreintes/HMAC de la
 * preuve de signature. Jamais importé côté client.
 */

const IV_LEN = 12; // GCM standard
const TAG_LEN = 16;

/** Dérive une clé 32 octets : hex 64 chars accepté tel quel, sinon SHA-256 de la passphrase. */
function pieceKey(): Buffer {
  const raw = env.PIECES_ENCRYPTION_KEY;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return createHash("sha256").update(raw, "utf8").digest();
}

/** Chiffre un buffer. Sortie auto-portée : `iv | authTag | ciphertext`. */
export function encryptBytes(plain: Buffer): Buffer {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", pieceKey(), iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]);
}

/** Déchiffre un buffer produit par `encryptBytes` (lève si l'authTag est invalide). */
export function decryptBytes(blob: Buffer): Buffer {
  const iv = blob.subarray(0, IV_LEN);
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = blob.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv("aes-256-gcm", pieceKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/** Empreinte SHA-256 hex (figeage du document signé). */
export function sha256Hex(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** Preuve d'intégrité de la signature : HMAC(SIGNATURE_SECRET, payload). */
export function signatureHmac(payload: string): string {
  return createHmac("sha256", env.SIGNATURE_SECRET).update(payload).digest("hex");
}
