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

    <SurveyNavigation :currentClass="'Galaxy'" @regenerate="regenerateGalaxy" @export="exportGalaxy" />

    <div class="survey-content">
      <!-- Error Message Display -->
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span>{{ errorMessage }}</span>
          <button @click="clearError" class="error-close">✕</button>
        </div>
      </div>

      <!-- Galaxy Creation/Selection -->
      <div class="control-panel">
        <div class="control-group">
          <label>Galaxy Operation:</label>
          <button @click="showNewGalaxyForm = true" class="btn btn-primary">➕ Create New Galaxy</button>
          <button @click="showImportForm = true" class="btn btn-secondary">📥 Import Galaxy</button>
          <button @click="refreshGalaxies" class="btn btn-secondary" title="Refresh galaxies from server">
            🔄 Refresh
          </button>
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
            <h3>{{ galaxy.name }}</h3>
            <p class="type">{{ galaxy.type }}</p>
            <p class="id">{{ galaxy.galaxyId }}</p>
          </div>
        </div>
      </div>

      <!-- Selected Galaxy Details -->
      <div v-if="currentGalaxy" class="galaxy-details">
        <div class="details-header">
          <h2>{{ currentGalaxy.name }}</h2>
          <div class="galaxy-type-badge">{{ currentGalaxy.type }}</div>
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
                <span class="value">{{ currentGalaxy.type }}</span>
              </div>
              <div class="property">
                <span class="label">Bulge Radius:</span>
                <span class="value">{{ currentGalaxy.morphology?.bulgeRadius || "N/A" }} pc</span>
              </div>
              <div class="property">
                <span class="label">Disk Thickness:</span>
                <span class="value">{{ currentGalaxy.morphology?.diskThickness || "N/A" }} pc</span>
              </div>
            </div>
          </section>

          <!-- Morphology Details -->
          <section class="detail-section">
            <h3>🔬 Morphology</h3>
            <div class="property-list">
              <div class="property">
                <span class="label">Spiral Arms:</span>
                <span class="value">{{ currentGalaxy.morphology?.armCount || 0 }}</span>
              </div>
              <div class="property">
                <span class="label">Core Density Factor:</span>
                <span class="value">{{ (currentGalaxy.morphology?.coreDensity * 100).toFixed(1) }}%</span>
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
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="proceedToClass0" class="btn btn-primary">🔍 Class 0 Sector Survey →</button>
          <button @click="editGalaxy" class="btn btn-secondary">✏️ Edit Galaxy</button>
          <button @click="showDeleteConfirm" class="btn btn-danger">🗑️ Delete Galaxy</button>
        </div>
      </div>

      <!-- New Galaxy Form (Modal) -->
      <div v-if="showNewGalaxyForm" class="modal-overlay" @click="showNewGalaxyForm = false">
        <div class="modal-content" @click.stop>
          <h2>Create New Galaxy</h2>
          <form @submit.prevent="createNewGalaxy">
            <div class="form-group">
              <label>Galaxy Name:</label>
              <input v-model="newGalaxyForm.name" required />
            </div>
            <div class="form-group">
              <label>Galaxy Type:</label>
              <select v-model="newGalaxyForm.type">
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
            <div class="form-group">
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
            <div class="form-actions">
              <button type="button" @click="randomizeGalaxyParams" class="btn btn-info">🎲 Randomize</button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? "Creating..." : "Create Galaxy" }}
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
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import * as toastService from "../../utils/toast.js";

const router = useRouter();
const route = useRoute();
const galaxyStore = useGalaxyStore();

const galaxies = computed(() => galaxyStore.getAllGalaxies);
const currentGalaxy = computed(() => galaxyStore.getCurrentGalaxy);
const importInProgress = computed(() => galaxyStore.importInProgress);
const importProgress = computed(() => galaxyStore.importProgress);
const isLoading = computed(() => galaxyStore.isLoading);

const showNewGalaxyForm = ref(false);
const showImportForm = ref(false);
const errorMessage = ref("");

