<template>
  <div class="world-hex-map-form">
    <!-- FORM HEADER -->
    <div class="form-header">
      <div class="title">World Builder's Handbook — World Terrain Map</div>
      <div class="method-tag">Form 0407F-IV Part W.M1 · Icosahedron Hex Map · Click hexes to assign terrain</div>
    </div>

    <!-- IDENTITY ROW -->
    <div class="identity-row">
      <div class="id-cell grow-3">
        <label class="id-label">World</label>
        <div class="id-static">{{ seedWorldName || "—" }}</div>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">UWP</label>
        <div class="id-static">{{ seedUwp || "—" }}</div>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">World Size</label>
        <div class="id-static">{{ seedWorldSize || "—" }}</div>
      </div>
    </div>

    <!-- TERRAIN PALETTE -->
    <div class="terrain-controls">
      <div class="palette-section">
        <label class="palette-label">Terrain Type:</label>
        <div class="terrain-palette">
          <button
            v-for="t in TERRAIN_TYPES"
            :key="t.id"
            @click="selectedTerrain = t.id"
            :class="['terrain-btn', { active: selectedTerrain === t.id }]"
            :style="{ backgroundColor: t.color }"
            :title="t.name"
          >
            {{ t.symbol }}
          </button>
        </div>
        <button
          @click="selectedTerrain = null"
          :class="['terrain-btn', 'erase-btn', { active: selectedTerrain === null }]"
          title="Erase"
        >
          ✕
        </button>
      </div>
      <div class="action-buttons">
        <button
          v-if="terrainSeed?.hexCounts?.length"
          @click="autoSeedTerrain"
          class="btn btn-small btn-accent"
          title="Auto-distribute terrain from Terrain Survey data"
        >
          🌍 Auto-seed terrain
        </button>
        <button @click="clearAll" class="btn btn-small btn-danger">Clear All</button>
      </div>
    </div>

    <!-- SVG MAP -->
    <div class="map-container">
      <svg
        ref="svgEl"
        class="world-map-svg"
        viewBox="0 0 1066 998"
        xmlns="http://www.w3.org/2000/svg"
        @mouseleave="hoveredKey = null"
      >
        <!-- background -->
        <rect x="0" y="0" width="1066" height="998" fill="#e8f4f8" />

        <!-- ── TERRAIN FILL (rendered below grid lines) ── -->
        <g id="terrain-fills">
          <polygon
            v-for="hex in allHexes"
            :key="hex.key"
            :points="hex.pointsStr"
            :fill="hexColor(hex.key)"
            :opacity="hexColor(hex.key) !== 'none' ? 0.85 : 0"
            pointer-events="none"
          />
        </g>

        <!-- ── HEX GRID (thin black outlines, clickable) ── -->
        <g id="hex-grid">
          <polygon
            v-for="hex in allHexes"
            :key="'g-' + hex.key"
            :points="hex.pointsStr"
            :class="['hex', { 'hex--hover': hoveredKey === hex.key }]"
            fill="none"
            stroke="black"
            stroke-width="1"
            @click="paintHex(hex.key)"
            @mouseenter="hoveredKey = hex.key"
          />
        </g>

        <!-- ── ICOSAHEDRON TRIANGLE OUTLINES (overlay, non-interactive) ── -->
        <g id="triangle-outlines" pointer-events="none">
          <polygon
            v-for="(tri, i) in TRIANGLES"
            :key="'tri-' + i"
            :points="tri"
            stroke="black"
            stroke-width="2"
            fill="none"
          />
        </g>

        <!-- ── CLIP MASKS (exact from reference SVG) ── -->
        <g id="clip-masks" pointer-events="none">
          <!-- top V-cuts -->
          <path d="M 90 190 L 170 329 L 250 190" stroke-width="2" stroke="black" fill="white" />
          <path d="M 250 190 L 330 329 L 410 190" stroke-width="2" stroke="black" fill="white" />
          <path d="M 410 190 L 490 329 L 570 190" stroke-width="2" stroke="black" fill="white" />
          <path d="M 570 190 L 650 329 L 730 190" stroke-width="2" stroke="black" fill="white" />
          <path d="M 730 190 L 810 329 L 890 190" stroke-width="2" stroke="black" fill="white" />
          <!-- bottom inverted-V cuts -->
          <path d="M 170 609 L 250 470 L 330 609" stroke-width="2" stroke="black" fill="white" />
          <path d="M 330 609 L 410 470 L 490 609" stroke-width="2" stroke="black" fill="white" />
          <path d="M 490 609 L 570 470 L 650 609" stroke-width="2" stroke="black" fill="white" />
          <path d="M 650 609 L 730 470 L 810 609" stroke-width="2" stroke="black" fill="white" />
          <!-- left cover -->
          <rect x="0" y="190" width="90" height="437" fill="white" stroke="none" />
          <line x1="90" y1="190" x2="90" y2="469" stroke="black" stroke-width="2" />
          <polygon points="89,469 170,609 89,609" fill="white" stroke="none" />
          <line x1="90" y1="469" x2="170" y2="609" stroke="black" stroke-width="2" />
          <!-- right cover -->
          <rect x="890" y="190" width="176" height="437" fill="white" stroke="none" />
          <line x1="890" y1="190" x2="890" y2="469" stroke="black" stroke-width="2" />
          <polygon points="891,469 810,609 1066,609" fill="white" stroke="none" />
          <line x1="810" y1="609" x2="890" y2="469" stroke="black" stroke-width="2" />
          <!-- top cover -->
          <rect x="0" y="0" width="1066" height="190" fill="white" stroke="none" />
          <!-- bottom cover -->
          <rect x="0" y="609" width="1066" height="389" fill="white" stroke="none" />
        </g>

        <!-- ── EQUATOR DASHED LINE ── -->
        <line
          x1="90"
          y1="399"
          x2="890"
          y2="399"
          stroke="black"
          stroke-width="1"
          stroke-dasharray="8,8"
          pointer-events="none"
        />

        <!-- ── AXIS LABELS ── -->
        <g style="font-size: 14px; font-family: Arial, sans-serif; fill: #222" pointer-events="none">
          <!-- longitude top -->
          <text x="84" y="176">0</text>
          <line x1="90" y1="180" x2="90" y2="188" stroke="black" stroke-width="1" />
          <text x="244" y="176">10</text>
          <line x1="250" y1="180" x2="250" y2="188" stroke="black" stroke-width="1" />
          <text x="404" y="176">20</text>
          <line x1="410" y1="180" x2="410" y2="188" stroke="black" stroke-width="1" />
          <text x="564" y="176">30</text>
          <line x1="570" y1="180" x2="570" y2="188" stroke="black" stroke-width="1" />
          <text x="724" y="176">40</text>
          <line x1="730" y1="180" x2="730" y2="188" stroke="black" stroke-width="1" />
          <text x="884" y="176">50</text>
          <line x1="890" y1="180" x2="890" y2="188" stroke="black" stroke-width="1" />
          <!-- latitude left -->
          <text x="40" y="193">+8</text>
          <line x1="80" y1="190" x2="88" y2="190" stroke="black" stroke-width="1" />
          <text x="40" y="332">+3</text>
          <line x1="80" y1="329" x2="88" y2="329" stroke="black" stroke-width="1" />
          <text x="40" y="472">-3</text>
          <line x1="80" y1="469" x2="88" y2="469" stroke="black" stroke-width="1" />
          <text x="137" y="622">-8</text>
          <line x1="160" y1="609" x2="168" y2="609" stroke="black" stroke-width="1" />
        </g>
      </svg>
    </div>

    <!-- TERRAIN LEGEND -->
    <div class="terrain-legend">
      <div v-for="t in TERRAIN_TYPES" :key="'leg-' + t.id" class="legend-item">
        <div class="legend-swatch" :style="{ backgroundColor: t.color }">{{ t.symbol }}</div>
        <span>{{ t.name }}</span>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-row">
      <span>Painted: {{ paintedCount }} / {{ allHexes.length }} hexes</span>
      <span v-if="paintedCount > 0">({{ ((paintedCount / allHexes.length) * 100).toFixed(1) }}% coverage)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  terrainSeed: { type: Object, default: null },
  seedWorldName: { type: String, default: "" },
  seedUwp: { type: String, default: "" },
  seedWorldSize: { type: [String, Number], default: null },
});

