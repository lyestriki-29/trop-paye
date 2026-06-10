/** Date ISO "YYYY-MM-DD" → format long fr-FR (ex. « 15 juin 2024 »), fuseau UTC. */
export function frenchDate(iso: string): string {
  return new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
