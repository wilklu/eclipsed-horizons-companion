<template>
  <div class="star-system-builder">
    <LoadingSpinner v-bind="systemExportOverlayProps" />
    <LoadingSpinner
      :isVisible="stellarLoadingState.active"
      context="stellar"
      :tone="stellarLoadingState.tone"
      :stateLabel="stellarLoadingState.stateLabel"
      :statusCode="stellarLoadingState.statusCode"
      :title="stellarLoadingState.title"
      :message="stellarLoadingState.message"
      :barLabel="stellarLoadingState.barLabel"
      :diagnostics="stellarLoadingState.diagnostics"
      :ledger="stellarLoadingState.ledger"
    />
    <SurveyNavigation currentClass="System Survey" :show-regenerate="false" :show-export="false" />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Hex Coordinate:</label>
          <input v-model="hexCoord" placeholder="e.g. 0803" class="text-input" />
        </div>
        <div class="control-group">
          <label>Primary Star Type:</label>
          <select v-model="primarySpectral" class="select-input">
            <option value="random">🎲 Random</option>
            <optgroup label="Stars">
              <option v-for="t in SPECTRAL_TYPES" :key="t.code" :value="t.code">{{ t.code }} — {{ t.label }}</option>
            </optgroup>
            <optgroup label="Anomalies">
              <option v-for="anomaly in ANOMALY_TYPES" :key="anomaly.code" :value="anomaly.code">
                {{ anomaly.label }}
              </option>
            </optgroup>
          </select>
        </div>
        <div class="control-group">
          <label>Multiple Star System:</label>
          <select v-model="multiplicity" class="select-input">
            <option value="single">Single Star</option>
            <option value="binary">Binary</option>
            <option value="trinary">Trinary</option>
            <option value="random">🎲 Random</option>
          </select>
        </div>
        <div class="control-group">
          <label>System Name:</label>
          <div class="system-name-row">
            <input
              v-model="systemName"
              placeholder="Generated automatically if blank"
              class="text-input"
              @change="persistSystemName"
              @blur="persistSystemName"
            />
            <button type="button" class="btn" @click="generateSystemName">🎲</button>
            <button type="button" class="btn" :disabled="!systemName || !isTtsSupported" @click="toggleSpeakSystemName">
              <span v-if="isSpeaking">🔈 Stop</span>
              <span v-else>🔊 Speak</span>
            </button>
          </div>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="buildSystem">⚡ Generate System</button>
          <button class="btn btn-primary" :disabled="!system" @click="generateWorlds">🪐 Generate Worlds</button>
          <div class="control-action-divider">
            <button class="btn btn-secondary" @click="exportSystem">📤 Export</button>
            <button class="btn btn-secondary" @click="triggerImport">📥 Import</button>
          </div>
          <input
            ref="importFileInput"
            type="file"
            accept=".json,application/json"
            class="import-file-hidden"
            @change="importSystem"
          />
          <router-link v-if="backRoute" :to="backRoute" class="btn btn-outline control-action-back">← Back</router-link>
        </div>
      </div>

      <!-- System Display -->
      <div v-if="system" class="system-display">
        <div class="system-header">
          <h2>{{ resolvedSystemDisplayName }}</h2>
          <span class="system-type-badge">{{ system.stars.length > 1 ? "Multiple" : "Single" }} Star</span>
          <button class="btn btn-secondary system-header-survey-btn" @click="openSystemSurvey">
            📡 Open System Survey
          </button>
        </div>

        <!-- Stars -->
        <div class="stars-section">
          <h3>⭐ Stars</h3>
          <div class="stars-grid">
            <div
              v-for="(star, i) in system.stars"
              :key="i"
              class="star-card"
              :class="i === 0 ? 'primary' : 'secondary'"
            >
              <div class="star-role">{{ i === 0 ? "Primary" : i === 1 ? "Secondary" : "Tertiary" }}</div>
              <div class="star-designation">{{ resolveStarDisplayLabel(star) }}</div>
              <div class="star-props">
                <div class="prop">
                  <span class="prop-label">Spectral Class:</span>
                  <span class="prop-value">{{ star.spectralClass }}</span>
                </div>
                <div class="prop">
                  <span class="prop-label">Mass:</span>
                  <span class="prop-value">{{ star.massInSolarMasses }} M☉</span>
                </div>
                <div class="prop">
                  <span class="prop-label">Luminosity:</span>
                  <span class="prop-value">{{ star.luminosity }} L☉</span>
                </div>
                <div class="prop">
                  <span class="prop-label">Temperature:</span>
                  <span class="prop-value">{{
                    formatTemperatureFromKelvin(star.temperatureK, { includeKelvin: true })
                  }}</span>
                </div>
                <div class="prop" v-if="i > 0">
                  <span class="prop-label">Orbit Type:</span>
                  <span class="prop-value">{{ star.orbitType }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Habitable Zone -->
        <div class="hz-section">
          <h3>🌍 {{ resolvedHabitableZone.hasRadiantHabitableZone ? "Habitable Zone" : "System Layout Anchor" }}</h3>
          <div class="hz-bar-wrapper">
            <div class="hz-labels">
              <span>{{ resolvedHabitableZone.hasRadiantHabitableZone ? "Too Hot" : "Inner System" }}</span>
              <span class="hz-label">{{
                resolvedHabitableZone.hasRadiantHabitableZone ? "Habitable Zone" : "Layout Anchor"
              }}</span>
              <span>{{ resolvedHabitableZone.hasRadiantHabitableZone ? "Too Cold" : "Outer System" }}</span>
            </div>
            <div class="hz-bar hz-bar--interactive">
              <div class="hz-region hz-hot" :style="{ width: '30%' }"></div>
              <div class="hz-region hz-zone" :style="{ width: '25%' }"></div>
              <div class="hz-region hz-cold" :style="{ width: '45%' }"></div>
              <div v-if="hzPlanetMarkers.length" class="hz-marker-layer" aria-label="Planet orbit markers">
                <button
                  v-for="marker in hzPlanetMarkers"
                  :key="marker.key"
                  type="button"
                  class="hz-planet-marker"
                  :class="[marker.zone, { selected: marker.index === selectedWorldIndex }]"
                  :style="{ left: `${marker.positionPercent}%` }"
                  :title="marker.label"
                  :aria-label="marker.label"
                  @click="selectWorldCandidate(marker.index)"
                >
                  <span class="hz-marker-tag">{{ marker.shortLabel }}</span>
                </button>
              </div>
            </div>
            <div v-if="hzPlanetMarkers.length" class="hz-marker-hint">Click a planet marker to select it.</div>
            <div class="hz-distances">
              <span>0 AU</span>
              <span>{{ resolvedHabitableZone.innerAU }} AU</span>
              <span>{{ resolvedHabitableZone.outerAU }} AU</span>
              <span>{{ resolvedHabitableZone.frostLineAU }} AU</span>
            </div>
            <p v-if="!resolvedHabitableZone.hasRadiantHabitableZone" class="hz-note">
              Compact remnants and other non-radiant primaries use a layout anchor for orbit placement instead of a true
              radiative habitable zone.
            </p>
          </div>
        </div>

        <!-- Planetary Catalog -->
        <div class="planets-section">
          <h3>🪐 Planetary Catalog</h3>
          <div v-if="!system.planets.length" class="empty-state">No major bodies catalogued.</div>
          <div v-else class="planet-table-scroll">
            <table class="planet-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>UWP</th>
                  <th>Composition</th>
                  <th>Orbit (AU)</th>
                  <th>Zone</th>
                  <th>Native Lifeforms</th>
                  <th>Native Sophonts</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(planet, i) in system.planets"
                  :key="i"
                  :class="{
                    habitable: planet.zone === 'habitable',
                    selectable: isWorldBuilderCandidate(planet),
                    selected: selectedWorldIndex === i,
                  }"
                  @click="selectWorldCandidate(i)"
                  @dblclick="isWorldBuilderCandidate(planet) && proceedToWorldBuilder()"
                >
                  <td>{{ i + 1 }}</td>
                  <td>
                    <div class="planet-name-cell">
                      <span>{{ planet.name }}</span>
                      <span v-if="planet.isMainworld" class="catalog-chip catalog-chip--mainworld">Mainworld</span>
                      <span v-if="planet.isMoon" class="catalog-chip catalog-chip--moon">Moon</span>
                    </div>
                    <div v-if="planet.parentWorldName" class="planet-parent">of {{ planet.parentWorldName }}</div>
                  </td>
                  <td>{{ describePlanetType(planet) }}</td>
                  <td>{{ planet.uwp || "—" }}</td>
                  <td>{{ planet.composition || "Unknown" }}</td>
                  <td>{{ planet.orbitAU }}</td>
                  <td>
                    <span class="zone-badge" :class="planet.zone">{{ planet.zone }}</span>
                  </td>
                  <td>
                    <div class="catalog-status-cell">
                      <span class="catalog-status" :class="resolveCatalogNativeLifeStatusClass(planet)">
                        {{ resolveCatalogNativeLifeLabel(planet) }}
                      </span>
                      <span v-if="hasCatalogNativeLifeProfile(planet.nativeLifeform)" class="catalog-status-meta">
                        {{ normalizeCatalogNativeLifeProfile(planet.nativeLifeform) }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="catalog-status" :class="resolveCatalogSophontStatusClass(planet)">
                      {{ resolveCatalogNativeSophontLabel(planet) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="selectedWorldCandidate" class="world-nav-hint">
            Press <kbd>G</kbd> or double-click a row to open the selected world.
          </div>
        </div>
      </div>

      <div v-else class="system-placeholder">
        <h2>No System Survey Yet</h2>
        <p>
          Hex {{ hexCoord }} has not been generated in System Survey yet. Click Generate System + Worlds to create and
          save the system survey and world profiles for this location.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import * as sectorApi from "../../api/sectorApi.js";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { generateObjectName, generatePhonotacticName } from "../../utils/nameGenerator.js";
import {
  isSpeechSynthesisSupported,
  speakTextWithPreferences,
  stopSpeechSynthesis,
} from "../../utils/speechSynthesis.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import {
  buildHexStarTypeMetadata,
  resolveGeneratedStarsFromSystem,
  resolvePreferredStarLabel,
} from "../../utils/systemStarMetadata.js";
import { applyPlanetaryBodyClassification } from "../../utils/systemWorldClassification.js";
import {
  buildProfiledWbhSystemPlanets,
  calculateSystemHabitableZone,
  sortSystemPlanetsByOrbit,
} from "../../utils/systemWorldGeneration.js";
import { starDescriptorToCssClass } from "../../utils/starDisplay.js";
import { inferSystemNameFromSystemRecord } from "../../utils/systemSummary.js";
import { formatTemperatureFromKelvin } from "../../utils/temperatureFormatting.js";
import { generateAutomaticWorldName } from "../../utils/worldProfileGenerator.js";
import { generateMultipleStarSystemWbh } from "../../utils/wbh/starGenerationWbh.js";

const props = defineProps({
  galaxyId: { type: String, default: null },
  sectorId: { type: String, default: null },
});
const router = useRouter();
const route = useRoute();
const preferencesStore = usePreferencesStore();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }
  return props.galaxyId ? { name: "SectorSurvey", params: { galaxyId: props.galaxyId } } : { name: "GalaxySurvey" };
});

