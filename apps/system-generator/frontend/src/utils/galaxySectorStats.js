import { summarizeLegacyStarMetadata } from "./systemStarMetadata.js";

const STELLAR_OBJECT_BASELINE_PER_SECTOR = 640;
const SOPHONT_BASELINE_PER_SECTOR = 16;

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function summarizeBaselineComparison(currentValue = 0, baselineValue = 0) {
  const current = toNumber(currentValue);
  const baseline = toNumber(baselineValue);
  const percentOfBaseline = baseline > 0 ? (current / baseline) * 100 : 0;
  const deltaFromBaseline = current - baseline;

  return {
    baseline,
    percentOfBaseline,
    deltaFromBaseline,
    direction: deltaFromBaseline > 0 ? "above" : deltaFromBaseline < 0 ? "below" : "at",
  };
}

function getSectorObjectCount(sector = {}) {
  const metadata = sector?.metadata && typeof sector.metadata === "object" ? sector.metadata : {};
  const metadataSystemCount = Number(metadata?.systemCount);
  if (Number.isFinite(metadataSystemCount)) {
    return Math.max(0, metadataSystemCount);
  }

  if (Array.isArray(metadata?.occupiedHexes)) {
    return metadata.occupiedHexes.length;
  }

  if (metadata?.hexStarTypes && typeof metadata.hexStarTypes === "object") {
    return Object.keys(metadata.hexStarTypes).length;
  }

  return 0;
}

function isRestrictedSophontBody(record = {}) {
  const type = String(record?.type ?? record?.worldType ?? record?.designation ?? "")
    .trim()
    .toLowerCase();
  return type.includes("gas giant") || type.includes("belt");
}

function hasNativeSophontIndicator(record = {}) {
  if (!record || typeof record !== "object" || isRestrictedSophontBody(record)) {
    return false;
  }

  if (record.nativeSophontLife === true || record.mainworldNativeSophontLife === true) {
    return true;
  }

  const status = String(record.nativeSophontStatus ?? record.mainworldNativeSophontStatus ?? record.sophontStatus ?? "")
    .trim()
    .toLowerCase();
  if (["exist", "exists", "extant", "present", "current"].includes(status)) {
    return true;
  }

  const countedWorlds = Number(record.nativeSophontWorldCount ?? record.sophontLifeWorldCount ?? NaN);
  return Number.isFinite(countedWorlds) ? countedWorlds > 0 : false;
}

function buildSophontCandidateKey(record = {}, index = 0) {
  return [
    record?.worldId,
    record?.planetId,
    record?.id,
    record?.name,
    record?.designation,
    record?.orbitNumber,
    record?.orbitalSlot,
    record?.coord,
    index,
  ]
    .map((part) =>
      String(part ?? "")
        .trim()
        .toUpperCase(),
    )
    .join("|");
}

