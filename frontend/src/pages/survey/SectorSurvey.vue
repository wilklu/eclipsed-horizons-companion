<template>
  <div class="sector-survey">
    <SurveyNavigation :currentClass="0" @regenerate="generateSector" @export="exportSector" />

    <div class="survey-content">
      <!-- Controls -->
      <div class="controls-panel">
        <div class="control-group">
          <label>Survey Scope:</label>
          <select v-model="surveyScope" class="control-input">
            <option value="subsector">Current Subsector (4x4)</option>
            <option value="sector">Full Sector (8x10)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Sector Name:</label>
          <input v-model="sectorName" class="control-input" />
        </div>

        <button @click="generateSector" class="btn btn-generate">🔍 Scan Sector</button>
      </div>

      <!-- Results Grid -->
      <div class="sector-grid" v-if="sectorData">
        <div v-for="(star, index) in sectorData.stars" :key="index" class="hex-cell" @click="selectSystem(index, star)">
          <div class="hex-content">
            <div class="coords">{{ star.coords }}</div>
            <div class="primary">{{ star.primary }}</div>
            <div class="companions" v-if="star.companions">
              {{ star.companions }}
            </div>
          </div>
        </div>
      </div>

      <!-- Selected System Detail -->
      <div v-if="selectedSystem" class="system-detail">
        <h3>{{ selectedSystem.primary }} System</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Coordinates:</span>
            <span>{{ selectedSystem.coords }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Primary Star:</span>
            <span>{{ selectedSystem.primary }}</span>
          </div>
          <div class="detail-item" v-if="selectedSystem.companions">
            <span class="label">Companions:</span>
            <span>{{ selectedSystem.companions }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="proceedToClass1" class="btn btn-primary">→ Class I Stellar Survey</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { generateSectorData } from "../../utils/surveyGenerator.js";

const router = useRouter();

const surveyScope = ref("subsector");
const sectorName = ref("Generated Sector");
const sectorData = ref(null);
const selectedSystem = ref(null);
const selectedIndex = ref(null);

const generateSector = async () => {
  const gridSize = surveyScope.value === "subsector" ? 4 : 8;
  sectorData.value = await generateSectorData(gridSize, sectorName.value);
};

const selectSystem = (index, star) => {
  selectedIndex.value = index;
  selectedSystem.value = star;
};

const proceedToClass1 = () => {
  // Store the selected system in the survey store
  const systemId = `${selectedSystem.value.coords}-${selectedSystem.value.primary}`;
  router.push({
    name: "StellarSurvey",
    params: { systemId },
  });
};

const exportSector = () => {
  const dataStr = JSON.stringify(sectorData.value, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sectorName.value}-Class0.json`;
  link.click();
};
</script>

<style scoped>
.sector-survey {
  padding: 2rem;
}

.controls-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: #00d9ff;
}

.control-input {
  padding: 0.5rem;
  background: #2a2a2a;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  min-width: 200px;
}

.btn-generate {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #00d9ff, #00ffff);
  color: #000;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-generate:hover {
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
}

.sector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.hex-cell {
  aspect-ratio: 1;
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.hex-cell:hover {
  background: #3a3a3a;
  border-color: #00d9ff;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
}

.hex-content {
  font-size: 0.75rem;
}

.coords {
  color: #aaa;
  font-size: 0.65rem;
}

.primary {
  font-weight: bold;
  color: #00d9ff;
  margin: 0.25rem 0;
}

.companions {
  color: #00ff88;
  font-size: 0.65rem;
}

.system-detail {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 2rem;
  margin-top: 2rem;
}

.system-detail h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  color: #00ffff;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.detail-item span:not(.label) {
  color: #e0e0e0;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #00d9ff;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
}
</style>
