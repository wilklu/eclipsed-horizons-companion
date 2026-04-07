import { generateObjectName } from "./nameGenerator.js";
import { resolveStarDescriptorToken } from "./starDisplay.js";
import {
  applyWorldProfileToPlanet,
  applySystemWorldSocialProfiles,
  generateAutomaticWorldName,
  generateWorldProfile,
} from "./worldProfileGenerator.js";
import {
  calculateHabitableZoneCenterAu,
  calculateHabitableZoneCenterOrbit,
  determineWbhSystemBodyPlan,
  calculatePlanetaryOrbitalPeriod,
  fractionalOrbitToAu,
  getWbhBodyTypes,
} from "./wbh/systemGenerationWbh.js";
import { generateWorldPhysicalCharacteristicsWbh } from "./wbh/worldPhysicalCharacteristicsWbh.js";

const SPECTRAL_TYPES = {
  O: { mass: 40, lum: 100000, temp: 40000 },
  B: { mass: 10, lum: 10000, temp: 20000 },
  A: { mass: 2.0, lum: 25, temp: 8500 },
  F: { mass: 1.4, lum: 4, temp: 6700 },
  G: { mass: 1.0, lum: 1.0, temp: 5800 },
  K: { mass: 0.7, lum: 0.25, temp: 4500 },
  M: { mass: 0.3, lum: 0.04, temp: 3200 },
};

const ANOMALY_TYPES = [
  { code: "Black Hole", designation: "BH", mass: 12, lum: 0, temp: 0, orbitRole: "Singularity" },
  { code: "Pulsar", designation: "PSR", mass: 1.4, lum: 0.001, temp: 600000, orbitRole: "Compact remnant" },
  { code: "Neutron Star", designation: "NS", mass: 1.8, lum: 0.002, temp: 1000000, orbitRole: "Compact remnant" },
  { code: "Quasar Remnant", designation: "QR", mass: 5000000, lum: 0.05, temp: 0, orbitRole: "Remnant core" },
  { code: "Dense Cluster", designation: "CL", mass: 250, lum: 15000, temp: 12000, orbitRole: "Cluster core" },
];

const PLANET_TYPES = getWbhBodyTypes();
const NON_STELLAR_TYPES = Object.freeze({
  D: { designation: "D", spectralClass: "D", massInSolarMasses: 0.6, luminosity: 0.01, temperatureK: 9000 },
  BD: { designation: "BD", spectralClass: "BD", massInSolarMasses: 0.05, luminosity: 0.0005, temperatureK: 1800 },
  L: { designation: "L", spectralClass: "L", massInSolarMasses: 0.04, luminosity: 0.0002, temperatureK: 1500 },
  T: { designation: "T", spectralClass: "T", massInSolarMasses: 0.03, luminosity: 0.00008, temperatureK: 900 },
  Y: { designation: "Y", spectralClass: "Y", massInSolarMasses: 0.02, luminosity: 0.00002, temperatureK: 450 },
  PROTO: {
    designation: "Proto",
    spectralClass: "Protostar",
    massInSolarMasses: 1.2,
    luminosity: 1.5,
    temperatureK: 4200,
  },
  NB: {
    designation: "NB",
    spectralClass: "Nebula",
    massInSolarMasses: 0,
    luminosity: 0.02,
    temperatureK: 0,
    isAnomaly: true,
  },
  CLUSTER: {
    designation: "Cluster",
    spectralClass: "Star Cluster",
    massInSolarMasses: 250,
    luminosity: 15000,
    temperatureK: 12000,
    isAnomaly: true,
  },
  ANOMALY: {
    designation: "Anomaly",
    spectralClass: "Anomaly",
    massInSolarMasses: 1,
    luminosity: 0.1,
    temperatureK: 0,
    isAnomaly: true,
  },
});

