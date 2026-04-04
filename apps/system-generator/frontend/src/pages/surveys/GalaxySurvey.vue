<template>
  <div class="galaxy-survey">
    <LoadingSpinner :isVisible="isLoading" message="Loading galaxies..." />
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

    <SurveyNavigation :currentClass="'Galaxy Survey'" @regenerate="regenerateGalaxy" @export="exportGalaxy" />

    <div class="survey-content">
      <!-- Error Message Display -->
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span>{{ errorMessage }}</span>
          <button @click="clearError" class="error-close">✕</button>
        </div>
      </div>

      <div class="survey-top-actions">
        <button type="button" class="btn btn-primary" @click="showNewGalaxyForm = true">➕ Create Galaxy</button>
        <button type="button" class="btn btn-secondary" @click="showImportForm = true">📥 Import Galaxy</button>
      </div>

      <!-- Galaxy List -->
      <div class="galaxies-grid">
        <div
          v-for="galaxy in galaxies"
          :key="galaxy.galaxyId"
          class="galaxy-card"
          :class="{ active: galaxy.galaxyId === currentGalaxy?.galaxyId }"
          @click="selectGalaxy(galaxy.galaxyId)"
        >
          <div class="galaxy-icon">🌌</div>
          <div class="galaxy-info">
            <h3>{{ galaxy.name }}</h3>
            <p class="type">{{ galaxy.type }}</p>
            <p class="id">{{ galaxy.galaxyId }}</p>
          </div>
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

        <div class="details-grid">
          <!-- Basic Properties -->
          <section class="detail-section">
            <h3>📊 Basic Properties</h3>
            <div class="property-list">
              <div class="property">
                <span class="label">Galaxy ID:</span>
                <span class="value">{{ currentGalaxy.galaxyId }}</span>
              </div>
              <div class="property">
                <span class="label">Type:</span>
                <template v-if="isEditingGalaxy">
                  <select v-model="galaxyEditForm.type" class="inline-edit-select" @change="onEditGalaxyTypeChange">
                    <option value="Spiral">Spiral</option>
                    <option value="Barred Spiral">Barred Spiral</option>
                    <option value="Elliptical">Elliptical</option>
                    <option value="Lenticular">Lenticular</option>
                    <option value="Irregular">Irregular</option>
                    <option value="Dwarf">Dwarf</option>
                  </select>
                </template>
                <span v-else class="value">{{ currentGalaxy.type }}</span>
              </div>
              <div class="property">
                <span class="label">Universe Coordinates:</span>
                <span class="value">{{ currentGalaxyCoordinatesLabel }}</span>
              </div>
              <div class="property property-link-row">
                <span class="label">Universe Map:</span>
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
              <div class="property">
                <span class="label">Bulge Radius:</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.bulgeRadius"
                    class="inline-edit-input"
                    type="number"
                    min="5000"
                    max="50000"
                  />
                </template>
                <span v-else class="value">{{ currentGalaxy.morphology?.bulgeRadius || "N/A" }} pc</span>
              </div>
              <div class="property">
                <span class="label">Disk Thickness:</span>
                <template v-if="isEditingGalaxy">
                  <input
                    v-model.number="galaxyEditForm.diskThickness"
                    class="inline-edit-input"
                    type="number"
                    min="500"
                    max="10000"
                  />
                </template>
                <span v-else class="value">{{ currentGalaxy.morphology?.diskThickness || "N/A" }} pc</span>
              </div>
            </div>
          </section>

          <!-- Morphology Details -->
          <section class="detail-section">
            <h3>🔬 Morphology</h3>
            <div class="property-list">
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

          <!-- Metadata -->
          <section class="detail-section">
            <h3>📋 Metadata</h3>
            <div class="property-list">
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

          <section class="detail-section">
            <h3>🗺️ Sector Statistics</h3>
            <div class="property-list">
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
              <div class="property property-link-row">
                <span class="label">Storage Cleanup:</span>
                <button
                  type="button"
                  class="property-link-chip"
                  :disabled="isPruningDefaultSectors || !currentGalaxy?.galaxyId"
                  @click="pruneCurrentGalaxyDefaultSectors"
                >
                  {{ isPruningDefaultSectors ? "Pruning..." : "Prune Empty Sectors" }}
                </button>
              </div>
              <div class="property">
                <span class="label">Cleanup Note:</span>
                <span class="value"
                  >Prune removes legacy empty placeholder sectors; run DB VACUUM offline to reclaim disk space.</span
                >
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
          <div class="density-map-container">
            <svg
              class="density-map-svg"
              :viewBox="`0 0 ${galaxyMapPreview.svgSize} ${galaxyMapPreview.svgSize}`"
              :width="galaxyMapPreview.svgSize"
              :height="galaxyMapPreview.svgSize"
            >
              <rect x="0" y="0" :width="galaxyMapPreview.svgSize" :height="galaxyMapPreview.svgSize" fill="#020209" />
              <rect
                v-for="tile in galaxyMapPreview.tiles"
                :key="tile.id"
                :x="tile.px - galaxyMapPreview.tileHalf"
                :y="tile.py - galaxyMapPreview.tileHalf"
                :width="galaxyMapPreview.tileSize"
                :height="galaxyMapPreview.tileSize"
                :fill="tile.color"
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
          <button @click="proceedToClass0" class="btn btn-primary">🔍 Class 0 Sector Survey →</button>
          <button
            @click="showSectorGenerateConfirm"
            class="btn btn-info"
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy"
            title="Generate and save all sectors for this galaxy based on its morphology"
          >
            {{ isGeneratingSectors ? "Generating…" : "🗺️ Generate All Sectors" }}
          </button>
          <button
            @click="showFullGalaxyConfirm"
            class="btn btn-success"
            :disabled="isGeneratingSectors || isGeneratingFullGalaxy"
            title="Generate all sectors and systems in sector, including star assignments for occupied hexes"
          >
            {{ isGeneratingFullGalaxy ? "Generating…" : "🌌 Generate Sectors And Systems" }}
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
                <div class="form-group">
                  <label>Generation Mode:</label>
                  <select v-model="newGalaxyForm.generationMode">
                    <option value="sectors">Generate just sectors</option>
                    <option value="presence">Generate sectors and does system exist</option>
                    <option value="systems">Generate sectors and systems in sector</option>
                    <option value="none">Do not generate sectors yet</option>
                  </select>
                  <div class="field-hint">
                    Choose whether creation only maps sector tiles, rolls hex-level system existence, or assigns full
                    system markers inside populated sectors.
                  </div>
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
                  <div class="anomaly-preview-title">Creation Planning</div>
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
                    <span>Spacing Guidance</span><strong>{{ draftSizing.separationRange }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Expected Populated Sectors</span>
                    <strong>{{ draftForecast.populatedSectorsLabel }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Estimated Systems</span>
                    <strong>{{ draftForecast.estimatedSystemsLabel }}</strong>
                  </div>
                  <div class="planning-row">
                    <span>Generation Time (rough)</span>
                    <strong
                      class="planning-runtime"
                      :class="`planning-runtime--${draftForecast.runtimeSeverity}`"
                      :title="draftForecast.formulaSummary"
                      >{{ draftForecast.estimatedRuntime }}</strong
                    >
                  </div>
                  <div v-if="draftForecast.showRuntimeWarning" class="planning-warning" role="status">
                    ⚠ Heavy generation expected. Consider lower core density, smaller bulge radius, or delayed sector
                    mapping.
                  </div>
                  <div class="field-hint">
                    Separation and generation values are rough planning estimates based on current morphology and
                    density settings.
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
      <div v-if="showImportForm" class="modal-overlay" @click="showImportForm = false">
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
            <div v-if="importProgress > 0" class="progress-bar">
              <div class="progress-fill" :style="{ width: importProgress + '%' }">{{ importProgress }}%</div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="importInProgress">
                {{ importInProgress ? "Importing..." : "Import Galaxy" }}
              </button>
              <button type="button" @click="showImportForm = false" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import { createSectorsBatch, getSectorStats, pruneDefaultSectors, upsertSector } from "../../api/sectorApi.js";
import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import * as toastService from "../../utils/toast.js";
import { generateGalaxyName, generatePhonotacticName } from "../../utils/nameGenerator.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import {
  estimateGalaxySectorLayoutCount,
  generateGalaxySectorLayout,
  iterateGalaxySectorLayout,
} from "../../utils/sectorLayoutGenerator.js";
import { generateClusteredUniverseCoordinates } from "../../../../backend/generators/utils/universePlacement.js";

const router = useRouter();
const route = useRoute();
const galaxyStore = useGalaxyStore();
const preferencesStore = usePreferencesStore();

const galaxies = computed(() => galaxyStore.getAllGalaxies);
const currentGalaxy = computed(() => galaxyStore.getCurrentGalaxy);
const importInProgress = computed(() => galaxyStore.importInProgress);
const importProgress = computed(() => galaxyStore.importProgress);
const isLoading = computed(() => galaxyStore.isLoading);

const showNewGalaxyForm = ref(false);
const showImportForm = ref(false);
const errorMessage = ref("");
const isCreating = ref(false);
const isEditingGalaxy = ref(false);
const isGeneratingSectors = ref(false);
const isGeneratingFullGalaxy = ref(false);
const isRefreshingSectorStats = ref(false);
const isPruningDefaultSectors = ref(false);
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

const currentGalaxySectorStats = ref({
  totalSectors: 0,
  populatedSectors: 0,
  generatedPresenceSectors: 0,
  emptySectors: 0,
  totalObjects: 0,
  avgObjectsPerSector: 0,
  lastUpdated: null,
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
  generationMode: "sectors",
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
  if (newGalaxyForm.value.generationMode === "none") {
    return {
      populatedSectorsLabel: "Skipped",
      estimatedSystemsLabel: "Skipped",
      estimatedRuntime: "Skipped",
      runtimeSeverity: "none",
      showRuntimeWarning: false,
      formulaSummary: "Sector layout is disabled, so no generation runtime is estimated.",
    };
  }

  if (newGalaxyForm.value.generationMode === "sectors") {
    const totalSectors = draftSizing.value.totalSectors;
    let estimatedRuntime = "5-20s";
    let runtimeSeverity = "fast";

    if (totalSectors > 250000) {
      estimatedRuntime = "1-3m";
      runtimeSeverity = "moderate";
    } else if (totalSectors > 50000) {
      estimatedRuntime = "20-60s";
      runtimeSeverity = "moderate";
    }

    return {
      populatedSectorsLabel: totalSectors.toLocaleString(),
      estimatedSystemsLabel: "Deferred",
      estimatedRuntime,
      runtimeSeverity,
      showRuntimeWarning: runtimeSeverity !== "fast",
      formulaSummary:
        "Maps sector records only. No per-hex system-existence rolls are performed until you explicitly request them later.",
    };
  }

  const coreDensity = Math.max(0.01, Math.min(1, Number(newGalaxyForm.value.coreDensity) || 0.7));
  const galaxyType = String(newGalaxyForm.value.type || "Spiral");
  const typeFactor =
    {
      Dwarf: 0.55,
      Irregular: 0.72,
      Lenticular: 0.86,
      Elliptical: 0.96,
      Spiral: 1,
      "Barred Spiral": 1.05,
    }[galaxyType] ?? 1;

  const populatedRatio = Math.max(0.02, Math.min(0.65, 0.04 + coreDensity * 0.22 * typeFactor));
  const populatedSectors = Math.round(draftSizing.value.totalSectors * populatedRatio);

  const avgSystemsPerPopulated = Math.max(1.1, Math.min(8.5, 1.2 + coreDensity * 5.2));
  const estimatedSystems = Math.round(populatedSectors * avgSystemsPerPopulated);

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

  const generationMode = newGalaxyForm.value.generationMode;
  let estimatedRuntime = "10-30s";
  let runtimeSeverity = "fast";
  if (generationMode === "systems") {
    estimatedRuntime = "30-90s";
    runtimeSeverity = "moderate";
    if (populatedSectors > extremeThreshold) {
      estimatedRuntime = "10m+";
      runtimeSeverity = "heavy";
    } else if (populatedSectors > heavyThreshold) {
      estimatedRuntime = "3-10m";
      runtimeSeverity = "heavy";
    } else if (populatedSectors > moderateThreshold) {
      estimatedRuntime = "1-3m";
      runtimeSeverity = "moderate";
    }
  } else if (populatedSectors > extremeThreshold) {
    estimatedRuntime = "3m+";
    runtimeSeverity = "heavy";
  } else if (populatedSectors > heavyThreshold) {
    estimatedRuntime = "1-3m";
    runtimeSeverity = "heavy";
  } else if (populatedSectors > moderateThreshold) {
    estimatedRuntime = "30-90s";
    runtimeSeverity = "moderate";
  }

  const showRuntimeWarning = generationMode === "systems" ? runtimeSeverity !== "fast" : runtimeSeverity === "heavy";
  const formulaSummary =
    generationMode === "systems"
      ? `Estimated from total sectors × populated-sector ratio (type + core density adjusted), then multiplied by average systems per populated sector and per-system star assignment work. Thresholds: moderate > ${moderateThreshold.toLocaleString()}, heavy > ${heavyThreshold.toLocaleString()}, extreme > ${extremeThreshold.toLocaleString()} populated sectors.`
      : `Estimated from total sectors × populated-sector ratio (type + core density adjusted), then multiplied by average systems per populated sector. Thresholds: moderate > ${moderateThreshold.toLocaleString()}, heavy > ${heavyThreshold.toLocaleString()}, extreme > ${extremeThreshold.toLocaleString()} populated sectors.`;

  return {
    populatedSectorsLabel: `${populatedSectors.toLocaleString()} (${Math.round(populatedRatio * 100)}%)`,
    estimatedSystemsLabel: estimatedSystems.toLocaleString(),
    estimatedRuntime,
    runtimeSeverity,
    showRuntimeWarning,
    formulaSummary,
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

const currentGalaxyCoordinatesLabel = computed(() => {
  const coord = getGalaxyUniverseCoordinates(currentGalaxy.value);
  return coord ? `${Math.round(coord.x)}, ${Math.round(coord.y)}` : "Not set";
});

const hasCurrentGalaxyCoordinates = computed(() => Boolean(getGalaxyUniverseCoordinates(currentGalaxy.value)));
const mapChipLabel = computed(() =>
  hasCurrentGalaxyCoordinates.value
    ? "View Current Galaxy (Coordinates Set)"
    : "View Current Galaxy (Coordinates Missing)",
);
const mapChipTitle = computed(() =>
  hasCurrentGalaxyCoordinates.value
    ? "Open Universe Map focused on this galaxy"
    : "Open Universe Map and add coordinates for this galaxy",
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

async function pruneCurrentGalaxyDefaultSectors() {
  const galaxy = currentGalaxy.value;
  if (!galaxy?.galaxyId || isPruningDefaultSectors.value) {
    return;
  }

  const confirmed = window.confirm(
    `Prune empty placeholder sectors for "${galaxy.name || galaxy.galaxyId}"?\n\n` +
      "This keeps only meaningful/generated sectors and can greatly improve responsiveness.",
  );
  if (!confirmed) {
    return;
  }

  isPruningDefaultSectors.value = true;
  try {
    const result = await pruneDefaultSectors(galaxy.galaxyId);
    const deleted = Number(result?.deleted) || 0;

    await loadCurrentGalaxySectorStats({ galaxyId: galaxy.galaxyId, silent: true, force: true });

    toastService.success(
      `Pruned ${deleted.toLocaleString()} empty sectors. Run VACUUM while the API is offline to reclaim disk space.`,
    );
  } catch (err) {
    toastService.error(`Failed to prune empty sectors: ${err.message}`);
  } finally {
    isPruningDefaultSectors.value = false;
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

// Each sector tile is 32 parsecs wide × 40 parsecs tall (standard Traveller sector dimensions).
const SECTOR_WIDTH_PC = 32;
const SECTOR_HEIGHT_PC = 40;

const galaxyMapPreview = computed(() => {
  const galaxy = currentGalaxy.value;
  if (!galaxy) return null;

  const layout = generateGalaxySectorLayout(galaxy);
  if (!layout.length) return null;

  const gridRadius = layout[0]?.metadata?.gridRadius ?? 3;
  const gridDiameter = gridRadius * 2 + 1;
  const SVG_SIZE = 280;
  const PADDING = 12;
  const step = (SVG_SIZE - PADDING * 2) / gridDiameter;
  const tileSize = Math.max(2, step * 0.9);
  const tileHalf = tileSize / 2;
  const centerPx = SVG_SIZE / 2;
  const centerPy = SVG_SIZE / 2;

  // Actual parsec coverage: each tile is one sector = 32×40 pc.
  const widthPc = gridDiameter * SECTOR_WIDTH_PC;
  const heightPc = gridDiameter * SECTOR_HEIGHT_PC;
  const scaleLabel = `${gridDiameter}×${gridDiameter} sectors — ${widthPc.toLocaleString()} × ${heightPc.toLocaleString()} pc`;

  return {
    svgSize: SVG_SIZE,
    tileSize,
    tileHalf,
    centerPx,
    centerPy,
    densityColors: DENSITY_COLORS,
    scaleLabel,
    tiles: layout.map((s) => ({
      id: `${s.metadata.gridX}_${s.metadata.gridY}`,
      px: centerPx + s.metadata.gridX * step,
      py: centerPy + s.metadata.gridY * step,
      color: DENSITY_COLORS[s.densityClass] ?? DENSITY_COLORS[0],
      dc: s.densityClass,
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

    const generationMode = newGalaxyForm.value.generationMode;
    let sectorCount = 0;
    let generationSummary = null;
    const targetGalaxy = createdGalaxy ?? newGalaxy;
    if (generationMode !== "none") {
      const estimatedLayoutCount = estimateGalaxySectorLayoutCount(targetGalaxy, { scale: "true" });
      if (estimatedLayoutCount > 0) {
        try {
          const batchResult = await createTrueScaleSectorsInChunks(targetGalaxy);
          sectorCount = Number(batchResult?.created) || Number(batchResult?.total) || 0;
        } catch (batchErr) {
          toastService.warning(`Galaxy created but sector mapping failed: ${batchErr.message}`);
        }
      }
    }

    try {
      if (generationMode === "presence") {
        generationSummary = await generateSectorPresenceForGalaxy(targetGalaxy);
      } else if (generationMode === "systems") {
        generationSummary = await generateFullGalaxyForGalaxy(targetGalaxy, {
          progressLabel: "Generating sectors and systems",
        });
      }
    } catch (seedErr) {
      const failedStep = generationMode === "systems" ? "sector system generation" : "system existence generation";
      toastService.warning(`Galaxy created but ${failedStep} failed: ${seedErr.message}`);
    }

    let successMessage = `Galaxy "${newGalaxyForm.value.name}" created successfully!`;
    if (sectorCount > 0) {
      successMessage = `Galaxy "${newGalaxyForm.value.name}" created with ${sectorCount.toLocaleString()} sectors mapped.`;
    }
    if (generationMode === "presence" && generationSummary) {
      successMessage =
        `Galaxy "${newGalaxyForm.value.name}" created with ${sectorCount.toLocaleString()} sectors mapped ` +
        `and ${Number(generationSummary.totalSystems || 0).toLocaleString()} occupied hexes identified.`;
    } else if (generationMode === "systems" && generationSummary) {
      successMessage =
        `Galaxy "${newGalaxyForm.value.name}" created with ${sectorCount.toLocaleString()} sectors mapped ` +
        `and ${Number(generationSummary.totalSystems || 0).toLocaleString()} sector systems generated.`;
    }
    toastService.success(successMessage);
    const createdGalaxyId = createdGalaxy?.galaxyId || newGalaxy.galaxyId;
    await router.push({
      name: "UniverseMap",
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
      generationMode: "sectors",
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

function openUniverseMap() {
  const galaxyId = currentGalaxy.value?.galaxyId;
  router.push({
    name: "UniverseMap",
    query: galaxyId ? { galaxyId } : {},
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
  sectorGenerateDialog.value.message =
    `For every sector tile in "${name}", each hex (32 × 40) will be rolled to determine ` +
    "whether a stellar object is present — no full system generation, just occupied/empty. " +
    "Only non-empty sectors will be persisted to keep storage and load times fast. Continue?";
  sectorGenerateDialog.value.isOpen = true;
}

async function confirmGenerateSectors() {
  sectorGenerateDialog.value.isOpen = false;
  await doGenerateAllSectors();
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
const SUBSECTOR_LETTERS = Object.freeze([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
]);

function randomSectorName() {
  const mode = preferencesStore.sectorNameMode;
  if (mode === "list") {
    return SECTOR_NAMES[Math.floor(Math.random() * SECTOR_NAMES.length)];
  }
  return generatePhonotacticName({ style: mode, syllablesMin: 2, syllablesMax: 3 });
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

function getGalaxyCentralAnomalyType(galaxy) {
  const raw = String(galaxy?.morphology?.centralAnomaly?.type || "").trim();
  return raw || "Black Hole";
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
    };
  }

  const centerCoord = sectorHexCoord(Math.ceil(HEX_PRESENCE_COLS / 2), Math.ceil(HEX_PRESENCE_ROWS / 2));
  const centerAnomalyType = getGalaxyCentralAnomalyType(galaxy);
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
      },
    };
  }

  return {
    occupiedHexes: nextOccupied,
    hexStarTypes: nextHexStarTypes,
    isGalacticCenterSector: true,
    centerAnomalyType,
  };
}

async function seedGalacticCenterSector(galaxy) {
  const layout = generateGalaxySectorLayout(galaxy, { scale: "true" });
  const centerSector = layout.find((sector) => isGalacticCenterSectorRecord(sector));
  if (!centerSector) return false;

  const seeded = ensureCenterAnomalyPresence({
    galaxy,
    sector: centerSector,
    occupiedHexes: [],
    hexStarTypes: {},
  });

  await upsertSector({
    ...centerSector,
    metadata: {
      ...(centerSector.metadata ?? {}),
      systemCount: seeded.occupiedHexes.length,
      hexPresenceGenerated: true,
      hexPresenceGeneratedAt: new Date().toISOString(),
      occupiedHexes: seeded.occupiedHexes,
      hexStarTypes: seeded.hexStarTypes,
      isGalacticCenterSector: true,
      centralAnomalyType: seeded.centerAnomalyType,
    },
  });

  return true;
}

async function createTrueScaleSectorsInChunks(galaxy, { chunkSize = 1000 } = {}) {
  const layout = generateGalaxySectorLayout(galaxy, { scale: "true" });
  if (!layout.length) {
    return { created: 0, total: 0 };
  }

  let created = 0;
  for (let index = 0; index < layout.length; index += chunkSize) {
    const chunk = layout.slice(index, index + chunkSize);
    const result = await createSectorsBatch(chunk);
    if (Array.isArray(result)) {
      created += result.length;
    } else {
      created += Number(result?.created ?? chunk.length) || chunk.length;
    }
  }

  return { created, total: layout.length };
}

async function generateSectorPresenceForGalaxy(galaxy) {
  const estimatedLayoutCount = estimateGalaxySectorLayoutCount(galaxy, { scale: "true" });
  if (estimatedLayoutCount === 0) {
    return { estimatedLayoutCount: 0, persistedSectorCount: 0, totalSystems: 0 };
  }

  startGenerationProgress("Generating sector presence", estimatedLayoutCount);

  let totalSystems = 0;
  let persistedSectorCount = 0;
  let processed = 0;
  const nowIso = new Date().toISOString();

  for (const sector of iterateGalaxySectorLayout(galaxy, { scale: "true" })) {
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

    const seeded = ensureCenterAnomalyPresence({
      galaxy,
      sector,
      occupiedHexes,
      hexStarTypes: null,
    });
    const nextOccupiedHexes = seeded.occupiedHexes;

    const systemCount = nextOccupiedHexes.length;
    totalSystems += systemCount;
    processed += 1;

    if (systemCount > 0) {
      await upsertSector({
        ...sector,
        metadata: {
          ...(sector.metadata ?? {}),
          systemCount,
          hexPresenceGenerated: true,
          hexPresenceGeneratedAt: nowIso,
          occupiedHexes: nextOccupiedHexes,
          isGalacticCenterSector: seeded.isGalacticCenterSector,
          centralAnomalyType: seeded.centerAnomalyType,
        },
      });
      persistedSectorCount += 1;
    }

    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === estimatedLayoutCount) {
      updateGenerationProgress(processed, estimatedLayoutCount, "Generating sector presence");
    }
  }

  const stats = normalizeSectorStats({
    totalSectors: estimatedLayoutCount,
    populatedSectors: persistedSectorCount,
    generatedPresenceSectors: persistedSectorCount,
    emptySectors: Math.max(0, estimatedLayoutCount - persistedSectorCount),
    totalObjects: totalSystems,
    avgObjectsPerSector: estimatedLayoutCount > 0 ? totalSystems / estimatedLayoutCount : 0,
    lastUpdated: new Date().toISOString(),
  });

  await persistCachedSectorStats(galaxy, stats);
  currentGalaxySectorStats.value = stats;

  return {
    estimatedLayoutCount,
    persistedSectorCount,
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
    const estimatedLayoutCount = estimateGalaxySectorLayoutCount(galaxy, { scale: "true" });
    if (estimatedLayoutCount === 0) {
      toastService.warning("Could not generate sector layout for this galaxy.");
      return;
    }
    console.log(
      `[Generate All Sectors] Estimated ${estimatedLayoutCount} true-scale layout sectors for galaxy ${galaxy.galaxyId}`,
    );
    const { persistedSectorCount, totalSystems } = await generateSectorPresenceForGalaxy(galaxy);

    console.log(
      `[Generate All Sectors] Persisted ${persistedSectorCount}/${estimatedLayoutCount} sectors with ${totalSystems} total stellar objects`,
    );

    toastService.success(
      `Hex presence generated. Persisted ${persistedSectorCount.toLocaleString()} non-empty sectors across ${estimatedLayoutCount.toLocaleString()} layout sectors.`,
    );
  } catch (err) {
    console.error(`[Generate All Sectors] Error:`, err);
    toastService.error(`Failed to generate hex presence: ${err.message}`);
  } finally {
    isGeneratingSectors.value = false;
    resetGenerationProgress();
  }
}

// ── Full Galaxy Generation ────────────────────────────────────────────────────

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

function hasSecondary() {
  return Math.random() < 0.35;
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
  await doGenerateFullGalaxy();
}

function cancelFullGalaxy() {
  fullGalaxyDialog.value.isOpen = false;
}

async function generateFullGalaxyForGalaxy(galaxy, { progressLabel = "Generating sectors and systems" } = {}) {
  const estimatedLayoutCount = estimateGalaxySectorLayoutCount(galaxy, { scale: "true" });
  if (estimatedLayoutCount === 0) {
    return { estimatedLayoutCount: 0, persistedSectorCount: 0, totalSystems: 0 };
  }

  startGenerationProgress(progressLabel, estimatedLayoutCount);

  let totalSystems = 0;
  let persistedSectorCount = 0;
  let processed = 0;
  const nowIso = new Date().toISOString();

  for (const sector of iterateGalaxySectorLayout(galaxy, { scale: "true" })) {
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
          const secondary = hasSecondary() ? generatePrimaryStar() : null;
          const secondaryStars = secondary
            ? [secondary.designation || secondary.spectralType || secondary.persistedSpectralClass || "G2V"]
            : [];
          occupiedHexes.push(coord);
          hexStarTypes[coord] = {
            starType: primaryType,
            starClass: spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass || primaryType),
            secondaryStars,
            anomalyType: null,
          };
        }
      }
    }

    const seeded = ensureCenterAnomalyPresence({
      galaxy,
      sector,
      occupiedHexes,
      hexStarTypes,
    });
    const nextOccupiedHexes = seeded.occupiedHexes;
    const nextHexStarTypes = seeded.hexStarTypes;

    const systemCount = nextOccupiedHexes.length;
    totalSystems += systemCount;
    processed += 1;

    if (systemCount > 0) {
      const sectorDisplayName = randomSectorName();
      const subsectorNames = Object.fromEntries(SUBSECTOR_LETTERS.map((letter) => [letter, randomSectorName()]));

      await upsertSector({
        ...sector,
        metadata: {
          ...(sector.metadata ?? {}),
          displayName: sectorDisplayName,
          subsectorNames,
          systemCount,
          hexPresenceGenerated: true,
          hexPresenceGeneratedAt: nowIso,
          occupiedHexes: nextOccupiedHexes,
          hexStarTypes: nextHexStarTypes,
          isGalacticCenterSector: seeded.isGalacticCenterSector,
          centralAnomalyType: seeded.centerAnomalyType,
        },
      });
      persistedSectorCount += 1;
    }

    if (processed % GENERATION_PROGRESS_STEP === 0 || processed === estimatedLayoutCount) {
      updateGenerationProgress(processed, estimatedLayoutCount, progressLabel);
    }
  }

  const stats = normalizeSectorStats({
    totalSectors: estimatedLayoutCount,
    populatedSectors: persistedSectorCount,
    generatedPresenceSectors: persistedSectorCount,
    emptySectors: Math.max(0, estimatedLayoutCount - persistedSectorCount),
    totalObjects: totalSystems,
    avgObjectsPerSector: estimatedLayoutCount > 0 ? totalSystems / estimatedLayoutCount : 0,
    lastUpdated: new Date().toISOString(),
  });

  await persistCachedSectorStats(galaxy, stats);
  currentGalaxySectorStats.value = stats;

  return {
    estimatedLayoutCount,
    persistedSectorCount,
    totalSystems,
  };
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

function exportGalaxy() {
  try {
    const dataStr = JSON.stringify(currentGalaxy.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentGalaxy.value?.name || currentGalaxy.value?.galaxyId || "Galaxy"}-Galaxy.json`;
    link.click();
    toastService.success("Galaxy exported successfully");
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
  padding: 2rem;
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

.galaxies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.survey-top-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0 0 1.5rem;
}

.galaxy-card {
  background: #2a2a3e;
  border: 2px solid #333;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.galaxy-card:hover {
  border-color: #00d9ff;
  background: #3a3a4e;
}

.galaxy-card.active {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-color: #00d9ff;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

.galaxy-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.galaxy-info h3 {
  color: #00d9ff;
  margin-bottom: 0.5rem;
}

.type {
  color: #00ffff;
  font-size: 0.9rem;
}

.coords,
.systems {
  color: #aaa;
  font-size: 0.85rem;
}

.galaxy-details {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
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

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.property {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
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
  margin: 1.5rem 0 0;
  padding: 1.5rem;
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
  margin-top: 2rem;
  padding-top: 2rem;
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
