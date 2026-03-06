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

  // Get single system
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

  // Generate system (placeholder - will be implemented in Sprint 4)
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
   * Initiate a stellar survey scan
   */
  async initiateStellarSurvey(systemData) {
    try {
      const response = await fetch("/api/systems/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemName: systemData.systemName || "New System",
          seed: systemData.seed || Math.random(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Survey failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Survey error:", error);
      throw error;
    }
  },

  /**
   * Get existing system data
   */
  async getSystem(systemId) {
    const response = await fetch(`/api/systems/${systemId}`);
    if (!response.ok) throw new Error("Failed to fetch system");
    return response.json();
  },
};

export default apiClient;
