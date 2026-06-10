# Business Plan v2 — TropPayé
### Plateforme d'accompagnement complet : détection du loyer irrégulier + récupération du trop-perçu pour le compte du locataire, rémunérée au succès

*Version 2.0 — Juin 2026 — remplace la v1 (modèle dossier payant)*

---

## 1. Résumé exécutif

TropPayé détecte automatiquement les loyers irréguliers et **récupère l'argent à la place du locataire**. Le locataire vérifie gratuitement son loyer en deux minutes ; si une irrégularité est détectée (augmentation illégale sur un logement DPE F/G, dépassement de plafond d'encadrement, augmentation supérieure à l'IRL, complément de loyer abusif), il signe un mandat en ligne et TropPayé prend tout en charge : courriers, relances, négociation amiable standardisée, encaissement du remboursement et reversement. **Le locataire ne paie rien d'avance : TropPayé se rémunère par une commission de 25 % sur les sommes effectivement récupérées** (trop-perçu remboursé + économie de loyer la première année suivant la régularisation).

Ce modèle « no win, no fee » lève le principal frein du marché : le locataire lésé n'a ni le temps, ni les connaissances, ni l'envie de se battre, et ne veut surtout pas payer pour un résultat incertain. Il aligne parfaitement les intérêts : la plateforme ne gagne que si le locataire gagne.

Le cadre juridique est balisé par deux fondements éprouvés. D'une part, la jurisprudence Demanderjustice (Cass. crim., 21 mars 2017) : l'envoi de courriers types complétés par l'utilisateur et la préparation de saisines ne constituent pas un exercice illégal du droit. D'autre part, le statut de **recouvrement amiable de créances pour le compte d'autrui** (art. R124-1 et s. du Code des procédures civiles d'exécution), une activité encadrée mais ouverte, qui autorise expressément à relancer, recevoir les fonds et les reverser, sous trois conditions simples : convention écrite avec le créancier (le locataire), assurance RC professionnelle, compte bancaire dédié, et déclaration préalable au procureur de la République. Tout ce qui exige une appréciation juridique d'un cas d'espèce ou un contentieux est transmis à des avocats partenaires.

Marché : 1,1 million de passoires thermiques en location privée soumises au gel des loyers, plus d'un tiers des baux non conformes dans les villes encadrées, et un taux de recours actuel quasi nul. Préjudice moyen estimé par dossier : 800 à 2 000 €, soit une commission moyenne de 200 à 500 € par dossier gagné.

Objectif à 3 ans : 6 000 dossiers gagnés par an, environ 1,6 M€ de chiffre d'affaires. Besoin de financement initial : 18 000 à 30 000 €, autofinançable, le développement étant réalisé par le fondateur.

---

## 2. Problème et solution

### Le problème (rappel synthétique)

Des centaines de milliers de locataires paient un loyer irrégulier sans le savoir : gel des loyers DPE F/G ignoré par les bailleurs depuis août 2022, plafonds d'encadrement dépassés dans plus d'un tiers des nouveaux baux, révisions IRL mal calculées, compléments de loyer injustifiés. Le contrôle public repose sur le signalement des locataires, qui n'agissent presque jamais : ils ne savent pas qu'ils sont lésés, et quand ils le savent, la procédure les dissuade (courriers, conciliation, peur du conflit avec le propriétaire, peur de payer pour rien).

### La solution : « on vérifie, on récupère, vous ne payez que si ça marche »

**Étape 1 — Diagnostic gratuit (2 min).** Adresse + loyer + dates → croisement automatique avec la base DPE de l'ADEME, les plafonds d'encadrement, l'IRL et les règles applicables à la date du bail. Verdict chiffré immédiat : « Irrégularité probable. Trop-perçu estimé : 1 420 €. Économie future : 65 €/mois. »

**Étape 2 — Mandat en ligne (5 min).** Le locataire téléverse son bail, ses quittances et son DPE (ou la plateforme le récupère), vérifie le récapitulatif et signe électroniquement deux documents : le mandat de recouvrement amiable (convention écrite exigée par R124-2, avec pouvoir de recevoir les fonds) et l'acceptation du barème (25 % au succès, 0 € sinon). Une revue humaine valide le dossier avant lancement (qualité de la détection = réputation).

**Étape 3 — Recouvrement amiable par TropPayé.** Séquence standardisée : courrier de réclamation en recommandé (J0), relance (J+21), proposition de régularisation amiable avec échéancier possible (J+35), dernier avis avant transmission (J+50). Tous les courriers sont des modèles éprouvés, sans argumentation juridique sur mesure. Le bailleur règle sur le compte dédié ; TropPayé reverse au locataire sous 7 jours, commission déduite. Le locataire suit tout en temps réel depuis son espace.

