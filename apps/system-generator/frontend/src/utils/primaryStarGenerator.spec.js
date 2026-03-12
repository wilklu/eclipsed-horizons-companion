import { describe, expect, it } from "vitest";
import {
  estimateStarMassAndTemperature,
  generatePrimaryStar,
  generateStarSubtype,
  toPersistedSpectralClass,
} from "./primaryStarGenerator.js";

function d6ToRandomValue(face) {
  return (face - 0.01) / 6;
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
