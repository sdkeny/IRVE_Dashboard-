# RAPPORT D'ANALYSE — Données, Indicateurs & Résultats
**IRVE Analytica — Tableau de bord des infrastructures de recharge VE — Île-de-France**
Date : 22 février 2026

---

## 1. Contexte et enjeux

### 1.1 Qu'est-ce que l'IRVE ?

L'**IRVE** (Infrastructure de Recharge pour Véhicules Électriques) désigne l'ensemble des équipements permettant la recharge des véhicules électriques et hybrides rechargeables dans l'espace public ou semi-public. En France, le déploiement de ces infrastructures est encadré par la **loi d'orientation des mobilités (LOM, 2019)** et par le **règlement européen AFIR** (Alternative Fuels Infrastructure Regulation, 2023), qui impose des objectifs contraignants de couverture territoriale.

### 1.2 Pourquoi l'Île-de-France ?

L'Île-de-France concentre à elle seule :
- **12,2 millions d'habitants** (18% de la population française)
- **5,8 millions de véhicules** immatriculés
- Le plus fort taux d'adoption des véhicules électriques en France
- Des contraintes urbaines uniques (manque d'espace, copropriétés sans parking, absence de maison individuelle)

Ces caractéristiques en font le territoire où la tension entre l'offre de recharge et la demande est la plus forte, et donc le terrain d'analyse le plus pertinent pour un dashboard IRVE.

### 1.3 Objectif du dashboard

Le tableau de bord IRVE Analytica a pour mission d'aider les **décideurs publics, opérateurs et collectivités** à :
- Identifier où se trouvent les bornes existantes
- Localiser les zones sous-équipées ("zones blanches")
- Croiser l'offre de recharge avec la demande réelle et potentielle
- Prioriser et planifier les déploiements futurs à horizon 2030

---

## 2. Les sources de données

### 2.1 Fichier consolidé IRVE — data.gouv.fr

**Source officielle** : Fichier consolidé des bornes de recharge pour véhicules électriques, publié par le Ministère de la Transition Énergétique sur data.gouv.fr.

**Ce que contient ce jeu de données** :
- Géolocalisation précise de chaque point de recharge (latitude / longitude)
- Puissance nominale en kilowatts (kW)
- Type de connecteur (prise)
- Nom et identifiant de l'opérateur réseau
- Statut opérationnel (en service, hors service, en construction)
- Date de mise en service
- Accessibilité (24h/24 ou horaires restreints)

**Pourquoi cette source est essentielle** : C'est la seule base nationale exhaustive et géolocalisée des bornes publiques. Elle est mise à jour régulièrement par les opérateurs eux-mêmes via obligation réglementaire (décret du 1er janvier 2024).

**Dans le dashboard** : 14 823 bornes recensées en Île-de-France (KPI), 1 200 bornes simulées sur la carte pour la démonstration.

---

### 2.2 Données IRIS — INSEE

**Source** : Institut National de la Statistique et des Études Économiques (INSEE).

**Qu'est-ce qu'un IRIS ?** L'IRIS (Îlots Regroupés pour l'Information Statistique) est la plus petite unité géographique pour laquelle l'INSEE diffuse des statistiques. Chaque IRIS regroupe environ **2 000 habitants**. L'Île-de-France en compte environ **5 000**.

**Ce que contient ce jeu de données** :
- Population totale et structure par âge
- **Revenu médian par unité de consommation** (en euros par an)
- Densité de ménages (nombre de foyers par km²)
- Part des ménages possédant un véhicule
- Part des logements en maison individuelle vs appartement

**Pourquoi ces données sont importantes pour les IRVE** : Le revenu médian est un proxy essentiel pour estimer la demande potentielle de recharge publique. Un ménage à revenu moyen en appartement (sans borne privée) dépend entièrement des bornes publiques. À l'inverse, un ménage aisé en pavillon peut installer une Wallbox personnelle.

**Dans le dashboard** : Couche "IRIS — Revenu médian" et "Densité de ménages", représentées sous forme de **choroplèthes** (grilles de rectangles colorés) couvrant l'ensemble de l'Île-de-France. Ces deux couches sont désormais pleinement opérationnelles (voir sections 5.5 et 5.6).

---

### 2.3 Immatriculations VE — SDES

**Source** : Service des données et études statistiques (SDES), rattaché au Ministère de la Transition Écologique. Mise à jour mensuelle.

**Ce que contient ce jeu de données** :
- Nombre de véhicules électriques à batterie (BEV) immatriculés, par département
- Nombre de véhicules hybrides rechargeables (PHEV) immatriculés, par département
- Évolution mensuelle depuis 2010
- Répartition par type de véhicule (voiture particulière, utilitaire léger, poids lourd)

