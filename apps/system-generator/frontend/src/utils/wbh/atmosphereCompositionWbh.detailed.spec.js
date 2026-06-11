import { describe, it, expect } from "vitest";

import { generateAtmosphereCompositionDetailed } from "./atmosphereCompositionWbh.js";

describe("generateAtmosphereCompositionDetailed", () => {
  it("returns structured N2/O2 mix for standard atmospheres", () => {
    const out = generateAtmosphereCompositionDetailed({ atmosphereCode: 6, oxygenFraction: 0.21 });
    expect(out).toBeTruthy();
    expect(out.code).toBe(6);
    expect(typeof out.description).toBe("string");
    expect(out.gases.some((g) => g.gas === "O₂" || g.gas === "O2" || g.gas === "O₂")).toBe(true);
    expect(out.dominantGas).toBe("N₂");
  });

  it("returns structured composition for exotic corrosive atmospheres (code 10)", () => {
    const out = generateAtmosphereCompositionDetailed({ atmosphereCode: 10 });
    expect(out.code).toBe(10);
    expect(out.dominantGas).toBe("HCl");
    expect(out.gases.some((g) => g.gas === "HCl")).toBe(true);
  });

  it("handles vacuum (code 0)", () => {
    const out = generateAtmosphereCompositionDetailed({ atmosphereCode: 0 });
    expect(out.code).toBe(0);
    expect(out.description).toBe("None");
    expect(out.gases.length).toBe(0);
  });
});
