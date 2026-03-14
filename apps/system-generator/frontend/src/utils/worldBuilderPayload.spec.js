import { describe, expect, it } from "vitest";

import { buildGeneratedSurveyPayload, deriveSystemGenerationContext } from "./worldBuilderPayload.js";

function createSequenceRng(sequence) {
  let index = 0;
  return () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return value;
  };
}

describe("deriveSystemGenerationContext", () => {
  it("derives seismic defaults from persisted system metadata", () => {
    const context = deriveSystemGenerationContext({
      primaryStar: { age: 6.75 },
      metadata: {
        generatedSurvey: {
          worldPlacement: {
            slots: [
              {
                significantMoonCount: 3,
                significantMoonSizeDetails: [{ sizeValue: 2 }, { sizeValue: 3 }],
              },
              {
                significantMoonCount: 1,
                significantMoonSizeDetails: [{ sizeValue: 1 }],
              },
            ],
          },
          mainworldCandidates: {
            candidates: [{ density: 0.92 }, { density: 1.08 }],
          },
        },
      },
    });

    expect(context).toEqual({
      systemAgeGyr: 6.75,
      density: 1,
      moonSizesPool: [2, 3, 1],
      moonCountDefault: 2,
    });
  });

  it("derives tidal totals and stress factor when present in persisted survey metadata", () => {
    const context = deriveSystemGenerationContext({
      metadata: {
        generatedSurvey: {
          tidalEffectsMeters: [30.6, 0.24],
          totalTidalEffectsMeters: 30.84,
        },
      },
    });

    expect(context).toEqual({
      totalTidalEffectsMeters: 30.84,
      tidalEffectsMeters: [30.6, 0.24],
      tidalStressFactor: 3,
    });
  });

  it("preserves explicit tidal heating factor when present in persisted survey metadata", () => {
    const context = deriveSystemGenerationContext({
      metadata: {
        generatedSurvey: {
          tidalHeatingFactor: 14,
        },
      },
    });

    expect(context).toEqual({
      tidalHeatingFactor: 14,
    });
  });

  it("derives tidal totals from persisted stars and moon orbits when explicit totals are missing", () => {
    const context = deriveSystemGenerationContext({
      metadata: {
        generatedSurvey: {
          stars: [{ massInSolarMasses: 1 }],
          worldPlacement: {
            slots: [
              {
                slotId: "P-1",
                orbit: 1,
                significantMoonCount: 2,
                significantMoonSizeDetails: [
                  { sizeValue: 5, isRing: false },
                  { sizeValue: 3, isRing: false },
                ],
                significantMoonOrbitDetails: [
                  { massEarth: 0.5, period: { orbitKm: 200_000 } },
                  { massEarth: 0.2, period: { orbitKm: 300_000 } },
                ],
              },
            ],
          },
          mainworldCandidates: {
            candidates: [
              {
                slotId: "P-1",
                isMoon: false,
                sizeValue: 8,
                orbit: 1,
                effectiveDeviation: 0,
                meanTemperatureModel: { distanceAu: 1 },
              },
            ],
          },
        },
      },
    });

    expect(context).toEqual(
      expect.objectContaining({
        tidalEffectsMeters: [0.25, 156.25, 18.5185],
        totalTidalEffectsMeters: 175.0185,
        tidalStressFactor: 17,
      }),
    );
  });

  it("derives tidal heating factor for a moon candidate from persisted orbital data", () => {
    const context = deriveSystemGenerationContext({
      metadata: {
        generatedSurvey: {
          stars: [{ massInSolarMasses: 1 }],
          worldPlacement: {
            slots: [
              {
                slotId: "GG-1",
                orbit: 1,
                gasGiantMassEarth: 317.8,
                significantMoonCount: 1,
                significantMoonSizeDetails: [{ sizeValue: 2.3, isRing: false }],
                significantMoonOrbitDetails: [
                  {
                    massEarth: 0.015,
                    period: { orbitKm: 421_700, periodDays: 1.769 },
                    eccentricityRoll: { eccentricity: 0.0041 },
                  },
                ],
              },
            ],
          },
          mainworldCandidates: {
            candidates: [
              {
                slotId: "GG-1",
                isMoon: true,
                moonIndex: 0,
                sizeValue: 2.3,
                orbit: 1,
                effectiveDeviation: 0,
              },
            ],
          },
        },
      },
    });

    expect(context).toEqual(
      expect.objectContaining({
        tidalHeatingFactor: 102,
      }),
    );
  });
});

