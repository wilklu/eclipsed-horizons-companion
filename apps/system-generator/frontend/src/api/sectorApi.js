import { normalizeHexStarTypesMap } from "../utils/systemStarMetadata.js";

const STORAGE_KEY = "eclipsed-horizons-sectors-cache";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api").replace(/\/$/, "");
const CACHE_HEX_STAR_TYPE_DETAIL_LIMIT = 128;
const CACHE_OCCUPIED_HEX_LIMIT = 1280;
const CACHE_SECTOR_RETRY_LIMIT = 250;

function isAbortError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name === "aborterror" || code === "abort_err" || message.includes("aborted") || message.includes("abort");
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      detail = "";
    }
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function loadSectors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isStorageQuotaError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name.includes("quota") || message.includes("quota") || message.includes("exceeded the quota");
}

function sortSectorsForCache(sectors) {
  return [...sectors].sort((left, right) => {
    const leftUpdated = Date.parse(left?.metadata?.lastUpdated || left?.lastUpdated || 0) || 0;
    const rightUpdated = Date.parse(right?.metadata?.lastUpdated || right?.lastUpdated || 0) || 0;
    return rightUpdated - leftUpdated;
  });
}

function compactHexStarTypesForCache(hexStarTypes) {
  if (!hasObjectEntries(hexStarTypes)) {
    return hexStarTypes;
  }
  const entries = Object.entries(normalizeHexStarTypesMap(hexStarTypes));
  if (entries.length <= CACHE_HEX_STAR_TYPE_DETAIL_LIMIT) {
    return Object.fromEntries(entries);
  }
  return undefined;
}

function compactSectorForCache(sector) {
  const normalized = normalizeSector(sector);
  const metadata = normalized?.metadata && typeof normalized.metadata === "object" ? { ...normalized.metadata } : {};
  const occupiedHexes = Array.isArray(metadata.occupiedHexes) ? metadata.occupiedHexes : [];
  const compactHexStarTypes = compactHexStarTypesForCache(metadata.hexStarTypes);

  if (occupiedHexes.length > CACHE_OCCUPIED_HEX_LIMIT) {
    metadata.occupiedHexesCount = occupiedHexes.length;
    delete metadata.occupiedHexes;
  }

  if (compactHexStarTypes === undefined) {
    if (hasObjectEntries(metadata.hexStarTypes)) {
      metadata.hexStarTypeCount = Object.keys(metadata.hexStarTypes).length;
    }
    delete metadata.hexStarTypes;
  } else {
    metadata.hexStarTypes = compactHexStarTypes;
  }

  return {
    ...normalized,
    metadata,
  };
}

function saveSectors(sectors) {
  const compacted = (Array.isArray(sectors) ? sectors : []).map(compactSectorForCache);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compacted));
  } catch (error) {
    if (!isStorageQuotaError(error)) {
      return;
    }
    try {
      const trimmed = sortSectorsForCache(compacted).slice(0, CACHE_SECTOR_RETRY_LIMIT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage cleanup failures; cache persistence is best-effort only.
      }
    }
  }
}

function shouldPersistSectorCache(options = {}) {
  return options?.persistCache !== false;
}

