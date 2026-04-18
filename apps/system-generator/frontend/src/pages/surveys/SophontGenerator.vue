<template>
  <div class="sophont-generator">
    <LoadingSpinner v-bind="sophontExportOverlayProps" />
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
          <label>Seed:</label>
          <input v-model="seedValue" placeholder="repeatable-seed" class="text-input" />
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
        <div class="control-group">
          <label>Saved World:</label>
          <select v-model="selectedWorldKey" class="select-input">
            <option value="">Manual / Unlinked</option>
            <option v-for="entry in worldOptions" :key="entry.key" :value="entry.key">{{ entry.label }}</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateSophont">⚡ Generate Sophont</button>
          <button class="btn btn-secondary" :disabled="!sophont" @click="saveSophontRecord">💾 Save</button>
          <button class="btn btn-secondary" @click="resetForm">Reset</button>
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
              <div class="prop-row">
                <span class="prop-label">Origin:</span>
                <span class="prop-value">{{ sophont.origin }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">World of Origin:</span>
                <span class="prop-value">{{ sophont.sourceWorld?.name || "Unlinked culture" }}</span>
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

      <section v-if="savedSophonts.length" class="sophont-display sophont-archive">
        <div class="sophont-header">
          <div class="sophont-icon">📚</div>
          <div>
            <h2>Saved Sophonts</h2>
            <p class="sophont-tagline">Reload or refine persistent species dossiers linked to this world.</p>
          </div>
        </div>
        <div class="saved-record-list">
          <article v-for="entry in savedSophonts" :key="entry.id" class="saved-record-card">
            <div class="saved-record-copy">
              <strong>{{ entry.name }}</strong>
              <span>{{ entry.worldName || "Unlinked culture" }}</span>
              <span>{{ entry.origin || entry.tagline }}</span>
            </div>
            <div class="saved-record-actions">
              <button class="btn btn-secondary" @click="loadSavedSophont(entry)">Load</button>
              <button class="btn btn-secondary" @click="deleteSavedSophont(entry.id)">Delete</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { useSophontStore } from "../../stores/sophontStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import {
  BODY_PLANS,
  HOME_ENVS,
  buildWorldLinkedSophontOptions,
  generateSophontProfile,
  randomSophontName,
} from "../../utils/beasts/sophontGenerator.js";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import * as toastService from "../../utils/toast.js";

const route = useRoute();
const sophontStore = useSophontStore();
const systemStore = useSystemStore();

const backRoute = computed(
  () => deserializeReturnRoute(String(route.query.returnTo || "")) || { name: "GalaxySurvey" },
);

const { overlayProps: sophontExportOverlayProps, exportJson: exportSophontArchive } = useArchiveTransfer({
  noun: "Sophont",
  title: "Sophont Export In Progress",
  barLabel: "Packaging sophont archive for transfer",
  statusPrefix: "SOPH",
  targetLabel: () => sophont.value?.name || "Archive target pending",
});

const speciesName = ref("");
const seedValue = ref("sophont-alpha");
const bodyPlan = ref("random");
const homeEnvironment = ref("random");
const selectedWorldKey = ref("");
const sophont = ref(null);

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
  worldName: selectedWorldOption.value?.worldName || String(route.query.worldName || ""),
}));
const savedSophonts = computed(() => sophontStore.sophontsByWorld(activeWorldCriteria.value));

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
    }
  },
  { immediate: true },
);

watch(selectedWorldRecord, (world) => {
  if (!world) return;
  const linked = buildWorldLinkedSophontOptions(world);
  homeEnvironment.value = linked.homeEnvironment;
  bodyPlan.value = linked.bodyPlan;
  if (!String(speciesName.value || "").trim()) {
    speciesName.value = String(world?.name || "").trim();
  }
});

function ensureSeed() {
  if (!String(seedValue.value || "").trim()) {
    seedValue.value = `sophont-${Date.now()}`;
  }
  return String(seedValue.value).trim();
}

function randomizeName() {
  speciesName.value = randomSophontName(ensureSeed());
}

function generateSophont() {
  const seed = ensureSeed();
  if (!String(speciesName.value || "").trim()) {
    randomizeName();
  }

  const linked = selectedWorldRecord.value
    ? buildWorldLinkedSophontOptions(selectedWorldRecord.value)
    : {
        sourceWorld: null,
        homeEnvironment: homeEnvironment.value,
        bodyPlan: bodyPlan.value,
      };

  const next = generateSophontProfile({
    seed,
    name: speciesName.value.trim() || "Generated Sophont",
    bodyPlan: bodyPlan.value === "random" ? linked.bodyPlan || "random" : bodyPlan.value,
    homeEnvironment: homeEnvironment.value === "random" ? linked.homeEnvironment || "random" : homeEnvironment.value,
    sourceWorld: linked.sourceWorld,
  });

  sophont.value = {
    ...next,
    id: sophont.value?.id || null,
    savedAt: sophont.value?.savedAt || null,
  };
}

function saveSophontRecord() {
  if (!sophont.value) {
    toastService.error("Generate a sophont before saving it.");
    return;
  }

  const persisted = sophontStore.saveSophont({
    ...sophont.value,
    seed: seedValue.value,
    bodyPlanSelection: bodyPlan.value,
    homeEnvironmentSelection: homeEnvironment.value,
    systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
    worldKey: selectedWorldKey.value,
    worldName: selectedWorldOption.value?.worldName || sophont.value.sourceWorld?.name || "",
  });

  sophont.value = { ...sophont.value, id: persisted.id, savedAt: persisted.savedAt, updatedAt: persisted.updatedAt };
  toastService.success(`Saved sophont ${persisted.name}.`);
}

function loadSavedSophont(record) {
  if (!record) return;
  speciesName.value = record.name || "";
  seedValue.value = record.seed || "sophont-alpha";
  bodyPlan.value = record.bodyPlanSelection || record.biology?.["Body Plan"] || "random";
  homeEnvironment.value = record.homeEnvironmentSelection || record.biology?.["Home Environment"] || "random";
  if (record.worldKey) {
    selectedWorldKey.value = record.worldKey;
  }
  sophont.value = { ...record };
  toastService.success(`Loaded sophont ${record.name}.`);
}

function deleteSavedSophont(recordId) {
  sophontStore.removeSophont(recordId);
  if (sophont.value?.id === recordId) {
    sophont.value = null;
  }
  toastService.info("Saved sophont deleted.");
}

function resetForm() {
  speciesName.value = "";
  seedValue.value = "sophont-alpha";
  bodyPlan.value = "random";
  homeEnvironment.value = "random";
  selectedWorldKey.value = "";
  sophont.value = null;
}

async function exportSophont() {
  if (!sophont.value) return;
  await exportSophontArchive({
    data: sophont.value,
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

.saved-record-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
