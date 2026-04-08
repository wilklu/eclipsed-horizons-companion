import { generatePhonotacticName } from "./nameGenerator.js";
import { resolveStarDescriptorToken } from "./starDisplay.js";
import { scoreMainworldCandidateWbh, selectMainworldCandidateWbh } from "./wbh/systemGenerationWbh.js";
import {
  buildNativeLifeProfile,
  determineHabitabilityRating,
  determineResourceRating,
  generateWorldPhysicalCharacteristicsWbh,
} from "./wbh/worldPhysicalCharacteristicsWbh.js";

const GOVERNMENT_TABLE = {
  0: "No Government",
  1: "Company/Corporation",
  2: "Participating Democracy",
  3: "Self-Perpetuating Oligarchy",
  4: "Representative Democracy",
  5: "Feudal Technocracy",
  6: "Captive Government",
  7: "Balkanization",
  8: "Civil Service Bureaucracy",
  9: "Impersonal Bureaucracy",
  10: "Charismatic Dictator",
  11: "Non-Charismatic Leader",
  12: "Charismatic Oligarchy",
  13: "Religious Dictatorship",
};

const LAW_TABLE = {
  0: "No Law",
  1: "Body pistols, explosives prohibited",
  2: "Portable energy weapons prohibited",
  3: "Machine guns, automatic rifles prohibited",
  4: "Light assault weapons prohibited",
  5: "Personal concealable weapons prohibited",
  6: "All firearms except shotguns prohibited",
  7: "Shotguns prohibited",
  8: "Long bladed weapons controlled",
  9: "All weapons prohibited",
  10: "Pre-emptive detention allowed",
  11: "Arbitrary indefinite detention allowed",
  12: "Arbitrary verdicts without defendant participation",
  13: "Paramilitary law enforcement, thought crimes prosecuted",
  14: "Police state with arbitrary executions or disappearances",
  15: "Rigid control of daily life, gulag state",
  16: "Thoughts controlled, disproportionate punishments",
  17: "Legalised oppression",
  18: "Routine oppression",
};

const TECH_TABLE = {
  0: "Primitive",
  1: "Primitive",
  2: "Pre-Industrial",
  3: "Pre-Industrial",
  4: "Industrial",
  5: "Industrial",
  6: "Pre-Stellar",
  7: "Pre-Stellar",
  8: "Stellar",
  9: "Stellar",
  10: "High Stellar",
  11: "High Stellar",
  12: "Average Imperial",
  13: "Average Imperial",
  14: "High Imperial",
  15: "Experimental",
};

const STARPORT_TABLE = {
  A: "Excellent — Refined fuel, Shipyard (any)",
  B: "Good — Refined fuel, Shipyard (small craft)",
  C: "Routine — Unrefined fuel, no shipyard",
  D: "Poor — Unrefined fuel, limited repair",
  E: "Frontier — No facilities",
  X: "No starport",
};

export const SOCIAL_WBH_RULES = Object.freeze([
  {
    id: "core-uwp-rolls",
    section: "Chapter 7 > Initial UWP Social Characteristics",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "native-sophont-adjustments",
    section: "Chapter 7 > Government and Law Level / Starport / Tech Level",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "documented-social-house-rules",
    section: "House Rules > Population and Government / Tech Level Variations",
    source: "docs/house-rules/world-building.md",
    status: "partial",
  },
  {
    id: "population-concentration-urbanization",
    section: "Chapter 7 > Population Concentration / Urbanization",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "major-cities",
    section: "Chapter 7 > Number of Major Cities",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "government-traits",
    section: "Chapter 7 > Government Traits > Centralization / Authority",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "government-structure",
    section: "Chapter 7 > Government Traits > Structure / Profile",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "factions",
    section: "Chapter 7 > Factions / Faction Profile",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "secondary-world-governments",
    section: "Chapter 7 > Secondary World Governments / Categorization",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "system-of-justice",
    section: "Chapter 7 > Law Level > Judicial System",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "law-level-profiles",
    section: "Chapter 7 > Law Level > Uniformity / Presumption / Death Penalty / Law Level Profile",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "secondary-world-law-levels",
    section: "Chapter 7 > Secondary World Law Levels",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "criminal-economic-legal-outcomes",
    section: "Chapter 7 > Criminal Conviction / Criminal Penalty / Economic Penalty",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "appeals-private-law-outcomes",
    section: "Chapter 7 > Appeals / Private Law Penalties",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "personal-rights-outcomes",
    section: "Chapter 7 > Law Level Effects: Personal Rights",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "discretionary-enforcement",
    section: "Chapter 7 > Crime Categories / Enforcement",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
]);

const RANDOM_WORLD_STARS = ["O", "B", "A", "F", "G", "G", "G", "K", "K", "M", "M", "M"];
export const WORLD_NAMES = [
  "Arrakis",
  "Hestia",
  "Lycan",
  "Varna",
  "Oxtus",
  "Theron",
  "Velan",
  "Korreth",
  "Solvaris",
  "Durath",
  "Mirela",
  "Ashford",
  "Phaedra",
  "Calyx",
  "Numeria",
];

export const WORLD_PROFILE_FIELDS = [
  "name",
  "uwp",
  "isMainworld",
  "size",
  "diameterKm",
  "gravity",
  "atmosphereCode",
  "atmosphereDesc",
  "atmosphereComposition",
  "atmospherePressureBar",
  "atmospherePressureRangeBar",
  "atmosphereSurvivalGear",
  "oxygenFraction",
  "oxygenPartialPressureBar",
  "atmosphereScaleHeightKm",
  "atmosphereTaints",
  "atmosphereTaintProfile",
  "hydrographics",
  "hydrographicsPercent",
  "hydrosphereLiquid",
  "hydrosphereDescription",
  "surfaceDistribution",
  "surfaceDistributionSummary",
  "dominantSurface",
  "avgTempC",
  "tempCategory",
  "orbitalPeriodDays",
  "dayLengthHours",
  "axialTilt",
  "runawayGreenhouse",
  "greenhouseAtmosphereCode",
  "surfaceTidalEffectMeters",
  "tidalLockPressure",
  "moons",
  "parentWorldName",
  "isMoon",
  "moonOrdinal",
  "habitability",
  "resourceRating",
  "importance",
  "minimumSustainableTechLevel",
  "populationConcentration",
  "urbanization",
  "majorCities",
  "governmentProfile",
  "justiceProfile",
  "lawProfile",
  "appealProfile",
  "privateLawProfile",
  "personalRightsProfile",
  "factionsProfile",
  "secondaryWorldContext",
  "nativeLifeform",
  "economics",
  "remarks",
  "mainworldCandidateScore",
  "majorTectonicPlates",
  "seismology",
  "magnetosphere",
  "nativeSophontLife",
  "civilConflict",
  "techLevelPockets",
  "houseRulesApplied",
  "populationCode",
  "population",
  "governmentCode",
  "governmentDesc",
  "lawLevel",
  "lawDesc",
  "techLevel",
  "techDesc",
  "starport",
  "starportDesc",
  "tradeCodes",
];

function d6(n = 2) {
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    total += 1 + Math.floor(Math.random() * 6);
  }
  return total;
}

