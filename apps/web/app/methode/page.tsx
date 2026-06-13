import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import {
  CASE_REGISTRY,
  stripInternalMarkers,
  type CaseDetectability,
  type LegalBasisStatus,
} from "@troppaye/rules-engine";
import { PageHeroNb } from "@/components/public/PageHeroNb";
import { PublicShell } from "@/components/ui/PublicShell";

/** Statique : générée depuis le registre de cas du moteur (source unique). */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Méthode et sources — TropPayé",
  description:
    "Chaque vérification du moteur TropPayé, sa base légale et son statut de validation. Aucune boîte noire.",
  alternates: { canonical: "/methode" },
};

const DETECT_LABEL: Record<CaseDetectability, string> = {
  COMPUTED: "Chiffrée automatiquement",
  DECLARED_SIGNAL: "Signal de revue (jamais chiffré)",
  ESCALATION: "Orientation judiciaire (jamais chiffrée)",
};

/** Transparence assumée : on AFFICHE quand une base est en cours de vérification. */
const STATUS_LABEL: Record<LegalBasisStatus, { text: string; tone: string }> = {
  VERIFIED: { text: "Base vérifiée", tone: "text-refund" },
  TODO_VERIFIER: { text: "Valeurs en cours de vérification", tone: "text-nb-ink/55" },
  AVOCAT_PENDING: { text: "En attente de validation juridique", tone: "text-nb-ink/55" },
};

/**
 * « Méthode & sources » — générée depuis CASE_REGISTRY (DA néubrutaliste) :
 * chaque cas du moteur, sa détectabilité, sa base légale et son statut, sans
 * boîte noire. Tout nouveau cas apparaît ici automatiquement.
 */
export default function MethodePage() {
  return (
    <PublicShell>
      <PageHeroNb
        kicker="TropPayé · Transparence"
        title={
          <>
            Méthode &amp; <span className="nb-mark">sources</span>
          </>
        }
        lede="Chaque vérification de notre moteur est listée ici, avec sa base légale et son statut. Cette page est générée depuis le code du moteur : ce que vous lisez est ce qui tourne."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ul className="space-y-5">
            {CASE_REGISTRY.map((c) => (
              <li key={c.id} className="nb-card p-6 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-xl">{c.label}</h2>
                  <span className="nb-mono text-[11px] uppercase tracking-widest text-nb-ink/45">
                    {c.id}
                  </span>
                </div>
                <p className="mt-3 font-nb-body text-sm leading-relaxed text-nb-ink/75">
                  {stripInternalMarkers(c.legalBasis)}
                </p>
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/60">
                  <div className="flex gap-1.5">
                    <dt className="font-semibold">Nature :</dt>
                    <dd>{DETECT_LABEL[c.detectability]}</dd>
                  </div>
                  {c.prescriptionWindowYears ? (
                    <div className="flex gap-1.5">
                      <dt className="font-semibold">Fenêtre :</dt>
                      <dd>{c.prescriptionWindowYears} ans</dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1.5">
                    <dt className="font-semibold">Statut :</dt>
                    <dd className={STATUS_LABEL[c.legalBasisStatus].tone}>
                      {STATUS_LABEL[c.legalBasisStatus].text}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <p className="mt-10 border-3 border-nb-ink bg-paper p-5 nb-mono text-xs leading-relaxed text-nb-ink/60 shadow-nb-sm">
            {brand.disclaimer}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
