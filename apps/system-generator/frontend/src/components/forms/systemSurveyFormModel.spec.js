import { describe, expect, it, vi } from "vitest";

import { buildPersistedSurveySystemFromHex } from "../../utils/stellarSurveySystemGenerator.js";
import {
  buildMainworldSocialProfileNotes,
  buildSurveyDataFromSystem,
  createEmptySurveyData,
  mergeSystemSurveyRecord,
} from "./systemSurveyFormModel.js";

function withDeterministicRandom(callback) {
  const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
  try {
    return callback();
  } finally {
    randomSpy.mockRestore();
  }
}

describe("systemSurveyFormModel", () => {
  it("hydrates hierarchy-aware generated stars and moon mainworld summaries into survey data", () => {
    const system = withDeterministicRandom(() =>
      buildPersistedSurveySystemFromHex({
        galaxyId: "gal-1",
        sectorId: "sector-1",
        hex: {
          coord: "0412",
          generatedStars: [
            {
              designation: "G2 V",
              spectralClass: "G2 V",
              massInSolarMasses: 1,
              luminosity: 1,
              temperatureK: 5800,
              starKey: "primary",
              hierarchyLevel: 0,
            },
            {
              designation: "K7 V",
              spectralClass: "K7 V",
              massInSolarMasses: 0.7,
              luminosity: 0.25,
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
              continuationOf: "star-1",
              hierarchyLevel: 2,
            },
          ],
        },
        namingOptions: {
          worldNameMode: "phonotactic",
          asteroidBeltNameMode: "phonotactic",
          galaxyMythicTheme: "all",
        },
      }),
    );

    const representativeWorld = system.planets.find((world) => String(world?.type || "") !== "Gas Giant");
    const surveyData = buildSurveyDataFromSystem({
      ...system,
      mainworldName: "Iona",
      mainworldType: "Moon",
      mainworldParentWorldName: "Tethys",
      mainworldUwp: "A867A99-C",
      habitability: "Good",
      resourceRating: "Abundant",
      tradeCodes: ["Ag", "Ri"],
      mainworldRemarks: ["Moon", "Orbits Tethys", "Mainworld"],
      mainworld: {
        ...(representativeWorld || {}),
        name: "Iona",
        parentWorldName: "Tethys",
        isMoon: true,
        uwp: "A867A99-C",
        remarks: ["Moon", "Orbits Tethys", "Mainworld"],
      },
    });

    expect(surveyData.stars).toHaveLength(3);
    expect(surveyData.stars[1].stellarProfile).toBe("Near");
    expect(surveyData.stars[2].notes).toContain("Parent star-1");
    expect(surveyData.stars[2].notes).toContain("Continuation star-1");
    expect(surveyData.mainworldType).toBe("Moon");
    expect(surveyData.mainworldParent).toBe("Tethys");
    expect(surveyData.mainworldRemarks).toContain("Moon");
    expect(surveyData.tradeCodes).toBe("Ag, Ri");
    expect(surveyData.worlds.some((world) => world.designation)).toBe(true);
  });

  it("roundtrips saved survey rows back through autofill without losing edited values", () => {
    const currentRecord = {
      systemId: "sector-1:0412",
      metadata: {
        generatedSurvey: {
          stars: [{ designation: "G2 V" }],
        },
        source: "test",
      },
      profiles: {
        secondaryProfiles: "Legacy note",
      },
      habitabilityZone: {
        centre: 1.1,
      },
      objectCounts: {
        gasGiants: 1,
      },
    };

    const surveyData = {
      ...createEmptySurveyData(),
      systemDesignation: "Surveyed Alpha",
      sectorHex: "sector-1 0412",
      travelZone: "amber",
      hzCentre: 1.2,
      hzInner: 0.9,
      hzOuter: 1.6,
      gasGiants: 2,
      belts: 1,
      terrestrials: 5,
      stars: [
        {
          designation: "Primary",
          typeSubtype: "G2 V",
          lumClass: "V",
          mass: 1,
          luminosity: 1,
          temperature: 5800,
          diameter: 1,
          stellarProfile: "Primary",
          notes: "Calibrated",
        },
      ],
      worlds: [
        {
          designation: "Iona",
          type: "MON",
          orbitAu: "3.2/2.4",
          sah: "A867A99-C",
          diameter: 12345,
          temperature: 19,
          atmosphere: 6,
          hydrosphere: 7,
          lifeMxdc: "1234",
          habitability: "Good",
          resources: "Abundant",
          notes: "Moon, Orbits Tethys, Mainworld",
        },
      ],
      mainworldName: "Iona",
      mainworldType: "Moon",
      mainworldParent: "Tethys",
      mainworldUwp: "A867A99-C",
      nativeLifeform: "1234",
      habitability: "Good",
      resourceRating: "Abundant",
      tradeCodes: "Ag, Ri",
      mainworldRemarks: "Moon, Orbits Tethys, Mainworld",
      appealProfile: "Defendants may appeal convictions",
      privateLawProfile: "Government review of all settlements",
      personalRightsProfile: "Warrantless searches and routine private surveillance apply",
      secondaryProfiles: "Edited note",
      comments: "Roundtrip verification",
    };

    const merged = mergeSystemSurveyRecord(currentRecord, surveyData, "2026-04-07T12:00:00.000Z");
    const rehydrated = buildSurveyDataFromSystem(merged);

    expect(merged.metadata.generatedSurvey.stars).toEqual(currentRecord.metadata.generatedSurvey.stars);
    expect(merged.metadata.lastModified).toBe("2026-04-07T12:00:00.000Z");
    expect(rehydrated.stars[0].typeSubtype).toBe("G2 V");
    expect(rehydrated.stars[0].notes).toBe("Calibrated");
    expect(rehydrated.worlds[0].designation).toBe("Iona");
    expect(rehydrated.worlds[0].type).toBe("MON");
    expect(rehydrated.worlds[0].notes).toBe("Moon, Orbits Tethys, Mainworld");
    expect(rehydrated.mainworldType).toBe("Moon");
    expect(rehydrated.mainworldParent).toBe("Tethys");
    expect(rehydrated.tradeCodes).toBe("Ag, Ri");
    expect(rehydrated.appealProfile).toBe("Defendants may appeal convictions");
    expect(rehydrated.privateLawProfile).toBe("Government review of all settlements");
    expect(rehydrated.personalRightsProfile).toBe("Warrantless searches and routine private surveillance apply");
    expect(rehydrated.secondaryProfiles).toBe("Edited note");
    expect(rehydrated.hzCentre).toBe(1.2);
    expect(rehydrated.gasGiants).toBe(2);
  });

  it("derives object counts from the saved planetary roster when explicit counts are absent", () => {
    const surveyData = buildSurveyDataFromSystem({
      systemId: "sector-1:0412",
      planets: [
        { name: "Aurea", type: "Terrestrial Planet" },
        { name: "Brimstone", type: "Terrestrial Planet" },
        { name: "Jorund", type: "Gas Giant" },
        { name: "Shale Ring", type: "Planetoid Belt" },
      ],
    });

    expect(surveyData.terrestrials).toBe(2);
    expect(surveyData.gasGiants).toBe(1);
    expect(surveyData.belts).toBe(1);
  });

  it("persists the saved system name into the canonical record fields", () => {
    const merged = mergeSystemSurveyRecord(
      {
        systemId: "sector-1:0412",
        metadata: {
          systemRecord: {},
        },
      },
      {
        ...createEmptySurveyData(),
        systemDesignation: "Aster System",
        stars: [
          {
            designation: "Primary",
            typeSubtype: "G2 V",
            lumClass: "V",
            mass: 1,
            luminosity: 1,
            temperature: 5800,
            diameter: 1,
            stellarProfile: "Primary",
            notes: "",
          },
        ],
      },
      "2026-04-19T00:00:00.000Z",
    );

    expect(merged.name).toBe("Aster System");
    expect(merged.metadata.displayName).toBe("Aster System");
    expect(merged.metadata.systemRecord.name).toBe("Aster System");
  });

  it("parses spectral class into separate typeSubtype and lumClass fields when autofilling generated stars", () => {
    const cases = [
      { spectralClass: "G2 V", typeSubtype: "G2", lumClass: "V" },
      { spectralClass: "K7 V", typeSubtype: "K7", lumClass: "V" },
      { spectralClass: "M4 V", typeSubtype: "M4", lumClass: "V" },
      { spectralClass: "G2V", typeSubtype: "G2", lumClass: "V" },
      { spectralClass: "B2V", typeSubtype: "B2", lumClass: "V" },
      { spectralClass: "Black Hole", typeSubtype: "Black Hole", lumClass: "" },
      { spectralClass: "Neutron Star", typeSubtype: "Neutron Star", lumClass: "" },
      { spectralClass: "D", typeSubtype: "D", lumClass: "" },
    ];

    for (const { spectralClass, typeSubtype, lumClass } of cases) {
      const surveyData = buildSurveyDataFromSystem({
        systemId: "sector-1:0101",
        stars: [{ designation: "Primary", spectralClass, starKey: "primary" }],
      });
      expect(surveyData.stars[0].typeSubtype, `typeSubtype for ${spectralClass}`).toBe(typeSubtype);
      expect(surveyData.stars[0].lumClass, `lumClass for ${spectralClass}`).toBe(lumClass);
    }
  });

  it("derives profile notes from mainworld social overlays when no explicit notes are stored", () => {
    const socialNotes = buildMainworldSocialProfileNotes({
      minimumSustainableTechLevel: { summary: "Minimal sustainable TL 5" },
      governmentProfile: {
        profileCode: "4-FES-LM-JS",
        summary: "Federal / Executive / Single Council",
        structureSummary: "Executive Single Council, Legislative Multiple Councils, Judicial Single Council",
      },
      justiceProfile: { code: "A", label: "Adversarial" },
      lawProfile: { eligible: true, summary: "AIP-Y-Y / 6-73853 / Personal law" },
      appealProfile: { eligible: true, summary: "Defendants may appeal convictions" },
      privateLawProfile: { eligible: true, summary: "Government review of all settlements" },
      personalRightsProfile: {
        eligible: true,
        summary: "Warrantless searches and routine private surveillance apply",
      },
      factionsProfile: { eligible: true, summary: "2 significant factions" },
      civilConflict: { eligible: true, active: true, trigger: "balkanization" },
      techLevelPockets: { eligible: true, summary: "TL 6-10" },
    });
    const surveyData = buildSurveyDataFromSystem({
      mainworld: {
        name: "Iona",
        minimumSustainableTechLevel: { summary: "Minimal sustainable TL 5" },
        governmentProfile: {
          profileCode: "4-FES-LM-JS",
          summary: "Federal / Executive / Single Council",
          structureSummary: "Executive Single Council, Legislative Multiple Councils, Judicial Single Council",
        },
        justiceProfile: { code: "A", label: "Adversarial" },
        lawProfile: { eligible: true, summary: "AIP-Y-Y / 6-73853 / Personal law" },
        appealProfile: { eligible: true, summary: "Defendants may appeal convictions" },
        privateLawProfile: { eligible: true, summary: "Government review of all settlements" },
        personalRightsProfile: {
          eligible: true,
          summary: "Warrantless searches and routine private surveillance apply",
        },
        factionsProfile: { eligible: true, summary: "2 significant factions" },
        civilConflict: { eligible: true, active: true, trigger: "balkanization" },
        techLevelPockets: { eligible: true, summary: "TL 6-10" },
      },
      profiles: {},
    });

    expect(socialNotes).toContain("Minimal sustainable TL 5");
    expect(socialNotes).toContain("Government profile 4-FES-LM-JS");
    expect(socialNotes).toContain("Justice A Adversarial");
    expect(socialNotes).toContain("Law profile AIP-Y-Y / 6-73853 / Personal law");
    expect(socialNotes).toContain("Appeals Defendants may appeal convictions");
    expect(socialNotes).toContain("Private law Government review of all settlements");
    expect(socialNotes).toContain("Personal rights Warrantless searches and routine private surveillance apply");
    expect(socialNotes).toContain("Factions 2 significant factions");
    expect(socialNotes).toContain("Civil conflict active");
    expect(socialNotes).toContain("Tech pockets TL 6-10");
    expect(surveyData.profileNotes).toContain("Minimal sustainable TL 5");
    expect(surveyData.profileNotes).toContain("Government profile 4-FES-LM-JS");
    expect(surveyData.profileNotes).toContain("Justice A Adversarial");
    expect(surveyData.profileNotes).toContain("Law profile AIP-Y-Y / 6-73853 / Personal law");
    expect(surveyData.profileNotes).toContain("Appeals Defendants may appeal convictions");
    expect(surveyData.profileNotes).toContain("Private law Government review of all settlements");
    expect(surveyData.profileNotes).toContain(
      "Personal rights Warrantless searches and routine private surveillance apply",
    );
    expect(surveyData.profileNotes).toContain("Factions 2 significant factions");
    expect(surveyData.profileNotes).toContain("Civil conflict active");
    expect(surveyData.profileNotes).toContain("Tech pockets TL 6-10");
    expect(surveyData.worlds[0].notes).toContain("Government profile 4-FES-LM-JS");
    expect(surveyData.worlds[0].notes).toContain("Justice A Adversarial");
    expect(surveyData.worlds[0].notes).toContain("Law profile AIP-Y-Y / 6-73853 / Personal law");
    expect(surveyData.worlds[0].notes).toContain("Appeals Defendants may appeal convictions");
    expect(surveyData.worlds[0].notes).toContain("Private law Government review of all settlements");
    expect(surveyData.worlds[0].notes).toContain(
      "Personal rights Warrantless searches and routine private surveillance apply",
    );
    expect(surveyData.worlds[0].notes).toContain("Civil conflict active");
    expect(surveyData.worlds[0].notes).toContain("Tech pockets TL 6-10");
  });

  it("adds secondary-world law-source notes to derived survey world notes", () => {
    const surveyData = buildSurveyDataFromSystem({
      mainworld: {
        name: "Iona",
        uwp: "A867A99-C",
      },
      worlds: [
        {
          name: "Iona",
          uwp: "A867A99-C",
          isMainworld: true,
          remarks: ["Mainworld"],
        },
        {
          name: "Zed Secundus",
          uwp: "C75645A-8",
          governmentProfile: { profileCode: "5-FES-LM-JS", summary: "Federal / Executive / Single Council" },
          justiceProfile: { code: "A", label: "Adversarial" },
          lawProfile: { eligible: true, summary: "AIP-Y-N / A-989B9 / Personal law" },
          secondaryWorldContext: {
            eligible: true,
            classificationCodes: ["Fp"],
            classificationLabelSummary: "Fp Freeport",
            governmentSummary: "Independent chartered port with broad autonomy.",
            lawLevelSummary: "Law level rerolled to 4 for freeport operations.",
            regulatorySummary: "The freeport leniency modifier softens regulation relative to the mainworld.",
            lawLevelSourceSummary: "Law level rerolled with freeport leniency.",
          },
        },
      ],
    });

    expect(
      surveyData.worlds.some((world) =>
        world.notes.includes("Secondary law source Law level rerolled with freeport leniency."),
      ),
    ).toBe(true);
    expect(surveyData.worlds.some((world) => world.notes.includes("Secondary classifications Fp Freeport"))).toBe(true);
    expect(
      surveyData.worlds.some((world) => world.notes.includes("Secondary government Independent chartered port")),
    ).toBe(true);
    expect(
      surveyData.worlds.some((world) => world.notes.includes("Secondary regulation The freeport leniency modifier")),
    ).toBe(true);
    expect(surveyData.secondaryProfiles).toContain("Zed Secundus: Fp Freeport");
    expect(surveyData.secondaryProfiles).toContain("Law level rerolled to 4 for freeport operations.");
  });

  it("marks reconstructed flat-label star metadata as legacy in survey notes", () => {
    const surveyData = buildSurveyDataFromSystem({
      metadata: {
        generatedSurvey: {
          legacyReconstructed: true,
          legacyHierarchyUnknown: true,
        },
      },
    });

    expect(surveyData.profileNotes).toContain("Legacy star hierarchy reconstructed from flat labels.");
  });
});
