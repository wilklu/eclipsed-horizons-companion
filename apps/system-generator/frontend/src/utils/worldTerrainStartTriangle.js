const D46_TRIANGLE_TABLE = Object.freeze({
  11: "Upper-0L",
  12: "Upper-1",
  13: "Upper-2",
  14: "Upper-3",
  15: "Upper-4",
  16: "Upper-0R",
  21: "Middle-0L",
  22: "Middle-2",
  23: "Middle-4",
  24: "Middle-6",
  25: "Middle-8",
  26: "Middle-0R",
  31: "Middle-0L",
  32: "Middle-1",
  33: "Middle-3",
  34: "Middle-5",
  35: "Middle-7",
  36: "Middle-9",
  41: "Lower-1",
  42: "Lower-2",
  43: "Lower-3",
  44: "Lower-4",
  45: "Lower-5",
  46: "Middle-0R",
});

export function normalizeFaceTopologyId(faceId = "") {
  const normalized = String(faceId || "").trim();
  if (!normalized) {
    return "";
  }

  // L/R suffixed edge IDs represent lateral partners of the same triangle when folded.
  const match = normalized.match(/^(.*-\d+)[LR]$/);
  return match ? match[1] : normalized;
}

export function rollD46(rng = Math.random) {
  const d4 = Math.floor(rng() * 4) + 1;
  const d6 = Math.floor(rng() * 6) + 1;
  const roll = `${d4}${d6}`;

  return {
    d4,
    d6,
    roll,
    faceId: D46_TRIANGLE_TABLE[roll] || null,
  };
}

export function resolveStarterTriangle(rolledFaceId, availableFaceIds = [], rng = Math.random) {
  const available = Array.isArray(availableFaceIds)
    ? availableFaceIds.map((entry) => String(entry || "").trim()).filter(Boolean)
    : [];

  if (!available.length) {
    return String(rolledFaceId || "").trim() || null;
  }

  const normalizedRoll = String(rolledFaceId || "").trim();
  if (normalizedRoll && available.includes(normalizedRoll)) {
    return normalizedRoll;
  }

  const topologyRoll = normalizeFaceTopologyId(normalizedRoll);
  if (topologyRoll) {
    const lateralPartner = available.find((entry) => normalizeFaceTopologyId(entry) === topologyRoll);
    if (lateralPartner) {
      return lateralPartner;
    }
  }

  const idx = Math.floor(rng() * available.length);
  return available[Math.max(0, Math.min(available.length - 1, idx))] || null;
}

export function pickRandomHexInTriangle(hexCells = [], faceId = "", rng = Math.random) {
  const normalizedFaceId = String(faceId || "").trim();
  if (!normalizedFaceId) {
    return null;
  }

  const topologyFaceId = normalizeFaceTopologyId(normalizedFaceId);

  const eligible = Array.isArray(hexCells)
    ? hexCells.filter((cell) => normalizeFaceTopologyId(String(cell?.faceId || "").trim()) === topologyFaceId)
    : [];

  if (!eligible.length) {
    return null;
  }

  const idx = Math.floor(rng() * eligible.length);
  return eligible[Math.max(0, Math.min(eligible.length - 1, idx))] || null;
}

export { D46_TRIANGLE_TABLE };
