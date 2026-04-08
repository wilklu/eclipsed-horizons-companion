import { resolveStarDescriptorToken } from "./starDisplay.js";

const SPECTRAL_TYPES = {
  O: { mass: 40, lum: 100000, temp: 40000 },
  B: { mass: 10, lum: 10000, temp: 20000 },
  A: { mass: 2.0, lum: 25, temp: 8500 },
  F: { mass: 1.4, lum: 4, temp: 6700 },
  G: { mass: 1.0, lum: 1.0, temp: 5800 },
  K: { mass: 0.7, lum: 0.25, temp: 4500 },
  M: { mass: 0.3, lum: 0.04, temp: 3200 },
};

const ANOMALY_TYPES = [
  { code: "Black Hole", designation: "BH", mass: 12, lum: 0, temp: 0, orbitRole: "Singularity" },
  { code: "Pulsar", designation: "PSR", mass: 1.4, lum: 0.001, temp: 600000, orbitRole: "Compact remnant" },
  { code: "Neutron Star", designation: "NS", mass: 1.8, lum: 0.002, temp: 1000000, orbitRole: "Compact remnant" },
  { code: "Quasar Remnant", designation: "QR", mass: 5000000, lum: 0.05, temp: 0, orbitRole: "Remnant core" },
  { code: "Dense Cluster", designation: "CL", mass: 250, lum: 15000, temp: 12000, orbitRole: "Cluster core" },
];

const NON_STELLAR_TYPES = Object.freeze({
  D: { designation: "D", spectralClass: "D", massInSolarMasses: 0.6, luminosity: 0.01, temperatureK: 9000 },
  BD: { designation: "BD", spectralClass: "BD", massInSolarMasses: 0.05, luminosity: 0.0005, temperatureK: 1800 },
  L: { designation: "L", spectralClass: "L", massInSolarMasses: 0.04, luminosity: 0.0002, temperatureK: 1500 },
  T: { designation: "T", spectralClass: "T", massInSolarMasses: 0.03, luminosity: 0.00008, temperatureK: 900 },
  Y: { designation: "Y", spectralClass: "Y", massInSolarMasses: 0.02, luminosity: 0.00002, temperatureK: 450 },
  PROTO: {
    designation: "Proto",
    spectralClass: "Protostar",
    massInSolarMasses: 1.2,
    luminosity: 1.5,
    temperatureK: 4200,
  },
  NB: {
    designation: "NB",
    spectralClass: "Nebula",
    massInSolarMasses: 0,
    luminosity: 0.02,
    temperatureK: 0,
    isAnomaly: true,
  },
  CLUSTER: {
    designation: "Cluster",
    spectralClass: "Star Cluster",
    massInSolarMasses: 250,
    luminosity: 15000,
    temperatureK: 12000,
    isAnomaly: true,
  },
  ANOMALY: {
    designation: "Anomaly",
    spectralClass: "Anomaly",
    massInSolarMasses: 1,
    luminosity: 0.1,
    temperatureK: 0,
    isAnomaly: true,
  },
});

function resolveAnomalyEntry(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    ANOMALY_TYPES.find(
      (entry) =>
        entry.code.toLowerCase() === normalized ||
        entry.designation.toLowerCase() === normalized ||
        normalized.includes(entry.code.toLowerCase()),
    ) ?? null
  );
}

export function resolveStarRecord(starType, orbitType = null) {
  const anomaly = resolveAnomalyEntry(starType);
  if (anomaly) {
    return {
      designation: anomaly.designation,
      spectralClass: anomaly.code,
      massInSolarMasses: anomaly.mass,
      luminosity: anomaly.lum,
      temperatureK: anomaly.temp,
      orbitType: orbitType || anomaly.orbitRole || null,
      isAnomaly: true,
    };
  }

  const nonStellar = NON_STELLAR_TYPES[resolveStarDescriptorToken(starType, "G")];
  if (nonStellar) {
    return {
      ...nonStellar,
      orbitType,
    };
  }

  const raw = String(starType || "G2V").trim() || "G2V";
  const code = raw.charAt(0).toUpperCase();
  const base = SPECTRAL_TYPES[code] ?? SPECTRAL_TYPES.G;
  return {
    designation: raw,
    spectralClass: raw,
    massInSolarMasses: base.mass,
    luminosity: base.lum,
    temperatureK: base.temp,
    orbitType,
  };
}

export function cloneGeneratedStarRecord(star, fallbackOrbitType = null) {
  if (star && typeof star === "object" && !Array.isArray(star)) {
    const designation = String(
      star?.designation || star?.spectralClass || star?.spectralType || star?.starKey || "",
    ).trim();
    const spectralClass = String(star?.spectralClass || designation || "").trim();
    return {
      ...star,
      designation,
      spectralClass,
      spectralType: String(star?.spectralType || spectralClass || designation).trim(),
      orbitType: star?.orbitType ?? fallbackOrbitType ?? null,
    };
  }

  return resolveStarRecord(star, fallbackOrbitType);
}

