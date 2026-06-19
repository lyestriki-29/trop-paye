import type { Metadata } from "next";
import { PublicShell } from "@/components/ui/PublicShell";

export const metadata: Metadata = {
  title: "Mentions légales — TropPayé",
  description: "Mentions légales, CGV, confidentialité et politique cookies de TropPayé.",
  alternates: { canonical: "/legal" },
  robots: { index: false },
};

/**
 * Page légale — SQUELETTE [AVOCAT]. Structure définitive (issue d'une recherche
 * de conformité : LCEN art. 1-1, C. conso médiation L612-1, CPCE R124 recouvrement
 * amiable, rétractation L221-18, doctrine cookies CNIL). Aucun texte juridique
 * définitif : tout {PLACEHOLDER} est une donnée à figer, tout bloc [AVOCAT] doit
 * être rédigé/validé par un juriste AVANT mise en ligne. robots:noindex conservé.
 */

/** Mentions d'identification de l'éditeur (LCEN art. 1-1 ; C. com.). */
const EDITEUR: ReadonlyArray<[string, string]> = [
  ["Dénomination", "{RAISON_SOCIALE} (SAS)"],
  ["Capital social", "{CAPITAL} €"],
  ["Siège social", "{ADRESSE_SIEGE}"],
  ["RCS", "{VILLE_RCS} {N°_RCS}"],
  ["SIREN", "{SIREN}"],
  ["TVA intracom.", "{TVA_INTRACOM}"],
  ["Contact", "{EMAIL_CONTACT} · {TELEPHONE}"],
  ["Directeur de la publication", "{NOM_DIRECTEUR_PUBLICATION}"],
];

/** Clauses à couvrir par les CGV (mandat de recouvrement amiable, B2C à distance). */
const CGV_CLAUSES = [
  "Objet du mandat (détection + recouvrement amiable du trop-perçu)",
  "Périmètre et exclusions (amiable uniquement, pas de représentation en justice)",
  "Rémunération : 25 % du trop-perçu effectivement récupéré, aucun frais sans récupération",
  "Droit de rétractation 14 jours (art. L221-18 C. conso) + formulaire type",
  "Exécution avant la fin du délai de rétractation (art. L221-25)",
  "Durée, résiliation, révocation du mandat",
  "Obligations du mandant, responsabilité (obligation de moyens)",
  "Réclamations et médiation, données personnelles, droit applicable",
];

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 border-t-3 border-nb-ink pt-10">
      <h2 className="text-[clamp(22px,3vw,34px)]">{title}</h2>
      <div className="mt-5 font-nb-body leading-relaxed text-nb-ink/80">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <p className="nb-mono text-xs font-semibold uppercase tracking-widest text-nb-ink/55">
          TropPayé · Informations légales
        </p>
        <h1 className="mt-4 text-[clamp(36px,6vw,72px)]">Mentions légales</h1>

        {/* Copy deck §5 — bandeau information ≠ conseil, mot pour mot. [AVOCAT] */}
        <p className="mt-8 border-3 border-nb-ink bg-accent p-4 font-nb-body text-sm font-medium shadow-nb-sm">
          Notre équipe vous informe sur la procédure mais ne peut pas vous donner de conseil
          juridique personnalisé.
        </p>

        <LegalSection id="mentions" title="Éditeur">
          <dl className="grid gap-2">
            {EDITEUR.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-nb-ink/15 pb-2">
                <dt className="nb-mono text-[11px] uppercase tracking-wider text-nb-ink/55">{k}</dt>
                <dd className="tabular text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            [AVOCAT] · {"{PLACEHOLDERS}"} à figer avant mise en ligne (LCEN art. 1-1).
          </p>
        </LegalSection>

        <LegalSection id="hebergeur" title="Hébergeur">
          <p>
            Site hébergé par {"{HEBERGEUR_NOM}"}, {"{HEBERGEUR_ADRESSE}"}, {"{HEBERGEUR_TEL}"}.
            Hébergement des données : {"{HEBERGEUR_DONNEES}"}.
          </p>
          <p className="mt-3 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            TODO_VERIFIER · localisation réelle des données (impacte RGPD). [AVOCAT]
          </p>
        </LegalSection>

        <LegalSection id="activite" title="Cadre d'activité et garanties">
          <p>
            {"{RAISON_SOCIALE}"} exerce une activité de recouvrement amiable de créances pour le
            compte d&apos;autrui (art. R124-1 et s. du Code des procédures civiles d&apos;exécution),
            déclarée auprès du procureur de la République de {"{VILLE_TJ}"}. Assurance RC
            professionnelle : {"{ASSUREUR}"} (couverture {"{ZONE_COUVERTURE}"}). Les fonds encaissés
            pour le compte des locataires sont reçus sur un compte bancaire dédié (art. R124-2 CPCE).
          </p>
          <p className="mt-3 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            [AVOCAT] · base = CPCE (pas C. assurances) ; déclaration procureur + RC + compte dédié
            requis avant ouverture.
          </p>
        </LegalSection>

        <LegalSection id="mediation" title="Médiateur de la consommation">
          <p>
            Conformément aux art. L611-1 et s. du Code de la consommation, vous pourrez recourir
            gratuitement au médiateur {"{NOM_MEDIATEUR}"} ({"{URL_SITE_MEDIATEUR}"}), après
            réclamation écrite restée sans réponse satisfaisante. Pour un litige transfrontalier au
            sein de l&apos;UE : Centre Européen des Consommateurs France.
          </p>
          <p className="mt-3 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            [AVOCAT] · adhésion à un médiateur agréé à finaliser. La plateforme RLL européenne est
            fermée (2025), ne plus l&apos;afficher.
          </p>
        </LegalSection>

        <LegalSection id="cgu" title="Conditions générales (CGV)">
          <p>Le contrat de mandat couvrira notamment :</p>
          <ul className="mt-3 space-y-2">
            {CGV_CLAUSES.map((c) => (
              <li key={c} className="flex gap-3 text-sm">
                <span aria-hidden className="text-refund">▪</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            [AVOCAT] · rédaction intégrale par l&apos;avocat conseil avant l&apos;ouverture du service.
          </p>
        </LegalSection>

        <LegalSection id="confidentialite" title="Données personnelles">
          <p>
            Le traitement de vos données (finalités, bases légales, durées, destinataires, droits,
            réclamation CNIL) sera détaillé dans notre politique de confidentialité. Les pièces
            sensibles sont chiffrées et la suppression est mise en cascade.
          </p>
          <p className="mt-3 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            [AVOCAT] · politique de confidentialité dédiée à rédiger (RGPD art. 13/14).
          </p>
        </LegalSection>

        <LegalSection id="cookies" title="Cookies et mesure d'audience">
          <p>
            Ce site n&apos;utilise que les traceurs strictement nécessaires et une mesure
            d&apos;audience configurée pour être exemptée de consentement (CNIL). Aucun traceur
            publicitaire n&apos;est déposé.
          </p>
          <p className="mt-3 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
            TODO_VERIFIER · confirmer que l&apos;outil d&apos;analytics est bien exempté CNIL.
          </p>
        </LegalSection>

        <p className="mt-12 nb-mono text-[11px] uppercase tracking-wider text-nb-ink/45">
          Dernière mise à jour : {"{DATE_MAJ}"}
        </p>
      </div>
    </PublicShell>
  );
}
