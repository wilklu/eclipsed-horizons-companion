import { generatePhonotacticName } from "./nameGenerator.js";

const ATMOSPHERE_TABLE = {
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
};

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
const STAR_TEMP_MOD = { O: +4, B: +3, A: +2, F: +1, G: 0, K: -1, M: -2 };
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHex(value) {
  if (value < 10) {
    return String(value);
  }
  return String.fromCharCode(65 + value - 10);
}

export function normalizeWorldStarClass(value) {
  const firstChar = String(value || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return STAR_TEMP_MOD[firstChar] !== undefined ? firstChar : "random";
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

function rollNativeSophontLife({ size, atmosphereCode, hydrographics, avgTempC }) {
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
  return d6() >= threshold;
}

export function generateWorldProfile({ worldName = "", starClass = "random", randomWorldName } = {}) {
  const resolvedStarClass = resolveWorldStarClass(starClass);
  const tempMod = STAR_TEMP_MOD[resolvedStarClass] ?? 0;

  const size = clamp(d6() - 2, 0, 10);
  const atmoRaw = clamp(d6() - 7 + size, 0, 15);
  const atmosphereCode = atmoRaw;
  const atmosphereDesc = ATMOSPHERE_TABLE[atmoRaw] ?? "Unusual";
  const hydrographics = atmoRaw === 0 || atmoRaw === 1 ? 0 : clamp(d6() - 7 + atmoRaw, 0, 10);

  const baseTemp = 15 + tempMod * 15 + (atmoRaw >= 6 ? 20 : 0) - hydrographics * 2;
  const avgTempC = Math.round(baseTemp);
  const tempCategory =
    avgTempC < -50
      ? "Frozen"
      : avgTempC < 0
        ? "Cold"
        : avgTempC < 30
          ? "Temperate"
          : avgTempC < 60
            ? "Hot"
            : "Scorching";

  const nativeSophontLife = rollNativeSophontLife({
    size,
    atmosphereCode,
    hydrographics,
    avgTempC,
  });

  const popCode = 0;
  const population = 0;
  const governmentCode = 0;
  const governmentDesc = GOVERNMENT_TABLE[governmentCode] ?? "Unknown";
  const lawLevel = 0;
  const lawDesc = LAW_TABLE[lawLevel] ?? "Unknown";
  const starportCode = "X";
  const techLevel = 0;

  const tradeCodes = [];
  if (atmoRaw >= 4 && atmoRaw <= 9 && hydrographics >= 4 && hydrographics <= 8 && popCode >= 5 && popCode <= 7) {
    tradeCodes.push("Ag");
  }
  if (size === 0 && atmoRaw === 0 && hydrographics === 0) tradeCodes.push("As");
  if (popCode === 0 && governmentCode === 0 && lawLevel === 0) tradeCodes.push("Ba");
  if (atmoRaw >= 2 && hydrographics === 0) tradeCodes.push("De");
  if (atmoRaw >= 10 && hydrographics >= 1) tradeCodes.push("Fl");
  if (size >= 6 && (atmoRaw === 5 || atmoRaw === 6 || atmoRaw === 8) && hydrographics >= 5) tradeCodes.push("Ga");
  if (popCode >= 9) tradeCodes.push("Hi");
  if (techLevel >= 12) tradeCodes.push("Ht");
  if (hydrographics >= 1 && hydrographics <= 5 && atmoRaw <= 3) tradeCodes.push("Ic");
  if ((atmoRaw <= 2 || atmoRaw === 4 || atmoRaw === 7 || atmoRaw === 9) && popCode >= 9) tradeCodes.push("In");
  if (popCode >= 1 && popCode <= 3) tradeCodes.push("Lo");
  if (techLevel <= 5) tradeCodes.push("Lt");
  if (atmoRaw <= 3 && hydrographics <= 3 && popCode >= 6) tradeCodes.push("Na");
  if (popCode >= 4 && popCode <= 6) tradeCodes.push("Ni");
  if (atmoRaw >= 2 && atmoRaw <= 5 && hydrographics <= 3) tradeCodes.push("Po");
  if ((atmoRaw === 6 || atmoRaw === 8) && popCode >= 6 && governmentCode >= 4 && governmentCode <= 9) {
    tradeCodes.push("Ri");
  }
  if (hydrographics >= 10) tradeCodes.push("Wa");
  if (atmoRaw === 0) tradeCodes.push("Va");

  const diameterKm = size === 0 ? 800 : size * 1600;
  const gravity = +(size * 0.1 + 0.05).toFixed(2);
  const uwp = `${starportCode}${toHex(size)}${toHex(atmosphereCode)}${toHex(hydrographics)}${toHex(popCode)}${toHex(governmentCode)}${toHex(lawLevel)}-${toHex(techLevel)}`;
  const resolvedWorldName =
    String(worldName || "").trim() || (typeof randomWorldName === "function" ? randomWorldName() : "World");

  return {
    name: resolvedWorldName,
    uwp,
    size,
    diameterKm,
    gravity,
    atmosphereCode,
    atmosphereDesc,
    hydrographics,
    avgTempC,
    tempCategory,
    orbitalPeriodDays: Math.round(200 + Math.random() * 1200),
    dayLengthHours: +(15 + Math.random() * 50).toFixed(1),
    axialTilt: Math.round(Math.random() * 40),
    moons: Math.floor(Math.random() * 4),
    magnetosphere: Math.random() < 0.5 ? "Present" : "Absent",
    nativeSophontLife,
    populationCode: popCode,
    population,
    governmentCode,
    governmentDesc,
    lawLevel,
    lawDesc,
    techLevel,
    techDesc: TECH_TABLE[techLevel] ?? "Unknown",
    starport: starportCode,
    starportDesc: STARPORT_TABLE[starportCode] ?? "Unknown",
    tradeCodes,
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
  };
}