function d1(sides = 6) {
  return 1 + Math.floor(Math.random() * sides);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHex(value) {
  return toExtendedHex(value);
}

function buildTradeCodes({ size, atmosphereCode, hydrographics, populationCode, governmentCode, lawLevel, techLevel }) {
  const tradeCodes = [];
  if (
    atmosphereCode >= 4 &&
    atmosphereCode <= 9 &&
    hydrographics >= 4 &&
    hydrographics <= 8 &&
    populationCode >= 5 &&
    populationCode <= 7
  ) {
    tradeCodes.push("Ag");
  }
  if (Number(size) === 0 && atmosphereCode === 0 && hydrographics === 0) tradeCodes.push("As");
  if (populationCode === 0 && governmentCode === 0 && lawLevel === 0) tradeCodes.push("Ba");
  if (atmosphereCode >= 2 && hydrographics === 0) tradeCodes.push("De");
  if (atmosphereCode >= 10 && hydrographics >= 1) tradeCodes.push("Fl");
  if (
    Number(size) >= 6 &&
    (atmosphereCode === 5 || atmosphereCode === 6 || atmosphereCode === 8) &&
    hydrographics >= 5
  ) {
    tradeCodes.push("Ga");
  }
  if (populationCode >= 9) tradeCodes.push("Hi");
  if (techLevel >= 12) tradeCodes.push("Ht");
  if (hydrographics >= 1 && hydrographics <= 5 && atmosphereCode <= 3) tradeCodes.push("Ic");
  if (
    (atmosphereCode <= 2 || atmosphereCode === 4 || atmosphereCode === 7 || atmosphereCode === 9) &&
    populationCode >= 9
  ) {
    tradeCodes.push("In");
  }
  if (populationCode >= 1 && populationCode <= 3) tradeCodes.push("Lo");
  if (techLevel <= 5) tradeCodes.push("Lt");
  if (atmosphereCode <= 3 && hydrographics <= 3 && populationCode >= 6) tradeCodes.push("Na");
  if (populationCode >= 4 && populationCode <= 6) tradeCodes.push("Ni");
  if (atmosphereCode >= 2 && atmosphereCode <= 5 && hydrographics <= 3) tradeCodes.push("Po");
  if (
    (atmosphereCode === 6 || atmosphereCode === 8) &&
    populationCode >= 6 &&
    governmentCode >= 4 &&
    governmentCode <= 9
  ) {
    tradeCodes.push("Ri");
  }
  if (hydrographics >= 10) tradeCodes.push("Wa");
  if (atmosphereCode === 0) tradeCodes.push("Va");
  return tradeCodes;
}

function deriveImportance({ tradeCodes = [], starport = "X", techLevel = 0, populationCode = 0 } = {}) {
  let importance = 0;
  if (["A", "B"].includes(starport)) importance += 1;
  if (Number(techLevel) >= 10) importance += 1;
  if (Number(techLevel) <= 8) importance -= 1;
  if (Number(populationCode) >= 9) importance += 1;
  if (Number(populationCode) <= 6) importance -= 1;
  if (tradeCodes.includes("Ag")) importance += 1;
  if (tradeCodes.includes("In")) importance += 1;
  if (tradeCodes.includes("Ri")) importance += 1;
  return importance;
}

export function deriveCivilConflictProfile({
  populationCode = 0,
  governmentCode = 0,
  lawLevel = 0,
  rollDie = d1,
} = {}) {
  const highLawOpenGovernment = lawLevel >= 8 && [1, 2, 4].includes(Number(governmentCode));
  const lowLawAuthoritarian = lawLevel <= 1 && [10, 11, 12, 13].includes(Number(governmentCode));
  const trigger =
    Number(governmentCode) === 0
      ? "no-government"
      : Number(governmentCode) === 7
        ? "balkanization"
        : highLawOpenGovernment
          ? "high-law-open-government-mismatch"
          : lowLawAuthoritarian
            ? "low-law-authoritarian-mismatch"
            : null;
  const eligible = Number(populationCode) >= 7 && Boolean(trigger);

  if (!eligible) {
    return {
      ruleId: "HR-WB-010",
      eligible: false,
      active: false,
      trigger: null,
      roll: null,
    };
  }

  const roll = clamp(Number(rollDie(6)) || 1, 1, 6);
  return {
    ruleId: "HR-WB-010",
    eligible: true,
    active: roll >= 5,
    trigger,
    roll,
  };
}

export function deriveTechLevelPocketProfile({ techLevel = 0 } = {}) {
  const nominalLevel = clamp(Number(techLevel) || 0, 0, 15);
  const eligible = nominalLevel >= 5;

  if (!eligible) {
    return {
      ruleId: "HR-WB-020",
      eligible: false,
      optional: true,
      nominalLevel,
      lowLevel: nominalLevel,
      highLevel: nominalLevel,
      summary: `TL ${nominalLevel}`,
    };
  }

  const lowLevel = clamp(nominalLevel - 2, 0, 15);
  const highLevel = clamp(nominalLevel + 2, 0, 15);
  return {
    ruleId: "HR-WB-020",
    eligible: true,
    optional: true,
    nominalLevel,
    lowLevel,
    highLevel,
    summary: `TL ${lowLevel}-${highLevel}`,
  };
}

function buildWorldRemarks(world = {}, overlay = {}) {
  const remarks = [];
  if (world?.isMoon) remarks.push("Moon");
  if (world?.parentWorldName) remarks.push(`Orbits ${world.parentWorldName}`);
  if (overlay?.habitability === "Excellent") remarks.push("Prime Candidate");
  if (overlay?.habitability === "Hostile") remarks.push("Hostile Environment");
  if (overlay?.resourceRating === "Abundant") remarks.push("Resource Rich");
  if (world?.nativeSophontLife) remarks.push("Native Life");
  if (overlay?.isMainworld) remarks.push("Mainworld");
  if (overlay?.populationConcentration?.eligible) {
    remarks.push(`PCR ${overlay.populationConcentration.rating} ${overlay.populationConcentration.label}`);
  }
  if (overlay?.urbanization?.eligible) {
    remarks.push(`Urban ${overlay.urbanization.percent}%`);
  }
  if (overlay?.majorCities?.eligible && overlay.majorCities.count > 0) {
    remarks.push(`Major Cities ${overlay.majorCities.count}`);
  }
  if (overlay?.governmentProfile?.eligible) {
    remarks.push(`Government ${overlay.governmentProfile.profileCode || overlay.governmentProfile.summary}`);
  }
  if (overlay?.justiceProfile?.eligible) {
    remarks.push(`Justice ${overlay.justiceProfile.code}`);
  }
  if (overlay?.lawProfile?.eligible) {
    remarks.push(`Law ${overlay.lawProfile.lawLevelProfileCode}`);
  }
  if (overlay?.personalRightsProfile?.eligible) {
    remarks.push(`Rights ${toExtendedHex(overlay.personalRightsProfile.personalRightsLevel)}`);
  }
  if (overlay?.factionsProfile?.eligible && overlay.factionsProfile.significantFactionCount > 0) {
    remarks.push(`Factions ${overlay.factionsProfile.significantFactionCount}`);
  }
  if (overlay?.secondaryWorldContext?.eligible && overlay.secondaryWorldContext.classificationCodes?.length) {
    remarks.push(`Secondary ${overlay.secondaryWorldContext.classificationCodes.join("/")}`);
  }
  if (overlay?.civilConflict?.active) remarks.push("Civil Conflict");
  else if (overlay?.civilConflict?.eligible) remarks.push("Conflict Risk");
  if (overlay?.techLevelPockets?.eligible) remarks.push(`TL Pockets ${overlay.techLevelPockets.summary}`);
  return remarks;
}

function normalizeMoonWorldType(type) {
  return String(type || "")
    .toLowerCase()
    .includes("gas")
    ? "Gas Giant Moon"
    : "Significant Moon";
}

function flattenWorldWithMoons(world = {}) {
  const entries = [{ ...world, isMoon: Boolean(world?.isMoon) }];
  const moons = Array.isArray(world?.moonsData) ? world.moonsData : [];

  moons.forEach((moon, index) => {
    if (!moon || moon.type !== "significant" || moon.ring) {
      return;
    }

    const profile = moon.worldProfile && typeof moon.worldProfile === "object" ? moon.worldProfile : {};
    entries.push({
      ...profile,
      name: String(moon.name || `${world?.name || "World"} ${index + 1}`),
      type: normalizeMoonWorldType(world?.type),
      worldType: normalizeMoonWorldType(world?.type),
      composition: profile.composition ?? world?.composition ?? null,
      orbitNumber: world?.orbitNumber,
      orbitAU: world?.orbitAU,
      orbitalPeriodDays: world?.orbitalPeriodDays,
      zone: world?.zone,
      hzco: world?.hzco,
      orbitGroup: world?.orbitGroup,
      isAnomalousOrbit: Boolean(world?.isAnomalousOrbit),
      parentWorldName: world?.name,
      parentWorldType: world?.type,
      parentWorldSize: world?.size,
      moonOrdinal: moon.orbitalSlot,
      isMoon: true,
      moonsData: Array.isArray(profile?.moonsData) ? profile.moonsData : [],
    });
  });

  return entries;
}

function computePopulationValue(populationCode) {
  if (!(populationCode > 0)) {
    return 0;
  }

  return 10 ** populationCode;
}

const POPULATION_CONCENTRATION_LABELS = Object.freeze({
  0: "Extremely Dispersed",
  1: "Highly Dispersed",
  2: "Moderately Dispersed",
  3: "Partially Dispersed",
  4: "Slightly Dispersed",
  5: "Slightly Concentrated",
  6: "Partially Concentrated",
  7: "Moderately Concentrated",
  8: "Highly Concentrated",
  9: "Extremely Concentrated",
});

const GOVERNMENT_CENTRALIZATION_TABLE = Object.freeze({
  C: { code: "C", label: "Confederal", summary: "Sub-states are more powerful than the central government" },
  F: { code: "F", label: "Federal", summary: "Powers are shared between the central government and sub-states" },
  U: { code: "U", label: "Unitary", summary: "The central government is dominant" },
});

const GOVERNMENT_AUTHORITY_TABLE = Object.freeze({
  L: { code: "L", label: "Legislative", summary: "Law-making institutions dominate the government" },
  E: { code: "E", label: "Executive", summary: "Executive power dominates the government" },
  J: { code: "J", label: "Judicial", summary: "Judicial authorities dominate the government" },
  B: { code: "B", label: "Balance", summary: "Power is balanced between government branches" },
});

const GOVERNMENT_BRANCH_LABELS = Object.freeze({
  L: "Legislative",
  E: "Executive",
  J: "Judicial",
});

const GOVERNMENT_STRUCTURE_TABLE = Object.freeze({
  D: { code: "D", label: "Demos", summary: "The broader citizen body directly operates this function" },
  S: { code: "S", label: "Single Council", summary: "A single council controls this function" },
  R: { code: "R", label: "Ruler", summary: "A single ruler dominates this function" },
  M: { code: "M", label: "Multiple Councils", summary: "Multiple councils divide or balance this function" },
});

const FACTION_STRENGTH_TABLE = Object.freeze({
  O: { code: "O", label: "Obscure", summary: "Few people have heard of them" },
  F: { code: "F", label: "Fringe", summary: "A small faction on the edge of relevance" },
  M: { code: "M", label: "Minor", summary: "A minor but visible faction" },
  N: { code: "N", label: "Notable", summary: "A notable faction with clear influence" },
  S: { code: "S", label: "Significant", summary: "Nearly as powerful as the government" },
  P: { code: "P", label: "Popular", summary: "More powerful than the government" },
  G: { code: "G", label: "Government", summary: "The official governing faction" },
});

const FACTION_RELATIONSHIP_TABLE = Object.freeze({
  0: { code: 0, label: "Alliance" },
  1: { code: 1, label: "Cooperation" },
  2: { code: 2, label: "Truce" },
  3: { code: 3, label: "Competition" },
  4: { code: 4, label: "Resistance" },
  5: { code: 5, label: "Riots" },
  6: { code: 6, label: "Uprising" },
  7: { code: 7, label: "Insurgency" },
  8: { code: 8, label: "War" },
  9: { code: 9, label: "Total War" },
});

const JUSTICE_SYSTEM_TABLE = Object.freeze({
  N: { code: "N", label: "None", summary: "Informal or customary justice with no formal system" },
  I: { code: "I", label: "Inquisitorial", summary: "Investigation-led justice dominates proceedings" },
  A: { code: "A", label: "Adversarial", summary: "Opposing advocates contest cases before a judge" },
  T: { code: "T", label: "Traditional", summary: "Justice rests on custom, doctrine, or traditional practice" },
});

const LAW_UNIFORMITY_TABLE = Object.freeze({
  P: { code: "P", label: "Personal", summary: "Law varies by status, caste, profession, or group" },
  T: { code: "T", label: "Territorial", summary: "Local jurisdictions maintain distinct legal variations" },
  U: { code: "U", label: "Universal", summary: "The same law applies broadly across the polity" },
});

const LAW_SUBCATEGORY_TABLE = Object.freeze({
  weapons: { key: "weapons", label: "Weapons", code: "W" },
  economic: { key: "economic", label: "Economic", code: "E" },
  criminal: { key: "criminal", label: "Criminal", code: "C" },
  private: { key: "private", label: "Private", code: "P" },
  personalRights: { key: "personalRights", label: "Personal Rights", code: "R" },
});

const CRIME_SEVERITY_TABLE = Object.freeze({
  insignificant: { key: "insignificant", label: "Insignificant", enforcement: 7, dm: -10 },
  trivial: { key: "trivial", label: "Trivial", enforcement: 5, dm: -8 },
  petty: { key: "petty", label: "Petty", enforcement: 4, dm: -5 },
  minor: { key: "minor", label: "Minor", enforcement: 3, dm: -3 },
  moderate: { key: "moderate", label: "Moderate", enforcement: 2, dm: -2 },
  serious: { key: "serious", label: "Serious", enforcement: 1, dm: -1 },
  grave: { key: "grave", label: "Grave", enforcement: 1, dm: 0 },
  appalling: { key: "appalling", label: "Appalling", enforcement: 0, dm: 2 },
  horrific: { key: "horrific", label: "Horrific", enforcement: 0, dm: 5 },
});

const CRIMINAL_PENALTY_TABLE = Object.freeze([
  { min: Number.NEGATIVE_INFINITY, max: 0, label: "Dismissed or trivial" },
  { min: 1, max: 2, label: "Fine of 1D x Cr1000" },
  { min: 3, max: 4, label: "Fine of 2D x Cr5000" },
  { min: 5, max: 6, label: "Exile or a fine of 1D x Cr10000" },
  { min: 7, max: 8, label: "Imprisonment for 1D months or exile or a fine of 2D x Cr20000" },
  { min: 9, max: 10, label: "Imprisonment for 1D years or exile" },
  { min: 11, max: 12, label: "Imprisonment for 2D years or exile" },
  { min: 13, max: 14, label: "Life imprisonment" },
  { min: 15, max: Number.POSITIVE_INFINITY, label: "Death" },
]);

const ECONOMIC_PENALTY_TABLE = Object.freeze([
  { min: Number.NEGATIVE_INFINITY, max: 0, label: "Dismissed or trivial" },
  { min: 1, max: 2, label: "Fine of 1D x Cr1000" },
  { min: 3, max: 4, label: "Fine of 2D x Cr5000" },
  { min: 5, max: 6, label: "Fine of 1D x Cr10000" },
  { min: 7, max: 8, label: "Fine of 2D x Cr20000" },
  { min: 9, max: 10, label: "Imprisonment for 1D months or exile and a fine of 2D x Cr50000" },
  { min: 11, max: 12, label: "Imprisonment for 1D years or exile and a fine of 2D x Cr100000" },
  { min: 13, max: 14, label: "Imprisonment for 2D years or exile and a fine of 2D x Cr500000" },
  { min: 15, max: Number.POSITIVE_INFINITY, label: "Imprisonment for 4D years or exile and a fine of 2D x MCr1" },
]);

const PRIVATE_LAW_LEVEL_TABLE = Object.freeze({
  0: "No formal legal system",
  1: "Duelling restricted, contract law enforceable",
  2: "Duelling prohibited",
  3: "Private settlement of moderate crimes prohibited",
  4: "Private settlement of all crimes prohibited",
  5: "Public filing of all disputes and settlements",
  6: "Government venue required for all settlements",
  7: "Limits on all tort settlements",
  8: "Government review of all settlements",
  9: "Government approval for all settlements",
  10: "Government-adjudicated arbitration required",
  11: "Arbitrary government adjudication and approval of all contracts",
  12: "All civil proceedings transferred to criminal justice system",
  13: "Private disputes are overwhelmed by the punitive state",
  14: "Private disputes are absorbed into police-state procedures",
  15: "Private disputes are subsumed by rigid state control",
  16: "Private disputes are subordinate to disproportional punishments",
  17: "Private disputes operate under legalized oppression",
  18: "Private disputes operate under routine oppression",
});

const PERSONAL_RIGHTS_LEVEL_TABLE = Object.freeze({
  0: "No restrictions",
  1: "Speech risking physical harm is prohibited",
  2: "Identity registration and libel prohibitions apply",
  3: "Group-related regulations apply",
  4: "Hate speech is prohibited",
  5: "Identification papers are mandatory",
  6: "Public surveillance is normal",
  7: "Offensive speech is prohibited",
  8: "No right to protect personal data",
  9: "Subversive speech is prohibited",
  10: "Movement and residency restrictions apply",
  11: "Warrantless searches and routine private surveillance apply",
  12: "Unrestricted private surveillance and group punishments apply",
  13: "Thought crimes are prosecuted",
  14: "Police-state personal-rights restrictions apply",
  15: "Daily life is under rigid control",
  16: "Thoughts are controlled and punishments are disproportionate",
  17: "Personal rights exist under legalized oppression",
  18: "Personal rights exist under routine oppression",
});

const SECONDARY_WORLD_CLASSIFICATIONS = Object.freeze({
  Cy: { code: "Cy", label: "Colony" },
  Fa: { code: "Fa", label: "Farming" },
  Fp: { code: "Fp", label: "Freeport" },
  Mb: { code: "Mb", label: "Military Base" },
  Mi: { code: "Mi", label: "Mining Facility" },
  Pe: { code: "Pe", label: "Penal Colony" },
  Rb: { code: "Rb", label: "Research Base" },
});

function hasTradeCode(tradeCodes, code) {
  return Array.isArray(tradeCodes) && tradeCodes.includes(code);
}

function summarizeGovernmentContext(governmentCode) {
  return Number(governmentCode) === 7 ? "Nearest sovereign government or faction" : "World government";
}

function resolveGovernmentCodeToken(governmentCode) {
  const numericGovernmentCode = Number(governmentCode);
  return Number.isFinite(numericGovernmentCode) ? toHex(Math.max(0, numericGovernmentCode)) : "0";
}

function toRomanNumeral(value) {
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
  let remaining = Math.max(1, Math.trunc(Number(value) || 1));
  let output = "";
  numerals.forEach(([amount, token]) => {
    while (remaining >= amount) {
      output += token;
      remaining -= amount;
    }
  });
  return output || "I";
}

function rollGovernmentCodeForPopulation(populationCode = 0, rollTwoDice = () => d6()) {
  if (!(populationCode > 0)) {
    return 0;
  }
  return clamp(Number(rollTwoDice()) - 7 + Number(populationCode), 0, 13);
}

function resolveFactionStrengthCode(total) {
  if (total <= 3) return "O";
  if (total <= 5) return "F";
  if (total <= 7) return "M";
  if (total <= 9) return "N";
  if (total <= 11) return "S";
  return "P";
}

function resolveJusticeSystemCode(total) {
  if (total <= 5) return "I";
  if (total <= 8) return "A";
  return "T";
}

function toExtendedHex(value) {
  const total = clamp(Math.trunc(Number(value) || 0), 0, 18);
  if (total < 10) {
    return String(total);
  }
  const extendedDigits = ["A", "B", "C", "D", "E", "F", "G", "H", "J"];
  return extendedDigits[total - 10] || "J";
}

function rollTwoD3MinusFour(rollDie = d1) {
  return Number(rollDie(3)) + Number(rollDie(3)) - 4;
}

function resolveLawUniformityCode(total) {
  if (total <= 2) return "P";
  if (total === 3) return "T";
  return "U";
}

function clampLawSubcategoryLevel(value) {
  return clamp(Math.trunc(Number(value) || 0), 0, 18);
}

function deriveLawSubcategoryLevel({ lawLevel = 0, dm = 0, rollDie = d1 } = {}) {
  return clampLawSubcategoryLevel(Number(lawLevel) + rollTwoD3MinusFour(rollDie) + Number(dm || 0));
}

function clampWorldLawLevel(value) {
  return clamp(Math.trunc(Number(value) || 0), 0, 18);
}

function rollWorldLawLevel({ governmentCode = 0, dm = 0, rollTwoDice = () => d6() } = {}) {
  return clampWorldLawLevel(Number(rollTwoDice()) - 7 + Number(governmentCode) + Number(dm || 0));
}

function buildJudicialProfileCode({
  primaryCode = "N",
  secondaryCode = "N",
  uniformityCode = "U",
  presumptionOfInnocence = false,
  deathPenalty = false,
} = {}) {
  return `${primaryCode}${secondaryCode}${uniformityCode}-${presumptionOfInnocence ? "Y" : "N"}-${deathPenalty ? "Y" : "N"}`;
}

function buildLawLevelProfileCode({ lawLevel = 0, subcategories = {} } = {}) {
  return `${toExtendedHex(lawLevel)}-${[
    subcategories?.weapons?.code || "0",
    subcategories?.economic?.code || "0",
    subcategories?.criminal?.code || "0",
    subcategories?.private?.code || "0",
    subcategories?.personalRights?.code || "0",
  ].join("")}`;
}

function summarizeLawProfile({ judicialProfileCode = "", lawLevelProfileCode = "", uniformity = null } = {}) {
  const uniformityLabel = String(uniformity?.label || "").trim();
  return [judicialProfileCode, lawLevelProfileCode, uniformityLabel ? `${uniformityLabel} law` : ""]
    .filter(Boolean)
    .join(" / ");
}

function normalizeCrimeSeverityKey(value = "moderate") {
  const key = String(value || "moderate")
    .trim()
    .toLowerCase();
  return CRIME_SEVERITY_TABLE[key] ? key : "moderate";
}

function normalizeOffenseType(value = "criminal") {
  const normalized = String(value || "criminal")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");

  if (normalized === "economic") return "economic";
  if (normalized === "private") return "private";
  if (normalized === "personalrights") return "personalRights";
  return "criminal";
}

function resolvePenaltyBand(total, table) {
  return table.find((entry) => total >= entry.min && total <= entry.max) || table[0];
}

function resolveApplicableLawLevel({ offenseType = "criminal", lawProfile = null } = {}) {
  const categoryKey = normalizeOffenseType(offenseType);
  return Number(lawProfile?.subcategories?.[categoryKey]?.value ?? lawProfile?.overallLevel?.value ?? 0);
}

function summarizeSecondaryWorldLawSource(caseLabel) {
  return (
    {
      default: "Law level rolled normally for the secondary world.",
      "captive-reroll": "Law level rerolled as a captive Government 6 world.",
      "captive-same-as-mainworld": "Law level inherited directly from the owning mainworld.",
      "captive-mainworld-plus-one": "Law level set one step stricter than the owning mainworld.",
      "captive-mainworld-plus-die": "Law level set above the owning mainworld by an additional die roll.",
      "dependent-inherits-mainworld": "Law level inherited from the supervising mainworld authority.",
      "dependent-local-low-law": "Law level kept as a local low-government exception under mainworld authority.",
      "dependent-reroll": "Law level rerolled locally despite mainworld authority.",
      "independent-default": "Law level rerolled normally for an independent secondary world.",
      "independent-freeport": "Law level rerolled with freeport leniency.",
    }[String(caseLabel || "default")] || "Law level resolved from secondary-world authority rules."
  );
}

function summarizeAppealRights({ criminalLawLevel = 0, justiceCode = "N" } = {}) {
  if (!(criminalLawLevel > 0) || justiceCode === "N") {
    return "No formal appeal process";
  }
  if (justiceCode === "I" && criminalLawLevel >= 7) {
    return "Defendants may appeal convictions; prosecution may appeal acquittals";
  }
  return "Defendants may appeal convictions";
}

function summarizePrivateLawEnvironment(privateLawLevel = 0) {
  return PRIVATE_LAW_LEVEL_TABLE[clampWorldLawLevel(privateLawLevel)] || "Private-law environment unknown";
}

function summarizePersonalRightsEnvironment(personalRightsLevel = 0) {
  return PERSONAL_RIGHTS_LEVEL_TABLE[clampWorldLawLevel(personalRightsLevel)] || "Personal-rights environment unknown";
}

function summarizeDiscretionaryEnforcement({
  automaticallyPursued = false,
  warningPossible = false,
  warningGranted = null,
  skillLabel = "Advocate or Persuade",
} = {}) {
  if (automaticallyPursued) {
    return "Punishment is always pursued at this law level";
  }
  if (!warningPossible) {
    return "Enforcement posture unknown";
  }
  if (warningGranted === true) {
    return `Escapes with a warning on a successful ${skillLabel} check`;
  }
  if (warningGranted === false) {
    return `Warning attempt fails; prosecution proceeds despite ${skillLabel} intervention`;
  }
  return `May escape with a warning on a successful ${skillLabel} check`;
}

function resolveSecondaryGovernmentCode(total) {
  if (total <= 1) return 0;
  if (total === 2) return 1;
  if (total === 3) return 2;
  if (total === 4) return 3;
  return 6;
}

function hasHabitableZoneClassification(world = {}) {
  const zoneToken = String(world?.zone || "")
    .trim()
    .toLowerCase();
  if (zoneToken.includes("habitable")) {
    return true;
  }
  const orbitAU = Number(world?.orbitAU ?? world?.orbitAu ?? NaN);
  const hzco = Number(world?.hzco ?? NaN);
  if (Number.isFinite(orbitAU) && Number.isFinite(hzco) && hzco > 0) {
    return orbitAU >= hzco * 0.75 && orbitAU <= hzco * 1.5;
  }
  return false;
}

function resolveFunctionalStructureCode(total) {
  if (total <= 3) return "D";
  if (total === 4) return "S";
  if (total === 5 || total === 6) return "M";
  if (total === 7 || total === 8) return "R";
  if (total === 9) return "M";
  if (total === 10) return "S";
  if (total === 11) return "M";
  return "S";
}

function createGovernmentStructureProfile(code, details = {}) {
  return {
    ...GOVERNMENT_STRUCTURE_TABLE[code],
    ...details,
  };
}

function resolveGovernmentStructureProfile({
  governmentCode = 0,
  branchCode = "L",
  authorityCode = "L",
  isAuthoritative = false,
  rollTwoDice = () => d6(),
  rollDie = () => d6(1),
} = {}) {
  const numericGovernmentCode = Number(governmentCode);

  if ([8, 9].includes(numericGovernmentCode)) {
    return createGovernmentStructureProfile("M", {
      branchCode,
      branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
      authoritative: isAuthoritative,
      source: "government-fixed",
      total: null,
      dm: 0,
    });
  }

  if (numericGovernmentCode === 2 && (isAuthoritative || (authorityCode === "B" && branchCode === "L"))) {
    return createGovernmentStructureProfile("D", {
      branchCode,
      branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
      authoritative: isAuthoritative,
      source: "government-fixed",
      total: null,
      dm: 0,
    });
  }

  if ([3, 12, 15].includes(numericGovernmentCode)) {
    const total = Number(rollDie());
    return createGovernmentStructureProfile(total <= 4 ? "S" : "M", {
      branchCode,
      branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
      authoritative: isAuthoritative,
      source: "government-fixed",
      total,
      dm: 0,
    });
  }

  if ([10, 11, 13, 14].includes(numericGovernmentCode) && isAuthoritative) {
    const total = Number(rollDie());
    return createGovernmentStructureProfile(total <= 5 ? "R" : "S", {
      branchCode,
      branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
      authoritative: true,
      source: "authoritative-special",
      total,
      dm: 0,
    });
  }

  if (authorityCode === "L" && isAuthoritative) {
    const total = Number(rollTwoDice());
    const code = total <= 3 ? "D" : total <= 8 ? "M" : "S";
    return createGovernmentStructureProfile(code, {
      branchCode,
      branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
      authoritative: true,
      source: "legislative-special",
      total,
      dm: 0,
    });
  }

  const dm = [10, 11, 13, 14].includes(numericGovernmentCode) && !isAuthoritative ? 2 : 0;
  const total = Number(rollTwoDice()) + dm;
  return createGovernmentStructureProfile(resolveFunctionalStructureCode(total), {
    branchCode,
    branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode] || branchCode,
    authoritative: isAuthoritative,
    source: "functional-table",
    total,
    dm,
  });
}

