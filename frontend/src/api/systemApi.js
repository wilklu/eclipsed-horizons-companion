import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const systemApi = {
  // Get all systems
  async getAllSystems() {
    try {
      const response = await apiClient.get("/systems");
      return response.data;
    } catch (error) {
      console.error("Error fetching systems:", error);
      throw error;
    }
  },

  // Get single system - ONLY ONE DEFINITION ✅
  async getSystem(id) {
    try {
      const response = await apiClient.get(`/systems/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching system:", error);
      throw error;
    }
  },

  // Create new system
  async createSystem(systemData) {
    try {
      const response = await apiClient.post("/systems", systemData);
      return response.data;
    } catch (error) {
      console.error("Error creating system:", error);
      throw error;
    }
  },

  // Generate system using axios for consistency ✅
  async generateSystem(params) {
    try {
      const response = await apiClient.post("/systems/generate", params);
      return response.data;
    } catch (error) {
      console.error("Error generating system:", error);
      throw error;
    }
  },

  // Delete system
  async deleteSystem(id) {
    try {
      const response = await apiClient.delete(`/systems/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting system:", error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },

  /**
   * Initiate a stellar survey scan - NOW USES AXIOS ✅
   */
  async initiateStellarSurvey(systemData) {
    try {
      const response = await apiClient.post("/systems/survey", {
        systemName: systemData.systemName || "New System",
        seed: systemData.seed || Math.random(),
      });
      return response.data;
    } catch (error) {
      console.error("Survey error:", error);
      throw error;
    }
  },
};

export default apiClient;
