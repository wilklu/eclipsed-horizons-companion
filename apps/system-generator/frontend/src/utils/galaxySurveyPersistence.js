export const DEFAULT_GALAXY_IMPORT_FORM = Object.freeze({
  fileData: null,
  placementMode: "clustered",
  placementSeed: "",
  coordinatesX: 0,
  coordinatesY: 0,
  clusterMinSeparation: 12,
  clusterMaxSeparation: 29,
  clusterClearance: 10,
  clusterSlotsPerRing: 16,
});

export function createDefaultGalaxyImportForm() {
  return { ...DEFAULT_GALAXY_IMPORT_FORM };
}

export function canDismissGalaxyImportModal(importInProgress = false) {
  return !Boolean(importInProgress);
}

export function buildGalaxyImportRequest({
  importForm = {},
  universeBoundsRange = {},
  clampUniverseCoordinate = (value) => value,
  placementTuning = undefined,
} = {}) {
  const mode = String(importForm?.placementMode || "clustered");
  const coordinates =
    mode === "manual"
      ? {
          x: clampUniverseCoordinate(
            importForm?.coordinatesX,
            universeBoundsRange?.minX ?? -500,
            universeBoundsRange?.maxX ?? 500,
          ),
          y: clampUniverseCoordinate(
            importForm?.coordinatesY,
            universeBoundsRange?.minY ?? -500,
            universeBoundsRange?.maxY ?? 500,
          ),
        }
      : null;

  return {
    galaxyData: importForm?.fileData ?? null,
    options: {
      mode,
      coordinates,
      seed: importForm?.placementSeed || undefined,
      tuning: placementTuning,
    },
  };
}

export function buildGalaxyCreatePayload({
  galaxyId = "",
  newGalaxyForm = {},
  universeCoordinates = null,
  placementTuning = undefined,
  nowIso = new Date().toISOString(),
} = {}) {
  return {
    galaxyId,
    name: newGalaxyForm?.name,
    type: newGalaxyForm?.type,
    morphology: {
      bulgeRadius: newGalaxyForm?.bulgeRadius,
      armCount: newGalaxyForm?.armCount,
      coreDensity: newGalaxyForm?.coreDensity,
      diskThickness: newGalaxyForm?.diskThickness,
      centralAnomaly: {
        type: newGalaxyForm?.centralAnomalyType || "Black Hole",
        massSolarMasses: Number(newGalaxyForm?.centralAnomalyMassSolar) || null,
        activityIndex: Number(newGalaxyForm?.centralAnomalyActivity) || 0,
      },
    },
    metadata: {
      createdAt: nowIso,
      lastModified: nowIso,
      status: "active",
      version: 1,
      universeCoordinates,
      universePlacementMode: newGalaxyForm?.placementMode,
      universePlacementSeed: newGalaxyForm?.placementSeed || null,
      universePlacementTuning: placementTuning,
    },
  };
}

export function buildGalaxyEditPayload({
  galaxy = {},
  nextName = "",
  galaxyEditForm = {},
  clamp = (value) => value,
  nowIso = new Date().toISOString(),
} = {}) {
  return {
    ...galaxy,
    name: nextName,
    type: galaxyEditForm?.type,
    morphology: {
      ...(galaxy?.morphology || {}),
      bulgeRadius: clamp(Number(galaxyEditForm?.bulgeRadius) || 5000, 5000, 50000),
      armCount: clamp(Number(galaxyEditForm?.armCount) || 0, 0, 12),
      coreDensity: clamp(Number(galaxyEditForm?.coreDensity) || 0.7, 0.01, 1),
      diskThickness: clamp(Number(galaxyEditForm?.diskThickness) || 1000, 500, 10000),
      centralAnomaly: {
        ...(galaxy?.morphology?.centralAnomaly || {}),
        type: galaxyEditForm?.centralAnomalyType,
        massSolarMasses: Math.max(1, Number(galaxyEditForm?.centralAnomalyMassSolar) || 0),
        activityIndex: clamp(Number(galaxyEditForm?.centralAnomalyActivity) || 0, 0, 1),
      },
    },
    metadata: {
      ...(galaxy?.metadata || {}),
      lastModified: nowIso,
    },
  };
}

export function buildGalaxySectorStatsPayload({
  galaxy = {},
  stats = {},
  normalizeStats = (value) => value,
  nowIso = new Date().toISOString(),
} = {}) {
  return {
    ...galaxy,
    metadata: {
      ...(galaxy?.metadata || {}),
      sectorStats: normalizeStats(stats),
      lastModified: nowIso,
    },
  };
}

export async function resolveGalaxySectorStatsRefresh({
  galaxyId = null,
  force = false,
  cachedStats = null,
  currentStats = {},
  currentSectors = [],
  loadSectors = async () => currentSectors,
  fetchSectorStats = async () => ({}),
  normalizeStats = (stats) => stats,
  getGalaxyById = () => null,
  persistStats = async () => {},
} = {}) {
  if (!galaxyId) {
    return {
      source: "empty",
      stats: normalizeStats(),
    };
  }

  if (!force && cachedStats) {
    return {
      source: "cache",
      stats: normalizeStats(cachedStats),
    };
  }

  if (!force && !cachedStats) {
    return {
      source: "current",
      stats: normalizeStats(currentStats),
    };
  }

  const sectors = await loadSectors(galaxyId).catch(() => currentSectors);
  const fetchedStats = await fetchSectorStats(galaxyId);
  const normalized = normalizeStats(fetchedStats, { sectors });
  const galaxy = getGalaxyById(galaxyId);

  if (galaxy) {
    await persistStats(galaxy, normalized);
  }

  return {
    source: "remote",
    sectors,
    stats: normalized,
  };
}