function summarizeGovernmentStructures({ authorityCode = "L", structures = {} } = {}) {
  const branchOrder = authorityCode === "B" ? ["L", "E", "J"] : [authorityCode, "L", "E", "J"];
  const seen = new Set();
  return branchOrder
    .filter((branchCode) => !seen.has(branchCode) && seen.add(branchCode))
    .map((branchCode) => {
      const structure = structures?.[branchCode];
      if (!structure) {
        return null;
      }
      return `${GOVERNMENT_BRANCH_LABELS[branchCode]} ${structure.label}`;
    })
    .filter(Boolean)
    .join(", ");
}

function buildGovernmentProfileCode({
  governmentCode = 0,
  centralizationCode = "C",
  authorityCode = "L",
  structures = {},
} = {}) {
  const governmentToken = resolveGovernmentCodeToken(governmentCode);

  if (authorityCode === "B") {
    return `${governmentToken}-${centralizationCode}BB-L${structures?.L?.code || "?"}-E${structures?.E?.code || "?"}-J${structures?.J?.code || "?"}`;
  }

  const authoritativeStructureCode = structures?.[authorityCode]?.code || "?";
  const secondarySegments = ["L", "E", "J"]
    .filter((branchCode) => branchCode !== authorityCode && structures?.[branchCode]?.code)
    .map((branchCode) => `${branchCode}${structures[branchCode].code}`);

  return [
    `${governmentToken}-${centralizationCode}${authorityCode}${authoritativeStructureCode}`,
    ...secondarySegments,
  ].join("-");
}

function buildFactionProfileCode({ index = 1, governmentCode = 0, strengthCode = "G" } = {}) {
  return `${toRomanNumeral(index)}-${resolveGovernmentCodeToken(governmentCode)}-${strengthCode}`;
}

export function deriveFactionsProfile({
  governmentCode = 0,
  populationCode = 0,
  rollFactionCount = d1,
  rollGovernment = () => d6(),
  rollStrength = () => d6(),
  rollRelationship = d1,
} = {}) {
  const numericGovernmentCode = Number(governmentCode);

  if (!(populationCode > 0)) {
    return {
      eligible: false,
      factionCount: 0,
      significantFactionCount: 0,
      profiles: [],
      relationships: [],
      summary: "No meaningful factions",
    };
  }

  let factionDm = 0;
  if ([0, 7].includes(numericGovernmentCode)) factionDm += 1;
  if (numericGovernmentCode >= 10) factionDm -= 1;
  const totalFactions = Math.max(1, Number(rollFactionCount(3)) + factionDm);

  const rulingFaction = {
    index: 1,
    roman: "I",
    governmentCode: numericGovernmentCode,
    strength: FACTION_STRENGTH_TABLE.G,
    profileCode: buildFactionProfileCode({ index: 1, governmentCode: numericGovernmentCode, strengthCode: "G" }),
    role: "government",
  };

  const profiles = [rulingFaction];
  const relationships = [];
  for (let index = 2; index <= totalFactions; index += 1) {
    const factionGovernmentCode = rollGovernmentCodeForPopulation(populationCode, rollGovernment);
    const strengthTotal = Number(rollStrength());
    const strengthCode = resolveFactionStrengthCode(strengthTotal);
    const relationshipDm = factionGovernmentCode === numericGovernmentCode ? -1 : 1;
    const relationshipTotal = clamp(Number(rollRelationship(6)) + relationshipDm, 0, 9);
    const faction = {
      index,
      roman: toRomanNumeral(index),
      governmentCode: factionGovernmentCode,
      strength: {
        ...FACTION_STRENGTH_TABLE[strengthCode],
        total: strengthTotal,
      },
      profileCode: buildFactionProfileCode({ index, governmentCode: factionGovernmentCode, strengthCode }),
      role: factionGovernmentCode === numericGovernmentCode ? "splinter" : "external",
    };
    profiles.push(faction);
    relationships.push({
      from: rulingFaction.roman,
      to: faction.roman,
      relationship: FACTION_RELATIONSHIP_TABLE[relationshipTotal],
      profileCode: `${rulingFaction.roman}+${faction.roman}=${relationshipTotal}`,
    });
  }

  const significantFactionCount = Math.max(0, totalFactions - 1);
  return {
    eligible: true,
    factionCount: totalFactions,
    significantFactionCount,
    profiles,
    relationships,
    summary:
      significantFactionCount > 0
        ? `${significantFactionCount} significant ${significantFactionCount === 1 ? "faction" : "factions"}`
        : "No significant factions",
  };
}

