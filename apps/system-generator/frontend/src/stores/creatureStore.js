import { defineStore } from "pinia";
import {
  deleteCreature,
  deleteFaunaBundle,
  getCreatures,
  getFaunaBundles,
  upsertCreature,
  upsertFaunaBundle,
} from "../api/creatureApi.js";
import { matchesWorldFilter, normalizeWorldLink, sortByUpdatedAtDesc } from "../utils/worldLink.js";

export const useCreatureStore = defineStore("creature", {
  state: () => ({
    creatures: [],
    faunaBundles: [],
  }),

  getters: {
    getAllCreatures: (state) => state.creatures,
    getAllFaunaBundles: (state) => state.faunaBundles,
    creaturesByWorld:
      (state) =>
      (criteria = {}) =>
        state.creatures.filter((record) => matchesWorldFilter(record, criteria)).sort(sortByUpdatedAtDesc),
    faunaBundlesByWorld:
      (state) =>
      (criteria = {}) =>
        state.faunaBundles.filter((record) => matchesWorldFilter(record, criteria)).sort(sortByUpdatedAtDesc),
  },

  actions: {
    async hydrateCreatures(criteria = {}, options = {}) {
      const records = await getCreatures(criteria, options);
      this.creatures = Array.isArray(records) ? [...records] : [];
      return [...this.creatures];
    },

    async hydrateFaunaBundles(criteria = {}, options = {}) {
      const records = await getFaunaBundles(criteria, options);
      this.faunaBundles = Array.isArray(records) ? [...records] : [];
      return [...this.faunaBundles];
    },

    async saveCreature(record = {}, options = {}) {
      const link = normalizeWorldLink(record);
      const persisted = await upsertCreature(
        {
          ...record,
          ...link,
        },
        options,
      );

      const index = this.creatures.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.creatures[index] = persisted;
      } else {
        this.creatures.unshift(persisted);
      }
      this.creatures = [...this.creatures];
      return persisted;
    },

    async saveFaunaBundle(bundle = {}, options = {}) {
      const link = normalizeWorldLink(bundle);
      const persisted = await upsertFaunaBundle(
        {
          ...bundle,
          ...link,
        },
        options,
      );

      const index = this.faunaBundles.findIndex((entry) => entry.id === persisted.id);
      if (index >= 0) {
        this.faunaBundles[index] = persisted;
      } else {
        this.faunaBundles.unshift(persisted);
      }
      this.faunaBundles = [...this.faunaBundles];
      return persisted;
    },

    async removeCreature(recordId, options = {}) {
      await deleteCreature(recordId, options);
      this.creatures = this.creatures.filter((entry) => entry.id !== recordId);
    },

    async removeFaunaBundle(bundleId, options = {}) {
      await deleteFaunaBundle(bundleId, options);
      this.faunaBundles = this.faunaBundles.filter((entry) => entry.id !== bundleId);
    },

    clearCreatures() {
      this.creatures = [];
    },

    clearFaunaBundles() {
      this.faunaBundles = [];
    },
  },
});