function pickPlanetComposition(type, zone) {
  if (type === "Gas Giant") {
    return zone === "cold" || zone === "warm"
      ? "Hydrogen-helium envelope with volatile ices"
      : "Hydrogen-helium envelope";
  }

  if (type === "Planetoid Belt") {
    return zone === "hot" ? "Rocky-metallic debris" : "Rocky-icy debris";
  }

  const terrestrialOptionsByZone = {
    hot: ["Rocky silicates", "Metal-rich rocky body"],
    habitable: ["Rocky silicates", "Rocky with surface volatiles"],
    warm: ["Rocky with volatile deposits", "Rocky-icy crust"],
    cold: ["Icy-rocky body", "Rocky core with ice mantle"],
  };

  const options = terrestrialOptionsByZone[zone] || terrestrialOptionsByZone.habitable;
  return options[Math.floor(Math.random() * options.length)];
}

function resolveAnomalyEntry(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    ANOMALY_TYPES.find(
      (entry) =>
        entry.code.toLowerCase() === normalized ||
        entry.designation.toLowerCase() === normalized ||
        normalized.includes(entry.code.toLowerCase()),
    ) ?? null
  );
}

function resolveStarRecord(starType, orbitType = null) {
  const anomaly = resolveAnomalyEntry(starType);
  if (anomaly) {
    return {
      designation: anomaly.designation,
      spectralClass: anomaly.code,
      massInSolarMasses: anomaly.mass,
      luminosity: anomaly.lum,
      temperatureK: anomaly.temp,
      orbitType: orbitType || anomaly.orbitRole || null,
      isAnomaly: true,
    };
  }

  const nonStellar = NON_STELLAR_TYPES[resolveStarDescriptorToken(starType, "G")];
  if (nonStellar) {
    return {
      ...nonStellar,
      orbitType,
    };
  }

  const raw = String(starType || "G2V").trim() || "G2V";
  const code = raw.charAt(0).toUpperCase();
  const base = SPECTRAL_TYPES[code] ?? SPECTRAL_TYPES.G;
  return {
    designation: raw,
    spectralClass: raw,
    massInSolarMasses: base.mass,
    luminosity: base.lum,
    temperatureK: base.temp,
    orbitType,
  };
}

function calcHabitableZone(stars) {
  const luminosity = (Array.isArray(stars) ? stars : []).reduce((sum, star) => sum + Number(star?.luminosity || 0), 0);
  const centerAU = calculateHabitableZoneCenterAu(luminosity);
  const centerOrbit = calculateHabitableZoneCenterOrbit(luminosity);
  const innerAU = fractionalOrbitToAu(Math.max(0, centerOrbit - 1));
  const outerAU = fractionalOrbitToAu(centerOrbit + 1);
  const legacyFrost = Math.sqrt(Math.max(luminosity, 0) / 0.04) * 0.5;
  const frost = Math.max(outerAU + Math.max(outerAU - innerAU, 0.1), legacyFrost);

  return {
    centerAU: +centerAU.toFixed(2),
    centerOrbit: +centerOrbit.toFixed(2),
    innerAU: +innerAU.toFixed(2),
    outerAU: +outerAU.toFixed(2),
    frostLineAU: +frost.toFixed(2),
  };
}

function planetZone(orbitAU, habitableZone) {
  if (orbitAU < habitableZone.innerAU) return "hot";
  if (orbitAU <= habitableZone.outerAU) return "habitable";
  if (orbitAU <= habitableZone.frostLineAU) return "warm";
  return "cold";
}

