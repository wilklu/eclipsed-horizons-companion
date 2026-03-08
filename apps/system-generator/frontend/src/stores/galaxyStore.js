import { defineStore } from "pinia";
import { importGalaxy } from "../../../backend/generators/utils/galaxyImporter.js";

const STORAGE_KEY = "eclipsed-horizons-galaxies";
const CURRENT_KEY = "eclipsed-horizons-current-galaxy";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(galaxies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galaxies));
}

function generateGalaxyId(existing) {
  if (!existing.length) return "001";
  const maxId = Math.max(...existing.map((g) => parseInt(g.galaxyId, 10) || 0));
  return String(maxId + 1).padStart(3, "0");
}

export const useGalaxyStore = defineStore("galaxy", {
  state: () => ({
    galaxies: loadFromStorage(),
    currentGalaxyId: localStorage.getItem(CURRENT_KEY) || null,
    importInProgress: false,
    importProgress: 0,
  }),

  getters: {
    getAllGalaxies: (state) => state.galaxies,

    getCurrentGalaxy: (state) =>
      state.galaxies.find((g) => g.galaxyId === state.currentGalaxyId) ?? null,
  },

  actions: {
    setCurrentGalaxy(galaxyId) {
      this.currentGalaxyId = galaxyId;
      localStorage.setItem(CURRENT_KEY, galaxyId);
    },

    createGalaxy(galaxyData) {
      const newGalaxy = {
        ...galaxyData,
        galaxyId: generateGalaxyId(this.galaxies),
        galaxyMetadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: "active",
          version: 1,
        },
        importMetadata: {
          isImported: false,
          sourceGalaxy: null,
          originalGalaxyId: null,
          idRemappingTable: {},
          importNotes: "",
        },
      };
      this.galaxies.push(newGalaxy);
      saveToStorage(this.galaxies);
      this.setCurrentGalaxy(newGalaxy.galaxyId);
      return newGalaxy;
    },

    updateGalaxy(galaxyId, updates) {
      const index = this.galaxies.findIndex((g) => g.galaxyId === galaxyId);
      if (index === -1) return;
      this.galaxies[index] = {
        ...this.galaxies[index],
        ...updates,
        galaxyMetadata: {
          ...this.galaxies[index].galaxyMetadata,
          lastModified: new Date().toISOString(),
          version: (this.galaxies[index].galaxyMetadata?.version ?? 0) + 1,
        },
      };
      saveToStorage(this.galaxies);
    },

    deleteGalaxy(galaxyId) {
      this.galaxies = this.galaxies.filter((g) => g.galaxyId !== galaxyId);
      saveToStorage(this.galaxies);
      if (this.currentGalaxyId === galaxyId) {
        this.currentGalaxyId = this.galaxies[0]?.galaxyId ?? null;
        if (this.currentGalaxyId) {
          localStorage.setItem(CURRENT_KEY, this.currentGalaxyId);
        } else {
          localStorage.removeItem(CURRENT_KEY);
        }
      }
    },

    async importGalaxy(galaxyData, coordinates) {
      this.importInProgress = true;
      this.importProgress = 10;

      try {
        const targetUniverse = { galaxies: this.galaxies };
        this.importProgress = 30;

        const result = await importGalaxy(galaxyData, {
          ...targetUniverse,
          userCoordinates: coordinates,
        });

        this.importProgress = 80;

        if (result.success) {
          this.galaxies.push(result.galaxy);
          saveToStorage(this.galaxies);
          this.setCurrentGalaxy(result.galaxy.galaxyId);
          this.importProgress = 100;
        } else {
          throw new Error(result.error);
        }
      } finally {
        setTimeout(() => {
          this.importInProgress = false;
          this.importProgress = 0;
        }, 500);
      }
    },
  },
});
