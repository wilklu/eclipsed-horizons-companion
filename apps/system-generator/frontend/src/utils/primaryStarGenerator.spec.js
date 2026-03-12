import { describe, expect, it } from "vitest";
import {
  applyStarSystemDesignations,
  calculateAbsoluteMagnitude,
  calculateEccentricityFirstRollDm,
  calculateEvolutionaryStatus,
  calculateMainSequenceLifetime,
  calculateMultipleStarPresenceDm,
  calculateNonPrimaryStarDm,
  calculateOrbitSeparationBounds,
  calculateMainSequenceLifespanGyr,
  calculateStarOrbitPeriodYears,
  calculateStarFinalAgeGyr,
  calculateLuminosityFromDiameterAndTemperature,
  checkSystemStability,
  convertAuToOrbitNumber,
  convertOrbitPeriodYearsToDays,
  convertOrbitPeriodYearsToHours,
  convertOrbitNumberToAu,
  deriveMaoOrbitNumber,
  estimateRotationPeriod,
  estimateStarDiameter,
  estimateStarMassAndTemperature,
  generateFractionalOrbitNumber,
  generateOrbitEccentricity,
  generateMultipleStarLayout,
  generateNonPrimaryStar,
  generatePrimaryStar,
  generateStarAge,
  generateStarSubtype,
  generateStellarOrbitPlacement,
  generateSystemAge,
  getStarVisualColor,
  remediateOrbitCrossings,
  toPersistedSpectralClass,
} from "./primaryStarGenerator.js";

function d6ToRandomValue(face) {
  return (face - 0.01) / 6;
}

function d3ToRandomValue(face) {
  return (face - 0.01) / 3;
}

function d10ToRandomValue(face) {
  return (face - 0.01) / 10;
}

function d100ToRandomValue(face) {
  return (face - 0.01) / 100;
}

function queuedRng(values) {
  let index = 0;
  return () => {
    const value = values[index];
    index += 1;
    return value ?? 0;
  };
}

describe("generatePrimaryStar", () => {
  it("generates an M-type main sequence star on a Type roll of 3", () => {
    const rng = queuedRng([d6ToRandomValue(1), d6ToRandomValue(2), 0.2]);

    const result = generatePrimaryStar({ rng });

    expect(result.spectralType).toBe("M");
    expect(result.luminosityClass).toBe("V");
    expect(result.designation).toMatch(/^M\dV$/);
  });

  it("handles Hot table rolls when Type roll is 12+", () => {
    const rng = queuedRng([d6ToRandomValue(6), d6ToRandomValue(6), d6ToRandomValue(6), d6ToRandomValue(6), 0.4]);

    const result = generatePrimaryStar({ rng });

    expect(result.spectralType).toBe("O");
    expect(result.luminosityClass).toBe("V");
    expect(result.designation).toMatch(/^O\dV$/);
  });

  it("applies Class IV M-type remapping to the Type roll", () => {
    const rng = queuedRng([
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(3),
      d6ToRandomValue(3),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      0.95,
    ]);

    const result = generatePrimaryStar({ rng });

    expect(result.luminosityClass).toBe("IV");
    expect(result.spectralType).toBe("K");
    expect(result.spectralDecimal).toBeLessThanOrEqual(4);
  });

  it("applies Class VI F->G remapping", () => {
    const rng = queuedRng([
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(2),
      d6ToRandomValue(4),
      d6ToRandomValue(6),
      0.3,
    ]);

    const result = generatePrimaryStar({ rng });

    expect(result.luminosityClass).toBe("VI");
    expect(result.spectralType).toBe("G");
  });

  it("generates peculiar objects via Special->Unusual->Peculiar", () => {
    const rng = queuedRng([
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
    ]);

    const result = generatePrimaryStar({ rng });

    expect(result.objectType).toBe("peculiar");
    expect(result.designation).toBe("Black Hole");
    expect(toPersistedSpectralClass(result)).toBe("WD");
  });
});

