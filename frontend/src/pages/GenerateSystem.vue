<template>
  <div class="generate-system">
    <h2>Generate Star System</h2>

    <div class="form-container">
      <h3>System Parameters</h3>

      <div class="form-group">
        <label>Sector Name:</label>
        <input v-model="formData.sector" type="text" placeholder="e.g., Orion Spur" class="form-input" />
      </div>

      <div class="form-group">
        <label>Subsector Name:</label>
        <input v-model="formData.subsector_name" type="text" placeholder="e.g., Alpha-1" class="form-input" />
      </div>

      <div class="form-group">
        <label>System Name:</label>
        <input v-model="formData.system_name" type="text" placeholder="e.g., Sol System" class="form-input" />
      </div>

      <div class="form-group">
        <label>Seed (for reproducibility):</label>
        <input
          v-model.number="formData.system_seed"
          type="number"
          placeholder="Leave blank for random"
          class="form-input"
        />
        <button @click="generateRandomSeed" class="btn-small">🎲 Random Seed</button>
      </div>

      <div class="button-group">
        <button @click="generateSystem" class="btn btn-primary" :disabled="isGenerating">
          {{ isGenerating ? "Generating..." : "⚡ Generate System" }}
        </button>
        <button @click="resetForm" class="btn btn-secondary">Reset</button>
      </div>
    </div>

    <!-- Preview Section -->
    <div v-if="generatedSystem" class="preview-container">
      <h3>Preview</h3>
      <div class="preview-data">
        <pre>{{ JSON.stringify(generatedSystem, null, 2) }}</pre>
      </div>
      <div class="button-group">
        <button @click="saveSystem" class="btn btn-primary">💾 Save System</button>
        <button @click="clearGenerated" class="btn btn-secondary">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSystemStore } from "../stores/systemStore";
import { systemApi } from "../api/systemApi";

const router = useRouter();
const systemStore = useSystemStore();

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
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  color: #00d9ff;
  margin-bottom: 2rem;
  font-size: 2rem;
}

h3 {
  color: #00d9ff;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.form-container {
  background-color: #1a1a1a;
  border: 2px solid #00d9ff;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background-color: #0f0f0f;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.5);
}

.btn-small {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #333;
  color: #00d9ff;
  border: 1px solid #00d9ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-small:hover {
  background-color: rgba(0, 217, 255, 0.2);
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #00d9ff;
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  background-color: #00ffff;
  box-shadow: 0 0 15px #00d9ff;
}

.btn-secondary {
  background-color: #333;
  color: #00d9ff;
  border: 1px solid #00d9ff;
}

.btn-secondary:hover {
  background-color: #444;
}

.preview-container {
  background-color: #1a1a1a;
  border: 2px solid #00d9ff;
  border-radius: 8px;
  padding: 2rem;
}

.preview-data {
  background-color: #0f0f0f;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 1.5rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.preview-data pre {
  color: #00d9ff;
  font-family: "Courier New", monospace;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
