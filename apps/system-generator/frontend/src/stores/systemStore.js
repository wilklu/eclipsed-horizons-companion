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
      // Debug: help trace missing planets/terrain during navigation
      try {
        const found = this.systems.find((s) => s.systemId === systemId) ?? null;
        console.log("[DEBUG][systemStore] setCurrentSystem", {
          systemId,
          planetsCount: Array.isArray(found?.planets) ? found.planets.length : 0,
          planetsPreview:
            Array.isArray(found?.planets) && found.planets.length
              ? found.planets.map((p, i) => ({
                  index: i,
                  terrainMapGenerated: p?.terrainMapGenerated,
                  overlayKeys: p?.terrainOverlayBySize ? Object.keys(p.terrainOverlayBySize) : null,
                }))
              : [],
        });
      } catch (err) {
        console.error("[DEBUG][systemStore] setCurrentSystem error", err);
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
      const existing = this.systems.find((system) => system.systemId === systemId) ?? null;
      const payload = {
        ...(existing && typeof existing === "object" ? existing : {}),
        ...(updates && typeof updates === "object" ? updates : {}),
      };
      const next = await systemApi.updateSystem(systemId, payload, options);

      // Preserve terrain and world-level planet fields from the existing local record
      // if the API response omits them. Partial saves (e.g. System Survey autosave)
      // must not erase terrain that a concurrent or prior Terrain Map save has stored.
      const existingPlanets = Array.isArray(existing?.planets) ? existing.planets : [];
      const nextPlanets = Array.isArray(next?.planets) ? next.planets : [];
      const mergedPlanets = [];

      const maxLen = Math.max(existingPlanets.length, nextPlanets.length);
      for (let index = 0; index < maxLen; index += 1) {
        const existingPlanet =
          existingPlanets[index] && typeof existingPlanets[index] === "object" ? existingPlanets[index] : null;
        const nextPlanet = nextPlanets[index] && typeof nextPlanets[index] === "object" ? nextPlanets[index] : null;

        if (!existingPlanet && !nextPlanet) continue;
        if (!existingPlanet) {
          mergedPlanets.push(nextPlanet);
          continue;
        }
        if (!nextPlanet) {
          mergedPlanets.push(existingPlanet);
          continue;
        }

        // Start with shallow merge: prefer nextPlanet's fields for non-terrain data
        const mergedPlanet = { ...existingPlanet, ...nextPlanet };

        // Defensive merge for terrainOverlayBySize: merge size keys, prefer non-empty arrays from nextPlanet
        const existingOverlay =
          existingPlanet.terrainOverlayBySize && typeof existingPlanet.terrainOverlayBySize === "object"
            ? existingPlanet.terrainOverlayBySize
            : {};
        const nextOverlay =
          nextPlanet.terrainOverlayBySize && typeof nextPlanet.terrainOverlayBySize === "object"
            ? nextPlanet.terrainOverlayBySize
            : {};
        const mergedOverlay = { ...existingOverlay };
        for (const k of Object.keys(nextOverlay)) {
          const val = nextOverlay[k];
          const hasValue = Array.isArray(val)
            ? val.length > 0
            : val && typeof val === "object"
              ? Object.keys(val).length > 0
              : Boolean(val);
          if (hasValue) mergedOverlay[k] = val;
        }
        mergedPlanet.terrainOverlayBySize = Object.keys(mergedOverlay).length ? mergedOverlay : {};

        // Defensive merge for terrainHexTags
        const existingHexTags =
          existingPlanet.terrainHexTags && typeof existingPlanet.terrainHexTags === "object"
            ? existingPlanet.terrainHexTags
            : {};
        const nextHexTags =
          nextPlanet.terrainHexTags && typeof nextPlanet.terrainHexTags === "object" ? nextPlanet.terrainHexTags : {};
        const mergedHexTags = { ...existingHexTags };
        for (const k of Object.keys(nextHexTags)) {
          const val = nextHexTags[k];
          if (val && typeof val === "object" && Object.keys(val).length > 0) mergedHexTags[k] = val;
        }
        mergedPlanet.terrainHexTags = Object.keys(mergedHexTags).length ? mergedHexTags : {};

        // terrainComposition: prefer next if it has meaningful keys, otherwise keep existing
        const existingComposition =
          existingPlanet.terrainComposition && typeof existingPlanet.terrainComposition === "object"
            ? existingPlanet.terrainComposition
            : null;
        const nextComposition =
          nextPlanet.terrainComposition && typeof nextPlanet.terrainComposition === "object"
            ? nextPlanet.terrainComposition
            : null;
        mergedPlanet.terrainComposition =
          nextComposition && Object.keys(nextComposition).length ? nextComposition : existingComposition || {};

        // terrainMapGenerated: prefer explicit truthy nextPlanet value; fall back to existing
        if (nextPlanet.terrainMapGenerated === undefined || nextPlanet.terrainMapGenerated === null) {
          mergedPlanet.terrainMapGenerated = Boolean(existingPlanet.terrainMapGenerated === true);
        } else {
          mergedPlanet.terrainMapGenerated = Boolean(nextPlanet.terrainMapGenerated === true);
        }

        mergedPlanets.push(mergedPlanet);
      }

      const merged = {
        ...next,
        ...(mergedPlanets.length > 0 ? { planets: mergedPlanets } : {}),
      };

      saveSystems(
        loadSystems()
          .filter((system) => system.systemId !== systemId)
          .concat(merged),
      );
      const localIndex = this.systems.findIndex((system) => system.systemId === systemId);
      try {
        console.log("[DEBUG][systemStore] updateSystem -> saving merged", {
          systemId,
          mergedPlanetsCount: Array.isArray(merged?.planets) ? merged.planets.length : 0,
          mergedPlanetsPreview:
            Array.isArray(merged?.planets) && merged.planets.length
              ? merged.planets.map((p, i) => ({
                  index: i,
                  terrainMapGenerated: p?.terrainMapGenerated,
                  overlayKeys: p?.terrainOverlayBySize ? Object.keys(p.terrainOverlayBySize) : null,
                }))
              : [],
        });
      } catch (err) {
        console.error("[DEBUG][systemStore] updateSystem logging error", err);
      }
      if (localIndex >= 0) {
        this.systems[localIndex] = merged;
      } else {
        this.systems.push(merged);
      }
      return merged;
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
