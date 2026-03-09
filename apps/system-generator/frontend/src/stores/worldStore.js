import { defineStore } from "pinia";
import * as worldApi from "../api/worldApi.js";

const CURRENT_KEY = "eclipsed-horizons-current-world";

export const useWorldStore = defineStore("world", {
  state: () => ({
    worlds: [],
    currentWorldId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllWorlds: (state) => state.worlds,

    getCurrentWorld: (state) => state.worlds.find((w) => w.worldId === state.currentWorldId) ?? null,
  },

  actions: {
    setError(error) {
      this.error = error ? String(error) : null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentWorld(worldId) {
      this.currentWorldId = worldId;
      if (worldId) {
        localStorage.setItem(CURRENT_KEY, worldId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    async loadWorlds(systemId) {
      this.isLoading = true;
      this.clearError();
      try {
        this.worlds = await worldApi.getWorlds(systemId);
      } catch (err) {
        this.setError(err);
        this.worlds = [];
      } finally {
        this.isLoading = false;
      }
    },

    async createWorld(worldData) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: add temporary world
      const tempId = `temp-${Date.now()}`;
      const optimisticWorld = { ...worldData, worldId: tempId, _temporary: true };
      this.worlds.push(optimisticWorld);

      try {
        const newWorld = await worldApi.createWorld(worldData);
        // Replace temporary world with real one
        const tempIndex = this.worlds.findIndex((w) => w.worldId === tempId);
        if (tempIndex !== -1) {
          this.worlds[tempIndex] = newWorld;
        }
        this.setCurrentWorld(newWorld.worldId);
        return newWorld;
      } catch (err) {
        // Rollback: remove temporary world
        this.worlds = this.worlds.filter((w) => w.worldId !== tempId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateWorld(worldId, updates) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original and update immediately
      const index = this.worlds.findIndex((w) => w.worldId === worldId);
      if (index === -1) {
        throw new Error("World not found");
      }
      const originalWorld = { ...this.worlds[index] };
      this.worlds[index] = { ...this.worlds[index], ...updates };

      try {
        const updated = await worldApi.updateWorld(worldId, updates);
        this.worlds[index] = updated;
        return updated;
      } catch (err) {
        // Rollback: restore original world
        this.worlds[index] = originalWorld;
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteWorld(worldId) {
      this.isLoading = true;
      this.clearError();

      // Optimistic update: save original list and remove immediately
      const originalWorlds = [...this.worlds];
      const originalCurrentId = this.currentWorldId;
      this.worlds = this.worlds.filter((w) => w.worldId !== worldId);
      if (this.currentWorldId === worldId) {
        this.setCurrentWorld(this.worlds[0]?.worldId ?? null);
      }

      try {
        await worldApi.deleteWorld(worldId);
      } catch (err) {
        // Rollback: restore original worlds and current world
        this.worlds = originalWorlds;
        this.setCurrentWorld(originalCurrentId);
        this.setError(err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
