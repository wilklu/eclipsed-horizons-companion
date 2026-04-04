import { defineStore } from "pinia";

const STORAGE_KEY = "eclipsed-horizons-preferences";

export const PREFERENCE_DEFAULTS = Object.freeze({
  galaxyPlannerModerateSectorThreshold: 12000,
  galaxyPlannerHeavySectorThreshold: 60000,
  galaxyPlannerExtremeSectorThreshold: 200000,
  galaxyNameMode: "normalized",
  galaxyMythicTheme: "all",
  sectorNameMode: "normalized",
  atlasGridBiasX: 0,
  atlasGridBiasY: 0,
});

function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...PREFERENCE_DEFAULTS, ...JSON.parse(raw) } : { ...PREFERENCE_DEFAULTS };
  } catch {
    return { ...PREFERENCE_DEFAULTS };
  }
}

export const usePreferencesStore = defineStore("preferences", {
  state: () => loadPreferences(),

  getters: {},

  actions: {
    set(key, value) {
      this[key] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.$state }));
    },

    replace(nextState) {
      this.$patch({ ...nextState });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.$state }));
    },

    reset() {
      this.$patch({ ...PREFERENCE_DEFAULTS });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.$state }));
    },
  },
});
