import { describe, expect, it } from "vitest";
import {
  assignBasicGasGiantSizes,
  assignBasicTerrestrialWorldSizes,
  applyAnomalousOrbitCount,
  allocateEmptyOrbits,
  adjustOrbitIntoAvailableRange,
  allocateWorldsByStar,
  auToOrbitNumber,
  calculateAvailableOrbits,
  calculateBaselineNumberDm,
  calculateCircumbinaryMinOrbit,
  calculateEffectiveHZCODeviation,
  calculateGasGiantQuantityDm,
  calculateHabitableZoneBreadth,
  calculateHZCO,
  calculateHZCODeviation,
  calculatePlanetoidBeltQuantityDm,
  calculateBeltBulk,
  calculateBeltSignificantBodies,
  calculateBeltSpan,
  calculateSecondarySpread,
  calculateSecondarySpreads,
  calculateSystemSpread,
  determineSystemBaselineNumber,
  determineSystemBaselineOrbit,
  generateAnomalousOrbit,
  generateAnomalousOrbits,
  lookupAnomalousOrbitQuantity,
  lookupAnomalousOrbitType,
  lookupBasicTerrestrialWorldDiameter,
  calculateGasGiantSizingDm,
  placeStarOrbitSlots,
  calculateTerrestrialPlanetDm,
  calculateTotalWorlds,
  generateGasGiants,
  generatePlanetoidBelts,
  generateTerrestrialPlanets,
  lookupGasGiantQuantity,
  lookupEmptyOrbitQuantity,
  lookupHZCO,
  lookupHZCO_AU,
  lookupMinimumAllowableOrbit,
  lookupPlanetoidBeltQuantity,
  rollD3,
  rollGasGiantExistence,
  rollGasGiantQuantity,
  rollAnomalousOrbitQuantity,
  rollAnomalousOrbitType,
  rollBaselineNumber,
  rollEmptyOrbitQuantity,
  rollPlanetoidBeltExistence,
  rollPlanetoidBeltQuantity,
  rollTerrestrialPlanets,
  rollRandomAnomalousOrbit,
  rollBasicTerrestrialWorldSize,
  rollGasGiantSize,
  selectAnomalousOrbitParent,
  shiftOrbitAcrossExclusions,
  buildPlacementSlotRollTable,
  rollPlacementSlotReference,
  placeWorldsInSlots,
  calculateWorldEccentricityDm,
  calculateSignificantMoonDmPerDie,
  resolveSignificantMoonQuantityProfile,
  rollSignificantMoonQuantityForSlot,
  assignSignificantMoonQuantities,
  rollSignificantMoonSizeForParent,
  assignSignificantMoonSizes,
  calculateMoonOrbitLimits,
  applyMoonRemovalByLimits,
  calculateMoonOrbitRangeMor,
  rollMoonOrbitPd,
  assignSignificantMoonOrbits,
  calculateMoonOrbitDm,
  rollMoonOrbitEccentricity,
  rollMoonOrbitDirection,
  calculateMoonOrbitalPeriodHours,
  generateSignificantRings,
  formatRingProfile,
  assignSignificantMoonAndRingCharacteristics,
  resolveInsignificantMoonQuantityForSlot,
  assignInsignificantMoonQuantities,
  rollWorldEccentricity,
  assignWorldsEccentricities,
  generateSystemWorldPlacement,
  calculateHabitableZoneBoundsForHzco,
  lookupHabitableZoneRegionDm,
  ATMOSPHERE_CODE_TABLE,
  lookupAtmosphereCodeInfo,
  calculateAtmosphereVariantDm,
  rollAtmospherePressureBar,
  rollWorldAtmosphereCode,
  rollWorldHydrographicsCode,
  identifyMainworldCandidates,
  rollWorldDiameter,
  TERRESTRIAL_COMPOSITIONS,
  determineTerrestrialComposition,
  rollTerrestrialDensity,
  calculateWorldGravity,
  calculateWorldMass,
  calculateWorldEscapeVelocity,
  calculateWorldOrbitalVelocitySurface,
  calculateWorldOrbitalVelocityAtAltitude,
  formatWorldSizeProfile,
  formatBeltProfile,
  generateBeltCharacteristics,
  rollBeltComposition,
  rollBeltResourceRating,
  rollBeltSignificantBodyOrbit,
} from "./worldGenerator.js";

// ── Deterministic RNG helpers ──────────────────────────────────────────────────

/** Always returns `value` (0–1 scale). Die result = floor(value * 6) + 1. */
function fixedRng(value) {
  return () => value;
}

/** Returns a sequence of values, cycling through them. */
function seqRng(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

/**
 * Produces a 2D roll of exactly `target` using a paired rng.
 * Works for targets 2–12. Each die = ceil(target/2) and floor(target/2).
 */
function rngFor2d(target) {
  // die1 = ceil(target/2), die2 = floor(target/2) — both in [1..6]
  const d1 = Math.ceil(target / 2);
  const d2 = Math.floor(target / 2);
  return seqRng((d1 - 1) / 6, (d2 - 1) / 6);
}

/** Produces a deterministic RNG for a sequence of 2D totals. */
function rngFor2dSequence(...totals) {
  const values = [];
  for (const target of totals) {
    const d1 = Math.ceil(target / 2);
    const d2 = Math.floor(target / 2);
    values.push((d1 - 1) / 6, (d2 - 1) / 6);
  }
  return seqRng(...values);
}

// ── Gas Giant Existence ────────────────────────────────────────────────────────

describe("rollGasGiantExistence", () => {
  it("exists on roll of 9 (below 10)", () => {
    const { roll, exists } = rollGasGiantExistence({ rng: rngFor2d(9) });
    expect(roll).toBe(9);
    expect(exists).toBe(true);
  });

  it("does not exist on roll of 10", () => {
    const { roll, exists } = rollGasGiantExistence({ rng: rngFor2d(10) });
    expect(roll).toBe(10);
    expect(exists).toBe(false);
  });

  it("does not exist on roll of 12", () => {
    const { roll, exists } = rollGasGiantExistence({ rng: rngFor2d(12) });
    expect(roll).toBe(12);
    expect(exists).toBe(false);
  });

  it("exists on minimum roll of 2", () => {
    const { roll, exists } = rollGasGiantExistence({ rng: rngFor2d(2) });
    expect(roll).toBe(2);
    expect(exists).toBe(true);
  });
});

// ── Gas Giant Quantity DMs ────────────────────────────────────────────────────

describe("calculateGasGiantQuantityDm", () => {
  it("applies DM+1 for a single Class V star", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const { dm, breakdown } = calculateGasGiantQuantityDm({ stars });
    expect(dm).toBe(1);
    expect(breakdown.some((b) => b.includes("Single Class V"))).toBe(true);
  });

  it("does NOT apply DM+1 for Class V if there are two stars", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
    ];
    const { dm } = calculateGasGiantQuantityDm({ stars });
    expect(dm).toBeLessThanOrEqual(0);
  });

  it("applies DM-2 for brown dwarf primary", () => {
    const stars = [{ spectralClass: "L", luminosityClass: "BD" }];
    const { dm, breakdown } = calculateGasGiantQuantityDm({ stars });
    expect(dm).toBeLessThanOrEqual(-2);
    expect(breakdown.some((b) => b.includes("brown dwarf"))).toBe(true);
  });

  it("applies DM-2 for post-stellar primary (white dwarf)", () => {
    const stars = [{ spectralClass: "D", luminosityClass: "WD" }];
    const { dm, breakdown } = calculateGasGiantQuantityDm({ stars });
    // -2 (post-stellar primary) + -1 (1 post-stellar object) = -3
    expect(dm).toBe(-3);
    expect(breakdown.some((b) => b.includes("post-stellar object(s)"))).toBe(true);
  });

  it("applies DM-1 per post-stellar object in system", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "D", luminosityClass: "WD" },
      { spectralClass: "D", luminosityClass: "WD" },
    ];
    const { dm } = calculateGasGiantQuantityDm({ stars });
    // DM+1 (single is irrelevant — 3 stars), -2 total for 2 WDs
    // No single, no primary post-stellar → only -2 for 2 post-stellar
    expect(dm).toBe(-2);
  });

  it("applies DM-1 for system with 4 or more stars", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "K", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
    ];
    const { dm, breakdown } = calculateGasGiantQuantityDm({ stars });
    expect(dm).toBe(-1);
    expect(breakdown.some((b) => b.includes("4 or more stars"))).toBe(true);
  });

  it("returns 0 DM for a normal binary with no special conditions", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
    ];
    const { dm } = calculateGasGiantQuantityDm({ stars });
    expect(dm).toBe(0);
  });

  it("returns DM 0 and a note when no stars provided", () => {
    const { dm, breakdown } = calculateGasGiantQuantityDm({ stars: [] });
    expect(dm).toBe(0);
    expect(breakdown[0]).toContain("No stars");
  });
});

// ── Gas Giant Quantity Table ──────────────────────────────────────────────────

describe("lookupGasGiantQuantity", () => {
  it("returns 1 for total <= 4", () => {
    expect(lookupGasGiantQuantity(2)).toBe(1);
    expect(lookupGasGiantQuantity(4)).toBe(1);
  });

  it("returns 2 for total 5–6", () => {
    expect(lookupGasGiantQuantity(5)).toBe(2);
    expect(lookupGasGiantQuantity(6)).toBe(2);
  });

  it("returns 3 for total 7–8", () => {
    expect(lookupGasGiantQuantity(7)).toBe(3);
    expect(lookupGasGiantQuantity(8)).toBe(3);
  });

  it("returns 4 for total 9–11", () => {
    expect(lookupGasGiantQuantity(9)).toBe(4);
    expect(lookupGasGiantQuantity(11)).toBe(4);
  });

  it("returns 5 for total 12", () => {
    expect(lookupGasGiantQuantity(12)).toBe(5);
  });

  it("returns 6 for total 13+", () => {
    expect(lookupGasGiantQuantity(13)).toBe(6);
    expect(lookupGasGiantQuantity(20)).toBe(6);
  });
});

// ── rollGasGiantQuantity ──────────────────────────────────────────────────────

describe("rollGasGiantQuantity", () => {
  it("applies DM+1 for single Class V, boosting quantity", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    // Roll 2D = 4. With DM+1, total = 5 → quantity 2 instead of 1.
    const { roll, dm, total, quantity } = rollGasGiantQuantity({
      stars,
      rng: rngFor2d(4),
    });
    expect(roll).toBe(4);
    expect(dm).toBe(1);
    expect(total).toBe(5);
    expect(quantity).toBe(2);
  });

  it("applies negative DM for brown dwarf primary, reducing quantity", () => {
    const stars = [{ spectralClass: "L", luminosityClass: "BD" }];
    // Roll 2D = 8. DM-2 → total 6 → quantity 2 instead of 3.
    const { roll, dm, total, quantity } = rollGasGiantQuantity({
      stars,
      rng: rngFor2d(8),
    });
    expect(roll).toBe(8);
    expect(dm).toBe(-2);
    expect(total).toBe(6);
    expect(quantity).toBe(2);
  });
});

// ── generateGasGiants (integration) ──────────────────────────────────────────

describe("generateGasGiants", () => {
  it("returns exists=false and quantity=0 when roll is 10", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const result = generateGasGiants({ stars, rng: rngFor2d(10) });
    expect(result.exists).toBe(false);
    expect(result.quantity).toBe(0);
    expect(result.quantityRoll).toBeNull();
  });

  it("returns exists=true and a valid quantity when roll is 7", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    // Existence roll = 7 (exists); quantity roll also needed via same rng.
    // Use a sequence: first two calls → existence 2D=7, next two → quantity 2D.
    const counts = { call: 0 };
    const seqValues = [3 / 6, 3 / 6, 3 / 6, 3 / 6]; // all dice = 4 → 2D=8
    const rng = seqRng(...seqValues);
    const result = generateGasGiants({ stars, rng });
    expect(result.exists).toBe(true); // 8 < 10
    expect(typeof result.quantity).toBe("number");
    expect(result.quantity).toBeGreaterThan(0);
  });

  it("includes dmBreakdown in result", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const result = generateGasGiants({ stars, rng: rngFor2d(5) });
    expect(Array.isArray(result.dmBreakdown)).toBe(true);
  });

  it("works with empty stars array (edge case)", () => {
    const result = generateGasGiants({ stars: [], rng: rngFor2d(5) });
    expect(result.exists).toBe(true);
    expect(result.quantity).toBeGreaterThan(0);
  });
});

// ── Planetoid Belt Existence ──────────────────────────────────────────────────

describe("rollPlanetoidBeltExistence", () => {
  it("exists on roll of 8", () => {
    const { roll, exists } = rollPlanetoidBeltExistence({ rng: rngFor2d(8) });
    expect(roll).toBe(8);
    expect(exists).toBe(true);
  });

  it("exists on roll of 12", () => {
    const { roll, exists } = rollPlanetoidBeltExistence({ rng: rngFor2d(12) });
    expect(roll).toBe(12);
    expect(exists).toBe(true);
  });

  it("does not exist on roll of 7", () => {
    const { roll, exists } = rollPlanetoidBeltExistence({ rng: rngFor2d(7) });
    expect(roll).toBe(7);
    expect(exists).toBe(false);
  });

  it("does not exist on roll of 2", () => {
    const { roll, exists } = rollPlanetoidBeltExistence({ rng: rngFor2d(2) });
    expect(roll).toBe(2);
    expect(exists).toBe(false);
  });
});

// ── Planetoid Belt Quantity DMs ───────────────────────────────────────────────

describe("calculatePlanetoidBeltQuantityDm", () => {
  it("applies DM+1 when gas giants are present", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars, gasGiantCount: 2 });
    expect(dm).toBe(1);
    expect(breakdown.some((b) => b.includes("gas giants"))).toBe(true);
  });

  it("does not apply gas giant DM when count is 0", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const { dm } = calculatePlanetoidBeltQuantityDm({ stars, gasGiantCount: 0 });
    expect(dm).toBe(0);
  });

  it("applies DM+3 for protostar primary", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V", type: "Protostar" }];
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(3);
    expect(breakdown.some((b) => b.includes("protostar"))).toBe(true);
  });

  it("applies DM+2 for primordial primary", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V", type: "Primordial" }];
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(2);
    expect(breakdown.some((b) => b.includes("primordial"))).toBe(true);
  });

  it("applies DM+1 for post-stellar primary plus DM+1 per post-stellar object", () => {
    const stars = [{ spectralClass: "D", luminosityClass: "WD" }];
    // DM+1 (primary is post-stellar) + DM+1 (1 post-stellar object) = +2
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(2);
    expect(breakdown.some((b) => b.includes("post-stellar object(s)"))).toBe(true);
  });

  it("applies DM+1 per each post-stellar companion", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "D", luminosityClass: "WD" },
      { spectralClass: "D", luminosityClass: "WD" },
    ];
    // DM+1 (2+ stars) + DM+2 (2 post-stellar) = +3; primary is not post-stellar
    const { dm } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(3);
  });

  it("applies DM+1 for system with 2 or more stars", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
    ];
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(1);
    expect(breakdown.some((b) => b.includes("two or more stars"))).toBe(true);
  });

  it("accumulates multiple DMs correctly", () => {
    // single Class V with gas giants and a companion WD
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "D", luminosityClass: "WD" },
    ];
    // DM+1 (gas giant) + DM+1 (1 post-stellar) + DM+1 (2+ stars) = +3
    const { dm } = calculatePlanetoidBeltQuantityDm({ stars, gasGiantCount: 1 });
    expect(dm).toBe(3);
  });

  it("returns no DMs for a plain single solar-type star", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const { dm, breakdown } = calculatePlanetoidBeltQuantityDm({ stars });
    expect(dm).toBe(0);
    expect(breakdown[0]).toBe("No DMs applicable");
  });
});

// ── Planetoid Belt Quantity Table ─────────────────────────────────────────────

describe("lookupPlanetoidBeltQuantity", () => {
  it("returns 1 for total <= 6", () => {
    expect(lookupPlanetoidBeltQuantity(2)).toBe(1);
    expect(lookupPlanetoidBeltQuantity(6)).toBe(1);
  });

  it("returns 2 for total 7–11", () => {
    expect(lookupPlanetoidBeltQuantity(7)).toBe(2);
    expect(lookupPlanetoidBeltQuantity(11)).toBe(2);
  });

  it("returns 3 for total 12+", () => {
    expect(lookupPlanetoidBeltQuantity(12)).toBe(3);
    expect(lookupPlanetoidBeltQuantity(20)).toBe(3);
  });
});

// ── generatePlanetoidBelts (integration) ─────────────────────────────────────

describe("generatePlanetoidBelts", () => {
  it("returns exists=false and quantity=0 when roll is 7", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const result = generatePlanetoidBelts({ stars, rng: rngFor2d(7) });
    expect(result.exists).toBe(false);
    expect(result.quantity).toBe(0);
    expect(result.quantityRoll).toBeNull();
  });

  it("returns exists=true and quantity > 0 when roll is 8", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    // Existence=8 (exists), then quantity roll via same seqRng
    const rng = seqRng(3 / 6, 3 / 6, 2 / 6, 2 / 6); // exist=8, qty=6 → 1 belt
    const result = generatePlanetoidBelts({ stars, rng });
    expect(result.exists).toBe(true);
    expect(result.quantity).toBeGreaterThan(0);
  });

  it("DM from gas giants boosts quantity", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    // Existence roll = 8 (first 2D), quantity roll = 6 (next 2D). No GG DM → qty 1.
    // With GG DM+1, total becomes 7 → qty 2.
    const rng = seqRng(3 / 6, 3 / 6, 2 / 6, 2 / 6);
    const withGG = generatePlanetoidBelts({ stars, gasGiantCount: 1, rng });
    expect(withGG.dm).toBe(1);
    expect(withGG.quantity).toBe(2); // 6+1=7 → 2 belts
  });

  it("includes dmBreakdown in all results", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const result = generatePlanetoidBelts({ stars, rng: rngFor2d(3) });
    expect(Array.isArray(result.dmBreakdown)).toBe(true);
  });
});

// ── Planetoid Belt Characteristics (Chapter 5) ───────────────────────────────

describe("calculateBeltSpan", () => {
  it("replicates Aab PI span example with adjacent gas giant DM", () => {
    // Spread 0.5, roll 6 with DM-1 => total 5; span = 0.5 * 5 / 10 = 0.25
    const result = calculateBeltSpan({
      orbit: 2.7,
      spread: 0.5,
      hasOuterGasGiant: true,
      rng: rngFor2d(6),
    });

    expect(result.total).toBe(5);
    expect(result.span).toBeCloseTo(0.25, 10);
    expect(result.innerBoundary).toBeCloseTo(2.575, 10);
    expect(result.outerBoundary).toBeCloseTo(2.825, 10);
  });

  it("derives spread when not provided", () => {
    // spreadRoll=6 => spread 0.84 at orbit 1.4; roll=7 and outermost DM+3 => total 10
    const result = calculateBeltSpan({
      orbit: 1.4,
      isOutermostOrbit: true,
      rng: rngFor2dSequence(6, 7),
    });

    expect(result.spreadSource).toBe("derived");
    expect(result.spreadRoll).toBe(6);
    expect(result.spread).toBeCloseTo(0.84, 10);
    expect(result.span).toBeCloseTo(0.84, 10);
  });
});

describe("rollBeltComposition", () => {
  it("replicates Aab PI composition example", () => {
    // roll 6, inside HZCO DM-4 => total 2 row
    // m: 40 + (3*5) = 55, s: 15 + (5*5) = 40, c: 2, other: 3
    const rng = seqRng(2 / 6, 2 / 6, 2 / 6, 4 / 6, 1 / 6);
    const result = rollBeltComposition({ orbit: 2.7, hzco: 3.3, rng });

    expect(result.total).toBe(2);
    expect(result.mTypePercent).toBe(55);
    expect(result.sTypePercent).toBe(40);
    expect(result.cTypePercent).toBe(2);
    expect(result.otherTypePercent).toBe(3);
  });

  it("removes overflow from m-type first, then s-type", () => {
    // <=0 row with max rolls: m=90, s=30, c=0 => 120 => trim 20 from m => 70/30/0
    const rng = seqRng(0, 0, 5 / 6, 5 / 6);
    const result = rollBeltComposition({ orbit: 1.0, hzco: 3.0, rng });

    expect(result.mTypePercent).toBe(70);
    expect(result.sTypePercent).toBe(30);
    expect(result.cTypePercent).toBe(0);
    expect(result.otherTypePercent).toBe(0);
  });

  it("applies DM+4 beyond HZCO+2", () => {
    // roll 6 + DM+4 => total 10 row
    const rng = seqRng(2 / 6, 2 / 6, 0, 0, 5 / 6);
    const result = rollBeltComposition({ orbit: 6.0, hzco: 3.0, rng });

    expect(result.total).toBe(10);
    expect(result.mTypePercent).toBe(1);
    expect(result.sTypePercent).toBe(10);
    expect(result.cTypePercent).toBe(80);
    expect(result.otherTypePercent).toBe(9);
  });
});

describe("calculateBeltBulk", () => {
  it("applies age and c-type DMs", () => {
    // roll 4 => base 2; age 4.5 => DM-2; c=33 => DM+3; final 3
    const result = calculateBeltBulk({ systemAgeByr: 4.5, cTypePercent: 33, rng: rngFor2d(4) });
    expect(result.bulk).toBe(3);
  });

  it("clamps bulk to minimum 1", () => {
    const result = calculateBeltBulk({ systemAgeByr: 12, cTypePercent: 0, rng: rngFor2d(2) });
    expect(result.bulk).toBe(1);
  });
});