describe("generateStarSubtype", () => {
  it("uses Numeric column for non-M stars", () => {
    const rng = queuedRng([d6ToRandomValue(1), d6ToRandomValue(5)]); // 2D=6 => Numeric 7

    const result = generateStarSubtype({
      spectralType: "G",
      luminosityClass: "V",
      isPrimary: true,
      rng,
    });

    expect(result.method).toBe("numeric");
    expect(result.subtypeRoll).toBe(6);
    expect(result.subtype).toBe(7);
  });

  it("uses primary M-type column for primary M stars", () => {
    const rng = queuedRng([d6ToRandomValue(1), d6ToRandomValue(5)]); // 2D=6 => M-primary 0

    const result = generateStarSubtype({
      spectralType: "M",
      luminosityClass: "V",
      isPrimary: true,
      rng,
    });

    expect(result.method).toBe("m-primary");
    expect(result.subtypeRoll).toBe(6);
    expect(result.subtype).toBe(0);
  });

  it("reduces K IV subtype above 4 by 5", () => {
    const rng = queuedRng([d6ToRandomValue(3), d6ToRandomValue(6)]); // 2D=9 => Numeric 6 => adjusted to 1

    const result = generateStarSubtype({
      spectralType: "K",
      luminosityClass: "IV",
      isPrimary: true,
      rng,
    });

    expect(result.method).toBe("numeric");
    expect(result.subtypeRoll).toBe(9);
    expect(result.adjustedForClassIvK).toBe(true);
    expect(result.subtype).toBe(1);
  });
});

describe("estimateStarMassAndTemperature", () => {
  it("interpolates base mass and temperature for G7 V as in the worked example", () => {
    const result = estimateStarMassAndTemperature({
      spectralType: "G",
      subtype: 7,
      luminosityClass: "V",
      applyMassVariance: false,
    });

    expect(result).not.toBeNull();
    expect(result.baseMass).toBeCloseTo(0.86, 6);
    expect(result.massInSolarMasses).toBeCloseTo(0.86, 6);
    expect(result.temperatureK).toBe(5440);
    expect(result.appliedVariance).toBeNull();
  });

  it("applies optional 2D-7 mass variance", () => {
    const rng = queuedRng([d6ToRandomValue(4), d6ToRandomValue(5)]); // 2D=9 => +0.4 of variance

    const result = estimateStarMassAndTemperature({
      spectralType: "G",
      subtype: 7,
      luminosityClass: "V",
      rng,
      applyMassVariance: true,
      normalVariancePct: 0.2,
    });

    expect(result).not.toBeNull();
    expect(result.massInSolarMasses).toBeCloseTo(0.9288, 6);
    expect(result.appliedVariance?.rawRoll).toBe(9);
    expect(result.appliedVariance?.normalized).toBeCloseTo(0.4, 6);
  });
});

describe("estimateStarDiameter", () => {
  it("interpolates base diameter for G7 V as in the worked example", () => {
    const result = estimateStarDiameter({
      spectralType: "G",
      subtype: 7,
      luminosityClass: "V",
      applyDiameterVariance: false,
    });

    expect(result).not.toBeNull();
    expect(result.baseDiameter).toBeCloseTo(0.93, 6);
    expect(result.diameterInSolarDiameters).toBeCloseTo(0.93, 6);
    expect(result.appliedVariance).toBeNull();
  });

  it("applies optional 2D-7 diameter variance", () => {
    const rng = queuedRng([d6ToRandomValue(3), d6ToRandomValue(5)]); // 2D=8 => +0.2 of variance

    const result = estimateStarDiameter({
      spectralType: "G",
      subtype: 7,
      luminosityClass: "V",
      rng,
      applyDiameterVariance: true,
      normalVariancePct: 0.2,
    });

    expect(result).not.toBeNull();
    expect(result.diameterInSolarDiameters).toBeCloseTo(0.9672, 6);
    expect(result.appliedVariance?.rawRoll).toBe(8);
    expect(result.appliedVariance?.normalized).toBeCloseTo(0.2, 6);
  });
});

describe("calculateLuminosityFromDiameterAndTemperature", () => {
  it("returns 1 for Sol-equivalent diameter and temperature", () => {
    const result = calculateLuminosityFromDiameterAndTemperature({
      diameterInSolarDiameters: 1,
      temperatureK: 5772,
    });

    expect(result).toBeCloseTo(1, 10);
  });

  it("matches formula output for G7 V worked example inputs", () => {
    const result = calculateLuminosityFromDiameterAndTemperature({
      diameterInSolarDiameters: 0.93,
      temperatureK: 5440,
    });

    const expected = 0.93 ** 2 * (5440 / 5772) ** 4;
    expect(result).toBeCloseTo(expected, 10);
  });
});

