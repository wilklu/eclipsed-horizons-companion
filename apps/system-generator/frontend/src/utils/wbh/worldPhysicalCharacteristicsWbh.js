import { classifyPlanetaryBody } from "../systemWorldClassification.js";
import { calculatePlanetaryOrbitalPeriod, fractionalOrbitToAu } from "./systemGenerationWbh.js";

import { createRandomRoller } from "./dice.js";
import { rollSingleDie, rollD3, roll2d, rollNd } from "./diceFormulasWbh.js";
import {
  calculateBiomassRating,
  calculateBiocomplexityRating,
  calculateBiodiversityRating,
  calculateCompatibilityRating,
} from "./lifeRatingsWbh.js";
import { generateAtmosphereComposition, generateAtmosphereCompositionDetailed } from "./atmosphereCompositionWbh.js";
import {
  generateHydrographicsComposition,
  generateHydrographicsCompositionDetailed,
} from "./hydrographicsCompositionWbh.js";
import { generatePlanetComposition, generatePlanetCompositionDetailed } from "./planetaryCompositionWbh.js";

export {
  calculateBiomassRating,
  calculateBiocomplexityRating,
  calculateBiodiversityRating,
  calculateCompatibilityRating,
};

export const WORLD_PHYSICAL_CHARACTERISTIC_RULES = Object.freeze([
  {
    id: "world-size",
    section: "Chapter 5 > Size and Diameter",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "composition-density-gravity-mass",
    section: "Chapter 5 > Composition and Density > Gravity and Mass",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "atmosphere",
    section: "Chapter 5 > Atmosphere",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "hydrographics",
    section: "Chapter 5 > Hydrographics",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "rotation-tilt-tides-temperature",
    section: "Chapter 5 > Rotation Period, Axial Tilts, Tidal Effects, Mean Temperature",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "seismology-life-mainworld",
    section:
      "Chapter 5 > Seismology, Native Lifeforms, Resource Rating, Habitability Rating, Final Mainworld Determination",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
]);
const WORLD_SIZE_TABLE = Object.freeze({
  0: { averageDiameterKm: 0, minDiameterKm: null, maxDiameterKm: null, code: "0" },
  R: { averageDiameterKm: 0, minDiameterKm: null, maxDiameterKm: null, code: "R" },
  S: { averageDiameterKm: 600, minDiameterKm: 400, maxDiameterKm: 799, code: "S" },
  1: { averageDiameterKm: 1600, minDiameterKm: 800, maxDiameterKm: 2399, code: "1" },
  2: { averageDiameterKm: 3200, minDiameterKm: 2400, maxDiameterKm: 3999, code: "2" },
  3: { averageDiameterKm: 4800, minDiameterKm: 4000, maxDiameterKm: 5599, code: "3" },
  4: { averageDiameterKm: 6400, minDiameterKm: 5600, maxDiameterKm: 7199, code: "4" },
  5: { averageDiameterKm: 8000, minDiameterKm: 7200, maxDiameterKm: 8799, code: "5" },
  6: { averageDiameterKm: 9600, minDiameterKm: 8800, maxDiameterKm: 10399, code: "6" },
  7: { averageDiameterKm: 11200, minDiameterKm: 10400, maxDiameterKm: 11999, code: "7" },
  8: { averageDiameterKm: 12800, minDiameterKm: 12000, maxDiameterKm: 13599, code: "8" },
  9: { averageDiameterKm: 14400, minDiameterKm: 13600, maxDiameterKm: 15199, code: "9" },
  A: { averageDiameterKm: 16000, minDiameterKm: 15200, maxDiameterKm: 16799, code: "A" },
  B: { averageDiameterKm: 17600, minDiameterKm: 16800, maxDiameterKm: 18399, code: "B" },
  C: { averageDiameterKm: 19200, minDiameterKm: 18400, maxDiameterKm: 19999, code: "C" },
  D: { averageDiameterKm: 20800, minDiameterKm: 20000, maxDiameterKm: 21599, code: "D" },
  E: { averageDiameterKm: 22400, minDiameterKm: 21600, maxDiameterKm: 23199, code: "E" },
  F: { averageDiameterKm: 24000, minDiameterKm: 23200, maxDiameterKm: 24799, code: "F" },
});
const TERRA_DIAMETER_KM = 12742;
const TERRA_RADIUS_KM = TERRA_DIAMETER_KM / 2;
const TERRA_ESCAPE_VELOCITY_MPS = 11186;

const TERRESTRIAL_COMPOSITION_TABLE = Object.freeze([
  { min: Number.NEGATIVE_INFINITY, max: -4, composition: "Exotic Ice" },
  { min: -3, max: 2, composition: "Mostly Ice" },
  { min: 3, max: 6, composition: "Mostly Rock" },
  { min: 7, max: 11, composition: "Rock and Metal" },
  { min: 12, max: 14, composition: "Mostly Metal" },
  { min: 15, max: Number.POSITIVE_INFINITY, composition: "Compressed Metal" },
]);

const TERRESTRIAL_DENSITY_TABLE = Object.freeze({
  "Exotic Ice": {
    2: 0.03,
    3: 0.06,
    4: 0.09,
    5: 0.12,
    6: 0.15,
    7: 0.18,
    8: 0.21,
    9: 0.24,
    10: 0.27,
    11: 0.3,
    12: 0.33,
  },
  "Mostly Ice": {
    2: 0.18,
    3: 0.21,
    4: 0.24,
    5: 0.27,
    6: 0.3,
    7: 0.33,
    8: 0.36,
    9: 0.39,
    10: 0.41,
    11: 0.44,
    12: 0.47,
  },
  "Mostly Rock": {
    2: 0.5,
    3: 0.53,
    4: 0.56,
    5: 0.59,
    6: 0.62,
    7: 0.65,
    8: 0.68,
    9: 0.71,
    10: 0.74,
    11: 0.77,
    12: 0.8,
  },
  "Rock and Metal": {
    2: 0.82,
    3: 0.85,
    4: 0.88,
    5: 0.91,
    6: 0.94,
    7: 0.97,
    8: 1.0,
    9: 1.03,
    10: 1.06,
    11: 1.09,
    12: 1.12,
  },
  "Mostly Metal": {
    2: 1.15,
    3: 1.18,
    4: 1.21,
    5: 1.24,
    6: 1.27,
    7: 1.3,
    8: 1.33,
    9: 1.36,
    10: 1.39,
    11: 1.42,
    12: 1.45,
  },
  "Compressed Metal": {
    2: 1.5,
    3: 1.55,
    4: 1.6,
    5: 1.65,
    6: 1.7,
    7: 1.75,
    8: 1.8,
    9: 1.85,
    10: 1.9,
    11: 1.95,
    12: 2.0,
  },
});
const AU_TO_MILLION_KM = 149.5978707;
const SOLAR_MASS_TO_EARTH_MASS = 332946;
const ATMOSPHERE_TABLE = Object.freeze({
  0: "Vacuum",
  1: "Trace",
  2: "Very Thin, Tainted",
  3: "Very Thin",
  4: "Thin, Tainted",
  5: "Thin",
  6: "Standard",
  7: "Standard, Tainted",
  8: "Dense",
  9: "Dense, Tainted",
  10: "Exotic",
  11: "Corrosive",
  12: "Insidious",
  13: "Very Dense",
  14: "Low",
  15: "Unusual",
  16: "Gas, Helium",
  17: "Gas, Hydrogen",
});
const ATMOSPHERE_PROFILE_TABLE = Object.freeze({
  0: {
    composition: "None",
    minimumPressureBar: 0,
    maximumPressureBar: 0.0009,
    spanBar: null,
    survivalGear: "Vacc Suit",
  },
  1: {
    composition: "Trace",
    minimumPressureBar: 0.001,
    maximumPressureBar: 0.09,
    spanBar: 0.089,
    survivalGear: "Vacc Suit",
  },
  2: {
    composition: "Very Thin, Tainted",
    minimumPressureBar: 0.1,
    maximumPressureBar: 0.42,
    spanBar: 0.32,
    survivalGear: "Respirator and Filter",
  },
  3: {
    composition: "Very Thin",
    minimumPressureBar: 0.1,
    maximumPressureBar: 0.42,
    spanBar: 0.32,
    survivalGear: "Respirator",
  },
  4: {
    composition: "Thin, Tainted",
    minimumPressureBar: 0.43,
    maximumPressureBar: 0.7,
    spanBar: 0.27,
    survivalGear: "Filter",
  },
  5: { composition: "Thin", minimumPressureBar: 0.43, maximumPressureBar: 0.7, spanBar: 0.27, survivalGear: "None" },
  6: {
    composition: "Standard",
    minimumPressureBar: 0.7,
    maximumPressureBar: 1.49,
    spanBar: 0.79,
    survivalGear: "None",
  },
  7: {
    composition: "Standard, Tainted",
    minimumPressureBar: 0.7,
    maximumPressureBar: 1.49,
    spanBar: 0.79,
    survivalGear: "Filter",
  },
  8: {
    composition: "Dense",
    minimumPressureBar: 1.5,
    maximumPressureBar: 2.49,
    spanBar: 0.99,
    survivalGear: "None",
  },
  9: {
    composition: "Dense, Tainted",
    minimumPressureBar: 1.5,
    maximumPressureBar: 2.49,
    spanBar: 0.99,
    survivalGear: "Filter",
  },
  10: {
    composition: "Exotic",
    minimumPressureBar: null,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "Air Supply",
  },
  11: {
    composition: "Corrosive",
    minimumPressureBar: null,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "Vacc Suit",
  },
  12: {
    composition: "Insidious",
    minimumPressureBar: null,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "Vacc Suit",
  },
  13: {
    composition: "Very Dense",
    minimumPressureBar: 2.5,
    maximumPressureBar: 10,
    spanBar: 7.5,
    survivalGear: "Varies by altitude",
  },
  14: {
    composition: "Low",
    minimumPressureBar: 0.1,
    maximumPressureBar: 0.42,
    spanBar: 0.32,
    survivalGear: "Varies by altitude",
  },
  15: {
    composition: "Unusual",
    minimumPressureBar: null,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "Varies",
  },
  16: {
    composition: "Gas, Helium",
    minimumPressureBar: 100,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "HEV Suit",
  },
  17: {
    composition: "Gas, Hydrogen",
    minimumPressureBar: 1000,
    maximumPressureBar: null,
    spanBar: null,
    survivalGear: "Not Survivable",
  },
});
const TAINT_SUBTYPE_TABLE = Object.freeze([
  { min: -Infinity, max: 2, code: "L", label: "Low Oxygen" },
  { min: 3, max: 3, code: "R", label: "Radioactivity" },
  { min: 4, max: 4, code: "B", label: "Biologic" },
  { min: 5, max: 5, code: "G", label: "Gas Mix" },
  { min: 6, max: 6, code: "P", label: "Particulates" },
  { min: 7, max: 7, code: "G", label: "Gas Mix" },
  { min: 8, max: 8, code: "S", label: "Sulphur Compounds" },
  { min: 9, max: 9, code: "B", label: "Biologic" },
  { min: 10, max: 10, code: "P*", label: "Particulates" },
  { min: 11, max: 11, code: "R", label: "Radioactivity" },
  { min: 12, max: Infinity, code: "H", label: "High Oxygen" },
]);
const TAINT_LABELS = Object.freeze({
  B: "Biologic",
  G: "Gas Mix",
  H: "High Oxygen",
  L: "Low Oxygen",
  P: "Particulates",
  R: "Radioactivity",
  S: "Sulphur Compounds",
});
const STAR_TEMP_MOD = Object.freeze({
  O: 4,
  B: 3,
  A: 2,
  F: 1,
  G: 0,
  K: -1,
  M: -2,
  D: -3,
  BD: -4,
  L: -4,
  T: -5,
  Y: -6,
  PROTO: 1,
});
const HYDROGRAPHICS_RANGE_TABLE = Object.freeze({
  0: { min: 0, max: 5 },
  1: { min: 6, max: 15 },
  2: { min: 16, max: 25 },
  3: { min: 26, max: 35 },
  4: { min: 36, max: 45 },
  5: { min: 46, max: 55 },
  6: { min: 56, max: 65 },
  7: { min: 66, max: 75 },
  8: { min: 76, max: 85 },
  9: { min: 86, max: 95 },
  10: { min: 96, max: 100 },
});
const SURFACE_DISTRIBUTION_TABLE = Object.freeze([
  { code: 0, label: "Extremely Dispersed", majorShare: "0%" },
  { code: 1, label: "Very Dispersed", majorShare: "5-10%" },
  { code: 2, label: "Dispersed", majorShare: "10-20%" },
  { code: 3, label: "Scattered", majorShare: "20-30%" },
  { code: 4, label: "Slightly Scattered", majorShare: "30-40%" },
  { code: 5, label: "Mixed", majorShare: "40-60%" },
  { code: 6, label: "Slightly Skewed", majorShare: "60-70%" },
  { code: 7, label: "Skewed", majorShare: "70-80%" },
  { code: 8, label: "Concentrated", majorShare: "80-90%" },
  { code: 9, label: "Very Concentrated", majorShare: "90-95%" },
  { code: 10, label: "Extremely Concentrated", majorShare: "95%+" },
]);
const GAS_GIANT_SIZE_CLASS_CODES = Object.freeze(["GS", "GM", "GL"]);
const CLOSE_MOON_PHONETIC_SUFFIXES = Object.freeze([
  "Ay",
  "Bee",
  "Cee",
  "Dee",
  "Ee",
  "Eff",
  "Gee",
  "Aitch",
  "Eye",
  "Jay",
  "Kay",
  "Ell",
  "Em",
]);

const FAR_MOON_PHONETIC_SUFFIXES = Object.freeze([
  "En",
  "Oh",
  "Pee",
  "Que",
  "Arr",
  "Ess",
  "Tee",
  "Yu",
  "Vee",
  "Dub",
  "Ex",
  "Wye",
  "Zee",
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeWorldSubtypeToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function resolveWorldSubtypeEnvironmentalBias(world = {}) {
  const subtype = normalizeWorldSubtypeToken(world?.worldSubtype || world?.worldClass || world?.worldDescriptor);
  const orbitBandKey = normalizeWorldSubtypeToken(world?.orbitBandKey);
  const zoneToken = normalizeWorldSubtypeToken(world?.zone);
  const type = normalizeWorldSubtypeToken(world?.type || world?.worldType);
  const bias = {
    atmosphereDm: 0,
    hydrographicsDm: 0,
    tempDm: 0,
    biomassDm: 0,
    biocomplexityDm: 0,
    compatibilityDm: 0,
    habitabilityDm: 0,
    resourceDm: 0,
    minHydrographics: null,
    maxHydrographics: null,
  };

  // Orbit band and type DMs apply regardless of world subtype classification
  const isOuterZone = orbitBandKey === "outer" || zoneToken.includes("outer");
  const isEpistellar = orbitBandKey === "epistellar" || zoneToken.includes("epistellar");
  if (isEpistellar) {
    bias.tempDm += 8;
    bias.biomassDm -= 1;
  } else if (isOuterZone) {
    bias.tempDm -= 8;
    bias.biomassDm -= 3;
    bias.biocomplexityDm -= 1;
  }

  if (type.includes("gas giant") || type.includes("jovian")) {
    bias.biomassDm = Math.min(bias.biomassDm, -6);
  }

  if (!subtype) {
    return bias;
  }

  if (subtype.includes("pelagic") || subtype.includes("panthalassic")) {
    bias.hydrographicsDm += 5;
    bias.tempDm -= 3;
    bias.biomassDm += 2;
    bias.biocomplexityDm += 2;
    bias.compatibilityDm += 1;
    bias.habitabilityDm += 2;
    bias.resourceDm += 1;
    bias.minHydrographics = 8;
  } else if (subtype.includes("bathyvesperian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 5;
    bias.tempDm += 2;
    bias.biomassDm += 2;
    bias.biocomplexityDm += 2;
    bias.compatibilityDm += 1;
    bias.habitabilityDm += 2;
    bias.resourceDm += 1;
    bias.minHydrographics = 8;
  } else if (subtype.includes("euvesperian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 3;
    bias.tempDm -= 2;
    bias.biomassDm += 3;
    bias.biocomplexityDm += 2;
    bias.compatibilityDm += 2;
    bias.habitabilityDm += 2;
    bias.minHydrographics = 4;
  } else if (subtype.includes("chlorivesperian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 2;
    bias.tempDm -= 1;
    bias.biomassDm += 2;
    bias.biocomplexityDm += 2;
    bias.compatibilityDm -= 1;
    bias.habitabilityDm += 1;
    bias.minHydrographics = 4;
  } else if (subtype.includes("janivesperian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 1;
    bias.tempDm += 2;
    bias.biomassDm += 1;
    bias.biocomplexityDm += 1;
    bias.habitabilityDm += 1;
    bias.minHydrographics = 2;
  } else if (subtype.includes("nunnic")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 4;
    bias.tempDm -= 12;
    bias.biomassDm += 1;
    bias.biocomplexityDm += 1;
    bias.compatibilityDm -= 1;
    bias.habitabilityDm += 1;
    bias.resourceDm += 1;
    bias.minHydrographics = 8;
  } else if (subtype.includes("teathic")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 4;
    bias.tempDm -= 18;
    bias.biomassDm -= 1;
    bias.biocomplexityDm += 0;
    bias.compatibilityDm -= 2;
    bias.habitabilityDm -= 1;
    bias.resourceDm += 1;
    bias.minHydrographics = 8;
  } else if (subtype.includes("gaian")) {
    bias.hydrographicsDm += 2;
    bias.tempDm -= 1;
    bias.biomassDm += 3;
    bias.biocomplexityDm += 2;
    bias.compatibilityDm += 2;
    bias.habitabilityDm += 3;
    bias.resourceDm += 1;
    bias.minHydrographics = 4;
  } else if (subtype.includes("amunian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 1;
    bias.tempDm -= 12;
    bias.biomassDm += 1;
    bias.biocomplexityDm += 1;
    bias.compatibilityDm -= 1;
    bias.habitabilityDm += 1;
    bias.resourceDm += 1;
    bias.minHydrographics = 2;
  } else if (subtype.includes("tartarian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 1;
    bias.tempDm -= 18;
    bias.biomassDm -= 1;
    bias.biocomplexityDm += 0;
    bias.compatibilityDm -= 2;
    bias.habitabilityDm -= 1;
    bias.resourceDm += 1;
    bias.minHydrographics = 2;
  } else if (subtype.includes("oceanic")) {
    bias.hydrographicsDm += 4;
    bias.tempDm -= 4;
    bias.biomassDm += 2;
    bias.biocomplexityDm += 1;
    bias.compatibilityDm += 1;
    bias.habitabilityDm += 2;
    bias.minHydrographics = 6;
  } else if (subtype.includes("tectonic") || subtype.includes("vesperian")) {
    bias.atmosphereDm += 1;
    bias.hydrographicsDm += 2;
    bias.biomassDm += 1;
    bias.biocomplexityDm += 1;
    bias.habitabilityDm += 1;
    bias.resourceDm += 1;
    bias.minHydrographics = 3;
  } else if (subtype.includes("arid")) {
    bias.hydrographicsDm -= 3;
    bias.tempDm += 4;
    bias.biomassDm -= 2;
    bias.compatibilityDm -= 1;
    bias.habitabilityDm -= 1;
    bias.maxHydrographics = 4;
  } else if (subtype.includes("phosphorian")) {
    bias.atmosphereDm += 2;
    bias.hydrographicsDm -= 5;
    bias.tempDm += 56;
    bias.biomassDm -= 6;
    bias.biocomplexityDm -= 3;
    bias.compatibilityDm -= 4;
    bias.habitabilityDm -= 4;
    bias.resourceDm += 1;
    bias.maxHydrographics = 1;
  } else if (subtype.includes("cytherean")) {
    bias.atmosphereDm += 2;
    bias.hydrographicsDm -= 4;
    bias.tempDm += 32;
    bias.biomassDm -= 5;
    bias.biocomplexityDm -= 2;
    bias.compatibilityDm -= 3;
    bias.habitabilityDm -= 3;
    bias.resourceDm += 1;
    bias.maxHydrographics = 2;
  } else if (subtype.includes("telluric") || subtype.includes("meltball")) {
    bias.atmosphereDm += 2;
    bias.hydrographicsDm -= 4;
    bias.tempDm += 18;
    bias.biomassDm -= 5;
    bias.biocomplexityDm -= 2;
    bias.compatibilityDm -= 3;
    bias.habitabilityDm -= 3;
    bias.resourceDm += 1;
    bias.maxHydrographics = 2;
  } else if (subtype.includes("janilithic") || subtype.includes("rockball")) {
    bias.atmosphereDm -= 1;
    bias.hydrographicsDm -= 4;
    bias.tempDm += 6;
    bias.biomassDm -= 4;
    bias.biocomplexityDm -= 2;
    bias.compatibilityDm -= 2;
    bias.habitabilityDm -= 2;
    bias.resourceDm += 1;
    bias.maxHydrographics = 2;
  } else if (subtype.includes("snowball")) {
    bias.hydrographicsDm += 2;
    bias.tempDm -= 24;
    bias.biomassDm -= 3;
    bias.biocomplexityDm -= 2;
    bias.habitabilityDm -= 2;
    bias.minHydrographics = 2;
  } else if (subtype.includes("geocyclic")) {
    bias.hydrographicsDm += 1;
    bias.biomassDm += 1;
    bias.resourceDm += 1;
  } else if (subtype.includes("geotidal") || subtype.includes("hebean")) {
    bias.tempDm += 4;
    bias.biomassDm -= 1;
    bias.resourceDm += 2;
  } else if (subtype.includes("ice giant")) {
    bias.tempDm -= 20;
    bias.biomassDm -= 6;
    bias.habitabilityDm -= 4;
    bias.resourceDm += 1;
  } else if (subtype.includes("asphodelian")) {
    bias.atmosphereDm -= 2;
    bias.hydrographicsDm -= 5;
    bias.tempDm += 22;
    bias.biomassDm -= 6;
    bias.biocomplexityDm -= 3;
    bias.compatibilityDm -= 3;
    bias.habitabilityDm -= 4;
    bias.maxHydrographics = 1;
  } else if (subtype.includes("hot helian") || subtype.includes("hot jovian")) {
    bias.tempDm += 18;
    bias.biomassDm -= 6;
    bias.habitabilityDm -= 4;
  }

  return bias;
}

function applySubtypeHydrographicsBias(hydrographics, bias = {}) {
  const hasMinimum = bias?.minHydrographics !== null && bias?.minHydrographics !== undefined;
  const hasMaximum = bias?.maxHydrographics !== null && bias?.maxHydrographics !== undefined;
  const minimum = hasMinimum && Number.isFinite(Number(bias.minHydrographics)) ? Number(bias.minHydrographics) : 0;
  const maximum = hasMaximum && Number.isFinite(Number(bias.maxHydrographics)) ? Number(bias.maxHydrographics) : 10;
  const lowerBound = Math.min(minimum, maximum);
  const upperBound = Math.max(minimum, maximum);
  return clamp(Number(hydrographics || 0) + Number(bias?.hydrographicsDm || 0), lowerBound, upperBound);
}

function sizeCodeToNumeric(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  if (normalized === "R" || normalized === "S") {
    return 0;
  }
  if (normalized === "A") return 10;
  if (normalized === "B") return 11;
  if (normalized === "C") return 12;
  if (normalized === "D") return 13;
  if (normalized === "E") return 14;
  if (normalized === "F") return 15;
  return Number(normalized) || 0;
}

function resolveStarTemperatureModifier(starClass) {
  const normalized = String(starClass || "")
    .trim()
    .toUpperCase();
  if (/^PROTO/.test(normalized)) return STAR_TEMP_MOD.PROTO;
  if (/^BD/.test(normalized)) return STAR_TEMP_MOD.BD;
  if (/^D/.test(normalized)) return STAR_TEMP_MOD.D;
  if (/^L/.test(normalized)) return STAR_TEMP_MOD.L;
  if (/^T/.test(normalized)) return STAR_TEMP_MOD.T;
  if (/^Y/.test(normalized)) return STAR_TEMP_MOD.Y;
  return STAR_TEMP_MOD[normalized.charAt(0)] ?? 0;
}

function toRomanNumeral(value) {
  const safeValue = Math.max(1, Math.trunc(Number(value) || 1));
  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remaining = safeValue;
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

// dice helpers are provided by diceFormulasWbh.js

function normalizeGasGiantDiameterCode(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "0";
  }
  if (numericValue <= 9) {
    return String(numericValue);
  }
  return String.fromCharCode(55 + numericValue);
}

function resolveGasGiantDm({ starClass, systemSpread }) {
  const normalized = String(starClass || "")
    .trim()
    .toUpperCase();
  let modifier = 0;

  if (/^BD/.test(normalized) || /^M\d*V$/.test(normalized) || /VI$/.test(normalized)) {
    modifier -= 1;
  }
  if (Number(systemSpread) < 0.1) {
    modifier -= 1;
  }

  return modifier;
}

function describeGasGiantSizeClass(sizeClass) {
  if (sizeClass === "GS") return "Small Gas Giant";
  if (sizeClass === "GM") return "Medium Gas Giant";
  return "Large Gas Giant";
}

export function determineGasGiantProfile({
  starClass,
  systemSpread,
  rollDie = createRandomRoller(),
  categoryRoll = null,
} = {}) {
  const initialRoll = (categoryRoll ?? rollSingleDie(rollDie, 6)) + resolveGasGiantDm({ starClass, systemSpread });

  let sizeClass = "GL";
  let diameterTerran = 0;
  let massEarth = 0;

  if (initialRoll <= 2) {
    sizeClass = "GS";
    diameterTerran = rollD3(rollDie) + rollD3(rollDie);
    massEarth = 5 * (rollSingleDie(rollDie, 6) + 1);
  } else if (initialRoll <= 4) {
    sizeClass = "GM";
    diameterTerran = rollSingleDie(rollDie, 6) + 6;
    massEarth = 20 * (rollNd(rollDie, 3) - 1);
  } else {
    sizeClass = "GL";
    diameterTerran = roll2d(rollDie) + 6;
    massEarth = rollD3(rollDie) * 50 * (rollNd(rollDie, 3) + 4);
    if (massEarth >= 3000) {
      massEarth = 4000 - (roll2d(rollDie) - 2) * 200;
    }
  }

  return {
    sizeClass,
    sizeClassLabel: describeGasGiantSizeClass(sizeClass),
    diameterTerran,
    diameterCode: normalizeGasGiantDiameterCode(diameterTerran),
    diameterKm: Math.round(diameterTerran * TERRA_DIAMETER_KM),
    massEarth,
    gasGiantCode: `${sizeClass}${normalizeGasGiantDiameterCode(diameterTerran)}`,
  };
}

function resolveMoonQuantityPenalty({ orbitNumber, moonQuantityPenalty = false } = {}) {
  if (moonQuantityPenalty) {
    return true;
  }
  return Number(orbitNumber) < 1;
}

export function determineSignificantMoonQuantity({
  sizeCode,
  orbitNumber,
  isGasGiant = false,
  gasGiantSizeClass = null,
  moonQuantityPenalty = false,
  rollDie = createRandomRoller(),
} = {}) {
  const penalized = resolveMoonQuantityPenalty({ orbitNumber, moonQuantityPenalty });
  let diceCount = 0;
  let subtract = 0;

  if (isGasGiant) {
    diceCount = gasGiantSizeClass === "GS" ? 3 : 4;
    subtract = gasGiantSizeClass === "GS" ? 7 : 6;
  } else {
    const numericSize = sizeCodeToNumeric(sizeCode);
    if (numericSize <= 2) {
      diceCount = 1;
      subtract = 5;
    } else if (numericSize <= 9) {
      diceCount = 2;
      subtract = 8;
    } else {
      diceCount = 2;
      subtract = 6;
    }
  }

  const penalty = penalized ? diceCount : 0;
  const total = rollNd(rollDie, diceCount) - subtract - penalty;
  return {
    quantity: Math.max(0, total),
    hasRingOnly: total === 0,
    penalized,
  };
}

function resolveMoonOrdinal(index) {
  const normalizedIndex = Math.max(0, Math.trunc(Number(index) || 0));
  const ordinal = normalizedIndex + 1;
  if (ordinal <= CLOSE_MOON_PHONETIC_SUFFIXES.length) {
    return CLOSE_MOON_PHONETIC_SUFFIXES[ordinal - 1];
  }

  const farOrdinal = ordinal - CLOSE_MOON_PHONETIC_SUFFIXES.length;
  const farIndex = (farOrdinal - 1) % FAR_MOON_PHONETIC_SUFFIXES.length;
  const farCycle = Math.floor((farOrdinal - 1) / FAR_MOON_PHONETIC_SUFFIXES.length) + 1;
  const base = FAR_MOON_PHONETIC_SUFFIXES[farIndex];
  return farCycle > 1 ? `${base} ${farCycle}` : base;
}

function buildMoonName(parentName, index) {
  return `${parentName} ${resolveMoonOrdinal(index)}`;
}

function resolveGasGiantSpecialMoonSize({ parentDiameterTerran, rollDie = createRandomRoller() } = {}) {
  const firstRoll = rollSingleDie(rollDie, 6);
  if (firstRoll <= 3) {
    return Math.ceil(rollSingleDie(rollDie, 6) / 3);
  }
  if (firstRoll <= 5) {
    return clamp(roll2d(rollDie) - 2, 0, 10);
  }

  const giantMoonSize = clamp(Math.round(parentDiameterTerran) - 1 - rollSingleDie(rollDie, 6), 6, 16);
  return giantMoonSize;
}

export function determineSignificantMoonSizes({
  sizeCode,
  moonCount,
  isGasGiant = false,
  gasGiantProfile = null,
  rollDie = createRandomRoller(),
} = {}) {
  const parentSize = sizeCodeToNumeric(sizeCode);
  const parentDiameterTerran = Number(gasGiantProfile?.diameterTerran || 0);
  const moonSizes = [];

  for (let index = 0; index < Number(moonCount || 0); index += 1) {
    const firstRoll = rollSingleDie(rollDie, 6);
    let size = "S";

    if (firstRoll <= 3) {
      size = "S";
    } else if (firstRoll <= 5) {
      const secondRoll = rollD3(rollDie) - 1;
      size = secondRoll <= 0 ? "R" : secondRoll;
    } else if (isGasGiant) {
      const specialSize = resolveGasGiantSpecialMoonSize({ parentDiameterTerran, rollDie });
      if (specialSize === 0) {
        size = "R";
      } else if (specialSize >= 16) {
        size = gasGiantProfile?.sizeClass === "GL" && roll2d(rollDie) === 12 ? 12 : 6;
      } else {
        size = specialSize;
      }
    } else {
      const terrestrialSize = parentSize - 1 - rollSingleDie(rollDie, 6);
      if (terrestrialSize < 0) {
        size = "S";
      } else if (terrestrialSize === 0) {
        size = "R";
      } else {
        size = terrestrialSize;
      }

      if (Number(size) === parentSize - 2) {
        const twinCheck = roll2d(rollDie);
        if (twinCheck === 2) size = parentSize - 1;
        if (twinCheck === 12) size = parentSize;
      }
    }

    if (parentSize === 1 && Number(size) < 1) {
      size = "S";
    }

    moonSizes.push(size);
  }

  return moonSizes;
}

export function getWbhAtmosphereDescription(code) {
  return ATMOSPHERE_TABLE[Number(code)] ?? "Unusual";
}

export function getWbhAtmosphereProfile(code) {
  const numericCode = Number(code);
  const description = getWbhAtmosphereDescription(numericCode);
  const profile = ATMOSPHERE_PROFILE_TABLE[numericCode] ?? {};

  return {
    code: numericCode,
    description,
    composition: profile.composition ?? description,
    minimumPressureBar: profile.minimumPressureBar ?? null,
    maximumPressureBar: profile.maximumPressureBar ?? null,
    spanBar: profile.spanBar ?? null,
    survivalGear: profile.survivalGear ?? "Varies",
  };
}

export function determineAtmosphereCode({ sizeCode, rollTotal } = {}) {
  if (sizeCodeToNumeric(sizeCode) <= 1) {
    return 0;
  }
  return clamp(Number(rollTotal) - 7 + sizeCodeToNumeric(sizeCode), 0, 15);
}

export function determineHydrographics({ atmosphereCode, rollTotal } = {}) {
  if (Number(atmosphereCode) === 0 || Number(atmosphereCode) === 1) {
    return 0;
  }
  return clamp(Number(rollTotal) - 7 + Number(atmosphereCode), 0, 10);
}

export function determineRunawayGreenhouse({
  sizeCode,
  atmosphereCode,
  systemAgeGyr = 0,
  temperatureAdjustedRoll = 7,
  greenhouseCheckRoll = 7,
  greenhouseAtmosphereRoll = 4,
} = {}) {
  const numericAtmosphereCode = Number(atmosphereCode);
  const numericTemperatureRoll = Number(temperatureAdjustedRoll);
  if (!(numericAtmosphereCode >= 2 && numericAtmosphereCode <= 15)) {
    return {
      occurred: false,
      hydrographicsDm: numericTemperatureRoll >= 12 ? -6 : numericTemperatureRoll >= 10 ? -2 : 0,
      temperatureAdjustedRoll: numericTemperatureRoll,
      convertedAtmosphereCode: numericAtmosphereCode,
    };
  }

  const isHotOrBoiling = numericTemperatureRoll >= 10;
  const greenhouseDm = Math.max(0, Math.ceil(Number(systemAgeGyr) || 0)) + (numericTemperatureRoll >= 12 ? 4 : 0);
  const occurred = isHotOrBoiling && Number(greenhouseCheckRoll) + greenhouseDm >= 12;
  if (!occurred) {
    return {
      occurred: false,
      hydrographicsDm: numericTemperatureRoll >= 12 ? -6 : numericTemperatureRoll >= 10 ? -2 : 0,
      temperatureAdjustedRoll: numericTemperatureRoll,
      convertedAtmosphereCode: numericAtmosphereCode,
    };
  }

  const atmosphereRollDm =
    ([2, 3, 4, 5].includes(sizeCodeToNumeric(sizeCode)) ? -2 : 0) +
    ([2, 4, 7, 9].includes(numericAtmosphereCode) ? 1 : 0);
  const adjustedAtmosphereRoll = Number(greenhouseAtmosphereRoll) + atmosphereRollDm;
  let convertedAtmosphereCode = numericAtmosphereCode;
  if (
    numericAtmosphereCode < 10 ||
    numericAtmosphereCode === 13 ||
    numericAtmosphereCode === 14 ||
    numericAtmosphereCode === 15
  ) {
    if (adjustedAtmosphereRoll <= 1) convertedAtmosphereCode = 10;
    else if (adjustedAtmosphereRoll <= 4) convertedAtmosphereCode = 11;
    else convertedAtmosphereCode = 12;
  }

  return {
    occurred: true,
    hydrographicsDm: -6,
    temperatureAdjustedRoll: Math.max(12, numericTemperatureRoll),
    convertedAtmosphereCode,
  };
}

function ignoresHydroTemperatureDm(atmosphereCode) {
  return Number(atmosphereCode) === 13;
}

export function determineHydrographicsDetailed({
  sizeCode,
  atmosphereCode,
  rollTotal,
  temperatureAdjustedRoll = 7,
  runawayGreenhouse = null,
} = {}) {
  const numericSize = sizeCodeToNumeric(sizeCode);
  const numericAtmosphereCode = Number(atmosphereCode);
  if (numericSize <= 1) {
    return 0;
  }

  let modifier = 0;
  if ([0, 1].includes(numericAtmosphereCode) || numericAtmosphereCode >= 10) {
    modifier -= 4;
  }

  if (!ignoresHydroTemperatureDm(numericAtmosphereCode)) {
    if (runawayGreenhouse?.occurred) {
      modifier += Number(runawayGreenhouse.hydrographicsDm || 0);
    } else if (Number(temperatureAdjustedRoll) >= 12) {
      modifier -= 6;
    } else if (Number(temperatureAdjustedRoll) >= 10) {
      modifier -= 2;
    }
  }

  return clamp(Number(rollTotal) - 7 + numericAtmosphereCode + modifier, 0, 10);
}

export function determineHydrographicsPercent({ hydrographics, sizeCode, coverageRoll = 5 } = {}) {
  const numericHydrographics = clamp(Number(hydrographics) || 0, 0, 10);
  const range = HYDROGRAPHICS_RANGE_TABLE[numericHydrographics] ?? HYDROGRAPHICS_RANGE_TABLE[0];

  if (numericHydrographics === 0) {
    return clamp(-4 + Number(coverageRoll), 0, 5);
  }
  if (numericHydrographics === 10) {
    if (sizeCodeToNumeric(sizeCode) > 9) {
      return 100;
    }
    return clamp(96 + Number(coverageRoll), 96, 100);
  }

  return clamp(range.min + Number(coverageRoll), range.min, range.max);
}

export function determineSurfaceDistribution({
  hydrographics,
  hydrographicsPercent,
  distributionRoll = 5,
  worldRoll = 4,
} = {}) {
  const numericHydrographics = clamp(Number(hydrographics) || 0, 0, 10);
  const numericPercent = clamp(Number(hydrographicsPercent) || 0, 0, 100);
  let dominantSurface = "land";
  if (numericHydrographics >= 6) dominantSurface = "ocean";
  else if (numericHydrographics === 5 || numericPercent === 50)
    dominantSurface = Number(worldRoll) <= 3 ? "ocean" : "land";

  const entry =
    SURFACE_DISTRIBUTION_TABLE[clamp(Number(distributionRoll) || 5, 0, 10)] ?? SURFACE_DISTRIBUTION_TABLE[5];
  const bodyType = dominantSurface === "ocean" ? "continents" : "oceans";
  return {
    dominantSurface,
    distribution: entry.label,
    majorBodyCoverage: entry.majorShare,
    bodyType,
    summary:
      dominantSurface === "ocean"
        ? `${entry.label} continents in a world ocean`
        : `${entry.label} oceans across a dominant landmass`,
  };
}

function normalizeRunawayGreenhouseProfile({
  runawayGreenhouse,
  temperatureAdjustedRoll,
  greenhouseAtmosphereCode,
  fallbackProfile,
  atmosphereCode,
} = {}) {
  if (runawayGreenhouse && typeof runawayGreenhouse === "object") {
    return {
      ...fallbackProfile,
      ...runawayGreenhouse,
    };
  }

  if (typeof runawayGreenhouse === "boolean") {
    return {
      ...fallbackProfile,
      occurred: runawayGreenhouse,
      temperatureAdjustedRoll:
        temperatureAdjustedRoll ?? runawayGreenhouse.temperatureAdjustedRoll ?? fallbackProfile.temperatureAdjustedRoll,
      convertedAtmosphereCode: runawayGreenhouse
        ? (greenhouseAtmosphereCode ?? fallbackProfile.convertedAtmosphereCode ?? Number(atmosphereCode))
        : null,
    };
  }

  return fallbackProfile;
}

function normalizeSurfaceDistributionProfile({
  surfaceDistribution,
  surfaceDistributionSummary,
  dominantSurface,
  fallbackProfile,
} = {}) {
  if (surfaceDistribution && typeof surfaceDistribution === "object") {
    return {
      ...fallbackProfile,
      ...surfaceDistribution,
    };
  }

  if (typeof surfaceDistribution === "string") {
    return {
      ...fallbackProfile,
      distribution: surfaceDistribution,
      summary: surfaceDistributionSummary ?? fallbackProfile.summary,
      dominantSurface: dominantSurface ?? fallbackProfile.dominantSurface,
    };
  }

  return fallbackProfile;
}

export function describeHydrosphere({ hydrographics, hydrographicsPercent, avgTempC, atmosphereCode } = {}) {
  const numericHydrographics = Number(hydrographics) || 0;
  const numericPercent = Number(hydrographicsPercent) || 0;
  const numericTemp = Number(avgTempC) || 0;
  const numericAtmosphereCode = Number(atmosphereCode) || 0;

  if (numericHydrographics <= 0 || numericPercent <= 0) {
    return {
      liquid: "None",
      description: "Dry surface with negligible stable liquids",
    };
  }

  if (numericTemp >= 1000) {
    return {
      liquid: "Magma",
      description: `${numericPercent}% surface fluid coverage, likely magma or molten rock`,
    };
  }
  if (numericTemp >= 60) {
    return {
      liquid: numericAtmosphereCode >= 10 ? "Exotic Superheated Liquids" : "Superheated Water",
      description: `${numericPercent}% fluid coverage with extreme evaporation pressure`,
    };
  }
  if (numericTemp >= 30) {
    return {
      liquid: numericAtmosphereCode >= 10 ? "Exotic Warm Liquids" : "Warm Surface Water",
      description: `${numericPercent}% fluid coverage with reduced stable open water`,
    };
  }
  if (numericTemp >= 0) {
    return {
      liquid: numericAtmosphereCode >= 10 ? "Exotic Temperate Liquids" : "Liquid Water",
      description: `${numericPercent}% surface coverage by stable liquids`,
    };
  }
  return {
    liquid: numericAtmosphereCode >= 10 ? "Cryogenic Fluids" : "Ice-Covered Water",
    description: `${numericPercent}% hydrosphere with extensive permanent ice`,
  };
}

export function categorizeWorldTemperature(avgTempC) {
  if (avgTempC < -50) return "Frozen";
  if (avgTempC < 0) return "Cold";
  if (avgTempC < 30) return "Temperate";
  if (avgTempC < 60) return "Hot";
  return "Scorching";
}

export function calculateAtmosphereTemperatureDm(atmosphereCode) {
  const numericCode = Number(atmosphereCode);
  if (numericCode === 2 || numericCode === 3) return -2;
  if (numericCode === 4 || numericCode === 5 || numericCode === 14) return -1;
  if (numericCode === 8 || numericCode === 9) return 1;
  if (numericCode === 10 || numericCode === 13 || numericCode === 15) return 2;
  if (numericCode === 11 || numericCode === 12) return 6;
  return 0;
}

export function calculateOrbitTemperatureRawRoll({ orbitNumber, hzco } = {}) {
  if (hzco === null || hzco === undefined) {
    return 7;
  }

  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);

  if (!Number.isFinite(numericOrbit) || !Number.isFinite(numericHzco)) {
    return 7;
  }

  let deviation = numericOrbit - numericHzco;
  if (numericOrbit < 1 || numericHzco < 1) {
    deviation *= 10;
  }
  deviation = Number(deviation.toFixed(2));

  if (deviation >= 1.1) return 2;
  if (deviation >= 1.0) return 3;
  if (deviation >= 0.5) return 4;
  if (deviation >= 0.2) return 5;
  if (deviation >= 0.1) return 6;
  if (deviation > -0.1) return 7;
  if (deviation > -0.2) return 8;
  if (deviation > -0.5) return 9;
  if (deviation > -1.0) return 10;
  if (deviation > -1.1) return 11;
  return 12;
}

export function determineAtmosphericPressureBar({
  atmosphereCode,
  pressureRoll = null,
  majorRoll = null,
  minorRoll = null,
} = {}) {
  const profile = getWbhAtmosphereProfile(atmosphereCode);
  if (!(profile.spanBar > 0) || !(profile.minimumPressureBar >= 0)) {
    return profile.minimumPressureBar;
  }

  let normalizedRoll = null;
  if (pressureRoll !== null && pressureRoll !== undefined && Number.isFinite(Number(pressureRoll))) {
    normalizedRoll = clamp(Number(pressureRoll) / 100, 0, 1);
  } else if (Number.isFinite(Number(majorRoll)) && Number.isFinite(Number(minorRoll))) {
    normalizedRoll = clamp(((Number(majorRoll) - 1) * 5 + (Number(minorRoll) - 1)) / 30, 0, 1);
  } else {
    normalizedRoll = 0.5;
  }

  const pressureBar = profile.minimumPressureBar + profile.spanBar * normalizedRoll;
  return Number(pressureBar.toFixed(3));
}

export function determineOxygenFraction({
  atmosphereCode,
  systemAgeGyr = 0,
  oxygenPrimaryRoll = null,
  oxygen2dRoll = null,
  oxygenVariance = 0,
  rollDie = createRandomRoller(),
} = {}) {
  const numericCode = Number(atmosphereCode);
  if (![2, 3, 4, 5, 6, 7, 8, 9, 13, 14].includes(numericCode)) {
    return null;
  }

  const primaryRoll = oxygenPrimaryRoll ?? rollSingleDie(rollDie, 6);
  const secondaryRoll = oxygen2dRoll ?? roll2d(rollDie);
  const ageDm = Number(systemAgeGyr) > 4 ? 1 : 0;
  let oxygenFraction =
    Number(primaryRoll + ageDm) / 20 + (Number(secondaryRoll) - 7) / 100 + Number(oxygenVariance || 0);

  if (!(oxygenFraction > 0)) {
    oxygenFraction = rollSingleDie(rollDie, 6) * 0.01 + Number(oxygenVariance || 0);
  }

  return Number(clamp(oxygenFraction, 0.01, 0.4).toFixed(3));
}

export function calculateOxygenPartialPressureBar({ atmospherePressureBar = null, oxygenFraction = null } = {}) {
  if (!Number.isFinite(Number(atmospherePressureBar)) || !Number.isFinite(Number(oxygenFraction))) {
    return null;
  }
  return Number((Number(atmospherePressureBar) * Number(oxygenFraction)).toFixed(3));
}

export function calculateAtmosphereScaleHeightKm({ gravity = 0, avgTempC = 15 } = {}) {
  if (!(Number(gravity) > 0)) {
    return null;
  }

  const meanTemperatureK = Number(avgTempC) + 273.15;
  return Number(((8.5 * meanTemperatureK) / 288 / Number(gravity)).toFixed(2));
}

function resolveAtmosphereTaintDm(atmosphereCode) {
  const numericCode = Number(atmosphereCode);
  if (numericCode === 4) return -2;
  if (numericCode === 9) return 2;
  return 0;
}

function findAtmosphereTaintSubtype(adjustedRoll) {
  return TAINT_SUBTYPE_TABLE.find((entry) => adjustedRoll >= entry.min && adjustedRoll <= entry.max) ?? null;
}

function normalizeAtmosphereTaintCode(code, avgTempC, allowOxygenSubtype = true) {
  const normalized = String(code || "")
    .replace(/\*/g, "")
    .trim()
    .toUpperCase();
  if (!allowOxygenSubtype && (normalized === "L" || normalized === "H")) {
    return "G";
  }
  if (normalized === "S" && Number(avgTempC) < 0) {
    return "P";
  }
  return normalized;
}

function buildAtmosphereTaintEntry(code) {
  return {
    code,
    label: TAINT_LABELS[code] ?? code,
  };
}

export function determineAtmosphereTaints({
  atmosphereCode,
  oxygenPartialPressureBar = null,
  avgTempC = 15,
  taintRollTotal = null,
  secondaryTaintRollTotal = null,
  tertiaryTaintRollTotal = null,
  rollDie = createRandomRoller(),
} = {}) {
  const numericCode = Number(atmosphereCode);
  if (![2, 4, 7, 9].includes(numericCode)) {
    return [];
  }

  const taints = [];
  let hasAutomaticOxygenTaint = false;
  if (Number.isFinite(Number(oxygenPartialPressureBar))) {
    if (Number(oxygenPartialPressureBar) < 0.1) {
      taints.push(buildAtmosphereTaintEntry("L"));
      hasAutomaticOxygenTaint = true;
    } else if (Number(oxygenPartialPressureBar) > 0.5) {
      taints.push(buildAtmosphereTaintEntry("H"));
      hasAutomaticOxygenTaint = true;
    }
  } else if (numericCode === 2) {
    taints.push(buildAtmosphereTaintEntry("L"));
    hasAutomaticOxygenTaint = true;
  }

  const dm = resolveAtmosphereTaintDm(numericCode);
  const appendFromRoll = (rollTotal, allowOxygenSubtype = true) => {
    const subtype = findAtmosphereTaintSubtype(Number(rollTotal) + dm);
    if (!subtype) {
      return false;
    }

    const resolvedCode = normalizeAtmosphereTaintCode(subtype.code, avgTempC, allowOxygenSubtype);
    if (!taints.some((entry) => entry.code === resolvedCode)) {
      taints.push(buildAtmosphereTaintEntry(resolvedCode));
    }

    return subtype.code === "P*";
  };

  const firstRoll = taintRollTotal ?? roll2d(rollDie);
  const firstSubtype = findAtmosphereTaintSubtype(Number(firstRoll) + dm);

  if (hasAutomaticOxygenTaint) {
    if (firstSubtype?.code === "P*") {
      if (!taints.some((entry) => entry.code === "P")) {
        taints.push(buildAtmosphereTaintEntry("P"));
      }
      const secondRoll = secondaryTaintRollTotal ?? roll2d(rollDie);
      const needsThirdRoll = appendFromRoll(secondRoll, false);
      if (needsThirdRoll) {
        appendFromRoll(tertiaryTaintRollTotal ?? roll2d(rollDie), false);
      }
    }
    return taints.slice(0, 3);
  }

  if (firstSubtype?.code === "P*") {
    taints.push(buildAtmosphereTaintEntry("P"));
    const secondRoll = secondaryTaintRollTotal ?? roll2d(rollDie);
    const needsThirdRoll = appendFromRoll(secondRoll, false);
    if (needsThirdRoll) {
      appendFromRoll(tertiaryTaintRollTotal ?? roll2d(rollDie), false);
    }
    return taints.slice(0, 3);
  }

  if (firstSubtype) {
    taints.push(buildAtmosphereTaintEntry(normalizeAtmosphereTaintCode(firstSubtype.code, avgTempC, true)));
  }

  return taints.slice(0, 3);
}

export function calculateAverageSurfaceTemperature({
  orbitNumber,
  hzco,
  atmosphereCode,
  rawTemperatureRoll = null,
} = {}) {
  const resolvedRawRoll =
    rawTemperatureRoll !== null && rawTemperatureRoll !== undefined && Number.isFinite(Number(rawTemperatureRoll))
      ? Number(rawTemperatureRoll)
      : calculateOrbitTemperatureRawRoll({ orbitNumber, hzco });
  const adjustedRoll = clamp(resolvedRawRoll + calculateAtmosphereTemperatureDm(atmosphereCode), 2, 12);
  let averageTemperatureK = 380;
  if (adjustedRoll <= 2) averageTemperatureK = 200;
  else if (adjustedRoll <= 4) averageTemperatureK = 248;
  else if (adjustedRoll <= 9) averageTemperatureK = 288;
  else if (adjustedRoll <= 11) averageTemperatureK = 329;
  return Math.round(averageTemperatureK - 273.15);
}

export function determineMagnetosphere({ density = 0, gravity = 0, atmosphereCode = 0, rollTotal } = {}) {
  const score =
    Number(rollTotal) +
    (Number(density) >= 0.8 ? 1 : 0) +
    (Number(gravity) >= 0.7 ? 1 : 0) -
    (Number(atmosphereCode) === 0 ? 1 : 0);
  return score >= 7 ? "Present" : "Absent";
}

export function determineDayLengthHours({ sizeCode, rollDie = createRandomRoller() } = {}) {
  const sizeModifier = Math.max(0, sizeCodeToNumeric(sizeCode) - 5);
  return Number((12 + rollSingleDie(rollDie, 6) * 4 + sizeModifier + (rollSingleDie(rollDie, 10) - 1) / 10).toFixed(1));
}

export function determineAxialTilt({ rollDie = createRandomRoller() } = {}) {
  return clamp(rollSingleDie(rollDie, 10) * 4 - rollSingleDie(rollDie, 6), 0, 90);
}

export function determineOrbitalPeriodDays({ orbitNumber, stellarMasses = [] } = {}) {
  if (
    Number.isFinite(Number(orbitNumber)) &&
    Array.isArray(stellarMasses) &&
    stellarMasses.some((mass) => Number(mass) > 0)
  ) {
    return Math.round(calculatePlanetaryOrbitalPeriod({ orbitNumber, stellarMasses }).days);
  }
  return null;
}

export function calculateStarTidalEffectMeters({
  starMassSolar = 0,
  worldSize = 0,
  orbitNumber = null,
  orbitAu = null,
} = {}) {
  const resolvedOrbitAu =
    orbitAu !== null && orbitAu !== undefined && Number.isFinite(Number(orbitAu))
      ? Number(orbitAu)
      : orbitNumber !== null && orbitNumber !== undefined && Number.isFinite(Number(orbitNumber))
        ? fractionalOrbitToAu(orbitNumber)
        : 0;
  if (!(Number(starMassSolar) > 0) || !(Number(worldSize) > 0) || !(resolvedOrbitAu > 0)) {
    return 0;
  }
  return Number(((Number(starMassSolar) * Number(worldSize)) / (32 * resolvedOrbitAu ** 3)).toFixed(3));
}

export function calculateMoonTidalEffectMeters({ moonMassEarth = 0, worldSize = 0, distanceMillionKm = 0 } = {}) {
  if (!(Number(moonMassEarth) > 0) || !(Number(worldSize) > 0) || !(Number(distanceMillionKm) > 0)) {
    return 0;
  }
  return Number(((Number(moonMassEarth) * Number(worldSize)) / (3.2 * Number(distanceMillionKm) ** 3)).toFixed(3));
}

export function calculatePlanetTidalEffectMeters({ planetMassEarth = 0, moonSize = 0, distanceMillionKm = 0 } = {}) {
  if (!(Number(planetMassEarth) > 0) || !(Number(moonSize) > 0) || !(Number(distanceMillionKm) > 0)) {
    return 0;
  }
  return Number(((Number(planetMassEarth) * Number(moonSize)) / (3.2 * Number(distanceMillionKm) ** 3)).toFixed(3));
}

export function determineTidalLockPressure({
  size,
  eccentricity = 0,
  axialTilt = 0,
  atmospherePressureBar = 0,
  systemAgeGyr = 0,
  orbitNumber = null,
  stellarMasses = [],
  totalMoonSize = 0,
} = {}) {
  const numericOrbit = Number(orbitNumber);
  const totalStarMass = (Array.isArray(stellarMasses) ? stellarMasses : []).reduce(
    (sum, mass) => sum + Number(mass || 0),
    0,
  );
  let dm = Math.ceil(Math.max(0, Number(size) || 0) / 3);

  if (Number(eccentricity) > 0.1) dm -= Math.floor(Number(eccentricity) * 10);
  if (Number(axialTilt) > 30) dm -= 2;
  if (Number(axialTilt) >= 60 && Number(axialTilt) <= 120) dm -= 4;
  if (Number(axialTilt) >= 80 && Number(axialTilt) <= 100) dm -= 4;
  if (Number(atmospherePressureBar) > 2.5) dm -= 2;
  if (Number(systemAgeGyr) < 1) dm -= 2;
  else if (Number(systemAgeGyr) > 10) dm += 4;
  else if (Number(systemAgeGyr) >= 5) dm += 2;

  dm -= 4;
  if (Number.isFinite(numericOrbit) && numericOrbit > 0) {
    if (numericOrbit < 1) dm += 4 + Math.floor((1 - numericOrbit) * 10);
    else if (numericOrbit < 2) dm += 4;
    else if (numericOrbit < 3) dm += 1;
    else dm -= Math.floor(numericOrbit) * 2;
  }

  if (totalStarMass < 0.5) dm -= 2;
  else if (totalStarMass < 1) dm -= 1;
  else if (totalStarMass > 5) dm += 2;
  else if (totalStarMass >= 2) dm += 1;

  if ((Array.isArray(stellarMasses) ? stellarMasses : []).length > 1) {
    dm -= (Array.isArray(stellarMasses) ? stellarMasses : []).length;
  }
  dm -= Number(totalMoonSize) || 0;

  const risk =
    dm >= 10 ? "automatic-lock-likely" : dm >= 6 ? "high" : dm >= 1 ? "moderate" : dm <= -10 ? "none" : "low";
  return { dm, risk };
}

function isGasGiantNativeLifeCandidate({ type = "", isMoon = false } = {}) {
  const normalizedType = String(type || "")
    .trim()
    .toLowerCase();

  return (
    !Boolean(isMoon) &&
    (normalizedType === "gas giant" || (normalizedType.includes("gas giant") && !normalizedType.includes("moon")))
  );
}

function isPlanetoidBeltNativeLifeCandidate({ type = "", isMoon = false } = {}) {
  const normalizedType = String(type || "")
    .trim()
    .toLowerCase();

  return (
    !Boolean(isMoon) &&
    (normalizedType === "planetoid belt" || normalizedType === "asteroid belt" || normalizedType.includes("belt"))
  );
}

function isRestrictedNativeLifeCandidate({ type = "", isMoon = false } = {}) {
  return isGasGiantNativeLifeCandidate({ type, isMoon }) || isPlanetoidBeltNativeLifeCandidate({ type, isMoon });
}

function isNativeSophontHabitableZoneCandidate({ orbitNumber = null, hzco = null, zone = "" } = {}) {
  const zoneToken = String(zone || "")
    .trim()
    .toLowerCase();

  if (zoneToken.includes("habitable")) {
    return true;
  }
  if (zoneToken.includes("inner") || zoneToken.includes("outer")) {
    return false;
  }

  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);
  if (!Number.isFinite(numericOrbit) || !Number.isFinite(numericHzco) || numericHzco <= 0) {
    return null;
  }

  const lowerBound = numericHzco >= 1 ? Math.max(0.01, numericHzco - 1) : Math.max(0.01, numericHzco - 0.1);
  const upperBound = numericHzco >= 1 ? numericHzco + 1 : numericHzco + 0.1;
  return numericOrbit >= lowerBound && numericOrbit <= upperBound;
}

function toExtendedHex(value) {
  const numeric = clamp(Math.trunc(Number(value) || 0), 0, 15);
  return numeric.toString(16).toUpperCase();
}

function buildNativeLifeRatings({
  size,
  atmosphereCode,
  hydrographics,
  avgTempC,
  atmosphereTaints = [],
  type,
  isMoon = false,
  systemAgeGyr = 5,
  rollDie = null,
  ...world
} = {}) {
  if (Number(size) <= 0 || isRestrictedNativeLifeCandidate({ type, isMoon })) {
    return { biomass: 0, biocomplexity: 0, biodiversity: 0, compatibility: 0 };
  }

  const subtypeBias = resolveWorldSubtypeEnvironmentalBias(world);
  const biomass = clamp(
    calculateBiomassRating({
      atmosphereCode,
      hydrographics,
      avgTempC,
      systemAgeGyr,
      rollDie,
    }) + Number(subtypeBias.biomassDm || 0),
    0,
    15,
  );

  if (biomass <= 0) {
    return { biomass: 0, biocomplexity: 0, biodiversity: 0, compatibility: 0 };
  }

  const biocomplexity = clamp(
    calculateBiocomplexityRating({
      biomass,
      atmosphereCode,
      atmosphereTaints,
      systemAgeGyr,
      rollDie,
    }) + Number(subtypeBias.biocomplexityDm || 0),
    1,
    15,
  );
  const biodiversity = calculateBiodiversityRating({ biomass, biocomplexity, rollDie });
  const compatibility = clamp(
    calculateCompatibilityRating({
      biomass,
      biocomplexity,
      atmosphereCode,
      atmosphereTaints,
      systemAgeGyr,
      rollDie,
    }) + Number(subtypeBias.compatibilityDm || 0),
    0,
    15,
  );

  return { biomass, biocomplexity, biodiversity, compatibility };
}

export function rollNativeSophontLife({
  size,
  atmosphereCode,
  hydrographics,
  avgTempC,
  type,
  isMoon = false,
  orbitNumber = null,
  hzco = null,
  zone = "",
  systemAgeGyr = 5,
  rollDie = createRandomRoller(),
}) {
  if (size <= 0 || isRestrictedNativeLifeCandidate({ type, isMoon })) return false;

  const habitableZoneCandidate = isNativeSophontHabitableZoneCandidate({ orbitNumber, hzco, zone });
  if (habitableZoneCandidate === false) return false;

  const { biomass, biocomplexity } = buildNativeLifeRatings({
    size,
    atmosphereCode,
    hydrographics,
    avgTempC,
    type,
    isMoon,
    systemAgeGyr,
    rollDie,
  });

  if (biomass <= 0 || biocomplexity < 8) return false;
  return rollTotalOrDice(2, 6, rollDie) + Math.min(biocomplexity, 9) - 7 >= 13;
}

function rollTotalOrDice(count, sides, rollDie = createRandomRoller()) {
  return rollNd(rollDie, count, sides);
}

export function determineNativeSophontLife({
  size,
  atmosphereCode,
  hydrographics,
  avgTempC,
  type,
  isMoon = false,
  orbitNumber = null,
  hzco = null,
  zone = "",
  systemAgeGyr = 5,
  rollDie = createRandomRoller(),
} = {}) {
  return rollNativeSophontLife({
    size,
    atmosphereCode,
    hydrographics,
    avgTempC,
    type,
    isMoon,
    orbitNumber,
    hzco,
    zone,
    systemAgeGyr,
    rollDie,
  });
}

export function buildNativeLifeProfile(world = {}) {
  const ratings = buildNativeLifeRatings({
    ...world,
    size: world?.size,
    atmosphereCode: world?.atmosphereCode,
    hydrographics: world?.hydrographics,
    avgTempC: world?.avgTempC,
    type: world?.type || world?.worldType,
    isMoon: world?.isMoon,
    systemAgeGyr: world?.systemAgeGyr ?? world?.systemAge,
    atmosphereTaints: world?.atmosphereTaints ?? [],
    rollDie: world?.rollDie ?? null,
  });

  return `${toExtendedHex(ratings.biomass)}${toExtendedHex(ratings.biocomplexity)}${toExtendedHex(ratings.biodiversity)}${toExtendedHex(ratings.compatibility)}`;
}

export function determineHabitabilityRating({
  candidateScore,
  size,
  atmosphereCode,
  hydrographics,
  avgTempC,
  ...world
} = {}) {
  const subtypeBias = resolveWorldSubtypeEnvironmentalBias(world);
  const numericCandidateScore = Number(candidateScore);
  if (Number.isFinite(numericCandidateScore)) {
    const adjustedCandidateScore = numericCandidateScore + Number(subtypeBias.habitabilityDm || 0);
    if (adjustedCandidateScore >= 12) return "Excellent";
    if (adjustedCandidateScore >= 8) return "Good";
    if (adjustedCandidateScore >= 4) return "Marginal";
    if (adjustedCandidateScore >= 1) return "Poor";
    return "Hostile";
  }

  const environmentalScore =
    [
      Number(size) >= 4 ? 1 : 0,
      Number(atmosphereCode) >= 4 && Number(atmosphereCode) <= 9
        ? 2
        : Number(atmosphereCode) >= 2 && Number(atmosphereCode) <= 3
          ? 1
          : 0,
      Number(hydrographics) >= 1 && Number(hydrographics) <= 9 ? 2 : Number(hydrographics) === 10 ? 1 : 0,
      Number(avgTempC) >= -10 && Number(avgTempC) <= 38 ? 2 : Number(avgTempC) >= -30 && Number(avgTempC) <= 60 ? 1 : 0,
    ].reduce((total, value) => total + value, 0) + Number(subtypeBias.habitabilityDm || 0);

  if (environmentalScore >= 6) return "Excellent";
  if (environmentalScore >= 4) return "Good";
  if (environmentalScore >= 2) return "Marginal";
  if (environmentalScore >= 1) return "Poor";
  return "Hostile";
}

export function determineResourceRating(world = {}) {
  const size = Number(world?.size ?? 0);
  const type = String(world?.type || world?.worldType || "");
  const atmosphereCode = Number(world?.atmosphereCode ?? 0);
  const hydrographics = Number(world?.hydrographics ?? 0);
  const subtypeBias = resolveWorldSubtypeEnvironmentalBias(world);
  const base =
    (type === "Planetoid Belt" ? 3 : 0) +
    (type.includes("Gas Giant") ? 2 : 0) +
    (size >= 8 ? 2 : size >= 4 ? 1 : 0) +
    (atmosphereCode >= 10 ? 1 : 0) +
    (hydrographics === 0 ? 1 : 0) +
    Number(subtypeBias.resourceDm || 0);

  if (base >= 6) return "Abundant";
  if (base >= 4) return "Good";
  if (base >= 2) return "Moderate";
  return "Sparse";
}

export function calculateResidualSeismicStress({
  size,
  systemAgeGyr = 0,
  isMoon = false,
  majorMoonCount = 0,
  density = 0,
} = {}) {
  let modifier = 0;
  if (isMoon) modifier += 1;
  modifier += clamp(Math.floor(Number(majorMoonCount) || 0), 0, 12);
  if (Number(density) > 1) modifier += 1;
  else if (Number(density) < 0.5) modifier -= 1;

  const preSquare = Math.floor(Number(size) - Number(systemAgeGyr) + modifier);
  if (preSquare < 1) {
    return 0;
  }
  return preSquare ** 2;
}

export function calculateTidalStressFactor({ tidalEffects = [], totalTidalEffect = null } = {}) {
  const total =
    totalTidalEffect !== null
      ? Number(totalTidalEffect)
      : (Array.isArray(tidalEffects) ? tidalEffects : []).reduce((sum, effect) => sum + Number(effect || 0), 0);
  if (!(total > 0)) {
    return 0;
  }
  return Math.floor(total / 10);
}

export function calculateTidalHeatingFactor({
  primaryMassEarth = 0,
  worldSize = 0,
  eccentricity = 0,
  distanceMillionKm = 0,
  periodDays = 0,
  worldMassEarth = 0,
} = {}) {
  const numerator = Number(primaryMassEarth) ** 2 * Number(worldSize) ** 5 * Math.max(0, Number(eccentricity)) ** 2;
  const denominator =
    3000 *
    Math.max(0, Number(distanceMillionKm)) ** 5 *
    Math.max(0, Number(periodDays)) *
    Math.max(0, Number(worldMassEarth));

  if (!(numerator > 0) || !(denominator > 0)) {
    return 0;
  }

  const factor = numerator / denominator;
  return factor >= 1 ? Math.floor(factor) : 0;
}

export function calculateTotalSeismicStress({
  residualSeismicStress = 0,
  tidalStressFactor = 0,
  tidalHeatingFactor = 0,
} = {}) {
  return Number(residualSeismicStress || 0) + Number(tidalStressFactor || 0) + Number(tidalHeatingFactor || 0);
}

export function calculateSeismicAdjustedTemperatureK({ temperatureK = 0, totalSeismicStress = 0 } = {}) {
  const numericTemperature = Math.max(0, Number(temperatureK) || 0);
  const numericStress = Math.max(0, Number(totalSeismicStress) || 0);
  return Math.pow(numericTemperature ** 4 + numericStress ** 4, 0.25);
}

export function determineMajorTectonicPlates({ size, hydrographics, totalSeismicStress = 0, rollTotal } = {}) {
  if (!(Number(totalSeismicStress) > 0) || !(Number(hydrographics) >= 1)) {
    return 0;
  }

  let modifier = 0;
  if (Number(totalSeismicStress) > 100) modifier += 2;
  else if (Number(totalSeismicStress) >= 10) modifier += 1;

  const result = Number(size || 0) + Number(hydrographics || 0) - Number(rollTotal || 0) + modifier;
  return result > 1 ? result : 0;
}

export function buildWbhSeismologyProfile({
  size,
  systemAgeGyr = 0,
  isMoon = false,
  moonsData = [],
  density = 0,
  tidalEffects = [],
  totalTidalEffect = null,
  primaryMassEarth = null,
  primaryMassInSolarMasses = null,
  stellarMasses = [],
  eccentricity = 0,
  distanceMillionKm = null,
  orbitNumber = null,
  periodDays = null,
  worldMassEarth = 0,
  hydrographics = 0,
  avgTempC = 0,
  tectonicRollTotal = null,
  rollDie = createRandomRoller(),
} = {}) {
  const majorMoonCount = (Array.isArray(moonsData) ? moonsData : []).filter((moon) => {
    if (moon?.ring) {
      return false;
    }
    return sizeCodeToNumeric(moon?.sizeCode ?? moon?.size ?? 0) >= 1;
  }).length;
  const resolvedPrimaryMassEarth =
    primaryMassEarth !== null
      ? Number(primaryMassEarth)
      : Number(primaryMassInSolarMasses || 0) > 0
        ? Number(primaryMassInSolarMasses) * SOLAR_MASS_TO_EARTH_MASS
        : (Array.isArray(stellarMasses) ? stellarMasses : []).reduce((sum, mass) => sum + Number(mass || 0), 0) *
          SOLAR_MASS_TO_EARTH_MASS;
  const resolvedDistanceMillionKm =
    distanceMillionKm !== null
      ? Number(distanceMillionKm)
      : Number.isFinite(Number(orbitNumber))
        ? fractionalOrbitToAu(orbitNumber) * AU_TO_MILLION_KM
        : 0;
  const resolvedPeriodDays =
    periodDays !== null
      ? Number(periodDays)
      : Number.isFinite(Number(orbitNumber)) && Array.isArray(stellarMasses) && stellarMasses.length
        ? calculatePlanetaryOrbitalPeriod({ orbitNumber, stellarMasses }).days
        : 0;
  const derivedTidalEffects =
    Array.isArray(tidalEffects) && tidalEffects.length
      ? tidalEffects.map((effect) => Number(effect || 0)).filter((effect) => effect > 0)
      : [
          isMoon
            ? calculatePlanetTidalEffectMeters({
                planetMassEarth: resolvedPrimaryMassEarth,
                moonSize: size,
                distanceMillionKm: resolvedDistanceMillionKm,
              })
            : calculateStarTidalEffectMeters({
                starMassSolar: (Array.isArray(stellarMasses) ? stellarMasses : []).reduce(
                  (sum, mass) => sum + Number(mass || 0),
                  0,
                ),
                worldSize: size,
                orbitNumber,
              }),
        ].filter((effect) => effect > 0);
  const resolvedTotalTidalEffect =
    totalTidalEffect !== null
      ? Number(totalTidalEffect)
      : derivedTidalEffects.reduce((sum, effect) => sum + Number(effect || 0), 0);

  const residualSeismicStress = calculateResidualSeismicStress({
    size,
    systemAgeGyr,
    isMoon,
    majorMoonCount,
    density,
  });
  const tidalStressFactor = calculateTidalStressFactor({
    tidalEffects: derivedTidalEffects,
    totalTidalEffect: resolvedTotalTidalEffect,
  });
  const tidalHeatingFactor = calculateTidalHeatingFactor({
    primaryMassEarth: resolvedPrimaryMassEarth,
    worldSize: size,
    eccentricity,
    distanceMillionKm: resolvedDistanceMillionKm,
    periodDays: resolvedPeriodDays,
    worldMassEarth,
  });
  const totalSeismicStress = calculateTotalSeismicStress({
    residualSeismicStress,
    tidalStressFactor,
    tidalHeatingFactor,
  });
  const seismicAdjustedTemperatureK = calculateSeismicAdjustedTemperatureK({
    temperatureK: Number(avgTempC) + 273.15,
    totalSeismicStress,
  });
  const majorTectonicPlates = determineMajorTectonicPlates({
    size,
    hydrographics,
    totalSeismicStress,
    rollTotal: tectonicRollTotal ?? roll2d(rollDie),
  });

  return {
    residualSeismicStress,
    tidalEffects: derivedTidalEffects,
    totalTidalEffectMeters: Number(resolvedTotalTidalEffect.toFixed(3)),
    tidalStressFactor,
    tidalHeatingFactor,
    totalSeismicStress,
    seismicAdjustedTemperatureK: Number(seismicAdjustedTemperatureK.toFixed(3)),
    majorTectonicPlates,
  };
}

export function determineWorldMoons({
  sizeCode,
  atmosphereCode,
  hydrographics,
  isGasGiant = false,
  gasGiantProfile = null,
  orbitNumber = null,
  moonQuantityPenalty = false,
  parentName,
  generateMoons = true,
  moonProfileFactory = null,
  rollDie = createRandomRoller(),
} = {}) {
  if (!generateMoons || (!isGasGiant && sizeCodeToNumeric(sizeCode) <= 0)) {
    return [];
  }

  const moons = [];
  const moonQuantity = determineSignificantMoonQuantity({
    sizeCode,
    orbitNumber,
    isGasGiant,
    gasGiantSizeClass: gasGiantProfile?.sizeClass,
    moonQuantityPenalty,
    rollDie,
  });
  const sizeResults = determineSignificantMoonSizes({
    sizeCode,
    moonCount: moonQuantity.quantity,
    isGasGiant,
    gasGiantProfile,
    rollDie,
  });

  sizeResults.forEach((sizeResult, index) => {
    const name = buildMoonName(parentName, index);
    const isRing = sizeResult === "R";
    const sizeCategory = isRing ? "R" : sizeResult;
    const worldProfile =
      !isRing && typeof moonProfileFactory === "function"
        ? moonProfileFactory({ worldName: name, sizeCode: sizeCategory })
        : null;
    moons.push({
      name,
      type: "significant",
      size: sizeCategory,
      sizeCode: String(sizeCategory),
      orbitalSlot: index + 1,
      ring: isRing,
      description: isRing ? "Significant ring" : `${isGasGiant ? "Gas-giant" : "World"} significant moon`,
      ...(worldProfile && typeof worldProfile === "object" ? { worldProfile } : {}),
    });
  });

  if (moonQuantity.hasRingOnly) {
    moons.push({
      name: `${parentName} ring`,
      type: "significant",
      size: "R",
      sizeCode: "R",
      orbitalSlot: 0,
      ring: true,
      description: "Significant ring",
    });
  }

  const significantNonRingCount = moons.filter((moon) => moon.type === "significant" && !moon.ring).length;
  const baseMinorCount = isGasGiant
    ? Math.max(0, Math.round((Number(gasGiantProfile?.diameterTerran || 0) * 8) / 10))
    : Math.max(0, sizeCodeToNumeric(sizeCode));
  const minorCount = Math.max(0, Math.round(baseMinorCount / 4 + Math.floor(significantNonRingCount / 2)));
  for (let index = 0; index < minorCount; index += 1) {
    const slot = moons.length + index + 1;
    moons.push({
      name: `${parentName} ${slot}`,
      type: "insignificant",
      size: clamp(Math.round((rollSingleDie(rollDie, 6) - 1) / 2), 0, 5),
      orbitalSlot: slot,
      ring: false,
      description: "Small/insignificant moon",
    });
  }

  return moons;
}

export function buildWbhEnvironmentalProfile(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const sizeCode = normalizeSizeCode(params.sizeCode ?? params.size ?? "5");
  const size = params.size ?? sizeCodeToNumeric(sizeCode);
  const baseAtmosphereCode =
    params.atmosphereCode ?? determineAtmosphereCode({ sizeCode, rollTotal: params.atmosphereRoll ?? roll2d(rollDie) });
  const temperatureRawRoll =
    params.temperatureRawRoll ??
    calculateOrbitTemperatureRawRoll({ orbitNumber: params.orbitNumber, hzco: params.hzco });
  const baseTemperatureAdjustedRoll = clamp(
    temperatureRawRoll + calculateAtmosphereTemperatureDm(baseAtmosphereCode),
    2,
    12,
  );
  const baseRunawayGreenhouse = determineRunawayGreenhouse({
    sizeCode,
    atmosphereCode: baseAtmosphereCode,
    systemAgeGyr: params.systemAgeGyr,
    temperatureAdjustedRoll: baseTemperatureAdjustedRoll,
    greenhouseCheckRoll: params.greenhouseCheckRoll,
    greenhouseAtmosphereRoll: params.greenhouseAtmosphereRoll,
  });
  const hydrographicsRollTotal = params.hydrographicsRoll ?? roll2d(rollDie);
  const baseHydrographics =
    params.hydrographics ??
    determineHydrographicsDetailed({
      sizeCode,
      atmosphereCode: baseAtmosphereCode,
      rollTotal: hydrographicsRollTotal,
      temperatureAdjustedRoll: baseRunawayGreenhouse.temperatureAdjustedRoll,
      runawayGreenhouse: baseRunawayGreenhouse,
    });
  const baseAvgTempC =
    params.avgTempC ??
    calculateAverageSurfaceTemperature({
      orbitNumber: params.orbitNumber,
      hzco: params.hzco,
      atmosphereCode: baseAtmosphereCode,
      rawTemperatureRoll: temperatureRawRoll,
    });
  const derivedClassification = classifyPlanetaryBody({
    ...params,
    size,
    sizeCode,
    atmosphereCode: baseAtmosphereCode,
    hydrographics: baseHydrographics,
    avgTempC: baseAvgTempC,
  });
  const subtypeBias = resolveWorldSubtypeEnvironmentalBias({
    type: params.type ?? params.baseWorld?.type,
    orbitBandKey: params.orbitBandKey ?? params.baseWorld?.orbitBandKey ?? derivedClassification.orbitBandKey,
    worldSubtype: params.worldSubtype ?? params.baseWorld?.worldSubtype,
    worldClass: params.worldClass ?? params.baseWorld?.worldClass,
    worldDescriptor: params.worldDescriptor ?? params.baseWorld?.worldDescriptor,
  });
  const atmosphereCode = clamp(baseAtmosphereCode + Number(subtypeBias.atmosphereDm || 0), 0, 15);
  const initialTemperatureAdjustedRoll = clamp(
    temperatureRawRoll + calculateAtmosphereTemperatureDm(atmosphereCode),
    2,
    12,
  );
  const fallbackRunawayGreenhouse = determineRunawayGreenhouse({
    sizeCode,
    atmosphereCode,
    systemAgeGyr: params.systemAgeGyr,
    temperatureAdjustedRoll: initialTemperatureAdjustedRoll,
    greenhouseCheckRoll: params.greenhouseCheckRoll,
    greenhouseAtmosphereRoll: params.greenhouseAtmosphereRoll,
  });
  const runawayGreenhouse = normalizeRunawayGreenhouseProfile({
    runawayGreenhouse: params.runawayGreenhouse,
    temperatureAdjustedRoll: params.temperatureAdjustedRoll,
    greenhouseAtmosphereCode: params.greenhouseAtmosphereCode,
    fallbackProfile: fallbackRunawayGreenhouse,
    atmosphereCode,
  });
  const hydrographics =
    params.hydrographics ??
    applySubtypeHydrographicsBias(
      determineHydrographicsDetailed({
        sizeCode,
        atmosphereCode,
        rollTotal: hydrographicsRollTotal,
        temperatureAdjustedRoll: runawayGreenhouse.temperatureAdjustedRoll,
        runawayGreenhouse,
      }),
      subtypeBias,
    );
  const avgTempC =
    params.avgTempC ??
    Math.round(
      calculateAverageSurfaceTemperature({
        orbitNumber: params.orbitNumber,
        hzco: params.hzco,
        atmosphereCode,
        rawTemperatureRoll: temperatureRawRoll,
      }) + Number(subtypeBias.tempDm || 0),
    );
  const atmosphereProfile = getWbhAtmosphereProfile(atmosphereCode);
  const temperatureAdjustedRoll = runawayGreenhouse.temperatureAdjustedRoll;
  const hydrographicsPercent =
    params.hydrographicsPercent ??
    determineHydrographicsPercent({ hydrographics, sizeCode, coverageRoll: params.hydrographicsCoverageRoll ?? 5 });
  const fallbackSurfaceDistribution = determineSurfaceDistribution({
    hydrographics,
    hydrographicsPercent,
    distributionRoll: params.surfaceDistributionRoll ?? 5,
    worldRoll: params.surfaceWorldRoll ?? 4,
  });
  const surfaceDistribution = normalizeSurfaceDistributionProfile({
    surfaceDistribution: params.surfaceDistribution,
    surfaceDistributionSummary: params.surfaceDistributionSummary,
    dominantSurface: params.dominantSurface,
    fallbackProfile: fallbackSurfaceDistribution,
  });
  const hydrosphere =
    params.hydrosphere ?? describeHydrosphere({ hydrographics, hydrographicsPercent, avgTempC, atmosphereCode });
  const atmospherePressureBar =
    params.atmospherePressureBar ??
    determineAtmosphericPressureBar({
      atmosphereCode,
      pressureRoll: params.atmospherePressureRoll,
      majorRoll: params.atmospherePressureMajorRoll,
      minorRoll: params.atmospherePressureMinorRoll,
    });
  const oxygenFraction = params.isGasGiant
    ? null
    : (params.oxygenFraction ??
      determineOxygenFraction({
        atmosphereCode,
        systemAgeGyr: params.systemAgeGyr,
        oxygenPrimaryRoll: params.oxygenPrimaryRoll,
        oxygen2dRoll: params.oxygen2dRoll,
        oxygenVariance: params.oxygenVariance,
        rollDie,
      }));
  const oxygenPartialPressureBar = params.isGasGiant
    ? null
    : (params.oxygenPartialPressureBar ?? calculateOxygenPartialPressureBar({ atmospherePressureBar, oxygenFraction }));
  const atmosphereScaleHeightKm = params.isGasGiant
    ? null
    : (params.atmosphereScaleHeightKm ?? calculateAtmosphereScaleHeightKm({ gravity: params.gravity, avgTempC }));
  const atmosphereTaints = params.isGasGiant
    ? []
    : (params.atmosphereTaints ??
      determineAtmosphereTaints({
        atmosphereCode,
        oxygenPartialPressureBar,
        avgTempC,
        taintRollTotal: params.taintRollTotal,
        secondaryTaintRollTotal: params.secondaryTaintRollTotal,
        tertiaryTaintRollTotal: params.tertiaryTaintRollTotal,
        rollDie,
      }));
  const generatedAtmosphereComposition = generateAtmosphereComposition({
    atmosphereCode,
    oxygenFraction,
    oxygenPartialPressureBar,
    avgTempC,
    hydrographics,
    atmosphereTaints,
    isGasGiant: params.isGasGiant,
    gasGiantProfile: params.gasGiantProfile,
  });
  const generatedAtmosphereCompositionDetailed = generateAtmosphereCompositionDetailed({
    atmosphereCode,
    oxygenFraction,
    oxygenPartialPressureBar,
    avgTempC,
    hydrographics,
    atmosphereTaints,
    isGasGiant: params.isGasGiant,
    gasGiantProfile: params.gasGiantProfile,
  });
  const generatedHydrographicsComposition = generateHydrographicsComposition({
    hydrographics,
    hydrographicsPercent,
    avgTempC,
    atmosphereCode,
    surfaceDistribution: surfaceDistribution.distribution,
    isGasGiant: params.isGasGiant,
  });
  const generatedHydrographicsCompositionDetailed = generateHydrographicsCompositionDetailed({
    hydrographics,
    hydrographicsPercent,
    avgTempC,
    atmosphereCode,
    surfaceDistribution: surfaceDistribution.distribution,
    isGasGiant: params.isGasGiant,
  });
  const generatedPlanetCompositionDetailed = generatePlanetCompositionDetailed({
    sizeCode,
    size,
    density: params.density,
    avgTempC,
    hydrographics,
    hydrographicsPercent,
    baseComposition: params.composition ?? params.baseWorld?.composition ?? null,
    atmosphereCode,
    starMetallicity: params.starMetallicity,
  });
  const generatedPlanetComposition = generatePlanetComposition({
    sizeCode,
    size,
    density: params.density,
    avgTempC,
    hydrographics,
    hydrographicsPercent,
    baseComposition: params.composition ?? params.baseWorld?.composition ?? null,
    atmosphereCode,
    starMetallicity: params.starMetallicity,
  });
  const moonsData = determineWorldMoons({
    sizeCode,
    atmosphereCode,
    hydrographics,
    isGasGiant: params.isGasGiant,
    gasGiantProfile: params.gasGiantProfile,
    orbitNumber: params.orbitNumber,
    moonQuantityPenalty: params.moonQuantityPenalty,
    parentName: String(params.worldName || params.name || "World").trim() || "World",
    generateMoons: params.generateMoons !== false,
    moonProfileFactory: params.moonProfileFactory,
    rollDie,
  });
  const orbitalPeriodDays =
    params.orbitalPeriodDays ??
    determineOrbitalPeriodDays({ orbitNumber: params.orbitNumber, stellarMasses: params.stellarMasses }) ??
    Math.round(200 + rollSingleDie(rollDie, 12) * 100);
  const totalMoonSize = moonsData.reduce(
    (sum, moon) => sum + Math.max(0, sizeCodeToNumeric(moon?.sizeCode ?? moon?.size ?? 0)),
    0,
  );
  const tidalLockPressure =
    params.tidalLockPressure ??
    determineTidalLockPressure({
      size: sizeCodeToNumeric(sizeCode),
      eccentricity: params.eccentricity,
      axialTilt: params.axialTilt ?? 0,
      atmospherePressureBar,
      systemAgeGyr: params.systemAgeGyr,
      orbitNumber: params.orbitNumber,
      stellarMasses: params.stellarMasses,
      totalMoonSize,
    });
  const surfaceTidalEffectMeters =
    params.surfaceTidalEffectMeters ??
    calculateStarTidalEffectMeters({
      starMassSolar: (Array.isArray(params.stellarMasses) ? params.stellarMasses : []).reduce(
        (sum, massValue) => sum + Number(massValue || 0),
        0,
      ),
      worldSize: sizeCodeToNumeric(sizeCode),
      orbitNumber: params.orbitNumber,
    });
  const resolvedAxialTilt = params.axialTilt ?? determineAxialTilt({ rollDie });
  const resolvedDayLengthHours = params.dayLengthHours ?? determineDayLengthHours({ sizeCode, rollDie });

  return {
    atmosphereCode,
    atmosphereDesc: getWbhAtmosphereDescription(atmosphereCode),
    atmosphereComposition: generatedAtmosphereComposition || atmosphereProfile.composition,
    atmosphereCompositionDetailed: generatedAtmosphereCompositionDetailed,
    atmospherePressureBar,
    atmospherePressureRangeBar:
      atmosphereProfile.minimumPressureBar !== null && atmosphereProfile.maximumPressureBar !== null
        ? `${atmosphereProfile.minimumPressureBar}-${atmosphereProfile.maximumPressureBar}`
        : "Varies",
    atmosphereSurvivalGear: atmosphereProfile.survivalGear,
    oxygenFraction,
    oxygenPartialPressureBar,
    atmosphereScaleHeightKm,
    atmosphereTaints,
    atmosphereTaintProfile: atmosphereTaints.map((entry) => entry.label).join(", "),
    hydrographics,
    hydrographicsPercent,
    hydrographicsComposition: generatedHydrographicsComposition,
    hydrographicsCompositionDetailed: generatedHydrographicsCompositionDetailed,
    compositionDetailed: generatedPlanetCompositionDetailed,
    planetComposition: generatedPlanetComposition,
    hydrosphereLiquid: hydrosphere.liquid,
    hydrosphereDescription: hydrosphere.description,
    surfaceDistribution: surfaceDistribution.distribution,
    surfaceDistributionSummary: surfaceDistribution.summary,
    dominantSurface: surfaceDistribution.dominantSurface,
    avgTempC,
    tempCategory: categorizeWorldTemperature(avgTempC),
    temperatureRawRoll,
    temperatureAdjustedRoll,
    runawayGreenhouse: runawayGreenhouse.occurred,
    greenhouseAtmosphereCode: runawayGreenhouse.occurred ? runawayGreenhouse.convertedAtmosphereCode : null,
    orbitalPeriodDays,
    dayLengthHours: resolvedDayLengthHours,
    axialTilt: resolvedAxialTilt,
    surfaceTidalEffectMeters,
    tidalLockPressure,
    moons: moonsData.length,
    moonsData,
    magnetosphere:
      params.magnetosphere ??
      determineMagnetosphere({
        density: params.density,
        gravity: params.gravity,
        atmosphereCode,
        rollTotal: params.magnetosphereRoll ?? roll2d(rollDie),
      }),
    nativeSophontLife: isRestrictedNativeLifeCandidate({ type: params.type, isMoon: params.isMoon })
      ? false
      : (params.nativeSophontLife ??
        determineNativeSophontLife({
          size: Number(size) || 0,
          atmosphereCode,
          hydrographics,
          avgTempC,
          type: params.type,
          isMoon: params.isMoon,
          orbitNumber: params.orbitNumber,
          hzco: params.hzco,
          zone: params.zone,
          systemAgeGyr: params.systemAgeGyr,
          rollDie,
        })),
  };
}

function normalizeSizeCode(sizeCode) {
  const normalized = String(sizeCode).trim().toUpperCase();
  if (normalized === "10") return "A";
  if (normalized === "11") return "B";
  if (normalized === "12") return "C";
  if (normalized === "13") return "D";
  if (normalized === "14") return "E";
  if (normalized === "15") return "F";
  return normalized;
}

function resolveSizeModifier(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  if (normalized === "0" || normalized === "1" || normalized === "2" || normalized === "3" || normalized === "4") {
    return -1;
  }
  if (["6", "7", "8", "9"].includes(normalized)) {
    return 1;
  }
  if (["A", "B", "C", "D", "E", "F"].includes(normalized)) {
    return 3;
  }
  return 0;
}

function resolveOrbitModifier({ orbitNumber, hzco }) {
  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);

  if (!Number.isFinite(numericOrbit) || !Number.isFinite(numericHzco)) {
    return 0;
  }

  if (numericOrbit <= numericHzco) {
    return 1;
  }

  return -1 - Math.floor(numericOrbit - numericHzco);
}

export function expandWbhSizeBeyondA({ baseSize, rollDie }) {
  const normalizedBaseSize = Number(baseSize);
  if (!Number.isInteger(normalizedBaseSize)) {
    throw new TypeError("Base size must be an integer");
  }

  if (normalizedBaseSize !== 10) {
    return normalizedBaseSize;
  }

  if (typeof rollDie !== "function") {
    throw new TypeError("rollDie callback is required when expanding size beyond A");
  }

  let expandedSize = normalizedBaseSize;
  while (expandedSize < 15 && rollDie(6) >= 4) {
    expandedSize += 1;
  }

  return expandedSize;
}

export function getWbhWorldSizeEntry(sizeCode) {
  const normalized = normalizeSizeCode(sizeCode);
  const entry = WORLD_SIZE_TABLE[normalized];
  if (!entry) {
    throw new RangeError(`Unknown WBH size code: ${sizeCode}`);
  }
  return entry;
}

export function determineWorldDiameter({ sizeCode, rollDie = createRandomRoller(), detailDie = null } = {}) {
  const entry = getWbhWorldSizeEntry(sizeCode);
  if (entry.code === "0" || entry.code === "R") {
    return 0;
  }

  if (entry.code === "S") {
    let d6 = rollDie(6);
    while (d6 > 4) {
      d6 = rollDie(6);
    }
    return 400 + (d6 - 1) * 100 + (detailDie === null ? 0 : detailDie);
  }

  let increment = 1600;
  let d3 = 0;
  let d6 = 0;
  while (increment >= 1600) {
    d3 = rollDie(3);
    d6 = rollDie(6);
    increment = (d3 - 1) * 600 + (d6 - 1) * 100;
  }

  return entry.minDiameterKm + increment + (detailDie === null ? 0 : detailDie);
}

export function determineTerrestrialComposition({ sizeCode, orbitNumber, hzco, systemAgeGyr = 0, rollTotal } = {}) {
  const adjustedRoll =
    Number(rollTotal) +
    resolveSizeModifier(sizeCode) +
    resolveOrbitModifier({ orbitNumber, hzco }) +
    (Number(systemAgeGyr) > 10 ? -1 : 0);
  return (
    TERRESTRIAL_COMPOSITION_TABLE.find((entry) => adjustedRoll >= entry.min && adjustedRoll <= entry.max)
      ?.composition ?? "Mostly Rock"
  );
}

export function determineTerrestrialDensity({ composition, rollTotal } = {}) {
  const normalizedRoll = clamp(Math.round(Number(rollTotal) || 2), 2, 12);
  const density = TERRESTRIAL_DENSITY_TABLE[composition]?.[normalizedRoll];
  if (density === undefined) {
    throw new RangeError(`Unsupported composition or roll: ${composition} / ${rollTotal}`);
  }
  return density;
}

export function calculateWorldGravity({ density, diameterKm }) {
  return Number(density) * (Number(diameterKm) / TERRA_DIAMETER_KM);
}

export function calculateWorldMass({ density, diameterKm }) {
  return Number(density) * (Number(diameterKm) / TERRA_DIAMETER_KM) ** 3;
}

export function calculateEscapeVelocity({ mass, diameterKm }) {
  return Math.sqrt(Number(mass) / (Number(diameterKm) / TERRA_DIAMETER_KM)) * TERRA_ESCAPE_VELOCITY_MPS;
}

export function calculateSurfaceOrbitalVelocity({ escapeVelocityMps }) {
  return Number(escapeVelocityMps) / Math.sqrt(2);
}

export function calculateOrbitalVelocityAtHeight({ mass, diameterKm, heightKm }) {
  const radiusKm = Number(diameterKm) / 2;
  return TERRA_ESCAPE_VELOCITY_MPS * Math.sqrt(Number(mass) / (2 * ((radiusKm + Number(heightKm)) / TERRA_RADIUS_KM)));
}

export function buildWbhSizeProfile({ sizeCode, diameterKm, density, gravity, mass }) {
  return `${normalizeSizeCode(sizeCode)}-${Math.round(diameterKm)}-${Number(density).toFixed(2)}-${Number(gravity).toFixed(2)}-${Number(mass).toFixed(2)}`;
}

export function isBeltLikeSizeZeroWorld(world = {}) {
  return (
    Number(world?.size) === 0 &&
    String(world?.worldType || "")
      .toLowerCase()
      .includes("belt")
  );
}

export function generateWorldPhysicalCharacteristicsWbh(params = {}) {
  const rollDie = typeof params.rollDie === "function" ? params.rollDie : createRandomRoller();
  const fallbackWorld =
    params.baseWorld && typeof params.baseWorld === "object"
      ? { ...params.baseWorld }
      : { ...(params && typeof params === "object" ? params : {}) };
  const resolvedWorldName = String(params.worldName || fallbackWorld.name || "World").trim() || "World";
  const sizeCode = normalizeSizeCode(params.sizeCode ?? params.size ?? fallbackWorld.size ?? "5");
  let diameterKm = 0;
  let composition = fallbackWorld.composition ?? null;
  let density = Number(fallbackWorld.density ?? 0);
  let gravity = Number(fallbackWorld.gravity ?? 0);
  let mass = Number(fallbackWorld.mass ?? 0);
  let escapeVelocityMps = Number(fallbackWorld.escapeVelocityMps ?? 0);
  let surfaceOrbitalVelocityMps = Number(fallbackWorld.surfaceOrbitalVelocityMps ?? 0);
  let sizeProfile = fallbackWorld.sizeProfile ?? null;
  let resolvedSize = params.size ?? sizeCode;
  let gasGiantProfile = null;

  if (params.isGasGiant) {
    gasGiantProfile = determineGasGiantProfile({
      starClass: params.starClass,
      systemSpread: params.systemSpread,
      rollDie,
    });
    resolvedSize = gasGiantProfile.diameterTerran;
    diameterKm = gasGiantProfile.diameterKm;
    composition = "Hydrogen-helium envelope";
    density = Number.NaN;
    gravity = Number.NaN;
    mass = Number.NaN;
    escapeVelocityMps = Number.NaN;
    surfaceOrbitalVelocityMps = Number.NaN;
    sizeProfile = gasGiantProfile.gasGiantCode;
  } else if (sizeCode !== "0" && sizeCode !== "R") {
    const detailDie = params.detailDie ?? (rollDie(10) - 1) * 10 + (rollDie(10) - 1);
    diameterKm = determineWorldDiameter({ sizeCode, rollDie, detailDie });
    composition = determineTerrestrialComposition({
      sizeCode,
      orbitNumber: params.orbitNumber,
      hzco: params.hzco,
      systemAgeGyr: params.systemAgeGyr,
      rollTotal: params.compositionRoll ?? roll2d(rollDie),
    });
    density = determineTerrestrialDensity({
      composition,
      rollTotal: params.densityRoll ?? roll2d(rollDie),
    });
    gravity = calculateWorldGravity({ density, diameterKm });
    mass = calculateWorldMass({ density, diameterKm });
    escapeVelocityMps = calculateEscapeVelocity({ mass, diameterKm });
    surfaceOrbitalVelocityMps = calculateSurfaceOrbitalVelocity({ escapeVelocityMps });
    sizeProfile = buildWbhSizeProfile({ sizeCode, diameterKm, density, gravity, mass });
  }

  const environment = buildWbhEnvironmentalProfile({
    ...params,
    worldName: resolvedWorldName,
    sizeCode,
    size: resolvedSize,
    density,
    gravity,
    gasGiantProfile,
    generateMoons: params.generateMoons,
    moonProfileFactory: params.moonProfileFactory,
    rollDie,
  });
  const seismology = buildWbhSeismologyProfile({
    size: sizeCodeToNumeric(resolvedSize),
    systemAgeGyr: params.systemAgeGyr,
    isMoon: params.isMoon,
    moonsData: environment.moonsData,
    density,
    totalTidalEffect: params.totalTidalEffect,
    tidalEffects: params.tidalEffects,
    primaryMassEarth: params.primaryMassEarth,
    primaryMassInSolarMasses: params.primaryMassInSolarMasses,
    stellarMasses: params.stellarMasses,
    eccentricity: params.eccentricity,
    distanceMillionKm: params.distanceMillionKm,
    orbitNumber: params.orbitNumber,
    periodDays: params.orbitalPeriodDays ?? environment.orbitalPeriodDays,
    worldMassEarth: mass,
    hydrographics: environment.hydrographics,
    avgTempC: environment.avgTempC,
    tectonicRollTotal: params.tectonicRollTotal,
    rollDie,
  });

  const resolvedClassification = classifyPlanetaryBody({
    ...fallbackWorld,
    ...environment,
    type: params.type ?? fallbackWorld.type,
    worldType: params.worldType ?? fallbackWorld.worldType,
    size: resolvedSize,
    sizeCode,
  });
  const explicitWorldSubtype = fallbackWorld.worldSubtype ?? params.worldSubtype ?? null;
  const explicitWorldClass = fallbackWorld.worldClass ?? params.worldClass ?? null;
  const explicitWorldDescriptor = fallbackWorld.worldDescriptor ?? params.worldDescriptor ?? null;

  const classifiedResult = {
    ...fallbackWorld,
    ...environment,
    ...resolvedClassification,
    ...(explicitWorldClass ? { worldClass: explicitWorldClass } : {}),
    ...(explicitWorldSubtype
      ? {
          worldSubtype: explicitWorldSubtype,
          worldDescriptor:
            explicitWorldDescriptor || `${resolvedClassification.orbitBand} ${explicitWorldSubtype}`.trim(),
        }
      : explicitWorldDescriptor
        ? { worldDescriptor: explicitWorldDescriptor }
        : {}),
    name: resolvedWorldName,
    size: resolvedSize,
    sizeCode,
    diameterKm,
    composition,
    density,
    gravity,
    mass,
    escapeVelocityMps,
    surfaceOrbitalVelocityMps,
    sizeProfile,
    seismology,
    majorTectonicPlates: seismology.majorTectonicPlates,
    surfaceTidalEffectMeters: environment.surfaceTidalEffectMeters,
    tidalLockPressure: environment.tidalLockPressure,
    ...(gasGiantProfile ? { gasGiantProfile, gasGiantCode: gasGiantProfile.gasGiantCode } : {}),
    generatorModel: "wbh-world-physics",
    wbhStatus:
      sizeCode === "0" || sizeCode === "R"
        ? "implemented-environment-size-zero"
        : "implemented-world-environment-and-physics",
    wbhCoverage: WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  };

  // Compute native life profile using the same rollDie used for generation so
  // biomass follows the WBH 2D + DMs rule deterministically when a seeded
  // roller was supplied.
  const nativeLifeform = buildNativeLifeProfile({
    ...classifiedResult,
    rollDie,
  });

  return {
    ...classifiedResult,
    nativeLifeform,
  };
}
