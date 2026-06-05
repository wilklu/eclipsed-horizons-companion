// Archived legacy terrain generation flow from WorldTerrainMap.vue.
// This file is documentation/reference only and is not imported by runtime code.

export const LEGACY_TERRAIN_GENERATION_NOTES = {
  scope: "WorldTerrainMap legacy procedural layer pipeline",
  reasonArchived: "Replaced by clean overlay-first generation to prevent cross-layer bleed-through.",
  legacyEntryPoints: [
    "clearWaterHexes() with full feature recalculation chain",
    "generateTerrain() with hydro target + procedural placers",
    "handleMapClick() water-toggle fallback when overlay mode was false",
  ],
  legacyPipelineSummary: [
    "Random water allocation from hydro target",
    "Mountain/hills/chasm/precipice/crater/ruin/desert placers",
    "Ocean/shoreline and tectonic overlays",
    "Biome and settlement post-processing",
  ],
  replacementPipelineSummary: [
    "Apply Terrain Survey to Map seeds explicit per-hex overlay",
    "Map click paints explicit terrain type",
    "Overlay persists to selected planet terrainOverlayBySize",
  ],
};
