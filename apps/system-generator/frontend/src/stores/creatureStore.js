import { defineStore } from "pinia";

const STORAGE_KEY = "eclipsed-horizons-creatures";

function loadCreatures() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCreatures(creatures) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creatures));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore local persistence cleanup failures.
    }
  }
}

function createRecordId(prefix = "creature") {
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

export const useCreatureStore = defineStore("creature", {
  state: () => ({
    creatures: loadCreatures(),
  }),

  getters: {
    getAllCreatures: (state) => state.creatures,
    creaturesByWorld:
      (state) =>
      (criteria = {}) =>
        state.creatures
          .filter((record) => matchesWorldFilter(record, criteria))
          .sort((left, right) => String(right?.updatedAt || "").localeCompare(String(left?.updatedAt || ""))),
  },

  actions: {
    saveCreature(record = {}) {
      const link = normalizeWorldLink(record);
      const now = new Date().toISOString();
      const persisted = {
        ...record,
        ...link,
        id: String(record?.id || createRecordId("creature")),
        savedAt: String(record?.savedAt || now),
        updatedAt: now,
      };

      const index = this.creatures.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.creatures[index] = persisted;
      } else {
        this.creatures.unshift(persisted);
      }
      saveCreatures(this.creatures);
      return persisted;
    },

    removeCreature(recordId) {
      this.creatures = this.creatures.filter((entry) => entry.id !== recordId);
      saveCreatures(this.creatures);
    },

    clearCreatures() {
      this.creatures = [];
      saveCreatures(this.creatures);
    },
  },
});
