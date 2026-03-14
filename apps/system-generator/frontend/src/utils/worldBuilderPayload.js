import {
  applySeismicTemperatureCorrection,
  calculateAxialTiltFactor,
  calculateMoonTidalEffect,
  calculateMoonToMoonTidalEffect,
  calculatePlanetTidalEffect,
  calculateResidualSeismicStress,
  calculateSolarDeclinationDegrees,
  calculateTectonicPlates,
  calculateTidalHeatingFactor,
  calculateStarTidalEffect,
  calculateTidalStressFactor,
  calculateTotalSeismicStress,
} from "./worldGenerator.js";
import { convertOrbitNumberToAu } from "./primaryStarGenerator.js";

const SOLAR_MASS_IN_EARTH_MASSES = 332_946;
const AU_IN_MILLION_KM = 149.5978709;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toPositiveNumber(value) {
  const numeric = toFiniteNumber(value);
  return numeric !== null && numeric > 0 ? numeric : null;
}

function toNonNegativeNumber(value) {
  const numeric = toFiniteNumber(value);
  return numeric !== null && numeric >= 0 ? numeric : null;
}

function toMoonSizeValue(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.max(0, Math.round(numeric));
  }

  const token = String(value || "")
    .trim()
    .toUpperCase();
  if (!token) {
    return null;
  }

  const parsed = parseInt(token, 36);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, parsed);
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, entry) => acc + entry, 0);
  return sum / values.length;
}

function normalizeTidalEffectsMeters(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((entry) => toNonNegativeNumber(entry))
    .filter((entry) => entry !== null)
    .map((entry) => +entry.toFixed(4));
}

function resolveTidalEffectsTotals({ tidalEffectsMeters = [], totalTidalEffectsMeters = null } = {}) {
  const explicitTotal = toNonNegativeNumber(totalTidalEffectsMeters);
  const normalizedEffects = normalizeTidalEffectsMeters(tidalEffectsMeters);

  if (explicitTotal !== null) {
    return {
      tidalEffectsMeters: normalizedEffects,
      totalTidalEffectsMeters: +explicitTotal.toFixed(4),
    };
  }

  const total = normalizedEffects.reduce((sum, entry) => sum + entry, 0);
  return {
    tidalEffectsMeters: normalizedEffects,
    totalTidalEffectsMeters: +total.toFixed(4),
  };
}

function firstFinitePositive(values = []) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
}

function firstFiniteNonNegative(values = []) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }

  return null;
}

function estimateMassEarthFromDiameterKm(diameterKm) {
  const diameter = Number(diameterKm);
  if (!Number.isFinite(diameter) || diameter <= 0) {
    return null;
  }

  const earthDiameterKm = 12_742;
  const ratio = diameter / earthDiameterKm;
  return ratio ** 3;
}

function resolveMoonOrbitDistanceKm(moonOrbitDetail, slot) {
  return firstFinitePositive([
    moonOrbitDetail?.period?.orbitKm,
    Number.isFinite(moonOrbitDetail?.orbitPd) &&
    Number.isFinite(slot?.basicDiameterKm) &&
    Number(slot.basicDiameterKm) > 0
      ? Number(moonOrbitDetail.orbitPd) * Number(slot.basicDiameterKm)
      : null,
  ]);
}

function collectNonRingMoonOrbitDetails(slot) {
  const orbitDetails = Array.isArray(slot?.significantMoonOrbitDetails) ? slot.significantMoonOrbitDetails : [];

  return orbitDetails
    .map((detail, nonRingIndex) => {
      if (detail?.sourceMoon?.isRing) {
        return null;
      }

      const massEarth = firstFinitePositive([
        detail?.massEarth,
        detail?.sourceMoon?.massEarth,
        detail?.sourceMoon?.gasGiantMassEarth,
      ]);
      const distanceKm = resolveMoonOrbitDistanceKm(detail, slot);
      if (!Number.isFinite(massEarth) || !Number.isFinite(distanceKm)) {
        return null;
      }

      const periodDays = firstFinitePositive([detail?.period?.periodDays, detail?.period?.days, detail?.periodDays]);
      const eccentricity = firstFiniteNonNegative([
        detail?.eccentricity,
        detail?.eccentricityRoll?.eccentricity,
        detail?.sourceMoon?.eccentricity,
      ]);

      return {
        nonRingIndex,
        massEarth,
        distanceKm,
        periodDays,
        eccentricity,
      };
    })
    .filter((entry) => entry !== null);
}

