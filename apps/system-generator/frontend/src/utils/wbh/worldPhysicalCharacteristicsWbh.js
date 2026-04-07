import { calculatePlanetaryOrbitalPeriod } from "./systemGenerationWbh.js";

import { createRandomRoller, rollDice } from "./dice.js";

export const WORLD_PHYSICAL_CHARACTERISTIC_RULES = Object.freeze([
  {
    id: "world-size",
    section: "Chapter 5 > Size and Diameter",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "composition-density-gravity-mass",
    section: "Chapter 5 > Composition and Density > Gravity and Mass",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "atmosphere",
    section: "Chapter 5 > Atmosphere",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "hydrographics",
    section: "Chapter 5 > Hydrographics",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "rotation-tilt-tides-temperature",
    section: "Chapter 5 > Rotation Period, Axial Tilts, Tidal Effects, Mean Temperature",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "seismology-life-mainworld",
    section:
      "Chapter 5 > Seismology, Native Lifeforms, Resource Rating, Habitability Rating, Final Mainworld Determination",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
]);

const WORLD_SIZE_TABLE = Object.freeze({
  0: { averageDiameterKm: 0, minDiameterKm: null, maxDiameterKm: null, code: "0" },
  R: { averageDiameterKm: 0, minDiameterKm: null, maxDiameterKm: null, code: "R" },
  S: { averageDiameterKm: 600, minDiameterKm: 400, maxDiameterKm: 799, code: "S" },
  1: { averageDiameterKm: 1600, minDiameterKm: 800, maxDiameterKm: 2399, code: "1" },
  2: { averageDiameterKm: 3200, minDiameterKm: 2400, maxDiameterKm: 3999, code: "2" },
  3: { averageDiameterKm: 4800, minDiameterKm: 4000, maxDiameterKm: 5599, code: "3" },
  4: { averageDiameterKm: 6400, minDiameterKm: 5600, maxDiameterKm: 7199, code: "4" },
  5: { averageDiameterKm: 8000, minDiameterKm: 7200, maxDiameterKm: 8799, code: "5" },
  6: { averageDiameterKm: 9600, minDiameterKm: 8800, maxDiameterKm: 10399, code: "6" },
  7: { averageDiameterKm: 11200, minDiameterKm: 10400, maxDiameterKm: 11999, code: "7" },
  8: { averageDiameterKm: 12800, minDiameterKm: 12000, maxDiameterKm: 13599, code: "8" },
  9: { averageDiameterKm: 14400, minDiameterKm: 13600, maxDiameterKm: 15199, code: "9" },
  A: { averageDiameterKm: 16000, minDiameterKm: 15200, maxDiameterKm: 16799, code: "A" },
  B: { averageDiameterKm: 17600, minDiameterKm: 16800, maxDiameterKm: 18399, code: "B" },
  C: { averageDiameterKm: 19200, minDiameterKm: 18400, maxDiameterKm: 19999, code: "C" },
  D: { averageDiameterKm: 20800, minDiameterKm: 20000, maxDiameterKm: 21599, code: "D" },
  E: { averageDiameterKm: 22400, minDiameterKm: 21600, maxDiameterKm: 23199, code: "E" },
  F: { averageDiameterKm: 24000, minDiameterKm: 23200, maxDiameterKm: 24799, code: "F" },
});
const SIZE_CODE_SEQUENCE = ["S", 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
const TERRESTRIAL_COMPOSITION_TABLE = Object.freeze([
  { min: -Infinity, max: -4, composition: "Exotic Ice" },
  { min: -3, max: 2, composition: "Mostly Ice" },
  { min: 3, max: 6, composition: "Mostly Rock" },
  { min: 7, max: 11, composition: "Rock and Metal" },
  { min: 12, max: 14, composition: "Mostly Metal" },
  { min: 15, max: Infinity, composition: "Compressed Metal" },
]);
const TERRESTRIAL_DENSITY_TABLE = Object.freeze({
  "Exotic Ice": { 2: 0.03, 3: 0.06, 4: 0.09, 5: 0.12, 6: 0.15, 7: 0.18, 8: 0.21, 9: 0.24, 10: 0.27, 11: 0.3, 12: 0.33 },
  "Mostly Ice": { 2: 0.18, 3: 0.21, 4: 0.24, 5: 0.27, 6: 0.3, 7: 0.33, 8: 0.36, 9: 0.39, 10: 0.41, 11: 0.44, 12: 0.47 },
  "Mostly Rock": { 2: 0.5, 3: 0.53, 4: 0.56, 5: 0.59, 6: 0.62, 7: 0.65, 8: 0.68, 9: 0.71, 10: 0.74, 11: 0.77, 12: 0.8 },
  "Rock and Metal": {
    2: 0.82,
    3: 0.85,
    4: 0.88,
    5: 0.91,
    6: 0.94,
    7: 0.97,
    8: 1,
    9: 1.03,
    10: 1.06,
    11: 1.09,
    12: 1.12,
  },
  "Mostly Metal": {
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
  },
  "Compressed Metal": { 2: 1.5, 3: 1.55, 4: 1.6, 5: 1.65, 6: 1.7, 7: 1.75, 8: 1.8, 9: 1.85, 10: 1.9, 11: 1.95, 12: 2 },
});
const TERRA_DIAMETER_KM = 12742;
const TERRA_RADIUS_KM = 6371;
const TERRA_ESCAPE_VELOCITY_MPS = 11186;
const ATMOSPHERE_TABLE = Object.freeze({
  0: "Vacuum",
  1: "Trace",
  2: "Very Thin, Tainted",
  3: "Very Thin",
  4: "Thin, Tainted",
  5: "Thin",
  6: "Standard",
  7: "Standard, Tainted",
  8: "Dense",
  9: "Dense, Tainted",
  10: "Exotic",
  11: "Corrosive",
  12: "Insidious",
  15: "Dense, High",
});
const STAR_TEMP_MOD = Object.freeze({
  O: 4,
  B: 3,
  A: 2,
  F: 1,
  G: 0,
  K: -1,
  M: -2,
  D: -3,
  BD: -4,
  L: -4,
  T: -5,
  Y: -6,
  PROTO: 1,
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sizeCodeToNumeric(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  if (normalized === "R" || normalized === "S") {
    return 0;
  }
  if (normalized === "A") return 10;
  if (normalized === "B") return 11;
  if (normalized === "C") return 12;
  if (normalized === "D") return 13;
  if (normalized === "E") return 14;
  if (normalized === "F") return 15;
  return Number(normalized) || 0;
}

function resolveStarTemperatureModifier(starClass) {
  const normalized = String(starClass || "")
    .trim()
    .toUpperCase();
  if (/^PROTO/.test(normalized)) return STAR_TEMP_MOD.PROTO;
  if (/^BD/.test(normalized)) return STAR_TEMP_MOD.BD;
  if (/^D/.test(normalized)) return STAR_TEMP_MOD.D;
  if (/^L/.test(normalized)) return STAR_TEMP_MOD.L;
  if (/^T/.test(normalized)) return STAR_TEMP_MOD.T;
  if (/^Y/.test(normalized)) return STAR_TEMP_MOD.Y;
  return STAR_TEMP_MOD[normalized.charAt(0)] ?? 0;
}

function toRomanNumeral(value) {
  const safeValue = Math.max(1, Math.trunc(Number(value) || 1));
  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remaining = safeValue;
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

function rollSingleDie(rollDie, sides) {
  return clamp(Math.round(Number(rollDie(sides)) || 1), 1, sides);
}

export function getWbhAtmosphereDescription(code) {
  return ATMOSPHERE_TABLE[Number(code)] ?? "Unusual";
}

export function determineAtmosphereCode({ sizeCode, rollTotal } = {}) {
  return clamp(Number(rollTotal) - 7 + sizeCodeToNumeric(sizeCode), 0, 15);
}

export function determineHydrographics({ atmosphereCode, rollTotal } = {}) {
  if (Number(atmosphereCode) === 0 || Number(atmosphereCode) === 1) {
    return 0;
  }
  return clamp(Number(rollTotal) - 7 + Number(atmosphereCode), 0, 10);
}

export function categorizeWorldTemperature(avgTempC) {
  if (avgTempC < -50) return "Frozen";
  if (avgTempC < 0) return "Cold";
  if (avgTempC < 30) return "Temperate";
  if (avgTempC < 60) return "Hot";
  return "Scorching";
}

export function calculateAverageSurfaceTemperature({ starClass, atmosphereCode, hydrographics } = {}) {
  const tempMod = resolveStarTemperatureModifier(starClass);
  const baseTemp = 15 + tempMod * 15 + (Number(atmosphereCode) >= 6 ? 20 : 0) - Number(hydrographics) * 2;
  return Math.round(baseTemp);
}

export function determineMagnetosphere({ density = 0, gravity = 0, atmosphereCode = 0, rollTotal } = {}) {
  const score =
    Number(rollTotal) +
    (Number(density) >= 0.8 ? 1 : 0) +
    (Number(gravity) >= 0.7 ? 1 : 0) -
    (Number(atmosphereCode) === 0 ? 1 : 0);
  return score >= 7 ? "Present" : "Absent";
}

export function determineDayLengthHours({ sizeCode, rollDie = createRandomRoller() } = {}) {
  const sizeModifier = Math.max(0, sizeCodeToNumeric(sizeCode) - 5);
  return Number((12 + rollSingleDie(rollDie, 6) * 4 + sizeModifier + (rollSingleDie(rollDie, 10) - 1) / 10).toFixed(1));
}

export function determineAxialTilt({ rollDie = createRandomRoller() } = {}) {
  return clamp(rollSingleDie(rollDie, 10) * 4 - rollSingleDie(rollDie, 6), 0, 90);
}

export function determineOrbitalPeriodDays({ orbitNumber, stellarMasses = [] } = {}) {
  if (
    Number.isFinite(Number(orbitNumber)) &&
    Array.isArray(stellarMasses) &&
    stellarMasses.some((mass) => Number(mass) > 0)
  ) {
    return Math.round(calculatePlanetaryOrbitalPeriod({ orbitNumber, stellarMasses }).days);
  }
  return null;
}

export function rollNativeSophontLife({ size, atmosphereCode, hydrographics, avgTempC }) {
  if (size <= 0) return false;

  let habitabilityScore = 0;
  if (atmosphereCode >= 4 && atmosphereCode <= 9) habitabilityScore += 2;
  else if (atmosphereCode >= 2 && atmosphereCode <= 3) habitabilityScore += 1;

  if (hydrographics >= 1 && hydrographics <= 9) habitabilityScore += 2;
  else if (hydrographics === 10) habitabilityScore += 1;

  if (avgTempC >= -10 && avgTempC <= 38) habitabilityScore += 2;
  else if (avgTempC >= -30 && avgTempC <= 60) habitabilityScore += 1;

  if (size >= 4) habitabilityScore += 1;
  if (habitabilityScore < 3) return false;

  const threshold = habitabilityScore >= 6 ? 8 : habitabilityScore >= 4 ? 10 : 12;
  return Number(rollTotalOrDice(2, 6));
}

function rollTotalOrDice(count, sides, rollDie = createRandomRoller()) {
  return rollDice(rollDie, count, sides);
}

export function determineNativeSophontLife({
  size,
  atmosphereCode,
  hydrographics,
  avgTempC,
  rollDie = createRandomRoller(),
} = {}) {
  if (size <= 0) return false;

  let habitabilityScore = 0;
  if (atmosphereCode >= 4 && atmosphereCode <= 9) habitabilityScore += 2;
  else if (atmosphereCode >= 2 && atmosphereCode <= 3) habitabilityScore += 1;

  if (hydrographics >= 1 && hydrographics <= 9) habitabilityScore += 2;
  else if (hydrographics === 10) habitabilityScore += 1;

  if (avgTempC >= -10 && avgTempC <= 38) habitabilityScore += 2;
  else if (avgTempC >= -30 && avgTempC <= 60) habitabilityScore += 1;

  if (size >= 4) habitabilityScore += 1;
  if (habitabilityScore < 3) return false;

  const threshold = habitabilityScore >= 6 ? 8 : habitabilityScore >= 4 ? 10 : 12;
  return rollDice(rollDie, 2, 6) >= threshold;
}

export function determineWorldMoons({
  sizeCode,
  atmosphereCode,
  hydrographics,
  isGasGiant = false,
  parentName,
  generateMoons = true,
  moonProfileFactory = null,
  rollDie = createRandomRoller(),
} = {}) {
  if (!generateMoons || sizeCodeToNumeric(sizeCode) <= 0) {
    return [];
  }

  const moons = [];
  let dm = 0;
  const numericSize = sizeCodeToNumeric(sizeCode);
  if (numericSize <= 2) dm -= 2;
  if (numericSize >= 8) dm += 2;
  if (Number(atmosphereCode) === 0) dm -= 1;
  if (Number(hydrographics) === 0) dm -= 1;
  if (isGasGiant) dm += 3;

  const adjusted = rollDice(rollDie, 2, 6) + dm;
  let significant = Math.max(0, Math.round((adjusted - 7) / 2) + (isGasGiant ? 1 : 0));
  significant = clamp(significant, 0, 12);

  const ringBase = isGasGiant ? 0.25 : 0.05;
  const ringChance = Math.min(0.9, ringBase + significant * 0.05);
  const hasRings = rollSingleDie(rollDie, 20) / 20 < ringChance;

  for (let index = 0; index < significant; index += 1) {
    const ordinal = toRomanNumeral(index + 1);
    const name = `${parentName} ${ordinal}`;
    const sizeCategory = clamp(Math.max(0, Math.round(rollDice(rollDie, 1, 6) / 2) + (isGasGiant ? 1 : 0)), 0, 10);
    const worldProfile =
      typeof moonProfileFactory === "function" ? moonProfileFactory({ worldName: name, sizeCode: sizeCategory }) : null;
    moons.push({
      name,
      type: "significant",
      size: sizeCategory,
      orbitalSlot: index + 1,
      ring: false,
      description: `${isGasGiant ? "Gas-giant" : "World"} significant moon`,
      ...(worldProfile && typeof worldProfile === "object" ? { worldProfile } : {}),
    });
  }

  const minorCount = Math.max(0, Math.round((rollDice(rollDie, 2, 6) - 6) / 3 + Math.floor(significant / 2)));
  for (let index = 0; index < minorCount; index += 1) {
    const slot = significant + index + 1;
    moons.push({
      name: `${parentName} ${toRomanNumeral(slot)}`,
      type: "insignificant",
      size: clamp(Math.round((rollSingleDie(rollDie, 6) - 1) / 2), 0, 5),
      orbitalSlot: slot,
      ring: false,
      description: "Small/insignificant moon",
    });
  }

  if (hasRings && moons.length > 0) {
    const pick = clamp(rollSingleDie(rollDie, moons.length) - 1, 0, moons.length - 1);
    moons[pick].ring = true;
    moons[pick].description += ", with ring";
  }

  return moons;
}

export function buildWbhEnvironmentalProfile(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const sizeCode = normalizeSizeCode(params.sizeCode ?? params.size ?? "5");
  const size = params.size ?? sizeCodeToNumeric(sizeCode);
  const atmosphereCode =
    params.atmosphereCode ??
    determineAtmosphereCode({ sizeCode, rollTotal: params.atmosphereRoll ?? rollDice(rollDie, 2, 6) });
  const hydrographics =
    params.hydrographics ??
    determineHydrographics({ atmosphereCode, rollTotal: params.hydrographicsRoll ?? rollDice(rollDie, 2, 6) });
  const avgTempC =
    params.avgTempC ??
    calculateAverageSurfaceTemperature({ starClass: params.starClass, atmosphereCode, hydrographics });
  const moonsData = determineWorldMoons({
    sizeCode,
    atmosphereCode,
    hydrographics,
    isGasGiant: params.isGasGiant,
    parentName: String(params.worldName || params.name || "World").trim() || "World",
    generateMoons: params.generateMoons !== false,
    moonProfileFactory: params.moonProfileFactory,
    rollDie,
  });
  const orbitalPeriodDays =
    params.orbitalPeriodDays ??
    determineOrbitalPeriodDays({ orbitNumber: params.orbitNumber, stellarMasses: params.stellarMasses }) ??
    Math.round(200 + rollSingleDie(rollDie, 12) * 100);

  return {
    atmosphereCode,
    atmosphereDesc: getWbhAtmosphereDescription(atmosphereCode),
    hydrographics,
    avgTempC,
    tempCategory: categorizeWorldTemperature(avgTempC),
    orbitalPeriodDays,
    dayLengthHours: params.dayLengthHours ?? determineDayLengthHours({ sizeCode, rollDie }),
    axialTilt: params.axialTilt ?? determineAxialTilt({ rollDie }),
    moons: moonsData.length,
    moonsData,
    magnetosphere:
      params.magnetosphere ??
      determineMagnetosphere({
        density: params.density,
        gravity: params.gravity,
        atmosphereCode,
        rollTotal: params.magnetosphereRoll ?? rollDice(rollDie, 2, 6),
      }),
    nativeSophontLife:
      params.nativeSophontLife ??
      determineNativeSophontLife({
        size: Number(size) || 0,
        atmosphereCode,
        hydrographics,
        avgTempC,
        rollDie,
      }),
  };
}

function normalizeSizeCode(sizeCode) {
  const normalized = String(sizeCode).trim().toUpperCase();
  if (normalized === "10") return "A";
  if (normalized === "11") return "B";
  if (normalized === "12") return "C";
  if (normalized === "13") return "D";
  if (normalized === "14") return "E";
  if (normalized === "15") return "F";
  return normalized;
}

function resolveSizeModifier(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  if (normalized === "0" || normalized === "1" || normalized === "2" || normalized === "3" || normalized === "4") {
    return -1;
  }
  if (["6", "7", "8", "9"].includes(normalized)) {
    return 1;
  }
  if (["A", "B", "C", "D", "E", "F"].includes(normalized)) {
    return 3;
  }
  return 0;
}

function resolveOrbitModifier({ orbitNumber, hzco }) {
  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);

  if (!Number.isFinite(numericOrbit) || !Number.isFinite(numericHzco)) {
    return 0;
  }

  if (numericOrbit <= numericHzco) {
    return 1;
  }

  return -1 - Math.floor(numericOrbit - numericHzco);
}

export function expandWbhSizeBeyondA({ baseSize, rollDie }) {
  const normalizedBaseSize = Number(baseSize);
  if (!Number.isInteger(normalizedBaseSize)) {
    throw new TypeError("Base size must be an integer");
  }

  if (normalizedBaseSize !== 10) {
    return normalizedBaseSize;
  }

  if (typeof rollDie !== "function") {
    throw new TypeError("rollDie callback is required when expanding size beyond A");
  }

  let expandedSize = normalizedBaseSize;
  while (expandedSize < 15 && rollDie(6) >= 4) {
    expandedSize += 1;
  }

  return expandedSize;
}

export function getWbhWorldSizeEntry(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  const entry = WORLD_SIZE_TABLE[normalized];
  if (!entry) {
    throw new RangeError(`Unknown WBH size code: ${sizeCode}`);
  }
  return entry;
}

export function determineWorldDiameter({ sizeCode, rollDie = createRandomRoller(), detailDie = null } = {}) {
  const entry = getWbhWorldSizeEntry(sizeCode);
  if (entry.code === "0" || entry.code === "R") {
    return 0;
  }

  if (entry.code === "S") {
    let d6 = rollDie(6);
    while (d6 > 4) {
      d6 = rollDie(6);
    }
    return 400 + (d6 - 1) * 100 + (detailDie === null ? 0 : detailDie);
  }

  let increment = 1600;
  let d3 = 0;
  let d6 = 0;
  while (increment >= 1600) {
    d3 = rollDie(3);
    d6 = rollDie(6);
    increment = (d3 - 1) * 600 + (d6 - 1) * 100;
  }

  return entry.minDiameterKm + increment + (detailDie === null ? 0 : detailDie);
}

export function determineTerrestrialComposition({ sizeCode, orbitNumber, hzco, systemAgeGyr = 0, rollTotal } = {}) {
  const adjustedRoll =
    Number(rollTotal) +
    resolveSizeModifier(sizeCode) +
    resolveOrbitModifier({ orbitNumber, hzco }) +
    (Number(systemAgeGyr) > 10 ? -1 : 0);
  return (
    TERRESTRIAL_COMPOSITION_TABLE.find((entry) => adjustedRoll >= entry.min && adjustedRoll <= entry.max)
      ?.composition ?? "Mostly Rock"
  );
}

export function determineTerrestrialDensity({ composition, rollTotal } = {}) {
  const normalizedRoll = clamp(Math.round(Number(rollTotal) || 2), 2, 12);
  const density = TERRESTRIAL_DENSITY_TABLE[composition]?.[normalizedRoll];
  if (density === undefined) {
    throw new RangeError(`Unsupported composition or roll: ${composition} / ${rollTotal}`);
  }
  return density;
}

export function calculateWorldGravity({ density, diameterKm }) {
  return Number(density) * (Number(diameterKm) / TERRA_DIAMETER_KM);
}

export function calculateWorldMass({ density, diameterKm }) {
  return Number(density) * (Number(diameterKm) / TERRA_DIAMETER_KM) ** 3;
}

export function calculateEscapeVelocity({ mass, diameterKm }) {
  return Math.sqrt(Number(mass) / (Number(diameterKm) / TERRA_DIAMETER_KM)) * TERRA_ESCAPE_VELOCITY_MPS;
}

export function calculateSurfaceOrbitalVelocity({ escapeVelocityMps }) {
  return Number(escapeVelocityMps) / Math.sqrt(2);
}

export function calculateOrbitalVelocityAtHeight({ mass, diameterKm, heightKm }) {
  const radiusKm = Number(diameterKm) / 2;
  return TERRA_ESCAPE_VELOCITY_MPS * Math.sqrt(Number(mass) / (2 * ((radiusKm + Number(heightKm)) / TERRA_RADIUS_KM)));
}

export function buildWbhSizeProfile({ sizeCode, diameterKm, density, gravity, mass }) {
  return `${normalizeSizeCode(sizeCode)}-${Math.round(diameterKm)}-${Number(density).toFixed(2)}-${Number(gravity).toFixed(2)}-${Number(mass).toFixed(2)}`;
}

export function isBeltLikeSizeZeroWorld(world = {}) {
  return (
    Number(world?.size) === 0 &&
    String(world?.worldType || "")
      .toLowerCase()
      .includes("belt")
  );
}

export function generateWorldPhysicalCharacteristicsWbh(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const fallbackWorld =
    params.baseWorld && typeof params.baseWorld === "object"
      ? { ...params.baseWorld }
      : { ...(params && typeof params === "object" ? params : {}) };
  const resolvedWorldName = String(params.worldName || fallbackWorld.name || "World").trim() || "World";
  const sizeCode = normalizeSizeCode(params.sizeCode ?? params.size ?? fallbackWorld.size ?? "5");
  let diameterKm = 0;
  let composition = fallbackWorld.composition ?? null;
  let density = Number(fallbackWorld.density ?? 0);
  let gravity = Number(fallbackWorld.gravity ?? 0);
  let mass = Number(fallbackWorld.mass ?? 0);
  let escapeVelocityMps = Number(fallbackWorld.escapeVelocityMps ?? 0);
  let surfaceOrbitalVelocityMps = Number(fallbackWorld.surfaceOrbitalVelocityMps ?? 0);
  let sizeProfile = fallbackWorld.sizeProfile ?? null;

  if (sizeCode !== "0" && sizeCode !== "R") {
    const detailDie = params.detailDie ?? (rollDie(10) - 1) * 10 + (rollDie(10) - 1);
    diameterKm = determineWorldDiameter({ sizeCode, rollDie, detailDie });
    composition = determineTerrestrialComposition({
      sizeCode,
      orbitNumber: params.orbitNumber,
      hzco: params.hzco,
      systemAgeGyr: params.systemAgeGyr,
      rollTotal: params.compositionRoll ?? rollDice(rollDie, 2, 6),
    });
    density = determineTerrestrialDensity({
      composition,
      rollTotal: params.densityRoll ?? rollDice(rollDie, 2, 6),
    });
    gravity = calculateWorldGravity({ density, diameterKm });
    mass = calculateWorldMass({ density, diameterKm });
    escapeVelocityMps = calculateEscapeVelocity({ mass, diameterKm });
    surfaceOrbitalVelocityMps = calculateSurfaceOrbitalVelocity({ escapeVelocityMps });
    sizeProfile = buildWbhSizeProfile({ sizeCode, diameterKm, density, gravity, mass });
  }

  const environment = buildWbhEnvironmentalProfile({
    ...params,
    worldName: resolvedWorldName,
    sizeCode,
    density,
    gravity,
    generateMoons: params.generateMoons,
    moonProfileFactory: params.moonProfileFactory,
    rollDie,
  });

  return {
    ...fallbackWorld,
    ...environment,
    name: resolvedWorldName,
    size: params.size ?? sizeCode,
    diameterKm,
    composition,
    density,
    gravity,
    mass,
    escapeVelocityMps,
    surfaceOrbitalVelocityMps,
    sizeProfile,
    generatorModel: "wbh-world-physics",
    wbhStatus:
      sizeCode === "0" || sizeCode === "R"
        ? "implemented-environment-size-zero"
        : "implemented-world-environment-and-physics",
    wbhCoverage: WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  };
}
