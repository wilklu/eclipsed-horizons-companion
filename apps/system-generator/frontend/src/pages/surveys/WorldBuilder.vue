<template>
  <div class="world-builder">
    <LoadingSpinner v-bind="worldExportOverlayProps" />
    <LoadingSpinner
      :isVisible="worldLoadingState.active"
      context="world"
      :tone="worldLoadingState.tone"
      :stateLabel="worldLoadingState.stateLabel"
      :statusCode="worldLoadingState.statusCode"
      :title="worldLoadingState.title"
      :message="worldLoadingState.message"
      :barLabel="worldLoadingState.barLabel"
      :diagnostics="worldLoadingState.diagnostics"
      :ledger="worldLoadingState.ledger"
    />
    <SurveyNavigation currentClass="World Survey" :show-regenerate="false" :show-export="false" />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>World Name:</label>
          <div class="name-row">
            <input
              v-model="worldName"
              placeholder="Enter world name…"
              class="text-input"
              @blur="syncWorldNameToPlanetaryCatalog()"
              @keydown.enter.prevent="syncWorldNameToPlanetaryCatalog()"
            />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="!supportsSpeechSynthesis"
              :title="
                supportsSpeechSynthesis
                  ? isSpeakingWorldName
                    ? 'Stop world name audio'
                    : 'Speak world name'
                  : 'Text to speech not supported in this browser'
              "
              :aria-label="
                supportsSpeechSynthesis
                  ? isSpeakingWorldName
                    ? 'Stop world name audio'
                    : 'Speak world name'
                  : 'Text to speech not supported in this browser'
              "
              @mousedown.prevent
              @click="toggleWorldNameSpeech"
            >
              {{ isSpeakingWorldName ? "■" : "🔊" }}
            </button>
          </div>
        </div>
        <div v-if="selectedSourceWorldLabel" class="control-group control-group--source">
          <label>Selected System World:</label>
          <div class="source-world-pill">{{ selectedSourceWorldLabel }}</div>
        </div>
        <div v-if="canNavigateCatalogWorlds" class="control-group control-group--catalog-nav">
          <label>Planetary Catalog:</label>
          <div class="catalog-nav-row">
            <button class="btn btn-secondary" type="button" @click="moveToCatalogWorld(-1)">← Prev</button>
            <span class="catalog-nav-pill">World {{ selectedCatalogWorldNumber }} / {{ catalogWorldCount }}</span>
            <button class="btn btn-secondary" type="button" @click="moveToCatalogWorld(1)">Next →</button>
          </div>
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
          <router-link v-if="backRoute" :to="backRoute" class="btn btn-outline control-action-back">← Back</router-link>
        </div>
      </div>

      <!-- World Profile -->
      <div v-if="world" class="world-display">
        <div class="world-header">
          <div class="world-icon">🌍</div>
          <div class="world-header-content">
            <h2>{{ world.name }}</h2>
            <div class="uwp-display uwp-display--with-meta">
              <span class="uwp-label">Universal World Profile:</span>
              <span class="uwp-code">{{ world.uwp }}</span>
              <span class="uwp-label">Trade Codes:</span>
              <div
                v-if="Array.isArray(world.tradeCodes) && world.tradeCodes.length"
                class="trade-codes trade-codes--header"
              >
                <span
                  v-for="code in world.tradeCodes"
                  :key="code"
                  class="trade-badge"
                  :title="formatTradeCodeTooltip(code)"
                  :aria-label="formatTradeCodeTooltip(code)"
                >
                  {{ code }}
                </span>
              </div>
              <span v-else class="empty-state empty-state--inline">No trade codes applicable.</span>
            </div>
          </div>
          <button class="btn btn-secondary world-header-survey-btn" @click="openWorldPhysicalSurvey">
            📝 Open World Survey
          </button>
        </div>

        <div class="world-grid">
          <section class="world-section">
            <div class="section-header">
              <h3>🔬 Physical Properties</h3>
              <button
                class="btn btn-secondary section-reroll"
                type="button"
                data-test="reroll-physical"
                @click="rerollWorldSection('physical')"
              >
                🎲 Reroll
              </button>
            </div>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Size:</span>
                <span class="prop-value">{{ world.size ?? "—" }} ({{ formatDistanceKm(world.diameterKm) }})</span>
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
                <span class="prop-value"
                  >{{ world.tempCategory }} (avg {{ formatTemperatureFromCelsius(world.avgTempC) }})</span
                >
              </div>
              <div class="prop-row">
                <span class="prop-label">Habitability:</span>
                <span class="prop-value">{{ world.habitability }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Resources:</span>
                <span class="prop-value">{{ world.resourceRating }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Candidate Score:</span>
                <span class="prop-value">{{ world.mainworldCandidateScore }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Seismic Stress:</span>
                <span class="prop-value">{{ world.seismology?.totalSeismicStress ?? 0 }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Tectonic Plates:</span>
                <span class="prop-value">{{ world.majorTectonicPlates ?? 0 }}</span>
              </div>
            </div>
          </section>

          <section class="world-section world-section--compact">
            <div class="section-header">
              <h3>📡 Orbital Properties</h3>
              <button
                class="btn btn-secondary section-reroll"
                type="button"
                data-test="reroll-system"
                @click="rerollWorldSection('system')"
              >
                🎲 Reroll
              </button>
            </div>
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

          <section class="world-section">
            <div class="section-header">
              <h3>🧬 Life Survey</h3>
              <button
                class="btn btn-secondary section-reroll"
                type="button"
                data-test="reroll-life"
                @click="rerollWorldSection('life')"
              >
                🎲 Reroll
              </button>
            </div>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Native Lifeforms:</span>
                <span class="prop-value">{{ hasNativeLifeProfile(world.nativeLifeform) ? "Present" : "Absent" }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Native Lifeform Profile:</span>
                <span class="prop-value">{{
                  formatNativeLifeProfile(world.nativeLifeform, world.nativeSophontLife)
                }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Biomass Rating:</span>
                <span class="prop-value">{{ formatNativeLifeRating(world.nativeLifeform, 0, "biomass") }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Biocomplexity Rating:</span>
                <span class="prop-value">{{ formatNativeLifeRating(world.nativeLifeform, 1, "biocomplexity") }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Native Sophonts:</span>
                <span class="prop-value">{{ resolveNativeSophontState(world) }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Biodiversity Rating:</span>
                <span class="prop-value">{{ formatNativeLifeRating(world.nativeLifeform, 2, "biodiversity") }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Compatibility Rating:</span>
                <span class="prop-value">{{ formatNativeLifeRating(world.nativeLifeform, 3, "compatibility") }}</span>
              </div>
            </div>
            <div v-if="resolveNativeSophontState(world) === 'Exist'" class="world-note">
              Native sophont life is present. Census and civilization values are provisional WBH-style survey results
              and can be refined further in the Sophont Generator.
            </div>
            <div v-else-if="resolveNativeSophontState(world) === 'Extinct'" class="world-note">
              This world shows evidence of a prior native sophont species, but no extant sophont population is currently
              confirmed.
            </div>
            <div v-else-if="hasNativeLifeProfile(world.nativeLifeform)" class="world-note">
              Native life is present, but no native sophont species has been confirmed. Census values remain at the
              uninhabited baseline until sophonts are detected.
            </div>
            <div v-else class="world-note">
              No native life developed on this world. World Survey keeps population, government, law, tech, and starport
              at the uninhabited baseline.
            </div>
          </section>

          <section class="world-section">
            <div class="section-header">
              <h3>🌐 Linked Ecology & Society</h3>
            </div>
            <template v-if="latestLinkedFlora || latestLinkedFauna || latestLinkedSophont">
              <div v-if="latestLinkedFlora" class="prop-list">
                <div class="prop-row">
                  <span class="prop-label">Linked Flora:</span>
                  <span class="prop-value">{{ latestLinkedFlora.name }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Scientific Name:</span>
                  <span class="prop-value">{{ latestLinkedFlora.scientificName || "Unclassified flora" }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Growth Form:</span>
                  <span class="prop-value">{{ latestLinkedFlora.growthForm }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Climate:</span>
                  <span class="prop-value">{{ latestLinkedFlora.climate }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Primary Use:</span>
                  <span class="prop-value">{{ latestLinkedFlora.primaryUse }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Botanical Hazard:</span>
                  <span class="prop-value">{{ latestLinkedFlora.hazardLevel }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Origin Model:</span>
                  <span class="prop-value">{{ latestLinkedFlora.originModel || "Unknown lineage" }}</span>
                </div>
              </div>
              <div v-if="latestLinkedFlora?.summary" class="world-note">{{ latestLinkedFlora.summary }}</div>

              <div v-if="latestLinkedFauna" class="prop-list">
                <div class="prop-row">
                  <span class="prop-label">Fauna Stability:</span>
                  <span class="prop-value">{{ latestLinkedFauna.stability }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Hazard Level:</span>
                  <span class="prop-value">{{ latestLinkedFauna.hazardLevel }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Focus Species:</span>
                  <span class="prop-value">{{ latestLinkedFauna.focusName }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Scientific Name:</span>
                  <span class="prop-value">{{ latestLinkedFauna.scientificName || "Unclassified fauna" }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Terrain Spread:</span>
                  <span class="prop-value">{{ (latestLinkedFauna.terrains || []).join(", ") || "—" }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Origin Model:</span>
                  <span class="prop-value">{{ latestLinkedFauna.originModel || "Unknown lineage" }}</span>
                </div>
              </div>
              <div v-if="latestLinkedFauna?.summary" class="world-note">{{ latestLinkedFauna.summary }}</div>

              <div v-if="latestLinkedSophont" class="prop-list">
                <div class="prop-row">
                  <span class="prop-label">Linked Sophont:</span>
                  <span class="prop-value">{{ latestLinkedSophont.name }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Scientific Name:</span>
                  <span class="prop-value">{{ latestLinkedSophont.scientificName || "Unclassified sophont" }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Origin:</span>
                  <span class="prop-value">{{ latestLinkedSophont.origin }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Contact Status:</span>
                  <span class="prop-value">{{ latestLinkedSophont.contactStatus }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Diplomatic Stance:</span>
                  <span class="prop-value">{{ latestLinkedSophont.currentStance }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Settlement Pattern:</span>
                  <span class="prop-value">{{ latestLinkedSophont.settlementPattern }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Recent History:</span>
                  <span class="prop-value">{{ latestLinkedSophont.historySummary }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Faction Pressure:</span>
                  <span class="prop-value">{{ latestLinkedSophont.factionSummary }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Event Hook:</span>
                  <span class="prop-value">{{ latestLinkedSophont.eventHook }}</span>
                </div>
                <div class="prop-row">
                  <span class="prop-label">Government / TL:</span>
                  <span class="prop-value"
                    >{{ latestLinkedSophont.government }} · TL {{ latestLinkedSophont.techLevel }}</span
                  >
                </div>
                <div class="prop-row">
                  <span class="prop-label">Human Analogue:</span>
                  <span class="prop-value">{{
                    latestLinkedSophont.humanAnalogueStatus || "No clear Terran analogue"
                  }}</span>
                </div>
              </div>
              <div v-if="latestLinkedSophont?.summary" class="world-note">{{ latestLinkedSophont.summary }}</div>
            </template>
            <div v-else class="world-note">
              No linked flora, fauna bundles, or sophont dossiers are attached yet. Use the generators to add them.
            </div>
          </section>

          <section class="world-section">
            <div class="section-header">
              <h3>👥 World Census</h3>
              <button
                class="btn btn-secondary section-reroll"
                type="button"
                data-test="reroll-census"
                @click="rerollWorldSection('census')"
              >
                🎲 Reroll
              </button>
            </div>
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
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="goToCreatureGenerator">🐾 Fauna Generator →</button>
          <button class="btn btn-primary" @click="goToFloraGenerator">🌱 Flora Generator →</button>
          <button
            class="btn btn-primary"
            :title="
              world.nativeSophontLife
                ? 'Refine native sophonts for this world'
                : 'Create a transplanted or colonial sophont culture linked to this world'
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
import {
  applyWorldProfileToPlanet,
  extractStoredWorldProfile,
  generateAutomaticWorldName,
  generateWorldProfile,
  normalizeWorldStarClass,
  renamePlanetaryCatalogEntry,
} from "../../utils/worldProfileGenerator.js";
import {
  auToFractionalOrbit,
  calculateHabitableZoneCenterOrbit,
  calculateSystemLayoutAnchorOrbit,
} from "../../utils/wbh/systemGenerationWbh.js";
import { generateWorldPhysicalCharacteristicsWbh } from "../../utils/wbh/worldPhysicalCharacteristicsWbh.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import {
  isSpeechSynthesisSupported,
  speakTextWithPreferences,
  stopSpeechSynthesis,
} from "../../utils/speechSynthesis.js";
import { useCreatureStore } from "../../stores/creatureStore.js";
import { useFloraStore } from "../../stores/floraStore.js";
import { useSophontStore } from "../../stores/sophontStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { formatTemperatureFromCelsius } from "../../utils/temperatureFormatting.js";
import { formatTradeCodeTooltip } from "../../utils/tradeCodes.js";
import * as toastService from "../../utils/toast.js";

defineProps({ systemId: { type: String, default: null } });
const router = useRouter();
const route = useRoute();
const preferencesStore = usePreferencesStore();
const creatureStore = useCreatureStore();
const floraStore = useFloraStore();
const sophontStore = useSophontStore();
const systemStore = useSystemStore();
const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }

  return { name: "StarSystemBuilder" };
});

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

// ── State ─────────────────────────────────────────────────────────────────────
const worldName = ref("");
const starClass = ref("random");
const world = ref(null);
const sourceWorldType = ref("");
const sourceOrbitAU = ref("");
const sourceZone = ref("");
const sourceWorldIndex = ref("");
const isSpeakingWorldName = ref(false);
const lastAutoGeneratedWorldName = ref("");
const worldNameWasAutoGenerated = ref(false);
const supportsSpeechSynthesis = isSpeechSynthesisSupported();
const PHYSICAL_WORLD_FIELDS = [
  "size",
  "diameterKm",
  "atmosphereCode",
  "atmosphereDesc",
  "atmosphereComposition",
  "atmospherePressureBar",
  "atmospherePressureRangeBar",
  "atmosphereSurvivalGear",
  "oxygenFraction",
  "oxygenPartialPressureBar",
  "atmosphereScaleHeightKm",
  "atmosphereTaints",
  "atmosphereTaintProfile",
  "hydrographics",
  "hydrographicsPercent",
  "hydrosphereLiquid",
  "hydrosphereDescription",
  "surfaceDistribution",
  "surfaceDistributionSummary",
  "dominantSurface",
  "avgTempC",
  "tempCategory",
  "temperatureRawRoll",
  "temperatureAdjustedRoll",
  "runawayGreenhouse",
  "greenhouseAtmosphereCode",
  "gravity",
  "mass",
  "density",
  "composition",
  "escapeVelocityMps",
  "surfaceOrbitalVelocityMps",
  "sizeProfile",
  "habitability",
  "resourceRating",
  "mainworldCandidateScore",
  "seismology",
  "majorTectonicPlates",
];
const SYSTEM_WORLD_FIELDS = [
  "orbitalPeriodDays",
  "dayLengthHours",
  "axialTilt",
  "surfaceTidalEffectMeters",
  "tidalLockPressure",
  "moons",
  "moonsData",
  "magnetosphere",
];
const LIFE_WORLD_FIELDS = ["nativeSophontLife", "nativeLifeform"];
const CENSUS_WORLD_FIELDS = [
  "populationCode",
  "population",
  "governmentCode",
  "governmentDesc",
  "lawLevel",
  "lawDesc",
  "techLevel",
  "techDesc",
  "starport",
  "starportDesc",
  "tradeCodes",
  "minimumSustainableTechLevel",
  "populationConcentration",
  "urbanization",
  "majorCities",
  "governmentProfile",
  "justiceProfile",
  "lawProfile",
  "appealProfile",
  "privateLawProfile",
  "personalRightsProfile",
  "factionsProfile",
  "secondaryWorldContext",
  "civilConflict",
  "techLevelPockets",
  "houseRulesApplied",
  "importance",
  "economics",
  "remarks",
];
const worldLoadingState = ref({
  active: false,
  tone: "analysis",
  stateLabel: "PLANETARY DATA",
  statusCode: "WRLD-SYNC",
  title: "World Survey Initialization",
  message: "Preparing planetary registers...",
  barLabel: "Synchronizing planetary registers",
  diagnostics: [
    { label: "Climate", value: "Parsing" },
    { label: "Culture", value: "Indexing" },
    { label: "Trade", value: "Nominal" },
  ],
  ledger: ["World Survey", "Census Matrix", "Planetology Core: Linked"],
});

const { overlayProps: worldExportOverlayProps, exportJson: exportWorldArchive } = useArchiveTransfer({
  context: "world",
  noun: "World",
  title: "World Export In Progress",
  barLabel: "Packaging world archive for transfer",
  statusPrefix: "WRLD",
  targetLabel: () => world.value?.name || "Archive target pending",
});

function resetWorldLoadingState() {
  worldLoadingState.value = {
    active: false,
    tone: "analysis",
    stateLabel: "PLANETARY DATA",
    statusCode: "WRLD-SYNC",
    title: "World Survey Initialization",
    message: "Preparing planetary registers...",
    barLabel: "Synchronizing planetary registers",
    diagnostics: [
      { label: "Climate", value: "Parsing" },
      { label: "Culture", value: "Indexing" },
      { label: "Trade", value: "Nominal" },
    ],
    ledger: ["World Survey", "Census Matrix", "Planetology Core: Linked"],
  };
}

function delay(ms) {
  if (import.meta?.env?.MODE === "test" || ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runWithWorldLoading(title, message, operation, barLabel = "Synchronizing planetary registers") {
  worldLoadingState.value = {
    active: true,
    tone: "fabrication",
    stateLabel: "WORLD SYNTHESIS",
    statusCode: "WRLD-BUILD",
    title,
    message,
    barLabel,
    diagnostics: [
      { label: "Star", value: starClass.value === "random" ? "Auto" : starClass.value },
      { label: "Source", value: selectedSourceWorldLabel.value || "Standalone" },
      { label: "Trade", value: "Projecting" },
    ],
    ledger: ["World Survey", "Climate heuristics engaged", "Census lattice: primed"],
  };

  await delay(220);

  try {
    return await operation();
  } finally {
    await delay(120);
    resetWorldLoadingState();
  }
}

const selectedSourceWorldLabel = computed(() => {
  const name = String(worldName.value || "").trim();
  const type = String(sourceWorldType.value || "").trim();
  const orbit = String(sourceOrbitAU.value || "").trim();
  const zone = String(sourceZone.value || "").trim();
  const parts = [name, type, orbit ? `${orbit} AU` : "", zone].filter(Boolean);
  return parts.join(" · ");
});

const boundSystemPlanets = computed(() => {
  const planets = resolveBoundSystemRecord()?.planets;
  return Array.isArray(planets) ? planets : [];
});

const catalogWorldCount = computed(() => boundSystemPlanets.value.length);

const selectedCatalogWorldNumber = computed(() => {
  const index = getSelectedWorldIndex();
  if (index === null || index >= catalogWorldCount.value) {
    return null;
  }
  return index + 1;
});

const canNavigateCatalogWorlds = computed(() => {
  return catalogWorldCount.value > 1 && selectedCatalogWorldNumber.value !== null;
});

const linkedWorldCriteria = computed(() => {
  const persistedSystem = resolveBoundSystemRecord();
  const systemId = String(persistedSystem?.systemId || route.query.systemRecordId || systemStore.currentSystemId || "");
  const linkedWorldName = String(world.value?.name || worldName.value || route.query.worldName || "").trim();
  return {
    systemId,
    worldName: linkedWorldName,
    worldKey: [systemId, linkedWorldName].filter(Boolean).join(":"),
  };
});

const latestLinkedFauna = computed(() => {
  const stored = world.value?.linkedFaunaSummary;
  if (stored && typeof stored === "object") {
    return stored;
  }

  const bundle = creatureStore.faunaBundlesByWorld(linkedWorldCriteria.value)[0];
  if (!bundle) {
    return null;
  }

  return {
    stability: bundle.balance?.stability || "Balanced biosphere",
    hazardLevel: bundle.balance?.hazardLevel || "Low",
    focusName: bundle.focus?.name || bundle.entries?.[0]?.name || "Local fauna",
    scientificName: bundle.focus?.taxonomy?.["Scientific Name"] || "Unclassified fauna",
    originModel: bundle.focus?.lineage?.originModel || bundle.focus?.origin || "Unknown lineage",
    terrains: Array.isArray(bundle.terrains) ? bundle.terrains : [],
    summary: bundle.notes?.[0] || "Local ecology bundle linked.",
  };
});

const latestLinkedFlora = computed(() => {
  const stored = world.value?.linkedFloraSummary;
  if (stored && typeof stored === "object") {
    return stored;
  }

  const record = floraStore.floraByWorld(linkedWorldCriteria.value)[0];
  if (!record) {
    return null;
  }

  return {
    name: record.name || "Linked flora",
    scientificName: record.taxonomy?.["Scientific Name"] || "Unclassified flora",
    originModel: record.lineage?.originModel || record.origin || "Unknown lineage",
    growthForm: record.biology?.["Growth Form"] || "Flora cluster",
    climate: record.biology?.Climate || "Temperate",
    primaryUse: record.uses?.["Primary Use"] || "Ecological survey",
    hazardLevel: record.uses?.["Hazard Level"] || "Low",
    summary: record.worldIntegration?.summary || record.summary || "Linked flora dossier",
  };
});

const latestLinkedSophont = computed(() => {
  const stored = world.value?.linkedSophontProfile;
  if (stored && typeof stored === "object") {
    return {
      ...stored,
      factionSummary: stored.factionSummary || "Faction pressure contained",
      eventHook:
        stored.eventHook || stored.eventChainHighlights?.[0] || stored.diplomacyHooks?.[0] || "No active chain",
    };
  }

  const record = sophontStore.sophontsByWorld(linkedWorldCriteria.value)[0];
  if (!record) {
    return null;
  }

  return {
    name: record.name || "Linked Sophont",
    scientificName: record.taxonomy?.["Scientific Name"] || "Unclassified sophont",
    origin: record.origin || record.lineage?.originModel || "Unknown origin",
    originModel: record.lineage?.originModel || record.origin || "Unknown origin",
    humanAnalogueStatus: record.lineage?.humanAnalogueStatus || "No clear Terran analogue",
    contactStatus: record.civilization?.["Contact Status"] || "Open contact",
    currentStance:
      record.diplomacy?.["Current Stance"] || record.civilization?.["Diplomatic Posture"] || "guarded neutrality",
    settlementPattern: record.civilization?.["Settlement Pattern"] || "Localized settlements",
    historySummary: record.historyTimeline?.at?.(-1)?.title || "Present Tension",
    factionSummary:
      record.factionTensions?.summary || record.sourceWorld?.factionsProfile?.summary || "Faction pressure contained",
    pressureLevel: record.factionTensions?.["Pressure Level"] || "Managed",
    eventHook: record.eventChain?.[0]?.title || record.diplomacy?.hooks?.[0] || "No active chain",
    government: record.government || "—",
    techBand: record.civilization?.["Tech Band"] || "local development band",
    techLevel: Number(record.techLevel ?? 0),
    summary: record.worldIntegration?.summary || record.tagline || "Linked species dossier",
  };
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

function formatDistanceKm(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric.toLocaleString()} km` : "Unknown";
}

function formatPop(pop) {
  const numeric = Number(pop);
  if (!Number.isFinite(numeric)) return "Unknown";
  if (numeric >= 1e12) return (numeric / 1e12).toFixed(1) + " trillion";
  if (numeric >= 1e9) return (numeric / 1e9).toFixed(1) + " billion";
  if (numeric >= 1e6) return (numeric / 1e6).toFixed(1) + " million";
  if (numeric >= 1e3) return (numeric / 1e3).toFixed(1) + " thousand";
  if (numeric === 0) return "Uninhabited";
  return numeric.toLocaleString();
}

function normalizeNativeLifeProfile(profile) {
  return String(profile || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function decodeExtendedHexDigit(value) {
  const normalized = String(value || "0")
    .trim()
    .charAt(0)
    .toUpperCase();
  if (!normalized) return 0;
  return Number.parseInt(normalized, 16) || 0;
}

function hasNativeLifeProfile(profile) {
  const normalizedProfile = normalizeNativeLifeProfile(profile);
  return Boolean(normalizedProfile) && normalizedProfile !== "0000";
}

function formatNativeLifeProfile(profile, hasNativeSophontLife) {
  const normalizedProfile = normalizeNativeLifeProfile(profile);

  if (!hasNativeLifeProfile(normalizedProfile)) {
    return hasNativeSophontLife ? "Profile pending" : "0000 — No native biosphere detected";
  }

  return `${normalizedProfile} — ${hasNativeSophontLife ? "Native sophonts present" : "Native biosphere present"}`;
}

function describeNativeLifeProfile(profile) {
  const digits = normalizeNativeLifeProfile(profile).padEnd(4, "0").slice(0, 4).split("");
  const [biomass, biocomplexity, biodiversity, compatibility] = digits.map((digit) => decodeExtendedHexDigit(digit));
  return `Biomass ${biomass} · Biocomplexity ${biocomplexity} · Biodiversity ${biodiversity} · Compatibility ${compatibility}`;
}

function describeNativeLifeRating(kind, value) {
  const numeric = decodeExtendedHexDigit(value);
  const catalogs = {
    biomass: {
      0: "No native life",
      1: "Trace native life",
      4: "Established native biosphere",
      8: "Robust biosphere",
      10: "Thriving garden biosphere",
    },
    biocomplexity: {
      0: "No complex life",
      1: "Simple organisms",
      4: "Complex multicellular life",
      8: "Mentally advanced organisms",
      9: "Extant or extinct sophonts",
      10: "Ecosystem-wide superorganisms",
    },
    biodiversity: {
      0: "No biosphere diversity",
      1: "Narrow ecosystem",
      4: "Layered ecosystem",
      8: "Broad, resilient ecosystem",
      10: "Pre-human Terra-like diversity",
    },
    compatibility: {
      0: "Incompatible with Terran life",
      1: "Marginal Terran compatibility",
      4: "Partial Terran compatibility",
      8: "Broad nutritional compatibility",
      10: "Fully Terran-compatible biosphere",
    },
  };

  const catalog = catalogs[kind] || {};
  const thresholds = Object.keys(catalog)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
    .sort((left, right) => left - right);
  let description = catalog[0] || "Recorded";
  thresholds.forEach((threshold) => {
    if (numeric >= threshold) {
      description = catalog[threshold];
    }
  });

  const displayValue = numeric >= 10 ? numeric.toString(16).toUpperCase() : String(numeric);
  return `${displayValue} — ${description}`;
}

function formatNativeLifeRating(profile, index, kind) {
  const digits = normalizeNativeLifeProfile(profile).padEnd(4, "0").slice(0, 4);
  return describeNativeLifeRating(kind, digits.charAt(index));
}

function resolveNativeSophontState(worldRecord = {}) {
  const normalizedStatus = String(worldRecord?.nativeSophontStatus || "")
    .trim()
    .toLowerCase();

  if (["exist", "exists", "extant", "present", "current"].includes(normalizedStatus)) {
    return "Exist";
  }
  if (["extinct", "former"].includes(normalizedStatus)) {
    return "Extinct";
  }
  if (normalizedStatus === "absent") {
    return "Absent";
  }
  if (worldRecord?.nativeSophontLife) {
    return "Exist";
  }

  const biocomplexity = decodeExtendedHexDigit(normalizeNativeLifeProfile(worldRecord?.nativeLifeform).charAt(1));
  return biocomplexity >= 9 ? "Extinct" : "Absent";
}

function cloneWorldFieldValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneWorldFieldValue(entry));
  }
  if (value && typeof value === "object") {
    return { ...value };
  }
  return value;
}

function pickWorldFields(source = {}, keys = []) {
  return keys.reduce((accumulator, key) => {
    if (source?.[key] !== undefined) {
      accumulator[key] = cloneWorldFieldValue(source[key]);
    }
    return accumulator;
  }, {});
}

function buildUwpCode(profile = {}) {
  const starportCode =
    String(profile?.starport || "X")
      .trim()
      .toUpperCase() || "X";

  return `${starportCode}${toHex(Number(profile?.size ?? 0))}${toHex(Number(profile?.atmosphereCode ?? 0))}${toHex(Number(profile?.hydrographics ?? 0))}${toHex(Number(profile?.populationCode ?? 0))}${toHex(Number(profile?.governmentCode ?? 0))}${toHex(Number(profile?.lawLevel ?? 0))}-${toHex(Number(profile?.techLevel ?? 0))}`;
}

function mergeWorldSection(currentWorld, rerolledWorld, section) {
  const current = currentWorld && typeof currentWorld === "object" ? currentWorld : {};
  const rerolled = rerolledWorld && typeof rerolledWorld === "object" ? rerolledWorld : current;
  const fieldGroups = {
    physical: PHYSICAL_WORLD_FIELDS,
    system: SYSTEM_WORLD_FIELDS,
    life: LIFE_WORLD_FIELDS,
    census: CENSUS_WORLD_FIELDS,
  };
  const merged = {
    ...current,
    ...pickWorldFields(rerolled, fieldGroups[section] || []),
    name: String(worldName.value || rerolled?.name || current?.name || "World").trim() || "World",
  };

  if (merged.nativeSophontLife === false) {
    merged.populationCode = 0;
    merged.population = 0;
    merged.governmentCode = 0;
    merged.governmentDesc = GOVERNMENT_TABLE[0] ?? "No Government";
    merged.lawLevel = 0;
    merged.lawDesc = LAW_TABLE[0] ?? "No Law";
    merged.techLevel = 0;
    merged.techDesc = TECH_TABLE[0] ?? "Primitive";
    merged.starport = "X";
    merged.starportDesc = STARPORT_TABLE.X ?? "No starport";
  }

  merged.uwp = buildUwpCode(merged);
  return merged;
}

function normalizeIncomingStarClass(value) {
  return normalizeWorldStarClass(value);
}

function applyRouteWorldContext() {
  const nextWorldName = String(route.query.worldName || "").trim();
  worldName.value = nextWorldName;
  lastAutoGeneratedWorldName.value = "";
  worldNameWasAutoGenerated.value = false;
  starClass.value = normalizeIncomingStarClass(route.query.star);
  sourceWorldType.value = String(route.query.worldType || "").trim();
  sourceOrbitAU.value = String(route.query.orbitAU || "").trim();
  sourceZone.value = String(route.query.zone || "").trim();
  sourceWorldIndex.value = String(route.query.worldIndex || "").trim();
}

function hasRouteWorldName() {
  return Boolean(String(route.query.worldName || "").trim());
}

function normalizeSystemHex(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
}

function getSelectedWorldIndex() {
  const index = Number.parseInt(String(route.query.worldIndex ?? ""), 10);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

function resolveBoundSystemRecord() {
  const explicitRecordId = String(route.query.systemRecordId || "").trim();
  if (explicitRecordId) {
    return systemStore.systems.find((entry) => String(entry?.systemId) === explicitRecordId) ?? null;
  }

  const routeSystemHex = normalizeSystemHex(route.params.systemId || route.query.systemId || "");
  const currentSystem = systemStore.getCurrentSystem;
  if (currentSystem) {
    const currentSystemHex = normalizeSystemHex(currentSystem.hexCoordinates?.x + "" + currentSystem.hexCoordinates?.y);
    if (
      !routeSystemHex ||
      currentSystemHex === routeSystemHex ||
      String(currentSystem.systemId || "").endsWith(`:${routeSystemHex}`)
    ) {
      return currentSystem;
    }
  }

  if (!routeSystemHex) {
    return null;
  }

  return (
    systemStore.systems.find((entry) => {
      const entryHex = normalizeSystemHex(`${entry?.hexCoordinates?.x ?? ""}${entry?.hexCoordinates?.y ?? ""}`);
      return entryHex === routeSystemHex || String(entry?.systemId || "").endsWith(`:${routeSystemHex}`);
    }) ?? null
  );
}

function getSelectedPlanetRecord() {
  const worldIndex = getSelectedWorldIndex();
  const persistedSystem = resolveBoundSystemRecord();
  if (worldIndex === null || !persistedSystem || !Array.isArray(persistedSystem.planets)) {
    return null;
  }

  return persistedSystem.planets[worldIndex] ?? null;
}

function getSelectedPrimaryStarRecord() {
  const persistedSystem = resolveBoundSystemRecord();
  if (!persistedSystem || typeof persistedSystem !== "object") {
    return null;
  }

  if (persistedSystem.primaryStar && typeof persistedSystem.primaryStar === "object") {
    return persistedSystem.primaryStar;
  }

  if (Array.isArray(persistedSystem.stars) && persistedSystem.stars[0]) {
    return persistedSystem.stars[0];
  }

  return null;
}

function hydrateStoredWorldProfile() {
  const storedProfile = extractStoredWorldProfile(getSelectedPlanetRecord());
  if (!storedProfile) {
    world.value = null;
    return false;
  }

  world.value = storedProfile;
  if (String(storedProfile.name || "").trim()) {
    worldName.value = String(storedProfile.name).trim();
  }
  return true;
}

function generateRandomWorldName() {
  const selectedPlanet = getSelectedPlanetRecord();
  return generateAutomaticWorldName({
    mode: preferencesStore.worldNameMode,
    isMoon: Boolean(selectedPlanet?.isMoon || selectedPlanet?.parentWorldName),
    parentWorldName: selectedPlanet?.parentWorldName,
    moonOrdinal: selectedPlanet?.moonOrdinal,
    orbitalSlot: selectedPlanet?.orbitalSlot,
    systemName: String(system.value?.name || route.query.systemName || route.query.star || "").trim(),
    seed: `${String(system.value?.systemId || route.query.systemId || "world")}:${String(selectedPlanet?.orbitalSlot || selectedPlanet?.name || "0")}`,
  });
}

function applyGeneratedWorldName() {
  const nextName = generateRandomWorldName();
  lastAutoGeneratedWorldName.value = nextName;
  worldNameWasAutoGenerated.value = true;
  worldName.value = nextName;
  return nextName;
}

async function syncWorldNameToPlanetaryCatalog(nextName = worldName.value) {
  const worldIndex = getSelectedWorldIndex();
  const normalizedName = String(nextName || "").trim();
  if (worldIndex === null || !normalizedName) {
    return false;
  }

  const persistedSystem = resolveBoundSystemRecord();
  if (!persistedSystem || !Array.isArray(persistedSystem.planets) || !persistedSystem.planets[worldIndex]) {
    return false;
  }

  if (String(persistedSystem.planets[worldIndex].name || "").trim() === normalizedName) {
    return true;
  }

  const nextPlanets = renamePlanetaryCatalogEntry(persistedSystem.planets, worldIndex, normalizedName, world.value);

  const updatedSystem = await systemStore.updateSystem(persistedSystem.systemId, {
    planets: nextPlanets,
    metadata: {
      ...(persistedSystem.metadata && typeof persistedSystem.metadata === "object" ? persistedSystem.metadata : {}),
      lastModified: new Date().toISOString(),
    },
  });

  if (updatedSystem?.systemId) {
    systemStore.setCurrentSystem(updatedSystem.systemId);
  }
  return true;
}

async function persistWorldProfileToPlanetaryCatalog(nextWorld = world.value) {
  const worldIndex = getSelectedWorldIndex();
  const persistedSystem = resolveBoundSystemRecord();
  if (worldIndex === null || !nextWorld || !persistedSystem || !Array.isArray(persistedSystem.planets)) {
    return false;
  }

  const nextPlanets = renamePlanetaryCatalogEntry(
    persistedSystem.planets,
    worldIndex,
    String(nextWorld?.name || persistedSystem.planets[worldIndex]?.name || "").trim(),
    nextWorld,
  );

  const updatedSystem = await systemStore.updateSystem(persistedSystem.systemId, {
    planets: nextPlanets,
    metadata: {
      ...(persistedSystem.metadata && typeof persistedSystem.metadata === "object" ? persistedSystem.metadata : {}),
      generatedWorldProfilesAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  });

  if (updatedSystem?.systemId) {
    systemStore.setCurrentSystem(updatedSystem.systemId);
  }
  return true;
}

async function moveToCatalogWorld(offset) {
  const planets = boundSystemPlanets.value;
  const currentIndex = getSelectedWorldIndex();
  if (!planets.length || currentIndex === null) {
    return;
  }

  await syncWorldNameToPlanetaryCatalog();

  const nextIndex = (currentIndex + offset + planets.length) % planets.length;
  const nextPlanet = planets[nextIndex];
  if (!nextPlanet) {
    return;
  }

  const boundSystem = resolveBoundSystemRecord();
  await router.replace({
    name: "WorldBuilder",
    params: {
      systemId: String(route.params.systemId || ""),
    },
    query: {
      ...route.query,
      systemRecordId: String(route.query.systemRecordId || boundSystem?.systemId || ""),
      worldName: String(nextPlanet.name || "").trim(),
      worldType: String(nextPlanet.type || "").trim(),
      orbitAU: String(nextPlanet.orbitAU ?? ""),
      zone: String(nextPlanet.zone || "").trim(),
      worldIndex: String(nextIndex),
    },
  });
}

function stopWorldNameSpeech() {
  if (!supportsSpeechSynthesis) return;
  stopSpeechSynthesis();
  isSpeakingWorldName.value = false;
}

function toggleWorldNameSpeech() {
  if (!supportsSpeechSynthesis) {
    toastService.error("Text to speech is not supported in this browser.");
    return;
  }

  if (isSpeakingWorldName.value) {
    stopWorldNameSpeech();
    return;
  }

  const worldDisplayName = String(worldName.value || world.value?.name || "").trim();
  if (!worldDisplayName) {
    toastService.error("No world name is available to speak yet.");
    return;
  }

  isSpeakingWorldName.value = true;
  const result = speakTextWithPreferences(worldDisplayName, {
    rate: preferencesStore.ttsRate,
    pitch: preferencesStore.ttsPitch,
    voiceURI: preferencesStore.ttsVoiceURI,
    onEnd: () => {
      isSpeakingWorldName.value = false;
    },
    onError: () => {
      isSpeakingWorldName.value = false;
      toastService.error("Unable to play world name audio.");
    },
  });

  if (!result.ok) {
    isSpeakingWorldName.value = false;
    toastService.error(
      result.reason === "unsupported"
        ? "Text to speech is not supported in this browser."
        : "Unable to play world name audio.",
    );
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function randomizeName() {
  applyGeneratedWorldName();
  await syncWorldNameToPlanetaryCatalog();
}

function buildGeneratedWorld() {
  const resolvedWorldName = String(worldName.value || "").trim() || generateRandomWorldName();

  const baseProfile = generateWorldProfile({
    worldName: resolvedWorldName,
    starClass: starClass.value,
    randomWorldName: generateRandomWorldName,
  });

  const selectedPlanet = getSelectedPlanetRecord();
  const selectedPrimaryStar = getSelectedPrimaryStarRecord();
  const sourceType = String(sourceWorldType.value || selectedPlanet?.type || "").trim();
  const orbitAu = Number(sourceOrbitAU.value || (selectedPlanet?.orbitAU ?? NaN));
  const primaryLuminosity = Number(
    selectedPrimaryStar?.luminosity ?? selectedPrimaryStar?.lum ?? selectedPrimaryStar?.massInSolarMasses ?? NaN,
  );

  const canApplyWbhPhysics =
    sourceType !== "Gas Giant" && Number.isFinite(orbitAu) && Number.isFinite(primaryLuminosity);
  if (!canApplyWbhPhysics) {
    return baseProfile;
  }

  const orbitNumber = auToFractionalOrbit(orbitAu);
  const hzco =
    selectedPlanet && Object.prototype.hasOwnProperty.call(selectedPlanet, "hzco")
      ? selectedPlanet.hzco
      : primaryLuminosity > 0
        ? calculateHabitableZoneCenterOrbit(primaryLuminosity)
        : calculateSystemLayoutAnchorOrbit([selectedPrimaryStar].filter(Boolean));
  return generateWorldPhysicalCharacteristicsWbh({
    ...baseProfile,
    baseWorld: baseProfile,
    worldName: resolvedWorldName,
    starClass: starClass.value,
    sizeCode: sourceType === "Planetoid Belt" ? "0" : baseProfile.size,
    orbitNumber,
    hzco,
    systemAgeGyr: Number(selectedPrimaryStar?.systemAge ?? 5),
    stellarMasses: [Number(selectedPrimaryStar?.massInSolarMasses ?? selectedPrimaryStar?.mass ?? 0)],
  });
}

async function generateWorld() {
  const worldLabel = String(worldName.value || "prospective world").trim() || "prospective world";
  await runWithWorldLoading(
    "World Survey Synthesis",
    `Projecting planetary profile for ${worldLabel}...`,
    async () => {
      worldLoadingState.value = {
        ...worldLoadingState.value,
        tone: "fabrication",
        diagnostics: [
          { label: "Star", value: starClass.value === "random" ? "Auto" : starClass.value },
          { label: "Source", value: selectedSourceWorldLabel.value || "Standalone" },
          { label: "Climate", value: "Rolling" },
        ],
        ledger: ["World Survey", `Target world: ${worldLabel}`, "Climate and census rules engaged"],
      };
      const nextWorld = buildGeneratedWorld();
      world.value = nextWorld;
      await persistWorldProfileToPlanetaryCatalog(nextWorld);
      worldLoadingState.value = {
        ...worldLoadingState.value,
        tone: "ready",
        stateLabel: "PROFILE COMPLETE",
        statusCode: "WRLD-READY",
        diagnostics: [
          { label: "Climate", value: world.value?.tempCategory || "Resolved" },
          { label: "Life", value: world.value?.nativeSophontLife ? "Present" : "Absent" },
          { label: "Trade", value: `${world.value?.tradeCodes?.length || 0} codes` },
        ],
        ledger: [
          "World Survey",
          world.value ? `${world.value.name} profile assembled` : "World profile assembled",
          "Planetology Core: solution stable",
        ],
      };
    },
    "Running climate, census, and trade heuristics",
  );
}

function regenerateWorld() {
  if (world.value) return generateWorld();
}

async function rerollWorldSection(section) {
  if (!world.value) {
    return;
  }

  const sectionLabelMap = {
    physical: "Physical Properties",
    system: "Orbital Properties",
    life: "Life Survey",
    census: "World Census",
  };
  const sectionLabel = sectionLabelMap[section] || "World Survey";
  const worldLabel = String(world.value?.name || worldName.value || "prospective world").trim() || "prospective world";

  await runWithWorldLoading(
    `${sectionLabel} Refresh`,
    `Refreshing ${sectionLabel.toLowerCase()} for ${worldLabel}...`,
    async () => {
      const rerolledWorld = buildGeneratedWorld();
      const nextWorld = mergeWorldSection(world.value, rerolledWorld, section);
      world.value = nextWorld;
      await persistWorldProfileToPlanetaryCatalog(nextWorld);
      toastService.success(`${sectionLabel} rerolled for ${nextWorld.name}.`);
    },
    `Refreshing ${sectionLabel.toLowerCase()}`,
  );
}

async function exportWorld() {
  if (!world.value) return;
  await exportWorldArchive({
    data: world,
    filename: (worldRecord) => `${worldRecord.name.replace(/\s+/g, "-")}-World.json`,
    serializeMessage: "Serializing world profile...",
    encodeMessage: "Encoding world archive for transfer...",
    readyMessage: "World archive staged for local transfer.",
    serializingProgress: 24,
    encodingProgress: 70,
  });
}

function buildGeneratorRouteQuery(source = "world-builder") {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "WorldBuilder"),
    params: { ...route.params },
    query: { ...route.query },
  });

  return {
    systemId: String(route.params.systemId || ""),
    systemRecordId: String(systemStore.currentSystemId || ""),
    worldIndex: String(getSelectedWorldIndex() ?? route.query.worldIndex ?? ""),
    worldName: String(world.value?.name || worldName.value || ""),
    source,
    ...(returnTo ? { returnTo } : {}),
  };
}

function goToCreatureGenerator() {
  router.push({
    name: "CreatureGenerator",
    query: buildGeneratorRouteQuery("world-builder-creature"),
  });
}

function goToFloraGenerator() {
  router.push({
    name: "FloraGenerator",
    query: buildGeneratorRouteQuery("world-builder-flora"),
  });
}

function goToSophontGenerator() {
  router.push({
    name: "SophontGenerator",
    query: buildGeneratorRouteQuery("world-builder-sophont"),
  });
}

function goToHistoryGenerator() {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "WorldBuilder"),
    params: { ...route.params },
    query: { ...route.query },
  });

  router.push({
    name: "HistoryGenerator",
    query: {
      civilizationName: String(latestLinkedSophont.value?.name || world.value?.name || worldName.value || "").trim(),
      worldName: String(world.value?.name || worldName.value || "").trim(),
      government: String(latestLinkedSophont.value?.government || world.value?.governmentDesc || "").trim(),
      diplomaticPosture: String(latestLinkedSophont.value?.currentStance || "").trim(),
      pressureLevel: String(latestLinkedSophont.value?.pressureLevel || "").trim(),
      techBand: String(latestLinkedSophont.value?.techBand || `TL ${Number(world.value?.techLevel ?? 0)}`).trim(),
      worldTraits: [
        world.value?.tempCategory,
        world.value?.atmosphereDesc,
        ...(Array.isArray(world.value?.tradeCodes) ? world.value.tradeCodes : []),
      ]
        .map((entry) => String(entry || "").trim())
        .filter(Boolean)
        .join(", "),
      flashpoint: String(world.value?.linkedSophontProfile?.currentFlashpoint || "").trim(),
      conflictSummary: String(latestLinkedSophont.value?.factionSummary || "").trim(),
      eventHook: String(latestLinkedSophont.value?.eventHook || "").trim(),
      source: "world-builder-history",
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

function openSystemSurvey() {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "WorldBuilder"),
    params: { ...route.params },
    query: { ...route.query },
  });

  router.push({
    name: "SystemSurvey",
    query: {
      systemId: String(route.params.systemId || ""),
      systemRecordId: String(systemStore.currentSystemId || ""),
      hex: String(route.query.hex || ""),
      star: String(route.query.star || ""),
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

function openWorldPhysicalSurvey() {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "WorldBuilder"),
    params: { ...route.params },
    query: { ...route.query },
  });

  router.push({
    name: "WorldPhysicalSurvey",
    params: {
      systemId: String(route.params.systemId || ""),
      worldIndex: String(getSelectedWorldIndex() ?? route.query.worldIndex ?? ""),
    },
    query: {
      ...route.query,
      systemId: String(route.params.systemId || ""),
      systemRecordId: String(systemStore.currentSystemId || ""),
      worldIndex: String(getSelectedWorldIndex() ?? route.query.worldIndex ?? ""),
      worldName: String(world.value?.name || worldName.value || ""),
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

watch(
  () => route.query,
  () => {
    stopWorldNameSpeech();
    applyRouteWorldContext();
    const restored = hydrateStoredWorldProfile();
    if (!restored && !hasRouteWorldName() && !String(worldName.value || "").trim()) {
      applyGeneratedWorldName();
    }
    if (restored) {
      return;
    }
    if (hasRouteWorldName() || starClass.value !== "random") {
      void generateWorld();
      return;
    }
    world.value = null;
  },
  { deep: true },
);

watch(worldName, (nextValue) => {
  stopWorldNameSpeech();
  const normalizedValue = String(nextValue || "").trim();
  if (world.value && normalizedValue) {
    world.value = {
      ...world.value,
      name: normalizedValue,
    };
  }
  if (!normalizedValue) {
    worldNameWasAutoGenerated.value = false;
    return;
  }
  if (normalizedValue !== String(lastAutoGeneratedWorldName.value || "").trim()) {
    worldNameWasAutoGenerated.value = false;
  }
});

watch(
  () => preferencesStore.worldNameMode,
  () => {
    if (hasRouteWorldName()) {
      return;
    }

    const currentName = String(worldName.value || "").trim();
    if (!currentName || worldNameWasAutoGenerated.value) {
      applyGeneratedWorldName();
    }
  },
);

onMounted(() => {
  applyRouteWorldContext();
  const restored = hydrateStoredWorldProfile();
  if (!restored && !hasRouteWorldName() && !String(worldName.value || "").trim()) {
    applyGeneratedWorldName();
  }
  if (!restored && (hasRouteWorldName() || starClass.value !== "random")) {
    void generateWorld();
  }
});

onBeforeUnmount(() => {
  stopWorldNameSpeech();
});
</script>

<style scoped>
.world-builder {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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

.control-group--source {
  min-width: 280px;
}

.control-group--catalog-nav {
  min-width: 320px;
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
  flex-direction: row;
  align-items: flex-end;
  flex: 1 1 auto;
  gap: 0.6rem;
}

.control-action-back {
  margin-left: auto;
}

.btn.btn-outline {
  background: transparent;
  color: #00d9ff;
  border: 1px solid #00d9ff;
  text-decoration: none;
}

.btn.btn-outline:hover {
  background: rgba(0, 217, 255, 0.1);
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

.name-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.name-row .text-input {
  flex: 1;
}

.catalog-nav-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.catalog-nav-pill {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(0, 217, 255, 0.24);
  background: rgba(0, 217, 255, 0.1);
  color: #baf3ff;
  font-size: 0.9rem;
  white-space: nowrap;
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

.source-world-pill {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
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
  padding: 1.15rem;
}

.world-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #333;
}

.world-header-survey-btn {
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
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

.world-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
}

.uwp-display--with-meta {
  flex-wrap: wrap;
  row-gap: 0.5rem;
}

.trade-codes--header {
  display: inline-flex;
  align-items: center;
}

.empty-state--inline {
  padding: 0;
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
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-reroll {
  margin-left: auto;
  white-space: nowrap;
}

.world-section--compact .prop-label {
  min-width: 130px;
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
