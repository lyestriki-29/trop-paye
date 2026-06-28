import { Amount } from "@/components/Amount";
import { frenchDate } from "@/lib/format-date";
import type { DossierRow } from "@/lib/dossier/read";
import type { DossierSnapshot } from "@troppaye/rules-engine";

const PERIOD_LABEL: Record<string, string> = {
  BEFORE_1946: "Avant 1946",
  "1946_1970": "1946–1970",
  "1971_1990": "1971–1990",
  AFTER_1990: "Après 1990",
};

/**
 * Carte « Logement & bail » du back-office : les caractéristiques clés d'un dossier
 * (surface, pièces, type de bail, loyers) lues d'un coup d'œil pour juger une priorité,
 * sans ouvrir le détail du verdict (retour Lyes 2026-06-28). N'affiche que les champs
 * renseignés ; rien à montrer → la carte disparaît.
 */
export function DossierHousingCard({ dossier }: { dossier: DossierRow }) {
  const snap = (dossier.engine_snapshot ?? null) as unknown as DossierSnapshot | null;
  const surface = dossier.surface_m2 ?? snap?.surfaceM2 ?? null;
  const current = dossier.current_rent_cents ?? null;
  const initial = dossier.initial_rent_cents ?? null;
  const gap = current != null && initial != null ? current - initial : null;

  const rows: { label: string; value: React.ReactNode }[] = [];
  if (surface != null) rows.push({ label: "Surface", value: `${surface} m²` });
  if (snap?.roomCount != null) rows.push({ label: "Pièces", value: String(snap.roomCount) });
  if (snap?.furnished != null) rows.push({ label: "Meublé", value: snap.furnished ? "Oui" : "Non" });
  if (snap?.constructionPeriod) {
    rows.push({ label: "Construction", value: PERIOD_LABEL[snap.constructionPeriod] ?? snap.constructionPeriod });
  }
  if (snap?.leaseSignedAt) rows.push({ label: "Bail signé", value: frenchDate(snap.leaseSignedAt) });
  if (current != null) rows.push({ label: "Loyer actuel", value: <Amount cents={current} /> });
  if (initial != null) rows.push({ label: "Loyer de départ", value: <Amount cents={initial} /> });
  if (gap != null && gap !== 0) {
    rows.push({
      label: gap > 0 ? "Hausse de loyer" : "Baisse de loyer",
      value: <Amount cents={Math.abs(gap)} />,
    });
  }

  if (rows.length === 0) return null;

  return (
    <section className="mt-6 rounded-card border border-line bg-paper p-4 text-sm">
      <h2 className="font-display font-bold">Logement &amp; bail</h2>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-ink/70 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-3 border-b border-line/60 py-1 last:border-0">
            <dt>{r.label}</dt>
            <dd className="font-medium text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
