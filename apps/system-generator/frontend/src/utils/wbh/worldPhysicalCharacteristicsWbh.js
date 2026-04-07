import { generateWorldProfile } from "../worldProfileGenerator.js";

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

export function isBeltLikeSizeZeroWorld(world = {}) {
  return (
    Number(world?.size) === 0 &&
    String(world?.worldType || "")
      .toLowerCase()
      .includes("belt")
  );
}

export function generateWorldPhysicalCharacteristicsWbh(params = {}) {
  const fallbackWorld = generateWorldProfile(params);

  return {
    ...fallbackWorld,
    generatorModel: "wbh-scaffold",
    wbhStatus: "fallback-heuristic",
    wbhCoverage: WORLD_PHYSICAL_CHARACTERISTIC_RULES,
  };
}
