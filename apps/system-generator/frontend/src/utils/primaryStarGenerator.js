const PRIMARY_STAR_ROWS = [
  {
    min: Number.NEGATIVE_INFINITY,
    max: 2,
    type: "Special",
    hot: "A",
    special: "Unusual",
    unusual: "Peculiar",
    giants: "Class III",
    peculiar: "Black Hole",
  },
  {
    min: 3,
    max: 3,
    type: "M",
    hot: "A",
    special: "Class VI",
    unusual: "Class VI",
    giants: "Class III",
    peculiar: "Pulsar",
  },
  {
    min: 4,
    max: 4,
    type: "M",
    hot: "A",
    special: "Class VI",
    unusual: "Class IV",
    giants: "Class III",
    peculiar: "Neutron Star",
  },
  {
    min: 5,
    max: 5,
    type: "M",
    hot: "A",
    special: "Class VI",
    unusual: "BD",
    giants: "Class III",
    peculiar: "Nebula",
  },
  {
    min: 6,
    max: 6,
    type: "M",
    hot: "A",
    special: "Class IV",
    unusual: "BD",
    giants: "Class III",
    peculiar: "Nebula",
  },
  {
    min: 7,
    max: 7,
    type: "K",
    hot: "A",
    special: "Class IV",
    unusual: "BD",
    giants: "Class III",
    peculiar: "Protostar",
  },
  {
    min: 8,
    max: 8,
    type: "K",
    hot: "A",
    special: "Class IV",
    unusual: "D",
    giants: "Class III",
    peculiar: "Protostar",
  },
  {
    min: 9,
    max: 9,
    type: "G",
    hot: "A",
    special: "Class III",
    unusual: "D",
    giants: "Class II",
    peculiar: "Protostar",
  },
  {
    min: 10,
    max: 10,
    type: "G",
    hot: "B",
    special: "Class III",
    unusual: "D",
    giants: "Class II",
    peculiar: "Star Cluster",
  },
  {
    min: 11,
    max: 11,
    type: "F",
    hot: "B",
    special: "Giants",
    unusual: "Class III",
    giants: "Class Ib",
    peculiar: "Anomaly",
  },
  {
    min: 12,
    max: Number.POSITIVE_INFINITY,
    type: "Hot",
    hot: "O",
    special: "Giants",
    unusual: "Giants",
    giants: "Class Ia",
    peculiar: "Anomaly",
  },
];

const BROWN_DWARF_TYPES = ["L", "T", "Y"];
const PERSISTED_SPECTRAL_TYPES = new Set(["O", "B", "A", "F", "G", "K", "M", "L", "T", "Y", "WD"]);
const NUMERIC_SUBTYPE_BY_2D = {
  2: 0,
  3: 1,
  4: 3,
  5: 5,
  6: 7,
  7: 9,
  8: 8,
  9: 6,
  10: 4,
  11: 2,
  12: 0,
};
const PRIMARY_M_SUBTYPE_BY_2D = {
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 0,
  7: 2,
  8: 1,
  9: 3,
  10: 5,
  11: 7,
  12: 9,
};
const MASS_TEMPERATURE_ROWS = [
  {
    starType: "O",
    subtype: 0,
    temperatureK: 50000,
    masses: { Ia: 200, Ib: 150, II: 130, III: 110, IV: null, V: 90, VI: 2 },
  },
  {
    starType: "O",
    subtype: 5,
    temperatureK: 40000,
    masses: { Ia: 80, Ib: 60, II: 40, III: 30, IV: null, V: 60, VI: 1.5 },
  },
  {
    starType: "B",
    subtype: 0,
    temperatureK: 30000,
    masses: { Ia: 60, Ib: 40, II: 30, III: 20, IV: 20, V: 18, VI: 0.5 },
  },
  {
    starType: "B",
    subtype: 5,
    temperatureK: 15000,
    masses: { Ia: 30, Ib: 25, II: 20, III: 10, IV: 10, V: 5, VI: 0.4 },
  },
  {
    starType: "A",
    subtype: 0,
    temperatureK: 10000,
    masses: { Ia: 20, Ib: 15, II: 14, III: 8, IV: 4, V: 2.2, VI: null },
  },
  {
    starType: "A",
    subtype: 5,
    temperatureK: 8000,
    masses: { Ia: 15, Ib: 13, II: 11, III: 6, IV: 2.3, V: 1.8, VI: null },
  },
  {
    starType: "F",
    subtype: 0,
    temperatureK: 7500,
    masses: { Ia: 13, Ib: 12, II: 10, III: 4, IV: 2, V: 1.5, VI: null },
  },
  {
    starType: "F",
    subtype: 5,
    temperatureK: 6500,
    masses: { Ia: 12, Ib: 10, II: 8, III: 3, IV: 1.5, V: 1.3, VI: null },
  },
  {
    starType: "G",
    subtype: 0,
    temperatureK: 6000,
    masses: { Ia: 12, Ib: 10, II: 8, III: 2.5, IV: 1.7, V: 1.1, VI: 0.8 },
  },
  {
    starType: "G",
    subtype: 5,
    temperatureK: 5600,
    masses: { Ia: 13, Ib: 11, II: 10, III: 2.4, IV: 1.2, V: 0.9, VI: 0.7 },
  },
  {
    starType: "K",
    subtype: 0,
    temperatureK: 5200,
    masses: { Ia: 14, Ib: 12, II: 10, III: 1.1, IV: 1.5, V: 0.8, VI: 0.6 },
  },
  {
    starType: "K",
    subtype: 5,
    temperatureK: 4400,
    masses: { Ia: 18, Ib: 13, II: 12, III: 1.5, IV: null, V: 0.7, VI: 0.5 },
  },
  {
    starType: "M",
    subtype: 0,
    temperatureK: 3700,
    masses: { Ia: 20, Ib: 15, II: 14, III: 1.8, IV: null, V: 0.5, VI: 0.4 },
  },
  {
    starType: "M",
    subtype: 5,
    temperatureK: 3000,
    masses: { Ia: 25, Ib: 20, II: 16, III: 2.4, IV: null, V: 0.16, VI: 0.12 },
  },
  {
    starType: "M",
    subtype: 9,
    temperatureK: 2400,
    masses: { Ia: 30, Ib: 25, II: 18, III: 8, IV: null, V: 0.08, VI: 0.075 },
  },
];
const DIAMETER_ROWS = [
  { starType: "O", subtype: 0, diameters: { Ia: 25, Ib: 24, II: 22, III: 21, IV: null, V: 20, VI: 0.18 } },
  { starType: "O", subtype: 5, diameters: { Ia: 22, Ib: 20, II: 18, III: 15, IV: null, V: 12, VI: 0.18 } },
  { starType: "B", subtype: 0, diameters: { Ia: 20, Ib: 14, II: 12, III: 10, IV: 8, V: 7, VI: 0.2 } },
  { starType: "B", subtype: 5, diameters: { Ia: 60, Ib: 25, II: 14, III: 6, IV: 5, V: 3.5, VI: 0.5 } },
  { starType: "A", subtype: 0, diameters: { Ia: 120, Ib: 50, II: 30, III: 5, IV: 4, V: 2.2, VI: null } },
  { starType: "A", subtype: 5, diameters: { Ia: 180, Ib: 75, II: 45, III: 5, IV: 3, V: 2, VI: null } },
  { starType: "F", subtype: 0, diameters: { Ia: 210, Ib: 85, II: 50, III: 5, IV: 3, V: 1.7, VI: null } },
  { starType: "F", subtype: 5, diameters: { Ia: 280, Ib: 115, II: 66, III: 5, IV: 2, V: 1.5, VI: null } },
  { starType: "G", subtype: 0, diameters: { Ia: 330, Ib: 135, II: 77, III: 10, IV: 3, V: 1.1, VI: 0.8 } },
  { starType: "G", subtype: 5, diameters: { Ia: 360, Ib: 150, II: 90, III: 15, IV: 4, V: 0.95, VI: 0.7 } },
  { starType: "K", subtype: 0, diameters: { Ia: 420, Ib: 180, II: 110, III: 20, IV: 6, V: 0.9, VI: 0.6 } },
  { starType: "K", subtype: 5, diameters: { Ia: 600, Ib: 260, II: 160, III: 40, IV: null, V: 0.8, VI: 0.5 } },
  { starType: "M", subtype: 0, diameters: { Ia: 900, Ib: 380, II: 230, III: 60, IV: null, V: 0.7, VI: 0.4 } },
  { starType: "M", subtype: 5, diameters: { Ia: 1200, Ib: 600, II: 350, III: 100, IV: null, V: 0.2, VI: 0.1 } },
  { starType: "M", subtype: 9, diameters: { Ia: 1800, Ib: 800, II: 500, III: 200, IV: null, V: 0.1, VI: 0.08 } },
];
const MASS_TEMPERATURE_TYPES = ["O", "B", "A", "F", "G", "K", "M"];
const GIANT_CLASSES = new Set(["Ia", "Ib", "II", "III"]);

function spectralPosition(starType, subtype) {
  const typeIndex = MASS_TEMPERATURE_TYPES.indexOf(starType);
  if (typeIndex < 0 || !Number.isFinite(subtype)) {
    return null;
  }

  const clampedSubtype = Math.min(9, Math.max(0, subtype));
  return typeIndex * 10 + clampedSubtype;
}

const MASS_TEMPERATURE_ANCHORS = MASS_TEMPERATURE_ROWS.map((row) => ({
  ...row,
  position: spectralPosition(row.starType, row.subtype),
})).sort((a, b) => a.position - b.position);

const DIAMETER_ANCHORS = DIAMETER_ROWS.map((row) => ({
  ...row,
  position: spectralPosition(row.starType, row.subtype),
})).sort((a, b) => a.position - b.position);

