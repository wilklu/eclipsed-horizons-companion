<template>
  <div class="sector-survey">
    <LoadingSpinner :isVisible="isLoading" context="sector" tone="sync" :message="loadingMessage" />
    <LoadingSpinner v-bind="sectorExportOverlayProps" />
    <SurveyNavigation
      currentClass="Sector Survey"
      :back-route="backRoute"
      :regenerate-label="generationAction.label"
      @regenerate="runSurveyAction"
      @export="exportSector"
    />

    <div class="survey-content">
      <div class="survey-workspace">
        <aside class="control-panel">
          <section v-if="generatedSector" class="control-group control-card sector-summary-card">
            <label>Current Sector</label>
            <div class="sector-summary sector-summary--panel">
              <div class="sector-summary-row">
                <span class="summary-pill summary-pill--title">
                  <span class="summary-pill-label">Sector Name</span>
                  <span class="summary-pill-value summary-pill-value--title">{{ generatedSector.name }}</span>
                </span>
              </div>
              <div class="sector-summary-row sector-summary-row--secondary">
                <div class="sector-summary-group sector-summary-group--left">
                  <span class="summary-pill">
                    <span class="summary-pill-label">Systems</span>
                    <span class="summary-pill-value">{{ generatedSector.systemCount.toLocaleString() }}</span>
                  </span>
                  <span class="summary-pill">
                    <span class="summary-pill-label">Empty Hexes</span>
                    <span class="summary-pill-value">{{ generatedSector.emptyCount.toLocaleString() }}</span>
                  </span>
                </div>
                <div class="sector-summary-group sector-summary-group--right">
                  <span class="summary-pill">
                    <span class="summary-pill-label">Star Density</span>
                    <span class="summary-pill-value">{{ densityLabel }}</span>
                  </span>
                  <span class="summary-pill">
                    <span class="summary-pill-label">Realism</span>
                    <span class="summary-pill-value">{{ occupancyRealismLabel }}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="control-card control-card--survey">
            <div class="control-group">
              <label>Survey Scope:</label>
              <select v-model="scope" class="select-input">
                <option value="sector">Sector (4 × 4 subsectors, 32 × 40 hexes)</option>
                <option value="subsector">Subsector (8 × 10 hexes)</option>
              </select>
            </div>

            <div class="control-group control-group--span-2">
              <label>Load Existing Sector:</label>
              <div class="control-inline-row control-inline-row--load">
                <select v-model="selectedSectorId" class="select-input control-inline-select">
                  <option value="">Select a saved sector...</option>
                  <option v-for="sector in sectorOptions" :key="sector.sectorId" :value="sector.sectorId">
                    {{ sector.label }}
                  </option>
                </select>
                <button
                  class="btn btn-secondary btn-icon"
                  :disabled="!canLoadSelectedSector"
                  title="Load selected sector"
                  aria-label="Load selected sector"
                  @click="loadSelectedSector"
                >
                  📂
                </button>
                <button
                  class="btn btn-secondary btn-icon"
                  :disabled="!canSaveSector"
                  title="Save current sector"
                  aria-label="Save current sector"
                  @click="saveCurrentSector({ showToast: true })"
                >
                  💾
                </button>
              </div>
            </div>

            <div v-if="scope === 'subsector'" class="control-group control-group--span-2">
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

            <div v-if="scope === 'subsector'" class="control-group">
              <label>Subsector Name:</label>
              <input v-model="subsectorName" placeholder="Enter subsector name…" class="text-input" />
            </div>

            <div class="control-group control-group--span-2">
              <label>Sector Name:</label>
              <div class="name-row">
                <input
                  v-model="sectorName"
                  placeholder="Enter sector name…"
                  class="text-input"
                  @blur="persistSectorName()"
                  @keydown.enter.prevent="persistSectorName({ showToast: true })"
                />
                <button
                  class="btn btn-secondary"
                  @click="randomizeSectorName"
                  title="Random sector name"
                  aria-label="Random sector name"
                >
                  🎲
                </button>
                <button
                  class="btn btn-secondary"
                  type="button"
                  :disabled="!supportsSpeechSynthesis"
                  :title="
                    supportsSpeechSynthesis
                      ? isSpeakingSectorName
                        ? 'Stop sector name audio'
                        : 'Speak sector name'
                      : 'Text to speech not supported in this browser'
                  "
                  :aria-label="
                    supportsSpeechSynthesis
                      ? isSpeakingSectorName
                        ? 'Stop sector name audio'
                        : 'Speak sector name'
                      : 'Text to speech not supported in this browser'
                  "
                  @mousedown.prevent
                  @click="toggleSectorNameSpeech"
                >
                  {{ isSpeakingSectorName ? "■" : "🔊" }}
                </button>
                <button
                  class="btn btn-secondary"
                  @click="persistSectorName({ showToast: true })"
                  :disabled="!canPersistSectorName"
                  title="Save sector name"
                  aria-label="Save sector name"
                >
                  💾
                </button>
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

            <div class="control-group control-group--span-2 control-group--slider">
              <label>Occupancy Realism: {{ Math.round(occupancyRealism * 100) }}%</label>
              <input v-model.number="occupancyRealism" class="range-input" type="range" min="0" max="2" step="0.05" />
              <div class="control-help">
                {{ occupancyRealismHelp }}
              </div>
            </div>

            <div class="control-group control-group--generation-options control-group--span-2">
              <label>Initial Survey Mode:</label>
              <div class="control-inline-row control-inline-row--generation">
                <select v-model="generationMode" class="select-input control-inline-select">
                  <option v-for="option in generationModeOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
                <button class="btn btn-primary" :disabled="isLoading" @click="runSurveyAction">
                  {{ generationAction.label }}
                </button>
              </div>
              <div class="control-help">
                {{ generationAction.description }}
              </div>
            </div>

            <div v-if="generatedSector" class="control-group control-group--span-2">
              <label>Stellar Survey</label>
              <div v-if="selectedHexData?.hasSystem" class="stellar-inline-card">
                <div class="stellar-inline-copy">
                  <span class="stellar-inline-title">System {{ selectedHexData.coord }}</span>
                  <span class="stellar-inline-detail">{{ selectedHexData.starType }}</span>
                  <span v-if="selectedHexData.secondaryStars?.length" class="stellar-inline-detail"
                    >+ {{ selectedHexData.secondaryStars.join(", ") }}</span
                  >
                </div>
                <div class="detail-actions">
                  <button class="btn btn-primary" @click="proceedToStarSystem">🔭 Stellar Survey →</button>
                </div>
              </div>
              <div v-else-if="hasSystemsInGrid" class="stellar-inline-card stellar-inline-card--placeholder">
                <div class="stellar-inline-copy">
                  <span class="stellar-inline-title">No Hex Selected</span>
                  <span class="stellar-inline-detail"
                    >Select a surveyed hex (★) in the sector grid to open Stellar Survey.</span
                  >
                </div>
              </div>
            </div>

            <div v-if="galaxyMinimap" class="control-group galaxy-position-group control-group--span-2">
              <label>Galaxy Position</label>
              <div class="galaxy-minimap-container">
                <svg
                  class="galaxy-minimap-svg"
                  :viewBox="`0 0 ${galaxyMinimap.svgSize} ${galaxyMinimap.svgSize}`"
                  :width="galaxyMinimap.svgSize"
                  :height="galaxyMinimap.svgSize"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    :cx="galaxyMinimap.svgSize / 2"
                    :cy="galaxyMinimap.svgSize / 2"
                    :rx="galaxyMinimap.ellipseRx"
                    :ry="galaxyMinimap.ellipseRy"
                    class="galaxy-boundary"
                  />
                  <line
                    :x1="galaxyMinimap.centerPx - 6"
                    :y1="galaxyMinimap.centerPy"
                    :x2="galaxyMinimap.centerPx + 6"
                    :y2="galaxyMinimap.centerPy"
                    class="galaxy-crosshair"
                  />
                  <line
                    :x1="galaxyMinimap.centerPx"
                    :y1="galaxyMinimap.centerPy - 6"
                    :x2="galaxyMinimap.centerPx"
                    :y2="galaxyMinimap.centerPy + 6"
                    class="galaxy-crosshair"
                  />
                  <circle
                    :cx="galaxyMinimap.centerPx"
                    :cy="galaxyMinimap.centerPy"
                    :r="galaxyMinimap.centerGuideRadius"
                    class="galaxy-center-guide"
                  />
                  <path
                    v-if="galaxyMinimap.centerBearingArcPath"
                    :d="galaxyMinimap.centerBearingArcPath"
                    class="galaxy-center-bearing"
                  />
                  <circle
                    v-if="galaxyMinimap.centerBearingPoint"
                    :cx="galaxyMinimap.centerBearingPoint.x"
                    :cy="galaxyMinimap.centerBearingPoint.y"
                    r="2.8"
                    class="galaxy-center-bearing-dot"
                  />
                  <rect
                    v-for="tile in galaxyMinimap.tiles"
                    :key="tile.id"
                    :x="tile.px - galaxyMinimap.tileHalf"
                    :y="tile.py - galaxyMinimap.tileHalf"
                    :width="galaxyMinimap.tileSize"
                    :height="galaxyMinimap.tileSize"
                    rx="1"
                    ry="1"
                    :class="tile.cls"
                  />
                </svg>
                <div class="galaxy-position-legend">
                  <span class="position-region">📍 {{ galaxyMinimap.regionLabel }}</span>
                  <span v-if="galaxyMinimap.distanceLabel" class="position-dist">{{
                    galaxyMinimap.distanceLabel
                  }}</span>
                  <span v-if="galaxyMinimap.coordLabel" class="position-coord"
                    >Grid {{ galaxyMinimap.coordLabel }}</span
                  >
                  <span v-if="galaxyMinimap.centerBearingLabel" class="position-bearing">
                    Center bearing {{ galaxyMinimap.centerBearingLabel }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section class="sector-pane">
          <div v-if="props.galaxyId && !hasSavedSectors && !generatedSector" class="context-hint">
            No saved sectors found for this galaxy yet. Generate your first sector to begin.
            <button class="btn btn-secondary" :disabled="isMappingSectors" @click="mapGalaxySectors">
              {{ isMappingSectors ? "Mapping..." : "Map Galaxy Sectors" }}
            </button>
          </div>

          <div v-if="generatedSector" class="sector-results">
            <div class="hex-grid-wrapper" :class="`hex-grid-wrapper--${gridSizeMode}`">
              <div class="hex-grid" :style="gridStyle">
                <div
                  v-for="hex in generatedSector.hexes"
                  :key="hex.coord"
                  class="hex-cell"
                  :class="{
                    occupied: hex.hasSystem,
                    'presence-only': hex.presenceOnly,
                    selected: hex.coord === selectedHex,
                  }"
                  @click="selectHex(hex)"
                  :title="
                    hex.presenceOnly
                      ? `${hex.coord} — stellar object detected (unsurveyed)`
                      : hex.hasSystem
                        ? `${hex.coord} — ${hex.starType}`
                        : hex.coord
                  "
                >
                  <div v-if="showHexCoords" class="hex-coord">{{ hex.coord }}</div>
                  <div v-if="hex.hasSystem && !hex.presenceOnly" class="hex-star" :class="hex.starClass">★</div>
                  <div v-if="hex.presenceOnly" class="hex-star hex-star--presence">◦</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import * as toastService from "../../utils/toast.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import * as galaxyApi from "../../api/galaxyApi.js";