describe("rollBeltResourceRating", () => {
  it("replicates sample resource formula result", () => {
    // roll 11 => 11-7 +4 +2 -2 = 8
    const result = rollBeltResourceRating({ bulk: 4, mTypePercent: 22, cTypePercent: 18, rng: rngFor2d(11) });
    expect(result.rating).toBe(8);
    expect(result.ratingCode).toBe("8");
  });

  it("enforces minimum rating 2", () => {
    const result = rollBeltResourceRating({ bulk: 1, mTypePercent: 0, cTypePercent: 90, rng: rngFor2d(2) });
    expect(result.rating).toBe(2);
  });

  it("applies industrial depletion before final cap", () => {
    // roll 10 => base 3; DM bulk+m-c = 8+2-0 = +10 => raw 13; depletion 1D=6 => 7
    const rng = seqRng(4 / 6, 4 / 6, 5 / 6);
    const result = rollBeltResourceRating({
      bulk: 8,
      mTypePercent: 20,
      cTypePercent: 0,
      industrialDepletion: true,
      rng,
    });
    expect(result.raw).toBe(13);
    expect(result.industrialDepletionRoll).toBe(6);
    expect(result.rating).toBe(7);
  });
});

describe("calculateBeltSignificantBodies", () => {
  it("replicates Aab PI outcome of 0 Size 1 and 3 Size S bodies", () => {
    const result = calculateBeltSignificantBodies({
      bulk: 3,
      beltOrbit: 2.7,
      hzco: 3.3,
      span: 0.25,
      rng: rngFor2dSequence(8, 12),
    });

    expect(result.size1.count).toBe(0);
    expect(result.sizeS.count).toBe(3);
  });

  it("applies compact-span and outer-zone modifiers", () => {
    // Size 1: 10-12+6+2-4 = 2
    // Size S: 12-12+6+3 = 9, then span<0.1 => ceil(9/2)=5
    const result = calculateBeltSignificantBodies({
      bulk: 6,
      beltOrbit: 7.0,
      hzco: 3.0,
      span: 0.05,
      rng: rngFor2dSequence(10, 12),
    });

    expect(result.size1.count).toBe(2);
    expect(result.sizeS.count).toBe(5);
    expect(result.sizeS.compactSpanHalved).toBe(true);
  });

  it("applies optional outermost variance for large Size S counts", () => {
    // Pre-variance Size S = 61, multiply by 1/3 and add 1 => 21
    const rng = seqRng(0, 0, 5 / 6, 5 / 6, 0, 4 / 6, 0);
    const result = calculateBeltSignificantBodies({
      bulk: 60,
      span: 1.2,
      isOutermostOrbit: true,
      applyOptionalVariance: true,
      rng,
    });

    expect(result.sizeS.optionalVariance).toEqual({
      multiplierNumerator: 1,
      multiplierDenominator: 3,
      additive: 1,
    });
    expect(result.sizeS.count).toBe(21);
  });
});

describe("rollBeltSignificantBodyOrbit", () => {
  it("uses the Belt Orbit + ((2D-7)*span/8) formula", () => {
    // roll 8 => +1 * 0.25 / 8 = +0.03125
    const result = rollBeltSignificantBodyOrbit({ beltOrbit: 2.7, span: 0.25, rng: rngFor2d(8) });
    expect(result.orbit).toBeCloseTo(2.73125, 10);
  });

  it("applies optional span variance factor", () => {
    const result = rollBeltSignificantBodyOrbit({
      beltOrbit: 2.7,
      span: 0.25,
      spanVarianceFactor: 0.1,
      rng: rngFor2d(7),
    });
    expect(result.orbit).toBeCloseTo(2.725, 10);
  });
});

describe("formatBeltProfile", () => {
  it("formats Aab PI style profile", () => {
    const profile = formatBeltProfile({
      span: 0.25,
      mTypePercent: 55,
      sTypePercent: 40,
      cTypePercent: 2,
      otherTypePercent: 3,
      bulk: 3,
      resourceRating: 11,
      size1Bodies: 0,
      sizeSBodies: 3,
    });
    expect(profile).toBe("0.25-55.40.02.03-3-B-0-3");
  });

  it("zero-pads composition fields and trims span zeros", () => {
    const profile = formatBeltProfile({
      span: 0.3,
      mTypePercent: 5,
      sTypePercent: 6,
      cTypePercent: 7,
      otherTypePercent: 82,
      bulk: 6,
      resourceRating: 8,
      size1Bodies: 2,
      sizeSBodies: 8,
    });
    expect(profile).toBe("0.3-05.06.07.82-6-8-2-8");
  });
});

describe("generateBeltCharacteristics", () => {
  it("returns a deterministic full profile bundle", () => {
    const result = generateBeltCharacteristics({
      orbit: 2.7,
      spread: 0.5,
      hzco: 3.3,
      systemAgeByr: 6.3,
      hasInnerGasGiant: true,
      rng: fixedRng(0),
    });

    expect(result.profile).toBe("0.05-65.05.00.30-1-2-0-0");
    expect(
      result.composition.mTypePercent +
        result.composition.sTypePercent +
        result.composition.cTypePercent +
        result.composition.otherTypePercent,
    ).toBe(100);
    expect(result.bulk.bulk).toBe(1);
    expect(result.resourceRating.rating).toBe(2);
  });
});

// ── rollD3 ────────────────────────────────────────────────────────────────────

describe("rollD3", () => {
  it("returns 1 for d6 rolls 1 and 2", () => {
    expect(rollD3({ rng: () => 1 / 6 - 0.001 }).roll).toBe(1); // maps to d6=1
    // rng returns value in [0,1); d6=ceil(rng*6) de-facto: floor(rng*6)+1
    // rng=0 → d6=1 → D3=1; rng=1/3-ε → d6=2 → D3=1
    expect(rollD3({ rng: () => 0 }).roll).toBe(1);
    expect(rollD3({ rng: () => 0.33 }).roll).toBe(1);
  });

  it("returns 2 for d6 rolls 3 and 4", () => {
    expect(rollD3({ rng: () => 2 / 6 }).roll).toBe(2);
    expect(rollD3({ rng: () => 3 / 6 }).roll).toBe(2);
  });

  it("returns 3 for d6 rolls 5 and 6", () => {
    expect(rollD3({ rng: () => 4 / 6 }).roll).toBe(3);
    expect(rollD3({ rng: () => 5 / 6 }).roll).toBe(3);
  });
});

// ── calculateTerrestrialPlanetDm ──────────────────────────────────────────────

describe("calculateTerrestrialPlanetDm", () => {
  it("returns DM 0 for normal main-sequence stars", () => {
    const stars = [
      { spectralClass: "G", luminosityClass: "V" },
      { spectralClass: "M", luminosityClass: "V" },
    ];
    const { dm, breakdown } = calculateTerrestrialPlanetDm({ stars });
    expect(dm).toBe(0);
    expect(breakdown[0]).toBe("No DMs applicable");
  });

  it("applies DM-1 for one post-stellar white dwarf primary", () => {
    const stars = [{ spectralClass: "D", luminosityClass: "WD" }];
    const { dm, breakdown } = calculateTerrestrialPlanetDm({ stars });
    expect(dm).toBe(-1);
    expect(breakdown[0]).toMatch(/1 post-stellar/);
  });

  it("applies DM-2 for two post-stellar objects", () => {
    const stars = [
      { spectralClass: "D", luminosityClass: "WD" },
      { spectralClass: "D", luminosityClass: "WD" },
    ];
    const { dm } = calculateTerrestrialPlanetDm({ stars });
    expect(dm).toBe(-2);
  });

  it("applies DM-1 for neutron star", () => {
    const stars = [{ spectralClass: "NS", luminosityClass: "VII", type: "Neutron Star" }];
    const { dm } = calculateTerrestrialPlanetDm({ stars });
    expect(dm).toBe(-1);
  });

  it("applies DM-1 for black hole", () => {
    const stars = [{ spectralClass: "BH", luminosityClass: "", type: "Black Hole" }];
    const { dm } = calculateTerrestrialPlanetDm({ stars });
    expect(dm).toBe(-1);
  });

  it("returns DM 0 for empty stars array", () => {
    const { dm } = calculateTerrestrialPlanetDm({ stars: [] });
    expect(dm).toBe(0);
  });
});

// ── rollTerrestrialPlanets ────────────────────────────────────────────────────

describe("rollTerrestrialPlanets", () => {
  // Helper: produce a fixed 2D result then a fixed D3 result
  // rngFor2d produces two identical dice; for D3 we need a separate value.
  // seqRng cycles: first two calls → 2D, third call → 1D for D3.
  // d1=d2=target/2 is unreliable, so we build sequences manually.

  it("uses D3+2 reroll when initial total < 3 (initial = 0, D3=1 → count=3)", () => {
    // 2D-2=0: both dice roll 1 (rng→0 each), D3: rng→0 → d6=1 → D3=1
    const rng = seqRng(0, 0, 0);
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(result.initialRoll).toBe(0);
    expect(result.total).toBe(0);
    expect(result.rerollType).toBe("D3+2");
    expect(result.reroll).toBe(1);
    expect(result.count).toBe(3); // 1+2
  });

  it("uses D3+2 reroll when total = 2 (just below threshold), D3=3 → count=5", () => {
    // d1=2, d2=2 → 2D-2=2; D3: rng→5/6 → d6=6 → D3=3 → count=5
    const rng = seqRng(1 / 6, 1 / 6, 5 / 6);
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(result.initialRoll).toBe(2);
    expect(result.rerollType).toBe("D3+2");
    expect(result.count).toBe(5); // 3+2
  });

  it("uses D3-1 reroll when initial total >= 3, D3=1 → count=0", () => {
    // d1=3, d2=3 → 2D-2=4; D3: rng→0 → D3=1 → count=max(0,1-1)=0
    const rng = seqRng(2 / 6, 2 / 6, 0);
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(result.initialRoll).toBe(4);
    expect(result.rerollType).toBe("D3-1");
    expect(result.count).toBe(0); // 1-1
  });

  it("uses D3-1 reroll when total = 3 exactly, D3=3 → count=2", () => {
    // d1=3, d2=2 → 2D=5-2=3; D3=3 → count=2
    const rng = seqRng(2 / 6, 1 / 6, 5 / 6);
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(result.initialRoll).toBe(3);
    expect(result.rerollType).toBe("D3-1");
    expect(result.count).toBe(2); // 3-1
  });

  it("post-stellar DMs push total below 3 and trigger D3+2 reroll", () => {
    // 2D-2=3, DM-3 (3 white dwarfs) → total=0 → D3+2 reroll
    const stars = [
      { spectralClass: "D", luminosityClass: "WD" },
      { spectralClass: "D", luminosityClass: "WD" },
      { spectralClass: "D", luminosityClass: "WD" },
    ];
    // d1=3, d2=2 → 2D-2=3; D3=rng→0→1
    const rng = seqRng(2 / 6, 1 / 6, 0);
    const result = rollTerrestrialPlanets({ stars, rng });
    expect(result.dm).toBe(-3);
    expect(result.total).toBe(0);
    expect(result.rerollType).toBe("D3+2");
  });

  it("count is never negative (D3-1 minimum is 0)", () => {
    // Verify Math.max(0,...) guard: D3=1 → 1-1=0, not -1
    const rng = seqRng(2 / 6, 2 / 6, 0); // 2D-2=4, D3=1 → max(0,0)=0
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("includes dmBreakdown in result", () => {
    const rng = seqRng(0, 0, 0);
    const result = rollTerrestrialPlanets({ stars: [], rng });
    expect(Array.isArray(result.dmBreakdown)).toBe(true);
    expect(result.dmBreakdown.length).toBeGreaterThan(0);
  });
});

// ── generateTerrestrialPlanets (integration) ──────────────────────────────────

describe("generateTerrestrialPlanets", () => {
  it("returns same shape as rollTerrestrialPlanets", () => {
    const stars = [{ spectralClass: "G", luminosityClass: "V" }];
    const rng = seqRng(0, 0, 0);
    const result = generateTerrestrialPlanets({ stars, rng });
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("initialRoll");
    expect(result).toHaveProperty("dm");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("rerollType");
    expect(result).toHaveProperty("reroll");
    expect(result).toHaveProperty("dmBreakdown");
  });

  it("count is within valid range (0–5)", () => {
    // Run multiple times with different seeds; verify range
    let seed = 0;
    const deterministicRng = () => (seed += 0.13) % 1;
    for (let i = 0; i < 20; i++) {
      const result = generateTerrestrialPlanets({ stars: [], rng: deterministicRng });
      expect(result.count).toBeGreaterThanOrEqual(0);
      expect(result.count).toBeLessThanOrEqual(5);
    }
  });
});

// ── calculateTotalWorlds ──────────────────────────────────────────────────────

describe("calculateTotalWorlds", () => {
  it("sums all three categories", () => {
    const { total } = calculateTotalWorlds({ planetoidBelts: 2, gasGiants: 3, terrestrialPlanets: 4 });
    expect(total).toBe(9);
  });

  it("returns 0 when all inputs are 0", () => {
    const { total } = calculateTotalWorlds({ planetoidBelts: 0, gasGiants: 0, terrestrialPlanets: 0 });
    expect(total).toBe(0);
  });

  it("defaults missing inputs to 0", () => {
    expect(calculateTotalWorlds({ gasGiants: 2 }).total).toBe(2);
    expect(calculateTotalWorlds({ planetoidBelts: 1 }).total).toBe(1);
    expect(calculateTotalWorlds({ terrestrialPlanets: 3 }).total).toBe(3);
    expect(calculateTotalWorlds().total).toBe(0);
  });

  it("echoes input values in result", () => {
    const result = calculateTotalWorlds({ planetoidBelts: 1, gasGiants: 2, terrestrialPlanets: 3 });
    expect(result.planetoidBelts).toBe(1);
    expect(result.gasGiants).toBe(2);
    expect(result.terrestrialPlanets).toBe(3);
  });

  it("works with a typical system (1 belt, 2 gas giants, 2 terrestrials)", () => {
    const { total } = calculateTotalWorlds({ planetoidBelts: 1, gasGiants: 2, terrestrialPlanets: 2 });
    expect(total).toBe(5);
  });
});

// ── lookupMinimumAllowableOrbit ───────────────────────────────────────────────

describe("lookupMinimumAllowableOrbit", () => {
  // Exact table rows
  it("G0 V → 0.03", () => expect(lookupMinimumAllowableOrbit("G0", "V")).toBe(0.03));
  it("G5 V → 0.02", () => expect(lookupMinimumAllowableOrbit("G5", "V")).toBe(0.02));
  it("M0 V → 0.02", () => expect(lookupMinimumAllowableOrbit("M0", "V")).toBe(0.02));
  it("M5 V → 0.01", () => expect(lookupMinimumAllowableOrbit("M5", "V")).toBe(0.01));
  it("B0 Ia → 0.50", () => expect(lookupMinimumAllowableOrbit("B0", "Ia")).toBe(0.5));
  it("A0 Ia → 3.34", () => expect(lookupMinimumAllowableOrbit("A0", "Ia")).toBe(3.34));
  it("K5 III → 1.00", () => expect(lookupMinimumAllowableOrbit("K5", "III")).toBe(1.0));

  // Nearest-row interpolation
  it("G2 V rounds to G0 → 0.03", () => expect(lookupMinimumAllowableOrbit("G2", "V")).toBe(0.03));
  it("G4 V rounds to G5 → 0.02", () => expect(lookupMinimumAllowableOrbit("G4", "V")).toBe(0.02));
  it("K3 V rounds to K5 → 0.02", () => expect(lookupMinimumAllowableOrbit("K3", "V")).toBe(0.02));
  it("M7 V rounds to M5 → 0.01", () => expect(lookupMinimumAllowableOrbit("M7", "V")).toBe(0.01));

  // Inapplicable / non-existing combinations return null
  it("O0 IV (dash) → null", () => expect(lookupMinimumAllowableOrbit("O0", "IV")).toBeNull());
  it("A0 VI (dash) → null", () => expect(lookupMinimumAllowableOrbit("A0", "VI")).toBeNull());
  it("K5 IV (dash) → null", () => expect(lookupMinimumAllowableOrbit("K5", "IV")).toBeNull());

  // Post-stellar / unknown types return null
  it("WD (post-stellar) → null", () => expect(lookupMinimumAllowableOrbit("D", "WD")).toBeNull());
  it("empty spectral class → null", () => expect(lookupMinimumAllowableOrbit("", "V")).toBeNull());
  it("unknown luminosity class → null", () => expect(lookupMinimumAllowableOrbit("G0", "VII")).toBeNull());
});

// ── calculateCircumbinaryMinOrbit ────────────────────────────────────────────

describe("calculateCircumbinaryMinOrbit", () => {
  it("base: 0.5 + eccentricity when both MAOs <= 0.2", () => {
    // M5 V mao=0.01, M5 V mao=0.01 → max(0.01,0.01)=0.01 ≤ 0.2; min=0.5+0.1=0.6
    expect(calculateCircumbinaryMinOrbit(0.01, 0.01, 0.1)).toBeCloseTo(0.6);
  });

  it("adds larger MAO when either > 0.2", () => {
    // G0 V mao=0.03, K0 III mao=0.50; larger=0.50 > 0.2 → min=0.5+0+0.5=1.0
    expect(calculateCircumbinaryMinOrbit(0.03, 0.5, 0)).toBeCloseTo(1.0);
  });

  it("zero eccentricity with both MAOs <= 0.2 gives 0.5", () => {
    expect(calculateCircumbinaryMinOrbit(0.02, 0.02, 0)).toBeCloseTo(0.5);
  });

  it("stacks eccentricity and large MAO", () => {
    // mao1=0.03, mao2=0.5 → add 0.5; ecc=0.3 → min=0.5+0.3+0.5=1.3
    expect(calculateCircumbinaryMinOrbit(0.03, 0.5, 0.3)).toBeCloseTo(1.3);
  });
});

// ── calculateAvailableOrbits ─────────────────────────────────────────────────

describe("calculateAvailableOrbits", () => {
  // ── Single star ──
  it("single G5 V has one orbit range from MAO to 20", () => {
    const { primaryMao, primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
    });
    expect(primaryMao).toBe(0.02);
    expect(primaryOrbits).toHaveLength(1);
    expect(primaryOrbits[0].min).toBe(0.02);
    expect(primaryOrbits[0].max).toBe(20);
  });

  it("single M5 V has one orbit range from 0.01 to 20", () => {
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "M5", luminosityClass: "V" },
    });
    expect(primaryOrbits[0].min).toBe(0.01);
    expect(primaryOrbits[0].max).toBe(20);
  });

  // ── Companion (circumbinary) rule ──
  it("primary with dim companion raises min orbit via circumbinary rule", () => {
    // G5 V mao=0.02, companion M5 V mao=0.01, both ≤ 0.2 → cbMin=0.5+0=0.5
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: {
        spectralClass: "G5",
        luminosityClass: "V",
        companion: { spectralClass: "M5", luminosityClass: "V", eccentricity: 0 },
      },
    });
    expect(primaryOrbits[0].min).toBeCloseTo(0.5);
  });

  // ── Secondary exclusion zones (rules 5–7) ──
  it("Near secondary at 6.10 (ecc=0) creates exclusion zone 5.10–7.10", () => {
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "M5",
          luminosityClass: "V",
          zone: "near",
          orbitNumber: 6.1,
          eccentricity: 0,
        },
      ],
    });
    // M5 V mao=0.01 ≤ 0.2; ecc=0; halfWidth=1.0
    // Exclusion: (5.10, 7.10)
    expect(primaryOrbits).toHaveLength(2);
    expect(primaryOrbits[0]).toMatchObject({ min: 0.02, max: 5.1 });
    expect(primaryOrbits[1]).toMatchObject({ min: 7.1, max: 20 });
  });

  it("secondary with MAO > 0.2 widens exclusion zone", () => {
    // K0 III mao=0.50 > 0.2; orbitNumber=6; ecc=0; half=1+0.5=1.5
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "K0",
          luminosityClass: "III",
          zone: "near",
          orbitNumber: 6,
          eccentricity: 0,
        },
      ],
    });
    // half=1+0.5=1.5; exclusion (4.5, 7.5)
    expect(primaryOrbits[0].max).toBeCloseTo(4.5);
    expect(primaryOrbits[1].min).toBeCloseTo(7.5);
  });

  it("secondary eccentricity > 0.2 adds 1 to exclusion half-width", () => {
    // M5 V mao=0.01; ecc=0.3; half=1+1=2; exclusion (4.1, 8.1)
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "M5",
          luminosityClass: "V",
          zone: "near",
          orbitNumber: 6.1,
          eccentricity: 0.3,
        },
      ],
    });
    expect(primaryOrbits[0].max).toBeCloseTo(4.1);
    expect(primaryOrbits[1].min).toBeCloseTo(8.1);
  });

  it("Close/Near secondary eccentricity > 0.5 adds another 1 to half-width", () => {
    // M5 V mao=0.01; ecc=0.6; zone=near; half=1+1+1=3; exclusion (3.1, 9.1)
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "M5",
          luminosityClass: "V",
          zone: "near",
          orbitNumber: 6.1,
          eccentricity: 0.6,
        },
      ],
    });
    expect(primaryOrbits[0].max).toBeCloseTo(3.1);
    expect(primaryOrbits[1].min).toBeCloseTo(9.1);
  });

  it("Far secondary eccentricity > 0.5 does NOT add rule-7 extension", () => {
    // Rule 7 only applies to Close/Near; Far with ecc=0.6: half=1+1=2 (not 3)
    const { primaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "M5",
          luminosityClass: "V",
          zone: "far",
          orbitNumber: 10,
          eccentricity: 0.6,
        },
      ],
    });
    // half=1+1=2 (no rule 7); exclusion (8, 12)
    expect(primaryOrbits[0].max).toBeCloseTo(8);
    expect(primaryOrbits[1].min).toBeCloseTo(12);
  });

  // ── Secondary own orbit ranges (rules 8–11) ──
  it("secondary own max = orbitNumber - 3 with no reductions", () => {
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        {
          spectralClass: "M5",
          luminosityClass: "V",
          zone: "near",
          orbitNumber: 6.1,
          eccentricity: 0,
        },
      ],
    });
    expect(secondaryOrbits[0].max).toBeCloseTo(3.1); // 6.1 - 3
    expect(secondaryOrbits[0].mao).toBe(0.01);
    expect(secondaryOrbits[0].min).toBe(0.01);
  });

  it("adjacent zone star reduces secondary max by 1 (rule 9)", () => {
    // Near star at 6.1 with a Far star → adjacent → max = 6.1-3-1 = 2.1
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        { spectralClass: "M5", luminosityClass: "V", zone: "near", orbitNumber: 6.1, eccentricity: 0 },
        { spectralClass: "M5", luminosityClass: "V", zone: "far", orbitNumber: 15, eccentricity: 0 },
      ],
    });
    const near = secondaryOrbits.find((s) => s.zone === "near");
    expect(near.max).toBeCloseTo(2.1);
  });

  it("high eccentricity reduces secondary max by 1 more (rule 10)", () => {
    // Near star ecc=0.3 (>0.2) alone: rule 9 no adjacent → 0 reduction; rule 10 → -1
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [{ spectralClass: "M5", luminosityClass: "V", zone: "near", orbitNumber: 6.1, eccentricity: 0.3 }],
    });
    expect(secondaryOrbits[0].max).toBeCloseTo(2.1); // 6.1-3-1
  });

  it("eccentricity > 0.5 reduces secondary max by yet another 1 (rule 11)", () => {
    // Near star ecc=0.6: rule 10 (-1) + rule 11 (-1) → max = 6.1-3-1-1 = 1.1
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [{ spectralClass: "M5", luminosityClass: "V", zone: "near", orbitNumber: 6.1, eccentricity: 0.6 }],
    });
    expect(secondaryOrbits[0].max).toBeCloseTo(1.1); // 6.1-3-1-1
  });

  it("all three rules (9+10+11) can stack for maximum reduction", () => {
    // Near star ecc=0.6 with adjacent Far star: rule 9 (-1) + rule 10 (-1) + rule 11 (-1) = -3
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [
        { spectralClass: "M5", luminosityClass: "V", zone: "near", orbitNumber: 6.1, eccentricity: 0.6 },
        { spectralClass: "M5", luminosityClass: "V", zone: "far", orbitNumber: 15, eccentricity: 0 },
      ],
    });
    const near = secondaryOrbits.find((s) => s.zone === "near");
    expect(near.max).toBeCloseTo(0.1); // 6.1-3-1-1-1
  });

  it("returns empty secondaryOrbits for a single-star system", () => {
    const { secondaryOrbits } = calculateAvailableOrbits({
      primary: { spectralClass: "G5", luminosityClass: "V" },
    });
    expect(secondaryOrbits).toHaveLength(0);
  });
});

