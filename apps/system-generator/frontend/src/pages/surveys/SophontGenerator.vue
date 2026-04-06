<template>
  <div class="sophont-generator">
    <LoadingSpinner v-bind="sophontExportOverlayProps" />
    <SurveyNavigation
      currentClass="Sophont Generator"
      :show-regenerate="!!sophont"
      :show-export="!!sophont"
      :back-route="{ name: 'GalaxySurvey' }"
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
import { ref } from "vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";

const { overlayProps: sophontExportOverlayProps, exportJson: exportSophontArchive } = useArchiveTransfer({
  noun: "Sophont",
  title: "Sophont Export In Progress",
  barLabel: "Packaging sophont archive for transfer",
  statusPrefix: "SOPH",
  targetLabel: () => sophont.value?.name || "Archive target pending",
});

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

// ── State ─────────────────────────────────────────────────────────────────────
const speciesName = ref("");
const bodyPlan = ref("random");
const homeEnvironment = ref("random");
const sophont = ref(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function d6(n = 1) {
  let t = 0;
  for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * 6);
  return t;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeName() {
  speciesName.value = pick(SPECIES_PREFIXES) + pick(SPECIES_SUFFIXES);
}

function generateSophont() {
  const bp = bodyPlan.value === "random" ? pick(BODY_PLANS) : bodyPlan.value;
  const env = homeEnvironment.value === "random" ? pick(HOME_ENVS) : homeEnvironment.value;

  // Characteristic modifiers (must sum to ≤ 0 for balance)
  const rawMods = {
    Strength: d6(1) - 4,
    Dexterity: d6(1) - 4,
    Endurance: d6(1) - 4,
    Intelligence: d6(1) - 4,
    Education: d6(1) - 4,
    "Social Standing": d6(1) - 4,
  };
  // Clamp each to [-2, +2]
  const charModifiers = Object.fromEntries(Object.entries(rawMods).map(([k, v]) => [k, Math.min(2, Math.max(-2, v))]));

  // Random sensory traits (2–4)
  const shuffled = [...SENSORY_TRAITS_POOL].sort(() => Math.random() - 0.5);
  const sensoryTraits = shuffled.slice(0, 2 + Math.floor(Math.random() * 3));

  // Special abilities (0–2)
  const abilityPool = [...SPECIAL_ABILITIES_POOL].sort(() => Math.random() - 0.5);
  const specialAbilities = Math.random() < 0.3 ? abilityPool.slice(0, 1 + Math.floor(Math.random() * 2)) : [];

  const techLevel = Math.floor(Math.random() * 16);

  sophont.value = {
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

async function exportSophont() {
  if (!sophont.value) return;
  await exportSophontArchive({
    data: sophont,
    filename: (sophontRecord) => `${sophontRecord.name.replace(/\s+/g, "-")}-Sophont.json`,
    serializeMessage: "Serializing sophont dossier...",
    encodeMessage: "Encoding sophont archive for transfer...",
    readyMessage: "Sophont archive staged for local transfer.",
  });
}
</script>

<style scoped>
.sophont-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
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
.name-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.name-row .text-input {
  flex: 1;
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
.btn-secondary {
  background: #444;
  color: #e0e0e0;
}
.btn-secondary:hover {
  background: #555;
}

.sophont-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.sophont-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
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
