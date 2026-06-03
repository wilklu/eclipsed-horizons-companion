export const WORLD_HEX_TAGS = Object.freeze({
  OCEAN: "Ocean",
  ICE_FIELD: "Ice Field",
  SHORELINE: "Shoreline",
  CONTINENT: "Continent",
  FROZEN_LANDS: "Frozen Lands",
  ISLAND: "Island",
  ICE_CAP: "Ice Cap",
  WATER: "Water",
  CROPLAND: "Cropland",
  TOWN: "Town",
  CITY: "City",
  DOMED_CITY: "Domed City",
  ARCOLOGY: "Arcology",
  RURAL: "Rural",
  STARPORT: "Starport",
  SPACEPORT: "Spaceport",
  TWILIGHT_ZONE: "Twilight Zone",
  BAKED_LANDS: "Baked Lands",
  PENAL_COLONY: "Penal Colony",
  WASTELAND: "Wasteland",
  EXOTIC: "Exotic",
  NOBLE_LANDS: "Noble Lands",
  RESOURCES: "Resources",
  MOUNTAIN: "Mountain",
  CHASM: "Chasm",
  PRECIPICE: "Precipice",
  CRATER: "Crater",
  DESERT: "Desert",
  RUINS: "Ruins",
});

export const WORLD_HEX_TAG_GROUPS = Object.freeze({
  TERRAIN: "terrain",
  FEATURE: "feature",
});

const TERRAIN_TAGS = new Set([
  WORLD_HEX_TAGS.OCEAN,
  WORLD_HEX_TAGS.ICE_FIELD,
  WORLD_HEX_TAGS.WATER,
  WORLD_HEX_TAGS.CONTINENT,
  WORLD_HEX_TAGS.FROZEN_LANDS,
  WORLD_HEX_TAGS.ISLAND,
  WORLD_HEX_TAGS.ICE_CAP,
  WORLD_HEX_TAGS.TWILIGHT_ZONE,
  WORLD_HEX_TAGS.MOUNTAIN,
  WORLD_HEX_TAGS.DESERT,
  WORLD_HEX_TAGS.CRATER,
  WORLD_HEX_TAGS.WASTELAND,
  WORLD_HEX_TAGS.EXOTIC,
]);

const FEATURE_TAGS = new Set([
  WORLD_HEX_TAGS.SHORELINE,
  WORLD_HEX_TAGS.CROPLAND,
  WORLD_HEX_TAGS.TOWN,
  WORLD_HEX_TAGS.CITY,
  WORLD_HEX_TAGS.DOMED_CITY,
  WORLD_HEX_TAGS.ARCOLOGY,
  WORLD_HEX_TAGS.RURAL,
  WORLD_HEX_TAGS.STARPORT,
  WORLD_HEX_TAGS.SPACEPORT,
  WORLD_HEX_TAGS.BAKED_LANDS,
  WORLD_HEX_TAGS.PENAL_COLONY,
  WORLD_HEX_TAGS.NOBLE_LANDS,
  WORLD_HEX_TAGS.RESOURCES,
  WORLD_HEX_TAGS.CHASM,
  WORLD_HEX_TAGS.PRECIPICE,
  WORLD_HEX_TAGS.RUINS,
]);

function ensureHexEntry(tagMap, cell) {
  if (!cell || !cell.key) {
    return null;
  }

  if (!tagMap.has(cell.key)) {
    tagMap.set(cell.key, {
      ...cell,
      tags: new Set(),
      terrainTags: new Set(),
      featureTags: new Set(),
    });
  }

  return tagMap.get(cell.key);
}

function addTag(tagMap, key, tag) {
  const entry = tagMap.get(key);
  if (!entry || !tag) {
    return;
  }

  entry.tags.add(tag);

  if (TERRAIN_TAGS.has(tag)) {
    entry.terrainTags.add(tag);
  }

  if (FEATURE_TAGS.has(tag)) {
    entry.featureTags.add(tag);
  }
}

function addLayerTags(tagMap, layerMap, tag) {
  if (!layerMap || typeof layerMap.keys !== "function") {
    return;
  }

  for (const key of layerMap.keys()) {
    addTag(tagMap, key, tag);
  }
}

function finalizeHexEntry(entry) {
  return {
    ...entry,
    tags: [...entry.tags].sort(),
    terrainTags: [...entry.terrainTags].sort(),
    featureTags: [...entry.featureTags].sort(),
    hasTerrainTags: entry.terrainTags.size > 0,
    hasFeatureTags: entry.featureTags.size > 0,
  };
}

