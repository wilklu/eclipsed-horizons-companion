import { describe, expect, it } from "vitest";

import {
  buildSurveyDataFromWorld,
  buildUpdatedPlanetFromSurvey,
  createEmptySurveyData,
} from "./worldPhysicalSurveyFormModel.js";

describe("worldPhysicalSurveyFormModel", () => {
  it("hydrates WBH hydrosphere, greenhouse, and tidal values into survey fields", () => {
    const survey = buildSurveyDataFromWorld(
      {
        sectorId: "sector-1",
        hexCoordinates: { x: 2, y: 4 },
        stars: [
          { designation: "G2V", luminosity: 1 },
          { designation: "K7V", luminosity: 0.25 },
        ],
      },
      {
        name: "Trace World",
        uwp: "A6726D9-8",
        orbitNumber: 1,
        orbitAU: 0.4,
        orbitGroup: "A",
        diameterKm: 9755,
        composition: "Rock and Metal",
        density: 1,
        gravity: 0.765,
        mass: 0.448,
        escapeVelocityMps: 8563.76,
        atmosphereCode: 7,
        atmosphereComposition: "Standard, Tainted",
        atmosphereTaintProfile: "Sulphur Compounds",
        atmospherePressureBar: 0.7,
        oxygenPartialPressureBar: 0.147,
        atmosphereScaleHeightKm: 14.66,
        atmosphereSurvivalGear: "Filter",
        hydrographicsPercent: 21,
        hydrosphereLiquid: "Superheated Water",
        hydrosphereDescription: "21% fluid coverage with extreme evaporation pressure",
        surfaceDistribution: "Mixed",
        surfaceDistributionSummary: "Mixed oceans across a dominant landmass",
        dominantSurface: "land",
        orbitalPeriodDays: 900,
        dayLengthHours: 29.5,
        axialTilt: 20,
        avgTempC: 107,
        tempCategory: "Scorching",
        runawayGreenhouse: false,
        greenhouseAtmosphereCode: null,
        surfaceTidalEffectMeters: 0.188,
        tidalLockPressure: { dm: -6, risk: "low" },
        majorTectonicPlates: 5,
        resourceRating: "Sparse",
        habitability: "Poor",
        nativeLifeform: "0000",
        nativeSophontLife: false,
        remarks: ["Mainworld"],
        seismology: {
          totalSeismicStress: 9,
          residualSeismicStress: 9,
          tidalStressFactor: 0,
          tidalHeatingFactor: 0,
          majorTectonicPlates: 5,
        },
      },
    );

    expect(survey.hydrographics.coverage).toBe(21);
    expect(survey.hydrographics.composition).toBe("Superheated Water");
    expect(survey.hydrographics.distribution).toBe("Mixed");
    expect(survey.hydrographics.majorBodies).toBe("Mixed oceans across a dominant landmass");
    expect(survey.hydrographics.other).toBe("Dominant surface: Land");
    expect(survey.hydrographics.notes).toBe("21% fluid coverage with extreme evaporation pressure");
    expect(survey.rotation.tides).toBe("0.188 m");
    expect(survey.rotation.notes).toBe("Tidal lock pressure Low · DM -6");
    expect(survey.temperature.greenhouse).toBe("No");
    expect(survey.temperature.notes).toBe("Scorching climate regime · Tidal lock pressure Low · DM -6");
  });

  it("preserves explicit physical survey data when present", () => {
    const survey = buildSurveyDataFromWorld(
      {},
      {
        physicalSurvey: {
          worldName: "Edited World",
          hydrographics: {
            coverage: 62,
            composition: "Liquid Water",
            distribution: "Mixed",
          },
        },
      },
    );

    expect(survey.worldName).toBe("Edited World");
    expect(survey.hydrographics.coverage).toBe(62);
    expect(survey.hydrographics.composition).toBe("Liquid Water");
    expect(survey.hydrographics.distribution).toBe("Mixed");
  });

  it("roundtrips edited WBH survey values back onto the world record", () => {
    const payload = {
      ...createEmptySurveyData(),
      worldName: "Edited World",
      sah_uwp: "A867A99-C",
      size: {
        diameter: 12345,
        composition: "Rock and Metal",
        density: 1.05,
        gravity: 0.91,
        mass: 0.83,
        escapeVelocity: 10.9,
        notes: "",
      },
      orbit: {
        number: 2,
        au: 0.8,
        eccentricity: 0.02,
        period: "410 days",
        notes: "B",
      },
      hydrographics: {
        coverage: 62,
        composition: "Liquid Water",
        distribution: "Mixed",
        majorBodies: "Mixed continents in a world ocean",
        minorBodies: "",
        other: "Dominant surface: Ocean",
        notes: "62% surface coverage by stable liquids",
      },
      rotation: {
        sidereal: 30,
        solar: 30,
        solarDaysPerYear: 328,
        axialTilt: 18,
        tidalLock: "no",
        tides: "0.131 m",
        notes: "Tidal lock pressure Low · DM -8",
      },
      temperature: {
        high: null,
        mean: 288.15,
        low: null,
        luminosity: 1.25,
        albedo: null,
        greenhouse: "Runaway (Atm 11)",
        seismicStress: "12",
        residualStress: "9",
        tidalStress: "1",
        tidalHeating: "0",
        majorTectonicPlates: 6,
        notes: "Temperate climate regime",
      },
      resources: { rating: "good", notes: "" },
      habitability: { rating: "good", notes: "" },
      life: {
        biomass: "1",
        biocomplexity: "2",
        biodiversity: "3",
        compatibility: "4",
        sophonts: "native",
        notes: "",
      },
      subordinates: [],
      comments: "Edited from survey",
    };

    const updatedPlanet = buildUpdatedPlanetFromSurvey(
      {
        name: "Old World",
        uwp: "B000000-0",
        greenhouseAtmosphereCode: null,
        runawayGreenhouse: false,
        seismology: {
          residualSeismicStress: 4,
          tidalStressFactor: 0,
          tidalHeatingFactor: 0,
          totalSeismicStress: 4,
          majorTectonicPlates: 2,
        },
        moonsData: [],
      },
      payload,
    );

    expect(updatedPlanet.name).toBe("Edited World");
    expect(updatedPlanet.uwp).toBe("A867A99-C");
    expect(updatedPlanet.hydrographicsPercent).toBe(62);
    expect(updatedPlanet.hydrosphereLiquid).toBe("Liquid Water");
    expect(updatedPlanet.surfaceDistribution).toBe("Mixed");
    expect(updatedPlanet.surfaceDistributionSummary).toBe("Mixed continents in a world ocean");
    expect(updatedPlanet.dominantSurface).toBe("ocean");
    expect(updatedPlanet.runawayGreenhouse).toBe(true);
    expect(updatedPlanet.greenhouseAtmosphereCode).toBe(11);
    expect(updatedPlanet.surfaceTidalEffectMeters).toBe(0.131);
    expect(updatedPlanet.resourceRating).toBe("Good");
    expect(updatedPlanet.habitability).toBe("Good");
    expect(updatedPlanet.nativeSophontLife).toBe(true);
    expect(updatedPlanet.nativeLifeform).toBe("1234");
    expect(updatedPlanet.seismology).toMatchObject({
      residualSeismicStress: 9,
      tidalStressFactor: 1,
      tidalHeatingFactor: 0,
      totalSeismicStress: 12,
      majorTectonicPlates: 6,
    });
    expect(updatedPlanet.physicalSurvey).toBe(payload);
  });
});
