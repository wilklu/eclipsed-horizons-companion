import { describe, expect, it } from "vitest";

import {
  SYSTEM_WBH_RULES,
  auToFractionalOrbit,
  calculateHabitableCandidateWindowWbh,
  calculateBaselineNumberWbh,
  calculateEffectiveHzcoDeviation,
  calculateGasGiantPresence,
  calculateHabitableZoneCenterAu,
  calculateHabitableZoneCenterOrbit,
  calculateMinimumAllowableOrbitWbh,
  calculatePlanetaryOrbitalPeriod,
  calculateWbhTotalWorlds,
  determineWbhSystemBodyPlan,
  fractionalOrbitToAu,
  generateStarSystemWbh,
  getWbhBodyTypes,
  selectMainworldCandidateWbh,
} from "./systemGenerationWbh.js";
import { createSequenceRoller } from "./dice.js";

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
    expect(system.wbhStatus).toBe("implemented-orbit-placement-helpers");
    expect(system.habitableZoneCenterOrbit).toBeGreaterThan(3);
  });

  it("derives handbook MAO and baseline numbers", () => {
    expect(calculateMinimumAllowableOrbitWbh({ diameter: 0.967 })).toBeGreaterThan(0.01);
    expect(
      calculateBaselineNumberWbh({ rollTotal: 9, luminosityClass: "V", totalWorlds: 17, secondaryStarCount: 2 }),
    ).toBe(7);
  });

  it("builds a WBH system body plan with orbit placements", () => {
    const rollDie = createSequenceRoller([3, 4, 3, 4, 4, 4, 5, 5, 3, 4, 4, 4, 4, 3, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4]);
    const plan = determineWbhSystemBodyPlan({
      stars: [
        { designation: "G2V", luminosityClass: "V", diameter: 1, luminosity: 1, massInSolarMasses: 1 },
        {
          designation: "K7V",
          luminosityClass: "V",
          diameter: 0.8,
          luminosity: 0.3,
          massInSolarMasses: 0.7,
          orbitType: "Near",
          orbitNumber: 6.1,
          eccentricity: 0.1,
        },
      ],
      rollDie,
    });

    expect(plan.counts.totalWorlds).toBeGreaterThan(0);
    expect(plan.planets.length).toBeGreaterThan(0);
    expect(plan.planets.every((planet) => planet.orbitNumber >= 0)).toBe(true);
  });

  it("propagates companion floors and sibling exclusions into orbit groups", () => {
    const stars = [
      {
        designation: "G2V",
        luminosityClass: "V",
        diameter: 1,
        luminosity: 1,
        massInSolarMasses: 1,
        starKey: "star-0",
      },
      {
        designation: "M3V",
        luminosityClass: "V",
        diameter: 0.4,
        luminosity: 0.05,
        massInSolarMasses: 0.3,
        orbitType: "Companion",
        orbitNumber: 0.8,
        eccentricity: 0.3,
        parentStarKey: "star-0",
      },
      {
        designation: "K7V",
        luminosityClass: "V",
        diameter: 0.8,
        luminosity: 0.3,
        massInSolarMasses: 0.7,
        orbitType: "Near",
        orbitNumber: 6.1,
        eccentricity: 0.1,
        starKey: "star-1",
        parentStarKey: "star-0",
      },
      {
        designation: "M1V",
        luminosityClass: "V",
        diameter: 0.5,
        luminosity: 0.09,
        massInSolarMasses: 0.4,
        orbitType: "Far",
        orbitNumber: 10.2,
        eccentricity: 0.25,
        starKey: "star-2",
        parentStarKey: "star-0",
      },
    ];

    const plan = determineWbhSystemBodyPlan({
      stars,
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    const primaryGroup = plan.groups.find((group) => group.key === "primary");
    const nearGroup = plan.groups.find((group) => group.orbitType === "Near");

    expect(primaryGroup.minimumOrbit).toBeGreaterThan(calculateMinimumAllowableOrbitWbh(stars[0]));
    expect(nearGroup.exclusionRanges.length).toBeGreaterThan(0);
  });

  it("widens primary exclusions for split-continuation secondary groups", () => {
    const stars = [
      {
        designation: "G2V",
        luminosityClass: "V",
        diameter: 1,
        luminosity: 1,
        massInSolarMasses: 1,
        starKey: "star-0",
      },
      {
        designation: "K7V",
        luminosityClass: "V",
        diameter: 0.8,
        luminosity: 0.3,
        massInSolarMasses: 0.7,
        orbitType: "Near",
        orbitNumber: 6.1,
        eccentricity: 0.1,
        starKey: "star-1",
        parentStarKey: "star-0",
        hierarchyLevel: 1,
      },
      {
        designation: "M3V",
        luminosityClass: "V",
        diameter: 0.4,
        luminosity: 0.05,
        massInSolarMasses: 0.3,
        orbitType: "Companion",
        orbitNumber: 0.8,
        eccentricity: 0.3,
        parentStarKey: "star-1",
        hierarchyLevel: 2,
        continuationOf: "star-1",
      },
      {
        designation: "M1V",
        luminosityClass: "V",
        diameter: 0.5,
        luminosity: 0.09,
        massInSolarMasses: 0.4,
        orbitType: "Far",
        orbitNumber: 10.2,
        eccentricity: 0.1,
        starKey: "star-2",
        parentStarKey: "star-0",
      },
    ];

    const plan = determineWbhSystemBodyPlan({
      stars,
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    const primaryGroup = plan.groups.find((group) => group.key === "primary");
    const nearGroup = plan.groups.find((group) => group.hostStarKey === "star-1");
    const nearRange = primaryGroup.exclusionRanges.find((range) => range.start < 6.1 && range.end > 6.1);

    expect(nearGroup.hierarchyLevel).toBe(2);
    expect(nearGroup.continuationOf).toBe("star-1");
    expect(nearGroup.branchDepth).toBeGreaterThan(1);
    expect(nearGroup.nestedCompanionCount).toBe(1);
    expect(nearRange.start).toBeLessThan(4.2);
    expect(nearRange.end).toBeGreaterThan(8);
    expect(nearGroup.exclusionRanges.length).toBeGreaterThan(0);
  });

  it("widens ancestor exclusions for deeper non-companion descendant branches", () => {
    const stars = [
      {
        designation: "G2V",
        luminosityClass: "V",
        diameter: 1,
        luminosity: 1,
        massInSolarMasses: 1,
        starKey: "star-0",
      },
      {
        designation: "K7V",
        luminosityClass: "V",
        diameter: 0.8,
        luminosity: 0.3,
        massInSolarMasses: 0.7,
        orbitType: "Near",
        orbitNumber: 6.1,
        eccentricity: 0.1,
        starKey: "star-1",
        parentStarKey: "star-0",
      },
      {
        designation: "M3V",
        luminosityClass: "V",
        diameter: 0.4,
        luminosity: 0.05,
        massInSolarMasses: 0.3,
        orbitType: "Far",
        orbitNumber: 4.4,
        eccentricity: 0.2,
        starKey: "star-2",
        parentStarKey: "star-1",
      },
      {
        designation: "M1V",
        luminosityClass: "V",
        diameter: 0.5,
        luminosity: 0.09,
        massInSolarMasses: 0.4,
        orbitType: "Far",
        orbitNumber: 10.2,
        eccentricity: 0.1,
        starKey: "star-3",
        parentStarKey: "star-0",
      },
    ];

    const plan = determineWbhSystemBodyPlan({
      stars,
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    const primaryGroup = plan.groups.find((group) => group.key === "primary");
    const nearGroup = plan.groups.find((group) => group.hostStarKey === "star-1");
    const primaryRange = primaryGroup.exclusionRanges.find((range) => range.start < 6.1 && range.end > 6.1);

    expect(nearGroup.branchDepth).toBeGreaterThan(1);
    expect(nearGroup.descendantGroupCount).toBe(1);
    expect(primaryRange.start).toBeLessThan(4.6);
    expect(primaryRange.end).toBeGreaterThan(7.6);
  });

  it("selects mainworld candidates from the habitable band before outer fallback worlds", () => {
    const worlds = [
      {
        name: "Outer Rock",
        type: "Terrestrial Planet",
        size: 8,
        atmosphereCode: 10,
        hydrographics: 0,
        avgTempC: -90,
        orbitNumber: 6.4,
        hzco: 3.3,
      },
      {
        name: "Prime Moon",
        type: "Gas Giant Moon",
        size: 5,
        atmosphereCode: 6,
        hydrographics: 6,
        avgTempC: 18,
        orbitNumber: 3.1,
        hzco: 3.3,
      },
    ];

    const selection = selectMainworldCandidateWbh(worlds, { hzcoResolver: (world) => world?.hzco });

    expect(calculateHabitableCandidateWindowWbh(0.92)).toEqual({ inner: 0.82, outer: 1.2 });
    expect(selection.index).toBe(1);
    expect(selection.world.name).toBe("Prime Moon");
    expect(selection.withinHabitableBand).toBe(true);
  });
});
