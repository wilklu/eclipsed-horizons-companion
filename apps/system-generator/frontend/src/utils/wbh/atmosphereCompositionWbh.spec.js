import { describe, it, expect } from "vitest";

import { generateAtmosphereComposition } from "./atmosphereCompositionWbh.js";

describe("generateAtmosphereComposition", () => {
  it("generates an N2/O2 style description for standard atmospheres", () => {
    const desc = generateAtmosphereComposition({ atmosphereCode: 6, oxygenFraction: 0.21 });
    expect(typeof desc).toBe("string");
    expect(desc).toMatch(/O₂|N₂\/O₂|nitrogen/i);
  });

  it("returns a chlorine description for exotic (code 10)", () => {
    const desc = generateAtmosphereComposition({ atmosphereCode: 10 });
    expect(desc).toMatch(/chlorine|hydrogen chloride/i);
  });

  it("returns CO2 + sulfur phrase for corrosive (code 11)", () => {
    const desc = generateAtmosphereComposition({ atmosphereCode: 11 });
    expect(desc).toMatch(/carbon dioxide|sulfur/i);
  });
});
