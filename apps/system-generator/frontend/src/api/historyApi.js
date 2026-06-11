import { buildWorldLink, createArchiveId, createWorldLinkedArchiveApi } from "./archiveApi.js";

const STORAGE_KEY = "eclipsed-horizons-history";

function normalizeHistoryRecord(record = {}) {
  const context = record?.context && typeof record.context === "object" ? { ...record.context } : {};
  const meta = record?.meta && typeof record.meta === "object" ? { ...record.meta } : {};
  const { systemId, worldName, worldKey } = buildWorldLink(record, {
    includeSourceWorld: false,
    fallbackWorldName: context?.worldName || "",
  });

  return {
    ...record,
    id: String(record?.id || createArchiveId("history")),
    civilizationName: String(record?.civilizationName || "Generated Civilization").trim() || "Generated Civilization",
    systemId,
    worldName,
    worldKey,
    context,
    overview: record?.overview && typeof record.overview === "object" ? { ...record.overview } : {},
    events: Array.isArray(record?.events) ? [...record.events] : [],
    dynasties: Array.isArray(record?.dynasties) ? [...record.dynasties] : [],
    notablePeople: Array.isArray(record?.notablePeople) ? [...record.notablePeople] : [],
    familyTree: Array.isArray(record?.familyTree) ? [...record.familyTree] : [],
    categories: Array.isArray(record?.categories) ? [...record.categories] : [],
    meta,
  };
}

const historyArchiveApi = createWorldLinkedArchiveApi({
  storageKey: STORAGE_KEY,
  listPath: "/histories",
  normalizeRecord: normalizeHistoryRecord,
});

export const getHistories = historyArchiveApi.list;
export const upsertHistory = historyArchiveApi.upsert;
export const deleteHistory = historyArchiveApi.remove;