describe("generateStarAge", () => {
  it("uses the small-star age formula for low-mass main-sequence stars", () => {
    const rng = queuedRng([d6ToRandomValue(3), d3ToRandomValue(2), d10ToRandomValue(7)]);

    const result = generateStarAge({
      star: {
        designation: "K4V",
        spectralType: "K",
        luminosityClass: "V",
        massInSolarMasses: 0.8,
      },
      rng,
      detailDigits: 1,
    });

    expect(result).not.toBeNull();
    expect(result.ageType).toBe("normal");
    expect(result.stage).toBe("main-sequence-small");
    expect(result.ageGyr).toBeCloseTo(6.7, 10);
  });

  it("uses large-star linear lifespan fraction for higher-mass main-sequence stars", () => {
    const rng = queuedRng([d100ToRandomValue(50)]);

    const result = generateStarAge({
      star: {
        designation: "A5V",
        spectralType: "A",
        luminosityClass: "V",
        massInSolarMasses: 2,
      },
      rng,
    });

    const expected = calculateMainSequenceLifespanGyr({ massInSolarMasses: 2 }) * 0.5;
    expect(result).not.toBeNull();
    expect(result.stage).toBe("main-sequence-large");
    expect(result.ageGyr).toBeCloseTo(expected, 10);
  });

  it("uses subgiant total-age formula for Class IV stars", () => {
    const rng = queuedRng([d100ToRandomValue(40)]);

    const result = generateStarAge({
      star: {
        designation: "G2IV",
        spectralType: "G",
        luminosityClass: "IV",
        massInSolarMasses: 1,
      },
      rng,
    });

    expect(result).not.toBeNull();
    expect(result.stage).toBe("subgiant");
    expect(result.ageGyr).toBeCloseTo(10.8, 10);
  });

  it("uses giant total-age formula for Class III stars", () => {
    const rng = queuedRng([d100ToRandomValue(25)]);

    const result = generateStarAge({
      star: {
        designation: "G2III",
        spectralType: "G",
        luminosityClass: "III",
        massInSolarMasses: 1,
      },
      rng,
    });

    expect(result).not.toBeNull();
    expect(result.stage).toBe("giant");
    expect(result.ageGyr).toBeCloseTo(12.25, 10);
  });

  it("includes progenitor lifetime for white dwarfs", () => {
    const rng = queuedRng([d6ToRandomValue(2), d3ToRandomValue(2), d10ToRandomValue(5), d3ToRandomValue(3)]);

    const result = generateStarAge({
      star: {
        designation: "WD",
        spectralType: "WD",
        luminosityClass: "D",
        massInSolarMasses: 0.6,
      },
      rng,
    });

    const expectedFinalAge = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: 3 });
    expect(result).not.toBeNull();
    expect(result.ageType).toBe("white-dwarf");
    expect(result.postStellarAgeGyr).toBeCloseTo(4.5, 10);
    expect(result.progenitorMassInSolarMasses).toBeCloseTo(3, 10);
    expect(result.progenitorFinalAgeGyr).toBeCloseTo(expectedFinalAge, 10);
    expect(result.ageGyr).toBeCloseTo(expectedFinalAge + 4.5, 10);
  });

  it("uses short pulsar phase plus progenitor final age", () => {
    const rng = queuedRng([d10ToRandomValue(5), d10ToRandomValue(5), d3ToRandomValue(2)]);

    const result = generateStarAge({
      star: {
        designation: "Pulsar",
        spectralType: null,
        luminosityClass: null,
        massInSolarMasses: 1.4,
      },
      rng,
    });

    const expectedFinalAge = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: 8 });
    expect(result).not.toBeNull();
    expect(result.ageType).toBe("pulsar");
    expect(result.postStellarAgeGyr).toBeCloseTo(0.01, 10);
    expect(result.progenitorMassInSolarMasses).toBeCloseTo(8, 10);
    expect(result.ageGyr).toBeCloseTo(expectedFinalAge + 0.01, 10);
  });
});

