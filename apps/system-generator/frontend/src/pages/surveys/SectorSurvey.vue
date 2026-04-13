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
                  <span v-if="displayedSector.legacyReconstructedCount" class="summary-pill">
                    <span class="summary-pill-label">Legacy Star Trees</span>
                    <span class="summary-pill-value">{{
                      displayedSector.legacyReconstructedCount.toLocaleString()
                    }}</span>
                  </span>
                  <span v-if="displayedSector.legacyHierarchyUnknownCount" class="summary-pill">
                    <span class="summary-pill-label">Inferred Hierarchies</span>
                    <span class="summary-pill-value">{{
                      displayedSector.legacyHierarchyUnknownCount.toLocaleString()
                    }}</span>
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
                  @click="selectSubsector(letter)"
                >
                  {{ letter }}
                </button>
              </div>

              <div class="subsector-nav" aria-label="Subsector directional navigation">
                <button
                  class="btn btn-secondary subsector-nav-btn"
                  type="button"
                  :disabled="subsectorDirectionalTargets.north === selectedSubsector"
                  @click="moveSubsectorSelection(0, -1)"
                >
                  ↑
                </button>
                <button
                  class="btn btn-secondary subsector-nav-btn"
                  type="button"
                  :disabled="subsectorDirectionalTargets.west === selectedSubsector"
                  @click="moveSubsectorSelection(-1, 0)"
                >
                  ←
                </button>
                <span class="subsector-nav-current">{{ currentSubsectorSummary || selectedSubsector }}</span>
                <button
                  class="btn btn-secondary subsector-nav-btn"
                  type="button"
                  :disabled="subsectorDirectionalTargets.east === selectedSubsector"
                  @click="moveSubsectorSelection(1, 0)"
                >
                  →
                </button>
                <button
                  class="btn btn-secondary subsector-nav-btn"
                  type="button"
                  :disabled="subsectorDirectionalTargets.south === selectedSubsector"
                  @click="moveSubsectorSelection(0, 1)"
                >
                  ↓
                </button>
              </div>

              <div class="subsector-select-actions" style="margin-top: 0.6rem">
                <div class="control-inline-row control-inline-row--generation">
                  <button
                    class="btn btn-primary"
                    @click="generateAllSubsectorSystems"
                    :disabled="isLoading || fullGenerationBlockedByTier"
                    :title="fullGenerationBlockedByTier ? fullGenerationBlockedReason : ''"
                  >
                    {{ isLoading ? "Generating..." : "⭐ Generate All Subsector Systems" }}
                  </button>
                </div>
                <div v-if="generationStatusMessage" class="control-help control-help--multiline generation-status-copy">
                  {{ generationStatusMessage }}
                </div>
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

            <div v-if="generatedSector" class="control-group control-group--span-2">
              <label>Survey Progress</label>
              <div class="survey-progress-card">
                <div class="survey-progress-bar" aria-hidden="true">
                  <span
                    class="survey-progress-segment survey-progress-segment--typed"
                    :style="{ width: `${surveyProgress.typedPercent}%` }"
                  ></span>
                  <span
                    class="survey-progress-segment survey-progress-segment--presence"
                    :style="{ width: `${surveyProgress.presencePercent}%` }"
                  ></span>
                  <span
                    class="survey-progress-segment survey-progress-segment--empty"
                    :style="{ width: `${surveyProgress.emptyPercent}%` }"
                  ></span>
                </div>
                <div class="survey-progress-metrics">
                  <span class="survey-progress-pill survey-progress-pill--typed"
                    >{{ surveyProgress.typedCount.toLocaleString() }} typed</span
                  >
                  <span class="survey-progress-pill survey-progress-pill--presence"
                    >{{ surveyProgress.presenceOnlyCount.toLocaleString() }} presence only</span
                  >
                  <span class="survey-progress-pill survey-progress-pill--empty"
                    >{{ surveyProgress.emptyCount.toLocaleString() }} empty</span
                  >
                  <span class="survey-progress-pill survey-progress-pill--total"
                    >{{ surveyProgress.completedPercent }}% mapped</span
                  >
                </div>
              </div>
            </div>

            <div v-if="currentViewMode !== 'subsector'" class="control-group control-group--span-2">
              <label>Survey Options</label>
              <div class="survey-option-grid" role="radiogroup" aria-label="Sector survey options">
                <button
                  v-for="option in generationModeOptions"
                  :key="option.id"
                  type="button"
                  class="survey-option-btn"
                  :class="{ active: effectiveGenerationMode === option.id }"
                  :aria-pressed="effectiveGenerationMode === option.id"
                  @click="generationMode = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
              <div class="control-help control-help--multiline">
                {{ generationAction?.description }}
              </div>
              <div class="tier-policy-badge" :class="`tier-policy-badge--${generationPolicyBadge.tier}`">
                <span class="tier-policy-badge__tier">{{ generationPolicyBadge.tierLabel }}</span>
                <span class="tier-policy-badge__rule">{{ generationPolicyBadge.rule }}</span>
                <span class="tier-policy-badge__mode">{{ generationPolicyBadge.modeLabel }}</span>
              </div>
              <div class="control-inline-row control-inline-row--generation">
                <span class="survey-action-label">{{ generationAction?.label }}</span>
                <button class="btn btn-primary" :disabled="isLoading" @click="runSurveyAction">
                  {{ isLoading ? "Generating..." : generationAction?.label || "Generate" }}
                </button>
              </div>
            </div>

            <div v-if="generatedSector && currentViewMode !== 'subsector'" class="control-group control-group--span-2">
              <label>Stellar Survey</label>
              <div
                v-if="inspectedHexData?.hasSystem && !inspectedHexData?.presenceOnly && inspectedHexData?.starType"
                class="stellar-inline-card"
              >
                <div class="stellar-inline-copy">
                  <span class="stellar-inline-title">System {{ inspectedHexData.coord }}</span>
                  <span class="stellar-inline-source">{{ inspectedHexSourceLabel }}</span>
                  <span class="stellar-inline-detail">{{ inspectedHexData.starType }}</span>
                  <span v-if="inspectedHexData.secondaryStars?.length" class="stellar-inline-detail"
                    >+ {{ inspectedHexData.secondaryStars.join(", ") }}</span
                  >
                  <span v-if="inspectedHexData.mainworldName" class="stellar-inline-detail"
                    >Mainworld {{ inspectedHexData.mainworldName }}</span
                  >
                  <span v-if="inspectedHexData.mainworldUwp" class="stellar-inline-detail"
                    >UWP {{ inspectedHexData.mainworldUwp }}</span
                  >
                  <span v-if="inspectedHexData.habitability" class="stellar-inline-detail"
                    >Habitability {{ inspectedHexData.habitability }}</span
                  >
                  <span v-if="inspectedHexData.resourceRating" class="stellar-inline-detail"
                    >Resources {{ inspectedHexData.resourceRating }}</span
                  >
                  <span v-if="inspectedHexData.minimumSustainableTechLevel" class="stellar-inline-detail">{{
                    inspectedHexData.minimumSustainableTechLevel
                  }}</span>
                  <span v-if="inspectedHexData.majorCities" class="stellar-inline-detail">{{
                    inspectedHexData.majorCities
                  }}</span>
                  <span v-if="inspectedHexData.governmentProfile" class="stellar-inline-detail"
                    >Gov {{ inspectedHexData.governmentProfile }}</span
                  >
                  <span v-if="inspectedHexData.justiceProfile" class="stellar-inline-detail"
                    >Justice {{ inspectedHexData.justiceProfile }}</span
                  >
                  <span v-if="inspectedHexData.lawProfile" class="stellar-inline-detail"
                    >Law {{ inspectedHexData.lawProfile }}</span
                  >
                  <span v-if="inspectedHexData.appealProfile" class="stellar-inline-detail"
                    >Appeals {{ inspectedHexData.appealProfile }}</span
                  >
                  <span v-if="inspectedHexData.privateLawProfile" class="stellar-inline-detail"
                    >Private {{ inspectedHexData.privateLawProfile }}</span
                  >
                  <span v-if="inspectedHexData.personalRightsProfile" class="stellar-inline-detail"
                    >Rights {{ inspectedHexData.personalRightsProfile }}</span
                  >
                  <span v-if="inspectedHexData.secondaryProfiles" class="stellar-inline-detail">{{
                    inspectedHexData.secondaryProfiles
                  }}</span>
                  <span v-if="inspectedHexData.factionsProfile" class="stellar-inline-detail">{{
                    inspectedHexData.factionsProfile
                  }}</span>
                  <span v-if="inspectedHexData.legacyReconstructed" class="stellar-inline-flag">Legacy Star Tree</span>
                  <span v-if="inspectedHexData.legacyHierarchyUnknown" class="stellar-inline-flag"
                    >Hierarchy Inferred</span
                  >
                </div>
                <div class="detail-actions">
                  <button v-if="hasLockedHexSelection" class="btn btn-primary" @click="proceedToStarSystem">
                    🔭 Stellar Survey →
                  </button>
                  <span v-else class="stellar-inline-hint">Hover preview only. Click to lock this hex.</span>
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
            <div class="sector-grid-toolbar">
              <div class="sector-grid-toolbar-group">
                <span class="sector-grid-toolbar-label">Grid size</span>
                <div class="grid-size-toggle" role="group" aria-label="Sector grid size">
                  <button
                    type="button"
                    class="survey-option-btn grid-size-btn"
                    :class="{ active: gridSizeMode === 'fit' }"
                    :aria-pressed="gridSizeMode === 'fit'"
                    @click="gridSizeMode = 'fit'"
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    class="survey-option-btn grid-size-btn"
                    :class="{ active: gridSizeMode === 'comfortable' }"
                    :aria-pressed="gridSizeMode === 'comfortable'"
                    @click="gridSizeMode = 'comfortable'"
                  >
                    Comfort
                  </button>
                  <button
                    type="button"
                    class="survey-option-btn grid-size-btn"
                    :class="{ active: gridSizeMode === 'large' }"
                    :aria-pressed="gridSizeMode === 'large'"
                    @click="gridSizeMode = 'large'"
                  >
                    Large
                  </button>
                </div>
              </div>

              <form class="grid-jump-form" @submit.prevent="jumpToHexCoord()">
                <label class="sector-grid-toolbar-label" for="sector-grid-jump">Jump to hex</label>
                <div class="grid-jump-controls">
                  <input
                    id="sector-grid-jump"
                    ref="coordJumpInputRef"
                    v-model="coordJumpInput"
                    class="text-input grid-jump-input"
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="0618"
                  />
                  <button class="btn btn-secondary" type="submit" :disabled="!canJumpToHex">Go</button>
                </div>
              </form>

              <div class="sector-grid-toolbar-group sector-grid-toolbar-group--full">
                <span class="sector-grid-toolbar-label">Filter</span>
                <div class="sector-filter-chips" role="group" aria-label="Sector survey filter">
                  <button
                    v-for="option in surveyFilterOptions"
                    :key="option.id"
                    type="button"
                    class="survey-option-btn sector-filter-chip"
                    :class="{ active: sectorSurveyFilterMode === option.id }"
                    :aria-pressed="sectorSurveyFilterMode === option.id"
                    @click="sectorSurveyFilterMode = option.id"
                  >
                    <span>{{ option.label }}</span>
                    <span class="sector-filter-chip-count">{{ option.count }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="sector-grid-toolbar-meta">
              <span>{{ surveyProgress.completedPercent }}% mapped</span>
              <span>{{ surveyProgress.typedCount.toLocaleString() }} typed</span>
              <span>{{ surveyProgress.presenceOnlyCount.toLocaleString() }} presence only</span>
              <span>Arrow keys move, Enter locks, G opens Stellar Survey, / focuses jump.</span>
            </div>

            <div
              ref="gridWrapperRef"
              class="hex-grid-wrapper"
              :class="`hex-grid-wrapper--${gridSizeMode}`"
              tabindex="0"
              role="grid"
              aria-label="Sector hex grid"
              @keydown="handleGridKeydown"
            >
              <div class="hex-grid" :key="gridRenderKey" :style="gridStyle">
                <div
                  v-for="hex in displayedSector.hexes"
                  :key="hex.coord"
                  class="hex-cell"
                  :class="{
                    occupied: hex.hasSystem,
                    'presence-only': hex.presenceOnly,
                    selected: hex.coord === selectedHex,
                    'hex-cell--hovered': hex.coord === hoveredHex,
                    'hex-cell--filtered-out': sectorSurveyFilterMode !== 'all' && !doesHexMatchFilter(hex),
                    'hex-cell--matched': sectorSurveyFilterMode !== 'all' && doesHexMatchFilter(hex),
                    'hex-cell--anomaly': Boolean(getHexBadge(hex)),
                  }"
                  :data-hex-coord="hex.coord"
                  :title="buildSectorSurveyHexTitle(hex)"
                  :aria-selected="hex.coord === selectedHex"
                  @click="selectHex(hex)"
                  @mouseenter="hoverHex(hex)"
                  @mouseleave="clearHoveredHex(hex)"
                >
                  <div v-if="showHexCoords" class="hex-coord">{{ hex.coord }}</div>
                  <span v-if="getHexBadge(hex)" class="hex-badge" :class="getHexBadge(hex).className">
                    {{ getHexBadge(hex).icon }}
                  </span>
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
                @click="selectSubsector(letter)"
              >
                {{ letter }}
              </button>
            </div>
            <div class="subsector-nav subsector-nav--sidebar" aria-label="Subsector directional navigation">
              <button
                class="btn btn-secondary subsector-nav-btn"
                type="button"
                :disabled="subsectorDirectionalTargets.north === selectedSubsector"
                @click="moveSubsectorSelection(0, -1)"
              >
                ↑
              </button>
              <button
                class="btn btn-secondary subsector-nav-btn"
                type="button"
                :disabled="subsectorDirectionalTargets.west === selectedSubsector"
                @click="moveSubsectorSelection(-1, 0)"
              >
                ←
              </button>
              <span class="subsector-nav-current">{{ currentSubsectorSummary || selectedSubsector }}</span>
              <button
                class="btn btn-secondary subsector-nav-btn"
                type="button"
                :disabled="subsectorDirectionalTargets.east === selectedSubsector"
                @click="moveSubsectorSelection(1, 0)"
              >
                →
              </button>
              <button
                class="btn btn-secondary subsector-nav-btn"
                type="button"
                :disabled="subsectorDirectionalTargets.south === selectedSubsector"
                @click="moveSubsectorSelection(0, 1)"
              >
                ↓
              </button>
            </div>
          </section>

          <section
            v-if="scope === 'subsector'"
            class="control-card subsector-sidebar-card subsector-sidebar-card--actions"
          >
            <label>Subsector Survey</label>
            <div class="subsector-sidebar-actions" style="margin-bottom: 0.4rem">
              <button
                class="btn btn-primary subsector-sidebar-btn"
                :disabled="isLoading || fullGenerationBlockedByTier"
                :title="fullGenerationBlockedByTier ? fullGenerationBlockedReason : ''"
                @click="generateAllSubsectorSystems"
              >
                {{ isLoading ? "Generating..." : "⭐ Generate All Subsector Systems" }}
              </button>
            </div>
            <div class="subsector-sidebar-copy">
              Generate all systems and world profiles for the current subsector viewport.
            </div>
            <div v-if="generationStatusMessage" class="control-help control-help--multiline generation-status-copy">
              {{ generationStatusMessage }}
            </div>
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
              <div v-if="hasLockedHexSelection" class="orbital-preview-actions">
                <button
                  class="btn btn-secondary"
                  @click="generateSystemForSelectedHex"
                  :disabled="isLoading || fullGenerationBlockedByTier"
                  :title="fullGenerationBlockedByTier ? fullGenerationBlockedReason : ''"
                >
                  ⚙ Generate System
                </button>
                <button class="btn btn-primary" @click="proceedToStarSystem">🔭 Stellar Survey →</button>
              </div>
              <div v-else class="orbital-preview-hint">Hover preview active. Click a hex to lock preview actions.</div>
              <div v-if="generationStatusMessage" class="control-help control-help--multiline generation-status-copy">
                {{ generationStatusMessage }}
              </div>
            </div>
            <div v-else class="orbital-preview orbital-preview--placeholder">
              <div class="orbital-preview-empty-icon">◌</div>
              <div class="orbital-preview-copy">
                <span class="orbital-preview-title">{{ orbitalPreview.title }}</span>
                <span class="orbital-preview-detail">{{ orbitalPreview.message }}</span>
              </div>
              <div v-if="selectedHexData?.presenceOnly" class="orbital-preview-actions">
                <button
                  class="btn btn-primary"
                  @click="generateSystemForSelectedHex"
                  :disabled="isLoading || fullGenerationBlockedByTier"
                  :title="fullGenerationBlockedByTier ? fullGenerationBlockedReason : ''"
                >
                  ⚙ Generate System
                </button>
              </div>
              <div v-else-if="inspectedHexData?.presenceOnly" class="orbital-preview-hint">
                Hover preview active. Click this presence-only hex to enable generation.
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
import { starDescriptorToColor, starDescriptorToCssClass } from "../../utils/starDisplay.js";
import * as galaxyApi from "../../api/galaxyApi.js";
import * as sectorApi from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability, pickCentralAnomalyType } from "../../utils/sectorGeneration.js";
import { generatePhonotacticName } from "../../utils/nameGenerator.js";
import { generateGalaxySectorLayout } from "../../utils/sectorLayoutGenerator.js";
import { buildPersistedSurveySystemFromHex } from "../../utils/stellarSurveySystemGenerator.js";
import { buildSectorHexesFromMetadata as buildPersistedSectorHexesFromMetadata } from "../../utils/sectorPreviewState.js";
import { buildSystemHexSummary as buildSavedSystemHexSummary } from "../../utils/systemSummary.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import { getRequestedSurveyViewport, useSectorSurveyViewMode } from "../../composables/useSectorSurveyViewMode.js";
import { SUBSECTOR_LETTERS, getSubsectorViewportBounds } from "../../utils/subsector.js";
import { getSystemsBySectorStrict, replaceSystemsForSectorStrict, upsertSystemStrict } from "../../api/systemApi.js";
import {
  buildSectorSurveyHexTitle,
  buildSectorSurveyProgress,
  describeSectorSurveyHexBadge,
  moveSectorSurveyCoord,
  moveSectorSurveySubsector,
  normalizeSectorSurveyCoord,
  resolveSectorSurveyFilterMatch,
  summarizeSectorSurveyFilters,
} from "../../utils/sectorSurveyInteractions.js";
import {
  buildSectorSurveyCreatePayload,
  buildSectorSurveyGenerationMutation,
  buildSectorSurveyRebuiltPreview,
  buildSectorSurveyReturnRoute,
  buildSectorSurveySavedPreviewState,
  buildSectorSurveySavePayload,
  resolveSectorSurveyNameUpdate,
  resolveSectorSurveyBackRoute,
  resolveSectorSurveyInitialSelection,
} from "../../utils/sectorSurveyPersistence.js";
import {
  buildGeneratedStars,
  buildHexStarTypeMetadata,
  resolveGeneratedStarsFromSystem,
  summarizeLegacyStarMetadata,
  summarizeGeneratedStars,
} from "../../utils/systemStarMetadata.js";
import { generateMultipleStarSystemWbh } from "../../utils/wbh/starGenerationWbh.js";
import {
  buildSurveyedCoordKeySet,
  calculateSpaceTier,
  resolveGenerationModeForSpaceTier,
} from "../../utils/spaceClassification.js";

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
const generationStatus = ref({ tone: "idle", message: "" });
const gridWrapperRef = ref(null);
const coordJumpInputRef = ref(null);
const gridWrapperBounds = ref({ width: 0, height: 0 });
const focusedOrbitalTarget = ref(null);
const gridRenderNonce = ref(0);
const hoveredHex = ref(null);
const coordJumpInput = ref("");
const sectorSurveyFilterMode = ref("all");
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

  const sectorLegacySummary = summarizeLegacyStarMetadata({
    hexes: Array.isArray(sector.hexes) ? sector.hexes : [],
    hexStarTypes: sector?.metadata?.hexStarTypes ?? {},
  });

  const gridCols = Number(sector.gridCols ?? 0);
  const gridRows = Number(sector.gridRows ?? 0);
  if (scope.value !== "subsector" || gridCols !== 32 || gridRows !== 40) {
    return {
      ...sector,
      legacySummary: sectorLegacySummary,
      legacyReconstructedCount: sectorLegacySummary.legacyReconstructedCount,
      legacyHierarchyUnknownCount: sectorLegacySummary.legacyHierarchyUnknownCount,
      viewportLabel: scope.value === "subsector" ? `Subsector ${selectedSubsector.value}` : null,
    };
  }

  const visibleHexes = (Array.isArray(sector.hexes) ? sector.hexes : []).filter((hex) =>
    isCoordInSubsector(hex?.coord, selectedSubsector.value),
  );
  const systemCount = visibleHexes.filter((hex) => hex.hasSystem).length;
  const legacySummary = summarizeLegacyStarMetadata({ hexes: visibleHexes });

  return {
    ...sector,
    scope: "subsector",
    gridCols: 8,
    gridRows: 10,
    hexes: visibleHexes,
    systemCount,
    emptyCount: Math.max(0, 80 - systemCount),
    presenceOnlyCount: visibleHexes.filter((hex) => hex.presenceOnly).length,
    legacySummary,
    legacyReconstructedCount: legacySummary.legacyReconstructedCount,
    legacyHierarchyUnknownCount: legacySummary.legacyHierarchyUnknownCount,
    viewportLabel: `Subsector ${selectedSubsector.value}`,
  };
});

