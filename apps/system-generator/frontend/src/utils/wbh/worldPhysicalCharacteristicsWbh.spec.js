import { describe, expect, it } from "vitest";

import { createSequenceRoller } from "./dice.js";
import {
  WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  expandWbhSizeBeyondA,
  generateWorldPhysicalCharacteristicsWbh,
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

  it("returns a usable scaffold result while WBH world generation is incomplete", () => {
    const world = generateWorldPhysicalCharacteristicsWbh({ worldName: "Aab IV d" });

    expect(world.generatorModel).toBe("wbh-scaffold");
    expect(world.wbhStatus).toBe("fallback-heuristic");
  });
});