import * as sectorApi from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability, pickCentralAnomalyType } from "../../utils/sectorGeneration.js";
import { generatePhonotacticName } from "../../utils/nameGenerator.js";
import { generateGalaxySectorLayout } from "../../utils/sectorLayoutGenerator.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";

const props = defineProps({ galaxyId: { type: String, default: null } });
const router = useRouter();
const route = useRoute();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const preferencesStore = usePreferencesStore();

// ── State ────────────────────────────────────────────────────────────────────
const scope = ref("sector");
const selectedSubsector = ref("A");
const subsectorName = ref("");
const selectedSectorId = ref("");
const sectorName = ref("");
const density = ref("average");
const generatedSector = ref(null);
const selectedHex = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");
const galaxyProfile = ref(null);
const occupancyRealism = ref(1);
const isMappingSectors = ref(false);
const gridSizeMode = ref("fit");
const isSpeakingSectorName = ref(false);
const generationMode = ref("");
// Subsector letters in 4x4 grid (A-P)
const SUBSECTOR_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
const supportsSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

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
    stopSectorNameSpeech();
    await initializeSectorSelection(galaxyId);
  },
  { immediate: true },
);

watch(
  () => generatedSector.value?.name,
  () => {
    stopSectorNameSpeech();
  },
);

watch(
  () => [route.query.sectorId, route.query.gridX, route.query.gridY, route.query.sectorName, route.query.from],
  async () => {
    if (!props.galaxyId) {
      return;
    }
    stopSectorNameSpeech();
    await initializeSectorSelection(props.galaxyId);
  },
);

// ── Computed ─────────────────────────────────────────────────────────────────
const densityLabel = computed(() => {
  const map = {
    core: "Core",
    dense: "Dense",
    average: "Average",
    scattered: "Scattered",
    void: "Void",
  };
  return map[density.value] ?? density.value;
});

const occupancyRealismLabel = computed(() => {
  const value = Number(generatedSector.value?.occupancyRealism ?? occupancyRealism.value ?? 1);
  const clamped = Math.min(2, Math.max(0, value));
  return `${Math.round(clamped * 100)}%`;
});
const densityTargetRangeLabel = computed(() => {
  const ranges = {
    core: "60-80%",
    dense: "40-60%",
    average: "20-40%",
    scattered: "10-20%",
    void: "1-5%",
  };
  return ranges[density.value] ?? "20-40%";
});
const rolledOccupancyLabel = computed(() => {
  const systemCount = Number(generatedSector.value?.systemCount ?? 0);
  const cols = Number(generatedSector.value?.gridCols ?? 0);
  const rows = Number(generatedSector.value?.gridRows ?? 0);
  const totalHexes = cols * rows;
  if (!totalHexes) {
    return "0%";
  }
  const percent = (systemCount / totalHexes) * 100;
  return `${percent.toFixed(1)}% (${systemCount.toLocaleString()} / ${totalHexes.toLocaleString()} hexes)`;
});
const occupancyRealismHelp = computed(() => {
  const value = Math.min(2, Math.max(0, Number(occupancyRealism.value ?? 1)));
  if (value < 1) {
    return `Below 100% thins the sector out. ${Math.round(value * 100)}% means each hex rolls at about ${Math.round(value * 100)}% of the selected density before local variation.`;
  }
  if (value > 1) {
    return `Above 100% packs more systems in. ${Math.round(value * 100)}% means each hex rolls at about ${Math.round(value * 100)}% of the selected density before local variation.`;
  }
  return "100% uses the selected density as-is. Local hex variation still applies based on galaxy morphology.";
});

const gridStyle = computed(() => {
  if (!generatedSector.value) return {};
  const cols = generatedSector.value.gridCols;
  const sizePresets = {
    fit: {
      columnSize: "minmax(0, 1fr)",
      gridWidth: "100%",
      coordFontSize: cols >= 24 ? "0.32rem" : cols >= 12 ? "0.44rem" : "0.52rem",
      starFontSize: cols >= 24 ? "0.7rem" : cols >= 12 ? "0.9rem" : "1rem",
    },
    comfortable: {
      columnSize: cols >= 24 ? "minmax(1.45rem, 1fr)" : "minmax(2rem, 1fr)",
      gridWidth: "max-content",
      coordFontSize: cols >= 24 ? "0.38rem" : cols >= 12 ? "0.48rem" : "0.55rem",
      starFontSize: cols >= 24 ? "0.8rem" : cols >= 12 ? "1rem" : "1.1rem",
    },
    large: {
      columnSize: cols >= 24 ? "minmax(1.85rem, 1fr)" : "minmax(2.4rem, 1fr)",
      gridWidth: "max-content",
      coordFontSize: cols >= 24 ? "0.42rem" : cols >= 12 ? "0.52rem" : "0.6rem",
      starFontSize: cols >= 24 ? "0.9rem" : cols >= 12 ? "1.1rem" : "1.2rem",
    },
  };
  const preset = sizePresets[gridSizeMode.value] ?? sizePresets.fit;
  return {
    gridTemplateColumns: `repeat(${cols}, ${preset.columnSize})`,
    width: preset.gridWidth,
    "--hex-coord-font-size": preset.coordFontSize,
    "--hex-star-font-size": preset.starFontSize,
  };
});
const showHexCoords = computed(() => {
  if (!generatedSector.value) return true;
  return !(gridSizeMode.value === "fit" && Number(generatedSector.value.gridCols ?? 0) >= 24);
});

const selectedHexData = computed(() => generatedSector.value?.hexes.find((h) => h.coord === selectedHex.value) ?? null);

