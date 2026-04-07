import { describe, expect, it } from "vitest";

import { applySystemWorldSocialProfiles, generateWorldProfile } from "./worldProfileGenerator.js";

describe("worldProfileGenerator", () => {
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
});
