import { defineStore } from "pinia";
import * as systemApi from "../api/systemApi.js";

const CURRENT_KEY = "eclipsed-horizons-current-system";

export const useSystemStore = defineStore("system", {
  state: () => ({
    systems: [],
    currentSystemId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllSystems: (state) => state.systems,

    getCurrentSystem: (state) => state.systems.find((s) => s.systemId === state.currentSystemId) ?? null,
  },

  actions: {
    setError(error) {
      this.error = error ? String(error) : null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentSystem(systemId) {
      this.currentSystemId = systemId;
      if (systemId) {
        localStorage.setItem(CURRENT_KEY, systemId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    async loadSystems(galaxyId, sectorId) {
      this.isLoading = true;
      this.clearError();
      try {
        this.systems = await systemApi.getSystems(galaxyId, sectorId);
      } catch (err) {
        this.setError(err);
        this.systems = [];
      } finally {
        this.isLoading = false;
      }
    },

    async createSystem(systemData) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: add temporary system
      const tempId = `temp-${Date.now()}`;
      const optimisticSystem = { ...systemData, systemId: tempId, _temporary: true };
      this.systems.push(optimisticSystem);

      try {
        const newSystem = await systemApi.createSystem(systemData);
        // Replace temporary system with real one
        const tempIndex = this.systems.findIndex((s) => s.systemId === tempId);
        if (tempIndex !== -1) {
          this.systems[tempIndex] = newSystem;
        }
        this.setCurrentSystem(newSystem.systemId);
        return newSystem;
      } catch (err) {
        // Rollback: remove temporary system
        this.systems = this.systems.filter((s) => s.systemId !== tempId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateSystem(systemId, updates) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original and update immediately
      const index = this.systems.findIndex((s) => s.systemId === systemId);
      if (index === -1) {
        throw new Error("System not found");
      }
      const originalSystem = { ...this.systems[index] };
      this.systems[index] = { ...this.systems[index], ...updates };

      try {
        const updated = await systemApi.updateSystem(systemId, updates);
        this.systems[index] = updated;
        return updated;
      } catch (err) {
        // Rollback: restore original system
        this.systems[index] = originalSystem;
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSystem(systemId) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original list and remove immediately
      const originalSystems = [...this.systems];
      const originalCurrentId = this.currentSystemId;
      this.systems = this.systems.filter((s) => s.systemId !== systemId);
      if (this.currentSystemId === systemId) {
        this.setCurrentSystem(this.systems[0]?.systemId ?? null);
      }

      try {
        await systemApi.deleteSystem(systemId);
      } catch (err) {
        // Rollback: restore original systems and current system
        this.systems = originalSystems;
        this.setCurrentSystem(originalCurrentId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
