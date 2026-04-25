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
          <label>Seed:</label>
          <div class="name-row">
            <input v-model="seedValue" placeholder="guid-seed" class="text-input" />
            <button class="btn btn-secondary" @click="generateNewSeed">🧬</button>
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
        <div class="control-group">
          <label>Saved World:</label>
          <select v-model="selectedWorldKey" class="select-input">
            <option value="">Manual / Unlinked</option>
            <option v-for="entry in worldOptions" :key="entry.key" :value="entry.key">{{ entry.label }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Art Style:</label>
          <select v-model="artStyle" class="select-input">
            <option v-for="entry in ART_STYLE_PRESETS" :key="entry" :value="entry">{{ entry }}</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateSophont">⚡ Generate Sophont</button>
          <button class="btn btn-secondary" :disabled="!sophont" @click="saveSophontRecord">💾 Save</button>
          <button class="btn btn-secondary" @click="goToHistoryGenerator">📜 History</button>
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

          <section class="sophont-section">
            <h3>📚 Taxonomy & Lineage</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in sophont.taxonomy || {}" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Origin Model:</span>
                <span class="prop-value">{{ sophont.lineage?.originModel || sophont.origin }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Human Analogue:</span>
                <span class="prop-value">{{ sophont.lineage?.humanAnalogueStatus || "No clear Terran analogue" }}</span>
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

          <section class="sophont-section">
            <h3>🌐 Civilization & Contact</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in sophont.civilization || {}" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
          </section>

          <section class="sophont-section">
            <h3>🤝 Diplomacy Hooks</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in diplomacySummaryRows" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
            <div class="trait-list">
              <div v-for="hook in sophont.diplomacy?.hooks || []" :key="hook" class="trait-item">{{ hook }}</div>
            </div>
          </section>

          <section class="sophont-section">
            <h3>⚔️ Faction Pressure</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in factionSummaryRows" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
            <div class="trait-list">
              <div
                v-for="faction in sophont.factionTensions?.factions || []"
                :key="`${faction.name}-${faction.role}`"
                class="trait-item"
              >
                <span class="trait-name">{{ faction.name }} — {{ faction.role }}</span>
                <span class="trait-desc">{{ faction.agenda }}</span>
              </div>
              <div v-for="hook in sophont.factionTensions?.hooks || []" :key="hook" class="trait-item">{{ hook }}</div>
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

          <section class="sophont-section">
            <h3>History Timeline</h3>
            <div class="trait-list">
              <div
                v-for="event in sophont.historyTimeline || []"
                :key="`${event.era}-${event.title}`"
                class="trait-item"
              >
                <span class="trait-name">{{ event.era }} — {{ event.title }}</span>
                <span class="trait-desc">{{ event.summary }}</span>
              </div>
            </div>
          </section>

          <section class="sophont-section">
            <h3>🎯 Event Chain</h3>
            <div class="trait-list">
              <div v-for="entry in sophont.eventChain || []" :key="`${entry.phase}-${entry.title}`" class="trait-item">
                <span class="trait-name">{{ entry.phase }} — {{ entry.title }}</span>
                <span class="trait-desc">{{ entry.summary }}</span>
                <span class="trait-desc">Stake: {{ entry.stakes }}</span>
              </div>
            </div>
          </section>

          <section class="sophont-section sophont-section-wide">
            <h3>🎨 Image Description</h3>
            <p class="sophont-tagline prompt-summary">{{ sophont.visualDescription }}</p>
            <div class="prompt-block">
              <div class="prompt-header">
                <span class="prompt-label">Image Prompt</span>
                <div class="saved-record-actions">
                  <button type="button" class="btn btn-secondary btn-copy" @click="copyPromptText(sophont.imagePrompt)">
                    Copy Prompt
                  </button>
                  <button type="button" class="btn btn-secondary btn-copy" @click="generateConceptArt(sophont)">
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
              <textarea :value="sophont.imagePrompt" class="prompt-textarea" rows="5" readonly />
            </div>
            <div v-if="artPreviewUrl" class="prompt-block section-offset">
              <span class="prompt-label">Concept Art Preview · {{ artStyle }}</span>
              <img :src="artPreviewUrl" alt="Generated sophont concept art preview" class="concept-art-preview" />
            </div>
            <p class="prompt-caption">{{ sophont.imageCaption }}</p>
          </section>

          <section class="sophont-section">
            <h3>Linked World Context</h3>
            <div class="trait-list">
              <div class="trait-item">{{ sophont.worldIntegration?.summary || "Linked world context pending." }}</div>
              <div v-for="note in sophont.worldIntegration?.notes || []" :key="note" class="trait-item">{{ note }}</div>
            </div>
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
              <span>{{ entry.taxonomy?.["Scientific Name"] || "Unclassified sophont" }}</span>
              <span>{{ entry.lineage?.originModel || entry.origin || entry.worldName || "Unlinked culture" }}</span>
              <span>{{ entry.tagline || "Saved dossier" }}</span>
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
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSophontStore } from "../../stores/sophontStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import {
  BODY_PLANS,
  HOME_ENVS,
  buildSophontImagePrompt,
  buildSophontWorldUpdate,
  buildWorldLinkedSophontOptions,
  generateSophontProfile,
  randomSophontName,
} from "../../utils/beasts/sophontGenerator.js";
import { generateGuidSeed } from "../../utils/beasts/beastGenerator.js";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
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
const router = useRouter();
const preferencesStore = usePreferencesStore();
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
const isSpeakingName = ref(false);
const supportsSpeechSynthesis = isSpeechSynthesisSupported();
const artStyle = ref(DEFAULT_ART_STYLE);
const artPreviewUrl = ref("");
const seedValue = ref(generateGuidSeed("sophont"));
const bodyPlan = ref("random");
const homeEnvironment = ref("random");
const selectedWorldKey = ref("");
const sophont = ref(null);

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
const savedSophonts = computed(() => sophontStore.sophontsByWorld(activeWorldCriteria.value));

