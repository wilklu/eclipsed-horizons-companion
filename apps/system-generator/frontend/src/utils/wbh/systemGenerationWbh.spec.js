import { describe, expect, it } from "vitest";

import {
  SYSTEM_WBH_RULES,
  auToFractionalOrbit,
  calculateBaselineOrbitWbh,
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

  it("places cold-system baseline orbit past the HZCO for solar-type stars", () => {
    // baselineNumber < 1 means all worlds are exterior to the HZCO (cold outer zone).
    // For a G star (HZCO ≈ 3), the WBH formula is: HZCO - baseline + totalWorlds + (2D-2)/10.
    // With rollTotal=7 (median), baseline=-2, totalWorlds=5, hzco=3: 3-(-2)+5+0.5 = 10.5
    const solarBaseline = calculateBaselineOrbitWbh({
      rollTotal: 7,
      hzco: 3,
      baselineNumber: -2,
      totalWorlds: 5,
      minimumOrbit: 0.02,
    });
    expect(solarBaseline).toBeGreaterThan(3); // must be past the 1 AU habitable zone
  });

  it("uses compact formula for dim-star cold systems where HZCO is below orbit 1", () => {
    // For an M dwarf (HZCO ≈ 0.1), cold system uses the small minimumOrbit-anchored formula.
    const dimBaseline = calculateBaselineOrbitWbh({
      rollTotal: 7,
      hzco: 0.1,
      baselineNumber: -1,
      totalWorlds: 3,
      minimumOrbit: 0.01,
    });
    // Result should be a small orbit number close to minimumOrbit, not past orbit 1
    expect(dimBaseline).toBeLessThan(1);
    expect(dimBaseline).toBeGreaterThan(0);
  });

  it("places normal-range baseline orbit near the HZCO for G-type stars", () => {
    // baselineNumber in [1, totalWorlds] → baseline lands within ±0.5 of HZCO
    const normalBaseline = calculateBaselineOrbitWbh({
      rollTotal: 7,
      hzco: 3,
      baselineNumber: 3,
      totalWorlds: 5,
      minimumOrbit: 0.02,
    });
    expect(normalBaseline).toBeGreaterThanOrEqual(2.5);
    expect(normalBaseline).toBeLessThanOrEqual(3.5);
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

  it("uses a positive layout anchor for zero-luminosity non-stellar primaries", () => {
    const plan = determineWbhSystemBodyPlan({
      stars: [
        {
          designation: "BH",
          spectralClass: "Black Hole",
          luminosity: 0,
          massInSolarMasses: 12,
        },
      ],
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    expect(plan.planets.length).toBeGreaterThan(0);
    expect(plan.planets.every((planet) => planet.orbitNumber > 0)).toBe(true);
    expect(plan.planets.every((planet) => planet.zone === "cold")).toBe(true);
  });

  it("tolerates persisted stars with missing positive mass values", () => {
    const plan = determineWbhSystemBodyPlan({
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          luminosity: 1,
          massInSolarMasses: 0,
        },
      ],
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    expect(plan.planets.length).toBeGreaterThan(0);
    expect(plan.planets.every((planet) => Number.isFinite(planet.orbitalPeriodDays))).toBe(true);
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

  it("tracks deeper companion descendant chains in group hierarchy metrics", () => {
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
        orbitType: "Companion",
        orbitNumber: 0.8,
        eccentricity: 0.3,
        starKey: "star-2",
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
        orbitType: "Companion",
        orbitNumber: 0.5,
        eccentricity: 0.2,
        starKey: "star-3",
        parentStarKey: "star-2",
        hierarchyLevel: 3,
        continuationOf: "star-2",
      },
    ];

    const plan = determineWbhSystemBodyPlan({
      stars,
      rollDie: (sides) => Math.min(4, Number(sides) || 4),
    });

    const deepestGroup = [...plan.groups].sort((left, right) => right.branchDepth - left.branchDepth)[0];

    expect(deepestGroup.branchDepth).toBeGreaterThanOrEqual(2);
    expect(deepestGroup.nestedCompanionCount).toBeGreaterThanOrEqual(1);
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

  it("prefers native-sophont and resource-rich worlds when physical scores are close", () => {
    const selection = selectMainworldCandidateWbh([
      {
        name: "Prime Moon",
        type: "Gas Giant Moon",
        parentWorldType: "Gas Giant",
        size: 5,
        atmosphereCode: 6,
        hydrographics: 6,
        avgTempC: 18,
        orbitNumber: 3.1,
        hzco: 3.3,
        resourceRating: "Good",
        nativeSophontLife: true,
      },
      {
        name: "Prime World",
        type: "Terrestrial Planet",
        size: 6,
        atmosphereCode: 6,
        hydrographics: 6,
        avgTempC: 18,
        orbitNumber: 3.2,
        hzco: 3.3,
        resourceRating: "Sparse",
        nativeSophontLife: false,
      },
    ]);

    expect(selection.world.name).toBe("Prime Moon");
  });

  it("orders placement slots by WBH group sequence before local orbit numbers", () => {
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
        orbitNumber: 10.2,
        eccentricity: 0.25,
        starKey: "star-2",
        parentStarKey: "star-0",
      },
    ];

    const plan = determineWbhSystemBodyPlan({
      stars,
      rollDie: createSequenceRoller([3, 4, 3, 4, 4, 4, 5, 5, 3, 4, 4, 4, 4, 3, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4]),
    });

    const firstSecondaryIndex = plan.slots.findIndex((slot) => slot.groupKey !== "primary");
    const lastPrimaryIndex = plan.slots.reduce(
      (lastIndex, slot, index) => (slot.groupKey === "primary" ? index : lastIndex),
      -1,
    );

    expect(firstSecondaryIndex).toBeGreaterThan(-1);
    expect(lastPrimaryIndex).toBeGreaterThan(-1);
    expect(firstSecondaryIndex).toBeGreaterThan(lastPrimaryIndex);
  });
});
