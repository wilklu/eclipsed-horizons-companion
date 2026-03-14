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
  calculateHabitableZoneTemperatureRawRoll,
  lookupHabitableZoneRegionDm,
  lookupHabitableZoneRegionByRawRoll,
  ATMOSPHERE_CODE_TABLE,
  lookupAtmosphereCodeInfo,
  lookupAtmosphereTemperatureDm,
  estimateModifiedTemperatureRollFromType,
  reverseEngineerTemperatureRawRoll,
  BASIC_MEAN_TEMPERATURE_TABLE_55,
  lookupBasicMeanTemperature,
  calculateBasicMeanTemperatureOrbitDm,
  calculateBasicMeanTemperatureModifiedRoll,
  ALBEDO_WORLD_TYPES,
  rollWorldAlbedo,
  calculateInitialGreenhouseFactor,
  calculateEffectiveGreenhouseFactor,
  calculateMeanTemperatureKelvin,
  calculateMeanTemperature,
  calculateCombinedTemperatureKelvin,
  calculateGasGiantResidualHeatTemperatureKelvin,
  calculateThermalLuminositySolar,
  calculateGasGiantResidualHeatScenario,
  normalizeAxialTiltForTemperatureVariation,
  calculateAxialTiltFactor,
  calculateRotationFactor,
  calculateGeographicFactor,
  calculateVarianceFactors,
  calculateAtmosphericFactor,
  calculateLuminosityModifier,
  calculateHighLowLuminosity,
  calculateNearFarAu,
  calculateHighLowTemperatureProfile,
  calculateWorldHighLowTemperatureProfile,
  calculateScenarioLuminosityModifier,
  calculateAltitudeAdjustedGreenhouseFactor,
  calculateAdditionalTemperatureScenario,
  calculateLatitudeZoneAdjustment,
  calculateLatitudeLuminosity,
  calculateLatitudeTemperatureScenario,
  calculateSolarDeclinationDegrees,
  calculateSunriseCosine,
  calculateSunlightPortionFromSunriseCosine,
  calculateSunlightPortionAndHours,
  calculateAdjustedFractionalDayEven,
  calculateAdjustedFractionalDayUneven,
  calculateHourlyRotationFactor,
  calculateTimeOfDayRotationFactor,
  calculateHorizonDistanceKm,
  calculateHorizonDistanceDegrees,
  calculateEccentricityLongitudinalLibrationDegrees,
  calculateLatitudinalLibrationDegrees,
  calculateSolarDiskVisibilityBandDegrees,
  calculateAtmosphericRefractionDegrees,
  calculateTwilightZoneExtentDegrees,
  calculateTwilightLockedRotationFactor,
  calculateAltitudeGreenhouseFactor,
  calculateTemperatureAtAltitude,
  calculateMultiStarContributionDistances,
  calculateMultiStarTemperatureScenario,
  applyInherentTemperatureEffectKelvin,
  applyInherentTemperatureEffectProfile,
  calculateNormalizedTemperatureScenario,
  formatCandidateTemperatureScenarioSummary,
  isNitrogenOxygenAtmosphere,
  calculateOxygenFractionAgeDm,
  rollOxygenFraction,
  calculateOxygenPartialPressureBar,
  evaluateAtmosphereOxygenTaint,
  calculateAtmosphereScaleHeightKm,
  calculateAtmosphericPressureAtAltitudeBar,
  estimateMeanTemperatureKFromRegionType,
  formatAtmosphereProfile,
  generateHabitableZoneAtmosphereProfile,
  lookupRunawayGreenhouseAtmosphereCode,
  rollRunawayGreenhouseAtmosphere,
  calculateRunawayGreenhouseCheckDm,
  evaluateRunawayGreenhouse,
  calculateAtmosphereVariantDm,
  rollAtmospherePressureBar,
  rollWorldAtmosphereCode,
  rollWorldHydrographicsCode,
  HYDROGRAPHICS_RANGE_TABLE_49,
  lookupHydrographicsRange,
  rollHydrographicsPercentage,
  SURFACE_DISTRIBUTION_TABLE_50,
  determineHydrographicsFundamentalGeography,
  rollSurfaceDistribution,
  POSSIBLE_EXOTIC_LIQUIDS_TABLE_51,
  getPossibleExoticLiquids,
  selectHydrographicsLiquids,
  formatHydrographicsProfile,
  identifyMainworldCandidates,
  rollTaintSubtype,
  rollTaintSeverity,
  rollTaintPersistence,
  rollWorldTaints,
  ATMOSPHERIC_GAS_TABLE_35,
  getGasState,
  checkGasRetention,
  getRetainableGases,
  selectExoticAtmosphereGases,
  rollExoticCorrosiveIrritant,
  CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36,
  INSIDIOUS_HAZARD_TABLE_37,
  rollCorrosiveInsidiousSubtype,
  rollInsidiousHazard,
  calculateLowAtmosphereBadRatio,
  calculateLowAtmosphereSafeAltitudeKm,
  rollLowAtmosphereTaint,
  UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38,
  rollD26,
  rollUnusualAtmosphereSubtype,
  formatUnusualAtmosphereProfile,
  HOT_ATMOSPHERE_TABLE_39,
  SPECIAL_HOT_ATMOSPHERE_TABLE_40,
  COLD_ATMOSPHERE_TABLE_41,
  calculateEffectiveOrbitDeviationFromHzco,
  rollNonHabitableZoneAtmosphere,
  NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES,
  selectNonHabitableAtmosphereGasMixTable,
  calculateNonHabitableAtmosphereGasMixDm,
  rollNonHabitableAtmosphereGas,
  rollNonHabitableAtmosphereGasMixes,
  rollWorldAtmosphereForOrbit,
  ATMOSPHERE_GAS_SYMBOLS,
  formatAtmosphereGasSymbol,
  allocateAtmosphereGasMixPercentages,
  formatAtmosphereGasMixProfile,
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
  rollBaseRotationRateHours,
  rollWorldRotationPeriodHours,
  rollRotationPeriodPrecision,
  calculateRotationPeriodDecimalHours,
  formatRotationPeriodHMS,
  calculateSolarDaysInYear,
  AXIAL_TILT_TABLE_52,
  EXTREME_AXIAL_TILT_TABLE_53,
  clampAxialTiltDegrees,
  rollAxialTilt,
  rollAxialTiltPrecision,
  calculateAxialTiltDecimalDegrees,
  formatAxialTiltDMS,
  calculateTidalForce,
  calculateStarTidalEffect,
  calculateMoonTidalEffect,
  calculatePlanetTidalEffect,
  calculateMoonToMoonTidalEffect,
  calculateTidalStressFactor,
  calculateTidalHeatingFactor,
  calculateTotalSeismicStress,
  applySeismicTemperatureCorrection,
  calculateTectonicPlates,
  TIDAL_LOCK_STATUS_TABLE_54,
  calculateTidalLockCommonDMs,
  calculateTidalLockStarDMs,
  calculateTidalLockMoonToPlanetDMs,
  calculateTidalLockPlanetToMoonDMs,
  rollTidalLockStatus,
  adjustAxialTiltForRetrograde,
  rollTidalLockAxialTiltReroll,
  selectTidalLockEccentricity,
  calculateResidualSeismicStress,
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

/**
 * Produces a D26 roll of exactly (d2, d6) using a paired rng.
 * D2 = 1 or 2, D6 = 1–6.
 */
