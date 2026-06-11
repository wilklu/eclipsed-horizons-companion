import { describe, it, expect } from "vitest";

import { generateHydrographicsCompositionDetailed } from "./hydrographicsCompositionWbh.js";

describe("generateHydrographicsCompositionDetailed", () => {
  it("handles no hydrographics (code 0)", () => {
    const out = generateHydrographicsCompositionDetailed({ hydrographics: 0 });
    expect(out.code).toBe(0);
    expect(out.waterFraction).toBe(0);
    expect(out.description).toBe("None");
  });

  it("returns reasonable mid-range values for code 6", () => {
    const out = generateHydrographicsCompositionDetailed({ hydrographics: 6, avgTempC: 15 });
    expect(out.code).toBe(6);
    expect(out.waterFraction).toBeGreaterThan(0.5);
    expect(out.oceanFraction).toBeGreaterThan(0);
    expect(out.landFraction).toBeGreaterThan(0);
  });

  it("handles near-global water (code 10)", () => {
    const out = generateHydrographicsCompositionDetailed({ hydrographics: 10, avgTempC: 20 });
    expect(out.code).toBe(10);
    expect(out.waterFraction).toBeGreaterThan(0.95);
    expect(out.surfaceDistribution).toBe("Extremely Concentrated");
  });
});
