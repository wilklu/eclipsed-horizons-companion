import { defineStore } from "pinia";
import * as sectorApi from "../api/sectorApi.js";

const CURRENT_KEY = "eclipsed-horizons-current-sector";

export const useSectorStore = defineStore("sector", {
  state: () => ({
    sectors: [],
    currentSectorId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllSectors: (state) => state.sectors,

    getCurrentSector: (state) => state.sectors.find((s) => s.sectorId === state.currentSectorId) ?? null,
  },

  actions: {
    setError(error) {
      this.error = error ? String(error) : null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentSector(sectorId) {
      this.currentSectorId = sectorId;
      if (sectorId) {
        localStorage.setItem(CURRENT_KEY, sectorId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    async loadSectors(galaxyId) {
      this.isLoading = true;
      this.clearError();
      try {
        this.sectors = await sectorApi.getSectors(galaxyId);
      } catch (err) {
        this.setError(err);
        this.sectors = [];
      } finally {
        this.isLoading = false;
      }
    },

    async createSector(sectorData) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: add temporary sector
      const tempId = `temp-${Date.now()}`;
      const optimisticSector = { ...sectorData, sectorId: tempId, _temporary: true };
      this.sectors.push(optimisticSector);

      try {
        const newSector = await sectorApi.createSector(sectorData);
        // Replace temporary sector with real one
        const tempIndex = this.sectors.findIndex((s) => s.sectorId === tempId);
        if (tempIndex !== -1) {
          this.sectors[tempIndex] = newSector;
        }
        this.setCurrentSector(newSector.sectorId);
        return newSector;
      } catch (err) {
        // Rollback: remove temporary sector
        this.sectors = this.sectors.filter((s) => s.sectorId !== tempId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateSector(sectorId, updates) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original and update immediately
      const index = this.sectors.findIndex((s) => s.sectorId === sectorId);
      if (index === -1) {
        throw new Error("Sector not found");
      }
      const originalSector = { ...this.sectors[index] };
      this.sectors[index] = { ...this.sectors[index], ...updates };

      try {
        const updated = await sectorApi.updateSector(sectorId, updates);
        this.sectors[index] = updated;
        return updated;
      } catch (err) {
        // Rollback: restore original sector
        this.sectors[index] = originalSector;
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSector(sectorId) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original list and remove immediately
      const originalSectors = [...this.sectors];
      const originalCurrentId = this.currentSectorId;
      this.sectors = this.sectors.filter((s) => s.sectorId !== sectorId);
      if (this.currentSectorId === sectorId) {
        this.setCurrentSector(this.sectors[0]?.sectorId ?? null);
      }

      try {
        await sectorApi.deleteSector(sectorId);
      } catch (err) {
        // Rollback: restore original sectors and current sector
        this.sectors = originalSectors;
        this.setCurrentSector(originalCurrentId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
