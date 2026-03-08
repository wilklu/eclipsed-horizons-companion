<template>
  <div class="world-map-form-advanced">
    <!-- FORM HEADER -->
    <div class="form-header">
      <div class="title">Interactive World Hex Map — Advanced Edition</div>
      <div class="method-tag">Form 0407F-IV Part W.M2 • Hex Navigation • Climate • Population • Import/Export</div>
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
        <label class="id-label">World Size</label>
        <input
          v-model.number="mapData.worldSize"
          type="number"
          min="1"
          max="10"
          class="id-input"
          @input="recalculateMap"
        />
      </div>
    </div>

    <!-- CONTROL PANEL -->
    <div class="control-panel">
      <div class="control-section">
        <label class="control-label">Display Overlay:</label>
        <div class="button-group">
          <button
            v-for="overlay in ['terrain', 'climate', 'population', 'coordinates']"
            :key="overlay"
            @click="activeOverlay = overlay"
            :class="['overlay-btn', { active: activeOverlay === overlay }]"
          >
            {{ overlayLabels[overlay] }}
          </button>
        </div>
      </div>

      <div class="control-section">
        <label class="control-label">File Operations:</label>
        <div class="button-group">
          <button @click="exportMap" class="btn btn-small btn-primary">📥 Export Map</button>
          <button @click="triggerImport" class="btn btn-small btn-primary">📤 Import Map</button>
          <input ref="fileInput" type="file" accept=".json" @change="importMap" style="display: none" />
        </div>
      </div>

      <div class="control-section">
        <label class="control-label">Tools:</label>
        <div class="button-group">
          <button @click="generateRandomClimate" class="btn btn-small btn-secondary">🌡️ Auto Climate</button>
          <button @click="generateRandomPopulation" class="btn btn-small btn-secondary">👥 Auto Pop</button>
          <button @click="clearAllData" class="btn btn-small btn-danger">🗑️ Clear All</button>
        </div>
      </div>
    </div>

    <!-- MAP LEGEND - DYNAMIC BASED ON OVERLAY -->
    <div class="legend-section">
      <div v-if="activeOverlay === 'terrain'" class="legend">
        <h4>Terrain Legend</h4>
        <div class="legend-grid">
          <div v-for="terrain in terrainTypes" :key="terrain.id" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: terrain.color }">{{ terrain.symbol }}</div>
            <div class="legend-label">{{ terrain.name }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeOverlay === 'climate'" class="legend">
        <h4>Climate Legend</h4>
        <div class="legend-grid">
          <div v-for="climate in climateTypes" :key="climate.id" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: climate.color }">{{ climate.symbol }}</div>
            <div class="legend-label">{{ climate.name }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeOverlay === 'population'" class="legend">
        <h4>Population Density Legend</h4>
        <div class="legend-grid">
          <div v-for="pop in populationTypes" :key="pop.id" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: pop.color }">{{ pop.symbol }}</div>
            <div class="legend-label">{{ pop.name }} ({{ pop.range }})</div>
          </div>
        </div>
      </div>

      <div v-if="activeOverlay === 'coordinates'" class="legend">
        <h4>Hex Coordinate System</h4>
        <p class="coord-help">
          Format: <strong>T##-##</strong> where T is triangle (N1-N5, M1-M10, S1-S5), first ## is row, second ## is hex
          within row.
        </p>
        <p class="coord-help">Example: <strong>N1-3-5</strong> = North Triangle 1, Row 3, Hex 5</p>
      </div>
    </div>

    <!-- TERRAIN/CLIMATE/POPULATION PALETTE -->
    <div v-if="activeOverlay === 'terrain'" class="palette-controls">
      <label class="palette-label">Terrain Type:</label>
      <div class="palette-grid">
        <button
          v-for="terrain in terrainTypes"
          :key="terrain.id"
          @click="selectedTerrain = terrain.id"
          :class="['palette-btn', { active: selectedTerrain === terrain.id }]"
          :style="{ backgroundColor: terrain.color }"
        >
          {{ terrain.symbol }}
        </button>
      </div>
    </div>

    <div v-if="activeOverlay === 'climate'" class="palette-controls">
      <label class="palette-label">Climate Type:</label>
      <div class="palette-grid">
        <button
          v-for="climate in climateTypes"
          :key="climate.id"
          @click="selectedClimate = climate.id"
          :class="['palette-btn', { active: selectedClimate === climate.id }]"
          :style="{ backgroundColor: climate.color }"
        >
          {{ climate.symbol }}
        </button>
      </div>
    </div>

    <div v-if="activeOverlay === 'population'" class="palette-controls">
      <label class="palette-label">Population Density:</label>
      <div class="palette-grid">
        <button
          v-for="pop in populationTypes"
          :key="pop.id"
          @click="selectedPopulation = pop.id"
          :class="['palette-btn', { active: selectedPopulation === pop.id }]"
          :style="{ backgroundColor: pop.color }"
        >
          {{ pop.symbol }}
        </button>
      </div>
    </div>

    <!-- SELECTED HEX INFO PANEL -->
    <div v-if="selectedHex" class="hex-info-panel">
      <div class="hex-info-header">
        <h4>Hex Information</h4>
        <button @click="selectedHex = null" class="btn-close">✕</button>
      </div>
      <div class="hex-info-grid">
        <div class="info-item">
          <label>Coordinate:</label>
          <input v-model="selectedHex.coordinate" type="text" readonly class="info-input" />
        </div>
        <div class="info-item">
          <label>Terrain:</label>
          <input v-model="selectedHexDisplay.terrain" type="text" readonly class="info-input" />
        </div>
        <div class="info-item">
          <label>Climate:</label>
          <input v-model="selectedHexDisplay.climate" type="text" readonly class="info-input" />
        </div>
        <div class="info-item">
          <label>Population:</label>
          <input v-model="selectedHexDisplay.population" type="text" readonly class="info-input" />
        </div>
        <div class="info-item" style="grid-column: 1 / -1">
          <label>Notes:</label>
          <textarea
            v-model="selectedHex.notes"
            class="info-textarea"
            placeholder="Add detailed notes about this hex..."
          ></textarea>
        </div>
      </div>
      <div class="hex-info-actions">
        <button @click="deleteHexData" class="btn btn-small btn-danger">Delete Hex Data</button>
        <button @click="selectedHex = null" class="btn btn-small btn-secondary">Done</button>
      </div>
    </div>

    <!-- SVG MAP -->
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
          <polygon :points="triangle.points" :class="`tri-${triangle.orientation}`" />

          <!-- Triangle label -->
          <text :x="triangle.labelX" :y="triangle.labelY" class="tri-num" text-anchor="middle" pointer-events="none">
            {{ triangle.label }}
          </text>

          <!-- Hexagonal grid -->
          <g v-for="(hex, hexIdx) in generateHexagons(triangle, mapData.worldSize)" :key="`hex-${idx}-${hexIdx}`">
            <!-- Hex cell -->
            <path
              :d="hex.path"
              :class="[
                'hex-cell',
                {
                  'hex-selected': isHexSelected(triangle.label, hexIdx),
                  'hex-hover': hoveredHex?.triangle === triangle.label && hoveredHex?.hexIndex === hexIdx,
                },
              ]"
              :fill="getHexColor(triangle.label, hexIdx)"
              @click="selectHexAdvanced(triangle.label, hexIdx, hex)"
              @mouseenter="hoveredHex = { triangle: triangle.label, hexIndex: hexIdx }"
              @mouseleave="hoveredHex = null"
            />

            <!-- Hex coordinate label -->
            <text
              v-if="activeOverlay === 'coordinates' || showHexLabels"
              :x="hex.cx"
              :y="hex.cy"
              class="hex-coordinate"
              text-anchor="middle"
              dy="0.3em"
              pointer-events="none"
            >
              {{ formatHexCoordinate(triangle.label, hexIdx) }}
            </text>

            <!-- Hex center dot -->
            <circle :cx="hex.cx" :cy="hex.cy" r="2" class="hex-center-dot" pointer-events="none" />
          </g>
        </g>

        <!-- Poles -->
        <g id="poles">
          <circle v-for="(x, idx) in poleDots.north" :key="`npole-${idx}`" :cx="x" cy="10" r="4" class="pole-dot" />
          <circle
            v-for="(x, idx) in poleDots.south"
            :key="`spole-${idx}`"
            :cx="x"
            :cy="mapDimensions.height - 10"
            r="4"
            class="pole-dot"
          />
        </g>

        <!-- Equator -->
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

    <!-- STATISTICS -->
    <div class="stats-section">
      <div class="stat-grid">
        <div class="stat-item">
          <span class="stat-label">Total Hexes:</span>
          <span class="stat-value">{{ calculateTotalHexes() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Mapped:</span>
          <span class="stat-value">{{ mappedHexes.size }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Coverage:</span>
          <span class="stat-value">{{ ((mappedHexes.size / calculateTotalHexes()) * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="coverage-bar">
        <div class="coverage-fill" :style="{ width: (mappedHexes.size / calculateTotalHexes()) * 100 + '%' }"></div>
      </div>

      <!-- Breakdown by type -->
      <div class="stats-breakdown">
        <div class="breakdown-item">
          <strong>Terrain:</strong>
          <div v-for="terrain in terrainTypes" :key="terrain.id" class="breakdown-row">
            <span>{{ terrain.name }}:</span>
            <span class="breakdown-count">{{ getTerrainCount(terrain.id) }}</span>
          </div>
        </div>

        <div class="breakdown-item">
          <strong>Climate:</strong>
          <div v-for="climate in climateTypes" :key="climate.id" class="breakdown-row">
            <span>{{ climate.name }}:</span>
            <span class="breakdown-count">{{ getClimateCount(climate.id) }}</span>
          </div>
        </div>

        <div class="breakdown-item">
          <strong>Population:</strong>
          <div v-for="pop in populationTypes" :key="pop.id" class="breakdown-row">
            <span>{{ pop.name }}:</span>
            <span class="breakdown-count">{{ getPopulationCount(pop.id) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="form-footer">
      Form 0407F-IV Part W.M2 • Advanced • Hex Coordinates • Climate • Population • Import/Export
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";

// State
const svgKey = ref(0);
const fileInput = ref(null);
const activeOverlay = ref("terrain");
const selectedTerrain = ref("water");
const selectedClimate = ref("temperate");
const selectedPopulation = ref("sparse");
const selectedHex = ref(null);
const hoveredHex = ref(null);
const showHexLabels = ref(true);
const mappedHexes = ref(new Map());

const mapData = reactive({
  worldName: "",
  uwp: "",
  system: "",
  worldSize: 5,
});

// Overlay labels
const overlayLabels = {
  terrain: "🌍 Terrain",
  climate: "🌡️ Climate",
  population: "👥 Population",
  coordinates: "📍 Coordinates",
};

// Terrain types
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

// Climate types
const climateTypes = [
  { id: "tropical", name: "Tropical", color: "#ff6600", symbol: "🔥" },
  { id: "arid", name: "Arid", color: "#ffdd00", symbol: "☀️" },
  { id: "temperate", name: "Temperate", color: "#66ff66", symbol: "🍃" },
  { id: "cold", name: "Cold", color: "#99ddff", symbol: "❄️" },
  { id: "extreme", name: "Extreme", color: "#666666", symbol: "⚡" },
];

// Population types (with rainfall correlation)
const populationTypes = [
  { id: "none", name: "Uninhabited", color: "#e0e0e0", symbol: "○", range: "0" },
  { id: "sparse", name: "Sparse", color: "#ccffcc", symbol: "◐", range: "1-100" },
  { id: "scattered", name: "Scattered", color: "#99ff99", symbol: "◑", range: "100-1K" },
  { id: "moderate", name: "Moderate", color: "#66ff66", symbol: "◕", range: "1K-10K" },
  { id: "high", name: "High", color: "#00cc00", symbol: "●", range: "10K-100K" },
  { id: "very-high", name: "Very High", color: "#006600", symbol: "◆", range: "100K+" },
];

// Icosahedron triangles
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

// Rainfall/climate rules (for world generation context)
const rainfallByClimate = {
  tropical: { min: 60, max: 100 },
  arid: { min: 0, max: 20 },
  temperate: { min: 30, max: 60 },
  cold: { min: 10, max: 40 },
  extreme: { min: 0, max: 10 },
};

// Computed properties
const mapDimensions = computed(() => ({
  width: 860,
  height: 420,
  equatorY: 148,
}));

const poleDots = computed(() => ({
  north: [110, 270, 430, 590, 750],
  south: [110, 270, 430, 590, 750],
}));

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

const selectedHexDisplay = computed(() => {
  if (!selectedHex.value) return {};

  const key = `${selectedHex.value.coordinate}`;
  const hexData = mappedHexes.value.get(key);

  if (!hexData) return { terrain: "None", climate: "None", population: "None" };

  const terrain = terrainTypes.find((t) => t.id === hexData.terrain);
  const climate = climateTypes.find((c) => c.id === hexData.climate);
  const pop = populationTypes.find((p) => p.id === hexData.population);

  return {
    terrain: terrain?.name || "None",
    climate: climate?.name || "None",
    population: pop?.name || "None",
  };
});

// Helper functions
function generateHexagons(triangle, size) {
  const [x1, y1, x2, y2, x3, y3] = triangle.pts;
  const hexagons = [];

  const triWidth = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const hexSize = (triWidth / size) * 0.4;

  let hexIndex = 0;

  for (let row = 0; row < size; row++) {
    const hexesInRow = size - row;
    const rowProgress = row / size;

    for (let col = 0; col < hexesInRow; col++) {
      const u = (row + 1) / (size + 1);
      const v = (col + (row % 2) * 0.5) / hexesInRow;

      let cx = x1 * (1 - u) + x3 * u + (x2 - x1) * v * (1 - u);
      let cy = y1 * (1 - u) + y3 * u + (y2 - y1) * v * (1 - u);

      // Pointy-top hexagon (0°, 60°, 120°, 180°, 240°, 300°)
      const angles = [0, 60, 120, 180, 240, 300].map((a) => (a * Math.PI) / 180);
      const points = angles.map((angle) => [cx + hexSize * Math.cos(angle), cy + hexSize * Math.sin(angle)]);

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

function formatHexCoordinate(triangle, hexIndex) {
  return `${triangle}-${hexIndex + 1}`;
}

function calculateTotalHexes() {
  const size = mapData.worldSize;
  return 2 + 10 * size * size;
}

function isHexSelected(triangle, hexIndex) {
  return selectedHex.value?.coordinate === formatHexCoordinate(triangle, hexIndex);
}

function getHexColor(triangle, hexIndex) {
  const key = formatHexCoordinate(triangle, hexIndex);
  const hexData = mappedHexes.value.get(key);

  if (!hexData) return "#e8f0f8";

  if (activeOverlay.value === "terrain" && hexData.terrain) {
    const terrain = terrainTypes.find((t) => t.id === hexData.terrain);
    return terrain ? terrain.color : "#e8f0f8";
  }

  if (activeOverlay.value === "climate" && hexData.climate) {
    const climate = climateTypes.find((c) => c.id === hexData.climate);
    return climate ? climate.color : "#e8f0f8";
  }

  if (activeOverlay.value === "population" && hexData.population) {
    const pop = populationTypes.find((p) => p.id === hexData.population);
    return pop ? pop.color : "#e8f0f8";
  }

  return "#e8f0f8";
}

function selectHexAdvanced(triangle, hexIndex, hex) {
  const coordinate = formatHexCoordinate(triangle, hexIndex);
  const existingData = mappedHexes.value.get(coordinate) || {};

  selectedHex.value = {
    coordinate,
    triangle,
    hexIndex,
    terrain: existingData.terrain || selectedTerrain.value,
    climate: existingData.climate || selectedClimate.value,
    population: existingData.population || selectedPopulation.value,
    rainfall: existingData.rainfall || 0,
    notes: existingData.notes || "",
  };

  // Auto-save based on current overlay
  if (activeOverlay.value === "terrain" && selectedTerrain.value) {
    selectedHex.value.terrain = selectedTerrain.value;
  } else if (activeOverlay.value === "climate" && selectedClimate.value) {
    selectedHex.value.climate = selectedClimate.value;
  } else if (activeOverlay.value === "population" && selectedPopulation.value) {
    selectedHex.value.population = selectedPopulation.value;
  }

  // Persist to map
  mappedHexes.value.set(coordinate, {
    terrain: selectedHex.value.terrain,
    climate: selectedHex.value.climate,
    population: selectedHex.value.population,
    rainfall: selectedHex.value.rainfall,
    notes: selectedHex.value.notes,
  });
}

function deleteHexData() {
  if (selectedHex.value) {
    mappedHexes.value.delete(selectedHex.value.coordinate);
    selectedHex.value = null;
  }
}

// Terrain/Climate/Population counting
function getTerrainCount(terrainId) {
  let count = 0;
  mappedHexes.value.forEach((hex) => {
    if (hex.terrain === terrainId) count++;
  });
  return count;
}

function getClimateCount(climateId) {
  let count = 0;
  mappedHexes.value.forEach((hex) => {
    if (hex.climate === climateId) count++;
  });
  return count;
}

function getPopulationCount(popId) {
  let count = 0;
  mappedHexes.value.forEach((hex) => {
    if (hex.population === popId) count++;
  });
  return count;
}

// Auto-generation functions
function generateRandomClimate() {
  const climateIds = climateTypes.map((c) => c.id);
  let climateCount = 0;

  mappedHexes.value.forEach((hex, key) => {
    if (!hex.climate || hex.climate === "none") {
      const randomClimate = climateIds[Math.floor(Math.random() * climateIds.length)];
      hex.climate = randomClimate;
      climateCount++;
    }
  });

  // Also generate for unmapped hexes
  const totalHexes = calculateTotalHexes();
  for (let i = mappedHexes.value.size; i < totalHexes; i++) {
    const randomClimate = climateIds[Math.floor(Math.random() * climateIds.length)];
    const key = `auto-${i}`;
    mappedHexes.value.set(key, {
      terrain: "water",
      climate: randomClimate,
      population: "none",
    });
  }

  svgKey.value++;
  alert(`✓ Generated climate for ${climateCount + (totalHexes - mappedHexes.value.size)} hexes`);
}

function generateRandomPopulation() {
  const popIds = populationTypes.map((p) => p.id);
  let popCount = 0;

  mappedHexes.value.forEach((hex, key) => {
    const randomPop = popIds[Math.floor(Math.random() * popIds.length)];
    hex.population = randomPop;
    popCount++;
  });

  svgKey.value++;
  alert(`✓ Generated population for ${popCount} hexes`);
}

// Export/Import
function exportMap() {
  const mapExport = {
    worldName: mapData.worldName,
    uwp: mapData.uwp,
    system: mapData.system,
    worldSize: mapData.worldSize,
    totalHexes: calculateTotalHexes(),
    hexData: Array.from(mappedHexes.value.entries()).map(([coordinate, data]) => ({
      coordinate,
      ...data,
    })),
    exportedAt: new Date().toISOString(),
    version: "2.0",
  };

  const json = JSON.stringify(mapExport, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${mapData.worldName || "world"}-hex-map-v2.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert("✓ Map exported successfully!");
}

function triggerImport() {
  fileInput.value?.click();
}

function importMap(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result);

      // Load map metadata
      mapData.worldName = data.worldName;
      mapData.uwp = data.uwp;
      mapData.system = data.system;
      mapData.worldSize = data.worldSize;

      // Load hex data
      mappedHexes.value.clear();
      data.hexData.forEach((hexEntry) => {
        const { coordinate, terrain, climate, population, rainfall, notes } = hexEntry;
        mappedHexes.value.set(coordinate, {
          terrain,
          climate,
          population,
          rainfall,
          notes,
        });
      });

      selectedHex.value = null;
      svgKey.value++;
      alert(`✓ Map imported successfully! (${data.hexData.length} hexes loaded)`);
    } catch (error) {
      console.error("Import error:", error);
      alert("✗ Error importing map. Check browser console for details.");
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (confirm("Clear all hex data? This cannot be undone.")) {
    mappedHexes.value.clear();
    selectedHex.value = null;
    svgKey.value++;
    alert("✓ All data cleared");
  }
}

function recalculateMap() {
  svgKey.value++;
  mappedHexes.value.clear();
  selectedHex.value = null;
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
  font-size: 9px;
  text-align: right;
}

/* ── IDENTITY ROW ── */
.identity-row {
  display: flex;
  border-bottom: 1px solid #888;
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

/* ── CONTROL PANEL ── */
.control-panel {
  padding: 10px;
  background: #f9f9f9;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #555;
}

.button-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.overlay-btn {
  padding: 6px 10px;
  border: 1px solid #999;
  background: #fff;
  border-radius: 3px;
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.overlay-btn:hover {
  background: #f0f0f0;
}

.overlay-btn.active {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}

.btn-small {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  font-size: 8px;
  white-space: nowrap;
}

.btn-primary {
  background: #0e9a87;
  color: #fff;
}

.btn-primary:hover {
  background: #0a7a6f;
  box-shadow: 0 0 6px rgba(14, 154, 135, 0.4);
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
}

.btn-danger {
  background: #ff6b6b;
  color: #fff;
}

.btn-danger:hover {
  background: #ff5252;
}

/* ── LEGEND SECTION ── */
.legend-section {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.legend h4 {
  font-size: 9px;
  text-transform: uppercase;
  color: #333;
  margin-bottom: 8px;
}

.coord-help {
  font-size: 8px;
  color: #666;
  margin: 4px 0;
  line-height: 1.4;
}

.coord-help strong {
  color: #1a1a2e;
  font-family: monospace;
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

/* ── PALETTE CONTROLS ── */
.palette-controls {
  padding: 10px;
  background: #f9f9f9;
  border-bottom: 1px solid #ccc;
}

.palette-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #555;
  display: block;
  margin-bottom: 8px;
}

.palette-grid {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.palette-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.palette-btn:hover {
  transform: scale(1.1);
  border-color: #333;
}

.palette-btn.active {
  border-color: #0e9a87;
  box-shadow: 0 0 8px rgba(14, 154, 135, 0.5);
  transform: scale(1.15);
}

/* ── HEX INFO PANEL ── */
.hex-info-panel {
  padding: 12px;
  background: #f0f8ff;
  border: 2px solid #0e9a87;
  border-radius: 4px;
  margin: 10px;
}

.hex-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hex-info-header h4 {
  margin: 0;
  color: #1a1a2e;
  font-size: 11px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.hex-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 8px;
  font-weight: bold;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.info-input {
  border: 1px solid #999;
  padding: 6px;
  font-size: 10px;
  border-radius: 2px;
  background: white;
}

.info-textarea {
  border: 1px solid #999;
  padding: 6px;
  font-size: 9px;
  border-radius: 2px;
  background: white;
  resize: vertical;
  min-height: 60px;
}

.hex-info-actions {
  display: flex;
  gap: 8px;
}

.hex-info-actions .btn {
  flex: 1;
  padding: 4px 8px;
  font-size: 8px;
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

.hex-coordinate {
  font-size: 6px;
  fill: #446;
  opacity: 0.6;
  pointer-events: none;
  font-weight: bold;
}

/* Poles */
.pole-dot {
  fill: #cc3333;
}

.tri-num {
  font-size: 7px;
  fill: #446;
  opacity: 0.7;
  font-weight: bold;
}

/* Equator */
.equator-line {
  stroke: #aa4400;
  stroke-width: 1.5;
  stroke-dasharray: 8, 4;
  opacity: 0.6;
}

/* ── STATISTICS SECTION ── */
.stats-section {
  padding: 12px;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 8px;
  font-weight: bold;
  color: #555;
  text-transform: uppercase;
}

.stat-value {
  color: #0e9a87;
  font-weight: bold;
  font-size: 14px;
}

.coverage-bar {
  height: 20px;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid #999;
  margin-bottom: 12px;
}

.coverage-fill {
  height: 100%;
  background: linear-gradient(90deg, #0e9a87, #00ff00);
  transition: width 0.3s;
}

.stats-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.breakdown-item {
  background: white;
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.breakdown-item strong {
  display: block;
  font-size: 8px;
  color: #1a1a2e;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: #666;
  margin: 3px 0;
}

.breakdown-count {
  font-weight: bold;
  color: #0e9a87;
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
  .control-panel,
  .legend-section,
  .palette-controls,
  .hex-info-panel,
  .stats-breakdown {
    display: none !important;
  }
}
</style>