function getSystemSophontCount(system = {}) {
  const rawCandidates = [
    system?.mainworld,
    ...(Array.isArray(system?.planets) ? system.planets : []),
    ...(Array.isArray(system?.worlds) ? system.worlds : []),
  ].filter((entry) => entry && typeof entry === "object");
  const seen = new Set();
  const uniqueCandidates = rawCandidates.filter((entry, index) => {
    const key = buildSophontCandidateKey(entry, index);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  const candidateCount = uniqueCandidates.filter((entry) => hasNativeSophontIndicator(entry)).length;
  if (candidateCount > 0) {
    return candidateCount;
  }

  return hasNativeSophontIndicator(system) ? 1 : 0;
}

function summarizeGalaxyDensityMetrics({ stats = {}, sectors = [], systems = [] } = {}) {
  const normalizedSectors = Array.isArray(sectors) ? sectors : [];
  const normalizedSystems = Array.isArray(systems) ? systems : [];
  const totalSectors = Math.max(toNumber(stats?.totalSectors), normalizedSectors.length);
  const sectorObjectCounts = normalizedSectors.map((sector) => getSectorObjectCount(sector));
  const derivedTotalObjects = sectorObjectCounts.reduce((sum, count) => sum + count, 0);
  const totalObjects = toNumber(stats?.totalObjects, derivedTotalObjects);
  const avgObjectsPerSector = toNumber(stats?.avgObjectsPerSector, totalSectors > 0 ? totalObjects / totalSectors : 0);
  const starBaseline = summarizeBaselineComparison(avgObjectsPerSector, STELLAR_OBJECT_BASELINE_PER_SECTOR);

  const sophontsBySector = new Map();
  normalizedSystems.forEach((system) => {
    const sophontCount = getSystemSophontCount(system);
    if (sophontCount <= 0) {
      return;
    }

    const sectorId = String(system?.sectorId || "").trim() || "__unassigned__";
    sophontsBySector.set(sectorId, (sophontsBySector.get(sectorId) || 0) + sophontCount);
  });

  const sectorSophontCounts = Array.from(sophontsBySector.values());
  const totalSophonts = sectorSophontCounts.reduce((sum, count) => sum + count, 0);
  const avgSophontsPerSector = totalSectors > 0 ? totalSophonts / totalSectors : 0;
  const sophontBaseline = summarizeBaselineComparison(avgSophontsPerSector, SOPHONT_BASELINE_PER_SECTOR);

  return {
    starBaselinePerSector: STELLAR_OBJECT_BASELINE_PER_SECTOR,
    starBaselinePercent: starBaseline.percentOfBaseline,
    starBaselineDelta: starBaseline.deltaFromBaseline,
    starBaselineDirection: starBaseline.direction,
    densestSectorObjects: sectorObjectCounts.length ? Math.max(...sectorObjectCounts) : 0,
    sparsestSectorObjects: sectorObjectCounts.length ? Math.min(...sectorObjectCounts) : 0,
    totalSophonts,
    avgSophontsPerSector,
    sophontBaselinePerSector: SOPHONT_BASELINE_PER_SECTOR,
    sophontBaselinePercent: sophontBaseline.percentOfBaseline,
    sophontBaselineDelta: sophontBaseline.deltaFromBaseline,
    sophontBaselineDirection: sophontBaseline.direction,
    sophontBearingSectors: sectorSophontCounts.length,
    densestSectorSophonts: sectorSophontCounts.length ? Math.max(...sectorSophontCounts) : 0,
  };
}

export function summarizeGalaxyLegacyMetadata(sectors = []) {
  const normalizedSectors = Array.isArray(sectors) ? sectors : [];
  let trackedSectorCount = 0;
  let legacySectorCount = 0;
  let legacyReconstructedCount = 0;
  let legacyHierarchyUnknownCount = 0;

  normalizedSectors.forEach((sector) => {
    const metadataSummary = summarizeLegacyStarMetadata({
      hexStarTypes: sector?.metadata?.hexStarTypes,
    });
    if (metadataSummary.trackedHexCount > 0) {
      trackedSectorCount += 1;
    }
    if (metadataSummary.hasLegacyData) {
      legacySectorCount += 1;
    }
    legacyReconstructedCount += metadataSummary.legacyReconstructedCount;
    legacyHierarchyUnknownCount += metadataSummary.legacyHierarchyUnknownCount;
  });

  const hasLegacyData = legacyReconstructedCount > 0 || legacyHierarchyUnknownCount > 0;
  return {
    trackedSectorCount,
    legacySectorCount,
    legacyReconstructedCount,
    legacyHierarchyUnknownCount,
    hasLegacyData,
    summary: hasLegacyData
      ? `${legacyReconstructedCount} reconstructed star ${legacyReconstructedCount === 1 ? "tree" : "trees"} across ${legacySectorCount} sector${legacySectorCount === 1 ? "" : "s"}; ${legacyHierarchyUnknownCount} inferred ${legacyHierarchyUnknownCount === 1 ? "hierarchy" : "hierarchies"}`
      : "No legacy star metadata flags",
  };
}

export function normalizeSectorStats(stats = {}, { sectors = [], systems = [] } = {}) {
  const legacyMetadata = summarizeGalaxyLegacyMetadata(sectors);
  const useDerivedLegacyMetadata = legacyMetadata.trackedSectorCount > 0 || legacyMetadata.hasLegacyData;
  const densityMetrics = summarizeGalaxyDensityMetrics({ stats, sectors, systems });

  return {
    totalSectors: toNumber(stats?.totalSectors),
    populatedSectors: toNumber(stats?.populatedSectors),
    generatedPresenceSectors: toNumber(stats?.generatedPresenceSectors),
    emptySectors: toNumber(stats?.emptySectors),
    totalObjects: toNumber(stats?.totalObjects),
    avgObjectsPerSector: toNumber(stats?.avgObjectsPerSector),
    ...densityMetrics,
    legacyTrackedSectors: useDerivedLegacyMetadata
      ? legacyMetadata.trackedSectorCount
      : toNumber(stats?.legacyTrackedSectors),
    legacySectors: useDerivedLegacyMetadata ? legacyMetadata.legacySectorCount : toNumber(stats?.legacySectors),
    legacyReconstructedCount: useDerivedLegacyMetadata
      ? legacyMetadata.legacyReconstructedCount
      : toNumber(stats?.legacyReconstructedCount),
    legacyHierarchyUnknownCount: useDerivedLegacyMetadata
      ? legacyMetadata.legacyHierarchyUnknownCount
      : toNumber(stats?.legacyHierarchyUnknownCount),
    legacySummary: useDerivedLegacyMetadata
      ? legacyMetadata.summary
      : String(stats?.legacySummary || "No legacy star metadata flags"),
    lastUpdated: stats?.lastUpdated || new Date().toISOString(),
  };
}

export function buildGalaxyExportPayload({ galaxy, sectorStats = {}, sectors = [], systems = [] } = {}) {
  const normalizedSectorStats = normalizeSectorStats(sectorStats, { sectors, systems });
  const legacyStarMetadata = summarizeGalaxyLegacyMetadata(sectors);

  return {
    ...(galaxy ?? {}),
    metadata: {
      ...(galaxy?.metadata ?? {}),
      sectorStats: normalizedSectorStats,
      exportSummary: {
        ...(galaxy?.metadata?.exportSummary ?? {}),
        sectorStats: normalizedSectorStats,
        legacyStarMetadata,
      },
    },
  };
}
