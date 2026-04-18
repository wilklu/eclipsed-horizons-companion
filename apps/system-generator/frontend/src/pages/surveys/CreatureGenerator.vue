<template>
  <div class="creature-generator">
    <LoadingSpinner v-bind="creatureExportOverlayProps" />
    <SurveyNavigation
      currentClass="Creature Generator"
      :show-regenerate="!!creature"
      :show-export="!!creature"
      :back-route="backRoute"
      @regenerate="generateCreature"
      @export="exportCreature"
    />

    <div class="survey-content">
      <div class="control-panel">
        <div class="control-group control-group-wide">
          <label>Creature Name</label>
          <div class="name-row">
            <input v-model="creatureName" placeholder="Enter creature name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>

        <div class="control-group">
          <label>Seed</label>
          <input v-model="seedValue" placeholder="repeatable-seed" class="text-input" />
        </div>

        <div class="control-group">
          <label>Mode</label>
          <select v-model="generationMode" class="select-input">
            <option value="single">Single Creature</option>
            <option value="table">6-Entry Encounter Table</option>
          </select>
        </div>

        <div class="control-group">
          <label>Native Terrain</label>
          <select v-model="terrain" class="select-input">
            <option v-for="entry in TERRAIN_OPTIONS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Primary Niche</label>
          <select v-model="primaryNiche" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="entry in PRIMARY_NICHE_OPTIONS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>World Size</label>
          <select v-model="worldSize" class="select-input">
            <option v-for="entry in WORLD_SIZE_OPTIONS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group control-group-wide">
          <label>Saved World</label>
          <select v-model="selectedWorldKey" class="select-input">
            <option value="">Manual / Unlinked</option>
            <option v-for="entry in worldOptions" :key="entry.key" :value="entry.key">{{ entry.label }}</option>
          </select>
        </div>

        <div class="control-group control-group-wide">
          <label>Linked World</label>
          <input
            v-model="linkedWorldName"
            placeholder="Optional world name for linked fauna generation"
            class="text-input"
          />
        </div>

        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateCreature">⚡ Generate Beast</button>
          <button class="btn btn-secondary" :disabled="!creature" @click="saveCreatureRecord">💾 Save</button>
          <button class="btn btn-secondary" @click="resetForm">Reset</button>
        </div>
      </div>

      <div v-if="creature" class="creature-display">
        <div class="creature-header">
          <div class="creature-icon">{{ creature.icon }}</div>
          <div class="header-copy">
            <h2>{{ creature.name }}</h2>
            <p class="summary-copy">{{ creature.summary }}</p>
            <div class="creature-tags">
              <span class="tag">{{ creature.terrain }}</span>
              <span class="tag">{{ creature.ecologicalNiche.niche }}</span>
              <span class="tag">{{ creature.ecologicalNiche.subniche }}</span>
              <span class="tag">{{ creature.size.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="generationMode === 'table' && encounterTable.length" class="creature-section encounter-table">
          <h3>🎲 Beast Encounter Table</h3>
          <div class="encounter-grid">
            <div v-for="(entry, index) in encounterTable" :key="`${entry.name}-${index}`" class="encounter-card">
              <div class="encounter-roll">{{ index + 1 }}</div>
              <div class="encounter-body">
                <strong>{{ entry.ecologicalNiche.niche }}</strong>
                <div>{{ entry.ecologicalNiche.subniche }}</div>
                <div>{{ entry.locomotion }} · {{ entry.size.label }}</div>
                <div>{{ entry.combat.weapon.weapon }} · {{ entry.quantity.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="creature-grid">
          <section class="creature-section">
            <h3>🧭 BeastMaker Profile</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in creature.physical" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
            </div>
          </section>

          <section class="creature-section">
            <h3>⚔️ Combat & Reactions</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Hits</div>
                <div class="stat-value">{{ creature.combat.hits }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Strength</div>
                <div class="stat-value">{{ creature.combat.strength }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Cruise</div>
                <div class="stat-value">{{ creature.combat.speed }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Burst</div>
                <div class="stat-value">{{ creature.combat.burst }}</div>
              </div>
            </div>

            <div class="prop-list section-offset">
              <div class="prop-row">
                <span class="prop-label">Attack</span>
                <span class="prop-value">{{ creature.combat.attack }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Flee</span>
                <span class="prop-value">{{ creature.combat.flee }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Weapon</span>
                <span class="prop-value">{{ creature.combat.weapon }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Armor</span>
                <span class="prop-value">{{ creature.combat.armour }}</span>
              </div>
            </div>
          </section>

          <section class="creature-section">
            <h3>🌿 Ecology Notes</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in creature.ecology" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
            </div>
          </section>

          <section class="creature-section">
            <h3>🧬 Extended Dossier</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Body</span>
                <span class="prop-value">{{ creature.extended.bodySymmetry }} · {{ creature.extended.stance }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Covering</span>
                <span class="prop-value">{{ creature.extended.covering }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Feeding</span>
                <span class="prop-value">{{ creature.extended.feedingModel }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Diet Strategy</span>
                <span class="prop-value">{{ creature.extended.dietStrategy }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Reproduction</span>
                <span class="prop-value">{{ creature.extended.reproduction }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Life Cycle</span>
                <span class="prop-value">{{ creature.extended.lifeCycle }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Senses</span>
                <span class="prop-value">{{ creature.extended.senses.join(", ") }}</span>
              </div>
            </div>
          </section>

          <section class="creature-section">
            <h3>📝 Encounter Notes</h3>
            <div class="trait-list">
              <div v-for="note in creature.notes" :key="note" class="trait-item">{{ note }}</div>
              <div v-for="trait in creature.extended.specialTraits" :key="trait" class="trait-item">
                Trait: {{ trait }}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section v-if="savedCreatures.length" class="creature-display creature-archive">
        <div class="creature-header">
          <div class="creature-icon">📚</div>
          <div class="header-copy">
            <h2>Saved Creatures</h2>
            <p class="summary-copy">Reopen, update, or remove linked fauna records for this world.</p>
          </div>
        </div>
        <div class="saved-record-list">
          <article v-for="entry in savedCreatures" :key="entry.id" class="saved-record-card">
            <div class="saved-record-copy">
              <strong>{{ entry.name }}</strong>
              <span>{{ entry.worldName || "Unlinked habitat" }}</span>
              <span>{{ entry.summary || entry.ecologicalNiche?.subniche || "Saved profile" }}</span>
            </div>
            <div class="saved-record-actions">
              <button class="btn btn-secondary" @click="loadSavedCreature(entry)">Load</button>
              <button class="btn btn-secondary" @click="deleteSavedCreature(entry.id)">Delete</button>
            </div>
          </article>
        </div>
      </section>

      <div v-if="!creature && !savedCreatures.length" class="empty-placeholder">
        <h2>BeastMaker Creature Generator</h2>
        <p>Select terrain, world size, and niche guidance, then generate a rule-based creature profile.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { useCreatureStore } from "../../stores/creatureStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { DEFAULT_PRIMARY_NICHES, DEFAULT_TERRAINS } from "../../utils/beasts/beastTables.js";
import {
  buildWorldLinkedCreatureOptions,
  createSeededRng,
  generateBeastProfile,
  generateEncounterTable,
} from "../../utils/beasts/beastGenerator.js";
import { formatBeastSummary, formatReactionValue } from "../../utils/beasts/beastFormatting.js";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import * as toastService from "../../utils/toast.js";

const { overlayProps: creatureExportOverlayProps, exportJson: exportCreatureArchive } = useArchiveTransfer({
  noun: "Creature",
  title: "Creature Export In Progress",
  barLabel: "Packaging creature archive for transfer",
  statusPrefix: "CREA",
  targetLabel: () => creature.value?.name || "Archive target pending",
});

const route = useRoute();
const creatureStore = useCreatureStore();
const systemStore = useSystemStore();

const backRoute = computed(
  () => deserializeReturnRoute(String(route.query.returnTo || "")) || { name: "GalaxySurvey" },
);

const PRIMARY_NICHE_OPTIONS = DEFAULT_PRIMARY_NICHES;
const TERRAIN_OPTIONS = DEFAULT_TERRAINS;
const WORLD_SIZE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

const NAME_PARTS1 = ["Vel", "Krax", "Shar", "Dun", "Mrak", "Oth", "Yss", "Cor", "Tya", "Giki"];
const NAME_PARTS2 = ["ath", "rak", "ith", "orn", "alis", "yx", "oth", "eus", "ush", "eda"];

const creatureName = ref("");
const seedValue = ref("creature-alpha");
const generationMode = ref("single");
const terrain = ref("Woods");
const primaryNiche = ref("random");
const worldSize = ref("8");
const linkedWorldName = ref("");
const selectedWorldKey = ref("");
const creature = ref(null);
const encounterTable = ref([]);

const worldOptions = computed(() => {
  const systems = Array.isArray(systemStore.getAllSystems) ? systemStore.getAllSystems : [];
  return systems.flatMap((system) => {
    const worlds = Array.isArray(system?.worlds) ? system.worlds : system?.mainworld ? [system.mainworld] : [];
    return worlds
      .filter((world) => world && typeof world === "object")
      .map((world, index) => ({
        key: `${system?.systemId || system?.name || "system"}:${world?.name || index}`,
        label: `${world?.name || `World ${index + 1}`} — ${system?.name || system?.systemName || "Unnamed System"}`,
        world,
        systemId: String(system?.systemId || ""),
        worldIndex: index,
        worldName: String(world?.name || ""),
      }));
  });
});

const selectedWorldOption = computed(
  () => worldOptions.value.find((entry) => entry.key === selectedWorldKey.value) || null,
);
const selectedWorldRecord = computed(() => selectedWorldOption.value?.world || null);
const activeWorldCriteria = computed(() => ({
  worldKey: selectedWorldKey.value,
  systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
  worldName:
    linkedWorldName.value.trim() || selectedWorldOption.value?.worldName || String(route.query.worldName || ""),
}));
const savedCreatures = computed(() => creatureStore.creaturesByWorld(activeWorldCriteria.value));

watch(
  worldOptions,
  (options) => {
    if (!options.length || selectedWorldKey.value) {
      return;
    }

    const targetSystemId = String(route.query.systemId || route.query.systemRecordId || "").trim();
    const targetWorldName = String(route.query.worldName || "")
      .trim()
      .toLowerCase();
    const targetWorldIndex = Number(route.query.worldIndex ?? -1);

    const match =
      options.find(
        (entry) =>
          (!targetSystemId || entry.systemId === targetSystemId) &&
          ((targetWorldName && entry.worldName.toLowerCase() === targetWorldName) ||
            (targetWorldIndex >= 0 && entry.worldIndex === targetWorldIndex)),
      ) || options.find((entry) => targetSystemId && entry.systemId === targetSystemId);

    if (match) {
      selectedWorldKey.value = match.key;
    } else if (targetWorldName && !linkedWorldName.value.trim()) {
      linkedWorldName.value = String(route.query.worldName || "").trim();
    }
  },
  { immediate: true },
);

watch(selectedWorldRecord, (world) => {
  if (!world) return;
  const linked = buildWorldLinkedCreatureOptions(world);
  linkedWorldName.value = linked.sourceWorld?.name || "";
  terrain.value = linked.terrain;
  worldSize.value = String(linked.worldSize ?? "8");
});

function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function formatSigned(value) {
  const number = Number(value) || 0;
  return number > 0 ? `+${number}` : String(number);
}

function ensureSeed() {
  if (!String(seedValue.value || "").trim()) {
    seedValue.value = `creature-${Date.now()}`;
  }
  return String(seedValue.value).trim();
}

function randomizeName() {
  const rng = createSeededRng(ensureSeed());
  creatureName.value = `${pick(NAME_PARTS1, rng)}${pick(NAME_PARTS2, rng)}`;
}

function buildIcon(profile) {
  if (["Flyer", "Flyphib", "Triphib"].includes(profile.locomotion)) return "🦅";
  if (["Swimmer", "Aquatic", "Diver"].includes(profile.locomotion)) return "🦈";
  if (profile.ecologicalNiche.niche === "Carnivore") return "🦁";
  if (profile.ecologicalNiche.niche === "Producer") return "🌿";
  if (profile.ecologicalNiche.niche === "Scavenger") return "🦂";
  return "🦎";
}

function buildDiet(profile) {
  switch (profile.ecologicalNiche.niche) {
    case "Producer":
      return "Autotrophic or passive nutrient capture";
    case "Herbivore":
      return "Unresisting food sources and growth matter";
    case "Carnivore":
      return "Active prey and resistant food sources";
    case "Scavenger":
      return "Carrion, remains, and stolen kills";
    default:
      return "Mixed opportunistic intake";
  }
}

function buildSocial(profile) {
  const label = profile.quantity.label;
  if (["Solitary", "Single"].includes(label)) return "Usually solitary";
  if (["Pair", "Small Group"].includes(label)) return "Small local group";
  if (["Pack", "Small Herd", "Large Herd"].includes(label)) return "Coordinated social clustering";
  return "Swarm or hive behavior likely";
}

function buildActivity(profile) {
  if (["Pouncer", "Trapper", "Siren"].includes(profile.ecologicalNiche.subniche)) return "Ambush-cycle activity";
  if (profile.ecologicalNiche.niche === "Producer") return "Environmental exposure cycle";
  return "Terrain-dependent roaming cycle";
}

function buildLifespan(profile) {
  const size = profile.size.size;
  if (size <= 2) return "1 to 3 years";
  if (size === 3) return "3 to 8 years";
  if (size === 4) return "8 to 20 years";
  if (size === 5) return "15 to 40 years";
  return "30+ years";
}

function buildNotes(profile) {
  const notes = [
    `Encounter quantity usually resolves as ${profile.quantity.label} (${profile.quantity.count}).`,
    `Primary encounter trigger: ${formatReactionValue(profile.reactions.attack)}.`,
    `Fallback response: ${formatReactionValue(profile.reactions.flee)}.`,
    `Locomotion class is ${profile.locomotion.toLowerCase()} with ${profile.speed.speedC.toLowerCase()} cruise speed.`,
  ];

  if (profile.combat.armor.types.length) {
    notes.push(`Armor traits present: ${profile.combat.armor.types.join(", ")}.`);
  } else {
    notes.push("No significant natural armor is indicated.");
  }

  if (Array.isArray(profile.extended?.encounterHooks)) {
    notes.push(...profile.extended.encounterHooks);
  }

  return notes;
}

function generateCreature() {
  const seed = ensureSeed();
  if (!String(creatureName.value || "").trim()) {
    randomizeName();
  }

  const linkedWorld = selectedWorldRecord.value
    ? buildWorldLinkedCreatureOptions(selectedWorldRecord.value)
    : linkedWorldName.value.trim()
      ? buildWorldLinkedCreatureOptions({
          name: linkedWorldName.value.trim(),
          terrain: terrain.value,
          size: worldSize.value,
        })
      : { sourceWorld: null, terrain: terrain.value, worldSize: worldSize.value };

  const profile = generateBeastProfile({
    seed,
    name: creatureName.value.trim() || "Generated Beast",
    terrain: linkedWorld.terrain,
    worldSize: linkedWorld.worldSize,
    sourceWorld: linkedWorld.sourceWorld,
    primaryNiche: primaryNiche.value === "random" ? null : primaryNiche.value,
  });

  encounterTable.value =
    generationMode.value === "table"
      ? generateEncounterTable({
          seed,
          terrain: linkedWorld.terrain,
          worldSize: linkedWorld.worldSize,
          sourceWorld: linkedWorld.sourceWorld,
        })
      : [];

  creature.value = {
    ...profile,
    id: creature.value?.id || null,
    savedAt: creature.value?.savedAt || null,
    icon: buildIcon(profile),
    summary: formatBeastSummary(profile),
    physical: {
      "Native Terrain": profile.terrain,
      Locomotion: profile.locomotion,
      "World Size": profile.worldSize,
      "Gravity DM": formatSigned(profile.gravityMod),
      "Primary Niche": profile.ecologicalNiche.niche,
      Subniche: profile.ecologicalNiche.subniche,
      "Body Structure": `${profile.extended.bodySymmetry} · ${profile.extended.stance}`,
      Size: `${profile.size.label} (${profile.size.measure})`,
      Quantity: `${profile.quantity.label} (${profile.quantity.count})`,
    },
    combat: {
      hits: profile.combat.hits,
      strength: profile.combat.strength.dice,
      speed: `${profile.speed.speedC} · ${profile.speed.kph} kph`,
      burst: profile.speed.speedB,
      attack: formatReactionValue(profile.reactions.attack),
      flee: formatReactionValue(profile.reactions.flee),
      weapon: `${profile.combat.weapon.weapon} (${profile.combat.weapon.damageType})`,
      armour: profile.combat.armor.types.length ? profile.combat.armor.types.join(", ") : "No Armor",
    },
    ecology: {
      Diet: buildDiet(profile),
      Social: buildSocial(profile),
      "Activity Cycle": buildActivity(profile),
      Lifespan: buildLifespan(profile),
      Reproduction: profile.extended.reproduction,
      Adaptation: profile.extended.notableAdaptation,
      Ruleset: profile.metadata.ruleset,
      World: profile.sourceWorld?.name || "Unlinked habitat",
    },
    notes: buildNotes(profile),
  };
}

function saveCreatureRecord() {
  if (!creature.value) {
    toastService.error("Generate a creature before saving it.");
    return;
  }

  const persisted = creatureStore.saveCreature({
    ...creature.value,
    seed: seedValue.value,
    primaryNicheSelection: primaryNiche.value,
    systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
    worldKey: selectedWorldKey.value,
    worldName:
      linkedWorldName.value.trim() || selectedWorldOption.value?.worldName || creature.value.sourceWorld?.name || "",
    encounterTable: encounterTable.value,
    generationMode: generationMode.value,
  });

  creature.value = { ...creature.value, id: persisted.id, savedAt: persisted.savedAt, updatedAt: persisted.updatedAt };
  toastService.success(`Saved creature ${persisted.name}.`);
}

function loadSavedCreature(record) {
  if (!record) return;

  const fallbackProfile =
    record.extended || record.physical
      ? null
      : generateBeastProfile({
          seed: record.seed || "legacy-creature",
          name: record.name || "Generated Beast",
          terrain: record.terrain || "Woods",
          worldSize: record.worldSize || "8",
          primaryNiche: record.ecologicalNiche?.niche || null,
          sourceWorld: record.sourceWorld || null,
        });

  const normalizedRecord = {
    ...(fallbackProfile || {}),
    ...record,
    extended: record.extended ||
      fallbackProfile?.extended || {
        bodySymmetry: "—",
        stance: "—",
        covering: "—",
        senses: [],
        feedingModel: "—",
        dietStrategy: "—",
        reproduction: "—",
        lifeCycle: "—",
        socialBehavior: "—",
        specialTraits: [],
        notableAdaptation: "—",
        encounterHooks: [],
      },
  };

  creatureName.value = normalizedRecord.name || "";
  seedValue.value = normalizedRecord.seed || "creature-alpha";
  generationMode.value =
    normalizedRecord.generationMode ||
    (Array.isArray(normalizedRecord.encounterTable) && normalizedRecord.encounterTable.length ? "table" : "single");
  terrain.value = normalizedRecord.terrain || "Woods";
  worldSize.value = String(normalizedRecord.worldSize || "8");
  primaryNiche.value = normalizedRecord.primaryNicheSelection || normalizedRecord.ecologicalNiche?.niche || "random";
  linkedWorldName.value = normalizedRecord.worldName || normalizedRecord.sourceWorld?.name || "";
  if (normalizedRecord.worldKey) {
    selectedWorldKey.value = normalizedRecord.worldKey;
  }
  creature.value = normalizedRecord;
  encounterTable.value = Array.isArray(normalizedRecord.encounterTable) ? [...normalizedRecord.encounterTable] : [];
  toastService.success(`Loaded creature ${normalizedRecord.name}.`);
}

function deleteSavedCreature(recordId) {
  creatureStore.removeCreature(recordId);
  if (creature.value?.id === recordId) {
    creature.value = null;
    encounterTable.value = [];
  }
  toastService.info("Saved creature deleted.");
}

function resetForm() {
  creatureName.value = "";
  seedValue.value = "creature-alpha";
  generationMode.value = "single";
  terrain.value = "Woods";
  primaryNiche.value = "random";
  worldSize.value = "8";
  linkedWorldName.value = "";
  selectedWorldKey.value = "";
  creature.value = null;
  encounterTable.value = [];
}

async function exportCreature() {
  if (!creature.value) return;

  await exportCreatureArchive({
    data: creature.value,
    filename: (creatureRecord) => `${creatureRecord.name.replace(/\s+/g, "-")}-BeastMaker.json`,
    serializeMessage: "Serializing creature dossier...",
    encodeMessage: "Encoding creature archive for transfer...",
    readyMessage: "Creature archive staged for local transfer.",
  });
}
</script>

<style scoped>
.creature-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  min-width: 0;
}

.control-group-wide {
  grid-column: span 2;
}

.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}

.control-action {
  justify-content: flex-end;
  gap: 0.6rem;
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

.creature-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.creature-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #333;
}

.header-copy {
  min-width: 0;
}

.creature-icon {
  font-size: 3rem;
}

.creature-header h2 {
  color: #00d9ff;
  margin: 0 0 0.5rem;
}

.summary-copy {
  margin: 0 0 0.75rem;
  color: #d8e7ff;
  line-height: 1.5;
}

.creature-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(0, 217, 255, 0.12);
  color: #00d9ff;
  border: 1px solid #00d9ff44;
  padding: 0.2rem 0.6rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
}

.creature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.saved-record-list {
  display: grid;
  gap: 0.75rem;
}

.saved-record-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.85rem;
  border-radius: 0.45rem;
  background: #12122e;
}

.saved-record-copy {
  display: grid;
  gap: 0.2rem;
  color: #d8e7ff;
}

.saved-record-copy span:last-child {
  color: #9fb6d9;
  font-size: 0.85rem;
}

.saved-record-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.creature-section {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.creature-section h3 {
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
  min-width: 130px;
  font-weight: bold;
}

.prop-value {
  color: #e0e0e0;
  font-family: monospace;
  overflow-wrap: anywhere;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-box {
  background: #0d0d2b;
  border-radius: 0.4rem;
  padding: 0.6rem;
  text-align: center;
}

.stat-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
  color: #ffd700;
  font-family: monospace;
}

.section-offset {
  margin-top: 1rem;
}

.trait-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.trait-item {
  padding: 0.4rem 0.75rem;
  background: rgba(0, 217, 255, 0.08);
  border-left: 3px solid #00d9ff44;
  border-radius: 0.2rem;
  color: #e0e0e0;
  font-size: 0.9rem;
}

.encounter-table {
  margin-bottom: 1.5rem;
}

.encounter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.encounter-card {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.4rem;
  background: #0d0d2b;
}

.encounter-roll {
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #00d9ff;
  color: #04131d;
  font-weight: 700;
}

.encounter-body {
  color: #d8e7ff;
  font-size: 0.85rem;
  line-height: 1.5;
}

.empty-placeholder {
  padding: 2rem;
  background: #12122e;
  border: 1px dashed #00d9ff55;
  border-radius: 0.5rem;
  color: #d8e7ff;
}

.empty-placeholder h2 {
  margin: 0 0 0.5rem;
  color: #00ffff;
}

.empty-placeholder p {
  margin: 0;
}

@media (max-width: 900px) {
  .control-group-wide {
    grid-column: span 1;
  }

  .creature-header {
    flex-direction: column;
  }
}
</style>