export function deriveJusticeProfile({
  governmentCode = 0,
  lawLevel = 0,
  techLevel = 0,
  governmentProfile = null,
  rollJustice = () => d6(),
} = {}) {
  const numericGovernmentCode = Number(governmentCode);
  const numericLawLevel = Number(lawLevel);
  const numericTechLevel = Number(techLevel);

  if (numericGovernmentCode === 0) {
    return {
      eligible: false,
      ...JUSTICE_SYSTEM_TABLE.N,
      summary: JUSTICE_SYSTEM_TABLE.N.summary,
      dm: 0,
      total: null,
    };
  }

  let dm = 0;
  if (numericGovernmentCode === 1) dm -= 2;
  if (numericGovernmentCode === 8 && ["C", "F"].includes(governmentProfile?.centralization?.code)) dm -= 2;
  if ([13, 14].includes(numericGovernmentCode)) dm += 4;
  else if (numericLawLevel >= 10) dm -= 4;
  if (numericTechLevel === 0) dm += 4;
  else if (numericTechLevel <= 2) dm += 2;
  if (governmentProfile?.authority?.code === "J") dm -= 2;

  const total = Number(rollJustice()) + dm;
  const code = resolveJusticeSystemCode(total);
  return {
    eligible: true,
    ...JUSTICE_SYSTEM_TABLE[code],
    total,
    dm,
    summary: JUSTICE_SYSTEM_TABLE[code].label,
  };
}

export function deriveLawProfile({
  governmentCode = 0,
  lawLevel = 0,
  populationCode = 0,
  techLevel = 0,
  governmentProfile = null,
  justiceProfile = null,
  populationConcentration = null,
  rollUniformity = d1,
  rollSecondaryJustice = () => d6(),
  rollPresumption = () => d6(),
  rollDeathPenalty = () => d6(),
  rollWeaponsLevel = d1,
  rollEconomicLevel = d1,
  rollCriminalLevel = d1,
  rollPrivateLevel = d1,
  rollPersonalRightsLevel = d1,
} = {}) {
  const numericGovernmentCode = Number(governmentCode);
  const numericLawLevel = clampLawSubcategoryLevel(lawLevel);
  const pcr = Number(populationConcentration?.rating ?? -1);
  const primaryJustice = justiceProfile?.eligible
    ? justiceProfile
    : deriveJusticeProfile({
        governmentCode,
        lawLevel,
        techLevel,
        governmentProfile,
      });

  if (!(populationCode > 0) || numericGovernmentCode === 0) {
    const uniformity = LAW_UNIFORMITY_TABLE.U;
    return {
      eligible: false,
      overallLevel: { value: numericLawLevel, code: toExtendedHex(numericLawLevel) },
      primarySystem: JUSTICE_SYSTEM_TABLE.N,
      secondarySystem: JUSTICE_SYSTEM_TABLE.N,
      uniformity,
      presumptionOfInnocence: false,
      deathPenalty: false,
      judicialProfileCode: buildJudicialProfileCode({
        primaryCode: "N",
        secondaryCode: "N",
        uniformityCode: uniformity.code,
      }),
      subcategories: null,
      lawLevelProfileCode: `${toExtendedHex(numericLawLevel)}-00000`,
      summary: "No formal law profile",
    };
  }

  let uniformityCode = "U";
  let uniformityDm = 0;
  const centralizationCode = governmentProfile?.centralization?.code;
  if (centralizationCode === "C") {
    uniformityCode = "T";
  } else if (centralizationCode === "F") {
    uniformityCode = Number(rollUniformity(6)) <= 5 ? "T" : "P";
  } else {
    if ([3, 5].includes(numericGovernmentCode) || numericGovernmentCode >= 10) uniformityDm -= 1;
    if (numericGovernmentCode === 2) uniformityDm += 1;
    uniformityCode = resolveLawUniformityCode(Number(rollUniformity(6)) + uniformityDm);
  }
  const uniformity = {
    ...LAW_UNIFORMITY_TABLE[uniformityCode],
    dm: uniformityDm,
  };

  let secondarySystem = primaryJustice;
  if (["A", "T"].includes(primaryJustice?.code)) {
    const secondaryTotal = Number(rollSecondaryJustice()) + numericLawLevel;
    if (secondaryTotal >= 12) {
      secondarySystem = {
        ...JUSTICE_SYSTEM_TABLE.I,
        total: secondaryTotal,
        dm: numericLawLevel,
        summary: JUSTICE_SYSTEM_TABLE.I.label,
      };
    }
  }

  const presumptionRoll = Number(rollPresumption()) - numericLawLevel + (primaryJustice?.code === "A" ? 2 : 0);
  const presumptionOfInnocence = presumptionRoll >= 0;

  const deathPenaltyRoll =
    Number(rollDeathPenalty()) + (numericGovernmentCode === 0 ? -4 : 0) + (numericLawLevel >= 9 ? 4 : 0);
  const deathPenalty = deathPenaltyRoll >= 8;

  const subcategories = {
    weapons: {
      ...LAW_SUBCATEGORY_TABLE.weapons,
      value: deriveLawSubcategoryLevel({
        lawLevel: numericLawLevel,
        dm: pcr >= 0 && pcr <= 3 ? -1 : pcr >= 8 ? 1 : 0,
        rollDie: rollWeaponsLevel,
      }),
    },
    economic: {
      ...LAW_SUBCATEGORY_TABLE.economic,
      value: deriveLawSubcategoryLevel({
        lawLevel: numericLawLevel,
        dm:
          (numericGovernmentCode === 0 ? -2 : 0) +
          (numericGovernmentCode === 1 ? 2 : 0) +
          (numericGovernmentCode === 2 ? -1 : 0) +
          (numericGovernmentCode === 9 ? 1 : 0),
        rollDie: rollEconomicLevel,
      }),
    },
    criminal: {
      ...LAW_SUBCATEGORY_TABLE.criminal,
      value: deriveLawSubcategoryLevel({
        lawLevel: numericLawLevel,
        dm: primaryJustice?.code === "I" ? 1 : 0,
        rollDie: rollCriminalLevel,
      }),
    },
    private: {
      ...LAW_SUBCATEGORY_TABLE.private,
      value: deriveLawSubcategoryLevel({
        lawLevel: numericLawLevel,
        dm: [3, 5, 12].includes(numericGovernmentCode) ? -1 : 0,
        rollDie: rollPrivateLevel,
      }),
    },
    personalRights: {
      ...LAW_SUBCATEGORY_TABLE.personalRights,
      value: deriveLawSubcategoryLevel({
        lawLevel: numericLawLevel,
        dm: ([0, 2].includes(numericGovernmentCode) ? -1 : 0) + (numericGovernmentCode === 1 ? 2 : 0),
        rollDie: rollPersonalRightsLevel,
      }),
    },
  };

  Object.values(subcategories).forEach((subcategory) => {
    subcategory.code = toExtendedHex(subcategory.value);
    subcategory.summary = `${subcategory.label} ${subcategory.code}`;
  });

  const judicialProfileCode = buildJudicialProfileCode({
    primaryCode: primaryJustice?.code || "N",
    secondaryCode: secondarySystem?.code || primaryJustice?.code || "N",
    uniformityCode,
    presumptionOfInnocence,
    deathPenalty,
  });
  const lawLevelProfileCode = buildLawLevelProfileCode({ lawLevel: numericLawLevel, subcategories });

  return {
    eligible: true,
    overallLevel: { value: numericLawLevel, code: toExtendedHex(numericLawLevel) },
    primarySystem: primaryJustice,
    secondarySystem,
    uniformity,
    presumptionOfInnocence,
    deathPenalty,
    judicialProfileCode,
    subcategories,
    lawLevelProfileCode,
    summary: summarizeLawProfile({ judicialProfileCode, lawLevelProfileCode, uniformity }),
  };
}

export function deriveSecondaryWorldContext({
  world = {},
  populationCode = 0,
  governmentCode = 0,
  lawLevel = 0,
  techLevel = 0,
  mainworldOverlay = null,
  rollDependencyGovernment = d1,
  rollClassification = () => d6(),
  useProvidedGovernmentCode = false,
} = {}) {
  if (!(populationCode > 0) || !mainworldOverlay || world?.isMainworld) {
    return {
      eligible: false,
      dependent: false,
      classificationCodes: [],
      classifications: [],
      summary: "",
    };
  }

  const mainworldGovernmentCode = Number(mainworldOverlay?.governmentCode ?? 0);
  const dependent = mainworldGovernmentCode !== 7 && Boolean(mainworldOverlay);
  let derivedGovernmentCode = Number(governmentCode);
  const governmentSource = dependent ? "dependency" : "independent";

  if (dependent && !useProvidedGovernmentCode) {
    let dm = 0;
    if (mainworldGovernmentCode === 0) dm -= 2;
    if (mainworldGovernmentCode === 6) dm += Number(mainworldOverlay?.populationCode ?? 0);
    derivedGovernmentCode = resolveSecondaryGovernmentCode(Number(rollDependencyGovernment(6)) + dm);
  }

  const classifications = [];
  const addClassification = (code, summary) => {
    classifications.push({
      ...SECONDARY_WORLD_CLASSIFICATIONS[code],
      summary,
    });
  };

  if (populationCode >= 5 && derivedGovernmentCode === 6) {
    addClassification("Cy", "Dependency or captive colony");
  }
  if (
    hasHabitableZoneClassification(world) &&
    Number(world?.atmosphereCode ?? 0) >= 4 &&
    Number(world?.atmosphereCode ?? 0) <= 9 &&
    Number(world?.hydrographics ?? 0) >= 4 &&
    Number(world?.hydrographics ?? 0) <= 8 &&
    populationCode >= 2
  ) {
    addClassification("Fa", "Agricultural secondary world in the habitable zone");
  }
  if (derivedGovernmentCode >= 0 && derivedGovernmentCode <= 5 && techLevel >= 8) {
    const freeportTotal = Number(rollClassification()) - (["A", "B"].includes(mainworldOverlay?.starport) ? 2 : 0);
    if (freeportTotal >= 10) {
      addClassification("Fp", "Open port or trading enclave");
    }
  }
  if (
    Number(mainworldOverlay?.techLevel ?? 0) >= 8 &&
    ["A", "B", "C"].includes(mainworldOverlay?.starport) &&
    (derivedGovernmentCode === 6 || Number(rollClassification()) + (derivedGovernmentCode === 6 ? 2 : 0) >= 12)
  ) {
    addClassification("Mb", "Secondary-world military installation");
  }
  if (hasTradeCode(mainworldOverlay?.tradeCodes, "In") && populationCode >= 2) {
    const threshold = String(world?.type || "") === "Planetoid Belt" ? 6 : 10;
    if (Number(rollClassification()) >= threshold) {
      addClassification("Mi", "Extraction or heavy industrial support site");
    }
  }
  if (
    Number(mainworldOverlay?.techLevel ?? 0) >= 9 &&
    Number(mainworldOverlay?.lawLevel ?? 0) >= 8 &&
    derivedGovernmentCode === 6 &&
    Number(rollClassification()) + (lawLevel >= 8 ? 2 : 0) >= 10
  ) {
    addClassification("Pe", "Penal or exile settlement");
  }
  if (
    Number(mainworldOverlay?.populationCode ?? 0) >= 6 &&
    Number(mainworldOverlay?.techLevel ?? 0) >= 8 &&
    ["A", "B", "C"].includes(mainworldOverlay?.starport) &&
    Number(rollClassification()) + (Number(mainworldOverlay?.techLevel ?? 0) >= 12 ? 2 : 0) >= 10
  ) {
    addClassification("Rb", "Scientific or survey installation");
  }

  return {
    eligible: true,
    dependent,
    governmentSource,
    governmentCode: derivedGovernmentCode,
    classificationCodes: classifications.map((entry) => entry.code),
    classifications,
    summary: dependent ? "Dependent secondary world" : "Independent secondary world",
    classificationSummary: classifications.map((entry) => entry.code).join(", "),
  };
}

