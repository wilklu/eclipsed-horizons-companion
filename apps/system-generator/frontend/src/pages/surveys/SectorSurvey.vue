<template>
  <div class="sector-survey" :class="{ 'sector-survey--subsector': currentViewMode === 'subsector' }">
    <LoadingSpinner :isVisible="isLoading" context="sector" tone="sync" :message="loadingMessage" />
    <LoadingSpinner v-bind="sectorExportOverlayProps" />
    <SurveyNavigation
      :currentClass="surveyPageLabel"
      :back-route="backRoute"
      :regenerate-label="generationAction?.label || 'Generate'"
      @regenerate="runSurveyAction"
      @export="exportSector"
    />

    <div class="survey-content">
      <div class="survey-workspace" :class="{ 'survey-workspace--subsector': currentViewMode === 'subsector' }">
        <aside class="control-panel">
          <section
            v-if="generatedSector && currentViewMode === 'subsector'"
            class="control-card subsector-context-card"
          >
            <div class="subsector-context-stack">
              <div class="subsector-context-item">
                <span class="subsector-context-label">Sector</span>
                <span class="subsector-context-value">{{ generatedSector.name }}</span>
              </div>
              <div class="subsector-context-item">
                <span class="subsector-context-label">Subsector</span>
                <span class="subsector-context-value">{{ currentSubsectorSummary || selectedSubsector }}</span>
              </div>
            </div>
          </section>

          <section v-if="generatedSector && currentViewMode === 'subsector'" class="control-card subsector-stats-card">
            <div class="subsector-stats-grid">
              <div class="subsector-stat-item">
                <span class="subsector-stat-label">Systems</span>
                <span class="subsector-stat-value">{{ displayedSector?.systemCount?.toLocaleString() || "0" }}</span>
              </div>
              <div class="subsector-stat-item">
                <span class="subsector-stat-label">Empty</span>
                <span class="subsector-stat-value">{{ displayedSector?.emptyCount?.toLocaleString() || "0" }}</span>
              </div>
              <div class="subsector-stat-item">
                <span class="subsector-stat-label">Percent Surveyed</span>
                <span class="subsector-stat-value">{{ subsectorSurveyPercentLabel }}</span>
              </div>
              <div class="subsector-stat-item">
                <span class="subsector-stat-label">Native Lifeforms</span>
                <span class="subsector-stat-value">{{ subsectorNativeLifeformCount.toLocaleString() }}</span>
              </div>
            </div>
          </section>

          <section
            v-if="generatedSector && currentViewMode !== 'subsector'"
            class="control-group control-card sector-summary-card"
          >
            <label>{{ currentViewMode === "subsector" ? "Current Subsector" : "Current Sector" }}</label>
            <div class="sector-summary sector-summary--panel">
              <div class="sector-summary-row">
                <span class="summary-pill summary-pill--title">
                  <span class="summary-pill-label">Sector Name</span>
                  <span class="summary-pill-value summary-pill-value--title">{{ generatedSector.name }}</span>
                </span>
                <span v-if="currentSubsectorSummary" class="summary-pill">
                  <span class="summary-pill-label">Subsector</span>
                  <span class="summary-pill-value">{{ currentSubsectorSummary }}</span>
                </span>
              </div>
              <div class="sector-summary-row sector-summary-row--secondary">
                <div class="sector-summary-group sector-summary-group--left">
                  <span class="summary-pill">
                    <span class="summary-pill-label">Systems</span>
                    <span class="summary-pill-value">{{ displayedSector.systemCount.toLocaleString() }}</span>
                  </span>
                  <span class="summary-pill">
                    <span class="summary-pill-label">Empty Hexes</span>
                    <span class="summary-pill-value">{{ displayedSector.emptyCount.toLocaleString() }}</span>
                  </span>
                </div>
                <div class="sector-summary-group sector-summary-group--right">
                  <span v-if="displayedSector.viewportLabel" class="summary-pill">
                    <span class="summary-pill-label">View</span>
                    <span class="summary-pill-value">{{ displayedSector.viewportLabel }}</span>
                  </span>
                  <span class="summary-pill">
                    <span class="summary-pill-label">Star Density</span>
                    <span class="summary-pill-value">{{ densityLabel }}</span>
                  </span>
                  <span class="summary-pill">
                    <span class="summary-pill-label">Realism</span>
                    <span class="summary-pill-value">{{ occupancyRealismLabel }}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="control-card control-card--survey">
            <div class="control-group">
              <div class="view-toggle" role="tablist" aria-label="Survey view toggle">
                <button
                  type="button"
                  class="btn btn-secondary view-toggle-btn"
                  :class="{ active: currentViewMode === 'sector' }"
                  :aria-pressed="currentViewMode === 'sector'"
                  @click="switchSurveyPage('sector')"
                >
                  Sector
                </button>
                <button
                  type="button"
                  class="btn btn-secondary view-toggle-btn"
                  :class="{ active: currentViewMode === 'subsector' }"
                  :aria-pressed="currentViewMode === 'subsector'"
                  @click="switchSurveyPage('subsector')"
                >
                  Subsector
                </button>
              </div>
            </div>

            <div
              v-if="currentViewMode === 'subsector'"
              class="control-group control-group--span-2 subsector-focus-copy"
            >
              <label>Subsector</label>
              <div class="control-help control-help--multiline">
                Focused 8 × 10 survey with shared parent-sector save and load context.
              </div>
            </div>

            <div class="control-group control-group--span-2">
              <label>{{ currentViewMode === "subsector" ? "Load Parent Sector:" : "Load Existing Sector:" }}</label>
              <div class="control-inline-row control-inline-row--load">
                <select v-model="selectedSectorId" class="select-input control-inline-select">
                  <option value="">Select a saved sector...</option>
                  <option v-for="sector in sectorOptions" :key="sector.sectorId" :value="sector.sectorId">
                    {{ sector?.label || sector?.sectorId || "Unnamed sector" }}
                  </option>
                </select>
                <button
                  class="btn btn-secondary btn-icon"
                  :disabled="!canLoadSelectedSector"
                  title="Load selected sector"
                  aria-label="Load selected sector"
                  @click="loadSelectedSector"
                >
                  📂
                </button>
                <button
                  class="btn btn-secondary btn-icon"
                  :disabled="!canSaveSector"
                  title="Save current sector"
                  aria-label="Save current sector"
                  @click="saveCurrentSector({ showToast: true })"
                >
                  💾
                </button>
              </div>
            </div>

            <div
              v-if="scope === 'subsector' && currentViewMode !== 'subsector'"
              class="control-group control-group--span-2"
            >
              <label>Select Subsector:</label>
              <div class="subsector-grid">
                <button
                  v-for="letter in SUBSECTOR_LETTERS"
                  :key="letter"
                  :class="['subsector-btn', { active: selectedSubsector === letter }]"
                  @click="selectedSubsector = letter"
                >
                  {{ letter }}
                </button>
              </div>
            </div>

            <div v-if="scope === 'subsector' && currentViewMode !== 'subsector'" class="control-group">
              <label>Subsector Name:</label>
              <div class="name-row">
                <input
                  v-model="subsectorName"
                  placeholder="Enter subsector name…"
                  class="text-input"
                  @blur="persistSectorName()"
                  @keydown.enter.prevent="persistSectorName({ showToast: true })"
                />
                <button
                  class="btn btn-secondary"
                  @click="randomizeSubsectorName"
                  title="Random subsector name"
                  aria-label="Random subsector name"
                >
                  🎲
                </button>
                <button
                  class="btn btn-secondary"
                  type="button"
                  :disabled="!supportsSpeechSynthesis"
                  :title="
                    supportsSpeechSynthesis
                      ? isSpeakingSubsectorName
                        ? 'Stop subsector name audio'
                        : 'Speak subsector name'
                      : 'Text to speech not supported in this browser'
                  "
                  :aria-label="
                    supportsSpeechSynthesis
                      ? isSpeakingSubsectorName
                        ? 'Stop subsector name audio'
                        : 'Speak subsector name'
                      : 'Text to speech not supported in this browser'
                  "
                  @mousedown.prevent
                  @click="toggleSubsectorNameSpeech"
                >
                  {{ isSpeakingSubsectorName ? "■" : "🔊" }}
                </button>
                <button
                  class="btn btn-secondary"
                  @click="persistSectorName({ showToast: true })"
                  :disabled="!canPersistSectorName"
                  title="Save subsector name"
                  aria-label="Save subsector name"
                >
                  💾
                </button>
              </div>
            </div>

            <div class="control-group control-group--span-2">
              <label>{{ currentViewMode === "subsector" ? "Parent Sector Name:" : "Sector Name:" }}</label>
              <div class="name-row" :class="{ 'name-row--locked': currentViewMode === 'subsector' }">
                <input
                  v-model="sectorName"
                  placeholder="Enter sector name…"
                  class="text-input"
                  :class="{ 'text-input--locked': currentViewMode === 'subsector' }"
                  :readonly="currentViewMode === 'subsector'"
                  @blur="persistSectorName()"
                  @keydown.enter.prevent="persistSectorName({ showToast: true })"
                />
                <button
                  v-if="currentViewMode !== 'subsector'"
                  class="btn btn-secondary"
                  @click="randomizeSectorName"
                  title="Random sector name"
                  aria-label="Random sector name"
                >
                  🎲
                </button>
                <button
                  v-if="currentViewMode !== 'subsector'"
                  class="btn btn-secondary"
                  type="button"
                  :disabled="!supportsSpeechSynthesis"
                  :title="
                    supportsSpeechSynthesis
                      ? isSpeakingSectorName
                        ? 'Stop sector name audio'
                        : 'Speak sector name'
                      : 'Text to speech not supported in this browser'
                  "
                  :aria-label="
                    supportsSpeechSynthesis
                      ? isSpeakingSectorName
                        ? 'Stop sector name audio'
                        : 'Speak sector name'
                      : 'Text to speech not supported in this browser'
                  "
                  @mousedown.prevent
                  @click="toggleSectorNameSpeech"
                >
                  {{ isSpeakingSectorName ? "■" : "🔊" }}
                </button>
                <button
                  v-if="currentViewMode !== 'subsector'"
                  class="btn btn-secondary"
                  @click="persistSectorName({ showToast: true })"
                  :disabled="!canPersistSectorName"
                  title="Save sector name"
                  aria-label="Save sector name"
                >
                  💾
                </button>
              </div>
            </div>

            <div class="control-group">
              <label>Star Density:</label>
              <select v-model="density" class="select-input" :disabled="currentViewMode === 'subsector'">
                <option value="core">Core (dense — 60–80 %)</option>
                <option value="dense">Dense (spiral arm — 40–60 %)</option>
                <option value="average">Average (disk — 20–40 %)</option>
                <option value="scattered">Scattered (outer — 10–20 %)</option>
                <option value="void">Void (halo — 1–5 %)</option>
              </select>
            </div>

            <div class="control-group control-group--span-2 control-group--slider">
              <label>Occupancy Realism: {{ Math.round(occupancyRealism * 100) }}%</label>
              <input v-model.number="occupancyRealism" class="range-input" type="range" min="0" max="2" step="0.05" />
              <div class="control-help">
                {{ occupancyRealismHelp }}
              </div>
            </div>

            <div v-if="generatedSector && currentViewMode !== 'subsector'" class="control-group control-group--span-2">
              <label>Stellar Survey</label>
              <div v-if="selectedHexData?.hasSystem" class="stellar-inline-card">
                <div class="stellar-inline-copy">
                  <span class="stellar-inline-title">System {{ selectedHexData.coord }}</span>
                  <span class="stellar-inline-detail">{{ selectedHexData.starType }}</span>
                  <span v-if="selectedHexData.secondaryStars?.length" class="stellar-inline-detail"
                    >+ {{ selectedHexData.secondaryStars.join(", ") }}</span
                  >
                </div>
                <div class="detail-actions">
                  <button class="btn btn-primary" @click="proceedToStarSystem">🔭 Stellar Survey →</button>
                </div>
              </div>
              <div v-else-if="hasSystemsInGrid" class="stellar-inline-card stellar-inline-card--placeholder">
                <div class="stellar-inline-copy">
                  <span class="stellar-inline-title">No Hex Selected</span>
                  <span class="stellar-inline-detail"
                    >Select a surveyed hex (★) in the sector grid to open Stellar Survey.</span
                  >
                </div>
              </div>
            </div>

            <div v-if="galaxyMinimap" class="control-group galaxy-position-group control-group--span-2">
              <label>Galaxy Position</label>
              <div class="galaxy-minimap-container">
                <svg
                  class="galaxy-minimap-svg"
                  :viewBox="`0 0 ${galaxyMinimap.svgSize} ${galaxyMinimap.svgSize}`"
                  :width="galaxyMinimap.svgSize"
                  :height="galaxyMinimap.svgSize"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    :cx="galaxyMinimap.svgSize / 2"
                    :cy="galaxyMinimap.svgSize / 2"
                    :rx="galaxyMinimap.ellipseRx"
                    :ry="galaxyMinimap.ellipseRy"
                    class="galaxy-boundary"
                  />
                  <line
                    :x1="galaxyMinimap.centerPx - 6"
                    :y1="galaxyMinimap.centerPy"
                    :x2="galaxyMinimap.centerPx + 6"
                    :y2="galaxyMinimap.centerPy"
                    class="galaxy-crosshair"
                  />
                  <line
                    :x1="galaxyMinimap.centerPx"
                    :y1="galaxyMinimap.centerPy - 6"
                    :x2="galaxyMinimap.centerPx"
                    :y2="galaxyMinimap.centerPy + 6"
                    class="galaxy-crosshair"
                  />
                  <circle
                    :cx="galaxyMinimap.centerPx"
                    :cy="galaxyMinimap.centerPy"
                    :r="galaxyMinimap.centerGuideRadius"
                    class="galaxy-center-guide"
                  />
                  <path
                    v-if="galaxyMinimap.centerBearingArcPath"
                    :d="galaxyMinimap.centerBearingArcPath"
                    class="galaxy-center-bearing"
                  />
                  <circle
                    v-if="galaxyMinimap.centerBearingPoint"
                    :cx="galaxyMinimap.centerBearingPoint.x"
                    :cy="galaxyMinimap.centerBearingPoint.y"
                    r="2.8"
                    class="galaxy-center-bearing-dot"
                  />
                  <rect
                    v-for="tile in galaxyMinimap.tiles"
                    :key="tile.id"
                    :x="tile.px - galaxyMinimap.tileHalf"
                    :y="tile.py - galaxyMinimap.tileHalf"
                    :width="galaxyMinimap.tileSize"
                    :height="galaxyMinimap.tileSize"
                    rx="1"
                    ry="1"
                    :class="tile.cls"
                  />
                </svg>
                <div class="galaxy-position-legend">
                  <span class="position-region">📍 {{ galaxyMinimap.regionLabel }}</span>
                  <span v-if="galaxyMinimap.distanceLabel" class="position-dist">{{
                    galaxyMinimap.distanceLabel
                  }}</span>
                  <span v-if="galaxyMinimap.coordLabel" class="position-coord"
                    >Grid {{ galaxyMinimap.coordLabel }}</span
                  >
                  <span v-if="galaxyMinimap.centerBearingLabel" class="position-bearing">
                    Center bearing {{ galaxyMinimap.centerBearingLabel }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section class="sector-pane">
          <div v-if="hasGalaxyContext && !hasSavedSectors && !generatedSector" class="context-hint">
            No saved sectors found for this galaxy yet. Generate your first sector to begin.
            <button class="btn btn-secondary" :disabled="isMappingSectors" @click="mapGalaxySectors">
              {{ isMappingSectors ? "Mapping..." : "Map Galaxy Sectors" }}
            </button>
          </div>

          <div v-if="generatedSector" class="sector-results">
            <div ref="gridWrapperRef" class="hex-grid-wrapper" :class="`hex-grid-wrapper--${gridSizeMode}`">
              <div class="hex-grid" :style="gridStyle">
                <div
                  v-for="hex in displayedSector.hexes"
                  :key="hex.coord"
                  class="hex-cell"
                  :class="{
                    occupied: hex.hasSystem,
                    'presence-only': hex.presenceOnly,
                    selected: hex.coord === selectedHex,
                  }"
                  @click="selectHex(hex)"
                  :title="
                    hex.presenceOnly
                      ? `${hex.coord} — stellar object detected (unsurveyed)`
                      : hex.hasSystem
                        ? `${hex.coord} — ${hex.starType}`
                        : hex.coord
                  "
                >
                  <div v-if="showHexCoords" class="hex-coord">{{ hex.coord }}</div>
                  <div v-if="hex.hasSystem && !hex.presenceOnly" class="hex-star" :class="hex.starClass">★</div>
                  <div v-if="hex.presenceOnly" class="hex-star hex-star--presence">◦</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside v-if="currentViewMode === 'subsector'" class="subsector-sidebar">
          <section
            v-if="scope === 'subsector'"
            class="control-card subsector-sidebar-card subsector-sidebar-card--naming"
          >
            <label>Subsector Name</label>
            <div class="name-row name-row--sidebar">
              <input
                v-model="subsectorName"
                placeholder="Enter subsector name…"
                class="text-input"
                @blur="persistSectorName()"
                @keydown.enter.prevent="persistSectorName({ showToast: true })"
              />
              <button
                class="btn btn-secondary"
                @click="randomizeSubsectorName"
                title="Random subsector name"
                aria-label="Random subsector name"
              >
                🎲
              </button>
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="!supportsSpeechSynthesis"
                :title="
                  supportsSpeechSynthesis
                    ? isSpeakingSubsectorName
                      ? 'Stop subsector name audio'
                      : 'Speak subsector name'
                    : 'Text to speech not supported in this browser'
                "
                :aria-label="
                  supportsSpeechSynthesis
                    ? isSpeakingSubsectorName
                      ? 'Stop subsector name audio'
                      : 'Speak subsector name'
                    : 'Text to speech not supported in this browser'
                "
                @mousedown.prevent
                @click="toggleSubsectorNameSpeech"
              >
                {{ isSpeakingSubsectorName ? "■" : "🔊" }}
              </button>
              <button
                class="btn btn-secondary"
                @click="persistSectorName({ showToast: true })"
                :disabled="!canPersistSectorName"
                title="Save subsector name"
                aria-label="Save subsector name"
              >
                💾
              </button>
            </div>
          </section>

          <section
            v-if="scope === 'subsector'"
            class="control-card subsector-sidebar-card subsector-sidebar-card--selector"
          >
            <label>Select Subsector</label>
            <div class="subsector-grid subsector-grid--sidebar">
              <button
                v-for="letter in SUBSECTOR_LETTERS"
                :key="letter"
                :class="['subsector-btn', { active: selectedSubsector === letter }]"
                @click="selectedSubsector = letter"
              >
                {{ letter }}
              </button>
            </div>
          </section>

          <section
            v-if="scope === 'subsector'"
            class="control-card subsector-sidebar-card subsector-sidebar-card--actions"
          >
            <label>Subsector Survey</label>
            <div class="subsector-sidebar-copy">
              Generate full stellar survey data for every occupied hex in the current subsector viewport.
            </div>
            <button
              class="btn btn-primary subsector-sidebar-btn"
              :disabled="isLoading"
              @click="generateSubsectorStellarSurvey"
            >
              {{ isLoading ? "Generating..." : "⭐ Generate Stellar Survey" }}
            </button>
          </section>

          <section class="control-card subsector-sidebar-card subsector-sidebar-card--orbital">
            <label>Orbital Preview</label>
            <div v-if="orbitalPreview.metaItems?.length" class="orbital-preview-meta">
              <span
                v-for="item in orbitalPreview.metaItems"
                :key="`${item?.label || 'meta'}-${item?.value || 'value'}`"
                class="orbital-preview-meta-pill"
                :class="item.tone ? `orbital-preview-meta-pill--${item.tone}` : null"
              >
                <span class="orbital-preview-meta-label">{{ item?.label || "Status" }}</span>
                <span class="orbital-preview-meta-value">{{ item?.value || "Pending" }}</span>
              </span>
            </div>

            <div
              v-if="orbitalPreview.state === 'ready'"
              class="orbital-preview"
              :class="`orbital-preview--${orbitalPreview.theme}`"
            >
              <svg
                class="orbital-preview-svg"
                viewBox="0 0 220 220"
                xmlns="http://www.w3.org/2000/svg"
                @mouseleave="clearOrbitalTarget"
              >
                <defs>
                  <radialGradient id="orbitalPreviewStarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" :stop-color="orbitalPreview.starColor" stop-opacity="0.95" />
                    <stop offset="100%" :stop-color="orbitalPreview.starColor" stop-opacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="110" r="30" fill="url(#orbitalPreviewStarGlow)" />
                <ellipse
                  v-for="ring in orbitalPreview.rings"
                  :key="`ring-${ring.id}`"
                  cx="110"
                  cy="110"
                  :rx="ring.rx"
                  :ry="ring.ry"
                  :title="ring.tooltip"
                  class="orbital-preview-ring"
                  :class="ring.className"
                  tabindex="0"
                  @mouseenter="focusOrbitalTarget({ kind: 'ring', id: ring.id })"
                  @focus="focusOrbitalTarget({ kind: 'ring', id: ring.id })"
                  @blur="clearOrbitalTarget"
                />
                <circle cx="110" cy="110" r="14" :fill="orbitalPreview.starColor" class="orbital-preview-star" />
                <circle
                  v-for="body in orbitalPreview.bodies"
                  :key="body.id"
                  :cx="body.cx"
                  :cy="body.cy"
                  :r="body.r"
                  :fill="body.color"
                  :title="body.tooltip"
                  class="orbital-preview-body"
                  :class="body.className"
                  tabindex="0"
                  @mouseenter="focusOrbitalTarget({ kind: 'body', id: body.id })"
                  @focus="focusOrbitalTarget({ kind: 'body', id: body.id })"
                  @blur="clearOrbitalTarget"
                />
              </svg>
              <div class="orbital-preview-copy">
                <span class="orbital-preview-title">Hex {{ orbitalPreview.coord }}</span>
                <span class="orbital-preview-detail">Primary {{ orbitalPreview.primary }}</span>
                <span v-if="orbitalPreview.statusLabel" class="orbital-preview-detail">{{
                  orbitalPreview.statusLabel
                }}</span>
                <span v-if="orbitalPreview.secondaryLabel" class="orbital-preview-detail">{{
                  orbitalPreview.secondaryLabel
                }}</span>
              </div>
              <button class="btn btn-primary" @click="proceedToStarSystem">🔭 Stellar Survey →</button>
            </div>
            <div v-else class="orbital-preview orbital-preview--placeholder">
              <div class="orbital-preview-empty-icon">◌</div>
              <div class="orbital-preview-copy">
                <span class="orbital-preview-title">{{ orbitalPreview.title }}</span>
                <span class="orbital-preview-detail">{{ orbitalPreview.message }}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import * as toastService from "../../utils/toast.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import * as galaxyApi from "../../api/galaxyApi.js";
