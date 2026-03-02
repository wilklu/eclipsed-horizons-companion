<template>
  <div class="generate-system">
    <h2>Survey Forms Suite</h2>

    <div class="survey-tabs">
      <button @click="activeTab = 'hex-map'" :class="{ active: activeTab === 'hex-map' }" class="tab-btn">
        🗺️ Hex Map (Interactive)
      </button>
      <button @click="activeTab = 'physical'" :class="{ active: activeTab === 'physical' }" class="tab-btn">
        World Physical Survey
      </button>
      <button @click="activeTab = 'gas-giant'" :class="{ active: activeTab === 'gas-giant' }" class="tab-btn">
        Gas Giant Survey
      </button>
      <button @click="activeTab = 'census'" :class="{ active: activeTab === 'census' }" class="tab-btn">
        Census Survey
      </button>
      <button @click="activeTab = 'subunit'" :class="{ active: activeTab === 'subunit' }" class="tab-btn">
        Census Subunit Profile
      </button>
    </div>

    <div v-if="activeTab === 'hex-map'" class="form-container">
      <WorldHexMapFormAdvanced />
    </div>

    <div v-if="activeTab === 'physical'" class="form-container">
      <WorldPhysicalSurveyForm />
    </div>

    <div v-if="activeTab === 'gas-giant'" class="form-container">
      <GasGiantSurveyForm />
    </div>

    <div v-if="activeTab === 'census'" class="form-container">
      <WorldCensusSurveyForm />
    </div>

    <div v-if="activeTab === 'subunit'" class="form-container">
      <CensusSubunitProfileForm />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSystemStore } from "../stores/systemStore";
import { systemApi } from "../api/systemApi";
import StellarSurveyForm from "../components/forms/StellarSurveyForm.vue";
import SystemSurveyForm from "../components/forms/SystemSurveyForm.vue";
import PlanetarySurveyForm from "../components/forms/PlanetarySurveyForm.vue";
import WorldPhysicalSurveyForm from "../components/forms/WorldPhysicalSurveyForm.vue";
import GasGiantPhysicalSurveyForm from "../components/forms/GasGiantPhysicalSurveyForm.vue";
import WorldCensusSurveyForm from "../components/forms/WorldCensusSurveyForm.vue";
import CensusSubunitProfileForm from "../components/forms/CensusSubunitProfileForm.vue";
import WorldHexMapFormAdvanced from "../components/forms/WorldHexMapFormAdvanced.vue";

const router = useRouter();
const systemStore = useSystemStore();

const activeTab = ref("hex-map");

const formData = ref({
  sector: "",
  subsector_name: "",
  system_name: "",
  system_seed: null,
});

const isGenerating = ref(false);
const generatedSystem = ref(null);

const generateRandomSeed = () => {
  formData.value.system_seed = Math.floor(Math.random() * 1000000);
};

const generateSystem = async () => {
  if (!formData.value.system_name) {
    alert("Please enter a system name");
    return;
  }

  isGenerating.value = true;

  try {
    // NOTE: This will return 501 "not implemented yet" from backend
    // In Sprint 4, we'll implement the actual generator logic
    const result = await systemApi.generateSystem(formData.value);
    generatedSystem.value = result;
    systemStore.setGeneratedSystem(result);
  } catch (error) {
    console.error("Generation failed:", error);
    // For now, create a placeholder object
    generatedSystem.value = {
      message: "Generator logic not yet implemented (Sprint 4)",
      input: formData.value,
      note: "This will generate full star system data in Sprint 4",
    };
  } finally {
    isGenerating.value = false;
  }
};

const saveSystem = async () => {
  try {
    await systemApi.createSystem({
      ...formData.value,
      data: generatedSystem.value,
    });
    alert("✓ System saved!");
    resetForm();
    router.push("/");
  } catch (error) {
    console.error("Save failed:", error);
    alert("Failed to save system");
  }
};

const clearGenerated = () => {
  generatedSystem.value = null;
  systemStore.clearGeneratedSystem();
};

const resetForm = () => {
  formData.value = {
    sector: "",
    subsector_name: "",
    system_name: "",
    system_seed: null,
  };
  generatedSystem.value = null;
};
</script>

<style scoped>
.generate-system {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #1a1a2e;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.survey-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #1a1a2e;
  flex-wrap: wrap;
  overflow-x: auto;
}

.tab-btn {
  padding: 1rem;
  border: none;
  background: transparent;
  color: #a0a0a0;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #1a1a2e;
}

.tab-btn.active {
  color: #1a1a2e;
  border-bottom-color: #1a1a2e;
}

.form-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
