import { hashString, mulberry32 } from "./terrainRandom.js";
import { normalizeFaceTopologyId } from "./worldTerrainStartTriangle.js";

export function buildTerrainInteriorDistanceMap(cells, adjacencyById = new Map()) {
  const distanceByKey = new Map();
  if (!Array.isArray(cells) || !cells.length) {
    return distanceByKey;
  }

  const borderKeys = [];
  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    const neighborCount = adjacencyById.get(key)?.neighbors?.size || 0;
    if (neighborCount < 6) {
      distanceByKey.set(key, 0);
      borderKeys.push(key);
    }
  }

  const queue = [...borderKeys];
  while (queue.length) {
    const key = queue.shift();
    const baseDistance = distanceByKey.get(key) || 0;
    const neighbors = adjacencyById.get(key)?.neighbors || new Set();
    for (const neighborKey of neighbors) {
      const nextDistance = baseDistance + 1;
      // Keep the shortest known distance from any border hex.
      if (distanceByKey.has(neighborKey) && distanceByKey.get(neighborKey) <= nextDistance) {
        continue;
      }
      distanceByKey.set(neighborKey, nextDistance);
      queue.push(neighborKey);
    }
  }

  return distanceByKey;
}

export function buildTerrainPlacementScoreMap(cells, seed, adjacencyById = new Map()) {
  const byKey = new Map();
  if (!Array.isArray(cells) || !cells.length) {
    return byKey;
  }

  const cxValues = cells.map((cell) => Number(cell?.cx)).filter(Number.isFinite);
  const cyValues = cells.map((cell) => Number(cell?.cy)).filter(Number.isFinite);
  const centerX = cxValues.length ? cxValues.reduce((sum, value) => sum + value, 0) / cxValues.length : 0;
  const centerY = cyValues.length ? cyValues.reduce((sum, value) => sum + value, 0) / cyValues.length : 0;
  const maxDistance = Math.max(
    1,
    ...cells.map((cell) => Math.hypot(Number(cell?.cx) - centerX, Number(cell?.cy) - centerY)).filter(Number.isFinite),
  );
  const interiorDistanceByKey = buildTerrainInteriorDistanceMap(cells, adjacencyById);
  const maxInteriorDistance = Math.max(1, ...interiorDistanceByKey.values(), 0);

  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    const noise = mulberry32(hashString(`${seed}|${key}`))();
    const centerBias =
      1 - Math.min(1, Math.hypot(Number(cell?.cx) - centerX, Number(cell?.cy) - centerY) / maxDistance);
    const degreeBias = Math.min(1, ((adjacencyById.get(key)?.neighbors?.size || 0) - 2) / 4);
    const interiorBias = Math.min(1, (interiorDistanceByKey.get(key) || 0) / maxInteriorDistance);
    const faceBias = (() => {
      const faceId = normalizeFaceTopologyId(cell?.faceId);
      if (!faceId) return 0;
      return ((hashString(`${seed}|face|${faceId}`) % 1000) / 1000) * 0.15;
    })();

    byKey.set(key, noise * 0.2 + centerBias * 0.15 + degreeBias * 0.3 + interiorBias * 0.35 + faceBias);
  }

  return byKey;
}
