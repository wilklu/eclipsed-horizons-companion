<template>
  <div class="world-map-form">
    <!-- FORM HEADER -->
    <div class="form-header">
      <div class="title">World Builder's Handbook — Interactive World Map</div>
      <div class="method-tag">
        METHOD 2: STANDARD SCALE, VARIABLE HEX NUMBER<br />
        <span class="form-number"
          >Form 0407F-IV Part W.M2 • Interactive Hex Mapping • Click hexes to assign terrain</span
        >
      </div>
    </div>

    <!-- IDENTITY ROW -->
    <div class="identity-row">
      <div class="id-cell grow-3">
        <label class="id-label">World</label>
        <input v-model="mapData.worldName" type="text" class="id-input" placeholder="World name" />
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">UWP</label>
        <input v-model="mapData.uwp" type="text" class="id-input" placeholder="X000000-0" />
      </div>
      <div class="id-cell grow-3">
        <label class="id-label">System</label>
        <input v-model="mapData.system" type="text" class="id-input" placeholder="System name" />
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">Rotation</label>
        <select v-model="mapData.rotation" class="id-input">
          <option value="">—</option>
          <option value="ccw">Counter-clockwise</option>
          <option value="cw">Clockwise</option>
        </select>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">Hex Scale (km)</label>
        <div class="id-static">1,000</div>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">World Size</label>
        <input
          v-model.number="mapData.worldSize"
          type="number"
          min="1"
          max="10"
          class="id-input"
          @input="recalculateMap"
          placeholder="1-10"
        />
      </div>
    </div>

    <!-- METHOD DESCRIPTION -->
    <div class="method-desc">
      <strong>METHOD 2 — Standard Scale, Variable Hex Number:</strong>
      Each hex is a constant <strong>1,000 km</strong> across. Hexes per triangle edge = World Size.
      <strong>Click any hex to select and assign terrain.</strong> Selected hexes appear highlighted in cyan.
    </div>

    <!-- SCALE BAR -->
    <div class="scale-bar-row">
      <span class="scale-label">Hex Scale:</span>
      <div class="scale-bar">
        <div class="scale-seg dark">0</div>
        <div class="scale-seg light">1,000</div>
        <div class="scale-seg dark">2,000</div>
        <div class="scale-seg light">3,000</div>
        <div class="scale-seg dark">4,000</div>
        <div class="scale-seg light">5,000</div>
      </div>
      <span class="scale-unit">km</span>
      <span class="scale-info">
        | Size {{ mapData.worldSize }} overlay | {{ calculateTotalHexes() }} active hexes | Diameter:
        {{ calculateDiameter() }} km
      </span>
    </div>

    <!-- TERRAIN PALETTE & CONTROLS -->
    <div class="terrain-controls">
      <div class="palette-section">
        <label class="palette-label">Terrain Type:</label>
        <div class="terrain-palette">
          <button
            v-for="terrain in terrainTypes"
            :key="terrain.id"
            @click="selectedTerrain = terrain.id"
            :class="['terrain-btn', { active: selectedTerrain === terrain.id }]"
            :style="{ backgroundColor: terrain.color }"
            :title="terrain.name"
          >
            {{ terrain.symbol }}
          </button>
        </div>
      </div>

      <div class="info-section">
        <p v-if="selectedHex" class="selected-info">
          <strong>Selected:</strong> {{ selectedHex.triangle }} - Hex {{ selectedHex.hexIndex }}
          <span v-if="selectedHex.terrain">
            | Terrain: <strong>{{ getTerrainName(selectedHex.terrain) }}</strong></span
          >
        </p>
        <p v-else class="no-selection">Click a hex to select it</p>
      </div>

      <div class="action-buttons">
        <button
          v-if="terrainSeed?.hexCounts?.length"
          @click="seedFromTerrainComposition"
          class="btn btn-small btn-accent"
          title="Randomly distribute terrain from the generated Terrain Survey"
        >
          🌍 Auto-seed terrain
        </button>
        <button @click="clearSelection" class="btn btn-small btn-secondary" :disabled="!selectedHex">
          Clear Selection
        </button>
        <button @click="clearAllTerrain" class="btn btn-small btn-danger">Clear All Terrain</button>
        <button @click="exportMap" class="btn btn-small btn-primary">📥 Export Map</button>
      </div>
    </div>

    <!-- SVG MAP CONTAINER -->
    <div class="map-container">
      <svg
        :key="svgKey"
        class="world-map"
        :width="mapDimensions.width"
        :height="mapDimensions.height"
        :viewBox="`0 0 ${mapDimensions.width} ${mapDimensions.height}`"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background -->
        <rect :width="mapDimensions.width" :height="mapDimensions.height" fill="#d8e8f0" rx="3" />

        <!-- Icosahedron triangles -->
        <g v-for="(triangle, idx) in triangles" :key="`tri-${idx}`">
          <!-- Triangle outline -->
          <polygon :points="triangle.points" :class="`tri-${triangle.orient}`" />

          <!-- Triangle label -->
          <text :x="triangle.labelX" :y="triangle.labelY" class="tri-num" text-anchor="middle" pointer-events="none">
            {{ triangle.label }}
          </text>

          <!-- Hexagonal grid for this triangle -->
          <g v-for="(hex, hexIdx) in generateHexagons(triangle, BASE_GRID_SIZE)" :key="`hex-${idx}-${hexIdx}`">
            <!-- Hex outline -->
            <path
              :d="hex.path"
              :class="[
                'hex-cell',
                {
                  'hex-disabled': !isHexActive(triangle.label, hexIdx),
                  'hex-selected': isHexSelected(triangle.label, hexIdx),
                  'hex-hover':
                    isHexActive(triangle.label, hexIdx) &&
                    hoveredHex?.triangle === triangle.label &&
                    hoveredHex?.hexIndex === hexIdx,
                },
              ]"
              :fill="getHexColor(triangle.label, hexIdx)"
              @click="selectHex(triangle.label, hexIdx)"
              @mouseenter="
                hoveredHex = isHexActive(triangle.label, hexIdx) ? { triangle: triangle.label, hexIndex: hexIdx } : null
              "
              @mouseleave="hoveredHex = null"
            />

            <!-- Hex center dot (for reference) -->
            <circle :cx="hex.cx" :cy="hex.cy" r="2" class="hex-center-dot" pointer-events="none" />

            <!-- Hex coordinate label (optional, toggle with button) -->
            <text
              v-if="showHexLabels"
              :x="hex.cx"
              :y="hex.cy"
              class="hex-label"
              text-anchor="middle"
              dy="0.3em"
              pointer-events="none"
            >
              {{ hexIdx + 1 }}
            </text>
          </g>
        </g>

        <!-- Pole dots -->
        <g id="north-pole">
          <circle v-for="(x, idx) in poleDots.north" :key="`npole-${idx}`" :cx="x" cy="10" r="4" class="pole-dot" />
          <text x="50%" y="8" class="pole-label" text-anchor="middle" font-size="9" pointer-events="none">
            ◀ NORTH POLE ▶
          </text>
        </g>

        <g id="south-pole">
          <circle
            v-for="(x, idx) in poleDots.south"
            :key="`spole-${idx}`"
            :cx="x"
            :cy="mapDimensions.height - 10"
            r="4"
            class="pole-dot"
          />
          <text
            x="50%"
            :y="mapDimensions.height - 2"
            class="pole-label"
            text-anchor="middle"
            font-size="9"
            pointer-events="none"
          >
            ◀ SOUTH POLE ▶
          </text>
        </g>

        <!-- Equator line -->
        <line
          x1="30"
          :y1="mapDimensions.equatorY"
          :x2="mapDimensions.width - 30"
          :y2="mapDimensions.equatorY"
          class="equator-line"
          pointer-events="none"
        />

        <!-- Outer border -->
        <rect
          x="30"
          y="10"
          :width="mapDimensions.width - 60"
          :height="mapDimensions.height - 20"
          fill="none"
          stroke="#334466"
          stroke-width="1.5"
          pointer-events="none"
        />
      </svg>
    </div>

    <!-- TERRAIN LEGEND -->
    <div class="terrain-legend">
      <h4>Terrain Legend</h4>
      <div class="legend-grid">
        <div v-for="terrain in terrainTypes" :key="terrain.id" class="legend-item">
          <div class="legend-color" :style="{ backgroundColor: terrain.color }">{{ terrain.symbol }}</div>
          <div class="legend-label">{{ terrain.name }}</div>
        </div>
      </div>
    </div>

    <!-- HEX COVERAGE STATS -->
    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-label">Total Hexes:</span>
        <span class="stat-value">{{ calculateTotalHexes() }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Mapped Hexes:</span>
        <span class="stat-value">{{ mappedHexes.size }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Coverage:</span>
        <span class="stat-value">{{ ((mappedHexes.size / calculateTotalHexes()) * 100).toFixed(1) }}%</span>
      </div>
      <div class="coverage-bar">
        <div class="coverage-fill" :style="{ width: (mappedHexes.size / calculateTotalHexes()) * 100 + '%' }"></div>
      </div>
    </div>

    <!-- ROTATION DIRECTION KEY -->
    <div class="rotation-key">
      <span class="rot-key-label">Direction of World Rotation:</span>
      <span> ⟲ Counter-clockwise when viewed from North Pole | Mark rotation with arrow on equator row. </span>
      <label style="margin-left: auto; display: flex; align-items: center; gap: 0.5rem; font-size: 9px">
        <input type="checkbox" v-model="showHexLabels" /> Show Hex Numbers
      </label>
    </div>

    <!-- FOOTER -->
    <div class="form-footer">
      Form 0407F-IV Part W.M2 · Method 2: Interactive Hex Map · Click hexes to map terrain · 20 Triangles · Each
      Triangle = 5% Surface Area
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";

const props = defineProps({
  /** terrainComposition object from generateMainworldTerrainComposition */
  terrainSeed: { type: Object, default: null },
  /** Pre-fill world name */
  seedWorldName: { type: String, default: "" },
  /** Pre-fill UWP */
  seedUwp: { type: String, default: "" },
  /** Pre-fill system name */
  seedSystem: { type: String, default: "" },
  /** World size code (0-F or numeric 1-10) — used to set mapData.worldSize */
  seedWorldSize: { type: [String, Number], default: null },
});

// Maps generator category names to this component's terrain IDs
const CATEGORY_TO_TERRAIN = {
  water: "water",
  ice: "tundra",
  elevated: "mountain",
  arid: "desert",
  vegetation: "forest",
  exotic: "desert",
  plains: "plains",
};

// More granular type-level overrides (wetland/wet woods → swamp)
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

// State
const svgKey = ref(0);
const selectedTerrain = ref("water");
const selectedHex = ref(null);
const hoveredHex = ref(null);
const showHexLabels = ref(false);
const mappedHexes = ref(new Map()); // Stores hex terrain data

function parseSeedSize(raw) {
  if (raw === null || raw === undefined) return null;
  const n = parseInt(raw, 16);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(10, Math.max(1, n));
}

const mapData = reactive({
  worldName: "",
  uwp: "",
  system: "",
  rotation: "ccw",
  worldSize: 5,
});

const BASE_GRID_SIZE = 7;
const BASE_GRID_HEXES = 2 + 10 * BASE_GRID_SIZE * BASE_GRID_SIZE;

// Sync identity fields from props when they change
watch(
  () => [props.seedWorldName, props.seedUwp, props.seedSystem, props.seedWorldSize],
  ([name, uwp, system, size]) => {
    if (name) mapData.worldName = name;
    if (uwp) mapData.uwp = uwp;
    if (system) mapData.system = system;
    const parsed = parseSeedSize(size);
    if (parsed !== null) {
      mapData.worldSize = parsed;
      svgKey.value++;
      mappedHexes.value.clear();
      selectedHex.value = null;
    }
  },
  { immediate: true },
);

// Terrain types with colors and symbols
const terrainTypes = [
  { id: "water", name: "Water", color: "#0066cc", symbol: "💧" },
  { id: "plains", name: "Plains", color: "#66cc33", symbol: "🌾" },
  { id: "forest", name: "Forest", color: "#228833", symbol: "🌲" },
  { id: "mountain", name: "Mountain", color: "#996633", symbol: "⛰️" },
  { id: "desert", name: "Desert", color: "#ffcc33", symbol: "🏜️" },
  { id: "tundra", name: "Tundra", color: "#ccffff", symbol: "❄️" },
  { id: "swamp", name: "Swamp", color: "#669966", symbol: "🌿" },
  { id: "urban", name: "Urban", color: "#666666", symbol: "🏙️" },
];

// Icosahedron triangle definitions (base coordinates)
const TRIANGLE_POINTS = {
  north: [
    { id: "N1", pts: [110, 10, 30, 148, 190, 148], orient: "up" },
    { id: "N2", pts: [270, 10, 190, 148, 350, 148], orient: "up" },
    { id: "N3", pts: [430, 10, 350, 148, 510, 148], orient: "up" },
    { id: "N4", pts: [590, 10, 510, 148, 670, 148], orient: "up" },
    { id: "N5", pts: [750, 10, 670, 148, 830, 148], orient: "up" },
  ],
  middle: [
    { id: "M1", pts: [30, 148, 190, 148, 110, 286], orient: "down" },
    { id: "M2", pts: [110, 286, 190, 148, 270, 286], orient: "up" },
    { id: "M3", pts: [190, 148, 350, 148, 270, 286], orient: "down" },
    { id: "M4", pts: [270, 286, 350, 148, 430, 286], orient: "up" },
    { id: "M5", pts: [350, 148, 510, 148, 430, 286], orient: "down" },
    { id: "M6", pts: [430, 286, 510, 148, 590, 286], orient: "up" },
    { id: "M7", pts: [510, 148, 670, 148, 590, 286], orient: "down" },
    { id: "M8", pts: [590, 286, 670, 148, 750, 286], orient: "up" },
    { id: "M9", pts: [670, 148, 830, 148, 750, 286], orient: "down" },
    { id: "M10", pts: [750, 286, 830, 148, 830, 286], orient: "up" },
  ],
  south: [
    { id: "S1", pts: [110, 286, 30, 410, 190, 410], orient: "down" },
    { id: "S2", pts: [270, 286, 190, 410, 350, 410], orient: "down" },
    { id: "S3", pts: [430, 286, 350, 410, 510, 410], orient: "down" },
    { id: "S4", pts: [590, 286, 510, 410, 670, 410], orient: "down" },
    { id: "S5", pts: [750, 286, 670, 410, 830, 410], orient: "down" },
  ],
};

// Map dimensions
const mapDimensions = computed(() => ({
  width: 860,
  height: 420,
  equatorY: 148,
}));

// Pole dots
const poleDots = computed(() => ({
  north: [110, 270, 430, 590, 750],
  south: [110, 270, 430, 590, 750],
}));

// Size reference
const sizeReferenceTable = [
  { size: 1, hexesPerEdge: 1, totalHexes: 12, diameter: 1600 },
  { size: 2, hexesPerEdge: 2, totalHexes: 42, diameter: 3200 },
  { size: 3, hexesPerEdge: 3, totalHexes: 92, diameter: 4800 },
  { size: 4, hexesPerEdge: 4, totalHexes: 162, diameter: 6400 },
  { size: 5, hexesPerEdge: 5, totalHexes: 252, diameter: 8000 },
  { size: 6, hexesPerEdge: 6, totalHexes: 362, diameter: 9600 },
  { size: 7, hexesPerEdge: 7, totalHexes: 492, diameter: 11200 },
  { size: 8, hexesPerEdge: 8, totalHexes: 642, diameter: 12800 },
  { size: 9, hexesPerEdge: 9, totalHexes: 812, diameter: 14400 },
  { size: 10, hexesPerEdge: 10, totalHexes: 1002, diameter: 16000 },
];

function getTargetHexesForSize(size) {
  const parsed = Math.max(1, Math.min(10, Number(size) || 1));
  const requested = 2 + 10 * parsed * parsed;
  return Math.min(BASE_GRID_HEXES, requested);
}

// Calculate totals
const calculateTotalHexes = () => {
  return getTargetHexesForSize(mapData.worldSize);
};

const calculateDiameter = () => {
  const ref = sizeReferenceTable.find((r) => r.size === mapData.worldSize);
  return ref ? ref.diameter : 0;
};

// Generate hexagons for a triangle
function generateHexagons(triangle, size) {
  const [x1, y1, x2, y2, x3, y3] = triangle.pts;
  const hexagons = [];

  // Build rows from apex -> base so "up" and "down" triangles both render
  // with the correct widening direction.
  const p1 = { x: x1, y: y1 };
  const p2 = { x: x2, y: y2 };
  const p3 = { x: x3, y: y3 };
  const isUp = triangle.orient === "up";
  const apex = isUp ? p1 : p3;
  const baseLeft = isUp ? p2 : p1;
  const baseRight = isUp ? p3 : p2;

  const triWidth = Math.hypot(baseRight.x - baseLeft.x, baseRight.y - baseLeft.y);
  const triArea =
    Math.abs(
      apex.x * (baseLeft.y - baseRight.y) + baseLeft.x * (baseRight.y - apex.y) + baseRight.x * (apex.y - baseLeft.y),
    ) / 2;
  const triHeight = triWidth > 0 ? (2 * triArea) / triWidth : 0;

  let hexIndex = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  for (let row = 0; row < size; row++) {
    const bandT = (row + 1) / (size + 1);
    const rowLeft = {
      x: lerp(apex.x, baseLeft.x, bandT),
      y: lerp(apex.y, baseLeft.y, bandT),
    };
    const rowRight = {
      x: lerp(apex.x, baseRight.x, bandT),
      y: lerp(apex.y, baseRight.y, bandT),
    };

    const hexesInRow = row + 1;
    const rowSpan = Math.hypot(rowRight.x - rowLeft.x, rowRight.y - rowLeft.y);
    const spacingH = hexesInRow > 1 ? rowSpan / (hexesInRow - 1) : triWidth / (size + 1);
    const spacingV = triHeight / (size + 1);

    // Template-like proportions based on the sample SVG point set.
    const halfWidth = Math.max(3, Math.min(spacingH * 0.42, spacingV * 0.95));
    const halfHeightShort = halfWidth * 0.66;
    const halfHeightLong = halfWidth * 1.1;

    for (let col = 0; col < hexesInRow; col++) {
      const colT = hexesInRow === 1 ? 0.5 : col / (hexesInRow - 1);
      const cx = lerp(rowLeft.x, rowRight.x, colT);
      const cy = lerp(rowLeft.y, rowRight.y, colT);

      // Pointy hex template matching travellerworlds-like SVG proportions.
      const points = [
        [cx, cy - halfHeightLong],
        [cx + halfWidth, cy - halfHeightShort],
        [cx + halfWidth, cy + halfHeightShort],
        [cx, cy + halfHeightLong],
        [cx - halfWidth, cy + halfHeightShort],
        [cx - halfWidth, cy - halfHeightShort],
      ];

      const path = `M ${points.map((p) => p.join(",")).join(" L ")} Z`;

      hexagons.push({
        cx,
        cy,
        path,
        index: hexIndex++,
      });
    }
  }

  return hexagons;
}

const activeHexKeySet = computed(() => {
  const allTris = [...TRIANGLE_POINTS.north, ...TRIANGLE_POINTS.middle, ...TRIANGLE_POINTS.south];
  const centerX = mapDimensions.value.width / 2;
  const centerY = mapDimensions.value.height / 2;
  const weightedSlots = [];

  for (const tri of allTris) {
    const hexes = generateHexagons(tri, BASE_GRID_SIZE);
    for (let i = 0; i < hexes.length; i++) {
      const hex = hexes[i];
      const key = `${tri.id}-${i}`;
      const dx = hex.cx - centerX;
      const dy = hex.cy - centerY;
      const equatorBias = Math.abs((hex.cy - mapDimensions.value.equatorY) / (mapDimensions.value.height * 0.5));
      const score = dx * dx + dy * dy + equatorBias * 1200;
      weightedSlots.push({ key, score });
    }
  }

  weightedSlots.sort((a, b) => a.score - b.score);
  return new Set(weightedSlots.slice(0, calculateTotalHexes()).map((slot) => slot.key));
});

function isHexActive(triangle, hexIndex) {
  return activeHexKeySet.value.has(`${triangle}-${hexIndex}`);
}

// Build triangles
const triangles = computed(() => {
  const allTris = [...TRIANGLE_POINTS.north, ...TRIANGLE_POINTS.middle, ...TRIANGLE_POINTS.south];

  return allTris.map((tri, idx) => {
    const [x1, y1, x2, y2, x3, y3] = tri.pts;
    const labelX = (x1 + x2 + x3) / 3;
    const labelY = (y1 + y2 + y3) / 3;

    return {
      ...tri,
      points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`,
      labelX,
      labelY,
    };
  });
});

// Hex selection and terrain
function selectHex(triangle, hexIndex) {
  if (!isHexActive(triangle, hexIndex)) {
    return;
  }

  selectedHex.value = { triangle, hexIndex, terrain: null };

  const key = `${triangle}-${hexIndex}`;
  if (mappedHexes.value.has(key)) {
    selectedHex.value.terrain = mappedHexes.value.get(key);
  }

  // Assign terrain
  if (selectedTerrain.value) {
    mappedHexes.value.set(key, selectedTerrain.value);
    selectedHex.value.terrain = selectedTerrain.value;
  }
}

function isHexSelected(triangle, hexIndex) {
  return selectedHex.value?.triangle === triangle && selectedHex.value?.hexIndex === hexIndex;
}

function getHexColor(triangle, hexIndex) {
  const key = `${triangle}-${hexIndex}`;
  if (!isHexActive(triangle, hexIndex)) {
    return "#d5dfea";
  }

  if (mappedHexes.value.has(key)) {
    const terrainId = mappedHexes.value.get(key);
    const terrain = terrainTypes.find((t) => t.id === terrainId);
    return terrain ? terrain.color : "#e8f0f8";
  }
  return "#e8f0f8";
}

function getTerrainName(terrainId) {
  const terrain = terrainTypes.find((t) => t.id === terrainId);
  return terrain ? terrain.name : "Unknown";
}

function clearSelection() {
  selectedHex.value = null;
}

function clearAllTerrain() {
  if (confirm("Clear all terrain markings? This cannot be undone.")) {
    mappedHexes.value.clear();
    selectedHex.value = null;
  }
}

function exportMap() {
  const mapExport = {
    worldName: mapData.worldName,
    uwp: mapData.uwp,
    system: mapData.system,
    worldSize: mapData.worldSize,
    rotation: mapData.rotation,
    totalHexes: calculateTotalHexes(),
    mappedHexes: Array.from(mappedHexes.value.entries()).map(([key, terrain]) => ({
      hex: key,
      terrain: terrain,
      terrainName: getTerrainName(terrain),
    })),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(mapExport, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${mapData.worldName || "world"}-hex-map.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert("✓ Map exported successfully!");
}

function recalculateMap() {
  svgKey.value++;
  mappedHexes.value = new Map(
    Array.from(mappedHexes.value.entries()).filter(([key]) => activeHexKeySet.value.has(key)),
  );
  selectedHex.value = null;
}

/**
 * Build a shuffled list of all hex slot keys for the current map size.
 */
function buildAllHexKeys() {
  const keys = Array.from(activeHexKeySet.value);

  // Fisher-Yates shuffle
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }

  return keys;
}

/**
 * Seed the map from the terrainSeed prop, scaling hex counts from the
 * generator's 490-hex standard to the actual interactive map total.
 */
function seedFromTerrainComposition() {
  const seed = props.terrainSeed;
  if (!seed?.hexCounts?.length) return;

  const totalInteractive = calculateTotalHexes();
  const totalSeed = seed.totalMapHexes || 490;
  const scale = totalInteractive / totalSeed;

  // Build terrain bucket: [ [terrainId, count], ... ]
  const buckets = [];
  for (const entry of seed.hexCounts) {
    const terrainId = TYPE_TO_TERRAIN[entry.type] ?? CATEGORY_TO_TERRAIN[entry.category] ?? "plains";
    const scaled = Math.round(entry.hexes * scale);
    if (scaled > 0) buckets.push([terrainId, scaled]);
  }

  // Flatten to ordered terrain assignments
  const assignments = [];
  for (const [terrainId, count] of buckets) {
    for (let i = 0; i < count; i++) assignments.push(terrainId);
  }

  // Shuffle hex slots and fill
  const hexKeys = buildAllHexKeys();
  const next = new Map();
  const limit = Math.min(assignments.length, hexKeys.length);
  for (let i = 0; i < limit; i++) {
    next.set(hexKeys[i], assignments[i]);
  }

  mappedHexes.value = next;
  selectedHex.value = null;
  svgKey.value++;
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── FORM HEADER ── */
.form-header {
  background: #1a1a2e;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 2px solid #000;
}

.form-header .title {
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.form-header .method-tag {
  font-size: 10px;
  text-align: right;
  line-height: 1.4;
}

.form-number {
  font-size: 9px;
  letter-spacing: 0.5px;
}

/* ── IDENTITY ROW ── */
.identity-row {
  display: flex;
  border-bottom: 1px solid #888;
  flex-wrap: wrap;
}

.id-cell {
  flex: 1;
  border-right: 1px solid #888;
  padding: 6px 8px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.id-cell:last-child {
  border-right: none;
}

.id-cell.grow-2 {
  flex: 2;
}
.id-cell.grow-3 {
  flex: 3;
}

.id-label {
  font-size: 7.5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 4px;
}

.id-input {
  border: 1px solid #999;
  padding: 4px 6px;
  font-size: 10px;
  border-radius: 2px;
}

.id-input:focus {
  outline: none;
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
}

.id-static {
  font-size: 10px;
  padding: 2px 0;
}

/* ── METHOD DESCRIPTION ── */
.method-desc {
  background: #f0f0f8;
  border: 1px solid #aaa;
  padding: 6px 10px;
  font-size: 9px;
  color: #333;
  line-height: 1.5;
}

/* ── SCALE BAR ── */
.scale-bar-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #ccc;
  gap: 8px;
  font-size: 9px;
}

.scale-label {
  font-weight: bold;
  font-size: 8px;
  text-transform: uppercase;
}

.scale-bar {
  display: flex;
  gap: 0;
}

.scale-seg {
  width: 44px;
  height: 12px;
  border: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: bold;
}

.scale-seg.dark {
  background: #555;
  color: #fff;
}

.scale-seg.light {
  background: #fff;
  color: #333;
}

.scale-unit {
  margin-left: 4px;
  font-weight: bold;
}

.scale-info {
  color: #888;
  font-size: 8px;
  margin-left: 12px;
}

/* ── TERRAIN CONTROLS ── */
.terrain-controls {
  padding: 10px;
  background: #f9f9f9;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
  align-items: center;
}

.palette-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.palette-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #555;
}

.terrain-palette {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.terrain-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.terrain-btn:hover {
  transform: scale(1.1);
  border-color: #333;
}

.terrain-btn.active {
  border-color: #0e9a87;
  box-shadow: 0 0 8px rgba(14, 154, 135, 0.5);
  transform: scale(1.15);
}

.info-section {
  text-align: center;
}

.selected-info,
.no-selection {
  font-size: 10px;
  color: #333;
  margin: 0;
}

.selected-info {
  color: #0e9a87;
  font-weight: bold;
}

.no-selection {
  color: #999;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-small {
  padding: 4px 8px;
  font-size: 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background: #0e9a87;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #0a7a6f;
  box-shadow: 0 0 6px rgba(14, 154, 135, 0.4);
}

.btn-accent {
  background: #4a6fa5;
  color: #fff;
}

.btn-accent:hover:not(:disabled) {
  background: #3a5f95;
  box-shadow: 0 0 6px rgba(74, 111, 165, 0.4);
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #ccc;
}

.btn-danger {
  background: #ff6b6b;
  color: #fff;
}

.btn-danger:hover {
  background: #ff5252;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── MAP CONTAINER ── */
.map-container {
  padding: 12px;
  background: #fafafa;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ccc;
  overflow-x: auto;
}

.world-map {
  display: block;
  max-height: 500px;
}

/* Triangle styling */
.tri-up {
  fill: #e8f0f8;
  stroke: #2244aa;
  stroke-width: 1.2;
}

.tri-down {
  fill: #ddeef8;
  stroke: #2244aa;
  stroke-width: 1.2;
}

/* Hex styling */
.hex-cell {
  stroke: #7799cc;
  stroke-width: 0.6;
  opacity: 0.85;
  cursor: pointer;
  transition: all 0.2s;
}

.hex-cell:hover {
  stroke: #0e9a87;
  stroke-width: 1;
  opacity: 1;
  filter: brightness(1.1);
}

.hex-cell.hex-disabled {
  stroke: #9fb1c7;
  stroke-dasharray: 2, 2;
  opacity: 0.35;
  cursor: not-allowed;
  filter: none;
}

.hex-cell.hex-disabled:hover {
  stroke: #9fb1c7;
  stroke-width: 0.6;
  opacity: 0.35;
}

.hex-cell.hex-selected {
  stroke: #00ff00;
  stroke-width: 1.5;
  opacity: 1;
  filter: brightness(1.2);
}

.hex-center-dot {
  fill: rgba(34, 68, 170, 0.3);
  pointer-events: none;
}

.hex-label {
  font-size: 6px;
  fill: #446;
  opacity: 0.6;
  pointer-events: none;
  font-weight: bold;
}

/* Pole styling -->
.pole-dot {
  fill: #cc3333;
}

.pole-label {
  font-size: 8px;
  fill: #cc3333;
  font-weight: bold;
}

.tri-num {
  font-size: 7px;
  fill: #446;
  opacity: 0.7;
  font-weight: bold;
}

/* Equator -->
.equator-line {
  stroke: #aa4400;
  stroke-width: 1.5;
  stroke-dasharray: 8,4;
  opacity: 0.6;
}

/* ── TERRAIN LEGEND ── */
.terrain-legend {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.terrain-legend h4 {
  font-size: 9px;
  text-transform: uppercase;
  color: #333;
  margin-bottom: 8px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  border: 1px solid #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 9px;
  color: #333;
}

/* ── STATS SECTION ── */
.stats-section {
  padding: 10px;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  gap: 6px;
  font-size: 9px;
}

.stat-label {
  font-weight: bold;
  color: #555;
}

.stat-value {
  color: #0e9a87;
  font-weight: bold;
}

.coverage-bar {
  flex: 1;
  height: 16px;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid #999;
}

.coverage-fill {
  height: 100%;
  background: linear-gradient(90deg, #0e9a87, #00ff00);
  transition: width 0.3s;
}

/* ── ROTATION KEY ── */
.rotation-key {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #ccc;
  gap: 12px;
  font-size: 9px;
}

.rot-key-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
}

/* ── FOOTER ── */
.form-footer {
  background: #1a1a2e;
  color: #aaa;
  font-size: 8px;
  padding: 6px 10px;
  text-align: right;
}

/* ── PRINT ── */
@media print {
  .terrain-controls,
  .terrain-legend,
  .stats-section {
    display: none !important;
  }
}
</style>