describe("generateSystemAge", () => {
  it("uses post-stellar companions as a minimum system age constraint", () => {
    const rng = queuedRng([
      d6ToRandomValue(1),
      d3ToRandomValue(1),
      d10ToRandomValue(1),
      d6ToRandomValue(2),
      d3ToRandomValue(2),
      d10ToRandomValue(5),
      d3ToRandomValue(1),
    ]);

    const result = generateSystemAge({
      stars: [
        {
          designation: "K5V",
          spectralType: "K",
          luminosityClass: "V",
          massInSolarMasses: 0.8,
        },
        {
          designation: "WD",
          spectralType: "WD",
          luminosityClass: "D",
          massInSolarMasses: 0.6,
        },
      ],
      rng,
    });

    expect(result).not.toBeNull();
    expect(result.usesPostStellarMinimum).toBe(true);
    expect(result.primaryAgeGyr).toBeCloseTo(1.1, 10);
    expect(result.postStellarMinimumAgeGyr).toBeCloseTo(result.starAges[1].ageGyr, 10);
    expect(result.systemAgeGyr).toBeCloseTo(result.starAges[1].ageGyr, 10);
  });

  it("reverse-engineers post-stellar progenitor mass to fit a main-sequence primary lifespan cap", () => {
    const rng = queuedRng([
      d100ToRandomValue(50),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d3ToRandomValue(1),
      d10ToRandomValue(1),
      d3ToRandomValue(1),
    ]);

    const result = generateSystemAge({
      stars: [
        {
          designation: "F0V",
          spectralType: "F",
          luminosityClass: "V",
          massInSolarMasses: 1.59,
        },
        {
          designation: "WD",
          spectralType: "WD",
          luminosityClass: "D",
          massInSolarMasses: 0.6,
        },
      ],
      rng,
    });

    const primary = result.starAges[0];
    const remnant = result.starAges[1];

    expect(result.usesMainSequenceCompatibilityAdjustment).toBe(true);
    expect(result.hasUnresolvedMainSequenceCompatibility).toBe(false);
    expect(remnant.mainSequenceCompatibilityAdjustment?.applied).toBe(true);
    expect(remnant.mainSequenceCompatibilityAdjustment?.adjustedProgenitorMassInSolarMasses).toBeGreaterThan(
      remnant.mainSequenceCompatibilityAdjustment?.originalProgenitorMassInSolarMasses,
    );
    expect(remnant.ageGyr).toBeLessThanOrEqual(primary.mainSequenceLifespanGyr + 1e-6);
    expect(result.systemAgeGyr).toBeLessThanOrEqual(primary.mainSequenceLifespanGyr + 1e-6);
  });

  it("flags unresolved compatibility when post-stellar elapsed age alone exceeds primary lifespan", () => {
    const rng = queuedRng([
      d100ToRandomValue(50),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d3ToRandomValue(1),
      d10ToRandomValue(1),
      d3ToRandomValue(1),
    ]);

    const result = generateSystemAge({
      stars: [
        {
          designation: "A0V",
          spectralType: "A",
          luminosityClass: "V",
          massInSolarMasses: 2.5,
        },
        {
          designation: "WD",
          spectralType: "WD",
          luminosityClass: "D",
          massInSolarMasses: 0.6,
        },
      ],
      rng,
    });

    const remnant = result.starAges[1];
    expect(result.usesMainSequenceCompatibilityAdjustment).toBe(false);
    expect(result.hasUnresolvedMainSequenceCompatibility).toBe(true);
    expect(remnant.mainSequenceCompatibilityAdjustment?.unresolved).toBe(true);
  });
});

describe("generateMultipleStarLayout", () => {
  it("applies +1 DM for Class IV primary stars", () => {
    const dmInfo = calculateMultipleStarPresenceDm({
      primaryStar: {
        spectralType: "G",
        luminosityClass: "IV",
      },
    });

    expect(dmInfo.dm).toBe(1);
  });

  it("applies -1 DM for Class V M-type primary stars", () => {
    const dmInfo = calculateMultipleStarPresenceDm({
      primaryStar: {
        spectralType: "M",
        luminosityClass: "V",
      },
    });

    expect(dmInfo.dm).toBe(-1);
  });

  it("does not allow Close secondaries for Class III primaries", () => {
    const rng = queuedRng([
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
    ]);

    const result = generateMultipleStarLayout({
      primaryStar: {
        spectralType: "G",
        luminosityClass: "III",
      },
      rng,
    });

    expect(result.closeAllowed).toBe(false);
    expect(result.rolls.close?.skipped).toBe(true);
    expect(result.slots.some((slot) => slot.orbitClass === "Close")).toBe(false);
  });

  it("rolls companion presence for each present secondary orbit", () => {
    const rng = queuedRng([
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(5),
      d6ToRandomValue(1),
      d6ToRandomValue(1),
    ]);

    const result = generateMultipleStarLayout({
      primaryStar: {
        spectralType: "A",
        luminosityClass: "V",
      },
      rng,
    });

    expect(result.dm).toBe(1);
    expect(result.rolls.primaryCompanion.present).toBe(true);
    expect(result.rolls.close?.present).toBe(true);
    expect(result.rolls.closeCompanion?.present).toBe(false);
    expect(result.rolls.near?.present).toBe(true);
    expect(result.rolls.nearCompanion?.present).toBe(true);
    expect(result.rolls.far?.present).toBe(false);
    expect(result.totalStars).toBe(5);
  });
});

