import { defineStore } from "pinia";
import * as sophontApi from "../api/sophontApi.js";

const CURRENT_KEY = "eclipsed-horizons-current-sophont";

export const useSophontStore = defineStore("sophont", {
  state: () => ({
    sophonts: [],
    currentSophontId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllSophonts: (state) => state.sophonts,

    getCurrentSophont: (state) => state.sophonts.find((s) => s.sophontId === state.currentSophontId) ?? null,
  },

  actions: {
    setError(error) {
      this.error = error ? String(error) : null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentSophont(sophontId) {
      this.currentSophontId = sophontId;
      if (sophontId) {
        localStorage.setItem(CURRENT_KEY, sophontId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    async loadSophonts(worldId) {
      this.isLoading = true;
      this.clearError();
      try {
        this.sophonts = await sophontApi.getSophonts(worldId);
      } catch (err) {
        this.setError(err);
        this.sophonts = [];
      } finally {
        this.isLoading = false;
      }
    },

    async createSophont(sophontData) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: add temporary sophont
      const tempId = `temp-${Date.now()}`;
      const optimisticSophont = { ...sophontData, sophontId: tempId, _temporary: true };
      this.sophonts.push(optimisticSophont);

      try {
        const newSophont = await sophontApi.createSophont(sophontData);
        // Replace temporary sophont with real one
        const tempIndex = this.sophonts.findIndex((s) => s.sophontId === tempId);
        if (tempIndex !== -1) {
          this.sophonts[tempIndex] = newSophont;
        }
        this.setCurrentSophont(newSophont.sophontId);
        return newSophont;
      } catch (err) {
        // Rollback: remove temporary sophont
        this.sophonts = this.sophonts.filter((s) => s.sophontId !== tempId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateSophont(sophontId, updates) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original and update immediately
      const index = this.sophonts.findIndex((s) => s.sophontId === sophontId);
      if (index === -1) {
        throw new Error("Sophont not found");
      }
      const originalSophont = { ...this.sophonts[index] };
      this.sophonts[index] = { ...this.sophonts[index], ...updates };

      try {
        const updated = await sophontApi.updateSophont(sophontId, updates);
        this.sophonts[index] = updated;
        return updated;
      } catch (err) {
        // Rollback: restore original sophont
        this.sophonts[index] = originalSophont;
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteSophont(sophontId) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original list and remove immediately
      const originalSophonts = [...this.sophonts];
      const originalCurrentId = this.currentSophontId;
      this.sophonts = this.sophonts.filter((s) => s.sophontId !== sophontId);
      if (this.currentSophontId === sophontId) {
        this.setCurrentSophont(this.sophonts[0]?.sophontId ?? null);
      }

      try {
        await sophontApi.deleteSophont(sophontId);
      } catch (err) {
        // Rollback: restore original sophonts and current sophont
        this.sophonts = originalSophonts;
        this.setCurrentSophont(originalCurrentId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