function resolveNonRingMoonIndex(slot, originalMoonIndex) {
  const moonDetails = Array.isArray(slot?.significantMoonSizeDetails) ? slot.significantMoonSizeDetails : [];
  const moonIndex = Number(originalMoonIndex);
  if (!Number.isFinite(moonIndex) || moonIndex < 0) {
    return null;
  }

  let nonRingIndex = -1;
  for (let index = 0; index <= moonIndex && index < moonDetails.length; index += 1) {
    if (!moonDetails[index]?.isRing) {
      nonRingIndex += 1;
    }
  }

  return nonRingIndex >= 0 ? nonRingIndex : null;
}

function resolveStarMassFromRecord(starRecord) {
  return firstFinitePositive([
    starRecord?.massInSolarMasses,
    starRecord?.massSolar,
    starRecord?.stellarMassSolar,
    starRecord?.mass,
    starRecord?.stellarMass,
  ]);
}

function resolveOrbitedStarMassSolar({ candidate, slot, stars, worldPlacement }) {
  const starList = Array.isArray(stars) ? stars : [];
  if (starList.length === 0) {
    return null;
  }

  const starKey = String(slot?.starKey || "primary");
  const slotOrbitNumber = Number(slot?.orbit ?? candidate?.orbit);

  if (starKey !== "primary") {
    const secondaryMatch = starKey.match(/^secondary-(\d+)$/);
    const secondaryIndex = secondaryMatch ? Number(secondaryMatch[1]) : NaN;
    const secondaryMass = Number.isFinite(secondaryIndex) ? resolveStarMassFromRecord(starList[secondaryIndex]) : null;
    return secondaryMass ?? resolveStarMassFromRecord(starList[0]);
  }

  let totalMass = resolveStarMassFromRecord(starList[0]) ?? 0;
  const starAllocations = Array.isArray(worldPlacement?.steps?.step1?.starAllocations)
    ? worldPlacement.steps.step1.starAllocations
    : [];

  if (Number.isFinite(slotOrbitNumber)) {
    const interiorSecondaryMass = starAllocations.reduce((sum, allocation) => {
      if (!String(allocation?.starKey || "").startsWith("secondary-")) {
        return sum;
      }

      const orbitNumber = Number(allocation?.orbitNumber);
      if (!Number.isFinite(orbitNumber) || orbitNumber >= slotOrbitNumber) {
        return sum;
      }

      const secondaryMatch = String(allocation.starKey).match(/^secondary-(\d+)$/);
      const secondaryIndex = secondaryMatch ? Number(secondaryMatch[1]) : NaN;
      const secondaryMass = Number.isFinite(secondaryIndex)
        ? resolveStarMassFromRecord(starList[secondaryIndex])
        : null;
      return sum + (secondaryMass ?? 0);
    }, 0);

    totalMass += interiorSecondaryMass;
  }

  return totalMass > 0 ? totalMass : null;
}

function resolveCandidateOrbitAu({ candidate, slot }) {
  return firstFinitePositive([
    candidate?.meanTemperatureModel?.distanceAu,
    slot?.orbitAU,
    convertOrbitNumberToAu({ orbitNumber: Number(candidate?.orbit ?? slot?.orbit) }),
  ]);
}

