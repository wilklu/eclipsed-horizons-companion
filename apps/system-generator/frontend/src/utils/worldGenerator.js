/**
 * worldGenerator.js
 *
 * System Worlds and Orbits generation per the World Builder's Handbook.
 * Handles enumeration, placement, and sizing of all significant bodies
 * in a star system: gas giants, planetoid belts, and other worlds.
 */

// ── Helpers ────────────────────────────────────────────────────────────────────

function roll1d(rng = Math.random) {
  return Math.floor(rng() * 6) + 1;
}

function roll2d(rng = Math.random) {
  return Math.floor(rng() * 6) + 1 + (Math.floor(rng() * 6) + 1);
}

function roll1d10(rng = Math.random) {
  return Math.floor(rng() * 10) + 1;
}

// ── Basic World Sizing (WBH Tables 16/17) ───────────────────────────────────

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

// ── Significant Moon Quantity (WBH Table 19) ───────────────────────────────

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

// ── Significant Moon Sizing (WBH Tables 20/21) ─────────────────────────────

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

// ── Insignificant Moon Quantity (Rule Of Thumb) ─────────────────────────────

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

// ── Gas Giant Existence ────────────────────────────────────────────────────────

/**
 * Determines if gas giants are present in the system.
 * Gas giants exist on a 2D roll of less than 10 (i.e., 2–9).
 *
 * @param {object} [options]
 * @param {Function} [options.rng] - Random number generator (0–1)
 * @returns {{ roll: number, exists: boolean }}
 */
