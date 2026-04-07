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
    <SurveyNavigation
      currentClass="Stellar Survey"
      :back-route="backRoute"
      @regenerate="regenerateSystem"
      @export="exportSystem"
    />

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
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="buildSystem">⚡ Generate System + Worlds</button>
        </div>
      </div>

      <!-- System Display -->
      <div v-if="system" class="system-display">
        <div class="system-header">
          <h2>System {{ system.systemId }}</h2>
          <span class="system-type-badge">{{ system.stars.length > 1 ? "Multiple" : "Single" }} Star</span>
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
              <div class="star-designation">{{ star.designation }}</div>
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
                  <span class="prop-value">{{ star.temperatureK.toLocaleString() }} K</span>
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
          <h3>🌍 Habitable Zone</h3>
          <div class="hz-bar-wrapper">
            <div class="hz-labels">
              <span>Too Hot</span>
              <span class="hz-label">Habitable Zone</span>
              <span>Too Cold</span>
            </div>
            <div class="hz-bar">
              <div class="hz-region hz-hot" :style="{ width: '30%' }"></div>
              <div class="hz-region hz-zone" :style="{ width: '25%' }"></div>
              <div class="hz-region hz-cold" :style="{ width: '45%' }"></div>
            </div>
            <div class="hz-distances">
              <span>0 AU</span>
              <span>{{ system.habitableZone.innerAU }} AU</span>
              <span>{{ system.habitableZone.outerAU }} AU</span>
              <span>{{ system.habitableZone.frostLineAU }} AU</span>
            </div>
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
                  <th>Orbit (AU)</th>
                  <th>Zone</th>
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
                >
                  <td>{{ i + 1 }}</td>
                  <td>{{ planet.name }}</td>
                  <td>{{ planet.type }}</td>
                  <td>{{ planet.orbitAU }}</td>
                  <td>
                    <span class="zone-badge" :class="planet.zone">{{ planet.zone }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <div v-if="selectedWorldCandidate" class="selected-world-chip">
            Selected world: {{ selectedWorldCandidate.name }} · {{ selectedWorldCandidate.type }} ·
            {{ selectedWorldCandidate.zone }}
          </div>
          <button v-if="selectedWorldCandidate" class="btn btn-primary" @click="proceedToWorldBuilder">
            🌍 Build Selected World →
          </button>
        </div>
      </div>

      <div v-else class="system-placeholder">
        <h2>No Stellar Survey Yet</h2>
        <p>
          Hex {{ hexCoord }} has not been generated in Stellar Survey yet. Click Generate System + Worlds to create and
          save the stellar survey and world profiles for this location.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import * as sectorApi from "../../api/sectorApi.js";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { generateObjectName } from "../../utils/nameGenerator.js";
import {
  applyWorldProfileToPlanet,
  generateAutomaticWorldName,
  generateWorldProfile,
} from "../../utils/worldProfileGenerator.js";

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

const PLANET_TYPES = ["Rocky", "Super-Earth", "Gas Giant", "Ice Giant", "Dwarf Planet", "Asteroid Belt"];
const ORBIT_TYPES = ["Close", "Near", "Far", "Distant"];

// ── State ─────────────────────────────────────────────────────────────────────
const hexCoord = ref(route.query.hex ?? "0101");
const primarySpectral = ref(normalizePrimarySelection(route.query.star));
const multiplicity = ref("random");
const system = ref(null);
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
  targetLabel: () => system.value?.systemId || normalizeHex(hexCoord.value),
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
  if (primary?.isAnomaly) {
    return "anomaly-core";
  }

  const code = String(primary?.designation || primary?.spectralClass || systemRecord?.primaryStar?.spectralClass || "G")
    .trim()
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
          starType,
          starClass: sectorStarClassForSystem(systemRecord),
          secondaryStars,
          anomalyType: primary?.isAnomaly ? primary?.spectralClass || primary?.designation || null : null,
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
  const primary = stars[0] ? { ...stars[0] } : null;
  const companions = stars.slice(1).map((s) => ({ ...s }));

  return {
    ...nextSystem,
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
    metadata: {
      generatedSurvey: {
        stars,
      },
      lastModified: new Date().toISOString(),
    },
  };
}

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
      const existing = systemStore.findSystemByHex(props.galaxyId, persistedSectorId, hexCoord.value);
      if (existing?.stars?.length) {
        primarySpectral.value = normalizePrimarySelection(
          existing.stars[0]?.designation || existing.stars[0]?.spectralClass || existing?.primaryStar?.spectralClass,
        );
        multiplicity.value = multiplicityFromStars(existing.stars);
        system.value = {
          ...existing,
          systemId: normalizeHex(hexCoord.value),
        };
        selectedWorldIndex.value = resolveSelectedWorldIndex(existing.planets);
        systemStore.setCurrentSystem(existing.systemId);
        await syncSectorSurveyState(existing);
        return;
      }

      system.value = null;
      multiplicity.value = "random";
      selectedWorldIndex.value = null;
      systemStore.setCurrentSystem(null);
    },
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pickSpectral() {
  const weights = [0.00003, 0.0013, 0.006, 0.03, 0.076, 0.121, 0.765];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return SPECTRAL_TYPES[i];
  }
  return SPECTRAL_TYPES[SPECTRAL_TYPES.length - 1];
}

