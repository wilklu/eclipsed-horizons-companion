const STORAGE_KEY = "eclipsed-horizons-sectors-cache";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api").replace(/\/$/, "");

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

function saveSectors(sectors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sectors));
}

function mergeCachedSectors(nextSectors) {
  const byId = new Map(loadSectors().map((sector) => [normalizeSectorId(sector), normalizeSector(sector)]));
  for (const sector of nextSectors) {
    const normalized = normalizeSector(sector);
    byId.set(normalized.sectorId, normalized);
  }
  const merged = Array.from(byId.values());
  saveSectors(merged);
  return merged;
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

export async function getSectors(galaxyId) {
  try {
    const sectors = await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors?limit=10000`);
    const merged = mergeCachedSectors(Array.isArray(sectors) ? sectors : []);
    return sectorsForGalaxy(merged, galaxyId).map(normalizeSector);
  } catch {
    return sectorsForGalaxy(loadSectors(), galaxyId).map(normalizeSector);
  }
}

export async function getSectorsWindow(galaxyId, { xMin, xMax, yMin, yMax, limit = 2500 } = {}) {
  const params = new URLSearchParams({
    xMin: String(Number(xMin)),
    xMax: String(Number(xMax)),
    yMin: String(Number(yMin)),
    yMax: String(Number(yMax)),
    limit: String(Math.min(Math.max(1, Number(limit) || 2500), 10000)),
  });

  try {
    const sectors = await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors?${params.toString()}`);
    const merged = mergeCachedSectors(Array.isArray(sectors) ? sectors : []);
    return sectorsForGalaxy(merged, galaxyId)
      .map(normalizeSector)
      .filter((sector) => {
        const x = Number(sector?.coordinates?.x);
        const y = Number(sector?.coordinates?.y);
        return Number.isFinite(x) && Number.isFinite(y) && x >= xMin && x <= xMax && y >= yMin && y <= yMax;
      });
  } catch {
    return sectorsForGalaxy(loadSectors(), galaxyId)
      .map(normalizeSector)
      .filter((sector) => {
        const x = Number(sector?.coordinates?.x);
        const y = Number(sector?.coordinates?.y);
        return Number.isFinite(x) && Number.isFinite(y) && x >= xMin && x <= xMax && y >= yMin && y <= yMax;
      });
  }
}

export async function getSectorStats(galaxyId) {
  try {
    return await request(`/galaxies/${encodeURIComponent(galaxyId)}/sectors/stats`);
  } catch {
    const sectors = await getSectors(galaxyId);
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
    mergeCachedSectors([sector]);
    return normalizeSector(sector);
  } catch {
    const cached = loadSectors().find((sector) => normalizeSectorId(sector) === String(sectorId));
    if (!cached) {
      throw new Error(`Sector not found: ${sectorId}`);
    }
    return normalizeSector(cached);
  }
}

export async function createSector(sector) {
  const payload = normalizeSectorPayload(sector);
  try {
    const created = await request("/sectors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    mergeCachedSectors([created]);
    return normalizeSector(created);
  } catch {
    mergeCachedSectors([payload]);
    return normalizeSector(payload);
  }
}

export async function upsertSector(sector) {
  const payload = normalizeSectorPayload(sector);
  try {
    const updated = await request("/sectors/upsert", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    mergeCachedSectors([updated]);
    return normalizeSector(updated);
  } catch {
    mergeCachedSectors([payload]);
    return normalizeSector(payload);
  }
}

export async function updateSector(sectorId, payload) {
  const body = normalizeSectorPayload({ ...payload, sectorId });
  try {
    const updated = await request(`/sectors/${encodeURIComponent(sectorId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    mergeCachedSectors([updated]);
    return normalizeSector(updated);
  } catch {
    mergeCachedSectors([body]);
    return normalizeSector(body);
  }
}

export async function createSectorsBatch(sectors) {
  const items = Array.isArray(sectors) ? sectors : [];
  const payload = items.map(normalizeSectorPayload);
  try {
    await request("/sectors/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    mergeCachedSectors(payload);
    return payload.map(normalizeSector);
  } catch {
    const created = [];
    for (const sector of payload) {
      created.push(await upsertSector(sector));
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
