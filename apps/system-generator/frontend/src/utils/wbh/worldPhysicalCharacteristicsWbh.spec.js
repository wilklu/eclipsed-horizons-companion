import { describe, expect, it } from "vitest";

import { createSequenceRoller } from "./dice.js";
import {
  WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  buildNativeLifeProfile,
  buildWbhSeismologyProfile,
  buildWbhSizeProfile,
  calculateEscapeVelocity,
  calculateOrbitalVelocityAtHeight,
  calculateResidualSeismicStress,
  calculateSeismicAdjustedTemperatureK,
  calculateSurfaceOrbitalVelocity,
  calculateTidalHeatingFactor,
  calculateTidalStressFactor,
  calculateTotalSeismicStress,
  calculateWorldGravity,
  calculateWorldMass,
  determineMajorTectonicPlates,
  determineHabitabilityRating,
  determineGasGiantProfile,
  determineResourceRating,
  determineSignificantMoonQuantity,
  determineSignificantMoonSizes,
  determineTerrestrialComposition,
  determineTerrestrialDensity,
  determineWorldDiameter,
  expandWbhSizeBeyondA,
  generateWorldPhysicalCharacteristicsWbh,
  getWbhWorldSizeEntry,
  isBeltLikeSizeZeroWorld,
} from "./worldPhysicalCharacteristicsWbh.js";

