import { describe, expect, it } from "vitest";

import { buildFullSectorPreviewState, buildSectorPreviewState } from "./sectorPreviewState.js";

describe("sectorPreviewState", () => {
  it("summarizes legacy markers from regenerated preview hexes", () => {
    const preview = buildSectorPreviewState({
      sectorId: "sec-1",
      name: "Spinward Verge",
      scope: "sector",
      density: "average",
      occupancyRealism: 1,
      cols: 2,
      rows: 2,
      hexes: [
        { coord: "0101", hasSystem: true, legacyReconstructed: true },
        { coord: "0102", hasSystem: true, legacyHierarchyUnknown: true, presenceOnly: true },
        { coord: "0201", hasSystem: false },
        { coord: "0202", hasSystem: false },
      ],
    });

    expect(preview.systemCount).toBe(2);
    expect(preview.emptyCount).toBe(2);
    expect(preview.presenceOnlyCount).toBe(1);
    expect(preview.legacyReconstructedCount).toBe(1);
    expect(preview.legacyHierarchyUnknownCount).toBe(1);
  });

  it("rebuilds persisted preview state from metadata-backed sectors", () => {
    const preview = buildFullSectorPreviewState({
      sectorId: "sec-2",
      name: "Trailing Reach",
      scope: "sector",
      density: "dense",
      occupancyRealism: 0.75,
      metadata: {
        occupiedHexes: ["0101"],
        hexStarTypes: {
          "0101": {
            starType: "G2 V",
            legacyReconstructed: true,
            secondaryStars: ["K7 V"],
          },
          "0102": {
            starType: "",
            anomalyType: null,
            legacyHierarchyUnknown: true,
          },
        },
      },
      cols: 2,
      rows: 2,
    });

    expect(preview.hexes.filter((hex) => hex.hasSystem)).toHaveLength(2);
    expect(preview.systemCount).toBe(2);
    expect(preview.presenceOnlyCount).toBe(0);
    expect(preview.legacyReconstructedCount).toBe(1);
    expect(preview.legacyHierarchyUnknownCount).toBe(1);
    expect(preview.metadata.hexStarTypes["0101"].legacyReconstructed).toBe(true);
  });
});
