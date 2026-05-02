export function normalizeWorldLink(record = {}, options = {}) {
  const includeSourceWorld = options?.includeSourceWorld !== false;
  const fallbackWorldName = String(options?.fallbackWorldName || "").trim();
  const sourceWorld =
    includeSourceWorld && record?.sourceWorld && typeof record.sourceWorld === "object"
      ? { ...record.sourceWorld }
      : null;
  const systemId = String(record?.systemId || "").trim();
  const worldName = String(record?.worldName || sourceWorld?.name || fallbackWorldName).trim();
  const worldKey = String(record?.worldKey || [systemId, worldName].filter(Boolean).join(":")).trim();

  if (!includeSourceWorld) {
    return { systemId, worldName, worldKey };
  }

  return { systemId, worldName, worldKey, sourceWorld };
}

export function matchesWorldFilter(record = {}, criteria = {}, options = {}) {
  const recordLink = normalizeWorldLink(record, options);
  const worldKey = String(criteria?.worldKey || "").trim();
  const systemId = String(criteria?.systemId || "").trim();
  const worldName = String(criteria?.worldName || "")
    .trim()
    .toLowerCase();

  if (!worldKey && !systemId && !worldName) {
    return true;
  }

  return (
    (!worldKey || recordLink.worldKey === worldKey) &&
    (!systemId || recordLink.systemId === systemId) &&
    (!worldName || recordLink.worldName.toLowerCase() === worldName)
  );
}

export function sortByUpdatedAtDesc(left, right) {
  return String(right?.updatedAt || "").localeCompare(String(left?.updatedAt || ""));
}

export function normalizeSystemHex(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(0, 4);
}

export function listSystemWorldOptions(systems = []) {
  if (!Array.isArray(systems)) {
    return [];
  }

  return systems.flatMap((system) => {
    const candidateWorlds =
      Array.isArray(system?.planets) && system.planets.length
        ? system.planets
        : Array.isArray(system?.worlds) && system.worlds.length
          ? system.worlds
          : system?.mainworld
            ? [system.mainworld]
            : [];

    return candidateWorlds
      .filter((world) => world && typeof world === "object")
      .map((world, index) => {
        const systemId = String(system?.systemId || "");
        const resolvedIndex = Number.isInteger(world?.worldIndex) && world.worldIndex >= 0 ? world.worldIndex : index;
        const worldName = String(world?.name || "");
        const systemLabel = String(system?.name || system?.systemName || "Unnamed System");

        return {
          key: `${systemId || system?.name || "system"}:${worldName || resolvedIndex}`,
          label: `${worldName || `World ${resolvedIndex + 1}`} — ${systemLabel}`,
          world,
          systemId,
          worldIndex: resolvedIndex,
          worldName,
        };
      });
  });
}

export function resolveSelectedWorldIndex(selectedWorldOption = null, route = {}) {
  const explicitIndex = Number(selectedWorldOption?.worldIndex ?? route?.query?.worldIndex ?? -1);
  return Number.isInteger(explicitIndex) && explicitIndex >= 0 ? explicitIndex : null;
}

export function resolveBoundSystemRecord({ selectedWorldOption = null, route = {}, systemStore }) {
  const explicitRecordId = String(selectedWorldOption?.systemId || route?.query?.systemRecordId || "").trim();
  const systems = Array.isArray(systemStore?.systems) ? systemStore.systems : [];

  if (explicitRecordId) {
    return systems.find((entry) => String(entry?.systemId) === explicitRecordId) ?? null;
  }

  const routeSystemHex = normalizeSystemHex(route?.params?.systemId || route?.query?.systemId || "");
  const currentSystem = systemStore?.getCurrentSystem || null;
  if (currentSystem) {
    const currentSystemHex = normalizeSystemHex(
      `${currentSystem?.hexCoordinates?.x ?? ""}${currentSystem?.hexCoordinates?.y ?? ""}`,
    );
    if (
      !routeSystemHex ||
      currentSystemHex === routeSystemHex ||
      String(currentSystem?.systemId || "").endsWith(`:${routeSystemHex}`)
    ) {
      return currentSystem;
    }
  }

  return null;
}

export function findMatchingWorldOption(options = [], route = {}) {
  if (!Array.isArray(options) || !options.length) {
    return null;
  }

  const targetSystemId = String(route?.query?.systemRecordId || route?.query?.systemId || "").trim();
  const targetWorldName = String(route?.query?.worldName || "")
    .trim()
    .toLowerCase();
  const targetWorldIndex = Number(route?.query?.worldIndex ?? -1);

  return (
    options.find(
      (entry) =>
        (!targetSystemId || entry.systemId === targetSystemId) &&
        ((targetWorldName &&
          String(entry.worldName || "")
            .trim()
            .toLowerCase() === targetWorldName) ||
          (targetWorldIndex >= 0 && entry.worldIndex === targetWorldIndex)),
    ) ||
    options.find((entry) => targetSystemId && entry.systemId === targetSystemId) ||
    null
  );
}
