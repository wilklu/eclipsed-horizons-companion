import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { systemApi } from "../api/systemApi";

export const useSystemStore = defineStore("system", () => {
  // =============================================
  // EXISTING STATE
  // =============================================
  const systems = ref([]);
  const currentSystem = ref(null);
  const generatedSystem = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // =============================================
  // NEW: STELLAR SURVEY STATE
  // =============================================
  const surveyLog = ref([]);
  const isScanning = ref(false);
  const scanProgress = ref(0);
  const starsDetected = ref([]);

  // =============================================
  // EXISTING COMPUTED
  // =============================================
  const systemCount = computed(() => systems.value.length);
  const hasGeneratedData = computed(() => generatedSystem.value !== null);

  // =============================================
  // NEW: STELLAR SURVEY COMPUTED
  // =============================================
  const starsCount = computed(() => starsDetected.value.length);

  // =============================================
  // EXISTING ACTIONS
  // =============================================
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

  // =============================================
  // NEW: STELLAR SURVEY ACTIONS
  // =============================================

  /**
   * Initiate a full stellar survey scan
   */
  async function generateSystem(systemData) {
    isScanning.value = true;
    scanProgress.value = 0;
    starsDetected.value = [];
    surveyLog.value = [];
    error.value = null;

    try {
      addLog("Initiating stellar survey...", "message");

      // Call your API to generate the system
      const result = await systemApi.initiateStellarSurvey(systemData);

      console.log("API Response:", result); // DEBUG

      // ✅ FIX: Access result.system directly, not result.data.system
      const system = result.system || result;

      if (!system) {
        throw new Error("Invalid response: no system data received");
      }

      // Store the generated system
      currentSystem.value = system;
      generatedSystem.value = system;

      // Process survey results
      processSurveyResults(system);

      scanProgress.value = 100;
      addLog("Survey complete.", "message");

      return system;
    } catch (err) {
      error.value = err.message;
      addLog(`Error: ${err.message}`, "error");
      console.error("Full error:", err); // ✅ Log full error for debugging
      throw err;
    } finally {
      isScanning.value = false;
    }
  }

  /**
   * Process the returned system data and extract star info
   */
  function processSurveyResults(systemData) {
    if (systemData.primaryStar) {
      const star = {
        designation: systemData.primaryStar.id || "Primary",
        spectralClass: systemData.primaryStar.spectralClass,
        subtype: systemData.primaryStar.subtype || 0,
        luminosityClass: systemData.primaryStar.luminosityClass || "V",
        mass: parseFloat(systemData.primaryStar.mass) || 1.0,
        temperature: systemData.primaryStar.temperature || 5000,
        luminosity: parseFloat(systemData.primaryStar.luminosity) || 1.0,
        hasGasGiants: systemData.gasGiants && systemData.gasGiants.length > 0,
        hasPlanetoidBelts: systemData.planetoidBelts && systemData.planetoidBelts.length > 0,
      };

      starsDetected.value.push(star);
      addLog(`★ Detected: ${star.designation}`, "warning");
    }
  }

  /**
   * Add an entry to the scan log
   */
  function addLog(message, type = "message") {
    surveyLog.value.push({
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    });
  }

  /**
   * Reset the stellar survey
   */
  function resetSurvey() {
    currentSystem.value = null;
    generatedSystem.value = null;
    surveyLog.value = [];
    isScanning.value = false;
    scanProgress.value = 0;
    starsDetected.value = [];
    error.value = null;
  }

  // =============================================
  // RETURN EVERYTHING
  // =============================================
  return {
    // Existing State
    systems,
    currentSystem,
    generatedSystem,
    isLoading,
    error,

    // New State
    surveyLog,
    isScanning,
    scanProgress,
    starsDetected,

    // Existing Computed
    systemCount,
    hasGeneratedData,

    // New Computed
    starsCount,

    // Existing Actions
    setSystems,
    setCurrentSystem,
    setGeneratedSystem,
    setLoading,
    setError,
    clearError,
    clearGeneratedSystem,

    // New Actions
    generateSystem,
    processSurveyResults,
    addLog,
    resetSurvey,
  };
});