// ── Constants ─────────────────────────────────────────────────────────────────
const SPECTRAL_TYPES = [
  { code: "O", label: "Blue — hot, massive", mass: 40, lum: 100000, temp: 40000 },
  { code: "B", label: "Blue-white", mass: 10, lum: 10000, temp: 20000 },
  { code: "A", label: "White", mass: 2.0, lum: 25, temp: 8500 },
  { code: "F", label: "Yellow-white", mass: 1.4, lum: 4, temp: 6700 },
  { code: "G", label: "Yellow (Sun-like)", mass: 1.0, lum: 1.0, temp: 5800 },
  { code: "K", label: "Orange", mass: 0.7, lum: 0.25, temp: 4500 },
  { code: "M", label: "Red dwarf", mass: 0.3, lum: 0.04, temp: 3200 },
];
const ANOMALY_TYPES = [
  { code: "Black Hole", label: "Black Hole", mass: 12, lum: 0, temp: 0, designation: "BH", orbitRole: "Singularity" },
  {
    code: "Pulsar",
    label: "Pulsar",
    mass: 1.4,
    lum: 0.001,
    temp: 600000,
    designation: "PSR",
    orbitRole: "Compact remnant",
  },
  {
    code: "Neutron Star",
    label: "Neutron Star",
    mass: 1.8,
    lum: 0.002,
    temp: 1000000,
    designation: "NS",
    orbitRole: "Compact remnant",
  },
  {
    code: "Quasar Remnant",
    label: "Quasar Remnant",
    mass: 5000000,
    lum: 0.05,
    temp: 0,
    designation: "QR",
    orbitRole: "Remnant core",
  },
  {
    code: "Dense Cluster",
    label: "Dense Cluster",
    mass: 250,
    lum: 15000,
    temp: 12000,
    designation: "CL",
    orbitRole: "Cluster core",
  },
];
const PRIMARY_TYPE_OPTIONS = [...SPECTRAL_TYPES, ...ANOMALY_TYPES];

const ORBIT_TYPES = ["Close", "Near", "Far", "Distant"];

// ── State ─────────────────────────────────────────────────────────────────────
const hexCoord = ref(route.query.hex ?? "0101");
const primarySpectral = ref(normalizePrimarySelection(route.query.star));
const multiplicity = ref("random");
const system = ref(null);
const systemName = ref("");
const isTtsSupported = isSpeechSynthesisSupported();
const isSpeaking = ref(false);
const selectedWorldIndex = ref(null);
const stellarLoadingState = ref({
  active: false,
  tone: "analysis",
  stateLabel: "PRIMARY ANALYSIS",
  statusCode: "STAR-CORE",
  title: "Stellar Survey Sync",
  message: "Loading stellar records...",
  barLabel: "Synchronizing stellar records and survey state",
  diagnostics: [
    { label: "Spectra", value: "Sampling" },
    { label: "Orbits", value: "Modeling" },
    { label: "Bodies", value: "Queued" },
  ],
  ledger: ["Stellar Survey", "Orbital Solver", "Primary Cache: Stable"],
});

const { overlayProps: systemExportOverlayProps, exportJson: exportSystemArchive } = useArchiveTransfer({
  context: "stellar",
  noun: "System",
  title: "System Export In Progress",
  barLabel: "Packaging stellar archive for transfer",
  statusPrefix: "SYS",
  targetLabel: () => system.value?.name || system.value?.systemId || normalizeHex(hexCoord.value),
});

function setStellarLoadingState(nextState) {
  stellarLoadingState.value = {
    ...stellarLoadingState.value,
    ...nextState,
  };
}

function resetStellarLoadingState() {
  stellarLoadingState.value = {
    active: false,
    tone: "analysis",
    stateLabel: "PRIMARY ANALYSIS",
    statusCode: "STAR-CORE",
    title: "Stellar Survey Sync",
    message: "Loading stellar records...",
    barLabel: "Synchronizing stellar records and survey state",
    diagnostics: [
      { label: "Spectra", value: "Sampling" },
      { label: "Orbits", value: "Modeling" },
      { label: "Bodies", value: "Queued" },
    ],
    ledger: ["Stellar Survey", "Orbital Solver", "Primary Cache: Stable"],
  };
}

async function runWithStellarLoading(
  title,
  message,
  operation,
  barLabel = "Synchronizing stellar records and survey state",
) {
  stellarLoadingState.value = {
    active: true,
    tone: "analysis",
    stateLabel: "PRIMARY ANALYSIS",
    statusCode: "STAR-CORE",
    title,
    message,
    barLabel,
    diagnostics: [
      { label: "Hex", value: normalizeHex(hexCoord.value) },
      { label: "Sector", value: props.sectorId || "Standalone" },
      { label: "Records", value: "Queued" },
    ],
    ledger: ["Stellar Survey", "Orbital Solver", "Primary Cache: Stable"],
  };

  try {
    return await operation();
  } finally {
    resetStellarLoadingState();
  }
}

function normalizeHex(value) {
  const raw = String(value || "0101").trim();
  const lastSegment = raw.split(":").pop() || raw;
  const digits = lastSegment.replace(/\D/g, "");
  if (digits.length >= 4) {
    return digits.slice(-4);
  }

  return digits.padStart(4, "0").slice(-4);
}

