<template>
  <div class="sector-survey">
    <LoadingSpinner :isVisible="isLoading" :message="loadingMessage" />
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
          <label>Load Existing Sector:</label>
          <select v-model="selectedSectorId" class="select-input" @change="loadSelectedSector">
            <option value="">Select a saved sector...</option>
            <option v-for="sector in sectorOptions" :key="sector.sectorId" :value="sector.sectorId">
              {{ sector.label }}
            </option>
          </select>
        </div>

        <!-- Subsector Selection Grid -->
        <div v-if="scope === 'subsector'" class="control-group">
          <label>Select Subsector:</label>
          <div class="subsector-grid">
            <button
              v-for="letter in SUBSECTOR_LETTERS"
              :key="letter"
              :class="['subsector-btn', { active: selectedSubsector === letter }]"
              @click="selectedSubsector = letter"
            >
              {{ letter }}
            </button>
          </div>
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
          <button class="btn btn-primary" @click="generateSector">
            ⚡ {{ scope === "subsector" ? "Generate Subsector" : "Generate Sector" }}
          </button>
        </div>
      </div>

      <div v-if="props.galaxyId && !hasSavedSectors && !generatedSector" class="context-hint">
        No saved sectors found for this galaxy yet. Generate your first sector to begin.
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

        <div v-if="!hasSystemsInGrid" class="grid-hint warning">
          No systems are mapped in this sector yet. Load a different sector or generate one with systems to continue.
        </div>
        <div v-else-if="showSelectHexHint" class="grid-hint">
          Select an occupied hex (★) to continue to Class I Stellar Survey.
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
            <button class="btn btn-primary" @click="proceedToStarSystem">🔭 Class I Stellar Survey →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, watch } from "vue";
import { useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import * as toastService from "../../utils/toast.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";

const props = defineProps({ galaxyId: { type: String, default: null } });
const router = useRouter();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();

// ── State ────────────────────────────────────────────────────────────────────
const scope = ref("sector");
const selectedSubsector = ref("A");
const selectedSectorId = ref("");
const sectorName = ref("");
const density = ref("average");
const generatedSector = ref(null);
const selectedHex = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");
// Subsector letters in 4x4 grid (A-P)
const SUBSECTOR_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

// Update page title dynamically
watchEffect(() => {
  if (sectorName.value) {
    document.title = `Sector Survey: ${sectorName.value} | Eclipsed Horizons`;
  } else {
    document.title = "Sector Survey | Eclipsed Horizons";
  }
});

watch(
  () => props.galaxyId,
  async (galaxyId) => {
    await initializeSectorSelection(galaxyId);
  },
  { immediate: true },
);

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

const selectedHexData = computed(() => generatedSector.value?.hexes.find((h) => h.coord === selectedHex.value) ?? null);

const hasSystemsInGrid = computed(() => (generatedSector.value?.systemCount ?? 0) > 0);
const showSelectHexHint = computed(() => hasSystemsInGrid.value && !selectedHexData.value?.hasSystem);

const sectorOptions = computed(() =>
  sectorStore.sectors.map((sector) => ({
    sectorId: sector.sectorId,
    label: buildSectorLabel(sector),
  })),
);

const hasSavedSectors = computed(() => sectorOptions.value.length > 0);

const loadingMessage = computed(() =>
  loadingMode.value === "load" ? "Loading sector systems..." : "Generating sector...",
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const DENSITY_RATES = { core: 0.7, dense: 0.5, average: 0.3, scattered: 0.15, void: 0.03 };
const DENSITY_CLASS_MAP = { void: 1, scattered: 2, average: 3, dense: 4, core: 5 };

function spectralClassToCssClass(spectralClass) {
  const code = String(spectralClass || "G")
    .charAt(0)
    .toUpperCase();
  return (
    {
      O: "spectral-o",
      B: "spectral-b",
      A: "spectral-a",
      F: "spectral-f",
      G: "spectral-g",
      K: "spectral-k",
      M: "spectral-m",
    }[code] || "spectral-g"
  );
}

function densityFromClass(densityClass) {
  return (
    {
      1: "void",
      2: "scattered",
      3: "average",
      4: "dense",
      5: "core",
    }[densityClass] || "average"
  );
}

function buildSectorLabel(sector) {
  const displayName = String(sector?.metadata?.displayName || "").trim();
  if (displayName) {
    return `${displayName} (${sector.sectorId})`;
  }
  return sector?.sectorId || "Unknown sector";
}

function inferGridDimensions(sector) {
  const metadata = sector?.metadata || {};
  if (metadata.scope === "subsector") {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  if (Number.isInteger(metadata.gridCols) && Number.isInteger(metadata.gridRows)) {
    const inferredScope = metadata.gridCols === 8 && metadata.gridRows === 10 ? "subsector" : "sector";
    return { scope: inferredScope, cols: metadata.gridCols, rows: metadata.gridRows };
  }
  const notes = String(metadata.notes || "").toLowerCase();
  if (notes.includes("subsector")) {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  return { scope: "sector", cols: 32, rows: 40 };
}

function buildHexGridFromSystems(systems, cols, rows) {
  const occupied = new Map();

  for (const system of systems) {
    const x = Number(system?.hexCoordinates?.x);
    const y = Number(system?.hexCoordinates?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    const safeX = Math.min(cols, Math.max(1, Math.trunc(x)));
    const safeY = Math.min(rows, Math.max(1, Math.trunc(y)));
    const coord = hexCoord(safeX, safeY);
    const generatedStars = Array.isArray(system?.metadata?.generatedSurvey?.stars)
      ? system.metadata.generatedSurvey.stars
      : [];
    const generatedPrimary = generatedStars[0] ?? null;
    const primaryCode = String(generatedPrimary?.spectralType || system?.primaryStar?.spectralClass || "G")
      .trim()
      .toUpperCase();

    const secondaryStars =
      generatedStars.length > 1
        ? generatedStars
            .slice(1)
            .map((star) => String(star?.designation || "").trim())
            .filter(Boolean)
        : Array.isArray(system?.companionStars)
          ? system.companionStars
              .map((star) => String(star?.spectralClass || "").trim())
              .filter(Boolean)
              .map((spectral) => `${spectral}V`)
          : [];

    occupied.set(coord, {
      coord,
      hasSystem: true,
      starType: String(generatedPrimary?.designation || `${primaryCode}V`),
      starClass: spectralClassToCssClass(primaryCode),
      secondaryStars,
      systemId: system.systemId,
    });
  }

  const hexes = [];
  for (let col = 1; col <= cols; col++) {
    for (let row = 1; row <= rows; row++) {
      const coord = hexCoord(col, row);
      hexes.push(occupied.get(coord) ?? { coord, hasSystem: false });
    }
  }

  return { hexes, systemCount: occupied.size };
}

function hasSecondary() {
  return Math.random() < 0.35;
}

function hexCoord(col, row) {
  return String(col).padStart(2, "0") + String(row).padStart(2, "0");
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

function createSectorId(name) {
  const token = sanitizeId(name) || "sector";
  return `sec_${token}_${Date.now()}`.slice(0, 50);
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
async function loadSelectedSector() {
  if (!selectedSectorId.value) {
    return;
  }
  await loadPersistedSector(selectedSectorId.value, true);
}

async function loadPersistedSector(sectorId, showToast = false) {
  if (!props.galaxyId || !sectorId) {
    return;
  }

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    await systemStore.loadSystems(props.galaxyId, sectorId);
    const sector = sectorStore.sectors.find((entry) => entry.sectorId === sectorId);

    if (!sector) {
      toastService.error("Selected sector could not be found.");
      return;
    }

    const { scope: loadedScope, cols, rows } = inferGridDimensions(sector);
    const { hexes, systemCount } = buildHexGridFromSystems(systemStore.systems, cols, rows);

    scope.value = loadedScope;
    density.value = densityFromClass(sector.densityClass);
    selectedSubsector.value =
      String(sector?.metadata?.subsector || "A")
        .charAt(0)
        .toUpperCase() || "A";
    sectorName.value = String(sector?.metadata?.displayName || sectorId);
    selectedHex.value = null;

    generatedSector.value = {
      sectorId: sector.sectorId,
      name: sectorName.value,
      scope: loadedScope,
      density: density.value,
      gridCols: cols,
      gridRows: rows,
      hexes,
      systemCount,
      emptyCount: cols * rows - systemCount,
    };

    sectorStore.setCurrentSector(sectorId);
    if (showToast) {
      toastService.success(`Loaded sector ${sectorName.value}. Select an occupied hex to continue.`);
    }
  } catch (err) {
    toastService.error(`Failed to load sector systems: ${err.message}`);
  } finally {
    isLoading.value = false;
    loadingMode.value = "generate";
  }
}

async function initializeSectorSelection(galaxyId) {
  generatedSector.value = null;
  selectedHex.value = null;
  selectedSectorId.value = "";

  if (!galaxyId) {
    return;
  }

  await sectorStore.loadSectors(galaxyId);

  if (sectorStore.error) {
    toastService.error(`Failed to load sectors: ${sectorStore.error}`);
    return;
  }

  const currentSector = sectorStore.sectors.find((sector) => sector.sectorId === sectorStore.currentSectorId);
  const fallbackSector = sectorStore.sectors[0];
  const initialSector = currentSector ?? fallbackSector;

  if (initialSector) {
    selectedSectorId.value = initialSector.sectorId;
    await loadPersistedSector(initialSector.sectorId, false);
  }
}

function randomizeSectorName() {
  sectorName.value = SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)];
}

async function generateSector() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    // Use setTimeout to show loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

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
          const primary = generatePrimaryStar();
          const secondaryStars = hasSecondary() ? [generatePrimaryStar().designation] : [];
          hexes.push({
            coord,
            hasSystem: true,
            starType: primary.designation,
            starClass: spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass),
            secondaryStars,
          });
          systemCount++;
        } else {
          hexes.push({ coord, hasSystem: false });
        }
      }
    }

    let generatedName = sectorName.value || SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)];

    // Append subsector letter if generating a subsector
    if (scope.value === "subsector") {
      generatedName = `${generatedName} / ${selectedSubsector.value}`;
    }

    const sectorPayload = {
      sectorId: createSectorId(generatedName),
      galaxyId: props.galaxyId,
      coordinates: {
        x: Math.floor(Math.random() * 1001),
        y: Math.floor(Math.random() * 1001),
      },
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +(rate * 100).toFixed(2),
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        explorationStatus: "unexplored",
        systemCount,
        displayName: generatedName,
        scope: scope.value,
        gridCols: cols,
        gridRows: rows,
        subsector: scope.value === "subsector" ? selectedSubsector.value : null,
        notes: scope.value === "subsector" ? `Generated subsector ${selectedSubsector.value}` : "Generated sector",
      },
    };

    const persistedSector = await sectorStore.createSector(sectorPayload);
    selectedSectorId.value = persistedSector.sectorId;

    generatedSector.value = {
      sectorId: persistedSector.sectorId,
      name: generatedName,
      scope: scope.value,
      density: density.value,
      gridCols: cols,
      gridRows: rows,
      hexes,
      systemCount,
      emptyCount: cols * rows - systemCount,
    };
    selectedHex.value = null;
    toastService.success(`Sector "${generatedName}" generated and saved.`);
  } catch (err) {
    toastService.error(`Failed to generate/save sector: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
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
  if (!generatedSector.value?.sectorId) {
    toastService.error("Sector has not been saved yet. Please generate sector again.");
    return;
  }

  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: props.galaxyId ?? "000", sectorId: generatedSector.value.sectorId },
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

.context-hint {
  margin-bottom: 1rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #00d9ff;
  border-radius: 0.25rem;
  background: rgba(0, 217, 255, 0.08);
  color: #b7f7ff;
  font-size: 0.9rem;
}

.control-action {
  justify-content: flex-end;
}

/* Subsector Selection Grid */
.subsector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.subsector-btn {
  padding: 0.75rem;
  background: #2a2a3e;
  border: 2px solid #444;
  color: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.subsector-btn:hover {
  background: #3a3a4e;
  border-color: #00ffff;
  transform: translateY(-2px);
}

.subsector-btn.active {
  background: #00ffff;
  border-color: #00ffff;
  color: #000;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.subsector-btn.active:hover {
  background: #33ffff;
  transform: translateY(-2px);
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

.grid-hint {
  margin-top: 0.85rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #00d9ff;
  border-radius: 0.25rem;
  background: rgba(0, 217, 255, 0.08);
  color: #b7f7ff;
  font-size: 0.9rem;
}

.grid-hint.warning {
  border-color: #ffb347;
  background: rgba(255, 179, 71, 0.1);
  color: #ffd9a3;
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
  transition:
    background 0.15s,
    border-color 0.15s;
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
.spectral-o {
  color: #9bb0ff;
}
.spectral-b {
  color: #aabfff;
}
.spectral-a {
  color: #cad7ff;
}
.spectral-f {
  color: #f8f7ff;
}
.spectral-g {
  color: #fff4ea;
}
.spectral-k {
  color: #ffd2a1;
}
.spectral-m {
  color: #ff8c69;
}

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