function rngForD26(d2, d6) {
  return seqRng((d2 - 1) / 2, (d6 - 1) / 6);
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

describe("calculateHabitableZoneTemperatureRawRoll", () => {
  it("maps strong positive deviations to cold raw rolls", () => {
    expect(calculateHabitableZoneTemperatureRawRoll(1.2)).toBe(2);
    expect(calculateHabitableZoneTemperatureRawRoll(0.8)).toBe(3);
    expect(calculateHabitableZoneTemperatureRawRoll(0.5)).toBe(4);
  });

  it("maps near-HZ deviations around temperate center", () => {
    expect(calculateHabitableZoneTemperatureRawRoll(0.2)).toBe(5);
    expect(calculateHabitableZoneTemperatureRawRoll(0.0)).toBe(7);
    expect(calculateHabitableZoneTemperatureRawRoll(-0.2)).toBe(9);
  });

  it("maps strong negative deviations to hot/boiling raw rolls", () => {
    expect(calculateHabitableZoneTemperatureRawRoll(-0.5)).toBe(10);
    expect(calculateHabitableZoneTemperatureRawRoll(-1.0)).toBe(11);
    expect(calculateHabitableZoneTemperatureRawRoll(-1.2)).toBe(12);
  });
});

describe("lookupHabitableZoneRegionByRawRoll", () => {
  it("classifies region bands from raw roll", () => {
    expect(lookupHabitableZoneRegionByRawRoll(2).type).toBe("Frozen");
    expect(lookupHabitableZoneRegionByRawRoll(3).type).toBe("Cold");
    expect(lookupHabitableZoneRegionByRawRoll(7).type).toBe("Temperate");
    expect(lookupHabitableZoneRegionByRawRoll(10).type).toBe("Hot");
    expect(lookupHabitableZoneRegionByRawRoll(12).type).toBe("Boiling");
  });

  it("clamps out-of-range roll inputs", () => {
    expect(lookupHabitableZoneRegionByRawRoll(0).rawRoll).toBe(2);
    expect(lookupHabitableZoneRegionByRawRoll(99).rawRoll).toBe(12);
  });
});

describe("lookupAtmosphereTemperatureDm", () => {
  it("returns Table 30 atmosphere DMs by code", () => {
    expect(lookupAtmosphereTemperatureDm(2).dm).toBe(-2);
    expect(lookupAtmosphereTemperatureDm("E").dm).toBe(-1);
    expect(lookupAtmosphereTemperatureDm(6).dm).toBe(0);
    expect(lookupAtmosphereTemperatureDm(8).dm).toBe(1);
    expect(lookupAtmosphereTemperatureDm("A").dm).toBe(2);
    expect(lookupAtmosphereTemperatureDm("C").dm).toBe(6);
  });

  it("keeps atmosphere 0/1 at DM0 with swing note", () => {
    const atmo0 = lookupAtmosphereTemperatureDm(0);
    const atmo1 = lookupAtmosphereTemperatureDm(1);
    expect(atmo0.dm).toBe(0);
    expect(atmo1.dm).toBe(0);
    expect(atmo0.notes[0]).toContain("extreme day/night");
  });
});

describe("reverseEngineerTemperatureRawRoll", () => {
  it("uses known temperature defaults (cold=4, temperate=7, hot=10)", () => {
    expect(estimateModifiedTemperatureRollFromType("cold")).toBe(4);
    expect(estimateModifiedTemperatureRollFromType("temperate")).toBe(7);
    expect(estimateModifiedTemperatureRollFromType("hot")).toBe(10);
  });

  it("reverse engineers raw roll by removing atmosphere DM", () => {
    const result = reverseEngineerTemperatureRawRoll({
      modifiedRoll: 10,
      atmosphereCode: "B", // DM+6
    });

    expect(result.atmosphereDm).toBe(6);
    expect(result.rawRoll).toBe(4);
  });
});

describe("BASIC_MEAN_TEMPERATURE_TABLE_55", () => {
  it("contains entries for modified rolls 0 through 12", () => {
    expect(Object.keys(BASIC_MEAN_TEMPERATURE_TABLE_55)).toHaveLength(13);
    expect(BASIC_MEAN_TEMPERATURE_TABLE_55[7]).toEqual({ celsius: 15, kelvin: 288 });
    expect(BASIC_MEAN_TEMPERATURE_TABLE_55[12]).toEqual({ celsius: 115, kelvin: 388 });
  });
});

describe("lookupBasicMeanTemperature", () => {
  it("returns table values for in-range modified rolls", () => {
    const result = lookupBasicMeanTemperature(7);
    expect(result.celsius).toBe(15);
    expect(result.kelvin).toBe(288);
    expect(result.source).toBe("table");
  });

  it("extends below zero by -5C per step from -1 => 0C", () => {
    const result = lookupBasicMeanTemperature(-2);
    expect(result.celsius).toBe(-5);
    expect(result.kelvin).toBe(268);
    expect(result.source).toBe("below_zero");
  });

  it("extends above 12 by +50C per step", () => {
    const result = lookupBasicMeanTemperature(14);
    expect(result.celsius).toBe(215);
    expect(result.kelvin).toBe(488);
    expect(result.source).toBe("above_twelve");
  });

  it("re-rolls extreme low values as 1D+5 Kelvin", () => {
    const result = lookupBasicMeanTemperature(-40, { rng: fixedRng(0) });
    expect(result.rerolledExtremeLow).toBe(true);
    expect(result.kelvin).toBe(6);
    expect(result.source).toBe("extreme_low_reroll");
  });

  it("returns null for invalid input", () => {
    expect(lookupBasicMeanTemperature(undefined)).toBeNull();
    expect(lookupBasicMeanTemperature(Number.NaN)).toBeNull();
  });
});

describe("calculateBasicMeanTemperatureOrbitDm", () => {
  it("applies positive DM inside HZCO-1 with 0.5-step scaling", () => {
    expect(calculateBasicMeanTemperatureOrbitDm({ orbitNumber: 2, hzco: 3.3 })).toBe(5);
  });

  it("applies negative DM outside HZCO+1 with 0.5-step scaling", () => {
    expect(calculateBasicMeanTemperatureOrbitDm({ orbitNumber: 5.2, hzco: 3.3 })).toBe(-6);
  });

  it("returns 0 inside the HZCO +/- 1 window", () => {
    expect(calculateBasicMeanTemperatureOrbitDm({ orbitNumber: 3.8, hzco: 3.3 })).toBe(0);
  });

  it("uses divisional translation when low-orbit values are involved", () => {
    expect(calculateBasicMeanTemperatureOrbitDm({ orbitNumber: 0.2, hzco: 0.8 })).toBe(8);
  });
});

describe("calculateBasicMeanTemperatureModifiedRoll", () => {
  it("combines raw roll, atmosphere DM, orbit DM, and additional DM", () => {
    const result = calculateBasicMeanTemperatureModifiedRoll({
      rawRoll: 7,
      atmosphereCode: "B", // DM+6
      orbitNumber: 2,
      hzco: 3.3, // DM+5
      additionalDm: -1,
    });

    expect(result.rawRoll).toBe(7);
    expect(result.atmosphereDm).toBe(6);
    expect(result.orbitDm).toBe(5);
    expect(result.modifiedRoll).toBe(17);
  });
});

describe("rollWorldAlbedo", () => {
  it("rolls rocky terrestrial base + atmosphere + hydro modifiers", () => {
    const rng = seqRng(
      3 / 6,
      3 / 6, // base 2D=8  => 0.16
      3 / 6,
      2 / 6, // atmo 2D=7  => +0.07 (atmo 6)
      4 / 6,
      3 / 6, // hydro 2D=9 => +0.15 (hydro 6+)
    );

    const result = rollWorldAlbedo({
      worldType: ALBEDO_WORLD_TYPES.ROCKY_TERRESTRIAL,
      atmosphereCode: 6,
      hydrographicsCode: 6,
      rng,
    });

    expect(result.baseAlbedo).toBeCloseTo(0.16, 9);
    expect(result.atmosphereModifier).toBeCloseTo(0.07, 9);
    expect(result.hydrographicsModifier).toBeCloseTo(0.15, 9);
    expect(result.albedo).toBeCloseTo(0.38, 9);
  });

  it("applies icy-far low-result adjustment and clamps to minimum 0.02", () => {
    const rng = seqRng(
      0,
      0, // base 2D=2 => 0.25
      5 / 6, // special 1D=6 => -0.25
    );

    const result = rollWorldAlbedo({
      worldType: ALBEDO_WORLD_TYPES.ICY_TERRESTRIAL_FAR,
      rng,
    });

    expect(result.specialAdjustment).toBeCloseTo(-0.25, 9);
    expect(result.albedo).toBe(0.02);
  });

  it("returns null for unknown world type", () => {
    expect(rollWorldAlbedo({ worldType: "UNKNOWN" })).toBeNull();
  });
});

describe("calculateInitialGreenhouseFactor", () => {
  it("uses 0.5 * sqrt(pressureBar)", () => {
    expect(calculateInitialGreenhouseFactor({ atmosphericPressureBar: 1.04 })).toBeCloseTo(0.5099, 4);
  });

  it("returns null for invalid pressure", () => {
    expect(calculateInitialGreenhouseFactor({ atmosphericPressureBar: -1 })).toBeNull();
    expect(calculateInitialGreenhouseFactor({ atmosphericPressureBar: Number.NaN })).toBeNull();
  });
});

describe("calculateEffectiveGreenhouseFactor", () => {
  it("applies +3D*0.01 for atmospheres 1-9, D, E", () => {
    const rng = seqRng(
      2 / 6,
      2 / 6,
      1 / 6, // 3D = 8
    );
    const result = calculateEffectiveGreenhouseFactor({
      atmosphericPressureBar: 1.04,
      atmosphereCode: 6,
      rng,
    });

    expect(result.initialGreenhouseFactor).toBeCloseTo(0.5099, 4);
    expect(result.additiveModifier).toBeCloseTo(0.08, 9);
    expect(result.effectiveGreenhouseFactor).toBeCloseTo(0.5899, 4);
  });

  it("applies A/F multiplier with minimum x0.5", () => {
    const result = calculateEffectiveGreenhouseFactor({
      atmosphericPressureBar: 1,
      atmosphereCode: "A",
      rng: fixedRng(0), // 1D = 1 -> 1D-1 => 0 -> min 0.5
    });

    expect(result.initialGreenhouseFactor).toBe(0.5);
    expect(result.multiplierModifier).toBe(0.5);
    expect(result.effectiveGreenhouseFactor).toBe(0.25);
  });

  it("applies B/C/G/H branch with 1D=6 -> x(3D)", () => {
    const rng = seqRng(
      5 / 6, // 1D = 6 -> use 3D multiplier
      2 / 6,
      2 / 6,
      3 / 6, // 3D = 10
    );

    const result = calculateEffectiveGreenhouseFactor({
      atmosphericPressureBar: 1,
      atmosphereCode: "B",
      rng,
    });

    expect(result.multiplierModifier).toBe(10);
    expect(result.effectiveGreenhouseFactor).toBe(5);
  });

  it("returns zero greenhouse for vacuum atmosphere code 0", () => {
    const result = calculateEffectiveGreenhouseFactor({ atmosphericPressureBar: 1, atmosphereCode: 0 });
    expect(result.modifierType).toBe("vacuum");
    expect(result.effectiveGreenhouseFactor).toBe(0);
  });
});

describe("calculateMeanTemperatureKelvin", () => {
  it("matches the Zed Prime style worked example (~300K)", () => {
    const kelvin = calculateMeanTemperatureKelvin({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactor: 0.59,
    });

    expect(kelvin).toBeCloseTo(300, 0);
  });

  it("returns null for invalid physical inputs", () => {
    expect(
      calculateMeanTemperatureKelvin({ luminosity: 1, distanceAu: 1, albedo: 1.2, greenhouseFactor: 0 }),
    ).toBeNull();
    expect(
      calculateMeanTemperatureKelvin({ luminosity: 1, distanceAu: 0, albedo: 0.3, greenhouseFactor: 0 }),
    ).toBeNull();
    expect(
      calculateMeanTemperatureKelvin({ luminosity: 1, distanceAu: 1, albedo: 0.3, greenhouseFactor: -2 }),
    ).toBeNull();
  });
});

describe("calculateMeanTemperature", () => {
  it("returns K/C/F conversions from the same temperature calculation", () => {
    const result = calculateMeanTemperature({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      precision: 2,
    });

    expect(result.kelvin).toBeCloseTo(300, 0);
    expect(result.celsius).toBeCloseTo(result.kelvin - 273, 2);
    expect(result.fahrenheit).toBeCloseTo(result.kelvin * 1.8 - 459.67, 2);
  });
});

describe("calculateCombinedTemperatureKelvin", () => {
  it("combines independent contributors using fourth-power addition", () => {
    const result = calculateCombinedTemperatureKelvin({ temperaturesK: [288, 100] });
    const expected = Math.pow(288 ** 4 + 100 ** 4, 0.25);
    expect(result).toBeCloseTo(expected, 9);
  });

  it("returns null for invalid input arrays", () => {
    expect(calculateCombinedTemperatureKelvin()).toBeNull();
    expect(calculateCombinedTemperatureKelvin({ temperaturesK: [] })).toBeNull();
  });
});

describe("gas giant residual heat utilities", () => {
  it("computes residual heat from gas giant mass and age", () => {
    const residualHeatK = calculateGasGiantResidualHeatTemperatureKelvin({
      massEarth: 1200,
      ageGyr: 6.336,
      precision: 2,
    });

    expect(residualHeatK).toBeCloseTo(187, 0);
  });

  it("converts radius and temperature to thermal luminosity in solar units", () => {
    const luminosity = calculateThermalLuminositySolar({
      radiusKm: (11.6 * 12800) / 2,
      temperatureK: 256,
      precision: 12,
    });

    expect(luminosity).toBeGreaterThan(0);
    expect(luminosity).toBeLessThan(1e-6);
  });

  it("matches the worked-example residual + cloud-top + moon-heating workflow", () => {
    const result = calculateGasGiantResidualHeatScenario({
      massEarth: 1200,
      ageGyr: 6.336,
      cloudTopTemperatureK: 235,
      gasGiantDiameterTerran: 11.6,
      moonDistanceKm: 3_920_000,
      baselineMoonTemperatureK: 256,
      precision: 6,
    });

    expect(result.residualHeatTemperatureK).toBeCloseTo(187, 0);
    expect(result.gasGiantEffectiveTemperatureK).toBeCloseTo(256, 0);
    expect(result.moonHeatingTemperatureK).toBeGreaterThan(20);
    expect(result.moonHeatingTemperatureK).toBeLessThan(30);
    expect(result.moonHeatingDeltaK).toBeCloseTo(0.0055, 3);
  });
});

describe("high/low temperature utilities", () => {
  it("normalizes axial tilt to 0-90 degrees for variation calculations", () => {
    expect(normalizeAxialTiltForTemperatureVariation(-100)).toBe(80);
    expect(normalizeAxialTiltForTemperatureVariation(120)).toBe(60);
    expect(normalizeAxialTiltForTemperatureVariation(250)).toBe(70);
  });

  it("matches Zed Prime style factor math from steps 1-8", () => {
    const axial = calculateAxialTiltFactor({
      axialTiltDegrees: 73.65,
      yearLengthStandardYears: 26 / 365.25,
      precision: 3,
    });
    const rotation = calculateRotationFactor({ solarDayHours: 85.77, precision: 3 });
    const geography = calculateGeographicFactor({
      hydrographicsCode: 6,
      surfaceDistributionCode: 5,
      precision: 3,
    });
    const variance = calculateVarianceFactors({
      axialTiltFactor: axial.factor,
      rotationFactor: rotation.factor,
      geographicFactor: geography.factor,
      precision: 3,
    });
    const atmosphericFactor = calculateAtmosphericFactor({ atmosphericPressureBar: 1.04, precision: 3 });
    const luminosityModifier = calculateLuminosityModifier({
      varianceFactors: variance.value,
      atmosphericFactor,
      precision: 3,
    });
    const luminosities = calculateHighLowLuminosity({ luminosity: 1.419, luminosityModifier, precision: 3 });
    const nearFar = calculateNearFarAu({ distanceAu: 1.06, eccentricity: 0.1, precision: 3 });

    expect(axial.factor).toBeCloseTo(0.48, 2);
    expect(rotation.factor).toBeCloseTo(0.185, 3);
    expect(variance.value).toBeCloseTo(0.865, 3);
    expect(atmosphericFactor).toBeCloseTo(2.04, 2);
    expect(luminosityModifier).toBeCloseTo(0.424, 3);
    expect(luminosities.highLuminosity).toBeCloseTo(2.021, 3);
    expect(luminosities.lowLuminosity).toBeCloseTo(0.817, 3);
    expect(nearFar.nearAu).toBeCloseTo(0.954, 3);
    expect(nearFar.farAu).toBeCloseTo(1.166, 3);
  });

  it("computes expected high/low temperatures from luminosity and AU modifiers", () => {
    const profile = calculateHighLowTemperatureProfile({
      luminosity: 1.419,
      luminosityModifier: 0.424,
      distanceAu: 1.06,
      eccentricity: 0.1,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      precision: 0,
    });

    expect(profile.high.kelvin).toBeCloseTo(346, 0);
    expect(profile.low.kelvin).toBeCloseTo(250, 0);
  });

  it("returns a complete world high/low profile for the combined workflow", () => {
    const profile = calculateWorldHighLowTemperatureProfile({
      axialTiltDegrees: 73.65,
      yearLengthStandardYears: 26 / 365.25,
      solarDayHours: 85.77,
      isOneToOneSunLock: false,
      hydrographicsCode: 6,
      surfaceDistributionCode: 5,
      atmosphericPressureBar: 1.04,
      luminosity: 1.419,
      distanceAu: 1.06,
      eccentricity: 0.1,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      precision: 3,
    });

    expect(profile.luminosityModifier).toBeCloseTo(0.424, 3);
    expect(profile.temperatureProfile.high.kelvin).toBeCloseTo(346, 0);
    expect(profile.temperatureProfile.low.kelvin).toBeCloseTo(250, 0);
  });
});

describe("additional temperature scenario utilities", () => {
  it("builds a scenario luminosity modifier from adjusted component factors", () => {
    const result = calculateScenarioLuminosityModifier({
      axialTiltFactor: 0.48,
      rotationFactor: 0.185,
      geographicFactor: 0.2,
      atmosphericPressureBar: 1.04,
      precision: 3,
    });

    expect(result.variance.value).toBeCloseTo(0.865, 3);
    expect(result.atmosphericFactor).toBeCloseTo(2.04, 2);
    expect(result.luminosityModifier).toBeCloseTo(0.424, 3);
  });

  it("scales greenhouse factor by pressure ratio at altitude", () => {
    const result = calculateAltitudeAdjustedGreenhouseFactor({
      greenhouseFactor: 0.59,
      meanPressureBar: 1.04,
      altitudeKm: 5,
      scaleHeightKm: 12.88,
      precision: 4,
    });

    expect(result.pressureAtAltitudeBar).toBeCloseTo(0.7058, 3);
    expect(result.pressureRatio).toBeCloseTo(0.6786, 3);
    expect(result.adjustedGreenhouseFactor).toBeCloseTo(0.486, 2);
  });

  it("computes mean/high/low scenario temperatures with altitude adjustment", () => {
    const result = calculateAdditionalTemperatureScenario({
      luminosity: 1.419,
      distanceAu: 1.06,
      eccentricity: 0.1,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      luminosityModifier: 0.424,
      altitudeKm: 5,
      meanPressureBar: 1.04,
      scaleHeightKm: 12.88,
      precision: 2,
    });

    expect(result.altitudeAdjustment).toBeTruthy();
    expect(result.highLowTemperature).toBeTruthy();
    expect(result.meanTemperature.kelvin).toBeCloseTo(295.64, 2);
    expect(result.highLowTemperature.high.kelvin).toBeGreaterThan(result.meanTemperature.kelvin);
    expect(result.highLowTemperature.low.kelvin).toBeLessThan(result.meanTemperature.kelvin);
    expect(result.highLowTemperature.high.kelvin).toBeGreaterThan(335);
    expect(result.highLowTemperature.high.kelvin).toBeLessThan(345);
    expect(result.highLowTemperature.low.kelvin).toBeGreaterThan(240);
    expect(result.highLowTemperature.low.kelvin).toBeLessThan(250);
  });
});

describe("latitude temperature scenario utilities", () => {
  it("applies tropical vs middle/arctic adjustments for tilt below 45°", () => {
    const tropical = calculateLatitudeZoneAdjustment({ axialTiltDegrees: 23.5, latitudeDegrees: 10, precision: 4 });
    const middle = calculateLatitudeZoneAdjustment({ axialTiltDegrees: 23.5, latitudeDegrees: 60, precision: 4 });

    expect(tropical.zone).toBe("tropical");
    expect(tropical.zoneLatitudeAdjustment).toBeCloseTo(0.3665, 3);
    expect(middle.zone).toBe("middle");
    expect(middle.zoneLatitudeAdjustment).toBeCloseTo(-0.2588, 3);
  });

  it("applies Part B overlap logic for tilt 45° or higher", () => {
    const arctic = calculateLatitudeZoneAdjustment({ axialTiltDegrees: 60, latitudeDegrees: 20, precision: 4 });
    const tropicalOverlap = calculateLatitudeZoneAdjustment({
      axialTiltDegrees: 60,
      latitudeDegrees: 40,
      precision: 4,
    });

    expect(arctic.zone).toBe("arctic");
    expect(arctic.zoneLatitudeAdjustment).toBeCloseTo(0.4226, 3);
    expect(tropicalOverlap.zone).toBe("tropical_overlap");
    expect(tropicalOverlap.zoneLatitudeAdjustment).toBeCloseTo(0.2588, 3);
  });

  it("computes latitude luminosity and latitude-specific temperature", () => {
    const lat = calculateLatitudeTemperatureScenario({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      axialTiltDegrees: 23.5,
      latitudeDegrees: 10,
      atmosphericPressureBar: 1.04,
      precision: 2,
    });
    const mean = calculateMeanTemperature({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactor: 0.59,
      precision: 2,
    });

    expect(lat.luminosity.latitudeLuminosityModifier).toBeGreaterThan(0);
    expect(lat.temperature.kelvin).toBeGreaterThan(mean.kelvin);
  });
});

describe("sunlight portion and hours utilities", () => {
  it("computes solar declination from axial tilt, date, and solar days in year", () => {
    const declination = calculateSolarDeclinationDegrees({
      axialTiltDegrees: 23.5,
      dateSolarDays: 0,
      solarDaysPerYear: 365,
      precision: 3,
    });

    expect(declination).toBeCloseTo(23.5, 6);
  });

  it("computes sunrise cosine from latitude and declination", () => {
    const sunriseCosine = calculateSunriseCosine({
      latitudeDegrees: 45,
      solarDeclinationDegrees: 23.5,
      precision: 6,
    });

    expect(sunriseCosine).toBeCloseTo(0.434812, 6);
  });

  it("handles no-sunrise and constant-daylight edge states", () => {
    const noSunrise = calculateSunlightPortionFromSunriseCosine({
      sunriseCosine: 1.2,
      solarDayHours: 24,
      precision: 3,
    });
    const constantDaylight = calculateSunlightPortionFromSunriseCosine({
      sunriseCosine: -1.2,
      solarDayHours: 24,
      precision: 3,
    });

    expect(noSunrise.daylightState).toBe("no_sunrise");
    expect(noSunrise.sunlightPortion).toBe(0);
    expect(noSunrise.sunlightHours).toBe(0);

    expect(constantDaylight.daylightState).toBe("constant_daylight");
    expect(constantDaylight.sunlightPortion).toBe(1);
    expect(constantDaylight.sunlightHours).toBe(24);
  });

  it("computes full sunlight model output for normal day/night", () => {
    const result = calculateSunlightPortionAndHours({
      axialTiltDegrees: 23.5,
      latitudeDegrees: 45,
      dateSolarDays: 0,
      solarDaysPerYear: 365,
      solarDayHours: 24,
      precision: 6,
    });

    expect(result.daylightState).toBe("normal");
    expect(result.sunriseAngleDegrees).toBeCloseTo(64.226644, 6);
    expect(result.sunlightPortion).toBeCloseTo(0.356815, 6);
    expect(result.sunlightHours).toBeCloseTo(8.563553, 6);
  });
});

describe("time-of-day scenario utilities", () => {
  it("computes even-day adjusted fractional day and hourly rotation factor", () => {
    const adjusted = calculateAdjustedFractionalDayEven({ hoursSinceDawn: 0, solarDayHours: 24, precision: 3 });
    const hourly = calculateHourlyRotationFactor({
      adjustedFractionalDay: adjusted,
      rotationFactor: 0.2,
      precision: 4,
    });
    const profile = calculateTimeOfDayRotationFactor({
      rotationFactor: 0.2,
      hoursSinceDawn: 12,
      solarDayHours: 24,
      method: "even",
      precision: 4,
    });

    expect(adjusted).toBeCloseTo(0.15, 3);
    expect(hourly).toBeCloseTo(0.1618, 3);
    expect(profile.hourlyRotationFactor).toBeCloseTo(-0.1618, 3);
  });

  it("computes uneven-day adjusted fractional day", () => {
    const adjusted = calculateAdjustedFractionalDayUneven({
      hoursSinceDawn: 6,
      solarDayHours: 24,
      sunlightPortion: 0.25,
      isDaytime: true,
      precision: 3,
    });

    expect(adjusted).toBeCloseTo(0.65, 3);
  });

  it("auto-derives sunlight portion in uneven mode when tilt/latitude/date are provided", () => {
    const profile = calculateTimeOfDayRotationFactor({
      rotationFactor: 0.2,
      hoursSinceDawn: 6,
      solarDayHours: 24,
      method: "uneven",
      axialTiltDegrees: 23.5,
      latitudeDegrees: 0,
      dateSolarDays: 91.25,
      solarDaysPerYear: 365,
      isDaytime: true,
      precision: 4,
    });

    expect(profile.sunlightModel).toBeTruthy();
    expect(profile.sunlightModel.daylightState).toBe("normal");
    expect(profile.sunlightPortion).toBeCloseTo(0.5, 3);
    expect(profile.adjustedFractionalDay).toBeCloseTo(0.4, 3);
  });
});

describe("twilight scenario utilities", () => {
  it("computes horizon-distance terrain proxy in km and degrees", () => {
    const distanceKm = calculateHorizonDistanceKm({ heightKm: 1, worldDiameterKm: 12742, precision: 3 });
    const distanceDeg = calculateHorizonDistanceDegrees({ distanceKm, worldDiameterKm: 12742, precision: 3 });

    expect(distanceKm).toBeCloseTo(112.88, 2);
    expect(distanceDeg).toBeCloseTo(1.015, 3);
  });

  it("computes libration, disk/refraction, and twilight extent factors", () => {
    expect(calculateEccentricityLongitudinalLibrationDegrees({ eccentricity: 0.1 })).toBeCloseTo(14.5, 6);
    expect(calculateLatitudinalLibrationDegrees({ axialTiltDegrees: 30, latitudeDegrees: 60 })).toBeCloseTo(25.98, 2);
    expect(calculateSolarDiskVisibilityBandDegrees({ angularSizeDegrees: 2 }).halfBandDegrees).toBe(1);
    expect(calculateAtmosphericRefractionDegrees({ atmosphericPressureBar: 1, temperatureK: 300 })).toBe(0.5);
    expect(calculateTwilightZoneExtentDegrees({ scaleHeightKm: 8.5, worldSize: 8 })).toBe(6);
  });

  it("maps longitude from terminator to simplified locked-world rotation factor", () => {
    expect(calculateTwilightLockedRotationFactor({ longitudeFromTerminatorDeg: 9 })).toBeCloseTo(0.6, 6);
    expect(
      calculateTwilightLockedRotationFactor({ longitudeFromTerminatorDeg: -3, twilightZoneExtentDeg: 6 }),
    ).toBeCloseTo(-0.15, 3);
    expect(calculateTwilightLockedRotationFactor({ longitudeFromTerminatorDeg: -25, twilightZoneExtentDeg: 6 })).toBe(
      -1,
    );
  });
});

describe("altitude strict scenario utilities", () => {
  it("recomputes greenhouse from pressure(a) then applies original modifier", () => {
    const altitude = calculateAltitudeGreenhouseFactor({
      meanPressureBar: 1.04,
      altitudeKm: 5,
      scaleHeightKm: 12.88,
      originalGreenhouseModifier: 0.08,
      modifierMode: "add",
      precision: 3,
    });

    expect(altitude.pressureAtAltitudeBar).toBeCloseTo(0.705, 3);
    expect(altitude.initialGreenhouseFactorAtAltitude).toBeCloseTo(0.42, 2);
    expect(altitude.greenhouseFactorAtAltitude).toBeCloseTo(0.5, 2);
  });

  it("computes lower temperature at altitude when greenhouse factor drops", () => {
    const seaLevel = calculateMeanTemperature({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactor: 0.59,
    });
    const altitude = calculateAltitudeGreenhouseFactor({
      meanPressureBar: 1.04,
      altitudeKm: 5,
      scaleHeightKm: 12.88,
      originalGreenhouseModifier: 0.08,
      modifierMode: "add",
      precision: 3,
    });
    const atAltitude = calculateTemperatureAtAltitude({
      luminosity: 1.419,
      distanceAu: 1.06,
      albedo: 0.33,
      greenhouseFactorAtAltitude: altitude.greenhouseFactorAtAltitude,
    });

    expect(atAltitude.kelvin).toBeLessThan(seaLevel.kelvin);
  });
});

describe("multi-star and inherent effects utilities", () => {
  it("computes per-star nearest/mean/furthest distances with eccentricity", () => {
    const d = calculateMultiStarContributionDistances({
      planetAu: 1.06,
      planetEccentricity: 0.1,
      starAu: 0.036,
      starEccentricity: 0.11,
      includeEccentricity: true,
      precision: 3,
    });

    expect(d.nearestAu).toBeCloseTo(0.914, 3);
    expect(d.furthestAu).toBeCloseTo(1.206, 3);
    expect(d.meanAu).toBeCloseTo(1.061, 3);
  });

  it("combines two-star low/mean/high contributions", () => {
    const result = calculateMultiStarTemperatureScenario({
      planetAu: 1.06,
      planetEccentricity: 0.1,
      stars: [
        { name: "Aa", luminosity: 0.738, au: 0, eccentricity: 0 },
        { name: "Ab", luminosity: 0.681, au: 0.036, eccentricity: 0.11 },
      ],
      albedo: 0.33,
      greenhouseFactor: 0.59,
      includeEccentricity: true,
      precision: 2,
    });

    expect(result.total.meanK).toBeGreaterThan(295);
    expect(result.total.meanK).toBeLessThan(305);
    expect(result.total.highK).toBeGreaterThan(result.total.meanK);
    expect(result.total.lowK).toBeLessThan(result.total.meanK);
  });

  it("applies inherent temperature effects using fourth-power addition", () => {
    const single = applyInherentTemperatureEffectKelvin({
      baseTemperatureK: 300,
      addedTemperatureK: 100,
      precision: 3,
    });
    const profile = applyInherentTemperatureEffectProfile({
      lowTemperatureK: 260,
      meanTemperatureK: 300,
      highTemperatureK: 340,
      addedTemperatureK: 50,
      precision: 3,
    });

    expect(single).toBeGreaterThan(300);
    expect(profile.lowK).toBeGreaterThan(260);
    expect(profile.meanK).toBeGreaterThan(300);
    expect(profile.highK).toBeGreaterThan(340);
  });
});

describe("normalized temperature scenario orchestrator", () => {
  it("combines latitude, day-cycle, twilight, multi-star, and inherent effects", () => {
    const result = calculateNormalizedTemperatureScenario({
      base: {
        luminosity: 1.419,
        distanceAu: 1.06,
        eccentricity: 0.1,
        albedo: 0.33,
        greenhouseFactor: 0.59,
        luminosityModifier: 0.424,
        atmosphericPressureBar: 1.04,
      },
      latitude: {
        axialTiltDegrees: 23.5,
        latitudeDegrees: 35,
      },
      timeOfDay: {
        rotationFactor: 0.2,
        hoursSinceDawn: 9,
        solarDayHours: 24,
        method: "even",
      },
      twilight: {
        longitudeFromTerminatorDeg: -4,
        eccentricity: 0.1,
        axialTiltDegrees: 23.5,
        latitudeDegrees: 35,
        angularSizeDegrees: 1,
        atmosphericPressureBar: 1.04,
        worldSize: 8,
      },
      multiStar: {
        planetAu: 1.06,
        planetEccentricity: 0.1,
        stars: [
          { name: "Aa", luminosity: 0.738, au: 0, eccentricity: 0 },
          { name: "Ab", luminosity: 0.681, au: 0.036, eccentricity: 0.11 },
        ],
      },
      inherent: {
        addedTemperatureK: 35,
      },
      precision: 2,
    });

    expect(result).toBeTruthy();
    expect(result.components.base).toBeTruthy();
    expect(result.components.combined).toBeTruthy();
    expect(result.components.latitude).toBeTruthy();
    expect(result.components.timeOfDay).toBeTruthy();
    expect(result.components.twilight).toBeTruthy();
    expect(result.components.multiStar).toBeTruthy();
    expect(result.components.inherent).toBeTruthy();
    expect(result.profile.mean.kelvin).toBeGreaterThan(result.components.base.meanTemperature.kelvin);
    expect(result.profile.high.kelvin).toBeGreaterThan(result.profile.mean.kelvin);
    expect(result.profile.low.kelvin).toBeLessThan(result.profile.mean.kelvin);
  });
});

describe("candidate temperature scenario summary formatter", () => {
  it("produces compact UI summary rows from normalized scenarios", () => {
    const summary = formatCandidateTemperatureScenarioSummary({
      candidate: {
        slotId: "P-1",
        bodyLabel: "P-1",
        isMoon: false,
        meanTemperatureK: 300,
        normalizedTemperatureScenarios: {
          seaLevel: {
            profile: {
              low: { kelvin: 280 },
              mean: { kelvin: 300 },
              high: { kelvin: 320 },
            },
          },
          highAltitude: {
            profile: {
              low: { kelvin: 270 },
              mean: { kelvin: 290 },
              high: { kelvin: 310 },
            },
          },
          seasonalPeak: {
            profile: {
              low: { kelvin: 290 },
              mean: { kelvin: 310 },
              high: { kelvin: 330 },
            },
          },
        },
      },
      precision: 2,
    });

    expect(summary).toBeTruthy();
    expect(summary.presets).toHaveLength(3);
    expect(summary.warmestPresetKey).toBe("seasonalPeak");
    expect(summary.coldestPresetKey).toBe("highAltitude");
    expect(summary.presets[0].deltaMeanK).toBeCloseTo(0, 6);
  });
});

describe("lookupRunawayGreenhouseAtmosphereCode", () => {
  it("maps Table 31 totals to atmosphere A/B/C", () => {
    expect(lookupRunawayGreenhouseAtmosphereCode(1)).toBe("A");
    expect(lookupRunawayGreenhouseAtmosphereCode(2)).toBe("B");
    expect(lookupRunawayGreenhouseAtmosphereCode(4)).toBe("B");
    expect(lookupRunawayGreenhouseAtmosphereCode(5)).toBe("C");
  });
});

describe("rollRunawayGreenhouseAtmosphere", () => {
  it("applies size and tainted-atmosphere DMs for conversion", () => {
    const result = rollRunawayGreenhouseAtmosphere({
      size: 5,
      originalAtmosphereCode: 9,
      rng: fixedRng(0), // 1D = 1
    });

    // DM-2 size + DM+1 tainted => total DM-1, 1D(1) => total 0 => A
    expect(result.dm).toBe(-1);
    expect(result.total).toBe(0);
    expect(result.newAtmosphereCode).toBe("A");
    expect(result.newAtmosphereCodeValue).toBe(10);
  });
});

describe("calculateRunawayGreenhouseCheckDm", () => {
  it("adds age DM and boiling DM", () => {
    const result = calculateRunawayGreenhouseCheckDm({
      systemAgeByr: 1.2,
      temperatureModifiedRoll: 12,
    });

    // ceil(1.2)=2 and boiling +4
    expect(result.dm).toBe(6);
  });

  it("uses detailed mean-temperature DM instead of boiling DM", () => {
    const result = calculateRunawayGreenhouseCheckDm({
      systemAgeByr: 0,
      temperatureModifiedRoll: 12,
      meanTemperatureK: 333,
    });

    // 30K above 303 => +3, replacing boiling DM
    expect(result.dm).toBe(3);
    expect(result.detailedTemperatureDmUsed).toBe(true);
  });

  it("applies optional inner-temperate DM-2", () => {
    const result = calculateRunawayGreenhouseCheckDm({
      temperatureModifiedRoll: 7,
      orbitNumber: 2.5,
      hzco: 3.3,
      allowInnerTemperateCheck: true,
    });

    expect(result.dm).toBe(-2);
  });
});

describe("evaluateRunawayGreenhouse", () => {
  it("can trigger and convert a convertible atmosphere", () => {
    const result = evaluateRunawayGreenhouse({
      atmosphereCode: 9,
      size: 5,
      temperatureModifiedRoll: 10,
      systemAgeByr: 0,
      rng: seqRng(
        (6 - 1) / 6,
        (6 - 1) / 6, // 2D greenhouse check = 12 => occurred
        (1 - 1) / 6, // conversion 1D = 1
      ),
    });

    expect(result.eligible).toBe(true);
    expect(result.occurred).toBe(true);
    expect(result.finalAtmosphereCode).toBe("A");
    expect(result.finalAtmosphereCodeValue).toBe(10);
    expect(result.atmosphereChanged).toBe(true);
    expect(result.forceBoilingForHydrographics).toBe(true);
    expect(result.atmosphereSubtypeDm).toBe(4);
  });

  it("keeps high atmospheres and only enforces boiling hydro effect", () => {
    const result = evaluateRunawayGreenhouse({
      atmosphereCode: "B",
      size: 6,
      temperatureModifiedRoll: 11,
      rng: rngFor2d(12),
    });

    expect(result.occurred).toBe(true);
    expect(result.atmosphereChanged).toBe(false);
    expect(result.finalAtmosphereCode).toBe("B");
    expect(result.hydrographicsTemperatureDm).toBe(-6);
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

  it("supports two-dice-linear pressure method", () => {
    const pressure = rollAtmospherePressureBar({
      atmosphereCode: 6,
      method: "two-dice-linear",
      rng: seqRng(
        (3 - 1) / 6,
        (4 - 1) / 6, // d1=3,d2=4 -> index 13 -> 13/30
      ),
    });

    expect(pressure.method).toBe("two-dice-linear");
    expect(pressure.diceRolls).toEqual({ d1: 3, d2: 4 });
    expect(pressure.linearFactor).toBeCloseTo(13 / 30, 10);
    expect(pressure.pressureBar).toBeCloseTo(1.0423, 3);
  });
});

describe("isNitrogenOxygenAtmosphere", () => {
  it("identifies nitrogen-oxygen atmosphere classes", () => {
    expect(isNitrogenOxygenAtmosphere(2)).toBe(true);
    expect(isNitrogenOxygenAtmosphere("E")).toBe(true);
    expect(isNitrogenOxygenAtmosphere("A")).toBe(false);
  });
});

describe("calculateOxygenFractionAgeDm", () => {
  it("applies DM+1 when system age is above 4 Gyr", () => {
    const result = calculateOxygenFractionAgeDm({ systemAgeByr: 4.1 });
    expect(result.dm).toBe(1);
  });

  it("applies optional young-world DMs", () => {
    expect(calculateOxygenFractionAgeDm({ systemAgeByr: 3.2, useOptionalYoungWorldDm: true }).dm).toBe(-1);
    expect(calculateOxygenFractionAgeDm({ systemAgeByr: 2.5, useOptionalYoungWorldDm: true }).dm).toBe(-2);
    expect(calculateOxygenFractionAgeDm({ systemAgeByr: 1.8, useOptionalYoungWorldDm: true }).dm).toBe(-4);
  });
});

describe("rollOxygenFraction", () => {
  it("rolls classic oxygen fraction with age DM", () => {
    const result = rollOxygenFraction({
      atmosphereCode: 6,
      systemAgeByr: 5,
      method: "classic",
      rng: seqRng(
        (5 - 1) / 6, // 1D=5
        (2 - 1) / 6,
        (3 - 1) / 6, // 2D=5
        (4 - 1) / 6, // tail 1D=4
      ),
    });

    // (5+1)/20 + (5-7)/100 + (4-1)/20 = 0.43 (clamped to 0.4)
    expect(result.eligible).toBe(true);
    expect(result.oxygenFraction).toBe(0.4);
  });

  it("supports compact-d10 oxygen method", () => {
    const result = rollOxygenFraction({
      atmosphereCode: 6,
      method: "compact-d10",
      rng: seqRng((4 - 1) / 6, (8 - 1) / 10),
    });

    // (4-1)/20 + 0.08 = 0.23
    expect(result.oxygenFraction).toBeCloseTo(0.23, 10);
  });

  it("uses fallback when computed oxygen fraction is <= 0", () => {
    const result = rollOxygenFraction({
      atmosphereCode: 6,
      systemAgeByr: 1.0,
      useOptionalYoungWorldDm: true,
      method: "compact-d10",
      rng: seqRng(
        (1 - 1) / 6,
        (1 - 1) / 10, // initial <=0
        (3 - 1) / 6, // fallback 1D=3 -> 0.03
      ),
    });

    expect(result.fallbackApplied).toBe(true);
    expect(result.oxygenFraction).toBeCloseTo(0.03, 10);
  });
});

describe("calculateOxygenPartialPressureBar", () => {
  it("multiplies oxygen fraction by total pressure", () => {
    expect(calculateOxygenPartialPressureBar({ oxygenFraction: 0.28, totalPressureBar: 1.042 })).toBeCloseTo(
      0.29176,
      6,
    );
  });
});

describe("evaluateAtmosphereOxygenTaint", () => {
  it("flags low-oxygen taint and suggests breathable equivalent conversion", () => {
    const result = evaluateAtmosphereOxygenTaint({
      atmosphereCode: 6,
      totalPressureBar: 1.0,
      oxygenPartialPressureBar: 0.08,
    });

    expect(result.oxygenTrait).toBe("low-oxygen");
    expect(result.oxygenTaintLikely).toBe(true);
    expect(result.suggestedTaintedEquivalent).toBe("7");
  });

  it("can auto-convert breathable atmosphere to tainted equivalent", () => {
    const result = evaluateAtmosphereOxygenTaint({
      atmosphereCode: 8,
      totalPressureBar: 1.1,
      oxygenPartialPressureBar: 0.55,
      autoConvertBreathableToTainted: true,
    });

    expect(result.finalAtmosphereCode).toBe("9");
  });
});

describe("calculateAtmosphereScaleHeightKm", () => {
  it("uses baseline approximation 8.5/g", () => {
    expect(calculateAtmosphereScaleHeightKm({ gravityG: 0.66 })).toBeCloseTo(12.8787, 3);
  });

  it("supports temperature-adjusted approximation", () => {
    expect(
      calculateAtmosphereScaleHeightKm({ gravityG: 0.66, meanTemperatureK: 288, useTemperatureAdjustment: true }),
    ).toBeCloseTo(12.8787, 3);
  });
});

describe("calculateAtmosphericPressureAtAltitudeBar", () => {
  it("computes exponential pressure drop with altitude", () => {
    const pressure = calculateAtmosphericPressureAtAltitudeBar({
      meanPressureBar: 1.042,
      altitudeKm: 5,
      scaleHeightKm: 12.88,
    });

    expect(pressure).toBeCloseTo(0.707, 2);
  });
});

describe("estimateMeanTemperatureKFromRegionType", () => {
  it("maps table region types to representative Kelvin means", () => {
    expect(estimateMeanTemperatureKFromRegionType("Frozen")).toBe(210);
    expect(estimateMeanTemperatureKFromRegionType("Temperate")).toBe(288);
    expect(estimateMeanTemperatureKFromRegionType("Hot")).toBe(328.5);
  });
});

describe("formatAtmosphereProfile", () => {
  it("formats A-bar-ppo shorthand", () => {
    const profile = formatAtmosphereProfile({
      atmosphereCode: 6,
      totalPressureBar: 1.042,
      oxygenPartialPressureBar: 0.292,
      precision: 3,
    });

    expect(profile).toBe("6-1.042-0.292");
  });
});

describe("generateHabitableZoneAtmosphereProfile", () => {
  it("builds pressure, oxygen, ppo, scale-height, and profile bundle", () => {
    const result = generateHabitableZoneAtmosphereProfile({
      atmosphereCode: 6,
      systemAgeByr: 5,
      oxygenMethod: "classic",
      gravityG: 0.66,
      meanTemperatureK: 288,
      precision: 3,
      rng: seqRng(
        0.5, // pressure uniform
        (5 - 1) / 6,
        (2 - 1) / 6,
        (3 - 1) / 6,
        (4 - 1) / 6, // oxygen rolls
      ),
    });

    expect(result.pressure.pressureBar).toBeCloseTo(1.095, 3);
    expect(result.oxygenFraction.eligible).toBe(true);
    expect(result.oxygenPartialPressureBar).toBeGreaterThan(0);
    expect(result.profile).toContain("6-");
    expect(result.scaleHeightKm).toBeCloseTo(12.879, 3);
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

  it("applies optional hot and boiling temperature DMs", () => {
    const hot = rollWorldHydrographicsCode({
      atmosphereCode: 6,
      temperatureModifiedRoll: 10,
      rng: rngFor2d(7),
    });
    const boiling = rollWorldHydrographicsCode({
      atmosphereCode: 6,
      temperatureModifiedRoll: 12,
      rng: rngFor2d(7),
    });

    // base atmo 6 => hydro 6 at roll 7; hot DM-2 => 4; boiling DM-6 => 0
    expect(hot.hydrographicsCode).toBe(4);
    expect(boiling.hydrographicsCode).toBe(0);
  });

  it("supports forcing boiling DM regardless of temperature roll", () => {
    const result = rollWorldHydrographicsCode({
      atmosphereCode: 10,
      forceBoilingForHydrographics: true,
      rng: rngFor2d(7),
    });

    // 7 - 7 + 10 - 4 - 6 = 0
    expect(result.hydrographicsCode).toBe(0);
  });

  it("supports subtype-equivalent density code for A-C atmospheres", () => {
    const result = rollWorldHydrographicsCode({
      atmosphereCode: "A",
      equivalentDensityAtmosphereCode: "7",
      rng: rngFor2d(6),
    });

    // 6 - 7 + 7 - 4 = 2
    expect(result.hydrographicsCode).toBe(2);
  });

  it("ignores hot/boiling temperature DMs for atmosphere D", () => {
    const result = rollWorldHydrographicsCode({
      atmosphereCode: "D",
      temperatureModifiedRoll: 12,
      rng: rngFor2d(7),
    });

    // 7 - 7 + 13 - 4 = 9, no boiling DM applied
    expect(result.hydrographicsCode).toBe(9);
  });

  it("ignores hot/boiling temperature DMs for unusual panthalassic subtype 7", () => {
    const result = rollWorldHydrographicsCode({
      atmosphereCode: "F",
      unusualSubtypeCode: "7",
      equivalentDensityAtmosphereCode: "7",
      temperatureModifiedRoll: 12,
      rng: rngFor2d(7),
    });

    // 7 - 7 + 7 - 4 = 3, boiling DM ignored
    expect(result.hydrographicsCode).toBe(3);
  });
});

describe("HYDROGRAPHICS_RANGE_TABLE_49 / lookupHydrographicsRange", () => {
  it("contains codes 0 through A", () => {
    expect(HYDROGRAPHICS_RANGE_TABLE_49).toHaveLength(11);
    expect(HYDROGRAPHICS_RANGE_TABLE_49[0].codeLabel).toBe("0");
    expect(HYDROGRAPHICS_RANGE_TABLE_49[10].codeLabel).toBe("A");
  });

  it("looks up standard and extreme ranges", () => {
    expect(lookupHydrographicsRange(6)).toEqual({ code: 6, codeLabel: "6", minPercent: 56, maxPercent: 65 });
    expect(lookupHydrographicsRange("A")).toEqual({ code: 10, codeLabel: "A", minPercent: 96, maxPercent: 100 });
  });
});

describe("rollHydrographicsPercentage", () => {
  it("matches the example style: hydrographics 6 and d10=6 => 62%", () => {
    const result = rollHydrographicsPercentage({ hydrographicsCode: 6, rng: () => 0.5 });
    expect(result.d10Roll).toBe(6);
    expect(result.hydrographicsPercent).toBe(62);
  });

  it("clamps hydrographics 0 to 0-5%", () => {
    expect(rollHydrographicsPercentage({ hydrographicsCode: 0, rng: () => 0 }).hydrographicsPercent).toBe(0);
    expect(rollHydrographicsPercentage({ hydrographicsCode: 0, rng: () => 0.999 }).hydrographicsPercent).toBe(5);
  });

  it("treats size A+ hydrographics A as 100% liquid", () => {
    const result = rollHydrographicsPercentage({ hydrographicsCode: "A", sizeValue: 10, rng: () => 0 });
    expect(result.hydrographicsPercent).toBe(100);
  });
});

describe("SURFACE_DISTRIBUTION_TABLE_50 / rollSurfaceDistribution", () => {
  it("contains 0 through A results", () => {
    expect(SURFACE_DISTRIBUTION_TABLE_50).toHaveLength(11);
    expect(SURFACE_DISTRIBUTION_TABLE_50[0].code).toBe("0");
    expect(SURFACE_DISTRIBUTION_TABLE_50[10].code).toBe("A");
  });

  it("rolls 2D-2 and looks up Mixed on total 5", () => {
    const result = rollSurfaceDistribution({ rng: rngFor2d(7) });
    expect(result.roll).toBe(7);
    expect(result.total).toBe(5);
    expect(result.code).toBe("5");
    expect(result.description).toBe("Mixed");
  });
});

describe("determineHydrographicsFundamentalGeography", () => {
  it("defaults to ocean for hydrographics 6+ and land for 4-", () => {
    expect(determineHydrographicsFundamentalGeography({ hydrographicsCode: 6 }).fundamentalGeography).toBe("ocean");
    expect(determineHydrographicsFundamentalGeography({ hydrographicsCode: 4 }).fundamentalGeography).toBe("land");
  });

  it("rolls 1D for hydrographics 5", () => {
    const result = determineHydrographicsFundamentalGeography({ hydrographicsCode: 5, rng: () => 1 / 6 });
    expect(result.roll).toBe(2);
    expect(result.fundamentalGeography).toBe("ocean");
  });

  it("supports optional unexpected distributions using DM = 5 - hydrographics", () => {
    const result = determineHydrographicsFundamentalGeography({
      hydrographicsCode: 4,
      allowUnexpectedDistribution: true,
      rng: () => 1 / 6,
    });
    expect(result.roll).toBe(2);
    expect(result.dm).toBe(1);
    expect(result.adjustedRoll).toBe(3);
    expect(result.fundamentalGeography).toBe("ocean");
  });

  it("matches the example pattern for hydrographics 6 with DM-1", () => {
    const result = determineHydrographicsFundamentalGeography({
      hydrographicsCode: 6,
      allowUnexpectedDistribution: true,
      rng: () => 3 / 6,
    });
    expect(result.roll).toBe(4);
    expect(result.dm).toBe(-1);
    expect(result.adjustedRoll).toBe(3);
    expect(result.fundamentalGeography).toBe("ocean");
  });
});

describe("POSSIBLE_EXOTIC_LIQUIDS_TABLE_51 / getPossibleExoticLiquids", () => {
  it("contains the listed fluidic molecules", () => {
    expect(POSSIBLE_EXOTIC_LIQUIDS_TABLE_51).toHaveLength(15);
    expect(POSSIBLE_EXOTIC_LIQUIDS_TABLE_51[0].code).toBe("F2");
    expect(POSSIBLE_EXOTIC_LIQUIDS_TABLE_51[POSSIBLE_EXOTIC_LIQUIDS_TABLE_51.length - 1].code).toBe("H2SO4");
  });

  it("returns liquids valid at a mean temperature", () => {
    const result = getPossibleExoticLiquids({ meanTemperatureK: 220 });
    expect(result.some((entry) => entry.code === "NH3")).toBe(true);
    expect(result.some((entry) => entry.code === "H2O")).toBe(false);
  });

  it("can include magma above 1000K", () => {
    const result = getPossibleExoticLiquids({ meanTemperatureK: 1100 });
    expect(result[0].code).toBe("Magma");
  });
});

describe("selectHydrographicsLiquids", () => {
  it("returns weighted unique liquid candidates", () => {
    const result = selectHydrographicsLiquids({
      meanTemperatureK: 290,
      atmosphereGasMixes: [{ gas: "Water Vapour" }],
      count: 2,
      rng: () => 0,
    });
    expect(result).toHaveLength(2);
    expect(new Set(result.map((entry) => entry.code)).size).toBe(2);
  });
});

describe("formatHydrographicsProfile", () => {
  it("formats a Terra-style water profile", () => {
    const profile = formatHydrographicsProfile({
      hydrographicsCode: 7,
      surfaceDistributionCode: 4,
      hydrographicsPercent: 71,
      liquids: [{ code: "H2O", percent: 100 }],
    });
    expect(profile).toBe("7:4:71:H2O");
  });

  it("formats a Titan-style mixed profile without known percentages", () => {
    const profile = formatHydrographicsProfile({
      hydrographicsCode: 0,
      surfaceDistributionCode: 8,
      hydrographicsPercent: 2,
      liquids: [{ code: "CH4" }, { code: "C2H6" }],
    });
    expect(profile).toBe("0:8:02:CH4:C2H6");
  });

  it("formats explicit mixture percentages when provided", () => {
    const profile = formatHydrographicsProfile({
      hydrographicsCode: 2,
      surfaceDistributionCode: "5",
      hydrographicsPercent: 24,
      liquids: [
        { code: "O2", percent: 70 },
        { code: "CH4", percent: 30 },
      ],
    });
    expect(profile).toBe("2:5:24:O2-70:CH4-30");
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
    expect(c.surfaceDistributionRoll).toBe(8);
    expect(c.surfaceDistributionCode).toBe("6");
    expect(c.temperatureAtmosphereDm).toBe(0);
    expect(c.temperatureModifiedRoll).toBe(9);
    expect(c.temperatureRegionType).toBe("Temperate");
  });

  it("uses rolled surface distribution for geographic modifier when missing on input", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 30,
        orbitalPeriodYears: 1,
        solarDayHours: 24,
        secondaryWorldTypes: [],
      },
    ];

    // atmo 2D=8 -> atmo 6, hydro 2D=7 -> hydro 6, surface distribution 2D=11 -> code 9
    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      rng: rngFor2dSequence(8, 7, 11),
    });
    const c = result.candidates[0];

    expect(c.surfaceDistributionRoll).toBe(11);
    expect(c.surfaceDistributionCode).toBe("9");
    expect(c.highLowTemperatureProfile.geography.modifier).toBeCloseTo(0.1, 6);
  });

  it("prefers provided surface distribution code over rolling", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 30,
        orbitalPeriodYears: 1,
        solarDayHours: 24,
        surfaceDistributionCode: "1",
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      rng: rngFor2dSequence(8, 7, 11),
    });
    const c = result.candidates[0];

    expect(c.surfaceDistributionRoll).toBeNull();
    expect(c.surfaceDistributionCode).toBe("1");
    expect(c.highLowTemperatureProfile.geography.modifier).toBeCloseTo(-0.1, 6);
  });

  it("wires mean-temperature model outputs onto each physical candidate", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 30,
        orbitalPeriodYears: 1,
        solarDayHours: 24,
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: true, rng: rngFor2dSequence(8, 7) });
    const c = result.candidates[0];

    expect(c.basicMeanTemperatureRoll).toBeTruthy();
    expect(c.basicMeanTemperature).toBeTruthy();
    expect(c.albedoModel).toBeTruthy();
    expect(c.greenhouseModel).toBeTruthy();
    expect(c.meanTemperature).toBeTruthy();
    expect(c.meanTemperatureModel).toBeTruthy();
    expect(Number.isFinite(c.meanTemperatureK)).toBe(true);
    expect(c.meanTemperatureK).toBeCloseTo(c.meanTemperature.kelvin, 6);
    expect(c.meanTemperatureModel.distanceAu).toBe(3.1);
    expect(c.meanTemperatureModel.luminosity).toBeCloseTo(10.89, 6);
    expect(c.highLowTemperatureProfile).toBeTruthy();
    expect(c.highLowTemperatureProfile.luminosityModifier).toBeGreaterThan(0);
    expect(c.highLowTemperatureProfile.temperatureProfile.nearAu).toBeCloseTo(2.79, 2);
    expect(c.highLowTemperatureProfile.temperatureProfile.farAu).toBeCloseTo(3.41, 2);
    expect(c.highLowTemperatureProfile.temperatureProfile.high.kelvin).toBeGreaterThan(c.meanTemperatureK);
    expect(c.highLowTemperatureProfile.temperatureProfile.low.kelvin).toBeLessThan(c.meanTemperatureK);
    expect(c.temperatureScenarioPresets).toBeTruthy();
    expect(c.temperatureScenarioPresets.seaLevel).toBeTruthy();
    expect(c.temperatureScenarioPresets.highAltitude).toBeTruthy();
    expect(c.temperatureScenarioPresets.seasonalPeak).toBeTruthy();
    expect(c.normalizedTemperatureScenarios).toBeTruthy();
    expect(c.normalizedTemperatureScenarios.seaLevel).toBeTruthy();
    expect(c.normalizedTemperatureScenarios.highAltitude).toBeTruthy();
    expect(c.normalizedTemperatureScenarios.seasonalPeak).toBeTruthy();
    expect(c.temperatureScenarioSummary).toBeTruthy();
    expect(Array.isArray(c.temperatureScenarioSummary.presets)).toBe(true);
    expect(c.temperatureScenarioSummary.presets.length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom slot multi-star and inherent scenario inputs", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 30,
        orbitalPeriodYears: 1,
        solarDayHours: 24,
        temperatureScenarioStars: [
          { name: "Aa", luminosity: 0.738, au: 0, eccentricity: 0 },
          { name: "Ab", luminosity: 0.681, au: 0.036, eccentricity: 0.11 },
        ],
        inherentTemperatureAddedK: 35,
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      rng: rngFor2dSequence(8, 7),
    });
    const c = result.candidates[0];

    expect(c.normalizedTemperatureScenarios.seaLevel.components.multiStar).toBeTruthy();
    expect(c.normalizedTemperatureScenarios.seaLevel.components.inherent).toBeTruthy();
    expect(c.temperatureScenarioSummary.warmestPresetKey).toBeTruthy();
  });

  it("auto-derives seasonal sunlight in candidate normalized scenarios from date inputs", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 73.65,
        orbitalPeriodYears: 26 / 365.25,
        solarDayHours: 85.77,
        surfaceDistributionCode: "5",
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      temperatureScenarioDateSolarDays: 91,
      temperatureScenarioSolarDaysPerYear: 365,
      rng: rngFor2dSequence(8, 7),
    });
    const c = result.candidates[0];
    const timeOfDay = c.normalizedTemperatureScenarios.seaLevel.components.timeOfDay;

    expect(timeOfDay).toBeTruthy();
    expect(timeOfDay.sunlightModel).toBeTruthy();
    expect(timeOfDay.sunlightModel.daylightState).toBe("normal");
    expect(timeOfDay.sunlightPortion).toBeGreaterThan(0);
    expect(timeOfDay.sunlightPortion).toBeLessThan(1);
    expect(timeOfDay.sunlightModel.sunlightHours).toBeGreaterThan(0);
    expect(timeOfDay.sunlightModel.sunlightHours).toBeLessThan(slots[0].solarDayHours);
  });

  it("automatically applies parent gas giant residual moon heating into scenario inherent effects", () => {
    const moon = {
      sizeCode: "5",
      sizeValue: 5,
      isRing: false,
      inherentTemperatureAddedK: 10,
    };
    const slots = [
      {
        slotId: "P-2",
        orbit: 3.5,
        primaryWorldType: "gasGiant",
        sizeCode: "GML",
        gasGiantMassEarth: 1200,
        gasGiantDiameterTerran: 11.6,
        basicDiameterKm: 11.6 * 12800,
        significantMoonSizeDetails: [moon],
        significantMoonOrbitDetails: [
          {
            sourceMoon: moon,
            orbitPd: 26.4,
            period: {
              orbitKm: 3_920_000,
            },
          },
        ],
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: false,
      temperatureScenarioGasGiantResidualAgeGyr: 6.336,
    });
    const c = result.candidates[0];

    expect(c.isMoon).toBe(true);
    expect(c.gasGiantResidualHeatScenario).toBeTruthy();
    expect(c.gasGiantResidualHeatScenario.residualHeatTemperatureK).toBeCloseTo(187, 0);
    expect(c.gasGiantResidualHeatScenario.moonHeatingTemperatureK).toBeGreaterThan(20);
    expect(c.gasGiantResidualHeatScenario.moonHeatingTemperatureK).toBeLessThan(30);
    expect(c.temperatureScenarioInherentAddedK).toBeGreaterThan(c.gasGiantResidualHeatScenario.moonHeatingTemperatureK);
    expect(c.normalizedTemperatureScenarios.seaLevel.components.inherent).toBeTruthy();
  });

  it("can disable optional scenario presets in candidate payload", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        eccentricity: 0.1,
        axialTiltDegrees: 30,
        orbitalPeriodYears: 1,
        solarDayHours: 24,
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      includeTemperatureScenarioPresets: false,
      rng: rngFor2dSequence(8, 7),
    });
    const c = result.candidates[0];

    expect(c.highLowTemperatureProfile).toBeTruthy();
    expect(c.temperatureScenarioPresets).toBeNull();
    expect(c.normalizedTemperatureScenarios).toBeNull();
    expect(c.temperatureScenarioSummary).toBeNull();
  });

  it("applies atmosphere temperature DM to get modified roll and region", () => {
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

    // raw roll from deviation -0.2 is 9; atmo roll 12 gives atmo 10 (A), DM +2 => modified 11 (Hot)
    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      rng: rngFor2dSequence(12, 7),
    });

    const c = result.candidates[0];
    expect(c.temperatureRawRoll).toBe(9);
    expect(c.atmosphereCode).toBe(10);
    expect(c.temperatureAtmosphereDm).toBe(2);
    expect(c.temperatureModifiedRoll).toBe(11);
    expect(c.temperatureRegionType).toBe("Hot");
  });

  it("applies optional runaway greenhouse and updates atmosphere/hydro", () => {
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

    const rng = seqRng(
      (6 - 1) / 6,
      (5 - 1) / 6, // atmo 2D=11 -> atmo 9
      (6 - 1) / 6,
      (6 - 1) / 6, // greenhouse 2D=12 -> occurred
      (1 - 1) / 6, // conversion 1D=1 -> A after DMs
      (4 - 1) / 6,
      (3 - 1) / 6, // hydro 2D=7
    );

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      applyRunawayGreenhouse: true,
      rng,
    });

    const c = result.candidates[0];
    expect(c.temperatureModifiedRoll).toBe(10);
    expect(c.runawayGreenhouse).toBeTruthy();
    expect(c.runawayGreenhouse.occurred).toBe(true);
    expect(c.runawayGreenhouse.atmosphereChanged).toBe(true);
    expect(c.atmosphereCode).toBe(10);
    expect(c.hydrographicsCode).toBe(0);
  });

  it("can include detailed habitable-zone atmosphere profile output", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.1,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "5",
        sizeValue: 5,
        gravity: 0.66,
        secondaryWorldTypes: [],
      },
    ];

    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      includeHabitableZoneAtmosphereDetails: true,
      habitableZoneAtmosphereSystemAgeByr: 5,
      rng: seqRng(
        (5 - 1) / 6,
        (3 - 1) / 6, // atmo 2D=8 -> atmo 6
        (4 - 1) / 6,
        (3 - 1) / 6, // hydro 2D=7
        0.5, // pressure
        (5 - 1) / 6,
        (2 - 1) / 6,
        (3 - 1) / 6,
        (4 - 1) / 6, // oxygen
      ),
    });

    const c = result.candidates[0];
    expect(c.habitableZoneAtmosphere).toBeTruthy();
    expect(c.habitableZoneAtmosphere.pressure.pressureBar).toBeCloseTo(1.095, 3);
    expect(c.habitableZoneAtmosphere.oxygenPartialPressureBar).toBeGreaterThan(0);
    expect(c.habitableZoneAtmosphere.profile).toMatch(/^6-/);
    const expectedScaleHeight = (8.5 * (Number(c.meanTemperatureK) / 288)) / 0.66;
    expect(c.habitableZoneAtmosphere.scaleHeightKm).toBeCloseTo(expectedScaleHeight, 3);
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

