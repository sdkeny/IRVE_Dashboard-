/* ============================================================
   IRVE Analytica — app.js
   Logique principale du tableau de bord
   ============================================================ */

'use strict';

/* ── 1. DONNÉES SIMULÉES ─────────────────────────────────── */

// KPI globaux
const KPI = {
  bornes:    14_823,
  puissance: 842_600,   // kW
  ve:        198_400,
  ratio:     13.4,
};

// Départements Île-de-France (codes)
const DEPTS = ['75','77','78','91','92','93','94','95'];

// Générateur pseudo-aléatoire déterministe (seed)
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Limites géographiques approximatives de l'Île-de-France
const IDF_BOUNDS = {
  minLat: 48.12, maxLat: 49.24,
  minLng:  1.45, maxLng:  3.56,
};

function randCoord(rng, bounds) {
  return [
    bounds.minLat + rng() * (bounds.maxLat - bounds.minLat),
    bounds.minLng + rng() * (bounds.maxLng - bounds.minLng),
  ];
}

// Opérateurs réseaux simulés
const OPERATEURS = ['Belib\' (Paris)','IZIVIA','Station-E','IONITY','Tesla Supercharger','Enedis','TotalEnergies','Freshmile'];
const TYPES_PRISE = ['Type2','CCS','CHAdeMO','T3'];

// Génération des bornes IRVE
function genBornes(n = 1200) {
  const rng = seededRand(42);
  const bornes = [];
  for (let i = 0; i < n; i++) {
    const puissance = [3,7,11,22,50,100,150,350][Math.floor(rng() * 8)];
    const prise = TYPES_PRISE[Math.floor(rng() * TYPES_PRISE.length)];
    const operateur = OPERATEURS[Math.floor(rng() * OPERATEURS.length)];
    const dept = DEPTS[Math.floor(rng() * DEPTS.length)];
    bornes.push({
      id: i,
      lat: IDF_BOUNDS.minLat + rng() * (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat),
      lng: IDF_BOUNDS.minLng + rng() * (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng),
      puissance,
      prise,
      operateur,
      dept,
      nom: `Station ${operateur} #${i + 1}`,
    });
  }
  return bornes;
}

// Génération des gares
function genGares(n = 60) {
  const rng = seededRand(7);
  const GARES_NOMS = [
    'Gare du Nord','Gare de Lyon','Montparnasse','Saint-Lazare','Gare de l\'Est',
    'Châtelet-les-Halles','La Défense','Versailles-RD','Marne-la-Vallée',
    'Roissy CDG','Orly','Poissy','Pontoise','Melun','Évry-Courcouronnes',
    'Créteil-Préfecture','Bobigny','Saint-Denis','Argenteuil','Cergy',
  ];
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    lat: IDF_BOUNDS.minLat + rng() * (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat),
    lng: IDF_BOUNDS.minLng + rng() * (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng),
    nom: GARES_NOMS[i % GARES_NOMS.length] + (i >= GARES_NOMS.length ? ` ${i}` : ''),
    type: rng() > 0.5 ? 'RER' : 'Transilien',
  }));
}

// Parkings relais
function genParkings(n = 80) {
  const rng = seededRand(13);
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    lat: IDF_BOUNDS.minLat + rng() * (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat),
    lng: IDF_BOUNDS.minLng + rng() * (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng),
    nom: `Parking Relais P${i + 1}`,
    places: Math.floor(rng() * 500) + 50,
  }));
}

// Centres commerciaux
function genCommerce(n = 40) {
  const rng = seededRand(99);
  const NOMS = ['Westfield','Carrefour','Auchan','Belle Épine','Parly 2','So Ouest','Vélizy 2','Les 4 Temps','Forum des Halles','Créteil Soleil'];
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    lat: IDF_BOUNDS.minLat + rng() * (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat),
    lng: IDF_BOUNDS.minLng + rng() * (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng),
    nom: NOMS[i % NOMS.length] + (i >= NOMS.length ? ` ${i}` : ''),
    surface: Math.floor(rng() * 80000) + 5000,
  }));
}

/* ── Données VE par département (SDES 2024) ──────────────── */
const VE_DEPT = {
  '75': 52000, '77': 7400,  '78': 22000, '91': 18000,
  '92': 31000, '93': 28000, '94': 25000, '95': 15000,
};

const DEPT_LABELS = {
  '75': 'Paris (75)',
  '77': 'Seine-et-Marne (77)',
  '78': 'Yvelines (78)',
  '91': 'Essonne (91)',
  '92': 'Hauts-de-Seine (92)',
  '93': 'Seine-St-Denis (93)',
  '94': 'Val-de-Marne (94)',
  '95': "Val-d'Oise (95)",
};

