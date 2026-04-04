import { defineStore } from "pinia";
import { importGalaxy } from "../../../backend/generators/utils/galaxyImporter.js";

const STORAGE_KEY = "eclipsed-horizons-galaxies";
const CURRENT_KEY = "eclipsed-horizons-current-galaxy";
const NEXT_ID_KEY = "eclipsed-horizons-next-galaxy-id";
const SECTOR_STORAGE_KEY = "eclipsed-horizons-sectors-cache";
const CURRENT_SECTOR_KEY = "eclipsed-horizons-current-sector";
const SYSTEM_STORAGE_KEY = "eclipsed-horizons-systems";
const CURRENT_SYSTEM_KEY = "eclipsed-horizons-current-system";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api").replace(/\/$/, "");

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

function getMaxNumericGalaxyId(galaxies) {
  return galaxies.reduce((maxId, galaxy) => Math.max(maxId, parseInt(galaxy?.galaxyId, 10) || 0), 0);
}

function loadNextGalaxyId(galaxies) {
  const stored = parseInt(localStorage.getItem(NEXT_ID_KEY) || "", 10);
  const nextId = Number.isFinite(stored) && stored > 0 ? stored : getMaxNumericGalaxyId(galaxies) + 1;
  localStorage.setItem(NEXT_ID_KEY, String(nextId));
  return nextId;
}

function reserveNextGalaxyId(galaxies) {
  const nextId = loadNextGalaxyId(galaxies);
  localStorage.setItem(NEXT_ID_KEY, String(nextId + 1));
  return String(nextId).padStart(3, "0");
}

function syncNextGalaxyId(galaxies) {
  const nextId = Math.max(loadNextGalaxyId(galaxies), getMaxNumericGalaxyId(galaxies) + 1);
  localStorage.setItem(NEXT_ID_KEY, String(nextId));
}

function loadJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function purgeCachedGalaxyArtifacts(galaxyId) {
  const targetGalaxyId = String(galaxyId);
  const cachedSectors = loadJsonArray(SECTOR_STORAGE_KEY);
  const deletedSectorIds = new Set(
    cachedSectors
      .filter((sector) => String(sector?.galaxyId ?? sector?.metadata?.galaxyId ?? "") === targetGalaxyId)
      .map((sector) => String(sector?.sectorId ?? "")),
  );
  const remainingSectors = cachedSectors.filter(
    (sector) => String(sector?.galaxyId ?? sector?.metadata?.galaxyId ?? "") !== targetGalaxyId,
  );
  saveJsonArray(SECTOR_STORAGE_KEY, remainingSectors);

  const remainingSystems = loadJsonArray(SYSTEM_STORAGE_KEY).filter((system) => {
    const systemGalaxyId = String(system?.galaxyId ?? "");
    const systemSectorId = String(system?.sectorId ?? "");
    return systemGalaxyId !== targetGalaxyId && !deletedSectorIds.has(systemSectorId);
  });
  saveJsonArray(SYSTEM_STORAGE_KEY, remainingSystems);

  const currentSectorId = localStorage.getItem(CURRENT_SECTOR_KEY);
  if (currentSectorId && currentSectorId.startsWith(`${targetGalaxyId}:`)) {
    localStorage.removeItem(CURRENT_SECTOR_KEY);
  }

  const currentSystemId = localStorage.getItem(CURRENT_SYSTEM_KEY);
  if (currentSystemId) {
    const currentSystemStillExists = remainingSystems.some((system) => String(system?.systemId) === currentSystemId);
    if (!currentSystemStillExists) {
      localStorage.removeItem(CURRENT_SYSTEM_KEY);
    }
  }
}

function purgeAllCachedGalaxyArtifacts() {
  saveJsonArray(SECTOR_STORAGE_KEY, []);
  saveJsonArray(SYSTEM_STORAGE_KEY, []);
  localStorage.removeItem(CURRENT_SECTOR_KEY);
  localStorage.removeItem(CURRENT_SYSTEM_KEY);
}

async function deleteGalaxyFromApi(galaxyId) {
  try {
    const response = await fetch(`${API_BASE_URL}/galaxies/${encodeURIComponent(galaxyId)}`, {
      method: "DELETE",
    });

    if (response.status === 404 || response.status === 204) {
      return;
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn(`Failed to delete backend galaxy ${galaxyId}:`, error);
  }
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

    getCurrentGalaxy: (state) => state.galaxies.find((g) => g.galaxyId === state.currentGalaxyId) ?? null,
  },

  actions: {
    async loadGalaxies() {
      this.galaxies = loadFromStorage();
      syncNextGalaxyId(this.galaxies);

      const hasCurrentGalaxy = this.galaxies.some((galaxy) => galaxy.galaxyId === this.currentGalaxyId);
      if (!hasCurrentGalaxy) {
        this.currentGalaxyId = this.galaxies[0]?.galaxyId ?? null;
        if (this.currentGalaxyId) {
          localStorage.setItem(CURRENT_KEY, this.currentGalaxyId);
        } else {
          localStorage.removeItem(CURRENT_KEY);
          purgeAllCachedGalaxyArtifacts();
        }
      }

      return this.galaxies;
    },

    setCurrentGalaxy(galaxyId) {
      this.currentGalaxyId = galaxyId;
      localStorage.setItem(CURRENT_KEY, galaxyId);
    },

    createGalaxy(galaxyData) {
      const newGalaxy = {
        ...galaxyData,
        galaxyId: reserveNextGalaxyId(this.galaxies),
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
      syncNextGalaxyId(this.galaxies);
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

    async deleteGalaxy(galaxyId) {
      await deleteGalaxyFromApi(galaxyId);
      purgeCachedGalaxyArtifacts(galaxyId);
      this.galaxies = this.galaxies.filter((g) => g.galaxyId !== galaxyId);
      saveToStorage(this.galaxies);
      syncNextGalaxyId(this.galaxies);
      if (!this.galaxies.length) {
        this.currentGalaxyId = null;
        localStorage.removeItem(CURRENT_KEY);
        purgeAllCachedGalaxyArtifacts();
      } else if (this.currentGalaxyId === galaxyId) {
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
          syncNextGalaxyId(this.galaxies);
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