export function rollGasGiantExistence({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return { roll, exists: roll < 10 };
}

// ── Gas Giant Quantity DMs ────────────────────────────────────────────────────

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

// ── Gas Giant Quantity Table ──────────────────────────────────────────────────

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
 * @param {Function} [options.rng] - Random number generator (0–1)
 * @returns {{ roll: number, dm: number, total: number, quantity: number, dmBreakdown: string[] }}
 */
export function rollGasGiantQuantity({ stars = [], rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const { dm, breakdown: dmBreakdown } = calculateGasGiantQuantityDm({ stars });
  const total = roll + dm;
  const quantity = lookupGasGiantQuantity(total);
  return { roll, dm, total, quantity, dmBreakdown };
}

// ── Main Gas Giant Generator ──────────────────────────────────────────────────

/**
 * Determines if gas giants exist in the system and, if so, how many.
 * Returns full generation result including existence check and quantity.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @param {Function} [options.rng] - Random number generator (0–1)
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

// ── Planetoid Belt Existence ──────────────────────────────────────────────────

/**
 * Determines if a planetoid belt is present in the system.
 * A belt exists on a 2D roll of 8 or more.
 *
 * @param {object} [options]
 * @param {Function} [options.rng] - Random number generator (0–1)
 * @returns {{ roll: number, exists: boolean }}
 */
export function rollPlanetoidBeltExistence({ rng = Math.random } = {}) {
  const roll = roll2d(rng);
  return { roll, exists: roll >= 8 };
}

// ── Planetoid Belt Quantity DMs ───────────────────────────────────────────────

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

// ── Planetoid Belt Quantity Table ─────────────────────────────────────────────

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
 * @param {Function} [options.rng] - Random number generator (0–1)
 * @returns {{ roll: number, dm: number, total: number, quantity: number, dmBreakdown: string[] }}
 */
export function rollPlanetoidBeltQuantity({ stars = [], gasGiantCount = 0, rng = Math.random } = {}) {
  const roll = roll2d(rng);
  const { dm, breakdown: dmBreakdown } = calculatePlanetoidBeltQuantityDm({ stars, gasGiantCount });
  const total = roll + dm;
  const quantity = lookupPlanetoidBeltQuantity(total);
  return { roll, dm, total, quantity, dmBreakdown };
}

// ── Main Planetoid Belt Generator ─────────────────────────────────────────────

/**
 * Determines if planetoid belts exist and, if so, how many.
 * Note: does not count a Size 0 mainworld's home belt.
 *
 * @param {object} options
 * @param {object[]} options.stars - Array of star objects in the system
 * @param {number} [options.gasGiantCount] - Gas giants already determined for this system
 * @param {Function} [options.rng] - Random number generator (0–1)
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

// ── Terrestrial Planets ──────────────────────────────────────────────────────

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
 * 2. If initial < 3: reroll as D3+2 (final range 3–5).
 * 3. If initial >= 3: reroll as D3-1 (final range 0–2).
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
    count = d3 + 2; // range 3–5
  } else {
    rerollType = "D3-1";
    count = Math.max(0, d3 - 1); // range 0–2
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

// ── Total Worlds ─────────────────────────────────────────────────────────────

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

// ── Minimum Allowable Orbit# (MAO) ───────────────────────────────────────────

/**
 * Table 11: Minimum Allowable Orbit# by spectral type and luminosity class.
 * null = "—" (this combination does not exist).
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
  return null; // WD, D, VII, post-stellar, brown dwarf — see Special Circumstances
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

// ── Available Orbits ──────────────────────────────────────────────────────────

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
 * by a secondary star (rules 5–7).
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
 * secondary star's own worlds (rules 8–11).
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

  // Rules 5–7: exclude zones around each secondary from primary orbits
  for (const secondary of secondaries) {
    const secondaryMao = lookupMinimumAllowableOrbit(secondary.spectralClass, secondary.luminosityClass);
    const exclusion = calcPrimaryExclusion(secondary, secondaryMao);
    primaryOrbits = subtractExclusion(primaryOrbits, exclusion);
  }

  // Rules 8–11 + companion rule 2: calculate each secondary's own orbit range
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

// ── Habitable Zone Centre Orbit# (HZCO) ──────────────────────────────────────────

/**
 * Table 12: Habitable Zone Centre in AU.
 * null = "—" (combination does not exist).
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
 * null = "—" (combination does not exist).
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
 * WBH standard orbit number↔AU table.
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
 * For HZCO >= 1.0: zone = HZCO ± 1.0 Orbit#s.
 * For HZCO < 1.0: zone = HZCO ± 0.1 Orbit#s (one-tenth as large per T5 rules);
 *   if the natural outer boundary would exceed Orbit# 1.0, it is extended to 1.2.
 *
 * Matches example from T5 WBH Mainworld Candidate rules:
 *   HZCO 3.3  → inner 2.3,  outer 4.3
 *   HZCO 0.92 → inner 0.82, outer 1.02 → extended to 1.2
 *   HZCO 0.75 → inner 0.65, outer 0.85
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

/**
 * Habitable Zones Regions temperature DM table.
 *
 * Effective deviation is positive (outside HZCO = colder) or negative (inside = warmer).
 * Table validated against T5 WBH Mainworld Candidate examples:
 *   deviation -0.2 → DM+2, +0.2 → DM-2, +0.8 → DM-4.
 */
const HZ_REGIONS_TABLE = [
  { minDeviation: -Infinity, maxDeviation: -0.5, dm: 4 }, // Hot inner zone
  { minDeviation: -0.5, maxDeviation: -0.1, dm: 2 }, // Warm inner zone
  { minDeviation: -0.1, maxDeviation: 0.1, dm: 0 }, // At HZCO
  { minDeviation: 0.1, maxDeviation: 0.5, dm: -2 }, // Cool outer zone
  { minDeviation: 0.5, maxDeviation: Infinity, dm: -4 }, // Cold outer zone
];

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
  if (!Number.isFinite(effectiveDeviation)) return 0;
  for (const row of HZ_REGIONS_TABLE) {
    if (effectiveDeviation >= row.minDeviation && effectiveDeviation < row.maxDeviation) {
      return row.dm;
    }
  }
  return HZ_REGIONS_TABLE[HZ_REGIONS_TABLE.length - 1].dm;
}

// ── Placement Of Worlds: Step 1 (Allocations By Star) ───────────────────────

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

// ── Placement Of Worlds: Step 2 (System Baseline Number) ────────────────────

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

// ── Placement Of Worlds: Step 3 (System Baseline Orbit) ─────────────────────

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

// ── Placement Of Worlds: Step 4 (Empty Orbits) ──────────────────────────────

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

// ── Placement Of Worlds: Step 5 (System Spread) ─────────────────────────────

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

// ── Placement Of Worlds: Step 6 (Placing Orbit# Slots) ──────────────────────

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

// ── Placement Of Worlds: Step 7 (Anomalous Planets) ─────────────────────────

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

// ── Placement Of Worlds: Step 9 (Eccentricity) ──────────────────────────────

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

  const finalSlots = step12.slots;

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
    },
    hzco,
    slots: finalSlots,
    placements: step8.placements,
    rollTable: step8.rollTable,
    anomalies: step7.anomalies,
  };
}

// ── Mainworld Candidate Identification ─────────────────────────────────────

/**
 * Roll atmosphere code for a candidate world using T5 rules.
 *
 * Formula: 2D − 7 + Size, clamped to 0–15.
 * Worlds of Size 0 or 1 automatically receive atmosphere 0 (no roll needed).
 *
 * @param {object} options
 * @param {number} options.size  World size value (integer 0–15).
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number|null, atmosphereCode: number }}
 */
export function rollWorldAtmosphereCode({ size, rng = Math.random } = {}) {
  const sizeVal = Math.max(0, Math.floor(Number(size) || 0));
  if (sizeVal <= 1) return { roll: null, atmosphereCode: 0 };
  const roll = roll2d(rng);
  return { roll, atmosphereCode: Math.max(0, Math.min(15, roll - 7 + sizeVal)) };
}

/**
 * Roll hydrographics code for a candidate world using T5 rules.
 *
 * Formula: 2D − 7 + Atmosphere, with DMs:
 *   - Atmosphere 0 or 1 → hydrographics auto 0 (no roll).
 *   - Atmosphere A (10) or higher → DM −4.
 *
 * @param {object} options
 * @param {number} options.atmosphereCode  Atmosphere code (0–15).
 * @param {Function} [options.rng=Math.random]
 * @returns {{ roll: number|null, hydrographicsCode: number }}
 */
