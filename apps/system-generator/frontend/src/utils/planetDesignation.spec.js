import { describe, expect, it } from "vitest";
import {
  applyDefaultPlanetDesignations,
  buildPlanetDesignationContext,
  normalizeSystemDesignationLabel,
  resolvePlanetParentDesignation,
  toRomanNumeral,
} from "./planetDesignation.js";

describe("planetDesignation", () => {
  it("converts ordinal values to Roman numerals", () => {
    expect(toRomanNumeral(1)).toBe("I");
    expect(toRomanNumeral(4)).toBe("IV");
    expect(toRomanNumeral(9)).toBe("IX");
    expect(toRomanNumeral(14)).toBe("XIV");
  });

  it("numbers planets and belts separately per parent group", () => {
    const planets = [
      {
        type: "Rocky",
        orbitNumber: 1,
        parentDesignationKey: "single:primary",
        parentDesignation: "",
      },
      {
        type: "Asteroid Belt",
        orbitNumber: 2,
        parentDesignationKey: "single:primary",
        parentDesignation: "",
      },
      {
        type: "Rocky",
        orbitNumber: 3,
        parentDesignationKey: "single:primary",
        parentDesignation: "",
      },
      {
        type: "Rocky",
        orbitNumber: 1,
        parentDesignationKey: "single:secondary-1:B",
        parentDesignation: "B",
      },
      {
        type: "Asteroid Belt",
        orbitNumber: 2,
        parentDesignationKey: "single:secondary-1:B",
        parentDesignation: "B",
      },
    ];

    const result = applyDefaultPlanetDesignations(planets, { systemLabel: "Zed" });

    expect(result.map((planet) => planet.name)).toEqual(["Zed I", "Zed PI", "Zed II", "Zed B I", "Zed B PI"]);
  });

  it("collapses interior parent groups to AB style labels", () => {
    const stars = [
      { systemDesignation: "Aa", systemDesignationCombined: "Aab", systemDesignationBase: "A" },
      { systemDesignation: "Ba", systemDesignationCombined: "Bab", systemDesignationBase: "B" },
      { systemDesignation: "C", systemDesignationCombined: "C", systemDesignationBase: "C" },
    ];
    const context = buildPlanetDesignationContext(stars);
    const secondaryOrbitContext = [
      { key: "secondary-1", orbitNumber: 6 },
      { key: "secondary-2", orbitNumber: 12 },
    ];

    const parentAt10 = resolvePlanetParentDesignation(
      { starKey: "primary", orbit: 10 },
      secondaryOrbitContext,
      context,
    );
    const parentAt20 = resolvePlanetParentDesignation(
      { starKey: "primary", orbit: 20 },
      secondaryOrbitContext,
      context,
    );

    expect(parentAt10.parentLabel).toBe("AB");
    expect(parentAt20.parentLabel).toBe("ABC");
  });

  it("omits parent letter for single-star systems", () => {
    const context = buildPlanetDesignationContext([{ systemDesignation: "A" }]);

    const parent = resolvePlanetParentDesignation({ starKey: "primary", orbit: 2 }, [], context);

    expect(parent.parentLabel).toBe("");
    expect(parent.parentKey).toBe("single:primary");
  });

  it("normalizes system label with fallback", () => {
    expect(normalizeSystemDesignationLabel(" Zed ", "0407")).toBe("Zed");
    expect(normalizeSystemDesignationLabel("", "0407")).toBe("0407");
  });
});