describe("generateNonPrimaryStar", () => {
  it("applies DM-1 for Class III and IV parent stars", () => {
    const classIv = calculateNonPrimaryStarDm({
      parentStar: {
        spectralType: "G",
        luminosityClass: "IV",
      },
    });
    const classIii = calculateNonPrimaryStarDm({
      parentStar: {
        spectralType: "K",
        luminosityClass: "III",
      },
    });

    expect(classIv.dm).toBe(-1);
    expect(classIii.dm).toBe(-1);
  });

  it("uses post-stellar column for post-stellar parents", () => {
    const rng = queuedRng([d6ToRandomValue(4), d6ToRandomValue(5)]); // total 9 => Lesser on post-stellar

    const result = generateNonPrimaryStar({
      parentStar: {
        designation: "Black Hole",
        luminosityClass: null,
        spectralType: null,
      },
      column: "companion",
      rng,
    });

    expect(result.column).toBe("postStellar");
    expect(result.relation).toBe("Lesser");
    expect(result.descriptor.mode).toBe("designation");
    expect(result.descriptor.designation).toBe("Neutron Star");
  });

  it("converts lesser M-type with higher subtype to brown dwarf", () => {
    const rng = queuedRng([d6ToRandomValue(3), d6ToRandomValue(4), 0.95]); // total 7 => Lesser, subtype 9

    const result = generateNonPrimaryStar({
      parentStar: {
        designation: "M2V",
        spectralType: "M",
        luminosityClass: "V",
        spectralClass: "M2 V",
      },
      column: "secondary",
      rng,
    });

    expect(result.relation).toBe("Lesser");
    expect(result.descriptor.mode).toBe("spectral");
    expect(result.descriptor.luminosityClass).toBe("BD");
    expect(result.descriptor.spectralType).toBe("L");
  });

  it("resolves Other results using the Other column", () => {
    const rng = queuedRng([
      d6ToRandomValue(1),
      d6ToRandomValue(1), // secondary <=2 => Other
      d6ToRandomValue(1),
      d6ToRandomValue(1), // other <=2 => NS
    ]);

    const result = generateNonPrimaryStar({
      parentStar: {
        designation: "G2V",
        spectralType: "G",
        luminosityClass: "V",
      },
      column: "secondary",
      rng,
    });

    expect(result.relation).toBe("Other");
    expect(result.descriptor.mode).toBe("designation");
    expect(result.descriptor.designation).toBe("Neutron Star");
  });

  it("forces sibling determination for brown dwarf parents", () => {
    const result = generateNonPrimaryStar({
      parentStar: {
        designation: "L5BD",
        spectralType: "L",
        luminosityClass: "BD",
        spectralClass: "L5 BD",
      },
      column: "secondary",
      rng: queuedRng([d6ToRandomValue(3)]),
    });

    expect(result.relation).toBe("Sibling");
    expect(result.descriptor.mode).toBe("spectral");
    expect(result.descriptor.luminosityClass).toBe("BD");
  });
});

describe("Orbit# utilities", () => {
  it("converts fractional Orbit# to AU via interpolation", () => {
    const result = convertOrbitNumberToAu({ orbitNumber: 4.3 });
    expect(result).toBeCloseTo(1.96, 10);
  });

  it("converts AU back to fractional Orbit#", () => {
    const result = convertAuToOrbitNumber({ au: 3.4 });
    expect(result).toBeCloseTo(5.25, 10);
  });

  it("generates fractional Orbit# for whole orbit values >= 1", () => {
    const rng = queuedRng([d10ToRandomValue(6)]);
    const result = generateFractionalOrbitNumber({
      wholeOrbitNumber: 2,
      rng,
    });

    expect(result).toBeCloseTo(2.1, 10);
  });

  it("generates fractional Orbit# in Orbit#0 range", () => {
    const rng = queuedRng([d10ToRandomValue(10)]);
    const result = generateFractionalOrbitNumber({
      wholeOrbitNumber: 0,
      rng,
    });

    expect(result).toBeCloseTo(0.5, 10);
  });

  it("derives MAO Orbit# from giant stellar diameter", () => {
    const result = deriveMaoOrbitNumber({
      luminosityClass: "III",
      diameterInSolarDiameters: 50,
    });

    expect(result).toBeCloseTo(2.7683, 10);
  });

  it("returns null MAO for non-giant luminosity classes", () => {
    const result = deriveMaoOrbitNumber({
      luminosityClass: "V",
      diameterInSolarDiameters: 50,
    });

    expect(result).toBeNull();
  });

  it("computes first-roll eccentricity DM modifiers", () => {
    const result = calculateEccentricityFirstRollDm({
      isStar: true,
      directlyOrbitedStarCount: 3,
      orbitNumber: 0.8,
      systemAgeGyr: 5,
    });

    expect(result.dm).toBe(3);
  });

  it("generates eccentricity from <=5 band", () => {
    const rng = queuedRng([d6ToRandomValue(1), d6ToRandomValue(1), d6ToRandomValue(6)]);
    const result = generateOrbitEccentricity({ rng });

    expect(result.firstRollTotal).toBe(2);
    expect(result.eccentricity).toBeCloseTo(0.005, 10);
  });

  it("generates eccentricity from 10 band with star DM", () => {
    const rng = queuedRng([d6ToRandomValue(4), d6ToRandomValue(4), d6ToRandomValue(2)]);
    const result = generateOrbitEccentricity({
      rng,
      isStar: true,
    });

    expect(result.firstRollTotal).toBe(10);
    expect(result.eccentricity).toBeCloseTo(0.15, 10);
  });

  it("calculates minimum and maximum separation from eccentricity", () => {
    const result = calculateOrbitSeparationBounds({
      au: 10,
      eccentricity: 0.2,
    });

    expect(result.minimumSeparationAu).toBeCloseTo(8, 10);
    expect(result.maximumSeparationAu).toBeCloseTo(12, 10);
  });

  it("calculates stellar orbit period from AU and combined masses", () => {
    const result = calculateStarOrbitPeriodYears({
      separationAu: 4,
      primaryMassInSolarMasses: 1,
      secondaryMassInSolarMasses: 1,
    });

    expect(result).toBeCloseTo(Math.sqrt(32), 10);
  });

  it("converts stellar orbit period from years to days and hours", () => {
    const periodYears = 0.5;
    const days = convertOrbitPeriodYearsToDays({ periodYears });
    const hours = convertOrbitPeriodYearsToHours({ periodYears });

    expect(days).toBeCloseTo(182.625, 10);
    expect(hours).toBeCloseTo(4383, 10);
  });
});