// ── TERRAIN TYPES ─────────────────────────────────────────────────────────────
const TERRAIN_TYPES = [
  { id: "water", name: "Water", color: "#1a6eb5", symbol: "💧" },
  { id: "plains", name: "Plains", color: "#7ec850", symbol: "🌾" },
  { id: "forest", name: "Forest", color: "#2e7d32", symbol: "🌲" },
  { id: "mountain", name: "Mountain", color: "#8d6e63", symbol: "⛰️" },
  { id: "desert", name: "Desert", color: "#f5c842", symbol: "🏜️" },
  { id: "tundra", name: "Tundra", color: "#b2ebf2", symbol: "❄️" },
  { id: "swamp", name: "Swamp", color: "#558b2f", symbol: "🌿" },
  { id: "urban", name: "Urban", color: "#9e9e9e", symbol: "🏙️" },
];

const CATEGORY_TO_TERRAIN = {
  water: "water",
  ice: "tundra",
  elevated: "mountain",
  arid: "desert",
  vegetation: "forest",
  exotic: "desert",
  plains: "plains",
};
const TYPE_TO_TERRAIN = {
  Wetland: "swamp",
  "Wet Woods": "swamp",
  Shore: "water",
  Ocean: "water",
  Islands: "plains",
  River: "water",
  Lake: "water",
  Icecap: "tundra",
  Glacier: "tundra",
  "Ice Field": "tundra",
  "Frozen Lands": "tundra",
  Mountain: "mountain",
  Rough: "mountain",
  Volcano: "mountain",
  Desert: "desert",
  "Baked lands": "desert",
  Woods: "forest",
  "Rough Woods": "forest",
  Exotic: "desert",
  Clear: "plains",
};

