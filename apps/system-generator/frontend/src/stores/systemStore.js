import { defineStore } from "pinia";
import * as systemApi from "../api/systemApi.js";

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures; the backend remains the source of truth.
    }
  }
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

    async loadSystems(galaxyId, sectorId, options = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        if (sectorId) {
          // Sector-scoped load: merge into existing store so other sectors' systems are not evicted.
          const fetched = await systemApi.getSystemsBySector(sectorId, options);
          const filtered = fetched.filter((system) => {
            const galaxyMatches = !galaxyId || String(system.galaxyId) === String(galaxyId);
            return galaxyMatches && String(system.sectorId) === String(sectorId);
          });
          const others = this.systems.filter((system) => String(system.sectorId) !== String(sectorId));
          this.systems = others.concat(filtered);
          return filtered;
        }
        // Galaxy-wide (or unscoped) load: replace entire store.
        const all = loadSystems();
        this.systems = all.filter((system) => {
          return !galaxyId || String(system.galaxyId) === String(galaxyId);
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

    async createSystem(systemData, options = {}) {
      this.error = null;
      const persisted = await systemApi.upsertSystem(systemData, options);
      const index = this.systems.findIndex((system) => system.systemId === persisted.systemId);
      if (index >= 0) {
        this.systems[index] = persisted;
      } else {
        this.systems.push(persisted);
      }
      saveSystems(
        loadSystems()
          .filter((system) => system.systemId !== persisted.systemId)
          .concat(persisted),
      );
      return persisted;
    },

    async updateSystem(systemId, updates, options = {}) {
      this.error = null;
      const next = await systemApi.updateSystem(systemId, updates, options);
      saveSystems(
        loadSystems()
          .filter((system) => system.systemId !== systemId)
          .concat(next),
      );
      const localIndex = this.systems.findIndex((system) => system.systemId === systemId);
      if (localIndex >= 0) {
        this.systems[localIndex] = next;
      } else {
        this.systems.push(next);
      }
      return next;
    },

    async replaceSectorSystems(sectorId, systems, options = {}) {
      this.error = null;
      const replaced = await systemApi.replaceSystemsForSector(sectorId, systems, options);
      const otherSystems = this.systems.filter((system) => String(system?.sectorId) !== String(sectorId));
      this.systems = otherSystems.concat(replaced);
      return replaced;
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
