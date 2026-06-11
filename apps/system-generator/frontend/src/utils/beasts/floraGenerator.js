import {
  buildWorldLinkedCreatureOptions,
  createSeededRng,
  generateGuidSeed,
  getWorldAvailableCreatureTerrains,
} from "./beastGenerator.js";
import { buildLifeTaxonomy, buildLineageProfile } from "./taxonomy.js";

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
export const FLORA_ROOT_NETWORK_ARCHITECTURE = [
  "radial sinker",
  "lateral fan",
  "heart-shaped plexus",
  "multi-tier terrace",
  "spiral tendril",
  "reticulated mesh",
  "crisscross ladder",
  "convergent delta",
  "candelabra fork",
  "helical bore",
  "collimated beam",
  "fractal dendritic",
];
export const FLORA_ROOT_NETWORK_SUBSTRATE = [
  "granitic scree",
  "compacted loam",
  "calcareous silt",
  "peat bog",
  "volcanic tuff",
  "saline marsh",
  "permafrost wedge",
  "limestone karst",
  "alluvial sand",
  "clay pan",
];
export const FLORA_ROOT_NETWORK_STRATEGY = [
  "taproot anchor",
  "resource hoard",
  "allelopathic ring",
  "mycorrhizal relay",
  "scavenger sprawl",
  "pioneer spread",
  "parasitic tap",
  "symbiotic mesh",
  "fire-resprout vault",
  "seasonal pulse",
];
export const FLORA_ROOT_NETWORK_TISSUE = [
  "succulent",
  "lignified",
  "corky bark",
  "crystal-laced",
  "hollow pith",
  "fibrous sheath",
  "mucilaginous",
  "aerenchymous",
  "tannin-rich",
  "resin-impregnated",
];
export const FLORA_WATER_STRATEGY_SOURCE = [
  "fog drip",
  "dew film",
  "rain pulse",
  "ground seep",
  "flood surge",
  "snowmelt trickle",
  "cloud interception",
  "hygroscopic harvest",
  "stemflow funnel",
  "overland sheet flow",
];
export const FLORA_WATER_STRATEGY_MECHANISM = [
  "capillary wicking",
  "pressure osmosis",
  "suction draw",
  "gravitational drain",
  "vapor sorption",
  "guttation pump",
  "pneumatic lift",
  "tension conduit",
  "wax-channel channeling",
  "hydraulic redistribution",
];
export const FLORA_WATER_STRATEGY_STORAGE = [
  "trunk cistern",
  "bulb reservoir",
  "air-root bladder",
  "leaf-bract cupping",
  "xylem tank",
  "cortex sponge",
  "pith well",
  "surface film",
  "subterranean cistern",
  "cuticular wax seal",
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
export const COLOURWAY_PALETTE = [
  "emerald and silver",
  "violet and black",
  "amber and jade",
  "scarlet-veined green",
  "pale blue fronds",
  "bronze waxy leaves",
  "copper-tipped indigo",
  "pearl-white with crimson veining",
];

export const COLOUR_HUE_MEANINGS = [
  { prefix: "pale", meaning: "light, washed out" },
  { prefix: "light", meaning: "bright, high value" },
  { prefix: "soft", meaning: "muted, low saturation" },
  { prefix: "bright", meaning: "vivid, saturated" },
  { prefix: "deep", meaning: "dark, intense" },
  { prefix: "rich", meaning: "saturated, luxurious" },
  { prefix: "muted", meaning: "greyed, subdued" },
  { prefix: "dusty", meaning: "grey-toned, powdery" },
  { prefix: "pastel", meaning: "soft and light" },
  { prefix: "vivid", meaning: "extremely saturated" },
  { prefix: "neon", meaning: "fluorescent, electric" },
  { prefix: "electric", meaning: "intensely bright" },
  { prefix: "hot", meaning: "warm and intense" },
  { prefix: "cool", meaning: "blue-toned" },
  { prefix: "warm", meaning: "red/yellow-toned" },
  { prefix: "dark", meaning: "low value, shadowy" },
  { prefix: "shadowy", meaning: "very dark, near-black" },
  { prefix: "milky", meaning: "white-toned, opaque" },
  { prefix: "creamy", meaning: "warm-white toned" },
  { prefix: "smoky", meaning: "grey-toned, hazy" },
  { prefix: "bleached", meaning: "extremely light, whitened" },
  { prefix: "washed", meaning: "faded, desaturated" },
  { prefix: "dirty", meaning: "grey-brown toned, muddy" },
  { prefix: "clear", meaning: "pure, transparent-bright" },
  { prefix: "sheer", meaning: "translucent, delicate" },
];

export const COLOUR_HUE_SUFFIX_EXAMPLES = {
  red: ["coral", "rose", "ruby"],
  orange: ["tangerine", "apricot"],
  yellow: ["lemon", "gold", "butter"],
  green: ["lime", "emerald", "moss"],
  blue: ["sky", "cobalt", "navy"],
  purple: ["violet", "plum", "amethyst"],
  pink: ["rose", "blush", "magenta"],
  brown: ["tan", "taupe", "chocolate"],
  grey: ["slate", "ash", "dove"],
  white: ["cream", "ivory", "snow"],
  black: ["jet", "ink", "charcoal"],
  cyan: ["teal", "aqua", "turquoise"],
  magenta: ["fuchsia", "hot pink"],
  lavender: ["lilac", "wisteria"],
  coral: ["salmon", "melon"],
  mint: ["seafoam", "sage"],
  peach: ["nectarine", "apricot"],
  plum: ["damson", "aubergine"],
  slate: ["steel", "blue-grey"],
  olive: ["khaki", "chartreuse"],
  burgundy: ["wine", "maroon"],
  gold: ["honey", "amber"],
  silver: ["pewter", "platinum"],
  copper: ["rust", "terracotta"],
  bronze: ["patina", "verdigris"],
};

export const COLOUR_EFFECT_PREFIX_MEANINGS = {
  translucent: "semi-transparent, light passes through",
  frosted: "cloudy, hazy, diffused",
  velvet: "soft, matte, plush",
  gloss: "shiny, reflective",
  matte: "flat, non-reflective",
  satin: "soft sheen, between matte and gloss",
  metallic: "shiny like metal",
  shimmering: "sparkling, glittering",
  glittering: "sparkling with tiny flashes",
  glowing: "emitting light, luminous",
  luminous: "light-emitting, radiant",
  pearlescent: "iridescent like pearl",
  opalescent: "shifting colors like opal",
  iridescent: "rainbow-shifting",
  burnished: "polished, rubbed smooth",
  dulled: "intentionally subdued",
  dusty: "powdery surface",
  waxy: "smooth, slightly greasy sheen",
  glossy: "high-shine, mirror-like",
  silken: "smooth, fine, soft",
  crystalline: "clear, faceted, glass-like",
  watery: "fluid, translucent, thin",
  milky: "opaque white, soft",
  smoky: "hazy, darkly translucent",
  sheer: "very thin, barely-there color",
};

export const COLOUR_EFFECT_SUFFIX_MEANINGS = {
  finish: "general surface appearance",
  gloss: "shiny reflective quality",
  glow: "light-emitting quality",
  sheen: "soft reflective quality",
  shimmer: "subtle sparkle",
  sparkle: "tiny bright reflections",
  luster: "soft, rich shine",
  patina: "aged, developed surface",
  bloom: "powdery or waxy coating",
  veil: "thin, transparent overlay",
  haze: "diffused, unclear surface",
  glaze: "glassy, smooth coating",
  polish: "smooth, rubbed shine",
  texture: "surface feel, not smooth",
  coat: "even, applied layer",
  layer: "stacked, multi-depth",
  wash: "thin, dilute application",
  stain: "absorbed color effect",
  tint: "very subtle color effect",
  tone: "overall color cast",
  cast: "reflected color shift",
  flash: "brief bright reflection",
  gleam: "narrow, bright shine",
  opalescence: "color-shifting effect",
  fluorescence: "light-activated glow",
};

export const COLOUR_HUE_SUFFIX_MEANINGS = {
  red: "base color is red",
  orange: "base color is orange",
  yellow: "base color is yellow",
  green: "base color is green",
  blue: "base color is blue",
  purple: "base color is purple",
  pink: "base color is pink",
  brown: "base color is brown",
  grey: "base color is grey",
  white: "base color is white",
  black: "base color is black",
  cyan: "base color is cyan",
  magenta: "base color is magenta",
  lavender: "base color is lavender",
  coral: "base color is coral",
  mint: "base color is mint",
  peach: "base color is peach",
  plum: "base color is plum",
  slate: "base color is slate",
  olive: "base color is olive",
  burgundy: "base color is burgundy",
  gold: "base color is gold",
  silver: "base color is silver",
  copper: "base color is copper",
  bronze: "base color is bronze",
};

export const PLANT_PARTS = ["leaf", "flower", "bark_stem", "fruit", "root"];

export const COLOUR_HUE_SUFFIXES_BY_PART = {
  leaf: [
    "moss",
    "sage",
    "olive",
    "chartreuse",
    "emerald",
    "juniper",
    "seafoam",
    "mint",
    "teal",
    "forest",
    "pea",
    "khaki",
    "celadon",
    "glaucous",
    "apple",
    "laurel",
    "viridian",
    "bottle",
    "pistachio",
    "asparagus",
    "sea-green",
    "bay",
    "fern",
  ],
  flower: [
    "rose",
    "magenta",
    "fuchsia",
    "coral",
    "peach",
    "apricot",
    "lemon",
    "gold",
    "amber",
    "plum",
    "lavender",
    "lilac",
    "periwinkle",
    "cerise",
    "scarlet",
    "crimson",
    "ruby",
    "azure",
    "sky",
    "cobalt",
    "indigo",
    "ivory",
    "blush",
    "cream",
  ],
  bark_stem: [
    "cinnamon",
    "rust",
    "mahogany",
    "charcoal",
    "taupe",
    "tan",
    "umber",
    "ochre",
    "sienna",
    "ash",
    "smoke",
    "slate",
    "sepia",
    "bronze",
    "copper",
    "steel",
  ],
  fruit: [
    "crimson",
    "scarlet",
    "ruby",
    "cherry",
    "plum",
    "amber",
    "gold",
    "citrine",
    "emerald",
    "jade",
    "teal",
    "indigo",
    "violet",
    "black",
    "ivory",
    "silver",
  ],
  root: ["umber", "earth", "ochre", "sienna", "clay", "charcoal", "ash", "taupe", "cream", "ivory", "russet", "sepia"],
};

export const COLOUR_ACCENT_PREFIXES_BY_PART = {
  leaf: ["silver", "gold", "cream", "white", "charcoal", "black", "violet", "crimson", "amber"],
  flower: ["white", "cream", "gold", "silver", "magenta", "violet", "crimson", "teal", "indigo", "blush"],
  bark_stem: ["ash", "charcoal", "silver", "copper", "rust", "cream", "ivory"],
  fruit: ["gold", "silver", "white", "cream", "charcoal", "black", "violet", "teal"],
  root: ["white", "cream", "gold", "silver", "rust", "charcoal"],
};

export const COLOUR_ACCENT_SUFFIXES_BY_PART = {
  leaf: ["veined", "rimmed", "speckled", "mottled", "striped", "edged", "flecked", "blotched", "banded"],
  flower: ["veined", "throated", "tipped", "ringed", "speckled", "striped", "blushed", "freckled", "haloed"],
  bark_stem: ["streaked", "mottled", "banded", "speckled", "laced", "veined", "patched"],
  fruit: ["blushed", "speckled", "striped", "mottled", "crowned", "freckled", "ringed"],
  root: ["banded", "streaked", "mottled", "veined", "flecked"],
};

export const COLOUR_EFFECT_PREFIXES_BY_PART = {
  leaf: [
    "translucent",
    "frosted",
    "velvet",
    "matte",
    "satin",
    "glossy",
    "waxy",
    "silken",
    "crystalline",
    "watery",
    "milky",
    "smoky",
  ],
  flower: [
    "translucent",
    "frosted",
    "velvet",
    "pearlescent",
    "opalescent",
    "iridescent",
    "silken",
    "glossy",
    "satin",
    "shimmering",
    "glowing",
    "luminous",
    "crystalline",
    "watery",
  ],
  bark_stem: ["matte", "dulled", "burnished", "rough", "corky", "powdery", "waxed", "weathered", "polished"],
  fruit: ["glossy", "frosted", "waxed", "polished", "velvet", "pruinose", "translucent", "milky", "shimmering"],
  root: ["earthy", "mealy", "corky", "powdery", "dull", "waxy", "rough", "polished"],
};

export const COLOUR_EFFECT_SUFFIXES_BY_PART = {
  leaf: ["finish", "sheen", "sheen", "sheen", "sheen", "sheen", "sheen"],
  flower: ["finish", "glow", "sheen", "bloom", "veil", "opalescence"],
  bark_stem: ["finish", "coat", "patina", "texture"],
  fruit: ["gloss", "bloom", "sheen", "glaze", "polish"],
  root: ["coat", "texture", "finish"],
};

export const COLOUR_SYSTEM_BY_PART = Object.freeze({
  parts: PLANT_PARTS,
  huePrefixes: COLOUR_HUE_MEANINGS,
  hueSuffixExamples: COLOUR_HUE_SUFFIX_EXAMPLES,
  hueSuffixMeanings: COLOUR_HUE_SUFFIX_MEANINGS,
  effectPrefixMeanings: COLOUR_EFFECT_PREFIX_MEANINGS,
  effectSuffixMeanings: COLOUR_EFFECT_SUFFIX_MEANINGS,
  hueSuffixesByPart: COLOUR_HUE_SUFFIXES_BY_PART,
  accentPrefixesByPart: COLOUR_ACCENT_PREFIXES_BY_PART,
  accentSuffixesByPart: COLOUR_ACCENT_SUFFIXES_BY_PART,
  effectPrefixesByPart: COLOUR_EFFECT_PREFIXES_BY_PART,
  effectSuffixesByPart: COLOUR_EFFECT_SUFFIXES_BY_PART,
});

export function pickRandom(rng, arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)];
}

