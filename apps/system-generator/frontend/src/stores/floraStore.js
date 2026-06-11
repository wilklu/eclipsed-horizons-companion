import { defineStore } from "pinia";
import { deleteFlora, getFlora, upsertFlora } from "../api/floraApi.js";
import { matchesWorldFilter, normalizeWorldLink, sortByUpdatedAtDesc } from "../utils/worldLink.js";

export const useFloraStore = defineStore("flora", {
  state: () => ({
    floraRecords: [],
  }),

  getters: {
    getAllFlora: (state) => state.floraRecords,
    floraByWorld:
      (state) =>
      (criteria = {}) =>
        state.floraRecords.filter((record) => matchesWorldFilter(record, criteria)).sort(sortByUpdatedAtDesc),
  },

  actions: {
    async hydrateFlora(criteria = {}, options = {}) {
      const records = await getFlora(criteria, options);
      this.floraRecords = Array.isArray(records) ? [...records] : [];
      return [...this.floraRecords];
    },

    async saveFlora(record = {}, options = {}) {
      const link = normalizeWorldLink(record);
      const persisted = await upsertFlora(
        {
          ...record,
          ...link,
        },
        options,
      );

      const index = this.floraRecords.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.floraRecords[index] = persisted;
      } else {
        this.floraRecords.unshift(persisted);
      }

      this.floraRecords = [...this.floraRecords];
      return persisted;
    },

    async removeFlora(recordId, options = {}) {
      await deleteFlora(recordId, options);
      this.floraRecords = this.floraRecords.filter((entry) => entry.id !== recordId);
    },

    clearFlora() {
      this.floraRecords = [];
    },
  },
});