function interpolateLinear(x, x0, y0, x1, y1) {
  if (x1 === x0) {
    return y0;
  }

  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

function nearestAnchors(position, getValue) {
  let lower = null;
  let upper = null;

  for (const anchor of MASS_TEMPERATURE_ANCHORS) {
    const value = getValue(anchor);
    if (value == null) {
      continue;
    }

    if (anchor.position <= position) {
      lower = { anchor, value };
    }

    if (anchor.position >= position) {
      upper = { anchor, value };
      break;
    }
  }

  if (!lower) {
    for (const anchor of MASS_TEMPERATURE_ANCHORS) {
      const value = getValue(anchor);
      if (value != null) {
        lower = { anchor, value };
        break;
      }
    }
  }

  if (!upper) {
    for (let i = MASS_TEMPERATURE_ANCHORS.length - 1; i >= 0; i--) {
      const anchor = MASS_TEMPERATURE_ANCHORS[i];
      const value = getValue(anchor);
      if (value != null) {
        upper = { anchor, value };
        break;
      }
    }
  }

  return { lower, upper };
}

function nearestAnchorsFromTable(anchors, position, getValue) {
  let lower = null;
  let upper = null;

  for (const anchor of anchors) {
    const value = getValue(anchor);
    if (value == null) {
      continue;
    }

    if (anchor.position <= position) {
      lower = { anchor, value };
    }

    if (anchor.position >= position) {
      upper = { anchor, value };
      break;
    }
  }

  if (!lower) {
    for (const anchor of anchors) {
      const value = getValue(anchor);
      if (value != null) {
        lower = { anchor, value };
        break;
      }
    }
  }

  if (!upper) {
    for (let i = anchors.length - 1; i >= 0; i--) {
      const anchor = anchors[i];
      const value = getValue(anchor);
      if (value != null) {
        upper = { anchor, value };
        break;
      }
    }
  }

  return { lower, upper };
}

function interpolateFromAnchors(position, lower, upper) {
  if (!lower && !upper) {
    return null;
  }

  if (lower && upper) {
    if (lower.anchor.position === upper.anchor.position) {
      return lower.value;
    }

    return interpolateLinear(position, lower.anchor.position, lower.value, upper.anchor.position, upper.value);
  }

  return lower ? lower.value : upper.value;
}

function varianceRoll({ rng, variancePct }) {
  const rawRoll = roll2d(rng);
  const normalized = (rawRoll - 7) / 5;
  const adjustment = normalized * variancePct;
  return {
    rawRoll,
    normalized,
    adjustment,
  };
}

export function calculateLuminosityFromDiameterAndTemperature({
  diameterInSolarDiameters,
  temperatureK,
  solarTemperatureK = 5772,
} = {}) {
  if (
    !Number.isFinite(diameterInSolarDiameters) ||
    !Number.isFinite(temperatureK) ||
    !Number.isFinite(solarTemperatureK)
  ) {
    return null;
  }

  if (diameterInSolarDiameters < 0 || temperatureK < 0 || solarTemperatureK <= 0) {
    return null;
  }

  const diameterTerm = diameterInSolarDiameters ** 2;
  const temperatureTerm = (temperatureK / solarTemperatureK) ** 4;
  return diameterTerm * temperatureTerm;
}

export function estimateStarDiameter({
  spectralType,
  subtype,
  luminosityClass,
  rng = Math.random,
  applyDiameterVariance = true,
  normalVariancePct = 0.2,
  giantVariancePct = 0.5,
} = {}) {
  if (!MASS_TEMPERATURE_TYPES.includes(spectralType) || !Number.isFinite(subtype) || !luminosityClass) {
    return null;
  }

  const position = spectralPosition(spectralType, subtype);
  if (position == null) {
    return null;
  }

  const diameterAnchors = nearestAnchorsFromTable(
    DIAMETER_ANCHORS,
    position,
    (anchor) => anchor.diameters[luminosityClass] ?? null,
  );
  const baseDiameter = interpolateFromAnchors(position, diameterAnchors.lower, diameterAnchors.upper);

  if (!Number.isFinite(baseDiameter)) {
    return null;
  }

  let diameterInSolarDiameters = baseDiameter;
  let appliedVariance = null;

  if (applyDiameterVariance) {
    const variancePct = GIANT_CLASSES.has(luminosityClass) ? giantVariancePct : normalVariancePct;
    const rolledVariance = varianceRoll({ rng, variancePct });
    diameterInSolarDiameters = Math.max(0, baseDiameter * (1 + rolledVariance.adjustment));
    appliedVariance = {
      variancePct,
      ...rolledVariance,
    };
  }

  return {
    baseDiameter,
    diameterInSolarDiameters,
    appliedVariance,
  };
}

export function estimateStarMassAndTemperature({
  spectralType,
  subtype,
  luminosityClass,
  rng = Math.random,
  applyMassVariance = true,
  normalVariancePct = 0.2,
  giantVariancePct = 0.5,
} = {}) {
  if (!MASS_TEMPERATURE_TYPES.includes(spectralType) || !Number.isFinite(subtype) || !luminosityClass) {
    return null;
  }

  const position = spectralPosition(spectralType, subtype);
  if (position == null) {
    return null;
  }

  const temperatureAnchors = nearestAnchors(position, (anchor) => anchor.temperatureK);
  const baseTemperatureK = interpolateFromAnchors(position, temperatureAnchors.lower, temperatureAnchors.upper);

  const massAnchors = nearestAnchors(position, (anchor) => anchor.masses[luminosityClass] ?? null);
  const baseMass = interpolateFromAnchors(position, massAnchors.lower, massAnchors.upper);

  if (!Number.isFinite(baseTemperatureK) || !Number.isFinite(baseMass)) {
    return null;
  }

  let massInSolarMasses = baseMass;
  let appliedVariance = null;

  if (applyMassVariance) {
    const variancePct = GIANT_CLASSES.has(luminosityClass) ? giantVariancePct : normalVariancePct;
    const rolledVariance = varianceRoll({ rng, variancePct });
    massInSolarMasses = Math.max(0, baseMass * (1 + rolledVariance.adjustment));
    appliedVariance = {
      variancePct,
      ...rolledVariance,
    };
  }

  return {
    baseMass,
    massInSolarMasses,
    temperatureK: Math.round(baseTemperatureK),
    appliedVariance,
  };
}

function roll2d(rng) {
  return Math.floor(rng() * 6) + 1 + (Math.floor(rng() * 6) + 1);
}

const MAX_STELLAR_AGE_GYR = 13.8;
const SMALL_STAR_MASS_THRESHOLD = 0.9;
const PROTOSTAR_MINIMUM_MASS_THRESHOLD = 4.7;
const MINIMUM_NORMAL_STAR_AGE_GYR = 0.01;
const MAX_PROGENITOR_MASS_SEARCH = 200;
const PROGENITOR_MASS_BINARY_SEARCH_STEPS = 40;
const AGE_COMPARISON_EPSILON = 1e-6;
const GIANT_AGE_CLASSES = new Set(["Ia", "Ib", "II", "III"]);
const CLOSE_RESTRICTED_CLASSES = new Set(["Ia", "Ib", "II", "III"]);
const MULTIPLE_STAR_PRESENCE_THRESHOLD = 10;
const MULTIPLE_STAR_ORBIT_CLASSES = ["Close", "Near", "Far"];
const DESIGNATION_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NORMAL_STELLAR_TYPES = ["O", "B", "A", "F", "G", "K", "M"];
const BROWN_DWARF_STELLAR_TYPES = ["L", "T", "Y"];
const NON_PRIMARY_TABLE_ROWS = [
  {
    min: Number.NEGATIVE_INFINITY,
    max: 2,
    secondary: "Other",
    companion: "Other",
    postStellar: "Other",
    other: "NS",
  },
  { min: 3, max: 3, secondary: "Other", companion: "Other", postStellar: "Other", other: "D" },
  { min: 4, max: 4, secondary: "Random", companion: "Random", postStellar: "Random", other: "D" },
  { min: 5, max: 5, secondary: "Random", companion: "Random", postStellar: "Random", other: "D" },
  { min: 6, max: 6, secondary: "Random", companion: "Lesser", postStellar: "Random", other: "D" },
  { min: 7, max: 7, secondary: "Lesser", companion: "Lesser", postStellar: "Random", other: "D" },
  { min: 8, max: 8, secondary: "Lesser", companion: "Sibling", postStellar: "Random", other: "BD" },
  { min: 9, max: 9, secondary: "Sibling", companion: "Sibling", postStellar: "Lesser", other: "BD" },
  { min: 10, max: 10, secondary: "Sibling", companion: "Twin", postStellar: "Lesser", other: "BD" },
  { min: 11, max: 11, secondary: "Twin", companion: "Twin", postStellar: "Twin", other: "BD" },
  {
    min: 12,
    max: Number.POSITIVE_INFINITY,
    secondary: "Twin",
    companion: "Twin",
    postStellar: "Twin",
    other: "BD",
  },
];
const ORBIT_DISTANCE_ROWS = [
  { orbitNumber: 0, distanceAU: 0.4, differenceAU: 0 },
  { orbitNumber: 1, distanceAU: 0.4, differenceAU: 0.3 },
  { orbitNumber: 2, distanceAU: 0.7, differenceAU: 0.3 },
  { orbitNumber: 3, distanceAU: 1.0, differenceAU: 0.6 },
  { orbitNumber: 4, distanceAU: 1.6, differenceAU: 1.2 },
  { orbitNumber: 5, distanceAU: 2.8, differenceAU: 2.4 },
  { orbitNumber: 6, distanceAU: 5.2, differenceAU: 4.8 },
  { orbitNumber: 7, distanceAU: 10, differenceAU: 10 },
  { orbitNumber: 8, distanceAU: 20, differenceAU: 20 },
  { orbitNumber: 9, distanceAU: 40, differenceAU: 37 },
  { orbitNumber: 10, distanceAU: 77, differenceAU: 77 },
  { orbitNumber: 11, distanceAU: 154, differenceAU: 154 },
  { orbitNumber: 12, distanceAU: 308, differenceAU: 307 },
  { orbitNumber: 13, distanceAU: 615, differenceAU: 615 },
  { orbitNumber: 14, distanceAU: 1230, differenceAU: 1270 },
  { orbitNumber: 15, distanceAU: 2500, differenceAU: 2400 },
  { orbitNumber: 16, distanceAU: 4900, differenceAU: 4900 },
  { orbitNumber: 17, distanceAU: 9800, differenceAU: 9700 },
  { orbitNumber: 18, distanceAU: 19500, differenceAU: 20000 },
  { orbitNumber: 19, distanceAU: 39500, differenceAU: 39200 },
  { orbitNumber: 20, distanceAU: 78700, differenceAU: null },
];
const MAX_ORBIT_NUMBER = 20;
const MAX_ECCENTRICITY = 0.999;
const KM_PER_AU = 149597870.9;
const DAYS_PER_YEAR = 365.25;
const HOURS_PER_YEAR = 8766;
const EARTH_MASS_TO_SOLAR_MASS = 0.000003;
const SOLAR_DIAMETER_AU = 0.009305;
const GIANT_MAO_DIAMETER_MULTIPLIER = 2;
const GIANT_ORBIT_CLASSES = new Set(["Ia", "Ib", "II", "III"]);
const ORBIT_CLASS_NORMALIZATION = {
  close: "Close",
  near: "Near",
  far: "Far",
  companion: "Companion",
};

function normalizeOrbitClass(orbitClass) {
  const normalized = String(orbitClass || "")
    .trim()
    .toLowerCase();
  return ORBIT_CLASS_NORMALIZATION[normalized] || "Near";
}

function roundTo(value, digits = 6) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
}

function orbitRowForWhole(wholeOrbitNumber) {
  const normalizedWhole = Math.max(0, Math.min(MAX_ORBIT_NUMBER, Math.trunc(wholeOrbitNumber)));
  return ORBIT_DISTANCE_ROWS.find((row) => row.orbitNumber === normalizedWhole) ?? ORBIT_DISTANCE_ROWS[0];
}

export function convertOrbitNumberToAu({ orbitNumber } = {}) {
  if (!Number.isFinite(orbitNumber) || orbitNumber < 0) {
    return null;
  }

  const clampedOrbitNumber = Math.min(MAX_ORBIT_NUMBER, orbitNumber);

  // Orbit# zero follows the explicit 0.4 x fraction behavior from the rules text.
  if (clampedOrbitNumber < 1) {
    return roundTo(0.4 * clampedOrbitNumber, 8);
  }

  const wholeOrbitNumber = Math.trunc(clampedOrbitNumber);
  const fractionalValue = clampedOrbitNumber - wholeOrbitNumber;
  const row = orbitRowForWhole(wholeOrbitNumber);

  if (!Number.isFinite(row?.distanceAU)) {
    return null;
  }

  if (!Number.isFinite(row?.differenceAU) || row.differenceAU <= 0 || fractionalValue <= 0) {
    return roundTo(row.distanceAU, 8);
  }

  return roundTo(row.distanceAU + row.differenceAU * fractionalValue, 8);
}

export function convertAuToOrbitNumber({ au } = {}) {
  if (!Number.isFinite(au) || au < 0) {
    return null;
  }

  if (au < 0.4) {
    return roundTo(au / 0.4, 8);
  }

  let fullRow = ORBIT_DISTANCE_ROWS[1];
  for (const row of ORBIT_DISTANCE_ROWS) {
    if (row.orbitNumber < 1) {
      continue;
    }
    if (au >= row.distanceAU) {
      fullRow = row;
    } else {
      break;
    }
  }

  if (!Number.isFinite(fullRow?.differenceAU) || fullRow.differenceAU <= 0 || fullRow.orbitNumber >= MAX_ORBIT_NUMBER) {
    return roundTo(fullRow.orbitNumber, 8);
  }

  const fractional = Math.max(0, (au - fullRow.distanceAU) / fullRow.differenceAU);
  return roundTo(Math.min(MAX_ORBIT_NUMBER, fullRow.orbitNumber + fractional), 8);
}

export function generateFractionalOrbitNumber({ wholeOrbitNumber, rng = Math.random, extraDigits = 0 } = {}) {
  if (!Number.isFinite(wholeOrbitNumber)) {
    return null;
  }

  const normalizedWhole = Math.max(0, Math.min(MAX_ORBIT_NUMBER, Math.trunc(wholeOrbitNumber)));
  let orbitNumber;

  if (normalizedWhole === 0) {
    orbitNumber = rollDie(10, rng) / 20;
  } else {
    orbitNumber = normalizedWhole - 0.5 + rollDie(10, rng) / 10;
  }

  const normalizedDigits = Number.isFinite(extraDigits) ? Math.max(0, Math.trunc(extraDigits)) : 0;
  for (let i = 0; i < normalizedDigits; i++) {
    orbitNumber += rollDie(10, rng) / 10 ** (i + 2);
  }

  return roundTo(Math.max(0, Math.min(MAX_ORBIT_NUMBER, orbitNumber)), 8);
}

export function deriveMaoOrbitNumber({ luminosityClass, diameterInSolarDiameters } = {}) {
  const normalizedClass = normalizeLuminosityClass(luminosityClass);
  if (!GIANT_ORBIT_CLASSES.has(normalizedClass)) {
    return null;
  }

  if (!Number.isFinite(diameterInSolarDiameters) || diameterInSolarDiameters <= 0) {
    return null;
  }

  // Giant MAO scales from physical stellar size so larger giants force wider companion orbits.
  const stellarDiameterAu = diameterInSolarDiameters * SOLAR_DIAMETER_AU;
  const maoAu = Math.max(0.01, stellarDiameterAu * GIANT_MAO_DIAMETER_MULTIPLIER);
  const orbitNumber = convertAuToOrbitNumber({ au: maoAu });

  return Number.isFinite(orbitNumber) ? roundTo(orbitNumber, 4) : null;
}

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