**Étape 4 — Escalade encadrée.** Si le bailleur conteste sur le fond (DPE contesté, travaux, complément de loyer défendu) ou ne répond pas : transmission du dossier complet à un avocat partenaire pour la commission départementale de conciliation puis, si besoin, le juge. Le locataire choisit librement de continuer ; les honoraires du partenaire sont en principe également au résultat. La préparation matérielle de la saisine de la CDC peut rester côté plateforme sur le modèle validé par la jurisprudence Demanderjustice (dossier préparé, utilisateur signataire).

### Architecture juridique du modèle (le « double rail »)

| Activité | Fondement | Qui la fait |
|---|---|---|
| Information juridique générale, calculs automatisés | Libre (loi de 1971 non applicable aux prestations standardisées) | Plateforme |
| Génération et envoi de courriers types, relances scriptées | Jurisprudence Demanderjustice (Cass. crim. 21/03/2017) | Plateforme |
| Réception des fonds, reversement, commission au succès | Statut R124-1 et s. CPCE (déclaration procureur + RC pro + compte dédié + mandat écrit) | Plateforme |
| Préparation matérielle de la saisine CDC, utilisateur signataire | Modèle Demanderjustice | Plateforme |
| Appréciation juridique d'un cas d'espèce, négociation argumentée en droit, contentieux | Réservé (loi du 31/12/1971) | Avocats partenaires |

Trois garde-fous opérationnels : scripts de relance figés et validés par l'avocat conseil (aucune improvisation juridique par le support client) ; bascule automatique vers partenaire dès qu'un bailleur soulève un argument de fond ; mention systématique « estimation informative, pas un avis juridique » sur les diagnostics. L'ensemble du dispositif (mandat, barème, CGU, scripts, articulation avec les partenaires) est validé par un avocat conseil avant lancement — c'est le premier poste de dépense du projet.

---

## 3. Marché et concurrence

(Inchangé sur le fond par rapport à la v1 ; synthèse.) Gisement principal et pérenne : 1,1 million de logements F/G en location privée sous gel des loyers depuis août 2022, alimenté par le durcissement continu de la loi Climat (interdiction des G depuis 2025, des F en 2028). Gisements complémentaires : encadrement des loyers dans les villes concernées (plus d'un tiers de baux non conformes — module à maintenir tant que le dispositif existe, sans en dépendre), erreurs d'IRL et relocations illégales en zone tendue (national, pérenne), compléments de loyer abusifs, et en extension future les dépôts de garantie non restitués (gisement national massif, même mécanique de recouvrement).

La concurrence ne couvre pas ce positionnement : les simulateurs s'arrêtent au verdict, Litige.fr suppose que l'utilisateur sait déjà qu'il est lésé et fait payer d'avance, les associations n'ont ni détection automatique ni capacité de volume. **Personne ne combine détection automatique + prise en charge complète + paiement au succès.** Le précédent inspirant est le marché de l'indemnisation aérienne (AirHelp, Flightright : détection du droit + mandat + commission ~25-35 %) : même structure de marché — droit protecteur ignoré, préjudice unitaire de quelques centaines d'euros, masse de bénéficiaires passifs — qui a produit des entreprises à plus de 100 M€ de CA.

---

## 4. Modèle économique

### Tarification

Commission de **25 % TTC des sommes récupérées**, définies comme : trop-perçu remboursé + 12 mois d'économie sur le différentiel de loyer obtenu (la baisse de loyer acquise pour l'avenir est la moitié de la valeur créée ; la plafonner à 12 mois garde le barème simple et défendable). Zéro frais d'entrée, zéro frais en cas d'échec. Exemple type : trop-perçu 1 100 € + baisse de 70 €/mois → valeur 1 940 € → commission 485 €, locataire net 1 455 € sans avoir rien fait ni risqué.

### Unit economics par dossier (hypothèses prudentes)