// ── auToOrbitNumber ──────────────────────────────────────────────────────────

describe("auToOrbitNumber", () => {
  it("0 AU = Orbit# 0 (stellar surface)", () => {
    expect(auToOrbitNumber(0)).toBe(0);
  });

  it("0.4 AU = Orbit# 1 (exact table entry)", () => {
    expect(auToOrbitNumber(0.4)).toBe(1);
  });

  it("1.0 AU = Orbit# 3 (exact table entry)", () => {
    expect(auToOrbitNumber(1.0)).toBe(3);
  });

  it("1.6 AU = Orbit# 4 (exact table entry)", () => {
    expect(auToOrbitNumber(1.6)).toBe(4);
  });

  it("1.18 AU (G0 V HZ) = Orbit# 3.3", () => {
    expect(auToOrbitNumber(1.18)).toBe(3.3);
  });

  it("0.88 AU (G5 V HZ) = Orbit# 2.6", () => {
    expect(auToOrbitNumber(0.88)).toBe(2.6);
  });

  it("monotonically increasing", () => {
    expect(auToOrbitNumber(10)).toBeGreaterThan(auToOrbitNumber(1));
    expect(auToOrbitNumber(1000)).toBeGreaterThan(auToOrbitNumber(10));
  });

  it("AU <= 0 returns 0", () => {
    expect(auToOrbitNumber(0)).toBe(0);
    expect(auToOrbitNumber(-1)).toBe(0);
  });
});

// ── lookupHZCO ─────────────────────────────────────────────────────────────

describe("lookupHZCO", () => {
  // Exact table rows
  it("G0 V → 3.3", () => expect(lookupHZCO("G0", "V")).toBe(3.3));
  it("G5 V → 2.6", () => expect(lookupHZCO("G5", "V")).toBe(2.6));
  it("K0 V → 2.1", () => expect(lookupHZCO("K0", "V")).toBe(2.1));
  it("M0 V → 0.72", () => expect(lookupHZCO("M0", "V")).toBe(0.72));
  it("M5 V → 0.13", () => expect(lookupHZCO("M5", "V")).toBe(0.13));
  it("M9 V → 0.04", () => expect(lookupHZCO("M9", "V")).toBe(0.04));
  it("F0 III → 6.7", () => expect(lookupHZCO("F0", "III")).toBe(6.7));
  it("B0 Ia → 12.8", () => expect(lookupHZCO("B0", "Ia")).toBe(12.8));
  it("G5 VI → 2.5", () => expect(lookupHZCO("G5", "VI")).toBe(2.5));

  // Nearest-row interpolation
  it("G2 V rounds to G0 → 3.3", () => expect(lookupHZCO("G2", "V")).toBe(3.3));
  it("G4 V rounds to G5 → 2.6", () => expect(lookupHZCO("G4", "V")).toBe(2.6));
  it("M7 V rounds to M5 → 0.13", () => expect(lookupHZCO("M7", "V")).toBe(0.13));

  // Inapplicable combinations
  it("G0 VI (dash in table 13) → null", () => expect(lookupHZCO("G0", "VI")).toBeNull());
  it("O0 IV (dash) → null", () => expect(lookupHZCO("O0", "IV")).toBeNull());
  it("post-stellar (WD) → null", () => expect(lookupHZCO("D", "WD")).toBeNull());
  it("empty spectral class → null", () => expect(lookupHZCO("", "V")).toBeNull());
});

// ── lookupHZCO_AU ───────────────────────────────────────────────────────────

describe("lookupHZCO_AU", () => {
  it("G0 V → 1.18 AU", () => expect(lookupHZCO_AU("G0", "V")).toBe(1.18));
  it("G5 V → 0.88 AU", () => expect(lookupHZCO_AU("G5", "V")).toBe(0.88));
  it("M5 V → 0.054 AU", () => expect(lookupHZCO_AU("M5", "V")).toBe(0.054));
  it("M9 V → 0.017 AU", () => expect(lookupHZCO_AU("M9", "V")).toBe(0.017));
  it("K5 IV (dash) → null", () => expect(lookupHZCO_AU("K5", "IV")).toBeNull());
});

// ── calculateHZCO ─────────────────────────────────────────────────────────────

describe("calculateHZCO", () => {
  it("single G0 V returns exact table 13 value 3.3", () => {
    const { hzco } = calculateHZCO({ primary: { spectralClass: "G0", luminosityClass: "V" } });
    expect(hzco).toBe(3.3);
  });

  it("single M0 V returns exact table 13 value 0.72", () => {
    const { hzco } = calculateHZCO({ primary: { spectralClass: "M0", luminosityClass: "V" } });
    expect(hzco).toBe(0.72);
  });

  it("circumbinary: companion luminosity adds to primary", () => {
    // G5 V: AU=0.88, L=0.7744; companion M5 V: AU=0.054, L=0.002916
    // combined L = 0.777316; AU = sqrt(0.777316) ≈ 0.8817
    // orbitNum > pure G5 V alone
    const single = calculateHZCO({ primary: { spectralClass: "G5", luminosityClass: "V" } });
    const binary = calculateHZCO({
      primary: {
        spectralClass: "G5",
        luminosityClass: "V",
        companion: { spectralClass: "M5", luminosityClass: "V" },
      },
    });
    expect(binary.hzco).toBeGreaterThanOrEqual(single.hzco);
    expect(binary.combinedLuminosity).toBeGreaterThan(single.combinedLuminosity);
  });

  it("secondary inside planet orbit increases combined luminosity", () => {
    // Planet at orbit 10; close secondary at orbit 5 is inside → added
    const withoutSec = calculateHZCO({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      planetOrbitNumber: 10,
    });
    const withSec = calculateHZCO({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [{ spectralClass: "M0", luminosityClass: "V", orbitNumber: 5 }],
      planetOrbitNumber: 10,
    });
    expect(withSec.combinedLuminosity).toBeGreaterThan(withoutSec.combinedLuminosity);
  });

  it("secondary outside planet orbit is NOT added", () => {
    // Planet at orbit 3; secondary at orbit 10 is outside → ignored
    const withoutSec = calculateHZCO({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      planetOrbitNumber: 3,
    });
    const withSec = calculateHZCO({
      primary: { spectralClass: "G5", luminosityClass: "V" },
      secondaries: [{ spectralClass: "M0", luminosityClass: "V", orbitNumber: 10 }],
      planetOrbitNumber: 3,
    });
    expect(withSec.combinedLuminosity).toBe(withoutSec.combinedLuminosity);
  });

  it("returns null hzco for unknown primary type", () => {
    const { hzco, combinedLuminosity } = calculateHZCO({
      primary: { spectralClass: "D", luminosityClass: "WD" },
    });
    expect(hzco).toBeNull();
    expect(combinedLuminosity).toBeNull();
  });

  it("returns hzco and auDistance properties", () => {
    const result = calculateHZCO({ primary: { spectralClass: "G0", luminosityClass: "V" } });
    expect(result).toHaveProperty("hzco");
    expect(result).toHaveProperty("combinedLuminosity");
    expect(result).toHaveProperty("auDistance");
    expect(result.auDistance).toBeCloseTo(Math.sqrt(result.combinedLuminosity), 5);
  });
});

// ── Habitable Zone Breadth and Deviation ─────────────────────────────────────

describe("calculateHabitableZoneBreadth", () => {
  it("returns +/- 1 Orbit# around HZCO", () => {
    expect(calculateHabitableZoneBreadth(3.3)).toEqual({
      innerOrbit: 2.3,
      outerOrbit: 4.3,
    });
  });

  it("supports low HZCO values", () => {
    expect(calculateHabitableZoneBreadth(0.72)).toEqual({
      innerOrbit: -0.28,
      outerOrbit: 1.72,
    });
  });

  it("returns null for invalid input", () => {
    expect(calculateHabitableZoneBreadth(null)).toBeNull();
  });
});

describe("calculateHZCODeviation", () => {
  it("returns positive deviation for colder orbit", () => {
    expect(calculateHZCODeviation(4.2, 3.3)).toBeCloseTo(0.9, 10);
  });

  it("returns negative deviation for hotter orbit", () => {
    expect(calculateHZCODeviation(2.6, 3.3)).toBeCloseTo(-0.7, 10);
  });

  it("returns zero at HZCO", () => {
    expect(calculateHZCODeviation(3.3, 3.3)).toBe(0);
  });

  it("returns null for invalid inputs", () => {
    expect(calculateHZCODeviation(undefined, 3.3)).toBeNull();
    expect(calculateHZCODeviation(3.3, Number.NaN)).toBeNull();
  });
});

describe("calculateEffectiveHZCODeviation", () => {
  it("matches basic deviation when Orbit# and HZCO are both >= 1", () => {
    expect(calculateEffectiveHZCODeviation(4.2, 3.3)).toBeCloseTo(0.9, 10);
  });

  it("applies divisor rule when orbit is below 1", () => {
    // (0.72 - 2.1) / min(0.72, 2.1) = -1.38 / 0.72 = -1.91666...
    expect(calculateEffectiveHZCODeviation(0.72, 2.1)).toBeCloseTo(-1.9166667, 6);
  });

  it("applies divisor rule when HZCO is below 1", () => {
    // (1.6 - 0.72) / min(1.6, 0.72) = 0.88 / 0.72 = 1.22222...
    expect(calculateEffectiveHZCODeviation(1.6, 0.72)).toBeCloseTo(1.2222222, 6);
  });

  it("applies divisor rule when both are below 1", () => {
    // (0.4 - 0.72) / min(0.4, 0.72) = -0.32 / 0.4 = -0.8
    expect(calculateEffectiveHZCODeviation(0.4, 0.72)).toBeCloseTo(-0.8, 10);
  });

  it("returns null when divisor would be non-positive", () => {
    expect(calculateEffectiveHZCODeviation(0, 0.72)).toBeNull();
    expect(calculateEffectiveHZCODeviation(-0.1, 0.72)).toBeNull();
  });

  it("returns null for invalid values", () => {
    expect(calculateEffectiveHZCODeviation(1.2, undefined)).toBeNull();
    expect(calculateEffectiveHZCODeviation(Number.NaN, 0.8)).toBeNull();
  });
});

describe("calculateHabitableZoneBoundsForHzco", () => {
  it("returns ±1.0 for HZCO >= 1", () => {
    expect(calculateHabitableZoneBoundsForHzco(3.3)).toEqual({ innerOrbit: 2.3, outerOrbit: 4.3 });
  });

  it("returns ±0.1 for HZCO < 1 when outer stays below 1.0 (Zed Cab example)", () => {
    const result = calculateHabitableZoneBoundsForHzco(0.75);
    expect(result.innerOrbit).toBeCloseTo(0.65, 10);
    expect(result.outerOrbit).toBeCloseTo(0.85, 10);
  });

  it("extends outer to 1.2 when natural outer would cross 1.0 (Zed Star B example)", () => {
    const result = calculateHabitableZoneBoundsForHzco(0.92);
    expect(result.innerOrbit).toBeCloseTo(0.82, 10);
    expect(result.outerOrbit).toBe(1.2);
  });

  it("clamps inner orbit to 0 for very low HZCO", () => {
    const result = calculateHabitableZoneBoundsForHzco(0.04);
    expect(result.innerOrbit).toBe(0);
  });

  it("returns null for invalid HZCO", () => {
    expect(calculateHabitableZoneBoundsForHzco(null)).toBeNull();
    expect(calculateHabitableZoneBoundsForHzco(Number.NaN)).toBeNull();
  });
});

describe("lookupHabitableZoneRegionDm", () => {
  it("returns DM+2 for 0.2 inside HZCO (Zed Aab IV d example)", () => {
    // deviation = 3.1 - 3.3 = -0.2 → warm inner zone → DM+2
    expect(lookupHabitableZoneRegionDm(-0.2)).toBe(2);
  });

  it("returns DM-2 for 0.2 outside HZCO (Zed Aab V moons example)", () => {
    // deviation = 3.5 - 3.3 = +0.2 → cool outer zone → DM-2
    expect(lookupHabitableZoneRegionDm(0.2)).toBe(-2);
  });

  it("returns DM-4 for 0.8 outside HZCO (Zed Aab VI example)", () => {
    // deviation = 4.1 - 3.3 = +0.8 → cold outer zone → DM-4
    expect(lookupHabitableZoneRegionDm(0.8)).toBe(-4);
  });

  it("returns DM 0 at HZCO", () => {
    expect(lookupHabitableZoneRegionDm(0)).toBe(0);
    expect(lookupHabitableZoneRegionDm(0.05)).toBe(0);
    expect(lookupHabitableZoneRegionDm(-0.05)).toBe(0);
  });

  it("returns DM+4 well inside HZCO", () => {
    expect(lookupHabitableZoneRegionDm(-0.8)).toBe(4);
  });

  it("returns 0 for non-finite input", () => {
    expect(lookupHabitableZoneRegionDm(Number.NaN)).toBe(0);
    expect(lookupHabitableZoneRegionDm(undefined)).toBe(0);
  });
});

// ── Placement Step 1: Allocations By Star ───────────────────────────────────

describe("allocateWorldsByStar", () => {
  it("matches the Zed example allocation: 11, 1, 5", () => {
    const result = allocateWorldsByStar({
      totalWorlds: 17,
      primary: {
        companion: { spectralClass: "M0", luminosityClass: "V" },
      },
      secondaries: [
        // Star B: no companion, receives +1 bonus
        { orbitNumber: 6.0 },
        // Star Cab: has companion, no +1 bonus
        { orbitNumber: 14.0, companion: { spectralClass: "M5", luminosityClass: "V" } },
      ],
      availableOrbits: {
        primaryOrbits: [{ min: 0, max: 13.39 }],
        secondaryOrbits: [
          { min: 0, max: 1.08 },
          { min: 0, max: 6.36 },
        ],
      },
    });

    expect(result.stepSkipped).toBe(false);
    expect(result.totalSystemOrbits).toBe(21);
    expect(result.unassignedWorlds).toBe(0);

    const primary = result.starAllocations.find((s) => s.starKey === "primary");
    const b = result.starAllocations.find((s) => s.starKey === "secondary-1");
    const cab = result.starAllocations.find((s) => s.starKey === "secondary-2");

    expect(primary.totalStarOrbits).toBe(13);
    expect(b.totalStarOrbits).toBe(2);
    expect(cab.totalStarOrbits).toBe(6);

    expect(primary.assignedWorlds).toBe(11);
    expect(b.assignedWorlds).toBe(1);
    expect(cab.assignedWorlds).toBe(5);
  });

  it("orders secondaries by ascending orbit and applies primary-up/intermediate-down/last-remainder", () => {
    const result = allocateWorldsByStar({
      totalWorlds: 10,
      primary: {},
      // Intentionally unsorted secondaries
      secondaries: [{ orbitNumber: 14 }, { orbitNumber: 6 }],
      availableOrbits: {
        primaryOrbits: [{ min: 0, max: 6.2 }], // +1 => floor(7.2)=7
        secondaryOrbits: [
          { min: 0, max: 2.4 }, // +1 => 3 (this is orbit 14 star)
          { min: 0, max: 1.5 }, // +1 => 2 (this is orbit 6 star)
        ],
      },
    });

    expect(result.totalSystemOrbits).toBe(12); // 7 + 2 + 3
    expect(result.starAllocations[0].starKey).toBe("primary");
    expect(result.starAllocations[1].orbitNumber).toBe(6);
    expect(result.starAllocations[2].orbitNumber).toBe(14);

    // Shares: 10*7/12=5.83 -> ceil 6, then 10*2/12=1.66 -> floor 1, last remainder 3
    expect(result.starAllocations[0].assignedWorlds).toBe(6);
    expect(result.starAllocations[1].assignedWorlds).toBe(1);
    expect(result.starAllocations[2].assignedWorlds).toBe(3);
    expect(result.unassignedWorlds).toBe(0);
  });

  it("does not add +1 bonus when star has zero allowable orbits", () => {
    const result = allocateWorldsByStar({
      totalWorlds: 4,
      primary: {},
      secondaries: [{ orbitNumber: 7 }],
      availableOrbits: {
        primaryOrbits: [{ min: 2, max: 2 }], // zero span
        secondaryOrbits: [{ min: 1, max: 1 }], // zero span
      },
    });

    expect(result.starAllocations[0].totalStarOrbits).toBe(0);
    expect(result.starAllocations[1].totalStarOrbits).toBe(0);
    expect(result.totalSystemOrbits).toBe(0);
    // Fallback behavior when totalSystemOrbits is zero
    expect(result.starAllocations[0].assignedWorlds).toBe(4);
    expect(result.starAllocations[1].assignedWorlds).toBe(0);
  });

  it("marks step as skipped for single-star systems", () => {
    const result = allocateWorldsByStar({
      totalWorlds: 9,
      primary: {},
      secondaries: [],
      availableOrbits: {
        primaryOrbits: [{ min: 0.4, max: 8.4 }],
      },
    });

    expect(result.stepSkipped).toBe(true);
    expect(result.starAllocations).toHaveLength(1);
    expect(result.starAllocations[0].assignedWorlds).toBe(9);
    expect(result.unassignedWorlds).toBe(0);
  });
});

// ── Placement Step 2: Determine System Baseline Number ──────────────────────

describe("calculateBaselineNumberDm", () => {
  it("applies primary class, worlds-band, and star-count DMs cumulatively", () => {
    const { dm } = calculateBaselineNumberDm({
      primary: { spectralClass: "G0", luminosityClass: "III" },
      totalWorlds: 11, // DM-2
      secondaryStarCount: 1, // DM-1
      companionStarCount: 0,
    });

    // +2 (class III) -2 (10-12 worlds) -1 (secondary) = -1
    expect(dm).toBe(-1);
  });

  it("matches Zed example DM total of -4", () => {
    const { dm } = calculateBaselineNumberDm({
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 17,
      secondaryStarCount: 2,
      companionStarCount: 2,
    });
    expect(dm).toBe(-4);
  });

  it("applies post-stellar and class VI penalties", () => {
    const { dm } = calculateBaselineNumberDm({
      primary: { spectralClass: "D", luminosityClass: "VI" },
      totalWorlds: 5,
      secondaryStarCount: 0,
      companionStarCount: 0,
    });
    // -1 (VI) -2 (post-stellar) -4 (<6 worlds)
    expect(dm).toBe(-7);
  });
});

