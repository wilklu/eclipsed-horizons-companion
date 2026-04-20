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

function hasMeaningfulStarDesignation(value) {
  const text = String(value || "").trim();
  if (!text) {
    return false;
  }

  const compact = text.toUpperCase().replace(/\s+/g, "");
  return (
    !/^[A-Z]$/i.test(text) &&
    !/^(?:star|primary|secondary|tertiary|companion)(?:\s+star)?(?:[-_\s]*\d+)?$/i.test(text) &&
    !/^(?:O|B|A|F|G|K|M|L|T|Y|D|BD)\d{0,2}(?:IA|IB|II|III|IV|V|VI|VII)?$/.test(compact) &&
    !/^(?:PROTOSTAR|ANOMALY|BLACKHOLE|PULSAR|NEUTRONSTAR|QUASARREMNANT|DENSECLUSTER|NEBULA|STARCLUSTER)$/.test(compact)
  );
}

export function resolvePreferredStarLabel(star = {}) {
  if (!star || typeof star !== "object" || Array.isArray(star)) {
    return String(star || "").trim();
  }

  const preferredNamedLabel = [star?.name, star?.label, star?.starKey]
    .map((value) => String(value || "").trim())
    .find((value) => hasMeaningfulStarDesignation(value));

  if (preferredNamedLabel) {
    return preferredNamedLabel;
  }

  const designation = String(star?.designation || "").trim();
  if (hasMeaningfulStarDesignation(designation)) {
    return designation;
  }

  return String(
    star?.spectralClass || star?.spectralType || star?.typeSubtype || star?.starType || star?.objectType || designation,
  ).trim();
}

function isHexPlaceholderSystemName(value) {
  const text = String(value || "").trim();
  return Boolean(text) && (/^\d{4}(?:\s+system)?$/i.test(text) || /^[a-z0-9:_,-]*:\d{4}$/i.test(text));
}

function extractDirectSystemBaseName(value) {
  const text = String(value || "").trim();
  if (!text || isHexPlaceholderSystemName(text)) {
    return "";
  }

  const baseName = text.replace(/\s+System$/i, "").trim();
  return hasMeaningfulStarDesignation(baseName) ? baseName : "";
}

function extractSystemBaseNameFromDesignation(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const designationMatch = text.match(/^(.*?)\s+(?:Primus|Proximus|Proximum|Procul|Procol)\s+(?:Major|Minor)\s*$/i);
  return designationMatch?.[1] ? extractDirectSystemBaseName(designationMatch[1]) : "";
}

function resolveSystemBaseName(system = {}) {
  const metadata = system?.metadata && typeof system.metadata === "object" ? system.metadata : {};
  const snapshot = metadata?.systemRecord && typeof metadata.systemRecord === "object" ? metadata.systemRecord : {};
  const profiles = system?.profiles && typeof system.profiles === "object" ? system.profiles : {};

  const directName = [
    system?.name,
    system?.systemName,
    system?.systemDesignation,
    profiles?.systemDesignation,
    profiles?.systemName,
    snapshot?.name,
    snapshot?.systemName,
    snapshot?.systemDesignation,
    metadata?.displayName,
  ]
    .map((value) => extractDirectSystemBaseName(value))
    .find(Boolean);

  if (directName) {
    return directName;
  }

  return (
    [
      system?.primaryStar,
      ...(Array.isArray(system?.stars) ? system.stars : []),
      ...(Array.isArray(metadata?.generatedSurvey?.stars) ? metadata.generatedSurvey.stars : []),
    ]
      .map((star) => extractSystemBaseNameFromDesignation(resolvePreferredStarLabel(star)))
      .find(Boolean) || ""
  );
}

function normalizeStarOrbitCategory(star = {}, index = 0) {
  if (index === 0) {
    return "primary";
  }

  const raw = String(star?.orbitType || "far")
    .trim()
    .toLowerCase();

  if (raw === "distant") return "far";
  if (raw === "companion") return "close";
  if (["primary", "close", "near", "far"].includes(raw)) return raw;
  return index === 1 ? "close" : "far";
}