function findPlanetForSlot({ generatedSurvey, slot } = {}) {
  const planets = Array.isArray(generatedSurvey?.planets) ? generatedSurvey.planets : [];
  if (planets.length === 0 || !slot) {
    return null;
  }

  const slotStarKey = String(slot?.starKey || "primary");
  const slotOrbitNumber = Number(slot?.orbit);
  const slotId = String(slot?.slotId || "");

  return (
    planets.find((planet) => {
      const planetSlotId = String(planet?.slotId || "");
      if (slotId && planetSlotId && slotId === planetSlotId) {
        return true;
      }

      const planetStarKey = String(planet?.starKey || "primary");
      const planetOrbitNumber = Number(planet?.orbitNumber ?? planet?.orbit);

      return (
        planetStarKey === slotStarKey &&
        Number.isFinite(slotOrbitNumber) &&
        Number.isFinite(planetOrbitNumber) &&
        Math.abs(slotOrbitNumber - planetOrbitNumber) < 1e-6
      );
    }) ?? null
  );
}

function resolveCandidateWorldMassEarth({ candidate, slot, matchedMoon } = {}) {
  if (candidate?.isMoon) {
    return firstFinitePositive([
      matchedMoon?.massEarth,
      matchedMoon?.sourceMoon?.massEarth,
      matchedMoon?.sourceMoon?.gasGiantMassEarth,
    ]);
  }

  return (
    firstFinitePositive([
      candidate?.massEarth,
      candidate?.worldMassEarth,
      slot?.massEarth,
      slot?.worldMassEarth,
      slot?.gasGiantMassEarth,
    ]) ?? estimateMassEarthFromDiameterKm(slot?.basicDiameterKm)
  );
}

function resolveCandidateOrbitalPeriodDays({ candidate, slot, matchedMoon, generatedSurvey } = {}) {
  if (candidate?.isMoon) {
    return firstFinitePositive([matchedMoon?.period?.periodDays, matchedMoon?.period?.days, matchedMoon?.periodDays]);
  }

  const matchedPlanet = findPlanetForSlot({ generatedSurvey, slot });
  return firstFinitePositive([
    slot?.orbitalPeriodDays,
    slot?.orbitalPeriod?.days,
    matchedPlanet?.orbitalPeriodDays,
    Number.isFinite(matchedPlanet?.orbitalPeriodYears) ? Number(matchedPlanet.orbitalPeriodYears) * 365.25 : null,
  ]);
}

function resolveCandidateEccentricity({ candidate, slot, matchedMoon, generatedSurvey } = {}) {
  const matchedPlanet = findPlanetForSlot({ generatedSurvey, slot });
  const eccentricity = firstFiniteNonNegative([
    matchedMoon?.eccentricity,
    matchedMoon?.eccentricityRoll?.eccentricity,
    matchedMoon?.sourceMoon?.eccentricity,
    candidate?.eccentricity,
    candidate?.eccentricityRoll?.eccentricity,
    slot?.eccentricity,
    matchedPlanet?.eccentricity,
  ]);

  return eccentricity === null ? null : Math.min(1, eccentricity);
}

function resolveCandidateDistanceMkm({ candidate, slot, matchedMoon } = {}) {
  if (candidate?.isMoon) {
    const distanceKm = firstFinitePositive([matchedMoon?.distanceKm, matchedMoon?.period?.orbitKm]);
    return Number.isFinite(distanceKm) ? distanceKm / 1_000_000 : null;
  }

  const orbitAu = resolveCandidateOrbitAu({ candidate, slot });
  return Number.isFinite(orbitAu) ? orbitAu * AU_IN_MILLION_KM : null;
}

function resolveCandidatePrimaryMassEarth({ candidate, slot, matchedMoon, stars, worldPlacement } = {}) {
  if (candidate?.isMoon) {
    return (
      firstFinitePositive([slot?.gasGiantMassEarth, slot?.massEarth, slot?.worldMassEarth]) ??
      estimateMassEarthFromDiameterKm(slot?.basicDiameterKm)
    );
  }

  const starMassSolar = resolveOrbitedStarMassSolar({ candidate, slot, stars, worldPlacement });
  return Number.isFinite(starMassSolar) ? starMassSolar * SOLAR_MASS_IN_EARTH_MASSES : null;
}

