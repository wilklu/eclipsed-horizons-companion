function clampGridDimension(value, fallback) {
  const numeric = Math.trunc(Number(value));
  return numeric > 0 ? numeric : fallback;
}

function normalizeSpectralCode(value) {
  return String(value || "")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function buildPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((Math.max(0, Number(value) || 0) / total) * 1000) / 10;
}

export function normalizeSectorSurveyCoord(value, { cols = 32, rows = 40 } = {}) {
  const normalized = String(value || "")
    .replace(/[^0-9]/g, "")
    .slice(0, 4);

  if (!/^\d{4}$/.test(normalized)) {
    return "";
  }

  const safeCols = clampGridDimension(cols, 32);
  const safeRows = clampGridDimension(rows, 40);
  const col = Number(normalized.slice(0, 2));
  const row = Number(normalized.slice(2, 4));
  if (!col || !row || col > safeCols || row > safeRows) {
    return "";
  }

  return `${String(col).padStart(2, "0")}${String(row).padStart(2, "0")}`;
}

export function moveSectorSurveyCoord(coord, { cols = 32, rows = 40, columnDelta = 0, rowDelta = 0 } = {}) {
  const normalized = normalizeSectorSurveyCoord(coord, { cols, rows });
  const safeCols = clampGridDimension(cols, 32);
  const safeRows = clampGridDimension(rows, 40);

  if (!normalized) {
    return `${String(1).padStart(2, "0")}${String(1).padStart(2, "0")}`;
  }

  const col = Number(normalized.slice(0, 2));
  const row = Number(normalized.slice(2, 4));
  const nextCol = Math.min(safeCols, Math.max(1, col + Math.trunc(Number(columnDelta) || 0)));
  const nextRow = Math.min(safeRows, Math.max(1, row + Math.trunc(Number(rowDelta) || 0)));
  return `${String(nextCol).padStart(2, "0")}${String(nextRow).padStart(2, "0")}`;
}

export function moveSectorSurveySubsector(letter, { columnDelta = 0, rowDelta = 0 } = {}) {
  const normalized = String(letter || "A")
    .trim()
    .charAt(0)
    .toUpperCase();
  const ascii = normalized.charCodeAt(0);
  const index = ascii >= 65 && ascii <= 80 ? ascii - 65 : 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  const nextCol = Math.min(3, Math.max(0, col + Math.trunc(Number(columnDelta) || 0)));
  const nextRow = Math.min(3, Math.max(0, row + Math.trunc(Number(rowDelta) || 0)));
  return String.fromCharCode(65 + nextRow * 4 + nextCol);
}

export function resolveSectorSurveyFilterMatch(hex, filterMode = "all") {
  const mode =
    String(filterMode || "all")
      .trim()
      .toLowerCase() || "all";
  const hasSystem = Boolean(hex?.hasSystem);
  const presenceOnly = Boolean(hex?.presenceOnly);
  const anomaly = String(hex?.anomalyType || "").trim();
  const legacy = Boolean(hex?.legacyReconstructed || hex?.legacyHierarchyUnknown);
  const spectral = normalizeSpectralCode(hex?.starType);

  switch (mode) {
    case "surveyed":
      return hasSystem && !presenceOnly;
    case "presence":
      return presenceOnly;
    case "anomaly":
      return Boolean(anomaly);
    case "nativelife":
      return hasNativeLifeReviewMatch(hex);
    case "oba":
      return ["O", "B", "A"].includes(spectral);
    case "fgk":
      return ["F", "G", "K"].includes(spectral);
    case "m":
      return spectral === "M";
    case "legacy":
      return legacy;
    case "empty":
      return !hasSystem;
    default:
      return true;
  }
}

export function summarizeSectorSurveyFilters(hexes = []) {
  const items = Array.isArray(hexes) ? hexes : [];
  const modes = ["surveyed", "presence", "anomaly", "nativeLife", "oba", "fgk", "m", "legacy", "empty"];
  return Object.fromEntries(
    modes.map((mode) => [mode, items.filter((hex) => resolveSectorSurveyFilterMatch(hex, mode)).length]),
  );
}