describe("generateStellarOrbitPlacement", () => {
  it("uses Table 7 close orbit generation with fractional variance", () => {
    const rng = queuedRng([d6ToRandomValue(1), d10ToRandomValue(10)]); // 0.5 + 0.5 => 1.0
    const result = generateStellarOrbitPlacement({
      orbitClass: "Close",
      rng,
      addNonCompanionFractionalVariance: true,
      extraFractionalDigits: 0,
    });

    expect(result.orbitNumber).toBeCloseTo(1.0, 10);
    expect(result.orbitAu).toBeCloseTo(0.4, 10);
    expect(result.eccentricity).toBeGreaterThanOrEqual(0);
    expect(result.minimumSeparationAu).toBeCloseTo(result.orbitAu * (1 - result.eccentricity), 8);
    expect(result.maximumSeparationAu).toBeCloseTo(result.orbitAu * (1 + result.eccentricity), 8);
  });

  it("uses default companion formula when giant MAO is unavailable", () => {
    const rng = queuedRng([d6ToRandomValue(6), d6ToRandomValue(6), d6ToRandomValue(6)]); // 0.6 + 0.05
    const result = generateStellarOrbitPlacement({
      orbitClass: "Companion",
      parentLuminosityClass: "III",
      rng,
      extraFractionalDigits: 0,
    });

    expect(result.usedGiantCompanionMaoRule).toBe(false);
    expect(result.orbitNumber).toBeCloseTo(0.65, 10);
    expect(result.notes.some((note) => note.includes("MAO unavailable"))).toBe(true);
  });

  it("uses giant companion MAO rule when MAO is provided", () => {
    const rng = queuedRng([d6ToRandomValue(4)]);
    const result = generateStellarOrbitPlacement({
      orbitClass: "Companion",
      parentLuminosityClass: "Ib",
      parentMaoOrbitNumber: 0.2,
      rng,
      extraFractionalDigits: 0,
    });

    expect(result.usedGiantCompanionMaoRule).toBe(true);
    expect(result.orbitNumber).toBeCloseTo(0.8, 10);
  });

  it("derives giant companion MAO from parent diameter when explicit MAO is missing", () => {
    const rng = queuedRng([d6ToRandomValue(3)]);
    const expectedMao = deriveMaoOrbitNumber({
      luminosityClass: "III",
      diameterInSolarDiameters: 50,
    });
    const result = generateStellarOrbitPlacement({
      orbitClass: "Companion",
      parentLuminosityClass: "III",
      parentDiameterInSolarDiameters: 50,
      rng,
      extraFractionalDigits: 0,
    });

    expect(result.usedGiantCompanionMaoRule).toBe(true);
    expect(result.parentMaoOrbitNumber).toBeCloseTo(expectedMao, 10);
    expect(result.orbitNumber).toBeCloseTo(3 * expectedMao, 10);
    expect(result.notes.some((note) => note.includes("derived from giant stellar diameter"))).toBe(true);
  });
});