function selectTidalReferenceCandidate(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const ranked = candidates
    .map((candidate, index) => ({
      candidate,
      index,
      effectiveDeviationAbs: Number.isFinite(candidate?.effectiveDeviation)
        ? Math.abs(Number(candidate.effectiveDeviation))
        : Number.POSITIVE_INFINITY,
      isMoonPenalty: candidate?.isMoon ? 1 : 0,
      orbitValue: Number.isFinite(candidate?.orbit) ? Number(candidate.orbit) : Number.POSITIVE_INFINITY,
    }))
    .filter((entry) => Number.isFinite(Number(entry.candidate?.sizeValue)) && Number(entry.candidate.sizeValue) >= 1)
    .sort((a, b) => {
      if (a.effectiveDeviationAbs !== b.effectiveDeviationAbs) {
        return a.effectiveDeviationAbs - b.effectiveDeviationAbs;
      }
      if (a.isMoonPenalty !== b.isMoonPenalty) {
        return a.isMoonPenalty - b.isMoonPenalty;
      }
      if (a.orbitValue !== b.orbitValue) {
        return a.orbitValue - b.orbitValue;
      }
      return a.index - b.index;
    });

  return ranked[0]?.candidate ?? null;
}

function computeTidalEffectsForCandidate({ candidate, slot, stars, worldPlacement }) {
  if (!candidate || !slot) {
    return [];
  }

  const worldSize = Number(candidate?.sizeValue);
  const candidateIsMoon = Boolean(candidate?.isMoon);
  const candidateOrbitAu = resolveCandidateOrbitAu({ candidate, slot });
  const candidateStarMassSolar = resolveOrbitedStarMassSolar({ candidate, slot, stars, worldPlacement });
  const moonOrbitDetails = collectNonRingMoonOrbitDetails(slot);
  const effects = [];

  const starTidalEffect = calculateStarTidalEffect({
    starMass: candidateStarMassSolar,
    worldSize,
    distanceAu: candidateOrbitAu,
  });
  if (Number.isFinite(starTidalEffect) && starTidalEffect > 0) {
    effects.push(starTidalEffect);
  }

  if (!candidateIsMoon) {
    for (const moonDetail of moonOrbitDetails) {
      const moonTidalEffect = calculateMoonTidalEffect({
        moonMass: moonDetail.massEarth,
        planetSize: worldSize,
        moonDistanceKm: moonDetail.distanceKm,
      });

      if (Number.isFinite(moonTidalEffect) && moonTidalEffect > 0) {
        effects.push(moonTidalEffect);
      }
    }

    return effects;
  }

  const nonRingMoonIndex = resolveNonRingMoonIndex(slot, candidate?.moonIndex);
  if (!Number.isFinite(nonRingMoonIndex) || nonRingMoonIndex < 0) {
    return effects;
  }

  const matchedMoon = moonOrbitDetails[nonRingMoonIndex];
  if (!matchedMoon) {
    return effects;
  }

  const parentMassEarth =
    firstFinitePositive([slot?.gasGiantMassEarth, slot?.massEarth, slot?.worldMassEarth]) ??
    estimateMassEarthFromDiameterKm(slot?.basicDiameterKm);
  const planetTidalEffect = calculatePlanetTidalEffect({
    planetMass: parentMassEarth,
    moonSize: worldSize,
    moonDistanceKm: matchedMoon.distanceKm,
  });
  if (Number.isFinite(planetTidalEffect) && planetTidalEffect > 0) {
    effects.push(planetTidalEffect);
  }

  for (const moonDetail of moonOrbitDetails) {
    if (moonDetail.nonRingIndex === matchedMoon.nonRingIndex) {
      continue;
    }

    const moonSeparationKm = Math.abs(moonDetail.distanceKm - matchedMoon.distanceKm);
    const moonToMoonEffect = calculateMoonToMoonTidalEffect({
      otherMass: moonDetail.massEarth,
      moonSize: worldSize,
      moonSeparationKm,
    });

    if (Number.isFinite(moonToMoonEffect) && moonToMoonEffect > 0) {
      effects.push(moonToMoonEffect);
    }
  }

  return effects;
}