// ── HEX GEOMETRY ──────────────────────────────────────────────────────────────
// Reference SVG hex: 106,200 122,207 122,228 106,235 90,228 90,207
// cx=106, cy=217.5, HW=16, HS=10.5, HT=17.5
// Columns spaced 16px apart (HW), odd cols offset +14 in y
const HW = 16;
const HS = 10.5;
const HT = 17.5;

function hexPointsStr(cx, cy) {
  // Returns point string with integer coords (matching reference SVG exactly)
  const y0 = Math.round(cy - HT); // top vertex
  const y1 = Math.round(cy - HS); // upper-right / upper-left
  const y2 = Math.round(cy + HS); // lower-right / lower-left
  const y3 = Math.round(cy + HT); // bottom vertex
  return [
    `${cx},${y0}`,
    `${cx + HW},${y1}`,
    `${cx + HW},${y2}`,
    `${cx},${y3}`,
    `${cx - HW},${y2}`,
    `${cx - HW},${y1}`,
  ].join(" ");
}

// ── HEX GRID ─────────────────────────────────────────────────────────────────
// Reference coordinate system (viewBox 0 0 1066 998):
//   Net left x=90, right x=890, top y=190, bottom y=609, equator y=399
//   Col step = 16 (= HW), row step = 28 (= HT+HS)
//   Even cols (90,122,154...): first row top at y=200 → center cy=217.5
//   Odd cols  (106,138,170...): first row top at y=214 → center cy=231.5
const COL_START = 90; // leftmost hex cx
const COL_STEP = 16; // = HW (hexes share sides)
const ROW_EVEN = 217.5; // center y of first row in even columns
const ROW_ODD = 231.5; // center y of first row in odd columns (shifted +14)
const ROW_STEP = 28; // HT + HS
const NUM_COLS = 51; // (890-90)/16 + 1 = 51 columns
const NUM_ROWS = 30; // enough rows to fill the net (clipped by mask)