watch(
  activeWorldCriteria,
  async (criteria) => {
    await sophontStore.hydrateSophonts(criteria);
  },
  { immediate: true, deep: true },
);
const diplomacySummaryRows = computed(() => {
  if (!sophont.value?.diplomacy) {
    return {};
  }

  const { hooks, techBand, ...display } = sophont.value.diplomacy;
  return display;
});
const factionSummaryRows = computed(() => {
  if (!sophont.value?.factionTensions) {
    return {};
  }

  const { factions, hooks, ...display } = sophont.value.factionTensions;
  return display;
});

async function persistSophontToWorldContext(record) {
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
      ...buildSophontWorldUpdate(record, planet),
    };
  });

  const updatedSystem = await systemStore.updateSystem(persistedSystem.systemId, {
    planets: nextPlanets,
    metadata: {
      ...(persistedSystem.metadata && typeof persistedSystem.metadata === "object" ? persistedSystem.metadata : {}),
      linkedSophontsUpdatedAt: new Date().toISOString(),
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
  const linked = buildWorldLinkedSophontOptions(world);
  homeEnvironment.value = linked.homeEnvironment;
  bodyPlan.value = linked.bodyPlan;
  if (!String(speciesName.value || "").trim()) {
    speciesName.value = String(world?.name || "").trim();
  }
});

function generateNewSeed() {
  seedValue.value = generateGuidSeed("sophont");
  return seedValue.value;
}

function ensureSeed() {
  if (!String(seedValue.value || "").trim()) {
    return generateNewSeed();
  }
  return String(seedValue.value).trim();
}

function randomizeName() {
  speciesName.value = randomSophontName(generateGuidSeed("sophont-name"));
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

  const displayName = String(speciesName.value || sophont.value?.name || "").trim();
  if (!displayName) {
    toastService.error("No sophont name is available to speak yet.");
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
      toastService.error("Unable to play sophont name audio.");
    },
  });

  if (!result.ok) {
    isSpeakingName.value = false;
    toastService.error(
      result.reason === "unsupported"
        ? "Text to speech is not supported in this browser."
        : "Unable to play sophont name audio.",
    );
  }
}