const gridRenderKey = computed(() => {
  const sectorId = String(displayedSector.value?.sectorId || generatedSector.value?.sectorId || "unsaved");
  const viewport = String(displayedSector.value?.viewportLabel || scope.value || "sector");
  const systems = Number(displayedSector.value?.systemCount ?? 0);
  const typed = Math.max(0, systems - Number(displayedSector.value?.presenceOnlyCount ?? 0));
  return `${sectorId}:${viewport}:${systems}:${typed}:${gridRenderNonce.value}`;
});

const generationStatusMessage = computed(() => String(generationStatus.value?.message || "").trim());

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

const gridColumnCount = computed(() => Number(displayedSector.value?.gridCols ?? 0));
const gridRowCount = computed(() => Number(displayedSector.value?.gridRows ?? 0));

const selectedHexData = computed(
  () => displayedSector.value?.hexes?.find((h) => h.coord === selectedHex.value) ?? null,
);
const hoveredHexData = computed(() => displayedSector.value?.hexes?.find((h) => h.coord === hoveredHex.value) ?? null);
const inspectedHexData = computed(() => selectedHexData.value ?? hoveredHexData.value ?? null);
const hasLockedHexSelection = computed(() => Boolean(selectedHexData.value?.coord));
const inspectedHexSourceLabel = computed(() => {
  if (selectedHexData.value?.coord) {
    return "Selected";
  }
  if (hoveredHexData.value?.coord) {
    return "Hover";
  }
  return "Idle";
});
const hasSystemsInGrid = computed(() => (displayedSector.value?.systemCount ?? 0) > 0);

watch(selectedHexData, () => {
  clearOrbitalTarget();
});

watch(
  displayedSector,
  (sector) => {
    const coords = new Set(
      (Array.isArray(sector?.hexes) ? sector.hexes : []).map((hex) => String(hex?.coord || "").trim()),
    );
    if (selectedHex.value && !coords.has(String(selectedHex.value || "").trim())) {
      selectedHex.value = null;
    }
    if (hoveredHex.value && !coords.has(String(hoveredHex.value || "").trim())) {
      hoveredHex.value = null;
    }
    if (!selectedHex.value) {
      coordJumpInput.value = "";
    }
  },
  { immediate: true },
);