function deriveTidalEffectsFromSystemRecord(systemRecord = null) {
  const generatedSurvey = systemRecord?.metadata?.generatedSurvey || {};
  const candidates = Array.isArray(generatedSurvey?.mainworldCandidates?.candidates)
    ? generatedSurvey.mainworldCandidates.candidates
    : [];
  const worldPlacement = generatedSurvey?.worldPlacement || {};
  const slots = Array.isArray(worldPlacement?.slots) ? worldPlacement.slots : [];
  const slotById = new Map(slots.map((slot) => [String(slot?.slotId || ""), slot]));
  const stars = Array.isArray(generatedSurvey?.stars) ? generatedSurvey.stars : [];

  const candidate = selectTidalReferenceCandidate(candidates);
  if (!candidate) {
    return null;
  }

  const slot = slotById.get(String(candidate?.slotId || ""));
  if (!slot) {
    return null;
  }

  const tidalEffectsMeters = normalizeTidalEffectsMeters(
    computeTidalEffectsForCandidate({
      candidate,
      slot,
      stars,
      worldPlacement,
    }),
  );

  if (tidalEffectsMeters.length === 0) {
    return null;
  }

  const totalTidalEffectsMeters = +tidalEffectsMeters.reduce((sum, value) => sum + value, 0).toFixed(4);
  return {
    tidalEffectsMeters,
    totalTidalEffectsMeters,
  };
}

function deriveTidalHeatingFactorFromSystemRecord(systemRecord = null) {
  const generatedSurvey = systemRecord?.metadata?.generatedSurvey || {};
  const candidates = Array.isArray(generatedSurvey?.mainworldCandidates?.candidates)
    ? generatedSurvey.mainworldCandidates.candidates
    : [];
  const worldPlacement = generatedSurvey?.worldPlacement || {};
  const slots = Array.isArray(worldPlacement?.slots) ? worldPlacement.slots : [];
  const slotById = new Map(slots.map((slot) => [String(slot?.slotId || ""), slot]));
  const stars = Array.isArray(generatedSurvey?.stars) ? generatedSurvey.stars : [];

  const candidate = selectTidalReferenceCandidate(candidates);
  if (!candidate) {
    return null;
  }

  const slot = slotById.get(String(candidate?.slotId || ""));
  if (!slot) {
    return null;
  }

  const worldSize = Number(candidate?.sizeValue);
  if (!Number.isFinite(worldSize) || worldSize <= 0) {
    return null;
  }

  const moonOrbitDetails = collectNonRingMoonOrbitDetails(slot);
  const nonRingMoonIndex = candidate?.isMoon ? resolveNonRingMoonIndex(slot, candidate?.moonIndex) : null;
  const matchedMoon =
    candidate?.isMoon && Number.isFinite(nonRingMoonIndex) && nonRingMoonIndex >= 0
      ? moonOrbitDetails[nonRingMoonIndex]
      : null;

  if (candidate?.isMoon && !matchedMoon) {
    return null;
  }

  const primaryMassEarth = resolveCandidatePrimaryMassEarth({
    candidate,
    slot,
    matchedMoon,
    stars,
    worldPlacement,
  });
  const worldMassEarth = resolveCandidateWorldMassEarth({ candidate, slot, matchedMoon });
  const eccentricity = resolveCandidateEccentricity({ candidate, slot, matchedMoon, generatedSurvey });
  const distanceMkm = resolveCandidateDistanceMkm({ candidate, slot, matchedMoon });
  const periodDays = resolveCandidateOrbitalPeriodDays({ candidate, slot, matchedMoon, generatedSurvey });

  const tidalHeatingFactor = calculateTidalHeatingFactor({
    primaryMassEarth,
    worldSize,
    eccentricity,
    distanceMkm,
    periodDays,
    worldMassEarth,
  });

  return Number.isFinite(tidalHeatingFactor) ? tidalHeatingFactor : null;
}

