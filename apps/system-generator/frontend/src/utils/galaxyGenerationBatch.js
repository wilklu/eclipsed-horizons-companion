import { calculateHexOccupancyProbability } from "./sectorGeneration.js";
import { generatePrimaryStar } from "./primaryStarGenerator.js";
import { buildHexStarTypeMetadata } from "./systemStarMetadata.js";
import { starDescriptorToCssClass } from "./starDisplay.js";

export const SECTOR_HEX_PRESENCE_RATE = Object.freeze([0.03, 0.03, 0.15, 0.3, 0.5, 0.7]);
export const HEX_PRESENCE_COLS = 32;
export const HEX_PRESENCE_ROWS = 40;
export const HEX_PRESENCE_MORPHOLOGY_SCALE = 0.15;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, places = 0) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function sampleAnomalyMassSolar(type) {
  const ranges = {
    "Black Hole": [1_000_000, 5_000_000_000],
    Pulsar: [1.2, 2.5],
    "Neutron Star": [1.1, 3.0],
    "Quasar Remnant": [500_000_000, 20_000_000_000],
    "Dense Cluster": [100_000, 80_000_000],
  };

  const [min, max] = ranges[type] || ranges["Black Hole"];
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  return 10 ** (logMin + Math.random() * (logMax - logMin));
}

function sectorHexCoord(col, row) {
  return `${String(col).padStart(2, "0")}${String(row).padStart(2, "0")}`;
}

function hashString(value) {
  const input = String(value || "");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function normalizeStarTypeValue(value, fallback = "G2V") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  const lowered = normalized.toLowerCase();
  if (lowered === "undefined" || lowered === "null" || lowered === "nan") {
    return fallback;
  }

  return normalized;
}

function spectralClassToCssClass(spectralClass) {
  return starDescriptorToCssClass(normalizeStarTypeValue(spectralClass, "G"));
}

function buildCentralAnomalyRecord(galaxy, sector) {
  const existing = sector?.metadata?.centralAnomaly;
  if (existing?.type && existing?.coord) {
    return {
      ...existing,
      massSolarMasses: Math.max(1, Number(existing.massSolarMasses) || 1),
      activityIndex: clamp(Number(existing.activityIndex) || 0, 0, 1),
      coord: String(existing.coord),
    };
  }

  const profile = galaxy?.morphology?.centralAnomaly || {};
  const type = String(profile.type || "").trim() || "Black Hole";
  const massRaw = Number(profile.massSolarMasses);
  const activityRaw = Number(profile.activityIndex);
  const massSolarMasses = roundTo(Number.isFinite(massRaw) && massRaw > 0 ? massRaw : sampleAnomalyMassSolar(type), 2);
  const activityIndex = roundTo(clamp(Number.isFinite(activityRaw) ? activityRaw : Math.random(), 0, 1), 2);
  const centerCol = Math.ceil(HEX_PRESENCE_COLS / 2);
  const centerRow = Math.ceil(HEX_PRESENCE_ROWS / 2);
  const placementOffsets = [
    { col: 0, row: 0, label: "center" },
    { col: 1, row: 0, label: "near-center-east" },
    { col: -1, row: 0, label: "near-center-west" },
    { col: 0, row: 1, label: "near-center-south" },
    { col: 0, row: -1, label: "near-center-north" },
    { col: 1, row: 1, label: "near-center-southeast" },
    { col: -1, row: 1, label: "near-center-southwest" },
    { col: 1, row: -1, label: "near-center-northeast" },
    { col: -1, row: -1, label: "near-center-northwest" },
  ];
  const seed = hashString(
    `${galaxy?.galaxyId || galaxy?.name || "galaxy"}|${sector?.sectorId || "sector"}|${type}|${massSolarMasses}|${activityIndex}`,
  );
  const offset = placementOffsets[seed % placementOffsets.length];
  const anomalyCol = clamp(centerCol + offset.col, 1, HEX_PRESENCE_COLS);
  const anomalyRow = clamp(centerRow + offset.row, 1, HEX_PRESENCE_ROWS);

  return {
    type,
    massSolarMasses,
    activityIndex,
    coord: sectorHexCoord(anomalyCol, anomalyRow),
    col: anomalyCol,
    row: anomalyRow,
    placement: offset.label,
    radiusPc: Math.max(
      1,
      roundTo(
        type === "Dense Cluster"
          ? Math.pow(massSolarMasses, 0.24)
          : type === "Quasar Remnant"
            ? Math.pow(massSolarMasses, 0.18)
            : Math.pow(massSolarMasses, 0.12),
        2,
      ),
    ),
    hazardLevel: clamp(
      Math.round(
        3 +
          activityIndex * 5 +
          (type === "Black Hole" ? 1 : 0) +
          (type === "Quasar Remnant" ? 2 : 0) +
          (type === "Dense Cluster" ? 1 : 0),
      ),
      1,
      10,
    ),
    gravityWellRating: clamp(roundTo(Math.log10(Math.max(1, massSolarMasses)) - 1, 2), 1, 12),
    surveySignature:
      type === "Black Hole"
        ? "gravitic lensing"
        : type === "Pulsar"
          ? "periodic radiation burst"
          : type === "Neutron Star"
            ? "ultra-dense stellar remnant"
            : type === "Quasar Remnant"
              ? "high-energy relic jet"
              : "extreme stellar crowding",
    generatedAt: new Date().toISOString(),
  };
}

function isGalacticCenterSectorRecord(sector) {
  const gx = Number(sector?.metadata?.gridX);
  const gy = Number(sector?.metadata?.gridY);
  return Number.isFinite(gx) && Number.isFinite(gy) && gx === 0 && gy === 0;
}

function ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes }) {
  if (!isGalacticCenterSectorRecord(sector)) {
    return {
      occupiedHexes,
      hexStarTypes,
      isGalacticCenterSector: false,
      centerAnomalyType: null,
      centerAnomaly: null,
    };
  }

  const centerAnomaly = buildCentralAnomalyRecord(galaxy, sector);
  const centerCoord = centerAnomaly.coord;
  const centerAnomalyType = centerAnomaly.type;
  const nextOccupied = Array.isArray(occupiedHexes) ? [...occupiedHexes] : [];
  if (!nextOccupied.includes(centerCoord)) {
    nextOccupied.push(centerCoord);
  }

  let nextHexStarTypes = hexStarTypes;
  if (hexStarTypes && typeof hexStarTypes === "object") {
    const centerStarMetadata = buildHexStarTypeMetadata({
      anomalyType: centerAnomalyType,
      fallbackStarType: centerAnomalyType,
    });
    nextHexStarTypes = {
      ...hexStarTypes,
      [centerCoord]: {
        starType: centerStarMetadata.starType,
        starClass: "anomaly-core",
        secondaryStars: centerStarMetadata.secondaryStars,
        generatedStars: centerStarMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: centerStarMetadata.anomalyType,
        anomalyDetails: centerAnomaly,
      },
    };
  }

  return {
    occupiedHexes: nextOccupied,
    hexStarTypes: nextHexStarTypes,
    isGalacticCenterSector: true,
    centerAnomalyType,
    centerAnomaly,
  };
}

function generateSectorPresenceComputation(galaxy, sector, realismScale = 1) {
  const dc = Math.min(5, Math.max(0, Number(sector?.densityClass ?? 3)));
  const baseRate = SECTOR_HEX_PRESENCE_RATE[dc];
  const normalizedRealismScale = clamp(Number(realismScale) || 1, 0, 2);
  const occupiedHexes = [];

  for (let col = 1; col <= HEX_PRESENCE_COLS; col += 1) {
    for (let row = 1; row <= HEX_PRESENCE_ROWS; row += 1) {
      const prob = calculateHexOccupancyProbability({
        baseRate,
        col,
        row,
        cols: HEX_PRESENCE_COLS,
        rows: HEX_PRESENCE_ROWS,
        galaxyType: galaxy?.type,
        morphology: galaxy?.morphology,
        realismScale: normalizedRealismScale,
        morphologyScale: HEX_PRESENCE_MORPHOLOGY_SCALE,
      });
      if (Math.random() < prob) {
        occupiedHexes.push(sectorHexCoord(col, row));
      }
    }
  }

  const seeded = ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes: null });
  return {
    occupiedHexes: seeded.occupiedHexes,
    hexStarTypes: null,
    systemCount: seeded.occupiedHexes.length,
    isGalacticCenterSector: seeded.isGalacticCenterSector,
    centerAnomalyType: seeded.centerAnomalyType,
    centerAnomaly: seeded.centerAnomaly,
    centralAnomalyHex: seeded.centerAnomaly?.coord ?? null,
  };
}

function generateSectorSystemsComputation(galaxy, sector, realismScale = 1) {
  const dc = Math.min(5, Math.max(0, Number(sector?.densityClass ?? 3)));
  const baseRate = SECTOR_HEX_PRESENCE_RATE[dc];
  const normalizedRealismScale = clamp(Number(realismScale) || 1, 0, 2);
  const occupiedHexes = [];
  const hexStarTypes = {};

  for (let col = 1; col <= HEX_PRESENCE_COLS; col += 1) {
    for (let row = 1; row <= HEX_PRESENCE_ROWS; row += 1) {
      const coord = sectorHexCoord(col, row);
      const prob = calculateHexOccupancyProbability({
        baseRate,
        col,
        row,
        cols: HEX_PRESENCE_COLS,
        rows: HEX_PRESENCE_ROWS,
        galaxyType: galaxy?.type,
        morphology: galaxy?.morphology,
        realismScale: normalizedRealismScale,
        morphologyScale: HEX_PRESENCE_MORPHOLOGY_SCALE,
      });

      if (Math.random() < prob) {
        const primary = generatePrimaryStar();
        const primaryType = primary.designation || primary.spectralType || primary.persistedSpectralClass || "G2V";
        const starMetadata = buildHexStarTypeMetadata({
          generatedStars: [{ ...primary }],
          primary,
          fallbackStarType: primaryType,
        });
        occupiedHexes.push(coord);
        hexStarTypes[coord] = {
          starType: starMetadata.starType,
          starClass: spectralClassToCssClass(primary.spectralType || primary.persistedSpectralClass || primaryType),
          secondaryStars: starMetadata.secondaryStars,
          generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
          anomalyType: starMetadata.anomalyType,
        };
      }
    }
  }

  const seeded = ensureCenterAnomalyPresence({ galaxy, sector, occupiedHexes, hexStarTypes });
  return {
    occupiedHexes: seeded.occupiedHexes,
    hexStarTypes: seeded.hexStarTypes,
    systemCount: seeded.occupiedHexes.length,
    isGalacticCenterSector: seeded.isGalacticCenterSector,
    centerAnomalyType: seeded.centerAnomalyType,
    centerAnomaly: seeded.centerAnomaly,
    centralAnomalyHex: seeded.centerAnomaly?.coord ?? null,
  };
}

export function generateGalaxySectorBatch({ mode = "systems", galaxy, sectors = [], realismScale = 1 } = {}) {
  const entries = Array.isArray(sectors) ? sectors : [];
  const results = entries.map((sector) =>
    mode === "presence"
      ? generateSectorPresenceComputation(galaxy, sector, realismScale)
      : generateSectorSystemsComputation(galaxy, sector, realismScale),
  );

  return { results };
}
