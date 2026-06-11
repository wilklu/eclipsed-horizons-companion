import { buildWorldLink, createArchiveId, createWorldLinkedArchiveApi } from "./archiveApi.js";

const STORAGE_KEY = "eclipsed-horizons-sophonts";

function normalizeSophont(record = {}) {
  const { systemId, worldName, worldKey, sourceWorld } = buildWorldLink(record);

  return {
    ...record,
    id: String(record?.id || createArchiveId("sophont")),
    name: String(record?.name || "Generated Sophont").trim() || "Generated Sophont",
    systemId,
    worldName,
    worldKey,
    sourceWorld,
  };
}

const sophontArchiveApi = createWorldLinkedArchiveApi({
  storageKey: STORAGE_KEY,
  listPath: "/sophonts",
  normalizeRecord: normalizeSophont,
});

export const getSophonts = sophontArchiveApi.list;
export const upsertSophont = sophontArchiveApi.upsert;
export const deleteSophont = sophontArchiveApi.remove;