// ── Taint Subtypes, Severity, and Persistence (Tables 32–34) ─────────────────

describe("rollTaintSubtype", () => {
  it("returns the correct code for a standard roll on atmo 7 (no DM)", () => {
    // 2D=8 → total 8 → Sulphur Compounds (S)
    const rng = rngFor2d(8);
    const result = rollTaintSubtype({ atmosphereCode: 7, rng });
    expect(result.dm).toBe(0);
    expect(result.subtypes).toHaveLength(1);
    expect(result.subtypes[0].code).toBe("S");
    expect(result.subtypes[0].label).toBe("Sulphur Compounds");
    expect(result.subtypes[0].position).toBe(1);
    expect(result.subtypes[0].wasPreexisting).toBe(false);
    expect(result.subtypes[0].ppoAdjustment).toBeNull();
    expect(result.subtypes[0].wasOxygenSubstituted).toBe(false);
  });

  it("applies DM-2 for atmosphere 4 (low roll → Low Oxygen)", () => {
    // 2D=4, DM-2 → total 2 → Low Oxygen (L); inside 4-9 range so no G substitution
    const rng = rngFor2d(4);
    const result = rollTaintSubtype({ atmosphereCode: 4, rng });
    expect(result.dm).toBe(-2);
    expect(result.subtypes[0].code).toBe("L");
    // ppoAdjustment roll included (-1D/100)
    expect(result.subtypes[0].ppoAdjustment).not.toBeNull();
    expect(result.subtypes[0].ppoAdjustment.delta).toBeLessThan(0);
  });

  it("applies DM+2 for atmosphere 9 (high roll → High Oxygen)", () => {
    // 2D=11, DM+2 → total 13 → High Oxygen (H)
    const rng = rngFor2d(11);
    const result = rollTaintSubtype({ atmosphereCode: 9, rng });
    expect(result.dm).toBe(2);
    expect(result.subtypes[0].code).toBe("H");
    expect(result.subtypes[0].ppoAdjustment).not.toBeNull();
    expect(result.subtypes[0].ppoAdjustment.delta).toBeGreaterThan(0);
  });

  it("substitutes L/H → G for atmosphere 2 (outside 4-9 range)", () => {
    // 2D=2 → total 2 → raw L; but code 2 is outside 4-9, so G
    const rng = rngFor2d(2);
    const result = rollTaintSubtype({ atmosphereCode: 2, rng });
    expect(result.subtypes[0].code).toBe("G");
    expect(result.subtypes[0].wasOxygenSubstituted).toBe(true);
    expect(result.subtypes[0].ppoAdjustment).toBeNull(); // no ppo adjustment after substitution
  });

  it("substitutes S → P for cold worlds (meanTemperatureK < 273)", () => {
    // 2D=8 → total 8 → raw S; cold → P
    const rng = rngFor2d(8);
    const result = rollTaintSubtype({ atmosphereCode: 7, meanTemperatureK: 240, rng });
    expect(result.subtypes[0].code).toBe("P");
    expect(result.subtypes[0].wasSulphurSubstituted).toBe(true);
  });

  it("cascades to a second subtype when first roll is 10 (P + another roll)", () => {
    // Roll 1: 2D=10 → P*; Roll 2: 2D=9 → Biologic (B). Both at atmo 7, no DM.
    const rng = rngFor2dSequence(10, 9);
    const result = rollTaintSubtype({ atmosphereCode: 7, rng });
    expect(result.subtypes).toHaveLength(2);
    expect(result.subtypes[0].code).toBe("P");
    expect(result.subtypes[0].position).toBe(1);
    expect(result.subtypes[1].code).toBe("B");
    expect(result.subtypes[1].position).toBe(2);
    expect(result.rolls).toHaveLength(2);
  });

  it("cascades to three subtypes when first two rolls are both 10 (P, P, final)", () => {
    // Roll 1: 10 → P; Roll 2: 10 → P; Roll 3: 3 → R
    const rng = rngFor2dSequence(10, 10, 3);
    const result = rollTaintSubtype({ atmosphereCode: 7, rng });
    expect(result.subtypes).toHaveLength(3);
    expect(result.subtypes[0].code).toBe("P");
    expect(result.subtypes[1].code).toBe("P");
    expect(result.subtypes[2].code).toBe("R");
    expect(result.subtypes[2].position).toBe(3);
  });

  it("pre-known oxygen taint: sets L as position 1, only checks for 10 cascade", () => {
    // atmo 7, known low-oxygen taint, check roll = 5 (not 10) → just 1 taint
    const rng = rngFor2d(5);
    const result = rollTaintSubtype({ atmosphereCode: 7, knownOxygenTrait: "low-oxygen", rng });
    expect(result.subtypes).toHaveLength(1);
    expect(result.subtypes[0].code).toBe("L");
    expect(result.subtypes[0].wasPreexisting).toBe(true);
    expect(result.subtypes[0].ppoAdjustment).toBeNull(); // no adjustment for pre-known
    expect(result.rolls).toHaveLength(1); // the check roll
    expect(result.rolls[0].purpose).toBe("check-for-particulates");
  });

  it("pre-known oxygen taint: adds P when check roll is 10, then stops on non-10", () => {
    // atmo 7, known H; check Roll 1 = 10 → add P; Roll 2 = 6 → stop (2 taints)
    const rng = rngFor2dSequence(10, 6);
    const result = rollTaintSubtype({ atmosphereCode: 7, knownOxygenTrait: "high-oxygen", rng });
    expect(result.subtypes).toHaveLength(2);
    expect(result.subtypes[0].code).toBe("H");
    expect(result.subtypes[1].code).toBe("P");
    expect(result.subtypes[1].position).toBe(2);
  });

  it("pre-known oxygen taint: rolls a third subtype when both check rolls are 10", () => {
    // atmo 7, known L; Roll1=10 → P; Roll2=10 → final Roll3=4 → B
    const rng = rngFor2dSequence(10, 10, 4);
    const result = rollTaintSubtype({ atmosphereCode: 7, knownOxygenTrait: "low-oxygen", rng });
    expect(result.subtypes).toHaveLength(3);
    expect(result.subtypes[0].code).toBe("L");
    expect(result.subtypes[1].code).toBe("P");
    expect(result.subtypes[2].code).toBe("B");
  });

  it("substitutes L/H → G on second and third taint positions even inside 4-9 range", () => {
    // atmo 7, first roll 10 → P; second roll 2 → raw L at position 2 → must become G
    const rng = rngFor2dSequence(10, 2);
    const result = rollTaintSubtype({ atmosphereCode: 7, rng });
    expect(result.subtypes[1].code).toBe("G");
    expect(result.subtypes[1].wasOxygenSubstituted).toBe(true);
  });
});

