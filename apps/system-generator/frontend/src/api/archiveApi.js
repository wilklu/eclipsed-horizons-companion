const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api").replace(/\/$/, "");

export function isAbortError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name === "aborterror" || code === "abort_err" || message.includes("aborted") || message.includes("abort");
}

export async function request(path, options = {}) {
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

function loadRecords(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(storageKey, records) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore local persistence cleanup failures.
    }
  }
}

export function createArchiveId(prefix = "archive") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildWorldLink(record = {}, options = {}) {
  const includeSourceWorld = options?.includeSourceWorld !== false;
  const sourceWorld =
    includeSourceWorld && record?.sourceWorld && typeof record.sourceWorld === "object"
      ? { ...record.sourceWorld }
      : null;
  const fallbackWorldName = String(options?.fallbackWorldName || "").trim();
  const systemId = String(record?.systemId || "").trim();
  const worldName = String(record?.worldName || sourceWorld?.name || fallbackWorldName).trim();
  const worldKey = String(record?.worldKey || [systemId, worldName].filter(Boolean).join(":")).trim();

  if (!includeSourceWorld) {
    return { systemId, worldName, worldKey };
  }

  return { systemId, worldName, worldKey, sourceWorld };
}

export function buildWorldQueryParams(criteria = {}, extras = {}) {
  const params = new URLSearchParams();

  if (criteria?.systemId) params.set("systemId", String(criteria.systemId));
  if (criteria?.worldName) params.set("worldName", String(criteria.worldName));
  if (criteria?.worldKey) params.set("worldKey", String(criteria.worldKey));

  for (const [key, value] of Object.entries(extras)) {
    if (value == null) continue;
    const normalized = String(value).trim();
    if (normalized) {
      params.set(key, normalized);
    }
  }

  return params;
}

export function matchesWorldLinkedRecord(record = {}, criteria = {}) {
  const worldKey = String(criteria?.worldKey || "").trim();
  const systemId = String(criteria?.systemId || "").trim();
  const worldName = String(criteria?.worldName || "")
    .trim()
    .toLowerCase();

  if (!worldKey && !systemId && !worldName) {
    return true;
  }

  return (
    (!worldKey || String(record?.worldKey || "").trim() === worldKey) &&
    (!systemId || String(record?.systemId || "").trim() === systemId) &&
    (!worldName ||
      String(record?.worldName || "")
        .trim()
        .toLowerCase() === worldName)
  );
}

export function createArchiveApi({
  storageKey,
  listPath,
  normalizeRecord,
  buildQueryParams = (criteria) => buildWorldQueryParams(criteria),
  matchesFilter = matchesWorldLinkedRecord,
  upsertPath = `${listPath}/upsert`,
  deletePath = (recordId) => `${listPath}/${encodeURIComponent(recordId)}`,
}) {
  function mergeCachedRecords(nextRecords) {
    const byId = new Map(loadRecords(storageKey).map((record) => [String(record?.id || ""), normalizeRecord(record)]));
    for (const record of nextRecords) {
      const normalized = normalizeRecord(record);
      byId.set(normalized.id, normalized);
    }
    const merged = Array.from(byId.values()).filter((record) => record.id);
    saveRecords(storageKey, merged);
    return merged;
  }

  function removeCachedRecord(recordId) {
    const remaining = loadRecords(storageKey).filter((record) => String(record?.id || "") !== String(recordId || ""));
    saveRecords(storageKey, remaining);
    return remaining.map(normalizeRecord);
  }

  return {
    async list(criteria = {}, options = {}) {
      try {
        const params = buildQueryParams(criteria);
        const query = params.toString();
        const records = await request(`${listPath}${query ? `?${query}` : ""}`, options);
        return mergeCachedRecords(Array.isArray(records) ? records : []).filter((record) =>
          matchesFilter(record, criteria),
        );
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        return loadRecords(storageKey)
          .map(normalizeRecord)
          .filter((record) => matchesFilter(record, criteria));
      }
    },

    async upsert(record = {}, options = {}) {
      const payload = normalizeRecord(record);
      try {
        const saved = await request(upsertPath, {
          method: "POST",
          body: JSON.stringify(payload),
          ...options,
        });
        mergeCachedRecords([saved]);
        return normalizeRecord(saved);
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        mergeCachedRecords([payload]);
        return payload;
      }
    },

    async remove(recordId, options = {}) {
      try {
        await request(deletePath(recordId), {
          method: "DELETE",
          ...options,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
      }

      return removeCachedRecord(recordId);
    },
  };
}

export function createWorldLinkedArchiveApi({
  storageKey,
  listPath,
  normalizeRecord,
  queryExtras = {},
  upsertPath = `${listPath}/upsert`,
  deletePath = (recordId) => `${listPath}/${encodeURIComponent(recordId)}`,
}) {
  return createArchiveApi({
    storageKey,
    listPath,
    normalizeRecord,
    buildQueryParams: (criteria) =>
      buildWorldQueryParams(criteria, typeof queryExtras === "function" ? queryExtras(criteria) : queryExtras),
    matchesFilter: (record, criteria) => matchesWorldLinkedRecord(normalizeRecord(record), criteria),
    upsertPath,
    deletePath,
  });
}