export function deriveSystemGenerationContext(systemRecord = null) {
  if (!systemRecord || typeof systemRecord !== "object") {
    return null;
  }

  const generatedSurvey = systemRecord?.metadata?.generatedSurvey || {};
  const slots = Array.isArray(generatedSurvey?.worldPlacement?.slots) ? generatedSurvey.worldPlacement.slots : [];
  const candidates = Array.isArray(generatedSurvey?.mainworldCandidates?.candidates)
    ? generatedSurvey.mainworldCandidates.candidates
    : [];

  const moonSizesPool = [];
  const moonCounts = [];

  for (const slot of slots) {
    const sizeDetails = Array.isArray(slot?.significantMoonSizeDetails) ? slot.significantMoonSizeDetails : [];
    const detailSizes = sizeDetails
      .map((entry) => toMoonSizeValue(entry?.sizeValue ?? entry?.size ?? entry?.sizeCode))
      .filter((entry) => Number.isFinite(entry) && entry > 0);

    if (detailSizes.length > 0) {
      moonSizesPool.push(...detailSizes);
    } else {
      const codeSizes = Array.isArray(slot?.significantMoonSizes)
        ? slot.significantMoonSizes
            .map((entry) => toMoonSizeValue(entry))
            .filter((entry) => Number.isFinite(entry) && entry > 0)
        : [];
      if (codeSizes.length > 0) {
        moonSizesPool.push(...codeSizes);
      }
    }

    const count = toFiniteNumber(slot?.significantMoonCount);
    if (count !== null && count >= 0) {
      moonCounts.push(Math.round(count));
    } else if (detailSizes.length > 0) {
      moonCounts.push(detailSizes.length);
    }
  }

  const densitySamples = [];

  for (const candidate of candidates) {
    const possibleDensity = [
      candidate?.density,
      candidate?.physical?.density,
      candidate?.rollPhysical?.density,
      candidate?.world?.density,
      candidate?.planet?.density,
    ];

    const density = possibleDensity.map((entry) => toPositiveNumber(entry)).find((entry) => entry !== null);
    if (Number.isFinite(density) && density > 0) {
      densitySamples.push(density);
    }
  }

  const context = {};

  const systemAge =
    toPositiveNumber(systemRecord?.primaryStar?.age) ||
    toPositiveNumber(generatedSurvey?.systemAgeGyr) ||
    toPositiveNumber(generatedSurvey?.ageGyr);
  if (systemAge !== null) {
    context.systemAgeGyr = +systemAge.toFixed(2);
  }

  const density = average(densitySamples);
  if (density !== null) {
    context.density = +density.toFixed(2);
  }

  if (moonSizesPool.length > 0) {
    context.moonSizesPool = moonSizesPool;
  }

  const moonCount = average(moonCounts);
  if (moonCount !== null) {
    context.moonCountDefault = Math.max(0, Math.round(moonCount));
  }

  const { tidalEffectsMeters, totalTidalEffectsMeters } = resolveTidalEffectsTotals({
    tidalEffectsMeters: generatedSurvey?.tidalEffectsMeters,
    totalTidalEffectsMeters: generatedSurvey?.totalTidalEffectsMeters,
  });
  const hasExplicitTidalInputs =
    Array.isArray(generatedSurvey?.tidalEffectsMeters) ||
    toNonNegativeNumber(generatedSurvey?.totalTidalEffectsMeters) !== null;
  const derivedTidal = hasExplicitTidalInputs ? null : deriveTidalEffectsFromSystemRecord(systemRecord);

  const resolvedTidalEffectsMeters = hasExplicitTidalInputs
    ? tidalEffectsMeters
    : normalizeTidalEffectsMeters(derivedTidal?.tidalEffectsMeters);
  const resolvedTotalTidalEffectsMeters = hasExplicitTidalInputs
    ? totalTidalEffectsMeters
    : toNonNegativeNumber(derivedTidal?.totalTidalEffectsMeters);

  if (resolvedTidalEffectsMeters.length > 0) {
    context.tidalEffectsMeters = resolvedTidalEffectsMeters;
  }

  if (resolvedTotalTidalEffectsMeters !== null) {
    context.totalTidalEffectsMeters = +resolvedTotalTidalEffectsMeters.toFixed(4);
    context.tidalStressFactor =
      calculateTidalStressFactor({ totalTidalEffectsMeters: resolvedTotalTidalEffectsMeters }) ?? 0;
  }

  const explicitTidalHeatingFactor = toNonNegativeNumber(generatedSurvey?.tidalHeatingFactor);
  const derivedTidalHeatingFactor =
    explicitTidalHeatingFactor !== null ? null : deriveTidalHeatingFactorFromSystemRecord(systemRecord);
  const resolvedTidalHeatingFactor =
    explicitTidalHeatingFactor !== null ? explicitTidalHeatingFactor : toNonNegativeNumber(derivedTidalHeatingFactor);
  if (resolvedTidalHeatingFactor !== null && resolvedTidalHeatingFactor >= 1) {
    context.tidalHeatingFactor = Math.floor(resolvedTidalHeatingFactor);
  }

  return Object.keys(context).length > 0 ? context : null;
}

