<template>
  <div class="flora-generator">
    <LoadingSpinner v-bind="floraExportOverlayProps" />
    <SurveyNavigation
      currentClass="Flora Generator"
      :show-regenerate="!!flora"
      :show-export="!!flora"
      :back-route="backRoute"
      @regenerate="generateFlora"
      @export="exportFlora"
    />

    <div class="survey-content">
      <div class="control-panel">
        <div class="control-group control-group-wide">
          <label>Flora Name</label>
          <div class="name-row">
            <input v-model="floraName" placeholder="Enter flora name…" class="text-input" />
            <button class="btn btn-secondary" type="button" @click="randomizeName">🎲</button>
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="!supportsSpeechSynthesis"
              :title="
                supportsSpeechSynthesis
                  ? isSpeakingName
                    ? 'Stop name audio'
                    : 'Speak name'
                  : 'Text to speech not supported in this browser'
              "
              @click="toggleNameSpeech"
            >
              {{ isSpeakingName ? "■" : "🔊" }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Seed</label>
          <div class="name-row">
            <input v-model="seedValue" placeholder="guid-seed" class="text-input" />
            <button class="btn btn-secondary" type="button" title="Generate new seed" @click="generateNewSeed">
              🧬 New
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>Growth Form</label>
          <select v-model="growthForm" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="entry in FLORA_GROWTH_FORMS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Climate</label>
          <select v-model="climate" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="entry in FLORA_CLIMATES" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group control-group-wide">
          <label>Saved World</label>
          <select v-model="selectedWorldKey" class="select-input">
            <option value="">Manual / Unlinked</option>
            <option v-for="entry in worldOptions" :key="entry.key" :value="entry.key">{{ entry.label }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Art Style</label>
          <select v-model="artStyle" class="select-input">
            <option v-for="entry in ART_STYLE_PRESETS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>

        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateFlora">🌱 Generate Flora</button>
          <button class="btn btn-secondary" :disabled="!flora" @click="saveFloraRecord">💾 Save</button>
          <button class="btn btn-secondary" @click="resetForm">Reset</button>
        </div>
      </div>

      <div v-if="flora" class="flora-display">
        <div class="flora-header">
          <div class="flora-icon">{{ flora.icon }}</div>
          <div>
            <h2>{{ flora.name }}</h2>
            <p class="flora-tagline">{{ flora.summary }}</p>
            <div class="flora-tags">
              <span class="tag">{{ flora.biology?.["Growth Form"] }}</span>
              <span class="tag">{{ flora.biology?.Climate }}</span>
              <span class="tag">{{ flora.uses?.["Primary Use"] }}</span>
            </div>
          </div>
        </div>

        <div class="flora-grid">
          <section class="flora-section">
            <h3>🌿 Botanical Profile</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in flora.biology" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
            </div>
          </section>

          <section class="flora-section">
            <h3>📚 Taxonomy & Lineage</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in flora.taxonomy || {}" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Origin Model</span>
                <span class="prop-value">{{ flora.lineage?.originModel || flora.origin || "Unclassified" }}</span>
              </div>
            </div>
          </section>

          <section class="flora-section">
            <h3>🌍 Ecology</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in flora.ecology" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
            </div>
          </section>

          <section class="flora-section">
            <h3>⚗️ Uses & Trade</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(value, label) in flora.uses" :key="label">
                <span class="prop-label">{{ label }}</span>
                <span class="prop-value">{{ value }}</span>
              </div>
            </div>
          </section>

          <section class="flora-section">
            <h3>✨ Adaptations</h3>
            <div class="trait-list">
              <div v-for="entry in flora.adaptations || []" :key="entry" class="trait-item">{{ entry }}</div>
            </div>
          </section>

          <section class="flora-section">
            <h3>📝 Adventure Hooks</h3>
            <div class="trait-list">
              <div v-for="entry in flora.hooks || []" :key="entry" class="trait-item">{{ entry }}</div>
            </div>
          </section>

          <section class="flora-section flora-section--wide">
            <h3>🎨 Image Description</h3>
            <div class="trait-list">
              <div class="trait-item">{{ flora.visualDescription }}</div>
            </div>
            <div class="prompt-block section-offset">
              <div class="prompt-header">
                <div class="prompt-label">Image Prompt</div>
                <div class="saved-record-actions">
                  <button type="button" class="btn btn-secondary btn-copy" @click="copyPromptText(flora.imagePrompt)">
                    Copy Prompt
                  </button>
                  <button type="button" class="btn btn-secondary btn-copy" @click="generateConceptArt(flora)">
                    Generate Art
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary btn-copy"
                    :disabled="!artPreviewUrl"
                    @click="openArtPreview"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary btn-copy"
                    :disabled="!artPreviewUrl"
                    @click="clearArtPreview"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea readonly class="prompt-textarea" :value="flora.imagePrompt"></textarea>
            </div>
            <div v-if="artPreviewUrl" class="prompt-block section-offset">
              <div class="prompt-label">Concept Art Preview · {{ artStyle }}</div>
              <img :src="artPreviewUrl" alt="Generated flora concept art preview" class="concept-art-preview" />
            </div>
            <p class="prompt-caption">{{ flora.imageCaption }}</p>
          </section>

          <section class="flora-section">
            <h3>Linked World Context</h3>
            <div class="trait-list">
              <div class="trait-item">{{ flora.worldIntegration?.summary || "Linked world context pending." }}</div>
              <div v-for="note in flora.worldIntegration?.notes || []" :key="note" class="trait-item">{{ note }}</div>
            </div>
          </section>
        </div>
      </div>

      <section class="flora-display flora-archive">
        <div class="flora-header">
          <div class="flora-icon">📚</div>
          <div>
            <h2>Saved Flora</h2>
            <p class="flora-tagline">Reload or refine persistent plant dossiers linked to this world.</p>
          </div>
        </div>
        <div v-if="savedFlora.length" class="saved-record-list">
          <article v-for="entry in savedFlora" :key="entry.id" class="saved-record-card">
            <div class="saved-record-copy">
              <strong>{{ entry.name }}</strong>
              <span>{{ entry.taxonomy?.["Scientific Name"] || "Unclassified flora" }}</span>
              <span>{{ entry.lineage?.originModel || entry.worldName || "Unlinked habitat" }}</span>
              <span>{{ entry.uses?.["Primary Use"] || entry.summary || "Saved flora" }}</span>
            </div>
            <div class="saved-record-actions">
              <button class="btn btn-secondary" @click="loadSavedFlora(entry)">Load</button>
              <button class="btn btn-secondary" @click="deleteSavedFlora(entry.id)">Delete</button>
            </div>
          </article>
        </div>
        <p v-else class="empty-archive-note">No saved flora yet. Generate and save a plant to see it here.</p>
      </section>

      <div v-if="!flora" class="empty-placeholder">
        <h2>Procedural Flora Generator</h2>
        <p>Generate world-linked plants with ecology, trade value, hazards, and field hooks.</p>
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
import { useFloraStore } from "../../stores/floraStore.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import {
  buildFloraImagePrompt,
  buildFloraWorldUpdate,
  buildWorldLinkedFloraOptions,
  FLORA_CLIMATES,
  FLORA_GROWTH_FORMS,
  generateFloraProfile,
  randomFloraName,
} from "../../utils/beasts/floraGenerator.js";
import { generateGuidSeed } from "../../utils/beasts/beastGenerator.js";
import {
  buildPropagationOriginNote,
  cloneSpeciesTemplate,
  pickNearbySpeciesTemplate,
} from "../../utils/beasts/speciesPropagation.js";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import {
  isSpeechSynthesisSupported,
  speakTextWithPreferences,
  stopSpeechSynthesis,
} from "../../utils/speechSynthesis.js";
import { ART_STYLE_PRESETS, DEFAULT_ART_STYLE, buildConceptArtUrl } from "../../utils/imageGeneration.js";
import * as toastService from "../../utils/toast.js";
import {
  findMatchingWorldOption,
  listSystemWorldOptions,
  resolveBoundSystemRecord,
  resolveSelectedWorldIndex,
} from "../../utils/worldLink.js";

const route = useRoute();
const floraStore = useFloraStore();
const preferencesStore = usePreferencesStore();
const systemStore = useSystemStore();

const backRoute = computed(
  () => deserializeReturnRoute(String(route.query.returnTo || "")) || { name: "GalaxySurvey" },
);

const { overlayProps: floraExportOverlayProps, exportJson: exportFloraArchive } = useArchiveTransfer({
  noun: "Flora",
  title: "Flora Export In Progress",
  barLabel: "Packaging flora archive for transfer",
  statusPrefix: "FLOR",
  targetLabel: () => flora.value?.name || "Archive target pending",
});

const floraName = ref("");
const isSpeakingName = ref(false);
const supportsSpeechSynthesis = isSpeechSynthesisSupported();
const artStyle = ref(DEFAULT_ART_STYLE);
const artPreviewUrl = ref("");
const seedValue = ref(generateGuidSeed("flora"));
const growthForm = ref("random");
const climate = ref("random");
const selectedWorldKey = ref("");
const flora = ref(null);

const worldOptions = computed(() => listSystemWorldOptions(systemStore.getAllSystems));

const selectedWorldOption = computed(
  () => worldOptions.value.find((entry) => entry.key === selectedWorldKey.value) || null,
);
const selectedWorldRecord = computed(() => selectedWorldOption.value?.world || null);
const activeWorldCriteria = computed(() => ({
  worldKey: selectedWorldKey.value,
  systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
  worldName: selectedWorldOption.value?.worldName || String(route.query.worldName || ""),
}));
const savedFlora = computed(() => floraStore.floraByWorld(activeWorldCriteria.value));
let floraSpeciesPoolHydrated = false;

watch(
  activeWorldCriteria,
  async (criteria) => {
    await floraStore.hydrateFlora(criteria);
  },
  { immediate: true, deep: true },
);

async function persistFloraToWorldContext(record) {
  const worldIndex = resolveSelectedWorldIndex(selectedWorldOption.value, route);
  const persistedSystem = resolveBoundSystemRecord({
    selectedWorldOption: selectedWorldOption.value,
    route,
    systemStore,
  });
  if (
    worldIndex === null ||
    !persistedSystem ||
    !Array.isArray(persistedSystem.planets) ||
    !persistedSystem.planets[worldIndex]
  ) {
    return false;
  }

  const nextPlanets = persistedSystem.planets.map((planet, index) => {
    if (index !== worldIndex) {
      return planet && typeof planet === "object" ? { ...planet } : planet;
    }
    return {
      ...planet,
      ...buildFloraWorldUpdate(record, planet),
    };
  });

  const updatedSystem = await systemStore.updateSystem(persistedSystem.systemId, {
    planets: nextPlanets,
    metadata: {
      ...(persistedSystem.metadata && typeof persistedSystem.metadata === "object" ? persistedSystem.metadata : {}),
      linkedFloraUpdatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  });

  if (updatedSystem?.systemId) {
    systemStore.setCurrentSystem(updatedSystem.systemId);
  }
  return true;
}

watch(
  worldOptions,
  (options) => {
    if (!options.length || selectedWorldKey.value) {
      return;
    }

    const match = findMatchingWorldOption(options, route);
    if (match) {
      selectedWorldKey.value = match.key;
    }
  },
  { immediate: true },
);

watch(selectedWorldRecord, (world) => {
  if (!world) return;
  const linked = buildWorldLinkedFloraOptions(world);
  climate.value = linked.climate;
  growthForm.value = linked.growthForm;
  if (!String(floraName.value || "").trim()) {
    floraName.value = String(world?.name || "").trim();
  }
});

function generateNewSeed() {
  seedValue.value = generateGuidSeed("flora");
  return seedValue.value;
}

function ensureSeed() {
  if (!String(seedValue.value || "").trim()) {
    return generateNewSeed();
  }
  return String(seedValue.value).trim();
}

function randomizeName() {
  floraName.value = randomFloraName(generateGuidSeed("flora-name"));
}

function stopNameSpeech() {
  if (!supportsSpeechSynthesis) return;
  stopSpeechSynthesis();
  isSpeakingName.value = false;
}

function toggleNameSpeech() {
  if (!supportsSpeechSynthesis) {
    toastService.error("Text to speech is not supported in this browser.");
    return;
  }

  if (isSpeakingName.value) {
    stopNameSpeech();
    return;
  }

  const displayName = String(floraName.value || flora.value?.name || "").trim();
  if (!displayName) {
    toastService.error("No flora name is available to speak yet.");
    return;
  }

  isSpeakingName.value = true;
  const result = speakTextWithPreferences(displayName, {
    rate: preferencesStore.ttsRate,
    pitch: preferencesStore.ttsPitch,
    voiceURI: preferencesStore.ttsVoiceURI,
    onEnd: () => {
      isSpeakingName.value = false;
    },
    onError: () => {
      isSpeakingName.value = false;
      toastService.error("Unable to play flora name audio.");
    },
  });

  if (!result.ok) {
    isSpeakingName.value = false;
    toastService.error(
      result.reason === "unsupported"
        ? "Text to speech is not supported in this browser."
        : "Unable to play flora name audio.",
    );
  }
}

function generateConceptArt(record = flora.value) {
  const prompt = String(record?.imagePrompt || "").trim();
  if (!prompt) {
    toastService.error("Generate flora before requesting concept art.");
    return;
  }

  artPreviewUrl.value = buildConceptArtUrl(prompt, {
    entityType: "flora",
    style: artStyle.value,
    seed: record?.seed || seedValue.value,
    width: 1024,
    height: 1024,
  });
}

function openArtPreview() {
  if (!artPreviewUrl.value) {
    toastService.error("No concept art preview is available yet.");
    return;
  }

  if (typeof window !== "undefined") {
    window.open(artPreviewUrl.value, "_blank", "noopener,noreferrer");
  }
}

function clearArtPreview() {
  artPreviewUrl.value = "";
}

async function copyPromptText(text) {
  if (!String(text || "").trim()) {
    toastService.error("No image prompt is available to copy.");
    return;
  }

  try {
    if (globalThis?.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text);
    } else if (typeof document !== "undefined") {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "absolute";
      helper.style.left = "-9999px";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }

    toastService.success("Image prompt copied to clipboard.");
  } catch {
    toastService.error("Unable to copy the image prompt.");
  }
}

async function ensureFloraSpeciesPool() {
  if (floraSpeciesPoolHydrated) {
    return;
  }

  await floraStore.hydrateFlora({}, {});
  floraSpeciesPoolHydrated = true;
}

async function generateFlora() {
  const seed = ensureSeed();
  const resolvedClimate =
    climate.value === "random" ? FLORA_CLIMATES[Math.floor(Math.random() * FLORA_CLIMATES.length)] : climate.value;
  if (!String(floraName.value || "").trim()) {
    randomizeName();
  }

  await ensureFloraSpeciesPool();

  const linked = selectedWorldRecord.value
    ? buildWorldLinkedFloraOptions(selectedWorldRecord.value)
    : {
        sourceWorld: null,
        climate: climate.value,
        growthForm: growthForm.value,
      };

  const propagated = pickNearbySpeciesTemplate({
    records: floraStore.getAllFlora,
    systems: systemStore.getAllSystems,
    currentSystemId:
      selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
    currentWorldKey: selectedWorldKey.value,
  });

  if (propagated?.record) {
    const template = cloneSpeciesTemplate(propagated.record);
    const originNote = buildPropagationOriginNote(propagated);
    const visuals = buildFloraImagePrompt({
      name: String(template?.name || floraName.value.trim() || "Generated Flora"),
      biology: template?.biology || {},
      ecology: template?.ecology || {},
      adaptations: Array.isArray(template?.adaptations) ? template.adaptations : [],
      uses: template?.uses || {},
      sourceWorld: linked.sourceWorld,
    });

    flora.value = {
      ...template,
      ...visuals,
      id: flora.value?.id || null,
      seed,
      sourceWorld: linked.sourceWorld,
      systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
      worldKey: selectedWorldKey.value,
      worldName: selectedWorldOption.value?.worldName || linked.sourceWorld?.name || "",
      savedAt: flora.value?.savedAt || null,
      updatedAt: null,
      origin: originNote,
      lineage:
        template?.lineage && typeof template.lineage === "object"
          ? {
              ...template.lineage,
              originModel: originNote,
              uniquenessStatement: originNote,
            }
          : template?.lineage,
    };
    return;
  }

  const next = generateFloraProfile({
    seed,
    name: floraName.value.trim() || "Generated Flora",
    growthForm: growthForm.value,
    climate: resolvedClimate,
    sourceWorld: linked.sourceWorld,
  });

  flora.value = {
    ...next,
    id: flora.value?.id || next.id || null,
    savedAt: flora.value?.savedAt || null,
  };
}

async function saveFloraRecord() {
  if (!flora.value) {
    toastService.error("Generate flora before saving it.");
    return;
  }

  const persisted = await floraStore.saveFlora({
    ...flora.value,
    seed: seedValue.value,
    growthFormSelection: growthForm.value,
    climateSelection: climate.value,
    systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
    worldKey: selectedWorldKey.value,
    worldName: selectedWorldOption.value?.worldName || flora.value.sourceWorld?.name || "",
  });

  flora.value = { ...flora.value, id: persisted.id, savedAt: persisted.savedAt, updatedAt: persisted.updatedAt };
  const linked = await persistFloraToWorldContext(persisted);
  toastService.success(
    linked ? `Saved flora ${persisted.name} and linked it to the world survey.` : `Saved flora ${persisted.name}.`,
  );
}

function loadSavedFlora(record) {
  if (!record) return;

  const fallbackProfile =
    record.biology && record.ecology && record.uses
      ? null
      : generateFloraProfile({
          seed: record.seed || generateGuidSeed("flora"),
          name: record.name || "Generated Flora",
          growthForm: record.growthFormSelection || record.biology?.["Growth Form"] || "random",
          climate: record.climateSelection || record.biology?.Climate || "random",
          sourceWorld: record.sourceWorld || null,
        });

  const normalizedRecord = {
    ...(fallbackProfile || {}),
    ...record,
    biology: record.biology || fallbackProfile?.biology || {},
    ecology: record.ecology || fallbackProfile?.ecology || {},
    uses: record.uses || fallbackProfile?.uses || {},
    adaptations: Array.isArray(record.adaptations)
      ? [...record.adaptations]
      : Array.isArray(fallbackProfile?.adaptations)
        ? [...fallbackProfile.adaptations]
        : [],
    hooks: Array.isArray(record.hooks)
      ? [...record.hooks]
      : Array.isArray(fallbackProfile?.hooks)
        ? [...fallbackProfile.hooks]
        : [],
    worldIntegration: record.worldIntegration || fallbackProfile?.worldIntegration || { summary: "—", notes: [] },
  };

  const promptDetails = buildFloraImagePrompt(normalizedRecord);
  normalizedRecord.visualDescription = normalizedRecord.visualDescription || promptDetails.visualDescription;
  normalizedRecord.imagePrompt = normalizedRecord.imagePrompt || promptDetails.imagePrompt;
  normalizedRecord.imageCaption = normalizedRecord.imageCaption || promptDetails.imageCaption;

  floraName.value = normalizedRecord.name || "";
  seedValue.value = normalizedRecord.seed || generateGuidSeed("flora");
  growthForm.value = normalizedRecord.growthFormSelection || normalizedRecord.biology?.["Growth Form"] || "random";
  climate.value = normalizedRecord.climateSelection || normalizedRecord.biology?.Climate || "random";
  if (normalizedRecord.worldKey) {
    selectedWorldKey.value = normalizedRecord.worldKey;
  }
  flora.value = normalizedRecord;
  toastService.success(`Loaded flora ${normalizedRecord.name}.`);
}

async function deleteSavedFlora(recordId) {
  await floraStore.removeFlora(recordId);
  if (flora.value?.id === recordId) {
    flora.value = null;
  }
  toastService.info("Saved flora deleted.");
}

function resetForm() {
  stopNameSpeech();
  clearArtPreview();
  floraName.value = "";
  seedValue.value = generateGuidSeed("flora");
  growthForm.value = "random";
  climate.value = "random";
  selectedWorldKey.value = "";
  flora.value = null;
}

async function exportFlora() {
  if (!flora.value) return;
  await exportFloraArchive({
    data: {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      recordType: "flora",
      manifest: {
        displayName: flora.value.name || "Flora",
        scientificName: flora.value.taxonomy?.["Scientific Name"] || "Unclassified flora",
        originModel: flora.value.lineage?.originModel || flora.value.origin || "Unknown lineage",
        worldName: flora.value.sourceWorld?.name || selectedWorldOption.value?.worldName || "Unlinked habitat",
      },
      data: flora.value,
    },
    filename: (record) => `${record.name.replace(/\s+/g, "-")}-Flora.json`,
    serializeMessage: "Serializing flora dossier...",
    encodeMessage: "Encoding flora archive for transfer...",
    readyMessage: "Flora archive staged for local transfer.",
  });
}
</script>

<style scoped>
.flora-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.control-panel,
.flora-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.6rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.control-group-wide {
  grid-column: span 2;
}

.control-action {
  justify-content: flex-end;
}

label {
  color: #8fdcff;
  font-size: 0.85rem;
  font-weight: 600;
}

.name-row {
  display: flex;
  gap: 0.5rem;
}

.text-input,
.select-input {
  min-height: 2.45rem;
  padding: 0.65rem 0.8rem;
  background: #111827;
  color: #e8f7ff;
  border: 1px solid rgba(0, 217, 255, 0.45);
  border-radius: 0.4rem;
}

.btn {
  min-height: 2.45rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 700;
}

.btn-primary {
  background: #00d9ff;
  color: #02131b;
}

.btn-secondary {
  background: #334155;
  color: #e8f7ff;
}

.flora-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.flora-icon {
  font-size: 2rem;
}

.flora-tagline {
  color: #cce9f6;
  margin-top: 0.25rem;
}

.flora-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem;
}

