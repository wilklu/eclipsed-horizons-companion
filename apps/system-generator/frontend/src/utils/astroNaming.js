const STAR_GREEK_SUFFIXES = Object.freeze([
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
  "Sigma",
  "Tau",
  "Upsilon",
  "Phi",
  "Chi",
  "Psi",
  "Omega",
]);

const ROMAN_NUMERAL_TABLE = Object.freeze([
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
]);

function normalizePositiveInteger(value, fallback = 1) {
  const numeric = Math.trunc(Number(value));
  if (!Number.isFinite(numeric) || numeric < 1) {
    return fallback;
  }
  return numeric;
}

export function stripSystemSuffix(value = "") {
  return String(value || "")
    .trim()
    .replace(/\s+System$/i, "")
    .trim();
}

export function toRomanNumeral(value) {
  const numeric = normalizePositiveInteger(value, 0);
  if (!numeric) {
    return "";
  }

  let remaining = numeric;
  let numeral = "";
  for (const [arabic, roman] of ROMAN_NUMERAL_TABLE) {
    while (remaining >= arabic) {
      numeral += roman;
      remaining -= arabic;
    }
  }
  return numeral;
}

export function toLowerRomanNumeral(value) {
  return toRomanNumeral(value).toLowerCase();
}

export function toAlphabeticSequence(value, uppercase = false) {
  let numeric = normalizePositiveInteger(value, 1);
  let result = "";

  while (numeric > 0) {
    const remainder = (numeric - 1) % 26;
    result = String.fromCharCode(97 + remainder) + result;
    numeric = Math.floor((numeric - 1) / 26);
  }

  return uppercase ? result.toUpperCase() : result;
}

export function buildStarDesignation({ systemName = "", starIndex = 0, totalStars = 1 } = {}) {
  const baseName = stripSystemSuffix(systemName) || "System";
  if (Number(totalStars) <= 1) {
    return baseName;
  }

  const index = Math.max(0, Math.trunc(Number(starIndex) || 0));
  const greek = STAR_GREEK_SUFFIXES[index] || `Star-${index + 1}`;
  return `${baseName} ${greek}`.trim();
}

export function buildPlanetDesignation({ systemName = "", orbitIndex = 0, totalStars = 1, hostStarOrdinal = 1 } = {}) {
  const baseName = stripSystemSuffix(systemName) || "System";
  const orbitRoman = toRomanNumeral(Math.max(0, Number(orbitIndex)) + 1) || "I";

  if (Number(totalStars) <= 1) {
    return `${baseName} ${orbitRoman}`.trim();
  }

  const starGreek = STAR_GREEK_SUFFIXES[Math.max(1, normalizePositiveInteger(hostStarOrdinal, 1)) - 1] || "Alpha";
  return `${baseName} ${starGreek} ${orbitRoman}`.trim();
}

export function buildMoonDesignation(parentWorldName = "", ordinal = 1) {
  const parent = String(parentWorldName || "").trim() || "World";
  return `${parent}/${toAlphabeticSequence(ordinal, false)}`;
}

export function buildRingDesignation(parentWorldName = "", ordinal = 1) {
  const parent = String(parentWorldName || "").trim() || "World";
  return `${parent}/r${normalizePositiveInteger(ordinal, 1)}`;
}

export function buildBeltDesignation(ordinal = 1) {
  return toAlphabeticSequence(ordinal, true);
}

export function buildBeltObjectDesignation(beltName = "A", ordinal = 1) {
  const parent = String(beltName || "").trim() || "A";
  return `${parent}/${toLowerRomanNumeral(ordinal) || "i"}`;
}
