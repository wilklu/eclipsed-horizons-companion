import { defineStore } from "pinia";
import { deleteSophont, getSophonts, upsertSophont } from "../api/sophontApi.js";
import { matchesWorldFilter, normalizeWorldLink, sortByUpdatedAtDesc } from "../utils/worldLink.js";

export const useSophontStore = defineStore("sophont", {
  state: () => ({
    sophonts: [],
  }),

  getters: {
    getAllSophonts: (state) => state.sophonts,
    sophontsByWorld:
      (state) =>
      (criteria = {}) =>
        state.sophonts.filter((record) => matchesWorldFilter(record, criteria)).sort(sortByUpdatedAtDesc),
  },

  actions: {
    async hydrateSophonts(criteria = {}, options = {}) {
      const records = await getSophonts(criteria, options);
      this.sophonts = Array.isArray(records) ? [...records] : [];
      return [...this.sophonts];
    },

    async saveSophont(record = {}, options = {}) {
      const link = normalizeWorldLink(record);
      const persisted = await upsertSophont(
        {
          ...record,
          ...link,
        },
        options,
      );

      const index = this.sophonts.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.sophonts[index] = persisted;
      } else {
        this.sophonts.unshift(persisted);
      }
      this.sophonts = [...this.sophonts];
      return persisted;
    },

    async removeSophont(recordId, options = {}) {
      await deleteSophont(recordId, options);
      this.sophonts = this.sophonts.filter((entry) => entry.id !== recordId);
    },

    clearSophonts() {
      this.sophonts = [];
    },
  },
});