export function calculateEccentricityFirstRollDm({
  isStar = false,
  directlyOrbitedStarCount = 1,
  orbitNumber,
  systemAgeGyr,
  isSignificantBeltBody = false,
  extraDm = 0,
} = {}) {
  const notes = [];
  let dm = 0;

  if (isStar) {
    dm += 2;
    notes.push("DM+2 for stars.");
  }

  const extraStars = Math.max(0, (Math.trunc(directlyOrbitedStarCount) || 1) - 1);
  if (extraStars > 0) {
    dm += extraStars;
    notes.push(`DM+${extraStars} for additional directly orbited stars.`);
  }

  if (Number.isFinite(orbitNumber) && orbitNumber < 1 && Number.isFinite(systemAgeGyr) && systemAgeGyr > 1) {
    dm -= 1;
    notes.push("DM-1 for Orbit# < 1 in systems older than 1 Gyr.");
  }

  if (isSignificantBeltBody) {
    dm += 1;
    notes.push("DM+1 for significant belt body.");
  }

  if (Number.isFinite(extraDm) && extraDm !== 0) {
    dm += extraDm;
    notes.push(`${extraDm > 0 ? "DM+" : "DM"}${extraDm} custom modifier.`);
  }

  return { dm, notes };
}

export function calculateOrbitSeparationBounds({ au, eccentricity } = {}) {
  if (!Number.isFinite(au) || au < 0) {
    return {
      minimumSeparationAu: null,
      maximumSeparationAu: null,
    };
  }

  const clampedEccentricity = Number.isFinite(eccentricity) ? Math.max(0, Math.min(MAX_ECCENTRICITY, eccentricity)) : 0;

  return {
    minimumSeparationAu: roundTo(au * (1 - clampedEccentricity), 8),
    maximumSeparationAu: roundTo(au * (1 + clampedEccentricity), 8),
  };
}

export function calculateStarOrbitPeriodYears({
  separationAu,
  primaryMassInSolarMasses,
  secondaryMassInSolarMasses,
} = {}) {
  if (!Number.isFinite(separationAu) || separationAu < 0) {
    return null;
  }

  const primaryMass = Number(primaryMassInSolarMasses);
  const secondaryMass = Number(secondaryMassInSolarMasses);
  if (!Number.isFinite(primaryMass) || !Number.isFinite(secondaryMass)) {
    return null;
  }

  const combinedMass = primaryMass + secondaryMass;
  if (combinedMass <= 0) {
    return null;
  }

  return roundTo(Math.sqrt(separationAu ** 3 / combinedMass), 10);
}

export function calculatePlanetOrbitPeriodYears({
  orbitAu,
  interiorStellarMassInSolarMasses,
  planetMassInEarthMasses = 0,
  includePlanetMass = false,
} = {}) {
  if (!Number.isFinite(orbitAu) || orbitAu < 0) {
    return null;
  }

  const stellarMass = Number(interiorStellarMassInSolarMasses);
  if (!Number.isFinite(stellarMass) || stellarMass <= 0) {
    return null;
  }

  const planetaryMassSolar =
    includePlanetMass && Number.isFinite(planetMassInEarthMasses)
      ? Math.max(0, Number(planetMassInEarthMasses)) * EARTH_MASS_TO_SOLAR_MASS
      : 0;
  const denominatorMass = stellarMass + planetaryMassSolar;
  if (denominatorMass <= 0) {
    return null;
  }

  return roundTo(Math.sqrt(orbitAu ** 3 / denominatorMass), 10);
}

export function convertOrbitPeriodYearsToDays({ periodYears } = {}) {
  if (!Number.isFinite(periodYears) || periodYears < 0) {
    return null;
  }

  return roundTo(periodYears * DAYS_PER_YEAR, 8);
}

export function convertOrbitPeriodYearsToHours({ periodYears } = {}) {
  if (!Number.isFinite(periodYears) || periodYears < 0) {
    return null;
  }

  return roundTo(periodYears * HOURS_PER_YEAR, 8);
}

/**
 * Calculates absolute magnitude (Mv) from luminosity
 * Formula: Mv = 4.83 - 2.5 * log10(L / Lsun)
 * where Lsun = 1 (normalized)
 * @param {number} luminosity - Luminosity in solar luminosities (L☉)
 * @returns {number} - Absolute visual magnitude, or null if invalid
 */
export function calculateAbsoluteMagnitude({ luminosity } = {}) {
  if (!Number.isFinite(luminosity) || luminosity <= 0) {
    return null;
  }

  const mv = 4.83 - 2.5 * Math.log10(luminosity);
  return roundTo(mv, 2);
}

/**
 * Returns the visual color hex code for a spectral class
 * Maps Harvard spectral classification to representative colors
 * @param {string} spectralClass - Spectral class (e.g., "O", "B", "A", "F", "G", "K", "M")
 * @returns {string} - Hex color code (e.g., "#3366ff" for blue)
 */
export function getStarVisualColor({ spectralClass } = {}) {
  if (!spectralClass) return "#ffffff";

  const spectral = String(spectralClass).trim().charAt(0).toUpperCase();

  // Standard colors for Harvard spectral classes (cooler to hotter)
  const colors = {
    M: "#ff4444", // Red dwarf
    K: "#ff8844", // Orange
    G: "#ffff44", // Yellow (Sun-like)
    F: "#ffffcc", // Yellow-white
    A: "#ffffff", // White
    B: "#aaccff", // Blue-white
    O: "#6699ff", // Blue
    WD: "#eeeeee", // White dwarf (pale)
  };

  return colors[spectral] || "#ffffff";
}

/**
 * Calculates main sequence lifetime in Gyrs
 * Simplified formula: lifetime ≈ 10 Gyr * (M☉ / M)^2.5
 * where M is mass in solar masses
 * @param {number} massInSolarMasses - Star mass in solar masses
 * @returns {number} - Lifetime in Gyrs, or null if invalid
 */
export function calculateMainSequenceLifetime({ massInSolarMasses } = {}) {
  if (!Number.isFinite(massInSolarMasses) || massInSolarMasses <= 0) {
    return null;
  }

  const lifetime = 10 * Math.pow(1 / massInSolarMasses, 2.5);
  return roundTo(Math.max(0.001, lifetime), 3); // Minimum 1 Myr
}

/**
 * Calculates evolutionary status of a star on the main sequence
 * Returns percentage of lifetime completed
 * @param {number} ageGyr - Star age in Gyrs
 * @param {number} lifetimeGyr - Main sequence lifetime in Gyrs
 * @returns {Object|null} - { percentComplete: number, status: string } or null if invalid
 */
export function calculateEvolutionaryStatus({ ageGyr, lifetimeGyr } = {}) {
  if (!Number.isFinite(ageGyr) || !Number.isFinite(lifetimeGyr) || lifetimeGyr <= 0 || ageGyr < 0) {
    return null;
  }

  const percentComplete = roundTo((ageGyr / lifetimeGyr) * 100, 1);
  let status = "Early Main Sequence";

  if (percentComplete >= 90) {
    status = "Red Giant";
  } else if (percentComplete >= 75) {
    status = "Late Main Sequence";
  } else if (percentComplete >= 50) {
    status = "Mid Main Sequence";
  } else if (percentComplete >= 25) {
    status = "Early Main Sequence";
  } else {
    status = "Young Main Sequence";
  }

  return { percentComplete, status, remainingGyr: roundTo(lifetimeGyr - ageGyr, 3) };
}

/**
 * Estimates rotation period in days based on mass and spectral class
 * Uses empirical relationship: P ≈ 0.4 * M^0.5 days (for main sequence)
 * @param {number} massInSolarMasses - Star mass in solar masses
 * @param {string} luminosityClass - Luminosity class (e.g., "V", "III")
 * @returns {number} - Rotation period in days, or null if invalid
 */
export function estimateRotationPeriod({ massInSolarMasses, luminosityClass } = {}) {
  if (!Number.isFinite(massInSolarMasses) || massInSolarMasses <= 0) {
    return null;
  }

  // Main sequence (V) stars
  if (luminosityClass === "V") {
    const period = 0.4 * Math.pow(massInSolarMasses, 0.5);
    return roundTo(Math.max(0.1, Math.min(period, 100)), 2); // Clamp between 0.1 and 100 days
  }

  // Giants (III) rotate much slower
  if (luminosityClass === "III") {
    const period = 2.0 * Math.pow(massInSolarMasses, 0.3);
    return roundTo(Math.max(1, Math.min(period, 500)), 2);
  }

  // Subdwarfs (VI) and others rotate faster
  const period = 0.2 * Math.pow(massInSolarMasses, 0.6);
  return roundTo(Math.max(0.05, Math.min(period, 50)), 2);
}

/**
 * Checks if a multi-star system is gravitationally stable
 * Simplified Hill stability criterion for hierarchical systems
 * @param {Array} stars - Array of stars with masses, orbit data
 * @returns {Object} - { isStable: boolean, warnings: Array }
 */
export function checkSystemStability({ stars } = {}) {
  const warnings = [];

  if (!Array.isArray(stars) || stars.length < 2) {
    return { isStable: true, warnings };
  }

  const primary = stars[0];
  if (!primary) {
    return { isStable: false, warnings: ["No primary star found"] };
  }

  // Check each companion
  for (let i = 1; i < stars.length; i++) {
    const companion = stars[i];

    if (!companion.stellarOrbitAu || !companion.stellarOrbitEccentricity) {
      continue;
    }

    const separation = companion.stellarOrbitAu;
    const eccentricity = companion.stellarOrbitEccentricity;
    const primaryMass = primary.massInSolarMasses || 1;
    const compMass = companion.massInSolarMasses || 0.5;

    // Simple check: companion not too close (tidal disruption)
    const minSeparation = 0.1; // AU, crude estimate
    if (separation < minSeparation) {
      warnings.push(
        `Star ${companion.systemDesignation || "B"} orbits very close to primary (${separation} AU) — risk of tidal effects`,
      );
    }

    // Check mass ratio for stability
    const massRatio = Math.min(primaryMass, compMass) / Math.max(primaryMass, compMass);
    if (massRatio < 0.05) {
      warnings.push(
        `Star ${companion.systemDesignation || "B"} has very low mass ratio (${(massRatio * 100).toFixed(1)}%) — unusual but stable`,
      );
    }

    // High eccentricity warning
    if (eccentricity > 0.8) {
      warnings.push(
        `Star ${companion.systemDesignation || "B"} has very high orbital eccentricity (${eccentricity}) — highly elliptical orbit`,
      );
    }
  }

  return { isStable: true, warnings };
}

export function generateOrbitEccentricity({
  rng = Math.random,
  isStar = false,
  directlyOrbitedStarCount = 1,
  orbitNumber,
  systemAgeGyr,
  isSignificantBeltBody = false,
  collapseLowRollToZero = false,
  linearVarianceDigits = 0,
  extraDm = 0,
} = {}) {
  const firstRoll = roll2d(rng);
  const dmResult = calculateEccentricityFirstRollDm({
    isStar,
    directlyOrbitedStarCount,
    orbitNumber,
    systemAgeGyr,
    isSignificantBeltBody,
    extraDm,
  });
  const firstRollTotal = firstRoll + dmResult.dm;
  const row = eccentricityRowForRoll(firstRollTotal);

  const secondRoll = row.secondRollDice === 2 ? roll2d(rng) : rollDie(6, rng);
  const secondRollValue = secondRoll / row.secondRollDivisor;
  let eccentricity = row.baseValue + secondRollValue;

  const notes = [...dmResult.notes];
  if (collapseLowRollToZero && firstRollTotal <= 5) {
    eccentricity = 0;
    notes.push("Collapsed low-roll eccentricity to exactly 0.");
  }

  const normalizedVarianceDigits = Math.max(0, Math.min(3, Math.trunc(linearVarianceDigits) || 0));
  for (let i = 0; i < normalizedVarianceDigits; i++) {
    eccentricity += rollDie(10, rng) / 10 ** (i + 4);
  }

  const clampedEccentricity = Math.max(0, Math.min(MAX_ECCENTRICITY, eccentricity));

  return {
    firstRoll,
    firstRollDm: dmResult.dm,
    firstRollTotal,
    baseValue: row.baseValue,
    secondRollDice: row.secondRollDice,
    secondRoll,
    secondRollDivisor: row.secondRollDivisor,
    secondRollValue: roundTo(secondRollValue, 8),
    eccentricity: roundTo(clampedEccentricity, 6),
    notes,
  };
}

function normalizeOrbitPlacementForRemediation(placement, index) {
  const normalizedOrbitNumber = Number.isFinite(placement?.orbitNumber)
    ? Math.max(0, Math.min(MAX_ORBIT_NUMBER, placement.orbitNumber))
    : null;
  const orbitAu = Number.isFinite(normalizedOrbitNumber)
    ? convertOrbitNumberToAu({ orbitNumber: normalizedOrbitNumber })
    : Number.isFinite(placement?.orbitAu)
      ? placement.orbitAu
      : null;
  const eccentricity = Number.isFinite(placement?.eccentricity)
    ? Math.max(0, Math.min(MAX_ECCENTRICITY, placement.eccentricity))
    : 0;
  const separationBounds = calculateOrbitSeparationBounds({
    au: orbitAu,
    eccentricity,
  });
  const orbitKm = Number.isFinite(orbitAu) ? orbitAu * KM_PER_AU : null;

  return {
    ...placement,
    __index: Number.isFinite(placement?.__index) ? placement.__index : index,
    orbitNumber: Number.isFinite(normalizedOrbitNumber) ? roundTo(normalizedOrbitNumber, 4) : null,
    orbitAu: roundTo(orbitAu, 6),
    orbitKm: roundTo(orbitKm, 2),
    orbitMillionKm: Number.isFinite(orbitKm) ? roundTo(orbitKm / 1_000_000, 3) : null,
    eccentricity: roundTo(eccentricity, 6),
    minimumSeparationAu: separationBounds.minimumSeparationAu,
    maximumSeparationAu: separationBounds.maximumSeparationAu,
  };
}