export function composeHue(rng, part) {
  const huePrefix = pickRandom(rng, COLOUR_HUE_MEANINGS);
  const prefix = huePrefix?.prefix || "soft";
  const suffixList = COLOUR_HUE_SUFFIXES_BY_PART[part] || Object.keys(COLOUR_HUE_SUFFIX_EXAMPLES);
  const suffix = pickRandom(rng, suffixList) || "green";
  return `${prefix} ${suffix}`;
}

export function composeAccent(rng, part) {
  const colorPrefixList = COLOUR_ACCENT_PREFIXES_BY_PART[part] || ["white", "cream", "silver"];
  const markingList = COLOUR_ACCENT_SUFFIXES_BY_PART[part] || ["veined", "tipped", "blushed"];
  const prefix = pickRandom(rng, colorPrefixList) || "white";
  const suffix = pickRandom(rng, markingList) || "veined";
  return `${prefix} ${suffix}`;
}

export function composeEffect(rng, part) {
  const prefixList = COLOUR_EFFECT_PREFIXES_BY_PART[part] || ["matte", "glossy", "velvet"];
  const suffixList = COLOUR_EFFECT_SUFFIXES_BY_PART[part] || ["finish", "sheen", "glow"];
  const prefix = pickRandom(rng, prefixList) || "matte";
  const suffix = pickRandom(rng, suffixList) || "finish";
  return `${prefix} ${suffix}`;
}

export function describePartColour(rng, part) {
  const hue = composeHue(rng, part);
  const accent = composeAccent(rng, part);
  const effect = composeEffect(rng, part);
  return { hue, accent, effect, combined: `${hue}, ${accent}, ${effect}` };
}

export function generatePlantColourProfile(seed) {
  const rng = createSeededRng(seed || generateGuidSeed());
  const profile = {};
  for (const part of PLANT_PARTS) {
    profile[part] = describePartColour(rng, part);
  }
  return profile;
}

export function buildFloraColourSummary(plantProfile) {
  const parts = [];
  for (const part of PLANT_PARTS) {
    const p = plantProfile?.[part];
    if (!p) continue;
    parts.push(`${part}: ${p.combined}`);
  }
  return parts.join(" | ");
}

export const COLOUR_HUE_SUFFIXES = COLOUR_HUE_SUFFIXES_BY_PART;
export const COLOUR_ACCENT_PREFIXES = COLOUR_ACCENT_PREFIXES_BY_PART;
export const COLOUR_ACCENT_SUFFIXES = COLOUR_ACCENT_SUFFIXES_BY_PART;
export const COLOUR_EFFECT_PREFIXES = COLOUR_EFFECT_PREFIXES_BY_PART;
export const COLOUR_EFFECT_SUFFIXES = COLOUR_EFFECT_SUFFIXES_BY_PART;

