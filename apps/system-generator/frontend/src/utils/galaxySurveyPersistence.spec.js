import { describe, expect, it, vi } from "vitest";

import {
  buildGalaxyImportRequest,
  canDismissGalaxyImportModal,
  createDefaultGalaxyImportForm,
  resolveGalaxySectorStatsRefresh,
} from "./galaxySurveyPersistence.js";

describe("galaxySurveyPersistence", () => {
  it("builds manual import requests with clamped coordinates and tuning", () => {
    const request = buildGalaxyImportRequest({
      importForm: {
        fileData: { galaxyId: "archive-1" },
        placementMode: "manual",
        coordinatesX: 999,
        coordinatesY: -999,
        placementSeed: "relay-seed",
      },
      universeBoundsRange: { minX: -25, maxX: 25, minY: -30, maxY: 30 },
      clampUniverseCoordinate: (value, min, max) => Math.max(min, Math.min(max, Number(value))),
      placementTuning: { minSeparationDiameters: 12 },
    });

    expect(request.galaxyData).toEqual({ galaxyId: "archive-1" });
    expect(request.options).toEqual({
      mode: "manual",
      coordinates: { x: 25, y: -30 },
      seed: "relay-seed",
      tuning: { minSeparationDiameters: 12 },
    });
  });

  it("keeps clustered imports without explicit coordinates and resets dismiss/default state", () => {
    const defaults = createDefaultGalaxyImportForm();
    const request = buildGalaxyImportRequest({
      importForm: {
        ...defaults,
        fileData: { galaxyId: "archive-2" },
      },
    });

    expect(defaults).toEqual({
      fileData: null,
      placementMode: "clustered",
      placementSeed: "",
      coordinatesX: 0,
      coordinatesY: 0,
      clusterMinSeparation: 12,
      clusterMaxSeparation: 29,
      clusterClearance: 10,
      clusterSlotsPerRing: 16,
    });
    expect(request.options.coordinates).toBeNull();
    expect(canDismissGalaxyImportModal(true)).toBe(false);
    expect(canDismissGalaxyImportModal(false)).toBe(true);
  });

  it("uses cached galaxy stats when refresh is not forced", async () => {
    const normalizeStats = vi.fn((stats) => ({ normalized: true, ...stats }));
    const loadSectors = vi.fn();
    const fetchSectorStats = vi.fn();

    const result = await resolveGalaxySectorStatsRefresh({
      galaxyId: "gal-1",
      cachedStats: { totalSectors: 12 },
      normalizeStats,
      loadSectors,
      fetchSectorStats,
    });

    expect(result.source).toBe("cache");
    expect(result.stats.totalSectors).toBe(12);
    expect(loadSectors).not.toHaveBeenCalled();
    expect(fetchSectorStats).not.toHaveBeenCalled();
  });

  it("forces remote stats refresh, falls back to current sectors, and persists normalized data", async () => {
    const loadSectors = vi.fn().mockRejectedValue(new Error("offline"));
    const fetchSectorStats = vi.fn().mockResolvedValue({ totalSectors: 4, populatedSectors: 2 });
    const persistStats = vi.fn();
    const normalizeStats = vi.fn((stats, { sectors } = {}) => ({
      ...stats,
      legacyTrackedSectors: Array.isArray(sectors) ? sectors.length : 0,
    }));

    const result = await resolveGalaxySectorStatsRefresh({
      galaxyId: "gal-2",
      force: true,
      currentSectors: [{ sectorId: "sec-1" }, { sectorId: "sec-2" }],
      loadSectors,
      fetchSectorStats,
      normalizeStats,
      getGalaxyById: () => ({ galaxyId: "gal-2" }),
      persistStats,
    });

    expect(result.source).toBe("remote");
    expect(result.stats.legacyTrackedSectors).toBe(2);
    expect(fetchSectorStats).toHaveBeenCalledWith("gal-2");
    expect(persistStats).toHaveBeenCalledWith({ galaxyId: "gal-2" }, result.stats);
  });
});