const hasSystemsInGrid = computed(() => (generatedSector.value?.systemCount ?? 0) > 0);
const showSelectHexHint = computed(() => hasSystemsInGrid.value && !selectedHexData.value?.hasSystem);
const isAtlasEntry = computed(() => String(route.query.from || "").trim() === "atlas");
const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }
  if (String(route.query.from || "") === "atlas") {
    const atlasGalaxyId = String(route.query.atlasGalaxyId || props.galaxyId || "").trim();
    return atlasGalaxyId ? { name: "TravellerAtlas", query: { galaxyId: atlasGalaxyId } } : { name: "TravellerAtlas" };
  }
  return { name: "GalaxySurvey" };
});
const activeSectorRecord = computed(() => {
  if (!selectedSectorId.value) return null;
  return sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value) ?? null;
});
const activeSectorMetadata = computed(() => activeSectorRecord.value?.metadata ?? {});
const sectorPresenceCount = computed(() =>
  Array.isArray(activeSectorMetadata.value?.occupiedHexes) ? activeSectorMetadata.value.occupiedHexes.length : 0,
);
const sectorTypedHexCount = computed(() => {
  const hexStarTypes = activeSectorMetadata.value?.hexStarTypes;
  return hexStarTypes && typeof hexStarTypes === "object" ? Object.keys(hexStarTypes).length : 0;
});
const defaultGenerationMode = computed(() => {
  if (!activeSectorRecord.value && !generatedSector.value) {
    if (isAtlasEntry.value && getRequestedGridCoordinates()) {
      return "presence";
    }
    return "name-systems";
  }
  if (sectorPresenceCount.value <= 0) {
    return "name-presence";
  }
  if (sectorTypedHexCount.value < sectorPresenceCount.value) {
    return "name-systems";
  }
  return "name-systems";
});
const effectiveGenerationMode = computed(() => generationMode.value || defaultGenerationMode.value);
const generationModeOptions = computed(() => [
  { id: "name", label: "Name Only" },
  { id: "name-presence", label: "Name + Presence" },
  { id: "presence", label: "Presence Only" },
  { id: "name-systems", label: "Name + Systems" },
]);
const generationAction = computed(() => {
  const scopeLabel = scope.value === "subsector" ? "Subsector" : "Sector";
  if (effectiveGenerationMode.value === "name") {
    return {
      id: "name",
      label: "💾 Save Sector Name",
      description:
        "Create or update the sector record and name only. No system presence or stellar systems are rolled.",
    };
  }
  if (effectiveGenerationMode.value === "name-presence") {
    return {
      id: "name-presence",
      label: "⚡ Name + Presence",
      description:
        "Save the current sector name, then roll occupied hexes without generating full stellar system data.",
    };
  }
  if (effectiveGenerationMode.value === "presence") {
    return {
      id: "presence",
      label: "🗺 Presence Only",
      description: "Roll occupied hexes only. Full stellar system data is not generated.",
    };
  }
  if (sectorPresenceCount.value > 0 && sectorTypedHexCount.value < sectorPresenceCount.value) {
    return {
      id: "name-systems",
      label: "⭐ Name + Systems",
      description:
        "Preserve the current sector name and convert existing occupied hexes into fully typed stellar systems.",
    };
  }
  return {
    id: "name-systems",
    label: `⭐ Name + Systems`,
    description: `Generate a full ${scopeLabel.toLowerCase()} survey in one step, including occupied hexes and stellar system data.`,
  };
});

watch(
  defaultGenerationMode,
  (nextMode) => {
    if (!generationMode.value) {
      generationMode.value = nextMode;
    }
  },
  { immediate: true },
);

const canLoadSelectedSector = computed(() => Boolean(selectedSectorId.value) && !isLoading.value);

const canSaveSector = computed(() => {
  if (isLoading.value || !generatedSector.value?.hexes?.length) {
    return false;
  }

  return Boolean(selectedSectorId.value || generatedSector.value?.sectorId || props.galaxyId);
});

const canPersistSectorName = computed(() => {
  const currentBaseName = String(sectorName.value || "").trim();
  if (!currentBaseName) {
    return false;
  }

  if (!selectedSectorId.value) {
    return Boolean(props.galaxyId && getRequestedGridCoordinates());
  }

  const sector = sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value);
  if (!sector) {
    return false;
  }

  const currentDisplayName = buildGeneratedSectorName(currentBaseName);
  const persistedDisplayName = String(sector?.metadata?.displayName || sector.sectorId).trim();
  if (currentDisplayName !== persistedDisplayName) {
    return true;
  }

  if (scope.value === "subsector") {
    const currentSubsectorName = String(subsectorName.value || "").trim();
    const persistedSubsectorName = String(sector?.metadata?.subsectorName || "").trim();
    if (currentSubsectorName !== persistedSubsectorName) {
      return true;
    }
  }

  return false;
});

const sectorOptions = computed(() =>
  sectorStore.sectors.map((sector) => ({
    sectorId: sector.sectorId,
    label: buildSectorLabel(sector),
  })),
);

const hasSavedSectors = computed(() => sectorOptions.value.length > 0);

// ── Galaxy Position Minimap ──────────────────────────────────────────────────
const galaxyMinimap = computed(() => {
  if (!galaxyProfile.value) return null;

  // Derive grid radius using the same formula as sectorLayoutGenerator.js
  const bulgeRadius = Number(galaxyProfile.value?.morphology?.bulgeRadius) || 5000;
  const galaxyType = String(galaxyProfile.value?.type || "Spiral");
  const isElliptical = galaxyType === "Elliptical";
  const isSpiral = galaxyType.includes("Spiral");
  const xStretch = isElliptical ? 1.6 : isSpiral ? 1.3 : 1.0;
  const gridRadius = Math.min(14, Math.max(2, Math.round(bulgeRadius / 3600)));

  // Find current sector's grid position.
  const currentRecord = selectedSectorId.value
    ? sectorStore.sectors.find((s) => s.sectorId === selectedSectorId.value)
    : null;
  const hasGridCoords =
    currentRecord && Number.isFinite(currentRecord?.metadata?.gridX) && Number.isFinite(currentRecord?.metadata?.gridY);
  const currentGX = hasGridCoords ? Number(currentRecord.metadata.gridX) : null;
  const currentGY = hasGridCoords ? Number(currentRecord.metadata.gridY) : null;

  // Build a set of all sector grid positions for rendering tiles.
  const knownTileSet = new Map(); // key "gx,gy" → densityClass
  for (const s of sectorStore.sectors) {
    if (Number.isFinite(s?.metadata?.gridX) && Number.isFinite(s?.metadata?.gridY)) {
      const key = `${s.metadata.gridX},${s.metadata.gridY}`;
      knownTileSet.set(key, {
        densityClass: s.densityClass ?? 0,
        explored: !!(s.metadata?.hexPresenceGenerated || s.metadata?.systemCount > 0),
      });
    }
  }

  // SVG layout constants.
  const SVG_SIZE = 180;
  const PADDING = 12;
  const usable = SVG_SIZE - PADDING * 2;
  const step = usable / (gridRadius * 2 + 1); // pixels per grid cell
  const tileSize = Math.max(2, step * 0.82);
  const tileHalf = tileSize / 2;
  const centerPx = SVG_SIZE / 2;
  const centerPy = SVG_SIZE / 2;
  const ellipseRx = (gridRadius * xStretch * step) / xStretch + step * 0.4;
  const ellipseRy = gridRadius * step + step * 0.4;
  const centerGuideRadius = Math.max(12, Math.min(ellipseRx, ellipseRy) * 0.32);

  function gridToPx(gx, gy) {
    return {
      px: centerPx + gx * step,
      py: centerPy + gy * step,
    };
  }

  // Build tile list: use known sectors OR infer from layout boundary.
  const tiles = [];
  const isDwarf = galaxyType === "Dwarf";
  const isIrregular = galaxyType === "Irregular";
  const cutoffRatio = isDwarf ? 0.75 : isIrregular ? 0.85 : 0.92;

  for (let gx = -gridRadius; gx <= gridRadius; gx++) {
    for (let gy = -gridRadius; gy <= gridRadius; gy++) {
      const normDist = Math.sqrt((gx / xStretch) ** 2 + gy ** 2) / gridRadius;
      if (normDist > cutoffRatio + 0.08) continue;

      const key = `${gx},${gy}`;
      const known = knownTileSet.get(key);
      const isCurrent = gx === currentGX && gy === currentGY;
      const isCenter = gx === 0 && gy === 0;

      let cls = "minimap-tile";
      if (isCurrent) {
        cls += " minimap-current";
      } else if (isCenter) {
        cls += " minimap-center";
      } else if (known?.explored) {
        cls += " minimap-explored";
      } else if (known) {
        cls += " minimap-known";
      } else {
        cls += " minimap-unknown";
      }

      const { px, py } = gridToPx(gx, gy);
      tiles.push({ id: key, px, py, cls });
    }
  }

  // Region description based on normalised distance of the current sector.
  let regionLabel = "Unknown";
  let distanceLabel = null;
  let coordLabel = null;
  let centerBearingArcPath = null;
  let centerBearingPoint = null;
  let centerBearingLabel = null;

  if (currentGX !== null && currentGY !== null) {
    const normDist = Math.sqrt((currentGX / xStretch) ** 2 + currentGY ** 2) / gridRadius;
    if (normDist < 0.1) regionLabel = "Galactic Core";
    else if (normDist < 0.25) regionLabel = "Inner Bulge";
    else if (normDist < 0.5) regionLabel = "Inner Disk";
    else if (normDist < 0.75) regionLabel = "Outer Disk";
    else regionLabel = "Galactic Fringe";

    const sectorDist = Math.round(Math.sqrt(currentGX ** 2 + currentGY ** 2) * 10) / 10;
    distanceLabel =
      sectorDist === 0 ? "at galactic center" : `${sectorDist} sector${sectorDist !== 1 ? "s" : ""} from center`;
    coordLabel = `(${currentGX >= 0 ? "+" : ""}${currentGX}, ${currentGY >= 0 ? "+" : ""}${currentGY})`;

    if (sectorDist > 0) {
      const directionAngle = Math.atan2(-currentGY, -currentGX);
      const arcSpan = Math.PI / 4.5;
      centerBearingArcPath = buildArcPath(
        centerPx,
        centerPy,
        centerGuideRadius,
        directionAngle - arcSpan / 2,
        directionAngle + arcSpan / 2,
      );
      centerBearingPoint = polarPoint(centerPx, centerPy, centerGuideRadius, directionAngle);
      centerBearingLabel = describeBearing(-currentGX, -currentGY);
    } else {
      centerBearingLabel = "Center";
    }
  } else if (!hasGridCoords && currentRecord) {
    regionLabel = "Position unknown";
    distanceLabel = "No grid data — re-generate layout to map this sector";
  } else if (!selectedSectorId.value) {
    regionLabel = "No sector loaded";
  }

  return {
    svgSize: SVG_SIZE,
    centerPx,
    centerPy,
    ellipseRx,
    ellipseRy,
    centerGuideRadius,
    centerBearingArcPath,
    centerBearingPoint,
    centerBearingLabel,
    tileSize,
    tileHalf,
    step,
    tiles,
    regionLabel,
    distanceLabel,
    coordLabel,
  };
});

