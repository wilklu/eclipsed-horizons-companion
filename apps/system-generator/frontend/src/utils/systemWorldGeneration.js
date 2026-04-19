import {
  applySystemWorldSocialProfiles,
  applyWorldProfileToPlanet,
  generateWorldProfile,
} from "./worldProfileGenerator.js";
import {
  calculateHabitableZoneCenterAu,
  calculateHabitableZoneCenterOrbit,
  calculateSystemLayoutAnchorOrbit,
  calculatePlanetaryOrbitalPeriod,
  determineWbhSystemBodyPlan,
  fractionalOrbitToAu,
} from "./wbh/systemGenerationWbh.js";
import { generateWorldPhysicalCharacteristicsWbh } from "./wbh/worldPhysicalCharacteristicsWbh.js";

export function calculateSystemHabitableZone(stars = []) {
  const luminosity = (Array.isArray(stars) ? stars : []).reduce((sum, star) => sum + Number(star?.luminosity || 0), 0);
  const hasRadiantHabitableZone = luminosity > 0;
  const centerOrbit = hasRadiantHabitableZone
    ? calculateHabitableZoneCenterOrbit(luminosity)
    : calculateSystemLayoutAnchorOrbit(stars);
  const centerAU = hasRadiantHabitableZone
    ? calculateHabitableZoneCenterAu(luminosity)
    : fractionalOrbitToAu(centerOrbit);
  const innerAU = fractionalOrbitToAu(Math.max(0, centerOrbit - 1));
  const outerAU = fractionalOrbitToAu(centerOrbit + 1);
  const legacyFrost = Math.sqrt(Math.max(luminosity, 0) / 0.04) * 0.5;
  const frost = Math.max(outerAU + Math.max(outerAU - innerAU, 0.1), legacyFrost);

  return {
    hasRadiantHabitableZone,
    centerAU: +centerAU.toFixed(2),
    centerOrbit: +centerOrbit.toFixed(2),
    innerAU: +innerAU.toFixed(2),
    outerAU: +outerAU.toFixed(2),
    frostLineAU: +frost.toFixed(2),
  };
}

export function determineSystemPlanetZone(orbitAU, habitableZone) {
  const numericOrbit = Number(orbitAU);
  const innerAU = Number(habitableZone?.innerAU ?? 0);
  const outerAU = Math.max(innerAU, Number(habitableZone?.outerAU ?? innerAU));
  const frostLineAU = Math.max(outerAU, Number(habitableZone?.frostLineAU ?? outerAU));
  const warmBoundaryAU = innerAU > 0 ? innerAU * 0.5 : 0;

  if (!Number.isFinite(numericOrbit)) return "cold";
  if (numericOrbit < warmBoundaryAU) return "hot";
  if (numericOrbit < innerAU) return "warm";
  if (numericOrbit <= outerAU) return "habitable";
  if (numericOrbit <= frostLineAU) return "cold";
  return "frozen";
}

export function pickSystemPlanetComposition(type, zone) {
  if (type === "Gas Giant") {
    return ["warm", "cold", "frozen"].includes(zone)
      ? "Hydrogen-helium envelope with volatile ices"
      : "Hydrogen-helium envelope";
  }

  if (type === "Planetoid Belt") {
    return zone === "hot" ? "Rocky-metallic debris" : "Rocky-icy debris";
  }

  const terrestrialOptionsByZone = {
    hot: ["Rocky silicates", "Metal-rich rocky body"],
    warm: ["Rocky silicates", "Rocky with surface volatiles"],
    habitable: ["Rocky with surface volatiles", "Temperate rocky world"],
    cold: ["Rocky-icy crust", "Icy-rocky body"],
    frozen: ["Ice-locked rocky body", "Rocky core with deep ice mantle"],
  };

  const options = terrestrialOptionsByZone[zone] || terrestrialOptionsByZone.habitable;
  return options[Math.floor(Math.random() * options.length)];
}

function resolvePlanetOrbitSortValue(planet = {}) {
  const orbitAu = Number(planet?.orbitAU ?? planet?.orbitAu);
  if (Number.isFinite(orbitAu)) {
    return orbitAu;
  }

  const orbitNumber = Number(planet?.orbitNumber);
  if (Number.isFinite(orbitNumber)) {
    return orbitNumber;
  }

  return Number.POSITIVE_INFINITY;
}

export function sortSystemPlanetsByOrbit(planets = []) {
  return [...(Array.isArray(planets) ? planets : [])].sort((left, right) => {
    const orbitDelta = resolvePlanetOrbitSortValue(left) - resolvePlanetOrbitSortValue(right);
    if (orbitDelta !== 0) {
      return orbitDelta;
    }

    const moonDelta = Number(Boolean(left?.isMoon)) - Number(Boolean(right?.isMoon));
    if (moonDelta !== 0) {
      return moonDelta;
    }

    const slotDelta =
      Number(left?.orbitalSlot ?? Number.POSITIVE_INFINITY) - Number(right?.orbitalSlot ?? Number.POSITIVE_INFINITY);
    if (Number.isFinite(slotDelta) && slotDelta !== 0) {
      return slotDelta;
    }

    return String(left?.name || "").localeCompare(String(right?.name || ""));
  });
}

export function buildProfiledWbhSystemPlanets({
  stars = [],
  habitableZone = calculateSystemHabitableZone(stars),
  createPlanetName,
  pickPlanetComposition = pickSystemPlanetComposition,
} = {}) {
  const plan = determineWbhSystemBodyPlan({ stars });
  const usedNames = new Set();
  const primaryWorldStarClass = stars[0]?.designation || stars[0]?.spectralClass || "G";
  const stellarMasses = stars.map((star) => Number(star?.massInSolarMasses ?? 0));
  const systemAgeGyr = Number(stars[0]?.systemAge ?? 5);

  const plannedPlanets = plan.planets.map((body, index) => {
    const type = body.type;
    const orbitNumber = body.orbitNumber;
    const orbitAU = Number(body.orbitAU ?? fractionalOrbitToAu(orbitNumber).toFixed(2));
    const zone = body.zone || determineSystemPlanetZone(orbitAU, habitableZone);
    const generatedName =
      typeof createPlanetName === "function"
        ? createPlanetName({ body, index, type, zone, usedNames })
        : `World ${index + 1}`;
    const name = String(generatedName || `World ${index + 1}`).trim() || `World ${index + 1}`;
    usedNames.add(name);

    const period = calculatePlanetaryOrbitalPeriod({
      orbitNumber,
      stellarMasses: body.stellarMasses,
    });

    return {
      name,
      type,
      composition: pickPlanetComposition(type, zone),
      orbitNumber,
      orbitAU,
      orbitalPeriodDays: Math.round(period.days),
      zone,
      hzco: body.hzco,
      orbitGroup: body.groupLabel,
      isAnomalousOrbit: Boolean(body.isAnomalous),
    };
  });

  const profiledPlanets = plannedPlanets.map((planet) => {
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
            hzco: planet.hzco ?? habitableZone.centerOrbit,
            systemAgeGyr,
            stellarMasses,
          });

    return applyWorldProfileToPlanet(planet, enrichedProfile);
  });

  return sortSystemPlanetsByOrbit(applySystemWorldSocialProfiles(profiledPlanets));
}
