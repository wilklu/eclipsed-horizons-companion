function parseJson(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function stringifyJson(value, fallback) {
  if (value === undefined) {
    return JSON.stringify(fallback);
  }

  return JSON.stringify(value);
}

export function toGalaxy(row) {
  if (!row) return null;

  return {
    ...row,
    morphology: parseJson(row.morphology, {}),
    metadata: parseJson(row.metadata, {}),
    importMetadata: parseJson(row.importMetadata, {}),
  };
}

export function fromGalaxy(payload) {
  return {
    galaxyId: payload.galaxyId,
    name: payload.name,
    type: payload.type,
    morphology: stringifyJson(payload.morphology, {}),
    metadata: stringifyJson(payload.metadata, {}),
    importMetadata: stringifyJson(payload.importMetadata, {
      isImported: false,
      sourceGalaxy: null,
      originalGalaxyId: null,
    }),
  };
}

export function toSector(row) {
  if (!row) return null;

  return {
    ...row,
    coordinates: parseJson(row.coordinates, {}),
    metadata: parseJson(row.metadata, {}),
  };
}

export function fromSector(payload) {
  return {
    sectorId: payload.sectorId,
    galaxyId: payload.galaxyId,
    coordinates: stringifyJson(payload.coordinates, {}),
    densityClass: payload.densityClass,
    densityVariation: payload.densityVariation ?? null,
    metadata: stringifyJson(payload.metadata, {}),
  };
}

export function toSystem(row) {
  if (!row) return null;

  return {
    ...row,
    hexCoordinates: parseJson(row.hexCoordinates, {}),
    primaryStar: parseJson(row.primaryStar, {}),
    companionStars: parseJson(row.companionStars, []),
    habitableZone: row.habitable_zone,
    metadata: parseJson(row.metadata, {}),
  };
}

export function fromSystem(payload) {
  return {
    systemId: payload.systemId,
    sectorId: payload.sectorId,
    hexCoordinates: stringifyJson(payload.hexCoordinates, {}),
    starCount: payload.starCount,
    primaryStar: stringifyJson(payload.primaryStar, {}),
    companionStars:
      payload.companionStars === undefined || payload.companionStars === null
        ? null
        : JSON.stringify(payload.companionStars),
    habitableZone: payload.habitableZone ?? null,
    metadata: stringifyJson(payload.metadata, {}),
  };
}

export function toWorld(row) {
  if (!row) return null;

  return {
    ...row,
    physical: parseJson(row.physical, {}),
    census: parseJson(row.census, {}),
    tradeCodes: parseJson(row.tradeCodes, []),
    metadata: parseJson(row.metadata, {}),
  };
}

export function fromWorld(payload) {
  return {
    worldId: payload.worldId,
    systemId: payload.systemId,
    name: payload.name,
    orbit: payload.orbit,
    uwp: payload.uwp,
    physical: stringifyJson(payload.physical, {}),
    census: stringifyJson(payload.census, {}),
    tradeCodes:
      payload.tradeCodes === undefined || payload.tradeCodes === null ? null : JSON.stringify(payload.tradeCodes),
    starport: payload.starport ?? null,
    metadata: stringifyJson(payload.metadata, {}),
  };
}

export function toSophont(row) {
  if (!row) return null;

  return {
    ...row,
    culture: parseJson(row.culture, {}),
    population: parseJson(row.population, {}),
    metadata: parseJson(row.metadata, {}),
  };
}

export function fromSophont(payload) {
  return {
    sophontId: payload.sophontId,
    worldId: payload.worldId,
    name: payload.name,
    bodyPlan: payload.bodyPlan,
    culture: stringifyJson(payload.culture, {}),
    population:
      payload.population === undefined || payload.population === null ? null : JSON.stringify(payload.population),
    techLevel: payload.techLevel,
    metadata: stringifyJson(payload.metadata, {}),
  };
}