describe("rollBaselineNumber", () => {
  it("returns 2D + DM total", () => {
    const result = rollBaselineNumber({
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 17,
      secondaryStarCount: 2,
      companionStarCount: 2,
      rng: rngFor2d(9),
    });

    expect(result.roll).toBe(9);
    expect(result.dm).toBe(-4);
    expect(result.total).toBe(5);
  });
});

describe("determineSystemBaselineNumber", () => {
  it("uses rolled mode when HZCO is available and reproduces Zed baseline 5", () => {
    const result = determineSystemBaselineNumber({
      hzco: 2.6,
      primaryOrbits: [{ min: 0.4, max: 20 }],
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 17,
      secondaryStarCount: 2,
      companionStarCount: 2,
      rng: rngFor2d(9),
    });

    expect(result.mode).toBe("rolled");
    expect(result.hzcoAvailable).toBe(true);
    expect(result.roll).toBe(9);
    expect(result.dm).toBe(-4);
    expect(result.baselineNumber).toBe(5);
  });

  it("returns cold mode baseline 0 when HZCO unavailable and no inner region exists", () => {
    const result = determineSystemBaselineNumber({
      hzco: 2.6,
      primaryOrbits: [{ min: 5.1, max: 20 }],
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 12,
    });

    expect(result.mode).toBe("cold");
    expect(result.baselineNumber).toBe(0);
    expect(result.roll).toBeNull();
  });

  it("returns split mode baseline = innerRegionWorldCount + 1 when override is provided", () => {
    const result = determineSystemBaselineNumber({
      hzco: 2.6,
      primaryOrbits: [
        { min: 0.4, max: 1.8 },
        { min: 5.2, max: 20 },
      ],
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 17,
      primaryAllocatedWorlds: 11,
      innerRegionWorldCount: 3,
    });

    expect(result.mode).toBe("split");
    expect(result.hzcoAvailable).toBe(false);
    expect(result.innerRegionWorldCount).toBe(3);
    expect(result.baselineNumber).toBe(4);
  });

  it("clamps randomly chosen split inner count to primaryAllocatedWorlds", () => {
    const result = determineSystemBaselineNumber({
      hzco: 2.6,
      primaryOrbits: [
        { min: 0.4, max: 1.8 },
        { min: 5.2, max: 20 },
      ],
      primary: { spectralClass: "G0", luminosityClass: "V" },
      totalWorlds: 17,
      primaryAllocatedWorlds: 2,
      // would choose max bucket
      rng: fixedRng(0.9999),
    });

    expect(result.mode).toBe("split");
    expect(result.innerRegionWorldCount).toBe(2);
    expect(result.baselineNumber).toBe(3);
  });
});

// ── Placement Step 3: Determine System Baseline Orbit ───────────────────────

describe("adjustOrbitIntoAvailableRange", () => {
  it("does not adjust when orbit is already available", () => {
    const result = adjustOrbitIntoAvailableRange(3.2, [{ min: 0.5, max: 4.0 }], rngFor2d(9));
    expect(result.adjusted).toBe(false);
    expect(result.orbit).toBe(3.2);
    expect(result.varianceRoll).toBeNull();
  });

  it("moves orbit inward from nearest min boundary when baseline is in a gap", () => {
    // nearest boundary is 3.0 (min of second range), inward variance from roll 9 => |+2|/10 = 0.2
    const result = adjustOrbitIntoAvailableRange(
      2.9,
      [
        { min: 0.5, max: 1.5 },
        { min: 3.0, max: 5.0 },
      ],
      rngFor2d(9),
    );
    expect(result.adjusted).toBe(true);
    expect(result.orbit).toBeCloseTo(3.2, 10);
    expect(result.varianceRoll).toBe(2);
  });

  it("moves orbit inward from nearest max boundary when baseline is outside high end", () => {
    // nearest boundary is 5.0 (max), inward variance from roll 11 => |+4|/10 = 0.4
    const result = adjustOrbitIntoAvailableRange(6.2, [{ min: 3.0, max: 5.0 }], rngFor2d(11));
    expect(result.adjusted).toBe(true);
    expect(result.orbit).toBeCloseTo(4.6, 10);
  });
});

describe("determineSystemBaselineOrbit", () => {
  it("Step 3A: baseline between 1 and total worlds uses HZCO +/- (2D-7)/10", () => {
    // Zed example equivalent: HZCO 3.3 with roll 5 => -2 => 3.1
    const result = determineSystemBaselineOrbit({
      baselineNumber: 5,
      totalWorlds: 17,
      hzco: 3.3,
      primaryOrbits: [{ min: 0.4, max: 20 }],
      rng: rngFor2d(5),
    });

    expect(result.mode).toBe("between");
    expect(result.formulaRoll).toBe(-2);
    expect(result.rawBaselineOrbit).toBeCloseTo(3.1, 10);
    expect(result.baselineOrbit).toBeCloseTo(3.1, 10);
  });

  it("Step 3A uses /100 variance when HZCO < 1", () => {
    const result = determineSystemBaselineOrbit({
      baselineNumber: 2,
      totalWorlds: 10,
      hzco: 0.72,
      primaryOrbits: [{ min: 0.1, max: 2.0 }],
      rng: rngFor2d(9), // +2
    });

    expect(result.mode).toBe("between");
    expect(result.rawBaselineOrbit).toBeCloseTo(0.74, 10);
  });

  it("Step 3B: baseline < 1 with minimum orbit >= 1 uses cold-system formula", () => {
    const result = determineSystemBaselineOrbit({
      baselineNumber: 0,
      totalWorlds: 9,
      hzco: 2.6,
      minimumOrbit: 1.2,
      primaryOrbits: [{ min: 1.2, max: 20 }],
      rng: rngFor2d(7), // (2D-2)=5
    });

    expect(result.mode).toBe("cold");
    expect(result.formulaRoll).toBe(5);
    expect(result.rawBaselineOrbit).toBeCloseTo(12.1, 10);
  });

  it("Step 3B: baseline < 1 with minimum orbit < 1 uses low-orbit formula", () => {
    const result = determineSystemBaselineOrbit({
      baselineNumber: 0,
      totalWorlds: 9,
      hzco: 0.72,
      minimumOrbit: 0.4,
      primaryOrbits: [{ min: 0.4, max: 20 }],
      rng: rngFor2d(7), // (2D-2)=5
    });

    expect(result.mode).toBe("cold");
    expect(result.rawBaselineOrbit).toBeCloseTo(0.45, 10);
  });

  it("Step 3C: baseline > total worlds with high result >=1 uses hot formula", () => {
    const result = determineSystemBaselineOrbit({
      baselineNumber: 18,
      totalWorlds: 17,
      hzco: 3.3,
      primaryOrbits: [{ min: 0.1, max: 20 }],
      rng: rngFor2d(9), // +2 -> +0.4
    });

    expect(result.mode).toBe("hot");
    expect(result.rawBaselineOrbit).toBeCloseTo(2.7, 10);
  });

  it("Step 3C low-result path applies negative fallback floor rule", () => {
    const result = determineSystemBaselineOrbit({
      baselineNumber: 25,
      totalWorlds: 17,
      hzco: 0.72,
      primaryMao: 0.4,
      primaryOrbits: [{ min: 0.4, max: 20 }],
      rng: rngFor2d(7),
    });

    expect(result.mode).toBe("hot");
    // max(hzco-0.1=0.62, mao+worlds*0.01=0.57) = 0.62
    expect(result.rawBaselineOrbit).toBeCloseTo(0.62, 10);
    expect(result.baselineOrbit).toBeCloseTo(0.62, 10);
  });

  it("applies unavailable-orbit correction with inward variance", () => {
    // First roll (7) keeps raw at 2.9; second roll (9) adjusts from boundary 3.0 to 3.2
    const rng = seqRng((4 - 1) / 6, (3 - 1) / 6, (5 - 1) / 6, (4 - 1) / 6);

    const result = determineSystemBaselineOrbit({
      baselineNumber: 5,
      totalWorlds: 10,
      hzco: 2.9,
      primaryOrbits: [
        { min: 0.5, max: 1.5 },
        { min: 3.0, max: 5.0 },
      ],
      rng,
    });

    expect(result.rawBaselineOrbit).toBeCloseTo(2.9, 10);
    expect(result.adjustedForAvailability).toBe(true);
    expect(result.adjustmentRoll).toBe(2);
    expect(result.baselineOrbit).toBeCloseTo(3.2, 10);
  });
});

// ── Placement Step 4: Empty Orbits ───────────────────────────────────────────

describe("lookupEmptyOrbitQuantity", () => {
  it("returns 0 for totals 2-9", () => {
    expect(lookupEmptyOrbitQuantity(2)).toBe(0);
    expect(lookupEmptyOrbitQuantity(9)).toBe(0);
  });

  it("returns 1 for total 10", () => {
    expect(lookupEmptyOrbitQuantity(10)).toBe(1);
  });

  it("returns 2 for total 11", () => {
    expect(lookupEmptyOrbitQuantity(11)).toBe(2);
  });

  it("returns 3 for total 12+", () => {
    expect(lookupEmptyOrbitQuantity(12)).toBe(3);
    expect(lookupEmptyOrbitQuantity(13)).toBe(3);
  });
});

describe("rollEmptyOrbitQuantity", () => {
  it("roll 10 yields quantity 1", () => {
    const result = rollEmptyOrbitQuantity({ rng: rngFor2d(10) });
    expect(result.roll).toBe(10);
    expect(result.quantity).toBe(1);
  });

  it("roll 12 yields quantity 3", () => {
    const result = rollEmptyOrbitQuantity({ rng: rngFor2d(12) });
    expect(result.roll).toBe(12);
    expect(result.quantity).toBe(3);
  });
});

describe("allocateEmptyOrbits", () => {
  it("matches Zed example: one empty orbit goes to Near star when Close is unavailable", () => {
    const step1 = allocateWorldsByStar({
      totalWorlds: 17,
      primary: {
        companion: { spectralClass: "M0", luminosityClass: "V" },
      },
      secondaries: [
        { orbitNumber: 6.0, zone: "near" },
        { orbitNumber: 14.0, zone: "far", companion: { spectralClass: "M5", luminosityClass: "V" } },
      ],
      availableOrbits: {
        primaryOrbits: [{ min: 0, max: 13.39 }],
        secondaryOrbits: [
          { min: 0, max: 1.08 },
          { min: 0, max: 6.36 },
        ],
      },
    });

    const result = allocateEmptyOrbits({
      emptyOrbitCount: 1,
      starAllocations: step1.starAllocations,
      secondaries: [
        { zone: "near", orbitNumber: 6.0 },
        { zone: "far", orbitNumber: 14.0 },
      ],
    });

    const near = result.starAllocations.find((s) => s.starKey === "secondary-1");
    expect(near.emptyOrbitSlots).toBe(1);
    expect(near.totalStarOrbitsWithEmpty).toBe(near.totalStarOrbits + 1);
    expect(result.placements[0].reason).toBe("zone-priority-near");
  });

  it("allocates in Close, then Near, then Far order", () => {
    const result = allocateEmptyOrbits({
      emptyOrbitCount: 3,
      starAllocations: [
        { starKey: "primary", totalStarOrbits: 10, allowableOrbits: 10 },
        { starKey: "secondary-1", totalStarOrbits: 2, allowableOrbits: 2 },
        { starKey: "secondary-2", totalStarOrbits: 2, allowableOrbits: 2 },
        { starKey: "secondary-3", totalStarOrbits: 2, allowableOrbits: 2 },
      ],
      secondaries: [
        { zone: "near", orbitNumber: 8 },
        { zone: "far", orbitNumber: 15 },
        { zone: "close", orbitNumber: 4 },
      ],
    });

    expect(result.placements.map((p) => p.reason)).toEqual([
      "zone-priority-close",
      "zone-priority-near",
      "zone-priority-far",
    ]);
    expect(result.unallocatedEmptyOrbits).toBe(0);
  });

  it("sends remainder to primary", () => {
    const result = allocateEmptyOrbits({
      emptyOrbitCount: 3,
      starAllocations: [
        { starKey: "primary", totalStarOrbits: 10, allowableOrbits: 10 },
        { starKey: "secondary-1", totalStarOrbits: 2, allowableOrbits: 2 },
      ],
      secondaries: [{ zone: "near", orbitNumber: 8 }],
    });

    const primary = result.starAllocations.find((s) => s.starKey === "primary");
    const near = result.starAllocations.find((s) => s.starKey === "secondary-1");
    expect(near.emptyOrbitSlots).toBe(1);
    expect(primary.emptyOrbitSlots).toBe(2);
    expect(primary.totalStarOrbitsWithEmpty).toBe(12);
    expect(result.unallocatedEmptyOrbits).toBe(0);
  });

  it("does not allocate to stars with zero available orbits", () => {
    const result = allocateEmptyOrbits({
      emptyOrbitCount: 2,
      starAllocations: [
        { starKey: "primary", totalStarOrbits: 0, allowableOrbits: 0 },
        { starKey: "secondary-1", totalStarOrbits: 0, allowableOrbits: 0 },
      ],
      secondaries: [{ zone: "near", orbitNumber: 8 }],
    });

    expect(result.placements).toHaveLength(0);
    expect(result.unallocatedEmptyOrbits).toBe(2);
  });
});

// ── Placement Step 5: Determine System Spread ───────────────────────────────

describe("calculateSystemSpread", () => {
  it("matches Zed example: (3.1 - 0.61) / 5 = 0.498 -> rounded 0.50", () => {
    const result = calculateSystemSpread({
      baselineOrbit: 3.1,
      baselineNumber: 5,
      primaryMao: 0.61,
      primaryAvailableOrbits: 13.39,
      primaryAllocatedOrbits: 11,
      totalStars: 5,
    });

    expect(result.rawSpread).toBeCloseTo(0.498, 6);
    expect(result.roundedSpread).toBe(0.5);
    expect(result.baselineDivisor).toBe(5);
  });

  it("treats baseline number < 1 as 1 for spread calculations", () => {
    const result = calculateSystemSpread({
      baselineOrbit: 2.1,
      baselineNumber: 0,
      primaryMao: 0.6,
      primaryAvailableOrbits: 12,
      primaryAllocatedOrbits: 6,
      totalStars: 2,
    });

    expect(result.baselineDivisor).toBe(1);
    expect(result.spread).toBeCloseTo(1.5, 10);
  });

  it("caps spread by Maximum Spread when projection exceeds Orbit# 20", () => {
    const result = calculateSystemSpread({
      baselineOrbit: 3.0,
      baselineNumber: 1,
      primaryMao: 0.5,
      primaryAvailableOrbits: 9,
      primaryAllocatedOrbits: 12,
      totalStars: 3,
    });

    expect(result.maxSpread).toBeCloseTo(0.6, 10); // 9 / (12+3)
    expect(result.cappedByMaximumSpread).toBe(true);
    expect(result.spread).toBeCloseTo(0.6, 10);
    expect(result.projectedOutermostOrbit).toBeLessThanOrEqual(20);
  });

  it("derives primary available orbits from primary ranges when omitted", () => {
    const result = calculateSystemSpread({
      baselineOrbit: 3.1,
      baselineNumber: 5,
      primaryMao: 0.61,
      primaryOrbits: [{ min: 0.61, max: 14.0 }],
      primaryAllocatedOrbits: 11,
      totalStars: 5,
    });

    expect(result.maxSpread).toBeCloseTo((14 - 0.61) / (11 + 5), 10);
  });
});

describe("calculateSecondarySpread", () => {
  it("keeps system spread when secondary maximum is not larger", () => {
    const result = calculateSecondarySpread({
      systemSpread: 0.5,
      secondaryMao: 0.2,
      secondaryOutermostOrbit: 2.2,
      secondaryAllocatedOrbits: 4,
    });

    expect(result.maxSecondarySpread).toBeCloseTo(0.4, 10);
    expect(result.usedSecondaryMaximum).toBe(false);
    expect(result.spread).toBe(0.5);
  });

  it("raises spread when secondary maximum exceeds system spread", () => {
    const result = calculateSecondarySpread({
      systemSpread: 0.5,
      secondaryMao: 0.4,
      secondaryOutermostOrbit: 6.4,
      secondaryAllocatedOrbits: 4,
    });

    expect(result.maxSecondarySpread).toBeCloseTo(1.2, 10);
    expect(result.usedSecondaryMaximum).toBe(true);
    expect(result.spread).toBeCloseTo(1.2, 10);
    expect(result.roundedSpread).toBe(1.2);
  });
});

