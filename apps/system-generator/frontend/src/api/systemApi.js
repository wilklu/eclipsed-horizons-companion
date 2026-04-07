const STORAGE_KEY = "eclipsed-horizons-systems";
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

function loadSystems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSystems(systems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
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
  return {
    ...snapshot,
    ...system,
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
    metadata,
  };
}

function mergeCachedSystems(nextSystems) {
  const byId = new Map(loadSystems().map((system) => [String(system?.systemId || ""), normalizeSystem(system)]));
  for (const system of nextSystems) {
    const normalized = normalizeSystem(system);
    byId.set(normalized.systemId, normalized);
  }
  const merged = Array.from(byId.values()).filter((system) => system.systemId);
  saveSystems(merged);
  return merged;
}

function replaceCachedSystemsForSector(sectorId, nextSystems) {
  const retained = loadSystems()
    .map(normalizeSystem)
    .filter((system) => String(system?.sectorId) !== String(sectorId));
  const normalized = (Array.isArray(nextSystems) ? nextSystems : [])
    .map(normalizeSystem)
    .filter((system) => system.systemId);
  const merged = retained.concat(normalized);
  saveSystems(merged);
  return normalized;
}

export async function getSystemsBySector(sectorId) {
  try {
    const systems = await request(`/sectors/${encodeURIComponent(sectorId)}/systems`);
    return replaceCachedSystemsForSector(sectorId, Array.isArray(systems) ? systems : []);
  } catch {
    return loadSystems()
      .map(normalizeSystem)
      .filter((system) => String(system?.sectorId) === String(sectorId));
  }
}

export async function upsertSystem(system) {
  const payload = normalizeSystem(system);
  try {
    const updated = await request("/systems/upsert", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    mergeCachedSystems([updated]);
    return normalizeSystem(updated);
  } catch {
    mergeCachedSystems([payload]);
    return payload;
  }
}

export async function updateSystem(systemId, updates) {
  const payload = normalizeSystem({ ...updates, systemId });
  try {
    const updated = await request(`/systems/${encodeURIComponent(systemId)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    mergeCachedSystems([updated]);
    return normalizeSystem(updated);
  } catch {
    mergeCachedSystems([payload]);
    return payload;
  }
}

export async function replaceSystemsForSector(sectorId, systems) {
  const payload = Array.isArray(systems) ? systems.map(normalizeSystem) : [];
  try {
    const updated = await request(`/sectors/${encodeURIComponent(sectorId)}/systems/replace`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return replaceCachedSystemsForSector(sectorId, Array.isArray(updated) ? updated : []);
  } catch {
    const existing = loadSystems()
      .map(normalizeSystem)
      .filter((system) => String(system?.sectorId) !== String(sectorId));
    const merged = existing.concat(payload);
    saveSystems(merged);
    return payload;
  }
}