export const BLOOM_SHAPE = [
  "lantern-shaped blossoms",
  "spiral pollen cones",
  "umbrella petals",
  "glassy seed bells",
  "ribbon-like fronds",
  "clustered bulb crowns",
  "trumpet-fluted hoods",
  "chandelier spike racemes",
];
export const SURFACE_TEXTURE = [
  "velvet leaf surfaces",
  "waxy reflective skin",
  "fine crystalline fuzz",
  "ribbed bark plating",
  "translucent petal membranes",
  "braided stem fibers",
  "scabrous cork ridges",
  "gelatinous mucus coat",
];
export const LIGHTING_MOOD = [
  "soft dawn light",
  "misty wetland haze",
  "high desert glare",
  "glowing twilight ambience",
  "cool subterranean luminescence",
  "storm-lit horizon light",
  "dappled canopy shadow",
  "aurora-borealis refracted glow",
];
export const FLORA_ADAPTATION = [
  "bioluminescent bloom tips",
  "pressure-sealed seed chambers",
  "toxin-laced sap",
  "mirror-leaf heat deflection",
  "electrostatic pollen nets",
  "night-breathing stomata",
  "ice-crystal antifreeze tissues",
  "rapid wound callusing",
];
export const PRIMARY_USE = [
  "medicinal resin",
  "textile fiber",
  "ceremonial incense",
  "high-calorie foodstock",
  "starship biofilter substrate",
  "structural cane",
  "industrial dye",
  "luxury perfume oil",
];
export const FLORA_ADAPTATIONS = FLORA_ADAPTATION;
const PRIMARY_USES = PRIMARY_USE;
const COLOURWAYS = COLOURWAY_PALETTE;
const BLOOM_SHAPES = BLOOM_SHAPE;
const SURFACE_TEXTURES = SURFACE_TEXTURE;
const LIGHTING_MOODS = LIGHTING_MOOD;
const HAZARD_LEVELS = ["Low", "Moderate", "Elevated", "High"];
const MARKET_APPEAL = ["local staple", "specialist export", "luxury trade good", "restricted cargo"];
export const FLORA_TAGLINE_FRAMINGS = [
  "a botanical lineage",
  "a species",
  "a genus",
  "a cultivated strain",
  "a genetic offshoot",
  "a hybrid variant",
  "a convergent lifeform",
  "a terraforming relic",
  "a seed-vault descendent",
  "a chance mutation",
];
export const FLORA_TAGLINE_TEMPERAMENTS = [
  "hardy",
  "fragile",
  "aggressive",
  "ancient",
  "invasive",
  "symbiotic",
  "parasitic",
  "sentient",
  "dormant",
  "fibrous",
  "crystalline",
  "gelatinous",
  "glorious",
  "noxious",
  "luminescent",
  "malleable",
  "carnivorous",
  "medicinal",
  "corrosive",
  "adaptable",
];
export const FLORA_TAGLINE_ORIGINS = [
  "extreme frontiers",
  "ancient impact craters",
  "hollowed asteroid colonies",
  "subsurface aquifers",
  "high-atmosphere cloud decks",
  "tidal rift zones",
  "volcanic caldera edges",
  "abandoned biolabs",
  "glacial moraines",
  "heavy-metal deserts",
  "orbital hydroponic spires",
  "petrified fungal forests",
  "sunless cave systems",
  "terraformed moon basins",
  "coastal salt flats",
  "brackish river deltas",
  "radioactive exclusion zones",
  "pressure-cracked seabeds",
  "floating peat islands",
  "thawing permafrost slopes",
];
export const FLORA_TAGLINE_QUALITIES = [
  "prized across nearby trade lanes",
  "renowned for its vivid scent",
  "sought after by offworld collectors",
  "vital to local ecopoiesis cycles",
  "studied for its unusual genetics",
  "revered in indigenous ritual",
  "capable of reshaping soil chemistry",
  "rumored to possess passive psychoactive properties",
  "harvested for starship biofilter substrates",
  "defines the color and scent of its homeworld",
  "capable of surviving vacuum exposure",
  "linked to regional weather patterns",
  "central to a planetary creation myth",
  "traded as a luxury commodity across three systems",
  "suspected of originating outside this star cluster",
  "key to at least one terraforming patent",
  "highly sensitive to stellar radiation shifts",
  "a common but irreplaceable keystone species",
  "legally protected in seven jurisdictions",
  "impossible to cultivate outside its native biome",
];
export const FLORA_TAGLINE_ECOLOGY_FRAMES = [
  "shaped by volatile local seasons",
  "adapted to cyclical drought pulses",
  "evolved under low-gravity conditions",
  "synchronized with binary star illumination",
  "dormant for decades between rains",
  "locked in mutual dependence with a fungal network",
  "genetically engineered to process heavy metals",
  "whose inner chemistry mirrors planetary magnetic shifts",
  "preserving genetic memory of a drowned world",
  "cycling nutrients through a closed-loop ecosystem",
  "whose pollen triggers atmospheric condensation",
  "acting as a carbon sink for its entire hemisphere",
  "degraded by contact with unsealed offworld equipment",
  "driven by lunar tidal cycles",
  "drawing energy from deep geothermal vents",
  "thriving on hyperspectral light invisible to human eyes",
  "entangled with the life cycle of an endemic insect",
  "secreting compounds that slowly weather local bedrock",
  "colonizing bare rock faster than any known non-synthetic",
  "defoliating in response to orbital debris shadows",
];
const NAME_PREFIXES = ["Aurel", "Thorn", "Myco", "Luma", "Virel", "Sable", "Tidal", "Cinder", "Vel", "Goss"];
const NAME_SUFFIXES = ["bloom", "reed", "fern", "spire", "vine", "moss", "frond", "root", "crown", "pod"];
const NAME_FLORA_CREATURE = [
  "Dragon",
  "Wolf",
  "Raven",
  "Crow",
  "Bear",
  "Alligator",
  "Beaver",
  "Cow",
  "Pig",
  "Bird",
  "Bull",
  "Buffalo",
  "Cat",
  "Chick",
  "Colt",
  "Crab",
  "Dog",
  "Stag",
  "Drake",
  "Duck",
  "Dove",
  "Eel",
  "Elephant",
  "Goat",
  "Fox",
  "Hog",
  "Horse",
  "Lark",
  "Lamb",
  "Adder",
  "Worm",
  "Buck",
  "Sheep",
  "Sow",
  "Spider",
  "Toad",
  "Viper",
  "Lion",
  "Snail",
  "Snake",
  "Rat",
  "Mouse",
  "Owl",
  "Wyvern",
  "Imp",
  "Mare",
  "Raptor",
  "Shark",
  "Swine",
  "Turtle",
  "Weasel",
  "Boar",
  "Ferret",
  "Gull",
  "Mantis",
  "Mole",
  "Pigeon",
  "Porcupine",
  "Raccoon",
  "Salamander",
  "Sparrow",
  "Squirrel",
  "Vulture",
  "Badger",
  "Bat",
  "Bison",
  "Butterfly",
  "Caribou",
  "Centipede",
  "Cobra",
  "Cougar",
  "Crane",
  "Crocodile",
  "Crow",
  "Deer",
  "Dolphin",
  "Falcon",
  "Ferret",
  "Finch",
  "Gazelle",
  "Giraffe",
  "Goose",
];
const NAME_FLORA_THING = [
  "Sand",
  "Button",
  "Musk",
  "Plume",
  "Sand",
  "Wick",
  "Spell",
  "Wild",
  "Water",
  "Bramble",
  "Sap",
  "Wool",
  "Gem",
  "Crunch",
  "Bell",
  "Salt",
  "Winkle",
  "Stream",
  "Branch",
  "Pepper",
  "Fern",
  "Wall",
  "Nut",
  "Needle",
  "Bristle",
  "Bind",
  "Sweet",
  "Spur",
  "Plague",
  "Pine",
  "Strife",
  "Tear",
  "Knap",
  "Bell",
  "Flag",
  "Hoof",
  "Bite",
  "Honey",
  "Hedge",
  "Balm",
  "Blood",
  "Thick",
  "Rue",
  "Glove",
  "Whip",
  "Copper",
  "Iron",
  "Drop",
  "Cotton",
  "Butter",
  "Ash",
  "Dew",
  "Frost",
  "Gale",
  "Hollow",
  "Mire",
  "Moss",
  "Pollen",
  "Quill",
  "Rough",
  "Shale",
  "Shimmer",
  "Soot",
  "Spore",
  "Tangle",
  "Tear",
  "Vine",
  "Wisp",
  "Worm",
  "Yarrow",
  "Zephyr",
  "Amber",
  "Basil",
  "Cedar",
  "Cinder",
  "Clover",
  "Dusk",
  "Ember",
  "Fawn",
  "Fern",
  "Frost",
  "Gale",
  "Glade",
  "Hawthorn",
  "Hedge",
  "Ivy",
  "Juniper",
  "Lichen",
  "Lily",
  "Moss",
  "Myrtle",
  "Nettle",
  "Oak",
  "Olive",
  "Pine",
  "Reed",
  "Rosemary",
  "Sage",
  "Thistle",
  "Thorn",
  "Valerian",
  "Willow",
];
const NAME_FLORA_SIGNIFIER = [
  "King",
  "Queen",
  "Crown",
  "Day",
  "Night",
  "Demon",
  "Winter",
  "Summer",
  "Witch",
  "Moon",
  "Sun",
  "River",
  "Mount",
  "Hill",
  "Steed",
  "Garden",
  "Meadow",
  "Devil",
  "Mage",
  "Fairy",
  "Wizard",
  "Valor",
  "Heart",
  "Head",
  "Mind",
  "Jewel",
  "Love",
  "Hate",
  "God",
  "Knight",
  "Lady",
  "Father",
  "Parent",
  "Money",
  "Dawn",
  "Dusk",
  "Lord",
  "Shepherd",
  "Bastard",
  "Gem",
  "Pilgrim",
  "Realm",
  "Maiden",
  "Hero",
  "Diamond",
  "Emerald",
  "Mother",
  "Beggar",
  "Lover",
  "World",
  "Iron",
  "Drop",
  "Cotton",
  "Butter",
];
const NAME_FLORA_GRASS = [
  "Weed",
  "Grass",
  "Cress",
  "Flower",
  "Clover",
  "Seed",
  "Berry",
  "Brome",
  "Wheat",
  "Thorn",
  "Vine",
  "Mint",
  "Herb",
  "Daisy",
  "Thyme",
  "Flax",
  "Hemp",
  "Lettuce",
  "Mallow",
  "Millet",
  "Wort",
  "Nettle",
  "Sedge",
  "Rose",
  "Sage",
  "Reed",
  "Bur",
  "Root",
  "Spurge",
  "Blossom",
  "Tansy",
  "Teasel",
  "Tassel",
  "Thistle",
  "Fruit",
  "Leaf",
  "Vetch",
  "Wood",
  "Cherry",
  "Poppy",
  "Suckle",
  "Mur",
  "Phlox",
  "Ivy",
  "Mustard",
  "Lily",
  "Lilac",
  "Plant",
  "Fig",
  "Meg",
  "Fern",
  "Moss",
  "Cactus",
  "Palm",
  "Fungus",
  "Algae",
  "Shrub",
  "Tree",
  "Bulb",
  "Bloom",
  "Frond",
  "Spore",
  "Branch",
  "Bramble",
  "Bush",
  "Cane",
  "Carpet",
  "Cluster",
  "Colony",
  "Crag",
  "Crone",
  "Crown",
  "Daisy",
  "Dawn",
  "Dusk",
  "Fern",
  "Field",
  "Flame",
  "Frost",
  "Gale",
  "Glade",
  "Glory",
  "Hawthorn",
  "Hedge",
  "Hill",
  "Hollow",
  "Ivy",
  "Juniper",
  "Lichen",
  "Lily",
  "Mallow",
  "Meadow",
  "Mint",
  "Moss",
  "Myrtle",
  "Nettle",
  "Oak",
  "Olive",
  "Pine",
  "Reed",
  "Rosemary",
  "Sage",
  "Thistle",
  "Thorn",
  "Valerian",
  "Willow",
  "Yarrow",
  "Zephyr",
  "Amber",
  "Basil",
  "Cedar",
  "Cinder",
  "Clover",
  "Dusk",
];
const NAME_FLORA_MODIFIER = [
  "Bane",
  "Head",
  "Foot",
  "Finger",
  "Tail",
  "Tooth",
  "Guts",
  "Lock",
  "Hair",
  "Horn",
  "Beard",
  "Knot",
  "Death",
  "Milk",
  "Shade",
  "Tongue",
  "Rot",
  "Foil",
  "Grasp",
  "Wings",
  "Claw",
  "Heart",
  "Veil",
  "Whisper",
  "Shroud",
  "Flare",
  "Gaze",
  "Spear",
  "Fang",
  "Brew",
  "Curse",
  "Blessing",
  "Doom",
  "Glory",
  "Horror",
  "Revenge",
  "Sin",
  "Sorrow",
  "Joy",
  "Valor",
  "Ruin",
  "Hope",
  "Fear",
  "Hate",
  "Love",
  "Dawn",
  "Dusk",
  "Light",
  "Darkness",
  "Shadow",
  "Dream",
  "Nightmare",
  "Storm",
  "Frost",
  "Flame",
  "Gale",
  "Ember",
  "Ashes",
  "Whisper",
  "Shout",
  "Echo",
  "Scream",
  "Silence",
];
const NAME_FLORA_REGION_FEATURE = [
  "Mountain",
  "Prairie",
  "Tundra",
  "Valley",
  "Forest",
  "Jungle",
  "Canopy",
  "Summit",
  "Meadow",
  "Thicket",
  "Channel",
  "Canyon",
  "Desert",
  "Wetland",
  "Quarter",
  "Shrubland",
  "Island",
  "Lowland",
  "Rainforest",
  "Highland",
  "Steppe",
  "Swamp",
  "Glacier",
  "Cliffside",
  "Gorge",
  "Savannah",
  "Bay",
  "Archipelago",
  "Delta",
  "Fen",
  "Grassland",
];
const NAME_FLORA_METAPHOR = [
  "Bane",
  "Barren",
  "Belt",
  "Blade",
  "Blight",
  "Border",
  "Branch",
  "Cairn",
  "Cradle",
  "Curse",
  "Deep",
  "Doom",
  "Edge",
  "Fall",
  "Fang",
  "Fear",
  "Fell",
  "Field",
  "Fire",
  "Flail",
  "Flame",
  "Flat",
  "Fog",
  "Forge",
  "Frost",
  "Gate",
  "Grasp",
  "Grave",
  "Guard",
  "Gull",
  "Hail",
  "Heart",
  "Hearth",
  "Heat",
  "Hedge",
  "Hex",
  "Knife",
  "Light",
  "Mane",
  "Mare",
  "Mark",
  "Mask",
  "Mast",
  "Maw",
  "Mirth",
  "Mist",
  "Murk",
  "Needle",
  "Pale",
  "Path",
  "Pyre",
  "Range",
  "Reach",
  "Realm",
  "Ridge",
  "Rim",
  "Rise",
  "Rite",
  "Rock",
  "Sail",
  "Scale",
  "Scar",
  "Scare",
  "Scream",
  "Shadow",
  "Shard",
  "Skull",
  "Sky",
  "Sound",
  "Spear",
  "Spine",
  "Spire",
  "Stair",
  "Stead",
  "Sting",
  "Sword",
  "Tear",
  "Thaw",
  "Thorn",
  "Tooth",
  "Torch",
  "Tree",
  "Veil",
  "Vein",
  "Vow",
  "Wake",
  "Wall",
  "War",
  "Ward",
  "Watch",
  "Way",
  "Wheel",
  "Whyll",
  "Wild",
  "Wind",
  "Wing",
  "Wisp",
  "Wreath",
  "Yew",
];
const NAME_FLORA_REGION_DESCRIPTOR = [
  "Astral",
  "Blasted",
  "Blazing",
  "Blessed",
  "Bloodied",
  "Breaking",
  "Bright",
  "Broken",
  "Bronze",
  "Color",
  "Crystal",
  "Cursed",
  "Damned",
  "Divine",
  "Eastern",
  "Elder",
  "Faerie",
  "Fallen",
  "Fetid",
  "Fickle",
  "Fierce",
  "Fiery",
  "Final",
  "First",
  "Fleeting",
  "Flooded",
  "Forgotten",
  "Free",
  "Giant",
  "Gleaming",
  "Golden",
  "Great",
  "Greater",
  "Grieving",
  "Hanging",
  "Hidden",
  "High",
  "Infernal",
  "Infinite",
  "Last",
  "Lesser",
  "Lonely",
  "Long",
  "Lost",
  "Lower",
  "Mangled",
  "Many",
  "Marred",
  "Middle",
  "Misty",
  "Mystic",
  "Northern",
  "Painted",
  "Pallid",
  "Past",
  "Piercing",
  "Poisoned",
  "Quiet",
  "Ragged",
  "Raised",
  "Risen",
  "Rocky",
  "Rugged",
  "Sacred",
  "Scarred",
  "Screaming",
  "Screeching",
  "Seared",
  "Serene",
  "Shadow",
  "Shallow",
  "Sharp",
  "Shining",
  "Silent",
  "Silver",
  "Sleeping",
  "Slumbering",
  "Solemn",
  "Southern",
  "Summer",
  "Sundered",
  "Sunken",
  "Sweeping",
  "Torn",
  "Torrid",
  "Twisted",
  "Undying",
  "Upper",
  "Veiled",
  "Waking",
  "Wasting",
  "Weary",
  "Weeping",
  "Western",
  "White",
  "Winding",
  "Winter",
  "Wistful",
];
const NAME_FLORA_REGION_CONCEPT = [
  "Haven",
  "Fame",
  "Dawn",
  "Sorrow",
  "Fear",
  "Song",
  "Death",
  "Quiet",
  "Dream",
  "Life",
  "Sight",
  "King",
  "Queen",
  "Vision",
  "Fey",
  "Hurt",
  "Beacon",
  "Star",
  "Peace",
  "Spell",
  "Beast",
  "Raven",
  "Battle",
  "Priest",
  "Mage",
  "Moon",
  "Crow",
  "Ghost",
  "Fiend",
  "Still",
  "Night",
  "Spirit",
  "God",
  "Lion",
  "Dusk",
  "Steed",
  "Cloud",
  "Sun",
  "Siren",
  "Time",
  "Fright",
  "Sleep",
  "Seer",
  "Dagger",
  "End",
];

const NAME_FLORA_COLOR = [
  "Red",
  "Green",
  "Purple",
  "Yellow",
  "Silver",
  "Black",
  "White",
  "Blue",
  "Grey",
  "Brown",
  "Orange",
  "Golden",
  "Bronze",
  "Pink",
  "Violet",
  "Lavender",
  "Dark",
  "Bright",
  "Brilliant",
  "Roll twice",
];
const NAME_FLORA_TREES = [
  "Pine",
  "Fir",
  "Fig",
  "Oak",
  "Aspen",
  "Birch",
  "Maple",
  "Cherry",
  "Yew",
  "Eucalyptus",
  "Gum",
  "Bamboo",
  "Palm",
  "Baobab",
  "Acacia",
  "Spruce",
  "Sequoia",
  "Cypress",
  "Rubber",
  "Mahogany",
  "Date",
  "Willow",
  "Sycamore",
  "Larch",
  "Ash",
  "Walnut",
  "Magnolia",
  "Hemlock",
  "Cacao",
  "Burflower",
  "Juniper",
  "Papaya",
  "Gingko",
  "Coconut",
  "Dove",
  "Pagoda",
  "Fern",
  "Cathaya",
  "Tallow",
  "Laurel",
  "Camphor",
  "Holly",
  "Lime",
  "Dragon",
  "Banyan",
  "Sallow",
  "Kauri",
  "Bristlecone",
  "Nutmeg",
];

