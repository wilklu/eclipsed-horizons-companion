import { generatePrimaryStar } from "../primaryStarGenerator.js";

export const STAR_WBH_RULES = Object.freeze([
  {
    id: "primary-star-types",
    section: "Chapter 3 > Primary Star > Primary Star Types",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-subtypes",
    section: "Chapter 3 > Primary Star > Subtypes",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-mass-temperature",
    section: "Chapter 3 > Star Mass and Temperature",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
  {
    id: "star-diameter-luminosity",
    section: "Chapter 3 > Star Diameter and Star Luminosity",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "system-age",
    section: "Chapter 3 > System Age",
    source: "docs/reference/World Builder's Handbook.md",
    status: "partial",
  },
  {
    id: "multiple-stars",
    section: "Chapter 3 > Systems With Multiple Stars",
    source: "docs/reference/World Builder's Handbook.md",
    status: "planned",
  },
]);

export function calculateWbhLuminosity({ diameter, temperature, solarTemperature = 5772 }) {
  const safeDiameter = Number(diameter);
  const safeTemperature = Number(temperature);

  if (!(safeDiameter > 0) || !(safeTemperature > 0) || !(solarTemperature > 0)) {
    throw new RangeError("Diameter and temperature must be positive numbers");
  }

  return safeDiameter ** 2 * (safeTemperature / solarTemperature) ** 4;
}

export function calculateMainSequenceLifespan(mass) {
  const safeMass = Number(mass);
  if (!(safeMass > 0)) {
    throw new RangeError("Mass must be a positive number");
  }

  return 10 / safeMass ** 2.5;
}

export function calculateSubgiantLifespan({ mainSequenceLifespan, mass }) {
  const safeMainSequenceLifespan = Number(mainSequenceLifespan);
  const safeMass = Number(mass);

  if (!(safeMainSequenceLifespan > 0) || !(safeMass > 0)) {
    throw new RangeError("Main sequence lifespan and mass must be positive numbers");
  }

  return safeMainSequenceLifespan / (4 + safeMass);
}

export function calculateGiantLifespan({ mainSequenceLifespan, mass }) {
  const safeMainSequenceLifespan = Number(mainSequenceLifespan);
  const safeMass = Number(mass);

  if (!(safeMainSequenceLifespan > 0) || !(safeMass > 0)) {
    throw new RangeError("Main sequence lifespan and mass must be positive numbers");
  }

  return safeMainSequenceLifespan / (10 * safeMass ** 3);
}

export function generatePrimaryStarWbh(params = {}) {
  const fallbackStar = generatePrimaryStar(params);

  return {
    ...fallbackStar,
    generatorModel: "wbh-scaffold",
    wbhStatus: "fallback-heuristic",
    wbhCoverage: STAR_WBH_RULES,
  };
}