export function applySystemBasedStarDesignations(stars = [], system = {}) {
  const baseName = typeof system === "string" ? extractSystemBaseName(system) : resolveSystemBaseName(system);
  const starList = (Array.isArray(stars) ? stars : []).map((star) => ({ ...star }));

  if (!baseName || !starList.length) {
    return starList;
  }

  const groups = new Map();
  starList.forEach((star, index) => {
    const category = normalizeStarOrbitCategory(star, index);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push({ index, star });
  });

  const prefixes = { primary: "Primus", close: "Proximus", near: "Proximum", far: "Procul" };

  for (const [category, entries] of groups.entries()) {
    let majorEntry = entries[0];
    if (category === "primary") {
      majorEntry = entries.find((entry) => entry.index === 0) || entries[0];
    } else {
      majorEntry = entries.reduce((best, current) => {
        const bestMass = Number(best.star?.massInSolarMasses ?? best.star?.mass ?? 0);
        const currentMass = Number(current.star?.massInSolarMasses ?? current.star?.mass ?? 0);
        return currentMass > bestMass ? current : best;
      }, entries[0]);
    }

    for (const entry of entries) {
      const alreadyNamed = [entry.star?.name, entry.star?.label, entry.star?.starKey, entry.star?.designation].some(
        (value) => hasMeaningfulStarDesignation(value),
      );
      if (alreadyNamed) {
        continue;
      }

      const suffix = entry === majorEntry ? "Major" : "Minor";
      starList[entry.index] = {
        ...starList[entry.index],
        designation: `${baseName} ${prefixes[category] || "Procul"} ${suffix}`.trim(),
      };
    }
  }

  return starList;
}

export function cloneGeneratedStarRecord(star, fallbackOrbitType = null) {
  if (star && typeof star === "object" && !Array.isArray(star)) {
    const designationLabel = String(star?.designation || star?.starKey || "").trim();
    const spectralValue = String(
      star?.spectralClass ||
        star?.spectralType ||
        star?.typeSubtype ||
        star?.starType ||
        star?.objectType ||
        designationLabel,
    ).trim();
    const fallbackRecord = resolveStarRecord(spectralValue || designationLabel || "G2V", fallbackOrbitType);
    const preferredLabel = resolvePreferredStarLabel(star);
    const designation = hasMeaningfulStarDesignation(preferredLabel)
      ? preferredLabel
      : fallbackRecord.designation || designationLabel || spectralValue;
    const spectralClass = spectralValue || fallbackRecord.spectralClass || designation;
    const massInSolarMasses = Number(star?.massInSolarMasses ?? star?.mass);
    const luminosity = Number(star?.luminosity);
    const temperatureK = Number(star?.temperatureK ?? star?.temperature);
    return {
      ...fallbackRecord,
      ...star,
      designation,
      spectralClass,
      spectralType: String(star?.spectralType || star?.typeSubtype || spectralClass || designation).trim(),
      massInSolarMasses:
        Number.isFinite(massInSolarMasses) && massInSolarMasses > 0
          ? massInSolarMasses
          : fallbackRecord.massInSolarMasses,
      luminosity: Number.isFinite(luminosity) && luminosity >= 0 ? luminosity : fallbackRecord.luminosity,
      temperatureK: Number.isFinite(temperatureK) && temperatureK >= 0 ? temperatureK : fallbackRecord.temperatureK,
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
  const { secondaryStars: summarizedSecondaryStars } = summarizeGeneratedStars(stars);
  const primarySpectralType = String(
    stars[0]?.spectralClass || stars[0]?.spectralType || stars[0]?.typeSubtype || stars[0]?.starType || "",
  ).trim();

  return {
    starType: String(anomalyType || primarySpectralType || fallbackStarType).trim() || fallbackStarType,
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

  const stars = buildGeneratedStars({
    primary: primarySource,
    secondaryStars: companionSource,
    existingGeneratedStars: explicitStars,
    fallbackStarType: system?.starType || snapshot?.starType || "G2V",
  });

  return applySystemBasedStarDesignations(stars, system);
}

export function summarizeGeneratedStars(stars = []) {
  const starList = Array.isArray(stars) ? stars : [];
  const primary = starList[0] ?? resolveStarRecord("G2V");
  const primaryDesignation = resolvePreferredStarLabel(primary) || "G2V";
  const primaryCode = resolveStarDescriptorToken(
    primary?.spectralClass || primary?.spectralType || primary?.typeSubtype || primary?.starType || primaryDesignation,
    "G",
  );
  const secondaryStars = starList
    .slice(1)
    .map((star) => resolvePreferredStarLabel(star))
    .filter(Boolean);

  return {
    primaryDesignation,
    primaryCode,
    secondaryStars,
  };
}