describe("rollTaintSeverity", () => {
  it("returns expected code and severity for a neutral taint (no DM)", () => {
    // 2D=7 + DM0 → code 4, Major irritant
    const rng = rngFor2d(7);
    const result = rollTaintSeverity({ taintSubtypeCode: "G", rng });
    expect(result.dm).toBe(0);
    expect(result.roll).toBe(7);
    expect(result.total).toBe(7);
    expect(result.code).toBe(4);
    expect(result.severity).toBe("Major irritant");
    expect(result.ppoMode).toBe(false);
  });

  it("applies DM+4 for Low Oxygen taint", () => {
    // 2D=5, DM+4 → total 9 → code 6, Hazardous irritant
    const rng = rngFor2d(5);
    const result = rollTaintSeverity({ taintSubtypeCode: "L", rng });
    expect(result.dm).toBe(4);
    expect(result.total).toBe(9);
    expect(result.code).toBe(6);
    expect(result.severity).toBe("Hazardous irritant");
  });

  it("applies DM+4 for High Oxygen taint", () => {
    const rng = rngFor2d(5);
    const result = rollTaintSeverity({ taintSubtypeCode: "H", rng });
    expect(result.dm).toBe(4);
    expect(result.code).toBe(6);
  });

  it("applies DM+6 for insidious atmosphere (code C)", () => {
    // 2D=6, DM+6 → total 12 → code 9, Rapidly lethal
    const rng = rngFor2d(6);
    const result = rollTaintSeverity({ taintSubtypeCode: "P", atmosphereCode: "C", rng });
    expect(result.dm).toBe(6);
    expect(result.total).toBe(12);
    expect(result.code).toBe(9);
    expect(result.severity).toBe("Rapidly lethal");
  });

  it("uses ppo-mode for Low Oxygen when ppo >= 0.09 → code 2", () => {
    const result = rollTaintSeverity({
      taintSubtypeCode: "L",
      oxygenPartialPressureBar: 0.09,
      useOptionalPpoSeverity: true,
    });
    expect(result.ppoMode).toBe(true);
    expect(result.roll).toBeNull();
    expect(result.code).toBe(2);
    expect(result.severity).toBe("Surmountable irritant");
  });

  it("uses ppo-mode for Low Oxygen when ppo < 0.06 → code 9", () => {
    const result = rollTaintSeverity({
      taintSubtypeCode: "L",
      oxygenPartialPressureBar: 0.05,
      useOptionalPpoSeverity: true,
    });
    expect(result.code).toBe(9);
  });

  it("uses ppo-mode for High Oxygen when ppo < 0.6 → code 2", () => {
    const result = rollTaintSeverity({
      taintSubtypeCode: "H",
      oxygenPartialPressureBar: 0.55,
      useOptionalPpoSeverity: true,
    });
    expect(result.ppoMode).toBe(true);
    expect(result.code).toBe(2);
  });

  it("uses ppo-mode for High Oxygen when ppo >= 0.8 → code 9", () => {
    const result = rollTaintSeverity({
      taintSubtypeCode: "H",
      oxygenPartialPressureBar: 0.85,
      useOptionalPpoSeverity: true,
    });
    expect(result.code).toBe(9);
  });

  it("falls back to roll when useOptionalPpoSeverity is false even for L/H", () => {
    const rng = rngFor2d(6);
    const result = rollTaintSeverity({
      taintSubtypeCode: "L",
      oxygenPartialPressureBar: 0.05,
      useOptionalPpoSeverity: false,
      rng,
    });
    expect(result.ppoMode).toBe(false);
    expect(result.roll).toBe(6);
    // 6 + 4 = 10 → code 7 (Long term lethal)
    expect(result.code).toBe(7);
  });
});

describe("rollTaintPersistence", () => {
  it("returns expected code and persistence for neutral taint", () => {
    // 2D=7, DM0 → code 7, Varying
    const rng = rngFor2d(7);
    const result = rollTaintPersistence({ taintSubtypeCode: "G", rng });
    expect(result.dm).toBe(0);
    expect(result.roll).toBe(7);
    expect(result.code).toBe(7);
    expect(result.persistence).toBe("Varying");
  });

  it("applies DM+4 for Low Oxygen taint (severity 5, < 8)", () => {
    // 2D=5, DM+4 → total 9 → code 9, Constant
    const rng = rngFor2d(5);
    const result = rollTaintPersistence({ taintSubtypeCode: "L", severityCode: 5, rng });
    expect(result.dm).toBe(4);
    expect(result.total).toBe(9);
    expect(result.code).toBe(9);
    expect(result.persistence).toBe("Constant");
  });

  it("applies DM+6 for L/H taint when severityCode >= 8", () => {
    // 2D=3, DM+6 → total 9 → code 9, Constant
    const rng = rngFor2d(3);
    const result = rollTaintPersistence({ taintSubtypeCode: "H", severityCode: 8, rng });
    expect(result.dm).toBe(6);
    expect(result.total).toBe(9);
    expect(result.code).toBe(9);
  });

  it("applies DM+6 for insidious atmosphere (code C)", () => {
    // 2D=2, DM+6 → total 8 → code 8, Varying
    const rng = rngFor2d(2);
    const result = rollTaintPersistence({ taintSubtypeCode: "P", atmosphereCode: "C", rng });
    expect(result.dm).toBe(6);
    expect(result.code).toBe(8);
  });

  it("returns Occasional and brief for low total (2- bracket)", () => {
    // 2D=2, DM0 → 2 → code 2
    const rng = rngFor2d(2);
    const result = rollTaintPersistence({ taintSubtypeCode: "R", rng });
    expect(result.code).toBe(2);
    expect(result.persistence).toBe("Occasional and brief");
  });
});

describe("rollWorldTaints", () => {
  it("returns a single taint with no severity/persistence when flags are off", () => {
    // atmo 7, first roll = 5 → Gas Mix (G)
    const rng = rngFor2d(5);
    const result = rollWorldTaints({ atmosphereCode: 7, rng });
    expect(result.taints).toHaveLength(1);
    const taint = result.taints[0];
    expect(taint.code).toBe("G");
    expect(taint.severity).toBeNull();
    expect(taint.persistence).toBeNull();
  });

  it("rolls severity when rollSeverity is true", () => {
    // Subtype roll: 2D=6 → P (atmo 7 no DM); severity roll: 2D=7 → Major irritant
    const rng = rngFor2dSequence(6, 7);
    const result = rollWorldTaints({ atmosphereCode: 7, rollSeverity: true, rng });
    expect(result.taints[0].code).toBe("P");
    expect(result.taints[0].severity).not.toBeNull();
    expect(result.taints[0].severity.code).toBe(4); // 7+0 DM → code 4
    expect(result.taints[0].persistence).toBeNull(); // not rolled when rollPersistence=false
  });

  it("rolls severity and persistence when both flags are true", () => {
    // Subtype roll: 2D=4 → B; severity: 2D=7 → major; persistence: 2D=5 → Fluctuating
    const rng = rngFor2dSequence(4, 7, 5);
    const result = rollWorldTaints({ atmosphereCode: 7, rollSeverity: true, rollPersistence: true, rng });
    expect(result.taints[0].code).toBe("B");
    expect(result.taints[0].severity.code).toBe(4);
    expect(result.taints[0].persistence).not.toBeNull();
    expect(result.taints[0].persistence.code).toBe(5);
  });

  it("accumulates ppoAdjustment for a fresh High Oxygen subtype", () => {
    // atmo 9 (DM+2): 2D=10 → total 12+ → H; ppo adjustment roll also needed
    // rngFor2dSequence needs to handle the 1D for ppo adjustment too
    // Use seqRng to control exact values: die1+die2 for 2D, then die for 1D
    // 2D=11+DM2=13→H; 1D ppo roll: use fixedRng to produce 1D=3 → +3/10 = +0.3
    const seq = seqRng(5 / 6, 5 / 6, 2 / 6); // die1=6, die2=6 →2D=12; then 1D: floor(2/6*6)+1=3
    const result = rollWorldTaints({ atmosphereCode: 9, oxygenPartialPressureBar: 0.3, rng: seq });
    expect(result.taints[0].code).toBe("H");
    expect(result.adjustedOxygenPartialPressureBar).not.toBeNull();
    expect(result.adjustedOxygenPartialPressureBar).toBeGreaterThan(0.3);
  });

  it("adjustedOxygenPartialPressureBar is null when no oxygen taint occurs", () => {
    // 2D=5 → G; no ppo adjustment
    const rng = rngFor2d(5);
    const result = rollWorldTaints({ atmosphereCode: 7, oxygenPartialPressureBar: 0.21, rng });
    expect(result.adjustedOxygenPartialPressureBar).toBeNull();
  });

  it("integrates with identifyMainworldCandidates when includeTaintDetails is true", () => {
    const slots = [
      {
        slotId: "P-1",
        orbit: 3.3,
        primaryWorldType: "terrestrialPlanet",
        sizeCode: "7",
        sizeValue: 7,
        secondaryWorldTypes: [],
      },
    ];
    // Force atmo code 4 (tainted): 2D−7+7 = roll of 4 → 4-7+7=4. Use rngFor2d(4)
    // Then hydro roll, then taint subtype roll
    // atmo roll: 2D=4 → 4-7+7=4 (tainted). hydro roll: 2D=7 → hyd=7-7+4=4.
    // taint roll: any roll, but we just verify worldTaints is not null
    const atmoRng = rngFor2dSequence(4, 7, 5);
    const result = identifyMainworldCandidates({
      slots,
      hzco: 3.3,
      rollPhysical: true,
      includeTaintDetails: true,
      rng: atmoRng,
    });
    const c = result.candidates[0];
    // worldTaints should be non-null only if atmosphereCode is in {2,4,7,9}
    if (c.atmosphereCode === 2 || c.atmosphereCode === 4 || c.atmosphereCode === 7 || c.atmosphereCode === 9) {
      expect(c.worldTaints).not.toBeNull();
      expect(c.worldTaints.subtypeResult).toBeDefined();
      expect(c.worldTaints.taints).toBeInstanceOf(Array);
    } else {
      expect(c.worldTaints).toBeNull();
    }
  });
});

// ── Subtypes: Exotic (A) — Table 35 & Retention ─────────────────────────────

describe("ATMOSPHERIC_GAS_TABLE_35", () => {
  it("has 24 entries covering all listed gases", () => {
    expect(ATMOSPHERIC_GAS_TABLE_35).toHaveLength(24);
  });

  it("first entry is Hydrogen Ion (H-) with relativeAbundance null", () => {
    const hIon = ATMOSPHERIC_GAS_TABLE_35[0];
    expect(hIon.code).toBe("H-");
    expect(hIon.relativeAbundance).toBeNull();
    expect(hIon.escapeValue).toBe(24.0);
  });

  it("all non-H- entries have numeric relativeAbundance > 0", () => {
    const others = ATMOSPHERIC_GAS_TABLE_35.filter((g) => g.code !== "H-");
    others.forEach((g) => {
      expect(typeof g.relativeAbundance).toBe("number");
      expect(g.relativeAbundance).toBeGreaterThan(0);
    });
  });

  it("escape values decrease monotonically (heavier gases have lower escape values)", () => {
    for (let i = 1; i < ATMOSPHERIC_GAS_TABLE_35.length; i++) {
      expect(ATMOSPHERIC_GAS_TABLE_35[i].escapeValue).toBeLessThanOrEqual(ATMOSPHERIC_GAS_TABLE_35[i - 1].escapeValue);
    }
  });

  it("last entry is Sulphuric Acid (H2SO4) with the lowest escape value (0.24)", () => {
    const last = ATMOSPHERIC_GAS_TABLE_35[ATMOSPHERIC_GAS_TABLE_35.length - 1];
    expect(last.code).toBe("H2SO4");
    expect(last.escapeValue).toBe(0.24);
  });
});

describe("getGasState", () => {
  it("returns 'gas' when temperature exceeds boiling point", () => {
    const h2o = ATMOSPHERIC_GAS_TABLE_35.find((g) => g.code === "H2O");
    expect(getGasState(h2o, 400)).toBe("gas"); // 400K > boil 373K
  });

  it("returns 'liquid' when temperature is between melting and boiling point", () => {
    const h2o = ATMOSPHERIC_GAS_TABLE_35.find((g) => g.code === "H2O");
    expect(getGasState(h2o, 300)).toBe("liquid"); // 273K < 300K < 373K
  });

  it("returns 'solid' when temperature is at or below melting point", () => {
    const h2o = ATMOSPHERIC_GAS_TABLE_35.find((g) => g.code === "H2O");
    expect(getGasState(h2o, 200)).toBe("solid"); // 200K < melt 273K
  });

  it("returns 'gas' for nitrogen at room temperature (boil 77K)", () => {
    const n2 = ATMOSPHERIC_GAS_TABLE_35.find((g) => g.code === "N2");
    expect(getGasState(n2, 290)).toBe("gas"); // 290K >> 77K
  });

  it("returns 'liquid' for ammonia at 220K (boil 240K, melt 195K)", () => {
    const nh3 = ATMOSPHERIC_GAS_TABLE_35.find((g) => g.code === "NH3");
    expect(getGasState(nh3, 220)).toBe("liquid"); // 195K < 220K < 240K
  });
});

describe("checkGasRetention", () => {
  it("Earth retains CO2 (escape 0.55, limit ~3.45)", () => {
    expect(checkGasRetention({ massEarth: 1, diameterEarth: 1, temperatureK: 290, gasEscapeValue: 0.55 })).toBe(true);
  });

  it("Earth retains O2 (escape 0.75)", () => {
    expect(checkGasRetention({ massEarth: 1, diameterEarth: 1, temperatureK: 290, gasEscapeValue: 0.75 })).toBe(true);
  });

  it("Earth retains N2 (escape 0.86)", () => {
    expect(checkGasRetention({ massEarth: 1, diameterEarth: 1, temperatureK: 290, gasEscapeValue: 0.86 })).toBe(true);
  });

  it("Earth cannot retain H2 (escape 12.00)", () => {
    expect(checkGasRetention({ massEarth: 1, diameterEarth: 1, temperatureK: 290, gasEscapeValue: 12.0 })).toBe(false);
  });

  it("Earth cannot retain He (escape 6.00)", () => {
    expect(checkGasRetention({ massEarth: 1, diameterEarth: 1, temperatureK: 290, gasEscapeValue: 6.0 })).toBe(false);
  });

  it("desert moon (M=0.045, D=0.41, T=240) cannot retain O2 — limit ~0.457", () => {
    // 1000 * 0.045 / (0.41 * 240) ≈ 0.457. O2.escape=0.75 > 0.457 → false
    expect(checkGasRetention({ massEarth: 0.045, diameterEarth: 0.41, temperatureK: 240, gasEscapeValue: 0.75 })).toBe(
      false,
    );
  });

  it("desert moon cannot retain N2 (escape 0.86 > 0.457)", () => {
    expect(checkGasRetention({ massEarth: 0.045, diameterEarth: 0.41, temperatureK: 240, gasEscapeValue: 0.86 })).toBe(
      false,
    );
  });

  it("desert moon can retain SO2 (escape 0.38 < 0.457)", () => {
    expect(checkGasRetention({ massEarth: 0.045, diameterEarth: 0.41, temperatureK: 240, gasEscapeValue: 0.38 })).toBe(
      true,
    );
  });

  it("super-earth (M=1.86, D=1.255, T=290) retains CH4 but not He", () => {
    // limit = 1000*1.86/(1.255*290) ≈ 5.11
    expect(checkGasRetention({ massEarth: 1.86, diameterEarth: 1.255, temperatureK: 290, gasEscapeValue: 1.5 })).toBe(
      true,
    ); // CH4
    expect(checkGasRetention({ massEarth: 1.86, diameterEarth: 1.255, temperatureK: 290, gasEscapeValue: 6.0 })).toBe(
      false,
    ); // He
  });
});