function hasNativeLifeReviewMatch(hex = {}) {
  if (!hex?.hasSystem || hex?.presenceOnly) {
    return false;
  }

  if (hex?.nativeSophontLife === true || hex?.mainworldNativeSophontLife === true) {
    return true;
  }
  if (hex?.nativeSophontLife === false || hex?.mainworldNativeSophontLife === false) {
    return false;
  }

  const worldCount = Number(hex?.nativeLifeWorldCount ?? hex?.nativeLifeformCount ?? hex?.nativeLifeCount ?? NaN);
  if (Number.isFinite(worldCount)) {
    return worldCount > 0;
  }

  return false;
}

export function resolveSectorSurveyReviewMatch(hex, reviewMode = "presence") {
  const mode =
    String(reviewMode || "presence")
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "") || "presence";
  const hasSystem = Boolean(hex?.hasSystem);
  const presenceOnly = Boolean(hex?.presenceOnly);
  const anomaly = Boolean(String(hex?.anomalyType || "").trim());
  const legacy = Boolean(hex?.legacyReconstructed || hex?.legacyHierarchyUnknown);
  const habitability = String(hex?.habitability || "")
    .trim()
    .toLowerCase();
  const habitabilityMatch = habitability.match(/-?\d+/);
  const habitabilityScore = habitabilityMatch ? Number(habitabilityMatch[0]) : null;
  const habitable =
    hasSystem &&
    !presenceOnly &&
    Boolean(habitability) &&
    (/garden|habitable|excellent|good|temperate|ideal|pleasant|favorable/.test(habitability) ||
      (Number.isFinite(habitabilityScore) && habitabilityScore >= 7));

  switch (mode) {
    case "anomaly":
      return anomaly;
    case "habitable":
      return habitable;
    case "nativelife":
      return hasNativeLifeReviewMatch(hex);
    case "legacy":
      return legacy;
    case "presence":
    default:
      return hasSystem && presenceOnly;
  }
}

export function buildSectorSurveyReviewQueue(hexes = []) {
  const items = Array.isArray(hexes) ? hexes : [];
  const modes = ["presence", "anomaly", "habitable", "nativeLife", "legacy"];
  return Object.fromEntries(
    modes.map((mode) => [mode, items.filter((hex) => resolveSectorSurveyReviewMatch(hex, mode)).length]),
  );
}

export function findNextSectorSurveyReviewCoord(hexes = [], reviewMode = "presence", currentCoord = "") {
  const items = (Array.isArray(hexes) ? hexes : []).filter((hex) => resolveSectorSurveyReviewMatch(hex, reviewMode));
  if (!items.length) {
    return "";
  }

  const normalizedCurrent = String(currentCoord || "").trim();
  const currentIndex = normalizedCurrent
    ? items.findIndex((hex) => String(hex?.coord || "").trim() === normalizedCurrent)
    : -1;
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
  return String(items[nextIndex]?.coord || "").trim();
}

export function buildSectorSurveyProgress({ systemCount = 0, presenceOnlyCount = 0, totalHexes = 0 } = {}) {
  const safeTotal = Math.max(0, Math.trunc(Number(totalHexes) || 0));
  const safeSystemCount = Math.max(0, Math.trunc(Number(systemCount) || 0));
  const safePresenceOnlyCount = Math.min(safeSystemCount, Math.max(0, Math.trunc(Number(presenceOnlyCount) || 0)));
  const typedCount = Math.max(0, safeSystemCount - safePresenceOnlyCount);
  const emptyCount = Math.max(0, safeTotal - safeSystemCount);

  return {
    totalHexes: safeTotal,
    systemCount: safeSystemCount,
    typedCount,
    presenceOnlyCount: safePresenceOnlyCount,
    emptyCount,
    typedPercent: buildPercent(typedCount, safeTotal),
    presencePercent: buildPercent(safePresenceOnlyCount, safeTotal),
    emptyPercent: buildPercent(emptyCount, safeTotal),
    completedPercent: buildPercent(safeSystemCount, safeTotal),
  };
}

