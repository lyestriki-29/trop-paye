import type { Metadata } from "next";
import { brand } from "@troppaye/shared";
import {
  CASE_REGISTRY,
  stripInternalMarkers,
  type CaseDetectability,
  type LegalBasisStatus,
} from "@troppaye/rules-engine";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteHeader } from "@/components/ui/SiteHeader";

/** Statique : générée depuis le registre de cas du moteur (source unique). */
export const dynamic = "force-static";

export const metadata: Metadata = {
  /* TODO_COPY — title/description SEO à valider. */
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
  VERIFIED: { text: "Base vérifiée", tone: "text-refund-text" },
  TODO_VERIFIER: { text: "Valeurs en cours de vérification", tone: "text-ink/55" },
  AVOCAT_PENDING: { text: "En attente de validation juridique", tone: "text-ink/55" },
};

/**
 * « Méthode & sources » (backlog #12) — générée depuis CASE_REGISTRY : chaque
 * cas du moteur, sa détectabilité, sa base légale et son statut, sans boîte
 * noire. Le contrat CaseDefinition exige label + legalBasis : tout nouveau cas
 * apparaît ici automatiquement.
 */
export default function MethodePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-16">
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-display sm:text-[40px]">
          Méthode &amp; sources
        </h1>
        {/* TODO_COPY — chapeau éditorial à valider ; squelette factuel en attendant. */}
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink/70">
          Chaque vérification de notre moteur est listée ici, avec sa base légale et son
          statut de validation. Cette page est générée depuis le code du moteur : ce que
          vous lisez est ce qui tourne.
        </p>

        <ul className="mt-10 space-y-4">
          {CASE_REGISTRY.map((c) => (
            <li key={c.id} className="rounded-card border border-line bg-paper p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display font-bold">{c.label}</h2>
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink/45">
                  {c.id}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                {stripInternalMarkers(c.legalBasis)}
              </p>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink/60">
                <div className="flex gap-1.5">
                  <dt className="font-medium">Nature :</dt>
                  <dd>{DETECT_LABEL[c.detectability]}</dd>
                </div>
                {c.prescriptionWindowYears ? (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">Fenêtre :</dt>
                    <dd>{c.prescriptionWindowYears} ans</dd>
                  </div>
                ) : null}
                <div className="flex gap-1.5">
                  <dt className="font-medium">Statut :</dt>
                  <dd className={STATUS_LABEL[c.legalBasisStatus].tone}>
                    {STATUS_LABEL[c.legalBasisStatus].text}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <p className="mt-10 rounded-card border border-line bg-paper-2 p-4 text-sm text-ink/60">
          {brand.disclaimer}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