// Emprise géographique approx. de chaque département (pour comptage attracteurs)
const DEPT_ZONES = {
  '75': { minLat: 48.815, maxLat: 48.902, minLng: 2.224, maxLng: 2.469 },
  '77': { minLat: 48.12,  maxLat: 49.02,  minLng: 2.56,  maxLng: 3.56  },
  '78': { minLat: 48.52,  maxLat: 49.10,  minLng: 1.45,  maxLng: 2.10  },
  '91': { minLat: 48.22,  maxLat: 48.78,  minLng: 1.93,  maxLng: 2.62  },
  '92': { minLat: 48.77,  maxLat: 48.95,  minLng: 2.15,  maxLng: 2.34  },
  '93': { minLat: 48.85,  maxLat: 49.02,  minLng: 2.34,  maxLng: 2.64  },
  '94': { minLat: 48.72,  maxLat: 48.87,  minLng: 2.31,  maxLng: 2.58  },
  '95': { minLat: 48.92,  maxLat: 49.24,  minLng: 1.77,  maxLng: 2.64  },
};

// Revenu médian de référence par département (INSEE 2022, €/UC/an)
const DEPT_REVENUE = {
  '75': 28000, '77': 26000, '78': 32000, '91': 27000,
  '92': 35000, '93': 18000, '94': 24000, '95': 25000,
};

// Communes classement
const RANKING_DATA = [
  { name: 'Saint-Denis (93)', score: 91, level: 'high' },
  { name: 'Montreuil (93)',   score: 87, level: 'high' },
  { name: 'Paris 19e (75)',   score: 85, level: 'high' },
  { name: 'Paris 20e (75)',   score: 82, level: 'high' },
  { name: 'Paris 13e (75)',   score: 79, level: 'high' },
  { name: 'Vitry-sur-Seine (94)', score: 74, level: 'high' },
  { name: 'Bobigny (93)',     score: 68, level: 'medium' },
  { name: 'Créteil (94)',     score: 62, level: 'medium' },
  { name: 'Argenteuil (95)', score: 57, level: 'medium' },
  { name: 'Aulnay-sous-Bois (93)', score: 53, level: 'medium' },
];

/* ── 2. ÉTAT GLOBAL ──────────────────────────────────────── */

const STATE = {
  map: null,
  layers: {
    irve:    null,  // MarkerClusterGroup
    fast:    null,
    iris:    null,
    densite: null,
    gares:   null,
    parking: null,
    commerce: null,
    heatmap: null,
    zones:   null,
  },
  bornes: [],
  gares: [],
  parkings: [],
  commerces: [],
  currentTool: 'explore',
  isochroneMarker: null,
  isochroneCircle: null,
  comparePoints: [],
  compareLayers: [],
  sidebarOpen: true,
  rightPanelOpen: true,
};

/* ── 3. HELPERS ──────────────────────────────────────────── */

function fmt(n) {
  return n.toLocaleString('fr-FR');
}

function showToast(msg, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  });
}

/* ── 4. INITIALISATION DE LA CARTE ───────────────────────── */

