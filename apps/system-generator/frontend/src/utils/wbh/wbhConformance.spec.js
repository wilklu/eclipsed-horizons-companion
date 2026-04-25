import { describe, expect, it } from "vitest";

import { calculateSystemHabitableZone } from "../systemWorldGeneration.js";
import { buildWbhEnvironmentalProfile } from "./worldPhysicalCharacteristicsWbh.js";

describe("wbhConformance", () => {
  it("models a temperate habitable candidate with stable liquid water", () => {
    const world = buildWbhEnvironmentalProfile({
      sizeCode: "5",
      orbitNumber: 3.1,
      hzco: 3.3,
      systemAgeGyr: 5,
      atmosphereRoll: 8,
      hydrographicsRoll: 7,
      atmospherePressureRoll: 50,
      oxygenPrimaryRoll: 5,
      oxygen2dRoll: 5,
      hydrographicsCoverageRoll: 5,
      surfaceDistributionRoll: 5,
      surfaceWorldRoll: 4,
      detailDie: 63,
      rollDie: () => 4,
      stellarMasses: [1],
    });

    expect(world.atmosphereCode).toBe(6);
    expect(world.tempCategory).toBe("Temperate");
    expect(world.runawayGreenhouse).toBe(false);
    expect(world.hydrosphereLiquid).toBe("Liquid Water");
    expect(world.hydrographicsPercent).toBeGreaterThanOrEqual(56);
    expect(world.surfaceDistribution).toBe("Mixed");
  });

  it("models runaway-greenhouse dehydration for hot inner worlds", () => {
    const world = buildWbhEnvironmentalProfile({
      sizeCode: "5",
      orbitNumber: 2.8,
      hzco: 3.3,
      systemAgeGyr: 6,
      atmosphereRoll: 8,
      hydrographicsRoll: 7,
      temperatureRawRoll: 10,
      greenhouseCheckRoll: 7,
      greenhouseAtmosphereRoll: 4,
      hydrographicsCoverageRoll: 4,
      surfaceDistributionRoll: 4,
      surfaceWorldRoll: 4,
      detailDie: 63,
      rollDie: () => 4,
      stellarMasses: [1],
    });

    expect(world.runawayGreenhouse).toBe(true);
    expect(world.greenhouseAtmosphereCode).toBe(11);
    expect(world.temperatureAdjustedRoll).toBeGreaterThanOrEqual(12);
    expect(world.hydrographics).toBe(0);
    expect(world.hydrosphereLiquid).toBe("None");
  });

  it("uses a layout anchor instead of a radiative habitable zone for non-radiant primaries", () => {
    const habitableZone = calculateSystemHabitableZone([
      {
        designation: "BH",
        spectralClass: "Black Hole",
        massInSolarMasses: 12,
        luminosity: 0,
      },
    ]);

    expect(habitableZone.hasRadiantHabitableZone).toBe(false);
    expect(habitableZone.centerOrbit).toBeGreaterThan(0);
    expect(habitableZone.centerAU).toBeGreaterThan(0);
    expect(habitableZone.outerAU).toBeGreaterThan(habitableZone.innerAU);
  });
});