describe("buildGeneratedSurveyPayload", () => {
  it("builds deterministic seasonal and seismic survey values", () => {
    const rng = createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]);

    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      temperatureScenarioSettings: {
        dateSolarDays: 150,
        solarDaysPerYear: 400,
      },
      systemContext: {
        systemAgeGyr: 4.5,
        density: 1.1,
        moonSizesPool: [2, 3],
        moonCountDefault: 2,
      },
      rng,
    });

    expect(payload.axialTilt).toBe(20);
    expect(payload.dayLengthHours).toBe(25);
    expect(payload.magnetosphere).toBe("Absent");
    expect(payload.moons).toBe(2);
    expect(payload.moonSizes).toEqual([2, 3]);

    expect(payload.meanTempC).toBe(28);
    expect(payload.seasonalTempOffsetC).toBe(-5);
    expect(payload.avgTempC).toBe(23);
    expect(payload.tempCategory).toBe("Temperate");
    expect(payload.apiTemperature).toBe("Temperate");
    expect(payload.orbitalPeriodDays).toBe(400);

    expect(payload.systemAgeGyr).toBe(4.5);
    expect(payload.density).toBe(1.1);
    expect(payload.seismicStressDm).toBe(7);
    expect(payload.seismicPreSquare).toBe(10);
    expect(payload.seismicStress).toBe(100);
    expect(payload.totalTidalEffectsMeters).toBe(0);
    expect(payload.tidalEffectsMeters).toEqual([]);
    expect(payload.tidalStressFactor).toBe(0);
    expect(payload.tidalHeatingFactor).toBe(0);
    expect(payload.totalSeismicStress).toBe(100);
  });

  it("calculates tidal stress factor from summed tidal effects", () => {
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      systemContext: {
        totalTidalEffectsMeters: 30.84,
        tidalEffectsMeters: [30.6, 0.24],
      },
      rng: createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]),
    });

    expect(payload.totalTidalEffectsMeters).toBe(30.84);
    expect(payload.tidalEffectsMeters).toEqual([30.6, 0.24]);
    expect(payload.tidalStressFactor).toBe(3);
    expect(payload.tidalHeatingFactor).toBe(0);
  });

  it("totalSeismicStress is the sum of seismicStress, tidalStressFactor, and tidalHeatingFactor", () => {
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      systemContext: {
        systemAgeGyr: 4.5,
        density: 1.1,
        moonSizesPool: [2, 3],
        moonCountDefault: 2,
        totalTidalEffectsMeters: 30.84,
        tidalHeatingFactor: 14,
      },
      rng: createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]),
    });

    // seismicStress=100 (same inputs as previous test), tidalStressFactor=3, tidalHeatingFactor=14
    expect(payload.seismicStress).toBe(100);
    expect(payload.tidalStressFactor).toBe(3);
    expect(payload.tidalHeatingFactor).toBe(14);
    expect(payload.totalSeismicStress).toBe(117);
  });

  it("preserves explicit tidalStressFactor when no tidal totals are provided", () => {
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      systemContext: {
        tidalStressFactor: 2,
      },
      rng: createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]),
    });

    expect(payload.totalTidalEffectsMeters).toBe(0);
    expect(payload.tidalEffectsMeters).toEqual([]);
    expect(payload.tidalStressFactor).toBe(2);
    expect(payload.tidalHeatingFactor).toBe(0);
  });

  it("preserves tidalHeatingFactor from system context", () => {
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      systemContext: {
        tidalHeatingFactor: 14,
      },
      rng: createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]),
    });

    expect(payload.tidalHeatingFactor).toBe(14);
  });

  it("includes majorTectonicPlates in the payload using tectonicRoll2D from rng sequence", () => {
    // rng sequence: first 6 values drive existing fields; values 7-8 (0.5, 0.5) drive tectonicRoll2D
    // tectonicRoll2D = (1 + floor(0.5 * 6)) + (1 + floor(0.5 * 6)) = 4 + 4 = 8
    // totalSeismicStress = 100 (stress >= 10 but <= 100 → DM+1)
    // majorTectonicPlates = size(8) + hydro(4) - roll(8) + DM(1) = 5
    const rng = createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4, 0.5, 0.5]);
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 4,
      starTempMod: 0,
      systemContext: {
        systemAgeGyr: 4.5,
        density: 1.1,
        moonSizesPool: [2, 3],
        moonCountDefault: 2,
      },
      rng,
    });

    expect(payload.totalSeismicStress).toBe(100);
    expect(payload.majorTectonicPlates).toBe(5);
  });

  it("majorTectonicPlates is 0 when hydrographics is 0", () => {
    const payload = buildGeneratedSurveyPayload({
      size: 8,
      atmosphereCode: 8,
      hydrographics: 0,
      starTempMod: 0,
      systemContext: {
        systemAgeGyr: 4.5,
        density: 1.1,
      },
      rng: createSequenceRng([0.5, 0.2, 0.9, 0.0, 0.9, 0.4]),
    });

    expect(payload.majorTectonicPlates).toBe(0);
  });
});
