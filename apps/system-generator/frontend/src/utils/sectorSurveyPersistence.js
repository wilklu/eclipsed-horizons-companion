import {
  buildFullSectorPreviewState as buildPersistedSectorPreviewState,
  buildSectorPreviewState as buildBaseSectorPreviewState,
} from "./sectorPreviewState.js";

function normalizeRequestedViewport(requestedViewport = {}) {
  const scope =
    requestedViewport?.scope === "subsector" ? "subsector" : requestedViewport?.scope === "sector" ? "sector" : null;
  const subsector = String(requestedViewport?.subsector || "").trim() || null;
  const subsectorName = String(requestedViewport?.subsectorName || "").trim() || null;

  return {
    scope,
    subsector,
    subsectorName,
  };
}

export function resolveSectorSurveyInitialSelection({
  sectors = [],
  currentSectorId = null,
  requestedSectorId = "",
  requestedGrid = null,
  requestedViewport = null,
} = {}) {
  const availableSectors = Array.isArray(sectors) ? sectors : [];
  const viewport = normalizeRequestedViewport(requestedViewport);
  const normalizedRequestedSectorId = String(requestedSectorId || "").trim();
  const currentSector = availableSectors.find((sector) => sector?.sectorId === currentSectorId) ?? null;
  const fallbackSector = availableSectors[0] ?? null;
  const requestedSector = normalizedRequestedSectorId
    ? (availableSectors.find((sector) => sector?.sectorId === normalizedRequestedSectorId) ?? null)
    : null;

  if (!requestedSector && requestedGrid) {
    const requestedGridX = Math.trunc(Number(requestedGrid.x));
    const requestedGridY = Math.trunc(Number(requestedGrid.y));
    const requestedByGrid = availableSectors.find(
      (sector) =>
        Number(sector?.metadata?.gridX) === requestedGridX && Number(sector?.metadata?.gridY) === requestedGridY,
    );

    if (requestedByGrid) {
      return {
        mode: "load",
        sectorId: requestedByGrid.sectorId,
        reason: "requested-grid",
        viewport: null,
      };
    }

    return {
      mode: "atlas",
      sectorId: null,
      reason: "requested-grid-miss",
      viewport,
    };
  }

  const initialSector = requestedSector ?? currentSector ?? fallbackSector;
  if (!initialSector) {
    return {
      mode: "atlas",
      sectorId: null,
      reason: "empty-sector-list",
      viewport,
    };
  }

  return {
    mode: "load",
    sectorId: initialSector.sectorId,
    reason: requestedSector ? "requested-sector" : currentSector ? "current-sector" : "fallback-sector",
    viewport,
  };
}

export function resolveSectorSurveyBackRoute({
  explicitReturnRoute = null,
  from = "",
  atlasGalaxyId = "",
  galaxyId = "",
} = {}) {
  if (explicitReturnRoute && typeof explicitReturnRoute === "object" && typeof explicitReturnRoute.name === "string") {
    return explicitReturnRoute;
  }

  if (String(from || "").trim() === "atlas") {
    const normalizedGalaxyId = String(atlasGalaxyId || galaxyId || "").trim();
    return normalizedGalaxyId
      ? { name: "TravellerAtlas", query: { galaxyId: normalizedGalaxyId } }
      : { name: "TravellerAtlas" };
  }

  return { name: "GalaxySurvey" };
}

export function buildSectorSurveyReturnRoute({
  currentSurveyRouteName = "SectorSurvey",
  galaxyId = "000",
  routeQuery = {},
  sectorId = "",
  scope = "sector",
  selectedSubsector = "",
  subsectorName = "",
} = {}) {
  const normalizedScope = scope === "subsector" ? "subsector" : "sector";
  const normalizedSubsectorName = String(subsectorName || "").trim();

  return {
    name: String(currentSurveyRouteName || "SectorSurvey"),
    params: { galaxyId: galaxyId ?? "000" },
    query: {
      ...(routeQuery && typeof routeQuery === "object" ? routeQuery : {}),
      ...(sectorId ? { sectorId } : {}),
      viewScope: normalizedScope,
      subsector: normalizedScope === "subsector" ? selectedSubsector || undefined : undefined,
      subsectorName: normalizedScope === "subsector" ? normalizedSubsectorName || undefined : undefined,
    },
  };
}

