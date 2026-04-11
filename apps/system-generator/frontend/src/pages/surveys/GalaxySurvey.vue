<template>
  <div class="galaxy-survey">
    <LoadingSpinner :isVisible="isLoading" context="galaxy" tone="sync" message="Loading galaxies..." />
    <LoadingSpinner v-bind="galaxyExportOverlayProps" />
    <LoadingSpinner
      :isVisible="importInProgress"
      context="galaxy"
      tone="sync"
      kicker="Archive Relay"
      stateLabel="GALAXY IMPORT"
      title="Galaxy Import In Progress"
      :message="importOverlayMessage"
      barLabel="Reconciling archive with current universe"
      statusCode="GAL-IMPT"
      :diagnostics="importOverlayDiagnostics"
      :ledger="importOverlayLedger"
      :progressCurrent="importProgress"
      :progressTotal="100"
      :progressPercent="importProgress"
      :progressMeta="importOverlayMeta"
    />
    <LoadingSpinner
      :isVisible="generationProgress.active"
      context="galaxy"
      tone="fabrication"
      kicker="Survey Command"
      stateLabel="SECTOR FABRICATION"
      title="Galaxy Generation In Progress"
      :message="generationProgress.label"
      barLabel="Projecting sectors and generation queues"
      statusCode="GAL-FAB"
      :diagnostics="galaxyGenerationDiagnostics"
      :ledger="galaxyGenerationLedger"
      :progressCurrent="generationProgress.current"
      :progressTotal="generationProgress.total"
      :progressPercent="generationProgressPercent"
      :progressMeta="generationProgressEtaLabel"
    />
    <ConfirmDialog
      :isOpen="confirmDialog.isOpen"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirmText="confirmDialog.confirmText"
      @confirm="confirmDeleteGalaxy"
      @cancel="cancelDeleteGalaxy"
    />
    <ConfirmDialog
      :isOpen="sectorGenerateDialog.isOpen"
      :title="sectorGenerateDialog.title"
      :message="sectorGenerateDialog.message"
      :confirmText="sectorGenerateDialog.confirmText"
      @confirm="confirmGenerateSectors"
      @cancel="cancelSectorGenerateConfirm"
    />
    <ConfirmDialog
      :isOpen="fullGalaxyDialog.isOpen"
      :title="fullGalaxyDialog.title"
      :message="fullGalaxyDialog.message"
      :confirmText="fullGalaxyDialog.confirmText"
      @confirm="confirmFullGalaxy"
      @cancel="cancelFullGalaxy"
    />
    <ConfirmDialog
      :isOpen="regenerateDialog.isOpen"
      :title="regenerateDialog.title"
      :message="regenerateDialog.message"
      :confirmText="regenerateDialog.confirmText"
      @confirm="confirmFullRegenerate"
      @cancel="cancelFullRegenerate"
    />
    <ConfirmDialog
      :isOpen="resetDialog.isOpen"
      :title="resetDialog.title"
      :message="resetDialog.message"
      :confirmText="resetDialog.confirmText"
      @confirm="confirmResetGeneratedContent"
      @cancel="cancelResetGeneratedContent"
    />

    <div class="survey-content">
      <!-- Error Message Display -->
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span>{{ errorMessage }}</span>
          <button @click="clearError" class="error-close">✕</button>
        </div>
      </div>

      <div class="galaxy-selector-bar">
        <div class="galaxy-selector-group">
          <label class="galaxy-selector-label" for="galaxy-survey-selector">Active Galaxy</label>
          <select
            id="galaxy-survey-selector"
            v-model="selectedGalaxyId"
            class="galaxy-selector-select"
            :disabled="!galaxies.length"
          >
            <option v-if="!galaxies.length" value="">No galaxies available</option>
            <option v-for="galaxy in galaxies" :key="galaxy.galaxyId" :value="galaxy.galaxyId">
              {{ galaxy.name }} · {{ galaxy.type }}
            </option>
          </select>
        </div>
        <div class="survey-top-actions survey-top-actions--compact">
          <button
            v-if="currentGalaxy"
            type="button"
            class="btn btn-secondary"
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy || isApplyingFullRegenerate"
            @click="regenerateGalaxy"
          >
            🔄 Regenerate
          </button>
          <button v-if="currentGalaxy" type="button" class="btn btn-secondary" @click="exportGalaxy">📤 Export</button>
          <button type="button" class="btn btn-primary" @click="showNewGalaxyForm = true">➕ Create Galaxy</button>
          <button type="button" class="btn btn-secondary" @click="showImportForm = true">📥 Import Galaxy</button>
        </div>
      </div>

      <!-- Selected Galaxy Details -->
      <div v-if="currentGalaxy" class="galaxy-details">
        <div class="details-header">
          <div class="details-header-main">
            <template v-if="isEditingGalaxy">
              <input v-model.trim="galaxyEditForm.name" class="inline-edit-title" type="text" />
            </template>
            <h2 v-else>{{ currentGalaxy.name }}</h2>
          </div>
          <template v-if="isEditingGalaxy">
            <select
              v-model="galaxyEditForm.type"
              class="inline-edit-select inline-edit-badge-select"
              @change="onEditGalaxyTypeChange"
            >
              <option value="Spiral">Spiral</option>
              <option value="Elliptical">Elliptical</option>
              <option value="Lenticular">Lenticular</option>
              <option value="Irregular">Irregular</option>
              <option value="Dwarf">Dwarf</option>
            </select>
          </template>
          <span v-else class="galaxy-type-badge">{{ currentGalaxy.type || "Unknown" }}</span>
        </div>

        <div class="galaxy-parameter-strip">
          <div class="galaxy-parameter-pill">
            <span class="parameter-label">Bulge Radius</span>
            <span class="parameter-value"
              >{{
                isEditingGalaxy ? galaxyEditForm.bulgeRadius : currentGalaxy.morphology?.bulgeRadius || "N/A"
              }}
              pc</span
            >
          </div>
          <div class="galaxy-parameter-pill">
            <span class="parameter-label">Disk Thickness</span>
            <span class="parameter-value"
              >{{
                isEditingGalaxy ? galaxyEditForm.diskThickness : currentGalaxy.morphology?.diskThickness || "N/A"
              }}
              pc</span
            >
          </div>
          <div class="galaxy-parameter-pill">
            <span class="parameter-label">Core Density</span>
            <span class="parameter-value"
              >{{
                (
                  ((isEditingGalaxy ? galaxyEditForm.coreDensity : currentGalaxy.morphology?.coreDensity) ?? 0) * 100
                ).toFixed(1)
              }}%</span
            >
          </div>
          <div class="galaxy-parameter-pill">
            <span class="parameter-label">Status</span>
            <span class="parameter-value">{{ currentGalaxy.metadata?.status || "Active" }}</span>
          </div>
        </div>

        <section v-if="isEditingGalaxy && galaxyEditDeltaRows.length" class="detail-section detail-section--strip">
          <h3>🧪 Draft Delta</h3>
          <div class="draft-delta-panel">
            <div class="draft-delta-grid">
              <div v-for="row in galaxyEditDeltaRows" :key="row.label" class="draft-delta-card">
                <span class="draft-delta-label">{{ row.label }}</span>
                <span class="draft-delta-before">Current {{ row.before }}</span>
                <span class="draft-delta-after">Draft {{ row.after }}</span>
                <span v-if="row.delta" class="draft-delta-shift">{{ row.delta }}</span>
              </div>
            </div>
            <div class="draft-delta-actions">
              <div class="draft-delta-copy">
                Full regenerate applies this draft and clears
                {{ destructiveRegenerateSummary.sectorCount.toLocaleString() }} persisted sector{{
                  destructiveRegenerateSummary.sectorCount === 1 ? "" : "s"
                }}
                and {{ destructiveRegenerateSummary.systemCount.toLocaleString() }} cached system{{
                  destructiveRegenerateSummary.systemCount === 1 ? "" : "s"
                }}
                for this galaxy.
              </div>
              <button class="btn btn-danger" :disabled="isApplyingFullRegenerate" @click="showFullRegenerateConfirm">
                {{ isApplyingFullRegenerate ? "Rebuilding…" : "💥 Full Regenerate" }}
              </button>
            </div>
          </div>
        </section>

        <div class="details-stack">
          <section class="detail-section detail-section--strip">
            <h3>🔬 Galaxy Profile</h3>
            <div class="property-strip">
              <div class="property property-link-row">
                <span class="label">Traveller Atlas:</span>
                <button
                  type="button"
                  class="property-link-chip"
                  :class="hasCurrentGalaxyCoordinates ? 'chip-has-coordinates' : 'chip-missing-coordinates'"
                  :title="mapChipTitle"
                  @click="openUniverseMap"
                >
                  🧭 {{ mapChipLabel }}
                </button>
              </div>
              <div
                v-if="(isEditingGalaxy ? galaxyEditForm.type : currentGalaxy?.type)?.includes('Spiral')"
                class="property"
              >
                <span class="label">Spiral Arms:</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.armCount"
                    class="inline-edit-input"
                    type="number"
                    min="0"
                    max="12"
                  />
                </template>
                <span v-else class="value">{{ currentGalaxy.morphology?.armCount || 0 }}</span>
              </div>
              <div class="property">
                <span class="label">Core Density Factor:</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.coreDensity"
                    class="inline-edit-input"
                    type="number"
                    min="0.01"
                    max="1"
                    step="0.01"
                  />
                </template>
                <span v-else class="value">{{ (currentGalaxy.morphology?.coreDensity * 100).toFixed(1) }}%</span>
              </div>
              <div class="property">
                <span class="label">Central Anomaly:</span>
                <template v-if="isEditingGalaxy">
                  <select v-model="galaxyEditForm.centralAnomalyType" class="inline-edit-select">
                    <option value="Black Hole">Black Hole</option>
                    <option value="Pulsar">Pulsar</option>
                    <option value="Neutron Star">Neutron Star</option>
                    <option value="Quasar Remnant">Quasar Remnant</option>
                    <option value="Dense Cluster">Dense Cluster</option>
                  </select>
                </template>
                <span v-else class="value">{{ currentGalaxy.morphology?.centralAnomaly?.type || "Black Hole" }}</span>
              </div>
              <div class="property">
                <span class="label">Anomaly Mass (M☉):</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.centralAnomalyMassSolar"
                    class="inline-edit-input"
                    type="number"
                    min="1"
                    step="1"
                  />
                </template>
                <span v-else class="value"
                  >{{ formatNumber(currentGalaxy.morphology?.centralAnomaly?.massSolarMasses || 0) }} M☉</span
                >
              </div>
              <div class="property">
                <span class="label">Activity Index:</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.centralAnomalyActivity"
                    class="inline-edit-input"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </template>
                <span v-else class="value">{{
                  (currentGalaxy.morphology?.centralAnomaly?.activityIndex ?? 0).toFixed(2)
                }}</span>
              </div>
            </div>
          </section>

          <section class="detail-section detail-section--strip">
            <h3>🗺️ Sector Statistics</h3>
            <div class="property-strip">
              <div class="property">
                <span class="label">Total Sectors:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.totalSectors) }}</span>
              </div>
              <div class="property">
                <span class="label">Sectors Populated:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.populatedSectors) }}</span>
              </div>
              <div class="property">
                <span class="label">Sectors Empty:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.emptySectors) }}</span>
              </div>
              <div class="property">
                <span class="label">Presence Generated:</span>
                <span class="value">{{ sectorGenerationCoverageLabel }}</span>
              </div>
              <div class="property">
                <span class="label">Total Stellar Objects:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.totalObjects) }}</span>
              </div>
              <div class="property">
                <span class="label">Avg Objects / Sector:</span>
                <span class="value">{{ currentGalaxySectorStats.avgObjectsPerSector.toFixed(1) }}</span>
              </div>
              <div v-if="currentGalaxySectorStats.legacyReconstructedCount" class="property">
                <span class="label">Legacy Trees:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.legacyReconstructedCount) }}</span>
              </div>
              <div v-if="currentGalaxySectorStats.legacyHierarchyUnknownCount" class="property">
                <span class="label">Inferred Links:</span>
                <span class="value">{{ formatNumber(currentGalaxySectorStats.legacyHierarchyUnknownCount) }}</span>
              </div>
              <div class="property property-link-row">
                <span class="label">Stats Status:</span>
                <button
                  type="button"
                  class="property-link-chip"
                  :disabled="isRefreshingSectorStats"
                  @click="loadCurrentGalaxySectorStats({ force: true })"
                >
                  {{ isRefreshingSectorStats ? "Refreshing..." : "Refresh Statistics" }}
                </button>
              </div>
            </div>
          </section>

          <GalaxySurveyOperationsPanel
            :generationPlannerSummary="generationPlannerSummary"
            :generationGuidance="generationGuidance"
            :isGeneratingSectors="isGeneratingSectors"
            :isGeneratingFullGalaxy="isGeneratingFullGalaxy"
            :isApplyingSectorReset="isApplyingSectorReset"
            :hasGalaxySectors="Boolean(currentGalaxySectors.length)"
            :selectedSectorName="selectedGalaxyMapTile?.displayName || ''"
            :selectedSectorId="selectedGalaxyMapSectorRecord?.sectorId || ''"
            :currentGalaxyHistory="currentGalaxyHistory"
            @guided-generate="runGuidedGenerationStepAction"
            @request-reset="requestResetGeneratedContent"
          />

          <!-- Metadata -->
          <section class="detail-section detail-section--strip">
            <h3>📋 Metadata</h3>
            <div class="property-strip">
              <div class="property">
                <span class="label">Created:</span>
                <span class="value">{{ new Date(currentGalaxy.metadata?.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="property">
                <span class="label">Last Modified:</span>
                <span class="value">{{ new Date(currentGalaxy.metadata?.lastModified).toLocaleDateString() }}</span>
              </div>
              <div class="property">
                <span class="label">Status:</span>
                <span class="value">{{ currentGalaxy.metadata?.status || "Active" }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Galaxy Sector Density Map -->
        <div v-if="galaxyMapPreview" class="galaxy-density-map-wrapper">
          <h3>🌌 Sector Density Map</h3>
          <p class="density-map-hint">
            Each tile = one sector (32×40 pc). Color = stellar density — dark = sparse, bright = dense.
            <template v-if="currentGalaxy.type?.includes('Spiral')">
              Elevated arm-shaped zones show the spiral structure.
            </template>
            <template v-else-if="currentGalaxy.type === 'Irregular'">
              Irregular galaxies have uneven, patchy density — no arms.
            </template>
            <template v-else-if="currentGalaxy.type === 'Elliptical'">
              Elliptical galaxies fade smoothly outward — no arms.
            </template>
          </p>
          <p v-if="galaxyMapPreview.scaleLabel" class="density-map-scale">{{ galaxyMapPreview.scaleLabel }}</p>
          <div class="density-map-toolbar">
            <span class="density-map-toolbar-label">Map Zoom</span>
            <div class="density-map-zoom-toggle" role="group" aria-label="Galaxy density map zoom">
              <button
                v-for="option in galaxyMapZoomOptions"
                :key="option.id"
                type="button"
                class="density-map-zoom-btn"
                :class="{ active: galaxyMapZoomLevel === option.id }"
                @click="galaxyMapZoomLevel = option.id"
              >
                {{ option.label }}
              </button>
            </div>
            <span class="density-map-toolbar-label">Overlay</span>
            <div class="density-map-zoom-toggle" role="group" aria-label="Galaxy density map overlay mode">
              <button
                v-for="option in galaxyMapOverlayOptions"
                :key="option.id"
                type="button"
                class="density-map-zoom-btn"
                :class="{ active: galaxyMapOverlayMode === option.id }"
                @click="galaxyMapOverlayMode = option.id"
              >
                {{ option.label }}
              </button>
            </div>
            <select
              v-model="galaxyMapStatusFilter"
              class="density-map-filter-select"
              aria-label="Galaxy map status filter"
            >
              <option v-for="option in galaxyMapStatusFilterOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
            <select v-model="galaxyMapRingFilter" class="density-map-filter-select" aria-label="Galaxy map ring filter">
              <option v-for="option in galaxyMapRingFilterOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
            <span class="density-map-toolbar-meta">{{ galaxyMapVisibleTileCount.toLocaleString() }} tiles in view</span>
            <div class="density-map-search">
              <input
                v-model.trim="galaxyMapSearch"
                class="density-map-search-input"
                type="search"
                placeholder="Search sector id, name, or grid"
              />
            </div>
          </div>
          <div v-if="galaxyMapFrontierBanner" class="frontier-banner">
            <div class="frontier-banner-copy">
              <span class="frontier-banner-kicker">Frontier</span>
              <strong>{{ galaxyMapFrontierBanner.title }}</strong>
              <p>{{ galaxyMapFrontierBanner.body }}</p>
            </div>
            <div class="frontier-banner-meta">
              Ring {{ galaxyMapFrontierBanner.ring }} · {{ galaxyMapFrontierBanner.mode || "review" }}
            </div>
            <div class="frontier-banner-actions">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="focusGalaxyMapRing(galaxyMapFrontierBanner.ring)"
              >
                Focus Ring
              </button>
              <button
                type="button"
                class="btn btn-info btn-sm"
                :disabled="isGeneratingSectors || isGeneratingFullGalaxy || !generationGuidance.nextPresenceRing"
                @click="runGuidedGenerationStepAction({ mode: 'presence' })"
              >
                Run Presence
              </button>
              <button
                type="button"
                class="btn btn-info btn-sm"
                :disabled="isGeneratingSectors || isGeneratingFullGalaxy || !generationGuidance.nextSystemsRing"
                @click="runGuidedGenerationStepAction({ mode: 'systems' })"
              >
                Run Systems
              </button>
            </div>
          </div>
          <div class="density-map-container">
            <svg
              class="density-map-svg"
              :class="{
                pannable: galaxyMapPreview.canPan,
                dragging: galaxyMapPanState.isDragging,
              }"
              @wheel.prevent="handleGalaxyMapWheel"
              @pointerdown="beginGalaxyMapPan"
              @pointermove="updateGalaxyMapPan"
              @pointerup="endGalaxyMapPan"
              @pointercancel="endGalaxyMapPan"
              :viewBox="galaxyMapPreview.viewBox"
              :width="galaxyMapPreview.svgSize"
              :height="galaxyMapPreview.svgSize"
            >
              <rect x="0" y="0" :width="galaxyMapPreview.svgSize" :height="galaxyMapPreview.svgSize" fill="#020209" />
              <rect
                v-for="tile in galaxyMapRenderedTiles"
                :key="tile.id"
                :x="tile.px - galaxyMapPreview.renderTileHalf"
                :y="tile.py - galaxyMapPreview.renderTileHalf"
                :width="galaxyMapPreview.renderTileSize"
                :height="galaxyMapPreview.renderTileSize"
                :fill="tile.renderFill"
                :opacity="tile.renderOpacity"
                class="density-map-tile"
                :class="{
                  'density-map-tile--active': selectedGalaxyMapTileId === tile.id,
                  'density-map-tile--persisted': tile.persisted,
                  'density-map-tile--dimmed': !tile.matchesFilter,
                  'density-map-tile--frontier': tile.isFrontierRing,
                }"
                rx="1"
                ry="1"
                @click="selectGalaxyMapTile(tile)"
              >
                <title>{{ tile.tooltip }}</title>
              </rect>
              <line
                :x1="galaxyMapPreview.centerPx - 8"
                :y1="galaxyMapPreview.centerPy"
                :x2="galaxyMapPreview.centerPx + 8"
                :y2="galaxyMapPreview.centerPy"
                stroke="#f0a020"
                stroke-width="1.5"
                opacity="0.8"
              />
              <line
                :x1="galaxyMapPreview.centerPx"
                :y1="galaxyMapPreview.centerPy - 8"
                :x2="galaxyMapPreview.centerPx"
                :y2="galaxyMapPreview.centerPy + 8"
                stroke="#f0a020"
                stroke-width="1.5"
                opacity="0.8"
              />
            </svg>
            <p class="density-map-gesture-hint">
              Scroll to zoom toward or away from the galactic center. Drag while zoomed in to pan across the map.
            </p>
            <div class="density-legend">
              <span class="legend-label">Legend</span>
              <div class="legend-swatches">
                <div
                  v-for="entry in galaxyMapLegendEntries"
                  :key="entry.label"
                  class="legend-swatch"
                  :style="{ background: entry.color }"
                  :title="entry.label"
                />
              </div>
              <span class="legend-label">{{ galaxyMapLegendEntries.map((entry) => entry.label).join(" · ") }}</span>
            </div>
            <div v-if="galaxySectorSearchResults.length" class="density-map-search-results">
              <button
                v-for="tile in galaxySectorSearchResults"
                :key="tile.id"
                type="button"
                class="density-map-search-result"
                @click="focusGalaxyMapTile(tile.id, { zoom: true })"
              >
                <span class="density-map-search-result-name">{{ tile.displayName }}</span>
                <span class="density-map-search-result-meta">
                  {{ tile.sectorId }} · grid {{ formatTileGrid(tile.gridX, tile.gridY) }} · density {{ tile.dc }}
                </span>
              </button>
            </div>
            <GalaxySurveyMapInspector
              :selectedTile="selectedGalaxyMapTile"
              :ringTileCount="selectedGalaxyMapRingTiles.length"
              :ringPersistedSectors="selectedGalaxyMapRingPersistedSectors"
              :isGeneratingSectors="isGeneratingSectors"
              :isGeneratingFullGalaxy="isGeneratingFullGalaxy"
              :isApplyingSectorReset="isApplyingSectorReset"
              @open-sector-survey="jumpToSectorSurvey"
              @generate-ring="generateSelectedRing"
              @request-reset="requestResetGeneratedContent"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="proceedToClass0" class="btn btn-primary">🔍 Sector Survey →</button>
          <button @click="proceedToSubsectorSurvey" class="btn btn-secondary">🧭 Subsector Survey →</button>
          <select
            v-model="galaxySurveyGenerationMode"
            class="generation-mode-select"
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy"
            :title="currentGalaxyGenerateTitle"
          >
            <option value="names">A. Name all sectors</option>
            <option value="presence">B. Name all sectors and roll system presence</option>
            <option value="systems">C. Name all sectors and generate systems</option>
            <option value="center">D. Generate center sector systems</option>
            <option value="expand">E. Expand outward from center</option>
          </select>
          <button
            @click="showSectorGenerateConfirm"
            class="btn btn-info"
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy"
            :title="currentGalaxyGenerateTitle"
          >
            {{ isGeneratingSectors || isGeneratingFullGalaxy ? "Generating…" : currentGalaxyGenerateLabel }}
          </button>
          <button v-if="isEditingGalaxy" @click="rerollGalaxyDraft" class="btn btn-secondary">🎲 Reroll Draft</button>
          <button v-if="isEditingGalaxy" @click="saveGalaxyEdits" class="btn btn-primary">💾 Save Galaxy</button>
          <button v-if="isEditingGalaxy" @click="cancelGalaxyEdits" class="btn btn-secondary">↩ Cancel Edit</button>
          <button v-else @click="editGalaxy" class="btn btn-secondary">✏️ Edit Galaxy</button>
          <button @click="showDeleteConfirm" class="btn btn-danger">🗑️ Delete Galaxy</button>
        </div>
        <div v-if="generationProgress.active" class="generation-progress">
          <div class="generation-progress-header">
            <span>{{ generationProgress.label }}</span>
            <span
              >{{ generationProgress.current.toLocaleString() }} / {{ generationProgress.total.toLocaleString() }}</span
            >
            <span>{{ generationProgressEtaLabel }}</span>
          </div>
          <div class="generation-progress-actions">
            <span v-if="generationCancelRequested" class="generation-progress-cancel-note">{{
              generationCancelMessage
            }}</span>
            <button
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="generationCancelRequested"
              @click="requestGenerationCancel()"
            >
              {{ generationCancelRequested ? "Cancel Requested" : "Cancel After Current Sector" }}
            </button>
          </div>
          <div class="progress-bar generation-progress-bar">
            <div class="progress-fill" :style="{ width: generationProgressPercent + '%' }">
              {{ generationProgressPercent }}%
            </div>
          </div>
        </div>
      </div>

      <!-- New Galaxy Form (Modal) -->
      <div v-if="showNewGalaxyForm" class="modal-overlay" @click="showNewGalaxyForm = false">
        <div class="modal-content modal-content--create" @click.stop>
          <h2>Create New Galaxy</h2>
          <form @submit.prevent="createNewGalaxy">
            <div class="create-galaxy-layout">
              <div class="create-galaxy-main">
                <div class="form-group">
                  <label>Galaxy Name:</label>
                  <div class="name-input-row">
                    <input v-model="newGalaxyForm.name" required />
                    <button type="button" class="btn btn-secondary" @click="randomizeGalaxyName">🎲 Random Name</button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Universe Placement:</label>
                  <select v-model="newGalaxyForm.placementMode">
                    <option value="clustered">Clustered (near existing galaxies)</option>
                    <option value="random">Random (within bounds)</option>
                    <option value="manual">Manual coordinates</option>
                  </select>
                </div>
                <div class="form-group" v-if="newGalaxyForm.placementMode === 'manual'">
                  <label>Universe Coordinates (X, Y):</label>
                  <div class="coord-input-row">
                    <input
                      v-model.number="newGalaxyForm.coordinatesX"
                      type="number"
                      :min="universeBoundsRange.minX"
                      :max="universeBoundsRange.maxX"
                      step="1"
                    />
                    <input
                      v-model.number="newGalaxyForm.coordinatesY"
                      type="number"
                      :min="universeBoundsRange.minY"
                      :max="universeBoundsRange.maxY"
                      step="1"
                    />
                    <button type="button" class="btn btn-secondary" @click="rollManualCoordinates">🎲</button>
                  </div>
                  <div class="field-hint">
                    Allowed range: X {{ universeBoundsRange.minX }}..{{ universeBoundsRange.maxX }}, Y
                    {{ universeBoundsRange.minY }}..{{ universeBoundsRange.maxY }}
                  </div>
                </div>
                <div class="form-group" v-if="newGalaxyForm.placementMode === 'clustered'">
                  <label>Clustered Placement Tuning:</label>
                  <div class="preset-row">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      @click="applyClusterPreset(newGalaxyForm, 'loose')"
                    >
                      Loose
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      @click="applyClusterPreset(newGalaxyForm, 'local-group')"
                    >
                      Local Group
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      @click="applyClusterPreset(newGalaxyForm, 'tight')"
                    >
                      Tight
                    </button>
                  </div>
                  <div class="coord-input-row">
                    <input
                      v-model.number="newGalaxyForm.clusterMinSeparation"
                      type="number"
                      min="4"
                      max="200"
                      step="1"
                      title="Minimum separation in diameters"
                    />
                    <input
                      v-model.number="newGalaxyForm.clusterMaxSeparation"
                      type="number"
                      min="4"
                      max="300"
                      step="1"
                      title="Maximum separation in diameters"
                    />
                    <input
                      v-model.number="newGalaxyForm.clusterClearance"
                      type="number"
                      min="1"
                      max="200"
                      step="0.5"
                      title="Clearance in diameters"
                    />
                    <input
                      v-model.number="newGalaxyForm.clusterSlotsPerRing"
                      type="number"
                      min="4"
                      max="128"
                      step="1"
                      title="Clockwise slots per ring"
                    />
                  </div>
                  <div class="field-hint">min sep, max sep, clearance, slots/ring</div>
                  <label>Placement Seed (optional):</label>
                  <input v-model.trim="newGalaxyForm.placementSeed" placeholder="e.g. local-group-v1" />
                </div>
                <div class="form-group">
                  <label>Galaxy Type:</label>
                  <select v-model="newGalaxyForm.type" @change="onNewGalaxyTypeChange">
                    <option value="Spiral">Spiral</option>
                    <option value="Barred Spiral">Barred Spiral</option>
                    <option value="Elliptical">Elliptical</option>
                    <option value="Lenticular">Lenticular</option>
                    <option value="Irregular">Irregular</option>
                    <option value="Dwarf">Dwarf</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Bulge Radius (parsecs):</label>
                  <input v-model.number="newGalaxyForm.bulgeRadius" type="number" min="5000" max="50000" />
                </div>
                <div
                  v-if="newGalaxyForm.type === 'Spiral' || newGalaxyForm.type === 'Barred Spiral'"
                  class="form-group"
                >
                  <label>Spiral Arms:</label>
                  <input v-model.number="newGalaxyForm.armCount" type="number" min="2" max="12" />
                </div>
                <div class="form-group">
                  <label>Core Density (0-1):</label>
                  <input v-model.number="newGalaxyForm.coreDensity" type="number" min="0.01" max="1" step="0.01" />
                </div>
                <div class="form-group">
                  <label>Disk Thickness (parsecs):</label>
                  <input v-model.number="newGalaxyForm.diskThickness" type="number" min="500" max="10000" />
                </div>
                <div class="form-group">
                  <label>Central Anomaly:</label>
                  <select v-model="newGalaxyForm.centralAnomalyType">
                    <option value="Black Hole">Black Hole</option>
                    <option value="Pulsar">Pulsar</option>
                    <option value="Neutron Star">Neutron Star</option>
                    <option value="Quasar Remnant">Quasar Remnant</option>
                    <option value="Dense Cluster">Dense Cluster</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Anomaly Mass (M☉):</label>
                  <input v-model.number="newGalaxyForm.centralAnomalyMassSolar" type="number" min="1" step="1" />
                </div>
                <div class="form-group">
                  <label>Anomaly Activity (0-1):</label>
                  <input
                    v-model.number="newGalaxyForm.centralAnomalyActivity"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                </div>
              </div>

              <aside class="create-galaxy-side">
                <div class="side-card" v-if="anomalyPreview">
                  <div class="anomaly-preview-title">Computed From Anomaly</div>
                  <div class="anomaly-preview-grid">
                    <div class="anomaly-preview-item">
                      <span class="preview-label">Bulge Radius</span>
                      <span class="preview-value">{{ anomalyPreview.bulgeRadius.toLocaleString() }} pc</span>
                      <span class="preview-delta" :class="deltaClass(anomalyPreviewDeltas?.bulgeRadius)">
                        {{ formatSignedDelta(anomalyPreviewDeltas?.bulgeRadius, 0, " pc") }}
                      </span>
                    </div>
                    <div class="anomaly-preview-item">
                      <span class="preview-label">Disk Thickness</span>
                      <span class="preview-value">{{ anomalyPreview.diskThickness.toLocaleString() }} pc</span>
                      <span class="preview-delta" :class="deltaClass(anomalyPreviewDeltas?.diskThickness)">
                        {{ formatSignedDelta(anomalyPreviewDeltas?.diskThickness, 0, " pc") }}
                      </span>
                    </div>
                    <div class="anomaly-preview-item">
                      <span class="preview-label">Core Density</span>
                      <span class="preview-value">{{ anomalyPreview.coreDensity.toFixed(2) }}</span>
                      <span class="preview-delta" :class="deltaClass(anomalyPreviewDeltas?.coreDensity)">
                        {{ formatSignedDelta(anomalyPreviewDeltas?.coreDensity, 2) }}
                      </span>
                    </div>
                    <div
                      v-if="newGalaxyForm.type === 'Spiral' || newGalaxyForm.type === 'Barred Spiral'"
                      class="anomaly-preview-item"
                    >
                      <span class="preview-label">Spiral Arms</span>
                      <span class="preview-value">{{ anomalyPreview.armCount }}</span>
                      <span class="preview-delta" :class="deltaClass(anomalyPreviewDeltas?.armCount)">
                        {{ formatSignedDelta(anomalyPreviewDeltas?.armCount, 0) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="side-card planning-card">
                  <div class="anomaly-preview-title">Creation Outputs</div>
                  <div class="planning-row">
                    <span>Estimated Diameter</span><strong>{{ draftSizing.diameterKpc }} kpc</strong>
                  </div>
                  <div class="planning-row">
                    <span>Sector Grid Width</span><strong>{{ draftSizing.sectorGridX }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Sector Grid Height</span><strong>{{ draftSizing.sectorGridY }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Sector Grid Total</span><strong>{{ draftSizing.totalSectors.toLocaleString() }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Sector Span</span><strong>{{ draftSizing.footprintLabel }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Placement Spacing Guidance</span><strong>{{ draftSizing.separationRange }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Named Sector Records</span>
                    <strong>{{ draftForecast.populatedSectorsLabel }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Seeded At Creation</span>
                    <strong>{{ draftForecast.estimatedSystemsLabel }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Creation Mapping Time (rough)</span>
                    <strong
                      class="planning-runtime"
                      :class="`planning-runtime--${draftForecast.runtimeSeverity}`"
                      :title="draftForecast.formulaSummary"
                      >{{ draftForecast.estimatedRuntime }}</strong
                    >
                  </div>
                  <div v-if="draftForecast.showRuntimeWarning" class="planning-warning" role="status">
                    ⚠ Heavy sector mapping expected during creation. Consider a smaller galaxy footprint if initial
                    setup feels slow.
                  </div>
                  <div class="field-hint">
                    Creation only maps and names the sector layout, then seeds the center anomaly. Presence and full
                    system generation are available afterward in Galaxy Survey.
                  </div>
                </div>
              </aside>
            </div>

            <div class="form-actions">
              <button type="button" @click="randomizeGalaxyParams" class="btn btn-info">🎲 Randomize</button>
              <button type="button" @click="autoCalculateGalaxyFromAnomaly" class="btn btn-info">
                📐 Auto-Calc From Anomaly
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isCreating">
                {{ isCreating ? "Creating..." : "Create Galaxy" }}
              </button>
              <button type="button" @click="showNewGalaxyForm = false" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Import Galaxy Form (Modal) -->
      <div v-if="showImportForm" class="modal-overlay" @click="handleImportModalDismiss">
        <div class="modal-content" @click.stop>
          <h2>Import Galaxy</h2>
          <form @submit.prevent="importGalaxyData">
            <div class="form-group">
              <label>Select Galaxy File (JSON):</label>
              <input type="file" @change="handleFileSelect" accept=".json" required />
            </div>
            <div class="form-group">
              <label>Import Placement:</label>
              <select v-model="importForm.placementMode">
                <option value="clustered">Auto Clustered</option>
                <option value="manual">Manual Coordinates</option>
                <option value="keep-source">Keep Source Coordinates</option>
              </select>
            </div>
            <div class="form-group" v-if="importForm.placementMode === 'manual'">
              <label>Import Coordinates (X, Y):</label>
              <div class="coord-input-row">
                <input
                  v-model.number="importForm.coordinatesX"
                  type="number"
                  :min="universeBoundsRange.minX"
                  :max="universeBoundsRange.maxX"
                  step="1"
                />
                <input
                  v-model.number="importForm.coordinatesY"
                  type="number"
                  :min="universeBoundsRange.minY"
                  :max="universeBoundsRange.maxY"
                  step="1"
                />
              </div>
            </div>
            <div class="form-group" v-if="importForm.placementMode === 'clustered'">
              <label>Cluster Tuning:</label>
              <div class="preset-row">
                <button type="button" class="btn btn-secondary btn-sm" @click="applyClusterPreset(importForm, 'loose')">
                  Loose
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="applyClusterPreset(importForm, 'local-group')"
                >
                  Local Group
                </button>
                <button type="button" class="btn btn-secondary btn-sm" @click="applyClusterPreset(importForm, 'tight')">
                  Tight
                </button>
              </div>
              <div class="coord-input-row">
                <input v-model.number="importForm.clusterMinSeparation" type="number" min="4" max="200" step="1" />
                <input v-model.number="importForm.clusterMaxSeparation" type="number" min="4" max="300" step="1" />
                <input v-model.number="importForm.clusterClearance" type="number" min="1" max="200" step="0.5" />
                <input v-model.number="importForm.clusterSlotsPerRing" type="number" min="4" max="128" step="1" />
              </div>
              <div class="field-hint">min sep, max sep, clearance, slots/ring</div>
              <label>Placement Seed (optional):</label>
              <input v-model.trim="importForm.placementSeed" placeholder="e.g. imports-v1" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="importInProgress">
                {{ importInProgress ? "Importing..." : "Import Galaxy" }}
              </button>
              <button
                type="button"
                @click="handleImportModalDismiss"
                class="btn btn-secondary"
                :disabled="importInProgress"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { createSectorsBatch, deleteSector, getSectorStats, upsertSector } from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import { buildHexStarTypeMetadata, normalizeHexStarTypeRecord } from "../../utils/systemStarMetadata.js";
import {
  buildGalaxyExportPayload,
  normalizeSectorStats as normalizeGalaxySectorStats,
} from "../../utils/galaxySectorStats.js";
import {
  buildGalaxyCreatePayload,
  buildGalaxyEditPayload,
  buildGalaxyImportRequest,
  buildGalaxySectorStatsPayload,
  canDismissGalaxyImportModal,
  createDefaultGalaxyImportForm,
  resolveGalaxySectorStatsRefresh,
} from "../../utils/galaxySurveyPersistence.js";
import { buildGalaxyGenerationGuidance } from "../../utils/galaxySurveyGenerationGuidance.js";
import { starDescriptorToCssClass } from "../../utils/starDisplay.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import GalaxySurveyOperationsPanel from "../../components/galaxy-survey/GalaxySurveyOperationsPanel.vue";
import GalaxySurveyMapInspector from "../../components/galaxy-survey/GalaxySurveyMapInspector.vue";
import * as toastService from "../../utils/toast.js";
import { generateGalaxyName, generatePhonotacticName } from "../../utils/nameGenerator.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
import {
  isGalaxySurveyGenerationCancelledError,
  useGalaxySurveyGenerationController,
} from "../../composables/useGalaxySurveyGenerationController.js";
import {
  estimateGalaxySectorLayoutCount,
  generateGalaxySectorLayout,
  iterateGalaxySectorLayout,
  iterateGalaxySectorLayoutByRing,
} from "../../utils/sectorLayoutGenerator.js";
import { SUBSECTOR_LETTERS } from "../../utils/subsector.js";
import { generateClusteredUniverseCoordinates } from "../../../../backend/generators/utils/universePlacement.js";

const router = useRouter();
const route = useRoute();
const galaxyStore = useGalaxyStore();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const preferencesStore = usePreferencesStore();

const galaxies = computed(() => galaxyStore.getAllGalaxies);
const currentGalaxy = computed(() => galaxyStore.getCurrentGalaxy);
const currentGalaxySectors = computed(() =>
  sectorStore.sectors.filter(
    (sector) => String(sector?.galaxyId || "") === String(currentGalaxy.value?.galaxyId || ""),
  ),
);
const importInProgress = computed(() => galaxyStore.importInProgress);
const importProgress = computed(() => galaxyStore.importProgress);
const isLoading = computed(() => galaxyStore.isLoading);
const selectedGalaxyId = computed({
  get: () => currentGalaxy.value?.galaxyId || galaxies.value[0]?.galaxyId || "",
  set: (galaxyId) => {
    if (galaxyId) {
      selectGalaxy(galaxyId);
    }
  },
});

const showNewGalaxyForm = ref(false);
const showImportForm = ref(false);
const errorMessage = ref("");
const isCreating = ref(false);
const isEditingGalaxy = ref(false);
const isGeneratingSectors = ref(false);
const isGeneratingFullGalaxy = ref(false);
const isApplyingFullRegenerate = ref(false);
const isApplyingSectorReset = ref(false);
const isRefreshingSectorStats = ref(false);
const GALAXY_SURVEY_VIEW_STORAGE_KEY = "eclipsed-horizons-galaxy-survey-view";
const galaxySurveyGenerationMode = ref("names");
const persistedGalaxySurveyView = loadGalaxySurveyViewState();
const galaxyMapZoomLevel = ref(persistedGalaxySurveyView.zoomLevel);
const galaxyMapOverlayMode = ref(persistedGalaxySurveyView.overlayMode);
const galaxyMapStatusFilter = ref(persistedGalaxySurveyView.statusFilter);
const galaxyMapRingFilter = ref(persistedGalaxySurveyView.ringFilter);
const galaxyMapSearch = ref("");
const selectedGalaxyMapTileId = ref("");
const galaxyMapPan = ref({ x: 0, y: 0 });
const galaxyMapPanState = ref({
  isDragging: false,
  pointerId: null,
  startClientX: 0,
  startClientY: 0,
  startPanX: 0,
  startPanY: 0,
});
const GALAXY_SURVEY_HISTORY_STORAGE_KEY = "eclipsed-horizons-galaxy-survey-history";
const galaxySurveyHistory = ref(loadGalaxySurveyHistory());
const {
  generationProgress,
  generationProgressPercent,
  generationProgressEtaLabel,
  generationCancelRequested,
  generationCancelMessage,
  startGenerationProgress,
  flushGenerationProgressUi,
  updateGenerationProgress,
  resetGenerationProgress,
  beginGenerationRequestScope,
  getGenerationRequestOptions,
  clearGenerationRequestScope,
  requestGenerationCancel,
  assertGenerationNotCancelled,
  focusGalaxyMapRing,
  getRecommendedGenerationRing,
  syncGenerationFrontierSelection,
  runGuidedGenerationStep,
} = useGalaxySurveyGenerationController({
  getGenerationGuidance: () => generationGuidance.value,
  getSelectedGalaxyMapTile: () => selectedGalaxyMapTile.value,
  getGalaxyMapPreview: () => galaxyMapPreview.value,
  focusGalaxyMapTile,
  toastService,
});

const importOverlayPhase = computed(() => {
  const progress = Number(importProgress.value) || 0;
  if (progress >= 100) return "Commit";
  if (progress >= 80) return "Finalizing";
  if (progress >= 30) return "Placement";
  if (progress > 0) return "Validation";
  return "Queued";
});

const importOverlayMessage = computed(() => {
  const phase = importOverlayPhase.value;
  const mode = String(importForm.value.placementMode || "clustered");
  const label =
    mode === "manual" ? "manual coordinates" : mode === "keep-source" ? "source coordinates" : "clustered placement";
  return `${phase} imported galaxy using ${label}...`;
});

const importOverlayMeta = computed(() => `${Math.round(Number(importProgress.value) || 0)}% archived`);

const importOverlayDiagnostics = computed(() => [
  { label: "Phase", value: importOverlayPhase.value },
  { label: "Placement", value: String(importForm.value.placementMode || "clustered") },
  { label: "Progress", value: `${Math.round(Number(importProgress.value) || 0)}%` },
]);

const importOverlayLedger = computed(() => [
  "Galaxy Import",
  importForm.value.fileData?.name || importForm.value.fileData?.galaxyId || "Archive payload staged",
  `${importOverlayPhase.value} phase active`,
]);

const { overlayProps: galaxyExportOverlayProps, exportJson: exportGalaxyArchive } = useArchiveTransfer({
  context: "galaxy",
  noun: "Galaxy",
  title: "Galaxy Export In Progress",
  barLabel: "Packaging galaxy archive for transfer",
  statusPrefix: "GAL",
  targetLabel: () => currentGalaxy.value?.name || currentGalaxy.value?.galaxyId || "Archive target pending",
});

const galaxyGenerationDiagnostics = computed(() => {
  const progress = generationProgress.value;
  return [
    { label: "Stage", value: progress.label || "Queued" },
    { label: "Completion", value: `${generationProgressPercent.value}%` },
    { label: "ETA", value: generationProgressEtaLabel.value.replace("ETA ", "") || "--" },
  ];
});

const galaxyGenerationLedger = computed(() => {
  const progress = generationProgress.value;
  const countLabel =
    progress.total > 0
      ? `${progress.current.toLocaleString()} of ${progress.total.toLocaleString()} sectors processed`
      : "Estimating sector count";
  return ["Galaxy Registry", countLabel, progress.label || "Awaiting generation directive"];
});

const currentGalaxySectorStats = ref(normalizeGalaxySectorStats());

const currentGalaxyGenerateLabel = computed(
  () =>
    ({
      names: "🗺️ Name Sectors",
      presence: "🗺️ Roll Presence",
      systems: "🌌 Generate Galaxy",
      center: "🎯 Generate Center",
      expand: "🌀 Expand Rings",
    })[galaxySurveyGenerationMode.value] || "🗺️ Generate",
);

const currentGalaxyGenerateTitle = computed(
  () =>
    ({
      names: "Name all sectors in the selected galaxy.",
      presence: "Name all sectors and determine system presence in each hex.",
      systems: "Name all sectors and generate systems for every occupied hex in the galaxy.",
      center: "Generate the center sector name and systems only.",
      expand: "Expand from the center ring by ring until a ring contains no systems.",
    })[galaxySurveyGenerationMode.value] || "Generate sectors for this galaxy.",
);

const currentGalaxyLayoutCount = computed(() =>
  currentGalaxy.value ? estimateGalaxySectorLayoutCount(currentGalaxy.value, { scale: "true" }) : 0,
);

const currentGalaxyCachedSystemCount = computed(
  () =>
    systemStore.systems.filter(
      (system) => String(system?.galaxyId || "") === String(currentGalaxy.value?.galaxyId || ""),
    ).length,
);

const generationPlannerSummary = computed(() => {
  const totalLayout = currentGalaxyLayoutCount.value;
  const namedSectors = currentGalaxySectors.value.length;
  const generatedPresence = Number(currentGalaxySectorStats.value.generatedPresenceSectors || 0);
  const avgObjectsPerSector = Number(currentGalaxySectorStats.value.avgObjectsPerSector || 0);
  const mode = galaxySurveyGenerationMode.value;
  let sectorsTouched = totalLayout;
  let actionLabel = "Full layout run";
  let writeProfile = "Upserts sectors in large batches";

  if (mode === "center") {
    sectorsTouched = Math.min(1, totalLayout);
    actionLabel = "Center sector only";
    writeProfile = "Touches the center tile only";
  } else if (mode === "expand") {
    sectorsTouched = Math.max(1, Math.min(totalLayout, Math.max(1, generatedPresence || namedSectors || 1)));
    actionLabel = "Ring expansion from center";
    writeProfile = "Progressively expands until an empty ring is found";
  } else if (mode === "names") {
    actionLabel = "Name missing layout sectors";
    writeProfile = "Writes sector records in chunked batches";
  } else if (mode === "presence") {
    actionLabel = "Roll occupied hex presence";
    writeProfile = "Updates sector metadata and presence markers";
  } else if (mode === "systems") {
    actionLabel = "Generate persisted systems";
    writeProfile = "Writes sector metadata and replaces sector system records";
  }

  const warningMessages = [];
  if (totalLayout > 50000 && mode !== "center") {
    warningMessages.push(
      "Large galaxy footprint detected. Full-galaxy runs can take noticeable time and produce a large number of writes.",
    );
  }
  if (mode === "systems" && generatedPresence === 0 && namedSectors > 0) {
    warningMessages.push(
      "System generation will also seed presence where needed. If you want a lighter pass, run presence first.",
    );
  }
  if (mode === "names" && namedSectors >= totalLayout && totalLayout > 0) {
    warningMessages.push("All layout sectors already have records. This run will mainly normalize naming metadata.");
  }

  const estimatedSectorWrites =
    mode === "names"
      ? Math.max(0, totalLayout - namedSectors) || Math.min(totalLayout, Math.max(1, sectorsTouched))
      : Math.max(1, sectorsTouched);
  const estimatedSystemWrites =
    mode === "names"
      ? 0
      : mode === "center"
        ? Math.max(1, Math.round(avgObjectsPerSector || 1))
        : Math.max(0, Math.round(sectorsTouched * avgObjectsPerSector));
  const estimatedPresenceWrites =
    mode === "systems"
      ? estimatedSectorWrites
      : mode === "presence" || mode === "expand" || mode === "center"
        ? estimatedSectorWrites
        : 0;
  const runtimeTone =
    estimatedSectorWrites > 50000 || estimatedSystemWrites > 500000
      ? "heavy"
      : estimatedSectorWrites > 5000 || estimatedSystemWrites > 50000
        ? "moderate"
        : estimatedSectorWrites > 500 || estimatedSystemWrites > 5000
          ? "fast"
          : "none";
  const runtimeLabel = {
    none: "Minimal",
    fast: "Manageable",
    moderate: "Moderate",
    heavy: "Heavy",
  }[runtimeTone];
  const forecastRows = [
    { label: "Sector Writes", value: `${estimatedSectorWrites.toLocaleString()} upserts` },
    {
      label: "Presence Writes",
      value:
        estimatedPresenceWrites > 0
          ? `${estimatedPresenceWrites.toLocaleString()} metadata updates`
          : "No new presence writes",
    },
    {
      label: "System Rewrites",
      value:
        estimatedSystemWrites > 0 ? `~${estimatedSystemWrites.toLocaleString()} cached systems` : "No system rewrites",
    },
    { label: "Likely Runtime", value: runtimeLabel, tone: runtimeTone },
  ];
  const forecastNote =
    `Forecasts use ${avgObjectsPerSector.toFixed(2)} average objects per surveyed sector and current cached coverage. ` +
    `Actual writes may vary by ring density and center anomaly seeding.`;

  return {
    modeLabel: currentGalaxyGenerateLabel.value,
    actionLabel,
    layoutCountLabel: totalLayout.toLocaleString(),
    sectorsTouchedLabel: sectorsTouched.toLocaleString(),
    namedSectorsLabel: `${namedSectors.toLocaleString()} / ${totalLayout.toLocaleString()}`,
    presenceCoverageLabel: sectorGenerationCoverageLabel.value,
    cachedSystemsLabel: currentGalaxyCachedSystemCount.value.toLocaleString(),
    writeProfile,
    forecastRows,
    forecastNote,
    warningMessages,
  };
});

const sectorGenerateDialog = ref({
  isOpen: false,
  title: "Generate All Sectors",
  message: "",
  confirmText: "Generate",
});
const fullGalaxyDialog = ref({
  isOpen: false,
  title: "Generate Sectors And Systems",
  message: "",
  confirmText: "Generate Sectors And Systems",
});
const regenerateDialog = ref({
  isOpen: false,
  title: "Full Regenerate Galaxy",
  message: "",
  confirmText: "Full Regenerate",
});
const resetDialog = ref({
  isOpen: false,
  title: "Reset Generated Content",
  message: "",
  confirmText: "Reset",
  payload: null,
});
const DEFAULT_UNIVERSE_COORD_LIMITS = Object.freeze({ minX: -500, maxX: 500, minY: -500, maxY: 500 });
const UNIVERSE_BOUNDS_STORAGE_KEY = "eclipsed-horizons-universe-bounds";

function toIntegerOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function normalizeUniverseBounds(rawBounds) {
  const source = rawBounds && typeof rawBounds === "object" ? rawBounds : {};
  const xA = toIntegerOrFallback(source.minX, DEFAULT_UNIVERSE_COORD_LIMITS.minX);
  const xB = toIntegerOrFallback(source.maxX, DEFAULT_UNIVERSE_COORD_LIMITS.maxX);
  const yA = toIntegerOrFallback(source.minY, DEFAULT_UNIVERSE_COORD_LIMITS.minY);
  const yB = toIntegerOrFallback(source.maxY, DEFAULT_UNIVERSE_COORD_LIMITS.maxY);

  const minX = Math.min(xA, xB);
  const maxX = Math.max(xA, xB);
  const minY = Math.min(yA, yB);
  const maxY = Math.max(yA, yB);

  return {
    minX,
    maxX: maxX === minX ? maxX + 1 : maxX,
    minY,
    maxY: maxY === minY ? maxY + 1 : maxY,
  };
}

function loadUniverseBounds() {
  try {
    const raw = localStorage.getItem(UNIVERSE_BOUNDS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_UNIVERSE_COORD_LIMITS };
    }
    return normalizeUniverseBounds(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_UNIVERSE_COORD_LIMITS };
  }
}

const universeBounds = ref(loadUniverseBounds());
const universeBoundsRange = computed(() => normalizeUniverseBounds(universeBounds.value));

const confirmDialog = ref({
  isOpen: false,
  title: "Delete Galaxy",
  message: "Are you sure? This action cannot be undone.",
  confirmText: "Delete",
  galaxyIdToDelete: null,
});

const newGalaxyForm = ref({
  name: "",
  placementMode: "clustered",
  placementSeed: "",
  clusterMinSeparation: 12,
  clusterMaxSeparation: 29,
  clusterClearance: 10,
  clusterSlotsPerRing: 16,
  coordinatesX: 0,
  coordinatesY: 0,
  type: "Spiral",
  bulgeRadius: 5000,
  armCount: 2,
  coreDensity: 0.7,
  diskThickness: 1000,
  centralAnomalyType: "Black Hole",
  centralAnomalyMassSolar: 4000000,
  centralAnomalyActivity: 0.2,
});

const importForm = ref(createDefaultGalaxyImportForm());

const galaxyEditForm = ref({
  name: "",
  type: "Spiral",
  bulgeRadius: 5000,
  armCount: 2,
  coreDensity: 0.7,
  diskThickness: 1000,
  centralAnomalyType: "Black Hole",
  centralAnomalyMassSolar: 4000000,
  centralAnomalyActivity: 0.2,
});

function syncGalaxyEditForm(galaxy) {
  galaxyEditForm.value = {
    name: galaxy?.name || "",
    type: galaxy?.type || "Spiral",
    bulgeRadius: Number(galaxy?.morphology?.bulgeRadius) || 5000,
    armCount: Number(galaxy?.morphology?.armCount) || 0,
    coreDensity: Number(galaxy?.morphology?.coreDensity) || 0.7,
    diskThickness: Number(galaxy?.morphology?.diskThickness) || 1000,
    centralAnomalyType: galaxy?.morphology?.centralAnomaly?.type || "Black Hole",
    centralAnomalyMassSolar: Number(galaxy?.morphology?.centralAnomaly?.massSolarMasses) || 4000000,
    centralAnomalyActivity: Number(galaxy?.morphology?.centralAnomaly?.activityIndex) || 0.2,
  };
}

function rollCentralAnomalyType() {
  const roll = Math.random();
  if (roll < 0.72) return "Black Hole";
  if (roll < 0.84) return "Pulsar";
  if (roll < 0.93) return "Neutron Star";
  if (roll < 0.98) return "Quasar Remnant";
  return "Dense Cluster";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, places = 0) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function sampleAnomalyMassSolar(type) {
  const ranges = {
    "Black Hole": [1_000_000, 5_000_000_000],
    Pulsar: [1.2, 2.5],
    "Neutron Star": [1.1, 3.0],
    "Quasar Remnant": [500_000_000, 20_000_000_000],
    "Dense Cluster": [100_000, 80_000_000],
  };

  const [min, max] = ranges[type] || ranges["Black Hole"];
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  return 10 ** (logMin + Math.random() * (logMax - logMin));
}

function calculateMorphologyFromAnomaly({ type, massSolarMasses, activityIndex, galaxyType, existingArmCount }) {
  const anomalyProfile = {
    "Black Hole": { influenceMultiplier: 1.0, bulgeFactor: 1.0, densityOffset: 0.05 },
    Pulsar: { influenceMultiplier: 1_800_000, bulgeFactor: 0.72, densityOffset: -0.07 },
    "Neutron Star": { influenceMultiplier: 1_500_000, bulgeFactor: 0.68, densityOffset: -0.06 },
    "Quasar Remnant": { influenceMultiplier: 1.8, bulgeFactor: 1.45, densityOffset: 0.12 },
    "Dense Cluster": { influenceMultiplier: 60, bulgeFactor: 0.92, densityOffset: 0.04 },
  };

  const profile = anomalyProfile[type] || anomalyProfile["Black Hole"];
  const mass = clamp(Number(massSolarMasses) || 4_000_000, 1, 50_000_000_000);
  const activity = clamp(Number(activityIndex) || 0, 0, 1);
  const influenceMass = Math.max(1, mass * profile.influenceMultiplier);

  // Scaled against a Milky Way-like SMBH anchor (~4e6 M☉).
  const bulgeRadius = clamp(
    roundTo(5000 * Math.pow(influenceMass / 4_000_000, 0.42) * profile.bulgeFactor * (1 + activity * 0.18)),
    5000,
    50000,
  );
  const diskThickness = clamp(
    roundTo(1000 * Math.pow(influenceMass / 4_000_000, 0.3) * (0.92 + activity * 0.25)),
    500,
    10000,
  );

  const massTerm = Math.log10(Math.max(1, influenceMass) / 1_000_000);
  const coreDensity = clamp(roundTo(0.62 + massTerm * 0.1 + profile.densityOffset + activity * 0.08, 2), 0.01, 1);

  let armCount;
  if (String(galaxyType || "").includes("Spiral")) {
    const spiralArms = 2 + Math.round(clamp(2.4 + activity * 4 + massTerm * 0.8, 0, 8));
    armCount = clamp(spiralArms, 2, 12);
  } else {
    armCount = 0;
  }

  return {
    bulgeRadius,
    diskThickness,
    coreDensity,
    armCount,
  };
}

function autoCalculateGalaxyFromAnomaly() {
  applyMorphologyFromAnomalyToForm(newGalaxyForm);
}

function applyMorphologyFromAnomalyToForm(targetFormRef) {
  if (!targetFormRef?.value) {
    return;
  }

  const computed = calculateMorphologyFromAnomaly({
    type: targetFormRef.value.centralAnomalyType,
    massSolarMasses: targetFormRef.value.centralAnomalyMassSolar,
    activityIndex: targetFormRef.value.centralAnomalyActivity,
    galaxyType: targetFormRef.value.type,
    existingArmCount: targetFormRef.value.armCount,
  });

  targetFormRef.value.bulgeRadius = computed.bulgeRadius;
  targetFormRef.value.diskThickness = computed.diskThickness;
  targetFormRef.value.coreDensity = computed.coreDensity;
  targetFormRef.value.armCount = computed.armCount;
}

function rerollGalaxyDraft() {
  const galaxy = currentGalaxy.value;
  if (!galaxy) {
    return;
  }

  if (!isEditingGalaxy.value) {
    syncGalaxyEditForm(galaxy);
    isEditingGalaxy.value = true;
  }

  galaxyEditForm.value.type = String(galaxy?.type || galaxyEditForm.value.type || "Spiral");
  galaxyEditForm.value.centralAnomalyType = rollCentralAnomalyType();
  galaxyEditForm.value.centralAnomalyMassSolar = roundTo(
    sampleAnomalyMassSolar(galaxyEditForm.value.centralAnomalyType),
  );
  galaxyEditForm.value.centralAnomalyActivity = roundTo(Math.random(), 2);
  applyMorphologyFromAnomalyToForm(galaxyEditForm);
  onEditGalaxyTypeChange();

  toastService.info(
    `Rerolled a new ${galaxyEditForm.value.type} profile draft for ${galaxy.name}. Review and save to apply it.`,
  );
}

function formatGalaxyDraftValue(value, formatter = (input) => String(input ?? "—")) {
  return formatter(value);
}

function buildDeltaLabel(nextValue, currentValue, formatter = (input) => String(input ?? "—")) {
  if (String(formatter(nextValue)) === String(formatter(currentValue))) {
    return "";
  }
  return `→ ${formatter(nextValue)}`;
}

const galaxyEditDeltaRows = computed(() => {
  const galaxy = currentGalaxy.value;
  if (!isEditingGalaxy.value || !galaxy) {
    return [];
  }

  const currentAnomaly = galaxy?.morphology?.centralAnomaly ?? {};
  const formatPc = (value) => `${Number(value || 0).toLocaleString()} pc`;
  const formatDensity = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;
  const formatMass = (value) => `${formatNumber(Number(value || 0))} M☉`;
  const formatActivity = (value) => Number(value || 0).toFixed(2);

  return [
    {
      label: "Galaxy Type",
      before: formatGalaxyDraftValue(galaxy.type),
      after: formatGalaxyDraftValue(galaxyEditForm.value.type),
      delta: buildDeltaLabel(galaxyEditForm.value.type, galaxy.type),
    },
    {
      label: "Central Anomaly",
      before: formatGalaxyDraftValue(currentAnomaly.type),
      after: formatGalaxyDraftValue(galaxyEditForm.value.centralAnomalyType),
      delta: buildDeltaLabel(galaxyEditForm.value.centralAnomalyType, currentAnomaly.type),
    },
    {
      label: "Anomaly Mass",
      before: formatMass(currentAnomaly.massSolarMasses),
      after: formatMass(galaxyEditForm.value.centralAnomalyMassSolar),
      delta: buildDeltaLabel(galaxyEditForm.value.centralAnomalyMassSolar, currentAnomaly.massSolarMasses, formatMass),
    },
    {
      label: "Activity Index",
      before: formatActivity(currentAnomaly.activityIndex),
      after: formatActivity(galaxyEditForm.value.centralAnomalyActivity),
      delta: buildDeltaLabel(galaxyEditForm.value.centralAnomalyActivity, currentAnomaly.activityIndex, formatActivity),
    },
    {
      label: "Bulge Radius",
      before: formatPc(galaxy?.morphology?.bulgeRadius),
      after: formatPc(galaxyEditForm.value.bulgeRadius),
      delta: buildDeltaLabel(galaxyEditForm.value.bulgeRadius, galaxy?.morphology?.bulgeRadius, formatPc),
    },
    {
      label: "Disk Thickness",
      before: formatPc(galaxy?.morphology?.diskThickness),
      after: formatPc(galaxyEditForm.value.diskThickness),
      delta: buildDeltaLabel(galaxyEditForm.value.diskThickness, galaxy?.morphology?.diskThickness, formatPc),
    },
    {
      label: "Core Density",
      before: formatDensity(galaxy?.morphology?.coreDensity),
      after: formatDensity(galaxyEditForm.value.coreDensity),
      delta: buildDeltaLabel(galaxyEditForm.value.coreDensity, galaxy?.morphology?.coreDensity, formatDensity),
    },
    {
      label: "Spiral Arms",
      before: formatGalaxyDraftValue(galaxy?.morphology?.armCount ?? 0),
      after: formatGalaxyDraftValue(galaxyEditForm.value.armCount ?? 0),
      delta: buildDeltaLabel(galaxyEditForm.value.armCount ?? 0, galaxy?.morphology?.armCount ?? 0),
    },
  ];
});

const destructiveRegenerateSummary = computed(() => {
  const sectors = Array.isArray(currentGalaxySectors.value) ? currentGalaxySectors.value : [];
  const sectorIds = new Set(sectors.map((sector) => String(sector?.sectorId || "")).filter(Boolean));
  const systemCount = systemStore.systems.filter((system) => {
    const matchesGalaxy = String(system?.galaxyId || "") === String(currentGalaxy.value?.galaxyId || "");
    const matchesSector = sectorIds.has(String(system?.sectorId || ""));
    return matchesGalaxy || matchesSector;
  }).length;

  return {
    sectorCount: sectors.length,
    systemCount,
  };
});

const anomalyPreview = computed(() =>
  calculateMorphologyFromAnomaly({
    type: newGalaxyForm.value.centralAnomalyType,
    massSolarMasses: newGalaxyForm.value.centralAnomalyMassSolar,
    activityIndex: newGalaxyForm.value.centralAnomalyActivity,
    galaxyType: newGalaxyForm.value.type,
    existingArmCount: newGalaxyForm.value.armCount,
  }),
);

const anomalyPreviewDeltas = computed(() => {
  if (!anomalyPreview.value) return null;

  return {
    bulgeRadius: Number(anomalyPreview.value.bulgeRadius) - Number(newGalaxyForm.value.bulgeRadius || 0),
    diskThickness: Number(anomalyPreview.value.diskThickness) - Number(newGalaxyForm.value.diskThickness || 0),
    coreDensity: Number(anomalyPreview.value.coreDensity) - Number(newGalaxyForm.value.coreDensity || 0),
    armCount: Number(anomalyPreview.value.armCount) - Number(newGalaxyForm.value.armCount || 0),
  };
});

function estimateGalaxyDiameterParsecsFromDraft() {
  const type = String(newGalaxyForm.value.type || "Spiral");
  const bulgeRadius = Number(newGalaxyForm.value.bulgeRadius) || 5000;
  let diameter = clamp(Math.round(bulgeRadius * 6), 3000, 240000);

  if (type === "Dwarf") diameter = clamp(Math.round(diameter * 0.45), 2000, 25000);
  if (type === "Irregular") diameter = clamp(Math.round(diameter * 0.8), 5000, 120000);
  if (type === "Elliptical") diameter = clamp(Math.round(diameter * 1.2), 10000, 260000);

  return diameter;
}

function estimateGalaxyDiameterParsecs(galaxy) {
  const direct = Number(galaxy?.galaxyDimensions?.diameterInParsecs ?? galaxy?.metadata?.diameterInParsecs);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const bulge = Number(galaxy?.morphology?.bulgeRadius);
  if (Number.isFinite(bulge) && bulge > 0) return clamp(Math.round(bulge * 6), 3000, 240000);
  return 30000;
}

const draftSizing = computed(() => {
  const diameterParsecs = estimateGalaxyDiameterParsecsFromDraft();
  const diameterKpc = Math.max(2, Number((diameterParsecs / 1000).toFixed(1)));
  const sectorGridX = Math.max(1, Math.ceil(diameterParsecs / SECTOR_WIDTH_PC));
  const sectorGridY = Math.max(1, Math.ceil(diameterParsecs / SECTOR_HEIGHT_PC));
  const totalSectors = sectorGridX * sectorGridY;

  const anchorDiameter = currentGalaxy.value ? estimateGalaxyDiameterParsecs(currentGalaxy.value) : diameterParsecs;
  const pairUniverseUnits = (anchorDiameter + diameterParsecs) / 20000;
  const minFactor = clampUniverseCoordinate(newGalaxyForm.value.clusterMinSeparation, 4, 200);
  const maxFactor = clampUniverseCoordinate(newGalaxyForm.value.clusterMaxSeparation, minFactor, 300);
  const minSepUnits = Math.max(1, Math.round(pairUniverseUnits * minFactor));
  const maxSepUnits = Math.max(minSepUnits, Math.round(pairUniverseUnits * maxFactor));

  return {
    diameterKpc,
    sectorGridX,
    sectorGridY,
    totalSectors,
    footprintLabel: `${(sectorGridX * SECTOR_WIDTH_PC).toLocaleString()} × ${(sectorGridY * SECTOR_HEIGHT_PC).toLocaleString()} pc`,
    separationRange: `${minSepUnits}-${maxSepUnits} universe units`,
  };
});

const draftForecast = computed(() => {
  const totalSectors = draftSizing.value.totalSectors;
  const moderateThresholdRaw = Number(preferencesStore.galaxyPlannerModerateSectorThreshold);
  const heavyThresholdRaw = Number(preferencesStore.galaxyPlannerHeavySectorThreshold);
  const extremeThresholdRaw = Number(preferencesStore.galaxyPlannerExtremeSectorThreshold);

  const moderateThreshold = Number.isFinite(moderateThresholdRaw) ? Math.max(1000, moderateThresholdRaw) : 12000;
  const heavyThreshold = Number.isFinite(heavyThresholdRaw)
    ? Math.max(moderateThreshold + 1, heavyThresholdRaw)
    : 60000;
  const extremeThreshold = Number.isFinite(extremeThresholdRaw)
    ? Math.max(heavyThreshold + 1, extremeThresholdRaw)
    : 200000;

  let estimatedRuntime = "5-20s";
  let runtimeSeverity = "fast";
  if (totalSectors > extremeThreshold) {
    estimatedRuntime = "3m+";
    runtimeSeverity = "heavy";
  } else if (totalSectors > heavyThreshold) {
    estimatedRuntime = "1-3m";
    runtimeSeverity = "heavy";
  } else if (totalSectors > moderateThreshold) {
    estimatedRuntime = "30-90s";
    runtimeSeverity = "moderate";
  }

  return {
    populatedSectorsLabel: "1 center sector",
    estimatedSystemsLabel: "Center anomaly only",
    estimatedRuntime,
    runtimeSeverity,
    showRuntimeWarning: runtimeSeverity !== "fast",
    formulaSummary: `Estimated from total sector-layout size only. Creation now seeds just the center sector and its anomaly; full sector layout naming and further generation happen later in Galaxy Survey. Thresholds still reflect overall galaxy footprint size for later mapping: moderate > ${moderateThreshold.toLocaleString()}, heavy > ${heavyThreshold.toLocaleString()}, extreme > ${extremeThreshold.toLocaleString()} sectors.`,
  };
});

watchEffect(() => {
  localStorage.setItem(UNIVERSE_BOUNDS_STORAGE_KEY, JSON.stringify(universeBoundsRange.value));
});

function getGalaxyUniverseCoordinates(galaxy) {
  const direct = galaxy?.metadata?.universeCoordinates;
  const fallback = galaxy?.universeCoordinates || galaxy?.metadata?.coordinates;
  const source = direct && typeof direct === "object" ? direct : fallback;

  let x = Number(source?.x);
  let y = Number(source?.y);

  if ((!Number.isFinite(x) || !Number.isFinite(y)) && Array.isArray(source) && source.length >= 2) {
    x = Number(source[0]);
    y = Number(source[1]);
  }

  if ((!Number.isFinite(x) || !Number.isFinite(y)) && typeof source === "string") {
    try {
      const parsed = JSON.parse(source);
      x = Number(parsed?.x);
      y = Number(parsed?.y);
    } catch {
      return null;
    }
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return { x, y };
}

function coordinateKey(x, y) {
  return `${Math.round(x)}:${Math.round(y)}`;
}

function buildGalaxyGridKey(x, y) {
  return `${Number(x) || 0}:${Number(y) || 0}`;
}

function loadGalaxySurveyHistory() {
  try {
    const raw = localStorage.getItem(GALAXY_SURVEY_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGalaxySurveyHistory(entries) {
  galaxySurveyHistory.value = Array.isArray(entries) ? entries : [];
  try {
    localStorage.setItem(GALAXY_SURVEY_HISTORY_STORAGE_KEY, JSON.stringify(galaxySurveyHistory.value));
  } catch {
    // Ignore history persistence failures; feature is advisory only.
  }
}

function normalizeHistoryMetrics(metrics) {
  return (Array.isArray(metrics) ? metrics : [])
    .map((metric) => {
      const label = String(metric?.label || "").trim();
      const value = String(metric?.value ?? "").trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
}

function recordGalaxySurveyHistory({ galaxyId, label, detail, metrics = [] }) {
  const normalizedGalaxyId = String(galaxyId || currentGalaxy.value?.galaxyId || "").trim();
  if (!normalizedGalaxyId) {
    return;
  }

  const nextEntries = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      galaxyId: normalizedGalaxyId,
      label: String(label || "Galaxy Survey Activity").trim(),
      detail: String(detail || "").trim(),
      metrics: normalizeHistoryMetrics(metrics),
      at: new Date().toISOString(),
    },
    ...galaxySurveyHistory.value,
  ].slice(0, 60);
  saveGalaxySurveyHistory(nextEntries);
}

const currentGalaxyHistory = computed(() =>
  galaxySurveyHistory.value
    .filter((entry) => String(entry?.galaxyId || "") === String(currentGalaxy.value?.galaxyId || ""))
    .slice(0, 8),
);

function randomIntInRange(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateRandomUniverseCoordinates({
  minX = universeBoundsRange.value.minX,
  maxX = universeBoundsRange.value.maxX,
  minY = universeBoundsRange.value.minY,
  maxY = universeBoundsRange.value.maxY,
} = {}) {
  const occupied = new Set(
    galaxies.value
      .map((galaxy) => getGalaxyUniverseCoordinates(galaxy))
      .filter(Boolean)
      .map((coord) => coordinateKey(coord.x, coord.y)),
  );

  for (let attempt = 0; attempt < 400; attempt += 1) {
    const x = randomIntInRange(minX, maxX);
    const y = randomIntInRange(minY, maxY);
    const key = coordinateKey(x, y);
    if (!occupied.has(key)) {
      return { x, y };
    }
  }

  return {
    x: randomIntInRange(minX, maxX),
    y: randomIntInRange(minY, maxY),
  };
}

function clampUniverseCoordinate(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

const hasCurrentGalaxyCoordinates = computed(() => Boolean(getGalaxyUniverseCoordinates(currentGalaxy.value)));
const mapChipLabel = computed(() =>
  hasCurrentGalaxyCoordinates.value ? "Open Traveller Atlas" : "Open Traveller Atlas (Coordinates Optional)",
);
const mapChipTitle = computed(() =>
  hasCurrentGalaxyCoordinates.value
    ? "Open Universe Map focused on this galaxy"
    : "Open Traveller Atlas. Add universe coordinates later if you want atlas placement.",
);

function normalizeSectorStats(stats) {
  return normalizeGalaxySectorStats(stats, { sectors: currentGalaxySectors.value });
}

function getGalaxyById(galaxyId) {
  return galaxies.value.find((entry) => entry.galaxyId === galaxyId) ?? null;
}

function getCachedSectorStats(galaxyId) {
  const galaxy = getGalaxyById(galaxyId);
  return galaxy?.metadata?.sectorStats ?? null;
}

async function persistCachedSectorStats(galaxy, stats) {
  if (!galaxy?.galaxyId) return;

  const payload = buildGalaxySectorStatsPayload({
    galaxy,
    stats,
    normalizeStats: normalizeSectorStats,
  });

  await galaxyStore.updateGalaxy(galaxy.galaxyId, payload);
}

async function loadCurrentGalaxySectorStats({
  galaxyId = currentGalaxy.value?.galaxyId,
  silent = false,
  force = false,
} = {}) {
  if (!galaxyId) {
    currentGalaxySectorStats.value = normalizeSectorStats();
    return;
  }

  if (!silent) {
    isRefreshingSectorStats.value = true;
  }

  try {
    const result = await resolveGalaxySectorStatsRefresh({
      galaxyId,
      force,
      cachedStats: getCachedSectorStats(galaxyId),
      currentStats: currentGalaxySectorStats.value,
      currentSectors: currentGalaxySectors.value,
      loadSectors: (targetGalaxyId) => sectorStore.loadSectors(targetGalaxyId),
      fetchSectorStats: (targetGalaxyId) => getSectorStats(targetGalaxyId),
      normalizeStats: (stats, { sectors } = {}) =>
        normalizeGalaxySectorStats(stats, {
          sectors: Array.isArray(sectors) ? sectors : currentGalaxySectors.value,
        }),
      getGalaxyById,
      persistStats: persistCachedSectorStats,
    });
    currentGalaxySectorStats.value = result.stats;
  } catch (err) {
    if (!silent) {
      toastService.error(`Failed to load sector statistics: ${err.message}`);
    }
  } finally {
    if (!silent) {
      isRefreshingSectorStats.value = false;
    }
  }
}

const sectorGenerationCoverageLabel = computed(() => {
  const total = currentGalaxySectorStats.value.totalSectors;
  const generated = currentGalaxySectorStats.value.generatedPresenceSectors;
  if (total <= 0) {
    return "0 / 0 (0%)";
  }

  const pct = Math.round((generated / total) * 100);
  return `${generated} / ${total} (${pct}%)`;
});

function buildGalaxyLoadErrorMessage(rawError) {
  const detail = String(rawError || "").trim();
  const looksLikeConnectivityIssue = /failed to fetch|network|aborterror|request failed after retries/i.test(detail);

  if (looksLikeConnectivityIssue) {
    return (
      "⚠️ Galaxy data could not be loaded. The backend API may be offline or started incorrectly. " +
      "Start it from the repository root with: npm run api:dev, then click Refresh. " +
      "Do not launch the API with a global node binary; this repo uses a local Node 18 runtime for better-sqlite3."
    );
  }

  if (detail) {
    return `⚠️ Failed to load galaxies: ${detail}`;
  }

  return "⚠️ Failed to load galaxies. Please ensure the backend API is running, then click Refresh.";
}

function syncGalaxyLoadErrorBanner() {
  if (galaxyStore.error) {
    errorMessage.value = buildGalaxyLoadErrorMessage(galaxyStore.error);
    return;
  }

  if (!galaxyStore.isLoading && galaxies.value.length === 0) {
    errorMessage.value = "No galaxies found yet. Create a galaxy or import one to get started.";
    return;
  }

  const isRouteError =
    errorMessage.value.includes("Invalid galaxy selected") ||
    errorMessage.value.includes("Invalid sector selected") ||
    errorMessage.value.includes("Invalid system selected");

  if (!isRouteError) {
    errorMessage.value = "";
  }
}

const DENSITY_COLORS = [
  "#030312", // 0 - void
  "#0d1528", // 1 - sparse
  "#122448", // 2 - dim
  "#1a4080", // 3 - medium / inter-arm
  "#2878c0", // 4 - dense / arm core
  "#e8b828", // 5 - galactic center
];

const GALAXY_MAP_ZOOM_OPTIONS = Object.freeze([
  { id: "overview", label: "Overview", multiplier: 0.85 },
  { id: "fit", label: "Fit", multiplier: 1 },
  { id: "close", label: "Close", multiplier: 1.6 },
  { id: "detail", label: "Detail", multiplier: 2.35 },
]);

const GALAXY_MAP_OVERLAY_OPTIONS = Object.freeze([
  { id: "density", label: "Density" },
  { id: "presence", label: "Presence" },
  { id: "systems", label: "Systems" },
  { id: "frontier", label: "Frontier" },
]);

const GALAXY_MAP_STATUS_FILTER_OPTIONS = Object.freeze([
  { id: "all", label: "All Tiles" },
  { id: "persisted", label: "Persisted Only" },
  { id: "layout-only", label: "Layout Only" },
  { id: "presence-pending", label: "Presence Pending" },
  { id: "systems-pending", label: "Systems Pending" },
  { id: "frontier", label: "Current Frontier" },
  { id: "selected-ring", label: "Selected Ring" },
]);

const GALAXY_MAP_STATUS_COLORS = Object.freeze({
  "layout-only": "#1d2738",
  "named-only": "#8f5d35",
  "surveyed-empty": "#55657a",
  "presence-only": "#3aa5a1",
  "systems-partial": "#d5a93d",
  "systems-complete": "#3dbb6a",
  frontier: "#49c8ff",
});

const galaxyMapZoomOptions = computed(() => GALAXY_MAP_ZOOM_OPTIONS);
const galaxyMapOverlayOptions = computed(() => GALAXY_MAP_OVERLAY_OPTIONS);
const galaxyMapStatusFilterOptions = computed(() => GALAXY_MAP_STATUS_FILTER_OPTIONS);

function stepGalaxyMapZoom(direction) {
  const currentIndex = GALAXY_MAP_ZOOM_OPTIONS.findIndex((option) => option.id === galaxyMapZoomLevel.value);
  const safeIndex = currentIndex >= 0 ? currentIndex : 1;
  const nextIndex = Math.max(0, Math.min(GALAXY_MAP_ZOOM_OPTIONS.length - 1, safeIndex + direction));
  galaxyMapZoomLevel.value = GALAXY_MAP_ZOOM_OPTIONS[nextIndex].id;
}

function handleGalaxyMapWheel(event) {
  if (!event || event.deltaY === 0) return;
  stepGalaxyMapZoom(event.deltaY > 0 ? -1 : 1);
}

function beginGalaxyMapPan(event) {
  const preview = galaxyMapPreview.value;
  if (!preview?.canPan || !event || event.button !== 0) return;

  galaxyMapPanState.value = {
    isDragging: true,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startPanX: galaxyMapPan.value.x,
    startPanY: galaxyMapPan.value.y,
  };

  event.currentTarget?.setPointerCapture?.(event.pointerId);
}

function updateGalaxyMapPan(event) {
  const preview = galaxyMapPreview.value;
  const panState = galaxyMapPanState.value;
  if (!preview?.canPan || !panState.isDragging || panState.pointerId !== event.pointerId) return;

  const scale = preview.svgSize / preview.zoomedViewSize;
  const nextPanX = panState.startPanX - (event.clientX - panState.startClientX) / scale;
  const nextPanY = panState.startPanY - (event.clientY - panState.startClientY) / scale;

  galaxyMapPan.value = {
    x: Math.max(-preview.maxPanOffset, Math.min(preview.maxPanOffset, nextPanX)),
    y: Math.max(-preview.maxPanOffset, Math.min(preview.maxPanOffset, nextPanY)),
  };
}

function endGalaxyMapPan(event) {
  const panState = galaxyMapPanState.value;
  if (!panState.isDragging) return;

  if (event?.currentTarget && panState.pointerId !== null) {
    event.currentTarget.releasePointerCapture?.(panState.pointerId);
  }

  galaxyMapPanState.value = {
    isDragging: false,
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    startPanX: galaxyMapPan.value.x,
    startPanY: galaxyMapPan.value.y,
  };
}

// Each sector tile is 32 parsecs wide × 40 parsecs tall (standard Traveller sector dimensions).
const SECTOR_WIDTH_PC = 32;
const SECTOR_HEIGHT_PC = 40;

const galaxyMapPreview = computed(() => {
  const galaxy = currentGalaxy.value;
  if (!galaxy) return null;

  const layout = generateGalaxySectorLayout(galaxy);
  if (!layout.length) return null;

  const persistedSectorsByGrid = new Map(
    currentGalaxySectors.value.map((sector) => [
      buildGalaxyGridKey(sector?.metadata?.gridX, sector?.metadata?.gridY),
      sector,
    ]),
  );

  const xValues = layout.map((sector) => Number(sector?.metadata?.gridX ?? sector?.x ?? 0));
  const yValues = layout.map((sector) => Number(sector?.metadata?.gridY ?? sector?.y ?? 0));
  const minGridX = Math.min(...xValues);
  const maxGridX = Math.max(...xValues);
  const minGridY = Math.min(...yValues);
  const maxGridY = Math.max(...yValues);
  const gridWidth = maxGridX - minGridX + 1;
  const gridHeight = maxGridY - minGridY + 1;
  const SVG_SIZE = 280;
  const PADDING = 12;
  const step = Math.min((SVG_SIZE - PADDING * 2) / gridWidth, (SVG_SIZE - PADDING * 2) / gridHeight);
  const tileSize = Math.max(2, step * 0.9);
  const tileHalf = tileSize / 2;
  const renderTileSize = Math.max(2.8, tileSize);
  const renderTileHalf = renderTileSize / 2;
  const offsetX = PADDING + step * 0.5 - minGridX * step;
  const offsetY = PADDING + step * 0.5 - minGridY * step;
  const zoomMultiplier =
    GALAXY_MAP_ZOOM_OPTIONS.find((option) => option.id === galaxyMapZoomLevel.value)?.multiplier ?? 1;
  const zoomedViewSize = SVG_SIZE / zoomMultiplier;
  const centeredViewOrigin = (SVG_SIZE - zoomedViewSize) / 2;
  const maxPanOffset = Math.max(0, centeredViewOrigin);
  const clampedPanX = Math.max(-maxPanOffset, Math.min(maxPanOffset, galaxyMapPan.value.x));
  const clampedPanY = Math.max(-maxPanOffset, Math.min(maxPanOffset, galaxyMapPan.value.y));
  const viewOriginX = centeredViewOrigin + clampedPanX;
  const viewOriginY = centeredViewOrigin + clampedPanY;
  const viewBox = `${viewOriginX} ${viewOriginY} ${zoomedViewSize} ${zoomedViewSize}`;

  // Actual parsec coverage: each tile is one sector = 32×40 pc.
  const widthPc = gridWidth * SECTOR_WIDTH_PC;
  const heightPc = gridHeight * SECTOR_HEIGHT_PC;
  const zoomLabel = GALAXY_MAP_ZOOM_OPTIONS.find((option) => option.id === galaxyMapZoomLevel.value)?.label || "Fit";
  const scaleLabel = `${gridWidth}×${gridHeight} sectors — ${widthPc.toLocaleString()} × ${heightPc.toLocaleString()} pc — ${zoomLabel} zoom`;

  return {
    svgSize: SVG_SIZE,
    tileSize,
    tileHalf,
    renderTileSize,
    renderTileHalf,
    viewBox,
    zoomedViewSize,
    maxPanOffset,
    canPan: maxPanOffset > 0,
    centerPx: offsetX,
    centerPy: offsetY,
    densityColors: DENSITY_COLORS,
    scaleLabel,
    tiles: layout.map((s) => {
      const gridX = Number(s?.metadata?.gridX ?? s?.x ?? 0);
      const gridY = Number(s?.metadata?.gridY ?? s?.y ?? 0);
      const persistedSector = persistedSectorsByGrid.get(buildGalaxyGridKey(gridX, gridY)) ?? null;
      const occupiedHexCount = Array.isArray(persistedSector?.metadata?.occupiedHexes)
        ? persistedSector.metadata.occupiedHexes.length
        : 0;
      const typedHexCount = persistedSector?.metadata?.hexStarTypes
        ? Object.keys(persistedSector.metadata.hexStarTypes).length
        : 0;
      const displayName =
        String(
          persistedSector?.metadata?.displayName ||
            persistedSector?.name ||
            s?.metadata?.displayName ||
            s?.sectorId ||
            "",
        ).trim() || String(s?.sectorId || "Unnamed Sector");

      return {
        id: `${gridX}_${gridY}`,
        sectorId: String(persistedSector?.sectorId || s?.sectorId || `${galaxy.galaxyId}:${gridX},${gridY}`),
        displayName,
        gridX,
        gridY,
        ring: Math.max(Math.abs(gridX), Math.abs(gridY)),
        persisted: Boolean(persistedSector),
        presenceGenerated: Boolean(persistedSector?.metadata?.hexPresenceGenerated),
        occupiedHexCount,
        typedHexCount,
        px: offsetX + gridX * step,
        py: offsetY + gridY * step,
        color: DENSITY_COLORS[s.densityClass] ?? DENSITY_COLORS[0],
        dc: s.densityClass,
        tooltip: `${displayName} (${String(persistedSector?.sectorId || s?.sectorId || "layout-only")})\nGrid ${gridX >= 0 ? "+" : ""}${gridX}, ${gridY >= 0 ? "+" : ""}${gridY}\nDensity ${s.densityClass}\nPresence ${occupiedHexCount.toLocaleString()} · Typed ${typedHexCount.toLocaleString()}`,
        persistedSector,
        opacity: tileSize < 3 ? 0.82 : 1,
      };
    }),
  };
});

const generationGuidance = computed(() =>
  buildGalaxyGenerationGuidance({ tiles: galaxyMapPreview.value?.tiles ?? [] }),
);

function isGalaxyMapTileSystemsComplete(tile) {
  return Boolean(
    tile?.persisted &&
    tile?.presenceGenerated &&
    Number(tile?.typedHexCount || 0) >= Number(tile?.occupiedHexCount || 0),
  );
}

function resolveGalaxyMapTileStatus(tile) {
  if (!tile?.persisted) {
    return { key: "layout-only", label: "Layout Only" };
  }
  if (!tile?.presenceGenerated) {
    return { key: "named-only", label: "Named Only" };
  }
  if (Number(tile?.occupiedHexCount || 0) <= 0) {
    return { key: "surveyed-empty", label: "Surveyed Empty" };
  }
  if (isGalaxyMapTileSystemsComplete(tile)) {
    return { key: "systems-complete", label: "Systems Complete" };
  }
  if (Number(tile?.typedHexCount || 0) > 0) {
    return { key: "systems-partial", label: "Systems Partial" };
  }
  return { key: "presence-only", label: "Presence Only" };
}

function resolveGalaxyMapTileOverlay(tile, { overlayMode, frontierRing, frontierMode }) {
  const status = resolveGalaxyMapTileStatus(tile);
  const isFrontierTile = Number(frontierRing) === Number(tile?.ring);
  if (overlayMode === "density") {
    return { fill: tile.color, accent: isFrontierTile };
  }
  if (overlayMode === "presence") {
    if (status.key === "layout-only") return { fill: GALAXY_MAP_STATUS_COLORS["layout-only"], accent: false };
    if (status.key === "named-only") return { fill: GALAXY_MAP_STATUS_COLORS["named-only"], accent: false };
    if (status.key === "surveyed-empty") return { fill: GALAXY_MAP_STATUS_COLORS["surveyed-empty"], accent: false };
    return {
      fill:
        status.key === "systems-complete"
          ? GALAXY_MAP_STATUS_COLORS["systems-complete"]
          : GALAXY_MAP_STATUS_COLORS["presence-only"],
      accent: isFrontierTile,
    };
  }
  if (overlayMode === "systems") {
    return { fill: GALAXY_MAP_STATUS_COLORS[status.key] || tile.color, accent: isFrontierTile };
  }
  if (isFrontierTile) {
    return { fill: GALAXY_MAP_STATUS_COLORS.frontier, accent: true, frontierMode };
  }
  if (status.key === "systems-complete") {
    return { fill: GALAXY_MAP_STATUS_COLORS["systems-complete"], accent: false };
  }
  if (status.key === "presence-only" || status.key === "systems-partial") {
    return { fill: GALAXY_MAP_STATUS_COLORS["systems-partial"], accent: false };
  }
  return { fill: GALAXY_MAP_STATUS_COLORS[status.key] || tile.color, accent: false };
}

function matchesGalaxyMapFilters(tile, { frontierRing, selectedRing }) {
  const status = resolveGalaxyMapTileStatus(tile);
  const ringFilter = galaxyMapRingFilter.value;
  if (ringFilter !== "all" && String(tile?.ring) !== ringFilter) {
    return false;
  }

  const statusFilter = galaxyMapStatusFilter.value;
  if (statusFilter === "all") {
    return true;
  }
  if (statusFilter === "persisted") {
    return tile.persisted;
  }
  if (statusFilter === "layout-only") {
    return status.key === "layout-only";
  }
  if (statusFilter === "presence-pending") {
    return !tile.presenceGenerated;
  }
  if (statusFilter === "systems-pending") {
    return tile.persisted && tile.presenceGenerated && !isGalaxyMapTileSystemsComplete(tile);
  }
  if (statusFilter === "frontier") {
    return Number(frontierRing) === Number(tile?.ring);
  }
  if (statusFilter === "selected-ring") {
    return Number.isFinite(selectedRing) && Number(tile?.ring) === selectedRing;
  }
  return true;
}

const galaxyMapRingFilterOptions = computed(() => {
  const rings = Array.from(new Set((galaxyMapPreview.value?.tiles ?? []).map((tile) => Number(tile?.ring))))
    .filter((ring) => Number.isFinite(ring))
    .sort((left, right) => left - right);

  return [{ id: "all", label: "All Rings" }, ...rings.map((ring) => ({ id: String(ring), label: `Ring ${ring}` }))];
});

watch(galaxyMapRingFilterOptions, (options) => {
  const allowed = new Set((options || []).map((option) => String(option.id)));
  if (!allowed.has(String(galaxyMapRingFilter.value))) {
    galaxyMapRingFilter.value = "all";
  }
});

const galaxyMapRenderedTiles = computed(() => {
  const guidance = generationGuidance.value;
  const frontierRing = Number(guidance?.recommendation?.ring);
  const frontierMode = guidance?.recommendation?.mode || null;
  const selectedRing = Number(
    galaxyMapPreview.value?.tiles.find((tile) => tile.id === selectedGalaxyMapTileId.value)?.ring,
  );

  return (galaxyMapPreview.value?.tiles ?? []).map((tile) => {
    const status = resolveGalaxyMapTileStatus(tile);
    const matchesFilter = matchesGalaxyMapFilters(tile, { frontierRing, selectedRing });
    const overlay = resolveGalaxyMapTileOverlay(tile, {
      overlayMode: galaxyMapOverlayMode.value,
      frontierRing,
      frontierMode,
    });

    return {
      ...tile,
      statusKey: status.key,
      statusLabel: status.label,
      renderFill: overlay.fill,
      renderOpacity: matchesFilter ? tile.opacity : 0.1,
      matchesFilter,
      isFrontierRing: Number(frontierRing) === Number(tile?.ring),
      frontierMode,
      tooltip:
        `${tile.tooltip}\nStatus ${status.label}` +
        (Number(frontierRing) === Number(tile?.ring) && frontierMode ? `\nFrontier ${frontierMode}` : ""),
    };
  });
});

const selectedGalaxyMapTile = computed(
  () => galaxyMapRenderedTiles.value.find((tile) => tile.id === selectedGalaxyMapTileId.value) ?? null,
);

const selectedGalaxyMapSectorRecord = computed(() => selectedGalaxyMapTile.value?.persistedSector ?? null);

const selectedGalaxyMapRingTiles = computed(() => {
  const ring = Number(selectedGalaxyMapTile.value?.ring);
  if (!Number.isFinite(ring)) {
    return [];
  }
  return galaxyMapRenderedTiles.value.filter((tile) => Number(tile?.ring) === ring);
});

const selectedGalaxyMapRingPersistedSectors = computed(() =>
  selectedGalaxyMapRingTiles.value.map((tile) => tile.persistedSector).filter(Boolean),
);

const galaxyMapLegendEntries = computed(() => {
  if (galaxyMapOverlayMode.value === "density") {
    return [
      { label: "Void", color: DENSITY_COLORS[0] },
      { label: "Sparse", color: DENSITY_COLORS[1] },
      { label: "Inter-arm", color: DENSITY_COLORS[3] },
      { label: "Dense Core", color: DENSITY_COLORS[5] },
    ];
  }

  if (galaxyMapOverlayMode.value === "frontier") {
    return [
      { label: "Frontier Ring", color: GALAXY_MAP_STATUS_COLORS.frontier },
      { label: "Systems Complete", color: GALAXY_MAP_STATUS_COLORS["systems-complete"] },
      { label: "Needs Systems", color: GALAXY_MAP_STATUS_COLORS["systems-partial"] },
      { label: "Layout Only", color: GALAXY_MAP_STATUS_COLORS["layout-only"] },
    ];
  }

  return [
    { label: "Layout Only", color: GALAXY_MAP_STATUS_COLORS["layout-only"] },
    { label: "Named Only", color: GALAXY_MAP_STATUS_COLORS["named-only"] },
    { label: "Surveyed Empty", color: GALAXY_MAP_STATUS_COLORS["surveyed-empty"] },
    {
      label: galaxyMapOverlayMode.value === "presence" ? "Presence Found" : "Systems Partial",
      color:
        galaxyMapOverlayMode.value === "presence"
          ? GALAXY_MAP_STATUS_COLORS["presence-only"]
          : GALAXY_MAP_STATUS_COLORS["systems-partial"],
    },
    { label: "Systems Complete", color: GALAXY_MAP_STATUS_COLORS["systems-complete"] },
  ];
});

const galaxyMapVisibleTileCount = computed(
  () => galaxyMapRenderedTiles.value.filter((tile) => tile.matchesFilter).length,
);

const galaxyMapFrontierBanner = computed(() => {
  const guidance = generationGuidance.value;
  const recommended = getRecommendedGenerationRing({ preferMode: guidance?.recommendation?.mode || null });
  if (!guidance?.ringSummaries?.length || !recommended) {
    return null;
  }

  return {
    ring: recommended.ring,
    title: guidance.recommendation.title,
    body: guidance.recommendation.body,
    mode: guidance.recommendation.mode || null,
  };
});

const galaxySectorSearchResults = computed(() => {
  const query = String(galaxyMapSearch.value || "")
    .trim()
    .toLowerCase();
  if (!query) {
    return [];
  }

  return galaxyMapRenderedTiles.value
    .filter((tile) => {
      if (!tile.matchesFilter) {
        return false;
      }
      const haystack = [
        tile.displayName,
        tile.sectorId,
        `${tile.gridX},${tile.gridY}`,
        `${tile.gridX} ${tile.gridY}`,
        tile.persisted ? "persisted" : "layout",
        tile.statusLabel,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => Number(right.persisted) - Number(left.persisted) || left.ring - right.ring)
    .slice(0, 8);
});

function formatSignedDelta(value, precision = 0, suffix = "") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";

  const rounded = Number(numeric.toFixed(precision));
  if (rounded === 0) return `No change${suffix}`;

  const abs = Math.abs(rounded);
  const display = precision > 0 ? abs.toFixed(precision) : Math.round(abs).toString();
  const sign = rounded > 0 ? "+" : "-";
  return `${sign}${display}${suffix}`;
}

function deltaClass(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || Math.abs(numeric) < 1e-9) return "preview-delta-neutral";
  return numeric > 0 ? "preview-delta-up" : "preview-delta-down";
}

function loadGalaxySurveyViewState() {
  const defaults = {
    zoomLevel: "fit",
    overlayMode: "density",
    statusFilter: "all",
    ringFilter: "all",
  };

  try {
    const raw = localStorage.getItem(GALAXY_SURVEY_VIEW_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);
    return {
      zoomLevel: String(parsed?.zoomLevel || defaults.zoomLevel),
      overlayMode: String(parsed?.overlayMode || defaults.overlayMode),
      statusFilter: String(parsed?.statusFilter || defaults.statusFilter),
      ringFilter: String(parsed?.ringFilter || defaults.ringFilter),
    };
  } catch {
    return defaults;
  }
}

function persistGalaxySurveyViewState() {
  try {
    localStorage.setItem(
      GALAXY_SURVEY_VIEW_STORAGE_KEY,
      JSON.stringify({
        zoomLevel: galaxyMapZoomLevel.value,
        overlayMode: galaxyMapOverlayMode.value,
        statusFilter: galaxyMapStatusFilter.value,
        ringFilter: galaxyMapRingFilter.value,
      }),
    );
  } catch {
    // Ignore localStorage persistence failures.
  }
}

// Update page title dynamically
watchEffect(() => {
  const galaxy = currentGalaxy.value;
  if (galaxy && galaxy.name) {
    document.title = `Galaxy Survey: ${galaxy.name} | Eclipsed Horizons`;
  } else {
    document.title = "Galaxy Survey | Eclipsed Horizons";
  }
});

watch(
  currentGalaxy,
  async (galaxy) => {
    syncGalaxyEditForm(galaxy);
    isEditingGalaxy.value = false;
    galaxyMapSearch.value = "";
    selectedGalaxyMapTileId.value = "0_0";
    galaxyMapPan.value = { x: 0, y: 0 };
    await loadCurrentGalaxySectorStats({ galaxyId: galaxy?.galaxyId, silent: true });
  },
  { immediate: true },
);

watch([galaxyMapZoomLevel, galaxyMapOverlayMode, galaxyMapStatusFilter, galaxyMapRingFilter], () => {
  persistGalaxySurveyViewState();
});

watch(
  galaxyMapPreview,
  (preview) => {
    if (!preview?.tiles?.length) {
      selectedGalaxyMapTileId.value = "";
      return;
    }

    const hasSelected = preview.tiles.some((tile) => tile.id === selectedGalaxyMapTileId.value);
    if (!hasSelected) {
      const centerTile = preview.tiles.find((tile) => tile.gridX === 0 && tile.gridY === 0) ?? preview.tiles[0];
      selectedGalaxyMapTileId.value = centerTile?.id || "";
    }
  },
  { immediate: true },
);

// Handle route errors and ensure galaxy state is synced before navigation.
onMounted(async () => {
  const errorCode = route.query.error;
  if (errorCode === "invalid-galaxy") {
    errorMessage.value = "⚠️ Invalid galaxy selected. Please select a valid galaxy before proceeding.";
  } else if (errorCode === "invalid-sector") {
    errorMessage.value = "⚠️ Invalid sector selected. Please select a valid sector before proceeding.";
  } else if (errorCode === "invalid-system") {
    errorMessage.value = "⚠️ Invalid system selected. Please select a valid system before proceeding.";
  }

  try {
    await galaxyStore.loadGalaxies();
    syncGalaxyLoadErrorBanner();

    const requestedGalaxyId = typeof route.query.galaxyId === "string" ? route.query.galaxyId : null;
    if (requestedGalaxyId && galaxyStore.galaxies.some((entry) => entry.galaxyId === requestedGalaxyId)) {
      galaxyStore.setCurrentGalaxy(requestedGalaxyId);
    }

    // Recover from stale local selection (for example after DB reset/import changes).
    if (!galaxyStore.getCurrentGalaxy && galaxyStore.galaxies.length > 0) {
      galaxyStore.setCurrentGalaxy(galaxyStore.galaxies[0].galaxyId);
    }
    syncGalaxyLoadErrorBanner();
  } catch (err) {
    toastService.error(`Failed to load galaxies: ${err.message}`);
  }
});

function clearError() {
  errorMessage.value = "";
  // Remove error from URL
  router.replace({ query: {} });
}

function selectGalaxy(galaxyId) {
  galaxyStore.setCurrentGalaxy(galaxyId);
}

function isSpiral(type) {
  const t = String(type || "");
  return t === "Spiral" || t === "Barred Spiral";
}

function onEditGalaxyTypeChange() {
  if (!isSpiral(galaxyEditForm.value.type)) {
    galaxyEditForm.value.armCount = 0;
  } else if (galaxyEditForm.value.armCount < 2) {
    galaxyEditForm.value.armCount = 2;
  }
}

function onNewGalaxyTypeChange() {
  if (!isSpiral(newGalaxyForm.value.type)) {
    newGalaxyForm.value.armCount = 0;
  } else if (newGalaxyForm.value.armCount < 2) {
    newGalaxyForm.value.armCount = 2;
  }
}

function randomizeGalaxyParams() {
  const galaxyTypes = ["Spiral", "Barred Spiral", "Elliptical", "Lenticular", "Irregular", "Dwarf"];

  newGalaxyForm.value.type = galaxyTypes[Math.floor(Math.random() * galaxyTypes.length)];
  newGalaxyForm.value.centralAnomalyType = rollCentralAnomalyType();
  newGalaxyForm.value.centralAnomalyMassSolar = roundTo(sampleAnomalyMassSolar(newGalaxyForm.value.centralAnomalyType));
  newGalaxyForm.value.centralAnomalyActivity = roundTo(Math.random(), 2);
  autoCalculateGalaxyFromAnomaly();

  toastService.info("Galaxy parameters randomized!");
}

function randomizeGalaxyName() {
  const existingNames = new Set(
    galaxies.value.map((entry) =>
      String(entry?.name || "")
        .trim()
        .toLowerCase(),
    ),
  );
  let candidate = "";
  const mode = preferencesStore.galaxyNameMode || "normalized";
  const mythicTheme = preferencesStore.galaxyMythicTheme || "all";

  for (let attempt = 0; attempt < 12; attempt += 1) {
    candidate = generateGalaxyName({ mode, avoid: "", mythicTheme }).trim();

    if (candidate && !existingNames.has(candidate.toLowerCase())) {
      newGalaxyForm.value.name = candidate;
      return;
    }
  }

  if (candidate) {
    newGalaxyForm.value.name = `${candidate} ${Math.floor(10 + Math.random() * 90)}`;
    return;
  }

  newGalaxyForm.value.name = `Galaxy ${Math.floor(100 + Math.random() * 900)}`;
}

function rollManualCoordinates() {
  const next = generateRandomUniverseCoordinates();
  newGalaxyForm.value.coordinatesX = next.x;
  newGalaxyForm.value.coordinatesY = next.y;
}

function buildPendingGalaxyForPlacement() {
  return {
    type: newGalaxyForm.value.type,
    morphology: {
      bulgeRadius: Number(newGalaxyForm.value.bulgeRadius) || 5000,
      armCount: Number(newGalaxyForm.value.armCount) || 0,
      coreDensity: Number(newGalaxyForm.value.coreDensity) || 0.7,
      diskThickness: Number(newGalaxyForm.value.diskThickness) || 1000,
    },
  };
}

function readPlacementTuning(source) {
  const minSeparationDiameters = clampUniverseCoordinate(source?.clusterMinSeparation, 4, 200);
  const maxSeparationDiameters = clampUniverseCoordinate(source?.clusterMaxSeparation, minSeparationDiameters, 300);
  const clearanceDiameters = Math.max(1, Math.min(200, Number(source?.clusterClearance) || 10));
  const slotsPerRing = clampUniverseCoordinate(source?.clusterSlotsPerRing, 4, 128);

  return {
    minSeparationDiameters,
    maxSeparationDiameters,
    clearanceDiameters,
    slotsPerRing,
  };
}

const CLUSTER_PRESETS = Object.freeze({
  loose: { clusterMinSeparation: 20, clusterMaxSeparation: 45, clusterClearance: 14, clusterSlotsPerRing: 12 },
  "local-group": { clusterMinSeparation: 12, clusterMaxSeparation: 29, clusterClearance: 10, clusterSlotsPerRing: 16 },
  tight: { clusterMinSeparation: 7, clusterMaxSeparation: 16, clusterClearance: 6, clusterSlotsPerRing: 22 },
});

function applyClusterPreset(targetFormRef, presetName) {
  const preset = CLUSTER_PRESETS[presetName];
  if (!preset || !targetFormRef?.value) return;
  Object.assign(targetFormRef.value, preset);
}

function generateClusteredCoordinatesForNewGalaxy() {
  return generateClusteredUniverseCoordinates({
    existingGalaxies: galaxies.value,
    candidateGalaxy: buildPendingGalaxyForPlacement(),
    bounds: universeBoundsRange.value,
    anchorGalaxyId: currentGalaxy.value?.galaxyId || null,
    placementSeed: newGalaxyForm.value.placementSeed || undefined,
    placementTuning: readPlacementTuning(newGalaxyForm.value),
  });
}

async function createNewGalaxy() {
  if (!newGalaxyForm.value.name.trim()) {
    toastService.error("Please enter a galaxy name");
    return;
  }

  const normalizedName = newGalaxyForm.value.name.trim().toLowerCase();
  const nameAlreadyExists = galaxies.value.some((g) => (g.name || "").trim().toLowerCase() === normalizedName);
  if (nameAlreadyExists) {
    toastService.error("A galaxy with this name already exists. Please choose a different name.");
    return;
  }

  showNewGalaxyForm.value = false;
  isCreating.value = true;
  const startedAt = Date.now();
  try {
    startGenerationProgress("Creating galaxy record", 0);
    await flushGenerationProgressUi();

    const universeCoordinates =
      newGalaxyForm.value.placementMode === "manual"
        ? {
            x: clampUniverseCoordinate(
              newGalaxyForm.value.coordinatesX,
              universeBoundsRange.value.minX,
              universeBoundsRange.value.maxX,
            ),
            y: clampUniverseCoordinate(
              newGalaxyForm.value.coordinatesY,
              universeBoundsRange.value.minY,
              universeBoundsRange.value.maxY,
            ),
          }
        : newGalaxyForm.value.placementMode === "random"
          ? generateRandomUniverseCoordinates()
          : generateClusteredCoordinatesForNewGalaxy();

    const newGalaxy = buildGalaxyCreatePayload({
      galaxyId: `gal-${Date.now()}`,
      newGalaxyForm: newGalaxyForm.value,
      universeCoordinates,
      placementTuning: readPlacementTuning(newGalaxyForm.value),
    });

    const createdGalaxy = await galaxyStore.createGalaxy(newGalaxy);
    updateGenerationProgress(0, 1, "Seeding center sector");
    await flushGenerationProgressUi();

    const targetGalaxy = createdGalaxy ?? newGalaxy;
    let sectorCount = 0;

    try {
      const seededCenter = await seedGalacticCenterSector(targetGalaxy);
      if (seededCenter && sectorCount === 0) {
        sectorCount = 1;
      }
      updateGenerationProgress(seededCenter ? 1 : 0, 1, "Galaxy creation complete");
      await flushGenerationProgressUi();
    } catch (seedErr) {
      toastService.warning(`Galaxy created but center anomaly seeding failed: ${seedErr.message}`);
    }

    let successMessage = `Galaxy "${newGalaxyForm.value.name}" created successfully!`;
    if (sectorCount > 0) {
      successMessage = `Galaxy "${newGalaxyForm.value.name}" created with the named center sector seeded.`;
    }
    successMessage +=
      " The center anomaly has been seeded. Use Galaxy Survey to name the rest of the galaxy or generate presence and systems.";
    const createdGalaxyId = createdGalaxy?.galaxyId || newGalaxy.galaxyId;
    recordGalaxySurveyHistory({
      galaxyId: createdGalaxyId,
      label: "Created Galaxy",
      detail: `Created ${newGalaxyForm.value.name} with center-sector seeding.`,
      metrics: buildHistoryMetrics({
        mode: "create",
        scope: "galaxy",
        sectors: sectorCount,
        systems: sectorCount > 0 ? 1 : 0,
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success(successMessage);
    await router.push({
      name: "GalaxySurvey",
      query: { galaxyId: createdGalaxyId },
    });
    newGalaxyForm.value = {
      name: "",
      placementMode: "clustered",
      placementSeed: "",
      clusterMinSeparation: 12,
      clusterMaxSeparation: 29,
      clusterClearance: 10,
      clusterSlotsPerRing: 16,
      coordinatesX: 0,
      coordinatesY: 0,
      type: "Spiral",
      bulgeRadius: 5000,
      armCount: 2,
      coreDensity: 0.7,
      diskThickness: 1000,
      centralAnomalyType: "Black Hole",
      centralAnomalyMassSolar: 4000000,
      centralAnomalyActivity: 0.2,
    };
  } catch (err) {
    toastService.error(`Failed to create galaxy: ${err.message}`);
  } finally {
    isCreating.value = false;
    resetGenerationProgress();
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importForm.value.fileData = JSON.parse(e.target.result);
        toastService.info("File loaded successfully");
      } catch (err) {
        toastService.error("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
  }
}

function handleImportModalDismiss() {
  if (!canDismissGalaxyImportModal(importInProgress.value)) {
    return;
  }
  showImportForm.value = false;
}

async function importGalaxyData() {
  if (!importForm.value.fileData) {
    toastService.error("Please select a file to import");
    return;
  }

  try {
    const startedAt = Date.now();
    const request = buildGalaxyImportRequest({
      importForm: importForm.value,
      universeBoundsRange: universeBoundsRange.value,
      clampUniverseCoordinate,
      placementTuning: readPlacementTuning(importForm.value),
    });

    await galaxyStore.importGalaxy(request.galaxyData, request.options);
    recordGalaxySurveyHistory({
      galaxyId: request.galaxyData?.galaxyId,
      label: "Imported Galaxy",
      detail: `Imported galaxy archive using ${String(importForm.value.placementMode || "clustered")} placement.`,
      metrics: buildHistoryMetrics({
        mode: "import",
        scope: String(importForm.value.placementMode || "clustered"),
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success("Galaxy imported successfully!");
    showImportForm.value = false;
    importForm.value = createDefaultGalaxyImportForm();
  } catch (err) {
    toastService.error(`Failed to import galaxy: ${err.message}`);
  }
}

async function refreshGalaxies() {
  try {
    await galaxyStore.loadGalaxies();
    syncGalaxyLoadErrorBanner();
    toastService.info("Galaxies refreshed");
  } catch (err) {
    toastService.error(`Failed to refresh galaxies: ${err.message}`);
  }
}

function proceedToClass0() {
  const galaxyId = currentGalaxy.value?.galaxyId;
  if (!galaxyId) {
    toastService.error("Please select a valid galaxy before opening Sector Survey.");
    return;
  }

  router.push({
    name: "SectorSurvey",
    params: { galaxyId },
  });
}

function proceedToSubsectorSurvey() {
  const galaxyId = currentGalaxy.value?.galaxyId;
  if (!galaxyId) {
    toastService.error("Please select a valid galaxy before opening Subsector Survey.");
    return;
  }

  router.push({
    name: "SubsectorSurvey",
    params: { galaxyId },
    query: {
      viewScope: "subsector",
    },
  });
}

function openUniverseMap() {
  const galaxyId = currentGalaxy.value?.galaxyId;
  if (galaxyId) {
    galaxyStore.setCurrentGalaxy(galaxyId);
  }
  router.push({
    name: "TravellerAtlas",
  });
}

function formatTileGrid(gridX, gridY) {
  const x = Number(gridX) || 0;
  const y = Number(gridY) || 0;
  return `${x >= 0 ? "+" : ""}${x}, ${y >= 0 ? "+" : ""}${y}`;
}

function selectGalaxyMapTile(tile) {
  if (!tile?.id) {
    return;
  }
  selectedGalaxyMapTileId.value = tile.id;
}

function focusGalaxyMapTile(tileId, { zoom = false } = {}) {
  const preview = galaxyMapPreview.value;
  if (!preview?.tiles?.length) {
    return;
  }

  const tile = preview.tiles.find((entry) => entry.id === tileId);
  if (!tile) {
    return;
  }

  selectedGalaxyMapTileId.value = tile.id;
  if (zoom) {
    galaxyMapZoomLevel.value = "detail";
  }

  if (!preview.canPan) {
    galaxyMapPan.value = { x: 0, y: 0 };
    return;
  }

  galaxyMapPan.value = {
    x: Math.max(-preview.maxPanOffset, Math.min(preview.maxPanOffset, tile.px - preview.svgSize / 2)),
    y: Math.max(-preview.maxPanOffset, Math.min(preview.maxPanOffset, tile.py - preview.svgSize / 2)),
  };
}

function jumpToSectorSurvey({ viewName = "SectorSurvey" } = {}) {
  const tile = selectedGalaxyMapTile.value;
  const galaxyId = currentGalaxy.value?.galaxyId;
  if (!galaxyId || !tile?.persisted) {
    toastService.error("Select a persisted sector tile first.");
    return;
  }

  router.push({
    name: viewName,
    params: { galaxyId },
    query:
      viewName === "SubsectorSurvey"
        ? {
            sectorId: tile.sectorId,
            gridX: tile.gridX,
            gridY: tile.gridY,
            sectorName: tile.displayName,
            viewScope: "subsector",
            from: "GalaxySurvey",
          }
        : {
            sectorId: tile.sectorId,
            gridX: tile.gridX,
            gridY: tile.gridY,
            sectorName: tile.displayName,
            from: "GalaxySurvey",
          },
  });
}

function requestResetGeneratedContent({ level = "systems", scopeLabel = "this galaxy", sectorIds = null } = {}) {
  const targetSectors = (
    Array.isArray(sectorIds) && sectorIds.length
      ? currentGalaxySectors.value.filter((sector) => sectorIds.includes(sector.sectorId))
      : currentGalaxySectors.value
  ).filter(Boolean);
  if (!targetSectors.length) {
    toastService.warning("No persisted sectors matched this reset request.");
    return;
  }

  resetDialog.value = {
    isOpen: true,
    title: level === "presence" ? "Clear Survey Presence + Systems" : "Clear Generated Systems",
    message:
      `${level === "presence" ? "This will clear presence markers and systems for" : "This will clear systems for"} ${scopeLabel}. ` +
      `${targetSectors.length.toLocaleString()} persisted sector${targetSectors.length === 1 ? "" : "s"} will be updated.`,
    confirmText: level === "presence" ? "Clear Survey" : "Clear Systems",
    payload: {
      level,
      scopeLabel,
      sectorIds: targetSectors.map((sector) => sector.sectorId),
    },
  };
}

function cancelResetGeneratedContent() {
  resetDialog.value.isOpen = false;
  resetDialog.value.payload = null;
}

async function confirmResetGeneratedContent() {
  const payload = resetDialog.value.payload;
  resetDialog.value.isOpen = false;
  resetDialog.value.payload = null;
  if (!payload) {
    return;
  }
  await resetGalaxyGeneratedContent(payload);
}

async function generateRingByNumber({ ring, mode = "systems", reason = "manual" } = {}) {
  const galaxy = currentGalaxy.value;
  const targetRing = Number(ring);
  if (!galaxy?.galaxyId || !Number.isFinite(targetRing)) {
    toastService.error("Select a ring tile first.");
    return;
  }

  const ringSectors = getRingLayoutSectors(galaxy, targetRing);
  if (!ringSectors.length) {
    toastService.warning("No sectors were found for the selected ring.");
    return;
  }

  focusGalaxyMapRing(targetRing, { zoom: true });

  const startedAt = Date.now();
  isGeneratingSectors.value = true;
  beginGenerationRequestScope();
  try {
    let result = null;
    if (mode === "presence") {
      result = await generateSectorPresenceForSectors(galaxy, ringSectors, {
        progressLabel: `Generating ring ${targetRing} presence`,
        totalCount: ringSectors.length,
      });
      await sectorStore.loadSectors(galaxy.galaxyId);
      await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
      recordGalaxySurveyHistory({
        galaxyId: galaxy.galaxyId,
        label: `Generated Ring ${targetRing} Presence`,
        detail:
          reason === "frontier"
            ? `Guided frontier run processed ring ${targetRing} and found ${result.totalSystems.toLocaleString()} occupied hexes.`
            : `Processed ring ${targetRing} and found ${result.totalSystems.toLocaleString()} occupied hexes.`,
        metrics: buildHistoryMetrics({
          mode: "presence",
          scope: `ring ${targetRing}`,
          sectors: result.namedSectorCount,
          populatedSectors: result.populatedSectorCount,
          systems: result.totalSystems,
          durationMs: Date.now() - startedAt,
        }),
      });
      toastService.success(
        `Ring ${targetRing} processed: ${result.namedSectorCount.toLocaleString()} sectors and ${result.totalSystems.toLocaleString()} occupied hexes.`,
      );
      return;
    }

    result = await generateSectorSystemsForSectors(galaxy, ringSectors, {
      progressLabel: `Generating ring ${targetRing} systems`,
      totalCount: ringSectors.length,
    });
    await sectorStore.loadSectors(galaxy.galaxyId);
    await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
    recordGalaxySurveyHistory({
      galaxyId: galaxy.galaxyId,
      label: `Generated Ring ${targetRing} Systems`,
      detail:
        reason === "frontier"
          ? `Guided frontier run processed ring ${targetRing} and generated ${result.totalSystems.toLocaleString()} systems.`
          : `Processed ring ${targetRing} and generated ${result.totalSystems.toLocaleString()} systems.`,
      metrics: buildHistoryMetrics({
        mode: "systems",
        scope: `ring ${targetRing}`,
        sectors: result.namedSectorCount,
        populatedSectors: result.populatedSectorCount,
        systems: result.totalSystems,
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success(
      `Ring ${targetRing} processed: ${result.namedSectorCount.toLocaleString()} sectors and ${result.totalSystems.toLocaleString()} systems.`,
    );
  } catch (err) {
    if (isGalaxySurveyGenerationCancelledError(err)) {
      return;
    }
    toastService.error(`Failed to generate selected ring: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
    clearGenerationRequestScope();
    resetGenerationProgress();
  }
}

async function runGuidedGenerationStepAction({ mode = "systems" } = {}) {
  await runGuidedGenerationStep({ mode, generateRing: generateRingByNumber });
}

async function generateSelectedRing({ mode = "systems" } = {}) {
  const ring = Number(selectedGalaxyMapTile.value?.ring);
  if (!Number.isFinite(ring)) {
    toastService.error("Select a ring tile first.");
    return;
  }

  await generateRingByNumber({ ring, mode, reason: "manual" });
}

function editGalaxy() {
  syncGalaxyEditForm(currentGalaxy.value);
  isEditingGalaxy.value = true;
}

function cancelGalaxyEdits() {
  syncGalaxyEditForm(currentGalaxy.value);
  isEditingGalaxy.value = false;
}

async function saveGalaxyEdits() {
  const galaxy = currentGalaxy.value;
  if (!galaxy) {
    return;
  }

  const nextName = galaxyEditForm.value.name.trim();
  if (!nextName) {
    toastService.error("Galaxy name cannot be empty.");
    return;
  }

  const duplicateName = galaxies.value.some(
    (entry) => entry.galaxyId !== galaxy.galaxyId && (entry.name || "").trim().toLowerCase() === nextName.toLowerCase(),
  );
  if (duplicateName) {
    toastService.error("A galaxy with this name already exists. Choose a different name.");
    return;
  }

  const payload = buildGalaxyEditPayload({
    galaxy,
    nextName,
    galaxyEditForm: galaxyEditForm.value,
    clamp,
  });

  try {
    const startedAt = Date.now();
    await galaxyStore.updateGalaxy(galaxy.galaxyId, payload);
    isEditingGalaxy.value = false;
    recordGalaxySurveyHistory({
      galaxyId: galaxy.galaxyId,
      label: "Saved Galaxy Draft",
      detail: `Updated galaxy profile for ${nextName}.`,
      metrics: buildHistoryMetrics({
        mode: "edit",
        scope: "galaxy",
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success(`Galaxy "${nextName}" updated.`);
  } catch (err) {
    toastService.error(`Failed to update galaxy: ${err.message}`);
  }
}

function showSectorGenerateConfirm() {
  if (!currentGalaxy.value) {
    toastService.error("No galaxy selected.");
    return;
  }
  if (!currentGalaxy.value.galaxyId) {
    toastService.error("Galaxy has not been saved yet. Please save the galaxy before generating sectors.");
    return;
  }
  const name = currentGalaxy.value.name || currentGalaxy.value.galaxyId;
  sectorGenerateDialog.value.title = currentGalaxyGenerateLabel.value.replace(/^[^A-Za-z]+\s*/, "");
  sectorGenerateDialog.value.confirmText = currentGalaxyGenerateLabel.value.replace(/^[^A-Za-z]+\s*/, "");
  sectorGenerateDialog.value.message =
    {
      names: `Name every sector in "${name}". Existing names are preserved, and unnamed sectors receive stable generated names. Continue?`,
      presence: `Name every sector in "${name}" and roll system presence for every hex in every sector. Continue?`,
      systems: `Name every sector in "${name}" and generate systems for every occupied hex in the galaxy. Continue?`,
      center: `Generate the named center sector and full systems in its hexes for "${name}" only. Continue?`,
      expand: `Start from the center of "${name}" and expand outward ring by ring, generating names and systems until a ring is empty. Continue?`,
    }[galaxySurveyGenerationMode.value] || `Generate sectors for "${name}"?`;
  sectorGenerateDialog.value.isOpen = true;
}

async function confirmGenerateSectors() {
  sectorGenerateDialog.value.isOpen = false;
  await nextTick();
  startGenerationProgress(`${currentGalaxyGenerateLabel.value.replace(/^[^A-Za-z]+\s*/, "")}... preparing layout`, 0);
  await flushGenerationProgressUi();
  await runGalaxySurveyGenerationMode();
}

function cancelSectorGenerateConfirm() {
  sectorGenerateDialog.value.isOpen = false;
}

// Sector / subsector name tables (mirrors SectorSurvey.vue)
const SECTOR_NAMES = Object.freeze([
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
]);
function randomSectorName() {
  const mode = preferencesStore.sectorNameMode;
  if (mode === "list") {
    return SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)];
  }
  return generatePhonotacticName({ style: mode, syllablesMin: 2, syllablesMax: 3 });
}

const SEEDED_NAME_ONSETS = Object.freeze([
  "Al",
  "Bel",
  "Cor",
  "Dor",
  "El",
  "Fen",
  "Gal",
  "Hal",
  "Ir",
  "Kel",
  "Lor",
  "Mor",
  "Nor",
  "Or",
  "Pra",
  "Qua",
  "Ryn",
  "Sol",
  "Tal",
  "Vor",
]);
const SEEDED_NAME_VOWELS = Object.freeze(["a", "e", "i", "o", "u", "ae", "ia", "oa", "ei"]);
const SEEDED_NAME_CODAS = Object.freeze([
  "n",
  "r",
  "s",
  "th",
  "l",
  "m",
  "x",
  "dr",
  "v",
  "nd",
  "ria",
  "tor",
  "lon",
  "vek",
  "mere",
]);
const SEEDED_NAME_MEDIALS = Object.freeze(["", "", "n", "r", "l", "s", "th", "v", "dr"]);
const SEEDED_NAME_SUFFIXES = Object.freeze(["Reach", "March", "Span", "Expanse", "Drift", "Crown", "Basin", "Gate"]);

function buildSeededSectorName(seed) {
  const style = String(preferencesStore.sectorNameMode || "list");
  const hash = hashString(seed);

  if (style === "list") {
    const base = SECTOR_NAMES[hash % SECTOR_NAMES.length];
    const suffix = SEEDED_NAME_SUFFIXES[Math.floor(hash / SECTOR_NAMES.length) % SEEDED_NAME_SUFFIXES.length];
    return `${base} ${suffix}`;
  }

  const onset = SEEDED_NAME_ONSETS[hash % SEEDED_NAME_ONSETS.length].toLowerCase();
  const vowelA = SEEDED_NAME_VOWELS[Math.floor(hash / 7) % SEEDED_NAME_VOWELS.length];
  const medial = SEEDED_NAME_MEDIALS[Math.floor(hash / 17) % SEEDED_NAME_MEDIALS.length];
  const vowelB = SEEDED_NAME_VOWELS[Math.floor(hash / 37) % SEEDED_NAME_VOWELS.length];
  const coda = SEEDED_NAME_CODAS[Math.floor(hash / 71) % SEEDED_NAME_CODAS.length];
  const includeSecondVowel = (hash & 1) === 1 || coda.length <= 2;

  let name = `${onset}${vowelA}`;
  if (includeSecondVowel) {
    name += `${medial}${vowelB}`;
  } else if (medial) {
    name += medial;
  }
  name += coda;

  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function isPlaceholderSectorName(value) {
  const name = String(value || "").trim();
  if (!name) return true;
  return /^sector\s+-?\d+\s*,\s*-?\d+$/i.test(name);
}

function isLegacySeededSectorName(value) {
  const name = String(value || "").trim();
  if (!name || /\s/.test(name)) return false;
  return /^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(name);
}

function ensureSectorNamingMetadata(sector, metadata = {}) {
  const baseMetadata = metadata && typeof metadata === "object" ? { ...metadata } : {};
  const currentDisplayName = String(baseMetadata.displayName || "").trim();
  const displayName =
    !currentDisplayName || isPlaceholderSectorName(currentDisplayName) || isLegacySeededSectorName(currentDisplayName)
      ? buildSeededSectorName(`${sector.sectorId}:sector`)
      : currentDisplayName;
  const existingSubsectorNames =
    baseMetadata.subsectorNames && typeof baseMetadata.subsectorNames === "object"
      ? { ...baseMetadata.subsectorNames }
      : {};
  const subsectorNames = Object.fromEntries(
    SUBSECTOR_LETTERS.map((letter) => [
      letter,
      (() => {
        const existingName = String(existingSubsectorNames[letter] || "").trim();
        if (!existingName || isLegacySeededSectorName(existingName)) {
          return buildSeededSectorName(`${sector.sectorId}:subsector:${letter}`);
        }
        return existingName;
      })(),
    ]),
  );

  return {
    ...baseMetadata,
    displayName,
    subsectorNames,
  };
}

function sectorRingDistance(sector) {
  const gridX = Number(sector?.metadata?.gridX ?? sector?.coordinates?.x ?? sector?.x ?? 0);
  const gridY = Number(sector?.metadata?.gridY ?? sector?.coordinates?.y ?? sector?.y ?? 0);
  return Math.max(Math.abs(gridX), Math.abs(gridY));
}

function getRingLayoutSectors(galaxy, ring) {
  const targetRing = Number(ring);
  if (!Number.isFinite(targetRing) || targetRing < 0) {
    return [];
  }
  return Array.from(iterateGalaxySectorLayout(galaxy, { scale: "true" })).filter(
    (sector) => sectorRingDistance(sector) === targetRing,
  );
}

function formatDuration(seconds) {
  const clamped = Math.max(0, Math.round(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function buildHistoryMetrics({
  mode = null,
  scope = null,
  sectors = null,
  systems = null,
  populatedSectors = null,
  durationMs = null,
} = {}) {
  const metrics = [];
  if (mode) metrics.push({ label: "Mode", value: String(mode) });
  if (scope) metrics.push({ label: "Scope", value: String(scope) });
  if (Number.isFinite(Number(sectors))) metrics.push({ label: "Sectors", value: Number(sectors).toLocaleString() });
  if (Number.isFinite(Number(populatedSectors))) {
    metrics.push({ label: "Populated", value: Number(populatedSectors).toLocaleString() });
  }
  if (Number.isFinite(Number(systems))) metrics.push({ label: "Systems", value: Number(systems).toLocaleString() });
  if (Number.isFinite(Number(durationMs)) && Number(durationMs) >= 0) {
    metrics.push({ label: "Duration", value: formatDuration(Number(durationMs) / 1000) });
  }
  return metrics;
}

function getGalaxyLayoutSectors(galaxy) {
  return Array.from(iterateGalaxySectorLayout(galaxy, { scale: "true" }));
}

// densityClass 0–5 → base hex occupancy rate
const SECTOR_HEX_PRESENCE_RATE = Object.freeze([0.03, 0.03, 0.15, 0.3, 0.5, 0.7]);
const HEX_PRESENCE_COLS = 32;
const HEX_PRESENCE_ROWS = 40;
const HEX_PRESENCE_MORPHOLOGY_SCALE = 0.15;
const GENERATION_PROGRESS_STEP = 25;

function sectorHexCoord(col, row) {
  return `${String(col).padStart(2, "0")}${String(row).padStart(2, "0")}`;
}

function hashString(value) {
  const input = String(value || "");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getGalaxyCentralAnomalyType(galaxy) {
  const raw = String(galaxy?.morphology?.centralAnomaly?.type || "").trim();
  return raw || "Black Hole";
}

function buildCentralAnomalyRecord(galaxy, sector) {
  const existing = sector?.metadata?.centralAnomaly;
  if (existing?.type && existing?.coord) {
    return {
      ...existing,
      massSolarMasses: Math.max(1, Number(existing.massSolarMasses) || 1),
      activityIndex: clamp(Number(existing.activityIndex) || 0, 0, 1),
      coord: String(existing.coord),
    };
  }

  const profile = galaxy?.morphology?.centralAnomaly || {};
  const type = String(profile.type || "").trim() || "Black Hole";
  const massRaw = Number(profile.massSolarMasses);
  const activityRaw = Number(profile.activityIndex);
  const massSolarMasses = roundTo(Number.isFinite(massRaw) && massRaw > 0 ? massRaw : sampleAnomalyMassSolar(type), 2);
  const activityIndex = roundTo(clamp(Number.isFinite(activityRaw) ? activityRaw : Math.random(), 0, 1), 2);
  const centerCol = Math.ceil(HEX_PRESENCE_COLS / 2);
  const centerRow = Math.ceil(HEX_PRESENCE_ROWS / 2);
  const placementOffsets = [
    { col: 0, row: 0, label: "center" },
    { col: 1, row: 0, label: "near-center-east" },
    { col: -1, row: 0, label: "near-center-west" },
    { col: 0, row: 1, label: "near-center-south" },
    { col: 0, row: -1, label: "near-center-north" },
    { col: 1, row: 1, label: "near-center-southeast" },
    { col: -1, row: 1, label: "near-center-southwest" },
    { col: 1, row: -1, label: "near-center-northeast" },
    { col: -1, row: -1, label: "near-center-northwest" },
  ];
  const seed = hashString(
    `${galaxy?.galaxyId || galaxy?.name || "galaxy"}|${sector?.sectorId || "sector"}|${type}|${massSolarMasses}|${activityIndex}`,
  );
  const offset = placementOffsets[seed % placementOffsets.length];
  const anomalyCol = clamp(centerCol + offset.col, 1, HEX_PRESENCE_COLS);
  const anomalyRow = clamp(centerRow + offset.row, 1, HEX_PRESENCE_ROWS);

  return {
    type,
    massSolarMasses,
    activityIndex,
    coord: sectorHexCoord(anomalyCol, anomalyRow),
    col: anomalyCol,
    row: anomalyRow,
    placement: offset.label,
    radiusPc: Math.max(
      1,
      roundTo(
        type === "Dense Cluster"
          ? Math.pow(massSolarMasses, 0.24)
          : type === "Quasar Remnant"
            ? Math.pow(massSolarMasses, 0.18)
            : Math.pow(massSolarMasses, 0.12),
        2,
      ),
    ),
    hazardLevel: clamp(
      Math.round(
        3 +
          activityIndex * 5 +
          (type === "Black Hole" ? 1 : 0) +
          (type === "Quasar Remnant" ? 2 : 0) +
          (type === "Dense Cluster" ? 1 : 0),
      ),
      1,
      10,
    ),
    gravityWellRating: clamp(roundTo(Math.log10(Math.max(1, massSolarMasses)) - 1, 2), 1, 12),
    surveySignature:
      type === "Black Hole"
        ? "gravitic lensing"
        : type === "Pulsar"
          ? "periodic radiation burst"
          : type === "Neutron Star"
            ? "ultra-dense stellar remnant"
            : type === "Quasar Remnant"
              ? "high-energy relic jet"
              : "extreme stellar crowding",
    generatedAt: new Date().toISOString(),
  };
}

function isGalacticCenterSectorRecord(sector) {
  const gx = Number(sector?.metadata?.gridX);
  const gy = Number(sector?.metadata?.gridY);
  return Number.isFinite(gx) && Number.isFinite(gy) && gx === 0 && gy === 0;
}

function ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes }) {
  if (!isGalacticCenterSectorRecord(sector)) {
    return {
      occupiedHexes,
      hexStarTypes,
      isGalacticCenterSector: false,
      centerAnomalyType: null,
      centerAnomaly: null,
    };
  }

  const centerAnomaly = buildCentralAnomalyRecord(galaxy, sector);
  const centerCoord = centerAnomaly.coord;
  const centerAnomalyType = centerAnomaly.type;
  const nextOccupied = Array.isArray(occupiedHexes) ? [...occupiedHexes] : [];
  if (!nextOccupied.includes(centerCoord)) {
    nextOccupied.push(centerCoord);
  }

  let nextHexStarTypes = hexStarTypes;
  if (hexStarTypes && typeof hexStarTypes === "object") {
    const centerStarMetadata = buildHexStarTypeMetadata({
      anomalyType: centerAnomalyType,
      fallbackStarType: centerAnomalyType,
    });
    nextHexStarTypes = {
      ...hexStarTypes,
      [centerCoord]: {
        starType: centerStarMetadata.starType,
        starClass: "anomaly-core",
        secondaryStars: centerStarMetadata.secondaryStars,
        generatedStars: centerStarMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: centerStarMetadata.anomalyType,
        anomalyDetails: centerAnomaly,
      },
    };
  }

  return {
    occupiedHexes: nextOccupied,
    hexStarTypes: nextHexStarTypes,
    isGalacticCenterSector: true,
    centerAnomalyType,
    centerAnomaly,
  };
}

function buildPersistedSystemRecordsForSector(sector, hexStarTypes) {
  const sectorId = String(sector?.sectorId || "").trim();
  const galaxyId = String(sector?.galaxyId || "").trim();
  if (!sectorId || !hexStarTypes || typeof hexStarTypes !== "object") {
    return [];
  }

  return Object.entries(hexStarTypes)
    .map(([coord, info]) => {
      const rawCoord = String(coord || "").trim();
      if (!/^\d{4}$/.test(rawCoord)) return null;

      const normalizedInfo = normalizeHexStarTypeRecord(info, "G2V");
      const primaryType = normalizeStarTypeValue(normalizedInfo?.starType, "G2V");
      const generatedStars = Array.isArray(normalizedInfo?.generatedStars)
        ? normalizedInfo.generatedStars.map((star) => ({ ...star }))
        : [];

      return {
        systemId: `${sectorId}:${rawCoord}`,
        galaxyId,
        sectorId,
        hexCoordinates: {
          x: Number(rawCoord.slice(0, 2)) || 0,
          y: Number(rawCoord.slice(2, 4)) || 0,
        },
        starCount: Math.max(1, Math.min(4, generatedStars.length || 1)),
        primaryStar: {
          spectralClass: primaryType,
        },
        companionStars: (normalizedInfo?.secondaryStars ?? []).map((spectralClass) => ({ spectralClass })),
        metadata: {
          generatedSurvey: {
            stars: generatedStars,
            anomalyType: normalizedInfo?.anomalyType || null,
            legacyReconstructed: Boolean(normalizedInfo?.legacyReconstructed),
            legacyHierarchyUnknown: Boolean(normalizedInfo?.legacyHierarchyUnknown),
          },
          source: "galaxy-survey",
          anomalyType: normalizedInfo?.anomalyType || null,
          legacyReconstructed: Boolean(normalizedInfo?.legacyReconstructed),
          legacyHierarchyUnknown: Boolean(normalizedInfo?.legacyHierarchyUnknown),
          ...(normalizedInfo?.anomalyDetails ? { anomalyDetails: normalizedInfo.anomalyDetails } : {}),
        },
      };
    })
    .filter(Boolean);
}

async function seedGalacticCenterSector(galaxy) {
  let centerSector = null;
  for (const sector of iterateGalaxySectorLayoutByRing(galaxy, { scale: "true" })) {
    if (isGalacticCenterSectorRecord(sector)) {
      centerSector = sector;
      break;
    }
  }
  if (!centerSector) return false;

  const seeded = ensureCenterAnomalyPresence({
    galaxy,
    sector: centerSector,
    occupiedHexes: [],
    hexStarTypes: {},
  });

  const persistedSector = await upsertSector(
    {
      ...centerSector,
      metadata: ensureSectorNamingMetadata(centerSector, {
        ...(centerSector.metadata ?? {}),
        systemCount: seeded.occupiedHexes.length,
        hexPresenceGenerated: true,
        hexPresenceGeneratedAt: new Date().toISOString(),
        occupiedHexes: seeded.occupiedHexes,
        hexStarTypes: seeded.hexStarTypes,
        isGalacticCenterSector: true,
        centralAnomalyType: seeded.centerAnomalyType,
        centralAnomaly: seeded.centerAnomaly,
        centralAnomalyHex: seeded.centerAnomaly?.coord,
      }),
    },
    getGenerationRequestOptions(),
  );

  await systemStore.replaceSectorSystems(
    persistedSector.sectorId,
    buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
    getGenerationRequestOptions(),
  );

  return true;
}

async function createTrueScaleSectorsInChunks(galaxy, { chunkSize = 1000 } = {}) {
  const layout = generateGalaxySectorLayout(galaxy, { scale: "true" });
  if (!layout.length) {
    return { created: 0, total: 0 };
  }

  let created = 0;
  for (let index = 0; index < layout.length; index += chunkSize) {
    const chunk = layout.slice(index, index + chunkSize).map((sector) => ({
      ...sector,
      metadata: ensureSectorNamingMetadata(sector, sector.metadata ?? {}),
    }));
    const result = await createSectorsBatch(chunk, getGenerationRequestOptions());
    if (Array.isArray(result)) {
      created += result.length;
    } else {
      created += Number(result?.created ?? chunk.length) || chunk.length;
    }
  }

  return { created, total: layout.length };
}

async function generateNamedSectorsForGalaxy(galaxy, { progressLabel = "Naming sectors", chunkSize = 1000 } = {}) {
  startGenerationProgress(`${progressLabel}... preparing layout`, 0);
  await flushGenerationProgressUi();
  assertGenerationNotCancelled();

  const estimatedLayoutCount = estimateGalaxySectorLayoutCount(galaxy, { scale: "true" });
  if (!estimatedLayoutCount) {
    return { estimatedLayoutCount: 0, namedSectorCount: 0, populatedSectorCount: 0, totalSystems: 0 };
  }

  startGenerationProgress(progressLabel, estimatedLayoutCount);
  await flushGenerationProgressUi();

  let created = 0;
  let chunk = [];
  let scanned = 0;
  for (const sector of iterateGalaxySectorLayout(galaxy, { scale: "true" })) {
    assertGenerationNotCancelled();
    scanned += 1;
    chunk.push({
      ...sector,
      metadata: ensureSectorNamingMetadata(sector, sector.metadata ?? {}),
    });

    if (scanned % GENERATION_PROGRESS_STEP === 0 || scanned === estimatedLayoutCount) {
      updateGenerationProgress(
        Math.min(created + chunk.length, estimatedLayoutCount),
        estimatedLayoutCount,
        `${progressLabel}... staging sectors`,
      );
      await flushGenerationProgressUi();
    }

    if (chunk.length < chunkSize) {
      continue;
    }

    updateGenerationProgress(
      Math.min(created + chunk.length, estimatedLayoutCount),
      estimatedLayoutCount,
      `${progressLabel}... writing batch`,
    );
    await flushGenerationProgressUi();
    assertGenerationNotCancelled();

    const result = await createSectorsBatch(chunk, getGenerationRequestOptions());
    if (Array.isArray(result)) {
      created += result.length;
    } else {
      created += Number(result?.created ?? chunk.length) || chunk.length;
    }

    updateGenerationProgress(Math.min(created, estimatedLayoutCount), estimatedLayoutCount, progressLabel);
    chunk = [];
    await flushGenerationProgressUi();
  }

  if (chunk.length > 0) {
    updateGenerationProgress(
      Math.min(created + chunk.length, estimatedLayoutCount),
      estimatedLayoutCount,
      `${progressLabel}... writing final batch`,
    );
    await flushGenerationProgressUi();
    assertGenerationNotCancelled();

    const result = await createSectorsBatch(chunk, getGenerationRequestOptions());
    if (Array.isArray(result)) {
      created += result.length;
    } else {
      created += Number(result?.created ?? chunk.length) || chunk.length;
    }

    updateGenerationProgress(Math.min(created, estimatedLayoutCount), estimatedLayoutCount, progressLabel);
  }

  const stats = normalizeSectorStats({
    totalSectors: created,
    populatedSectors: 0,
    generatedPresenceSectors: 0,
    emptySectors: created,
    totalObjects: 0,
    avgObjectsPerSector: 0,
    lastUpdated: new Date().toISOString(),
  });
  await persistCachedSectorStats(galaxy, stats);
  currentGalaxySectorStats.value = stats;

  return {
    estimatedLayoutCount,
    namedSectorCount: created,
    populatedSectorCount: 0,
    totalSystems: 0,
  };
}

async function generateSectorPresenceForGalaxy(galaxy) {
  startGenerationProgress("Generating sector presence... preparing layout", 0);
  await flushGenerationProgressUi();

  return generateSectorPresenceForSectors(galaxy, iterateGalaxySectorLayout(galaxy, { scale: "true" }), {
    progressLabel: "Generating sector presence",
    totalCount: estimateGalaxySectorLayoutCount(galaxy, { scale: "true" }),
  });
}

async function generateSectorPresenceForSectors(
  galaxy,
  sectors,
  { progressLabel = "Generating sector presence", stopAfterEmptyRing = false, totalCount = null } = {},
) {
  const targetSectors = sectors && typeof sectors[Symbol.iterator] === "function" ? sectors : [];
  const resolvedTotal = Math.max(0, Number(totalCount) || (Array.isArray(sectors) ? sectors.length : 0));
  if (!resolvedTotal) {
    return { estimatedLayoutCount: 0, namedSectorCount: 0, populatedSectorCount: 0, totalSystems: 0 };
  }

  startGenerationProgress(progressLabel, resolvedTotal);
  await flushGenerationProgressUi();

  let totalSystems = 0;
  let populatedSectorCount = 0;
  let processed = 0;
  let currentRing = null;
  let ringPopulatedCount = 0;
  const nowIso = new Date().toISOString();

  for (const sector of targetSectors) {
    assertGenerationNotCancelled();
    const ring = sectorRingDistance(sector);
    if (stopAfterEmptyRing && currentRing !== null && ring !== currentRing && ringPopulatedCount === 0) {
      break;
    }
    if (ring !== currentRing) {
      currentRing = ring;
      ringPopulatedCount = 0;
    }

    const dc = Math.min(5, Math.max(0, Number(sector.densityClass ?? 3)));
    const baseRate = SECTOR_HEX_PRESENCE_RATE[dc];
    const occupiedHexes = [];

    for (let c = 1; c <= HEX_PRESENCE_COLS; c++) {
      for (let r = 1; r <= HEX_PRESENCE_ROWS; r++) {
        const prob = calculateHexOccupancyProbability({
          baseRate,
          col: c,
          row: r,
          cols: HEX_PRESENCE_COLS,
          rows: HEX_PRESENCE_ROWS,
          galaxyType: galaxy.type,
          morphology: galaxy.morphology,
          realismScale: 1,
          morphologyScale: HEX_PRESENCE_MORPHOLOGY_SCALE,
        });
        if (Math.random() < prob) {
          occupiedHexes.push(sectorHexCoord(c, r));
        }
      }
    }

    const seeded = ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes: null });
    const systemCount = seeded.occupiedHexes.length;
    totalSystems += systemCount;
    if (systemCount > 0) {
      populatedSectorCount += 1;
      ringPopulatedCount += 1;
    }

    const persistedSector = await upsertSector(
      {
        ...sector,
        metadata: ensureSectorNamingMetadata(sector, {
          ...(sector.metadata ?? {}),
          systemCount,
          hexPresenceGenerated: true,
          hexPresenceGeneratedAt: nowIso,
          occupiedHexes: seeded.occupiedHexes,
          isGalacticCenterSector: seeded.isGalacticCenterSector,
          centralAnomalyType: seeded.centerAnomalyType,
          centralAnomaly: seeded.centerAnomaly,
          centralAnomalyHex: seeded.centerAnomaly?.coord,
        }),
      },
      getGenerationRequestOptions(),
    );

    await systemStore.replaceSectorSystems(
      persistedSector.sectorId,
      buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
      getGenerationRequestOptions(),
    );

    processed += 1;
    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === resolvedTotal) {
      updateGenerationProgress(processed, resolvedTotal, progressLabel);
      await flushGenerationProgressUi();
      assertGenerationNotCancelled();
    }
  }

  const generatedSectorCount = processed;
  const stats = normalizeSectorStats({
    totalSectors: generatedSectorCount,
    populatedSectors: populatedSectorCount,
    generatedPresenceSectors: generatedSectorCount,
    emptySectors: Math.max(0, generatedSectorCount - populatedSectorCount),
    totalObjects: totalSystems,
    avgObjectsPerSector: generatedSectorCount > 0 ? totalSystems / generatedSectorCount : 0,
    lastUpdated: new Date().toISOString(),
  });

  await persistCachedSectorStats(galaxy, stats);
  currentGalaxySectorStats.value = stats;

  return {
    estimatedLayoutCount: resolvedTotal,
    namedSectorCount: generatedSectorCount,
    populatedSectorCount,
    totalSystems,
  };
}

async function doGenerateAllSectors() {
  const galaxy = currentGalaxy.value;
  if (!galaxy) {
    toastService.error("No galaxy selected for generation.");
    return;
  }

  if (!galaxy.galaxyId) {
    toastService.error("Galaxy does not have a valid ID. Please save the galaxy first.");
    return;
  }

  isGeneratingSectors.value = true;
  beginGenerationRequestScope();
  const startedAt = Date.now();
  try {
    const result = await generateNamedSectorsForGalaxy(galaxy, { progressLabel: "Naming sectors" });
    if (result.estimatedLayoutCount === 0) {
      toastService.warning("Could not generate sector layout for this galaxy.");
      return;
    }
    await sectorStore.loadSectors(galaxy.galaxyId);
    await syncGenerationFrontierSelection({ preferMode: "presence", zoom: false, announce: true });
    recordGalaxySurveyHistory({
      galaxyId: galaxy.galaxyId,
      label: "Named Sectors",
      detail: `Named or normalized ${result.namedSectorCount.toLocaleString()} sectors.`,
      metrics: buildHistoryMetrics({
        mode: "names",
        scope: "galaxy",
        sectors: result.namedSectorCount,
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success(
      `Named ${result.namedSectorCount.toLocaleString()} sectors in ${galaxy.name || galaxy.galaxyId}.`,
    );
  } catch (err) {
    if (isGalaxySurveyGenerationCancelledError(err)) {
      return;
    }
    console.error(`[Generate Sector Names] Error:`, err);
    toastService.error(`Failed to name sectors: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
    clearGenerationRequestScope();
    resetGenerationProgress();
  }
}

// ── Full Galaxy Generation ────────────────────────────────────────────────────

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

function spectralClassToCssClass(spectralClass) {
  return starDescriptorToCssClass(normalizeStarTypeValue(spectralClass, "G"));
}

function showFullGalaxyConfirm() {
  if (!currentGalaxy.value) {
    toastService.error("No galaxy selected.");
    return;
  }
  if (!currentGalaxy.value.galaxyId) {
    toastService.error("Galaxy has not been saved yet. Please save the galaxy before generating.");
    return;
  }
  const name = currentGalaxy.value.name || currentGalaxy.value.galaxyId;
  const layoutCount = estimateGalaxySectorLayoutCount(currentGalaxy.value, { scale: "true" });
  fullGalaxyDialog.value.message =
    `This will generate all ${layoutCount.toLocaleString()} sector tiles for "${name}" and generate systems in sector ` +
    `for every occupied hex (up to 32×40 per sector). This may take a moment for larger galaxies. ` +
    `Existing sector system assignments will be re-rolled.`;
  fullGalaxyDialog.value.isOpen = true;
}

async function confirmFullGalaxy() {
  fullGalaxyDialog.value.isOpen = false;
  startGenerationProgress("Generating sectors and systems... preparing layout", 0);
  await flushGenerationProgressUi();
  await doGenerateFullGalaxy();
}

function cancelFullGalaxy() {
  fullGalaxyDialog.value.isOpen = false;
}

async function generateFullGalaxyForGalaxy(galaxy, { progressLabel = "Generating sectors and systems" } = {}) {
  startGenerationProgress(`${progressLabel}... preparing layout`, 0);
  await flushGenerationProgressUi();

  return generateSectorSystemsForSectors(galaxy, iterateGalaxySectorLayout(galaxy, { scale: "true" }), {
    progressLabel,
    totalCount: estimateGalaxySectorLayoutCount(galaxy, { scale: "true" }),
  });
}

async function generateSectorSystemsForSectors(
  galaxy,
  sectors,
  { progressLabel = "Generating sectors and systems", stopAfterEmptyRing = false, totalCount = null } = {},
) {
  const targetSectors = sectors && typeof sectors[Symbol.iterator] === "function" ? sectors : [];
  const resolvedTotal = Math.max(0, Number(totalCount) || (Array.isArray(sectors) ? sectors.length : 0));
  if (!resolvedTotal) {
    return { estimatedLayoutCount: 0, namedSectorCount: 0, populatedSectorCount: 0, totalSystems: 0 };
  }

  startGenerationProgress(progressLabel, resolvedTotal);
  await flushGenerationProgressUi();

  let totalSystems = 0;
  let populatedSectorCount = 0;
  let processed = 0;
  let currentRing = null;
  let ringPopulatedCount = 0;
  const nowIso = new Date().toISOString();

  for (const sector of targetSectors) {
    assertGenerationNotCancelled();
    const ring = sectorRingDistance(sector);
    if (stopAfterEmptyRing && currentRing !== null && ring !== currentRing && ringPopulatedCount === 0) {
      break;
    }
    if (ring !== currentRing) {
      currentRing = ring;
      ringPopulatedCount = 0;
    }

    const dc = Math.min(5, Math.max(0, Number(sector.densityClass ?? 3)));
    const baseRate = SECTOR_HEX_PRESENCE_RATE[dc];
    const occupiedHexes = [];
    const hexStarTypes = {};

    for (let c = 1; c <= HEX_PRESENCE_COLS; c++) {
      for (let r = 1; r <= HEX_PRESENCE_ROWS; r++) {
        const coord = sectorHexCoord(c, r);
        const prob = calculateHexOccupancyProbability({
          baseRate,
          col: c,
          row: r,
          cols: HEX_PRESENCE_COLS,
          rows: HEX_PRESENCE_ROWS,
          galaxyType: galaxy.type,
          morphology: galaxy.morphology,
          realismScale: 1,
          morphologyScale: HEX_PRESENCE_MORPHOLOGY_SCALE,
        });

        if (Math.random() < prob) {
          const primary = generatePrimaryStar();
          const primaryType = primary.designation || primary.spectralType || primary.persistedSpectralClass || "G2V";
          const starMetadata = buildHexStarTypeMetadata({
            generatedStars: [{ ...primary }],
            primary,
            fallbackStarType: primaryType,
          });
          occupiedHexes.push(coord);
          hexStarTypes[coord] = {
            starType: starMetadata.starType,
            starClass: spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass || primaryType),
            secondaryStars: starMetadata.secondaryStars,
            generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
            anomalyType: starMetadata.anomalyType,
          };
        }
      }
    }

    const seeded = ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes });
    const systemCount = seeded.occupiedHexes.length;
    totalSystems += systemCount;
    if (systemCount > 0) {
      populatedSectorCount += 1;
      ringPopulatedCount += 1;
    }

    const persistedSector = await upsertSector(
      {
        ...sector,
        metadata: ensureSectorNamingMetadata(sector, {
          ...(sector.metadata ?? {}),
          systemCount,
          hexPresenceGenerated: true,
          hexPresenceGeneratedAt: nowIso,
          occupiedHexes: seeded.occupiedHexes,
          hexStarTypes: seeded.hexStarTypes,
          isGalacticCenterSector: seeded.isGalacticCenterSector,
          centralAnomalyType: seeded.centerAnomalyType,
          centralAnomaly: seeded.centerAnomaly,
          centralAnomalyHex: seeded.centerAnomaly?.coord,
        }),
      },
      getGenerationRequestOptions(),
    );

    await systemStore.replaceSectorSystems(
      persistedSector.sectorId,
      buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
      getGenerationRequestOptions(),
    );

    processed += 1;
    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === resolvedTotal) {
      updateGenerationProgress(processed, resolvedTotal, progressLabel);
      await flushGenerationProgressUi();
      assertGenerationNotCancelled();
    }
  }

  const generatedSectorCount = processed;
  const stats = normalizeSectorStats({
    totalSectors: generatedSectorCount,
    populatedSectors: populatedSectorCount,
    generatedPresenceSectors: generatedSectorCount,
    emptySectors: Math.max(0, generatedSectorCount - populatedSectorCount),
    totalObjects: totalSystems,
    avgObjectsPerSector: generatedSectorCount > 0 ? totalSystems / generatedSectorCount : 0,
    lastUpdated: new Date().toISOString(),
  });

  await persistCachedSectorStats(galaxy, stats);
  currentGalaxySectorStats.value = stats;

  return {
    estimatedLayoutCount: resolvedTotal,
    namedSectorCount: generatedSectorCount,
    populatedSectorCount,
    totalSystems,
  };
}

async function generateCenterSectorSystemsForGalaxy(galaxy, { progressLabel = "Generating center sector" } = {}) {
  let centerSector = null;
  for (const sector of iterateGalaxySectorLayoutByRing(galaxy, { scale: "true" })) {
    if (isGalacticCenterSectorRecord(sector)) {
      centerSector = sector;
      break;
    }
  }
  return generateSectorSystemsForSectors(galaxy, centerSector ? [centerSector] : [], { progressLabel });
}

async function generateCenterSurroundingPresenceForGalaxy(
  galaxy,
  { progressLabel = "Generating center and surrounding sectors" } = {},
) {
  const sectors = [];
  for (const sector of iterateGalaxySectorLayoutByRing(galaxy, { scale: "true" })) {
    if (sectorRingDistance(sector) > 1) {
      break;
    }
    sectors.push(sector);
  }

  return generateSectorPresenceForSectors(galaxy, sectors, { progressLabel });
}

async function generateExpandingCenterSectorsForGalaxy(galaxy, { progressLabel = "Expanding from center" } = {}) {
  return generateSectorSystemsForSectors(galaxy, iterateGalaxySectorLayoutByRing(galaxy, { scale: "true" }), {
    progressLabel,
    stopAfterEmptyRing: true,
    totalCount: estimateGalaxySectorLayoutCount(galaxy, { scale: "true" }),
  });
}

async function doGenerateFullGalaxy() {
  const galaxy = currentGalaxy.value;
  if (!galaxy?.galaxyId) {
    toastService.error("No galaxy selected.");
    return;
  }

  isGeneratingFullGalaxy.value = true;
  beginGenerationRequestScope();
  try {
    const result = await generateFullGalaxyForGalaxy(galaxy);
    if (result.estimatedLayoutCount === 0) {
      toastService.warning("Could not generate sector layout for this galaxy.");
      return;
    }

    await sectorStore.loadSectors(galaxy.galaxyId);
    await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });

    toastService.success(
      `Sector systems generated — persisted ${result.populatedSectorCount.toLocaleString()} non-empty sectors with ${result.totalSystems.toLocaleString()} sector systems assigned.`,
    );
  } catch (err) {
    if (isGalaxySurveyGenerationCancelledError(err)) {
      return;
    }
    console.error(`[Generate Sectors And Systems] Error:`, err);
    toastService.error(`Failed to generate sectors and systems: ${err.message}`);
  } finally {
    isGeneratingFullGalaxy.value = false;
    clearGenerationRequestScope();
    resetGenerationProgress();
  }
}

async function runGalaxySurveyGenerationMode() {
  const galaxy = currentGalaxy.value;
  if (!galaxy?.galaxyId) {
    toastService.error("No galaxy selected for generation.");
    return;
  }

  isGeneratingSectors.value = true;
  beginGenerationRequestScope();
  const startedAt = Date.now();
  try {
    let result = null;
    if (galaxySurveyGenerationMode.value === "names") {
      result = await doGenerateAllSectors();
      return;
    }
    if (galaxySurveyGenerationMode.value === "presence") {
      result = await generateSectorPresenceForGalaxy(galaxy);
      await sectorStore.loadSectors(galaxy.galaxyId);
      await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
      recordGalaxySurveyHistory({
        galaxyId: galaxy.galaxyId,
        label: "Generated Presence",
        detail: `Processed ${result.namedSectorCount.toLocaleString()} sectors and found ${result.totalSystems.toLocaleString()} occupied hexes.`,
        metrics: buildHistoryMetrics({
          mode: "presence",
          scope: "galaxy",
          sectors: result.namedSectorCount,
          populatedSectors: result.populatedSectorCount,
          systems: result.totalSystems,
          durationMs: Date.now() - startedAt,
        }),
      });
      toastService.success(
        `Processed ${result.namedSectorCount.toLocaleString()} sectors and found ${result.totalSystems.toLocaleString()} occupied hexes.`,
      );
      return;
    }
    if (galaxySurveyGenerationMode.value === "systems") {
      result = await generateFullGalaxyForGalaxy(galaxy, { progressLabel: "Generating galaxy systems" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
      recordGalaxySurveyHistory({
        galaxyId: galaxy.galaxyId,
        label: "Generated Galaxy Systems",
        detail: `Processed ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems.`,
        metrics: buildHistoryMetrics({
          mode: "systems",
          scope: "galaxy",
          sectors: result.namedSectorCount,
          populatedSectors: result.populatedSectorCount,
          systems: result.totalSystems,
          durationMs: Date.now() - startedAt,
        }),
      });
      toastService.success(
        `Processed ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems.`,
      );
      return;
    }
    if (galaxySurveyGenerationMode.value === "center") {
      result = await generateCenterSectorSystemsForGalaxy(galaxy, { progressLabel: "Generating center sector" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
      recordGalaxySurveyHistory({
        galaxyId: galaxy.galaxyId,
        label: "Generated Center Sector",
        detail: `Generated ${result.totalSystems.toLocaleString()} systems in the center sector.`,
        metrics: buildHistoryMetrics({
          mode: "center",
          scope: "ring 0",
          sectors: result.namedSectorCount,
          populatedSectors: result.populatedSectorCount,
          systems: result.totalSystems,
          durationMs: Date.now() - startedAt,
        }),
      });
      toastService.success(`Generated ${result.totalSystems.toLocaleString()} systems in the center sector.`);
      return;
    }
    if (galaxySurveyGenerationMode.value === "expand") {
      result = await generateExpandingCenterSectorsForGalaxy(galaxy, { progressLabel: "Expanding from center" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      await syncGenerationFrontierSelection({ preferMode: "systems", announce: true });
      recordGalaxySurveyHistory({
        galaxyId: galaxy.galaxyId,
        label: "Expanded From Center",
        detail: `Expanded through ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems.`,
        metrics: buildHistoryMetrics({
          mode: "expand",
          scope: "radial expansion",
          sectors: result.namedSectorCount,
          populatedSectors: result.populatedSectorCount,
          systems: result.totalSystems,
          durationMs: Date.now() - startedAt,
        }),
      });
      toastService.success(
        `Expanded through ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems before reaching an empty ring.`,
      );
    }
  } catch (err) {
    if (isGalaxySurveyGenerationCancelledError(err)) {
      return;
    }
    toastService.error(`Failed to run generation mode: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
    clearGenerationRequestScope();
    resetGenerationProgress();
  }
}

function showDeleteConfirm() {
  if (currentGalaxy.value) {
    confirmDialog.value.isOpen = true;
    confirmDialog.value.galaxyIdToDelete = currentGalaxy.value.galaxyId;
  }
}

async function confirmDeleteGalaxy() {
  confirmDialog.value.isOpen = false;
  const galaxyId = confirmDialog.value.galaxyIdToDelete;
  if (!galaxyId) return;

  try {
    const galaxyName = galaxies.value.find((g) => g.galaxyId === galaxyId)?.name || galaxyId;
    await galaxyStore.deleteGalaxy(galaxyId);
    toastService.success(`Galaxy "${galaxyName}" deleted successfully`);
  } catch (err) {
    toastService.error(`Failed to delete galaxy: ${err.message}`);
  } finally {
    confirmDialog.value.galaxyIdToDelete = null;
  }
}

function cancelDeleteGalaxy() {
  confirmDialog.value.isOpen = false;
  confirmDialog.value.galaxyIdToDelete = null;
}

function regenerateGalaxy() {
  if (!currentGalaxy.value) {
    toastService.error("No galaxy selected.");
    return;
  }

  rerollGalaxyDraft();
}

function showFullRegenerateConfirm() {
  if (!currentGalaxy.value || !isEditingGalaxy.value) {
    return;
  }

  const galaxyName = String(currentGalaxy.value.name || currentGalaxy.value.galaxyId || "this galaxy");
  regenerateDialog.value.title = `Full Regenerate ${galaxyName}`;
  regenerateDialog.value.confirmText = "Full Regenerate";
  regenerateDialog.value.message =
    `Apply the current draft to ${galaxyName} and permanently clear ` +
    `${destructiveRegenerateSummary.value.sectorCount.toLocaleString()} generated sector` +
    `${destructiveRegenerateSummary.value.sectorCount === 1 ? "" : "s"} and ` +
    `${destructiveRegenerateSummary.value.systemCount.toLocaleString()} cached system` +
    `${destructiveRegenerateSummary.value.systemCount === 1 ? "" : "s"}? You will need to regenerate sector content afterwards.`;
  regenerateDialog.value.isOpen = true;
}

function cancelFullRegenerate() {
  regenerateDialog.value.isOpen = false;
}

async function confirmFullRegenerate() {
  regenerateDialog.value.isOpen = false;
  const galaxy = currentGalaxy.value;
  if (!galaxy) {
    return;
  }

  const nextName = String(galaxyEditForm.value.name || "").trim();
  if (!nextName) {
    toastService.error("Galaxy name cannot be empty.");
    return;
  }

  const duplicateName = galaxies.value.some(
    (entry) => entry.galaxyId !== galaxy.galaxyId && (entry.name || "").trim().toLowerCase() === nextName.toLowerCase(),
  );
  if (duplicateName) {
    toastService.error("A galaxy with this name already exists. Choose a different name.");
    return;
  }

  isApplyingFullRegenerate.value = true;
  const startedAt = Date.now();
  try {
    const payload = buildGalaxyEditPayload({
      galaxy,
      nextName,
      galaxyEditForm: galaxyEditForm.value,
      clamp,
    });
    await galaxyStore.updateGalaxy(galaxy.galaxyId, payload);

    const sectors = await sectorStore.loadSectors(galaxy.galaxyId).catch(() => currentGalaxySectors.value);
    for (const sector of Array.isArray(sectors) ? sectors : []) {
      const sectorId = String(sector?.sectorId || "").trim();
      if (!sectorId) {
        continue;
      }
      await deleteSector(sectorId);
    }

    sectorStore.sectors = sectorStore.sectors.filter(
      (sector) => String(sector?.galaxyId || "") !== String(galaxy.galaxyId),
    );
    systemStore.systems = systemStore.systems.filter(
      (system) => String(system?.galaxyId || "") !== String(galaxy.galaxyId),
    );

    const resetStats = normalizeSectorStats({
      totalSectors: 0,
      populatedSectors: 0,
      generatedPresenceSectors: 0,
      emptySectors: 0,
      totalObjects: 0,
      avgObjectsPerSector: 0,
      legacyReconstructedCount: 0,
      legacyHierarchyUnknownCount: 0,
    });
    await persistCachedSectorStats(payload, resetStats);
    currentGalaxySectorStats.value = resetStats;
    isEditingGalaxy.value = false;
    recordGalaxySurveyHistory({
      galaxyId: galaxy.galaxyId,
      label: "Full Regenerate",
      detail: `Applied rerolled draft and cleared ${destructiveRegenerateSummary.value.sectorCount.toLocaleString()} sectors.`,
      metrics: buildHistoryMetrics({
        mode: "full-regenerate",
        scope: "galaxy",
        sectors: destructiveRegenerateSummary.value.sectorCount,
        systems: destructiveRegenerateSummary.value.systemCount,
        durationMs: Date.now() - startedAt,
      }),
    });

    toastService.success(
      `Galaxy "${nextName}" rerolled and cleared. Generate sectors again to build the new galaxy footprint.`,
    );
  } catch (err) {
    toastService.error(`Failed to full regenerate galaxy: ${err.message}`);
  } finally {
    isApplyingFullRegenerate.value = false;
  }
}

async function exportGalaxy() {
  if (!currentGalaxy.value) {
    return;
  }

  try {
    const exportPayload = buildGalaxyExportPayload({
      galaxy: currentGalaxy.value,
      sectorStats: currentGalaxySectorStats.value,
      sectors: currentGalaxySectors.value,
    });
    const exported = await exportGalaxyArchive({
      data: exportPayload,
      filename: (galaxy) => `${galaxy?.name || galaxy?.galaxyId || "Galaxy"}-Galaxy.json`,
      serializeMessage: "Serializing galaxy manifest...",
      encodeMessage: "Encoding galaxy archive for transfer...",
      readyMessage: "Galaxy archive staged for local transfer.",
      serializingProgress: 18,
      encodingProgress: 62,
    });
    if (exported) {
      toastService.success("Galaxy exported successfully");
    }
  } catch (err) {
    toastService.error(`Failed to export galaxy: ${err.message}`);
  }
}

function buildSystemsResetHexStarTypes(metadata = {}) {
  const nextEntries = Object.entries(
    metadata?.hexStarTypes && typeof metadata.hexStarTypes === "object" ? metadata.hexStarTypes : {},
  )
    .filter(([, info]) => String(info?.anomalyType || "").trim())
    .map(([coord, info]) => [coord, normalizeHexStarTypeRecord(info, info?.anomalyType || "Black Hole")]);

  const centerCoord = String(metadata?.centralAnomalyHex || metadata?.centralAnomaly?.coord || "").trim();
  const centerType = String(metadata?.centralAnomalyType || metadata?.centralAnomaly?.type || "").trim();
  if (centerCoord && centerType && !nextEntries.some(([coord]) => coord === centerCoord)) {
    const anomalyMetadata = buildHexStarTypeMetadata({
      anomalyType: centerType,
      fallbackStarType: centerType,
    });
    nextEntries.push([
      centerCoord,
      {
        starType: anomalyMetadata.starType,
        starClass: "anomaly-core",
        secondaryStars: anomalyMetadata.secondaryStars,
        generatedStars: anomalyMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: anomalyMetadata.anomalyType,
      },
    ]);
  }

  return Object.fromEntries(nextEntries);
}

async function resetGalaxyGeneratedContent({ level = "systems", sectorIds = null } = {}) {
  const galaxy = currentGalaxy.value;
  if (!galaxy?.galaxyId) {
    toastService.error("No galaxy selected.");
    return;
  }

  const targetSectors = (
    Array.isArray(sectorIds) && sectorIds.length
      ? currentGalaxySectors.value.filter((sector) => sectorIds.includes(sector.sectorId))
      : currentGalaxySectors.value
  ).filter(Boolean);

  if (!targetSectors.length) {
    toastService.warning("No persisted sectors matched this reset request.");
    return;
  }

  isApplyingSectorReset.value = true;
  const startedAt = Date.now();
  try {
    for (const sector of targetSectors) {
      const metadata = sector?.metadata && typeof sector.metadata === "object" ? sector.metadata : {};
      const occupiedHexes = Array.isArray(metadata.occupiedHexes) ? [...metadata.occupiedHexes] : [];
      const nextMetadata =
        level === "presence"
          ? ensureSectorNamingMetadata(sector, {
              ...metadata,
              systemCount: 0,
              occupiedHexes: [],
              hexStarTypes: {},
              hexPresenceGenerated: false,
              hexPresenceGeneratedAt: null,
            })
          : ensureSectorNamingMetadata(sector, {
              ...metadata,
              systemCount: occupiedHexes.length,
              occupiedHexes,
              hexStarTypes: buildSystemsResetHexStarTypes(metadata),
              hexPresenceGenerated: occupiedHexes.length > 0,
            });

      await sectorStore.updateSector(sector.sectorId, {
        ...sector,
        metadata: nextMetadata,
      });
      await systemStore.replaceSectorSystems(sector.sectorId, []);
    }

    await sectorStore.loadSectors(galaxy.galaxyId);
    await loadCurrentGalaxySectorStats({ galaxyId: galaxy.galaxyId, silent: true, force: true });
    recordGalaxySurveyHistory({
      galaxyId: galaxy.galaxyId,
      label: level === "presence" ? "Cleared Presence + Systems" : "Cleared Systems",
      detail: `${level === "presence" ? "Reset survey presence and systems for" : "Reset systems for"} ${targetSectors.length.toLocaleString()} sector${targetSectors.length === 1 ? "" : "s"}.`,
      metrics: buildHistoryMetrics({
        mode: level,
        scope: targetSectors.length === currentGalaxySectors.value.length ? "galaxy" : "subset",
        sectors: targetSectors.length,
        durationMs: Date.now() - startedAt,
      }),
    });
    toastService.success(
      `${level === "presence" ? "Survey presence and systems" : "Systems"} cleared for ${targetSectors.length.toLocaleString()} sector${targetSectors.length === 1 ? "" : "s"}.`,
    );
  } catch (err) {
    toastService.error(`Failed to reset generated content: ${err.message}`);
  } finally {
    isApplyingSectorReset.value = false;
  }
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  return num.toLocaleString();
}
</script>

<style scoped>
.galaxy-survey {
  padding: 1.25rem;
}

.error-banner {
  background: rgba(220, 38, 38, 0.15);
  border-left: 4px solid #dc2626;
  padding: 0.75rem 1.5rem;
  margin: 0 0 1.5rem 0;
  border-radius: 0.25rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fca5a5;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.error-close {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.error-close:hover {
  color: #dc2626;
}

.control-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.galaxy-selector-bar {
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) auto;
  gap: 0.9rem;
  align-items: end;
  margin: 0 0 1rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #2a2a3a;
  border-radius: 0.5rem;
}

.galaxy-selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.galaxy-selector-label {
  color: #8fb3c9;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.galaxy-selector-select {
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid #2d5872;
  background: #10182a;
  color: #d9efff;
  border-radius: 0.4rem;
  padding: 0.55rem 0.75rem;
}

.survey-top-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0 0 1.5rem;
}

.survey-top-actions--compact {
  margin: 0;
  justify-content: flex-end;
  align-items: center;
}

.galaxy-details {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #333;
}

.details-header-main {
  min-width: 0;
  flex: 1;
}

.details-header h2 {
  color: #00d9ff;
  margin: 0;
}

.galaxy-parameter-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 0 0 1rem;
}

.galaxy-parameter-pill {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid rgba(0, 217, 255, 0.18);
  border-radius: 0.45rem;
  background: rgba(6, 19, 35, 0.62);
}

.parameter-label {
  color: #88afc5;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.parameter-value {
  color: #e6f7ff;
  font-family: monospace;
  font-size: 0.88rem;
}

.inline-edit-title,
.inline-edit-input,
.inline-edit-select {
  border: 1px solid #2d5872;
  background: #10182a;
  color: #d9efff;
  border-radius: 0.35rem;
}

.inline-edit-title {
  width: min(100%, 420px);
  padding: 0.65rem 0.8rem;
  font-size: 1.55rem;
  font-weight: 700;
}

.inline-edit-input,
.inline-edit-select {
  min-width: 140px;
  padding: 0.4rem 0.55rem;
}

.inline-edit-badge-select {
  min-width: 180px;
  padding: 0.5rem 0.85rem;
  font-weight: 700;
}

.galaxy-type-badge {
  background: #00d9ff;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.details-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.detail-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.detail-section--strip {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
}

.detail-section--strip h3 {
  margin: 0;
  padding-top: 0.35rem;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.property-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.property {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

.property-strip .property {
  min-width: 150px;
  flex: 1 1 150px;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.3rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(0, 217, 255, 0.14);
  border-radius: 0.45rem;
  background: rgba(6, 19, 35, 0.52);
}

.property-strip .property-link-row {
  align-items: flex-start;
}

.property .label {
  color: #00ffff;
  font-weight: bold;
}

.property .value {
  color: #e0e0e0;
  font-family: monospace;
}

.property .inline-edit-input,
.property .inline-edit-select {
  width: 180px;
}

.property-strip .inline-edit-input,
.property-strip .inline-edit-select {
  width: 100%;
  min-width: 0;
}

.draft-delta-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.draft-delta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
}

.draft-delta-card {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid rgba(109, 210, 255, 0.18);
  border-radius: 0.5rem;
  background: rgba(7, 18, 34, 0.6);
}

.draft-delta-label {
  color: #8edaff;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.draft-delta-before,
.draft-delta-after,
.draft-delta-shift {
  color: #d9eef9;
  font-family: monospace;
}

.draft-delta-before {
  color: #9bb8c8;
}

.draft-delta-shift {
  color: #9ff0bd;
}

.draft-delta-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(255, 135, 112, 0.26);
  border-radius: 0.5rem;
  background: rgba(50, 19, 17, 0.34);
}

.draft-delta-copy {
  color: #f5d1c8;
  font-size: 0.82rem;
  line-height: 1.45;
}

.density-map-search-results,
.history-panel {
  min-width: 0;
}

.density-map-search-results {
  border: 1px solid rgba(0, 217, 255, 0.14);
  border-radius: 0.5rem;
  background: rgba(6, 19, 35, 0.52);
}

.property-link-row {
  align-items: center;
}

.property-link-chip {
  padding: 0.3rem 0.65rem;
  border: 1px solid rgba(143, 233, 255, 0.45);
  border-radius: 999px;
  background: rgba(143, 233, 255, 0.08);
  color: #bcefff;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.76rem;
  letter-spacing: 0.01em;
  transition: all 0.18s ease;
}

.property-link-chip:hover {
  color: #e9fbff;
  border-color: rgba(143, 233, 255, 0.8);
  background: rgba(143, 233, 255, 0.16);
}

.property-link-chip.chip-has-coordinates {
  border-color: rgba(123, 229, 158, 0.65);
  background: rgba(123, 229, 158, 0.16);
  color: #9ff0be;
}

.property-link-chip.chip-has-coordinates:hover {
  border-color: rgba(123, 229, 158, 0.95);
  background: rgba(123, 229, 158, 0.26);
  color: #d7ffe6;
}

.property-link-chip.chip-missing-coordinates {
  border-color: rgba(255, 193, 92, 0.72);
  background: rgba(255, 193, 92, 0.15);
  color: #ffd898;
}

.property-link-chip.chip-missing-coordinates:hover {
  border-color: rgba(255, 193, 92, 0.95);
  background: rgba(255, 193, 92, 0.24);
  color: #ffe8c1;
}

.anomaly-preview {
  margin-top: 0.35rem;
  padding: 0.75rem;
  border: 1px solid #2a5b74;
  border-radius: 0.35rem;
  background: rgba(9, 31, 43, 0.55);
}

.anomaly-preview-title {
  color: #9ce8ff;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.45rem;
}

.anomaly-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem 0.8rem;
}

.anomaly-preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.preview-label {
  color: #90c6d8;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-value {
  color: #e6f7ff;
  font-family: monospace;
  font-size: 0.86rem;
}

.preview-delta {
  font-size: 0.73rem;
  font-family: monospace;
}

.preview-delta-neutral {
  color: #9cb7c3;
}

.preview-delta-up {
  color: #8ae3ae;
}

.preview-delta-down {
  color: #ffb6a8;
}

@media (max-width: 1040px) {
  .detail-section--strip {
    grid-template-columns: 1fr;
  }

  .detail-section--strip h3 {
    padding-top: 0;
  }

  .draft-delta-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .density-map-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .frontier-banner-actions,
  .generation-progress-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.region-item {
  background: #2a2a3e;
  padding: 1rem;
  border-radius: 0.25rem;
  border-left: 3px solid #00d9ff;
}

.region-item strong {
  color: #00d9ff;
}

.region-item p {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.density-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.density-badge.core {
  background: #ff6b6b;
  color: #fff;
}

.density-badge.dense {
  background: #ffd93d;
  color: #000;
}

.density-badge.scattered {
  background: #6bcf7f;
  color: #fff;
}

.galaxy-density-map-wrapper {
  margin: 1rem 0 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #2a2a3a;
  border-radius: 0.5rem;
}

.galaxy-density-map-wrapper h3 {
  margin: 0 0 0.4rem;
  color: #00d9ff;
  font-size: 1rem;
}

.density-map-hint {
  font-size: 0.8rem;
  color: #888;
  margin: 0 0 0.25rem;
}

.density-map-scale {
  font-size: 0.75rem;
  color: #5a8aaa;
  margin: 0 0 1rem;
  font-family: monospace;
}

.density-map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0 0 0.85rem;
}

.density-map-search {
  flex: 1 1 220px;
  max-width: 320px;
}

.density-map-filter-select {
  border: 1px solid #2d5872;
  background: #10182a;
  color: #d9efff;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
}

.density-map-toolbar-meta {
  color: #8fb3c9;
  font-size: 0.78rem;
}

.density-map-search-input {
  width: 100%;
  border: 1px solid #2d5872;
  background: #10182a;
  color: #d9efff;
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
}

.density-map-toolbar-label {
  color: #8fb3c9;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.density-map-zoom-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.2rem;
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.06);
}

.density-map-zoom-btn {
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  background: transparent;
  color: #8fb3c9;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.density-map-zoom-btn:hover {
  color: #d9f7ff;
}

.density-map-zoom-btn.active {
  background: #00d9ff;
  color: #04111a;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.35);
}

.density-map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.frontier-banner {
  position: sticky;
  top: 0.75rem;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.75rem;
  align-items: center;
  margin: 0 0 0.9rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(73, 200, 255, 0.28);
  border-radius: 0.55rem;
  background: linear-gradient(135deg, rgba(10, 31, 56, 0.94), rgba(8, 22, 36, 0.92));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

.frontier-banner-copy strong {
  display: block;
  color: #e6fbff;
}

.frontier-banner-copy p {
  margin: 0.3rem 0 0;
  color: #b9d8e8;
  font-size: 0.82rem;
  line-height: 1.45;
}

.frontier-banner-kicker {
  color: #77d8ff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.frontier-banner-meta {
  color: #9ec8dd;
  font-family: monospace;
  font-size: 0.8rem;
}

.frontier-banner-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.density-map-svg {
  border-radius: 6px;
  display: block;
}

.density-map-tile {
  cursor: pointer;
  stroke: transparent;
  stroke-width: 1.3;
  transition:
    stroke 0.18s ease,
    opacity 0.18s ease;
}

.density-map-tile:hover,
.density-map-tile--active {
  stroke: #f0f7ff;
}

.density-map-tile--persisted {
  opacity: 1;
}

.density-map-tile--dimmed {
  stroke-opacity: 0.25;
}

.density-map-tile--frontier {
  stroke: rgba(125, 229, 255, 0.95);
  stroke-width: 1.6;
}

.density-map-svg.pannable {
  cursor: grab;
  touch-action: none;
}

.density-map-svg.dragging {
  cursor: grabbing;
}

.density-map-gesture-hint {
  margin: 0;
  color: #7495ab;
  font-size: 0.74rem;
  text-align: center;
}

.density-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #888;
}

.density-map-search-results {
  width: min(100%, 640px);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem;
}

.density-map-search-result {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
  border: 1px solid rgba(0, 217, 255, 0.14);
  background: rgba(8, 24, 44, 0.72);
  color: #d8f5ff;
  border-radius: 0.45rem;
  padding: 0.55rem 0.7rem;
  cursor: pointer;
}

.density-map-search-result:hover {
  border-color: rgba(0, 217, 255, 0.4);
}

.density-map-search-result-name {
  font-weight: 700;
}

.density-map-search-result-meta {
  color: #8fb3c9;
  font-size: 0.76rem;
}

.legend-swatches {
  display: flex;
  gap: 2px;
}

.legend-swatch {
  width: 18px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
  padding-top: 1.2rem;
  border-top: 2px solid #333;
}

.generation-progress {
  margin-top: 0.9rem;
}

.generation-progress-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #d8f5ff;
  font-size: 0.85rem;
  margin-bottom: 0.45rem;
}

.generation-progress-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.55rem;
}

.generation-progress-cancel-note {
  color: #ffd6b8;
  font-size: 0.78rem;
}

.generation-progress-bar {
  margin: 0;
  height: 18px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.45rem 0.8rem;
  font-size: 0.78rem;
}

.btn-primary {
  background: #00d9ff;
  color: #000;
}

.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
}

.btn-secondary {
  background: #666;
  color: #fff;
}

.btn-secondary:hover {
  background: #888;
}

.btn-danger {
  background: #ff4444;
  color: #fff;
}

.btn-danger:hover {
  background: #ff6666;
}

.btn-info {
  background: #44aaff;
  color: #fff;
}

.btn-info:hover {
  background: #66bbff;
  box-shadow: 0 0 10px rgba(68, 170, 255, 0.5);
}

.btn-success {
  background: #22aa66;
  color: #fff;
}

.btn-success:hover {
  background: #33cc80;
  box-shadow: 0 0 10px rgba(34, 170, 102, 0.5);
}

.btn-success:disabled {
  background: #1a6644;
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 92vh;
  overflow: auto;
}

.modal-content--create {
  max-width: 1120px;
}

.modal-content h2 {
  color: #00d9ff;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #00ffff;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
}

.name-input-row {
  display: flex;
  gap: 0.5rem;
}

.name-input-row input {
  flex: 1;
}

.coord-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.45rem;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.field-hint {
  margin-top: 0.35rem;
  color: #99b9ce;
  font-size: 0.78rem;
}

.create-galaxy-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 1rem;
  align-items: start;
}

.create-galaxy-main {
  min-width: 0;
}

.create-galaxy-side {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 0;
}

.side-card {
  border: 1px solid rgba(0, 217, 255, 0.25);
  background: rgba(9, 18, 36, 0.85);
  border-radius: 0.4rem;
  padding: 0.7rem;
}

.planning-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.26rem 0;
  border-bottom: 1px dashed rgba(120, 180, 220, 0.24);
  font-size: 0.8rem;
}

.planning-row span {
  color: #9cc4de;
}

.planning-row strong {
  color: #d7f3ff;
}

.planning-runtime {
  padding: 0.08rem 0.42rem;
  border-radius: 999px;
  border: 1px solid transparent;
}

.planning-runtime--none {
  color: #8da7bb;
  background: rgba(124, 145, 160, 0.12);
  border-color: rgba(124, 145, 160, 0.25);
}

.planning-runtime--fast {
  color: #a5f0bf;
  background: rgba(74, 166, 112, 0.18);
  border-color: rgba(100, 201, 139, 0.34);
}

.planning-runtime--moderate {
  color: #ffe29a;
  background: rgba(176, 141, 57, 0.2);
  border-color: rgba(217, 179, 77, 0.35);
}

.planning-runtime--heavy {
  color: #ffc2b4;
  background: rgba(173, 85, 71, 0.2);
  border-color: rgba(225, 125, 108, 0.34);
}

.planning-warning {
  margin-top: 0.45rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(255, 156, 120, 0.44);
  background: rgba(124, 52, 40, 0.26);
  color: #ffd5ca;
  font-size: 0.76rem;
  line-height: 1.35;
}

@media (max-width: 980px) {
  .galaxy-selector-bar {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .galaxy-selector-meta,
  .survey-top-actions--compact {
    justify-content: flex-start;
  }

  .modal-content--create {
    max-width: 96vw;
  }

  .create-galaxy-layout {
    grid-template-columns: 1fr;
  }

  .create-galaxy-side {
    position: static;
  }

  .frontier-banner {
    grid-template-columns: 1fr;
  }
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #333;
  border-radius: 0.25rem;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff, #00ffff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: bold;
  font-size: 0.8rem;
  transition: width 0.3s ease;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions button {
  flex: 1;
}
</style>
