import { describe, expect, it } from "vitest";

import { generateObjectName } from "./nameGenerator.js";
import { generateAutomaticWorldName } from "./worldProfileGenerator.js";

describe("hierarchical name generator", () => {
  it("produces deterministic sector names for the same lineage seed in clustered mode", () => {
    const first = generateObjectName({
      mode: "clustered",
      objectType: "sector",
      lineageSeed: "gal-1:sector:2,3",
      seed: "gal-1:sector:2,3",
    });
    const second = generateObjectName({
      mode: "clustered",
      objectType: "sector",
      lineageSeed: "gal-1:sector:2,3",
      seed: "gal-1:sector:2,3",
    });

    expect(first).toBe(second);
    expect(first).toMatch(/[A-Za-z]/);
  });

  it("keeps system and planet names in the same naming family without duplicating them", () => {
    const systemName = generateObjectName({
      mode: "clustered",
      objectType: "system",
      lineageSeed: "frontier-family:aquila",
      seed: "frontier-family:aquila:system:0101",
    });
    const planetName = generateAutomaticWorldName({
      mode: "clustered",
      systemName,
      seed: "frontier-family:aquila:planet:0101:1",
      usedNames: new Set([systemName]),
    });

    const systemStem = String(systemName)
      .replace(/\s+(?:reach|march|expanse|drift|basin|gate|sector|system)$/i, "")
      .slice(0, 4)
      .toLowerCase();
    const planetStem = String(planetName)
      .replace(/\s+(?:prime|secundus|tertius|quartus)$/i, "")
      .slice(0, 4)
      .toLowerCase();

    expect(planetName).not.toBe(systemName);
    expect(planetStem).toBe(systemStem);
  });
});
