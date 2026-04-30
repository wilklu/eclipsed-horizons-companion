import { roll2d } from "./diceFormulasWbh.js";
import { createRandomRoller } from "./dice.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolve2d6Roll(rollDie) {
  const resolvedRollDie = typeof rollDie === "function" ? rollDie : createRandomRoller();
  return roll2d(resolvedRollDie);
}

export function calculateBiomassRating({
  atmosphereCode = 0,
  hydrographics = 0,
  avgTempC = 0,
  highTempC = null,
  systemAgeGyr = 5,
  zone = "",
  rollDie = null,
  returnBreakdown = false,
} = {}) {
  const numericAtmosphere = Number(atmosphereCode || 0);
  const numericHydrographics = Number(hydrographics || 0);
  const numericTemp = Number(avgTempC || 0);
  const parsedHighTemp = Number(highTempC);
  const numericHighTemp = Number.isFinite(parsedHighTemp) ? parsedHighTemp : numericTemp;
  const numericAge = Number.isFinite(Number(systemAgeGyr)) ? Number(systemAgeGyr) : 5;

  if (numericAge < 0.1) {
    return 0;
  }

  let biomassDm = 0;
  if (numericAtmosphere === 0) biomassDm -= 6;
  else if (numericAtmosphere === 1) biomassDm -= 4;
  else if ([2, 3, 14].includes(numericAtmosphere)) biomassDm -= 3;
  else if ([4, 5].includes(numericAtmosphere)) biomassDm -= 2;
  else if ([8, 9, 13].includes(numericAtmosphere)) biomassDm += 2;
  else if (numericAtmosphere === 10) biomassDm -= 3;
  else if (numericAtmosphere === 11) biomassDm -= 5;
  else if (numericAtmosphere === 12) biomassDm -= 7;
  else if (numericAtmosphere >= 15) biomassDm -= 5;

  if (numericHydrographics === 0) biomassDm -= 4;
  else if (numericHydrographics >= 1 && numericHydrographics <= 3) biomassDm -= 2;
  else if (numericHydrographics >= 6 && numericHydrographics <= 8) biomassDm += 1;
  else if (numericHydrographics >= 9) biomassDm += 2;

  if (Number.isFinite(numericHighTemp)) {
    if (numericHighTemp < 0) biomassDm -= 4;
    else if (numericHighTemp > 80) biomassDm -= 2;
  }

  if (numericTemp >= 6 && numericTemp <= 30) biomassDm += 2;
  else if (numericTemp < -50 || numericTemp > 60) biomassDm -= 6;
  else if (numericTemp < 0 || numericTemp > 30) biomassDm -= 2;

  if (numericAge < 0.2) biomassDm -= 6;
  else if (numericAge < 1) biomassDm -= 2;
  else if (numericAge > 4) biomassDm += 1;

  const zoneToken = String(zone || "")
    .trim()
    .toLowerCase();
  if (zoneToken === "hot" || zoneToken === "frozen") biomassDm -= 6;
  else if (zoneToken === "warm" || zoneToken === "cold") biomassDm -= 2;

  biomassDm = clamp(biomassDm, -12, 4);
  const rollTotal = resolve2d6Roll(rollDie);
  const total = Number(clamp(rollTotal + biomassDm, 0, 15));
  return returnBreakdown
    ? {
        value: total,
        rollTotal,
        dm: biomassDm,
      }
    : total;
}

export function calculateBiocomplexityRating({
  biomass = 0,
  atmosphereCode = 0,
  atmosphereTaints = [],
  systemAgeGyr = 5,
  rollDie = null,
  returnBreakdown = false,
} = {}) {
  const numericAtmosphere = Number(atmosphereCode || 0);
  const numericAge = Number.isFinite(Number(systemAgeGyr)) ? Number(systemAgeGyr) : 5;

  if (!(Number(biomass) > 0)) {
    return 0;
  }

  let biocomplexityDm = 0;
  if (numericAtmosphere < 4 || numericAtmosphere > 9) biocomplexityDm -= 2;
  if (
    (Array.isArray(atmosphereTaints) ? atmosphereTaints : []).some(
      (entry) =>
        String(entry?.code || entry)
          .trim()
          .toUpperCase() === "L",
    )
  ) {
    biocomplexityDm -= 2;
  }

  if (numericAge <= 1) biocomplexityDm -= 10;
  else if (numericAge <= 2) biocomplexityDm -= 8;
  else if (numericAge <= 3) biocomplexityDm -= 4;
  else if (numericAge <= 4) biocomplexityDm -= 2;

  const rollTotal = resolve2d6Roll(rollDie);
  const rollModifier = rollTotal - 7;
  const biocomplexity = Number(clamp(rollModifier + Math.min(Number(biomass), 9) + biocomplexityDm, 1, 15));
  return returnBreakdown
    ? {
        value: biocomplexity,
        rollTotal,
        rollModifier,
        dm: biocomplexityDm,
      }
    : biocomplexity;
}

export function calculateBiodiversityRating({
  biomass = 0,
  biocomplexity = 0,
  rollDie = null,
  returnBreakdown = false,
} = {}) {
  if (!(Number(biomass) > 0)) {
    return 0;
  }

  const rollTotal = resolve2d6Roll(rollDie);
  const rollModifier = rollTotal - 7;
  const biodiversity = Number(clamp(Math.ceil(rollModifier + (Number(biomass) + Number(biocomplexity)) / 2), 1, 15));
  return returnBreakdown
    ? {
        value: biodiversity,
        rollTotal,
        rollModifier,
        dm: 0,
      }
    : biodiversity;
}

export function calculateCompatibilityRating({
  biomass = 0,
  biocomplexity = 0,
  atmosphereCode = 0,
  atmosphereTaints = [],
  systemAgeGyr = 5,
  rollDie = null,
  returnBreakdown = false,
} = {}) {
  const numericAtmosphere = Number(atmosphereCode || 0);
  const numericAge = Number.isFinite(Number(systemAgeGyr)) ? Number(systemAgeGyr) : 5;

  if (!(Number(biocomplexity) > 0) && !(Number(biomass) > 0)) {
    return 0;
  }

  let compatibilityDm = 0;
  const hasTaint = (Array.isArray(atmosphereTaints) ? atmosphereTaints : []).length > 0;
  if ([0, 1, 11, 16, 17].includes(numericAtmosphere)) compatibilityDm -= 8;
  else if ([2, 4, 7, 9].includes(numericAtmosphere) || hasTaint) compatibilityDm -= 2;
  else if ([3, 5, 8].includes(numericAtmosphere)) compatibilityDm += 1;
  else if (numericAtmosphere === 6) compatibilityDm += 2;
  else if (numericAtmosphere === 10 || numericAtmosphere === 15) compatibilityDm -= 6;
  else if (numericAtmosphere === 12) compatibilityDm -= 10;
  else if ([13, 14].includes(numericAtmosphere)) compatibilityDm -= 1;
  if (numericAge > 8) compatibilityDm -= 2;

  const rollTotal = resolve2d6Roll(rollDie);
  const compatibility = Number(clamp(Math.floor(rollTotal - Number(biocomplexity) / 2 + compatibilityDm), 0, 15));
  return returnBreakdown
    ? {
        value: compatibility,
        rollTotal,
        dm: compatibilityDm,
      }
    : compatibility;
}