describe("getRetainableGases", () => {
  it("returns gaseous N2 and CO2 for an Earth-like world at 290K", () => {
    const gases = getRetainableGases({ massEarth: 1, diameterEarth: 1, temperatureK: 290 });
    const codes = gases.map((g) => g.code);
    expect(codes).toContain("N2");
    expect(codes).toContain("CO2");
  });

  it("does not return H2 or He for Earth (both escape values too high)", () => {
    const gases = getRetainableGases({ massEarth: 1, diameterEarth: 1, temperatureK: 290 });
    const codes = gases.map((g) => g.code);
    expect(codes).not.toContain("H2");
    expect(codes).not.toContain("He");
  });

  it("does not return H2O for Earth at 290K (liquid at that temperature)", () => {
    const gases = getRetainableGases({ massEarth: 1, diameterEarth: 1, temperatureK: 290 });
    const codes = gases.map((g) => g.code);
    expect(codes).not.toContain("H2O");
  });

  it("does not include the H- sentinel entry in any results", () => {
    const gases = getRetainableGases({ massEarth: 5, diameterEarth: 2, temperatureK: 500 });
    expect(gases.map((g) => g.code)).not.toContain("H-");
  });

  it("desert moon (M=0.045, D=0.41, T=240) retains only Cl2 and Kr", () => {
    // limit ≈ 0.457; only Cl2 (escape 0.34) and Kr (escape 0.29) pass AND are gaseous at 240K
    const gases = getRetainableGases({ massEarth: 0.045, diameterEarth: 0.41, temperatureK: 240 });
    expect(gases.map((g) => g.code).sort()).toEqual(["Cl2", "Kr"]);
  });

  it("returns empty array when world retains nothing (very low mass)", () => {
    // M=0.001, D=0.1, T=1000 → limit=0.01; no gas has escapeValue < 0.01
    const gases = getRetainableGases({ massEarth: 0.001, diameterEarth: 0.1, temperatureK: 1000 });
    expect(gases).toHaveLength(0);
  });
});

describe("selectExoticAtmosphereGases", () => {
  it("returns 3 unique gases (default count) for a gas-rich world", () => {
    // Earth-like: 13+ retainable gaseous candidates
    const gases = selectExoticAtmosphereGases({
      massEarth: 1,
      diameterEarth: 1,
      temperatureK: 290,
      rng: seqRng(0),
    });
    expect(gases).toHaveLength(3);
    const codes = gases.map((g) => g.code);
    expect(new Set(codes).size).toBe(3); // no duplicates
  });

  it("all returned gases are entries from ATMOSPHERIC_GAS_TABLE_35", () => {
    const gases = selectExoticAtmosphereGases({
      massEarth: 1,
      diameterEarth: 1,
      temperatureK: 290,
      rng: seqRng(0.5),
    });
    gases.forEach((g) => {
      expect(ATMOSPHERIC_GAS_TABLE_35).toContain(g);
    });
  });

  it("respects a custom count parameter", () => {
    const gases = selectExoticAtmosphereGases({
      massEarth: 1,
      diameterEarth: 1,
      temperatureK: 290,
      count: 5,
      rng: seqRng(0),
    });
    expect(gases).toHaveLength(5);
    expect(new Set(gases.map((g) => g.code)).size).toBe(5);
  });

  it("returns only pool-size gases when count exceeds the available pool", () => {
    // Desert moon has only 2 retainable gaseous gases (Cl2, Kr)
    const gases = selectExoticAtmosphereGases({
      massEarth: 0.045,
      diameterEarth: 0.41,
      temperatureK: 240,
      count: 5,
      rng: seqRng(0),
    });
    expect(gases).toHaveLength(2);
  });

  it("returns empty array when the world retains no gaseous gases", () => {
    const gases = selectExoticAtmosphereGases({ massEarth: 0.001, diameterEarth: 0.1, temperatureK: 1000 });
    expect(gases).toHaveLength(0);
  });

  it("picks CH4, NH3, Ne in order with rng always 0 (first-gas bias)", () => {
    // seqRng(0) always returns 0 → always picks the first remaining gas
    // Retainable gaseous pool at T=290 ordered: CH4(113K boil), NH3(240K), Ne(27K), N2...
    // But pool preserves ATMOSPHERIC_GAS_TABLE_35 order, so first 3 should be CH4, NH3, Ne
    const gases = selectExoticAtmosphereGases({
      massEarth: 1,
      diameterEarth: 1,
      temperatureK: 290,
      count: 3,
      rng: seqRng(0),
    });
    expect(gases[0].code).toBe("CH4");
    expect(gases[1].code).toBe("NH3");
    expect(gases[2].code).toBe("Ne");
  });
});

describe("rollExoticCorrosiveIrritant", () => {
  it("always returns subtypeCode G and label Gas Mix", () => {
    const result = rollExoticCorrosiveIrritant({ rng: seqRng(0) });
    expect(result.subtypeCode).toBe("G");
    expect(result.label).toBe("Gas Mix");
  });

  it("has fixed DMs: severityDm=9, persistenceDm=1", () => {
    const result = rollExoticCorrosiveIrritant({ rng: seqRng(0) });
    expect(result.severityDm).toBe(9);
    expect(result.persistenceDm).toBe(1);
  });

  it("minimum roll (1D=1): severity total=10 → code 7 Long term lethal", () => {
    // rng()=0/6=0 → floor(0*6)+1=1. Severity: 1+9=10 → code 7. Persistence: 1+1=2 → code 2.
    const result = rollExoticCorrosiveIrritant({ rng: seqRng(0) });
    expect(result.severityRoll).toBe(1);
    expect(result.severityTotal).toBe(10);
    expect(result.severity.code).toBe(7);
    expect(result.severity.severity).toBe("Long term lethal");
    expect(result.persistenceRoll).toBe(1);
    expect(result.persistenceTotal).toBe(2);
    expect(result.persistence.code).toBe(2);
    expect(result.persistence.persistence).toBe("Occasional and brief");
  });

  it("maximum roll (1D=6): severity total=15 → code 9 Rapidly lethal", () => {
    // rng()=5/6 → floor(5/6*6)+1=6. Severity: 6+9=15 → code 9. Persistence: 6+1=7 → code 7.
    const result = rollExoticCorrosiveIrritant({ rng: seqRng(5 / 6) });
    expect(result.severityRoll).toBe(6);
    expect(result.severityTotal).toBe(15);
    expect(result.severity.code).toBe(9);
    expect(result.severity.severity).toBe("Rapidly lethal");
    expect(result.persistenceRoll).toBe(6);
    expect(result.persistenceTotal).toBe(7);
    expect(result.persistence.code).toBe(7);
    expect(result.persistence.persistence).toBe("Varying");
  });

  it("mid roll (1D=3): severity total=12 → code 9; persistence total=4 → code 4 Irregular", () => {
    // rng()=2/6 → floor(2/6*6)+1=3. Severity: 3+9=12 → Infinity bracket → code 9.
    // Persistence: 3+1=4 → code 4 Irregular.
    const result = rollExoticCorrosiveIrritant({ rng: seqRng(2 / 6) });
    expect(result.severityRoll).toBe(3);
    expect(result.severity.code).toBe(9);
    expect(result.persistenceRoll).toBe(3);
    expect(result.persistenceTotal).toBe(4);
    expect(result.persistence.code).toBe(4);
    expect(result.persistence.persistence).toBe("Irregular");
  });

  it("severity is always in codes 7-9 (Long term lethal to Rapidly lethal)", () => {
    for (let d = 1; d <= 6; d++) {
      const r = rollExoticCorrosiveIrritant({ rng: seqRng((d - 1) / 6) });
      expect(r.severity.code).toBeGreaterThanOrEqual(7);
      expect(r.severity.code).toBeLessThanOrEqual(9);
    }
  });

  it("persistence is always in codes 2-7", () => {
    for (let d = 1; d <= 6; d++) {
      const r = rollExoticCorrosiveIrritant({ rng: seqRng((d - 1) / 6) });
      expect(r.persistence.code).toBeGreaterThanOrEqual(2);
      expect(r.persistence.code).toBeLessThanOrEqual(7);
    }
  });
});

// ── Subtypes: Corrosive (B) and Insidious (C) — Tables 36–37 ────────────────

describe("CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36", () => {
  it("has 14 entries", () => {
    expect(CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36).toHaveLength(14);
  });

  it("first entry is code 1 (Very Thin, ≤50K) with maxTotal 1", () => {
    const e = CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36[0];
    expect(e.code).toBe("1");
    expect(e.maxTotal).toBe(1);
    expect(e.hasIrritant).toBe(false);
    expect(e.temperatureNote).toBe("≤50K");
  });

  it("last entry is code E (Extremely Dense, 500K+, Irritant) with maxTotal Infinity", () => {
    const last = CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36[CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36.length - 1];
    expect(last.code).toBe("E");
    expect(last.maxTotal).toBe(Infinity);
    expect(last.hasIrritant).toBe(true);
  });

  it("irritant entries are codes 2, 4, 7, 9, B, E", () => {
    const irritantCodes = CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36.filter((e) => e.hasIrritant).map((e) => e.code);
    expect(irritantCodes).toEqual(["2", "4", "7", "9", "B", "E"]);
  });

  it("extremely dense entries (C, D, E) all have pressureRangeBar starting at 10", () => {
    const dense = CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36.filter((e) => ["C", "D", "E"].includes(e.code));
    dense.forEach((e) => expect(e.pressureRangeBar[0]).toBe(10.0));
  });
});

describe("INSIDIOUS_HAZARD_TABLE_37", () => {
  it("has 8 entries", () => {
    expect(INSIDIOUS_HAZARD_TABLE_37).toHaveLength(8);
  });

  it("lowest bracket (≤4) is Biologic (B)", () => {
    expect(INSIDIOUS_HAZARD_TABLE_37[0].code).toBe("B");
    expect(INSIDIOUS_HAZARD_TABLE_37[0].maxTotal).toBe(4);
  });

  it("highest bracket (Infinity) is Temperature (T)", () => {
    const last = INSIDIOUS_HAZARD_TABLE_37[INSIDIOUS_HAZARD_TABLE_37.length - 1];
    expect(last.code).toBe("T");
    expect(last.maxTotal).toBe(Infinity);
  });
});

describe("rollCorrosiveInsidiousSubtype", () => {
  it("returns code 6 (Standard) for 2D=6, size=7, no other DMs", () => {
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, rng: rngFor2d(6) });
    expect(result.roll).toBe(6);
    expect(result.dm).toBe(0);
    expect(result.total).toBe(6);
    expect(result.code).toBe("6");
    expect(result.label).toBe("Standard");
    expect(result.hasIrritant).toBe(false);
    expect(result.pressureRangeBar).toEqual([0.7, 1.49]);
  });

  it("applies DM-3 for size 2", () => {
    // 2D=8, DM-3 → total 5 → Thin
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 2, rng: rngFor2d(8) });
    expect(result.dm).toBe(-3);
    expect(result.total).toBe(5);
    expect(result.code).toBe("5");
  });

  it("applies DM-3 for size 4", () => {
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 4, rng: rngFor2d(8) });
    expect(result.dm).toBe(-3);
  });

  it("applies DM+2 for size 8", () => {
    // 2D=6, DM+2 → total 8 → Dense
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 8, rng: rngFor2d(6) });
    expect(result.dm).toBe(2);
    expect(result.total).toBe(8);
    expect(result.code).toBe("8");
  });

  it("applies DM+4 when orbit < HZCO-1", () => {
    // 2D=6, DM+4 → total 10 → Very Dense (A)
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, orbit: 1.0, hzco: 3.3, rng: rngFor2d(6) });
    expect(result.dm).toBe(4);
    expect(result.total).toBe(10);
    expect(result.code).toBe("A");
  });

  it("applies DM-2 when orbit > HZCO+2", () => {
    // 2D=7, DM-2 → total 5 → Thin
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, orbit: 8.0, hzco: 3.3, rng: rngFor2d(7) });
    expect(result.dm).toBe(-2);
    expect(result.total).toBe(5);
    expect(result.code).toBe("5");
  });

  it("no orbit DM when orbit is between HZCO-1 and HZCO+2", () => {
    // orbit=3.3, hzco=3.3 → no DM
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, orbit: 3.3, hzco: 3.3, rng: rngFor2d(6) });
    expect(result.dm).toBe(0);
  });

  it("applies DM+2 when atmosphereCode is C (insidious)", () => {
    // 2D=6, DM+2 → total 8 → Dense
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, atmosphereCode: "C", rng: rngFor2d(6) });
    expect(result.dm).toBe(2);
    expect(result.code).toBe("8");
  });

  it("applies DM+4 for runaway greenhouse", () => {
    // 2D=6, DM+4 → total 10 → Very Dense (A)
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, wasRunawayGreenhouse: true, rng: rngFor2d(6) });
    expect(result.dm).toBe(4);
    expect(result.code).toBe("A");
  });

  it("stacks multiple DMs correctly (size 8 + orbit inner + insidious)", () => {
    // DM+2 (size8) + DM+4 (inner) + DM+2 (insidious) = DM+8. 2D=2, total=10 → A
    const result = rollCorrosiveInsidiousSubtype({
      sizeValue: 8,
      orbit: 0.5,
      hzco: 3.3,
      atmosphereCode: "C",
      rng: rngFor2d(2),
    });
    expect(result.dm).toBe(8);
    expect(result.total).toBe(10);
    expect(result.code).toBe("A");
  });

  it("clamps total to minimum of 1 (very negative DMs)", () => {
    // 2D=2, DM-3 (size 4) + DM-2 (outer orbit) = DM-5 → total=-3 → clamps to 1 → code 1
    const result = rollCorrosiveInsidiousSubtype({
      sizeValue: 4,
      orbit: 10.0,
      hzco: 3.3,
      rng: rngFor2d(2),
    });
    expect(result.total).toBe(1);
    expect(result.code).toBe("1");
  });

  it("hasIrritant is true for code 7 (Standard, Irritant)", () => {
    // 2D=7 + DM0 → code 7
    const result = rollCorrosiveInsidiousSubtype({ sizeValue: 7, rng: rngFor2d(7) });
    expect(result.hasIrritant).toBe(true);
    expect(result.label).toBe("Standard, Irritant");
  });

  it("code E (Very Dense Irritant, 500K+) is reachable with large DMs", () => {
    // 2D=12 + DM+8 (size8+inner+insidious) = total 20 → E
    const result = rollCorrosiveInsidiousSubtype({
      sizeValue: 8,
      orbit: 0.5,
      hzco: 3.3,
      atmosphereCode: "C",
      wasRunawayGreenhouse: true,
      rng: rngFor2d(12),
    });
    expect(result.code).toBe("E");
    expect(result.hasIrritant).toBe(true);
  });
});

describe("rollInsidiousHazard", () => {
  it("returns Biologic (B) for 2D=4, no DM", () => {
    const result = rollInsidiousHazard({ subtypeCode: "6", rng: rngFor2d(4) });
    expect(result.roll).toBe(4);
    expect(result.dm).toBe(0);
    expect(result.total).toBe(4);
    expect(result.code).toBe("B");
    expect(result.hazard).toBe("Biologic");
    expect(result.hasAutoTemperature).toBe(false);
    expect(result.additionalHazard).toBeNull();
  });

  it("returns Radioactivity (R) for 2D=5", () => {
    const result = rollInsidiousHazard({ subtypeCode: "8", rng: rngFor2d(5) });
    expect(result.code).toBe("R");
    expect(result.hazard).toBe("Radioactivity");
  });

  it("returns Gas Mix (G) for 2D=6", () => {
    const result = rollInsidiousHazard({ subtypeCode: "6", rng: rngFor2d(6) });
    expect(result.code).toBe("G");
  });

  it("returns Temperature (T) for 2D=12, no DM", () => {
    const result = rollInsidiousHazard({ subtypeCode: "9", rng: rngFor2d(12) });
    expect(result.code).toBe("T");
    expect(result.hazard).toBe("Temperature");
    expect(result.hasAutoTemperature).toBe(false);
  });

  it("applies DM+2 for extremely dense subtype C", () => {
    // 2D=6, DM+2 → total 8 → Temperature
    const result = rollInsidiousHazard({ subtypeCode: "C", rng: rngFor2d(6) });
    expect(result.dm).toBe(2);
    expect(result.total).toBe(8);
    expect(result.code).toBe("T");
    expect(result.hasAutoTemperature).toBe(false); // C subtype — auto-temp only for D/E
  });

  it("applies DM+2 for extremely dense subtype D", () => {
    const result = rollInsidiousHazard({ subtypeCode: "D", rng: rngFor2d(6) });
    expect(result.dm).toBe(2);
  });

  it("subtype D always returns code T with hasAutoTemperature true", () => {
    // 2D=5, DM+2 → total 7 → G normally, but D forces auto-T; G becomes additionalHazard
    const result = rollInsidiousHazard({ subtypeCode: "D", rng: rngFor2dSequence(5, 5) });
    expect(result.code).toBe("T");
    expect(result.hasAutoTemperature).toBe(true);
    expect(result.additionalHazard).not.toBeNull();
    expect(result.additionalHazard.code).toBe("G");
  });

  it("subtype E always returns code T with hasAutoTemperature true", () => {
    const result = rollInsidiousHazard({ subtypeCode: "E", rng: rngFor2dSequence(5, 5) });
    expect(result.code).toBe("T");
    expect(result.hasAutoTemperature).toBe(true);
    expect(result.additionalHazard).not.toBeNull();
  });

  it("re-rolls additional hazard for D/E when first rolled result is also T", () => {
    // Roll1=12 → T (entry); subtype D forces automatic T so re-roll for additional hazard.
    // Re-Roll2=5, DM+2 → total 7 → G (Gas Mix).
    const result = rollInsidiousHazard({ subtypeCode: "D", rng: rngFor2dSequence(12, 5) });
    expect(result.hasAutoTemperature).toBe(true);
    expect(result.additionalHazard.code).toBe("G");
  });

  it("subtype D/E additional hazard is never T (always re-rolled)", () => {
    // Exhaustive: 6 possible die totals for 2D (actually 2-12). Use deterministic rolls.
    // We trust the implementation re-rolls; just check many seeded results.
    for (let roll = 2; roll <= 12; roll++) {
      const result = rollInsidiousHazard({ subtypeCode: "D", rng: rngFor2dSequence(roll, 5) });
      expect(result.additionalHazard.code).not.toBe("T");
    }
  });
});

// ── Subtype: Low (E) ────────────────────────────────────────────────────────

describe("calculateLowAtmosphereBadRatio", () => {
  it("computes ratio = 0.1 / ppo (standard limit)", () => {
    const r = calculateLowAtmosphereBadRatio({ ppo: 0.05 });
    expect(r.lowBadRatio).toBeCloseTo(2.0, 5);
    expect(r.limit).toBe(0.1);
    expect(r.ppo).toBe(0.05);
  });

  it("computes ratio = 0.08 / ppo for extreme limit", () => {
    const r = calculateLowAtmosphereBadRatio({ ppo: 0.05, useExtremeLimit: true });
    expect(r.lowBadRatio).toBeCloseTo(1.6, 5);
    expect(r.limit).toBe(0.08);
  });

  it("ratio is > 1 when ppo < 0.1 (required condition)", () => {
    const r = calculateLowAtmosphereBadRatio({ ppo: 0.02 });
    expect(r.lowBadRatio).toBeGreaterThan(1);
    expect(r.lowBadRatio).toBeCloseTo(5.0, 5);
  });

  it("returns Infinity for ppo = 0", () => {
    const r = calculateLowAtmosphereBadRatio({ ppo: 0 });
    expect(r.lowBadRatio).toBe(Infinity);
  });
});

describe("calculateLowAtmosphereSafeAltitudeKm", () => {
  it("calculates safe depth: ln(2.0) × 8.5 ≈ 5.89 km for ppo=0.05, H=8.5", () => {
    const r = calculateLowAtmosphereSafeAltitudeKm({ ppo: 0.05, scaleHeightKm: 8.5 });
    expect(r.safeDepthBelowBaselineKm).toBeCloseTo(Math.log(2.0) * 8.5, 4);
    expect(r.lowBadRatio).toBeCloseTo(2.0, 5);
  });

  it("safe depth is positive (going down means more pressure)", () => {
    const r = calculateLowAtmosphereSafeAltitudeKm({ ppo: 0.04, scaleHeightKm: 6.0 });
    expect(r.safeDepthBelowBaselineKm).toBeGreaterThan(0);
  });

  it("detects nitrogen narcosis risk when lowBadRatio × nitrogenPpo > 2.0", () => {
    // ppo=0.02 → lowBadRatio=5.0; nitrogenPpo=0.6 → 5.0×0.6=3.0 > 2.0
    const r = calculateLowAtmosphereSafeAltitudeKm({
      ppo: 0.02,
      scaleHeightKm: 8.5,
      nitrogenPpo: 0.6,
    });
    expect(r.nitrogenPressureAtSafeDepthBar).toBeCloseTo(3.0, 5);
    expect(r.hasNitrogenNarcosisRisk).toBe(true);
    expect(r.hasNoSafeAltitude).toBe(true);
  });

  it("no narcosis risk when nitrogenPpo is low", () => {
    // ppo=0.05 → lowBadRatio=2.0; nitrogenPpo=0.3 → 2.0×0.3=0.6 < 2.0
    const r = calculateLowAtmosphereSafeAltitudeKm({
      ppo: 0.05,
      scaleHeightKm: 8.5,
      nitrogenPpo: 0.3,
    });
    expect(r.nitrogenPressureAtSafeDepthBar).toBeCloseTo(0.6, 5);
    expect(r.hasNitrogenNarcosisRisk).toBe(false);
    expect(r.hasNoSafeAltitude).toBe(false);
  });

  it("returns null for safeDepthBelowBaselineKm when scaleHeightKm is not provided", () => {
    const r = calculateLowAtmosphereSafeAltitudeKm({ ppo: 0.05 });
    expect(r.safeDepthBelowBaselineKm).toBeNull();
  });

  it("returns null nitrogenPressureAtSafeDepthBar when nitrogenPpo is omitted", () => {
    const r = calculateLowAtmosphereSafeAltitudeKm({ ppo: 0.05, scaleHeightKm: 8.5 });
    expect(r.nitrogenPressureAtSafeDepthBar).toBeNull();
    expect(r.hasNitrogenNarcosisRisk).toBe(false);
  });

  it("extreme limit changes safe depth (smaller ratio → shallower depth)", () => {
    const standard = calculateLowAtmosphereSafeAltitudeKm({ ppo: 0.05, scaleHeightKm: 8.5 });
    const extreme = calculateLowAtmosphereSafeAltitudeKm({
      ppo: 0.05,
      scaleHeightKm: 8.5,
      useExtremeLimit: true,
    });
    expect(extreme.safeDepthBelowBaselineKm).toBeLessThan(standard.safeDepthBelowBaselineKm);
  });
});

