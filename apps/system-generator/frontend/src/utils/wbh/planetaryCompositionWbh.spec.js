import { describe, it, expect } from "vitest";
import { generatePlanetCompositionDetailed, generatePlanetComposition } from "./planetaryCompositionWbh.js";

describe("planetaryCompositionWbh", () => {
  it("generates a detailed composition that sums to ~100%", () => {
    const d = generatePlanetCompositionDetailed({ size: 5, density: 1.0, hydrographicsPercent: 71, avgTempC: 15 });
    expect(d).toHaveProperty("bulkElementAbundances");
    expect(d).toHaveProperty("volatiles");
    const bulk = d.bulkElementAbundances.reduce((s, e) => s + e.weightPercent, 0);
    const vol = d.volatiles.reduce((s, e) => s + e.weightPercent, 0);
    const total = bulk + vol;
    expect(Math.abs(total - 100)).toBeLessThan(0.001);
  });

  it("produces higher iron fraction for metal-rich hints", () => {
    const normal = generatePlanetCompositionDetailed({ size: 5, density: 1.0 });
    const metal = generatePlanetCompositionDetailed({ size: 5, density: 1.0, baseComposition: "Mostly Metal" });
    const normalFe = normal.bulkElementAbundances.find((b) => b.element === "Fe").weightPercent;
    const metalFe = metal.bulkElementAbundances.find((b) => b.element === "Fe").weightPercent;
    expect(metalFe).toBeGreaterThan(normalFe);
  });

  it("produces substantial H/O for ice hints", () => {
    const ice = generatePlanetCompositionDetailed({
      size: 3,
      density: 0.9,
      baseComposition: "Mostly Ice",
      avgTempC: -200,
      hydrographicsPercent: 90,
    });
    const h = ice.bulkElementAbundances.find((b) => b.element === "H")?.weightPercent || 0;
    const o = ice.bulkElementAbundances.find((b) => b.element === "O")?.weightPercent || 0;
    expect(h + o).toBeGreaterThan(40);
  });

  it("wrapper returns a short summary string", () => {
    const s = generatePlanetComposition({ size: 5, density: 1.0 });
    expect(typeof s).toBe("string");
    expect(s.length).toBeGreaterThan(5);
  });
});
