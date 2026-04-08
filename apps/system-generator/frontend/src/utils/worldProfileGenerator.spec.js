import { describe, expect, it } from "vitest";

import { SOCIAL_WBH_RULES, applySystemWorldSocialProfiles, generateWorldProfile } from "./worldProfileGenerator.js";

describe("worldProfileGenerator", () => {
  it("tracks provisional WBH social coverage", () => {
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "core-uwp-rolls")).toBe(true);
  });

  it("generates non-zero WBH-style social data for standalone worlds", () => {
    const world = generateWorldProfile({ worldName: "Zed Prime", starClass: "G", orbitNumber: 3.1, hzco: 3.3 });

    expect(world.uwp).toMatch(/^[A-EX][0-9A-F]{6}-[0-9A-F]$/);
    expect(typeof world.populationCode).toBe("number");
    expect(typeof world.techLevel).toBe("number");
    expect(world.economics?.importance).toBeDefined();
    expect(Array.isArray(world.remarks)).toBe(true);
  });

  it("assigns a mainworld and colony overlays across a system roster", () => {
    const worlds = applySystemWorldSocialProfiles([
      { name: "Inner", size: 4, atmosphereCode: 2, hydrographics: 0, avgTempC: 80, orbitNumber: 1.5, hzco: 3 },
      { name: "Prime", size: 6, atmosphereCode: 6, hydrographics: 7, avgTempC: 18, orbitNumber: 3.1, hzco: 3 },
      { name: "Outer", size: 5, atmosphereCode: 5, hydrographics: 3, avgTempC: -5, orbitNumber: 4.8, hzco: 3 },
    ]);

    expect(worlds.filter((world) => world.isMainworld).length).toBe(1);
    expect(worlds.some((world) => world.populationCode > 0)).toBe(true);
  });

  it("allows significant moons to become the system mainworld", () => {
    const worlds = applySystemWorldSocialProfiles([
      {
        name: "Giant Alpha",
        type: "Gas Giant",
        size: 14,
        atmosphereCode: 15,
        hydrographics: 0,
        avgTempC: 18,
        orbitNumber: 3.2,
        hzco: 3.1,
        moonsData: [
          {
            name: "Giant Alpha b",
            type: "significant",
            size: 6,
            orbitalSlot: 2,
            ring: false,
            worldProfile: {
              size: 6,
              atmosphereCode: 6,
              hydrographics: 7,
              avgTempC: 20,
            },
          },
        ],
      },
      {
        name: "Inner Rock",
        type: "Terrestrial Planet",
        size: 3,
        atmosphereCode: 1,
        hydrographics: 0,
        avgTempC: 90,
        orbitNumber: 1.1,
        hzco: 3.1,
      },
    ]);

    const mainworld = worlds.find((world) => world.isMainworld);

    expect(mainworld?.isMoon).toBe(true);
    expect(mainworld?.parentWorldName).toBe("Giant Alpha");
    expect(mainworld?.habitability).toBeDefined();
    expect(mainworld?.resourceRating).toBeDefined();
    expect(mainworld?.economics?.importance).toBeDefined();
    expect(mainworld?.remarks).toContain("Moon");
  });

  it("removes environmental TL penalties for native-sophont worlds", () => {
    const originalRandom = Math.random;
    const sequence = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.34, 0.34, 0.5];
    const useSequence = () => {
      let index = 0;
      Math.random = () => sequence[Math.min(index++, sequence.length - 1)];
    };

    try {
      useSequence();
      const [nonNativeWorld] = applySystemWorldSocialProfiles([
        {
          name: "Harsh Colony",
          size: 1,
          atmosphereCode: 0,
          hydrographics: 0,
          avgTempC: -40,
          orbitNumber: 2.8,
          hzco: 3.3,
          nativeSophontLife: false,
        },
      ]);
      useSequence();
      const [nativeWorld] = applySystemWorldSocialProfiles([
        {
          name: "Native Harsh World",
          size: 1,
          atmosphereCode: 0,
          hydrographics: 0,
          avgTempC: -40,
          orbitNumber: 2.8,
          hzco: 3.3,
          nativeSophontLife: true,
        },
      ]);

      expect(nonNativeWorld.techLevel).toBeGreaterThan(nativeWorld.techLevel);
    } finally {
      Math.random = originalRandom;
    }
  });
});
