import { describe, expect, it } from "vitest";

import { createSequenceRoller } from "./dice.js";
import {
  STAR_WBH_RULES,
  calculateGiantLifespan,
  calculateLargeStarAge,
  calculateMainSequenceLifespan,
  calculateStarFinalAge,
  calculateSubgiantLifespan,
  calculateWbhLuminosity,
  generateMultipleStarSystemWbh,
  generatePrimaryStarWbh,
  getWbhStarDiameter,
  getWbhStarMassAndTemperature,
  resolvePrimaryStarType,
  resolveStarSubtype,
} from "./starGenerationWbh.js";

describe("starGenerationWbh", () => {
  it("tracks handbook coverage checkpoints", () => {
    expect(STAR_WBH_RULES.length).toBeGreaterThan(0);
    expect(STAR_WBH_RULES.some((rule) => rule.id === "primary-star-types")).toBe(true);
  });

  it("calculates handbook luminosity from diameter and temperature", () => {
    expect(calculateWbhLuminosity({ diameter: 1, temperature: 5772 })).toBeCloseTo(1, 5);
  });

  it("calculates handbook life spans", () => {
    expect(calculateMainSequenceLifespan(1)).toBeCloseTo(10, 5);
    expect(calculateSubgiantLifespan({ mainSequenceLifespan: 10, mass: 1 })).toBeCloseTo(2, 5);
    expect(calculateGiantLifespan({ mainSequenceLifespan: 10, mass: 1 })).toBeCloseTo(1, 5);
    expect(calculateLargeStarAge({ mainSequenceLifespan: 10, percentileRoll: 40 })).toBeCloseTo(4, 5);
    expect(calculateStarFinalAge(1)).toBeGreaterThan(10);
  });

  it("resolves a primary star from WBH tables", () => {
    const rollDie = createSequenceRoller([1, 5]);
    const starType = resolvePrimaryStarType({ rollDie });

    expect(starType.kind).toBe("stellar");
    expect(starType.spectralType).toBe("M");
    expect(starType.luminosityClass).toBe("V");
  });

  it("resolves subtype and interpolated star values", () => {
    const rollDie = createSequenceRoller([1, 2]);
    expect(resolveStarSubtype({ spectralType: "M", isPrimary: true, rollDie })).toBe(6);

    const { mass, temperature } = getWbhStarMassAndTemperature({ spectralType: "G", luminosityClass: "V", subtype: 7 });
    expect(mass).toBeCloseTo(0.86, 2);
    expect(temperature).toBeCloseTo(5440, 0);
    expect(getWbhStarDiameter({ spectralType: "G", luminosityClass: "V", subtype: 7 })).toBeCloseTo(0.93, 2);
  });

  it("generates a WBH-backed primary star", () => {
    const rollDie = createSequenceRoller([1, 5, 1, 2, 5, 5, 6, 6, 5, 4]);
    const star = generatePrimaryStarWbh({ rollDie });

    expect(star.generatorModel).toBe("wbh-primary-star");
    expect(star.wbhStatus).toBe("implemented-core-tables");
    expect(star.baseSpectralType).toBe("M");
    expect(star.luminosityClass).toBe("V");
    expect(typeof star.mass).toBe("number");
    expect(typeof star.temperatureK).toBe("number");
  });

  it("generates multiple-star systems from the WBH presence table", () => {
    const rollDie = createSequenceRoller([6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    const stars = generateMultipleStarSystemWbh({ spectralType: "G", rollDie, maxStars: 3 });

    expect(stars.length).toBeGreaterThanOrEqual(1);
    expect(stars[0].designation).toContain("G");
    expect(stars.every((star) => star.orbitType === null || typeof star.orbitType === "string")).toBe(true);
  });

  it("can assign companion stars to non-primary parents", () => {
    const rollDie = (sides) => sides;
    const stars = generateMultipleStarSystemWbh({ spectralType: "G", rollDie, maxStars: 5 });
    const companion = stars.find((star) => star.orbitType === "Companion" && star.parentStarKey !== stars[0].starKey);

    expect(companion).toBeTruthy();
    expect(companion?.continuationOf).toBe(companion?.parentStarKey);
    expect(companion?.hierarchyLevel).toBe(2);
  });
});