const FLORA_NAME_SOURCE_MAP = Object.freeze({
  Creature: NAME_FLORA_CREATURE,
  Thing: NAME_FLORA_THING,
  Grass: NAME_FLORA_GRASS,
  Modifier: NAME_FLORA_MODIFIER,
  Signifier: NAME_FLORA_SIGNIFIER,
  Descriptor: NAME_FLORA_COLOR,
  Tree: NAME_FLORA_TREES,
  "Region Feature": NAME_FLORA_REGION_FEATURE,
  "Region Metaphor": NAME_FLORA_METAPHOR,
  "Region Descriptor": NAME_FLORA_REGION_DESCRIPTOR,
  "Region Concept": NAME_FLORA_REGION_CONCEPT,
});

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

function rollIndex(length, rng = Math.random) {
  return Math.floor(rng() * length);
}

export function getRandomEntry(entries = [], rng = Math.random) {
  if (!Array.isArray(entries) || !entries.length) return "";
  return entries[rollIndex(entries.length, rng)];
}

export function generateCompactFlora({ rng = Math.random } = {}) {
  const colour = getRandomEntry(COLOURWAY_PALETTE, rng);
  const bloom = getRandomEntry(BLOOM_SHAPE, rng);
  const texture = getRandomEntry(SURFACE_TEXTURE, rng);
  const mood = getRandomEntry(LIGHTING_MOOD, rng);

  return `${colour} ${bloom} with ${texture}, glowing in ${mood}`;
}

export function generateDetailedFlora({ rng = Math.random } = {}) {
  const colour = getRandomEntry(COLOURWAY_PALETTE, rng);
  const bloom = getRandomEntry(BLOOM_SHAPE, rng);
  const texture = getRandomEntry(SURFACE_TEXTURE, rng);
  const mood = getRandomEntry(LIGHTING_MOOD, rng);
  const adaptation = getRandomEntry(FLORA_ADAPTATION, rng);
  const primaryUse = getRandomEntry(PRIMARY_USE, rng);

  return [
    `A flora with ${colour} colouring, bearing ${bloom}.`,
    `Its ${texture} are adapted for ${mood} conditions, with ${adaptation}.`,
    `Primary harvest: ${primaryUse}.`,
  ].join(" ");
}

export function generateSpecFlora({ rng = Math.random } = {}) {
  return [
    `Colour: ${getRandomEntry(COLOURWAY_PALETTE, rng)}`,
    `Bloom shape: ${getRandomEntry(BLOOM_SHAPE, rng)}`,
    `Texture: ${getRandomEntry(SURFACE_TEXTURE, rng)}`,
    `Lighting: ${getRandomEntry(LIGHTING_MOOD, rng)}`,
    `Adaptation: ${getRandomEntry(FLORA_ADAPTATION, rng)}`,
    `Primary use: ${getRandomEntry(PRIMARY_USE, rng)}`,
  ].join("\n");
}

export function generateColourHueDescriptor({ rng = Math.random } = {}) {
  const hue = getRandomEntry(COLOUR_HUE_MEANINGS, rng);
  const colour = getRandomEntry(COLOUR_HUE_SUFFIX, rng);
  const exampleHues = COLOUR_HUE_SUFFIX_EXAMPLES[colour] || [];
  const suffixMeaning = COLOUR_HUE_SUFFIX_MEANINGS[colour] || "base color";

  return {
    huePrefix: hue.prefix,
    hueMeaning: hue.meaning,
    hueColour: colour,
    hueSuffixMeaning: suffixMeaning,
    hueDescriptor: `${hue.prefix} ${colour}`,
    hueExampleHues: exampleHues,
    hueExampleSummary: exampleHues.length ? exampleHues.join(", ") : "",
    hueSummary: `${hue.meaning}; ${suffixMeaning}`,
  };
}

export function generateColourAccentDescriptor({ rng = Math.random } = {}) {
  const prefix = getRandomEntry(COLOUR_ACCENT_PREFIX, rng).trim();
  const suffix = getRandomEntry(COLOUR_ACCENT_SUFFIX, rng).trim();

  return {
    accentPrefix: prefix,
    accentSuffix: suffix,
    accentDescriptor: `${prefix} ${suffix}`.replace(/\s+/g, " ").trim(),
    accentSummary: `${prefix} ${suffix}`.replace(/\s+/g, " ").trim(),
  };
}

export function generateColourEffectDescriptor({ rng = Math.random } = {}) {
  const effectPrefix = getRandomEntry(COLOUR_EFFECT_PREFIX, rng).trim();
  const effectSuffix = getRandomEntry(COLOUR_EFFECT_SUFFIX, rng).trim();
  const effectPrefixMeaning = COLOUR_EFFECT_PREFIX_MEANINGS[effectPrefix] || effectPrefix;
  const effectSuffixMeaning = COLOUR_EFFECT_SUFFIX_MEANINGS[effectSuffix] || effectSuffix;

  return {
    effectPrefix,
    effectSuffix,
    effectPrefixMeaning,
    effectSuffixMeaning,
    effectDescriptor: `${effectPrefix} ${effectSuffix}`.replace(/\s+/g, " ").trim(),
    effectSummary: `${effectPrefixMeaning}; ${effectSuffixMeaning}`,
  };
}

export const ALL_FLORA_TABLES = Object.freeze({
  colours: { entries: COLOURWAY_PALETTE, die: "d8" },
  blooms: { entries: BLOOM_SHAPE, die: "d8" },
  textures: { entries: SURFACE_TEXTURE, die: "d8" },
  lighting: { entries: LIGHTING_MOOD, die: "d8" },
  adaptations: { entries: FLORA_ADAPTATION, die: "d8" },
  uses: { entries: PRIMARY_USE, die: "d8" },
});

export const FLORA_TAGLINE_PATTERNS = [
  ({ temperament, origin, quality }) => `a ${temperament} botanical lineage shaped by ${origin}, ${quality}`,
  ({ temperament, framing, origin }) => `a ${temperament} ${framing} from ${origin}`,
  ({ temperament, framing, ecologyFrame }) => `a ${temperament} ${framing} ${ecologyFrame}`,
  ({ temperament, framing, quality }) => `a ${temperament} ${framing}, ${quality}`,
  ({ framing, temperament, quality }) => `a ${framing}, ${temperament} and ${quality}`,
  ({ origin, framing, ecologyFrame }) => `a ${origin} ${framing}, ${ecologyFrame}`,
  ({ framing, quality, origin }) => `a ${framing} ${quality} - a ${origin} lineage`,
  ({ temperament, ecologyFrame, framing }) => `a ${temperament}, ${ecologyFrame} ${framing}`,
];

export function generateTagline({ rng = Math.random } = {}) {
  const pattern = pick(FLORA_TAGLINE_PATTERNS, rng);
  const payload = {
    framing: pick(FLORA_TAGLINE_FRAMINGS, rng),
    temperament: pick(FLORA_TAGLINE_TEMPERAMENTS, rng),
    origin: pick(FLORA_TAGLINE_ORIGINS, rng),
    quality: pick(FLORA_TAGLINE_QUALITIES, rng),
    ecologyFrame: pick(FLORA_TAGLINE_ECOLOGY_FRAMES, rng),
  };

  return pattern(payload);
}

export function generateTaglineList(count = 5, { rng = Math.random } = {}) {
  const total = Math.max(1, Number(count) || 1);
  const results = new Set();
  let attempts = 0;

  while (results.size < total && attempts < total * 10) {
    results.add(generateTagline({ rng }));
    attempts += 1;
  }

  return [...results];
}

export function generateFloraRootNetwork({ mode = "compact", rng = Math.random } = {}) {
  const resolvedMode = ["compact", "verbose", "descriptive"].includes(String(mode || "").trim())
    ? String(mode || "").trim()
    : "compact";

  const architecture = pick(FLORA_ROOT_NETWORK_ARCHITECTURE, rng);
  const substrate = pick(FLORA_ROOT_NETWORK_SUBSTRATE, rng);
  const strategy = pick(FLORA_ROOT_NETWORK_STRATEGY, rng);
  const tissue = pick(FLORA_ROOT_NETWORK_TISSUE, rng);

  switch (resolvedMode) {
    case "verbose":
      return `${architecture} ${substrate} ${strategy}`;
    case "descriptive":
      return `${tissue} ${architecture} ${substrate}`;
    case "compact":
    default:
      return `${architecture} ${strategy}`;
  }
}

function buildClimateBiasedWaterStrategyPools(climate = "Temperate") {
  const normalized = String(climate || "Temperate");

  switch (normalized) {
    case "Arid":
      return {
        source: uniqueEntries(["fog drip", "dew film", "hygroscopic harvest", ...FLORA_WATER_STRATEGY_SOURCE]),
        mechanism: uniqueEntries([
          "vapor sorption",
          "capillary wicking",
          "pressure osmosis",
          ...FLORA_WATER_STRATEGY_MECHANISM,
        ]),
        storage: uniqueEntries([
          "subterranean cistern",
          "cuticular wax seal",
          "bulb reservoir",
          ...FLORA_WATER_STRATEGY_STORAGE,
        ]),
      };
    case "Wetland":
    case "Coastal":
      return {
        source: uniqueEntries(["flood surge", "ground seep", "overland sheet flow", ...FLORA_WATER_STRATEGY_SOURCE]),
        mechanism: uniqueEntries([
          "hydraulic redistribution",
          "gravitational drain",
          "tension conduit",
          ...FLORA_WATER_STRATEGY_MECHANISM,
        ]),
        storage: uniqueEntries([
          "air-root bladder",
          "surface film",
          "leaf-bract cupping",
          ...FLORA_WATER_STRATEGY_STORAGE,
        ]),
      };
    case "Tundra":
    case "Alpine":
      return {
        source: uniqueEntries(["snowmelt trickle", "dew film", "ground seep", ...FLORA_WATER_STRATEGY_SOURCE]),
        mechanism: uniqueEntries([
          "pressure osmosis",
          "capillary wicking",
          "guttation pump",
          ...FLORA_WATER_STRATEGY_MECHANISM,
        ]),
        storage: uniqueEntries(["pith well", "cortex sponge", "xylem tank", ...FLORA_WATER_STRATEGY_STORAGE]),
      };
    default:
      return {
        source: FLORA_WATER_STRATEGY_SOURCE,
        mechanism: FLORA_WATER_STRATEGY_MECHANISM,
        storage: FLORA_WATER_STRATEGY_STORAGE,
      };
  }
}

export function generateFloraWaterStrategy({ mode = "compact", rng = Math.random, climate = "Temperate" } = {}) {
  const resolvedMode = ["compact", "full", "concise"].includes(String(mode || "").trim())
    ? String(mode || "").trim()
    : "compact";
  const pools = buildClimateBiasedWaterStrategyPools(climate);
  const source = pick(pools.source, rng);
  const mechanism = pick(pools.mechanism, rng);
  const storage = pick(pools.storage, rng);

  switch (resolvedMode) {
    case "full":
      return `${source} -> ${mechanism} -> ${storage}`;
    case "concise":
      return `${source} ${mechanism} ${storage}`;
    case "compact":
    default:
      return `${source} with ${mechanism}`;
  }
}

function describeClimateBand(climate = "Temperate") {
  const normalized = String(climate || "Temperate");
  if (["Arid", "Tundra", "Subterranean"].includes(normalized)) return "stress-adapted";
  if (["Wetland", "Tropical", "Coastal"].includes(normalized)) return "water-rich";
  return "temperate-stable";
}