describe("rollLowAtmosphereTaint", () => {
  it("roll of 3 → no taint", () => {
    // 1D=3: rng()=2/6
    const r = rollLowAtmosphereTaint({ rng: () => 2 / 6 });
    expect(r.roll).toBe(3);
    expect(r.hasTaint).toBe(false);
  });

  it("roll of 4 → taint", () => {
    const r = rollLowAtmosphereTaint({ rng: () => 3 / 6 });
    expect(r.roll).toBe(4);
    expect(r.hasTaint).toBe(true);
  });

  it("roll of 6 → taint", () => {
    const r = rollLowAtmosphereTaint({ rng: () => 5 / 6 });
    expect(r.roll).toBe(6);
    expect(r.hasTaint).toBe(true);
  });

  it("roll of 1 → no taint", () => {
    const r = rollLowAtmosphereTaint({ rng: () => 0 });
    expect(r.roll).toBe(1);
    expect(r.hasTaint).toBe(false);
  });
});

// ── Subtype: Unusual (F) ─────────────────────────────────────────────────────

describe("UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38", () => {
  it("has 12 entries", () => {
    expect(UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38).toHaveLength(12);
  });

  it("first entry d26=11, code '1', Dense Extreme, no prerequisites", () => {
    const e = UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38[0];
    expect(e.d26).toBe(11);
    expect(e.code).toBe("1");
    expect(e.subtype).toBe("Dense, Extreme");
    expect(e.prerequisites).toBeNull();
  });

  it("last entry d26=26, code 'F', Other, no prerequisites", () => {
    const last = UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38[UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.length - 1];
    expect(last.d26).toBe(26);
    expect(last.code).toBe("F");
  });

  it("d26=25 (Combination) has null code", () => {
    const combo = UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.find((e) => e.d26 === 25);
    expect(combo.code).toBeNull();
    expect(combo.subtype).toBe("Combination");
  });

  it("entries with prerequisites are codes 6 (Layered), 7 (Panthalassic), 8 (Steam)", () => {
    const withPrereqs = UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.filter((e) => e.prerequisites !== null).map((e) => e.code);
    expect(withPrereqs).toEqual(["6", "7", "8"]);
  });

  it("d26 values cover 11–16 and 21–26 (no 17+ or 20)", () => {
    const d26s = UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.map((e) => e.d26);
    expect(d26s).toEqual([11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 26]);
  });
});

describe("rollD26", () => {
  it("d2=1, d6=1 → result=11", () => {
    const r = rollD26(rngForD26(1, 1));
    expect(r.d2).toBe(1);
    expect(r.d6).toBe(1);
    expect(r.result).toBe(11);
  });

  it("d2=1, d6=6 → result=16", () => {
    const r = rollD26(rngForD26(1, 6));
    expect(r.result).toBe(16);
  });

  it("d2=2, d6=1 → result=21", () => {
    const r = rollD26(rngForD26(2, 1));
    expect(r.d2).toBe(2);
    expect(r.result).toBe(21);
  });

  it("d2=2, d6=6 → result=26", () => {
    const r = rollD26(rngForD26(2, 6));
    expect(r.result).toBe(26);
  });
});

describe("rollUnusualAtmosphereSubtype", () => {
  it("d26=11 → code '1', Dense Extreme", () => {
    const r = rollUnusualAtmosphereSubtype({ rng: rngForD26(1, 1) });
    expect(r.roll).toBe(11);
    expect(r.entry.code).toBe("1");
    expect(r.entry.subtype).toBe("Dense, Extreme");
  });

  it("d26=22 → code '8', Steam", () => {
    const r = rollUnusualAtmosphereSubtype({ rng: rngForD26(2, 2) });
    expect(r.roll).toBe(22);
    expect(r.entry.code).toBe("8");
    expect(r.entry.subtype).toBe("Steam");
  });

  it("d26=16 → code '6', Layered", () => {
    const r = rollUnusualAtmosphereSubtype({ rng: rngForD26(1, 6) });
    expect(r.roll).toBe(16);
    expect(r.entry.code).toBe("6");
    expect(r.entry.prerequisites).not.toBeNull();
  });

  it("d26=26 → code 'F', Other", () => {
    const r = rollUnusualAtmosphereSubtype({ rng: rngForD26(2, 6) });
    expect(r.roll).toBe(26);
    expect(r.entry.code).toBe("F");
  });

  it("d26=25 → Combination (null code)", () => {
    const r = rollUnusualAtmosphereSubtype({ rng: rngForD26(2, 5) });
    expect(r.roll).toBe(25);
    expect(r.entry.code).toBeNull();
  });
});

describe("formatUnusualAtmosphereProfile", () => {
  it("single subtype: 'F-St1'", () => {
    expect(formatUnusualAtmosphereProfile({ pressureShorthand: "St", subtypeCodes: ["1"] })).toBe("F-St1");
  });

  it("two subtypes: 'F-St1.7'", () => {
    expect(formatUnusualAtmosphereProfile({ pressureShorthand: "St", subtypeCodes: ["1", "7"] })).toBe("F-St1.7");
  });

  it("no subtypes → 'F-St'", () => {
    expect(formatUnusualAtmosphereProfile({ pressureShorthand: "St", subtypeCodes: [] })).toBe("F-St");
  });

  it("no pressure shorthand → 'F-1.7'", () => {
    expect(formatUnusualAtmosphereProfile({ pressureShorthand: "", subtypeCodes: ["1", "7"] })).toBe("F-1.7");
  });

  it("defaults produce 'F-'", () => {
    expect(formatUnusualAtmosphereProfile()).toBe("F-");
  });
});

// ── Non-Habitable Zone Atmospheres ───────────────────────────────────────────

describe("calculateEffectiveOrbitDeviationFromHzco", () => {
  it("uses normal orbit math when HZCO is 1.0 or greater", () => {
    expect(calculateEffectiveOrbitDeviationFromHzco({ orbit: 4.5, hzco: 3.0 })).toBe(1.5);
    expect(calculateEffectiveOrbitDeviationFromHzco({ orbit: 0.8, hzco: 3.0 })).toBe(-2.2);
  });

  it("uses tenths between HZCO and Orbit 1.0 when HZCO is below 1.0", () => {
    expect(calculateEffectiveOrbitDeviationFromHzco({ orbit: 0.9, hzco: 0.75 })).toBe(1.5);
    expect(calculateEffectiveOrbitDeviationFromHzco({ orbit: 0.5, hzco: 0.75 })).toBe(-2.5);
  });

  it("matches the example crossing Orbit 1.0: HZCO 0.75 to Orbit 2.9 => 4.4", () => {
    expect(calculateEffectiveOrbitDeviationFromHzco({ orbit: 2.9, hzco: 0.75 })).toBe(4.4);
  });
});

describe("Hot/Cold non-habitable atmosphere tables", () => {
  it("Table 39 has 18 rows including 0- and 17+", () => {
    expect(HOT_ATMOSPHERE_TABLE_39).toHaveLength(18);
    expect(HOT_ATMOSPHERE_TABLE_39[0].maxTotal).toBe(0);
    expect(HOT_ATMOSPHERE_TABLE_39[HOT_ATMOSPHERE_TABLE_39.length - 1].maxTotal).toBe(Infinity);
  });

  it("Table 40 includes Trace, No change, Corrosive, and Insidious outcomes", () => {
    expect(SPECIAL_HOT_ATMOSPHERE_TABLE_40.map((entry) => entry.result)).toEqual([
      "Trace",
      "No change",
      "Corrosive",
      "Insidious",
    ]);
  });

  it("Table 41 has 18 rows including 0- and 17+", () => {
    expect(COLD_ATMOSPHERE_TABLE_41).toHaveLength(18);
    expect(COLD_ATMOSPHERE_TABLE_41[0].maxTotal).toBe(0);
    expect(COLD_ATMOSPHERE_TABLE_41[COLD_ATMOSPHERE_TABLE_41.length - 1].maxTotal).toBe(Infinity);
  });
});

describe("rollNonHabitableZoneAtmosphere", () => {
  it("returns habitable sentinel result when deviation is inside +/-1.0", () => {
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 7, orbit: 3.2, hzco: 3.0, rng: rngFor2d(7) });
    expect(result.zone).toBe("habitable");
    expect(result.roll).toBeNull();
    expect(result.atmosphereCode).toBeNull();
  });

  it("matches the hot-world example: size 11, roll 5, deviation <= -2.01 => Corrosive (B)", () => {
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 11, orbit: 1.0, hzco: 3.3, rng: rngFor2d(5) });
    expect(result.zone).toBe("hot");
    expect(result.tableId).toBe(39);
    expect(result.total).toBe(9);
    expect(result.atmosphereCode).toBe("B");
    expect(result.label).toBe("Corrosive (B)");
  });

  it("matches the cold-world example: HZCO 0.75, Orbit 2.9, size 4, roll 10 => Exotic Standard Irritant", () => {
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 4, orbit: 2.9, hzco: 0.75, rng: rngFor2d(10) });
    expect(result.zone).toBe("cold");
    expect(result.tableId).toBe(41);
    expect(result.effectiveDeviation).toBe(4.4);
    expect(result.total).toBe(7);
    expect(result.atmosphereCode).toBe("A");
    expect(result.subtypeCode).toBe("7");
    expect(result.hasIrritant).toBe(true);
  });

  it("applies 4+ irritant roll to starred exotic results", () => {
    const rng = seqRng(0.5, 2 / 6, 3 / 6);
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 10, orbit: 5.5, hzco: 3.0, rng });
    expect(result.total).toBe(10);
    expect(result.irritantRoll).toBe(4);
    expect(result.irritantAdded).toBe(true);
    expect(result.subtypeCode).toBe("B");
    expect(result.hasIrritant).toBe(true);
  });

  it("applies the special hot reroll at HZCO -3.0 or less and can change Dense to Insidious", () => {
    const rng = seqRng(0.5, 2 / 6, 0, 4 / 6);
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 7, orbit: 0.0, hzco: 3.5, rng });
    expect(result.zone).toBe("hot");
    expect(result.total).toBe(7);
    expect(result.baseOutcome.subtypeCode).toBe("8");
    expect(result.specialRoll.dm).toBe(1);
    expect(result.specialRoll.result).toBe("Insidious");
    expect(result.atmosphereCode).toBe("C");
  });

  it("special hot reroll can return No change", () => {
    const rng = seqRng(0.5, 2 / 6, 0, 0);
    const result = rollNonHabitableZoneAtmosphere({ sizeValue: 7, orbit: 0.0, hzco: 3.5, rng });
    expect(result.specialRoll.result).toBe("No change");
    expect(result.atmosphereCode).toBe("A");
    expect(result.subtypeCode).toBe("8");
  });
});

describe("NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES", () => {
  it("contains tables 42 through 48", () => {
    expect(Object.keys(NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES)).toEqual(["42", "43", "44", "45", "46", "47", "48"]);
  });

  it("table 42 includes <= -2 row and 13+ row", () => {
    expect(NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[42].rows[0].maxTotal).toBe(-2);
    expect(
      NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[42].rows[NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[42].rows.length - 1]
        .maxTotal,
    ).toBe(Infinity);
  });
});

describe("selectNonHabitableAtmosphereGasMixTable", () => {
  it("selects table 42 for 453K+", () => {
    expect(selectNonHabitableAtmosphereGasMixTable({ meanTemperatureK: 500 }).id).toBe(42);
  });

  it("selects table 45 for 273K to 303K", () => {
    expect(selectNonHabitableAtmosphereGasMixTable({ meanTemperatureK: 290 }).id).toBe(45);
  });

  it("selects table 48 below 123K", () => {
    expect(selectNonHabitableAtmosphereGasMixTable({ meanTemperatureK: 100 }).id).toBe(48);
  });
});

describe("calculateNonHabitableAtmosphereGasMixDm", () => {
  it("applies table 42 temperature and size modifiers", () => {
    expect(calculateNonHabitableAtmosphereGasMixDm({ tableId: 42, meanTemperatureK: 800, sizeValue: 10 })).toBe(-1);
  });

  it("table 45 has no built-in DM modifiers", () => {
    expect(calculateNonHabitableAtmosphereGasMixDm({ tableId: 45, meanTemperatureK: 290, sizeValue: 10 })).toBe(0);
  });

  it("applies table 48 extreme-cold and size modifiers", () => {
    expect(calculateNonHabitableAtmosphereGasMixDm({ tableId: 48, meanTemperatureK: 60, sizeValue: 4 })).toBe(2);
  });
});

describe("rollNonHabitableAtmosphereGas", () => {
  it("matches the example pattern: table 42, corrosive, size A+, 2D 10 => Ammonia", () => {
    const result = rollNonHabitableAtmosphereGas({
      meanTemperatureK: 500,
      atmosphereCode: "B",
      sizeValue: 10,
      hydrographicsCode: 0,
      hasWater: false,
      rng: rngFor2d(10),
    });
    expect(result.tableId).toBe(42);
    expect(result.dm).toBe(1);
    expect(result.total).toBe(11);
    expect(result.gas).toBe("Ammonia");
  });

  it("resolves Carbon Monoxide* to Carbon Dioxide on water worlds for temperate tables", () => {
    const result = rollNonHabitableAtmosphereGas({
      meanTemperatureK: 290,
      atmosphereCode: "A",
      sizeValue: 7,
      hydrographicsCode: 5,
      hasWater: true,
      rng: rngFor2d(5),
    });
    expect(result.tableId).toBe(45);
    expect(result.rawGas).toBe("Carbon Monoxide*");
    expect(result.gas).toBe("Carbon Dioxide");
  });

  it("keeps Carbon Monoxide on dry worlds", () => {
    const result = rollNonHabitableAtmosphereGas({
      meanTemperatureK: 290,
      atmosphereCode: "A",
      sizeValue: 7,
      hydrographicsCode: 0,
      hasWater: false,
      rng: rngFor2d(5),
    });
    expect(result.gas).toBe("Carbon Monoxide");
  });

  it("resolves Carbon Monoxide* to Nitrogen on frozen water worlds", () => {
    const result = rollNonHabitableAtmosphereGas({
      meanTemperatureK: 180,
      atmosphereCode: "A",
      sizeValue: 7,
      hydrographicsCode: 8,
      hasWater: true,
      rng: rngFor2d(8),
    });
    expect(result.tableId).toBe(47);
    expect(result.rawGas).toBe("Carbon Monoxide*");
    expect(result.gas).toBe("Nitrogen");
  });

  it("returns null for unsupported atmosphere codes", () => {
    expect(rollNonHabitableAtmosphereGas({ meanTemperatureK: 290, atmosphereCode: "G", rng: rngFor2d(7) })).toBeNull();
  });
});

describe("rollNonHabitableAtmosphereGasMixes", () => {
  it("rolls at least twice by default", () => {
    const results = rollNonHabitableAtmosphereGasMixes({
      meanTemperatureK: 290,
      atmosphereCode: "A",
      sizeValue: 7,
      hydrographicsCode: 5,
      hasWater: true,
      rng: rngFor2dSequence(7, 7),
    });
    expect(results).toHaveLength(2);
  });

  it("supports arbitrary counts", () => {
    const results = rollNonHabitableAtmosphereGasMixes({
      count: 3,
      meanTemperatureK: 290,
      atmosphereCode: "A",
      sizeValue: 7,
      hydrographicsCode: 5,
      hasWater: true,
      rng: rngFor2dSequence(7, 7, 3),
    });
    expect(results).toHaveLength(3);
  });
});

describe("rollWorldAtmosphereForOrbit", () => {
  it("uses the habitable-zone roller when inside the HZ band", () => {
    const result = rollWorldAtmosphereForOrbit({ sizeValue: 5, orbit: 3.1, hzco: 3.3, rng: rngFor2d(8) });
    expect(result.method).toBe("habitable-zone");
    expect(result.roll).toBe(8);
    expect(result.atmosphereCode).toBe(6);
    expect(result.nonHabitableZoneAtmosphere).toBeNull();
  });

  it("uses the non-habitable hot table outside the inner HZ boundary", () => {
    const result = rollWorldAtmosphereForOrbit({ sizeValue: 11, orbit: 1.0, hzco: 3.3, rng: rngFor2d(5) });
    expect(result.method).toBe("non-habitable-zone");
    expect(result.zone).toBe("hot");
    expect(result.atmosphereCode).toBe("B");
    expect(result.nonHabitableZoneAtmosphere.total).toBe(9);
  });

  it("uses the non-habitable cold table outside the outer HZ boundary", () => {
    const result = rollWorldAtmosphereForOrbit({ sizeValue: 4, orbit: 2.9, hzco: 0.75, rng: rngFor2d(10) });
    expect(result.method).toBe("non-habitable-zone");
    expect(result.zone).toBe("cold");
    expect(result.atmosphereCode).toBe("A");
    expect(result.nonHabitableZoneAtmosphere.subtypeCode).toBe("7");
  });
});

describe("ATMOSPHERE_GAS_SYMBOLS / formatAtmosphereGasSymbol", () => {
  it("maps known gas names to compact symbols", () => {
    expect(ATMOSPHERE_GAS_SYMBOLS["Carbon Dioxide"]).toBe("CO2");
    expect(formatAtmosphereGasSymbol("Ammonia")).toBe("NH3");
    expect(formatAtmosphereGasSymbol("Water Vapour")).toBe("H2O");
  });

  it("falls back to the original name for unknown gases", () => {
    expect(formatAtmosphereGasSymbol("Xenotime Mist")).toBe("Xenotime Mist");
  });
});

describe("allocateAtmosphereGasMixPercentages", () => {
  it("allocates shares of the remaining atmosphere and merges duplicate gases", () => {
    const result = allocateAtmosphereGasMixPercentages({
      gasResults: [{ gas: "Ammonia" }, { gas: "Carbon Dioxide" }, { gas: "Carbon Dioxide" }],
      precision: 1,
      rng: seqRng(0, (2 - 1) / 10, (2 - 1) / 6, (10 - 1) / 10, (3 - 1) / 6, (8 - 1) / 10),
    });

    expect(result.components).toEqual([
      { gas: "Carbon Dioxide", symbol: "CO2", percent: 48 },
      { gas: "Ammonia", symbol: "NH3", percent: 47 },
    ]);
    expect(result.accountedPercent).toBe(95);
    expect(result.remainingPercent).toBe(5);
  });

  it("uses the reduced base share when disallowHundredPercent is enabled", () => {
    const result = allocateAtmosphereGasMixPercentages({
      gasResults: [{ gas: "Nitrogen" }],
      disallowHundredPercent: true,
      applyVariance: false,
      precision: 0,
      rng: () => 0,
    });
    expect(result.components[0].percent).toBe(40);
  });

  it("stops early once the threshold is reached", () => {
    const result = allocateAtmosphereGasMixPercentages({
      gasResults: [{ gas: "Nitrogen" }, { gas: "Nitrogen" }, { gas: "Argon" }],
      precision: 0,
      rng: seqRng((4 - 1) / 6, (5 - 1) / 10, (4 - 1) / 6, (5 - 1) / 10, 0, 0),
    });
    expect(result.accountedPercent).toBeGreaterThanOrEqual(95);
    expect(result.allocations.length).toBe(2);
  });
});