export function remediateOrbitCrossings({ placements = [], orbitStep = 1, maxIterations = 100 } = {}) {
  if (!Array.isArray(placements) || placements.length <= 1) {
    return {
      placements: Array.isArray(placements) ? placements : [],
      hadCrossings: false,
      unresolvedCrossings: false,
      adjustments: [],
    };
  }

  const normalizedOrbitStep = Number.isFinite(orbitStep) && orbitStep > 0 ? orbitStep : 1;
  const normalizedMaxIterations = Number.isFinite(maxIterations) ? Math.max(1, Math.trunc(maxIterations)) : 100;
  const working = placements.map((placement, index) => normalizeOrbitPlacementForRemediation(placement, index));

  let hadCrossings = false;
  let unresolvedCrossings = false;
  const adjustments = [];

  for (let iteration = 0; iteration < normalizedMaxIterations; iteration++) {
    const sorted = [...working]
      .filter((entry) => Number.isFinite(entry?.orbitNumber) && Number.isFinite(entry?.minimumSeparationAu))
      .sort((a, b) => a.orbitNumber - b.orbitNumber);

    if (sorted.length <= 1) {
      break;
    }

    let innerMaxSeparation = sorted[0].maximumSeparationAu;
    let crossingEntry = null;

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (!Number.isFinite(current.minimumSeparationAu)) {
        continue;
      }

      if (Number.isFinite(innerMaxSeparation) && current.minimumSeparationAu <= innerMaxSeparation) {
        crossingEntry = current;
        break;
      }

      if (Number.isFinite(current.maximumSeparationAu)) {
        innerMaxSeparation = Number.isFinite(innerMaxSeparation)
          ? Math.max(innerMaxSeparation, current.maximumSeparationAu)
          : current.maximumSeparationAu;
      }
    }

    if (!crossingEntry) {
      break;
    }

    hadCrossings = true;
    const targetIndex = working.findIndex((entry) => entry.__index === crossingEntry.__index);
    if (targetIndex < 0) {
      unresolvedCrossings = true;
      break;
    }

    const fromOrbitNumber = working[targetIndex].orbitNumber;
    const toOrbitNumber = Math.min(MAX_ORBIT_NUMBER, fromOrbitNumber + normalizedOrbitStep);
    if (!Number.isFinite(fromOrbitNumber) || toOrbitNumber <= fromOrbitNumber) {
      unresolvedCrossings = true;
      break;
    }

    working[targetIndex] = normalizeOrbitPlacementForRemediation(
      {
        ...working[targetIndex],
        orbitNumber: toOrbitNumber,
      },
      working[targetIndex].__index,
    );

    adjustments.push({
      id: working[targetIndex].id ?? null,
      index: working[targetIndex].__index,
      fromOrbitNumber: roundTo(fromOrbitNumber, 4),
      toOrbitNumber: roundTo(toOrbitNumber, 4),
    });
  }

  if (hadCrossings && !unresolvedCrossings) {
    const sorted = [...working]
      .filter((entry) => Number.isFinite(entry?.orbitNumber) && Number.isFinite(entry?.minimumSeparationAu))
      .sort((a, b) => a.orbitNumber - b.orbitNumber);
    let innerMaxSeparation = sorted[0]?.maximumSeparationAu;
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (Number.isFinite(innerMaxSeparation) && Number.isFinite(current.minimumSeparationAu)) {
        if (current.minimumSeparationAu <= innerMaxSeparation) {
          unresolvedCrossings = true;
          break;
        }
      }
      if (Number.isFinite(current.maximumSeparationAu)) {
        innerMaxSeparation = Number.isFinite(innerMaxSeparation)
          ? Math.max(innerMaxSeparation, current.maximumSeparationAu)
          : current.maximumSeparationAu;
      }
    }
  }

  const outputPlacements = [...working]
    .sort((a, b) => a.__index - b.__index)
    .map((entry) => {
      const { __index, ...rest } = entry;
      return rest;
    });

  return {
    placements: outputPlacements,
    hadCrossings,
    unresolvedCrossings,
    adjustments,
  };
}

function baseStellarOrbitNumber({ orbitClass, rng }) {
  const normalizedClass = normalizeOrbitClass(orbitClass);

  if (normalizedClass === "Companion") {
    return rollDie(6, rng) / 10 + (roll2d(rng) - 7) / 100;
  }

  if (normalizedClass === "Close") {
    const closeRoll = rollDie(6, rng) - 1;
    return closeRoll === 0 ? 0.5 : closeRoll;
  }

  if (normalizedClass === "Far") {
    return rollDie(6, rng) + 11;
  }

  return rollDie(6, rng) + 5;
}

export function generateStellarOrbitPlacement({
  orbitClass,
  parentLuminosityClass,
  parentMaoOrbitNumber,
  parentDiameterInSolarDiameters,
  systemAgeGyr,
  rng = Math.random,
  includeEccentricity = true,
  collapseLowRollEccentricityToZero = false,
  eccentricityLinearVarianceDigits = 0,
  directlyOrbitedStarCount = 1,
  addNonCompanionFractionalVariance = true,
  extraFractionalDigits = 0,
} = {}) {
  const normalizedClass = normalizeOrbitClass(orbitClass);
  const normalizedParentClass = normalizeLuminosityClass(parentLuminosityClass);
  const notes = [];
  let usedGiantCompanionMaoRule = false;
  const derivedParentMaoOrbitNumber =
    Number.isFinite(parentMaoOrbitNumber) && parentMaoOrbitNumber > 0
      ? parentMaoOrbitNumber
      : deriveMaoOrbitNumber({
          luminosityClass: normalizedParentClass,
          diameterInSolarDiameters: parentDiameterInSolarDiameters,
        });

  let orbitNumber;
  if (
    normalizedClass === "Companion" &&
    GIANT_ORBIT_CLASSES.has(normalizedParentClass) &&
    Number.isFinite(derivedParentMaoOrbitNumber) &&
    derivedParentMaoOrbitNumber > 0
  ) {
    usedGiantCompanionMaoRule = true;
    orbitNumber = rollDie(6, rng) * derivedParentMaoOrbitNumber;
    notes.push("Companion of a giant used 1D x MAO orbit rule.");
    if (!Number.isFinite(parentMaoOrbitNumber) || parentMaoOrbitNumber <= 0) {
      notes.push("Parent MAO derived from giant stellar diameter.");
    }
  } else {
    orbitNumber = baseStellarOrbitNumber({ orbitClass: normalizedClass, rng });
    if (
      normalizedClass === "Companion" &&
      GIANT_ORBIT_CLASSES.has(normalizedParentClass) &&
      (!Number.isFinite(derivedParentMaoOrbitNumber) || derivedParentMaoOrbitNumber <= 0)
    ) {
      notes.push("Giant companion MAO unavailable; used default companion orbit rule.");
    }
  }

  if (normalizedClass !== "Companion" && addNonCompanionFractionalVariance) {
    orbitNumber += rollDie(10, rng) / 20;
    notes.push("Applied +0.05 to +0.50 fractional Orbit# variance.");
  }

  const normalizedDigits = Number.isFinite(extraFractionalDigits) ? Math.max(0, Math.trunc(extraFractionalDigits)) : 0;
  for (let i = 0; i < normalizedDigits; i++) {
    orbitNumber += rollDie(10, rng) / 10 ** (i + 2);
  }

  const clampedOrbitNumber = Math.max(0, Math.min(MAX_ORBIT_NUMBER, orbitNumber));
  const orbitAu = convertOrbitNumberToAu({ orbitNumber: clampedOrbitNumber });
  const orbitKm = Number.isFinite(orbitAu) ? orbitAu * KM_PER_AU : null;
  const eccentricityProfile = includeEccentricity
    ? generateOrbitEccentricity({
        rng,
        isStar: true,
        directlyOrbitedStarCount,
        orbitNumber: clampedOrbitNumber,
        systemAgeGyr,
        collapseLowRollToZero: collapseLowRollEccentricityToZero,
        linearVarianceDigits: eccentricityLinearVarianceDigits,
      })
    : null;
  const separationBounds = calculateOrbitSeparationBounds({
    au: orbitAu,
    eccentricity: eccentricityProfile?.eccentricity,
  });

  return {
    orbitClass: normalizedClass,
    orbitNumber: roundTo(clampedOrbitNumber, 4),
    orbitAu: roundTo(orbitAu, 6),
    orbitKm: roundTo(orbitKm, 2),
    orbitMillionKm: Number.isFinite(orbitKm) ? roundTo(orbitKm / 1_000_000, 3) : null,
    eccentricity: eccentricityProfile?.eccentricity ?? null,
    minimumSeparationAu: separationBounds.minimumSeparationAu,
    maximumSeparationAu: separationBounds.maximumSeparationAu,
    eccentricityProfile,
    usedGiantCompanionMaoRule,
    parentMaoOrbitNumber: Number.isFinite(derivedParentMaoOrbitNumber) ? roundTo(derivedParentMaoOrbitNumber, 4) : null,
    notes,
  };
}

function rollDie(sides, rng) {
  return Math.floor(rng() * sides) + 1;
}

function rollPercentile(rng) {
  return rollDie(100, rng);
}

function roll2d10(rng) {
  return rollDie(10, rng) + rollDie(10, rng);
}

function normalizeLuminosityClass(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();

  switch (raw) {
    case "IA":
      return "Ia";
    case "IB":
      return "Ib";
    default:
      return raw;
  }
}

function clampAge(ageGyr) {
  if (!Number.isFinite(ageGyr)) {
    return null;
  }

  return Math.min(MAX_STELLAR_AGE_GYR, Math.max(0, ageGyr));
}

export function calculateMainSequenceLifespanGyr({ massInSolarMasses } = {}) {
  if (!Number.isFinite(massInSolarMasses) || massInSolarMasses <= 0) {
    return null;
  }

  return 10 / massInSolarMasses ** 2.5;
}

export function calculateSubgiantLifespanGyr({ massInSolarMasses, mainSequenceLifespanGyr } = {}) {
  const mainSequence = Number.isFinite(mainSequenceLifespanGyr)
    ? mainSequenceLifespanGyr
    : calculateMainSequenceLifespanGyr({ massInSolarMasses });

  if (!Number.isFinite(mainSequence) || !Number.isFinite(massInSolarMasses) || massInSolarMasses <= 0) {
    return null;
  }

  return mainSequence / (4 + massInSolarMasses);
}

export function calculateGiantLifespanGyr({ massInSolarMasses, mainSequenceLifespanGyr } = {}) {
  const mainSequence = Number.isFinite(mainSequenceLifespanGyr)
    ? mainSequenceLifespanGyr
    : calculateMainSequenceLifespanGyr({ massInSolarMasses });

  if (!Number.isFinite(mainSequence) || !Number.isFinite(massInSolarMasses) || massInSolarMasses <= 0) {
    return null;
  }

  return mainSequence / (10 * massInSolarMasses ** 3);
}

export function calculateStarFinalAgeGyr({ progenitorMassInSolarMasses } = {}) {
  if (!Number.isFinite(progenitorMassInSolarMasses) || progenitorMassInSolarMasses <= 0) {
    return null;
  }

  const mainSequence = calculateMainSequenceLifespanGyr({ massInSolarMasses: progenitorMassInSolarMasses });
  if (!Number.isFinite(mainSequence)) {
    return null;
  }

  const multiplier = 1 + 1 / (4 + progenitorMassInSolarMasses) + 1 / (10 * progenitorMassInSolarMasses ** 3);

  return clampAge(mainSequence * multiplier);
}

function generateSmallStarAgeGyr({ rng, detailDigits } = {}) {
  const normalizedDigits = Number.isFinite(detailDigits) ? Math.max(0, Math.trunc(detailDigits)) : 1;
  let ageGyr = rollDie(6, rng) * 2 + (rollDie(3, rng) - 1);

  if (normalizedDigits > 0) {
    ageGyr -= 1;
    for (let digit = 1; digit <= normalizedDigits; digit++) {
      ageGyr += rollDie(10, rng) / 10 ** digit;
    }
  }

  return ageGyr;
}

function classifyAgeType(star) {
  const designation = String(star?.designation || star?.spectralClass || "")
    .trim()
    .toLowerCase();
  const spectralType = String(star?.spectralType || "")
    .trim()
    .toUpperCase();
  const luminosityClass = normalizeLuminosityClass(star?.luminosityClass);

  if (designation.includes("protostar")) {
    return "protostar";
  }

  if (
    luminosityClass === "BD" ||
    spectralType === "L" ||
    spectralType === "T" ||
    spectralType === "Y" ||
    designation === "bd" ||
    designation.includes("brown dwarf")
  ) {
    return "brown-dwarf";
  }

  if (designation.includes("black hole")) {
    return "black-hole";
  }

  if (designation.includes("pulsar")) {
    return "pulsar";
  }

  if (designation.includes("neutron star")) {
    return "neutron-star";
  }

  if (luminosityClass === "D" || spectralType === "WD" || designation === "wd" || designation.includes("white dwarf")) {
    return "white-dwarf";
  }

  return "normal";
}