function normalizePrimarySelection(value) {
  const raw = String(value || "").trim();
  if (!raw) return "random";

  const exactMatch = PRIMARY_TYPE_OPTIONS.find((entry) => entry.code.toLowerCase() === raw.toLowerCase());
  if (exactMatch) {
    return exactMatch.code;
  }

  const firstChar = raw.charAt(0).toUpperCase();
  const spectralMatch = SPECTRAL_TYPES.find((entry) => entry.code === firstChar);
  return spectralMatch?.code || "random";
}

function multiplicityFromStars(stars) {
  const count = Array.isArray(stars) ? stars.length : 0;
  if (count >= 3) return "trinary";
  if (count === 2) return "binary";
  if (count === 1) return "single";
  return "random";
}

function sectorStarClassForSystem(systemRecord) {
  const primary = Array.isArray(systemRecord?.stars) ? systemRecord.stars[0] : null;
  return starDescriptorToCssClass(
    primary?.designation || primary?.spectralClass || systemRecord?.primaryStar?.spectralClass || "G",
  );
}

function parseSectorCoordinates(sectorId) {
  const raw = String(sectorId || "").trim();
  if (!raw) return null;

  const persistedMatch = raw.match(/^[^:]+:(-?\d+),(-?\d+)$/);
  if (persistedMatch) {
    return { x: Number(persistedMatch[1]), y: Number(persistedMatch[2]) };
  }

  const gridMatch = raw.match(/^grid:(-?\d+):(-?\d+)$/);
  if (gridMatch) {
    return { x: Number(gridMatch[1]), y: Number(gridMatch[2]) };
  }

  return null;
}

function getPersistedSectorId() {
  const coords = parseSectorCoordinates(props.sectorId);
  if (!coords || !props.galaxyId) {
    return String(props.sectorId || "").trim() || null;
  }

  return `${props.galaxyId}:${coords.x},${coords.y}`;
}

function buildFallbackSectorRecord() {
  const sectorId = getPersistedSectorId();
  const coords = parseSectorCoordinates(sectorId || props.sectorId);
  if (!sectorId || !coords || !props.galaxyId) {
    return null;
  }

  return {
    sectorId,
    galaxyId: props.galaxyId,
    coordinates: {
      x: coords.x,
      y: coords.y,
    },
    densityClass: 0,
    densityVariation: 0,
    metadata: {
      galaxyId: props.galaxyId,
      gridX: coords.x,
      gridY: coords.y,
      displayName: `Sector ${coords.x},${coords.y}`,
      explorationStatus: "unexplored",
      systemCount: 0,
    },
  };
}

async function syncSectorSurveyState(systemRecord) {
  if (!props.galaxyId || !props.sectorId || !systemRecord) {
    return;
  }

  setStellarLoadingState({
    tone: "sync",
    stateLabel: "LEDGER UPDATE",
    statusCode: "SYNC-HEX",
    title: "Sector Ledger Sync",
    message: `Synchronizing sector metadata for hex ${normalizeHex(systemRecord?.systemId || hexCoord.value)}...`,
    barLabel: "Updating sector occupancy and stellar signatures",
    diagnostics: [
      { label: "Hex", value: normalizeHex(systemRecord?.systemId || hexCoord.value) },
      { label: "Sector", value: props.sectorId || "Standalone" },
      { label: "Occupancy", value: "Updating" },
    ],
    ledger: ["Sector Survey Ledger", "Occupancy manifest: pending", "Stellar signatures: reconciling"],
  });

  const normalizedHex = normalizeHex(systemRecord?.systemId || hexCoord.value);
  const primary = Array.isArray(systemRecord?.stars) ? systemRecord.stars[0] : null;
  const starType = String(
    primary?.designation || primary?.spectralClass || systemRecord?.primaryStar?.spectralClass || "",
  ).trim();
  if (!starType) {
    return;
  }

  const persistedSectorId = getPersistedSectorId();
  let sector = sectorStore.sectors.find((entry) => entry.sectorId === persistedSectorId) ?? null;
  if (!sector) {
    try {
      sector = await sectorApi.getSector(persistedSectorId);
    } catch {
      sector = buildFallbackSectorRecord();
    }
  }
  if (!sector) {
    return;
  }

  const metadata = sector?.metadata ?? {};
  const occupiedHexes = Array.isArray(metadata.occupiedHexes)
    ? metadata.occupiedHexes.filter((coord) => typeof coord === "string")
    : [];
  if (!occupiedHexes.includes(normalizedHex)) {
    occupiedHexes.push(normalizedHex);
  }

  const secondaryStars = Array.isArray(systemRecord?.stars)
    ? systemRecord.stars
        .slice(1)
        .map((star) => String(star?.designation || star?.spectralClass || "").trim())
        .filter(Boolean)
    : Array.isArray(systemRecord?.companionStars)
      ? systemRecord.companionStars.map((star) => String(star?.spectralClass || "").trim()).filter(Boolean)
      : [];
  const hexStarMetadata = buildHexStarTypeMetadata({
    generatedStars: Array.isArray(systemRecord?.stars) ? systemRecord.stars : [],
    primary: starType,
    secondaryStars,
    anomalyType: primary?.isAnomaly ? primary?.spectralClass || primary?.designation || null : null,
    fallbackStarType: starType,
    legacyReconstructed: Boolean(systemRecord?.metadata?.generatedSurvey?.legacyReconstructed),
    legacyHierarchyUnknown: Boolean(systemRecord?.metadata?.generatedSurvey?.legacyHierarchyUnknown),
  });

  const nextSector = {
    ...sector,
    sectorId: persistedSectorId,
    galaxyId: props.galaxyId,
    metadata: {
      ...metadata,
      galaxyId: props.galaxyId,
      gridX: Number(metadata.gridX ?? sector?.coordinates?.x ?? 0),
      gridY: Number(metadata.gridY ?? sector?.coordinates?.y ?? 0),
      systemCount: Math.max(Number(metadata.systemCount) || 0, occupiedHexes.length),
      explorationStatus: "surveyed",
      occupiedHexes,
      hexPresenceGenerated: true,
      hexStarTypes: {
        ...(metadata.hexStarTypes && typeof metadata.hexStarTypes === "object" ? metadata.hexStarTypes : {}),
        [normalizedHex]: {
          starType: hexStarMetadata.starType,
          starClass: sectorStarClassForSystem(systemRecord),
          secondaryStars: hexStarMetadata.secondaryStars,
          generatedStars: hexStarMetadata.generatedStars.map((star) => ({ ...star })),
          anomalyType: hexStarMetadata.anomalyType,
          legacyReconstructed: hexStarMetadata.legacyReconstructed,
          legacyHierarchyUnknown: hexStarMetadata.legacyHierarchyUnknown,
        },
      },
      lastModified: new Date().toISOString(),
    },
  };

  const persistedSector = await sectorApi.upsertSector(nextSector);
  const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === persistedSector.sectorId);
  if (sectorIndex >= 0) {
    sectorStore.sectors[sectorIndex] = persistedSector;
  } else {
    sectorStore.sectors.unshift(persistedSector);
  }
  sectorStore.setCurrentSector(persistedSector.sectorId);
}

function toPersistedSystem(nextSystem) {
  const normalizedHex = normalizeHex(nextSystem.systemId);
  const persistedSectorId = getPersistedSectorId();
  const stars = Array.isArray(nextSystem.stars) ? nextSystem.stars : [];
  const planets = sortSystemPlanetsByOrbit(
    (Array.isArray(nextSystem.planets) ? nextSystem.planets : []).map((planet) =>
      applyPlanetaryBodyClassification(planet),
    ),
  );
  const mainworld = planets.find((world) => world?.isMainworld) ?? null;
  const primary = stars[0] ? { ...stars[0] } : null;
  const companions = stars.slice(1).map((s) => ({ ...s }));

  // Ensure the persisted system name includes a backend-friendly suffix (e.g. "Sol System").
  const finalName = ensureSystemSuffix(
    String(nextSystem.name || inferSystemNameFromSystemRecord(nextSystem) || "").trim(),
  );

  return {
    ...nextSystem,
    name: finalName,
    systemName: finalName,
    systemDesignation: finalName,
    systemId: `${persistedSectorId || "sector"}:${normalizedHex}`,
    galaxyId: props.galaxyId,
    sectorId: persistedSectorId,
    hexCoordinates: {
      x: Number(normalizedHex.slice(0, 2)) || 0,
      y: Number(normalizedHex.slice(2, 4)) || 0,
    },
    primaryStar: primary ? primary : { spectralClass: "G2V" },
    companionStars: companions,
    starCount: stars.length,
    mainworld,
    mainworldName: mainworld?.name ?? "",
    mainworldType: mainworld?.isMoon ? "Moon" : (mainworld?.type ?? ""),
    mainworldParentWorldName: mainworld?.parentWorldName ?? "",
    mainworldUwp: mainworld?.uwp ?? "",
    nativeLifeform: mainworld?.nativeLifeform ?? "",
    habitability: mainworld?.habitability ?? "",
    resourceRating: mainworld?.resourceRating ?? "",
    tradeCodes: Array.isArray(mainworld?.tradeCodes) ? [...mainworld.tradeCodes] : [],
    mainworldRemarks: Array.isArray(mainworld?.remarks) ? [...mainworld.remarks] : [],
    metadata: {
      generatedSurvey: {
        stars,
      },
      systemRecord: {
        name: finalName,
        systemName: finalName,
        systemDesignation: finalName,
      },
      displayName: finalName,
      lastModified: new Date().toISOString(),
    },
  };
}

