import { defineStore } from "pinia";
import * as galaxyApi from "../api/galaxyApi.js";
import { importGalaxy } from "../../../backend/generators/utils/galaxyImporter.js";

const CURRENT_KEY = "eclipsed-horizons-current-galaxy";

export const useGalaxyStore = defineStore("galaxy", {
  state: () => ({
    galaxies: [],
    currentGalaxyId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
    importInProgress: false,
    importProgress: 0,
  }),

  getters: {
    getAllGalaxies: (state) => state.galaxies,

    getCurrentGalaxy: (state) => state.galaxies.find((g) => g.galaxyId === state.currentGalaxyId) ?? null,
  },

  actions: {
    setError(error) {
      this.error = error ? String(error) : null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentGalaxy(galaxyId) {
      this.currentGalaxyId = galaxyId;
      if (galaxyId) {
        localStorage.setItem(CURRENT_KEY, galaxyId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    async loadGalaxies() {
      this.isLoading = true;
      this.clearError();
      try {
        this.galaxies = await galaxyApi.listGalaxies();
      } catch (err) {
        this.setError(err);
        this.galaxies = [];
      } finally {
        this.isLoading = false;
      }
    },

    async createGalaxy(galaxyData) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: add temporary galaxy
      const tempId = `temp-${Date.now()}`;
      const optimisticGalaxy = { ...galaxyData, galaxyId: tempId, _temporary: true };
      this.galaxies.push(optimisticGalaxy);

      try {
        const newGalaxy = await galaxyApi.createGalaxy(galaxyData);
        // Replace temporary galaxy with real one
        const tempIndex = this.galaxies.findIndex((g) => g.galaxyId === tempId);
        if (tempIndex !== -1) {
          this.galaxies[tempIndex] = newGalaxy;
        }
        this.setCurrentGalaxy(newGalaxy.galaxyId);
        return newGalaxy;
      } catch (err) {
        // Rollback: remove temporary galaxy
        this.galaxies = this.galaxies.filter((g) => g.galaxyId !== tempId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateGalaxy(galaxyId, updates) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original and update immediately
      const index = this.galaxies.findIndex((g) => g.galaxyId === galaxyId);
      if (index === -1) {
        throw new Error("Galaxy not found");
      }
      const originalGalaxy = { ...this.galaxies[index] };
      this.galaxies[index] = { ...this.galaxies[index], ...updates };

      try {
        const updated = await galaxyApi.updateGalaxy(galaxyId, updates);
        this.galaxies[index] = updated;
        return updated;
      } catch (err) {
        // Rollback: restore original galaxy
        this.galaxies[index] = originalGalaxy;
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteGalaxy(galaxyId) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original list and remove immediately
      const originalGalaxies = [...this.galaxies];
      const originalCurrentId = this.currentGalaxyId;
      this.galaxies = this.galaxies.filter((g) => g.galaxyId !== galaxyId);
      if (this.currentGalaxyId === galaxyId) {
        this.setCurrentGalaxy(this.galaxies[0]?.galaxyId ?? null);
      }

      try {
        await galaxyApi.deleteGalaxy(galaxyId);
      } catch (err) {
        // Rollback: restore original galaxies and current galaxy
        this.galaxies = originalGalaxies;
        this.setCurrentGalaxy(originalCurrentId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async importGalaxy(galaxyData, coordinates) {
      this.importInProgress = true;
      this.importProgress = 10;
      this.clearError();

      try {
        const targetUniverse = { galaxies: this.galaxies };
        this.importProgress = 30;

        const result = await importGalaxy(galaxyData, {
          ...targetUniverse,
          userCoordinates: coordinates,
        });

        this.importProgress = 80;

        if (result.success) {
          // Create the imported galaxy via API
          const newGalaxy = await galaxyApi.createGalaxy(result.galaxy);
          this.galaxies.push(newGalaxy);
          this.setCurrentGalaxy(newGalaxy.galaxyId);
          this.importProgress = 100;
          return newGalaxy;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        this.setError(err);
        throw err;
      } finally {
        setTimeout(() => {
          this.importInProgress = false;
          this.importProgress = 0;
        }, 500);
      }
    },
  },
});