export function buildSectorSurveyCreatePayload({
  galaxyId = "",
  requestedGrid = null,
  displayName = "",
  scope = "sector",
  selectedSubsector = "A",
  subsectorName = "",
  storedSubsectorNames = {},
  densityClass = 3,
  densityVariation = 0,
  cols = 32,
  rows = 40,
  isGalacticCenterSector = false,
  occupancyRealism = 1,
  createSectorId = () => "",
  nowIso = new Date().toISOString(),
} = {}) {
  const normalizedScope = scope === "subsector" ? "subsector" : "sector";
  const normalizedSubsectorName = String(subsectorName || "").trim();
  const normalizedNames =
    normalizedScope === "subsector"
      ? {
          ...(storedSubsectorNames && typeof storedSubsectorNames === "object" ? storedSubsectorNames : {}),
          ...(normalizedSubsectorName
            ? {
                [String(selectedSubsector || "A")
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "A"]: normalizedSubsectorName,
              }
            : {}),
        }
      : {};

  return {
    sectorId: createSectorId(displayName, requestedGrid),
    galaxyId,
    coordinates: {
      x: Number(requestedGrid?.x ?? 0),
      y: Number(requestedGrid?.y ?? 0),
    },
    densityClass,
    densityVariation,
    metadata: {
      createdAt: nowIso,
      lastModified: nowIso,
      displayName,
      explorationStatus: "unexplored",
      scope: normalizedScope,
      gridCols: cols,
      gridRows: rows,
      subsector: normalizedScope === "subsector" ? selectedSubsector : null,
      subsectorName: normalizedScope === "subsector" ? normalizedSubsectorName : null,
      subsectorNames: normalizedNames,
      isGalacticCenterSector,
      occupancyRealism,
      occupiedHexes: [],
      hexStarTypes: {},
      hexPresenceGenerated: false,
      gridX: Number(requestedGrid?.x ?? 0),
      gridY: Number(requestedGrid?.y ?? 0),
      notes:
        normalizedScope === "subsector"
          ? `Generated subsector ${selectedSubsector}${normalizedSubsectorName ? ` (${normalizedSubsectorName})` : ""}`
          : "Generated sector",
    },
  };
}

export function buildSectorSurveySavePayload({
  existingSector = null,
  existingSectorId = "",
  generatedSectorName = "",
  requestedGrid = null,
  galaxyId = "",
  densityClass = 3,
  densityVariation = 0,
  nextMetadata = {},
  createSectorId = () => "",
  nowIso = new Date().toISOString(),
} = {}) {
  const existing = existingSector && typeof existingSector === "object" ? existingSector : null;

  return {
    ...(existing ?? {}),
    sectorId: existingSectorId || createSectorId(generatedSectorName, requestedGrid),
    galaxyId,
    coordinates: {
      x: Number(existing?.coordinates?.x ?? existing?.metadata?.gridX ?? requestedGrid?.x ?? 0),
      y: Number(existing?.coordinates?.y ?? existing?.metadata?.gridY ?? requestedGrid?.y ?? 0),
    },
    densityClass,
    densityVariation: Number(existing?.densityVariation ?? densityVariation ?? 0),
    metadata: {
      ...(existing?.metadata ?? {}),
      ...(requestedGrid ? { gridX: requestedGrid.x, gridY: requestedGrid.y } : {}),
      ...nextMetadata,
      createdAt: existing?.metadata?.createdAt ?? nowIso,
    },
  };
}

export function resolveSectorSurveyNameUpdate({
  sector = null,
  scope = "sector",
  sectorName = "",
  subsectorName = "",
  selectedSubsector = "A",
  buildGeneratedSectorName = (value) => String(value || "").trim(),
  getStoredSubsectorName = () => "",
  getStoredSubsectorNames = () => ({}),
  getNormalizedSubsectorLetter = (value) =>
    String(value || "A")
      .trim()
      .charAt(0)
      .toUpperCase() || "A",
  nowIso = new Date().toISOString(),
} = {}) {
  const normalizedScope = scope === "subsector" ? "subsector" : "sector";
  const nextDisplayName = buildGeneratedSectorName(sectorName);
  const nextSubsectorName = normalizedScope === "subsector" ? String(subsectorName || "").trim() : null;
  const persistedDisplayName = String(sector?.metadata?.displayName || sector?.sectorId || "").trim();
  const persistedSubsectorName = getStoredSubsectorName(sector?.metadata, selectedSubsector);
  const changed =
    nextDisplayName !== persistedDisplayName ||
    (normalizedScope === "subsector" && nextSubsectorName !== persistedSubsectorName);

  if (!changed) {
    return {
      changed: false,
      nextDisplayName,
      nextSubsectorName,
      updatePayload: null,
    };
  }

  const nextSubsectorNames = getStoredSubsectorNames(sector?.metadata);
  if (normalizedScope === "subsector") {
    const currentLetter = getNormalizedSubsectorLetter(selectedSubsector);
    if (nextSubsectorName) {
      nextSubsectorNames[currentLetter] = nextSubsectorName;
    } else {
      delete nextSubsectorNames[currentLetter];
    }
  }

  return {
    changed: true,
    nextDisplayName,
    nextSubsectorName,
    updatePayload: {
      ...(sector ?? {}),
      metadata: {
        ...(sector?.metadata ?? {}),
        displayName: nextDisplayName,
        subsectorName: nextSubsectorName,
        subsectorNames: nextSubsectorNames,
        lastModified: nowIso,
      },
    },
  };
}

