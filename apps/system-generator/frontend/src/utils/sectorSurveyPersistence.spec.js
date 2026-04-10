import { describe, expect, it } from "vitest";

import {
  buildSectorSurveyCreatePayload,
  buildSectorSurveyGenerationMutation,
  buildSectorSurveyPreviewHexUpdate,
  buildSectorSurveyRebuiltPreview,
  buildSectorSurveyReturnRoute,
  buildSectorSurveySavedPreviewState,
  buildSectorSurveySavePayload,
  resolveSectorSurveyNameUpdate,
  resolveSectorSurveyBackRoute,
  resolveSectorSurveyInitialSelection,
} from "./sectorSurveyPersistence.js";

describe("sectorSurveyPersistence", () => {
  const sectors = [
    { sectorId: "sector-a", metadata: { gridX: 2, gridY: -1 } },
    { sectorId: "sector-b", metadata: { gridX: 3, gridY: 4 } },
  ];

  it("prefers an explicit requested sector and preserves requested viewport context", () => {
    const result = resolveSectorSurveyInitialSelection({
      sectors,
      currentSectorId: "sector-a",
      requestedSectorId: "sector-b",
      requestedViewport: {
        scope: "subsector",
        subsector: "D",
        subsectorName: "Marches",
      },
    });

    expect(result).toEqual({
      mode: "load",
      sectorId: "sector-b",
      reason: "requested-sector",
      viewport: {
        scope: "subsector",
        subsector: "D",
        subsectorName: "Marches",
      },
    });
  });

  it("loads a sector matched by requested atlas grid coordinates before current or fallback sector", () => {
    const result = resolveSectorSurveyInitialSelection({
      sectors,
      currentSectorId: "sector-a",
      requestedGrid: { x: 3, y: 4 },
      requestedViewport: { scope: "sector" },
    });

    expect(result).toEqual({
      mode: "load",
      sectorId: "sector-b",
      reason: "requested-grid",
      viewport: null,
    });
  });

  it("falls back to atlas initialization when requested grid coordinates have no persisted sector", () => {
    const result = resolveSectorSurveyInitialSelection({
      sectors,
      requestedGrid: { x: 99, y: 99 },
      requestedViewport: {
        scope: "subsector",
        subsector: "A",
        subsectorName: "Frontier",
      },
    });

    expect(result).toEqual({
      mode: "atlas",
      sectorId: null,
      reason: "requested-grid-miss",
      viewport: {
        scope: "subsector",
        subsector: "A",
        subsectorName: "Frontier",
      },
    });
  });

  it("uses the current sector before the first saved fallback when no explicit request exists", () => {
    const result = resolveSectorSurveyInitialSelection({
      sectors,
      currentSectorId: "sector-b",
    });

    expect(result).toEqual({
      mode: "load",
      sectorId: "sector-b",
      reason: "current-sector",
      viewport: {
        scope: null,
        subsector: null,
        subsectorName: null,
      },
    });
  });

  it("prefers explicit return routes before atlas or galaxy fallbacks", () => {
    const explicitReturnRoute = { name: "OrbitalView", params: { galaxyId: "gal-1" }, query: { hex: "0101" } };

    expect(
      resolveSectorSurveyBackRoute({
        explicitReturnRoute,
        from: "atlas",
        atlasGalaxyId: "atlas-gal",
        galaxyId: "sector-gal",
      }),
    ).toEqual(explicitReturnRoute);
  });

  it("builds atlas and galaxy fallback back-routes when no explicit route is available", () => {
    expect(resolveSectorSurveyBackRoute({ from: "atlas", atlasGalaxyId: "atlas-gal" })).toEqual({
      name: "TravellerAtlas",
      query: { galaxyId: "atlas-gal" },
    });

    expect(resolveSectorSurveyBackRoute({ from: "sector" })).toEqual({ name: "GalaxySurvey" });
  });

  it("builds serialized return-route payloads with saved sector and subsector context", () => {
    const result = buildSectorSurveyReturnRoute({
      currentSurveyRouteName: "SubsectorSurvey",
      galaxyId: "gal-9",
      routeQuery: { from: "atlas", gridX: 2, gridY: -3 },
      sectorId: "sector-b",
      scope: "subsector",
      selectedSubsector: "F",
      subsectorName: "Drift",
    });

    expect(result).toEqual({
      name: "SubsectorSurvey",
      params: { galaxyId: "gal-9" },
      query: {
        from: "atlas",
        gridX: 2,
        gridY: -3,
        sectorId: "sector-b",
        viewScope: "subsector",
        subsector: "F",
        subsectorName: "Drift",
      },
    });
  });

  it("builds atlas-origin create payloads with subsector metadata and names", () => {
    const payload = buildSectorSurveyCreatePayload({
      galaxyId: "gal-7",
      requestedGrid: { x: 12, y: -4 },
      displayName: "Spinward Reach",
      scope: "subsector",
      selectedSubsector: "C",
      subsectorName: "Lanthan",
      storedSubsectorNames: { A: "Regina" },
      densityClass: 4,
      densityVariation: 50,
      cols: 8,
      rows: 10,
      isGalacticCenterSector: false,
      occupancyRealism: 1.25,
      createSectorId: () => "gal-7:12,-4",
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(payload).toEqual({
      sectorId: "gal-7:12,-4",
      galaxyId: "gal-7",
      coordinates: { x: 12, y: -4 },
      densityClass: 4,
      densityVariation: 50,
      metadata: {
        createdAt: "2026-04-08T00:00:00.000Z",
        lastModified: "2026-04-08T00:00:00.000Z",
        displayName: "Spinward Reach",
        explorationStatus: "unexplored",
        scope: "subsector",
        gridCols: 8,
        gridRows: 10,
        subsector: "C",
        subsectorName: "Lanthan",
        subsectorNames: { A: "Regina", C: "Lanthan" },
        isGalacticCenterSector: false,
        occupancyRealism: 1.25,
        occupiedHexes: [],
        hexStarTypes: {},
        hexPresenceGenerated: false,
        gridX: 12,
        gridY: -4,
        notes: "Generated subsector C (Lanthan)",
      },
    });
  });

  it("builds save payloads that preserve persisted ids, coordinates, and created timestamps", () => {
    const payload = buildSectorSurveySavePayload({
      existingSector: {
        sectorId: "sector-a",
        coordinates: { x: 5, y: 6 },
        densityVariation: 42,
        metadata: { createdAt: "2026-01-01T00:00:00.000Z", gridX: 5, gridY: 6 },
      },
      existingSectorId: "sector-a",
      generatedSectorName: "Deneb",
      requestedGrid: { x: 11, y: 12 },
      galaxyId: "gal-1",
      densityClass: 5,
      densityVariation: 30,
      nextMetadata: { displayName: "Deneb", systemCount: 18 },
      createSectorId: () => "unused",
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(payload.sectorId).toBe("sector-a");
    expect(payload.coordinates).toEqual({ x: 5, y: 6 });
    expect(payload.densityVariation).toBe(42);
    expect(payload.metadata.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(payload.metadata.displayName).toBe("Deneb");
    expect(payload.metadata.gridX).toBe(11);
    expect(payload.metadata.gridY).toBe(12);
  });

  it("builds save payloads for regeneration branches without dropping prior metadata", () => {
    const payload = buildSectorSurveySavePayload({
      existingSector: {
        sectorId: "sector-b",
        galaxyId: "gal-2",
        coordinates: { x: 8, y: 9 },
        metadata: {
          createdAt: "2026-01-01T00:00:00.000Z",
          displayName: "Old Reach",
          customFlag: true,
        },
      },
      existingSectorId: "sector-b",
      galaxyId: "gal-2",
      densityClass: 2,
      densityVariation: 18,
      nextMetadata: {
        displayName: "New Reach",
        occupiedHexes: ["0101"],
        lastModified: "2026-04-08T00:00:00.000Z",
      },
    });

    expect(payload.coordinates).toEqual({ x: 8, y: 9 });
    expect(payload.metadata).toEqual({
      createdAt: "2026-01-01T00:00:00.000Z",
      displayName: "New Reach",
      customFlag: true,
      occupiedHexes: ["0101"],
      lastModified: "2026-04-08T00:00:00.000Z",
    });
  });

  it("builds rename payloads only when display or subsector names actually change", () => {
    const unchanged = resolveSectorSurveyNameUpdate({
      sector: { sectorId: "sector-a", metadata: { displayName: "Regina", subsectorNames: { B: "Lanth" } } },
      scope: "subsector",
      sectorName: "Regina",
      subsectorName: "Lanth",
      selectedSubsector: "B",
      getStoredSubsectorName: (metadata, letter) => metadata?.subsectorNames?.[letter] || "",
      getStoredSubsectorNames: (metadata) => ({ ...(metadata?.subsectorNames || {}) }),
    });

    expect(unchanged.changed).toBe(false);
    expect(unchanged.updatePayload).toBeNull();

    const changed = resolveSectorSurveyNameUpdate({
      sector: { sectorId: "sector-a", metadata: { displayName: "Regina", subsectorNames: { B: "Lanth" } } },
      scope: "subsector",
      sectorName: "Regina March",
      subsectorName: "Jewell",
      selectedSubsector: "B",
      getStoredSubsectorName: (metadata, letter) => metadata?.subsectorNames?.[letter] || "",
      getStoredSubsectorNames: (metadata) => ({ ...(metadata?.subsectorNames || {}) }),
      getNormalizedSubsectorLetter: (value) =>
        String(value || "A")
          .trim()
          .charAt(0)
          .toUpperCase() || "A",
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(changed.changed).toBe(true);
    expect(changed.nextDisplayName).toBe("Regina March");
    expect(changed.updatePayload.metadata.subsectorNames).toEqual({ B: "Jewell" });
    expect(changed.updatePayload.metadata.lastModified).toBe("2026-04-08T00:00:00.000Z");
  });

  it("builds generation mutations for both existing-sector updates and new-sector creates", () => {
    const updateMutation = buildSectorSurveyGenerationMutation({
      existingSectorId: "sector-a",
      existingSectorRecord: { sectorId: "sector-a", galaxyId: "gal-1", coordinates: { x: 1, y: 2 } },
      densityClass: 4,
      densityVariation: 55,
      sharedMetadata: { displayName: "Regina", systemCount: 8 },
    });

    expect(updateMutation).toEqual({
      mode: "update",
      sectorId: "sector-a",
      payload: {
        sectorId: "sector-a",
        galaxyId: "gal-1",
        coordinates: { x: 1, y: 2 },
        densityClass: 4,
        densityVariation: 55,
        metadata: { displayName: "Regina", systemCount: 8 },
      },
    });

    const createMutation = buildSectorSurveyGenerationMutation({
      generatedName: "Deneb",
      requestedGrid: { x: 9, y: -2 },
      galaxyId: "gal-9",
      densityClass: 5,
      densityVariation: 70,
      sharedMetadata: { displayName: "Deneb", systemCount: 12 },
      scope: "subsector",
      selectedSubsector: "H",
      subsectorName: "March",
      createSectorId: () => "gal-9:9,-2",
      nowIso: "2026-04-08T00:00:00.000Z",
    });

    expect(createMutation).toEqual({
      mode: "create",
      sectorId: "gal-9:9,-2",
      payload: {
        sectorId: "gal-9:9,-2",
        galaxyId: "gal-9",
        coordinates: { x: 9, y: -2 },
        densityClass: 5,
        densityVariation: 70,
        metadata: {
          createdAt: "2026-04-08T00:00:00.000Z",
          explorationStatus: "unexplored",
          gridX: 9,
          gridY: -2,
          notes: "Generated subsector H (March)",
          displayName: "Deneb",
          systemCount: 12,
        },
      },
    });
  });

  it("builds saved preview state snapshots with recalculated counts", () => {
    const preview = buildSectorSurveySavedPreviewState({
      generatedSector: {
        sectorId: "temp",
        name: "Draft Reach",
        gridCols: 8,
        gridRows: 10,
        hexes: [
          { coord: "0101", hasSystem: true, presenceOnly: false },
          { coord: "0102", hasSystem: true, presenceOnly: true },
          { coord: "0103", hasSystem: false, presenceOnly: false },
        ],
      },
      persistedSectorId: "sector-c",
      persistedDisplayName: "Saved Reach",
      density: "standard",
      occupancyRealism: 1.1,
    });

    expect(preview.sectorId).toBe("sector-c");
    expect(preview.name).toBe("Saved Reach");
    expect(preview.systemCount).toBe(2);
    expect(preview.emptyCount).toBe(78);
    expect(preview.presenceOnlyCount).toBe(1);
  });

  it("builds single-hex preview updates with refreshed summary counts", () => {
    const preview = buildSectorSurveyPreviewHexUpdate({
      generatedSector: {
        gridCols: 8,
        gridRows: 10,
        hexes: [
          { coord: "0101", hasSystem: false, presenceOnly: false },
          { coord: "0102", hasSystem: true, presenceOnly: true },
        ],
      },
      coord: "0101",
      hexPatch: { hasSystem: true, presenceOnly: false, starType: "G2 V" },
    });

    expect(preview.hexes[0]).toMatchObject({ coord: "0101", hasSystem: true, starType: "G2 V" });
    expect(preview.systemCount).toBe(2);
    expect(preview.emptyCount).toBe(78);
    expect(preview.presenceOnlyCount).toBe(1);
  });

  it("rebuilds sector or subsector previews from the current survey mode", () => {
    const sectorPreview = buildSectorSurveyRebuiltPreview({
      previewScope: "sector",
      sectorId: "sec-1",
      name: "Spinward Verge",
      density: "average",
      occupancyRealism: 1,
      cols: 2,
      rows: 2,
      hexes: [
        { coord: "0101", hasSystem: true },
        { coord: "0102", hasSystem: false },
        { coord: "0201", hasSystem: false },
        { coord: "0202", hasSystem: false },
      ],
    });

    expect(sectorPreview.scope).toBe("sector");
    expect(sectorPreview.systemCount).toBe(1);
    expect(sectorPreview.emptyCount).toBe(3);

    const subsectorPreview = buildSectorSurveyRebuiltPreview({
      previewScope: "subsector",
      sectorId: "sec-2",
      name: "Lanthan / C",
      density: "average",
      occupancyRealism: 1,
      cols: 2,
      rows: 2,
      metadata: {
        occupiedHexes: ["0101"],
        hexStarTypes: {
          "0101": { starType: "G2 V" },
        },
      },
    });

    expect(subsectorPreview.scope).toBe("subsector");
    expect(subsectorPreview.systemCount).toBe(1);
    expect(subsectorPreview.hexes.find((hex) => hex.coord === "0101")?.starType).toBe("G2 V");
  });
});
