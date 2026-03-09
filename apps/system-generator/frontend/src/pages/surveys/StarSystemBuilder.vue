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
          <table v-else class="planet-table">
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
              <tr v-for="(planet, i) in system.planets" :key="i" :class="{ habitable: planet.zone === 'habitable' }">
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

const props = defineProps({
  galaxyId: { type: String, default: null },
  sectorId: { type: String, default: null },
});
const router = useRouter();
const systemStore = useSystemStore();

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

const PLANET_TYPES = ["Rocky", "Super-Earth", "Gas Giant", "Ice Giant", "Dwarf Planet", "Asteroid Belt"];
const ORBIT_TYPES = ["Close", "Near", "Far", "Distant"];

// ── State ─────────────────────────────────────────────────────────────────────
const hexCoord = ref(router.currentRoute.value.query.hex ?? "0101");
const primarySpectral = ref(router.currentRoute.value.query.star?.charAt(0) ?? "random");
const multiplicity = ref("random");
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
  let au = 0.3 + Math.random() * 0.4;
  for (let i = 0; i < count; i++) {
    const type = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
    const orbitAU = +au.toFixed(2);
    orbits.push({
      name: `World-${i + 1}`,
      type,
      orbitAU,
      zone: planetZone(orbitAU, hz),
    });
    au = au * (1.5 + Math.random() * 0.8);
  }
  return orbits;
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 16);
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

function toSpectralClass(star) {
  const code = String(star?.spectralClass || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return ["O", "B", "A", "F", "G", "K", "M", "L", "T", "Y"].includes(code) ? code : "G";
}

function buildSystemLabel(entry) {
  const x = Number(entry?.hexCoordinates?.x);
  const y = Number(entry?.hexCoordinates?.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    const coord = `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`;
    return `${coord} (${entry.systemId})`;
  }
  return entry?.systemId || "Unknown system";
}

function starFromPersisted(spectralClass, role) {
  const spectral = toSpectralClass({ spectralClass });
  return {
    designation: `${spectral}V`,
    spectralClass: `${spectral}V`,
    massInSolarMasses: 1,
    luminosity: 1,
    temperatureK: 5800,
    orbitType: role === "primary" ? null : "Near",
  };
}

function hydrateSystemFromPersisted(persistedSystem) {
  const metadata = persistedSystem?.metadata || {};
  const survey = metadata.generatedSurvey || null;
  const x = Number(persistedSystem?.hexCoordinates?.x) || 1;
  const y = Number(persistedSystem?.hexCoordinates?.y) || 1;
  const normalizedCoord = `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`;

  if (survey?.stars && survey?.habitableZone && survey?.planets) {
    return {
      systemId: normalizedCoord,
      persistedSystemId: persistedSystem.systemId,
      stars: survey.stars,
      habitableZone: survey.habitableZone,
      planets: survey.planets,
    };
  }

  const primary = starFromPersisted(persistedSystem?.primaryStar?.spectralClass, "primary");
  const companions = Array.isArray(persistedSystem?.companionStars)
    ? persistedSystem.companionStars.map((entry) => starFromPersisted(entry?.spectralClass, "secondary"))
    : [];
  const hzInner = Number(persistedSystem?.habitableZone) || 1;

  return {
    systemId: normalizedCoord,
    persistedSystemId: persistedSystem.systemId,
    stars: [primary, ...companions],
    habitableZone: {
      innerAU: +hzInner.toFixed(2),
      outerAU: +(hzInner * 1.6).toFixed(2),
      frostLineAU: +(hzInner * 3.2).toFixed(2),
    },
    planets: [],
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
    hexCoord.value = system.value.systemId;
    const primaryCode = toSpectralClass(system.value.stars[0]);
    primarySpectral.value = primaryCode;
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

    const primaryEntry =
      primarySpectral.value === "random"
        ? pickSpectral()
        : (SPECTRAL_TYPES.find((t) => t.code === primarySpectral.value) ?? pickSpectral());

    let starCount = 1;
    if (multiplicity.value === "binary") starCount = 2;
    else if (multiplicity.value === "trinary") starCount = 3;
    else if (multiplicity.value === "random") {
      const r = Math.random();
      starCount = r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
    }

    const stars = [buildStar(primaryEntry, "primary")];
    for (let i = 1; i < starCount; i++) {
      stars.push(buildStar(pickSpectral(), "secondary"));
    }

    const hz = calcHabitableZone(stars[0].luminosity);
    const planets = buildPlanets(hz);
    const hex = parseHexCoordinate(hexCoord.value);
    const now = new Date().toISOString();
    const newSystemId = `sys_${sanitizeId(props.sectorId)}_${hex.normalized}_${Date.now()}`.slice(0, 50);

    const systemPayload = {
      systemId: newSystemId,
      sectorId: props.sectorId,
      hexCoordinates: { x: hex.x, y: hex.y },
      starCount,
      primaryStar: {
        spectralClass: toSpectralClass(stars[0]),
        luminosity: stars[0].luminosity,
        mass: stars[0].massInSolarMasses,
        age: +(Math.random() * 12 + 1).toFixed(2),
      },
      companionStars: stars.slice(1).map((star, index) => ({
        spectralClass: toSpectralClass(star),
        separation: +((index + 1) * (0.5 + Math.random() * 5)).toFixed(2),
      })),
      habitableZone: hz.innerAU,
      metadata: {
        createdAt: now,
        lastModified: now,
        systemClass: starCount === 1 ? "Single" : starCount === 2 ? "Binary" : "Trinary",
        generatedSurvey: {
          stars,
          habitableZone: hz,
          planets,
        },
      },
    };

    const persistedSystem = await systemStore.createSystem(systemPayload);

    system.value = {
      systemId: hex.normalized,
      persistedSystemId: persistedSystem.systemId,
      stars,
      habitableZone: hz,
      planets,
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

  router.push({
    name: "WorldBuilder",
    params: { systemId: persistedSystemId },
    query: {
      star: system.value.stars[0].designation,
      galaxyId: props.galaxyId ?? "",
      sectorId: props.sectorId ?? "",
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