describe("remediateOrbitCrossings", () => {
  it("bumps the outer crossing orbit until separation bands no longer overlap", () => {
    const result = remediateOrbitCrossings({
      placements: [
        {
          id: "inner",
          orbitNumber: 4,
          eccentricity: 0.5,
        },
        {
          id: "outer",
          orbitNumber: 4.1,
          eccentricity: 0.5,
        },
      ],
    });

    const outer = result.placements.find((entry) => entry.id === "outer");
    const inner = result.placements.find((entry) => entry.id === "inner");

    expect(result.hadCrossings).toBe(true);
    expect(result.unresolvedCrossings).toBe(false);
    expect(result.adjustments.length).toBeGreaterThan(0);
    expect(outer.orbitNumber).toBeGreaterThan(4.1);
    expect(outer.minimumSeparationAu).toBeGreaterThan(inner.maximumSeparationAu);
  });

  it("reports unresolved crossings when capped at max orbit", () => {
    const result = remediateOrbitCrossings({
      placements: [
        {
          id: "inner",
          orbitNumber: 20,
          eccentricity: 0.9,
        },
        {
          id: "outer",
          orbitNumber: 20,
          eccentricity: 0.9,
        },
      ],
      maxIterations: 5,
    });

    expect(result.hadCrossings).toBe(true);
    expect(result.unresolvedCrossings).toBe(true);
  });
});

describe("applyStarSystemDesignations", () => {
  it("assigns A/B designations for binary systems", () => {
    const result = applyStarSystemDesignations({
      stars: [{ designation: "G2V" }, { designation: "K4V" }],
      generatedSlotEntries: [{ slot: { id: "manual-near", orbitClass: "Near", parentId: "primary" }, starIndex: 1 }],
    });

    expect(result.stars[0].systemDesignation).toBe("A");
    expect(result.stars[1].systemDesignation).toBe("B");
    expect(result.stars[1].systemDesignationCombined).toBe("B");
  });

  it("assigns companion and combined labels in higher multiplicity systems", () => {
    const stars = [{ designation: "G2V" }, {}, {}, {}, {}, {}];
    const generatedSlotEntries = [
      { slot: { id: "primary-companion", orbitClass: "Companion", parentId: "primary" }, starIndex: 1 },
      { slot: { id: "close", orbitClass: "Close", parentId: "primary" }, starIndex: 2 },
      { slot: { id: "near", orbitClass: "Near", parentId: "primary" }, starIndex: 3 },
      { slot: { id: "near-companion", orbitClass: "Companion", parentId: "near" }, starIndex: 4 },
      { slot: { id: "far", orbitClass: "Far", parentId: "primary" }, starIndex: 5 },
    ];

    const result = applyStarSystemDesignations({ stars, generatedSlotEntries });

    expect(result.stars[0].systemDesignation).toBe("Aa");
    expect(result.stars[0].systemDesignationCombined).toBe("Aab");
    expect(result.stars[1].systemDesignation).toBe("Ab");
    expect(result.stars[2].systemDesignation).toBe("B");
    expect(result.stars[3].systemDesignation).toBe("Ca");
    expect(result.stars[3].systemDesignationCombined).toBe("Cab");
    expect(result.stars[4].systemDesignation).toBe("Cb");
    expect(result.stars[5].systemDesignation).toBe("D");
  });
});

