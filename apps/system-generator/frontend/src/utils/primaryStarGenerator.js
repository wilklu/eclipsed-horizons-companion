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