export function rollWorldHydrographicsCode({ atmosphereCode, rng = Math.random } = {}) {
  const atmo = Math.max(0, Math.floor(Number(atmosphereCode) || 0));
  if (atmo <= 1) return { roll: null, hydrographicsCode: 0 };
  const dm = atmo >= 10 ? -4 : 0;
  const roll = roll2d(rng);
  return { roll, hydrographicsCode: Math.max(0, Math.min(10, roll - 7 + atmo + dm)) };
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
 *   - HZ = HZCO ± 1.0 Orbit#s; for HZCO < 1.0 the breadth is ±0.1
 *     (one-tenth as large), with outer extended to 1.2 if it crosses 1.0.
 *   - Only bodies with sizeValue >= 2 are evaluated for atmosphere/hydrographics;
 *     Size 0/1 worlds automatically have atmosphere 0 and hydrographics 0.
 *
 * @param {object} options
 * @param {Array<object>} options.slots      Placed world slots (post-Step 12 output).
 * @param {number}        options.hzco       Habitable zone centre Orbit#.
 * @param {boolean}       [options.rollPhysical=true]  Also roll Atmo+Hydro for each candidate.
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
 *     atmosphereRoll: number|null,
 *     atmosphereCode: number|null,
 *     hydrographicsRoll: number|null,
 *     hydrographicsCode: number|null,
 *   }>
 * }}
 */
export function identifyMainworldCandidates({ slots = [], hzco, rollPhysical = true, rng = Math.random } = {}) {
  const hzBounds = calculateHabitableZoneBoundsForHzco(hzco);
  if (!hzBounds) return { habitableZone: null, candidates: [] };

  const { innerOrbit, outerOrbit } = hzBounds;
  const HZ_TEMP_BASE = 7;
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
      const sizeValue = Number.isFinite(slot.sizeValue) ? slot.sizeValue : (fromEHex(sizeCode) ?? 0);
      const deviation = calculateHZCODeviation(orbit, hzco);
      const effectiveDeviation = calculateEffectiveHZCODeviation(orbit, hzco);
      const regionDm = lookupHabitableZoneRegionDm(effectiveDeviation);
      const temperatureRawRoll = HZ_TEMP_BASE + regionDm;

      let atmosphereRoll = null,
        atmosphereCode = null,
        hydrographicsRoll = null,
        hydrographicsCode = null;
      if (rollPhysical) {
        const atmoResult = rollWorldAtmosphereCode({ size: sizeValue, rng });
        atmosphereRoll = atmoResult.roll;
        atmosphereCode = atmoResult.atmosphereCode;
        const hydroResult = rollWorldHydrographicsCode({ atmosphereCode, rng });
        hydrographicsRoll = hydroResult.roll;
        hydrographicsCode = hydroResult.hydrographicsCode;
      }

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
        atmosphereRoll,
        atmosphereCode,
        hydrographicsRoll,
        hydrographicsCode,
      });
    }

    // --- Significant moons of any world type in the HZ ---
    if (orbit >= innerOrbit && orbit <= outerOrbit) {
      const moonDetails = slot.significantMoonSizeDetails ?? [];
      moonDetails.forEach((moon, moonIdx) => {
        if (moon.isRing) return;
        const moonSizeCode = String(moon.sizeCode ?? "S");
        const moonSizeValue = Number.isFinite(moon.sizeValue) ? moon.sizeValue : (fromEHex(moonSizeCode) ?? 0);
        if (moonSizeValue < 2) return; // Size 0/1 → no atmosphere

        const deviation = calculateHZCODeviation(orbit, hzco);
        const effectiveDeviation = calculateEffectiveHZCODeviation(orbit, hzco);
        const regionDm = lookupHabitableZoneRegionDm(effectiveDeviation);
        const temperatureRawRoll = HZ_TEMP_BASE + regionDm;

        let atmosphereRoll = null,
          atmosphereCode = null,
          hydrographicsRoll = null,
          hydrographicsCode = null;
        if (rollPhysical) {
          const atmoResult = rollWorldAtmosphereCode({ size: moonSizeValue, rng });
          atmosphereRoll = atmoResult.roll;
          atmosphereCode = atmoResult.atmosphereCode;
          const hydroResult = rollWorldHydrographicsCode({ atmosphereCode, rng });
          hydrographicsRoll = hydroResult.roll;
          hydrographicsCode = hydroResult.hydrographicsCode;
        }

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
          atmosphereRoll,
          atmosphereCode,
          hydrographicsRoll,
          hydrographicsCode,
        });
      });
    }
  }

  candidates.sort((a, b) => a.orbit - b.orbit);
  return { habitableZone: { innerOrbit, outerOrbit }, candidates };
}