function classifyMultipleStarPrimary(primaryStar) {
  const luminosityClass = normalizeLuminosityClass(primaryStar?.luminosityClass);
  const spectralType = String(primaryStar?.spectralType || "")
    .trim()
    .toUpperCase();
  const designation = String(primaryStar?.designation || primaryStar?.spectralClass || "")
    .trim()
    .toLowerCase();

  const isBrownDwarf =
    luminosityClass === "BD" ||
    ["L", "T", "Y"].includes(spectralType) ||
    designation === "bd" ||
    designation.includes("brown dwarf");
  const isWhiteDwarf =
    luminosityClass === "D" || spectralType === "WD" || designation === "wd" || designation.includes("white dwarf");
  const isCompactObject = /pulsar|neutron star|black hole/.test(designation);

  return {
    luminosityClass,
    spectralType,
    designation,
    isBrownDwarf,
    isWhiteDwarf,
    isCompactObject,
  };
}

function rollPresence({ dm, threshold, rng }) {
  const rawRoll = roll2d(rng);
  const total = rawRoll + dm;
  return {
    rawRoll,
    total,
    threshold,
    dm,
    present: total >= threshold,
  };
}

export function calculateMultipleStarPresenceDm({ primaryStar } = {}) {
  const traits = classifyMultipleStarPrimary(primaryStar);
  const notes = [];
  let dm = 0;

  if (["Ia", "Ib", "II", "III", "IV"].includes(traits.luminosityClass)) {
    dm += 1;
    notes.push("+1 for primary Class Ia, Ib, II, III, or IV.");
  }

  if (["V", "VI"].includes(traits.luminosityClass) && ["O", "B", "A", "F"].includes(traits.spectralType)) {
    dm += 1;
    notes.push("+1 for primary Class V/VI Type O, B, A, or F.");
  }

  if (["V", "VI"].includes(traits.luminosityClass) && traits.spectralType === "M") {
    dm -= 1;
    notes.push("-1 for primary Class V/VI Type M.");
  }

  if (traits.isBrownDwarf || traits.isWhiteDwarf) {
    dm -= 1;
    notes.push("-1 for primary brown dwarf or white dwarf.");
  }

  if (traits.isCompactObject) {
    dm -= 1;
    notes.push("-1 for primary pulsar, neutron star, or black hole.");
  }

  return {
    dm,
    notes,
    traits,
  };
}

export function generateMultipleStarLayout({
  primaryStar,
  rng = Math.random,
  threshold = MULTIPLE_STAR_PRESENCE_THRESHOLD,
} = {}) {
  const dmInfo = calculateMultipleStarPresenceDm({ primaryStar });
  const closeAllowed = !CLOSE_RESTRICTED_CLASSES.has(dmInfo.traits.luminosityClass);
  const slots = [];

  const rolls = {
    primaryCompanion: rollPresence({ dm: dmInfo.dm, threshold, rng }),
    close: null,
    near: null,
    far: null,
    closeCompanion: null,
    nearCompanion: null,
    farCompanion: null,
  };

  if (rolls.primaryCompanion.present) {
    slots.push({ id: "primary-companion", orbitClass: "Companion", parentId: "primary" });
  }

  for (const orbitClass of MULTIPLE_STAR_ORBIT_CLASSES) {
    const orbitKey = orbitClass.toLowerCase();

    if (orbitClass === "Close" && !closeAllowed) {
      rolls[orbitKey] = {
        present: false,
        skipped: true,
        reason: "Class Ia, Ib, II, and III primaries cannot have Close secondaries.",
      };
      continue;
    }

    const presenceRoll = rollPresence({ dm: dmInfo.dm, threshold, rng });
    rolls[orbitKey] = presenceRoll;

    if (!presenceRoll.present) {
      continue;
    }

    slots.push({ id: orbitKey, orbitClass, parentId: "primary" });

    const companionRoll = rollPresence({ dm: dmInfo.dm, threshold, rng });
    rolls[`${orbitKey}Companion`] = companionRoll;

    if (companionRoll.present) {
      slots.push({
        id: `${orbitKey}-companion`,
        orbitClass: "Companion",
        parentId: orbitKey,
      });
    }
  }

  return {
    dm: dmInfo.dm,
    dmNotes: dmInfo.notes,
    threshold,
    closeAllowed,
    slots,
    rolls,
    totalStars: 1 + slots.length,
    primaryTraits: dmInfo.traits,
  };
}

