import { generateObjectName } from "./nameGenerator.js";
import {
  applyWorldProfileToPlanet,
  generateAutomaticWorldName,
  generateWorldProfile,
} from "./worldProfileGenerator.js";

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

const PLANET_TYPES = ["Rocky", "Super-Earth", "Gas Giant", "Ice Giant", "Dwarf Planet", "Asteroid Belt"];

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

function calcHabitableZone(luminosity) {
  const safeLuminosity = Math.max(Number(luminosity) || 0, 0.0001);
  const inner = +Math.sqrt(safeLuminosity / 1.1).toFixed(2);
  const outer = +Math.sqrt(safeLuminosity / 0.53).toFixed(2);
  const frost = +(Math.sqrt(safeLuminosity / 0.04) * 0.5).toFixed(2);
  return { innerAU: Math.max(inner, 0.01), outerAU: outer, frostLineAU: frost };
}

function planetZone(orbitAU, habitableZone) {
  if (orbitAU < habitableZone.innerAU) return "hot";
  if (orbitAU <= habitableZone.outerAU) return "habitable";
  if (orbitAU <= habitableZone.frostLineAU) return "warm";
  return "cold";
}

function buildPlanets(habitableZone, namingOptions = {}) {
  const count = 2 + Math.floor(Math.random() * 7);
  const planets = [];
  const usedNames = new Set();
  let orbitAU = 0.3 + Math.random() * 0.4;

  for (let index = 0; index < count; index += 1) {
    const type = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
    const roundedOrbit = +orbitAU.toFixed(2);
    const name =
      type === "Asteroid Belt"
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

    planets.push({
      name,
      type,
      orbitAU: roundedOrbit,
      zone: planetZone(roundedOrbit, habitableZone),
    });
    orbitAU *= 1.5 + Math.random() * 0.8;
  }

  return planets;
}

export function buildPersistedSurveySystemFromHex({ galaxyId, sectorId, hex, namingOptions = {} }) {
  const primary = resolveStarRecord(hex?.anomalyType || hex?.starType || "G2V");
  const companionStars = Array.isArray(hex?.secondaryStars)
    ? hex.secondaryStars.map((starType, index) => resolveStarRecord(starType, index === 0 ? "Near" : "Far"))
    : [];
  const stars = [primary, ...companionStars];
  const habitableZone = calcHabitableZone(primary.luminosity);
  const planets = buildPlanets(habitableZone, namingOptions).map((planet) =>
    applyWorldProfileToPlanet(
      planet,
      generateWorldProfile({
        worldName: planet.name,
        starClass: primary.designation || primary.spectralClass,
        randomWorldName: () => planet.name,
      }),
    ),
  );
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
    metadata: {
      generatedSurvey: {
        stars,
      },
      generatedWorldProfilesAt: nowIso,
      lastModified: nowIso,
    },
  };
}
