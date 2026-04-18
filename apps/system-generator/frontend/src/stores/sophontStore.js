import { defineStore } from "pinia";

const STORAGE_KEY = "eclipsed-horizons-sophonts";

function loadSophonts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSophonts(sophonts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sophonts));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore local persistence cleanup failures.
    }
  }
}

function createRecordId(prefix = "sophont") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeWorldLink(record = {}) {
  const sourceWorld = record?.sourceWorld && typeof record.sourceWorld === "object" ? { ...record.sourceWorld } : null;
  const systemId = String(record?.systemId || "").trim();
  const worldName = String(record?.worldName || sourceWorld?.name || "").trim();
  const worldKey = String(record?.worldKey || [systemId, worldName].filter(Boolean).join(":")).trim();

  return { systemId, worldName, worldKey, sourceWorld };
}

function matchesWorldFilter(record, criteria = {}) {
  const recordLink = normalizeWorldLink(record);
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

export const useSophontStore = defineStore("sophont", {
  state: () => ({
    sophonts: loadSophonts(),
  }),

  getters: {
    getAllSophonts: (state) => state.sophonts,
    sophontsByWorld:
      (state) =>
      (criteria = {}) =>
        state.sophonts
          .filter((record) => matchesWorldFilter(record, criteria))
          .sort((left, right) => String(right?.updatedAt || "").localeCompare(String(left?.updatedAt || ""))),
  },

  actions: {
    saveSophont(record = {}) {
      const link = normalizeWorldLink(record);
      const now = new Date().toISOString();
      const persisted = {
        ...record,
        ...link,
        id: String(record?.id || createRecordId("sophont")),
        savedAt: String(record?.savedAt || now),
        updatedAt: now,
      };

      const index = this.sophonts.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.sophonts[index] = persisted;
      } else {
        this.sophonts.unshift(persisted);
      }
      saveSophonts(this.sophonts);
      return persisted;
    },

    removeSophont(recordId) {
      this.sophonts = this.sophonts.filter((entry) => entry.id !== recordId);
      saveSophonts(this.sophonts);
    },

    clearSophonts() {
      this.sophonts = [];
      saveSophonts(this.sophonts);
    },
  },
});