function designationLetterForOrdinal(ordinal) {
  if (!Number.isFinite(ordinal) || ordinal < 0) {
    return "A";
  }

  let value = Math.trunc(ordinal);
  let label = "";

  do {
    const remainder = value % 26;
    label = `${DESIGNATION_ALPHABET.charAt(remainder)}${label}`;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

function resolveRootSlotId(slotId, slotsById) {
  let current = slotId || "primary";
  const visited = new Set();

  while (current !== "primary" && slotsById.has(current) && !visited.has(current)) {
    visited.add(current);
    const slot = slotsById.get(current);
    if (normalizeOrbitClass(slot?.orbitClass) !== "Companion") {
      return current;
    }
    current = slot?.parentId || "primary";
  }

  return current || "primary";
}

export function applyStarSystemDesignations({ stars = [], generatedSlotEntries = [] } = {}) {
  if (!Array.isArray(stars) || stars.length === 0) {
    return {
      stars,
      rootDesignations: [],
    };
  }

  const entries = Array.isArray(generatedSlotEntries)
    ? generatedSlotEntries.filter((entry) => entry && Number.isFinite(entry.starIndex) && entry.slot)
    : [];

  const slotsById = new Map(entries.map((entry) => [entry.slot?.id, entry.slot]));
  const rootLetterBySlotId = new Map([["primary", "A"]]);
  let rootOrdinal = 1;

  for (const entry of entries) {
    if (normalizeOrbitClass(entry.slot?.orbitClass) === "Companion") {
      continue;
    }

    if (!rootLetterBySlotId.has(entry.slot.id)) {
      rootLetterBySlotId.set(entry.slot.id, designationLetterForOrdinal(rootOrdinal));
      rootOrdinal += 1;
    }
  }

  const rootHasCompanion = new Map();
  for (const entry of entries) {
    if (normalizeOrbitClass(entry.slot?.orbitClass) !== "Companion") {
      continue;
    }

    const rootSlotId = resolveRootSlotId(entry.slot?.parentId || "primary", slotsById);
    rootHasCompanion.set(rootSlotId, true);
  }

  const updatedStars = stars.map((star, index) => ({
    ...star,
    systemDesignation: index === 0 ? "A" : (star?.systemDesignation ?? null),
    systemDesignationCombined: index === 0 ? "A" : (star?.systemDesignationCombined ?? null),
    systemDesignationBase: index === 0 ? "A" : (star?.systemDesignationBase ?? null),
  }));

  const primaryHasCompanion = Boolean(rootHasCompanion.get("primary"));
  updatedStars[0] = {
    ...updatedStars[0],
    systemDesignation: primaryHasCompanion ? "Aa" : "A",
    systemDesignationCombined: primaryHasCompanion ? "Aab" : "A",
    systemDesignationBase: "A",
  };

  for (const entry of entries) {
    const star = updatedStars[entry.starIndex];
    if (!star) {
      continue;
    }

    const normalizedOrbitClass = normalizeOrbitClass(entry.slot?.orbitClass);
    const rootSlotId =
      normalizedOrbitClass === "Companion"
        ? resolveRootSlotId(entry.slot?.parentId || "primary", slotsById)
        : entry.slot?.id;
    const baseLetter = rootLetterBySlotId.get(rootSlotId) || "A";
    const hasCompanion = Boolean(rootHasCompanion.get(rootSlotId));

    const systemDesignation =
      normalizedOrbitClass === "Companion" ? `${baseLetter}b` : hasCompanion ? `${baseLetter}a` : baseLetter;

    updatedStars[entry.starIndex] = {
      ...star,
      systemDesignation,
      systemDesignationCombined: hasCompanion ? `${baseLetter}ab` : baseLetter,
      systemDesignationBase: baseLetter,
    };
  }

  const rootDesignations = [...rootLetterBySlotId.entries()].map(([slotId, letter]) => ({
    slotId,
    letter,
    hasCompanion: Boolean(rootHasCompanion.get(slotId)),
    combinedDesignation: Boolean(rootHasCompanion.get(slotId)) ? `${letter}ab` : letter,
  }));

  return {
    stars: updatedStars,
    rootDesignations,
  };
}

function nonPrimaryRowForTotal(total) {
  return (
    NON_PRIMARY_TABLE_ROWS.find((row) => total >= row.min && total <= row.max) ??
    NON_PRIMARY_TABLE_ROWS[NON_PRIMARY_TABLE_ROWS.length - 1]
  );
}

function normalizeNonPrimaryColumn(column) {
  const value = String(column || "secondary")
    .trim()
    .toLowerCase();

  if (value === "poststellar" || value === "post-stellar") {
    return "postStellar";
  }

  if (value === "other") {
    return "other";
  }

  if (value === "companion") {
    return "companion";
  }

  return "secondary";
}

function normalizePostStellarDesignation(value) {
  const label = String(value || "")
    .trim()
    .toLowerCase();

  if (label === "wd" || label === "white dwarf") {
    return "WD";
  }

  if (label === "black hole") {
    return "Black Hole";
  }

  if (label === "pulsar") {
    return "Pulsar";
  }

  if (label === "neutron star" || label === "ns") {
    return "Neutron Star";
  }

  return null;
}

function parseSubtypeFromStar(star) {
  if (Number.isInteger(star?.spectralDecimal)) {
    return Math.min(9, Math.max(0, star.spectralDecimal));
  }

  const candidates = [star?.spectralClass, star?.designation];
  for (const candidate of candidates) {
    const match = String(candidate || "")
      .trim()
      .toUpperCase()
      .match(/^[OBAFGKMLTY](\d)/);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function classifyNonPrimaryParent(star) {
  const designation = String(star?.designation || star?.spectralClass || "")
    .trim()
    .toLowerCase();
  const spectralType = String(star?.spectralType || "")
    .trim()
    .toUpperCase();
  const luminosityClass = normalizeLuminosityClass(star?.luminosityClass);
  const subtype = parseSubtypeFromStar(star);
  const postStellarDesignation = normalizePostStellarDesignation(designation);

  if (designation.includes("protostar")) {
    return {
      family: "protostar",
      spectralType: "Protostar",
      luminosityClass,
      subtype,
      postStellarDesignation: null,
    };
  }

  if (
    luminosityClass === "BD" ||
    BROWN_DWARF_STELLAR_TYPES.includes(spectralType) ||
    designation === "bd" ||
    designation.includes("brown dwarf")
  ) {
    return {
      family: "brown-dwarf",
      spectralType,
      luminosityClass: luminosityClass || "BD",
      subtype,
      postStellarDesignation: null,
    };
  }

  if (postStellarDesignation) {
    return {
      family: "post-stellar",
      spectralType,
      luminosityClass: luminosityClass || (postStellarDesignation === "WD" ? "D" : null),
      subtype,
      postStellarDesignation,
    };
  }

  if (NORMAL_STELLAR_TYPES.includes(spectralType)) {
    return {
      family: "stellar",
      spectralType,
      luminosityClass: luminosityClass || "V",
      subtype,
      postStellarDesignation: null,
    };
  }

  return {
    family: "unknown",
    spectralType,
    luminosityClass,
    subtype,
    postStellarDesignation: null,
  };
}

function spectralTypeHotnessIndex(spectralType) {
  return NORMAL_STELLAR_TYPES.indexOf(String(spectralType || "").toUpperCase());
}

function isCandidateHotterThanParent(candidate, parent) {
  const candidateTypeIndex = spectralTypeHotnessIndex(candidate?.spectralType);
  const parentTypeIndex = spectralTypeHotnessIndex(parent?.spectralType);

  if (candidateTypeIndex < 0 || parentTypeIndex < 0) {
    return false;
  }

  if (candidateTypeIndex < parentTypeIndex) {
    return true;
  }

  if (candidateTypeIndex > parentTypeIndex) {
    return false;
  }

  const candidateSubtype = Number.isFinite(candidate?.subtype) ? candidate.subtype : 9;
  const parentSubtype = Number.isFinite(parent?.subtype) ? parent.subtype : 9;
  return candidateSubtype < parentSubtype;
}

function coolerNormalSpectralType(spectralType) {
  switch (String(spectralType || "").toUpperCase()) {
    case "O":
      return "B";
    case "B":
      return "A";
    case "A":
      return "F";
    case "F":
      return "G";
    case "G":
      return "K";
    case "K":
      return "M";
    default:
      return "M";
  }
}

function coolerBrownDwarfType(spectralType) {
  switch (String(spectralType || "").toUpperCase()) {
    case "L":
      return "T";
    case "T":
      return "Y";
    default:
      return "Y";
  }
}

function classIvIsUnsupportedAt(spectralType, subtype) {
  if (String(spectralType || "").toUpperCase() === "M") {
    return true;
  }

  return String(spectralType || "").toUpperCase() === "K" && Number.isFinite(subtype) && subtype > 4;
}

function rollNonPrimaryColumn({ column, dm, rng }) {
  const rawRoll = roll2d(rng);
  const total = rawRoll + dm;
  const row = nonPrimaryRowForTotal(total);
  const normalizedColumn = normalizeNonPrimaryColumn(column);

  return {
    column: normalizedColumn,
    rawRoll,
    total,
    result: row[normalizedColumn],
  };
}

function mapOtherColumnResultToDescriptor(otherResult) {
  if (otherResult === "NS") {
    return {
      mode: "designation",
      designation: "Neutron Star",
      objectType: "peculiar",
      luminosityClass: null,
      spectralType: null,
      spectralDecimal: null,
    };
  }

  if (otherResult === "D") {
    return {
      mode: "designation",
      designation: "WD",
      objectType: "degenerate",
      luminosityClass: "D",
      spectralType: "WD",
      spectralDecimal: null,
    };
  }

  return {
    mode: "spectral",
    spectralType: "L",
    luminosityClass: "BD",
    spectralDecimal: 5,
    objectType: "substellar",
  };
}

function descriptorFromPrimaryRoll(primaryRoll) {
  if (!primaryRoll) {
    return null;
  }

  if (primaryRoll.spectralType === "WD") {
    return {
      mode: "designation",
      designation: "WD",
      objectType: "degenerate",
      luminosityClass: "D",
      spectralType: "WD",
      spectralDecimal: null,
    };
  }

  if (primaryRoll.objectType === "peculiar") {
    return {
      mode: "designation",
      designation: primaryRoll.designation,
      objectType: "peculiar",
      luminosityClass: null,
      spectralType: null,
      spectralDecimal: null,
    };
  }

  if (primaryRoll.spectralType) {
    return {
      mode: "spectral",
      spectralType: primaryRoll.spectralType,
      luminosityClass: normalizeLuminosityClass(primaryRoll.luminosityClass) || "V",
      spectralDecimal: Number.isFinite(primaryRoll.spectralDecimal) ? primaryRoll.spectralDecimal : 5,
      objectType: primaryRoll.objectType || "stellar",
    };
  }

  return null;
}

function withSiblingSubtypeShift({ spectralType, subtype, roll }) {
  const parentType = String(spectralType || "").toUpperCase();
  const parentSubtype = Number.isFinite(subtype) ? subtype : 5;

  if (!NORMAL_STELLAR_TYPES.includes(parentType) && !BROWN_DWARF_STELLAR_TYPES.includes(parentType)) {
    return { spectralType: "G", subtype: 5 };
  }

  let shiftedSubtype = parentSubtype - roll;
  let shiftedType = parentType;

  if (shiftedSubtype < 0) {
    shiftedType = NORMAL_STELLAR_TYPES.includes(parentType)
      ? coolerNormalSpectralType(parentType)
      : coolerBrownDwarfType(parentType);
    shiftedSubtype += 10;
  }

  return {
    spectralType: shiftedType,
    subtype: Math.min(9, Math.max(0, shiftedSubtype)),
  };
}

function resolveNonPrimaryRelation({ relation, parentTraits, rng }) {
  const normalizedRelation = String(relation || "Sibling").trim();

  if (normalizedRelation === "Twin") {
    const twinVariancePct = (rollDie(6, rng) - 1) / 100;

    if (parentTraits.family === "post-stellar") {
      return {
        descriptor: {
          mode: "designation",
          designation: parentTraits.postStellarDesignation,
          objectType: parentTraits.postStellarDesignation === "WD" ? "degenerate" : "peculiar",
          luminosityClass: parentTraits.postStellarDesignation === "WD" ? "D" : null,
          spectralType: parentTraits.postStellarDesignation === "WD" ? "WD" : null,
          spectralDecimal: null,
          massScale: 1 - twinVariancePct,
          diameterScale: 1 - twinVariancePct,
        },
        relation: "Twin",
      };
    }

    if (parentTraits.family === "protostar") {
      return {
        descriptor: {
          mode: "designation",
          designation: "Protostar",
          objectType: "peculiar",
          spectralType: null,
          luminosityClass: null,
          spectralDecimal: null,
          massScale: 1 - twinVariancePct,
          diameterScale: 1 - twinVariancePct,
        },
        relation: "Twin",
      };
    }

    return {
      descriptor: {
        mode: "spectral",
        spectralType:
          parentTraits.family === "brown-dwarf" && !BROWN_DWARF_STELLAR_TYPES.includes(parentTraits.spectralType)
            ? "L"
            : parentTraits.spectralType || "G",
        luminosityClass: parentTraits.luminosityClass || "V",
        spectralDecimal: Number.isFinite(parentTraits.subtype) ? parentTraits.subtype : 5,
        objectType: parentTraits.family === "brown-dwarf" ? "substellar" : "stellar",
        massScale: 1 - twinVariancePct,
        diameterScale: 1 - twinVariancePct,
      },
      relation: "Twin",
    };
  }

  if (normalizedRelation === "Sibling") {
    if (parentTraits.family === "post-stellar") {
      const massReductionPct = rollDie(6, rng) * 0.1;
      return {
        descriptor: {
          mode: "designation",
          designation: parentTraits.postStellarDesignation,
          objectType: parentTraits.postStellarDesignation === "WD" ? "degenerate" : "peculiar",
          luminosityClass: parentTraits.postStellarDesignation === "WD" ? "D" : null,
          spectralType: parentTraits.postStellarDesignation === "WD" ? "WD" : null,
          spectralDecimal: null,
          massScale: Math.max(0.1, 1 - massReductionPct),
          diameterScale: Math.max(0.1, 1 - massReductionPct),
        },
        relation: "Sibling",
      };
    }

    if (parentTraits.family === "protostar") {
      const massReductionPct = rollDie(6, rng) * 0.1;
      return {
        descriptor: {
          mode: "designation",
          designation: "Protostar",
          objectType: "peculiar",
          spectralType: null,
          luminosityClass: null,
          spectralDecimal: null,
          massScale: Math.max(0.1, 1 - massReductionPct),
          diameterScale: Math.max(0.1, 1 - massReductionPct),
        },
        relation: "Sibling",
      };
    }

    const roll = rollDie(6, rng);
    const siblingType = withSiblingSubtypeShift({
      spectralType:
        parentTraits.family === "brown-dwarf" && !BROWN_DWARF_STELLAR_TYPES.includes(parentTraits.spectralType)
          ? "L"
          : parentTraits.spectralType,
      subtype: parentTraits.subtype,
      roll,
    });

    return {
      descriptor: {
        mode: "spectral",
        spectralType: siblingType.spectralType,
        luminosityClass:
          BROWN_DWARF_STELLAR_TYPES.includes(siblingType.spectralType) || parentTraits.family === "brown-dwarf"
            ? "BD"
            : parentTraits.luminosityClass || "V",
        spectralDecimal: siblingType.subtype,
        objectType:
          BROWN_DWARF_STELLAR_TYPES.includes(siblingType.spectralType) || parentTraits.family === "brown-dwarf"
            ? "substellar"
            : "stellar",
      },
      relation: "Sibling",
    };
  }

  if (normalizedRelation === "Lesser") {
    if (parentTraits.family === "post-stellar") {
      const mappedDesignation =
        parentTraits.postStellarDesignation === "Black Hole"
          ? "Neutron Star"
          : parentTraits.postStellarDesignation === "Neutron Star" || parentTraits.postStellarDesignation === "Pulsar"
            ? "WD"
            : "BD";

      if (mappedDesignation === "BD") {
        return {
          descriptor: {
            mode: "spectral",
            spectralType: "L",
            luminosityClass: "BD",
            spectralDecimal: 6,
            objectType: "substellar",
          },
          relation: "Lesser",
        };
      }

      return {
        descriptor: {
          mode: "designation",
          designation: mappedDesignation,
          objectType: mappedDesignation === "WD" ? "degenerate" : "peculiar",
          luminosityClass: mappedDesignation === "WD" ? "D" : null,
          spectralType: mappedDesignation === "WD" ? "WD" : null,
          spectralDecimal: null,
        },
        relation: "Lesser",
      };
    }

    if (parentTraits.family === "protostar") {
      return {
        descriptor: {
          mode: "designation",
          designation: "Protostar",
          objectType: "peculiar",
          spectralType: null,
          luminosityClass: null,
          spectralDecimal: null,
          massScale: 0.85,
          diameterScale: 0.9,
        },
        relation: "Lesser",
      };
    }

    let spectralType =
      parentTraits.family === "brown-dwarf"
        ? coolerBrownDwarfType(parentTraits.spectralType || "L")
        : coolerNormalSpectralType(parentTraits.spectralType || "G");
    let luminosityClass =
      parentTraits.family === "brown-dwarf" ? "BD" : normalizeLuminosityClass(parentTraits.luminosityClass) || "V";
    const subtypeResult = generateStarSubtype({
      spectralType,
      luminosityClass,
      isPrimary: false,
      rng,
      allowStraightSubtype: true,
    });
    const subtype = Number.isFinite(subtypeResult.subtype) ? subtypeResult.subtype : 5;

    if (String(parentTraits.spectralType || "").toUpperCase() === "M") {
      const parentSubtype = Number.isFinite(parentTraits.subtype) ? parentTraits.subtype : 9;
      if (subtype > parentSubtype) {
        return {
          descriptor: {
            mode: "spectral",
            spectralType: "L",
            luminosityClass: "BD",
            spectralDecimal: subtype,
            objectType: "substellar",
          },
          relation: "Lesser",
        };
      }
    }

    if (luminosityClass === "IV" && classIvIsUnsupportedAt(spectralType, subtype)) {
      luminosityClass = "V";
    }

    return {
      descriptor: {
        mode: "spectral",
        spectralType,
        luminosityClass,
        spectralDecimal: subtype,
        objectType: BROWN_DWARF_STELLAR_TYPES.includes(spectralType) ? "substellar" : "stellar",
      },
      relation: "Lesser",
    };
  }

  return null;
}

export function calculateNonPrimaryStarDm({ parentStar } = {}) {
  const parentLuminosityClass = normalizeLuminosityClass(parentStar?.luminosityClass);
  if (["III", "IV"].includes(parentLuminosityClass)) {
    return {
      dm: -1,
      notes: ["-1 DM for Class III or IV parent star."],
    };
  }

  return {
    dm: 0,
    notes: [],
  };
}

export function generateNonPrimaryStar({ parentStar, column = "secondary", rng = Math.random } = {}) {
  const parentTraits = classifyNonPrimaryParent(parentStar);
  const baseColumn = normalizeNonPrimaryColumn(column);
  const forcedPostStellarColumn = parentTraits.family === "post-stellar";
  const effectiveColumn = forcedPostStellarColumn ? "postStellar" : baseColumn;
  const dmInfo = calculateNonPrimaryStarDm({ parentStar });
  const rolls = [];
  const notes = [...dmInfo.notes];

  if (parentTraits.family === "brown-dwarf") {
    notes.push("Brown dwarf parent forced to Sibling determination.");
    const siblingResolved = resolveNonPrimaryRelation({ relation: "Sibling", parentTraits, rng });
    return {
      column: effectiveColumn,
      relation: siblingResolved.relation,
      descriptor: siblingResolved.descriptor,
      dm: dmInfo.dm,
      rolls,
      notes,
      parentTraits,
    };
  }

  let result = rollNonPrimaryColumn({ column: effectiveColumn, dm: dmInfo.dm, rng });
  rolls.push(result);
  let relation = result.result;

  if (relation === "Other") {
    let safety = 0;
    do {
      result = rollNonPrimaryColumn({ column: "other", dm: dmInfo.dm, rng });
      rolls.push(result);
      relation = result.result;
      safety += 1;
    } while (relation === "Other" && safety < 8);
  }

  if (relation === "Random") {
    const rolledPrimaryLike = generatePrimaryStar({ rng });
    const randomDescriptor = descriptorFromPrimaryRoll(rolledPrimaryLike);

    if (randomDescriptor) {
      const candidate = {
        spectralType: randomDescriptor.spectralType,
        subtype: randomDescriptor.spectralDecimal,
      };

      if (
        parentTraits.family === "stellar" &&
        randomDescriptor.mode === "spectral" &&
        NORMAL_STELLAR_TYPES.includes(String(candidate.spectralType || "").toUpperCase()) &&
        isCandidateHotterThanParent(candidate, parentTraits)
      ) {
        notes.push("Random result was hotter than parent and was converted to Lesser.");
        const lesserResolved = resolveNonPrimaryRelation({ relation: "Lesser", parentTraits, rng });
        return {
          column: effectiveColumn,
          relation: lesserResolved.relation,
          descriptor: lesserResolved.descriptor,
          dm: dmInfo.dm,
          rolls,
          notes,
          parentTraits,
        };
      }

      return {
        column: effectiveColumn,
        relation,
        descriptor: randomDescriptor,
        dm: dmInfo.dm,
        rolls,
        notes,
        parentTraits,
      };
    }

    relation = "Lesser";
    notes.push("Random result could not be resolved and was converted to Lesser.");
  }

  if (["Lesser", "Sibling", "Twin"].includes(relation)) {
    const resolved = resolveNonPrimaryRelation({ relation, parentTraits, rng });
    if (resolved?.descriptor) {
      return {
        column: effectiveColumn,
        relation: resolved.relation,
        descriptor: resolved.descriptor,
        dm: dmInfo.dm,
        rolls,
        notes,
        parentTraits,
      };
    }
  }

  if (["NS", "D", "BD"].includes(relation)) {
    return {
      column: effectiveColumn,
      relation: "Other",
      descriptor: mapOtherColumnResultToDescriptor(relation),
      dm: dmInfo.dm,
      rolls,
      notes,
      parentTraits,
    };
  }

  notes.push("Fallback applied: unresolved relation converted to Sibling.");
  const fallback = resolveNonPrimaryRelation({ relation: "Sibling", parentTraits, rng });
  return {
    column: effectiveColumn,
    relation: fallback.relation,
    descriptor: fallback.descriptor,
    dm: dmInfo.dm,
    rolls,
    notes,
    parentTraits,
  };
}

function deriveProgenitorMass({ deadStarMass, remnantType, rng }) {
  if (!Number.isFinite(deadStarMass) || deadStarMass <= 0) {
    return null;
  }

  const massFactor = rollDie(3, rng) + 2;
  let progenitorMass = deadStarMass * massFactor;

  if (remnantType === "neutron-star" || remnantType === "pulsar") {
    progenitorMass = Math.max(8, progenitorMass);
  }

  if (remnantType === "black-hole") {
    progenitorMass = Math.max(20, progenitorMass);
  }

  return {
    massFactor,
    progenitorMass,
  };
}

function resolvePostStellarTypeFromProgenitorMass({ progenitorMassInSolarMasses, baseAgeType }) {
  if (!Number.isFinite(progenitorMassInSolarMasses) || progenitorMassInSolarMasses <= 0) {
    return baseAgeType;
  }

  if (progenitorMassInSolarMasses >= 20) {
    return "black-hole";
  }

  if (progenitorMassInSolarMasses >= 8) {
    return baseAgeType === "pulsar" ? "pulsar" : "neutron-star";
  }

  return "white-dwarf";
}

function solveProgenitorMassForFinalAgeCap({
  startingProgenitorMass,
  targetFinalAgeGyr,
  maxProgenitorMass = MAX_PROGENITOR_MASS_SEARCH,
} = {}) {
  if (!Number.isFinite(startingProgenitorMass) || startingProgenitorMass <= 0) {
    return null;
  }

  if (!Number.isFinite(targetFinalAgeGyr) || targetFinalAgeGyr <= 0) {
    return null;
  }

  let lowMass = startingProgenitorMass;
  let highMass = startingProgenitorMass;

  const lowFinalAge = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: lowMass });
  if (Number.isFinite(lowFinalAge) && lowFinalAge <= targetFinalAgeGyr + AGE_COMPARISON_EPSILON) {
    return lowMass;
  }

  let highFinalAge = lowFinalAge;
  while (
    (!Number.isFinite(highFinalAge) || highFinalAge > targetFinalAgeGyr + AGE_COMPARISON_EPSILON) &&
    highMass < maxProgenitorMass
  ) {
    highMass = Math.min(maxProgenitorMass, highMass * 1.5 + 0.1);
    highFinalAge = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: highMass });
  }

  if (!Number.isFinite(highFinalAge) || highFinalAge > targetFinalAgeGyr + AGE_COMPARISON_EPSILON) {
    return null;
  }

  for (let i = 0; i < PROGENITOR_MASS_BINARY_SEARCH_STEPS; i++) {
    const midMass = (lowMass + highMass) / 2;
    const midFinalAge = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: midMass });

    if (!Number.isFinite(midFinalAge)) {
      lowMass = midMass;
      continue;
    }

    if (midFinalAge <= targetFinalAgeGyr + AGE_COMPARISON_EPSILON) {
      highMass = midMass;
    } else {
      lowMass = midMass;
    }
  }

  return highMass;
}

