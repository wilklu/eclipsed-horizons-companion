import { buildWorldLink, createArchiveId, createWorldLinkedArchiveApi } from "./archiveApi.js";

const STORAGE_KEY = "eclipsed-horizons-flora";

function normalizeFlora(record = {}) {
  const { systemId, worldName, worldKey, sourceWorld } = buildWorldLink(record);

  return {
    ...record,
    id: String(record?.id || createArchiveId("flora")),
    name: String(record?.name || "Generated Flora").trim() || "Generated Flora",
    systemId,
    worldName,
    worldKey,
    sourceWorld,
  };
}

const floraArchiveApi = createWorldLinkedArchiveApi({
  storageKey: STORAGE_KEY,
  listPath: "/flora",
  normalizeRecord: normalizeFlora,
});

export const getFlora = floraArchiveApi.list;
export const upsertFlora = floraArchiveApi.upsert;
export const deleteFlora = floraArchiveApi.remove;