function hasObjectEntries(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

function mergeSectorRecords(existingSector, nextSector) {
  const existing = existingSector ? normalizeSector(existingSector) : null;
  const incoming = normalizeSector(nextSector);
  if (!existing) {
    return incoming;
  }

  const existingMetadata = existing.metadata ?? {};
  const incomingMetadata = incoming.metadata ?? {};
  const existingOccupiedHexes = Array.isArray(existingMetadata.occupiedHexes) ? existingMetadata.occupiedHexes : [];
  const incomingOccupiedHexes = Array.isArray(incomingMetadata.occupiedHexes) ? incomingMetadata.occupiedHexes : [];
  const existingHexStarTypes = hasObjectEntries(existingMetadata.hexStarTypes)
    ? normalizeHexStarTypesMap(existingMetadata.hexStarTypes)
    : null;
  const incomingHexStarTypes = hasObjectEntries(incomingMetadata.hexStarTypes)
    ? normalizeHexStarTypesMap(incomingMetadata.hexStarTypes)
    : null;

  return {
    ...existing,
    ...incoming,
    coordinates: incoming.coordinates ?? existing.coordinates,
    metadata: {
      ...existingMetadata,
      ...incomingMetadata,
      occupiedHexes: incomingOccupiedHexes.length > 0 ? incomingOccupiedHexes : existingOccupiedHexes,
      hexStarTypes: incomingHexStarTypes ?? existingHexStarTypes ?? incomingMetadata.hexStarTypes,
      hexPresenceGenerated: incomingMetadata.hexPresenceGenerated ?? existingMetadata.hexPresenceGenerated ?? false,
      hexPresenceGeneratedAt:
        incomingMetadata.hexPresenceGeneratedAt ?? existingMetadata.hexPresenceGeneratedAt ?? null,
      centralAnomalyType: incomingMetadata.centralAnomalyType ?? existingMetadata.centralAnomalyType ?? null,
      isGalacticCenterSector:
        incomingMetadata.isGalacticCenterSector ?? existingMetadata.isGalacticCenterSector ?? false,
    },
  };
}

function mergeCachedSectors(nextSectors, options = {}) {
  const byId = new Map(loadSectors().map((sector) => [normalizeSectorId(sector), normalizeSector(sector)]));
  for (const sector of nextSectors) {
    const sectorId = normalizeSectorId(sector);
    byId.set(sectorId, mergeSectorRecords(byId.get(sectorId), sector));
  }
  const merged = Array.from(byId.values());
  if (shouldPersistSectorCache(options)) {
    saveSectors(merged);
  }
  return merged;
}

function replaceCachedSectorsForGalaxy(galaxyId, nextSectors) {
  const retained = loadSectors()
    .map(normalizeSector)
    .filter((sector) => String(sector?.galaxyId) !== String(galaxyId));
  const normalized = (Array.isArray(nextSectors) ? nextSectors : []).map(normalizeSector);
  const merged = retained.concat(normalized);
  saveSectors(merged);
  return normalized;
}

function replaceCachedSectorsInWindow(galaxyId, nextSectors, { xMin, xMax, yMin, yMax }) {
  const retained = loadSectors()
    .map(normalizeSector)
    .filter((sector) => {
      if (String(sector?.galaxyId) !== String(galaxyId)) return true;
      const x = Number(sector?.coordinates?.x);
      const y = Number(sector?.coordinates?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return true;
      return x < xMin || x > xMax || y < yMin || y > yMax;
    });
  const normalized = (Array.isArray(nextSectors) ? nextSectors : []).map(normalizeSector);
  const merged = retained.concat(normalized);
  saveSectors(merged);
  return normalized;
}

function replaceCachedSector(nextSector) {
  const normalized = normalizeSector(nextSector);
  const retained = loadSectors()
    .map(normalizeSector)
    .filter((sector) => normalizeSectorId(sector) !== normalized.sectorId);
  const merged = retained.concat(normalized);
  saveSectors(merged);
  return normalized;
}

function removeCachedSector(sectorId) {
  const retained = loadSectors()
    .map(normalizeSector)
    .filter((sector) => normalizeSectorId(sector) !== String(sectorId));
  saveSectors(retained);
}

function normalizeSectorId(sector) {
  if (sector?.sectorId) return String(sector.sectorId);
  const galaxyId = String(sector?.galaxyId ?? sector?.metadata?.galaxyId ?? "galaxy");
  const gridX = Number(sector?.metadata?.gridX ?? sector?.x ?? sector?.sectorX ?? 0);
  const gridY = Number(sector?.metadata?.gridY ?? sector?.y ?? sector?.sectorY ?? 0);
  return `${galaxyId}:${gridX},${gridY}`;
}

function normalizeSector(sector) {
  const metadata = sector?.metadata && typeof sector.metadata === "object" ? sector.metadata : {};
  const normalizedHexStarTypes = hasObjectEntries(metadata.hexStarTypes)
    ? normalizeHexStarTypesMap(metadata.hexStarTypes)
    : metadata.hexStarTypes;
  return {
    ...sector,
    galaxyId: String(sector?.galaxyId ?? metadata.galaxyId ?? ""),
    sectorId: normalizeSectorId(sector),
    coordinates: {
      x: Number(sector?.coordinates?.x ?? metadata.gridX ?? sector?.x ?? sector?.sectorX ?? 0),
      y: Number(sector?.coordinates?.y ?? metadata.gridY ?? sector?.y ?? sector?.sectorY ?? 0),
    },
    densityClass: Number(sector?.densityClass ?? 0),
    densityVariation: Number(sector?.densityVariation ?? 0),
    metadata: {
      ...metadata,
      hexStarTypes: normalizedHexStarTypes,
      gridX: Number(metadata.gridX ?? sector?.x ?? sector?.sectorX ?? 0),
      gridY: Number(metadata.gridY ?? sector?.y ?? sector?.sectorY ?? 0),
      lastUpdated: metadata.lastUpdated ?? new Date().toISOString(),
    },
  };
}

function sectorsForGalaxy(sectors, galaxyId) {
  if (!galaxyId) return sectors;
  return sectors.filter((sector) => String(sector.galaxyId) === String(galaxyId));
}

function normalizeSectorPayload(sector) {
  const normalized = normalizeSector(sector);
  return {
    sectorId: normalized.sectorId,
    galaxyId: normalized.galaxyId,
    coordinates: normalized.coordinates,
    densityClass: normalized.densityClass,
    densityVariation: normalized.densityVariation,
    metadata: normalized.metadata,
  };
}

export async function getSectors(galaxyId, options = {}) {
  try {
    const sectors = await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors?limit=10000`, options);
    return replaceCachedSectorsForGalaxy(galaxyId, Array.isArray(sectors) ? sectors : []);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return sectorsForGalaxy(loadSectors(), galaxyId).map(normalizeSector);
  }
}

export async function getSectorsWindow(galaxyId, { xMin, xMax, yMin, yMax, limit = 2500, signal } = {}) {
  const params = new URLSearchParams({
    xMin: String(Number(xMin)),
    xMax: String(Number(xMax)),
    yMin: String(Number(yMin)),
    yMax: String(Number(yMax)),
    limit: String(Math.min(Math.max(1, Number(limit) || 2500), 10000)),
  });

  try {
    const sectors = await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors?${params.toString()}`, { signal });
    return replaceCachedSectorsInWindow(galaxyId, Array.isArray(sectors) ? sectors : [], { xMin, xMax, yMin, yMax })
      .map(normalizeSector)
      .filter((sector) => {
        const x = Number(sector?.coordinates?.x);
        const y = Number(sector?.coordinates?.y);
        return Number.isFinite(x) && Number.isFinite(y) && x >= xMin && x <= xMax && y >= yMin && y <= yMax;
      });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return sectorsForGalaxy(loadSectors(), galaxyId)
      .map(normalizeSector)
      .filter((sector) => {
        const x = Number(sector?.coordinates?.x);
        const y = Number(sector?.coordinates?.y);
        return Number.isFinite(x) && Number.isFinite(y) && x >= xMin && x <= xMax && y >= yMin && y <= yMax;
      });
  }
}

export async function getSectorStats(galaxyId, options = {}) {
  try {
    return await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors/stats`, options);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    const sectors = await getSectors(galaxyId, options);
    const generatedPresenceSectors = sectors.filter((sector) => sector.metadata?.hexPresenceGenerated).length;
    const populatedSectors = sectors.filter((sector) => Number(sector.metadata?.systemCount) > 0).length;
    const totalObjects = sectors.reduce((sum, sector) => sum + (Number(sector.metadata?.systemCount) || 0), 0);
    const totalSectors = sectors.length;
    return {
      totalSectors,
      populatedSectors,
      generatedPresenceSectors,
      emptySectors: Math.max(0, totalSectors - populatedSectors),
      totalObjects,
      avgObjectsPerSector: totalSectors > 0 ? totalObjects / totalSectors : 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getSector(sectorId) {
  try {
    const sector = await request(`/sectors/${encodeURIComponent(sectorId)}`);
    return replaceCachedSector(sector);
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    if (/not found|404/i.test(String(err?.message || ""))) {
      removeCachedSector(sectorId);
      throw err;
    }
    const cached = loadSectors().find((sector) => normalizeSectorId(sector) === String(sectorId));
    if (!cached) {
      throw new Error(`Sector not found: ${sectorId}`);
    }
    return normalizeSector(cached);
  }
}

export async function getSectorStrict(sectorId, options = {}) {
  const sector = await request(`/sectors/${encodeURIComponent(sectorId)}`, options);
  return replaceCachedSector(sector);
}

export async function createSectorStrict(sector, options = {}) {
  const payload = normalizeSectorPayload(sector);
  const created = await request("/sectors", {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
  mergeCachedSectors([created], options);
  return normalizeSector(created);
}

export async function updateSectorStrict(sectorId, payload, options = {}) {
  const body = normalizeSectorPayload({ ...payload, sectorId });
  const updated = await request(`/sectors/${encodeURIComponent(sectorId)}`, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
  mergeCachedSectors([updated], options);
  return normalizeSector(updated);
}

export async function createSector(sector, options = {}) {
  const payload = normalizeSectorPayload(sector);
  try {
    const created = await request("/sectors", {
      method: "POST",
      body: JSON.stringify(payload),
      ...options,
    });
    mergeCachedSectors([created], options);
    return normalizeSector(created);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    mergeCachedSectors([payload], options);
    return normalizeSector(payload);
  }
}

export async function upsertSector(sector, options = {}) {
  const payload = normalizeSectorPayload(sector);
  try {
    const updated = await request("/sectors/upsert", {
      method: "POST",
      body: JSON.stringify(payload),
      ...options,
    });
    mergeCachedSectors([updated], options);
    return normalizeSector(updated);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    mergeCachedSectors([payload], options);
    return normalizeSector(payload);
  }
}

export async function upsertSectorStrict(sector, options = {}) {
  const payload = normalizeSectorPayload(sector);
  const updated = await request("/sectors/upsert", {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
  mergeCachedSectors([updated], options);
  return normalizeSector(updated);
}

export async function updateSector(sectorId, payload, options = {}) {
  const body = normalizeSectorPayload({ ...payload, sectorId });
  try {
    const updated = await request(`/sectors/${encodeURIComponent(sectorId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
    mergeCachedSectors([updated], options);
    return normalizeSector(updated);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    mergeCachedSectors([body], options);
    return normalizeSector(body);
  }
}

export async function deleteSector(sectorId) {
  const normalizedSectorId = String(sectorId || "").trim();
  if (!normalizedSectorId) {
    throw new Error("sectorId is required");
  }

  try {
    await request(`/sectors/${encodeURIComponent(normalizedSectorId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (!/not found|404/i.test(String(error?.message || ""))) {
      throw error;
    }
  }

  removeCachedSector(normalizedSectorId);
  return { sectorId: normalizedSectorId };
}

export async function createSectorsBatch(sectors, options = {}) {
  const items = Array.isArray(sectors) ? sectors : [];
  const payload = items.map(normalizeSectorPayload);
  try {
    await request("/sectors/batch", {
      method: "POST",
      body: JSON.stringify(payload),
      ...options,
    });
    mergeCachedSectors(payload, options);
    return payload.map(normalizeSector);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    const fallbackOptions = options?.persistCache === false ? { ...options, persistCache: true } : options;
    const created = [];
    for (const sector of payload) {
      created.push(await upsertSector(sector, fallbackOptions));
    }
    return created;
  }
}

export async function pruneDefaultSectors(galaxyId) {
  try {
    const result = await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors/prune-defaults`, {
      method: "POST",
    });
    const remaining = loadSectors().filter((sector) => {
      const matchesGalaxy = String(sector.galaxyId) === String(galaxyId);
      const isGenerated = Boolean(sector?.metadata?.hexPresenceGenerated) || Number(sector?.metadata?.systemCount) > 0;
      return !matchesGalaxy || isGenerated;
    });
    saveSectors(remaining);
    return {
      prunedCount: Number(result?.deleted ?? 0),
      message:
        Number(result?.deleted ?? 0) > 0 ? `Pruned ${result.deleted} default sectors.` : "No default sectors found.",
    };
  } catch {
    const sectors = loadSectors();
    const kept = [];
    let prunedCount = 0;
    for (const sector of sectors) {
      const matchesGalaxy = String(sector.galaxyId) === String(galaxyId);
      const isGenerated = Boolean(sector?.metadata?.hexPresenceGenerated) || Number(sector?.metadata?.systemCount) > 0;
      if (matchesGalaxy && !isGenerated) {
        prunedCount += 1;
        continue;
      }
      kept.push(sector);
    }
    saveSectors(kept);
    return {
      prunedCount,
      message: prunedCount > 0 ? `Pruned ${prunedCount} default sectors.` : "No default sectors found.",
    };
  }
}

export async function resetUniverseData() {
  return request("/admin/reset-universe", {
    method: "POST",
  });
}