const loadingMessage = computed(() =>
  loadingMode.value === "load" ? "Loading sector systems..." : "Generating sector...",
);
const { overlayProps: sectorExportOverlayProps, exportJson: exportSectorArchive } = useArchiveTransfer({
  context: "sector",
  noun: "Sector",
  title: "Sector Export In Progress",
  barLabel: "Packaging sector archive for transfer",
  statusPrefix: "SEC",
  targetLabel: () => generatedSector.value?.name || generatedSector.value?.sectorId || "Archive target pending",
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const DENSITY_RATES = { core: 0.7, dense: 0.5, average: 0.3, scattered: 0.15, void: 0.03 };
// The morphology function models a full galaxy cross-section across the grid.
// A sector is a tiny slice, so cap its positional influence to local variation only.
// At 0.15 every density tier lands within its labeled occupancy range (±15% of base rate).
const SECTOR_MORPHOLOGY_SCALE = 0.15;
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

function polarPoint(cx, cy, radius, angleRadians) {
  return {
    x: cx + Math.cos(angleRadians) * radius,
    y: cy + Math.sin(angleRadians) * radius,
  };
}

function buildArcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const delta = (((endAngle - startAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const largeArcFlag = delta > Math.PI ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function describeBearing(dx, dyNorth) {
  if (!Number.isFinite(dx) || !Number.isFinite(dyNorth) || (dx === 0 && dyNorth === 0)) {
    return null;
  }
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const angle = (Math.atan2(dx, dyNorth) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  return directions[Math.round(normalized / 45) % directions.length];
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
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
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

function createSectorId(name, coordinates = null) {
  if (props.galaxyId && Number.isFinite(coordinates?.x) && Number.isFinite(coordinates?.y)) {
    return `${props.galaxyId}:${Math.trunc(coordinates.x)},${Math.trunc(coordinates.y)}`;
  }

  const token = sanitizeId(name) || "sector";
  return `sec_${token}_${Date.now()}`.slice(0, 50);
}

function generateRandomSectorBaseName() {
  const mode = preferencesStore.sectorNameMode;
  return mode === "list"
    ? SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)]
    : generatePhonotacticName({ style: mode, syllablesMin: 2, syllablesMax: 3 });
}

function buildGeneratedSectorName(baseName) {
  const safeBaseName = String(baseName || "").trim();
  if (scope.value !== "subsector") {
    return safeBaseName;
  }

  const safeLetter = String(selectedSubsector.value || "A")
    .charAt(0)
    .toUpperCase();
  const safeSubsectorName = String(subsectorName.value || "").trim();
  if (!safeSubsectorName) {
    return `${safeBaseName} / ${safeLetter}`;
  }

  return `${safeBaseName} / ${safeLetter} - ${safeSubsectorName}`;
}

function getRequestedGridCoordinates() {
  const gridX = Number(route.query.gridX);
  const gridY = Number(route.query.gridY);
  if (!Number.isFinite(gridX) || !Number.isFinite(gridY)) {
    return null;
  }

  return {
    x: Math.trunc(gridX),
    y: Math.trunc(gridY),
  };
}

function initializeAtlasRequestedSector() {
  const requestedGrid = getRequestedGridCoordinates();
  if (!requestedGrid) {
    return false;
  }

  scope.value = "sector";
  selectedSectorId.value = "";
  generatedSector.value = null;
  selectedHex.value = null;
  selectedSubsector.value = "A";
  subsectorName.value = "";

  const requestedSectorName = String(route.query.sectorName || "").trim();
  if (requestedSectorName) {
    sectorName.value = requestedSectorName;
  } else if (!String(sectorName.value || "").trim()) {
    randomizeSectorName();
  }

  return true;
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

function getCurrentScopeDimensions() {
  return {
    cols: scope.value === "sector" ? 32 : 8,
    rows: scope.value === "sector" ? 40 : 10,
  };
}

function getSelectedSectorContext() {
  const selectedSectorRecord =
    (selectedSectorId.value ? sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value) : null) ||
    null;
  const selectedMetadata = selectedSectorRecord?.metadata ?? generatedSector.value?.metadata ?? null;
  const selectedGX = Number(selectedMetadata?.gridX);
  const selectedGY = Number(selectedMetadata?.gridY);
  const { cols, rows } = getCurrentScopeDimensions();
  const isGalacticCenterSector =
    scope.value === "sector" &&
    (String(route.query.galacticCenter || "") === "1" ||
      selectedMetadata?.isGalacticCenterSector === true ||
      (Number.isFinite(selectedGX) && Number.isFinite(selectedGY) && selectedGX === 0 && selectedGY === 0));
  const centerCol = Math.ceil(cols / 2);
  const centerRow = Math.ceil(rows / 2);
  const centerCoord = hexCoord(centerCol, centerRow);
  const galaxyAnomalyType = String(galaxyProfile.value?.morphology?.centralAnomaly?.type || "").trim();
  const centerAnomalyType = isGalacticCenterSector ? galaxyAnomalyType || pickCentralAnomalyType() : null;

  return {
    cols,
    rows,
    selectedSectorRecord,
    selectedMetadata,
    isGalacticCenterSector,
    centerCoord,
    centerAnomalyType,
  };
}

function buildSharedSectorMetadata({ hexes, systemCount, isGalacticCenterSector, preserveLastGeneratedAt = false }) {
  const existingMetadata = activeSectorRecord.value?.metadata ?? {};
  const typedHexCount = hexes.filter((h) => h.hasSystem && h.starType).length;
  const nextMetadata = {
    ...existingMetadata,
    lastModified: new Date().toISOString(),
    systemCount,
    explorationStatus: systemCount <= 0 ? "unexplored" : typedHexCount >= systemCount ? "surveyed" : "mapped",
    displayName: buildGeneratedSectorName(sectorName.value || String(existingMetadata?.displayName || "").trim()),
    scope: scope.value,
    gridCols: hexes.length ? (scope.value === "sector" ? 32 : 8) : existingMetadata.gridCols,
    gridRows: hexes.length ? (scope.value === "sector" ? 40 : 10) : existingMetadata.gridRows,
    subsector: scope.value === "subsector" ? selectedSubsector.value : null,
    subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
    isGalacticCenterSector,
    occupancyRealism: occupancyRealism.value,
    occupiedHexes: hexes.filter((h) => h.hasSystem).map((h) => h.coord),
    hexStarTypes: Object.fromEntries(
      hexes
        .filter((h) => h.hasSystem && h.starType)
        .map((h) => [
          h.coord,
          {
            starType: h.starType,
            starClass: h.starClass,
            secondaryStars: h.secondaryStars ?? [],
            anomalyType: h.anomalyType ?? null,
          },
        ]),
    ),
    hexPresenceGenerated: true,
  };

  if (!preserveLastGeneratedAt || !existingMetadata.hexPresenceGeneratedAt) {
    nextMetadata.hexPresenceGeneratedAt = new Date().toISOString();
  }

  return nextMetadata;
}

function buildSectorPreviewState({ sectorId, name, cols, rows, hexes }) {
  return {
    sectorId,
    name,
    scope: scope.value,
    density: density.value,
    occupancyRealism: occupancyRealism.value,
    gridCols: cols,
    gridRows: rows,
    hexes,
    systemCount: hexes.filter((hex) => hex.hasSystem).length,
    emptyCount: cols * rows - hexes.filter((hex) => hex.hasSystem).length,
    presenceOnlyCount: hexes.filter((hex) => hex.presenceOnly).length,
  };
}

async function ensureCurrentSectorRecord({ showToast = false } = {}) {
  if (activeSectorRecord.value) {
    return activeSectorRecord.value;
  }

  if (!props.galaxyId) {
    return null;
  }

  const requestedGrid = getRequestedGridCoordinates();
  if (!requestedGrid) {
    return null;
  }

  const { cols, rows, isGalacticCenterSector } = getSelectedSectorContext();
  const baseName = String(sectorName.value || "").trim() || generateRandomSectorBaseName();
  sectorName.value = baseName;
  const displayName = buildGeneratedSectorName(baseName);
  const nowIso = new Date().toISOString();
  const payload = {
    sectorId: createSectorId(displayName, requestedGrid),
    galaxyId: props.galaxyId,
    coordinates: {
      x: requestedGrid.x,
      y: requestedGrid.y,
    },
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
    metadata: {
      createdAt: nowIso,
      lastModified: nowIso,
      displayName,
      explorationStatus: "unexplored",
      scope: scope.value,
      gridCols: cols,
      gridRows: rows,
      subsector: scope.value === "subsector" ? selectedSubsector.value : null,
      subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
      isGalacticCenterSector,
      occupancyRealism: occupancyRealism.value,
      occupiedHexes: [],
      hexStarTypes: {},
      hexPresenceGenerated: false,
      gridX: requestedGrid.x,
      gridY: requestedGrid.y,
      notes:
        scope.value === "subsector"
          ? `Generated subsector ${selectedSubsector.value}${subsectorName.value ? ` (${String(subsectorName.value).trim()})` : ""}`
          : "Generated sector",
    },
  };

  const persisted = await sectorStore.createSector(payload);
  selectedSectorId.value = persisted.sectorId;
  sectorStore.setCurrentSector(persisted.sectorId);
  await loadPersistedSector(persisted.sectorId, false);

  if (showToast) {
    toastService.success(`Sector name saved for ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
  }

  return persisted;
}

async function generateSectorNameOnly() {
  if (selectedSectorId.value) {
    await persistSectorName({ showToast: true });
    return;
  }

  try {
    const persisted = await ensureCurrentSectorRecord({ showToast: false });
    if (!persisted) {
      toastService.error("No Atlas sector coordinates are available to save this sector name yet.");
      return;
    }
    toastService.success(`Sector name saved for ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
  } catch (err) {
    toastService.error(`Failed to save sector name: ${err.message}`);
  }
}

async function generateSectorPresence() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  let currentSector = activeSectorRecord.value;
  if (!currentSector) {
    try {
      currentSector = await ensureCurrentSectorRecord();
    } catch (err) {
      toastService.error(`Failed to prepare sector for presence generation: ${err.message}`);
      return;
    }
  }

  if (!currentSector) {
    toastService.error("No Atlas sector coordinates are available to generate system presence.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { cols, rows, isGalacticCenterSector, centerCoord, centerAnomalyType } = getSelectedSectorContext();
    const rate = DENSITY_RATES[density.value] ?? 0.3;
    const hexes = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);
        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const occupancyRate = calculateHexOccupancyProbability({
          baseRate: rate,
          col: c,
          row: r,
          cols,
          rows,
          galaxyType: galaxyProfile.value?.type,
          morphology: galaxyProfile.value?.morphology,
          realismScale: occupancyRealism.value,
          morphologyScale: SECTOR_MORPHOLOGY_SCALE,
        });

        if (isCenterHex) {
          hexes.push({
            coord,
            hasSystem: true,
            presenceOnly: false,
            starType: centerAnomalyType,
            starClass: "anomaly-core",
            secondaryStars: [],
            anomalyType: centerAnomalyType,
          });
          continue;
        }

        if (Math.random() < occupancyRate) {
          hexes.push({ coord, hasSystem: true, presenceOnly: true });
        } else {
          hexes.push({ coord, hasSystem: false });
        }
      }
    }

    const nextMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount: hexes.filter((hex) => hex.hasSystem).length,
      isGalacticCenterSector,
    });

    await sectorStore.updateSector(currentSector.sectorId, {
      ...currentSector,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +(rate * 100).toFixed(2),
      metadata: nextMetadata,
    });

    generatedSector.value = buildSectorPreviewState({
      sectorId: currentSector.sectorId,
      name: String(nextMetadata.displayName || currentSector.sectorId),
      cols,
      rows,
      hexes,
    });
    selectedHex.value = null;
    toastService.success(
      `System presence generated — ${nextMetadata.occupiedHexes.length.toLocaleString()} occupied hex${nextMetadata.occupiedHexes.length !== 1 ? "es" : ""} detected.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate system presence: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function generateSystemsFromPresence() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  const currentSector = activeSectorRecord.value;
  const occupiedHexes = Array.isArray(activeSectorMetadata.value?.occupiedHexes)
    ? [...activeSectorMetadata.value.occupiedHexes]
    : [];
  if (!currentSector || !occupiedHexes.length) {
    await generateSector();
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { cols, rows, isGalacticCenterSector, centerCoord, centerAnomalyType } = getSelectedSectorContext();
    const occupiedSet = new Set(occupiedHexes);
    const existingTypes = activeSectorMetadata.value?.hexStarTypes ?? {};
    const hexes = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);
        if (!occupiedSet.has(coord)) {
          hexes.push({ coord, hasSystem: false });
          continue;
        }

        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const saved = existingTypes[coord];
        if (isCenterHex) {
          hexes.push({
            coord,
            hasSystem: true,
            presenceOnly: false,
            starType: centerAnomalyType,
            starClass: "anomaly-core",
            secondaryStars: [],
            anomalyType: centerAnomalyType,
          });
          continue;
        }

        const primary = generatePrimaryStar();
        hexes.push({
          coord,
          hasSystem: true,
          presenceOnly: false,
          starType: String(saved?.starType || primary.designation),
          starClass: String(
            saved?.starClass || spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass),
          ),
          secondaryStars: Array.isArray(saved?.secondaryStars)
            ? [...saved.secondaryStars]
            : hasSecondary()
              ? [generatePrimaryStar().designation]
              : [],
          anomalyType: saved?.anomalyType ?? null,
        });
      }
    }

    const nextMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount: occupiedHexes.length,
      isGalacticCenterSector,
      preserveLastGeneratedAt: true,
    });

    await sectorStore.updateSector(currentSector.sectorId, {
      ...currentSector,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
      metadata: nextMetadata,
    });

    generatedSector.value = buildSectorPreviewState({
      sectorId: currentSector.sectorId,
      name: String(nextMetadata.displayName || currentSector.sectorId),
      cols,
      rows,
      hexes,
    });
    selectedHex.value = null;
    toastService.success(
      `Systems generated — ${occupiedHexes.length.toLocaleString()} occupied hex${occupiedHexes.length !== 1 ? "es" : ""} converted into full stellar systems.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate systems: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function runSurveyAction() {
  if (effectiveGenerationMode.value === "name") {
    await generateSectorNameOnly();
    return;
  }
  if (effectiveGenerationMode.value === "name-presence") {
    await generateSectorPresence();
    return;
  }
  if (effectiveGenerationMode.value === "presence") {
    await generateSectorPresence();
    return;
  }
  if (sectorPresenceCount.value > 0 && sectorTypedHexCount.value < sectorPresenceCount.value) {
    await generateSystemsFromPresence();
    return;
  }

  await generateSector();
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function loadSelectedSector() {
  if (!selectedSectorId.value) {
    return;
  }
  generationMode.value = "";
  await loadPersistedSector(selectedSectorId.value, true);
}

async function saveCurrentSector({ showToast = false } = {}) {
  if (!props.galaxyId || !generatedSector.value?.hexes?.length) {
    return;
  }

  const existingSectorId = selectedSectorId.value || generatedSector.value?.sectorId || "";
  const existingSector = existingSectorId
    ? (sectorStore.sectors.find((entry) => entry.sectorId === existingSectorId) ?? null)
    : null;
  const requestedGrid = getRequestedGridCoordinates();
  const systemCount = generatedSector.value.hexes.filter((hex) => hex.hasSystem).length;
  const { isGalacticCenterSector } = getSelectedSectorContext();
  const nextMetadata = buildSharedSectorMetadata({
    hexes: generatedSector.value.hexes,
    systemCount,
    isGalacticCenterSector,
    preserveLastGeneratedAt: true,
  });

  const payload = {
    ...(existingSector ?? {}),
    sectorId: existingSectorId || createSectorId(buildGeneratedSectorName(sectorName.value || "sector"), requestedGrid),
    galaxyId: props.galaxyId,
    coordinates: {
      x: Number(existingSector?.coordinates?.x ?? existingSector?.metadata?.gridX ?? requestedGrid?.x ?? 0),
      y: Number(existingSector?.coordinates?.y ?? existingSector?.metadata?.gridY ?? requestedGrid?.y ?? 0),
    },
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: Number(existingSector?.densityVariation ?? 0),
    metadata: {
      ...(existingSector?.metadata ?? {}),
      ...(requestedGrid ? { gridX: requestedGrid.x, gridY: requestedGrid.y } : {}),
      ...nextMetadata,
      createdAt: existingSector?.metadata?.createdAt ?? new Date().toISOString(),
    },
  };

  try {
    const persisted = existingSector
      ? await sectorStore.updateSector(existingSector.sectorId, payload)
      : await sectorStore.createSector(payload);

    selectedSectorId.value = persisted.sectorId;
    sectorStore.setCurrentSector(persisted.sectorId);
    generatedSector.value = {
      ...generatedSector.value,
      sectorId: persisted.sectorId,
      name: String(persisted?.metadata?.displayName || generatedSector.value.name),
      density: density.value,
      occupancyRealism: occupancyRealism.value,
      systemCount,
      emptyCount: generatedSector.value.gridCols * generatedSector.value.gridRows - systemCount,
    };

    if (showToast) {
      toastService.success(`Saved sector ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
    }
  } catch (err) {
    toastService.error(`Failed to save sector: ${err.message}`);
  }
}

async function loadPersistedSector(sectorId, showToast = false) {
  if (!props.galaxyId || !sectorId) {
    return;
  }

  selectedSectorId.value = sectorId;

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    await systemStore.loadSystems(props.galaxyId, sectorId);
    let sector = null;

    try {
      sector = await sectorApi.getSector(sectorId);
    } catch {
      sector = sectorStore.sectors.find((entry) => entry.sectorId === sectorId) ?? null;
    }

    if (!sector) {
      toastService.error("Selected sector could not be found.");
      return;
    }

    const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === sector.sectorId);
    if (sectorIndex >= 0) {
      sectorStore.sectors[sectorIndex] = sector;
    } else {
      sectorStore.sectors.unshift(sector);
    }

    const { scope: loadedScope, cols, rows } = inferGridDimensions(sector);
    const { hexes: baseHexes, systemCount: surveyedCount } = buildHexGridFromSystems(systemStore.systems, cols, rows);

    // Merge in any presence-only markers from a previous "Generate All Sectors" pass.
    // These hexes have a stellar object recorded but no full system record yet.
    // If hexStarTypes has a starType for the coord the hex has been surveyed to star-type level
    // (★); otherwise it is a raw presence marker only (◦).
    const hexStarTypes = sector?.metadata?.hexStarTypes ?? {};
    const presenceCoords = new Set([
      ...(Array.isArray(sector?.metadata?.occupiedHexes) ? sector.metadata.occupiedHexes : []),
      ...Object.keys(hexStarTypes),
    ]);
    const hexes = baseHexes.map((hex) => {
      const saved = hexStarTypes[hex.coord];
      if (!saved && !presenceCoords.has(hex.coord)) {
        return hex;
      }

      const starType = saved?.starType ?? hex.starType;
      return {
        ...hex,
        hasSystem: true,
        // presenceOnly only remains true when there is no star type yet (raw presence marker).
        // Once a star type is known the hex graduates to a full ★ display.
        presenceOnly: !starType,
        starType,
        starClass: saved?.starClass || hex.starClass || spectralClassToCssClass(starType),
        secondaryStars: saved?.secondaryStars ?? hex.secondaryStars ?? [],
        anomalyType: saved?.anomalyType ?? hex.anomalyType ?? null,
      };
    });
    const systemCount = hexes.filter((h) => h.hasSystem).length;

    scope.value = loadedScope;
    density.value = densityFromClass(sector.densityClass);
    occupancyRealism.value = Math.min(2, Math.max(0, Number(sector?.metadata?.occupancyRealism ?? 1)));
    selectedSubsector.value =
      String(sector?.metadata?.subsector || "A")
        .charAt(0)
        .toUpperCase() || "A";
    const loadedDisplayName = String(sector?.metadata?.displayName || sectorId);
    const metadataSubsectorName = String(sector?.metadata?.subsectorName || "").trim();
    if (loadedScope === "subsector") {
      if (metadataSubsectorName) {
        subsectorName.value = metadataSubsectorName;
      } else {
        const legacyNameMatch = loadedDisplayName.match(/\/\s*[A-P](?:\s*[-:]\s*(.+))?$/i);
        subsectorName.value = String(legacyNameMatch?.[1] || "").trim();
      }
      sectorName.value = loadedDisplayName.replace(/\s*\/\s*[A-P](?:\s*[-:].*)?$/i, "").trim() || loadedDisplayName;
    } else {
      subsectorName.value = "";
      sectorName.value = loadedDisplayName;
    }
    selectedHex.value = null;

    generatedSector.value = {
      sectorId: sector.sectorId,
      name: sectorName.value,
      scope: loadedScope,
      density: density.value,
      occupancyRealism: occupancyRealism.value,
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

async function persistSectorName({ showToast = false } = {}) {
  if (!props.galaxyId) {
    return;
  }

  if (!selectedSectorId.value) {
    try {
      const persisted = await ensureCurrentSectorRecord({ showToast });
      if (!persisted && showToast) {
        toastService.error("No Atlas sector coordinates are available to save this sector name yet.");
      }
    } catch (err) {
      toastService.error(`Failed to save sector name: ${err.message}`);
    }
    return;
  }

  const sector = sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value);
  if (!sector) {
    return;
  }

  const baseName = String(sectorName.value || "").trim();
  if (!baseName) {
    if (showToast) {
      toastService.error("Sector name cannot be empty.");
    }
    return;
  }

  const nextDisplayName = buildGeneratedSectorName(baseName);
  const nextSubsectorName = scope.value === "subsector" ? String(subsectorName.value || "").trim() : null;
  const persistedDisplayName = String(sector?.metadata?.displayName || sector.sectorId).trim();
  const persistedSubsectorName = String(sector?.metadata?.subsectorName || "").trim();

  const isSameDisplayName = nextDisplayName === persistedDisplayName;
  const isSameSubsectorName = scope.value !== "subsector" || nextSubsectorName === persistedSubsectorName;
  if (isSameDisplayName && isSameSubsectorName) {
    return;
  }

  const updatePayload = {
    ...sector,
    metadata: {
      ...(sector.metadata ?? {}),
      displayName: nextDisplayName,
      subsectorName: nextSubsectorName,
      lastModified: new Date().toISOString(),
    },
  };

  try {
    const updatedSector = await sectorStore.updateSector(sector.sectorId, updatePayload);

    if (generatedSector.value?.sectorId === updatedSector.sectorId) {
      generatedSector.value = {
        ...generatedSector.value,
        name: nextDisplayName,
      };
    }

    if (scope.value === "subsector") {
      sectorName.value = nextDisplayName.replace(/\s*\/\s*[A-P](?:\s*[-:].*)?$/i, "").trim() || baseName;
      subsectorName.value = nextSubsectorName || "";
    } else {
      sectorName.value = nextDisplayName;
    }

    if (showToast) {
      toastService.success("Sector name saved.");
    }
  } catch (err) {
    toastService.error(`Failed to save sector name: ${err.message}`);
  }
}

async function initializeSectorSelection(galaxyId) {
  generatedSector.value = null;
  selectedHex.value = null;
  selectedSectorId.value = "";
  generationMode.value = "";

  if (!galaxyId) {
    galaxyProfile.value = null;
    sectorStore.clearSectors();
    systemStore.clearSystems();
    return;
  }

  try {
    galaxyProfile.value = await galaxyApi.getGalaxy(galaxyId);
  } catch {
    galaxyProfile.value = null;
  }

  if (!galaxyProfile.value) {
    sectorStore.clearSectors();
    systemStore.clearSystems();
    return;
  }

  await sectorStore.loadSectors(galaxyId);

  if (sectorStore.error) {
    toastService.error(`Failed to load sectors: ${sectorStore.error}`);
    return;
  }

  const currentSector = sectorStore.sectors.find((sector) => sector.sectorId === sectorStore.currentSectorId);
  const fallbackSector = sectorStore.sectors[0];
  const requestedSectorId = String(route.query.sectorId || "").trim();
  const requestedGrid = getRequestedGridCoordinates();
  const requestedSector = requestedSectorId
    ? sectorStore.sectors.find((sector) => sector.sectorId === requestedSectorId)
    : null;

  if (!requestedSector && requestedGrid) {
    const requestedByGrid = sectorStore.sectors.find(
      (sector) =>
        Number(sector?.metadata?.gridX) === requestedGrid.x && Number(sector?.metadata?.gridY) === requestedGrid.y,
    );
    if (requestedByGrid) {
      selectedSectorId.value = requestedByGrid.sectorId;
      await loadPersistedSector(requestedByGrid.sectorId, false);
    } else {
      initializeAtlasRequestedSector();
    }
    return;
  }

  const initialSector = requestedSector ?? currentSector ?? fallbackSector;

  if (initialSector) {
    selectedSectorId.value = initialSector.sectorId;
    await loadPersistedSector(initialSector.sectorId, false);
  } else {
    initializeAtlasRequestedSector();
  }
}

async function mapGalaxySectors() {
  if (!props.galaxyId || isMappingSectors.value) {
    return;
  }

  if (!galaxyProfile.value) {
    toastService.error("Galaxy details are still loading. Please try again.");
    return;
  }

  isMappingSectors.value = true;
  try {
    const sectors = generateGalaxySectorLayout(galaxyProfile.value, { scale: "true" });
    if (!sectors.length) {
      toastService.warning("No sectors were generated for this galaxy layout.");
      return;
    }

    const chunkSize = 1000;
    for (let i = 0; i < sectors.length; i += chunkSize) {
      await sectorApi.createSectorsBatch(sectors.slice(i, i + chunkSize));
    }

    await sectorStore.loadSectors(props.galaxyId);
    if (sectorStore.sectors.length > 0) {
      const initialSectorId = sectorStore.sectors[0].sectorId;
      selectedSectorId.value = initialSectorId;
      await loadPersistedSector(initialSectorId, false);
    }

    toastService.success(`Mapped ${sectors.length.toLocaleString()} sectors for this galaxy.`);
  } catch (err) {
    toastService.error(`Failed to map sectors: ${err.message}`);
  } finally {
    isMappingSectors.value = false;
  }
}

function randomizeSectorName() {
  const randomName = generateRandomSectorBaseName();

  if (scope.value === "subsector") {
    subsectorName.value = randomName;
    return;
  }

  if (mode === "list") {
    sectorName.value = randomName;
  } else {
    sectorName.value = randomName;
  }
}

async function generateSector() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;
  const existingSectorId = generatedSector.value?.sectorId ?? null;

  try {
    // Use setTimeout to show loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cols = scope.value === "sector" ? 32 : 8;
    const rows = scope.value === "sector" ? 40 : 10;
    const rate = DENSITY_RATES[density.value] ?? 0.3;
    const selectedSectorRecord =
      (selectedSectorId.value
        ? sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value)
        : null) || null;
    const selectedMetadata = selectedSectorRecord?.metadata ?? generatedSector.value?.metadata ?? null;
    const selectedGX = Number(selectedMetadata?.gridX);
    const selectedGY = Number(selectedMetadata?.gridY);
    const isGalacticCenterSector =
      scope.value === "sector" &&
      (String(route.query.galacticCenter || "") === "1" ||
        selectedMetadata?.isGalacticCenterSector === true ||
        (Number.isFinite(selectedGX) && Number.isFinite(selectedGY) && selectedGX === 0 && selectedGY === 0));
    const centerCol = Math.ceil(cols / 2);
    const centerRow = Math.ceil(rows / 2);
    const centerCoord = hexCoord(centerCol, centerRow);
    const galaxyAnomalyType = String(galaxyProfile.value?.morphology?.centralAnomaly?.type || "").trim();
    const centerAnomalyType = isGalacticCenterSector ? galaxyAnomalyType || pickCentralAnomalyType() : null;

    const hexes = [];
    let systemCount = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);

        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const occupancyRate = calculateHexOccupancyProbability({
          baseRate: rate,
          col: c,
          row: r,
          cols,
          rows,
          galaxyType: galaxyProfile.value?.type,
          morphology: galaxyProfile.value?.morphology,
          realismScale: occupancyRealism.value,
          morphologyScale: SECTOR_MORPHOLOGY_SCALE,
        });
        const hasSystem = isCenterHex || Math.random() < occupancyRate;
        if (hasSystem) {
          const primary = isCenterHex ? null : generatePrimaryStar();
          const secondaryStars = isCenterHex ? [] : hasSecondary() ? [generatePrimaryStar().designation] : [];
          hexes.push({
            coord,
            hasSystem: true,
            starType: isCenterHex ? centerAnomalyType : primary.designation,
            starClass: isCenterHex
              ? "anomaly-core"
              : spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass),
            secondaryStars,
            anomalyType: isCenterHex ? centerAnomalyType : null,
          });
          systemCount++;
        } else {
          hexes.push({ coord, hasSystem: false });
        }
      }
    }

    const fallbackName = generateRandomSectorBaseName();
    const baseName = sectorName.value || fallbackName;
    const generatedName = buildGeneratedSectorName(baseName);

    const sharedMetadata = {
      lastModified: new Date().toISOString(),
      systemCount,
      displayName: generatedName,
      scope: scope.value,
      gridCols: cols,
      gridRows: rows,
      subsector: scope.value === "subsector" ? selectedSubsector.value : null,
      subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
      isGalacticCenterSector,
      occupancyRealism: occupancyRealism.value,
      occupiedHexes: hexes.filter((h) => h.hasSystem).map((h) => h.coord),
      hexStarTypes: Object.fromEntries(
        hexes
          .filter((h) => h.hasSystem)
          .map((h) => [
            h.coord,
            {
              starType: h.starType,
              starClass: h.starClass,
              secondaryStars: h.secondaryStars ?? [],
              anomalyType: h.anomalyType ?? null,
            },
          ]),
      ),
    };

    let finalSectorId;
    if (existingSectorId) {
      // Update the existing sector — do not create a new record.
      // Must spread the full existing sector first because the backend requires sectorId,
      // galaxyId and coordinates in the PUT body and rejects partial payloads.
      const currentSectorRecord = sectorStore.sectors.find((s) => s.sectorId === existingSectorId) ?? {};
      await sectorStore.updateSector(existingSectorId, {
        ...currentSectorRecord,
        densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
        densityVariation: +(rate * 100).toFixed(2),
        metadata: {
          ...(currentSectorRecord.metadata ?? {}),
          ...sharedMetadata,
        },
      });
      finalSectorId = existingSectorId;
    } else {
      const requestedGrid = getRequestedGridCoordinates();
      const sectorPayload = {
        sectorId: createSectorId(generatedName, requestedGrid),
        galaxyId: props.galaxyId,
        coordinates: {
          x: requestedGrid?.x ?? Math.floor(Math.random() * 1001),
          y: requestedGrid?.y ?? Math.floor(Math.random() * 1001),
        },
        densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
        densityVariation: +(rate * 100).toFixed(2),
        metadata: {
          createdAt: new Date().toISOString(),
          explorationStatus: "unexplored",
          gridX: requestedGrid?.x ?? null,
          gridY: requestedGrid?.y ?? null,
          notes:
            scope.value === "subsector"
              ? `Generated subsector ${selectedSubsector.value}${subsectorName.value ? ` (${String(subsectorName.value).trim()})` : ""}`
              : "Generated sector",
          ...sharedMetadata,
        },
      };
      const persistedSector = await sectorStore.createSector(sectorPayload);
      finalSectorId = persistedSector.sectorId;
      selectedSectorId.value = finalSectorId;
    }

    generatedSector.value = {
      sectorId: finalSectorId,
      name: generatedName,
      scope: scope.value,
      density: density.value,
      occupancyRealism: occupancyRealism.value,
      gridCols: cols,
      gridRows: rows,
      hexes,
      systemCount,
      emptyCount: cols * rows - systemCount,
      presenceOnlyCount: hexes.filter((h) => h.presenceOnly).length,
    };
    selectedHex.value = null;

    if (existingSectorId) {
      toastService.success(
        `Sector regenerated — ${systemCount.toLocaleString()} stellar object${systemCount !== 1 ? "s" : ""} rolled.`,
      );
    } else {
      toastService.success(`Sector "${generatedName}" generated and saved.`);
    }
  } catch (err) {
    toastService.error(`Failed to generate/save sector: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function selectHex(hex) {
  selectedHex.value = hex.coord === selectedHex.value ? null : hex.coord;
}

function stopSectorNameSpeech() {
  if (!supportsSpeechSynthesis) return;
  window.speechSynthesis.cancel();
  isSpeakingSectorName.value = false;
}

function toggleSectorNameSpeech() {
  if (!supportsSpeechSynthesis) {
    toastService.error("Text to speech is not supported in this browser.");
    return;
  }

  if (isSpeakingSectorName.value) {
    stopSectorNameSpeech();
    return;
  }

  const sectorDisplayName = String(sectorName.value || generatedSector.value?.name || "").trim();
  if (!sectorDisplayName) {
    toastService.error("No sector name is available to speak yet.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(sectorDisplayName);
  utterance.rate = Math.min(1.5, Math.max(0.5, Number(preferencesStore.ttsRate) || 1));
  utterance.pitch = Math.min(1.5, Math.max(0.5, Number(preferencesStore.ttsPitch) || 1));
  const preferredVoiceURI = String(preferencesStore.ttsVoiceURI || "").trim();
  if (preferredVoiceURI) {
    const voice = window.speechSynthesis.getVoices().find((entry) => entry.voiceURI === preferredVoiceURI);
    if (voice) {
      utterance.voice = voice;
    }
  }
  utterance.onend = () => {
    isSpeakingSectorName.value = false;
  };
  utterance.onerror = () => {
    isSpeakingSectorName.value = false;
    toastService.error("Unable to play sector name audio.");
  };
  isSpeakingSectorName.value = true;
  window.speechSynthesis.speak(utterance);
}

function regenerateSector() {
  runSurveyAction();
}

async function exportSector() {
  if (!generatedSector.value) return;

  try {
    await exportSectorArchive({
      data: generatedSector,
      filename: (sector) => `${sector.name.replace(/\s+/g, "-")}-Sector.json`,
      serializeMessage: "Serializing sector manifest...",
      encodeMessage: "Encoding sector archive for transfer...",
      readyMessage: "Sector archive staged for local transfer.",
      serializingProgress: 22,
      encodingProgress: 68,
    });
  } catch (err) {
    toastService.error(`Failed to export sector: ${err.message}`);
  }
}

function proceedToStarSystem() {
  if (!generatedSector.value?.sectorId) {
    toastService.error("Sector has not been saved yet. Please generate sector again.");
    return;
  }

  const selectedAnomalyType = String(
    selectedHexData.value?.anomalyType || selectedHexData.value?.starType || "",
  ).trim();
  const galaxyAnomaly = galaxyProfile.value?.morphology?.centralAnomaly;
  const galaxyAnomalyType = String(galaxyAnomaly?.type || "").trim();
  const anomalyTypeMatchesGalaxy =
    selectedAnomalyType && galaxyAnomalyType && selectedAnomalyType.toLowerCase() === galaxyAnomalyType.toLowerCase();

  const query = {
    hex: selectedHex.value,
    star: selectedHexData.value?.starType,
    anomaly: selectedAnomalyType || undefined,
    anomalyMass: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.massSolarMasses : undefined,
    anomalyActivity: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.activityIndex : undefined,
    returnTo: serializeReturnRoute({
      name: "SectorSurvey",
      params: { galaxyId: props.galaxyId ?? "000" },
      query: {
        ...route.query,
        ...(generatedSector.value?.sectorId ? { sectorId: generatedSector.value.sectorId } : {}),
      },
    }),
  };

  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: props.galaxyId ?? "000", sectorId: generatedSector.value.sectorId },
    query,
  });
}
</script>

<style scoped>
.sector-survey {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  overflow: hidden;
}

.survey-content {
  flex: 1;
  padding: 1.25rem;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.survey-workspace {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) minmax(0, 3fr);
  gap: 1.25rem;
  align-items: stretch;
  min-height: 0;
  height: 100%;
}

.sector-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 7.5rem);
  max-height: calc(100vh - 7.5rem);
  overflow: hidden;
  position: sticky;
  top: 0.9rem;
  align-self: start;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 0.9rem;
  height: calc(100vh - 7.5rem);
  max-height: calc(100vh - 7.5rem);
  overflow-y: auto;
  padding-right: 0.2rem;
}

.control-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.1rem;
  background: #1a1a1a;
  border-radius: 0.75rem;
  border: 2px solid #00d9ff;
}

.control-card--survey {
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.sector-summary-card {
  background: #1a1a2e;
}

.control-inline-row {
  display: grid;
  align-items: center;
  gap: 0.5rem;
}

.control-inline-row--load {
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.control-inline-row--generation {
  grid-template-columns: minmax(0, 1fr) auto;
}

.control-inline-select {
  min-width: 0;
}

.sector-load-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}

.control-help {
  font-size: 0.78rem;
  line-height: 1.4;
  color: #8fb3c9;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.control-group--generation-options {
  border-top: 1px solid rgba(0, 217, 255, 0.12);
  padding-top: 0.75rem;
}

.control-group--generation-options .btn,
.control-inline-row--load .btn {
  white-space: nowrap;
}

/* Galaxy Position Minimap */
.galaxy-position-group {
  border-top: 1px solid rgba(0 217 255 / 0.15);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.galaxy-minimap-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.galaxy-minimap-svg {
  border-radius: 50%;
  background: #07071a;
  border: 1px solid rgba(0 217 255 / 0.2);
  display: block;
  overflow: visible;
}

/* SVG element classes (prefixed to avoid global conflicts) */
.galaxy-boundary {
  fill: none;
  stroke: rgba(0 217 255 / 0.18);
  stroke-width: 1;
}

.galaxy-crosshair {
  stroke: rgba(255 200 80 / 0.55);
  stroke-width: 1;
}

.galaxy-center-guide {
  fill: none;
  stroke: rgba(255 255 255 / 0.12);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.galaxy-center-bearing {
  fill: none;
  stroke: rgba(255 200 80 / 0.9);
  stroke-width: 3;
  stroke-linecap: round;
}

.galaxy-center-bearing-dot {
  fill: rgba(255 200 80 / 0.95);
  filter: drop-shadow(0 0 3px rgba(255, 200, 80, 0.65));
}

.minimap-unknown {
  fill: rgba(80 90 120 / 0.4);
}

.minimap-known {
  fill: rgba(0 140 200 / 0.5);
}

.minimap-explored {
  fill: rgba(0 200 160 / 0.65);
}

.minimap-center {
  fill: rgba(255 200 60 / 0.7);
}

.minimap-current {
  fill: #00d9ff;
  filter: drop-shadow(0 0 3px #00d9ff);
}

.galaxy-position-legend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  text-align: center;
}

.position-region {
  font-size: 0.85rem;
  font-weight: 700;
  color: #8fe9ff;
}

.position-dist {
  font-size: 0.78rem;
  color: #7a94b8;
}

.position-coord {
  font-size: 0.75rem;
  color: rgba(0 217 255 / 0.55);
  font-family: monospace;
}

.position-bearing {
  font-size: 0.75rem;
  color: rgba(255 200 80 / 0.86);
  font-weight: 600;
}

.sector-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.sector-summary--panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0;
}

.sector-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sector-summary-row--secondary {
  justify-content: space-between;
  align-items: flex-start;
}

.sector-summary-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sector-summary-group--left {
  justify-content: flex-start;
}

.sector-summary-group--right {
  justify-content: flex-end;
  margin-left: auto;
}

.summary-pill {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(0 217 255 / 0.24);
  border-radius: 999px;
  background: rgba(0 217 255 / 0.08);
  color: #b7f7ff;
  font-size: 0.8rem;
  font-family: "Circular Std", Circular, "Lineto Circular", "Segoe UI", sans-serif;
}

.summary-pill--title {
  min-width: 0;
  width: 100%;
  flex: 1 1 100%;
}

.summary-pill-label {
  color: rgba(183, 247, 255, 0.7);
  font-weight: 600;
  white-space: nowrap;
}

.summary-pill-value {
  color: #e7fbff;
  font-weight: 700;
}

.stellar-inline-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(0, 217, 255, 0.18);
  border-radius: 0.5rem;
  background: rgba(18, 18, 46, 0.88);
}

.stellar-inline-card--placeholder {
  border-style: dashed;
  border-color: rgba(0, 217, 255, 0.35);
}

.stellar-inline-copy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.75rem;
  min-width: 0;
  flex: 1 1 auto;
}

.stellar-inline-title {
  color: #00d9ff;
  font-weight: 700;
}

.stellar-inline-detail {
  color: #b7d8ea;
  font-family: monospace;
  font-size: 0.88rem;
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

.range-input {
  width: 100%;
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

.btn-icon {
  min-width: 2.5rem;
  padding: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

/* Hex Grid */
.hex-grid-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  flex: 1;
  max-height: none;
  border: 1px solid #333;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: #0d0d1a;
}

.hex-grid-wrapper--comfortable,
.hex-grid-wrapper--large {
  overflow-x: auto;
}

.hex-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  max-width: 100%;
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
  width: 100%;
  min-width: 0;
  aspect-ratio: 1;
  border: 1px solid #1e1e3a;
  border-radius: 0.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.08rem;
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
  font-size: var(--hex-coord-font-size, 0.55rem);
  color: #555;
  font-family: monospace;
  line-height: 1;
}

.hex-star {
  font-size: var(--hex-star-font-size, 1.1rem);
  line-height: 1;
}

.hex-star--presence {
  color: #666;
  opacity: 0.6;
  font-size: var(--hex-star-font-size, 1.1rem);
}

.hex-cell.presence-only {
  background: rgba(255, 255, 255, 0.03);
  border-color: #333;
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

.anomaly-core {
  color: #f7b1ff;
  text-shadow:
    0 0 6px rgba(247, 177, 255, 0.8),
    0 0 12px rgba(199, 113, 255, 0.7);
}

/* Hex detail panel */
.hex-detail {
  margin-top: 1.5rem;
  background: #12122e;
  border: 1px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.hex-detail--sidebar {
  margin-top: 0;
}

.hex-detail--placeholder {
  border-style: dashed;
  border-color: rgba(0, 217, 255, 0.35);
}

.hex-detail h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
}

.hex-detail p {
  margin: 0;
  color: #b7d8ea;
  line-height: 1.45;
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
  margin-top: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .survey-workspace {
    grid-template-columns: minmax(16rem, 1fr) minmax(0, 2.35fr);
  }

  .control-inline-row--load,
  .control-inline-row--generation {
    grid-template-columns: 1fr;
  }

  .stellar-inline-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .sector-summary-row {
    flex-direction: column;
  }

  .sector-summary-group,
  .sector-summary-group--right {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .detail-actions {
    margin-top: 0;
    width: 100%;
  }

  .detail-actions .btn {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .sector-survey {
    overflow: visible;
    height: auto;
  }

  .survey-content {
    padding: 1rem;
    overflow: visible;
    height: auto;
  }

  .survey-workspace {
    grid-template-columns: 1fr;
    height: auto;
  }

  .control-panel {
    position: static;
    height: auto;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }

  .control-help {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .sector-pane,
  .sector-results {
    min-height: auto;
  }

  .sector-pane {
    position: static;
    top: auto;
    height: auto;
    max-height: none;
  }

  .hex-grid-wrapper {
    max-height: none;
    flex: none;
  }
}
</style>
