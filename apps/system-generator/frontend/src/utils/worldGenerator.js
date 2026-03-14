/**
 * worldGenerator.js
 *
 * System Worlds and Orbits generation per the World Builder's Handbook.
 * Handles enumeration, placement, and sizing of all significant bodies
 * in a star system: gas giants, planetoid belts, and other worlds.
 */

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function roll1d(rng = Math.random) {
  return Math.floor(rng() * 6) + 1;
}

function roll2d(rng = Math.random) {
  return Math.floor(rng() * 6) + 1 + (Math.floor(rng() * 6) + 1);
}

function roll1d10(rng = Math.random) {
  return Math.floor(rng() * 10) + 1;
}

// â”€â”€ Basic World Sizing (WBH Tables 16/17) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE = Object.freeze({
  0: 0,
  R: 0,
  S: 600,
  1: 1600,
  2: 3200,
  3: 4800,
  4: 6400,
  5: 8000,
  6: 9600,
  7: 11200,
  8: 12800,
  9: 14400,
  A: 16000,
  B: 17600,
  C: 19200,
  D: 20800,
  E: 22400,
  F: 24000,
});

const TRAVELLER_EHEX_DIGITS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function toEHex(value) {
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized) || normalized < 0 || normalized >= TRAVELLER_EHEX_DIGITS.length) {
    return null;
  }

  return TRAVELLER_EHEX_DIGITS.charAt(normalized);
}

function fromEHex(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) {
    return null;
  }

  const index = TRAVELLER_EHEX_DIGITS.indexOf(normalized);
  return index >= 0 ? index : null;
}

function sizeCodeFromValue(value) {
  const normalized = Math.floor(Number(value));
  if (!Number.isFinite(normalized) || normalized < 0 || normalized > 15) {
    return null;
  }

  if (normalized < 10) {
    return String(normalized);
  }

  return String.fromCharCode("A".charCodeAt(0) + (normalized - 10));
}

function sizeValueFromCode(sizeCode) {
  const normalized = String(sizeCode ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/^[0-9]$/.test(normalized)) {
    return Number(normalized);
  }

  if (/^[A-F]$/.test(normalized)) {
    return normalized.charCodeAt(0) - "A".charCodeAt(0) + 10;
  }

  if (normalized === "S") {
    return null;
  }

  if (normalized === "R") {
    return null;
  }

  return null;
}

function normalizeBasicWorldSizeCode(sizeCodeOrValue) {
  if (sizeCodeOrValue == null) {
    return null;
  }

  if (typeof sizeCodeOrValue === "number") {
    return sizeCodeFromValue(sizeCodeOrValue);
  }

  const normalized = String(sizeCodeOrValue).trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE, normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Look up the basic terrestrial world diameter in kilometers for a size code.
 *
 * @param {string|number} sizeCodeOrValue
 * @returns {number|null}
 */
export function lookupBasicTerrestrialWorldDiameter(sizeCodeOrValue) {
  const sizeCode = normalizeBasicWorldSizeCode(sizeCodeOrValue);
  if (!sizeCode) {
    return null;
  }

  const diameter = BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE[sizeCode];
  return Number.isFinite(diameter) ? diameter : null;
}

/**
 * Roll a basic terrestrial world size per WBH Table 17.
 *
 * @param {{ rng?: Function }} [options]
 * @returns {{
 *   firstRoll: number,
 *   secondRollFormula: string,
 *   secondRoll: number,
 *   secondRollModifier: number,
 *   secondRollTotal: number,
 *   sizeCode: string,
 *   sizeValue: number,
 *   basicDiameterKm: number|null
 * }}
 */
export function rollBasicTerrestrialWorldSize({ rng = Math.random } = {}) {
  const firstRoll = roll1d(rng);

  let secondRollFormula = "1D";
  let secondRoll = 0;
  let secondRollModifier = 0;

  if (firstRoll <= 2) {
    secondRollFormula = "1D";
    secondRoll = roll1d(rng);
  } else if (firstRoll <= 4) {
    secondRollFormula = "2D";
    secondRoll = roll2d(rng);
  } else {
    secondRollFormula = "2D+3";
    secondRoll = roll2d(rng);
    secondRollModifier = 3;
  }

  const secondRollTotal = secondRoll + secondRollModifier;
  const sizeValue = Math.max(1, Math.min(15, secondRollTotal));
  const sizeCode = sizeCodeFromValue(sizeValue) ?? "1";

  return {
    firstRoll,
    secondRollFormula,
    secondRoll,
    secondRollModifier,
    secondRollTotal,
    sizeCode,
    sizeValue,
    basicDiameterKm: lookupBasicTerrestrialWorldDiameter(sizeCode),
  };
}

function roll3d(rng = Math.random) {
  return roll1d(rng) + roll1d(rng) + roll1d(rng);
}

function isPrimaryBrownDwarfForGasGiantSizing(primary) {
  const spectral = String(primary?.spectralClass ?? "")
    .trim()
    .toUpperCase();
  const type = String(primary?.type ?? "")
    .trim()
    .toUpperCase();
  const luminosityClass = String(primary?.luminosityClass ?? "")
    .trim()
    .toUpperCase();

  if (["L", "T", "Y"].includes(spectral.charAt(0))) {
    return true;
  }

  if (luminosityClass === "BD" || luminosityClass.includes("BROWN")) {
    return true;
  }

  return type.includes("BROWN DWARF");
}

function isPrimaryMTypeClassVForGasGiantSizing(primary) {
  const spectral = String(primary?.spectralClass ?? "")
    .trim()
    .toUpperCase();
  const luminosityClass = String(primary?.luminosityClass ?? "")
    .trim()
    .toUpperCase();

  return spectral.charAt(0) === "M" && luminosityClass === "V";
}

function isPrimaryClassVIForGasGiantSizing(primary) {
  const luminosityClass = String(primary?.luminosityClass ?? "")
    .trim()
    .toUpperCase();
  return luminosityClass === "VI";
}

/**
 * Calculate Table 18 gas giant sizing DMs.
 *
 * DMs:
 *   -1 primary is brown dwarf OR M-type class V OR any class VI
 *   -1 system spread is below 0.1
 *
 * @param {{ primary?: object, systemSpread?: number }} [options]
 * @returns {{ dm: number, breakdown: Array<string> }}
 */
export function calculateGasGiantSizingDm({ primary, systemSpread } = {}) {
  let dm = 0;
  const breakdown = [];

  if (
    isPrimaryBrownDwarfForGasGiantSizing(primary) ||
    isPrimaryMTypeClassVForGasGiantSizing(primary) ||
    isPrimaryClassVIForGasGiantSizing(primary)
  ) {
    dm -= 1;
    breakdown.push("DM-1: primary is BD, M-class V, or class VI");
  }

  if (Number.isFinite(systemSpread) && Number(systemSpread) < 0.1) {
    dm -= 1;
    breakdown.push("DM-1: system spread is below 0.1");
  }

  if (breakdown.length === 0) {
    breakdown.push("No DMs applicable");
  }

  return { dm, breakdown };
}

/**
 * Roll gas giant size category, diameter, and mass per WBH Table 18.
 *
 * @param {{ primary?: object, systemSpread?: number, rng?: Function }} [options]
 * @returns {{
 *   firstRoll: number,
 *   firstRollDm: number,
 *   firstRollTotal: number,
 *   dmBreakdown: Array<string>,
 *   category: 'small'|'medium'|'large',
 *   categoryCode: 'GS'|'GM'|'GL',
 *   diameterFormula: string,
 *   diameterRolls: Array<number>,
 *   diameterTerran: number,
 *   diameterCode: string,
 *   sahCode: string,
 *   massFormula: string,
 *   massRolls: Array<number>,
 *   massEarth: number,
 *   massCorrectionRoll: number|null,
 *   massInitialEarth: number
 * }}
 */
export function rollGasGiantSize({ primary, systemSpread, rng = Math.random } = {}) {
  const firstRoll = roll1d(rng);
  const dmResult = calculateGasGiantSizingDm({ primary, systemSpread });
  const firstRollTotal = firstRoll + dmResult.dm;

  let category = "small";
  let categoryCode = "GS";
  let diameterFormula = "D3 + D3";
  let diameterRolls = [];
  let diameterTerran = 0;
  let massFormula = "5 x (1D + 1)";
  let massRolls = [];
  let massInitialEarth = 0;
  let massEarth = 0;
  let massCorrectionRoll = null;

  if (firstRollTotal >= 5) {
    category = "large";
    categoryCode = "GL";
    diameterFormula = "2D + 6";
    const d2 = roll2d(rng);
    diameterRolls = [d2];
    diameterTerran = d2 + 6;

    const d3MultiplierResult = rollD3({ rng });
    const d3Mass = roll3d(rng);
    massFormula = "D3 x 50 x (3D + 4)";
    massRolls = [d3MultiplierResult.roll, d3Mass];
    massInitialEarth = d3MultiplierResult.roll * 50 * (d3Mass + 4);
    massEarth = massInitialEarth;

    if (massInitialEarth >= 3000 && d3Mass >= 15) {
      const correction2d = roll2d(rng);
      massCorrectionRoll = correction2d - 2;
      massEarth = 4000 - massCorrectionRoll * 200;
    }
  } else if (firstRollTotal >= 3) {
    category = "medium";
    categoryCode = "GM";
    diameterFormula = "1D + 6";
    const d1 = roll1d(rng);
    diameterRolls = [d1];
    diameterTerran = d1 + 6;

    const d3Mass = roll3d(rng);
    massFormula = "20 x (3D - 1)";
    massRolls = [d3Mass];
    massInitialEarth = 20 * (d3Mass - 1);
    massEarth = massInitialEarth;
  } else {
    category = "small";
    categoryCode = "GS";
    diameterFormula = "D3 + D3";
    const firstD3 = rollD3({ rng });
    const secondD3 = rollD3({ rng });
    diameterRolls = [firstD3.roll, secondD3.roll];
    diameterTerran = firstD3.roll + secondD3.roll;

    const d1Mass = roll1d(rng);
    massFormula = "5 x (1D + 1)";
    massRolls = [d1Mass];
    massInitialEarth = 5 * (d1Mass + 1);
    massEarth = massInitialEarth;
  }

  const diameterCode = toEHex(diameterTerran) ?? String(diameterTerran);
  const sahCode = `${categoryCode}${diameterCode}`;

  return {
    firstRoll,
    firstRollDm: dmResult.dm,
    firstRollTotal,
    dmBreakdown: dmResult.breakdown,
    category,
    categoryCode,
    diameterFormula,
    diameterRolls,
    diameterTerran,
    diameterCode,
    sahCode,
    massFormula,
    massRolls,
    massEarth,
    massCorrectionRoll,
    massInitialEarth,
  };
}

// â”€â”€ Significant Moon Quantity (WBH Table 19) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function rollNd(diceCount, rng = Math.random) {
  const count = Math.max(0, Math.floor(Number(diceCount) || 0));
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += roll1d(rng);
  }
  return total;
}

function secondaryIndexFromStarKey(starKey) {
  const match = String(starKey ?? "").match(/^secondary-(\d+)$/);
  if (!match) return -1;
  return Number(match[1]) - 1;
}

function resolveSpreadForMoonAdjacency(starKey, systemSpread, secondarySpreads = []) {
  if (starKey === "primary") {
    return Number.isFinite(systemSpread) ? Number(systemSpread) : 0;
  }

  const spreadRecord = secondarySpreads.find((item) => item?.starKey === starKey);
  if (Number.isFinite(spreadRecord?.spread)) {
    return Number(spreadRecord.spread);
  }

  return Number.isFinite(systemSpread) ? Number(systemSpread) : 0;
}

function isSignificantMoonCandidatePrimaryWorldType(primaryWorldType) {
  const normalized = String(primaryWorldType ?? "")
    .trim()
    .toLowerCase();
  return normalized === "terrestrialplanet" || normalized === "mainworld" || normalized === "gasgiant";
}

/**
 * Resolve Table 19 moon-quantity dice profile from world size.
 *
 * @param {{ primaryWorldType?: string, sizeCode?: string }} [options]
 * @returns {{ diceCount: number, baseModifier: number, formula: string, source: string }|null}
 */
export function resolveSignificantMoonQuantityProfile({ primaryWorldType, sizeCode } = {}) {
  const normalizedType = String(primaryWorldType ?? "")
    .trim()
    .toLowerCase();
  const normalizedSizeCode = String(sizeCode ?? "")
    .trim()
    .toUpperCase();

  const gasGiantMatch = normalizedSizeCode.match(/^G([SML])[0-9A-HJ-NP-Z]$/);
  const isGasGiant = normalizedType === "gasgiant" || Boolean(gasGiantMatch);

  if (isGasGiant) {
    const categoryCode = gasGiantMatch ? gasGiantMatch[1] : null;
    if (categoryCode === "S") {
      return {
        diceCount: 3,
        baseModifier: -7,
        formula: "3D-7",
        source: "small-gas-giant",
      };
    }

    if (categoryCode === "M" || categoryCode === "L") {
      return {
        diceCount: 4,
        baseModifier: -6,
        formula: "4D-6",
        source: "medium-large-gas-giant",
      };
    }

    return null;
  }

  const terrestrialCode = normalizeBasicWorldSizeCode(normalizedSizeCode);
  const sizeValue = sizeValueFromCode(terrestrialCode);
  if (!Number.isFinite(sizeValue)) {
    return null;
  }

  if (sizeValue >= 1 && sizeValue <= 2) {
    return {
      diceCount: 1,
      baseModifier: -5,
      formula: "1D-5",
      source: "size-1-2",
    };
  }

  if (sizeValue >= 3 && sizeValue <= 9) {
    return {
      diceCount: 2,
      baseModifier: -8,
      formula: "2D-8",
      source: "size-3-9",
    };
  }

  if (sizeValue >= 10 && sizeValue <= 15) {
    return {
      diceCount: 2,
      baseModifier: -6,
      formula: "2D-6",
      source: "size-A-F",
    };
  }

  return null;
}

/**
 * Calculate the Table 19 DM-per-die for a specific world slot.
 *
 * A single DM-per-die trigger applies even if multiple conditions match.
 *
 * @param {{
 *   slot?: object,
 *   primary?: object,
 *   secondaries?: Array<object>,
 *   availableOrbits?: object,
 *   systemSpread?: number,
 *   secondarySpreads?: Array<object>,
 *   useHillSphereDmRule?: boolean
 * }} [options]
 * @returns {{ dmPerDie: number, applies: boolean, spread: number, conditions: Array<string> }}
 */
export function calculateSignificantMoonDmPerDie({
  slot,
  primary,
  secondaries = [],
  availableOrbits,
  systemSpread,
  secondarySpreads = [],
  useHillSphereDmRule = false,
} = {}) {
  const orbit = Number(slot?.orbit);
  const starKey = String(slot?.starKey ?? "primary");
  const spread = Math.max(0, resolveSpreadForMoonAdjacency(starKey, systemSpread, secondarySpreads));
  const conditions = [];

  if (useHillSphereDmRule) {
    const hillSphereDiameters = Number(slot?.hillSpherePlanetaryDiameters ?? slot?.hillSphereDiameters);
    if (Number.isFinite(hillSphereDiameters) && hillSphereDiameters < 60) {
      conditions.push("hill-sphere-below-60");
    }

    const applies = conditions.length > 0;
    return {
      dmPerDie: applies ? -1 : 0,
      applies,
      spread,
      conditions,
    };
  }

  if (Number.isFinite(orbit) && orbit < 1) {
    conditions.push("orbit-below-one");
  }

  // Adjacent to a companion-driven minimum orbit boundary for the same parent star.
  if (Number.isFinite(orbit) && spread > 0) {
    if (starKey === "primary") {
      const primaryMinOrbit = Number.isFinite(availableOrbits?.primaryOrbits?.[0]?.min)
        ? Number(availableOrbits.primaryOrbits[0].min)
        : null;
      if (primary?.companion && Number.isFinite(primaryMinOrbit) && Math.abs(orbit - primaryMinOrbit) <= spread) {
        conditions.push("adjacent-to-companion-boundary");
      }
    } else {
      const secondaryIndex = secondaryIndexFromStarKey(starKey);
      const secondary = secondaries[secondaryIndex];
      const secondaryMinOrbit = Number.isFinite(availableOrbits?.secondaryOrbits?.[secondaryIndex]?.min)
        ? Number(availableOrbits.secondaryOrbits[secondaryIndex].min)
        : null;
      if (secondary?.companion && Number.isFinite(secondaryMinOrbit) && Math.abs(orbit - secondaryMinOrbit) <= spread) {
        conditions.push("adjacent-to-companion-boundary");
      }
    }
  }

  // Primary (or pair) slot adjacent to Close/Near star unavailability boundaries.
  if (Number.isFinite(orbit) && spread > 0 && starKey === "primary") {
    for (let index = 0; index < secondaries.length; index++) {
      const secondary = secondaries[index];
      const zone = normalizeSecondaryZone(secondary?.zone ?? secondary?.orbitType);
      if (zone !== "close" && zone !== "near") {
        continue;
      }

      const secondaryMao = Number.isFinite(availableOrbits?.secondaryOrbits?.[index]?.mao)
        ? Number(availableOrbits.secondaryOrbits[index].mao)
        : lookupMinimumAllowableOrbit(secondary?.spectralClass, secondary?.luminosityClass);
      const exclusion = calcPrimaryExclusion(secondary, secondaryMao);
      if (Math.abs(orbit - exclusion.from) <= spread || Math.abs(orbit - exclusion.to) <= spread) {
        conditions.push("adjacent-to-close-near-unavailability");
        break;
      }
    }
  }

  // Slot adjacent to the outermost orbit range of a Close/Near/Far star.
  if (Number.isFinite(orbit) && spread > 0 && starKey !== "primary") {
    const secondaryIndex = secondaryIndexFromStarKey(starKey);
    const secondary = secondaries[secondaryIndex];
    const zone = normalizeSecondaryZone(secondary?.zone ?? secondary?.orbitType);
    const outerRange = Number(availableOrbits?.secondaryOrbits?.[secondaryIndex]?.max);
    if (
      ["close", "near", "far"].includes(zone) &&
      Number.isFinite(outerRange) &&
      Math.abs(orbit - outerRange) <= spread
    ) {
      conditions.push("adjacent-to-outermost-range");
    }
  }

  const applies = conditions.length > 0;
  return {
    dmPerDie: applies ? -1 : 0,
    applies,
    spread,
    conditions,
  };
}

/**
 * Roll significant moon quantity (Table 19) for a world slot.
 *
 * @param {{
 *   slot?: object,
 *   primary?: object,
 *   secondaries?: Array<object>,
 *   availableOrbits?: object,
 *   systemSpread?: number,
 *   secondarySpreads?: Array<object>,
 *   useHillSphereDmRule?: boolean,
 *   rng?: Function
 * }} [options]
 * @returns {{
 *   eligible: boolean,
 *   formula: string|null,
 *   profileSource: string|null,
 *   diceCount: number,
 *   baseModifier: number,
 *   dmPerDie: number,
 *   totalDm: number,
 *   diceTotal: number,
 *   total: number,
 *   significantMoonCount: number,
 *   hasSignificantRing: boolean,
 *   conditions: Array<string>
 * }}
 */
export function rollSignificantMoonQuantityForSlot({
  slot,
  primary,
  secondaries = [],
  availableOrbits,
  systemSpread,
  secondarySpreads = [],
  useHillSphereDmRule = false,
  rng = Math.random,
} = {}) {
  const profile = resolveSignificantMoonQuantityProfile({
    primaryWorldType: slot?.primaryWorldType,
    sizeCode: slot?.sizeCode,
  });

  if (!profile) {
    return {
      eligible: false,
      formula: null,
      profileSource: null,
      diceCount: 0,
      baseModifier: 0,
      dmPerDie: 0,
      totalDm: 0,
      diceTotal: 0,
      total: 0,
      significantMoonCount: 0,
      hasSignificantRing: false,
      conditions: [],
    };
  }

  const dmResult = calculateSignificantMoonDmPerDie({
    slot,
    primary,
    secondaries,
    availableOrbits,
    systemSpread,
    secondarySpreads,
    useHillSphereDmRule,
  });

  const diceTotal = rollNd(profile.diceCount, rng);
  const totalDm = dmResult.dmPerDie * profile.diceCount;
  const total = diceTotal + profile.baseModifier + totalDm;

  return {
    eligible: true,
    formula: profile.formula,
    profileSource: profile.source,
    diceCount: profile.diceCount,
    baseModifier: profile.baseModifier,
    dmPerDie: dmResult.dmPerDie,
    totalDm,
    diceTotal,
    total,
    significantMoonCount: total > 0 ? total : 0,
    hasSignificantRing: total === 0,
    conditions: dmResult.conditions,
  };
}

/**
 * Assign significant moon quantities and ring flags to placed world slots.
 *
 * @param {{
 *   slots?: Array<object>,
 *   primary?: object,
 *   secondaries?: Array<object>,
 *   availableOrbits?: object,
 *   systemSpread?: number,
 *   secondarySpreads?: Array<object>,
 *   useHillSphereDmRule?: boolean,
 *   rng?: Function
 * }} [options]
 * @returns {{
 *   slots: Array<object>,
 *   moonRolls: Record<string, object>,
 *   totals: {
 *     significantMoons: number,
 *     ringWorlds: number,
 *     rolledWorlds: number
 *   }
 * }}
 */
export function assignSignificantMoonQuantities({
  slots = [],
  primary,
  secondaries = [],
  availableOrbits,
  systemSpread,
  secondarySpreads = [],
  useHillSphereDmRule = false,
  rng = Math.random,
} = {}) {
  const moonRolls = {};
  let significantMoons = 0;
  let ringWorlds = 0;
  let rolledWorlds = 0;

  const updatedSlots = slots.map((slot, index) => {
    const slotId = String(slot?.slotId ?? `slot-${index}`);
    if (!isSignificantMoonCandidatePrimaryWorldType(slot?.primaryWorldType)) {
      return slot;
    }

    const moonRoll = rollSignificantMoonQuantityForSlot({
      slot,
      primary,
      secondaries,
      availableOrbits,
      systemSpread,
      secondarySpreads,
      useHillSphereDmRule,
      rng,
    });

    if (!moonRoll.eligible) {
      return slot;
    }

    moonRolls[slotId] = moonRoll;
    rolledWorlds += 1;
    significantMoons += moonRoll.significantMoonCount;
    if (moonRoll.hasSignificantRing) {
      ringWorlds += 1;
    }

    return {
      ...slot,
      significantMoonQuantity: moonRoll.significantMoonCount,
      hasSignificantRing: moonRoll.hasSignificantRing,
      significantMoonRoll: moonRoll,
    };
  });

  return {
    slots: updatedSlots,
    moonRolls,
    totals: {
      significantMoons,
      ringWorlds,
      rolledWorlds,
    },
  };
}

// â”€â”€ Significant Moon Sizing (WBH Tables 20/21) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GAS_GIANT_CATEGORY_RANK = Object.freeze({
  S: 1,
  M: 2,
  L: 3,
});

function parseGasGiantSizeCodeMetadata(slot) {
  const rawSizeCode = String(slot?.sizeCode ?? "")
    .trim()
    .toUpperCase();
  const sizeMatch = rawSizeCode.match(/^G([SML])([0-9A-HJ-NP-Z])$/);

  const categoryCode = String(slot?.gasGiantCategoryCode ?? (sizeMatch ? `G${sizeMatch[1]}` : ""))
    .trim()
    .toUpperCase();
  const category = categoryCode.replace(/^G/, "");

  const diameterCode = String(slot?.gasGiantDiameterCode ?? (sizeMatch ? sizeMatch[2] : ""))
    .trim()
    .toUpperCase();
  const diameterFromCode = fromEHex(diameterCode);
  const diameterTerran = Number.isFinite(slot?.gasGiantDiameterTerran)
    ? Number(slot.gasGiantDiameterTerran)
    : Number.isFinite(diameterFromCode)
      ? Number(diameterFromCode)
      : null;

  if (!category || !["S", "M", "L"].includes(category)) {
    return null;
  }

  return {
    category,
    categoryCode: `G${category}`,
    diameterCode,
    diameterTerran,
  };
}

function resolveSignificantMoonParentProfile(slot) {
  const primaryWorldType = String(slot?.primaryWorldType ?? "")
    .trim()
    .toLowerCase();
  const gasGiantMeta = parseGasGiantSizeCodeMetadata(slot);

  if (primaryWorldType === "gasgiant" || gasGiantMeta) {
    return {
      parentType: "gasGiant",
      gasGiant: gasGiantMeta,
      terrestrialSizeValue: null,
    };
  }

  const terrestrialSizeValue = sizeValueFromCode(slot?.sizeCode);
  if (Number.isFinite(terrestrialSizeValue)) {
    return {
      parentType: "terrestrial",
      gasGiant: null,
      terrestrialSizeValue,
    };
  }

  return {
    parentType: null,
    gasGiant: null,
    terrestrialSizeValue: null,
  };
}

function buildSignificantMoonRingCode(ringCount) {
  const normalized = Math.max(0, Math.floor(Number(ringCount) || 0));
  if (normalized <= 0) {
    return null;
  }

  return `R${String(normalized).padStart(2, "0")}`;
}

function buildTerrestrialMoonOutcome(sizeValue, { source, firstRoll, rollTrace = {} } = {}) {
  if (!Number.isFinite(sizeValue) || sizeValue < 0) {
    return {
      source,
      firstRoll,
      rollTrace,
      isRing: false,
      isGasGiantMoon: false,
      sizeCode: "S",
      sizeValue: null,
    };
  }

  if (sizeValue === 0) {
    return {
      source,
      firstRoll,
      rollTrace,
      isRing: true,
      isGasGiantMoon: false,
      sizeCode: "R",
      sizeValue: 0,
    };
  }

  const clampedValue = Math.max(1, Math.min(15, Math.floor(sizeValue)));
  return {
    source,
    firstRoll,
    rollTrace,
    isRing: false,
    isGasGiantMoon: false,
    sizeCode: sizeCodeFromValue(clampedValue) ?? "S",
    sizeValue: clampedValue,
  };
}

function rollGasGiantMoonByCategory(category, rng) {
  if (category === "M") {
    const diameterRoll = roll1d(rng);
    const diameterTerran = diameterRoll + 6;
    const massRoll = roll3d(rng);
    const massEarth = 20 * (massRoll - 1);
    return {
      category: "M",
      diameterRolls: [diameterRoll],
      diameterTerran,
      diameterCode: toEHex(diameterTerran) ?? String(diameterTerran),
      massRolls: [massRoll],
      massEarth,
      massFormula: "20 x (3D - 1)",
    };
  }

  const firstD3 = rollD3({ rng }).roll;
  const secondD3 = rollD3({ rng }).roll;
  const diameterTerran = firstD3 + secondD3;
  const massRoll = roll1d(rng);
  const massEarth = 5 * (massRoll + 1);
  return {
    category: "S",
    diameterRolls: [firstD3, secondD3],
    diameterTerran,
    diameterCode: toEHex(diameterTerran) ?? String(diameterTerran),
    massRolls: [massRoll],
    massEarth,
    massFormula: "5 x (1D + 1)",
  };
}

function rollSpecialGasGiantMoonOutcome(parentGasGiant, firstRoll, rng) {
  const specialRoll = roll1d(rng);

  if (specialRoll <= 3) {
    const secondRoll = roll1d(rng);
    const sizeValue = secondRoll <= 3 ? 1 : 2;
    return buildTerrestrialMoonOutcome(sizeValue, {
      source: "table21-1-3",
      firstRoll,
      rollTrace: {
        specialRoll,
        secondRoll,
      },
    });
  }

  if (specialRoll <= 5) {
    const secondRoll = rollD3({ rng }).roll;
    const sizeValue = secondRoll - 1;
    return buildTerrestrialMoonOutcome(sizeValue, {
      source: "table21-4-5",
      firstRoll,
      rollTrace: {
        specialRoll,
        secondRoll,
      },
    });
  }

  const secondRoll = roll2d(rng) + 4;
  if (secondRoll < 16) {
    return buildTerrestrialMoonOutcome(secondRoll, {
      source: "table21-6-large-terrestrial",
      firstRoll,
      rollTrace: {
        specialRoll,
        secondRoll,
      },
    });
  }

  const parentCategory = parentGasGiant?.category ?? "M";
  const parentRank = GAS_GIANT_CATEGORY_RANK[parentCategory] ?? 0;
  const parentDiameter = Number(parentGasGiant?.diameterTerran);

  if (parentRank <= GAS_GIANT_CATEGORY_RANK.S) {
    // Parent is a small giant, so a smaller gas-giant moon category does not exist.
    const fallbackSize = Number.isFinite(parentDiameter) ? Math.max(1, Math.min(15, parentDiameter - 1)) : 15;
    return buildTerrestrialMoonOutcome(fallbackSize, {
      source: "table21-6-demoted",
      firstRoll,
      rollTrace: {
        specialRoll,
        secondRoll,
      },
    });
  }

  let moonCategory = "S";
  let promotionRoll = null;
  if (parentCategory === "L") {
    promotionRoll = roll2d(rng);
    if (promotionRoll === 12) {
      moonCategory = "M";
    }
  }

  if (moonCategory === "M" && Number.isFinite(parentDiameter) && parentDiameter <= 7) {
    moonCategory = "S";
  }

  const giantMoon = rollGasGiantMoonByCategory(moonCategory, rng);
  let adjustedDiameter = giantMoon.diameterTerran;

  if (Number.isFinite(parentDiameter) && adjustedDiameter >= parentDiameter) {
    adjustedDiameter = Math.max(1, parentDiameter - 1);
  }

  return {
    source: "table21-6-gas-giant",
    firstRoll,
    rollTrace: {
      specialRoll,
      secondRoll,
      promotionRoll,
    },
    isRing: false,
    isGasGiantMoon: true,
    sizeCode: `G${giantMoon.category}${toEHex(adjustedDiameter) ?? String(adjustedDiameter)}`,
    sizeValue: null,
    gasGiantCategoryCode: `G${giantMoon.category}`,
    gasGiantDiameterTerran: adjustedDiameter,
    gasGiantDiameterCode: toEHex(adjustedDiameter) ?? String(adjustedDiameter),
    gasGiantMassEarth: giantMoon.massEarth,
    gasGiantMassFormula: giantMoon.massFormula,
    gasGiantDiameterRolls: giantMoon.diameterRolls,
    gasGiantMassRolls: giantMoon.massRolls,
  };
}

/**
 * Roll one significant moon size outcome for a specific parent world.
 *
 * @param {{ slot?: object, rng?: Function }} [options]
 * @returns {{
 *   source: string,
 *   firstRoll: number,
 *   rollTrace: object,
 *   isRing: boolean,
 *   isGasGiantMoon: boolean,
 *   sizeCode: string,
 *   sizeValue: number|null,
 *   gasGiantCategoryCode?: string,
 *   gasGiantDiameterTerran?: number,
 *   gasGiantDiameterCode?: string,
 *   gasGiantMassEarth?: number
 * }}
 */
export function rollSignificantMoonSizeForParent({ slot, rng = Math.random } = {}) {
  const parent = resolveSignificantMoonParentProfile(slot);
  const firstRoll = roll1d(rng);

  if (firstRoll <= 3) {
    return {
      source: "table20-1-3",
      firstRoll,
      rollTrace: {},
      isRing: false,
      isGasGiantMoon: false,
      sizeCode: "S",
      sizeValue: null,
    };
  }

  if (firstRoll <= 5) {
    const secondRoll = rollD3({ rng }).roll;
    return buildTerrestrialMoonOutcome(secondRoll - 1, {
      source: "table20-4-5",
      firstRoll,
      rollTrace: {
        secondRoll,
      },
    });
  }

  if (parent.parentType === "gasGiant") {
    return rollSpecialGasGiantMoonOutcome(parent.gasGiant, firstRoll, rng);
  }

  const parentSizeValue = Number(parent.terrestrialSizeValue);
  if (!Number.isFinite(parentSizeValue) || parentSizeValue <= 0) {
    return {
      source: "table20-6-unknown-parent",
      firstRoll,
      rollTrace: {},
      isRing: false,
      isGasGiantMoon: false,
      sizeCode: "S",
      sizeValue: null,
    };
  }

  const secondRoll = roll1d(rng);
  let moonSizeValue = parentSizeValue - 1 - secondRoll;
  const rollTrace = {
    secondRoll,
  };

  if (moonSizeValue > 0) {
    moonSizeValue = Math.min(moonSizeValue, parentSizeValue);
  }

  if (moonSizeValue === parentSizeValue - 2 && parentSizeValue >= 2) {
    const twinRoll = roll2d(rng);
    rollTrace.twinRoll = twinRoll;
    if (twinRoll === 2) {
      moonSizeValue = parentSizeValue - 1;
    } else if (twinRoll === 12) {
      moonSizeValue = parentSizeValue;
    }
  }

  return buildTerrestrialMoonOutcome(moonSizeValue, {
    source: "table20-6-terrestrial",
    firstRoll,
    rollTrace,
  });
}

/**
 * Assign significant moon size outcomes for worlds that have Step 10 moon/ring results.
 *
 * @param {{ slots?: Array<object>, rng?: Function }} [options]
 * @returns {{
 *   slots: Array<object>,
 *   sizingRolls: Record<string, Array<object>>,
 *   totals: {
 *     sizedWorlds: number,
 *     significantMoonsAfterSizing: number,
 *     significantRings: number,
 *     gasGiantMoons: number,
 *     worldsWithRings: number
 *   }
 * }}
 */
export function assignSignificantMoonSizes({ slots = [], rng = Math.random } = {}) {
  const sizingRolls = {};
  let sizedWorlds = 0;
  let significantMoonsAfterSizing = 0;
  let significantRings = 0;
  let gasGiantMoons = 0;
  let worldsWithRings = 0;

  const updatedSlots = slots.map((slot, index) => {
    const slotId = String(slot?.slotId ?? `slot-${index}`);
    const significantMoonQuantity = Math.max(0, Math.floor(Number(slot?.significantMoonQuantity) || 0));
    const hasStep10Ring = Boolean(slot?.hasSignificantRing);
    const needsSizing = significantMoonQuantity > 0 || hasStep10Ring;

    if (!needsSizing) {
      return slot;
    }

    sizedWorlds += 1;

    const moonOutcomes = [];
    if (hasStep10Ring) {
      moonOutcomes.push({
        source: "table19-ring",
        firstRoll: null,
        rollTrace: {},
        isRing: true,
        isGasGiantMoon: false,
        sizeCode: "R",
        sizeValue: 0,
      });
    }

    for (let i = 0; i < significantMoonQuantity; i++) {
      moonOutcomes.push(rollSignificantMoonSizeForParent({ slot, rng }));
    }

    sizingRolls[slotId] = moonOutcomes;

    const moonSizeCodes = moonOutcomes.map((moon) => moon.sizeCode);
    const ringCount = moonOutcomes.filter((moon) => moon.isRing).length;
    const nonRingCount = moonOutcomes.length - ringCount;
    const gasGiantMoonCount = moonOutcomes.filter((moon) => moon.isGasGiantMoon).length;

    significantRings += ringCount;
    significantMoonsAfterSizing += nonRingCount;
    gasGiantMoons += gasGiantMoonCount;
    if (ringCount > 0) {
      worldsWithRings += 1;
    }

    return {
      ...slot,
      significantMoonSizes: moonSizeCodes,
      significantMoonSizeDetails: moonOutcomes,
      significantRingCount: ringCount,
      significantRingCode: buildSignificantMoonRingCode(ringCount),
      significantMoonCountAfterSizing: nonRingCount,
      significantGasGiantMoonCount: gasGiantMoonCount,
    };
  });

  return {
    slots: updatedSlots,
    sizingRolls,
    totals: {
      sizedWorlds,
      significantMoonsAfterSizing,
      significantRings,
      gasGiantMoons,
      worldsWithRings,
    },
  };
}

// â”€â”€ Significant Moon and Ring Characteristics (WBH Chapter 5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AU_IN_KM = 149597870.9;
const EARTH_MASS_TO_SOLAR_MASS = 0.000003;
const DEFAULT_ROCHE_DENSITY_RATIO = 2;
const DEFAULT_ROCHE_LIMIT_PD = 1.22 * Math.cbrt(DEFAULT_ROCHE_DENSITY_RATIO); // ~1.537

/**
 * Calculate moon-orbit limits using Hill sphere and Roche limit approximations.
 *
 * Hill Sphere (AU):
 *   AU x (1 - ecc) x cbrt(m / (3 x M))
 *   where m is planet mass in solar units (Earth mass x 0.000003)
 *
 * Hill Sphere (PD):
 *   HillSphere(AU) x 149,597,870.9 / PlanetDiameter(km)
 *
 * Hill Sphere Moon Limit:
 *   HillSphere(PD) / 2
 *
 * Roche Limit (PD):
 *   1.22 x cbrt(primaryDensity / secondaryDensity)
 *   or simplified default with density ratio 2 (~1.537 PD)
 *
 * @param {object} options
 * @param {number} options.orbitalDistanceAu
 * @param {number} [options.eccentricity=0]
 * @param {number} options.planetMassEarth
 * @param {number} options.starMassSolar
 * @param {number} options.planetDiameterKm
 * @param {number} [options.primaryDensity]
 * @param {number} [options.secondaryDensity]
 * @param {number} [options.defaultDensityRatio=2]
 * @returns {{
 *   hillSphereAu: number,
 *   hillSphereKm: number,
 *   hillSpherePd: number,
 *   hillSphereMoonLimitPd: number,
 *   hillSphereMoonLimitPdRoundedDown: number,
 *   rocheLimitPd: number,
 * } | null}
 */
export function calculateMoonOrbitLimits({
  orbitalDistanceAu,
  eccentricity = 0,
  planetMassEarth,
  starMassSolar,
  planetDiameterKm,
  primaryDensity,
  secondaryDensity,
  defaultDensityRatio = DEFAULT_ROCHE_DENSITY_RATIO,
} = {}) {
  const distanceAu = Number(orbitalDistanceAu);
  const ecc = Number(eccentricity);
  const massEarth = Number(planetMassEarth);
  const massSolar = Number(starMassSolar);
  const diameterKm = Number(planetDiameterKm);

  if (
    !Number.isFinite(distanceAu) ||
    !Number.isFinite(ecc) ||
    !Number.isFinite(massEarth) ||
    !Number.isFinite(massSolar) ||
    !Number.isFinite(diameterKm) ||
    massSolar <= 0 ||
    diameterKm <= 0 ||
    distanceAu < 0
  ) {
    return null;
  }

  const planetMassSolar = Math.max(0, massEarth) * EARTH_MASS_TO_SOLAR_MASS;
  const hillSphereAu = distanceAu * Math.max(0, 1 - ecc) * Math.cbrt(planetMassSolar / (3 * massSolar));
  const hillSphereKm = hillSphereAu * AU_IN_KM;
  const hillSpherePd = hillSphereKm / diameterKm;
  const hillSphereMoonLimitPd = hillSpherePd / 2;

  let rocheLimitPd;
  if (
    Number.isFinite(primaryDensity) &&
    Number.isFinite(secondaryDensity) &&
    primaryDensity > 0 &&
    secondaryDensity > 0
  ) {
    rocheLimitPd = 1.22 * Math.cbrt(primaryDensity / secondaryDensity);
  } else {
    rocheLimitPd = 1.22 * Math.cbrt(Math.max(0.0001, Number(defaultDensityRatio) || DEFAULT_ROCHE_DENSITY_RATIO));
  }

  return {
    hillSphereAu,
    hillSphereKm,
    hillSpherePd,
    hillSphereMoonLimitPd,
    hillSphereMoonLimitPdRoundedDown: Math.floor(hillSphereMoonLimitPd),
    rocheLimitPd,
  };
}

/**
 * Apply moon/ring removals when the Hill sphere moon limit is too small.
 *
 * Rules:
 * - If limit < 1.5 PD: no significant moons remain.
 *   The first lost moon becomes an additional significant ring.
 * - If limit < 0.5 PD: no significant rings can remain either.
 *
 * @param {object} options
 * @param {number} options.hillSphereMoonLimitPd
 * @param {number} [options.significantMoonCount=0]
 * @param {number} [options.significantRingCount=0]
 * @returns {{
 *   significantMoonCount: number,
 *   significantRingCount: number,
 *   removedMoons: number,
 *   convertedFirstMoonToRing: boolean,
 *   noSignificantRingsAllowed: boolean,
 * }}
 */
export function applyMoonRemovalByLimits({
  hillSphereMoonLimitPd,
  significantMoonCount = 0,
  significantRingCount = 0,
} = {}) {
  const limit = Number(hillSphereMoonLimitPd);
  let moons = Math.max(0, Math.floor(Number(significantMoonCount) || 0));
  let rings = Math.max(0, Math.floor(Number(significantRingCount) || 0));

  let convertedFirstMoonToRing = false;
  let noSignificantRingsAllowed = false;
  const removedMoons = moons;

  if (Number.isFinite(limit) && limit < 1.5) {
    if (moons > 0) {
      rings += 1;
      convertedFirstMoonToRing = true;
    }
    moons = 0;
  }

  if (Number.isFinite(limit) && limit < 0.5) {
    rings = 0;
    noSignificantRingsAllowed = true;
  }

  return {
    significantMoonCount: moons,
    significantRingCount: rings,
    removedMoons,
    convertedFirstMoonToRing,
    noSignificantRingsAllowed,
  };
}

/**
 * Calculate Moon Orbit Range (MOR).
 *
 * MOR = floor(HillSphereMoonLimitPd) - 2
 * If MOR > 200, use min(MOR, 200 + moonCount).
 *
 * @param {object} options
 * @param {number} options.hillSphereMoonLimitPd
 * @param {number} [options.moonCount=0]
 * @returns {{ rawMor: number, mor: number }}
 */
export function calculateMoonOrbitRangeMor({ hillSphereMoonLimitPd, moonCount = 0 } = {}) {
  const rawMor = Math.floor(Number(hillSphereMoonLimitPd) || 0) - 2;
  const boundedMor = rawMor > 200 ? Math.min(rawMor, 200 + Math.max(0, Math.floor(Number(moonCount) || 0))) : rawMor;
  return {
    rawMor,
    mor: Math.max(0, boundedMor),
  };
}

function classifyMoonOrbitRange(rangeRollTotal) {
  if (rangeRollTotal <= 3) return "inner";
  if (rangeRollTotal <= 5) return "middle";
  return "outer";
}

/**
 * Roll one significant moon orbit in planetary diameters (PD).
 *
 * Table 28 range roll: 1D (+1 DM when MOR < 60)
 * Inner:  (2D-2) x MOR / 60 + 2
 * Middle: (2D-2) x MOR / 30 + MOR/6 + 3
 * Outer:  (2D-2) x MOR / 20 + MOR/2 + 4
 *
 * Optional linear variance in [-0.5, +0.5) PD can be added.
 *
 * @param {object} options
 * @param {number} options.mor
 * @param {boolean} [options.addLinearVariance=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   mor: number,
 *   rangeRoll: number,
 *   rangeDm: number,
 *   rangeRollTotal: number,
 *   range: 'inner'|'middle'|'outer',
 *   orbitRoll: number,
 *   orbitPd: number,
 *   roundedOrbitPd: number,
 *   variance: number,
 *   exceedsMor: boolean,
 * } | null}
 */
export function rollMoonOrbitPd({ mor, addLinearVariance = false, rng = Math.random } = {}) {
  const morValue = Number(mor);
  if (!Number.isFinite(morValue) || morValue <= 0) return null;

  const rangeRoll = roll1d(rng);
  const rangeDm = morValue < 60 ? 1 : 0;
  const rangeRollTotal = rangeRoll + rangeDm;
  const range = classifyMoonOrbitRange(rangeRollTotal);

  const orbitRoll = roll2d(rng) - 2;
  let orbitPd;
  if (range === "inner") {
    orbitPd = (orbitRoll * morValue) / 60 + 2;
  } else if (range === "middle") {
    orbitPd = (orbitRoll * morValue) / 30 + morValue / 6 + 3;
  } else {
    orbitPd = (orbitRoll * morValue) / 20 + morValue / 2 + 4;
  }

  const variance = addLinearVariance ? rng() - 0.5 : 0;
  orbitPd += variance;

  return {
    mor: morValue,
    rangeRoll,
    rangeDm,
    rangeRollTotal,
    range,
    orbitRoll,
    orbitPd,
    roundedOrbitPd: Math.round(orbitPd),
    variance,
    exceedsMor: orbitPd > morValue,
  };
}

/**
 * Roll and assign significant moon orbits, optionally sorting by ascending PD.
 *
 * @param {object} options
 * @param {number} options.moonCount
 * @param {number} options.mor
 * @param {boolean} [options.addLinearVariance=false]
 * @param {boolean} [options.sortAscending=true]
 * @param {boolean} [options.resolveDuplicateRoundedOrbits=true]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ mor: number, moonOrbits: Array<object> }}
 */
export function assignSignificantMoonOrbits({
  moonCount,
  mor,
  addLinearVariance = false,
  sortAscending = true,
  resolveDuplicateRoundedOrbits = true,
  rng = Math.random,
} = {}) {
  const count = Math.max(0, Math.floor(Number(moonCount) || 0));
  const moonOrbits = [];

  for (let i = 0; i < count; i += 1) {
    const rolled = rollMoonOrbitPd({ mor, addLinearVariance, rng });
    if (!rolled) break;
    moonOrbits.push({
      ...rolled,
      originalIndex: i,
      assignedIndex: i,
      adjustedForCollision: false,
    });
  }

  const ordered = sortAscending ? [...moonOrbits].sort((a, b) => a.orbitPd - b.orbitPd) : [...moonOrbits];
  ordered.forEach((entry, index) => {
    entry.assignedIndex = index;
  });

  if (resolveDuplicateRoundedOrbits && ordered.length > 1) {
    for (let i = 1; i < ordered.length; i += 1) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      if (current.roundedOrbitPd <= previous.roundedOrbitPd) {
        current.roundedOrbitPd = previous.roundedOrbitPd + 1;
        current.orbitPd = Math.max(current.orbitPd, current.roundedOrbitPd);
        current.adjustedForCollision = true;
      }
    }
  }

  return {
    mor: Number(mor),
    moonOrbits: ordered,
  };
}

/**
 * Calculate DM used for optional moon eccentricity and retrograde checks.
 *
 * DMs:
 * - inner: -1
 * - middle: +1
 * - outer: +4
 * - exceeds MOR: +6
 *
 * @param {object} options
 * @param {'inner'|'middle'|'outer'} options.range
 * @param {boolean} [options.exceedsMor=false]
 * @returns {{ dm: number, notes: string[] }}
 */
export function calculateMoonOrbitDm({ range, exceedsMor = false } = {}) {
  const notes = [];
  let dm = 0;

  if (range === "inner") {
    dm -= 1;
    notes.push("DM-1 inner-range moon");
  } else if (range === "middle") {
    dm += 1;
    notes.push("DM+1 middle-range moon");
  } else {
    dm += 4;
    notes.push("DM+4 outer-range moon");
  }

  if (exceedsMor) {
    dm += 6;
    notes.push("DM+6 moon exceeds MOR");
  }

  return { dm, notes };
}

/**
 * Roll optional eccentricity for a moon orbit using moon-range DMs.
 *
 * @param {object} options
 * @param {'inner'|'middle'|'outer'} options.range
 * @param {boolean} [options.exceedsMor=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ dm: number, notes: string[], eccentricityRoll: ReturnType<typeof rollWorldEccentricity>, eccentricity: number }}
 */
export function rollMoonOrbitEccentricity({ range, exceedsMor = false, rng = Math.random } = {}) {
  const dmResult = calculateMoonOrbitDm({ range, exceedsMor });
  const eccentricityRoll = rollWorldEccentricity({
    rng,
    anomalousEccentricityDm: dmResult.dm,
  });

  return {
    dm: dmResult.dm,
    notes: dmResult.notes,
    eccentricityRoll,
    eccentricity: eccentricityRoll.eccentricity,
  };
}

/**
 * Roll optional moon orbital direction (retrograde on 10+ with moon-range DMs).
 *
 * @param {object} options
 * @param {'inner'|'middle'|'outer'} options.range
 * @param {boolean} [options.exceedsMor=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, dm: number, total: number, retrograde: boolean, notes: string[] }}
 */
export function rollMoonOrbitDirection({ range, exceedsMor = false, rng = Math.random } = {}) {
  const dmResult = calculateMoonOrbitDm({ range, exceedsMor });
  const roll = roll2d(rng);
  const total = roll + dmResult.dm;
  return {
    roll,
    dm: dmResult.dm,
    total,
    retrograde: total >= 10,
    notes: dmResult.notes,
  };
}

/**
 * Calculate moon orbital period from PD/km and parent mass.
 *
 * Method A (PD/size):
 *   0.176927 x sqrt(((PD x SizeUnits)^3) / Mp)
 * where SizeUnits = parentDiameterKm / 1600
 *
 * Method B (km):
 *   sqrt((OrbitKm^3) / Mp) / 361730
 *
 * @param {object} options
 * @param {number} options.orbitPd
 * @param {number} options.parentDiameterKm
 * @param {number} options.planetMassEarth
 * @param {number} [options.moonMassEarth=0]
 * @param {boolean} [options.includeMoonMass=false]
 * @returns {{ orbitKm: number, effectiveMassEarth: number, periodHours: number, periodDays: number, periodHoursPdMethod: number } | null}
 */
export function calculateMoonOrbitalPeriodHours({
  orbitPd,
  parentDiameterKm,
  planetMassEarth,
  moonMassEarth = 0,
  includeMoonMass = false,
} = {}) {
  const pd = Number(orbitPd);
  const diameterKm = Number(parentDiameterKm);
  const mp = Number(planetMassEarth);
  const mm = Number(moonMassEarth);

  if (
    !Number.isFinite(pd) ||
    !Number.isFinite(diameterKm) ||
    !Number.isFinite(mp) ||
    pd <= 0 ||
    diameterKm <= 0 ||
    mp <= 0
  ) {
    return null;
  }

  const effectiveMassEarth = mp + (includeMoonMass && Number.isFinite(mm) ? Math.max(0, mm) : 0);
  if (effectiveMassEarth <= 0) return null;

  const orbitKm = pd * diameterKm;
  const sizeUnits = diameterKm / 1600;
  const periodHoursPdMethod = 0.176927 * Math.sqrt((pd * sizeUnits) ** 3 / effectiveMassEarth);
  const periodHours = Math.sqrt(orbitKm ** 3 / effectiveMassEarth) / 361730;

  return {
    orbitKm,
    effectiveMassEarth,
    periodHours,
    periodDays: periodHours / 24,
    periodHoursPdMethod,
  };
}

function formatSignedDecimal(value) {
  if (!Number.isFinite(value)) return "?";
  return String(Number(value.toFixed(2))).replace(/\.0+$/, "");
}

/**
 * Roll significant ring geometries and apply overlap adjustments.
 *
 * Ring centre: 0.4 + (2D / 8)
 * Ring span:   (3D / 100) + 0.07
 *
 * When overlaps occur, outer rings are moved outward to be adjacent.
 * Optional moon-gap records are added when a ring extending beyond Roche
 * overlaps a moon orbit.
 *
 * @param {object} options
 * @param {number} options.ringCount
 * @param {number} [options.rocheLimitPd=1.537]
 * @param {number} [options.minimumInnerEdgePd=0.55]
 * @param {number} [options.parentDiameterKm]
 * @param {Array<{ orbitPd: number, diameterKm?: number }>} [options.moons=[]]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ rings: Array<object>, gaps: Array<object> }}
 */
export function generateSignificantRings({
  ringCount,
  rocheLimitPd = DEFAULT_ROCHE_LIMIT_PD,
  minimumInnerEdgePd = 0.55,
  parentDiameterKm,
  moons = [],
  rng = Math.random,
} = {}) {
  const count = Math.max(0, Math.floor(Number(ringCount) || 0));
  const rings = [];

  for (let i = 0; i < count; i += 1) {
    const centerRoll = roll2d(rng);
    const spanRoll = roll3d(rng);
    let centerPd = 0.4 + centerRoll / 8;
    let spanPd = spanRoll / 100 + 0.07;

    let adjustedForOverlap = false;
    if (rings.length > 0) {
      const previous = rings[rings.length - 1];
      const innerCandidate = centerPd - spanPd / 2;
      if (innerCandidate < previous.outerEdgePd) {
        centerPd = previous.centerPd + (previous.spanPd + spanPd) / 2;
        adjustedForOverlap = true;
      }
    }

    let innerEdgePd = centerPd - spanPd / 2;
    let outerEdgePd = centerPd + spanPd / 2;

    if (adjustedForOverlap && innerEdgePd < minimumInnerEdgePd) {
      const maxSpan = Math.max(0, (centerPd - minimumInnerEdgePd) * 2);
      spanPd = Math.min(spanPd, maxSpan);
      innerEdgePd = centerPd - spanPd / 2;
      outerEdgePd = centerPd + spanPd / 2;
    }

    rings.push({
      index: i + 1,
      centerRoll,
      spanRoll,
      centerPd,
      spanPd,
      innerEdgePd,
      outerEdgePd,
      adjustedForOverlap,
      exceedsRocheLimit: outerEdgePd > rocheLimitPd,
    });
  }

  const gaps = [];
  for (const ring of rings) {
    if (!ring.exceedsRocheLimit) continue;

    for (let i = 0; i < moons.length; i += 1) {
      const moon = moons[i] ?? {};
      const moonOrbitPd = Number(moon.orbitPd);
      const moonDiameterKm = Number(moon.diameterKm);
      if (!Number.isFinite(moonOrbitPd) || moonOrbitPd < ring.innerEdgePd || moonOrbitPd > ring.outerEdgePd) {
        continue;
      }

      const gapMultiplier = roll1d(rng) + 2;
      const baseDiameterKm = Number.isFinite(moonDiameterKm)
        ? moonDiameterKm
        : Number.isFinite(parentDiameterKm)
          ? Number(parentDiameterKm) / 10
          : 0;

      gaps.push({
        ringIndex: ring.index,
        moonIndex: i + 1,
        moonOrbitPd,
        gapMultiplier,
        gapWidthKm: gapMultiplier * Math.max(0, baseDiameterKm),
      });
    }
  }

  return { rings, gaps };
}

/**
 * Format ring profile: R0#:C-S,C-S,...
 *
 * @param {{ rings?: Array<{ centerPd: number, spanPd: number }> }} options
 * @returns {string}
 */
export function formatRingProfile({ rings = [] } = {}) {
  const count = Math.max(0, rings.length);
  const prefix = `R${String(count).padStart(2, "0")}`;
  if (count === 0) return `${prefix}:`;

  const body = rings
    .map((ring) => `${formatSignedDecimal(Number(ring?.centerPd))}-${formatSignedDecimal(Number(ring?.spanPd))}`)
    .join(",");
  return `${prefix}:${body}`;
}

function firstFinitePositive(values = []) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return null;
}

function firstFiniteNonNegative(values = []) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  }
  return null;
}

function resolveSlotStarMassSolar({ stars = [], slotStarKey } = {}) {
  const secondaryIndex = secondaryIndexFromStarKey(slotStarKey);
  const primaryStar = stars[0] ?? {};
  const parentStar = secondaryIndex >= 0 ? (stars[secondaryIndex + 1] ?? primaryStar) : primaryStar;

  const parentMass = firstFinitePositive([
    parentStar?.massSolar,
    parentStar?.stellarMassSolar,
    parentStar?.mass,
    parentStar?.stellarMass,
  ]);
  if (parentMass) {
    return {
      value: parentMass,
      source: secondaryIndex >= 0 ? `secondary-${secondaryIndex + 1}` : "primary",
    };
  }

  const totalMass = stars.reduce((sum, star) => {
    const mass = firstFinitePositive([star?.massSolar, star?.stellarMassSolar, star?.mass, star?.stellarMass]);
    return sum + (mass ?? 0);
  }, 0);

  if (totalMass > 0) {
    return {
      value: totalMass,
      source: "sum-of-stars",
    };
  }

  return {
    value: 1,
    source: "fallback-sol",
  };
}

function resolveParentDiameterKmForMoonMath(slot) {
  const direct = firstFinitePositive([slot?.basicDiameterKm]);
  if (direct) return direct;

  const gasDiameterTerran = Number(slot?.gasGiantDiameterTerran);
  if (Number.isFinite(gasDiameterTerran) && gasDiameterTerran > 0) {
    return gasDiameterTerran * BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE["8"];
  }

  return null;
}

function resolveParentMassEarthForMoonMath(slot, parentDiameterKm) {
  const explicit = firstFinitePositive([slot?.gasGiantMassEarth, slot?.massEarth, slot?.worldMassEarth]);
  if (explicit) return { value: explicit, source: "slot" };

  if (Number.isFinite(parentDiameterKm) && parentDiameterKm > 0) {
    const estimated = calculateWorldMass({ diameterKm: parentDiameterKm, density: 1 });
    if (Number.isFinite(estimated) && estimated > 0) {
      return {
        value: estimated,
        source: "estimated-density-1",
      };
    }
  }

  return {
    value: null,
    source: "missing",
  };
}

function resolveMoonDiameterKmFromSizeDetail(moon) {
  if (Number.isFinite(moon?.basicDiameterKm) && Number(moon.basicDiameterKm) > 0) {
    return Number(moon.basicDiameterKm);
  }

  const gasDiameterTerran = Number(moon?.gasGiantDiameterTerran);
  if (Number.isFinite(gasDiameterTerran) && gasDiameterTerran > 0) {
    return gasDiameterTerran * BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE["8"];
  }

  const sizeCode = normalizeBasicWorldSizeCode(moon?.sizeCode);
  const terrestrialDiameter = lookupBasicTerrestrialWorldDiameter(sizeCode);
  if (Number.isFinite(terrestrialDiameter) && terrestrialDiameter > 0) {
    return terrestrialDiameter;
  }

  return null;
}

/**
 * Enrich slots with significant moon/ring geometry and orbital characteristics.
 *
 * This pass consumes Step 11+12 fields and appends Chapter 5 details:
 * moon limits/removals, MOR, moon orbits, optional direction/eccentricity,
 * moon periods, ring geometry, ring gaps, and ring profile string.
 *
 * @param {object} options
 * @param {Array<object>} [options.slots=[]]
 * @param {Array<object>} [options.stars=[]]
 * @param {boolean} [options.addMoonLinearVariance=false]
 * @param {boolean} [options.includeMoonDirectionAndEccentricity=true]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   slots: Array<object>,
 *   totals: {
 *     worldsProcessed: number,
 *     worldsWithCharacteristics: number,
 *     moonsAfterLimitChecks: number,
 *     ringsAfterLimitChecks: number
 *   }
 * }}
 */
export function assignSignificantMoonAndRingCharacteristics({
  slots = [],
  stars = [],
  addMoonLinearVariance = false,
  includeMoonDirectionAndEccentricity = true,
  rng = Math.random,
} = {}) {
  let worldsProcessed = 0;
  let worldsWithCharacteristics = 0;
  let moonsAfterLimitChecks = 0;
  let ringsAfterLimitChecks = 0;

  const updatedSlots = slots.map((slot) => {
    const initialMoonCount = Math.max(
      0,
      Math.floor(Number(slot?.significantMoonCountAfterSizing ?? slot?.significantMoonQuantity) || 0),
    );
    const initialRingCount = Math.max(0, Math.floor(Number(slot?.significantRingCount) || 0));

    if (initialMoonCount <= 0 && initialRingCount <= 0) {
      return slot;
    }

    worldsProcessed += 1;

    const parentDiameterKm = resolveParentDiameterKmForMoonMath(slot);
    const parentMass = resolveParentMassEarthForMoonMath(slot, parentDiameterKm);
    const starMass = resolveSlotStarMassSolar({ stars, slotStarKey: slot?.starKey });
    const orbitAsAu = Number(slot?.orbit);
    const eccentricity = Number.isFinite(slot?.eccentricity) ? Number(slot.eccentricity) : 0;

    const limitsRoll =
      Number.isFinite(orbitAsAu) &&
      orbitAsAu > 0 &&
      Number.isFinite(parentDiameterKm) &&
      parentDiameterKm > 0 &&
      Number.isFinite(parentMass.value) &&
      parentMass.value > 0
        ? calculateMoonOrbitLimits({
            orbitalDistanceAu: orbitAsAu,
            eccentricity,
            planetMassEarth: parentMass.value,
            starMassSolar: starMass.value,
            planetDiameterKm: parentDiameterKm,
          })
        : null;

    const limits = limitsRoll ?? {
      hillSphereAu: null,
      hillSphereKm: null,
      hillSpherePd: null,
      hillSphereMoonLimitPd: Number.POSITIVE_INFINITY,
      hillSphereMoonLimitPdRoundedDown: null,
      rocheLimitPd: DEFAULT_ROCHE_LIMIT_PD,
    };

    const limitAdjustment = applyMoonRemovalByLimits({
      hillSphereMoonLimitPd: limits.hillSphereMoonLimitPd,
      significantMoonCount: initialMoonCount,
      significantRingCount: initialRingCount,
    });

    const mor = calculateMoonOrbitRangeMor({
      hillSphereMoonLimitPd: limits.hillSphereMoonLimitPd,
      moonCount: limitAdjustment.significantMoonCount,
    });

    const moonOrbitAssignments = assignSignificantMoonOrbits({
      moonCount: limitAdjustment.significantMoonCount,
      mor: mor.mor,
      addLinearVariance: addMoonLinearVariance,
      sortAscending: true,
      resolveDuplicateRoundedOrbits: true,
      rng,
    });

    const sourceMoonDetails = (slot?.significantMoonSizeDetails ?? []).filter((moon) => !moon?.isRing);
    const moonOrbitDetails = moonOrbitAssignments.moonOrbits.map((orbitRecord, moonIndex) => {
      const sourceMoon = sourceMoonDetails[moonIndex] ?? null;
      const moonDiameterKm = resolveMoonDiameterKmFromSizeDetail(sourceMoon);
      const moonMassEarth =
        firstFinitePositive([sourceMoon?.gasGiantMassEarth, sourceMoon?.massEarth]) ??
        (Number.isFinite(moonDiameterKm) && moonDiameterKm > 0
          ? calculateWorldMass({
              diameterKm: moonDiameterKm,
              density: 1,
            })
          : null);

      const period =
        Number.isFinite(parentDiameterKm) &&
        parentDiameterKm > 0 &&
        Number.isFinite(parentMass.value) &&
        parentMass.value > 0
          ? calculateMoonOrbitalPeriodHours({
              orbitPd: orbitRecord.orbitPd,
              parentDiameterKm,
              planetMassEarth: parentMass.value,
              moonMassEarth,
              includeMoonMass: false,
            })
          : null;

      const eccentricityRoll = includeMoonDirectionAndEccentricity
        ? rollMoonOrbitEccentricity({
            range: orbitRecord.range,
            exceedsMor: orbitRecord.exceedsMor,
            rng,
          })
        : null;
      const directionRoll = includeMoonDirectionAndEccentricity
        ? rollMoonOrbitDirection({
            range: orbitRecord.range,
            exceedsMor: orbitRecord.exceedsMor,
            rng,
          })
        : null;

      return {
        moonIndex: moonIndex + 1,
        sourceMoon,
        diameterKm: moonDiameterKm,
        massEarth: moonMassEarth,
        ...orbitRecord,
        period,
        eccentricityRoll,
        directionRoll,
      };
    });

    const ringsRoll = generateSignificantRings({
      ringCount: limitAdjustment.significantRingCount,
      rocheLimitPd: limits.rocheLimitPd,
      parentDiameterKm,
      moons: moonOrbitDetails.map((moon) => ({
        orbitPd: moon.orbitPd,
        diameterKm: moon.diameterKm,
      })),
      rng,
    });

    const ringProfile = formatRingProfile({ rings: ringsRoll.rings });

    worldsWithCharacteristics += 1;
    moonsAfterLimitChecks += limitAdjustment.significantMoonCount;
    ringsAfterLimitChecks += limitAdjustment.significantRingCount;

    return {
      ...slot,
      significantMoonCountAfterLimitChecks: limitAdjustment.significantMoonCount,
      significantRingCountAfterLimitChecks: limitAdjustment.significantRingCount,
      significantMoonOrbitLimits: limits,
      significantMoonLimitAdjustments: limitAdjustment,
      significantMoonOrbitRangeMor: mor,
      significantMoonOrbitDetails: moonOrbitDetails,
      significantRingDetails: ringsRoll.rings,
      significantRingGaps: ringsRoll.gaps,
      significantRingProfile: ringProfile,
      significantMoonRingCharacteristics: {
        assumptions: {
          orbitDistanceAuSource: Number.isFinite(orbitAsAu) ? "slot.orbit" : "missing",
          starMassSolarSource: starMass.source,
          parentMassEarthSource: parentMass.source,
        },
        limits,
        limitAdjustment,
        mor,
        moonOrbits: moonOrbitDetails,
        rings: ringsRoll.rings,
        ringGaps: ringsRoll.gaps,
        ringProfile,
      },
    };
  });

  return {
    slots: updatedSlots,
    totals: {
      worldsProcessed,
      worldsWithCharacteristics,
      moonsAfterLimitChecks,
      ringsAfterLimitChecks,
    },
  };
}

// â”€â”€ Insignificant Moon Quantity (Rule Of Thumb) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isInsignificantMoonCandidatePrimaryWorldType(primaryWorldType) {
  const normalized = String(primaryWorldType ?? "")
    .trim()
    .toLowerCase();
  return normalized === "terrestrialplanet" || normalized === "mainworld" || normalized === "gasgiant";
}

function resolveInsignificantMoonBaseSize(slot) {
  const gasMeta = parseGasGiantSizeCodeMetadata(slot);
  if (gasMeta) {
    return Number.isFinite(gasMeta.diameterTerran) ? Number(gasMeta.diameterTerran) : 0;
  }

  const terrestrialSize = sizeValueFromCode(slot?.sizeCode);
  if (Number.isFinite(terrestrialSize) && terrestrialSize > 0) {
    return Number(terrestrialSize);
  }

  return 0;
}

/**
 * Rule-of-thumb insignificant moon count.
 *
 * - Terrestrial/mainworld: count ~= Size
 * - Gas giant: count ~= Size x 8
 *
 * @param {{ slot?: object }} [options]
 * @returns {{ eligible: boolean, baseSize: number, multiplier: number, quantity: number }}
 */
export function resolveInsignificantMoonQuantityForSlot({ slot } = {}) {
  if (!isInsignificantMoonCandidatePrimaryWorldType(slot?.primaryWorldType)) {
    return {
      eligible: false,
      baseSize: 0,
      multiplier: 0,
      quantity: 0,
    };
  }

  const baseSize = Math.max(0, Math.floor(resolveInsignificantMoonBaseSize(slot)));
  const isGasGiant = String(slot?.primaryWorldType ?? "")
    .trim()
    .toLowerCase()
    .includes("gasgiant");
  const multiplier = isGasGiant ? 8 : 1;

  return {
    eligible: true,
    baseSize,
    multiplier,
    quantity: Math.max(0, baseSize * multiplier),
  };
}

/**
 * Assign insignificant moon quantities to placed slots.
 *
 * @param {{ slots?: Array<object> }} [options]
 * @returns {{
 *   slots: Array<object>,
 *   rolls: Record<string, object>,
 *   totals: {
 *     worlds: number,
 *     insignificantMoons: number
 *   }
 * }}
 */
export function assignInsignificantMoonQuantities({ slots = [] } = {}) {
  const rolls = {};
  let worlds = 0;
  let insignificantMoons = 0;

  const updatedSlots = slots.map((slot, index) => {
    const slotId = String(slot?.slotId ?? `slot-${index}`);
    const result = resolveInsignificantMoonQuantityForSlot({ slot });
    if (!result.eligible) {
      return slot;
    }

    worlds += 1;
    insignificantMoons += result.quantity;
    rolls[slotId] = result;

    return {
      ...slot,
      insignificantMoonQuantity: result.quantity,
      insignificantMoonRuleOfThumb: result,
    };
  });

  return {
    slots: updatedSlots,
    rolls,
    totals: {
      worlds,
      insignificantMoons,
    },
  };
}

// â”€â”€ Gas Giant Existence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determines if gas giants are present in the system.
 * Gas giants exist on a 2D roll of less than 10 (i.e., 2â€“9).
 *
 * @param {object} [options]
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{ roll: number, exists: boolean }}
 */
export function rollGasGiantExistence({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return { roll, exists: roll < 10 };
}

// â”€â”€ Gas Giant Quantity DMs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculates the total DM for the Gas Giant Quantity roll (Table 10).
 *
 * DMs:
 *   +1 if system is a single Class V (main sequence) star
 *   -2 if primary star is a brown dwarf
 *   -2 if primary star is a post-stellar object
 *   -1 per post-stellar object in the system (including primary if applicable)
 *   -1 if system has 4 or more stars
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @returns {{ dm: number, breakdown: string[] }}
 */
export function calculateGasGiantQuantityDm({ stars = [] } = {}) {
  const breakdown = [];
  let dm = 0;

  const starCount = stars.length;
  const primaryStar = stars[0];

  if (!primaryStar) return { dm: 0, breakdown: ["No stars in system"] };

  const primarySpectral = String(primaryStar.spectralClass ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const primaryLumClass = String(primaryStar.luminosityClass ?? primaryStar.spectralClass ?? "").trim();

  const isBrownDwarf = ["L", "T", "Y"].includes(primarySpectral);
  const isPostStellar =
    primaryLumClass.includes("WD") ||
    primaryLumClass === "D" ||
    primarySpectral === "D" ||
    ["Neutron Star", "Pulsar", "Black Hole"].includes(primaryStar.type ?? "");

  // +1 if single Class V star
  if (starCount === 1) {
    const lumClass = String(primaryStar.luminosityClass ?? "")
      .trim()
      .toUpperCase();
    if (lumClass === "V" || lumClass === "CLASS V") {
      dm += 1;
      breakdown.push("DM+1: Single Class V star");
    }
  }

  // -2 if primary is brown dwarf
  if (isBrownDwarf) {
    dm -= 2;
    breakdown.push("DM-2: Primary star is a brown dwarf");
  }

  // -2 if primary is post-stellar
  if (isPostStellar) {
    dm -= 2;
    breakdown.push("DM-2: Primary star is a post-stellar object");
  }

  // -1 per post-stellar object in system (including primary)
  const postStellarCount = stars.filter((star) => {
    const sp = String(star.spectralClass ?? "")
      .trim()
      .charAt(0)
      .toUpperCase();
    const lc = String(star.luminosityClass ?? star.spectralClass ?? "").trim();
    return (
      sp === "D" ||
      lc.includes("WD") ||
      lc === "D" ||
      ["Neutron Star", "Pulsar", "Black Hole"].includes(star.type ?? "")
    );
  }).length;

  if (postStellarCount > 0) {
    dm -= postStellarCount;
    breakdown.push(`DM-${postStellarCount}: ${postStellarCount} post-stellar object(s) in system`);
  }

  // -1 if 4 or more stars
  if (starCount >= 4) {
    dm -= 1;
    breakdown.push("DM-1: System has 4 or more stars");
  }

  if (breakdown.length === 0) breakdown.push("No DMs applicable");

  return { dm, breakdown };
}

// â”€â”€ Gas Giant Quantity Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 10: Gas Giant Quantity
 * Maps a 2D + DM result to a gas giant count.
 *
 * @param {number} total - The roll result (2D + DM)
 * @returns {number} Number of gas giants
 */
export function lookupGasGiantQuantity(total) {
  if (total <= 4) return 1;
  if (total <= 6) return 2;
  if (total <= 8) return 3;
  if (total <= 11) return 4;
  if (total === 12) return 5;
  return 6; // 13+
}

/**
 * Rolls the Gas Giant Quantity using Table 10, applying all relevant DMs.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects for DM calculation
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{ roll: number, dm: number, total: number, quantity: number, dmBreakdown: string[] }}
 */
export function rollGasGiantQuantity({ stars = [], rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const { dm, breakdown: dmBreakdown } = calculateGasGiantQuantityDm({ stars });
  const total = roll + dm;
  const quantity = lookupGasGiantQuantity(total);
  return { roll, dm, total, quantity, dmBreakdown };
}

// â”€â”€ Main Gas Giant Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determines if gas giants exist in the system and, if so, how many.
 * Returns full generation result including existence check and quantity.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{
 *   exists: boolean,
 *   existenceRoll: number,
 *   quantity: number | null,
 *   quantityRoll: number | null,
 *   dm: number | null,
 *   total: number | null,
 *   dmBreakdown: string[]
 * }}
 */
export function generateGasGiants({ stars = [], rng = Math.random } = {}) {
  const { roll: existenceRoll, exists } = rollGasGiantExistence({ rng });

  if (!exists) {
    return {
      exists: false,
      existenceRoll,
      quantity: 0,
      quantityRoll: null,
      dm: null,
      total: null,
      dmBreakdown: ["Gas giants absent (roll was 10+)"],
    };
  }

  const {
    roll: quantityRoll,
    dm,
    total,
    quantity,
    dmBreakdown,
  } = rollGasGiantQuantity({
    stars,
    rng,
  });

  return {
    exists: true,
    existenceRoll,
    quantity,
    quantityRoll,
    dm,
    total,
    dmBreakdown,
  };
}

// â”€â”€ Planetoid Belt Existence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determines if a planetoid belt is present in the system.
 * A belt exists on a 2D roll of 8 or more.
 *
 * @param {object} [options]
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{ roll: number, exists: boolean }}
 */
export function rollPlanetoidBeltExistence({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return { roll, exists: roll >= 8 };
}

// â”€â”€ Planetoid Belt Quantity DMs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculates the total DM for the Planetoid Belt Quantity roll (Table 9).
 *
 * DMs:
 *   +1 if system has 1 or more gas giants
 *   +3 if primary star is a protostar
 *   +2 if primary star is primordial
 *   +1 if primary star is a post-stellar object
 *   +1 per post-stellar object in system (including primary if applicable)
 *   +1 if system has 2 or more stars
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @param {number} [options.gasGiantCount] - Number of gas giants in system (0 if none)
 * @returns {{ dm: number, breakdown: string[] }}
 */
export function calculatePlanetoidBeltQuantityDm({ stars = [], gasGiantCount = 0 } = {}) {
  const breakdown = [];
  let dm = 0;

  const primaryStar = stars[0];
  if (!primaryStar) return { dm: 0, breakdown: ["No stars in system"] };

  const primaryType = String(primaryStar.type ?? "").trim();
  const primarySpectral = String(primaryStar.spectralClass ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const primaryLumClass = String(primaryStar.luminosityClass ?? primaryStar.spectralClass ?? "").trim();

  const isPostStellar =
    primaryLumClass.includes("WD") ||
    primaryLumClass === "D" ||
    primarySpectral === "D" ||
    ["Neutron Star", "Pulsar", "Black Hole"].includes(primaryType);

  // +1 if 1 or more gas giants
  if (gasGiantCount >= 1) {
    dm += 1;
    breakdown.push("DM+1: System has one or more gas giants");
  }

  // +3 if primary is a protostar
  if (primaryType === "Protostar" || primaryLumClass === "Protostar") {
    dm += 3;
    breakdown.push("DM+3: Primary star is a protostar");
  }

  // +2 if primary is primordial
  if (primaryType === "Primordial" || primaryLumClass === "Primordial") {
    dm += 2;
    breakdown.push("DM+2: Primary star is primordial");
  }

  // +1 if primary is post-stellar
  if (isPostStellar) {
    dm += 1;
    breakdown.push("DM+1: Primary star is a post-stellar object");
  }

  // +1 per post-stellar object in system (including primary)
  const postStellarCount = stars.filter((star) => {
    const sp = String(star.spectralClass ?? "")
      .trim()
      .charAt(0)
      .toUpperCase();
    const lc = String(star.luminosityClass ?? star.spectralClass ?? "").trim();
    const t = String(star.type ?? "").trim();
    return sp === "D" || lc.includes("WD") || lc === "D" || ["Neutron Star", "Pulsar", "Black Hole"].includes(t);
  }).length;

  if (postStellarCount > 0) {
    dm += postStellarCount;
    breakdown.push(`DM+${postStellarCount}: ${postStellarCount} post-stellar object(s) in system`);
  }

  // +1 if system has 2 or more stars
  if (stars.length >= 2) {
    dm += 1;
    breakdown.push("DM+1: System has two or more stars");
  }

  if (breakdown.length === 0) breakdown.push("No DMs applicable");

  return { dm, breakdown };
}

// â”€â”€ Planetoid Belt Quantity Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 9: Planetoid Belt Quantity
 * Maps a 2D + DM result to a belt count.
 *
 * @param {number} total - The roll result (2D + DM)
 * @returns {number} Number of planetoid belts
 */
export function lookupPlanetoidBeltQuantity(total) {
  if (total <= 6) return 1;
  if (total <= 11) return 2;
  return 3; // 12+
}

/**
 * Rolls the Planetoid Belt Quantity using Table 9, applying all relevant DMs.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects for DM calculation
 * @param {number} [options.gasGiantCount] - Number of gas giants present
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{ roll: number, dm: number, total: number, quantity: number, dmBreakdown: string[] }}
 */
export function rollPlanetoidBeltQuantity({ stars = [], gasGiantCount = 0, rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const { dm, breakdown: dmBreakdown } = calculatePlanetoidBeltQuantityDm({ stars, gasGiantCount });
  const total = roll + dm;
  const quantity = lookupPlanetoidBeltQuantity(total);
  return { roll, dm, total, quantity, dmBreakdown };
}

// â”€â”€ Main Planetoid Belt Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Determines if planetoid belts exist and, if so, how many.
 * Note: does not count a Size 0 mainworld's home belt.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @param {number} [options.gasGiantCount] - Gas giants already determined for this system
 * @param {Function} [options.rng] - Random number generator (0â€“1)
 * @returns {{
 *   exists: boolean,
 *   existenceRoll: number,
 *   quantity: number,
 *   quantityRoll: number | null,
 *   dm: number | null,
 *   total: number | null,
 *   dmBreakdown: string[]
 * }}
 */
export function generatePlanetoidBelts({ stars = [], gasGiantCount = 0, rng = Math.random } = {}) {
  const { roll: existenceRoll, exists } = rollPlanetoidBeltExistence({ rng });

  if (!exists) {
    return {
      exists: false,
      existenceRoll,
      quantity: 0,
      quantityRoll: null,
      dm: null,
      total: null,
      dmBreakdown: ["Planetoid belts absent (roll was below 8)"],
    };
  }

  const {
    roll: quantityRoll,
    dm,
    total,
    quantity,
    dmBreakdown,
  } = rollPlanetoidBeltQuantity({
    stars,
    gasGiantCount,
    rng,
  });

  return {
    exists: true,
    existenceRoll,
    quantity,
    quantityRoll,
    dm,
    total,
    dmBreakdown,
  };
}

// â”€â”€ Planetoid Belt Characteristics (WBH Chapter 5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BELT_COMPOSITION_BANDS = Object.freeze([
  { max: 0, key: "LE_0" },
  { max: 1, key: "1" },
  { max: 2, key: "2" },
  { max: 3, key: "3" },
  { max: 4, key: "4" },
  { max: 5, key: "5" },
  { max: 6, key: "6" },
  { max: 7, key: "7" },
  { max: 8, key: "8" },
  { max: 9, key: "9" },
  { max: 10, key: "10" },
  { max: 11, key: "11" },
  { max: Infinity, key: "GE_12" },
]);

function rollBeltCompositionRow(key, rng = Math.random) {
  const d = () => roll1d(rng);
  const d3 = () => Math.ceil(roll1d(rng) / 2);

  switch (key) {
    case "LE_0":
      return { mTypePercent: 60 + d() * 5, sTypePercent: d() * 5, cTypePercent: 0 };
    case "1":
      return { mTypePercent: 50 + d() * 5, sTypePercent: 5 + d() * 5, cTypePercent: d3() };
    case "2":
      return { mTypePercent: 40 + d() * 5, sTypePercent: 15 + d() * 5, cTypePercent: d() };
    case "3":
      return { mTypePercent: 25 + d() * 5, sTypePercent: 30 + d() * 5, cTypePercent: d() };
    case "4":
      return { mTypePercent: 15 + d() * 5, sTypePercent: 35 + d() * 5, cTypePercent: 5 + d() };
    case "5":
      return { mTypePercent: 5 + d() * 5, sTypePercent: 40 + d() * 5, cTypePercent: 5 + d() * 2 };
    case "6":
      return { mTypePercent: d() * 5, sTypePercent: 40 + d() * 5, cTypePercent: d() * 5 };
    case "7":
      return { mTypePercent: 5 + d() * 2, sTypePercent: 35 + d() * 5, cTypePercent: 10 + d() * 5 };
    case "8":
      return { mTypePercent: 5 + d(), sTypePercent: 30 + d() * 5, cTypePercent: 20 + d() * 5 };
    case "9":
      return { mTypePercent: d(), sTypePercent: 15 + d() * 5, cTypePercent: 40 + d() * 5 };
    case "10":
      return { mTypePercent: d(), sTypePercent: 5 + d() * 5, cTypePercent: 50 + d() * 5 };
    case "11":
      return { mTypePercent: d3(), sTypePercent: 5 + d() * 2, cTypePercent: 60 + d() * 5 };
    case "GE_12":
    default:
      return { mTypePercent: 0, sTypePercent: d(), cTypePercent: 70 + d() * 5 };
  }
}

/**
 * Calculate a belt span around its center orbit.
 *
 * Formula: Belt Span = Spread x (2D + DM) / 10
 *
 * DMs:
 *   - DM-1 if next inner or outer slot has a gas giant
 *   - DM+3 if the belt is in the outermost orbit slot
 *
 * If spread is not provided, an estimated spread is used:
 *   spread = (2D x 0.1) x Orbit#
 *
 * @param {object} options
 * @param {number} options.orbit
 * @param {number} [options.spread]
 * @param {boolean} [options.hasInnerGasGiant=false]
 * @param {boolean} [options.hasOuterGasGiant=false]
 * @param {boolean} [options.isOutermostOrbit=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   orbit: number,
 *   spread: number,
 *   spreadSource: string,
 *   spreadRoll: number | null,
 *   roll: number,
 *   dm: number,
 *   total: number,
 *   span: number,
 *   halfSpan: number,
 *   innerBoundary: number,
 *   outerBoundary: number,
 *   dmBreakdown: string[],
 * }}
 */
export function calculateBeltSpan({
  orbit,
  spread,
  hasInnerGasGiant = false,
  hasOuterGasGiant = false,
  isOutermostOrbit = false,
  rng = Math.random,
} = {}) {
  const orbitValue = Number.isFinite(orbit) ? Number(orbit) : 0;

  let spreadValue = Number.isFinite(spread) ? Number(spread) : null;
  let spreadRoll = null;
  let spreadSource = "provided";

  if (!Number.isFinite(spreadValue)) {
    spreadRoll = roll2d(rng);
    spreadValue = spreadRoll * 0.1 * Math.max(0, orbitValue);
    spreadSource = "derived";
  }

  const roll = roll2d(rng);
  const dmBreakdown = [];
  let dm = 0;

  if (hasInnerGasGiant || hasOuterGasGiant) {
    dm -= 1;
    dmBreakdown.push("DM-1: Adjacent inner/outer slot contains a gas giant");
  }

  if (isOutermostOrbit) {
    dm += 3;
    dmBreakdown.push("DM+3: Belt occupies the outermost orbital slot");
  }

  if (dmBreakdown.length === 0) dmBreakdown.push("No DMs applicable");

  const total = roll + dm;
  const span = spreadValue * (total / 10);
  const halfSpan = span / 2;

  return {
    orbit: orbitValue,
    spread: spreadValue,
    spreadSource,
    spreadRoll,
    roll,
    dm,
    total,
    span,
    halfSpan,
    innerBoundary: orbitValue - halfSpan,
    outerBoundary: orbitValue + halfSpan,
    dmBreakdown,
  };
}

/**
 * Roll m/s/c composition percentages for a belt from Table 27.
 *
 * DM rules:
 *   - Orbit inside HZCO: DM-4
 *   - Orbit beyond HZCO+2: DM+4
 *
 * If m+s+c > 100, excess is removed from m first, then s.
 * If m+s+c < 100, remainder is tracked as other.
 *
 * @param {object} options
 * @param {number} [options.orbit]
 * @param {number} [options.hzco]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number,
 *   dm: number,
 *   total: number,
 *   mTypePercent: number,
 *   sTypePercent: number,
 *   cTypePercent: number,
 *   otherTypePercent: number,
 *   dmBreakdown: string[],
 * }}
 */
export function rollBeltComposition({ orbit, hzco, rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const dmBreakdown = [];
  let dm = 0;

  if (Number.isFinite(orbit) && Number.isFinite(hzco)) {
    if (orbit < hzco) {
      dm -= 4;
      dmBreakdown.push("DM-4: Belt Orbit# is inside HZCO");
    } else if (orbit > hzco + 2) {
      dm += 4;
      dmBreakdown.push("DM+4: Belt Orbit# is beyond HZCO+2");
    }
  }

  if (dmBreakdown.length === 0) dmBreakdown.push("No DMs applicable");

  const total = roll + dm;
  const row =
    BELT_COMPOSITION_BANDS.find((band) => total <= band.max) ??
    BELT_COMPOSITION_BANDS[BELT_COMPOSITION_BANDS.length - 1];

  let { mTypePercent, sTypePercent, cTypePercent } = rollBeltCompositionRow(row.key, rng);
  mTypePercent = Math.max(0, Math.round(mTypePercent));
  sTypePercent = Math.max(0, Math.round(sTypePercent));
  cTypePercent = Math.max(0, Math.round(cTypePercent));

  let otherTypePercent = 0;
  let totalPercent = mTypePercent + sTypePercent + cTypePercent;

  if (totalPercent > 100) {
    let excess = totalPercent - 100;

    const removeM = Math.min(mTypePercent, excess);
    mTypePercent -= removeM;
    excess -= removeM;

    const removeS = Math.min(sTypePercent, excess);
    sTypePercent -= removeS;
    excess -= removeS;

    if (excess > 0) {
      cTypePercent = Math.max(0, cTypePercent - excess);
    }
  } else if (totalPercent < 100) {
    otherTypePercent = 100 - totalPercent;
  }

  totalPercent = mTypePercent + sTypePercent + cTypePercent + otherTypePercent;
  if (totalPercent !== 100) {
    otherTypePercent += 100 - totalPercent;
  }

  return {
    roll,
    dm,
    total,
    mTypePercent,
    sTypePercent,
    cTypePercent,
    otherTypePercent,
    dmBreakdown,
  };
}

/**
 * Calculate belt bulk.
 *
 * Formula: Belt Bulk = (2D - 2) + DMs
 * DMs:
 *   - DM - floor(systemAgeByr / 2)
 *   - DM + floor(cTypePercent / 10)
 * Final bulk has minimum 1.
 *
 * @param {object} options
 * @param {number} [options.systemAgeByr=0]
 * @param {number} [options.cTypePercent=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, base: number, dm: number, bulk: number, dmBreakdown: string[] }}
 */
export function calculateBeltBulk({ systemAgeByr = 0, cTypePercent = 0, rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const base = roll - 2;
  const dmBreakdown = [];

  const ageDm = -Math.floor(Math.max(0, Number(systemAgeByr) || 0) / 2);
  const compositionDm = Math.floor(Math.max(0, Number(cTypePercent) || 0) / 10);

  if (ageDm !== 0) dmBreakdown.push(`DM${ageDm}: System age adjustment`);
  if (compositionDm !== 0) dmBreakdown.push(`DM+${compositionDm}: c-type percentage adjustment`);
  if (dmBreakdown.length === 0) dmBreakdown.push("No DMs applicable");

  const dm = ageDm + compositionDm;
  const bulk = Math.max(1, base + dm);

  return { roll, base, dm, bulk, dmBreakdown };
}

/**
 * Roll belt resource rating.
 *
 * Formula: Resource = (2D - 7) + DMs
 * DMs:
 *   - DM + bulk
 *   - DM + floor(mTypePercent / 10)
 *   - DM - floor(cTypePercent / 10)
 *
 * Optional depletion:
 *   - If industrially exploited, subtract 1D before final cap.
 *
 * Final rating is clamped to 2..12.
 *
 * @param {object} options
 * @param {number} [options.bulk=1]
 * @param {number} [options.mTypePercent=0]
 * @param {number} [options.cTypePercent=0]
 * @param {boolean} [options.industrialDepletion=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number,
 *   base: number,
 *   dm: number,
 *   raw: number,
 *   industrialDepletionRoll: number,
 *   rating: number,
 *   ratingCode: string,
 *   dmBreakdown: string[],
 * }}
 */
export function rollBeltResourceRating({
  bulk = 1,
  mTypePercent = 0,
  cTypePercent = 0,
  industrialDepletion = false,
  rng = Math.random,
} = {}) {
  const roll = roll2d(rng);
  const base = roll - 7;

  const dmBulk = Math.floor(Number(bulk) || 0);
  const dmM = Math.floor(Math.max(0, Number(mTypePercent) || 0) / 10);
  const dmC = Math.floor(-(Math.max(0, Number(cTypePercent) || 0) / 10));
  const dm = dmBulk + dmM + dmC;

  const dmBreakdown = [`DM+${dmBulk}: Belt bulk`, `DM+${dmM}: m-type percentage`, `DM${dmC}: c-type percentage`];

  const raw = base + dm;
  const industrialDepletionRoll = industrialDepletion ? roll1d(rng) : 0;
  const afterDepletion = raw - industrialDepletionRoll;
  const rating = Math.max(2, Math.min(12, afterDepletion));

  return {
    roll,
    base,
    dm,
    raw,
    industrialDepletionRoll,
    rating,
    ratingCode: toEHex(rating) ?? String(rating),
    dmBreakdown,
  };
}

/**
 * Determine counts of Size 1 and Size S significant bodies in a belt.
 *
 * Size 1 Formula: 2D - 12 + bulk + DMs
 * DMs: +2 beyond HZCO+3, -4 if span < 0.1
 *
 * Size S Formula: 2D - 12 + bulk + DMs
 * DMs: +1 for HZCO+2..+3, +3 beyond HZCO+3, +1 if span > 1.0
 * Additional rule: if span < 0.1, divide Size S result by 2 (round up).
 *
 * Optional variance:
 *   - If Size S > 50 and outermost orbit, multiply by (1D / D3) and add 1D.
 *
 * @param {object} options
 * @param {number} options.bulk
 * @param {number} [options.beltOrbit]
 * @param {number} [options.hzco]
 * @param {number} [options.span=0]
 * @param {boolean} [options.isOutermostOrbit=false]
 * @param {boolean} [options.applyOptionalVariance=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   size1: { roll: number, dm: number, count: number, dmBreakdown: string[] },
 *   sizeS: {
 *     roll: number,
 *     dm: number,
 *     count: number,
 *     dmBreakdown: string[],
 *     compactSpanHalved: boolean,
 *     optionalVariance: null | { multiplierNumerator: number, multiplierDenominator: number, additive: number }
 *   },
 * }}
 */
export function calculateBeltSignificantBodies({
  bulk,
  beltOrbit,
  hzco,
  span = 0,
  isOutermostOrbit = false,
  applyOptionalVariance = false,
  rng = Math.random,
} = {}) {
  const bulkValue = Math.max(0, Math.floor(Number(bulk) || 0));
  const spanValue = Number.isFinite(span) ? Number(span) : 0;

  const size1Roll = roll2d(rng);
  const size1Breakdown = [];
  let size1Dm = 0;

  if (Number.isFinite(beltOrbit) && Number.isFinite(hzco) && beltOrbit > hzco + 3) {
    size1Dm += 2;
    size1Breakdown.push("DM+2: Belt Orbit# beyond HZCO+3");
  }

  if (spanValue < 0.1) {
    size1Dm -= 4;
    size1Breakdown.push("DM-4: Belt span less than 0.1");
  }

  if (size1Breakdown.length === 0) size1Breakdown.push("No DMs applicable");

  const size1Raw = size1Roll - 12 + bulkValue + size1Dm;
  const size1Count = Math.max(0, size1Raw);

  const sizeSRoll = roll2d(rng);
  const sizeSBreakdown = [];
  let sizeSDm = 0;

  if (Number.isFinite(beltOrbit) && Number.isFinite(hzco)) {
    if (beltOrbit > hzco + 3) {
      sizeSDm += 3;
      sizeSBreakdown.push("DM+3: Belt Orbit# beyond HZCO+3");
    } else if (beltOrbit > hzco + 2) {
      sizeSDm += 1;
      sizeSBreakdown.push("DM+1: Belt Orbit# between HZCO+2 and HZCO+3");
    }
  }

  if (spanValue > 1.0) {
    sizeSDm += 1;
    sizeSBreakdown.push("DM+1: Belt span greater than 1.0");
  }

  if (sizeSBreakdown.length === 0) sizeSBreakdown.push("No DMs applicable");

  let sizeSCount = Math.max(0, sizeSRoll - 12 + bulkValue + sizeSDm);
  let compactSpanHalved = false;
  if (spanValue < 0.1 && sizeSCount > 0) {
    sizeSCount = Math.ceil(sizeSCount / 2);
    compactSpanHalved = true;
  }

  let optionalVariance = null;
  if (applyOptionalVariance && isOutermostOrbit && sizeSCount > 50) {
    const multiplierNumerator = roll1d(rng);
    const multiplierDenominator = Math.ceil(roll1d(rng) / 2);
    const additive = roll1d(rng);

    sizeSCount = Math.max(0, Math.round(sizeSCount * (multiplierNumerator / multiplierDenominator)) + additive);
    optionalVariance = { multiplierNumerator, multiplierDenominator, additive };
  }

  return {
    size1: {
      roll: size1Roll,
      dm: size1Dm,
      count: size1Count,
      dmBreakdown: size1Breakdown,
    },
    sizeS: {
      roll: sizeSRoll,
      dm: sizeSDm,
      count: sizeSCount,
      dmBreakdown: sizeSBreakdown,
      compactSpanHalved,
      optionalVariance,
    },
  };
}

/**
 * Roll Orbit# for a significant body in a belt.
 *
 * Formula: Belt Orbit# + ((2D - 7) x Belt Span / 8)
 *
 * @param {object} options
 * @param {number} options.beltOrbit
 * @param {number} options.span
 * @param {number} [options.spanVarianceFactor=0] Optional additive proportion of span (e.g. 0.1 for +10%).
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, offset: number, orbit: number, spanVarianceFactor: number }}
 */
export function rollBeltSignificantBodyOrbit({ beltOrbit, span, spanVarianceFactor = 0, rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const spanValue = Number.isFinite(span) ? Number(span) : 0;
  const orbitValue = Number.isFinite(beltOrbit) ? Number(beltOrbit) : 0;
  const offset = ((roll - 7) * spanValue) / 8;
  const variance = spanValue * (Number.isFinite(spanVarianceFactor) ? spanVarianceFactor : 0);
  return {
    roll,
    offset,
    orbit: orbitValue + offset + variance,
    spanVarianceFactor: Number.isFinite(spanVarianceFactor) ? spanVarianceFactor : 0,
  };
}

/**
 * Format belt profile shorthand: S-CC.CC.CC.CC-B-R-#-s
 *
 * @param {object} options
 * @param {number} options.span
 * @param {number} options.mTypePercent
 * @param {number} options.sTypePercent
 * @param {number} options.cTypePercent
 * @param {number} options.otherTypePercent
 * @param {number} options.bulk
 * @param {number|string} options.resourceRating
 * @param {number} options.size1Bodies
 * @param {number} options.sizeSBodies
 * @returns {string}
 */
export function formatBeltProfile({
  span,
  mTypePercent,
  sTypePercent,
  cTypePercent,
  otherTypePercent,
  bulk,
  resourceRating,
  size1Bodies,
  sizeSBodies,
} = {}) {
  const fmtSpan = Number.isFinite(span) ? String(Number(span).toFixed(2)).replace(/\.?0+$/, "") : "?";
  const fmtPct = (value) => {
    if (!Number.isFinite(value)) return "??";
    const clamped = Math.max(0, Math.min(99, Math.round(value)));
    return String(clamped).padStart(2, "0");
  };
  const fmtInt = (value) => (Number.isFinite(value) ? String(Math.max(0, Math.round(value))) : "?");

  let resource = "?";
  if (Number.isFinite(resourceRating)) {
    resource = toEHex(resourceRating) ?? String(Math.round(resourceRating));
  } else if (typeof resourceRating === "string" && resourceRating.trim()) {
    resource = resourceRating.trim().toUpperCase();
  }

  return [
    fmtSpan,
    [fmtPct(mTypePercent), fmtPct(sTypePercent), fmtPct(cTypePercent), fmtPct(otherTypePercent)].join("."),
    fmtInt(bulk),
    resource,
    fmtInt(size1Bodies),
    fmtInt(sizeSBodies),
  ].join("-");
}

/**
 * Generate full planetoid belt characteristics bundle for one belt.
 *
 * @param {object} options
 * @param {number} options.orbit
 * @param {number} [options.spread]
 * @param {number} [options.hzco]
 * @param {number} [options.systemAgeByr=0]
 * @param {boolean} [options.hasInnerGasGiant=false]
 * @param {boolean} [options.hasOuterGasGiant=false]
 * @param {boolean} [options.isOutermostOrbit=false]
 * @param {boolean} [options.industrialDepletion=false]
 * @param {boolean} [options.applyOptionalVariance=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   span: ReturnType<typeof calculateBeltSpan>,
 *   composition: ReturnType<typeof rollBeltComposition>,
 *   bulk: ReturnType<typeof calculateBeltBulk>,
 *   resourceRating: ReturnType<typeof rollBeltResourceRating>,
 *   significantBodies: ReturnType<typeof calculateBeltSignificantBodies>,
 *   profile: string,
 * }}
 */
export function generateBeltCharacteristics({
  orbit,
  spread,
  hzco,
  systemAgeByr = 0,
  hasInnerGasGiant = false,
  hasOuterGasGiant = false,
  isOutermostOrbit = false,
  industrialDepletion = false,
  applyOptionalVariance = false,
  rng = Math.random,
} = {}) {
  const span = calculateBeltSpan({
    orbit,
    spread,
    hasInnerGasGiant,
    hasOuterGasGiant,
    isOutermostOrbit,
    rng,
  });

  const composition = rollBeltComposition({ orbit, hzco, rng });
  const bulk = calculateBeltBulk({ systemAgeByr, cTypePercent: composition.cTypePercent, rng });
  const resourceRating = rollBeltResourceRating({
    bulk: bulk.bulk,
    mTypePercent: composition.mTypePercent,
    cTypePercent: composition.cTypePercent,
    industrialDepletion,
    rng,
  });

  const significantBodies = calculateBeltSignificantBodies({
    bulk: bulk.bulk,
    beltOrbit: orbit,
    hzco,
    span: span.span,
    isOutermostOrbit,
    applyOptionalVariance,
    rng,
  });

  const profile = formatBeltProfile({
    span: span.span,
    mTypePercent: composition.mTypePercent,
    sTypePercent: composition.sTypePercent,
    cTypePercent: composition.cTypePercent,
    otherTypePercent: composition.otherTypePercent,
    bulk: bulk.bulk,
    resourceRating: resourceRating.rating,
    size1Bodies: significantBodies.size1.count,
    sizeSBodies: significantBodies.sizeS.count,
  });

  return { span, composition, bulk, resourceRating, significantBodies, profile };
}

// â”€â”€ Terrestrial Planets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Roll 1D3 (1D6 halved, rounding up) giving results 1, 2, or 3.
 * @param {{ rng?: () => number }} options
 * @returns {{ roll: number }}
 */
export function rollD3({ rng = Math.random } = {}) {
  const d6 = Math.floor(rng() * 6) + 1;
  return { roll: Math.ceil(d6 / 2) };
}

/**
 * Calculate DMs for the terrestrial planet count roll.
 * Rule: DM-1 per post-stellar object in the system (including primary star).
 * @param {{ stars?: object[] }} options
 * @returns {{ dm: number, breakdown: string[] }}
 */
export function calculateTerrestrialPlanetDm({ stars = [] } = {}) {
  const breakdown = [];

  const postStellarCount = stars.filter((star) => {
    const lc = (star.luminosityClass ?? "").toUpperCase();
    const type = star.type ?? "";
    return lc.includes("WD") || lc === "D" || ["Neutron Star", "Pulsar", "Black Hole"].includes(type);
  }).length;

  if (postStellarCount > 0) {
    breakdown.push(`DM-${postStellarCount}: ${postStellarCount} post-stellar object(s) in system`);
  } else {
    breakdown.push("No DMs applicable");
  }

  return { dm: postStellarCount === 0 ? 0 : -postStellarCount, breakdown };
}

/**
 * Roll the terrestrial planet count with full reroll logic.
 *
 * 1. Roll 2D-2 + DMs (initial count).
 * 2. If initial < 3: reroll as D3+2 (final range 3â€“5).
 * 3. If initial >= 3: reroll as D3-1 (final range 0â€“2).
 *
 * @param {{ stars?: object[], rng?: () => number }} options
 * @returns {{ count: number, initialRoll: number, dm: number, total: number,
 *             rerollType: string, reroll: number, dmBreakdown: string[] }}
 */
export function rollTerrestrialPlanets({ stars = [], rng = Math.random } = {}) {
  // 2D-2 initial roll
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  const initialRoll = d1 + d2 - 2;

  const { dm, breakdown: dmBreakdown } = calculateTerrestrialPlanetDm({ stars });
  const total = initialRoll + dm;

  // Reroll per rules
  const { roll: d3 } = rollD3({ rng });

  let count;
  let rerollType;

  if (total < 3) {
    rerollType = "D3+2";
    count = d3 + 2; // range 3â€“5
  } else {
    rerollType = "D3-1";
    count = Math.max(0, d3 - 1); // range 0â€“2
  }

  return { count, initialRoll, dm, total, rerollType, reroll: d3, dmBreakdown };
}

/**
 * Generate terrestrial planets for a star system.
 * @param {{ stars?: object[], rng?: () => number }} options
 * @returns {{ count: number, initialRoll: number, dm: number, total: number,
 *             rerollType: string, reroll: number, dmBreakdown: string[] }}
 */
export function generateTerrestrialPlanets({ stars = [], rng = Math.random } = {}) {
  return rollTerrestrialPlanets({ stars, rng });
}

// â”€â”€ Total Worlds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate total worlds in a system.
 *
 * Total Worlds = Planetoid Belts + Gas Giants + Terrestrial Planets
 *
 * Notes:
 *   - A mainworld that is NOT a moon is counted as one of the terrestrial planets.
 *   - A Size-0 mainworld is counted as a planetoid belt (unless it's a ring,
 *     artificial body, or lone small object).
 *
 * @param {{ planetoidBelts?: number, gasGiants?: number, terrestrialPlanets?: number }} options
 * @returns {{ total: number, planetoidBelts: number, gasGiants: number, terrestrialPlanets: number }}
 */
export function calculateTotalWorlds({ planetoidBelts = 0, gasGiants = 0, terrestrialPlanets = 0 } = {}) {
  const total = planetoidBelts + gasGiants + terrestrialPlanets;
  return { total, planetoidBelts, gasGiants, terrestrialPlanets };
}

// â”€â”€ Minimum Allowable Orbit# (MAO) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 11: Minimum Allowable Orbit# by spectral type and luminosity class.
 * null = "â€”" (this combination does not exist).
 * Post-stellar objects (WD, Neutron Star, etc.) and brown dwarfs are handled
 * separately per the "Special Circumstances" chapter.
 */
const MAO_TABLE = {
  O0: { Ia: 0.63, Ib: 0.6, II: 0.55, III: 0.53, IV: null, V: 0.5, VI: 0.01 },
  O5: { Ia: 0.55, Ib: 0.5, II: 0.45, III: 0.38, IV: null, V: 0.3, VI: 0.01 },
  B0: { Ia: 0.5, Ib: 0.35, II: 0.3, III: 0.25, IV: 0.2, V: 0.18, VI: 0.01 },
  B5: { Ia: 1.67, Ib: 0.63, II: 0.35, III: 0.15, IV: 0.13, V: 0.09, VI: 0.01 },
  A0: { Ia: 3.34, Ib: 1.4, II: 0.75, III: 0.13, IV: 0.1, V: 0.06, VI: null },
  A5: { Ia: 4.17, Ib: 2.17, II: 1.17, III: 0.13, IV: 0.07, V: 0.05, VI: null },
  F0: { Ia: 4.42, Ib: 2.5, II: 1.33, III: 0.13, IV: 0.07, V: 0.04, VI: null },
  F5: { Ia: 5.0, Ib: 3.25, II: 1.87, III: 0.13, IV: 0.06, V: 0.03, VI: null },
  G0: { Ia: 5.21, Ib: 3.59, II: 2.24, III: 0.25, IV: 0.07, V: 0.03, VI: 0.02 },
  G5: { Ia: 5.34, Ib: 3.84, II: 2.67, III: 0.38, IV: 0.1, V: 0.02, VI: 0.02 },
  K0: { Ia: 5.59, Ib: 4.17, II: 3.17, III: 0.5, IV: 0.15, V: 0.02, VI: 0.02 },
  K5: { Ia: 6.17, Ib: 4.84, II: 4.0, III: 1.0, IV: null, V: 0.02, VI: 0.01 },
  M0: { Ia: 6.8, Ib: 5.42, II: 4.59, III: 1.68, IV: null, V: 0.02, VI: 0.01 },
  M5: { Ia: 7.2, Ib: 6.17, II: 5.3, III: 3.0, IV: null, V: 0.01, VI: 0.01 },
  M9: { Ia: 7.8, Ib: 6.59, II: 5.92, III: 4.34, IV: null, V: 0.01, VI: 0.01 },
};

// Ordered row keys for nearest-neighbour lookup
const MAO_ROW_KEYS = Object.keys(MAO_TABLE);

// Numeric position for spectral-class distance calculation: letter * 10 + subtype
const SPECTRAL_LETTER_INDEX = { O: 0, B: 1, A: 2, F: 3, G: 4, K: 5, M: 6 };

function parseSpectralClass(spectralClass) {
  const match = String(spectralClass ?? "")
    .trim()
    .match(/^([OBAFGKM])(\d+(\.\d+)?)/i);
  if (!match) return null;
  return { letter: match[1].toUpperCase(), subtype: parseFloat(match[2]) };
}

function spectralToPosition(letter, subtype) {
  const idx = SPECTRAL_LETTER_INDEX[letter];
  return idx === undefined ? null : idx * 10 + subtype;
}

function findNearestMaoRow(spectralClass) {
  const parsed = parseSpectralClass(spectralClass);
  if (!parsed) return null;
  const pos = spectralToPosition(parsed.letter, parsed.subtype);
  if (pos === null) return null;

  let nearestRow = null;
  let nearestDist = Infinity;
  for (const rowKey of MAO_ROW_KEYS) {
    const rowPos = spectralToPosition(rowKey[0], parseInt(rowKey.slice(1), 10));
    const dist = Math.abs(pos - rowPos);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestRow = rowKey;
    }
  }
  return nearestRow;
}

function normalizeLuminosityClass(lumClass) {
  const lc = String(lumClass ?? "").trim();
  if (/^Ia$/i.test(lc)) return "Ia";
  if (/^Ib$/i.test(lc)) return "Ib";
  if (/^II$/i.test(lc)) return "II";
  if (/^III$/i.test(lc)) return "III";
  if (/^IV$/i.test(lc)) return "IV";
  if (/^V$/i.test(lc)) return "V";
  if (/^VI$/i.test(lc)) return "VI";
  return null; // WD, D, VII, post-stellar, brown dwarf â€” see Special Circumstances
}

/**
 * Look up the Minimum Allowable Orbit# (MAO) for a star.
 *
 * @param {string} spectralClass - e.g. "G2", "M5", "B0"
 * @param {string} luminosityClass - e.g. "V", "III", "Ia"
 * @returns {number|null} MAO, or null if inapplicable/post-stellar
 */
export function lookupMinimumAllowableOrbit(spectralClass, luminosityClass) {
  const row = findNearestMaoRow(spectralClass);
  if (!row) return null;
  const col = normalizeLuminosityClass(luminosityClass);
  if (!col) return null;
  const val = MAO_TABLE[row][col];
  return val ?? null;
}

// â”€â”€ Available Orbits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Zone adjacency for rules 9 & 10
function isAdjacentZone(zone1, zone2) {
  return (
    (zone1 === "close" && zone2 === "near") ||
    (zone1 === "near" && zone2 === "close") ||
    (zone1 === "near" && zone2 === "far") ||
    (zone1 === "far" && zone2 === "near")
  );
}

/**
 * Subtract an exclusion interval (from, to) from a set of available ranges.
 * The exclusion is exclusive at both endpoints (orbits AT from or to are available).
 * @param {{ min: number, max: number }[]} ranges
 * @param {{ from: number, to: number }} exclusion
 * @returns {{ min: number, max: number }[]}
 */
function subtractExclusion(ranges, exclusion) {
  const result = [];
  for (const { min, max } of ranges) {
    if (max <= exclusion.from || min >= exclusion.to) {
      result.push({ min, max });
    } else {
      if (min < exclusion.from) result.push({ min, max: exclusion.from });
      if (max > exclusion.to) result.push({ min: exclusion.to, max });
    }
  }
  return result;
}

/**
 * Calculate the exclusion zone imprinted on the PRIMARY star's orbit availability
 * by a secondary star (rules 5â€“7).
 *
 * @param {{ orbitNumber: number, eccentricity?: number, zone: string }} secondary
 * @param {number} secondaryMao - MAO of the secondary (0 if null)
 * @returns {{ from: number, to: number }}
 */
function calcPrimaryExclusion(secondary, secondaryMao) {
  const n = secondary.orbitNumber;
  const ecc = secondary.eccentricity ?? 0;
  const mao = secondaryMao ?? 0;
  const zone = secondary.zone;

  let half = 1.0;
  if (mao > 0.2) half += mao; // rule 5 extension
  if (ecc > 0.2) half += 1.0; // rule 6
  if (ecc > 0.5 && zone !== "far") half += 1.0; // rule 7 (Close/Near only)

  return { from: n - half, to: n + half };
}

/**
 * Calculate the maximum orbit distance (from the secondary's centre) for a
 * secondary star's own worlds (rules 8â€“11).
 *
 * @param {{ orbitNumber: number, eccentricity?: number, zone: string }} secondary
 * @param {Array} allSecondaries
 * @returns {number}
 */
function calcSecondaryMaxOrbit(secondary, allSecondaries) {
  let maxOrbit = secondary.orbitNumber - 3;

  // Rule 9: adjacent zone companions reduce max by 1 (once)
  const hasAdjacentStar = allSecondaries.some((s) => s !== secondary && isAdjacentZone(secondary.zone, s.zone));
  if (hasAdjacentStar) maxOrbit -= 1;

  // Rule 10: high eccentricity in this star or an adjacent star reduces max by 1 (once)
  const highEccAdjacent =
    (secondary.eccentricity ?? 0) > 0.2 ||
    allSecondaries.some(
      (s) => s !== secondary && isAdjacentZone(secondary.zone, s.zone) && (s.eccentricity ?? 0) > 0.2,
    );
  if (highEccAdjacent) maxOrbit -= 1;

  // Rule 11: eccentricity > 0.5 for this star reduces max by 1 more (once)
  if ((secondary.eccentricity ?? 0) > 0.5) maxOrbit -= 1;

  return maxOrbit;
}

/**
 * Calculate the circumbinary minimum orbit for a star that has a companion.
 * (Rule 2)
 *
 * @param {number} primaryMao
 * @param {number} companionMao
 * @param {number} companionEccentricity
 * @returns {number}
 */
export function calculateCircumbinaryMinOrbit(primaryMao, companionMao, companionEccentricity) {
  const ecc = companionEccentricity ?? 0;
  let min = 0.5 + ecc;
  const largerMao = Math.max(primaryMao ?? 0, companionMao ?? 0);
  if (largerMao > 0.2) min += largerMao;
  return min;
}

/**
 * Calculate available orbit ranges for all stars in a system.
 *
 * @param {object} options
 * @param {{ spectralClass: string, luminosityClass: string, companion?: object }} options.primary
 *   Primary star. Optional `companion` sub-object: { spectralClass, luminosityClass, eccentricity }.
 * @param {Array<{
 *   spectralClass: string, luminosityClass: string,
 *   zone: 'close'|'near'|'far',
 *   orbitNumber: number,
 *   eccentricity?: number,
 *   companion?: object
 * }>} [options.secondaries]
 *
 * @returns {{
 *   primaryMao: number|null,
 *   primaryOrbits: { min: number, max: number }[],
 *   secondaryOrbits: {
 *     zone: string, orbitNumber: number,
 *     mao: number|null, max: number
 *   }[]
 * }}
 */
export function calculateAvailableOrbits({ primary, secondaries = [] } = {}) {
  const primaryMao = lookupMinimumAllowableOrbit(primary.spectralClass, primary.luminosityClass);

  // Effective primary minimum: account for companion circumbinary rule (rule 2)
  let effectivePrimaryMin = primaryMao ?? 0.01;
  if (primary.companion) {
    const companionMao = lookupMinimumAllowableOrbit(
      primary.companion.spectralClass,
      primary.companion.luminosityClass,
    );
    const cbMin = calculateCircumbinaryMinOrbit(
      primaryMao ?? 0,
      companionMao ?? 0,
      primary.companion.eccentricity ?? 0,
    );
    effectivePrimaryMin = Math.max(effectivePrimaryMin, cbMin);
  }

  // Start with full available range for primary (rule 3: up to Orbit# 20)
  let primaryOrbits = [{ min: effectivePrimaryMin, max: 20 }];

  // Rules 5â€“7: exclude zones around each secondary from primary orbits
  for (const secondary of secondaries) {
    const secondaryMao = lookupMinimumAllowableOrbit(secondary.spectralClass, secondary.luminosityClass);
    const exclusion = calcPrimaryExclusion(secondary, secondaryMao);
    primaryOrbits = subtractExclusion(primaryOrbits, exclusion);
  }

  // Rules 8â€“11 + companion rule 2: calculate each secondary's own orbit range
  const secondaryOrbits = secondaries.map((secondary) => {
    const mao = lookupMinimumAllowableOrbit(secondary.spectralClass, secondary.luminosityClass);
    let effectiveMin = mao ?? 0.01;

    // Rule 2: circumbinary min if secondary has a companion
    if (secondary.companion) {
      const compMao = lookupMinimumAllowableOrbit(
        secondary.companion.spectralClass,
        secondary.companion.luminosityClass,
      );
      const cbMin = calculateCircumbinaryMinOrbit(mao ?? 0, compMao ?? 0, secondary.companion.eccentricity ?? 0);
      effectiveMin = Math.max(effectiveMin, cbMin);
    }

    const max = calcSecondaryMaxOrbit(secondary, secondaries);
    return { zone: secondary.zone, orbitNumber: secondary.orbitNumber, mao, min: effectiveMin, max };
  });

  return { primaryMao, primaryOrbits, secondaryOrbits };
}

// â”€â”€ Habitable Zone Centre Orbit# (HZCO) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 12: Habitable Zone Centre in AU.
 * null = "â€”" (combination does not exist).
 */
const HZCO_AU_TABLE = {
  O0: { Ia: 1844, Ib: 1789, II: 1643, III: 1549, IV: null, V: 1483, VI: 13.4 },
  O5: { Ia: 1049, Ib: 949, II: 854, III: 714, IV: null, V: 574, VI: 8.54 },
  B0: { Ia: 539, Ib: 374, II: 316, III: 268, IV: 214, V: 187, VI: 5.39 },
  B5: { Ia: 400, Ib: 167, II: 94, III: 40.0, IV: 33.2, V: 23.5, VI: 3.32 },
  A0: { Ia: 361, Ib: 148, II: 89, III: 14.8, IV: 11.8, V: 6.56, VI: null },
  A5: { Ia: 346, Ib: 141, II: 85, III: 9.49, IV: 5.74, V: 3.87, VI: null },
  F0: { Ia: 346, Ib: 141, II: 84, III: 8.37, IV: 5.0, V: 2.85, VI: null },
  F5: { Ia: 346, Ib: 141, II: 83, III: 6.24, IV: 2.45, V: 1.87, VI: null },
  G0: { Ia: 346, Ib: 141, II: 82, III: 11.0, IV: 3.16, V: 1.18, VI: 0.85 },
  G5: { Ia: 332, Ib: 141, II: 84, III: 14.1, IV: 3.74, V: 0.88, VI: 0.66 },
  K0: { Ia: 332, Ib: 145, II: 88, III: 16.1, IV: 4.8, V: 0.72, VI: 0.48 },
  K5: { Ia: 346, Ib: 148, II: 92, III: 23.0, IV: null, V: 0.46, VI: 0.29 },
  M0: { Ia: 361, Ib: 155, II: 94, III: 24.5, IV: null, V: 0.29, VI: 0.16 },
  M5: { Ia: 316, Ib: 161, II: 94, III: 26.8, IV: null, V: 0.054, VI: 0.027 },
  M9: { Ia: 300, Ib: 138, II: 85, III: 34.6, IV: null, V: 0.017, VI: 0.014 },
};

/**
 * Table 13: Habitable Zone Centre Orbit#s (HZCO).
 * null = "â€”" (combination does not exist).
 */
const HZCO_TABLE = {
  O0: { Ia: 14.5, Ib: 14.4, II: 14.3, III: 14.3, IV: null, V: 14.2, VI: 7.3 },
  O5: { Ia: 13.7, Ib: 13.5, II: 13.4, III: 13.2, IV: null, V: 12.9, VI: 6.7 },
  B0: { Ia: 12.8, Ib: 12.2, II: 12.0, III: 11.7, IV: 11.4, V: 11.2, VI: 6.0 },
  B5: { Ia: 12.3, Ib: 11.1, II: 10.2, III: 9.0, IV: 8.6, V: 8.2, VI: 5.2 },
  A0: { Ia: 12.2, Ib: 10.9, II: 10.2, III: 7.5, IV: 7.2, V: 6.3, VI: null },
  A5: { Ia: 12.1, Ib: 10.8, II: 10.1, III: 6.9, IV: 6.1, V: 5.5, VI: null },
  F0: { Ia: 12.1, Ib: 10.8, II: 10.1, III: 6.7, IV: 5.9, V: 5.0, VI: null },
  F5: { Ia: 12.1, Ib: 10.8, II: 10.1, III: 6.2, IV: 4.7, V: 4.2, VI: null },
  G0: { Ia: 12.1, Ib: 10.8, II: 10.1, III: 7.1, IV: 5.2, V: 3.3, VI: null },
  G5: { Ia: 12.1, Ib: 10.8, II: 10.1, III: 7.4, IV: 5.4, V: 2.6, VI: 2.5 },
  K0: { Ia: 12.1, Ib: 10.8, II: 10.2, III: 7.6, IV: 5.8, V: 2.1, VI: 1.9 },
  K5: { Ia: 12.1, Ib: 10.9, II: 10.2, III: 8.1, IV: null, V: 1.2, VI: 1.3 },
  M0: { Ia: 12.2, Ib: 11.0, II: 10.2, III: 8.2, IV: null, V: 0.72, VI: 0.4 },
  M5: { Ia: 12.1, Ib: 11.1, II: 10.2, III: 8.4, IV: null, V: 0.13, VI: 0.07 },
  M9: { Ia: 12.0, Ib: 10.8, II: 10.1, III: 8.8, IV: null, V: 0.04, VI: 0.03 },
};

/**
 * Look up the Habitable Zone Centre Orbit# (HZCO) for a single star.
 *
 * @param {string} spectralClass - e.g. "G2", "M5", "B0"
 * @param {string} luminosityClass - e.g. "V", "III", "Ia"
 * @returns {number|null} HZCO in Orbit#, or null if inapplicable
 */
export function lookupHZCO(spectralClass, luminosityClass) {
  const row = findNearestMaoRow(spectralClass); // reuse spectral interpolation helper
  if (!row) return null;
  const col = normalizeLuminosityClass(luminosityClass);
  if (!col) return null;
  const val = HZCO_TABLE[row][col];
  return val ?? null;
}

/**
 * Look up the Habitable Zone Centre in AU for a single star.
 *
 * @param {string} spectralClass
 * @param {string} luminosityClass
 * @returns {number|null}
 */
export function lookupHZCO_AU(spectralClass, luminosityClass) {
  const row = findNearestMaoRow(spectralClass);
  if (!row) return null;
  const col = normalizeLuminosityClass(luminosityClass);
  if (!col) return null;
  const val = HZCO_AU_TABLE[row][col];
  return val ?? null;
}

/**
 * Calculate the effective HZCO Orbit# for a world, accounting for all
 * stars whose Orbit# is less than the planet's (i.e., the planet orbits them).
 *
 * Rules:
 *   - Single star: HZCO = table lookup for that star.
 *   - Circumbinary (planet orbits primary and its companion): sum both luminosities.
 *   - Multi-star: sum luminosities of all stars with orbitNumber < planetOrbitNumber,
 *     plus the primary (always included). Then HZCO = sqrt(summedLuminosity).
 *
 * Luminosity is derived from the HZCO AU table (L = AU^2).
 *
 * @param {object} options
 * @param {{ spectralClass: string, luminosityClass: string, companion?: object }} options.primary
 * @param {Array<{ spectralClass: string, luminosityClass: string, orbitNumber: number }>} [options.secondaries]
 * @param {number} [options.planetOrbitNumber] - Orbit# of the planet being evaluated.
 *   If omitted, only the primary (and its companion) are used.
 * @returns {{ hzco: number|null, combinedLuminosity: number|null, auDistance: number|null }}
 */
export function calculateHZCO({ primary, secondaries = [], planetOrbitNumber } = {}) {
  function starLuminosity(spectralClass, luminosityClass) {
    const au = lookupHZCO_AU(spectralClass, luminosityClass);
    return au !== null ? au * au : null;
  }

  const primaryLum = starLuminosity(primary.spectralClass, primary.luminosityClass);
  if (primaryLum === null) return { hzco: null, combinedLuminosity: null, auDistance: null };

  let combinedLuminosity = primaryLum;
  let isMultiStar = false;

  // Companion of primary: always included (circumbinary)
  if (primary.companion) {
    const compLum = starLuminosity(primary.companion.spectralClass, primary.companion.luminosityClass);
    if (compLum !== null) {
      combinedLuminosity += compLum;
      isMultiStar = true;
    }
  }

  // Secondary stars whose Orbit# is less than the planet's
  if (planetOrbitNumber !== undefined) {
    for (const secondary of secondaries) {
      if (secondary.orbitNumber < planetOrbitNumber) {
        const secLum = starLuminosity(secondary.spectralClass, secondary.luminosityClass);
        if (secLum !== null) {
          combinedLuminosity += secLum;
          isMultiStar = true;
        }
      }
    }
  }

  const auDistance = Math.sqrt(combinedLuminosity);
  // Single-star: return exact tabulated value for maximum precision.
  // Multi-star: derive Orbit# from combined luminosity via AU conversion.
  const hzco = isMultiStar ? auToOrbitNumber(auDistance) : lookupHZCO(primary.spectralClass, primary.luminosityClass);

  return { hzco, combinedLuminosity, auDistance };
}

/**
 * WBH standard orbit numberâ†”AU table.
 * Orbit 0 = 0 AU (stellar surface), then piecewise values up to Orbit 6,
 * after which distance doubles each orbit.
 */
const ORBIT_AU_TABLE = [
  [0, 0],
  [1, 0.4],
  [2, 0.7],
  [3, 1.0],
  [4, 1.6],
  [5, 2.8],
  [6, 5.2],
  [7, 10],
  [8, 20],
  [9, 40],
  [10, 80],
  [11, 160],
  [12, 320],
  [13, 640],
  [14, 1280],
  [15, 2560],
  [16, 5120],
  [17, 10240],
  [18, 20480],
  [19, 40960],
  [20, 81920],
];

/**
 * Convert an AU distance to a WBH Orbit# using piecewise-linear interpolation
 * over the standard orbit distance table.
 *
 * @param {number} au
 * @returns {number} Orbit# (rounded to 2 decimal places)
 */
export function auToOrbitNumber(au) {
  if (au <= 0) return 0;
  for (let i = 0; i < ORBIT_AU_TABLE.length - 1; i++) {
    const [n1, au1] = ORBIT_AU_TABLE[i];
    const [n2, au2] = ORBIT_AU_TABLE[i + 1];
    if (au >= au1 && au <= au2) {
      const fraction = (au - au1) / (au2 - au1);
      return Math.round((n1 + fraction * (n2 - n1)) * 100) / 100;
    }
  }
  // Beyond table maximum: continue geometric doubling from last entry
  const [lastN, lastAU] = ORBIT_AU_TABLE[ORBIT_AU_TABLE.length - 1];
  return Math.round((lastN + Math.log2(au / lastAU)) * 100) / 100;
}

/**
 * Return the nominal habitable-zone breadth around a HZCO.
 * WBH breadth is +/- 1.0 Orbit# centered on the HZCO.
 *
 * @param {number} hzco
 * @returns {{ innerOrbit: number, outerOrbit: number }|null}
 */
export function calculateHabitableZoneBreadth(hzco) {
  if (!Number.isFinite(hzco)) return null;
  return {
    innerOrbit: hzco - 1,
    outerOrbit: hzco + 1,
  };
}

/**
 * Basic HZCO deviation for worlds at Orbit# >= 1 and HZCO >= 1.
 * Negative = hotter (inside HZCO), positive = colder (outside HZCO).
 *
 * @param {number} orbitNumber
 * @param {number} hzco
 * @returns {number|null}
 */
export function calculateHZCODeviation(orbitNumber, hzco) {
  if (!Number.isFinite(orbitNumber) || !Number.isFinite(hzco)) return null;
  return orbitNumber - hzco;
}

/**
 * Effective HZCO deviation for low orbit values.
 *
 * If either HZCO or Orbit# is below 1, apply:
 *   (Orbit# - HZCO) / min(Orbit#, HZCO)
 *
 * Otherwise use the basic deviation:
 *   Orbit# - HZCO
 *
 * @param {number} orbitNumber
 * @param {number} hzco
 * @returns {number|null}
 */
export function calculateEffectiveHZCODeviation(orbitNumber, hzco) {
  const deviation = calculateHZCODeviation(orbitNumber, hzco);
  if (deviation === null) return null;

  if (orbitNumber >= 1 && hzco >= 1) return deviation;

  const divisor = Math.min(orbitNumber, hzco);
  if (divisor <= 0) return null;

  return deviation / divisor;
}

/**
 * Calculate habitable zone inner/outer orbit boundaries for a given HZCO.
 *
 * For HZCO >= 1.0: zone = HZCO Â± 1.0 Orbit#s.
 * For HZCO < 1.0: zone = HZCO Â± 0.1 Orbit#s (one-tenth as large per T5 rules);
 *   if the natural outer boundary would exceed Orbit# 1.0, it is extended to 1.2.
 *
 * Matches example from T5 WBH Mainworld Candidate rules:
 *   HZCO 3.3  â†’ inner 2.3,  outer 4.3
 *   HZCO 0.92 â†’ inner 0.82, outer 1.02 â†’ extended to 1.2
 *   HZCO 0.75 â†’ inner 0.65, outer 0.85
 *
 * @param {number} hzco
 * @returns {{ innerOrbit: number, outerOrbit: number } | null}
 */
export function calculateHabitableZoneBoundsForHzco(hzco) {
  if (!Number.isFinite(hzco)) return null;

  if (hzco >= 1.0) {
    return { innerOrbit: hzco - 1.0, outerOrbit: hzco + 1.0 };
  }

  const naturalOuter = hzco + 0.1;
  return {
    innerOrbit: Math.max(0, hzco - 0.1),
    outerOrbit: naturalOuter > 1.0 ? 1.2 : naturalOuter,
  };
}

const HABITABLE_ZONE_DEVIATION_TO_RAW_ROLL_TABLE = [
  { minDeviation: 1.05, rawRoll: 2 },
  { minDeviation: 0.75, rawRoll: 3 },
  { minDeviation: 0.35, rawRoll: 4 },
  { minDeviation: 0.15, rawRoll: 5 },
  { minDeviation: 0.05, rawRoll: 6 },
  { minDeviation: -0.05, rawRoll: 7 },
  { minDeviation: -0.15, rawRoll: 8 },
  { minDeviation: -0.35, rawRoll: 9 },
  { minDeviation: -0.75, rawRoll: 10 },
  { minDeviation: -1.05, rawRoll: 11 },
  { minDeviation: -Infinity, rawRoll: 12 },
];

const HABITABLE_ZONE_REGION_PROFILE_BY_ROLL = [
  {
    minRawRoll: -Infinity,
    maxRawRoll: 2,
    type: "Frozen",
    averageTemperatureK: "< 222K",
    averageTemperatureC: "< -51C",
    description: "Frozen world. No liquid water, very dry atmosphere.",
  },
  {
    minRawRoll: 3,
    maxRawRoll: 4,
    type: "Cold",
    averageTemperatureK: "222-273K",
    averageTemperatureC: "-51C-0C",
    description: "Icy world. Little liquid water, extensive ice caps, few clouds.",
  },
  {
    minRawRoll: 5,
    maxRawRoll: 9,
    type: "Temperate",
    averageTemperatureK: "273-303K",
    averageTemperatureC: "0C-30C",
    description: "Temperate world. Liquid and vaporized water are common, with moderate ice caps.",
  },
  {
    minRawRoll: 10,
    maxRawRoll: 11,
    type: "Hot",
    averageTemperatureK: "304-353K",
    averageTemperatureC: "31C-80C",
    description: "Hot world. Small or no ice caps, with most water in clouds.",
  },
  {
    minRawRoll: 12,
    maxRawRoll: Infinity,
    type: "Boiling",
    averageTemperatureK: "> 353K",
    averageTemperatureC: "> 80C",
    description: "Boiling world. No ice caps and little liquid water.",
  },
];

function clampHabitableZoneTemperatureRoll(rawRoll) {
  if (!Number.isFinite(rawRoll)) return 7;
  return Math.max(2, Math.min(12, Math.round(rawRoll)));
}

/**
 * Convert effective HZCO deviation to a Table 30 raw temperature roll.
 *
 * @param {number} effectiveDeviation
 * @returns {number} Raw roll equivalent (2-12).
 */
export function calculateHabitableZoneTemperatureRawRoll(effectiveDeviation) {
  if (!Number.isFinite(effectiveDeviation)) return 7;

  if (effectiveDeviation >= -0.05 && effectiveDeviation <= 0.05) {
    return 7;
  }

  for (const row of HABITABLE_ZONE_DEVIATION_TO_RAW_ROLL_TABLE) {
    if (effectiveDeviation >= row.minDeviation) {
      return row.rawRoll;
    }
  }

  return 12;
}

/**
 * Return Table 30 region profile by (possibly modified) temperature roll.
 *
 * @param {number} rawRoll
 * @returns {{
 *   rawRoll: number,
 *   type: string,
 *   averageTemperatureK: string,
 *   averageTemperatureC: string,
 *   description: string
 * }}
 */
export function lookupHabitableZoneRegionByRawRoll(rawRoll) {
  const normalizedRawRoll = clampHabitableZoneTemperatureRoll(rawRoll);
  for (const region of HABITABLE_ZONE_REGION_PROFILE_BY_ROLL) {
    if (normalizedRawRoll >= region.minRawRoll && normalizedRawRoll <= region.maxRawRoll) {
      return {
        rawRoll: normalizedRawRoll,
        type: region.type,
        averageTemperatureK: region.averageTemperatureK,
        averageTemperatureC: region.averageTemperatureC,
        description: region.description,
      };
    }
  }

  return {
    rawRoll: normalizedRawRoll,
    type: "Temperate",
    averageTemperatureK: "273-303K",
    averageTemperatureC: "0C-30C",
    description: "Temperate world.",
  };
}

/**
 * Return the temperature raw-roll DM for a world based on effective HZCO deviation.
 *
 * The simulated base raw roll is 7 (midpoint of 2D distribution).
 * Add this DM to 7 to get the temperature raw-roll for the Habitable Zones Regions table.
 *
 * @param {number} effectiveDeviation - From calculateEffectiveHZCODeviation().
 * @returns {number} DM to add to the simulated temperature raw roll of 7.
 */
export function lookupHabitableZoneRegionDm(effectiveDeviation) {
  return calculateHabitableZoneTemperatureRawRoll(effectiveDeviation) - 7;
}

// â”€â”€ Placement Of Worlds: Step 1 (Allocations By Star) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Sum an array of orbit ranges into total "allowable orbits" span.
 * Each range contributes max - min if max > min.
 *
 * @param {Array<{ min: number, max: number }>} ranges
 * @returns {number}
 */
function sumAllowableOrbitSpan(ranges = []) {
  return ranges.reduce((total, range) => {
    const min = Number(range?.min);
    const max = Number(range?.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return total;
    return total + (max - min);
  }, 0);
}

/**
 * Step 1 placement allocation for multiple-star systems.
 *
 * Rules implemented:
 * - Compute each star's total allowable orbits (with fractions).
 * - Add +1 only if star has no companion and has non-zero allowable orbits.
 * - Floor each star total to get Total Star Orbits.
 * - Total System Orbits = sum of all Total Star Orbits.
 * - Worlds assignment order: primary first, then secondaries by ascending orbitNumber.
 *   Primary rounds up, intermediate stars round down, last star gets remainder.
 *
 * @param {object} options
 * @param {number} options.totalWorlds
 * @param {{ companion?: object }} options.primary
 * @param {Array<{ orbitNumber: number, companion?: object }>} [options.secondaries]
 * @param {{
 *   primaryOrbits?: Array<{ min: number, max: number }>,
 *   secondaryOrbits?: Array<{ min: number, max: number }>
 * }} options.availableOrbits
 * @returns {{
 *   stepSkipped: boolean,
 *   totalSystemOrbits: number,
 *   starAllocations: Array<{
 *     starKey: string,
 *     order: number,
 *     orbitNumber: number,
 *     hasCompanion: boolean,
 *     allowableOrbits: number,
 *     bonusOrbits: number,
 *     totalStarOrbits: number,
 *     rawWorldShare: number,
 *     assignedWorlds: number
 *   }>,
 *   unassignedWorlds: number
 * }}
 */
export function allocateWorldsByStar({ totalWorlds, primary, secondaries = [], availableOrbits } = {}) {
  const worlds = Math.max(0, Number.isFinite(totalWorlds) ? Math.floor(totalWorlds) : 0);

  const primaryAllowable = sumAllowableOrbitSpan(availableOrbits?.primaryOrbits ?? []);
  const secondaryRanges = availableOrbits?.secondaryOrbits ?? [];

  const records = [
    {
      starKey: "primary",
      order: 0,
      orbitNumber: 0,
      hasCompanion: Boolean(primary?.companion),
      allowableOrbits: primaryAllowable,
    },
    ...secondaries.map((star, i) => ({
      starKey: `secondary-${i + 1}`,
      order: i + 1,
      orbitNumber: Number(star?.orbitNumber ?? Number.POSITIVE_INFINITY),
      hasCompanion: Boolean(star?.companion),
      allowableOrbits: sumAllowableOrbitSpan([
        {
          min: secondaryRanges[i]?.min,
          max: secondaryRanges[i]?.max,
        },
      ]),
    })),
  ];

  // Assignment order is primary first, then "outward" by ascending secondary orbit.
  const ordered = [
    records[0],
    ...records.slice(1).sort((a, b) => {
      if (a.orbitNumber === b.orbitNumber) return a.order - b.order;
      return a.orbitNumber - b.orbitNumber;
    }),
  ];

  const withTotals = ordered.map((star) => {
    const bonusOrbits = !star.hasCompanion && star.allowableOrbits > 0 ? 1 : 0;
    return {
      ...star,
      bonusOrbits,
      totalStarOrbits: Math.floor(star.allowableOrbits + bonusOrbits),
      rawWorldShare: 0,
      assignedWorlds: 0,
    };
  });

  const totalSystemOrbits = withTotals.reduce((sum, star) => sum + star.totalStarOrbits, 0);
  const isSingleStar = withTotals.length === 1;

  if (isSingleStar) {
    withTotals[0].rawWorldShare = worlds;
    withTotals[0].assignedWorlds = worlds;
    return {
      stepSkipped: true,
      totalSystemOrbits,
      starAllocations: withTotals,
      unassignedWorlds: 0,
    };
  }

  // Defensive fallback: if orbits collapse to zero, assign all to primary.
  if (totalSystemOrbits <= 0) {
    withTotals[0].assignedWorlds = worlds;
    withTotals[0].rawWorldShare = worlds;
    return {
      stepSkipped: false,
      totalSystemOrbits,
      starAllocations: withTotals,
      unassignedWorlds: 0,
    };
  }

  let remaining = worlds;
  for (let i = 0; i < withTotals.length; i++) {
    const star = withTotals[i];
    const rawWorldShare = (worlds * star.totalStarOrbits) / totalSystemOrbits;
    star.rawWorldShare = rawWorldShare;

    let assigned;
    if (i === withTotals.length - 1) {
      assigned = remaining;
    } else if (i === 0) {
      assigned = Math.ceil(rawWorldShare);
    } else {
      assigned = Math.floor(rawWorldShare);
    }

    assigned = Math.max(0, Math.min(assigned, remaining));
    star.assignedWorlds = assigned;
    remaining -= assigned;
  }

  return {
    stepSkipped: false,
    totalSystemOrbits,
    starAllocations: withTotals,
    unassignedWorlds: remaining,
  };
}

// â”€â”€ Placement Of Worlds: Step 2 (System Baseline Number) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate Step 2 DM total for baseline number roll.
 *
 * @param {object} options
 * @param {{ spectralClass?: string, luminosityClass?: string, type?: string }} options.primary
 * @param {number} options.totalWorlds
 * @param {number} [options.secondaryStarCount=0] - Cumulative DM-1 each.
 * @param {number} [options.companionStarCount=0] - Cumulative DM-1 each.
 * @returns {{ dm: number, breakdown: string[] }}
 */
export function calculateBaselineNumberDm({
  primary,
  totalWorlds,
  secondaryStarCount = 0,
  companionStarCount = 0,
} = {}) {
  const breakdown = [];
  let dm = 0;

  const lumClassRaw = String(primary?.luminosityClass ?? "").trim();
  const lumClass = lumClassRaw.toUpperCase();
  const spectral = String(primary?.spectralClass ?? "")
    .trim()
    .toUpperCase();

  const isPostStellar =
    spectral === "D" ||
    lumClass.includes("WD") ||
    lumClass === "D" ||
    ["NEUTRON STAR", "PULSAR", "BLACK HOLE"].includes(
      String(primary?.type ?? "")
        .trim()
        .toUpperCase(),
    );

  // Primary luminosity-class DMs
  if (lumClass === "IA" || lumClass === "IB" || lumClass === "II") {
    dm += 3;
    breakdown.push("DM+3: Primary class Ia/Ib/II");
  } else if (lumClass === "III") {
    dm += 2;
    breakdown.push("DM+2: Primary class III");
  } else if (lumClass === "IV") {
    dm += 1;
    breakdown.push("DM+1: Primary class IV");
  } else if (lumClass === "VI") {
    dm -= 1;
    breakdown.push("DM-1: Primary class VI");
  }

  if (isPostStellar) {
    dm -= 2;
    breakdown.push("DM-2: Primary is post-stellar");
  }

  // Total-worlds DMs
  const worlds = Number.isFinite(totalWorlds) ? Math.floor(totalWorlds) : 0;
  if (worlds < 6) {
    dm -= 4;
    breakdown.push("DM-4: Total worlds < 6");
  } else if (worlds <= 9) {
    dm -= 3;
    breakdown.push("DM-3: Total worlds 6-9");
  } else if (worlds <= 12) {
    dm -= 2;
    breakdown.push("DM-2: Total worlds 10-12");
  } else if (worlds <= 15) {
    dm -= 1;
    breakdown.push("DM-1: Total worlds 13-15");
  } else if (worlds >= 18 && worlds <= 20) {
    dm += 1;
    breakdown.push("DM+1: Total worlds 18-20");
  } else if (worlds > 20) {
    dm += 2;
    breakdown.push("DM+2: Total worlds > 20");
  }

  const secondaryCount = Math.max(0, Math.floor(Number(secondaryStarCount) || 0));
  if (secondaryCount > 0) {
    dm -= secondaryCount;
    breakdown.push(`DM-${secondaryCount}: ${secondaryCount} secondary star(s)`);
  }

  // Included to match the Zed example text where companions also apply cumulative penalties.
  const companionCount = Math.max(0, Math.floor(Number(companionStarCount) || 0));
  if (companionCount > 0) {
    dm -= companionCount;
    breakdown.push(`DM-${companionCount}: ${companionCount} companion star(s)`);
  }

  if (breakdown.length === 0) breakdown.push("No DMs applicable");
  return { dm, breakdown };
}

/**
 * Roll Step 2 baseline number as 2D + DMs.
 *
 * @param {object} options
 * @param {{ spectralClass?: string, luminosityClass?: string, type?: string }} options.primary
 * @param {number} options.totalWorlds
 * @param {number} [options.secondaryStarCount=0]
 * @param {number} [options.companionStarCount=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, dm: number, total: number, dmBreakdown: string[] }}
 */
export function rollBaselineNumber({
  primary,
  totalWorlds,
  secondaryStarCount = 0,
  companionStarCount = 0,
  rng = Math.random,
} = {}) {
  const roll = roll2d(rng);
  const { dm, breakdown } = calculateBaselineNumberDm({
    primary,
    totalWorlds,
    secondaryStarCount,
    companionStarCount,
  });
  return {
    roll,
    dm,
    total: roll + dm,
    dmBreakdown: breakdown,
  };
}

/**
 * Resolve Step 2 baseline number mode for the primary star:
 * - "rolled": HZCO is available to primary orbits -> 2D + DM
 * - "cold": HZCO unavailable and no inner-region primary orbits -> baseline 0
 * - "split": HZCO unavailable but inner-region primary orbits exist -> baseline = inner + 1
 *
 * @param {object} options
 * @param {number} options.hzco
 * @param {Array<{ min: number, max: number }>} options.primaryOrbits
 * @param {{ spectralClass?: string, luminosityClass?: string, type?: string }} options.primary
 * @param {number} options.totalWorlds
 * @param {number} [options.secondaryStarCount=0]
 * @param {number} [options.companionStarCount=0]
 * @param {number} [options.primaryAllocatedWorlds=0]
 * @param {number} [options.innerRegionWorldCount] - Optional override for split systems.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   mode: 'rolled'|'cold'|'split',
 *   hzcoAvailable: boolean,
 *   baselineNumber: number,
 *   roll: number|null,
 *   dm: number|null,
 *   dmBreakdown: string[],
 *   innerRegionWorldCount: number|null
 * }}
 */
export function determineSystemBaselineNumber({
  hzco,
  primaryOrbits = [],
  primary,
  totalWorlds,
  secondaryStarCount = 0,
  companionStarCount = 0,
  primaryAllocatedWorlds = 0,
  innerRegionWorldCount,
  rng = Math.random,
} = {}) {
  const finiteHzco = Number(hzco);
  if (!Number.isFinite(finiteHzco)) {
    return {
      mode: "cold",
      hzcoAvailable: false,
      baselineNumber: 0,
      roll: null,
      dm: null,
      dmBreakdown: ["HZCO unavailable or invalid"],
      innerRegionWorldCount: null,
    };
  }

  const normalizedRanges = primaryOrbits.filter(
    (r) => Number.isFinite(r?.min) && Number.isFinite(r?.max) && r.max > r.min,
  );

  const hzcoAvailable = normalizedRanges.some((r) => finiteHzco >= r.min && finiteHzco <= r.max);
  if (hzcoAvailable) {
    const { roll, dm, total, dmBreakdown } = rollBaselineNumber({
      primary,
      totalWorlds,
      secondaryStarCount,
      companionStarCount,
      rng,
    });
    return {
      mode: "rolled",
      hzcoAvailable: true,
      baselineNumber: total,
      roll,
      dm,
      dmBreakdown,
      innerRegionWorldCount: null,
    };
  }

  const hasInnerRegion = normalizedRanges.some((r) => r.max < finiteHzco);
  if (!hasInnerRegion) {
    return {
      mode: "cold",
      hzcoAvailable: false,
      baselineNumber: 0,
      roll: null,
      dm: null,
      dmBreakdown: ["HZCO unavailable and no inner-region primary orbits"],
      innerRegionWorldCount: null,
    };
  }

  const maxInnerWorlds = Math.max(0, Math.floor(Number(primaryAllocatedWorlds) || 0));
  let innerCount;
  if (Number.isFinite(innerRegionWorldCount)) {
    innerCount = Math.floor(Number(innerRegionWorldCount));
  } else {
    innerCount = Math.floor(rng() * (maxInnerWorlds + 1));
  }
  innerCount = Math.max(0, Math.min(innerCount, maxInnerWorlds));

  return {
    mode: "split",
    hzcoAvailable: false,
    baselineNumber: innerCount + 1,
    roll: null,
    dm: null,
    dmBreakdown: ["HZCO unavailable; split system baseline derived from inner-region world count"],
    innerRegionWorldCount: innerCount,
  };
}

// â”€â”€ Placement Of Worlds: Step 3 (System Baseline Orbit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns true if an orbit lies inside any available primary range.
 *
 * @param {number} orbit
 * @param {Array<{ min: number, max: number }>} ranges
 * @returns {boolean}
 */
function isOrbitInAvailableRanges(orbit, ranges = []) {
  return ranges.some((r) => Number.isFinite(r?.min) && Number.isFinite(r?.max) && orbit >= r.min && orbit <= r.max);
}

/**
 * Move an orbit into the nearest available range, adding 2D-7 / 10 variance
 * inward from the chosen boundary regardless of sign.
 *
 * @param {number} orbit
 * @param {Array<{ min: number, max: number }>} ranges
 * @param {Function} [rng=Math.random]
 * @returns {{ orbit: number, adjusted: boolean, varianceRoll: number|null }}
 */
export function adjustOrbitIntoAvailableRange(orbit, ranges = [], rng = Math.random) {
  if (!Number.isFinite(orbit)) return { orbit: null, adjusted: false, varianceRoll: null };

  const normalizedRanges = ranges
    .filter((r) => Number.isFinite(r?.min) && Number.isFinite(r?.max) && r.max > r.min)
    .map((r) => ({ min: r.min, max: r.max }));

  if (normalizedRanges.length === 0) {
    return { orbit, adjusted: false, varianceRoll: null };
  }

  if (isOrbitInAvailableRanges(orbit, normalizedRanges)) {
    return { orbit, adjusted: false, varianceRoll: null };
  }

  let nearest = null;
  for (const range of normalizedRanges) {
    const candidates = [
      { edge: "min", boundary: range.min },
      { edge: "max", boundary: range.max },
    ];
    for (const c of candidates) {
      const distance = Math.abs(orbit - c.boundary);
      if (
        nearest === null ||
        distance < nearest.distance ||
        (distance === nearest.distance && c.boundary < nearest.boundary)
      ) {
        nearest = { ...c, distance, range };
      }
    }
  }

  const varianceRoll = roll2d(rng) - 7;
  const inwardVariance = Math.abs(varianceRoll) / 10;

  let adjustedOrbit = nearest.boundary;
  if (nearest.edge === "min") {
    adjustedOrbit = nearest.boundary + inwardVariance;
    adjustedOrbit = Math.min(adjustedOrbit, nearest.range.max);
  } else {
    adjustedOrbit = nearest.boundary - inwardVariance;
    adjustedOrbit = Math.max(adjustedOrbit, nearest.range.min);
  }

  return {
    orbit: adjustedOrbit,
    adjusted: true,
    varianceRoll,
  };
}

/**
 * Determine the Step 3 baseline Orbit# from baseline number and system state.
 *
 * Modes:
 * - between: 1 <= baselineNumber <= totalWorlds (Step 3A)
 * - cold: baselineNumber < 1 (Step 3B)
 * - hot: baselineNumber > totalWorlds (Step 3C)
 *
 * If the computed orbit is unavailable, shift it to nearest available range
 * with 2D-7 / 10 inward variance.
 *
 * @param {object} options
 * @param {number} options.baselineNumber
 * @param {number} options.totalWorlds
 * @param {number} options.hzco
 * @param {number} [options.minimumOrbit] - Primary minimum orbit; if omitted, derived from ranges.
 * @param {number} [options.primaryMao=0]
 * @param {Array<{ min: number, max: number }>} [options.primaryOrbits=[]]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   mode: 'between'|'cold'|'hot',
 *   rawBaselineOrbit: number|null,
 *   baselineOrbit: number|null,
 *   formulaRoll: number|null,
 *   adjustedForAvailability: boolean,
 *   adjustmentRoll: number|null
 * }}
 */
export function determineSystemBaselineOrbit({
  baselineNumber,
  totalWorlds,
  hzco,
  minimumOrbit,
  primaryMao = 0,
  primaryOrbits = [],
  rng = Math.random,
} = {}) {
  const bn = Number(baselineNumber);
  const worlds = Number.isFinite(totalWorlds) ? Math.floor(totalWorlds) : 0;
  const hz = Number(hzco);

  if (!Number.isFinite(bn) || !Number.isFinite(hz)) {
    return {
      mode: "cold",
      rawBaselineOrbit: null,
      baselineOrbit: null,
      formulaRoll: null,
      adjustedForAvailability: false,
      adjustmentRoll: null,
    };
  }

  const normalizedRanges = primaryOrbits.filter(
    (r) => Number.isFinite(r?.min) && Number.isFinite(r?.max) && r.max > r.min,
  );
  const derivedMinOrbit = normalizedRanges.length > 0 ? Math.min(...normalizedRanges.map((r) => r.min)) : 0;
  const minOrbitUsed = Number.isFinite(minimumOrbit) ? Number(minimumOrbit) : derivedMinOrbit;

  let mode;
  let rawBaselineOrbit;
  let formulaRoll = null;

  if (bn >= 1 && bn <= worlds) {
    mode = "between";
    formulaRoll = roll2d(rng) - 7;
    const divisor = hz >= 1 ? 10 : 100;
    rawBaselineOrbit = hz + formulaRoll / divisor;
  } else if (bn < 1) {
    mode = "cold";
    formulaRoll = roll2d(rng) - 2;
    if (minOrbitUsed >= 1) {
      rawBaselineOrbit = hz - bn + worlds + formulaRoll / 10;
    } else {
      rawBaselineOrbit = minOrbitUsed - bn / 10 + formulaRoll / 100;
    }
  } else {
    mode = "hot";
    formulaRoll = roll2d(rng) - 7;
    const highResult = hz - bn + worlds;
    if (highResult >= 1) {
      rawBaselineOrbit = highResult + formulaRoll / 5;
    } else {
      rawBaselineOrbit = hz - (bn + worlds + formulaRoll / 5) / 10;
      if (rawBaselineOrbit < 0) {
        const mao = Number.isFinite(primaryMao) ? Number(primaryMao) : 0;
        const floorOrbit = mao + worlds * 0.01;
        rawBaselineOrbit = Math.max(hz - 0.1, floorOrbit);
      }
    }
  }

  const adjusted = adjustOrbitIntoAvailableRange(rawBaselineOrbit, normalizedRanges, rng);
  return {
    mode,
    rawBaselineOrbit,
    baselineOrbit: adjusted.orbit,
    formulaRoll,
    adjustedForAvailability: adjusted.adjusted,
    adjustmentRoll: adjusted.varianceRoll,
  };
}

// â”€â”€ Placement Of Worlds: Step 4 (Empty Orbits) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 14: Empty Orbit quantity from a 2D roll.
 *
 * @param {number} total - 2D roll total
 * @returns {number}
 */
export function lookupEmptyOrbitQuantity(total) {
  if (total <= 9) return 0;
  if (total === 10) return 1;
  if (total === 11) return 2;
  return 3; // 12+
}

/**
 * Roll Empty Orbit quantity from Table 14.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, quantity: number }}
 */
export function rollEmptyOrbitQuantity({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return {
    roll,
    quantity: lookupEmptyOrbitQuantity(roll),
  };
}

/**
 * Allocate rolled empty orbits to stars.
 *
 * System-level placement order (WBH Step 4):
 * 1) Close zone star orbits (if possible)
 * 2) Near zone star orbits (if possible)
 * 3) Far zone star orbits (if possible)
 * 4) Remaining empties to primary star
 *
 * Only stars with some available orbits may receive empty-orbit slots.
 *
 * @param {object} options
 * @param {number} options.emptyOrbitCount
 * @param {Array<{
 *   starKey: string,
 *   totalStarOrbits: number,
 *   allowableOrbits?: number,
 *   assignedWorlds?: number
 * }>} options.starAllocations
 * @param {Array<{ zone?: string, orbitNumber?: number }>} [options.secondaries=[]]
 * @returns {{
 *   emptyOrbitCount: number,
 *   unallocatedEmptyOrbits: number,
 *   placements: Array<{ starKey: string, reason: string }>,
 *   starAllocations: Array<{
 *     starKey: string,
 *     totalStarOrbits: number,
 *     allowableOrbits?: number,
 *     assignedWorlds?: number,
 *     emptyOrbitSlots: number,
 *     totalStarOrbitsWithEmpty: number
 *   }>
 * }}
 */
export function allocateEmptyOrbits({ emptyOrbitCount, starAllocations = [], secondaries = [] } = {}) {
  const quantity = Math.max(0, Math.floor(Number(emptyOrbitCount) || 0));
  const updatedAllocations = starAllocations.map((star) => {
    const totalStarOrbits = Number.isFinite(star?.totalStarOrbits) ? star.totalStarOrbits : 0;
    return {
      ...star,
      emptyOrbitSlots: 0,
      totalStarOrbitsWithEmpty: totalStarOrbits,
    };
  });

  const byKey = new Map(updatedAllocations.map((star) => [star.starKey, star]));

  const hasAvailableOrbits = (starKey) => {
    const star = byKey.get(starKey);
    if (!star) return false;
    const allowable = Number(star.allowableOrbits);
    if (Number.isFinite(allowable)) return allowable > 0;
    const totalOrbits = Number(star.totalStarOrbits);
    return Number.isFinite(totalOrbits) && totalOrbits > 0;
  };

  const placements = [];
  let remaining = quantity;

  const zoneOrder = ["close", "near", "far"];
  for (const zoneName of zoneOrder) {
    if (remaining <= 0) break;

    const candidates = secondaries
      .map((secondary, index) => ({
        zone: String(secondary?.zone ?? "").toLowerCase(),
        orbitNumber: Number(secondary?.orbitNumber ?? Number.POSITIVE_INFINITY),
        starKey: `secondary-${index + 1}`,
      }))
      .filter((candidate) => candidate.zone === zoneName && hasAvailableOrbits(candidate.starKey))
      .sort((a, b) => a.orbitNumber - b.orbitNumber);

    if (candidates.length > 0) {
      const selected = candidates[0];
      const record = byKey.get(selected.starKey);
      record.emptyOrbitSlots += 1;
      record.totalStarOrbitsWithEmpty = record.totalStarOrbits + record.emptyOrbitSlots;
      placements.push({ starKey: selected.starKey, reason: `zone-priority-${zoneName}` });
      remaining -= 1;
    }
  }

  if (remaining > 0 && hasAvailableOrbits("primary")) {
    const primary = byKey.get("primary");
    primary.emptyOrbitSlots += remaining;
    primary.totalStarOrbitsWithEmpty = primary.totalStarOrbits + primary.emptyOrbitSlots;
    for (let i = 0; i < remaining; i++) {
      placements.push({ starKey: "primary", reason: "primary-remainder" });
    }
    remaining = 0;
  }

  return {
    emptyOrbitCount: quantity,
    unallocatedEmptyOrbits: remaining,
    placements,
    starAllocations: updatedAllocations,
  };
}

// â”€â”€ Placement Of Worlds: Step 5 (System Spread) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Calculate Step 5 system spread.
 *
 * Base formula:
 *   Spread = (Baseline Orbit# - MAO) / Baseline Number
 * with Baseline Number treated as 1 when baselineNumber < 1.
 *
 * Optional cap when spread would place outer slots beyond Orbit# 20:
 *   Maximum Spread = Primary Available Orbits / (Primary Allocated Orbits + Total Stars)
 *
 * @param {object} options
 * @param {number} options.baselineOrbit
 * @param {number} options.baselineNumber
 * @param {number} options.primaryMao
 * @param {number} [options.primaryAvailableOrbits] - If omitted, derived from primaryOrbits.
 * @param {Array<{ min: number, max: number }>} [options.primaryOrbits=[]]
 * @param {number} [options.primaryAllocatedOrbits=0]
 * @param {number} [options.totalStars=1]
 * @returns {{
 *   baselineDivisor: number,
 *   rawSpread: number,
 *   spread: number,
 *   roundedSpread: number,
 *   maxSpread: number|null,
 *   projectedOutermostOrbit: number|null,
 *   cappedByMaximumSpread: boolean
 * }|null}
 */
export function calculateSystemSpread({
  baselineOrbit,
  baselineNumber,
  primaryMao,
  primaryAvailableOrbits,
  primaryOrbits = [],
  primaryAllocatedOrbits = 0,
  totalStars = 1,
} = {}) {
  const bo = Number(baselineOrbit);
  const bn = Number(baselineNumber);
  const mao = Number(primaryMao);

  if (!Number.isFinite(bo) || !Number.isFinite(mao) || !Number.isFinite(bn)) return null;

  const baselineDivisor = bn < 1 ? 1 : bn;
  const rawSpread = (bo - mao) / baselineDivisor;
  let spread = Math.max(0, rawSpread);

  const derivedAvailable = Number.isFinite(primaryAvailableOrbits)
    ? Number(primaryAvailableOrbits)
    : sumAllowableOrbitSpan(primaryOrbits);
  const allocated = Math.max(0, Math.floor(Number(primaryAllocatedOrbits) || 0));
  const starCount = Math.max(1, Math.floor(Number(totalStars) || 1));

  const denominator = allocated + starCount;
  const maxSpread = denominator > 0 ? derivedAvailable / denominator : null;

  let projectedOutermostOrbit = null;
  let cappedByMaximumSpread = false;

  if (allocated > 0) {
    const baselineIndex = Math.min(Math.max(1, Math.floor(baselineDivisor)), allocated);
    const outwardSlots = Math.max(0, allocated - baselineIndex);
    projectedOutermostOrbit = bo + outwardSlots * spread;

    if (projectedOutermostOrbit > 20 && Number.isFinite(maxSpread)) {
      const capped = Math.min(spread, Math.max(0, maxSpread));
      cappedByMaximumSpread = capped < spread;
      spread = capped;
      projectedOutermostOrbit = bo + outwardSlots * spread;
    }
  }

  return {
    baselineDivisor,
    rawSpread,
    spread,
    roundedSpread: Math.round(spread * 100) / 100,
    maxSpread: Number.isFinite(maxSpread) ? maxSpread : null,
    projectedOutermostOrbit,
    cappedByMaximumSpread,
  };
}

/**
 * Calculate Step 5 spread for a secondary star.
 *
 * Default is system spread. If secondary maximum spread exceeds system spread,
 * it may be raised to:
 *   (Outermost Allowable Orbit# - Secondary MAO) / (Secondary Allocated Orbits + 1)
 *
 * @param {object} options
 * @param {number} options.systemSpread
 * @param {number} options.secondaryMao
 * @param {number} options.secondaryOutermostOrbit
 * @param {number} [options.secondaryAllocatedOrbits=0]
 * @returns {{
 *   spread: number,
 *   roundedSpread: number,
 *   maxSecondarySpread: number|null,
 *   usedSecondaryMaximum: boolean
 * }|null}
 */
export function calculateSecondarySpread({
  systemSpread,
  secondaryMao,
  secondaryOutermostOrbit,
  secondaryAllocatedOrbits = 0,
} = {}) {
  const sys = Number(systemSpread);
  const mao = Number(secondaryMao);
  const outer = Number(secondaryOutermostOrbit);
  const allocated = Math.max(0, Math.floor(Number(secondaryAllocatedOrbits) || 0));

  if (!Number.isFinite(sys) || !Number.isFinite(mao) || !Number.isFinite(outer)) return null;

  const denominator = allocated + 1;
  const maxSecondarySpread = denominator > 0 ? (outer - mao) / denominator : null;

  let spread = sys;
  let usedSecondaryMaximum = false;
  if (Number.isFinite(maxSecondarySpread) && maxSecondarySpread > sys) {
    spread = maxSecondarySpread;
    usedSecondaryMaximum = true;
  }

  return {
    spread,
    roundedSpread: Math.round(spread * 100) / 100,
    maxSecondarySpread: Number.isFinite(maxSecondarySpread) ? maxSecondarySpread : null,
    usedSecondaryMaximum,
  };
}

/**
 * Compute spreads for all secondary stars from available-orbit and allocation data.
 *
 * @param {object} options
 * @param {number} options.systemSpread
 * @param {Array<{ min?: number, mao?: number, max?: number }>} [options.secondaryOrbits=[]]
 * @param {Array<{ starKey: string, totalStarOrbitsWithEmpty?: number, totalStarOrbits?: number, assignedWorlds?: number }>} [options.starAllocations=[]]
 * @returns {Array<{
 *   starKey: string,
 *   spread: number,
 *   roundedSpread: number,
 *   maxSecondarySpread: number|null,
 *   usedSecondaryMaximum: boolean
 * }>}
 */
export function calculateSecondarySpreads({ systemSpread, secondaryOrbits = [], starAllocations = [] } = {}) {
  return secondaryOrbits.map((secondary, index) => {
    const starKey = `secondary-${index + 1}`;
    const allocation = starAllocations.find((s) => s.starKey === starKey) ?? {};
    const secondaryAllocatedOrbits = Number.isFinite(allocation.totalStarOrbitsWithEmpty)
      ? allocation.totalStarOrbitsWithEmpty
      : Number.isFinite(allocation.totalStarOrbits)
        ? allocation.totalStarOrbits
        : Math.max(0, Math.floor(Number(allocation.assignedWorlds) || 0));

    const mao = Number.isFinite(secondary.min) ? secondary.min : secondary.mao;
    const result = calculateSecondarySpread({
      systemSpread,
      secondaryMao: mao,
      secondaryOutermostOrbit: secondary.max,
      secondaryAllocatedOrbits,
    });

    return {
      starKey,
      ...(result ?? {
        spread: systemSpread,
        roundedSpread: Math.round(Number(systemSpread) * 100) / 100,
        maxSecondarySpread: null,
        usedSecondaryMaximum: false,
      }),
    };
  });
}

// â”€â”€ Placement Of Worlds: Step 6 (Placing Orbit# Slots) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function normalizeAvailableRanges(ranges = []) {
  return ranges
    .filter((r) => Number.isFinite(r?.min) && Number.isFinite(r?.max) && r.max > r.min)
    .map((r) => ({ min: r.min, max: r.max }))
    .sort((a, b) => a.min - b.min);
}

function roundOrbitWithOptions(orbit, { roundingDigits = 2, roundingDigitsAtOrAboveOne = null } = {}) {
  if (!Number.isFinite(orbit)) return orbit;

  let digits = roundingDigits;
  if (orbit >= 1 && Number.isFinite(roundingDigitsAtOrAboveOne)) {
    digits = roundingDigitsAtOrAboveOne;
  }

  if (!Number.isFinite(digits) || digits < 0) return orbit;
  const factor = 10 ** Math.floor(digits);
  return Math.round(orbit * factor) / factor;
}

function applyMinimumSeparation(currentOrbit, previousOrbit, minimumSeparationFraction) {
  if (!Number.isFinite(currentOrbit) || !Number.isFinite(previousOrbit)) return currentOrbit;
  if (!Number.isFinite(minimumSeparationFraction) || minimumSeparationFraction <= 0) return currentOrbit;

  if (Math.floor(currentOrbit) === Math.floor(previousOrbit)) {
    const minAllowed = previousOrbit * (1 + minimumSeparationFraction);
    return Math.max(currentOrbit, minAllowed);
  }

  return currentOrbit;
}

/**
 * Shift an orbit outward by exclusion-zone widths until it lands inside an
 * available range (or no further range exists).
 *
 * @param {number} orbit
 * @param {Array<{ min: number, max: number }>} ranges
 * @returns {{ orbit: number, totalShift: number, gapWidths: number[], stillUnavailable: boolean }}
 */
export function shiftOrbitAcrossExclusions(orbit, ranges = []) {
  if (!Number.isFinite(orbit)) {
    return { orbit: null, totalShift: 0, gapWidths: [], stillUnavailable: true };
  }

  const normalized = normalizeAvailableRanges(ranges);
  if (normalized.length === 0) {
    return { orbit, totalShift: 0, gapWidths: [], stillUnavailable: false };
  }

  if (isOrbitInAvailableRanges(orbit, normalized)) {
    return { orbit, totalShift: 0, gapWidths: [], stillUnavailable: false };
  }

  let adjusted = orbit;
  let totalShift = 0;
  const gapWidths = [];
  const epsilon = 1e-9;

  // If below the first available range, move directly to that range.
  if (adjusted < normalized[0].min) {
    const width = normalized[0].min - adjusted;
    adjusted = normalized[0].min;
    totalShift += width;
    gapWidths.push(width);
  }

  let moved = true;
  let guard = 0;
  while (!isOrbitInAvailableRanges(adjusted, normalized) && moved && guard < 20) {
    moved = false;
    guard += 1;

    for (let i = 0; i < normalized.length - 1; i++) {
      const left = normalized[i];
      const right = normalized[i + 1];

      if (adjusted > left.max + epsilon && adjusted < right.min - epsilon) {
        const gapWidth = right.min - left.max;
        adjusted += gapWidth;
        totalShift += gapWidth;
        gapWidths.push(gapWidth);
        moved = true;
        break;
      }
    }
  }

  return {
    orbit: adjusted,
    totalShift,
    gapWidths,
    stillUnavailable: !isOrbitInAvailableRanges(adjusted, normalized),
  };
}

/**
 * Place orbit slots for a star or star pair around a baseline orbit.
 *
 * Inner slot formula:
 *   (MAO + Spread) + ((2D-7) * Spread) / 10
 *
 * Next slot formula:
 *   (Previous Slot + Spread) + ((2D-7) * Spread) / 10
 *
 * For slots outside baseline, if a candidate lies in an unavailable orbit,
 * exclusion-gap widths are added to push the slot into the next allowable zone.
 *
 * @param {object} options
 * @param {number} options.slotCount
 * @param {number} options.mao
 * @param {number} options.spread
 * @param {number} options.baselineNumber
 * @param {number} options.baselineOrbit
 * @param {Array<{ min: number, max: number }>} [options.availableOrbits=[]]
 * @param {boolean} [options.useVariance=true]
 * @param {boolean} [options.propagateVaried=true] - If false, next slot references previous nominal orbit.
 * @param {boolean} [options.adjustUnavailableOutsideBaseline=true]
 * @param {number} [options.minimumSeparationFraction=0] - Optional compact-system rule (e.g. 0.1 or 0.2).
 * @param {number} [options.roundingDigits=2]
 * @param {number|null} [options.roundingDigitsAtOrAboveOne=null]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   baselineIndex: number,
 *   slots: Array<{
 *     slotNumber: number,
 *     orbit: number,
 *     nominalOrbit: number,
 *     varianceRoll: number|null,
 *     varianceDelta: number,
 *     exclusionShift: number,
 *     exclusionGapWidths: number[]
 *   }>
 * }}
 */
export function placeStarOrbitSlots({
  slotCount,
  mao,
  spread,
  baselineNumber,
  baselineOrbit,
  availableOrbits = [],
  useVariance = true,
  propagateVaried = true,
  adjustUnavailableOutsideBaseline = true,
  minimumSeparationFraction = 0,
  roundingDigits = 2,
  roundingDigitsAtOrAboveOne = null,
  rng = Math.random,
} = {}) {
  const count = Math.max(0, Math.floor(Number(slotCount) || 0));
  const maoVal = Number(mao);
  const spreadVal = Number(spread);
  const baselineVal = Number(baselineOrbit);
  const available = normalizeAvailableRanges(availableOrbits);

  if (count === 0 || !Number.isFinite(maoVal) || !Number.isFinite(spreadVal) || !Number.isFinite(baselineVal)) {
    return { baselineIndex: 0, slots: [] };
  }

  const bn = Number(baselineNumber);
  let baselineIndex;
  if (bn < 1) baselineIndex = 1;
  else if (bn > count) baselineIndex = count;
  else baselineIndex = Math.max(1, Math.min(count, Math.floor(bn)));

  const slots = Array.from({ length: count }, (_, i) => ({
    slotNumber: i + 1,
    orbit: null,
    nominalOrbit: null,
    varianceRoll: null,
    varianceDelta: 0,
    exclusionShift: 0,
    exclusionGapWidths: [],
  }));

  // Baseline slot is predetermined by Step 3.
  slots[baselineIndex - 1] = {
    ...slots[baselineIndex - 1],
    orbit: roundOrbitWithOptions(baselineVal, {
      roundingDigits,
      roundingDigitsAtOrAboveOne,
    }),
    nominalOrbit: baselineVal,
  };

  // Inner slots (1..baselineIndex-1)
  for (let slotNum = 1; slotNum < baselineIndex; slotNum++) {
    const prevSlot = slotNum === 1 ? null : slots[slotNum - 2];
    const prevReference = slotNum === 1 ? maoVal : propagateVaried ? prevSlot.orbit : prevSlot.nominalOrbit;

    const nominalOrbit = prevReference + spreadVal;
    const varianceRoll = useVariance ? roll2d(rng) - 7 : null;
    const varianceDelta = varianceRoll !== null ? (varianceRoll * spreadVal) / 10 : 0;

    let orbit = nominalOrbit + varianceDelta;
    if (slotNum > 1) {
      orbit = applyMinimumSeparation(orbit, slots[slotNum - 2].orbit, minimumSeparationFraction);
    }
    orbit = roundOrbitWithOptions(orbit, {
      roundingDigits,
      roundingDigitsAtOrAboveOne,
    });

    slots[slotNum - 1] = {
      ...slots[slotNum - 1],
      orbit,
      nominalOrbit,
      varianceRoll,
      varianceDelta,
    };
  }

  // Outer slots (baselineIndex+1..count)
  for (let slotNum = baselineIndex + 1; slotNum <= count; slotNum++) {
    const prevSlot = slots[slotNum - 2];
    const prevReference = propagateVaried ? prevSlot.orbit : prevSlot.nominalOrbit;

    const nominalOrbit = prevReference + spreadVal;
    const varianceRoll = useVariance ? roll2d(rng) - 7 : null;
    const varianceDelta = varianceRoll !== null ? (varianceRoll * spreadVal) / 10 : 0;

    let orbit = nominalOrbit + varianceDelta;
    let exclusionShift = 0;
    let exclusionGapWidths = [];

    if (adjustUnavailableOutsideBaseline && available.length > 0) {
      const shifted = shiftOrbitAcrossExclusions(orbit, available);
      orbit = shifted.orbit;
      exclusionShift = shifted.totalShift;
      exclusionGapWidths = shifted.gapWidths;
    }

    orbit = applyMinimumSeparation(orbit, prevSlot.orbit, minimumSeparationFraction);
    orbit = roundOrbitWithOptions(orbit, {
      roundingDigits,
      roundingDigitsAtOrAboveOne,
    });

    slots[slotNum - 1] = {
      ...slots[slotNum - 1],
      orbit,
      nominalOrbit,
      varianceRoll,
      varianceDelta,
      exclusionShift,
      exclusionGapWidths,
    };
  }

  return {
    baselineIndex,
    slots,
  };
}

// â”€â”€ Placement Of Worlds: Step 7 (Anomalous Planets) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 15: Anomalous Orbit quantity from a 2D roll.
 *
 * @param {number} total - 2D roll total
 * @returns {number}
 */
export function lookupAnomalousOrbitQuantity(total) {
  if (total <= 9) return 0;
  if (total === 10) return 1;
  if (total === 11) return 2;
  return 3; // 12+
}

/**
 * Roll anomalous orbit quantity from Table 15.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, quantity: number }}
 */
export function rollAnomalousOrbitQuantity({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return {
    roll,
    quantity: lookupAnomalousOrbitQuantity(roll),
  };
}

/**
 * Table 16: Anomalous Orbit Type from a 2D roll.
 *
 * @param {number} total - 2D roll total
 * @returns {'random'|'eccentric'|'inclined'|'retrograde'|'trojan'}
 */
export function lookupAnomalousOrbitType(total) {
  if (total <= 7) return "random";
  if (total === 8) return "eccentric";
  if (total === 9) return "inclined";
  if (total <= 11) return "retrograde";
  return "trojan";
}

/**
 * Roll anomalous orbit type from Table 16.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, type: 'random'|'eccentric'|'inclined'|'retrograde'|'trojan' }}
 */
export function rollAnomalousOrbitType({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return {
    roll,
    type: lookupAnomalousOrbitType(roll),
  };
}

/**
 * Apply anomalous-orbit quantity to body counts with terrestrial cap.
 *
 * - Each anomalous orbit increases total worlds by 1.
 * - Terrestrial worlds cannot exceed 13.
 * - Overflow anomalous worlds become planetoid belts.
 *
 * @param {object} options
 * @param {number} options.anomalousOrbitCount
 * @param {number} options.terrestrialPlanetCount
 * @param {number} options.planetoidBeltCount
 * @param {number} options.totalWorlds
 * @returns {{
 *   terrestrialPlanetCount: number,
 *   planetoidBeltCount: number,
 *   totalWorlds: number,
 *   anomalousAsTerrestrial: number,
 *   anomalousAsBelts: number
 * }}
 */
export function applyAnomalousOrbitCount({
  anomalousOrbitCount,
  terrestrialPlanetCount,
  planetoidBeltCount,
  totalWorlds,
} = {}) {
  const count = Math.max(0, Math.floor(Number(anomalousOrbitCount) || 0));
  const terrestrial = Math.max(0, Math.floor(Number(terrestrialPlanetCount) || 0));
  const belts = Math.max(0, Math.floor(Number(planetoidBeltCount) || 0));
  const worlds = Math.max(0, Math.floor(Number(totalWorlds) || 0));

  const terrestrialRoom = Math.max(0, 13 - terrestrial);
  const anomalousAsTerrestrial = Math.min(count, terrestrialRoom);
  const anomalousAsBelts = count - anomalousAsTerrestrial;

  return {
    terrestrialPlanetCount: terrestrial + anomalousAsTerrestrial,
    planetoidBeltCount: belts + anomalousAsBelts,
    totalWorlds: worlds + count,
    anomalousAsTerrestrial,
    anomalousAsBelts,
  };
}

/**
 * Select a star/star-pair for an anomalous orbit.
 * Eligible parents must have non-zero allowable or total star orbits.
 *
 * @param {object} options
 * @param {Array<{ starKey: string, allowableOrbits?: number, totalStarOrbits?: number, mao?: number, availableOrbits?: Array<{min:number,max:number}>, slotOrbits?: number[] }>} options.parents
 * @param {Function} [options.rng=Math.random]
 * @returns {{ starKey: string, allowableOrbits?: number, totalStarOrbits?: number, mao?: number, availableOrbits?: Array<{min:number,max:number}>, slotOrbits?: number[] }|null}
 */
export function selectAnomalousOrbitParent({ parents = [], rng = Math.random } = {}) {
  const eligible = parents.filter((p) => {
    const allowable = Number(p?.allowableOrbits);
    const total = Number(p?.totalStarOrbits);
    if (Number.isFinite(allowable)) return allowable > 0;
    if (Number.isFinite(total)) return total > 0;
    return false;
  });

  if (eligible.length === 0) return null;
  const idx = Math.min(eligible.length - 1, Math.floor(rng() * eligible.length));
  return eligible[idx];
}

function nearestBoundaryDistance(orbit, ranges) {
  let nearest = Number.POSITIVE_INFINITY;
  for (const r of ranges) {
    nearest = Math.min(nearest, Math.abs(orbit - r.min), Math.abs(orbit - r.max));
  }
  return nearest;
}

function isWithinLeewayOfAvailability(orbit, ranges, leewayPercent) {
  if (leewayPercent <= 0) return false;
  if (isOrbitInAvailableRanges(orbit, ranges)) return true;

  let closestBoundary = null;
  for (const r of ranges) {
    for (const b of [r.min, r.max]) {
      const d = Math.abs(orbit - b);
      if (closestBoundary === null || d < closestBoundary.distance) {
        closestBoundary = { boundary: b, distance: d };
      }
    }
  }

  if (!closestBoundary) return false;
  const threshold = Math.abs(closestBoundary.boundary) * leewayPercent;
  return closestBoundary.distance <= threshold;
}

/**
 * Roll a random anomalous orbit around a selected parent star.
 *
 * Base random orbit roll:
 * - Orbit integer = 2D - 2
 * - Fraction = d10 / 10
 *
 * If unavailable, optional handling:
 * - leeway acceptance near boundaries (percent-based), or
 * - repeated +/-1D nudges toward the nearest available zone.
 *
 * @param {object} options
 * @param {number} options.mao
 * @param {Array<{ min: number, max: number }>} [options.availableOrbits=[]]
 * @param {number} [options.allowLeewayPercent=0]
 * @param {boolean} [options.nudgeWhenUnavailable=true]
 * @param {number} [options.maxNudges=8]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   orbit: number,
 *   integerRoll: number,
 *   fractionalRoll: number,
 *   unavailableInitially: boolean,
 *   acceptedByLeeway: boolean,
 *   nudges: number[]
 * }}
 */
export function rollRandomAnomalousOrbit({
  mao,
  availableOrbits = [],
  allowLeewayPercent = 0,
  nudgeWhenUnavailable = true,
  maxNudges = 8,
  rng = Math.random,
} = {}) {
  const maoValue = Number.isFinite(mao) ? Number(mao) : 0;
  const ranges = normalizeAvailableRanges(availableOrbits);

  const integerRoll = roll2d(rng) - 2;
  const fractionalRoll = roll1d10(rng);
  let orbit = integerRoll + fractionalRoll / 10;
  orbit = Math.max(maoValue, Math.min(20, orbit));

  const unavailableInitially = ranges.length > 0 && !isOrbitInAvailableRanges(orbit, ranges);
  let acceptedByLeeway = false;
  const nudges = [];

  if (unavailableInitially && ranges.length > 0) {
    if (isWithinLeewayOfAvailability(orbit, ranges, allowLeewayPercent)) {
      acceptedByLeeway = true;
    } else if (nudgeWhenUnavailable) {
      let attempts = 0;
      while (!isOrbitInAvailableRanges(orbit, ranges) && attempts < maxNudges) {
        attempts += 1;
        const nudge = roll1d(rng);
        nudges.push(nudge);

        // Move toward nearest available boundary.
        let direction = 1;
        let nearest = null;
        for (const r of ranges) {
          for (const b of [r.min, r.max]) {
            const d = Math.abs(orbit - b);
            if (nearest === null || d < nearest.distance) {
              nearest = { boundary: b, distance: d };
            }
          }
        }
        if (nearest && nearest.boundary < orbit) direction = -1;

        orbit += direction * nudge;
        orbit = Math.max(maoValue, Math.min(20, orbit));
      }

      if (!isOrbitInAvailableRanges(orbit, ranges)) {
        const shifted = adjustOrbitIntoAvailableRange(orbit, ranges, rng);
        orbit = shifted.orbit;
      }
    }
  }

  return {
    orbit,
    integerRoll,
    fractionalRoll,
    unavailableInitially,
    acceptedByLeeway,
    nudges,
  };
}

/**
 * Generate a single anomalous orbit record by type.
 *
 * @param {object} options
 * @param {'random'|'eccentric'|'inclined'|'retrograde'|'trojan'} options.type
 * @param {Array<{ starKey: string, allowableOrbits?: number, totalStarOrbits?: number, mao?: number, availableOrbits?: Array<{min:number,max:number}>, slotOrbits?: number[] }>} options.parents
 * @param {boolean} [options.retrogradeInclined=false] - If true, retrograde also gets inclination (+90 rule).
 * @param {number} [options.allowLeewayPercent=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   type: string,
 *   starKey: string|null,
 *   orbit: number|null,
 *   eccentricityDm: number,
 *   inclinationDegrees: number|null,
 *   retrograde: boolean,
 *   trojanPosition: 'leading'|'trailing'|null,
 *   source: object
 * }}
 */
export function generateAnomalousOrbit({
  type,
  parents = [],
  retrogradeInclined = false,
  allowLeewayPercent = 0,
  rng = Math.random,
} = {}) {
  const parent = selectAnomalousOrbitParent({ parents, rng });
  if (!parent) {
    return {
      type,
      starKey: null,
      orbit: null,
      eccentricityDm: 0,
      inclinationDegrees: null,
      retrograde: false,
      trojanPosition: null,
      source: { error: "no-eligible-parent" },
    };
  }

  const effectiveType = ["random", "eccentric", "inclined", "retrograde", "trojan"].includes(type) ? type : "random";

  let eccentricityDm = 0;
  let inclinationDegrees = null;
  let retrograde = false;
  let trojanPosition = null;
  let orbit = null;
  let source = {};

  if (effectiveType === "trojan") {
    const slots = (parent.slotOrbits ?? []).filter((o) => Number.isFinite(o));
    if (slots.length > 0) {
      const orbitIndex = Math.min(slots.length - 1, Math.floor(rng() * slots.length));
      orbit = slots[orbitIndex];
      const leadTrailRoll = roll1d(rng);
      trojanPosition = leadTrailRoll <= 3 ? "leading" : "trailing";
      source = { orbitIndex, leadTrailRoll };
    } else {
      // Fallback to random orbit if no existing slot list is available.
      const random = rollRandomAnomalousOrbit({
        mao: parent.mao,
        availableOrbits: parent.availableOrbits,
        allowLeewayPercent,
        rng,
      });
      orbit = random.orbit;
      source = { fallback: "random", random };
    }
  } else {
    const random = rollRandomAnomalousOrbit({
      mao: parent.mao,
      availableOrbits: parent.availableOrbits,
      allowLeewayPercent,
      rng,
    });
    orbit = random.orbit;
    source = { random };

    if (effectiveType === "random") {
      eccentricityDm = 2;
    } else if (effectiveType === "eccentric") {
      eccentricityDm = 5;
    } else if (effectiveType === "inclined") {
      eccentricityDm = 2;
      inclinationDegrees = (roll1d(rng) + 2) * 10 + roll1d10(rng);
      source.inclinationRoll = true;
    } else if (effectiveType === "retrograde") {
      eccentricityDm = 2;
      retrograde = true;
      if (retrogradeInclined) {
        inclinationDegrees = (roll1d(rng) + 2) * 10 + roll1d10(rng) + 90;
        source.inclinationRoll = true;
      }
    }
  }

  return {
    type: effectiveType,
    starKey: parent.starKey,
    orbit,
    eccentricityDm,
    inclinationDegrees,
    retrograde,
    trojanPosition,
    source,
  };
}

/**
 * Generate anomalous-orbit package:
 * - roll quantity (or use provided quantity)
 * - update terrestrial/belt/world counts with cap rules
 * - roll/generate each anomalous orbit
 *
 * @param {object} options
 * @param {Array<{ starKey: string, allowableOrbits?: number, totalStarOrbits?: number, mao?: number, availableOrbits?: Array<{min:number,max:number}>, slotOrbits?: number[] }>} options.parents
 * @param {number} options.terrestrialPlanetCount
 * @param {number} options.planetoidBeltCount
 * @param {number} options.totalWorlds
 * @param {number} [options.anomalousOrbitCount]
 * @param {boolean} [options.retrogradeInclined=false]
 * @param {number} [options.allowLeewayPercent=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   countRoll: number|null,
 *   anomalousOrbitCount: number,
 *   updatedCounts: {
 *     terrestrialPlanetCount: number,
 *     planetoidBeltCount: number,
 *     totalWorlds: number,
 *     anomalousAsTerrestrial: number,
 *     anomalousAsBelts: number
 *   },
 *   anomalies: Array<ReturnType<typeof generateAnomalousOrbit>>,
 *   typeRolls: number[]
 * }}
 */
export function generateAnomalousOrbits({
  parents = [],
  terrestrialPlanetCount,
  planetoidBeltCount,
  totalWorlds,
  anomalousOrbitCount,
  retrogradeInclined = false,
  allowLeewayPercent = 0,
  rng = Math.random,
} = {}) {
  let countRoll = null;
  let count = anomalousOrbitCount;

  if (!Number.isFinite(count)) {
    const rolled = rollAnomalousOrbitQuantity({ rng });
    countRoll = rolled.roll;
    count = rolled.quantity;
  }

  const anomalousCount = Math.max(0, Math.floor(Number(count) || 0));
  const updatedCounts = applyAnomalousOrbitCount({
    anomalousOrbitCount: anomalousCount,
    terrestrialPlanetCount,
    planetoidBeltCount,
    totalWorlds,
  });

  const anomalies = [];
  const typeRolls = [];

  for (let i = 0; i < anomalousCount; i++) {
    const { roll, type } = rollAnomalousOrbitType({ rng });
    typeRolls.push(roll);
    anomalies.push(
      generateAnomalousOrbit({
        type,
        parents,
        retrogradeInclined,
        allowLeewayPercent,
        rng,
      }),
    );
  }

  return {
    countRoll,
    anomalousOrbitCount: anomalousCount,
    updatedCounts,
    anomalies,
    typeRolls,
  };
}

/**
 * Build the 1D:1D placement labels for each orbit slot.
 *
 * @param {number} slotCount
 * @returns {Array<{ slotIndex: number, prefix: number, face: number, label: string }>}
 */
export function buildPlacementSlotRollTable(slotCount) {
  const count = Math.max(0, Math.floor(Number(slotCount) || 0));
  const labels = [];

  for (let index = 0; index < count; index++) {
    const prefix = Math.floor(index / 6) + 1;
    const face = (index % 6) + 1;
    labels.push({
      slotIndex: index,
      prefix,
      face,
      label: `${prefix}:${face}`,
    });
  }

  return labels;
}

/**
 * Roll a world-placement slot using the WBH 1D:1D method.
 * Prefix rerolls if it exceeds max prefix; face rerolls if the last prefix
 * has fewer than 6 available faces.
 *
 * @param {object} [options]
 * @param {number} options.slotCount
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   slotIndex: number,
 *   prefix: number,
 *   face: number,
 *   label: string,
 *   maxPrefix: number,
 *   maxFaceForPrefix: number,
 *   prefixRerolls: number,
 *   faceRerolls: number
 * }}
 */
export function rollPlacementSlotReference({ slotCount, rng = Math.random } = {}) {
  const count = Math.max(0, Math.floor(Number(slotCount) || 0));

  if (count <= 0) {
    return {
      slotIndex: -1,
      prefix: 1,
      face: 1,
      label: "1:1",
      maxPrefix: 0,
      maxFaceForPrefix: 0,
      prefixRerolls: 0,
      faceRerolls: 0,
    };
  }

  const maxPrefix = Math.ceil(count / 6);
  const remainder = count % 6;
  const lastPrefixMaxFace = remainder === 0 ? 6 : remainder;

  let prefix = roll1d(rng);
  let prefixRerolls = 0;

  while (prefix > maxPrefix) {
    prefixRerolls += 1;
    prefix = roll1d(rng);
  }

  const maxFaceForPrefix = prefix === maxPrefix ? lastPrefixMaxFace : 6;
  let face = roll1d(rng);
  let faceRerolls = 0;

  while (face > maxFaceForPrefix) {
    faceRerolls += 1;
    face = roll1d(rng);
  }

  const slotIndex = (prefix - 1) * 6 + (face - 1);

  return {
    slotIndex,
    prefix,
    face,
    label: `${prefix}:${face}`,
    maxPrefix,
    maxFaceForPrefix,
    prefixRerolls,
    faceRerolls,
  };
}

function resolveSlotIndex(slotStates, slotRef) {
  if (!slotRef || !Array.isArray(slotStates) || slotStates.length === 0) {
    return -1;
  }

  if (Number.isInteger(slotRef.slotIndex) && slotRef.slotIndex >= 0 && slotRef.slotIndex < slotStates.length) {
    return slotRef.slotIndex;
  }

  if (slotRef.slotId != null) {
    const index = slotStates.findIndex((slot) => slot.slotId === slotRef.slotId);
    if (index >= 0) {
      return index;
    }
  }

  return -1;
}

function findNextOpenSlotIndex(slotStates, startIndex, allowAnomalous) {
  if (!Array.isArray(slotStates) || slotStates.length === 0) {
    return -1;
  }

  const total = slotStates.length;

  for (let offset = 0; offset < total; offset++) {
    const index = (startIndex + offset) % total;
    const slot = slotStates[index];

    if (slot.primaryWorldType) {
      continue;
    }

    if (!allowAnomalous && slot.isAnomalousSlot) {
      continue;
    }

    return index;
  }

  return -1;
}

function isTerrestrialPrimaryWorldType(primaryWorldType) {
  return primaryWorldType === "terrestrialPlanet" || primaryWorldType === "mainworld";
}

function isGasGiantPrimaryWorldType(primaryWorldType) {
  return primaryWorldType === "gasGiant";
}

/**
 * Assign basic gas giant size metadata to placed slots.
 *
 * @param {{
 *   slots?: Array<object>,
 *   primary?: object,
 *   systemSpread?: number,
 *   sizeGasGiants?: boolean,
 *   rng?: Function
 * }} [options]
 * @returns {{
 *   slots: Array<object>,
 *   sizingRolls: Record<string, object|null>
 * }}
 */
export function assignBasicGasGiantSizes({
  slots = [],
  primary,
  systemSpread,
  sizeGasGiants = true,
  rng = Math.random,
} = {}) {
  const sizingRolls = {};

  const sizedSlots = slots.map((slot, index) => {
    const slotId = String(slot?.slotId ?? `slot-${index}`);
    const primaryWorldType = String(slot?.primaryWorldType ?? "");

    if (!isGasGiantPrimaryWorldType(primaryWorldType)) {
      return slot;
    }

    if (sizeGasGiants !== true) {
      sizingRolls[slotId] = null;
      return {
        ...slot,
        gasGiantSizingRoll: null,
      };
    }

    const existingCode = String(slot?.sizeCode ?? "")
      .trim()
      .toUpperCase();
    const existingMatch = existingCode.match(/^G([SML])([0-9A-HJ-NP-Z])$/);

    if (existingMatch) {
      const categoryCode = `G${existingMatch[1]}`;
      const diameterCode = existingMatch[2];
      const diameterTerran = fromEHex(diameterCode);
      const existingRoll = {
        source: "existing",
        categoryCode,
        diameterCode,
        diameterTerran,
      };
      sizingRolls[slotId] = existingRoll;

      return {
        ...slot,
        size: "G",
        sizeCode: existingCode,
        gasGiantCategoryCode: categoryCode,
        gasGiantDiameterCode: diameterCode,
        gasGiantDiameterTerran: diameterTerran,
        basicDiameterKm:
          Number.isFinite(diameterTerran) && diameterTerran > 0
            ? Math.round(diameterTerran * BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE["8"])
            : null,
        gasGiantMassEarth:
          Number.isFinite(slot?.gasGiantMassEarth) && Number(slot.gasGiantMassEarth) > 0
            ? Number(slot.gasGiantMassEarth)
            : null,
        gasGiantSizingRoll: existingRoll,
      };
    }

    const sizingRoll = rollGasGiantSize({
      primary,
      systemSpread,
      rng,
    });

    sizingRolls[slotId] = sizingRoll;

    return {
      ...slot,
      size: "G",
      sizeCode: sizingRoll.sahCode,
      sizeValue: null,
      basicDiameterKm: Math.round(sizingRoll.diameterTerran * BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE["8"]),
      gasGiantCategory: sizingRoll.category,
      gasGiantCategoryCode: sizingRoll.categoryCode,
      gasGiantDiameterCode: sizingRoll.diameterCode,
      gasGiantDiameterTerran: sizingRoll.diameterTerran,
      gasGiantMassEarth: sizingRoll.massEarth,
      gasGiantSizingRoll: sizingRoll,
    };
  });

  return {
    slots: sizedSlots,
    sizingRolls,
  };
}

/**
 * Assign basic terrestrial size metadata to placed slots.
 *
 * @param {{ slots?: Array<object>, mainworld?: object, rng?: Function }} [options]
 * @returns {{
 *   slots: Array<object>,
 *   sizingRolls: Record<string, object>
 * }}
 */
export function assignBasicTerrestrialWorldSizes({ slots = [], mainworld, rng = Math.random } = {}) {
  const mainworldInputSizeCode = normalizeBasicWorldSizeCode(mainworld?.sizeCode ?? mainworld?.size);
  const sizingRolls = {};

  const sizedSlots = slots.map((slot, index) => {
    const slotId = String(slot?.slotId ?? `slot-${index}`);
    const primaryWorldType = String(slot?.primaryWorldType ?? "");
    const hasSecondaryMainworld = Array.isArray(slot?.secondaryWorldTypes)
      ? slot.secondaryWorldTypes.includes("mainworld")
      : false;

    if (!isTerrestrialPrimaryWorldType(primaryWorldType) && !hasSecondaryMainworld) {
      return {
        ...slot,
        size: null,
        sizeCode: null,
        sizeValue: null,
        basicDiameterKm: null,
        sizeRoll: null,
      };
    }

    let resolvedSizeCode = null;
    let sizeRoll = null;

    if (primaryWorldType === "mainworld" && mainworldInputSizeCode) {
      resolvedSizeCode = mainworldInputSizeCode;
      sizeRoll = {
        source: "mainworld-input",
        sizeCode: resolvedSizeCode,
      };
    } else {
      resolvedSizeCode = normalizeBasicWorldSizeCode(slot?.sizeCode ?? slot?.size);
      if (resolvedSizeCode) {
        sizeRoll = {
          source: "existing",
          sizeCode: resolvedSizeCode,
        };
      } else if (isTerrestrialPrimaryWorldType(primaryWorldType)) {
        const rollResult = rollBasicTerrestrialWorldSize({ rng });
        resolvedSizeCode = rollResult.sizeCode;
        sizeRoll = {
          source: "rolled",
          ...rollResult,
        };
      }
    }

    const sizeValue = sizeValueFromCode(resolvedSizeCode);
    const basicDiameterKm = lookupBasicTerrestrialWorldDiameter(resolvedSizeCode);

    let secondaryWorldSizing = slot?.secondaryWorldSizing ?? null;
    if (hasSecondaryMainworld) {
      let moonSizeCode = normalizeBasicWorldSizeCode(secondaryWorldSizing?.mainworld?.sizeCode);
      let moonSizeRoll = secondaryWorldSizing?.mainworld?.sizeRoll ?? null;

      if (!moonSizeCode && mainworldInputSizeCode) {
        moonSizeCode = mainworldInputSizeCode;
        moonSizeRoll = {
          source: "mainworld-input",
          sizeCode: moonSizeCode,
        };
      }

      if (!moonSizeCode) {
        const moonRoll = rollBasicTerrestrialWorldSize({ rng });
        moonSizeCode = moonRoll.sizeCode;
        moonSizeRoll = {
          source: "rolled",
          ...moonRoll,
        };
      }

      const moonSizeValue = sizeValueFromCode(moonSizeCode);
      const moonDiameter = lookupBasicTerrestrialWorldDiameter(moonSizeCode);
      secondaryWorldSizing = {
        ...(secondaryWorldSizing ?? {}),
        mainworld: {
          size: moonSizeCode,
          sizeCode: moonSizeCode,
          sizeValue: moonSizeValue,
          basicDiameterKm: moonDiameter,
          sizeRoll: moonSizeRoll,
        },
      };

      sizingRolls[`${slotId}:mainworld-moon`] = moonSizeRoll;
    }

    sizingRolls[slotId] = sizeRoll;

    return {
      ...slot,
      size: resolvedSizeCode,
      sizeCode: resolvedSizeCode,
      sizeValue,
      basicDiameterKm,
      sizeRoll,
      secondaryWorldSizing,
    };
  });

  return {
    slots: sizedSlots,
    sizingRolls,
  };
}

/**
 * Step 8: place worlds into prepared orbit slots.
 * Order: mainworld (if provided), empty orbits, gas giants, belts, terrestrials.
 *
 * @param {object} options
 * @param {Array<{ slotId?: string, starKey?: string, orbit?: number, isAnomalousSlot?: boolean, anomalous?: boolean }>} options.slots
 * @param {number} [options.emptyOrbitCount=0]
 * @param {number} [options.gasGiantCount=0]
 * @param {number} [options.planetoidBeltCount=0]
 * @param {number} [options.terrestrialPlanetCount=0]
 * @param {{ slotId?: string, slotIndex?: number, size?: number, canBeMoon?: boolean, isMoonKnown?: boolean, parentWorldType?: string }} [options.mainworld]
 * @param {boolean} [options.allowSizeOneMainworldInsideBelt=true]
 * @param {boolean} [options.fillRemainingWithTerrestrials=true]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   slots: Array<{
 *     slotIndex: number,
 *     slotId: string,
 *     rollLabel: string,
 *     starKey: string|null,
 *     orbit: number|null,
 *     isAnomalousSlot: boolean,
 *     primaryWorldType: string|null,
 *     secondaryWorldTypes: string[]
 *   }>,
 *   placements: {
 *     mainworld: number|null,
 *     emptyOrbits: Array<object>,
 *     gasGiants: Array<object>,
 *     planetoidBelts: Array<object>,
 *     terrestrials: Array<object>
 *   },
 *   counts: {
 *     extraTerrestrialFromMainworld: number,
 *     placed: { emptyOrbits: number, gasGiants: number, planetoidBelts: number, terrestrials: number },
 *     unplaced: { emptyOrbits: number, gasGiants: number, planetoidBelts: number, terrestrials: number }
 *   },
 *   rollTable: Array<{ slotIndex: number, prefix: number, face: number, label: string }>
 * }}
 */
export function placeWorldsInSlots({
  slots = [],
  emptyOrbitCount = 0,
  gasGiantCount = 0,
  planetoidBeltCount = 0,
  terrestrialPlanetCount = 0,
  mainworld,
  primary,
  systemSpread,
  sizeGasGiants = true,
  allowSizeOneMainworldInsideBelt = true,
  fillRemainingWithTerrestrials = true,
  rng = Math.random,
} = {}) {
  const rollTable = buildPlacementSlotRollTable(slots.length);
  let slotStates = slots.map((slot, slotIndex) => {
    const rollEntry = rollTable[slotIndex];
    const sizeCode = normalizeBasicWorldSizeCode(slot?.sizeCode ?? slot?.size);

    return {
      slotIndex,
      slotId: slot.slotId ?? `S${slotIndex + 1}`,
      rollLabel: rollEntry ? rollEntry.label : "1:1",
      starKey: slot.starKey ?? null,
      orbit: Number.isFinite(slot.orbit) ? Number(slot.orbit) : null,
      isAnomalousSlot: Boolean(slot.isAnomalousSlot || slot.anomalous),
      anomalous: slot.anomalous ?? null,
      primaryWorldType: null,
      secondaryWorldTypes: [],
      size: sizeCode,
      sizeCode,
      sizeValue: sizeValueFromCode(sizeCode),
      basicDiameterKm: Number.isFinite(slot?.basicDiameterKm)
        ? Number(slot.basicDiameterKm)
        : lookupBasicTerrestrialWorldDiameter(sizeCode),
      sizeRoll: slot?.sizeRoll ?? null,
      secondaryWorldSizing: slot?.secondaryWorldSizing ?? null,
    };
  });

  const placements = {
    mainworld: null,
    emptyOrbits: [],
    gasGiants: [],
    planetoidBelts: [],
    terrestrials: [],
  };

  let extraTerrestrialFromMainworld = 0;

  const mainworldIndex = resolveSlotIndex(slotStates, mainworld);
  if (mainworldIndex >= 0) {
    if (mainworld?.isMoonKnown && mainworld?.parentWorldType) {
      slotStates[mainworldIndex].primaryWorldType = String(mainworld.parentWorldType);
      slotStates[mainworldIndex].secondaryWorldTypes.push("mainworld");
    } else {
      slotStates[mainworldIndex].primaryWorldType = "mainworld";
    }
    placements.mainworld = mainworldIndex;
  }

  const placeCount = ({ type, count, skipAnomalousSlots }) => {
    const normalizedCount = Math.max(0, Math.floor(Number(count) || 0));
    const placed = [];
    let unplaced = 0;

    for (let i = 0; i < normalizedCount; i++) {
      if (slotStates.length === 0) {
        unplaced += 1;
        continue;
      }

      let roll = null;
      let selectionRerolls = 0;
      let rolledSlotIndex = -1;

      while (selectionRerolls < 100) {
        roll = rollPlacementSlotReference({ slotCount: slotStates.length, rng });
        rolledSlotIndex = roll.slotIndex;

        if (rolledSlotIndex < 0 || rolledSlotIndex >= slotStates.length) {
          selectionRerolls += 1;
          continue;
        }

        if (skipAnomalousSlots && slotStates[rolledSlotIndex].isAnomalousSlot) {
          selectionRerolls += 1;
          continue;
        }

        break;
      }

      if (rolledSlotIndex < 0 || rolledSlotIndex >= slotStates.length) {
        unplaced += 1;
        continue;
      }

      const rolledSlot = slotStates[rolledSlotIndex];
      let targetIndex = rolledSlotIndex;
      let convertedMainworldToSubordinate = false;

      if (rolledSlot.primaryWorldType) {
        const canConvertMainworldToMoon =
          rolledSlot.primaryWorldType === "mainworld" &&
          !mainworld?.isMoonKnown &&
          mainworld?.canBeMoon !== false &&
          (type === "gasGiant" ||
            (type === "planetoidBelt" && allowSizeOneMainworldInsideBelt && Number(mainworld?.size) === 1));

        if (canConvertMainworldToMoon) {
          rolledSlot.secondaryWorldTypes.push("mainworld");
          rolledSlot.primaryWorldType = type;
          convertedMainworldToSubordinate = true;
          extraTerrestrialFromMainworld += 1;
        } else {
          const bumpedIndex = findNextOpenSlotIndex(
            slotStates,
            (rolledSlotIndex + 1) % slotStates.length,
            !skipAnomalousSlots,
          );

          if (bumpedIndex < 0) {
            unplaced += 1;
            continue;
          }

          targetIndex = bumpedIndex;
          slotStates[targetIndex].primaryWorldType = type;
        }
      } else {
        rolledSlot.primaryWorldType = type;
      }

      const finalSlot = slotStates[targetIndex];
      placed.push({
        type,
        rollLabel: roll ? roll.label : null,
        rolledSlotId: rolledSlot.slotId,
        finalSlotId: finalSlot.slotId,
        rolledSlotIndex,
        finalSlotIndex: targetIndex,
        movedFromCollision: !convertedMainworldToSubordinate && targetIndex !== rolledSlotIndex,
        selectionRerolls,
      });
    }

    return {
      placed,
      unplaced,
    };
  };

  const emptyResults = placeCount({
    type: "emptyOrbit",
    count: emptyOrbitCount,
    skipAnomalousSlots: true,
  });
  placements.emptyOrbits = emptyResults.placed;

  const gasResults = placeCount({
    type: "gasGiant",
    count: gasGiantCount,
    skipAnomalousSlots: false,
  });
  placements.gasGiants = gasResults.placed;

  const beltResults = placeCount({
    type: "planetoidBelt",
    count: planetoidBeltCount,
    skipAnomalousSlots: false,
  });
  placements.planetoidBelts = beltResults.placed;

  let terrestrialToPlace = Math.max(0, Math.floor(Number(terrestrialPlanetCount) || 0)) + extraTerrestrialFromMainworld;

  if (fillRemainingWithTerrestrials) {
    const remainingOpenSlots = slotStates.filter((slot) => !slot.primaryWorldType).length;
    terrestrialToPlace = Math.max(terrestrialToPlace, remainingOpenSlots);
  }

  const terrestrialResults = placeCount({
    type: "terrestrialPlanet",
    count: terrestrialToPlace,
    skipAnomalousSlots: false,
  });
  placements.terrestrials = terrestrialResults.placed;

  const sizingResult = assignBasicTerrestrialWorldSizes({
    slots: slotStates,
    mainworld,
    rng,
  });

  const gasGiantSizingResult = assignBasicGasGiantSizes({
    slots: sizingResult.slots,
    primary,
    systemSpread,
    sizeGasGiants,
    rng,
  });

  slotStates = gasGiantSizingResult.slots;

  return {
    slots: slotStates,
    placements,
    counts: {
      extraTerrestrialFromMainworld,
      placed: {
        emptyOrbits: emptyResults.placed.length,
        gasGiants: gasResults.placed.length,
        planetoidBelts: beltResults.placed.length,
        terrestrials: terrestrialResults.placed.length,
      },
      unplaced: {
        emptyOrbits: emptyResults.unplaced,
        gasGiants: gasResults.unplaced,
        planetoidBelts: beltResults.unplaced,
        terrestrials: terrestrialResults.unplaced,
      },
    },
    rollTable,
    sizing: {
      terrestrial: sizingResult.sizingRolls,
      gasGiants: gasGiantSizingResult.sizingRolls,
    },
  };
}

// â”€â”€ Placement Of Worlds: Step 9 (Eccentricity) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Internal helper: Look up eccentricity row based on first roll total.
 * Same table used for both stars and planets per Table 8.
 *
 * @param {number} firstRollTotal - Total from 2D roll + DMs
 * @returns {{ baseValue: number, secondRollDice: number, secondRollDivisor: number }}
 */
function eccentricityRowForRoll(firstRollTotal) {
  if (firstRollTotal <= 5) {
    return { baseValue: -0.001, secondRollDice: 1, secondRollDivisor: 1000 };
  }
  if (firstRollTotal <= 7) {
    return { baseValue: 0, secondRollDice: 1, secondRollDivisor: 200 };
  }
  if (firstRollTotal <= 9) {
    return { baseValue: 0.03, secondRollDice: 1, secondRollDivisor: 100 };
  }
  if (firstRollTotal <= 10) {
    return { baseValue: 0.05, secondRollDice: 1, secondRollDivisor: 20 };
  }
  if (firstRollTotal <= 11) {
    return { baseValue: 0.05, secondRollDice: 2, secondRollDivisor: 20 };
  }

  return { baseValue: 0.3, secondRollDice: 2, secondRollDivisor: 20 };
}

/**
 * Calculate Step 9 eccentricity DM for a world.
 *
 * DMs:
 *   +DM from anomalous orbit type (if applicable)
 *   -1 if orbit number < 1 and system age > 1 Gyr (optional damping)
 *
 * @param {object} options
 * @param {number} [options.orbitNumber] - Orbit# of the world
 * @param {number} [options.systemAgeGyr] - System age in Gyr (if known)
 * @param {number} [options.anomalousEccentricityDm=0] - DM from anomalous orbit type
 * @returns {{ dm: number, notes: Array<string> }}
 */
export function calculateWorldEccentricityDm({ orbitNumber, systemAgeGyr, anomalousEccentricityDm = 0 } = {}) {
  const notes = [];
  let dm = 0;

  // Add DM from anomalous orbit type
  if (Number.isFinite(anomalousEccentricityDm) && anomalousEccentricityDm !== 0) {
    dm += anomalousEccentricityDm;
    notes.push(`DM${anomalousEccentricityDm > 0 ? "+" : ""}${anomalousEccentricityDm} from anomalous orbit type.`);
  }

  // Optional: Damping for close orbits in old systems
  if (Number.isFinite(orbitNumber) && orbitNumber < 1 && Number.isFinite(systemAgeGyr) && systemAgeGyr > 1) {
    dm -= 1;
    notes.push("DM-1 for Orbit# < 1 in systems older than 1 Gyr.");
  }

  return { dm, notes };
}

/**
 * Roll eccentricity for a single world.
 *
 * @param {object} options
 * @param {Function} [options.rng=Math.random] - RNG
 * @param {number} [options.orbitNumber] - Orbit# of the world
 * @param {number} [options.systemAgeGyr] - System age in Gyr
 * @param {number} [options.anomalousEccentricityDm=0] - DM from anomalous orbit type
 * @returns {{
 *   firstRoll: number,
 *   firstRollDm: number,
 *   firstRollTotal: number,
 *   baseValue: number,
 *   secondRoll: number,
 *   secondRollDivisor: number,
 *   eccentricity: number,
 *   notes: Array<string>
 * }}
 */
export function rollWorldEccentricity({
  rng = Math.random,
  orbitNumber,
  systemAgeGyr,
  anomalousEccentricityDm = 0,
} = {}) {
  const firstRoll = roll2d(rng);

  const dmResult = calculateWorldEccentricityDm({
    orbitNumber,
    systemAgeGyr,
    anomalousEccentricityDm,
  });

  const firstRollTotal = firstRoll + dmResult.dm;
  const row = eccentricityRowForRoll(firstRollTotal);

  const secondRoll = row.secondRollDice === 2 ? roll2d(rng) : roll1d10(rng);
  const secondRollValue = secondRoll / row.secondRollDivisor;
  let eccentricity = row.baseValue + secondRollValue;

  // Clamp to valid range [0, 0.999]
  const clampedEccentricity = Math.max(0, Math.min(0.999, eccentricity));

  return {
    firstRoll,
    firstRollDm: dmResult.dm,
    firstRollTotal,
    baseValue: row.baseValue,
    secondRoll,
    secondRollDivisor: row.secondRollDivisor,
    eccentricity: Number(clampedEccentricity.toFixed(6)),
    notes: dmResult.notes,
  };
}

/**
 * Step 9: Assign eccentricity to all worlds from Step 8 output.
 * Skips planetoid belts (they don't have intrinsic eccentricities).
 * Applies eccentricity DMs from anomalous orbit types.
 *
 * @param {object} options
 * @param {Array<object>} options.slots - Slot array from Step 8
 * @param {number} [options.systemAgeGyr] - System age for orbital damping (optional)
 * @param {Function} [options.rng=Math.random] - RNG
 * @returns {{
 *   worlds: Array<object>,
 *   belts: Array<object>,
 *   eccentricityRolls: object
 * }}
 */
export function assignWorldsEccentricities({ slots = [], systemAgeGyr, rng = Math.random } = {}) {
  const worlds = [];
  const belts = [];
  const eccentricityRolls = {};

  for (const slot of slots) {
    // Skip empty slots
    if (!slot.primaryWorldType) {
      continue;
    }

    // Empty orbit slots are placeholders, not worlds.
    if (slot.primaryWorldType === "emptyOrbit") {
      continue;
    }

    // Skip planetoid belts (no intrinsic eccentricity)
    if (slot.primaryWorldType === "planetoidBelt") {
      belts.push(slot);
      continue;
    }

    // Roll eccentricity for this world
    const eccResult = rollWorldEccentricity({
      rng,
      orbitNumber: slot.orbit,
      systemAgeGyr,
      anomalousEccentricityDm: slot.anomalous?.eccentricityDm ?? 0,
    });

    // Attach eccentricity to the slot
    const worldWithEccentricity = {
      ...slot,
      eccentricity: eccResult.eccentricity,
      eccentricityRoll: eccResult,
    };

    worlds.push(worldWithEccentricity);

    // Track roll details for reporting
    if (!eccentricityRolls[slot.slotId || `slot-${slot.slotIndex}`]) {
      eccentricityRolls[slot.slotId || `slot-${slot.slotIndex}`] = [];
    }
    eccentricityRolls[slot.slotId || `slot-${slot.slotIndex}`].push(eccResult);
  }

  return {
    worlds,
    belts,
    eccentricityRolls,
  };
}

const SECONDARY_ZONE_DEFAULT_ORBITS = {
  close: 3,
  near: 8,
  far: 14,
};

function normalizeLuminosityClassInput(luminosityClass, spectralClass) {
  const direct = String(luminosityClass ?? "")
    .trim()
    .toUpperCase();
  const fallbackMatch = String(spectralClass ?? "")
    .trim()
    .toUpperCase()
    .match(/(IA|IB|II|III|IV|VI|V|D|WD|BD)/);
  const raw = direct || (fallbackMatch ? fallbackMatch[1] : "V");

  if (raw === "IA") return "Ia";
  if (raw === "IB") return "Ib";
  return raw;
}

function normalizeSecondaryZone(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "close") return "close";
  if (normalized === "near") return "near";
  if (normalized === "far") return "far";
  if (normalized === "distant") return "far";
  if (normalized === "companion") return "near";
  return "near";
}

function deriveSecondaryOrbitNumber(star, zone, index) {
  const explicitOrbit = Number(star?.orbitNumber);
  if (Number.isFinite(explicitOrbit)) return explicitOrbit;

  const stellarOrbitNumber = Number(star?.stellarOrbitNumber);
  if (Number.isFinite(stellarOrbitNumber)) return stellarOrbitNumber;

  const separation = Number(star?.separation);
  if (Number.isFinite(separation) && separation > 0) {
    return Math.max(SECONDARY_ZONE_DEFAULT_ORBITS[zone], separation);
  }

  const base = SECONDARY_ZONE_DEFAULT_ORBITS[zone] ?? SECONDARY_ZONE_DEFAULT_ORBITS.near;
  return base + index * 0.3;
}

function normalizeStarsForWorldPlacement(stars = []) {
  const primaryStar = stars[0] ?? {};
  const primarySpectralClass = String(primaryStar.spectralClass ?? primaryStar.designation ?? "G2").trim() || "G2";
  const primaryLuminosityClass = normalizeLuminosityClassInput(primaryStar.luminosityClass, primarySpectralClass);

  const primary = {
    spectralClass: primarySpectralClass,
    luminosityClass: primaryLuminosityClass,
    type: primaryStar.type ?? primaryStar.objectType ?? null,
  };

  const secondaries = stars.slice(1).map((star, index) => {
    const spectralClass = String(star?.spectralClass ?? star?.designation ?? "K5").trim() || "K5";
    const luminosityClass = normalizeLuminosityClassInput(star?.luminosityClass, spectralClass);
    const zone = normalizeSecondaryZone(star?.zone ?? star?.orbitType);

    return {
      spectralClass,
      luminosityClass,
      zone,
      orbitNumber: deriveSecondaryOrbitNumber(star, zone, index),
      eccentricity: Number.isFinite(star?.eccentricity)
        ? Number(star.eccentricity)
        : Number.isFinite(star?.stellarOrbitEccentricity)
          ? Number(star.stellarOrbitEccentricity)
          : 0,
      type: star?.type ?? star?.objectType ?? null,
    };
  });

  return {
    primary,
    secondaries,
  };
}

function slotPrefixForStar(starKey) {
  if (starKey === "primary") return "P";
  const secondaryMatch = String(starKey).match(/^secondary-(\d+)$/);
  if (secondaryMatch) return `S${secondaryMatch[1]}`;
  return "U";
}

function buildStep6Slots({
  starAllocations = [],
  availableOrbits,
  baselineNumber,
  baselineOrbit,
  systemSpread,
  secondarySpreads = [],
  rng,
} = {}) {
  const slots = [];
  const slotOrbitsByStar = {};

  const primaryMao = Number.isFinite(availableOrbits?.primaryMao)
    ? Number(availableOrbits.primaryMao)
    : Number.isFinite(availableOrbits?.primaryOrbits?.[0]?.min)
      ? Number(availableOrbits.primaryOrbits[0].min)
      : 0.01;

  for (const allocation of starAllocations) {
    const starKey = allocation.starKey;
    const slotCount = Math.max(
      0,
      Math.floor(
        Number.isFinite(allocation.totalStarOrbitsWithEmpty)
          ? allocation.totalStarOrbitsWithEmpty
          : Number.isFinite(allocation.totalStarOrbits)
            ? allocation.totalStarOrbits
            : Number(allocation.assignedWorlds) || 0,
      ),
    );

    if (slotCount <= 0) {
      continue;
    }

    let slotResult;
    if (starKey === "primary") {
      slotResult = placeStarOrbitSlots({
        slotCount,
        mao: primaryMao,
        spread: systemSpread,
        baselineNumber,
        baselineOrbit,
        availableOrbits: availableOrbits?.primaryOrbits ?? [],
        rng,
      });
    } else {
      const secondaryMatch = String(starKey).match(/^secondary-(\d+)$/);
      const secondaryIndex = secondaryMatch ? Number(secondaryMatch[1]) - 1 : -1;
      const secondary = availableOrbits?.secondaryOrbits?.[secondaryIndex] ?? {};
      const spreadRecord = secondarySpreads.find((item) => item.starKey === starKey);

      const secondaryMao = Number.isFinite(secondary.min)
        ? Number(secondary.min)
        : Number.isFinite(secondary.mao)
          ? Number(secondary.mao)
          : 0.01;
      const secondaryMax = Number.isFinite(secondary.max) ? Number(secondary.max) : 20;
      const secondarySpread = Number.isFinite(spreadRecord?.spread) ? Number(spreadRecord.spread) : systemSpread;
      const secondaryBaselineOrbit = Math.min(secondaryMax, Math.max(secondaryMao, secondaryMao + secondarySpread));

      slotResult = placeStarOrbitSlots({
        slotCount,
        mao: secondaryMao,
        spread: secondarySpread,
        baselineNumber: 1,
        baselineOrbit: secondaryBaselineOrbit,
        availableOrbits: secondaryMax > secondaryMao ? [{ min: secondaryMao, max: secondaryMax }] : [],
        rng,
      });
    }

    const prefix = slotPrefixForStar(starKey);
    for (const slot of slotResult.slots) {
      slots.push({
        slotId: `${prefix}-${slot.slotNumber}`,
        starKey,
        orbit: slot.orbit,
      });
    }

    slotOrbitsByStar[starKey] = slotResult.slots.map((slot) => slot.orbit).filter((orbit) => Number.isFinite(orbit));
  }

  return {
    slots,
    slotOrbitsByStar,
  };
}

function mergeEccentricityIntoSlots(slots, worldsWithEccentricity) {
  const bySlotId = new Map(worldsWithEccentricity.map((entry) => [entry.slotId, entry]));
  return slots.map((slot) => {
    const enriched = bySlotId.get(slot.slotId);
    if (!enriched) {
      return slot;
    }

    return {
      ...slot,
      eccentricity: enriched.eccentricity,
      eccentricityRoll: enriched.eccentricityRoll,
    };
  });
}

/**
 * Run full deterministic world-placement flow (Steps 1-9) for a generated star system.
 *
 * @param {object} options
 * @param {Array<object>} options.stars - System stars (primary first)
 * @param {number} [options.systemAgeGyr] - Optional system age used by Step 9 damping
 * @param {object} [options.mainworld] - Optional pre-placed mainworld descriptor for Step 8
 * @param {number} [options.anomalousOrbitCount] - Optional fixed anomalous-orbit count override
 * @param {boolean} [options.retrogradeInclined=false]
 * @param {number} [options.allowLeewayPercent=0]
 * @param {boolean} [options.fillRemainingWithTerrestrials=true]
 * @param {boolean} [options.allowSizeOneMainworldInsideBelt=true]
 * @param {boolean} [options.sizeGasGiants=true]
 * @param {boolean} [options.includeStep9=true]
 * @param {boolean} [options.useHillSphereMoonDmRule=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {object}
 */
export function generateSystemWorldPlacement({
  stars = [],
  systemAgeGyr,
  mainworld,
  anomalousOrbitCount,
  retrogradeInclined = false,
  allowLeewayPercent = 0,
  fillRemainingWithTerrestrials = true,
  allowSizeOneMainworldInsideBelt = true,
  sizeGasGiants = true,
  includeStep9 = true,
  useHillSphereMoonDmRule = false,
  rng = Math.random,
} = {}) {
  const normalizedStars =
    Array.isArray(stars) && stars.length > 0 ? stars : [{ spectralClass: "G2", luminosityClass: "V" }];
  const { primary, secondaries } = normalizeStarsForWorldPlacement(normalizedStars);

  const gasGiants = generateGasGiants({ stars: normalizedStars, rng });
  const planetoidBelts = generatePlanetoidBelts({ stars: normalizedStars, gasGiantCount: gasGiants.quantity, rng });
  const terrestrialPlanets = generateTerrestrialPlanets({ stars: normalizedStars, rng });

  const initialCounts = calculateTotalWorlds({
    planetoidBelts: planetoidBelts.quantity,
    gasGiants: gasGiants.quantity,
    terrestrialPlanets: terrestrialPlanets.count,
  });

  const availableOrbits = calculateAvailableOrbits({ primary, secondaries });
  const step1 = allocateWorldsByStar({
    totalWorlds: initialCounts.total,
    primary,
    secondaries,
    availableOrbits,
  });

  const primaryAllocation = step1.starAllocations.find((entry) => entry.starKey === "primary") ?? {};
  const lookedUpHzco = lookupHZCO(primary.spectralClass, primary.luminosityClass);
  const luminosityFallbackHzco =
    Number.isFinite(normalizedStars[0]?.luminosity) && Number(normalizedStars[0].luminosity) > 0
      ? auToOrbitNumber(Math.sqrt(Number(normalizedStars[0].luminosity)))
      : null;
  const hzco = Number.isFinite(lookedUpHzco)
    ? lookedUpHzco
    : Number.isFinite(luminosityFallbackHzco)
      ? luminosityFallbackHzco
      : 1;

  const step2 = determineSystemBaselineNumber({
    hzco,
    primaryOrbits: availableOrbits.primaryOrbits,
    primary,
    totalWorlds: initialCounts.total,
    secondaryStarCount: secondaries.length,
    companionStarCount: 0,
    primaryAllocatedWorlds: Math.max(0, Math.floor(Number(primaryAllocation.assignedWorlds) || 0)),
    rng,
  });

  const rawStep3 = determineSystemBaselineOrbit({
    baselineNumber: step2.baselineNumber,
    totalWorlds: initialCounts.total,
    hzco,
    minimumOrbit: Number.isFinite(availableOrbits?.primaryOrbits?.[0]?.min)
      ? availableOrbits.primaryOrbits[0].min
      : undefined,
    primaryMao: availableOrbits.primaryMao ?? 0,
    primaryOrbits: availableOrbits.primaryOrbits,
    rng,
  });

  const safePrimaryMao = Number.isFinite(availableOrbits.primaryMao)
    ? availableOrbits.primaryMao
    : Number.isFinite(availableOrbits?.primaryOrbits?.[0]?.min)
      ? availableOrbits.primaryOrbits[0].min
      : 0.01;
  const step3 = {
    ...rawStep3,
    baselineOrbit: Number.isFinite(rawStep3?.baselineOrbit) ? rawStep3.baselineOrbit : Math.max(safePrimaryMao, hzco),
  };

  const step4Roll = rollEmptyOrbitQuantity({ rng });
  const step4 = allocateEmptyOrbits({
    emptyOrbitCount: step4Roll.quantity,
    starAllocations: step1.starAllocations,
    secondaries,
  });

  const primaryWithEmpty = step4.starAllocations.find((entry) => entry.starKey === "primary") ?? {};
  const primaryAllocatedOrbits = Number.isFinite(primaryWithEmpty.totalStarOrbitsWithEmpty)
    ? Number(primaryWithEmpty.totalStarOrbitsWithEmpty)
    : Number.isFinite(primaryWithEmpty.totalStarOrbits)
      ? Number(primaryWithEmpty.totalStarOrbits)
      : 0;

  const rawStep5 = calculateSystemSpread({
    baselineOrbit: step3.baselineOrbit,
    baselineNumber: step2.baselineNumber,
    primaryMao: safePrimaryMao,
    primaryOrbits: availableOrbits.primaryOrbits,
    primaryAllocatedOrbits,
    totalStars: 1 + secondaries.length,
  });
  const systemSpread = Number.isFinite(rawStep5?.spread) ? rawStep5.spread : 1;
  const step5 = rawStep5 ?? {
    baselineDivisor: step2.baselineNumber < 1 ? 1 : step2.baselineNumber,
    rawSpread: systemSpread,
    spread: systemSpread,
    roundedSpread: Math.round(systemSpread * 100) / 100,
    maxSpread: null,
    projectedOutermostOrbit: null,
    cappedByMaximumSpread: false,
  };

  const secondarySpreads = calculateSecondarySpreads({
    systemSpread,
    secondaryOrbits: availableOrbits.secondaryOrbits,
    starAllocations: step4.starAllocations,
  });

  const step6Result = buildStep6Slots({
    starAllocations: step4.starAllocations,
    availableOrbits,
    baselineNumber: step2.baselineNumber,
    baselineOrbit: step3.baselineOrbit,
    systemSpread,
    secondarySpreads,
    rng,
  });

  let step6Slots = [...step6Result.slots];
  let slotOrbitsByStar = { ...step6Result.slotOrbitsByStar };

  if (step6Slots.length === 0) {
    const fallbackSlotCount = Math.max(1, initialCounts.total + step4.emptyOrbitCount);
    const fallbackSlots = placeStarOrbitSlots({
      slotCount: fallbackSlotCount,
      mao: safePrimaryMao,
      spread: systemSpread,
      baselineNumber: step2.baselineNumber,
      baselineOrbit: step3.baselineOrbit,
      availableOrbits: availableOrbits.primaryOrbits,
      rng,
    }).slots;

    step6Slots = fallbackSlots.map((slot) => ({
      slotId: `P-${slot.slotNumber}`,
      starKey: "primary",
      orbit: slot.orbit,
    }));
    slotOrbitsByStar = {
      primary: fallbackSlots.map((slot) => slot.orbit).filter((orbit) => Number.isFinite(orbit)),
    };
  }

  const anomalyParents = step4.starAllocations.map((allocation) => {
    const starKey = allocation.starKey;
    if (starKey === "primary") {
      return {
        starKey,
        allowableOrbits: allocation.allowableOrbits,
        totalStarOrbits: allocation.totalStarOrbitsWithEmpty ?? allocation.totalStarOrbits,
        mao: availableOrbits.primaryMao,
        availableOrbits: availableOrbits.primaryOrbits,
        slotOrbits: slotOrbitsByStar[starKey] ?? [],
      };
    }

    const secondaryMatch = String(starKey).match(/^secondary-(\d+)$/);
    const secondaryIndex = secondaryMatch ? Number(secondaryMatch[1]) - 1 : -1;
    const secondary = availableOrbits.secondaryOrbits?.[secondaryIndex] ?? {};

    return {
      starKey,
      allowableOrbits: allocation.allowableOrbits,
      totalStarOrbits: allocation.totalStarOrbitsWithEmpty ?? allocation.totalStarOrbits,
      mao: Number.isFinite(secondary.min) ? secondary.min : secondary.mao,
      availableOrbits:
        Number.isFinite(secondary.min) && Number.isFinite(secondary.max) && secondary.max > secondary.min
          ? [{ min: secondary.min, max: secondary.max }]
          : [],
      slotOrbits: slotOrbitsByStar[starKey] ?? [],
    };
  });

  const step7 = generateAnomalousOrbits({
    parents: anomalyParents,
    terrestrialPlanetCount: terrestrialPlanets.count,
    planetoidBeltCount: planetoidBelts.quantity,
    totalWorlds: initialCounts.total,
    anomalousOrbitCount,
    retrogradeInclined,
    allowLeewayPercent,
    rng,
  });

  const anomalousSlots = step7.anomalies
    .map((anomaly, index) => ({
      slotId: `A-${index + 1}`,
      starKey: anomaly.starKey ?? null,
      orbit: Number.isFinite(anomaly.orbit) ? anomaly.orbit : null,
      isAnomalousSlot: true,
      anomalous: anomaly,
    }))
    .filter((slot) => Number.isFinite(slot.orbit));

  const placementSlots = [...step6Slots, ...anomalousSlots];

  const step8 = placeWorldsInSlots({
    slots: placementSlots,
    emptyOrbitCount: step4.emptyOrbitCount,
    gasGiantCount: gasGiants.quantity,
    planetoidBeltCount: step7.updatedCounts.planetoidBeltCount,
    terrestrialPlanetCount: step7.updatedCounts.terrestrialPlanetCount,
    mainworld,
    primary,
    systemSpread,
    sizeGasGiants,
    allowSizeOneMainworldInsideBelt,
    fillRemainingWithTerrestrials,
    rng,
  });

  const step9 = includeStep9
    ? assignWorldsEccentricities({
        slots: step8.slots,
        systemAgeGyr,
        rng,
      })
    : {
        worlds: [],
        belts: [],
        eccentricityRolls: {},
      };

  const slotsAfterStep9 = includeStep9 ? mergeEccentricityIntoSlots(step8.slots, step9.worlds) : step8.slots;

  const step10 = assignSignificantMoonQuantities({
    slots: slotsAfterStep9,
    primary,
    secondaries,
    availableOrbits,
    systemSpread,
    secondarySpreads,
    useHillSphereDmRule: useHillSphereMoonDmRule,
    rng,
  });

  const step11 = assignSignificantMoonSizes({
    slots: step10.slots,
    rng,
  });

  const step12 = assignInsignificantMoonQuantities({
    slots: step11.slots,
  });

  const step13 = assignSignificantMoonAndRingCharacteristics({
    slots: step12.slots,
    stars: normalizedStars,
    rng,
  });

  const finalSlots = step13.slots;

  return {
    stars: {
      primary,
      secondaries,
    },
    counts: {
      gasGiants: gasGiants.quantity,
      planetoidBelts: planetoidBelts.quantity,
      terrestrialPlanets: terrestrialPlanets.count,
      totalWorlds: initialCounts.total,
      emptyOrbits: step4.emptyOrbitCount,
      afterAnomalies: step7.updatedCounts,
      significantMoons: step10.totals.significantMoons,
      ringWorlds: step10.totals.ringWorlds,
      moonRollWorlds: step10.totals.rolledWorlds,
      significantMoonsAfterSizing: step11.totals.significantMoonsAfterSizing,
      significantRings: step11.totals.significantRings,
      gasGiantMoons: step11.totals.gasGiantMoons,
      insignificantMoons: step12.totals.insignificantMoons,
      significantMoonsAfterLimitChecks: step13.totals.moonsAfterLimitChecks,
      significantRingsAfterLimitChecks: step13.totals.ringsAfterLimitChecks,
    },
    steps: {
      step1,
      step2,
      step3,
      step4: {
        ...step4,
        roll: step4Roll.roll,
      },
      step5,
      step5Secondary: secondarySpreads,
      step6: {
        slots: step6Slots,
      },
      step7,
      step8,
      step9,
      step10,
      step11,
      step12,
      step13,
    },
    hzco,
    slots: finalSlots,
    placements: step8.placements,
    rollTable: step8.rollTable,
    anomalies: step7.anomalies,
  };
}

// â”€â”€ Mainworld Candidate Identification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 29 atmosphere metadata keyed by Traveller atmosphere code.
 */
export const ATMOSPHERE_CODE_TABLE = Object.freeze({
  0: Object.freeze({
    code: "0",
    composition: "None",
    pressureRangeBar: [0.0, 0.0009],
    spanBar: 0.0009,
    survivalGearRequired: "Vacc Suit",
    notes: "Examples: Mercury, Luna",
  }),
  1: Object.freeze({
    code: "1",
    composition: "Trace",
    pressureRangeBar: [0.001, 0.09],
    spanBar: 0.089,
    survivalGearRequired: "Vacc Suit",
    notes: "Example: Mars",
  }),
  2: Object.freeze({
    code: "2",
    composition: "Very Thin, Tainted",
    pressureRangeBar: [0.1, 0.42],
    spanBar: 0.32,
    survivalGearRequired: "Respirator and Filter",
    notes: "",
  }),
  3: Object.freeze({
    code: "3",
    composition: "Very Thin",
    pressureRangeBar: [0.1, 0.42],
    spanBar: 0.32,
    survivalGearRequired: "Respirator",
    notes: "",
  }),
  4: Object.freeze({
    code: "4",
    composition: "Thin, Tainted",
    pressureRangeBar: [0.43, 0.7],
    spanBar: 0.27,
    survivalGearRequired: "Filter",
    notes: "",
  }),
  5: Object.freeze({
    code: "5",
    composition: "Thin",
    pressureRangeBar: [0.43, 0.7],
    spanBar: 0.27,
    survivalGearRequired: "None",
    notes: "",
  }),
  6: Object.freeze({
    code: "6",
    composition: "Standard",
    pressureRangeBar: [0.7, 1.49],
    spanBar: 0.79,
    survivalGearRequired: "None",
    notes: "Example: Terra",
  }),
  7: Object.freeze({
    code: "7",
    composition: "Standard, Tainted",
    pressureRangeBar: [0.7, 1.49],
    spanBar: 0.79,
    survivalGearRequired: "Filter",
    notes: "",
  }),
  8: Object.freeze({
    code: "8",
    composition: "Dense",
    pressureRangeBar: [1.5, 2.49],
    spanBar: 0.99,
    survivalGearRequired: "None",
    notes: "",
  }),
  9: Object.freeze({
    code: "9",
    composition: "Dense, Tainted",
    pressureRangeBar: [1.5, 2.49],
    spanBar: 0.99,
    survivalGearRequired: "Filter",
    notes: "",
  }),
  A: Object.freeze({
    code: "A",
    composition: "Exotic",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "Air Supply",
    notes: "Example: Titan",
  }),
  B: Object.freeze({
    code: "B",
    composition: "Corrosive",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "Vacc Suit",
    notes: "Example: Venus",
  }),
  C: Object.freeze({
    code: "C",
    composition: "Insidious",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "Vacc Suit",
    notes: "",
  }),
  D: Object.freeze({
    code: "D",
    composition: "Very Dense",
    pressureRangeBar: [2.5, 10.0],
    spanBar: 7.5,
    survivalGearRequired: "Varies by altitude",
    notes: "",
  }),
  E: Object.freeze({
    code: "E",
    composition: "Low",
    pressureRangeBar: [0.1, 0.42],
    spanBar: 0.32,
    survivalGearRequired: "Varies by altitude",
    notes: "",
  }),
  F: Object.freeze({
    code: "F",
    composition: "Unusual",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "Varies",
    notes: "",
  }),
  G: Object.freeze({
    code: "G",
    composition: "Gas, Helium",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "HEV Suit",
    notes: "Dense helium-dominated gas",
  }),
  H: Object.freeze({
    code: "H",
    composition: "Gas, Hydrogen",
    pressureRangeBar: null,
    spanBar: null,
    survivalGearRequired: "Not Survivable",
    notes: "Gas Dwarf",
  }),
});

function normalizeAtmosphereCodeInput(atmosphereCode) {
  if (typeof atmosphereCode === "number") {
    return toEHex(Math.floor(atmosphereCode));
  }

  const normalized = String(atmosphereCode ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) return null;

  if (/^[0-9A-H]$/.test(normalized)) {
    return normalized;
  }

  return null;
}

const ATMOSPHERE_TEMPERATURE_DM_TABLE = Object.freeze({
  0: Object.freeze({ dm: 0, notes: ["No modifier; extreme day/night swings are common"] }),
  1: Object.freeze({ dm: 0, notes: ["No modifier; extreme day/night swings are common"] }),
  2: Object.freeze({ dm: -2, notes: [] }),
  3: Object.freeze({ dm: -2, notes: [] }),
  4: Object.freeze({ dm: -1, notes: [] }),
  5: Object.freeze({ dm: -1, notes: [] }),
  6: Object.freeze({ dm: 0, notes: [] }),
  7: Object.freeze({ dm: 0, notes: [] }),
  8: Object.freeze({ dm: 1, notes: [] }),
  9: Object.freeze({ dm: 1, notes: [] }),
  A: Object.freeze({ dm: 2, notes: [] }),
  B: Object.freeze({ dm: 6, notes: [] }),
  C: Object.freeze({ dm: 6, notes: [] }),
  D: Object.freeze({ dm: 2, notes: [] }),
  E: Object.freeze({ dm: -1, notes: [] }),
  F: Object.freeze({ dm: 2, notes: [] }),
});

/**
 * Resolve atmosphere temperature DM from Table 30 modifiers.
 *
 * @param {string|number|null|undefined} atmosphereCode
 * @returns {{ code: string|null, dm: number, notes: string[] }}
 */
export function lookupAtmosphereTemperatureDm(atmosphereCode) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  if (!code) {
    return { code: null, dm: 0, notes: [] };
  }

  const record = ATMOSPHERE_TEMPERATURE_DM_TABLE[code];
  if (!record) {
    return {
      code,
      dm: 0,
      notes: ["No explicit temperature DM for this atmosphere code"],
    };
  }

  return {
    code,
    dm: record.dm,
    notes: [...record.notes],
  };
}

/**
 * Estimate the modified temperature roll when only qualitative temperature is known.
 *
 * @param {string} temperatureType
 * @returns {number} Assumed modified roll (cold=4, temperate=7, hot=10).
 */
export function estimateModifiedTemperatureRollFromType(temperatureType) {
  const normalized = String(temperatureType ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "cold") return 4;
  if (normalized === "hot") return 10;
  return 7;
}

/**
 * Reverse-engineer an approximate raw temperature roll by removing atmosphere DM.
 *
 * @param {object} options
 * @param {number} [options.modifiedRoll]
 * @param {string} [options.temperatureType]
 * @param {string|number|null|undefined} [options.atmosphereCode]
 * @returns {{ modifiedRoll: number, atmosphereDm: number, rawRoll: number }}
 */
export function reverseEngineerTemperatureRawRoll({ modifiedRoll, temperatureType, atmosphereCode } = {}) {
  const effectiveModifiedRoll = Number.isFinite(modifiedRoll)
    ? Math.round(Number(modifiedRoll))
    : estimateModifiedTemperatureRollFromType(temperatureType);
  const atmosphereDm = lookupAtmosphereTemperatureDm(atmosphereCode).dm;
  const rawRoll = Math.max(2, Math.min(12, effectiveModifiedRoll - atmosphereDm));

  return {
    modifiedRoll: effectiveModifiedRoll,
    atmosphereDm,
    rawRoll,
  };
}

/** Table 55: Basic Mean Temperature (modified roll -> nominal temperatures). */
export const BASIC_MEAN_TEMPERATURE_TABLE_55 = Object.freeze({
  0: Object.freeze({ celsius: -85, kelvin: 178 }),
  1: Object.freeze({ celsius: -75, kelvin: 198 }),
  2: Object.freeze({ celsius: -55, kelvin: 218 }),
  3: Object.freeze({ celsius: -35, kelvin: 238 }),
  4: Object.freeze({ celsius: -10, kelvin: 263 }),
  5: Object.freeze({ celsius: 5, kelvin: 278 }),
  6: Object.freeze({ celsius: 10, kelvin: 283 }),
  7: Object.freeze({ celsius: 15, kelvin: 288 }),
  8: Object.freeze({ celsius: 20, kelvin: 293 }),
  9: Object.freeze({ celsius: 25, kelvin: 298 }),
  10: Object.freeze({ celsius: 40, kelvin: 313 }),
  11: Object.freeze({ celsius: 65, kelvin: 338 }),
  12: Object.freeze({ celsius: 115, kelvin: 388 }),
});

export const ALBEDO_WORLD_TYPES = Object.freeze({
  ROCKY_TERRESTRIAL: "ROCKY_TERRESTRIAL",
  ICY_TERRESTRIAL_NEAR: "ICY_TERRESTRIAL_NEAR",
  ICY_TERRESTRIAL_FAR: "ICY_TERRESTRIAL_FAR",
  GAS_GIANT: "GAS_GIANT",
});

function clampAlbedo(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(0.02, Math.min(0.98, value));
}

/**
 * Lookup Table 55 basic mean temperature from modified roll.
 *
 * Behavior:
 * - Rolls below 0 continue by -5C per step from -1 => 0C
 * - Rolls above 12 continue by +50C per step from 12 => 115C
 * - Extreme low results (below 10K, or lower than modified -33) are recomputed
 *   as 1D+5 Kelvin.
 *
 * @param {number} modifiedRoll
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   modifiedRoll: number,
 *   celsius: number,
 *   kelvin: number,
 *   fahrenheit: number,
 *   source: string,
 *   rerolledExtremeLow: boolean,
 *   reroll1d: number|null
 * }|null}
 */
export function lookupBasicMeanTemperature(modifiedRoll, { rng = Math.random } = {}) {
  const roll = Number(modifiedRoll);
  if (!Number.isFinite(roll)) return null;

  const normalizedRoll = Math.round(roll);
  let celsius;
  let kelvin;
  let source = "table";

  if (Object.prototype.hasOwnProperty.call(BASIC_MEAN_TEMPERATURE_TABLE_55, normalizedRoll)) {
    celsius = BASIC_MEAN_TEMPERATURE_TABLE_55[normalizedRoll].celsius;
    kelvin = BASIC_MEAN_TEMPERATURE_TABLE_55[normalizedRoll].kelvin;
  } else if (normalizedRoll < 0) {
    celsius = (normalizedRoll + 1) * 5;
    kelvin = celsius + 273;
    source = "below_zero";
  } else {
    celsius = 115 + (normalizedRoll - 12) * 50;
    kelvin = celsius + 273;
    source = "above_twelve";
  }

  let rerolledExtremeLow = false;
  let reroll1d = null;
  if (normalizedRoll < -33 || kelvin < 10) {
    reroll1d = roll1d(rng);
    kelvin = reroll1d + 5;
    celsius = kelvin - 273;
    source = "extreme_low_reroll";
    rerolledExtremeLow = true;
  }

  if (kelvin < 3) {
    kelvin = 3;
    celsius = kelvin - 273;
    source = "minimum_kelvin_clamp";
  }

  return {
    modifiedRoll: normalizedRoll,
    celsius,
    kelvin,
    fahrenheit: kelvin * 1.8 - 459.67,
    source,
    rerolledExtremeLow,
    reroll1d,
  };
}

/**
 * Orbit DM for basic mean temperature.
 *
 * Rule:
 * - Orbit# < HZCO-1: DM+4 plus +1 per 0.5 below that threshold (rounded)
 * - Orbit# > HZCO+1: DM-4 plus -1 per 0.5 above that threshold (rounded)
 * - Otherwise DM 0
 *
 * Effective deviation uses divisional translation when low-orbit values are involved.
 *
 * @param {object} [options]
 * @param {number} options.orbitNumber
 * @param {number} options.hzco
 * @returns {number}
 */
export function calculateBasicMeanTemperatureOrbitDm({ orbitNumber, hzco } = {}) {
  const deviation = calculateEffectiveHZCODeviation(Number(orbitNumber), Number(hzco));
  if (!Number.isFinite(deviation)) return 0;

  if (deviation < -1) {
    const extraHalfSteps = Math.max(0, Math.round((Math.abs(deviation) - 1) / 0.5));
    return 4 + extraHalfSteps;
  }

  if (deviation > 1) {
    const extraHalfSteps = Math.max(0, Math.round((deviation - 1) / 0.5));
    return -(4 + extraHalfSteps);
  }

  return 0;
}

/**
 * Build a modified roll for basic mean temperature.
 *
 * @param {object} [options]
 * @param {number} [options.rawRoll=7]
 * @param {string|number|null|undefined} [options.atmosphereCode]
 * @param {number} [options.orbitNumber]
 * @param {number} [options.hzco]
 * @param {number} [options.additionalDm=0]
 * @returns {{ rawRoll: number, atmosphereDm: number, orbitDm: number, additionalDm: number, modifiedRoll: number }}
 */
export function calculateBasicMeanTemperatureModifiedRoll({
  rawRoll = 7,
  atmosphereCode,
  orbitNumber,
  hzco,
  additionalDm = 0,
} = {}) {
  const baseRawRoll = Number.isFinite(rawRoll) ? Math.round(Number(rawRoll)) : 7;
  const atmosphereDm = lookupAtmosphereTemperatureDm(atmosphereCode).dm;
  const orbitDm = calculateBasicMeanTemperatureOrbitDm({ orbitNumber, hzco });
  const extraDm = Number.isFinite(additionalDm) ? Math.round(Number(additionalDm)) : 0;

  return {
    rawRoll: baseRawRoll,
    atmosphereDm,
    orbitDm,
    additionalDm: extraDm,
    modifiedRoll: baseRawRoll + atmosphereDm + orbitDm + extraDm,
  };
}

/**
 * Roll Table 56-style albedo from world type and modifiers.
 *
 * @param {object} [options]
 * @param {string} [options.worldType="ROCKY_TERRESTRIAL"]
 * @param {string|number|null|undefined} [options.atmosphereCode]
 * @param {string|number|null|undefined} [options.hydrographicsCode]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   worldType: string,
 *   baseAlbedo: number,
 *   atmosphereModifier: number,
 *   hydrographicsModifier: number,
 *   specialAdjustment: number,
 *   albedo: number,
 *   rolls: Record<string, number>
 * }|null}
 */
export function rollWorldAlbedo({
  worldType = ALBEDO_WORLD_TYPES.ROCKY_TERRESTRIAL,
  atmosphereCode,
  hydrographicsCode,
  rng = Math.random,
} = {}) {
  const type = String(worldType ?? "")
    .trim()
    .toUpperCase();
  if (!Object.values(ALBEDO_WORLD_TYPES).includes(type)) return null;

  const rolls = {};
  let baseAlbedo = 0;
  let specialAdjustment = 0;

  if (type === ALBEDO_WORLD_TYPES.ROCKY_TERRESTRIAL) {
    const r2d = roll2d(rng);
    rolls.base2d = r2d;
    baseAlbedo = 0.04 + (r2d - 2) * 0.02;
  } else if (type === ALBEDO_WORLD_TYPES.ICY_TERRESTRIAL_NEAR) {
    const r2d = roll2d(rng);
    rolls.base2d = r2d;
    baseAlbedo = 0.2 + (r2d - 3) * 0.05;
  } else if (type === ALBEDO_WORLD_TYPES.ICY_TERRESTRIAL_FAR) {
    const r2d = roll2d(rng);
    rolls.base2d = r2d;
    baseAlbedo = 0.25 + (r2d - 2) * 0.07;
    if (baseAlbedo <= 0.4) {
      const d1 = roll1d(rng);
      rolls.special1d = d1;
      specialAdjustment = -(d1 - 1) * 0.05;
    }
  } else if (type === ALBEDO_WORLD_TYPES.GAS_GIANT) {
    const r2d = roll2d(rng);
    rolls.base2d = r2d;
    baseAlbedo = 0.05 + r2d * 0.05;
  }

  const atmoCode = normalizeAtmosphereCodeInput(atmosphereCode);
  const atmoValue = atmoCode !== null ? fromEHex(atmoCode) : null;
  let atmosphereModifier = 0;

  if (atmoCode === "E" || (Number.isFinite(atmoValue) && atmoValue >= 1 && atmoValue <= 3)) {
    const r2d = roll2d(rng);
    rolls.atmosphere2d = r2d;
    atmosphereModifier = (r2d - 3) * 0.01;
  } else if (Number.isFinite(atmoValue) && atmoValue >= 4 && atmoValue <= 9) {
    const r2d = roll2d(rng);
    rolls.atmosphere2d = r2d;
    atmosphereModifier = r2d * 0.01;
  } else if (atmoCode === "D") {
    const r2d = roll2d(rng);
    rolls.atmosphere2d = r2d;
    atmosphereModifier = r2d * 0.03;
  } else if (["A", "B", "C", "F", "G", "H"].includes(atmoCode)) {
    const r2d = roll2d(rng);
    rolls.atmosphere2d = r2d;
    atmosphereModifier = (r2d - 2) * 0.05;
  }

  const hydroValue = resolveHydrographicsCodeValue(hydrographicsCode);
  let hydrographicsModifier = 0;
  if (Number.isFinite(hydroValue) && hydroValue >= 2 && hydroValue <= 5) {
    const r2d = roll2d(rng);
    rolls.hydro2d = r2d;
    hydrographicsModifier = (r2d - 2) * 0.02;
  } else if (Number.isFinite(hydroValue) && hydroValue >= 6) {
    const r2d = roll2d(rng);
    rolls.hydro2d = r2d;
    hydrographicsModifier = (r2d - 4) * 0.03;
  }

  const unclamped = baseAlbedo + atmosphereModifier + hydrographicsModifier + specialAdjustment;
  const albedo = clampAlbedo(unclamped);

  return {
    worldType: type,
    baseAlbedo,
    atmosphereModifier,
    hydrographicsModifier,
    specialAdjustment,
    albedo,
    rolls,
  };
}

/**
 * Initial greenhouse factor from pressure.
 *
 * Formula:
 *   0.5 * sqrt(pressureBar)
 *
 * @param {object} [options]
 * @param {number} options.atmosphericPressureBar
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateInitialGreenhouseFactor({ atmosphericPressureBar, precision } = {}) {
  const pressure = Number(atmosphericPressureBar);
  if (!Number.isFinite(pressure) || pressure < 0) return null;
  return roundToPrecision(0.5 * Math.sqrt(pressure), precision);
}

/**
 * Effective greenhouse factor using atmosphere-code modifiers.
 *
 * Modifiers:
 * - Atmosphere 1-9, D, E: +(3D * 0.01)
 * - Atmosphere A or F: x (1D-1), minimum x0.5
 * - Atmosphere B, C, G, H: 1D, x(1..5) or x(3D when 6)
 *
 * @param {object} [options]
 * @param {number} options.atmosphericPressureBar
 * @param {string|number|null|undefined} options.atmosphereCode
 * @param {Function} [options.rng=Math.random]
 * @param {number} [options.precision]
 * @returns {{
 *   initialGreenhouseFactor: number,
 *   effectiveGreenhouseFactor: number,
 *   additiveModifier: number,
 *   multiplierModifier: number,
 *   modifierType: string,
 *   rolls: Record<string, number>
 * }|null}
 */
export function calculateEffectiveGreenhouseFactor({
  atmosphericPressureBar,
  atmosphereCode,
  rng = Math.random,
  precision,
} = {}) {
  const initial = calculateInitialGreenhouseFactor({ atmosphericPressureBar });
  if (!Number.isFinite(initial)) return null;

  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  const codeValue = code !== null ? fromEHex(code) : null;

  if (code === "0") {
    return {
      initialGreenhouseFactor: 0,
      effectiveGreenhouseFactor: 0,
      additiveModifier: 0,
      multiplierModifier: 1,
      modifierType: "vacuum",
      rolls: {},
    };
  }

  let additiveModifier = 0;
  let multiplierModifier = 1;
  let modifierType = "none";
  const rolls = {};

  if ((Number.isFinite(codeValue) && codeValue >= 1 && codeValue <= 9) || code === "D" || code === "E") {
    const d3 = roll3d(rng);
    rolls.modifier3d = d3;
    additiveModifier = d3 * 0.01;
    modifierType = "additive_3d_percent";
  } else if (code === "A" || code === "F") {
    const d1 = roll1d(rng);
    rolls.modifier1d = d1;
    multiplierModifier = Math.max(0.5, d1 - 1);
    modifierType = "multiplier_a_f";
  } else if (["B", "C", "G", "H"].includes(code)) {
    const d1 = roll1d(rng);
    rolls.modifier1d = d1;
    if (d1 <= 5) {
      multiplierModifier = d1;
      modifierType = "multiplier_bcgh_1_to_5";
    } else {
      const d3 = roll3d(rng);
      rolls.modifier3d = d3;
      multiplierModifier = d3;
      modifierType = "multiplier_bcgh_3d";
    }
  }

  const effective = (initial + additiveModifier) * multiplierModifier;

  return {
    initialGreenhouseFactor: roundToPrecision(initial, precision),
    effectiveGreenhouseFactor: roundToPrecision(effective, precision),
    additiveModifier: roundToPrecision(additiveModifier, precision),
    multiplierModifier: roundToPrecision(multiplierModifier, precision),
    modifierType,
    rolls,
  };
}

/**
 * Mean temperature in Kelvin from luminosity, albedo, greenhouse, and distance.
 *
 * Formula:
 *   279 * ((luminosity * (1-albedo) * (1+greenhouseFactor)) / distanceAu^2)^(1/4)
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} [options.albedo=0.3]
 * @param {number} [options.greenhouseFactor=0]
 * @returns {number|null}
 */
export function calculateMeanTemperatureKelvin({ luminosity, distanceAu, albedo = 0.3, greenhouseFactor = 0 } = {}) {
  const lum = Number(luminosity);
  const au = Number(distanceAu);
  const alb = Number(albedo);
  const gh = Number(greenhouseFactor);

  if (!Number.isFinite(lum) || !Number.isFinite(au) || !Number.isFinite(alb) || !Number.isFinite(gh)) return null;
  if (lum < 0 || au <= 0 || alb < 0 || alb > 1 || gh < -1) return null;

  const term = (lum * (1 - alb) * (1 + gh)) / au ** 2;
  if (!Number.isFinite(term) || term < 0) return null;

  return 279 * Math.pow(term, 0.25);
}

/**
 * Mean temperature in K, C, and F.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} [options.albedo=0.3]
 * @param {number} [options.greenhouseFactor=0]
 * @param {number} [options.precision]
 * @returns {{ kelvin: number, celsius: number, fahrenheit: number }|null}
 */
export function calculateMeanTemperature({
  luminosity,
  distanceAu,
  albedo = 0.3,
  greenhouseFactor = 0,
  precision,
} = {}) {
  const kelvin = calculateMeanTemperatureKelvin({ luminosity, distanceAu, albedo, greenhouseFactor });
  if (!Number.isFinite(kelvin)) return null;

  return {
    kelvin: roundToPrecision(kelvin, precision),
    celsius: roundToPrecision(kelvin - 273, precision),
    fahrenheit: roundToPrecision(kelvin * 1.8 - 459.67, precision),
  };
}

/**
 * Combine independent temperature contributors via fourth-power addition.
 *
 * Formula:
 *   T_total = (T1^4 + T2^4 + ...)^(1/4)
 *
 * @param {object} [options]
 * @param {number[]} options.temperaturesK
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateCombinedTemperatureKelvin({ temperaturesK, precision } = {}) {
  if (!Array.isArray(temperaturesK)) return null;
  const values = temperaturesK.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0);
  if (values.length === 0) return null;

  const combined = Math.pow(
    values.reduce((sum, t) => sum + t ** 4, 0),
    0.25,
  );
  return roundToPrecision(combined, precision);
}

const SUN_RADIUS_KM = 695700;
const SUN_SURFACE_TEMPERATURE_K = 5772;

/**
 * Estimate gas giant residual heat temperature in Kelvin.
 *
 * Formula:
 *   T = 80 * (massEarth)^(1/4) / sqrt(ageGyr)
 *
 * @param {object} [options]
 * @param {number} options.massEarth
 * @param {number} options.ageGyr
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateGasGiantResidualHeatTemperatureKelvin({ massEarth, ageGyr, precision } = {}) {
  const mass = Number(massEarth);
  const age = Number(ageGyr);
  if (!Number.isFinite(mass) || mass <= 0 || !Number.isFinite(age) || age <= 0) return null;

  const kelvin = (80 * Math.pow(mass, 0.25)) / Math.sqrt(age);
  return roundToPrecision(kelvin, precision);
}

/**
 * Convert radius and effective temperature to luminosity in solar units.
 *
 * Formula:
 *   L/Lsun = (R/Rsun)^2 * (T/Tsun)^4
 *
 * @param {object} [options]
 * @param {number} options.radiusKm
 * @param {number} options.temperatureK
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateThermalLuminositySolar({ radiusKm, temperatureK, precision } = {}) {
  const radius = Number(radiusKm);
  const temperature = Number(temperatureK);
  if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(temperature) || temperature <= 0) return null;

  const luminosity = (radius / SUN_RADIUS_KM) ** 2 * (temperature / SUN_SURFACE_TEMPERATURE_K) ** 4;
  return roundToPrecision(luminosity, precision);
}

function resolveGasGiantRadiusKm({ gasGiantRadiusKm, gasGiantDiameterKm, gasGiantDiameterTerran } = {}) {
  const directRadius = Number(gasGiantRadiusKm);
  if (Number.isFinite(directRadius) && directRadius > 0) return directRadius;

  const directDiameter = Number(gasGiantDiameterKm);
  if (Number.isFinite(directDiameter) && directDiameter > 0) return directDiameter / 2;

  const diameterTerran = Number(gasGiantDiameterTerran);
  if (Number.isFinite(diameterTerran) && diameterTerran > 0) {
    return (diameterTerran * BASIC_TERRESTRIAL_WORLD_DIAMETER_BY_SIZE["8"]) / 2;
  }

  return null;
}

/**
 * Compute residual-heat scenario outputs for a gas giant and moon-heating impact.
 *
 * Workflow:
 * 1) Residual heat from mass/age formula.
 * 2) Combine residual and sun-driven cloud-top temperature via fourth-power addition.
 * 3) Convert gas giant effective temperature + radius to a thermal luminosity.
 * 4) Compute moon-heating contribution at moon distance.
 * 5) Optionally combine moon-heating with baseline moon temperature and report delta.
 *
 * @param {object} [options]
 * @param {number} options.massEarth
 * @param {number} options.ageGyr
 * @param {number} [options.cloudTopTemperatureK]
 * @param {number} [options.stellarLuminosity]
 * @param {number} [options.orbitalDistanceAu]
 * @param {number} [options.cloudTopAlbedo=0.4]
 * @param {number} [options.cloudTopGreenhouseFactor=0]
 * @param {number} [options.gasGiantRadiusKm]
 * @param {number} [options.gasGiantDiameterKm]
 * @param {number} [options.gasGiantDiameterTerran]
 * @param {number} [options.moonDistanceKm]
 * @param {number} [options.moonAlbedo=0]
 * @param {number} [options.moonGreenhouseFactor=0]
 * @param {number} [options.baselineMoonTemperatureK]
 * @param {number} [options.precision]
 * @returns {{
 *   residualHeatTemperatureK: number|null,
 *   cloudTopTemperatureK: number|null,
 *   gasGiantEffectiveTemperatureK: number|null,
 *   gasGiantRadiusKm: number|null,
 *   gasGiantThermalLuminositySolar: number|null,
 *   moonDistanceKm: number|null,
 *   moonDistanceAu: number|null,
 *   moonHeatingTemperatureK: number|null,
 *   baselineMoonTemperatureK: number|null,
 *   moonCombinedTemperatureK: number|null,
 *   moonHeatingDeltaK: number|null,
 * }|null}
 */
export function calculateGasGiantResidualHeatScenario({
  massEarth,
  ageGyr,
  cloudTopTemperatureK,
  stellarLuminosity,
  orbitalDistanceAu,
  cloudTopAlbedo = 0.4,
  cloudTopGreenhouseFactor = 0,
  gasGiantRadiusKm,
  gasGiantDiameterKm,
  gasGiantDiameterTerran,
  moonDistanceKm,
  moonAlbedo = 0,
  moonGreenhouseFactor = 0,
  baselineMoonTemperatureK,
  precision,
} = {}) {
  const residualHeatTemperatureK = calculateGasGiantResidualHeatTemperatureKelvin({ massEarth, ageGyr, precision });
  if (!Number.isFinite(residualHeatTemperatureK)) return null;

  const resolvedCloudTopTemperatureK = Number.isFinite(cloudTopTemperatureK)
    ? roundToPrecision(Number(cloudTopTemperatureK), precision)
    : calculateMeanTemperatureKelvin({
        luminosity: stellarLuminosity,
        distanceAu: orbitalDistanceAu,
        albedo: cloudTopAlbedo,
        greenhouseFactor: cloudTopGreenhouseFactor,
      });

  const gasGiantEffectiveTemperatureK = Number.isFinite(resolvedCloudTopTemperatureK)
    ? calculateCombinedTemperatureKelvin({
        temperaturesK: [resolvedCloudTopTemperatureK, residualHeatTemperatureK],
        precision,
      })
    : residualHeatTemperatureK;

  const resolvedRadiusKm = resolveGasGiantRadiusKm({
    gasGiantRadiusKm,
    gasGiantDiameterKm,
    gasGiantDiameterTerran,
  });
  const gasGiantThermalLuminositySolarRaw =
    Number.isFinite(resolvedRadiusKm) && Number.isFinite(gasGiantEffectiveTemperatureK)
      ? calculateThermalLuminositySolar({
          radiusKm: resolvedRadiusKm,
          temperatureK: gasGiantEffectiveTemperatureK,
        })
      : null;

  const moonDistanceKmValue = Number(moonDistanceKm);
  const moonDistanceAu =
    Number.isFinite(moonDistanceKmValue) && moonDistanceKmValue > 0
      ? roundToPrecision(moonDistanceKmValue / AU_IN_KM, precision)
      : null;
  const moonHeatingTemperatureK =
    Number.isFinite(gasGiantThermalLuminositySolarRaw) && Number.isFinite(moonDistanceAu) && Number(moonDistanceAu) > 0
      ? calculateMeanTemperatureKelvin({
          luminosity: gasGiantThermalLuminositySolarRaw,
          distanceAu: moonDistanceAu,
          albedo: moonAlbedo,
          greenhouseFactor: moonGreenhouseFactor,
        })
      : null;

  const baseline = Number(baselineMoonTemperatureK);
  const moonCombinedTemperatureK =
    Number.isFinite(baseline) && Number.isFinite(moonHeatingTemperatureK)
      ? calculateCombinedTemperatureKelvin({ temperaturesK: [baseline, moonHeatingTemperatureK], precision })
      : null;
  const moonHeatingDeltaK =
    Number.isFinite(moonCombinedTemperatureK) && Number.isFinite(baseline)
      ? roundToPrecision(moonCombinedTemperatureK - baseline, precision)
      : null;

  return {
    residualHeatTemperatureK,
    cloudTopTemperatureK: Number.isFinite(resolvedCloudTopTemperatureK)
      ? roundToPrecision(resolvedCloudTopTemperatureK, precision)
      : null,
    gasGiantEffectiveTemperatureK: Number.isFinite(gasGiantEffectiveTemperatureK)
      ? roundToPrecision(gasGiantEffectiveTemperatureK, precision)
      : null,
    gasGiantRadiusKm: Number.isFinite(resolvedRadiusKm) ? roundToPrecision(resolvedRadiusKm, precision) : null,
    gasGiantThermalLuminositySolar: Number.isFinite(gasGiantThermalLuminositySolarRaw)
      ? roundToPrecision(gasGiantThermalLuminositySolarRaw, precision)
      : null,
    moonDistanceKm: Number.isFinite(moonDistanceKmValue) ? roundToPrecision(moonDistanceKmValue, precision) : null,
    moonDistanceAu,
    moonHeatingTemperatureK: Number.isFinite(moonHeatingTemperatureK)
      ? roundToPrecision(moonHeatingTemperatureK, precision)
      : null,
    baselineMoonTemperatureK: Number.isFinite(baseline) ? roundToPrecision(baseline, precision) : null,
    moonCombinedTemperatureK,
    moonHeatingDeltaK,
  };
}

/**
 * Normalize axial tilt into the 0-90 degree range used by seasonal calculations.
 *
 * Rules:
 * - Negative values are treated as positive.
 * - Values above 90 are reflected back from 180.
 *
 * @param {number} axialTiltDegrees
 * @returns {number|null}
 */
export function normalizeAxialTiltForTemperatureVariation(axialTiltDegrees) {
  const tilt = Number(axialTiltDegrees);
  if (!Number.isFinite(tilt)) return null;

  let normalized = Math.abs(tilt) % 360;
  if (normalized > 180) normalized = 360 - normalized;
  if (normalized > 90) normalized = 180 - normalized;
  return normalized;
}

/**
 * Step 1: Axial tilt factor.
 *
 * Basic factor is sin(tiltDegrees) with tilt normalized to 0-90 degrees,
 * then season-length adjustments are applied:
 * - year < 0.1 standard years: factor / 2
 * - year > 2.0 standard years: +0.01 * year, capped at +0.25 and max factor 1.0
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} [options.yearLengthStandardYears]
 * @param {number} [options.precision]
 * @returns {{
 *   normalizedAxialTiltDegrees: number,
 *   basicFactor: number,
 *   factor: number,
 *   seasonalAdjustment: number,
 *   adjustmentType: string,
 * }|null}
 */
export function calculateAxialTiltFactor({ axialTiltDegrees, yearLengthStandardYears, precision } = {}) {
  const normalizedAxialTiltDegrees = normalizeAxialTiltForTemperatureVariation(axialTiltDegrees);
  if (!Number.isFinite(normalizedAxialTiltDegrees)) return null;

  const basicFactor = Math.abs(Math.sin((normalizedAxialTiltDegrees * Math.PI) / 180));
  let factor = basicFactor;
  let seasonalAdjustment = 0;
  let adjustmentType = "none";

  const yearLength = Number(yearLengthStandardYears);
  if (Number.isFinite(yearLength) && yearLength > 0) {
    if (yearLength < 0.1) {
      factor = factor / 2;
      adjustmentType = "short_year_halving";
    } else if (yearLength > 2.0) {
      seasonalAdjustment = Math.min(0.25, yearLength * 0.01);
      factor = Math.min(1, factor + seasonalAdjustment);
      adjustmentType = "long_year_increase";
    }
  }

  return {
    normalizedAxialTiltDegrees: roundToPrecision(normalizedAxialTiltDegrees, precision),
    basicFactor: roundToPrecision(basicFactor, precision),
    factor: roundToPrecision(factor, precision),
    seasonalAdjustment: roundToPrecision(seasonalAdjustment, precision),
    adjustmentType,
  };
}

/**
 * Step 2: Rotation factor from solar day length.
 *
 * Formula:
 *   sqrt(abs(solarDayHours)) / 50
 *
 * Exceptions:
 * - abs(solarDayHours) > 2500 -> 1.0
 * - 1:1 tidal lock to star(s) -> 1.0
 *
 * @param {object} [options]
 * @param {number} options.solarDayHours
 * @param {boolean} [options.isOneToOneSunLock=false]
 * @param {number} [options.precision]
 * @returns {{ factor: number, absoluteSolarDayHours: number, source: string }|null}
 */
export function calculateRotationFactor({ solarDayHours, isOneToOneSunLock = false, precision } = {}) {
  const day = Math.abs(Number(solarDayHours));
  if (!Number.isFinite(day)) return null;

  if (isOneToOneSunLock) {
    return {
      factor: 1,
      absoluteSolarDayHours: roundToPrecision(day, precision),
      source: "one_to_one_lock",
    };
  }

  if (day > 2500) {
    return {
      factor: 1,
      absoluteSolarDayHours: roundToPrecision(day, precision),
      source: "long_day_cap",
    };
  }

  return {
    factor: roundToPrecision(Math.sqrt(day) / 50, precision),
    absoluteSolarDayHours: roundToPrecision(day, precision),
    source: "formula",
  };
}

function resolveSurfaceDistributionCodeValue(surfaceDistributionCode) {
  const normalized = normalizeAtmosphereCodeInput(surfaceDistributionCode);
  if (normalized !== null) {
    const value = fromEHex(normalized);
    return Number.isFinite(value) ? value : null;
  }

  const numeric = Math.floor(Number(surfaceDistributionCode));
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Step 3: Geographic factor from hydrographics and surface distribution.
 *
 * Formula:
 *   (10 - hydrographics) / 20 + modifier
 *
 * Modifier applies only for hydrographics 2-8:
 * - surface distribution 9+ : +0.1
 * - surface distribution 1- : -0.1
 *
 * @param {object} [options]
 * @param {string|number} options.hydrographicsCode
 * @param {string|number} [options.surfaceDistributionCode]
 * @param {number} [options.precision]
 * @returns {{ hydrographicsValue: number, baseFactor: number, modifier: number, factor: number }|null}
 */
export function calculateGeographicFactor({ hydrographicsCode, surfaceDistributionCode, precision } = {}) {
  const hydrographicsValue = resolveHydrographicsCodeValue(hydrographicsCode);
  if (!Number.isFinite(hydrographicsValue)) return null;

  const baseFactor = (10 - hydrographicsValue) / 20;
  let modifier = 0;

  if (hydrographicsValue >= 2 && hydrographicsValue <= 8) {
    const surfaceDistributionValue = resolveSurfaceDistributionCodeValue(surfaceDistributionCode);
    if (Number.isFinite(surfaceDistributionValue)) {
      if (surfaceDistributionValue >= 9) modifier = 0.1;
      else if (surfaceDistributionValue <= 1) modifier = -0.1;
    }
  }

  return {
    hydrographicsValue,
    baseFactor: roundToPrecision(baseFactor, precision),
    modifier: roundToPrecision(modifier, precision),
    factor: roundToPrecision(baseFactor + modifier, precision),
  };
}

/**
 * Step 4: Variance factors sum, clamped to [0, 1].
 *
 * @param {object} [options]
 * @param {number} [options.axialTiltFactor=0]
 * @param {number} [options.rotationFactor=0]
 * @param {number} [options.geographicFactor=0]
 * @param {number} [options.precision]
 * @returns {{ sum: number, value: number, clamped: boolean }}
 */
export function calculateVarianceFactors({
  axialTiltFactor = 0,
  rotationFactor = 0,
  geographicFactor = 0,
  precision,
} = {}) {
  const axial = Number.isFinite(axialTiltFactor) ? Number(axialTiltFactor) : 0;
  const rotation = Number.isFinite(rotationFactor) ? Number(rotationFactor) : 0;
  const geographic = Number.isFinite(geographicFactor) ? Number(geographicFactor) : 0;
  const sum = axial + rotation + geographic;
  const value = Math.max(0, Math.min(1, sum));

  return {
    sum: roundToPrecision(sum, precision),
    value: roundToPrecision(value, precision),
    clamped: value !== sum,
  };
}

/**
 * Step 5: Atmospheric factor.
 *
 * Formula:
 *   1 + atmosphericPressureBar
 *
 * @param {object} [options]
 * @param {number} options.atmosphericPressureBar
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAtmosphericFactor({ atmosphericPressureBar, precision } = {}) {
  const pressure = Number(atmosphericPressureBar);
  if (!Number.isFinite(pressure) || pressure < 0) return null;
  return roundToPrecision(1 + pressure, precision);
}

/**
 * Step 6: Luminosity modifier.
 *
 * Formula:
 *   varianceFactors / atmosphericFactor
 *
 * @param {object} [options]
 * @param {number} options.varianceFactors
 * @param {number} [options.atmosphericFactor]
 * @param {number} [options.atmosphericPressureBar]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateLuminosityModifier({
  varianceFactors,
  atmosphericFactor,
  atmosphericPressureBar,
  precision,
} = {}) {
  const variance = Number(varianceFactors);
  if (!Number.isFinite(variance)) return null;

  const factor = Number.isFinite(atmosphericFactor)
    ? Number(atmosphericFactor)
    : calculateAtmosphericFactor({ atmosphericPressureBar });
  if (!Number.isFinite(factor) || factor <= 0) return null;

  const modifier = Math.max(0, Math.min(1, variance / factor));
  return roundToPrecision(modifier, precision);
}

/**
 * Step 7: High and low luminosity values.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.luminosityModifier
 * @param {number} [options.precision]
 * @returns {{ highLuminosity: number, lowLuminosity: number }|null}
 */
export function calculateHighLowLuminosity({ luminosity, luminosityModifier, precision } = {}) {
  const lum = Number(luminosity);
  const modifier = Number(luminosityModifier);
  if (!Number.isFinite(lum) || !Number.isFinite(modifier) || lum < 0) return null;

  const normalizedModifier = Math.max(0, Math.min(1, modifier));
  return {
    highLuminosity: roundToPrecision(lum * (1 + normalizedModifier), precision),
    lowLuminosity: roundToPrecision(lum * (1 - normalizedModifier), precision),
  };
}

/**
 * Step 8: Near and far AU values from eccentricity.
 *
 * @param {object} [options]
 * @param {number} options.distanceAu
 * @param {number} [options.eccentricity=0]
 * @param {number} [options.precision]
 * @returns {{ nearAu: number, farAu: number, eccentricity: number }|null}
 */
export function calculateNearFarAu({ distanceAu, eccentricity = 0, precision } = {}) {
  const au = Number(distanceAu);
  const ecc = Number(eccentricity);
  if (!Number.isFinite(au) || au <= 0 || !Number.isFinite(ecc) || ecc < 0 || ecc >= 1) return null;

  return {
    nearAu: roundToPrecision(au * (1 - ecc), precision),
    farAu: roundToPrecision(au * (1 + ecc), precision),
    eccentricity: roundToPrecision(ecc, precision),
  };
}

/**
 * Step 9: High and low temperatures in K/C/F.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.luminosityModifier
 * @param {number} options.distanceAu
 * @param {number} [options.eccentricity=0]
 * @param {number} options.albedo
 * @param {number} options.greenhouseFactor
 * @param {number} [options.precision]
 * @returns {{
 *   high: { kelvin: number, celsius: number, fahrenheit: number },
 *   low: { kelvin: number, celsius: number, fahrenheit: number },
 *   highLuminosity: number,
 *   lowLuminosity: number,
 *   nearAu: number,
 *   farAu: number,
 * }|null}
 */
export function calculateHighLowTemperatureProfile({
  luminosity,
  luminosityModifier,
  distanceAu,
  eccentricity = 0,
  albedo,
  greenhouseFactor,
  precision,
} = {}) {
  const luminosities = calculateHighLowLuminosity({ luminosity, luminosityModifier });
  const nearFar = calculateNearFarAu({ distanceAu, eccentricity });
  if (!luminosities || !nearFar) return null;

  const high = calculateMeanTemperature({
    luminosity: luminosities.highLuminosity,
    distanceAu: nearFar.nearAu,
    albedo,
    greenhouseFactor,
    precision,
  });
  const low = calculateMeanTemperature({
    luminosity: luminosities.lowLuminosity,
    distanceAu: nearFar.farAu,
    albedo,
    greenhouseFactor,
    precision,
  });
  if (!high || !low) return null;

  return {
    high,
    low,
    highLuminosity: roundToPrecision(luminosities.highLuminosity, precision),
    lowLuminosity: roundToPrecision(luminosities.lowLuminosity, precision),
    nearAu: roundToPrecision(nearFar.nearAu, precision),
    farAu: roundToPrecision(nearFar.farAu, precision),
  };
}

/**
 * Compute full high/low temperature workflow (Steps 1-9).
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} [options.yearLengthStandardYears]
 * @param {number} options.solarDayHours
 * @param {boolean} [options.isOneToOneSunLock=false]
 * @param {string|number} options.hydrographicsCode
 * @param {string|number} [options.surfaceDistributionCode]
 * @param {number} options.atmosphericPressureBar
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} [options.eccentricity=0]
 * @param {number} options.albedo
 * @param {number} options.greenhouseFactor
 * @param {number} [options.precision]
 * @returns {{
 *   axialTilt: ReturnType<typeof calculateAxialTiltFactor>|null,
 *   rotation: ReturnType<typeof calculateRotationFactor>|null,
 *   geography: ReturnType<typeof calculateGeographicFactor>|null,
 *   variance: ReturnType<typeof calculateVarianceFactors>,
 *   atmosphericFactor: number|null,
 *   luminosityModifier: number|null,
 *   temperatureProfile: ReturnType<typeof calculateHighLowTemperatureProfile>|null,
 * }|null}
 */
export function calculateWorldHighLowTemperatureProfile({
  axialTiltDegrees,
  yearLengthStandardYears,
  solarDayHours,
  isOneToOneSunLock = false,
  hydrographicsCode,
  surfaceDistributionCode,
  atmosphericPressureBar,
  luminosity,
  distanceAu,
  eccentricity = 0,
  albedo,
  greenhouseFactor,
  precision,
} = {}) {
  const axialTilt = calculateAxialTiltFactor({ axialTiltDegrees, yearLengthStandardYears, precision });
  const rotation = calculateRotationFactor({ solarDayHours, isOneToOneSunLock, precision });
  const geography = calculateGeographicFactor({ hydrographicsCode, surfaceDistributionCode, precision });

  const variance = calculateVarianceFactors({
    axialTiltFactor: axialTilt?.factor,
    rotationFactor: rotation?.factor,
    geographicFactor: geography?.factor,
    precision,
  });
  const atmosphericFactor = calculateAtmosphericFactor({ atmosphericPressureBar, precision });
  const luminosityModifier = calculateLuminosityModifier({
    varianceFactors: variance.value,
    atmosphericFactor,
    precision,
  });

  const temperatureProfile = Number.isFinite(luminosityModifier)
    ? calculateHighLowTemperatureProfile({
        luminosity,
        luminosityModifier,
        distanceAu,
        eccentricity,
        albedo,
        greenhouseFactor,
        precision,
      })
    : null;

  return {
    axialTilt,
    rotation,
    geography,
    variance,
    atmosphericFactor,
    luminosityModifier,
    temperatureProfile,
  };
}

/**
 * Build a scenario luminosity modifier from adjusted component factors.
 *
 * This helper is intended for latitude/season/day scenario work where
 * axial-tilt, rotation, and/or geography contributions are varied.
 *
 * @param {object} [options]
 * @param {number} [options.axialTiltFactor=0]
 * @param {number} [options.rotationFactor=0]
 * @param {number} [options.geographicFactor=0]
 * @param {number} options.atmosphericPressureBar
 * @param {number} [options.precision]
 * @returns {{
 *   variance: ReturnType<typeof calculateVarianceFactors>,
 *   atmosphericFactor: number|null,
 *   luminosityModifier: number|null,
 * }|null}
 */
export function calculateScenarioLuminosityModifier({
  axialTiltFactor = 0,
  rotationFactor = 0,
  geographicFactor = 0,
  atmosphericPressureBar,
  precision,
} = {}) {
  const variance = calculateVarianceFactors({
    axialTiltFactor,
    rotationFactor,
    geographicFactor,
    precision,
  });
  const atmosphericFactor = calculateAtmosphericFactor({ atmosphericPressureBar, precision });
  if (!Number.isFinite(atmosphericFactor)) return null;

  const luminosityModifier = calculateLuminosityModifier({
    varianceFactors: variance.value,
    atmosphericFactor,
    precision,
  });

  return {
    variance,
    atmosphericFactor,
    luminosityModifier,
  };
}

/**
 * Approximate greenhouse factor at altitude from local pressure change.
 *
 * Greenhouse scaling approximation:
 *   greenhouse(alt) = greenhouse(mean) * (pressure(alt)/pressure(mean))^pressureExponent
 *
 * Default exponent is 0.5, aligned with the initial greenhouse pressure relation.
 *
 * @param {object} [options]
 * @param {number} options.greenhouseFactor
 * @param {number} options.meanPressureBar
 * @param {number} options.altitudeKm
 * @param {number} [options.scaleHeightKm]
 * @param {number} [options.gravityG]
 * @param {number} [options.meanTemperatureK]
 * @param {boolean} [options.useTemperatureAdjustedScaleHeight=true]
 * @param {number} [options.pressureExponent=0.5]
 * @param {number} [options.precision]
 * @returns {{
 *   adjustedGreenhouseFactor: number,
 *   pressureAtAltitudeBar: number,
 *   pressureRatio: number,
 *   scaleHeightKm: number,
 *   pressureExponent: number,
 * }|null}
 */
export function calculateAltitudeAdjustedGreenhouseFactor({
  greenhouseFactor,
  meanPressureBar,
  altitudeKm,
  scaleHeightKm,
  gravityG,
  meanTemperatureK,
  useTemperatureAdjustedScaleHeight = true,
  pressureExponent = 0.5,
  precision,
} = {}) {
  const greenhouse = Number(greenhouseFactor);
  const meanPressure = Number(meanPressureBar);
  const altitude = Number(altitudeKm);
  if (!Number.isFinite(greenhouse) || greenhouse < 0) return null;
  if (!Number.isFinite(meanPressure) || meanPressure <= 0) return null;
  if (!Number.isFinite(altitude)) return null;

  const resolvedScaleHeight =
    Number.isFinite(scaleHeightKm) && Number(scaleHeightKm) > 0
      ? Number(scaleHeightKm)
      : calculateAtmosphereScaleHeightKm({
          gravityG,
          meanTemperatureK,
          useTemperatureAdjustment: useTemperatureAdjustedScaleHeight,
        });

  if (!Number.isFinite(resolvedScaleHeight) || resolvedScaleHeight <= 0) return null;

  const pressureAtAltitudeBar = calculateAtmosphericPressureAtAltitudeBar({
    meanPressureBar: meanPressure,
    altitudeKm: altitude,
    scaleHeightKm: resolvedScaleHeight,
  });
  if (!Number.isFinite(pressureAtAltitudeBar) || pressureAtAltitudeBar < 0) return null;

  const normalizedExponent =
    Number.isFinite(pressureExponent) && Number(pressureExponent) > 0 ? Number(pressureExponent) : 0.5;
  const pressureRatio = pressureAtAltitudeBar / meanPressure;
  const adjustedGreenhouseFactor = greenhouse * Math.pow(Math.max(0, pressureRatio), normalizedExponent);

  return {
    adjustedGreenhouseFactor: roundToPrecision(adjustedGreenhouseFactor, precision),
    pressureAtAltitudeBar: roundToPrecision(pressureAtAltitudeBar, precision),
    pressureRatio: roundToPrecision(pressureRatio, precision),
    scaleHeightKm: roundToPrecision(resolvedScaleHeight, precision),
    pressureExponent: roundToPrecision(normalizedExponent, precision),
  };
}

/**
 * Compute optional additional temperature scenario outputs.
 *
 * Use cases:
 * - Latitude/season/day variants by overriding luminosity-modifier components.
 * - Altitude variants by adjusting greenhouse factor from local pressure.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} [options.eccentricity=0]
 * @param {number} [options.albedo=0.3]
 * @param {number} [options.greenhouseFactor=0]
 * @param {number} [options.luminosityModifier]
 * @param {number} [options.axialTiltFactor=0]
 * @param {number} [options.rotationFactor=0]
 * @param {number} [options.geographicFactor=0]
 * @param {number} [options.atmosphericPressureBar]
 * @param {number} [options.altitudeKm]
 * @param {number} [options.meanPressureBar]
 * @param {number} [options.scaleHeightKm]
 * @param {number} [options.gravityG]
 * @param {number} [options.meanTemperatureK]
 * @param {boolean} [options.useTemperatureAdjustedScaleHeight=true]
 * @param {number} [options.pressureExponent=0.5]
 * @param {number} [options.precision]
 * @returns {{
 *   luminosityModifier: number|null,
 *   scenarioLuminosity: ReturnType<typeof calculateScenarioLuminosityModifier>|null,
 *   altitudeAdjustment: ReturnType<typeof calculateAltitudeAdjustedGreenhouseFactor>|null,
 *   greenhouseFactor: number,
 *   meanTemperature: ReturnType<typeof calculateMeanTemperature>|null,
 *   highLowTemperature: ReturnType<typeof calculateHighLowTemperatureProfile>|null,
 * }|null}
 */
export function calculateAdditionalTemperatureScenario({
  luminosity,
  distanceAu,
  eccentricity = 0,
  albedo = 0.3,
  greenhouseFactor = 0,
  luminosityModifier,
  axialTiltFactor = 0,
  rotationFactor = 0,
  geographicFactor = 0,
  atmosphericPressureBar,
  altitudeKm,
  meanPressureBar,
  scaleHeightKm,
  gravityG,
  meanTemperatureK,
  useTemperatureAdjustedScaleHeight = true,
  pressureExponent = 0.5,
  precision,
} = {}) {
  const scenarioLuminosity = Number.isFinite(atmosphericPressureBar)
    ? calculateScenarioLuminosityModifier({
        axialTiltFactor,
        rotationFactor,
        geographicFactor,
        atmosphericPressureBar,
        precision,
      })
    : null;

  const effectiveLuminosityModifier = Number.isFinite(luminosityModifier)
    ? Number(luminosityModifier)
    : (scenarioLuminosity?.luminosityModifier ?? null);

  let effectiveGreenhouseFactor = Number.isFinite(greenhouseFactor) ? Number(greenhouseFactor) : 0;
  let altitudeAdjustment = null;

  if (Number.isFinite(altitudeKm)) {
    const baselinePressure = Number.isFinite(meanPressureBar)
      ? Number(meanPressureBar)
      : Number(atmosphericPressureBar);
    altitudeAdjustment = calculateAltitudeAdjustedGreenhouseFactor({
      greenhouseFactor: effectiveGreenhouseFactor,
      meanPressureBar: baselinePressure,
      altitudeKm,
      scaleHeightKm,
      gravityG,
      meanTemperatureK,
      useTemperatureAdjustedScaleHeight,
      pressureExponent,
      precision,
    });
    if (!altitudeAdjustment) return null;
    effectiveGreenhouseFactor = Number(altitudeAdjustment.adjustedGreenhouseFactor);
  }

  const meanTemperature = calculateMeanTemperature({
    luminosity,
    distanceAu,
    albedo,
    greenhouseFactor: effectiveGreenhouseFactor,
    precision,
  });

  const highLowTemperature = Number.isFinite(effectiveLuminosityModifier)
    ? calculateHighLowTemperatureProfile({
        luminosity,
        luminosityModifier: effectiveLuminosityModifier,
        distanceAu,
        eccentricity,
        albedo,
        greenhouseFactor: effectiveGreenhouseFactor,
        precision,
      })
    : null;

  return {
    luminosityModifier: Number.isFinite(effectiveLuminosityModifier)
      ? roundToPrecision(effectiveLuminosityModifier, precision)
      : null,
    scenarioLuminosity,
    altitudeAdjustment,
    greenhouseFactor: roundToPrecision(effectiveGreenhouseFactor, precision),
    meanTemperature,
    highLowTemperature,
  };
}

function normalizeLatitudeDegrees(latitudeDegrees) {
  const latitude = Number(latitudeDegrees);
  if (!Number.isFinite(latitude)) return null;
  return Math.max(0, Math.min(90, Math.abs(latitude)));
}

/**
 * Resolve latitude seasonal zone and latitude adjustment for annual mean temperature.
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} options.latitudeDegrees
 * @param {number} [options.precision]
 * @returns {{
 *   axialTiltDegrees: number,
 *   latitudeDegrees: number,
 *   arcticBoundaryLatitude: number,
 *   tropicalBoundaryLatitude: number,
 *   hasMiddleZone: boolean,
 *   zone: string,
 *   zoneLatitudeAdjustment: number,
 *   formula: string,
 * }|null}
 */
export function calculateLatitudeZoneAdjustment({ axialTiltDegrees, latitudeDegrees, precision } = {}) {
  const tilt = normalizeAxialTiltForTemperatureVariation(axialTiltDegrees);
  const latitude = normalizeLatitudeDegrees(latitudeDegrees);
  if (!Number.isFinite(tilt) || !Number.isFinite(latitude)) return null;

  const hasMiddleZone = tilt < 45;
  const arcticBoundaryLatitude = Math.max(0, 90 - tilt);
  const tropicalBoundaryLatitude = tilt;

  let zone = "middle";
  let adjustment = 0;
  let formula = "middle_arctic_case_2";

  if (hasMiddleZone) {
    if (latitude <= tropicalBoundaryLatitude) {
      zone = "tropical";
      adjustment = Math.sin(((45 - tilt) * Math.PI) / 180);
      formula = "tropical_case_1";
    } else {
      zone = latitude >= arcticBoundaryLatitude ? "arctic" : "middle";
      adjustment = Math.sin(((45 - latitude) * Math.PI) / 180);
      formula = "middle_arctic_case_2";
    }
  } else {
    if (latitude <= arcticBoundaryLatitude) {
      zone = "arctic";
      adjustment = Math.sin(((45 - latitude) * Math.PI) / 180);
      formula = "part_b_arctic_case_2";
    } else {
      zone = "tropical_overlap";
      adjustment = Math.sin(((45 - arcticBoundaryLatitude) * Math.PI) / 180);
      formula = "part_b_tropical_edge_constant";
    }
  }

  return {
    axialTiltDegrees: roundToPrecision(tilt, precision),
    latitudeDegrees: roundToPrecision(latitude, precision),
    arcticBoundaryLatitude: roundToPrecision(arcticBoundaryLatitude, precision),
    tropicalBoundaryLatitude: roundToPrecision(tropicalBoundaryLatitude, precision),
    hasMiddleZone,
    zone,
    zoneLatitudeAdjustment: roundToPrecision(adjustment, precision),
    formula,
  };
}

/**
 * Calculate latitude-specific luminosity modifier and luminosity.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.zoneLatitudeAdjustment
 * @param {number} [options.atmosphericFactor]
 * @param {number} [options.atmosphericPressureBar]
 * @param {number} [options.precision]
 * @returns {{ latitudeLuminosityModifier: number, latitudeLuminosity: number }|null}
 */
export function calculateLatitudeLuminosity({
  luminosity,
  zoneLatitudeAdjustment,
  atmosphericFactor,
  atmosphericPressureBar,
  precision,
} = {}) {
  const lum = Number(luminosity);
  const adjustment = Number(zoneLatitudeAdjustment);
  if (!Number.isFinite(lum) || lum < 0 || !Number.isFinite(adjustment)) return null;

  const factor = Number.isFinite(atmosphericFactor)
    ? Number(atmosphericFactor)
    : calculateAtmosphericFactor({ atmosphericPressureBar });
  if (!Number.isFinite(factor) || factor <= 0) return null;

  const latitudeLuminosityModifier = adjustment / factor;
  const latitudeLuminosity = Math.max(0, lum * (1 + latitudeLuminosityModifier));

  return {
    latitudeLuminosityModifier: roundToPrecision(latitudeLuminosityModifier, precision),
    latitudeLuminosity: roundToPrecision(latitudeLuminosity, precision),
  };
}

/**
 * Compute mean annual temperature for a specific latitude.
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} options.albedo
 * @param {number} options.greenhouseFactor
 * @param {number} options.axialTiltDegrees
 * @param {number} options.latitudeDegrees
 * @param {number} [options.atmosphericFactor]
 * @param {number} [options.atmosphericPressureBar]
 * @param {number} [options.precision]
 * @returns {{
 *   zone: ReturnType<typeof calculateLatitudeZoneAdjustment>|null,
 *   luminosity: ReturnType<typeof calculateLatitudeLuminosity>|null,
 *   temperature: ReturnType<typeof calculateMeanTemperature>|null,
 * }|null}
 */
export function calculateLatitudeTemperatureScenario({
  luminosity,
  distanceAu,
  albedo,
  greenhouseFactor,
  axialTiltDegrees,
  latitudeDegrees,
  atmosphericFactor,
  atmosphericPressureBar,
  precision,
} = {}) {
  const zone = calculateLatitudeZoneAdjustment({ axialTiltDegrees, latitudeDegrees, precision });
  if (!zone) return null;

  const luminosityResult = calculateLatitudeLuminosity({
    luminosity,
    zoneLatitudeAdjustment: zone.zoneLatitudeAdjustment,
    atmosphericFactor,
    atmosphericPressureBar,
    precision,
  });
  if (!luminosityResult) return null;

  const temperature = calculateMeanTemperature({
    luminosity: luminosityResult.latitudeLuminosity,
    distanceAu,
    albedo,
    greenhouseFactor,
    precision,
  });

  return {
    zone,
    luminosity: luminosityResult,
    temperature,
  };
}

function degreesToRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

function radiansToDegrees(radians) {
  return (Number(radians) * 180) / Math.PI;
}

/**
 * Step 1: solar declination in degrees.
 *
 * Formula:
 *   axialTilt * cos((360 * dateSolarDays) / solarDaysPerYear)
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} options.dateSolarDays
 * @param {number} options.solarDaysPerYear
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateSolarDeclinationDegrees({
  axialTiltDegrees,
  dateSolarDays,
  solarDaysPerYear,
  precision,
} = {}) {
  const tilt = Number(axialTiltDegrees);
  const date = Number(dateSolarDays);
  const yearDays = Number(solarDaysPerYear);
  if (!Number.isFinite(tilt) || !Number.isFinite(date) || !Number.isFinite(yearDays) || yearDays <= 0) {
    return null;
  }

  const seasonalAngleDegrees = (360 * date) / yearDays;
  const declination = tilt * Math.cos(degreesToRadians(seasonalAngleDegrees));
  return roundToPrecision(declination, precision);
}

/**
 * Step 2: cosine sunrise term.
 *
 * Formula:
 *   tan(latitude) * tan(solarDeclination)
 *
 * @param {object} [options]
 * @param {number} options.latitudeDegrees
 * @param {number} options.solarDeclinationDegrees
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateSunriseCosine({ latitudeDegrees, solarDeclinationDegrees, precision } = {}) {
  const latitude = Number(latitudeDegrees);
  const declination = Number(solarDeclinationDegrees);
  if (!Number.isFinite(latitude) || !Number.isFinite(declination)) return null;

  const sunriseCosine = Math.tan(degreesToRadians(latitude)) * Math.tan(degreesToRadians(declination));
  return roundToPrecision(sunriseCosine, precision);
}

/**
 * Step 2-3: sunlight portion and sunlight hours from sunrise equation outcomes.
 *
 * Daylight states:
 * - no_sunrise: sunriseCosine > 1 (0 sunlight)
 * - constant_daylight: sunriseCosine < -1 (all sunlight)
 * - normal: sunriseCosine between -1 and 1
 *
 * @param {object} [options]
 * @param {number} options.sunriseCosine
 * @param {number} options.solarDayHours
 * @param {number} [options.precision]
 * @returns {{ sunriseAngleDegrees: number, sunlightPortion: number, sunlightHours: number, daylightState: string }|null}
 */
export function calculateSunlightPortionFromSunriseCosine({ sunriseCosine, solarDayHours, precision } = {}) {
  const cosine = Number(sunriseCosine);
  const solarDay = Number(solarDayHours);
  if (!Number.isFinite(cosine) || !Number.isFinite(solarDay) || solarDay <= 0) return null;

  if (cosine > 1) {
    return {
      sunriseAngleDegrees: 0,
      sunlightPortion: 0,
      sunlightHours: 0,
      daylightState: "no_sunrise",
    };
  }

  if (cosine < -1) {
    return {
      sunriseAngleDegrees: 180,
      sunlightPortion: 1,
      sunlightHours: roundToPrecision(solarDay, precision),
      daylightState: "constant_daylight",
    };
  }

  const clampedCosine = Math.max(-1, Math.min(1, cosine));
  const sunriseAngleDegrees = radiansToDegrees(Math.acos(clampedCosine));
  const sunlightPortion = sunriseAngleDegrees / 180;
  const sunlightHours = solarDay * sunlightPortion;

  return {
    sunriseAngleDegrees: roundToPrecision(sunriseAngleDegrees, precision),
    sunlightPortion: roundToPrecision(sunlightPortion, precision),
    sunlightHours: roundToPrecision(sunlightHours, precision),
    daylightState: "normal",
  };
}

/**
 * Full sunlight calculation from tilt/latitude/date.
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} options.latitudeDegrees
 * @param {number} options.dateSolarDays
 * @param {number} options.solarDaysPerYear
 * @param {number} options.solarDayHours
 * @param {number} [options.precision]
 * @returns {{
 *   solarDeclinationDegrees: number,
 *   sunriseCosine: number,
 *   sunriseAngleDegrees: number,
 *   sunlightPortion: number,
 *   sunlightHours: number,
 *   daylightState: string,
 * }|null}
 */
export function calculateSunlightPortionAndHours({
  axialTiltDegrees,
  latitudeDegrees,
  dateSolarDays,
  solarDaysPerYear,
  solarDayHours,
  precision,
} = {}) {
  const solarDeclinationDegrees = calculateSolarDeclinationDegrees({
    axialTiltDegrees,
    dateSolarDays,
    solarDaysPerYear,
  });
  if (!Number.isFinite(solarDeclinationDegrees)) return null;

  const sunriseCosine = calculateSunriseCosine({ latitudeDegrees, solarDeclinationDegrees });
  if (!Number.isFinite(sunriseCosine)) return null;

  const sunlight = calculateSunlightPortionFromSunriseCosine({ sunriseCosine, solarDayHours, precision });
  if (!sunlight) return null;

  return {
    solarDeclinationDegrees: roundToPrecision(solarDeclinationDegrees, precision),
    sunriseCosine: roundToPrecision(sunriseCosine, precision),
    sunriseAngleDegrees: sunlight.sunriseAngleDegrees,
    sunlightPortion: sunlight.sunlightPortion,
    sunlightHours: sunlight.sunlightHours,
    daylightState: sunlight.daylightState,
  };
}

/**
 * Method 1 (even day/night): adjusted fractional day.
 *
 * @param {object} [options]
 * @param {number} options.hoursSinceDawn
 * @param {number} options.solarDayHours
 * @param {number} [options.lagFraction=0.15]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAdjustedFractionalDayEven({
  hoursSinceDawn,
  solarDayHours,
  lagFraction = 0.15,
  precision,
} = {}) {
  const hours = Number(hoursSinceDawn);
  const solarDay = Number(solarDayHours);
  const lag = Number(lagFraction);
  if (!Number.isFinite(hours) || !Number.isFinite(solarDay) || solarDay <= 0 || !Number.isFinite(lag)) return null;

  return roundToPrecision(hours / solarDay + lag, precision);
}

/**
 * Method 2 (uneven day/night): adjusted fractional day.
 *
 * @param {object} [options]
 * @param {number} options.hoursSinceDawn
 * @param {number} options.solarDayHours
 * @param {number} options.sunlightPortion
 * @param {boolean} [options.isDaytime=true]
 * @param {number} [options.lagFraction=0.15]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAdjustedFractionalDayUneven({
  hoursSinceDawn,
  solarDayHours,
  sunlightPortion,
  isDaytime = true,
  lagFraction = 0.15,
  precision,
} = {}) {
  const hours = Number(hoursSinceDawn);
  const solarDay = Number(solarDayHours);
  const daylight = Number(sunlightPortion);
  const lag = Number(lagFraction);
  if (!Number.isFinite(hours) || !Number.isFinite(solarDay) || solarDay <= 0 || !Number.isFinite(daylight)) return null;
  if (daylight <= 0 || daylight >= 1 || !Number.isFinite(lag)) return null;

  const denominator = isDaytime ? solarDay * daylight * 2 : solarDay * (1 - daylight) * 2;
  if (!Number.isFinite(denominator) || denominator <= 0) return null;

  return roundToPrecision(hours / denominator + lag, precision);
}

/**
 * Hourly rotation factor from adjusted fractional day.
 *
 * @param {object} [options]
 * @param {number} options.adjustedFractionalDay
 * @param {number} options.rotationFactor
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateHourlyRotationFactor({ adjustedFractionalDay, rotationFactor, precision } = {}) {
  const fraction = Number(adjustedFractionalDay);
  const rotation = Number(rotationFactor);
  if (!Number.isFinite(fraction) || !Number.isFinite(rotation)) return null;

  const hourlyRotation = Math.sin(((fraction % 1) * 360 * Math.PI) / 180) * rotation;
  return roundToPrecision(hourlyRotation, precision);
}

/**
 * Compute time-of-day scenario hourly rotation factor.
 *
 * @param {object} [options]
 * @param {number} options.rotationFactor
 * @param {number} options.hoursSinceDawn
 * @param {number} options.solarDayHours
 * @param {"even"|"uneven"} [options.method="even"]
 * @param {number} [options.sunlightPortion]
 * @param {number} [options.axialTiltDegrees]
 * @param {number} [options.latitudeDegrees]
 * @param {number} [options.dateSolarDays]
 * @param {number} [options.solarDaysPerYear]
 * @param {boolean} [options.isDaytime=true]
 * @param {number} [options.lagFraction=0.15]
 * @param {number} [options.precision]
 * @returns {{
 *   adjustedFractionalDay: number,
 *   hourlyRotationFactor: number,
 *   sunlightPortion: number|null,
 *   sunlightModel: ReturnType<typeof calculateSunlightPortionAndHours>|null,
 * }|null}
 */
export function calculateTimeOfDayRotationFactor({
  rotationFactor,
  hoursSinceDawn,
  solarDayHours,
  method = "even",
  sunlightPortion,
  axialTiltDegrees,
  latitudeDegrees,
  dateSolarDays,
  solarDaysPerYear,
  isDaytime = true,
  lagFraction = 0.15,
  precision,
} = {}) {
  let effectiveSunlightPortion = Number(sunlightPortion);
  let sunlightModel = null;

  if (
    method === "uneven" &&
    (!Number.isFinite(effectiveSunlightPortion) || effectiveSunlightPortion <= 0 || effectiveSunlightPortion >= 1) &&
    Number.isFinite(axialTiltDegrees) &&
    Number.isFinite(latitudeDegrees) &&
    Number.isFinite(dateSolarDays) &&
    Number.isFinite(solarDaysPerYear)
  ) {
    sunlightModel = calculateSunlightPortionAndHours({
      axialTiltDegrees,
      latitudeDegrees,
      dateSolarDays,
      solarDaysPerYear,
      solarDayHours,
      precision,
    });
    effectiveSunlightPortion = Number(sunlightModel?.sunlightPortion);
  }

  const adjustedFractionalDay =
    method === "uneven"
      ? calculateAdjustedFractionalDayUneven({
          hoursSinceDawn,
          solarDayHours,
          sunlightPortion: effectiveSunlightPortion,
          isDaytime,
          lagFraction,
        })
      : calculateAdjustedFractionalDayEven({
          hoursSinceDawn,
          solarDayHours,
          lagFraction,
        });

  if (!Number.isFinite(adjustedFractionalDay)) return null;

  const hourlyRotationFactor = calculateHourlyRotationFactor({
    adjustedFractionalDay,
    rotationFactor,
    precision,
  });
  if (!Number.isFinite(hourlyRotationFactor)) return null;

  return {
    adjustedFractionalDay: roundToPrecision(adjustedFractionalDay, precision),
    hourlyRotationFactor,
    sunlightPortion:
      method === "uneven" && Number.isFinite(effectiveSunlightPortion)
        ? roundToPrecision(effectiveSunlightPortion, precision)
        : null,
    sunlightModel,
  };
}

/**
 * Terrain horizon distance proxy.
 *
 * @param {object} [options]
 * @param {number} options.heightKm
 * @param {number} options.worldDiameterKm
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateHorizonDistanceKm({ heightKm, worldDiameterKm, precision } = {}) {
  const height = Number(heightKm);
  const diameter = Number(worldDiameterKm);
  if (!Number.isFinite(height) || height < 0 || !Number.isFinite(diameter) || diameter <= 0) return null;

  return roundToPrecision(Math.sqrt(height * diameter), precision);
}

/**
 * Convert horizon distance from km to degrees on world circumference.
 *
 * @param {object} [options]
 * @param {number} options.distanceKm
 * @param {number} options.worldDiameterKm
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateHorizonDistanceDegrees({ distanceKm, worldDiameterKm, precision } = {}) {
  const distance = Number(distanceKm);
  const diameter = Number(worldDiameterKm);
  if (!Number.isFinite(distance) || distance < 0 || !Number.isFinite(diameter) || diameter <= 0) return null;

  return roundToPrecision((360 * distance) / (Math.PI * diameter), precision);
}

/**
 * Estimate longitudinal libration span from eccentricity.
 *
 * @param {object} [options]
 * @param {number} options.eccentricity
 * @param {number} [options.multiplier=145]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateEccentricityLongitudinalLibrationDegrees({ eccentricity, multiplier = 145, precision } = {}) {
  const ecc = Number(eccentricity);
  const factor = Number(multiplier);
  if (!Number.isFinite(ecc) || ecc < 0 || !Number.isFinite(factor) || factor <= 0) return null;

  return roundToPrecision(ecc * factor, precision);
}

/**
 * Estimate latitudinal libration from axial tilt and latitude.
 *
 * @param {object} [options]
 * @param {number} options.axialTiltDegrees
 * @param {number} options.latitudeDegrees
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateLatitudinalLibrationDegrees({ axialTiltDegrees, latitudeDegrees, precision } = {}) {
  const tilt = normalizeAxialTiltForTemperatureVariation(axialTiltDegrees);
  const latitude = normalizeLatitudeDegrees(latitudeDegrees);
  if (!Number.isFinite(tilt) || !Number.isFinite(latitude)) return null;

  return roundToPrecision(tilt * Math.sin((latitude * Math.PI) / 180), precision);
}

/**
 * Solar disk visibility band around the terminator.
 *
 * @param {object} [options]
 * @param {number} options.angularSizeDegrees
 * @param {number} [options.precision]
 * @returns {{ fullBandDegrees: number, halfBandDegrees: number }|null}
 */
export function calculateSolarDiskVisibilityBandDegrees({ angularSizeDegrees, precision } = {}) {
  const angularSize = Number(angularSizeDegrees);
  if (!Number.isFinite(angularSize) || angularSize < 0) return null;

  return {
    fullBandDegrees: roundToPrecision(angularSize, precision),
    halfBandDegrees: roundToPrecision(angularSize / 2, precision),
  };
}

/**
 * Atmospheric refraction angular effect.
 *
 * @param {object} [options]
 * @param {number} options.atmosphericPressureBar
 * @param {number} options.temperatureK
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAtmosphericRefractionDegrees({ atmosphericPressureBar, temperatureK, precision } = {}) {
  const pressure = Number(atmosphericPressureBar);
  const temperature = Number(temperatureK);
  if (!Number.isFinite(pressure) || pressure < 0 || !Number.isFinite(temperature) || temperature <= 0) return null;

  return roundToPrecision(0.5 * ((pressure * 300) / temperature), precision);
}

/**
 * Twilight zone extent from scale height and world size.
 *
 * @param {object} [options]
 * @param {number} options.scaleHeightKm
 * @param {number} options.worldSize
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateTwilightZoneExtentDegrees({ scaleHeightKm, worldSize, precision } = {}) {
  const scaleHeight = Number(scaleHeightKm);
  const size = Number(worldSize);
  if (!Number.isFinite(scaleHeight) || scaleHeight < 0 || !Number.isFinite(size) || size < 0) return null;

  return roundToPrecision((scaleHeight / 8.5) * 6 * (size / 8), precision);
}

/**
 * Simplified tidally-locked world rotation factor by longitude from terminator.
 *
 * Conventions:
 * - Positive longitude: bright side
 * - Negative longitude: dark side
 *
 * @param {object} [options]
 * @param {number} options.longitudeFromTerminatorDeg
 * @param {number} [options.visibleBandHalfDeg=0]
 * @param {number} [options.twilightZoneExtentDeg=6]
 * @param {number} [options.brightRampDeg=15]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateTwilightLockedRotationFactor({
  longitudeFromTerminatorDeg,
  visibleBandHalfDeg = 0,
  twilightZoneExtentDeg = 6,
  brightRampDeg = 15,
  precision,
} = {}) {
  const longitude = Number(longitudeFromTerminatorDeg);
  const visibleBand = Math.max(0, Number(visibleBandHalfDeg));
  const zoneExtent = Math.max(0, Number(twilightZoneExtentDeg));
  const brightRamp = Math.max(0.001, Number(brightRampDeg));
  if (!Number.isFinite(longitude) || !Number.isFinite(visibleBand) || !Number.isFinite(zoneExtent)) return null;

  let factor;
  if (longitude >= 0) {
    factor = Math.min(1, longitude / brightRamp);
  } else {
    const darkDistance = Math.abs(longitude);
    if (darkDistance <= visibleBand) {
      factor = 0;
    } else {
      const beyondVisible = darkDistance - visibleBand;
      if (beyondVisible <= zoneExtent) {
        factor = -0.3 * (beyondVisible / Math.max(zoneExtent, 0.001));
      } else if (beyondVisible <= zoneExtent * 2) {
        factor = -0.3 - 0.3 * ((beyondVisible - zoneExtent) / Math.max(zoneExtent, 0.001));
      } else if (beyondVisible <= zoneExtent * 3) {
        factor = -0.6 - 0.4 * ((beyondVisible - zoneExtent * 2) / Math.max(zoneExtent, 0.001));
      } else {
        factor = -1;
      }
    }
  }

  return roundToPrecision(Math.max(-1, Math.min(1, factor)), precision);
}

/**
 * Altitude greenhouse factor from pressure(a) and original greenhouse modifier.
 *
 * @param {object} [options]
 * @param {number} options.meanPressureBar
 * @param {number} options.altitudeKm
 * @param {number} options.scaleHeightKm
 * @param {number} [options.originalGreenhouseModifier=0]
 * @param {"add"|"multiply"} [options.modifierMode="add"]
 * @param {number} [options.precision]
 * @returns {{
 *   pressureAtAltitudeBar: number,
 *   initialGreenhouseFactorAtAltitude: number,
 *   greenhouseFactorAtAltitude: number,
 *   modifierMode: string,
 * }|null}
 */
export function calculateAltitudeGreenhouseFactor({
  meanPressureBar,
  altitudeKm,
  scaleHeightKm,
  originalGreenhouseModifier = 0,
  modifierMode = "add",
  precision,
} = {}) {
  const pressureAtAltitudeBar = calculateAtmosphericPressureAtAltitudeBar({
    meanPressureBar,
    altitudeKm,
    scaleHeightKm,
  });
  if (!Number.isFinite(pressureAtAltitudeBar) || pressureAtAltitudeBar < 0) return null;

  const initial = calculateInitialGreenhouseFactor({ atmosphericPressureBar: pressureAtAltitudeBar });
  if (!Number.isFinite(initial)) return null;

  const modifier = Number.isFinite(originalGreenhouseModifier) ? Number(originalGreenhouseModifier) : 0;
  const greenhouseFactorAtAltitude = modifierMode === "multiply" ? initial * Math.max(0, modifier) : initial + modifier;

  return {
    pressureAtAltitudeBar: roundToPrecision(pressureAtAltitudeBar, precision),
    initialGreenhouseFactorAtAltitude: roundToPrecision(initial, precision),
    greenhouseFactorAtAltitude: roundToPrecision(greenhouseFactorAtAltitude, precision),
    modifierMode,
  };
}

/**
 * Temperature at altitude using luminosity(x) and greenhouse(a).
 *
 * @param {object} [options]
 * @param {number} options.luminosity
 * @param {number} options.distanceAu
 * @param {number} options.albedo
 * @param {number} options.greenhouseFactorAtAltitude
 * @param {number} [options.precision]
 * @returns {ReturnType<typeof calculateMeanTemperature>|null}
 */
export function calculateTemperatureAtAltitude({
  luminosity,
  distanceAu,
  albedo,
  greenhouseFactorAtAltitude,
  precision,
} = {}) {
  return calculateMeanTemperature({
    luminosity,
    distanceAu,
    albedo,
    greenhouseFactor: greenhouseFactorAtAltitude,
    precision,
  });
}

/**
 * Build nearest/mean/furthest AU distances from a star to a planet.
 *
 * @param {object} [options]
 * @param {number} options.planetAu
 * @param {number} [options.planetEccentricity=0]
 * @param {number} options.starAu
 * @param {number} [options.starEccentricity=0]
 * @param {boolean} [options.includeEccentricity=true]
 * @param {number} [options.precision]
 * @returns {{ nearestAu: number, meanAu: number, furthestAu: number, isInteriorStar: boolean }|null}
 */
export function calculateMultiStarContributionDistances({
  planetAu,
  planetEccentricity = 0,
  starAu,
  starEccentricity = 0,
  includeEccentricity = true,
  precision,
} = {}) {
  const pAu = Number(planetAu);
  const pE = Number(planetEccentricity);
  const sAu = Number(starAu);
  const sE = Number(starEccentricity);
  if (!Number.isFinite(pAu) || pAu < 0 || !Number.isFinite(sAu) || sAu < 0) return null;
  if (!Number.isFinite(pE) || pE < 0 || pE >= 1 || !Number.isFinite(sE) || sE < 0 || sE >= 1) return null;

  const isInteriorStar = sAu <= pAu;
  const meanAu = Math.sqrt(pAu ** 2 + sAu ** 2);

  let nearestAu;
  let furthestAu;

  if (includeEccentricity) {
    const planetNear = pAu * (1 - pE);
    const planetFar = pAu * (1 + pE);
    const starNear = sAu * (1 - sE);
    const starFar = sAu * (1 + sE);

    nearestAu = isInteriorStar ? Math.abs(planetNear - starFar) : Math.abs(planetFar - starNear);
    furthestAu = planetFar + starFar;
  } else {
    nearestAu = Math.abs(pAu - sAu);
    furthestAu = pAu + sAu;
  }

  return {
    nearestAu: roundToPrecision(nearestAu, precision),
    meanAu: roundToPrecision(meanAu, precision),
    furthestAu: roundToPrecision(furthestAu, precision),
    isInteriorStar,
  };
}

/**
 * Compute combined low/mean/high temperatures from multiple stars.
 *
 * @param {object} [options]
 * @param {number} options.planetAu
 * @param {number} [options.planetEccentricity=0]
 * @param {Array<{ name?: string, luminosity: number, au: number, eccentricity?: number }>} options.stars
 * @param {number} options.albedo
 * @param {number} options.greenhouseFactor
 * @param {boolean} [options.includeEccentricity=true]
 * @param {number} [options.precision]
 * @returns {{
 *   stars: Array<{ name: string, distances: ReturnType<typeof calculateMultiStarContributionDistances>, lowK: number|null, meanK: number|null, highK: number|null }>,
 *   total: { lowK: number|null, meanK: number|null, highK: number|null },
 * }|null}
 */
export function calculateMultiStarTemperatureScenario({
  planetAu,
  planetEccentricity = 0,
  stars = [],
  albedo,
  greenhouseFactor,
  includeEccentricity = true,
  precision,
} = {}) {
  if (!Array.isArray(stars) || stars.length === 0) return null;

  const starRows = [];
  const lows = [];
  const means = [];
  const highs = [];

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i] ?? {};
    const distances = calculateMultiStarContributionDistances({
      planetAu,
      planetEccentricity,
      starAu: star.au,
      starEccentricity: star.eccentricity ?? 0,
      includeEccentricity,
    });
    if (!distances) return null;

    const lum = Number(star.luminosity);
    if (!Number.isFinite(lum) || lum < 0) return null;

    const lowK = calculateMeanTemperatureKelvin({
      luminosity: lum,
      distanceAu: Math.max(0.000001, distances.furthestAu),
      albedo,
      greenhouseFactor,
    });
    const meanK = calculateMeanTemperatureKelvin({
      luminosity: lum,
      distanceAu: Math.max(0.000001, distances.meanAu),
      albedo,
      greenhouseFactor,
    });
    const highK = calculateMeanTemperatureKelvin({
      luminosity: lum,
      distanceAu: Math.max(0.000001, distances.nearestAu),
      albedo,
      greenhouseFactor,
    });

    if (Number.isFinite(lowK)) lows.push(lowK);
    if (Number.isFinite(meanK)) means.push(meanK);
    if (Number.isFinite(highK)) highs.push(highK);

    starRows.push({
      name: String(star.name ?? `star-${i + 1}`),
      distances,
      lowK: Number.isFinite(lowK) ? roundToPrecision(lowK, precision) : null,
      meanK: Number.isFinite(meanK) ? roundToPrecision(meanK, precision) : null,
      highK: Number.isFinite(highK) ? roundToPrecision(highK, precision) : null,
    });
  }

  return {
    stars: starRows,
    total: {
      lowK: calculateCombinedTemperatureKelvin({ temperaturesK: lows, precision }),
      meanK: calculateCombinedTemperatureKelvin({ temperaturesK: means, precision }),
      highK: calculateCombinedTemperatureKelvin({ temperaturesK: highs, precision }),
    },
  };
}

/**
 * Apply an inherent temperature effect via fourth-power temperature addition.
 *
 * @param {object} [options]
 * @param {number} options.baseTemperatureK
 * @param {number} options.addedTemperatureK
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function applyInherentTemperatureEffectKelvin({ baseTemperatureK, addedTemperatureK, precision } = {}) {
  return calculateCombinedTemperatureKelvin({ temperaturesK: [baseTemperatureK, addedTemperatureK], precision });
}

/**
 * Apply an inherent temperature effect to low/mean/high values.
 *
 * @param {object} [options]
 * @param {number} options.lowTemperatureK
 * @param {number} options.meanTemperatureK
 * @param {number} options.highTemperatureK
 * @param {number} options.addedTemperatureK
 * @param {number} [options.precision]
 * @returns {{ lowK: number|null, meanK: number|null, highK: number|null }|null}
 */
export function applyInherentTemperatureEffectProfile({
  lowTemperatureK,
  meanTemperatureK,
  highTemperatureK,
  addedTemperatureK,
  precision,
} = {}) {
  if (!Number.isFinite(addedTemperatureK) || Number(addedTemperatureK) < 0) return null;

  return {
    lowK: applyInherentTemperatureEffectKelvin({
      baseTemperatureK: lowTemperatureK,
      addedTemperatureK,
      precision,
    }),
    meanK: applyInherentTemperatureEffectKelvin({
      baseTemperatureK: meanTemperatureK,
      addedTemperatureK,
      precision,
    }),
    highK: applyInherentTemperatureEffectKelvin({
      baseTemperatureK: highTemperatureK,
      addedTemperatureK,
      precision,
    }),
  };
}

function buildTemperatureScalesFromKelvin(kelvin, precision) {
  const k = Number(kelvin);
  if (!Number.isFinite(k)) return null;

  return {
    kelvin: roundToPrecision(k, precision),
    celsius: roundToPrecision(k - 273, precision),
    fahrenheit: roundToPrecision(k * 1.8 - 459.67, precision),
  };
}

function combineOptionalKelvinTemperatures(baseKelvin, addedKelvin, precision) {
  const base = Number(baseKelvin);
  const added = Number(addedKelvin);
  const hasBase = Number.isFinite(base) && base >= 0;
  const hasAdded = Number.isFinite(added) && added >= 0;
  if (!hasBase && !hasAdded) return null;
  if (!hasBase) return roundToPrecision(added, precision);
  if (!hasAdded) return roundToPrecision(base, precision);

  return calculateCombinedTemperatureKelvin({ temperaturesK: [base, added], precision });
}

/**
 * Orchestrate latitude, time-of-day, twilight, multi-star, and inherent effects
 * into a normalized scenario profile.
 *
 * @param {object} [options]
 * @param {object} options.base
 * @param {number} options.base.luminosity
 * @param {number} options.base.distanceAu
 * @param {number} [options.base.eccentricity=0]
 * @param {number} [options.base.albedo=0.3]
 * @param {number} [options.base.greenhouseFactor=0]
 * @param {number} [options.base.luminosityModifier]
 * @param {number} [options.base.atmosphericPressureBar]
 * @param {number} [options.base.meanPressureBar]
 * @param {number} [options.base.altitudeKm]
 * @param {number} [options.base.scaleHeightKm]
 * @param {number} [options.base.gravityG]
 * @param {number} [options.base.meanTemperatureK]
 * @param {object|null} [options.latitude]
 * @param {number} options.latitude.axialTiltDegrees
 * @param {number} options.latitude.latitudeDegrees
 * @param {object|null} [options.timeOfDay]
 * @param {number} options.timeOfDay.rotationFactor
 * @param {number} options.timeOfDay.hoursSinceDawn
 * @param {number} options.timeOfDay.solarDayHours
 * @param {"even"|"uneven"} [options.timeOfDay.method="even"]
 * @param {number} [options.timeOfDay.sunlightPortion]
 * @param {boolean} [options.timeOfDay.isDaytime=true]
 * @param {number} [options.timeOfDay.lagFraction=0.15]
 * @param {object|null} [options.twilight]
 * @param {number} options.twilight.longitudeFromTerminatorDeg
 * @param {number} [options.twilight.eccentricity]
 * @param {number} [options.twilight.axialTiltDegrees]
 * @param {number} [options.twilight.latitudeDegrees]
 * @param {number} [options.twilight.angularSizeDegrees]
 * @param {number} [options.twilight.atmosphericPressureBar]
 * @param {number} [options.twilight.temperatureK]
 * @param {number} [options.twilight.scaleHeightKm]
 * @param {number} [options.twilight.gravityG]
 * @param {number} [options.twilight.worldSize]
 * @param {number} [options.twilight.visibleBandHalfDeg]
 * @param {number} [options.twilight.twilightZoneExtentDeg]
 * @param {number} [options.twilight.brightRampDeg=15]
 * @param {object|null} [options.multiStar]
 * @param {number} [options.multiStar.planetAu]
 * @param {number} [options.multiStar.planetEccentricity=0]
 * @param {Array<{ name?: string, luminosity: number, au: number, eccentricity?: number }>} [options.multiStar.stars=[]]
 * @param {boolean} [options.multiStar.includeEccentricity=true]
 * @param {object|null} [options.inherent]
 * @param {number} options.inherent.addedTemperatureK
 * @param {number} [options.precision]
 * @returns {{
 *   modifiers: {
 *     base: number|null,
 *     latitude: number|null,
 *     timeOfDay: number|null,
 *     twilight: number|null,
 *     combined: number|null,
 *   },
 *   components: {
 *     base: ReturnType<typeof calculateAdditionalTemperatureScenario>|null,
 *     combined: ReturnType<typeof calculateAdditionalTemperatureScenario>|null,
 *     latitude: ReturnType<typeof calculateLatitudeTemperatureScenario>|null,
 *     timeOfDay: ReturnType<typeof calculateTimeOfDayRotationFactor>|null,
 *     twilight: {
 *       longitudinalLibrationDegrees: number|null,
 *       latitudinalLibrationDegrees: number|null,
 *       solarDiskBand: ReturnType<typeof calculateSolarDiskVisibilityBandDegrees>|null,
 *       atmosphericRefractionDegrees: number|null,
 *       twilightZoneExtentDegrees: number|null,
 *       effectiveLongitudeFromTerminatorDeg: number|null,
 *       rotationFactor: number|null,
 *     }|null,
 *     multiStar: ReturnType<typeof calculateMultiStarTemperatureScenario>|null,
 *     inherent: ReturnType<typeof applyInherentTemperatureEffectProfile>|null,
 *   },
 *   profile: {
 *     low: { kelvin: number, celsius: number, fahrenheit: number }|null,
 *     mean: { kelvin: number, celsius: number, fahrenheit: number }|null,
 *     high: { kelvin: number, celsius: number, fahrenheit: number }|null,
 *   },
 * }|null}
 */
export function calculateNormalizedTemperatureScenario({
  base,
  latitude = null,
  timeOfDay = null,
  twilight = null,
  multiStar = null,
  inherent = null,
  precision,
} = {}) {
  const baseInput = base ?? {};
  const baseScenario = calculateAdditionalTemperatureScenario({
    luminosity: baseInput.luminosity,
    distanceAu: baseInput.distanceAu,
    eccentricity: baseInput.eccentricity,
    albedo: baseInput.albedo,
    greenhouseFactor: baseInput.greenhouseFactor,
    luminosityModifier: baseInput.luminosityModifier,
    atmosphericPressureBar: baseInput.atmosphericPressureBar,
    altitudeKm: baseInput.altitudeKm,
    meanPressureBar: baseInput.meanPressureBar,
    scaleHeightKm: baseInput.scaleHeightKm,
    gravityG: baseInput.gravityG,
    meanTemperatureK: baseInput.meanTemperatureK,
    precision,
  });
  if (!baseScenario) return null;

  const baseModifier = Number.isFinite(baseScenario.luminosityModifier)
    ? Number(baseScenario.luminosityModifier)
    : Number.isFinite(baseInput.luminosityModifier)
      ? Number(baseInput.luminosityModifier)
      : null;

  let latitudeScenario = null;
  let latitudeModifier = null;
  if (latitude && Number.isFinite(latitude.axialTiltDegrees) && Number.isFinite(latitude.latitudeDegrees)) {
    latitudeScenario = calculateLatitudeTemperatureScenario({
      luminosity: baseInput.luminosity,
      distanceAu: baseInput.distanceAu,
      albedo: baseInput.albedo,
      greenhouseFactor: baseScenario.greenhouseFactor,
      axialTiltDegrees: latitude.axialTiltDegrees,
      latitudeDegrees: latitude.latitudeDegrees,
      atmosphericPressureBar: baseInput.atmosphericPressureBar ?? baseInput.meanPressureBar,
      precision,
    });
    latitudeModifier = Number.isFinite(latitudeScenario?.luminosity?.latitudeLuminosityModifier)
      ? Number(latitudeScenario.luminosity.latitudeLuminosityModifier)
      : null;
  }

  let timeOfDayScenario = null;
  let timeOfDayModifier = null;
  if (
    timeOfDay &&
    Number.isFinite(timeOfDay.rotationFactor) &&
    Number.isFinite(timeOfDay.hoursSinceDawn) &&
    Number.isFinite(timeOfDay.solarDayHours)
  ) {
    timeOfDayScenario = calculateTimeOfDayRotationFactor({
      rotationFactor: timeOfDay.rotationFactor,
      hoursSinceDawn: timeOfDay.hoursSinceDawn,
      solarDayHours: timeOfDay.solarDayHours,
      method: timeOfDay.method,
      sunlightPortion: timeOfDay.sunlightPortion,
      axialTiltDegrees: timeOfDay.axialTiltDegrees,
      latitudeDegrees: timeOfDay.latitudeDegrees,
      dateSolarDays: timeOfDay.dateSolarDays,
      solarDaysPerYear: timeOfDay.solarDaysPerYear,
      isDaytime: timeOfDay.isDaytime,
      lagFraction: timeOfDay.lagFraction,
      precision,
    });
    timeOfDayModifier = Number.isFinite(timeOfDayScenario?.hourlyRotationFactor)
      ? Number(timeOfDayScenario.hourlyRotationFactor)
      : null;
  }

  let twilightScenario = null;
  let twilightModifier = null;
  if (twilight && Number.isFinite(twilight.longitudeFromTerminatorDeg)) {
    const longitudinalLibrationDegrees = calculateEccentricityLongitudinalLibrationDegrees({
      eccentricity: twilight.eccentricity ?? baseInput.eccentricity,
      precision,
    });
    const latitudinalLibrationDegrees = calculateLatitudinalLibrationDegrees({
      axialTiltDegrees: twilight.axialTiltDegrees ?? latitude?.axialTiltDegrees ?? timeOfDay?.axialTiltDegrees ?? 0,
      latitudeDegrees: twilight.latitudeDegrees ?? latitude?.latitudeDegrees ?? 0,
      precision,
    });
    const solarDiskBand = calculateSolarDiskVisibilityBandDegrees({
      angularSizeDegrees: twilight.angularSizeDegrees ?? 0,
      precision,
    });

    const refractionPressure =
      twilight.atmosphericPressureBar ?? baseInput.atmosphericPressureBar ?? baseInput.meanPressureBar;
    const refractionTemperature =
      twilight.temperatureK ?? baseScenario.meanTemperature?.kelvin ?? baseInput.meanTemperatureK;
    const atmosphericRefractionDegrees = calculateAtmosphericRefractionDegrees({
      atmosphericPressureBar: refractionPressure,
      temperatureK: refractionTemperature,
      precision,
    });

    const derivedScaleHeightKm = Number.isFinite(twilight.scaleHeightKm)
      ? Number(twilight.scaleHeightKm)
      : calculateAtmosphereScaleHeightKm({
          gravityG: twilight.gravityG ?? baseInput.gravityG,
          meanTemperatureK: refractionTemperature,
        });
    const twilightZoneExtentDegrees = calculateTwilightZoneExtentDegrees({
      scaleHeightKm: derivedScaleHeightKm,
      worldSize: twilight.worldSize,
      precision,
    });

    const effectiveLongitudeFromTerminatorDeg =
      Number(twilight.longitudeFromTerminatorDeg) +
      (Number.isFinite(longitudinalLibrationDegrees) ? Number(longitudinalLibrationDegrees) : 0) +
      (Number.isFinite(latitudinalLibrationDegrees) ? Number(latitudinalLibrationDegrees) : 0);
    const visibleBandHalfDeg =
      (Number.isFinite(twilight.visibleBandHalfDeg) ? Number(twilight.visibleBandHalfDeg) : 0) +
      (Number.isFinite(solarDiskBand?.halfBandDegrees) ? Number(solarDiskBand.halfBandDegrees) : 0) +
      (Number.isFinite(atmosphericRefractionDegrees) ? Math.max(0, Number(atmosphericRefractionDegrees)) : 0);

    twilightModifier = calculateTwilightLockedRotationFactor({
      longitudeFromTerminatorDeg: effectiveLongitudeFromTerminatorDeg,
      visibleBandHalfDeg,
      twilightZoneExtentDeg: Number.isFinite(twilight.twilightZoneExtentDeg)
        ? twilight.twilightZoneExtentDeg
        : twilightZoneExtentDegrees,
      brightRampDeg: twilight.brightRampDeg,
      precision,
    });

    twilightScenario = {
      longitudinalLibrationDegrees,
      latitudinalLibrationDegrees,
      solarDiskBand,
      atmosphericRefractionDegrees,
      twilightZoneExtentDegrees,
      effectiveLongitudeFromTerminatorDeg: roundToPrecision(effectiveLongitudeFromTerminatorDeg, precision),
      rotationFactor: twilightModifier,
    };
  }

  const modifierTerms = [baseModifier, latitudeModifier, timeOfDayModifier, twilightModifier].filter((v) =>
    Number.isFinite(v),
  );
  const combinedLuminosityModifier =
    modifierTerms.length > 0
      ? roundToPrecision(
          modifierTerms.reduce((sum, value) => sum + Number(value), 0),
          precision,
        )
      : null;

  const combinedScenario = calculateAdditionalTemperatureScenario({
    luminosity: baseInput.luminosity,
    distanceAu: baseInput.distanceAu,
    eccentricity: baseInput.eccentricity,
    albedo: baseInput.albedo,
    greenhouseFactor: baseScenario.greenhouseFactor,
    luminosityModifier: combinedLuminosityModifier,
    atmosphericPressureBar: baseInput.atmosphericPressureBar,
    altitudeKm: baseInput.altitudeKm,
    meanPressureBar: baseInput.meanPressureBar,
    scaleHeightKm: baseInput.scaleHeightKm,
    gravityG: baseInput.gravityG,
    meanTemperatureK: baseScenario.meanTemperature?.kelvin,
    precision,
  });
  if (!combinedScenario) return null;

  let lowK = Number(combinedScenario.highLowTemperature?.low?.kelvin);
  let meanK = Number(combinedScenario.meanTemperature?.kelvin);
  let highK = Number(combinedScenario.highLowTemperature?.high?.kelvin);

  if (!Number.isFinite(lowK)) lowK = meanK;
  if (!Number.isFinite(highK)) highK = meanK;

  let multiStarScenario = null;
  if (multiStar && Array.isArray(multiStar.stars) && multiStar.stars.length > 0) {
    multiStarScenario = calculateMultiStarTemperatureScenario({
      planetAu: Number.isFinite(multiStar.planetAu) ? multiStar.planetAu : baseInput.distanceAu,
      planetEccentricity: Number.isFinite(multiStar.planetEccentricity)
        ? multiStar.planetEccentricity
        : (baseInput.eccentricity ?? 0),
      stars: multiStar.stars,
      albedo: baseInput.albedo,
      greenhouseFactor: combinedScenario.greenhouseFactor,
      includeEccentricity: multiStar.includeEccentricity,
      precision,
    });

    lowK = combineOptionalKelvinTemperatures(lowK, multiStarScenario?.total?.lowK, precision);
    meanK = combineOptionalKelvinTemperatures(meanK, multiStarScenario?.total?.meanK, precision);
    highK = combineOptionalKelvinTemperatures(highK, multiStarScenario?.total?.highK, precision);
  }

  let inherentScenario = null;
  if (inherent && Number.isFinite(inherent.addedTemperatureK) && Number(inherent.addedTemperatureK) >= 0) {
    inherentScenario = applyInherentTemperatureEffectProfile({
      lowTemperatureK: lowK,
      meanTemperatureK: meanK,
      highTemperatureK: highK,
      addedTemperatureK: Number(inherent.addedTemperatureK),
      precision,
    });
    if (inherentScenario) {
      lowK = inherentScenario.lowK;
      meanK = inherentScenario.meanK;
      highK = inherentScenario.highK;
    }
  }

  return {
    modifiers: {
      base: Number.isFinite(baseModifier) ? roundToPrecision(baseModifier, precision) : null,
      latitude: Number.isFinite(latitudeModifier) ? roundToPrecision(latitudeModifier, precision) : null,
      timeOfDay: Number.isFinite(timeOfDayModifier) ? roundToPrecision(timeOfDayModifier, precision) : null,
      twilight: Number.isFinite(twilightModifier) ? roundToPrecision(twilightModifier, precision) : null,
      combined: Number.isFinite(combinedLuminosityModifier)
        ? roundToPrecision(combinedLuminosityModifier, precision)
        : null,
    },
    components: {
      base: baseScenario,
      combined: combinedScenario,
      latitude: latitudeScenario,
      timeOfDay: timeOfDayScenario,
      twilight: twilightScenario,
      multiStar: multiStarScenario,
      inherent: inherentScenario,
    },
    profile: {
      low: buildTemperatureScalesFromKelvin(lowK, precision),
      mean: buildTemperatureScalesFromKelvin(meanK, precision),
      high: buildTemperatureScalesFromKelvin(highK, precision),
    },
  };
}

/**
 * Create a compact, display-ready temperature scenario summary for a candidate.
 *
 * Priority order for scenario values:
 * 1) normalizedTemperatureScenarios[*].profile
 * 2) temperatureScenarioPresets[*] (mean + high/low)
 *
 * @param {object} [options]
 * @param {object} options.candidate
 * @param {string} [options.candidate.slotId]
 * @param {string} [options.candidate.bodyLabel]
 * @param {boolean} [options.candidate.isMoon]
 * @param {number} [options.candidate.meanTemperatureK]
 * @param {object} [options.candidate.normalizedTemperatureScenarios]
 * @param {object} [options.candidate.temperatureScenarioPresets]
 * @param {number} [options.precision=2]
 * @returns {{
 *   slotId: string|null,
 *   bodyLabel: string|null,
 *   isMoon: boolean,
 *   baselineMeanK: number|null,
 *   presets: Array<{
 *     key: "seaLevel"|"highAltitude"|"seasonalPeak",
 *     label: string,
 *     lowK: number|null,
 *     meanK: number|null,
 *     highK: number|null,
 *     meanC: number|null,
 *     meanF: number|null,
 *     deltaMeanK: number|null,
 *   }>,
 *   warmestPresetKey: string|null,
 *   coldestPresetKey: string|null,
 * }|null}
 */
export function formatCandidateTemperatureScenarioSummary({ candidate, precision = 2 } = {}) {
  if (!candidate || typeof candidate !== "object") return null;

  const baselineMeanK = Number(candidate.meanTemperatureK);
  const roundedBaselineMeanK = Number.isFinite(baselineMeanK) ? roundToPrecision(baselineMeanK, precision) : null;

  const normalized =
    candidate.normalizedTemperatureScenarios && typeof candidate.normalizedTemperatureScenarios === "object"
      ? candidate.normalizedTemperatureScenarios
      : {};
  const presets =
    candidate.temperatureScenarioPresets && typeof candidate.temperatureScenarioPresets === "object"
      ? candidate.temperatureScenarioPresets
      : {};

  const order = [
    ["seaLevel", "Sea Level"],
    ["highAltitude", "High Altitude"],
    ["seasonalPeak", "Seasonal Peak"],
  ];

  const rows = [];
  for (const [key, label] of order) {
    const normalizedScenario = normalized[key];
    const presetScenario = presets[key];

    const normalizedLowK = Number(normalizedScenario?.profile?.low?.kelvin);
    const normalizedMeanK = Number(normalizedScenario?.profile?.mean?.kelvin);
    const normalizedHighK = Number(normalizedScenario?.profile?.high?.kelvin);

    const presetLowK = Number(presetScenario?.highLowTemperature?.low?.kelvin);
    const presetMeanK = Number(presetScenario?.meanTemperature?.kelvin);
    const presetHighK = Number(presetScenario?.highLowTemperature?.high?.kelvin);

    const lowK = Number.isFinite(normalizedLowK) ? normalizedLowK : Number.isFinite(presetLowK) ? presetLowK : null;
    const meanK = Number.isFinite(normalizedMeanK)
      ? normalizedMeanK
      : Number.isFinite(presetMeanK)
        ? presetMeanK
        : null;
    const highK = Number.isFinite(normalizedHighK)
      ? normalizedHighK
      : Number.isFinite(presetHighK)
        ? presetHighK
        : null;

    if (!Number.isFinite(meanK) && !Number.isFinite(lowK) && !Number.isFinite(highK)) continue;

    const meanC = Number.isFinite(meanK) ? meanK - 273 : null;
    const meanF = Number.isFinite(meanK) ? meanK * 1.8 - 459.67 : null;
    const deltaMeanK =
      Number.isFinite(meanK) && Number.isFinite(roundedBaselineMeanK) ? meanK - roundedBaselineMeanK : null;

    rows.push({
      key,
      label,
      lowK: Number.isFinite(lowK) ? roundToPrecision(lowK, precision) : null,
      meanK: Number.isFinite(meanK) ? roundToPrecision(meanK, precision) : null,
      highK: Number.isFinite(highK) ? roundToPrecision(highK, precision) : null,
      meanC: Number.isFinite(meanC) ? roundToPrecision(meanC, precision) : null,
      meanF: Number.isFinite(meanF) ? roundToPrecision(meanF, precision) : null,
      deltaMeanK: Number.isFinite(deltaMeanK) ? roundToPrecision(deltaMeanK, precision) : null,
    });
  }

  if (rows.length === 0) return null;

  const rowsWithMean = rows.filter((row) => Number.isFinite(row.meanK));
  const warmestRow =
    rowsWithMean.length > 0
      ? rowsWithMean.reduce((best, row) => (row.meanK > best.meanK ? row : best), rowsWithMean[0])
      : null;
  const coldestRow =
    rowsWithMean.length > 0
      ? rowsWithMean.reduce((best, row) => (row.meanK < best.meanK ? row : best), rowsWithMean[0])
      : null;

  return {
    slotId: candidate.slotId != null ? String(candidate.slotId) : null,
    bodyLabel: candidate.bodyLabel != null ? String(candidate.bodyLabel) : null,
    isMoon: Boolean(candidate.isMoon),
    baselineMeanK: roundedBaselineMeanK,
    presets: rows,
    warmestPresetKey: warmestRow?.key ?? null,
    coldestPresetKey: coldestRow?.key ?? null,
  };
}

const RUNAWAY_GREENHOUSE_TAINTED_ATMOSPHERES = new Set(["2", "4", "7", "9"]);

function isRunawayGreenhouseHighAtmosphere(code, value) {
  if (!code) return false;
  if (code === "A" || code === "B" || code === "C") return true;
  return Number.isFinite(value) && value >= 15;
}

function isRunawayGreenhouseConvertibleAtmosphere(code, value) {
  if (!code || !Number.isFinite(value)) return false;
  if (value < 2 || value > 15) return false;
  return !isRunawayGreenhouseHighAtmosphere(code, value);
}

/**
 * Resolve Table 31 runaway-greenhouse atmosphere conversion by 1D total.
 *
 * @param {number} rollTotal
 * @returns {string} Atmosphere code A, B, or C.
 */
export function lookupRunawayGreenhouseAtmosphereCode(rollTotal) {
  if (!Number.isFinite(rollTotal)) return "B";
  if (rollTotal <= 1) return "A";
  if (rollTotal >= 5) return "C";
  return "B";
}

/**
 * Roll Table 31 runaway-greenhouse atmosphere conversion.
 *
 * DMs:
 *   DM-2 if world size is 2-5.
 *   DM+1 if original atmosphere is tainted (2,4,7,9).
 *
 * @param {object} options
 * @param {number|string} [options.size]
 * @param {string|number} options.originalAtmosphereCode
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number,
 *   dm: number,
 *   total: number,
 *   breakdown: string[],
 *   newAtmosphereCode: string,
 *   newAtmosphereCodeValue: number|null,
 * }}
 */
export function rollRunawayGreenhouseAtmosphere({ size, originalAtmosphereCode, rng = Math.random } = {}) {
  const originalCode = normalizeAtmosphereCodeInput(originalAtmosphereCode);
  const sizeCode = normalizeBasicWorldSizeCode(size);
  const sizeValue = Number.isFinite(Number(size)) ? Math.floor(Number(size)) : sizeValueFromCode(sizeCode);

  let dm = 0;
  const breakdown = [];

  if (Number.isFinite(sizeValue) && sizeValue >= 2 && sizeValue <= 5) {
    dm -= 2;
    breakdown.push("DM-2: world size is 2-5");
  }

  if (RUNAWAY_GREENHOUSE_TAINTED_ATMOSPHERES.has(originalCode)) {
    dm += 1;
    breakdown.push("DM+1: original atmosphere is tainted");
  }

  if (breakdown.length === 0) {
    breakdown.push("No DMs applicable");
  }

  const roll = roll1d(rng);
  const total = roll + dm;
  const newAtmosphereCode = lookupRunawayGreenhouseAtmosphereCode(total);

  return {
    roll,
    dm,
    total,
    breakdown,
    newAtmosphereCode,
    newAtmosphereCodeValue: fromEHex(newAtmosphereCode),
  };
}

/**
 * Calculate DMs for the runaway-greenhouse 2D check.
 *
 * DMs:
 *   DM+1 per Gyr system age (rounded up).
 *   DM+4 for boiling temperature (12+), unless detailed temperature is supplied.
 *   If detailed mean temperature is supplied and above 303K,
 *   use DM+1 per full 10K above 303K instead of the boiling DM.
 *   Optional inner-temperate check: DM-2 when orbit is inside HZCO and temperature is temperate.
 *
 * @param {object} options
 * @param {number} [options.systemAgeByr=0]
 * @param {number} [options.temperatureModifiedRoll]
 * @param {number} [options.meanTemperatureK]
 * @param {number} [options.orbitNumber]
 * @param {number} [options.hzco]
 * @param {boolean} [options.allowInnerTemperateCheck=false]
 * @returns {{ dm: number, breakdown: string[], detailedTemperatureDmUsed: boolean }}
 */
export function calculateRunawayGreenhouseCheckDm({
  systemAgeByr = 0,
  temperatureModifiedRoll,
  meanTemperatureK,
  orbitNumber,
  hzco,
  allowInnerTemperateCheck = false,
} = {}) {
  let dm = 0;
  const breakdown = [];

  if (Number.isFinite(systemAgeByr) && systemAgeByr > 0) {
    const ageDm = Math.ceil(systemAgeByr);
    dm += ageDm;
    breakdown.push(`DM+${ageDm}: system age`);
  }

  let detailedTemperatureDmUsed = false;
  if (Number.isFinite(meanTemperatureK) && meanTemperatureK > 303) {
    const meanTemperatureDm = Math.floor((meanTemperatureK - 303) / 10);
    if (meanTemperatureDm > 0) {
      dm += meanTemperatureDm;
      breakdown.push(`DM+${meanTemperatureDm}: mean temperature above 303K`);
    }
    detailedTemperatureDmUsed = true;
  }

  if (!detailedTemperatureDmUsed && Number.isFinite(temperatureModifiedRoll) && Number(temperatureModifiedRoll) >= 12) {
    dm += 4;
    breakdown.push("DM+4: boiling temperature (12+)");
  }

  if (
    allowInnerTemperateCheck &&
    Number.isFinite(orbitNumber) &&
    Number.isFinite(hzco) &&
    Number(orbitNumber) < Number(hzco) &&
    Number.isFinite(temperatureModifiedRoll) &&
    Number(temperatureModifiedRoll) >= 5 &&
    Number(temperatureModifiedRoll) <= 9
  ) {
    dm -= 2;
    breakdown.push("DM-2: temperate world inside HZCO");
  }

  if (breakdown.length === 0) {
    breakdown.push("No DMs applicable");
  }

  return { dm, breakdown, detailedTemperatureDmUsed };
}

/**
 * Run the optional runaway-greenhouse check and apply effects.
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {number|string} [options.size]
 * @param {number} options.temperatureModifiedRoll
 * @param {number} [options.systemAgeByr=0]
 * @param {number} [options.meanTemperatureK]
 * @param {number} [options.orbitNumber]
 * @param {number} [options.hzco]
 * @param {boolean} [options.allowInnerTemperateCheck=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   eligible: boolean,
 *   roll: number|null,
 *   dm: number,
 *   total: number|null,
 *   occurred: boolean,
 *   target: number,
 *   breakdown: string[],
 *   originalAtmosphereCode: string|null,
 *   originalAtmosphereCodeValue: number|null,
 *   finalAtmosphereCode: string|null,
 *   finalAtmosphereCodeValue: number|null,
 *   atmosphereChanged: boolean,
 *   atmosphereChangeRoll: number|null,
 *   atmosphereChangeDm: number,
 *   atmosphereChangeTotal: number|null,
 *   atmosphereChangeBreakdown: string[],
 *   forceBoilingForHydrographics: boolean,
 *   hydrographicsTemperatureDm: number,
 *   atmosphereSubtypeDm: number,
 * }}
 */
export function evaluateRunawayGreenhouse({
  atmosphereCode,
  size,
  temperatureModifiedRoll,
  systemAgeByr = 0,
  meanTemperatureK,
  orbitNumber,
  hzco,
  allowInnerTemperateCheck = false,
  rng = Math.random,
} = {}) {
  const normalizedAtmosphereCode = normalizeAtmosphereCodeInput(atmosphereCode);
  const originalAtmosphereCodeValue = fromEHex(normalizedAtmosphereCode);

  const isHotOrBoiling = Number.isFinite(temperatureModifiedRoll) && Number(temperatureModifiedRoll) >= 10;
  const isInnerTemperateOption =
    allowInnerTemperateCheck &&
    Number.isFinite(temperatureModifiedRoll) &&
    Number(temperatureModifiedRoll) >= 5 &&
    Number(temperatureModifiedRoll) <= 9 &&
    Number.isFinite(orbitNumber) &&
    Number.isFinite(hzco) &&
    Number(orbitNumber) < Number(hzco);

  const eligibleAtmosphere =
    Number.isFinite(originalAtmosphereCodeValue) &&
    originalAtmosphereCodeValue >= 2 &&
    originalAtmosphereCodeValue <= 15;
  const eligible = Boolean(eligibleAtmosphere && (isHotOrBoiling || isInnerTemperateOption));

  if (!eligible) {
    return {
      eligible: false,
      roll: null,
      dm: 0,
      total: null,
      occurred: false,
      target: 12,
      breakdown: ["Runaway greenhouse check not eligible"],
      originalAtmosphereCode: normalizedAtmosphereCode,
      originalAtmosphereCodeValue,
      finalAtmosphereCode: normalizedAtmosphereCode,
      finalAtmosphereCodeValue: originalAtmosphereCodeValue,
      atmosphereChanged: false,
      atmosphereChangeRoll: null,
      atmosphereChangeDm: 0,
      atmosphereChangeTotal: null,
      atmosphereChangeBreakdown: [],
      forceBoilingForHydrographics: false,
      hydrographicsTemperatureDm: 0,
      atmosphereSubtypeDm: 0,
    };
  }

  const dmResult = calculateRunawayGreenhouseCheckDm({
    systemAgeByr,
    temperatureModifiedRoll,
    meanTemperatureK,
    orbitNumber,
    hzco,
    allowInnerTemperateCheck,
  });
  const roll = roll2d(rng);
  const total = roll + dmResult.dm;
  const occurred = total >= 12;

  let finalAtmosphereCode = normalizedAtmosphereCode;
  let finalAtmosphereCodeValue = originalAtmosphereCodeValue;
  let atmosphereChanged = false;
  let atmosphereChangeRoll = null;
  let atmosphereChangeDm = 0;
  let atmosphereChangeTotal = null;
  let atmosphereChangeBreakdown = [];

  if (occurred) {
    const isHighAtmosphere = isRunawayGreenhouseHighAtmosphere(normalizedAtmosphereCode, originalAtmosphereCodeValue);
    if (
      !isHighAtmosphere &&
      isRunawayGreenhouseConvertibleAtmosphere(normalizedAtmosphereCode, originalAtmosphereCodeValue)
    ) {
      const conversion = rollRunawayGreenhouseAtmosphere({
        size,
        originalAtmosphereCode: normalizedAtmosphereCode,
        rng,
      });
      finalAtmosphereCode = conversion.newAtmosphereCode;
      finalAtmosphereCodeValue = conversion.newAtmosphereCodeValue;
      atmosphereChanged = finalAtmosphereCode !== normalizedAtmosphereCode;
      atmosphereChangeRoll = conversion.roll;
      atmosphereChangeDm = conversion.dm;
      atmosphereChangeTotal = conversion.total;
      atmosphereChangeBreakdown = conversion.breakdown;
    }
  }

  return {
    eligible: true,
    roll,
    dm: dmResult.dm,
    total,
    occurred,
    target: 12,
    breakdown: dmResult.breakdown,
    originalAtmosphereCode: normalizedAtmosphereCode,
    originalAtmosphereCodeValue,
    finalAtmosphereCode,
    finalAtmosphereCodeValue,
    atmosphereChanged,
    atmosphereChangeRoll,
    atmosphereChangeDm,
    atmosphereChangeTotal,
    atmosphereChangeBreakdown,
    forceBoilingForHydrographics: occurred,
    hydrographicsTemperatureDm: occurred ? -6 : 0,
    atmosphereSubtypeDm: occurred ? 4 : 0,
  };
}

/**
 * Resolve atmosphere metadata for a numeric or code atmosphere value.
 *
 * @param {string|number} atmosphereCode
 * @returns {object|null}
 */
export function lookupAtmosphereCodeInfo(atmosphereCode) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  if (!code) return null;
  return ATMOSPHERE_CODE_TABLE[code] ?? null;
}

/**
 * Calculate optional atmosphere-roll variants.
 *
 * Variant options:
 * - Size-based variant: DM-2 for size 2-4.
 * - Gravity-based variant (alternative to size variant):
 *   DM-2 for gravity < 0.4, DM-1 for gravity >= 0.4 and < 0.5.
 *
 * @param {object} options
 * @param {number} [options.size]
 * @param {number} [options.gravity]
 * @param {boolean} [options.useSizeThinAtmosphereVariant=false]
 * @param {boolean} [options.useGravityAtmosphereVariant=false]
 * @returns {{ dm: number, notes: string[] }}
 */
export function calculateAtmosphereVariantDm({
  size,
  gravity,
  useSizeThinAtmosphereVariant = false,
  useGravityAtmosphereVariant = false,
} = {}) {
  let dm = 0;
  const notes = [];

  if (useGravityAtmosphereVariant) {
    const gravityValue = Number(gravity);
    if (Number.isFinite(gravityValue) && gravityValue < 0.4) {
      dm -= 2;
      notes.push("DM-2: gravity below 0.4G");
    } else if (Number.isFinite(gravityValue) && gravityValue < 0.5) {
      dm -= 1;
      notes.push("DM-1: gravity between 0.4G and 0.5G");
    }
    return { dm, notes };
  }

  const sizeValue = Math.floor(Number(size));
  if (useSizeThinAtmosphereVariant && Number.isFinite(sizeValue) && sizeValue >= 2 && sizeValue <= 4) {
    dm -= 2;
    notes.push("DM-2: size 2-4 thin-atmosphere variant");
  }

  return { dm, notes };
}

/**
 * Roll atmospheric pressure from the table pressure range.
 *
 * Variable-range atmospheres (A, B, C, F, G, H) return `pressureBar: null`.
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {"uniform"|"two-dice-linear"} [options.method="uniform"]
 * @param {number} [options.precision]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   code: string|null,
 *   pressureRoll: number|null,
 *   linearFactor: number|null,
 *   method: string,
 *   diceRolls: { d1: number, d2: number }|null,
 *   pressureBar: number|null,
 *   minBar: number|null,
 *   maxBar: number|null,
 *   spanBar: number|null,
 *   variableRange: boolean,
 * } | null}
 */
export function rollAtmospherePressureBar({ atmosphereCode, method = "uniform", precision, rng = Math.random } = {}) {
  const info = lookupAtmosphereCodeInfo(atmosphereCode);
  if (!info) return null;

  const range = info.pressureRangeBar;
  if (!Array.isArray(range) || range.length !== 2) {
    return {
      code: info.code,
      pressureRoll: null,
      linearFactor: null,
      method,
      diceRolls: null,
      pressureBar: null,
      minBar: null,
      maxBar: null,
      spanBar: info.spanBar,
      variableRange: true,
    };
  }

  const [minBar, maxBar] = range;
  let pressureRoll;
  let linearFactor;
  let diceRolls = null;

  if (method === "two-dice-linear") {
    const d1 = roll1d(rng);
    const d2 = roll1d(rng);
    const index = (d1 - 1) * 5 + (d2 - 1);
    pressureRoll = index;
    linearFactor = index / 30;
    diceRolls = { d1, d2 };
  } else {
    pressureRoll = Math.max(0, Math.min(1, rng()));
    linearFactor = pressureRoll;
  }

  const pressureBar = roundToPrecision(minBar + linearFactor * (maxBar - minBar), precision);

  return {
    code: info.code,
    pressureRoll,
    linearFactor,
    method,
    diceRolls,
    pressureBar,
    minBar,
    maxBar,
    spanBar: info.spanBar,
    variableRange: false,
  };
}

function roundToPrecision(value, precision) {
  if (!Number.isFinite(value)) return value;
  if (!Number.isInteger(precision) || precision < 0) return value;
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

const NITROGEN_OXYGEN_ATMOSPHERES = new Set(["2", "3", "4", "5", "6", "7", "8", "9", "D", "E"]);
const BREATHABLE_ATMOSPHERES = new Set(["5", "6", "8"]);
const BREATHABLE_TO_TAINTED_EQUIVALENT = Object.freeze({
  5: "4",
  6: "7",
  8: "9",
});

/**
 * Return true when atmosphere is nitrogen-oxygen style (2-9, D, E).
 *
 * @param {string|number} atmosphereCode
 * @returns {boolean}
 */
export function isNitrogenOxygenAtmosphere(atmosphereCode) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  return code ? NITROGEN_OXYGEN_ATMOSPHERES.has(code) : false;
}

/**
 * Calculate age-based DM for oxygen fraction roll.
 *
 * @param {object} options
 * @param {number} [options.systemAgeByr=0]
 * @param {boolean} [options.useOptionalYoungWorldDm=false]
 * @returns {{ dm: number, breakdown: string[] }}
 */
export function calculateOxygenFractionAgeDm({ systemAgeByr = 0, useOptionalYoungWorldDm = false } = {}) {
  let dm = 0;
  const breakdown = [];
  const age = Number(systemAgeByr);

  if (Number.isFinite(age) && age > 4) {
    dm += 1;
    breakdown.push("DM+1: system age greater than 4 Gyr");
  }

  if (useOptionalYoungWorldDm && Number.isFinite(age) && age <= 4) {
    if (age < 2) {
      dm -= 4;
      breakdown.push("DM-4: system age less than 2 Gyr");
    } else if (age < 3) {
      dm -= 2;
      breakdown.push("DM-2: system age between 2 and 3 Gyr");
    } else if (age <= 3.5) {
      dm -= 1;
      breakdown.push("DM-1: system age between 3 and 3.5 Gyr");
    }
  }

  if (breakdown.length === 0) {
    breakdown.push("No DMs applicable");
  }

  return { dm, breakdown };
}

function oxygenVariance({ applyLinearVariance = false, rng = Math.random } = {}) {
  if (!applyLinearVariance) return 0;
  return (rng() - 0.5) * 0.01; // +/-0.005
}

/**
 * Roll oxygen fraction for atmospheres 2-9, D, E.
 *
 * `classic` formula:
 *   (1D + DMs)/20 + (2D - 7)/100 + (1D - 1)/20
 *
 * `compact-d10` formula:
 *   (1D - 1 + DMs)/20 + d10/100
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {number} [options.systemAgeByr=0]
 * @param {boolean} [options.useOptionalYoungWorldDm=false]
 * @param {boolean} [options.applyLinearVariance=false]
 * @param {"classic"|"compact-d10"} [options.method="classic"]
 * @param {number} [options.precision]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   eligible: boolean,
 *   atmosphereCode: string|null,
 *   method: string,
 *   dm: number,
 *   dmBreakdown: string[],
 *   rolls: Record<string, number>|null,
 *   variance: number,
 *   fallbackApplied: boolean,
 *   oxygenFraction: number|null,
 * }}
 */
export function rollOxygenFraction({
  atmosphereCode,
  systemAgeByr = 0,
  useOptionalYoungWorldDm = false,
  applyLinearVariance = false,
  method = "classic",
  precision,
  rng = Math.random,
} = {}) {
  const normalizedCode = normalizeAtmosphereCodeInput(atmosphereCode);
  if (!normalizedCode || !NITROGEN_OXYGEN_ATMOSPHERES.has(normalizedCode)) {
    return {
      eligible: false,
      atmosphereCode: normalizedCode,
      method,
      dm: 0,
      dmBreakdown: ["Atmosphere is not nitrogen-oxygen type (2-9, D, E)"],
      rolls: null,
      variance: 0,
      fallbackApplied: false,
      oxygenFraction: null,
    };
  }

  const dmResult = calculateOxygenFractionAgeDm({ systemAgeByr, useOptionalYoungWorldDm });
  let baseFraction = 0;
  let rolls;

  if (method === "compact-d10") {
    const d1 = roll1d(rng);
    const d10 = roll1d10(rng);
    baseFraction = (d1 - 1 + dmResult.dm) / 20 + d10 / 100;
    rolls = { d1, d10 };
  } else {
    const d1Base = roll1d(rng);
    const d2 = roll2d(rng);
    const d1Tail = roll1d(rng);
    baseFraction = (d1Base + dmResult.dm) / 20 + (d2 - 7) / 100 + (d1Tail - 1) / 20;
    rolls = { d1Base, d2, d1Tail };
  }

  let variance = oxygenVariance({ applyLinearVariance, rng });
  let oxygenFraction = baseFraction + variance;
  let fallbackApplied = false;

  if (oxygenFraction <= 0) {
    fallbackApplied = true;
    const fallbackD1 = roll1d(rng);
    const fallbackVariance = oxygenVariance({ applyLinearVariance, rng });
    variance = fallbackVariance;
    oxygenFraction = fallbackD1 * 0.01 + fallbackVariance;
    rolls.fallbackD1 = fallbackD1;
  }

  oxygenFraction = Math.max(0, Math.min(0.4, oxygenFraction));
  oxygenFraction = roundToPrecision(oxygenFraction, precision);

  return {
    eligible: true,
    atmosphereCode: normalizedCode,
    method,
    dm: dmResult.dm,
    dmBreakdown: dmResult.breakdown,
    rolls,
    variance,
    fallbackApplied,
    oxygenFraction,
  };
}

/**
 * Calculate oxygen partial pressure in bar.
 *
 * @param {object} options
 * @param {number} options.oxygenFraction
 * @param {number} options.totalPressureBar
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateOxygenPartialPressureBar({ oxygenFraction, totalPressureBar, precision } = {}) {
  if (!Number.isFinite(oxygenFraction) || !Number.isFinite(totalPressureBar)) return null;
  return roundToPrecision(oxygenFraction * totalPressureBar, precision);
}

/**
 * Evaluate oxygen taint and breathable-to-tainted conversion suggestion.
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {number} options.totalPressureBar
 * @param {number} options.oxygenPartialPressureBar
 * @param {boolean} [options.autoConvertBreathableToTainted=false]
 * @returns {{
 *   atmosphereCode: string|null,
 *   oxygenTrait: "low-oxygen"|"high-oxygen"|null,
 *   withinHumanComfortRange: boolean,
 *   oxygenTaintLikely: boolean,
 *   suggestedTaintedEquivalent: string|null,
 *   finalAtmosphereCode: string|null,
 *   finalAtmosphereCodeValue: number|null,
 * }}
 */
export function evaluateAtmosphereOxygenTaint({
  atmosphereCode,
  totalPressureBar,
  oxygenPartialPressureBar,
  autoConvertBreathableToTainted = false,
} = {}) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  const ppo = Number(oxygenPartialPressureBar);
  const totalBar = Number(totalPressureBar);

  const oxygenTrait = !Number.isFinite(ppo) ? null : ppo < 0.1 ? "low-oxygen" : ppo > 0.5 ? "high-oxygen" : null;
  const withinHumanComfortRange = oxygenTrait === null;
  const oxygenTaintLikely =
    Number.isFinite(totalBar) &&
    totalBar >= 0.43 &&
    totalBar <= 2.49 &&
    Number.isFinite(ppo) &&
    !withinHumanComfortRange;

  const suggestedTaintedEquivalent =
    code && BREATHABLE_ATMOSPHERES.has(code) && oxygenTrait ? BREATHABLE_TO_TAINTED_EQUIVALENT[code] : null;

  const finalAtmosphereCode =
    autoConvertBreathableToTainted && suggestedTaintedEquivalent ? suggestedTaintedEquivalent : code;

  return {
    atmosphereCode: code,
    oxygenTrait,
    withinHumanComfortRange,
    oxygenTaintLikely,
    suggestedTaintedEquivalent,
    finalAtmosphereCode,
    finalAtmosphereCodeValue: fromEHex(finalAtmosphereCode),
  };
}

/**
 * Approximate scale height in kilometers.
 *
 * Base approximation: 8.5 / g
 * Temperature-adjusted approximation: 8.5 * (T / 288) / g
 *
 * @param {object} options
 * @param {number} options.gravityG
 * @param {number} [options.meanTemperatureK]
 * @param {boolean} [options.useTemperatureAdjustment=false]
 * @param {number} [options.referenceTemperatureK=288]
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAtmosphereScaleHeightKm({
  gravityG,
  meanTemperatureK,
  useTemperatureAdjustment = false,
  referenceTemperatureK = 288,
  precision,
} = {}) {
  const gravity = Number(gravityG);
  if (!Number.isFinite(gravity) || gravity <= 0) return null;

  let scaleHeight = 8.5 / gravity;
  if (useTemperatureAdjustment && Number.isFinite(meanTemperatureK) && meanTemperatureK > 0) {
    const reference = Number.isFinite(referenceTemperatureK) && referenceTemperatureK > 0 ? referenceTemperatureK : 288;
    scaleHeight = (8.5 * (Number(meanTemperatureK) / reference)) / gravity;
  }

  return roundToPrecision(scaleHeight, precision);
}

/**
 * Calculate pressure at altitude (or depth) using exponential falloff.
 *
 * P(a) = P(m) * exp(-a / H)
 *
 * @param {object} options
 * @param {number} options.meanPressureBar
 * @param {number} options.altitudeKm
 * @param {number} options.scaleHeightKm
 * @param {number} [options.precision]
 * @returns {number|null}
 */
export function calculateAtmosphericPressureAtAltitudeBar({
  meanPressureBar,
  altitudeKm,
  scaleHeightKm,
  precision,
} = {}) {
  const pressure = Number(meanPressureBar);
  const altitude = Number(altitudeKm);
  const scale = Number(scaleHeightKm);
  if (!Number.isFinite(pressure) || !Number.isFinite(altitude) || !Number.isFinite(scale) || scale <= 0) return null;

  return roundToPrecision(pressure * Math.exp(-altitude / scale), precision);
}

/**
 * Estimate mean temperature in Kelvin from a Table 30 region type.
 *
 * @param {string} temperatureRegionType
 * @returns {number}
 */
export function estimateMeanTemperatureKFromRegionType(temperatureRegionType) {
  const normalized = String(temperatureRegionType ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "frozen") return 210;
  if (normalized === "cold") return 247.5;
  if (normalized === "hot") return 328.5;
  if (normalized === "boiling") return 380;
  return 288;
}

function formatFixed(value, precision = 3) {
  if (!Number.isFinite(value)) return "?";
  const digits = Number.isInteger(precision) && precision >= 0 ? precision : 3;
  return Number(value).toFixed(digits);
}

/**
 * Format atmosphere shorthand profile: A-bar-ppo[:suffix]
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {number} options.totalPressureBar
 * @param {number} options.oxygenPartialPressureBar
 * @param {number} [options.precision=3]
 * @param {string} [options.suffix]
 * @returns {string}
 */
export function formatAtmosphereProfile({
  atmosphereCode,
  totalPressureBar,
  oxygenPartialPressureBar,
  precision = 3,
  suffix,
} = {}) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode) ?? "?";
  const profile = `${code}-${formatFixed(totalPressureBar, precision)}-${formatFixed(oxygenPartialPressureBar, precision)}`;
  const extra = String(suffix ?? "").trim();
  return extra ? `${profile}:${extra}` : profile;
}

/**
 * Generate detailed habitable-zone atmosphere profile values.
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {number} [options.systemAgeByr=0]
 * @param {boolean} [options.useOptionalYoungWorldOxygenDm=false]
 * @param {boolean} [options.applyOxygenVariance=false]
 * @param {"uniform"|"two-dice-linear"} [options.pressureMethod="uniform"]
 * @param {"classic"|"compact-d10"} [options.oxygenMethod="classic"]
 * @param {number} [options.gravityG]
 * @param {number} [options.meanTemperatureK]
 * @param {boolean} [options.autoConvertBreathableToTainted=false]
 * @param {number} [options.precision=3]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   pressure: ReturnType<typeof rollAtmospherePressureBar>|null,
 *   oxygenFraction: ReturnType<typeof rollOxygenFraction>|null,
 *   oxygenPartialPressureBar: number|null,
 *   oxygenTaint: ReturnType<typeof evaluateAtmosphereOxygenTaint>|null,
 *   scaleHeightKm: number|null,
 *   pressureAt5KmBar: number|null,
 *   profile: string|null,
 * }}
 */
export function generateHabitableZoneAtmosphereProfile({
  atmosphereCode,
  systemAgeByr = 0,
  useOptionalYoungWorldOxygenDm = false,
  applyOxygenVariance = false,
  pressureMethod = "uniform",
  oxygenMethod = "classic",
  gravityG,
  meanTemperatureK,
  autoConvertBreathableToTainted = false,
  precision = 3,
  rng = Math.random,
} = {}) {
  const pressure = rollAtmospherePressureBar({ atmosphereCode, method: pressureMethod, precision, rng });
  if (!pressure || pressure.variableRange || !Number.isFinite(pressure.pressureBar)) {
    return {
      pressure,
      oxygenFraction: null,
      oxygenPartialPressureBar: null,
      oxygenTaint: null,
      scaleHeightKm: null,
      pressureAt5KmBar: null,
      profile: null,
    };
  }

  const oxygenFraction = rollOxygenFraction({
    atmosphereCode,
    systemAgeByr,
    useOptionalYoungWorldDm: useOptionalYoungWorldOxygenDm,
    applyLinearVariance: applyOxygenVariance,
    method: oxygenMethod,
    precision,
    rng,
  });

  const oxygenPartialPressureBar = calculateOxygenPartialPressureBar({
    oxygenFraction: oxygenFraction.oxygenFraction,
    totalPressureBar: pressure.pressureBar,
    precision,
  });

  const oxygenTaint = evaluateAtmosphereOxygenTaint({
    atmosphereCode,
    totalPressureBar: pressure.pressureBar,
    oxygenPartialPressureBar,
    autoConvertBreathableToTainted,
  });

  const scaleHeightKm = calculateAtmosphereScaleHeightKm({
    gravityG,
    meanTemperatureK,
    useTemperatureAdjustment: Number.isFinite(meanTemperatureK),
    precision,
  });

  const pressureAt5KmBar = calculateAtmosphericPressureAtAltitudeBar({
    meanPressureBar: pressure.pressureBar,
    altitudeKm: 5,
    scaleHeightKm,
    precision,
  });

  const profile = formatAtmosphereProfile({
    atmosphereCode: oxygenTaint.finalAtmosphereCode ?? atmosphereCode,
    totalPressureBar: pressure.pressureBar,
    oxygenPartialPressureBar,
    precision,
  });

  return {
    pressure,
    oxygenFraction,
    oxygenPartialPressureBar,
    oxygenTaint,
    scaleHeightKm,
    pressureAt5KmBar,
    profile,
  };
}

// â”€â”€ Taint Subtypes, Severity, and Persistence (Tables 32â€“34) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 32: Taint Subtype raw lookup entries.
 * code "P*" signals "Particulates and roll again" (handled in rollTaintSubtype).
 */
const TAINT_SUBTYPE_TABLE_32 = Object.freeze([
  { maxTotal: 2, code: "L", label: "Low Oxygen" },
  { maxTotal: 3, code: "R", label: "Radioactivity" },
  { maxTotal: 4, code: "B", label: "Biologic" },
  { maxTotal: 5, code: "G", label: "Gas Mix" },
  { maxTotal: 6, code: "P", label: "Particulates" },
  { maxTotal: 7, code: "G", label: "Gas Mix" },
  { maxTotal: 8, code: "S", label: "Sulphur Compounds" },
  { maxTotal: 9, code: "B", label: "Biologic" },
  { maxTotal: 10, code: "P*", label: "Particulates and roll again" },
  { maxTotal: 11, code: "R", label: "Radioactivity" },
  { maxTotal: Infinity, code: "H", label: "High Oxygen" },
]);

/** Table 33: Taint Severity lookup entries. */
const TAINT_SEVERITY_TABLE_33 = Object.freeze([
  {
    maxTotal: 4,
    code: 1,
    severity: "Trivial irritant",
    outcomes: "After 1D weeks acclimation, this taint is inconsequential",
  },
  {
    maxTotal: 5,
    code: 2,
    severity: "Surmountable irritant",
    outcomes: "After 1D months acclimation, this taint is inconsequential",
  },
  { maxTotal: 6, code: 3, severity: "Minor irritant", outcomes: "Surmountable on Difficult (10+) END check" },
  { maxTotal: 7, code: 4, severity: "Major irritant", outcomes: "Filter masks required or TL10+ medical intervention" },
  {
    maxTotal: 8,
    code: 5,
    severity: "Serious irritant",
    outcomes: "Filter masks required or TL12+ medical intervention",
  },
  {
    maxTotal: 9,
    code: 6,
    severity: "Hazardous irritant",
    outcomes: "Filter masks required or TL14+ medical intervention",
  },
  { maxTotal: 10, code: 7, severity: "Long term lethal", outcomes: "DM-2 to aging rolls. Filter masks required" },
  {
    maxTotal: 11,
    code: 8,
    severity: "Inevitably lethal",
    outcomes: "Death within 1D days. Filter masks required; protective clothing recommended",
  },
  {
    maxTotal: Infinity,
    code: 9,
    severity: "Rapidly lethal",
    outcomes: "Death within 1D minutes. Filter masks and protective clothing required",
  },
]);

/** Table 34: Taint Persistence lookup entries. */
const TAINT_PERSISTENCE_TABLE_34 = Object.freeze([
  {
    maxTotal: 2,
    code: 2,
    persistence: "Occasional and brief",
    description: "Occurs periodically or on a 2D roll of 12 per day and lasts 1D hours",
  },
  {
    maxTotal: 3,
    code: 3,
    persistence: "Occasional and lingering",
    description: "Occurs periodically or on a 2D roll of 12 per day and lasts 1D days",
  },
  { maxTotal: 4, code: 4, persistence: "Irregular", description: "Occurs on a 2D roll of 9+ and lasts for D3 days" },
  {
    maxTotal: 5,
    code: 5,
    persistence: "Fluctuating",
    description: "Roll 2D daily: on 6-, reduce severity by one level; on 12 increase severity by one level",
  },
  {
    maxTotal: 6,
    code: 6,
    persistence: "Varying",
    description: "Always present but roll 2D daily: on 6-, reduce severity by one level for 1D hours",
  },
  {
    maxTotal: 7,
    code: 7,
    persistence: "Varying",
    description: "Always present but roll 2D daily: on 4-, reduce severity by one level for 1D hours",
  },
  {
    maxTotal: 8,
    code: 8,
    persistence: "Varying",
    description: "Always present but roll 2D daily: on 2, reduce severity by one level for 1D hours",
  },
  { maxTotal: Infinity, code: 9, persistence: "Constant", description: "Ever-present at indicated severity" },
]);

/** Taint applies to Atmosphere codes 2, 4, 7, 9. */
const TAINTED_ATMOSPHERE_CODES = Object.freeze(new Set([2, 4, 7, 9]));

function lookupTaintSubtypeRaw(total) {
  return (
    TAINT_SUBTYPE_TABLE_32.find((e) => total <= e.maxTotal) ?? TAINT_SUBTYPE_TABLE_32[TAINT_SUBTYPE_TABLE_32.length - 1]
  );
}

function lookupTaintSeverityEntry(total) {
  return (
    TAINT_SEVERITY_TABLE_33.find((e) => total <= e.maxTotal) ??
    TAINT_SEVERITY_TABLE_33[TAINT_SEVERITY_TABLE_33.length - 1]
  );
}

function lookupTaintPersistenceEntry(total) {
  return (
    TAINT_PERSISTENCE_TABLE_34.find((e) => total <= e.maxTotal) ??
    TAINT_PERSISTENCE_TABLE_34[TAINT_PERSISTENCE_TABLE_34.length - 1]
  );
}

const TAINT_SUBTYPE_LABEL_MAP = Object.freeze({
  L: "Low Oxygen",
  H: "High Oxygen",
  R: "Radioactivity",
  B: "Biologic",
  G: "Gas Mix",
  P: "Particulates",
  S: "Sulphur Compounds",
});

/**
 * Roll taint subtype(s) for a tainted-atmosphere world (Table 32).
 *
 * Applies die modifiers:
 *   - Atmosphere 4: DM-2
 *   - Atmosphere 9: DM+2
 *
 * Handles the "result of 10" cascade: a roll of 10 yields Particulates plus a
 * subsequent roll, up to a maximum of three taint conditions.
 *
 * If a `knownOxygenTrait` is supplied for an Atmosphere 4, 7, or 9 world, it is
 * used as the first (pre-established) subtype and subsequent rolls only test for
 * the Particulates cascade (a 10 result adds P; any non-10 result stops the chain).
 *
 * Substitution rules:
 *   - Low/High Oxygen outside atmo codes 4â€“9, or on 2nd/3rd taint â†’ Gas Mix (G)
 *   - Sulphur Compounds (S) when meanTemperatureK < 273 â†’ Particulates (P)
 *
 * When a Low or High Oxygen subtype survives un-substituted (first roll, not
 * pre-existing), a 1D ppo-adjustment roll is included:
 *   - Low Oxygen:  delta = âˆ’1D/100  (drives ppo below 0.1)
 *   - High Oxygen: delta = +1D/10   (drives ppo above 0.5)
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode  Tainted atmosphere code (2, 4, 7, or 9).
 * @param {"low-oxygen"|"high-oxygen"|null} [options.knownOxygenTrait=null]  Pre-established ppo-based trait (from evaluateAtmosphereOxygenTaint).
 * @param {number} [options.meanTemperatureK]  World mean temperature for Sâ†’P cold substitution.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   dm: number,
 *   subtypes: Array<{
 *     code: string,
 *     label: string,
 *     position: number,
 *     roll: number|null,
 *     total: number|null,
 *     wasOxygenSubstituted: boolean,
 *     wasSulphurSubstituted: boolean,
 *     wasPreexisting: boolean,
 *     ppoAdjustment: {roll: number, delta: number}|null,
 *   }>,
 *   rolls: Array<{roll: number, total: number, purpose: string}>,
 * }}
 */
export function rollTaintSubtype({
  atmosphereCode,
  knownOxygenTrait = null,
  meanTemperatureK,
  rng = Math.random,
} = {}) {
  const code = normalizeAtmosphereCodeInput(atmosphereCode);
  const codeNum = code !== null ? fromEHex(code) : 0;
  const isColdWorld = Number.isFinite(meanTemperatureK) && Number(meanTemperatureK) < 273;
  const isInRange4To9 = codeNum >= 4 && codeNum <= 9;
  const dm = codeNum === 4 ? -2 : codeNum === 9 ? 2 : 0;

  const makeRoll = () => {
    const r = roll2d(rng);
    return { roll: r, total: r + dm };
  };

  // Resolve a raw table code to its final code/label, applying substitution rules.
  // position: 1 = first taint, 2+ = second or third.
  const resolveEntry = (rawCode, position, wasPreexisting = false) => {
    let resolvedCode = rawCode === "P*" ? "P" : rawCode;
    let wasOxygenSubstituted = false;
    let wasSulphurSubstituted = false;
    let ppoAdjustment = null;

    if (resolvedCode === "S" && isColdWorld) {
      resolvedCode = "P";
      wasSulphurSubstituted = true;
    }

    if ((resolvedCode === "L" || resolvedCode === "H") && (!isInRange4To9 || position > 1)) {
      resolvedCode = "G";
      wasOxygenSubstituted = true;
    }

    // ppo adjustment roll for fresh (non-preexisting) L or H that survived substitution
    if ((resolvedCode === "L" || resolvedCode === "H") && !wasPreexisting) {
      const adjRoll = roll1d(rng);
      ppoAdjustment =
        resolvedCode === "L" ? { roll: adjRoll, delta: -(adjRoll / 100) } : { roll: adjRoll, delta: adjRoll / 10 };
    }

    return {
      code: resolvedCode,
      label: TAINT_SUBTYPE_LABEL_MAP[resolvedCode] ?? resolvedCode,
      wasOxygenSubstituted,
      wasSulphurSubstituted,
      wasPreexisting,
      ppoAdjustment,
    };
  };

  const subtypes = [];
  const rollLog = [];
  const hasPreknownOxygen = Boolean(knownOxygenTrait) && [4, 7, 9].includes(codeNum);

  if (hasPreknownOxygen) {
    // First subtype: pre-established L or H from ppo calculation
    const preCode = knownOxygenTrait === "high-oxygen" ? "H" : "L";
    subtypes.push({
      ...resolveEntry(preCode, 1, true),
      position: 1,
      roll: null,
      total: null,
    });

    // Roll to check for the "10 â†’ Particulates" cascade only
    const r1 = makeRoll();
    rollLog.push({ roll: r1.roll, total: r1.total, purpose: "check-for-particulates" });

    if (r1.total === 10) {
      subtypes.push({
        code: "P",
        label: "Particulates",
        position: 2,
        roll: r1.roll,
        total: r1.total,
        wasOxygenSubstituted: false,
        wasSulphurSubstituted: false,
        wasPreexisting: false,
        ppoAdjustment: null,
      });

      const r2 = makeRoll();
      rollLog.push({ roll: r2.roll, total: r2.total, purpose: "check-for-third" });

      if (r2.total === 10) {
        // Final roll determines the third subtype
        const r3 = makeRoll();
        rollLog.push({ roll: r3.roll, total: r3.total, purpose: "third-subtype-final" });
        const raw3 = lookupTaintSubtypeRaw(r3.total);
        subtypes.push({
          ...resolveEntry(raw3.code, 3),
          position: 3,
          roll: r3.roll,
          total: r3.total,
        });
      }
    }
  } else {
    // General case: roll for first subtype
    const r1 = makeRoll();
    rollLog.push({ roll: r1.roll, total: r1.total, purpose: "first-subtype" });
    const raw1 = lookupTaintSubtypeRaw(r1.total);

    if (raw1.code === "P*") {
      // P as first subtype; roll for a second cause
      subtypes.push({
        code: "P",
        label: "Particulates",
        position: 1,
        roll: r1.roll,
        total: r1.total,
        wasOxygenSubstituted: false,
        wasSulphurSubstituted: false,
        wasPreexisting: false,
        ppoAdjustment: null,
      });

      const r2 = makeRoll();
      rollLog.push({ roll: r2.roll, total: r2.total, purpose: "second-subtype" });
      const raw2 = lookupTaintSubtypeRaw(r2.total);

      if (raw2.code === "P*") {
        // P as second subtype; one final roll for the third
        subtypes.push({
          code: "P",
          label: "Particulates",
          position: 2,
          roll: r2.roll,
          total: r2.total,
          wasOxygenSubstituted: false,
          wasSulphurSubstituted: false,
          wasPreexisting: false,
          ppoAdjustment: null,
        });

        const r3 = makeRoll();
        rollLog.push({ roll: r3.roll, total: r3.total, purpose: "third-subtype-final" });
        const raw3 = lookupTaintSubtypeRaw(r3.total);
        subtypes.push({
          ...resolveEntry(raw3.code, 3),
          position: 3,
          roll: r3.roll,
          total: r3.total,
        });
      } else {
        subtypes.push({ ...resolveEntry(raw2.code, 2), position: 2, roll: r2.roll, total: r2.total });
      }
    } else {
      subtypes.push({ ...resolveEntry(raw1.code, 1), position: 1, roll: r1.roll, total: r1.total });
    }
  }

  return { dm, subtypes, rolls: rollLog };
}

/**
 * Roll taint severity for a given subtype (Table 33).
 *
 * Die modifiers:
 *   - Low or High Oxygen subtype (L/H): DM+4
 *   - Insidious atmosphere (code C = 12): DM+6
 *
 * When `useOptionalPpoSeverity` is true for L or H taints, severity is assigned
 * directly from ppo thresholds instead of a die roll:
 *   - Low Oxygen: code 2 (â‰¥0.09 bar), 3 (â‰¥0.08), 8 ([0.06, 0.08)), 9 (<0.06)
 *   - High Oxygen: code 2 (<0.6 bar), 7 ([0.6, 0.7)), 8 ([0.7, 0.8)), 9 (â‰¥0.8)
 *
 * @param {object} options
 * @param {string} options.taintSubtypeCode  Single-letter code: L, H, R, B, G, P, S.
 * @param {string|number} [options.atmosphereCode]  For insidious (C) DM detection.
 * @param {number} [options.oxygenPartialPressureBar]  ppo for optional L/H severity override.
 * @param {boolean} [options.useOptionalPpoSeverity=false]  Use ppo-threshold severity for L/H.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number|null,
 *   dm: number,
 *   total: number|null,
 *   code: number,
 *   severity: string,
 *   outcomes: string,
 *   ppoMode: boolean,
 * }}
 */
export function rollTaintSeverity({
  taintSubtypeCode,
  atmosphereCode,
  oxygenPartialPressureBar,
  useOptionalPpoSeverity = false,
  rng = Math.random,
} = {}) {
  const subtype = String(taintSubtypeCode ?? "").toUpperCase();
  const atmoCode = normalizeAtmosphereCodeInput(atmosphereCode);
  const atmoNum = atmoCode !== null ? fromEHex(atmoCode) : 0;
  const isOxygenTaint = subtype === "L" || subtype === "H";
  const isInsidious = atmoNum === 12; // code C
  const dm = isInsidious ? 6 : isOxygenTaint ? 4 : 0;

  if (useOptionalPpoSeverity && isOxygenTaint && Number.isFinite(oxygenPartialPressureBar)) {
    const ppo = Number(oxygenPartialPressureBar);
    let targetCode;
    if (subtype === "L") {
      if (ppo >= 0.09) targetCode = 2;
      else if (ppo >= 0.08) targetCode = 3;
      else if (ppo >= 0.06) targetCode = 8;
      else targetCode = 9;
    } else {
      if (ppo < 0.6) targetCode = 2;
      else if (ppo < 0.7) targetCode = 7;
      else if (ppo < 0.8) targetCode = 8;
      else targetCode = 9;
    }
    const entry =
      TAINT_SEVERITY_TABLE_33.find((e) => e.code === targetCode) ??
      TAINT_SEVERITY_TABLE_33[TAINT_SEVERITY_TABLE_33.length - 1];
    return {
      roll: null,
      dm,
      total: null,
      code: entry.code,
      severity: entry.severity,
      outcomes: entry.outcomes,
      ppoMode: true,
    };
  }

  const roll = roll2d(rng);
  const total = roll + dm;
  const entry = lookupTaintSeverityEntry(total);
  return { roll, dm, total, code: entry.code, severity: entry.severity, outcomes: entry.outcomes, ppoMode: false };
}

/**
 * Roll taint persistence for a given subtype and severity (Table 34).
 *
 * Die modifiers:
 *   - Low or High Oxygen subtype (L/H): DM+4 (DM+6 when severityCode â‰¥ 8)
 *   - Insidious atmosphere (code C = 12): DM+6
 *
 * @param {object} options
 * @param {string} options.taintSubtypeCode  Single-letter code: L, H, R, B, G, P, S.
 * @param {number} [options.severityCode]  Severity code 1â€“9 (affects DM for L/H when â‰¥8).
 * @param {string|number} [options.atmosphereCode]  For insidious (C) DM detection.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number,
 *   dm: number,
 *   total: number,
 *   code: number,
 *   persistence: string,
 *   description: string,
 * }}
 */
export function rollTaintPersistence({ taintSubtypeCode, severityCode, atmosphereCode, rng = Math.random } = {}) {
  const subtype = String(taintSubtypeCode ?? "").toUpperCase();
  const atmoCode = normalizeAtmosphereCodeInput(atmosphereCode);
  const atmoNum = atmoCode !== null ? fromEHex(atmoCode) : 0;
  const isOxygenTaint = subtype === "L" || subtype === "H";
  const isInsidious = atmoNum === 12; // code C
  const sevCode = Number.isFinite(severityCode) ? Number(severityCode) : 0;

  let dm = 0;
  if (isInsidious) {
    dm = 6;
  } else if (isOxygenTaint) {
    dm = sevCode >= 8 ? 6 : 4;
  }

  const roll = roll2d(rng);
  const total = roll + dm;
  const entry = lookupTaintPersistenceEntry(total);
  return { roll, dm, total, code: entry.code, persistence: entry.persistence, description: entry.description };
}

/**
 * Roll all taint subtypes and optionally severity/persistence for a world.
 *
 * Suitable for tainted atmosphere codes 2, 4, 7, 9. Bundles subtype rolling,
 * PPO adjustments for any oxygen subtypes, and optional per-taint severity and
 * persistence rolls into a single result.
 *
 * @param {object} options
 * @param {string|number} options.atmosphereCode
 * @param {"low-oxygen"|"high-oxygen"|null} [options.knownOxygenTrait=null]  Pre-established trait from evaluateAtmosphereOxygenTaint.
 * @param {number} [options.oxygenPartialPressureBar]  Current ppo for taint evaluation and optional severity override.
 * @param {number} [options.meanTemperatureK]  For Sâ†’P cold substitution.
 * @param {boolean} [options.rollSeverity=false]  Roll Table 33 severity for each taint.
 * @param {boolean} [options.rollPersistence=false]  Roll Table 34 persistence for each taint (requires rollSeverity).
 * @param {boolean} [options.useOptionalPpoSeverity=false]  Use ppo-based severity thresholds for L/H taints.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   subtypeResult: ReturnType<typeof rollTaintSubtype>,
 *   adjustedOxygenPartialPressureBar: number|null,
 *   taints: Array<{
 *     code: string,
 *     label: string,
 *     position: number,
 *     severity: ReturnType<typeof rollTaintSeverity>|null,
 *     persistence: ReturnType<typeof rollTaintPersistence>|null,
 *   }>,
 * }}
 */
export function rollWorldTaints({
  atmosphereCode,
  knownOxygenTrait = null,
  oxygenPartialPressureBar,
  meanTemperatureK,
  rollSeverity = false,
  rollPersistence = false,
  useOptionalPpoSeverity = false,
  rng = Math.random,
} = {}) {
  const subtypeResult = rollTaintSubtype({ atmosphereCode, knownOxygenTrait, meanTemperatureK, rng });

  let runningPpo = Number.isFinite(oxygenPartialPressureBar) ? Number(oxygenPartialPressureBar) : null;

  const taints = subtypeResult.subtypes.map((st) => {
    // Apply ppo delta from fresh L/H oxygen taint rolls
    if (st.ppoAdjustment !== null && runningPpo !== null) {
      runningPpo += st.ppoAdjustment.delta;
    }

    const effectivePpo = runningPpo !== null ? runningPpo : oxygenPartialPressureBar;

    const severity = rollSeverity
      ? rollTaintSeverity({
          taintSubtypeCode: st.code,
          atmosphereCode,
          oxygenPartialPressureBar: effectivePpo,
          useOptionalPpoSeverity,
          rng,
        })
      : null;

    const persistence =
      rollPersistence && severity !== null
        ? rollTaintPersistence({
            taintSubtypeCode: st.code,
            severityCode: severity.code,
            atmosphereCode,
            rng,
          })
        : null;

    return { code: st.code, label: st.label, position: st.position, severity, persistence };
  });

  const basePpo = Number.isFinite(oxygenPartialPressureBar) ? Number(oxygenPartialPressureBar) : null;
  const adjustedOxygenPartialPressureBar =
    runningPpo !== null && basePpo !== null && runningPpo !== basePpo ? runningPpo : null;

  return { subtypeResult, adjustedOxygenPartialPressureBar, taints };
}

// â”€â”€ Subtypes: Exotic (A) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 35: Atmospheric Gas Composition.
 * Lists gases that may exist in exotic (or any) atmospheres, with their physical
 * properties and escape values for long-term atmospheric retention.
 *
 * Formula for retention: gasEscapeValue < 1000 Ã— (massEarth / (diameterEarth Ã— temperatureK))
 * Physical state at a given temperature:
 *   temperature > boilingPointK  â†’ "gas"
 *   temperature > meltingPointK  â†’ "liquid"
 *   otherwise                    â†’ "solid"
 *
 * relativeAbundance of null marks the Hydrogen Ion (H-) sentinel used to
 * classify worlds capable of retaining gas giants / dwarfs.
 */
export const ATMOSPHERIC_GAS_TABLE_35 = Object.freeze([
  {
    name: "Hydrogen Ion",
    code: "H-",
    escapeValue: 24.0,
    atomicMass: 1,
    boilingPointK: 20,
    meltingPointK: 14,
    relativeAbundance: null,
    isTaint: false,
  },
  {
    name: "Hydrogen",
    code: "H2",
    escapeValue: 12.0,
    atomicMass: 2,
    boilingPointK: 20,
    meltingPointK: 14,
    relativeAbundance: 1200,
    isTaint: false,
  },
  {
    name: "Helium",
    code: "He",
    escapeValue: 6.0,
    atomicMass: 4,
    boilingPointK: 4,
    meltingPointK: 0,
    relativeAbundance: 400,
    isTaint: false,
  },
  {
    name: "Methane",
    code: "CH4",
    escapeValue: 1.5,
    atomicMass: 16,
    boilingPointK: 113,
    meltingPointK: 91,
    relativeAbundance: 70,
    isTaint: true,
  },
  {
    name: "Ammonia",
    code: "NH3",
    escapeValue: 1.42,
    atomicMass: 17,
    boilingPointK: 240,
    meltingPointK: 195,
    relativeAbundance: 30,
    isTaint: true,
  },
  {
    name: "Water Vapour",
    code: "H2O",
    escapeValue: 1.33,
    atomicMass: 18,
    boilingPointK: 373,
    meltingPointK: 273,
    relativeAbundance: 100,
    isTaint: false,
  },
  {
    name: "Hydrofluoric Acid",
    code: "HF",
    escapeValue: 1.2,
    atomicMass: 20,
    boilingPointK: 293,
    meltingPointK: 190,
    relativeAbundance: 2,
    isTaint: true,
  },
  {
    name: "Neon",
    code: "Ne",
    escapeValue: 1.2,
    atomicMass: 20,
    boilingPointK: 27,
    meltingPointK: 25,
    relativeAbundance: 50,
    isTaint: false,
  },
  {
    name: "Sodium",
    code: "Na",
    escapeValue: 1.04,
    atomicMass: 23,
    boilingPointK: 1156,
    meltingPointK: 371,
    relativeAbundance: 40,
    isTaint: true,
  },
  {
    name: "Nitrogen",
    code: "N2",
    escapeValue: 0.86,
    atomicMass: 28,
    boilingPointK: 77,
    meltingPointK: 63,
    relativeAbundance: 60,
    isTaint: false,
  },
  {
    name: "Carbon Monoxide",
    code: "CO",
    escapeValue: 0.86,
    atomicMass: 28,
    boilingPointK: 82,
    meltingPointK: 68,
    relativeAbundance: 70,
    isTaint: true,
  },
  {
    name: "Hydrogen Cyanide",
    code: "HCN",
    escapeValue: 0.86,
    atomicMass: 28,
    boilingPointK: 299,
    meltingPointK: 260,
    relativeAbundance: 30,
    isTaint: true,
  },
  {
    name: "Ethane",
    code: "C2H6",
    escapeValue: 0.8,
    atomicMass: 30,
    boilingPointK: 184,
    meltingPointK: 90,
    relativeAbundance: 70,
    isTaint: true,
  },
  {
    name: "Oxygen",
    code: "O2",
    escapeValue: 0.75,
    atomicMass: 32,
    boilingPointK: 90,
    meltingPointK: 54,
    relativeAbundance: 50,
    isTaint: false,
  },
  {
    name: "Hydrochloric Acid",
    code: "HCl",
    escapeValue: 0.67,
    atomicMass: 36,
    boilingPointK: 321,
    meltingPointK: 247,
    relativeAbundance: 1,
    isTaint: true,
  },
  {
    name: "Fluorine",
    code: "F2",
    escapeValue: 0.63,
    atomicMass: 38,
    boilingPointK: 85,
    meltingPointK: 53,
    relativeAbundance: 2,
    isTaint: true,
  },
  {
    name: "Argon",
    code: "Ar",
    escapeValue: 0.6,
    atomicMass: 40,
    boilingPointK: 87,
    meltingPointK: 83,
    relativeAbundance: 20,
    isTaint: false,
  },
  {
    name: "Carbon Dioxide",
    code: "CO2",
    escapeValue: 0.55,
    atomicMass: 44,
    boilingPointK: 216,
    meltingPointK: 194,
    relativeAbundance: 70,
    isTaint: true,
  },
  {
    name: "Formamide",
    code: "CH3NO",
    escapeValue: 0.53,
    atomicMass: 45,
    boilingPointK: 483,
    meltingPointK: 275,
    relativeAbundance: 15,
    isTaint: true,
  },
  {
    name: "Formic Acid",
    code: "CH2O2",
    escapeValue: 0.52,
    atomicMass: 46,
    boilingPointK: 374,
    meltingPointK: 281,
    relativeAbundance: 15,
    isTaint: true,
  },
  {
    name: "Sulphur Dioxide",
    code: "SO2",
    escapeValue: 0.38,
    atomicMass: 64,
    boilingPointK: 263,
    meltingPointK: 201,
    relativeAbundance: 20,
    isTaint: true,
  },
  {
    name: "Chlorine",
    code: "Cl2",
    escapeValue: 0.34,
    atomicMass: 70,
    boilingPointK: 239,
    meltingPointK: 171,
    relativeAbundance: 1,
    isTaint: true,
  },
  {
    name: "Krypton",
    code: "Kr",
    escapeValue: 0.29,
    atomicMass: 84,
    boilingPointK: 120,
    meltingPointK: 115,
    relativeAbundance: 2,
    isTaint: false,
  },
  {
    name: "Sulphuric Acid",
    code: "H2SO4",
    escapeValue: 0.24,
    atomicMass: 98,
    boilingPointK: 718,
    meltingPointK: 388,
    relativeAbundance: 20,
    isTaint: true,
  },
]);

/**
 * Determine the physical state of a gas at a given temperature.
 *
 * @param {{ boilingPointK: number, meltingPointK: number }} gas  Entry from ATMOSPHERIC_GAS_TABLE_35.
 * @param {number} temperatureK  Surface temperature in Kelvin.
 * @returns {"gas"|"liquid"|"solid"}
 */
export function getGasState(gas, temperatureK) {
  if (temperatureK > gas.boilingPointK) return "gas";
  if (temperatureK > gas.meltingPointK) return "liquid";
  return "solid";
}

/**
 * Check whether a gas can be retained in a world's atmosphere over geological time.
 *
 * Formula: escapeValue < 1000 Ã— (massEarth / (diameterEarth Ã— temperatureK))
 *
 * @param {object} options
 * @param {number} options.massEarth      World mass in Earth units.
 * @param {number} options.diameterEarth  World diameter in Earth units.
 * @param {number} options.temperatureK   Approximate surface temperature in Kelvin.
 * @param {number} options.gasEscapeValue Escape value from ATMOSPHERIC_GAS_TABLE_35.
 * @returns {boolean}
 */
export function checkGasRetention({ massEarth, diameterEarth, temperatureK, gasEscapeValue }) {
  const retentionLimit = (1000 * massEarth) / (diameterEarth * temperatureK);
  return gasEscapeValue < retentionLimit;
}

/**
 * Get all gases from Table 35 that a world can retain and that exist as a gas
 * at the given temperature. Excludes the Hydrogen Ion (H-) sentinel.
 *
 * @param {object} options
 * @param {number} options.massEarth      World mass in Earth units.
 * @param {number} options.diameterEarth  World diameter in Earth units.
 * @param {number} options.temperatureK   Approximate surface temperature in Kelvin.
 * @returns {Array} Subset of ATMOSPHERIC_GAS_TABLE_35 entries.
 */
export function getRetainableGases({ massEarth, diameterEarth, temperatureK }) {
  return ATMOSPHERIC_GAS_TABLE_35.filter(
    (gas) =>
      gas.code !== "H-" &&
      gas.relativeAbundance !== null &&
      checkGasRetention({ massEarth, diameterEarth, temperatureK, gasEscapeValue: gas.escapeValue }) &&
      getGasState(gas, temperatureK) === "gas",
  );
}

/**
 * Randomly select gases for an exotic atmosphere from the retainable pool,
 * weighted by each gas's relative abundance. Returns at most `count` unique gases.
 *
 * @param {object} options
 * @param {number} options.massEarth
 * @param {number} options.diameterEarth
 * @param {number} options.temperatureK
 * @param {number}   [options.count=3]         Maximum gases to select.
 * @param {Function} [options.rng=Math.random]
 * @returns {Array} Selected gas entries with no duplicates.
 */
export function selectExoticAtmosphereGases({
  massEarth,
  diameterEarth,
  temperatureK,
  count = 3,
  rng = Math.random,
} = {}) {
  const pool = getRetainableGases({ massEarth, diameterEarth, temperatureK });
  if (pool.length === 0) return [];
  const selected = [];
  const remaining = [...pool];
  const limit = Math.min(count, remaining.length);
  for (let i = 0; i < limit; i++) {
    const totalWeight = remaining.reduce((sum, g) => sum + g.relativeAbundance, 0);
    let pick = rng() * totalWeight;
    let idx = 0;
    while (idx < remaining.length - 1 && pick >= remaining[idx].relativeAbundance) {
      pick -= remaining[idx].relativeAbundance;
      idx++;
    }
    selected.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return selected;
}

/**
 * Roll severity and persistence for an exotic atmosphere's occasional corrosive irritant.
 *
 * An occasional corrosive atmosphere (one that sometimes qualifies as corrosive code B)
 * is treated as a Gas Mix (G) irritant using special fixed DMs:
 * - Severity:    1D + 9 on the Taint Severity table  (always codes 7â€“9)
 * - Persistence: 1D + 1 on the Taint Persistence table (always codes 2â€“7)
 *
 * @param {object}   [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ subtypeCode: string, label: string, severityRoll: number, severityDm: number,
 *             severityTotal: number, severity: object, persistenceRoll: number,
 *             persistenceDm: number, persistenceTotal: number, persistence: object }}
 */
export function rollExoticCorrosiveIrritant({ rng = Math.random } = {}) {
  const severityRoll = roll1d(rng);
  const severityTotal = severityRoll + 9;
  const severityEntry = lookupTaintSeverityEntry(severityTotal);
  const persistenceRoll = roll1d(rng);
  const persistenceTotal = persistenceRoll + 1;
  const persistenceEntry = lookupTaintPersistenceEntry(persistenceTotal);
  return {
    subtypeCode: "G",
    label: "Gas Mix",
    severityRoll,
    severityDm: 9,
    severityTotal,
    severity: { code: severityEntry.code, severity: severityEntry.severity, outcomes: severityEntry.outcomes },
    persistenceRoll,
    persistenceDm: 1,
    persistenceTotal,
    persistence: {
      code: persistenceEntry.code,
      persistence: persistenceEntry.persistence,
      description: persistenceEntry.description,
    },
  };
}

// â”€â”€ Subtypes: Corrosive (B) and Insidious (C) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 36: Corrosive and Insidious Atmosphere Subtype lookup entries.
 *
 * Each entry covers a range of 2D+DM totals (â‰¤ maxTotal).
 * hasIrritant indicates whether this subtype triggers a taint/irritant roll.
 * pressureRangeBar is [min, max|null] (null = unbound upper end).
 * pressureSpanBar is the rollable span; null for the unbound top entry.
 * temperatureNote captures special temperature conditions where relevant.
 */
export const CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36 = Object.freeze([
  {
    maxTotal: 1,
    code: "1",
    label: "Very Thin, Temperature 50K or less",
    hasIrritant: false,
    pressureRangeBar: [0.1, 0.42],
    pressureSpanBar: 0.32,
    temperatureNote: "≤50K",
  },
  {
    maxTotal: 2,
    code: "2",
    label: "Very Thin, Irritant",
    hasIrritant: true,
    pressureRangeBar: [0.1, 0.42],
    pressureSpanBar: 0.32,
    temperatureNote: null,
  },
  {
    maxTotal: 3,
    code: "3",
    label: "Very Thin",
    hasIrritant: false,
    pressureRangeBar: [0.1, 0.42],
    pressureSpanBar: 0.32,
    temperatureNote: null,
  },
  {
    maxTotal: 4,
    code: "4",
    label: "Thin, Irritant",
    hasIrritant: true,
    pressureRangeBar: [0.43, 0.7],
    pressureSpanBar: 0.27,
    temperatureNote: null,
  },
  {
    maxTotal: 5,
    code: "5",
    label: "Thin",
    hasIrritant: false,
    pressureRangeBar: [0.43, 0.7],
    pressureSpanBar: 0.27,
    temperatureNote: null,
  },
  {
    maxTotal: 6,
    code: "6",
    label: "Standard",
    hasIrritant: false,
    pressureRangeBar: [0.7, 1.49],
    pressureSpanBar: 0.79,
    temperatureNote: null,
  },
  {
    maxTotal: 7,
    code: "7",
    label: "Standard, Irritant",
    hasIrritant: true,
    pressureRangeBar: [0.7, 1.49],
    pressureSpanBar: 0.79,
    temperatureNote: null,
  },
  {
    maxTotal: 8,
    code: "8",
    label: "Dense",
    hasIrritant: false,
    pressureRangeBar: [1.5, 2.49],
    pressureSpanBar: 0.99,
    temperatureNote: null,
  },
  {
    maxTotal: 9,
    code: "9",
    label: "Dense, Irritant",
    hasIrritant: true,
    pressureRangeBar: [1.5, 2.49],
    pressureSpanBar: 0.99,
    temperatureNote: null,
  },
  {
    maxTotal: 10,
    code: "A",
    label: "Very Dense",
    hasIrritant: false,
    pressureRangeBar: [2.5, 10.0],
    pressureSpanBar: 7.5,
    temperatureNote: null,
  },
  {
    maxTotal: 11,
    code: "B",
    label: "Very Dense, Irritant",
    hasIrritant: true,
    pressureRangeBar: [2.5, 10.0],
    pressureSpanBar: 7.5,
    temperatureNote: null,
  },
  {
    maxTotal: 12,
    code: "C",
    label: "Extremely Dense",
    hasIrritant: false,
    pressureRangeBar: [10.0, null],
    pressureSpanBar: null,
    temperatureNote: null,
  },
  {
    maxTotal: 13,
    code: "D",
    label: "Extremely Dense, Temperature 500K+",
    hasIrritant: false,
    pressureRangeBar: [10.0, null],
    pressureSpanBar: null,
    temperatureNote: "â‰¥500K",
  },
  {
    maxTotal: Infinity,
    code: "E",
    label: "Extremely Dense, Temperature 500K+, Irritant",
    hasIrritant: true,
    pressureRangeBar: [10.0, null],
    pressureSpanBar: null,
    temperatureNote: "â‰¥500K",
  },
]);

/** Subtype codes that are "extremely dense" (C, D, E) â€” gives DM+2 on hazard table. */
const CORROSIVE_EXTREMELY_DENSE_CODES = Object.freeze(new Set(["C", "D", "E"]));

/**
 * Table 37: Insidious Atmosphere Hazard lookup entries.
 *
 * Special rule: if the hazard code is "T" AND the subtype is D or E,
 * the Temperature hazard is automatic and another hazard must be re-rolled.
 * That post-roll logic is handled in rollInsidiousHazard.
 */
export const INSIDIOUS_HAZARD_TABLE_37 = Object.freeze([
  { maxTotal: 4, code: "B", hazard: "Biologic" },
  { maxTotal: 5, code: "R", hazard: "Radioactivity" },
  { maxTotal: 7, code: "G", hazard: "Gas Mix" },
  { maxTotal: 8, code: "T", hazard: "Temperature" },
  { maxTotal: 9, code: "G", hazard: "Gas Mix" },
  { maxTotal: 10, code: "T", hazard: "Temperature" },
  { maxTotal: 11, code: "R", hazard: "Radioactivity" },
  { maxTotal: Infinity, code: "T", hazard: "Temperature" },
]);

function lookupCorrosiveInsidiousSubtype(total) {
  return (
    CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36.find((e) => total <= e.maxTotal) ??
    CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36[CORROSIVE_INSIDIOUS_SUBTYPE_TABLE_36.length - 1]
  );
}

function lookupInsidiousHazard(total) {
  return (
    INSIDIOUS_HAZARD_TABLE_37.find((e) => total <= e.maxTotal) ??
    INSIDIOUS_HAZARD_TABLE_37[INSIDIOUS_HAZARD_TABLE_37.length - 1]
  );
}

/**
 * Roll the Corrosive or Insidious Atmosphere Subtype (Table 36).
 *
 * DM rules:
 * - Size 2â€“4: DM-3
 * - Size 8+:  DM+2
 * - Orbit < HZCO-1: DM+4
 * - Orbit > HZCO+2: DM-2
 * - Atmosphere is Insidious (C): DM+2
 * - Runaway greenhouse result: DM+4
 *
 * @param {object}  [options]
 * @param {number}  [options.sizeValue=7]             World size value (integer).
 * @param {number}  [options.orbit]                   World orbit value; if omitted orbit DMs are skipped.
 * @param {number}  [options.hzco]                    Habitable-zone centre orbit; required when orbit is provided.
 * @param {number|string} [options.atmosphereCode]    "B" or "C" (or numeric 11/12). Insidious gives DM+2.
 * @param {boolean} [options.wasRunawayGreenhouse=false]  DM+4 when true.
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, dm: number, total: number, code: string, label: string,
 *             hasIrritant: boolean, pressureRangeBar: [number, number|null],
 *             pressureSpanBar: number|null, temperatureNote: string|null }}
 */
export function rollCorrosiveInsidiousSubtype({
  sizeValue = 7,
  orbit,
  hzco,
  atmosphereCode,
  wasRunawayGreenhouse = false,
  rng = Math.random,
} = {}) {
  let dm = 0;
  const size = Number(sizeValue);
  if (size >= 2 && size <= 4) dm -= 3;
  else if (size >= 8) dm += 2;

  if (orbit !== undefined && orbit !== null && hzco !== undefined && hzco !== null) {
    const orbitNum = Number(orbit);
    const hzcoNum = Number(hzco);
    if (orbitNum < hzcoNum - 1) dm += 4;
    else if (orbitNum > hzcoNum + 2) dm -= 2;
  }

  const atmoStr = String(atmosphereCode).toUpperCase();
  if (atmoStr === "C" || atmoStr === "12") dm += 2;

  if (wasRunawayGreenhouse) dm += 4;

  const roll = roll2d(rng);
  const total = Math.max(1, roll + dm);
  const entry = lookupCorrosiveInsidiousSubtype(total);
  return {
    roll,
    dm,
    total,
    code: entry.code,
    label: entry.label,
    hasIrritant: entry.hasIrritant,
    pressureRangeBar: entry.pressureRangeBar,
    pressureSpanBar: entry.pressureSpanBar,
    temperatureNote: entry.temperatureNote,
  };
}

/**
 * Roll the Insidious Atmosphere Hazard (Table 37).
 *
 * DM rules:
 * - Extremely dense subtype (C, D, or E): DM+2
 *
 * Special rule per subtype D/E: a Temperature hazard is automatic;
 * the roll result is used as an *additional* hazard (re-rolled until non-T
 * if the rolled result is also T and subtype is D or E).
 *
 * @param {object}  [options]
 * @param {string}  [options.subtypeCode]  Subtype code from Table 36 (e.g. "C", "D", "6").
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, dm: number, total: number, code: string, hazard: string,
 *             hasAutoTemperature: boolean, additionalHazard: object|null }}
 */
export function rollInsidiousHazard({ subtypeCode = "6", rng = Math.random } = {}) {
  const isExtremelyDense = CORROSIVE_EXTREMELY_DENSE_CODES.has(String(subtypeCode).toUpperCase());
  const dm = isExtremelyDense ? 2 : 0;

  const isSubtypeDE = String(subtypeCode).toUpperCase() === "D" || String(subtypeCode).toUpperCase() === "E";

  const roll = roll2d(rng);
  const total = roll + dm;
  const entry = lookupInsidiousHazard(total);

  // For subtypes D and E, Temperature hazard is automatic.
  // The rolled result is treated as an additional hazard.
  // If that additional hazard is also T, re-roll until non-T.
  if (isSubtypeDE) {
    let additionalEntry = entry;
    if (additionalEntry.code === "T") {
      // Re-roll for additional hazard, excluding T
      let reRoll;
      let attempts = 0;
      do {
        reRoll = roll2d(rng) + dm;
        additionalEntry = lookupInsidiousHazard(reRoll);
        attempts++;
      } while (additionalEntry.code === "T" && attempts < 20);
    }
    return {
      roll,
      dm,
      total,
      code: "T",
      hazard: "Temperature",
      hasAutoTemperature: true,
      additionalHazard: { code: additionalEntry.code, hazard: additionalEntry.hazard },
    };
  }

  return {
    roll,
    dm,
    total,
    code: entry.code,
    hazard: entry.hazard,
    hasAutoTemperature: false,
    additionalHazard: null,
  };
}

// â”€â”€ Subtype: Low (E) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Compute the Low Atmosphere Bad Ratio.
 *
 * A Low (E) atmosphere has total pressure similar to a Very Thin atmosphere at
 * mean baseline altitude, but its high-gravity world allows deeper depressions
 * to retain denser air.  The bad ratio is the factor by which effective
 * pressure must increase (via descent) before ppo reaches human-tolerable levels.
 *
 * Formula:  lowBadRatio = limit / ppo
 *   where limit = 0.1 bar (standard minimum) or 0.08 bar (extreme tolerance).
 *
 * @param {object} [options]
 * @param {number}  options.ppo                   Oxygen partial pressure at mean baseline (bar).
 * @param {boolean} [options.useExtremeLimit=false] Use 0.08 bar instead of 0.1.
 * @returns {{ lowBadRatio: number, limit: number, ppo: number }}
 */
export function calculateLowAtmosphereBadRatio({ ppo, useExtremeLimit = false } = {}) {
  const ppoNum = Number(ppo);
  const limit = useExtremeLimit ? 0.08 : 0.1;
  const lowBadRatio = ppoNum > 0 ? limit / ppoNum : Infinity;
  return { lowBadRatio, limit, ppo: ppoNum };
}

/**
 * Calculate the safe depth below mean baseline altitude for a Low (E) atmosphere.
 *
 * Formula: safeDepthBelowBaselineKm = ln(lowBadRatio) Ã— scaleHeightKm
 *
 * Nitrogen narcosis check: if (lowBadRatio Ã— nitrogenPpo) > 2.0 bar, there is
 * no safe altitude â€” nitrogen narcosis would affect unprotected humans before
 * sufficient oxygen pressure is reached.
 *
 * @param {object} [options]
 * @param {number}  options.ppo                    Oxygen partial pressure at mean baseline (bar).
 * @param {number}  options.scaleHeightKm           Scale height of the atmosphere (km).
 * @param {number}  [options.nitrogenPpo]           Nitrogen partial pressure at mean baseline (bar).
 * @param {boolean} [options.useExtremeLimit=false]
 * @returns {{ lowBadRatio: number, limit: number,
 *             safeDepthBelowBaselineKm: number|null,
 *             nitrogenPressureAtSafeDepthBar: number|null,
 *             hasNitrogenNarcosisRisk: boolean,
 *             hasNoSafeAltitude: boolean }}
 */
export function calculateLowAtmosphereSafeAltitudeKm({
  ppo,
  scaleHeightKm,
  nitrogenPpo,
  useExtremeLimit = false,
} = {}) {
  const { lowBadRatio, limit } = calculateLowAtmosphereBadRatio({ ppo, useExtremeLimit });
  const scale = Number(scaleHeightKm);

  const safeDepthBelowBaselineKm =
    Number.isFinite(lowBadRatio) && lowBadRatio > 0 && Number.isFinite(scale) && scale > 0
      ? Math.log(lowBadRatio) * scale
      : null;

  const nitrogenPressureAtSafeDepthBar =
    nitrogenPpo !== undefined &&
    nitrogenPpo !== null &&
    Number.isFinite(Number(nitrogenPpo)) &&
    Number.isFinite(lowBadRatio)
      ? lowBadRatio * Number(nitrogenPpo)
      : null;

  const hasNitrogenNarcosisRisk = nitrogenPressureAtSafeDepthBar !== null && nitrogenPressureAtSafeDepthBar > 2.0;
  const hasNoSafeAltitude = hasNitrogenNarcosisRisk;

  return {
    lowBadRatio,
    limit,
    safeDepthBelowBaselineKm,
    nitrogenPressureAtSafeDepthBar,
    hasNitrogenNarcosisRisk,
    hasNoSafeAltitude,
  };
}

/**
 * Roll whether a Low (E) atmosphere has a taint.
 *
 * The Referee may impose a taint on a 1D roll of 4+.
 *
 * @param {object}   [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, hasTaint: boolean }}
 */
export function rollLowAtmosphereTaint({ rng = Math.random } = {}) {
  const roll = roll1d(rng);
  return { roll, hasTaint: roll >= 4 };
}

// â”€â”€ Subtype: Unusual (F) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Table 38: Unusual Atmosphere Subtypes.
 *
 * Roll D26 (D2 Ã— 10 + D6) to select a subtype.
 * Entries with non-null prerequisites should be re-rolled if the world
 * does not meet the conditions, or the world's properties should be adjusted.
 */
export const UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38 = Object.freeze([
  {
    d26: 11,
    code: "1",
    subtype: "Dense, Extreme",
    conditions: "Density between 10 and 100 bar, possibly with free oxygen",
    prerequisites: null,
  },
  {
    d26: 12,
    code: "2",
    subtype: "Dense, Very Extreme",
    conditions: "Density between 100 and 1,000 bar, possibly with free oxygen",
    prerequisites: null,
  },
  {
    d26: 13,
    code: "3",
    subtype: "Dense, Crushing",
    conditions: "Density above 1,000 bar; surface may be unreachable or indistinct",
    prerequisites: null,
  },
  {
    d26: 14,
    code: "4",
    subtype: "Ellipsoid",
    conditions:
      "Either tidal forces or very fast rotation has elongated one axis of this world; as scale height is based on average diameter, pressure may range from near vacuum to very dense and some bands of atmosphere may be habitable",
    prerequisites: null,
  },
  {
    d26: 15,
    code: "5",
    subtype: "High Radiation",
    conditions:
      "Internal or external factors bombard the world with constant high radiation; this may cause unusual gases to form or may just be lethal emanations permeating an otherwise normal atmosphere",
    prerequisites: null,
  },
  {
    d26: 16,
    code: "6",
    subtype: "Layered",
    conditions: "Different altitudes have different gas compositions",
    prerequisites: "gravity above 1.2",
  },
  {
    d26: 21,
    code: "7",
    subtype: "Panthalassic",
    conditions:
      "A world ocean hundreds of kilometres deep covers the world; atmospheric pressure is at least standard and often very or extremely dense",
    prerequisites: "Hydrographics A (10), atmospheric pressure 1.0+ bar",
  },
  {
    d26: 22,
    code: "8",
    subtype: "Steam",
    conditions: "Water vapor merges with oceans; very dense or above pressures",
    prerequisites: "Hydrographics 5+, atmospheric pressure 2.5+ bar",
  },
  {
    d26: 23,
    code: "9",
    subtype: "Variable Pressure",
    conditions: "Tides or storms cause large variations in atmospheric pressure",
    prerequisites: null,
  },
  {
    d26: 24,
    code: "A",
    subtype: "Variable Composition",
    conditions: "Composition varies with seasons, lifeform lifecycles or some other factor",
    prerequisites: null,
  },
  {
    d26: 25,
    code: null,
    subtype: "Combination",
    conditions: "Pick (or roll) two types with compatible conditions",
    prerequisites: null,
  },
  {
    d26: 26,
    code: "F",
    subtype: "Other",
    conditions: "Something else entirely",
    prerequisites: null,
  },
]);

/**
 * Roll D26: D2 (1â€“2) Ã— 10 + D6 (1â€“6), yielding 11â€“16 or 21â€“26.
 *
 * @param {Function} [rng=Math.random]
 * @returns {{ d2: number, d6: number, result: number }}
 */
export function rollD26(rng = Math.random) {
  const d2 = Math.floor(rng() * 2) + 1;
  const d6 = Math.floor(rng() * 6) + 1;
  return { d2, d6, result: d2 * 10 + d6 };
}

/**
 * Roll an Unusual Atmosphere Subtype from Table 38.
 *
 * A random occurrence of atmosphere type F normally only occurs on worlds of
 * Size A or greater.
 *
 * @param {object}   [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ d2: number, d6: number, roll: number, entry: object }}
 */
export function rollUnusualAtmosphereSubtype({ rng = Math.random } = {}) {
  const { d2, d6, result } = rollD26(rng);
  const entry =
    UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.find((e) => e.d26 === result) ??
    UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38[UNUSUAL_ATMOSPHERE_SUBTYPE_TABLE_38.length - 1];
  return { d2, d6, roll: result, entry };
}

/**
 * Format an Unusual (F) atmosphere profile shorthand.
 *
 * Format:  F-{pressureShorthand}{subtype1}.{subtype2}â€¦
 * Example: subtypeCodes ["1", "7"] with pressureShorthand "St" â†’ "F-St1.7"
 *
 * @param {object}   [options]
 * @param {string}   [options.pressureShorthand=""]  Pressure shorthand (e.g. "St", "De").
 * @param {string[]} [options.subtypeCodes=[]]        Subtype code(s) from Table 38.
 * @returns {string}
 */
export function formatUnusualAtmosphereProfile({ pressureShorthand = "", subtypeCodes = [] } = {}) {
  const codes = Array.isArray(subtypeCodes) ? subtypeCodes : [];
  if (codes.length === 0) return `F-${pressureShorthand}`;
  return `F-${pressureShorthand}${codes.join(".")}`;
}

// â”€â”€ Non-Habitable Zone Atmospheres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function createNonHabitableAtmosphereOutcome(
  atmosphereCode,
  label,
  {
    subtypeCode = null,
    subtypeLabel = null,
    hasIrritant = false,
    irritantOn4Plus = false,
    specialHotOrbitRollEligible = false,
  } = {},
) {
  return Object.freeze({
    atmosphereCode,
    label,
    subtypeCode,
    subtypeLabel,
    hasIrritant,
    irritantOn4Plus,
    specialHotOrbitRollEligible,
  });
}

function createExoticPressureOutcome(
  subtypeCode,
  subtypeLabel,
  { hasIrritant = false, irritantOn4Plus = false, specialHotOrbitRollEligible = false } = {},
) {
  const resolvedSubtypeLabel =
    hasIrritant && !subtypeLabel.includes("Irritant") ? `${subtypeLabel}, Irritant` : subtypeLabel;
  return createNonHabitableAtmosphereOutcome(`A`, `Exotic (A), ${resolvedSubtypeLabel}`, {
    subtypeCode,
    subtypeLabel: resolvedSubtypeLabel,
    hasIrritant,
    irritantOn4Plus,
    specialHotOrbitRollEligible,
  });
}

const NON_HABITABLE_NONE_OUTCOME = createNonHabitableAtmosphereOutcome(`0`, `None (0)`);
const NON_HABITABLE_TRACE_OUTCOME = createNonHabitableAtmosphereOutcome(`1`, `Trace (1)`);
const NON_HABITABLE_CORROSIVE_OUTCOME = createNonHabitableAtmosphereOutcome(`B`, `Corrosive (B)`);
const NON_HABITABLE_INSIDIOUS_OUTCOME = createNonHabitableAtmosphereOutcome(`C`, `Insidious (C)`);
const NON_HABITABLE_VERY_DENSE_OUTCOME = createNonHabitableAtmosphereOutcome(`D`, `Very Dense (D)`);
const NON_HABITABLE_UNUSUAL_OUTCOME = createNonHabitableAtmosphereOutcome(`F`, `Unusual (F)`);
const NON_HABITABLE_HELIUM_OUTCOME = createNonHabitableAtmosphereOutcome(`G`, `Gas, Helium (G)`);
const NON_HABITABLE_HYDROGEN_OUTCOME = createNonHabitableAtmosphereOutcome(`H`, `Gas, Hydrogen (H)`);

const EXOTIC_IRRITANT_VARIANTS = Object.freeze({
  3: Object.freeze({ subtypeCode: `2`, subtypeLabel: `Very Thin, Irritant` }),
  5: Object.freeze({ subtypeCode: `4`, subtypeLabel: `Thin, Irritant` }),
  6: Object.freeze({ subtypeCode: `7`, subtypeLabel: `Standard, Irritant` }),
  8: Object.freeze({ subtypeCode: `9`, subtypeLabel: `Dense, Irritant` }),
  A: Object.freeze({ subtypeCode: `B`, subtypeLabel: `Very Dense, Irritant` }),
});

function applyExoticIrritantOutcome(outcome) {
  const irritantVariant = EXOTIC_IRRITANT_VARIANTS[outcome?.subtypeCode];
  if (!irritantVariant) {
    return createNonHabitableAtmosphereOutcome(outcome.atmosphereCode, outcome.label, {
      subtypeCode: outcome.subtypeCode,
      subtypeLabel: outcome.subtypeLabel,
      hasIrritant: true,
    });
  }

  return createExoticPressureOutcome(irritantVariant.subtypeCode, irritantVariant.subtypeLabel, {
    hasIrritant: true,
  });
}

function createNonHabitableTableRow(maxTotal, hotOrOuterColumn, warmOrFarColumn) {
  return Object.freeze({ maxTotal, hotOrOuterColumn, warmOrFarColumn });
}

/** Table 39: Hot Atmospheres. */
export const HOT_ATMOSPHERE_TABLE_39 = Object.freeze([
  createNonHabitableTableRow(0, NON_HABITABLE_NONE_OUTCOME, NON_HABITABLE_NONE_OUTCOME),
  createNonHabitableTableRow(1, NON_HABITABLE_NONE_OUTCOME, NON_HABITABLE_TRACE_OUTCOME),
  createNonHabitableTableRow(
    2,
    NON_HABITABLE_TRACE_OUTCOME,
    createExoticPressureOutcome(`2`, `Very Thin, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(3, NON_HABITABLE_TRACE_OUTCOME, createExoticPressureOutcome(`3`, `Very Thin`)),
  createNonHabitableTableRow(
    4,
    createExoticPressureOutcome(`3`, `Very Thin`, { irritantOn4Plus: true, specialHotOrbitRollEligible: true }),
    createExoticPressureOutcome(`4`, `Thin, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(
    5,
    createExoticPressureOutcome(`5`, `Thin`, { irritantOn4Plus: true, specialHotOrbitRollEligible: true }),
    createExoticPressureOutcome(`5`, `Thin`),
  ),
  createNonHabitableTableRow(
    6,
    createExoticPressureOutcome(`6`, `Standard`, { irritantOn4Plus: true, specialHotOrbitRollEligible: true }),
    createExoticPressureOutcome(`6`, `Standard`),
  ),
  createNonHabitableTableRow(
    7,
    createExoticPressureOutcome(`8`, `Dense`, { irritantOn4Plus: true, specialHotOrbitRollEligible: true }),
    createExoticPressureOutcome(`7`, `Standard, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(
    8,
    createExoticPressureOutcome(`A`, `Very Dense`, { irritantOn4Plus: true, specialHotOrbitRollEligible: true }),
    createExoticPressureOutcome(`8`, `Dense`),
  ),
  createNonHabitableTableRow(
    9,
    NON_HABITABLE_CORROSIVE_OUTCOME,
    createExoticPressureOutcome(`9`, `Dense, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(
    10,
    NON_HABITABLE_CORROSIVE_OUTCOME,
    createExoticPressureOutcome(`A`, `Very Dense`, { irritantOn4Plus: true }),
  ),
  createNonHabitableTableRow(11, NON_HABITABLE_CORROSIVE_OUTCOME, NON_HABITABLE_CORROSIVE_OUTCOME),
  createNonHabitableTableRow(12, NON_HABITABLE_INSIDIOUS_OUTCOME, NON_HABITABLE_INSIDIOUS_OUTCOME),
  createNonHabitableTableRow(13, NON_HABITABLE_CORROSIVE_OUTCOME, NON_HABITABLE_CORROSIVE_OUTCOME),
  createNonHabitableTableRow(14, NON_HABITABLE_INSIDIOUS_OUTCOME, NON_HABITABLE_INSIDIOUS_OUTCOME),
  createNonHabitableTableRow(15, NON_HABITABLE_UNUSUAL_OUTCOME, NON_HABITABLE_UNUSUAL_OUTCOME),
  createNonHabitableTableRow(16, NON_HABITABLE_HELIUM_OUTCOME, NON_HABITABLE_HELIUM_OUTCOME),
  createNonHabitableTableRow(Infinity, NON_HABITABLE_HYDROGEN_OUTCOME, NON_HABITABLE_HYDROGEN_OUTCOME),
]);

/** Table 40: Special Roll if Orbit is HZCO -3.0 or less. */
export const SPECIAL_HOT_ATMOSPHERE_TABLE_40 = Object.freeze([
  Object.freeze({ maxTotal: 1, result: `Trace`, outcome: NON_HABITABLE_TRACE_OUTCOME }),
  Object.freeze({ maxTotal: 2, result: `No change`, outcome: null }),
  Object.freeze({ maxTotal: 5, result: `Corrosive`, outcome: NON_HABITABLE_CORROSIVE_OUTCOME }),
  Object.freeze({ maxTotal: Infinity, result: `Insidious`, outcome: NON_HABITABLE_INSIDIOUS_OUTCOME }),
]);

/** Table 41: Cold Atmospheres. */
export const COLD_ATMOSPHERE_TABLE_41 = Object.freeze([
  createNonHabitableTableRow(0, NON_HABITABLE_NONE_OUTCOME, NON_HABITABLE_NONE_OUTCOME),
  createNonHabitableTableRow(1, NON_HABITABLE_TRACE_OUTCOME, NON_HABITABLE_TRACE_OUTCOME),
  createNonHabitableTableRow(2, NON_HABITABLE_TRACE_OUTCOME, NON_HABITABLE_TRACE_OUTCOME),
  createNonHabitableTableRow(
    3,
    createExoticPressureOutcome(`3`, `Very Thin`, { irritantOn4Plus: true }),
    createExoticPressureOutcome(`3`, `Very Thin`, { irritantOn4Plus: true }),
  ),
  createNonHabitableTableRow(
    4,
    createExoticPressureOutcome(`4`, `Thin, Irritant`, { hasIrritant: true }),
    createExoticPressureOutcome(`4`, `Thin, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(5, createExoticPressureOutcome(`5`, `Thin`), createExoticPressureOutcome(`5`, `Thin`)),
  createNonHabitableTableRow(
    6,
    createExoticPressureOutcome(`6`, `Standard`),
    createExoticPressureOutcome(`6`, `Standard`),
  ),
  createNonHabitableTableRow(
    7,
    createExoticPressureOutcome(`7`, `Standard, Irritant`, { hasIrritant: true }),
    createExoticPressureOutcome(`7`, `Standard, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(8, createExoticPressureOutcome(`8`, `Dense`), createExoticPressureOutcome(`8`, `Dense`)),
  createNonHabitableTableRow(
    9,
    createExoticPressureOutcome(`9`, `Dense, Irritant`, { hasIrritant: true }),
    createExoticPressureOutcome(`9`, `Dense, Irritant`, { hasIrritant: true }),
  ),
  createNonHabitableTableRow(
    10,
    createExoticPressureOutcome(`A`, `Very Dense`, { irritantOn4Plus: true }),
    createExoticPressureOutcome(`A`, `Very Dense`, { irritantOn4Plus: true }),
  ),
  createNonHabitableTableRow(11, NON_HABITABLE_CORROSIVE_OUTCOME, NON_HABITABLE_CORROSIVE_OUTCOME),
  createNonHabitableTableRow(12, NON_HABITABLE_INSIDIOUS_OUTCOME, NON_HABITABLE_INSIDIOUS_OUTCOME),
  createNonHabitableTableRow(13, NON_HABITABLE_VERY_DENSE_OUTCOME, NON_HABITABLE_HELIUM_OUTCOME),
  createNonHabitableTableRow(14, NON_HABITABLE_CORROSIVE_OUTCOME, NON_HABITABLE_HYDROGEN_OUTCOME),
  createNonHabitableTableRow(15, NON_HABITABLE_UNUSUAL_OUTCOME, NON_HABITABLE_UNUSUAL_OUTCOME),
  createNonHabitableTableRow(16, NON_HABITABLE_HELIUM_OUTCOME, NON_HABITABLE_HYDROGEN_OUTCOME),
  createNonHabitableTableRow(Infinity, NON_HABITABLE_HYDROGEN_OUTCOME, NON_HABITABLE_HYDROGEN_OUTCOME),
]);

function lookupTableEntryByTotal(rows, total) {
  return rows.find((entry) => total <= entry.maxTotal) ?? rows[rows.length - 1];
}

/**
 * Calculate effective deviation from HZCO for worlds when HZCO is below 1.0.
 *
 * For HZCO values below 1.0, orbit increments between HZCO and Orbit 1.0 count
 * in tenths, then resume normal 1.0 increments beyond Orbit 1.0.
 *
 * @param {object} [options]
 * @param {number} options.orbit
 * @param {number} options.hzco
 * @returns {number|null}
 */
export function calculateEffectiveOrbitDeviationFromHzco({ orbit, hzco } = {}) {
  const orbitNum = Number(orbit);
  const hzcoNum = Number(hzco);
  if (!Number.isFinite(orbitNum) || !Number.isFinite(hzcoNum)) return null;

  let deviation = orbitNum - hzcoNum;
  if (hzcoNum < 1) {
    if (orbitNum < 1) deviation = (orbitNum - hzcoNum) * 10;
    else deviation = (1 - hzcoNum) * 10 + (orbitNum - 1);
  }

  return roundToPrecision(deviation, 3);
}

function lookupSpecialHotAtmosphereEntry(total) {
  return lookupTableEntryByTotal(SPECIAL_HOT_ATMOSPHERE_TABLE_40, total);
}

/**
 * Roll a non-habitable-zone atmosphere from Table 39 or 41.
 *
 * Total: 2D - 7 + Size
 * Hot columns:  effective deviation <= -1.01
 * Cold columns: effective deviation >=  1.01
 *
 * @param {object} [options]
 * @param {number} options.sizeValue
 * @param {number} options.orbit
 * @param {number} options.hzco
 * @param {Function} [options.rng=Math.random]
 * @returns {object}
 */
export function rollNonHabitableZoneAtmosphere({ sizeValue = 0, orbit, hzco, rng = Math.random } = {}) {
  const effectiveDeviation = calculateEffectiveOrbitDeviationFromHzco({ orbit, hzco });
  if (!Number.isFinite(effectiveDeviation)) return null;

  let zone = `habitable`;
  let tableId = null;
  let columnKey = null;
  let rows = null;

  if (effectiveDeviation <= -1.01) {
    zone = `hot`;
    tableId = 39;
    columnKey = effectiveDeviation <= -2.01 ? `hotOrOuterColumn` : `warmOrFarColumn`;
    rows = HOT_ATMOSPHERE_TABLE_39;
  } else if (effectiveDeviation >= 1.01) {
    zone = `cold`;
    tableId = 41;
    columnKey = effectiveDeviation >= 3.01 ? `warmOrFarColumn` : `hotOrOuterColumn`;
    rows = COLD_ATMOSPHERE_TABLE_41;
  }

  if (!rows) {
    return {
      effectiveDeviation,
      zone,
      tableId,
      columnKey,
      roll: null,
      total: null,
      atmosphereCode: null,
      label: null,
      subtypeCode: null,
      subtypeLabel: null,
      hasIrritant: false,
      irritantRoll: null,
      irritantAdded: false,
      specialRoll: null,
      baseOutcome: null,
    };
  }

  const roll = roll2d(rng);
  const total = roll - 7 + Number(sizeValue);
  const row = lookupTableEntryByTotal(rows, total);
  const baseOutcome = row[columnKey];

  let finalOutcome = baseOutcome;
  let irritantRoll = null;
  let irritantAdded = false;

  if (baseOutcome.irritantOn4Plus) {
    irritantRoll = roll1d(rng);
    if (irritantRoll >= 4) {
      finalOutcome = applyExoticIrritantOutcome(baseOutcome);
      irritantAdded = true;
    }
  }

  let specialRoll = null;
  if (tableId === 39 && effectiveDeviation <= -3.0 && baseOutcome.specialHotOrbitRollEligible) {
    const dm = baseOutcome.subtypeCode === `8` || baseOutcome.subtypeCode === `A` ? 1 : 0;
    const specialBaseRoll = roll1d(rng);
    const specialTotal = specialBaseRoll + dm;
    const specialEntry = lookupSpecialHotAtmosphereEntry(specialTotal);
    specialRoll = {
      roll: specialBaseRoll,
      dm,
      total: specialTotal,
      result: specialEntry.result,
    };

    if (specialEntry.outcome) finalOutcome = specialEntry.outcome;
  }

  return {
    effectiveDeviation,
    zone,
    tableId,
    columnKey,
    roll,
    total,
    atmosphereCode: finalOutcome.atmosphereCode,
    label: finalOutcome.label,
    subtypeCode: finalOutcome.subtypeCode,
    subtypeLabel: finalOutcome.subtypeLabel,
    hasIrritant: finalOutcome.hasIrritant,
    irritantRoll,
    irritantAdded,
    specialRoll,
    baseOutcome,
  };
}

function createGasMixRow(maxTotal, A, B, C) {
  return Object.freeze({ maxTotal, A, B, C });
}

/** Tables 42-48: non-habitable-zone atmosphere gas mixes. */
export const NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES = Object.freeze({
  42: Object.freeze({
    id: 42,
    label: `Boiling Atmosphere Gas Mix (HZCO -2.01-)`,
    rows: Object.freeze([
      createGasMixRow(-2, `Silicates (SO, SO2)`, `Silicates (SO, SO2)`, `Metal Vapours`),
      createGasMixRow(-1, `Sodium`, `Sodium`, `Silicates (SO, SO2)`),
      createGasMixRow(0, `Krypton`, `Krypton`, `Sodium`),
      createGasMixRow(1, `Argon`, `Argon`, `Sulphuric Acid`),
      createGasMixRow(2, `Sulphur Dioxide`, `Sulphur Dioxide`, `Hydrochloric Acid`),
      createGasMixRow(3, `Carbon Monoxide*`, `Hydrogen Cyanide`, `Chlorine`),
      createGasMixRow(4, `Carbon Dioxide`, `Formamide`, `Fluorine`),
      createGasMixRow(5, `Nitrogen`, `Carbon Dioxide`, `Formic Acid`),
      createGasMixRow(6, `Carbon Dioxide`, `Nitrogen`, `Water Vapour`),
      createGasMixRow(7, `Nitrogen`, `Carbon Dioxide`, `Nitrogen`),
      createGasMixRow(8, `Water Vapour`, `Sulphur Dioxide`, `Carbon Dioxide`),
      createGasMixRow(9, `Sulphur Dioxide`, `Water Vapour`, `Sulphur Dioxide`),
      createGasMixRow(10, `Nitrogen`, `Nitrogen`, `Hydrogen Cyanide`),
      createGasMixRow(11, `Methane`, `Ammonia`, `Ammonia`),
      createGasMixRow(12, `Water Vapour`, `Ammonia`, `Hydrofluoric Acid`),
      createGasMixRow(Infinity, `Methane`, `Methane`, `Methane`),
    ]),
  }),
  43: Object.freeze({
    id: 43,
    label: `Boiling Atmosphere Gas Mix (HZCO -1.01 to -2.0)`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Argon`, `Hydrochloric Acid`),
      createGasMixRow(2, `Argon`, `Sulphur Dioxide`, `Chlorine`),
      createGasMixRow(3, `Sulphur Dioxide`, `Hydrogen Cyanide`, `Fluorine`),
      createGasMixRow(4, `Ethane`, `Ethane`, `Formic Acid`),
      createGasMixRow(5, `Carbon Dioxide`, `Carbon Dioxide`, `Water Vapour`),
      createGasMixRow(6, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(7, `Carbon Dioxide`, `Carbon Dioxide`, `Carbon Dioxide`),
      createGasMixRow(8, `Nitrogen`, `Sulphur Dioxide`, `Sulphur Dioxide`),
      createGasMixRow(9, `Water Vapour`, `Water Vapour`, `Hydrogen Cyanide`),
      createGasMixRow(10, `Sulphur Dioxide`, `Nitrogen`, `Ammonia`),
      createGasMixRow(11, `Methane`, `Ammonia`, `Methane`),
      createGasMixRow(12, `Neon`, `Ammonia`, `Hydrofluoric Acid`),
      createGasMixRow(Infinity, `Methane`, `Methane`, `Methane`),
    ]),
  }),
  44: Object.freeze({
    id: 44,
    label: `Hot Atmosphere Gas Mix`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Argon`, `Hydrochloric Acid`),
      createGasMixRow(2, `Argon`, `Sulphur Dioxide`, `Chlorine`),
      createGasMixRow(3, `Sulphur Dioxide`, `Hydrogen Cyanide`, `Fluorine`),
      createGasMixRow(4, `Ethane`, `Ethane`, `Sulphur Dioxide`),
      createGasMixRow(5, `Carbon Dioxide`, `Carbon Dioxide`, `Carbon Monoxide*`),
      createGasMixRow(6, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(7, `Carbon Dioxide`, `Carbon Dioxide`, `Carbon Dioxide`),
      createGasMixRow(8, `Nitrogen`, `Sulphur Dioxide`, `Ethane`),
      createGasMixRow(9, `Carbon Monoxide*`, `Carbon Monoxide*`, `Hydrogen Cyanide`),
      createGasMixRow(10, `Sulphur Dioxide`, `Nitrogen`, `Ammonia`),
      createGasMixRow(11, `Methane`, `Ammonia`, `Methane`),
      createGasMixRow(12, `Neon`, `Ammonia`, `Hydrofluoric Acid`),
      createGasMixRow(Infinity, `Methane`, `Methane`, `Helium`),
    ]),
  }),
  45: Object.freeze({
    id: 45,
    label: `Temperate Atmosphere Gas Mix`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Krypton`, `Argon`),
      createGasMixRow(2, `Argon`, `Chlorine`, `Chlorine`),
      createGasMixRow(3, `Sulphur Dioxide`, `Argon`, `Fluorine`),
      createGasMixRow(4, `Nitrogen`, `Sulphur Dioxide`, `Sulphur Dioxide`),
      createGasMixRow(5, `Carbon Monoxide*`, `Carbon Monoxide*`, `Carbon Monoxide*`),
      createGasMixRow(6, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(7, `Carbon Dioxide`, `Carbon Dioxide`, `Carbon Dioxide`),
      createGasMixRow(8, `Ethane`, `Ethane`, `Ethane`),
      createGasMixRow(9, `Nitrogen`, `Ammonia`, `Ammonia`),
      createGasMixRow(10, `Neon`, `Ammonia`, `Ammonia`),
      createGasMixRow(11, `Methane`, `Methane`, `Methane`),
      createGasMixRow(12, `Methane`, `Helium`, `Helium`),
      createGasMixRow(Infinity, `Helium`, `Hydrogen`, `Hydrogen`),
    ]),
  }),
  46: Object.freeze({
    id: 46,
    label: `Cold Atmosphere Gas Mix`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Krypton`, `Argon`),
      createGasMixRow(2, `Argon`, `Chlorine`, `Chlorine`),
      createGasMixRow(3, `Ethane`, `Argon`, `Fluorine`),
      createGasMixRow(4, `Nitrogen`, `Nitrogen`, `Ethane`),
      createGasMixRow(5, `Carbon Monoxide*`, `Carbon Monoxide*`, `Carbon Monoxide*`),
      createGasMixRow(6, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(7, `Carbon Dioxide`, `Carbon Dioxide`, `Carbon Dioxide`),
      createGasMixRow(8, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(9, `Ethane`, `Ethane`, `Ethane`),
      createGasMixRow(10, `Methane`, `Ammonia`, `Ammonia`),
      createGasMixRow(11, `Neon`, `Methane`, `Methane`),
      createGasMixRow(12, `Methane`, `Helium`, `Helium`),
      createGasMixRow(Infinity, `Helium`, `Hydrogen`, `Hydrogen`),
    ]),
  }),
  47: Object.freeze({
    id: 47,
    label: `Frozen Atmosphere Gas Mix (HZCO +1.01 to +3.0)`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Krypton`, `Krypton`),
      createGasMixRow(2, `Argon`, `Argon`, `Argon`),
      createGasMixRow(3, `Argon`, `Argon`, `Fluorine`),
      createGasMixRow(4, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(5, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(6, `Carbon Monoxide*`, `Carbon Monoxide*`, `Carbon Monoxide*`),
      createGasMixRow(7, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(8, `Methane`, `Methane`, `Methane`),
      createGasMixRow(9, `Methane`, `Methane`, `Methane`),
      createGasMixRow(10, `Methane`, `Neon`, `Neon`),
      createGasMixRow(11, `Neon`, `Methane`, `Helium`),
      createGasMixRow(12, `Methane`, `Helium`, `Hydrogen`),
      createGasMixRow(Infinity, `Hydrogen`, `Hydrogen`, `Hydrogen`),
    ]),
  }),
  48: Object.freeze({
    id: 48,
    label: `Frozen Atmosphere Gas Mix (HZCO +3.00+)`,
    rows: Object.freeze([
      createGasMixRow(1, `Krypton`, `Krypton`, `Krypton`),
      createGasMixRow(2, `Argon`, `Argon`, `Argon`),
      createGasMixRow(3, `Argon`, `Argon`, `Fluorine`),
      createGasMixRow(4, `Methane`, `Methane`, `Methane`),
      createGasMixRow(5, `Carbon Monoxide*`, `Carbon Monoxide*`, `Carbon Monoxide*`),
      createGasMixRow(6, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(7, `Nitrogen`, `Nitrogen`, `Nitrogen`),
      createGasMixRow(8, `Neon`, `Neon`, `Neon`),
      createGasMixRow(9, `Helium`, `Helium`, `Helium`),
      createGasMixRow(10, `Helium`, `Helium`, `Helium`),
      createGasMixRow(11, `Hydrogen`, `Hydrogen`, `Hydrogen`),
      createGasMixRow(12, `Hydrogen`, `Hydrogen`, `Hydrogen`),
      createGasMixRow(Infinity, `Hydrogen`, `Hydrogen`, `Hydrogen`),
    ]),
  }),
});

/**
 * Select the non-habitable gas-mix table by mean temperature.
 *
 * @param {object} [options]
 * @param {number} options.meanTemperatureK
 * @returns {object|null}
 */
export function selectNonHabitableAtmosphereGasMixTable({ meanTemperatureK } = {}) {
  const temperature = Number(meanTemperatureK);
  if (!Number.isFinite(temperature)) return null;
  if (temperature >= 453) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[42];
  if (temperature >= 353) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[43];
  if (temperature >= 303) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[44];
  if (temperature >= 273) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[45];
  if (temperature >= 223) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[46];
  if (temperature >= 123) return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[47];
  return NON_HABITABLE_ATMOSPHERE_GAS_MIX_TABLES[48];
}

/**
 * Calculate die modifiers for Tables 42-48.
 *
 * @param {object} [options]
 * @param {number} options.tableId
 * @param {number} [options.meanTemperatureK]
 * @param {number} [options.sizeValue]
 * @returns {number}
 */
export function calculateNonHabitableAtmosphereGasMixDm({ tableId, meanTemperatureK, sizeValue } = {}) {
  const table = Number(tableId);
  const temperature = Number(meanTemperatureK);
  const size = Number(sizeValue);

  let dm = 0;

  if (table === 42) {
    if (temperature > 2000) dm -= 5;
    else if (temperature >= 700) dm -= 2;
    if (size >= 10) dm += 1;
    else if (size >= 1 && size <= 7) dm -= 1;
    return dm;
  }

  if (table === 43 || table === 44 || table === 46) {
    if (size >= 10) dm += 1;
    else if (size >= 1 && size <= 7) dm -= 1;
    return dm;
  }

  if (table === 47) {
    if (size >= 10) dm += 1;
    else if (size >= 1 && size <= 7) dm -= 2;
    return dm;
  }

  if (table === 48) {
    if (temperature < 70) dm += 5;
    else if (temperature >= 70 && temperature <= 100) dm += 3;
    if (size >= 10) dm += 1;
    else if (size >= 1 && size <= 7) dm -= 3;
    return dm;
  }

  return 0;
}

function normalizeNonHabitableGasMixAtmosphereCode(atmosphereCode) {
  const normalized = String(atmosphereCode ?? ``)
    .trim()
    .toUpperCase();
  if (normalized === `10`) return `A`;
  if (normalized === `11`) return `B`;
  if (normalized === `12`) return `C`;
  return normalized;
}

function resolveConditionalGasMixResult({ tableId, rawGas, hydrographicsCode, hasWater = true }) {
  if (rawGas !== `Carbon Monoxide*`) return rawGas;

  const hydrographics = String(hydrographicsCode ?? ``)
    .trim()
    .toUpperCase();
  const hasWaterWorld = hasWater && hydrographics !== `0`;
  if (!hasWaterWorld) return `Carbon Monoxide`;

  if (Number(tableId) === 47 || Number(tableId) === 48) return `Nitrogen`;
  return `Carbon Dioxide`;
}

/**
 * Roll a single gas result from the appropriate non-habitable-zone gas-mix table.
 *
 * @param {object} [options]
 * @param {number} options.meanTemperatureK
 * @param {string|number} options.atmosphereCode  A, B, or C.
 * @param {number} [options.sizeValue]
 * @param {string|number} [options.hydrographicsCode]
 * @param {boolean} [options.hasWater=true]
 * @param {Function} [options.rng=Math.random]
 * @returns {object|null}
 */
export function rollNonHabitableAtmosphereGas({
  meanTemperatureK,
  atmosphereCode,
  sizeValue,
  hydrographicsCode,
  hasWater = true,
  rng = Math.random,
} = {}) {
  const table = selectNonHabitableAtmosphereGasMixTable({ meanTemperatureK });
  const normalizedAtmosphereCode = normalizeNonHabitableGasMixAtmosphereCode(atmosphereCode);
  if (!table || ![`A`, `B`, `C`].includes(normalizedAtmosphereCode)) return null;

  const dm = calculateNonHabitableAtmosphereGasMixDm({
    tableId: table.id,
    meanTemperatureK,
    sizeValue,
  });
  const roll = roll2d(rng);
  const total = roll + dm;
  const row = lookupTableEntryByTotal(table.rows, total);
  const rawGas = row[normalizedAtmosphereCode];
  const gas = resolveConditionalGasMixResult({
    tableId: table.id,
    rawGas,
    hydrographicsCode,
    hasWater,
  });

  return {
    tableId: table.id,
    tableLabel: table.label,
    roll,
    dm,
    total,
    atmosphereCode: normalizedAtmosphereCode,
    rawGas,
    gas,
  };
}

/**
 * Roll multiple gas results for a non-habitable-zone atmosphere.
 *
 * @param {object} [options]
 * @param {number} [options.count=2]
 * @returns {Array}
 */
export function rollNonHabitableAtmosphereGasMixes({ count = 2, ...options } = {}) {
  const results = [];
  const limit = Math.max(0, Math.floor(Number(count) || 0));
  for (let i = 0; i < limit; i++) {
    const result = rollNonHabitableAtmosphereGas(options);
    if (result) results.push(result);
  }
  return results;
}

/**
 * Roll atmosphere using orbit-aware dispatch.
 *
 * Inside the habitable zone this uses the standard 2D-7+Size atmosphere roll.
 * Outside the habitable zone it uses Tables 39/41 via rollNonHabitableZoneAtmosphere.
 *
 * @param {object} [options]
 * @param {number} [options.sizeValue]
 * @param {number} [options.orbit]
 * @param {number} [options.hzco]
 * @param {number} [options.gravity]
 * @param {boolean} [options.useSizeThinAtmosphereVariant=false]
 * @param {boolean} [options.useGravityAtmosphereVariant=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   method: "habitable-zone"|"non-habitable-zone",
 *   zone: string,
 *   effectiveDeviation: number|null,
 *   roll: number|null,
 *   atmosphereCode: string|number|null,
 *   nonHabitableZoneAtmosphere: ReturnType<typeof rollNonHabitableZoneAtmosphere>|null,
 * }}
 */
export function rollWorldAtmosphereForOrbit({
  sizeValue,
  orbit,
  hzco,
  gravity,
  useSizeThinAtmosphereVariant = false,
  useGravityAtmosphereVariant = false,
  rng = Math.random,
} = {}) {
  const effectiveDeviation = calculateEffectiveOrbitDeviationFromHzco({ orbit, hzco });
  const shouldUseNonHabitableTables =
    Number.isFinite(effectiveDeviation) && (effectiveDeviation <= -1.01 || effectiveDeviation >= 1.01);

  if (shouldUseNonHabitableTables) {
    const result = rollNonHabitableZoneAtmosphere({
      sizeValue,
      orbit,
      hzco,
      rng,
    });

    return {
      method: "non-habitable-zone",
      zone: result?.zone ?? "unknown",
      effectiveDeviation,
      roll: result?.roll ?? null,
      atmosphereCode: result?.atmosphereCode ?? null,
      nonHabitableZoneAtmosphere: result,
    };
  }

  const result = rollWorldAtmosphereCode({
    size: sizeValue,
    gravity,
    useSizeThinAtmosphereVariant,
    useGravityAtmosphereVariant,
    rng,
  });

  return {
    method: "habitable-zone",
    zone: "habitable",
    effectiveDeviation,
    roll: result.roll,
    atmosphereCode: result.atmosphereCode,
    nonHabitableZoneAtmosphere: null,
  };
}

export const ATMOSPHERE_GAS_SYMBOLS = Object.freeze({
  Argon: "Ar",
  Ammonia: "NH3",
  Chlorine: "Cl2",
  "Carbon Dioxide": "CO2",
  "Carbon Monoxide": "CO",
  Ethane: "C2H6",
  Fluorine: "F2",
  Formamide: "CH3NO",
  "Formic Acid": "CH2O2",
  Helium: "He",
  Hydrogen: "H2",
  "Hydrochloric Acid": "HCl",
  "Hydrogen Cyanide": "HCN",
  "Hydrofluoric Acid": "HF",
  Krypton: "Kr",
  Methane: "CH4",
  "Metal Vapours": "MVs",
  Neon: "Ne",
  Nitrogen: "N2",
  Sodium: "Na",
  "Silicates (SO, SO2)": "Sil",
  "Sulphur Dioxide": "SO2",
  "Sulphuric Acid": "H2SO4",
  "Water Vapour": "H2O",
});

/**
 * Convert a gas name into a compact profile symbol where one is known.
 *
 * @param {string} gas
 * @returns {string}
 */
export function formatAtmosphereGasSymbol(gas) {
  return ATMOSPHERE_GAS_SYMBOLS[String(gas ?? "").trim()] ?? String(gas ?? "").trim();
}

/**
 * Allocate atmosphere gas percentages from a sequence of gas-roll results.
 *
 * Each roll claims a percentage of the remaining atmosphere.
 * Base share is (1D+4)*10%, or (1D+3)*10% when disallowing 100% results.
 * Optional variance applies (1D10 - 5) percentage points.
 * Duplicate gases accumulate into the same component.
 *
 * @param {object} [options]
 * @param {Array<{gas: string, rawGas?: string}>} [options.gasResults=[]]
 * @param {boolean} [options.disallowHundredPercent=false]
 * @param {boolean} [options.applyVariance=true]
 * @param {number} [options.stopThresholdPercent=95]
 * @param {number} [options.precision=1]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   components: Array<{ gas: string, symbol: string, percent: number }>,
 *   allocations: Array<object>,
 *   accountedPercent: number,
 *   remainingPercent: number,
 * }}
 */
export function allocateAtmosphereGasMixPercentages({
  gasResults = [],
  disallowHundredPercent = false,
  applyVariance = true,
  stopThresholdPercent = 95,
  precision = 1,
  rng = Math.random,
} = {}) {
  const resolvedPrecision = Number.isInteger(precision) && precision >= 0 ? precision : 1;
  const allocations = [];
  const componentMap = new Map();
  let remainingPercent = 100;

  for (const result of gasResults) {
    if (remainingPercent <= 0) break;
    if (100 - remainingPercent >= stopThresholdPercent) break;

    const dieRoll = roll1d(rng);
    const basePercent = (dieRoll + (disallowHundredPercent ? 3 : 4)) * 10;
    const varianceRoll = applyVariance ? roll1d10(rng) : null;
    const variancePercent = varianceRoll === null ? 0 : varianceRoll - 5;
    const sharePercentOfRemainder = Math.max(0, Math.min(100, basePercent + variancePercent));
    const allocatedPercent = roundToPrecision((remainingPercent * sharePercentOfRemainder) / 100, resolvedPrecision);
    const gas = String(result?.gas ?? "").trim();
    const symbol = formatAtmosphereGasSymbol(gas);

    allocations.push({
      gas,
      symbol,
      dieRoll,
      basePercent,
      varianceRoll,
      variancePercent,
      sharePercentOfRemainder,
      allocatedPercent,
    });

    componentMap.set(gas, roundToPrecision((componentMap.get(gas) ?? 0) + allocatedPercent, resolvedPrecision));
    remainingPercent = roundToPrecision(Math.max(0, remainingPercent - allocatedPercent), resolvedPrecision);
  }

  const components = [...componentMap.entries()]
    .map(([gas, percent]) => ({ gas, symbol: formatAtmosphereGasSymbol(gas), percent }))
    .sort((left, right) => right.percent - left.percent || left.gas.localeCompare(right.gas));

  return {
    components,
    allocations,
    accountedPercent: roundToPrecision(100 - remainingPercent, resolvedPrecision),
    remainingPercent,
  };
}

function formatGasMixPercent(value, precision = 0) {
  if (!Number.isFinite(value)) return `?`;
  if (precision > 0) return Number(value).toFixed(precision);
  return String(Math.round(Number(value))).padStart(2, `0`);
}

/**
 * Format a gas-mix atmosphere profile, e.g. B-StD:CO2-48:NH3-47:H2O-03.
 *
 * @param {object} [options]
 * @param {string|number} options.atmosphereCode
 * @param {string} [options.pressureShorthand=""]
 * @param {string} [options.subtypeCode=""]
 * @param {Array<{gas?: string, symbol?: string, percent: number}>} [options.components=[]]
 * @param {number} [options.precision=0]
 * @returns {string}
 */
export function formatAtmosphereGasMixProfile({
  atmosphereCode,
  pressureShorthand = "",
  subtypeCode = "",
  components = [],
  precision = 0,
} = {}) {
  const code =
    normalizeAtmosphereCodeInput(atmosphereCode) ??
    String(atmosphereCode ?? "?")
      .trim()
      .toUpperCase();
  const prefix = `${code}-${pressureShorthand}${subtypeCode}`;
  const suffix = components
    .filter((component) => Number.isFinite(component?.percent) && Number(component.percent) > 0)
    .map((component) => {
      const symbol = String(component.symbol ?? formatAtmosphereGasSymbol(component.gas)).trim();
      return `${symbol}-${formatGasMixPercent(component.percent, precision)}`;
    })
    .join(`:`);
  return suffix ? `${prefix}:${suffix}` : prefix;
}

/**
 * Roll atmosphere code for a candidate world using T5 rules.
 *
 * Formula: 2D âˆ’ 7 + Size, clamped to 0â€“15.
 * Worlds of Size 0, 1, or S automatically receive atmosphere 0 (no roll needed).
 *
 * Optional variants:
 * - Size variant: DM-2 for size 2-4.
 * - Gravity variant (alternative): DM-2 below 0.4G, DM-1 for 0.4G-0.5G.
 *
 * @param {object} options
 * @param {number|string} options.size  World size value (integer 0-15) or size code.
 * @param {string|number} [options.sizeCode] Optional explicit size code override.
 * @param {number} [options.gravity] Optional world gravity for gravity-based variant.
 * @param {boolean} [options.useSizeThinAtmosphereVariant=false]
 * @param {boolean} [options.useGravityAtmosphereVariant=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number|null, atmosphereCode: number }}
 */
export function rollWorldAtmosphereCode({
  size,
  sizeCode,
  gravity,
  useSizeThinAtmosphereVariant = false,
  useGravityAtmosphereVariant = false,
  rng = Math.random,
} = {}) {
  const resolvedSizeCode = normalizeBasicWorldSizeCode(sizeCode ?? size);
  const explicitSize = Number(size);
  const sizeFromCode = sizeValueFromCode(resolvedSizeCode);
  const sizeVal = Math.max(
    0,
    Math.floor(Number.isFinite(explicitSize) ? explicitSize : Number.isFinite(sizeFromCode) ? sizeFromCode : 0),
  );

  if (resolvedSizeCode === "S" || sizeVal <= 1) return { roll: null, atmosphereCode: 0 };

  const dmResult = calculateAtmosphereVariantDm({
    size: sizeVal,
    gravity,
    useSizeThinAtmosphereVariant,
    useGravityAtmosphereVariant,
  });

  const roll = roll2d(rng);
  return {
    roll,
    atmosphereCode: Math.max(0, Math.min(15, roll - 7 + sizeVal + dmResult.dm)),
  };
}

/**
 * Roll hydrographics code for a candidate world using T5 rules.
 *
 * Formula: 2D âˆ’ 7 + Atmosphere, with DMs:
 *   - Atmosphere 0 or 1 â†’ hydrographics auto 0 (no roll).
 *   - Atmosphere A (10) or higher â†’ DM âˆ’4.
 *   - Optional temperature DM: Hot (10-11) DM-2, Boiling (12+) DM-6.
 *
 * @param {object} options
 * @param {number} options.atmosphereCode  Atmosphere code (0â€“15).
 * @param {number} [options.temperatureModifiedRoll]
 * @param {boolean} [options.forceBoilingForHydrographics=false]
 * @param {string|number} [options.equivalentDensityAtmosphereCode] Optional subtype-equivalent density code used as the roll base.
 * @param {string|number} [options.unusualSubtypeCode] Optional unusual-atmosphere subtype, used for Panthalassic temperature-DM exemption.
 * @param {boolean} [options.ignoreTemperatureDm=false] Ignore hot/boiling hydrographics temperature DMs.
 * @param {number} [options.additionalDm=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number|null, hydrographicsCode: number }}
 */
export function rollWorldHydrographicsCode({
  atmosphereCode,
  temperatureModifiedRoll,
  forceBoilingForHydrographics = false,
  equivalentDensityAtmosphereCode,
  unusualSubtypeCode,
  ignoreTemperatureDm = false,
  additionalDm = 0,
  rng = Math.random,
} = {}) {
  const normalizedAtmosphereCode = normalizeAtmosphereCodeInput(atmosphereCode);
  const originalAtmo =
    normalizedAtmosphereCode !== null ? fromEHex(normalizedAtmosphereCode) : Math.floor(Number(atmosphereCode) || 0);
  const normalizedEquivalentDensityCode = normalizeAtmosphereCodeInput(equivalentDensityAtmosphereCode);
  const baseAtmo =
    normalizedEquivalentDensityCode !== null
      ? fromEHex(normalizedEquivalentDensityCode)
      : Math.max(0, Math.floor(Number.isFinite(originalAtmo) ? originalAtmo : 0));

  if (baseAtmo <= 1) return { roll: null, hydrographicsCode: 0 };

  const ignoreTemperatureDmResolved =
    Boolean(ignoreTemperatureDm) ||
    normalizedAtmosphereCode === "D" ||
    (normalizedAtmosphereCode === "F" &&
      String(unusualSubtypeCode ?? "")
        .trim()
        .toUpperCase() === "7");

  let temperatureDm = 0;
  if (ignoreTemperatureDmResolved) {
    temperatureDm = 0;
  } else if (forceBoilingForHydrographics) {
    temperatureDm = -6;
  } else if (Number.isFinite(temperatureModifiedRoll) && Number(temperatureModifiedRoll) >= 12) {
    temperatureDm = -6;
  } else if (Number.isFinite(temperatureModifiedRoll) && Number(temperatureModifiedRoll) >= 10) {
    temperatureDm = -2;
  }

  const dm = (originalAtmo >= 10 ? -4 : 0) + temperatureDm + (Number.isFinite(additionalDm) ? Number(additionalDm) : 0);
  const roll = roll2d(rng);
  return { roll, hydrographicsCode: Math.max(0, Math.min(10, roll - 7 + baseAtmo + dm)) };
}

// â”€â”€ Hydrographics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Table 49: Hydrographics Ranges. */
export const HYDROGRAPHICS_RANGE_TABLE_49 = Object.freeze([
  Object.freeze({ code: 0, codeLabel: "0", minPercent: 0, maxPercent: 5 }),
  Object.freeze({ code: 1, codeLabel: "1", minPercent: 6, maxPercent: 15 }),
  Object.freeze({ code: 2, codeLabel: "2", minPercent: 16, maxPercent: 25 }),
  Object.freeze({ code: 3, codeLabel: "3", minPercent: 26, maxPercent: 35 }),
  Object.freeze({ code: 4, codeLabel: "4", minPercent: 36, maxPercent: 45 }),
  Object.freeze({ code: 5, codeLabel: "5", minPercent: 46, maxPercent: 55 }),
  Object.freeze({ code: 6, codeLabel: "6", minPercent: 56, maxPercent: 65 }),
  Object.freeze({ code: 7, codeLabel: "7", minPercent: 66, maxPercent: 75 }),
  Object.freeze({ code: 8, codeLabel: "8", minPercent: 76, maxPercent: 85 }),
  Object.freeze({ code: 9, codeLabel: "9", minPercent: 86, maxPercent: 95 }),
  Object.freeze({ code: 10, codeLabel: "A", minPercent: 96, maxPercent: 100 }),
]);

function resolveHydrographicsCodeValue(hydrographicsCode) {
  const normalized = normalizeAtmosphereCodeInput(hydrographicsCode);
  if (normalized !== null) {
    const value = fromEHex(normalized);
    return Number.isFinite(value) ? value : null;
  }

  const numeric = Math.floor(Number(hydrographicsCode));
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Lookup the percentage range for a hydrographics code.
 *
 * @param {string|number} hydrographicsCode
 * @returns {{ code: number, codeLabel: string, minPercent: number, maxPercent: number }|null}
 */
export function lookupHydrographicsRange(hydrographicsCode) {
  const value = resolveHydrographicsCodeValue(hydrographicsCode);
  if (!Number.isFinite(value)) return null;
  return HYDROGRAPHICS_RANGE_TABLE_49.find((entry) => entry.code === value) ?? null;
}

/**
 * Roll a more precise hydrographics percentage from Table 49.
 *
 * Most codes use the bottom of the range plus 1D10, clamped to the range.
 * Code 0 uses -4 + 1D10 clamped to 0â€“5.
 * Code A uses 96 + 1D10 clamped to 100, and Size A+ worlds are always 100%.
 *
 * @param {object} [options]
 * @param {string|number} options.hydrographicsCode
 * @param {number} [options.sizeValue]
 * @param {number} [options.precision=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ hydrographicsCode: number, codeLabel: string, d10Roll: number, hydrographicsPercent: number }|null}
 */
export function rollHydrographicsPercentage({ hydrographicsCode, sizeValue, precision = 0, rng = Math.random } = {}) {
  const range = lookupHydrographicsRange(hydrographicsCode);
  if (!range) return null;

  const d10Roll = roll1d10(rng);
  let hydrographicsPercent;

  if (range.code === 0) {
    hydrographicsPercent = Math.max(0, Math.min(5, -4 + d10Roll));
  } else if (range.code === 10) {
    hydrographicsPercent = Number(sizeValue) >= 10 ? 100 : Math.min(100, 96 + d10Roll);
  } else {
    hydrographicsPercent = Math.min(range.maxPercent, range.minPercent + d10Roll);
  }

  return {
    hydrographicsCode: range.code,
    codeLabel: range.codeLabel,
    d10Roll,
    hydrographicsPercent: roundToPrecision(hydrographicsPercent, precision),
  };
}

/** Table 50: Surface Distribution. */
export const SURFACE_DISTRIBUTION_TABLE_50 = Object.freeze([
  Object.freeze({
    code: "0",
    total: 0,
    description: "Extremely Dispersed",
    effect: "Many minor and small bodies: no major bodies",
    majorCoveragePercentRange: [0, 0],
  }),
  Object.freeze({
    code: "1",
    total: 1,
    description: "Very Dispersed",
    effect: "Mostly minor bodies: 5â€“10% of the surface coverage is in major bodies",
    majorCoveragePercentRange: [5, 10],
  }),
  Object.freeze({
    code: "2",
    total: 2,
    description: "Dispersed",
    effect: "Mostly minor bodies: 10â€“20% of the surface coverage is in major bodies",
    majorCoveragePercentRange: [10, 20],
  }),
  Object.freeze({
    code: "3",
    total: 3,
    description: "Scattered",
    effect: "Roughly 20â€“30% or less of the surface coverage is in major bodies",
    majorCoveragePercentRange: [20, 30],
  }),
  Object.freeze({
    code: "4",
    total: 4,
    description: "Slightly Scattered",
    effect: "Roughly 30â€“40% or less of the surface coverage is in major bodies",
    majorCoveragePercentRange: [30, 40],
  }),
  Object.freeze({
    code: "5",
    total: 5,
    description: "Mixed",
    effect: "Mix of major and minor bodies: roughly 40â€“60% of body coverage is major",
    majorCoveragePercentRange: [40, 60],
  }),
  Object.freeze({
    code: "6",
    total: 6,
    description: "Slightly Skewed",
    effect: "Roughly 60â€“70% of surface coverage is in major bodies",
    majorCoveragePercentRange: [60, 70],
  }),
  Object.freeze({
    code: "7",
    total: 7,
    description: "Skewed",
    effect: "Roughly 70â€“80% of surface coverage is in major bodies",
    majorCoveragePercentRange: [70, 80],
  }),
  Object.freeze({
    code: "8",
    total: 8,
    description: "Concentrated",
    effect: "Mostly major bodies: 80â€“90% of the surface coverage is in major bodies",
    majorCoveragePercentRange: [80, 90],
  }),
  Object.freeze({
    code: "9",
    total: 9,
    description: "Very Concentrated",
    effect: "Single very large major body: 90â€“95% of body coverage is in one body",
    majorCoveragePercentRange: [90, 95],
  }),
  Object.freeze({
    code: "A",
    total: 10,
    description: "Extremely Concentrated",
    effect: "Single very large major body: 95% or more of body coverage is in one body",
    majorCoveragePercentRange: [95, 100],
  }),
]);

/**
 * Determine whether the world is fundamentally ocean- or land-dominated.
 *
 * @param {object} [options]
 * @param {string|number} options.hydrographicsCode
 * @param {number} [options.hydrographicsPercent]
 * @param {boolean} [options.allowUnexpectedDistribution=false]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ fundamentalGeography: "ocean"|"land", roll: number|null, dm: number, adjustedRoll: number|null }}
 */
export function determineHydrographicsFundamentalGeography({
  hydrographicsCode,
  hydrographicsPercent,
  allowUnexpectedDistribution = false,
  rng = Math.random,
} = {}) {
  const codeValue = resolveHydrographicsCodeValue(hydrographicsCode);
  const percent = Number(hydrographicsPercent);
  const exactFifty = Number.isFinite(percent) && percent === 50;

  if (!allowUnexpectedDistribution && codeValue >= 6 && codeValue !== 5 && !exactFifty) {
    return { fundamentalGeography: "ocean", roll: null, dm: 0, adjustedRoll: null };
  }

  if (!allowUnexpectedDistribution && codeValue <= 4 && !exactFifty) {
    return { fundamentalGeography: "land", roll: null, dm: 0, adjustedRoll: null };
  }

  const roll = roll1d(rng);
  const dm = allowUnexpectedDistribution && Number.isFinite(codeValue) ? 5 - codeValue : 0;
  const adjustedRoll = roll + dm;
  return {
    fundamentalGeography: adjustedRoll <= 3 ? "ocean" : "land",
    roll,
    dm,
    adjustedRoll,
  };
}

/**
 * Roll Table 50 surface distribution.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, total: number, code: string, description: string, effect: string, majorCoveragePercentRange: [number, number] }}
 */
export function rollSurfaceDistribution({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const total = roll - 2;
  const entry = SURFACE_DISTRIBUTION_TABLE_50.find((row) => row.total === total) ?? SURFACE_DISTRIBUTION_TABLE_50[0];
  return {
    roll,
    total,
    code: entry.code,
    description: entry.description,
    effect: entry.effect,
    majorCoveragePercentRange: entry.majorCoveragePercentRange,
  };
}

/** Table 51: Possible Exotic Liquids (Fluidic Worlds). */
export const POSSIBLE_EXOTIC_LIQUIDS_TABLE_51 = Object.freeze([
  Object.freeze({ molecule: "Fluorine", code: "F2", boilingPointK: 85, meltingPointK: 53, relativeAbundance: 2 }),
  Object.freeze({ molecule: "Oxygen", code: "O2", boilingPointK: 90, meltingPointK: 54, relativeAbundance: 50 }),
  Object.freeze({ molecule: "Methane", code: "CH4", boilingPointK: 113, meltingPointK: 91, relativeAbundance: 70 }),
  Object.freeze({ molecule: "Ethane", code: "C2H6", boilingPointK: 184, meltingPointK: 90, relativeAbundance: 70 }),
  Object.freeze({ molecule: "Chlorine", code: "Cl2", boilingPointK: 239, meltingPointK: 171, relativeAbundance: 1 }),
  Object.freeze({ molecule: "Ammonia", code: "NH3", boilingPointK: 240, meltingPointK: 195, relativeAbundance: 30 }),
  Object.freeze({
    molecule: "Sulphur Dioxide",
    code: "SO2",
    boilingPointK: 263,
    meltingPointK: 201,
    relativeAbundance: 20,
  }),
  Object.freeze({
    molecule: "Hydrofluoric Acid",
    code: "HF",
    boilingPointK: 293,
    meltingPointK: 190,
    relativeAbundance: 2,
  }),
  Object.freeze({
    molecule: "Hydrogen Cyanide",
    code: "HCN",
    boilingPointK: 299,
    meltingPointK: 260,
    relativeAbundance: 30,
  }),
  Object.freeze({
    molecule: "Hydrochloric Acid",
    code: "HCl",
    boilingPointK: 321,
    meltingPointK: 247,
    relativeAbundance: 1,
  }),
  Object.freeze({ molecule: "Water", code: "H2O", boilingPointK: 373, meltingPointK: 273, relativeAbundance: 100 }),
  Object.freeze({
    molecule: "Formic Acid",
    code: "CH2O2",
    boilingPointK: 374,
    meltingPointK: 281,
    relativeAbundance: 15,
  }),
  Object.freeze({
    molecule: "Formamide",
    code: "CH3NO",
    boilingPointK: 483,
    meltingPointK: 275,
    relativeAbundance: 15,
  }),
  Object.freeze({
    molecule: "Carbonic Acid",
    code: "H2CO3",
    boilingPointK: 607,
    meltingPointK: 193,
    relativeAbundance: 20,
  }),
  Object.freeze({
    molecule: "Sulphuric Acid",
    code: "H2SO4",
    boilingPointK: 718,
    meltingPointK: 388,
    relativeAbundance: 20,
  }),
]);

/**
 * Return exotic liquid candidates that are liquid at the given mean temperature.
 *
 * @param {object} [options]
 * @param {number} options.meanTemperatureK
 * @param {number} [options.minLiquidRangeK=20]
 * @param {boolean} [options.includeMagma=true]
 * @returns {Array<object>}
 */
export function getPossibleExoticLiquids({ meanTemperatureK, minLiquidRangeK = 20, includeMagma = true } = {}) {
  const temperature = Number(meanTemperatureK);
  if (!Number.isFinite(temperature)) return [];

  const liquids = POSSIBLE_EXOTIC_LIQUIDS_TABLE_51.filter((entry) => {
    const range = entry.boilingPointK - entry.meltingPointK;
    return range >= minLiquidRangeK && temperature > entry.meltingPointK && temperature < entry.boilingPointK;
  });

  if (includeMagma && temperature > 1000) {
    return [
      Object.freeze({
        molecule: "Magma",
        code: "Magma",
        boilingPointK: null,
        meltingPointK: 1000,
        relativeAbundance: 1,
      }),
      ...liquids,
    ];
  }

  return liquids;
}

function getHydrographicsLiquidWeight(liquid, atmosphereGasMixes) {
  const gasNames = new Set(
    (Array.isArray(atmosphereGasMixes) ? atmosphereGasMixes : [])
      .map((entry) => String(entry?.gas ?? entry?.molecule ?? "").trim())
      .filter(Boolean),
  );

  const aliasMatches = Object.freeze({
    Water: ["Water Vapour"],
    "Carbonic Acid": ["Carbon Dioxide"],
  });

  const aliases = aliasMatches[liquid.molecule] ?? [];
  const hasMatch = gasNames.has(liquid.molecule) || aliases.some((alias) => gasNames.has(alias));
  return liquid.relativeAbundance * (hasMatch ? 2 : 1);
}

/**
 * Select likely hydrographic liquids weighted by relative abundance and gas-mix resemblance.
 *
 * @param {object} [options]
 * @param {number} options.meanTemperatureK
 * @param {Array<object>} [options.atmosphereGasMixes=[]]
 * @param {number} [options.count=2]
 * @param {boolean} [options.includeMagma=true]
 * @param {Function} [options.rng=Math.random]
 * @returns {Array<object>}
 */
export function selectHydrographicsLiquids({
  meanTemperatureK,
  atmosphereGasMixes = [],
  count = 2,
  includeMagma = true,
  rng = Math.random,
} = {}) {
  const candidates = [...getPossibleExoticLiquids({ meanTemperatureK, includeMagma })];
  if (candidates.length === 0) return [];

  const selected = [];
  const remaining = [...candidates];
  const limit = Math.min(Math.max(0, Math.floor(Number(count) || 0)), remaining.length);

  for (let i = 0; i < limit; i++) {
    const totalWeight = remaining.reduce(
      (sum, liquid) => sum + getHydrographicsLiquidWeight(liquid, atmosphereGasMixes),
      0,
    );
    let pick = rng() * totalWeight;
    let idx = 0;
    while (idx < remaining.length - 1) {
      const weight = getHydrographicsLiquidWeight(remaining[idx], atmosphereGasMixes);
      if (pick < weight) break;
      pick -= weight;
      idx++;
    }
    selected.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return selected;
}

function formatHydrographicsPercentValue(value, precision = 0) {
  if (!Number.isFinite(value)) return "??";
  if (precision > 0) return Number(value).toFixed(precision);
  return String(Math.round(Number(value))).padStart(2, "0");
}

function estimateRepresentativeAtmosphericPressureBar(atmosphereCode) {
  const info = lookupAtmosphereCodeInfo(atmosphereCode);
  if (!info) return null;
  if (String(info.code) === "0") return 0;

  const range = info.pressureRangeBar;
  if (Array.isArray(range) && range.length === 2) {
    const minBar = Number(range[0]);
    const maxBar = Number(range[1]);
    if (Number.isFinite(minBar) && Number.isFinite(maxBar)) {
      return (minBar + maxBar) / 2;
    }
  }

  // Variable-range atmospheres do not have a fixed pressure span; use 1 bar as a neutral model input.
  return 1;
}

function resolveCandidateAlbedoWorldType({ primaryWorldType, isMoon, temperatureModifiedRoll, orbit, hzco } = {}) {
  if (!isMoon && String(primaryWorldType) === "gasGiant") {
    return ALBEDO_WORLD_TYPES.GAS_GIANT;
  }

  if (Number.isFinite(temperatureModifiedRoll) && Number(temperatureModifiedRoll) <= 4) {
    const orbitValue = Number(orbit);
    const hzcoValue = Number(hzco);
    if (Number.isFinite(orbitValue) && Number.isFinite(hzcoValue) && orbitValue > hzcoValue) {
      return ALBEDO_WORLD_TYPES.ICY_TERRESTRIAL_FAR;
    }
    return ALBEDO_WORLD_TYPES.ICY_TERRESTRIAL_NEAR;
  }

  return ALBEDO_WORLD_TYPES.ROCKY_TERRESTRIAL;
}

function buildCandidateMeanTemperatureProfile({
  primaryWorldType,
  isMoon,
  atmosphereCode,
  hydrographicsCode,
  temperatureRawRoll,
  temperatureModifiedRoll,
  orbit,
  hzco,
  fallbackMeanTemperatureK,
} = {}) {
  const climateModelRng = () => 0.5;

  const basicMeanTemperatureRoll = calculateBasicMeanTemperatureModifiedRoll({
    rawRoll: temperatureRawRoll,
    atmosphereCode,
    orbitNumber: orbit,
    hzco,
  });
  const basicMeanTemperature = lookupBasicMeanTemperature(basicMeanTemperatureRoll.modifiedRoll, {
    rng: climateModelRng,
  });

  const albedoWorldType = resolveCandidateAlbedoWorldType({
    primaryWorldType,
    isMoon,
    temperatureModifiedRoll,
    orbit,
    hzco,
  });
  const albedoModel = rollWorldAlbedo({
    worldType: albedoWorldType,
    atmosphereCode,
    hydrographicsCode,
    rng: climateModelRng,
  });

  const atmosphericPressureBar = estimateRepresentativeAtmosphericPressureBar(atmosphereCode);
  const greenhouseModel = Number.isFinite(atmosphericPressureBar)
    ? calculateEffectiveGreenhouseFactor({
        atmosphericPressureBar,
        atmosphereCode,
        rng: climateModelRng,
      })
    : null;

  const derivedLuminosity = Number.isFinite(hzco) && Number(hzco) > 0 ? Number(hzco) ** 2 : null;
  const distanceAu = Number(orbit);

  const meanTemperature =
    Number.isFinite(derivedLuminosity) &&
    Number.isFinite(distanceAu) &&
    distanceAu > 0 &&
    Number.isFinite(albedoModel?.albedo) &&
    Number.isFinite(greenhouseModel?.effectiveGreenhouseFactor)
      ? calculateMeanTemperature({
          luminosity: derivedLuminosity,
          distanceAu,
          albedo: albedoModel.albedo,
          greenhouseFactor: greenhouseModel.effectiveGreenhouseFactor,
        })
      : null;

  const meanTemperatureK = Number.isFinite(meanTemperature?.kelvin)
    ? Number(meanTemperature.kelvin)
    : Number.isFinite(basicMeanTemperature?.kelvin)
      ? Number(basicMeanTemperature.kelvin)
      : Number.isFinite(fallbackMeanTemperatureK)
        ? Number(fallbackMeanTemperatureK)
        : null;

  return {
    basicMeanTemperatureRoll,
    basicMeanTemperature,
    albedoModel,
    greenhouseModel,
    meanTemperature,
    meanTemperatureK,
    meanTemperatureModel: {
      luminosity: derivedLuminosity,
      distanceAu,
      atmosphericPressureBar,
      albedoWorldType,
      luminositySource: "hzco_squared",
    },
  };
}

function isOneToOneSunLock(lockType) {
  const normalized = String(lockType ?? "")
    .trim()
    .toUpperCase();
  return normalized === "LOCK_1_1" || normalized === "1:1" || normalized === "ONE_TO_ONE";
}

function buildCandidateHighLowTemperatureProfile({
  axialTiltDegrees,
  yearLengthStandardYears,
  solarDayHours,
  isOneToOneSunLockToStars,
  hydrographicsCode,
  surfaceDistributionCode,
  atmosphericPressureBar,
  luminosity,
  distanceAu,
  eccentricity,
  albedo,
  greenhouseFactor,
} = {}) {
  const resolvedAxialTilt = Number.isFinite(axialTiltDegrees) ? Number(axialTiltDegrees) : 0;
  const resolvedYearLength =
    Number.isFinite(yearLengthStandardYears) && Number(yearLengthStandardYears) > 0
      ? Number(yearLengthStandardYears)
      : 1;
  const resolvedSolarDay = Number.isFinite(solarDayHours) ? Number(solarDayHours) : 24;
  const resolvedEccentricity = Number.isFinite(eccentricity) ? Math.abs(Number(eccentricity)) : 0;
  const resolvedPressure = Number.isFinite(atmosphericPressureBar) ? Number(atmosphericPressureBar) : null;

  if (!Number.isFinite(resolvedPressure)) return null;

  return calculateWorldHighLowTemperatureProfile({
    axialTiltDegrees: resolvedAxialTilt,
    yearLengthStandardYears: resolvedYearLength,
    solarDayHours: resolvedSolarDay,
    isOneToOneSunLock: Boolean(isOneToOneSunLockToStars),
    hydrographicsCode,
    surfaceDistributionCode,
    atmosphericPressureBar: resolvedPressure,
    luminosity,
    distanceAu,
    eccentricity: resolvedEccentricity,
    albedo,
    greenhouseFactor,
  });
}

function buildCandidateTemperatureScenarioOutputs({
  includeTemperatureScenarioPresets,
  presetAltitudeKm,
  seasonalPeakLuminosityMultiplier,
  scenarioLatitudeDegrees,
  scenarioDateSolarDays,
  scenarioSolarDaysPerYear,
  luminosity,
  distanceAu,
  eccentricity,
  albedo,
  greenhouseFactor,
  atmosphericPressureBar,
  meanTemperatureK,
  axialTiltDegrees,
  solarDayHours,
  isOneToOneSunLockToStars,
  worldSize,
  gravityG,
  scaleHeightKm,
  baseLuminosityModifier,
  multiStarStars,
  inherentAddedTemperatureK,
} = {}) {
  if (!includeTemperatureScenarioPresets) {
    return {
      temperatureScenarioPresets: null,
      normalizedTemperatureScenarios: null,
    };
  }

  const baseArgs = {
    luminosity,
    distanceAu,
    eccentricity,
    albedo,
    greenhouseFactor,
    luminosityModifier: baseLuminosityModifier,
    atmosphericPressureBar,
  };

  const seaLevel = calculateAdditionalTemperatureScenario(baseArgs);
  const resolvedMeanTemperatureK =
    Number.isFinite(seaLevel?.meanTemperature?.kelvin) && Number(seaLevel.meanTemperature.kelvin) > 0
      ? Number(seaLevel.meanTemperature.kelvin)
      : Number(meanTemperatureK);
  const resolvedGravityG = Number.isFinite(gravityG) && Number(gravityG) > 0 ? Number(gravityG) : 1;
  const resolvedScaleHeightKm =
    Number.isFinite(scaleHeightKm) && Number(scaleHeightKm) > 0
      ? Number(scaleHeightKm)
      : calculateAtmosphereScaleHeightKm({
          gravityG: resolvedGravityG,
          meanTemperatureK: resolvedMeanTemperatureK,
          useTemperatureAdjustment: true,
        });

  const highAltitude =
    Number.isFinite(atmosphericPressureBar) && Number(atmosphericPressureBar) > 0
      ? calculateAdditionalTemperatureScenario({
          ...baseArgs,
          altitudeKm: Number.isFinite(presetAltitudeKm) ? Number(presetAltitudeKm) : 5,
          meanPressureBar: atmosphericPressureBar,
          scaleHeightKm: resolvedScaleHeightKm,
          gravityG: resolvedGravityG,
          meanTemperatureK: resolvedMeanTemperatureK,
        })
      : null;

  const seasonalMultiplier =
    Number.isFinite(seasonalPeakLuminosityMultiplier) && Number(seasonalPeakLuminosityMultiplier) > 0
      ? Number(seasonalPeakLuminosityMultiplier)
      : 1.25;
  const seasonalPeakModifier = Number.isFinite(baseLuminosityModifier)
    ? Number(baseLuminosityModifier) * seasonalMultiplier
    : null;
  const seasonalPeak = calculateAdditionalTemperatureScenario({
    ...baseArgs,
    luminosityModifier: seasonalPeakModifier,
  });

  const commonLatitude =
    Number.isFinite(axialTiltDegrees) && Number.isFinite(scenarioLatitudeDegrees)
      ? {
          axialTiltDegrees,
          latitudeDegrees: scenarioLatitudeDegrees,
        }
      : null;
  const resolvedTimeOfDayRotationFactor = Number.isFinite(baseLuminosityModifier)
    ? Number(baseLuminosityModifier)
    : Number.isFinite(seaLevel?.luminosityModifier)
      ? Number(seaLevel.luminosityModifier)
      : Number.isFinite(baseArgs.luminosityModifier)
        ? Number(baseArgs.luminosityModifier)
        : 1;
  const commonTimeOfDay = Number.isFinite(solarDayHours)
    ? {
        rotationFactor: resolvedTimeOfDayRotationFactor,
        hoursSinceDawn: Number(solarDayHours) / 2,
        solarDayHours,
        method:
          Number.isFinite(axialTiltDegrees) &&
          Number.isFinite(scenarioLatitudeDegrees) &&
          Number.isFinite(scenarioDateSolarDays) &&
          Number.isFinite(scenarioSolarDaysPerYear) &&
          Number(scenarioSolarDaysPerYear) > 0
            ? "uneven"
            : "even",
        axialTiltDegrees,
        latitudeDegrees: scenarioLatitudeDegrees,
        dateSolarDays: scenarioDateSolarDays,
        solarDaysPerYear: scenarioSolarDaysPerYear,
        isDaytime: true,
        lagFraction: 0.15,
      }
    : null;
  const commonTwilight = isOneToOneSunLockToStars
    ? {
        longitudeFromTerminatorDeg: 0,
        eccentricity,
        axialTiltDegrees,
        latitudeDegrees: Number.isFinite(scenarioLatitudeDegrees) ? scenarioLatitudeDegrees : 45,
        angularSizeDegrees: 0,
        atmosphericPressureBar,
        temperatureK: resolvedMeanTemperatureK,
        scaleHeightKm: resolvedScaleHeightKm,
        gravityG: resolvedGravityG,
        worldSize,
      }
    : null;
  const commonMultiStar =
    Array.isArray(multiStarStars) && multiStarStars.length > 0
      ? {
          planetAu: distanceAu,
          planetEccentricity: eccentricity,
          stars: multiStarStars,
          includeEccentricity: true,
        }
      : null;
  const commonInherent = Number.isFinite(inherentAddedTemperatureK)
    ? { addedTemperatureK: inherentAddedTemperatureK }
    : null;

  const normalizedTemperatureScenarios = {
    seaLevel: calculateNormalizedTemperatureScenario({
      base: {
        ...baseArgs,
        meanPressureBar: atmosphericPressureBar,
        gravityG: resolvedGravityG,
        meanTemperatureK: resolvedMeanTemperatureK,
      },
      latitude: commonLatitude,
      timeOfDay: commonTimeOfDay,
      twilight: commonTwilight,
      multiStar: commonMultiStar,
      inherent: commonInherent,
    }),
    highAltitude: highAltitude
      ? calculateNormalizedTemperatureScenario({
          base: {
            ...baseArgs,
            luminosityModifier: highAltitude.luminosityModifier,
            altitudeKm: Number.isFinite(presetAltitudeKm) ? Number(presetAltitudeKm) : 5,
            meanPressureBar: atmosphericPressureBar,
            scaleHeightKm: resolvedScaleHeightKm,
            gravityG: resolvedGravityG,
            meanTemperatureK: resolvedMeanTemperatureK,
          },
          latitude: commonLatitude,
          timeOfDay: commonTimeOfDay,
          twilight: commonTwilight,
          multiStar: commonMultiStar,
          inherent: commonInherent,
        })
      : null,
    seasonalPeak: calculateNormalizedTemperatureScenario({
      base: {
        ...baseArgs,
        luminosityModifier: seasonalPeakModifier,
        meanPressureBar: atmosphericPressureBar,
        gravityG: resolvedGravityG,
        meanTemperatureK: resolvedMeanTemperatureK,
      },
      latitude: commonLatitude,
      timeOfDay: commonTimeOfDay,
      twilight: commonTwilight,
      multiStar: commonMultiStar,
      inherent: commonInherent,
    }),
  };

  return {
    temperatureScenarioPresets: {
      seaLevel,
      highAltitude,
      seasonalPeak,
    },
    normalizedTemperatureScenarios,
  };
}

/**
 * Format hydrographics shorthand profile.
 *
 * Format: H:D:%%:XX-##:YY-##
 * If a liquid has no explicit percentage, only its chemical code is emitted.
 *
 * @param {object} [options]
 * @param {string|number} options.hydrographicsCode
 * @param {string|number} options.surfaceDistributionCode
 * @param {number} options.hydrographicsPercent
 * @param {Array<{ code?: string, molecule?: string, percent?: number }>} [options.liquids=[]]
 * @param {number} [options.precision=0]
 * @returns {string}
 */
export function formatHydrographicsProfile({
  hydrographicsCode,
  surfaceDistributionCode,
  hydrographicsPercent,
  liquids = [],
  precision = 0,
} = {}) {
  const codeValue = resolveHydrographicsCodeValue(hydrographicsCode);
  const codeLabel = Number.isFinite(codeValue)
    ? toEHex(codeValue)
    : String(hydrographicsCode ?? "?")
        .trim()
        .toUpperCase();
  const distributionLabel = String(surfaceDistributionCode ?? "?")
    .trim()
    .toUpperCase();
  const percentLabel = formatHydrographicsPercentValue(hydrographicsPercent, precision);
  const liquidLabel = (Array.isArray(liquids) ? liquids : [])
    .map((liquid) => {
      const symbol = String(liquid?.code ?? formatAtmosphereGasSymbol(liquid?.molecule)).trim();
      if (!Number.isFinite(liquid?.percent) || Number(liquid.percent) >= 100) return symbol;
      return `${symbol}-${formatHydrographicsPercentValue(liquid.percent, precision)}`;
    })
    .join(":");

  return liquidLabel
    ? `${codeLabel}:${distributionLabel}:${percentLabel}:${liquidLabel}`
    : `${codeLabel}:${distributionLabel}:${percentLabel}`;
}

/**
 * Identify mainworld candidate worlds within the habitable zone.
 *
 * Evaluates all terrestrial bodies and significant moons from the world-placement
 * output. For each body whose orbit lies within the HZ, computes:
 *   - Effective HZCO deviation
 *   - Habitable Zones Regions temperature DM (base raw roll = 7)
 *   - Optionally rolls Atmosphere and Hydrographics (T5 formulae)
 *
 * Rules (T5 WBH, Mainworld Candidate section):
 *   - HZ = HZCO Â± 1.0 Orbit#s; for HZCO < 1.0 the breadth is Â±0.1
 *     (one-tenth as large), with outer extended to 1.2 if it crosses 1.0.
 *   - Only bodies with sizeValue >= 2 are evaluated for atmosphere/hydrographics;
 *     Size 0/1 worlds automatically have atmosphere 0 and hydrographics 0.
 *
 * @param {object} options
 * @param {Array<object>} options.slots      Placed world slots (post-Step 12 output).
 * @param {number}        options.hzco       Habitable zone centre Orbit#.
 * @param {boolean}       [options.rollPhysical=true]  Also roll Atmo+Hydro for each candidate.
 * @param {boolean}       [options.applyRunawayGreenhouse=false] Enable optional runaway-greenhouse check.
 * @param {number}        [options.runawayGreenhouseSystemAgeByr=0] System age in billions of years.
 * @param {boolean}       [options.runawayGreenhouseAllowInnerTemperateCheck=false] Allow DM-2 temperate checks inside HZCO.
 * @param {number}        [options.runawayGreenhouseMeanTemperatureK] Optional detailed mean temperature in Kelvin.
 * @param {boolean}       [options.includeHabitableZoneAtmosphereDetails=false] Generate pressure/oxygen/scale profile.
 * @param {number}        [options.habitableZoneAtmosphereSystemAgeByr=0] System age for oxygen DM.
 * @param {boolean}       [options.habitableZoneAtmosphereUseOptionalYoungWorldDm=false] Apply optional young-world oxygen penalties.
 * @param {boolean}       [options.habitableZoneAtmosphereApplyOxygenVariance=false] Apply +/-0.005 oxygen variance.
 * @param {"uniform"|"two-dice-linear"} [options.habitableZoneAtmospherePressureMethod="uniform"] Pressure variance method.
 * @param {"classic"|"compact-d10"} [options.habitableZoneAtmosphereOxygenMethod="classic"] Oxygen fraction formula mode.
 * @param {boolean}       [options.includeTaintDetails=false] Roll taint subtypes for candidate tainted atmosphere codes (2, 4, 7, 9).
 * @param {boolean}       [options.taintRollSeverity=false] Roll Table 33 severity for each taint subtype.
 * @param {boolean}       [options.taintRollPersistence=false] Roll Table 34 persistence for each taint subtype.
 * @param {boolean}       [options.taintUseOptionalPpoSeverity=false] Use ppo-threshold severity for L/H taints.
 * @param {boolean}       [options.includeTemperatureScenarioPresets=true] Include optional scenario presets and normalized scenario outputs.
 * @param {number}        [options.temperatureScenarioPresetAltitudeKm=5] Altitude used for the high-altitude scenario preset.
 * @param {number}        [options.temperatureScenarioSeasonalPeakMultiplier=1.25] Luminosity-modifier multiplier used for seasonal-peak preset.
 * @param {number}        [options.temperatureScenarioLatitudeDegrees=45] Latitude used for latitude-driven scenario composition.
 * @param {number}        [options.temperatureScenarioDateSolarDays] Seasonal date in solar days since winter solstice.
 * @param {number}        [options.temperatureScenarioSolarDaysPerYear] Total solar days in the local year.
 * @param {number}        [options.temperatureScenarioGasGiantResidualAgeGyr] Optional age used for automatic gas-giant residual moon heating.
 *
 * Per-slot optional scenario extensions:
 * - slot.temperatureScenarioStars: Array<{ name?: string, luminosity: number, au: number, eccentricity?: number }>
 * - slot.inherentTemperatureAddedK: number
 * - slot.temperatureScenarioDateSolarDays: number
 * - slot.temperatureScenarioSolarDaysPerYear: number
 * - moon.temperatureScenarioStars / moon.inherentTemperatureAddedK on significantMoonSizeDetails entries
 *
 * Example:
 * const slots = [{
 *   slotId: "P-1",
 *   orbit: 3.1,
 *   primaryWorldType: "terrestrialPlanet",
 *   sizeCode: "5",
 *   sizeValue: 5,
 *   temperatureScenarioStars: [
 *     { name: "Aa", luminosity: 0.738, au: 0, eccentricity: 0 },
 *     { name: "Ab", luminosity: 0.681, au: 0.036, eccentricity: 0.11 },
 *   ],
 *   inherentTemperatureAddedK: 35,
 * }];
 * identifyMainworldCandidates({ slots, hzco: 3.3, rollPhysical: true });
 *
 * @param {Function}      [options.rng=Math.random]
 * @returns {{
 *   habitableZone: { innerOrbit: number, outerOrbit: number } | null,
 *   candidates: Array<{
 *     slotId: string,
 *     orbit: number,
 *     bodyLabel: string,
 *     primaryWorldType: string,
 *     isMoon: boolean,
 *     moonIndex: number|null,
 *     sizeCode: string,
 *     sizeValue: number,
 *     deviation: number,
 *     effectiveDeviation: number,
 *     regionDm: number,
 *     temperatureRawRoll: number,
 *     temperatureAtmosphereDm: number,
 *     temperatureModifiedRoll: number,
 *     temperatureRegionType: string,
 *     basicMeanTemperatureRoll: ReturnType<typeof calculateBasicMeanTemperatureModifiedRoll>,
 *     basicMeanTemperature: ReturnType<typeof lookupBasicMeanTemperature>|null,
 *     albedoModel: ReturnType<typeof rollWorldAlbedo>|null,
 *     greenhouseModel: ReturnType<typeof calculateEffectiveGreenhouseFactor>|null,
 *     meanTemperature: ReturnType<typeof calculateMeanTemperature>|null,
 *     meanTemperatureK: number|null,
 *     meanTemperatureModel: {
 *       luminosity: number|null,
 *       distanceAu: number,
 *       atmosphericPressureBar: number|null,
 *       albedoWorldType: string,
 *       luminositySource: string,
 *     },
 *     highLowTemperatureProfile: ReturnType<typeof calculateWorldHighLowTemperatureProfile>|null,
 *     temperatureScenarioPresets: {
 *       seaLevel: ReturnType<typeof calculateAdditionalTemperatureScenario>|null,
 *       highAltitude: ReturnType<typeof calculateAdditionalTemperatureScenario>|null,
 *       seasonalPeak: ReturnType<typeof calculateAdditionalTemperatureScenario>|null,
 *     }|null,
 *     normalizedTemperatureScenarios: {
 *       seaLevel: ReturnType<typeof calculateNormalizedTemperatureScenario>|null,
 *       highAltitude: ReturnType<typeof calculateNormalizedTemperatureScenario>|null,
 *       seasonalPeak: ReturnType<typeof calculateNormalizedTemperatureScenario>|null,
 *     }|null,
 *     temperatureScenarioInherentAddedK: number|null,
 *     gasGiantResidualHeatScenario: ReturnType<typeof calculateGasGiantResidualHeatScenario>|null,
 *     temperatureScenarioSummary: ReturnType<typeof formatCandidateTemperatureScenarioSummary>|null,
 *     atmosphereRoll: number|null,
 *     atmosphereCode: number|null,
 *     hydrographicsRoll: number|null,
 *     hydrographicsCode: number|null,
 *     surfaceDistributionRoll: number|null,
 *     surfaceDistributionCode: string|number|null,
 *     runawayGreenhouse: ReturnType<typeof evaluateRunawayGreenhouse>|null,
 *     habitableZoneAtmosphere: ReturnType<typeof generateHabitableZoneAtmosphereProfile>|null,
 *     worldTaints: ReturnType<typeof rollWorldTaints>|null,
 *     temperatureRegion: {
 *       rawRoll: number,
 *       type: string,
 *       averageTemperatureK: string,
 *       averageTemperatureC: string,
 *       description: string,
 *     },
 *   }>
 * }}
 */
export function identifyMainworldCandidates({
  slots = [],
  hzco,
  rollPhysical = true,
  applyRunawayGreenhouse = false,
  runawayGreenhouseSystemAgeByr = 0,
  runawayGreenhouseAllowInnerTemperateCheck = false,
  runawayGreenhouseMeanTemperatureK,
  includeHabitableZoneAtmosphereDetails = false,
  habitableZoneAtmosphereSystemAgeByr = 0,
  habitableZoneAtmosphereUseOptionalYoungWorldDm = false,
  habitableZoneAtmosphereApplyOxygenVariance = false,
  habitableZoneAtmospherePressureMethod = "uniform",
  habitableZoneAtmosphereOxygenMethod = "classic",
  includeTaintDetails = false,
  taintRollSeverity = false,
  taintRollPersistence = false,
  taintUseOptionalPpoSeverity = false,
  includeTemperatureScenarioPresets = true,
  temperatureScenarioPresetAltitudeKm = 5,
  temperatureScenarioSeasonalPeakMultiplier = 1.25,
  temperatureScenarioLatitudeDegrees = 45,
  temperatureScenarioDateSolarDays,
  temperatureScenarioSolarDaysPerYear,
  temperatureScenarioGasGiantResidualAgeGyr,
  rng = Math.random,
} = {}) {
  const hzBounds = calculateHabitableZoneBoundsForHzco(hzco);
  if (!hzBounds) return { habitableZone: null, candidates: [] };

  const { innerOrbit, outerOrbit } = hzBounds;
  const candidates = [];

  for (const slot of slots) {
    if (!Number.isFinite(slot?.orbit)) continue;
    const orbit = Number(slot.orbit);
    const worldType = slot.primaryWorldType ?? null;
    if (worldType === "emptyOrbit") continue;

    // --- Primary terrestrial body or mainworld in this slot ---
    const isDirectCandidate =
      worldType === "terrestrialPlanet" ||
      worldType === "mainworld" ||
      (slot.secondaryWorldTypes ?? []).includes("mainworld");

    if (isDirectCandidate && orbit >= innerOrbit && orbit <= outerOrbit) {
      const sizeCode = String(slot.sizeCode ?? slot.size ?? "0");
      const sizeValue = Number.isFinite(slot.sizeValue) ? slot.sizeValue : (sizeValueFromCode(sizeCode) ?? 0);
      const deviation = calculateHZCODeviation(orbit, hzco);
      const effectiveDeviation = calculateEffectiveHZCODeviation(orbit, hzco);
      const temperatureRawRoll = calculateHabitableZoneTemperatureRawRoll(effectiveDeviation);
      const regionDm = temperatureRawRoll - 7;

      let atmosphereRoll = null,
        atmosphereCode = null,
        hydrographicsRoll = null,
        hydrographicsCode = null;

      if (rollPhysical) {
        const atmoResult = rollWorldAtmosphereForOrbit({
          sizeValue,
          orbit,
          hzco,
          gravity: Number(slot?.gravity),
          rng,
        });
        atmosphereRoll = atmoResult.roll;
        atmosphereCode = atmoResult.atmosphereCode;
      }

      const temperatureAtmosphereDm = lookupAtmosphereTemperatureDm(atmosphereCode).dm;
      const temperatureModifiedRoll = Math.max(2, Math.min(12, temperatureRawRoll + temperatureAtmosphereDm));
      const temperatureRegion = lookupHabitableZoneRegionByRawRoll(temperatureModifiedRoll);
      const fallbackMeanTemperatureK = estimateMeanTemperatureKFromRegionType(temperatureRegion.type);
      let runawayGreenhouse = null;
      let habitableZoneAtmosphere = null;

      if (rollPhysical && applyRunawayGreenhouse && atmosphereCode !== null) {
        const preRunawayMeanTemperatureProfile = buildCandidateMeanTemperatureProfile({
          primaryWorldType: worldType,
          isMoon: false,
          atmosphereCode,
          hydrographicsCode: null,
          temperatureRawRoll,
          temperatureModifiedRoll,
          orbit,
          hzco,
          fallbackMeanTemperatureK,
        });
        const runawayGreenhouseMeanTemperatureInput = Number.isFinite(runawayGreenhouseMeanTemperatureK)
          ? Number(runawayGreenhouseMeanTemperatureK)
          : preRunawayMeanTemperatureProfile.meanTemperatureK;

        runawayGreenhouse = evaluateRunawayGreenhouse({
          atmosphereCode,
          size: sizeValue,
          temperatureModifiedRoll,
          systemAgeByr: runawayGreenhouseSystemAgeByr,
          meanTemperatureK: runawayGreenhouseMeanTemperatureInput,
          orbitNumber: orbit,
          hzco,
          allowInnerTemperateCheck: runawayGreenhouseAllowInnerTemperateCheck,
          rng,
        });

        if (runawayGreenhouse.occurred && Number.isFinite(runawayGreenhouse.finalAtmosphereCodeValue)) {
          atmosphereCode = runawayGreenhouse.finalAtmosphereCodeValue;
        }
      }

      if (rollPhysical) {
        const hydroResult = rollWorldHydrographicsCode({
          atmosphereCode,
          forceBoilingForHydrographics: Boolean(runawayGreenhouse?.forceBoilingForHydrographics),
          rng,
        });
        hydrographicsRoll = hydroResult.roll;
        hydrographicsCode = hydroResult.hydrographicsCode;
      }

      const meanTemperatureProfile = buildCandidateMeanTemperatureProfile({
        primaryWorldType: worldType,
        isMoon: false,
        atmosphereCode,
        hydrographicsCode,
        temperatureRawRoll,
        temperatureModifiedRoll,
        orbit,
        hzco,
        fallbackMeanTemperatureK,
      });
      const candidateMeanTemperatureK = Number.isFinite(meanTemperatureProfile.meanTemperatureK)
        ? Number(meanTemperatureProfile.meanTemperatureK)
        : fallbackMeanTemperatureK;

      if (rollPhysical && includeHabitableZoneAtmosphereDetails && atmosphereCode !== null) {
        habitableZoneAtmosphere = generateHabitableZoneAtmosphereProfile({
          atmosphereCode,
          systemAgeByr: habitableZoneAtmosphereSystemAgeByr,
          useOptionalYoungWorldOxygenDm: habitableZoneAtmosphereUseOptionalYoungWorldDm,
          applyOxygenVariance: habitableZoneAtmosphereApplyOxygenVariance,
          pressureMethod: habitableZoneAtmospherePressureMethod,
          oxygenMethod: habitableZoneAtmosphereOxygenMethod,
          gravityG: Number(slot?.gravity),
          meanTemperatureK: candidateMeanTemperatureK,
          rng,
        });
      }

      let worldTaints = null;
      if (includeTaintDetails && atmosphereCode !== null && TAINTED_ATMOSPHERE_CODES.has(atmosphereCode)) {
        worldTaints = rollWorldTaints({
          atmosphereCode,
          knownOxygenTrait: habitableZoneAtmosphere?.oxygenTaint?.oxygenTrait ?? null,
          oxygenPartialPressureBar: habitableZoneAtmosphere?.oxygenPartialPressureBar ?? null,
          meanTemperatureK: candidateMeanTemperatureK,
          rollSeverity: taintRollSeverity,
          rollPersistence: taintRollPersistence,
          useOptionalPpoSeverity: taintUseOptionalPpoSeverity,
          rng,
        });
      }

      let surfaceDistributionRoll = null;
      let surfaceDistributionCode = slot?.surfaceDistributionCode ?? null;
      if (
        rollPhysical &&
        surfaceDistributionCode == null &&
        Number.isFinite(hydrographicsCode) &&
        Number(hydrographicsCode) >= 2 &&
        Number(hydrographicsCode) <= 8
      ) {
        const rolledSurfaceDistribution = rollSurfaceDistribution({ rng });
        surfaceDistributionRoll = rolledSurfaceDistribution.roll;
        surfaceDistributionCode = rolledSurfaceDistribution.code;
      }

      const highLowTemperatureProfile = buildCandidateHighLowTemperatureProfile({
        axialTiltDegrees: Number(slot?.axialTiltDecimalDegrees ?? slot?.axialTiltDegrees ?? slot?.axialTilt),
        yearLengthStandardYears: Number(slot?.orbitalPeriodYears ?? slot?.yearLengthStandardYears),
        solarDayHours: Number(slot?.solarDayHours ?? slot?.rotationPeriodHours ?? slot?.siderealDayHours),
        isOneToOneSunLockToStars: isOneToOneSunLock(slot?.tidalLock?.lockType ?? slot?.tidalLockType),
        hydrographicsCode,
        surfaceDistributionCode,
        atmosphericPressureBar:
          habitableZoneAtmosphere?.pressure?.pressureBar ??
          meanTemperatureProfile.meanTemperatureModel.atmosphericPressureBar,
        luminosity: meanTemperatureProfile.meanTemperatureModel.luminosity,
        distanceAu: meanTemperatureProfile.meanTemperatureModel.distanceAu,
        eccentricity: slot?.eccentricity,
        albedo: meanTemperatureProfile.albedoModel?.albedo,
        greenhouseFactor: meanTemperatureProfile.greenhouseModel?.effectiveGreenhouseFactor,
      });

      const scenarioOutputs = buildCandidateTemperatureScenarioOutputs({
        includeTemperatureScenarioPresets,
        presetAltitudeKm: temperatureScenarioPresetAltitudeKm,
        seasonalPeakLuminosityMultiplier: temperatureScenarioSeasonalPeakMultiplier,
        scenarioLatitudeDegrees: temperatureScenarioLatitudeDegrees,
        scenarioDateSolarDays: firstFiniteNonNegative([
          slot?.temperatureScenarioDateSolarDays,
          temperatureScenarioDateSolarDays,
        ]),
        scenarioSolarDaysPerYear: firstFinitePositive([
          slot?.temperatureScenarioSolarDaysPerYear,
          slot?.solarDaysInYear,
          temperatureScenarioSolarDaysPerYear,
        ]),
        luminosity: meanTemperatureProfile.meanTemperatureModel.luminosity,
        distanceAu: meanTemperatureProfile.meanTemperatureModel.distanceAu,
        eccentricity: slot?.eccentricity,
        albedo: meanTemperatureProfile.albedoModel?.albedo,
        greenhouseFactor: meanTemperatureProfile.greenhouseModel?.effectiveGreenhouseFactor,
        atmosphericPressureBar:
          habitableZoneAtmosphere?.pressure?.pressureBar ??
          meanTemperatureProfile.meanTemperatureModel.atmosphericPressureBar,
        meanTemperatureK: candidateMeanTemperatureK,
        axialTiltDegrees: Number(slot?.axialTiltDecimalDegrees ?? slot?.axialTiltDegrees ?? slot?.axialTilt),
        solarDayHours: Number(slot?.solarDayHours ?? slot?.rotationPeriodHours ?? slot?.siderealDayHours),
        isOneToOneSunLockToStars: isOneToOneSunLock(slot?.tidalLock?.lockType ?? slot?.tidalLockType),
        worldSize: sizeValue,
        gravityG: Number(slot?.gravity),
        scaleHeightKm: habitableZoneAtmosphere?.scaleHeightKm,
        baseLuminosityModifier: highLowTemperatureProfile?.luminosityModifier,
        multiStarStars: slot?.temperatureScenarioStars,
        inherentAddedTemperatureK:
          Number.isFinite(Number(slot?.inherentTemperatureAddedK)) && Number(slot?.inherentTemperatureAddedK) >= 0
            ? Number(slot?.inherentTemperatureAddedK)
            : null,
      });
      const temperatureScenarioSummary = formatCandidateTemperatureScenarioSummary({
        candidate: {
          slotId: slot.slotId,
          bodyLabel: slot.slotId,
          isMoon: false,
          meanTemperatureK: meanTemperatureProfile.meanTemperatureK,
          temperatureScenarioPresets: scenarioOutputs.temperatureScenarioPresets,
          normalizedTemperatureScenarios: scenarioOutputs.normalizedTemperatureScenarios,
        },
      });

      candidates.push({
        slotId: slot.slotId,
        orbit,
        bodyLabel: slot.slotId,
        primaryWorldType: worldType,
        isMoon: false,
        moonIndex: null,
        sizeCode,
        sizeValue,
        deviation,
        effectiveDeviation,
        regionDm,
        temperatureRawRoll,
        temperatureAtmosphereDm,
        temperatureModifiedRoll,
        temperatureRegionType: temperatureRegion.type,
        basicMeanTemperatureRoll: meanTemperatureProfile.basicMeanTemperatureRoll,
        basicMeanTemperature: meanTemperatureProfile.basicMeanTemperature,
        albedoModel: meanTemperatureProfile.albedoModel,
        greenhouseModel: meanTemperatureProfile.greenhouseModel,
        meanTemperature: meanTemperatureProfile.meanTemperature,
        meanTemperatureK: meanTemperatureProfile.meanTemperatureK,
        meanTemperatureModel: meanTemperatureProfile.meanTemperatureModel,
        highLowTemperatureProfile,
        temperatureScenarioPresets: scenarioOutputs.temperatureScenarioPresets,
        normalizedTemperatureScenarios: scenarioOutputs.normalizedTemperatureScenarios,
        temperatureScenarioInherentAddedK:
          Number.isFinite(Number(slot?.inherentTemperatureAddedK)) && Number(slot?.inherentTemperatureAddedK) >= 0
            ? Number(slot?.inherentTemperatureAddedK)
            : null,
        gasGiantResidualHeatScenario: null,
        temperatureScenarioSummary,
        atmosphereRoll,
        atmosphereCode,
        hydrographicsRoll,
        hydrographicsCode,
        surfaceDistributionRoll,
        surfaceDistributionCode,
        runawayGreenhouse,
        habitableZoneAtmosphere,
        worldTaints,
        temperatureRegion,
      });
    }

    // --- Significant moons of any world type in the HZ ---
    if (orbit >= innerOrbit && orbit <= outerOrbit) {
      const moonDetails = slot.significantMoonSizeDetails ?? [];
      let nonRingMoonIndex = -1;
      moonDetails.forEach((moon, moonIdx) => {
        if (moon.isRing) return;
        nonRingMoonIndex += 1;
        const moonSizeCode = String(moon.sizeCode ?? "S");
        const moonSizeValue = Number.isFinite(moon.sizeValue) ? moon.sizeValue : (sizeValueFromCode(moonSizeCode) ?? 0);
        if (moonSizeValue < 2) return; // Size 0/1 â†’ no atmosphere

        const deviation = calculateHZCODeviation(orbit, hzco);
        const effectiveDeviation = calculateEffectiveHZCODeviation(orbit, hzco);
        const temperatureRawRoll = calculateHabitableZoneTemperatureRawRoll(effectiveDeviation);
        const regionDm = temperatureRawRoll - 7;

        let atmosphereRoll = null,
          atmosphereCode = null,
          hydrographicsRoll = null,
          hydrographicsCode = null;
        if (rollPhysical) {
          const atmoResult = rollWorldAtmosphereForOrbit({
            sizeValue: moonSizeValue,
            orbit,
            hzco,
            gravity: Number(moon?.gravity),
            rng,
          });
          atmosphereRoll = atmoResult.roll;
          atmosphereCode = atmoResult.atmosphereCode;
        }

        const temperatureAtmosphereDm = lookupAtmosphereTemperatureDm(atmosphereCode).dm;
        const temperatureModifiedRoll = Math.max(2, Math.min(12, temperatureRawRoll + temperatureAtmosphereDm));
        const temperatureRegion = lookupHabitableZoneRegionByRawRoll(temperatureModifiedRoll);
        const fallbackMeanTemperatureK = estimateMeanTemperatureKFromRegionType(temperatureRegion.type);
        let runawayGreenhouse = null;
        let habitableZoneAtmosphere = null;

        if (rollPhysical && applyRunawayGreenhouse && atmosphereCode !== null) {
          const preRunawayMeanTemperatureProfile = buildCandidateMeanTemperatureProfile({
            primaryWorldType: worldType,
            isMoon: true,
            atmosphereCode,
            hydrographicsCode: null,
            temperatureRawRoll,
            temperatureModifiedRoll,
            orbit,
            hzco,
            fallbackMeanTemperatureK,
          });
          const runawayGreenhouseMeanTemperatureInput = Number.isFinite(runawayGreenhouseMeanTemperatureK)
            ? Number(runawayGreenhouseMeanTemperatureK)
            : preRunawayMeanTemperatureProfile.meanTemperatureK;

          runawayGreenhouse = evaluateRunawayGreenhouse({
            atmosphereCode,
            size: moonSizeValue,
            temperatureModifiedRoll,
            systemAgeByr: runawayGreenhouseSystemAgeByr,
            meanTemperatureK: runawayGreenhouseMeanTemperatureInput,
            orbitNumber: orbit,
            hzco,
            allowInnerTemperateCheck: runawayGreenhouseAllowInnerTemperateCheck,
            rng,
          });

          if (runawayGreenhouse.occurred && Number.isFinite(runawayGreenhouse.finalAtmosphereCodeValue)) {
            atmosphereCode = runawayGreenhouse.finalAtmosphereCodeValue;
          }
        }

        if (rollPhysical) {
          const hydroResult = rollWorldHydrographicsCode({
            atmosphereCode,
            forceBoilingForHydrographics: Boolean(runawayGreenhouse?.forceBoilingForHydrographics),
            rng,
          });
          hydrographicsRoll = hydroResult.roll;
          hydrographicsCode = hydroResult.hydrographicsCode;
        }

        const meanTemperatureProfile = buildCandidateMeanTemperatureProfile({
          primaryWorldType: worldType,
          isMoon: true,
          atmosphereCode,
          hydrographicsCode,
          temperatureRawRoll,
          temperatureModifiedRoll,
          orbit,
          hzco,
          fallbackMeanTemperatureK,
        });
        const candidateMeanTemperatureK = Number.isFinite(meanTemperatureProfile.meanTemperatureK)
          ? Number(meanTemperatureProfile.meanTemperatureK)
          : fallbackMeanTemperatureK;

        const moonOrbitDetails = Array.isArray(slot?.significantMoonOrbitDetails)
          ? slot.significantMoonOrbitDetails
          : [];
        const matchedMoonOrbitDetail =
          moonOrbitDetails.find((detail) => detail?.sourceMoon === moon) ?? moonOrbitDetails[nonRingMoonIndex] ?? null;
        const moonDistanceKm = firstFinitePositive([
          matchedMoonOrbitDetail?.period?.orbitKm,
          Number.isFinite(matchedMoonOrbitDetail?.orbitPd) &&
          Number.isFinite(slot?.basicDiameterKm) &&
          Number(slot.basicDiameterKm) > 0
            ? Number(matchedMoonOrbitDetail.orbitPd) * Number(slot.basicDiameterKm)
            : null,
        ]);
        const gasGiantMassEarth = Number(slot?.gasGiantMassEarth);
        const gasGiantResidualAgeGyr = firstFinitePositive([
          temperatureScenarioGasGiantResidualAgeGyr,
          moon?.systemAgeGyr,
          moon?.systemAgeByr,
          slot?.systemAgeGyr,
          slot?.systemAgeByr,
          habitableZoneAtmosphereSystemAgeByr,
          runawayGreenhouseSystemAgeByr,
        ]);
        const gasGiantResidualHeatScenario =
          isGasGiantPrimaryWorldType(worldType) &&
          Number.isFinite(gasGiantMassEarth) &&
          gasGiantMassEarth > 0 &&
          Number.isFinite(gasGiantResidualAgeGyr) &&
          Number.isFinite(moonDistanceKm)
            ? calculateGasGiantResidualHeatScenario({
                massEarth: gasGiantMassEarth,
                ageGyr: gasGiantResidualAgeGyr,
                stellarLuminosity: meanTemperatureProfile.meanTemperatureModel.luminosity,
                orbitalDistanceAu: meanTemperatureProfile.meanTemperatureModel.distanceAu,
                gasGiantDiameterTerran: slot?.gasGiantDiameterTerran,
                gasGiantDiameterKm: slot?.basicDiameterKm,
                moonDistanceKm,
                baselineMoonTemperatureK: candidateMeanTemperatureK,
                precision: 6,
              })
            : null;
        const explicitInherentAddedTemperatureKRaw = Number(
          moon?.inherentTemperatureAddedK ?? slot?.inherentTemperatureAddedK,
        );
        const explicitInherentAddedTemperatureK =
          Number.isFinite(explicitInherentAddedTemperatureKRaw) && explicitInherentAddedTemperatureKRaw >= 0
            ? explicitInherentAddedTemperatureKRaw
            : null;
        const gasGiantResidualAddedTemperatureKRaw = Number(gasGiantResidualHeatScenario?.moonHeatingTemperatureK);
        const gasGiantResidualAddedTemperatureK =
          Number.isFinite(gasGiantResidualAddedTemperatureKRaw) && gasGiantResidualAddedTemperatureKRaw >= 0
            ? gasGiantResidualAddedTemperatureKRaw
            : null;
        const scenarioInherentAddedTemperatureK = calculateCombinedTemperatureKelvin({
          temperaturesK: [explicitInherentAddedTemperatureK, gasGiantResidualAddedTemperatureK],
        });

        if (rollPhysical && includeHabitableZoneAtmosphereDetails && atmosphereCode !== null) {
          habitableZoneAtmosphere = generateHabitableZoneAtmosphereProfile({
            atmosphereCode,
            systemAgeByr: habitableZoneAtmosphereSystemAgeByr,
            useOptionalYoungWorldOxygenDm: habitableZoneAtmosphereUseOptionalYoungWorldDm,
            applyOxygenVariance: habitableZoneAtmosphereApplyOxygenVariance,
            pressureMethod: habitableZoneAtmospherePressureMethod,
            oxygenMethod: habitableZoneAtmosphereOxygenMethod,
            gravityG: Number(moon?.gravity),
            meanTemperatureK: candidateMeanTemperatureK,
            rng,
          });
        }

        let worldTaints = null;
        if (includeTaintDetails && atmosphereCode !== null && TAINTED_ATMOSPHERE_CODES.has(atmosphereCode)) {
          worldTaints = rollWorldTaints({
            atmosphereCode,
            knownOxygenTrait: habitableZoneAtmosphere?.oxygenTaint?.oxygenTrait ?? null,
            oxygenPartialPressureBar: habitableZoneAtmosphere?.oxygenPartialPressureBar ?? null,
            meanTemperatureK: candidateMeanTemperatureK,
            rollSeverity: taintRollSeverity,
            rollPersistence: taintRollPersistence,
            useOptionalPpoSeverity: taintUseOptionalPpoSeverity,
            rng,
          });
        }

        let surfaceDistributionRoll = null;
        let surfaceDistributionCode = moon?.surfaceDistributionCode ?? slot?.surfaceDistributionCode ?? null;
        if (
          rollPhysical &&
          surfaceDistributionCode == null &&
          Number.isFinite(hydrographicsCode) &&
          Number(hydrographicsCode) >= 2 &&
          Number(hydrographicsCode) <= 8
        ) {
          const rolledSurfaceDistribution = rollSurfaceDistribution({ rng });
          surfaceDistributionRoll = rolledSurfaceDistribution.roll;
          surfaceDistributionCode = rolledSurfaceDistribution.code;
        }

        const highLowTemperatureProfile = buildCandidateHighLowTemperatureProfile({
          axialTiltDegrees: Number(
            moon?.axialTiltDecimalDegrees ??
              moon?.axialTiltDegrees ??
              moon?.axialTilt ??
              slot?.axialTiltDecimalDegrees ??
              slot?.axialTiltDegrees ??
              slot?.axialTilt,
          ),
          yearLengthStandardYears: Number(
            moon?.orbitalPeriodYears ??
              moon?.yearLengthStandardYears ??
              slot?.orbitalPeriodYears ??
              slot?.yearLengthStandardYears,
          ),
          solarDayHours: Number(
            moon?.solarDayHours ??
              moon?.rotationPeriodHours ??
              moon?.siderealDayHours ??
              slot?.solarDayHours ??
              slot?.rotationPeriodHours,
          ),
          isOneToOneSunLockToStars: isOneToOneSunLock(
            moon?.tidalLock?.lockType ?? moon?.tidalLockType ?? slot?.tidalLock?.lockType ?? slot?.tidalLockType,
          ),
          hydrographicsCode,
          surfaceDistributionCode,
          atmosphericPressureBar:
            habitableZoneAtmosphere?.pressure?.pressureBar ??
            meanTemperatureProfile.meanTemperatureModel.atmosphericPressureBar,
          luminosity: meanTemperatureProfile.meanTemperatureModel.luminosity,
          distanceAu: meanTemperatureProfile.meanTemperatureModel.distanceAu,
          eccentricity: slot?.eccentricity,
          albedo: meanTemperatureProfile.albedoModel?.albedo,
          greenhouseFactor: meanTemperatureProfile.greenhouseModel?.effectiveGreenhouseFactor,
        });

        const scenarioOutputs = buildCandidateTemperatureScenarioOutputs({
          includeTemperatureScenarioPresets,
          presetAltitudeKm: temperatureScenarioPresetAltitudeKm,
          seasonalPeakLuminosityMultiplier: temperatureScenarioSeasonalPeakMultiplier,
          scenarioLatitudeDegrees: temperatureScenarioLatitudeDegrees,
          scenarioDateSolarDays: firstFiniteNonNegative([
            moon?.temperatureScenarioDateSolarDays,
            slot?.temperatureScenarioDateSolarDays,
            temperatureScenarioDateSolarDays,
          ]),
          scenarioSolarDaysPerYear: firstFinitePositive([
            moon?.temperatureScenarioSolarDaysPerYear,
            moon?.solarDaysInYear,
            slot?.temperatureScenarioSolarDaysPerYear,
            slot?.solarDaysInYear,
            temperatureScenarioSolarDaysPerYear,
          ]),
          luminosity: meanTemperatureProfile.meanTemperatureModel.luminosity,
          distanceAu: meanTemperatureProfile.meanTemperatureModel.distanceAu,
          eccentricity: slot?.eccentricity,
          albedo: meanTemperatureProfile.albedoModel?.albedo,
          greenhouseFactor: meanTemperatureProfile.greenhouseModel?.effectiveGreenhouseFactor,
          atmosphericPressureBar:
            habitableZoneAtmosphere?.pressure?.pressureBar ??
            meanTemperatureProfile.meanTemperatureModel.atmosphericPressureBar,
          meanTemperatureK: candidateMeanTemperatureK,
          axialTiltDegrees: Number(
            moon?.axialTiltDecimalDegrees ??
              moon?.axialTiltDegrees ??
              moon?.axialTilt ??
              slot?.axialTiltDecimalDegrees ??
              slot?.axialTiltDegrees ??
              slot?.axialTilt,
          ),
          solarDayHours: Number(
            moon?.solarDayHours ??
              moon?.rotationPeriodHours ??
              moon?.siderealDayHours ??
              slot?.solarDayHours ??
              slot?.rotationPeriodHours,
          ),
          isOneToOneSunLockToStars: isOneToOneSunLock(
            moon?.tidalLock?.lockType ?? moon?.tidalLockType ?? slot?.tidalLock?.lockType ?? slot?.tidalLockType,
          ),
          worldSize: moonSizeValue,
          gravityG: Number(moon?.gravity ?? slot?.gravity),
          scaleHeightKm: habitableZoneAtmosphere?.scaleHeightKm,
          baseLuminosityModifier: highLowTemperatureProfile?.luminosityModifier,
          multiStarStars: moon?.temperatureScenarioStars ?? slot?.temperatureScenarioStars,
          inherentAddedTemperatureK: scenarioInherentAddedTemperatureK,
        });
        const temperatureScenarioSummary = formatCandidateTemperatureScenarioSummary({
          candidate: {
            slotId: slot.slotId,
            bodyLabel: `${slot.slotId}-moon-${moonIdx + 1}`,
            isMoon: true,
            meanTemperatureK: meanTemperatureProfile.meanTemperatureK,
            temperatureScenarioPresets: scenarioOutputs.temperatureScenarioPresets,
            normalizedTemperatureScenarios: scenarioOutputs.normalizedTemperatureScenarios,
          },
        });

        candidates.push({
          slotId: slot.slotId,
          orbit,
          bodyLabel: `${slot.slotId}-moon-${moonIdx + 1}`,
          primaryWorldType: worldType,
          isMoon: true,
          moonIndex: moonIdx,
          sizeCode: moonSizeCode,
          sizeValue: moonSizeValue,
          deviation,
          effectiveDeviation,
          regionDm,
          temperatureRawRoll,
          temperatureAtmosphereDm,
          temperatureModifiedRoll,
          temperatureRegionType: temperatureRegion.type,
          basicMeanTemperatureRoll: meanTemperatureProfile.basicMeanTemperatureRoll,
          basicMeanTemperature: meanTemperatureProfile.basicMeanTemperature,
          albedoModel: meanTemperatureProfile.albedoModel,
          greenhouseModel: meanTemperatureProfile.greenhouseModel,
          meanTemperature: meanTemperatureProfile.meanTemperature,
          meanTemperatureK: meanTemperatureProfile.meanTemperatureK,
          meanTemperatureModel: meanTemperatureProfile.meanTemperatureModel,
          highLowTemperatureProfile,
          temperatureScenarioPresets: scenarioOutputs.temperatureScenarioPresets,
          normalizedTemperatureScenarios: scenarioOutputs.normalizedTemperatureScenarios,
          temperatureScenarioInherentAddedK: scenarioInherentAddedTemperatureK,
          gasGiantResidualHeatScenario,
          temperatureScenarioSummary,
          atmosphereRoll,
          atmosphereCode,
          hydrographicsRoll,
          hydrographicsCode,
          surfaceDistributionRoll,
          surfaceDistributionCode,
          runawayGreenhouse,
          habitableZoneAtmosphere,
          worldTaints,
          temperatureRegion,
        });
      });
    }
  }

  candidates.sort((a, b) => a.orbit - b.orbit);
  return { habitableZone: { innerOrbit, outerOrbit }, candidates };
}

// â”€â”€ Chapter 5: World Physical Characteristics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ SIZE: Diameter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Minimum diameter (km) for each world size code per Table 22.
 * Terrestrial sizes span 1,600 km per code; Size S spans 400 km.
 */
const WORLD_SIZE_MIN_DIAMETER_KM = Object.freeze({
  0: 0,
  R: 0,
  S: 400,
  1: 800,
  2: 2400,
  3: 4000,
  4: 5600,
  5: 7200,
  6: 8800,
  7: 10400,
  8: 12000,
  9: 13600,
  A: 15200,
  B: 16800,
  C: 18400,
  D: 20000,
  E: 21600,
  F: 23200,
});

/** D3 result â†’ diameter increase for Size 1+ worlds (Table 23). */
const D3_DIAMETER_INCREASE_KM = Object.freeze({ 1: 0, 2: 600, 3: 1200 });

/** D6 result â†’ diameter increase (Table 24). Used for Size S and 1+. */
const D6_DIAMETER_INCREASE_KM = Object.freeze({ 1: 0, 2: 100, 3: 200, 4: 300, 5: 400, 6: 500 });

/**
 * Roll the actual diameter of a terrestrial world (WBH Tables 22â€“24).
 *
 * - Size 0/R: always 0 km (belt or ring; no rolls).
 * - Size S: D6 result 1â€“4 only (reroll 5/6) â†’ diameter increase from 400 km minimum.
 * - Size 1â€“F: D3 + D6 from size minimum (reroll both if combined increase â‰¥ 1,600 km).
 * - Optional d100 (0â€“99) adds per-km variance; set `rollD100: false` to omit.
 *
 * @param {object} options
 * @param {string|number} options.sizeCode  World size code (0, R, S, 1â€“9, Aâ€“F).
 * @param {boolean} [options.rollD100=true]  Include a d100 fine-detail roll.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   sizeCode: string,
 *   minimumDiameter: number,
 *   d3Roll: number|null,
 *   d3Increase: number,
 *   d6Roll: number|null,
 *   d6Increase: number,
 *   d100Roll: number|null,
 *   diameterKm: number,
 * } | null}
 */
export function rollWorldDiameter({ sizeCode, rollD100 = true, rng = Math.random } = {}) {
  const code =
    normalizeBasicWorldSizeCode(sizeCode) ??
    String(sizeCode ?? "")
      .trim()
      .toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(WORLD_SIZE_MIN_DIAMETER_KM, code)) return null;

  const minimumDiameter = WORLD_SIZE_MIN_DIAMETER_KM[code];

  if (code === "0" || code === "R") {
    return {
      sizeCode: code,
      minimumDiameter: 0,
      d3Roll: null,
      d3Increase: 0,
      d6Roll: null,
      d6Increase: 0,
      d100Roll: null,
      diameterKm: 0,
    };
  }

  let d3Roll = null,
    d3Increase = 0,
    d6Roll,
    d6Increase;

  if (code === "S") {
    // Size S: D6 result 1â€“4 only; reroll 5 or 6
    do {
      d6Roll = roll1d(rng);
    } while (d6Roll >= 5);
    d6Increase = D6_DIAMETER_INCREASE_KM[d6Roll];
  } else {
    // Size 1â€“F: D3 + D6; reroll pair if combined increase â‰¥ 1,600
    do {
      d3Roll = Math.ceil(roll1d(rng) / 2);
      d6Roll = roll1d(rng);
      d3Increase = D3_DIAMETER_INCREASE_KM[d3Roll];
      d6Increase = D6_DIAMETER_INCREASE_KM[d6Roll];
    } while (d3Increase + d6Increase >= 1600);
  }

  const d100Roll = rollD100 ? Math.floor(rng() * 100) : null;
  const diameterKm = minimumDiameter + d3Increase + d6Increase + (d100Roll ?? 0);

  return { sizeCode: code, minimumDiameter, d3Roll, d3Increase, d6Roll, d6Increase, d100Roll, diameterKm };
}

// â”€â”€ SIZE: Composition and Density â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Terrestrial Composition result bands for Table 25 (2D + DMs), sorted ascending.
 *
 * Note: the source table header shows "â‰¤ 4 â†’ Exotic Ice" which is believed to be a
 * typographic error for "â‰¤ âˆ’4"; the corrected contiguous ranges are used here, matching
 * the adjacent "-3â€“2 â†’ Mostly Ice" row and producing physically consistent results.
 */
const TERRESTRIAL_COMPOSITION_BANDS = Object.freeze([
  [-4, "exoticIce"],
  [2, "mostlyIce"],
  [6, "mostlyRock"],
  [11, "rockAndMetal"],
  [14, "mostlyMetal"],
  [Infinity, "compressedMetal"],
]);

/** Human-readable labels for terrestrial composition keys. */
export const TERRESTRIAL_COMPOSITIONS = Object.freeze({
  exoticIce: "Exotic Ice",
  mostlyIce: "Mostly Ice",
  mostlyRock: "Mostly Rock",
  rockAndMetal: "Rock and Metal",
  mostlyMetal: "Mostly Metal",
  compressedMetal: "Compressed Metal",
});

/**
 * Terrestrial Density Table 26.
 * Indexed by composition key, then by 2D roll result (2â€“12).
 */
const TERRESTRIAL_DENSITY_TABLE = Object.freeze({
  exoticIce: Object.freeze({
    2: 0.03,
    3: 0.06,
    4: 0.09,
    5: 0.12,
    6: 0.15,
    7: 0.18,
    8: 0.21,
    9: 0.24,
    10: 0.27,
    11: 0.3,
    12: 0.33,
  }),
  mostlyIce: Object.freeze({
    2: 0.18,
    3: 0.21,
    4: 0.24,
    5: 0.27,
    6: 0.3,
    7: 0.33,
    8: 0.36,
    9: 0.39,
    10: 0.41,
    11: 0.44,
    12: 0.47,
  }),
  mostlyRock: Object.freeze({
    2: 0.5,
    3: 0.53,
    4: 0.56,
    5: 0.59,
    6: 0.62,
    7: 0.65,
    8: 0.68,
    9: 0.71,
    10: 0.74,
    11: 0.77,
    12: 0.8,
  }),
  rockAndMetal: Object.freeze({
    2: 0.82,
    3: 0.85,
    4: 0.88,
    5: 0.91,
    6: 0.94,
    7: 0.97,
    8: 1.0,
    9: 1.03,
    10: 1.06,
    11: 1.09,
    12: 1.12,
  }),
  mostlyMetal: Object.freeze({
    2: 1.15,
    3: 1.18,
    4: 1.21,
    5: 1.24,
    6: 1.27,
    7: 1.3,
    8: 1.33,
    9: 1.36,
    10: 1.39,
    11: 1.42,
    12: 1.45,
  }),
  compressedMetal: Object.freeze({
    2: 1.5,
    3: 1.55,
    4: 1.6,
    5: 1.65,
    6: 1.7,
    7: 1.75,
    8: 1.8,
    9: 1.85,
    10: 1.9,
    11: 1.95,
    12: 2.0,
  }),
});

/**
 * Determine the terrestrial composition of a world via 2D + DMs (Table 25).
 *
 * DMs applied:
 *   Size 0â€“4: DMâˆ’1 | Size 6â€“9: DM+1 | Size Aâ€“F: DM+3 (Size 5 has no size DM)
 *   Orbit â‰¤ HZCO: DM+1 | Orbit > HZCO: DMâˆ’1, and DMâˆ’1 per full Orbit# beyond HZCO
 *   System age > 10 Gyr: DMâˆ’1
 *
 * @param {object} options
 * @param {number} [options.sizeValue=5]      World size value (0â€“15).
 * @param {number} [options.orbit]            World Orbit# (enables proximity DMs when provided with hzco).
 * @param {number} [options.hzco]             System HZCO (enables proximity DMs when provided with orbit).
 * @param {number} [options.systemAgeByr=0]   System age in billions of years.
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll: number,
 *   dms: Array<{ label: string, value: number }>,
 *   totalRoll: number,
 *   compositionKey: string,
 *   composition: string,
 * }}
 */
export function determineTerrestrialComposition({
  sizeValue = 5,
  orbit,
  hzco,
  systemAgeByr = 0,
  rng = Math.random,
} = {}) {
  const sv = Math.max(0, Math.floor(Number(sizeValue) || 0));
  const dms = [];

  // Size DMs (Size 5 has no size DM)
  if (sv <= 4) dms.push({ label: "Size 0\u20134", value: -1 });
  else if (sv >= 6 && sv <= 9) dms.push({ label: "Size 6\u20139", value: 1 });
  else if (sv >= 10) dms.push({ label: "Size A\u2013F", value: 3 });

  // Orbital proximity DMs
  if (Number.isFinite(orbit) && Number.isFinite(hzco)) {
    if (orbit <= hzco) {
      dms.push({ label: "At HZCO or closer", value: 1 });
    } else {
      dms.push({ label: "Further than HZCO", value: -1 });
      const fullOrbitsBeyond = Math.floor(orbit - hzco);
      if (fullOrbitsBeyond > 0) {
        dms.push({ label: `${fullOrbitsBeyond} full Orbit# beyond HZCO`, value: -fullOrbitsBeyond });
      }
    }
  }

  // Age DM
  if (Number.isFinite(systemAgeByr) && systemAgeByr > 10) {
    dms.push({ label: "System age > 10 Gyr", value: -1 });
  }

  const totalDm = dms.reduce((sum, d) => sum + d.value, 0);
  const roll = roll2d(rng);
  const totalRoll = roll + totalDm;

  const band = TERRESTRIAL_COMPOSITION_BANDS.find(([max]) => totalRoll <= max);
  const compositionKey = band ? band[1] : "compressedMetal";

  return { roll, dms, totalRoll, compositionKey, composition: TERRESTRIAL_COMPOSITIONS[compositionKey] };
}

/**
 * Roll the density for a terrestrial world from Table 26.
 *
 * @param {object} options
 * @param {string} options.compositionKey  Composition key from determineTerrestrialComposition.
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number, density: number } | null}
 */
export function rollTerrestrialDensity({ compositionKey, rng = Math.random } = {}) {
  const column = TERRESTRIAL_DENSITY_TABLE[compositionKey];
  if (!column) return null;
  const roll = roll2d(rng);
  return { roll, density: column[roll] ?? null };
}

// â”€â”€ SIZE: Gravity, Mass, and Velocity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Terra reference constants. */
const TERRA_DIAMETER_KM = 12742;
const TERRA_RADIUS_KM = 6371;
const TERRA_ESCAPE_VELOCITY_MS = 11186;

/**
 * Calculate surface gravity (G, relative to Terra).
 * Formula: Density Ã— (DiameterKm Ã· DiameterâŠ•)
 *
 * @param {{ diameterKm: number, density: number }} options
 * @returns {number|null}
 */
export function calculateWorldGravity({ diameterKm, density } = {}) {
  if (!Number.isFinite(diameterKm) || !Number.isFinite(density)) return null;
  return density * (diameterKm / TERRA_DIAMETER_KM);
}

/**
 * Calculate world mass (Terra = 1.0).
 * Formula: Density Ã— (DiameterKm Ã· DiameterâŠ•)Â³
 *
 * @param {{ diameterKm: number, density: number }} options
 * @returns {number|null}
 */
export function calculateWorldMass({ diameterKm, density } = {}) {
  if (!Number.isFinite(diameterKm) || !Number.isFinite(density)) return null;
  const d = diameterKm / TERRA_DIAMETER_KM;
  return density * d * d * d;
}

/**
 * Calculate escape velocity from the world surface (m/s).
 * Formula: âˆš( Mass Ã· (DiameterKm Ã· DiameterâŠ•) ) Ã— 11,186
 *
 * @param {{ mass: number, diameterKm: number }} options
 * @returns {number|null}
 */
export function calculateWorldEscapeVelocity({ mass, diameterKm } = {}) {
  if (!Number.isFinite(mass) || !Number.isFinite(diameterKm) || diameterKm <= 0) return null;
  return Math.sqrt(mass / (diameterKm / TERRA_DIAMETER_KM)) * TERRA_ESCAPE_VELOCITY_MS;
}

/**
 * Calculate orbital velocity at the world surface (m/s).
 * Formula: EscapeVelocity Ã· âˆš2
 *
 * @param {{ escapeVelocity: number }} options
 * @returns {number|null}
 */
export function calculateWorldOrbitalVelocitySurface({ escapeVelocity } = {}) {
  if (!Number.isFinite(escapeVelocity)) return null;
  return escapeVelocity / Math.SQRT2;
}

/**
 * Calculate orbital velocity at altitude above the world surface (m/s).
 * Formula: 11,186 Ã— âˆš( Mass Ã· (2 Ã— (Radius + h) Ã· RadiusâŠ•) )
 *
 * @param {{ mass: number, diameterKm: number, altitudeKm: number }} options
 * @returns {number|null}
 */
export function calculateWorldOrbitalVelocityAtAltitude({ mass, diameterKm, altitudeKm } = {}) {
  if (!Number.isFinite(mass) || !Number.isFinite(diameterKm) || !Number.isFinite(altitudeKm)) {
    return null;
  }
  const radiusKm = diameterKm / 2;
  return TERRA_ESCAPE_VELOCITY_MS * Math.sqrt(mass / ((2 * (radiusKm + altitudeKm)) / TERRA_RADIUS_KM));
}

// â”€â”€ SIZE: Profile String â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Format the world Size profile string: Sâ€‘Dkmâ€‘Dâ€‘Gâ€‘M
 *
 * Fields: Size code â€“ Diameter (km) â€“ Density (2dp) â€“ Gravity (2dp) â€“ Mass (2dp)
 *
 * @example
 * formatWorldSizeProfile({ sizeCode: '5', diameterKm: 8163, density: 1.03, gravity: 0.66, mass: 0.27 })
 * // â†’ '5-8163-1.03-0.66-0.27'
 *
 * @param {{ sizeCode: string|number, diameterKm: number, density: number, gravity: number, mass: number }} options
 * @returns {string}
 */
export function formatWorldSizeProfile({ sizeCode, diameterKm, density, gravity, mass } = {}) {
  const fmt2 = (v) => (Number.isFinite(v) ? Number(v).toFixed(2) : "?");
  return [
    String(sizeCode ?? "?"),
    Number.isFinite(diameterKm) ? String(Math.round(diameterKm)) : "?",
    fmt2(density),
    fmt2(gravity),
    fmt2(mass),
  ].join("-");
}

// â”€â”€ ROTATION PERIOD (DAY LENGTH) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Roll one instance of the basic rotation rate.
 *
 * Formula: (2Dâˆ’2) Ã— multiplier + 2 + 1D + ageDm
 * Standard worlds: multiplier = 4.  Gas giants and Size 0/S: multiplier = 2.
 * System age DM: +1 per 2 Gyr (floor).
 *
 * Range without extension: 3â€“48+ hours.
 *
 * @param {object} [options]
 * @param {boolean} [options.isSmallOrGasGiant=false]
 * @param {number}  [options.systemAgeGyr=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll2d: number, roll1d: number, ageDm: number, multiplier: number, hours: number }}
 */
export function rollBaseRotationRateHours({ isSmallOrGasGiant = false, systemAgeGyr = 0, rng = Math.random } = {}) {
  const multiplier = Boolean(isSmallOrGasGiant) ? 2 : 4;
  const roll2dResult = roll2d(rng);
  const roll1dResult = roll1d(rng);
  const ageDm = Math.floor(Math.max(0, Number(systemAgeGyr) || 0) / 2);
  const hours = (roll2dResult - 2) * multiplier + 2 + roll1dResult + ageDm;
  return { roll2d: roll2dResult, roll1d: roll1dResult, ageDm, multiplier, hours };
}

/**
 * Roll a world's full sidereal day length in hours, applying the extension chain.
 *
 * If the initial result is â‰¥ 40, roll 1D: on a 5+ add another basic rotation-rate
 * determination to the total and roll 1D again, repeating until the result is < 5.
 *
 * @param {object} [options]
 * @param {boolean} [options.isSmallOrGasGiant=false]
 * @param {number}  [options.systemAgeGyr=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ rolls: Array, continuationRolls: number[], siderealDayHours: number, extended: boolean }}
 */
export function rollWorldRotationPeriodHours({ isSmallOrGasGiant = false, systemAgeGyr = 0, rng = Math.random } = {}) {
  const firstRoll = rollBaseRotationRateHours({ isSmallOrGasGiant, systemAgeGyr, rng });
  const rolls = [firstRoll];
  const continuationRolls = [];
  let siderealDayHours = firstRoll.hours;

  if (siderealDayHours >= 40) {
    let continuationRoll = roll1d(rng);
    continuationRolls.push(continuationRoll);
    while (continuationRoll >= 5) {
      const addl = rollBaseRotationRateHours({ isSmallOrGasGiant, systemAgeGyr, rng });
      rolls.push(addl);
      siderealDayHours += addl.hours;
      continuationRoll = roll1d(rng);
      continuationRolls.push(continuationRoll);
    }
  }

  return { rolls, continuationRolls, siderealDayHours, extended: rolls.length > 1 };
}

/**
 * Roll extra precision for a rotation period: minutes and seconds.
 *
 * Minutes and seconds each use 1Dâˆ’1 for the tens digit (0â€“5) and 1D10 for the
 * ones digit (0â€“9, where a d10 result of 10 maps to 0).
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ minutes: number, seconds: number }}
 */
export function rollRotationPeriodPrecision({ rng = Math.random } = {}) {
  const minutesTens = roll1d(rng) - 1;
  const minutesOnes = roll1d10(rng) % 10;
  const secondsTens = roll1d(rng) - 1;
  const secondsOnes = roll1d10(rng) % 10;
  return {
    minutes: minutesTens * 10 + minutesOnes,
    seconds: secondsTens * 10 + secondsOnes,
  };
}

/**
 * Convert a rotation period in hours, minutes, seconds to decimal hours.
 *
 * @param {object} [options]
 * @param {number} options.hours
 * @param {number} [options.minutes=0]
 * @param {number} [options.seconds=0]
 * @returns {number}
 */
export function calculateRotationPeriodDecimalHours({ hours, minutes = 0, seconds = 0 } = {}) {
  return Number(hours) + Number(minutes) / 60 + Number(seconds) / 3600;
}

/**
 * Format a rotation period as a hours-minutes-seconds string.
 *
 * @example
 * formatRotationPeriodHMS({ hours: 42, minutes: 22, seconds: 15 }) // â†’ "42h 22m 15s"
 *
 * @param {object} [options]
 * @param {number} options.hours
 * @param {number} [options.minutes=0]
 * @param {number} [options.seconds=0]
 * @returns {string}
 */
export function formatRotationPeriodHMS({ hours, minutes = 0, seconds = 0 } = {}) {
  const h = Math.floor(Number(hours) || 0);
  const m = Math.floor(Number(minutes) || 0);
  const s = Math.floor(Number(seconds) || 0);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

/**
 * Calculate solar days in a local year and the solar day length.
 *
 * Solar Days in year = (yearHours / siderealDayHours) âˆ’ 1
 * Solar Day (hours) = yearHours / solarDaysInYear
 *
 * If the world is tidally locked (solarDaysInYear â‰ˆ 0), solarDayHours is Infinity.
 * Retrograde rotation is indicated by a negative siderealDayHours.
 *
 * @param {object} [options]
 * @param {number} options.yearHours         Total hours in one local year.
 * @param {number} options.siderealDayHours  Sidereal day in hours. Negative for retrograde.
 * @returns {{ solarDaysInYear: number|null, solarDayHours: number|null, isTidallyLocked: boolean, isRetrograde: boolean }}
 */
export function calculateSolarDaysInYear({ yearHours, siderealDayHours } = {}) {
  const year = Number(yearHours);
  const sidereal = Number(siderealDayHours);

  if (!Number.isFinite(year) || !Number.isFinite(sidereal) || sidereal === 0) {
    return { solarDaysInYear: null, solarDayHours: null, isTidallyLocked: false, isRetrograde: false };
  }

  const isRetrograde = sidereal < 0;
  const solarDaysInYear = year / sidereal - 1;

  if (Math.abs(solarDaysInYear) < 1e-9) {
    return { solarDaysInYear: 0, solarDayHours: Infinity, isTidallyLocked: true, isRetrograde };
  }

  const solarDayHours = year / solarDaysInYear;
  return { solarDaysInYear, solarDayHours, isTidallyLocked: false, isRetrograde };
}

// -- AXIAL TILT ---------------------------------------------------------------

/** Table 52: Axial Tilt (2D). */
export const AXIAL_TILT_TABLE_52 = Object.freeze([
  Object.freeze({ minRoll: 2, maxRoll: 4, formula: "(1D-1) / 50", rangeLabel: "0.00-0.10 deg" }),
  Object.freeze({ minRoll: 5, maxRoll: 5, formula: "1D / 5", rangeLabel: "0.2-1.2 deg" }),
  Object.freeze({ minRoll: 6, maxRoll: 6, formula: "1D", rangeLabel: "1-6 deg" }),
  Object.freeze({ minRoll: 7, maxRoll: 7, formula: "6 + 1D", rangeLabel: "7-12 deg" }),
  Object.freeze({ minRoll: 8, maxRoll: 9, formula: "5 + 1D x 5", rangeLabel: "10-35 deg" }),
  Object.freeze({ minRoll: 10, maxRoll: 12, formula: "Extreme", rangeLabel: null }),
]);

/** Table 53: Extreme Axial Tilt (1D). */
export const EXTREME_AXIAL_TILT_TABLE_53 = Object.freeze([
  Object.freeze({
    minRoll: 1,
    maxRoll: 2,
    formula: "10 + 1D x 10",
    rangeLabel: "20-70 deg",
    remark: "High axial tilt",
  }),
  Object.freeze({
    minRoll: 3,
    maxRoll: 3,
    formula: "30 + 1D x 10",
    rangeLabel: "40-90 deg",
    remark: "Extreme axial tilt",
  }),
  Object.freeze({
    minRoll: 4,
    maxRoll: 4,
    formula: "90 + 1D x 1D",
    rangeLabel: "91-126 deg",
    remark: "Retrograde rotation",
  }),
  Object.freeze({
    minRoll: 5,
    maxRoll: 5,
    formula: "180 - 1D x 1D",
    rangeLabel: "144-180 deg",
    remark: "Extreme retrograde",
  }),
  Object.freeze({
    minRoll: 6,
    maxRoll: 6,
    formula: "120 + 1D x 10",
    rangeLabel: "130-180 deg",
    remark: "Extreme retrograde with high variance",
  }),
]);

/**
 * Clamp an axial tilt to the valid range 0-180 degrees.
 *
 * Excess over 180 degrees wraps back: 190 deg -> 360 deg - 190 deg = 170 deg.
 *
 * @param {number} degrees
 * @returns {number|null}
 */
export function clampAxialTiltDegrees(degrees) {
  const d = Number(degrees);
  if (!Number.isFinite(d)) return null;
  if (d <= 0) return 0;
  if (d <= 180) return d;
  return 360 - d;
}

/**
 * Roll axial tilt (Tables 52 and 53).
 *
 * Returns the provisional base degrees plus all intermediate roll values.
 * Tilts >= 90 degrees are flagged as retrograde.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll2d: number,
 *   extremeTableRoll: number|null,
 *   extraRolls: number[],
 *   baseDegrees: number,
 *   isRetrograde: boolean
 * }}
 */
export function rollAxialTilt({ rng = Math.random } = {}) {
  const twoD = roll2d(rng);
  let baseDegrees;
  let extremeTableRoll = null;
  let extraRolls = [];

  if (twoD <= 4) {
    const d1 = roll1d(rng);
    extraRolls = [d1];
    baseDegrees = (d1 - 1) / 50;
  } else if (twoD === 5) {
    const d1 = roll1d(rng);
    extraRolls = [d1];
    baseDegrees = d1 / 5;
  } else if (twoD === 6) {
    const d1 = roll1d(rng);
    extraRolls = [d1];
    baseDegrees = d1;
  } else if (twoD === 7) {
    const d1 = roll1d(rng);
    extraRolls = [d1];
    baseDegrees = 6 + d1;
  } else if (twoD <= 9) {
    const d1 = roll1d(rng);
    extraRolls = [d1];
    baseDegrees = 5 + d1 * 5;
  } else {
    extremeTableRoll = roll1d(rng);
    if (extremeTableRoll <= 2) {
      const d1 = roll1d(rng);
      extraRolls = [d1];
      baseDegrees = 10 + d1 * 10;
    } else if (extremeTableRoll === 3) {
      const d1 = roll1d(rng);
      extraRolls = [d1];
      baseDegrees = 30 + d1 * 10;
    } else if (extremeTableRoll === 4) {
      const d1 = roll1d(rng);
      const d2 = roll1d(rng);
      extraRolls = [d1, d2];
      baseDegrees = 90 + d1 * d2;
    } else if (extremeTableRoll === 5) {
      const d1 = roll1d(rng);
      const d2 = roll1d(rng);
      extraRolls = [d1, d2];
      baseDegrees = 180 - d1 * d2;
    } else {
      const d1 = roll1d(rng);
      extraRolls = [d1];
      baseDegrees = 120 + d1 * 10;
    }
    baseDegrees = clampAxialTiltDegrees(baseDegrees) ?? baseDegrees;
  }

  return {
    roll2d: twoD,
    extremeTableRoll,
    extraRolls,
    baseDegrees,
    isRetrograde: baseDegrees > 90,
  };
}

/**
 * Roll arc-minute and arc-second precision for an axial tilt base value.
 *
 * Uses the same procedure as day-length precision:
 * tens digit = 1D-1 (0-5 -> 0, 10, 20, 30, 40, 50),
 * ones digit = d10  (0-9).
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {{ arcMinutes: number, arcSeconds: number }}
 */
export function rollAxialTiltPrecision({ rng = Math.random } = {}) {
  const minutesTens = roll1d(rng) - 1;
  const minutesOnes = roll1d10(rng) % 10;
  const secondsTens = roll1d(rng) - 1;
  const secondsOnes = roll1d10(rng) % 10;
  return {
    arcMinutes: minutesTens * 10 + minutesOnes,
    arcSeconds: secondsTens * 10 + secondsOnes,
  };
}

/**
 * Convert axial tilt in degrees, arc-minutes, and arc-seconds to decimal degrees.
 *
 * @param {object} [options]
 * @param {number} options.degrees
 * @param {number} [options.arcMinutes=0]
 * @param {number} [options.arcSeconds=0]
 * @returns {number}
 */
export function calculateAxialTiltDecimalDegrees({ degrees, arcMinutes = 0, arcSeconds = 0 } = {}) {
  return Number(degrees) + Number(arcMinutes) / 60 + Number(arcSeconds) / 3600;
}

/**
 * Format axial tilt as a degrees-arc-minutes-arc-seconds string.
 *
 * @example
 * formatAxialTiltDMS({ degrees: 73, arcMinutes: 39 }) // -> "73° 39' 00\""
 *
 * @param {object} [options]
 * @param {number} options.degrees
 * @param {number} [options.arcMinutes=0]
 * @param {number} [options.arcSeconds=0]
 * @returns {string}
 */
export function formatAxialTiltDMS({ degrees, arcMinutes = 0, arcSeconds = 0 } = {}) {
  const d = Math.floor(Number(degrees) || 0);
  const m = Math.floor(Number(arcMinutes) || 0);
  const s = Math.floor(Number(arcSeconds) || 0);
  return `${d}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

// -- TIDAL IMPACTS ------------------------------------------------------------

/**
 * Calculate the proportional tidal force exerted on a body.
 *
 * Tidal force is directly proportional to the mass of the influencing body
 * and the diameter of the affected body, and inversely proportional to the
 * cube of the distance between them:
 *
 *   TF ~ (otherBodyMass * affectedBodyDiameter) / distance^3
 *
 * All inputs must use consistent units. The returned value is a dimensionless
 * proportional tidal force index (not an SI value). Subsequent rules sections
 * apply game-specific scaling constants on top of this base relationship.
 *
 * @param {object} options
 * @param {number} options.otherBodyMass        - Mass of the influencing body
 * @param {number} options.affectedBodyDiameter - Diameter of the affected body
 * @param {number} options.distance             - Distance between the two bodies
 * @returns {number|null} Proportional tidal force index, or null for invalid inputs
 */
export function calculateTidalForce({ otherBodyMass, affectedBodyDiameter, distance } = {}) {
  const m = Number(otherBodyMass);
  const d = Number(affectedBodyDiameter);
  const r = Number(distance);
  if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(r)) return null;
  if (r === 0) return null;
  return (m * d) / r ** 3;
}

/**
 * Star tidal effect in meters for a world.
 *
 * Formula:
 *   (starMass * worldSize) / (32 * distanceAu^3)
 *
 * @param {object} options
 * @param {number} options.starMass   star mass in solar masses
 * @param {number} options.worldSize  Traveller Size code of the affected world
 * @param {number} options.distanceAu orbital distance in AU
 * @returns {number|null}
 */
export function calculateStarTidalEffect({ starMass, worldSize, distanceAu } = {}) {
  const m = Number(starMass);
  const s = Number(worldSize);
  const au = Number(distanceAu);
  if (!Number.isFinite(m) || !Number.isFinite(s) || !Number.isFinite(au)) return null;
  if (au <= 0) return null;
  return (m * s) / (32 * au ** 3);
}

/**
 * Moon tidal effect in meters on a planet.
 *
 * Formula:
 *   (moonMass * planetSize) / (3.2 * (moonDistanceKm / 1,000,000)^3)
 *
 * @param {object} options
 * @param {number} options.moonMass       moon mass in Earth masses
 * @param {number} options.planetSize     Traveller Size code of affected planet
 * @param {number} options.moonDistanceKm moon distance from planet in km
 * @returns {number|null}
 */
export function calculateMoonTidalEffect({ moonMass, planetSize, moonDistanceKm } = {}) {
  const m = Number(moonMass);
  const s = Number(planetSize);
  const km = Number(moonDistanceKm);
  if (!Number.isFinite(m) || !Number.isFinite(s) || !Number.isFinite(km)) return null;
  if (km <= 0) return null;

  const distanceMillionKm = km / 1_000_000;
  return (m * s) / (3.2 * distanceMillionKm ** 3);
}

/**
 * Planet tidal effect in meters on a moon.
 *
 * Formula:
 *   (planetMass * moonSize) / (3.2 * (moonDistanceKm / 1,000,000)^3)
 *
 * @param {object} options
 * @param {number} options.planetMass     planet mass in Earth masses
 * @param {number} options.moonSize       Traveller Size code of affected moon
 * @param {number} options.moonDistanceKm moon distance from planet in km
 * @returns {number|null}
 */
export function calculatePlanetTidalEffect({ planetMass, moonSize, moonDistanceKm } = {}) {
  const m = Number(planetMass);
  const s = Number(moonSize);
  const km = Number(moonDistanceKm);
  if (!Number.isFinite(m) || !Number.isFinite(s) || !Number.isFinite(km)) return null;
  if (km <= 0) return null;

  const distanceMillionKm = km / 1_000_000;
  return (m * s) / (3.2 * distanceMillionKm ** 3);
}

/**
 * Moon-to-moon tidal effect in meters on the affected moon.
 *
 * Formula:
 *   (otherMass * moonSize) / (3.2 * (moonSeparationKm / 1,000,000)^3)
 *
 * @param {object} options
 * @param {number} options.otherMass        mass of the other moon in Earth masses
 * @param {number} options.moonSize         Traveller Size code of affected moon
 * @param {number} options.moonSeparationKm separation between moons in km
 * @returns {number|null}
 */
export function calculateMoonToMoonTidalEffect({ otherMass, moonSize, moonSeparationKm } = {}) {
  const m = Number(otherMass);
  const s = Number(moonSize);
  const km = Number(moonSeparationKm);
  if (!Number.isFinite(m) || !Number.isFinite(s) || !Number.isFinite(km)) return null;
  if (km <= 0) return null;

  const distanceMillionKm = km / 1_000_000;
  return (m * s) / (3.2 * distanceMillionKm ** 3);
}

/**
 * Calculate tidal stress factor from total tidal effects.
 *
 * Formula:
 *   floor(sum(tidalEffectsMeters) / 10)
 *
 * The sum can be passed directly via `totalTidalEffectsMeters` or as an
 * array of individual effects in meters via `tidalEffectsMeters`.
 *
 * @param {object} [options]
 * @param {number[]} [options.tidalEffectsMeters=[]]
 * @param {number} [options.totalTidalEffectsMeters]
 * @returns {number|null}
 */
export function calculateTidalStressFactor({ tidalEffectsMeters = [], totalTidalEffectsMeters } = {}) {
  const explicitTotal = Number(totalTidalEffectsMeters);

  let total = 0;
  if (Number.isFinite(explicitTotal)) {
    total = explicitTotal;
  } else if (Array.isArray(tidalEffectsMeters)) {
    total = tidalEffectsMeters.reduce((sum, effect) => {
      const value = Number(effect);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  } else {
    return null;
  }

  if (!Number.isFinite(total) || total < 0) return null;
  return Math.floor(total / 10);
}

/**
 * Calculate tidal heating factor.
 *
 * Formula:
 *   (primaryMassEarth^2 * worldSize^5 * eccentricity^2)
 *   / (3000 * distanceMkm^5 * periodDays * worldMassEarth)
 *
 * Inputs use Traveller-compatible units:
 * - `primaryMassEarth` and `worldMassEarth`: Terra masses
 * - `worldSize`: size units where 1 ~= 1600 km
 * - `distanceMkm`: millions of kilometers
 * - `periodDays`: standard days
 * - `eccentricity`: orbital eccentricity
 *
 * Results below 1 are treated as negligible and return 0.
 *
 * @param {object} [options]
 * @param {number} options.primaryMassEarth
 * @param {number} options.worldSize
 * @param {number} options.eccentricity
 * @param {number} options.distanceMkm
 * @param {number} options.periodDays
 * @param {number} options.worldMassEarth
 * @returns {number|null}
 */
export function calculateTidalHeatingFactor({
  primaryMassEarth,
  worldSize,
  eccentricity,
  distanceMkm,
  periodDays,
  worldMassEarth,
} = {}) {
  if (
    primaryMassEarth == null ||
    worldSize == null ||
    eccentricity == null ||
    distanceMkm == null ||
    periodDays == null ||
    worldMassEarth == null
  ) {
    return null;
  }

  const primaryMass = Number(primaryMassEarth);
  const size = Number(worldSize);
  const ecc = Number(eccentricity);
  const distance = Number(distanceMkm);
  const period = Number(periodDays);
  const worldMass = Number(worldMassEarth);

  if (
    !Number.isFinite(primaryMass) ||
    !Number.isFinite(size) ||
    !Number.isFinite(ecc) ||
    !Number.isFinite(distance) ||
    !Number.isFinite(period) ||
    !Number.isFinite(worldMass)
  ) {
    return null;
  }

  if (primaryMass <= 0 || size <= 0 || ecc < 0 || distance <= 0 || period <= 0 || worldMass <= 0) {
    return null;
  }

  const factor = (primaryMass ** 2 * size ** 5 * ecc ** 2) / (3000 * distance ** 5 * period * worldMass);

  if (!Number.isFinite(factor) || factor < 0) {
    return null;
  }

  if (factor < 1) {
    return 0;
  }

  return Math.floor(factor);
}

/**
 * Calculate total seismic stress.
 * Total seismic stress is the sum of residual seismic stress,
 * ongoing tidal stress factor, and tidal heating factor.
 *
 * @param {object} [options]
 * @param {number} [options.seismicStress=0]
 * @param {number} [options.tidalStressFactor=0]
 * @param {number} [options.tidalHeatingFactor=0]
 * @returns {number}
 */
export function calculateTotalSeismicStress({ seismicStress = 0, tidalStressFactor = 0, tidalHeatingFactor = 0 } = {}) {
  const s = Number(seismicStress);
  const t = Number(tidalStressFactor);
  const h = Number(tidalHeatingFactor);
  return (
    (Number.isFinite(s) && s >= 0 ? s : 0) +
    (Number.isFinite(t) && t >= 0 ? t : 0) +
    (Number.isFinite(h) && h >= 0 ? h : 0)
  );
}

/**
 * Apply seismic temperature correction to a temperature value.
 *
 * Formula: New Temperature (K) = ⁴√(OldTemperature(K)⁴ + TotalSeismicStress⁴)
 *
 * When total seismic stress is 0 the temperature is unchanged.
 * Result is rounded to the nearest integer degree Celsius.
 *
 * @param {number} tempC - Temperature in degrees Celsius
 * @param {number} totalSeismicStress - Total seismic stress value (treated as K)
 * @returns {number} Corrected temperature in degrees Celsius
 */
export function applySeismicTemperatureCorrection(tempC, totalSeismicStress) {
  const tK = Number(tempC) + 273.15;
  const s = Number(totalSeismicStress);
  if (!Number.isFinite(tK) || !Number.isFinite(s) || s <= 0) return tempC;
  const correctedK = (tK ** 4 + s ** 4) ** 0.25;
  return Math.round(correctedK - 273.15);
}

/**
 * Calculate the number of major tectonic plates.
 *
 * Conditions for tectonic plate activity:
 *   - totalSeismicStress > 0
 *   - hydrographics >= 1 (liquid-water-based)
 *
 * Formula: Size + Hydrographics − 2D + DMs
 *   DM +1 if totalSeismicStress is between 10 and 100 (inclusive)
 *   DM +2 if totalSeismicStress is greater than 100
 *
 * Returns 0 when conditions are not met or the result is ≤ 1 (no tectonic activity).
 *
 * @param {object} [options]
 * @param {number} options.size
 * @param {number} options.hydrographics
 * @param {number} options.totalSeismicStress
 * @param {number} options.roll2D - Pre-rolled 2D6 result (2–12)
 * @returns {number}
 */
export function calculateTectonicPlates({ size, hydrographics, totalSeismicStress, roll2D } = {}) {
  const s = Number(size);
  const h = Number(hydrographics);
  const stress = Number(totalSeismicStress);
  const roll = Number(roll2D);

  if (!Number.isFinite(s) || !Number.isFinite(h) || !Number.isFinite(stress) || !Number.isFinite(roll)) return 0;
  if (stress <= 0 || h < 1) return 0;

  let dm = 0;
  if (stress > 100) dm = 2;
  else if (stress >= 10) dm = 1;

  const result = s + h - roll + dm;
  return result >= 2 ? Math.floor(result) : 0;
}

// -- TIDAL LOCK EFFECT --------------------------------------------------------

/** Table 54: Tidal Lock Status (2D + DM result lookup). */
export const TIDAL_LOCK_STATUS_TABLE_54 = Object.freeze([
  Object.freeze({
    minRoll: -Infinity,
    maxRoll: 2,
    effectCode: "NO_EFFECT",
    dayMultiplier: null,
    progradeMultiplier: null,
    lockType: "NONE",
    description: "No effect on day length",
    remark: "Retain existing sidereal day length",
  }),
  Object.freeze({
    minRoll: 3,
    maxRoll: 3,
    effectCode: "MULTIPLY_1_5",
    dayMultiplier: 1.5,
    progradeMultiplier: null,
    lockType: "NONE",
    description: "Day length = day length x 1.5",
    remark: null,
  }),
  Object.freeze({
    minRoll: 4,
    maxRoll: 4,
    effectCode: "MULTIPLY_2",
    dayMultiplier: 2,
    progradeMultiplier: null,
    lockType: "NONE",
    description: "Day length = day length x 2",
    remark: null,
  }),
  Object.freeze({
    minRoll: 5,
    maxRoll: 5,
    effectCode: "MULTIPLY_3",
    dayMultiplier: 3,
    progradeMultiplier: null,
    lockType: "NONE",
    description: "Day length = day length x 3",
    remark: null,
  }),
  Object.freeze({
    minRoll: 6,
    maxRoll: 6,
    effectCode: "MULTIPLY_5",
    dayMultiplier: 5,
    progradeMultiplier: null,
    lockType: "NONE",
    description: "Day length = day length x 5",
    remark: null,
  }),
  Object.freeze({
    minRoll: 7,
    maxRoll: 7,
    effectCode: "PROGRADE_SHORT",
    dayMultiplier: null,
    progradeMultiplier: 5,
    lockType: "NONE",
    description: "Prograde rotation: 1D x 5 x 24 hours",
    remark: null,
  }),
  Object.freeze({
    minRoll: 8,
    maxRoll: 8,
    effectCode: "PROGRADE_LONG",
    dayMultiplier: null,
    progradeMultiplier: 20,
    lockType: "NONE",
    description: "Prograde rotation: 1D x 20 x 24 hours",
    remark: null,
  }),
  Object.freeze({
    minRoll: 9,
    maxRoll: 9,
    effectCode: "RETROGRADE_MEDIUM",
    dayMultiplier: null,
    progradeMultiplier: 10,
    lockType: "NONE",
    description: "Retrograde rotation: 1D x 10 x 24 hours",
    remark: "If axial tilt < 90 deg, change to axial tilt = 180 deg - axial tilt",
  }),
  Object.freeze({
    minRoll: 10,
    maxRoll: 10,
    effectCode: "RETROGRADE_LONG",
    dayMultiplier: null,
    progradeMultiplier: 50,
    lockType: "NONE",
    description: "Retrograde rotation: 1D x 50 x 24 hours",
    remark: "If axial tilt < 90 deg, change to axial tilt = 180 deg - axial tilt",
  }),
  Object.freeze({
    minRoll: 11,
    maxRoll: 11,
    effectCode: "RESONANCE_3_2",
    dayMultiplier: null,
    progradeMultiplier: null,
    lockType: "RESONANCE_3_2",
    description: "3:2 tidal lock",
    remark: null,
  }),
  Object.freeze({
    minRoll: 12,
    maxRoll: Infinity,
    effectCode: "LOCK_1_1",
    dayMultiplier: null,
    progradeMultiplier: null,
    lockType: "LOCK_1_1",
    description: "1:1 tidal lock",
    remark: "De-lock check on natural 12; reroll axial tilt on Axial Tilt table; reroll eccentricity (DM-2) if > 0.1",
  }),
]);

/**
 * Calculate DMs common to all three tidal lock cases.
 *
 * Axial tilt DMs are explicitly additive per the rules:
 * - above 30 deg:      DM-2
 * - between 60-120 deg: DM-4
 * - between 80-100 deg: DM-4
 *
 * In edge conditions the DM closer to 0 is used (e.g. age exactly 5 Gyrs picks
 * DM+2 over DM-2). Boundaries are handled with strict inequalities aligned to
 * the edge rule throughout.
 *
 * @param {object} [options]
 * @param {number} [options.size=0]
 * @param {number} [options.eccentricity=0]
 * @param {number} [options.axialTilt=0]          degrees
 * @param {number} [options.atmosphericPressureBar=0]
 * @param {number} [options.systemAgeGyr]
 * @returns {number}
 */
export function calculateTidalLockCommonDMs({
  size = 0,
  eccentricity = 0,
  axialTilt = 0,
  atmosphericPressureBar = 0,
  systemAgeGyr,
} = {}) {
  let dm = 0;
  const sz = Number(size);
  const ecc = Number(eccentricity);
  const tilt = Number(axialTilt);
  const press = Number(atmosphericPressureBar);
  const age = systemAgeGyr == null ? NaN : Number(systemAgeGyr);

  // Size 1+: DM + ceil(Size / 3)
  if (sz >= 1) dm += Math.ceil(sz / 3);

  // Eccentricity > 0.1: DM - floor(eccentricity * 10)
  if (ecc > 0.1) dm -= Math.floor(ecc * 10);

  // Axial tilt DMs - additive
  if (tilt > 30) dm -= 2;
  if (tilt >= 60 && tilt <= 120) dm -= 4;
  if (tilt >= 80 && tilt <= 100) dm -= 4;

  // Atmospheric pressure > 2.5 bar: DM-2
  if (press > 2.5) dm -= 2;

  // System age (edge at 5 Gyr: +2 is closer to 0 than -2, so >= 5 picks DM+2)
  if (age >= 10)
    dm += 4; // > 10 (and == 10 edge: +4 closer to 0 than +2)
  else if (age >= 5)
    dm += 2; // 5 <= age < 10
  else if (age < 1) dm -= 2; // < 1

  return dm;
}

/**
 * Calculate DMs for a planet's lock to its star (or multiple stars).
 *
 * Orbit number formula for Orbit# < 1:
 *   DM = +4 + Math.floor(1 - Orbit#) * 10
 * For any practical inner orbit 0 < Orbit# < 1 this resolves to +4 (same as
 * the 1-2 range). Only the theoretical Orbit 0 yields +14.
 *
 * @param {object} [options]
 * @param {number} [options.orbitNumber=1]
 * @param {number} [options.totalStarMass=1]          combined mass of all stars orbited
 * @param {number} [options.numStarsOrbited=1]
 * @param {number} [options.totalSignificantMoonSize=0]  sum of Size of all Size-1+ moons
 * @returns {number}
 */
export function calculateTidalLockStarDMs({
  orbitNumber = 1,
  totalStarMass = 1,
  numStarsOrbited = 1,
  totalSignificantMoonSize = 0,
} = {}) {
  let dm = -4; // Base DM
  const orb = Number(orbitNumber);
  const mass = Number(totalStarMass);
  const stars = Number(numStarsOrbited);
  const moonSize = Number(totalSignificantMoonSize);

  // Orbit number DM
  if (orb < 1) {
    dm += 4 + Math.floor(1 - orb) * 10; // for 0<orb<1 the extra term = 0
  } else if (orb < 2) {
    dm += 4;
  } else if (orb <= 3) {
    // Includes orb==2 (edge: +1 closer to 0 than +4) and orb==3 (edge: +1 closer to 0 than -6)
    dm += 1;
  } else {
    dm -= Math.floor(orb) * 2;
  }

  // Star mass DM - edge rule: closer to 0
  if (mass < 0.5) dm -= 2;
  else if (mass < 1.0)
    dm -= 1; // at 0.5 edge: -1 closer to 0 than -2
  else if (mass > 5) dm += 2;
  else if (mass > 2) dm += 1; // at 5 edge: +1 closer to 0 than +2

  // Multiple stars
  if (stars > 1) dm -= stars;

  // Significant moons reduce star-lock tendency
  if (moonSize > 0) dm -= moonSize;

  return dm;
}

/**
 * Calculate DMs for a moon's lock to its parent planet.
 *
 * @param {object} [options]
 * @param {number} [options.moonOrbitPD=5]   moon orbit radius in planetary diameters
 * @param {boolean} [options.isRetrograde=false]
 * @param {number} [options.planetMass=1]    planet mass in Earth masses
 * @returns {number}
 */
export function calculateTidalLockMoonToPlanetDMs({ moonOrbitPD = 5, isRetrograde = false, planetMass = 1 } = {}) {
  let dm = 6; // Base DM
  const pd = Number(moonOrbitPD);
  const pm = Number(planetMass);

  // Moon orbit > 20 PD: DM - floor(PD / 20)  [strict >; at 20 edge: 0 closer to 0 than -1]
  if (pd > 20) dm -= Math.floor(pd / 20);

  if (isRetrograde) dm -= 2;

  // Planet mass DMs - edge rule: closer to 0
  if (pm > 1000) dm += 8;
  else if (pm > 100)
    dm += 6; // at 1000 edge: +6
  else if (pm > 10)
    dm += 4; // at 100 edge: +4
  else if (pm > 1) dm += 2; // at 10 edge: +2; at 1 edge: 0

  return dm;
}

/**
 * Calculate DMs for a planet's lock to its moon.
 *
 * Moon orbit boundary at exactly 5 PD uses DM+4 (closer to 0 than the formula
 * result of +5), at 10 PD uses +2, at 20 PD uses +1, at 40 PD uses 0, and at
 * 60 PD uses 0 (closer to 0 than -6).
 *
 * @param {object} [options]
 * @param {number} [options.moonSize=0]
 * @param {number} [options.moonOrbitPD=5]
 * @param {number} [options.numSignificantMoons=1]
 * @returns {number}
 */
export function calculateTidalLockPlanetToMoonDMs({ moonSize = 0, moonOrbitPD = 5, numSignificantMoons = 1 } = {}) {
  let dm = -10; // Base DM
  const sz = Number(moonSize);
  const pd = Number(moonOrbitPD);
  const nm = Number(numSignificantMoons);

  // Moon Size 1+: DM + Moon Size
  if (sz >= 1) dm += sz;

  // Moon orbit DMs (edge-adjusted boundaries - see JSDoc)
  if (pd < 5) {
    dm += 5 + Math.ceil((5 - pd) * 5);
  } else if (pd < 10) {
    dm += 4;
  } else if (pd < 20) {
    dm += 2;
  } else if (pd < 40) {
    dm += 1;
  } else if (pd > 60) {
    dm -= 6;
  }
  // 40 <= pd <= 60: no DM (implicit 0)

  // Multiple significant moons: DM-2 per moon beyond the first
  if (nm > 1) dm -= (nm - 1) * 2;

  return dm;
}

/**
 * Roll on the Tidal Lock Status table (Table 54).
 *
 * Handles automatic outcomes:
 * - totalDM <= -10: no roll; returns "NO_EFFECT"
 * - totalDM >= +10: auto 1:1 lock; first rolls 2D as de-lock check - on a
 *   natural 12 the table is re-rolled with DM 0
 *
 * For any 1:1 lock rolled normally, if the natural 2D result is 12 the table
 * is re-rolled with DM 0 (the de-lock recursion consumes rng calls in sequence).
 *
 * Rows 7-10 include an internal 1D roll for the absolute day-length result.
 *
 * @param {object} [options]
 * @param {number} [options.totalDM=0]
 * @param {Function} [options.rng=Math.random]
 * @returns {{
 *   roll2d: number|null,
 *   adjustedRoll: number|null,
 *   effectCode: string,
 *   lockType: string,
 *   dayMultiplier: number|null,
 *   progradeMultiplier: number|null,
 *   extraRoll: number|null,
 *   newDayHours: number|null,
 *   isRetrograde: boolean,
 *   autoResult: string|null
 * }}
 */
export function rollTidalLockStatus({ totalDM = 0, rng = Math.random } = {}) {
  if (totalDM <= -10) {
    return {
      roll2d: null,
      adjustedRoll: null,
      effectCode: "NO_EFFECT",
      lockType: "NONE",
      dayMultiplier: null,
      progradeMultiplier: null,
      extraRoll: null,
      newDayHours: null,
      isRetrograde: false,
      autoResult: "no_roll_needed",
    };
  }

  if (totalDM >= 10) {
    // Auto 1:1 lock - run de-lock check (natural 12 on 2D -> re-roll at DM 0)
    const checkRoll = roll2d(rng);
    if (checkRoll === 12) return rollTidalLockStatus({ totalDM: 0, rng });
    return {
      roll2d: null,
      adjustedRoll: null,
      effectCode: "LOCK_1_1",
      lockType: "LOCK_1_1",
      dayMultiplier: null,
      progradeMultiplier: null,
      extraRoll: null,
      newDayHours: null,
      isRetrograde: false,
      autoResult: "auto_lock",
    };
  }

  const r2d = roll2d(rng);
  const adjusted = r2d + totalDM;
  const entry = TIDAL_LOCK_STATUS_TABLE_54.find((e) => adjusted >= e.minRoll && adjusted <= e.maxRoll);
  const effectCode = entry?.effectCode ?? "NO_EFFECT";

  // Rows 7-10: roll 1D for absolute day-length formula
  let extraRoll = null;
  let newDayHours = null;
  if (entry?.progradeMultiplier != null) {
    extraRoll = roll1d(rng);
    newDayHours = extraRoll * entry.progradeMultiplier * 24;
  }

  // 1:1 lock de-lock: natural 2D = 12 -> re-roll table at DM 0
  if (effectCode === "LOCK_1_1" && r2d === 12) {
    return rollTidalLockStatus({ totalDM: 0, rng });
  }

  return {
    roll2d: r2d,
    adjustedRoll: adjusted,
    effectCode,
    lockType: entry?.lockType ?? "NONE",
    dayMultiplier: entry?.dayMultiplier ?? null,
    progradeMultiplier: entry?.progradeMultiplier ?? null,
    extraRoll,
    newDayHours,
    isRetrograde: effectCode === "RETROGRADE_MEDIUM" || effectCode === "RETROGRADE_LONG",
    autoResult: null,
  };
}

/**
 * Adjust axial tilt for retrograde rotation (Table 54 rows 9-10).
 *
 * If axial tilt is less than 90 deg, converts to the supplementary retrograde
 * representation: 180 deg - axialTilt.
 *
 * @param {number} axialTilt degrees
 * @returns {number|null}
 */
export function adjustAxialTiltForRetrograde(axialTilt) {
  const t = Number(axialTilt);
  if (!Number.isFinite(t)) return null;
  return t < 90 ? 180 - t : t;
}

/**
 * Reroll axial tilt for a 1:1 tidal lock.
 *
 * This follows the lock-effects rule: roll 1D on the Axial Tilt table,
 * using the same formulas as the standard table rows.
 *
 * @param {object} [options]
 * @param {Function} [options.rng=Math.random]
 * @returns {number}
 */
export function rollTidalLockAxialTiltReroll({ rng = Math.random } = {}) {
  const tableRoll = roll1d(rng);

  if (tableRoll === 1) return (roll1d(rng) - 1) / 50;
  if (tableRoll === 2) return roll1d(rng) / 5;
  if (tableRoll === 3) return roll1d(rng);
  if (tableRoll === 4) return 6 + roll1d(rng);
  if (tableRoll === 5) return 5 + roll1d(rng) * 5;

  const extremeRoll = roll1d(rng);
  let tilt;

  if (extremeRoll <= 2) {
    tilt = 10 + roll1d(rng) * 10;
  } else if (extremeRoll === 3) {
    tilt = 30 + roll1d(rng) * 10;
  } else if (extremeRoll === 4) {
    const d1 = roll1d(rng);
    const d2 = roll1d(rng);
    tilt = 90 + d1 * d2;
  } else if (extremeRoll === 5) {
    const d1 = roll1d(rng);
    const d2 = roll1d(rng);
    tilt = 180 - d1 * d2;
  } else {
    tilt = 120 + roll1d(rng) * 10;
  }

  return clampAxialTiltDegrees(tilt) ?? tilt;
}

/**
 * Select the final eccentricity for a 1:1 tidally locked world (Table 54 footnote).
 *
 * The caller is responsible for rolling the new candidate eccentricity with
 * DM-2 applied. This helper applies the rule exactly: if original eccentricity
 * is 0.1 or less, no reduction is applied; otherwise use the lower value.
 *
 * @param {object} options
 * @param {number} options.originalEccentricity
 * @param {number} options.newEccentricity
 * @returns {number|null}
 */
export function selectTidalLockEccentricity({ originalEccentricity, newEccentricity } = {}) {
  const orig = Number(originalEccentricity);
  const newE = Number(newEccentricity);
  if (!Number.isFinite(orig) || !Number.isFinite(newE)) return null;
  if (orig <= 0.1) return orig;
  return Math.min(orig, newE);
}

// ── SEISMOLOGY: Residual Seismic Stress ───────────────────────────────────────

/**
 * Calculate the Residual Seismic Stress for a terrestrial world.
 *
 * Formula: floor(Size − Age(Gyrs) + DMs)²
 * A pre-square value less than 1 yields a stress of 0 (geologically dead).
 *
 * DMs applied:
 *   - World is a moon of another body:   +1
 *   - Each Size ≥ 1 moon of this world:  +moonSize (total capped at +12)
 *   - Density > 1.0 (relative to water): +2  ← table rule
 *   - Density < 0.5:                     -1
 *
 * NOTE: The source example for "Zed Prime" (density 1.03) shows +1 for density
 * rather than +2. This implementation follows the DM table (+2), which is the
 * explicit formal rule. The example may contain a typographical error.
 *
 * @param {object}   [options]
 * @param {number}   options.size          World size code (0–10+)
 * @param {number}   options.ageGyr        System/world age in billions of years
 * @param {boolean}  [options.isMoon=false] Whether this world orbits another world
 * @param {number[]} [options.moonSizes=[]] Size codes of this world's significant moons (≥1 each)
 * @param {number}   [options.density]     World density relative to water (Earth ≈ 1.0)
 * @returns {{ preSquare: number, stress: number, dms: object }|null}
 */
export function calculateResidualSeismicStress({ size, ageGyr, isMoon = false, moonSizes = [], density } = {}) {
  const sizeNum = Number(size);
  const ageNum = Number(ageGyr);
  if (!Number.isFinite(sizeNum) || !Number.isFinite(ageNum)) return null;

  // DM: being a moon of another body
  const moonDm = Boolean(isMoon) ? 1 : 0;

  // DM: moon sizes (Size ≥1 moons only), capped at +12
  const sizes = Array.isArray(moonSizes) ? moonSizes : [];
  const rawMoonSizeDm = sizes.reduce((sum, s) => {
    const ms = Number(s);
    return Number.isFinite(ms) && ms >= 1 ? sum + ms : sum;
  }, 0);
  const moonSizeDm = Math.min(12, rawMoonSizeDm);

  // DM: density
  const densityNum = Number(density);
  let densityDm = 0;
  if (Number.isFinite(densityNum)) {
    if (densityNum > 1.0) densityDm = 2;
    else if (densityNum < 0.5) densityDm = -1;
  }

  const totalDm = moonDm + moonSizeDm + densityDm;
  const rawValue = sizeNum - ageNum + totalDm;
  const preSquare = Math.floor(rawValue);
  const stress = preSquare >= 1 ? preSquare * preSquare : 0;

  return {
    preSquare,
    stress,
    dms: { moonDm, moonSizeDm, rawMoonSizeDm, densityDm, totalDm },
  };
}