import * as sectorApi from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability, pickCentralAnomalyType } from "../../utils/sectorGeneration.js";
import { generatePhonotacticName } from "../../utils/nameGenerator.js";
import { generateGalaxySectorLayout } from "../../utils/sectorLayoutGenerator.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { getRequestedSurveyViewport, useSectorSurveyViewMode } from "../../composables/useSectorSurveyViewMode.js";
import { SUBSECTOR_LETTERS, getSubsectorViewportBounds } from "../../utils/subsector.js";

const props = defineProps({
  galaxyId: { type: String, default: null },
  viewMode: { type: String, default: "sector" },
});
const router = useRouter();
const route = useRoute();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const preferencesStore = usePreferencesStore();

// ── State ────────────────────────────────────────────────────────────────────
const scope = ref(props.viewMode === "subsector" ? "subsector" : "sector");
const selectedSubsector = ref("A");
const subsectorName = ref("");
const selectedSectorId = ref("");
const sectorName = ref("");
const density = ref("average");
const generatedSector = ref(null);
const selectedHex = ref(null);
const isLoading = ref(false);
const loadingMode = ref("generate");
const galaxyProfile = ref(null);
const occupancyRealism = ref(1);
const isMappingSectors = ref(false);
const gridSizeMode = ref("fit");
const isSpeakingSectorName = ref(false);
const isSpeakingSubsectorName = ref(false);
const generationMode = ref("");
const gridWrapperRef = ref(null);
const gridWrapperBounds = ref({ width: 0, height: 0 });
const focusedOrbitalTarget = ref(null);
const supportsSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;
let gridWrapperResizeObserver = null;
const { currentViewMode, currentSurveyRouteName, surveyPageLabel, switchSurveyPage } = useSectorSurveyViewMode({
  props,
  route,
  router,
  selectedSectorId,
  selectedSubsector,
  subsectorName,
});

// Update page title dynamically
watchEffect(() => {
  if (sectorName.value) {
    document.title = `${surveyPageLabel.value}: ${sectorName.value} | Eclipsed Horizons`;
  } else {
    document.title = `${surveyPageLabel.value} | Eclipsed Horizons`;
  }
});

watch(
  [() => props.galaxyId, () => props.viewMode],
  async ([galaxyId]) => {
    stopSectorNameSpeech();
    scope.value = currentViewMode.value;
    await initializeSectorSelectionSafely(galaxyId);
  },
  { immediate: true },
);

watch(
  () => generatedSector.value?.name,
  () => {
    stopSectorNameSpeech();
  },
);

watch(
  () => [route.query.sectorId, route.query.gridX, route.query.gridY, route.query.sectorName, route.query.from],
  async () => {
    if (!props.galaxyId) {
      return;
    }
    stopSectorNameSpeech();
    await initializeSectorSelectionSafely(props.galaxyId);
  },
);

// ── Computed ─────────────────────────────────────────────────────────────────
const densityLabel = computed(() => {
  const map = {
    core: "Core",
    dense: "Dense",
    average: "Average",
    scattered: "Scattered",
    void: "Void",
  };
  return map[density.value] ?? density.value;
});

const occupancyRealismLabel = computed(() => {
  const value = Number(generatedSector.value?.occupancyRealism ?? occupancyRealism.value ?? 1);
  const clamped = Math.min(2, Math.max(0, value));
  return `${Math.round(clamped * 100)}%`;
});
const densityTargetRangeLabel = computed(() => {
  const ranges = {
    core: "60-80%",
    dense: "40-60%",
    average: "20-40%",
    scattered: "10-20%",
    void: "1-5%",
  };
  return ranges[density.value] ?? "20-40%";
});

function isCoordInSubsector(coord, letter) {
  const rawCoord = String(coord || "").trim();
  if (!/^\d{4}$/.test(rawCoord)) {
    return false;
  }

  const bounds = getSubsectorViewportBounds(letter);
  const col = Number(rawCoord.slice(0, 2));
  const row = Number(rawCoord.slice(2, 4));
  return col >= bounds.colStart && col <= bounds.colEnd && row >= bounds.rowStart && row <= bounds.rowEnd;
}

const displayedSector = computed(() => {
  const sector = generatedSector.value;
  if (!sector) {
    return null;
  }

  const gridCols = Number(sector.gridCols ?? 0);
  const gridRows = Number(sector.gridRows ?? 0);
  if (scope.value !== "subsector" || gridCols !== 32 || gridRows !== 40) {
    return {
      ...sector,
      viewportLabel: scope.value === "subsector" ? `Subsector ${selectedSubsector.value}` : null,
    };
  }

  const visibleHexes = (Array.isArray(sector.hexes) ? sector.hexes : []).filter((hex) =>
    isCoordInSubsector(hex?.coord, selectedSubsector.value),
  );
  const systemCount = visibleHexes.filter((hex) => hex.hasSystem).length;

  return {
    ...sector,
    scope: "subsector",
    gridCols: 8,
    gridRows: 10,
    hexes: visibleHexes,
    systemCount,
    emptyCount: Math.max(0, 80 - systemCount),
    presenceOnlyCount: visibleHexes.filter((hex) => hex.presenceOnly).length,
    viewportLabel: `Subsector ${selectedSubsector.value}`,
  };
});

const rolledOccupancyLabel = computed(() => {
  const systemCount = Number(displayedSector.value?.systemCount ?? 0);
  const cols = Number(displayedSector.value?.gridCols ?? 0);
  const rows = Number(displayedSector.value?.gridRows ?? 0);
  const totalHexes = cols * rows;
  if (!totalHexes) {
    return "0%";
  }
  const percent = (systemCount / totalHexes) * 100;
  return `${percent.toFixed(1)}% (${systemCount.toLocaleString()} / ${totalHexes.toLocaleString()} hexes)`;
});
const occupancyRealismHelp = computed(() => {
  const value = Math.min(2, Math.max(0, Number(occupancyRealism.value ?? 1)));
  if (value < 1) {
    return `Below 100% thins the sector out. ${Math.round(value * 100)}% means each hex rolls at about ${Math.round(value * 100)}% of the selected density before local variation.`;
  }
  if (value > 1) {
    return `Above 100% packs more systems in. ${Math.round(value * 100)}% means each hex rolls at about ${Math.round(value * 100)}% of the selected density before local variation.`;
  }
  return "100% uses the selected density as-is. Local hex variation still applies based on galaxy morphology.";
});