export function buildWorldHexTagIndex({
  cells = [],
  topologyGraph = null,
  oceanTriangleIds = [],
  layerHexMaps = [],
  frozenWorld = false,
} = {}) {
  const entries = new Map();

  for (const cell of cells) {
    ensureHexEntry(entries, cell);
  }

  const triangles = Array.isArray(topologyGraph?.triangles) ? topologyGraph.triangles : [];
  const oceanSet = new Set((Array.isArray(oceanTriangleIds) ? oceanTriangleIds : []).filter(Boolean));
  const shorelineTriangleIds = new Set();
  const oceanHexKeys = new Set();
  const islandHexKeys = new Set();
  const iceCapHexKeys = new Set();

  for (const cell of cells) {
    const faceId = String(cell?.faceId || "").trim();
    if (faceId && oceanSet.has(faceId) && cell?.key) {
      oceanHexKeys.add(cell.key);
    }
  }

  for (const [layerMap, tag] of layerHexMaps) {
    if (tag === WORLD_HEX_TAGS.ICE_CAP && layerMap && typeof layerMap.keys === "function") {
      for (const key of layerMap.keys()) {
        iceCapHexKeys.add(key);
      }
    }

    if (tag !== WORLD_HEX_TAGS.MOUNTAIN || !layerMap || typeof layerMap.keys !== "function") {
      continue;
    }

    for (const key of layerMap.keys()) {
      if (oceanHexKeys.has(key)) {
        islandHexKeys.add(key);
      }
    }
  }

  for (const triangle of triangles) {
    const triangleId = String(triangle?.id || "").trim();
    if (!triangleId || oceanSet.has(triangleId)) {
      continue;
    }

    const neighbors = Array.isArray(triangle?.neighbors) ? triangle.neighbors : [];
    if (neighbors.some((neighborId) => oceanSet.has(neighborId))) {
      shorelineTriangleIds.add(triangleId);
    }
  }

  for (const cell of cells) {
    const faceId = String(cell?.faceId || "").trim();
    if (!faceId) {
      continue;
    }

    if (frozenWorld && iceCapHexKeys.has(cell.key)) {
      continue;
    }

    if (frozenWorld) {
      if (oceanSet.has(faceId) && !islandHexKeys.has(cell.key)) {
        addTag(entries, cell.key, WORLD_HEX_TAGS.ICE_FIELD);
      } else {
        addTag(entries, cell.key, WORLD_HEX_TAGS.FROZEN_LANDS);
      }

      if (shorelineTriangleIds.has(faceId)) {
        addTag(entries, cell.key, WORLD_HEX_TAGS.SHORELINE);
      }
      continue;
    }

    if (oceanSet.has(faceId) && islandHexKeys.has(cell.key)) {
      addTag(entries, cell.key, WORLD_HEX_TAGS.ISLAND);
    } else if (oceanSet.has(faceId)) {
      addTag(entries, cell.key, WORLD_HEX_TAGS.OCEAN);
    } else if (shorelineTriangleIds.has(faceId)) {
      addTag(entries, cell.key, WORLD_HEX_TAGS.SHORELINE);
    } else {
      addTag(entries, cell.key, WORLD_HEX_TAGS.CONTINENT);
    }
  }

  for (const [layerMap, tag] of layerHexMaps) {
    if (tag === WORLD_HEX_TAGS.MOUNTAIN && layerMap && typeof layerMap.keys === "function") {
      for (const key of layerMap.keys()) {
        if (islandHexKeys.has(key)) {
          continue;
        }
        addTag(entries, key, tag);
      }
      continue;
    }

    addLayerTags(entries, layerMap, tag);
  }

  const finalizedEntries = [...entries.values()].map(finalizeHexEntry).sort((left, right) => {
    const leftKey = String(left?.key || "");
    const rightKey = String(right?.key || "");
    return leftKey.localeCompare(rightKey);
  });

  return {
    entries: finalizedEntries,
    byKey: new Map(finalizedEntries.map((entry) => [entry.key, entry])),
    shorelineTriangleIds: [...shorelineTriangleIds].sort(),
    oceanTriangleIds: [...oceanSet].sort(),
    terrainTags: finalizedEntries.flatMap((entry) => entry.terrainTags),
    featureTags: finalizedEntries.flatMap((entry) => entry.featureTags),
  };
}

export function buildWorldTerrainHexTagSnapshot(
  index = {},
  { systemId = null, worldIndex = null, worldName = "", updatedAt = new Date().toISOString() } = {},
) {
  const entries = Array.isArray(index?.entries) ? index.entries : [];
  const normalizedEntries = entries.map((entry) => ({
    key: String(entry?.key || "").trim(),
    faceId: String(entry?.faceId || "").trim() || null,
    tags: Array.isArray(entry?.tags) ? [...entry.tags] : [],
    terrainTags: Array.isArray(entry?.terrainTags) ? [...entry.terrainTags] : [],
    featureTags: Array.isArray(entry?.featureTags) ? [...entry.featureTags] : [],
    hasTerrainTags: Boolean(entry?.hasTerrainTags),
    hasFeatureTags: Boolean(entry?.hasFeatureTags),
  }));

  const hexesByKey = normalizedEntries.reduce((accumulator, entry) => {
    if (entry.key) {
      accumulator[entry.key] = entry;
    }
    return accumulator;
  }, {});

  const payload = {
    systemId: String(systemId || "").trim() || null,
    worldIndex: Number.isInteger(worldIndex) ? worldIndex : null,
    worldName: String(worldName || "").trim() || null,
    updatedAt,
    taggedHexCount: normalizedEntries.length,
    terrainTaggedHexCount: normalizedEntries.filter((entry) => entry.hasTerrainTags).length,
    featureTaggedHexCount: normalizedEntries.filter((entry) => entry.hasFeatureTags).length,
    oceanTriangleIds: Array.isArray(index?.oceanTriangleIds) ? [...index.oceanTriangleIds].sort() : [],
    shorelineTriangleIds: Array.isArray(index?.shorelineTriangleIds) ? [...index.shorelineTriangleIds].sort() : [],
    hexesByKey,
  };

  return {
    ...payload,
    signature: JSON.stringify({
      systemId: payload.systemId,
      worldIndex: payload.worldIndex,
      worldName: payload.worldName,
      taggedHexCount: payload.taggedHexCount,
      terrainTaggedHexCount: payload.terrainTaggedHexCount,
      featureTaggedHexCount: payload.featureTaggedHexCount,
      oceanTriangleIds: payload.oceanTriangleIds,
      shorelineTriangleIds: payload.shorelineTriangleIds,
      hexesByKey: normalizedEntries,
    }),
  };
}