function buildStar(spectralEntry, role) {
  const dec = Math.floor(Math.random() * 10);
  const lumCls = role === "primary" ? "V" : Math.random() < 0.2 ? "III" : "V";
  const jitter = 0.85 + Math.random() * 0.3;
  return {
    designation: `${spectralEntry.code}${dec}${lumCls}`,
    spectralClass: `${spectralEntry.code}${dec} ${lumCls}`,
    massInSolarMasses: +(spectralEntry.mass * jitter).toFixed(2),
    luminosity: +(spectralEntry.lum * jitter).toFixed(3),
    temperatureK: Math.round(spectralEntry.temp * jitter),
    orbitType: role !== "primary" ? ORBIT_TYPES[Math.floor(Math.random() * ORBIT_TYPES.length)] : null,
  };
}

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

function calcHabitableZone(luminosity) {
  const inner = +Math.sqrt(luminosity / 1.1).toFixed(2);
  const outer = +Math.sqrt(luminosity / 0.53).toFixed(2);
  const frost = +(Math.sqrt(luminosity / 0.04) * 0.5).toFixed(2);
  return { innerAU: Math.max(inner, 0.01), outerAU: outer, frostLineAU: frost };
}

function planetZone(orbitAU, hz) {
  if (orbitAU < hz.innerAU) return "hot";
  if (orbitAU <= hz.outerAU) return "habitable";
  if (orbitAU <= hz.frostLineAU) return "warm";
  return "cold";
}

function buildPlanets(hz) {
  const count = 2 + Math.floor(Math.random() * 7);
  const orbits = [];
  const usedNames = new Set();
  let au = 0.3 + Math.random() * 0.4;
  for (let i = 0; i < count; i++) {
    const type = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
    const orbitAU = +au.toFixed(2);
    const name =
      type === "Asteroid Belt"
        ? generateObjectName({
            mode: String(preferencesStore.asteroidBeltNameMode || "phonotactic")
              .trim()
              .toLowerCase(),
            objectType: "asteroid-belt",
            mythicTheme: String(preferencesStore.galaxyMythicTheme || "all")
              .trim()
              .toLowerCase(),
          })
        : generateAutomaticWorldName({
            mode: preferencesStore.worldNameMode,
            usedNames,
          });
    usedNames.add(name);
    orbits.push({
      name,
      type,
      orbitAU,
      zone: planetZone(orbitAU, hz),
    });
    au = au * (1.5 + Math.random() * 0.8);
  }
  return orbits;
}

function isWorldBuilderCandidate(planet) {
  return Boolean(planet);
}

function findDefaultWorldIndex(planets) {
  if (!Array.isArray(planets) || !planets.length) return null;

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

// ── Actions ───────────────────────────────────────────────────────────────────
async function buildSystem() {
  const requestedPrimary = normalizePrimarySelection(primarySpectral.value);
  primarySpectral.value = requestedPrimary;

  const primaryEntry =
    requestedPrimary === "random"
      ? pickSpectral()
      : (PRIMARY_TYPE_OPTIONS.find((entry) => entry.code === requestedPrimary) ?? pickSpectral());
  const primaryIsAnomaly = ANOMALY_TYPES.some((entry) => entry.code === primaryEntry.code);

  let starCount = 1;
  if (multiplicity.value === "binary") starCount = 2;
  else if (multiplicity.value === "trinary") starCount = 3;
  else if (multiplicity.value === "random") {
    const r = Math.random();
    starCount = r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
  }

  const stars = [primaryIsAnomaly ? buildAnomalyPrimary(primaryEntry) : buildStar(primaryEntry, "primary")];
  for (let i = 1; i < starCount; i++) {
    stars.push(buildStar(pickSpectral(), "secondary"));
  }

  const hz = calcHabitableZone(stars[0].luminosity);
  const primaryWorldStarClass = stars[0]?.designation || stars[0]?.spectralClass || primarySpectral.value;
  const planets = buildPlanets(hz).map((planet) =>
    applyWorldProfileToPlanet(
      planet,
      generateWorldProfile({
        worldName: planet.name,
        starClass: primaryWorldStarClass,
        randomWorldName: () => planet.name,
      }),
    ),
  );

  const nextSystem = {
    systemId: hexCoord.value || "0000",
    stars,
    habitableZone: hz,
    planets,
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

onMounted(async () => {
  hexCoord.value = normalizeHex(hexCoord.value);
  await hydrateSystem();
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
  justify-content: flex-end;
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