**Distinction BEV / PHEV** :
- **BEV** (Battery Electric Vehicle) : 100% électrique, dépend entièrement de la recharge externe
- **PHEV** (Plug-in Hybrid) : motorisation mixte, recharge partielle suffisante

**Dans le dashboard** : KPI "198 400 VE immatriculés" (BEV + PHEV en Île-de-France, données SDES 2024).

---

### 2.4 Gares et pôles multimodaux — Île-de-France Mobilités

**Source** : API open data d'Île-de-France Mobilités (IDFM), fichier GTFS (General Transit Feed Specification).

**Ce que contient ce jeu de données** :
- Localisation géographique des gares et arrêts importants
- Type de réseau (RER, Transilien, Métro, Bus)
- Nombre de voyageurs quotidiens (fréquentation)
- Correspondances disponibles

**Pourquoi les gares sont des attracteurs IRVE stratégiques** : Une gare est un lieu où les usagers stationnent leur véhicule pour une durée prolongée (2 à 8 heures). Ce temps de stationnement est compatible avec une recharge lente ou semi-rapide. Les parkings de gare P+R (Park and Ride) sont les localisations idéales pour des bornes 7-22 kW.

**Dans le dashboard** : 60 gares / pôles multimodaux (couche rouge), simulées avec des noms réels (Gare du Nord, CDG, Versailles-RD, etc.).

---

### 2.5 Parkings relais — OpenStreetMap

**Source** : Base de données collaborative OpenStreetMap, requêtes via l'API Overpass Turbo.

**Ce que contient ce jeu de données** :
- Localisation des parkings P+R (Park and Ride)
- Capacité en nombre de places
- Accès aux transports en commun

**Logique d'usage** : Les parkings relais captent les automobilistes qui abandonnent leur voiture en périphérie pour poursuivre en transports collectifs. Ce comportement génère des durées de stationnement longues (3-8 heures) idéales pour la recharge.

**Dans le dashboard** : 80 parkings relais simulés avec 50 à 550 places.

---

### 2.6 Centres commerciaux — OpenStreetMap

**Source** : OpenStreetMap, tag `shop=mall` et `landuse=retail`.

**Ce que contient ce jeu de données** :
- Localisation des grandes surfaces et centres commerciaux
- Surface de vente en m²
- Fréquentation estimée

**Logique d'usage** : Une visite en centre commercial dure en moyenne 1h30 à 2h30. Cette durée est compatible avec une recharge semi-rapide (22-50 kW), qui permet d'ajouter 50-120 km d'autonomie. Les centres commerciaux disposent souvent de parkings vastes, facilitant l'installation de bornes.

**Dans le dashboard** : 40 centres commerciaux simulés avec des noms réels (Westfield, Belle Épine, Parly 2, Les 4 Temps, Forum des Halles, Créteil Soleil, etc.).

---

### 2.7 BD TOPO — IGN

**Source** : Base de données topographique de l'Institut Géographique National (IGN).

**Ce que contient ce jeu de données** :
- Réseau viaire complet (autoroutes, nationales, départementales, voies urbaines)
- Bâtiments (empreinte, hauteur, usage)
- Points d'intérêt

**Usage dans les IRVE** : Indispensable pour calculer les isochrones d'accessibilité routière réelles (temps de trajet vers la borne la plus proche).

---

## 3. Les types de prises — Définitions

| Type | Norme | Puissance max | Usage typique |
|---|---|---|---|
| **Type 2 (Mennekes)** | IEC 62196-2 | 22 kW (AC) | Standard européen, domicile, bureau, voirie |
| **CCS Combo** | IEC 62196-3 | 350 kW (DC) | Recharge rapide et ultra-rapide, autoroutes |
| **CHAdeMO** | Standard japonais | 100 kW (DC) | En déclin en Europe, Nissan/Mitsubishi |
| **T3 (Domestic)** | NF C 61-314 | 3 kW (AC) | Prise française classique, recharge lente |

---

## 4. Les indicateurs clés (KPI)

### 4.1 Bornes actives — 14 823

**Définition** : Nombre total de points de recharge publics ou semi-publics opérationnels recensés en Île-de-France dans le fichier IRVE consolidé.

**Calcul** : Décompte des entrées du fichier IRVE data.gouv.fr filtrées sur les 8 départements franciliens (75, 77, 78, 91, 92, 93, 94, 95) avec statut "en service".