describe("formatAtmosphereGasMixProfile", () => {
  it("formats a profile like the example gas-mix shorthand", () => {
    const profile = formatAtmosphereGasMixProfile({
      atmosphereCode: "B",
      pressureShorthand: "St",
      subtypeCode: "D",
      components: [
        { gas: "Carbon Dioxide", percent: 48 },
        { gas: "Ammonia", percent: 47 },
        { gas: "Water Vapour", percent: 3 },
      ],
      precision: 0,
    });

    expect(profile).toBe("B-StD:CO2-48:NH3-47:H2O-03");
  });

  it("supports fractional percentages", () => {
    const profile = formatAtmosphereGasMixProfile({
      atmosphereCode: "A",
      pressureShorthand: "St",
      subtypeCode: "7",
      components: [
        { gas: "Nitrogen", percent: 96 },
        { gas: "Argon", percent: 3.8 },
      ],
      precision: 1,
    });

    expect(profile).toBe("A-St7:N2-96.0:Ar-3.8");
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

describe("rollBaseRotationRateHours", () => {
  it("uses multiplier 4 for standard worlds", () => {
    // 2D=7 (d1=4, d2=3), 1D=4, age=0 → (7-2)*4 + 2 + 4 = 26
    const rng = seqRng(3 / 6, 2 / 6, 3 / 6);
    const result = rollBaseRotationRateHours({ rng });
    expect(result.roll2d).toBe(7);
    expect(result.roll1d).toBe(4);
    expect(result.multiplier).toBe(4);
    expect(result.ageDm).toBe(0);
    expect(result.hours).toBe(26);
  });

  it("uses multiplier 2 for small bodies and gas giants", () => {
    // 2D=7 (d1=4, d2=3), 1D=4, age=0 → (7-2)*2 + 2 + 4 = 16
    const rng = seqRng(3 / 6, 2 / 6, 3 / 6);
    const result = rollBaseRotationRateHours({ isSmallOrGasGiant: true, rng });
    expect(result.multiplier).toBe(2);
    expect(result.hours).toBe(16);
  });

  it("applies age DM (+1 per 2 Gyr)", () => {
    // age=6 Gyr → ageDm=3; 2D=7, 1D=4 → same base + 3 = 29
    const rng = seqRng(3 / 6, 2 / 6, 3 / 6);
    const result = rollBaseRotationRateHours({ systemAgeGyr: 6, rng });
    expect(result.ageDm).toBe(3);
    expect(result.hours).toBe(29);
  });

  it("matches the Zed Prime example: 2D=11, 1D=1, DM+3 → 42 hours", () => {
    // (11-2)*4 + 2 + 1 + 3 = 36 + 2 + 1 + 3 = 42
    const rng = seqRng(5 / 6, 4 / 6, 0);
    const result = rollBaseRotationRateHours({ systemAgeGyr: 6, rng });
    expect(result.roll2d).toBe(11);
    expect(result.roll1d).toBe(1);
    expect(result.hours).toBe(42);
  });

  it("produces minimum 3 hours on lowest possible rolls", () => {
    // 2D=2 (d1=1, d2=1), 1D=1, age=0 → (2-2)*4 + 2 + 1 = 3
    const rng = seqRng(0, 0, 0);
    const result = rollBaseRotationRateHours({ rng });
    expect(result.hours).toBe(3);
  });
});

describe("rollWorldRotationPeriodHours", () => {
  it("returns the base roll directly when result is < 40 (no extension)", () => {
    // 2D=7, 1D=4 → 26 < 40: no continuation roll needed
    const rng = seqRng(3 / 6, 2 / 6, 3 / 6);
    const result = rollWorldRotationPeriodHours({ rng });
    expect(result.siderealDayHours).toBe(26);
    expect(result.extended).toBe(false);
    expect(result.continuationRolls).toHaveLength(0);
  });

  it("rolls 1D continuation when base ≥ 40 and stops on result < 5 (Zed Prime DM+3)", () => {
    // Base: 2D=11, 1D=1, age=6 → 42. Continuation 1D=4 (< 5 → stop)
    const rng = seqRng(5 / 6, 4 / 6, 0, 3 / 6);
    const result = rollWorldRotationPeriodHours({ systemAgeGyr: 6, rng });
    expect(result.siderealDayHours).toBe(42);
    expect(result.extended).toBe(false);
    expect(result.continuationRolls).toEqual([4]);
    expect(result.rolls).toHaveLength(1);
  });

  it("extends when 1D continuation is 5 or 6", () => {
    // Base: 2D=12, 1D=6 → 48; continuation 1D=5 → extend
    // Second base: 2D=7, 1D=4 → 26; continuation 1D=3 → stop
    // Total = 74
    const rng = seqRng(5 / 6, 5 / 6, 5 / 6, 4 / 6, 3 / 6, 2 / 6, 3 / 6, 2 / 6);
    const result = rollWorldRotationPeriodHours({ rng });
    expect(result.siderealDayHours).toBe(74);
    expect(result.extended).toBe(true);
    expect(result.rolls).toHaveLength(2);
    expect(result.continuationRolls).toEqual([5, 3]);
  });
});

describe("rollRotationPeriodPrecision", () => {
  it("produces 22m 15s from the Zed Prime precision example", () => {
    // minutesTens: 1D-1=2 (roll=3, rng=2/6); minutesOnes: d10=2 (rng=1/10)
    // secondsTens: 1D-1=1 (roll=2, rng=1/6); secondsOnes: d10=5 (rng=4/10)
    const rng = seqRng(2 / 6, 1 / 10, 1 / 6, 4 / 10);
    const result = rollRotationPeriodPrecision({ rng });
    expect(result.minutes).toBe(22);
    expect(result.seconds).toBe(15);
  });

  it("maps d10 result 10 (rng=9/10) to ones digit 0", () => {
    // minutesTens: 1D-1=0 (roll=1, rng=0); minutesOnes: d10=10 → 0 (rng=9/10)
    // secondsTens: 1D-1=0 (roll=1, rng=0); secondsOnes: d10=1→1 (rng=0)
    const rng = seqRng(0, 9 / 10, 0, 0);
    const result = rollRotationPeriodPrecision({ rng });
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(1);
  });
});

describe("calculateRotationPeriodDecimalHours", () => {
  it("converts 42h 22m 15s to ≈42.37 decimal hours", () => {
    const decimal = calculateRotationPeriodDecimalHours({ hours: 42, minutes: 22, seconds: 15 });
    expect(decimal).toBeCloseTo(42.37, 2);
  });

  it("handles whole hours with no minutes or seconds", () => {
    expect(calculateRotationPeriodDecimalHours({ hours: 24 })).toBe(24);
  });
});

describe("formatRotationPeriodHMS", () => {
  it("formats 42h 22m 15s with zero-padded minutes and seconds", () => {
    expect(formatRotationPeriodHMS({ hours: 42, minutes: 22, seconds: 15 })).toBe("42h 22m 15s");
  });

  it("zero-pads single-digit values", () => {
    expect(formatRotationPeriodHMS({ hours: 3, minutes: 5, seconds: 9 })).toBe("3h 05m 09s");
  });

  it("defaults minutes and seconds to 0", () => {
    expect(formatRotationPeriodHMS({ hours: 10 })).toBe("10h 00m 00s");
  });
});

describe("calculateSolarDaysInYear", () => {
  it("matches the Zed Prime moon example", () => {
    const yearHours = 0.805 * 8766; // ~7056.63
    const siderealDayHours = 42.37;
    const result = calculateSolarDaysInYear({ yearHours, siderealDayHours });
    expect(result.solarDaysInYear).toBeCloseTo(165.548, 2);
    expect(result.solarDayHours).toBeCloseTo(42.626, 2);
    expect(result.isTidallyLocked).toBe(false);
    expect(result.isRetrograde).toBe(false);
  });

  it("returns Infinity solar day and isTidallyLocked=true when sidereal day equals year", () => {
    const result = calculateSolarDaysInYear({ yearHours: 1000, siderealDayHours: 1000 });
    expect(result.solarDaysInYear).toBe(0);
    expect(result.solarDayHours).toBe(Infinity);
    expect(result.isTidallyLocked).toBe(true);
  });

  it("flags retrograde rotation (negative sidereal day) with isRetrograde=true", () => {
    const result = calculateSolarDaysInYear({ yearHours: 100, siderealDayHours: -50 });
    expect(result.isRetrograde).toBe(true);
    // Solar days = 100/-50 - 1 = -3; solar day = 100/-3 ≈ -33.33
    expect(result.solarDaysInYear).toBeCloseTo(-3, 6);
    expect(result.solarDayHours).toBeCloseTo(-100 / 3, 4);
  });

  it("returns null values for invalid inputs", () => {
    expect(calculateSolarDaysInYear({ yearHours: NaN, siderealDayHours: 24 })).toEqual({
      solarDaysInYear: null,
      solarDayHours: null,
      isTidallyLocked: false,
      isRetrograde: false,
    });
    expect(calculateSolarDaysInYear({ yearHours: 8766, siderealDayHours: 0 })).toEqual({
      solarDaysInYear: null,
      solarDayHours: null,
      isTidallyLocked: false,
      isRetrograde: false,
    });
  });
});

describe("AXIAL_TILT_TABLE_52 / EXTREME_AXIAL_TILT_TABLE_53", () => {
  it("Table 52 has 6 entries covering 2–12", () => {
    expect(AXIAL_TILT_TABLE_52).toHaveLength(6);
    expect(AXIAL_TILT_TABLE_52[0].minRoll).toBe(2);
    expect(AXIAL_TILT_TABLE_52[5].maxRoll).toBe(12);
  });

  it("Table 53 has 5 entries covering 1–6", () => {
    expect(EXTREME_AXIAL_TILT_TABLE_53).toHaveLength(5);
    expect(EXTREME_AXIAL_TILT_TABLE_53[0].minRoll).toBe(1);
    expect(EXTREME_AXIAL_TILT_TABLE_53[4].maxRoll).toBe(6);
  });
});

describe("clampAxialTiltDegrees", () => {
  it("passes values within 0–180 unchanged", () => {
    expect(clampAxialTiltDegrees(0)).toBe(0);
    expect(clampAxialTiltDegrees(90)).toBe(90);
    expect(clampAxialTiltDegrees(180)).toBe(180);
  });

  it("reflects values above 180 back from 180", () => {
    expect(clampAxialTiltDegrees(190)).toBe(170);
    expect(clampAxialTiltDegrees(200)).toBe(160);
  });

  it("returns null for non-finite input", () => {
    expect(clampAxialTiltDegrees(NaN)).toBeNull();
    expect(clampAxialTiltDegrees(Infinity)).toBeNull();
  });
});

describe("rollAxialTilt", () => {
  it("2D≤4: returns (1D-1)/50 — minimum 0° when d1=1", () => {
    // 2D=4 (d1=2,d2=2), extra d1=1 → (1-1)/50 = 0
    const rng = seqRng(1 / 6, 1 / 6, 0);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(4);
    expect(result.baseDegrees).toBeCloseTo(0, 6);
    expect(result.isRetrograde).toBe(false);
  });

  it("2D≤4: maximum 0.10° when d1=6", () => {
    // 2D=4 (d1=2,d2=2), extra d1=6 → (6-1)/50 = 0.10
    const rng = seqRng(1 / 6, 1 / 6, 5 / 6);
    expect(rollAxialTilt({ rng }).baseDegrees).toBeCloseTo(0.1, 6);
  });

  it("2D=5: returns 1D÷5", () => {
    // 2D=5 (d1=3,d2=2), extra d1=6 → 6/5 = 1.2
    const rng = seqRng(2 / 6, 1 / 6, 5 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(5);
    expect(result.baseDegrees).toBeCloseTo(1.2, 6);
  });

  it("2D=6: returns 1D", () => {
    // 2D=6 (d1=3,d2=3), extra d1=4 → 4°
    const rng = seqRng(2 / 6, 2 / 6, 3 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(6);
    expect(result.baseDegrees).toBe(4);
  });

  it("2D=7: returns 6+1D", () => {
    // 2D=7 (d1=4,d2=3), extra d1=3 → 6+3=9
    const rng = seqRng(3 / 6, 2 / 6, 2 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(7);
    expect(result.baseDegrees).toBe(9);
  });

  it("2D=8: returns 5+1D×5", () => {
    // 2D=8 (d1=4,d2=4), extra d1=4 → 5+4×5=25
    const rng = seqRng(3 / 6, 3 / 6, 3 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(8);
    expect(result.baseDegrees).toBe(25);
    expect(result.isRetrograde).toBe(false);
  });

  it("2D=10+, extreme table row 1-2: 10+1D×10 (range 20–70)", () => {
    // 2D=10 (d1=5,d2=5), extremeRoll=1D=2, d1=4 → 10+40=50
    const rng = seqRng(4 / 6, 4 / 6, 1 / 6, 3 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(10);
    expect(result.extremeTableRoll).toBe(2);
    expect(result.baseDegrees).toBe(50);
    expect(result.isRetrograde).toBe(false);
  });

  it("2D=10+, extreme table row 3: 30+1D×10 — Zed Prime example (70°)", () => {
    // 2D=10 (d1=5,d2=5), extremeRoll=1D=3, d1=4 → 30+40=70
    const rng = seqRng(4 / 6, 4 / 6, 2 / 6, 3 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.roll2d).toBe(10);
    expect(result.extremeTableRoll).toBe(3);
    expect(result.extraRolls).toEqual([4]);
    expect(result.baseDegrees).toBe(70);
    expect(result.isRetrograde).toBe(false);
  });

  it("extreme table row 4: 90+1D×1D marks retrograde", () => {
    // extremeRoll=4, d1=3, d2=4 → 90+12=102
    const rng = seqRng(4 / 6, 4 / 6, 3 / 6, 2 / 6, 3 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.extremeTableRoll).toBe(4);
    expect(result.baseDegrees).toBe(102);
    expect(result.isRetrograde).toBe(true);
    expect(result.extraRolls).toEqual([3, 4]);
  });

  it("extreme table row 5: 180-1D×1D (extreme retrograde)", () => {
    // extremeRoll=5, d1=2, d2=3 → 180-6=174
    const rng = seqRng(4 / 6, 4 / 6, 4 / 6, 1 / 6, 2 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.extremeTableRoll).toBe(5);
    expect(result.baseDegrees).toBe(174);
    expect(result.isRetrograde).toBe(true);
  });

  it("extreme table row 6: 120+1D×10 (range 130–180)", () => {
    // extremeRoll=6, d1=3 → 120+30=150
    const rng = seqRng(4 / 6, 4 / 6, 5 / 6, 2 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.extremeTableRoll).toBe(6);
    expect(result.baseDegrees).toBe(150);
    expect(result.isRetrograde).toBe(true);
  });

  it("clamps extreme results over 180° back within range", () => {
    // extremeRoll=6, d1=6 → 120+60=180, clamped to 180
    const rng = seqRng(4 / 6, 4 / 6, 5 / 6, 5 / 6);
    const result = rollAxialTilt({ rng });
    expect(result.baseDegrees).toBe(180);
  });
});

describe("rollAxialTiltPrecision", () => {
  it("produces arc-minutes 0–59 and arc-seconds 0–59", () => {
    // arcMinTens: 1D-1=3 (roll=4, rng=3/6); arcMinOnes: d10=9 (rng=8/10)
    // arcSecTens: 1D-1=0 (roll=1, rng=0); arcSecOnes: d10=5 (rng=4/10)
    const rng = seqRng(3 / 6, 8 / 10, 0, 4 / 10);
    const result = rollAxialTiltPrecision({ rng });
    expect(result.arcMinutes).toBe(39);
    expect(result.arcSeconds).toBe(5);
  });

  it("maps d10=10 (rng=9/10) to ones digit 0", () => {
    const rng = seqRng(0, 9 / 10, 0, 0);
    const result = rollAxialTiltPrecision({ rng });
    expect(result.arcMinutes).toBe(0);
  });
});

describe("calculateAxialTiltDecimalDegrees", () => {
  it("converts 73° 39' to 73.65°", () => {
    expect(calculateAxialTiltDecimalDegrees({ degrees: 73, arcMinutes: 39 })).toBeCloseTo(73.65, 2);
  });

  it("handles no arc-minutes or arc-seconds", () => {
    expect(calculateAxialTiltDecimalDegrees({ degrees: 45 })).toBe(45);
  });

  it("converts degrees + arcMinutes + arcSeconds correctly", () => {
    // 10° 30' 0" = 10.5°; 10° 0' 36" = 10.01°
    expect(calculateAxialTiltDecimalDegrees({ degrees: 10, arcMinutes: 30 })).toBeCloseTo(10.5, 6);
    expect(calculateAxialTiltDecimalDegrees({ degrees: 10, arcSeconds: 36 })).toBeCloseTo(10.01, 4);
  });
});

describe("formatAxialTiltDMS", () => {
  it("formats 73° 39' 00\" for the Zed Prime example", () => {
    expect(formatAxialTiltDMS({ degrees: 73, arcMinutes: 39 })).toBe("73° 39' 00\"");
  });

  it("zero-pads single-digit arc-minutes and arc-seconds", () => {
    expect(formatAxialTiltDMS({ degrees: 3, arcMinutes: 5, arcSeconds: 9 })).toBe("3° 05' 09\"");
  });

  it("defaults to 0 for omitted arc-minutes and arc-seconds", () => {
    expect(formatAxialTiltDMS({ degrees: 23 })).toBe("23° 00' 00\"");
  });
});

describe("calculateTidalForce", () => {
  it("applies the basic proportionality: mass × diameter / distance³", () => {
    // (2 × 3) / 2³ = 6/8 = 0.75
    expect(calculateTidalForce({ otherBodyMass: 2, affectedBodyDiameter: 3, distance: 2 })).toBeCloseTo(0.75, 9);
  });

  it("obeys the inverse-cube law: doubling distance cuts force by a factor of 8", () => {
    const tf1 = calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: 1, distance: 1 });
    const tf2 = calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: 1, distance: 2 });
    expect(tf1 / tf2).toBeCloseTo(8, 9);
  });

  it("is directly proportional to the other body's mass", () => {
    const tf1 = calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: 5, distance: 3 });
    const tf2 = calculateTidalForce({ otherBodyMass: 4, affectedBodyDiameter: 5, distance: 3 });
    expect(tf2 / tf1).toBeCloseTo(4, 9);
  });

  it("is directly proportional to the affected body's diameter", () => {
    const tf1 = calculateTidalForce({ otherBodyMass: 3, affectedBodyDiameter: 2, distance: 4 });
    const tf2 = calculateTidalForce({ otherBodyMass: 3, affectedBodyDiameter: 6, distance: 4 });
    expect(tf2 / tf1).toBeCloseTo(3, 9);
  });

  it("returns null when distance is zero", () => {
    expect(calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: 1, distance: 0 })).toBeNull();
  });

  it("returns null for non-finite inputs", () => {
    expect(calculateTidalForce({ otherBodyMass: NaN, affectedBodyDiameter: 1, distance: 1 })).toBeNull();
    expect(calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: Infinity, distance: 1 })).toBeNull();
    expect(calculateTidalForce({ otherBodyMass: 1, affectedBodyDiameter: 1, distance: NaN })).toBeNull();
  });

  it("returns null when called with no arguments", () => {
    expect(calculateTidalForce()).toBeNull();
  });
});

describe("calculateStarTidalEffect", () => {
  it("matches Sol-on-Terra reference: 0.25 m", () => {
    const result = calculateStarTidalEffect({ starMass: 1, worldSize: 8, distanceAu: 1 });
    expect(result).toBeCloseTo(0.25, 9);
  });

  it("follows inverse-cube scaling with AU", () => {
    const near = calculateStarTidalEffect({ starMass: 1, worldSize: 8, distanceAu: 1 });
    const far = calculateStarTidalEffect({ starMass: 1, worldSize: 8, distanceAu: 2 });
    expect(near / far).toBeCloseTo(8, 9);
  });

  it("returns null for non-finite or non-positive distance", () => {
    expect(calculateStarTidalEffect({ starMass: NaN, worldSize: 8, distanceAu: 1 })).toBeNull();
    expect(calculateStarTidalEffect({ starMass: 1, worldSize: Infinity, distanceAu: 1 })).toBeNull();
    expect(calculateStarTidalEffect({ starMass: 1, worldSize: 8, distanceAu: 0 })).toBeNull();
    expect(calculateStarTidalEffect({ starMass: 1, worldSize: 8, distanceAu: -1 })).toBeNull();
  });
});

describe("calculateMoonTidalEffect", () => {
  it("matches Luna-on-Terra reference approximately: 0.54 m", () => {
    const result = calculateMoonTidalEffect({ moonMass: 0.0123, planetSize: 8, moonDistanceKm: 384400 });
    expect(result).toBeCloseTo(0.54, 2);
  });

  it("follows inverse-cube scaling with distance in km", () => {
    const near = calculateMoonTidalEffect({ moonMass: 0.0123, planetSize: 8, moonDistanceKm: 384400 });
    const far = calculateMoonTidalEffect({ moonMass: 0.0123, planetSize: 8, moonDistanceKm: 768800 });
    expect(near / far).toBeCloseTo(8, 9);
  });

  it("returns null for invalid inputs", () => {
    expect(calculateMoonTidalEffect({ moonMass: NaN, planetSize: 8, moonDistanceKm: 384400 })).toBeNull();
    expect(calculateMoonTidalEffect({ moonMass: 0.01, planetSize: 8, moonDistanceKm: 0 })).toBeNull();
    expect(calculateMoonTidalEffect()).toBeNull();
  });
});

describe("calculatePlanetTidalEffect", () => {
  it("applies the planet-to-moon formula in meters", () => {
    const result = calculatePlanetTidalEffect({ planetMass: 1200, moonSize: 5, moonDistanceKm: 1_000_000 });
    expect(result).toBeCloseTo(1875, 9);
  });

  it("matches moon-formula shape for same mass/size/distance values", () => {
    const a = calculateMoonTidalEffect({ moonMass: 0.1, planetSize: 6, moonDistanceKm: 500000 });
    const b = calculatePlanetTidalEffect({ planetMass: 0.1, moonSize: 6, moonDistanceKm: 500000 });
    expect(a).toBeCloseTo(b, 12);
  });

  it("returns null for invalid inputs", () => {
    expect(calculatePlanetTidalEffect({ planetMass: Infinity, moonSize: 6, moonDistanceKm: 500000 })).toBeNull();
    expect(calculatePlanetTidalEffect({ planetMass: 1, moonSize: 6, moonDistanceKm: -100 })).toBeNull();
  });
});

describe("calculateMoonToMoonTidalEffect", () => {
  it("applies the moon-to-moon formula in meters", () => {
    const result = calculateMoonToMoonTidalEffect({ otherMass: 0.2, moonSize: 4, moonSeparationKm: 1_000_000 });
    expect(result).toBeCloseTo(0.25, 9);
  });

  it("increases strongly as separation decreases", () => {
    const wide = calculateMoonToMoonTidalEffect({ otherMass: 0.2, moonSize: 4, moonSeparationKm: 2_000_000 });
    const tight = calculateMoonToMoonTidalEffect({ otherMass: 0.2, moonSize: 4, moonSeparationKm: 1_000_000 });
    expect(tight / wide).toBeCloseTo(8, 9);
  });

  it("returns null for invalid inputs", () => {
    expect(calculateMoonToMoonTidalEffect({ otherMass: NaN, moonSize: 4, moonSeparationKm: 1_000_000 })).toBeNull();
    expect(calculateMoonToMoonTidalEffect({ otherMass: 0.2, moonSize: 4, moonSeparationKm: 0 })).toBeNull();
    expect(calculateMoonToMoonTidalEffect()).toBeNull();
  });
});

describe("calculateTidalStressFactor", () => {
  it("sums tidal effects and divides by 10, rounding down", () => {
    // Zed Prime-style example: 30.6 + 0.24 = 30.84 -> floor(30.84 / 10) = 3
    const factor = calculateTidalStressFactor({ tidalEffectsMeters: [30.6, 0.24] });
    expect(factor).toBe(3);
  });

  it("returns 0 when total tidal effects are less than 10 meters", () => {
    expect(calculateTidalStressFactor({ tidalEffectsMeters: [0.54, 0.25] })).toBe(0);
  });

  it("accepts an explicit pre-summed tidal total", () => {
    expect(calculateTidalStressFactor({ totalTidalEffectsMeters: 30.84 })).toBe(3);
  });

  it("ignores non-finite array entries when summing", () => {
    expect(calculateTidalStressFactor({ tidalEffectsMeters: [10, NaN, Infinity, 9.9] })).toBe(1);
  });

  it("returns null for a negative total", () => {
    expect(calculateTidalStressFactor({ totalTidalEffectsMeters: -0.1 })).toBeNull();
  });

  it("returns null for invalid non-array input when no total is provided", () => {
    expect(calculateTidalStressFactor({ tidalEffectsMeters: "bad" })).toBeNull();
  });
});

describe("calculateTidalHeatingFactor", () => {
  it("matches an Io-scale worked example order of magnitude", () => {
    const factor = calculateTidalHeatingFactor({
      primaryMassEarth: 317.8,
      worldSize: 2.3,
      eccentricity: 0.0041,
      distanceMkm: 0.4217,
      periodDays: 1.769,
      worldMassEarth: 0.015,
    });

    expect(factor).toBe(102);
  });

  it("returns 0 for negligible heating (<1)", () => {
    const factor = calculateTidalHeatingFactor({
      primaryMassEarth: 1,
      worldSize: 1,
      eccentricity: 0.001,
      distanceMkm: 1,
      periodDays: 365,
      worldMassEarth: 1,
    });

    expect(factor).toBe(0);
  });

  it("returns null for invalid inputs", () => {
    expect(
      calculateTidalHeatingFactor({
        primaryMassEarth: 1,
        worldSize: 8,
        eccentricity: -0.1,
        distanceMkm: 0.4,
        periodDays: 2,
        worldMassEarth: 1,
      }),
    ).toBeNull();
    expect(calculateTidalHeatingFactor()).toBeNull();
  });
});

describe("calculateTotalSeismicStress", () => {
  it("sums all three components", () => {
    expect(calculateTotalSeismicStress({ seismicStress: 0, tidalStressFactor: 3, tidalHeatingFactor: 14 })).toBe(17);
  });

  it("treats absent or invalid components as 0", () => {
    expect(calculateTotalSeismicStress({})).toBe(0);
    expect(calculateTotalSeismicStress({ seismicStress: NaN, tidalStressFactor: 5 })).toBe(5);
  });

  it("treats negative components as 0", () => {
    expect(calculateTotalSeismicStress({ seismicStress: -5, tidalStressFactor: 3, tidalHeatingFactor: 0 })).toBe(3);
  });

  it("returns 0 when called with no arguments", () => {
    expect(calculateTotalSeismicStress()).toBe(0);
  });
});

describe("applySeismicTemperatureCorrection", () => {
  it("matches the worked example: 300\u00b0C base + stress 17 = unchanged at integer precision", () => {
    // 300K + 17 seismic = 300.00077K, rounds to 300
    const result = applySeismicTemperatureCorrection(26.85, 17); // 26.85°C = 300K
    expect(result).toBe(27); // 300.00077K - 273.15 ≈ 26.85°C → rounds to 27°C (same as input rounded)
  });

  it("produces a noticeable correction for a cold world with high seismic stress", () => {
    // 10K = -263.15°C; stress=200 dominates → result ≈ 200K ≈ -73°C
    const result = applySeismicTemperatureCorrection(-263.15, 200);
    expect(result).toBeGreaterThan(-263); // temperature raised significantly
    expect(result).toBeLessThan(0); // still sub-zero
  });

  it("returns temperature unchanged when stress is 0", () => {
    expect(applySeismicTemperatureCorrection(25, 0)).toBe(25);
  });

  it("returns temperature unchanged when stress is negative", () => {
    expect(applySeismicTemperatureCorrection(25, -5)).toBe(25);
  });
});

