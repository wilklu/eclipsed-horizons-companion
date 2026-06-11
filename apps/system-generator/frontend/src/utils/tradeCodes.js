export const TRADE_CODE_DETAILS = Object.freeze({
  Ag: Object.freeze({
    name: "Agricultural",
    definition: "World conditions favor farming, food production, and agricultural exports.",
  }),
  As: Object.freeze({
    name: "Asteroid Belt",
    definition: "A planetoid or asteroid belt with scattered bodies and extractive potential.",
  }),
  Ba: Object.freeze({
    name: "Barren",
    definition: "No permanent population, functioning government, or meaningful law level.",
  }),
  De: Object.freeze({
    name: "Desert",
    definition: "Arid world with little or no standing surface water.",
  }),
  Fl: Object.freeze({
    name: "Fluid Oceans",
    definition: "Surface liquids are present, but they are hostile or non-water chemistries.",
  }),
  Ga: Object.freeze({
    name: "Garden",
    definition: "A notably hospitable world with broadly comfortable living conditions.",
  }),
  Hi: Object.freeze({
    name: "High Population",
    definition: "Dense settlement and very large population concentrations define the world.",
  }),
  Ht: Object.freeze({
    name: "High Technology",
    definition: "The world maintains an advanced technological base by Traveller standards.",
  }),
  Ic: Object.freeze({
    name: "Ice-Capped",
    definition: "Cold conditions and significant ice dominate the environment.",
  }),
  In: Object.freeze({
    name: "Industrial",
    definition: "Heavy industry, processing capacity, and large-scale production dominate the economy.",
  }),
  Lo: Object.freeze({
    name: "Low Population",
    definition: "The world is inhabited, but only by a sparse permanent population.",
  }),
  Lt: Object.freeze({
    name: "Low Technology",
    definition: "The world is inhabited but operates below the common interstellar technology baseline.",
  }),
  Na: Object.freeze({
    name: "Non-Agricultural",
    definition: "The world lacks the conditions needed for strong agricultural output and food surpluses.",
  }),
  Ni: Object.freeze({
    name: "Non-Industrial",
    definition: "Population exists, but the world lacks the scale for major industrial output.",
  }),
  Po: Object.freeze({
    name: "Poor",
    definition: "Thin resources and marginal environmental support limit local prosperity.",
  }),
  Ri: Object.freeze({
    name: "Rich",
    definition: "Favorable conditions support high productivity, strong commerce, and broad prosperity.",
  }),
  Va: Object.freeze({
    name: "Vacuum",
    definition: "No breathable atmosphere is present on the world.",
  }),
  Wa: Object.freeze({
    name: "Water World",
    definition: "Surface water dominates the planet on a near-global scale.",
  }),
});

export function getTradeCodeDetails(code) {
  const normalized = String(code || "").trim();
  return TRADE_CODE_DETAILS[normalized] || null;
}

export function formatTradeCodeTooltip(code) {
  const normalized = String(code || "").trim();
  if (!normalized) return "";

  const details = getTradeCodeDetails(normalized);
  if (!details) return normalized;
  return `${normalized} — ${details.name}: ${details.definition}`;
}
