import { generatePhonotacticName } from "./nameGenerator.js";
import { resolveStarDescriptorToken } from "./starDisplay.js";
import { scoreMainworldCandidateWbh, selectMainworldCandidateWbh } from "./wbh/systemGenerationWbh.js";
import {
  buildNativeLifeProfile,
  determineHabitabilityRating,
  determineResourceRating,
  generateWorldPhysicalCharacteristicsWbh,
} from "./wbh/worldPhysicalCharacteristicsWbh.js";

const GOVERNMENT_TABLE = {
  0: "No Government",
  1: "Company/Corporation",
  2: "Participating Democracy",
  3: "Self-Perpetuating Oligarchy",
  4: "Representative Democracy",
  5: "Feudal Technocracy",
  6: "Captive Government",
  7: "Balkanization",
  8: "Civil Service Bureaucracy",
  9: "Impersonal Bureaucracy",
  10: "Charismatic Dictator",
  11: "Non-Charismatic Leader",
  12: "Charismatic Oligarchy",
  13: "Religious Dictatorship",
};

const LAW_TABLE = {
  0: "No Law",
  1: "Body pistols, explosives prohibited",
  2: "Portable energy weapons prohibited",
  3: "Machine guns, automatic rifles prohibited",
  4: "Light assault weapons prohibited",
  5: "Personal concealable weapons prohibited",
  6: "All firearms except shotguns prohibited",
  7: "Shotguns prohibited",
  8: "Long bladed weapons controlled",
  9: "All weapons prohibited",
};

const TECH_TABLE = {
  0: "Primitive",
  1: "Primitive",
  2: "Pre-Industrial",
  3: "Pre-Industrial",
  4: "Industrial",
  5: "Industrial",
  6: "Pre-Stellar",
  7: "Pre-Stellar",
  8: "Stellar",
  9: "Stellar",
  10: "High Stellar",
  11: "High Stellar",
  12: "Average Imperial",
  13: "Average Imperial",
  14: "High Imperial",
  15: "Experimental",
};

const STARPORT_TABLE = {
  A: "Excellent — Refined fuel, Shipyard (any)",
  B: "Good — Refined fuel, Shipyard (small craft)",
  C: "Routine — Unrefined fuel, no shipyard",
  D: "Poor — Unrefined fuel, limited repair",
  E: "Frontier — No facilities",
  X: "No starport",
};

const RANDOM_WORLD_STARS = ["O", "B", "A", "F", "G", "G", "G", "K", "K", "M", "M", "M"];
export const WORLD_NAMES = [
  "Arrakis",
  "Hestia",
  "Lycan",
  "Varna",
  "Oxtus",
  "Theron",
  "Velan",
  "Korreth",
  "Solvaris",
  "Durath",
  "Mirela",
  "Ashford",
  "Phaedra",
  "Calyx",
  "Numeria",
];

export const WORLD_PROFILE_FIELDS = [
  "name",
  "uwp",
  "isMainworld",
  "size",
  "diameterKm",
  "gravity",
  "atmosphereCode",
  "atmosphereDesc",
  "hydrographics",
  "avgTempC",
  "tempCategory",
  "orbitalPeriodDays",
  "dayLengthHours",
  "axialTilt",
  "moons",
  "parentWorldName",
  "isMoon",
  "moonOrdinal",
  "habitability",
  "resourceRating",
  "importance",
  "nativeLifeform",
  "economics",
  "remarks",
  "mainworldCandidateScore",
  "majorTectonicPlates",
  "seismology",
  "magnetosphere",
  "nativeSophontLife",
  "populationCode",
  "population",
  "governmentCode",
  "governmentDesc",
  "lawLevel",
  "lawDesc",
  "techLevel",
  "techDesc",
  "starport",
  "starportDesc",
  "tradeCodes",
];

function d6(n = 2) {
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    total += 1 + Math.floor(Math.random() * 6);
  }
  return total;
}