describe("worldPhysicalCharacteristicsWbh", () => {
  it("tracks world-physical-characteristic checkpoints", () => {
    expect(WORLD_PHYSICAL_CHARACTERISTIC_RULES.length).toBeGreaterThan(0);
    expect(WORLD_PHYSICAL_CHARACTERISTIC_RULES.some((rule) => rule.id === "world-size")).toBe(true);
  });

  it("expands size A upward using handbook reroll rules", () => {
    const rollDie = createSequenceRoller([4, 4, 3]);
    expect(expandWbhSizeBeyondA({ baseSize: 10, rollDie })).toBe(12);
  });

  it("leaves non-A sizes unchanged", () => {
    expect(expandWbhSizeBeyondA({ baseSize: 8, rollDie: createSequenceRoller([6]) })).toBe(8);
  });

  it("detects size-zero belt worlds", () => {
    expect(isBeltLikeSizeZeroWorld({ size: 0, worldType: "Planetoid Belt" })).toBe(true);
    expect(isBeltLikeSizeZeroWorld({ size: 0, worldType: "Artificial Habitat" })).toBe(false);
  });

  it("resolves size table and diameter rolls", () => {
    expect(getWbhWorldSizeEntry("5").averageDiameterKm).toBe(8000);
    const rollDie = createSequenceRoller([2, 4]);
    expect(determineWorldDiameter({ sizeCode: "5", rollDie, detailDie: 63 })).toBe(8163);
  });

  it("derives composition, density, gravity, mass, and velocities", () => {
    const composition = determineTerrestrialComposition({
      sizeCode: "5",
      orbitNumber: 3.1,
      hzco: 3.3,
      systemAgeGyr: 5,
      rollTotal: 10,
    });
    const density = determineTerrestrialDensity({ composition, rollTotal: 9 });
    const gravity = calculateWorldGravity({ density, diameterKm: 8163 });
    const mass = calculateWorldMass({ density, diameterKm: 8163 });
    const escapeVelocity = calculateEscapeVelocity({ mass, diameterKm: 8163 });

    expect(composition).toBe("Rock and Metal");
    expect(density).toBeCloseTo(1.03, 2);
    expect(gravity).toBeCloseTo(0.66, 2);
    expect(mass).toBeCloseTo(0.27, 2);
    expect(escapeVelocity).toBeCloseTo(7273, -1);
    expect(calculateSurfaceOrbitalVelocity({ escapeVelocityMps: escapeVelocity })).toBeCloseTo(5143, -1);
    expect(calculateOrbitalVelocityAtHeight({ mass, diameterKm: 8163, heightKm: 500 })).toBeGreaterThan(4700);
    expect(buildWbhSizeProfile({ sizeCode: "5", diameterKm: 8163, density, gravity, mass })).toBe(
      "5-8163-1.03-0.66-0.27",
    );
  });

  it("generates WBH world physical characteristics", () => {
    const rollDie = createSequenceRoller([2, 4, 5, 2, 4, 5]);
    const world = generateWorldPhysicalCharacteristicsWbh({
      worldName: "Aab IV d",
      sizeCode: "5",
      orbitNumber: 3.1,
      hzco: 3.3,
      systemAgeGyr: 5,
      detailDie: 63,
      rollDie,
    });

    expect(world.generatorModel).toBe("wbh-world-physics");
    expect(world.wbhStatus).toBe("implemented-world-environment-and-physics");
    expect(world.sizeProfile).toBe("5-8163-1.03-0.66-0.27");
  });

  it("determines WBH gas giant size class, diameter, and mass", () => {
    const rollDie = createSequenceRoller([5, 4, 4, 4, 2, 2, 4]);
    const profile = determineGasGiantProfile({ rollDie });

    expect(profile.sizeClass).toBe("GL");
    expect(profile.diameterTerran).toBe(14);
    expect(profile.gasGiantCode).toBe("GLE");
    expect(profile.massEarth).toBe(1200);
  });

  it("uses WBH moon quantity tables for gas giants and terrestrial worlds", () => {
    const terrestrialRollDie = createSequenceRoller([6, 5]);
    const terrestrial = determineSignificantMoonQuantity({
      sizeCode: "A",
      orbitNumber: 4.1,
      rollDie: terrestrialRollDie,
    });

    const gasGiantRollDie = createSequenceRoller([3, 4, 2, 4]);
    const gasGiant = determineSignificantMoonQuantity({
      isGasGiant: true,
      gasGiantSizeClass: "GL",
      orbitNumber: 3.5,
      rollDie: gasGiantRollDie,
    });

    expect(terrestrial.quantity).toBe(5);
    expect(terrestrial.hasRingOnly).toBe(false);
    expect(gasGiant.quantity).toBe(7);
    expect(gasGiant.hasRingOnly).toBe(false);
  });

  it("sizes significant moons with rings and larger outcomes", () => {
    const rollDie = createSequenceRoller([4, 1, 5, 5, 6, 2]);
    const moonSizes = determineSignificantMoonSizes({
      sizeCode: "A",
      moonCount: 3,
      rollDie,
    });

    expect(moonSizes).toEqual(["R", 2, 7]);
  });

  it("generates gas giant worlds with WBH moon data", () => {
    const rollDie = createSequenceRoller([5, 4, 4, 2, 4, 3, 4, 2, 4, 4, 1, 5, 1]);
    const world = generateWorldPhysicalCharacteristicsWbh({
      worldName: "Aab IV",
      isGasGiant: true,
      orbitNumber: 3.1,
      rollDie,
    });

    expect(world.gasGiantCode).toBe("GLE");
    expect(world.sizeProfile).toBe("GLE");
    expect(world.moonsData.some((moon) => moon.type === "significant")).toBe(true);
  });

  it("derives Chapter 5 life, habitability, and resource summary helpers", () => {
    expect(
      buildNativeLifeProfile({
        nativeSophontLife: true,
        atmosphereCode: 6,
        hydrographics: 7,
        avgTempC: 20,
      }),
    ).toBe("2333");

    expect(determineHabitabilityRating({ candidateScore: 12 })).toBe("Excellent");
    expect(determineHabitabilityRating({ candidateScore: 8 })).toBe("Good");
    expect(determineHabitabilityRating({ candidateScore: 4 })).toBe("Marginal");
    expect(determineHabitabilityRating({ candidateScore: 1 })).toBe("Poor");
    expect(determineHabitabilityRating({ size: 1, atmosphereCode: 0, hydrographics: 0, avgTempC: 160 })).toBe(
      "Hostile",
    );

    expect(determineResourceRating({ type: "Planetoid Belt", size: 0, atmosphereCode: 0, hydrographics: 0 })).toBe(
      "Good",
    );
    expect(determineResourceRating({ type: "Gas Giant", size: 14, atmosphereCode: 15, hydrographics: 0 })).toBe(
      "Abundant",
    );
  });

  it("calculates Chapter 5 seismology helpers and tectonic plates", () => {
    expect(calculateResidualSeismicStress({ size: 8, systemAgeGyr: 4.568, majorMoonCount: 1, density: 1 })).toBe(16);
    expect(calculateTidalStressFactor({ totalTidalEffect: 30.6 })).toBe(3);
    expect(
      calculateTidalHeatingFactor({
        primaryMassEarth: 318,
        worldSize: 5,
        eccentricity: 0.05,
        distanceMillionKm: 0.67,
        periodDays: 3.5,
        worldMassEarth: 0.27,
      }),
    ).toBeGreaterThan(1);
    expect(
      calculateTotalSeismicStress({ residualSeismicStress: 16, tidalStressFactor: 3, tidalHeatingFactor: 4 }),
    ).toBe(23);
    expect(calculateSeismicAdjustedTemperatureK({ temperatureK: 300, totalSeismicStress: 17 })).toBeCloseTo(300.001, 3);
    expect(determineMajorTectonicPlates({ size: 5, hydrographics: 6, totalSeismicStress: 17, rollTotal: 7 })).toBe(5);

    const profile = buildWbhSeismologyProfile({
      size: 5,
      systemAgeGyr: 6.3,
      isMoon: true,
      density: 1.03,
      totalTidalEffect: 30.6,
      primaryMassEarth: 318,
      eccentricity: 0.05,
      distanceMillionKm: 0.67,
      periodDays: 3.5,
      worldMassEarth: 0.27,
      hydrographics: 6,
      avgTempC: 27,
      tectonicRollTotal: 7,
    });

    expect(profile.residualSeismicStress).toBe(0);
    expect(profile.tidalStressFactor).toBe(3);
    expect(profile.totalSeismicStress).toBeGreaterThan(3);
    expect(profile.majorTectonicPlates).toBeGreaterThan(0);
  });
});
