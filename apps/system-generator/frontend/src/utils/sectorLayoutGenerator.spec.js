import { describe, expect, it } from "vitest";

import { estimateGalaxySectorFootprint, generateGalaxySectorLayout } from "./sectorLayoutGenerator.js";

describe("sectorLayoutGenerator", () => {
  it("reports the true-scale sector footprint from galaxy diameter", () => {
    const footprint = estimateGalaxySectorFootprint({
      galaxyDimensions: { diameterInParsecs: 96000 },
    });

    expect(footprint.width).toBe(3000);
    expect(footprint.height).toBe(2400);
    expect(footprint.footprintWidthPc).toBe(96000);
    expect(footprint.footprintHeightPc).toBe(96000);
  });

  it("keeps the preview grid aligned to the true-scale aspect ratio", () => {
    const layout = generateGalaxySectorLayout({
      galaxyId: "gal-1",
      type: "Spiral",
      galaxyDimensions: { diameterInParsecs: 96000 },
      morphology: { bulgeRadius: 5000, armCount: 2, coreDensity: 0.7 },
    });

    expect(layout.length).toBeGreaterThan(0);
    expect(layout[0].metadata.gridWidth).toBe(17);
    expect(layout[0].metadata.gridHeight).toBe(14);
  });

  it("uses standard density across the entire layout when the galaxy override is enabled", () => {
    const layout = generateGalaxySectorLayout({
      galaxyId: "gal-1",
      type: "Spiral",
      galaxyDimensions: { diameterInParsecs: 96000 },
      morphology: { bulgeRadius: 5000, armCount: 2, coreDensity: 0.7 },
      metadata: { densityProfileMode: "standard" },
    });

    expect(layout.length).toBeGreaterThan(0);
    expect(new Set(layout.map((sector) => sector.densityClass))).toEqual(new Set([3]));
  });
});