const orbitalPreview = computed(() => {
  const hex = inspectedHexData.value;
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
      message: hasHexSelection
        ? "Click this hex to lock actions, or choose a starred hex in the subsector grid to preview its local orbital structure."
        : "Choose a starred hex in the subsector grid to preview its local orbital structure.",
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
    { label: "Source", value: inspectedHexSourceLabel.value, tone: selectedHexData.value?.coord ? "focus" : "muted" },
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
  return resolveSectorSurveyBackRoute({
    explicitReturnRoute: deserializeReturnRoute(String(route.query.returnTo || "")),
    from: route.query.from,
    atlasGalaxyId: route.query.atlasGalaxyId,
    galaxyId: props.galaxyId,
  });
});
const activeSectorRecord = computed(() => {
  if (!selectedSectorId.value) return null;
  return sectorStore.sectors.find((entry) => entry.sectorId === selectedSectorId.value) ?? null;
});
const activeSectorMetadata = computed(() => activeSectorRecord.value?.metadata ?? {});
const activeSectorCoordinates = computed(() => {
  const recordCoords = activeSectorRecord.value?.coordinates;
  if (Number.isFinite(recordCoords?.x) && Number.isFinite(recordCoords?.y)) {
    return { x: Math.trunc(Number(recordCoords.x)), y: Math.trunc(Number(recordCoords.y)) };
  }

  const generatedCoords = generatedSector.value?.coordinates;
  if (Number.isFinite(generatedCoords?.x) && Number.isFinite(generatedCoords?.y)) {
    return { x: Math.trunc(Number(generatedCoords.x)), y: Math.trunc(Number(generatedCoords.y)) };
  }

  const requestedGrid = getRequestedGridCoordinates();
  if (Number.isFinite(requestedGrid?.x) && Number.isFinite(requestedGrid?.y)) {
    return { x: Math.trunc(Number(requestedGrid.x)), y: Math.trunc(Number(requestedGrid.y)) };
  }

  return null;
});
const surveyedCoordKeySet = computed(() => buildSurveyedCoordKeySet(sectorStore.sectors));
const currentSectorSpaceTier = computed(() => {
  const coords = activeSectorCoordinates.value;
  if (!coords) return "void";
  return calculateSpaceTier(coords.x, coords.y, surveyedCoordKeySet.value);
});

watch(
  [selectedSubsector, activeSectorMetadata, scope],
  ([letter, metadata, activeScope]) => {
    if (activeScope !== "subsector") {
      return;
    }

    const nextName = getStoredSubsectorName(metadata, letter);
    if (String(nextName || "").trim() !== String(subsectorName.value || "").trim()) {
      subsectorName.value = nextName;
    }
  },
  { immediate: true },
);

