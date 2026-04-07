import { describe, expect, it } from "vitest";

import {
  STAR_WBH_RULES,
  calculateGiantLifespan,
  calculateMainSequenceLifespan,
  calculateSubgiantLifespan,
  calculateWbhLuminosity,
  generatePrimaryStarWbh,
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
  });

  it("returns a usable scaffold result while generation is incomplete", () => {
    const star = generatePrimaryStarWbh({ spectralType: "G", decimal: 2, luminosityClass: "V" });

    expect(star.generatorModel).toBe("wbh-scaffold");
    expect(star.wbhStatus).toBe("fallback-heuristic");
    expect(star.designation.startsWith("G2")).toBe(true);
  });
});
