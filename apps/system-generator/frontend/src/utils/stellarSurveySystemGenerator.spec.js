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
    expect(system.minimumSustainableTechLevel).toEqual(system.mainworld?.minimumSustainableTechLevel ?? null);
    expect(system.populationConcentration).toEqual(system.mainworld?.populationConcentration ?? null);
    expect(system.urbanization).toEqual(system.mainworld?.urbanization ?? null);
    expect(system.majorCities).toEqual(system.mainworld?.majorCities ?? null);
    expect(system.governmentProfile).toEqual(system.mainworld?.governmentProfile ?? null);
    expect(system.justiceProfile).toEqual(system.mainworld?.justiceProfile ?? null);
    expect(system.lawProfile).toEqual(system.mainworld?.lawProfile ?? null);
    expect(system.appealProfile).toEqual(system.mainworld?.appealProfile ?? null);
    expect(system.privateLawProfile).toEqual(system.mainworld?.privateLawProfile ?? null);
    expect(system.personalRightsProfile).toEqual(system.mainworld?.personalRightsProfile ?? null);
    expect(system.factionsProfile).toEqual(system.mainworld?.factionsProfile ?? null);
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
    expect(profiledWorld?.uwp).toMatch(/^[A-EX][0-9A-HJ]{6}-[0-9A-HJ]$/);
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
    expect(typeof profiledWorld?.orbitBand).toBe("string");
    expect(typeof profiledWorld?.worldFamily).toBe("string");
    expect(typeof profiledWorld?.worldClass).toBe("string");
    expect(typeof profiledWorld?.worldSubtype).toBe("string");
    expect(typeof profiledWorld?.worldDescriptor).toBe("string");
  });

  it("marks flat-label legacy star imports when rebuilding persisted survey systems", () => {
    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0205",
          starType: "G2V",
          secondaryStars: ["K7V"],
          legacyReconstructed: true,
          legacyHierarchyUnknown: true,
        },
      }),
    );

    expect(system.metadata.generatedSurvey.legacyReconstructed).toBe(true);
    expect(system.metadata.generatedSurvey.legacyHierarchyUnknown).toBe(true);
    expect(system.metadata.legacyReconstructed).toBe(true);
    expect(system.metadata.legacyHierarchyUnknown).toBe(true);
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
    expect(system.metadata.anomalyType).toBe("Black Hole");
    expect(system.metadata.generatedSurvey.anomalyType).toBe("Black Hole");
  });

  it("preserves WBH generated-star hierarchy supplied by sector hex metadata", () => {
    const generatedStars = [
      {
        designation: "G2 V",
        spectralClass: "G2 V",
        massInSolarMasses: 1,
        luminosity: 1,
        temperatureK: 5800,
        starKey: "primary",
        orbitType: null,
        hierarchyLevel: 0,
      },
      {
        designation: "K7 V",
        spectralClass: "K7 V",
        massInSolarMasses: 0.7,
        luminosity: 0.2,
        temperatureK: 4300,
        starKey: "star-1",
        orbitType: "Near",
        hierarchyLevel: 1,
      },
      {
        designation: "M4 V",
        spectralClass: "M4 V",
        massInSolarMasses: 0.2,
        luminosity: 0.03,
        temperatureK: 3200,
        starKey: "star-2",
        orbitType: "Companion",
        parentStarKey: "star-1",
        hierarchyLevel: 2,
        continuationOf: "star-1",
      },
    ];

    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0310",
          generatedStars,
        },
        namingOptions: {
          worldNameMode: "phonotactic",
          asteroidBeltNameMode: "phonotactic",
          galaxyMythicTheme: "all",
        },
      }),
    );

    expect(system.starCount).toBe(3);
    expect(system.stars[1].starKey).toBe("star-1");
    expect(system.stars[2].parentStarKey).toBe("star-1");
    expect(system.stars[2].continuationOf).toBe("star-1");
    expect(system.companionStars[1].hierarchyLevel).toBe(2);
    expect(system.metadata.generatedSurvey.stars[2].orbitType).toBe("Companion");
  });
});