const confirmDialog = ref({
  isOpen: false,
  title: "Delete Galaxy",
  message: "Are you sure? This action cannot be undone.",
  confirmText: "Delete",
  galaxyIdToDelete: null,
});

const newGalaxyForm = ref({
  name: "",
  type: "Spiral",
  bulgeRadius: 5000,
  armCount: 2,
  coreDensity: 0.7,
  diskThickness: 1000,
});

const importForm = ref({
  fileData: null,
});

// Update page title dynamically
watchEffect(() => {
  const galaxy = currentGalaxy.value;
  if (galaxy && galaxy.name) {
    document.title = `Galaxy Survey: ${galaxy.name} | Eclipsed Horizons`;
  } else {
    document.title = "Galaxy Survey | Eclipsed Horizons";
  }
});

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

    // Recover from stale local selection (for example after DB reset/import changes).
    if (!galaxyStore.getCurrentGalaxy && galaxyStore.galaxies.length > 0) {
      galaxyStore.setCurrentGalaxy(galaxyStore.galaxies[0].galaxyId);
    }
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

function randomizeGalaxyParams() {
  const galaxyTypes = ["Spiral", "Barred Spiral", "Elliptical", "Lenticular", "Irregular", "Dwarf"];

  newGalaxyForm.value.type = galaxyTypes[Math.floor(Math.random() * galaxyTypes.length)];
  newGalaxyForm.value.bulgeRadius = 5000 + Math.floor(Math.random() * 45000); // 5000-50000
  newGalaxyForm.value.armCount = 2 + Math.floor(Math.random() * 11); // 2-12
  newGalaxyForm.value.coreDensity = Math.round((0.01 + Math.random() * 0.99) * 100) / 100; // 0-1 with 2 decimals
  newGalaxyForm.value.diskThickness = 500 + Math.floor(Math.random() * 9500); // 500-10000

  toastService.info("Galaxy parameters randomized!");
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

  try {
    const newGalaxy = {
      galaxyId: `gal-${Date.now()}`,
      name: newGalaxyForm.value.name,
      type: newGalaxyForm.value.type,
      morphology: {
        bulgeRadius: newGalaxyForm.value.bulgeRadius,
        armCount: newGalaxyForm.value.armCount,
        coreDensity: newGalaxyForm.value.coreDensity,
        diskThickness: newGalaxyForm.value.diskThickness,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: "active",
        version: 1,
      },
    };

    await galaxyStore.createGalaxy(newGalaxy);
    toastService.success(`Galaxy "${newGalaxyForm.value.name}" created successfully!`);
    showNewGalaxyForm.value = false;
    newGalaxyForm.value = {
      name: "",
      type: "Spiral",
      bulgeRadius: 5000,
      armCount: 2,
      coreDensity: 0.7,
      diskThickness: 1000,
    };
  } catch (err) {
    toastService.error(`Failed to create galaxy: ${err.message}`);
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
    await galaxyStore.importGalaxy(importForm.value.fileData);
    toastService.success("Galaxy imported successfully!");
    showImportForm.value = false;
    importForm.value = { fileData: null };
  } catch (err) {
    toastService.error(`Failed to import galaxy: ${err.message}`);
  }
}

async function refreshGalaxies() {
  try {
    await galaxyStore.loadGalaxies();
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

function editGalaxy() {
  // TODO: Implement edit functionality
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
    const galaxyName = galaxies.value.find((g) => g.galaxyId === galaxyId)?.galaxyNames[0].name;
    await galaxyStore.deleteGalaxy(galaxyId);
    toastService.success(`Galaxy "${galaxyName}" deleted successfully`);
  } catch (err) {
    toastService.error(`Failed to delete galaxy: ${err.message}`);
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
    link.download = `${currentGalaxy.value.galaxyNames[0].name}-Galaxy.json`;
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

.btn-info {
  background: #44aaff;
  color: #fff;
}

.btn-info:hover {
  background: #66bbff;
  box-shadow: 0 0 10px rgba(68, 170, 255, 0.5);
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