export function cloneGeneratedStars(stars = []) {
  return (Array.isArray(stars) ? stars : []).map((star, index) =>
    cloneGeneratedStarRecord(star, index === 0 ? null : index === 1 ? "Near" : "Far"),
  );
}

export function buildGeneratedStars({
  primary = null,
  secondaryStars = [],
  anomalyType = null,
  existingGeneratedStars = [],
  fallbackStarType = "G2V",
} = {}) {
  if (Array.isArray(existingGeneratedStars) && existingGeneratedStars.length) {
    return cloneGeneratedStars(existingGeneratedStars);
  }

  const primarySource = anomalyType || primary || fallbackStarType;
  return [
    cloneGeneratedStarRecord(primarySource, null),
    ...(Array.isArray(secondaryStars) ? secondaryStars : []).map((star, index) =>
      cloneGeneratedStarRecord(star, index === 0 ? "Near" : "Far"),
    ),
  ].filter(Boolean);
}

export function buildHexStarTypeMetadata({
  generatedStars = [],
  primary = null,
  secondaryStars = [],
  anomalyType = null,
  fallbackStarType = "G2V",
  legacyReconstructed = false,
  legacyHierarchyUnknown = false,
} = {}) {
  const stars = buildGeneratedStars({
    primary,
    secondaryStars,
    anomalyType,
    existingGeneratedStars: generatedStars,
    fallbackStarType,
  });
  const { primaryDesignation, secondaryStars: summarizedSecondaryStars } = summarizeGeneratedStars(stars);

  return {
    starType: String(anomalyType || primaryDesignation || fallbackStarType).trim() || fallbackStarType,
    secondaryStars: summarizedSecondaryStars,
    generatedStars: stars,
    anomalyType: anomalyType ?? null,
    legacyReconstructed: Boolean(legacyReconstructed),
    legacyHierarchyUnknown: Boolean(legacyHierarchyUnknown),
  };
}

export function normalizeHexStarTypeRecord(record = {}, fallbackStarType = "") {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const rawStarType = String(source?.starType || fallbackStarType || "").trim();
  const anomalyType = source?.anomalyType ?? null;
  const generatedStars =
    Array.isArray(source?.generatedStars) && source.generatedStars.length
      ? source.generatedStars
      : Array.isArray(source?.stars) && source.stars.length
        ? source.stars
        : [];
  const secondaryStars = Array.isArray(source?.secondaryStars) ? source.secondaryStars : [];
  const hasStarData = Boolean(rawStarType || anomalyType || generatedStars.length || secondaryStars.length);
  const reconstructedFromFlatLabels =
    generatedStars.length === 0 && Boolean(rawStarType || anomalyType || secondaryStars.length);
  const legacyReconstructed = Boolean(source?.legacyReconstructed) || reconstructedFromFlatLabels;
  const legacyHierarchyUnknown =
    Boolean(source?.legacyHierarchyUnknown) || (reconstructedFromFlatLabels && secondaryStars.length > 0);

  if (!hasStarData) {
    return {
      ...source,
      starType: rawStarType,
      secondaryStars: [],
      generatedStars: [],
      anomalyType,
      legacyReconstructed,
      legacyHierarchyUnknown,
    };
  }

  const starMetadata = buildHexStarTypeMetadata({
    generatedStars,
    primary: rawStarType,
    secondaryStars,
    anomalyType,
    fallbackStarType: rawStarType || "G2V",
    legacyReconstructed,
    legacyHierarchyUnknown,
  });

  return {
    ...source,
    starType: starMetadata.starType,
    secondaryStars: starMetadata.secondaryStars,
    generatedStars: starMetadata.generatedStars,
    anomalyType: starMetadata.anomalyType,
    legacyReconstructed: starMetadata.legacyReconstructed,
    legacyHierarchyUnknown: starMetadata.legacyHierarchyUnknown,
  };
}

export function normalizeHexStarTypesMap(hexStarTypes = {}) {
  if (!hexStarTypes || typeof hexStarTypes !== "object" || Array.isArray(hexStarTypes)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(hexStarTypes).map(([coord, record]) => [
      String(coord || "").trim(),
      normalizeHexStarTypeRecord(record),
    ]),
  );
}

function formatSystemCoord(system = {}) {
  const x = Number(system?.hexCoordinates?.x);
  const y = Number(system?.hexCoordinates?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return "";
  }
  return `${String(Math.trunc(x)).padStart(2, "0")}${String(Math.trunc(y)).padStart(2, "0")}`;
}

