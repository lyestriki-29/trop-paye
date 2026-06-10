/** Sources officielles curées par thème — citées dans les brouillons d'articles. */
export interface SourceRef {
  label: string;
  url: string;
}

export const OFFICIAL_SOURCES: Record<string, SourceRef[]> = {
  dpe: [
    { label: "Loi 89-462 art. 17-1 (Légifrance)", url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043977085" },
    { label: "Interdiction de location (service-public.fr)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A17975" },
    { label: "ANIL — rénovation énergétique", url: "https://www.anil.org/parole-expert-logement-renovation-energetique/nouvelles-obligations-logements-etiquette-g/" },
  ],
  irl: [
    { label: "INSEE — série IRL 001515333", url: "https://www.insee.fr/fr/statistiques/serie/001515333" },
    { label: "ANIL — tableau de l'IRL", url: "https://www.anil.org/outils/indices-et-plafonds/tableau-de-lirl/" },
    { label: "Bouclier loyer (vie-publique.fr)", url: "https://www.vie-publique.fr/loi/289644-prolongation-plafonnement-hausse-des-loyers-loi-7-juillet-2023" },
  ],
  depot: [
    { label: "Loi 89-462 art. 22 — dépôt de garantie", url: "https://www.anil.org/parole-expert-logement-location-restitution-depot-garantie/" },
    { label: "Prescription art. 7-1 (Légifrance)", url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000028777184/" },
  ],
  encadrement: [
    { label: "Encadrement des loyers (service-public.fr)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1314" },
  ],
  default: [
    { label: "Service-public.fr — logement", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/N19808" },
  ],
};

export function sourcesForTopic(topic: string | null | undefined): SourceRef[] {
  return OFFICIAL_SOURCES[topic ?? "default"] ?? OFFICIAL_SOURCES.default!;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
