import { describe, expect, it } from "vitest";

import {
  deriveDiscretionaryEnforcementProfile,
  SOCIAL_WBH_RULES,
  applySystemWorldSocialProfiles,
  deriveCivilConflictProfile,
  deriveFactionsProfile,
  deriveGovernmentProfile,
  deriveJusticeProfile,
  deriveConvictionProfile,
  deriveLawProfile,
  deriveMajorCitiesProfile,
  deriveAppealProfile,
  derivePenaltyProfile,
  derivePersonalRightsProfile,
  derivePrivateLawProfile,
  deriveMinimumSustainableTechLevel,
  derivePopulationConcentrationProfile,
  deriveSecondaryWorldContext,
  deriveSecondaryWorldLawLevel,
  deriveTechLevelPocketProfile,
  deriveUrbanizationProfile,
  generateWorldProfile,
} from "./worldProfileGenerator.js";

describe("worldProfileGenerator", () => {
  it("tracks provisional WBH social coverage", () => {
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "core-uwp-rolls")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "documented-social-house-rules")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "population-concentration-urbanization")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "major-cities")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "government-traits")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "government-structure")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "factions")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "secondary-world-governments")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "system-of-justice")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "discretionary-enforcement")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "law-level-profiles")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "secondary-world-law-levels")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "criminal-economic-legal-outcomes")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "appeals-private-law-outcomes")).toBe(true);
    expect(SOCIAL_WBH_RULES.some((rule) => rule.id === "personal-rights-outcomes")).toBe(true);
  });

  it("generates non-zero WBH-style social data for standalone worlds", () => {
    const world = generateWorldProfile({ worldName: "Zed Prime", starClass: "G", orbitNumber: 3.1, hzco: 3.3 });

    expect(world.uwp).toMatch(/^[A-EX][0-9A-HJ]{6}-[0-9A-HJ]$/);
    expect(typeof world.populationCode).toBe("number");
    expect(typeof world.techLevel).toBe("number");
    expect(world.economics?.importance).toBeDefined();
    expect(world.minimumSustainableTechLevel?.minimumTechLevel).toBeGreaterThanOrEqual(0);
    expect(world.populationConcentration?.summary).toBeTruthy();
    expect(world.urbanization?.summary).toBeTruthy();
    expect(world.majorCities?.summary).toBeTruthy();
    expect(world.governmentProfile?.summary).toBeTruthy();
    expect(world.justiceProfile?.summary).toBeTruthy();
    expect(world.lawProfile?.summary).toBeTruthy();
    expect(world.appealProfile?.summary).toBeTruthy();
    expect(world.privateLawProfile?.summary).toBeTruthy();
    expect(world.personalRightsProfile?.summary).toBeTruthy();
    expect(world.factionsProfile?.summary).toBeTruthy();
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

  it("derives civil-conflict status from documented house rules", () => {
    const activeConflict = deriveCivilConflictProfile({
      populationCode: 8,
      governmentCode: 7,
      lawLevel: 5,
      rollDie: () => 5,
    });
    const stableWorld = deriveCivilConflictProfile({
      populationCode: 6,
      governmentCode: 7,
      lawLevel: 5,
      rollDie: () => 6,
    });

    expect(activeConflict.eligible).toBe(true);
    expect(activeConflict.active).toBe(true);
    expect(activeConflict.trigger).toBe("balkanization");
    expect(stableWorld.eligible).toBe(false);
  });

  it("derives optional tech-level pockets from documented house rules", () => {
    const pocketProfile = deriveTechLevelPocketProfile({ techLevel: 8 });
    const lowTechProfile = deriveTechLevelPocketProfile({ techLevel: 4 });

    expect(pocketProfile.eligible).toBe(true);
    expect(pocketProfile.lowLevel).toBe(6);
    expect(pocketProfile.highLevel).toBe(10);
    expect(lowTechProfile.eligible).toBe(false);
  });

  it("derives WBH-style population concentration from Chapter 7 modifiers", () => {
    const profile = derivePopulationConcentrationProfile({
      world: { size: 5, atmosphereCode: 6 },
      populationCode: 7,
      governmentCode: 7,
      techLevel: 8,
      tradeCodes: ["Ag", "Ri"],
      rollDie: () => 5,
    });

    expect(profile.eligible).toBe(true);
    expect(profile.rating).toBe(4);
    expect(profile.label).toBe("Slightly Dispersed");
    expect(profile.settledAreaPercent).toBe(60);
    expect(profile.minimumSustainableTechLevel.minimumTechLevel).toBe(3);
  });

  it("derives WBH-style urbanization from concentration and world modifiers", () => {
    const urbanization = deriveUrbanizationProfile({
      world: { size: 5, atmosphereCode: 6 },
      population: 10_000_000,
      populationCode: 7,
      governmentCode: 7,
      lawLevel: 6,
      techLevel: 8,
      tradeCodes: ["Ag", "Ri"],
      populationConcentration: {
        eligible: true,
        rating: 4,
        minimumSustainableTechLevel: { minimumTechLevel: 3, band: "3-7" },
      },
      rollTwoDice: () => 7,
      rollDie: (sides = 6) => (sides === 2 ? 1 : 2),
    });

    expect(urbanization.eligible).toBe(true);
    expect(urbanization.percent).toBe(51);
    expect(urbanization.urbanPopulation).toBe(5_100_000);
    expect(urbanization.summary).toBe("51% urbanized");
  });

  it("derives exact minimum sustainable TL from Table 85 inputs", () => {
    const corrosiveWorld = deriveMinimumSustainableTechLevel({ atmosphereCode: 11, habitability: "Good" });
    const nativeWorld = deriveMinimumSustainableTechLevel({
      atmosphereCode: 17,
      habitability: "Hostile",
      nativeSophontLife: true,
    });

    expect(corrosiveWorld.minimumTechLevel).toBe(9);
    expect(corrosiveWorld.band).toBe("8+");
    expect(nativeWorld.minimumTechLevel).toBe(0);
    expect(nativeWorld.summary).toMatch(/native sophonts/i);
  });

  it("derives WBH-style major city counts from PCR and urbanization", () => {
    const majorCities = deriveMajorCitiesProfile({
      populationCode: 7,
      populationConcentration: { eligible: true, rating: 4 },
      urbanization: { eligible: true, percent: 51, urbanPopulation: 7_000_000 },
      rollTwoDice: () => 7,
    });

    expect(majorCities.eligible).toBe(true);
    expect(majorCities.count).toBe(6);
    expect(majorCities.summary).toBe("6 major cities");
  });

  it("derives WBH-style government traits from centralization and authority tables", () => {
    const governmentProfile = deriveGovernmentProfile({
      governmentCode: 11,
      populationCode: 8,
      populationConcentration: { eligible: true, rating: 8 },
      rollCentralization: () => 8,
      rollAuthority: () => 5,
      rollFunctionalStructure: () => 7,
      rollStructureDie: () => 4,
    });

    expect(governmentProfile.eligible).toBe(true);
    expect(governmentProfile.centralization.code).toBe("U");
    expect(governmentProfile.authority.code).toBe("J");
    expect(governmentProfile.authoritativeStructure.code).toBe("R");
    expect(governmentProfile.profileCode).toBe("B-UJR-LR-ER");
    expect(governmentProfile.summary).toBe("Unitary / Judicial / Ruler");
    expect(governmentProfile.structureSummary).toContain("Judicial Ruler");
  });

  it("derives Chapter 7 faction summaries and ruling relationships", () => {
    const factionsProfile = deriveFactionsProfile({
      governmentCode: 4,
      populationCode: 8,
      rollFactionCount: () => 3,
      rollGovernment: () => 8,
      rollStrength: () => 8,
      rollRelationship: () => 4,
    });

    expect(factionsProfile.eligible).toBe(true);
    expect(factionsProfile.significantFactionCount).toBe(2);
    expect(factionsProfile.profiles[1].profileCode).toBe("II-9-N");
    expect(factionsProfile.relationships[0].profileCode).toBe("I+II=5");
  });

  it("derives a judicial system from law and government structure", () => {
    const justiceProfile = deriveJusticeProfile({
      governmentCode: 4,
      lawLevel: 6,
      techLevel: 8,
      governmentProfile: {
        centralization: { code: "F" },
        authority: { code: "J" },
      },
      rollJustice: () => 8,
    });

    expect(justiceProfile.eligible).toBe(true);
    expect(justiceProfile.code).toBe("A");
    expect(justiceProfile.summary).toBe("Adversarial");
  });

  it("derives Chapter 7 law uniformity and subcategory profile codes", () => {
    const lawProfile = deriveLawProfile({
      governmentCode: 4,
      lawLevel: 6,
      populationCode: 8,
      techLevel: 8,
      governmentProfile: {
        centralization: { code: "F" },
        authority: { code: "J" },
      },
      justiceProfile: { eligible: true, code: "A", label: "Adversarial", summary: "Adversarial" },
      populationConcentration: { eligible: true, rating: 8 },
      rollUniformity: () => 6,
      rollSecondaryJustice: () => 6,
      rollPresumption: () => 8,
      rollDeathPenalty: () => 8,
      rollWeaponsLevel: () => 3,
      rollEconomicLevel: () => 2,
      rollCriminalLevel: () => 1,
      rollPrivateLevel: () => 3,
      rollPersonalRightsLevel: () => 1,
    });

    expect(lawProfile.eligible).toBe(true);
    expect(lawProfile.uniformity.code).toBe("P");
    expect(lawProfile.secondarySystem.code).toBe("I");
    expect(lawProfile.presumptionOfInnocence).toBe(true);
    expect(lawProfile.deathPenalty).toBe(true);
    expect(lawProfile.judicialProfileCode).toBe("AIP-Y-Y");
    expect(lawProfile.lawLevelProfileCode).toBe("6-96484");
  });

  it("supports A+ law levels and extended law-profile codes", () => {
    const lawProfile = deriveLawProfile({
      governmentCode: 11,
      lawLevel: 10,
      populationCode: 8,
      techLevel: 10,
      governmentProfile: {
        centralization: { code: "U" },
        authority: { code: "E" },
      },
      justiceProfile: { eligible: true, code: "A", label: "Adversarial", summary: "Adversarial" },
      populationConcentration: { eligible: true, rating: 4 },
      rollUniformity: () => 4,
      rollSecondaryJustice: () => 5,
      rollPresumption: () => 10,
      rollDeathPenalty: () => 6,
      rollWeaponsLevel: () => 2,
      rollEconomicLevel: () => 3,
      rollCriminalLevel: () => 3,
      rollPrivateLevel: () => 2,
      rollPersonalRightsLevel: () => 2,
    });

    expect(lawProfile.overallLevel.code).toBe("A");
    expect(lawProfile.lawLevelProfileCode.startsWith("A-")).toBe(true);
  });

  it("derives conviction and criminal/economic penalty outcomes from law profiles", () => {
    const lawProfile = {
      presumptionOfInnocence: true,
      deathPenalty: true,
      overallLevel: { value: 10, code: "A" },
      subcategories: {
        criminal: { value: 8, code: "8" },
        economic: { value: 10, code: "A" },
      },
    };
    const conviction = deriveConvictionProfile({
      lawProfile,
      justiceProfile: { code: "A" },
      offenseType: "criminal",
      defendantActuallyCommittedCrime: true,
      evidenceLevel: "circumstantial",
      prosecutionAdvocate: 1,
      rollTwoDice: () => 8,
    });
    const criminalPenalty = derivePenaltyProfile({
      lawProfile,
      offenseType: "criminal",
      severity: "appalling",
      prohibitedAtLevel: 2,
      rollTwoDice: () => 7,
    });
    const economicPenalty = derivePenaltyProfile({
      lawProfile,
      offenseType: "economic",
      severity: "moderate",
      prohibitedAtLevel: 2,
      rollTwoDice: () => 9,
    });

    expect(conviction.convicted).toBe(true);
    expect(conviction.applicableLawLevel).toBe(8);
    expect(criminalPenalty.summary).toBe("Death");
    expect(criminalPenalty.enforcementProfile?.automaticallyPursued).toBe(true);
    expect(economicPenalty.summary).toContain("death penalty may be discretionary");
    expect(economicPenalty.enforcementProfile?.automaticallyPursued).toBe(true);
  });

  it("derives appeal rights and retries convictions on successful appeals", () => {
    const lawProfile = {
      overallLevel: { value: 10, code: "A" },
      presumptionOfInnocence: true,
      subcategories: {
        criminal: { value: 8, code: "8" },
      },
      primarySystem: { code: "I" },
    };

    const rightsProfile = deriveAppealProfile({
      lawProfile,
      justiceProfile: { code: "I" },
    });
    const defendantAppeal = deriveAppealProfile({
      lawProfile,
      justiceProfile: { code: "I" },
      outcome: "conviction",
      appellantAdvocate: 2,
      rollAppellant: () => 8,
      retrialOptions: {
        lawProfile,
        justiceProfile: { code: "I" },
        offenseType: "criminal",
        defendantActuallyCommittedCrime: true,
        evidenceLevel: "circumstantial",
        rollTwoDice: () => 7,
      },
    });
    const prosecutionAppeal = deriveAppealProfile({
      lawProfile,
      justiceProfile: { code: "I" },
      outcome: "acquittal",
      appellantAdvocate: 2,
      respondentAdvocate: 0,
      rollAppellant: () => 8,
      rollRespondent: () => 6,
    });

    expect(rightsProfile.summary).toContain("prosecution may appeal acquittals");
    expect(defendantAppeal.granted).toBe(true);
    expect(defendantAppeal.retrialProfile?.eligible).toBe(true);
    expect(prosecutionAppeal.granted).toBe(true);
  });

  it("derives private-law posture and contested outcomes", () => {
    const lawProfile = {
      overallLevel: { value: 8, code: "8" },
      subcategories: {
        private: { value: 10, code: "A" },
      },
    };

    const posture = derivePrivateLawProfile({ lawProfile });
    const contested = derivePrivateLawProfile({
      lawProfile,
      plaintiffAdvocate: 2,
      defendantAdvocate: 0,
      punitiveDamagesRequested: true,
      rollPlaintiff: () => 9,
      rollDefendant: () => 5,
      rollDamages: () => 8,
    });

    expect(posture.summary).toContain("Government-adjudicated arbitration required");
    expect(contested.plaintiffPrevails).toBe(true);
    expect(contested.punitiveDamagesLimited).toBe(true);
    expect(contested.summary).toContain("punitive damages guidance");
  });

  it("derives personal-rights posture and criminal-style outcomes", () => {
    const lawProfile = {
      deathPenalty: false,
      presumptionOfInnocence: true,
      overallLevel: { value: 10, code: "A" },
      subcategories: {
        personalRights: { value: 11, code: "B" },
      },
      primarySystem: { code: "A" },
    };

    const posture = derivePersonalRightsProfile({ lawProfile, justiceProfile: { code: "A" } });
    const prosecution = derivePersonalRightsProfile({
      lawProfile,
      justiceProfile: { code: "A" },
      severity: "minor",
      prohibitedAtLevel: 3,
      defendantActuallyCommittedViolation: true,
      caughtRedHanded: true,
      rollConviction: () => 6,
      rollPenalty: () => 7,
    });

    expect(posture.summary).toContain("Warrantless searches");
    expect(posture.alwaysPursued).toBe(true);
    expect(prosecution.convictionProfile?.convicted).toBe(true);
    expect(prosecution.penaltyProfile?.summary).toBe("Imprisonment for 2D years or exile");
  });

  it("derives discretionary enforcement for low-enforcement criminal, economic, and personal-rights violations", () => {
    const lawProfile = {
      overallLevel: { value: 6, code: "6" },
      subcategories: {
        criminal: { value: 2, code: "2" },
        economic: { value: 2, code: "2" },
        personalRights: { value: 2, code: "2" },
      },
    };

    const criminalPenalty = derivePenaltyProfile({
      lawProfile,
      offenseType: "criminal",
      severity: "minor",
      prohibitedAtLevel: 5,
      rollTwoDice: () => 7,
    });
    const economicPenalty = derivePenaltyProfile({
      lawProfile,
      offenseType: "economic",
      severity: "minor",
      prohibitedAtLevel: 5,
      rollTwoDice: () => 7,
    });
    const posture = deriveDiscretionaryEnforcementProfile({
      lawProfile,
      offenseType: "personalRights",
      severity: "minor",
    });
    const warning = deriveDiscretionaryEnforcementProfile({
      lawProfile,
      offenseType: "personalRights",
      severity: "minor",
      persuadeSkill: 2,
      rollCheck: () => 7,
      checkTarget: 8,
    });

    expect(criminalPenalty.enforcementProfile?.warningPossible).toBe(true);
    expect(criminalPenalty.enforcementProfile?.automaticallyPursued).toBe(false);
    expect(economicPenalty.enforcementProfile?.warningPossible).toBe(true);
    expect(economicPenalty.enforcementProfile?.automaticallyPursued).toBe(false);
    expect(posture.automaticallyPursued).toBe(false);
    expect(posture.warningPossible).toBe(true);
    expect(posture.summary).toContain("May escape with a warning");
    expect(warning.warningGranted).toBe(true);
    expect(warning.summary).toContain("Escapes with a warning");
  });

  it("derives secondary-world dependency governments and classifications", () => {
    const secondaryWorldContext = deriveSecondaryWorldContext({
      world: {
        type: "Planetoid Belt",
        zone: "habitable",
        atmosphereCode: 5,
        hydrographics: 5,
      },
      populationCode: 5,
      governmentCode: 2,
      lawLevel: 6,
      techLevel: 8,
      mainworldOverlay: {
        governmentCode: 6,
        populationCode: 5,
        techLevel: 10,
        lawLevel: 8,
        starport: "B",
        tradeCodes: ["In"],
      },
      rollDependencyGovernment: () => 1,
      rollClassification: () => 6,
    });

    expect(secondaryWorldContext.eligible).toBe(true);
    expect(secondaryWorldContext.dependent).toBe(true);
    expect(secondaryWorldContext.governmentCode).toBe(6);
    expect(secondaryWorldContext.classificationCodes).toContain("Cy");
    expect(secondaryWorldContext.classificationCodes).toContain("Mi");
  });

  it("derives secondary-world law levels for captive, dependent, and freeport cases", () => {
    const dieSequence = [5, 2];
    const captiveLawLevel = deriveSecondaryWorldLawLevel({
      populationCode: 5,
      governmentCode: 6,
      mainworldOverlay: {
        governmentCode: 6,
        lawLevel: 5,
      },
      secondaryWorldContext: {
        eligible: true,
        dependent: true,
        classificationCodes: ["Mb"],
      },
      rollDie: () => dieSequence.shift() ?? 1,
      rollTwoDice: () => 7,
    });
    const inheritedLawLevel = deriveSecondaryWorldLawLevel({
      populationCode: 4,
      governmentCode: 2,
      mainworldOverlay: {
        governmentCode: 4,
        lawLevel: 6,
      },
      secondaryWorldContext: {
        eligible: true,
        dependent: true,
        classificationCodes: [],
      },
      rollTwoDice: () => 4,
    });
    const freeportLawLevel = deriveSecondaryWorldLawLevel({
      populationCode: 4,
      governmentCode: 5,
      mainworldOverlay: {
        governmentCode: 6,
        lawLevel: 6,
      },
      secondaryWorldContext: {
        eligible: true,
        dependent: false,
        classificationCodes: ["Fp"],
      },
      rollTwoDice: () => 7,
    });

    expect(captiveLawLevel.caseLabel).toBe("captive-mainworld-plus-die");
    expect(captiveLawLevel.lawLevel).toBe(7);
    expect(captiveLawLevel.sourceSummary).toContain("owning mainworld");
    expect(inheritedLawLevel.caseLabel).toBe("dependent-inherits-mainworld");
    expect(inheritedLawLevel.lawLevel).toBe(6);
    expect(freeportLawLevel.caseLabel).toBe("independent-freeport");
    expect(freeportLawLevel.lawLevel).toBe(4);
  });

  it("allows secondary-world law levels to extend above 9", () => {
    const highLawSecondaryWorld = deriveSecondaryWorldLawLevel({
      populationCode: 5,
      governmentCode: 6,
      mainworldOverlay: {
        governmentCode: 6,
        lawLevel: 10,
      },
      secondaryWorldContext: {
        eligible: true,
        dependent: true,
        classificationCodes: ["Mb"],
      },
      rollDie: () => 6,
      rollTwoDice: () => 8,
    });

    expect(highLawSecondaryWorld.lawLevel).toBe(16);
  });

  it("marks government traits unavailable when no functioning government exists", () => {
    const governmentProfile = deriveGovernmentProfile({
      governmentCode: 0,
      populationCode: 0,
      populationConcentration: { eligible: false, rating: null },
    });

    expect(governmentProfile.eligible).toBe(false);
    expect(governmentProfile.summary).toBe("No functioning government");
  });
});