function initMap() {
  STATE.map = L.map('map', {
    center: [48.8566, 2.3522],
    zoom: 10,
    zoomControl: false,
  });

  // Fond de carte sombre
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(STATE.map);

  // Zoom control en bas à droite
  L.control.zoom({ position: 'bottomright' }).addTo(STATE.map);

  // Affichage coordonnées
  STATE.map.on('mousemove', (e) => {
    const { lat, lng } = e.latlng;
    document.getElementById('coords-text').textContent =
      `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  });

  STATE.map.on('mouseout', () => {
    document.getElementById('coords-text').textContent = 'Survolez la carte';
  });
}

/* ── 5. ICÔNES LEAFLET ───────────────────────────────────── */

function makeCircleIcon(color, size = 10) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,.35);
      box-shadow:0 0 6px ${color}88;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ICONS = {
  irve:    () => makeCircleIcon('#3b82f6', 10),
  fast:    () => makeCircleIcon('#eab308', 12),
  gare:    () => makeCircleIcon('#ef4444', 12),
  parking: () => makeCircleIcon('#f97316', 10),
  commerce:() => makeCircleIcon('#ec4899', 10),
};

/* ── 6. CRÉATION DES COUCHES ─────────────────────────────── */

function buildIRVELayer(bornes) {
  const group = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 40,
  });
  bornes.forEach(b => {
    const marker = L.marker([b.lat, b.lng], { icon: ICONS.irve() });
    marker.bindPopup(popupIRVE(b));
    group.addLayer(marker);
  });
  return group;
}

function buildFastLayer(bornes) {
  const group = L.markerClusterGroup({ maxClusterRadius: 60 });
  bornes.filter(b => b.puissance >= 50).forEach(b => {
    const marker = L.marker([b.lat, b.lng], { icon: ICONS.fast() });
    marker.bindPopup(popupIRVE(b));
    group.addLayer(marker);
  });
  return group;
}

function buildGaresLayer(gares) {
  const group = L.layerGroup();
  gares.forEach(g => {
    const marker = L.marker([g.lat, g.lng], { icon: ICONS.gare() });
    marker.bindPopup(`
      <div class="popup-title"><i class="fa-solid fa-train"></i> ${g.nom}</div>
      <div class="popup-row"><span class="popup-key">Type</span><span class="popup-val">${g.type}</span></div>
    `);
    group.addLayer(marker);
  });
  return group;
}

function buildParkingLayer(parkings) {
  const group = L.layerGroup();
  parkings.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: ICONS.parking() });
    marker.bindPopup(`
      <div class="popup-title"><i class="fa-solid fa-square-parking"></i> ${p.nom}</div>
      <div class="popup-row"><span class="popup-key">Places</span><span class="popup-val">${p.places}</span></div>
    `);
    group.addLayer(marker);
  });
  return group;
}

function buildCommerceLayer(commerces) {
  const group = L.layerGroup();
  commerces.forEach(c => {
    const marker = L.marker([c.lat, c.lng], { icon: ICONS.commerce() });
    marker.bindPopup(`
      <div class="popup-title"><i class="fa-solid fa-bag-shopping"></i> ${c.nom}</div>
      <div class="popup-row"><span class="popup-key">Surface</span><span class="popup-val">${fmt(c.surface)} m²</span></div>
    `);
    group.addLayer(marker);
  });
  return group;
}

function buildHeatmapLayer(bornes) {
  const points = bornes.map(b => [b.lat, b.lng, 0.5 + (b.puissance / 350) * 0.5]);
  return L.heatLayer(points, {
    radius: 20,
    blur: 15,
    maxZoom: 14,
    gradient: { 0.2: '#1e40af', 0.4: '#7c3aed', 0.6: '#dc2626', 0.8: '#f97316', 1.0: '#fef08a' },
  });
}

function buildZonesLayer() {
  // Zones blanches simulées (polygones rectangulaires)
  const rng = seededRand(55);
  const group = L.layerGroup();
  for (let i = 0; i < 8; i++) {
    const lat = IDF_BOUNDS.minLat + rng() * (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat);
    const lng = IDF_BOUNDS.minLng + rng() * (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng);
    const size = 0.03 + rng() * 0.06;
    L.rectangle(
      [[lat - size, lng - size], [lat + size, lng + size]],
      {
        color: '#64748b',
        fillColor: '#64748b',
        fillOpacity: 0.18,
        weight: 1,
        dashArray: '4 4',
      }
    ).bindPopup('<div class="popup-title">Zone sous-équipée</div><div class="popup-row"><span class="popup-key">Déficit estimé</span><span class="popup-val">Élevé</span></div>')
     .addTo(group);
  }
  return group;
}

/* ── 6b. COUCHES IRIS & DENSITÉ ──────────────────────────── */

// ── Helpers couleur revenu médian ─────────────────────────
function revenueColor(val) {
  if (val < 18000) return '#ef4444';   // Très modeste
  if (val < 23000) return '#f97316';   // Modeste
  if (val < 28000) return '#eab308';   // Intermédiaire
  if (val < 35000) return '#22c55e';   // Aisé
  return '#3b82f6';                    // Très aisé
}
function revenueLabel(val) {
  if (val < 18000) return 'Très modeste (&lt;18 k€)';
  if (val < 23000) return 'Modeste (18–23 k€)';
  if (val < 28000) return 'Intermédiaire (23–28 k€)';
  if (val < 35000) return 'Aisé (28–35 k€)';
  return 'Très aisé (&gt;35 k€)';
}

// ── Helpers couleur densité de ménages ────────────────────
function densiteColor(val) {
  if (val < 500)   return '#bfdbfe';
  if (val < 2000)  return '#93c5fd';
  if (val < 6000)  return '#60a5fa';
  if (val < 12000) return '#2563eb';
  return '#1e3a8a';
}
function densiteLabel(val) {
  if (val < 500)   return 'Rural (&lt;500/km²)';
  if (val < 2000)  return 'Péri-urbain (500–2 000/km²)';
  if (val < 6000)  return 'Urbain (2 000–6 000/km²)';
  if (val < 12000) return 'Dense (6 000–12 000/km²)';
  return 'Très dense (&gt;12 000/km²)';
}

// ── Couche IRIS — Revenu médian ───────────────────────────
function buildIrisLayer() {
  const rng = seededRand(17);
  const group = L.layerGroup();
  const ROWS = 10, COLS = 14;
  const latStep = (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat) / ROWS;
  const lngStep = (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng) / COLS;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const lat    = IDF_BOUNDS.minLat + r * latStep;
      const lng    = IDF_BOUNDS.minLng + c * lngStep;
      const revenu = Math.round(14000 + rng() * 34000);
      const color  = revenueColor(revenu);
      L.rectangle(
        [[lat + latStep * 0.02, lng + lngStep * 0.02],
         [lat + latStep * 0.96, lng + lngStep * 0.96]],
        { color: 'transparent', fillColor: color, fillOpacity: 0.40, weight: 0 }
      ).bindPopup(`
        <div class="popup-title"><i class="fa-solid fa-users"></i> Zone IRIS — Revenu</div>
        <div class="popup-row"><span class="popup-key">Revenu médian</span><span class="popup-val">${fmt(revenu)} €/an</span></div>
        <div class="popup-row"><span class="popup-key">Niveau</span><span class="popup-val">${revenueLabel(revenu)}</span></div>
      `).addTo(group);
    }
  }
  return group;
}

// ── Couche Densité de ménages ─────────────────────────────
function buildDensiteLayer() {
  const rng = seededRand(31);
  const group = L.layerGroup();
  const ROWS = 10, COLS = 14;
  const latStep = (IDF_BOUNDS.maxLat - IDF_BOUNDS.minLat) / ROWS;
  const lngStep = (IDF_BOUNDS.maxLng - IDF_BOUNDS.minLng) / COLS;
  const centerRow = 4.5, centerCol = 5.5; // Paris approximatif

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const lat  = IDF_BOUNDS.minLat + r * latStep;
      const lng  = IDF_BOUNDS.minLng + c * lngStep;
      const dist = Math.sqrt(Math.pow(r - centerRow, 2) + Math.pow(c - centerCol, 2));
      const base = Math.max(150, 22000 - dist * 3500);
      const den  = Math.round(base * (0.55 + rng() * 0.9));
      const color = densiteColor(den);
      L.rectangle(
        [[lat + latStep * 0.02, lng + lngStep * 0.02],
         [lat + latStep * 0.96, lng + lngStep * 0.96]],
        { color: 'transparent', fillColor: color, fillOpacity: 0.40, weight: 0 }
      ).bindPopup(`
        <div class="popup-title"><i class="fa-solid fa-house"></i> Zone IRIS — Densité</div>
        <div class="popup-row"><span class="popup-key">Densité ménages</span><span class="popup-val">${fmt(den)} /km²</span></div>
        <div class="popup-row"><span class="popup-key">Niveau</span><span class="popup-val">${densiteLabel(den)}</span></div>
      `).addTo(group);
    }
  }
  return group;
}

/* ── 7. POPUPS ───────────────────────────────────────────── */

function popupIRVE(b) {
  const fast = b.puissance >= 50;
  return `
    <div class="popup-title"><i class="fa-solid fa-plug-circle-bolt"></i> ${b.nom}</div>
    <div class="popup-row">
      <span class="popup-key">Puissance</span>
      <span class="popup-val">${b.puissance} kW</span>
    </div>
    <div class="popup-row">
      <span class="popup-key">Type de prise</span>
      <span class="popup-val">${b.prise}</span>
    </div>
    <div class="popup-row">
      <span class="popup-key">Opérateur</span>
      <span class="popup-val">${b.operateur}</span>
    </div>
    <div class="popup-row">
      <span class="popup-key">Département</span>
      <span class="popup-val">${b.dept}</span>
    </div>
    <span class="popup-badge ${fast ? 'fast' : 'std'}">${fast ? '⚡ Recharge rapide' : 'Standard'}</span>
  `;
}

/* ── 8. AFFICHAGE DES KPI ────────────────────────────────── */

function animateCounter(el, target, suffix = '', duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = fmt(value) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = fmt(target) + suffix;
  };
  requestAnimationFrame(update);
}

function renderKPIs() {
  animateCounter(document.getElementById('kpi-bornes'),    KPI.bornes);
  animateCounter(document.getElementById('kpi-puissance'), KPI.puissance);
  animateCounter(document.getElementById('kpi-ve'),        KPI.ve);
  document.getElementById('kpi-ratio').textContent = KPI.ratio.toFixed(1);
}

/* ── 9. CALCUL DU SCORE DE DÉFICIT ───────────────────────── */

/**
 * Calcule le score de déficit territorial par département.
 *
 * Formule :
 *   Score = 0.40 × pression_demande
 *         + 0.35 × opportunite_mobilite
 *         + 0.25 × dependance_publique
 *
 * Composante 1 — Pression demande (40 %)
 *   Ratio VE/borne local, normalisé (0 → 0, ≥30 → 100).
 *
 * Composante 2 — Opportunité mobilité (35 %)
 *   Nombre d'attracteurs (gares + parkings + commerces) dans l'emprise
 *   du département. Peu d'attracteurs = fort déficit d'opportunité.
 *
 * Composante 3 — Dépendance publique (25 %)
 *   Revenu médian INSEE : un revenu bas signifie une dépendance totale
 *   aux bornes publiques (pas de borne privée accessible).
 */
function computeDeficitScores() {
  // ── Comptage bornes par département (attribut dept des données simulées)
  const bornesParDept = Object.fromEntries(DEPTS.map(d => [d, 0]));
  STATE.bornes.forEach(b => {
    if (b.dept in bornesParDept) bornesParDept[b.dept]++;
  });

  // ── Comptage attracteurs par zone géographique département
  const attractParDept = Object.fromEntries(DEPTS.map(d => [d, 0]));
  [...STATE.gares, ...STATE.parkings, ...STATE.commerces].forEach(a => {
    for (const [dept, z] of Object.entries(DEPT_ZONES)) {
      if (a.lat >= z.minLat && a.lat <= z.maxLat &&
          a.lng >= z.minLng && a.lng <= z.maxLng) {
        attractParDept[dept]++;
        break;
      }
    }
  });

  const maxAttract = Math.max(1, ...Object.values(attractParDept));

  // ── Calcul du score composite par département
  const scores = {};
  DEPTS.forEach(dept => {
    const ve     = VE_DEPT[dept]     ?? 0;
    const bornes = bornesParDept[dept] || 1;
    const ratio  = ve / bornes;

    // Composante 1 : pression demande [0–100]
    const pression    = Math.min(100, (ratio / 30) * 100);

    // Composante 2 : opportunité mobilité [0–100]
    // Plus d'attracteurs = moins de déficit d'opportunité
    const opportunite = Math.max(0, 100 - (attractParDept[dept] / maxAttract) * 80);

    // Composante 3 : dépendance à la recharge publique [0–100]
    // Revenu bas = dépendance forte
    const rev        = DEPT_REVENUE[dept] ?? 27000;
    const dependance = Math.max(0, Math.min(100,
      ((35000 - rev) / (35000 - 16000)) * 100
    ));

    scores[dept] = Math.round(
      0.40 * pression +
      0.35 * opportunite +
      0.25 * dependance
    );
  });

  return scores;
}

function renderDeficitChart(scores) {
  const chart = document.getElementById('chart-deficit');
  if (!chart) return;

  const sorted = DEPTS
    .map(d => ({ dept: d, label: DEPT_LABELS[d], score: scores[d] }))
    .sort((a, b) => b.score - a.score);

  chart.innerHTML = sorted.map(({ label, score }) => {
    const cls = score >= 60 ? 'red' : score >= 40 ? 'orange' : 'green';
    return `
      <div class="bar-row">
        <span class="bar-label">${label}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${score}%">${score}</div></div>
      </div>`;
  }).join('');
}

/* ── 10. CLASSEMENT COMMUNES ─────────────────────────────── */

function renderRanking() {
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  RANKING_DATA.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'ranking-item';
    div.innerHTML = `
      <span class="rank-num ${idx < 3 ? 'top' : ''}">${idx + 1}</span>
      <span class="rank-name">${item.name}</span>
      <span class="rank-score ${item.level}">${item.score}</span>
    `;
    list.appendChild(div);
  });
}

/* ── 11. FILTRES ─────────────────────────────────────────── */

function getFilters() {
  const puissanceMin = parseInt(document.getElementById('filter-puissance').value, 10);
  const prises = [...document.querySelectorAll('.cb-prise:checked')].map(cb => cb.value);
  const territoire = document.getElementById('filter-territoire').value;
  const operateur = document.getElementById('filter-operateur').value.toLowerCase();
  return { puissanceMin, prises, territoire, operateur };
}

function applyFilters() {
  const f = getFilters();

  // Filtrer les bornes
  const filtered = STATE.bornes.filter(b => {
    if (b.puissance < f.puissanceMin) return false;
    if (!f.prises.some(p => b.prise.toLowerCase().includes(p.toLowerCase()))) return false;
    if (f.territoire !== 'all' && b.dept !== f.territoire) return false;
    if (f.operateur !== 'all' && !b.operateur.toLowerCase().includes(f.operateur)) return false;
    return true;
  });

  // Reconstruire la couche IRVE
  if (STATE.map.hasLayer(STATE.layers.irve)) {
    STATE.map.removeLayer(STATE.layers.irve);
  }
  STATE.layers.irve = buildIRVELayer(filtered);
  if (document.getElementById('cb-irve').checked) {
    STATE.map.addLayer(STATE.layers.irve);
  }

  // Reconstruire la couche fast
  if (STATE.map.hasLayer(STATE.layers.fast)) {
    STATE.map.removeLayer(STATE.layers.fast);
  }
  STATE.layers.fast = buildFastLayer(filtered);
  if (document.getElementById('cb-fast').checked) {
    STATE.map.addLayer(STATE.layers.fast);
  }

  // Heatmap
  if (STATE.map.hasLayer(STATE.layers.heatmap)) {
    STATE.map.removeLayer(STATE.layers.heatmap);
  }
  STATE.layers.heatmap = buildHeatmapLayer(filtered);
  if (STATE.currentTool === 'heatmap') {
    STATE.map.addLayer(STATE.layers.heatmap);
  }

  showToast(`${fmt(filtered.length)} bornes affichées`, 'success');
}

function resetFilters() {
  document.getElementById('filter-puissance').value = 3;
  document.getElementById('filter-puissance-val').textContent = '3 kW';
  document.querySelectorAll('.cb-prise').forEach(cb => cb.checked = true);
  document.getElementById('filter-territoire').value = 'all';
  document.getElementById('filter-operateur').value = 'all';
  applyFilters();
  showToast('Filtres réinitialisés');
}

/* ── 12. OUTILS CARTE ────────────────────────────────────── */

function setTool(name) {
  STATE.currentTool = name;
  document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`tool-${name}`);
  if (btn) btn.classList.add('active');

  // Nettoyage
  clearIsochrone();
  clearCompare();
  hideIsochroneHint();

  // Heatmap
  if (name === 'heatmap') {
    if (!STATE.map.hasLayer(STATE.layers.heatmap)) {
      STATE.map.addLayer(STATE.layers.heatmap);
    }
    showToast('Carte de chaleur activée');
  } else {
    if (STATE.map.hasLayer(STATE.layers.heatmap)) {
      STATE.map.removeLayer(STATE.layers.heatmap);
    }
  }

  // Isochrone
  if (name === 'isochrone') {
    showIsochroneHint();
    showToast('Cliquez sur la carte pour calculer l\'accessibilité');
  }

  // Compare
  if (name === 'compare') {
    showToast('Cliquez deux points sur la carte pour les comparer');
  }
}

/* ── 13. ISOCHRONE SIMULÉ ────────────────────────────────── */

function showIsochroneHint() {
  const hint = document.getElementById('isochrone-hint');
  if (hint) hint.classList.add('visible');
}

function hideIsochroneHint() {
  const hint = document.getElementById('isochrone-hint');
  if (hint) hint.classList.remove('visible');
}

function clearIsochrone() {
  if (STATE.isochroneMarker) { STATE.map.removeLayer(STATE.isochroneMarker); STATE.isochroneMarker = null; }
  if (STATE.isochroneCircle) { STATE.map.removeLayer(STATE.isochroneCircle); STATE.isochroneCircle = null; }
}

function drawIsochrone(latlng) {
  clearIsochrone();
  // Rayon approximatif 5 min à véhicule = ~1.5 km, 10 min = 3 km
  const RADII = [1500, 3000, 5000];
  const COLORS = ['#22c55e', '#f97316', '#ef4444'];
  STATE.isochroneCircle = L.layerGroup();
  RADII.reverse().forEach((r, i) => {
    L.circle(latlng, {
      radius: r,
      color: COLORS[i],
      fillColor: COLORS[i],
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: i > 0 ? '6 4' : null,
    }).addTo(STATE.isochroneCircle);
  });
  STATE.isochroneCircle.addTo(STATE.map);
  STATE.isochroneMarker = L.circleMarker(latlng, {
    radius: 5, color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2,
  }).addTo(STATE.map);

  // Compter les bornes dans le rayon de 5 km
  const countNear = STATE.bornes.filter(b => {
    const d = STATE.map.distance(latlng, [b.lat, b.lng]);
    return d <= 5000;
  }).length;
  showToast(`${countNear} bornes dans un rayon de 5 km`);
}

/* ── 14. OUTIL COMPARAISON ───────────────────────────────── */

function clearCompare() {
  STATE.comparePoints = [];
  STATE.compareLayers.forEach(l => STATE.map.removeLayer(l));
  STATE.compareLayers = [];
  const panel = document.getElementById('compare-panel');
  if (panel) panel.classList.remove('visible');
}

function addComparePoint(latlng) {
  if (STATE.comparePoints.length >= 2) clearCompare();
  STATE.comparePoints.push(latlng);
  const marker = L.circleMarker(latlng, {
    radius: 7,
    color: '#fff',
    fillColor: STATE.comparePoints.length === 1 ? '#3b82f6' : '#f97316',
    fillOpacity: 1,
    weight: 2,
  }).addTo(STATE.map);
  STATE.compareLayers.push(marker);

  if (STATE.comparePoints.length === 2) {
    const [p1, p2] = STATE.comparePoints;
    const dist = (STATE.map.distance(p1, p2) / 1000).toFixed(2);

    const c1 = countBornesNear(p1, 2000);
    const c2 = countBornesNear(p2, 2000);

    const line = L.polyline([p1, p2], { color: '#8b92b0', dashArray: '6 4', weight: 1.5 }).addTo(STATE.map);
    STATE.compareLayers.push(line);

    let panel = document.getElementById('compare-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'compare-panel';
      panel.className = 'compare-panel';
      document.querySelector('.map-wrapper').appendChild(panel);
    }
    panel.innerHTML = `
      <h4><i class="fa-solid fa-code-compare"></i> Comparaison de zones</h4>
      <div class="compare-zone"><span>Distance</span><strong>${dist} km</strong></div>
      <div class="compare-zone"><span>Zone A — Bornes (2 km)</span><strong>${c1}</strong></div>
      <div class="compare-zone"><span>Zone B — Bornes (2 km)</span><strong>${c2}</strong></div>
      <div class="compare-zone"><span>Différence</span><strong>${Math.abs(c1 - c2)} bornes</strong></div>
    `;
    panel.classList.add('visible');
  }
}

function countBornesNear(latlng, radius) {
  return STATE.bornes.filter(b => STATE.map.distance(latlng, [b.lat, b.lng]) <= radius).length;
}

/* ── 15. CLICK CARTE ─────────────────────────────────────── */

function onMapClick(e) {
  if (STATE.currentTool === 'isochrone') {
    drawIsochrone(e.latlng);
  } else if (STATE.currentTool === 'compare') {
    addComparePoint(e.latlng);
  }
}

/* ── 16. EXPORT ──────────────────────────────────────────── */

function exportData() {
  const f = getFilters();
  const filtered = STATE.bornes.filter(b => {
    if (b.puissance < f.puissanceMin) return false;
    if (!f.prises.some(p => b.prise.toLowerCase().includes(p.toLowerCase()))) return false;
    if (f.territoire !== 'all' && b.dept !== f.territoire) return false;
    if (f.operateur !== 'all' && !b.operateur.toLowerCase().includes(f.operateur)) return false;
    return true;
  });

  const header = 'id,nom,latitude,longitude,puissance_kw,type_prise,operateur,departement\n';
  const rows = filtered.map(b =>
    `${b.id},"${b.nom}",${b.lat.toFixed(6)},${b.lng.toFixed(6)},${b.puissance},${b.prise},"${b.operateur}",${b.dept}`
  ).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `irve_idf_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`${fmt(filtered.length)} bornes exportées en CSV`, 'success');
}

/* ── 17. SIDEBAR & PANELS ────────────────────────────────── */

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.getElementById('sidebar-toggle');
  const icon    = document.getElementById('toggle-icon');

  toggle.addEventListener('click', () => {
    STATE.sidebarOpen = !STATE.sidebarOpen;
    sidebar.classList.toggle('collapsed', !STATE.sidebarOpen);
    icon.className = STATE.sidebarOpen ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right';
    setTimeout(() => STATE.map.invalidateSize(), 210);
  });
}

