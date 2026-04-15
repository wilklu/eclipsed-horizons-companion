import { describe, expect, it } from "vitest";

import {
  buildHexStarTypeMetadata,
  normalizeHexStarTypeRecord,
  normalizeHexStarTypesMap,
  resolveGeneratedStarsFromHex,
  resolveGeneratedStarsFromSystem,
  summarizeLegacyStarMetadata,
  summarizeGeneratedStars,
} from "./systemStarMetadata.js";

describe("systemStarMetadata", () => {
  it("reconstructs rich generated stars from legacy imported system records", () => {
    const stars = resolveGeneratedStarsFromSystem({
      primaryStar: { spectralClass: "G2 V" },
      companionStars: [{ spectralClass: "K7 V" }, { spectralClass: "M4 V" }],
    });
    const summary = summarizeGeneratedStars(stars);

    expect(stars).toHaveLength(3);
    expect(stars[1].orbitType).toBe("Near");
    expect(stars[2].orbitType).toBe("Far");
    expect(summary.primaryDesignation).toBe("G2 V");
    expect(summary.secondaryStars).toEqual(["K7 V", "M4 V"]);
  });

  it("reconstructs rich generated stars from flat hex labels when generated stars are absent", () => {
    const stars = resolveGeneratedStarsFromHex({
      starType: "Black Hole",
      secondaryStars: ["K7 V"],
      anomalyType: "Black Hole",
    });

    expect(stars).toHaveLength(2);
    expect(stars[0].designation).toBe("BH");
    expect(stars[0].isAnomaly).toBe(true);
    expect(stars[1].orbitType).toBe("Near");
    expect(stars[1].spectralClass).toBe("K7 V");
  });

  it("preserves typeSubtype-based primary and companion star records from saved system surveys", () => {
    const stars = resolveGeneratedStarsFromSystem({
      stars: [
        { designation: "A", typeSubtype: "K2 V", lumClass: "V" },
        { designation: "B", typeSubtype: "M4 V", lumClass: "V" },
      ],
    });
    const summary = summarizeGeneratedStars(stars);

    expect(stars).toHaveLength(2);
    expect(summary.primaryDesignation).toBe("K2 V");
    expect(summary.secondaryStars).toEqual(["M4 V"]);
  });

  it("builds hex star metadata from generated stars without trusting stale flat labels", () => {
    const metadata = buildHexStarTypeMetadata({
      generatedStars: [
        { designation: "G2 V", spectralClass: "G2 V" },
        { designation: "M4 V", spectralClass: "M4 V", orbitType: "Companion" },
      ],
      primary: "K2 V",
      secondaryStars: ["BD"],
      fallbackStarType: "K2 V",
    });

    expect(metadata.starType).toBe("G2 V");
    expect(metadata.secondaryStars).toEqual(["M4 V"]);
    expect(metadata.generatedStars[1].orbitType).toBe("Companion");
  });

  it("preserves anomaly labels in hex star metadata while keeping rich anomaly stars", () => {
    const metadata = buildHexStarTypeMetadata({
      anomalyType: "Black Hole",
      secondaryStars: ["K7 V"],
      fallbackStarType: "Black Hole",
    });

    expect(metadata.starType).toBe("Black Hole");
    expect(metadata.generatedStars[0].designation).toBe("BH");
    expect(metadata.secondaryStars).toEqual(["K7 V"]);
  });

  it("normalizes legacy hex star records into canonical generated-star metadata", () => {
    const record = normalizeHexStarTypeRecord({
      starType: "G2 V",
      secondaryStars: ["K7 V"],
      anomalyDetails: { source: "import" },
    });

    expect(record.starType).toBe("G2 V");
    expect(record.secondaryStars).toEqual(["K7 V"]);
    expect(record.generatedStars).toHaveLength(2);
    expect(record.generatedStars[1].orbitType).toBe("Near");
    expect(record.anomalyDetails).toEqual({ source: "import" });
    expect(record.legacyReconstructed).toBe(true);
    expect(record.legacyHierarchyUnknown).toBe(true);
  });

  it("normalizes hex star type maps from imported sector metadata", () => {
    const normalizedMap = normalizeHexStarTypesMap({
      "0101": { starType: "Black Hole", secondaryStars: ["K7 V"], anomalyType: "Black Hole" },
      "0102": { generatedStars: [{ designation: "M3 V", spectralClass: "M3 V" }] },
    });

    expect(normalizedMap["0101"].generatedStars[0].designation).toBe("BH");
    expect(normalizedMap["0101"].secondaryStars).toEqual(["K7 V"]);
    expect(normalizedMap["0101"].legacyReconstructed).toBe(true);
    expect(normalizedMap["0101"].legacyHierarchyUnknown).toBe(true);
    expect(normalizedMap["0102"].starType).toBe("M3 V");
    expect(normalizedMap["0102"].generatedStars).toHaveLength(1);
    expect(normalizedMap["0102"].legacyReconstructed).toBe(false);
  });

  it("summarizes legacy reconstruction markers across hex metadata and saved systems", () => {
    const summary = summarizeLegacyStarMetadata({
      hexStarTypes: {
        "0101": { legacyReconstructed: true, legacyHierarchyUnknown: true },
        "0102": { legacyReconstructed: true, legacyHierarchyUnknown: false },
      },
      systems: [
        {
          hexCoordinates: { x: 1, y: 3 },
          metadata: {
            generatedSurvey: {
              legacyReconstructed: false,
              legacyHierarchyUnknown: true,
            },
          },
        },
      ],
    });

    expect(summary.hasLegacyData).toBe(true);
    expect(summary.trackedHexCount).toBe(3);
    expect(summary.legacyReconstructedCount).toBe(2);
    expect(summary.legacyHierarchyUnknownCount).toBe(2);
    expect(summary.reconstructedCoords).toEqual(["0101", "0102"]);
    expect(summary.hierarchyUnknownCoords).toEqual(["0101", "0103"]);
  });
});
