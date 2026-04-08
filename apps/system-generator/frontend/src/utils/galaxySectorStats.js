import { summarizeLegacyStarMetadata } from "./systemStarMetadata.js";

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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

export function normalizeSectorStats(stats = {}, { sectors = [] } = {}) {
  const legacyMetadata = summarizeGalaxyLegacyMetadata(sectors);
  const useDerivedLegacyMetadata = legacyMetadata.trackedSectorCount > 0 || legacyMetadata.hasLegacyData;

  return {
    totalSectors: toNumber(stats?.totalSectors),
    populatedSectors: toNumber(stats?.populatedSectors),
    generatedPresenceSectors: toNumber(stats?.generatedPresenceSectors),
    emptySectors: toNumber(stats?.emptySectors),
    totalObjects: toNumber(stats?.totalObjects),
    avgObjectsPerSector: toNumber(stats?.avgObjectsPerSector),
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

export function buildGalaxyExportPayload({ galaxy, sectorStats = {}, sectors = [] } = {}) {
  const normalizedSectorStats = normalizeSectorStats(sectorStats, { sectors });
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