describe("calculateSecondarySpreads", () => {
  it("maps each secondary and applies optional maximum spread per star", () => {
    const result = calculateSecondarySpreads({
      systemSpread: 0.5,
      secondaryOrbits: [
        { min: 0.01, max: 1.1 },
        { min: 0.4, max: 6.4 },
      ],
      starAllocations: [
        { starKey: "primary", totalStarOrbitsWithEmpty: 11 },
        { starKey: "secondary-1", totalStarOrbitsWithEmpty: 2 },
        { starKey: "secondary-2", totalStarOrbitsWithEmpty: 4 },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0].starKey).toBe("secondary-1");
    expect(result[0].spread).toBe(0.5);
    expect(result[0].usedSecondaryMaximum).toBe(false);
    expect(result[1].starKey).toBe("secondary-2");
    expect(result[1].spread).toBeCloseTo(1.2, 10);
    expect(result[1].usedSecondaryMaximum).toBe(true);
  });
});

// ── Placement Step 6: Placing Orbit# Slots ──────────────────────────────────

describe("shiftOrbitAcrossExclusions", () => {
  it("adds exclusion-zone width when orbit lands in a gap", () => {
    const result = shiftOrbitAcrossExclusions(5.2, [
      { min: 0.61, max: 5.11 },
      { min: 7.09, max: 10.1 },
    ]);

    expect(result.totalShift).toBeCloseTo(1.98, 10);
    expect(result.orbit).toBeCloseTo(7.18, 10);
    expect(result.stillUnavailable).toBe(false);
  });

  it("does not shift when orbit is already available", () => {
    const result = shiftOrbitAcrossExclusions(3.5, [{ min: 0.61, max: 5.11 }]);
    expect(result.totalShift).toBe(0);
    expect(result.orbit).toBe(3.5);
  });
});

describe("placeStarOrbitSlots", () => {
  it("produces Zed-like inner slots around baseline with variance and 1-digit rounding above 1", () => {
    const result = placeStarOrbitSlots({
      slotCount: 5,
      mao: 0.61,
      spread: 0.5,
      baselineNumber: 5,
      baselineOrbit: 3.1,
      availableOrbits: [{ min: 0.61, max: 20 }],
      useVariance: true,
      rng: rngFor2dSequence(5, 9, 7, 9),
      roundingDigits: 2,
      roundingDigitsAtOrAboveOne: 1,
    });

    expect(result.baselineIndex).toBe(5);
    expect(result.slots.map((s) => s.orbit)).toEqual([1.0, 1.6, 2.1, 2.7, 3.1]);
  });

  it("shifts outer slots across unavailable gaps by exclusion width", () => {
    const result = placeStarOrbitSlots({
      slotCount: 2,
      mao: 0.61,
      spread: 0.5,
      baselineNumber: 1,
      baselineOrbit: 4.7,
      availableOrbits: [
        { min: 0.61, max: 5.11 },
        { min: 7.09, max: 10.1 },
      ],
      useVariance: true,
      rng: rngFor2d(7),
      roundingDigits: 2,
    });

    expect(result.slots[1].nominalOrbit).toBeCloseTo(5.2, 10);
    expect(result.slots[1].exclusionShift).toBeCloseTo(1.98, 10);
    expect(result.slots[1].orbit).toBeCloseTo(7.18, 10);
  });

  it("uses baseline index 1 when baseline number < 1", () => {
    const result = placeStarOrbitSlots({
      slotCount: 3,
      mao: 0.4,
      spread: 0.5,
      baselineNumber: 0,
      baselineOrbit: 12.0,
      useVariance: false,
    });

    expect(result.baselineIndex).toBe(1);
    expect(result.slots.map((s) => s.orbit)).toEqual([12, 12.5, 13]);
  });

  it("uses final slot as baseline when baseline number > slotCount", () => {
    const result = placeStarOrbitSlots({
      slotCount: 3,
      mao: 0.1,
      spread: 0.2,
      baselineNumber: 7,
      baselineOrbit: 0.9,
      useVariance: false,
      roundingDigits: 2,
    });

    expect(result.baselineIndex).toBe(3);
    expect(result.slots.map((s) => s.orbit)).toEqual([0.3, 0.5, 0.9]);
  });

  it("supports non-cumulative variance mode", () => {
    const cumulative = placeStarOrbitSlots({
      slotCount: 3,
      mao: 0.6,
      spread: 0.5,
      baselineNumber: 3,
      baselineOrbit: 2.0,
      useVariance: true,
      propagateVaried: true,
      rng: rngFor2dSequence(9, 5),
      roundingDigits: 2,
    });

    const nonCumulative = placeStarOrbitSlots({
      slotCount: 3,
      mao: 0.6,
      spread: 0.5,
      baselineNumber: 3,
      baselineOrbit: 2.0,
      useVariance: true,
      propagateVaried: false,
      rng: rngFor2dSequence(9, 5),
      roundingDigits: 2,
    });

    expect(cumulative.slots[1].orbit).toBeCloseTo(1.6, 10);
    expect(nonCumulative.slots[1].orbit).toBeCloseTo(1.5, 10);
  });
});

// ── Placement Step 7: Add Anomalous Planets ─────────────────────────────────

describe("lookupAnomalousOrbitQuantity", () => {
  it("maps table 15 ranges", () => {
    expect(lookupAnomalousOrbitQuantity(9)).toBe(0);
    expect(lookupAnomalousOrbitQuantity(10)).toBe(1);
    expect(lookupAnomalousOrbitQuantity(11)).toBe(2);
    expect(lookupAnomalousOrbitQuantity(12)).toBe(3);
  });
});

describe("rollAnomalousOrbitQuantity", () => {
  it("roll 10 gives one anomalous orbit", () => {
    const result = rollAnomalousOrbitQuantity({ rng: rngFor2d(10) });
    expect(result.roll).toBe(10);
    expect(result.quantity).toBe(1);
  });
});

describe("lookupAnomalousOrbitType", () => {
  it("maps table 16 ranges", () => {
    expect(lookupAnomalousOrbitType(7)).toBe("random");
    expect(lookupAnomalousOrbitType(8)).toBe("eccentric");
    expect(lookupAnomalousOrbitType(9)).toBe("inclined");
    expect(lookupAnomalousOrbitType(10)).toBe("retrograde");
    expect(lookupAnomalousOrbitType(12)).toBe("trojan");
  });
});

describe("rollAnomalousOrbitType", () => {
  it("roll 10 produces retrograde type", () => {
    const result = rollAnomalousOrbitType({ rng: rngFor2d(10) });
    expect(result.roll).toBe(10);
    expect(result.type).toBe("retrograde");
  });
});

describe("applyAnomalousOrbitCount", () => {
  it("adds anomalous worlds to terrestrials up to cap 13", () => {
    const result = applyAnomalousOrbitCount({
      anomalousOrbitCount: 1,
      terrestrialPlanetCount: 11,
      planetoidBeltCount: 1,
      totalWorlds: 17,
    });

    expect(result.terrestrialPlanetCount).toBe(12);
    expect(result.planetoidBeltCount).toBe(1);
    expect(result.totalWorlds).toBe(18);
    expect(result.anomalousAsTerrestrial).toBe(1);
    expect(result.anomalousAsBelts).toBe(0);
  });

  it("over-cap anomalous worlds become planetoid belts", () => {
    const result = applyAnomalousOrbitCount({
      anomalousOrbitCount: 3,
      terrestrialPlanetCount: 12,
      planetoidBeltCount: 1,
      totalWorlds: 17,
    });

    expect(result.terrestrialPlanetCount).toBe(13);
    expect(result.planetoidBeltCount).toBe(3);
    expect(result.totalWorlds).toBe(20);
    expect(result.anomalousAsTerrestrial).toBe(1);
    expect(result.anomalousAsBelts).toBe(2);
  });
});

describe("selectAnomalousOrbitParent", () => {
  it("chooses only from eligible parents with non-zero orbits", () => {
    const selected = selectAnomalousOrbitParent({
      parents: [
        { starKey: "primary", allowableOrbits: 0 },
        { starKey: "secondary-1", allowableOrbits: 2 },
      ],
      rng: fixedRng(0),
    });

    expect(selected.starKey).toBe("secondary-1");
  });
});

describe("rollRandomAnomalousOrbit", () => {
  it("accepts near-boundary unavailable orbit under leeway (Zed-style tolerance)", () => {
    // 2D-2 => 5 (roll 7), d10 => 2 => orbit 5.2
    const rng = seqRng((4 - 1) / 6, (3 - 1) / 6, (2 - 1) / 10);
    const result = rollRandomAnomalousOrbit({
      mao: 0.61,
      availableOrbits: [
        { min: 0.61, max: 5.11 },
        { min: 7.09, max: 10.1 },
      ],
      allowLeewayPercent: 0.1,
      rng,
    });

    expect(result.orbit).toBeCloseTo(5.2, 10);
    expect(result.unavailableInitially).toBe(true);
    expect(result.acceptedByLeeway).toBe(true);
  });

  it("nudges unavailable orbit by 1D toward availability when leeway is disabled", () => {
    // base 5.2, then nudge 1 inward => 4.2
    const rng = seqRng((4 - 1) / 6, (3 - 1) / 6, (2 - 1) / 10, (1 - 1) / 6);
    const result = rollRandomAnomalousOrbit({
      mao: 0.61,
      availableOrbits: [
        { min: 0.61, max: 5.11 },
        { min: 7.09, max: 10.1 },
      ],
      allowLeewayPercent: 0,
      rng,
    });

    expect(result.acceptedByLeeway).toBe(false);
    expect(result.nudges).toEqual([1]);
    expect(result.orbit).toBeCloseTo(4.2, 10);
  });
});

describe("generateAnomalousOrbit", () => {
  const parents = [
    {
      starKey: "primary",
      allowableOrbits: 10,
      mao: 0.61,
      availableOrbits: [{ min: 0.61, max: 20 }],
      slotOrbits: [1.1, 1.6, 2.1],
    },
  ];

  it("retrograde sets retrograde flag and eccentricity DM+2", () => {
    const result = generateAnomalousOrbit({
      type: "retrograde",
      parents,
      rng: seqRng(
        0, // parent index
        (4 - 1) / 6,
        (3 - 1) / 6,
        (2 - 1) / 10,
      ),
    });

    expect(result.type).toBe("retrograde");
    expect(result.retrograde).toBe(true);
    expect(result.eccentricityDm).toBe(2);
    expect(result.starKey).toBe("primary");
  });

  it("trojan chooses existing slot and lead/trail position", () => {
    const result = generateAnomalousOrbit({
      type: "trojan",
      parents,
      rng: seqRng(
        0, // parent index
        0, // slot index 0
        (2 - 1) / 6,
      ),
    });

    expect(result.type).toBe("trojan");
    expect(result.orbit).toBe(1.1);
    expect(result.trojanPosition).toBe("leading");
  });
});

describe("generateAnomalousOrbits", () => {
  it("produces count, updates totals, and generates anomaly entries", () => {
    const result = generateAnomalousOrbits({
      anomalousOrbitCount: 1,
      terrestrialPlanetCount: 11,
      planetoidBeltCount: 1,
      totalWorlds: 17,
      parents: [
        {
          starKey: "primary",
          allowableOrbits: 10,
          mao: 0.61,
          availableOrbits: [{ min: 0.61, max: 20 }],
          slotOrbits: [1.1, 1.6, 2.1],
        },
      ],
      // Type roll 10 => retrograde
      rng: seqRng((5 - 1) / 6, (5 - 1) / 6, 0, (4 - 1) / 6, (3 - 1) / 6, (2 - 1) / 10),
    });

    expect(result.anomalousOrbitCount).toBe(1);
    expect(result.updatedCounts.totalWorlds).toBe(18);
    expect(result.updatedCounts.terrestrialPlanetCount).toBe(12);
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].type).toBe("retrograde");
  });
});

describe("buildPlacementSlotRollTable", () => {
  it("assigns 1:1 through 1:6 then 2:1, 2:2, ...", () => {
    const table = buildPlacementSlotRollTable(8);

    expect(table).toHaveLength(8);
    expect(table[0].label).toBe("1:1");
    expect(table[5].label).toBe("1:6");
    expect(table[6].label).toBe("2:1");
    expect(table[7].label).toBe("2:2");
  });
});

describe("rollPlacementSlotReference", () => {
  it("rerolls prefix when it exceeds the max valid prefix", () => {
    const result = rollPlacementSlotReference({
      slotCount: 12,
      rng: seqRng(
        (6 - 1) / 6, // invalid prefix
        (2 - 1) / 6, // valid prefix
        (3 - 1) / 6, // face
      ),
    });

    expect(result.prefix).toBe(2);
    expect(result.face).toBe(3);
    expect(result.slotIndex).toBe(8);
    expect(result.prefixRerolls).toBe(1);
  });

  it("rerolls face in final partial prefix group", () => {
    const result = rollPlacementSlotReference({
      slotCount: 19,
      rng: seqRng(
        (4 - 1) / 6, // valid prefix 4
        (6 - 1) / 6, // invalid face for prefix 4 (only 1 valid)
        (1 - 1) / 6, // valid face
      ),
    });

    expect(result.prefix).toBe(4);
    expect(result.face).toBe(1);
    expect(result.maxFaceForPrefix).toBe(1);
    expect(result.slotIndex).toBe(18);
    expect(result.faceRerolls).toBe(1);
  });
});

describe("lookupBasicTerrestrialWorldDiameter", () => {
  it("returns expected diameters for numeric and hex size codes", () => {
    expect(lookupBasicTerrestrialWorldDiameter("1")).toBe(1600);
    expect(lookupBasicTerrestrialWorldDiameter("9")).toBe(14400);
    expect(lookupBasicTerrestrialWorldDiameter("A")).toBe(16000);
    expect(lookupBasicTerrestrialWorldDiameter("F")).toBe(24000);
  });

  it("supports ring and tiny-body codes in the table", () => {
    expect(lookupBasicTerrestrialWorldDiameter("R")).toBe(0);
    expect(lookupBasicTerrestrialWorldDiameter("S")).toBe(600);
  });
});

describe("rollBasicTerrestrialWorldSize", () => {
  it("uses 1D second roll for first roll 1-2", () => {
    const result = rollBasicTerrestrialWorldSize({
      rng: seqRng(
        (2 - 1) / 6, // first roll
        (6 - 1) / 6, // second roll 1D
      ),
    });

    expect(result.firstRoll).toBe(2);
    expect(result.secondRollFormula).toBe("1D");
    expect(result.secondRollTotal).toBe(6);
    expect(result.sizeCode).toBe("6");
    expect(result.basicDiameterKm).toBe(9600);
  });

  it("uses 2D second roll for first roll 3-4", () => {
    const result = rollBasicTerrestrialWorldSize({
      rng: seqRng(
        (3 - 1) / 6, // first roll
        (6 - 1) / 6,
        (6 - 1) / 6, // second roll 2D = 12
      ),
    });

    expect(result.firstRoll).toBe(3);
    expect(result.secondRollFormula).toBe("2D");
    expect(result.secondRollTotal).toBe(12);
    expect(result.sizeCode).toBe("C");
    expect(result.basicDiameterKm).toBe(19200);
  });

  it("uses 2D+3 second roll for first roll 5-6", () => {
    const result = rollBasicTerrestrialWorldSize({
      rng: seqRng(
        (6 - 1) / 6, // first roll
        (6 - 1) / 6,
        (6 - 1) / 6, // second roll 2D = 12
      ),
    });

    expect(result.firstRoll).toBe(6);
    expect(result.secondRollFormula).toBe("2D+3");
    expect(result.secondRollTotal).toBe(15);
    expect(result.sizeCode).toBe("F");
    expect(result.basicDiameterKm).toBe(24000);
  });
});

describe("assignBasicTerrestrialWorldSizes", () => {
  it("assigns terrestrial sizes and leaves non-terrestrial primaries unset", () => {
    const result = assignBasicTerrestrialWorldSizes({
      slots: [
        { slotId: "T1", primaryWorldType: "terrestrialPlanet", secondaryWorldTypes: [] },
        { slotId: "G1", primaryWorldType: "gasGiant", secondaryWorldTypes: [] },
      ],
      rng: seqRng(
        (2 - 1) / 6, // first roll => 1D branch
        (4 - 1) / 6, // second roll => size 4
      ),
    });

    const terrestrial = result.slots.find((slot) => slot.slotId === "T1");
    const gasGiant = result.slots.find((slot) => slot.slotId === "G1");

    expect(terrestrial.sizeCode).toBe("4");
    expect(terrestrial.basicDiameterKm).toBe(6400);
    expect(terrestrial.sizeRoll.source).toBe("rolled");

    expect(gasGiant.sizeCode).toBeNull();
    expect(gasGiant.basicDiameterKm).toBeNull();
    expect(gasGiant.sizeRoll).toBeNull();
  });

  it("uses provided mainworld size when available", () => {
    const result = assignBasicTerrestrialWorldSizes({
      slots: [{ slotId: "M1", primaryWorldType: "mainworld", secondaryWorldTypes: [] }],
      mainworld: { size: "A" },
      rng: fixedRng(0.999),
    });

    expect(result.slots[0].sizeCode).toBe("A");
    expect(result.slots[0].basicDiameterKm).toBe(16000);
    expect(result.slots[0].sizeRoll.source).toBe("mainworld-input");
  });
});

describe("calculateGasGiantSizingDm", () => {
  it("applies DM-1 for M-class V primary", () => {
    const result = calculateGasGiantSizingDm({
      primary: { spectralClass: "M3", luminosityClass: "V" },
    });

    expect(result.dm).toBe(-1);
  });

  it("applies DM-1 when system spread is below 0.1", () => {
    const result = calculateGasGiantSizingDm({
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.09,
    });

    expect(result.dm).toBe(-1);
  });

  it("stacks both DMs when both conditions apply", () => {
    const result = calculateGasGiantSizingDm({
      primary: { spectralClass: "M6", luminosityClass: "V" },
      systemSpread: 0.05,
    });

    expect(result.dm).toBe(-2);
  });
});

describe("rollGasGiantSize", () => {
  it("rolls small gas giant sizing branch", () => {
    const result = rollGasGiantSize({
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.5,
      rng: seqRng(
        (1 - 1) / 6, // first roll -> 1
        (1 - 1) / 6, // d3 #1 -> 1
        (6 - 1) / 6, // d3 #2 -> 3
        (5 - 1) / 6, // mass 1d -> 5
      ),
    });

    expect(result.categoryCode).toBe("GS");
    expect(result.diameterTerran).toBe(4);
    expect(result.diameterCode).toBe("4");
    expect(result.sahCode).toBe("GS4");
    expect(result.massEarth).toBe(30);
  });

  it("rolls medium gas giant sizing branch", () => {
    const result = rollGasGiantSize({
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.5,
      rng: seqRng(
        (3 - 1) / 6, // first roll -> 3
        (5 - 1) / 6, // diameter 1d -> 5 => 11
        (6 - 1) / 6,
        (6 - 1) / 6,
        (6 - 1) / 6, // mass 3d -> 18
      ),
    });

    expect(result.categoryCode).toBe("GM");
    expect(result.diameterTerran).toBe(11);
    expect(result.diameterCode).toBe("B");
    expect(result.sahCode).toBe("GMB");
    expect(result.massEarth).toBe(340);
  });

  it("rolls large gas giant and applies 3000+ mass correction", () => {
    const result = rollGasGiantSize({
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.5,
      rng: seqRng(
        (6 - 1) / 6, // first roll -> 6
        (6 - 1) / 6,
        (6 - 1) / 6, // diameter 2d -> 12 => 18
        (6 - 1) / 6, // d3 multiplier -> 3
        (6 - 1) / 6,
        (6 - 1) / 6,
        (6 - 1) / 6, // 3d -> 18 (>=15)
        (4 - 1) / 6,
        (3 - 1) / 6, // correction 2d -> 7 => (7-2)=5
      ),
    });

    expect(result.categoryCode).toBe("GL");
    expect(result.diameterTerran).toBe(18);
    expect(result.diameterCode).toBe("J");
    expect(result.sahCode).toBe("GLJ");
    expect(result.massInitialEarth).toBe(3300);
    expect(result.massCorrectionRoll).toBe(5);
    expect(result.massEarth).toBe(3000);
  });
});

describe("assignBasicGasGiantSizes", () => {
  it("assigns Table 18 size metadata to gas giant slots", () => {
    const result = assignBasicGasGiantSizes({
      slots: [{ slotId: "G1", primaryWorldType: "gasGiant" }],
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.5,
      rng: seqRng(
        (3 - 1) / 6, // first roll -> medium
        (5 - 1) / 6, // diameter -> 11
        (6 - 1) / 6,
        (6 - 1) / 6,
        (6 - 1) / 6, // mass 340
      ),
    });

    const sized = result.slots[0];
    expect(sized.size).toBe("G");
    expect(sized.sizeCode).toBe("GMB");
    expect(sized.gasGiantDiameterTerran).toBe(11);
    expect(sized.gasGiantMassEarth).toBe(340);
    expect(sized.basicDiameterKm).toBe(140800);
  });
});

describe("placeWorldsInSlots", () => {
  const slots = [
    { slotId: "A1", starKey: "A", orbit: 1.0 },
    { slotId: "A2", starKey: "A", orbit: 1.6 },
    { slotId: "A3", starKey: "A", orbit: 2.1 },
    { slotId: "A4", starKey: "A", orbit: 2.7 },
    { slotId: "A5", starKey: "A", orbit: 3.1 },
    { slotId: "A6", starKey: "A", orbit: 3.5 },
  ];

  it("places empty, gas giants, belts, then terrestrials with collision bumping", () => {
    const result = placeWorldsInSlots({
      slots,
      emptyOrbitCount: 1,
      gasGiantCount: 2,
      planetoidBeltCount: 1,
      terrestrialPlanetCount: 2,
      rng: seqRng(
        (1 - 1) / 6,
        (3 - 1) / 6, // empty -> A3
        (1 - 1) / 6,
        (5 - 1) / 6, // gas -> A5
        (1 - 1) / 6,
        (5 - 1) / 6, // gas -> A5 collision, bump to A6
        (1 - 1) / 6,
        (3 - 1) / 6, // belt -> A3 collision, bump to A4
        (1 - 1) / 6,
        (1 - 1) / 6, // terrestrial -> A1
        (1 - 1) / 6,
        (2 - 1) / 6, // terrestrial -> A2
      ),
    });

    const byId = Object.fromEntries(result.slots.map((slot) => [slot.slotId, slot]));

    expect(byId.A3.primaryWorldType).toBe("emptyOrbit");
    expect(byId.A5.primaryWorldType).toBe("gasGiant");
    expect(byId.A6.primaryWorldType).toBe("gasGiant");
    expect(byId.A4.primaryWorldType).toBe("planetoidBelt");
    expect(byId.A1.primaryWorldType).toBe("terrestrialPlanet");
    expect(byId.A2.primaryWorldType).toBe("terrestrialPlanet");
  });

  it("rerolls empty-orbit placement when an anomalous slot is selected", () => {
    const result = placeWorldsInSlots({
      slots: [
        { slotId: "A1", orbit: 1.0 },
        { slotId: "A2", orbit: 1.6, isAnomalousSlot: true },
        { slotId: "A3", orbit: 2.1 },
      ],
      emptyOrbitCount: 1,
      fillRemainingWithTerrestrials: false,
      rng: seqRng(
        (1 - 1) / 6,
        (2 - 1) / 6, // anomalous slot -> reroll
        (1 - 1) / 6,
        (3 - 1) / 6, // A3
      ),
    });

    expect(result.placements.emptyOrbits).toHaveLength(1);
    expect(result.placements.emptyOrbits[0].finalSlotId).toBe("A3");
    expect(result.placements.emptyOrbits[0].selectionRerolls).toBe(1);
  });

  it("converts mainworld to subordinate when a gas giant lands in its orbit", () => {
    const result = placeWorldsInSlots({
      slots: [
        { slotId: "A1", orbit: 1.0 },
        { slotId: "A2", orbit: 1.6 },
        { slotId: "A3", orbit: 2.1 },
      ],
      mainworld: {
        slotId: "A1",
        canBeMoon: true,
        isMoonKnown: false,
        size: 5,
      },
      gasGiantCount: 1,
      terrestrialPlanetCount: 0,
      fillRemainingWithTerrestrials: false,
      rng: seqRng(
        (1 - 1) / 6,
        (1 - 1) / 6, // gas giant -> A1
        (1 - 1) / 6,
        (2 - 1) / 6, // extra terrestrial -> A2
      ),
    });

    const byId = Object.fromEntries(result.slots.map((slot) => [slot.slotId, slot]));

    expect(byId.A1.primaryWorldType).toBe("gasGiant");
    expect(byId.A1.secondaryWorldTypes).toContain("mainworld");
    expect(result.counts.extraTerrestrialFromMainworld).toBe(1);
    expect(result.placements.terrestrials).toHaveLength(1);
    expect(result.placements.terrestrials[0].finalSlotId).toBe("A2");
  });

  it("supports known moon mainworld by placing parent and mainworld together", () => {
    const result = placeWorldsInSlots({
      slots: [
        { slotId: "A1", orbit: 1.0 },
        { slotId: "A2", orbit: 1.6 },
      ],
      mainworld: {
        slotId: "A1",
        isMoonKnown: true,
        parentWorldType: "gasGiant",
      },
      fillRemainingWithTerrestrials: false,
    });

    const byId = Object.fromEntries(result.slots.map((slot) => [slot.slotId, slot]));

    expect(byId.A1.primaryWorldType).toBe("gasGiant");
    expect(byId.A1.secondaryWorldTypes).toContain("mainworld");
  });

  it("assigns basic terrestrial size metadata during Step 8 placement", () => {
    const result = placeWorldsInSlots({
      slots: [
        { slotId: "A1", orbit: 1.0 },
        { slotId: "A2", orbit: 1.6 },
      ],
      terrestrialPlanetCount: 1,
      fillRemainingWithTerrestrials: false,
      rng: seqRng(
        (1 - 1) / 6,
        (1 - 1) / 6, // placement roll picks A1
        (2 - 1) / 6,
        (4 - 1) / 6, // size roll => 1D branch -> size 4
      ),
    });

    const sizedTerrestrial = result.slots.find((slot) => slot.slotId === "A1");
    expect(sizedTerrestrial.primaryWorldType).toBe("terrestrialPlanet");
    expect(sizedTerrestrial.sizeCode).toBe("4");
    expect(sizedTerrestrial.basicDiameterKm).toBe(6400);
    expect(result.sizing).toHaveProperty("terrestrial");
    expect(result.sizing.terrestrial).toHaveProperty("A1");
  });

  it("assigns gas giant sizing metadata during Step 8 placement", () => {
    const result = placeWorldsInSlots({
      slots: [{ slotId: "A1", orbit: 1.0 }],
      gasGiantCount: 1,
      fillRemainingWithTerrestrials: false,
      primary: { spectralClass: "G2", luminosityClass: "V" },
      systemSpread: 0.5,
      rng: seqRng(
        (1 - 1) / 6,
        (1 - 1) / 6, // placement roll picks A1
        (3 - 1) / 6, // first sizing roll -> medium
        (5 - 1) / 6, // diameter -> 11
        (6 - 1) / 6,
        (6 - 1) / 6,
        (6 - 1) / 6, // mass -> 340
      ),
    });

    const sizedGiant = result.slots.find((slot) => slot.slotId === "A1");
    expect(sizedGiant.primaryWorldType).toBe("gasGiant");
    expect(sizedGiant.sizeCode).toBe("GMB");
    expect(sizedGiant.gasGiantDiameterTerran).toBe(11);
    expect(sizedGiant.gasGiantMassEarth).toBe(340);
    expect(result.sizing).toHaveProperty("gasGiants");
    expect(result.sizing.gasGiants).toHaveProperty("A1");
  });
});

