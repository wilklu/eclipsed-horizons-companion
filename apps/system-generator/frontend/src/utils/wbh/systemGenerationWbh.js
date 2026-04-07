export const SYSTEM_WBH_RULES = Object.freeze([
  {
    id: "world-types-and-quantities",
    section: "Chapter 4 > World Types and Quantities",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "available-orbits-hzco",
    section: "Chapter 4 > Available Orbits and Determining Habitable Zone Centre Orbit#",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "placement-of-worlds",
    section: "Chapter 4 > Placement of Worlds",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "world-sizing-moons",
    section: "Chapter 4 > Basic World Sizing, Significant Moons, Significant Moon Size",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "mainworld-candidate",
    section: "Chapter 4 > Mainworld Candidate",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
]);

const ORBIT_TABLE = Object.freeze([
  { orbit: 0, distanceAu: 0, differenceAu: 0.4 },
  { orbit: 1, distanceAu: 0.4, differenceAu: 0.3 },
  { orbit: 2, distanceAu: 0.7, differenceAu: 0.3 },
  { orbit: 3, distanceAu: 1.0, differenceAu: 0.6 },
  { orbit: 4, distanceAu: 1.6, differenceAu: 1.2 },
  { orbit: 5, distanceAu: 2.8, differenceAu: 2.4 },
  { orbit: 6, distanceAu: 5.2, differenceAu: 4.8 },
  { orbit: 7, distanceAu: 10, differenceAu: 10 },
  { orbit: 8, distanceAu: 20, differenceAu: 20 },
  { orbit: 9, distanceAu: 40, differenceAu: 37 },
  { orbit: 10, distanceAu: 77, differenceAu: 77 },
  { orbit: 11, distanceAu: 154, differenceAu: 154 },
  { orbit: 12, distanceAu: 308, differenceAu: 307 },
  { orbit: 13, distanceAu: 615, differenceAu: 615 },
  { orbit: 14, distanceAu: 1230, differenceAu: 1270 },
  { orbit: 15, distanceAu: 2500, differenceAu: 2400 },
  { orbit: 16, distanceAu: 4900, differenceAu: 4900 },
  { orbit: 17, distanceAu: 9800, differenceAu: 9700 },
  { orbit: 18, distanceAu: 19500, differenceAu: 20000 },
  { orbit: 19, distanceAu: 39500, differenceAu: 39200 },
  { orbit: 20, distanceAu: 78700, differenceAu: null },
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getOrbitRow(wholeOrbit) {
  return ORBIT_TABLE.find((entry) => entry.orbit === wholeOrbit) ?? ORBIT_TABLE[ORBIT_TABLE.length - 1];
}

export function getWbhBodyTypes() {
  return ["Gas Giant", "Planetoid Belt", "Terrestrial Planet"];
}

export function calculateWbhTotalWorlds({ gasGiants = 0, planetoidBelts = 0, terrestrialPlanets = 0 } = {}) {
  return Number(gasGiants) + Number(planetoidBelts) + Number(terrestrialPlanets);
}

export function fractionalOrbitToAu(orbitNumber) {
  const numericOrbit = Number(orbitNumber);
  if (!(numericOrbit >= 0)) {
    throw new RangeError("Orbit number must be zero or greater");
  }

  const wholeOrbit = Math.floor(numericOrbit);
  const fractionalPart = numericOrbit - wholeOrbit;
  const row = getOrbitRow(wholeOrbit);
  const differenceAu = row.differenceAu ?? 0;
  return row.distanceAu + differenceAu * fractionalPart;
}

export function auToFractionalOrbit(au) {
  const numericAu = Number(au);
  if (!(numericAu >= 0)) {
    throw new RangeError("AU must be zero or greater");
  }

  let selectedRow = ORBIT_TABLE[0];
  for (const row of ORBIT_TABLE) {
    if (row.distanceAu <= numericAu) {
      selectedRow = row;
    }
  }

  if (!selectedRow.differenceAu) {
    return selectedRow.orbit;
  }

  const fractionalPart = (numericAu - selectedRow.distanceAu) / selectedRow.differenceAu;
  return Number((selectedRow.orbit + fractionalPart).toFixed(4));
}

export function calculateHabitableZoneCenterAu(luminosity) {
  const numericLuminosity = Number(luminosity);
  if (!(numericLuminosity >= 0)) {
    throw new RangeError("Luminosity must be zero or greater");
  }

  return Math.sqrt(numericLuminosity);
}

export function calculateHabitableZoneCenterOrbit(luminosity) {
  return auToFractionalOrbit(calculateHabitableZoneCenterAu(luminosity));
}

export function calculateHzcoDeviation({ orbitNumber, hzco }) {
  return Number(orbitNumber) - Number(hzco);
}

export function calculateEffectiveHzcoDeviation({ orbitNumber, hzco }) {
  const numericOrbit = Number(orbitNumber);
  const numericHzco = Number(hzco);

  if (numericOrbit >= 1 && numericHzco >= 1) {
    return calculateHzcoDeviation({ orbitNumber: numericOrbit, hzco: numericHzco });
  }

  const divisor = Math.min(numericOrbit, numericHzco);
  if (!(divisor > 0)) {
    throw new RangeError("Orbit number and HZCO must be positive for effective deviation");
  }

  return (numericOrbit - numericHzco) / divisor;
}

export function calculatePlanetaryOrbitalPeriod({ orbitNumber, stellarMasses = [] } = {}) {
  const orbitalDistanceAu = fractionalOrbitToAu(orbitNumber);
  const totalMass = stellarMasses.reduce((sum, mass) => sum + Number(mass || 0), 0);
  if (!(totalMass > 0)) {
    throw new RangeError("At least one positive stellar mass is required");
  }

  const years = Math.sqrt(orbitalDistanceAu ** 3 / totalMass);
  return {
    years,
    days: years * 365.25,
    hours: years * 8766,
    orbitalDistanceAu,
  };
}

export function calculateGasGiantPresence({ method = "2d", rollTotal, dieRoll } = {}) {
  if (method === "1d") {
    return Number(dieRoll) >= 2;
  }
  return Number(rollTotal) < 10;
}

export function generateStarSystemWbh(params = {}) {
  const hzco = params.luminosity ? calculateHabitableZoneCenterOrbit(params.luminosity) : null;

  return {
    name: params.name || "Unnamed System",
    generatorModel: "wbh-system-core",
    wbhStatus: "implemented-orbit-hzco-helpers",
    bodyTypes: getWbhBodyTypes(),
    wbhCoverage: SYSTEM_WBH_RULES,
    habitableZoneCenterOrbit: hzco,
    habitableZoneCenterAu: hzco === null ? null : calculateHabitableZoneCenterAu(params.luminosity),
  };
}