function initRightPanel() {
  document.getElementById('close-right-panel').addEventListener('click', () => {
    document.getElementById('right-panel').classList.add('hidden');
    setTimeout(() => STATE.map.invalidateSize(), 210);
  });
}

/* ── 18. ONGLETS ─────────────────────────────────────────── */

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

/* ── 19. TOGGLES DE COUCHES ──────────────────────────────── */

function initLayerToggles() {
  const toggles = {
    'cb-irve':     { layer: 'irve',     label: 'layer-irve'    },
    'cb-fast':     { layer: 'fast',     label: 'layer-fast'    },
    'cb-iris':     { layer: 'iris',     label: 'layer-iris'    },
    'cb-densite':  { layer: 'densite',  label: 'layer-densite' },
    'cb-gares':    { layer: 'gares',    label: 'layer-gares'   },
    'cb-parking':  { layer: 'parking',  label: 'layer-parking' },
    'cb-commerce': { layer: 'commerce', label: 'cb-label-commerce'},
    'cb-zones':    { layer: 'zones',    label: 'layer-zones'   },
  };

  Object.entries(toggles).forEach(([cbId, { layer, label }]) => {
    const cb = document.getElementById(cbId);
    if (!cb) return;
    cb.addEventListener('change', () => {
      const lyr = STATE.layers[layer];
      if (!lyr) return;
      if (cb.checked) {
        STATE.map.addLayer(lyr);
      } else {
        STATE.map.removeLayer(lyr);
      }
    });
  });
}