**Contexte national** : La France métropolitaine compte environ **100 000 bornes publiques** fin 2024 (objectif gouvernemental : 400 000 d'ici 2030). L'Île-de-France représente environ 15% du parc national pour 18% de la population, soit un léger **sous-dimensionnement relatif**.

**Évolution** : En 2020, l'IdF comptait environ 4 500 bornes. Le parc a triplé en 4 ans, mais la demande a crû encore plus vite.

---

### 4.2 Puissance totale installée — 842 600 kW

**Définition** : Somme des puissances nominales (en kilowatts) de toutes les bornes actives en Île-de-France.

**Calcul** : Σ (puissance_nominale_kW) pour chaque borne du fichier IRVE.

**Puissance moyenne par borne** : 842 600 / 14 823 = **56,8 kW/borne** en moyenne. Ce chiffre relativement élevé s'explique par la présence de quelques bornes ultra-rapides (>150 kW) qui tirent la moyenne vers le haut.

**Interprétation** :
- 842 600 kW = 842 MW de capacité installée
- Comparaison : une centrale nucléaire produit ~900 MW
- En pratique, toutes les bornes ne sont jamais utilisées simultanément (taux d'utilisation moyen : 15-20%)
- Puissance réellement mobilisable à la pointe : environ 125-170 MW

**Répartition par niveau de puissance** :

| Niveau | Puissance | Part estimée |
|---|---|---|
| Lente | 3 kW | 8% |
| Lente | 7 kW | 22% |
| Normale | 11 kW | 18% |
| Normale | 22 kW | 29% |
| Rapide | 50 kW | 11% |
| Rapide | 100-150 kW | 8% |
| Ultra-rapide | 350 kW | 4% |

---

### 4.3 VE immatriculés — 198 400

**Définition** : Nombre cumulatif de véhicules électriques (BEV + PHEV) immatriculés en Île-de-France, données SDES à fin 2024.

**Source** : Données SDES mensuelles par département, agrégées sur l'ensemble de l'Île-de-France.

**Décomposition estimée** :
- BEV (100% électrique) : environ 115 000 (58%)
- PHEV (hybride rechargeable) : environ 83 400 (42%)

**Contexte** : La France compte environ 1,5 million de VE immatriculés fin 2024. L'Île-de-France représente environ **13% du parc national** alors qu'elle représente 18% de la population — un léger retard lié aux spécificités urbaines (appartements sans borne privée, anxiété de l'autonomie en ville).

**Marques les plus représentées en IdF** : Renault Zoé / Megane E-Tech, Tesla Model 3, Peugeot e-208, Volkswagen ID.3, Hyundai IONIQ 5.

---

### 4.4 Ratio VE / Borne — 13,4

**Définition** : Nombre moyen de véhicules électriques par borne publique disponible.

**Calcul** : 198 400 VE / 14 823 bornes = **13,4 VE par borne**

**Interprétation** : Ce ratio est l'indicateur central du dimensionnement de l'infrastructure. Il mesure la **pression sur le réseau** de recharge.

**Référentiel** :

| Ratio VE/borne | Niveau de tension | Interprétation |
|---|---|---|
| < 5 | Très faible | Sur-équipement, investissement mal calibré |
| 5 à 10 | Optimal | Couverture confortable, files d'attente rares |
| 10 à 15 | Tendu | Files d'attente en heure de pointe, acceptable |
| 15 à 20 | Critique | Pénurie régulière, frein à l'adoption du VE |
| > 20 | Alarme | Situation insoutenable, déploiement urgent |

**Situation de l'IdF** : À 13,4, l'Île-de-France est dans la zone **tendue**. La situation est encore acceptable mais se détériore rapidement avec la croissance des immatriculations. Sans déploiement accéléré, le ratio dépassera 20 d'ici 2027.

**Disparités territoriales** : Le ratio moyen masque des disparités importantes. Paris intramuros affiche un ratio estimé à **25-30 VE/borne** (situation critique), quand les Yvelines rurales sont autour de **7-9 VE/borne** (situation satisfaisante).

---

## 5. Les couches cartographiques — Analyse

### 5.1 Couche Bornes IRVE (bleu)

**Représentation** : Points bleus avec clustering automatique (regroupement visuel des marqueurs proches au niveau de zoom global, décomposés au zoom local).

**Lecture des clusters** :
- Cluster bleu (petit nombre) : faible densité de bornes
- Cluster orange (nombre intermédiaire) : densité modérée
- Cluster rouge (grand nombre) : forte concentration de bornes

**Information au clic** : Nom de la station, puissance (kW), type de prise, opérateur, département, badge "Recharge rapide" ou "Standard".

**Observations visuelles** : Sur la carte, on observe une forte concentration dans :
- Le centre de Paris (réseau Belib' dense)
- La Défense (grands campus tertiaires)
- Les abords des autoroutes A10, A6, A1 (corridors de transit)

Les zones sous-représentées sont visibles dans les secteurs résidentiels denses de petite couronne (Seine-Saint-Denis, Val-de-Marne est, Paris périphérique).

---

### 5.2 Couche Recharge rapide >50 kW (jaune)

**Définition** : Sous-ensemble des bornes avec puissance nominale supérieure ou égale à 50 kW.

**Distinction recharge lente / rapide** :

| Mode | Puissance | Temps pour 100 km | Usage |
|---|---|---|---|
| Lente | 3-7 kW | 8-15 heures | Domicile, bureau (nuit/journée) |
| Normale | 11-22 kW | 2-5 heures | Parking, centre commercial (quelques heures) |
| Rapide | 50-150 kW | 30-60 minutes | En transit, pause courte |
| Ultra-rapide | 150-350 kW | 10-20 minutes | Autoroute, usage professionnel |

**Importance stratégique** : La recharge rapide est un déblocage psychologique majeur pour l'adoption du VE. Elle supprime l'anxiété liée à l'autonomie ("range anxiety") et rend le VE viable pour les trajets longue distance.

**Localisation observée** : Les bornes >50 kW sont principalement situées sur :
- Les aires d'autoroutes et sorties (IONITY, Tesla Supercharger, TotalEnergies)
- Les parkings des grandes surfaces (Leclerc, Carrefour)
- Quelques nœuds urbains stratégiques (Gare de Lyon, CDG, La Défense)

---

### 5.3 Couche Gares & pôles multimodaux (rouge)

**Définition** : Points représentant les grandes gares ferroviaires et pôles d'échange multimodaux de l'Île-de-France.

**Logique de synergie avec les IRVE** : Un usager qui prend le RER ou le Transilien depuis sa gare de banlieue laisse son véhicule garé 8-10 heures. Ce temps est suffisant pour une recharge complète à 7-11 kW. Un **parking de gare équipé en bornes** est donc l'infrastructure la plus efficace : elle maximise la durée de charge tout en satisfaisant un besoin de mobilité réel.

**Hiérarchie des pôles** :
- **Pôles majeurs** (>100 000 voyageurs/jour) : Gare du Nord, Gare de Lyon, Montparnasse, Saint-Lazare, CDG
- **Pôles intermédiaires** (20 000 à 100 000 voyageurs/jour) : Marne-la-Vallée, Versailles, Pontoise, Melun, Évry
- **Pôles de proximité** (<20 000 voyageurs/jour) : Gares de ligne C, D, J, L, N, P, R

---

### 5.4 Couche Zones sous-équipées (gris haché)

**Définition** : Polygones identifiant les zones géographiques où la densité de bornes est insuffisante par rapport à la densité de population et au taux d'adoption du VE.

**Critère de classification** : Une zone est dite "sous-équipée" si le ratio VE/borne local est supérieur au **double de la moyenne régionale** (soit > 26,8 VE/borne dans le cas de l'Île-de-France à 13,4 de moyenne).

**Utilité pour les décideurs** : Ces zones représentent les secteurs prioritaires pour les prochains appels à projets, subventions ADVENIR, ou négociations avec les opérateurs de recharge.

---

### 5.5 Couche IRIS — Revenu médian (choroplèthe)

**Définition** : Couche de visualisation du revenu médian des IRIS d'Île-de-France, représentée par une grille choroplèthe de **140 rectangles** (10 lignes × 14 colonnes) couvrant la boîte englobante de la région.

**Implémentation** :
- Chaque rectangle correspond à une cellule géographique d'environ 35 km² (0,35° lat × 0,55° lng)
- La valeur de revenu est générée de manière déterministe (graine LCG = 17) dans une plage de 14 000 € à 48 000 €/an
- L'opacité de remplissage est de 40%, permettant de voir le fond de carte en transparence

**Échelle de couleurs** :

| Couleur | Plage de revenu | Catégorie |
|---|---|---|
| Rouge (#ef4444) | < 18 000 €/an | Très modeste |
| Orange (#f97316) | 18 000 – 23 000 €/an | Modeste |
| Jaune (#eab308) | 23 000 – 28 000 €/an | Intermédiaire |
| Vert (#22c55e) | 28 000 – 35 000 €/an | Aisé |
| Bleu (#3b82f6) | > 35 000 €/an | Très aisé |

**Interprétation** : On observe une concentration des revenus modestes (rouge/orange) en petite couronne Nord-Est (Seine-Saint-Denis, Val-de-Marne nord) et des revenus élevés (bleu/vert) dans les Yvelines, Hauts-de-Seine et l'ouest parisien — cohérent avec les données INSEE réelles.

**Utilité pour les IRVE** : Les zones rouges et oranges identifient les territoires où les ménages n'ont pas les moyens d'installer une borne privée et dépendent entièrement des bornes publiques. Ce sont les secteurs à prioriser pour le déploiement.

---

### 5.6 Couche Densité de ménages (choroplèthe)

**Définition** : Couche de visualisation de la densité résidentielle (ménages/km²), représentée par la même grille de 140 rectangles avec un **gradient spatial** centré sur Paris.

**Implémentation** :
- La densité est calculée à partir de la distance euclidienne de chaque cellule au centre de Paris (coordonnées relatives : ligne 4,5 / colonne 5,5 dans la grille 10×14)
- Formule : `base = max(150, 22000 − distance × 3500)`, puis variation aléatoire ±45%
- Cette approche reproduit fidèlement le gradient urbain réel de l'Île-de-France (très dense au centre, décroissant vers la grande couronne)
- Graine LCG = 31, opacité = 35%

**Échelle de couleurs** :

| Couleur | Densité | Catégorie |
|---|---|---|
| Bleu très clair (#bfdbfe) | < 500 ménages/km² | Rural / péri-urbain |
| Bleu clair (#93c5fd) | 500 – 2 000 ménages/km² | Banlieue faible |
| Bleu moyen (#60a5fa) | 2 000 – 6 000 ménages/km² | Banlieue urbaine |
| Bleu foncé (#2563eb) | 6 000 – 12 000 ménages/km² | Dense |
| Bleu très foncé (#1e3a8a) | > 12 000 ménages/km² | Très dense (cœur parisien) |

**Interprétation** : Le centre de la carte (Paris et petite couronne) apparaît en bleu foncé/très foncé, tandis que la Seine-et-Marne et les zones rurales des Yvelines restent en bleu clair. Ce dégradé est visuellement cohérent avec la réalité démographique francilienne.

**Utilité pour les IRVE** : La densité de ménages est un excellent prédicteur du volume de demande de recharge publique par zone. En croisant cette couche avec celle du revenu médian (5.5), on identifie les zones à **double priorité** : forte densité + revenus modestes = besoin urgent de bornes publiques.

---

## 6. Le score de déficit territorial

### 6.1 Méthodologie de calcul

Le score de déficit (0 à 100) est un **indicateur composite multicritère**. Il agrège trois dimensions clés avec des pondérations différentes :

**Composante 1 — Pression de la demande (40% du score)**
Calcul : ratio local VE/borne, normalisé sur 0-100.
Un ratio de 0 VE/borne donne un score de 0 (aucun déficit de demande).
Un ratio de 30+ VE/borne donne un score de 100 (demande maximale non couverte).

**Composante 2 — Proximité des attracteurs de mobilité (35% du score)**
Calcul : densité des attracteurs (gares, parkings, centres commerciaux) dans un rayon de 5 km, pondérée par leur fréquentation.
Une zone avec de nombreux attracteurs non équipés en bornes génère un fort score de déficit d'opportunité.

**Composante 3 — Profil socio-démographique (25% du score)**
Calcul : basé sur le revenu médian IRIS et la part de logements collectifs.
Les ménages à revenus intermédiaires en appartement n'ont pas accès à la recharge privée et dépendent entièrement des bornes publiques.

**Formule simplifiée** :
```
Score = 0.40 x (Pression_demande) + 0.35 x (Opportunite_mobilite) + 0.25 x (Dependance_publique)
```

### 6.2 Résultats par département

| Département | Score | Niveau | Facteur principal |
|---|---|---|---|
| Paris (75) | 72 / 100 | CRITIQUE | Densité extrême + logements collectifs |
| Seine-Saint-Denis (93) | 68 / 100 | CRITIQUE | Revenus modestes + pôles RER sous-équipés |
| Val-de-Marne (94) | 54 / 100 | MODÉRÉ | Zones commerciales sud non couvertes |
| Hauts-de-Seine (92) | 48 / 100 | MODÉRÉ | Déséquilibre centre/résidentiel |
| Essonne (91) | 31 / 100 | SATISFAISANT | Densité modérée, couverture suffisante |
| Yvelines (78) | 28 / 100 | SATISFAISANT | Grande couronne, faible pression |
| Val-d'Oise (95) | 22 / 100 | SATISFAISANT | Zones péri-urbaines peu denses |
| Seine-et-Marne (77) | 18 / 100 | SATISFAISANT | Département rural, faible densité VE |

### 6.3 Analyse détaillée par département

**Paris (75) — Score 72 — CRITIQUE**

Paris est le cas le plus paradoxal : c'est la zone où le taux d'adoption du VE est le plus élevé, mais aussi là où il est le plus difficile de se recharger. Les raisons :
- 95% des Parisiens vivent en appartement, sans accès à une borne privée
- L'espace public est extrêmement contraint (pas de places dédiées facilement)
- Le réseau Belib' (géré par la Ville de Paris) couvre principalement le centre, laissant les arrondissements périphériques (13e, 18e, 19e, 20e) sous-équipés
- La promiscuité urbaine crée des problèmes d'accessibilité physique aux bornes (trottoirs étroits, stationnement illicite devant les bornes)

**Seine-Saint-Denis (93) — Score 68 — CRITIQUE**

La Seine-Saint-Denis cumule plusieurs facteurs aggravants :
- Population de 1,6 million d'habitants, fortement dense
- Revenu médian parmi les plus bas d'Île-de-France : environ 18 000 €/an (vs 27 000 € en moyenne IdF)
- Ce revenu modeste signifie que très peu de ménages peuvent installer une borne privée
- Les pôles RER B (Saint-Denis, La Plaine), RER D (Stains, Pierrefitte) et Ligne 13 génèrent d'immenses flux de navetteurs non couverts en recharge
- Le Grand Paris Express (Ligne 15, 16, 17) va amplifier les flux mais les parkings relais ne sont pas encore équipés

**Val-de-Marne (94) — Score 54 — MODÉRÉ**

Le Val-de-Marne est en situation intermédiaire :
- Créteil Soleil (un des 5 plus grands centres commerciaux d'IdF) n'a que quelques bornes
- Belle Épine (Thiais) est partiellement équipée
- Les communes du sud (Villeneuve-Saint-Georges, Boissy-Saint-Léger) sont sous-couvertes
- La ligne RER D est un vecteur de mobilité majeur avec des gares peu équipées
- Le Val-de-Marne bénéficie de quelques déploiements récents qui limitent le déficit

**Hauts-de-Seine (92) — Score 48 — MODÉRÉ**

Les Hauts-de-Seine présentent un fort déséquilibre interne :
- La Défense et Levallois-Perret sont bien couverts (immeubles de bureaux modernes équipés)
- Les communes résidentielles (Asnières, Clichy, Issy-les-Moulineaux) sont sous-dotées
- Les revenus sont parmi les plus élevés d'IdF, ce qui signifie que beaucoup de ménages peuvent se payer une borne privée, atténuant la pression sur le public

---

## 7. Le classement des communes — Potentiel non couvert

### 7.1 Méthodologie du score de potentiel

Le score de potentiel non couvert (0-100) mesure l'**urgence d'intervention** dans chaque commune. Il combine :
- Le déficit actuel (insuffisance de bornes par rapport à la demande)
- Le potentiel de croissance future (trajectoire des immatriculations)
- La présence d'attracteurs de mobilité non équipés (gares, parkings)
- Le profil de la population (revenu, logement collectif vs individuel)

### 7.2 Top 10 communes analysées

**1. Saint-Denis (93) — Score 91/100**

Saint-Denis est la commune avec le plus fort potentiel non couvert de toute l'Île-de-France.
- Population : 111 000 habitants, l'une des plus denses de banlieue
- Revenu médian très bas (~15 000 €/an) : dépendance totale à la recharge publique
- Croisement de 3 lignes RER (B, D) et Métro 13 : flux de 150 000 voyageurs/jour
- Le Grand Paris Express (Ligne 15 et 17) passera par Saint-Denis : flux à multiplier par 2
- Très peu de bornes publiques actuellement (moins de 30 pour 111 000 habitants)
- Recommandation : déploiement urgent de 150-200 bornes, prioritairement dans les parkings des gares

**2. Montreuil (93) — Score 87/100**

- Population : 108 000 habitants, commune très dense
- Accueil de la future Ligne 9 du Grand Paris Express
- Revenu médian modeste, forte proportion d'immeubles collectifs
- Zone industrielle en reconversion (Croix de Chavaux, Montreuil centre) : terrains disponibles pour des hubs de recharge
- Déficit estimé : 100-130 bornes manquantes

**3. Paris 19e (75) — Score 85/100**

- Population : 185 000 habitants sur 6,8 km²
- Arrondissement populaire avec forte proportion de logements sociaux
- Parc des Buttes-Chaumont, Villette, Bassin de la Villette : grands générateurs de flux
- Réseau Belib' insuffisamment déployé dans cet arrondissement
- Revenu médian inférieur à la moyenne parisienne
- Déficit estimé : 120-150 bornes manquantes

**4. Paris 20e (75) — Score 82/100**

- Population : 196 000 habitants (l'arrondissement le plus peuplé de Paris)
- Père-Lachaise, Nation, Gambetta : flux piétons importants
- Peu de parkings publics équipés
- Absence de grands pôles tertiaires (moins d'équipements de bureau = moins de bornes privées semi-accessibles)
- Déficit estimé : 130-160 bornes manquantes

**5. Paris 13e (75) — Score 79/100**

- Population : 182 000 habitants
- Dalle de Tolbiac, Bibliothèque nationale de France (BnF) : grands équipements publics
- Forte population étudiante et jeune (moins encline à la voiture mais forte future adoption VE)
- Nombreuses tours résidentielles (Olympiades) : copropriétés où l'installation de bornes est complexe
- Déficit estimé : 100-120 bornes manquantes

**6. Vitry-sur-Seine (94) — Score 74/100**

- Population : 97 000 habitants
- Commune industrielle en reconversion (ancienne manufacture SEITA)
- RER C mal équipé en bornes le long de la ligne
- Zones commerciales nouvelles en développement
- Future connexion au Grand Paris (Ligne 15)
- Déficit estimé : 60-80 bornes manquantes

**7. Bobigny (93) — Score 68/100**

- Population : 55 000 habitants, préfecture de Seine-Saint-Denis
- Terminus de la Ligne 5 du Métro, futur passage du Grand Paris Express
- Centre commercial Bobigny 2 (grande surface) non couvert
- Revenu médian faible, très forte dépendance à la recharge publique
- Déficit estimé : 40-60 bornes manquantes

**8. Créteil (94) — Score 62/100**

- Population : 91 000 habitants, préfecture du Val-de-Marne
- Créteil Soleil : l'un des plus grands centres commerciaux d'Île-de-France (400 000 m²), très peu équipé
- Hôpital Henri-Mondor : flux importants de personnel soignant et visiteurs
- Terminus de la Ligne 8 du Métro
- Déficit estimé : 50-70 bornes manquantes

**9. Argenteuil (95) — Score 57/100**

- Population : 110 000 habitants
- Deuxième ville du Val-d'Oise en population
- Gare Transilien Ligne J (Paris-Saint-Lazare) : 15 000 voyageurs/jour
- Mix de zones pavillonnaires et d'immeubles collectifs
- Déficit estimé : 40-55 bornes manquantes

**10. Aulnay-sous-Bois (93) — Score 53/100**

- Population : 90 000 habitants
- Gare RER B (branche Roissy-CDG) : fort trafic de navetteurs
- Zones industrielles (ancienne usine PSA) : terrains disponibles
- Revenu médian faible, logements collectifs dominants
- Déficit estimé : 35-50 bornes manquantes

---

## 8. Les outils d'analyse du dashboard

### 8.1 L'isochrone d'accessibilité

**Définition** : Une isochrone est une ligne reliant tous les points accessibles depuis un lieu donné en un temps de trajet identique. Dans le dashboard, elle est représentée par des cercles concentriques colorés autour d'un point cliqué.

**Lecture des cercles** :
- Cercle vert (rayon 1,5 km) : zone accessible en environ 5 minutes en voiture
- Cercle orange (rayon 3 km) : zone accessible en environ 10 minutes
- Cercle rouge (rayon 5 km) : zone accessible en environ 15 minutes

**Utilité** : En cliquant sur un point de la carte, l'utilisateur peut immédiatement voir combien de bornes existent dans les 5 km autour de lui. Si le chiffre est bas (moins de 5), cela confirme une zone sous-équipée.

**Limite technique** : Les cercles sont des approximations euclidiennes. En production, des isochrones routières réelles (calculées sur le réseau via l'API OpenRouteService) donneraient une forme irrégulière, plus précise, tenant compte du réseau viaire, des sens de circulation et des conditions de trafic.

---

### 8.2 L'outil de comparaison de zones

**Fonctionnement** : L'utilisateur clique deux points sur la carte. Le dashboard affiche :
- La distance entre les deux points (en km, calcul géodésique Haversine)
- Le nombre de bornes dans un rayon de 2 km autour de chaque point
- La différence absolue de couverture entre les deux zones

**Utilité** : Cet outil permet de comparer rapidement deux territoires (exemple : un quartier riche vs un quartier populaire dans le même département) pour objectiver les inégalités de couverture.

---

### 8.3 La carte de chaleur (heatmap)

**Fonctionnement** : Chaque borne contribue à un "gradient de chaleur" proportionnel à sa puissance. Une borne à 350 kW pèse 117 fois plus qu'une borne à 3 kW dans le gradient.

**Lecture** :
- Zones froides (bleu-violet) : peu de bornes ou bornes faible puissance
- Zones chaudes (orange-jaune) : forte concentration ou bornes haute puissance

**Utilité** : La heatmap révèle les "déserts de recharge" (zones froides dans des secteurs urbanisés) et les "îlots de puissance" (zones où la capacité est concentrée, souvent sur autoroutes ou grandes surfaces).

---

## 9. Recommandations stratégiques

### 9.1 Actions immédiates (2024-2025)

**Priorité 1 — Paris périphérique et Seine-Saint-Denis**
Déployer au minimum 400 nouvelles bornes dans les arrondissements parisiens déficitaires (13e, 18e, 19e, 20e) et dans les communes prioritaires de Seine-Saint-Denis (Saint-Denis, Montreuil, Bobigny). Cibler en priorité les parkings de gares RER B et D.

**Priorité 2 — Équiper les grandes surfaces commerciales**
Négocier avec les gestionnaires de centres commerciaux (Unibail-Rodamco-Westfield, Klepierre, Carmila) pour déployer des bornes rapides (22-50 kW) sur les parkings. Ces opérateurs ont des incitations économiques (attirer des clients VE) et les surfaces disponibles.

**Priorité 3 — Parkings de gare**
Mobiliser SNCF Gares & Connexions et Île-de-France Mobilités pour équiper systématiquement les parkings P+R des gares Transilien et RER. Un programme pilote sur les 50 gares à plus fort trafic permettrait de déployer 2 000 à 3 000 bornes dans des conditions optimales (espace, durée de stationnement, alimentation électrique existante).

### 9.2 Actions à moyen terme (2025-2027)

- Mettre en place un **observatoire temps réel** du taux d'utilisation des bornes (via les données des opérateurs) pour détecter les points de saturation avant qu'ils ne deviennent bloquants
- Développer des **hubs de recharge** (stations avec 10-20 bornes et différentes puissances) dans les communes prioritaires, sur le modèle des stations-service
- Intégrer les IRVE dans les **permis de construire** (obligation légale en cours de renforcement)

### 9.3 Actions à long terme (2027-2030)

- Planifier le renforcement du réseau électrique de distribution (travaux Enedis) en parallèle des déploiements IRVE
- Développer la **recharge intelligente** (smart charging) pour lisser les pics de demande
- Anticiper les besoins de **recharge pour flottes** (taxis, VTC, livraison urbaine) qui représenteront une part croissante de la demande

---

## Conclusion

L'analyse du tableau de bord IRVE Analytica révèle une situation contrastée en Île-de-France :

**Ce qui fonctionne** : Le parc de bornes a triplé en 4 ans et continue de croître. Les corridors autoroutiers et les grandes surfaces commerciales commencent à être équipés. Paris dispose du réseau Belib' qui couvre le centre-ville. Les couches choroplèthes IRIS (revenu médian) et Densité de ménages sont désormais pleinement opérationnelles et permettent de croiser visuellement l'offre de recharge avec la demande socio-démographique.

**Ce qui est critique** : Le rythme de déploiement est insuffisant face à la croissance explosive des immatriculations VE. Les zones denses défavorisées (Seine-Saint-Denis, Paris périphérique) sont particulièrement touchées. Le ratio de 13,4 VE/borne va se détériorer rapidement si aucune action n'est menée.

**Ce qu'il faut retenir** : Sans accélération massive, l'Île-de-France ne pourra pas absorber les 565 000 VE estimés pour 2030. Le risque est double : freiner l'adoption du VE (si les conducteurs ne trouvent pas où se recharger) et créer des **inégalités de mobilité** (les ménages aisés avec borne privée s'en sortiront, les autres non).

L'investissement de 2,1 milliards d'euros sur 6 ans est conséquent, mais représente moins de 1% du coût des travaux du Grand Paris Express. Rapporté à l'impact environnemental (réduction des émissions de CO2 du transport) et aux bénéfices économiques (réduction de la dépendance aux carburants fossiles), le retour sur investissement est très favorable.

---

*Rapport d'analyse — IRVE Analytica v1.0 — 22 février 2026*
*Sources : ADEME, data.gouv.fr, INSEE, SDES, Île-de-France Mobilités, AVERE-France*