export function deriveSecondaryWorldLawLevel({
  populationCode = 0,
  governmentCode = 0,
  mainworldOverlay = null,
  secondaryWorldContext = null,
  rollDie = d1,
  rollTwoDice = () => d6(),
} = {}) {
  if (!(populationCode > 0) || !mainworldOverlay || !secondaryWorldContext?.eligible) {
    return {
      eligible: false,
      lawLevel: rollWorldLawLevel({ governmentCode, rollTwoDice }),
      caseLabel: "default",
      summary: "Default law-level roll",
      sourceSummary: summarizeSecondaryWorldLawSource("default"),
    };
  }

  const numericGovernmentCode = Number(governmentCode);
  const mainworldGovernmentCode = Number(mainworldOverlay?.governmentCode ?? 0);
  const mainworldLawLevel = clampWorldLawLevel(mainworldOverlay?.lawLevel);
  const classificationCodes = Array.isArray(secondaryWorldContext?.classificationCodes)
    ? secondaryWorldContext.classificationCodes
    : [];

  if (numericGovernmentCode === 6) {
    const captiveDm = classificationCodes.some((code) => ["Pe", "Mb"].includes(code)) ? 1 : 0;
    const captiveRoll = Number(rollDie(6)) + captiveDm;

    if (captiveRoll <= 2) {
      return {
        eligible: true,
        lawLevel: rollWorldLawLevel({ governmentCode: 6, rollTwoDice }),
        caseLabel: "captive-reroll",
        summary: "Captive secondary world rerolls law level as Government 6",
        sourceSummary: summarizeSecondaryWorldLawSource("captive-reroll"),
      };
    }
    if (captiveRoll <= 4) {
      return {
        eligible: true,
        lawLevel: mainworldLawLevel,
        caseLabel: "captive-same-as-mainworld",
        summary: "Captive secondary world uses the owning mainworld law level",
        sourceSummary: summarizeSecondaryWorldLawSource("captive-same-as-mainworld"),
      };
    }
    if (captiveRoll === 5) {
      return {
        eligible: true,
        lawLevel: clampWorldLawLevel(mainworldLawLevel + 1),
        caseLabel: "captive-mainworld-plus-one",
        summary: "Captive secondary world is slightly stricter than the owning mainworld",
        sourceSummary: summarizeSecondaryWorldLawSource("captive-mainworld-plus-one"),
      };
    }

    return {
      eligible: true,
      lawLevel: clampWorldLawLevel(mainworldLawLevel + Number(rollDie(6))),
      caseLabel: "captive-mainworld-plus-die",
      summary: "Captive secondary world is significantly stricter than the owning mainworld",
      sourceSummary: summarizeSecondaryWorldLawSource("captive-mainworld-plus-die"),
    };
  }

  if (secondaryWorldContext?.dependent && numericGovernmentCode >= 1 && numericGovernmentCode <= 3) {
    const authorityRoll = Number(rollTwoDice()) - mainworldGovernmentCode;
    if (authorityRoll <= 0) {
      return {
        eligible: true,
        lawLevel: mainworldLawLevel,
        caseLabel: "dependent-inherits-mainworld",
        summary: "Dependent low-government secondary world inherits the mainworld law level",
        sourceSummary: summarizeSecondaryWorldLawSource("dependent-inherits-mainworld"),
      };
    }

    const localRoll = Number(rollDie(6));
    if (localRoll <= 3) {
      return {
        eligible: true,
        lawLevel: clampWorldLawLevel(localRoll),
        caseLabel: "dependent-local-low-law",
        summary: "Dependent low-government secondary world keeps its own lightly regulated law level",
        sourceSummary: summarizeSecondaryWorldLawSource("dependent-local-low-law"),
      };
    }

    return {
      eligible: true,
      lawLevel: rollWorldLawLevel({ governmentCode: numericGovernmentCode, rollTwoDice }),
      caseLabel: "dependent-reroll",
      summary: "Dependent low-government secondary world rerolls its own law level",
      sourceSummary: summarizeSecondaryWorldLawSource("dependent-reroll"),
    };
  }

  const freeportDm = classificationCodes.includes("Fp") ? -1 : 0;
  return {
    eligible: true,
    lawLevel: rollWorldLawLevel({ governmentCode: numericGovernmentCode, dm: freeportDm, rollTwoDice }),
    caseLabel: freeportDm ? "independent-freeport" : "independent-default",
    summary: freeportDm
      ? "Secondary-world law level rerolled with a freeport leniency modifier"
      : "Secondary-world law level rerolled normally",
    sourceSummary: summarizeSecondaryWorldLawSource(freeportDm ? "independent-freeport" : "independent-default"),
  };
}

export function deriveConvictionProfile({
  lawProfile = null,
  justiceProfile = null,
  offenseType = "criminal",
  defendantActuallyCommittedCrime = true,
  caughtRedHanded = false,
  evidenceLevel = "none",
  prosecutionAdvocate = 0,
  defenseAdvocate = 0,
  advocateAllowed = true,
  extraDm = 0,
  rollTwoDice = () => d6(),
} = {}) {
  const applicableLawLevel = resolveApplicableLawLevel({ offenseType, lawProfile });
  const justiceCode = String(justiceProfile?.code || lawProfile?.primarySystem?.code || "N");
  const presumptionOfInnocence = Boolean(lawProfile?.presumptionOfInnocence);
  const offenseKey = normalizeOffenseType(offenseType);
  const normalizedEvidenceLevel = String(evidenceLevel || "none")
    .trim()
    .toLowerCase();
  let dm = 0;

  if (justiceCode === "A") dm += 2;
  if (presumptionOfInnocence) dm += 2;
  if (caughtRedHanded) dm -= 6;
  if (normalizedEvidenceLevel === "overwhelming") dm -= 4;
  else if (normalizedEvidenceLevel === "circumstantial") dm -= 2;
  if (!defendantActuallyCommittedCrime) dm += 4;
  dm -= applicableLawLevel;
  dm -= Number(prosecutionAdvocate || 0);
  if (advocateAllowed) dm += Number(defenseAdvocate || 0);
  dm += Number(extraDm || 0);

  const total = Number(rollTwoDice()) + dm;
  const avoidConviction = total >= 8;

  return {
    eligible: true,
    offenseType: offenseKey,
    applicableLawLevel,
    justiceCode,
    presumptionOfInnocence,
    total,
    dm,
    avoidConviction,
    convicted: !avoidConviction,
    summary: avoidConviction ? "Avoids conviction" : "Convicted",
  };
}

export function derivePenaltyProfile({
  lawProfile = null,
  offenseType = "criminal",
  severity = "moderate",
  prohibitedAtLevel = null,
  prosecutionAdvocate = 0,
  defenseAdvocate = 0,
  advocateAllowed = true,
  extraDm = 0,
  rollTwoDice = () => d6(),
} = {}) {
  const offenseKey = normalizeOffenseType(offenseType);
  const severityKey = normalizeCrimeSeverityKey(severity);
  const severityProfile = CRIME_SEVERITY_TABLE[severityKey];
  const applicableLawLevel = resolveApplicableLawLevel({ offenseType: offenseKey, lawProfile });
  const enforcementProfile = deriveDiscretionaryEnforcementProfile({
    lawProfile,
    offenseType: offenseKey,
    severity,
  });
  const proscriptionDm = Number.isFinite(Number(prohibitedAtLevel))
    ? applicableLawLevel - Number(prohibitedAtLevel)
    : 0;
  const dm =
    severityProfile.dm -
    Number(prosecutionAdvocate || 0) +
    (advocateAllowed ? Number(defenseAdvocate || 0) : 0) +
    proscriptionDm +
    Number(extraDm || 0);
  const total = Number(rollTwoDice()) + dm;
  const band = resolvePenaltyBand(total, offenseKey === "economic" ? ECONOMIC_PENALTY_TABLE : CRIMINAL_PENALTY_TABLE);
  const deathPenaltyAllowed = Boolean(lawProfile?.deathPenalty);
  let summary = band.label;

  if (["criminal", "personalRights"].includes(offenseKey) && total >= 15 && !deathPenaltyAllowed) {
    summary = "Life imprisonment or alternative most-severe punishment";
  } else if (offenseKey === "economic" && total >= 15 && deathPenaltyAllowed && applicableLawLevel >= 9) {
    summary = `${band.label}; death penalty may be discretionary at this law level`;
  }

  return {
    eligible: true,
    offenseType: offenseKey,
    severity: severityProfile,
    applicableLawLevel,
    enforcementProfile,
    proscriptionDm,
    total,
    dm,
    band,
    deathPenaltyAllowed,
    summary,
  };
}

export function deriveAppealProfile({
  lawProfile = null,
  justiceProfile = null,
  outcome = null,
  appellantAdvocate = 0,
  respondentAdvocate = 0,
  extraDm = 0,
  rollAppellant = null,
  rollRespondent = null,
  retrialOptions = null,
} = {}) {
  const criminalLawLevel = resolveApplicableLawLevel({ offenseType: "criminal", lawProfile });
  const justiceCode = String(justiceProfile?.code || lawProfile?.primarySystem?.code || "N");
  const eligible = criminalLawLevel > 0 && justiceCode !== "N";
  const defendantAppealAvailable = eligible;
  const prosecutionAppealAvailable = eligible && justiceCode === "I" && criminalLawLevel >= 7;
  const normalizedOutcome = String(outcome || "")
    .trim()
    .toLowerCase();
  const requestedOutcome = ["conviction", "acquittal"].includes(normalizedOutcome) ? normalizedOutcome : null;

  if (!eligible) {
    return {
      eligible: false,
      defendantAppealAvailable: false,
      prosecutionAppealAvailable: false,
      actor: null,
      outcome: requestedOutcome,
      granted: null,
      summary: "No formal appeal process",
    };
  }

  const summary = summarizeAppealRights({ criminalLawLevel, justiceCode });
  if (!requestedOutcome || typeof rollAppellant !== "function") {
    return {
      eligible: true,
      defendantAppealAvailable,
      prosecutionAppealAvailable,
      actor: null,
      outcome: requestedOutcome,
      granted: null,
      criminalLawLevel,
      justiceCode,
      summary,
    };
  }

  const actor = requestedOutcome === "conviction" ? "defendant" : "prosecution";
  if (requestedOutcome === "acquittal" && !prosecutionAppealAvailable) {
    return {
      eligible: true,
      defendantAppealAvailable,
      prosecutionAppealAvailable,
      actor,
      outcome: requestedOutcome,
      granted: false,
      criminalLawLevel,
      justiceCode,
      summary: "Prosecution appeal unavailable",
    };
  }

  const appellantTotal = Number(rollAppellant()) + Number(appellantAdvocate || 0) + Number(extraDm || 0);
  const respondentTotal =
    typeof rollRespondent === "function" ? Number(rollRespondent()) + Number(respondentAdvocate || 0) : null;
  const granted =
    requestedOutcome === "conviction"
      ? appellantTotal >= 10
      : appellantTotal >= 10 && appellantTotal > Number(respondentTotal ?? Number.NEGATIVE_INFINITY);
  const retrialProfile = granted && retrialOptions ? deriveConvictionProfile(retrialOptions) : null;

  return {
    eligible: true,
    defendantAppealAvailable,
    prosecutionAppealAvailable,
    actor,
    outcome: requestedOutcome,
    criminalLawLevel,
    justiceCode,
    appellantTotal,
    respondentTotal,
    granted,
    retrialProfile,
    summary: granted
      ? `${actor === "defendant" ? "Defendant" : "Prosecution"} appeal granted`
      : `${actor === "defendant" ? "Defendant" : "Prosecution"} appeal denied`,
  };
}

export function deriveDiscretionaryEnforcementProfile({
  lawProfile = null,
  offenseType = "criminal",
  severity = "minor",
  advocateSkill = 0,
  persuadeSkill = 0,
  extraDm = 0,
  rollCheck = null,
  checkTarget = null,
} = {}) {
  const offenseKey = normalizeOffenseType(offenseType);
  const severityProfile = CRIME_SEVERITY_TABLE[normalizeCrimeSeverityKey(severity)];
  const applicableLawLevel = resolveApplicableLawLevel({ offenseType: offenseKey, lawProfile });
  const enforcementThreshold = Number(severityProfile?.enforcement ?? 99);
  const automaticallyPursued = applicableLawLevel >= enforcementThreshold;
  const warningPossible = !automaticallyPursued;
  const resolvedCheckTarget = Number.isFinite(Number(checkTarget)) ? Number(checkTarget) : null;
  const advocateTotal =
    typeof rollCheck === "function" ? Number(rollCheck()) + Number(advocateSkill || 0) + Number(extraDm || 0) : null;
  const persuadeTotal =
    typeof rollCheck === "function" ? Number(rollCheck()) + Number(persuadeSkill || 0) + Number(extraDm || 0) : null;
  const preferredSkill = Number(advocateSkill || 0) >= Number(persuadeSkill || 0) ? "Advocate" : "Persuade";
  const preferredTotal = preferredSkill === "Advocate" ? advocateTotal : persuadeTotal;
  const warningGranted =
    warningPossible && preferredTotal !== null && resolvedCheckTarget !== null
      ? preferredTotal >= resolvedCheckTarget
      : null;

  return {
    eligible: true,
    offenseType: offenseKey,
    severity: severityProfile,
    applicableLawLevel,
    enforcementThreshold,
    automaticallyPursued,
    warningPossible,
    preferredSkill,
    checkTarget: resolvedCheckTarget,
    advocateTotal,
    persuadeTotal,
    preferredTotal,
    warningGranted,
    summary: summarizeDiscretionaryEnforcement({
      automaticallyPursued,
      warningPossible,
      warningGranted,
      skillLabel: "Advocate or Persuade",
    }),
  };
}

