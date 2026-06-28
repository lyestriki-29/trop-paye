import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getLeadsQueue } from "@/lib/admin/leads-queue";

export const dynamic = "force-dynamic";

/** Ordre du funnel (PRD §5) + jauges DPE. `distinct` = dédupliqué par dossier. */
const STEPS: ReadonlyArray<{ event: string; label: string; distinct: boolean }> = [
  { event: "diagnostic_demarre", label: "Diagnostics démarrés (brut)", distinct: false },
  { event: "verdict_affiche", label: "Verdicts affichés", distinct: true },
  { event: "email_capture", label: "Emails capturés", distinct: true },
  { event: "waitlist_rejointe", label: "Liste d'attente pilote", distinct: true },
  { event: "mandat_signe", label: "Mandats signés", distinct: true },
  { event: "j0_envoye", label: "J0 postés", distinct: true },
  { event: "encaisse", label: "Encaissés", distinct: true },
  { event: "reverse", label: "Reversés", distinct: true },
];

async function countEvent(event: string, distinct: boolean): Promise<number> {
  const admin = getSupabaseAdmin();
  if (!distinct) {
    const { count } = await admin
      .from("funnel_events")
      .select("id", { count: "exact", head: true })
      .eq("event", event);
    return count ?? 0;
  }
  // Volume pilote (centaines de lignes) : dédup en mémoire, pas besoin de RPC.
  const { data } = await admin.from("funnel_events").select("dossier_id").eq("event", event);
  return new Set((data ?? []).map((r) => r.dossier_id).filter(Boolean)).size;
}