export function buildSectorSurveyChecklist({
  sectorName = "",
  totalHexes = 0,
  systemCount = 0,
  presenceOnlyCount = 0,
  typedCount = 0,
  reviewQueueCounts = {},
} = {}) {
  const hasName = Boolean(String(sectorName || "").trim());
  const safeTotal = Math.max(0, Math.trunc(Number(totalHexes) || 0));
  const safeSystems = Math.max(0, Math.trunc(Number(systemCount) || 0));
  const safePresenceOnly = Math.max(0, Math.trunc(Number(presenceOnlyCount) || 0));
  const safeTyped = Math.max(0, Math.trunc(Number(typedCount) || 0));
  const mappedAll = safeTotal > 0 && safeSystems >= safeTotal;
  const hasTypedSystems = safeTyped > 0;
  const outstandingReviewCount = ["presence", "anomaly", "habitable", "nativeLife", "legacy"].reduce(
    (sum, key) => sum + Math.max(0, Math.trunc(Number(reviewQueueCounts?.[key] || 0))),
    0,
  );
  const reviewComplete = outstandingReviewCount === 0 && safeSystems > 0;

  const items = [
    {
      id: "name",
      label: "Name sector",
      detail: hasName ? "Sector identity saved" : "Give this survey a memorable name",
      status: hasName ? "complete" : "todo",
    },
    {
      id: "mapping",
      label: "Map occupancy",
      detail: mappedAll
        ? `${safeSystems.toLocaleString()} / ${safeTotal.toLocaleString()} hexes mapped`
        : `${safeSystems.toLocaleString()} / ${safeTotal.toLocaleString()} hexes mapped`,
      status: mappedAll ? "complete" : safeSystems > 0 ? "active" : "todo",
    },
    {
      id: "systems",
      label: "Promote stellar systems",
      detail:
        safePresenceOnly > 0
          ? `${safePresenceOnly.toLocaleString()} presence-only hexes still need system generation`
          : hasTypedSystems
            ? `${safeTyped.toLocaleString()} typed systems ready for review`
            : "Generate full systems for detected hexes",
      status: safePresenceOnly > 0 ? "active" : hasTypedSystems ? "complete" : "todo",
    },
    {
      id: "review",
      label: "Review queue",
      detail:
        outstandingReviewCount > 0
          ? `${outstandingReviewCount.toLocaleString()} follow-up targets remain in the queue`
          : safeSystems > 0
            ? "Queue cleared for this viewport"
            : "Queue unlocks after mapping begins",
      status: reviewComplete ? "complete" : outstandingReviewCount > 0 ? "active" : "todo",
    },
    {
      id: "stellar",
      label: "Open stellar survey",
      detail: hasTypedSystems
        ? "Typed systems can now be opened in Stellar Survey"
        : "Select a typed system to continue downstream",
      status: hasTypedSystems ? "complete" : "todo",
    },
  ];

  const completeCount = items.filter((item) => item.status === "complete").length;
  const nextAction =
    outstandingReviewCount > 0
      ? `${outstandingReviewCount.toLocaleString()} follow-up targets remain in the queue.`
      : safePresenceOnly > 0
        ? `${safePresenceOnly.toLocaleString()} presence-only hexes still need systems.`
        : !mappedAll && safeTotal > 0
          ? `Map ${Math.max(0, safeTotal - safeSystems).toLocaleString()} more hexes to finish the viewport.`
          : hasTypedSystems
            ? "Ready to continue into Stellar Survey."
            : "Start by generating occupancy for this viewport.";

  return {
    items,
    completeCount,
    totalCount: items.length,
    nextAction,
  };
}

export function describeSectorSurveyHexBadge(hex = {}) {
  const anomalyType = String(hex?.anomalyType || "").trim();
  const safe = anomalyType.toLowerCase();
  if (!anomalyType) {
    return null;
  }

  if (safe.includes("black hole")) {
    return { icon: "●", label: "Black Hole", className: "hex-badge--black-hole" };
  }
  if (safe.includes("nebula")) {
    return { icon: "☁", label: "Nebula", className: "hex-badge--nebula" };
  }
  if (safe.includes("pulsar")) {
    return { icon: "✦", label: "Pulsar", className: "hex-badge--pulsar" };
  }
  if (safe.includes("neutron")) {
    return { icon: "◆", label: "Neutron Star", className: "hex-badge--neutron" };
  }

  return { icon: "✧", label: anomalyType, className: "hex-badge--anomaly" };
}

