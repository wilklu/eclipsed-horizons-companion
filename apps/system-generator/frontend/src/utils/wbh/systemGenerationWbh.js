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

export function getWbhBodyTypes() {
  return ["Gas Giant", "Planetoid Belt", "Terrestrial Planet"];
}

export function calculateWbhTotalWorlds({ gasGiants = 0, planetoidBelts = 0, terrestrialPlanets = 0 } = {}) {
  return Number(gasGiants) + Number(planetoidBelts) + Number(terrestrialPlanets);
}

export function generateStarSystemWbh(params = {}) {
  return {
    name: params.name || "Unnamed System",
    generatorModel: "wbh-scaffold",
    wbhStatus: "planning-only",
    bodyTypes: getWbhBodyTypes(),
    wbhCoverage: SYSTEM_WBH_RULES,
  };
}