function applyPostStellarMainSequenceCompatibility({ postStellarAgeEntry, primaryMainSequenceLifespanGyr } = {}) {
  if (!postStellarAgeEntry?.isPostStellar) {
    return postStellarAgeEntry;
  }

  if (!Number.isFinite(primaryMainSequenceLifespanGyr) || primaryMainSequenceLifespanGyr <= 0) {
    return postStellarAgeEntry;
  }

  const currentFinalAgeGyr = Number(postStellarAgeEntry.progenitorFinalAgeGyr);
  const postStellarAgeGyr = Number(postStellarAgeEntry.postStellarAgeGyr);
  const currentProgenitorMass = Number(postStellarAgeEntry.progenitorMassInSolarMasses);

  if (
    !Number.isFinite(currentFinalAgeGyr) ||
    !Number.isFinite(postStellarAgeGyr) ||
    !Number.isFinite(currentProgenitorMass)
  ) {
    return {
      ...postStellarAgeEntry,
      mainSequenceCompatibilityAdjustment: {
        applied: false,
        unresolved: true,
        reason: "Missing post-stellar progenitor data for adjustment.",
        primaryMainSequenceLifespanGyr,
      },
    };
  }

  const currentTotalAge = currentFinalAgeGyr + postStellarAgeGyr;
  if (currentTotalAge <= primaryMainSequenceLifespanGyr + AGE_COMPARISON_EPSILON) {
    return {
      ...postStellarAgeEntry,
      mainSequenceCompatibilityAdjustment: {
        applied: false,
        unresolved: false,
        reason: "Post-stellar age already compatible with primary main-sequence lifespan.",
        primaryMainSequenceLifespanGyr,
      },
    };
  }

  const targetFinalAgeGyr = primaryMainSequenceLifespanGyr - postStellarAgeGyr;
  if (targetFinalAgeGyr <= 0) {
    return {
      ...postStellarAgeEntry,
      mainSequenceCompatibilityAdjustment: {
        applied: false,
        unresolved: true,
        reason: "Post-stellar elapsed age alone exceeds primary main-sequence lifespan.",
        primaryMainSequenceLifespanGyr,
        targetFinalAgeGyr,
      },
    };
  }

  const adjustedProgenitorMass = solveProgenitorMassForFinalAgeCap({
    startingProgenitorMass: currentProgenitorMass,
    targetFinalAgeGyr,
  });

  if (!Number.isFinite(adjustedProgenitorMass)) {
    return {
      ...postStellarAgeEntry,
      mainSequenceCompatibilityAdjustment: {
        applied: false,
        unresolved: true,
        reason: "Unable to find a progenitor mass that satisfies the primary lifespan cap.",
        primaryMainSequenceLifespanGyr,
        targetFinalAgeGyr,
      },
    };
  }

  const adjustedFinalAgeGyr = calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: adjustedProgenitorMass });
  if (!Number.isFinite(adjustedFinalAgeGyr)) {
    return {
      ...postStellarAgeEntry,
      mainSequenceCompatibilityAdjustment: {
        applied: false,
        unresolved: true,
        reason: "Adjusted progenitor mass produced an invalid final age.",
        primaryMainSequenceLifespanGyr,
        targetFinalAgeGyr,
      },
    };
  }

  const deadStarMass = Number(postStellarAgeEntry.star?.massInSolarMasses);
  const adjustedMassFactor =
    Number.isFinite(deadStarMass) && deadStarMass > 0 ? adjustedProgenitorMass / deadStarMass : null;
  const adjustedAgeType = resolvePostStellarTypeFromProgenitorMass({
    progenitorMassInSolarMasses: adjustedProgenitorMass,
    baseAgeType: postStellarAgeEntry.ageType,
  });
  const remnantTypeChanged = adjustedAgeType !== postStellarAgeEntry.ageType;
  const adjustedTotalAgeGyr = clampAge(adjustedFinalAgeGyr + postStellarAgeGyr);

  return {
    ...postStellarAgeEntry,
    ageType: adjustedAgeType,
    ageGyr: adjustedTotalAgeGyr,
    progenitorMassInSolarMasses: roundTo(adjustedProgenitorMass, 6),
    progenitorMassFactor: Number.isFinite(adjustedMassFactor) ? roundTo(adjustedMassFactor, 6) : null,
    progenitorFinalAgeGyr: clampAge(adjustedFinalAgeGyr),
    mainSequenceCompatibilityAdjustment: {
      applied: true,
      unresolved: false,
      reason: "Adjusted post-stellar progenitor mass to satisfy primary main-sequence lifespan.",
      primaryMainSequenceLifespanGyr,
      targetFinalAgeGyr,
      originalProgenitorMassInSolarMasses: currentProgenitorMass,
      adjustedProgenitorMassInSolarMasses: roundTo(adjustedProgenitorMass, 6),
      remnantTypeChanged,
      originalAgeType: postStellarAgeEntry.ageType,
      adjustedAgeType,
    },
  };
}

function generateNormalStarAge({ massInSolarMasses, luminosityClass, rng, detailDigits }) {
  const mainSequenceLifespanGyr = calculateMainSequenceLifespanGyr({ massInSolarMasses });
  if (!Number.isFinite(mainSequenceLifespanGyr)) {
    return null;
  }

  const normalizedClass = normalizeLuminosityClass(luminosityClass) || "V";
  const subgiantLifespanGyr = calculateSubgiantLifespanGyr({
    massInSolarMasses,
    mainSequenceLifespanGyr,
  });
  const giantLifespanGyr = calculateGiantLifespanGyr({
    massInSolarMasses,
    mainSequenceLifespanGyr,
  });

  let ageGyr;
  let stage;
  let fractionRoll = null;

  if (normalizedClass === "IV") {
    fractionRoll = rollPercentile(rng);
    ageGyr = mainSequenceLifespanGyr + subgiantLifespanGyr * (fractionRoll / 100);
    stage = "subgiant";
  } else if (GIANT_AGE_CLASSES.has(normalizedClass)) {
    fractionRoll = rollPercentile(rng);
    ageGyr = mainSequenceLifespanGyr + subgiantLifespanGyr + giantLifespanGyr * (fractionRoll / 100);
    stage = "giant";
  } else if (massInSolarMasses < SMALL_STAR_MASS_THRESHOLD) {
    ageGyr = generateSmallStarAgeGyr({ rng, detailDigits });
    stage = "main-sequence-small";
  } else {
    fractionRoll = rollPercentile(rng);
    ageGyr = mainSequenceLifespanGyr * (fractionRoll / 100);
    stage = "main-sequence-large";
  }

  if (massInSolarMasses < PROTOSTAR_MINIMUM_MASS_THRESHOLD) {
    ageGyr = Math.max(MINIMUM_NORMAL_STAR_AGE_GYR, ageGyr);
  }

  const normalizedAgeGyr = clampAge(ageGyr);
  return {
    ageGyr: normalizedAgeGyr,
    stage,
    isPrimordial: Number.isFinite(normalizedAgeGyr) && normalizedAgeGyr < 0.1,
    fractionRoll,
    mainSequenceLifespanGyr,
    subgiantLifespanGyr,
    giantLifespanGyr,
  };
}