describe("calculateTectonicPlates", () => {
  it("matches the worked example: Size 5 + Hydro 6 - roll 8 + DM1 (stress 17) = 4 plates", () => {
    expect(calculateTectonicPlates({ size: 5, hydrographics: 6, totalSeismicStress: 17, roll2D: 8 })).toBe(4);
  });

  it("applies DM+2 when stress exceeds 100", () => {
    expect(calculateTectonicPlates({ size: 6, hydrographics: 4, totalSeismicStress: 150, roll2D: 7 })).toBe(5);
  });

  it("applies no DM when stress is between 1 and 9", () => {
    expect(calculateTectonicPlates({ size: 8, hydrographics: 3, totalSeismicStress: 5, roll2D: 7 })).toBe(4);
  });

  it("returns 0 when result is exactly 1", () => {
    // size 2 + hydro 1 - roll 12 + DM0 = -9 → 0
    expect(calculateTectonicPlates({ size: 2, hydrographics: 1, totalSeismicStress: 5, roll2D: 12 })).toBe(0);
  });

  it("returns 0 when hydrographics is 0", () => {
    expect(calculateTectonicPlates({ size: 8, hydrographics: 0, totalSeismicStress: 17, roll2D: 7 })).toBe(0);
  });

  it("returns 0 when totalSeismicStress is 0", () => {
    expect(calculateTectonicPlates({ size: 8, hydrographics: 4, totalSeismicStress: 0, roll2D: 7 })).toBe(0);
  });

  it("returns 0 for missing or invalid arguments", () => {
    expect(calculateTectonicPlates()).toBe(0);
    expect(calculateTectonicPlates({ size: NaN, hydrographics: 4, totalSeismicStress: 10, roll2D: 7 })).toBe(0);
  });
});

describe("TIDAL_LOCK_STATUS_TABLE_54", () => {
  it("has 11 entries spanning −∞ to +∞", () => {
    expect(TIDAL_LOCK_STATUS_TABLE_54).toHaveLength(11);
    expect(TIDAL_LOCK_STATUS_TABLE_54[0].minRoll).toBe(-Infinity);
    expect(TIDAL_LOCK_STATUS_TABLE_54[10].maxRoll).toBe(Infinity);
  });

  it("row ≤2 is NO_EFFECT", () => {
    expect(TIDAL_LOCK_STATUS_TABLE_54[0].effectCode).toBe("NO_EFFECT");
    expect(TIDAL_LOCK_STATUS_TABLE_54[0].maxRoll).toBe(2);
  });

  it("row 12+ is LOCK_1_1 with lockType LOCK_1_1", () => {
    const last = TIDAL_LOCK_STATUS_TABLE_54[10];
    expect(last.effectCode).toBe("LOCK_1_1");
    expect(last.lockType).toBe("LOCK_1_1");
  });

  it("rows 7–10 have non-null progradeMultiplier and null dayMultiplier", () => {
    const codes = ["PROGRADE_SHORT", "PROGRADE_LONG", "RETROGRADE_MEDIUM", "RETROGRADE_LONG"];
    const rows = TIDAL_LOCK_STATUS_TABLE_54.filter((r) => codes.includes(r.effectCode));
    expect(rows).toHaveLength(4);
    rows.forEach((r) => {
      expect(r.progradeMultiplier).not.toBeNull();
      expect(r.dayMultiplier).toBeNull();
    });
  });

  it("rows 3–6 have non-null dayMultiplier and null progradeMultiplier", () => {
    const codes = ["MULTIPLY_1_5", "MULTIPLY_2", "MULTIPLY_3", "MULTIPLY_5"];
    const rows = TIDAL_LOCK_STATUS_TABLE_54.filter((r) => codes.includes(r.effectCode));
    expect(rows).toHaveLength(4);
    rows.forEach((r) => {
      expect(r.dayMultiplier).not.toBeNull();
      expect(r.progradeMultiplier).toBeNull();
    });
  });
});

describe("calculateTidalLockCommonDMs", () => {
  it("returns 0 with all defaults", () => {
    expect(calculateTidalLockCommonDMs()).toBe(0);
  });

  it("size 3 → DM+1", () => {
    expect(calculateTidalLockCommonDMs({ size: 3 })).toBe(1);
  });

  it("size 6 → DM+2", () => {
    expect(calculateTidalLockCommonDMs({ size: 6 })).toBe(2);
  });

  it("size 7 → DM+3 (ceil(7÷3)=3)", () => {
    expect(calculateTidalLockCommonDMs({ size: 7 })).toBe(3);
  });

  it("size 0: no DM", () => {
    expect(calculateTidalLockCommonDMs({ size: 0 })).toBe(0);
  });

  it("eccentricity 0.15 → DM−1 (floor(0.15×10)=1)", () => {
    expect(calculateTidalLockCommonDMs({ eccentricity: 0.15 })).toBe(-1);
  });

  it("eccentricity 0.05: no DM (≤ 0.1)", () => {
    expect(calculateTidalLockCommonDMs({ eccentricity: 0.05 })).toBe(0);
  });

  it("axialTilt 45° → DM−2 (above 30° only)", () => {
    expect(calculateTidalLockCommonDMs({ axialTilt: 45 })).toBe(-2);
  });

  it("axialTilt 75° → DM−6 (above 30° + 60–120°, additive)", () => {
    expect(calculateTidalLockCommonDMs({ axialTilt: 75 })).toBe(-6);
  });

  it("axialTilt 90° → DM−10 (all three tilt bands, additive)", () => {
    expect(calculateTidalLockCommonDMs({ axialTilt: 90 })).toBe(-10);
  });

  it("atmospheric pressure 3.0 bar → DM−2", () => {
    expect(calculateTidalLockCommonDMs({ atmosphericPressureBar: 3.0 })).toBe(-2);
  });

  it("system age 0.5 Gyr → DM−2", () => {
    expect(calculateTidalLockCommonDMs({ systemAgeGyr: 0.5 })).toBe(-2);
  });

  it("system age 7 Gyr → DM+2", () => {
    expect(calculateTidalLockCommonDMs({ systemAgeGyr: 7 })).toBe(2);
  });

  it("system age 12 Gyr → DM+4", () => {
    expect(calculateTidalLockCommonDMs({ systemAgeGyr: 12 })).toBe(4);
  });

  it("system age exactly 10 Gyr → DM+4 (edge: closer to 0 than +2)", () => {
    expect(calculateTidalLockCommonDMs({ systemAgeGyr: 10 })).toBe(4);
  });

  it("combines multiple DMs: size 6 + age 12 = +6", () => {
    expect(calculateTidalLockCommonDMs({ size: 6, systemAgeGyr: 12 })).toBe(6);
  });
});

describe("calculateTidalLockStarDMs", () => {
  it("default (orbit 1, mass 1, 1 star, no moons) → 0", () => {
    expect(calculateTidalLockStarDMs()).toBe(0);
  });

  it("orbit 0.5 → base−4 + (4+0) = 0", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 0.5 })).toBe(0);
  });

  it("orbit 0 (theoretical) → base−4 + 14 = +10", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 0 })).toBe(10);
  });

  it("orbit 2.0 (edge: +1 closer to 0 than +4) → base−4+1 = −3", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 2 })).toBe(-3);
  });

  it("orbit 3.0 (edge: +1 closer to 0 than −6) → base−4+1 = −3", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 3 })).toBe(-3);
  });

  it("orbit 4 → base−4 + (−8) = −12", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 4 })).toBe(-12);
  });

  it("orbit 1.5, mass 0.3 → −4+4−2 = −2", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 1.5, totalStarMass: 0.3 })).toBe(-2);
  });

  it("mass 0.5 (edge: −1 closer to 0 than −2)", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 1, totalStarMass: 0.5 })).toBe(-1);
  });

  it("mass 3 (2–5 range) → −4+4+1 = +1", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 1, totalStarMass: 3 })).toBe(1);
  });

  it("numStarsOrbited 3 → DM−3 extra: −4+4−3 = −3", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 1, numStarsOrbited: 3 })).toBe(-3);
  });

  it("totalSignificantMoonSize 5 → DM−5 extra: −4+4−5 = −5", () => {
    expect(calculateTidalLockStarDMs({ orbitNumber: 1, totalSignificantMoonSize: 5 })).toBe(-5);
  });
});

describe("calculateTidalLockMoonToPlanetDMs", () => {
  it("default (orbit 5 PD, planet mass 1, prograde) → +6", () => {
    expect(calculateTidalLockMoonToPlanetDMs()).toBe(6);
  });

  it("orbit 5 PD, planet mass 5 (1<5≤10) → +6+2 = +8", () => {
    expect(calculateTidalLockMoonToPlanetDMs({ moonOrbitPD: 5, planetMass: 5 })).toBe(8);
  });

  it("orbit 25 PD, planet mass 50 → +6−1+4 = +9", () => {
    expect(calculateTidalLockMoonToPlanetDMs({ moonOrbitPD: 25, planetMass: 50 })).toBe(9);
  });

  it("retrograde orbit → DM−2: +6−2 = +4", () => {
    expect(calculateTidalLockMoonToPlanetDMs({ moonOrbitPD: 5, isRetrograde: true, planetMass: 1 })).toBe(4);
  });

  it("planet mass 1000 (edge: +6 closer to 0 than +8) → +6+6 = +12", () => {
    expect(calculateTidalLockMoonToPlanetDMs({ moonOrbitPD: 5, planetMass: 1000 })).toBe(12);
  });

  it("planet mass > 1000 → +8: +6+8 = +14", () => {
    expect(calculateTidalLockMoonToPlanetDMs({ moonOrbitPD: 5, planetMass: 5000 })).toBe(14);
  });
});

describe("calculateTidalLockPlanetToMoonDMs", () => {
  it("default (size 0, orbit 5, 1 moon): −10 + [5,10) bracket +4 = −6", () => {
    expect(calculateTidalLockPlanetToMoonDMs()).toBe(-6);
  });

  it("moonSize 2, orbit 3 PD → −10+2+(5+ceil(10)) = +7", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonSize: 2, moonOrbitPD: 3 })).toBe(7);
  });

  it("moonSize 4, orbit 1 PD → −10+4+(5+ceil(20)) = +19", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonSize: 4, moonOrbitPD: 1 })).toBe(19);
  });

  it("orbit 30 PD → −10+1 = −9", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonOrbitPD: 30 })).toBe(-9);
  });

  it("orbit 40 PD (edge: 0 not +1) → −10", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonOrbitPD: 40 })).toBe(-10);
  });

  it("orbit 65 PD → −10−6 = −16", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonOrbitPD: 65 })).toBe(-16);
  });

  it("orbit 60 PD (edge: 0 not −6) → −10", () => {
    expect(calculateTidalLockPlanetToMoonDMs({ moonOrbitPD: 60 })).toBe(-10);
  });

  it("3 significant moons → −4 extra (−2 per moon beyond first)", () => {
    // orbit 5: +4; base −10; moons −4 = −10
    expect(calculateTidalLockPlanetToMoonDMs({ moonOrbitPD: 5, numSignificantMoons: 3 })).toBe(-10);
  });
});

describe("rollTidalLockStatus", () => {
  it("totalDM ≤ −10: returns NO_EFFECT without consuming rng", () => {
    let called = 0;
    const rng = () => {
      called++;
      return 0.5;
    };
    const result = rollTidalLockStatus({ totalDM: -10, rng });
    expect(result.effectCode).toBe("NO_EFFECT");
    expect(result.autoResult).toBe("no_roll_needed");
    expect(called).toBe(0);
  });

  it("totalDM ≥ +10, check ≠ 12: returns auto LOCK_1_1", () => {
    // check 2D: 5+5=10 (rng=4/6,4/6) — not 12
    const rng = seqRng(4 / 6, 4 / 6);
    const result = rollTidalLockStatus({ totalDM: 10, rng });
    expect(result.effectCode).toBe("LOCK_1_1");
    expect(result.autoResult).toBe("auto_lock");
  });

  it("totalDM ≥ +10, check = 12: re-rolls at DM 0 and returns that result", () => {
    // check 2D: 6+6=12 (5/6,5/6); reroll 2D: 4+3=7 → PROGRADE_SHORT; extraRoll=2
    const rng = seqRng(5 / 6, 5 / 6, 3 / 6, 2 / 6, 1 / 6);
    const result = rollTidalLockStatus({ totalDM: 10, rng });
    expect(result.effectCode).toBe("PROGRADE_SHORT");
    expect(result.autoResult).toBeNull();
    expect(result.newDayHours).toBe(2 * 5 * 24);
  });

  it("DM 0, roll 7 → PROGRADE_SHORT with 1D extraRoll", () => {
    // 2D: 4+3=7 (3/6, 2/6); extraRoll d1=3 (2/6); newDayHours=360
    const rng = seqRng(3 / 6, 2 / 6, 2 / 6);
    const result = rollTidalLockStatus({ totalDM: 0, rng });
    expect(result.effectCode).toBe("PROGRADE_SHORT");
    expect(result.roll2d).toBe(7);
    expect(result.extraRoll).toBe(3);
    expect(result.newDayHours).toBe(360);
    expect(result.isRetrograde).toBe(false);
  });

  it("DM 0, roll 9 → RETROGRADE_MEDIUM; isRetrograde true", () => {
    // 2D: 5+4=9 (4/6, 3/6); extraRoll d1=4 (3/6); newDayHours=4×10×24=960
    const rng = seqRng(4 / 6, 3 / 6, 3 / 6);
    const result = rollTidalLockStatus({ totalDM: 0, rng });
    expect(result.effectCode).toBe("RETROGRADE_MEDIUM");
    expect(result.isRetrograde).toBe(true);
    expect(result.newDayHours).toBe(960);
  });

  it("DM 0, roll 11 → RESONANCE_3_2; no extraRoll", () => {
    // 2D: 5+6=11 (4/6, 5/6)
    const rng = seqRng(4 / 6, 5 / 6);
    const result = rollTidalLockStatus({ totalDM: 0, rng });
    expect(result.effectCode).toBe("RESONANCE_3_2");
    expect(result.lockType).toBe("RESONANCE_3_2");
    expect(result.extraRoll).toBeNull();
  });

  it("DM+5, natural roll 7 → adjusted 12 → LOCK_1_1 (no de-lock, r2d≠12)", () => {
    // 2D: 4+3=7 (3/6, 2/6); adjusted=12; r2d=7 ≠ 12 → no recheck
    const rng = seqRng(3 / 6, 2 / 6);
    const result = rollTidalLockStatus({ totalDM: 5, rng });
    expect(result.effectCode).toBe("LOCK_1_1");
    expect(result.roll2d).toBe(7);
    expect(result.autoResult).toBeNull();
  });

  it("DM 0, natural 12 → LOCK_1_1 de-lock: re-rolls at DM 0", () => {
    // 2D=12 (5/6,5/6) → reroll at DM 0: 2D=4 (1/6,1/6) → MULTIPLY_2
    const rng = seqRng(5 / 6, 5 / 6, 1 / 6, 1 / 6);
    const result = rollTidalLockStatus({ totalDM: 0, rng });
    expect(result.effectCode).toBe("MULTIPLY_2");
    expect(result.dayMultiplier).toBe(2);
  });

  it("DM −5, roll 6 → adjusted 1 → NO_EFFECT", () => {
    // 2D: 3+3=6 (2/6, 2/6); adjusted=1 ≤ 2 → NO_EFFECT
    const rng = seqRng(2 / 6, 2 / 6);
    const result = rollTidalLockStatus({ totalDM: -5, rng });
    expect(result.effectCode).toBe("NO_EFFECT");
    expect(result.roll2d).toBe(6);
  });
});

describe("adjustAxialTiltForRetrograde", () => {
  it("tilt < 90°: returns 180 − tilt", () => {
    expect(adjustAxialTiltForRetrograde(45)).toBe(135);
    expect(adjustAxialTiltForRetrograde(0)).toBe(180);
    expect(adjustAxialTiltForRetrograde(89)).toBe(91);
  });

  it("tilt ≥ 90°: returns tilt unchanged", () => {
    expect(adjustAxialTiltForRetrograde(90)).toBe(90);
    expect(adjustAxialTiltForRetrograde(120)).toBe(120);
  });

  it("returns null for non-finite input", () => {
    expect(adjustAxialTiltForRetrograde(NaN)).toBeNull();
    expect(adjustAxialTiltForRetrograde(Infinity)).toBeNull();
  });
});

describe("rollTidalLockAxialTiltReroll", () => {
  it("uses 1D axial-tilt table rows: roll 4 then 1D=2 -> 8°", () => {
    // table roll: 4, then row formula 6 + 1D with 1D=2
    const rng = seqRng(3 / 6, 1 / 6);
    expect(rollTidalLockAxialTiltReroll({ rng })).toBe(8);
  });

  it("can return 0° at the low end (table row 1 with 1D=1)", () => {
    const rng = seqRng(0, 0);
    expect(rollTidalLockAxialTiltReroll({ rng })).toBe(0);
  });

  it("handles extreme branch (table 6, extreme 4, 6x6): 126°", () => {
    // table roll: 6, extreme roll: 4, then 1D=6 and 1D=6
    const rng = seqRng(5 / 6, 3 / 6, 5 / 6, 5 / 6);
    expect(rollTidalLockAxialTiltReroll({ rng })).toBe(126);
  });
});

describe("selectTidalLockEccentricity", () => {
  it("returns the lower of original and new eccentricity when original > 0.1", () => {
    expect(selectTidalLockEccentricity({ originalEccentricity: 0.3, newEccentricity: 0.2 })).toBe(0.2);
    expect(selectTidalLockEccentricity({ originalEccentricity: 0.3, newEccentricity: 0.35 })).toBe(0.3);
  });

  it("does not reduce eccentricity when original <= 0.1", () => {
    expect(selectTidalLockEccentricity({ originalEccentricity: 0.1, newEccentricity: 0.01 })).toBe(0.1);
    expect(selectTidalLockEccentricity({ originalEccentricity: 0.05, newEccentricity: 0.001 })).toBe(0.05);
  });

  it("returns null for non-finite inputs", () => {
    expect(selectTidalLockEccentricity({ originalEccentricity: NaN, newEccentricity: 0.2 })).toBeNull();
    expect(selectTidalLockEccentricity({ originalEccentricity: 0.1, newEccentricity: Infinity })).toBeNull();
  });

  it("returns null when called with no arguments", () => {
    expect(selectTidalLockEccentricity()).toBeNull();
  });
});

// ── SEISMOLOGY ────────────────────────────────────────────────────────────────

describe("calculateResidualSeismicStress", () => {
  // Terra: Size 8, age 4.568 Gyr, Size-2 moon (DM+2 from moonSizes), density exactly 1.0 (no density DM)
  // 8 − 4.568 + 2 = 5.432 → floor = 5 → 5² = 25
  it("Terra canonical example: Size 8, 4.568 Gyr, Size-2 moon, density 1.0 → stress 25", () => {
    const result = calculateResidualSeismicStress({
      size: 8,
      ageGyr: 4.568,
      isMoon: false,
      moonSizes: [2],
      density: 1.0,
    });
    expect(result).not.toBeNull();
    expect(result.dms.moonDm).toBe(0);
    expect(result.dms.moonSizeDm).toBe(2);
    expect(result.dms.densityDm).toBe(0); // density === 1.0, not strictly > 1.0
    expect(result.dms.totalDm).toBe(2);
    expect(result.preSquare).toBe(5);
    expect(result.stress).toBe(25);
  });

  // Luna: Size 2, age 4.568 Gyr, is a moon of Terra (DM+1), no moons, density 0.6 (no density DM)
  // 2 − 4.568 + 1 = −1.568 → floor = −2 → < 1 → stress = 0
  it("Luna canonical example: Size 2, 4.568 Gyr, is a moon, density 0.6 → stress 0", () => {
    const result = calculateResidualSeismicStress({
      size: 2,
      ageGyr: 4.568,
      isMoon: true,
      moonSizes: [],
      density: 0.6,
    });
    expect(result).not.toBeNull();
    expect(result.dms.moonDm).toBe(1);
    expect(result.dms.densityDm).toBe(0); // density = 0.6, between 0.5 and 1.0
    expect(result.preSquare).toBeLessThan(1);
    expect(result.stress).toBe(0);
  });

  // Zed Prime: Size 5, age 6.3 Gyr, is a moon (DM+1), density 1.03 (DM+2 per table rule)
  // NOTE: The source text example shows "+1 (for density)" not "+2", giving 0.7→stress 0.
  // This implementation follows the explicit DM table (density > 1.0 → DM+2):
  //   5 − 6.3 + 1 + 2 = 1.7 → floor = 1 → 1² = 1
  it("Zed Prime with DM+2 density table rule: Size 5, 6.3 Gyr, is a moon, density 1.03 → stress 1", () => {
    const result = calculateResidualSeismicStress({
      size: 5,
      ageGyr: 6.3,
      isMoon: true,
      moonSizes: [],
      density: 1.03,
    });
    expect(result).not.toBeNull();
    expect(result.dms.moonDm).toBe(1);
    expect(result.dms.densityDm).toBe(2); // density > 1.0 → DM+2 per table
    expect(result.dms.totalDm).toBe(3);
    expect(result.preSquare).toBe(1);
    expect(result.stress).toBe(1);
  });

  it("moon-size DM is capped at +12 regardless of total moon sizes", () => {
    const result = calculateResidualSeismicStress({
      size: 10,
      ageGyr: 1.0,
      isMoon: false,
      moonSizes: [5, 5, 5, 5], // raw total 20, capped to 12
      density: 1.0,
    });
    expect(result.dms.rawMoonSizeDm).toBe(20);
    expect(result.dms.moonSizeDm).toBe(12);
    // 10 − 1 + 12 = 21 → floor = 21 → 21² = 441
    expect(result.stress).toBe(441);
  });

  it("density < 0.5 applies DM-1", () => {
    const result = calculateResidualSeismicStress({
      size: 5,
      ageGyr: 3.0,
      isMoon: false,
      moonSizes: [],
      density: 0.3,
    });
    expect(result.dms.densityDm).toBe(-1);
    // 5 − 3.0 − 1 = 1.0 → floor = 1 → 1² = 1
    expect(result.preSquare).toBe(1);
    expect(result.stress).toBe(1);
  });

  it("pre-square value < 1 yields stress 0 (floor = 0)", () => {
    // Size 4, age 3.1, no DMs → 4 − 3.1 = 0.9 → floor = 0 → stress = 0
    const result = calculateResidualSeismicStress({ size: 4, ageGyr: 3.1 });
    expect(result.preSquare).toBe(0);
    expect(result.stress).toBe(0);
  });

  it("pre-square value exactly 1 yields stress 1", () => {
    // Size 5, age 4.0, no DMs → 5 − 4.0 = 1.0 → floor = 1 → 1² = 1
    const result = calculateResidualSeismicStress({ size: 5, ageGyr: 4.0 });
    expect(result.preSquare).toBe(1);
    expect(result.stress).toBe(1);
  });

  it("size 0 world (asteroid) with high age returns stress 0", () => {
    const result = calculateResidualSeismicStress({ size: 0, ageGyr: 4.5 });
    expect(result.stress).toBe(0);
  });

  it("returns null when size is missing or NaN", () => {
    expect(calculateResidualSeismicStress({ ageGyr: 4.0 })).toBeNull();
    expect(calculateResidualSeismicStress({ size: NaN, ageGyr: 4.0 })).toBeNull();
  });

  it("returns null when ageGyr is missing or NaN", () => {
    expect(calculateResidualSeismicStress({ size: 5 })).toBeNull();
    expect(calculateResidualSeismicStress({ size: 5, ageGyr: NaN })).toBeNull();
  });

  it("returns null when called with no arguments", () => {
    expect(calculateResidualSeismicStress()).toBeNull();
  });

  it("ignores Size 0 moons (they contribute no DM)", () => {
    const result = calculateResidualSeismicStress({
      size: 6,
      ageGyr: 3.0,
      moonSizes: [0, 0, 0],
    });
    expect(result.dms.moonSizeDm).toBe(0);
    // 6 − 3 = 3 → floor = 3 → 3² = 9
    expect(result.stress).toBe(9);
  });
});
