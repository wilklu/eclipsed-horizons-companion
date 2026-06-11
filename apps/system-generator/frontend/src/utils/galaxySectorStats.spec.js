import { describe, expect, it } from "vitest";

import { buildGalaxyExportPayload, normalizeSectorStats, summarizeGalaxyLegacyMetadata } from "./galaxySectorStats.js";

describe("galaxySectorStats", () => {
  const sectors = [
    {
      sectorId: "sec-1",
      metadata: {
        hexStarTypes: {
          "0101": { legacyReconstructed: true },
          "0102": { legacyHierarchyUnknown: true },
        },
      },
    },
    {
      sectorId: "sec-2",
      metadata: {
        hexStarTypes: {
          "0201": { starType: "G2 V" },
        },
      },
    },
  ];

  it("aggregates galaxy-wide legacy star metadata from sector records", () => {
    const summary = summarizeGalaxyLegacyMetadata(sectors);

    expect(summary.trackedSectorCount).toBe(2);
    expect(summary.legacySectorCount).toBe(1);
    expect(summary.legacyReconstructedCount).toBe(1);
    expect(summary.legacyHierarchyUnknownCount).toBe(1);
    expect(summary.summary).toContain("reconstructed star tree");
  });

  it("prefers sector-derived legacy counts when normalizing stats", () => {
    const stats = normalizeSectorStats(
      {
        totalSectors: 12,
        populatedSectors: 4,
        generatedPresenceSectors: 5,
        emptySectors: 8,
        totalObjects: 90,
        avgObjectsPerSector: 18,
      },
      { sectors },
    );

    expect(stats.totalSectors).toBe(12);
    expect(stats.legacyTrackedSectors).toBe(2);
    expect(stats.legacySectors).toBe(1);
    expect(stats.legacyReconstructedCount).toBe(1);
    expect(stats.legacyHierarchyUnknownCount).toBe(1);
  });

  it("derives star and sophont concentration baselines for the current galaxy", () => {
    const stats = normalizeSectorStats(
      {
        totalSectors: 2,
        populatedSectors: 2,
        generatedPresenceSectors: 2,
        emptySectors: 0,
        totalObjects: 320,
        avgObjectsPerSector: 160,
      },
      {
        sectors: [
          { sectorId: "dense", metadata: { systemCount: 200 } },
          { sectorId: "quiet", metadata: { systemCount: 120 } },
        ],
        systems: [
          { sectorId: "dense", nativeSophontLife: true },
          { sectorId: "quiet", planets: [{ name: "Tala", nativeSophontLife: true, type: "Terrestrial Planet" }] },
        ],
      },
    );

    expect(stats.starBaselinePerSector).toBe(640);
    expect(stats.starBaselinePercent).toBeCloseTo(25, 5);
    expect(stats.densestSectorObjects).toBe(200);
    expect(stats.sparsestSectorObjects).toBe(120);
    expect(stats.totalSophonts).toBe(2);
    expect(stats.avgSophontsPerSector).toBeCloseTo(1, 5);
    expect(stats.sophontBaselinePerSector).toBe(16);
    expect(stats.sophontBaselinePercent).toBeCloseTo(6.25, 5);
    expect(stats.sophontBearingSectors).toBe(2);
    expect(stats.densestSectorSophonts).toBe(1);
  });

  it("embeds legacy summaries into galaxy export manifests", () => {
    const exported = buildGalaxyExportPayload({
      galaxy: { galaxyId: "gal-1", name: "Sagitta", metadata: {} },
      sectorStats: { totalSectors: 12 },
      sectors,
    });

    expect(exported.metadata.sectorStats.legacyTrackedSectors).toBe(2);
    expect(exported.metadata.exportSummary.legacyStarMetadata.legacyReconstructedCount).toBe(1);
    expect(exported.metadata.exportSummary.legacyStarMetadata.summary).toContain("inferred hierarchy");
  });
});
