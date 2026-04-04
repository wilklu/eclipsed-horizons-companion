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
    setCurrentSector(sectorId) {
      this.currentSectorId = sectorId;
      if (sectorId) {
        localStorage.setItem(CURRENT_KEY, sectorId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    addSector(sectorData) {
      this.sectors.push(sectorData);
      return sectorData;
    },

    async loadSectors(galaxyId) {
      this.isLoading = true;
      this.error = null;
      try {
        this.sectors = await sectorApi.getSectors(galaxyId);
        if (this.currentSectorId && !this.sectors.some((sector) => sector.sectorId === this.currentSectorId)) {
          this.setCurrentSector(null);
        }
        return this.sectors;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createSector(sectorData) {
      this.error = null;
      const created = await sectorApi.createSector(sectorData);
      const index = this.sectors.findIndex((sector) => sector.sectorId === created.sectorId);
      if (index >= 0) {
        this.sectors[index] = created;
      } else {
        this.sectors.unshift(created);
      }
      return created;
    },

    async updateSector(sectorId, updates) {
      this.error = null;
      const updated = await sectorApi.updateSector(sectorId, updates);
      const index = this.sectors.findIndex((sector) => sector.sectorId === updated.sectorId);
      if (index >= 0) {
        this.sectors[index] = updated;
      } else {
        this.sectors.unshift(updated);
      }
      return updated;
    },

    async removeSector(sectorId) {
      this.error = null;
      this.sectors = this.sectors.filter((sector) => sector.sectorId !== sectorId);
      if (this.currentSectorId === sectorId) {
        this.setCurrentSector(null);
      }
    },

    clearSectors() {
      this.sectors = [];
      this.setCurrentSector(null);
      this.error = null;
    },
  },
});