const isSubsectorViewport = computed(
  () => Number(displayedSector.value?.gridCols ?? 0) === 8 && Number(displayedSector.value?.gridRows ?? 0) === 10,
);

const subsectorFitWidth = computed(() => {
  if (!isSubsectorViewport.value) {
    return null;
  }

  const boundsWidth = Number(gridWrapperBounds.value?.width ?? 0);
  const boundsHeight = Number(gridWrapperBounds.value?.height ?? 0);
  if (!boundsWidth || !boundsHeight) {
    return null;
  }

  const cols = Number(displayedSector.value?.gridCols ?? 0);
  const rows = Number(displayedSector.value?.gridRows ?? 0);
  if (!cols || !rows) {
    return null;
  }

  const wrapperPadding = 16;
  const gap = 1;
  const availableWidth = Math.max(0, boundsWidth - wrapperPadding);
  const availableHeight = Math.max(0, boundsHeight - wrapperPadding);
  const widthFromHeight = ((availableHeight - gap * (rows - 1)) * cols) / rows + gap * (cols - 1);
  const targetWidth = Math.min(availableWidth, widthFromHeight);

  return targetWidth > 0 ? `${Math.floor(targetWidth)}px` : null;
});

const gridStyle = computed(() => {
  if (!displayedSector.value) return {};
  const cols = displayedSector.value.gridCols;
  const sizePresets = {
    fit: {
      columnSize: "minmax(0, 1fr)",
      gridWidth: isSubsectorViewport.value ? subsectorFitWidth.value || "100%" : "100%",
      coordFontSize: cols >= 24 ? "0.38rem" : cols >= 12 ? "0.5rem" : isSubsectorViewport.value ? "1.04rem" : "0.6rem",
      starFontSize: cols >= 24 ? "0.7rem" : cols >= 12 ? "0.9rem" : isSubsectorViewport.value ? "0.9rem" : "1rem",
    },
    comfortable: {
      columnSize:
        cols >= 24 ? "minmax(1.45rem, 1fr)" : isSubsectorViewport.value ? "minmax(1.7rem, 1fr)" : "minmax(2rem, 1fr)",
      gridWidth: "max-content",
      coordFontSize:
        cols >= 24 ? "0.44rem" : cols >= 12 ? "0.56rem" : isSubsectorViewport.value ? "1.12rem" : "0.64rem",
      starFontSize: cols >= 24 ? "0.8rem" : cols >= 12 ? "1rem" : isSubsectorViewport.value ? "1rem" : "1.1rem",
    },
    large: {
      columnSize:
        cols >= 24 ? "minmax(1.85rem, 1fr)" : isSubsectorViewport.value ? "minmax(2rem, 1fr)" : "minmax(2.4rem, 1fr)",
      gridWidth: "max-content",
      coordFontSize: cols >= 24 ? "0.5rem" : cols >= 12 ? "0.6rem" : isSubsectorViewport.value ? "1.24rem" : "0.72rem",
      starFontSize: cols >= 24 ? "0.9rem" : cols >= 12 ? "1.1rem" : isSubsectorViewport.value ? "1.05rem" : "1.2rem",
    },
  };
  const preset = sizePresets[gridSizeMode.value] ?? sizePresets.fit;
  return {
    gridTemplateColumns: `repeat(${cols}, ${preset.columnSize})`,
    width: preset.gridWidth,
    maxWidth: "100%",
    marginInline: isSubsectorViewport.value ? "auto" : undefined,
    "--hex-coord-font-size": preset.coordFontSize,
    "--hex-star-font-size": preset.starFontSize,
    "--hex-grid-gap": isSubsectorViewport.value ? "1px" : "2px",
    "--hex-cell-padding": isSubsectorViewport.value ? "0.04rem" : "0.08rem",
  };
});

function updateGridWrapperBounds() {
  const element = gridWrapperRef.value;
  if (!element) {
    return;
  }

  gridWrapperBounds.value = {
    width: element.clientWidth,
    height: element.clientHeight,
  };
}

function syncGridWrapperObserver(element) {
  gridWrapperResizeObserver?.disconnect();
  gridWrapperResizeObserver = null;

  if (typeof ResizeObserver === "undefined" || !element) {
    return;
  }

  gridWrapperResizeObserver = new ResizeObserver(() => {
    updateGridWrapperBounds();
  });
  gridWrapperResizeObserver.observe(element);
}

onMounted(() => {
  updateGridWrapperBounds();
  syncGridWrapperObserver(gridWrapperRef.value);
});

onBeforeUnmount(() => {
  gridWrapperResizeObserver?.disconnect();
  gridWrapperResizeObserver = null;
});

watch([generatedSector, scope, selectedSubsector, gridSizeMode], () => {
  updateGridWrapperBounds();
});

watch(gridWrapperRef, (element) => {
  syncGridWrapperObserver(element);
  updateGridWrapperBounds();
});

const showHexCoords = computed(() => {
  if (!displayedSector.value) return true;
  if (isSubsectorViewport.value) {
    return true;
  }
  return gridSizeMode.value !== "fit";
});

const selectedHexData = computed(
  () => displayedSector.value?.hexes?.find((h) => h.coord === selectedHex.value) ?? null,
);
const hasSystemsInGrid = computed(() => (displayedSector.value?.systemCount ?? 0) > 0);

watch(selectedHexData, () => {
  clearOrbitalTarget();
});

const orbitalPreview = computed(() => {
  const hex = selectedHexData.value;
  const focusedTarget = focusedOrbitalTarget.value;
  if (!hasSystemsInGrid.value) {
    return {
      state: "empty",
      title: "No surveyed system yet",
      message: "Run system generation for this subsector to create systems that can be inspected.",
      metaItems: [],
    };
  }

  if (!hex?.hasSystem || hex.presenceOnly || !hex.starType) {
    const hasHexSelection = Boolean(hex?.coord);
    return {
      state: "select",
      title: "Select a surveyed system",
      message: "Choose a starred hex in the subsector grid to preview its local orbital structure.",
      metaItems: hasHexSelection
        ? [
            { label: "Hex", value: hex.coord },
            { label: "State", value: hex.presenceOnly ? "Presence only" : "Unsurveyed", tone: "muted" },
          ]
        : [],
    };
  }

  const secondaryStars = Array.isArray(hex.secondaryStars)
    ? hex.secondaryStars.filter((value) => String(value || "").trim())
    : [];
  const anomalyType = String(hex.anomalyType || "").trim();
  const normalizedAnomaly = anomalyType.toLowerCase();
  const anomalyDescriptor = describeAnomalyType(anomalyType);
  const primaryCode = String(hex.starType || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const isAnomaly = Boolean(anomalyType);
  const isCompact = ["O", "B", "A"].includes(primaryCode);
  const isWarm = ["K", "M"].includes(primaryCode);
  const isBlackHole = normalizedAnomaly.includes("black hole") || normalizedAnomaly.includes("singularity");
  const isNebula = normalizedAnomaly.includes("nebula");
  const isPulsar = normalizedAnomaly.includes("pulsar") || normalizedAnomaly.includes("neutron");
  const theme = isAnomaly ? "anomaly" : isCompact ? "hot" : isWarm ? "warm" : "standard";
  const bodyCount = Math.max(
    3,
    Math.min(isAnomaly ? 7 : 6, 3 + secondaryStars.length + (isCompact ? 1 : 0) + (isNebula ? -1 : 0)),
  );
  const ringStep = isBlackHole ? 14 : isNebula ? 20 : isPulsar ? 17 : isAnomaly ? 16 : 18;
  const ringHeightStep = isBlackHole ? 6 : isPulsar ? 7 : isCompact ? 8 : isNebula ? 11 : 9;
  const angleStep = isBlackHole ? 0.92 : isNebula ? 0.61 : isPulsar ? 0.66 : isAnomaly ? 0.58 : 0.72;
  const rings = Array.from({ length: bodyCount }, (_, index) => ({
    id: index,
    rx: 36 + index * ringStep,
    ry: 18 + index * ringHeightStep,
    className: isBlackHole
      ? "orbital-preview-ring--black-hole"
      : isNebula
        ? "orbital-preview-ring--nebula"
        : isAnomaly
          ? "orbital-preview-ring--anomaly"
          : isCompact
            ? "orbital-preview-ring--compact"
            : null,
    label: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"} orbit`,
    tooltip: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"} orbital band`,
  }));
  const palette = isBlackHole
    ? ["#c084fc", "#7dd3fc", "#f472b6", "#f59e0b", "#94a3b8", "#fde68a"]
    : isNebula
      ? ["#86efac", "#7dd3fc", "#f9a8d4", "#c4b5fd", "#fde68a", "#fdba74"]
      : isPulsar
        ? ["#7dd3fc", "#fde68a", "#c4b5fd", "#f9a8d4", "#86efac", "#fdba74"]
        : isAnomaly
          ? ["#f0abfc", "#c084fc", "#fb7185", "#f59e0b", "#7dd3fc", "#fde68a", "#86efac"]
          : isWarm
            ? ["#fdba74", "#fde68a", "#f9a8d4", "#86efac", "#7dd3fc", "#c4b5fd"]
            : ["#7dd3fc", "#f9a8d4", "#fde68a", "#86efac", "#c4b5fd", "#fdba74"];
  const bodies = rings.map((ring, index) => {
    const angle = -1.05 + index * angleStep;
    return {
      id: index,
      cx: 110 + Math.cos(angle) * ring.rx,
      cy: 110 + Math.sin(angle) * ring.ry,
      r:
        index === 0
          ? isBlackHole
            ? 3.8
            : isCompact
              ? 5.2
              : 4.8
          : Math.max(2.8, 4.8 - index * (isAnomaly ? 0.25 : 0.35) + (isNebula ? 0.35 : 0)),
      color: palette[index % palette.length],
      className: isBlackHole
        ? "orbital-preview-body--compressed"
        : isNebula
          ? "orbital-preview-body--diffuse"
          : isAnomaly && index % 2 === 0
            ? "orbital-preview-body--energized"
            : null,
      label: index === 0 ? "Inner world" : `Body ${index + 1}`,
      tooltip: index === 0 ? "Inner orbit body" : `Orbital body ${index + 1}`,
    };
  });

  const focusMeta =
    focusedTarget?.kind === "ring"
      ? rings.find((ring) => ring.id === focusedTarget.id)
      : focusedTarget?.kind === "body"
        ? bodies.find((body) => body.id === focusedTarget.id)
        : null;

  const metaItems = [
    { label: "Hex", value: hex.coord },
    { label: "Type", value: hex.starType, tone: isAnomaly ? "anomaly" : "accent" },
    {
      label: "Status",
      value: anomalyDescriptor ? `${anomalyDescriptor.icon} ${anomalyDescriptor.label || anomalyType}` : "Surveyed",
      tone: anomalyDescriptor ? "anomaly" : "ok",
    },
  ];

  if (focusMeta) {
    metaItems.push({
      label: focusedTarget.kind === "ring" ? "Orbit" : "Focus",
      value: focusMeta?.label || (focusedTarget.kind === "ring" ? "Orbit" : "Focus"),
      tone: "focus",
    });
  }

  return {
    state: "ready",
    theme,
    coord: hex.coord,
    primary: hex.starType,
    starColor: starColorForDesignation(hex.starType),
    rings,
    bodies,
    statusLabel: anomalyType
      ? `${anomalyDescriptor?.icon || "✧"} ${anomalyDescriptor?.label || anomalyType}`
      : isCompact
        ? "High-energy primary"
        : isWarm
          ? "Warm primary"
          : "Stable primary",
    secondaryLabel: secondaryStars.length ? `Companions ${secondaryStars.join(", ")}` : null,
    metaItems,
  };
});
const showSelectHexHint = computed(() => hasSystemsInGrid.value && !selectedHexData.value?.hasSystem);
const isAtlasEntry = computed(() => String(route.query.from || "").trim() === "atlas");
const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }
  if (String(route.query.from || "") === "atlas") {
    const atlasGalaxyId = String(route.query.atlasGalaxyId || props.galaxyId || "").trim();
    return atlasGalaxyId ? { name: "TravellerAtlas", query: { galaxyId: atlasGalaxyId } } : { name: "TravellerAtlas" };
  }
  return { name: "GalaxySurvey" };
});
const activeSectorRecord = computed(() => {
  if (!selectedSectorId.value) return null;
  return sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value) ?? null;
});
const activeSectorMetadata = computed(() => activeSectorRecord.value?.metadata ?? {});
const sectorPresenceCount = computed(() =>
  Array.isArray(activeSectorMetadata.value?.occupiedHexes) ? activeSectorMetadata.value.occupiedHexes.length : 0,
);
const sectorTypedHexCount = computed(() => {
  const hexStarTypes = activeSectorMetadata.value?.hexStarTypes;
  return hexStarTypes && typeof hexStarTypes === "object" ? Object.keys(hexStarTypes).length : 0;
});
const defaultGenerationMode = computed(() => {
  if (!activeSectorRecord.value && !generatedSector.value) {
    if (isAtlasEntry.value && getRequestedGridCoordinates()) {
      return "presence";
    }
    return "name-systems";
  }
  if (sectorPresenceCount.value <= 0) {
    return "name-presence";
  }
  if (sectorTypedHexCount.value < sectorPresenceCount.value) {
    return "name-systems";
  }
  return "name-systems";
});
const effectiveGenerationMode = computed(() => generationMode.value || defaultGenerationMode.value);
const generationModeOptions = computed(() => [
  { id: "name", label: "Name Only" },
  { id: "name-presence", label: "Name + Presence" },
  { id: "presence", label: "Presence Only" },
  { id: "name-systems", label: "Name + Systems" },
]);
const generationAction = computed(() => {
  const scopeLabel = scope.value === "subsector" ? "Subsector" : "Sector";
  if (effectiveGenerationMode.value === "name") {
    return {
      id: "name",
      label: "💾 Save Sector Name",
      description:
        "Create or update the sector record and name only. No system presence or stellar systems are rolled.",
    };
  }
  if (effectiveGenerationMode.value === "name-presence") {
    return {
      id: "name-presence",
      label: "⚡ Name + Presence",
      description:
        "Save the current sector name, then roll occupied hexes without generating full stellar system data.",
    };
  }
  if (effectiveGenerationMode.value === "presence") {
    return {
      id: "presence",
      label: "🗺 Presence Only",
      description: "Roll occupied hexes only. Full stellar system data is not generated.",
    };
  }
  if (sectorPresenceCount.value > 0 && sectorTypedHexCount.value < sectorPresenceCount.value) {
    return {
      id: "name-systems",
      label: "⭐ Name + Systems",
      description:
        "Preserve the current sector name and convert existing occupied hexes into fully typed stellar systems.",
    };
  }
  return {
    id: "name-systems",
    label: `⭐ Name + Systems`,
    description: `Generate a full ${scopeLabel.toLowerCase()} survey in one step, including occupied hexes and stellar system data.`,
  };
});