export function derivePrivateLawProfile({
  lawProfile = null,
  plaintiffAdvocate = 0,
  defendantAdvocate = 0,
  plaintiffDm = 0,
  defendantDm = 0,
  extraDm = 0,
  punitiveDamagesRequested = false,
  punitiveDamagesExtraDm = 0,
  rollPlaintiff = null,
  rollDefendant = null,
  rollDamages = null,
} = {}) {
  const privateLawLevel = resolveApplicableLawLevel({ offenseType: "private", lawProfile });
  const environmentSummary = summarizePrivateLawEnvironment(privateLawLevel);
  const eligible = privateLawLevel > 0;
  const transferredToCriminalJustice = privateLawLevel >= 12;
  const punitiveDamagesLimited = privateLawLevel >= 7;

  if (!eligible) {
    return {
      eligible: false,
      privateLawLevel,
      transferredToCriminalJustice: false,
      punitiveDamagesLimited: false,
      contestResolved: false,
      summary: environmentSummary,
    };
  }

  if (transferredToCriminalJustice || typeof rollPlaintiff !== "function" || typeof rollDefendant !== "function") {
    return {
      eligible: true,
      privateLawLevel,
      transferredToCriminalJustice,
      punitiveDamagesLimited,
      contestResolved: false,
      summary: environmentSummary,
    };
  }

  const plaintiffTotal =
    Number(rollPlaintiff()) + Number(plaintiffAdvocate || 0) + Number(plaintiffDm || 0) + Number(extraDm || 0);
  const defendantTotal = Number(rollDefendant()) + Number(defendantAdvocate || 0) + Number(defendantDm || 0);
  const effect = plaintiffTotal - defendantTotal;
  const plaintiffMeetsThreshold = plaintiffTotal >= 8;
  const plaintiffPrevails = plaintiffMeetsThreshold && effect > 0;
  const countersuitDm = plaintiffPrevails ? effect : Math.abs(effect);
  const damagesBand =
    plaintiffPrevails && punitiveDamagesRequested && typeof rollDamages === "function"
      ? resolvePenaltyBand(Number(rollDamages()) + effect + Number(punitiveDamagesExtraDm || 0), ECONOMIC_PENALTY_TABLE)
      : null;
  let summary = plaintiffPrevails ? "Plaintiff prevails" : "Plaintiff fails to prove the case";

  if (transferredToCriminalJustice) {
    summary = environmentSummary;
  } else if (damagesBand) {
    summary = `${summary}; punitive damages guidance ${damagesBand.label.toLowerCase()}`;
    if (punitiveDamagesLimited) {
      summary = `${summary}; punitive damages are tightly limited`;
    }
  } else if (punitiveDamagesLimited) {
    summary = `${summary}; punitive damages are tightly limited`;
  }

  return {
    eligible: true,
    privateLawLevel,
    transferredToCriminalJustice,
    punitiveDamagesLimited,
    contestResolved: true,
    plaintiffTotal,
    defendantTotal,
    effect,
    plaintiffPrevails,
    countersuitDm,
    damagesBand,
    summary,
  };
}

export function derivePersonalRightsProfile({
  lawProfile = null,
  justiceProfile = null,
  severity = "minor",
  prohibitedAtLevel = null,
  defendantActuallyCommittedViolation = true,
  caughtRedHanded = false,
  evidenceLevel = "none",
  prosecutionAdvocate = 0,
  defenseAdvocate = 0,
  advocateAllowed = true,
  extraDm = 0,
  rollConviction = null,
  rollPenalty = null,
} = {}) {
  const personalRightsLevel = resolveApplicableLawLevel({ offenseType: "personalRights", lawProfile });
  const environmentSummary = summarizePersonalRightsEnvironment(personalRightsLevel);
  const severityProfile = CRIME_SEVERITY_TABLE[normalizeCrimeSeverityKey(severity)];
  const eligible = personalRightsLevel > 0;
  const enforcementProfile = deriveDiscretionaryEnforcementProfile({
    lawProfile,
    offenseType: "personalRights",
    severity,
  });
  const alwaysPursued = Boolean(enforcementProfile.automaticallyPursued);

  if (!eligible) {
    return {
      eligible: false,
      personalRightsLevel,
      alwaysPursued: false,
      enforcementProfile,
      convictionProfile: null,
      penaltyProfile: null,
      summary: environmentSummary,
    };
  }

  if (typeof rollConviction !== "function" || typeof rollPenalty !== "function") {
    return {
      eligible: true,
      personalRightsLevel,
      severity: severityProfile,
      alwaysPursued,
      enforcementProfile,
      convictionProfile: null,
      penaltyProfile: null,
      summary: `${environmentSummary}; ${enforcementProfile.summary}`,
    };
  }

  const convictionProfile = deriveConvictionProfile({
    lawProfile,
    justiceProfile,
    offenseType: "personalRights",
    defendantActuallyCommittedCrime: defendantActuallyCommittedViolation,
    caughtRedHanded,
    evidenceLevel,
    prosecutionAdvocate,
    defenseAdvocate,
    advocateAllowed,
    extraDm,
    rollTwoDice: rollConviction,
  });
  const penaltyProfile = convictionProfile.convicted
    ? derivePenaltyProfile({
        lawProfile,
        offenseType: "personalRights",
        severity,
        prohibitedAtLevel,
        prosecutionAdvocate,
        defenseAdvocate,
        advocateAllowed,
        extraDm,
        rollTwoDice: rollPenalty,
      })
    : null;

  return {
    eligible: true,
    personalRightsLevel,
    severity: severityProfile,
    alwaysPursued,
    enforcementProfile: deriveDiscretionaryEnforcementProfile({
      lawProfile,
      offenseType: "personalRights",
      severity,
      advocateSkill: defenseAdvocate,
      persuadeSkill: defenseAdvocate,
      extraDm,
      rollCheck: rollConviction,
      checkTarget: 8,
    }),
    convictionProfile,
    penaltyProfile,
    summary: penaltyProfile?.summary || convictionProfile.summary || environmentSummary,
    environmentSummary,
  };
}

function summarizeMinimumSustainableTlBand(band) {
  return (
    {
      "0-3": "Minimal sustainable TL 0-3",
      "3-7": "Minimal sustainable TL 3-7",
      "8+": "Minimal sustainable TL 8+",
    }[band] || "Minimal sustainable TL unknown"
  );
}

function resolveMinimumSustainableTlBand(minimumTechLevel = 0) {
  if (Number(minimumTechLevel) >= 8) {
    return "8+";
  }
  if (Number(minimumTechLevel) >= 3) {
    return "3-7";
  }
  return "0-3";
}

function resolveHabitabilityMinimumTechLevel(habitability) {
  const normalized = String(habitability || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return null;
  }
  if (normalized === "hostile") {
    return 8;
  }
  if (normalized === "poor") {
    return 5;
  }
  if (["marginal", "good", "excellent"].includes(normalized)) {
    return 3;
  }
  return null;
}

export function deriveMinimumSustainableTechLevel(world = {}) {
  if (world?.minimumSustainableTechLevel && typeof world.minimumSustainableTechLevel === "object") {
    return world.minimumSustainableTechLevel;
  }

  if (world?.nativeSophontLife) {
    return {
      minimumTechLevel: 0,
      band: "0-3",
      summary: "No environmental minimum for native sophonts",
      factors: [
        { source: "nativeSophontLife", minimumTechLevel: 0, summary: "Native sophonts ignore environmental minima" },
      ],
      conditional: false,
    };
  }

  const atmosphereCode = Number(world?.atmosphereCode ?? 0);
  const habitability = world?.habitability ?? determineHabitabilityRating(world);
  const factors = [];
  let conditional = false;

  if ([0, 1, 10].includes(atmosphereCode)) {
    factors.push({
      source: "atmosphere",
      minimumTechLevel: 8,
      summary: `Atmosphere ${atmosphereCode.toString(16).toUpperCase()} requires TL8`,
    });
  } else if ([2, 3, 13, 14].includes(atmosphereCode)) {
    factors.push({
      source: "atmosphere",
      minimumTechLevel: 5,
      summary: `Atmosphere ${atmosphereCode.toString(16).toUpperCase()} requires TL5`,
    });
  } else if ([4, 7, 9].includes(atmosphereCode)) {
    factors.push({
      source: "atmosphere",
      minimumTechLevel: 3,
      summary: `Atmosphere ${atmosphereCode.toString(16).toUpperCase()} requires TL3`,
    });
  } else if (atmosphereCode === 11) {
    factors.push({ source: "atmosphere", minimumTechLevel: 9, summary: "Atmosphere B requires TL9" });
  } else if (atmosphereCode === 12) {
    factors.push({ source: "atmosphere", minimumTechLevel: 10, summary: "Atmosphere C requires TL10" });
  } else if ([16, 17].includes(atmosphereCode)) {
    factors.push({
      source: "atmosphere",
      minimumTechLevel: 14,
      summary: `Atmosphere ${atmosphereCode.toString(16).toUpperCase()} requires TL14`,
    });
  } else if (atmosphereCode === 15) {
    conditional = true;
    factors.push({
      source: "atmosphere",
      minimumTechLevel: 8,
      summary: "Atmosphere F requires TL8+, potentially TL10+ depending on conditions",
    });
  }

  const habitabilityMinimumTechLevel = resolveHabitabilityMinimumTechLevel(habitability);
  if (habitabilityMinimumTechLevel !== null) {
    factors.push({
      source: "habitability",
      minimumTechLevel: habitabilityMinimumTechLevel,
      summary: `Habitability ${habitability} implies TL${habitabilityMinimumTechLevel}`,
    });
  }

  const minimumTechLevel = factors.reduce((highest, factor) => Math.max(highest, factor.minimumTechLevel), 0);
  const band = resolveMinimumSustainableTlBand(minimumTechLevel);

  return {
    minimumTechLevel,
    band,
    summary:
      minimumTechLevel > 0
        ? conditional && minimumTechLevel === 8
          ? "Minimal sustainable TL 8+"
          : `Minimal sustainable TL ${minimumTechLevel}`
        : "Minimal sustainable TL 0",
    factors,
    conditional,
  };
}

export function derivePopulationConcentrationProfile({
  world = {},
  populationCode = 0,
  governmentCode = 0,
  techLevel = 0,
  tradeCodes = [],
  rollDie = d1,
} = {}) {
  const minimumSustainableTechLevel = deriveMinimumSustainableTechLevel(world);
  const minimumSustainableTlBand = minimumSustainableTechLevel.band;

  if (!(populationCode > 0)) {
    return {
      eligible: false,
      rating: null,
      label: "Uninhabited",
      summary: "Uninhabited",
      settledAreaPercent: 0,
      minimumSustainableTechLevel,
      minimumSustainableTlBand,
      minimumSustainableTlSummary: summarizeMinimumSustainableTlBand(minimumSustainableTlBand),
    };
  }

  const size = Number(world?.size ?? 0);
  let dm = 0;

  if (size === 1) dm += 2;
  else if (size >= 2 && size <= 3) dm += 1;

  if (minimumSustainableTlBand === "8+") dm += 3;
  else if (minimumSustainableTlBand === "3-7") dm += 1;

  if (populationCode === 8) dm -= 1;
  else if (populationCode >= 9) dm -= 2;

  if (governmentCode === 7) dm -= 2;

  if (techLevel <= 1) dm -= 2;
  else if (techLevel <= 3) dm -= 1;
  else dm += 1;

  if (hasTradeCode(tradeCodes, "Ag")) dm -= 2;
  if (hasTradeCode(tradeCodes, "In")) dm += 1;
  if (hasTradeCode(tradeCodes, "Na")) dm -= 1;
  if (hasTradeCode(tradeCodes, "Ri")) dm += 1;

  const concentrationRoll = Number(rollDie(6));
  const minimumRating = populationCode >= 9 ? 1 : 0;
  const rating = concentrationRoll > populationCode ? 9 : clamp(concentrationRoll + dm, minimumRating, 9);
  const label = POPULATION_CONCENTRATION_LABELS[rating] ?? "Unknown";

  return {
    eligible: true,
    rating,
    label,
    settledAreaPercent: clamp(100 - rating * 10, 10, 100),
    summary: `PCR ${rating} ${label}`,
    minimumSustainableTechLevel,
    minimumSustainableTlBand,
    minimumSustainableTlSummary: summarizeMinimumSustainableTlBand(minimumSustainableTlBand),
  };
}

function rollUrbanizationPercent(
  total,
  { rollDie = d1, rollBinary = () => rollDie(2), rollTernary = () => rollDie(3) } = {},
) {
  if (total <= 0) return 0;
  if (total === 1) return Number(rollDie(6));
  if (total === 2) return 6 + Number(rollDie(6));
  if (total === 3) return 12 + Number(rollDie(6));
  if (total === 4) return 18 + Number(rollDie(6));
  if (total === 5) return 22 + Number(rollDie(6)) * 2 + Number(rollBinary());
  if (total === 6) return 34 + Number(rollDie(6)) * 2 + Number(rollBinary());
  if (total === 7) return 46 + Number(rollDie(6)) * 2 + Number(rollBinary());
  if (total === 8) return 58 + Number(rollDie(6)) * 2 + Number(rollBinary());
  if (total === 9) return 70 + Number(rollDie(6)) * 2 + Number(rollBinary());
  if (total === 10) return 84 + Number(rollDie(6));
  if (total === 11) return 90 + Number(rollDie(6));
  if (total === 12) return 96 + Number(rollTernary());
  return 100;
}

