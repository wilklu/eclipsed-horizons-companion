import { buildWorldLinkedCreatureOptions, createSeededRng } from "./beastGenerator.js";

export const FLORA_GROWTH_FORMS = [
  "Canopy Tree",
  "Spore Fern",
  "Creeping Vine",
  "Bulb Grove",
  "Succulent Tower",
  "Floating Frond",
  "Crystal Moss",
  "Reed Colony",
];

export const FLORA_CLIMATES = [
  "Temperate",
  "Arid",
  "Wetland",
  "Tropical",
  "Alpine",
  "Tundra",
  "Subterranean",
  "Coastal",
];

const ICONS = ["🌿", "🌱", "🌳", "🍃", "🪴", "🌾", "🍄", "🌴"];
const ROOT_NETWORKS = [
  "deep anchor taproot",
  "fibrous web mat",
  "hollow nutrient lattice",
  "tidal rhizome spread",
  "stone-splitting nodules",
  "symbiotic fungal mesh",
];
const WATER_STRATEGIES = [
  "dew capture",
  "seasonal water hoarding",
  "salt filtering",
  "fog siphoning",
  "capillary trunk storage",
  "floodplain cycling",
];
const SOIL_PREFERENCES = [
  "volcanic loam",
  "alkaline dune crust",
  "peat-rich bog beds",
  "limestone shelves",
  "iron-rich clay",
  "orbital hydroponic trays",
];
const REPRODUCTION_STRATEGIES = [
  "seed pods launched by pressure",
  "wind-borne spores",
  "runner shoots",
  "pollinator symbiosis",
  "seasonal bulb splitting",
  "tidal pollination",
];
const COLOURWAYS = [
  "emerald and silver",
  "violet and black",
  "amber and jade",
  "scarlet-veined green",
  "pale blue fronds",
  "bronze waxy leaves",
];
const BLOOM_SHAPES = [
  "lantern-shaped blossoms",
  "spiral pollen cones",
  "umbrella petals",
  "glassy seed bells",
  "ribbon-like fronds",
  "clustered bulb crowns",
];
const SURFACE_TEXTURES = [
  "velvet leaf surfaces",
  "waxy reflective skin",
  "fine crystalline fuzz",
  "ribbed bark plating",
  "translucent petal membranes",
  "braided stem fibers",
];
const LIGHTING_MOODS = [
  "soft dawn light",
  "misty wetland haze",
  "high desert glare",
  "glowing twilight ambience",
  "cool subterranean luminescence",
  "storm-lit horizon light",
];
const ADAPTATIONS = [
  "bioluminescent bloom tips",
  "pressure-sealed seed chambers",
  "toxin-laced sap",
  "mirror-leaf heat deflection",
  "electrostatic pollen nets",
  "night-breathing stomata",
  "ice-crystal antifreeze tissues",
  "rapid wound callusing",
];
const PRIMARY_USES = [
  "medicinal resin",
  "textile fiber",
  "ceremonial incense",
  "high-calorie foodstock",
  "starship biofilter substrate",
  "structural cane",
  "industrial dye",
  "luxury perfume oil",
];
const HAZARD_LEVELS = ["Low", "Moderate", "Elevated", "High"];
const MARKET_APPEAL = ["local staple", "specialist export", "luxury trade good", "restricted cargo"];
const TAGLINES = [
  "a hardy botanical lineage shaped by extreme frontiers",
  "an elegant world-rooted flora prized across nearby trade lanes",
  "a strange bloom whose ecology hints at older planetary cycles",
  "a resilient plant network adapted to volatile local seasons",
  "an iconic species that defines the color and scent of its homeworld",
];
const NAME_PREFIXES = ["Aurel", "Thorn", "Myco", "Luma", "Virel", "Sable", "Tidal", "Cinder", "Vel", "Goss"];
const NAME_SUFFIXES = ["bloom", "reed", "fern", "spire", "vine", "moss", "frond", "root", "crown", "pod"];

function pick(values, rng = Math.random) {
  return values[Math.floor(rng() * values.length)];
}

