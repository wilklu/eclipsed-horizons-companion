<template>
  <div class="world-builder">
    <LoadingSpinner :isVisible="isLoading" :message="loadingMessage" />
    <SurveyNavigation
      currentClass="Classes II–IV – World Builder"
      :back-route="backRoute"
      @regenerate="regenerateWorld"
      @export="exportWorld"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>World Name:</label>
          <div class="name-row">
            <input v-model="worldName" placeholder="Enter world name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>Load Existing World:</label>
          <select v-model="selectedWorldId" class="select-input" @change="loadSelectedWorld">
            <option value="">Select a saved world...</option>
            <option v-for="entry in worldOptions" :key="entry.worldId" :value="entry.worldId">{{ entry.label }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Primary Star Class:</label>
          <select v-model="starClass" class="select-input">
            <option value="random">🎲 Random</option>
            <option value="O">O – Blue</option>
            <option value="B">B – Blue-white</option>
            <option value="A">A – White</option>
            <option value="F">F – Yellow-white</option>
            <option value="G">G – Yellow (Sun-like)</option>
            <option value="K">K – Orange</option>
            <option value="M">M – Red dwarf</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateWorld">⚡ Generate World</button>
        </div>
      </div>

      <div v-if="!hasSystemContext" class="context-hint warning">
        No system is selected. Open this page from Star System Builder to load and save worlds in context.
      </div>
      <div v-else-if="!hasSavedWorlds && !world" class="context-hint">
        No saved worlds found for this system yet. Generate your first world to continue.
      </div>
      <div v-if="activeTemperatureScenarioSettings" class="context-hint">
        Seasonal context inherited from system analysis: day {{ activeTemperatureScenarioSettings.dateSolarDays }} of
        {{ activeTemperatureScenarioSettings.solarDaysPerYear }} solar days.
      </div>

      <!-- World Profile -->
      <div v-if="world" class="world-display">
        <div class="world-header">
          <div class="world-icon">🌍</div>
          <div>
            <h2>{{ world.name }}</h2>
            <div class="uwp-display">
              <span class="uwp-label">Universal World Profile:</span>
              <span class="uwp-code">{{ world.uwp }}</span>
            </div>
          </div>
        </div>

        <div class="world-grid">
          <!-- Class II: Physical Survey -->
          <section class="world-section">
            <h3>🔬 Class II – Physical Survey</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Size:</span>
                <span class="prop-value">{{ world.size }} ({{ world.diameterKm.toLocaleString() }} km)</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Atmosphere:</span>
                <span class="prop-value">{{ world.atmosphereCode }} — {{ world.atmosphereDesc }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Hydrographics:</span>
                <span class="prop-value">{{ world.hydrographics }}0 % surface water</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Gravity:</span>
                <span class="prop-value">{{ world.gravity }} G</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Temperature:</span>
                <span class="prop-value">{{ temperatureDisplayText }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Density:</span>
                <span class="prop-value">{{ world.density?.toFixed(2) }} (relative to water)</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">System Age:</span>
                <span class="prop-value">{{ world.systemAgeGyr?.toFixed(1) }} Gyr</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Seismic Activity:</span>
                <span class="prop-value"
                  >{{ world.seismicStress }} - {{ seismicStressCategory(world.seismicStress) }}</span
                >
              </div>
              <div class="prop-row">
                <span class="prop-label">Tidal Stress Factor:</span>
                <span class="prop-value"
                  >{{ world.tidalStressFactor }} ({{
                    Number.isFinite(world.totalTidalEffectsMeters) ? world.totalTidalEffectsMeters.toFixed(2) : "0.00"
                  }}
                  m total tides)</span
                >
              </div>
              <div class="prop-row">
                <span class="prop-label">Tidal Heating Factor:</span>
                <span class="prop-value">{{ world.tidalHeatingFactor }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Total Seismic Stress:</span>
                <span class="prop-value"
                  >{{ world.totalSeismicStress }} — {{ seismicStressCategory(world.totalSeismicStress) }}</span
                >
              </div>
              <div class="prop-row">
                <span class="prop-label">Major Tectonic Plates:</span>
                <span class="prop-value">{{ world.majorTectonicPlates > 0 ? world.majorTectonicPlates : "None" }}</span>
              </div>
            </div>
          </section>

          <!-- Class III: System Survey -->
          <section class="world-section">
            <h3>📡 Class III – System Survey</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Orbital Period:</span>
                <span class="prop-value">{{ world.orbitalPeriodDays }} days</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Day Length:</span>
                <span class="prop-value">{{ world.dayLengthHours }} hours</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Axial Tilt:</span>
                <span class="prop-value">{{ world.axialTilt }}°</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Moons:</span>
                <span class="prop-value">{{ world.moons }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Magnetosphere:</span>
                <span class="prop-value">{{ world.magnetosphere }}</span>
              </div>
              <div v-if="world.temperatureScenarioSettings" class="prop-row">
                <span class="prop-label">Seasonal Context:</span>
                <span class="prop-value">{{
                  formatTemperatureScenarioSettings(world.temperatureScenarioSettings)
                }}</span>
              </div>
            </div>
          </section>

          <!-- Class IV: Census Survey -->
          <section class="world-section">
            <h3>👥 Class IV – Census Survey</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Population:</span>
                <span class="prop-value">{{ world.populationCode }} — {{ formatPop(world.population) }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Government:</span>
                <span class="prop-value">{{ world.governmentCode }} — {{ world.governmentDesc }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Law Level:</span>
                <span class="prop-value">{{ world.lawLevel }} — {{ world.lawDesc }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Tech Level:</span>
                <span class="prop-value">{{ world.techLevel }} — {{ world.techDesc }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Starport:</span>
                <span class="prop-value">{{ world.starport }} — {{ world.starportDesc }}</span>
              </div>
            </div>
          </section>

          <!-- Trade Codes -->
          <section class="world-section">
            <h3>🏷️ Trade Codes</h3>
            <div v-if="world.tradeCodes.length" class="trade-codes">
              <span v-for="code in world.tradeCodes" :key="code" class="trade-badge">{{ code }}</span>
            </div>
            <div v-else class="empty-state">No trade codes applicable.</div>
          </section>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="goToSophontGenerator">🧬 Sophont Generator →</button>
          <button class="btn btn-primary" @click="goToHistoryGenerator">📜 History Generator →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { useWorldStore } from "../../stores/worldStore.js";
import { getSystem } from "../../api/systemApi.js";
import * as toastService from "../../utils/toast.js";
import {
  calculateResidualSeismicStress,
  calculateTectonicPlates,
  calculateTidalStressFactor,
  calculateTotalSeismicStress,
} from "../../utils/worldGenerator.js";
import { buildGeneratedSurveyPayload, deriveSystemGenerationContext } from "../../utils/worldBuilderPayload.js";

const props = defineProps({ systemId: { type: String, default: null } });
const router = useRouter();
const route = useRoute();
const worldStore = useWorldStore();
const backRoute = computed(() => ({
  name: "StarSystemBuilder",
  params: {
    galaxyId: route.query.galaxyId || "000",
    sectorId: route.query.sectorId || "sector",
  },
}));
const DEFAULT_TEMPERATURE_SCENARIO_DATE_SOLAR_DAYS = 91;
const DEFAULT_TEMPERATURE_SCENARIO_SOLAR_DAYS_PER_YEAR = 365;

// ── Tables ────────────────────────────────────────────────────────────────────
const ATMOSPHERE_TABLE = {
  0: "Vacuum",
  1: "Trace",
  2: "Very Thin, Tainted",
  3: "Very Thin",
  4: "Thin, Tainted",
  5: "Thin",
  6: "Standard",
  7: "Standard, Tainted",
  8: "Dense",
  9: "Dense, Tainted",
  10: "Exotic",
  11: "Corrosive",
  12: "Insidious",
  15: "Dense, High",
};

const GOVERNMENT_TABLE = {
  0: "No Government",
  1: "Company/Corporation",
  2: "Participating Democracy",
  3: "Self-Perpetuating Oligarchy",
  4: "Representative Democracy",
  5: "Feudal Technocracy",
  6: "Captive Government",
  7: "Balkanization",
  8: "Civil Service Bureaucracy",
  9: "Impersonal Bureaucracy",
  10: "Charismatic Dictator",
  11: "Non-Charismatic Leader",
  12: "Charismatic Oligarchy",
  13: "Religious Dictatorship",
};

const LAW_TABLE = {
  0: "No Law",
  1: "Body pistols, explosives prohibited",
  2: "Portable energy weapons prohibited",
  3: "Machine guns, automatic rifles prohibited",
  4: "Light assault weapons prohibited",
  5: "Personal concealable weapons prohibited",
  6: "All firearms except shotguns prohibited",
  7: "Shotguns prohibited",
  8: "Long bladed weapons controlled",
  9: "All weapons prohibited",
};

const TECH_TABLE = {
  0: "Primitive",
  1: "Primitive",
  2: "Pre-Industrial",
  3: "Pre-Industrial",
  4: "Industrial",
  5: "Industrial",
  6: "Pre-Stellar",
  7: "Pre-Stellar",
  8: "Stellar",
  9: "Stellar",
  10: "High Stellar",
  11: "High Stellar",
  12: "Average Imperial",
  13: "Average Imperial",
  14: "High Imperial",
  15: "Experimental",
};

const STARPORT_TABLE = {
  A: "Excellent — Refined fuel, Shipyard (any)",
  B: "Good — Refined fuel, Shipyard (small craft)",
  C: "Routine — Unrefined fuel, no shipyard",
  D: "Poor — Unrefined fuel, limited repair",
  E: "Frontier — No facilities",
  X: "No starport",
};

const WORLD_NAMES = [
  "Arrakis",
  "Hestia",
  "Lycan",
  "Varna",
  "Oxtus",
  "Theron",
  "Velan",
  "Korreth",
  "Solvaris",
  "Durath",
  "Mirela",
  "Ashford",
  "Phaedra",
  "Calyx",
  "Numeria",
];

const ALLOWED_TRADE_CODES = new Set([
  "Ag",
  "As",
  "Ba",
  "De",
  "Fl",
  "Ga",
  "Hi",
  "Ht",
  "Ic",
  "In",
  "Lo",
  "Na",
  "Ni",
  "Po",
  "Ri",
  "Wa",
  "Va",
]);

// ── State ─────────────────────────────────────────────────────────────────────
const worldName = ref("");
const starClass = ref("random");
const selectedWorldId = ref("");
const world = ref(null);
const systemGenerationContext = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");

const worldOptions = computed(() =>
  worldStore.worlds.map((entry) => ({
    worldId: entry.worldId,
    label: buildWorldLabel(entry),
  })),
);
const hasSavedWorlds = computed(() => worldOptions.value.length > 0);
const hasSystemContext = computed(() => Boolean(props.systemId));
const inheritedTemperatureScenarioSettings = computed(() =>
  resolveTemperatureScenarioSettings({
    dateSolarDays: route.query.temperatureScenarioDateSolarDays,
    solarDaysPerYear: route.query.temperatureScenarioSolarDaysPerYear,
  }),
);
const activeTemperatureScenarioSettings = computed(
  () => world.value?.temperatureScenarioSettings ?? inheritedTemperatureScenarioSettings.value,
);

const temperatureDisplayText = computed(() => {
  if (!world.value) return "";
  const { tempCategory, avgTempC, meanTempC, seasonalTempOffsetC } = world.value;
  if (seasonalTempOffsetC && seasonalTempOffsetC !== 0 && Number.isFinite(meanTempC)) {
    const sign = seasonalTempOffsetC > 0 ? "+" : "";
    return `${tempCategory} (${avgTempC}°C seasonal; mean ${meanTempC}°C, ${sign}${seasonalTempOffsetC}°C)`;
  }
  return `${tempCategory} (avg ${avgTempC}°C)`;
});

function seismicStressCategory(stress) {
  const n = Number(stress);
  if (!Number.isFinite(n) || n <= 0) return "Geologically Dead";
  if (n <= 4) return "Minimal";
  if (n <= 16) return "Low";
  if (n <= 36) return "Moderate";
  if (n <= 64) return "High";
  return "Extreme";
}

const loadingMessage = computed(() => (loadingMode.value === "load" ? "Loading world..." : "Building world..."));

// Update page title dynamically
watchEffect(() => {
  if (world.value && world.value.name) {
    document.title = `World: ${world.value.name} | Eclipsed Horizons`;
  } else {
    document.title = "World Builder | Eclipsed Horizons";
  }
});

watch(
  () => props.systemId,
  async (systemId) => {
    await initializeWorldSelection(systemId);
  },
  { immediate: true },
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function d6(n = 2) {
  let total = 0;
  for (let i = 0; i < n; i++) total += 1 + Math.floor(Math.random() * 6);
  return total;
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function toHex(n) {
  if (n < 10) return String(n);
  return String.fromCharCode(65 + n - 10);
}

function formatPop(pop) {
  if (pop >= 1e12) return (pop / 1e12).toFixed(1) + " trillion";
  if (pop >= 1e9) return (pop / 1e9).toFixed(1) + " billion";
  if (pop >= 1e6) return (pop / 1e6).toFixed(1) + " million";
  if (pop >= 1e3) return (pop / 1e3).toFixed(1) + " thousand";
  if (pop === 0) return "Uninhabited";
  return pop.toLocaleString();
}

const STAR_TEMP_MOD = { O: +4, B: +3, A: +2, F: +1, G: 0, K: -1, M: -2 };

function hexDigitToNumber(value) {
  const token = String(value || "0")
    .trim()
    .toUpperCase();
  if (!token) return 0;
  const code = token.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 65 && code <= 70) return code - 55;
  return 0;
}

function temperatureCategoryFromApi(temp) {
  switch (String(temp || "").toLowerCase()) {
    case "frozen":
      return "Frozen";
    case "cold":
      return "Cold";
    case "temperate":
      return "Temperate";
    case "tropical":
      return "Hot";
    case "hot":
      return "Scorching";
    default:
      return "Temperate";
  }
}

function avgTempFromApi(temp) {
  switch (String(temp || "").toLowerCase()) {
    case "frozen":
      return -80;
    case "cold":
      return -10;
    case "temperate":
      return 15;
    case "tropical":
      return 38;
    case "hot":
      return 70;
    default:
      return 15;
  }
}

function buildWorldLabel(entry) {
  const name = String(entry?.name || "Unnamed");
  const uwp = String(entry?.uwp || "").trim();
  return uwp ? `${name} (${uwp})` : `${name} (${entry.worldId})`;
}

function resolveTemperatureScenarioSettings(rawSettings = null) {
  const rawSolarDaysPerYear = Number(rawSettings?.solarDaysPerYear);
  const rawDateSolarDays = Number(rawSettings?.dateSolarDays);
  const hasSolarDaysPerYear = Number.isFinite(rawSolarDaysPerYear) && rawSolarDaysPerYear > 0;
  const hasDateSolarDays = Number.isFinite(rawDateSolarDays) && rawDateSolarDays >= 0;

  if (!hasSolarDaysPerYear && !hasDateSolarDays) {
    return null;
  }

  const solarDaysPerYear = hasSolarDaysPerYear
    ? Math.max(1, Math.round(rawSolarDaysPerYear))
    : DEFAULT_TEMPERATURE_SCENARIO_SOLAR_DAYS_PER_YEAR;
  let dateSolarDays = hasDateSolarDays
    ? Math.max(0, Math.round(rawDateSolarDays))
    : DEFAULT_TEMPERATURE_SCENARIO_DATE_SOLAR_DAYS;

  if (dateSolarDays >= solarDaysPerYear) {
    dateSolarDays %= solarDaysPerYear;
  }

  return { dateSolarDays, solarDaysPerYear };
}

function formatTemperatureScenarioSettings(settings) {
  if (!settings) {
    return "None";
  }

  return `Day ${settings.dateSolarDays} / ${settings.solarDaysPerYear}`;
}

function buildForwardQuery(worldId = "") {
  const query = {
    worldId,
    systemId: props.systemId || "",
    galaxyId: route.query.galaxyId || "",
    sectorId: route.query.sectorId || "",
  };

  const settings = activeTemperatureScenarioSettings.value;
  if (settings) {
    query.temperatureScenarioDateSolarDays = String(settings.dateSolarDays);
    query.temperatureScenarioSolarDaysPerYear = String(settings.solarDaysPerYear);
  }

  return query;
}

function hydrateWorldFromPersisted(persistedWorld) {
  const physical = persistedWorld?.physical || {};
  const census = persistedWorld?.census || {};
  const metadata = persistedWorld?.metadata || {};
  const survey = metadata.generatedSurvey || {};
  const temperatureScenarioSettings = resolveTemperatureScenarioSettings(survey.temperatureScenarioSettings);
  const systemContext = systemGenerationContext.value || {};

  const size = hexDigitToNumber(physical.size);
  const atmosphereCode = hexDigitToNumber(physical.atmosphere);
  const hydrographics = hexDigitToNumber(physical.hydrographics);
  const populationCode = hexDigitToNumber(census.population);
  const governmentCode = hexDigitToNumber(census.government);
  const lawLevel = hexDigitToNumber(census.lawLevel);
  const techLevel = Number(census.techLevel) || 0;
  const fallbackSystemAgeGyr = Number.isFinite(systemContext.systemAgeGyr) ? systemContext.systemAgeGyr : 4.5;
  const fallbackDensity = Number.isFinite(systemContext.density) ? systemContext.density : 1;
  const fallbackMoonCount = Number.isFinite(systemContext.moonCountDefault)
    ? clamp(Math.round(systemContext.moonCountDefault), 0, 12)
    : Number(survey.moons || 0);
  const fallbackMoonPool = Array.isArray(systemContext.moonSizesPool)
    ? systemContext.moonSizesPool.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry) && entry > 0)
    : [];
  const fallbackTotalTidalEffectsMeters = Number.isFinite(systemContext.totalTidalEffectsMeters)
    ? systemContext.totalTidalEffectsMeters
    : 0;
  const fallbackTidalStressFactor = Number.isFinite(systemContext.tidalStressFactor)
    ? systemContext.tidalStressFactor
    : calculateTidalStressFactor({ totalTidalEffectsMeters: fallbackTotalTidalEffectsMeters }) || 0;
  const fallbackTidalHeatingFactor = Number.isFinite(systemContext.tidalHeatingFactor)
    ? systemContext.tidalHeatingFactor
    : 0;
  const generatedMoonSizes = Array.isArray(survey.moonSizes)
    ? survey.moonSizes
    : fallbackMoonPool.length > 0
      ? Array.from({ length: fallbackMoonCount }, (_, index) => fallbackMoonPool[index % fallbackMoonPool.length])
      : Array.from({ length: fallbackMoonCount }, () => 1);

  return {
    persistedWorldId: persistedWorld.worldId,
    name: persistedWorld.name,
    uwp: persistedWorld.uwp,
    size,
    diameterKm: size === 0 ? 800 : size * 1600,
    gravity: Number(physical.gravity) || +(size * 0.1 + 0.05).toFixed(2),
    atmosphereCode,
    atmosphereDesc: ATMOSPHERE_TABLE[atmosphereCode] ?? "Unusual",
    hydrographics,
    avgTempC: Number.isFinite(survey.avgTempC) ? survey.avgTempC : avgTempFromApi(physical.temperature),
    meanTempC: Number.isFinite(survey.meanTempC)
      ? survey.meanTempC
      : Number.isFinite(survey.avgTempC)
        ? survey.avgTempC
        : avgTempFromApi(physical.temperature),
    seasonalTempOffsetC: Number.isFinite(survey.seasonalTempOffsetC) ? survey.seasonalTempOffsetC : 0,
    tempCategory: survey.tempCategory || temperatureCategoryFromApi(physical.temperature),
    orbitalPeriodDays: survey.orbitalPeriodDays || Math.round(200 + Math.random() * 1200),
    dayLengthHours: survey.dayLengthHours || +(15 + Math.random() * 50).toFixed(1),
    axialTilt: survey.axialTilt || Math.round(Math.random() * 40),
    moons: survey.moons || 0,
    moonSizes: generatedMoonSizes,
    magnetosphere: survey.magnetosphere || "Unknown",
    density: Number.isFinite(survey.density) ? survey.density : fallbackDensity,
    systemAgeGyr: Number.isFinite(survey.systemAgeGyr) ? survey.systemAgeGyr : fallbackSystemAgeGyr,
    seismicStress: Number.isFinite(survey.seismicStress)
      ? survey.seismicStress
      : (
          calculateResidualSeismicStress({
            size,
            ageGyr: Number.isFinite(survey.systemAgeGyr) ? survey.systemAgeGyr : fallbackSystemAgeGyr,
            isMoon: false,
            moonSizes: generatedMoonSizes,
            density: Number.isFinite(survey.density) ? survey.density : fallbackDensity,
          }) || { stress: 0 }
        ).stress,
    seismicPreSquare: Number.isFinite(survey.seismicPreSquare) ? survey.seismicPreSquare : 0,
    seismicStressDm: Number.isFinite(survey.seismicStressDm) ? survey.seismicStressDm : 0,
    tidalEffectsMeters: Array.isArray(survey.tidalEffectsMeters) ? survey.tidalEffectsMeters : [],
    totalTidalEffectsMeters: Number.isFinite(survey.totalTidalEffectsMeters)
      ? survey.totalTidalEffectsMeters
      : fallbackTotalTidalEffectsMeters,
    tidalStressFactor: Number.isFinite(survey.tidalStressFactor) ? survey.tidalStressFactor : fallbackTidalStressFactor,
    tidalHeatingFactor: Number.isFinite(survey.tidalHeatingFactor)
      ? survey.tidalHeatingFactor
      : fallbackTidalHeatingFactor,
    totalSeismicStress: Number.isFinite(survey.totalSeismicStress)
      ? survey.totalSeismicStress
      : calculateTotalSeismicStress({
          seismicStress: Number.isFinite(survey.seismicStress) ? survey.seismicStress : 0,
          tidalStressFactor: Number.isFinite(survey.tidalStressFactor)
            ? survey.tidalStressFactor
            : fallbackTidalStressFactor,
          tidalHeatingFactor: Number.isFinite(survey.tidalHeatingFactor)
            ? survey.tidalHeatingFactor
            : fallbackTidalHeatingFactor,
        }),
    majorTectonicPlates: Number.isFinite(survey.majorTectonicPlates) ? survey.majorTectonicPlates : 0,
    temperatureScenarioSettings,
    populationCode,
    population: Number.isFinite(survey.populationEstimate)
      ? survey.populationEstimate
      : populationCode === 0
        ? 0
        : Math.round(Math.pow(10, populationCode)),
    governmentCode,
    governmentDesc: GOVERNMENT_TABLE[governmentCode] ?? "Unknown",
    lawLevel,
    lawDesc: LAW_TABLE[lawLevel] ?? "Unknown",
    techLevel,
    techDesc: TECH_TABLE[techLevel] ?? "Unknown",
    starport: persistedWorld.starport || "X",
    starportDesc: STARPORT_TABLE[persistedWorld.starport] ?? "Unknown",
    tradeCodes: Array.isArray(persistedWorld.tradeCodes) ? persistedWorld.tradeCodes : [],
  };
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function loadSelectedWorld() {
  if (!selectedWorldId.value) {
    return;
  }
  await loadPersistedWorld(selectedWorldId.value, true);
}

async function loadPersistedWorld(worldId, showToast = false) {
  const persisted = worldStore.worlds.find((entry) => entry.worldId === worldId);
  if (!persisted) {
    toastService.error("Selected world could not be found.");
    return;
  }

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    world.value = hydrateWorldFromPersisted(persisted);
    worldName.value = world.value.name;
    worldStore.setCurrentWorld(worldId);
    if (showToast) {
      toastService.success(`Loaded world ${world.value.name}.`);
    }
  } finally {
    isLoading.value = false;
    loadingMode.value = "generate";
  }
}

async function loadSystemGenerationContext(systemId) {
  systemGenerationContext.value = null;

  if (!systemId) {
    return;
  }

  try {
    const persistedSystem = await getSystem(systemId);
    systemGenerationContext.value = deriveSystemGenerationContext(persistedSystem);
  } catch {
    systemGenerationContext.value = null;
  }
}

async function initializeWorldSelection(systemId) {
  world.value = null;
  selectedWorldId.value = "";

  await loadSystemGenerationContext(systemId);

  if (!systemId) {
    return;
  }

  await worldStore.loadWorlds(systemId);
  if (worldStore.error) {
    toastService.error(`Failed to load worlds: ${worldStore.error}`);
    return;
  }

  const currentWorld = worldStore.worlds.find((entry) => entry.worldId === worldStore.currentWorldId);
  const fallbackWorld = worldStore.worlds[0];
  const initialWorld = currentWorld ?? fallbackWorld;
  if (initialWorld) {
    selectedWorldId.value = initialWorld.worldId;
    await loadPersistedWorld(initialWorld.worldId, false);
  }
}

function randomizeName() {
  worldName.value = WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)];
}

async function generateWorld() {
  if (!props.systemId) {
    toastService.error("No system selected. Please generate/select a system first.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    // Use setTimeout to show loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const star =
      starClass.value === "random"
        ? ["O", "B", "A", "F", "G", "G", "G", "K", "K", "M", "M", "M"][Math.floor(Math.random() * 12)]
        : starClass.value;

    const tempMod = STAR_TEMP_MOD[star] ?? 0;

    const size = clamp(d6() - 2, 0, 10);
    const atmoRaw = clamp(d6() - 7 + size, 0, 15);
    const atmosphereCode = atmoRaw;
    const atmosphereDesc = ATMOSPHERE_TABLE[atmoRaw] ?? "Unusual";
    const hydrographics = atmoRaw === 0 || atmoRaw === 1 ? 0 : clamp(d6() - 7 + atmoRaw, 0, 10);

    const popCode = clamp(d6() - 2, 0, 12);
    const population = popCode === 0 ? 0 : Math.round(Math.pow(10, popCode) * (0.5 + Math.random()));
    const governmentCode = clamp(d6() - 7 + popCode, 0, 13);
    const governmentDesc = GOVERNMENT_TABLE[governmentCode] ?? "Unknown";
    const lawLevel = clamp(d6() - 7 + governmentCode, 0, 9);
    const lawDesc = LAW_TABLE[lawLevel] ?? "Unknown";

    const starportRoll = d6();
    const starportCode =
      starportRoll <= 2
        ? "X"
        : starportRoll <= 4
          ? "E"
          : starportRoll <= 6
            ? "D"
            : starportRoll <= 8
              ? "C"
              : starportRoll <= 10
                ? "B"
                : "A";

    let techBase = d6(1);
    if (starportCode === "A") techBase += 6;
    else if (starportCode === "B") techBase += 4;
    else if (starportCode === "C") techBase += 2;
    if (size <= 1) techBase += 2;
    else if (size <= 4) techBase += 1;
    if (atmosphereCode <= 3 || atmosphereCode >= 10) techBase += 1;
    if (hydrographics === 0 || hydrographics >= 9) techBase += 1;
    if (popCode >= 9) techBase += 2;
    else if (popCode >= 1) techBase += 1;
    if (governmentCode === 0 || governmentCode === 5) techBase += 1;
    const techLevel = clamp(techBase - 1, 0, 15);

    // Trade codes
    const tradeCodes = [];
    if (atmoRaw >= 4 && atmoRaw <= 9 && hydrographics >= 4 && hydrographics <= 8 && popCode >= 5 && popCode <= 7)
      tradeCodes.push("Ag");
    if (size === 0 && atmoRaw === 0 && hydrographics === 0) tradeCodes.push("As");
    if (popCode === 0 && governmentCode === 0 && lawLevel === 0) tradeCodes.push("Ba");
    if (atmoRaw >= 2 && hydrographics === 0) tradeCodes.push("De");
    if (atmoRaw >= 10 && hydrographics >= 1) tradeCodes.push("Fl");
    if (size >= 6 && (atmoRaw === 5 || atmoRaw === 6 || atmoRaw === 8) && hydrographics >= 5) tradeCodes.push("Ga");
    if (popCode >= 9) tradeCodes.push("Hi");
    if (techLevel >= 12) tradeCodes.push("Ht");
    if (hydrographics >= 1 && hydrographics <= 5 && atmoRaw <= 3) tradeCodes.push("Ic");
    if ((atmoRaw <= 2 || atmoRaw === 4 || atmoRaw === 7 || atmoRaw === 9) && popCode >= 9) tradeCodes.push("In");
    if (popCode >= 1 && popCode <= 3) tradeCodes.push("Lo");
    if (techLevel <= 5) tradeCodes.push("Lt");
    if (atmoRaw <= 3 && hydrographics <= 3 && popCode >= 6) tradeCodes.push("Na");
    if (popCode >= 4 && popCode <= 6) tradeCodes.push("Ni");
    if (atmoRaw >= 2 && atmoRaw <= 5 && hydrographics <= 3) tradeCodes.push("Po");
    if ((atmoRaw === 6 || atmoRaw === 8) && popCode >= 6 && governmentCode >= 4 && governmentCode <= 9)
      tradeCodes.push("Ri");
    if (hydrographics >= 10) tradeCodes.push("Wa");
    if (atmoRaw === 0) tradeCodes.push("Va");

    const normalizedTradeCodes = tradeCodes.filter((code) => ALLOWED_TRADE_CODES.has(code));

    const diameterKm = size === 0 ? 800 : size * 1600;
    const gravity = +(size * 0.1 + 0.05).toFixed(2);

    const { apiTemperature, ...surveyPayload } = buildGeneratedSurveyPayload({
      size,
      atmosphereCode: atmoRaw,
      hydrographics,
      starTempMod: tempMod,
      temperatureScenarioSettings: activeTemperatureScenarioSettings.value,
      systemContext: systemGenerationContext.value,
      rng: Math.random,
    });

    const { avgTempC, meanTempC, seasonalTempOffsetC, tempCategory } = surveyPayload;

    const uwp = `${starportCode}${toHex(size)}${toHex(atmosphereCode)}${toHex(hydrographics)}${toHex(popCode)}${toHex(governmentCode)}${toHex(lawLevel)}-${toHex(techLevel)}`;
    const generatedName = worldName.value || WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)];
    const orbitAU = +(0.2 + Math.random() * 12).toFixed(2);
    const now = new Date().toISOString();
    const worldId = `wld_${String(props.systemId).replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}`.slice(0, 50);
    const habitability =
      apiTemperature === "Temperate" && atmosphereCode >= 4 && atmosphereCode <= 9 && hydrographics >= 3
        ? "habitable"
        : apiTemperature === "Cold" || apiTemperature === "Tropical"
          ? "marginal"
          : "hostile";

    const worldPayload = {
      worldId,
      systemId: props.systemId,
      name: generatedName,
      orbit: orbitAU,
      uwp,
      physical: {
        size: toHex(size),
        gravity,
        atmosphere: toHex(atmosphereCode),
        hydrographics: toHex(hydrographics),
        temperature: apiTemperature,
      },
      census: {
        population: toHex(popCode),
        government: toHex(governmentCode),
        lawLevel: toHex(lawLevel),
        techLevel,
      },
      tradeCodes: normalizedTradeCodes,
      starport: starportCode,
      metadata: {
        createdAt: now,
        lastModified: now,
        habitability,
        generatedSurvey: {
          ...surveyPayload,
          populationEstimate: population,
        },
      },
    };

    const persistedWorld = await worldStore.createWorld(worldPayload);

    const generatedSurvey = worldPayload.metadata.generatedSurvey;

    world.value = {
      persistedWorldId: persistedWorld.worldId,
      name: generatedName,
      uwp,
      // Physical
      size,
      diameterKm,
      gravity,
      atmosphereCode,
      atmosphereDesc,
      hydrographics,
      avgTempC,
      meanTempC,
      seasonalTempOffsetC,
      tempCategory,
      // System
      orbitalPeriodDays: generatedSurvey.orbitalPeriodDays,
      dayLengthHours: generatedSurvey.dayLengthHours,
      axialTilt: generatedSurvey.axialTilt,
      moons: generatedSurvey.moons,
      moonSizes: generatedSurvey.moonSizes,
      magnetosphere: generatedSurvey.magnetosphere,
      density: generatedSurvey.density,
      systemAgeGyr: generatedSurvey.systemAgeGyr,
      seismicStress: generatedSurvey.seismicStress,
      seismicPreSquare: generatedSurvey.seismicPreSquare,
      seismicStressDm: generatedSurvey.seismicStressDm,
      tidalEffectsMeters: generatedSurvey.tidalEffectsMeters,
      totalTidalEffectsMeters: generatedSurvey.totalTidalEffectsMeters,
      tidalStressFactor: generatedSurvey.tidalStressFactor,
      tidalHeatingFactor: generatedSurvey.tidalHeatingFactor,
      totalSeismicStress: generatedSurvey.totalSeismicStress,
      majorTectonicPlates: generatedSurvey.majorTectonicPlates,
      temperatureScenarioSettings: generatedSurvey.temperatureScenarioSettings,
      // Census
      populationCode: popCode,
      population,
      governmentCode,
      governmentDesc,
      lawLevel,
      lawDesc,
      techLevel,
      techDesc: TECH_TABLE[techLevel] ?? "Unknown",
      starport: starportCode,
      starportDesc: STARPORT_TABLE[starportCode] ?? "Unknown",
      // Trade
      tradeCodes: normalizedTradeCodes,
    };

    selectedWorldId.value = persistedWorld.worldId;

    toastService.success(`World "${generatedName}" generated and saved.`);
  } catch (err) {
    toastService.error(`Failed to generate/save world: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function regenerateWorld() {
  if (world.value) generateWorld();
}

function exportWorld() {
  if (!world.value) return;
  const blob = new Blob([JSON.stringify(world.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${world.value.name.replace(/\s+/g, "-")}-World.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function goToSophontGenerator() {
  const worldId = world.value?.persistedWorldId || worldStore.currentWorldId || "";
  router.push({
    name: "SophontGenerator",
    query: buildForwardQuery(worldId),
  });
}

function goToHistoryGenerator() {
  const worldId = world.value?.persistedWorldId || worldStore.currentWorldId || "";
  router.push({
    name: "HistoryGenerator",
    query: buildForwardQuery(worldId),
  });
}
</script>

<style scoped>
.world-builder {
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
  min-width: 200px;
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

.context-hint.warning {
  border-color: #ffb347;
  background: rgba(255, 179, 71, 0.1);
  color: #ffd9a3;
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
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}
.btn-secondary {
  background: #444;
  color: #e0e0e0;
}
.btn-secondary:hover {
  background: #555;
}

/* World display */
.world-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.world-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.world-icon {
  font-size: 3rem;
}

.world-header h2 {
  color: #00d9ff;
  margin: 0 0 0.5rem;
}

.uwp-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.uwp-label {
  color: #888;
  font-size: 0.85rem;
}
.uwp-code {
  font-family: monospace;
  font-size: 1.2rem;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  padding: 0.3rem 0.75rem;
  border-radius: 0.25rem;
}

.world-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.world-section {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.world-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.prop-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.prop-row {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid #1a1a3a;
}
.prop-label {
  color: #00ffff;
  min-width: 150px;
  font-weight: bold;
}
.prop-value {
  color: #e0e0e0;
  font-family: monospace;
}

.trade-codes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.trade-badge {
  background: rgba(0, 217, 255, 0.15);
  color: #00d9ff;
  border: 1px solid #00d9ff44;
  padding: 0.3rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: bold;
  font-family: monospace;
}

.empty-state {
  color: #555;
  font-style: italic;
  padding: 0.5rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}
</style>