| Poste | Valeur |
|---|---|
| Commission moyenne par dossier gagné | 320 € |
| Coûts directs (recommandés, signature électronique, paiement, revue humaine ~30 min) | 25-40 € |
| Taux de succès amiable visé (dossiers DPE/IRL, où l'irrégularité est binaire) | 55-70 % |
| Coût d'acquisition cible par mandat signé | 15-30 € (SEO/viral dominant) |
| Marge contributive par mandat signé (pondérée du taux de succès) | ~150-190 € |

Le choix stratégique qui soutient ces chiffres : **prioriser les irrégularités binaires** (augmentation sur DPE F/G, erreur d'IRL), où le bailleur n'a quasiment aucune défense et où le taux de règlement amiable est structurellement élevé, avant les irrégularités « discutables » (compléments de loyer) au taux de succès plus faible.

### Projections sur 3 ans

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| Diagnostics gratuits | 40 000 | 150 000 | 350 000 |
| Mandats signés (conv. 4 %) | 1 600 | 6 000 | 14 000 |
| Dossiers gagnés (60 %) | 960 | 3 600 | 8 400 |
| CA commissions (320 €) | 307 000 € | 1 152 000 € | 2 688 000 € |
| CA scénario prudent (-50 %) | ~150 000 € | ~575 000 € | ~1 350 000 € |

Même le scénario prudent finance une équipe dès l'année 2 (revue de dossiers, support, juriste interne en année 2-3). Le BFR est favorable : la commission est prélevée à l'encaissement, avant reversement.

### Besoins initiaux : 18 000 à 30 000 €

Avocat conseil — cadrage, mandat, CGU, scripts, convention partenaires (5 000-8 000 €) ; formalités du statut de recouvrement — RC pro (~500-1 500 €/an), compte dédié, déclaration au procureur (déclaratif) ; structuration de la base réglementaire (2 000 €) ; marque et contenus (2 000 €) ; marketing de lancement et RP (5 000-10 000 €) ; infrastructure (<1 500 €/an). Trésorerie de précaution : les revenus n'arrivent qu'au premier dossier gagné, soit ~3-4 mois après le premier mandat.

---

## 5. Acquisition

Le modèle au succès transforme le marketing : le message n'est plus « achetez un dossier » mais **« vérifiez gratuitement — si on récupère rien, vous ne payez rien »**, un des messages les plus convertissants qui existent. Canaux par ordre de priorité : SEO d'intention (« loyer DPE G augmentation interdite », « mon propriétaire a augmenté le loyer passoire thermique » — guides par irrégularité et par ville aboutissant au simulateur) ; viralité du verdict chiffré sur TikTok/Instagram (« j'ai 1 400 € à récupérer sur mon loyer ») ; presse conso (l'angle « plus d'un tiers des baux hors la loi, voici le site qui récupère votre argent » est un sujet de JT) ; prescripteurs (associations de locataires, ADIL, travailleurs sociaux — le service est gratuit pour leurs publics en cas d'échec) ; parrainage entre colocataires et voisins (un immeuble F/G = des dizaines de dossiers identiques — effet « grappe » : un dossier gagné dans un immeuble déclenche les voisins).

---

## 6. Risques et parades

**Risque juridique de requalification** (conseil juridique ou dépassement du cadre R124) : traité par le double rail, les scripts figés, la validation avocat continue et la bascule systématique vers les partenaires dès contestation de fond. Budget juridique récurrent assumé (~5-10 k€/an). **Risque de taux de succès insuffisant** : mitigé par la priorité aux irrégularités binaires et la revue humaine pré-mandat (refuser les dossiers faibles protège l'économie ET la réputation). **Risque de bailleurs récalcitrants en masse** : le pipeline d'escalade vers les avocats partenaires au résultat maintient une issue ; le taux de transformation de la simple lettre d'un tiers mandaté est en pratique bien supérieur à celui d'un courrier de locataire isolé. **Risque réglementaire** (fin de l'encadrement expérimental en nov. 2026) : neutralisé, le cœur du modèle est le gel DPE et l'IRL, pérennes. **Risque réputationnel** (être perçu comme « chasseur de primes ») : contré par la transparence du barème, le zéro frais d'échec, et le discours « nous faisons appliquer la loi, rien de plus » ; un module B2B de mise en conformité pour bailleurs de bonne foi complétera le positionnement. **Risque d'encaissement** (bailleur qui paie directement le locataire pour éviter la commission) : le mandat prévoit que la commission est due sur les sommes obtenues du fait de l'intervention, quel que soit le canal de paiement — clause classique du recouvrement, à verrouiller avec l'avocat.

---

## 7. Feuille de route

**Mois 1-2 — Fondations.** Avocat conseil : validation du double rail, rédaction du mandat, des CGU, du barème, des scripts de relance et de la convention type partenaires. Formalités R124 : assurance RC pro, ouverture du compte dédié, déclaration au procureur. Prototype du moteur DPE (API ADEME) + IRL. Landing page et liste d'attente.

**Mois 3-4 — Pilote fermé.** 20-30 dossiers réels recrutés à la main (groupes de locataires, entourage), traités de bout en bout pour mesurer le taux de succès réel, le délai moyen et le montant moyen — les trois chiffres qui valident ou invalident le modèle. Signature de 2 avocats partenaires.

**Mois 5-7 — Lancement public.** Périmètre gel DPE + IRL, France entière. Espace de suivi, signature électronique, encaissement/reversement automatisés. Premières RP.

**Mois 8-12 — Extension.** Module encadrement (Paris d'abord), montée en charge marketing, premiers recrutements (revue de dossiers/support), exploration dépôt de garantie et B2B conformité bailleurs.

---

*Document de travail. Les hypothèses chiffrées sont à valider par le pilote du mois 3-4 ; le montage juridique est à faire valider intégralement par l'avocat conseil avant tout lancement public.*
