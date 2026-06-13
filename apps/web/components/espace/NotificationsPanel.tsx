import { frenchDate } from "@/lib/format-date";
import type { ActivityEvent } from "@/lib/espace/activity";

export function NotificationsPanel({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="w-80 rounded-card border border-line bg-paper p-4 shadow-lift">
      <p className="mb-3 font-display text-sm font-bold">Activité récente</p>
      {events.length === 0 ? (
        <p className="text-sm text-ink/55">Rien de neuf pour l'instant.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between gap-3 text-sm">
              <span>{e.label}</span>
              <span className="shrink-0 text-ink/45">{frenchDate(e.at)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-ink/40">« Marquer comme lu » arrive bientôt.</p>
    </div>
  );
}