export function buildSectorSurveyHexTitle(hex = {}) {
  const coord = String(hex?.coord || "").trim() || "Unknown";
  if (!hex?.hasSystem) {
    return `${coord} - empty hex`;
  }

  if (hex?.presenceOnly) {
    return `${coord} - stellar presence detected`;
  }

  const parts = [coord, String(hex?.starType || "Surveyed system").trim() || "Surveyed system"];
  if (hex?.secondaryStars?.length) {
    parts.push(`companions ${hex.secondaryStars.join(", ")}`);
  }
  if (hex?.anomalyType) {
    parts.push(String(hex.anomalyType).trim());
  }
  if (hex?.mainworldName) {
    parts.push(`mainworld ${String(hex.mainworldName).trim()}`);
  }
  if (hex?.mainworldUwp) {
    parts.push(`UWP ${String(hex.mainworldUwp).trim()}`);
  }

  return parts.filter(Boolean).join(" - ");
}

export function buildSectorSurveyHexAriaLabel(hex = {}, { isSelected = false, isFilteredOut = false } = {}) {
  const coord = String(hex?.coord || "").trim() || "unknown";
  const badge = describeSectorSurveyHexBadge(hex);
  const parts = [`Hex ${coord}`];

  if (isSelected) {
    parts.push("selected");
  }
  if (isFilteredOut) {
    parts.push("dimmed by the active filter");
  }

  if (!hex?.hasSystem) {
    parts.push("empty");
  } else if (hex?.presenceOnly) {
    parts.push("stellar presence detected");
  } else {
    parts.push(`surveyed system ${String(hex?.starType || "unknown type").trim()}`);
  }

  if (badge?.label) {
    parts.push(`anomaly ${badge.label}`);
  }
  if (hex?.secondaryStars?.length) {
    parts.push(`companions ${hex.secondaryStars.join(", ")}`);
  }
  if (hex?.mainworldName) {
    parts.push(`mainworld ${String(hex.mainworldName).trim()}`);
  }

  return `${parts.filter(Boolean).join(", ")}.`;
}

export function buildSectorSurveyAccessibilityStatus({
  currentViewMode = "sector",
  sectorName = "",
  selectedHex = null,
  surveyProgress = {},
  activeReviewQueueLabel = "Review",
  activeReviewQueueCount = 0,
  nextAction = "",
  generationStatusMessage = "",
} = {}) {
  const viewLabel = String(currentViewMode || "").trim() === "subsector" ? "Subsector survey" : "Sector survey";
  const normalizedName = String(sectorName || "").trim();
  const completedPercent = Math.max(0, Number(surveyProgress?.completedPercent ?? 0));
  const typedCount = Math.max(0, Math.trunc(Number(surveyProgress?.typedCount ?? 0)));
  const presenceOnlyCount = Math.max(0, Math.trunc(Number(surveyProgress?.presenceOnlyCount ?? 0)));
  const queueCount = Math.max(0, Math.trunc(Number(activeReviewQueueCount || 0)));
  const parts = [normalizedName ? `${viewLabel} ${normalizedName}.` : `${viewLabel}.`, `${completedPercent}% mapped.`];

  if (selectedHex?.coord) {
    parts.push(buildSectorSurveyHexAriaLabel(selectedHex, { isSelected: true }));
  }
  if (typedCount || presenceOnlyCount) {
    parts.push(
      `${typedCount.toLocaleString()} typed systems and ${presenceOnlyCount.toLocaleString()} presence-only hexes in view.`,
    );
  }
  if (queueCount > 0) {
    parts.push(
      `${String(activeReviewQueueLabel || "Review").trim() || "Review"} queue has ${queueCount.toLocaleString()} target${queueCount === 1 ? "" : "s"}.`,
    );
  }
  if (nextAction) {
    parts.push(`Next action: ${String(nextAction).trim()}`);
  }
  if (generationStatusMessage) {
    parts.push(String(generationStatusMessage).trim());
  }

  return parts.filter(Boolean).join(" ");
}