/* ── 20. MODAL INFOS ─────────────────────────────────────── */

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('btn-help').addEventListener('click', () => {
    overlay.classList.add('open');
  });
  document.getElementById('modal-close').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
}

/* ── 21. PUISSANCE SLIDER ────────────────────────────────── */

function initSlider() {
  const slider = document.getElementById('filter-puissance');
  const label  = document.getElementById('filter-puissance-val');
  slider.addEventListener('input', () => {
    label.textContent = `${slider.value} kW`;
  });
}

/* ── 22. INJECTION HINT ISOCHRONE ────────────────────────── */

function injectIsochroneHint() {
  const hint = document.createElement('div');
  hint.id = 'isochrone-hint';
  hint.className = 'isochrone-hint';
  hint.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Cliquez sur la carte pour calculer l\'isochrone d\'accessibilité';
  document.querySelector('.map-wrapper').appendChild(hint);
}

/* ── 23. INITIALISATION PRINCIPALE ──────────────────────── */

function init() {
  // Données
  STATE.bornes    = genBornes(1200);
  STATE.gares     = genGares(60);
  STATE.parkings  = genParkings(80);
  STATE.commerces = genCommerce(40);

  // Carte
  initMap();

  // Couches
  STATE.layers.irve     = buildIRVELayer(STATE.bornes);
  STATE.layers.fast     = buildFastLayer(STATE.bornes);
  STATE.layers.iris     = buildIrisLayer();
  STATE.layers.densite  = buildDensiteLayer();
  STATE.layers.gares    = buildGaresLayer(STATE.gares);
  STATE.layers.parking  = buildParkingLayer(STATE.parkings);
  STATE.layers.commerce = buildCommerceLayer(STATE.commerces);
  STATE.layers.heatmap  = buildHeatmapLayer(STATE.bornes);
  STATE.layers.zones    = buildZonesLayer();

  // Couche IRVE active par défaut
  STATE.map.addLayer(STATE.layers.irve);

  // Événement clic carte
  STATE.map.on('click', onMapClick);

  // KPIs
  renderKPIs();
  renderRanking();

  // Scores de déficit calculés depuis les données simulées
  const deficitScores = computeDeficitScores();
  renderDeficitChart(deficitScores);

  // UI
  injectIsochroneHint();
  initSidebar();
  initRightPanel();
  initTabs();
  initLayerToggles();
  initModal();
  initSlider();

  // Filtres
  document.getElementById('btn-apply-filters').addEventListener('click', applyFilters);
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

  // Outils carte
  ['explore','isochrone','heatmap','compare'].forEach(tool => {
    const btn = document.getElementById(`tool-${tool}`);
    if (btn) btn.addEventListener('click', () => setTool(tool));
  });

  document.getElementById('tool-home').addEventListener('click', () => {
    STATE.map.setView([48.8566, 2.3522], 10);
    showToast('Vue recentrée sur l\'Île-de-France');
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', exportData);

  // Panneau droit : affichage au clic sur un outil d'analyse
  document.getElementById('tool-explore').addEventListener('click', () => {
    document.getElementById('right-panel').classList.remove('hidden');
    setTimeout(() => STATE.map.invalidateSize(), 210);
  });

  showToast('Dashboard IRVE chargé — 1 200 bornes simulées', 'success');
}

// Lancement
document.addEventListener('DOMContentLoaded', init);
