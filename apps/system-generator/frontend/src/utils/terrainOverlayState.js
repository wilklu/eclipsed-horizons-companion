export function buildClearedTerrainComposition(existingComposition = {}, totalMapHexes = 0) {
  return {
    ...(existingComposition && typeof existingComposition === "object" ? existingComposition : {}),
    surfaceProfile: ["Terrain map cleared"],
    hexCounts: [],
    assignedHexes: 0,
    totalMapHexes: Math.max(0, Number(totalMapHexes) || 0),
  };
}

export function shouldKeepTerrainCleared({ cellsLength = 0, terrainOverlayWasCleared = false, entriesSize = 0 }) {
  return Number(cellsLength) > 0 && terrainOverlayWasCleared === true && Number(entriesSize) === 0;
}
