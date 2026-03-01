import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSystemStore = defineStore("system", () => {
  // State
  const systems = ref([]);
  const currentSystem = ref(null);
  const generatedSystem = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const systemCount = computed(() => systems.value.length);
  const hasGeneratedData = computed(() => generatedSystem.value !== null);

  // Actions
  function setSystems(data) {
    systems.value = data;
  }

  function setCurrentSystem(system) {
    currentSystem.value = system;
  }

  function setGeneratedSystem(system) {
    generatedSystem.value = system;
  }

  function setLoading(value) {
    isLoading.value = value;
  }

  function setError(message) {
    error.value = message;
  }

  function clearError() {
    error.value = null;
  }

  function clearGeneratedSystem() {
    generatedSystem.value = null;
  }

  return {
    // State
    systems,
    currentSystem,
    generatedSystem,
    isLoading,
    error,
    // Computed
    systemCount,
    hasGeneratedData,
    // Actions
    setSystems,
    setCurrentSystem,
    setGeneratedSystem,
    setLoading,
    setError,
    clearError,
    clearGeneratedSystem,
  };
});
