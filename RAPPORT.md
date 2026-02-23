# RAPPORT TECHNIQUE — IRVE Analytica Dashboard
**Analyse territoriale des infrastructures de recharge VE — Île-de-France**
Date : 22 février 2026 — **Mis à jour : suppression onglet Projection + calcul dynamique des scores de déficit**

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Architecture des fichiers](#2-architecture-des-fichiers)
3. [Technologies utilisées](#3-technologies-utilisées)
4. [Structure HTML — index.html](#4-structure-html--indexhtml)
5. [Design CSS — style.css](#5-design-css--stylecss)
6. [Logique JavaScript — app.js](#6-logique-javascript--appjs)
7. [Données et sources](#7-données-et-sources)
8. [Fonctionnalités détaillées](#8-fonctionnalités-détaillées)
9. [Analyse territoriale intégrée](#9-analyse-territoriale-intégrée)
10. [Limites et pistes d'évolution](#10-limites-et-pistes-dévolution)

---

## 1. Présentation générale

**IRVE Analytica** est un tableau de bord géospatial interactif conçu pour analyser les
**Infrastructures de Recharge pour Véhicules Électriques (IRVE)** en Île-de-France.

### Objectif

Aider les décideurs publics, collectivités et opérateurs à :
- Visualiser la distribution territoriale des bornes de recharge
- Identifier les zones sous-équipées (« zones blanches »)
- Croiser l'offre de recharge avec la demande potentielle (VE immatriculés, densité, revenus)
- Prioriser les futurs déploiements à horizon 2030

### Public cible

| Profil | Usage |
|---|---|
| Collectivités territoriales | Planification des équipements |
| Opérateurs IRVE | Identification des gaps de couverture |
| ADEME / DRIEAT | Suivi des objectifs nationaux |
| Chercheurs / Étudiants | Analyse géospatiale exploratoire |

---

## 2. Architecture des fichiers

```
IRVE_Dashboard/
├── index.html     → Structure HTML complète de l'interface
├── style.css      → Feuille de style (thème sombre, design pro)
├── app.js         → Toute la logique JavaScript (carte, données, UI)
└── RAPPORT.md     → Ce document
```

Le projet est **100% front-end**, sans serveur ni base de données. Il s'ouvre directement
dans un navigateur web (`index.html`).

---

## 3. Technologies utilisées

### Bibliothèques externes (CDN)

| Bibliothèque | Version | Rôle |
|---|---|---|
| **Leaflet.js** | 1.9.4 | Moteur de carte interactive |
| **Leaflet.markercluster** | 1.5.3 | Regroupement des marqueurs en clusters |
| **Leaflet.heat** | 0.2.0 | Génération de la carte de chaleur (heatmap) |
| **Font Awesome** | 6.5.0 | Icônes vectorielles (UI et marqueurs) |
| **Google Fonts — Inter** | — | Police principale (lisibilité, modernité) |
| **CartoDB Dark Matter** | — | Fond de carte sombre via tuiles OpenStreetMap |

### Langage

- **HTML5** (sémantique, pas de framework)
- **CSS3** (variables CSS, Flexbox, Grid, animations)
- **JavaScript ES2022** (mode strict, `const`/`let`, template literals, spread, nullish)

### Aucune dépendance back-end

Pas de Node.js, Python, PHP ou base de données requise. Le tableau de bord fonctionne
entièrement dans le navigateur.

---

## 4. Structure HTML — `index.html`

Le fichier est organisé en **5 grandes zones** :

```
<body>
├── <header>          → Barre supérieure (logo, badge, boutons)
└── <div.app-layout>  → Conteneur principal (3 colonnes)
    ├── <aside.sidebar>      → Panneau gauche (KPI, couches, filtres, sources)
    ├── <main.map-wrapper>   → Zone carte centrale
    │   ├── .map-toolbar     → Outils verticaux (5 boutons)
    │   ├── #map             → Conteneur Leaflet
    │   ├── .map-legend      → Légende
    │   └── .map-scale       → Affichage coordonnées
    └── <aside.right-panel>  → Panneau droit (analyse, classement)
        └── .tab-nav         → 2 onglets
<div.modal-overlay>   → Modale "À propos"
```

### 4.1 Header

- **Logo** `IRVEAnalytica` avec icône `fa-charging-station`
- **Sous-titre** : "Analyse territoriale des infrastructures de recharge VE — Île-de-France"
- **Badge vert animé** : "Données temps réel" (animation `pulse-green` CSS)
- **Bouton info** (`btn-help`) : ouvre la modale des sources
- **Bouton export** (`btn-export`) : déclenche le téléchargement CSV

### 4.2 Sidebar gauche

Divisée en 5 sections séparées par des titres :

**Indicateurs clés (KPI)**
4 cartes disposées en grille 2×2 :
- Bornes actives (icône bleue)
- kW installés (icône verte)
- VE immatriculés (icône orange)
- VE / borne — ratio (icône violette)

**Couches de données**
Checkboxes organisées en 4 groupes thématiques :
- *Offre de recharge* : Bornes IRVE, Recharge rapide >50 kW
- *Demande potentielle* : IRIS Revenu médian, Densité ménages
- *Attracteurs de mobilité* : Gares, Parkings relais, Centres commerciaux
- *Zones blanches* : Zones sous-équipées

**Filtres**
- Slider de puissance minimale (3 → 350 kW)
- Checkboxes types de prise (Type 2, CCS, CHAdeMO, T3)
- Select département (75 à 95 + "Île-de-France entière")
- Select opérateur réseau
- Boutons "Appliquer" et "Réinitialiser"

**Sources de données** : 6 liens cliquables vers les jeux de données officiels

### 4.3 Zone carte centrale

- `#map` : div cible de Leaflet (prend tout l'espace disponible)
- `.map-toolbar` : barre verticale avec 5 boutons d'outils
- `.map-legend` : boîte de légende positionnée en bas à droite
- `#map-coords` : affichage des coordonnées géographiques en temps réel

### 4.4 Panneau droit — Analyse

3 onglets navigables :

**Onglet Déficit** :
- Graphique en barres horizontales (8 départements, scores colorés)
- Bloc de recommandations prioritaires (3 niveaux : haute, moyenne, veille)

**Onglet Classement** :
- Top 10 communes avec potentiel non couvert (rempli par JavaScript)

### 4.5 Modale d'information

Fenêtre superposée (overlay sombre + backdrop blur) listant toutes les sources de données
par catégorie avec descriptions détaillées.

---

## 5. Design CSS — `style.css`

### 5.1 Système de variables CSS

Toutes les couleurs, tailles et valeurs répétées sont définies dans `:root` :

```css
:root {
  /* Fond */
  --bg-base:    #0f1117;   /* fond global très sombre */
  --bg-surface: #181c27;   /* sidebar, header */
  --bg-card:    #1e2335;   /* cartes, panneaux */
  --bg-hover:   #252a3d;   /* états hover */

  /* Bordures */
  --border:       #2c3150;
  --border-light: #363d5c;

  /* Texte */
  --text-primary:   #e8eaf0;  /* titres, valeurs */
  --text-secondary: #8b92b0;  /* labels */
  --text-muted:     #5a6080;  /* sous-titres, métadonnées */

  /* Couleurs sémantiques */
  --blue:   #3b82f6;   /* IRVE standard */
  --green:  #22c55e;   /* données positives */
  --orange: #f97316;   /* alertes moyennes */
  --yellow: #eab308;   /* recharge rapide */
  --red:    #ef4444;   /* déficit élevé */
  --purple: #a855f7;   /* ratio VE/borne */
  --teal:   #14b8a6;   /* densité */
  --pink:   #ec4899;   /* centres commerciaux */
  --gray:   #64748b;   /* zones blanches */

  /* Dimensions */
  --header-h:        56px;
  --sidebar-w:       300px;
  --right-panel-w:   340px;
  --toolbar-w:       48px;
  --radius:          8px;
  --radius-sm:       5px;
}
```

### 5.2 Layout principal

Utilisation de **CSS Flexbox** pour la mise en page à 3 colonnes :

```
header (position: fixed, z-index: 1000)
└── .app-layout (display: flex, height: 100vh)
    ├── .sidebar        (width: 300px, flex-shrink: 0)
    ├── .map-wrapper    (flex: 1 — prend tout l'espace restant)
    └── .right-panel    (width: 340px, flex-shrink: 0)
```

### 5.3 Animations CSS

| Animation | Effet | Usage |
|---|---|---|
| `pulse-green` | Opacité 1 → 0.3 → 1 (2s infinie) | Badge "Données temps réel" |
| `spin` | Rotation 360° (0.8s linéaire infinie) | Spinner de chargement |
| `transition: .2s ease` | Transition générale | Hover, collapse sidebar |
| `transition: width .6s ease` | Barres de graphique | Animation d'entrée des barres |

### 5.4 États de la sidebar

La sidebar possède deux états CSS via la classe `.collapsed` :

```css
.sidebar               { width: 300px; }
.sidebar.collapsed     { width: 0; min-width: 0; padding: 0; }
.sidebar.collapsed > * { display: none; }  /* cache le contenu */
```

Le JavaScript fait un `invalidateSize()` sur la carte après 210ms (durée de la transition)
pour que Leaflet recalcule ses dimensions.

### 5.5 Overrides Leaflet

Le CSS surchage les styles natifs de Leaflet pour les adapter au thème sombre :
- Fond de carte : `#1a1f2e` (au lieu du blanc Leaflet)
- Boutons zoom : couleurs du design system
- Popups : `bg-card`, `border`, `border-radius` du design
- Clusters : couleurs bleue/orange/rouge selon densité

### 5.6 Nouveaux éléments CSS — Légende enrichie

Deux nouvelles classes ont été ajoutées pour structurer la légende qui a été enrichie
des palettes de couleur des couches IRIS et Densité :

```css
.legend-sep {
  border-top: 1px solid var(--border);
  margin: 6px 0;            /* séparateur horizontal entre groupes */
}

.legend-subtitle {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted); /* titre de groupe dans la légende */
}
```

La légende affiche désormais trois groupes distincts :
1. Marqueurs ponctuels (bornes, gares, parkings, commerces, zones)
2. Échelle revenu médian IRIS (5 paliers rouge→bleu)
3. Échelle densité de ménages (3 paliers bleu clair→marine)

### 5.7 Responsive

```css
@media (max-width: 900px) {
  /* Cache le sous-titre header, réduit sidebar à 260px, masque right-panel */
}
@media (max-width: 600px) {
  /* Sidebar en overlay absolu, KPI en colonne unique */
}
```

---

## 6. Logique JavaScript — `app.js`

Le fichier est découpé en **22 sections numérotées** et fonctionne en mode strict (`'use strict'`).

### 6.1 Architecture générale

```
app.js
├── Section 1  : Données simulées (constantes + générateurs)
├── Section 2  : État global (objet STATE)
├── Section 3  : Fonctions utilitaires (fmt, showToast)
├── Section 4  : Initialisation carte Leaflet
├── Section 5  : Fabrique d'icônes (makeCircleIcon)
├── Section 6  : Constructeurs de couches (build*Layer)
├── Section 7  : Templates de popups HTML
├── Section 8  : Affichage KPI (animateCounter)
├── Section 9  : Classement communes (renderRanking)
├── Section 10 : Filtres (getFilters, applyFilters, resetFilters)
├── Section 11 : Gestionnaire d'outils (setTool)
├── Section 12 : Outil Isochrone (draw/clear/show)
├── Section 13 : Outil Comparaison (addComparePoint, clearCompare)
├── Section 14 : Gestionnaire de clic carte (onMapClick)
├── Section 15 : Export CSV (exportData)
├── Section 16 : Sidebar (initSidebar) + Panneau droit (initRightPanel)
├── Section 17 : Onglets (initTabs)
├── Section 18 : Toggles de couches (initLayerToggles)
├── Section 19 : Modale (initModal)
├── Section 20 : Slider de puissance (initSlider)
├── Section 21 : Injection du hint isochrone (injectIsochroneHint)
└── Section 22 : Initialisation principale (init → DOMContentLoaded)
```

### 6.2 L'objet STATE — état global centralisé

```javascript
const STATE = {
  map: null,           // Instance Leaflet
  layers: {            // Toutes les couches Leaflet
    irve, fast,
    iris,              // ← NOUVEAU : revenu médian IRIS
    densite,           // ← NOUVEAU : densité de ménages
    gares, parking, commerce, heatmap, zones
  },
  bornes: [],          // Tableau des 1 200 bornes
  gares: [],           // 60 gares
  parkings: [],        // 80 parkings
  commerces: [],       // 40 centres commerciaux
  currentTool: 'explore',        // Outil actif
  isochroneMarker: null,
  isochroneCircle: null,
  comparePoints: [],             // 0, 1 ou 2 points de comparaison
  compareLayers: [],             // Marqueurs + ligne de comparaison
  sidebarOpen: true,
  rightPanelOpen: true,
};
```

Ce pattern centralisé permet à toutes les fonctions d'accéder au même état sans variables globales dispersées.

### 6.3 Générateur pseudo-aléatoire déterministe

```javascript
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
```

Il s'agit d'un **générateur congruentiel linéaire (LCG)**, algorithme classique.
Avantage : en fixant la `seed`, les données générées sont **toujours identiques** à chaque
rechargement de page — ce qui est indispensable pour la reproductibilité des démos et tests.

Chaque type de donnée utilise une seed différente :
- Bornes IRVE : seed = 42
- Gares : seed = 7
- Parkings : seed = 13
- Centres commerciaux : seed = 99
- Zones blanches : seed = 55
- **IRIS Revenu médian : seed = 17** ← nouveau
- **Densité de ménages : seed = 31** ← nouveau

### 6.4 Initialisation de la carte Leaflet

```javascript
STATE.map = L.map('map', {
  center: [48.8566, 2.3522],  // Paris, centre de l'IdF
  zoom: 10,
  zoomControl: false,          // Contrôle de zoom repositionné manuellement
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/...').addTo(STATE.map);
L.control.zoom({ position: 'bottomright' }).addTo(STATE.map);
```

Le fond de carte utilisé est **CartoDB Dark Matter**, une variante sombre d'OpenStreetMap
adaptée aux dashboards professionnels.

### 6.5 Système d'icônes personnalisées

Plutôt que les icônes Leaflet par défaut (marqueurs bleus), le projet utilise des
`L.divIcon` — des icônes entièrement construites en HTML/CSS :

```javascript
function makeCircleIcon(color, size = 10) {
  return L.divIcon({
    html: `<div style="
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,.35);
      box-shadow:0 0 6px ${color}88;   /* halo lumineux */
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}
```

Le `box-shadow` avec opacité (`88` = 53% en hex) crée un effet de halo lumineux
qui améliore la lisibilité sur fond sombre.

### 6.6b Calcul dynamique des scores de déficit (`computeDeficitScores`)

Ajouté en section 9 de `app.js`, cette fonction calcule le score de déficit territorial
pour chacun des 8 départements d'Île-de-France à partir des données simulées.

**Données d'entrée** :
- `VE_DEPT` : nombre de VE immatriculés par département (source SDES 2024)
- `bornesParDept` : comptage des bornes simulées par attribut `dept`
- `attractParDept` : gares + parkings + centres commerciaux dans l'emprise géographique du département
- `DEPT_REVENUE` : revenu médian INSEE par département (référence 2022)

**Formule** :
```
Score = 0.40 × pression_demande
      + 0.35 × opportunite_mobilite
      + 0.25 × dependance_publique
```

- **Pression demande** : ratio `VE / bornes`, normalisé (0 → 0, ≥30 VE/borne → 100)
- **Opportunité mobilité** : nombre d'attracteurs dans le département, inversé (0 attracteur → 100, max attracteurs → 20)
- **Dépendance publique** : revenu médian inversé (16 k€ → 100, 35 k€ → 0)

La fonction `renderDeficitChart(scores)` trie les départements par score décroissant et
injecte dynamiquement les barres dans `#chart-deficit`. L'HTML ne contient plus de valeurs
codées en dur.

### 6.7 Construction des couches

| Fonction | Type Leaflet | Particularités |
|---|---|---|
| `computeDeficitScores` | — | Calcul composite (VE/borne, attracteurs, revenu) |
| `renderDeficitChart` | — | Rendu dynamique des barres dans `#chart-deficit` |
| `buildIRVELayer` | `MarkerClusterGroup` | chunkedLoading, radius 40, popup détaillée |
| `buildFastLayer` | `MarkerClusterGroup` | Filtre bornes ≥ 50 kW, icône jaune plus grande |
| `buildIrisLayer` | `LayerGroup` | **NOUVEAU** — Grille 10×14 rectangles, échelle 5 couleurs revenu |
| `buildDensiteLayer` | `LayerGroup` | **NOUVEAU** — Grille 10×14 rectangles, gradient spatial densité |
| `buildGaresLayer` | `LayerGroup` | Marqueurs simples, popup type RER/Transilien |
| `buildParkingLayer` | `LayerGroup` | Marqueurs simples, popup nombre de places |
| `buildCommerceLayer` | `LayerGroup` | Marqueurs simples, popup surface m² |
| `buildHeatmapLayer` | `HeatLayer` | Intensité pondérée par puissance kW |
| `buildZonesLayer` | `LayerGroup` | Rectangles hachurés, 8 zones simulées |

**MarkerClusterGroup** est la couche la plus complexe : elle regroupe automatiquement les
marqueurs proches en "clusters" (bulles numérotées) qui se décomposent au zoom.
La couleur des clusters passe de bleu (petit) à orange (moyen) à rouge (grand).

**HeatLayer** (Leaflet.heat) : chaque borne contribue à la chaleur proportionnellement à
sa puissance. Une borne à 350 kW pèse 10× plus qu'une borne à 3 kW dans le gradient.

### 6.6b Couches Demande potentielle — Détail de l'implémentation

Ces deux couches ont été **ajoutées lors de la mise à jour du 21 février 2026** pour corriger
leur absence de fonctionnement (les checkboxes existaient mais aucune couche n'était construite).

**Principe commun — grille choroplèthe simulée**

Les deux couches utilisent une grille régulière de **140 rectangles** (10 lignes × 14 colonnes)
couvrant le bounding box de l'Île-de-France. Chaque rectangle possède :
- Bordure transparente (`weight: 0`) pour un rendu fluide sans quadrillage visible
- Opacité de remplissage à 40% pour laisser voir le fond de carte en dessous
- Un popup Leaflet au clic indiquant la valeur et le niveau

**`buildIrisLayer()` — Revenu médian (seed = 17)**

```javascript
// Valeur simulée : revenu entre 14 000 et 48 000 €/an
const revenu = Math.round(14000 + rng() * 34000);
const color  = revenueColor(revenu);
```

Échelle de couleur du revenu médian :

| Seuil | Couleur | Niveau |
|---|---|---|
| < 18 000 €/an | Rouge #ef4444 | Très modeste |
| 18 000 – 23 000 €/an | Orange #f97316 | Modeste |
| 23 000 – 28 000 €/an | Jaune #eab308 | Intermédiaire |
| 28 000 – 35 000 €/an | Vert #22c55e | Aisé |
| > 35 000 €/an | Bleu #3b82f6 | Très aisé |

**`buildDensiteLayer()` — Densité de ménages (seed = 31)**

La densité n'est pas distribuée aléatoirement : elle est **calculée en fonction de la distance
au centre géographique** (Paris, coordonnées approximatives row=4.5 / col=5.5) :

```javascript
const dist = Math.sqrt((r - 4.5)² + (c - 5.5)²);
const base = Math.max(150, 22000 - dist * 3500);   // gradient centripète
const den  = Math.round(base * (0.55 + rng() * 0.9));
```

Ce calcul reproduit le gradient urbain réel d'Île-de-France : densité maximale à Paris
(>12 000 ménages/km²) décroissant vers la grande couronne rurale (<500/km²).

Échelle de couleur de la densité (bleu dégradé) :

| Seuil | Couleur | Niveau |
|---|---|---|
| < 500 /km² | Bleu très clair #bfdbfe | Rural |
| 500 – 2 000 /km² | Bleu clair #93c5fd | Péri-urbain |
| 2 000 – 6 000 /km² | Bleu #60a5fa | Urbain |
| 6 000 – 12 000 /km² | Bleu foncé #2563eb | Dense |
| > 12 000 /km² | Bleu marine #1e3a8a | Très dense |

### 6.7 Animation des KPI

```javascript
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);  // ease-out cubique
    el.textContent = fmt(Math.floor(eased * target));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
```

L'animation utilise `requestAnimationFrame` (synchronisé avec le taux de rafraîchissement
de l'écran, généralement 60 fps) et une fonction d'**easing cubique** qui ralentit
progressivement — effet naturel plus agréable qu'une progression linéaire.

### 6.8 Système de filtres

La fonction `applyFilters()` effectue un filtre en mémoire sur le tableau `STATE.bornes`,
puis **reconstruit entièrement les couches** Leaflet concernées :

```
getFilters()        → lit les 4 contrôles de filtre
     ↓
STATE.bornes.filter(...)   → filtre en mémoire O(n)
     ↓
map.removeLayer(ancienneCouche)
buildIRVELayer(bornesFiltrees)  → nouvelle couche
map.addLayer(nouvelleCouche)
```

Les 4 critères de filtre sont combinés avec un ET logique :
1. `puissance >= puissanceMin`
2. `prise` correspond à au moins un type coché
3. `dept` correspond au territoire sélectionné (ou `all`)
4. `operateur` contient la valeur sélectionnée (ou `all`)

### 6.9 Outil Isochrone

L'isochrone simule les zones accessibles en voiture depuis un point cliqué.
Il est représenté par 3 cercles concentriques :

| Rayon | Couleur | Temps estimé |
|---|---|---|
| 1 500 m | Vert | ~5 min |
| 3 000 m | Orange | ~10 min |
| 5 000 m | Rouge | ~15 min |

> **Note technique** : Il s'agit de cercles euclidiennes, non d'isochrones routières réels.
> En production, on utiliserait l'API **OpenRouteService** ou **Valhalla** pour des isochrones
> calculées sur le réseau routier réel.

Après le dessin, la fonction compte les bornes réelles dans le rayon de 5 km :
```javascript
STATE.bornes.filter(b => STATE.map.distance(latlng, [b.lat, b.lng]) <= 5000).length
```
`L.map.distance()` utilise la **formule de Haversine** (distance géodésique réelle).

### 6.10 Outil Comparaison

Permet de cliquer 2 points sur la carte et de comparer leur couverture IRVE :

```
Clic 1 → marqueur bleu ajouté à STATE.comparePoints
Clic 2 → marqueur orange ajouté
       → ligne en tirets tracée entre les 2 points
       → panneau #compare-panel affiché avec :
          - distance entre les 2 points (km)
          - nombre de bornes dans un rayon de 2 km autour de chaque point
          - différence absolue
```

Un 3e clic efface la comparaison et recommence.

### 6.11 Export CSV

```javascript
const header = 'id,nom,latitude,longitude,puissance_kw,type_prise,operateur,departement\n';
const rows = filtered.map(b => `${b.id},"${b.nom}",${b.lat},${b.lng},...`).join('\n');
const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
```

L'export utilise l'API `Blob` + `URL.createObjectURL` pour déclencher un téléchargement
côté client, **sans aucun serveur**. Le fichier exporté reflète les filtres actifs au
moment du clic (seules les bornes visibles sont exportées).

### 6.12 Séquence d'initialisation

```
DOMContentLoaded
└── init()
    ├── genBornes(1200)       → STATE.bornes
    ├── genGares(60)          → STATE.gares
    ├── genParkings(80)       → STATE.parkings
    ├── genCommerce(40)       → STATE.commerces
    ├── initMap()             → carte Leaflet + fond
    ├── build*Layer()×9       → STATE.layers.* (dont iris et densite ← nouveaux)
    ├── map.addLayer(irve)    → couche IRVE visible par défaut
    ├── map.on('click', ...)  → gestionnaire d'outils
    ├── renderKPIs()          → animation des 4 compteurs
    ├── renderRanking()       → liste des 10 communes
    ├── injectIsochroneHint() → div hint créé dynamiquement
    ├── initSidebar()         → bouton collapse
    ├── initRightPanel()      → bouton fermeture
    ├── initTabs()            → navigation onglets
    ├── initLayerToggles()    → checkboxes couches
    ├── initModal()           → modale À propos
    ├── initSlider()          → slider puissance
    ├── addEventListener×N    → filtres, outils, export
    └── showToast(...)        → message de bienvenue
```

---

## 7. Données et sources

### 7.1 Données simulées (mode démo)

Le dashboard utilise des **données synthétiques** générées algorithmiquement.
Les structures sont réalistes (mêmes attributs que les vrais jeux de données)
mais les positions géographiques sont aléatoires dans le bounding box IdF.

| Jeu de données | Nb points / cellules | Méthode | Seed |
|---|---|---|---|
| Bornes IRVE | 1 200 points | LCG aléatoire | 42 |
| Gares/pôles | 60 points | LCG aléatoire | 7 |
| Parkings relais | 80 points | LCG aléatoire | 13 |
| Centres commerciaux | 40 points | LCG aléatoire | 99 |
| Zones blanches | 8 rectangles | LCG aléatoire | 55 |
| **IRIS Revenu médian** | **140 cellules** | **Grille 10×14, LCG** | **17** |
| **Densité de ménages** | **140 cellules** | **Grille 10×14, gradient spatial** | **31** |

Les KPI affichés (14 823 bornes, 842 600 kW, 198 400 VE, ratio 13,4) sont des valeurs
statiques représentatives de l'état réel de l'Île-de-France.

### 7.2 Sources de données réelles (pour la production)

| Source | Contenu | Format | URL |
|---|---|---|---|
| data.gouv.fr — IRVE | Bornes, puissance, opérateur, géolocalisation | CSV/GeoJSON | data.gouv.fr |
| INSEE IRIS | Population, revenu médian, densité ménages | CSV + shapefile | insee.fr |
| SDES | Immatriculations VE par département | CSV mensuel | statistiques.developpement-durable.gouv.fr |
| IGN BD TOPO | Bâtiments, voirie | GeoJSON/Shapefile | geoservices.ign.fr |
| Île-de-France Mobilités | Gares, réseau TC (GTFS) | GeoJSON | data.iledefrance-mobilites.fr |
| OpenStreetMap / Overpass | Parkings, commerces, zones | GeoJSON | overpass-turbo.eu |

---

## 8. Fonctionnalités détaillées

### 8.1 Couches de données

| Couche | Couleur | Type Leaflet | Activée par défaut |
|---|---|---|---|
| Bornes IRVE | Bleu | MarkerClusterGroup | Oui |
| Recharge rapide >50 kW | Jaune | MarkerClusterGroup | Non |
| **IRIS Revenu médian** | **Rouge→Bleu (5 niveaux)** | **LayerGroup (140 rectangles)** | **Non** |
| **Densité de ménages** | **Bleu clair→marine** | **LayerGroup (140 rectangles)** | **Non** |
| Gares & pôles multimodaux | Rouge | LayerGroup | Non |
| Parkings relais | Orange | LayerGroup | Non |
| Centres commerciaux | Rose | LayerGroup | Non |
| Zones sous-équipées | Gris haché | LayerGroup (rectangles) | Non |

### 8.2 Filtres disponibles

| Filtre | Type contrôle | Plage / Valeurs |
|---|---|---|
| Puissance minimale | Range slider | 3 kW → 350 kW |
| Type de prise | Checkboxes multi | Type 2, CCS, CHAdeMO, T3 |
| Territoire | Select | 8 départements + IdF entière |
| Opérateur réseau | Select | 6 opérateurs + "Tous" |

### 8.3 Outils de la barre verticale

| Icône | Outil | Comportement |
|---|---|---|
| Loupe | Explorer (défaut) | Navigation libre + réouverture panneau droit |
| Cercle pointillé | Isochrone | Affiche hint, clic → 3 cercles + comptage bornes |
| Flamme | Heatmap | Active/désactive la couche de chaleur |
| Code compare | Comparaison | 2 clics → distance + densité de bornes |
| Maison | Recentrer | Retour à la vue IdF (zoom 10, Paris) |

### 8.4 Panneau d'analyse droit

**Onglet Déficit** : Score de 0 à 100 mesurant le manque de couverture par département,
**calculé dynamiquement** depuis les données simulées via `computeDeficitScores()`.
Formule composite : `0.40 × pression_demande + 0.35 × opportunité_mobilité + 0.25 × dépendance_publique`.
Barres colorées rouge (≥60) / orange (40–59) / vert (<40) selon la sévérité.

**Onglet Classement** : Top 10 communes avec leur score de potentiel non couvert.
Les 3 premières communes ont leur numéro en jaune (podium). Scores rouge (>70) ou orange (50-70).

### 8.5 Notifications toast

Un système de notifications non-bloquantes (`showToast`) informe l'utilisateur des actions :
- Chargement réussi (vert)
- Filtres appliqués avec nombre de bornes (vert)
- Outil activé (neutre)
- Erreur éventuelle (rouge)

Les toasts apparaissent en bas de l'écran, s'animent avec un `translateY`, et disparaissent
automatiquement après 3 secondes.

---

## 9. Analyse territoriale intégrée

### 9.1 Score de déficit territorial

Le score de déficit (0–100) est calculé selon une combinaison multicritère :

```
Score = f(densité VE/borne, proximité attracteurs mobilité, revenu médian IRIS)
```

| Score | Couleur | Interprétation |
|---|---|---|
| 70–100 | Rouge | Déficit critique — déploiement urgent |
| 40–69 | Orange | Déficit modéré — surveillance active |
| 0–39 | Vert | Couverture satisfaisante |

Résultats par département (données statiques simulées) :

| Département | Score | Niveau |
|---|---|---|
| Paris (75) | 72 | Critique |
| Seine-Saint-Denis (93) | 68 | Critique |
| Val-de-Marne (94) | 54 | Modéré |
| Hauts-de-Seine (92) | 48 | Modéré |
| Essonne (91) | 31 | Satisfaisant |
| Yvelines (78) | 28 | Satisfaisant |
| Val-d'Oise (95) | 22 | Satisfaisant |
| Seine-et-Marne (77) | 18 | Satisfaisant |

### 9.2 Recommandations prioritaires

| Priorité | Action recommandée |
|---|---|
| Haute | Déployer ≥200 bornes en résidentiel dense : Paris 13e, 19e, 20e |
| Haute | Couvrir les pôles d'échange en Seine-Saint-Denis (RER B, D) |
| Moyenne | Renforcer les hubs en Val-de-Marne (centres commerciaux sud) |
| Veille | Surveiller la croissance des immatriculations en grande couronne |

---

## 10. Limites et pistes d'évolution

### 10.1 Limites actuelles

| Limitation | Explication |
|---|---|
| Données simulées | Les bornes sont aléatoires, pas celles du vrai fichier IRVE |
| Isochrones euclidiens | Les cercles ne tiennent pas compte du réseau routier réel |
| IRIS simulé (grille régulière) | Les 140 cellules ne correspondent pas aux vrais contours IRIS INSEE |
| Pas de persistance | Les filtres et outils ne sont pas sauvegardés entre sessions |
| Pas de back-end | Impossible d'interroger des APIs distantes directement (CORS) |

> **Correction apportée** : La limitation "Couches IRIS non fonctionnelles" a été **résolue**
> lors de la mise à jour du 21 février 2026. Les deux couches sont désormais pleinement
> opérationnelles avec données simulées et légende enrichie.

### 10.2 Évolutions possibles

**Court terme**
- Charger le vrai fichier IRVE (CSV data.gouv.fr → parse en JS avec PapaParse)
- Intégrer les vraies gares via l'API data.iledefrance-mobilites.fr
- Ajouter une barre de recherche d'adresse (Nominatim/API Adresse)

**Moyen terme**
- Isochrones routières réelles via l'API OpenRouteService (gratuite, open source)
- Choroplèthe IRIS avec données INSEE (GeoJSON + D3.js ou Leaflet choropleth)
- Graphiques temporels d'évolution des immatriculations (Chart.js)
- Mode comparaison avant/après (slider de date)

**Long terme**
- Back-end léger (Node.js/FastAPI) pour interroger data.gouv.fr en temps réel
- Score de déficit calculé dynamiquement côté serveur
- Export PDF du rapport d'analyse (avec jsPDF)
- Authentification pour sauvegarder les analyses par utilisateur

---

## Conclusion

**IRVE Analytica** est un tableau de bord géospatial complet, architecturé de manière
modulaire et lisible. Il démontre les capacités d'analyse territoriale possibles avec des
outils open source (Leaflet, OpenStreetMap) sans nécessiter d'infrastructure serveur.

La mise à jour du 21 février 2026 a rendu **pleinement fonctionnelles** les deux couches
de demande potentielle (IRIS Revenu médian et Densité de ménages), qui étaient auparavant
des éléments d'interface sans implémentation. Le dashboard compte désormais **9 couches
cartographiques actives** contre 7 précédemment.

La transition vers des données réelles est principalement une question d'**intégration
des sources** : le code JavaScript est structuré pour recevoir des tableaux d'objets
avec les mêmes attributs que les générateurs simulés.

---

*Rapport généré le 22 février 2026 — IRVE Analytica v1.0*
*Mis à jour : suppression onglet Projection + calcul dynamique des scores de déficit territorial*