function generateConceptArt(record = sophont.value) {
  const prompt = String(record?.imagePrompt || "").trim();
  if (!prompt) {
    toastService.error("Generate a sophont before requesting concept art.");
    return;
  }

  artPreviewUrl.value = buildConceptArtUrl(prompt, {
    entityType: "sophont",
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

function buildHistoryRouteQuery() {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "SophontGenerator"),
    params: { ...route.params },
    query: { ...route.query },
  });

  return {
    civilizationName: String(sophont.value?.name || speciesName.value || "").trim(),
    worldName: String(
      selectedWorldOption.value?.worldName || sophont.value?.sourceWorld?.name || route.query.worldName || "",
    ).trim(),
    seed: String(seedValue.value || "").trim(),
    government: String(sophont.value?.government || "").trim(),
    diplomaticPosture: String(
      sophont.value?.diplomacy?.["Current Stance"] || sophont.value?.civilization?.["Diplomatic Posture"] || "",
    ).trim(),
    pressureLevel: String(sophont.value?.factionTensions?.["Pressure Level"] || "").trim(),
    techBand: String(sophont.value?.civilization?.["Tech Band"] || "").trim(),
    worldTraits: [
      sophont.value?.biology?.["Home Environment"],
      selectedWorldRecord.value?.tempCategory,
      selectedWorldRecord.value?.atmosphereDesc,
      ...(Array.isArray(selectedWorldRecord.value?.tradeCodes) ? selectedWorldRecord.value.tradeCodes : []),
    ]
      .map((entry) => String(entry || "").trim())
      .filter(Boolean)
      .join(", "),
    flashpoint: String(sophont.value?.diplomacy?.["Current Flashpoint"] || "").trim(),
    conflictSummary: String(sophont.value?.factionTensions?.summary || "").trim(),
    eventHook: String(
      sophont.value?.eventChain?.[0]?.title || sophont.value?.historyTimeline?.at(-1)?.title || "",
    ).trim(),
    source: "sophont-generator",
    ...(returnTo ? { returnTo } : {}),
  };
}

function goToHistoryGenerator() {
  router.push({
    name: "HistoryGenerator",
    query: buildHistoryRouteQuery(),
  });
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
    id: sophont.value?.id || next.id || null,
    savedAt: sophont.value?.savedAt || null,
  };
}

async function saveSophontRecord() {
  if (!sophont.value) {
    toastService.error("Generate a sophont before saving it.");
    return;
  }

  const persisted = await sophontStore.saveSophont({
    ...sophont.value,
    seed: seedValue.value,
    bodyPlanSelection: bodyPlan.value,
    homeEnvironmentSelection: homeEnvironment.value,
    systemId: selectedWorldOption.value?.systemId || String(route.query.systemId || route.query.systemRecordId || ""),
    worldKey: selectedWorldKey.value,
    worldName: selectedWorldOption.value?.worldName || sophont.value.sourceWorld?.name || "",
  });

  sophont.value = { ...sophont.value, id: persisted.id, savedAt: persisted.savedAt, updatedAt: persisted.updatedAt };
  const linked = await persistSophontToWorldContext(persisted);
  toastService.success(
    linked ? `Saved sophont ${persisted.name} and linked it to the world survey.` : `Saved sophont ${persisted.name}.`,
  );
}