/** Tableau de bord pilote : les chiffres du PRD §1/§5, lus en 10 secondes le lundi. */
export default async function FunnelPage() {
  const counts = await Promise.all(STEPS.map((s) => countEvent(s.event, s.distinct)));
  const [dpeFound, dpeMissed] = await Promise.all([
    countEvent("dpe_match_found", false),
    countEvent("dpe_match_missed", false),
  ]);
  const dpeTotal = dpeFound + dpeMissed;
  const dpeRate = dpeTotal > 0 ? Math.round((dpeFound / dpeTotal) * 100) : null;

  const admin = getSupabaseAdmin();
  const { data: recent } = await admin
    .from("funnel_events")
    .select("event, src, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  // File de recontact COMPLÈTE : tous les leads capturés (anonymes inclus) — cf. lib/admin/leads-queue.
  const leadsQueue = await getLeadsQueue();

  // Liste d'attente ACTIONNABLE (revue 2026-06-11) : la promesse « on vous
  // recontacte sous 7 jours » a besoin d'une liste, pas d'un compteur.
  const { data: waitEvents } = await admin
    .from("funnel_events")
    .select("dossier_id, created_at")
    .eq("event", "waitlist_rejointe")
    .order("created_at", { ascending: true });
  const waitIds = [...new Set((waitEvents ?? []).map((e) => e.dossier_id).filter(Boolean))] as string[];
  const firstSeen = new Map<string, string>();
  for (const e of waitEvents ?? []) {
    if (e.dossier_id && !firstSeen.has(e.dossier_id)) firstSeen.set(e.dossier_id, e.created_at);
  }
  const [{ data: waitDossiers }, { data: waitLeads }] = waitIds.length
    ? await Promise.all([
        admin.from("dossiers").select("id, status, address_label").in("id", waitIds),
        admin.from("leads").select("dossier_id, email, phone").in("dossier_id", waitIds),
      ])
    : [{ data: [] }, { data: [] }];
  const leadByDossier = new Map((waitLeads ?? []).map((l) => [l.dossier_id, l]));
  // Encore DIAGNOSED = pas converti : c'est la file de recontact.
  const waitlist = (waitDossiers ?? [])
    .filter((d) => d.status === "DIAGNOSED")
    .map((d) => ({
      id: d.id,
      address: d.address_label ?? "Adresse inconnue",
      email: leadByDossier.get(d.id)?.email ?? null,
      phone: leadByDossier.get(d.id)?.phone ?? null,
      since: firstSeen.get(d.id) ?? null,
    }))
    .sort((a, b) => (a.since ?? "").localeCompare(b.since ?? ""));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-display">Funnel</h1>
        <Link href="/admin" className="text-sm text-ink/70 underline underline-offset-4 hover:text-ink">
          ← File de revue
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Événements first-party côté serveur (zéro cookie tiers, zéro PII). Jalons
        dédupliqués par dossier ; « diagnostics démarrés » reste un volume brut.
      </p>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={s.event} className="bg-paper px-5 py-4">
            <dd className="tabular font-display text-2xl font-extrabold">{counts[i]}</dd>
            <dt className="mt-1 text-xs text-ink/55">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-card border border-line bg-paper px-5 py-4">
        <p className="text-sm">
          <span className="font-bold">Matching DPE</span> (jauge n°1, cible ≥ 60 %) :{" "}
          {dpeRate === null ? (
            <span className="text-ink/50">aucune recherche encore</span>
          ) : (
            <span className={`tabular font-mono ${dpeRate >= 60 ? "text-refund-text" : "text-stamp"}`}>
              {dpeRate} % ({dpeFound}/{dpeTotal})
            </span>
          )}
        </p>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">
        Leads capturés : à recontacter ({leadsQueue.length})
      </h2>
      <p className="mt-1 text-sm text-ink/55">
        Tous les emails laissés après le verdict (table leads, capture anonyme).
        Les plus anciens d&apos;abord.
      </p>
      <ul className="mt-3 space-y-2">
        {leadsQueue.map((l) => (
          <li
            key={l.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card border border-line bg-paper px-4 py-3 text-sm"
          >
            <span className="tabular font-mono text-xs text-ink/45">
              {l.since?.slice(0, 10) ?? "?"}
            </span>
            <Link
              href={`/admin/dossiers/${l.id}`}
              className="font-medium underline-offset-2 hover:underline"
            >
              {l.address}
            </Link>
            {l.status ? (
              <span className="rounded-badge bg-accent/40 px-2 py-0.5 font-mono text-xs">
                {l.status}
              </span>
            ) : null}
            <a href={`mailto:${l.email}`} className="font-mono text-xs text-refund-text">
              {l.email}
            </a>
            {l.phone ? (
              <span className="tabular font-mono text-xs text-ink/55">{l.phone}</span>
            ) : null}
          </li>
        ))}
        {leadsQueue.length === 0 ? (
          <li className="text-sm text-ink/50">Aucun lead capturé pour l&apos;instant.</li>
        ) : null}
      </ul>

      <h2 className="mt-8 font-display text-lg font-bold">
        Liste d&apos;attente pilote : à recontacter ({waitlist.length})
      </h2>
      <p className="mt-1 text-sm text-ink/55">
        Promesse affichée au locataire : recontact sous 7 jours. Les plus anciens d&apos;abord.
      </p>
      <ul className="mt-3 space-y-2">
        {waitlist.map((w) => (
          <li
            key={w.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card border border-line bg-paper px-4 py-3 text-sm"
          >
            <span className="tabular font-mono text-xs text-ink/45">
              {w.since?.slice(0, 10) ?? "?"}
            </span>
            <Link
              href={`/admin/dossiers/${w.id}`}
              className="font-medium underline-offset-2 hover:underline"
            >
              {w.address}
            </Link>
            {w.email ? (
              <a href={`mailto:${w.email}`} className="font-mono text-xs text-refund-text">
                {w.email}
              </a>
            ) : (
              <span className="font-mono text-xs text-stamp">sans email ?!</span>
            )}
            {w.phone ? <span className="tabular font-mono text-xs text-ink/55">{w.phone}</span> : null}
          </li>
        ))}
        {waitlist.length === 0 ? (
          <li className="text-sm text-ink/50">Personne en attente pour l&apos;instant.</li>
        ) : null}
      </ul>

      <h2 className="mt-8 font-display text-lg font-bold">Derniers événements</h2>
      <ul className="mt-3 space-y-1">
        {(recent ?? []).map((e, i) => (
          // Liste read-only sans id naturel : l'index suffit.
          <li key={i} className="flex items-center gap-3 font-mono text-xs text-ink/70">
            <span className="tabular text-ink/45">{e.created_at?.slice(0, 16).replace("T", " ")}</span>
            <span className="font-medium">{e.event}</span>
            {e.src ? <span className="rounded-badge bg-accent/40 px-2 py-0.5">src: {e.src}</span> : null}
          </li>
        ))}
        {(recent ?? []).length === 0 ? (
          <li className="text-sm text-ink/50">Aucun événement pour l&apos;instant.</li>
        ) : null}
      </ul>
    </div>
  );
}
