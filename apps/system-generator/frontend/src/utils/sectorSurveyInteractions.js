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
  const modes = ["surveyed", "presence", "anomaly", "oba", "fgk", "m", "legacy", "empty"];
  return Object.fromEntries(
    modes.map((mode) => [mode, items.filter((hex) => resolveSectorSurveyFilterMatch(hex, mode)).length]),
  );
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
