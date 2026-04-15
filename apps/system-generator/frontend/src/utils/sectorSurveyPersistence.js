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

function scoreSectorForFallback(sector = {}) {
  const metadata = sector?.metadata && typeof sector.metadata === "object" ? sector.metadata : {};
  const systemCount = Number(metadata?.systemCount ?? 0);
  const occupiedHexes = Array.isArray(metadata?.occupiedHexes) ? metadata.occupiedHexes.length : 0;
  const typedHexes =
    metadata?.hexStarTypes && typeof metadata.hexStarTypes === "object" ? Object.keys(metadata.hexStarTypes).length : 0;
  const generatedPresence = Boolean(metadata?.hexPresenceGenerated) ? 1 : 0;
  const evidenceScore = Math.max(systemCount, occupiedHexes, typedHexes);
  const lastModifiedAt = Date.parse(
    String(metadata?.lastModified || metadata?.hexPresenceGeneratedAt || metadata?.lastUpdated || ""),
  );

  return {
    evidenceScore,
    generatedPresence,
    lastModifiedAt: Number.isFinite(lastModifiedAt) ? lastModifiedAt : 0,
  };
}

function choosePreferredFallbackSector(sectors = []) {
  const entries = Array.isArray(sectors) ? sectors : [];
  if (!entries.length) {
    return null;
  }

  return [...entries].sort((left, right) => {
    const a = scoreSectorForFallback(left);
    const b = scoreSectorForFallback(right);

    if (a.evidenceScore !== b.evidenceScore) {
      return b.evidenceScore - a.evidenceScore;
    }
    if (a.generatedPresence !== b.generatedPresence) {
      return b.generatedPresence - a.generatedPresence;
    }
    if (a.lastModifiedAt !== b.lastModifiedAt) {
      return b.lastModifiedAt - a.lastModifiedAt;
    }
    return 0;
  })[0];
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
  const fallbackSector = choosePreferredFallbackSector(availableSectors);
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

const WORKSPACE_GRID_MODES = new Set(["fit", "comfortable", "large"]);
const WORKSPACE_FILTER_MODES = new Set([
  "all",
  "surveyed",
  "presence",
  "anomaly",
  "oba",
  "fgk",
  "m",
  "legacy",
  "empty",
]);
const WORKSPACE_REVIEW_QUEUES = new Set(["presence", "anomaly", "habitable", "nativeLife", "legacy"]);

function normalizeWorkspaceMode(value = "", allowed = new Set(), fallback = "") {
  const normalized = String(value || "").trim();
  return allowed.has(normalized) ? normalized : fallback;
}

function normalizeWorkspaceSubsector(value = "", fallback = "A") {
  const normalized = String(value || fallback || "A")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (/^[A-P]$/.test(normalized)) {
    return normalized;
  }

  return (
    String(fallback || "A")
      .trim()
      .charAt(0)
      .toUpperCase() || "A"
  );
}

function normalizeWorkspaceHex(coord = "") {
  const normalized = String(coord || "").trim();
  return /^\d{4}$/.test(normalized) ? normalized : "";
}

export function buildSectorSurveyWorkspaceState({
  galaxyId = null,
  selectedSectorId = "",
  scope = "sector",
  selectedSubsector = "A",
  gridSizeMode = "fit",
  sectorSurveyFilterMode = "all",
  activeReviewQueue = "presence",
  selectedHex = "",
} = {}) {
  const normalizedScope = String(scope || "").trim() === "subsector" ? "subsector" : "sector";
  const normalizedSectorId = String(selectedSectorId || "").trim();

  return {
    galaxyId: String(galaxyId || "").trim() || null,
    selectedSectorId: normalizedSectorId || "",
    scope: normalizedScope,
    selectedSubsector: normalizeWorkspaceSubsector(selectedSubsector),
    gridSizeMode: normalizeWorkspaceMode(gridSizeMode, WORKSPACE_GRID_MODES, "fit"),
    sectorSurveyFilterMode: normalizeWorkspaceMode(sectorSurveyFilterMode, WORKSPACE_FILTER_MODES, "all"),
    activeReviewQueue: normalizeWorkspaceMode(activeReviewQueue, WORKSPACE_REVIEW_QUEUES, "presence"),
    selectedHex: normalizeWorkspaceHex(selectedHex),
  };
}

export function resolveSectorSurveyWorkspaceState({
  persistedState = null,
  sectorOptions = [],
  availableHexes = [],
  defaultScope = "sector",
  defaultSubsector = "A",
} = {}) {
  const normalizedState = buildSectorSurveyWorkspaceState(persistedState ?? {});
  const normalizedScope =
    String(persistedState?.scope || "").trim() === "subsector"
      ? "subsector"
      : String(defaultScope || "").trim() === "subsector"
        ? "subsector"
        : "sector";
  const normalizedSubsector = normalizeWorkspaceSubsector(persistedState?.selectedSubsector, defaultSubsector);
  const availableSectorIds = new Set(
    (Array.isArray(sectorOptions) ? sectorOptions : [])
      .map((entry) => String(entry?.sectorId || "").trim())
      .filter(Boolean),
  );
  const availableCoords = new Set(
    (Array.isArray(availableHexes) ? availableHexes : [])
      .map((entry) => normalizeWorkspaceHex(typeof entry === "string" ? entry : entry?.coord))
      .filter(Boolean),
  );
  const selectedSectorId =
    availableSectorIds.size > 0 && !availableSectorIds.has(normalizedState.selectedSectorId)
      ? ""
      : normalizedState.selectedSectorId;
  const selectedHex =
    availableCoords.size > 0 && !availableCoords.has(normalizedState.selectedHex) ? "" : normalizedState.selectedHex;

  return {
    ...normalizedState,
    selectedSectorId,
    scope: normalizedScope,
    selectedSubsector: normalizedSubsector,
    selectedHex,
    coordJumpInput: selectedHex,
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

  const resolvedCoordinates = {
    x: Number(requestedGrid?.x ?? fallbackCoordinates?.x ?? 0),
    y: Number(requestedGrid?.y ?? fallbackCoordinates?.y ?? 0),
  };

  const normalizedSubsectorName = String(subsectorName || "").trim();
  return {
    mode: "create",
    sectorId: createSectorId(generatedName, resolvedCoordinates),
    payload: {
      sectorId: createSectorId(generatedName, resolvedCoordinates),
      galaxyId,
      coordinates: resolvedCoordinates,
      densityClass,
      densityVariation,
      metadata: {
        createdAt: nowIso,
        explorationStatus: "unexplored",
        gridX: resolvedCoordinates.x,
        gridY: resolvedCoordinates.y,
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
