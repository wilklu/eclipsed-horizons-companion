import { buildWorldLink, createArchiveId, createWorldLinkedArchiveApi } from "./archiveApi.js";

const CREATURE_STORAGE_KEY = "eclipsed-horizons-creatures";
const BUNDLE_STORAGE_KEY = "eclipsed-horizons-fauna-bundles";

function normalizeCreatureRecord(record = {}, fallbackType = "creature") {
  const { systemId, worldName, worldKey, sourceWorld } = buildWorldLink(record);
  const recordType = String(record?.recordType || fallbackType).trim() === "fauna-bundle" ? "fauna-bundle" : "creature";
  const nameFallback = recordType === "fauna-bundle" ? `${worldName || "World"} Fauna Bundle` : "Generated Beast";

  return {
    ...record,
    id: String(record?.id || createArchiveId(recordType === "fauna-bundle" ? "fauna-bundle" : "creature")),
    name: String(record?.name || nameFallback).trim() || nameFallback,
    systemId,
    worldName,
    worldKey,
    sourceWorld,
    recordType,
  };
}

function createCreatureArchiveApi(recordType, storageKey) {
  return createWorldLinkedArchiveApi({
    storageKey,
    listPath: "/creatures",
    normalizeRecord: (record) => normalizeCreatureRecord(record, recordType),
    queryExtras: { recordType },
  });
}

const creatureArchiveApi = createCreatureArchiveApi("creature", CREATURE_STORAGE_KEY);
const faunaBundleArchiveApi = createCreatureArchiveApi("fauna-bundle", BUNDLE_STORAGE_KEY);

export const getCreatures = creatureArchiveApi.list;
export const getFaunaBundles = faunaBundleArchiveApi.list;
export const upsertCreature = creatureArchiveApi.upsert;
export const upsertFaunaBundle = faunaBundleArchiveApi.upsert;
export const deleteCreature = creatureArchiveApi.remove;
export const deleteFaunaBundle = faunaBundleArchiveApi.remove;