function d1(sides = 6) {
  return 1 + Math.floor(Math.random() * sides);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHex(value) {
  if (value < 10) {
    return String(value);
  }
  return String.fromCharCode(65 + value - 10);
}

function buildTradeCodes({ size, atmosphereCode, hydrographics, populationCode, governmentCode, lawLevel, techLevel }) {
  const tradeCodes = [];
  if (
    atmosphereCode >= 4 &&
    atmosphereCode <= 9 &&
    hydrographics >= 4 &&
    hydrographics <= 8 &&
    populationCode >= 5 &&
    populationCode <= 7
  ) {
    tradeCodes.push("Ag");
  }
  if (Number(size) === 0 && atmosphereCode === 0 && hydrographics === 0) tradeCodes.push("As");
  if (populationCode === 0 && governmentCode === 0 && lawLevel === 0) tradeCodes.push("Ba");
  if (atmosphereCode >= 2 && hydrographics === 0) tradeCodes.push("De");
  if (atmosphereCode >= 10 && hydrographics >= 1) tradeCodes.push("Fl");
  if (
    Number(size) >= 6 &&
    (atmosphereCode === 5 || atmosphereCode === 6 || atmosphereCode === 8) &&
    hydrographics >= 5
  ) {
    tradeCodes.push("Ga");
  }
  if (populationCode >= 9) tradeCodes.push("Hi");
  if (techLevel >= 12) tradeCodes.push("Ht");
  if (hydrographics >= 1 && hydrographics <= 5 && atmosphereCode <= 3) tradeCodes.push("Ic");
  if (
    (atmosphereCode <= 2 || atmosphereCode === 4 || atmosphereCode === 7 || atmosphereCode === 9) &&
    populationCode >= 9
  ) {
    tradeCodes.push("In");
  }
  if (populationCode >= 1 && populationCode <= 3) tradeCodes.push("Lo");
  if (techLevel <= 5) tradeCodes.push("Lt");
  if (atmosphereCode <= 3 && hydrographics <= 3 && populationCode >= 6) tradeCodes.push("Na");
  if (populationCode >= 4 && populationCode <= 6) tradeCodes.push("Ni");
  if (atmosphereCode >= 2 && atmosphereCode <= 5 && hydrographics <= 3) tradeCodes.push("Po");
  if (
    (atmosphereCode === 6 || atmosphereCode === 8) &&
    populationCode >= 6 &&
    governmentCode >= 4 &&
    governmentCode <= 9
  ) {
    tradeCodes.push("Ri");
  }
  if (hydrographics >= 10) tradeCodes.push("Wa");
  if (atmosphereCode === 0) tradeCodes.push("Va");
  return tradeCodes;
}

function deriveImportance({ tradeCodes = [], starport = "X", techLevel = 0, populationCode = 0 } = {}) {
  let importance = 0;
  if (["A", "B"].includes(starport)) importance += 1;
  if (Number(techLevel) >= 10) importance += 1;
  if (Number(techLevel) <= 8) importance -= 1;
  if (Number(populationCode) >= 9) importance += 1;
  if (Number(populationCode) <= 6) importance -= 1;
  if (tradeCodes.includes("Ag")) importance += 1;
  if (tradeCodes.includes("In")) importance += 1;
  if (tradeCodes.includes("Ri")) importance += 1;
  return importance;
}

function buildWorldRemarks(world = {}, overlay = {}) {
  const remarks = [];
  if (world?.isMoon) remarks.push("Moon");
  if (world?.parentWorldName) remarks.push(`Orbits ${world.parentWorldName}`);
  if (overlay?.habitability === "Excellent") remarks.push("Prime Candidate");
  if (overlay?.habitability === "Hostile") remarks.push("Hostile Environment");
  if (overlay?.resourceRating === "Abundant") remarks.push("Resource Rich");
  if (world?.nativeSophontLife) remarks.push("Native Life");
  if (overlay?.isMainworld) remarks.push("Mainworld");
  return remarks;
}

function normalizeMoonWorldType(type) {
  return String(type || "")
    .toLowerCase()
    .includes("gas")
    ? "Gas Giant Moon"
    : "Significant Moon";
}

function flattenWorldWithMoons(world = {}) {
  const entries = [{ ...world, isMoon: Boolean(world?.isMoon) }];
  const moons = Array.isArray(world?.moonsData) ? world.moonsData : [];

  moons.forEach((moon, index) => {
    if (!moon || moon.type !== "significant" || moon.ring) {
      return;
    }

    const profile = moon.worldProfile && typeof moon.worldProfile === "object" ? moon.worldProfile : {};
    entries.push({
      ...profile,
      name: String(moon.name || `${world?.name || "World"} ${index + 1}`),
      type: normalizeMoonWorldType(world?.type),
      worldType: normalizeMoonWorldType(world?.type),
      composition: profile.composition ?? world?.composition ?? null,
      orbitNumber: world?.orbitNumber,
      orbitAU: world?.orbitAU,
      orbitalPeriodDays: world?.orbitalPeriodDays,
      zone: world?.zone,
      hzco: world?.hzco,
      orbitGroup: world?.orbitGroup,
      isAnomalousOrbit: Boolean(world?.isAnomalousOrbit),
      parentWorldName: world?.name,
      parentWorldType: world?.type,
      parentWorldSize: world?.size,
      moonOrdinal: moon.orbitalSlot,
      isMoon: true,
      moonsData: Array.isArray(profile?.moonsData) ? profile.moonsData : [],
    });
  });

  return entries;
}

function computePopulationValue(populationCode) {
  if (!(populationCode > 0)) {
    return 0;
  }

  return 10 ** populationCode;
}

function rollStarport(populationCode) {
  let dm = 0;
  if (populationCode <= 2) dm -= 2;
  else if (populationCode <= 4) dm -= 1;
  else if (populationCode >= 8 && populationCode <= 9) dm += 1;
  else if (populationCode >= 10) dm += 2;

  const total = d6() + d6() + dm;
  if (total <= 2) return "X";
  if (total <= 4) return "E";
  if (total <= 6) return "D";
  if (total <= 8) return "C";
  if (total <= 10) return "B";
  return "A";
}

function rollTechLevel({
  starport,
  size,
  atmosphereCode,
  hydrographics,
  populationCode,
  governmentCode,
  nativeSophontLife,
}) {
  let dm = 0;

  dm += { A: 6, B: 4, C: 2, X: -4 }[starport] || 0;
  if (size <= 1) dm += 2;
  else if (size >= 2 && size <= 4) dm += 1;

  if (atmosphereCode <= 3 || atmosphereCode >= 10) dm += 1;
  if (hydrographics === 9) dm += 1;
  else if (hydrographics === 10) dm += 2;

  if (populationCode >= 1 && populationCode <= 5) dm += 1;
  else if (populationCode === 9) dm += 2;
  else if (populationCode === 10) dm += 4;

  if (governmentCode === 0 || governmentCode === 5) dm += 1;
  else if (governmentCode === 13) dm -= 2;

  if (nativeSophontLife) dm -= 1;

  return clamp(d1() + dm, 0, 15);
}

function deriveSocialUwp({ world, isMainworld = true, mainworldPopulationCode = null } = {}) {
  const size = Number(world?.size ?? 0);
  const atmosphereCode = Number(world?.atmosphereCode ?? 0);
  const hydrographics = Number(world?.hydrographics ?? 0);
  const candidateScore = scoreMainworldCandidateWbh(world, { hzco: world?.hzco });
  const nativeSophontLife = Boolean(world?.nativeSophontLife);

  let populationCode;
  if (isMainworld) {
    const habitabilityDm = candidateScore >= 10 ? 1 : candidateScore <= 2 ? -2 : 0;
    populationCode = clamp(d6() + d6() - 2 + habitabilityDm, 0, 10);
  } else {
    const base = Number.isInteger(mainworldPopulationCode) ? mainworldPopulationCode : 5;
    const colonyPenalty = size === 0 ? 4 : atmosphereCode === 0 || hydrographics === 0 ? 3 : 2;
    populationCode = clamp(base - colonyPenalty - Math.floor(d1() / 2), 0, Math.max(0, base - 1));
    if (candidateScore <= 0 && !nativeSophontLife) {
      populationCode = 0;
    }
  }

  const governmentCode = populationCode === 0 ? 0 : clamp(d6() + d6() - 7 + populationCode, 0, 13);
  const lawLevel = populationCode === 0 ? 0 : clamp(d6() + d6() - 7 + governmentCode, 0, 9);
  const starport = populationCode === 0 ? "X" : rollStarport(populationCode);
  const techLevel =
    populationCode === 0
      ? 0
      : rollTechLevel({
          starport,
          size,
          atmosphereCode,
          hydrographics,
          populationCode,
          governmentCode,
          nativeSophontLife,
        });
  const tradeCodes = buildTradeCodes({
    size,
    atmosphereCode,
    hydrographics,
    populationCode,
    governmentCode,
    lawLevel,
    techLevel,
  });

  return {
    isMainworld,
    mainworldCandidateScore: candidateScore,
    populationCode,
    population: computePopulationValue(populationCode),
    governmentCode,
    governmentDesc: GOVERNMENT_TABLE[governmentCode] ?? "Unknown",
    lawLevel,
    lawDesc: LAW_TABLE[lawLevel] ?? "Unknown",
    techLevel,
    techDesc: TECH_TABLE[techLevel] ?? "Unknown",
    starport,
    starportDesc: STARPORT_TABLE[starport] ?? "Unknown",
    tradeCodes,
    habitability: determineHabitabilityRating({
      candidateScore,
      size,
      atmosphereCode,
      hydrographics,
      avgTempC: Number(world?.avgTempC ?? 0),
    }),
    resourceRating: determineResourceRating(world),
    importance: deriveImportance({ tradeCodes, starport, techLevel, populationCode }),
    nativeLifeform: buildNativeLifeProfile(world),
  };
}

export function applySystemWorldSocialProfiles(worlds = []) {
  if (!Array.isArray(worlds) || !worlds.length) {
    return [];
  }

  const expandedWorlds = worlds.flatMap((world) => flattenWorldWithMoons(world));

  const mainworldSelection = selectMainworldCandidateWbh(expandedWorlds, {
    hzcoResolver: (world) => world?.hzco,
  });
  const mainworldIndex = mainworldSelection?.index ?? 0;

  const mainworldOverlay = deriveSocialUwp({ world: expandedWorlds[mainworldIndex], isMainworld: true });

  return expandedWorlds.map((world, index) => {
    const overlay =
      index === mainworldIndex
        ? mainworldOverlay
        : deriveSocialUwp({
            world,
            isMainworld: false,
            mainworldPopulationCode: mainworldOverlay.populationCode,
          });
    const uwp = `${overlay.starport}${toHex(Number(world?.size ?? 0))}${toHex(Number(world?.atmosphereCode ?? 0))}${toHex(Number(world?.hydrographics ?? 0))}${toHex(overlay.populationCode)}${toHex(overlay.governmentCode)}${toHex(overlay.lawLevel)}-${toHex(overlay.techLevel)}`;
    const economics = {
      importance: overlay.importance,
      resourceRating: overlay.resourceRating,
      habitability: overlay.habitability,
    };
    const remarks = buildWorldRemarks(world, overlay);

    return {
      ...world,
      ...overlay,
      economics,
      remarks,
      uwp,
    };
  });
}

export function normalizeWorldStarClass(value) {
  const token = resolveStarDescriptorToken(value, "G");
  return (
    {
      O: "O",
      B: "B",
      A: "A",
      F: "F",
      G: "G",
      K: "K",
      M: "M",
      D: "A",
      BD: "M",
      L: "M",
      T: "M",
      Y: "M",
      PROTO: "K",
    }[token] || "random"
  );
}

function resolveWorldStarClass(starClass) {
  const normalized = normalizeWorldStarClass(starClass);
  if (normalized !== "random") {
    return normalized;
  }
  return RANDOM_WORLD_STARS[Math.floor(Math.random() * RANDOM_WORLD_STARS.length)];
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

function withRomanDuplicateSuffix(baseName, reserved) {
  const normalizedBase = String(baseName || "").trim() || "World";
  if (!reserved?.has(normalizedBase)) {
    reserved?.add(normalizedBase);
    return normalizedBase;
  }

  let duplicateIndex = 2;
  let candidate = `${normalizedBase} ${toRomanNumeral(duplicateIndex)}`;
  while (reserved?.has(candidate)) {
    duplicateIndex += 1;
    candidate = `${normalizedBase} ${toRomanNumeral(duplicateIndex)}`;
  }

  reserved?.add(candidate);
  return candidate;
}

export function generateAutomaticWorldName({ mode = "list", usedNames } = {}) {
  const normalizedMode = String(mode || "list")
    .trim()
    .toLowerCase();
  const reserved = usedNames instanceof Set ? usedNames : null;

  const buildCandidate = () => {
    if (normalizedMode === "phonotactic" || normalizedMode === "normalized") {
      return generatePhonotacticName({ style: normalizedMode, syllablesMin: 2, syllablesMax: 4 });
    }
    return WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)];
  };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = String(buildCandidate() || "").trim();
    if (!candidate) {
      continue;
    }
    return withRomanDuplicateSuffix(candidate, reserved);
  }

  const fallbackBase = String(buildCandidate() || "World").trim() || "World";
  return withRomanDuplicateSuffix(fallbackBase, reserved);
}

