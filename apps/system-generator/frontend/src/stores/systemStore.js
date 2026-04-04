import { defineStore } from "pinia";

const STORAGE_KEY = "eclipsed-horizons-systems";
const CURRENT_KEY = "eclipsed-horizons-current-system";

function loadSystems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSystems(systems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
}

function normalizeHexCoordinates(value) {
  const raw = String(value || "0000")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(0, 4);
  return {
    x: Number(raw.slice(0, 2)) || 0,
    y: Number(raw.slice(2, 4)) || 0,
  };
}

export const useSystemStore = defineStore("system", {
  state: () => ({
    systems: loadSystems(),
    currentSystemId: localStorage.getItem(CURRENT_KEY) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getAllSystems: (state) => state.systems,

    getCurrentSystem: (state) => state.systems.find((s) => s.systemId === state.currentSystemId) ?? null,
  },

  actions: {
    setCurrentSystem(systemId) {
      this.currentSystemId = systemId;
      if (systemId) {
        localStorage.setItem(CURRENT_KEY, systemId);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    },

    addSystem(systemData) {
      this.systems.push(systemData);
      saveSystems(this.systems);
      return systemData;
    },

    async loadSystems(galaxyId, sectorId) {
      this.isLoading = true;
      this.error = null;
      try {
        const all = loadSystems();
        this.systems = all.filter((system) => {
          const galaxyMatches = !galaxyId || String(system.galaxyId) === String(galaxyId);
          const sectorMatches = !sectorId || String(system.sectorId) === String(sectorId);
          return galaxyMatches && sectorMatches;
        });
        return this.systems;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    findSystemByHex(galaxyId, sectorId, hexCoord) {
      const coords = normalizeHexCoordinates(hexCoord);
      return this.systems.find(
        (system) =>
          String(system.galaxyId) === String(galaxyId) &&
          String(system.sectorId) === String(sectorId) &&
          Number(system?.hexCoordinates?.x) === coords.x &&
          Number(system?.hexCoordinates?.y) === coords.y,
      );
    },

    async createSystem(systemData) {
      this.error = null;
      const index = this.systems.findIndex((system) => system.systemId === systemData.systemId);
      if (index >= 0) {
        this.systems[index] = systemData;
      } else {
        this.systems.push(systemData);
      }
      saveSystems(
        loadSystems()
          .filter((system) => system.systemId !== systemData.systemId)
          .concat(systemData),
      );
      return systemData;
    },

    async updateSystem(systemId, updates) {
      this.error = null;
      const existing = loadSystems();
      const index = existing.findIndex((system) => system.systemId === systemId);
      const next = index >= 0 ? { ...existing[index], ...updates } : { ...updates, systemId };
      if (index >= 0) {
        existing[index] = next;
      } else {
        existing.push(next);
      }
      saveSystems(existing);
      const localIndex = this.systems.findIndex((system) => system.systemId === systemId);
      if (localIndex >= 0) {
        this.systems[localIndex] = next;
      } else {
        this.systems.push(next);
      }
      return next;
    },

    removeSystem(systemId) {
      this.systems = this.systems.filter((system) => system.systemId !== systemId);
      saveSystems(loadSystems().filter((system) => system.systemId !== systemId));
      if (this.currentSystemId === systemId) {
        this.setCurrentSystem(null);
      }
    },

    clearSystems() {
      this.systems = [];
      this.setCurrentSystem(null);
      this.error = null;
    },
  },
});