export function summarizeLegacyStarMetadata({ hexStarTypes = {}, hexes = [], systems = [] } = {}) {
  const byCoord = new Map();

  const register = (coord, legacyReconstructed, legacyHierarchyUnknown) => {
    const normalizedCoord = String(coord || "").trim();
    if (!normalizedCoord) return;
    const current = byCoord.get(normalizedCoord) || {
      coord: normalizedCoord,
      legacyReconstructed: false,
      legacyHierarchyUnknown: false,
    };
    current.legacyReconstructed = current.legacyReconstructed || Boolean(legacyReconstructed);
    current.legacyHierarchyUnknown = current.legacyHierarchyUnknown || Boolean(legacyHierarchyUnknown);
    byCoord.set(normalizedCoord, current);
  };

  Object.entries(hexStarTypes || {}).forEach(([coord, info]) => {
    register(coord, info?.legacyReconstructed, info?.legacyHierarchyUnknown);
  });

  (Array.isArray(hexes) ? hexes : []).forEach((hex) => {
    if (!hex?.hasSystem) return;
    register(hex?.coord, hex?.legacyReconstructed, hex?.legacyHierarchyUnknown);
  });

  (Array.isArray(systems) ? systems : []).forEach((system) => {
    const generatedSurvey =
      system?.metadata?.generatedSurvey && typeof system.metadata.generatedSurvey === "object"
        ? system.metadata.generatedSurvey
        : {};
    register(
      formatSystemCoord(system),
      generatedSurvey?.legacyReconstructed ?? system?.metadata?.legacyReconstructed,
      generatedSurvey?.legacyHierarchyUnknown ?? system?.metadata?.legacyHierarchyUnknown,
    );
  });

  const entries = Array.from(byCoord.values());
  const legacyReconstructedCount = entries.filter((entry) => entry.legacyReconstructed).length;
  const legacyHierarchyUnknownCount = entries.filter((entry) => entry.legacyHierarchyUnknown).length;
  const hasLegacyData = legacyReconstructedCount > 0 || legacyHierarchyUnknownCount > 0;

  return {
    trackedHexCount: entries.length,
    legacyReconstructedCount,
    legacyHierarchyUnknownCount,
    hasLegacyData,
    reconstructedCoords: entries.filter((entry) => entry.legacyReconstructed).map((entry) => entry.coord),
    hierarchyUnknownCoords: entries.filter((entry) => entry.legacyHierarchyUnknown).map((entry) => entry.coord),
    summary: hasLegacyData
      ? `${legacyReconstructedCount} reconstructed star ${legacyReconstructedCount === 1 ? "tree" : "trees"}; ${legacyHierarchyUnknownCount} inferred ${legacyHierarchyUnknownCount === 1 ? "hierarchy" : "hierarchies"}`
      : "No legacy star metadata flags",
  };
}

export function resolveGeneratedStarsFromHex(hex = {}) {
  const normalized = normalizeHexStarTypeRecord(hex, "G2V");
  return buildGeneratedStars({
    primary: normalized?.starType,
    secondaryStars: normalized?.secondaryStars,
    anomalyType: normalized?.anomalyType,
    existingGeneratedStars: normalized?.generatedStars,
    fallbackStarType: "G2V",
  });
}

export function resolveGeneratedStarsFromSystem(system = {}) {
  const snapshot =
    system?.metadata?.systemRecord && typeof system.metadata.systemRecord === "object"
      ? system.metadata.systemRecord
      : {};
  const explicitStars =
    Array.isArray(system?.metadata?.generatedSurvey?.stars) && system.metadata.generatedSurvey.stars.length
      ? system.metadata.generatedSurvey.stars
      : Array.isArray(system?.stars) && system.stars.length
        ? system.stars
        : Array.isArray(snapshot?.stars) && snapshot.stars.length
          ? snapshot.stars
          : [];

  const primarySource = system?.primaryStar ||
    snapshot?.primaryStar || {
      designation: system?.starType || snapshot?.starType || "G2V",
      spectralClass: system?.starType || snapshot?.starType || "G2V",
    };

  const companionSource =
    Array.isArray(system?.companionStars) && system.companionStars.length
      ? system.companionStars
      : Array.isArray(snapshot?.companionStars) && snapshot.companionStars.length
        ? snapshot.companionStars
        : Array.isArray(system?.secondaryStars) && system.secondaryStars.length
          ? system.secondaryStars
          : Array.isArray(snapshot?.secondaryStars) && snapshot.secondaryStars.length
            ? snapshot.secondaryStars
            : [];

  return buildGeneratedStars({
    primary: primarySource,
    secondaryStars: companionSource,
    existingGeneratedStars: explicitStars,
    fallbackStarType: system?.starType || snapshot?.starType || "G2V",
  });
}

export function summarizeGeneratedStars(stars = []) {
  const starList = Array.isArray(stars) ? stars : [];
  const primary = starList[0] ?? resolveStarRecord("G2V");
  const primaryDesignation = String(primary?.designation || primary?.spectralClass || "G2V").trim() || "G2V";
  const primaryCode = primaryDesignation.charAt(0).toUpperCase() || "G";
  const secondaryStars = starList
    .slice(1)
    .map((star) => String(star?.designation || star?.spectralClass || "").trim())
    .filter(Boolean);

  return {
    primaryDesignation,
    primaryCode,
    secondaryStars,
  };
}
