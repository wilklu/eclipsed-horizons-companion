import { afterEach, describe, expect, it, vi } from "vitest";

import { buildPersistedSurveySystemFromHex } from "./stellarSurveySystemGenerator.js";

function withDeterministicRandom(callback) {
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
  try {
    return callback();
  } finally {
    randomSpy.mockRestore();
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("stellarSurveySystemGenerator", () => {
  it("builds persisted survey systems with propagated mainworld summary fields", () => {
    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0101",
          starType: "G2V",
        },
        namingOptions: {
          worldNameMode: "list",
          asteroidBeltNameMode: "phonotactic",
          galaxyMythicTheme: "all",
        },
      }),
    );

    expect(system.systemId).toBe("sector-1:0101");
    expect(system.planets.length).toBeGreaterThan(0);
    expect(system.mainworld).toBeTruthy();
    expect(system.mainworldName).toBe(system.mainworld?.name);
    expect(system.mainworldUwp).toBe(system.mainworld?.uwp);
    expect(system.habitability).toBe(system.mainworld?.habitability);
    expect(system.resourceRating).toBe(system.mainworld?.resourceRating);
    expect(system.tradeCodes).toEqual(system.mainworld?.tradeCodes ?? []);
    expect(system.mainworldRemarks).toEqual(system.mainworld?.remarks ?? []);
  });

  it("persists WBH physical and social overlays on generated survey worlds", () => {
    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0204",
          starType: "G2V",
          secondaryStars: ["K7V"],
        },
        namingOptions: {
          worldNameMode: "phonotactic",
          asteroidBeltNameMode: "phonotactic",
          galaxyMythicTheme: "all",
        },
      }),
    );

    const profiledWorld = system.planets.find(
      (world) => !["Gas Giant", "Planetoid Belt"].includes(String(world?.type || "")),
    );

    expect(system.starCount).toBe(2);
    expect(system.companionStars).toHaveLength(1);
    expect(profiledWorld).toBeTruthy();
    expect(profiledWorld?.uwp).toMatch(/^[A-EX][0-9A-F]{6}-[0-9A-F]$/);
    expect(typeof profiledWorld?.mainworldCandidateScore).toBe("number");
    expect(profiledWorld?.economics?.habitability).toBeDefined();
    expect(profiledWorld?.economics?.resourceRating).toBeDefined();
    expect(typeof profiledWorld?.hydrographicsPercent).toBe("number");
    expect(typeof profiledWorld?.hydrosphereLiquid).toBe("string");
    expect(typeof profiledWorld?.hydrosphereDescription).toBe("string");
    expect(typeof profiledWorld?.surfaceDistribution).toBe("string");
    expect(typeof profiledWorld?.surfaceDistributionSummary).toBe("string");
    expect(typeof profiledWorld?.dominantSurface).toBe("string");
    expect(typeof profiledWorld?.runawayGreenhouse).toBe("boolean");
    expect(typeof profiledWorld?.surfaceTidalEffectMeters).toBe("number");
    expect(profiledWorld?.tidalLockPressure).toBeTruthy();
    expect(typeof profiledWorld?.tidalLockPressure?.dm).toBe("number");
    expect(typeof profiledWorld?.tidalLockPressure?.risk).toBe("string");
    expect(profiledWorld?.seismology).toBeDefined();
    expect(typeof profiledWorld?.seismology?.totalTidalEffectMeters).toBe("number");
    expect(typeof profiledWorld?.majorTectonicPlates).toBe("number");
  });

  it("builds persisted survey systems for zero-luminosity non-stellar primaries", () => {
    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0909",
          starType: "Black Hole",
        },
        namingOptions: {
          worldNameMode: "list",
          asteroidBeltNameMode: "phonotactic",
          galaxyMythicTheme: "all",
        },
      }),
    );

    expect(system.primaryStar.designation).toBe("BH");
    expect(system.planets.length).toBeGreaterThan(0);
    expect(system.habitableZone.hasRadiantHabitableZone).toBe(false);
    expect(system.planets.every((planet) => planet.zone === "cold")).toBe(true);
  });
});