// ── Significant Moons: Step 10 ───────────────────────────────────────────────

describe("resolveSignificantMoonQuantityProfile", () => {
  it("maps terrestrial size 1-2 to 1D-5", () => {
    const profile = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "terrestrialPlanet",
      sizeCode: "2",
    });
    expect(profile).toMatchObject({ diceCount: 1, baseModifier: -5, formula: "1D-5" });
  });

  it("maps terrestrial size 3-9 to 2D-8", () => {
    const profile = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "terrestrialPlanet",
      sizeCode: "6",
    });
    expect(profile).toMatchObject({ diceCount: 2, baseModifier: -8, formula: "2D-8" });
  });

  it("maps terrestrial size A-F to 2D-6", () => {
    const profile = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "terrestrialPlanet",
      sizeCode: "B",
    });
    expect(profile).toMatchObject({ diceCount: 2, baseModifier: -6, formula: "2D-6" });
  });

  it("maps small gas giant to 3D-7", () => {
    const profile = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "gasGiant",
      sizeCode: "GS4",
    });
    expect(profile).toMatchObject({ diceCount: 3, baseModifier: -7, formula: "3D-7" });
  });

  it("maps medium and large gas giants to 4D-6", () => {
    const medium = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "gasGiant",
      sizeCode: "GMB",
    });
    const large = resolveSignificantMoonQuantityProfile({
      primaryWorldType: "gasGiant",
      sizeCode: "GLD",
    });
    expect(medium).toMatchObject({ diceCount: 4, baseModifier: -6, formula: "4D-6" });
    expect(large).toMatchObject({ diceCount: 4, baseModifier: -6, formula: "4D-6" });
  });
});

describe("calculateSignificantMoonDmPerDie", () => {
  it("applies DM-per-die for orbit less than 1", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: { starKey: "primary", orbit: 0.8 },
      systemSpread: 0.5,
    });
    expect(result.dmPerDie).toBe(-1);
    expect(result.conditions).toContain("orbit-below-one");
  });

  it("applies DM-per-die when adjacent to companion boundary", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: { starKey: "primary", orbit: 1.0 },
      primary: { companion: { spectralClass: "M1", luminosityClass: "V" } },
      availableOrbits: {
        primaryOrbits: [{ min: 0.61, max: 20 }],
      },
      systemSpread: 0.5,
    });
    expect(result.dmPerDie).toBe(-1);
    expect(result.conditions).toContain("adjacent-to-companion-boundary");
  });

  it("applies DM-per-die for primary slots adjacent to close/near unavailability", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: { starKey: "primary", orbit: 5.2 },
      secondaries: [
        {
          zone: "near",
          orbitNumber: 6.1,
          eccentricity: 0,
          spectralClass: "K5",
          luminosityClass: "V",
        },
      ],
      availableOrbits: {
        secondaryOrbits: [{ mao: 0.01, min: 0.01, max: 2.2 }],
      },
      systemSpread: 0.5,
    });
    expect(result.dmPerDie).toBe(-1);
    expect(result.conditions).toContain("adjacent-to-close-near-unavailability");
  });

  it("does not apply close/near unavailability DM for far star zones", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: { starKey: "primary", orbit: 5.2 },
      secondaries: [
        {
          zone: "far",
          orbitNumber: 6.1,
          eccentricity: 0,
          spectralClass: "K5",
          luminosityClass: "V",
        },
      ],
      availableOrbits: {
        secondaryOrbits: [{ mao: 0.01, min: 0.01, max: 2.2 }],
      },
      systemSpread: 0.5,
    });
    expect(result.dmPerDie).toBe(0);
  });

  it("applies DM-per-die for slots adjacent to secondary outermost range", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: { starKey: "secondary-1", orbit: 1.0 },
      secondaries: [
        {
          zone: "near",
          orbitNumber: 7.8,
          eccentricity: 0,
          spectralClass: "K5",
          luminosityClass: "V",
        },
      ],
      availableOrbits: {
        secondaryOrbits: [{ mao: 0.01, min: 0.01, max: 1.1 }],
      },
      systemSpread: 0.5,
      secondarySpreads: [{ starKey: "secondary-1", spread: 0.2 }],
    });
    expect(result.dmPerDie).toBe(-1);
    expect(result.conditions).toContain("adjacent-to-outermost-range");
  });

  it("supports optional Hill-sphere DM rule", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: {
        starKey: "primary",
        orbit: 2.0,
        hillSpherePlanetaryDiameters: 55,
      },
      systemSpread: 0.5,
      useHillSphereDmRule: true,
    });
    expect(result.dmPerDie).toBe(-1);
    expect(result.conditions).toContain("hill-sphere-below-60");
  });

  it("uses Hill-sphere rule exclusively when optional rule is enabled", () => {
    const result = calculateSignificantMoonDmPerDie({
      slot: {
        starKey: "primary",
        orbit: 0.8,
        hillSpherePlanetaryDiameters: 120,
      },
      systemSpread: 0.5,
      useHillSphereDmRule: true,
    });
    expect(result.dmPerDie).toBe(0);
    expect(result.conditions).toHaveLength(0);
  });
});

describe("rollSignificantMoonQuantityForSlot", () => {
  it("returns ring when total is exactly zero", () => {
    const result = rollSignificantMoonQuantityForSlot({
      slot: {
        slotId: "A1",
        starKey: "primary",
        orbit: 0.8,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "B",
      },
      systemSpread: 0.5,
      rng: seqRng((4 - 1) / 6, (4 - 1) / 6),
    });

    expect(result.eligible).toBe(true);
    expect(result.diceTotal).toBe(8);
    expect(result.totalDm).toBe(-2);
    expect(result.total).toBe(0);
    expect(result.significantMoonCount).toBe(0);
    expect(result.hasSignificantRing).toBe(true);
  });

  it("returns no significant moons when total is negative", () => {
    const result = rollSignificantMoonQuantityForSlot({
      slot: {
        slotId: "A1",
        starKey: "primary",
        orbit: 2.0,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "6",
      },
      systemSpread: 0.5,
      rng: rngFor2d(2),
    });

    expect(result.total).toBe(-6);
    expect(result.significantMoonCount).toBe(0);
    expect(result.hasSignificantRing).toBe(false);
  });

  it("returns positive moon quantity for successful rolls", () => {
    const result = rollSignificantMoonQuantityForSlot({
      slot: {
        slotId: "A1",
        starKey: "primary",
        orbit: 2.0,
        primaryWorldType: "gasGiant",
        sizeCode: "GMB",
      },
      systemSpread: 0.5,
      rng: seqRng((3 - 1) / 6, (3 - 1) / 6, (3 - 1) / 6, (3 - 1) / 6),
    });

    expect(result.diceTotal).toBe(12);
    expect(result.total).toBe(6);
    expect(result.significantMoonCount).toBe(6);
    expect(result.hasSignificantRing).toBe(false);
  });
});

describe("assignSignificantMoonQuantities", () => {
  it("assigns moon counts, ring flags, and totals across eligible slots", () => {
    const result = assignSignificantMoonQuantities({
      slots: [
        {
          slotId: "A1",
          starKey: "primary",
          orbit: 1.6,
          primaryWorldType: "terrestrialPlanet",
          sizeCode: "6",
        },
        {
          slotId: "A2",
          starKey: "primary",
          orbit: 0.8,
          primaryWorldType: "terrestrialPlanet",
          sizeCode: "B",
        },
        {
          slotId: "A3",
          starKey: "primary",
          orbit: 2.4,
          primaryWorldType: "planetoidBelt",
          sizeCode: "0",
        },
        {
          slotId: "A4",
          starKey: "primary",
          orbit: 3.2,
          primaryWorldType: "gasGiant",
          sizeCode: "GMB",
        },
      ],
      systemSpread: 0.5,
      rng: seqRng(
        (5 - 1) / 6,
        (5 - 1) / 6, // A1 2D = 10 => 2
        (4 - 1) / 6,
        (4 - 1) / 6, // A2 2D = 8 => 0 (ring with DM-2)
        (4 - 1) / 6,
        (4 - 1) / 6,
        (3 - 1) / 6,
        (3 - 1) / 6, // A4 4D = 14 => 8
      ),
    });

    const byId = Object.fromEntries(result.slots.map((slot) => [slot.slotId, slot]));
    expect(byId.A1.significantMoonQuantity).toBe(2);
    expect(byId.A1.hasSignificantRing).toBe(false);
    expect(byId.A2.significantMoonQuantity).toBe(0);
    expect(byId.A2.hasSignificantRing).toBe(true);
    expect(byId.A3.significantMoonQuantity).toBeUndefined();
    expect(byId.A4.significantMoonQuantity).toBe(8);

    expect(result.totals.significantMoons).toBe(10);
    expect(result.totals.ringWorlds).toBe(1);
    expect(result.totals.rolledWorlds).toBe(3);
    expect(result.moonRolls).toHaveProperty("A1");
    expect(result.moonRolls).toHaveProperty("A2");
    expect(result.moonRolls).toHaveProperty("A4");
  });
});

// ── Significant Moon Sizing: Step 11 ────────────────────────────────────────

describe("rollSignificantMoonSizeForParent", () => {
  it("returns Size S on Table 20 first-roll 1-3", () => {
    const result = rollSignificantMoonSizeForParent({
      slot: {
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "8",
      },
      rng: seqRng((2 - 1) / 6),
    });

    expect(result.sizeCode).toBe("S");
    expect(result.isRing).toBe(false);
  });

  it("returns ring on Table 20 moderate branch when D3-1 is zero", () => {
    const result = rollSignificantMoonSizeForParent({
      slot: {
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "8",
      },
      rng: seqRng(
        (4 - 1) / 6,
        (1 - 1) / 6, // D3 roll=1 -> size 0 -> ring
      ),
    });

    expect(result.sizeCode).toBe("R");
    expect(result.isRing).toBe(true);
  });

  it("applies terrestrial twin-world adjustment on exact parent-2 result", () => {
    const result = rollSignificantMoonSizeForParent({
      slot: {
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
      },
      rng: seqRng(
        (6 - 1) / 6,
        (1 - 1) / 6, // (5-1)-1 = 3 (exactly parent-2)
        (1 - 1) / 6,
        (1 - 1) / 6, // twin roll 2D = 2 => parent-1 (4)
      ),
    });

    expect(result.sizeCode).toBe("4");
    expect(result.rollTrace).toHaveProperty("twinRoll", 2);
  });

  it("creates constrained gas-giant moon outcomes from Table 21 special branch", () => {
    const result = rollSignificantMoonSizeForParent({
      slot: {
        primaryWorldType: "gasGiant",
        sizeCode: "GLC", // parent diameter 12
      },
      rng: seqRng(
        (6 - 1) / 6,
        (6 - 1) / 6, // first roll 6, special roll 6
        (6 - 1) / 6,
        (6 - 1) / 6, // special second roll 2D=12 => 16
        (6 - 1) / 6,
        (6 - 1) / 6, // parent large promotion roll 12 => medium moon
        (5 - 1) / 6, // medium diameter roll => 11
        (6 - 1) / 6,
        (6 - 1) / 6,
        (6 - 1) / 6, // medium mass roll 3D => 18
      ),
    });

    expect(result.isGasGiantMoon).toBe(true);
    expect(result.sizeCode).toBe("GMB");
    expect(result.gasGiantDiameterTerran).toBe(11);
    expect(result.gasGiantMassEarth).toBe(340);
  });
});

describe("assignSignificantMoonSizes", () => {
  it("aggregates moon sizes and ring notation as R0#", () => {
    const result = assignSignificantMoonSizes({
      slots: [
        {
          slotId: "A1",
          primaryWorldType: "terrestrialPlanet",
          sizeCode: "6",
          significantMoonQuantity: 2,
          hasSignificantRing: true,
        },
      ],
      rng: seqRng(
        (4 - 1) / 6,
        (1 - 1) / 6, // moon 1 => ring
        (2 - 1) / 6, // moon 2 => size S
      ),
    });

    const updated = result.slots[0];
    expect(updated.significantMoonSizes).toEqual(["R", "R", "S"]);
    expect(updated.significantRingCount).toBe(2);
    expect(updated.significantRingCode).toBe("R02");
    expect(updated.significantMoonCountAfterSizing).toBe(1);
    expect(result.totals.significantRings).toBe(2);
    expect(result.totals.significantMoonsAfterSizing).toBe(1);
    expect(result.sizingRolls).toHaveProperty("A1");
  });
});

// ── Significant Moon and Ring Characteristics (Chapter 5) ───────────────────

describe("calculateMoonOrbitLimits", () => {
  it("calculates Hill sphere and Roche limit values for the Zed Aab IV example", () => {
    const result = calculateMoonOrbitLimits({
      orbitalDistanceAu: 1.06,
      eccentricity: 0.1,
      planetMassEarth: 1200,
      starMassSolar: 1.836,
      planetDiameterKm: 14 * 12800,
    });

    expect(result).not.toBeNull();
    expect(result.hillSphereAu).toBeCloseTo(0.083, 2);
    expect(result.hillSphereKm).toBeCloseTo(12385400, -3);
    expect(result.hillSpherePd).toBeCloseTo(69.11, 1);
    expect(result.hillSphereMoonLimitPd).toBeCloseTo(34.56, 1);
    expect(result.rocheLimitPd).toBeCloseTo(1.537, 3);
  });

  it("returns null for invalid required inputs", () => {
    expect(calculateMoonOrbitLimits({ orbitalDistanceAu: 1.0, planetMassEarth: 10 })).toBeNull();
  });
});

describe("applyMoonRemovalByLimits", () => {
  it("converts first lost moon to a ring when limit is below Roche", () => {
    const result = applyMoonRemovalByLimits({
      hillSphereMoonLimitPd: 1.2,
      significantMoonCount: 3,
      significantRingCount: 0,
    });

    expect(result.significantMoonCount).toBe(0);
    expect(result.significantRingCount).toBe(1);
    expect(result.convertedFirstMoonToRing).toBe(true);
  });

  it("removes all rings too when limit drops below 0.5 PD", () => {
    const result = applyMoonRemovalByLimits({
      hillSphereMoonLimitPd: 0.4,
      significantMoonCount: 2,
      significantRingCount: 2,
    });

    expect(result.significantMoonCount).toBe(0);
    expect(result.significantRingCount).toBe(0);
    expect(result.noSignificantRingsAllowed).toBe(true);
  });
});

describe("calculateMoonOrbitRangeMor", () => {
  it("matches MOR example: floor(34.56) - 2 = 32", () => {
    const result = calculateMoonOrbitRangeMor({ hillSphereMoonLimitPd: 34.56, moonCount: 5 });
    expect(result.rawMor).toBe(32);
    expect(result.mor).toBe(32);
  });

  it("caps very large MOR to 200 + moonCount", () => {
    const result = calculateMoonOrbitRangeMor({ hillSphereMoonLimitPd: 260.9, moonCount: 5 });
    expect(result.rawMor).toBe(258);
    expect(result.mor).toBe(205);
  });
});

describe("rollMoonOrbitPd", () => {
  it("applies MOR<60 DM+1 to range roll and computes Inner-range orbit", () => {
    const rng = seqRng(0, 3 / 6, 2 / 6); // range=1 (+1 DM => inner), orbit roll=7 => 5 after -2
    const result = rollMoonOrbitPd({ mor: 32, rng });

    expect(result.rangeDm).toBe(1);
    expect(result.range).toBe("inner");
    expect(result.orbitPd).toBeCloseTo((5 * 32) / 60 + 2, 10);
    expect(result.roundedOrbitPd).toBe(5);
  });

  it("supports optional +/-0.5 PD variance", () => {
    const rng = seqRng(3 / 6, 3 / 6, 2 / 6, 0.9); // middle range, +0.4 variance
    const result = rollMoonOrbitPd({ mor: 80, addLinearVariance: true, rng });
    expect(result.variance).toBeCloseTo(0.4, 10);
  });
});

describe("assignSignificantMoonOrbits", () => {
  it("rolls and sorts moon orbits ascending", () => {
    const rng = seqRng(
      4 / 6,
      5 / 6,
      5 / 6, // moon 1 outer high
      0,
      0,
      0, // moon 2 inner low
      3 / 6,
      3 / 6,
      2 / 6, // moon 3 middle
    );

    const result = assignSignificantMoonOrbits({ moonCount: 3, mor: 32, rng });
    const rounded = result.moonOrbits.map((o) => o.roundedOrbitPd);
    expect(rounded).toEqual([2, 14, 36]);
  });

  it("bumps exact duplicate rounded orbits outward", () => {
    const rng = seqRng(
      0,
      0,
      0, // moon 1 -> rounded 2
      0,
      0,
      0, // moon 2 -> rounded 2, adjusted to 3
    );

    const result = assignSignificantMoonOrbits({ moonCount: 2, mor: 32, rng });
    expect(result.moonOrbits[0].roundedOrbitPd).toBe(2);
    expect(result.moonOrbits[1].roundedOrbitPd).toBe(3);
    expect(result.moonOrbits[1].adjustedForCollision).toBe(true);
  });
});

describe("calculateMoonOrbitDm", () => {
  it("returns expected DMs for range and MOR overflow", () => {
    expect(calculateMoonOrbitDm({ range: "inner" }).dm).toBe(-1);
    expect(calculateMoonOrbitDm({ range: "middle" }).dm).toBe(1);
    expect(calculateMoonOrbitDm({ range: "outer" }).dm).toBe(4);
    expect(calculateMoonOrbitDm({ range: "outer", exceedsMor: true }).dm).toBe(10);
  });
});

describe("rollMoonOrbitEccentricity", () => {
  it("uses moon-range DM with the shared eccentricity table", () => {
    const result = rollMoonOrbitEccentricity({
      range: "outer",
      rng: rngFor2dSequence(7, 8),
    });

    expect(result.dm).toBe(4);
    expect(result.eccentricityRoll.firstRoll).toBe(7);
    expect(result.eccentricityRoll.firstRollTotal).toBe(11);
    expect(result.eccentricity).toBeGreaterThan(0.05);
  });
});

describe("rollMoonOrbitDirection", () => {
  it("marks retrograde on 10+ after moon-range DMs", () => {
    const result = rollMoonOrbitDirection({ range: "inner", rng: rngFor2d(11) });
    expect(result.total).toBe(10);
    expect(result.retrograde).toBe(true);
  });
});

describe("calculateMoonOrbitalPeriodHours", () => {
  it("matches the Zed Prime period example (~624.69h, ~26.03d)", () => {
    const result = calculateMoonOrbitalPeriodHours({
      orbitPd: 22,
      parentDiameterKm: 14 * 12800,
      planetMassEarth: 1200,
    });

    expect(result.orbitKm).toBe(3942400);
    expect(result.periodHours).toBeCloseTo(624.69, 1);
    expect(result.periodDays).toBeCloseTo(26.03, 2);
    expect(result.periodHoursPdMethod).toBeCloseTo(result.periodHours, 2);
  });
});

describe("generateSignificantRings", () => {
  it("moves overlapping outer rings outward to be adjacent", () => {
    const result = generateSignificantRings({
      ringCount: 2,
      rng: fixedRng(0),
    });

    expect(result.rings).toHaveLength(2);
    expect(result.rings[0].centerPd).toBeCloseTo(0.65, 10);
    expect(result.rings[0].spanPd).toBeCloseTo(0.1, 10);
    expect(result.rings[1].centerPd).toBeCloseTo(0.75, 10);
    expect(result.rings[1].innerEdgePd).toBeCloseTo(result.rings[0].outerEdgePd, 10);
    expect(result.rings[1].adjustedForOverlap).toBe(true);
  });

  it("creates moon-carved ring gaps beyond Roche when moon orbit intersects", () => {
    const rng = seqRng(
      5 / 6,
      5 / 6, // center roll 12 -> 1.9 PD
      0,
      0,
      0, // span roll 3 -> 0.10 PD
      0, // gap multiplier roll 1 -> x3
    );

    const result = generateSignificantRings({
      ringCount: 1,
      moons: [{ orbitPd: 1.9, diameterKm: 1000 }],
      rng,
    });

    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0].gapMultiplier).toBe(3);
    expect(result.gaps[0].gapWidthKm).toBe(3000);
  });
});

describe("formatRingProfile", () => {
  it("formats detailed ring shorthand as R0#:C-S,...", () => {
    const profile = formatRingProfile({
      rings: [
        { centerPd: 0.65, spanPd: 0.1 },
        { centerPd: 0.75, spanPd: 0.1 },
      ],
    });
    expect(profile).toBe("R02:0.65-0.1,0.75-0.1");
  });
});