export function deriveUrbanizationProfile({
  world = {},
  population = 0,
  populationCode = 0,
  governmentCode = 0,
  lawLevel = 0,
  techLevel = 0,
  tradeCodes = [],
  populationConcentration = null,
  rollTwoDice = () => d6(),
  rollDie = d1,
} = {}) {
  if (!(populationCode > 0) || !(population > 0) || !populationConcentration?.eligible) {
    return {
      eligible: false,
      percent: 0,
      urbanPopulation: 0,
      summary: "Uninhabited",
      virtualCities: false,
    };
  }

  const size = Number(world?.size ?? 0);
  const minimumSustainableTechLevel =
    populationConcentration.minimumSustainableTechLevel || deriveMinimumSustainableTechLevel(world);
  const minimumSustainableTlBand = minimumSustainableTechLevel.band;
  let dm = 0;

  if (populationConcentration.rating >= 0 && populationConcentration.rating <= 2) {
    dm += -3 + populationConcentration.rating;
  } else if (populationConcentration.rating >= 7) {
    dm += -6 + populationConcentration.rating;
  }

  if (minimumSustainableTlBand === "0-3") dm -= 1;
  if (size === 0) dm += 2;
  if (populationCode === 8) dm += 1;
  else if (populationCode === 9) dm += 2;
  else if (populationCode >= 10) dm += 4;
  if (governmentCode === 0) dm -= 2;
  if (lawLevel >= 9) dm += 1;

  let minimumPercent = null;
  let maximumPercent = null;
  if (populationCode === 9) {
    minimumPercent = 18 + Number(rollDie(6));
  } else if (populationCode >= 10) {
    minimumPercent = 50 + Number(rollDie(6));
  }

  if (techLevel <= 2) {
    dm -= 2;
    maximumPercent = 20 + Number(rollDie(6));
  } else if (techLevel === 3) {
    dm -= 1;
    maximumPercent = 30 + Number(rollDie(6));
  } else if (techLevel === 4) {
    dm += 1;
    maximumPercent = 60 + Number(rollDie(6));
  } else if (techLevel <= 9) {
    dm += 2;
    maximumPercent = 90 + Number(rollDie(6));
  } else {
    dm += 1;
  }

  if (hasTradeCode(tradeCodes, "Ag")) {
    dm -= 2;
    maximumPercent = Math.min(maximumPercent ?? Number.POSITIVE_INFINITY, 90 + Number(rollDie(6)));
  }
  if (hasTradeCode(tradeCodes, "Na")) {
    dm += 2;
  }

  let percent = clamp(
    rollUrbanizationPercent(Number(rollTwoDice()) + dm, {
      rollDie,
      rollBinary: () => rollDie(2),
      rollTernary: () => rollDie(3),
    }),
    0,
    100,
  );

  if (minimumPercent !== null && percent < minimumPercent) {
    percent = minimumPercent;
  } else if (maximumPercent !== null && percent > maximumPercent) {
    percent = maximumPercent;
  }

  return {
    eligible: true,
    percent,
    urbanPopulation: Math.round((population * percent) / 100),
    summary: `${percent}% urbanized`,
    virtualCities: techLevel > 9 && percent > 0,
  };
}

export function deriveMajorCitiesProfile({
  populationCode = 0,
  urbanization = null,
  populationConcentration = null,
  rollTwoDice = () => d6(),
} = {}) {
  const pcr = Number(populationConcentration?.rating);
  const urbanPopulation = Number(urbanization?.urbanPopulation ?? 0);
  const urbanizationPercent = Number(urbanization?.percent ?? 0);

  if (!(populationCode > 0) || !populationConcentration?.eligible || !urbanization?.eligible) {
    return {
      eligible: false,
      count: 0,
      summary: "No major cities",
      urbanPopulation,
      caseLabel: "uninhabited",
    };
  }

  if (pcr === 0) {
    return {
      eligible: true,
      count: 0,
      summary: "No major cities",
      urbanPopulation,
      caseLabel: "pcr-0",
    };
  }

  if (populationCode <= 5 && pcr === 9) {
    return {
      eligible: true,
      count: 1,
      summary: "1 major city",
      urbanPopulation,
      caseLabel: "pop-5-pcr-9",
    };
  }

  if (populationCode <= 5 && pcr >= 1 && pcr <= 8) {
    const count = Math.min(9 - pcr, populationCode);
    return {
      eligible: true,
      count,
      summary: `${count} major ${count === 1 ? "city" : "cities"}`,
      urbanPopulation,
      caseLabel: "pop-5-pcr-1-8",
    };
  }

  if (populationCode >= 6 && pcr === 9) {
    const count = Math.max(9 - populationCode - Number(rollTwoDice()), 1);
    return {
      eligible: true,
      count,
      summary: `${count} major ${count === 1 ? "city" : "cities"}`,
      urbanPopulation,
      caseLabel: "pop-6-pcr-9",
    };
  }

  const rawCount = Number(rollTwoDice()) - pcr + (urbanizationPercent / 100) * (20 / pcr);
  const count = Math.max(1, Math.ceil(populationCode < 6 ? Math.min(rawCount, populationCode) : rawCount));

  return {
    eligible: true,
    count,
    summary: `${count} major ${count === 1 ? "city" : "cities"}`,
    urbanPopulation,
    caseLabel: "general",
  };
}

export function deriveGovernmentProfile({
  governmentCode = 0,
  populationCode = 0,
  populationConcentration = null,
  rollCentralization = () => d6(),
  rollAuthority = () => d6(),
  rollFunctionalStructure = () => d6(),
  rollStructureDie = () => d6(1),
} = {}) {
  const numericGovernmentCode = Number(governmentCode);
  const pcr = Number(populationConcentration?.rating);

  if (!(populationCode > 0) || numericGovernmentCode === 0) {
    return {
      eligible: false,
      centralization: null,
      authority: null,
      authoritativeStructure: null,
      structures: null,
      profileCode: null,
      structureSummary: null,
      summary: "No functioning government",
      scope: summarizeGovernmentContext(numericGovernmentCode),
    };
  }

  let centralizationDm = 0;
  if (numericGovernmentCode >= 2 && numericGovernmentCode <= 5) centralizationDm -= 1;
  if (numericGovernmentCode === 6 || (numericGovernmentCode >= 8 && numericGovernmentCode <= 11)) centralizationDm += 1;
  if (numericGovernmentCode === 7) centralizationDm += 1;
  if (numericGovernmentCode >= 12) centralizationDm += 2;

  if (pcr >= 0 && pcr <= 3) centralizationDm -= 1;
  else if (pcr >= 7 && pcr <= 8) centralizationDm += 1;
  else if (pcr === 9) centralizationDm += 3;

  const centralizationTotal = Number(rollCentralization()) + centralizationDm;
  const centralizationCode = centralizationTotal <= 5 ? "C" : centralizationTotal <= 8 ? "F" : "U";
  const centralization = {
    ...GOVERNMENT_CENTRALIZATION_TABLE[centralizationCode],
    total: centralizationTotal,
    dm: centralizationDm,
  };

  let authorityDm = 0;
  if ([1, 6, 10, 13, 14].includes(numericGovernmentCode)) authorityDm += 6;
  else if (numericGovernmentCode === 2) authorityDm -= 4;
  else if ([3, 5, 12].includes(numericGovernmentCode)) authorityDm -= 2;
  else if ([11, 15].includes(numericGovernmentCode)) authorityDm += 4;

  if (centralization.code === "C") authorityDm -= 2;
  else if (centralization.code === "U") authorityDm += 2;

  const authorityTotal = Number(rollAuthority()) + authorityDm;
  let authorityCode = "E";
  if (authorityTotal <= 4) authorityCode = "L";
  else if (authorityTotal === 5) authorityCode = "E";
  else if (authorityTotal === 6) authorityCode = "J";
  else if (authorityTotal === 7) authorityCode = "B";
  else if (authorityTotal === 8) authorityCode = "L";
  else if (authorityTotal === 9) authorityCode = "B";
  else if (authorityTotal === 10) authorityCode = "E";
  else if (authorityTotal === 11) authorityCode = "J";

  const authority = {
    ...GOVERNMENT_AUTHORITY_TABLE[authorityCode],
    total: authorityTotal,
    dm: authorityDm,
  };

  const structures = {};
  const dominantBranchCode = authority.code === "B" ? null : authority.code;

  if (dominantBranchCode) {
    structures[dominantBranchCode] = resolveGovernmentStructureProfile({
      governmentCode: numericGovernmentCode,
      branchCode: dominantBranchCode,
      authorityCode: authority.code,
      isAuthoritative: true,
      rollTwoDice: rollFunctionalStructure,
      rollDie: rollStructureDie,
    });

    if (centralization.code === "U" && ["R", "S"].includes(structures[dominantBranchCode]?.code)) {
      ["L", "E", "J"]
        .filter((branchCode) => branchCode !== dominantBranchCode)
        .forEach((branchCode) => {
          structures[branchCode] = {
            ...structures[dominantBranchCode],
            branchCode,
            branchLabel: GOVERNMENT_BRANCH_LABELS[branchCode],
            authoritative: false,
            source: "shared-unitary-authority",
          };
        });
    }
  }

  ["L", "E", "J"]
    .filter((branchCode) => !structures[branchCode])
    .forEach((branchCode) => {
      structures[branchCode] = resolveGovernmentStructureProfile({
        governmentCode: numericGovernmentCode,
        branchCode,
        authorityCode: authority.code,
        isAuthoritative: branchCode === dominantBranchCode,
        rollTwoDice: rollFunctionalStructure,
        rollDie: rollStructureDie,
      });
    });

  const authoritativeStructure = dominantBranchCode ? structures[dominantBranchCode] : null;
  const structureSummary = summarizeGovernmentStructures({ authorityCode: authority.code, structures });
  const profileCode = buildGovernmentProfileCode({
    governmentCode: numericGovernmentCode,
    centralizationCode: centralization.code,
    authorityCode: authority.code,
    structures,
  });
  const summary =
    authority.code === "B"
      ? `${centralization.label} / ${authority.label}`
      : `${centralization.label} / ${authority.label} / ${authoritativeStructure?.label || "Unknown"}`;

  return {
    eligible: true,
    scope: summarizeGovernmentContext(numericGovernmentCode),
    centralization,
    authority,
    authoritativeStructure,
    structures,
    profileCode,
    structureSummary,
    summary,
  };
}

function rollStarport(populationCode, { nativeSophontLife = false } = {}) {
  let dm = 0;
  if (populationCode <= 2) dm -= 2;
  else if (populationCode <= 4) dm -= 1;
  else if (populationCode >= 8 && populationCode <= 9) dm += 1;
  else if (populationCode >= 10) dm += 2;

  if (nativeSophontLife) dm -= 2;

  const total = d6() + d6() + dm;
  if (total <= 2) return "X";
  if (total <= 4) return "E";
  if (total <= 6) return "D";
  if (total <= 8) return "C";
  if (total <= 10) return "B";
  return "A";
}

function rollTechLevel({
  starport,
  size,
  atmosphereCode,
  hydrographics,
  populationCode,
  governmentCode,
  nativeSophontLife,
}) {
  let dm = 0;

  dm += { A: 6, B: 4, C: 2, X: -4 }[starport] || 0;

  if (!nativeSophontLife) {
    if (size <= 1) dm += 2;
    else if (size >= 2 && size <= 4) dm += 1;

    if (atmosphereCode <= 3 || atmosphereCode >= 10) dm += 1;
    if (hydrographics === 9) dm += 1;
    else if (hydrographics === 10) dm += 2;
  }

  if (populationCode >= 1 && populationCode <= 5) dm += 1;
  else if (populationCode === 9) dm += 2;
  else if (populationCode === 10) dm += 4;

  if (governmentCode === 0 || governmentCode === 5) dm += 1;
  else if (governmentCode === 13) dm -= 2;

  return clamp(d1() + dm, 0, 15);
}

