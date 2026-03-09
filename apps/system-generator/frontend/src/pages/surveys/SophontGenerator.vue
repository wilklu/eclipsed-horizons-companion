<template>
  <div class="sophont-generator">
    <LoadingSpinner :isVisible="isLoading" :message="loadingMessage" />
    <SurveyNavigation
      currentClass="Sophont Generator"
      :show-regenerate="!!sophont"
      :show-export="!!sophont"
      :back-route="backRoute"
      @regenerate="generateSophont"
      @export="exportSophont"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Species Name:</label>
          <div class="name-row">
            <input v-model="speciesName" placeholder="Enter species name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>Load Existing Sophont:</label>
          <select v-model="selectedSophontId" class="select-input" @change="loadSelectedSophont">
            <option value="">Select a saved sophont...</option>
            <option v-for="entry in sophontOptions" :key="entry.sophontId" :value="entry.sophontId">
              {{ entry.label }}
            </option>
          </select>
        </div>
        <div class="control-group">
          <label>Body Plan:</label>
          <select v-model="bodyPlan" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="bp in BODY_PLANS" :key="bp" :value="bp">{{ bp }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Home Environment:</label>
          <select v-model="homeEnvironment" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="env in HOME_ENVS" :key="env" :value="env">{{ env }}</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateSophont">⚡ Generate Sophont</button>
        </div>
      </div>

      <div v-if="!activeWorldId" class="context-hint warning">
        No world is selected. Open this page from World Builder to save and reload sophonts for that world.
      </div>
      <div v-else-if="!hasSavedSophonts && !sophont" class="context-hint">
        No saved sophonts found for this world yet. Generate your first sophont to continue.
      </div>
      <div v-else-if="hasSavedSophonts && !sophont" class="context-hint">
        Select a saved sophont from the dropdown or generate a new one.
      </div>

      <!-- Sophont Profile -->
      <div v-if="sophont" class="sophont-display">
        <div class="sophont-header">
          <div class="sophont-icon">{{ sophont.icon }}</div>
          <div>
            <h2>{{ sophont.name }}</h2>
            <p class="sophont-tagline">{{ sophont.tagline }}</p>
          </div>
        </div>

        <div class="sophont-grid">
          <!-- Biology -->
          <section class="sophont-section">
            <h3>🧬 Biology</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in sophont.biology" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
          </section>

          <!-- Characteristics -->
          <section class="sophont-section">
            <h3>📊 Characteristics (2D6 base ± modifier)</h3>
            <div class="chars-grid">
              <div v-for="(mod, char) in sophont.charModifiers" :key="char" class="char-item">
                <div class="char-name">{{ char }}</div>
                <div class="char-mod" :class="mod > 0 ? 'pos' : mod < 0 ? 'neg' : 'zero'">
                  {{ mod > 0 ? "+" : "" }}{{ mod }}
                </div>
              </div>
            </div>
          </section>

          <!-- Senses -->
          <section class="sophont-section">
            <h3>👁️ Sensory Traits</h3>
            <div class="trait-list">
              <div v-for="trait in sophont.sensoryTraits" :key="trait.name" class="trait-item">
                <span class="trait-name">{{ trait.name }}</span>
                <span class="trait-dm" :class="trait.dm >= 0 ? 'pos' : 'neg'">
                  {{ trait.dm >= 0 ? "+" : "" }}{{ trait.dm }} DM
                </span>
                <span class="trait-desc">{{ trait.description }}</span>
              </div>
            </div>
          </section>

          <!-- Culture -->
          <section class="sophont-section">
            <h3>🏛️ Cultural Traits</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in sophont.culture" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
          </section>

          <!-- Tech & Society -->
          <section class="sophont-section">
            <h3>⚙️ Technology & Society</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Tech Level:</span>
                <span class="prop-value">{{ sophont.techLevel }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Social Structure:</span>
                <span class="prop-value">{{ sophont.socialStructure }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Government:</span>
                <span class="prop-value">{{ sophont.government }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">FTL Capability:</span>
                <span class="prop-value">{{ sophont.ftlCapable ? "Yes" : "No" }}</span>
              </div>
            </div>
          </section>

          <!-- Special Abilities -->
          <section class="sophont-section">
            <h3>✨ Special Abilities</h3>
            <div class="trait-list">
              <div v-for="ability in sophont.specialAbilities" :key="ability" class="ability-item">
                {{ ability }}
              </div>
            </div>
            <div v-if="!sophont.specialAbilities.length" class="empty-state">None notable.</div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { useSophontStore } from "../../stores/sophontStore.js";
import { useWorldStore } from "../../stores/worldStore.js";
import * as toastService from "../../utils/toast.js";

const route = useRoute();
const sophontStore = useSophontStore();
const worldStore = useWorldStore();

// ── Constants ─────────────────────────────────────────────────────────────────
const BODY_PLANS = [
  "Bilateral Symmetry",
  "Radial Symmetry",
  "Asymmetric",
  "Segmented",
  "Aquatic",
  "Arboreal",
  "Insectoid",
  "Avian",
];

const HOME_ENVS = [
  "Dense Atmosphere",
  "Thin Atmosphere",
  "Aquatic",
  "Arctic",
  "Desert",
  "Forest",
  "Mountain",
  "Underground",
];

const SENSORY_TRAITS_POOL = [
  { name: "Acute Hearing", dm: 1, description: "+1 DM to Stealth resistance and Recon" },
  { name: "Ultraviolet Vision", dm: 1, description: "+1 DM to Perception in UV environments" },
  { name: "Infrared Vision", dm: 1, description: "+1 DM to detection checks in darkness" },
  { name: "Electroreception", dm: 1, description: "+1 DM to detect hidden electronics" },
  { name: "Tremorsense", dm: 1, description: "+1 DM to locate moving targets on ground" },
  { name: "Colour Blind", dm: -1, description: "-1 DM to tasks requiring colour differentiation" },
  { name: "Poor Night Vision", dm: -1, description: "-1 DM to all actions in low-light conditions" },
  { name: "Sonar", dm: 1, description: "+1 DM to navigation in fluid environments" },
  { name: "Olfactory Tracking", dm: 1, description: "+1 DM to Survival and tracking checks" },
  { name: "Limited Hearing", dm: -1, description: "-1 DM to communication in noisy environments" },
];

const SPECIAL_ABILITIES_POOL = [
  "Natural Armour (armour 2)",
  "Amphibious",
  "Flight (limited)",
  "Regeneration (minor wounds)",
  "Psionic Potential",
  "Toxin Resistance",
  "Camouflage (natural)",
  "Bioluminescence",
  "Venom (melee attack, 1D damage)",
  "Exoskeleton (+1 armour)",
];

const SOCIAL_STRUCTURES = [
  "Hive Mind (partial)",
  "Clan-based Tribes",
  "Matriarchal Hierarchy",
  "Patriarchal Hierarchy",
  "Meritocracy",
  "Theocracy",
  "Technocracy",
  "Democratic Collective",
  "Nomadic Bands",
];

const GOVERNMENTS = [
  "None (anarchy)",
  "Council of Elders",
  "Corporate Council",
  "Hereditary Monarchy",
  "Elected Senate",
  "Military Junta",
  "Religious Authority",
  "AI Governance",
  "Federation",
];

const TAGLINES = [
  "ancient starfarers who chart the deep void",
  "warriors bound by a code of honour older than their sun",
  "gentle philosophers who communicate through song",
  "mercantile traders whose webs span a dozen sectors",
  "reclusive scholars hoarding the knowledge of dead civilisations",
  "pack hunters who value loyalty above all",
  "psychic nomads drifting between stars in living ships",
  "proud artisans whose technology is indistinguishable from art",
];

const SPECIES_PREFIXES = ["Vel", "Kra", "Sh'", "Ax", "Mer", "Tor", "Dyn", "Ul", "Ixo", "Var"];
const SPECIES_SUFFIXES = ["athi", "oni", "ek", "ara", "ites", "oth", "ians", "enni", "azh", "uru"];

const ICONS = ["👽", "🦎", "🐙", "🦑", "🕷️", "🦂", "🐦", "🦈", "🐉", "🦋"];

const API_CULTURE_VALUES = [
  "honor",
  "profit",
  "knowledge",
  "harmony",
  "survival",
  "exploration",
  "tradition",
  "innovation",
];
const API_CULTURE_TABOOS = ["violence", "deception", "technology", "commerce", "hierarchy", "nature", "religion"];

// ── State ─────────────────────────────────────────────────────────────────────
const speciesName = ref("");
const bodyPlan = ref("random");
const homeEnvironment = ref("random");
const selectedSophontId = ref("");
const sophont = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");

const activeWorldId = computed(() => String(route.query.worldId || worldStore.currentWorldId || ""));
const activeSystemId = computed(() => String(route.query.systemId || ""));

const backRoute = computed(() => {
  if (activeSystemId.value) {
    return {
      name: "WorldBuilder",
      params: { systemId: activeSystemId.value },
      query: {
        galaxyId: route.query.galaxyId || "",
        sectorId: route.query.sectorId || "",
      },
    };
  }
  return { name: "GalaxySurvey" };
});

const sophontOptions = computed(() =>
  sophontStore.sophonts.map((entry) => ({
    sophontId: entry.sophontId,
    label: `${entry.name} (${entry.sophontId})`,
  })),
);
const hasSavedSophonts = computed(() => sophontOptions.value.length > 0);

const loadingMessage = computed(() => (loadingMode.value === "load" ? "Loading sophont..." : "Generating sophont..."));

watchEffect(() => {
  if (sophont.value?.name) {
    document.title = `Sophont: ${sophont.value.name} | Eclipsed Horizons`;
  } else {
    document.title = "Sophont Generator | Eclipsed Horizons";
  }
});

watch(
  activeWorldId,
  async (worldId) => {
    await initializeSophontSelection(worldId);
  },
  { immediate: true },
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function d6(n = 1) {
  let t = 0;
  for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * 6);
  return t;
}

function pickUnique(arr, count) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

function mapBodyPlanToApi(value) {
  return (
    {
      "Bilateral Symmetry": "Humanoid",
      "Radial Symmetry": "Radial",
      Asymmetric: "Exotic",
      Segmented: "Insectoid",
      Aquatic: "Aquatic",
      Arboreal: "Humanoid",
      Insectoid: "Insectoid",
      Avian: "Avian",
    }[value] || "Exotic"
  );
}

function mapSocialStructureToApi(value) {
  return (
    {
      "Hive Mind (partial)": "hivemind",
      "Clan-based Tribes": "tribal",
      "Matriarchal Hierarchy": "feudal",
      "Patriarchal Hierarchy": "feudal",
      Meritocracy: "meritocratic",
      Theocracy: "autocratic",
      Technocracy: "meritocratic",
      "Democratic Collective": "democratic",
      "Nomadic Bands": "tribal",
    }[value] || "tribal"
  );
}

function buildGeneratedProfile() {
  const bp = bodyPlan.value === "random" ? pick(BODY_PLANS) : bodyPlan.value;
  const env = homeEnvironment.value === "random" ? pick(HOME_ENVS) : homeEnvironment.value;

  const rawMods = {
    Strength: d6(1) - 4,
    Dexterity: d6(1) - 4,
    Endurance: d6(1) - 4,
    Intelligence: d6(1) - 4,
    Education: d6(1) - 4,
    "Social Standing": d6(1) - 4,
  };
  const charModifiers = Object.fromEntries(Object.entries(rawMods).map(([k, v]) => [k, Math.min(2, Math.max(-2, v))]));

  const sensoryTraits = [...SENSORY_TRAITS_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 3));
  const abilityPool = [...SPECIAL_ABILITIES_POOL].sort(() => Math.random() - 0.5);
  const specialAbilities = Math.random() < 0.3 ? abilityPool.slice(0, 1 + Math.floor(Math.random() * 2)) : [];
  const techLevel = Math.floor(Math.random() * 16);

  return {
    name: speciesName.value || pick(SPECIES_PREFIXES) + pick(SPECIES_SUFFIXES),
    icon: pick(ICONS),
    tagline: pick(TAGLINES),
    biology: {
      "Body Plan": bp,
      "Home Environment": env,
      "Avg Height": `${100 + Math.round(Math.random() * 150)} cm`,
      "Avg Mass": `${20 + Math.round(Math.random() * 130)} kg`,
      Lifespan: `${30 + Math.round(Math.random() * 150)} years`,
      Reproduction: pick(["Sexual, live birth", "Asexual, budding", "Oviparous", "Sporulation"]),
      Diet: pick(["Omnivore", "Herbivore", "Carnivore", "Filter Feeder", "Chemotroph"]),
    },
    charModifiers,
    sensoryTraits,
    culture: {
      Language: pick(["Spoken (sonic)", "Gestural", "Chemical", "Colour-based", "Sonic/Infrasound", "Telepathic"]),
      Religion: pick(["Animist", "Polytheist", "Monotheist", "Secular", "Ancestor worship", "Philosophic"]),
      Aesthetics: pick(["Minimalist", "Ornate", "Functional", "Abstract", "Symbolic", "Chaotic"]),
      "Primary Drive": pick(["Expansion", "Preservation", "Knowledge", "Trade", "Conquest", "Balance", "Isolation"]),
      Attitude: pick(["Xenophilic", "Xenophobic", "Pragmatic", "Curious", "Aggressive", "Pacifist"]),
    },
    techLevel,
    socialStructure: pick(SOCIAL_STRUCTURES),
    government: pick(GOVERNMENTS),
    ftlCapable: techLevel >= 9,
    specialAbilities,
  };
}

function hydrateSophontFromPersisted(persisted) {
  if (persisted?.metadata?.generatedProfile) {
    return persisted.metadata.generatedProfile;
  }

  return {
    name: persisted?.name || "Unknown Sophont",
    icon: "👽",
    tagline: persisted?.metadata?.origin || "Recovered from persisted record",
    biology: {
      "Body Plan": persisted?.bodyPlan || "Unknown",
      "Home Environment": "Unknown",
    },
    charModifiers: {
      Strength: 0,
      Dexterity: 0,
      Endurance: 0,
      Intelligence: 0,
      Education: 0,
      "Social Standing": 0,
    },
    sensoryTraits: [],
    culture: {
      Values: Array.isArray(persisted?.culture?.values) ? persisted.culture.values.join(", ") : "Unknown",
      Taboos: Array.isArray(persisted?.culture?.taboos) ? persisted.culture.taboos.join(", ") : "Unknown",
      Structure: persisted?.culture?.socialStructure || "Unknown",
    },
    techLevel: Number(persisted?.techLevel) || 0,
    socialStructure: persisted?.culture?.socialStructure || "Unknown",
    government: "Unknown",
    ftlCapable: Number(persisted?.techLevel) >= 9,
    specialAbilities: [],
  };
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeName() {
  speciesName.value = pick(SPECIES_PREFIXES) + pick(SPECIES_SUFFIXES);
}

async function loadSelectedSophont() {
  if (!selectedSophontId.value) {
    return;
  }
  await loadPersistedSophont(selectedSophontId.value, true);
}

async function loadPersistedSophont(sophontId, showToast = false) {
  const persisted = sophontStore.sophonts.find((entry) => entry.sophontId === sophontId);
  if (!persisted) {
    toastService.error("Selected sophont could not be found.");
    return;
  }

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    sophont.value = hydrateSophontFromPersisted(persisted);
    speciesName.value = sophont.value.name;
    sophontStore.setCurrentSophont(sophontId);
    if (showToast) {
      toastService.success(`Loaded sophont ${sophont.value.name}.`);
    }
  } finally {
    isLoading.value = false;
    loadingMode.value = "generate";
  }
}

async function initializeSophontSelection(worldId) {
  sophont.value = null;
  selectedSophontId.value = "";

  if (!worldId) {
    sophontStore.sophonts = [];
    return;
  }

  await sophontStore.loadSophonts(worldId);
  if (sophontStore.error) {
    toastService.error(`Failed to load sophonts: ${sophontStore.error}`);
    return;
  }

  const currentSophont = sophontStore.sophonts.find((entry) => entry.sophontId === sophontStore.currentSophontId);
  const fallbackSophont = sophontStore.sophonts[0];
  const initialSophont = currentSophont ?? fallbackSophont;
  if (initialSophont) {
    selectedSophontId.value = initialSophont.sophontId;
    await loadPersistedSophont(initialSophont.sophontId, false);
  }
}

async function generateSophont() {
  if (!activeWorldId.value) {
    toastService.error("No world selected. Open Sophont Generator from World Builder to enable persistence.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const generatedProfile = buildGeneratedProfile();
    sophont.value = generatedProfile;

    const now = new Date().toISOString();
    const sophontId = `sop_${sanitizeId(generatedProfile.name)}_${Date.now()}`.slice(0, 50);
    const populationCode = String(
      Math.floor(Math.random() * 13)
        .toString(16)
        .toUpperCase(),
    );

    const sophontPayload = {
      sophontId,
      worldId: activeWorldId.value,
      name: generatedProfile.name,
      bodyPlan: mapBodyPlanToApi(generatedProfile.biology["Body Plan"]),
      culture: {
        values: pickUnique(API_CULTURE_VALUES, 2),
        taboos: pickUnique(API_CULTURE_TABOOS, 2),
        socialStructure: mapSocialStructureToApi(generatedProfile.socialStructure),
      },
      population: {
        current: populationCode,
        density: +(Math.random() * 500).toFixed(2),
        growthRate: +((Math.random() - 0.2) * 0.05).toFixed(4),
      },
      techLevel: generatedProfile.techLevel,
      metadata: {
        createdAt: now,
        lastModified: now,
        origin: generatedProfile.tagline,
        generatedProfile,
      },
    };

    const persistedSophont = await sophontStore.createSophont(sophontPayload);
    selectedSophontId.value = persistedSophont.sophontId;

    toastService.success(`Sophont "${generatedProfile.name}" generated and saved.`);
  } catch (err) {
    toastService.error(`Failed to generate/save sophont: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function exportSophont() {
  if (!sophont.value) return;
  const blob = new Blob([JSON.stringify(sophont.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sophont.value.name.replace(/\s+/g, "-")}-Sophont.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.sophont-generator {
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

.control-action {
  justify-content: flex-end;
}
.name-row {
  display: flex;
  gap: 0.5rem;
}
.name-row .text-input {
  flex: 1;
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
.btn-secondary {
  background: #444;
  color: #e0e0e0;
}
.btn-secondary:hover {
  background: #555;
}

.context-hint {
  margin-bottom: 1rem;
  padding: 0.65rem 0.8rem;
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

.sophont-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.sophont-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.sophont-icon {
  font-size: 3rem;
}
.sophont-header h2 {
  color: #00d9ff;
  margin: 0 0 0.4rem;
}
.sophont-tagline {
  color: #aaa;
  font-style: italic;
  margin: 0;
}

.sophont-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.sophont-section {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.sophont-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.prop-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  min-width: 140px;
  font-weight: bold;
}
.prop-value {
  color: #e0e0e0;
  font-family: monospace;
}

.chars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.char-item {
  background: #0d0d2b;
  border-radius: 0.4rem;
  padding: 0.6rem;
  text-align: center;
}

.char-name {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 0.3rem;
}
.char-mod {
  font-size: 1.3rem;
  font-weight: bold;
  font-family: monospace;
}
.char-mod.pos {
  color: #6bcf7f;
}
.char-mod.neg {
  color: #ff6b6b;
}
.char-mod.zero {
  color: #888;
}

.trait-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.trait-item {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #0d0d2b;
  border-radius: 0.3rem;
}
.trait-name {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
}
.trait-dm {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: bold;
}
.trait-dm.pos {
  color: #6bcf7f;
}
.trait-dm.neg {
  color: #ff6b6b;
}
.trait-desc {
  color: #888;
  font-size: 0.8rem;
  width: 100%;
}

.ability-item {
  padding: 0.4rem 0.75rem;
  background: rgba(0, 217, 255, 0.1);
  border-left: 3px solid #00d9ff;
  border-radius: 0.2rem;
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.empty-state {
  color: #555;
  font-style: italic;
  padding: 0.3rem 0;
}
</style>
