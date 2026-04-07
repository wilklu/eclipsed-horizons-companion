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
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy"
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
              <option value="Barred Spiral">Barred Spiral</option>
              <option value="Elliptical">Elliptical</option>
              <option value="Lenticular">Lenticular</option>
              <option value="Irregular">Irregular</option>
              <option value="Dwarf">Dwarf</option>
            </select>
          </template>
          <div v-else class="galaxy-type-badge">{{ currentGalaxy.type }}</div>
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
                v-for="tile in galaxyMapPreview.tiles"
                :key="tile.id"
                :x="tile.px - galaxyMapPreview.renderTileHalf"
                :y="tile.py - galaxyMapPreview.renderTileHalf"
                :width="galaxyMapPreview.renderTileSize"
                :height="galaxyMapPreview.renderTileSize"
                :fill="tile.color"
                :opacity="tile.opacity"
                rx="1"
                ry="1"
              >
                <title>Density Class {{ tile.dc }}</title>
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
              <span class="legend-label">Void</span>
              <div class="legend-swatches">
                <div
                  v-for="(color, i) in galaxyMapPreview.densityColors"
                  :key="i"
                  class="legend-swatch"
                  :style="{ background: color }"
                  :title="`Density Class ${i}`"
                />
              </div>
              <span class="legend-label">Dense Core</span>
            </div>
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
import { createSectorsBatch, getSectorStats, upsertSector } from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import * as toastService from "../../utils/toast.js";
import { generateGalaxyName, generatePhonotacticName } from "../../utils/nameGenerator.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";
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
const isRefreshingSectorStats = ref(false);
const galaxySurveyGenerationMode = ref("names");
const galaxyMapZoomLevel = ref("fit");
const galaxyMapPan = ref({ x: 0, y: 0 });
const galaxyMapPanState = ref({
  isDragging: false,
  pointerId: null,
  startClientX: 0,
  startClientY: 0,
  startPanX: 0,
  startPanY: 0,
});
const generationProgress = ref({
  active: false,
  label: "",
  current: 0,
  total: 0,
  startedAtMs: 0,
});

const generationProgressPercent = computed(() => {
  if (!generationProgress.value.active || generationProgress.value.total <= 0) return 0;
  const pct = Math.round((generationProgress.value.current / generationProgress.value.total) * 100);
  return Math.max(0, Math.min(100, pct));
});

