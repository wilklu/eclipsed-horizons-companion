import { describe, expect, it, vi } from "vitest";

import {
  buildGalaxyCreatePayload,
  buildGalaxyEditPayload,
  buildGalaxyImportRequest,
  buildGalaxySectorStatsPayload,
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

  it("builds galaxy create payloads from the new-galaxy form and resolved placement coordinates", () => {
    const payload = buildGalaxyCreatePayload({
      galaxyId: "gal-123",
      newGalaxyForm: {
        name: "Deneb",
        type: "Spiral",
        placementMode: "manual",
        placementSeed: "seed-1",
        bulgeRadius: 7000,
        armCount: 4,
        coreDensity: 0.55,
        diskThickness: 1800,
        centralAnomalyType: "Black Hole",
        centralAnomalyMassSolar: "4200000",
        centralAnomalyActivity: "0.35",
      },
      universeCoordinates: { x: 20, y: -10 },
      placementTuning: { minSeparationDiameters: 12 },
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(payload).toEqual({
      galaxyId: "gal-123",
      name: "Deneb",
      type: "Spiral",
      morphology: {
        bulgeRadius: 7000,
        armCount: 4,
        coreDensity: 0.55,
        diskThickness: 1800,
        centralAnomaly: {
          type: "Black Hole",
          massSolarMasses: 4200000,
          activityIndex: 0.35,
        },
      },
      metadata: {
        createdAt: "2026-04-08T00:00:00.000Z",
        lastModified: "2026-04-08T00:00:00.000Z",
        status: "active",
        version: 1,
        universeCoordinates: { x: 20, y: -10 },
        universePlacementMode: "manual",
        universePlacementSeed: "seed-1",
        universePlacementTuning: { minSeparationDiameters: 12 },
      },
    });
  });

  it("builds galaxy edit payloads with clamped morphology and anomaly fields", () => {
    const payload = buildGalaxyEditPayload({
      galaxy: {
        galaxyId: "gal-7",
        name: "Old Name",
        type: "Spiral",
        morphology: {
          bulgeRadius: 6000,
          centralAnomaly: { legacyField: true },
        },
        metadata: { createdAt: "2026-01-01T00:00:00.000Z" },
      },
      nextName: "New Name",
      galaxyEditForm: {
        type: "Elliptical",
        bulgeRadius: 999999,
        armCount: -5,
        coreDensity: 2,
        diskThickness: 10,
        centralAnomalyType: "Pulsar",
        centralAnomalyMassSolar: 0,
        centralAnomalyActivity: 5,
      },
      clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(payload.name).toBe("New Name");
    expect(payload.type).toBe("Elliptical");
    expect(payload.morphology.bulgeRadius).toBe(50000);
    expect(payload.morphology.armCount).toBe(0);
    expect(payload.morphology.coreDensity).toBe(1);
    expect(payload.morphology.diskThickness).toBe(500);
    expect(payload.morphology.centralAnomaly).toEqual({
      legacyField: true,
      type: "Pulsar",
      massSolarMasses: 1,
      activityIndex: 1,
    });
    expect(payload.metadata.lastModified).toBe("2026-04-08T00:00:00.000Z");
    expect(payload.metadata.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("builds galaxy stats update payloads without dropping existing metadata", () => {
    const payload = buildGalaxySectorStatsPayload({
      galaxy: {
        galaxyId: "gal-9",
        metadata: {
          createdAt: "2026-01-01T00:00:00.000Z",
          status: "active",
        },
      },
      stats: { totalSectors: 4 },
      normalizeStats: (stats) => ({ ...stats, normalized: true }),
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(payload).toEqual({
      galaxyId: "gal-9",
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        status: "active",
        sectorStats: { totalSectors: 4, normalized: true },
        lastModified: "2026-04-08T00:00:00.000Z",
      },
    });
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