function isInsideNet(cx, cy) {
  if (cy < 186 || cy > 630) return false;
  if (cx < 90 || cx > 890) return false;
  // Left boundary: (90,190)→(90,469)→(170,609)
  if (cy > 469) {
    // diagonal from (90,469) to (170,609): slope = 140/80 = 1.75
    const leftBound = 90 + ((cy - 469) / 140) * 80;
    if (cx < leftBound) return false;
  }
  // Right boundary: (890,469)→(810,609)
  if (cy > 469) {
    const rightBound = 890 - ((cy - 469) / 140) * 80;
    if (cx > rightBound) return false;
  }
  // Top V-cuts: 5 inverted triangles pointing down from y=190
  // Apex columns: 90,250,410,570,730,890 (step 160)
  // Midpoints (bottom of V): 170,330,490,650,810 at y=329
  if (cy < 329) {
    const apexXs = [90, 250, 410, 570, 730, 890];
    for (let i = 0; i < apexXs.length - 1; i++) {
      const x1 = apexXs[i],
        x2 = apexXs[i + 1];
      const xm = (x1 + x2) / 2; // midpoint x (170,330,...)
      const t = (cy - 190) / 139; // 0..1 from y=190 to y=329
      const lEdge = x1 + t * (xm - x1);
      const rEdge = x2 - t * (x2 - xm);
      if (cx > lEdge && cx < rEdge) return false;
    }
  }
  // Bottom inverted-V cuts: 4 triangles pointing up from y=609
  // Apexes (top of ^): 250,410,570,730 (midpoints) at y=470
  // Bases spread to: 170..330, 330..490, 490..650, 650..810 at y=609
  if (cy > 470) {
    const midXs = [170, 330, 490, 650, 810];
    for (let i = 0; i < midXs.length - 1; i++) {
      const x1 = midXs[i],
        x2 = midXs[i + 1];
      const apexX = (x1 + x2) / 2;
      const t = (cy - 470) / 139;
      const lEdge = apexX - t * (apexX - x1);
      const rEdge = apexX + t * (x2 - apexX);
      if (cx > lEdge && cx < rEdge) return false;
    }
  }
  return true;
}

const allHexes = computed(() => {
  const out = [];
  for (let c = 0; c < NUM_COLS; c++) {
    const cx = COL_START + c * COL_STEP;
    const rowStart = c % 2 === 0 ? ROW_EVEN : ROW_ODD;
    for (let r = 0; r < NUM_ROWS; r++) {
      const cy = rowStart + r * ROW_STEP;
      if (isInsideNet(cx, cy)) {
        out.push({ key: `${cx},${cy}`, cx, cy, pointsStr: hexPointsStr(cx, cy) });
      }
    }
  }
  return out;
});

// ── PAINT STATE ───────────────────────────────────────────────────────────────
const selectedTerrain = ref("water");
const hoveredKey = ref(null);
const paintMap = ref(new Map());

const paintedCount = computed(() => paintMap.value.size);

function hexColor(key) {
  const t = paintMap.value.get(key);
  return t ? (TERRAIN_TYPES.find((x) => x.id === t)?.color ?? "none") : "none";
}

function paintHex(key) {
  const next = new Map(paintMap.value);
  if (selectedTerrain.value === null) next.delete(key);
  else next.set(key, selectedTerrain.value);
  paintMap.value = next;
}

function clearAll() {
  paintMap.value = new Map();
}

