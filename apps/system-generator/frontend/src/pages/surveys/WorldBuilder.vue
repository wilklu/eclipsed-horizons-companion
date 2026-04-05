<template>
  <div class="world-builder">
    <SurveyNavigation
      currentClass="Classes II–IV – World Builder"
      :back-route="{ name: 'StarSystemBuilder', params: { galaxyId: '000', sectorId: 'sector' } }"
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
        <div v-if="selectedSourceWorldLabel" class="control-group control-group--source">
          <label>Selected System World:</label>
          <div class="source-world-pill">{{ selectedSourceWorldLabel }}</div>
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
                <span class="prop-value">{{ world.tempCategory }} (avg {{ world.avgTempC }}°C)</span>
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
            </div>
          </section>

          <!-- Class IV: Census Survey -->
          <section class="world-section">
            <h3>👥 Class IV – Census Survey</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Native Sophont Life:</span>
                <span class="prop-value">{{ world.nativeSophontLife ? "Present" : "Absent" }}</span>
              </div>
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
            <div v-if="world.nativeSophontLife" class="world-note">
              Native sophont life is present, but census and civilization values remain zero until a sophont is assigned
              in the Sophont Generator.
            </div>
            <div v-else class="world-note">
              No native sophont life developed on this world, so census and civilization values remain uninhabited.
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
          <button
            class="btn btn-primary"
            :disabled="!world.nativeSophontLife"
            :title="
              world.nativeSophontLife
                ? 'Assign native sophonts to this world'
                : 'Sophont assignment is only available when native sophont life develops on the world'
            "
            @click="goToSophontGenerator"
          >
            🧬 Sophont Generator →
          </button>
          <button class="btn btn-primary" @click="goToHistoryGenerator">📜 History Generator →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";

defineProps({ systemId: { type: String, default: null } });
const router = useRouter();
const route = useRoute();

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

// ── State ─────────────────────────────────────────────────────────────────────
const worldName = ref("");
const starClass = ref("random");
const world = ref(null);
const sourceWorldType = ref("");
const sourceOrbitAU = ref("");
const sourceZone = ref("");
const sourceWorldIndex = ref("");

const selectedSourceWorldLabel = computed(() => {
  const name = String(worldName.value || "").trim();
  const type = String(sourceWorldType.value || "").trim();
  const orbit = String(sourceOrbitAU.value || "").trim();
  const zone = String(sourceZone.value || "").trim();
  const parts = [name, type, orbit ? `${orbit} AU` : "", zone].filter(Boolean);
  return parts.join(" · ");
});

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

function normalizeIncomingStarClass(value) {
  const firstChar = String(value || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return STAR_TEMP_MOD[firstChar] !== undefined ? firstChar : "random";
}

function rollNativeSophontLife({ size, atmosphereCode, hydrographics, avgTempC }) {
  if (size <= 0) return false;

  let habitabilityScore = 0;
  if (atmosphereCode >= 4 && atmosphereCode <= 9) habitabilityScore += 2;
  else if (atmosphereCode >= 2 && atmosphereCode <= 3) habitabilityScore += 1;

  if (hydrographics >= 1 && hydrographics <= 9) habitabilityScore += 2;
  else if (hydrographics === 10) habitabilityScore += 1;

  if (avgTempC >= -10 && avgTempC <= 38) habitabilityScore += 2;
  else if (avgTempC >= -30 && avgTempC <= 60) habitabilityScore += 1;

  if (size >= 4) habitabilityScore += 1;
  if (habitabilityScore < 3) return false;

  const threshold = habitabilityScore >= 6 ? 8 : habitabilityScore >= 4 ? 10 : 12;
  return d6() >= threshold;
}

function applyRouteWorldContext() {
  worldName.value = String(route.query.worldName || "").trim();
  starClass.value = normalizeIncomingStarClass(route.query.star);
  sourceWorldType.value = String(route.query.worldType || "").trim();
  sourceOrbitAU.value = String(route.query.orbitAU || "").trim();
  sourceZone.value = String(route.query.zone || "").trim();
  sourceWorldIndex.value = String(route.query.worldIndex || "").trim();
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeName() {
  worldName.value = WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)];
}

function generateWorld() {
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

  const baseTemp = 15 + tempMod * 15 + (atmoRaw >= 6 ? 20 : 0) - hydrographics * 2;
  const avgTempC = Math.round(baseTemp);
  const tempCategory =
    avgTempC < -50
      ? "Frozen"
      : avgTempC < 0
        ? "Cold"
        : avgTempC < 30
          ? "Temperate"
          : avgTempC < 60
            ? "Hot"
            : "Scorching";

  const nativeSophontLife = rollNativeSophontLife({
    size,
    atmosphereCode,
    hydrographics,
    avgTempC,
  });

  const popCode = 0;
  const population = 0;
  const governmentCode = 0;
  const governmentDesc = GOVERNMENT_TABLE[governmentCode] ?? "Unknown";
  const lawLevel = 0;
  const lawDesc = LAW_TABLE[lawLevel] ?? "Unknown";
  const starportCode = "X";

  let techBase = d6(1);
  techBase = techBase - techBase;
  const techLevel = 0;

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

  const diameterKm = size === 0 ? 800 : size * 1600;
  const gravity = +(size * 0.1 + 0.05).toFixed(2);

  const uwp = `${starportCode}${toHex(size)}${toHex(atmosphereCode)}${toHex(hydrographics)}${toHex(popCode)}${toHex(governmentCode)}${toHex(lawLevel)}-${toHex(techLevel)}`;

  world.value = {
    name: worldName.value || WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)],
    uwp,
    // Physical
    size,
    diameterKm,
    gravity,
    atmosphereCode,
    atmosphereDesc,
    hydrographics,
    avgTempC,
    tempCategory,
    // System
    orbitalPeriodDays: Math.round(200 + Math.random() * 1200),
    dayLengthHours: +(15 + Math.random() * 50).toFixed(1),
    axialTilt: Math.round(Math.random() * 40),
    moons: Math.floor(Math.random() * 4),
    magnetosphere: Math.random() < 0.5 ? "Present" : "Absent",
    // Census
    nativeSophontLife,
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
    tradeCodes,
  };
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
  if (!world.value?.nativeSophontLife) return;
  router.push({
    name: "SophontGenerator",
    query: {
      worldName: world.value?.name || "",
      source: "world-builder",
    },
  });
}

function goToHistoryGenerator() {
  router.push({ name: "HistoryGenerator" });
}

watch(
  () => route.query,
  () => {
    applyRouteWorldContext();
  },
  { deep: true },
);

onMounted(() => {
  applyRouteWorldContext();
  if (worldName.value || starClass.value !== "random") {
    generateWorld();
  }
});
</script>

<style scoped>
.world-builder {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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

.control-group--source {
  min-width: 280px;
}

.world-note {
  margin-top: 0.9rem;
  color: #b8c0cc;
  font-size: 0.92rem;
  line-height: 1.45;
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
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}

.source-world-pill {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0.6rem 0.85rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(0, 217, 255, 0.24);
  background: rgba(0, 217, 255, 0.1);
  color: #baf3ff;
  font-size: 0.9rem;
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