describe("Star Properties - Enhanced Features", () => {
  describe("calculateAbsoluteMagnitude", () => {
    it("calculates Mv = 4.83 for solar luminosity", () => {
      const mv = calculateAbsoluteMagnitude({ luminosity: 1.0 });
      expect(mv).toBeCloseTo(4.83, 1);
    });

    it("calculates correct magnitude for higher luminosity", () => {
      // Mv = 4.83 - 2.5 * log10(100) = 4.83 - 5 = -0.17
      const mv = calculateAbsoluteMagnitude({ luminosity: 100 });
      expect(mv).toBeCloseTo(-0.17, 1);
    });

    it("returns null for invalid luminosity", () => {
      expect(calculateAbsoluteMagnitude({ luminosity: 0 })).toBeNull();
      expect(calculateAbsoluteMagnitude({ luminosity: -1 })).toBeNull();
      expect(calculateAbsoluteMagnitude({})).toBeNull();
    });
  });

  describe("getStarVisualColor", () => {
    it("returns correct colors for spectral types", () => {
      expect(getStarVisualColor({ spectralClass: "O" })).toBe("#6699ff");
      expect(getStarVisualColor({ spectralClass: "B" })).toBe("#aaccff");
      expect(getStarVisualColor({ spectralClass: "A" })).toBe("#ffffff");
      expect(getStarVisualColor({ spectralClass: "F" })).toBe("#ffffcc");
      expect(getStarVisualColor({ spectralClass: "G" })).toBe("#ffff44");
      expect(getStarVisualColor({ spectralClass: "K" })).toBe("#ff8844");
      expect(getStarVisualColor({ spectralClass: "M" })).toBe("#ff4444");
    });

    it("returns white for unknown spectral class", () => {
      expect(getStarVisualColor({ spectralClass: "X" })).toBe("#ffffff");
      expect(getStarVisualColor({})).toBe("#ffffff");
    });

    it("handles lowercase spectral classes", () => {
      expect(getStarVisualColor({ spectralClass: "g2v" })).toBe("#ffff44");
    });
  });

  describe("calculateMainSequenceLifetime", () => {
    it("calculates 10 Gyr for solar mass", () => {
      const lifetime = calculateMainSequenceLifetime({ massInSolarMasses: 1.0 });
      expect(lifetime).toBeCloseTo(10, 0);
    });

    it("calculates shorter lifetime for more massive stars", () => {
      // Lifetime ≈ 10 * (1/2)^2.5 ≈ 10 * 0.177 ≈ 1.77 Gyr
      const lifetime = calculateMainSequenceLifetime({ massInSolarMasses: 2.0 });
      expect(lifetime).toBeLessThan(10);
      expect(lifetime).toBeGreaterThan(0);
    });

    it("returns null for invalid mass", () => {
      expect(calculateMainSequenceLifetime({ massInSolarMasses: 0 })).toBeNull();
      expect(calculateMainSequenceLifetime({ massInSolarMasses: -1 })).toBeNull();
      expect(calculateMainSequenceLifetime({})).toBeNull();
    });
  });

  describe("calculateEvolutionaryStatus", () => {
    it("returns 'Young Main Sequence' for very early stage (<25%)", () => {
      const status = calculateEvolutionaryStatus({ ageGyr: 1, lifetimeGyr: 10 });
      expect(status.percentComplete).toBe(10);
      expect(status.status).toBe("Young Main Sequence");
    });

    it("returns 'Early Main Sequence' for 25%", () => {
      const status = calculateEvolutionaryStatus({ ageGyr: 2.5, lifetimeGyr: 10 });
      expect(status.percentComplete).toBe(25);
      expect(status.status).toBe("Early Main Sequence");
      expect(status.remainingGyr).toBeCloseTo(7.5, 1);
    });

    it("returns 'Mid Main Sequence' for 50%", () => {
      const status = calculateEvolutionaryStatus({ ageGyr: 5, lifetimeGyr: 10 });
      expect(status.percentComplete).toBe(50);
      expect(status.status).toBe("Mid Main Sequence");
    });

    it("returns 'Red Giant' for late stage (90%+)", () => {
      const status = calculateEvolutionaryStatus({ ageGyr: 9.5, lifetimeGyr: 10 });
      expect(status.percentComplete).toBe(95);
      expect(status.status).toBe("Red Giant");
    });

    it("returns null for invalid inputs", () => {
      expect(calculateEvolutionaryStatus({ ageGyr: 5, lifetimeGyr: 0 })).toBeNull();
      expect(calculateEvolutionaryStatus({ ageGyr: -1, lifetimeGyr: 10 })).toBeNull();
      expect(calculateEvolutionaryStatus({})).toBeNull();
    });
  });

  describe("estimateRotationPeriod", () => {
    it("estimates rotation for main sequence stars", () => {
      const period = estimateRotationPeriod({ massInSolarMasses: 1.0, luminosityClass: "V" });
      expect(period).toBeGreaterThan(0);
      expect(period).toBeLessThan(100);
    });

    it("estimates slower rotation for giants", () => {
      const mainseqPeriod = estimateRotationPeriod({
        massInSolarMasses: 1.0,
        luminosityClass: "V",
      });
      const giantPeriod = estimateRotationPeriod({
        massInSolarMasses: 1.0,
        luminosityClass: "III",
      });
      expect(giantPeriod).toBeGreaterThan(mainseqPeriod);
    });

    it("returns null for invalid mass", () => {
      expect(estimateRotationPeriod({ massInSolarMasses: 0 })).toBeNull();
      expect(estimateRotationPeriod({})).toBeNull();
    });
  });

  describe("checkSystemStability", () => {
    it("returns stable for single star", () => {
      const result = checkSystemStability({
        stars: [{ massInSolarMasses: 1.0 }],
      });
      expect(result.isStable).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it("detects close companions", () => {
      const result = checkSystemStability({
        stars: [
          { massInSolarMasses: 1.0 },
          {
            systemDesignation: "B",
            massInSolarMasses: 0.5,
            stellarOrbitAu: 0.05,
            stellarOrbitEccentricity: 0.1,
          },
        ],
      });
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("close");
    });

    it("detects high eccentricity", () => {
      const result = checkSystemStability({
        stars: [
          { massInSolarMasses: 1.0 },
          {
            systemDesignation: "B",
            massInSolarMasses: 0.5,
            stellarOrbitAu: 5,
            stellarOrbitEccentricity: 0.9,
          },
        ],
      });
      expect(result.warnings.some((w) => w.includes("eccentricity"))).toBe(true);
    });
  });
});