// ── AUTO-SEED FROM terrainSeed ─────────────────────────────────────────────
function autoSeedTerrain() {
  if (!props.terrainSeed?.hexCounts?.length) return;
  const hexes = allHexes.value.slice();
  let seed = hexes.reduce((s, h) => (s * 31 + h.cx + h.cy) | 0, 0);
  function rand() {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 0xffffffff;
  }
  hexes.sort(() => rand() - 0.5);
  const next = new Map();
  let idx = 0;
  for (const entry of props.terrainSeed.hexCounts) {
    const terrainId = TYPE_TO_TERRAIN[entry.type] ?? CATEGORY_TO_TERRAIN[entry.category] ?? "plains";
    const count = Math.min(entry.count, hexes.length - idx);
    for (let i = 0; i < count && idx < hexes.length; i++, idx++) {
      next.set(hexes[idx].key, terrainId);
    }
  }
  paintMap.value = next;
}

watch(
  () => props.terrainSeed,
  (val) => {
    if (val?.hexCounts?.length && paintMap.value.size === 0) autoSeedTerrain();
  },
  { immediate: true },
);

// ── ICOSAHEDRON TRIANGLE OVERLAYS ─────────────────────────────────────────────
// Triangles from reference SVG (20 faces of icosahedron net)
const TRIANGLES = [
  " 90,190  170,329  10,329 ",
  " 10,329  170,329  90,469 ",
  " 170,330  250,469  90,469 ",
  " 90,470  250,470  170,609 ",
  " 250,190  330,329  170,329 ",
  " 170,329  330,329  250,469 ",
  " 330,330  410,469  250,469 ",
  " 250,470  410,470  330,609 ",
  " 410,190  490,329  330,329 ",
  " 330,329  490,329  410,469 ",
  " 490,330  570,469  410,469 ",
  " 410,470  570,470  490,609 ",
  " 570,190  650,329  490,329 ",
  " 490,329  650,329  570,469 ",
  " 650,330  730,469  570,469 ",
  " 570,470  730,470  650,609 ",
  " 730,190  810,329  650,329 ",
  " 650,329  810,329  730,469 ",
  " 810,330  890,469  730,469 ",
  " 730,470  890,470  810,609 ",
];
</script>

<style scoped>
.world-hex-map-form {
  font-family: Arial, sans-serif;
  font-size: 11px;
  background: #f8f8f0;
  border: 1px solid #334466;
  border-radius: 4px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #1a1a1a;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid #334466;
  padding-bottom: 0.25rem;
}
.form-header .title {
  font-weight: bold;
  font-size: 12px;
}
.form-header .method-tag {
  font-size: 10px;
  color: #555;
  text-align: right;
}

.identity-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.id-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.id-cell.grow-2 {
  flex: 2;
}
.id-cell.grow-3 {
  flex: 3;
}
.id-label {
  font-size: 9px;
  text-transform: uppercase;
  color: #556;
  letter-spacing: 0.05em;
}
.id-static {
  border-bottom: 1px solid #aaa;
  padding: 1px 2px;
  min-width: 60px;
}

.terrain-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.palette-section {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.palette-label {
  font-size: 10px;
  color: #444;
}
.terrain-palette {
  display: flex;
  gap: 2px;
}
.terrain-btn {
  width: 26px;
  height: 26px;
  border: 2px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #ddd;
}
.terrain-btn.active {
  border-color: #000;
  box-shadow: 0 0 0 1px #fff inset;
}
.erase-btn {
  background: #eee;
  color: #c00;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
  margin-left: auto;
}
.btn {
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #555;
  cursor: pointer;
  font-size: 10px;
}
.btn-small {
  padding: 2px 6px;
}
.btn-accent {
  background: #1a6eb5;
  color: #fff;
  border-color: #1a6eb5;
}
.btn-danger {
  background: #c62828;
  color: #fff;
  border-color: #c62828;
}

.map-container {
  overflow-x: auto;
}
.world-map-svg {
  display: block;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.hex {
  cursor: pointer;
}
.hex--hover {
  stroke: #e65c00 !important;
  stroke-width: 2px !important;
}

.terrain-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}
.legend-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid #555;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.stats-row {
  font-size: 10px;
  color: #444;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #ccc;
  padding-top: 0.25rem;
}
</style>
