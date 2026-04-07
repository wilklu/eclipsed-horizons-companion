import { describe, expect, it } from "vitest";

import { createSequenceRoller } from "./dice.js";
import {
  WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  buildWbhSizeProfile,
  calculateEscapeVelocity,
  calculateOrbitalVelocityAtHeight,
  calculateSurfaceOrbitalVelocity,
  calculateWorldGravity,
  calculateWorldMass,
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
});