function ensureSystemSuffix(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  const endsWithSystem = /\bsystem\s*$/i.test(trimmed);
  const objectNounRegex =
    /\b(?:belt|cluster|field|reach|expanse|ring|gate|spiral|domain|wastes|wilds|depths|shroud|corridor|band|zone|trail|chain|arc|shelf|spur|tract)\s*$/i;
  if (endsWithSystem || objectNounRegex.test(trimmed)) return trimmed;
  return `${trimmed} System`;
}

function resolveStarDisplayLabel(star = null) {
  return String(resolvePreferredStarLabel(star) || "").trim() || "Unknown";
}

function buildDisplayReadySystem(systemRecord = null) {
  const stars = resolveGeneratedStarsFromSystem(systemRecord);
  const normalizedPlanets = sortSystemPlanetsByOrbit(
    (Array.isArray(systemRecord?.planets) ? systemRecord.planets : []).map((planet) =>
      applyPlanetaryBodyClassification(planet),
    ),
  );

  if (!stars.length) {
    return {
      ...(systemRecord && typeof systemRecord === "object" ? systemRecord : {}),
      planets: normalizedPlanets,
      mainworld:
        normalizedPlanets.find((planet) => planet?.isMainworld) ??
        (systemRecord?.mainworld && typeof systemRecord.mainworld === "object"
          ? applyPlanetaryBodyClassification(systemRecord.mainworld)
          : (systemRecord?.mainworld ?? null)),
    };
  }

  return {
    ...(systemRecord && typeof systemRecord === "object" ? systemRecord : {}),
    stars,
    primaryStar: stars[0],
    companionStars: stars.slice(1),
    planets: normalizedPlanets,
    mainworld:
      normalizedPlanets.find((planet) => planet?.isMainworld) ??
      (systemRecord?.mainworld && typeof systemRecord.mainworld === "object"
        ? applyPlanetaryBodyClassification(systemRecord.mainworld)
        : (systemRecord?.mainworld ?? null)),
  };
}

function resolveSystemDisplayName(systemRecord = null) {
  const displayReadySystem = buildDisplayReadySystem(systemRecord);

  return (
    ensureSystemSuffix(firstNonEmptySystemName(systemName.value, route.query.systemName)) ||
    inferSystemNameFromSystemRecord(displayReadySystem) ||
    normalizeHex(displayReadySystem?.systemId || systemRecord?.systemId || hexCoord.value)
  );
}

function isPlaceholderSystemName(value) {
  const text = String(value || "").trim();
  return Boolean(text) && /^\d{4}(?:\s+system)?$/i.test(text);
}

function firstNonEmptySystemName(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text && !isPlaceholderSystemName(text)) {
      return text;
    }
  }
  return "";
}

const resolvedSystemDisplayName = computed(() => resolveSystemDisplayName(system.value));