function deriveSocialUwp({ world, isMainworld = true, mainworldPopulationCode = null, mainworldOverlay = null } = {}) {
  const size = Number(world?.size ?? 0);
  const atmosphereCode = Number(world?.atmosphereCode ?? 0);
  const hydrographics = Number(world?.hydrographics ?? 0);
  const candidateScore = scoreMainworldCandidateWbh(world, { hzco: world?.hzco });
  const habitability = determineHabitabilityRating({
    candidateScore,
    size,
    atmosphereCode,
    hydrographics,
    avgTempC: Number(world?.avgTempC ?? 0),
  });
  const nativeSophontLife = Boolean(world?.nativeSophontLife);
  const colonySupportBonus =
    (nativeSophontLife ? 1 : 0) +
    (Boolean(world?.isMoon) && candidateScore >= 6 ? 1 : 0) +
    (String(world?.resourceRating || "")
      .trim()
      .toLowerCase() === "abundant"
      ? 1
      : 0);

  let populationCode;
  if (isMainworld) {
    const habitabilityDm = candidateScore >= 10 ? 1 : candidateScore <= 2 ? -2 : 0;
    populationCode = clamp(d6() + d6() - 2 + habitabilityDm, 0, 10);
  } else {
    const base = Number.isInteger(mainworldPopulationCode) ? mainworldPopulationCode : 5;
    const colonyPenalty = clamp(
      (size === 0 ? 4 : atmosphereCode === 0 || hydrographics === 0 ? 3 : 2) - colonySupportBonus,
      1,
      4,
    );
    populationCode = clamp(base - colonyPenalty - Math.floor(d1() / 2), 0, Math.max(0, base - 1));
    if (candidateScore <= 0 && !nativeSophontLife) {
      populationCode = 0;
    }
  }

  const baseGovernmentCode = rollGovernmentCodeForPopulation(populationCode);
  const secondaryWorldContext =
    populationCode === 0 || isMainworld
      ? {
          eligible: false,
          dependent: false,
          classificationCodes: [],
          classifications: [],
          summary: "",
        }
      : deriveSecondaryWorldContext({
          world,
          populationCode,
          governmentCode: baseGovernmentCode,
          mainworldOverlay,
        });
  const governmentCode =
    isMainworld || !secondaryWorldContext?.eligible ? baseGovernmentCode : secondaryWorldContext.governmentCode;
  const starport = populationCode === 0 ? "X" : rollStarport(populationCode, { nativeSophontLife });
  const techLevel =
    populationCode === 0
      ? 0
      : rollTechLevel({
          starport,
          size,
          atmosphereCode,
          hydrographics,
          populationCode,
          governmentCode,
          nativeSophontLife,
        });
  const preLawSecondaryWorldContext = secondaryWorldContext?.eligible
    ? deriveSecondaryWorldContext({
        world,
        populationCode,
        governmentCode,
        techLevel,
        mainworldOverlay,
        useProvidedGovernmentCode: true,
      })
    : secondaryWorldContext;
  const secondaryWorldLawLevel =
    populationCode === 0 || isMainworld || !preLawSecondaryWorldContext?.eligible
      ? null
      : deriveSecondaryWorldLawLevel({
          populationCode,
          governmentCode,
          mainworldOverlay,
          secondaryWorldContext: preLawSecondaryWorldContext,
        });
  const lawLevel =
    populationCode === 0
      ? 0
      : isMainworld || !preLawSecondaryWorldContext?.eligible
        ? rollWorldLawLevel({ governmentCode })
        : secondaryWorldLawLevel.lawLevel;
  const tradeCodes = buildTradeCodes({
    size,
    atmosphereCode,
    hydrographics,
    populationCode,
    governmentCode,
    lawLevel,
    techLevel,
  });
  const population = computePopulationValue(populationCode);
  const minimumSustainableTechLevel = deriveMinimumSustainableTechLevel({
    ...world,
    habitability,
  });
  const populationConcentration = derivePopulationConcentrationProfile({
    world: { ...world, minimumSustainableTechLevel },
    populationCode,
    governmentCode,
    techLevel,
    tradeCodes,
  });
  const urbanization = deriveUrbanizationProfile({
    world: { ...world, minimumSustainableTechLevel },
    population,
    populationCode,
    governmentCode,
    lawLevel,
    techLevel,
    tradeCodes,
    populationConcentration,
  });
  const majorCities = deriveMajorCitiesProfile({
    populationCode,
    urbanization,
    populationConcentration,
  });
  const governmentProfile = deriveGovernmentProfile({
    governmentCode,
    populationCode,
    populationConcentration,
  });
  const justiceProfile = deriveJusticeProfile({
    governmentCode,
    lawLevel,
    techLevel,
    governmentProfile,
  });
  const lawProfile = deriveLawProfile({
    governmentCode,
    lawLevel,
    populationCode,
    techLevel,
    governmentProfile,
    justiceProfile,
    populationConcentration,
  });
  const appealProfile = deriveAppealProfile({ lawProfile, justiceProfile });
  const privateLawProfile = derivePrivateLawProfile({ lawProfile });
  const personalRightsProfile = derivePersonalRightsProfile({ lawProfile, justiceProfile });
  const factionsProfile = deriveFactionsProfile({
    governmentCode,
    populationCode,
  });
  const resolvedSecondaryWorldContext = preLawSecondaryWorldContext?.eligible
    ? deriveSecondaryWorldContext({
        world,
        populationCode,
        governmentCode,
        lawLevel,
        techLevel,
        mainworldOverlay,
        useProvidedGovernmentCode: true,
      })
    : secondaryWorldContext;
  if (resolvedSecondaryWorldContext?.eligible && secondaryWorldLawLevel) {
    resolvedSecondaryWorldContext.lawLevel = secondaryWorldLawLevel.lawLevel;
    resolvedSecondaryWorldContext.lawLevelCase = secondaryWorldLawLevel.caseLabel;
    resolvedSecondaryWorldContext.lawLevelSourceSummary = secondaryWorldLawLevel.sourceSummary;
  }
  const civilConflict = deriveCivilConflictProfile({ populationCode, governmentCode, lawLevel });
  const techLevelPockets = deriveTechLevelPocketProfile({ techLevel });
  const houseRulesApplied = [civilConflict, techLevelPockets]
    .filter((rule) => rule?.eligible)
    .map((rule) => rule.ruleId);

  return {
    isMainworld,
    mainworldCandidateScore: candidateScore,
    populationCode,
    population,
    governmentCode,
    governmentDesc: GOVERNMENT_TABLE[governmentCode] ?? "Unknown",
    lawLevel,
    lawDesc: LAW_TABLE[lawLevel] ?? "Unknown",
    techLevel,
    techDesc: TECH_TABLE[techLevel] ?? "Unknown",
    starport,
    starportDesc: STARPORT_TABLE[starport] ?? "Unknown",
    tradeCodes,
    minimumSustainableTechLevel,
    populationConcentration,
    urbanization,
    majorCities,
    governmentProfile,
    justiceProfile,
    lawProfile,
    appealProfile,
    privateLawProfile,
    personalRightsProfile,
    factionsProfile,
    secondaryWorldContext: resolvedSecondaryWorldContext,
    civilConflict,
    techLevelPockets,
    houseRulesApplied,
    habitability,
    resourceRating: determineResourceRating(world),
    importance: deriveImportance({ tradeCodes, starport, techLevel, populationCode }),
    nativeLifeform: buildNativeLifeProfile(world),
  };
}

export function applySystemWorldSocialProfiles(worlds = []) {
  if (!Array.isArray(worlds) || !worlds.length) {
    return [];
  }

  const expandedWorlds = worlds.flatMap((world) => flattenWorldWithMoons(world));

  const mainworldSelection = selectMainworldCandidateWbh(expandedWorlds, {
    hzcoResolver: (world) => world?.hzco,
  });
  const mainworldIndex = mainworldSelection?.index ?? 0;

  const mainworldOverlay = deriveSocialUwp({ world: expandedWorlds[mainworldIndex], isMainworld: true });

  return expandedWorlds.map((world, index) => {
    const overlay =
      index === mainworldIndex
        ? mainworldOverlay
        : deriveSocialUwp({
            world,
            isMainworld: false,
            mainworldPopulationCode: mainworldOverlay.populationCode,
            mainworldOverlay,
          });
    const uwp = `${overlay.starport}${toHex(Number(world?.size ?? 0))}${toHex(Number(world?.atmosphereCode ?? 0))}${toHex(Number(world?.hydrographics ?? 0))}${toHex(overlay.populationCode)}${toHex(overlay.governmentCode)}${toHex(overlay.lawLevel)}-${toHex(overlay.techLevel)}`;
    const economics = {
      importance: overlay.importance,
      resourceRating: overlay.resourceRating,
      habitability: overlay.habitability,
    };
    const remarks = buildWorldRemarks(world, overlay);

    return {
      ...world,
      ...overlay,
      economics,
      remarks,
      uwp,
    };
  });
}

export function normalizeWorldStarClass(value) {
  const token = resolveStarDescriptorToken(value, "G");
  return (
    {
      O: "O",
      B: "B",
      A: "A",
      F: "F",
      G: "G",
      K: "K",
      M: "M",
      D: "A",
      BD: "M",
      L: "M",
      T: "M",
      Y: "M",
      PROTO: "K",
    }[token] || "random"
  );
}

function resolveWorldStarClass(starClass) {
  const normalized = normalizeWorldStarClass(starClass);
  if (normalized !== "random") {
    return normalized;
  }
  return RANDOM_WORLD_STARS[Math.floor(Math.random() * RANDOM_WORLD_STARS.length)];
}

function withRomanDuplicateSuffix(baseName, reserved) {
  const normalizedBase = String(baseName || "").trim() || "World";
  if (!reserved?.has(normalizedBase)) {
    reserved?.add(normalizedBase);
    return normalizedBase;
  }

  let duplicateIndex = 2;
  let candidate = `${normalizedBase} ${toRomanNumeral(duplicateIndex)}`;
  while (reserved?.has(candidate)) {
    duplicateIndex += 1;
    candidate = `${normalizedBase} ${toRomanNumeral(duplicateIndex)}`;
  }

  reserved?.add(candidate);
  return candidate;
}

export function generateAutomaticWorldName({ mode = "list", usedNames } = {}) {
  const normalizedMode = String(mode || "list")
    .trim()
    .toLowerCase();
  const reserved = usedNames instanceof Set ? usedNames : null;

  const buildCandidate = () => {
    if (normalizedMode === "phonotactic" || normalizedMode === "normalized") {
      return generatePhonotacticName({ style: normalizedMode, syllablesMin: 2, syllablesMax: 4 });
    }
    return WORLD_NAMES[Math.floor(Math.random() * WORLD_NAMES.length)];
  };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = String(buildCandidate() || "").trim();
    if (!candidate) {
      continue;
    }
    return withRomanDuplicateSuffix(candidate, reserved);
  }

  const fallbackBase = String(buildCandidate() || "World").trim() || "World";
  return withRomanDuplicateSuffix(fallbackBase, reserved);
}

export function generateWorldProfile({
  worldName = "",
  starClass = "random",
  randomWorldName,
  isGasGiant = false,
  size = null,
  sizeCode = null,
  generateMoons: generateMoonsFlag = true,
  orbitNumber = null,
  hzco = null,
} = {}) {
  const resolvedStarClass = resolveWorldStarClass(starClass);
  const resolvedSizeCode = sizeCode ?? size ?? clamp(d6() - 2, 0, 10);
  const resolvedWorldName =
    String(worldName || "").trim() || (typeof randomWorldName === "function" ? randomWorldName() : "World");
  const generatedWorld = generateWorldPhysicalCharacteristicsWbh({
    baseWorld: {
      name: resolvedWorldName,
      size: resolvedSizeCode,
    },
    worldName: resolvedWorldName,
    starClass: resolvedStarClass,
    size: resolvedSizeCode,
    sizeCode: resolvedSizeCode,
    isGasGiant,
    orbitNumber,
    hzco,
    generateMoons: generateMoonsFlag,
    moonProfileFactory: ({ worldName: moonName, sizeCode: moonSizeCode }) =>
      generateWorldPhysicalCharacteristicsWbh({
        baseWorld: {
          name: moonName,
          size: moonSizeCode,
        },
        worldName: moonName,
        starClass: resolvedStarClass,
        sizeCode: moonSizeCode,
        orbitNumber,
        hzco,
        isMoon: true,
        generateMoons: false,
      }),
  });

  const atmosphereCode = Number(generatedWorld.atmosphereCode ?? 0);
  const hydrographics = Number(generatedWorld.hydrographics ?? 0);
  const worldSizeForUwp = Number(generatedWorld.size ?? resolvedSizeCode ?? 0);
  const socialOverlay = deriveSocialUwp({
    world: {
      ...generatedWorld,
      orbitNumber,
      hzco,
    },
    isMainworld: true,
  });
  const uwp = `${socialOverlay.starport}${toHex(worldSizeForUwp)}${toHex(atmosphereCode)}${toHex(hydrographics)}${toHex(socialOverlay.populationCode)}${toHex(socialOverlay.governmentCode)}${toHex(socialOverlay.lawLevel)}-${toHex(socialOverlay.techLevel)}`;
  const economics = {
    importance: socialOverlay.importance,
    resourceRating: socialOverlay.resourceRating,
    habitability: socialOverlay.habitability,
  };
  const remarks = buildWorldRemarks(generatedWorld, socialOverlay);

  return {
    ...generatedWorld,
    name: resolvedWorldName,
    uwp,
    size: generatedWorld.size ?? resolvedSizeCode,
    ...socialOverlay,
    economics,
    remarks,
  };
}

export function hasStoredWorldProfile(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  return ["uwp", "size", "atmosphereCode", "nativeSophontLife", "tradeCodes"].some((key) => record[key] !== undefined);
}

export function extractStoredWorldProfile(record) {
  if (!hasStoredWorldProfile(record)) {
    return null;
  }

  return WORLD_PROFILE_FIELDS.reduce((profile, key) => {
    if (record[key] !== undefined) {
      profile[key] = Array.isArray(record[key]) ? [...record[key]] : record[key];
    }
    return profile;
  }, {});
}

export function applyWorldProfileToPlanet(planet, worldProfile) {
  return {
    ...(planet && typeof planet === "object" ? planet : {}),
    ...(worldProfile && typeof worldProfile === "object" ? worldProfile : {}),
    tradeCodes: Array.isArray(worldProfile?.tradeCodes) ? [...worldProfile.tradeCodes] : [],
    remarks: Array.isArray(worldProfile?.remarks) ? [...worldProfile.remarks] : [],
    economics:
      worldProfile?.economics && typeof worldProfile.economics === "object" ? { ...worldProfile.economics } : undefined,
  };
}
