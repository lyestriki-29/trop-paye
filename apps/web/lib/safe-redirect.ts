/**
 * Garantit qu'un paramètre de redirection reste un chemin relatif same-origin
 * (anti open-redirect). Rejette les URLs absolues, protocol-relative (//evil)
 * et les échappements (/\evil).
 */
export function safeRelativePath(next: string | null | undefined, fallback = "/espace"): string {
  if (!next) return fallback;
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  return fallback;
}