export function generateStarAge({ star, rng = Math.random, detailDigits = 1 } = {}) {
  if (!star || typeof star !== "object") {
    return null;
  }

  const ageType = classifyAgeType(star);
  const massInSolarMasses = Number(star.massInSolarMasses);

  if (ageType === "protostar") {
    const remnantRoll = roll2d10(rng);
    const ageGyr = clampAge(0.01 / remnantRoll);
    return {
      ageGyr,
      ageType,
      isPrimordial: Number.isFinite(ageGyr) && ageGyr < 0.1,
      postStellarAgeGyr: null,
      progenitorMassInSolarMasses: null,
      progenitorFinalAgeGyr: null,
      isPostStellar: false,
      remnantRoll,
    };
  }

  if (ageType === "brown-dwarf") {
    const ageGyr = clampAge(generateSmallStarAgeGyr({ rng, detailDigits }));
    return {
      ageGyr,
      ageType,
      isPrimordial: Number.isFinite(ageGyr) && ageGyr < 0.1,
      postStellarAgeGyr: null,
      progenitorMassInSolarMasses: null,
      progenitorFinalAgeGyr: null,
      isPostStellar: false,
    };
  }

  if (["white-dwarf", "pulsar", "neutron-star", "black-hole"].includes(ageType)) {
    const postStellarAgeGyr =
      ageType === "pulsar" ? 0.1 / roll2d10(rng) : generateSmallStarAgeGyr({ rng, detailDigits });
    const progenitor = deriveProgenitorMass({
      deadStarMass: massInSolarMasses,
      remnantType: ageType,
      rng,
    });
    const progenitorFinalAgeGyr = progenitor
      ? calculateStarFinalAgeGyr({ progenitorMassInSolarMasses: progenitor.progenitorMass })
      : null;
    const totalAgeGyr = clampAge((progenitorFinalAgeGyr ?? 0) + postStellarAgeGyr);

    return {
      ageGyr: totalAgeGyr,
      ageType,
      isPrimordial: Number.isFinite(totalAgeGyr) && totalAgeGyr < 0.1,
      postStellarAgeGyr,
      progenitorMassInSolarMasses: progenitor?.progenitorMass ?? null,
      progenitorMassFactor: progenitor?.massFactor ?? null,
      progenitorFinalAgeGyr,
      isPostStellar: true,
    };
  }

  const normalAge = generateNormalStarAge({
    massInSolarMasses,
    luminosityClass: star.luminosityClass,
    rng,
    detailDigits,
  });

  if (!normalAge) {
    const fallbackAgeGyr = clampAge(generateSmallStarAgeGyr({ rng, detailDigits }));
    return {
      ageGyr: fallbackAgeGyr,
      ageType: "unusual",
      isPrimordial: Number.isFinite(fallbackAgeGyr) && fallbackAgeGyr < 0.1,
      postStellarAgeGyr: null,
      progenitorMassInSolarMasses: null,
      progenitorFinalAgeGyr: null,
      isPostStellar: false,
      stage: "fallback-small-star",
      fractionRoll: null,
      mainSequenceLifespanGyr: null,
      subgiantLifespanGyr: null,
      giantLifespanGyr: null,
    };
  }

  return {
    ageType,
    postStellarAgeGyr: null,
    progenitorMassInSolarMasses: null,
    progenitorFinalAgeGyr: null,
    isPostStellar: false,
    ...normalAge,
  };
}

export function generateSystemAge({ stars, rng = Math.random, detailDigits = 1 } = {}) {
  if (!Array.isArray(stars) || stars.length === 0) {
    return null;
  }

  const starAges = stars.map((star) => generateStarAge({ star, rng, detailDigits }));
  const primaryAgeProfile = starAges[0] ?? null;
  const primaryAgeGyr = primaryAgeProfile?.ageGyr ?? null;
  const primaryMainSequenceLifespanGyr = Number(primaryAgeProfile?.mainSequenceLifespanGyr);
  const hasMainSequencePrimaryLifespan =
    String(primaryAgeProfile?.stage || "").startsWith("main-sequence") &&
    Number.isFinite(primaryMainSequenceLifespanGyr);

  const adjustedStarAges = hasMainSequencePrimaryLifespan
    ? starAges.map((entry, index) =>
        index === 0
          ? entry
          : applyPostStellarMainSequenceCompatibility({
              postStellarAgeEntry: entry,
              primaryMainSequenceLifespanGyr,
            }),
      )
    : starAges;

  const postStellarMinimumAgeGyr = adjustedStarAges
    .slice(1)
    .filter((entry) => entry?.isPostStellar && Number.isFinite(entry.ageGyr))
    .reduce((maxAge, entry) => Math.max(maxAge, entry.ageGyr), Number.NEGATIVE_INFINITY);

  const hasPostStellarConstraint = Number.isFinite(postStellarMinimumAgeGyr);
  let systemAgeGyr = primaryAgeGyr;

  if (hasPostStellarConstraint) {
    if (Number.isFinite(primaryAgeGyr)) {
      systemAgeGyr = Math.max(primaryAgeGyr, postStellarMinimumAgeGyr);
    } else {
      systemAgeGyr = postStellarMinimumAgeGyr;
    }
  }

  if (!Number.isFinite(systemAgeGyr)) {
    systemAgeGyr = adjustedStarAges
      .filter((entry) => Number.isFinite(entry?.ageGyr))
      .reduce((maxAge, entry) => Math.max(maxAge, entry.ageGyr), Number.NEGATIVE_INFINITY);
  }

  const clampedSystemAgeGyr = clampAge(systemAgeGyr);

  return {
    systemAgeGyr: clampedSystemAgeGyr,
    primaryAgeGyr,
    primaryMainSequenceLifespanGyr: hasMainSequencePrimaryLifespan ? primaryMainSequenceLifespanGyr : null,
    postStellarMinimumAgeGyr: hasPostStellarConstraint ? postStellarMinimumAgeGyr : null,
    usesPostStellarMinimum: hasPostStellarConstraint,
    usesMainSequenceCompatibilityAdjustment: adjustedStarAges.some(
      (entry, index) => index > 0 && entry?.mainSequenceCompatibilityAdjustment?.applied,
    ),
    hasUnresolvedMainSequenceCompatibility: adjustedStarAges.some(
      (entry, index) => index > 0 && entry?.mainSequenceCompatibilityAdjustment?.unresolved,
    ),
    isPrimordial: Number.isFinite(clampedSystemAgeGyr) && clampedSystemAgeGyr < 0.1,
    starAges: adjustedStarAges,
  };
}

function rowForTotal(total) {
  return (
    PRIMARY_STAR_ROWS.find((row) => total >= row.min && total <= row.max) ??
    PRIMARY_STAR_ROWS[PRIMARY_STAR_ROWS.length - 1]
  );
}

function isClassToken(value) {
  return typeof value === "string" && value.startsWith("Class ");
}

function classToLuminosity(value) {
  if (!isClassToken(value)) return null;
  return value.replace("Class ", "").trim();
}

function isNumericSubtypeType(spectralType) {
  return ["O", "B", "A", "F", "G", "K", "M"].includes(spectralType);
}

export function generateStarSubtype({
  spectralType,
  luminosityClass,
  isPrimary = false,
  rng = Math.random,
  allowStraightSubtype = false,
} = {}) {
  if (spectralType === "WD" || !spectralType) {
    return {
      subtype: null,
      method: "none",
      subtypeRoll: null,
      adjustedForClassIvK: false,
    };
  }

  let subtype;
  let method;
  let subtypeRoll = null;

  if (spectralType === "M" && isPrimary) {
    subtypeRoll = roll2d(rng);
    subtype = PRIMARY_M_SUBTYPE_BY_2D[subtypeRoll];
    method = "m-primary";
  } else if (isNumericSubtypeType(spectralType) || (spectralType === "M" && !isPrimary)) {
    if (allowStraightSubtype && spectralType === "M" && !isPrimary) {
      subtype = Math.floor(rng() * 10);
      method = "straight";
    } else {
      subtypeRoll = roll2d(rng);
      subtype = NUMERIC_SUBTYPE_BY_2D[subtypeRoll];
      method = "numeric";
    }
  } else {
    subtype = Math.floor(rng() * 10);
    method = "straight";
  }

  let adjustedForClassIvK = false;
  if (spectralType === "K" && luminosityClass === "IV" && subtype > 4) {
    subtype -= 5;
    adjustedForClassIvK = true;
  }

  return {
    subtype,
    method,
    subtypeRoll,
    adjustedForClassIvK,
  };
}

function inferPersistedSpectralClass({ spectralType, luminosityClass, designation }) {
  if (PERSISTED_SPECTRAL_TYPES.has(spectralType)) {
    return spectralType;
  }

  if (luminosityClass === "D") {
    return "WD";
  }

  const compactObjectRegex = /black hole|pulsar|neutron star/i;
  if (compactObjectRegex.test(String(designation || ""))) {
    return "WD";
  }

  return "G";
}

function rollTypeWithConstraints({ dm, luminosityClass, rng }) {
  const notes = [];
  const rawRoll = roll2d(rng);
  let total = rawRoll + dm;
  let row = rowForTotal(total);
  let spectralType = row.type;
  let hotRoll = null;

  if (luminosityClass === "IV" && spectralType === "M") {
    total += 5;
    row = rowForTotal(total);
    spectralType = row.type;
    notes.push("Class IV remapped an M-type Type roll by adding +5.");
  }

  if (spectralType === "Hot") {
    hotRoll = roll2d(rng);
    spectralType = rowForTotal(hotRoll).hot;

    if (luminosityClass === "IV" && spectralType === "O") {
      spectralType = "B";
      notes.push("Class IV remapped an O-type Hot roll to B.");
    }
  }

  if (luminosityClass === "VI" && spectralType === "F") {
    spectralType = "G";
    notes.push("Class VI remapped F to G.");
  } else if (luminosityClass === "VI" && spectralType === "A") {
    spectralType = "B";
    notes.push("Class VI remapped A to B.");
  }

  return {
    spectralType,
    notes,
    rolls: {
      rawRoll,
      total,
      dm,
      hotRoll,
    },
  };
}

export function generatePrimaryStar({ dm = 0, rng = Math.random } = {}) {
  const normalizedDm = Number.isFinite(dm) ? Math.trunc(dm) : 0;
  const notes = [];

  const primaryRawRoll = roll2d(rng);
  const primaryTotal = primaryRawRoll + normalizedDm;
  const primaryRow = rowForTotal(primaryTotal);

  let spectralType = null;
  let spectralDecimal = null;
  let luminosityClass = "V";
  let designation = null;
  let objectType = "stellar";

  const rolls = {
    primary: { rawRoll: primaryRawRoll, total: primaryTotal, dm: normalizedDm },
    hot: null,
    special: null,
    unusual: null,
    peculiar: null,
    giants: null,
    typeRoll: null,
  };

  if (primaryRow.type === "Hot") {
    const hotRawRoll = roll2d(rng);
    spectralType = rowForTotal(hotRawRoll).hot;
    rolls.hot = { rawRoll: hotRawRoll };
  } else if (primaryRow.type === "Special") {
    const specialRawRoll = roll2d(rng);
    let specialResult = rowForTotal(specialRawRoll).special;
    rolls.special = { rawRoll: specialRawRoll, result: specialResult };

    if (specialResult === "Unusual") {
      const unusualRawRoll = roll2d(rng);
      specialResult = rowForTotal(unusualRawRoll).unusual;
      rolls.unusual = { rawRoll: unusualRawRoll, result: specialResult };
    }

    if (specialResult === "Peculiar") {
      const peculiarRawRoll = roll2d(rng);
      designation = rowForTotal(peculiarRawRoll).peculiar;
      objectType = "peculiar";
      luminosityClass = null;
      rolls.peculiar = { rawRoll: peculiarRawRoll, result: designation };
    } else if (specialResult === "D") {
      spectralType = "WD";
      luminosityClass = "D";
      objectType = "degenerate";
    } else if (specialResult === "BD") {
      const index = Math.min(BROWN_DWARF_TYPES.length - 1, Math.floor(rng() * BROWN_DWARF_TYPES.length));
      spectralType = BROWN_DWARF_TYPES[index];
      luminosityClass = "BD";
      objectType = "substellar";
    } else if (specialResult === "Giants" || isClassToken(specialResult)) {
      let classToken = specialResult;

      if (specialResult === "Giants" || specialResult === "Class III") {
        const giantsRawRoll = roll2d(rng);
        classToken = rowForTotal(giantsRawRoll).giants;
        rolls.giants = { rawRoll: giantsRawRoll, result: classToken };
      }

      luminosityClass = classToLuminosity(classToken) ?? "V";

      const typeOutcome = rollTypeWithConstraints({ dm: normalizedDm + 1, luminosityClass, rng });
      spectralType = typeOutcome.spectralType;
      rolls.typeRoll = typeOutcome.rolls;
      notes.push(...typeOutcome.notes);
    } else {
      designation = specialResult;
      luminosityClass = null;
      objectType = "unusual";
    }
  } else {
    spectralType = primaryRow.type;
  }

  if (!designation && spectralType) {
    const subtypeResult = generateStarSubtype({
      spectralType,
      luminosityClass,
      isPrimary: true,
      rng,
    });

    spectralDecimal = subtypeResult.subtype;
    rolls.subtype = {
      method: subtypeResult.method,
      rawRoll: subtypeResult.subtypeRoll,
      adjustedForClassIvK: subtypeResult.adjustedForClassIvK,
      result: subtypeResult.subtype,
    };

    if (subtypeResult.adjustedForClassIvK) {
      notes.push("Class IV K-type subtype above 4 reduced by 5.");
    }

    if (spectralType === "WD") {
      designation = "WD";
    } else if (luminosityClass) {
      designation = `${spectralType}${spectralDecimal}${luminosityClass}`;
    } else {
      designation = `${spectralType}${spectralDecimal}`;
    }
  }

  if (!designation) {
    designation = "Anomaly";
    objectType = "unusual";
  }

  const persistedSpectralClass = inferPersistedSpectralClass({ spectralType, luminosityClass, designation });

  return {
    designation,
    spectralType,
    spectralDecimal,
    luminosityClass,
    objectType,
    persistedSpectralClass,
    rolls,
    notes,
  };
}

export function toPersistedSpectralClass(starResult) {
  if (!starResult || typeof starResult !== "object") {
    return "G";
  }

  if (PERSISTED_SPECTRAL_TYPES.has(starResult.persistedSpectralClass)) {
    return starResult.persistedSpectralClass;
  }

  return inferPersistedSpectralClass({
    spectralType: starResult.spectralType,
    luminosityClass: starResult.luminosityClass,
    designation: starResult.designation,
  });
}
