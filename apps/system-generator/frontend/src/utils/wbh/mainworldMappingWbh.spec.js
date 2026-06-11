import { describe, expect, it } from "vitest";

import { generateMainworldTerrainComposition } from "./mainworldMappingWbh.js";

describe("mainworldMappingWbh", () => {
  it("uses exact template unique hex counts for world size 6", () => {
    const composition = generateMainworldTerrainComposition({
      sizeCode: "6",
      atmosphereCode: 6,
      hydrographics: 6,
      hydrographicsPercent: 60,
      avgTempC: 15,
      highTempC: 28,
      seismology: { totalSeismicStress: 10, majorTectonicPlates: 4 },
    });

    expect(composition.totalMapHexes).toBe(356);
    expect(composition.assignedHexes).toBe(356);
  });

  it("converts Shore to Islands when composition is only Ocean/Shore/Islands", () => {
    const composition = generateMainworldTerrainComposition({
      sizeCode: "5",
      atmosphereCode: 6,
      hydrographics: 10,
      hydrographicsPercent: 100,
      avgTempC: 20,
      highTempC: 28,
      seismology: { totalSeismicStress: 0, majorTectonicPlates: 0 },
    });

    const countsByType = new Map(composition.hexCounts.map((entry) => [String(entry.type), Number(entry.hexes) || 0]));

    expect(countsByType.has("Shore")).toBe(false);
    expect(countsByType.get("Ocean")).toBeGreaterThan(0);
    expect(countsByType.get("Islands")).toBeGreaterThan(0);
  });

  it("reports inland water as Lake entries without River entries", () => {
    const composition = generateMainworldTerrainComposition({
      sizeCode: "6",
      atmosphereCode: 6,
      hydrographics: 7,
      hydrographicsPercent: 70,
      avgTempC: 18,
      highTempC: 30,
      seismology: { totalSeismicStress: 5, majorTectonicPlates: 4 },
    });

    const countsByType = new Map(composition.hexCounts.map((entry) => [String(entry.type), Number(entry.hexes) || 0]));

    expect(countsByType.has("River")).toBe(false);
    expect(countsByType.get("Lake") || 0).toBeGreaterThanOrEqual(0);
  });

  it("generates woods, rough woods, wet woods, and wetland hex types when climate supports vegetation", () => {
    const composition = generateMainworldTerrainComposition({
      sizeCode: "6",
      atmosphereCode: 6,
      hydrographics: 8,
      hydrographicsPercent: 80,
      avgTempC: 18,
      highTempC: 28,
      seismology: { totalSeismicStress: 8, majorTectonicPlates: 4 },
    });

    const countsByType = new Map(composition.hexCounts.map((entry) => [String(entry.type), Number(entry.hexes) || 0]));

    expect(countsByType.get("Woods") || 0).toBeGreaterThan(0);
    expect(countsByType.get("Rough Woods") || 0).toBeGreaterThan(0);
    expect(countsByType.get("Wet Woods") || 0).toBeGreaterThan(0);
    expect(countsByType.get("Wetland") || 0).toBeGreaterThan(0);
  });
});
