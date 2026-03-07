import { defineStore } from "pinia";

export const useSurveyStore = defineStore("survey", {
  state: () => ({
    class0: null, // Sector Survey Data
    class1: null, // Stellar Survey Data
    class2: null, // System Survey Data
    class2Planet: null, // Planetoid Survey Data
    class3: null, // Physical Survey Data
    class4: null, // Census Survey Data

    currentSystemId: null,
    currentPlanetId: null,
  }),

  getters: {
    getSectorSurvey: (state) => state.class0,
    getStellarSurvey: (state) => state.class1,
    getSystemSurvey: (state) => state.class2,
    getPlanetoidSurvey: (state) => state.class2Planet,
    getPhysicalSurvey: (state) => state.class3,
    getCensusSurvey: (state) => state.class4,
  },

  actions: {
    setSectorSurvey(data) {
      this.class0 = data;
    },
    setStellarSurvey(data) {
      this.class1 = data;
    },
    setSystemSurvey(data) {
      this.class2 = data;
    },
    setPlanetoidSurvey(data) {
      this.class2Planet = data;
    },
    setPhysicalSurvey(data) {
      this.class3 = data;
    },
    setCensusSurvey(data) {
      this.class4 = data;
    },

    setCurrentSystem(systemId) {
      this.currentSystemId = systemId;
    },
    setCurrentPlanet(planetId) {
      this.currentPlanetId = planetId;
    },

    // Clear all data
    resetSurvey() {
      this.class0 = null;
      this.class1 = null;
      this.class2 = null;
      this.class2Planet = null;
      this.class3 = null;
      this.class4 = null;
      this.currentSystemId = null;
      this.currentPlanetId = null;
    },
  },
});