function formatDuration(seconds) {
  const clamped = Math.max(0, Math.round(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

const generationProgressEtaLabel = computed(() => {
  const progress = generationProgress.value;
  if (!progress.active || progress.total <= 0) return "ETA --";
  if (progress.current <= 0 || progress.current >= progress.total) return "ETA --";
  if (progress.startedAtMs <= 0) return "ETA --";

  const elapsedSeconds = Math.max(1, (Date.now() - progress.startedAtMs) / 1000);
  const sectorsPerSecond = progress.current / elapsedSeconds;
  if (!Number.isFinite(sectorsPerSecond) || sectorsPerSecond <= 0) return "ETA --";

  const remaining = progress.total - progress.current;
  const etaSeconds = remaining / sectorsPerSecond;
  return `ETA ${formatDuration(etaSeconds)}`;
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

const currentGalaxySectorStats = ref({
  totalSectors: 0,
  populatedSectors: 0,
  generatedPresenceSectors: 0,
  emptySectors: 0,
  totalObjects: 0,
  avgObjectsPerSector: 0,
  lastUpdated: null,
});

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

const importForm = ref({
  fileData: null,
  placementMode: "clustered",
  placementSeed: "",
  coordinatesX: 0,
  coordinatesY: 0,
  clusterMinSeparation: 12,
  clusterMaxSeparation: 29,
  clusterClearance: 10,
  clusterSlotsPerRing: 16,
});

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
  const computed = calculateMorphologyFromAnomaly({
    type: newGalaxyForm.value.centralAnomalyType,
    massSolarMasses: newGalaxyForm.value.centralAnomalyMassSolar,
    activityIndex: newGalaxyForm.value.centralAnomalyActivity,
    galaxyType: newGalaxyForm.value.type,
    existingArmCount: newGalaxyForm.value.armCount,
  });

  newGalaxyForm.value.bulgeRadius = computed.bulgeRadius;
  newGalaxyForm.value.diskThickness = computed.diskThickness;
  newGalaxyForm.value.coreDensity = computed.coreDensity;
  newGalaxyForm.value.armCount = computed.armCount;
}

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
  return {
    totalSectors: Number(stats?.totalSectors) || 0,
    populatedSectors: Number(stats?.populatedSectors) || 0,
    generatedPresenceSectors: Number(stats?.generatedPresenceSectors) || 0,
    emptySectors: Number(stats?.emptySectors) || 0,
    totalObjects: Number(stats?.totalObjects) || 0,
    avgObjectsPerSector: Number(stats?.avgObjectsPerSector) || 0,
    lastUpdated: stats?.lastUpdated || new Date().toISOString(),
  };
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

  const payload = {
    ...galaxy,
    metadata: {
      ...(galaxy.metadata || {}),
      sectorStats: normalizeSectorStats(stats),
      lastModified: new Date().toISOString(),
    },
  };

  await galaxyStore.updateGalaxy(galaxy.galaxyId, payload);
}

async function loadCurrentGalaxySectorStats({
  galaxyId = currentGalaxy.value?.galaxyId,
  silent = false,
  force = false,
} = {}) {
  if (!galaxyId) {
    currentGalaxySectorStats.value = {
      totalSectors: 0,
      populatedSectors: 0,
      generatedPresenceSectors: 0,
      emptySectors: 0,
      totalObjects: 0,
      avgObjectsPerSector: 0,
      lastUpdated: new Date().toISOString(),
    };
    return;
  }

  if (!silent) {
    isRefreshingSectorStats.value = true;
  }

  try {
    const cached = getCachedSectorStats(galaxyId);
    if (!force && cached) {
      currentGalaxySectorStats.value = normalizeSectorStats(cached);
      return;
    }

    if (!force && !cached) {
      // For uncached large galaxies avoid blocking initial page loads.
      currentGalaxySectorStats.value = normalizeSectorStats(currentGalaxySectorStats.value);
      return;
    }

    const stats = await getSectorStats(galaxyId);
    const normalized = normalizeSectorStats(stats);
    currentGalaxySectorStats.value = normalized;

    const galaxy = getGalaxyById(galaxyId);
    if (galaxy) {
      await persistCachedSectorStats(galaxy, normalized);
    }
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

const galaxyMapZoomOptions = computed(() => GALAXY_MAP_ZOOM_OPTIONS);

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
    tiles: layout.map((s) => ({
      id: `${s.metadata.gridX}_${s.metadata.gridY}`,
      px: offsetX + s.metadata.gridX * step,
      py: offsetY + s.metadata.gridY * step,
      color: DENSITY_COLORS[s.densityClass] ?? DENSITY_COLORS[0],
      dc: s.densityClass,
      opacity: tileSize < 3 ? 0.82 : 1,
    })),
  };
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
    await loadCurrentGalaxySectorStats({ galaxyId: galaxy?.galaxyId, silent: true });
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

    const newGalaxy = {
      galaxyId: `gal-${Date.now()}`,
      name: newGalaxyForm.value.name,
      type: newGalaxyForm.value.type,
      morphology: {
        bulgeRadius: newGalaxyForm.value.bulgeRadius,
        armCount: newGalaxyForm.value.armCount,
        coreDensity: newGalaxyForm.value.coreDensity,
        diskThickness: newGalaxyForm.value.diskThickness,
        centralAnomaly: {
          type: newGalaxyForm.value.centralAnomalyType || "Black Hole",
          massSolarMasses: Number(newGalaxyForm.value.centralAnomalyMassSolar) || null,
          activityIndex: Number(newGalaxyForm.value.centralAnomalyActivity) || 0,
        },
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: "active",
        version: 1,
        universeCoordinates,
        universePlacementMode: newGalaxyForm.value.placementMode,
        universePlacementSeed: newGalaxyForm.value.placementSeed || null,
        universePlacementTuning: readPlacementTuning(newGalaxyForm.value),
      },
    };

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
    toastService.success(successMessage);
    const createdGalaxyId = createdGalaxy?.galaxyId || newGalaxy.galaxyId;
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
  if (importInProgress.value) {
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
    const mode = String(importForm.value.placementMode || "clustered");
    const coordinates =
      mode === "manual"
        ? {
            x: clampUniverseCoordinate(
              importForm.value.coordinatesX,
              universeBoundsRange.value.minX,
              universeBoundsRange.value.maxX,
            ),
            y: clampUniverseCoordinate(
              importForm.value.coordinatesY,
              universeBoundsRange.value.minY,
              universeBoundsRange.value.maxY,
            ),
          }
        : null;

    await galaxyStore.importGalaxy(importForm.value.fileData, {
      mode,
      coordinates,
      seed: importForm.value.placementSeed || undefined,
      tuning: readPlacementTuning(importForm.value),
    });
    toastService.success("Galaxy imported successfully!");
    showImportForm.value = false;
    importForm.value = {
      fileData: null,
      placementMode: "clustered",
      placementSeed: "",
      coordinatesX: 0,
      coordinatesY: 0,
      clusterMinSeparation: 12,
      clusterMaxSeparation: 29,
      clusterClearance: 10,
      clusterSlotsPerRing: 16,
    };
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

  const payload = {
    ...galaxy,
    name: nextName,
    type: galaxyEditForm.value.type,
    morphology: {
      ...(galaxy.morphology || {}),
      bulgeRadius: clamp(Number(galaxyEditForm.value.bulgeRadius) || 5000, 5000, 50000),
      armCount: clamp(Number(galaxyEditForm.value.armCount) || 0, 0, 12),
      coreDensity: clamp(Number(galaxyEditForm.value.coreDensity) || 0.7, 0.01, 1),
      diskThickness: clamp(Number(galaxyEditForm.value.diskThickness) || 1000, 500, 10000),
      centralAnomaly: {
        ...(galaxy.morphology?.centralAnomaly || {}),
        type: galaxyEditForm.value.centralAnomalyType,
        massSolarMasses: Math.max(1, Number(galaxyEditForm.value.centralAnomalyMassSolar) || 0),
        activityIndex: clamp(Number(galaxyEditForm.value.centralAnomalyActivity) || 0, 0, 1),
      },
    },
    metadata: {
      ...(galaxy.metadata || {}),
      lastModified: new Date().toISOString(),
    },
  };

  try {
    await galaxyStore.updateGalaxy(galaxy.galaxyId, payload);
    isEditingGalaxy.value = false;
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
    nextHexStarTypes = {
      ...hexStarTypes,
      [centerCoord]: {
        starType: centerAnomalyType,
        starClass: "anomaly-core",
        secondaryStars: [],
        anomalyType: centerAnomalyType,
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

      const primaryType = normalizeStarTypeValue(info?.starType, "G2V");
      const secondaryStarTypes = Array.isArray(info?.secondaryStars)
        ? info.secondaryStars.map((star) => normalizeStarTypeValue(star, "")).filter(Boolean)
        : [];
      const generatedStars = [
        {
          designation: primaryType,
          spectralType: primaryType,
          spectralClass: primaryType,
          isAnomaly: Boolean(info?.anomalyType),
        },
        ...secondaryStarTypes.map((spectralType) => ({
          designation: spectralType,
          spectralType,
          spectralClass: spectralType,
        })),
      ];

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
        companionStars: secondaryStarTypes.map((spectralClass) => ({ spectralClass })),
        metadata: {
          generatedSurvey: {
            stars: generatedStars,
          },
          source: "galaxy-survey",
          anomalyType: info?.anomalyType || null,
          ...(info?.anomalyDetails ? { anomalyDetails: info.anomalyDetails } : {}),
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

  const persistedSector = await upsertSector({
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
  });

  await systemStore.replaceSectorSystems(
    persistedSector.sectorId,
    buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
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
    const result = await createSectorsBatch(chunk);
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

    const result = await createSectorsBatch(chunk);
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

    const result = await createSectorsBatch(chunk);
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

    const persistedSector = await upsertSector({
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
    });

    await systemStore.replaceSectorSystems(
      persistedSector.sectorId,
      buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
    );

    processed += 1;
    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === resolvedTotal) {
      updateGenerationProgress(processed, resolvedTotal, progressLabel);
      await flushGenerationProgressUi();
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

function startGenerationProgress(label, total) {
  const now = Date.now();
  generationProgress.value = {
    active: true,
    label,
    current: 0,
    total: Math.max(0, Number(total) || 0),
    startedAtMs: now,
  };
}

async function flushGenerationProgressUi() {
  await nextTick();
  await new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      setTimeout(resolve, 0);
      return;
    }
    window.requestAnimationFrame(() => resolve());
  });
}

function updateGenerationProgress(
  current,
  total = generationProgress.value.total,
  label = generationProgress.value.label,
) {
  const previousStart = generationProgress.value.startedAtMs;
  const now = Date.now();
  generationProgress.value = {
    active: true,
    label,
    current: Math.max(0, Number(current) || 0),
    total: Math.max(0, Number(total) || 0),
    startedAtMs: previousStart > 0 ? previousStart : now,
  };
}

function resetGenerationProgress() {
  generationProgress.value = {
    active: false,
    label: "",
    current: 0,
    total: 0,
    startedAtMs: 0,
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
  try {
    const result = await generateNamedSectorsForGalaxy(galaxy, { progressLabel: "Naming sectors" });
    if (result.estimatedLayoutCount === 0) {
      toastService.warning("Could not generate sector layout for this galaxy.");
      return;
    }
    toastService.success(
      `Named ${result.namedSectorCount.toLocaleString()} sectors in ${galaxy.name || galaxy.galaxyId}.`,
    );
  } catch (err) {
    console.error(`[Generate Sector Names] Error:`, err);
    toastService.error(`Failed to name sectors: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
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
  const code = normalizeStarTypeValue(spectralClass, "G").charAt(0).toUpperCase();
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
          occupiedHexes.push(coord);
          hexStarTypes[coord] = {
            starType: primaryType,
            starClass: spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass || primaryType),
            secondaryStars: [],
            anomalyType: null,
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

    const persistedSector = await upsertSector({
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
    });

    await systemStore.replaceSectorSystems(
      persistedSector.sectorId,
      buildPersistedSystemRecordsForSector(persistedSector, seeded.hexStarTypes),
    );

    processed += 1;
    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === resolvedTotal) {
      updateGenerationProgress(processed, resolvedTotal, progressLabel);
      await flushGenerationProgressUi();
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
  try {
    const result = await generateFullGalaxyForGalaxy(galaxy);
    if (result.estimatedLayoutCount === 0) {
      toastService.warning("Could not generate sector layout for this galaxy.");
      return;
    }

    toastService.success(
      `Sector systems generated — persisted ${result.persistedSectorCount.toLocaleString()} non-empty sectors with ${result.totalSystems.toLocaleString()} sector systems assigned.`,
    );
  } catch (err) {
    console.error(`[Generate Sectors And Systems] Error:`, err);
    toastService.error(`Failed to generate sectors and systems: ${err.message}`);
  } finally {
    isGeneratingFullGalaxy.value = false;
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
  try {
    let result = null;
    if (galaxySurveyGenerationMode.value === "names") {
      result = await doGenerateAllSectors();
      return;
    }
    if (galaxySurveyGenerationMode.value === "presence") {
      result = await generateSectorPresenceForGalaxy(galaxy);
      await sectorStore.loadSectors(galaxy.galaxyId);
      toastService.success(
        `Processed ${result.namedSectorCount.toLocaleString()} sectors and found ${result.totalSystems.toLocaleString()} occupied hexes.`,
      );
      return;
    }
    if (galaxySurveyGenerationMode.value === "systems") {
      result = await generateFullGalaxyForGalaxy(galaxy, { progressLabel: "Generating galaxy systems" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      toastService.success(
        `Processed ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems.`,
      );
      return;
    }
    if (galaxySurveyGenerationMode.value === "center") {
      result = await generateCenterSectorSystemsForGalaxy(galaxy, { progressLabel: "Generating center sector" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      toastService.success(`Generated ${result.totalSystems.toLocaleString()} systems in the center sector.`);
      return;
    }
    if (galaxySurveyGenerationMode.value === "expand") {
      result = await generateExpandingCenterSectorsForGalaxy(galaxy, { progressLabel: "Expanding from center" });
      await sectorStore.loadSectors(galaxy.galaxyId);
      toastService.success(
        `Expanded through ${result.namedSectorCount.toLocaleString()} sectors and generated ${result.totalSystems.toLocaleString()} systems before reaching an empty ring.`,
      );
    }
  } catch (err) {
    toastService.error(`Failed to run generation mode: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
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
  // TODO: Implement regeneration
  toastService.info("Regeneration not yet implemented");
}

async function exportGalaxy() {
  if (!currentGalaxy.value) {
    return;
  }

  try {
    const exported = await exportGalaxyArchive({
      data: currentGalaxy,
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

.density-map-svg {
  border-radius: 6px;
  display: block;
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
