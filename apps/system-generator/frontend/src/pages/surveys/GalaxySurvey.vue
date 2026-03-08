<template>
  <div class="galaxy-survey">
    <SurveyNavigation :currentClass="'Galaxy'" @regenerate="regenerateGalaxy" @export="exportGalaxy" />

    <div class="survey-content">
      <!-- Galaxy Creation/Selection -->
      <div class="control-panel">
        <div class="control-group">
          <label>Galaxy Operation:</label>
          <button @click="showNewGalaxyForm = true" class="btn btn-primary">➕ Create New Galaxy</button>
          <button @click="showImportForm = true" class="btn btn-secondary">📥 Import Galaxy</button>
        </div>
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
            <h3>{{ galaxy.galaxyNames[0].name }}</h3>
            <p class="type">{{ galaxy.galaxyType.subtype }}</p>
            <p class="coords">({{ galaxy.galaxyCoordinates.x }}, {{ galaxy.galaxyCoordinates.y }})</p>
            <p class="systems">{{ formatNumber(galaxy.galaxyStatistics.estimatedStarSystems) }} systems</p>
          </div>
        </div>
      </div>

      <!-- Selected Galaxy Details -->
      <div v-if="currentGalaxy" class="galaxy-details">
        <div class="details-header">
          <h2>{{ currentGalaxy.galaxyNames[0].name }}</h2>
          <div class="galaxy-type-badge">{{ currentGalaxy.galaxyType.subtype }}</div>
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
                <span class="value">{{ currentGalaxy.galaxyType.classification }}</span>
              </div>
              <div class="property">
                <span class="label">Age:</span>
                <span class="value"> {{ currentGalaxy.physicalProperties.ageInBillionYears }} billion years </span>
              </div>
              <div class="property">
                <span class="label">Diameter:</span>
                <span class="value">
                  {{ currentGalaxy.galaxyDimensions.diameterInParsecs.toLocaleString() }} parsecs
                </span>
              </div>
            </div>
          </section>

          <!-- Statistics -->
          <section class="detail-section">
            <h3>📈 Statistics</h3>
            <div class="property-list">
              <div class="property">
                <span class="label">Estimated Systems:</span>
                <span class="value">
                  {{ formatNumber(currentGalaxy.galaxyStatistics.estimatedStarSystems) }}
                </span>
              </div>
              <div class="property">
                <span class="label">Mapped Systems:</span>
                <span class="value">
                  {{ currentGalaxy.galaxyStatistics.mappedSystems }}
                </span>
              </div>
              <div class="property">
                <span class="label">Explored Systems:</span>
                <span class="value">
                  {{ currentGalaxy.galaxyStatistics.exploredSystems }}
                </span>
              </div>
              <div class="property">
                <span class="label">Populated Worlds:</span>
                <span class="value">
                  {{ currentGalaxy.galaxyStatistics.populatedWorlds }}
                </span>
              </div>
            </div>
          </section>

          <!-- Regions -->
          <section class="detail-section" v-if="currentGalaxy.galaxyRegions?.length">
            <h3>🗺️ Regions</h3>
            <div class="region-list">
              <div v-for="region in currentGalaxy.galaxyRegions" :key="region.regionId" class="region-item">
                <strong>{{ region.regionName }}</strong>
                <p>{{ region.description }}</p>
                <span class="density-badge" :class="region.sectorDensity">
                  {{ region.sectorDensity }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="proceedToClass0" class="btn btn-primary">🔍 Class 0 Sector Survey →</button>
          <button @click="editGalaxy" class="btn btn-secondary">✏️ Edit Galaxy</button>
          <button @click="deleteGalaxy" class="btn btn-danger">🗑️ Delete Galaxy</button>
        </div>
      </div>

      <!-- New Galaxy Form (Modal) -->
      <div v-if="showNewGalaxyForm" class="modal-overlay" @click="showNewGalaxyForm = false">
        <div class="modal-content" @click.stop>
          <h2>Create New Galaxy</h2>
          <form @submit.prevent="createNewGalaxy">
            <div class="form-group">
              <label>Galaxy Name (Primary):</label>
              <input v-model="newGalaxyForm.primaryName" required />
            </div>
            <div class="form-group">
              <label>Galaxy Type:</label>
              <select v-model="newGalaxyForm.galaxyType">
                <option value="Spiral">Spiral</option>
                <option value="Barred Spiral">Barred Spiral</option>
                <option value="Elliptical">Elliptical</option>
                <option value="Lenticular">Lenticular</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
            <div class="form-group">
              <label>Coordinates - X:</label>
              <input v-model.number="newGalaxyForm.coordinateX" type="number" />
            </div>
            <div class="form-group">
              <label>Coordinates - Y:</label>
              <input v-model.number="newGalaxyForm.coordinateY" type="number" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Create Galaxy</button>
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
              <label>Target Coordinates - X:</label>
              <input v-model.number="importForm.targetX" type="number" />
            </div>
            <div class="form-group">
              <label>Target Coordinates - Y:</label>
              <input v-model.number="importForm.targetY" type="number" />
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";

const router = useRouter();
const galaxyStore = useGalaxyStore();

const galaxies = computed(() => galaxyStore.getAllGalaxies);
const currentGalaxy = computed(() => galaxyStore.getCurrentGalaxy);
const importInProgress = computed(() => galaxyStore.importInProgress);
const importProgress = computed(() => galaxyStore.importProgress);

const showNewGalaxyForm = ref(false);
const showImportForm = ref(false);

const newGalaxyForm = ref({
  primaryName: "",
  galaxyType: "Spiral",
  coordinateX: 0,
  coordinateY: 0,
});

const importForm = ref({
  targetX: 0,
  targetY: 0,
  fileData: null,
});

function selectGalaxy(galaxyId) {
  galaxyStore.setCurrentGalaxy(galaxyId);
}

async function createNewGalaxy() {
  const { calculateGalaxyDimensions, generateGalaxyType } = await import("../../utils/galaxySizeCalculator.js");

  const galaxyType = generateGalaxyType();
  const dimensions = calculateGalaxyDimensions({ galaxyType: newGalaxyForm.value.galaxyType });

  const newGalaxy = {
    galaxyCoordinates: {
      x: newGalaxyForm.value.coordinateX,
      y: newGalaxyForm.value.coordinateY,
      z: 0,
    },
    galaxyNames: [
      {
        name: newGalaxyForm.value.primaryName,
        language: "en",
        isDefault: true,
      },
    ],
    galaxyType,
    galaxyDimensions: dimensions,
    galaxyStatistics: {
      estimatedStarSystems: dimensions.estimatedStarSystems,
      mappedSystems: 0,
      exploredSystems: 0,
      populatedWorlds: 0,
      knownSophonts: 0,
      majorFactions: 0,
    },
    physicalProperties: {
      massInSolarMasses: 100000000000,
      radiusInParsecs: dimensions.radiusInParsecs,
      ageInBillionYears: 13.2,
      luminosity: "1 × 10^10 L☉",
    },
    galaxyRegions: [],
    linkedSectors: [],
  };

  galaxyStore.createGalaxy(newGalaxy);
  showNewGalaxyForm.value = false;
  newGalaxyForm.value = {
    primaryName: "",
    galaxyType: "Spiral",
    coordinateX: 0,
    coordinateY: 0,
  };
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      importForm.value.fileData = JSON.parse(e.target.result);
    };
    reader.readAsText(file);
  }
}

async function importGalaxyData() {
  if (!importForm.value.fileData) return;

  await galaxyStore.importGalaxy(importForm.value.fileData, {
    x: importForm.value.targetX,
    y: importForm.value.targetY,
    z: 0,
  });

  showImportForm.value = false;
  importForm.value = { targetX: 0, targetY: 0, fileData: null };
}

function proceedToClass0() {
  router.push({
    name: "SectorSurvey",
    params: { galaxyId: currentGalaxy.value.galaxyId },
  });
}

function editGalaxy() {
  // TODO: Implement edit functionality
}

function deleteGalaxy() {
  if (confirm("Delete this galaxy? This cannot be undone.")) {
    galaxyStore.deleteGalaxy(currentGalaxy.value.galaxyId);
  }
}

function regenerateGalaxy() {
  // TODO: Implement regeneration
}

function exportGalaxy() {
  const dataStr = JSON.stringify(currentGalaxy.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentGalaxy.value.galaxyNames[0].name}-Galaxy.json`;
  link.click();
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

.details-header h2 {
  color: #00d9ff;
  margin: 0;
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

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #333;
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