function normalizeFloraSubtypeToken(world = {}) {
  return [world?.worldSubtype, world?.worldClass, world?.worldDescriptor].filter(Boolean).join(" ").toLowerCase();
}

function resolveFloraSubtypeBias(world = {}) {
  const subtype = normalizeFloraSubtypeToken(world);

  if (!subtype) {
    return {};
  }

  if (/(gaian|euvesperian|pelagic|panthalassic|oceanic|bathyvesperian)/.test(subtype)) {
    return {
      climate: "Wetland",
      growthForms: ["Canopy Tree", "Floating Frond", "Reed Colony", "Creeping Vine"],
      adaptations: ["bioluminescent bloom tips", "electrostatic pollen nets", "rapid wound callusing"],
      uses: ["medicinal resin", "luxury perfume oil", "textile fiber"],
      tagline: "a lush botanical lineage thriving in water-rich planetary cycles",
    };
  }

  if (/(vesperian|chlorivesperian|janivesperian)/.test(subtype)) {
    return {
      climate: subtype.includes("janivesperian") ? "Coastal" : "Temperate",
      growthForms: ["Creeping Vine", "Canopy Tree", "Spore Fern", "Reed Colony"],
      adaptations: ["night-breathing stomata", "mirror-leaf heat deflection", "electrostatic pollen nets"],
      uses: ["luxury perfume oil", "medicinal resin", "ceremonial incense"],
      tagline: "an elegant twilight-adapted flora shaped by tidally locked seasons",
    };
  }

  if (/(tartarian|teathic|nunnic|amunian|snowball)/.test(subtype)) {
    return {
      climate: "Tundra",
      growthForms: ["Crystal Moss", "Spore Fern", "Bulb Grove"],
      adaptations: ["ice-crystal antifreeze tissues", "pressure-sealed seed chambers", "night-breathing stomata"],
      uses: ["starship biofilter substrate", "industrial dye", "restricted cargo"],
      tagline: "a cryogenic flora lineage adapted to volatile cold-sea chemistry",
    };
  }

  if (/(arid|janilithic|telluric|phosphorian|cytherean|meltball|rockball)/.test(subtype)) {
    return {
      climate: "Arid",
      growthForms: ["Succulent Tower", "Crystal Moss", "Bulb Grove"],
      adaptations: ["mirror-leaf heat deflection", "toxin-laced sap", "pressure-sealed seed chambers"],
      uses: ["industrial dye", "structural cane", "ceremonial incense"],
      tagline: "a hardy drought-shaped flora lineage built for punishing heat and scarce water",
    };
  }

  return {};
}

export function mapWorldToFloraClimate(world = {}) {
  const terrain = String(buildWorldLinkedCreatureOptions(world).terrain || "").toLowerCase();
  const hydrographics = Number(world?.hydrographics ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 20);
  const subtypeBias = resolveFloraSubtypeBias(world);

  if (subtypeBias.climate) return subtypeBias.climate;
  if (terrain.includes("ocean") || terrain.includes("wet") || hydrographics >= 8) return "Wetland";
  if (terrain.includes("coast") || terrain.includes("shore")) return "Coastal";
  if (terrain.includes("mount") || terrain.includes("precipice")) return "Alpine";
  if (terrain.includes("cavern") || terrain.includes("underground")) return "Subterranean";
  if (avgTempC <= -5) return "Tundra";
  if (hydrographics <= 2 || avgTempC >= 35) return "Arid";
  if (avgTempC >= 28) return "Tropical";
  return "Temperate";
}

export const FORM_PREFIXES = [
  "Dwarf",
  "Giant",
  "Creeping",
  "Clustered",
  "Solitary",
  "Twisted",
  "Gnarled",
  "Sprawling",
  "Drooping",
  "Erect",
  "Prostrate",
  "Scrambling",
  "Weeping",
  "Towering",
  "Compact",
  "Pendant",
  "Candelabra",
  "Reticulated",
  "Fractal",
  "Corky",
  "Hollow-stemmed",
  "Thorn-armored",
  "Fluorescent-tipped",
  "Silver-veined",
  "Double-canopied",
  "Aerial-rooted",
];

export const FORM_CORES = [
  "Canopy",
  "Bulb",
  "Vine",
  "Tower",
  "Moss",
  "Frond",
  "Reed",
  "Fern",
  "Shrub",
  "Cushion",
  "Mound",
  "Cactus",
  "Umbrella",
  "Fork",
  "Trunk",
  "Palm",
  "Liana",
  "Bamboo",
  "Rosette",
  "Spire",
  "Arch",
  "Pitcher",
  "Dome",
  "Strangler",
  "Scrub",
  "Tube",
  "Column",
  "Mat",
  "Net",
  "Fan",
  "Bell",
  "Crown",
  "Tendril",
];

export const FORM_SUFFIXES = [
  "Scrub",
  "Hanger",
  "Creeper",
  "Climber",
  "Spreader",
  "Grounder",
  "Weaver",
  "Twiner",
  "Stilt",
  "Bower",
  "Thicket",
  "Carpet",
  "Rod",
  "Tuft",
  "Bush",
  "Fiber",
  "Tank",
  "Fan",
  "Whip",
  "Lobe",
  "Ear",
  "Tail",
];

export const CLIMATE_PREFIX_BIAS = {
  Tundra: [0, 3, 8, 10, 14, 23],
  Arid: [0, 5, 9, 14, 21, 24],
  Wetland: [1, 2, 7, 10, 15, 25],
  Tropical: [1, 4, 6, 12, 18, 24],
  Alpine: [0, 3, 6, 14, 16, 22],
  Subterranean: [4, 5, 10, 19, 22, 23],
  Coastal: [0, 1, 2, 15, 16, 25],
  Temperate: [3, 5, 7, 11, 12, 20],
};

export const CLIMATE_CORE_BIAS = {
  Tundra: [4, 9, 10, 12, 27, 31],
  Arid: [3, 4, 11, 19, 22, 24],
  Wetland: [0, 5, 6, 20, 26, 28],
  Tropical: [0, 2, 15, 16, 23, 32],
  Alpine: [4, 7, 9, 10, 19, 24],
  Subterranean: [3, 4, 7, 8, 21, 27],
  Coastal: [5, 6, 14, 20, 22, 28],
  Temperate: [0, 1, 8, 17, 25, 29],
};

export const CLIMATE_SUFFIX_BIAS = {
  Tundra: [0, 5, 7, 13, 19],
  Arid: [0, 4, 6, 14, 18],
  Wetland: [1, 3, 8, 11, 15],
  Tropical: [1, 2, 3, 11, 14],
  Alpine: [0, 4, 10, 13, 19],
  Subterranean: [0, 5, 9, 16, 20],
  Coastal: [1, 6, 8, 10, 21],
  Temperate: [2, 5, 7, 12, 17],
};

function pickBiased(arr = [], biasIndices = [], rng = Math.random) {
  if (!Array.isArray(arr) || !arr.length) {
    return "";
  }

  if (Array.isArray(biasIndices) && biasIndices.length && rng() < 0.6) {
    return arr[biasIndices[Math.floor(rng() * biasIndices.length)]];
  }

  return arr[Math.floor(rng() * arr.length)];
}

function decideGrowthFormPartCount(rng = Math.random) {
  const roll = rng();
  if (roll < 0.15) return 2;
  if (roll < 0.35) return 1;
  return 3;
}

function hasDoublePrefix(rng = Math.random) {
  return rng() < 0.3;
}

export function recommendGrowthForm(climate = "Temperate", rng = Math.random, world = {}) {
  const subtypeBias = resolveFloraSubtypeBias(world);
  const validClimates = Object.keys(CLIMATE_PREFIX_BIAS);
  const resolvedClimate = climate ? String(climate) : validClimates[Math.floor(rng() * validClimates.length)];
  const clime = validClimates.includes(resolvedClimate) ? resolvedClimate : "Temperate";

  const prefix = pickBiased(FORM_PREFIXES, CLIMATE_PREFIX_BIAS[clime], rng);
  const prefix2 = hasDoublePrefix(rng) ? pickBiased(FORM_PREFIXES, CLIMATE_PREFIX_BIAS[clime], rng) : null;
  const core = pickBiased(FORM_CORES, CLIMATE_CORE_BIAS[clime], rng);
  const suffix = pickBiased(FORM_SUFFIXES, CLIMATE_SUFFIX_BIAS[clime], rng);
  const partsMode = decideGrowthFormPartCount(rng);

  let recommendedForm;
  if (partsMode === 1) {
    recommendedForm = `${core} ${suffix}`;
  } else if (partsMode === 2) {
    recommendedForm = `${prefix} ${core}`;
  } else {
    const stackedPrefix = prefix2 ? `${prefix2} ` : "";
    recommendedForm = `${stackedPrefix}${prefix} ${core} ${suffix}`;
  }

  return {
    recommendedForm,
    growthForm: recommendedForm,
    prefix,
    prefix2,
    core,
    suffix,
    subtype: prefix2 || prefix,
    subtypeBias,
    climate: clime,
  };
}

export function buildWorldLinkedFloraOptions(world = {}) {
  const worldLink = buildWorldLinkedCreatureOptions(world);
  const climate = mapWorldToFloraClimate(world);
  const growthForm = recommendGrowthForm(
    climate,
    createSeededRng(`${worldLink.sourceWorld?.name || "world"}-flora`),
    world,
  );

  return {
    sourceWorld: {
      ...worldLink.sourceWorld,
      nativeLifeform: String(world?.nativeLifeform || ""),
      nativeSophontLife: Boolean(world?.nativeSophontLife),
      worldSubtype: String(world?.worldSubtype || ""),
      worldClass: String(world?.worldClass || ""),
      worldDescriptor: String(world?.worldDescriptor || ""),
    },
    climate,
    growthForm: growthForm.recommendedForm,
    origin: world?.nativeLifeform ? "Native floral lineage" : "Imported or engineered stock",
  };
}

export function getWorldAvailableFloraClimates(world = {}) {
  const terrainOptions = getWorldAvailableCreatureTerrains(world);
  const climates = [];
  const pushUnique = (entry) => {
    if (!FLORA_CLIMATES.includes(entry) || climates.includes(entry)) return;
    climates.push(entry);
  };

  for (const terrain of terrainOptions) {
    switch (terrain) {
      case "Ocean":
      case "River":
      case "Lake":
      case "Wetland":
        pushUnique("Wetland");
        break;
      case "Shore":
      case "Islands":
        pushUnique("Coastal");
        pushUnique("Wetland");
        break;
      case "Icecap":
      case "Glacier":
      case "Ice Field":
      case "Frozen Lands":
        pushUnique("Tundra");
        break;
      case "Desert":
      case "Baked lands":
        pushUnique("Arid");
        break;
      case "Mountain":
      case "Volcano":
      case "Chasm":
      case "Precipice":
        pushUnique("Alpine");
        break;
      case "Caverns":
      case "Mines":
      case "Abyss":
      case "Ocean Depths":
        pushUnique("Subterranean");
        break;
      case "Woods":
      case "Wet Woods":
      case "Rough Woods":
        pushUnique("Temperate");
        pushUnique("Tropical");
        break;
      default:
        pushUnique("Temperate");
        break;
    }
  }

  if (!climates.length) {
    pushUnique(mapWorldToFloraClimate(world));
  }

  return climates.length ? climates : ["Temperate"];
}

export const CLIMATE_TEXTURE_BIAS = {
  Tundra: [0, 5, 6],
  Arid: [1, 2, 6],
  Wetland: [0, 4, 7],
  Tropical: [0, 1, 3],
  Alpine: [2, 5, 6],
  Subterranean: [4, 5, 7],
  Coastal: [1, 3, 5],
  Temperate: [0, 1, 3],
};

export const CLIMATE_COLOUR_BIAS = {
  Tundra: [0, 4, 7],
  Arid: [2, 5, 6],
  Wetland: [1, 3, 4],
  Tropical: [0, 2, 3],
  Alpine: [0, 4, 7],
  Subterranean: [1, 4, 6],
  Coastal: [4, 5, 7],
  Temperate: [0, 1, 2],
};

