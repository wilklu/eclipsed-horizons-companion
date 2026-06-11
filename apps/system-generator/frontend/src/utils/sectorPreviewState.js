import { buildHexStarTypeMetadata, summarizeLegacyStarMetadata } from "./systemStarMetadata.js";
import { starDescriptorToCssClass } from "./starDisplay.js";

function normalizeStarTypeValue(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }
  if (["undefined", "null", "nan"].includes(normalized.toLowerCase())) {
    return fallback;
  }
  return normalized;
}

function hexCoord(x, y) {
  return `${String(Math.trunc(x)).padStart(2, "0")}${String(Math.trunc(y)).padStart(2, "0")}`;
}

export function buildSectorPreviewState({
  sectorId,
  name,
  scope = null,
  density = null,
  occupancyRealism = null,
  cols,
  rows,
  hexes,
  systems = [],
} = {}) {
  const normalizedHexes = Array.isArray(hexes) ? hexes : [];
  const systemCount = normalizedHexes.filter((hex) => hex?.hasSystem).length;
  const legacySummary = summarizeLegacyStarMetadata({
    hexes: normalizedHexes,
    systems,
  });

  return {
    sectorId,
    name,
    scope,
    density,
    occupancyRealism,
    gridCols: cols,
    gridRows: rows,
    hexes: normalizedHexes,
    systemCount,
    emptyCount: Math.max(0, Number(cols || 0) * Number(rows || 0) - systemCount),
    presenceOnlyCount: normalizedHexes.filter((hex) => hex?.presenceOnly).length,
    legacyReconstructedCount: legacySummary.legacyReconstructedCount,
    legacyHierarchyUnknownCount: legacySummary.legacyHierarchyUnknownCount,
    legacySummary: legacySummary.summary,
  };
}

export function buildSectorHexesFromMetadata(metadata, { cols = 32, rows = 40 } = {}) {
  const occupiedSet = new Set(
    (Array.isArray(metadata?.occupiedHexes) ? metadata.occupiedHexes : [])
      .map((coord) => String(coord || "").trim())
      .filter(Boolean),
  );
  const hexStarTypes = metadata?.hexStarTypes && typeof metadata.hexStarTypes === "object" ? metadata.hexStarTypes : {};
  const hexes = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= cols; col += 1) {
      const coord = hexCoord(col, row);
      const saved = hexStarTypes[coord];
      const hasSystem = occupiedSet.has(coord) || Boolean(saved);
      if (!hasSystem) {
        hexes.push({ coord, hasSystem: false });
        continue;
      }

      // Presence-only hexes (occupied with no typed stellar metadata) should
      // remain untyped so downstream builders can generate explicitly.
      if (!saved || typeof saved !== "object") {
        hexes.push({
          coord,
          hasSystem: true,
          presenceOnly: true,
          starType: "",
          starClass: "",
          secondaryStars: [],
          generatedStars: [],
          anomalyType: null,
          legacyReconstructed: false,
          legacyHierarchyUnknown: false,
        });
        continue;
      }

      const starType = normalizeStarTypeValue(saved?.starType, "");
      const starMetadata = buildHexStarTypeMetadata({
        generatedStars: saved?.generatedStars,
        primary: starType,
        secondaryStars: saved?.secondaryStars,
        anomalyType: saved?.anomalyType ?? null,
        fallbackStarType: normalizeStarTypeValue(saved?.starType, "G2V"),
        legacyReconstructed: saved?.legacyReconstructed ?? false,
        legacyHierarchyUnknown: saved?.legacyHierarchyUnknown ?? false,
      });
      const resolvedStarType = normalizeStarTypeValue(starMetadata.starType, "");
      hexes.push({
        coord,
        hasSystem: true,
        presenceOnly: !resolvedStarType,
        starType: resolvedStarType,
        starClass: saved?.starClass || starDescriptorToCssClass(resolvedStarType),
        secondaryStars: starMetadata.secondaryStars,
        generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: starMetadata.anomalyType,
        legacyReconstructed: starMetadata.legacyReconstructed,
        legacyHierarchyUnknown: starMetadata.legacyHierarchyUnknown,
      });
    }
  }

  return hexes;
}

export function buildFullSectorPreviewState({
  sectorId,
  name,
  scope = null,
  density = null,
  occupancyRealism = null,
  metadata,
  cols = 32,
  rows = 40,
  systems = [],
} = {}) {
  const hexes = buildSectorHexesFromMetadata(metadata, { cols, rows });
  return {
    ...buildSectorPreviewState({
      sectorId,
      name,
      scope,
      density,
      occupancyRealism,
      cols,
      rows,
      hexes,
      systems,
    }),
    metadata,
  };
}
