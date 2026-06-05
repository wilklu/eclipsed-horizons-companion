export const WORLD_HEX_TAGS = Object.freeze({
  FLATLANDS: "Flatlands",
  HILLS: "Hills",
  VOLCANIC: "Volcanic",
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
  FOREST: "Forest",
  SWAMP: "Swamp",
  ARCTIC: "Arctic",
});

export const WORLD_HEX_TAG_GROUPS = Object.freeze({
  TERRAIN: "terrain",
  FEATURE: "feature",
  BIOME: "biome",
});

export const WORLD_HEX_TERRAIN_CLASSES = Object.freeze({
  OPEN_FLAT: "Open & Flat",
  ELEVATED: "Elevated",
  IMPASSABLE: "Impassable",
  AQUATIC: "Aquatic",
});

export const WORLD_HEX_BIOMES = Object.freeze({
  PLAINS: "Plains",
  DESERT: "Desert",
  MOUNTAIN: "Mountain",
  ARCTIC: "Arctic",
  AQUATIC: "Aquatic",
  FOREST: "Forest",
  SWAMP: "Swamp",
});

const TERRAIN_TAGS = new Set([
  WORLD_HEX_TAGS.FLATLANDS,
  WORLD_HEX_TAGS.HILLS,
  WORLD_HEX_TAGS.VOLCANIC,
  WORLD_HEX_TAGS.OCEAN,
  WORLD_HEX_TAGS.ICE_FIELD,
  WORLD_HEX_TAGS.WATER,
  WORLD_HEX_TAGS.CONTINENT,
  WORLD_HEX_TAGS.FROZEN_LANDS,
  WORLD_HEX_TAGS.ISLAND,
  WORLD_HEX_TAGS.ICE_CAP,
  WORLD_HEX_TAGS.TWILIGHT_ZONE,
  WORLD_HEX_TAGS.MOUNTAIN,
  WORLD_HEX_TAGS.CHASM,
  WORLD_HEX_TAGS.PRECIPICE,
  WORLD_HEX_TAGS.DESERT,
  WORLD_HEX_TAGS.CRATER,
  WORLD_HEX_TAGS.WASTELAND,
  WORLD_HEX_TAGS.EXOTIC,
]);

const BIOME_TAGS = new Set([WORLD_HEX_TAGS.FOREST, WORLD_HEX_TAGS.SWAMP, WORLD_HEX_TAGS.ARCTIC]);

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
  WORLD_HEX_TAGS.RUINS,
]);

const TAG_TERRAIN_CLASS = new Map([
  [WORLD_HEX_TAGS.FLATLANDS, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.HILLS, WORLD_HEX_TERRAIN_CLASSES.ELEVATED],
  [WORLD_HEX_TAGS.VOLCANIC, WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE],
  [WORLD_HEX_TAGS.OCEAN, WORLD_HEX_TERRAIN_CLASSES.AQUATIC],
  [WORLD_HEX_TAGS.WATER, WORLD_HEX_TERRAIN_CLASSES.AQUATIC],
  [WORLD_HEX_TAGS.ICE_FIELD, WORLD_HEX_TERRAIN_CLASSES.AQUATIC],
  [WORLD_HEX_TAGS.MOUNTAIN, WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE],
  [WORLD_HEX_TAGS.CHASM, WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE],
  [WORLD_HEX_TAGS.PRECIPICE, WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE],
  [WORLD_HEX_TAGS.CRATER, WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE],
  [WORLD_HEX_TAGS.CONTINENT, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.FROZEN_LANDS, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.ISLAND, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.ICE_CAP, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.DESERT, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.WASTELAND, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.TWILIGHT_ZONE, WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT],
  [WORLD_HEX_TAGS.EXOTIC, WORLD_HEX_TERRAIN_CLASSES.ELEVATED],
]);