const CLIMATE_COLOUR_PART_BIAS = {
  Tundra: ["leaf", "root"],
  Arid: ["bark_stem", "root"],
  Wetland: ["leaf", "flower"],
  Tropical: ["flower", "leaf"],
  Alpine: ["leaf", "bark_stem"],
  Subterranean: ["root", "bark_stem"],
  Coastal: ["leaf", "flower"],
  Temperate: ["leaf", "flower"],
};

export const CLIMATE_LIGHT_BIAS = {
  Tundra: [0, 3, 5],
  Arid: [2, 4, 6],
  Wetland: [1, 5, 7],
  Tropical: [0, 4, 6],
  Alpine: [0, 1, 3],
  Subterranean: [3, 4, 7],
  Coastal: [1, 5, 6],
  Temperate: [0, 1, 5],
};

export const CLIMATE_ADAPT_BIAS = {
  Tundra: [6, 7],
  Arid: [3, 4],
  Wetland: [1, 5],
  Tropical: [0, 2, 4],
  Alpine: [6, 7],
  Subterranean: [0, 1, 4],
  Coastal: [1, 3],
  Temperate: [2, 5, 7],
};

function buildClimateColourEntry(profile = {}, climate = "Temperate", rng = Math.random) {
  const profileColour = String(profile?.biology?.Coloration || profile?.biology?.["Part Colour Summary"] || "").trim();
  if (profileColour) {
    return profileColour;
  }

  const preferredParts = CLIMATE_COLOUR_PART_BIAS[climate] || ["leaf", "flower"];
  const huePart = pick(preferredParts, rng);
  const accentPart = preferredParts[1] || huePart;
  const hue = composeHue(rng, huePart);
  const accent = composeAccent(rng, accentPart);
  return `${hue} with ${accent} accents`;
}

export function deriveFloraVisualCues(profile = {}, rng = Math.random) {
  const validClimates = Object.keys(CLIMATE_TEXTURE_BIAS);
  const explicit = profile?.biology?.Climate || profile?.climate;
  const climate = explicit ? String(explicit) : validClimates[Math.floor(rng() * validClimates.length)];
  const clime = validClimates.includes(climate) ? climate : "Temperate";

  const textureEntry = pickBiased(SURFACE_TEXTURE, CLIMATE_TEXTURE_BIAS[clime], rng);
  const colourEntry = buildClimateColourEntry(profile, clime, rng);
  const lightEntry = pickBiased(LIGHTING_MOOD, CLIMATE_LIGHT_BIAS[clime], rng);
  const adaptEntry = pickBiased(FLORA_ADAPTATION, CLIMATE_ADAPT_BIAS[clime], rng);

  return {
    climaticTexture: `${textureEntry}, preferring ${lightEntry} conditions`,
    climaticAdaptation: `${colourEntry} coloration with ${adaptEntry}`,
    climate: clime,
  };
}