function buildPlanets(habitableZone, stars, namingOptions = {}) {
  const plan = determineWbhSystemBodyPlan({ stars });
  const usedNames = new Set();
  return plan.planets.map((body) => {
    const type = body.type;
    const roundedOrbit = Number(body.orbitAU ?? fractionalOrbitToAu(body.orbitNumber).toFixed(2));
    const zone = body.zone || planetZone(roundedOrbit, habitableZone);
    const name =
      type === "Planetoid Belt"
        ? generateObjectName({
            mode: String(namingOptions.asteroidBeltNameMode || "phonotactic")
              .trim()
              .toLowerCase(),
            objectType: "asteroid-belt",
            mythicTheme: String(namingOptions.galaxyMythicTheme || "all")
              .trim()
              .toLowerCase(),
          })
        : generateAutomaticWorldName({
            mode: namingOptions.worldNameMode,
            usedNames,
          });

    usedNames.add(name);
    const period = calculatePlanetaryOrbitalPeriod({
      orbitNumber: body.orbitNumber,
      stellarMasses: body.stellarMasses,
    });

    return {
      name,
      type,
      composition: pickPlanetComposition(type, zone),
      orbitNumber: body.orbitNumber,
      orbitAU: roundedOrbit,
      orbitalPeriodDays: Math.round(period.days),
      zone,
      hzco: body.hzco,
      orbitGroup: body.groupLabel,
      isAnomalousOrbit: Boolean(body.isAnomalous),
    };
  });
}

export function buildPersistedSurveySystemFromHex({ galaxyId, sectorId, hex, namingOptions = {} }) {
  const primary = resolveStarRecord(hex?.anomalyType || hex?.starType || "G2V");
  const companionStars = Array.isArray(hex?.secondaryStars)
    ? hex.secondaryStars.map((starType, index) => resolveStarRecord(starType, index === 0 ? "Near" : "Far"))
    : [];
  const stars = [primary, ...companionStars];
  const habitableZone = calcHabitableZone(stars);
  const primaryWorldStarClass = primary.designation || primary.spectralClass;
  const profiledPlanets = buildPlanets(habitableZone, stars, namingOptions).map((planet) => {
    const baseProfile = generateWorldProfile({
      worldName: planet.name,
      starClass: primaryWorldStarClass,
      randomWorldName: () => planet.name,
      isGasGiant: planet.type === "Gas Giant",
      orbitNumber: planet.orbitNumber,
      hzco: planet.hzco,
    });
    const enrichedProfile =
      planet.type === "Gas Giant"
        ? baseProfile
        : generateWorldPhysicalCharacteristicsWbh({
            ...baseProfile,
            baseWorld: baseProfile,
            worldName: planet.name,
            starClass: primaryWorldStarClass,
            sizeCode: planet.type === "Planetoid Belt" ? "0" : baseProfile.size,
            orbitNumber: planet.orbitNumber,
            hzco: habitableZone.centerOrbit,
            systemAgeGyr: Number(primary.systemAge ?? 5),
            stellarMasses: stars.map((star) => Number(star?.massInSolarMasses ?? 0)),
          });

    return applyWorldProfileToPlanet(planet, enrichedProfile);
  });
  const planets = applySystemWorldSocialProfiles(profiledPlanets);
  const mainworld = planets.find((world) => world?.isMainworld) ?? null;
  const nowIso = new Date().toISOString();

  return {
    systemId: `${sectorId}:${String(hex?.coord || "0000").trim()}`,
    galaxyId,
    sectorId,
    hexCoordinates: {
      x: Number(String(hex?.coord || "0000").slice(0, 2)) || 0,
      y: Number(String(hex?.coord || "0000").slice(2, 4)) || 0,
    },
    starCount: stars.length,
    stars,
    primaryStar: primary, // Always full star object
    companionStars: companionStars,
    habitableZone,
    planets,
    mainworld,
    mainworldName: mainworld?.name ?? "",
    mainworldType: mainworld?.isMoon ? "Moon" : (mainworld?.type ?? ""),
    mainworldParentWorldName: mainworld?.parentWorldName ?? "",
    mainworldUwp: mainworld?.uwp ?? "",
    nativeLifeform: mainworld?.nativeLifeform ?? "",
    habitability: mainworld?.habitability ?? "",
    resourceRating: mainworld?.resourceRating ?? "",
    tradeCodes: Array.isArray(mainworld?.tradeCodes) ? [...mainworld.tradeCodes] : [],
    mainworldRemarks: Array.isArray(mainworld?.remarks) ? [...mainworld.remarks] : [],
    metadata: {
      generatedSurvey: {
        stars,
      },
      generatedWorldProfilesAt: nowIso,
      lastModified: nowIso,
    },
  };
}
