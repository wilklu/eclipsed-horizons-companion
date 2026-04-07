import { generatePrimaryStarHeuristic } from "../primaryStarGeneratorHeuristic.js";

import { createRandomRoller, rollDice } from "./dice.js";
export const STAR_WBH_RULES = Object.freeze([
  {
    id: "primary-star-types",
    section: "Chapter 3 > Primary Star > Primary Star Types",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-subtypes",
    section: "Chapter 3 > Primary Star > Subtypes",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-mass-temperature",
    section: "Chapter 3 > Star Mass and Temperature",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-diameter-luminosity",
    section: "Chapter 3 > Star Diameter and Star Luminosity",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "system-age",
    section: "Chapter 3 > System Age",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "multiple-stars",
    section: "Chapter 3 > Systems With Multiple Stars",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
]);

const SPECTRAL_SEQUENCE = ["O", "B", "A", "F", "G", "K", "M"];
const HOT_TABLE = Object.freeze({
  2: "A",
  3: "A",
  4: "A",
  5: "A",
  6: "A",
  7: "A",
  8: "A",
  9: "A",
  10: "B",
  11: "B",
  12: "O",
});
const TYPE_TABLE = Object.freeze({
  2: "Special",
  3: "M",
  4: "M",
  5: "M",
  6: "M",
  7: "K",
  8: "K",
  9: "G",
  10: "G",
  11: "F",
  12: "Hot",
});
const SPECIAL_TABLE = Object.freeze({
  2: "Unusual",
  3: "Class VI",
  4: "Class VI",
  5: "Class VI",
  6: "Class IV",
  7: "Class IV",
  8: "Class IV",
  9: "Class III",
  10: "Class III",
  11: "Giants",
  12: "Giants",
});
const UNUSUAL_TABLE = Object.freeze({
  2: "Peculiar",
  3: "Class VI",
  4: "Class IV",
  5: "BD",
  6: "BD",
  7: "BD",
  8: "D",
  9: "D",
  10: "D",
  11: "Class III",
  12: "Giants",
});
const GIANTS_TABLE = Object.freeze({
  2: "Class III",
  3: "Class III",
  4: "Class III",
  5: "Class III",
  6: "Class III",
  7: "Class III",
  8: "Class III",
  9: "Class II",
  10: "Class II",
  11: "Class Ib",
  12: "Class Ia",
});
const PECULIAR_TABLE = Object.freeze({
  2: "Black Hole",
  3: "Pulsar",
  4: "Neutron Star",
  5: "Nebula",
  6: "Nebula",
  7: "Protostar",
  8: "Protostar",
  9: "Protostar",
  10: "Star Cluster",
  11: "Anomaly",
  12: "Anomaly",
});
const SUBTYPE_NUMERIC_TABLE = Object.freeze({ 2: 0, 3: 1, 4: 3, 5: 5, 6: 7, 7: 9, 8: 8, 9: 6, 10: 4, 11: 2, 12: 0 });
const SUBTYPE_M_PRIMARY_TABLE = Object.freeze({ 2: 8, 3: 6, 4: 5, 5: 4, 6: 0, 7: 2, 8: 1, 9: 3, 10: 5, 11: 7, 12: 9 });
const LUMINOSITY_CLASS_MAP = Object.freeze({
  "Class Ia": "Ia",
  "Class Ib": "Ib",
  "Class II": "II",
  "Class III": "III",
  "Class IV": "IV",
  "Class V": "V",
  "Class VI": "VI",
});
const STELLAR_OBJECT_CODES = Object.freeze({
  "Black Hole": "BH",
  Pulsar: "PSR",
  "Neutron Star": "NS",
  Nebula: "NB",
  Protostar: "Proto",
  "Star Cluster": "Cluster",
  Anomaly: "Anomaly",
  BD: "BD",
  D: "D",
});
const MASS_TABLE = Object.freeze({
  O: {
    Ia: { 0: 200, 5: 80 },
    Ib: { 0: 150, 5: 60 },
    II: { 0: 130, 5: 40 },
    III: { 0: 110, 5: 30 },
    V: { 0: 90, 5: 60 },
    VI: { 0: 2, 5: 1.5 },
  },
  B: {
    Ia: { 0: 60, 5: 30 },
    Ib: { 0: 40, 5: 25 },
    II: { 0: 30, 5: 20 },
    III: { 0: 20, 5: 10 },
    IV: { 0: 20, 5: 10 },
    V: { 0: 18, 5: 5 },
    VI: { 0: 0.5, 5: 0.4 },
  },
  A: {
    Ia: { 0: 20, 5: 15 },
    Ib: { 0: 15, 5: 13 },
    II: { 0: 14, 5: 11 },
    III: { 0: 8, 5: 6 },
    IV: { 0: 4, 5: 2.3 },
    V: { 0: 2.2, 5: 1.8 },
  },
  F: {
    Ia: { 0: 13, 5: 12 },
    Ib: { 0: 12, 5: 10 },
    II: { 0: 10, 5: 8 },
    III: { 0: 4, 5: 3 },
    IV: { 0: 2, 5: 1.5 },
    V: { 0: 1.5, 5: 1.3 },
  },
  G: {
    Ia: { 0: 12, 5: 13 },
    Ib: { 0: 10, 5: 11 },
    II: { 0: 8, 5: 10 },
    III: { 0: 2.5, 5: 2.4 },
    IV: { 0: 1.7, 5: 1.2 },
    V: { 0: 1.1, 5: 0.9 },
    VI: { 0: 0.8, 5: 0.7 },
  },
  K: {
    Ia: { 0: 14, 5: 18 },
    Ib: { 0: 12, 5: 13 },
    II: { 0: 10, 5: 12 },
    III: { 0: 1.1, 5: 1.5 },
    IV: { 0: 1.5, 5: null },
    V: { 0: 0.8, 5: 0.7 },
    VI: { 0: 0.6, 5: 0.5 },
  },
  M: {
    Ia: { 0: 20, 5: 25, 9: 30 },
    Ib: { 0: 15, 5: 20, 9: 25 },
    II: { 0: 14, 5: 16, 9: 18 },
    III: { 0: 1.8, 5: 2.4, 9: 8 },
    V: { 0: 0.5, 5: 0.16, 9: 0.08 },
    VI: { 0: 0.4, 5: 0.12, 9: 0.075 },
  },
});
const TEMPERATURE_TABLE = Object.freeze({
  O: { 0: 50000, 5: 40000 },
  B: { 0: 30000, 5: 15000 },
  A: { 0: 10000, 5: 8000 },
  F: { 0: 7500, 5: 6500 },
  G: { 0: 6000, 5: 5600 },
  K: { 0: 5200, 5: 4400 },
  M: { 0: 3700, 5: 3000, 9: 2400 },
});
const DIAMETER_TABLE = Object.freeze({
  O: {
    Ia: { 0: 25, 5: 22 },
    Ib: { 0: 24, 5: 20 },
    II: { 0: 22, 5: 18 },
    III: { 0: 21, 5: 15 },
    V: { 0: 20, 5: 12 },
    VI: { 0: 0.18, 5: 0.18 },
  },
  B: {
    Ia: { 0: 20, 5: 60 },
    Ib: { 0: 14, 5: 25 },
    II: { 0: 12, 5: 14 },
    III: { 0: 10, 5: 6 },
    IV: { 0: 8, 5: 5 },
    V: { 0: 7, 5: 3.5 },
    VI: { 0: 0.2, 5: 0.5 },
  },
  A: {
    Ia: { 0: 120, 5: 180 },
    Ib: { 0: 50, 5: 75 },
    II: { 0: 30, 5: 45 },
    III: { 0: 5, 5: 5 },
    IV: { 0: 4, 5: 3 },
    V: { 0: 2.2, 5: 2 },
  },
  F: {
    Ia: { 0: 210, 5: 280 },
    Ib: { 0: 85, 5: 115 },
    II: { 0: 50, 5: 66 },
    III: { 0: 5, 5: 5 },
    IV: { 0: 3, 5: 2 },
    V: { 0: 1.7, 5: 1.5 },
  },
  G: {
    Ia: { 0: 330, 5: 360 },
    Ib: { 0: 135, 5: 150 },
    II: { 0: 77, 5: 90 },
    III: { 0: 10, 5: 15 },
    IV: { 0: 3, 5: 4 },
    V: { 0: 1.1, 5: 0.95 },
    VI: { 0: 0.8, 5: 0.7 },
  },
  K: {
    Ia: { 0: 420, 5: 600 },
    Ib: { 0: 180, 5: 260 },
    II: { 0: 110, 5: 160 },
    III: { 0: 20, 5: 40 },
    IV: { 0: 6, 5: null },
    V: { 0: 0.9, 5: 0.8 },
    VI: { 0: 0.6, 5: 0.5 },
  },
  M: {
    Ia: { 0: 900, 5: 1200, 9: 1800 },
    Ib: { 0: 380, 5: 600, 9: 800 },
    II: { 0: 230, 5: 350, 9: 500 },
    III: { 0: 60, 5: 100, 9: 200 },
    V: { 0: 0.7, 5: 0.2, 9: 0.1 },
    VI: { 0: 0.4, 5: 0.1, 9: 0.08 },
  },
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLuminosityClass(value) {
  const normalized = String(value || "").trim();
  if (LUMINOSITY_CLASS_MAP[normalized]) {
    return LUMINOSITY_CLASS_MAP[normalized];
  }
  return normalized || "V";
}

function normalizeSpectralType(value) {
  return String(value || "")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function normalizeRoll2d(total) {
  return clamp(Math.round(Number(total) || 2), 2, 12);
}

function interpolateSubtypeValue(points, subtype) {
  const keys = Object.keys(points)
    .map(Number)
    .filter((key) => Number.isFinite(points[key]))
    .sort((left, right) => left - right);

  if (!keys.length) {
    return null;
  }

  if (points[subtype] !== undefined && Number.isFinite(points[subtype])) {
    return points[subtype];
  }

  const lowerKey = [...keys].reverse().find((key) => key <= subtype) ?? keys[0];
  const upperKey = keys.find((key) => key >= subtype) ?? keys[keys.length - 1];
  const lowerValue = points[lowerKey];
  const upperValue = points[upperKey];

  if (lowerKey === upperKey) {
    return lowerValue;
  }

  const ratio = (subtype - lowerKey) / (upperKey - lowerKey);
  return lowerValue + (upperValue - lowerValue) * ratio;
}

function interpolateStarProperty(table, spectralType, luminosityClass, subtype) {
  const normalizedType = normalizeSpectralType(spectralType);
  const normalizedClass = normalizeLuminosityClass(luminosityClass);
  const points = table[normalizedType]?.[normalizedClass] ?? table[normalizedType];

  if (!points) {
    return null;
  }

  if (normalizedType !== "M" && subtype > 5) {
    const nextType = getCoolerSpectralType(normalizedType);
    const nextPoints = table[nextType]?.[normalizedClass] ?? table[nextType];
    const currentValue = points[5];
    const nextValue = nextPoints?.[0];

    if (Number.isFinite(currentValue) && Number.isFinite(nextValue)) {
      const ratio = (subtype - 5) / 5;
      return currentValue + (nextValue - currentValue) * ratio;
    }
  }

  return interpolateSubtypeValue(points, subtype);
}

function getCoolerSpectralType(type) {
  const index = SPECTRAL_SEQUENCE.indexOf(type);
  if (index === -1 || index === SPECTRAL_SEQUENCE.length - 1) {
    return "M";
  }
  return SPECTRAL_SEQUENCE[index + 1];
}

function applyTypeConstraints(type, luminosityClass) {
  if (luminosityClass === "IV") {
    if (type === "M") {
      return "K";
    }
    if (type === "O") {
      return "B";
    }
  }

  if (luminosityClass === "VI") {
    if (type === "F") {
      return "G";
    }
    if (type === "A") {
      return "B";
    }
  }

  return type;
}

function roll2d(rollDie) {
  return rollDice(rollDie, 2, 6);
}

function rollD3(rollDie) {
  return Math.ceil(rollDie(6) / 2);
}

function getPrimaryPresenceDm(star) {
  const luminosityClass = String(star?.luminosityClass || "V").trim();
  const baseType = String(star?.baseSpectralType || star?.designation || star?.spectralClass || "G")
    .charAt(0)
    .toUpperCase();
  const objectType = String(star?.objectType || star?.designation || "").toUpperCase();

  if (["IA", "IB", "II", "III", "IV"].includes(luminosityClass.toUpperCase())) {
    return 1;
  }
  if (["V", "VI"].includes(luminosityClass.toUpperCase()) && ["O", "B", "A", "F"].includes(baseType)) {
    return 1;
  }
  if (["V", "VI"].includes(luminosityClass.toUpperCase()) && baseType === "M") {
    return -1;
  }
  if (objectType.includes("BD") || objectType.includes(" D")) {
    return -1;
  }
  if (["PSR", "PULSAR", "NS", "BLACK HOLE", "BH"].some((token) => objectType.includes(token))) {
    return -1;
  }

  return 0;
}

function getNonPrimaryColumnRoll({ rollTotal, column, parentLuminosityClass }) {
  const adjustedRoll = rollTotal + (["III", "IV"].includes(String(parentLuminosityClass || "").trim()) ? -1 : 0);
  const normalizedColumn = String(column || "secondary").toLowerCase();

  if (normalizedColumn === "other") {
    if (adjustedRoll <= 2) return "NS";
    if (adjustedRoll <= 7) return "D";
    return "BD";
  }

  if (normalizedColumn === "post-stellar") {
    if (adjustedRoll <= 5) return "Random";
    if (adjustedRoll <= 8) return "Random";
    if (adjustedRoll <= 10) return "Lesser";
    return "Twin";
  }

  if (adjustedRoll <= 3) return "Other";
  if (adjustedRoll <= 5) return "Random";
  if (adjustedRoll <= 8) return normalizedColumn === "companion" ? "Lesser" : adjustedRoll === 8 ? "Sibling" : "Lesser";
  if (adjustedRoll === 9) return "Sibling";
  if (adjustedRoll >= 10) return normalizedColumn === "secondary" && adjustedRoll === 10 ? "Sibling" : "Twin";
  return "Twin";
}

function parseParentDescriptor(parentStar) {
  const baseSpectralType = String(
    parentStar?.baseSpectralType || parentStar?.designation || parentStar?.spectralClass || "G",
  )
    .trim()
    .charAt(0)
    .toUpperCase();
  const subtype = Number.isInteger(parentStar?.subtype)
    ? parentStar.subtype
    : Number(String(parentStar?.designation || "").match(/(\d)/)?.[1] ?? 0);
  const luminosityClass = String(
    parentStar?.luminosityClass || String(parentStar?.designation || "").match(/Ia|Ib|II|III|IV|V|VI/i)?.[0] || "V",
  ).trim();

  return {
    spectralType: baseSpectralType,
    subtype: clamp(subtype, 0, 9),
    luminosityClass,
  };
}

function createDerivedDescriptor(parentStar, relation, rollDie) {
  const parent = parseParentDescriptor(parentStar);

  if (relation === "Twin") {
    return parent;
  }

  if (relation === "Sibling") {
    let spectralType = parent.spectralType;
    let subtype = parent.subtype + rollDie(6);

    while (subtype > 9) {
      subtype -= 10;
      spectralType = getCoolerSpectralType(spectralType);
    }

    return {
      spectralType,
      subtype: clamp(subtype, 0, spectralType === "M" ? 9 : 9),
      luminosityClass: parent.luminosityClass,
    };
  }

  if (relation === "Lesser") {
    const spectralType = getCoolerSpectralType(parent.spectralType);
    if (parent.spectralType === "M") {
      const subtype = clamp(parent.subtype + rollDie(6), 0, 9);
      if (subtype > parent.subtype) {
        return { objectType: "BD" };
      }
      return { spectralType: "M", subtype, luminosityClass: parent.luminosityClass };
    }

    return {
      spectralType,
      subtype: clamp(roll2d(rollDie) - 2, 0, spectralType === "M" ? 9 : 9),
      luminosityClass: parent.luminosityClass === "IV" && spectralType === "M" ? "V" : parent.luminosityClass,
    };
  }

  if (relation === "Random") {
    const randomStar = generatePrimaryStarWbh({ rollDie });
    const randomDescriptor = parseParentDescriptor(randomStar);
    if (SPECTRAL_SEQUENCE.indexOf(randomDescriptor.spectralType) < SPECTRAL_SEQUENCE.indexOf(parent.spectralType)) {
      return createDerivedDescriptor(parentStar, "Lesser", rollDie);
    }
    return randomDescriptor;
  }

  const otherRoll = getNonPrimaryColumnRoll({
    rollTotal: roll2d(rollDie),
    column: "other",
    parentLuminosityClass: parent.luminosityClass,
  });
  return { objectType: otherRoll };
}

function createNonPrimaryStar({ parentStar, orbitType, relation, rollDie }) {
  const descriptor = createDerivedDescriptor(parentStar, relation, rollDie);

  if (descriptor.objectType) {
    const fallbackStar = generatePrimaryStarHeuristic({ spectralType: "G" });
    return {
      ...fallbackStar,
      designation: descriptor.objectType,
      spectralType: descriptor.objectType,
      spectralClass: descriptor.objectType,
      persistedSpectralClass: descriptor.objectType,
      luminosityClass: null,
      luminosity: null,
      mass: null,
      massInSolarMasses: null,
      temperature: null,
      temperatureK: null,
      objectType: descriptor.objectType,
      generatorModel: "wbh-primary-star",
      wbhStatus: "non-stellar-object",
      wbhCoverage: STAR_WBH_RULES,
      orbitType,
      isAnomaly: ["NS", "PSR", "BH"].includes(String(descriptor.objectType || "").toUpperCase()),
    };
  }

  return generatePrimaryStarWbh({
    spectralType: descriptor.spectralType,
    luminosityClass: descriptor.luminosityClass,
    decimal: descriptor.subtype,
    rollDie,
  });
}

function rollStellarOrbitNumber(orbitType, parentStar, rollDie) {
  const normalizedType = String(orbitType || "Near").toLowerCase();
  if (normalizedType === "companion") {
    if (["Ia", "Ib", "II", "III"].includes(String(parentStar?.luminosityClass || "").trim())) {
      return Number((rollDie(6) * Math.max(0.01, Number(parentStar?.diameter || 0.1) * 0.01)).toFixed(2));
    }
    return Number((rollDie(10) / 10 + (roll2d(rollDie) - 7) / 100).toFixed(2));
  }

  if (normalizedType === "close") {
    const base = Math.max(0.5, rollDie(6) - 1);
    return Number((base + rollDie(10) / 20).toFixed(2));
  }
  if (normalizedType === "near") {
    return Number((rollDie(6) + 5 + rollDie(10) / 20).toFixed(2));
  }
  return Number((rollDie(6) + 11 + rollDie(10) / 20).toFixed(2));
}

function rollStellarEccentricity(rollDie) {
  const firstRoll = roll2d(rollDie) + 2;
  if (firstRoll <= 5) return 0;
  if (firstRoll <= 7) return Number((rollDie(6) / 200).toFixed(3));
  if (firstRoll <= 9) return Number((0.03 + rollDie(6) / 100).toFixed(3));
  if (firstRoll === 10) return Number((0.05 + rollDie(6) / 20).toFixed(3));
  if (firstRoll === 11) return Number((0.05 + rollDice(rollDie, 2, 6) / 20).toFixed(3));
  return Number((0.3 + rollDice(rollDie, 2, 6) / 20).toFixed(3));
}

function buildStarKey(index) {
  return `star-${index}`;
}

function resolveCompanionParent(stars = [], rollDie = createRandomRoller()) {
  const nonPrimaryHosts = stars.filter(
    (star, index) => index > 0 && String(star?.orbitType || "").toLowerCase() !== "companion",
  );
  if (!nonPrimaryHosts.length) {
    return stars[0] ?? null;
  }
  if (nonPrimaryHosts.length === 1) {
    return roll2d(rollDie) >= 9 ? nonPrimaryHosts[0] : stars[0];
  }
  return roll2d(rollDie) >= 8 ? nonPrimaryHosts[nonPrimaryHosts.length - 1] : stars[0];
}

export function generateMultipleStarSystemWbh(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const primary = generatePrimaryStarWbh(params);
  const presenceDm = getPrimaryPresenceDm(primary);
  const maxStars = clamp(Number(params.maxStars || 3), 1, 8);
  const orbitChecks = ["Close", "Near", "Far", "Companion"];
  const stars = [
    {
      ...primary,
      starKey: buildStarKey(0),
      parentStarKey: null,
      hierarchyLevel: 0,
      orbitType: null,
      orbitNumber: null,
      eccentricity: 0,
    },
  ];

  for (const orbitType of orbitChecks) {
    if (stars.length >= maxStars) {
      break;
    }
    if (orbitType === "Close" && ["Ia", "Ib", "II", "III"].includes(String(primary?.luminosityClass || "").trim())) {
      continue;
    }

    const present = roll2d(rollDie) + presenceDm >= 10;
    if (!present) {
      continue;
    }

    const relation = getNonPrimaryColumnRoll({
      rollTotal: roll2d(rollDie),
      column: orbitType === "Companion" ? "companion" : "secondary",
      parentLuminosityClass: primary?.luminosityClass,
    });
    const hostStar = orbitType === "Companion" ? resolveCompanionParent(stars, rollDie) : primary;
    const derived = createNonPrimaryStar({ parentStar: hostStar, orbitType, relation, rollDie });
    const parentStarKey = hostStar?.starKey ?? stars[0]?.starKey ?? null;
    stars.push({
      ...derived,
      starKey: buildStarKey(stars.length),
      parentStarKey,
      hierarchyLevel:
        orbitType === "Companion" && parentStarKey !== stars[0]?.starKey ? 2 : orbitType === "Companion" ? 1 : 1,
      continuationOf: orbitType === "Companion" && parentStarKey !== stars[0]?.starKey ? parentStarKey : null,
      orbitType,
      orbitNumber: rollStellarOrbitNumber(orbitType, hostStar, rollDie),
      eccentricity: rollStellarEccentricity(rollDie),
    });
  }

  return stars;
}

export function resolvePrimaryStarType({ rollDie = createRandomRoller() } = {}) {
  const firstRoll = roll2d(rollDie);
  const primaryType = TYPE_TABLE[firstRoll];

  if (primaryType === "Hot") {
    const hotRoll = roll2d(rollDie);
    return {
      kind: "stellar",
      spectralType: HOT_TABLE[hotRoll],
      luminosityClass: "V",
      source: { firstRoll, hotRoll },
    };
  }

  if (primaryType !== "Special") {
    return {
      kind: "stellar",
      spectralType: primaryType,
      luminosityClass: "V",
      source: { firstRoll },
    };
  }

  const specialRoll = roll2d(rollDie);
  const specialResult = SPECIAL_TABLE[specialRoll];

  if (specialResult === "Unusual") {
    const unusualRoll = roll2d(rollDie);
    const unusualResult = UNUSUAL_TABLE[unusualRoll];

    if (unusualResult === "Peculiar") {
      const peculiarRoll = roll2d(rollDie);
      const peculiarResult = PECULIAR_TABLE[peculiarRoll];
      return {
        kind: "peculiar",
        objectType: peculiarResult,
        spectralType: STELLAR_OBJECT_CODES[peculiarResult] || peculiarResult,
        luminosityClass: null,
        source: { firstRoll, specialRoll, unusualRoll, peculiarRoll },
      };
    }

    if (unusualResult === "BD" || unusualResult === "D") {
      return {
        kind: "unusual",
        objectType: unusualResult,
        spectralType: unusualResult,
        luminosityClass: null,
        source: { firstRoll, specialRoll, unusualRoll },
      };
    }

    const luminosityClass =
      unusualResult === "Giants"
        ? LUMINOSITY_CLASS_MAP[GIANTS_TABLE[roll2d(rollDie)]]
        : LUMINOSITY_CLASS_MAP[unusualResult];
    const rawTypeRoll = roll2d(rollDie) + 1;
    const typeRoll = clamp(rawTypeRoll, 2, 12);
    const typeResult = TYPE_TABLE[typeRoll] === "Hot" ? HOT_TABLE[roll2d(rollDie)] : TYPE_TABLE[typeRoll];

    return {
      kind: "stellar",
      spectralType: applyTypeConstraints(typeResult, luminosityClass),
      luminosityClass,
      source: { firstRoll, specialRoll, unusualRoll, typeRoll },
    };
  }

  if (specialResult === "Giants") {
    const giantsRoll = roll2d(rollDie);
    const luminosityClass = LUMINOSITY_CLASS_MAP[GIANTS_TABLE[giantsRoll]];
    const rawTypeRoll = roll2d(rollDie) + 1;
    const typeRoll = clamp(rawTypeRoll, 2, 12);
    const typeResult = TYPE_TABLE[typeRoll] === "Hot" ? HOT_TABLE[roll2d(rollDie)] : TYPE_TABLE[typeRoll];

    return {
      kind: "stellar",
      spectralType: applyTypeConstraints(typeResult, luminosityClass),
      luminosityClass,
      source: { firstRoll, specialRoll, giantsRoll, typeRoll },
    };
  }

  const luminosityClass = LUMINOSITY_CLASS_MAP[specialResult];
  const rawTypeRoll = roll2d(rollDie) + 1;
  const typeRoll = clamp(rawTypeRoll, 2, 12);
  const typeResult = TYPE_TABLE[typeRoll] === "Hot" ? HOT_TABLE[roll2d(rollDie)] : TYPE_TABLE[typeRoll];

  return {
    kind: "stellar",
    spectralType: applyTypeConstraints(typeResult, luminosityClass),
    luminosityClass,
    source: { firstRoll, specialRoll, typeRoll },
  };
}

export function resolveStarSubtype({
  spectralType,
  luminosityClass = "V",
  isPrimary = true,
  rollDie = createRandomRoller(),
} = {}) {
  const normalizedType = normalizeSpectralType(spectralType);
  const normalizedClass = normalizeLuminosityClass(luminosityClass);
  const subtypeRoll = roll2d(rollDie);
  const subtype =
    normalizedType === "M" && isPrimary ? SUBTYPE_M_PRIMARY_TABLE[subtypeRoll] : SUBTYPE_NUMERIC_TABLE[subtypeRoll];

  if (normalizedType === "K" && normalizedClass === "IV" && subtype > 4) {
    return subtype - 5;
  }

  return subtype;
}

export function getWbhStarMassAndTemperature({ spectralType, luminosityClass = "V", subtype = 0 } = {}) {
  const normalizedType = normalizeSpectralType(spectralType);
  const normalizedClass = normalizeLuminosityClass(luminosityClass);
  const massPoints = MASS_TABLE[normalizedType]?.[normalizedClass];
  const temperaturePoints = TEMPERATURE_TABLE[normalizedType];

  if (!massPoints || !temperaturePoints) {
    return { mass: null, temperature: null };
  }

  return {
    mass: interpolateStarProperty(MASS_TABLE, normalizedType, normalizedClass, clamp(subtype, 0, 9)),
    temperature: interpolateStarProperty(TEMPERATURE_TABLE, normalizedType, normalizedClass, clamp(subtype, 0, 9)),
  };
}

export function getWbhStarDiameter({ spectralType, luminosityClass = "V", subtype = 0 } = {}) {
  const normalizedType = normalizeSpectralType(spectralType);
  const normalizedClass = normalizeLuminosityClass(luminosityClass);
  const diameterPoints = DIAMETER_TABLE[normalizedType]?.[normalizedClass];
  if (!diameterPoints) {
    return null;
  }

  return interpolateStarProperty(DIAMETER_TABLE, normalizedType, normalizedClass, clamp(subtype, 0, 9));
}

export function calculateSmallStarAge({ firstDie, secondDie, detailDie = null }) {
  const age = firstDie * 2 + (secondDie - 2) + (detailDie === null ? 0 : detailDie / 10 - 1);
  return Math.max(0.01, age);
}

export function calculateLargeStarAge({ mainSequenceLifespan, percentileRoll }) {
  return mainSequenceLifespan * (percentileRoll / 100);
}

export function calculateStarFinalAge(mass) {
  const safeMass = Number(mass);
  if (!(safeMass > 0)) {
    throw new RangeError("Mass must be a positive number");
  }

  return (10 / safeMass ** 2.5) * (1 + 1 / (4 + safeMass) + 1 / (10 * safeMass ** 3));
}

export function calculateWbhLuminosity({ diameter, temperature, solarTemperature = 5772 }) {
  const safeDiameter = Number(diameter);
  const safeTemperature = Number(temperature);

  if (!(safeDiameter > 0) || !(safeTemperature > 0) || !(solarTemperature > 0)) {
    throw new RangeError("Diameter and temperature must be positive numbers");
  }

  return safeDiameter ** 2 * (safeTemperature / solarTemperature) ** 4;
}

export function calculateMainSequenceLifespan(mass) {
  const safeMass = Number(mass);
  if (!(safeMass > 0)) {
    throw new RangeError("Mass must be a positive number");
  }

  return 10 / safeMass ** 2.5;
}

export function calculateSubgiantLifespan({ mainSequenceLifespan, mass }) {
  const safeMainSequenceLifespan = Number(mainSequenceLifespan);
  const safeMass = Number(mass);

  if (!(safeMainSequenceLifespan > 0) || !(safeMass > 0)) {
    throw new RangeError("Main sequence lifespan and mass must be positive numbers");
  }

  return safeMainSequenceLifespan / (4 + safeMass);
}

export function calculateGiantLifespan({ mainSequenceLifespan, mass }) {
  const safeMainSequenceLifespan = Number(mainSequenceLifespan);
  const safeMass = Number(mass);

  if (!(safeMainSequenceLifespan > 0) || !(safeMass > 0)) {
    throw new RangeError("Main sequence lifespan and mass must be positive numbers");
  }

  return safeMainSequenceLifespan / (10 * safeMass ** 3);
}

export function generatePrimaryStarWbh(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const explicitType = normalizeSpectralType(params.spectralType || params.designation);
  const explicitClass = normalizeLuminosityClass(params.luminosityClass);

  const resolvedType = explicitType
    ? { kind: "stellar", spectralType: explicitType, luminosityClass: explicitClass || "V", source: { explicit: true } }
    : resolvePrimaryStarType({ rollDie });

  if (resolvedType.kind !== "stellar") {
    const fallbackStar = generatePrimaryStarHeuristic(params);
    return {
      ...fallbackStar,
      designation: resolvedType.spectralType,
      spectralType: resolvedType.spectralType,
      spectralClass: resolvedType.spectralType,
      persistedSpectralClass: resolvedType.spectralType,
      luminosityClass: resolvedType.luminosityClass,
      luminosity: null,
      mass: null,
      massInSolarMasses: null,
      temperature: null,
      temperatureK: null,
      objectType: resolvedType.objectType,
      generatorModel: "wbh-primary-star",
      wbhStatus: "non-stellar-object",
      wbhCoverage: STAR_WBH_RULES,
      wbhSource: resolvedType.source,
    };
  }

  const subtype = Number.isInteger(params.decimal)
    ? clamp(params.decimal, 0, resolvedType.spectralType === "M" ? 9 : 9)
    : resolveStarSubtype({
        spectralType: resolvedType.spectralType,
        luminosityClass: resolvedType.luminosityClass,
        isPrimary: true,
        rollDie,
      });
  const { mass, temperature } = getWbhStarMassAndTemperature({
    spectralType: resolvedType.spectralType,
    luminosityClass: resolvedType.luminosityClass,
    subtype,
  });
  const diameter = getWbhStarDiameter({
    spectralType: resolvedType.spectralType,
    luminosityClass: resolvedType.luminosityClass,
    subtype,
  });
  const luminosity = mass && temperature && diameter ? calculateWbhLuminosity({ diameter, temperature }) : null;
  const mainSequenceLifespan = mass ? calculateMainSequenceLifespan(mass) : null;
  const age = mainSequenceLifespan
    ? mass < 0.9
      ? calculateSmallStarAge({ firstDie: rollDie(6), secondDie: Math.ceil(rollDie(6) / 2), detailDie: rollDie(10) })
      : calculateLargeStarAge({ mainSequenceLifespan, percentileRoll: rollDie(10) * 10 + rollDie(10) })
    : null;
  const designation = `${resolvedType.spectralType}${subtype}${resolvedType.luminosityClass}`;

  return {
    id: Math.random().toString(36).slice(2, 11),
    designation,
    spectralType: designation,
    spectralClass: designation,
    persistedSpectralClass: designation,
    baseSpectralType: resolvedType.spectralType,
    subtype,
    luminosityClass: resolvedType.luminosityClass,
    luminosity,
    mass,
    massInSolarMasses: mass,
    diameter,
    temperature,
    temperatureK: temperature,
    orbitType: null,
    isAnomaly: false,
    generatorModel: "wbh-primary-star",
    wbhStatus: "implemented-core-tables",
    wbhCoverage: STAR_WBH_RULES,
    systemAge: age,
    mainSequenceLifespan,
    wbhSource: resolvedType.source,
  };
}
