<template>
  <div class="sector-survey">
    <SurveyNavigation
      currentClass="Class 0 – Sector Survey"
      :back-route="{ name: 'GalaxySurvey' }"
      @regenerate="regenerateSector"
      @export="exportSector"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Survey Scope:</label>
          <select v-model="scope" class="select-input">
            <option value="sector">Sector (4 × 4 subsectors, 32 × 40 hexes)</option>
            <option value="subsector">Subsector (8 × 10 hexes)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Sector Name:</label>
          <div class="name-row">
            <input v-model="sectorName" placeholder="Enter sector name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeSectorName">🎲 Random</button>
          </div>
        </div>

        <div class="control-group">
          <label>Star Density:</label>
          <select v-model="density" class="select-input">
            <option value="core">Core (dense — 60–80 %)</option>
            <option value="dense">Dense (spiral arm — 40–60 %)</option>
            <option value="average">Average (disk — 20–40 %)</option>
            <option value="scattered">Scattered (outer — 10–20 %)</option>
            <option value="void">Void (halo — 1–5 %)</option>
          </select>
        </div>

        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateSector">⚡ Generate Sector</button>
        </div>
      </div>

      <!-- Results Grid -->
      <div v-if="generatedSector" class="sector-results">
        <div class="sector-header">
          <h2>{{ generatedSector.name }}</h2>
          <div class="sector-stats">
            <span class="stat">{{ generatedSector.systemCount }} systems</span>
            <span class="stat">{{ generatedSector.emptyCount }} empty hexes</span>
            <span class="divider">|</span>
            <span class="stat density-label">{{ densityLabel }}</span>
          </div>
        </div>

        <!-- Hex Grid -->
        <div class="hex-grid-wrapper">
          <div class="hex-grid" :style="gridStyle">
            <div
              v-for="hex in generatedSector.hexes"
              :key="hex.coord"
              class="hex-cell"
              :class="{ occupied: hex.hasSystem, selected: hex.coord === selectedHex }"
              @click="selectHex(hex)"
              :title="hex.hasSystem ? `${hex.coord} — ${hex.starType}` : hex.coord"
            >
              <div class="hex-coord">{{ hex.coord }}</div>
              <div v-if="hex.hasSystem" class="hex-star" :class="hex.starClass">★</div>
            </div>
          </div>
        </div>

        <!-- Selected Hex Detail -->
        <div v-if="selectedHexData?.hasSystem" class="hex-detail">
          <h3>System at {{ selectedHexData.coord }}</h3>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="label">Primary Star:</span>
              <span class="value">{{ selectedHexData.starType }}</span>
            </div>
            <div class="detail-row" v-if="selectedHexData.secondaryStars?.length">
              <span class="label">Secondary Stars:</span>
              <span class="value">{{ selectedHexData.secondaryStars.join(", ") }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" @click="proceedToStarSystem">
              🔭 Class I Stellar Survey →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";

const props = defineProps({ galaxyId: { type: String, default: null } });
const router = useRouter();

// ── State ────────────────────────────────────────────────────────────────────
const scope = ref("sector");
const sectorName = ref("");
const density = ref("average");
const generatedSector = ref(null);
const selectedHex = ref(null);

// ── Computed ─────────────────────────────────────────────────────────────────
const densityLabel = computed(() => {
  const map = {
    core: "Core Density",
    dense: "Dense",
    average: "Average",
    scattered: "Scattered",
    void: "Void",
  };
  return map[density.value] ?? density.value;
});

const gridStyle = computed(() => {
  if (!generatedSector.value) return {};
  const cols = generatedSector.value.gridCols;
  const rows = generatedSector.value.gridRows;
  return {
    gridTemplateColumns: `repeat(${cols}, 56px)`,
    gridTemplateRows: `repeat(${rows}, 56px)`,
  };
});

const selectedHexData = computed(() =>
  generatedSector.value?.hexes.find((h) => h.coord === selectedHex.value) ?? null,
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const DENSITY_RATES = { core: 0.7, dense: 0.5, average: 0.3, scattered: 0.15, void: 0.03 };

const SPECTRAL_WEIGHTS = [
  { type: "O", weight: 0.00003, cls: "spectral-o" },
  { type: "B", weight: 0.0013, cls: "spectral-b" },
  { type: "A", weight: 0.006, cls: "spectral-a" },
  { type: "F", weight: 0.03, cls: "spectral-f" },
  { type: "G", weight: 0.076, cls: "spectral-g" },
  { type: "K", weight: 0.121, cls: "spectral-k" },
  { type: "M", weight: 0.765, cls: "spectral-m" },
];

function weightedSpectralType() {
  const total = SPECTRAL_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const entry of SPECTRAL_WEIGHTS) {
    r -= entry.weight;
    if (r <= 0) return entry;
  }
  return SPECTRAL_WEIGHTS[SPECTRAL_WEIGHTS.length - 1];
}

function randomLuminosityClass() {
  const r = Math.random();
  if (r < 0.001) return "Ia";
  if (r < 0.005) return "Ib";
  if (r < 0.02) return "II";
  if (r < 0.06) return "III";
  if (r < 0.12) return "IV";
  return "V";
}

function buildStarDesignation() {
  const { type } = weightedSpectralType();
  const dec = Math.floor(Math.random() * 10);
  const cls = randomLuminosityClass();
  return `${type}${dec}${cls}`;
}

function hasSecondary() {
  return Math.random() < 0.35;
}

function hexCoord(col, row) {
  return String(col).padStart(2, "0") + String(row).padStart(2, "0");
}

const SECTOR_NAMES = [
  "Spinward Reaches",
  "Coreward Expanse",
  "Trailing Void",
  "Rimward Depths",
  "Starfall Sector",
  "Irongate Sector",
  "Nebula Crossing",
  "Deep Silence",
  "Ember Fields",
  "Fractured Sky",
  "Veiled Passage",
  "Iron Shore",
];

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeSectorName() {
  sectorName.value = SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)];
}

