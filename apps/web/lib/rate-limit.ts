/**
 * Limiteur de débit EN MÉMOIRE — fenêtre glissante par clé.
 *
 * Limites assumées (à connaître avant de s'y fier) :
 * - L'état vit dans le processus Node : un redémarrage le remet à zéro, et en
 *   scale-out (plusieurs instances) chaque instance compte de son côté. Ce
 *   limiteur RALENTIT les abus, il ne les bloque pas de façon absolue.
 *   À remplacer par un compteur Postgres/Redis si l'app passe en multi-instances.
 * - Le verrou dur côté données reste l'index unique `leads(dossier_id)`
 *   (1 ligne par dossier, upsert idempotent) : même un contournement du
 *   limiteur ne peut pas multiplier les lignes.
 *
 * Pur au sens « zéro I/O » : horloge injectable (`now`), donc testable en
 * isolation via Vitest sans fake timers.
 */

/** Seules les requêtes AUTORISÉES sont enregistrées : ≤ `max` horodatages par clé. */
const buckets = new Map<string, number[]>();

/** Garde-fou mémoire : au-delà, on purge les clés dont la fenêtre est expirée. */
const MAX_KEYS = 10_000;

function sweep(cutoffNow: number, windowMs: number): void {
  for (const [key, stamps] of buckets) {
    const alive = stamps.filter((t) => t > cutoffNow - windowMs);
    if (alive.length === 0) buckets.delete(key);
    else buckets.set(key, alive);
  }
}

/**
 * `true` si la requête est autorisée (et la comptabilise), `false` si la clé a
 * déjà consommé `max` requêtes dans la fenêtre glissante `windowMs`.
 * Contrat : utiliser un `windowMs` CONSTANT pour une même clé (le sweep purge
 * avec la fenêtre de l'appelant courant).
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const cutoff = now - windowMs;
  const stamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (stamps.length >= max) {
    buckets.set(key, stamps); // garde la liste purgée, sans enregistrer le refus
    return false;
  }
  if (!buckets.has(key) && buckets.size >= MAX_KEYS) sweep(now, windowMs);
  stamps.push(now);
  buckets.set(key, stamps);
  return true;
}

/** Réinitialise tout l'état — réservé aux tests. */
export function resetRateLimit(): void {
  buckets.clear();
}
