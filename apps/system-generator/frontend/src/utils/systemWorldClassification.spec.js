import { describe, expect, it } from "vitest";

import { classifyPlanetaryBody, resolveOrbitBandFromOrbitNumber } from "./systemWorldClassification.js";

describe("systemWorldClassification", () => {
  it("maps orbit numbers into the agreed orbit bands", () => {
    expect(resolveOrbitBandFromOrbitNumber(0)).toEqual({ key: "epistellar", label: "Epistellar" });
    expect(resolveOrbitBandFromOrbitNumber(2)).toEqual({ key: "epistellar", label: "Epistellar" });
    expect(resolveOrbitBandFromOrbitNumber(3)).toEqual({ key: "inner", label: "Inner Zone" });
    expect(resolveOrbitBandFromOrbitNumber(5)).toEqual({ key: "inner", label: "Inner Zone" });
    expect(resolveOrbitBandFromOrbitNumber(6)).toEqual({ key: "outer", label: "Outer Zone" });
    expect(resolveOrbitBandFromOrbitNumber(12)).toEqual({ key: "outer", label: "Outer Zone" });
  });

  it("classifies small epistellar rocky bodies as meltballs when they are molten", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 1,
      size: 2,
      avgTempC: 260,
      hydrographics: 0,
      runawayGreenhouse: true,
    });

    expect(classification.worldFamily).toBe("Dwarf World");
    expect(classification.worldSubtype).toBe("Meltball");
    expect(classification.orbitBand).toBe("Epistellar");
    expect(classification.worldDescriptor).toBe("Epistellar Meltball");
  });

  it("classifies habitable inner-zone terrestrial worlds as tectonic when they hold significant surface water", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 4,
      size: 8,
      hydrographics: 6,
      avgTempC: 19,
      nativeLifeform: "2201",
    });

    expect(classification.worldFamily).toBe("Terrestrial World");
    expect(classification.worldClass).toBe("Tectonic");
    expect(classification.worldSubtype).toBe("Tectonic");
    expect(classification.worldDescriptor).toBe("Inner Zone Tectonic");
  });

  it("classifies frozen outer dwarf worlds as snowballs", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 9,
      size: 3,
      hydrographics: 9,
      zone: "frozen",
      avgTempC: -140,
    });

    expect(classification.worldFamily).toBe("Dwarf World");
    expect(classification.worldSubtype).toBe("Snowball");
    expect(classification.orbitBand).toBe("Outer Zone");
  });
});
