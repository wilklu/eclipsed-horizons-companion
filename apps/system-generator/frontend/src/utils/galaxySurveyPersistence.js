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