.flora-section {
  background: rgba(10, 15, 26, 0.4);
  border: 1px solid rgba(0, 217, 255, 0.18);
  border-radius: 0.5rem;
  padding: 0.85rem;
}

.flora-section--wide {
  grid-column: 1 / -1;
}

.flora-section h3 {
  color: #7ce6ff;
  margin-bottom: 0.75rem;
}

.prop-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.prop-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.prop-label {
  color: #93c5fd;
  font-weight: 600;
}

.prop-value {
  color: #f8fafc;
  text-align: right;
}

.trait-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.trait-item {
  background: rgba(15, 23, 42, 0.55);
  border-radius: 0.45rem;
  padding: 0.55rem 0.7rem;
  color: #e2f6ff;
}

.section-offset {
  margin-top: 0.75rem;
}

.prompt-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.prompt-label {
  color: #8fdcff;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.prompt-textarea {
  min-height: 7rem;
  resize: vertical;
  background: #08111c;
  color: #eaf8ff;
  border: 1px solid rgba(0, 217, 255, 0.35);
  border-radius: 0.45rem;
  padding: 0.7rem;
  line-height: 1.45;
}

.btn-copy {
  min-height: 2rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
}

.prompt-caption {
  margin: 0.75rem 0 0;
  color: #9fb6d9;
  font-style: italic;
}

.flora-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.tag {
  background: rgba(0, 217, 255, 0.12);
  color: #7ce6ff;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
}

.saved-record-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.saved-record-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  background: rgba(15, 23, 42, 0.45);
  border-radius: 0.5rem;
  padding: 0.8rem;
}

.saved-record-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.saved-record-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-archive-note {
  padding: 1rem 1.5rem;
  color: #7ba3c8;
  font-style: italic;
  margin: 0;
}

.empty-placeholder {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.6rem;
}

@media (max-width: 900px) {
  .control-group-wide {
    grid-column: span 1;
  }

  .prop-row,
  .saved-record-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .prop-value {
    text-align: left;
  }
}
</style>