function shuffle(values, rng = Math.random) {
  return [...values]
    .map((value) => ({ value, order: rng() }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.value);
}

function uniqueEntries(values = []) {
  return [...new Set(values.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function describeClimateBand(climate = "Temperate") {
  const normalized = String(climate || "Temperate");
  if (["Arid", "Tundra", "Subterranean"].includes(normalized)) return "stress-adapted";
  if (["Wetland", "Tropical", "Coastal"].includes(normalized)) return "water-rich";
  return "temperate-stable";
}

export function mapWorldToFloraClimate(world = {}) {
  const terrain = String(buildWorldLinkedCreatureOptions(world).terrain || "").toLowerCase();
  const hydrographics = Number(world?.hydrographics ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 20);

  if (terrain.includes("ocean") || terrain.includes("wet") || hydrographics >= 8) return "Wetland";
  if (terrain.includes("coast") || terrain.includes("shore")) return "Coastal";
  if (terrain.includes("mount") || terrain.includes("precipice")) return "Alpine";
  if (terrain.includes("cavern") || terrain.includes("underground")) return "Subterranean";
  if (hydrographics <= 2 || avgTempC >= 35) return "Arid";
  if (avgTempC <= -5) return "Tundra";
  if (avgTempC >= 28) return "Tropical";
  return "Temperate";
}

export function recommendGrowthForm(climate = "Temperate", rng = Math.random) {
  const lookup = {
    Temperate: ["Canopy Tree", "Bulb Grove", "Creeping Vine"],
    Arid: ["Succulent Tower", "Crystal Moss", "Bulb Grove"],
    Wetland: ["Floating Frond", "Reed Colony", "Spore Fern"],
    Tropical: ["Canopy Tree", "Creeping Vine", "Spore Fern"],
    Alpine: ["Crystal Moss", "Bulb Grove", "Reed Colony"],
    Tundra: ["Crystal Moss", "Spore Fern", "Bulb Grove"],
    Subterranean: ["Spore Fern", "Crystal Moss", "Creeping Vine"],
    Coastal: ["Reed Colony", "Floating Frond", "Canopy Tree"],
  };

  return pick(lookup[String(climate || "Temperate")] || FLORA_GROWTH_FORMS, rng);
}

export function buildWorldLinkedFloraOptions(world = {}) {
  const worldLink = buildWorldLinkedCreatureOptions(world);
  const climate = mapWorldToFloraClimate(world);

  return {
    sourceWorld: {
      ...worldLink.sourceWorld,
      nativeLifeform: String(world?.nativeLifeform || ""),
      nativeSophontLife: Boolean(world?.nativeSophontLife),
    },
    climate,
    growthForm: recommendGrowthForm(climate, createSeededRng(`${worldLink.sourceWorld?.name || "world"}-flora`)),
    origin: world?.nativeLifeform ? "Native floral lineage" : "Imported or engineered stock",
  };
}

export function buildFloraImagePrompt({
  name = "Generated Flora",
  biology = {},
  ecology = {},
  adaptations = [],
  uses = {},
  sourceWorld = null,
} = {}) {
  const growthForm = String(biology?.["Growth Form"] || "alien plant");
  const climate = String(biology?.Climate || "temperate").toLowerCase();
  const height = String(biology?.Height || "medium height");
  const canopy = String(biology?.Canopy || "ornate foliage").toLowerCase();
  const coloration = String(biology?.Coloration || "varied green coloration").toLowerCase();
  const soil = String(ecology?.["Soil Preference"] || "mineral-rich soil").toLowerCase();
  const waterStrategy = String(ecology?.["Water Strategy"] || "efficient moisture capture").toLowerCase();
  const primaryUse = String(uses?.["Primary Use"] || "ecological value").toLowerCase();
  const worldName = String(sourceWorld?.name || "an alien frontier world");
  const featureList =
    Array.isArray(adaptations) && adaptations.length ? adaptations.slice(0, 2).join(", ") : "unusual adaptive traits";

  const visualDescription = `${name} appears as a ${climate} ${growthForm.toLowerCase()} roughly ${height} tall, with ${canopy}, ${coloration}, and ${pick(BLOOM_SHAPES)} supported by ${pick(SURFACE_TEXTURES)}. It grows from ${soil} using ${waterStrategy}, and its most notable traits include ${featureList}.`;
  const imagePrompt = `Detailed botanical concept art of ${name}, an alien ${growthForm.toLowerCase()} on ${worldName}, ${height} tall, ${canopy}, ${coloration}, ${pick(BLOOM_SHAPES)}, ${pick(SURFACE_TEXTURES)}, adapted for ${climate} conditions, growing from ${soil}, hints of ${featureList}, naturalistic sci-fi field-guide style, full plant visible, clean composition, ${pick(LIGHTING_MOODS)}, highly detailed.`;

  return { visualDescription, imagePrompt, imageCaption: `${name} — ${primaryUse} specimen from ${worldName}` };
}

export function generateFloraProfile(options = {}) {
  const {
    seed = "flora-seed",
    name = "Generated Flora",
    growthForm = "random",
    climate = "random",
    sourceWorld = null,
  } = options;
  const rng = createSeededRng(seed);
  const resolvedClimate = climate === "random" ? pick(FLORA_CLIMATES, rng) : climate;
  const resolvedGrowthForm = growthForm === "random" ? recommendGrowthForm(resolvedClimate, rng) : growthForm;
  const adaptationList = shuffle(ADAPTATIONS, rng).slice(0, 3);
  const hazardLevel = pick(HAZARD_LEVELS, rng);
  const primaryUse = pick(PRIMARY_USES, rng);
  const climateBand = describeClimateBand(resolvedClimate);

  const biology = {
    "Growth Form": resolvedGrowthForm,
    Climate: resolvedClimate,
    Height: `${1 + Math.floor(rng() * 18)} m`,
    Canopy: pick(
      ["dense layered crown", "umbrella spread", "spiral fronds", "low clustered pads", "ribboned tendrils"],
      rng,
    ),
    Coloration: pick(COLOURWAYS, rng),
    Reproduction: pick(REPRODUCTION_STRATEGIES, rng),
  };
  const ecology = {
    "Root Network": pick(ROOT_NETWORKS, rng),
    "Water Strategy": pick(WATER_STRATEGIES, rng),
    "Soil Preference": pick(SOIL_PREFERENCES, rng),
    "Seasonal Cycle": pick(
      [
        "brief explosive bloom",
        "evergreen persistence",
        "storm-triggered fruiting",
        "dormant dry-season retreat",
        "night-only flowering",
      ],
      rng,
    ),
    "Climate Band": climateBand,
  };
  const uses = {
    "Primary Use": primaryUse,
    "Hazard Level": hazardLevel,
    "Market Appeal": pick(MARKET_APPEAL, rng),
    "Harvest Window": pick(
      ["year-round", "short monsoon", "winter frost", "double equinox", "high tide alignment"],
      rng,
    ),
  };
  const { visualDescription, imagePrompt, imageCaption } = buildFloraImagePrompt({
    name,
    biology,
    ecology,
    adaptations: adaptationList,
    uses,
    sourceWorld,
  });

  return {
    name,
    icon: pick(ICONS, rng),
    summary: `${name} is ${pick(TAGLINES, rng)}.`,
    biology,
    ecology,
    uses,
    adaptations: adaptationList,
    hooks: [
      `Local traders value it for ${primaryUse}.`,
      `Field teams report ${adaptationList[0] || "resilient growth"} in the wild.`,
      `${resolvedGrowthForm} colonies thrive through ${String(resolvedClimate || "variable").toLowerCase()} cycles.`,
    ],
    visualDescription,
    imagePrompt,
    imageCaption,
    origin: sourceWorld?.nativeLifeform ? "Native floral lineage" : "Imported or engineered stock",
    sourceWorld,
    worldIntegration: {
      summary: `${name} is a ${String(resolvedClimate).toLowerCase()} ${String(resolvedGrowthForm).toLowerCase()} known for ${String(primaryUse).toLowerCase()}.`,
      notes: [
        `Hazard rating holds at ${hazardLevel.toLowerCase()}.`,
        `Typical adaptation profile includes ${adaptationList.join(", ")}.`,
      ],
    },
    seed,
  };
}

export function buildFloraWorldUpdate(record = {}, existingWorld = {}) {
  const growthForm = String(record?.biology?.["Growth Form"] || "Flora cluster");
  const climate = String(record?.biology?.Climate || "Temperate");
  const primaryUse = String(record?.uses?.["Primary Use"] || "general ecological value");
  const hazardLevel = String(record?.uses?.["Hazard Level"] || "Low");
  const summary = `${record?.name || "Linked flora"} is a ${climate.toLowerCase()} ${growthForm.toLowerCase()} valued for ${primaryUse.toLowerCase()}.`;
  const remarks = uniqueEntries([
    ...(Array.isArray(existingWorld?.remarks) ? existingWorld.remarks : []),
    `Flora dossier: ${summary}`,
    `Botanical hazard: ${hazardLevel}.`,
  ]).slice(-8);

  return {
    linkedFloraSummary: {
      id: String(record?.id || ""),
      name: String(record?.name || "Linked flora"),
      growthForm,
      climate,
      primaryUse,
      hazardLevel,
      summary,
      updatedAt: String(record?.updatedAt || new Date().toISOString()),
    },
    secondaryWorldContext: String(existingWorld?.secondaryWorldContext || "").includes(summary)
      ? String(existingWorld?.secondaryWorldContext || summary)
      : existingWorld?.secondaryWorldContext
        ? `${existingWorld.secondaryWorldContext}; ${summary}`
        : summary,
    remarks,
  };
}

export function randomFloraName(seed = "flora-seed") {
  const rng = createSeededRng(seed);
  return `${pick(NAME_PREFIXES, rng)}${pick(NAME_SUFFIXES, rng)}`;
}