const TAG_BIOMES = new Map([
  [WORLD_HEX_TAGS.FLATLANDS, [WORLD_HEX_BIOMES.PLAINS]],
  [WORLD_HEX_TAGS.HILLS, [WORLD_HEX_BIOMES.PLAINS]],
  [WORLD_HEX_TAGS.VOLCANIC, [WORLD_HEX_BIOMES.MOUNTAIN]],
  [WORLD_HEX_TAGS.OCEAN, [WORLD_HEX_BIOMES.AQUATIC]],
  [WORLD_HEX_TAGS.WATER, [WORLD_HEX_BIOMES.AQUATIC]],
  [WORLD_HEX_TAGS.ICE_FIELD, [WORLD_HEX_BIOMES.AQUATIC, WORLD_HEX_BIOMES.ARCTIC]],
  [WORLD_HEX_TAGS.ICE_CAP, [WORLD_HEX_BIOMES.ARCTIC]],
  [WORLD_HEX_TAGS.FROZEN_LANDS, [WORLD_HEX_BIOMES.ARCTIC]],
  [WORLD_HEX_TAGS.MOUNTAIN, [WORLD_HEX_BIOMES.MOUNTAIN]],
  [WORLD_HEX_TAGS.CHASM, [WORLD_HEX_BIOMES.MOUNTAIN]],
  [WORLD_HEX_TAGS.PRECIPICE, [WORLD_HEX_BIOMES.MOUNTAIN]],
  [WORLD_HEX_TAGS.DESERT, [WORLD_HEX_BIOMES.DESERT]],
  [WORLD_HEX_TAGS.BAKED_LANDS, [WORLD_HEX_BIOMES.DESERT]],
  [WORLD_HEX_TAGS.CONTINENT, [WORLD_HEX_BIOMES.PLAINS]],
  [WORLD_HEX_TAGS.ISLAND, [WORLD_HEX_BIOMES.PLAINS]],
  [WORLD_HEX_TAGS.FOREST, [WORLD_HEX_BIOMES.FOREST]],
  [WORLD_HEX_TAGS.SWAMP, [WORLD_HEX_BIOMES.SWAMP]],
  [WORLD_HEX_TAGS.ARCTIC, [WORLD_HEX_BIOMES.ARCTIC]],
]);

const TERRAIN_CLASS_PRIORITY = new Map([
  [WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE, 4],
  [WORLD_HEX_TERRAIN_CLASSES.AQUATIC, 3],
  [WORLD_HEX_TERRAIN_CLASSES.ELEVATED, 2],
  [WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT, 1],
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
      biomeTags: new Set(),
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

  if (BIOME_TAGS.has(tag)) {
    entry.biomeTags.add(tag);
  }

  const biomeTags = TAG_BIOMES.get(tag) || [];
  for (const biomeTag of biomeTags) {
    entry.biomeTags.add(biomeTag);
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
  let terrainClass = null;
  for (const terrainTag of entry.terrainTags) {
    const candidate = TAG_TERRAIN_CLASS.get(terrainTag);
    if (!candidate) {
      continue;
    }

    if (!terrainClass) {
      terrainClass = candidate;
      continue;
    }

    const currentPriority = TERRAIN_CLASS_PRIORITY.get(terrainClass) || 0;
    const nextPriority = TERRAIN_CLASS_PRIORITY.get(candidate) || 0;
    if (nextPriority > currentPriority) {
      terrainClass = candidate;
    }
  }

  return {
    ...entry,
    tags: [...entry.tags].sort(),
    terrainTags: [...entry.terrainTags].sort(),
    featureTags: [...entry.featureTags].sort(),
    biomeTags: [...entry.biomeTags].sort(),
    terrainClass,
    hasTerrainTags: entry.terrainTags.size > 0,
    hasFeatureTags: entry.featureTags.size > 0,
    hasBiomeTags: entry.biomeTags.size > 0,
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
    biomeTags: finalizedEntries.flatMap((entry) => entry.biomeTags),
  };
}

export function buildWorldTerrainHexTagSnapshot(
  index = {},
  { systemId = null, worldIndex = null, worldName = "", updatedAt = new Date().toISOString() } = {},
) {
  const entries = Array.isArray(index?.entries) ? index.entries : [];
  const normalizeTagList = (value) =>
    (Array.isArray(value) ? [...value] : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));

  const normalizedEntries = entries
    .map((entry) => ({
      key: String(entry?.key || "").trim(),
      faceId: String(entry?.faceId || "").trim() || null,
      tags: normalizeTagList(entry?.tags),
      terrainTags: normalizeTagList(entry?.terrainTags),
      featureTags: normalizeTagList(entry?.featureTags),
      biomeTags: normalizeTagList(entry?.biomeTags),
      terrainClass: String(entry?.terrainClass || "").trim() || null,
      hasTerrainTags: Boolean(entry?.hasTerrainTags),
      hasFeatureTags: Boolean(entry?.hasFeatureTags),
      hasBiomeTags: Boolean(entry?.hasBiomeTags),
    }))
    .sort((left, right) => {
      const keyCompare = left.key.localeCompare(right.key);
      if (keyCompare !== 0) return keyCompare;
      return String(left.faceId || "").localeCompare(String(right.faceId || ""));
    });

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
    biomeTaggedHexCount: normalizedEntries.filter((entry) => entry.hasBiomeTags).length,
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
      biomeTaggedHexCount: payload.biomeTaggedHexCount,
      oceanTriangleIds: payload.oceanTriangleIds,
      shorelineTriangleIds: payload.shorelineTriangleIds,
      hexesByKey: normalizedEntries,
    }),
  };
}
