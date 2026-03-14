<template>
  <div class="star-system-builder">
    <LoadingSpinner :isVisible="isLoading" :message="loadingMessage" />
    <SurveyNavigation
      currentClass="Class I – Stellar Survey"
      :back-route="galaxyId ? { name: 'SectorSurvey', params: { galaxyId } } : { name: 'GalaxySurvey' }"
      @regenerate="regenerateSystem"
      @export="exportSystem"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>System Label:</label>
          <input v-model="systemLabelInput" placeholder="e.g. Zed" class="text-input" />
        </div>
        <div class="control-group">
          <label>Hex Coordinate:</label>
          <input v-model="hexCoord" placeholder="e.g. 0803" class="text-input" />
        </div>
        <div class="control-group">
          <label>Load Existing System:</label>
          <select v-model="selectedSystemId" class="select-input" @change="loadSelectedSystem">
            <option value="">Select a saved system...</option>
            <option v-for="entry in systemOptions" :key="entry.systemId" :value="entry.systemId">
              {{ entry.label }}
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>Primary Star Type:</label>
          <select v-model="primarySpectral" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="t in SPECTRAL_TYPES" :key="t.code" :value="t.code">{{ t.code }} — {{ t.label }}</option>
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
          <label>Scenario Date (Solar Days):</label>
          <input v-model.number="temperatureScenarioDateSolarDays" type="number" min="0" step="1" class="text-input" />
        </div>
        <div class="control-group">
          <label>Solar Days Per Year:</label>
          <input
            v-model.number="temperatureScenarioSolarDaysPerYear"
            type="number"
            min="1"
            step="1"
            class="text-input"
          />
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="buildSystem">⚡ Generate System</button>
        </div>
      </div>

      <div v-if="!hasSectorContext" class="context-hint warning">
        No sector is selected. Open this page from Sector Survey to load and save systems in context.
      </div>
      <div v-else-if="!hasSavedSystems && !system" class="context-hint">
        No saved systems found for this sector yet. Generate your first system to continue.
      </div>

      <!-- System Display -->
      <div v-if="system" class="system-display">
        <div class="system-header">
          <h2>System {{ system.systemLabel || system.systemId }}</h2>
          <span class="system-type-badge">{{ system.stars.length > 1 ? "Multiple" : "Single" }} Star</span>
        </div>

        <div class="profile-section">
          <h3>📡 System Profiles</h3>
          <div class="profile-row">
            <span class="profile-label">IISS Stellar</span>
            <code class="profile-value">{{ system.iissProfile || "—" }}</code>
          </div>
          <div class="profile-row">
            <span class="profile-label">Planetary Short</span>
            <code class="profile-value">{{ system.planetarySystemShortProfile || "—" }}</code>
          </div>
          <div class="profile-row">
            <span class="profile-label">Planetary Long</span>
            <code class="profile-value profile-value-long">{{ system.planetarySystemLongProfile || "—" }}</code>
          </div>
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
              <div class="star-designation-row">
                <div class="star-designation">{{ star.systemDesignation ?? star.designation }}</div>
                <div
                  class="designation-combined-chip"
                  v-if="
                    star.systemDesignationCombined &&
                    star.systemDesignationCombined.length > 1 &&
                    star.systemDesignationCombined !== (star.systemDesignation ?? star.designation)
                  "
                >
                  {{ star.systemDesignationCombined }}
                </div>
              </div>
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
                  <span class="prop-label">Abs. Magnitude:</span>
                  <span class="prop-value">{{ star.absoluteMagnitude ?? "—" }}</span>
                </div>
                <div class="prop">
                  <span class="prop-label">Temperature:</span>
                  <span class="prop-value">{{ star.temperatureK.toLocaleString() }} K</span>
                </div>
                <div class="prop">
                  <span class="prop-label">Color:</span>
                  <span
                    class="prop-color-chip"
                    :style="{ backgroundColor: star.visualColor || '#ffffff' }"
                    :title="star.spectralClass || 'Unknown'"
                  ></span>
                </div>
                <div class="prop" v-if="star.rotationPeriodDays">
                  <span class="prop-label">Rotation:</span>
                  <span class="prop-value">{{ star.rotationPeriodDays.toFixed(2) }} days</span>
                </div>
                <div class="prop" v-if="star.mainSequenceLifetimeGyr">
                  <span class="prop-label">MS Lifetime:</span>
                  <span class="prop-value">{{ star.mainSequenceLifetimeGyr.toFixed(2) }} Gyr</span>
                </div>
                <div class="prop" v-if="star.evolutionaryStatus">
                  <span class="prop-label">Evolution:</span>
                  <span class="prop-value"
                    >{{ star.evolutionaryStatus.status }} ({{ star.evolutionaryStatus.percentComplete }}%)</span
                  >
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
          <table v-else class="planet-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Designation</th>
                <th>Type</th>
                <th>Orbit (AU)</th>
                <th>Zone</th>
                <th>Year Length</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(planet, i) in system.planets" :key="i" :class="{ habitable: planet.zone === 'habitable' }">
                <td>{{ i + 1 }}</td>
                <td>{{ planet.name }}</td>
                <td>
                  <div>{{ planet.type }}</div>
                  <div v-if="planet.iissNote" class="planet-note">{{ planet.iissNote }}</div>
                  <div v-if="planet.moonNote" class="planet-note">{{ planet.moonNote }}</div>
                </td>
                <td>{{ planet.orbitAU }}</td>
                <td>
                  <span class="zone-badge" :class="planet.zone">{{ planet.zone }}</span>
                </td>
                <td>{{ formatPlanetYearLength(planet) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="mainworldCandidateSummary" class="candidates-section">
          <h3>🎯 Mainworld Candidates</h3>
          <div class="candidate-metadata">
            <span><strong>Candidates:</strong> {{ mainworldCandidateSummary.count }}</span>
            <span>
              <strong>HZ Orbit#:</strong>
              {{ mainworldCandidateSummary.habitableZone.innerOrbit }} to
              {{ mainworldCandidateSummary.habitableZone.outerOrbit }}
            </span>
            <span>
              <strong>Seasonal Date:</strong>
              {{ mainworldCandidateSummary.settings.dateSolarDays }} /
              {{ mainworldCandidateSummary.settings.solarDaysPerYear }}
            </span>
          </div>
          <div v-if="mainworldCandidateSummary.rows.length === 0" class="empty-state">
            No candidates were found inside the habitable zone.
          </div>
          <table v-else class="planet-table candidate-table">
            <thead>
              <tr>
                <th>Body</th>
                <th>Orbit#</th>
                <th>Region</th>
                <th>Mean K</th>
                <th>Daylight h</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in mainworldCandidateSummary.rows" :key="row.id">
                <td>{{ row.bodyLabel }}</td>
                <td>{{ row.orbit }}</td>
                <td>{{ row.region }}</td>
                <td>{{ row.meanTemperatureK }}</td>
                <td>{{ row.sunlightHours }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Step Trace -->
        <div class="trace-section">
          <h3>🧭 Generation Step Trace</h3>
          <div v-if="worldPlacementCounts" class="trace-counts">
            <div class="trace-count-card">
              <span>Total Worlds</span>
              <strong>{{ worldPlacementCounts.totalWorlds ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Gas Giants</span>
              <strong>{{ worldPlacementCounts.gasGiants ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Planetoid Belts</span>
              <strong>{{ worldPlacementCounts.planetoidBelts ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Terrestrials</span>
              <strong>{{ worldPlacementCounts.terrestrialPlanets ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Empty Orbits</span>
              <strong>{{ worldPlacementCounts.emptyOrbits ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Significant Moons</span>
              <strong>{{ worldPlacementCounts.significantMoons ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Ring Worlds</span>
              <strong>{{ worldPlacementCounts.ringWorlds ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Significant Rings</span>
              <strong>{{ worldPlacementCounts.significantRings ?? 0 }}</strong>
            </div>
            <div class="trace-count-card">
              <span>Insignificant Moons</span>
              <strong>{{ worldPlacementCounts.insignificantMoons ?? 0 }}</strong>
            </div>
          </div>
          <div v-if="stepTraceEntries.length" class="trace-cards">
            <article v-for="entry in stepTraceEntries" :key="entry.stepKey" class="trace-card">
              <div class="trace-card-header">
                <span class="trace-step-id">{{ entry.stepKey.toUpperCase() }}</span>
              </div>
              <p class="trace-summary">{{ entry.summary }}</p>
              <details class="trace-json">
                <summary>View raw step payload</summary>
                <pre>{{ formatTraceData(entry.payload) }}</pre>
              </details>
            </article>
          </div>
          <div v-else class="trace-empty-state">Step trace data is unavailable for this system.</div>
        </div>

        <!-- Actions -->
        <div class="action-buttons">
          <button v-if="canProceedToWorldBuilder" class="btn btn-primary" @click="proceedToWorldBuilder">
            🌍 Class II–IV World Builder →
          </button>
          <div v-if="system.persistedSystemId && !system.planets.length" class="system-hint">
            Loaded persisted system. Planet catalog details may be unavailable, but you can continue to World Builder.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { useSystemStore } from "../../stores/systemStore.js";
import * as toastService from "../../utils/toast.js";
import {
  applyDefaultPlanetDesignations,
  buildPlanetDesignationContext,
  DEFAULT_SYSTEM_LABEL,
  normalizeSystemDesignationLabel,
  resolvePlanetParentDesignation,
} from "../../utils/planetDesignation.js";
import {
  calculateAbsoluteMagnitude,
  calculateEvolutionaryStatus,
  calculateMainSequenceLifetime,
  calculatePlanetOrbitPeriodYears,
  convertOrbitNumberToAu,
  convertOrbitPeriodYearsToDays,
  convertOrbitPeriodYearsToHours,
  estimateRotationPeriod,
  estimateStarMassAndTemperature,
  generatePrimaryStar,
  generateStarSubtype,
  getStarVisualColor,
  toPersistedSpectralClass,
} from "../../utils/primaryStarGenerator.js";
import {
  formatIISSGasGiantNote,
  generateIISSProfile,
  generatePlanetarySystemProfiles,
} from "../../utils/iissProfileGenerator.js";
import { generateSystemWorldPlacement, identifyMainworldCandidates } from "../../utils/worldGenerator.js";

const props = defineProps({
  galaxyId: { type: String, default: null },
  sectorId: { type: String, default: null },
});
const router = useRouter();
const systemStore = useSystemStore();

// ── Constants ─────────────────────────────────────────────────────────────────
const SPECTRAL_TYPES = [
  { code: "O", label: "Blue — hot, massive" },
  { code: "B", label: "Blue-white" },
  { code: "A", label: "White" },
  { code: "F", label: "Yellow-white" },
  { code: "G", label: "Yellow (Sun-like)" },
  { code: "K", label: "Orange" },
  { code: "M", label: "Red dwarf" },
];

const SPECTRAL_PROFILES = {
  O: { mass: 40, lum: 100000, temp: 40000 },
  B: { mass: 10, lum: 10000, temp: 20000 },
  A: { mass: 2.0, lum: 25, temp: 8500 },
  F: { mass: 1.4, lum: 4, temp: 6700 },
  G: { mass: 1.0, lum: 1.0, temp: 5800 },
  K: { mass: 0.7, lum: 0.25, temp: 4500 },
  M: { mass: 0.3, lum: 0.04, temp: 3200 },
  L: { mass: 0.08, lum: 0.0008, temp: 2000 },
  T: { mass: 0.05, lum: 0.0001, temp: 1200 },
  Y: { mass: 0.02, lum: 0.00001, temp: 600 },
  WD: { mass: 0.6, lum: 0.01, temp: 9000 },
};

const LUMINOSITY_FACTORS = {
  Ia: { lum: 20000, mass: 22, temp: 0.95 },
  Ib: { lum: 5000, mass: 12, temp: 0.95 },
  II: { lum: 500, mass: 6, temp: 0.95 },
  III: { lum: 80, mass: 2.5, temp: 0.96 },
  IV: { lum: 8, mass: 1.2, temp: 0.98 },
  V: { lum: 1, mass: 1, temp: 1 },
  VI: { lum: 0.45, mass: 0.9, temp: 1.02 },
  D: { lum: 0.01, mass: 0.6, temp: 1.1 },
  BD: { lum: 0.001, mass: 0.2, temp: 0.6 },
};

const PECULIAR_PROFILES = {
  "Black Hole": { mass: 8, lum: 0, temp: 0 },
  Pulsar: { mass: 1.4, lum: 0.05, temp: 600000 },
  "Neutron Star": { mass: 1.5, lum: 0.02, temp: 700000 },
  Nebula: { mass: 0, lum: 0, temp: 50 },
  Protostar: { mass: 0.4, lum: 0.2, temp: 2500 },
  "Star Cluster": { mass: 5, lum: 250, temp: 5000 },
  Anomaly: { mass: 1, lum: 1, temp: 5800 },
};

const PERSISTED_SPECTRAL_TYPES = new Set(["O", "B", "A", "F", "G", "K", "M", "L", "T", "Y", "WD"]);

const PLANET_TYPES = ["Rocky", "Super-Earth", "Gas Giant", "Ice Giant", "Dwarf Planet", "Asteroid Belt"];
const ORBIT_TYPES = ["Close", "Near", "Far", "Distant"];
const SECONDARY_ZONE_DEFAULT_ORBITS = {
  close: 3,
  near: 8,
  far: 14,
};
const DEFAULT_TEMPERATURE_SCENARIO_DATE_SOLAR_DAYS = 91;
const DEFAULT_TEMPERATURE_SCENARIO_SOLAR_DAYS_PER_YEAR = 365;

function parsePrimarySpectralSelection(rawValue) {
  const value = String(rawValue || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (/^[OBAFGKM](?:\d(?:IA|IB|II|III|IV|V|VI)?|IA|IB|II|III|IV|V|VI)?$/.test(value)) {
    return value.charAt(0);
  }

  return "random";
}

// ── State ─────────────────────────────────────────────────────────────────────
const hexCoord = ref(router.currentRoute.value.query.hex ?? "0101");
const systemLabelInput = ref(String(router.currentRoute.value.query.name || "").trim() || hexCoord.value);
const primarySpectral = ref(parsePrimarySpectralSelection(router.currentRoute.value.query.star));
const multiplicity = ref("random");
const temperatureScenarioDateSolarDays = ref(DEFAULT_TEMPERATURE_SCENARIO_DATE_SOLAR_DAYS);
const temperatureScenarioSolarDaysPerYear = ref(DEFAULT_TEMPERATURE_SCENARIO_SOLAR_DAYS_PER_YEAR);
const selectedSystemId = ref("");
const system = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");

const systemOptions = computed(() =>
  systemStore.systems.map((entry) => ({
    systemId: entry.systemId,
    label: buildSystemLabel(entry),
  })),
);

const loadingMessage = computed(() => (loadingMode.value === "load" ? "Loading system..." : "Building star system..."));

const canProceedToWorldBuilder = computed(() => Boolean(system.value?.persistedSystemId));
const hasSavedSystems = computed(() => systemOptions.value.length > 0);
const hasSectorContext = computed(() => Boolean(props.galaxyId && props.sectorId));
const worldPlacementCounts = computed(() => system.value?.worldPlacement?.counts ?? null);
const stepTraceEntries = computed(() => {
  const steps = system.value?.worldPlacement?.steps;
  if (!steps || typeof steps !== "object") {
    return [];
  }

  return Object.entries(steps)
    .sort(([aKey], [bKey]) => {
      const aStep = parseStepNumber(aKey);
      const bStep = parseStepNumber(bKey);
      if (aStep !== bStep) return aStep - bStep;
      return aKey.localeCompare(bKey);
    })
    .map(([stepKey, payload]) => ({
      stepKey,
      payload,
      summary: summarizeStepTrace(stepKey, payload),
    }));
});
const mainworldCandidateSummary = computed(() => {
  const candidateResult = system.value?.mainworldCandidates;
  if (!candidateResult || !Array.isArray(candidateResult.candidates)) {
    return null;
  }

  const settings = resolveTemperatureScenarioSettings(system.value?.temperatureScenarioSettings);
  const habitableZone = candidateResult.habitableZone ?? { innerOrbit: "n/a", outerOrbit: "n/a" };
  const rows = candidateResult.candidates.slice(0, 16).map((candidate) => {
    const sunlightHours =
      candidate?.normalizedTemperatureScenarios?.seaLevel?.components?.timeOfDay?.sunlightModel?.sunlightHours;
    return {
      id: `${candidate.bodyLabel}-${candidate.orbit}`,
      bodyLabel: candidate.bodyLabel,
      orbit: Number.isFinite(candidate.orbit) ? Number(candidate.orbit).toFixed(2) : "n/a",
      region: candidate.temperatureRegionType ?? "n/a",
      meanTemperatureK: Number.isFinite(candidate.meanTemperatureK)
        ? Number(candidate.meanTemperatureK).toFixed(2)
        : "n/a",
      sunlightHours: Number.isFinite(sunlightHours) ? Number(sunlightHours).toFixed(2) : "n/a",
    };
  });

  return {
    count: candidateResult.candidates.length,
    habitableZone,
    settings,
    rows,
  };
});

// Update page title dynamically
watchEffect(() => {
  if (system.value && system.value.systemId) {
    document.title = `Star System: ${system.value.systemId} | Eclipsed Horizons`;
  } else {
    document.title = "Star System Builder | Eclipsed Horizons";
  }
});

watch(
  () => [props.galaxyId, props.sectorId],
  async ([galaxyId, sectorId]) => {
    await initializeSystemSelection(galaxyId, sectorId);
  },
  { immediate: true },
);

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

function buildStar(spectralCode, role, overrides = {}) {
  const profile = SPECTRAL_PROFILES[spectralCode] ?? SPECTRAL_PROFILES.G;
  const lumCls = overrides.luminosityClass ?? (role === "primary" ? "V" : Math.random() < 0.2 ? "III" : "V");
  const subtype = Number.isInteger(overrides.spectralDecimal)
    ? { subtype: overrides.spectralDecimal }
    : generateStarSubtype({
        spectralType: spectralCode,
        luminosityClass: lumCls,
        isPrimary: role === "primary",
        rng: Math.random,
        allowStraightSubtype: false,
      });
  const dec = subtype.subtype;
  const factors = LUMINOSITY_FACTORS[lumCls] ?? LUMINOSITY_FACTORS.V;
  const jitter = Number.isFinite(overrides.jitter) ? overrides.jitter : 0.85 + Math.random() * 0.3;
  const massTemp = estimateStarMassAndTemperature({
    spectralType: spectralCode,
    subtype: dec,
    luminosityClass: lumCls,
    rng: Math.random,
    applyMassVariance: overrides.applyMassVariance ?? true,
  });

  const designation = overrides.designation ?? `${spectralCode}${dec}${lumCls}`;
  const spectralClass = overrides.spectralClass ?? `${spectralCode}${dec} ${lumCls}`;

  return {
    designation,
    spectralClass,
    spectralType: spectralCode,
    luminosityClass: lumCls,
    objectType: overrides.objectType ?? "stellar",
    massInSolarMasses: +(massTemp?.massInSolarMasses ?? profile.mass * factors.mass * jitter).toFixed(3),
    luminosity: +(profile.lum * factors.lum * jitter).toFixed(5),
    temperatureK: Math.max(0, Math.round(massTemp?.temperatureK ?? profile.temp * factors.temp * jitter)),
    orbitType: role !== "primary" ? ORBIT_TYPES[Math.floor(Math.random() * ORBIT_TYPES.length)] : null,
  };
}

function buildPrimaryStar(primaryRoll) {
  if (primaryRoll.objectType === "peculiar") {
    const profile = PECULIAR_PROFILES[primaryRoll.designation] ?? PECULIAR_PROFILES.Anomaly;
    return {
      designation: primaryRoll.designation,
      spectralClass: primaryRoll.designation,
      spectralType: null,
      luminosityClass: null,
      objectType: "peculiar",
      massInSolarMasses: profile.mass,
      luminosity: profile.lum,
      temperatureK: profile.temp,
      orbitType: null,
      persistedSpectralClass: toPersistedSpectralClass(primaryRoll),
    };
  }

  if (primaryRoll.spectralType === "WD") {
    const profile = SPECTRAL_PROFILES.WD;
    return {
      designation: "WD",
      spectralClass: "WD",
      spectralType: "WD",
      luminosityClass: "D",
      objectType: primaryRoll.objectType,
      massInSolarMasses: +profile.mass.toFixed(2),
      luminosity: +profile.lum.toFixed(5),
      temperatureK: profile.temp,
      orbitType: null,
      persistedSpectralClass: "WD",
    };
  }

  const spectralCode = PERSISTED_SPECTRAL_TYPES.has(primaryRoll.spectralType) ? primaryRoll.spectralType : "G";
  return {
    ...buildStar(spectralCode, "primary", {
      designation: primaryRoll.designation,
      spectralClass: `${spectralCode}${primaryRoll.spectralDecimal ?? 0} ${primaryRoll.luminosityClass ?? "V"}`,
      spectralDecimal: primaryRoll.spectralDecimal,
      luminosityClass: primaryRoll.luminosityClass ?? "V",
      objectType: primaryRoll.objectType,
    }),
    persistedSpectralClass: toPersistedSpectralClass(primaryRoll),
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

function mapSlotTypeToPlanetType(slotType) {
  if (slotType === "gasGiant") return "Gas Giant";
  if (slotType === "planetoidBelt") return "Asteroid Belt";
  if (slotType === "terrestrialPlanet") return "Rocky";
  if (slotType === "mainworld") return "Rocky";
  return "World";
}

function resolveSystemDesignationLabel(rawLabel, fallbackLabel = DEFAULT_SYSTEM_LABEL) {
  return normalizeSystemDesignationLabel(rawLabel, fallbackLabel);
}

function normalizeSecondaryZoneForPeriods(zoneValue) {
  const normalized = String(zoneValue || "")
    .trim()
    .toLowerCase();

  if (normalized === "close") return "close";
  if (normalized === "near") return "near";
  if (normalized === "far" || normalized === "distant") return "far";
  if (normalized === "companion") return "near";
  return "near";
}

function deriveSecondaryOrbitNumberForPeriods(star, index) {
  const explicitOrbit = Number(star?.orbitNumber);
  if (Number.isFinite(explicitOrbit)) return explicitOrbit;

  const stellarOrbitNumber = Number(star?.stellarOrbitNumber);
  if (Number.isFinite(stellarOrbitNumber)) return stellarOrbitNumber;

  const separation = Number(star?.separation);
  const zone = normalizeSecondaryZoneForPeriods(star?.zone ?? star?.orbitType);
  if (Number.isFinite(separation) && separation > 0) {
    return Math.max(SECONDARY_ZONE_DEFAULT_ORBITS[zone], separation);
  }

  const base = SECONDARY_ZONE_DEFAULT_ORBITS[zone] ?? SECONDARY_ZONE_DEFAULT_ORBITS.near;
  return base + index * 0.3;
}

function buildSecondaryOrbitContextForPeriods(stars, worldPlacement) {
  const step1Allocations = Array.isArray(worldPlacement?.steps?.step1?.starAllocations)
    ? worldPlacement.steps.step1.starAllocations
    : [];
  const orbitByStarKey = new Map(
    step1Allocations
      .filter((entry) => entry?.starKey && entry.starKey !== "primary" && Number.isFinite(entry.orbitNumber))
      .map((entry) => [entry.starKey, Number(entry.orbitNumber)]),
  );

  return (Array.isArray(stars) ? stars.slice(1) : []).map((star, index) => {
    const key = `secondary-${index + 1}`;
    const mass = Number(star?.massInSolarMasses);
    const orbitNumber = orbitByStarKey.get(key);
    return {
      key,
      massInSolarMasses: Number.isFinite(mass) && mass > 0 ? mass : 0,
      orbitNumber: Number.isFinite(orbitNumber) ? orbitNumber : deriveSecondaryOrbitNumberForPeriods(star, index),
    };
  });
}

function resolveOrbitedStellarMassForPlanet(slot, stars, secondaryOrbitContext) {
  const primaryMass = Number(stars?.[0]?.massInSolarMasses);
  const safePrimaryMass = Number.isFinite(primaryMass) && primaryMass > 0 ? primaryMass : 0;
  const slotOrbitNumber = Number(slot?.orbit);
  const starKey = typeof slot?.starKey === "string" ? slot.starKey : "primary";

  if (starKey === "primary") {
    const interiorSecondaries = secondaryOrbitContext.filter(
      (secondary) =>
        secondary.massInSolarMasses > 0 &&
        Number.isFinite(slotOrbitNumber) &&
        Number.isFinite(secondary.orbitNumber) &&
        secondary.orbitNumber < slotOrbitNumber,
    );

    const totalMass =
      safePrimaryMass + interiorSecondaries.reduce((sum, secondary) => sum + secondary.massInSolarMasses, 0);
    return {
      massInSolarMasses: totalMass > 0 ? totalMass : null,
      orbitedStarCount: Math.max(1, 1 + interiorSecondaries.length),
    };
  }

  const secondary = secondaryOrbitContext.find((entry) => entry.key === starKey);
  if (secondary?.massInSolarMasses > 0) {
    return {
      massInSolarMasses: secondary.massInSolarMasses,
      orbitedStarCount: 1,
    };
  }

  return {
    massInSolarMasses: safePrimaryMass > 0 ? safePrimaryMass : null,
    orbitedStarCount: safePrimaryMass > 0 ? 1 : 0,
  };
}

function buildPlanetsFromWorldPlacement(worldPlacement, hz, stars = [], systemLabel = DEFAULT_SYSTEM_LABEL) {
  const slots = Array.isArray(worldPlacement?.slots) ? worldPlacement.slots : [];
  const secondaryOrbitContext = buildSecondaryOrbitContextForPeriods(stars, worldPlacement);
  const designationContext = buildPlanetDesignationContext(stars);
  const planetSlots = slots.filter((slot) => {
    if (!slot?.primaryWorldType) return false;
    if (slot.primaryWorldType === "emptyOrbit") return false;
    return true;
  });

  const planets = planetSlots.map((slot, index) => {
    const orbitAU = Number.isFinite(slot.orbit) ? convertOrbitNumberToAu({ orbitNumber: slot.orbit }) : null;
    const roundedOrbitAU = Number.isFinite(orbitAU) ? Number(orbitAU.toFixed(2)) : null;
    const orbitalContext = resolveOrbitedStellarMassForPlanet(slot, stars, secondaryOrbitContext);
    const parentContext = resolvePlanetParentDesignation(slot, secondaryOrbitContext, designationContext);
    const orbitalPeriodYears = calculatePlanetOrbitPeriodYears({
      orbitAu: orbitAU,
      interiorStellarMassInSolarMasses: orbitalContext.massInSolarMasses,
    });
    const orbitalPeriodDays = convertOrbitPeriodYearsToDays({ periodYears: orbitalPeriodYears });
    const orbitalPeriodHours = convertOrbitPeriodYearsToHours({ periodYears: orbitalPeriodYears });

    return {
      name: `World-${index + 1}`,
      type: mapSlotTypeToPlanetType(slot.primaryWorldType),
      orbitAU: roundedOrbitAU,
      zone: Number.isFinite(roundedOrbitAU) ? planetZone(roundedOrbitAU, hz) : "cold",
      starKey: slot.starKey,
      orbitNumber: slot.orbit,
      eccentricity: slot.eccentricity ?? null,
      sourceType: slot.primaryWorldType,
      isAnomalousSlot: Boolean(slot.isAnomalousSlot),
      hasMainworldSecondary: Array.isArray(slot.secondaryWorldTypes)
        ? slot.secondaryWorldTypes.includes("mainworld")
        : false,
      secondaryWorldTypes: Array.isArray(slot.secondaryWorldTypes) ? [...slot.secondaryWorldTypes] : [],
      parentDesignationKey: parentContext.parentKey,
      parentDesignation: parentContext.parentLabel,
      orbitalPeriodYears,
      orbitalPeriodDays,
      orbitalPeriodHours,
      orbitedMassInSolarMasses: orbitalContext.massInSolarMasses,
      orbitedStarCount: orbitalContext.orbitedStarCount,
      sizeCode: slot.sizeCode ?? null,
      gasGiantCategoryCode: slot.gasGiantCategoryCode ?? null,
      gasGiantDiameterCode: slot.gasGiantDiameterCode ?? null,
      gasGiantDiameterTerran: Number.isFinite(slot.gasGiantDiameterTerran) ? Number(slot.gasGiantDiameterTerran) : null,
      gasGiantMassEarth: Number.isFinite(slot.gasGiantMassEarth) ? Number(slot.gasGiantMassEarth) : null,
      significantMoonQuantity: Number.isFinite(slot.significantMoonQuantity)
        ? Number(slot.significantMoonQuantity)
        : null,
      hasSignificantRing: Boolean(slot.hasSignificantRing),
      significantMoonSizes: Array.isArray(slot.significantMoonSizes) ? [...slot.significantMoonSizes] : [],
      significantRingCount: Number.isFinite(slot.significantRingCount) ? Number(slot.significantRingCount) : 0,
      significantRingCode: slot.significantRingCode ?? null,
      insignificantMoonQuantity: Number.isFinite(slot.insignificantMoonQuantity)
        ? Number(slot.insignificantMoonQuantity)
        : null,
      iissNote: formatIISSGasGiantNote({
        sourceType: slot.primaryWorldType,
        sizeCode: slot.sizeCode,
        gasGiantCategoryCode: slot.gasGiantCategoryCode,
        gasGiantDiameterCode: slot.gasGiantDiameterCode,
        gasGiantDiameterTerran: slot.gasGiantDiameterTerran,
        gasGiantMassEarth: slot.gasGiantMassEarth,
      }),
      moonNote: formatSignificantMoonNote({
        significantMoonQuantity: slot.significantMoonQuantity,
        hasSignificantRing: slot.hasSignificantRing,
        significantMoonSizes: slot.significantMoonSizes,
        significantRingCode: slot.significantRingCode,
        insignificantMoonQuantity: slot.insignificantMoonQuantity,
      }),
    };
  });

  const designatedPlanets = applyDefaultPlanetDesignations(planets, { systemLabel });
  return applyDefaultMoonDesignations(designatedPlanets);
}

function enrichPersistedPlanetsWithOrbitalPeriods(
  planets,
  stars = [],
  worldPlacement = null,
  systemLabel = DEFAULT_SYSTEM_LABEL,
) {
  const persistedPlanets = Array.isArray(planets) ? planets : [];
  const secondaryOrbitContext = buildSecondaryOrbitContextForPeriods(stars, worldPlacement);
  const designationContext = buildPlanetDesignationContext(stars);

  const enrichedPlanets = persistedPlanets.map((planet) => {
    const orbitNumber = Number(planet?.orbitNumber);
    const orbitAU = Number.isFinite(planet?.orbitAU)
      ? Number(planet.orbitAU)
      : Number.isFinite(orbitNumber)
        ? convertOrbitNumberToAu({ orbitNumber })
        : null;

    const orbitalContext = resolveOrbitedStellarMassForPlanet(
      {
        starKey: planet?.starKey,
        orbit: Number.isFinite(orbitNumber) ? orbitNumber : null,
      },
      stars,
      secondaryOrbitContext,
    );

    const parentContext = resolvePlanetParentDesignation(
      {
        starKey: planet?.starKey,
        orbit: Number.isFinite(orbitNumber) ? orbitNumber : null,
      },
      secondaryOrbitContext,
      designationContext,
    );

    const existingPeriodYears = Number(planet?.orbitalPeriodYears);
    const orbitalPeriodYears = Number.isFinite(existingPeriodYears)
      ? existingPeriodYears
      : calculatePlanetOrbitPeriodYears({
          orbitAu: orbitAU,
          interiorStellarMassInSolarMasses: orbitalContext.massInSolarMasses,
        });

    const existingPeriodDays = Number(planet?.orbitalPeriodDays);
    const orbitalPeriodDays = Number.isFinite(existingPeriodDays)
      ? existingPeriodDays
      : convertOrbitPeriodYearsToDays({ periodYears: orbitalPeriodYears });

    const existingPeriodHours = Number(planet?.orbitalPeriodHours);
    const orbitalPeriodHours = Number.isFinite(existingPeriodHours)
      ? existingPeriodHours
      : convertOrbitPeriodYearsToHours({ periodYears: orbitalPeriodYears });

    return {
      ...planet,
      orbitalPeriodYears,
      orbitalPeriodDays,
      orbitalPeriodHours,
      parentDesignationKey: parentContext.parentKey,
      parentDesignation: parentContext.parentLabel,
      hasMainworldSecondary: Boolean(planet?.hasMainworldSecondary),
      secondaryWorldTypes: Array.isArray(planet?.secondaryWorldTypes) ? [...planet.secondaryWorldTypes] : [],
      orbitedMassInSolarMasses: orbitalContext.massInSolarMasses,
      orbitedStarCount: orbitalContext.orbitedStarCount,
      significantMoonQuantity: Number.isFinite(planet?.significantMoonQuantity)
        ? Number(planet.significantMoonQuantity)
        : null,
      hasSignificantRing: Boolean(planet?.hasSignificantRing),
      significantMoonSizes: Array.isArray(planet?.significantMoonSizes) ? [...planet.significantMoonSizes] : [],
      significantRingCount: Number.isFinite(planet?.significantRingCount) ? Number(planet.significantRingCount) : 0,
      significantRingCode: planet?.significantRingCode ?? null,
      insignificantMoonQuantity: Number.isFinite(planet?.insignificantMoonQuantity)
        ? Number(planet.insignificantMoonQuantity)
        : null,
      iissNote: formatIISSGasGiantNote({
        sourceType: planet?.sourceType,
        type: planet?.type,
        sizeCode: planet?.sizeCode,
        gasGiantCategoryCode: planet?.gasGiantCategoryCode,
        gasGiantDiameterCode: planet?.gasGiantDiameterCode,
        gasGiantDiameterTerran: planet?.gasGiantDiameterTerran,
        gasGiantMassEarth: planet?.gasGiantMassEarth,
      }),
      moonNote: formatSignificantMoonNote({
        significantMoonQuantity: planet?.significantMoonQuantity,
        hasSignificantRing: planet?.hasSignificantRing,
        significantMoonSizes: planet?.significantMoonSizes,
        significantRingCode: planet?.significantRingCode,
        insignificantMoonQuantity: planet?.insignificantMoonQuantity,
      }),
    };
  });

  const designatedPlanets = applyDefaultPlanetDesignations(enrichedPlanets, { systemLabel });
  return applyDefaultMoonDesignations(designatedPlanets);
}

function moonAlphabeticSuffixForIndex(index) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  if (!Number.isFinite(index) || index < 0) {
    return "a";
  }

  let value = Math.trunc(index);
  let suffix = "";
  do {
    const remainder = value % 26;
    suffix = `${alphabet.charAt(remainder)}${suffix}`;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return suffix;
}

function applyDefaultMoonDesignations(planets) {
  const entries = Array.isArray(planets) ? planets : [];

  return entries.map((planet) => {
    const parentName = String(planet?.name || "").trim();
    const moonSizes = Array.isArray(planet?.significantMoonSizes) ? planet.significantMoonSizes : [];
    const significantMoonCount = moonSizes.filter((sizeCode) => String(sizeCode).toUpperCase() !== "R").length;
    const insignificantMoonQuantity = Math.max(0, Math.floor(Number(planet?.insignificantMoonQuantity) || 0));

    const significantMoonDesignations = [];
    for (let i = 0; i < significantMoonCount; i++) {
      significantMoonDesignations.push(`${parentName} ${moonAlphabeticSuffixForIndex(i)}`.trim());
    }

    const insignificantMoonStart = significantMoonCount + 1;
    const insignificantMoonEnd = significantMoonCount + insignificantMoonQuantity;
    const insignificantMoonDesignations = [];
    for (let i = 0; i < insignificantMoonQuantity; i++) {
      insignificantMoonDesignations.push(`${parentName} ${insignificantMoonStart + i}`.trim());
    }
    const insignificantMoonDesignationRange =
      insignificantMoonQuantity > 0 ? `${parentName} ${insignificantMoonStart}-${insignificantMoonEnd}`.trim() : "";

    return {
      ...planet,
      significantMoonDesignations,
      insignificantMoonDesignations,
      insignificantMoonDesignationStart: insignificantMoonQuantity > 0 ? insignificantMoonStart : null,
      insignificantMoonDesignationEnd: insignificantMoonQuantity > 0 ? insignificantMoonEnd : null,
      insignificantMoonDesignationRange,
    };
  });
}

function formatSignificantMoonNote({
  significantMoonQuantity,
  hasSignificantRing,
  significantMoonSizes,
  significantRingCode,
  insignificantMoonQuantity,
} = {}) {
  const moonSizes = Array.isArray(significantMoonSizes) ? significantMoonSizes.filter(Boolean) : [];
  if (moonSizes.length > 0) {
    const ringCode = String(significantRingCode || "").trim();
    if (ringCode && moonSizes.every((sizeCode) => sizeCode === "R")) {
      return `Moons: ${ringCode}`;
    }

    const insignificant = Number(insignificantMoonQuantity);
    const insignificantNote =
      Number.isFinite(insignificant) && insignificant > 0 ? ` +i${Math.floor(insignificant)}` : "";
    return `Moons: ${moonSizes.join(", ")}${ringCode ? ` (${ringCode})` : ""}${insignificantNote}`;
  }

  if (hasSignificantRing) {
    return "Moons: R01";
  }

  const moonCount = Number(significantMoonQuantity);
  if (Number.isFinite(moonCount) && moonCount > 0) {
    const insignificant = Number(insignificantMoonQuantity);
    const insignificantNote =
      Number.isFinite(insignificant) && insignificant > 0 ? ` +i${Math.floor(insignificant)}` : "";
    return `Sig Moons: ${Math.floor(moonCount)}${insignificantNote}`;
  }

  const insignificant = Number(insignificantMoonQuantity);
  if (Number.isFinite(insignificant) && insignificant > 0) {
    return `Insig: ${Math.floor(insignificant)}`;
  }

  return "";
}

function formatPlanetYearLength(planet) {
  const periodYears = Number(planet?.orbitalPeriodYears);
  if (!Number.isFinite(periodYears)) {
    return "n/a";
  }

  const periodDays = Number(planet?.orbitalPeriodDays);
  if (periodYears >= 1) {
    const wholeYears = Math.trunc(periodYears);
    const remainderDays = Number.isFinite(periodDays) ? Math.round(periodDays - wholeYears * 365.25) : 0;
    return `${periodYears.toFixed(2)} y (${wholeYears}y ${Math.max(0, remainderDays)}d)`;
  }

  if (Number.isFinite(periodDays) && periodDays >= 1) {
    return `${periodYears.toFixed(4)} y (${periodDays.toFixed(2)} d)`;
  }

  const periodHours = Number(planet?.orbitalPeriodHours);
  if (Number.isFinite(periodHours)) {
    return `${periodYears.toFixed(6)} y (${periodHours.toFixed(1)} h)`;
  }

  return `${periodYears.toFixed(6)} y`;
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16);
}

function parseStepNumber(stepKey) {
  const match = String(stepKey || "").match(/step(\d+)/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function summarizeStepTrace(stepKey, payload) {
  if (!payload || typeof payload !== "object") {
    return "No payload data available.";
  }

  if (stepKey === "step1") {
    const stars = Array.isArray(payload.starAllocations) ? payload.starAllocations.length : 0;
    return `Allocated worlds across ${stars} star group(s); total system orbits: ${payload.totalSystemOrbits ?? 0}.`;
  }

  if (stepKey === "step2") {
    return `Baseline mode: ${payload.mode ?? "n/a"}; baseline number: ${payload.baselineNumber ?? "n/a"}.`;
  }

  if (stepKey === "step3") {
    return `Baseline orbit resolved to ${payload.baselineOrbit ?? "n/a"} (${payload.mode ?? "n/a"} mode).`;
  }

  if (stepKey === "step4") {
    return `Rolled ${payload.emptyOrbitCount ?? 0} empty orbit(s) on ${payload.roll ?? "n/a"}; unallocated: ${payload.unallocatedEmptyOrbits ?? 0}.`;
  }

  if (stepKey === "step5") {
    return `System spread: ${payload.roundedSpread ?? payload.spread ?? "n/a"}; capped: ${payload.cappedByMaximumSpread ? "yes" : "no"}.`;
  }

  if (stepKey === "step5Secondary") {
    const count = Array.isArray(payload) ? payload.length : 0;
    return `Computed secondary spread overrides for ${count} star(s).`;
  }

  if (stepKey === "step6") {
    const count = Array.isArray(payload.slots) ? payload.slots.length : 0;
    return `Generated ${count} orbit slot(s) before anomaly injection.`;
  }

  if (stepKey === "step7") {
    const anomalies = Array.isArray(payload.anomalies) ? payload.anomalies.length : (payload.anomalousOrbitCount ?? 0);
    return `Generated ${anomalies} anomalous orbit(s) and updated world totals.`;
  }

  if (stepKey === "step8") {
    const slots = Array.isArray(payload.slots) ? payload.slots.length : 0;
    const terrestrials = payload?.placements?.terrestrials?.length ?? 0;
    return `Placed bodies into ${slots} slot(s); terrestrial placements: ${terrestrials}.`;
  }

  if (stepKey === "step9") {
    const worlds = Array.isArray(payload.worlds) ? payload.worlds.length : 0;
    return `Assigned eccentricities to ${worlds} world(s).`;
  }

  if (stepKey === "step10") {
    const worlds = payload?.totals?.rolledWorlds ?? 0;
    const moons = payload?.totals?.significantMoons ?? 0;
    return `Rolled moon quantities for ${worlds} world(s); initial significant moons: ${moons}.`;
  }

  if (stepKey === "step11") {
    const worlds = payload?.totals?.sizedWorlds ?? 0;
    const rings = payload?.totals?.significantRings ?? 0;
    return `Sized moons for ${worlds} world(s); total significant rings: ${rings}.`;
  }

  if (stepKey === "step12") {
    const worlds = payload?.totals?.worlds ?? 0;
    const moons = payload?.totals?.insignificantMoons ?? 0;
    return `Estimated insignificant moons for ${worlds} world(s): ${moons}.`;
  }

  return "Step payload captured.";
}

function formatTraceData(payload) {
  return JSON.stringify(payload, null, 2);
}

function parseHexCoordinate(rawCoord) {
  const value = String(rawCoord || "0101")
    .replace(/[^0-9]/g, "")
    .padStart(4, "0")
    .slice(0, 4);
  const x = Math.min(32, Math.max(1, Number(value.slice(0, 2)) || 1));
  const y = Math.min(40, Math.max(1, Number(value.slice(2, 4)) || 1));
  return {
    x,
    y,
    normalized: `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`,
  };
}

function resolveTemperatureScenarioSettings(rawSettings = null) {
  const rawSolarDaysPerYear = Number(rawSettings?.solarDaysPerYear);
  const solarDaysPerYear =
    Number.isFinite(rawSolarDaysPerYear) && rawSolarDaysPerYear > 0
      ? Math.max(1, Math.round(rawSolarDaysPerYear))
      : DEFAULT_TEMPERATURE_SCENARIO_SOLAR_DAYS_PER_YEAR;

  const rawDateSolarDays = Number(rawSettings?.dateSolarDays);
  let dateSolarDays = Number.isFinite(rawDateSolarDays)
    ? Math.max(0, Math.round(rawDateSolarDays))
    : DEFAULT_TEMPERATURE_SCENARIO_DATE_SOLAR_DAYS;
  if (dateSolarDays >= solarDaysPerYear) {
    dateSolarDays = dateSolarDays % solarDaysPerYear;
  }

  return { dateSolarDays, solarDaysPerYear };
}

function toSpectralClass(star) {
  const direct = String(star?.spectralType || "")
    .trim()
    .toUpperCase();
  if (PERSISTED_SPECTRAL_TYPES.has(direct)) {
    return direct;
  }

  const normalized = String(star?.spectralClass || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (PERSISTED_SPECTRAL_TYPES.has(normalized)) {
    return normalized;
  }

  if (normalized === "WD") {
    return "WD";
  }

  const fullPattern = /^[OBAFGKMLTY](?:\d)?(?:IA|IB|II|III|IV|V|VI|BD|D)?$/;
  if (fullPattern.test(normalized)) {
    return normalized.charAt(0);
  }

  return "G";
}

function toPersistedClass(star) {
  if (PERSISTED_SPECTRAL_TYPES.has(star?.persistedSpectralClass)) {
    return star.persistedSpectralClass;
  }

  const spectralType = toSpectralClass(star);
  if (PERSISTED_SPECTRAL_TYPES.has(spectralType)) {
    return spectralType;
  }

  return toPersistedSpectralClass({
    spectralType: star?.spectralType,
    luminosityClass: star?.luminosityClass,
    designation: star?.designation,
    persistedSpectralClass: star?.persistedSpectralClass,
  });
}

function buildSystemLabel(entry) {
  const namedLabel = String(entry?.metadata?.systemName || "").trim();
  const x = Number(entry?.hexCoordinates?.x);
  const y = Number(entry?.hexCoordinates?.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    const coord = `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`;
    if (namedLabel) {
      return `${namedLabel} (${coord})`;
    }
    return `${coord} (${entry.systemId})`;
  }

  if (namedLabel) {
    return `${namedLabel} (${entry.systemId})`;
  }

  return entry?.systemId || "Unknown system";
}

function starFromPersisted(spectralClass, role) {
  const spectral = toSpectralClass({ spectralClass });
  if (spectral === "WD") {
    return {
      designation: "WD",
      spectralClass: "WD",
      spectralType: "WD",
      luminosityClass: "D",
      objectType: "degenerate",
      massInSolarMasses: 0.6,
      luminosity: 0.01,
      temperatureK: 9000,
      orbitType: role === "primary" ? null : "Near",
      persistedSpectralClass: "WD",
    };
  }

  return buildStar(spectral, role, {
    designation: `${spectral}V`,
    spectralClass: `${spectral}V`,
    luminosityClass: "V",
    persistedSpectralClass: spectral,
    jitter: 1,
    applyMassVariance: false,
  });
}

function hydrateSystemFromPersisted(persistedSystem) {
  const metadata = persistedSystem?.metadata || {};
  const survey = metadata.generatedSurvey || null;
  const temperatureScenarioSettings = resolveTemperatureScenarioSettings(survey?.temperatureScenarioSettings);
  const x = Number(persistedSystem?.hexCoordinates?.x) || 1;
  const y = Number(persistedSystem?.hexCoordinates?.y) || 1;
  const normalizedCoord = `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`;
  const designationLabel = resolveSystemDesignationLabel(metadata.systemName, normalizedCoord);

  if (survey?.stars && survey?.habitableZone && survey?.planets) {
    const planets = enrichPersistedPlanetsWithOrbitalPeriods(
      survey.planets,
      survey.stars,
      survey.worldPlacement,
      designationLabel,
    );

    const iissProfile =
      survey?.iissProfile ??
      generateIISSProfile({
        stars: survey.stars,
        ageGyr: Number(persistedSystem?.primaryStar?.age),
        metadata,
      });

    const planetarySystemProfile =
      survey?.planetarySystemProfile ??
      generatePlanetarySystemProfiles({
        planets,
        stars: survey.stars,
        worldPlacement: survey.worldPlacement,
      });

    return {
      systemId: normalizedCoord,
      systemLabel: designationLabel,
      persistedSystemId: persistedSystem.systemId,
      stars: survey.stars,
      habitableZone: survey.habitableZone,
      planets,
      worldPlacement: survey.worldPlacement ?? null,
      mainworldCandidates: survey.mainworldCandidates ?? null,
      temperatureScenarioSettings,
      iissProfile,
      planetarySystemShortProfile: planetarySystemProfile.shortProfile,
      planetarySystemLongProfile: planetarySystemProfile.longProfile,
    };
  }

  const primary = starFromPersisted(persistedSystem?.primaryStar?.spectralClass, "primary");
  const companions = Array.isArray(persistedSystem?.companionStars)
    ? persistedSystem.companionStars.map((entry) => starFromPersisted(entry?.spectralClass, "secondary"))
    : [];
  const stars = [primary, ...companions];
  const worldPlacement = survey?.worldPlacement ?? null;
  const hzInner = Number(persistedSystem?.habitableZone) || 1;
  const iissProfile = generateIISSProfile({
    stars,
    ageGyr: Number(persistedSystem?.primaryStar?.age),
    metadata,
  });
  const planetarySystemProfile = generatePlanetarySystemProfiles({
    planets: [],
    stars,
    worldPlacement,
  });

  return {
    systemId: normalizedCoord,
    systemLabel: designationLabel,
    persistedSystemId: persistedSystem.systemId,
    stars,
    habitableZone: {
      innerAU: +hzInner.toFixed(2),
      outerAU: +(hzInner * 1.6).toFixed(2),
      frostLineAU: +(hzInner * 3.2).toFixed(2),
    },
    planets: [],
    worldPlacement,
    mainworldCandidates: survey?.mainworldCandidates ?? null,
    temperatureScenarioSettings,
    iissProfile,
    planetarySystemShortProfile: planetarySystemProfile.shortProfile,
    planetarySystemLongProfile: planetarySystemProfile.longProfile,
  };
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function loadSelectedSystem() {
  if (!selectedSystemId.value) {
    return;
  }
  await loadPersistedSystem(selectedSystemId.value, true);
}

async function loadPersistedSystem(systemId, showToast = false) {
  const persisted = systemStore.systems.find((entry) => entry.systemId === systemId);
  if (!persisted) {
    toastService.error("Selected system could not be found.");
    return;
  }

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    system.value = hydrateSystemFromPersisted(persisted);
    const scenarioSettings = resolveTemperatureScenarioSettings(system.value?.temperatureScenarioSettings);
    temperatureScenarioDateSolarDays.value = scenarioSettings.dateSolarDays;
    temperatureScenarioSolarDaysPerYear.value = scenarioSettings.solarDaysPerYear;
    hexCoord.value = system.value.systemId;
    systemLabelInput.value = resolveSystemDesignationLabel(system.value.systemLabel, system.value.systemId);
    const primaryCode = toSpectralClass(system.value.stars[0]);
    primarySpectral.value = SPECTRAL_TYPES.some((type) => type.code === primaryCode) ? primaryCode : "random";
    systemStore.setCurrentSystem(systemId);
    if (showToast) {
      toastService.success(`Loaded system ${system.value.systemId}.`);
    }
  } finally {
    isLoading.value = false;
    loadingMode.value = "generate";
  }
}

async function initializeSystemSelection(galaxyId, sectorId) {
  system.value = null;
  selectedSystemId.value = "";

  if (!galaxyId || !sectorId) {
    return;
  }

  await systemStore.loadSystems(galaxyId, sectorId);
  if (systemStore.error) {
    toastService.error(`Failed to load systems: ${systemStore.error}`);
    return;
  }

  const currentSystem = systemStore.systems.find((entry) => entry.systemId === systemStore.currentSystemId);
  const fallbackSystem = systemStore.systems[0];
  const initialSystem = currentSystem ?? fallbackSystem;
  if (initialSystem) {
    selectedSystemId.value = initialSystem.systemId;
    await loadPersistedSystem(initialSystem.systemId, false);
  }
}

async function buildSystem() {
  if (!props.sectorId) {
    toastService.error("No sector selected. Please generate/select a sector first.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    // Use setTimeout to show loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const primaryRoll = primarySpectral.value === "random" ? generatePrimaryStar() : null;

    let starCount = 1;
    if (multiplicity.value === "binary") starCount = 2;
    else if (multiplicity.value === "trinary") starCount = 3;
    else if (multiplicity.value === "random") {
      const r = Math.random();
      starCount = r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
    }

    const stars = [
      primaryRoll
        ? buildPrimaryStar(primaryRoll)
        : buildStar((SPECTRAL_TYPES.find((t) => t.code === primarySpectral.value) ?? pickSpectral()).code, "primary"),
    ];

    for (let i = 1; i < starCount; i++) {
      stars.push(buildStar(pickSpectral().code, "secondary"));
    }

    const systemAgeGyr = +(Math.random() * 12 + 1).toFixed(2);
    const temperatureScenarioSettings = resolveTemperatureScenarioSettings({
      dateSolarDays: temperatureScenarioDateSolarDays.value,
      solarDaysPerYear: temperatureScenarioSolarDaysPerYear.value,
    });
    temperatureScenarioDateSolarDays.value = temperatureScenarioSettings.dateSolarDays;
    temperatureScenarioSolarDaysPerYear.value = temperatureScenarioSettings.solarDaysPerYear;

    // Calculate new star properties for each star
    stars.forEach((star, idx) => {
      star.absoluteMagnitude = calculateAbsoluteMagnitude({ luminosity: star.luminosity });
      star.visualColor = getStarVisualColor({ spectralClass: star.spectralClass });
      star.rotationPeriodDays = estimateRotationPeriod({
        massInSolarMasses: star.massInSolarMasses,
        luminosityClass: star.luminosityClass || "V",
      });
      star.mainSequenceLifetimeGyr = calculateMainSequenceLifetime({ massInSolarMasses: star.massInSolarMasses });
      if (star.mainSequenceLifetimeGyr) {
        star.evolutionaryStatus = calculateEvolutionaryStatus({
          ageGyr: systemAgeGyr,
          lifetimeGyr: star.mainSequenceLifetimeGyr,
        });
      }
    });

    const hz = calcHabitableZone(stars[0].luminosity);
    const hex = parseHexCoordinate(hexCoord.value);
    const systemDesignationLabel = resolveSystemDesignationLabel(systemLabelInput.value, hex.normalized);
    systemLabelInput.value = systemDesignationLabel;
    const worldPlacement = generateSystemWorldPlacement({
      stars,
      systemAgeGyr,
      includeStep9: true,
      rng: Math.random,
    });
    const mainworldCandidates = identifyMainworldCandidates({
      slots: worldPlacement.slots,
      hzco: worldPlacement.hzco,
      rollPhysical: true,
      includeTemperatureScenarioPresets: true,
      temperatureScenarioDateSolarDays: temperatureScenarioSettings.dateSolarDays,
      temperatureScenarioSolarDaysPerYear: temperatureScenarioSettings.solarDaysPerYear,
      temperatureScenarioGasGiantResidualAgeGyr: systemAgeGyr,
      rng: Math.random,
    });
    const planets = buildPlanetsFromWorldPlacement(worldPlacement, hz, stars, systemDesignationLabel);
    const iissProfile = generateIISSProfile({ stars, ageGyr: systemAgeGyr, metadata: {} });
    const planetarySystemProfile = generatePlanetarySystemProfiles({
      planets,
      stars,
      worldPlacement,
    });

    const now = new Date().toISOString();
    const newSystemId = `sys_${sanitizeId(props.sectorId)}_${hex.normalized}_${Date.now()}`.slice(0, 50);

    const systemPayload = {
      systemId: newSystemId,
      sectorId: props.sectorId,
      hexCoordinates: { x: hex.x, y: hex.y },
      starCount,
      primaryStar: {
        spectralClass: toPersistedClass(stars[0]),
        luminosity: stars[0].luminosity,
        mass: stars[0].massInSolarMasses,
        age: systemAgeGyr,
      },
      companionStars: stars.slice(1).map((star, index) => ({
        spectralClass: toPersistedClass(star),
        separation: +((index + 1) * (0.5 + Math.random() * 5)).toFixed(2),
      })),
      habitableZone: hz.innerAU,
      metadata: {
        createdAt: now,
        lastModified: now,
        systemName: systemDesignationLabel,
        systemClass: starCount === 1 ? "Single" : starCount === 2 ? "Binary" : "Trinary",
        generatedSurvey: {
          stars,
          habitableZone: hz,
          planets,
          worldPlacement,
          mainworldCandidates,
          temperatureScenarioSettings,
          primaryGeneration: primaryRoll,
          iissProfile,
          planetarySystemProfile,
        },
      },
    };

    const persistedSystem = await systemStore.createSystem(systemPayload);

    system.value = {
      systemId: hex.normalized,
      systemLabel: systemDesignationLabel,
      persistedSystemId: persistedSystem.systemId,
      stars,
      habitableZone: hz,
      planets,
      worldPlacement,
      mainworldCandidates,
      temperatureScenarioSettings,
      iissProfile,
      planetarySystemShortProfile: planetarySystemProfile.shortProfile,
      planetarySystemLongProfile: planetarySystemProfile.longProfile,
    };
    selectedSystemId.value = persistedSystem.systemId;
    toastService.success(`System ${hex.normalized} generated and saved.`);
  } catch (err) {
    toastService.error(`Failed to generate/save system: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function regenerateSystem() {
  buildSystem();
}

function exportSystem() {
  if (!system.value) return;
  const blob = new Blob([JSON.stringify(system.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `System-${system.value.systemId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function proceedToWorldBuilder() {
  const persistedSystemId = system.value?.persistedSystemId;
  if (!persistedSystemId) {
    toastService.error("System is not persisted yet. Please generate system again.");
    return;
  }

  const scenarioSettings = resolveTemperatureScenarioSettings(system.value?.temperatureScenarioSettings) ?? {
    dateSolarDays: temperatureScenarioDateSolarDays.value,
    solarDaysPerYear: temperatureScenarioSolarDaysPerYear.value,
  };

  router.push({
    name: "WorldBuilder",
    params: { systemId: persistedSystemId },
    query: {
      star: system.value.stars[0].designation,
      galaxyId: props.galaxyId ?? "",
      sectorId: props.sectorId ?? "",
      temperatureScenarioDateSolarDays: String(scenarioSettings.dateSolarDays),
      temperatureScenarioSolarDaysPerYear: String(scenarioSettings.solarDaysPerYear),
    },
  });
}
</script>

<style scoped>
.star-system-builder {
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

/* System display */
.system-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
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

.profile-section,
.stars-section,
.hz-section,
.planets-section,
.candidates-section,
.trace-section {
  margin-bottom: 2rem;
}

.profile-section h3,
.stars-section h3,
.hz-section h3,
.planets-section h3,
.candidates-section h3,
.trace-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.candidate-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.8rem;
  color: #cde7ff;
  font-size: 0.86rem;
}

.candidate-table td,
.candidate-table th {
  font-size: 0.84rem;
}

.profile-section {
  background: #111229;
  border: 1px solid #21395a;
  border-radius: 0.4rem;
  padding: 0.9rem;
}

.profile-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.45rem;
}

.profile-row:last-child {
  margin-bottom: 0;
}

.profile-label {
  min-width: 130px;
  color: #85b9c9;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.profile-value {
  color: #f2fbff;
  background: #0a0d1e;
  border: 1px solid #1e3452;
  border-radius: 0.25rem;
  padding: 0.18rem 0.4rem;
  font-size: 0.82rem;
  font-family: monospace;
}

.profile-value-long {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

.trace-counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.trace-count-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.6rem 0.7rem;
  background: #101033;
  border: 1px solid #22385a;
  border-radius: 0.35rem;
}

.trace-count-card span {
  font-size: 0.75rem;
  color: #85b9c9;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trace-count-card strong {
  color: #ffffff;
  font-size: 1rem;
  font-family: monospace;
}

.trace-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.85rem;
}

.trace-card {
  padding: 0.8rem;
  background: #12122e;
  border: 1px solid #1f2f47;
  border-radius: 0.4rem;
}

.trace-card-header {
  margin-bottom: 0.45rem;
}

.trace-step-id {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.12);
  border: 1px solid rgba(0, 217, 255, 0.35);
  color: #8be8ff;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: bold;
}

.trace-summary {
  margin: 0 0 0.55rem;
  color: #d7e8f0;
  font-size: 0.84rem;
  line-height: 1.35;
}

.trace-json summary {
  cursor: pointer;
  color: #86deff;
  font-size: 0.8rem;
  user-select: none;
}

.trace-json pre {
  margin-top: 0.55rem;
  padding: 0.5rem;
  max-height: 220px;
  overflow: auto;
  border-radius: 0.3rem;
  background: #0b0b24;
  border: 1px solid #19284a;
  color: #cde7ff;
  font-size: 0.72rem;
  line-height: 1.35;
}

.trace-empty-state {
  padding: 0.75rem;
  border: 1px dashed #2f4e64;
  border-radius: 0.35rem;
  color: #9ec6d4;
  font-size: 0.9rem;
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

.star-designation-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.star-designation {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  font-family: monospace;
}

.designation-combined-chip {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #00d9ff, #00ffff);
  color: #000;
  border-radius: 0.25rem;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.5);
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

.prop-color-chip {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid #444;
  flex-shrink: 0;
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

.planet-note {
  margin-top: 0.2rem;
  color: #89d7ff;
  font-family: monospace;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
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
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.system-hint {
  font-size: 0.85rem;
  color: #b7f7ff;
  border: 1px solid #00d9ff;
  border-radius: 0.25rem;
  background: rgba(0, 217, 255, 0.08);
  padding: 0.45rem 0.65rem;
}
</style>