const sectorPresenceCount = computed(() =>
  Array.isArray(activeSectorMetadata.value?.occupiedHexes) ? activeSectorMetadata.value.occupiedHexes.length : 0,
);
const sectorTypedHexCount = computed(() => {
  const hexStarTypes = activeSectorMetadata.value?.hexStarTypes;
  return hexStarTypes && typeof hexStarTypes === "object" ? Object.keys(hexStarTypes).length : 0;
});
const scopePresenceCount = computed(() => {
  const visibleHexes = Array.isArray(displayedSector.value?.hexes) ? displayedSector.value.hexes : null;
  if (!visibleHexes) {
    return sectorPresenceCount.value;
  }

  return visibleHexes.filter((hex) => hex?.hasSystem).length;
});
const scopeTypedHexCount = computed(() => {
  const visibleHexes = Array.isArray(displayedSector.value?.hexes) ? displayedSector.value.hexes : null;
  if (!visibleHexes) {
    return sectorTypedHexCount.value;
  }

  return visibleHexes.filter((hex) => hex?.hasSystem && !hex?.presenceOnly && hex?.starType).length;
});
const defaultGenerationMode = computed(() => {
  if (!activeSectorRecord.value && !generatedSector.value) {
    if (isAtlasEntry.value && getRequestedGridCoordinates()) {
      return "presence";
    }
    return "name-systems";
  }
  if (scopePresenceCount.value <= 0) {
    return "name-presence";
  }
  if (scopeTypedHexCount.value < scopePresenceCount.value) {
    return "name-systems";
  }
  return "name-systems";
});
const effectiveGenerationMode = computed(() => generationMode.value || defaultGenerationMode.value);
const tierAwareGenerationMode = computed(() =>
  resolveGenerationModeForSpaceTier(effectiveGenerationMode.value, currentSectorSpaceTier.value),
);
const fullGenerationBlockedByTier = computed(() => currentSectorSpaceTier.value === "void");
const fullGenerationBlockedReason = computed(() => {
  if (!fullGenerationBlockedByTier.value) return "";
  return "Void tier sectors are presence-only until they are promoted to Frontier or Surveyed.";
});
const generationModeOptions = computed(() => [
  { id: "name", label: "Name Only" },
  { id: "name-presence", label: "Name + Presence" },
  { id: "presence", label: "Presence Only" },
  { id: "name-systems", label: "Name + Systems + Worlds" },
]);
const generationAction = computed(() => {
  const modeForTier = tierAwareGenerationMode.value;
  const policyAdjusted = modeForTier !== effectiveGenerationMode.value;
  const policyPrefix = policyAdjusted
    ? `Space tier policy (${currentSectorSpaceTier.value}) adjusted this action. `
    : "";
  const scopeLabel = scope.value === "subsector" ? "Subsector" : "Sector";
  if (modeForTier === "name") {
    return {
      id: "name",
      label: "💾 Save Sector Name",
      description: `${policyPrefix}Create or update the sector record and name only. No system presence or stellar systems are rolled.`,
    };
  }
  if (modeForTier === "name-presence") {
    return {
      id: "name-presence",
      label: "⚡ Name + Presence",
      description: `${policyPrefix}Save the current sector name, then roll occupied hexes without generating full stellar system data.`,
    };
  }
  if (modeForTier === "presence") {
    return {
      id: "presence",
      label: "🗺 Presence Only",
      description: `${policyPrefix}Roll occupied hexes only. Full stellar system data is not generated.`,
    };
  }
  if (scopeTypedHexCount.value > 0 && scopeTypedHexCount.value === scopePresenceCount.value) {
    return {
      id: "name-systems",
      label: "⭐ Name + Systems + Worlds",
      description: `${policyPrefix}Use the existing surveyed stellar data in the current viewport to persist stellar systems and generated world profiles without rerolling presence or primary stars.`,
    };
  }
  if (scopePresenceCount.value > 0 && scopeTypedHexCount.value < scopePresenceCount.value) {
    return {
      id: "name-systems",
      label: "⭐ Name + Systems + Worlds",
      description: `${policyPrefix}Preserve the current sector name and convert existing occupied hexes into persisted stellar systems with generated world profiles.`,
    };
  }
  return {
    id: "name-systems",
    label: `⭐ Name + Systems + Worlds`,
    description: `${policyPrefix}Generate a full ${scopeLabel.toLowerCase()} survey in one step, including occupied hexes, stellar systems, and world profiles.`,
  };
});
const generationPolicyBadge = computed(() => {
  const tier = String(currentSectorSpaceTier.value || "void");
  const modeForTier = tierAwareGenerationMode.value;
  const requestedMode = effectiveGenerationMode.value;
  const wasAdjusted = modeForTier !== requestedMode;

  const rule =
    tier === "surveyed"
      ? "Surveyed sectors always run full Name + Systems + Worlds generation."
      : tier === "frontier"
        ? "Frontier sectors use your selected generation mode."
        : "Void sectors limit generation to presence-safe modes until surveyed.";

  return {
    tier,
    tierLabel: `Tier: ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`,
    rule,
    wasAdjusted,
    modeLabel: wasAdjusted ? `Mode adjusted: ${requestedMode} -> ${modeForTier}` : `Mode: ${modeForTier}`,
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
    const persistedSubsectorName = getStoredSubsectorName(sector?.metadata, selectedSubsector.value);
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
const surveyProgress = computed(() =>
  buildSectorSurveyProgress({
    systemCount: displayedOccupiedHexCount.value,
    presenceOnlyCount: displayedPresenceOnlyCount.value,
    totalHexes: displayedTotalHexCount.value,
  }),
);
const surveyFilterCounts = computed(() => summarizeSectorSurveyFilters(displayedSector.value?.hexes ?? []));
const surveyFilterOptions = computed(() => [
  { id: "all", label: "All", count: Number(displayedSector.value?.hexes?.length ?? 0) },
  { id: "surveyed", label: "Surveyed", count: surveyFilterCounts.value.surveyed },
  { id: "presence", label: "Presence", count: surveyFilterCounts.value.presence },
  { id: "anomaly", label: "Anomaly", count: surveyFilterCounts.value.anomaly },
  { id: "oba", label: "O/B/A", count: surveyFilterCounts.value.oba },
  { id: "fgk", label: "F/G/K", count: surveyFilterCounts.value.fgk },
  { id: "m", label: "M", count: surveyFilterCounts.value.m },
  { id: "legacy", label: "Legacy", count: surveyFilterCounts.value.legacy },
  { id: "empty", label: "Empty", count: surveyFilterCounts.value.empty },
]);
const subsectorDirectionalTargets = computed(() => {
  const current = String(selectedSubsector.value || "A").trim() || "A";
  return {
    north: moveSectorSurveySubsector(current, { rowDelta: -1 }),
    south: moveSectorSurveySubsector(current, { rowDelta: 1 }),
    west: moveSectorSurveySubsector(current, { columnDelta: -1 }),
    east: moveSectorSurveySubsector(current, { columnDelta: 1 }),
  };
});
const canJumpToHex = computed(() =>
  Boolean(normalizeSectorSurveyCoord(coordJumpInput.value, { cols: gridColumnCount.value, rows: gridRowCount.value })),
);
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

function normalizeStarTypeValue(value, fallback = "G2V") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  const lowered = normalized.toLowerCase();
  if (lowered === "undefined" || lowered === "null" || lowered === "nan") {
    return fallback;
  }

  return normalized;
}

function isValidStarLabel(value) {
  return normalizeStarTypeValue(value, "") !== "";
}

function spectralClassToCssClass(spectralClass) {
  return starDescriptorToCssClass(normalizeStarTypeValue(spectralClass, "G"));
}

function starColorForDesignation(designation) {
  return starDescriptorToColor(normalizeStarTypeValue(designation, "G"));
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
  const knownCoords = [
    ...(Array.isArray(metadata.occupiedHexes) ? metadata.occupiedHexes : []),
    ...Object.keys(metadata.hexStarTypes && typeof metadata.hexStarTypes === "object" ? metadata.hexStarTypes : {}),
  ]
    .map((coord) => String(coord || "").trim())
    .filter((coord) => /^\d{4}$/.test(coord));

  if (
    knownCoords.some((coord) => {
      const col = Number(coord.slice(0, 2));
      const row = Number(coord.slice(2, 4));
      return col > 8 || row > 10;
    })
  ) {
    return { scope: "sector", cols: 32, rows: 40 };
  }

  if (Number.isInteger(metadata.gridCols) && Number.isInteger(metadata.gridRows)) {
    const inferredScope = metadata.gridCols === 8 && metadata.gridRows === 10 ? "subsector" : "sector";
    return { scope: inferredScope, cols: metadata.gridCols, rows: metadata.gridRows };
  }

  if (metadata.scope === "subsector") {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  const notes = String(metadata.notes || "").toLowerCase();
  if (notes.includes("subsector")) {
    return { scope: "subsector", cols: 8, rows: 10 };
  }
  return { scope: "sector", cols: 32, rows: 40 };
}

function resolveLoadedSystemStarData(system) {
  const { primaryDesignation, primaryCode, secondaryStars } = summarizeGeneratedStars(
    resolveGeneratedStarsFromSystem(system),
  );

  return {
    primaryDesignation: normalizeStarTypeValue(primaryDesignation, `${primaryCode}V`),
    primaryCode,
    secondaryStars,
  };
}

function firstNonEmptyHexSummary(...values) {
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

function buildSystemHexSummary(system = {}) {
  return buildSavedSystemHexSummary(system);
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
    const stars = resolveGeneratedStarsFromSystem(system);
    const { primaryDesignation, primaryCode, secondaryStars } = summarizeGeneratedStars(stars);

    occupied.set(coord, {
      coord,
      hasSystem: true,
      starType: normalizeStarTypeValue(primaryDesignation, `${primaryCode}V`),
      starClass: spectralClassToCssClass(primaryCode),
      secondaryStars,
      generatedStars: stars.map((star) => ({ ...star })),
      anomalyType: system?.metadata?.anomalyType || system?.metadata?.generatedSurvey?.anomalyType || null,
      systemId: system.systemId,
      ...buildSystemHexSummary(system),
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

function mapCoordToPreviewGrid(coord, { previewScope = "sector", cols = 32, rows = 40, subsectorLetter = null } = {}) {
  const rawCoord = String(coord || "").trim();
  if (!/^\d{4}$/.test(rawCoord)) {
    return "";
  }

  const col = Number(rawCoord.slice(0, 2));
  const row = Number(rawCoord.slice(2, 4));
  if (!Number.isFinite(col) || !Number.isFinite(row)) {
    return "";
  }

  if (previewScope === "subsector" && Number(cols) === 8 && Number(rows) === 10) {
    const bounds = getSubsectorViewportBounds(subsectorLetter || selectedSubsector.value);
    if (
      col >= Number(bounds.colStart || 1) &&
      col <= Number(bounds.colEnd || 8) &&
      row >= Number(bounds.rowStart || 1) &&
      row <= Number(bounds.rowEnd || 10)
    ) {
      return hexCoord(col - Number(bounds.colStart || 1) + 1, row - Number(bounds.rowStart || 1) + 1);
    }
  }

  if (col < 1 || col > Number(cols) || row < 1 || row > Number(rows)) {
    return "";
  }

  return hexCoord(col, row);
}

function mapPreviewCoordToSectorGrid(
  coord,
  { previewScope = scope.value, cols = 32, rows = 40, subsectorLetter = null } = {},
) {
  const rawCoord = String(coord || "").trim();
  if (!/^\d{4}$/.test(rawCoord)) {
    return "";
  }

  const col = Number(rawCoord.slice(0, 2));
  const row = Number(rawCoord.slice(2, 4));
  if (!Number.isFinite(col) || !Number.isFinite(row)) {
    return "";
  }

  if (previewScope === "subsector" && Number(cols) === 8 && Number(rows) === 10) {
    const bounds = getSubsectorViewportBounds(subsectorLetter || selectedSubsector.value);
    if (col >= 1 && col <= 8 && row >= 1 && row <= 10) {
      return hexCoord(col + Number(bounds.colStart || 1) - 1, row + Number(bounds.rowStart || 1) - 1);
    }
  }

  return rawCoord;
}

function normalizeHexToSectorCoord(hex) {
  const previewCols = Number(displayedSector.value?.gridCols ?? generatedSector.value?.gridCols ?? 32);
  const previewRows = Number(displayedSector.value?.gridRows ?? generatedSector.value?.gridRows ?? 40);
  const normalizedCoord = mapPreviewCoordToSectorGrid(hex?.coord, {
    previewScope: scope.value,
    cols: previewCols,
    rows: previewRows,
  });

  if (!normalizedCoord) {
    return hex ? { ...hex } : hex;
  }

  return {
    ...hex,
    coord: normalizedCoord,
  };
}

function buildPreviewHexesFromSectorData({
  metadata = null,
  systems = [],
  previewScope = "sector",
  cols = 32,
  rows = 40,
  fallbackHexes = [],
} = {}) {
  const systemHexes = new Map();
  for (const system of Array.isArray(systems) ? systems : []) {
    const x = Number(system?.hexCoordinates?.x);
    const y = Number(system?.hexCoordinates?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    const previewCoord = mapCoordToPreviewGrid(hexCoord(Math.trunc(x), Math.trunc(y)), {
      previewScope,
      cols,
      rows,
    });
    if (!previewCoord) {
      continue;
    }

    const stars = resolveGeneratedStarsFromSystem(system);
    const { primaryDesignation, primaryCode, secondaryStars } = summarizeGeneratedStars(stars);
    systemHexes.set(previewCoord, {
      coord: previewCoord,
      hasSystem: true,
      starType: normalizeStarTypeValue(primaryDesignation, `${primaryCode}V`),
      starClass: spectralClassToCssClass(primaryCode),
      secondaryStars,
      generatedStars: stars.map((star) => ({ ...star })),
      anomalyType: system?.metadata?.anomalyType || system?.metadata?.generatedSurvey?.anomalyType || null,
      systemId: system.systemId,
      ...buildSystemHexSummary(system),
    });
  }

  const hexStarTypes = metadata?.hexStarTypes ?? {};
  const transformedHexStarTypes = new Map();
  for (const [coord, saved] of Object.entries(hexStarTypes)) {
    const previewCoord = mapCoordToPreviewGrid(coord, { previewScope, cols, rows });
    if (!previewCoord) {
      continue;
    }
    transformedHexStarTypes.set(previewCoord, saved);
  }

  const presenceCoords = new Set(
    [...(Array.isArray(metadata?.occupiedHexes) ? metadata.occupiedHexes : []), ...Object.keys(hexStarTypes)]
      .map((coord) => mapCoordToPreviewGrid(coord, { previewScope, cols, rows }))
      .filter(Boolean),
  );

  const mergedHexes = [];
  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const coord = hexCoord(col, row);
      const hex = systemHexes.get(coord) ?? { coord, hasSystem: false };
      const saved = transformedHexStarTypes.get(coord);
      if (!saved && !presenceCoords.has(coord)) {
        mergedHexes.push(hex);
        continue;
      }

      const starType = normalizeStarTypeValue(saved?.starType ?? hex.starType, "");
      mergedHexes.push({
        ...hex,
        hasSystem: true,
        presenceOnly: !starType,
        starType,
        starClass: saved?.starClass || hex.starClass || spectralClassToCssClass(starType),
        secondaryStars: saved?.secondaryStars ?? hex.secondaryStars ?? [],
        generatedStars: saved?.generatedStars ?? hex.generatedStars ?? [],
        anomalyType: saved?.anomalyType ?? hex.anomalyType ?? null,
        legacyReconstructed: saved?.legacyReconstructed ?? hex.legacyReconstructed ?? false,
        legacyHierarchyUnknown: saved?.legacyHierarchyUnknown ?? hex.legacyHierarchyUnknown ?? false,
      });
    }
  }

  return mergedHexes.length ? mergedHexes : Array.isArray(fallbackHexes) ? fallbackHexes : [];
}

function applyGeneratedHexesToCurrentPreview(generatedHexes = []) {
  const current = generatedSector.value;
  if (!current || !Array.isArray(current.hexes) || !Array.isArray(generatedHexes) || !generatedHexes.length) {
    return;
  }

  const previewScope =
    Number(current.gridCols) === 8 && Number(current.gridRows) === 10 && scope.value === "subsector"
      ? "subsector"
      : "sector";
  const patchByCoord = new Map();

  for (const hex of generatedHexes) {
    const previewCoord = mapCoordToPreviewGrid(hex?.coord, {
      previewScope,
      cols: Number(current.gridCols) || 32,
      rows: Number(current.gridRows) || 40,
    });
    if (!previewCoord) {
      continue;
    }
    patchByCoord.set(previewCoord, { ...hex, coord: previewCoord });
  }

  if (!patchByCoord.size) {
    return;
  }

  const nextHexes = current.hexes.map((hex) => {
    const patch = patchByCoord.get(hex?.coord);
    return patch ? { ...hex, ...patch } : hex;
  });
  const systemCount = nextHexes.filter((hex) => hex?.hasSystem).length;

  generatedSector.value = {
    ...current,
    hexes: nextHexes,
    systemCount,
    emptyCount: Math.max(0, Number(current.gridCols || 0) * Number(current.gridRows || 0) - systemCount),
    presenceOnlyCount: nextHexes.filter((hex) => hex?.presenceOnly).length,
  };
}

function bumpGridRenderNonce() {
  gridRenderNonce.value += 1;
}

function setGenerationStatus(message, tone = "info") {
  generationStatus.value = {
    tone,
    message: String(message || "").trim(),
  };
}

function doesHexMatchFilter(hex) {
  return resolveSectorSurveyFilterMatch(hex, sectorSurveyFilterMode.value);
}

function getHexBadge(hex) {
  return describeSectorSurveyHexBadge(hex);
}

function focusGridWrapper() {
  gridWrapperRef.value?.focus?.();
}

function focusHexCell(coord, { center = true } = {}) {
  const wrapper = gridWrapperRef.value;
  if (!wrapper || !coord) {
    return;
  }

  const target = wrapper.querySelector(`[data-hex-coord="${coord}"]`);
  if (target?.scrollIntoView) {
    target.scrollIntoView({ block: center ? "center" : "nearest", inline: "center", behavior: "smooth" });
  }
  focusGridWrapper();
}

function hoverHex(hex) {
  const coord = String(hex?.coord || "").trim();
  if (coord) {
    hoveredHex.value = coord;
  }
}

function clearHoveredHex(hex = null) {
  const coord = String(hex?.coord || hex || "").trim();
  if (!coord || hoveredHex.value === coord) {
    hoveredHex.value = null;
  }
}

function setSelectedHexCoord(coord, { toggle = false, focus = true } = {}) {
  const normalized = normalizeSectorSurveyCoord(coord, { cols: gridColumnCount.value, rows: gridRowCount.value });
  if (!normalized) {
    return false;
  }

  if (toggle && normalized === selectedHex.value) {
    selectedHex.value = null;
    return true;
  }

  selectedHex.value = normalized;
  hoveredHex.value = normalized;
  coordJumpInput.value = normalized;
  if (focus) {
    focusHexCell(normalized);
  }
  return true;
}

function jumpToHexCoord({ showToast = true } = {}) {
  const normalized = normalizeSectorSurveyCoord(coordJumpInput.value, {
    cols: gridColumnCount.value,
    rows: gridRowCount.value,
  });
  if (!normalized) {
    if (showToast) {
      toastService.error("Enter a valid hex coordinate inside the current viewport.");
    }
    return false;
  }

  return setSelectedHexCoord(normalized, { focus: true });
}

function moveGridSelection(columnDelta, rowDelta) {
  const seed =
    selectedHex.value ||
    hoveredHex.value ||
    normalizeSectorSurveyCoord(coordJumpInput.value, { cols: gridColumnCount.value, rows: gridRowCount.value }) ||
    displayedSector.value?.hexes?.[0]?.coord;
  const nextCoord = moveSectorSurveyCoord(seed, {
    cols: gridColumnCount.value,
    rows: gridRowCount.value,
    columnDelta,
    rowDelta,
  });
  return setSelectedHexCoord(nextCoord, { focus: true });
}

function moveSubsectorSelection(columnDelta, rowDelta) {
  const nextLetter = moveSectorSurveySubsector(selectedSubsector.value, { columnDelta, rowDelta });
  if (nextLetter !== selectedSubsector.value) {
    selectSubsector(nextLetter);
  }
}

function handleGridKeydown(event) {
  if (!displayedSector.value) {
    return;
  }

  const targetTag = String(event.target?.tagName || "").toLowerCase();
  if (["input", "textarea", "select", "button"].includes(targetTag)) {
    return;
  }

  const key = String(event.key || "").toLowerCase();
  if (key === "/") {
    coordJumpInputRef.value?.focus?.();
    coordJumpInputRef.value?.select?.();
    event.preventDefault();
    return;
  }

  if (key === "escape") {
    if (selectedHex.value) {
      selectedHex.value = null;
      event.preventDefault();
      return;
    }
    if (hoveredHex.value) {
      hoveredHex.value = null;
      event.preventDefault();
    }
    return;
  }

  if (key === "g" && selectedHexData.value?.hasSystem && !selectedHexData.value?.presenceOnly) {
    proceedToStarSystem();
    event.preventDefault();
    return;
  }

  if (key === "enter") {
    const focusCoord = selectedHex.value || hoveredHex.value || coordJumpInput.value;
    if (focusCoord) {
      setSelectedHexCoord(focusCoord, { focus: true });
      event.preventDefault();
    }
    return;
  }

  if (key === "arrowleft") {
    moveGridSelection(-1, 0);
    event.preventDefault();
    return;
  }
  if (key === "arrowright") {
    moveGridSelection(1, 0);
    event.preventDefault();
    return;
  }
  if (key === "arrowup") {
    moveGridSelection(0, -1);
    event.preventDefault();
    return;
  }
  if (key === "arrowdown") {
    moveGridSelection(0, 1);
    event.preventDefault();
  }
}

function refreshSubsectorSurveyPage() {
  if (typeof window === "undefined" || !window.location) {
    return;
  }

  const href = window.location.href;
  window.setTimeout(() => {
    try {
      window.location.assign(href);
    } catch {
      try {
        router.go(0);
      } catch {
        window.location.reload();
      }
    }
  }, 40);
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

function getNormalizedSubsectorLetter(letter) {
  const normalized = String(letter || "A")
    .trim()
    .charAt(0)
    .toUpperCase();
  return normalized || "A";
}

function getStoredSubsectorNames(metadata) {
  const stored = metadata?.subsectorNames;
  const normalized = {};

  if (stored && typeof stored === "object") {
    for (const [letter, value] of Object.entries(stored)) {
      const safeLetter = getNormalizedSubsectorLetter(letter);
      const safeValue = String(value || "").trim();
      if (safeValue) {
        normalized[safeLetter] = safeValue;
      }
    }
  }

  const legacyLetter = getNormalizedSubsectorLetter(metadata?.subsector);
  const legacyValue = String(metadata?.subsectorName || "").trim();
  if (legacyValue && !normalized[legacyLetter]) {
    normalized[legacyLetter] = legacyValue;
  }

  return normalized;
}

function getStoredSubsectorName(metadata, letter) {
  const safeLetter = getNormalizedSubsectorLetter(letter);
  const storedNames = getStoredSubsectorNames(metadata);
  return String(storedNames[safeLetter] || "").trim();
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
  const existingKnownCoords = [
    ...(Array.isArray(existingMetadata.occupiedHexes) ? existingMetadata.occupiedHexes : []),
    ...Object.keys(
      existingMetadata.hexStarTypes && typeof existingMetadata.hexStarTypes === "object"
        ? existingMetadata.hexStarTypes
        : {},
    ),
  ]
    .map((coord) => String(coord || "").trim())
    .filter((coord) => /^\d{4}$/.test(coord));
  const existingUsesSectorLayout =
    existingKnownCoords.some((coord) => Number(coord.slice(0, 2)) > 8 || Number(coord.slice(2, 4)) > 10) ||
    Number(existingMetadata.gridCols) === 32 ||
    Number(existingMetadata.gridRows) === 40 ||
    String(existingMetadata.scope || "")
      .trim()
      .toLowerCase() === "sector";
  const preserveSectorLayout = scope.value === "subsector" && existingUsesSectorLayout;
  let nextMetadata = {
    ...existingMetadata,
    lastModified: new Date().toISOString(),
    displayName: buildGeneratedSectorName(sectorName.value || String(existingMetadata?.displayName || "").trim()),
    scope: preserveSectorLayout ? "sector" : scope.value,
    gridCols: preserveSectorLayout
      ? 32
      : hexes.length
        ? scope.value === "sector"
          ? 32
          : 8
        : existingMetadata.gridCols,
    gridRows: preserveSectorLayout
      ? 40
      : hexes.length
        ? scope.value === "sector"
          ? 40
          : 10
        : existingMetadata.gridRows,
    subsector: scope.value === "subsector" ? selectedSubsector.value : null,
    subsectorName: scope.value === "subsector" ? String(subsectorName.value || "").trim() : null,
    isGalacticCenterSector,
    occupancyRealism: occupancyRealism.value,
    hexPresenceGenerated: true,
  };

  if (scope.value === "subsector") {
    const nextSubsectorNames = getStoredSubsectorNames(existingMetadata);
    const currentLetter = getNormalizedSubsectorLetter(selectedSubsector.value);
    const currentLabel = String(subsectorName.value || "").trim();
    if (currentLabel) {
      nextSubsectorNames[currentLetter] = currentLabel;
    } else {
      delete nextSubsectorNames[currentLetter];
    }
    nextMetadata.subsectorNames = nextSubsectorNames;
  }

  // Build the hex presence and star-type maps. If we're operating inside a
  // subsector, merge the newly-generated data with the existing sector-level
  // metadata so we don't clobber other subsectors' data.
  const newHexes = Array.isArray(hexes) ? hexes : [];
  const newOccupied = new Set(
    newHexes
      .filter((h) => h.hasSystem)
      .map((h) => String(h.coord || "").trim())
      .filter(Boolean),
  );
  const newHexStarTypes = Object.fromEntries(
    newHexes
      .filter((h) => h.hasSystem && h.starType)
      .map((h) => {
        const starMetadata = buildHexStarTypeMetadata({
          generatedStars: h.generatedStars,
          primary: h.starType,
          secondaryStars: h.secondaryStars,
          anomalyType: h.anomalyType ?? null,
          fallbackStarType: normalizeStarTypeValue(h.starType, "G2V"),
          legacyReconstructed: h.legacyReconstructed ?? false,
          legacyHierarchyUnknown: h.legacyHierarchyUnknown ?? false,
        });

        return [
          String(h.coord || "").trim(),
          {
            starType: starMetadata.starType,
            starClass: h.starClass,
            secondaryStars: starMetadata.secondaryStars,
            generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
            anomalyType: starMetadata.anomalyType,
            legacyReconstructed: starMetadata.legacyReconstructed,
            legacyHierarchyUnknown: starMetadata.legacyHierarchyUnknown,
          },
        ];
      }),
  );

  if (scope.value === "subsector" && existingMetadata) {
    // Remove any existing entries that fall inside the subsector bounds and
    // then merge in the newly-generated subsector entries.
    try {
      const bounds = getSubsectorViewportBounds(selectedSubsector.value);
      const isInSubsector = (coord) => {
        const raw = String(coord || "").trim();
        if (!/^[0-9]{4}$/.test(raw)) return false;
        const col = Number(raw.slice(0, 2));
        const row = Number(raw.slice(2, 4));
        return (
          col >= Number(bounds.colStart || 1) &&
          col <= Number(bounds.colEnd || 32) &&
          row >= Number(bounds.rowStart || 1) &&
          row <= Number(bounds.rowEnd || 40)
        );
      };

      const existingOccupied = Array.isArray(existingMetadata.occupiedHexes) ? [...existingMetadata.occupiedHexes] : [];
      const mergedOccupiedSet = new Set(
        existingOccupied.filter((c) => !isInSubsector(c)).map((c) => String(c || "").trim()),
      );
      for (const c of newOccupied) mergedOccupiedSet.add(c);

      const existingHexTypes =
        existingMetadata.hexStarTypes && typeof existingMetadata.hexStarTypes === "object"
          ? { ...existingMetadata.hexStarTypes }
          : {};
      // Remove subsector keys from existingHexTypes
      for (const k of Object.keys(existingHexTypes)) {
        if (isInSubsector(k)) delete existingHexTypes[k];
      }
      // Merge in new subsector hex types
      const mergedHexTypes = { ...existingHexTypes, ...newHexStarTypes };
      const totalTypedHexCount = Object.keys(mergedHexTypes).length;

      nextMetadata.occupiedHexes = Array.from(mergedOccupiedSet);
      nextMetadata.hexStarTypes = mergedHexTypes;
      nextMetadata.systemCount = nextMetadata.occupiedHexes.length;
      nextMetadata.explorationStatus =
        nextMetadata.systemCount <= 0
          ? "unexplored"
          : totalTypedHexCount >= nextMetadata.systemCount
            ? "surveyed"
            : "mapped";
    } catch (err) {
      // Fallback to conservative assignment if anything goes wrong.
      nextMetadata.occupiedHexes = Array.from(newOccupied);
      nextMetadata.hexStarTypes = newHexStarTypes;
      nextMetadata.systemCount = Array.from(newOccupied).length;
      const totalTypedHexCount = Object.keys(newHexStarTypes).length;
      nextMetadata.explorationStatus =
        nextMetadata.systemCount <= 0
          ? "unexplored"
          : totalTypedHexCount >= nextMetadata.systemCount
            ? "surveyed"
            : "mapped";
    }
  } else {
    // Sector-level operation; replace metadata as before.
    nextMetadata.occupiedHexes = Array.from(newOccupied);
    nextMetadata.hexStarTypes = newHexStarTypes;
    nextMetadata.systemCount = Array.from(newOccupied).length;
    const totalTypedHexCount = Object.keys(newHexStarTypes).length;
    nextMetadata.explorationStatus =
      nextMetadata.systemCount <= 0
        ? "unexplored"
        : totalTypedHexCount >= nextMetadata.systemCount
          ? "surveyed"
          : "mapped";
  }

  if (!preserveLastGeneratedAt || !existingMetadata.hexPresenceGeneratedAt) {
    nextMetadata.hexPresenceGeneratedAt = new Date().toISOString();
  }

  return nextMetadata;
}

function buildGeneratedStarsForHex({ primary = null, anomalyType = null, existingGeneratedStars = [] } = {}) {
  return buildGeneratedStars({
    primary,
    anomalyType,
    existingGeneratedStars,
    fallbackStarType: "G2V",
  }).map((star) => ({ ...star }));
}

function resolveSurveySeedSpectralType(value) {
  const raw = normalizeStarTypeValue(value, "");
  const match = raw.match(/[OBAFGKM]/i);
  return match ? match[0].toUpperCase() : undefined;
}

function buildSurveyGeneratedStars({ saved = null, anomalyType = null, fallbackStarType = "G2V" } = {}) {
  const existingGeneratedStars = Array.isArray(saved?.generatedStars) ? saved.generatedStars : [];
  if (existingGeneratedStars.length) {
    return buildGeneratedStarsForHex({ existingGeneratedStars });
  }

  if (anomalyType) {
    return buildGeneratedStarsForHex({ anomalyType });
  }

  return generateMultipleStarSystemWbh({
    spectralType: resolveSurveySeedSpectralType(saved?.starType || fallbackStarType),
    maxStars: 3,
  })
    .slice(0, 3)
    .map((star) => ({ ...star }));
}

function buildGeneratedSystemHexFromSurveyHex(hex, existingTypes = activeSectorMetadata.value?.hexStarTypes ?? {}) {
  const normalizedHex = normalizeHexToSectorCoord(hex);
  const coord = String(normalizedHex?.coord || "").trim();
  if (!coord) {
    return null;
  }

  const saved = existingTypes[coord] ?? {};
  const anomalyType = saved?.anomalyType ?? null;
  const generatedStars = buildSurveyGeneratedStars({
    saved,
    anomalyType,
    fallbackStarType: saved?.starType || "G2V",
  });
  const { primaryDesignation, primaryCode, secondaryStars } = summarizeGeneratedStars(generatedStars);
  const starType = normalizeStarTypeValue(saved?.starType, primaryDesignation || "G2V");

  return {
    coord,
    hasSystem: true,
    presenceOnly: false,
    starType,
    starClass: String(saved?.starClass || spectralClassToCssClass(primaryDesignation || primaryCode || starType)),
    secondaryStars:
      Array.isArray(saved?.secondaryStars) && saved.secondaryStars.length ? [...saved.secondaryStars] : secondaryStars,
    generatedStars,
    anomalyType,
  };
}

function systemCoordFromRecord(system) {
  const x = Number(system?.hexCoordinates?.x ?? 0);
  const y = Number(system?.hexCoordinates?.y ?? 0);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) {
    return "";
  }
  return hexCoord(Math.trunc(x), Math.trunc(y));
}

async function replaceGeneratedSystemsForScope(sectorId, scopeHexes) {
  if (!props.galaxyId || !sectorId) {
    return { systemCount: 0, worldCount: 0 };
  }

  const persistedSystems = await getSystemsBySectorStrict(sectorId);
  const nonTargetSystems = systemStore.systems.filter((system) => String(system?.sectorId) !== String(sectorId));
  systemStore.systems = nonTargetSystems.concat(persistedSystems);

  const scopeCoords = new Set(
    (Array.isArray(scopeHexes) ? scopeHexes : [])
      .map((hex) => normalizeHexToSectorCoord(hex))
      .map((hex) => String(hex?.coord || "").trim())
      .filter(Boolean),
  );

  const retainedSystems = persistedSystems.filter((system) => !scopeCoords.has(systemCoordFromRecord(system)));
  const generatedSystems = (Array.isArray(scopeHexes) ? scopeHexes : [])
    .map((hex) => normalizeHexToSectorCoord(hex))
    .filter((hex) => hex?.hasSystem && !hex?.presenceOnly && hex?.starType)
    .map((hex) => {
      const generatedSystem = buildPersistedSurveySystemFromHex({
        galaxyId: props.galaxyId,
        sectorId,
        hex,
        namingOptions: {
          worldNameMode: preferencesStore.worldNameMode,
          asteroidBeltNameMode: preferencesStore.asteroidBeltNameMode,
          galaxyMythicTheme: preferencesStore.galaxyMythicTheme,
        },
      });

      Object.assign(hex, buildSystemHexSummary(generatedSystem));
      return generatedSystem;
    });

  const persisted = await replaceSystemsForSectorStrict(sectorId, retainedSystems.concat(generatedSystems));
  const otherSystems = systemStore.systems.filter((system) => String(system?.sectorId) !== String(sectorId));
  systemStore.systems = otherSystems.concat(persisted);

  return {
    systemCount: generatedSystems.length,
    worldCount: generatedSystems.reduce(
      (total, system) => total + (Array.isArray(system?.planets) ? system.planets.length : 0),
      0,
    ),
  };
}

async function upsertGeneratedSystemsForScope(sectorId, scopeHexes) {
  if (!props.galaxyId || !sectorId) {
    return { systemCount: 0, worldCount: 0 };
  }

  const generatedSystems = (Array.isArray(scopeHexes) ? scopeHexes : [])
    .map((hex) => normalizeHexToSectorCoord(hex))
    .filter((hex) => hex?.hasSystem && !hex?.presenceOnly && hex?.starType)
    .map((hex) =>
      buildPersistedSurveySystemFromHex({
        galaxyId: props.galaxyId,
        sectorId,
        hex,
        namingOptions: {
          worldNameMode: preferencesStore.worldNameMode,
          asteroidBeltNameMode: preferencesStore.asteroidBeltNameMode,
          galaxyMythicTheme: preferencesStore.galaxyMythicTheme,
        },
      }),
    );

  setGenerationStatus(
    `Preparing ${generatedSystems.length.toLocaleString()} system(s) for sector ${sectorId}${generatedSystems[0]?.hexCoordinates ? ` starting at ${String(generatedSystems[0].hexCoordinates.x).padStart(2, "0")}${String(generatedSystems[0].hexCoordinates.y).padStart(2, "0")}` : ""}.`,
    "info",
  );

  if (!generatedSystems.length) {
    setGenerationStatus(`No valid systems were assembled for sector ${sectorId}.`, "error");
    throw new Error("No valid systems were available to generate for the current scope.");
  }

  const persistedSystems = [];
  for (const system of generatedSystems) {
    try {
      const persisted = await upsertSystemStrict(system);
      persistedSystems.push(persisted);
      setGenerationStatus(
        `Saved ${persistedSystems.length.toLocaleString()} of ${generatedSystems.length.toLocaleString()} system(s). Latest: ${persisted.systemId}.`,
        "info",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "Unknown error");
      setGenerationStatus(`Failed while saving ${system.systemId}: ${message}`, "error");
      throw new Error(`Failed to save system ${system.systemId}: ${message}`);
    }
  }

  const otherSystems = systemStore.systems.filter((system) => String(system?.sectorId) !== String(sectorId));
  systemStore.systems = otherSystems.concat(persistedSystems);
  const reloadedSectorSystems = await getSystemsBySectorStrict(sectorId);
  const retained = systemStore.systems.filter((system) => String(system?.sectorId) !== String(sectorId));
  systemStore.systems = retained.concat(reloadedSectorSystems);
  setGenerationStatus(
    `Persisted ${generatedSystems.length.toLocaleString()} system(s) for sector ${sectorId}.`,
    "success",
  );

  return {
    systemCount: generatedSystems.length,
    worldCount: generatedSystems.reduce(
      (total, system) => total + (Array.isArray(system?.planets) ? system.planets.length : 0),
      0,
    ),
  };
}

function buildSurveyPreviewState({
  previewScope = currentViewMode.value !== "subsector" && scope.value === "subsector" ? "sector" : scope.value,
  sectorId,
  name,
  cols = 32,
  rows = 40,
  hexes = [],
  metadata = null,
}) {
  const activeSectorId = String(sectorId || generatedSector.value?.sectorId || selectedSectorId.value || "");
  const systems = systemStore.systems.filter((system) => String(system?.sectorId || "") === activeSectorId);
  const inferredLayout = metadata ? inferGridDimensions({ metadata }) : null;
  const useSectorLayoutInSubsectorView = previewScope === "subsector" && inferredLayout?.scope === "sector";
  const resolvedCols = useSectorLayoutInSubsectorView ? 32 : Number(cols || inferredLayout?.cols || 32);
  const resolvedRows = useSectorLayoutInSubsectorView ? 40 : Number(rows || inferredLayout?.rows || 40);
  const resolvedPreviewScope = useSectorLayoutInSubsectorView ? "sector" : previewScope;
  const resolvedHexes =
    metadata && systems.length
      ? buildPreviewHexesFromSectorData({
          metadata,
          systems,
          previewScope: resolvedPreviewScope,
          cols: resolvedCols,
          rows: resolvedRows,
          fallbackHexes: hexes,
        })
      : Array.isArray(hexes)
        ? hexes
        : [];

  return buildSectorSurveyRebuiltPreview({
    previewScope: resolvedPreviewScope,
    sectorId,
    name,
    density: density.value,
    occupancyRealism: occupancyRealism.value,
    cols: resolvedCols,
    rows: resolvedRows,
    hexes: resolvedHexes,
    metadata,
    systems,
  });
}

function resolvePreviewScope() {
  return currentViewMode.value !== "subsector" && scope.value === "subsector" ? "sector" : scope.value;
}

function resolvePreviewDimensions(previewScope) {
  return previewScope === "sector" ? { cols: 32, rows: 40 } : { cols: 8, rows: 10 };
}

async function resolveCurrentSectorRecord() {
  const fallbackSectorId = String(selectedSectorId.value || generatedSector.value?.sectorId || "").trim();
  if (!fallbackSectorId) {
    return null;
  }

  const existing = sectorStore.sectors.find((entry) => entry.sectorId === fallbackSectorId) ?? activeSectorRecord.value;
  if (existing) {
    return existing;
  }

  try {
    const sector = await sectorApi.getSector(fallbackSectorId);
    const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === sector.sectorId);
    if (sectorIndex >= 0) {
      sectorStore.sectors[sectorIndex] = sector;
    } else {
      sectorStore.sectors.unshift(sector);
    }
    selectedSectorId.value = sector.sectorId;
    sectorStore.setCurrentSector(sector.sectorId);
    return sector;
  } catch {
    return null;
  }
}

async function rebuildActiveSectorPreview({ forceReloadSystems = false, forceReloadSector = false } = {}) {
  const resolvedSector = await resolveCurrentSectorRecord();
  const sectorId = String(resolvedSector?.sectorId || selectedSectorId.value || generatedSector.value?.sectorId || "");
  if (!sectorId) {
    return;
  }

  if (forceReloadSystems && props.galaxyId) {
    await systemStore.loadSystems(props.galaxyId, sectorId);
  }

  let sector = resolvedSector;
  if (forceReloadSector) {
    try {
      const refreshed = await sectorApi.getSector(sectorId);
      if (refreshed) {
        const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === refreshed.sectorId);
        if (sectorIndex >= 0) {
          sectorStore.sectors[sectorIndex] = refreshed;
        } else {
          sectorStore.sectors.unshift(refreshed);
        }
        sector = refreshed;
      }
    } catch {
      sector = activeSectorRecord.value;
    }
  }

  if (!sector) {
    return;
  }

  const previewScope = resolvePreviewScope();
  const { cols, rows } = resolvePreviewDimensions(previewScope);
  const displayName = String(sector?.metadata?.displayName || sectorName.value || sectorId);

  generatedSector.value = buildSurveyPreviewState({
    previewScope,
    sectorId,
    name: displayName,
    cols,
    rows,
    metadata: sector?.metadata ?? null,
  });
  bumpGridRenderNonce();
}

async function selectSubsector(letter) {
  selectedSubsector.value = String(letter || "A")
    .charAt(0)
    .toUpperCase();

  if (!generatedSector.value && !activeSectorRecord.value) {
    return;
  }

  await rebuildActiveSectorPreview();
}

function buildSectorHexesFromMetadata(metadata, cols = 32, rows = 40) {
  return buildPersistedSectorHexesFromMetadata(metadata, { cols, rows });
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
  const payload = buildSectorSurveyCreatePayload({
    galaxyId: props.galaxyId,
    requestedGrid,
    displayName,
    scope: scope.value,
    selectedSubsector: selectedSubsector.value,
    subsectorName: subsectorName.value,
    storedSubsectorNames: getStoredSubsectorNames(activeSectorRecord.value?.metadata),
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
    cols,
    rows,
    isGalacticCenterSector,
    occupancyRealism: occupancyRealism.value,
    createSectorId,
  });

  const persisted = await sectorApi.createSectorStrict(payload);
  const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === persisted.sectorId);
  if (sectorIndex >= 0) {
    sectorStore.sectors[sectorIndex] = persisted;
  } else {
    sectorStore.sectors.unshift(persisted);
  }
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

    // When operating in subsector scope, map local subsector grid coordinates to global sector coords
    let baseCol = 1;
    let baseRow = 1;
    if (scope.value === "subsector") {
      const bounds = getSubsectorViewportBounds(selectedSubsector.value);
      baseCol = Number(bounds.colStart || 1);
      baseRow = Number(bounds.rowStart || 1);
    }

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const globalCol = baseCol + (c - 1);
        const globalRow = baseRow + (r - 1);
        const coord = hexCoord(globalCol, globalRow);
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
          const centerStarMetadata = buildHexStarTypeMetadata({
            anomalyType: centerAnomalyType,
            generatedStars: buildGeneratedStarsForHex({ anomalyType: centerAnomalyType }),
            fallbackStarType: centerAnomalyType,
          });
          hexes.push({
            coord,
            hasSystem: true,
            presenceOnly: false,
            starType: centerStarMetadata.starType,
            starClass: "anomaly-core",
            secondaryStars: centerStarMetadata.secondaryStars,
            generatedStars: centerStarMetadata.generatedStars.map((star) => ({ ...star })),
            anomalyType: centerStarMetadata.anomalyType,
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

    const payload = buildSectorSurveySavePayload({
      existingSector: currentSector,
      existingSectorId: currentSector.sectorId,
      generatedSectorName: String(nextMetadata.displayName || currentSector.sectorId),
      galaxyId: props.galaxyId,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +(rate * 100).toFixed(2),
      nextMetadata,
    });

    const updatedSector = await sectorApi.updateSectorStrict(currentSector.sectorId, payload);
    const updatedSectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === updatedSector.sectorId);
    if (updatedSectorIndex >= 0) {
      sectorStore.sectors[updatedSectorIndex] = updatedSector;
    } else {
      sectorStore.sectors.unshift(updatedSector);
    }

    // Remove any existing persisted systems that fall inside the newly generated presence-area.
    // Passing the generated hexes will result in generatedSystems === [] (presenceOnly true),
    // so replaceGeneratedSystemsForScope will delete any systems at those coords.
    await replaceGeneratedSystemsForScope(currentSector.sectorId, hexes);

    const previewScope = resolvePreviewScope();
    const { cols: previewCols, rows: previewRows } = resolvePreviewDimensions(previewScope);

    generatedSector.value = buildSurveyPreviewState({
      previewScope,
      sectorId: currentSector.sectorId,
      name: String(nextMetadata.displayName || currentSector.sectorId),
      cols: previewCols,
      rows: previewRows,
      hexes,
      metadata: nextMetadata,
    });
    bumpGridRenderNonce();
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

  const currentSector = await resolveCurrentSectorRecord();
  const visibleScopeHexes = Array.isArray(displayedSector.value?.hexes)
    ? displayedSector.value.hexes.filter((hex) => hex?.hasSystem)
    : [];
  if (!currentSector || !visibleScopeHexes.length) {
    await generateSector();
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;
  setGenerationStatus(`Generating systems from presence markers in sector ${currentSector.sectorId}.`, "info");

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const existingTypes = activeSectorMetadata.value?.hexStarTypes ?? {};
    const { isGalacticCenterSector } = getSelectedSectorContext();
    const hexes = visibleScopeHexes
      .map((hex) => {
        if (!hex?.presenceOnly && hex?.starType) {
          return {
            ...hex,
            secondaryStars: Array.isArray(hex?.secondaryStars) ? [...hex.secondaryStars] : [],
            generatedStars: Array.isArray(hex?.generatedStars) ? hex.generatedStars.map((star) => ({ ...star })) : [],
          };
        }

        return buildGeneratedSystemHexFromSurveyHex(hex, existingTypes);
      })
      .filter(Boolean);

    const nextMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount: hexes.length,
      isGalacticCenterSector,
      preserveLastGeneratedAt: true,
    });

    const payload = buildSectorSurveySavePayload({
      existingSector: currentSector,
      existingSectorId: currentSector.sectorId,
      generatedSectorName: String(nextMetadata.displayName || currentSector.sectorId),
      galaxyId: props.galaxyId,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +((DENSITY_RATES[density.value] ?? 0.3) * 100).toFixed(2),
      nextMetadata,
    });

    await sectorStore.updateSector(currentSector.sectorId, payload);

    const persistedSurveyTotals = await upsertGeneratedSystemsForScope(currentSector.sectorId, hexes);
    await rebuildActiveSectorPreview({ forceReloadSystems: true, forceReloadSector: true });
    selectedHex.value = null;
    toastService.success(
      `Systems generated — ${persistedSurveyTotals.systemCount.toLocaleString()} stellar system${persistedSurveyTotals.systemCount !== 1 ? "s" : ""} and ${persistedSurveyTotals.worldCount.toLocaleString()} world profile${persistedSurveyTotals.worldCount !== 1 ? "s" : ""} created.`,
    );
  } catch (err) {
    setGenerationStatus(`Generate systems failed: ${err.message}`, "error");
    toastService.error(`Failed to generate systems: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function generateSystemsFromExistingSurvey() {
  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  const currentSector = await resolveCurrentSectorRecord();
  const scopeHexes = (Array.isArray(displayedSector.value?.hexes) ? displayedSector.value.hexes : [])
    .filter((hex) => hex?.hasSystem && !hex?.presenceOnly && hex?.starType)
    .map((hex) => ({
      ...hex,
      secondaryStars: Array.isArray(hex?.secondaryStars) ? [...hex.secondaryStars] : [],
    }));

  if (!currentSector || !scopeHexes.length) {
    await generateSector();
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;
  setGenerationStatus(`Generating systems from existing survey data in sector ${currentSector.sectorId}.`, "info");

  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const persistedSurveyTotals = await upsertGeneratedSystemsForScope(currentSector.sectorId, scopeHexes);
    await rebuildActiveSectorPreview({ forceReloadSystems: true, forceReloadSector: true });
    selectedHex.value = null;
    toastService.success(
      `Systems generated from existing survey data — ${persistedSurveyTotals.systemCount.toLocaleString()} stellar system${persistedSurveyTotals.systemCount !== 1 ? "s" : ""} and ${persistedSurveyTotals.worldCount.toLocaleString()} world profile${persistedSurveyTotals.worldCount !== 1 ? "s" : ""} created.`,
    );
  } catch (err) {
    setGenerationStatus(`Generate surveyed systems failed: ${err.message}`, "error");
    toastService.error(`Failed to generate systems from existing survey data: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function runSurveyAction() {
  const requestedMode = effectiveGenerationMode.value;
  const modeForTier = tierAwareGenerationMode.value;

  if (modeForTier !== requestedMode) {
    toastService.info(
      `Space tier policy (${currentSectorSpaceTier.value}) adjusted generation mode from ${requestedMode} to ${modeForTier}.`,
    );
  }

  if (modeForTier === "name") {
    await generateSectorNameOnly();
    return;
  }
  if (modeForTier === "name-presence") {
    await generateSectorPresence();
    return;
  }
  if (modeForTier === "presence") {
    await generateSectorPresence();
    return;
  }
  if (scopeTypedHexCount.value > 0 && scopeTypedHexCount.value === scopePresenceCount.value) {
    await generateSystemsFromExistingSurvey();
    return;
  }
  if (scopePresenceCount.value > 0 && scopeTypedHexCount.value < scopePresenceCount.value) {
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

  const payload = buildSectorSurveySavePayload({
    existingSector,
    existingSectorId,
    generatedSectorName: buildGeneratedSectorName(sectorName.value || "sector"),
    requestedGrid,
    galaxyId: props.galaxyId,
    densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
    densityVariation: 0,
    nextMetadata,
    createSectorId,
  });

  try {
    const persisted = existingSector
      ? await sectorStore.updateSector(existingSector.sectorId, payload)
      : await sectorStore.createSector(payload);

    selectedSectorId.value = persisted.sectorId;
    sectorStore.setCurrentSector(persisted.sectorId);
    generatedSector.value = buildSectorSurveySavedPreviewState({
      generatedSector: generatedSector.value,
      persistedSectorId: persisted.sectorId,
      persistedDisplayName: String(persisted?.metadata?.displayName || generatedSector.value?.name || ""),
      density: density.value,
      occupancyRealism: occupancyRealism.value,
    });

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

    const { scope: loadedScope, cols: inferredCols, rows: inferredRows } = inferGridDimensions(sector);
    const renderScope = currentViewMode.value === "sector" ? "sector" : loadedScope;
    const cols = renderScope === "sector" ? 32 : inferredCols;
    const rows = renderScope === "sector" ? 40 : inferredRows;
    const { hexes: baseHexes } = buildHexGridFromSystems(systemStore.systems, cols, rows);

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

      const starType = normalizeStarTypeValue(saved?.starType ?? hex.starType, "");
      return {
        ...hex,
        hasSystem: true,
        // presenceOnly only remains true when there is no star type yet (raw presence marker).
        // Once a star type is known the hex graduates to a full ★ display.
        presenceOnly: !starType,
        starType,
        starClass: saved?.starClass || hex.starClass || spectralClassToCssClass(starType),
        secondaryStars: saved?.secondaryStars ?? hex.secondaryStars ?? [],
        generatedStars: saved?.generatedStars ?? hex.generatedStars ?? [],
        anomalyType: saved?.anomalyType ?? hex.anomalyType ?? null,
      };
    });
    const systemCount = hexes.filter((h) => h.hasSystem).length;

    scope.value = currentViewMode.value;
    density.value = densityFromClass(sector.densityClass);
    occupancyRealism.value = Math.min(2, Math.max(0, Number(sector?.metadata?.occupancyRealism ?? 1)));
    selectedSubsector.value =
      String(sector?.metadata?.subsector || "A")
        .charAt(0)
        .toUpperCase() || "A";
    const loadedDisplayName = String(sector?.metadata?.displayName || sectorId);
    const metadataSubsectorName = getStoredSubsectorName(sector?.metadata, selectedSubsector.value);
    if (currentViewMode.value === "subsector") {
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

    generatedSector.value = buildSurveyPreviewState({
      previewScope: renderScope,
      sectorId: sector.sectorId,
      name: sectorName.value,
      cols,
      rows,
      hexes,
      metadata: sector?.metadata ?? null,
    });
    bumpGridRenderNonce();

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

  const nameUpdate = resolveSectorSurveyNameUpdate({
    sector,
    scope: scope.value,
    sectorName: baseName,
    subsectorName: subsectorName.value,
    selectedSubsector: selectedSubsector.value,
    buildGeneratedSectorName,
    getStoredSubsectorName,
    getStoredSubsectorNames,
    getNormalizedSubsectorLetter,
  });

  if (!nameUpdate.changed) {
    return;
  }

  try {
    const updatedSector = await sectorApi.updateSectorStrict(sector.sectorId, nameUpdate.updatePayload);
    const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === updatedSector.sectorId);
    if (sectorIndex >= 0) {
      sectorStore.sectors[sectorIndex] = updatedSector;
    } else {
      sectorStore.sectors.unshift(updatedSector);
    }

    if (generatedSector.value?.sectorId === updatedSector.sectorId) {
      generatedSector.value = buildSectorSurveySavedPreviewState({
        generatedSector: generatedSector.value,
        persistedSectorId: updatedSector.sectorId,
        persistedDisplayName: nameUpdate.nextDisplayName,
        density: density.value,
        occupancyRealism: occupancyRealism.value,
      });
    }

    if (scope.value === "subsector") {
      sectorName.value = nameUpdate.nextDisplayName.replace(/\s*\/\s*[A-P](?:\s*[-:].*)?$/i, "").trim() || baseName;
      subsectorName.value = nameUpdate.nextSubsectorName || "";
    } else {
      sectorName.value = nameUpdate.nextDisplayName;
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

  const initialSelection = resolveSectorSurveyInitialSelection({
    sectors: sectorStore.sectors,
    currentSectorId: sectorStore.currentSectorId,
    requestedSectorId: route.query.sectorId,
    requestedGrid: getRequestedGridCoordinates(),
    requestedViewport,
  });

  if (initialSelection.mode === "load" && initialSelection.sectorId) {
    selectedSectorId.value = initialSelection.sectorId;
    await loadPersistedSector(initialSelection.sectorId, false);
    if (initialSelection.viewport?.scope) {
      scope.value = initialSelection.viewport.scope;
    }
    if (initialSelection.viewport?.subsector) {
      selectedSubsector.value = initialSelection.viewport.subsector;
    }
    if (initialSelection.viewport?.scope === "subsector" && initialSelection.viewport?.subsectorName) {
      subsectorName.value = initialSelection.viewport.subsectorName;
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
    let baseCol = 1;
    let baseRow = 1;

    if (scope.value === "subsector") {
      const bounds = getSubsectorViewportBounds(selectedSubsector.value);
      baseCol = Number(bounds.colStart || 1);
      baseRow = Number(bounds.rowStart || 1);
    }

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const coord = hexCoord(baseCol + (c - 1), baseRow + (r - 1));

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
          const generatedStars = isCenterHex
            ? buildGeneratedStarsForHex({ anomalyType: centerAnomalyType })
            : buildSurveyGeneratedStars();
          const { primaryDesignation, primaryCode, secondaryStars } = summarizeGeneratedStars(generatedStars);
          const primaryType = normalizeStarTypeValue(primaryDesignation, "G2V");
          hexes.push({
            coord,
            hasSystem: true,
            starType: isCenterHex ? centerAnomalyType : primaryType,
            starClass: isCenterHex
              ? "anomaly-core"
              : spectralClassToCssClass(primaryDesignation || primaryCode || primaryType),
            secondaryStars: isCenterHex ? [] : secondaryStars,
            generatedStars,
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

    const sharedMetadata = buildSharedSectorMetadata({
      hexes,
      systemCount,
      isGalacticCenterSector,
    });

    let finalSectorId;
    const generationMutation = buildSectorSurveyGenerationMutation({
      existingSectorId,
      existingSectorRecord: sectorStore.sectors.find((s) => s.sectorId === existingSectorId) ?? null,
      generatedName,
      requestedGrid: getRequestedGridCoordinates(),
      galaxyId: props.galaxyId,
      densityClass: DENSITY_CLASS_MAP[density.value] ?? 3,
      densityVariation: +(rate * 100).toFixed(2),
      sharedMetadata,
      scope: scope.value,
      selectedSubsector: selectedSubsector.value,
      subsectorName: subsectorName.value,
      createSectorId,
      fallbackCoordinates: {
        x: Math.floor(Math.random() * 1001),
        y: Math.floor(Math.random() * 1001),
      },
    });

    if (generationMutation.mode === "update") {
      const updatedSector = await sectorApi.updateSectorStrict(existingSectorId, generationMutation.payload);
      const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === updatedSector.sectorId);
      if (sectorIndex >= 0) {
        sectorStore.sectors[sectorIndex] = updatedSector;
      } else {
        sectorStore.sectors.unshift(updatedSector);
      }
      finalSectorId = existingSectorId;
    } else {
      const persistedSector = await sectorApi.createSectorStrict(generationMutation.payload);
      const sectorIndex = sectorStore.sectors.findIndex((entry) => entry.sectorId === persistedSector.sectorId);
      if (sectorIndex >= 0) {
        sectorStore.sectors[sectorIndex] = persistedSector;
      } else {
        sectorStore.sectors.unshift(persistedSector);
      }
      finalSectorId = persistedSector.sectorId;
      selectedSectorId.value = finalSectorId;
      sectorStore.setCurrentSector(finalSectorId);
    }

    await sectorApi.getSectorStrict(finalSectorId);

    const persistedSurveyTotals = await replaceGeneratedSystemsForScope(finalSectorId, hexes);

    const previewScope = resolvePreviewScope();
    const { cols: previewCols, rows: previewRows } = resolvePreviewDimensions(previewScope);

    generatedSector.value = buildSurveyPreviewState({
      previewScope,
      sectorId: finalSectorId,
      name: generatedName,
      cols: previewCols,
      rows: previewRows,
      hexes,
      metadata: sharedMetadata,
    });
    bumpGridRenderNonce();
    selectedHex.value = null;

    if (existingSectorId) {
      toastService.success(
        `Sector regenerated — ${persistedSurveyTotals.systemCount.toLocaleString()} stellar system${persistedSurveyTotals.systemCount !== 1 ? "s" : ""} and ${persistedSurveyTotals.worldCount.toLocaleString()} world profile${persistedSurveyTotals.worldCount !== 1 ? "s" : ""} created.`,
      );
    } else {
      toastService.success(
        `Sector "${generatedName}" generated with ${persistedSurveyTotals.systemCount.toLocaleString()} stellar system${persistedSurveyTotals.systemCount !== 1 ? "s" : ""} and ${persistedSurveyTotals.worldCount.toLocaleString()} world profile${persistedSurveyTotals.worldCount !== 1 ? "s" : ""}.`,
      );
    }
  } catch (err) {
    toastService.error(`Failed to generate/save sector: ${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function selectHex(hex) {
  setSelectedHexCoord(hex?.coord, { toggle: true, focus: true });
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

async function generateAllSubsectorSystems() {
  if (fullGenerationBlockedByTier.value) {
    toastService.info(fullGenerationBlockedReason.value);
    return;
  }

  if (scopeTypedHexCount.value > 0 && scopeTypedHexCount.value === scopePresenceCount.value) {
    await generateSystemsFromExistingSurvey();
    return;
  }

  if (scopePresenceCount.value > 0) {
    await generateSystemsFromPresence();
    return;
  }

  await generateSector();
}

async function exportSector() {
  if (!generatedSector.value) return;

  try {
    const legacySummary = summarizeLegacyStarMetadata({
      hexes: generatedSector.value?.hexes,
      hexStarTypes: generatedSector.value?.metadata?.hexStarTypes ?? {},
      systems: systemStore.systems.filter(
        (system) => String(system?.sectorId) === String(generatedSector.value?.sectorId),
      ),
    });
    const exportPayload = {
      ...generatedSector.value,
      metadata: {
        ...(generatedSector.value.metadata || {}),
        exportSummary: {
          ...(generatedSector.value.metadata?.exportSummary || {}),
          legacyStarMetadata: legacySummary,
        },
      },
    };
    await exportSectorArchive({
      data: exportPayload,
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

  const normalizedSelectedHex = normalizeHexToSectorCoord(selectedHexData.value ?? { coord: selectedHex.value });
  const persistedHex = String(normalizedSelectedHex?.coord || selectedHex.value || "").trim();
  const persistedSystemId = String(selectedHexData.value?.systemId || "").trim() || undefined;

  const selectedAnomalyType = String(
    selectedHexData.value?.anomalyType || selectedHexData.value?.starType || "",
  ).trim();
  const galaxyAnomaly = galaxyProfile.value?.morphology?.centralAnomaly;
  const galaxyAnomalyType = String(galaxyAnomaly?.type || "").trim();
  const anomalyTypeMatchesGalaxy =
    selectedAnomalyType && galaxyAnomalyType && selectedAnomalyType.toLowerCase() === galaxyAnomalyType.toLowerCase();

  const query = {
    hex: persistedHex,
    star: selectedHexData.value?.starType,
    systemRecordId: persistedSystemId,
    anomaly: selectedAnomalyType || undefined,
    anomalyMass: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.massSolarMasses : undefined,
    anomalyActivity: anomalyTypeMatchesGalaxy ? galaxyAnomaly?.activityIndex : undefined,
    returnTo: serializeReturnRoute(
      buildSectorSurveyReturnRoute({
        currentSurveyRouteName: currentSurveyRouteName.value,
        galaxyId: props.galaxyId ?? "000",
        routeQuery: route.query,
        sectorId: generatedSector.value?.sectorId,
        scope: scope.value,
        selectedSubsector: selectedSubsector.value,
        subsectorName: subsectorName.value,
      }),
    ),
  };

  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: props.galaxyId ?? "000", sectorId: generatedSector.value.sectorId },
    query,
  });
}

async function generateSystemForSelectedHex({ openAfter = false } = {}) {
  if (fullGenerationBlockedByTier.value) {
    toastService.info(fullGenerationBlockedReason.value);
    return;
  }

  if (!props.galaxyId) {
    toastService.error("No galaxy selected. Please create/select a galaxy first.");
    return;
  }

  const hex = selectedHexData.value;
  if (!hex || !hex.coord) {
    toastService.error("No hex selected. Select a surveyed hex first.");
    return;
  }

  let currentSector = await resolveCurrentSectorRecord();
  if (!currentSector) {
    try {
      currentSector = await ensureCurrentSectorRecord({ showToast: true });
    } catch (err) {
      toastService.error(`Failed to prepare sector: ${err?.message || err}`);
      return;
    }
  }

  if (!currentSector) {
    toastService.error("Sector not available; save or generate the parent sector first.");
    return;
  }

  const coord = String(hex.coord || "").trim();
  const hexObj = buildGeneratedSystemHexFromSurveyHex({ ...hex, coord });
  if (!hexObj) {
    toastService.error("Selected hex could not be converted into a generated system.");
    return;
  }

  loadingMode.value = "generate";
  isLoading.value = true;
  setGenerationStatus(`Generating system for hex ${coord} in sector ${currentSector.sectorId}.`, "info");
  try {
    const persistedSurveyTotals = await upsertGeneratedSystemsForScope(currentSector.sectorId, [hexObj]);
    const refreshedSectorRecord =
      sectorStore.sectors.find((entry) => entry.sectorId === currentSector.sectorId) ?? currentSector;
    const previewScope = resolvePreviewScope();
    const { cols: previewCols, rows: previewRows } = resolvePreviewDimensions(previewScope);

    generatedSector.value = buildSurveyPreviewState({
      previewScope,
      sectorId: currentSector.sectorId,
      name: String(refreshedSectorRecord?.metadata?.displayName || sectorName.value || currentSector.sectorId),
      cols: previewCols,
      rows: previewRows,
      metadata: refreshedSectorRecord?.metadata ?? null,
    });
    bumpGridRenderNonce();

    toastService.success(
      `System generated — ${persistedSurveyTotals.systemCount.toLocaleString()} system(s), ${persistedSurveyTotals.worldCount.toLocaleString()} world profile(s) created.`,
    );
    setGenerationStatus(`Generated system for ${coord} in sector ${currentSector.sectorId}.`, "success");

    if (openAfter) {
      proceedToStarSystem();
    }
  } catch (err) {
    setGenerationStatus(`Generate system failed for ${coord}: ${err?.message || err}`, "error");
    toastService.error(`Failed to generate system: ${err?.message || err}`);
  } finally {
    isLoading.value = false;
  }
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

.survey-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.grid-size-toggle {
  display: inline-flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.grid-size-btn {
  min-width: 5.4rem;
}

.survey-option-btn {
  min-width: 0;
  padding: 0.72rem 0.85rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(0, 217, 255, 0.2);
  background: rgba(6, 18, 28, 0.92);
  color: #a9eaf2;
  font-weight: 600;
  line-height: 1.2;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.survey-option-btn:hover {
  background: rgba(0, 217, 255, 0.08);
  border-color: rgba(0, 217, 255, 0.34);
  color: #d7fbff;
}

.survey-option-btn.active {
  background: linear-gradient(180deg, #aaf7ff 0%, #39dfff 100%);
  color: #041018;
  border-color: rgba(170, 247, 255, 0.48);
  box-shadow:
    0 0 0 1px rgba(170, 247, 255, 0.14),
    0 10px 22px rgba(0, 217, 255, 0.16);
}

.survey-action-label {
  min-width: 0;
  color: #d7fbff;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-policy-badge {
  display: grid;
  gap: 0.22rem;
  padding: 0.5rem 0.68rem;
  border-radius: 0.62rem;
  border: 1px solid rgba(125, 210, 245, 0.34);
  background: rgba(9, 23, 37, 0.94);
}

.tier-policy-badge--surveyed {
  border-color: rgba(89, 194, 255, 0.45);
  background: rgba(10, 38, 58, 0.92);
}

.tier-policy-badge--frontier {
  border-color: rgba(112, 212, 143, 0.45);
  background: rgba(11, 39, 28, 0.92);
}

.tier-policy-badge--void {
  border-color: rgba(174, 148, 255, 0.45);
  background: rgba(28, 22, 45, 0.9);
}

.tier-policy-badge__tier {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #dff5ff;
}

.tier-policy-badge__rule {
  font-size: 0.75rem;
  line-height: 1.32;
  color: #b9ccd9;
}

.tier-policy-badge__mode {
  font-size: 0.72rem;
  line-height: 1.3;
  color: #9bc0d6;
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

.survey-progress-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(0, 217, 255, 0.18);
  border-radius: 0.65rem;
  background: rgba(7, 18, 28, 0.88);
}

.survey-progress-bar {
  display: flex;
  width: 100%;
  min-height: 0.8rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
}

.survey-progress-segment {
  min-width: 0;
}

.survey-progress-segment--typed {
  background: linear-gradient(90deg, #34d399 0%, #14b8a6 100%);
}

.survey-progress-segment--presence {
  background: linear-gradient(90deg, #60a5fa 0%, #38bdf8 100%);
}

.survey-progress-segment--empty {
  background: rgba(148, 163, 184, 0.28);
}

.survey-progress-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.survey-progress-pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e6faff;
  font-size: 0.76rem;
  font-weight: 700;
}

.survey-progress-pill--typed {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.28);
}

.survey-progress-pill--presence {
  background: rgba(56, 189, 248, 0.16);
  border-color: rgba(56, 189, 248, 0.28);
}

.survey-progress-pill--empty {
  background: rgba(148, 163, 184, 0.14);
  border-color: rgba(148, 163, 184, 0.24);
}

.survey-progress-pill--total {
  background: rgba(250, 204, 21, 0.12);
  border-color: rgba(250, 204, 21, 0.26);
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

.orbital-preview-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.75rem;
  width: 100%;
}

.orbital-preview-actions .btn {
  flex: 1 1 auto;
  padding: 8px 10px;
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

.stellar-inline-source {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  padding: 0.08rem 0.42rem;
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.12);
  border: 1px solid rgba(0, 217, 255, 0.22);
  color: #c4f8ff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stellar-inline-detail {
  color: #b7d8ea;
  font-family: monospace;
  font-size: 0.88rem;
}

.stellar-inline-hint,
.orbital-preview-hint {
  color: #8fb3c9;
  font-size: 0.8rem;
  line-height: 1.35;
  text-align: center;
}

.stellar-inline-flag {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  background: rgba(210, 124, 70, 0.18);
  border: 1px solid rgba(255, 178, 118, 0.28);
  color: #ffd4ab;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* Subsector Selection Grid */
.subsector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.subsector-nav {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.65rem;
}

.subsector-nav--sidebar {
  margin-top: 0.85rem;
}

.subsector-nav-btn {
  padding: 0.5rem 0.75rem;
}

.subsector-nav-current {
  grid-column: 2;
  grid-row: 2;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 2.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0.55rem;
  background: rgba(0, 217, 255, 0.08);
  border: 1px solid rgba(0, 217, 255, 0.18);
  color: #e7fbff;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.subsector-nav > :nth-child(1) {
  grid-column: 2;
  grid-row: 1;
}

.subsector-nav > :nth-child(2) {
  grid-column: 1;
  grid-row: 2;
}

.subsector-nav > :nth-child(4) {
  grid-column: 3;
  grid-row: 2;
}

.subsector-nav > :nth-child(5) {
  grid-column: 2;
  grid-row: 3;
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

.sector-grid-toolbar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 0.9rem;
}

.sector-grid-toolbar-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.sector-grid-toolbar-group--full {
  grid-column: 1 / -1;
}

.sector-grid-toolbar-label {
  color: rgba(183, 247, 255, 0.72);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.grid-jump-form {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.grid-jump-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
}

.grid-jump-input {
  font-family: monospace;
  letter-spacing: 0.08em;
}

.sector-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.sector-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  min-width: 0;
}

.sector-filter-chip-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  min-height: 1.35rem;
  padding: 0 0.32rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  font-weight: 700;
}

.sector-grid-toolbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.85rem;
  margin-bottom: 0.9rem;
  color: #9fc7d8;
  font-size: 0.8rem;
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

.hex-grid-wrapper:focus {
  outline: 2px solid rgba(0, 217, 255, 0.55);
  outline-offset: 2px;
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

.hex-cell--hovered {
  border-color: rgba(250, 204, 21, 0.65);
  box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.35);
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

.hex-cell--filtered-out {
  opacity: 0.24;
  filter: saturate(0.45);
}

.hex-cell--matched {
  box-shadow: inset 0 0 0 1px rgba(0, 217, 255, 0.22);
}

.hex-cell--anomaly {
  background: radial-gradient(circle at 50% 40%, rgba(176, 108, 255, 0.12), transparent 70%), #12122a;
}

.hex-badge {
  position: absolute;
  top: 0.15rem;
  right: 0.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  min-height: 1rem;
  border-radius: 999px;
  background: rgba(6, 12, 20, 0.82);
  font-size: 0.62rem;
  line-height: 1;
}

.hex-badge--black-hole {
  color: #d8b4fe;
}

.hex-badge--nebula {
  color: #86efac;
}

.hex-badge--pulsar,
.hex-badge--neutron {
  color: #7dd3fc;
}

.hex-badge--anomaly {
  color: #f5b4fc;
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

  .sector-grid-toolbar {
    grid-template-columns: 1fr;
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