describe("assignSignificantMoonAndRingCharacteristics", () => {
  it("adds moon/ring chapter details to eligible slots", () => {
    const result = assignSignificantMoonAndRingCharacteristics({
      slots: [
        {
          slotId: "P-1",
          starKey: "primary",
          orbit: 1,
          eccentricity: 0.1,
          primaryWorldType: "gasGiant",
          basicDiameterKm: 179200,
          gasGiantMassEarth: 1200,
          significantMoonCountAfterSizing: 2,
          significantRingCount: 1,
          significantMoonSizeDetails: [
            { isRing: false, sizeCode: "5" },
            { isRing: false, sizeCode: "GS4", isGasGiantMoon: true, gasGiantDiameterTerran: 4, gasGiantMassEarth: 10 },
            { isRing: true, sizeCode: "R" },
          ],
        },
      ],
      stars: [{ spectralClass: "G2 V", luminosityClass: "V", massSolar: 1 }],
      rng: fixedRng(0),
    });

    const updated = result.slots[0];
    expect(updated.significantMoonOrbitLimits).toBeTruthy();
    expect(updated.significantMoonOrbitRangeMor.mor).toBeGreaterThan(0);
    expect(updated.significantMoonOrbitDetails).toHaveLength(2);
    expect(updated.significantRingDetails).toHaveLength(1);
    expect(updated.significantRingProfile.startsWith("R01:")).toBe(true);
    expect(updated.significantMoonRingCharacteristics).toBeTruthy();
    expect(result.totals.worldsWithCharacteristics).toBe(1);
  });

  it("removes moons and rings when Hill-sphere moon limit is too small", () => {
    const result = assignSignificantMoonAndRingCharacteristics({
      slots: [
        {
          slotId: "P-2",
          starKey: "primary",
          orbit: 0.05,
          eccentricity: 0,
          primaryWorldType: "gasGiant",
          basicDiameterKm: 30000,
          gasGiantMassEarth: 0.01,
          significantMoonCountAfterSizing: 2,
          significantRingCount: 1,
          significantMoonSizeDetails: [
            { isRing: false, sizeCode: "3" },
            { isRing: false, sizeCode: "4" },
            { isRing: true, sizeCode: "R" },
          ],
        },
      ],
      stars: [{ spectralClass: "G2 V", luminosityClass: "V", massSolar: 1 }],
      rng: fixedRng(0),
    });

    const updated = result.slots[0];
    expect(updated.significantMoonCountAfterLimitChecks).toBe(0);
    expect(updated.significantRingCountAfterLimitChecks).toBe(0);
    expect(updated.significantMoonLimitAdjustments.noSignificantRingsAllowed).toBe(true);
    expect(updated.significantMoonOrbitDetails).toHaveLength(0);
    expect(updated.significantRingDetails).toHaveLength(0);
  });
});

// ── Insignificant Moons: Step 12 ────────────────────────────────────────────

describe("resolveInsignificantMoonQuantityForSlot", () => {
  it("uses terrestrial size directly", () => {
    const result = resolveInsignificantMoonQuantityForSlot({
      slot: {
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "6",
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.baseSize).toBe(6);
    expect(result.multiplier).toBe(1);
    expect(result.quantity).toBe(6);
  });

  it("multiplies gas giant size by eight", () => {
    const result = resolveInsignificantMoonQuantityForSlot({
      slot: {
        primaryWorldType: "gasGiant",
        sizeCode: "GLC", // diameter 12
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.baseSize).toBe(12);
    expect(result.multiplier).toBe(8);
    expect(result.quantity).toBe(96);
  });
});

describe("assignInsignificantMoonQuantities", () => {
  it("assigns counts to eligible worlds and totals", () => {
    const result = assignInsignificantMoonQuantities({
      slots: [
        {
          slotId: "A1",
          primaryWorldType: "terrestrialPlanet",
          sizeCode: "4",
        },
        {
          slotId: "A2",
          primaryWorldType: "gasGiant",
          sizeCode: "GS4",
        },
        {
          slotId: "A3",
          primaryWorldType: "planetoidBelt",
          sizeCode: "0",
        },
      ],
    });

    const byId = Object.fromEntries(result.slots.map((slot) => [slot.slotId, slot]));
    expect(byId.A1.insignificantMoonQuantity).toBe(4);
    expect(byId.A2.insignificantMoonQuantity).toBe(32);
    expect(byId.A3.insignificantMoonQuantity).toBeUndefined();
    expect(result.totals.worlds).toBe(2);
    expect(result.totals.insignificantMoons).toBe(36);
    expect(result.rolls).toHaveProperty("A1");
    expect(result.rolls).toHaveProperty("A2");
  });
});

// ── Placement Of Worlds: Step 9 (Eccentricity) ────────────────────────────────

describe("calculateWorldEccentricityDm", () => {
  it("returns 0 dm with no modifiers", () => {
    const { dm, notes } = calculateWorldEccentricityDm({});
    expect(dm).toBe(0);
    expect(notes).toHaveLength(0);
  });

  it("applies eccentricity DM from anomalous orbit", () => {
    const { dm, notes } = calculateWorldEccentricityDm({
      anomalousEccentricityDm: 5,
    });
    expect(dm).toBe(5);
    expect(notes).toContain("DM+5 from anomalous orbit type.");
  });

  it("applies negative eccentricity DM from anomalous orbit", () => {
    const { dm, notes } = calculateWorldEccentricityDm({
      anomalousEccentricityDm: -2,
    });
    expect(dm).toBe(-2);
    expect(notes).toContain("DM-2 from anomalous orbit type.");
  });

  it("applies damping for close orbits in old systems", () => {
    const { dm, notes } = calculateWorldEccentricityDm({
      orbitNumber: 0.5,
      systemAgeGyr: 2,
    });
    expect(dm).toBe(-1);
    expect(notes).toContain("DM-1 for Orbit# < 1 in systems older than 1 Gyr.");
  });

  it("combines anomalous DM and orbital damping", () => {
    const { dm, notes } = calculateWorldEccentricityDm({
      orbitNumber: 0.3,
      systemAgeGyr: 5,
      anomalousEccentricityDm: 3,
    });
    expect(dm).toBe(2); // 3 - 1
    expect(notes).toContain("DM+3 from anomalous orbit type.");
    expect(notes).toContain("DM-1 for Orbit# < 1 in systems older than 1 Gyr.");
  });

  it("skips damping for young systems", () => {
    const { dm } = calculateWorldEccentricityDm({
      orbitNumber: 0.5,
      systemAgeGyr: 0.5,
    });
    expect(dm).toBe(0);
  });
});

describe("rollWorldEccentricity", () => {
  it("rolls 2d for eccentricity", () => {
    // Target first roll of 7 (no DM) -> baseValue = 0
    const result = rollWorldEccentricity({ rng: rngFor2d(7) });
    expect(result.firstRoll).toBe(7);
    expect(result.firstRollTotal).toBe(7);
    expect(result.baseValue).toBe(0);
  });

  it("applies DMs to first roll", () => {
    // Roll 7 with DM+2 = 9 total
    const result = rollWorldEccentricity({
      rng: rngFor2dSequence(7, 0),
      anomalousEccentricityDm: 2,
    });
    expect(result.firstRoll).toBe(7);
    expect(result.firstRollDm).toBe(2);
    expect(result.firstRollTotal).toBe(9);
  });

  it("uses correct eccentricity row for first roll total 5", () => {
    const result = rollWorldEccentricity({ rng: rngFor2d(5) });
    expect(result.firstRollTotal).toBe(5);
    expect(result.baseValue).toBe(-0.001);
    expect(result.secondRollDivisor).toBe(1000);
  });

  it("uses correct eccentricity row for first roll total 10", () => {
    const result = rollWorldEccentricity({ rng: rngFor2d(10) });
    expect(result.firstRollTotal).toBe(10);
    expect(result.baseValue).toBe(0.05);
    expect(result.secondRollDivisor).toBe(20);
  });

  it("uses 2d for second roll on high first roll total", () => {
    // First roll 12 (no DM) -> uses 2d for second roll
    const result = rollWorldEccentricity({
      rng: rngFor2dSequence(12, 7),
    });
    expect(result.firstRollTotal).toBe(12);
    expect(result.secondRoll).toBe(7);
    expect(result.eccentricity).toBeGreaterThan(0.3);
  });

  it("clamps eccentricity to valid range [0, 0.999]", () => {
    // Even with high rolls, should not exceed 0.999
    const result = rollWorldEccentricity({
      rng: rngFor2dSequence(12, 12),
    });
    expect(result.eccentricity).toBeLessThanOrEqual(0.999);
    expect(result.eccentricity).toBeGreaterThanOrEqual(0);
  });

  it("returns deterministic eccentricity with fixed RNG", () => {
    const rng1 = rngFor2dSequence(8, 5);
    const rng2 = rngFor2dSequence(8, 5);
    const result1 = rollWorldEccentricity({ rng: rng1 });
    const result2 = rollWorldEccentricity({ rng: rng2 });
    expect(result1.eccentricity).toBe(result2.eccentricity);
  });
});

describe("assignWorldsEccentricities", () => {
  it("skips empty slots", () => {
    const slots = [
      { slotId: "1", orbit: 1, primaryWorldType: null },
      { slotId: "2", orbit: 2, primaryWorldType: "terrestrialPlanet" },
    ];
    const result = assignWorldsEccentricities({ slots, rng: rngFor2d(7) });
    expect(result.worlds).toHaveLength(1);
    expect(result.worlds[0].slotId).toBe("2");
  });

  it("skips planetoid belts", () => {
    const slots = [
      { slotId: "1", orbit: 1, primaryWorldType: "planetoidBelt" },
      { slotId: "2", orbit: 2, primaryWorldType: "terrestrialPlanet" },
    ];
    const result = assignWorldsEccentricities({ slots, rng: rngFor2d(7) });
    expect(result.worlds).toHaveLength(1);
    expect(result.belts).toHaveLength(1);
    expect(result.belts[0].slotId).toBe("1");
  });

  it("skips empty orbit placeholders", () => {
    const slots = [
      { slotId: "1", orbit: 1, primaryWorldType: "emptyOrbit" },
      { slotId: "2", orbit: 2, primaryWorldType: "terrestrialPlanet" },
    ];
    const result = assignWorldsEccentricities({ slots, rng: rngFor2d(7) });
    expect(result.worlds).toHaveLength(1);
    expect(result.worlds[0].slotId).toBe("2");
    expect(result.eccentricityRolls).not.toHaveProperty("1");
  });

  it("assigns eccentricity to worlds", () => {
    const slots = [
      { slotId: "1", orbit: 1, primaryWorldType: "terrestrialPlanet" },
      { slotId: "2", orbit: 2, primaryWorldType: "gasGiant" },
    ];
    const result = assignWorldsEccentricities({
      slots,
      rng: rngFor2dSequence(7, 8),
    });
    expect(result.worlds).toHaveLength(2);
    expect(result.worlds[0]).toHaveProperty("eccentricity");
    expect(result.worlds[0].eccentricity).toBeGreaterThanOrEqual(0);
    expect(result.worlds[1]).toHaveProperty("eccentricity");
  });

  it("attaches eccentricity roll details", () => {
    const slots = [{ slotId: "1", orbit: 1, primaryWorldType: "terrestrialPlanet" }];
    const result = assignWorldsEccentricities({ slots, rng: rngFor2d(7) });
    expect(result.worlds[0].eccentricityRoll).toHaveProperty("firstRoll");
    expect(result.worlds[0].eccentricityRoll).toHaveProperty("eccentricity");
    expect(result.worlds[0].eccentricityRoll).toHaveProperty("notes");
  });

  it("applies anomalous orbit eccentricity DMs", () => {
    const slots = [
      {
        slotId: "1",
        orbit: 1,
        primaryWorldType: "terrestrialPlanet",
        anomalous: { eccentricityDm: 5 },
      },
    ];
    const result = assignWorldsEccentricities({
      slots,
      rng: rngFor2dSequence(7, 3),
    });
    expect(result.worlds[0].eccentricityRoll.firstRollTotal).toBe(12); // 7 + 5 dm
    expect(result.worlds[0].eccentricityRoll.firstRollDm).toBe(5);
  });

  it("tracks eccentricity rolls by slot ID", () => {
    const slots = [
      { slotId: "A1", orbit: 1, primaryWorldType: "terrestrialPlanet" },
      { slotId: "A2", orbit: 2, primaryWorldType: "gasGiant" },
    ];
    const result = assignWorldsEccentricities({
      slots,
      rng: rngFor2dSequence(7, 8),
    });
    expect(result.eccentricityRolls).toHaveProperty("A1");
    expect(result.eccentricityRolls).toHaveProperty("A2");
    expect(result.eccentricityRolls.A1).toHaveLength(1);
  });

  it("handles multiple worlds per slot ID (e.g., moons)", () => {
    const slots = [
      {
        slotId: "1",
        orbit: 1,
        primaryWorldType: "terrestrialPlanet",
        secondaryWorldTypes: ["mainworld"],
      },
    ];
    const result = assignWorldsEccentricities({ slots, rng: rngFor2d(7) });
    expect(result.worlds).toHaveLength(1);
    expect(result.worlds[0].secondaryWorldTypes).toContain("mainworld");
    expect(result.worlds[0]).toHaveProperty("eccentricity");
  });
});

describe("generateSystemWorldPlacement", () => {
  it("runs deterministic Step 1-13 flow and returns slotted worlds", () => {
    const stars = [
      { spectralClass: "G2 V", luminosityClass: "V", luminosity: 1 },
      { spectralClass: "K5 V", luminosityClass: "V", orbitType: "Near" },
    ];

    const result = generateSystemWorldPlacement({
      stars,
      systemAgeGyr: 5,
      rng: fixedRng(0),
    });

    expect(result).toHaveProperty("steps.step8");
    expect(result).toHaveProperty("steps.step9");
    expect(result).toHaveProperty("steps.step10");
    expect(result).toHaveProperty("steps.step11");
    expect(result).toHaveProperty("steps.step12");
    expect(result).toHaveProperty("steps.step13");
    expect(Array.isArray(result.slots)).toBe(true);
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.steps.step8.slots.length).toBe(result.slots.length);
    expect(result.steps.step9.worlds.every((entry) => entry.primaryWorldType !== "emptyOrbit")).toBe(true);
    expect(result.steps.step10).toHaveProperty("totals.significantMoons");
    expect(result.steps.step11).toHaveProperty("totals.significantRings");
    expect(result.steps.step12).toHaveProperty("totals.insignificantMoons");
    expect(result.steps.step13).toHaveProperty("totals.worldsWithCharacteristics");

    const firstEligibleWorld = result.slots.find((slot) =>
      ["terrestrialPlanet", "gasGiant", "mainworld"].includes(slot.primaryWorldType),
    );
    if (firstEligibleWorld) {
      expect(firstEligibleWorld).toHaveProperty("significantMoonQuantity");
      expect(firstEligibleWorld).toHaveProperty("hasSignificantRing");
      expect(firstEligibleWorld).toHaveProperty("significantMoonRoll");
      if (firstEligibleWorld.significantMoonQuantity > 0 || firstEligibleWorld.hasSignificantRing) {
        expect(firstEligibleWorld).toHaveProperty("significantMoonSizes");
      }
      expect(firstEligibleWorld).toHaveProperty("insignificantMoonQuantity");
    }

    const enrichedWorld = result.slots.find(
      (slot) =>
        (slot.significantMoonCountAfterSizing ?? 0) > 0 ||
        (slot.significantRingCount ?? 0) > 0 ||
        (slot.significantMoonQuantity ?? 0) > 0 ||
        slot.hasSignificantRing,
    );
    if (enrichedWorld) {
      expect(enrichedWorld).toHaveProperty("significantMoonRingCharacteristics");
      expect(enrichedWorld).toHaveProperty("significantMoonOrbitLimits");
      expect(enrichedWorld).toHaveProperty("significantRingProfile");
    }
  });

  it("preserves anomalous metadata through placement for Step 9 DMs", () => {
    const stars = [{ spectralClass: "G2 V", luminosityClass: "V", luminosity: 1 }];
    const result = generateSystemWorldPlacement({
      stars,
      anomalousOrbitCount: 1,
      rng: fixedRng(0),
    });

    const anomalousSlots = result.steps.step8.slots.filter((slot) => slot.isAnomalousSlot);
    if (anomalousSlots.length > 0) {
      expect(anomalousSlots[0]).toHaveProperty("anomalous");
    }
  });

  it("exposes hzco in the return object", () => {
    const result = generateSystemWorldPlacement({
      stars: [{ spectralClass: "G2 V", luminosityClass: "V", luminosity: 1 }],
      rng: fixedRng(0),
    });
    expect(result).toHaveProperty("hzco");
    expect(Number.isFinite(result.hzco)).toBe(true);
  });
});

// ── Mainworld Candidate: Physical Rolls ────────────────────────────────────

describe("rollWorldAtmosphereCode", () => {
  it("returns atmosphere 0 with no roll for Size 0", () => {
    expect(rollWorldAtmosphereCode({ size: 0 })).toEqual({ roll: null, atmosphereCode: 0 });
  });

  it("returns atmosphere 0 with no roll for Size 1", () => {
    expect(rollWorldAtmosphereCode({ size: 1 })).toEqual({ roll: null, atmosphereCode: 0 });
  });

  it("returns atmosphere 0 with no roll for Size S", () => {
    expect(rollWorldAtmosphereCode({ sizeCode: "S" })).toEqual({ roll: null, atmosphereCode: 0 });
  });

  it("computes 2D-7+Size for Size 5 (Zed Aab IV d: roll 8 → atmo 6)", () => {
    // 2D roll = 8 → 8 - 7 + 5 = 6
    const { roll, atmosphereCode } = rollWorldAtmosphereCode({ size: 5, rng: rngFor2d(8) });
    expect(roll).toBe(8);
    expect(atmosphereCode).toBe(6);
  });

  it("clamps atmosphere to minimum 0", () => {
    // roll 2 (minimum): 2 - 7 + 2 = -3 → clamped to 0
    const { atmosphereCode } = rollWorldAtmosphereCode({ size: 2, rng: rngFor2d(2) });
    expect(atmosphereCode).toBe(0);
  });

  it("clamps atmosphere to maximum 15", () => {
    // roll 12, size 15: 12 - 7 + 15 = 20 → clamped to 15
    const { atmosphereCode } = rollWorldAtmosphereCode({ size: 15, rng: rngFor2d(12) });
    expect(atmosphereCode).toBe(15);
  });

  it("applies size-based variant DM-2 for size 2-4", () => {
    // roll 7, size 3: base 3; variant DM-2 => 1
    const { atmosphereCode } = rollWorldAtmosphereCode({
      size: 3,
      useSizeThinAtmosphereVariant: true,
      rng: rngFor2d(7),
    });
    expect(atmosphereCode).toBe(1);
  });

  it("applies gravity-based variant DM-2 when gravity is below 0.4G", () => {
    // roll 7, size 5: base 5; gravity DM-2 => 3
    const { atmosphereCode } = rollWorldAtmosphereCode({
      size: 5,
      gravity: 0.39,
      useGravityAtmosphereVariant: true,
      rng: rngFor2d(7),
    });
    expect(atmosphereCode).toBe(3);
  });

  it("applies gravity-based variant DM-1 between 0.4G and 0.5G", () => {
    // roll 7, size 5: base 5; gravity DM-1 => 4
    const { atmosphereCode } = rollWorldAtmosphereCode({
      size: 5,
      gravity: 0.45,
      useGravityAtmosphereVariant: true,
      rng: rngFor2d(7),
    });
    expect(atmosphereCode).toBe(4);
  });

  it("uses gravity variant as alternative to size variant when both are enabled", () => {
    // size variant would be DM-2, gravity variant is DM-1 here; result should use DM-1
    const { atmosphereCode } = rollWorldAtmosphereCode({
      size: 3,
      gravity: 0.45,
      useSizeThinAtmosphereVariant: true,
      useGravityAtmosphereVariant: true,
      rng: rngFor2d(7),
    });
    expect(atmosphereCode).toBe(2);
  });
});

describe("calculateAtmosphereVariantDm", () => {
  it("returns size variant DM-2 for size 2-4", () => {
    expect(calculateAtmosphereVariantDm({ size: 4, useSizeThinAtmosphereVariant: true }).dm).toBe(-2);
  });

  it("returns gravity variant DM-2 below 0.4G and DM-1 below 0.5G", () => {
    expect(calculateAtmosphereVariantDm({ gravity: 0.39, useGravityAtmosphereVariant: true }).dm).toBe(-2);
    expect(calculateAtmosphereVariantDm({ gravity: 0.45, useGravityAtmosphereVariant: true }).dm).toBe(-1);
  });
});

describe("lookupAtmosphereCodeInfo", () => {
  it("resolves metadata for numeric and coded atmosphere values", () => {
    const atmoA = lookupAtmosphereCodeInfo(10);
    const atmoH = lookupAtmosphereCodeInfo("H");

    expect(atmoA.composition).toBe("Exotic");
    expect(atmoH.survivalGearRequired).toBe("Not Survivable");
  });

  it("returns null for unknown atmosphere input", () => {
    expect(lookupAtmosphereCodeInfo("Q")).toBeNull();
  });

  it("exposes Table 29 metadata for standard atmosphere", () => {
    expect(ATMOSPHERE_CODE_TABLE["6"].pressureRangeBar).toEqual([0.7, 1.49]);
    expect(ATMOSPHERE_CODE_TABLE["6"].survivalGearRequired).toBe("None");
  });
});

describe("rollAtmospherePressureBar", () => {
  it("rolls pressure inside numeric pressure bands", () => {
    const pressure = rollAtmospherePressureBar({ atmosphereCode: 6, rng: fixedRng(0.5) });
    expect(pressure.variableRange).toBe(false);
    expect(pressure.minBar).toBeCloseTo(0.7, 10);
    expect(pressure.maxBar).toBeCloseTo(1.49, 10);
    expect(pressure.pressureBar).toBeCloseTo(1.095, 3);
  });

  it("returns variable range metadata for exotic/corrosive/insidious/unusual atmospheres", () => {
    const pressure = rollAtmospherePressureBar({ atmosphereCode: "A" });
    expect(pressure.variableRange).toBe(true);
    expect(pressure.pressureBar).toBeNull();
  });
});

describe("rollWorldHydrographicsCode", () => {
  it("returns 0 with no roll for atmosphere 0", () => {
    expect(rollWorldHydrographicsCode({ atmosphereCode: 0 })).toEqual({ roll: null, hydrographicsCode: 0 });
  });

  it("returns 0 with no roll for atmosphere 1", () => {
    expect(rollWorldHydrographicsCode({ atmosphereCode: 1 })).toEqual({ roll: null, hydrographicsCode: 0 });
  });

  it("computes 2D-7+Atmo for atmosphere 6 (Zed Aab IV d: roll 7 → hydro 6)", () => {
    // 2D roll = 7 → 7 - 7 + 6 = 6
    const { roll, hydrographicsCode } = rollWorldHydrographicsCode({ atmosphereCode: 6, rng: rngFor2d(7) });
    expect(roll).toBe(7);
    expect(hydrographicsCode).toBe(6);
  });

  it("applies DM-4 for atmosphere >= 10 (Zed Star B II: atmo A, roll 7 → hydro 6)", () => {
    // 2D roll = 7 → 7 - 7 + 10 - 4 = 6
    const { hydrographicsCode } = rollWorldHydrographicsCode({ atmosphereCode: 10, rng: rngFor2d(7) });
    expect(hydrographicsCode).toBe(6);
  });

  it("clamps hydrographics to maximum 10", () => {
    const { hydrographicsCode } = rollWorldHydrographicsCode({ atmosphereCode: 9, rng: rngFor2d(12) });
    expect(hydrographicsCode).toBe(10);
  });
});

describe("identifyMainworldCandidates", () => {
  it("returns null habitableZone and empty candidates for invalid hzco", () => {
    const result = identifyMainworldCandidates({ slots: [], hzco: null });
    expect(result.habitableZone).toBeNull();
    expect(result.candidates).toEqual([]);
  });

  it("picks up a terrestrial planet in the HZ and calculates temperature raw roll", () => {
    // HZCO = 3.3, terrestrial at orbit 3.1 (deviation -0.2 → DM+2 → rawRoll 9)
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        secondaryWorldTypes: [],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    expect(result.candidates).toHaveLength(1);
    const c = result.candidates[0];
    expect(c.slotId).toBe("P-1");
    expect(c.orbit).toBe(3.1);
    expect(c.isMoon).toBe(false);
    expect(c.regionDm).toBe(2);
    expect(c.temperatureRawRoll).toBe(9);
  });

  it("excludes terrestrials outside the HZ", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 1.0,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        secondaryWorldTypes: [],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    expect(result.candidates).toHaveLength(0);
  });

  it("skips empty orbits even in the HZ", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.3,
        primaryWorldType: "emptyOrbit",
        sizeCode: "0",
        sizeValue: 0,
        secondaryWorldTypes: [],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    expect(result.candidates).toHaveLength(0);
  });

  it("picks up a significant moon (size 5) of a gas giant in the HZ", () => {
    const slots = [
      {
        slotId: "P-2",
        orbit: 3.5,
        primaryWorldType: "gasGiant",
        sizeCode: "GML",
        sizeValue: null,
        secondaryWorldTypes: [],
        significantMoonSizeDetails: [
          { sizeCode: "5", sizeValue: 5, isRing: false },
          { sizeCode: "2", sizeValue: 2, isRing: false },
        ],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    // Two moons, both size >= 2, in HZ at orbit 3.5 (deviation +0.2 → DM-2 → rawRoll 5)
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].isMoon).toBe(true);
    expect(result.candidates[0].moonIndex).toBe(0);
    expect(result.candidates[0].temperatureRawRoll).toBe(5);
  });

  it("excludes ring moons (isRing: true) and size < 2 moons", () => {
    const slots = [
      {
        slotId: "P-3",
        orbit: 3.3,
        primaryWorldType: "gasGiant",
        sizeCode: "GML",
        sizeValue: null,
        secondaryWorldTypes: [],
        significantMoonSizeDetails: [
          { sizeCode: "R", sizeValue: 0, isRing: true },
          { sizeCode: "S", sizeValue: 0, isRing: false },
          { sizeCode: "1", sizeValue: 1, isRing: false },
        ],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    expect(result.candidates).toHaveLength(0);
  });

  it("rolls atmosphere and hydrographics when rollPhysical=true (deterministic)", () => {
    // Size 5, orbit 3.1, HZCO 3.3 → rawRoll 9, atmo roll 8 → atmo 6, hydro roll 7 → hydro 6
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        secondaryWorldTypes: [],
      },
    ];
    const rng = rngFor2dSequence(8, 7);
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: true, rng });
    const c = result.candidates[0];
    expect(c.atmosphereRoll).toBe(8);
    expect(c.atmosphereCode).toBe(6);
    expect(c.hydrographicsRoll).toBe(7);
    expect(c.hydrographicsCode).toBe(6);
  });

  it("treats Size S candidate as atmosphere 0 and hydrographics 0", () => {
    const slots = [
      {
        slotId: "P-S",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "S",
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: true, rng: rngFor2dSequence(12, 12) });
    const c = result.candidates[0];
    expect(c.atmosphereRoll).toBeNull();
    expect(c.atmosphereCode).toBe(0);
    expect(c.hydrographicsRoll).toBeNull();
    expect(c.hydrographicsCode).toBe(0);
  });

  it("returns correct HZ bounds for normal HZCO", () => {
    const result = identifyMainworldCandidates({ slots: [], hzco: 3.3, rollPhysical: false });
    expect(result.habitableZone).toEqual({ innerOrbit: 2.3, outerOrbit: 4.3 });
  });

  it("sorts candidates by ascending orbit", () => {
    const slots = [
      {
        slotId: "P-3",
        orbit: 4.0,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "4",
        sizeValue: 4,
        secondaryWorldTypes: [],
      },
      {
        slotId: "P-1",
        orbit: 2.5,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "6",
        sizeValue: 6,
        secondaryWorldTypes: [],
      },
      {
        slotId: "P-2",
        orbit: 3.3,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        secondaryWorldTypes: [],
      },
    ];
    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: false });
    const orbits = result.candidates.map((c) => c.orbit);
    expect(orbits).toEqual([2.5, 3.3, 4.0]);
  });
});

