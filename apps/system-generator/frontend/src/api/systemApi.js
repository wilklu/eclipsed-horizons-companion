import { applyPlanetaryBodyClassification } from "../utils/systemWorldClassification.js";

const STORAGE_KEY = "eclipsed-horizons-systems";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api").replace(/\/$/, "");

function isAbortError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name === "aborterror" || code === "abort_err" || message.includes("aborted") || message.includes("abort");
}

function isStorageQuotaError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name.includes("quota") || message.includes("quota") || message.includes("exceeded the quota");
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

function loadSystems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSystems(systems) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch (error) {
    if (!isStorageQuotaError(error)) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures; system cache persistence is best-effort only.
    }
  }
}

function shouldPersistSystemCache(options = {}) {
  return options?.persistCache !== false;
}

function normalizeHexCoordinates(value) {
  const x = Number(value?.x ?? 0);
  const y = Number(value?.y ?? 0);
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  };
}

function normalizeSystem(system) {
  const metadata = system?.metadata && typeof system.metadata === "object" ? system.metadata : {};
  const snapshot = metadata?.systemRecord && typeof metadata.systemRecord === "object" ? metadata.systemRecord : {};
  const resolvedName = String(
    system?.name ??
      system?.systemName ??
      system?.systemDesignation ??
      snapshot?.name ??
      snapshot?.systemName ??
      snapshot?.systemDesignation ??
      metadata?.displayName ??
      "",
  ).trim();
  const resolvedSystemDesignation = String(
    system?.systemDesignation ?? snapshot?.systemDesignation ?? resolvedName,
  ).trim();
  const normalizedPlanets = (
    Array.isArray(system?.planets) ? system.planets : Array.isArray(snapshot?.planets) ? snapshot.planets : []
  ).map((planet) => applyPlanetaryBodyClassification(planet));
  const normalizedMainworld =
    system?.mainworld && typeof system.mainworld === "object"
      ? applyPlanetaryBodyClassification(system.mainworld)
      : snapshot?.mainworld && typeof snapshot.mainworld === "object"
        ? applyPlanetaryBodyClassification(snapshot.mainworld)
        : null;

  return {
    ...snapshot,
    ...system,
    ...(resolvedName
      ? {
          name: resolvedName,
          systemName: resolvedName,
        }
      : {}),
    ...(resolvedSystemDesignation ? { systemDesignation: resolvedSystemDesignation } : {}),
    systemId: String(system?.systemId ?? snapshot?.systemId ?? ""),
    sectorId: String(system?.sectorId ?? snapshot?.sectorId ?? metadata?.sectorId ?? ""),
    galaxyId: String(system?.galaxyId ?? snapshot?.galaxyId ?? metadata?.galaxyId ?? ""),
    hexCoordinates: normalizeHexCoordinates(system?.hexCoordinates ?? snapshot?.hexCoordinates),
    primaryStar:
      system?.primaryStar && typeof system.primaryStar === "object"
        ? system.primaryStar
        : (snapshot?.primaryStar ?? {}),
    companionStars: Array.isArray(system?.companionStars)
      ? system.companionStars
      : Array.isArray(snapshot?.companionStars)
        ? snapshot.companionStars
        : [],
    planets: normalizedPlanets,
    mainworld: normalizedMainworld,
    metadata: {
      ...metadata,
      ...(resolvedName ? { displayName: resolvedName } : {}),
      systemRecord: {
        ...snapshot,
        ...(resolvedName
          ? {
              name: resolvedName,
              systemName: resolvedName,
            }
          : {}),
        ...(resolvedSystemDesignation ? { systemDesignation: resolvedSystemDesignation } : {}),
      },
    },
  };
}

function mergeCachedSystems(nextSystems, options = {}) {
  const byId = new Map(loadSystems().map((system) => [String(system?.systemId || ""), normalizeSystem(system)]));
  for (const system of nextSystems) {
    const normalized = normalizeSystem(system);
    byId.set(normalized.systemId, normalized);
  }
  const merged = Array.from(byId.values()).filter((system) => system.systemId);
  if (shouldPersistSystemCache(options)) {
    saveSystems(merged);
  }
  return merged;
}

function replaceCachedSystemsForSector(sectorId, nextSystems, options = {}) {
  const retained = loadSystems()
    .map(normalizeSystem)
    .filter((system) => String(system?.sectorId) !== String(sectorId));
  const normalized = (Array.isArray(nextSystems) ? nextSystems : [])
    .map(normalizeSystem)
    .filter((system) => system.systemId);
  const merged = retained.concat(normalized);
  if (shouldPersistSystemCache(options)) {
    saveSystems(merged);
  }
  return normalized;
}

export async function getSystemsBySector(sectorId, options = {}) {
  try {
    const systems = await request(`/sectors/${encodeURIComponent(sectorId)}/systems`, options);
    return replaceCachedSystemsForSector(sectorId, Array.isArray(systems) ? systems : []);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return loadSystems()
      .map(normalizeSystem)
      .filter((system) => String(system?.sectorId) === String(sectorId));
  }
}

export async function getSystemsBySectorStrict(sectorId, options = {}) {
  const systems = await request(`/sectors/${encodeURIComponent(sectorId)}/systems`, options);
  return replaceCachedSystemsForSector(sectorId, Array.isArray(systems) ? systems : [], options);
}

export async function upsertSystem(system, options = {}) {
  const payload = normalizeSystem(system);
  try {
    const updated = await request("/systems/upsert", {
      method: "POST",
      body: JSON.stringify(payload),
      ...options,
    });
    mergeCachedSystems([updated], options);
    return normalizeSystem(updated);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    mergeCachedSystems([payload], options);
    return payload;
  }
}

export async function upsertSystemStrict(system, options = {}) {
  const payload = normalizeSystem(system);
  const updated = await request("/systems/upsert", {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
  mergeCachedSystems([updated], options);
  return normalizeSystem(updated);
}

export async function updateSystem(systemId, updates, options = {}) {
  const payload = normalizeSystem({ ...updates, systemId });
  try {
    const updated = await request(`/systems/${encodeURIComponent(systemId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      ...options,
    });
    mergeCachedSystems([updated], options);
    return normalizeSystem(updated);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    mergeCachedSystems([payload], options);
    return payload;
  }
}

export async function replaceSystemsForSector(sectorId, systems, options = {}) {
  const payload = Array.isArray(systems) ? systems.map(normalizeSystem) : [];
  try {
    const updated = await request(`/sectors/${encodeURIComponent(sectorId)}/systems/replace`, {
      method: "POST",
      body: JSON.stringify(payload),
      ...options,
    });
    return replaceCachedSystemsForSector(sectorId, Array.isArray(updated) ? updated : [], options);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    const existing = loadSystems()
      .map(normalizeSystem)
      .filter((system) => String(system?.sectorId) !== String(sectorId));
    const merged = existing.concat(payload);
    if (shouldPersistSystemCache(options)) {
      saveSystems(merged);
    }
    return payload;
  }
}

export async function replaceSystemsForSectorStrict(sectorId, systems, options = {}) {
  const payload = Array.isArray(systems) ? systems.map(normalizeSystem) : [];
  const updated = await request(`/sectors/${encodeURIComponent(sectorId)}/systems/replace`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
  return replaceCachedSystemsForSector(sectorId, Array.isArray(updated) ? updated : [], options);
}