export function buildFloraImagePrompt({
  name = "Generated Flora",
  biology = {},
  ecology = {},
  adaptations = [],
  uses = {},
  sourceWorld = null,
  rng = Math.random,
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
  const hueDescriptor = String(biology?.Hue || biology?.["Hue Descriptor"] || "").trim();
  const hueMeaning = String(biology?.["Hue Meaning"] || "").trim();
  const hueExamples = Array.isArray(biology?.["Hue Example Hues"]) ? biology["Hue Example Hues"] : [];
  const accentDescriptor = String(biology?.Accent || biology?.["Accent Descriptor"] || "").trim();
  const effectDescriptor = String(biology?.Effect || biology?.["Effect Descriptor"] || "").trim();
  const effectMeaning = String(biology?.["Effect Meaning"] || "").trim();

  const bloomShape = pick(BLOOM_SHAPES, rng);
  const surfaceTexture = pick(SURFACE_TEXTURES, rng);
  const lightingMood = pick(LIGHTING_MOODS, rng);
  const { climaticTexture, climaticAdaptation } = deriveFloraVisualCues({ biology }, rng);
  const hueLine = hueDescriptor
    ? `${hueDescriptor}${
        [hueMeaning, hueExamples.length ? `examples: ${hueExamples.join(", ")}` : ""].filter(Boolean).join("; ")
          ? ` (${[hueMeaning, hueExamples.length ? `examples: ${hueExamples.join(", ")}` : ""].filter(Boolean).join("; ")})`
          : ""
      }`
    : generateColourHueDescriptor({ rng }).hueDescriptor;
  const accentLine = accentDescriptor
    ? `${accentDescriptor}`
    : generateColourAccentDescriptor({ rng }).accentDescriptor;
  const effectLine = effectDescriptor
    ? `${effectDescriptor}${effectMeaning ? ` (${effectMeaning})` : ""}`
    : generateColourEffectDescriptor({ rng }).effectDescriptor;

  const visualDescription = `${name} appears as a ${climate} ${growthForm.toLowerCase()} roughly ${height} tall, with ${canopy}, ${coloration}, ${hueLine}, ${accentLine}, and ${effectLine}. Its ${climaticTexture} reflect ${climaticAdaptation}. Most notable traits include ${featureList}.`;
  const imagePrompt = `Detailed botanical concept art of ${name}, an alien ${growthForm.toLowerCase()} on ${worldName}, ${height} tall, ${canopy}, ${coloration}, ${hueLine}, ${accentLine}, ${effectLine}, ${climaticTexture}, adapted for ${climate} conditions — ${climaticAdaptation}, growing from ${soil}, hints of ${featureList}, ${lightingMood}, highly detailed.`;

  return { visualDescription, imagePrompt, imageCaption: `${name} — ${primaryUse} specimen from ${worldName}` };
}

export function generateFloraProfile(options = {}) {
  const {
    seed = "",
    name = "Generated Flora",
    nameSeed = "",
    growthForm = "random",
    climate = "random",
    sourceWorld = null,
    additionalAdaptations = [],
    rootNetworkMode = "compact",
    waterStrategyMode = "compact",
  } = options;
  const resolvedSeed = String(seed || "").trim() || generateGuidSeed("flora");
  const resolvedNameSeed = String(nameSeed || "").trim() || resolvedSeed;
  const rng = createSeededRng(resolvedSeed);
  const subtypeBias = resolveFloraSubtypeBias(sourceWorld || {});
  const resolvedName =
    !String(name || "").trim() || name === "Generated Flora" ? randomFloraName(resolvedNameSeed) : String(name).trim();
  const resolvedClimate = climate === "random" ? subtypeBias.climate || pick(FLORA_CLIMATES, rng) : climate;
  const growthFormResult =
    growthForm === "random" ? recommendGrowthForm(resolvedClimate, rng, sourceWorld || {}) : null;
  const resolvedGrowthForm =
    growthForm === "random" ? growthFormResult?.recommendedForm || growthFormResult?.growthForm || "" : growthForm;
  const adaptationPool = uniqueEntries([
    ...(subtypeBias.adaptations || []),
    ...FLORA_ADAPTATIONS,
    ...(Array.isArray(additionalAdaptations) ? additionalAdaptations : []),
  ]);
  const primaryUsePool = uniqueEntries([...(subtypeBias.uses || []), ...PRIMARY_USES]);
  const adaptationList = shuffle(adaptationPool, rng).slice(0, 3);
  const hazardPool =
    subtypeBias.climate === "Arid" || subtypeBias.climate === "Tundra"
      ? ["Moderate", "Elevated", "High"]
      : HAZARD_LEVELS;
  const hazardLevel = pick(hazardPool, rng);
  const primaryUse = pick(primaryUsePool, rng);
  const climateBand = describeClimateBand(resolvedClimate);
  const hueDescriptor = generateColourHueDescriptor({ rng });
  const accentDescriptor = generateColourAccentDescriptor({ rng });
  const effectDescriptor = generateColourEffectDescriptor({ rng });
  const partColourProfile = generatePlantColourProfile(resolvedSeed);
  const partColourSummary = buildFloraColourSummary(partColourProfile);
  const leafColour = partColourProfile?.leaf || {};
  const flowerColour = partColourProfile?.flower || {};
  const partDrivenColoration = [leafColour.hue, flowerColour.accent].filter(Boolean).join(", ");

  const biology = {
    "Growth Form": resolvedGrowthForm,
    Climate: resolvedClimate,
    Height: `${1 + Math.floor(rng() * 18)} m`,
    Canopy: pick(
      ["dense layered crown", "umbrella spread", "spiral fronds", "low clustered pads", "ribboned tendrils"],
      rng,
    ),
    Hue: hueDescriptor.hueDescriptor,
    "Hue Meaning": hueDescriptor.hueMeaning,
    "Hue Colour": hueDescriptor.hueColour,
    "Hue Suffix Meaning": hueDescriptor.hueSuffixMeaning,
    "Hue Example Hues": hueDescriptor.hueExampleHues,
    Accent: accentDescriptor.accentDescriptor,
    "Accent Summary": accentDescriptor.accentSummary,
    Effect: effectDescriptor.effectDescriptor,
    "Effect Meaning": effectDescriptor.effectPrefixMeaning,
    "Effect Suffix Meaning": effectDescriptor.effectSuffixMeaning,
    "Part Colour Summary": partColourSummary,
    Coloration: partDrivenColoration || pick(COLOURWAYS, rng),
    Reproduction: pick(REPRODUCTION_STRATEGIES, rng),
  };
  const ecology = {
    "Root Network": generateFloraRootNetwork({ mode: rootNetworkMode, rng }),
    "Water Strategy": generateFloraWaterStrategy({
      mode: waterStrategyMode,
      rng,
      climate: subtypeBias.climate || resolvedClimate,
    }),
    "Soil Preference": pick(
      uniqueEntries([
        ...(subtypeBias.climate === "Tundra" ? ["iron-rich clay", "limestone shelves"] : []),
        ...(subtypeBias.climate === "Arid" ? ["alkaline dune crust", "volcanic loam"] : []),
        ...SOIL_PREFERENCES,
      ]),
      rng,
    ),
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
    name: resolvedName,
    biology,
    ecology,
    adaptations: adaptationList,
    uses,
    sourceWorld,
    rng,
  });
  const taxonomy = buildLifeTaxonomy({
    seed: resolvedSeed,
    name: resolvedName,
    category: "flora",
    growthForm: resolvedGrowthForm,
    climate: resolvedClimate,
    environment: resolvedClimate,
  });
  const lineage = buildLineageProfile({
    seed: resolvedSeed,
    category: "flora",
    sourceWorld,
    environment: resolvedClimate,
  });

  return {
    id: String(options.id || resolvedSeed),
    name: resolvedName,
    icon: pick(ICONS, rng),
    summary: `${resolvedName} is ${subtypeBias.tagline || generateTagline({ rng })}.`,
    biology,
    ecology,
    uses,
    adaptations: adaptationList,
    colourProfile: partColourProfile,
    hooks: [
      `Local traders value it for ${primaryUse}.`,
      `Field teams report ${adaptationList[0] || "resilient growth"} in the wild.`,
      `${resolvedGrowthForm} colonies thrive through ${String(resolvedClimate || "variable").toLowerCase()} cycles.`,
      subtypeBias.tagline ? `Researchers describe it as ${subtypeBias.tagline}.` : null,
    ].filter(Boolean),
    visualDescription,
    imagePrompt,
    imageCaption,
    taxonomy,
    lineage,
    origin: lineage.originModel,
    sourceWorld,
    worldIntegration: {
      summary: `${resolvedName} is a ${String(resolvedClimate).toLowerCase()} ${String(resolvedGrowthForm).toLowerCase()} known for ${String(primaryUse).toLowerCase()}.`,
      notes: [
        `Hazard rating holds at ${hazardLevel.toLowerCase()}.`,
        `Typical adaptation profile includes ${adaptationList.join(", ")}.`,
        lineage.uniquenessStatement,
      ],
    },
    seed: resolvedSeed,
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
      scientificName: String(record?.taxonomy?.["Scientific Name"] || "Unclassified flora"),
      originModel: String(record?.lineage?.originModel || record?.origin || "Unknown lineage"),
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

function pickFloraNamePart(category, rng = Math.random) {
  return pick(FLORA_NAME_SOURCE_MAP[category] || NAME_FLORA_THING, rng);
}

function buildNestedFloraName(rng = Math.random, depth = 0) {
  const safeDepth = Number(depth) || 0;
  const patternRoll = Math.floor(rng() * 22) + 1;
  const nestedRoll = safeDepth >= 1 && (patternRoll === 10 || patternRoll === 21) ? 1 : patternRoll;

  switch (nestedRoll) {
    case 1:
      return `${pickFloraNamePart("Creature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 2:
      return `${pickFloraNamePart("Creature", rng)}s ${pickFloraNamePart("Modifier", rng)}`;
    case 3:
      return `${pickFloraNamePart("Creature", rng)}s ${pickFloraNamePart("Modifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 4:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 5:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)}`;
    case 6:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Modifier", rng)}`;
    case 7:
      return `${pickFloraNamePart("Creature", rng)}'s ${pickFloraNamePart("Descriptor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 8:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Creature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 9:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)} ${pickFloraNamePart("Modifier", rng)}`;
    case 10:
      return `${pickFloraNamePart("Descriptor", rng)} ${buildNestedFloraName(rng, safeDepth + 1)}`;
    case 11:
      return `${pickFloraNamePart("Tree", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 12:
      return `${pickFloraNamePart("Grass", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 13:
      return `${pickFloraNamePart("Signifier", rng)}s ${pickFloraNamePart("Modifier", rng)}`;
    case 14:
      return `${pickFloraNamePart("Signifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 15:
      return `${pickFloraNamePart("Descriptor", rng)}-${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 16:
      return `${pickFloraNamePart("Descriptor", rng)} ${pickFloraNamePart("Modifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 17:
      return `${pickFloraNamePart("Region Feature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 18:
      return `${pickFloraNamePart("Region Metaphor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 19:
      return `${pickFloraNamePart("Region Descriptor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 20:
      return `${pickFloraNamePart("Region Concept", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 21:
      return `${pickFloraNamePart("Signifier", rng)}'s ${buildNestedFloraName(rng, safeDepth + 1)}`;
    case 22:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Tree", rng)}`;
    default:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
  }
}

export function randomFloraName(seed = "") {
  const rng = createSeededRng(String(seed || "").trim() || generateGuidSeed("flora-name"));
  return buildNestedFloraName(rng).replace(/\s+/g, " ").trim();
}

// ═══════════════════════════════════════════════════════════════════
// ECOLOGY TABLES — Prefix/Suffix arrays for granular generation
// ═══════════════════════════════════════════════════════════════════

const d = (n) => Math.floor(Math.random() * n);

// --- ROOT NETWORKS ---
const ROOT_ARCH_PREFIX = [
  "spiral ",
  "fractal ",
  "candelabra ",
  "reticulated ",
  "radial ",
  "pillar ",
  "helical ",
  "taproot ",
  "plate-like ",
  "knot ",
  "weeping ",
  "sinker ",
];
const ROOT_ARCH_SUFFIX = [
  "tendril",
  "dendritic",
  "fork",
  "mesh",
  "fan-out",
  "buttress",
  "bore",
  "lance",
  "skirt",
  "plexus",
  "cascade",
  "cable",
];

const ROOT_SUB_PREFIX = [
  "volcanic ",
  "limestone ",
  "compacted ",
  "peat bog ",
  "sandstone ",
  "permafrost ",
  "serpentine ",
  "riverbed ",
  "loess ",
  "coral ",
];
const ROOT_SUB_SUFFIX = ["tuff", "karst", "claypan", "slurry", "fissure", "wedge", "scree", "gravel", "silt", "rubble"];

const ROOT_STRAT_PREFIX = [
  "allelopathic ",
  "mycorrhizal ",
  "scavenger ",
  "anchor ",
  "water ",
  "oxygen ",
  "mineral ",
  "rhizome ",
  "drought ",
  "stress-graft ",
];
const ROOT_STRAT_SUFFIX = [
  "ring",
  "relay",
  "sprawl",
  "grapple",
  "piracy",
  "shunt",
  "mining",
  "guerrilla",
  "escape",
  "fusion",
];

const ROOT_TISSUE_PREFIX = [
  "crystal-laced ",
  "aerenchymous ",
  "lignified ",
  "succulent-swollen ",
  "fibrous-wiry ",
  "gelatinous-coated ",
  "iron-encrusted ",
  "hollow-reed ",
  "cork-armored ",
  "resin-impregnated ",
];
const ROOT_TISSUE_SUFFIX = ["sheath", "cortex", "husk", "flesh", "tissue", "rind", "scales", "canal", "shell", "pith"];

// --- SOIL PREFERENCES ---
const SOIL_TYPE_PREFIX = [
  "volcanic ",
  "alkaline dune ",
  "peat-rich bog ",
  "limestone ",
  "iron-rich ",
  "orbital hydroponic ",
  "silica sand ",
  "gypsum crust ",
  "serpentine ",
  "caliche ",
  "basalt scree ",
  "anoxic ",
];
const SOIL_TYPE_SUFFIX = [
  "loam",
  "crust",
  "beds",
  "shelves",
  "clay",
  "trays",
  "sheet",
  "pan",
  "barren",
  "hardpan",
  "field",
  "mudflat",
];

const SOIL_TRAIT_PREFIX = [
  "highly ",
  "salt-",
  "poorly ",
  "heavy-metal ",
  "rapidly ",
  "thermally ",
  "compressed ",
  "microbe-",
  "carbon-",
  "radiolarian-",
];
const SOIL_TRAIT_SUFFIX = [
  "acidic",
  "saturated",
  "drained",
  "laced",
  "leaching",
  "vented",
  "anoxic",
  "depleted",
  "dense",
  "rich",
];

const SOIL_COL_PREFIX = [
  "pioneer moss ",
  "cyanobacterial ",
  "fungal hyphae ",
  "lichen ",
  "root exudate ",
  "burrowing ",
  "rhizobium ",
  "actinorhizal ",
  "dark septate ",
  "mycorrhizal ",
];
const SOIL_COL_SUFFIX = [
  "crust",
  "mat",
  "lattice",
  "shield",
  "seal",
  "detritivore",
  "nodule",
  "cluster",
  "endophyte",
  "bridge",
];

// --- WATER STRATEGIES ---
const WATER_SOURCE_PREFIX = [
  "fog ",
  "dew ",
  "rain ",
  "ground ",
  "flood ",
  "snowmelt ",
  "cloud ",
  "hygroscopic ",
  "stemflow ",
  "overland sheet ",
];
const WATER_SOURCE_SUFFIX = [
  "drip",
  "film",
  "pulse",
  "seep",
  "surge",
  "trickle",
  "interception",
  "harvest",
  "funnel",
  "flow",
];

const WATER_MECH_PREFIX = [
  "capillary ",
  "pressure ",
  "suction ",
  "gravitational ",
  "vapor ",
  "guttation ",
  "pneumatic ",
  "tension ",
  "wax-channel ",
  "hydraulic ",
];
const WATER_MECH_SUFFIX = [
  "wicking",
  "osmosis",
  "draw",
  "drain",
  "sorption",
  "pump",
  "lift",
  "conduit",
  "channeling",
  "redistribution",
];

const WATER_STORE_PREFIX = [
  "trunk ",
  "bulb ",
  "air-root ",
  "leaf-bract ",
  "xylem ",
  "cortex ",
  "pith ",
  "surface ",
  "subterranean ",
  "cuticular wax ",
];
const WATER_STORE_SUFFIX = [
  "cistern",
  "reservoir",
  "bladder",
  "cupping",
  "tank",
  "sponge",
  "well",
  "film",
  "cistern",
  "seal",
];

// --- REPRODUCTION STRATEGIES ---
const REPRO_DISPERSAL_PREFIX = [
  "pressure-launched ",
  "wind-borne ",
  "runner ",
  "pollinator ",
  "bulb ",
  "tidal water ",
  "explosive ",
  "animal gut ",
  "floating seed ",
  "ballistic ",
  "self-burying ",
  "fragmentation ",
];
const REPRO_DISPERSAL_SUFFIX = [
  "seed pods",
  "spores",
  "shoots",
  "delivery",
  "splitting",
  "carry",
  "dehiscence",
  "passage",
  "capsule",
  "catapult",
  "burr",
  "drift",
];

const REPRO_TIME_PREFIX = [
  "post-fire ",
  "seasonal ",
  "flood-",
  "after-rain ",
  "lunar ",
  "temperature ",
  "herbivory ",
  "age-maturation ",
  "stress-induced ",
  "continuous ",
];
const REPRO_TIME_SUFFIX = [
  "pulse",
  "photoperiod",
  "triggered",
  "urgency",
  "tidal sync",
  "threshold",
  "response",
  "timer",
  "finale",
  "trickle",
];

const REPRO_ESTABLISH_PREFIX = [
  "nurse log ",
  "allelopathic ",
  "mycorrhizal ",
  "crack ",
  "first-mover ",
  "shade seedling ",
  "bare rock ",
  "wetland mudflat ",
  "deep shade ",
  "rhizome sentinel ",
];
const REPRO_ESTABLISH_SUFFIX = [
  "dependency",
  "clearing",
  "handshake",
  "colonization",
  "rush",
  "bank",
  "pioneer",
  "grip",
  "tolerance",
  "network",
];

// --- COLOURWAYS ---
const COLOUR_HUE_PREFIX = [
  "pale ",
  "light ",
  "soft ",
  "bright ",
  "deep ",
  "rich ",
  "muted ",
  "dusty ",
  "pastel ",
  "vivid ",
  "neon ",
  "electric ",
  "hot ",
  "cool ",
  "warm ",
  "dark ",
  "shadowy ",
  "milky ",
  "creamy ",
  "smoky ",
  "bleached ",
  "washed ",
  "dirty ",
  "clear ",
  "sheer ",
];
const COLOUR_HUE_SUFFIX = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
  "pink",
  "purple",
  "gold",
  "silver",
  "bronze",
  "amber",
  "jade",
  "crimson",
  "black",
  "white",
  "ivory",
  "cream",
  "grey",
  "grey-brown",
  "beige",
  "transparent",
  "opal",
  "pearl",
];

const COLOUR_ACCENT_PREFIX = [
  "silver ",
  "black ",
  "jade ",
  "veined ",
  "frond ",
  "waxy leaf ",
  "gold dust ",
  "ivory ",
  "copper ",
  "pearl ",
  "rust ",
  "opal ",
];
const COLOUR_ACCENT_SUFFIX = [
  "sheen",
  "core",
  "fleck",
  "green",
  "margin",
  "trim",
  "edge",
  "vein",
  "band",
  "mottle",
  "stripe",
  "dot",
];

const COLOUR_EFFECT_PREFIX = [
  "iridescent ",
  "matte ",
  "glossy ",
  "translucent ",
  "velvet ",
  "powdery ",
  "metallic ",
  "bioluminescent ",
  "oily ",
  "frosted ",
];
const COLOUR_EFFECT_SUFFIX = [
  "shimmer",
  "finish",
  "gloss",
  "glow",
  "nap",
  "bloom",
  "luster",
  "pulse",
  "slick",
  "glaze",
];

// --- BLOOM SHAPE ---
const BLOOM_FORM_PREFIX = [
  "lantern-",
  "spiral ",
  "umbrella-",
  "glassy ",
  "ribbon-",
  "clustered ",
  "trumpet-",
  "chandelier ",
  "star-",
  "hollow ",
  "candelabra ",
  "hooded ",
];
const BLOOM_FORM_SUFFIX = [
  "blossoms",
  "pollen cones",
  "petals",
  "seed bells",
  "fronds",
  "bulb crowns",
  "hoods",
  "spike racemes",
  "capitulum",
  "tube flowers",
  "panicle",
  "spathe",
];

const BLOOM_TEXTURE_PREFIX = [
  "waxy ",
  "fleshy ",
  "paper-thin ",
  "succulent-thick ",
  "brittle glass-like ",
  "velvety ",
  "leathery ",
  "gelatinous ",
  "scaly ",
  "translucent membrane ",
];
const BLOOM_TEXTURE_SUFFIX = ["coating", "cuticle", "surface", "gloss", "sheen", "nap", "hide", "skin", "rind", "film"];

const BLOOM_PATTERN_PREFIX = [
  "radial ",
  "speckled ",
  "veined ",
  "fading ",
  "marbled ",
  "concentric ",
  "striped ",
  "pixellated ",
  "reticulated ",
  "spotted ",
];
const BLOOM_PATTERN_SUFFIX = [
  "striping",
  "dotting",
  "network",
  "gradient",
  "swirl",
  "rings",
  "banding",
  "tessellation",
  "netting",
  "leopard motif",
];

const BLOOM_TRIGGER_PREFIX = [
  "dawn ",
  "dusk ",
  "first ",
  "full ",
  "pollinator ",
  "humidity ",
  "touch ",
  "fire ",
  "flood ",
  "solar ",
];
const BLOOM_TRIGGER_SUFFIX = [
  "light",
  "temperature drop",
  "rain",
  "moon",
  "landing",
  "spike",
  "stimulus",
  "aftermath",
  "submergence",
  "zenith",
];

// --- SURFACE TEXTURE ---
const SURFACE_PRIMARY_PREFIX = [
  "velvet ",
  "waxy ",
  "fine crystalline ",
  "ribbed ",
  "translucent ",
  "braided ",
  "scabrous ",
  "gelatinous ",
  "smooth ",
  "pitted ",
  "hirsute ",
  "blistered ",
];
const SURFACE_PRIMARY_SUFFIX = [
  "leaf surfaces",
  "reflective skin",
  "fuzz",
  "bark plating",
  "petal membranes",
  "stem fibers",
  "cork ridges",
  "mucus coat",
  "epidermis",
  "cuticle",
  "trichome layer",
  "blister pack",
];

const SURFACE_FINISH_PREFIX = [
  "glossy ",
  "matte ",
  "frosted ",
  "iridescent ",
  "dull ",
  "satin ",
  "oily ",
  "powdery ",
  "metallic ",
  "chalky ",
];
const SURFACE_FINISH_SUFFIX = [
  "sheen",
  "finish",
  "glaze",
  "shimmer",
  "nap",
  "glow",
  "slick",
  "bloom",
  "luster",
  "residue",
];

const SURFACE_APPENDAGE_PREFIX = [
  "fine ",
  "coarse ",
  "bristly ",
  "soft ",
  "needle-sharp ",
  "gland-tipped ",
  "forkspine ",
  "scale ",
  "succulent ",
  "hair ",
];
const SURFACE_APPENDAGE_SUFFIX = [
  "trichomes",
  "spines",
  "prickles",
  "hairs",
  "awns",
  "glands",
  "barbs",
  "tufts",
  "papillae",
  "cilia",
];

// --- LIGHTING MOOD ---
const LIGHT_INTENSITY_PREFIX = [
  "soft ",
  "misty ",
  "high ",
  "glowing ",
  "cool ",
  "storm-lit ",
  "dappled ",
  "aurora-",
  "harsh ",
  "filtered ",
  "submerged ",
  "flickering ",
];
const LIGHT_INTENSITY_SUFFIX = [
  "dawn light",
  "wetland haze",
  "desert glare",
  "twilight ambience",
  "subterranean luminescence",
  "horizon light",
  "canopy shadow",
  "refracted glow",
  "midday blast",
  "cathedral beam",
  "aquatic dusk",
  "fire-cast flicker",
];

const LIGHT_TEMP_PREFIX = [
  "warm ",
  "cool ",
  "neutral ",
  "amber ",
  "blue ",
  "pink ",
  "green ",
  "white ",
  "red ",
  "violet ",
];
const LIGHT_TEMP_SUFFIX = ["gold", "silver", "white", "hue", "cast", "flush", "tinge", "bleach", "stain", "wash"];

const LIGHT_ATMOSPHERE_PREFIX = [
  "still ",
  "suspended ",
  "humid ",
  "dry ",
  "dust-",
  "smoke-",
  "mist-",
  "electrified ",
  "heavy ",
  "crystalline ",
];
const LIGHT_ATMOSPHERE_SUFFIX = [
  "air",
  "silence",
  "gloom",
  "heat shimmer",
  "veil",
  "haze",
  "laden stillness",
  "tension",
  "pressure",
  "clarity",
];

// --- FLORA ADAPTATION ---
const FLORA_ADAPT_PREFIX = [
  "bioluminescent ",
  "pressure-sealed ",
  "toxin-laced ",
  "mirror-leaf ",
  "electrostatic ",
  "night-breathing ",
  "ice-crystal ",
  "rapid wound ",
  "thermal ",
  "chemical ",
  "mimetic ",
  "magnetic ",
];
const FLORA_ADAPT_SUFFIX = [
  "bloom tips",
  "seed chambers",
  "sap",
  "heat deflection",
  "pollen nets",
  "stomata",
  "antifreeze tissues",
  "callusing",
  "shielding",
  "deterrent spray",
  "coloration",
  "alignment",
];

const FLORA_TRIGGER_PREFIX = [
  "predator ",
  "temperature ",
  "herbivore ",
  "water ",
  "light ",
  "touch ",
  "seasonal ",
  "pathogen ",
  "circadian ",
  "flood ",
];
const FLORA_TRIGGER_SUFFIX = [
  "detection",
  "threshold",
  "saliva",
  "stress",
  "intensity",
  "contact",
  "cycle",
  "signal",
  "rhythm",
  "submersion",
];

const FLORA_LOCATION_PREFIX = [
  "leaf ",
  "stem ",
  "root ",
  "flower ",
  "bark ",
  "seed ",
  "pollen ",
  "stomata ",
  "vascular ",
  "meristem ",
];
const FLORA_LOCATION_SUFFIX = [
  "surface",
  "cortex",
  "tip zone",
  "receptacle",
  "rind",
  "endosperm",
  "sacs",
  "pores",
  "bundles",
  "sheath",
];

// --- PRIMARY USE ---
const PRIMARY_USE_PREFIX = [
  "medicinal ",
  "textile ",
  "ceremonial ",
  "high-calorie ",
  "starship biofilter ",
  "structural ",
  "industrial ",
  "luxury perfume ",
  "psychoactive ",
  "fuel ",
  "water purification ",
  "armor ",
];
const PRIMARY_USE_SUFFIX = [
  "resin",
  "fiber",
  "incense",
  "foodstock",
  "substrate",
  "cane",
  "dye",
  "oil",
  "compound",
  "biomass",
  "filter",
  "plating",
];

const PRIMARY_YIELD_PREFIX = [
  "pressed ",
  "distilled ",
  "woven ",
  "cured ",
  "dried ",
  "fermented ",
  "powdered ",
  "extruded ",
  "tapped ",
  "sun-baked ",
];
const PRIMARY_YIELD_SUFFIX = ["pulp", "essence", "mat", "hide", "flakes", "paste", "dust", "filament", "sap", "brick"];

const PRIMARY_SOURCE_PREFIX = [
  "seed ",
  "leaf ",
  "bark ",
  "root ",
  "flower ",
  "stem ",
  "fruit ",
  "gum ",
  "pith ",
  "pod ",
];
const PRIMARY_SOURCE_SUFFIX = [
  "kernel",
  "blade",
  "shaving",
  "nodule",
  "petal",
  "fiber",
  "pulp",
  "exudate",
  "core",
  "husk",
];

// ═══════════════════════════════════════════════════════════════════
// ROLL FUNCTIONS — Individual category rolls
// ═══════════════════════════════════════════════════════════════════

function rollRootArch(rng = Math.random) {
  return `${ROOT_ARCH_PREFIX[Math.floor(rng() * ROOT_ARCH_PREFIX.length)].trim()} ${ROOT_ARCH_SUFFIX[Math.floor(rng() * ROOT_ARCH_SUFFIX.length)]}`;
}

function rollRootSub(rng = Math.random) {
  return `${ROOT_SUB_PREFIX[Math.floor(rng() * ROOT_SUB_PREFIX.length)].trim()} ${ROOT_SUB_SUFFIX[Math.floor(rng() * ROOT_SUB_SUFFIX.length)]}`;
}

function rollRootStrat(rng = Math.random) {
  return `${ROOT_STRAT_PREFIX[Math.floor(rng() * ROOT_STRAT_PREFIX.length)].trim()} ${ROOT_STRAT_SUFFIX[Math.floor(rng() * ROOT_STRAT_SUFFIX.length)]}`;
}

function rollRootTissue(rng = Math.random) {
  return `${ROOT_TISSUE_PREFIX[Math.floor(rng() * ROOT_TISSUE_PREFIX.length)].trim()} ${ROOT_TISSUE_SUFFIX[Math.floor(rng() * ROOT_TISSUE_SUFFIX.length)]}`;
}

function rollWaterSource(rng = Math.random) {
  return `${WATER_SOURCE_PREFIX[Math.floor(rng() * WATER_SOURCE_PREFIX.length)].trim()} ${WATER_SOURCE_SUFFIX[Math.floor(rng() * WATER_SOURCE_SUFFIX.length)]}`;
}

function rollWaterMech(rng = Math.random) {
  return `${WATER_MECH_PREFIX[Math.floor(rng() * WATER_MECH_PREFIX.length)].trim()} ${WATER_MECH_SUFFIX[Math.floor(rng() * WATER_MECH_SUFFIX.length)]}`;
}

function rollWaterStore(rng = Math.random) {
  return `${WATER_STORE_PREFIX[Math.floor(rng() * WATER_STORE_PREFIX.length)].trim()} ${WATER_STORE_SUFFIX[Math.floor(rng() * WATER_STORE_SUFFIX.length)]}`;
}

function rollSoilType(rng = Math.random) {
  return `${SOIL_TYPE_PREFIX[Math.floor(rng() * SOIL_TYPE_PREFIX.length)].trim()} ${SOIL_TYPE_SUFFIX[Math.floor(rng() * SOIL_TYPE_SUFFIX.length)]}`;
}

function rollSoilTrait(rng = Math.random) {
  return `${SOIL_TRAIT_PREFIX[Math.floor(rng() * SOIL_TRAIT_PREFIX.length)].trim()} ${SOIL_TRAIT_SUFFIX[Math.floor(rng() * SOIL_TRAIT_SUFFIX.length)]}`;
}

function rollSoilColonizer(rng = Math.random) {
  return `${SOIL_COL_PREFIX[Math.floor(rng() * SOIL_COL_PREFIX.length)].trim()} ${SOIL_COL_SUFFIX[Math.floor(rng() * SOIL_COL_SUFFIX.length)]}`;
}

// ═══════════════════════════════════════════════════════════════════
// COMPOUND GENERATORS — Multi-part ecology rolls
// ═══════════════════════════════════════════════════════════════════

export function generateEcologyProfile({ rng = Math.random } = {}) {
  const waterSource = rollWaterSource(rng);
  const waterMech = rollWaterMech(rng);
  const waterStore = rollWaterStore(rng);

  const soilType = rollSoilType(rng);
  const soilTrait = rollSoilTrait(rng);
  const soilCol = rollSoilColonizer(rng);

  const rootTissue = rollRootTissue(rng);
  const rootArch = rollRootArch(rng);
  const rootSub = rollRootSub(rng);
  const rootStrat = rollRootStrat(rng);

  return {
    soil: `${soilTrait} ${soilType}`,
    soilColonizer: soilCol,
    waterSource,
    waterMechanism: waterMech,
    waterStorage: waterStore,
    rootTissue,
    rootArchitecture: rootArch,
    rootSubstrate: rootSub,
    rootStrategy: rootStrat,
    waterStrategy: `${waterSource} with ${waterMech}`,
    waterFull: `${waterSource} → ${waterMech} → ${waterStore}`,
    rootProfile: `${rootTissue} ${rootArch} in ${rootSub}, strategy: ${rootStrat}`,
  };
}
