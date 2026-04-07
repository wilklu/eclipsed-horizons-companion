import { describe, expect, it } from "vitest";

import {
  SYSTEM_WBH_RULES,
  auToFractionalOrbit,
  calculateEffectiveHzcoDeviation,
  calculateGasGiantPresence,
  calculateHabitableZoneCenterAu,
  calculateHabitableZoneCenterOrbit,
  calculatePlanetaryOrbitalPeriod,
  calculateWbhTotalWorlds,
  fractionalOrbitToAu,
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

  it("converts between Orbit# and AU", () => {
    expect(fractionalOrbitToAu(4.3)).toBeCloseTo(1.96, 2);
    expect(auToFractionalOrbit(3.4)).toBeCloseTo(5.25, 2);
  });

  it("computes habitable zone center helpers", () => {
    expect(calculateHabitableZoneCenterAu(1)).toBeCloseTo(1, 5);
    expect(calculateHabitableZoneCenterOrbit(1)).toBeCloseTo(3, 5);
    expect(calculateEffectiveHzcoDeviation({ orbitNumber: 0.52, hzco: 0.4 })).toBeCloseTo(0.3, 2);
  });

  it("computes orbital period and gas giant presence", () => {
    const period = calculatePlanetaryOrbitalPeriod({ orbitNumber: 0.52, stellarMasses: [0.626] });
    expect(period.days).toBeCloseTo(43.8, 1);
    expect(calculateGasGiantPresence({ method: "2d", rollTotal: 9 })).toBe(true);
    expect(calculateGasGiantPresence({ method: "1d", dieRoll: 1 })).toBe(false);
  });

  it("returns a system scaffold with HZCO populated", () => {
    const system = generateStarSystemWbh({ name: "Zed", luminosity: 1.419 });

    expect(system.name).toBe("Zed");
    expect(system.generatorModel).toBe("wbh-system-core");
    expect(system.wbhStatus).toBe("implemented-orbit-hzco-helpers");
    expect(system.habitableZoneCenterOrbit).toBeGreaterThan(3);
  });
});