function pickMoonSizes({ moonCount, moonSizesPool, rng }) {
  if (!Array.isArray(moonSizesPool) || moonSizesPool.length === 0) {
    return Array.from({ length: moonCount }, () => 1 + Math.floor(rng() * 6));
  }

  const normalizedPool = moonSizesPool
    .map((entry) => toMoonSizeValue(entry))
    .filter((entry) => Number.isFinite(entry) && entry > 0);

  if (normalizedPool.length === 0) {
    return Array.from({ length: moonCount }, () => 1 + Math.floor(rng() * 6));
  }

  return Array.from({ length: moonCount }, () => normalizedPool[Math.floor(rng() * normalizedPool.length)]);
}

export function buildSeismicInputsFromSystemContext({ systemContext = null, rng = Math.random } = {}) {
  const contextMoonCount = toFiniteNumber(systemContext?.moonCountDefault);
  const moonCount =
    contextMoonCount !== null ? clamp(Math.round(contextMoonCount), 0, 12) : clamp(Math.floor(rng() * 4), 0, 12);

  const moonSizes = pickMoonSizes({
    moonCount,
    moonSizesPool: systemContext?.moonSizesPool,
    rng,
  });

  const contextDensity = toPositiveNumber(systemContext?.density);
  const density = contextDensity !== null ? +contextDensity.toFixed(2) : +(0.35 + rng() * 1.2).toFixed(2);

  const contextAge = toPositiveNumber(systemContext?.systemAgeGyr);
  const systemAgeGyr = contextAge !== null ? +contextAge.toFixed(2) : +(1 + rng() * 12).toFixed(2);

  return {
    moons: moonCount,
    moonSizes,
    density,
    systemAgeGyr,
  };
}