async function hydrateSystem() {
  if (!props.galaxyId || !props.sectorId) {
    system.value = null;
    selectedWorldIndex.value = null;
    return;
  }

  const persistedSectorId = getPersistedSectorId();

  await runWithStellarLoading(
    "Stellar Survey Sync",
    `Hydrating stellar records for hex ${normalizeHex(hexCoord.value)}...`,
    async () => {
      setStellarLoadingState({
        tone: "analysis",
        stateLabel: "ARCHIVE LOAD",
        statusCode: "STAR-LOAD",
        title: "Stellar Survey Sync",
        message: `Loading stellar records for sector ${persistedSectorId || props.sectorId}...`,
        barLabel: "Reading cached stellar survey records",
        diagnostics: [
          { label: "Hex", value: normalizeHex(hexCoord.value) },
          { label: "Sector", value: persistedSectorId || props.sectorId || "Standalone" },
          { label: "Archive", value: "Reading" },
        ],
        ledger: ["Stellar Survey", "Local archive mounted", "Sector cache: scanning"],
      });
      await systemStore.loadSystems(props.galaxyId, persistedSectorId);

      setStellarLoadingState({
        tone: "analysis",
        stateLabel: "RECORD MATCH",
        statusCode: "STAR-MATCH",
        title: "Record Analysis",
        message: `Checking for an existing stellar survey at hex ${normalizeHex(hexCoord.value)}...`,
        barLabel: "Matching cached systems to requested hex",
        diagnostics: [
          { label: "Hex", value: normalizeHex(hexCoord.value) },
          { label: "Sector", value: persistedSectorId || props.sectorId || "Standalone" },
          { label: "Archive", value: "Matching" },
        ],
        ledger: ["Stellar Survey", `Hex ${normalizeHex(hexCoord.value)} requested`, "Record matcher: active"],
      });
      const requestedSystemRecordId = String(route.query.systemRecordId || "").trim();
      const existingById = requestedSystemRecordId
        ? systemStore.systems.find(
            (entry) =>
              String(entry?.systemId || "") === requestedSystemRecordId &&
              String(entry?.sectorId || "") === String(persistedSectorId || ""),
          )
        : null;
      const existing = existingById ?? systemStore.findSystemByHex(props.galaxyId, persistedSectorId, hexCoord.value);
      const hydratedExisting = buildDisplayReadySystem(existing);
      if (hydratedExisting?.stars?.length) {
        const hydratedName = ensureSystemSuffix(
          firstNonEmptySystemName(
            systemName.value,
            route.query.systemName,
            inferSystemNameFromSystemRecord(hydratedExisting),
          ),
        );
        primarySpectral.value = normalizePrimarySelection(
          resolveStarDisplayLabel(hydratedExisting.stars[0] || hydratedExisting?.primaryStar),
        );
        multiplicity.value = multiplicityFromStars(hydratedExisting.stars);
        const sortedPlanets = sortSystemPlanetsByOrbit(hydratedExisting?.planets);
        system.value = {
          ...hydratedExisting,
          planets: sortedPlanets,
          ...(hydratedName
            ? {
                name: hydratedName,
                systemName: hydratedName,
                systemDesignation: hydratedName,
                metadata: {
                  ...(hydratedExisting?.metadata && typeof hydratedExisting.metadata === "object"
                    ? hydratedExisting.metadata
                    : {}),
                  displayName: hydratedName,
                  systemRecord: {
                    ...(hydratedExisting?.metadata?.systemRecord &&
                    typeof hydratedExisting.metadata.systemRecord === "object"
                      ? hydratedExisting.metadata.systemRecord
                      : {}),
                    name: hydratedName,
                    systemName: hydratedName,
                    systemDesignation: hydratedName,
                  },
                },
              }
            : {}),
          systemId: normalizeHex(hydratedExisting.systemId || hexCoord.value),
          habitableZone:
            hydratedExisting?.habitableZone && typeof hydratedExisting.habitableZone === "object"
              ? hydratedExisting.habitableZone
              : calculateSystemHabitableZone(hydratedExisting?.stars ?? []),
        };
        systemName.value = hydratedName || ensureSystemSuffix(String(route.query.systemName || "").trim());
        selectedWorldIndex.value = resolveSelectedWorldIndex(sortedPlanets);
        systemStore.setCurrentSystem(hydratedExisting.systemId || null);
        hexCoord.value = normalizeHex(hydratedExisting.systemId || hexCoord.value);
        await syncSectorSurveyState(hydratedExisting);
        return;
      }

      system.value = null;
      systemName.value = "";
      multiplicity.value = "random";
      selectedWorldIndex.value = null;
      systemStore.setCurrentSystem(null);
    },
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildAnomalyPrimary(anomalyEntry) {
  return {
    designation: anomalyEntry.designation,
    spectralClass: anomalyEntry.code,
    massInSolarMasses: anomalyEntry.mass,
    luminosity: anomalyEntry.lum,
    temperatureK: anomalyEntry.temp,
    orbitType: anomalyEntry.orbitRole || null,
    isAnomaly: true,
  };
}

function pickRandomSpectralCode() {
  return SPECTRAL_TYPES[Math.floor(Math.random() * SPECTRAL_TYPES.length)]?.code || "G";
}

function buildStar(requestedType, role) {
  const nextStar = generatePrimaryStar(
    requestedType && requestedType !== "random" ? { spectralType: requestedType } : {},
  );

  return {
    ...nextStar,
    designation: nextStar.designation || nextStar.spectralType || nextStar.spectralClass,
    spectralClass: nextStar.spectralClass || nextStar.designation || nextStar.spectralType,
    massInSolarMasses: Number(nextStar.massInSolarMasses ?? nextStar.mass ?? 1),
    temperatureK: Number(nextStar.temperatureK ?? nextStar.temperature ?? 5800),
    orbitType: role !== "primary" ? ORBIT_TYPES[Math.floor(Math.random() * ORBIT_TYPES.length)] : null,
  };
}

function isWorldBuilderCandidate(planet) {
  return Boolean(planet) && String(planet?.type || "") !== "Gas Giant" && String(planet?.sizeCode || "") !== "R";
}

function describePlanetType(planet) {
  if (!planet) {
    return "Unknown";
  }

  if (planet.isMoon) {
    return planet.parentWorldName ? `Moon of ${planet.parentWorldName}` : "Significant Moon";
  }

  const baseType = String(planet.type || "Unknown");
  const worldDescriptor = String(planet.worldDescriptor || "").trim();
  const orbitBandKey = String(planet.orbitBandKey || "")
    .trim()
    .toLowerCase();
  if (
    worldDescriptor &&
    orbitBandKey &&
    orbitBandKey !== "unknown" &&
    !worldDescriptor.toLowerCase().includes(baseType.toLowerCase())
  ) {
    return `${baseType} — ${worldDescriptor}`;
  }

  return baseType;
}

function normalizeCatalogNativeLifeProfile(profile) {
  return String(profile || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function hasCatalogNativeLifeProfile(profile) {
  const normalizedProfile = normalizeCatalogNativeLifeProfile(profile);
  return (
    Boolean(normalizedProfile) && !["0000", "NONE", "ABSENT", "N/A", "NULL", "UNINHABITED"].includes(normalizedProfile)
  );
}

function decodeCatalogExtendedHexDigit(value) {
  const normalized = String(value || "0")
    .trim()
    .charAt(0)
    .toUpperCase();
  if (!normalized) {
    return 0;
  }
  return Number.parseInt(normalized, 16) || 0;
}

function resolveCatalogNativeLifeLabel(planet) {
  return hasCatalogNativeLifeProfile(planet?.nativeLifeform) || planet?.nativeSophontLife === true
    ? "Present"
    : "Absent";
}

function resolveCatalogNativeLifeStatusClass(planet) {
  return resolveCatalogNativeLifeLabel(planet) === "Present" ? "catalog-status--present" : "catalog-status--absent";
}

function resolveCatalogNativeSophontLabel(planet = {}) {
  const normalizedStatus = String(planet?.nativeSophontStatus || "")
    .trim()
    .toLowerCase();

  if (["exist", "exists", "extant", "present", "current"].includes(normalizedStatus)) {
    return "Exist";
  }
  if (["extinct", "former"].includes(normalizedStatus)) {
    return "Extinct";
  }
  if (normalizedStatus === "absent") {
    return "Absent";
  }
  if (planet?.nativeSophontLife === true) {
    return "Exist";
  }

  const biocomplexity = decodeCatalogExtendedHexDigit(
    normalizeCatalogNativeLifeProfile(planet?.nativeLifeform).charAt(1),
  );
  return biocomplexity >= 9 ? "Extinct" : "Absent";
}

function resolveCatalogSophontStatusClass(planet) {
  const status = resolveCatalogNativeSophontLabel(planet);
  if (status === "Exist") {
    return "catalog-status--present";
  }
  if (status === "Extinct") {
    return "catalog-status--historic";
  }
  return "catalog-status--absent";
}

function summarizeSelectedWorld(planet) {
  if (!planet) {
    return "";
  }

  return [planet.name, describePlanetType(planet), planet.zone].filter(Boolean).join(" · ");
}

function findDefaultWorldIndex(planets) {
  if (!Array.isArray(planets) || !planets.length) return null;

  const flaggedMainworldIndex = planets.findIndex((planet) => planet?.isMainworld && isWorldBuilderCandidate(planet));
  if (flaggedMainworldIndex >= 0) return flaggedMainworldIndex;

  const habitableIndex = planets.findIndex((planet) => planet.zone === "habitable" && isWorldBuilderCandidate(planet));
  if (habitableIndex >= 0) return habitableIndex;

  return 0;
}

function resolveSelectedWorldIndex(planets) {
  if (!Array.isArray(planets) || !planets.length) {
    return null;
  }

  const requestedIndex = Number.parseInt(String(route.query.worldIndex ?? ""), 10);
  if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < planets.length) {
    return requestedIndex;
  }

  return findDefaultWorldIndex(planets);
}

function selectWorldCandidate(index) {
  if (!system.value?.planets?.[index]) {
    return;
  }
  selectedWorldIndex.value = index;
}

const selectedWorldCandidate = computed(() => {
  const index = Number(selectedWorldIndex.value);
  if (!Number.isInteger(index) || index < 0 || !Array.isArray(system.value?.planets)) {
    return null;
  }
  return system.value.planets[index] ?? null;
});

const resolvedHabitableZone = computed(() => {
  const persistedZone = system.value?.habitableZone;
  if (persistedZone && typeof persistedZone === "object") {
    return persistedZone;
  }

  const stars = Array.isArray(system.value?.stars) ? system.value.stars : [];
  return calculateSystemHabitableZone(stars);
});

function resolveHabitableZoneMarkerPosition(orbitAU, habitableZone, maxOrbitAU) {
  const orbit = Number(orbitAU);
  if (!Number.isFinite(orbit) || orbit <= 0) {
    return 0;
  }

  const innerAU = Math.max(Number(habitableZone?.innerAU) || 0.1, 0.1);
  const outerAU = Math.max(Number(habitableZone?.outerAU) || innerAU + 0.1, innerAU + 0.1);
  const maxAU = Math.max(Number(maxOrbitAU) || 1, outerAU);

  if (orbit <= innerAU) {
    return Math.min(30, (orbit / innerAU) * 30);
  }

  if (orbit <= outerAU) {
    return 30 + ((orbit - innerAU) / Math.max(outerAU - innerAU, 0.1)) * 25;
  }

  return Math.min(100, 55 + ((Math.min(orbit, maxAU) - outerAU) / Math.max(maxAU - outerAU, 0.1)) * 45);
}

const hzPlanetMarkers = computed(() => {
  const planets = Array.isArray(system.value?.planets) ? system.value.planets : [];
  if (!planets.length) {
    return [];
  }

  const orbitValues = planets
    .map((planet) => Number(planet?.orbitAU))
    .filter((value) => Number.isFinite(value) && value >= 0);
  const maxOrbitAU = Math.max(
    1,
    ...orbitValues,
    Number(resolvedHabitableZone.value?.frostLineAU) || 0,
    Number(resolvedHabitableZone.value?.outerAU) || 0,
  );

  return planets.map((planet, index) => {
    const orbit = Number(planet?.orbitAU);
    const orbitLabel = Number.isFinite(orbit) ? `${orbit} AU` : "Orbit unknown";

    const worldName = String(planet?.name || `World ${index + 1}`).trim() || `World ${index + 1}`;

    return {
      key: `${worldName}-${index}`,
      index,
      zone: String(planet?.zone || "unknown")
        .trim()
        .toLowerCase(),
      positionPercent: resolveHabitableZoneMarkerPosition(orbit, resolvedHabitableZone.value, maxOrbitAU),
      shortLabel: worldName.length > 10 ? `${worldName.slice(0, 10)}…` : worldName,
      label: `${summarizeSelectedWorld(planet) || worldName} — ${orbitLabel}`,
    };
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────
async function buildSystem() {
  const requestedPrimary = normalizePrimarySelection(primarySpectral.value);
  primarySpectral.value = requestedPrimary;

  const existingStars = resolveGeneratedStarsFromSystem(system.value);
  const shouldReuseExistingStars =
    existingStars.length > 0 &&
    Boolean(String(route.query.systemRecordId || systemStore.currentSystemId || "").trim()) &&
    (Boolean(system.value?.metadata?.generatedWorldProfilesIncomplete) ||
      !Array.isArray(system.value?.planets) ||
      system.value.planets.length === 0);

  const primaryEntry =
    requestedPrimary === "random"
      ? null
      : (PRIMARY_TYPE_OPTIONS.find((entry) => entry.code === requestedPrimary) ?? null);
  const primaryIsAnomaly = primaryEntry ? ANOMALY_TYPES.some((entry) => entry.code === primaryEntry.code) : false;

  const starCountLimit = multiplicity.value === "single" ? 1 : multiplicity.value === "binary" ? 2 : 3;
  const stars = shouldReuseExistingStars
    ? existingStars.map((star) => ({ ...star }))
    : primaryIsAnomaly
      ? [buildAnomalyPrimary(primaryEntry)]
      : generateMultipleStarSystemWbh({
          spectralType: requestedPrimary === "random" ? undefined : requestedPrimary,
          maxStars: multiplicity.value === "random" ? 3 : starCountLimit,
        }).slice(0, multiplicity.value === "random" ? 3 : starCountLimit);

  const nextSystemName = ensureSystemSuffix(
    String(systemName.value || system.value?.name || inferSystemNameFromSystemRecord(system.value) || "").trim() ||
      generateSystemName(),
  );
  systemName.value = nextSystemName;

  // Assign system-based designations using the system name.
  // Naming rules: Primary => Primus Major / Primus Minor for companions; Close => Proximus Major/Minor;
  // Near => Proximum Major/Minor; Far => Procul Major / Procol Minor.
  (function applySystemStarDesignations() {
    const baseName = String(nextSystemName)
      .replace(/\s+System$/i, "")
      .trim();

    const groups = {};
    stars.forEach((star, idx) => {
      let cat =
        idx === 0
          ? "primary"
          : String(star.orbitType || "far")
              .trim()
              .toLowerCase();
      if (cat === "distant") cat = "far";
      if (!["primary", "close", "near", "far"].includes(cat)) cat = "far";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ idx, star });
    });

    const majorPrefix = { primary: "Primus", close: "Proximus", near: "Proximum", far: "Procul" };
    const minorPrefix = { primary: "Primus", close: "Proximus", near: "Proximum", far: "Procul" };

    Object.keys(groups).forEach((cat) => {
      const list = groups[cat];

      // pick the most massive member as Major; for primary prefer index 0
      let majorEntry = list[0];
      if (cat === "primary") {
        majorEntry = list.find((e) => e.idx === 0) || list[0];
      } else {
        majorEntry = list.reduce((best, cur) => {
          const bestMass = Number(best.star?.massInSolarMasses ?? best.star?.mass ?? 0);
          const curMass = Number(cur.star?.massInSolarMasses ?? cur.star?.mass ?? 0);
          return curMass > bestMass ? cur : best;
        }, list[0]);
      }

      list.forEach((entry) => {
        const isMajor = entry === majorEntry;
        const prefix = isMajor ? majorPrefix[cat] : minorPrefix[cat];
        const suffix = isMajor ? "Major" : "Minor";
        const designation = `${baseName} ${prefix} ${suffix}`.trim();
        stars[entry.idx].designation = designation;
      });
    });
  })();

  const hz = calculateSystemHabitableZone(stars);
  const planets = sortSystemPlanetsByOrbit(
    buildProfiledWbhSystemPlanets({
      stars,
      habitableZone: hz,
      createPlanetName: ({ type, usedNames, index }) =>
        type === "Planetoid Belt"
          ? generateObjectName({
              mode: String(preferencesStore.asteroidBeltNameMode || "phonotactic")
                .trim()
                .toLowerCase(),
              objectType: "asteroid-belt",
              mythicTheme: String(preferencesStore.galaxyMythicTheme || "all")
                .trim()
                .toLowerCase(),
              lineageSeed: `${props.sectorId || "sector"}:${nextSystemName}`,
              seed: `${props.sectorId || "sector"}:${hexCoord.value || "0000"}:belt:${index}`,
              parentName: nextSystemName,
            })
          : generateAutomaticWorldName({
              mode: preferencesStore.worldNameMode,
              usedNames,
              systemName: nextSystemName,
              seed: `${props.sectorId || "sector"}:${hexCoord.value || "0000"}:world:${index}`,
            }),
    }),
  );

  const nextSystem = {
    systemId: hexCoord.value || "0000",
    stars,
    habitableZone: hz,
    planets,
    name: nextSystemName,
    systemName: nextSystemName,
    systemDesignation: nextSystemName,
    metadata: {
      ...(system.value?.metadata && typeof system.value.metadata === "object" ? system.value.metadata : {}),
      displayName: nextSystemName,
      systemRecord: {
        ...(system.value?.metadata?.systemRecord && typeof system.value.metadata.systemRecord === "object"
          ? system.value.metadata.systemRecord
          : {}),
        name: nextSystemName,
        systemName: nextSystemName,
        systemDesignation: nextSystemName,
      },
      lastModified: new Date().toISOString(),
    },
  };

  multiplicity.value = multiplicityFromStars(stars);
  system.value = nextSystem;
  selectedWorldIndex.value = resolveSelectedWorldIndex(planets);

  if (props.galaxyId && props.sectorId) {
    await runWithStellarLoading(
      "Stellar Survey Update",
      `Saving stellar survey for hex ${normalizeHex(nextSystem.systemId)}...`,
      async () => {
        const persisted = toPersistedSystem(nextSystem);
        setStellarLoadingState({
          tone: "fabrication",
          stateLabel: "ARCHIVE WRITE",
          statusCode: "STAR-WRITE",
          title: "Stellar Survey Update",
          message: `Persisting stellar profile for hex ${normalizeHex(nextSystem.systemId)}...`,
          barLabel: "Writing stellar system record to archive",
          diagnostics: [
            { label: "Hex", value: normalizeHex(nextSystem.systemId) },
            { label: "Multiplicity", value: `${stars.length} star${stars.length === 1 ? "" : "s"}` },
            { label: "Bodies", value: `${planets.length} catalogued` },
          ],
          ledger: ["Stellar Survey", "Primary archive: write lock", "Sector mirror: pending sync"],
        });
        await systemStore.createSystem(persisted);
        systemStore.setCurrentSystem(persisted.systemId);
        await syncSectorSurveyState(persisted);
      },
      "Committing stellar survey updates",
    );
  }
}

function regenerateSystem() {
  return buildSystem();
}

async function generateWorlds() {
  if (!system.value) return;

  const existingStars = resolveGeneratedStarsFromSystem(system.value);
  if (!existingStars.length) return;

  const stars = existingStars.map((star) => ({ ...star }));
  const nextSystemName = ensureSystemSuffix(
    String(systemName.value || system.value?.name || "").trim() || generateSystemName(),
  );

  const hz = calculateSystemHabitableZone(stars);
  const planets = sortSystemPlanetsByOrbit(
    buildProfiledWbhSystemPlanets({
      stars,
      habitableZone: hz,
      createPlanetName: ({ type, usedNames, index }) =>
        type === "Planetoid Belt"
          ? generateObjectName({
              mode: String(preferencesStore.asteroidBeltNameMode || "phonotactic")
                .trim()
                .toLowerCase(),
              objectType: "asteroid-belt",
              mythicTheme: String(preferencesStore.galaxyMythicTheme || "all")
                .trim()
                .toLowerCase(),
              lineageSeed: `${props.sectorId || "sector"}:${nextSystemName}`,
              seed: `${props.sectorId || "sector"}:${hexCoord.value || "0000"}:belt:${index}`,
              parentName: nextSystemName,
            })
          : generateAutomaticWorldName({
              mode: preferencesStore.worldNameMode,
              usedNames,
              systemName: nextSystemName,
              seed: `${props.sectorId || "sector"}:${hexCoord.value || "0000"}:world:${index}`,
            }),
    }),
  );

  const nextSystem = {
    ...system.value,
    stars,
    habitableZone: hz,
    planets,
    name: nextSystemName,
    systemName: nextSystemName,
    systemDesignation: nextSystemName,
    metadata: {
      ...(system.value?.metadata && typeof system.value.metadata === "object" ? system.value.metadata : {}),
      displayName: nextSystemName,
      lastModified: new Date().toISOString(),
    },
  };

  system.value = nextSystem;
  selectedWorldIndex.value = resolveSelectedWorldIndex(planets);

  if (props.galaxyId && props.sectorId) {
    await runWithStellarLoading(
      "System Survey Update",
      `Regenerating worlds for hex ${normalizeHex(nextSystem.systemId)}...`,
      async () => {
        const persisted = toPersistedSystem(nextSystem);
        await systemStore.createSystem(persisted);
        systemStore.setCurrentSystem(persisted.systemId);
        await syncSectorSurveyState(persisted);
      },
      "Saving regenerated world catalogue",
    );
  }
}

async function exportSystem() {
  if (!system.value) return;
  await exportSystemArchive({
    data: system,
    filename: (systemRecord) => `System-${systemRecord.systemId}.json`,
    serializeMessage: "Serializing stellar system manifest...",
    encodeMessage: "Encoding stellar archive for transfer...",
    readyMessage: "Stellar archive staged for local transfer.",
    serializingProgress: 24,
    encodingProgress: 70,
  });
}

const importFileInput = ref(null);

function triggerImport() {
  importFileInput.value?.click();
}

async function importSystem(event) {
  const file = event.target?.files?.[0];
  if (!importFileInput.value) return;
  importFileInput.value.value = "";
  if (!file) return;

  let parsed;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    alert("Could not read the file. Make sure it is a valid JSON system archive.");
    return;
  }

  if (!parsed || typeof parsed !== "object" || !parsed.systemId) {
    alert("Invalid system archive: missing systemId.");
    return;
  }

  await runWithStellarLoading("Import Stellar Archive", `Importing system ${parsed.systemId}...`, async () => {
    const sortedPlanets = sortSystemPlanetsByOrbit(parsed?.planets);
    const importedSystem = {
      ...parsed,
      planets: sortedPlanets,
      habitableZone:
        parsed?.habitableZone && typeof parsed.habitableZone === "object"
          ? parsed.habitableZone
          : calculateSystemHabitableZone(parsed?.stars ?? []),
    };

    system.value = importedSystem;
    hexCoord.value = normalizeHex(importedSystem.systemId || hexCoord.value);
    systemName.value = ensureSystemSuffix(
      String(importedSystem.name || importedSystem.metadata?.displayName || "").trim(),
    );
    primarySpectral.value = normalizePrimarySelection(
      resolveStarDisplayLabel(importedSystem.stars?.[0] || importedSystem.primaryStar),
    );
    multiplicity.value = multiplicityFromStars(importedSystem.stars);
    selectedWorldIndex.value = resolveSelectedWorldIndex(sortedPlanets);

    if (props.galaxyId && props.sectorId) {
      const persisted = toPersistedSystem(importedSystem);
      await systemStore.createSystem(persisted);
      systemStore.setCurrentSystem(persisted.systemId);
    }
  });
}

function proceedToWorldBuilder() {
  if (!selectedWorldCandidate.value) return;

  const returnTo = serializeReturnRoute({
    name: String(route.name || "StarSystemBuilder"),
    params: { ...route.params },
    query: {
      ...route.query,
      hex: normalizeHex(system.value?.systemId || hexCoord.value),
      star: String(system.value?.stars?.[0]?.designation || route.query.star || "").trim(),
      worldIndex: String(selectedWorldIndex.value ?? ""),
    },
  });

  router.push({
    name: "WorldBuilder",
    params: { systemId: system.value.systemId },
    query: {
      returnTo,
      systemRecordId: String(systemStore.currentSystemId || ""),
      star: system.value.stars[0].designation,
      worldName: selectedWorldCandidate.value.name,
      worldType: selectedWorldCandidate.value.type,
      orbitAU: String(selectedWorldCandidate.value.orbitAU ?? ""),
      zone: selectedWorldCandidate.value.zone,
      worldIndex: String(selectedWorldIndex.value ?? ""),
    },
  });
}

function openSystemSurvey() {
  if (!system.value) return;

  const returnTo = serializeReturnRoute({
    name: String(route.name || "StarSystemBuilder"),
    params: { ...route.params },
    query: {
      ...route.query,
      hex: normalizeHex(system.value?.systemId || hexCoord.value),
      star: String(system.value?.stars?.[0]?.designation || route.query.star || "").trim(),
    },
  });

  router.push({
    name: "SystemSurvey",
    params: { galaxyId: props.galaxyId, sectorId: props.sectorId },
    query: {
      systemId: String(system.value?.systemId || ""),
      systemRecordId: String(systemStore.currentSystemId || ""),
      systemName: resolvedSystemDisplayName.value,
      hex: normalizeHex(system.value?.systemId || hexCoord.value),
      star: String(system.value?.stars?.[0]?.designation || route.query.star || "").trim(),
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

function generateSystemName() {
  const mode = String(preferencesStore.systemNameMode || preferencesStore.worldNameMode || "normalized")
    .trim()
    .toLowerCase();

  const lineageSeed = `${props.galaxyId || "galaxy"}:${props.sectorId || route.query.sectorId || "sector"}`;
  const systemSeed = `${lineageSeed}:${hexCoord.value || route.query.hex || "0000"}`;

  let next = "";
  if (mode === "normalized" || mode === "phonotactic") {
    next = generatePhonotacticName({ style: mode, syllablesMin: 2, syllablesMax: 4 });
  } else if (mode === "mythic") {
    next = generateObjectName({
      mode: "mythic",
      objectType: "system",
      mythicTheme: String(preferencesStore.galaxyMythicTheme || "all")
        .trim()
        .toLowerCase(),
    });
  } else {
    next = generateObjectName({
      mode: String(mode || "normalized")
        .trim()
        .toLowerCase(),
      objectType: "system",
      mythicTheme: String(preferencesStore.galaxyMythicTheme || "all")
        .trim()
        .toLowerCase(),
      lineageSeed,
      seed: systemSeed,
    });
  }

  // Optionally append a trailing " System" suffix when the user prefers it,
  // but avoid adding it if the generated name already ends with a common object noun
  // (e.g. Belt, Cluster, Reach) or already ends with "System".
  if (preferencesStore.appendSystemSuffix) {
    const trimmed = String(next || "").trim();
    const endsWithSystem = /\bsystem\s*$/i.test(trimmed);
    const objectNounRegex =
      /\b(?:belt|cluster|field|reach|expanse|ring|gate|spiral|domain|wastes|wilds|depths|shroud|corridor|band|zone|trail|chain|arc|shelf|spur|tract)\s*$/i;
    if (trimmed && !endsWithSystem && !objectNounRegex.test(trimmed)) {
      next = `${trimmed} System`;
    }
  }

  systemName.value = next;
  return next;
}

async function persistSystemName() {
  const resolvedName = ensureSystemSuffix(String(systemName.value || "").trim());
  if (!resolvedName) {
    return;
  }

  systemName.value = resolvedName;

  if (!system.value) {
    return;
  }

  const nextSystem = {
    ...system.value,
    name: resolvedName,
    systemDesignation: resolvedName,
    metadata: {
      ...(system.value?.metadata && typeof system.value.metadata === "object" ? system.value.metadata : {}),
      displayName: resolvedName,
      systemRecord: {
        ...(system.value?.metadata?.systemRecord && typeof system.value.metadata.systemRecord === "object"
          ? system.value.metadata.systemRecord
          : {}),
        name: resolvedName,
        systemName: resolvedName,
        systemDesignation: resolvedName,
      },
      lastModified: new Date().toISOString(),
    },
  };

  system.value = nextSystem;

  if (!props.galaxyId || !props.sectorId) {
    return;
  }

  const persisted = toPersistedSystem(nextSystem);
  await systemStore.createSystem(persisted);
  systemStore.setCurrentSystem(persisted.systemId);
}

function toggleSpeakSystemName() {
  if (!isTtsSupported || !String(systemName.value || "").trim()) return;
  if (isSpeaking.value) {
    stopSpeechSynthesis();
    isSpeaking.value = false;
    return;
  }
  isSpeaking.value = true;
  const res = speakTextWithPreferences(String(systemName.value), {
    rate: Number(preferencesStore.ttsRate) || 1,
    pitch: Number(preferencesStore.ttsPitch) || 1,
    voiceURI: String(preferencesStore.ttsVoiceURI || "").trim(),
    onEnd: () => {
      isSpeaking.value = false;
    },
    onError: () => {
      isSpeaking.value = false;
    },
  });
  if (!res.ok) {
    isSpeaking.value = false;
  }
}

watch(
  () => route.query.hex,
  async (value) => {
    if (!value) return;
    hexCoord.value = normalizeHex(value);
    await hydrateSystem();
  },
);

watch(
  () => route.query.star,
  (value) => {
    primarySpectral.value = normalizePrimarySelection(value);
  },
);

watch(
  () => route.query.worldIndex,
  (value) => {
    if (!Array.isArray(system.value?.planets) || !system.value.planets.length) {
      return;
    }

    const requestedIndex = Number.parseInt(String(value ?? ""), 10);
    if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < system.value.planets.length) {
      selectedWorldIndex.value = requestedIndex;
      return;
    }

    selectedWorldIndex.value = findDefaultWorldIndex(system.value.planets);
  },
);

function handleGlobalKeydown(e) {
  if (e.key === "g" || e.key === "G") {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (selectedWorldCandidate.value) proceedToWorldBuilder();
  }
}

onMounted(async () => {
  hexCoord.value = normalizeHex(hexCoord.value);
  await hydrateSystem();
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style scoped>
.star-system-builder {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.15rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}

.control-action {
  flex-direction: row;
  align-items: flex-end;
  flex: 1 1 auto;
  min-width: unset;
  gap: 0.6rem;
}

.control-action-back {
  margin-left: auto;
}

.control-action-divider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-left: 0.75rem;
  border-left: 1px solid #444;
  margin-left: 0.25rem;
}

.import-file-hidden {
  display: none;
}

.select-input,
.text-input {
  min-height: 2.5rem;
  padding: 0.6rem 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.system-name-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.system-name-row .text-input {
  min-width: 0;
  flex: 1;
}

.planet-table-scroll {
  max-height: 40vh;
  overflow: auto;
}

.world-nav-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #888;
}

.world-nav-hint kbd {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  border: 1px solid #555;
  border-radius: 0.2rem;
  font-size: 0.75rem;
  color: #ccc;
  background: #2a2a3e;
}

.btn {
  min-height: 2.5rem;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  line-height: 1.2;
  transition: all 0.2s;
  text-decoration: none;
}

.btn.btn-outline {
  background: transparent;
  color: #00d9ff;
  border: 1px solid #00d9ff;
}

.btn.btn-outline:hover {
  background: rgba(0, 217, 255, 0.1);
}

.btn-primary {
  background: #00d9ff;
  color: #000;
}

.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}

/* System display */
.system-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.system-placeholder {
  background: #1a1a2e;
  border: 1px dashed rgba(0, 217, 255, 0.35);
  border-radius: 0.5rem;
  padding: 1.15rem;
  color: #b8d9ea;
}

.system-placeholder h2 {
  color: #00d9ff;
  margin: 0 0 0.5rem;
}

.system-placeholder p {
  margin: 0;
  line-height: 1.5;
}

.system-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.system-header-survey-btn {
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

.system-header h2 {
  color: #00d9ff;
  margin: 0;
}

.system-type-badge {
  background: #00d9ff;
  color: #000;
  padding: 0.3rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: bold;
}

.stars-section,
.hz-section,
.planets-section {
  margin-bottom: 2rem;
}

.stars-section h3,
.hz-section h3,
.planets-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.stars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.star-card {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid #555;
}

.star-card.primary {
  border-left-color: #ffd700;
}

.star-card.secondary {
  border-left-color: #aaa;
}

.star-role {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.star-designation {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  font-family: monospace;
  margin-bottom: 0.75rem;
}

.star-props {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prop {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.prop-label {
  color: #00ffff;
  min-width: 130px;
}

.prop-value {
  color: #e0e0e0;
  font-family: monospace;
}

/* HZ */
.hz-bar-wrapper {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1rem;
}

.hz-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.hz-label {
  color: #6bcf7f;
  font-weight: bold;
}

.hz-bar {
  display: flex;
  height: 20px;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.hz-bar--interactive {
  position: relative;
}

.hz-marker-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hz-planet-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  border: 2px solid rgba(7, 11, 23, 0.95);
  background: #d9edf9;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
  cursor: pointer;
  pointer-events: auto;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  overflow: visible;
}

.hz-marker-tag {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.35rem);
  transform: translateX(-50%);
  padding: 0.12rem 0.38rem;
  border-radius: 999px;
  background: rgba(8, 14, 27, 0.92);
  color: #d9edf9;
  font-size: 0.64rem;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  pointer-events: none;
}

.hz-planet-marker:hover {
  transform: translate(-50%, -50%) scale(1.12);
}

.hz-planet-marker.selected {
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.45);
}

.hz-planet-marker.hot {
  background: #ff8d7a;
}

.hz-planet-marker.warm {
  background: #ffcf6b;
}

.hz-planet-marker.habitable {
  background: #6bcf7f;
}

.hz-planet-marker.cold {
  background: #78b8ff;
}

.hz-planet-marker.frozen {
  background: #c9ecff;
}

.hz-marker-hint {
  margin-bottom: 0.45rem;
  color: #8fa9bf;
  font-size: 0.78rem;
}

.hz-hot {
  background: #ff6b6b;
}
.hz-zone {
  background: #6bcf7f;
}
.hz-cold {
  background: #6b9fff;
}

.hz-distances {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #555;
}

.hz-note {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #777;
}

/* Planet table */
.planet-table-scroll {
  max-height: min(26rem, 52vh);
  overflow-y: auto;
  border: 1px solid #1a1a3a;
  border-radius: 0.5rem;
}

.planet-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.planet-table th {
  background: #0d0d2b;
  color: #00ffff;
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 2px solid #333;
  position: sticky;
  top: 0;
  z-index: 1;
}

.planet-table td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #1a1a3a;
  color: #e0e0e0;
  font-family: monospace;
}

.planet-name-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.planet-parent {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #6e8090;
}

.catalog-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.catalog-chip--mainworld {
  background: rgba(47, 125, 80, 0.18);
  color: #1f6a40;
}

.catalog-chip--moon {
  background: rgba(34, 95, 143, 0.14);
  color: #215c86;
}

.catalog-status-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.catalog-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.catalog-status--present {
  background: rgba(107, 207, 127, 0.16);
  color: #7de091;
}

.catalog-status--absent {
  background: rgba(255, 255, 255, 0.08);
  color: #b8c0cc;
}

.catalog-status--historic {
  background: rgba(255, 217, 61, 0.14);
  color: #ffd93d;
}

.catalog-status-meta {
  color: #7f93a5;
  font-size: 0.72rem;
}

.planet-table tr.habitable td {
  background: rgba(107, 207, 127, 0.07);
}

.planet-table tr.selectable {
  cursor: pointer;
}

.planet-table tr.selectable:hover td {
  background: rgba(0, 217, 255, 0.08);
}

.planet-table tr.selected td {
  background: rgba(0, 217, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(0, 217, 255, 0.35);
}

.zone-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: capitalize;
}

.zone-badge.hot {
  background: #ff6b6b33;
  color: #ff6b6b;
}
.zone-badge.habitable {
  background: #6bcf7f33;
  color: #6bcf7f;
}
.zone-badge.warm {
  background: #ffd93d33;
  color: #ffd93d;
}
.zone-badge.cold {
  background: #6b9fff33;
  color: #6b9fff;
}
.zone-badge.frozen {
  background: #bcd8ff33;
  color: #bcd8ff;
}

.empty-state {
  color: #555;
  font-style: italic;
  padding: 1rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.selected-world-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.12);
  border: 1px solid rgba(0, 217, 255, 0.25);
  color: #aeefff;
  font-size: 0.85rem;
}
</style>
