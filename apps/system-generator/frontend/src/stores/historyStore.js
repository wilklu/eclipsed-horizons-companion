import { defineStore } from "pinia";
import { deleteHistory, getHistories, upsertHistory } from "../api/historyApi.js";
import { matchesWorldFilter, normalizeWorldLink, sortByUpdatedAtDesc } from "../utils/worldLink.js";

export const useHistoryStore = defineStore("history", {
  state: () => ({
    historyRecords: [],
  }),

  getters: {
    getAllHistoryRecords: (state) => state.historyRecords,
    historiesByWorld:
      (state) =>
      (criteria = {}) =>
        state.historyRecords
          .filter((record) =>
            matchesWorldFilter(record, criteria, {
              includeSourceWorld: false,
              fallbackWorldName: record?.context?.worldName || "",
            }),
          )
          .sort(sortByUpdatedAtDesc),
  },

  actions: {
    async hydrateHistories(criteria = {}, options = {}) {
      const records = await getHistories(criteria, options);
      this.historyRecords = Array.isArray(records) ? [...records] : [];
      return [...this.historyRecords];
    },

    async saveHistory(record = {}, options = {}) {
      const link = normalizeWorldLink(record, {
        includeSourceWorld: false,
        fallbackWorldName: record?.context?.worldName || "",
      });
      const persisted = await upsertHistory(
        {
          ...record,
          ...link,
        },
        options,
      );

      const index = this.historyRecords.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.historyRecords[index] = persisted;
      } else {
        this.historyRecords.unshift(persisted);
      }
      this.historyRecords = [...this.historyRecords];
      return persisted;
    },

    async removeHistory(recordId, options = {}) {
      await deleteHistory(recordId, options);
      this.historyRecords = this.historyRecords.filter((entry) => entry.id !== recordId);
    },

    clearHistories() {
      this.historyRecords = [];
    },
  },
});
