import { describe, expect, it } from "vitest";

import {
  SYSTEM_WBH_RULES,
  calculateWbhTotalWorlds,
  generateStarSystemWbh,
  getWbhBodyTypes,
} from "./systemGenerationWbh.js";

describe("systemGenerationWbh", () => {
  it("tracks system-generation checkpoints from chapter 4", () => {
    expect(SYSTEM_WBH_RULES.length).toBeGreaterThan(0);
    expect(SYSTEM_WBH_RULES.some((rule) => rule.id === "world-types-and-quantities")).toBe(true);
  });

  it("uses handbook body classifications", () => {
    expect(getWbhBodyTypes()).toEqual(["Gas Giant", "Planetoid Belt", "Terrestrial Planet"]);
  });

  it("computes total worlds from handbook body counts", () => {
    expect(calculateWbhTotalWorlds({ gasGiants: 2, planetoidBelts: 1, terrestrialPlanets: 5 })).toBe(8);
  });

  it("returns a planning scaffold for future WBH system generation", () => {
    const system = generateStarSystemWbh({ name: "Zed" });

    expect(system.name).toBe("Zed");
    expect(system.generatorModel).toBe("wbh-scaffold");
    expect(system.wbhStatus).toBe("planning-only");
  });
});