watch(
  defaultGenerationMode,
  (nextMode) => {
    if (!generationMode.value) {
      generationMode.value = nextMode;
    }
  },
  { immediate: true },
);

const canLoadSelectedSector = computed(() => Boolean(selectedSectorId.value) && !isLoading.value);

const canSaveSector = computed(() => {
  if (isLoading.value || !generatedSector.value?.hexes?.length) {
    return false;
  }

  return Boolean(selectedSectorId.value || generatedSector.value?.sectorId || props.galaxyId);
});

const canPersistSectorName = computed(() => {
  const currentBaseName = String(sectorName.value || "").trim();
  if (!currentBaseName) {
    return false;
  }

  if (!selectedSectorId.value) {
    return Boolean(props.galaxyId && getRequestedGridCoordinates());
  }

  const sector = sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value);
  if (!sector) {
    return false;
  }

  const currentDisplayName = buildGeneratedSectorName(currentBaseName);
  const persistedDisplayName = String(sector?.metadata?.displayName || sector.sectorId).trim();
  if (currentDisplayName !== persistedDisplayName) {
    return true;
  }

  if (scope.value === "subsector") {
    const currentSubsectorName = String(subsectorName.value || "").trim();
    const persistedSubsectorName = String(sector?.metadata?.subsectorName || "").trim();
    if (currentSubsectorName !== persistedSubsectorName) {
      return true;
    }
  }

  return false;
});

const displayedOccupiedHexCount = computed(() => Number(displayedSector.value?.systemCount ?? 0));
const displayedPresenceOnlyCount = computed(() => Number(displayedSector.value?.presenceOnlyCount ?? 0));
const displayedTypedHexCount = computed(() =>
  Math.max(0, displayedOccupiedHexCount.value - displayedPresenceOnlyCount.value),
);
const displayedTotalHexCount = computed(() => {
  const cols = Number(displayedSector.value?.gridCols ?? 0);
  const rows = Number(displayedSector.value?.gridRows ?? 0);
  return cols * rows;
});
const subsectorSurveyPercentLabel = computed(() => {
  const totalHexes = displayedTotalHexCount.value;
  if (!totalHexes) {
    return "0%";
  }

  const highestCompletedCount =
    displayedOccupiedHexCount.value > 0 && displayedTypedHexCount.value === displayedOccupiedHexCount.value
      ? displayedTypedHexCount.value
      : displayedOccupiedHexCount.value;

  return `${Math.round((highestCompletedCount / totalHexes) * 100)}%`;
});
const subsectorNativeLifeformCount = computed(() => {
  const visibleSystemCoords = new Set(
    (Array.isArray(displayedSector.value?.hexes) ? displayedSector.value.hexes : [])
      .filter((hex) => hex?.hasSystem && typeof hex?.coord === "string")
      .map((hex) => String(hex.coord).trim())
      .filter(Boolean),
  );

  if (!visibleSystemCoords.size) {
    return 0;
  }

  return systemStore.systems.reduce((count, system) => {
    const x = Number(system?.hexCoordinates?.x ?? 0);
    const y = Number(system?.hexCoordinates?.y ?? 0);
    const coord = `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`;
    if (!visibleSystemCoords.has(coord)) {
      return count;
    }

    const planets = Array.isArray(system?.planets)
      ? system.planets
      : Array.isArray(system?.metadata?.systemRecord?.planets)
        ? system.metadata.systemRecord.planets
        : [];

    return (
      count +
      planets.filter((planet) => {
        if (planet?.nativeSophontLife) {
          return true;
        }
        const nativeLifeform = String(planet?.nativeLifeform || system?.nativeLifeform || "").trim();
        return Boolean(nativeLifeform);
      }).length
    );
  }, 0);
});

const sectorOptions = computed(() =>
  sectorStore.sectors.map((sector) => ({
    sectorId: sector.sectorId,
    label: buildSectorLabel(sector),
  })),
);

const hasGalaxyContext = computed(() => Boolean(props?.galaxyId));
const hasSavedSectors = computed(() => sectorOptions.value.length > 0);

// ── Galaxy Position Minimap ──────────────────────────────────────────────────
const galaxyMinimap = computed(() => {
  if (!galaxyProfile.value) return null;

  // Derive grid radius using the same formula as sectorLayoutGenerator.js
  const bulgeRadius = Number(galaxyProfile.value?.morphology?.bulgeRadius) || 5000;
  const galaxyType = String(galaxyProfile.value?.type || "Spiral");
  const isElliptical = galaxyType === "Elliptical";
  const isSpiral = galaxyType.includes("Spiral");
  const xStretch = isElliptical ? 1.6 : isSpiral ? 1.3 : 1.0;
  const gridRadius = Math.min(14, Math.max(2, Math.round(bulgeRadius / 3600)));

  // Find current sector's grid position.
  const currentRecord = selectedSectorId.value
    ? sectorStore.sectors.find((s) => s.sectorId === selectedSectorId.value)
    : null;
  const hasGridCoords =
    currentRecord && Number.isFinite(currentRecord?.metadata?.gridX) && Number.isFinite(currentRecord?.metadata?.gridY);
  const currentGX = hasGridCoords ? Number(currentRecord.metadata.gridX) : null;
  const currentGY = hasGridCoords ? Number(currentRecord.metadata.gridY) : null;

  // Build a set of all sector grid positions for rendering tiles.
  const knownTileSet = new Map(); // key "gx,gy" → densityClass
  for (const s of sectorStore.sectors) {
    if (Number.isFinite(s?.metadata?.gridX) && Number.isFinite(s?.metadata?.gridY)) {
      const key = `${s.metadata.gridX},${s.metadata.gridY}`;
      knownTileSet.set(key, {
        densityClass: s.densityClass ?? 0,
        explored: !!(s.metadata?.hexPresenceGenerated || s.metadata?.systemCount > 0),
      });
    }
  }

  // SVG layout constants.
  const SVG_SIZE = 180;
  const PADDING = 12;
  const usable = SVG_SIZE - PADDING * 2;
  const step = usable / (gridRadius * 2 + 1); // pixels per grid cell
  const tileSize = Math.max(2, step * 0.82);
  const tileHalf = tileSize / 2;
  const centerPx = SVG_SIZE / 2;
  const centerPy = SVG_SIZE / 2;
  const ellipseRx = (gridRadius * xStretch * step) / xStretch + step * 0.4;
  const ellipseRy = gridRadius * step + step * 0.4;
  const centerGuideRadius = Math.max(12, Math.min(ellipseRx, ellipseRy) * 0.32);

  function gridToPx(gx, gy) {
    return {
      px: centerPx + gx * step,
      py: centerPy + gy * step,
    };
  }

  // Build tile list: use known sectors OR infer from layout boundary.
  const tiles = [];
  const isDwarf = galaxyType === "Dwarf";
  const isIrregular = galaxyType === "Irregular";
  const cutoffRatio = isDwarf ? 0.75 : isIrregular ? 0.85 : 0.92;

  for (let gx = -gridRadius; gx <= gridRadius; gx++) {
    for (let gy = -gridRadius; gy <= gridRadius; gy++) {
      const normDist = Math.sqrt((gx / xStretch) ** 2 + gy ** 2) / gridRadius;
      if (normDist > cutoffRatio + 0.08) continue;

      const key = `${gx},${gy}`;
      const known = knownTileSet.get(key);
      const isCurrent = gx === currentGX && gy === currentGY;
      const isCenter = gx === 0 && gy === 0;

      let cls = "minimap-tile";
      if (isCurrent) {
        cls += " minimap-current";
      } else if (isCenter) {
        cls += " minimap-center";
      } else if (known?.explored) {
        cls += " minimap-explored";
      } else if (known) {
        cls += " minimap-known";
      } else {
        cls += " minimap-unknown";
      }

      const { px, py } = gridToPx(gx, gy);
      tiles.push({ id: key, px, py, cls });
    }
  }

  // Region description based on normalised distance of the current sector.
  let regionLabel = "Unknown";
  let distanceLabel = null;
  let coordLabel = null;
  let centerBearingArcPath = null;
  let centerBearingPoint = null;
  let centerBearingLabel = null;

  if (currentGX !== null && currentGY !== null) {
    const normDist = Math.sqrt((currentGX / xStretch) ** 2 + currentGY ** 2) / gridRadius;
    if (normDist < 0.1) regionLabel = "Galactic Core";
    else if (normDist < 0.25) regionLabel = "Inner Bulge";
    else if (normDist < 0.5) regionLabel = "Inner Disk";
    else if (normDist < 0.75) regionLabel = "Outer Disk";
    else regionLabel = "Galactic Fringe";

    const sectorDist = Math.round(Math.sqrt(currentGX ** 2 + currentGY ** 2) * 10) / 10;
    distanceLabel =
      sectorDist === 0 ? "at galactic center" : `${sectorDist} sector${sectorDist !== 1 ? "s" : ""} from center`;
    coordLabel = `(${currentGX >= 0 ? "+" : ""}${currentGX}, ${currentGY >= 0 ? "+" : ""}${currentGY})`;

    if (sectorDist > 0) {
      const directionAngle = Math.atan2(-currentGY, -currentGX);
      const arcSpan = Math.PI / 4.5;
      centerBearingArcPath = buildArcPath(
        centerPx,
        centerPy,
        centerGuideRadius,
        directionAngle - arcSpan / 2,
        directionAngle + arcSpan / 2,
      );
      centerBearingPoint = polarPoint(centerPx, centerPy, centerGuideRadius, directionAngle);
      centerBearingLabel = describeBearing(-currentGX, -currentGY);
    } else {
      centerBearingLabel = "Center";
    }
  } else if (!hasGridCoords && currentRecord) {
    regionLabel = "Position unknown";
    distanceLabel = "No grid data — re-generate layout to map this sector";
  } else if (!selectedSectorId.value) {
    regionLabel = "No sector loaded";
  }

  return {
    svgSize: SVG_SIZE,
    centerPx,
    centerPy,
    ellipseRx,
    ellipseRy,
    centerGuideRadius,
    centerBearingArcPath,
    centerBearingPoint,
    centerBearingLabel,
    tileSize,
    tileHalf,
    step,
    tiles,
    regionLabel,
    distanceLabel,
    coordLabel,
  };
});