// ── Chapter 5: World Physical Characteristics ────────────────────────────────

describe("rollWorldDiameter", () => {
  it("returns 0 diameter for Size 0 with no rolls", () => {
    const result = rollWorldDiameter({ sizeCode: "0" });
    expect(result.diameterKm).toBe(0);
    expect(result.d3Roll).toBeNull();
    expect(result.d6Roll).toBeNull();
    expect(result.d100Roll).toBeNull();
  });

  it("returns 0 diameter for Size R with no rolls", () => {
    const result = rollWorldDiameter({ sizeCode: "R" });
    expect(result.diameterKm).toBe(0);
    expect(result.d6Roll).toBeNull();
  });

  it("replicates the Zed mainworld Size 5 example: D3=2 +600, D6=4 +300, d100=63 → 8163km", () => {
    // seqRng values: [D3-backing-d6, diameter-D6, d100]
    // rng=0.5 → floor(0.5×6)+1=4; rollD3=ceil(4/2)=2 → increase=600
    // rng=0.5 → d6=4 → increase=300; 900 < 1600 so no reroll
    // rng=0.63 → floor(0.63×100)=63
    const rng = seqRng(0.5, 0.5, 0.63);
    const result = rollWorldDiameter({ sizeCode: "5", rng });
    expect(result.minimumDiameter).toBe(7200);
    expect(result.d3Increase).toBe(600);
    expect(result.d6Increase).toBe(300);
    expect(result.d100Roll).toBe(63);
    expect(result.diameterKm).toBe(8163);
  });

  it("skips d100 when rollD100=false", () => {
    const rng = seqRng(0.5, 0.5);
    const result = rollWorldDiameter({ sizeCode: "5", rollD100: false, rng });
    expect(result.d100Roll).toBeNull();
    expect(result.diameterKm).toBe(7200 + 600 + 300);
  });

  it("rerolls D3+D6 when combined increase ≥ 1600 (D3=3 +1200, D6=5 +400 → reroll)", () => {
    // rng=4/6 → d6=5 → D3=ceil(5/2)=3 → 1200; rng=4/6 → d6=5 → +400; 1600≥1600 → reroll
    // rng=1/6 → d6=2 → D3=ceil(2/2)=1 → 0; rng=0 → d6=1 → 0; done
    // rng=0.5 → d100=50; Size F min=23200 → 23200+0+0+50=23250
    const rng = seqRng(4 / 6, 4 / 6, 1 / 6, 0, 0.5);
    const result = rollWorldDiameter({ sizeCode: "F", rng });
    expect(result.d3Increase).toBe(0);
    expect(result.d6Increase).toBe(0);
    expect(result.d100Roll).toBe(50);
    expect(result.diameterKm).toBe(23250);
  });

  it("rolls Size S: D6 1–4 only, adds to 400km minimum + d100", () => {
    // rng=0.5 → d6=4 → increase=300; rng cycles to 0.5 → d100=50
    const rng = seqRng(0.5, 0.5);
    const result = rollWorldDiameter({ sizeCode: "S", rng });
    expect(result.minimumDiameter).toBe(400);
    expect(result.d3Roll).toBeNull();
    expect(result.d6Increase).toBe(300);
    expect(result.diameterKm).toBe(750);
  });

  it("rerolls Size S D6 when result is 5 or 6", () => {
    // rng=4/6 → d6=5 → ≥5 reroll; rng=1/6 → d6=2 → increase=100; rng cycles → d100=50
    const rng = seqRng(4 / 6, 1 / 6, 0.5);
    const result = rollWorldDiameter({ sizeCode: "S", rng });
    expect(result.d6Increase).toBe(100);
    expect(result.diameterKm).toBe(550);
  });

  it("returns null for an unknown size code", () => {
    expect(rollWorldDiameter({ sizeCode: "Z" })).toBeNull();
  });

  it("accepts numeric size value", () => {
    const rng = seqRng(0.5, 0.5, 0.5);
    const result = rollWorldDiameter({ sizeCode: 8, rollD100: false, rng });
    expect(result.sizeCode).toBe("8");
    expect(result.minimumDiameter).toBe(12000);
  });
});

describe("determineTerrestrialComposition", () => {
  it("replicates Zed mainworld: Size 5, orbit 3.1, HZCO 3.3, roll 10 → Rock and Metal", () => {
    // Size 5: no size DM; orbit 3.1 ≤ 3.3 → DM+1; total=10+1=11 → rockAndMetal (≤11)
    const result = determineTerrestrialComposition({
      sizeValue: 5,
      orbit: 3.1,
      hzco: 3.3,
      rng: rngFor2d(10),
    });
    expect(result.roll).toBe(10);
    expect(result.totalRoll).toBe(11);
    expect(result.compositionKey).toBe("rockAndMetal");
    expect(result.composition).toBe(TERRESTRIAL_COMPOSITIONS.rockAndMetal);
  });

  it("applies DM-1 for Size 0–4", () => {
    // Size 2: DM-1; no orbit/hzco; roll 7 → total 6 → mostlyRock (≤6)
    const result = determineTerrestrialComposition({ sizeValue: 2, rng: rngFor2d(7) });
    expect(result.dms.find((d) => d.label.includes("Size 0"))).toBeDefined();
    expect(result.totalRoll).toBe(6);
    expect(result.compositionKey).toBe("mostlyRock");
  });

  it("applies DM+1 for Size 6–9", () => {
    // Size 7: DM+1; roll 7 → total 8 → rockAndMetal (≤11)
    const result = determineTerrestrialComposition({ sizeValue: 7, rng: rngFor2d(7) });
    expect(result.totalRoll).toBe(8);
    expect(result.compositionKey).toBe("rockAndMetal");
  });

  it("applies DM+3 for Size A–F", () => {
    // Size 10 (A): DM+3; no orbit/hzco; roll 10 → total 13 → mostlyMetal (≤14)
    const result = determineTerrestrialComposition({ sizeValue: 10, rng: rngFor2d(10) });
    expect(result.totalRoll).toBe(13);
    expect(result.compositionKey).toBe("mostlyMetal");
  });

  it("applies DM-1 for beyond HZCO plus DM-1 per full orbit# beyond", () => {
    // Size 0: DM-1; orbit 6.0, HZCO 3.3 → beyond by 2.7 → DM-1 + DM-2 = DM-3; total DM=-4
    // Roll 5 → total 5-4=1 → mostlyIce (≤2)
    const result = determineTerrestrialComposition({
      sizeValue: 0,
      orbit: 6.0,
      hzco: 3.3,
      rng: rngFor2d(5),
    });
    expect(result.totalRoll).toBe(1);
    expect(result.compositionKey).toBe("mostlyIce");
  });

  it("applies DM-1 for system age > 10 Gyr", () => {
    // Size 5: no size DM; systemAgeByr=11 → DM-1; roll 7 → total 6 → mostlyRock
    const result = determineTerrestrialComposition({ sizeValue: 5, systemAgeByr: 11, rng: rngFor2d(7) });
    expect(result.totalRoll).toBe(6);
    expect(result.compositionKey).toBe("mostlyRock");
  });

  it("classifies extreme cold outer world as exoticIce", () => {
    // Size 1: DM-1; orbit 12.0, HZCO 3.3 → beyond DM-1, 8 full orbits → DM-8; total DM=-10
    // Roll 2 → total -8 → exoticIce (≤-4)
    const result = determineTerrestrialComposition({
      sizeValue: 1,
      orbit: 12.0,
      hzco: 3.3,
      rng: rngFor2d(2),
    });
    expect(result.totalRoll).toBeLessThanOrEqual(-4);
    expect(result.compositionKey).toBe("exoticIce");
  });

  it("classifies hot dense world as compressedMetal", () => {
    // Size 15 (F): DM+3; at HZCO → DM+1; roll 12 → total 16 → compressedMetal (>14)
    const result = determineTerrestrialComposition({
      sizeValue: 15,
      orbit: 3.3,
      hzco: 3.3,
      rng: rngFor2d(12),
    });
    expect(result.compositionKey).toBe("compressedMetal");
  });
});

describe("rollTerrestrialDensity", () => {
  it("replicates Zed mainworld: Rock and Metal, roll 9 → density 1.03", () => {
    const result = rollTerrestrialDensity({ compositionKey: "rockAndMetal", rng: rngFor2d(9) });
    expect(result.roll).toBe(9);
    expect(result.density).toBe(1.03);
  });

  it("Exotic Ice roll 2 → density 0.03", () => {
    expect(rollTerrestrialDensity({ compositionKey: "exoticIce", rng: rngFor2d(2) }).density).toBe(0.03);
  });

  it("Compressed Metal roll 12 → density 2.00", () => {
    expect(rollTerrestrialDensity({ compositionKey: "compressedMetal", rng: rngFor2d(12) }).density).toBe(2.0);
  });

  it("Mostly Ice roll 10 → density 0.41 (source table value, not 0.42)", () => {
    expect(rollTerrestrialDensity({ compositionKey: "mostlyIce", rng: rngFor2d(10) }).density).toBe(0.41);
  });

  it("returns null for unknown composition key", () => {
    expect(rollTerrestrialDensity({ compositionKey: "plasma" })).toBeNull();
  });
});

describe("calculateWorldGravity", () => {
  it("Terra (diameter 12742, density 1.0) → gravity 1.0", () => {
    expect(calculateWorldGravity({ diameterKm: 12742, density: 1.0 })).toBeCloseTo(1.0, 10);
  });

  it("replicates Zed mainworld: diameter 8163, density 1.03 → ~0.66G", () => {
    const gravity = calculateWorldGravity({ diameterKm: 8163, density: 1.03 });
    expect(gravity).toBeCloseTo(0.66, 2);
  });

  it("returns null for non-finite inputs", () => {
    expect(calculateWorldGravity({ diameterKm: NaN, density: 1.0 })).toBeNull();
    expect(calculateWorldGravity({ diameterKm: 12742 })).toBeNull();
  });
});

describe("calculateWorldMass", () => {
  it("Terra (diameter 12742, density 1.0) → mass 1.0", () => {
    expect(calculateWorldMass({ diameterKm: 12742, density: 1.0 })).toBeCloseTo(1.0, 10);
  });

  it("replicates Zed mainworld: diameter 8163, density 1.03 → ~0.27 Terra", () => {
    const mass = calculateWorldMass({ diameterKm: 8163, density: 1.03 });
    expect(mass).toBeCloseTo(0.27, 2);
  });

  it("returns null for non-finite inputs", () => {
    expect(calculateWorldMass({ diameterKm: undefined, density: 1.0 })).toBeNull();
  });
});

describe("calculateWorldEscapeVelocity", () => {
  it("Terra (mass 1.0, diameter 12742) → escape velocity 11186 m/s", () => {
    expect(calculateWorldEscapeVelocity({ mass: 1.0, diameterKm: 12742 })).toBeCloseTo(11186, 0);
  });

  it("replicates Zed mainworld: ~7262 m/s (within 20 m/s tolerance for rounding)", () => {
    const mass = calculateWorldMass({ diameterKm: 8163, density: 1.03 });
    const escV = calculateWorldEscapeVelocity({ mass, diameterKm: 8163 });
    expect(escV).toBeGreaterThan(7240);
    expect(escV).toBeLessThan(7300);
  });

  it("returns null for diameterKm <= 0", () => {
    expect(calculateWorldEscapeVelocity({ mass: 1.0, diameterKm: 0 })).toBeNull();
    expect(calculateWorldEscapeVelocity({ mass: 1.0, diameterKm: -100 })).toBeNull();
  });
});

describe("calculateWorldOrbitalVelocitySurface", () => {
  it("Terra: escV 11186 / √2 ≈ 7909 m/s", () => {
    expect(calculateWorldOrbitalVelocitySurface({ escapeVelocity: 11186 })).toBeCloseTo(7909.7, 1);
  });

  it("replicates Zed mainworld: ~5135 m/s (within 10 m/s)", () => {
    const mass = calculateWorldMass({ diameterKm: 8163, density: 1.03 });
    const escV = calculateWorldEscapeVelocity({ mass, diameterKm: 8163 });
    const orbV = calculateWorldOrbitalVelocitySurface({ escapeVelocity: escV });
    expect(orbV).toBeGreaterThan(5120);
    expect(orbV).toBeLessThan(5160);
  });

  it("returns null for non-finite escapeVelocity", () => {
    expect(calculateWorldOrbitalVelocitySurface({ escapeVelocity: NaN })).toBeNull();
  });
});

describe("calculateWorldOrbitalVelocityAtAltitude", () => {
  it("Terra at surface (h=0): matches surface orbital velocity formula", () => {
    // 11186 × √(1 / (2 × 6371 / 6371)) = 11186 × √(1/2) ≈ 7909 m/s
    const orbV = calculateWorldOrbitalVelocityAtAltitude({ mass: 1.0, diameterKm: 12742, altitudeKm: 0 });
    expect(orbV).toBeCloseTo(7909.7, 1);
  });

  it("replicates Zed mainworld at 500km altitude: ~4847 m/s (within 20 m/s)", () => {
    const mass = calculateWorldMass({ diameterKm: 8163, density: 1.03 });
    const orbV = calculateWorldOrbitalVelocityAtAltitude({ mass, diameterKm: 8163, altitudeKm: 500 });
    expect(orbV).toBeGreaterThan(4830);
    expect(orbV).toBeLessThan(4870);
  });

  it("returns null for non-finite inputs", () => {
    expect(calculateWorldOrbitalVelocityAtAltitude({ mass: 1.0, diameterKm: 12742, altitudeKm: NaN })).toBeNull();
  });
});

describe("formatWorldSizeProfile", () => {
  it("replicates Zed mainworld Size profile: '5-8163-1.03-0.66-0.27'", () => {
    const diameterKm = 8163;
    const density = 1.03;
    const gravity = calculateWorldGravity({ diameterKm, density });
    const mass = calculateWorldMass({ diameterKm, density });
    const profile = formatWorldSizeProfile({
      sizeCode: "5",
      diameterKm,
      density,
      gravity,
      mass,
    });
    expect(profile).toBe("5-8163-1.03-0.66-0.27");
  });

  it("rounds diameter to nearest integer", () => {
    const profile = formatWorldSizeProfile({
      sizeCode: "5",
      diameterKm: 8163.7,
      density: 1.0,
      gravity: 0.64,
      mass: 0.26,
    });
    expect(profile.split("-")[1]).toBe("8164");
  });

  it("uses '?' for non-finite values", () => {
    const profile = formatWorldSizeProfile({
      sizeCode: "5",
      diameterKm: NaN,
      density: 1.03,
      gravity: 0.66,
      mass: 0.27,
    });
    expect(profile.split("-")[1]).toBe("?");
  });

  it("handles missing sizeCode", () => {
    const profile = formatWorldSizeProfile({ diameterKm: 12742, density: 1.0, gravity: 1.0, mass: 1.0 });
    expect(profile.startsWith("?-")).toBe(true);
  });
});
