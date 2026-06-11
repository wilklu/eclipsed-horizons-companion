import { createRandomRoller } from "./dice.js";
import { roll2d, rollD3 } from "./diceFormulasWbh.js";

export const SYSTEM_WBH_RULES = Object.freeze([
  {
    id: "world-types-and-quantities",
    section: "Chapter 4 > World Types and Quantities",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "available-orbits-hzco",
    section: "Chapter 4 > Available Orbits and Determining Habitable Zone Centre Orbit#",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "placement-of-worlds",
    section: "Chapter 4 > Placement of Worlds",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "world-sizing-moons",
    section: "Chapter 4 > Basic World Sizing, Significant Moons, Significant Moon Size",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "mainworld-candidate",
    section: "Chapter 4 > Mainworld Candidate",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
]);

const ORBIT_TABLE = Object.freeze([
  { orbit: 0, distanceAu: 0, differenceAu: 0.4 },
  { orbit: 1, distanceAu: 0.4, differenceAu: 0.3 },
  { orbit: 2, distanceAu: 0.7, differenceAu: 0.3 },
  { orbit: 3, distanceAu: 1.0, differenceAu: 0.6 },
  { orbit: 4, distanceAu: 1.6, differenceAu: 1.2 },
  { orbit: 5, distanceAu: 2.8, differenceAu: 2.4 },
  { orbit: 6, distanceAu: 5.2, differenceAu: 4.8 },
  { orbit: 7, distanceAu: 10, differenceAu: 10 },
  { orbit: 8, distanceAu: 20, differenceAu: 20 },
  { orbit: 9, distanceAu: 40, differenceAu: 37 },
  { orbit: 10, distanceAu: 77, differenceAu: 77 },
  { orbit: 11, distanceAu: 154, differenceAu: 154 },
  { orbit: 12, distanceAu: 308, differenceAu: 307 },
  { orbit: 13, distanceAu: 615, differenceAu: 615 },
  { orbit: 14, distanceAu: 1230, differenceAu: 1270 },
  { orbit: 15, distanceAu: 2500, differenceAu: 2400 },
  { orbit: 16, distanceAu: 4900, differenceAu: 4900 },
  { orbit: 17, distanceAu: 9800, differenceAu: 9700 },
  { orbit: 18, distanceAu: 19500, differenceAu: 20000 },
  { orbit: 19, distanceAu: 39500, differenceAu: 39200 },
  { orbit: 20, distanceAu: 78700, differenceAu: null },
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundOrbit(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  if (numericValue >= 1) {
    return Number(numericValue.toFixed(1));
  }

  return Number(numericValue.toFixed(2));
}

// dice formulas centralized in diceFormulasWbh.js

function sumLuminosity(stars = []) {
  return stars.reduce((total, star) => total + Number(star?.luminosity || 0), 0);
}

function sumMass(stars = []) {
  return stars.reduce((total, star) => total + Number(star?.massInSolarMasses ?? star?.mass ?? 0), 0);
}

function getSystemLayoutAnchorOrbit(stars = []) {
  const starList = Array.isArray(stars) ? stars : [];
  const luminosity = sumLuminosity(starList);
  if (luminosity > 0) {
    return calculateHabitableZoneCenterOrbit(luminosity);
  }

  const primary = starList[0] ?? null;
  const minimumOrbit = calculateMinimumAllowableOrbitWbh(primary);
  if (isPostStellarObject(primary)) {
    return roundOrbit(Math.max(0.3, minimumOrbit + 0.2));
  }
  if (isBrownDwarfObject(primary)) {
    return roundOrbit(Math.max(0.2, minimumOrbit + 0.1));
  }
  return roundOrbit(Math.max(0.2, minimumOrbit + 0.1));
}

function getLuminosityClassCode(star) {
  return (
    String(star?.luminosityClass || star?.designation || star?.spectralClass || "")
      .trim()
      .match(/Ia|Ib|II|III|IV|V|VI/i)?.[0] ?? "V"
  );
}

function isPostStellarObject(star) {
  const code = String(star?.designation || star?.spectralClass || star?.objectType || "").toUpperCase();
  return ["D", "WHITE DWARF", "PSR", "PULSAR", "NS", "NEUTRON STAR", "BLACK HOLE", "BH"].some((token) =>
    code.includes(token),
  );
}

function isBrownDwarfObject(star) {
  const code = String(star?.designation || star?.spectralClass || star?.objectType || "").toUpperCase();
  return ["BD", " BROWN DWARF", "L", "T", "Y"].some((token) => code.includes(token));
}

function getOrbitPriority(group) {
  switch (String(group?.orbitType || "Primary").toLowerCase()) {
    case "close":
      return 0;
    case "near":
      return 1;
    case "far":
      return 2;
    default:
      return 3;
  }
}

function getPrimaryExclusionRanges(groups) {
  return groups
    .filter((group) => group.key !== "primary" && Number.isFinite(group.orbitNumber))
    .map(buildGroupExclusionRange)
    .filter(Boolean)
    .sort((left, right) => left.start - right.start);
}

function mergeExclusionRanges(ranges = []) {
  const filtered = ranges
    .filter((range) => Number.isFinite(Number(range?.start)) && Number.isFinite(Number(range?.end)))
    .map((range) => ({ start: Number(range.start), end: Number(range.end) }))
    .sort((left, right) => left.start - right.start);

  return filtered.reduce((merged, range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push(range);
      return merged;
    }
    last.end = Math.max(last.end, range.end);
    return merged;
  }, []);
}

function getGroupHalfWidth(group) {
  let halfWidth = 1;
  if (Number(group?.secondaryMao) > 0.2) {
    halfWidth += Number(group.secondaryMao);
  }
  if (group?.hasCompanion) {
    halfWidth += 0.5;
  }
  if (Number(group?.hierarchyLevel || 0) > 1 || group?.continuationOf) {
    halfWidth += 0.5;
  }
  if (Number(group?.branchDepth || 1) > 1) {
    halfWidth += (Number(group.branchDepth) - 1) * 0.5;
  }
  if (Number(group?.nestedCompanionCount || 0) > 0) {
    halfWidth += Number(group.nestedCompanionCount) * 0.25;
  }
  if (Number(group?.descendantGroupCount || 0) > 0) {
    halfWidth += Number(group.descendantGroupCount) * 0.25;
  }
  if (Number(group?.eccentricity) > 0.2) {
    halfWidth += 1;
  }
  if (Number(group?.eccentricity) > 0.5 && ["close", "near"].includes(String(group?.orbitType || "").toLowerCase())) {
    halfWidth += 1;
  }
  return halfWidth;
}

function buildGroupExclusionRange(group) {
  if (!Number.isFinite(Number(group?.orbitNumber))) {
    return null;
  }

  const halfWidth = getGroupHalfWidth(group);
  return {
    start: Number(group.orbitNumber) - halfWidth,
    end: Number(group.orbitNumber) + halfWidth,
  };
}

function deriveGroupContinuation(groupStar, groupCompanions = []) {
  const nestedContinuations = groupCompanions.filter(
    (companion) =>
      companion?.continuationOf || Number(companion?.hierarchyLevel || 0) > Number(groupStar?.hierarchyLevel || 1),
  );
  const nestedContinuation = nestedContinuations[0] ?? null;

  if (!nestedContinuation) {
    return {
      hierarchyLevel: Number(groupStar?.hierarchyLevel || 1),
      continuationOf: groupStar?.continuationOf || null,
      branchDepth: 1,
      nestedCompanionCount: 0,
    };
  }

  const hierarchyLevel = Math.max(
    Number(groupStar?.hierarchyLevel || 1),
    ...groupCompanions.map((companion) => Number(companion?.hierarchyLevel || 1)),
  );

  return {
    hierarchyLevel,
    continuationOf:
      nestedContinuation?.continuationOf || nestedContinuation?.parentStarKey || groupStar?.continuationOf || null,
    branchDepth: Math.max(1, hierarchyLevel - Number(groupStar?.hierarchyLevel || 1) + 1),
    nestedCompanionCount: nestedContinuations.length,
  };
}

function getGroupExclusionRanges(targetGroup, groups) {
  if (targetGroup?.key === "primary") {
    return getPrimaryExclusionRanges(groups);
  }

  const targetParent = String(targetGroup?.parentStarKey || "primary");
  const directRanges = groups
    .filter((group) => group?.key !== targetGroup?.key && group?.key !== "primary")
    .filter((group) => String(group?.parentStarKey || "primary") === targetParent)
    .map(buildGroupExclusionRange)
    .filter(Boolean)
    .sort((left, right) => left.start - right.start);

  if (
    !(
      Number(targetGroup?.branchDepth || 1) > 1 ||
      Number(targetGroup?.nestedCompanionCount || 0) > 0 ||
      Number(targetGroup?.descendantGroupCount || 0) > 0
    )
  ) {
    return directRanges;
  }

  const inheritedRanges = groups
    .filter((group) => group?.key !== "primary" && group?.key !== targetGroup?.key)
    .map(buildGroupExclusionRange)
    .filter(Boolean)
    .filter(
      (range) =>
        range.end > Number(targetGroup?.minimumOrbit ?? 0) && range.start < Number(targetGroup?.maximumOrbit ?? 0),
    );

  return mergeExclusionRanges([...directRanges, ...inheritedRanges]);
}

function annotateGroupHierarchy(groups = []) {
  const childGroupsByParent = new Map();

  groups.forEach((group) => {
    if (group?.key === "primary") {
      return;
    }

    const parentKey = String(group?.parentStarKey || "primary");
    if (!childGroupsByParent.has(parentKey)) {
      childGroupsByParent.set(parentKey, []);
    }
    childGroupsByParent.get(parentKey).push(group);
  });

  const memo = new Map();

  function visit(group) {
    if (memo.has(group.key)) {
      return memo.get(group.key);
    }

    const hostKey =
      group?.key === "primary"
        ? String(group?.stars?.[0]?.starKey || "star-0")
        : String(group?.hostStarKey || group?.key || "");
    const children = childGroupsByParent.get(hostKey) ?? [];
    const childMetrics = children.map((child) => visit(child));
    const baseHierarchyLevel = group?.key === "primary" ? 0 : Number(group?.hierarchyLevel || 1);
    const metrics = {
      hierarchyLevel: Math.max(baseHierarchyLevel, ...childMetrics.map((child) => Number(child?.hierarchyLevel || 1))),
      branchDepth: Math.max(
        Number(group?.branchDepth || 1),
        children.length ? 1 + Math.max(...childMetrics.map((child) => Number(child?.branchDepth || 1))) : 1,
      ),
      nestedCompanionCount:
        Number(group?.nestedCompanionCount || 0) +
        childMetrics.reduce((sum, child) => sum + Number(child?.nestedCompanionCount || 0), 0),
      descendantGroupCount:
        children.length + childMetrics.reduce((sum, child) => sum + Number(child?.descendantGroupCount || 0), 0),
      continuationOf:
        group?.continuationOf || childMetrics.find((child) => child?.continuationOf)?.continuationOf || null,
    };

    memo.set(group.key, metrics);
    return metrics;
  }

  return groups.map((group) => ({ ...group, ...visit(group) }));
}

function getAvailableOrbitSpan({ minimumOrbit, maximumOrbit, exclusionRanges = [] }) {
  const floor = Number(minimumOrbit);
  const ceiling = Number(maximumOrbit);
  if (!(ceiling > floor)) {
    return 0;
  }

  let excluded = 0;
  for (const range of exclusionRanges) {
    const overlapStart = Math.max(floor, range.start);
    const overlapEnd = Math.min(ceiling, range.end);
    if (overlapEnd > overlapStart) {
      excluded += overlapEnd - overlapStart;
    }
  }

  return Math.max(0, ceiling - floor - excluded);
}

function adjustOrbitForAvailability({ orbitNumber, minimumOrbit, maximumOrbit, exclusionRanges = [] }) {
  let adjusted = clamp(Number(orbitNumber), Number(minimumOrbit), Number(maximumOrbit));

  for (const range of exclusionRanges) {
    if (adjusted > range.start && adjusted < range.end) {
      const lowerDistance = Math.abs(adjusted - range.start);
      const upperDistance = Math.abs(range.end - adjusted);
      adjusted = lowerDistance <= upperDistance ? range.start : range.end;
    }
  }

  return roundOrbit(clamp(adjusted, Number(minimumOrbit), Number(maximumOrbit)));
}

function allocateExtraSlots(groups, total, selector) {
  const remainingGroups = groups.filter((group) => group.allocatedWorlds > 0);
  let remaining = total;

  while (remaining > 0 && remainingGroups.length) {
    const target = selector(remainingGroups, total - remaining);
    if (!target) {
      break;
    }
    target.extraSlots = Number(target.extraSlots || 0) + 1;
    remaining -= 1;
  }
}

function getOrbitRow(wholeOrbit) {
  return ORBIT_TABLE.find((entry) => entry.orbit === wholeOrbit) ?? ORBIT_TABLE[ORBIT_TABLE.length - 1];
}

export function getWbhBodyTypes() {
  return ["Gas Giant", "Planetoid Belt", "Terrestrial Planet"];
}

export function calculateWbhTotalWorlds({ gasGiants = 0, planetoidBelts = 0, terrestrialPlanets = 0 } = {}) {
  return Number(gasGiants) + Number(planetoidBelts) + Number(terrestrialPlanets);
}

export function fractionalOrbitToAu(orbitNumber) {
  const numericOrbit = Number(orbitNumber);
  if (!(numericOrbit >= 0)) {
    throw new RangeError("Orbit number must be zero or greater");
  }

  const wholeOrbit = Math.floor(numericOrbit);
  const fractionalPart = numericOrbit - wholeOrbit;
  const row = getOrbitRow(wholeOrbit);
  const differenceAu = row.differenceAu ?? 0;
  return row.distanceAu + differenceAu * fractionalPart;
}

export function auToFractionalOrbit(au) {
  const numericAu = Number(au);
  if (!(numericAu >= 0)) {
    throw new RangeError("AU must be zero or greater");
  }

  let selectedRow = ORBIT_TABLE[0];
  for (const row of ORBIT_TABLE) {
    if (row.distanceAu <= numericAu) {
      selectedRow = row;
    }
  }

  if (!selectedRow.differenceAu) {
    return selectedRow.orbit;
  }

  const fractionalPart = (numericAu - selectedRow.distanceAu) / selectedRow.differenceAu;
  return Number((selectedRow.orbit + fractionalPart).toFixed(4));
}

export function calculateHabitableZoneCenterAu(luminosity) {
  const numericLuminosity = Number(luminosity);
  if (!(numericLuminosity >= 0)) {
    throw new RangeError("Luminosity must be zero or greater");
  }

  return Math.sqrt(numericLuminosity);
}

export function calculateHabitableZoneCenterOrbit(luminosity) {
  return auToFractionalOrbit(calculateHabitableZoneCenterAu(luminosity));
}

export function calculateSystemLayoutAnchorOrbit(stars = []) {
  return getSystemLayoutAnchorOrbit(stars);
}

export function calculateHzcoDeviation({ orbitNumber, hzco }) {
  return Number(orbitNumber) - Number(hzco);
}

export function calculateEffectiveHzcoDeviation({ orbitNumber, hzco }) {
  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);

  if (numericOrbit >= 1 && numericHzco >= 1) {
    return calculateHzcoDeviation({ orbitNumber: numericOrbit, hzco: numericHzco });
  }

  const divisor = Math.min(numericOrbit, numericHzco);
  if (!(divisor > 0)) {
    throw new RangeError("Orbit number and HZCO must be positive for effective deviation");
  }

  return (numericOrbit - numericHzco) / divisor;
}

export function calculatePlanetaryOrbitalPeriod({ orbitNumber, stellarMasses = [] } = {}) {
  const orbitalDistanceAu = fractionalOrbitToAu(orbitNumber);
  const numericMasses = (Array.isArray(stellarMasses) ? stellarMasses : [])
    .map((mass) => Number(mass))
    .filter((mass) => Number.isFinite(mass));
  const totalMass = numericMasses.reduce((sum, mass) => sum + (mass > 0 ? mass : 0), 0);
  const effectiveMass = totalMass > 0 ? totalMass : 1;

  const years = Math.sqrt(orbitalDistanceAu ** 3 / effectiveMass);
  return {
    years,
    days: years * 365.25,
    hours: years * 8766,
    orbitalDistanceAu,
  };
}

export function calculateGasGiantPresence({ method = "2d", rollTotal, dieRoll } = {}) {
  if (method === "1d") {
    return Number(dieRoll) >= 2;
  }
  return Number(rollTotal) < 10;
}

export function calculateGasGiantQuantityWbh({
  rollTotal,
  isSingleClassV = false,
  isBrownDwarfPrimary = false,
  isPostStellarPrimary = false,
  postStellarObjectCount = 0,
  starCount = 1,
} = {}) {
  const modifiedRoll =
    Number(rollTotal) +
    (isSingleClassV ? 1 : 0) -
    (isBrownDwarfPrimary ? 2 : 0) -
    (isPostStellarPrimary ? 2 : 0) -
    Number(postStellarObjectCount || 0) -
    (Number(starCount || 1) >= 4 ? 1 : 0);

  if (modifiedRoll <= 4) return 1;
  if (modifiedRoll <= 6) return 2;
  if (modifiedRoll <= 8) return 3;
  if (modifiedRoll <= 11) return 4;
  if (modifiedRoll === 12) return 5;
  return 6;
}

export function calculatePlanetoidBeltQuantityWbh({
  rollTotal,
  gasGiants = 0,
  isProtostarPrimary = false,
  isPrimordialPrimary = false,
  isPostStellarPrimary = false,
  postStellarObjectCount = 0,
  starCount = 1,
} = {}) {
  const modifiedRoll =
    Number(rollTotal) +
    (Number(gasGiants || 0) >= 1 ? 1 : 0) +
    (isProtostarPrimary ? 3 : 0) +
    (isPrimordialPrimary ? 2 : 0) +
    (isPostStellarPrimary ? 1 : 0) +
    Number(postStellarObjectCount || 0) +
    (Number(starCount || 1) >= 2 ? 1 : 0);

  if (modifiedRoll <= 6) return 1;
  if (modifiedRoll <= 11) return 2;
  return 3;
}

export function calculateTerrestrialPlanetQuantityWbh({ rollTotal, postStellarObjectCount = 0, rollDie } = {}) {
  const initialTotal = Number(rollTotal) - 2 - Number(postStellarObjectCount || 0);
  if (initialTotal < 3) {
    return rollDie ? rollD3(rollDie) + 2 : 3;
  }

  return clamp(initialTotal, 3, 13);
}

export function calculateMinimumAllowableOrbitWbh(star = {}) {
  const explicitOrbit = Number(star?.minimumAllowableOrbit);
  if (Number.isFinite(explicitOrbit) && explicitOrbit >= 0) {
    return explicitOrbit;
  }

  const diameter = Number(star?.diameter);
  if (Number.isFinite(diameter) && diameter > 0) {
    return Math.max(0.01, auToFractionalOrbit(diameter * 0.01));
  }

  return isBrownDwarfObject(star) ? 0.01 : 0.02;
}

export function calculateBaselineNumberWbh({
  rollTotal,
  luminosityClass = "V",
  totalWorlds = 0,
  secondaryStarCount = 0,
  isPostStellarPrimary = false,
} = {}) {
  const normalizedClass = String(luminosityClass || "V").trim();
  let modifier = 0;

  if (["Ia", "Ib", "II"].includes(normalizedClass)) modifier += 3;
  else if (normalizedClass === "III") modifier += 2;
  else if (normalizedClass === "IV") modifier += 1;
  else if (normalizedClass === "VI") modifier -= 1;

  if (isPostStellarPrimary) modifier -= 2;

  if (totalWorlds < 6) modifier -= 4;
  else if (totalWorlds <= 9) modifier -= 3;
  else if (totalWorlds <= 12) modifier -= 2;
  else if (totalWorlds <= 15) modifier -= 1;
  else if (totalWorlds >= 18 && totalWorlds <= 20) modifier += 1;
  else if (totalWorlds > 20) modifier += 2;

  modifier -= Number(secondaryStarCount || 0);

  return Number(rollTotal) + modifier;
}

export function calculateBaselineOrbitWbh({ rollTotal, hzco, baselineNumber, totalWorlds, minimumOrbit = 0.01 } = {}) {
  const numericHzco = Number(hzco);
  const numericBaseline = Number(baselineNumber);
  const numericTotalWorlds = Number(totalWorlds);
  const numericMinimumOrbit = Number(minimumOrbit);
  const variance = Number(rollTotal) - 7;

  if (numericBaseline >= 1 && numericBaseline <= numericTotalWorlds) {
    return roundOrbit(numericHzco + variance / (numericHzco >= 1 ? 10 : 100));
  }

  if (numericBaseline < 1) {
    if (numericHzco >= 1) {
      return roundOrbit(numericHzco - numericBaseline + numericTotalWorlds + (Number(rollTotal) - 2) / 10);
    }

    return roundOrbit(numericMinimumOrbit - numericBaseline / 10 + (Number(rollTotal) - 2) / 100);
  }

  const hotOrbit = numericHzco - numericBaseline + numericTotalWorlds;
  if (hotOrbit >= 1) {
    return roundOrbit(hotOrbit + variance / 5);
  }

  return roundOrbit(Math.max(numericHzco - 0.1, numericMinimumOrbit + numericTotalWorlds * 0.01));
}

export function calculateEmptyOrbitQuantityWbh(rollTotal) {
  if (Number(rollTotal) <= 9) return 0;
  if (Number(rollTotal) === 10) return 1;
  if (Number(rollTotal) === 11) return 2;
  return 3;
}

export function calculateAnomalousOrbitQuantityWbh(rollTotal) {
  if (Number(rollTotal) <= 9) return 0;
  if (Number(rollTotal) === 10) return 1;
  if (Number(rollTotal) === 11) return 2;
  return 3;
}

export function calculateSystemSpreadWbh({
  baselineOrbit,
  minimumOrbit,
  baselineNumber,
  availableOrbitSpan,
  allocatedOrbits,
  totalStars = 1,
} = {}) {
  const adjustedBaselineNumber = Math.max(1, Number(baselineNumber));
  const rawSpread = (Number(baselineOrbit) - Number(minimumOrbit)) / adjustedBaselineNumber;
  const maxSpread = Number(availableOrbitSpan) / Math.max(1, Number(allocatedOrbits) + Number(totalStars || 1));
  return roundOrbit(Math.max(0.05, Math.min(rawSpread, maxSpread || rawSpread)));
}

export function scoreMainworldCandidateWbh(world = {}, { hzco = null } = {}) {
  const type = String(world?.type || "");
  if (type === "Gas Giant") return -100;

  let score = 0;
  const size = Number(world?.size ?? world?.sizeCode ?? 0);
  const atmosphere = Number(world?.atmosphereCode ?? 0);
  const hydrographics = Number(world?.hydrographics ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 15);

  if (type === "Planetoid Belt") score -= 3;
  if (size >= 4 && size <= 9) score += 4;
  else if (size >= 1) score += 1;

  if (atmosphere >= 4 && atmosphere <= 9) score += 4;
  else if (atmosphere >= 2 && atmosphere <= 3) score += 1;
  else if (atmosphere >= 10) score -= 2;

  if (hydrographics >= 3 && hydrographics <= 8) score += 4;
  else if (hydrographics > 0) score += 1;
  else score -= 1;

  if (avgTempC >= -10 && avgTempC <= 35) score += 3;
  else if (avgTempC >= -40 && avgTempC <= 60) score += 1;
  else score -= 2;

  if (
    world?.orbitNumber !== null &&
    world?.orbitNumber !== undefined &&
    hzco !== null &&
    hzco !== undefined &&
    Number.isFinite(Number(world?.orbitNumber)) &&
    Number.isFinite(Number(hzco)) &&
    Number(hzco) > 0
  ) {
    const deviation = Math.abs(calculateEffectiveHzcoDeviation({ orbitNumber: world.orbitNumber, hzco }));
    score += Math.max(-4, 4 - deviation * 4);
  }

  if (world?.nativeSophontLife) {
    score += 5;
  }

  switch (
    String(world?.resourceRating || "")
      .trim()
      .toLowerCase()
  ) {
    case "abundant":
      score += 3;
      break;
    case "good":
      score += 2;
      break;
    case "moderate":
      score += 1;
      break;
    case "none":
      score -= 1;
      break;
    default:
      break;
  }

  if (
    hydrographics > 0 ||
    String(world?.hydrosphereLiquid || "")
      .trim()
      .toLowerCase()
      .includes("water") ||
    String(world?.parentWorldType || "")
      .trim()
      .toLowerCase()
      .includes("gas giant")
  ) {
    score += 1;
  }

  return Number(score.toFixed(2));
}

export function calculateHabitableCandidateWindowWbh(hzco) {
  const numericHzco = Number(hzco);
  if (!Number.isFinite(numericHzco) || numericHzco <= 0) {
    return null;
  }

  if (numericHzco >= 1) {
    return {
      inner: roundOrbit(Math.max(0.01, numericHzco - 1)),
      outer: roundOrbit(numericHzco + 1),
    };
  }

  const rawUpper = numericHzco + 0.1;
  return {
    inner: roundOrbit(Math.max(0.01, numericHzco - 0.1)),
    outer: roundOrbit(rawUpper > 1 ? 1 + (rawUpper - 1) * 10 : rawUpper),
  };
}

export function selectMainworldCandidateWbh(worlds = [], { hzcoResolver = (world) => world?.hzco } = {}) {
  if (!Array.isArray(worlds) || !worlds.length) {
    return null;
  }

  const ranked = worlds
    .map((world, index) => {
      const hzco = Number(hzcoResolver(world));
      const candidateWindow = calculateHabitableCandidateWindowWbh(hzco);
      const orbitNumber = Number(world?.orbitNumber);
      const withinHabitableBand =
        candidateWindow && Number.isFinite(orbitNumber)
          ? orbitNumber >= candidateWindow.inner && orbitNumber <= candidateWindow.outer
          : false;

      return {
        index,
        world,
        hzco,
        candidateWindow,
        withinHabitableBand,
        score: scoreMainworldCandidateWbh(world, { hzco }),
      };
    })
    .filter((entry) => String(entry?.world?.type || "") !== "Gas Giant")
    .sort((left, right) => {
      if (left.withinHabitableBand !== right.withinHabitableBand) {
        return Number(right.withinHabitableBand) - Number(left.withinHabitableBand);
      }
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      const leftSize = Number(left?.world?.size ?? 0);
      const rightSize = Number(right?.world?.size ?? 0);
      if (leftSize !== rightSize) {
        return rightSize - leftSize;
      }
      return left.index - right.index;
    });

  return ranked[0] ?? null;
}

function createStarGroups(stars = []) {
  const starList = Array.isArray(stars) ? stars : [];
  const primary = starList[0] ?? null;
  if (!primary) {
    return [];
  }

  const primaryKey = primary?.starKey ?? "star-0";
  const primaryCompanions = starList.filter((star, index) => {
    if (index === 0 || String(star?.orbitType || "").toLowerCase() !== "companion") return false;
    return String(star?.parentStarKey || primaryKey) === primaryKey;
  });
  const primaryCompanionFloor = primaryCompanions.reduce((highest, companion) => {
    const baseOrbit = Number(companion?.orbitNumber ?? 0);
    if (!(baseOrbit > 0)) {
      return highest;
    }
    let clearance = baseOrbit + 0.1;
    if (Number(companion?.eccentricity || 0) > 0.2) clearance += 0.5;
    if (Number(companion?.eccentricity || 0) > 0.5) clearance += 0.5;
    return Math.max(highest, clearance);
  }, 0);
  const primaryGroup = {
    key: "primary",
    label: primaryCompanions.length ? "Aab" : "A",
    orbitType: "Primary",
    stars: [primary, ...primaryCompanions],
    hasCompanion: primaryCompanions.length > 0,
    parentStarKey: null,
    hierarchyLevel: 0,
    continuationOf: null,
    minimumOrbit: Math.max(calculateMinimumAllowableOrbitWbh(primary), primaryCompanionFloor),
    maximumOrbit: 20,
    orbitNumber: null,
    eccentricity: 0,
    exclusionRanges: [],
  };

  const secondaryGroups = starList
    .filter((star, index) => index > 0 && String(star?.orbitType || "").toLowerCase() !== "companion")
    .map((star, index) => {
      const groupCompanions = starList.filter(
        (candidate) =>
          String(candidate?.orbitType || "").toLowerCase() === "companion" &&
          String(candidate?.parentStarKey || "") === String(star?.starKey || ""),
      );
      const continuationState = deriveGroupContinuation(star, groupCompanions);
      const companionFloor = groupCompanions.reduce((highest, companion) => {
        const baseOrbit = Number(companion?.orbitNumber ?? 0);
        if (!(baseOrbit > 0)) {
          return highest;
        }
        let clearance = baseOrbit + 0.1;
        if (Number(companion?.eccentricity || 0) > 0.2) clearance += 0.5;
        if (Number(companion?.eccentricity || 0) > 0.5) clearance += 0.5;
        return Math.max(highest, clearance);
      }, 0);
      let maximumOrbit = Math.max(0.2, Number(star?.orbitNumber ?? 3) - 3);
      const orbitType = String(star?.orbitType || "Near");
      const eccentricity = Number(star?.eccentricity || 0);
      const secondaryMao = calculateMinimumAllowableOrbitWbh(star);

      const hasAdjacent = starList.some((candidate, candidateIndex) => {
        if (candidateIndex === 0 || candidate === star) return false;
        const candidateType = String(candidate?.orbitType || "").toLowerCase();
        const currentType = orbitType.toLowerCase();
        return (
          (currentType === "close" && candidateType === "near") ||
          (currentType === "near" && ["close", "far"].includes(candidateType)) ||
          (currentType === "far" && candidateType === "near")
        );
      });

      if (hasAdjacent) maximumOrbit -= 1;
      if (eccentricity > 0.2) maximumOrbit -= 1;
      if (eccentricity > 0.5) maximumOrbit -= 1;
      if (groupCompanions.length) maximumOrbit -= 0.5;
      if (continuationState.continuationOf) maximumOrbit -= 0.5;
      if (continuationState.hierarchyLevel > Number(star?.hierarchyLevel || 1)) maximumOrbit -= 0.5;

      return {
        key: `secondary-${index + 1}`,
        label: groupCompanions.length ? `${orbitType}+Companion` : orbitType,
        orbitType,
        stars: [star, ...groupCompanions],
        hostStarKey: String(star?.starKey || `secondary-${index + 1}`),
        hasCompanion: groupCompanions.length > 0,
        parentStarKey: String(star?.parentStarKey || primaryKey),
        hierarchyLevel: continuationState.hierarchyLevel,
        continuationOf: continuationState.continuationOf,
        branchDepth: continuationState.branchDepth,
        nestedCompanionCount: continuationState.nestedCompanionCount,
        minimumOrbit: Math.max(secondaryMao, companionFloor),
        maximumOrbit: Math.max(
          Math.max(secondaryMao, companionFloor) + 0.1,
          maximumOrbit -
            Math.max(0, continuationState.branchDepth - 1) * 0.5 -
            continuationState.nestedCompanionCount * 0.25,
        ),
        secondaryMao,
        orbitNumber: Number(star?.orbitNumber ?? null),
        eccentricity,
        exclusionRanges: [],
      };
    });

  const groups = annotateGroupHierarchy([primaryGroup, ...secondaryGroups]);
  groups.forEach((group) => {
    group.exclusionRanges = getGroupExclusionRanges(group, groups);
  });

  return groups.map((group) => {
    const availableOrbitSpan = getAvailableOrbitSpan({
      minimumOrbit: group.minimumOrbit,
      maximumOrbit: group.maximumOrbit,
      exclusionRanges: group.exclusionRanges,
    });
    const totalStarOrbits = Math.max(
      0,
      Math.floor(availableOrbitSpan + (!group.hasCompanion && availableOrbitSpan > 0 ? 1 : 0)),
    );

    return {
      ...group,
      availableOrbitSpan,
      totalStarOrbits,
      extraSlots: 0,
      allocatedWorlds: 0,
    };
  });
}

function allocateWorldsByGroup(groups, totalWorlds) {
  if (!groups.length) {
    return groups;
  }

  const totalSystemOrbits = groups.reduce((sum, group) => sum + group.totalStarOrbits, 0) || groups.length;
  let assignedWorlds = 0;

  groups.forEach((group, index) => {
    const rawShare = (Number(totalWorlds) * (group.totalStarOrbits || 1)) / totalSystemOrbits;
    let allocation;
    if (index === 0) {
      allocation = Math.ceil(rawShare);
    } else if (index === groups.length - 1) {
      allocation = Number(totalWorlds) - assignedWorlds;
    } else {
      allocation = Math.floor(rawShare);
    }

    group.allocatedWorlds = Math.max(0, allocation);
    assignedWorlds += group.allocatedWorlds;
  });

  return groups;
}

function generateOrbitSlotsForGroup({ group, totalStars, rollDie, baselineNumber, baselineOrbit, spread, slotCount }) {
  if (!(slotCount > 0)) {
    return [];
  }

  const baselineIndex = clamp(Math.round(baselineNumber), 1, slotCount);
  const slots = new Array(slotCount).fill(null);
  slots[baselineIndex - 1] = adjustOrbitForAvailability({
    orbitNumber: baselineOrbit,
    minimumOrbit: group.minimumOrbit,
    maximumOrbit: group.maximumOrbit,
    exclusionRanges: group.exclusionRanges,
  });

  if (baselineIndex > 1) {
    let previousOrbit = adjustOrbitForAvailability({
      orbitNumber: group.minimumOrbit + spread + ((roll2d(rollDie) - 7) * spread) / 10,
      minimumOrbit: group.minimumOrbit,
      maximumOrbit: slots[baselineIndex - 1],
      exclusionRanges: group.exclusionRanges,
    });
    slots[0] = previousOrbit;

    for (let index = 1; index < baselineIndex - 1; index += 1) {
      previousOrbit = adjustOrbitForAvailability({
        orbitNumber: previousOrbit + spread + ((roll2d(rollDie) - 7) * spread) / 10,
        minimumOrbit: group.minimumOrbit,
        maximumOrbit: slots[baselineIndex - 1],
        exclusionRanges: group.exclusionRanges,
      });
      slots[index] = previousOrbit;
    }
  }

  for (let index = baselineIndex; index < slotCount; index += 1) {
    const previousOrbit = slots[index - 1] ?? slots[baselineIndex - 1];
    slots[index] = adjustOrbitForAvailability({
      orbitNumber: previousOrbit + spread + ((roll2d(rollDie) - 7) * spread) / 10,
      minimumOrbit: group.minimumOrbit,
      maximumOrbit: group.maximumOrbit,
      exclusionRanges: group.exclusionRanges,
    });
  }

  return slots.map((orbitNumber, index) => ({
    groupKey: group.key,
    groupLabel: group.label,
    orbitType: group.orbitType,
    orbitNumber,
    orbitAU: roundOrbit(fractionalOrbitToAu(orbitNumber)),
    slotIndex: index,
    totalStars,
    stellarMasses: group.stars.map((star) => Number(star?.massInSolarMasses ?? star?.mass ?? 0)),
    hzco: calculateHabitableZoneCenterOrbit(sumLuminosity(group.stars)),
    isAnomalous: false,
  }));
}

function chooseUniqueIndexes(candidates, count, chooseIndex) {
  const selected = [];
  const pool = [...candidates];
  while (selected.length < count && pool.length) {
    const choiceIndex = chooseIndex(pool.length);
    selected.push(pool.splice(choiceIndex, 1)[0]);
  }
  return selected;
}

function buildGroupPlacementOrder(groups = []) {
  const childGroupsByParent = new Map();

  groups.forEach((group) => {
    if (group?.key === "primary") {
      return;
    }

    const parentKey = String(group?.parentStarKey || "primary");
    if (!childGroupsByParent.has(parentKey)) {
      childGroupsByParent.set(parentKey, []);
    }
    childGroupsByParent.get(parentKey).push(group);
  });

  const sortGroups = (left, right) => {
    const orbitDelta =
      Number(left?.orbitNumber ?? Number.POSITIVE_INFINITY) - Number(right?.orbitNumber ?? Number.POSITIVE_INFINITY);
    if (orbitDelta !== 0) {
      return orbitDelta;
    }

    const priorityDelta = getOrbitPriority(left) - getOrbitPriority(right);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return String(left?.key || "").localeCompare(String(right?.key || ""));
  };

  const primaryGroup = groups.find((group) => group?.key === "primary");
  const orderedKeys = [];

  function visitChildren(parentHostKey) {
    const children = [...(childGroupsByParent.get(parentHostKey) ?? [])].sort(sortGroups);
    children.forEach((child) => {
      orderedKeys.push(child.key);
      visitChildren(String(child?.hostStarKey || child?.key || ""));
    });
  }

  if (primaryGroup) {
    orderedKeys.push(primaryGroup.key);
    visitChildren(String(primaryGroup?.stars?.[0]?.starKey || "star-0"));
  }

  return new Map(orderedKeys.map((key, index) => [key, index]));
}

export function determineWbhSystemBodyPlan({ stars = [], rollDie = createRandomRoller() } = {}) {
  const primary = Array.isArray(stars) ? stars[0] : null;
  const starCount = Array.isArray(stars) ? stars.length : 0;
  const postStellarObjectCount = (Array.isArray(stars) ? stars : []).filter((star) => isPostStellarObject(star)).length;
  const groups = allocateWorldsByGroup(createStarGroups(stars), 0);

  const gasGiants = calculateGasGiantPresence({ method: "2d", rollTotal: roll2d(rollDie) })
    ? calculateGasGiantQuantityWbh({
        rollTotal: roll2d(rollDie),
        isSingleClassV: starCount === 1 && getLuminosityClassCode(primary) === "V",
        isBrownDwarfPrimary: isBrownDwarfObject(primary),
        isPostStellarPrimary: isPostStellarObject(primary),
        postStellarObjectCount,
        starCount,
      })
    : 0;
  const planetoidBelts =
    roll2d(rollDie) >= 8
      ? calculatePlanetoidBeltQuantityWbh({
          rollTotal: roll2d(rollDie),
          gasGiants,
          isPostStellarPrimary: isPostStellarObject(primary),
          postStellarObjectCount,
          starCount,
        })
      : 0;
  const terrestrialPlanets = calculateTerrestrialPlanetQuantityWbh({
    rollTotal: roll2d(rollDie),
    postStellarObjectCount,
    rollDie,
  });

  const emptyOrbits = calculateEmptyOrbitQuantityWbh(roll2d(rollDie));
  const anomalousOrbits = calculateAnomalousOrbitQuantityWbh(roll2d(rollDie));
  const totalWorlds = calculateWbhTotalWorlds({ gasGiants, planetoidBelts, terrestrialPlanets }) + anomalousOrbits;

  allocateWorldsByGroup(groups, totalWorlds);
  allocateExtraSlots(groups, emptyOrbits, (availableGroups) => {
    const sorted = [...availableGroups].sort((left, right) => getOrbitPriority(left) - getOrbitPriority(right));
    return sorted[0] ?? null;
  });

  const anomalousTargets = groups.filter((group) => group.allocatedWorlds > 0);
  allocateExtraSlots(
    anomalousTargets,
    anomalousOrbits,
    (availableGroups, index) => availableGroups[index % availableGroups.length],
  );

  const slots = groups.flatMap((group) => {
    if (!(group.allocatedWorlds > 0)) {
      return [];
    }

    const groupLuminosity = sumLuminosity(group.stars);
    const hzco = getSystemLayoutAnchorOrbit(group.stars);
    const baselineNumber = calculateBaselineNumberWbh({
      rollTotal: roll2d(rollDie),
      luminosityClass: getLuminosityClassCode(group.stars[0]),
      totalWorlds: group.allocatedWorlds,
      secondaryStarCount: group.key === "primary" ? groups.length - 1 : 0,
      isPostStellarPrimary: isPostStellarObject(group.stars[0]),
    });
    const baselineOrbit = calculateBaselineOrbitWbh({
      rollTotal: roll2d(rollDie),
      hzco,
      baselineNumber,
      totalWorlds: group.allocatedWorlds,
      minimumOrbit: group.minimumOrbit,
    });
    const spread = calculateSystemSpreadWbh({
      baselineOrbit,
      minimumOrbit: group.minimumOrbit,
      baselineNumber,
      availableOrbitSpan: group.availableOrbitSpan,
      allocatedOrbits: group.allocatedWorlds + group.extraSlots,
      totalStars: starCount,
    });

    const regularSlots = generateOrbitSlotsForGroup({
      group,
      totalStars: starCount,
      rollDie,
      baselineNumber,
      baselineOrbit,
      spread,
      slotCount: group.allocatedWorlds + group.extraSlots,
    });

    const anomalousSlots = Array.from(
      {
        length: Math.max(
          0,
          Number(group.extraSlots || 0) - Number(group.allocatedWorlds || 0) + Math.max(0, anomalousOrbits),
        ),
      },
      () => null,
    );
    void anomalousSlots;

    const extraAnomalous = Array.from({
      length: Math.max(0, Number(group.extraSlots || 0) > group.allocatedWorlds ? 0 : 0),
    });
    void extraAnomalous;

    return regularSlots.map((slot) => ({
      ...slot,
      baselineNumber,
      baselineOrbit,
      spread,
    }));
  });

  const anomalousSlots = Array.from({ length: anomalousOrbits }, (_, index) => {
    const targetGroup =
      groups.filter((group) => group.allocatedWorlds > 0)[
        index % Math.max(1, groups.filter((group) => group.allocatedWorlds > 0).length)
      ] ?? groups[0];
    const orbitNumber = adjustOrbitForAvailability({
      orbitNumber:
        targetGroup.minimumOrbit +
        Math.max(
          0.05,
          (targetGroup.maximumOrbit - targetGroup.minimumOrbit) * ((roll2d(rollDie) - 2) / 10 + rollDie(10) / 100),
        ),
      minimumOrbit: targetGroup.minimumOrbit,
      maximumOrbit: targetGroup.maximumOrbit,
      exclusionRanges: targetGroup.exclusionRanges,
    });

    return {
      groupKey: targetGroup.key,
      groupLabel: targetGroup.label,
      orbitType: targetGroup.orbitType,
      orbitNumber,
      orbitAU: roundOrbit(fractionalOrbitToAu(orbitNumber)),
      slotIndex: Number.MAX_SAFE_INTEGER - index,
      totalStars: starCount,
      stellarMasses: targetGroup.stars.map((star) => Number(star?.massInSolarMasses ?? star?.mass ?? 0)),
      hzco:
        sumLuminosity(targetGroup.stars) > 0
          ? calculateHabitableZoneCenterOrbit(sumLuminosity(targetGroup.stars))
          : null,
      isAnomalous: true,
    };
  });

  const placementOrder = buildGroupPlacementOrder(groups);
  const allSlots = [...slots, ...anomalousSlots].sort((left, right) => {
    const groupDelta =
      Number(placementOrder.get(left.groupKey) ?? Number.MAX_SAFE_INTEGER) -
      Number(placementOrder.get(right.groupKey) ?? Number.MAX_SAFE_INTEGER);
    if (groupDelta !== 0) {
      return groupDelta;
    }

    const orbitDelta = Number(left.orbitNumber) - Number(right.orbitNumber);
    if (orbitDelta !== 0) {
      return orbitDelta;
    }

    return Number(left.slotIndex) - Number(right.slotIndex);
  });
  const chooseIndex = (length) => Math.max(0, Math.min(length - 1, roll2d(rollDie) - 2));

  const emptyIndexes = new Set(
    chooseUniqueIndexes(
      allSlots.map((_, index) => index).filter((index) => !allSlots[index].isAnomalous),
      emptyOrbits,
      chooseIndex,
    ),
  );

  const nonEmptyIndexes = allSlots.map((_, index) => index).filter((index) => !emptyIndexes.has(index));
  const outerBiasIndexes = [...nonEmptyIndexes].sort(
    (left, right) => allSlots[right].orbitNumber - allSlots[left].orbitNumber,
  );
  const gasIndexes = new Set(
    chooseUniqueIndexes(outerBiasIndexes, gasGiants, (length) => Math.min(length - 1, chooseIndex(length))),
  );

  const beltCandidateIndexes = nonEmptyIndexes.filter((index) => !gasIndexes.has(index));
  const beltIndexes = new Set(chooseUniqueIndexes(beltCandidateIndexes, planetoidBelts, chooseIndex));

  // Track claimed orbit AUs so duplicate placements can be nudged to the next free orbit.
  const usedOrbitAUs = new Set();

  const planets = allSlots.map((slot, index) => {
    let type = "Terrestrial Planet";
    if (emptyIndexes.has(index)) type = "Empty Orbit";
    else if (gasIndexes.has(index)) type = "Gas Giant";
    else if (beltIndexes.has(index)) type = "Planetoid Belt";

    const orbitalPeriod = calculatePlanetaryOrbitalPeriod({
      orbitNumber: slot.orbitNumber,
      stellarMasses: slot.stellarMasses,
    });
    const hzco = slot.hzco;
    const zone =
      Number.isFinite(Number(hzco)) && Number(hzco) > 0
        ? (() => {
            const deviation = calculateEffectiveHzcoDeviation({ orbitNumber: slot.orbitNumber, hzco });
            // Correct ordering inner→outer: hot (< -2) → warm (-2 to -1) → habitable (-1 to 1) → cold (> 1)
            return deviation < -2 ? "hot" : deviation < -1 ? "warm" : deviation <= 1 ? "habitable" : "cold";
          })()
        : "cold";

    // Deduplicate orbit AU: if another body already occupies this AU, nudge outward.
    let orbitAU = slot.orbitAU;
    if (type !== "Empty Orbit") {
      const step = orbitAU < 1 ? 0.05 : 0.1;
      while (usedOrbitAUs.has(orbitAU)) {
        orbitAU = roundOrbit(orbitAU + step);
      }
      usedOrbitAUs.add(orbitAU);
    }

    return {
      ...slot,
      orbitAU,
      type,
      orbitalPeriodDays: Math.round(orbitalPeriod.days),
      zone,
    };
  });

  return {
    counts: {
      gasGiants,
      planetoidBelts,
      terrestrialPlanets: terrestrialPlanets + anomalousOrbits,
      emptyOrbits,
      anomalousOrbits,
      totalWorlds,
    },
    groups,
    planets: planets.filter((planet) => planet.type !== "Empty Orbit"),
    slots: planets,
  };
}

export function generateStarSystemWbh(params = {}) {
  const hzco = params.luminosity ? calculateHabitableZoneCenterOrbit(params.luminosity) : null;

  return {
    name: params.name || "Unnamed System",
    generatorModel: "wbh-system-core",
    wbhStatus: "implemented-orbit-placement-helpers",
    bodyTypes: getWbhBodyTypes(),
    wbhCoverage: SYSTEM_WBH_RULES,
    habitableZoneCenterOrbit: hzco,
    habitableZoneCenterAu: hzco === null ? null : calculateHabitableZoneCenterAu(params.luminosity),
  };
}