const loadingMessage = computed(() =>
  loadingMode.value === "load" ? "Loading sector systems..." : "Generating sector...",
);
const { overlayProps: sectorExportOverlayProps, exportJson: exportSectorArchive } = useArchiveTransfer({
  context: "sector",
  noun: "Sector",
  title: "Sector Export In Progress",
  barLabel: "Packaging sector archive for transfer",
  statusPrefix: "SEC",
  targetLabel: () => generatedSector.value?.name || generatedSector.value?.sectorId || "Archive target pending",
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const DENSITY_RATES = { core: 0.7, dense: 0.5, average: 0.3, scattered: 0.15, void: 0.03 };
// The morphology function models a full galaxy cross-section across the grid.
// A sector is a tiny slice, so cap its positional influence to local variation only.
// At 0.15 every density tier lands within its labeled occupancy range (±15% of base rate).
const SECTOR_MORPHOLOGY_SCALE = 0.15;
const DENSITY_CLASS_MAP = { void: 1, scattered: 2, average: 3, dense: 4, core: 5 };

function spectralClassToCssClass(spectralClass) {
  const code = String(spectralClass || "G")
    .charAt(0)
    .toUpperCase();
  return (
    {
      O: "spectral-o",
      B: "spectral-b",
      A: "spectral-a",
      F: "spectral-f",
      G: "spectral-g",
      K: "spectral-k",
      M: "spectral-m",
    }[code] || "spectral-g"
  );
}

function starColorForDesignation(designation) {
  const code = String(designation || "G")
    .charAt(0)
    .toUpperCase();

  return (
    {
      O: "#9bb0ff",
      B: "#aabfff",
      A: "#cad7ff",
      F: "#f8f7ff",
      G: "#fff4ea",
      K: "#ffd2a1",
      M: "#ff8c69",
    }[code] || "#8fe9ff"
  );
}

function describeAnomalyType(anomalyType) {
  const normalized = String(anomalyType || "").trim();
  const safe = normalized.toLowerCase();

  if (!safe) {
    return null;
  }

  if (safe.includes("black hole")) {
    return { icon: "●", label: "Black Hole" };
  }
  if (safe.includes("nebula")) {
    return { icon: "☁", label: "Nebula" };
  }
  if (safe.includes("pulsar")) {
    return { icon: "✦", label: "Pulsar" };
  }
  if (safe.includes("neutron")) {
    return { icon: "◆", label: "Neutron Star" };
  }
  if (safe.includes("rift") || safe.includes("singularity")) {
    return { icon: "◉", label: normalized };
  }

  return { icon: "✧", label: normalized };
}

function focusOrbitalTarget(target) {
  focusedOrbitalTarget.value = target;
}

function clearOrbitalTarget() {
  focusedOrbitalTarget.value = null;
}

function densityFromClass(densityClass) {
  return (
    {
      1: "void",
      2: "scattered",
      3: "average",
      4: "dense",
      5: "core",
    }[densityClass] || "average"
  );
}

function buildSectorLabel(sector) {
  const displayName = String(sector?.metadata?.displayName || "").trim();
  if (displayName) {
    return `${displayName} (${sector.sectorId})`;
  }
  return sector?.sectorId || "Unknown sector";
}

function polarPoint(cx, cy, radius, angleRadians) {
  return {
    x: cx + Math.cos(angleRadians) * radius,
    y: cy + Math.sin(angleRadians) * radius,
  };
}

function buildArcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const delta = (((endAngle - startAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const largeArcFlag = delta > Math.PI ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function describeBearing(dx, dyNorth) {
  if (!Number.isFinite(dx) || !Number.isFinite(dyNorth) || (dx === 0 && dyNorth === 0)) {
    return null;
  }
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const angle = (Math.atan2(dx, dyNorth) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  return directions[Math.round(normalized / 45) % directions.length];
}

function inferGridDimensions(sector) {
  const metadata = sector?.metadata || {};
  if (metadata.scope === "subsector") {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  if (Number.isInteger(metadata.gridCols) && Number.isInteger(metadata.gridRows)) {
    const inferredScope = metadata.gridCols === 8 && metadata.gridRows === 10 ? "subsector" : "sector";
    return { scope: inferredScope, cols: metadata.gridCols, rows: metadata.gridRows };
  }
  const notes = String(metadata.notes || "").toLowerCase();
  if (notes.includes("subsector")) {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  return { scope: "sector", cols: 32, rows: 40 };
}

function buildHexGridFromSystems(systems, cols, rows) {
  const occupied = new Map();

  for (const system of systems) {
    const x = Number(system?.hexCoordinates?.x);
    const y = Number(system?.hexCoordinates?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    const safeX = Math.min(cols, Math.max(1, Math.trunc(x)));
    const safeY = Math.min(rows, Math.max(1, Math.trunc(y)));
    const coord = hexCoord(safeX, safeY);
    const generatedStars = Array.isArray(system?.metadata?.generatedSurvey?.stars)
      ? system.metadata.generatedSurvey.stars
      : [];
    const generatedPrimary = generatedStars[0] ?? null;
    const primaryCode = String(generatedPrimary?.spectralType || system?.primaryStar?.spectralClass || "G")
      .trim()
      .toUpperCase();

    const secondaryStars =
      generatedStars.length > 1
        ? generatedStars
            .slice(1)
            .map((star) => String(star?.designation || "").trim())
            .filter(Boolean)
        : Array.isArray(system?.companionStars)
          ? system.companionStars
              .map((star) => String(star?.spectralClass || "").trim())
              .filter(Boolean)
              .map((spectral) => `${spectral}V`)
          : [];

    occupied.set(coord, {
      coord,
      hasSystem: true,
      starType: String(generatedPrimary?.designation || `${primaryCode}V`),
      starClass: spectralClassToCssClass(primaryCode),
      secondaryStars,
      systemId: system.systemId,
    });
  }

  const hexes = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const coord = hexCoord(col, row);
      hexes.push(occupied.get(coord) ?? { coord, hasSystem: false });
    }
  }

  return { hexes, systemCount: occupied.size };
}

function hexCoord(col, row) {
  return String(col).padStart(2, "0") + String(row).padStart(2, "0");
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

function createSectorId(name, coordinates = null) {
  if (props.galaxyId && Number.isFinite(coordinates?.x) && Number.isFinite(coordinates?.y)) {
    return `${props.galaxyId}:${Math.trunc(coordinates.x)},${Math.trunc(coordinates.y)}`;
  }

  const token = sanitizeId(name) || "sector";
  return `sec_${token}_${Date.now()}`.slice(0, 50);
}

function generateRandomSectorBaseName() {
  const mode = preferencesStore.sectorNameMode;
  return mode === "list"
    ? SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)]
    : generatePhonotacticName({ style: mode, syllablesMin: 2, syllablesMax: 3 });
}

function buildGeneratedSectorName(baseName) {
  return String(baseName || "").trim();
}

const currentSubsectorSummary = computed(() => {
  const activeScope = String(scope.value || generatedSector.value?.scope || "")
    .trim()
    .toLowerCase();
  if (activeScope !== "subsector") {
    return "";
  }

  const safeLetter = String(selectedSubsector.value || "A")
    .charAt(0)
    .toUpperCase();
  const safeSubsectorName = String(subsectorName.value || "").trim();
  return safeSubsectorName ? `${safeLetter} - ${safeSubsectorName}` : safeLetter;
});

function getRequestedGridCoordinates() {
  const gridX = Number(route.query.gridX);
  const gridY = Number(route.query.gridY);
  if (!Number.isFinite(gridX) || !Number.isFinite(gridY)) {
    return null;
  }

  return {
    x: Math.trunc(gridX),
    y: Math.trunc(gridY),
  };
}

function initializeAtlasRequestedSector() {
  const requestedGrid = getRequestedGridCoordinates();
  if (!requestedGrid) {
    return false;
  }

  scope.value = currentViewMode.value;
  selectedSectorId.value = "";
  generatedSector.value = null;
  selectedHex.value = null;
  selectedSubsector.value = "A";
  subsectorName.value = "";

  const requestedSectorName = String(route.query.sectorName || "").trim();
  if (requestedSectorName) {
    sectorName.value = requestedSectorName;
  } else if (!String(sectorName.value || "").trim()) {
    randomizeSectorName();
  }

  return true;
}

const SECTOR_NAMES = [
  "Spinward Reaches",
  "Coreward Expanse",
  "Trailing Void",
  "Rimward Depths",
  "Starfall Sector",
  "Irongate Sector",
  "Nebula Crossing",
  "Deep Silence",
  "Ember Fields",
  "Fractured Sky",
  "Veiled Passage",
  "Iron Shore",
];

function getCurrentScopeDimensions() {
  return {
    cols: scope.value === "sector" ? 32 : 8,
    rows: scope.value === "sector" ? 40 : 10,
  };
}

function getSelectedSectorContext() {
  const selectedSectorRecord =
    (selectedSectorId.value ? sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value) : null) ||
    null;
  const selectedMetadata = selectedSectorRecord?.metadata ?? generatedSector.value?.metadata ?? null;
  const selectedGX = Number(selectedMetadata?.gridX);
  const selectedGY = Number(selectedMetadata?.gridY);
  const { cols, rows } = getCurrentScopeDimensions();
  const isGalacticCenterSector =
    scope.value === "sector" &&
    (String(route.query.galacticCenter || "") === "1" ||
      selectedMetadata?.isGalacticCenterSector === true ||
      (Number.isFinite(selectedGX) && Number.isFinite(selectedGY) && selectedGX === 0 && selectedGY === 0));
  const centerCol = Math.ceil(cols / 2);
  const centerRow = Math.ceil(rows / 2);
  const centerCoord = hexCoord(centerCol, centerRow);
  const galaxyAnomalyType = String(galaxyProfile.value?.morphology?.centralAnomaly?.type || "").trim();
  const centerAnomalyType = isGalacticCenterSector ? galaxyAnomalyType || pickCentralAnomalyType() : null;

  return {
    cols,
    rows,
    selectedSectorRecord,
    selectedMetadata,
    isGalacticCenterSector,
    centerCoord,
    centerAnomalyType,
  };
}

function buildSharedSectorMetadata({ hexes, systemCount, isGalacticCenterSector, preserveLastGeneratedAt = false }) {
  const existingMetadata = activeSectorRecord.value?.metadata ?? {};
  const typedHexCount = hexes.filter((h) => h.hasSystem && h.starType).length;
  const nextMetadata = {
    ...existingMetadata,
    lastModified: new Date().toISOString(),
    systemCount,
    explorationStatus: systemCount <= 0 ? "unexplored" : typedHexCount >= systemCount ? "surveyed" : "mapped",
    displayName: buildGeneratedSectorName(sectorName.value || String(existingMetadata?.displayName || "").trim()),
    scope: scope.value,
    gridCols: hexes.length ? (scope.value === "sector" ? 32 : 8) : existingMetadata.gridCols,
    gridRows: hexes.length ? (scope.value === "sector" ? 40 : 10) : existingMetadata.gridRows,
    subsector: scope.value === "subsector" ? selectedSubsector.value : null,
    subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
    isGalacticCenterSector,
    occupancyRealism: occupancyRealism.value,
    occupiedHexes: hexes.filter((h) => h.hasSystem).map((h) => h.coord),
    hexStarTypes: Object.fromEntries(
      hexes
        .filter((h) => h.hasSystem && h.starType)
        .map((h) => [
          h.coord,
          {
            starType: h.starType,
            starClass: h.starClass,
            secondaryStars: h.secondaryStars ?? [],
            anomalyType: h.anomalyType ?? null,
          },
        ]),
    ),
    hexPresenceGenerated: true,
  };

  if (!preserveLastGeneratedAt || !existingMetadata.hexPresenceGeneratedAt) {
    nextMetadata.hexPresenceGeneratedAt = new Date().toISOString();
  }

  return nextMetadata;
}

function buildSectorPreviewState({ sectorId, name, cols, rows, hexes }) {
  return {
    sectorId,
    name,
    scope: scope.value,
    density: density.value,
    occupancyRealism: occupancyRealism.value,
    gridCols: cols,
    gridRows: rows,
    hexes,
    systemCount: hexes.filter((hex) => hex.hasSystem).length,
    emptyCount: cols * rows - hexes.filter((hex) => hex.hasSystem).length,
    presenceOnlyCount: hexes.filter((hex) => hex.presenceOnly).length,
  };
}

async function ensureCurrentSectorRecord({ showToast = false } = {}) {
  if (activeSectorRecord.value) {
    return activeSectorRecord.value;
  }

  if (!props.galaxyId) {
    return null;
  }

  const requestedGrid = getRequestedGridCoordinates();
  if (!requestedGrid) {
    return null;
  }

  const { cols, rows, isGalacticCenterSector } = getSelectedSectorContext();
  const baseName = String(sectorName.value || "").trim() || generateRandomSectorBaseName();
  sectorName.value = baseName;
  const displayName = buildGeneratedSectorName(baseName);
  const nowIso = new Date().toISOString();
  const payload = {
    sectorId: createSectorId(displayName, requestedGrid),
    galaxyId: props.galaxyId,
    coordinates: {
      x: requestedGrid.x,
      y: requestedGrid.y,
    },
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
    metadata: {
      createdAt: nowIso,
      lastModified: nowIso,
      displayName,
      explorationStatus: "unexplored",
      scope: scope.value,
      gridCols: cols,
      gridRows: rows,
      subsector: scope.value === "subsector" ? selectedSubsector.value : null,
      subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
      isGalacticCenterSector,
      occupancyRealism: occupancyRealism.value,
      occupiedHexes: [],
      hexStarTypes: {},
      hexPresenceGenerated: false,
      gridX: requestedGrid.x,
      gridY: requestedGrid.y,
      notes:
        scope.value === "subsector"
          ? `Generated subsector ${selectedSubsector.value}${subsectorName.value ? ` (${String(subsectorName.value).trim()})` : ""}`
          : "Generated sector",
    },
  };

  const persisted = await sectorStore.createSector(payload);
  selectedSectorId.value = persisted.sectorId;
  sectorStore.setCurrentSector(persisted.sectorId);
  await loadPersistedSector(persisted.sectorId, false);

  if (showToast) {
    toastService.success(`Sector name saved for ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
  }

  return persisted;
}

async function generateSectorNameOnly() {
  if (selectedSectorId.value) {
    await persistSectorName({ showToast: true });
    return;
  }

  try {
    const persisted = await ensureCurrentSectorRecord({ showToast: false });
    if (!persisted) {
      toastService.error("No Atlas sector coordinates are available to save this sector name yet.");
      return;
    }
    toastService.success(`Sector name saved for ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
  } catch (err) {
    toastService.error(`Failed to save sector name: ${err.message}`);
  }
}

async function generateSectorPresence() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  let currentSector = activeSectorRecord.value;
  if (!currentSector) {
    try {
      currentSector = await ensureCurrentSectorRecord();
    } catch (err) {
      toastService.error(`Failed to prepare sector for presence generation: ${err.message}`);
      return;
    }
  }

  if (!currentSector) {
    toastService.error("No Atlas sector coordinates are available to generate system presence.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { cols, rows, isGalacticCenterSector, centerCoord, centerAnomalyType } = getSelectedSectorContext();
    const rate = DENSITY_RATES[density.value] ?? 0.3;
    const hexes = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);
        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const occupancyRate = calculateHexOccupancyProbability({
          baseRate: rate,
          col: c,
          row: r,
          cols,
          rows,
          galaxyType: galaxyProfile.value?.type,
          morphology: galaxyProfile.value?.morphology,
          realismScale: occupancyRealism.value,
          morphologyScale: SECTOR_MORPHOLOGY_SCALE,
        });

        if (isCenterHex) {
          hexes.push({
            coord,
            hasSystem: true,
            presenceOnly: false,
            starType: centerAnomalyType,
            starClass: "anomaly-core",
            secondaryStars: [],
            anomalyType: centerAnomalyType,
          });
          continue;
        }

        if (Math.random() < occupancyRate) {
          hexes.push({ coord, hasSystem: true, presenceOnly: true });
        } else {
          hexes.push({ coord, hasSystem: false });
        }
      }
    }

    const nextMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount: hexes.filter((hex) => hex.hasSystem).length,
      isGalacticCenterSector,
    });

    await sectorStore.updateSector(currentSector.sectorId, {
      ...currentSector,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +(rate * 100).toFixed(2),
      metadata: nextMetadata,
    });

    generatedSector.value = buildSectorPreviewState({
      sectorId: currentSector.sectorId,
      name: String(nextMetadata.displayName || currentSector.sectorId),
      cols,
      rows,
      hexes,
    });
    selectedHex.value = null;
    toastService.success(
      `System presence generated — ${nextMetadata.occupiedHexes.length.toLocaleString()} occupied hex${nextMetadata.occupiedHexes.length !== 1 ? "es" : ""} detected.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate system presence: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function generateSystemsFromPresence() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  const currentSector = activeSectorRecord.value;
  const occupiedHexes = Array.isArray(activeSectorMetadata.value?.occupiedHexes)
    ? [...activeSectorMetadata.value.occupiedHexes]
    : [];
  if (!currentSector || !occupiedHexes.length) {
    await generateSector();
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { cols, rows, isGalacticCenterSector, centerCoord, centerAnomalyType } = getSelectedSectorContext();
    const occupiedSet = new Set(occupiedHexes);
    const existingTypes = activeSectorMetadata.value?.hexStarTypes ?? {};
    const hexes = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);
        if (!occupiedSet.has(coord)) {
          hexes.push({ coord, hasSystem: false });
          continue;
        }

        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const saved = existingTypes[coord];
        if (isCenterHex) {
          hexes.push({
            coord,
            hasSystem: true,
            presenceOnly: false,
            starType: centerAnomalyType,
            starClass: "anomaly-core",
            secondaryStars: [],
            anomalyType: centerAnomalyType,
          });
          continue;
        }

        const primary = generatePrimaryStar();
        hexes.push({
          coord,
          hasSystem: true,
          presenceOnly: false,
          starType: String(saved?.starType || primary.designation),
          starClass: String(
            saved?.starClass || spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass),
          ),
          secondaryStars: Array.isArray(saved?.secondaryStars) ? [...saved.secondaryStars] : [],
          anomalyType: saved?.anomalyType ?? null,
        });
      }
    }

    const nextMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount: occupiedHexes.length,
      isGalacticCenterSector,
      preserveLastGeneratedAt: true,
    });

    await sectorStore.updateSector(currentSector.sectorId, {
      ...currentSector,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
      metadata: nextMetadata,
    });

    generatedSector.value = buildSectorPreviewState({
      sectorId: currentSector.sectorId,
      name: String(nextMetadata.displayName || currentSector.sectorId),
      cols,
      rows,
      hexes,
    });
    selectedHex.value = null;
    toastService.success(
      `Systems generated — ${occupiedHexes.length.toLocaleString()} occupied hex${occupiedHexes.length !== 1 ? "es" : ""} converted into full stellar systems.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate systems: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function runSurveyAction() {
  if (effectiveGenerationMode.value === "name") {
    await generateSectorNameOnly();
    return;
  }
  if (effectiveGenerationMode.value === "name-presence") {
    await generateSectorPresence();
    return;
  }
  if (effectiveGenerationMode.value === "presence") {
    await generateSectorPresence();
    return;
  }
  if (sectorPresenceCount.value > 0 && sectorTypedHexCount.value < sectorPresenceCount.value) {
    await generateSystemsFromPresence();
    return;
  }

  await generateSector();
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function loadSelectedSector() {
  if (!selectedSectorId.value) {
    return;
  }
  generationMode.value = "";
  await loadPersistedSector(selectedSectorId.value, true);
}

async function saveCurrentSector({ showToast = false } = {}) {
  if (!props.galaxyId || !generatedSector.value?.hexes?.length) {
    return;
  }

  const existingSectorId = selectedSectorId.value || generatedSector.value?.sectorId || "";
  const existingSector = existingSectorId
    ? (sectorStore.sectors.find((entry) => entry.sectorId === existingSectorId) ?? null)
    : null;
  const requestedGrid = getRequestedGridCoordinates();
  const systemCount = generatedSector.value.hexes.filter((hex) => hex.hasSystem).length;
  const { isGalacticCenterSector } = getSelectedSectorContext();
  const nextMetadata = buildSharedSectorMetadata({
    hexes: generatedSector.value.hexes,
    systemCount,
    isGalacticCenterSector,
    preserveLastGeneratedAt: true,
  });

  const payload = {
    ...(existingSector ?? {}),
    sectorId: existingSectorId || createSectorId(buildGeneratedSectorName(sectorName.value || "sector"), requestedGrid),
    galaxyId: props.galaxyId,
    coordinates: {
      x: Number(existingSector?.coordinates?.x ?? existingSector?.metadata?.gridX ?? requestedGrid?.x ?? 0),
      y: Number(existingSector?.coordinates?.y ?? existingSector?.metadata?.gridY ?? requestedGrid?.y ?? 0),
    },
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: Number(existingSector?.densityVariation ?? 0),
    metadata: {
      ...(existingSector?.metadata ?? {}),
      ...(requestedGrid ? { gridX: requestedGrid.x, gridY: requestedGrid.y } : {}),
      ...nextMetadata,
      createdAt: existingSector?.metadata?.createdAt ?? new Date().toISOString(),
    },
  };

  try {
    const persisted = existingSector
      ? await sectorStore.updateSector(existingSector.sectorId, payload)
      : await sectorStore.createSector(payload);

    selectedSectorId.value = persisted.sectorId;
    sectorStore.setCurrentSector(persisted.sectorId);
    generatedSector.value = {
      ...generatedSector.value,
      sectorId: persisted.sectorId,
      name: String(persisted?.metadata?.displayName || generatedSector.value.name),
      density: density.value,
      occupancyRealism: occupancyRealism.value,
      systemCount,
      emptyCount: generatedSector.value.gridCols * generatedSector.value.gridRows - systemCount,
    };

    if (showToast) {
      toastService.success(`Saved sector ${String(persisted?.metadata?.displayName || persisted.sectorId)}.`);
    }
  } catch (err) {
    toastService.error(`Failed to save sector: ${err.message}`);
  }
}

async function loadPersistedSector(sectorId, showToast = false) {
  if (!props.galaxyId || !sectorId) {
    return;
  }

  selectedSectorId.value = sectorId;

  loadingMode.value = "load";
  isLoading.value = true;

  try {
    await systemStore.loadSystems(props.galaxyId, sectorId);
    let sector = null;

    try {
      sector = await sectorApi.getSector(sectorId);
    } catch {
      sector = sectorStore.sectors.find((entry) => entry.sectorId === sectorId) ?? null;
    }

    if (!sector) {
      toastService.error("Selected sector could not be found.");
      return;
    }

    const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === sector.sectorId);
    if (sectorIndex >= 0) {
      sectorStore.sectors[sectorIndex] = sector;
    } else {
      sectorStore.sectors.unshift(sector);
    }

    const { scope: loadedScope, cols, rows } = inferGridDimensions(sector);
    const { hexes: baseHexes, systemCount: surveyedCount } = buildHexGridFromSystems(systemStore.systems, cols, rows);

    // Merge in any presence-only markers from a previous "Generate All Sectors" pass.
    // These hexes have a stellar object recorded but no full system record yet.
    // If hexStarTypes has a starType for the coord the hex has been surveyed to star-type level
    // (★); otherwise it is a raw presence marker only (◦).
    const hexStarTypes = sector?.metadata?.hexStarTypes ?? {};
    const presenceCoords = new Set([
      ...(Array.isArray(sector?.metadata?.occupiedHexes) ? sector.metadata.occupiedHexes : []),
      ...Object.keys(hexStarTypes),
    ]);
    const hexes = baseHexes.map((hex) => {
      const saved = hexStarTypes[hex.coord];
      if (!saved && !presenceCoords.has(hex.coord)) {
        return hex;
      }

      const starType = saved?.starType ?? hex.starType;
      return {
        ...hex,
        hasSystem: true,
        // presenceOnly only remains true when there is no star type yet (raw presence marker).
        // Once a star type is known the hex graduates to a full ★ display.
        presenceOnly: !starType,
        starType,
        starClass: saved?.starClass || hex.starClass || spectralClassToCssClass(starType),
        secondaryStars: saved?.secondaryStars ?? hex.secondaryStars ?? [],
        anomalyType: saved?.anomalyType ?? hex.anomalyType ?? null,
      };
    });
    const systemCount = hexes.filter((h) => h.hasSystem).length;

    scope.value = loadedScope === "subsector" ? "subsector" : currentViewMode.value;
    density.value = densityFromClass(sector.densityClass);
    occupancyRealism.value = Math.min(2, Math.max(0, Number(sector?.metadata?.occupancyRealism ?? 1)));
    selectedSubsector.value =
      String(sector?.metadata?.subsector || "A")
        .charAt(0)
        .toUpperCase() || "A";
    const loadedDisplayName = String(sector?.metadata?.displayName || sectorId);
    const metadataSubsectorName = String(sector?.metadata?.subsectorName || "").trim();
    if (loadedScope === "subsector") {
      if (metadataSubsectorName) {
        subsectorName.value = metadataSubsectorName;
      } else {
        const legacyNameMatch = loadedDisplayName.match(/\/\s*[A-P](?:\s*[-:]\s*(.+))?$/i);
        subsectorName.value = String(legacyNameMatch?.[1] || "").trim();
      }
      sectorName.value = loadedDisplayName.replace(/\s*\/\s*[A-P](?:\s*[-:].*)?$/i, "").trim() || loadedDisplayName;
    } else {
      subsectorName.value = "";
      sectorName.value = loadedDisplayName;
    }
    selectedHex.value = null;

    generatedSector.value = {
      sectorId: sector.sectorId,
      name: sectorName.value,
      scope: loadedScope,
      density: density.value,
      occupancyRealism: occupancyRealism.value,
      gridCols: cols,
      gridRows: rows,
      hexes,
      systemCount,
      emptyCount: cols * rows - systemCount,
    };

    sectorStore.setCurrentSector(sectorId);
    if (showToast) {
      toastService.success(`Loaded sector ${sectorName.value}. Select an occupied hex to continue.`);
    }
  } catch (err) {
    toastService.error(`Failed to load sector systems: ${err.message}`);
  } finally {
    isLoading.value = false;
    loadingMode.value = "generate";
  }
}

async function persistSectorName({ showToast = false } = {}) {
  if (!props.galaxyId) {
    return;
  }

  if (!selectedSectorId.value) {
    try {
      const persisted = await ensureCurrentSectorRecord({ showToast });
      if (!persisted && showToast) {
        toastService.error("No Atlas sector coordinates are available to save this sector name yet.");
      }
    } catch (err) {
      toastService.error(`Failed to save sector name: ${err.message}`);
    }
    return;
  }

  const sector = sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value);
  if (!sector) {
    return;
  }

  const baseName = String(sectorName.value || "").trim();
  if (!baseName) {
    if (showToast) {
      toastService.error("Sector name cannot be empty.");
    }
    return;
  }

  const nextDisplayName = buildGeneratedSectorName(baseName);
  const nextSubsectorName = scope.value === "subsector" ? String(subsectorName.value || "").trim() : null;
  const persistedDisplayName = String(sector?.metadata?.displayName || sector.sectorId).trim();
  const persistedSubsectorName = String(sector?.metadata?.subsectorName || "").trim();

  const isSameDisplayName = nextDisplayName === persistedDisplayName;
  const isSameSubsectorName = scope.value !== "subsector" || nextSubsectorName === persistedSubsectorName;
  if (isSameDisplayName && isSameSubsectorName) {
    return;
  }

  const updatePayload = {
    ...sector,
    metadata: {
      ...(sector.metadata ?? {}),
      displayName: nextDisplayName,
      subsectorName: nextSubsectorName,
      lastModified: new Date().toISOString(),
    },
  };

  try {
    const updatedSector = await sectorStore.updateSector(sector.sectorId, updatePayload);

    if (generatedSector.value?.sectorId === updatedSector.sectorId) {
      generatedSector.value = {
        ...generatedSector.value,
        name: nextDisplayName,
      };
    }

    if (scope.value === "subsector") {
      sectorName.value = nextDisplayName.replace(/\s*\/\s*[A-P](?:\s*[-:].*)?$/i, "").trim() || baseName;
      subsectorName.value = nextSubsectorName || "";
    } else {
      sectorName.value = nextDisplayName;
    }

    if (showToast) {
      toastService.success("Sector name saved.");
    }
  } catch (err) {
    toastService.error(`Failed to save sector name: ${err.message}`);
  }
}

async function initializeSectorSelectionSafely(galaxyId) {
  try {
    await initializeSectorSelection(galaxyId);
  } catch (err) {
    generatedSector.value = null;
    selectedHex.value = null;
    isLoading.value = false;
    loadingMode.value = "generate";
    const message = err instanceof Error ? err.message : String(err || "Unknown error");
    toastService.error(`Failed to initialize sector survey: ${message}`);
  }
}

async function initializeSectorSelection(galaxyId) {
  generatedSector.value = null;
  selectedHex.value = null;
  selectedSectorId.value = "";
  generationMode.value = "";
  const requestedViewport = getRequestedSurveyViewport(route);

  if (!galaxyId) {
    galaxyProfile.value = null;
    sectorStore.clearSectors();
    systemStore.clearSystems();
    return;
  }

  try {
    galaxyProfile.value = await galaxyApi.getGalaxy(galaxyId);
  } catch {
    galaxyProfile.value = null;
  }

  if (!galaxyProfile.value) {
    sectorStore.clearSectors();
    systemStore.clearSystems();
    return;
  }

  try {
    await sectorStore.loadSectors(galaxyId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err || "Unknown error");
    toastService.error(`Failed to load sectors: ${message}`);
    return;
  }

  if (sectorStore.error) {
    toastService.error(`Failed to load sectors: ${sectorStore.error}`);
    return;
  }

  const currentSector = sectorStore.sectors.find((sector) => sector.sectorId === sectorStore.currentSectorId);
  const fallbackSector = sectorStore.sectors[0];
  const requestedSectorId = String(route.query.sectorId || "").trim();
  const requestedGrid = getRequestedGridCoordinates();
  const requestedSector = requestedSectorId
    ? sectorStore.sectors.find((sector) => sector.sectorId === requestedSectorId)
    : null;

  if (!requestedSector && requestedGrid) {
    const requestedByGrid = sectorStore.sectors.find(
      (sector) =>
        Number(sector?.metadata?.gridX) === requestedGrid.x && Number(sector?.metadata?.gridY) === requestedGrid.y,
    );
    if (requestedByGrid) {
      selectedSectorId.value = requestedByGrid.sectorId;
      await loadPersistedSector(requestedByGrid.sectorId, false);
    } else {
      initializeAtlasRequestedSector();
    }
    return;
  }

  const initialSector = requestedSector ?? currentSector ?? fallbackSector;

  if (initialSector) {
    selectedSectorId.value = initialSector.sectorId;
    await loadPersistedSector(initialSector.sectorId, false);
    if (requestedViewport.scope) {
      scope.value = requestedViewport.scope;
    }
    if (requestedViewport.subsector) {
      selectedSubsector.value = requestedViewport.subsector;
    }
    if (requestedViewport.scope === "subsector" && requestedViewport.subsectorName) {
      subsectorName.value = requestedViewport.subsectorName;
    }
  } else {
    initializeAtlasRequestedSector();
  }
}

async function mapGalaxySectors() {
  if (!props.galaxyId || isMappingSectors.value) {
    return;
  }

  if (!galaxyProfile.value) {
    toastService.error("Galaxy details are still loading. Please try again.");
    return;
  }

  isMappingSectors.value = true;
  try {
    const sectors = generateGalaxySectorLayout(galaxyProfile.value, { scale: "true" });
    if (!sectors.length) {
      toastService.warning("No sectors were generated for this galaxy layout.");
      return;
    }

    const chunkSize = 1000;
    for (let i = 0; i < sectors.length; i += chunkSize) {
      await sectorApi.createSectorsBatch(sectors.slice(i, i + chunkSize));
    }

    await sectorStore.loadSectors(props.galaxyId);
    if (sectorStore.sectors.length > 0) {
      const initialSectorId = sectorStore.sectors[0].sectorId;
      selectedSectorId.value = initialSectorId;
      await loadPersistedSector(initialSectorId, false);
    }

    toastService.success(`Mapped ${sectors.length.toLocaleString()} sectors for this galaxy.`);
  } catch (err) {
    toastService.error(`Failed to map sectors: ${err.message}`);
  } finally {
    isMappingSectors.value = false;
  }
}

function randomizeSectorName() {
  const randomName = generateRandomSectorBaseName();

  if (scope.value === "subsector") {
    subsectorName.value = randomName;
    return;
  }

  sectorName.value = randomName;
}

function randomizeSubsectorName() {
  subsectorName.value = generateRandomSectorBaseName();
}

async function generateSector() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;
  const existingSectorId = generatedSector.value?.sectorId ?? null;

  try {
    // Use setTimeout to show loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cols = scope.value === "sector" ? 32 : 8;
    const rows = scope.value === "sector" ? 40 : 10;
    const rate = DENSITY_RATES[density.value] ?? 0.3;
    const selectedSectorRecord =
      (selectedSectorId.value
        ? sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value)
        : null) || null;
    const selectedMetadata = selectedSectorRecord?.metadata ?? generatedSector.value?.metadata ?? null;
    const selectedGX = Number(selectedMetadata?.gridX);
    const selectedGY = Number(selectedMetadata?.gridY);
    const isGalacticCenterSector =
      scope.value === "sector" &&
      (String(route.query.galacticCenter || "") === "1" ||
        selectedMetadata?.isGalacticCenterSector === true ||
        (Number.isFinite(selectedGX) && Number.isFinite(selectedGY) && selectedGX === 0 && selectedGY === 0));
    const centerCol = Math.ceil(cols / 2);
    const centerRow = Math.ceil(rows / 2);
    const centerCoord = hexCoord(centerCol, centerRow);
    const galaxyAnomalyType = String(galaxyProfile.value?.morphology?.centralAnomaly?.type || "").trim();
    const centerAnomalyType = isGalacticCenterSector ? galaxyAnomalyType || pickCentralAnomalyType() : null;

    const hexes = [];
    let systemCount = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(c, r);

        const isCenterHex = isGalacticCenterSector && coord === centerCoord;
        const occupancyRate = calculateHexOccupancyProbability({
          baseRate: rate,
          col: c,
          row: r,
          cols,
          rows,
          galaxyType: galaxyProfile.value?.type,
          morphology: galaxyProfile.value?.morphology,
          realismScale: occupancyRealism.value,
          morphologyScale: SECTOR_MORPHOLOGY_SCALE,
        });
        const hasSystem = isCenterHex || Math.random() < occupancyRate;
        if (hasSystem) {
          const primary = isCenterHex ? null : generatePrimaryStar();
          hexes.push({
            coord,
            hasSystem: true,
            starType: isCenterHex ? centerAnomalyType : primary.designation,
            starClass: isCenterHex
              ? "anomaly-core"
              : spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass),
            secondaryStars: [],
            anomalyType: isCenterHex ? centerAnomalyType : null,
          });
          systemCount++;
        } else {
          hexes.push({ coord, hasSystem: false });
        }
      }
    }

    const fallbackName = generateRandomSectorBaseName();
    const baseName = sectorName.value || fallbackName;
    const generatedName = buildGeneratedSectorName(baseName);

    const sharedMetadata = {
      lastModified: new Date().toISOString(),
      systemCount,
      displayName: generatedName,
      scope: scope.value,
      gridCols: cols,
      gridRows: rows,
      subsector: scope.value === "subsector" ? selectedSubsector.value : null,
      subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
      isGalacticCenterSector,
      occupancyRealism: occupancyRealism.value,
      occupiedHexes: hexes.filter((h) => h.hasSystem).map((h) => h.coord),
      hexStarTypes: Object.fromEntries(
        hexes
          .filter((h) => h.hasSystem)
          .map((h) => [
            h.coord,
            {
              starType: h.starType,
              starClass: h.starClass,
              secondaryStars: h.secondaryStars ?? [],
              anomalyType: h.anomalyType ?? null,
            },
          ]),
      ),
    };

    let finalSectorId;
    if (existingSectorId) {
      // Update the existing sector — do not create a new record.
      // Must spread the full existing sector first because the backend requires sectorId,
      // galaxyId and coordinates in the PUT body and rejects partial payloads.
      const currentSectorRecord = sectorStore.sectors.find((s) => s.sectorId === existingSectorId) ?? {};
      await sectorStore.updateSector(existingSectorId, {
        ...currentSectorRecord,
        densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
        densityVariation: +(rate * 100).toFixed(2),
        metadata: {
          ...(currentSectorRecord.metadata ?? {}),
          ...sharedMetadata,
        },
      });
      finalSectorId = existingSectorId;
    } else {
      const requestedGrid = getRequestedGridCoordinates();
      const sectorPayload = {
        sectorId: createSectorId(generatedName, requestedGrid),
        galaxyId: props.galaxyId,
        coordinates: {
          x: requestedGrid?.x ?? Math.floor(Math.random() * 1001),
          y: requestedGrid?.y ?? Math.floor(Math.random() * 1001),
        },
        densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
        densityVariation: +(rate * 100).toFixed(2),
        metadata: {
          createdAt: new Date().toISOString(),
          explorationStatus: "unexplored",
          gridX: requestedGrid?.x ?? null,
          gridY: requestedGrid?.y ?? null,
          notes:
            scope.value === "subsector"
              ? `Generated subsector ${selectedSubsector.value}${subsectorName.value ? ` (${String(subsectorName.value).trim()})` : ""}`
              : "Generated sector",
          ...sharedMetadata,
        },
      };
      const persistedSector = await sectorStore.createSector(sectorPayload);
      finalSectorId = persistedSector.sectorId;
      selectedSectorId.value = finalSectorId;
    }

    generatedSector.value = {
      sectorId: finalSectorId,
      name: generatedName,
      scope: scope.value,
      density: density.value,
      occupancyRealism: occupancyRealism.value,
      gridCols: cols,
      gridRows: rows,
      hexes,
      systemCount,
      emptyCount: cols * rows - systemCount,
      presenceOnlyCount: hexes.filter((h) => h.presenceOnly).length,
    };
    selectedHex.value = null;

    if (existingSectorId) {
      toastService.success(
        `Sector regenerated — ${systemCount.toLocaleString()} stellar object${systemCount !== 1 ? "s" : ""} rolled.`,
      );
    } else {
      toastService.success(`Sector "${generatedName}" generated and saved.`);
    }
  } catch (err) {
    toastService.error(`Failed to generate/save sector: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function selectHex(hex) {
  selectedHex.value = hex.coord === selectedHex.value ? null : hex.coord;
}

function stopSectorNameSpeech() {
  if (!supportsSpeechSynthesis) return;
  window.speechSynthesis.cancel();
  isSpeakingSectorName.value = false;
  isSpeakingSubsectorName.value = false;
}

function speakName(text, target) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.min(1.5, Math.max(0.5, Number(preferencesStore.ttsRate) || 1));
  utterance.pitch = Math.min(1.5, Math.max(0.5, Number(preferencesStore.ttsPitch) || 1));
  const preferredVoiceURI = String(preferencesStore.ttsVoiceURI || "").trim();
  if (preferredVoiceURI) {
    const voice = window.speechSynthesis.getVoices().find((entry) => entry.voiceURI === preferredVoiceURI);
    if (voice) {
      utterance.voice = voice;
    }
  }
  utterance.onend = () => {
    isSpeakingSectorName.value = false;
    isSpeakingSubsectorName.value = false;
  };
  utterance.onerror = () => {
    isSpeakingSectorName.value = false;
    isSpeakingSubsectorName.value = false;
    toastService.error(`Unable to play ${target} name audio.`);
  };

  isSpeakingSectorName.value = target === "sector";
  isSpeakingSubsectorName.value = target === "subsector";
  window.speechSynthesis.speak(utterance);
}

function toggleSectorNameSpeech() {
  if (!supportsSpeechSynthesis) {
    toastService.error("Text to speech is not supported in this browser.");
    return;
  }

  if (isSpeakingSectorName.value) {
    stopSectorNameSpeech();
    return;
  }

  const sectorDisplayName = String(sectorName.value || generatedSector.value?.name || "").trim();
  if (!sectorDisplayName) {
    toastService.error("No sector name is available to speak yet.");
    return;
  }

  speakName(sectorDisplayName, "sector");
}

function toggleSubsectorNameSpeech() {
  if (!supportsSpeechSynthesis) {
    toastService.error("Text to speech is not supported in this browser.");
    return;
  }

  if (isSpeakingSubsectorName.value) {
    stopSectorNameSpeech();
    return;
  }

  const currentSubsectorName = String(subsectorName.value || "").trim();
  if (!currentSubsectorName) {
    toastService.error("No subsector name is available to speak yet.");
    return;
  }

  speakName(currentSubsectorName, "subsector");
}

function regenerateSector() {
  runSurveyAction();
}

async function generateSubsectorStellarSurvey() {
  const previousMode = generationMode.value;
  generationMode.value = "name-systems";
  try {
    await runSurveyAction();
  } finally {
    generationMode.value = previousMode;
  }
}

async function exportSector() {
  if (!generatedSector.value) return;

  try {
    await exportSectorArchive({
      data: generatedSector,
      filename: (sector) => `${sector.name.replace(/\s+/g, "-")}-Sector.json`,
      serializeMessage: "Serializing sector manifest...",
      encodeMessage: "Encoding sector archive for transfer...",
      readyMessage: "Sector archive staged for local transfer.",
      serializingProgress: 22,
      encodingProgress: 68,
    });
  } catch (err) {
    toastService.error(`Failed to export sector: ${err.message}`);
  }
}

function proceedToStarSystem() {
  if (!generatedSector.value?.sectorId) {
    toastService.error("Sector has not been saved yet. Please generate sector again.");
    return;
  }

  const selectedAnomalyType = String(
    selectedHexData.value?.anomalyType || selectedHexData.value?.starType || "",
  ).trim();
  const galaxyAnomaly = galaxyProfile.value?.morphology?.centralAnomaly;
  const galaxyAnomalyType = String(galaxyAnomaly?.type || "").trim();
  const anomalyTypeMatchesGalaxy =
    selectedAnomalyType && galaxyAnomalyType && selectedAnomalyType.toLowerCase() === galaxyAnomalyType.toLowerCase();

  const query = {
    hex: selectedHex.value,
    star: selectedHexData.value?.starType,
    anomaly: selectedAnomalyType || undefined,
    anomalyMass: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.massSolarMasses : undefined,
    anomalyActivity: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.activityIndex : undefined,
    returnTo: serializeReturnRoute({
      name: currentSurveyRouteName.value,
      params: { galaxyId: props.galaxyId ?? "000" },
      query: {
        ...route.query,
        ...(generatedSector.value?.sectorId ? { sectorId: generatedSector.value.sectorId } : {}),
        viewScope: scope.value,
        subsector: scope.value === "subsector" ? selectedSubsector.value : undefined,
        subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() || undefined : undefined,
      },
    }),
  };

  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: props.galaxyId ?? "000", sectorId: generatedSector.value.sectorId },
    query,
  });
}
</script>

<style scoped>
.sector-survey {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  overflow: hidden;
}

.survey-content {
  flex: 1;
  padding: 1.25rem;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.survey-workspace {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) minmax(0, 3fr);
  gap: 1.25rem;
  align-items: stretch;
  min-height: 0;
  height: 100%;
}

.survey-workspace--subsector {
  grid-template-columns: minmax(13rem, 0.82fr) minmax(0, 3fr) minmax(15rem, 1.02fr);
}

.sector-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 7.5rem);
  max-height: calc(100vh - 7.5rem);
  overflow: hidden;
  position: sticky;
  top: 0.9rem;
  align-self: start;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 0.9rem;
  height: calc(100vh - 7.5rem);
  max-height: calc(100vh - 7.5rem);
  overflow-y: auto;
  padding-right: 0.2rem;
}

.subsector-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 0.9rem;
  height: calc(100vh - 7.5rem);
  max-height: calc(100vh - 7.5rem);
  min-width: 0;
  overflow-y: auto;
}

.subsector-sidebar-card {
  min-width: 0;
}

.subsector-sidebar-card--naming {
  gap: 0.75rem;
}

.subsector-sidebar-card--actions {
  gap: 0.8rem;
}

.subsector-sidebar-copy {
  color: #a8b8c8;
  font-size: 0.92rem;
  line-height: 1.45;
}

.subsector-sidebar-btn {
  width: 100%;
  justify-content: center;
}

.subsector-sidebar-card--orbital {
  margin-top: auto;
}

.control-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.1rem;
  background: #1a1a1a;
  border-radius: 0.75rem;
  border: 2px solid #00d9ff;
}

.control-card--survey {
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.sector-summary-card {
  background: #1a1a2e;
}

.control-inline-row {
  display: grid;
  align-items: center;
  gap: 0.5rem;
}

.control-inline-row--load {
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.control-inline-row--generation {
  grid-template-columns: minmax(0, 1fr) auto;
}

.control-inline-select {
  min-width: 0;
}

.sector-load-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}

.view-toggle {
  display: flex;
  gap: 0.35rem;
  width: 100%;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(8, 24, 38, 0.9);
  border: 1px solid rgba(0, 217, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.view-toggle-btn {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  color: #9ad9e4;
  border: none;
  box-shadow: none;
}

.view-toggle-btn.active {
  background: linear-gradient(180deg, #aaf7ff 0%, #39dfff 100%);
  color: #041018;
  box-shadow:
    0 0 0 1px rgba(170, 247, 255, 0.18),
    0 6px 16px rgba(0, 217, 255, 0.2);
}

.view-toggle-btn:not(.active):hover {
  background: rgba(0, 217, 255, 0.08);
  color: #d7fbff;
}

.control-help {
  font-size: 0.78rem;
  line-height: 1.4;
  color: #8fb3c9;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.control-action {
  justify-content: flex-end;
}

.control-inline-row--load .btn {
  white-space: nowrap;
}

/* Galaxy Position Minimap */
.galaxy-position-group {
  border-top: 1px solid rgba(0 217 255 / 0.15);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.galaxy-minimap-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.galaxy-minimap-svg {
  border-radius: 50%;
  background: #07071a;
  border: 1px solid rgba(0 217 255 / 0.2);
  display: block;
  overflow: visible;
}

/* SVG element classes (prefixed to avoid global conflicts) */
.galaxy-boundary {
  fill: none;
  stroke: rgba(0 217 255 / 0.18);
  stroke-width: 1;
}

.galaxy-crosshair {
  stroke: rgba(255 200 80 / 0.55);
  stroke-width: 1;
}

.galaxy-center-guide {
  fill: none;
  stroke: rgba(255 255 255 / 0.12);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.galaxy-center-bearing {
  fill: none;
  stroke: rgba(255 200 80 / 0.9);
  stroke-width: 3;
  stroke-linecap: round;
}

.galaxy-center-bearing-dot {
  fill: rgba(255 200 80 / 0.95);
  filter: drop-shadow(0 0 3px rgba(255, 200, 80, 0.65));
}

.minimap-unknown {
  fill: rgba(80 90 120 / 0.4);
}

.minimap-known {
  fill: rgba(0 140 200 / 0.5);
}

.minimap-explored {
  fill: rgba(0 200 160 / 0.65);
}

.minimap-center {
  fill: rgba(255 200 60 / 0.7);
}

.minimap-current {
  fill: #00d9ff;
  filter: drop-shadow(0 0 3px #00d9ff);
}

.galaxy-position-legend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  text-align: center;
}

.position-region {
  font-size: 0.85rem;
  font-weight: 700;
  color: #8fe9ff;
}

.position-dist {
  font-size: 0.78rem;
  color: #7a94b8;
}

.position-coord {
  font-size: 0.75rem;
  color: rgba(0 217 255 / 0.55);
  font-family: monospace;
}

.position-bearing {
  font-size: 0.75rem;
  color: rgba(255 200 80 / 0.86);
  font-weight: 600;
}

.orbital-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.orbital-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.orbital-preview-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 217, 255, 0.18);
  background: rgba(0, 217, 255, 0.08);
}

.orbital-preview-meta-pill--accent {
  border-color: rgba(125, 211, 252, 0.35);
  background: rgba(125, 211, 252, 0.12);
}

.orbital-preview-meta-pill--ok {
  border-color: rgba(134, 239, 172, 0.32);
  background: rgba(134, 239, 172, 0.11);
}

.orbital-preview-meta-pill--anomaly {
  border-color: rgba(240, 171, 252, 0.34);
  background: rgba(240, 171, 252, 0.12);
}

.orbital-preview-meta-pill--muted {
  border-color: rgba(143, 179, 201, 0.24);
  background: rgba(143, 179, 201, 0.08);
}

.orbital-preview-meta-pill--focus {
  border-color: rgba(250, 204, 21, 0.34);
  background: rgba(250, 204, 21, 0.12);
  box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.18);
}

.orbital-preview-meta-label {
  color: rgba(183, 247, 255, 0.68);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.orbital-preview-meta-value {
  color: #e7fbff;
  font-size: 0.78rem;
  font-weight: 700;
}

.orbital-preview--placeholder {
  min-height: 18rem;
  justify-content: center;
  padding: 1rem 0.6rem;
  border: 1px dashed rgba(0, 217, 255, 0.24);
  border-radius: 0.6rem;
  background: rgba(9, 18, 29, 0.52);
}

.orbital-preview-svg {
  width: min(100%, 15rem);
  height: auto;
  display: block;
}

.orbital-preview--anomaly .orbital-preview-svg {
  filter: saturate(1.08);
}

.orbital-preview-ring {
  fill: none;
  stroke: rgba(133, 192, 255, 0.34);
  stroke-width: 1.15;
  stroke-dasharray: 4 4;
}

.orbital-preview-ring--compact {
  stroke: rgba(155, 176, 255, 0.42);
}

.orbital-preview-ring--anomaly {
  stroke: rgba(240, 171, 252, 0.5);
  stroke-dasharray: 2.5 3.5;
}

.orbital-preview-ring--black-hole {
  stroke: rgba(192, 132, 252, 0.62);
  stroke-dasharray: 1.5 2.25;
}

.orbital-preview-ring--nebula {
  stroke: rgba(134, 239, 172, 0.42);
  stroke-dasharray: 6 5;
}

.orbital-preview-ring:focus,
.orbital-preview-body:focus {
  outline: none;
}

.orbital-preview-ring:hover,
.orbital-preview-ring:focus {
  stroke: rgba(250, 204, 21, 0.78);
  stroke-width: 1.5;
}

.orbital-preview-star {
  filter: drop-shadow(0 0 8px rgba(255, 237, 160, 0.45));
}

.orbital-preview--anomaly .orbital-preview-star {
  filter: drop-shadow(0 0 10px rgba(240, 171, 252, 0.58));
}

.orbital-preview-body {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.18));
}

.orbital-preview-body--energized {
  filter: drop-shadow(0 0 7px rgba(240, 171, 252, 0.5));
}

.orbital-preview-body--compressed {
  filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.58));
}

.orbital-preview-body--diffuse {
  opacity: 0.8;
  filter: drop-shadow(0 0 6px rgba(134, 239, 172, 0.4));
}

.orbital-preview-body:hover,
.orbital-preview-body:focus {
  filter: drop-shadow(0 0 9px rgba(250, 204, 21, 0.52));
  stroke: rgba(255, 255, 255, 0.65);
  stroke-width: 0.9;
}

.orbital-preview-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
  text-align: center;
}

.orbital-preview-title {
  color: #e7fbff;
  font-weight: 700;
}

.orbital-preview-detail {
  color: #8fb3c9;
  font-size: 0.82rem;
  line-height: 1.4;
}

.orbital-preview-empty-icon {
  color: rgba(0, 217, 255, 0.42);
  font-size: 3.4rem;
  line-height: 1;
}

.sector-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.sector-summary--panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0;
}

.sector-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sector-summary-row--secondary {
  justify-content: space-between;
  align-items: flex-start;
}

.sector-summary-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sector-summary-group--left {
  justify-content: flex-start;
}

.sector-summary-group--right {
  justify-content: flex-end;
  margin-left: auto;
}

.summary-pill {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(0 217 255 / 0.24);
  border-radius: 999px;
  background: rgba(0 217 255 / 0.08);
  color: #b7f7ff;
  font-size: 0.8rem;
  font-family: "Circular Std", Circular, "Lineto Circular", "Segoe UI", sans-serif;
}

.summary-pill--title {
  min-width: 0;
  width: 100%;
  flex: 1 1 100%;
}

.summary-pill-label {
  color: rgba(183, 247, 255, 0.7);
  font-weight: 600;
  white-space: nowrap;
}

.summary-pill-value {
  color: #e7fbff;
  font-weight: 700;
}

.stellar-inline-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(0, 217, 255, 0.18);
  border-radius: 0.5rem;
  background: rgba(18, 18, 46, 0.88);
}

.stellar-inline-card--placeholder {
  border-style: dashed;
  border-color: rgba(0, 217, 255, 0.35);
}

.stellar-inline-copy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.75rem;
  min-width: 0;
  flex: 1 1 auto;
}

.stellar-inline-title {
  color: #00d9ff;
  font-weight: 700;
}

.stellar-inline-detail {
  color: #b7d8ea;
  font-family: monospace;
  font-size: 0.88rem;
}

/* Subsector Selection Grid */
.subsector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.subsector-grid--sidebar {
  margin-top: 0;
}

.subsector-btn {
  padding: 0.75rem;
  background: #2a2a3e;
  border: 2px solid #444;
  color: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.subsector-btn:hover {
  background: #3a3a4e;
  border-color: #00ffff;
  transform: translateY(-2px);
}

.subsector-btn.active {
  background: #00ffff;
  border-color: #00ffff;
  color: #000;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.subsector-grid--sidebar .subsector-btn {
  position: relative;
}

.subsector-grid--sidebar .subsector-btn.active {
  transform: translateY(-2px) scale(1.03);
  border-color: #b9ffff;
  background: linear-gradient(180deg, #9ffcff 0%, #00ffff 100%);
  box-shadow:
    0 0 0 2px rgba(185, 255, 255, 0.22),
    0 0 18px rgba(0, 255, 255, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.subsector-grid--sidebar .subsector-btn.active::after {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 2px;
  pointer-events: none;
}

.subsector-btn.active:hover {
  background: #33ffff;
  transform: translateY(-2px);
}

.subsector-context-stack {
  display: grid;
  gap: 0.75rem;
}

.subsector-context-item {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid rgba(0, 217, 255, 0.16);
  border-radius: 0.55rem;
  background: rgba(0, 217, 255, 0.06);
}

.subsector-context-label {
  color: rgba(183, 247, 255, 0.68);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.subsector-context-value {
  color: #e7fbff;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.35;
}

.subsector-stats-card {
  gap: 0.8rem;
}

.subsector-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.subsector-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.68rem 0.75rem;
  border: 1px solid rgba(0, 217, 255, 0.14);
  border-radius: 0.55rem;
  background: rgba(0, 217, 255, 0.05);
}

.subsector-stat-label {
  color: rgba(183, 247, 255, 0.66);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.subsector-stat-value {
  color: #ecfcff;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.3;
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

.range-input {
  width: 100%;
}

.name-row {
  display: flex;
  gap: 0.5rem;
}

.name-row--locked {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.name-row--sidebar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  align-items: center;
}

.name-row .text-input {
  flex: 1;
}

.text-input--locked {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #d9f7ff;
  background: rgba(42, 42, 62, 0.72);
  border-color: rgba(0, 217, 255, 0.38);
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

.btn-icon {
  min-width: 2.5rem;
  padding: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #00d9ff;
  color: #000;
}

.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
}

.btn-secondary {
  background: #444;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #555;
}

/* Sector results */
.sector-results {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

/* Hex Grid */
.hex-grid-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  flex: 1;
  max-height: none;
  border: 1px solid #333;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background: #0d0d1a;
}

.hex-grid-wrapper--comfortable,
.hex-grid-wrapper--large {
  overflow-x: auto;
}

.hex-grid {
  display: grid;
  gap: var(--hex-grid-gap, 2px);
  width: 100%;
  max-width: 100%;
}

.grid-hint {
  margin-top: 0.85rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #00d9ff;
  border-radius: 0.25rem;
  background: rgba(0, 217, 255, 0.08);
  color: #b7f7ff;
  font-size: 0.9rem;
}

.grid-hint.warning {
  border-color: #ffb347;
  background: rgba(255, 179, 71, 0.1);
  color: #ffd9a3;
}

.hex-cell {
  width: 100%;
  min-width: 0;
  aspect-ratio: 1;
  border: 1px solid #1e1e3a;
  border-radius: 0.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--hex-cell-padding, 0.08rem);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  position: relative;
}

.hex-cell:hover {
  background: #1a1a3a;
  border-color: #555;
}

.hex-cell.occupied {
  background: #12122a;
  border-color: #2a2a5a;
}

.hex-cell.selected {
  background: #1a2a4a;
  border-color: #00d9ff;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
}

.hex-coord {
  font-size: var(--hex-coord-font-size, 0.55rem);
  color: #7f93ab;
  font-family: monospace;
  line-height: 1;
  font-weight: 600;
}

.hex-star {
  font-size: var(--hex-star-font-size, 1.1rem);
  line-height: 1;
}

.hex-star--presence {
  color: #666;
  opacity: 0.6;
  font-size: var(--hex-star-font-size, 1.1rem);
}

.hex-cell.presence-only {
  background: rgba(255, 255, 255, 0.03);
  border-color: #333;
}

/* Spectral class colours */
.spectral-o {
  color: #9bb0ff;
}
.spectral-b {
  color: #aabfff;
}
.spectral-a {
  color: #cad7ff;
}
.spectral-f {
  color: #f8f7ff;
}
.spectral-g {
  color: #fff4ea;
}
.spectral-k {
  color: #ffd2a1;
}
.spectral-m {
  color: #ff8c69;
}

.anomaly-core {
  color: #f7b1ff;
  text-shadow:
    0 0 6px rgba(247, 177, 255, 0.8),
    0 0 12px rgba(199, 113, 255, 0.7);
}

/* Hex detail panel */
.hex-detail {
  margin-top: 1.5rem;
  background: #12122e;
  border: 1px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.hex-detail--sidebar {
  margin-top: 0;
}

.hex-detail--placeholder {
  border-style: dashed;
  border-color: rgba(0, 217, 255, 0.35);
}

.hex-detail h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
}

.hex-detail p {
  margin: 0;
  color: #b7d8ea;
  line-height: 1.45;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
}

.detail-row .label {
  color: #00ffff;
  font-weight: bold;
  min-width: 140px;
}

.detail-row .value {
  color: #e0e0e0;
  font-family: monospace;
}

.detail-actions {
  margin-top: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .survey-workspace {
    grid-template-columns: minmax(16rem, 1fr) minmax(0, 2.35fr);
  }

  .survey-workspace--subsector {
    grid-template-columns: minmax(10.5rem, 0.64fr) minmax(0, 2.35fr) minmax(12.5rem, 1fr);
  }

  .control-inline-row--load,
  .control-inline-row--generation {
    grid-template-columns: 1fr;
  }

  .name-row--sidebar {
    grid-template-columns: 1fr;
  }

  .stellar-inline-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .sector-summary-row {
    flex-direction: column;
  }

  .sector-summary-group,
  .sector-summary-group--right {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .detail-actions {
    margin-top: 0;
    width: 100%;
  }

  .detail-actions .btn {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .sector-survey {
    overflow: visible;
    height: auto;
  }

  .survey-content {
    padding: 1rem;
    overflow: visible;
    height: auto;
  }

  .survey-workspace {
    grid-template-columns: 1fr;
    height: auto;
  }

  .control-panel {
    position: static;
    height: auto;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }

  .subsector-sidebar {
    position: static;
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .control-help {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .sector-pane,
  .sector-results {
    min-height: auto;
  }

  .sector-pane {
    position: static;
    top: auto;
    height: auto;
    max-height: none;
  }

  .hex-grid-wrapper {
    max-height: none;
    flex: none;
  }
}
</style>
