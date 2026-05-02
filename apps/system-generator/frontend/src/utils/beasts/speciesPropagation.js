function toFiniteNumber(value, fallback = NaN) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeSystemCoordinates(system = {}) {
  const x = toFiniteNumber(system?.hexCoordinates?.x, NaN);
  const y = toFiniteNumber(system?.hexCoordinates?.y, NaN);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    return { x, y };
  }

  const trailingHex =
    String(system?.systemId || "")
      .split(":")
      .pop() || "";
  const compact = trailingHex.replace(/\D/g, "").slice(0, 4).padStart(4, "0");
  const parsedX = toFiniteNumber(compact.slice(0, 2), NaN);
  const parsedY = toFiniteNumber(compact.slice(2, 4), NaN);
  if (Number.isFinite(parsedX) && Number.isFinite(parsedY)) {
    return { x: parsedX, y: parsedY };
  }

  return null;
}

export function buildSystemCoordinateIndex(systems = []) {
  const index = new Map();
  for (const system of Array.isArray(systems) ? systems : []) {
    const systemId = String(system?.systemId || "").trim();
    if (!systemId) {
      continue;
    }
    const coordinates = normalizeSystemCoordinates(system);
    if (!coordinates) {
      continue;
    }
    index.set(systemId, coordinates);
  }
  return index;
}

export function calculateSystemDistance({ fromSystemId = "", toSystemId = "", coordinateIndex } = {}) {
  const fromId = String(fromSystemId || "").trim();
  const toId = String(toSystemId || "").trim();
  if (!fromId || !toId || !coordinateIndex?.has(fromId) || !coordinateIndex?.has(toId)) {
    return null;
  }

  const from = coordinateIndex.get(fromId);
  const to = coordinateIndex.get(toId);
  const dx = Number(from.x) - Number(to.x);
  const dy = Number(from.y) - Number(to.y);
  return Math.sqrt(dx * dx + dy * dy);
}

export function resolvePropagationChanceByDistance(distance) {
  if (!Number.isFinite(distance)) {
    return 0.01;
  }
  if (distance <= 0) {
    return 0.16;
  }
  if (distance <= 1) {
    return 0.12;
  }
  if (distance <= 3) {
    return 0.08;
  }
  if (distance <= 6) {
    return 0.04;
  }
  if (distance <= 10) {
    return 0.02;
  }
  return 0.005;
}

export function pickNearbySpeciesTemplate({
  records = [],
  systems = [],
  currentSystemId = "",
  currentWorldKey = "",
  rng = Math.random,
} = {}) {
  const sourceSystemId = String(currentSystemId || "").trim();
  const sourceWorldKey = String(currentWorldKey || "").trim();
  const candidates = (Array.isArray(records) ? records : []).filter((record) => {
    if (!record || typeof record !== "object") {
      return false;
    }
    const recordWorldKey = String(record?.worldKey || "").trim();
    if (recordWorldKey && sourceWorldKey && recordWorldKey === sourceWorldKey) {
      return false;
    }
    const recordSystemId = String(record?.systemId || "").trim();
    return Boolean(recordSystemId || recordWorldKey);
  });

  if (!candidates.length) {
    return null;
  }

  const coordinateIndex = buildSystemCoordinateIndex(systems);
  const ranked = candidates
    .map((record) => {
      const recordSystemId = String(record?.systemId || "").trim();
      const distance = calculateSystemDistance({
        fromSystemId: sourceSystemId,
        toSystemId: recordSystemId,
        coordinateIndex,
      });
      const chance = resolvePropagationChanceByDistance(distance);
      const weight = Number.isFinite(distance) ? 1 / (1 + distance) ** 2 : 0.12;
      return {
        record,
        distance,
        chance,
        weight,
      };
    })
    .filter((entry) => entry.weight > 0)
    .sort((left, right) => left.distance - right.distance);

  if (!ranked.length) {
    return null;
  }

  const bestChance = ranked.reduce((max, entry) => Math.max(max, entry.chance), 0);
  if (rng() >= bestChance) {
    return null;
  }

  const totalWeight = ranked.reduce((sum, entry) => sum + entry.weight, 0);
  let remaining = rng() * totalWeight;
  for (const entry of ranked) {
    remaining -= entry.weight;
    if (remaining <= 0) {
      return entry;
    }
  }

  return ranked[ranked.length - 1] || null;
}

export function cloneSpeciesTemplate(template = {}) {
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(template);
    }
  } catch {
    // Ignore and fall back to JSON clone.
  }

  return JSON.parse(JSON.stringify(template || {}));
}

export function buildPropagationOriginNote(selection = null) {
  const distance = Number(selection?.distance);
  const worldName = String(selection?.record?.worldName || selection?.record?.sourceWorld?.name || "").trim();
  const distanceText = Number.isFinite(distance) ? `distance ${distance.toFixed(1)}` : "unknown distance";
  if (worldName) {
    return `Cross-world lineage from ${worldName} (${distanceText}).`;
  }
  return `Cross-world lineage (${distanceText}).`;
}