export function generateWorldProfile({
  worldName = "",
  starClass = "random",
  randomWorldName,
  isGasGiant = false,
  size = null,
  sizeCode = null,
  generateMoons: generateMoonsFlag = true,
  orbitNumber = null,
  hzco = null,
} = {}) {
  const resolvedStarClass = resolveWorldStarClass(starClass);
  const resolvedSizeCode = sizeCode ?? size ?? clamp(d6() - 2, 0, 10);
  const resolvedWorldName =
    String(worldName || "").trim() || (typeof randomWorldName === "function" ? randomWorldName() : "World");
  const generatedWorld = generateWorldPhysicalCharacteristicsWbh({
    baseWorld: {
      name: resolvedWorldName,
      size: resolvedSizeCode,
    },
    worldName: resolvedWorldName,
    starClass: resolvedStarClass,
    size: resolvedSizeCode,
    sizeCode: resolvedSizeCode,
    isGasGiant,
    orbitNumber,
    hzco,
    generateMoons: generateMoonsFlag,
    moonProfileFactory: ({ worldName: moonName, sizeCode: moonSizeCode }) =>
      generateWorldPhysicalCharacteristicsWbh({
        baseWorld: {
          name: moonName,
          size: moonSizeCode,
        },
        worldName: moonName,
        starClass: resolvedStarClass,
        sizeCode: moonSizeCode,
        orbitNumber,
        hzco,
        isMoon: true,
        generateMoons: false,
      }),
  });

  const atmosphereCode = Number(generatedWorld.atmosphereCode ?? 0);
  const hydrographics = Number(generatedWorld.hydrographics ?? 0);
  const worldSizeForUwp = Number(generatedWorld.size ?? resolvedSizeCode ?? 0);
  const socialOverlay = deriveSocialUwp({
    world: {
      ...generatedWorld,
      orbitNumber,
      hzco,
    },
    isMainworld: true,
  });
  const uwp = `${socialOverlay.starport}${toHex(worldSizeForUwp)}${toHex(atmosphereCode)}${toHex(hydrographics)}${toHex(socialOverlay.populationCode)}${toHex(socialOverlay.governmentCode)}${toHex(socialOverlay.lawLevel)}-${toHex(socialOverlay.techLevel)}`;
  const economics = {
    importance: socialOverlay.importance,
    resourceRating: socialOverlay.resourceRating,
    habitability: socialOverlay.habitability,
  };
  const remarks = buildWorldRemarks(generatedWorld, socialOverlay);

  return {
    ...generatedWorld,
    name: resolvedWorldName,
    uwp,
    size: generatedWorld.size ?? resolvedSizeCode,
    ...socialOverlay,
    economics,
    remarks,
  };
}

export function hasStoredWorldProfile(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  return ["uwp", "size", "atmosphereCode", "nativeSophontLife", "tradeCodes"].some((key) => record[key] !== undefined);
}

export function extractStoredWorldProfile(record) {
  if (!hasStoredWorldProfile(record)) {
    return null;
  }

  return WORLD_PROFILE_FIELDS.reduce((profile, key) => {
    if (record[key] !== undefined) {
      profile[key] = Array.isArray(record[key]) ? [...record[key]] : record[key];
    }
    return profile;
  }, {});
}

export function applyWorldProfileToPlanet(planet, worldProfile) {
  return {
    ...(planet && typeof planet === "object" ? planet : {}),
    ...(worldProfile && typeof worldProfile === "object" ? worldProfile : {}),
    tradeCodes: Array.isArray(worldProfile?.tradeCodes) ? [...worldProfile.tradeCodes] : [],
    remarks: Array.isArray(worldProfile?.remarks) ? [...worldProfile.remarks] : [],
    economics:
      worldProfile?.economics && typeof worldProfile.economics === "object" ? { ...worldProfile.economics } : undefined,
  };
}