export function buildSectorSurveyGenerationMutation({
  existingSectorId = "",
  existingSectorRecord = null,
  generatedName = "",
  requestedGrid = null,
  galaxyId = "",
  densityClass = 3,
  densityVariation = 0,
  sharedMetadata = {},
  scope = "sector",
  selectedSubsector = "A",
  subsectorName = "",
  createSectorId = () => "",
  fallbackCoordinates = { x: 0, y: 0 },
  nowIso = new Date().toISOString(),
} = {}) {
  if (existingSectorId) {
    return {
      mode: "update",
      sectorId: existingSectorId,
      payload: {
        ...(existingSectorRecord && typeof existingSectorRecord === "object" ? existingSectorRecord : {}),
        densityClass,
        densityVariation,
        metadata: sharedMetadata,
      },
    };
  }

  const normalizedSubsectorName = String(subsectorName || "").trim();
  return {
    mode: "create",
    sectorId: createSectorId(generatedName, requestedGrid),
    payload: {
      sectorId: createSectorId(generatedName, requestedGrid),
      galaxyId,
      coordinates: {
        x: requestedGrid?.x ?? fallbackCoordinates?.x ?? 0,
        y: requestedGrid?.y ?? fallbackCoordinates?.y ?? 0,
      },
      densityClass,
      densityVariation,
      metadata: {
        createdAt: nowIso,
        explorationStatus: "unexplored",
        gridX: requestedGrid?.x ?? null,
        gridY: requestedGrid?.y ?? null,
        notes:
          scope === "subsector"
            ? `Generated subsector ${selectedSubsector}${normalizedSubsectorName ? ` (${normalizedSubsectorName})` : ""}`
            : "Generated sector",
        ...sharedMetadata,
      },
    },
  };
}

export function buildSectorSurveySavedPreviewState({
  generatedSector = null,
  persistedSectorId = "",
  persistedDisplayName = "",
  density = "",
  occupancyRealism = 1,
} = {}) {
  const current = generatedSector && typeof generatedSector === "object" ? generatedSector : {};
  const nextHexes = Array.isArray(current.hexes) ? current.hexes : [];
  const systemCount = nextHexes.filter((hex) => hex?.hasSystem).length;
  const gridCols = Number(current.gridCols) || 0;
  const gridRows = Number(current.gridRows) || 0;

  return {
    ...current,
    sectorId: persistedSectorId || current.sectorId,
    name: persistedDisplayName || current.name,
    density,
    occupancyRealism,
    systemCount,
    emptyCount: gridCols * gridRows - systemCount,
    presenceOnlyCount: nextHexes.filter((hex) => hex?.presenceOnly).length,
  };
}

export function buildSectorSurveyPreviewHexUpdate({ generatedSector = null, coord = "", hexPatch = {} } = {}) {
  const current = generatedSector && typeof generatedSector === "object" ? generatedSector : null;
  if (!current || !Array.isArray(current.hexes)) {
    return current;
  }

  const nextHexes = current.hexes.map((hex) => (hex?.coord === coord ? { ...hex, ...hexPatch } : hex));
  const systemCount = nextHexes.filter((hex) => hex?.hasSystem).length;
  const gridCols = Number(current.gridCols) || 0;
  const gridRows = Number(current.gridRows) || 0;

  return {
    ...current,
    hexes: nextHexes,
    systemCount,
    emptyCount: gridCols * gridRows - systemCount,
    presenceOnlyCount: nextHexes.filter((hex) => hex?.presenceOnly).length,
  };
}

export function buildSectorSurveyRebuiltPreview({
  previewScope = "sector",
  sectorId = "",
  name = "",
  density = "",
  occupancyRealism = 1,
  cols = 32,
  rows = 40,
  hexes = [],
  metadata = null,
  systems = [],
} = {}) {
  const normalizedScope = previewScope === "subsector" ? "subsector" : "sector";

  if (normalizedScope === "subsector") {
    return buildPersistedSectorPreviewState({
      sectorId,
      name,
      scope: normalizedScope,
      density,
      occupancyRealism,
      metadata,
      cols,
      rows,
      systems,
    });
  }

  return buildBaseSectorPreviewState({
    sectorId,
    name,
    scope: normalizedScope,
    density,
    occupancyRealism,
    cols,
    rows,
    hexes,
    systems,
  });
}