function loadSavedSophont(record) {
  if (!record) return;

  const fallbackProfile =
    record.civilization && record.worldIntegration
      ? null
      : generateSophontProfile({
          seed: record.seed || generateGuidSeed("sophont"),
          name: record.name || "Generated Sophont",
          bodyPlan: record.bodyPlanSelection || record.biology?.["Body Plan"] || "random",
          homeEnvironment: record.homeEnvironmentSelection || record.biology?.["Home Environment"] || "random",
          sourceWorld: record.sourceWorld || null,
        });

  const normalizedRecord = {
    ...(fallbackProfile || {}),
    ...record,
    civilization: record.civilization || fallbackProfile?.civilization || {},
    diplomacy: record.diplomacy || fallbackProfile?.diplomacy || { hooks: [] },
    factionTensions: record.factionTensions || fallbackProfile?.factionTensions || { factions: [], hooks: [] },
    historyTimeline: Array.isArray(record.historyTimeline)
      ? [...record.historyTimeline]
      : Array.isArray(fallbackProfile?.historyTimeline)
        ? [...fallbackProfile.historyTimeline]
        : [],
    eventChain: Array.isArray(record.eventChain)
      ? [...record.eventChain]
      : Array.isArray(fallbackProfile?.eventChain)
        ? [...fallbackProfile.eventChain]
        : [],
    worldIntegration: record.worldIntegration || fallbackProfile?.worldIntegration || { summary: "—", notes: [] },
  };

  const promptDetails = buildSophontImagePrompt(normalizedRecord);
  normalizedRecord.visualDescription = normalizedRecord.visualDescription || promptDetails.visualDescription;
  normalizedRecord.imagePrompt = normalizedRecord.imagePrompt || promptDetails.imagePrompt;
  normalizedRecord.imageCaption = normalizedRecord.imageCaption || promptDetails.imageCaption;

  speciesName.value = normalizedRecord.name || "";
  seedValue.value = normalizedRecord.seed || generateGuidSeed("sophont");
  bodyPlan.value = normalizedRecord.bodyPlanSelection || normalizedRecord.biology?.["Body Plan"] || "random";
  homeEnvironment.value =
    normalizedRecord.homeEnvironmentSelection || normalizedRecord.biology?.["Home Environment"] || "random";
  if (normalizedRecord.worldKey) {
    selectedWorldKey.value = normalizedRecord.worldKey;
  }
  sophont.value = normalizedRecord;
  toastService.success(`Loaded sophont ${normalizedRecord.name}.`);
}

async function deleteSavedSophont(recordId) {
  await sophontStore.removeSophont(recordId);
  if (sophont.value?.id === recordId) {
    sophont.value = null;
  }
  toastService.info("Saved sophont deleted.");
}

function resetForm() {
  stopNameSpeech();
  clearArtPreview();
  speciesName.value = "";
  seedValue.value = generateGuidSeed("sophont");
  bodyPlan.value = "random";
  homeEnvironment.value = "random";
  selectedWorldKey.value = "";
  sophont.value = null;
}

async function exportSophont() {
  if (!sophont.value) return;
  await exportSophontArchive({
    data: {
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      recordType: "sophont",
      manifest: {
        displayName: sophont.value.name || "Sophont",
        scientificName: sophont.value.taxonomy?.["Scientific Name"] || "Unclassified sophont",
        originModel: sophont.value.lineage?.originModel || sophont.value.origin || "Unknown origin",
        worldName: sophont.value.sourceWorld?.name || selectedWorldOption.value?.worldName || "Unlinked culture",
      },
      data: sophont.value,
    },
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
  height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
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

.sophont-section-wide {
  grid-column: 1 / -1;
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

.prompt-summary {
  color: #d8e7ff;
  font-style: normal;
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.prompt-block {
  display: grid;
  gap: 0.4rem;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.prompt-block {
  display: grid;
  gap: 0.4rem;
}

.prompt-label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.85rem;
}

.prompt-textarea {
  width: 100%;
  min-height: 7rem;
  padding: 0.75rem;
  border-radius: 0.35rem;
  border: 1px solid #00d9ff55;
  background: #0d0d2b;
  color: #d8e7ff;
  resize: vertical;
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