function generateSector() {
  const cols = scope.value === "sector" ? 32 : 8;
  const rows = scope.value === "sector" ? 40 : 10;
  const rate = DENSITY_RATES[density.value] ?? 0.3;

  const hexes = [];
  let systemCount = 0;

  for (let c = 1; c <= cols; c++) {
    for (let r = 1; r <= rows; r++) {
      const hasSystem = Math.random() < rate;
      const coord = hexCoord(c, r);
      if (hasSystem) {
        const primary = weightedSpectralType();
        const secondaryStars = hasSecondary() ? [buildStarDesignation()] : [];
        hexes.push({
          coord,
          hasSystem: true,
          starType: buildStarDesignation(),
          starClass: primary.cls,
          secondaryStars,
        });
        systemCount++;
      } else {
        hexes.push({ coord, hasSystem: false });
      }
    }
  }

  generatedSector.value = {
    name: sectorName.value || SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)],
    scope: scope.value,
    density: density.value,
    gridCols: cols,
    gridRows: rows,
    hexes,
    systemCount,
    emptyCount: cols * rows - systemCount,
  };
  selectedHex.value = null;
}

function selectHex(hex) {
  selectedHex.value = hex.coord === selectedHex.value ? null : hex.coord;
}

function regenerateSector() {
  if (generatedSector.value) generateSector();
}

function exportSector() {
  if (!generatedSector.value) return;
  const dataStr = JSON.stringify(generatedSector.value, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${generatedSector.value.name.replace(/\s+/g, "-")}-Sector.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function proceedToStarSystem() {
  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: props.galaxyId ?? "000", sectorId: generatedSector.value?.name ?? "sector" },
    query: { hex: selectedHex.value, star: selectedHexData.value?.starType },
  });
}
</script>

<style scoped>
.sector-survey {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.survey-content {
  padding: 2rem;
  flex: 1;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 220px;
}

.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}

.control-action {
  justify-content: flex-end;
}

.select-input,
.text-input {
  padding: 0.6rem 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.name-row {
  display: flex;
  gap: 0.5rem;
}

.name-row .text-input {
  flex: 1;
}

.btn {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #00d9ff;
  color: #000;
}

.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
}

.btn-secondary {
  background: #444;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #555;
}

/* Sector results */
.sector-results {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.sector-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.sector-header h2 {
  color: #00d9ff;
  margin: 0;
}

.sector-stats {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  color: #aaa;
  font-size: 0.9rem;
}

.stat {
  color: #e0e0e0;
}

.density-label {
  color: #00ffff;
  font-weight: bold;
}

.divider {
  color: #555;
}

/* Hex Grid */
.hex-grid-wrapper {
  overflow: auto;
  max-height: 480px;
  border: 1px solid #333;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: #0d0d1a;
}

.hex-grid {
  display: grid;
  gap: 2px;
  width: fit-content;
}

.hex-cell {
  width: 54px;
  height: 54px;
  border: 1px solid #1e1e3a;
  border-radius: 0.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}

.hex-cell:hover {
  background: #1a1a3a;
  border-color: #555;
}

.hex-cell.occupied {
  background: #12122a;
  border-color: #2a2a5a;
}

.hex-cell.selected {
  background: #1a2a4a;
  border-color: #00d9ff;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
}

.hex-coord {
  font-size: 0.55rem;
  color: #555;
  font-family: monospace;
}

.hex-star {
  font-size: 1.1rem;
  line-height: 1;
}

/* Spectral class colours */
.spectral-o { color: #9bb0ff; }
.spectral-b { color: #aabfff; }
.spectral-a { color: #cad7ff; }
.spectral-f { color: #f8f7ff; }
.spectral-g { color: #fff4ea; }
.spectral-k { color: #ffd2a1; }
.spectral-m { color: #ff8c69; }

/* Hex detail panel */
.hex-detail {
  margin-top: 1.5rem;
  background: #12122e;
  border: 1px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.hex-detail h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-row .label {
  color: #00ffff;
  font-weight: bold;
  min-width: 140px;
}

.detail-row .value {
  color: #e0e0e0;
  font-family: monospace;
}

.detail-actions {
  margin-top: 1rem;
}
</style>