export function buildGeneratedSurveyPayload({
  size,
  atmosphereCode,
  hydrographics,
  starTempMod,
  temperatureScenarioSettings = null,
  systemContext = null,
  rng = Math.random,
} = {}) {
  const axialTilt = Math.round(rng() * 40);
  const dayLengthHours = +(15 + rng() * 50).toFixed(1);
  const magnetosphere = rng() < 0.5 ? "Present" : "Absent";

  const seismicInputs = buildSeismicInputsFromSystemContext({
    systemContext,
    rng,
  });

  const baseTemp =
    15 + (Number(starTempMod) || 0) * 15 + (Number(atmosphereCode) >= 6 ? 20 : 0) - Number(hydrographics) * 2;
  const meanTempC = Math.round(baseTemp);

  let seasonalTempOffsetC = 0;
  let orbitalPeriodDays = Math.round(200 + rng() * 1200);

  if (temperatureScenarioSettings) {
    const dateSolarDays = Number(temperatureScenarioSettings?.dateSolarDays);
    const solarDaysPerYear = Number(temperatureScenarioSettings?.solarDaysPerYear);

    if (
      Number.isFinite(solarDaysPerYear) &&
      solarDaysPerYear > 0 &&
      Number.isFinite(dateSolarDays) &&
      dateSolarDays >= 0
    ) {
      orbitalPeriodDays = Math.max(1, Math.round(solarDaysPerYear));

      if (axialTilt > 0) {
        const declinationDeg = calculateSolarDeclinationDegrees({
          axialTiltDegrees: axialTilt,
          dateSolarDays,
          solarDaysPerYear,
        });
        const tiltResult = calculateAxialTiltFactor({
          axialTiltDegrees: axialTilt,
          yearLengthStandardYears: solarDaysPerYear / 365,
        });

        if (declinationDeg !== null && tiltResult !== null) {
          const amplitude = tiltResult.factor * 20;
          seasonalTempOffsetC = Math.round((declinationDeg / axialTilt) * amplitude);
        }
      }
    }
  }

  const avgTempC = meanTempC + seasonalTempOffsetC;

  const seismicResult = calculateResidualSeismicStress({
    size,
    ageGyr: seismicInputs.systemAgeGyr,
    isMoon: false,
    moonSizes: seismicInputs.moonSizes,
    density: seismicInputs.density,
  }) || {
    preSquare: 0,
    stress: 0,
    dms: { totalDm: 0 },
  };

  const { tidalEffectsMeters, totalTidalEffectsMeters } = resolveTidalEffectsTotals({
    tidalEffectsMeters: systemContext?.tidalEffectsMeters,
    totalTidalEffectsMeters: systemContext?.totalTidalEffectsMeters,
  });
  const hasTidalInputs =
    Array.isArray(systemContext?.tidalEffectsMeters) ||
    toNonNegativeNumber(systemContext?.totalTidalEffectsMeters) !== null;
  const derivedTidalStressFactor = hasTidalInputs ? calculateTidalStressFactor({ totalTidalEffectsMeters }) : null;
  const tidalStressFactor = derivedTidalStressFactor ?? toNonNegativeNumber(systemContext?.tidalStressFactor) ?? 0;
  const tidalHeatingFactor = toNonNegativeNumber(systemContext?.tidalHeatingFactor) ?? 0;

  const totalSeismicStress = calculateTotalSeismicStress({
    seismicStress: seismicResult?.stress ?? 0,
    tidalStressFactor,
    tidalHeatingFactor: Math.floor(tidalHeatingFactor),
  });
  const correctedMeanTempC = applySeismicTemperatureCorrection(meanTempC, totalSeismicStress);
  const correctedAvgTempC = applySeismicTemperatureCorrection(avgTempC, totalSeismicStress);

  const tectonicRoll2D = 1 + Math.floor(rng() * 6) + (1 + Math.floor(rng() * 6));
  const majorTectonicPlates = calculateTectonicPlates({
    size: Number(size),
    hydrographics: Number(hydrographics),
    totalSeismicStress,
    roll2D: tectonicRoll2D,
  });

  const tempCategory =
    correctedAvgTempC < -50
      ? "Frozen"
      : correctedAvgTempC < 0
        ? "Cold"
        : correctedAvgTempC < 30
          ? "Temperate"
          : correctedAvgTempC < 60
            ? "Hot"
            : "Scorching";

  const apiTemperature =
    correctedAvgTempC < -50
      ? "Frozen"
      : correctedAvgTempC < 0
        ? "Cold"
        : correctedAvgTempC < 30
          ? "Temperate"
          : correctedAvgTempC < 55
            ? "Tropical"
            : "Hot";

  return {
    avgTempC: correctedAvgTempC,
    meanTempC: correctedMeanTempC,
    seasonalTempOffsetC,
    tempCategory,
    apiTemperature,
    totalSeismicStress,
    majorTectonicPlates,
    orbitalPeriodDays,
    dayLengthHours,
    axialTilt,
    moons: seismicInputs.moons,
    moonSizes: seismicInputs.moonSizes,
    magnetosphere,
    density: seismicInputs.density,
    systemAgeGyr: seismicInputs.systemAgeGyr,
    seismicStress: seismicResult.stress,
    seismicPreSquare: seismicResult.preSquare,
    seismicStressDm: seismicResult.dms?.totalDm ?? 0,
    tidalEffectsMeters,
    totalTidalEffectsMeters,
    tidalStressFactor,
    tidalHeatingFactor: Math.floor(tidalHeatingFactor),
    temperatureScenarioSettings: temperatureScenarioSettings || null,
  };
}
