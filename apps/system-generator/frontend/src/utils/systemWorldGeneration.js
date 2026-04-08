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
  if (orbitAU < habitableZone.innerAU) return "hot";
  if (orbitAU <= habitableZone.outerAU) return "habitable";
  if (orbitAU <= habitableZone.frostLineAU) return "warm";
  return "cold";
}

export function pickSystemPlanetComposition(type, zone) {
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

  return applySystemWorldSocialProfiles(profiledPlanets);
}
